import { readFile } from 'node:fs/promises';
import { products, categories } from './data/products.js';
import { getProduct, getCategory, money, discount, categoryCount, popularProducts, catalogOptions, filterProducts, paginate, pageURL, competitorsFor, comparisonURL } from './data/catalog.js';
import { icon, escapeHTML, productCard, categoryCard, breadcrumb, emptyState, compareButton } from './ui.js';
import { comparisonGroups, formatComparisonValue } from './data/comparison.js';
import { comparisonPage } from './compare-page.mjs';

const cards = (items, options) => items.map((product) => productCard(product, options)).join('');
const heading = (title, subtitle = '', kicker = 'RUANG BELANJA PILIHANMU') => `<div class="page-heading"><span class="section-kicker">${kicker}</span><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ''}</div>`;
const hiddenFields = (params, exclude = []) => [...params.entries()].filter(([key]) => !exclude.includes(key) && key !== 'page').map(([key, value]) => `<input type="hidden" name="${escapeHTML(key)}" value="${escapeHTML(value)}"/>`).join('');

function pagination(path, params, data) {
  if (data.totalPages <= 1) return '';
  const visible = [...new Set([1, data.page - 1, data.page, data.page + 1, data.totalPages])].filter((page) => page >= 1 && page <= data.totalPages).sort((a, b) => a - b);
  let previous = 0;
  const links = visible.map((page) => {
    const gap = previous && page - previous > 1 ? '<span class="pagination-gap">…</span>' : '';
    previous = page;
    return `${gap}<a class="page-number ${page === data.page ? 'active' : ''}" ${page === data.page ? 'aria-current="page"' : ''} href="${pageURL(path, params, { page })}">${page}</a>`;
  }).join('');
  return `<nav class="pagination" aria-label="Halaman katalog">${data.page > 1 ? `<a class="pagination-direction" href="${pageURL(path, params, { page: data.page - 1 })}" aria-label="Halaman sebelumnya">${icon('arrow', 'reverse')} <span>Sebelumnya</span></a>` : '<span></span>'}<div>${links}</div>${data.page < data.totalPages ? `<a class="pagination-direction" href="${pageURL(path, params, { page: data.page + 1 })}" aria-label="Halaman berikutnya"><span>Berikutnya</span> ${icon('arrow')}</a>` : '<span></span>'}</nav>`;
}

function catalogPage(path, params, category = null, promo = false) {
  const options = catalogOptions(params, category, promo);
  const results = filterProducts(options);
  const data = paginate(results, options.page);
  const title = options.query ? `Hasil untuk “${escapeHTML(options.query)}”` : category ? category.label : promo ? 'Harga seru, temuan baru.' : 'Banyak pilihan. Temukan yang pas.';
  const subtitle = options.query ? `${results.length} produk yang cocok dengan pencarianmu.` : category ? category.description : promo ? 'Kumpulan barang pilihan dengan potongan harga 20% atau lebih.' : `${products.length} barang pilihan untuk setiap sisi dirimu.`;
  const routeForCategory = (item) => pageURL(`/kategori/${item.slug}`, params);
  const chips = [];
  if (options.query) chips.push({ text: `“${options.query}”`, key: 'q' });
  if (options.min) chips.push({ text: `Mulai ${money(options.min)}`, key: 'min' });
  if (options.max) chips.push({ text: `Hingga ${money(options.max)}`, key: 'max' });
  if (options.rating) chips.push({ text: `Rating ${options.rating}+`, key: 'rating' });
  const body = `<div class="container page-container">
    ${breadcrumb(category ? [{ label: 'Kategori', href: '/kategori' }, { label: category.label }] : [{ label: promo ? 'Promo kilat' : 'Semua produk' }])}
    <div class="catalog-hero ${promo ? 'promo-catalog-hero' : ''}" ${category ? `style="background:${category.color}"` : ''}>${heading(title, subtitle, promo ? 'TEMUAN BAGUS, HARGA LEBIH RINGAN' : category ? 'JELAJAHI KATEGORI' : 'KOLEKSI KALA')}<div class="catalog-hero-art">${icon(category?.symbol || (promo ? 'sparkle' : 'bag'))}<span>${category ? categoryCount(category) : results.length}<small>produk pilihan</small></span></div></div>
    <div class="catalog-layout"><button class="button button-outline mobile-filter-toggle" id="mobileFilterToggle" aria-expanded="false" aria-controls="catalogSidebar">${icon('menu')} Filter produk</button>
      <aside class="catalog-sidebar" id="catalogSidebar" aria-label="Filter produk"><div class="sidebar-heading"><h2>Filter produk</h2><a href="${path}">Reset</a></div><div class="sidebar-group"><h3>Kategori</h3><a class="sidebar-category ${!category && !promo ? 'active' : ''}" href="${pageURL('/produk', params)}"><span>Semua produk</span><small>${products.length}</small></a>${categories.map((item) => `<a class="sidebar-category ${category?.slug === item.slug ? 'active' : ''}" href="${routeForCategory(item)}"><span>${item.label}</span><small>${categoryCount(item)}</small></a>`).join('')}</div>
      <form class="sidebar-group price-filter" action="${path}" method="get">${hiddenFields(params, ['min', 'max', 'rating'])}<h3>Rentang harga</h3><label for="minPrice">Harga minimum</label><div class="price-input"><span>Rp</span><input id="minPrice" name="min" type="number" min="0" step="1000" placeholder="0" value="${options.min || ''}"/></div><label for="maxPrice">Harga maksimum</label><div class="price-input"><span>Rp</span><input id="maxPrice" name="max" type="number" min="0" step="1000" placeholder="Tanpa batas" value="${options.max || ''}"/></div><h3 class="rating-filter-heading">Rating produk</h3><label class="rating-filter"><input type="checkbox" name="rating" value="4" ${options.rating ? 'checked' : ''}/> ${icon('star')} 4 ke atas</label><button class="button button-primary" type="submit">Terapkan filter</button></form><div class="sidebar-note">${icon('shield')}<p>Barang pilihan, lebih mudah ditemukan. Gunakan filter untuk mempersempit pencarianmu.</p></div></aside>
      <div class="catalog-main"><div class="catalog-toolbar"><p>${data.total ? `Menampilkan <strong>${data.offset + 1}–${Math.min(data.offset + 12, data.total)}</strong> dari ${data.total} produk` : '0 produk ditemukan'}</p><form class="catalog-control sort-form" method="get" action="${path}">${hiddenFields(params, ['sort'])}<label for="sortSelect">Urutkan:</label><select id="sortSelect" name="sort" data-auto-submit>${[['popular', 'Paling populer'], ['price-asc', 'Harga terendah'], ['price-desc', 'Harga tertinggi'], ['rating', 'Rating tertinggi'], ['newest', 'Temuan terbaru']].map(([value, label]) => `<option value="${value}" ${options.sort === value ? 'selected' : ''}>${label}</option>`).join('')}</select><button class="sr-only" type="submit">Urutkan produk</button></form></div>
      <div class="catalog-mobile-categories filter-row"><a class="filter-chip ${!category ? 'active' : ''}" href="${pageURL('/produk', params)}">Semua</a>${categories.map((item) => `<a class="filter-chip ${category?.slug === item.slug ? 'active' : ''}" href="${routeForCategory(item)}">${item.label}</a>`).join('')}</div>
      ${chips.length ? `<div class="applied-filters">${chips.map((chip) => `<a class="clear-filter" href="${pageURL(path, params, { [chip.key]: null })}">${escapeHTML(chip.text)} ${icon('close')}</a>`).join('')}<a class="reset-filters" href="${path}">Hapus semua</a></div>` : ''}
      ${data.total ? `<div class="product-grid catalog-grid" id="catalogGrid">${cards(data.items, { sale: promo })}</div>${pagination(path, params, data)}` : emptyState({ href: path })}
      </div>
    </div></div>`;
  return { body, page: 'catalog', title: category ? `${category.label} — KALA` : options.query ? `${options.query} — Pencarian KALA` : promo ? 'Promo Kilat — KALA' : 'Semua Produk — KALA' };
}

function categoryIndex() {
  return { page: 'categories', title: 'Semua Kategori — KALA', body: `<div class="container page-container">${breadcrumb([{ label: 'Kategori' }])}${heading('Ada ruang untuk setiap minat.', 'Mulai dari hal yang kamu suka. Jelajahi tujuh kategori, satu temuan bagus pada satu waktu.', 'JELAJAHI DUNIAMU')}<div class="category-overview-grid">${categories.map((category) => {
    const items = products.filter((product) => product.category === category.name).slice(0, 3);
    return `<a class="category-overview-card" href="/kategori/${category.slug}" style="--category-bg:${category.color}"><div class="category-overview-copy"><span class="category-overview-icon">${icon(category.symbol)}</span><small>${categoryCount(category)} PRODUK PILIHAN</small><h2>${category.label}</h2><p>${category.description}</p><span class="category-overview-link">Jelajahi kategori ${icon('arrow')}</span></div><div class="category-overview-images">${items.map((product, index) => `<img class="${product.contain ? 'contain' : ''} image-${index}" src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy" data-product-image="${product.id}"/>`).join('')}</div></a>`;
  }).join('')}</div><div class="page-discovery-banner"><span>Belum tahu mau cari apa?</span><h2>Mulai dari semua yang bagus.</h2><a class="button button-primary" href="/produk">Jelajahi ${products.length} produk ${icon('arrow')}</a></div></div>` };
}

function productPage(product) {
  const category = getCategory(product.category);
  const competitors = competitorsFor(product);
  const related = competitors.length ? competitors : products.filter((item) => item.category === product.category && item.id !== product.id).sort((a, b) => b.sold - a.sold).slice(0, 4);
  const comparisonAction = product.comparison ? `<div class="detail-comparison-action">${compareButton(product, 'detail-compare-toggle')}<a href="${escapeHTML(comparisonURL([product.id, ...competitors.map((item) => item.id)]))}">Lihat ${competitors.length} alternatif sejenis ${icon('arrow')}</a><small>Harga dan spesifikasi contoh untuk demo perbandingan.</small></div>` : '';
  const detailSpecs = [['Merek', product.brand, 'brand'], ['Kategori', category.label], ['Pilihan', product.specs.join(' · ')], ['Penjual', product.merchant], ['Lokasi', product.location], ...(product.comparison ? comparisonGroups.find((group) => group.id === product.comparison.group).fields.map((field) => [field.label, formatComparisonValue(product.comparison.attributes[field.key], field), field.key]) : [])];
  return { page: 'product', productId: product.id, title: `${product.name} — KALA`, description: product.description,
    body: `<div class="container page-container">${breadcrumb([{ label: category.label, href: `/kategori/${category.slug}` }, { label: product.name }])}<section class="product-detail-layout" data-ava-detail><div class="product-gallery"><div class="product-detail-image-wrap" style="background:${category.color}"><img id="detailImage" class="${product.contain ? 'contain' : ''}" src="${product.image}" alt="${escapeHTML(product.name)}" data-product-image="${product.id}" fetchpriority="high"/>${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}</div>${product.images.length > 1 ? `<div class="gallery-thumbnails">${product.images.map((image, index) => `<button class="gallery-thumbnail ${index === 0 ? 'active' : ''}" data-gallery-image="${image}" aria-label="Lihat foto ${index + 1}" aria-pressed="${index === 0}"><img src="${image}" alt="Sudut produk ${index + 1}" class="${product.contain ? 'contain' : ''}"/></button>`).join('')}</div>` : ''}<div class="product-photo-note">Foto dan informasi produk merupakan contoh untuk demo.</div></div>
    <div class="product-detail-info"><a class="detail-category" href="/kategori/${category.slug}">${category.label} ${icon('arrow')}</a><span class="product-brand">${escapeHTML(product.brand)}</span><h1>${escapeHTML(product.name)}</h1><div class="detail-rating">${icon('star')}<strong>${product.rating.toFixed(1)}</strong><span>Rating contoh</span><i></i><span>${new Intl.NumberFormat('id-ID').format(product.sold)} terjual</span></div><div class="detail-pricing" data-ava-field="price" data-ava-product="${product.id}"><strong>${money(product.price)}</strong><div><s>${money(product.oldPrice)}</s><span>Hemat ${discount(product)}%</span></div></div><p class="detail-description">${product.description}</p><div class="detail-spec-chips">${product.specs.map((spec) => `<span>${escapeHTML(spec)}</span>`).join('')}</div><div class="detail-merchant">${icon('shield')}<div><strong>${escapeHTML(product.merchant)}</strong><small>${escapeHTML(product.location)} · Stok contoh ${product.stock} barang</small></div></div><form id="productBuyForm" data-product="${product.id}" class="product-buy-form"><div class="product-quantity-row"><span>Jumlah</span><div class="quantity-control"><button type="button" data-detail-quantity="-1" aria-label="Kurangi jumlah" disabled>${icon('minus')}</button><input id="detailQuantity" type="number" min="1" max="${Math.min(10, product.stock)}" value="1" aria-label="Jumlah barang"/><button type="button" data-detail-quantity="1" aria-label="Tambah jumlah">${icon('plus')}</button></div><small>Maks. ${Math.min(10, product.stock)} barang</small></div><div class="product-buy-buttons"><button class="button button-primary" type="submit">${icon('bag')} Tambah ke keranjang</button><button class="button button-outline" type="button" id="buyNowButton">Beli sekarang ${icon('arrow')}</button></div></form><button class="detail-save-button" data-favorite="${product.id}" aria-pressed="false" aria-label="Simpan ${escapeHTML(product.name)} ke favorit">${icon('heart')} <span data-favorite-label>Simpan ke favorit</span></button>${comparisonAction}<button type="button" class="detail-save-button archava-product-button" data-archava-open data-archava-question="Apa kelebihan dan kompromi produk ini?">${icon('sparkle')} Tanya Archava tentang produk ini</button></div></section>
    <section class="product-information"><div class="product-tabs" role="tablist" aria-label="Informasi produk"><button id="tab-description" role="tab" aria-selected="true" aria-controls="panel-description" data-product-tab="description">Deskripsi</button><button id="tab-specifications" role="tab" aria-selected="false" aria-controls="panel-specifications" tabindex="-1" data-product-tab="specifications">Spesifikasi</button><button id="tab-delivery" role="tab" aria-selected="false" aria-controls="panel-delivery" tabindex="-1" data-product-tab="delivery">Pengiriman & demo</button></div><div id="panel-description" class="product-tab-panel" role="tabpanel" aria-labelledby="tab-description"><h2>Kenalan dengan temuanmu.</h2><p>${product.description}</p><p>${escapeHTML(product.name)} ada di koleksi ${category.label.toLowerCase()} KALA. Jelajahi rekomendasi di bawah untuk menemukan pilihan lain yang cocok dengan seleramu.</p></div><div id="panel-specifications" class="product-tab-panel" role="tabpanel" aria-labelledby="tab-specifications" hidden><h2>Detail produk</h2><dl class="specification-table">${detailSpecs.map(([label, value, field]) => `<div${field ? ` data-ava-field="${field}" data-ava-product="${product.id}"` : ''}><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl></div><div id="panel-delivery" class="product-tab-panel" role="tabpanel" aria-labelledby="tab-delivery" hidden><h2>Coba alur belanjanya.</h2><p>Tambahkan ke keranjang, atur jumlah, lalu buka checkout untuk melihat ringkasan pilihanmu. Pembayaran dan pengiriman belum aktif; pesanan demo tidak diproses sebagai transaksi.</p><a class="section-link" href="/bantuan">Baca panduan belanja ${icon('arrow')}</a></div></section>
    <section class="section related-section"><div class="section-header"><div><span class="section-kicker">${competitors.length ? 'SATU KEBUTUHAN, PILIHAN LAIN' : 'MASIH DALAM SELERAMU'}</span><h2>${competitors.length ? 'Alternatif yang bisa dibandingkan.' : 'Kamu mungkin juga suka.'}</h2></div><a class="section-link" href="/kategori/${category.slug}">Lihat kategori ${icon('arrow')}</a></div><div class="product-grid">${cards(related)}</div></section></div>` };
}

function favoritesPage() {
  return { page: 'favorites', title: 'Favorit — KALA', body: `<div class="container page-container">${breadcrumb([{ label: 'Favorit' }])}<div class="page-heading-row">${heading('Temuan yang kamu simpan.', 'Simpan dulu. Balik lagi saat waktunya pas.', 'FAVORITMU')}<span class="page-count" id="favoritesTotal">0 produk</span></div><div class="product-grid favorites-grid" id="favoritesGrid"></div><div id="favoritesEmpty">${emptyState({ title: 'Favoritmu masih punya banyak ruang.', text: 'Ketuk ikon hati pada produk yang kamu suka, lalu temukan lagi di halaman ini.', symbol: 'heart' })}</div><section class="section related-section"><div class="section-header"><div><span class="section-kicker">MULAI DARI SINI</span><h2>Temuan yang banyak disukai.</h2></div><a class="section-link" href="/produk">Lihat semua ${icon('arrow')}</a></div><div class="product-grid">${cards(popularProducts(4))}</div></section></div>` };
}

function cartPage() {
  return { page: 'cart', title: 'Keranjang — KALA', body: `<div class="container page-container">${breadcrumb([{ label: 'Keranjang' }])}<div class="page-heading-row">${heading('Pilihan bagus ada di sini.', 'Cek kembali temuanmu sebelum melanjutkan.', 'KERANJANG BELANJAMU')}<a class="section-link" href="/produk">Lanjut belanja ${icon('arrow')}</a></div><div id="cartPageContent"></div><section class="section related-section"><div class="section-header"><div><span class="section-kicker">SATU TEMUAN LAGI?</span><h2>Lengkapi pilihanmu.</h2></div></div><div class="product-grid">${cards(popularProducts(4))}</div></section></div>` };
}

function checkoutPage() {
  return { page: 'checkout', title: 'Checkout Demo — KALA', body: `<div class="container page-container">${breadcrumb([{ label: 'Keranjang', href: '/keranjang' }, { label: 'Checkout' }])}${heading('Satu langkah menuju pilihanmu.', 'Coba alur checkout dan lihat ringkasan pesanan.', 'CHECKOUT DEMO')}<div class="demo-info">${icon('shield')}<span>Ini simulasi belanja. Tidak ada pembayaran, pengiriman, atau pesanan yang diproses.</span></div><div id="checkoutPageContent"></div></div>` };
}

function accountPage() {
  return { page: 'account', title: 'Ruang Belanjamu — KALA', body: `<div class="container page-container">${breadcrumb([{ label: 'Ruang belanjamu' }])}${heading('Ruang kecil buat pilihanmu.', 'Temukan lagi barang yang kamu simpan dan lanjutkan belanja kapan saja.', 'SELAMAT DATANG DI KALA')}<div class="account-grid"><a class="account-card" href="/favorit">${icon('heart')}<span>Favorit tersimpan</span><strong id="accountFavoriteCount">0</strong><small>Jelajahi favoritmu ${icon('arrow')}</small></a><a class="account-card" href="/keranjang">${icon('bag')}<span>Barang di keranjang</span><strong id="accountCartCount">0</strong><small>Lihat pilihanmu ${icon('arrow')}</small></a><a class="account-card" href="/produk">${icon('sparkle')}<span>Produk untuk dijelajahi</span><strong>${products.length}</strong><small>Mulai temuan baru ${icon('arrow')}</small></a></div><div class="account-note"><h2>Belanja tanpa ribet.</h2><p>Favorit dan keranjang tersimpan di browser yang kamu gunakan. Fitur masuk dan daftar akun belum tersedia dalam demo ini.</p><a class="section-link" href="/bantuan">Butuh bantuan? ${icon('arrow')}</a></div></div>` };
}

function helpPage() {
  const questions = [
    ['Bagaimana cara menemukan produk?', 'Gunakan pencarian di bagian atas atau pilih kategori. Pada halaman katalog, kamu bisa mengatur rentang harga, rating, dan urutan produk. Setiap produk punya halaman detail sendiri.'],
    ['Bagaimana cara membandingkan produk?', 'Pilih tombol Bandingkan pada dua atau tiga produk dalam kelompok yang sama, lalu buka halaman perbandingan dari bar pilihan. Kamu bisa melihat spesifikasi, kelebihan, dan kompromi, menampilkan hanya perbedaannya, serta menyalin link untuk dibagikan. Semua data perbandingan merupakan skenario demo.'],
    ['Bagaimana cara menyimpan favorit?', 'Ketuk ikon hati pada produk. Pilihanmu akan muncul di halaman Favorit dan tetap tersimpan setelah halaman ditutup, selama data browser tidak dihapus.'],
    ['Apa yang bisa dilakukan di keranjang?', 'Kamu bisa mengatur jumlah barang, menghapus produk, dan melihat total harga. Keranjang yang sama tersedia di semua halaman KALA.'],
    ['Apakah checkout memproses transaksi?', 'Checkout saat ini berupa simulasi untuk mencoba alur belanja. Data penerima hanya digunakan untuk pratinjau di halaman; tidak dikirim ke penjual atau disimpan sebagai pesanan.'],
    ['Apakah produk, harga, dan rating merupakan data nyata?', 'Katalog memakai data dan foto contoh untuk demo antarmuka. Harga, stok, rating, dan jumlah terjual bukan penawaran atau informasi toko yang aktif.'],
    ['Apakah saya harus punya akun?', 'Kamu bisa mencoba pencarian, favorit, dan keranjang tanpa masuk. Layanan akun dan kontak pelanggan belum aktif.'],
  ];
  return { page: 'help', title: 'Pusat Bantuan — KALA', body: `<div class="container page-container help-page">${breadcrumb([{ label: 'Bantuan' }])}${heading('Biar belanja terasa mudah.', 'Panduan singkat untuk menjelajahi dan mencoba KALA.', 'PUSAT BANTUAN')}<div class="faq-list">${questions.map(([question, answer]) => `<details><summary>${question}${icon('plus')}</summary><p>${answer}</p></details>`).join('')}</div><div class="page-discovery-banner"><h2>Sudah siap menemukan favoritmu?</h2><a class="button button-primary" href="/produk">Jelajahi produk ${icon('arrow')}</a></div></div>` };
}

export async function renderPage(url) {
  const path = url.pathname.replace(/\/+$/, '') || '/';
  let result;
  if (path === '/' || path === '/index.html') {
    const home = await readFile(new URL('./templates/home.html', import.meta.url), 'utf8');
    result = { page: 'home', title: 'KALA — Temukan yang terasa lebih kamu', body: home.replace('{{CATEGORIES}}', categories.map(categoryCard).join('')).replace('{{FLASH_PRODUCTS}}', cards(products.slice(0, 4), { sale: true })).replace('{{HOME_PRODUCTS}}', cards(popularProducts(12))).replace('{{PRODUCT_COUNT}}', products.length).replace('{{COMPARE_GROUPS}}', comparisonGroups.map((group) => `<a class="home-comparison-group" href="${escapeHTML(comparisonURL(products.filter((product) => product.comparison?.group === group.id).map((product) => product.id)))}">${icon(group.symbol)}<span>${group.label}<small>3 pilihan sekelas</small></span>${icon('arrow')}</a>`).join('')) };
  } else if (path === '/bandingkan') result = comparisonPage(url.searchParams);
  else if (path === '/produk') result = catalogPage(path, url.searchParams);
  else if (path === '/promo') result = catalogPage(path, url.searchParams, null, true);
  else if (path === '/kategori') result = categoryIndex();
  else if (path.startsWith('/kategori/')) {
    const category = getCategory(path.slice('/kategori/'.length));
    if (category) result = catalogPage(path, url.searchParams, category);
  } else if (path.startsWith('/produk/')) {
    const product = getProduct(path.slice('/produk/'.length));
    if (product) result = productPage(product);
  } else if (path === '/favorit') result = favoritesPage();
  else if (path === '/keranjang') result = cartPage();
  else if (path === '/checkout') result = checkoutPage();
  else if (path === '/akun') result = accountPage();
  else if (path === '/bantuan') result = helpPage();
  if (!result) result = { status: 404, page: 'not-found', title: 'Halaman Tidak Ditemukan — KALA', body: `<div class="container page-container">${breadcrumb([{ label: 'Halaman tidak ditemukan' }])}${emptyState({ title: 'Sepertinya kita salah belok.', text: 'Halaman atau produk yang kamu cari belum ada. Yuk, kembali menjelajahi koleksi KALA.', href: '/', label: 'Kembali ke beranda', primary: true })}</div>` };
  const document = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const values = { TITLE: escapeHTML(result.title), DESCRIPTION: escapeHTML(result.description || `Jelajahi ${products.length} barang pilihan di KALA. Temukan, bandingkan, dan simpan setiap temuan.`), PAGE: result.page, PRODUCT_ID: result.productId || '', QUERY: escapeHTML(url.searchParams.get('q') || ''), BODY: result.body };
  return { status: result.status || 200, html: document.replace(/\{\{(TITLE|DESCRIPTION|PAGE|PRODUCT_ID|QUERY|BODY)\}\}/g, (_, key) => values[key]) };
}
