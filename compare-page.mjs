import { comparisonGroups, formatComparisonValue } from './data/comparison.js';
import { money, getComparisonGroup, comparisonProducts, comparisonSelection, comparisonURL } from './data/catalog.js';
import { breadcrumb, escapeHTML, icon, productCard } from './ui.js';

function groupCards(active) {
  return `<nav class="comparison-groups" aria-label="Kelompok produk sejenis">${comparisonGroups.map((group) => `<a href="/bandingkan?grup=${group.id}" class="comparison-group ${group.id === active.id ? 'active' : ''}" ${group.id === active.id ? 'aria-current="true"' : ''}>${icon(group.symbol)}<span><strong>${group.label}</strong><small>${group.segment}</small></span>${icon('arrow')}</a>`).join('')}</nav>`;
}

function comparisonTable(selected, group) {
  const lowestPrice = Math.min(...selected.map((product) => product.price));
  const row = (label, values, { price = false, list = false, field = '' } = {}) => {
    const same = values.every((value) => JSON.stringify(value) === JSON.stringify(values[0]));
    return `<tr data-same="${same}"><th scope="row">${label}</th>${values.map((value, index) => `<td${field ? ` data-ava-field="${field}" data-ava-product="${selected[index].id}"` : ''}>${price ? `<strong class="comparison-price">${money(value)}</strong>${value === lowestPrice && !same ? '<span class="comparison-best-price">Harga terendah di pilihan ini</span>' : ''}` : list ? `<ul>${value.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : escapeHTML(value)}</td>`).join('')}</tr>`;
  };
  return `<div class="comparison-toolbar"><div><span class="section-kicker">LIHAT LEBIH JELAS</span><h2>${group.label}: ${selected.length} pilihan</h2></div><button class="comparison-share" data-archava-open data-archava-question="Bandingkan produk pilihan ini. Jelaskan kelebihan dan komprominya sesuai budget saya.">${icon('sparkle')} Tanya Ava</button><label class="difference-toggle"><input type="checkbox" id="differencesOnly"/> Hanya perbedaan</label><button class="clear-comparison toolbar-reset" data-compare-clear>Reset pilihan</button><button class="comparison-share" id="shareComparison">${icon('share')} Salin link</button></div><input id="comparisonShareFallback" class="comparison-share-input" type="text" readonly aria-label="Link perbandingan untuk disalin" hidden/><p class="comparison-scroll-hint">Geser tabel ke samping untuk melihat semua pilihan ${icon('arrow')}</p><div class="comparison-table-scroll" tabindex="0" role="region" aria-label="Tabel perbandingan ${group.label}"><table class="comparison-table"><caption class="sr-only">Harga, spesifikasi, kelebihan, dan kompromi ${selected.length} ${group.label.toLowerCase()}. Semua data merupakan contoh.</caption><thead><tr><th scope="col"><span class="comparison-table-label">PILIH YANG<br/>PAS BUATMU.</span><small>Satu kebutuhan,<br/>beberapa pilihan.</small></th>${selected.map((product) => `<th scope="col"><div class="comparison-product-header"><a href="/produk/${product.id}" class="comparison-product-photo"><img src="${product.image}" alt="${escapeHTML(product.name)}" class="${product.contain ? 'contain' : ''}" data-product-image="${product.id}"/></a><span class="product-brand">${escapeHTML(product.brand)}</span><a class="comparison-product-name" href="/produk/${product.id}">${escapeHTML(product.name)}</a><span class="comparison-positioning">${escapeHTML(product.comparison.positioning)}</span><a class="comparison-remove" href="${escapeHTML(comparisonURL(selected.filter((item) => item.id !== product.id).map((item) => item.id)))}" aria-label="Hapus ${escapeHTML(product.name)} dari perbandingan">${icon('close')} Hapus pilihan</a></div></th>`).join('')}</tr></thead><tbody>
    ${row('Harga contoh', selected.map((product) => product.price), { price: true, field: 'price' })}
    ${row('Merek', selected.map((product) => product.brand))}
    ${group.fields.map((field) => row(field.label, selected.map((product) => formatComparisonValue(product.comparison.attributes[field.key], field)), { field: field.key })).join('')}
    ${row('Cocok untuk', selected.map((product) => product.comparison.useCase))}
    ${row('Kelebihan skenario', selected.map((product) => product.comparison.strengths), { list: true })}
    ${row('Kompromi', selected.map((product) => product.comparison.tradeoffs), { list: true })}
    <tr class="comparison-actions"><th scope="row">Langkah berikutnya</th>${selected.map((product) => `<td><button class="button button-primary" data-add="${product.id}">${icon('bag')} Tambah ke keranjang</button><a href="/produk/${product.id}">Lihat detail ${icon('arrow')}</a></td>`).join('')}</tr>
  </tbody></table></div><p class="comparison-data-note">Harga dan spesifikasi merupakan data demo. Durasi baterai dan fitur merupakan ilustrasi; belum diverifikasi sebagai informasi pabrikan atau hasil pengujian.</p>`;
}

export function comparisonPage(params) {
  const requested = (params.get('produk') || '').slice(0, 1800).split(',').filter(Boolean);
  const selected = comparisonSelection(requested);
  const group = getComparisonGroup(selected[0] || params.get('grup')) || comparisonGroups[0];
  const peers = comparisonProducts(group.id);
  const ignored = new Set(requested).size > selected.length;
  const body = `<div class="container page-container comparison-page">${breadcrumb([{ label: 'Bandingkan produk' }])}<div class="page-heading-row"><div class="page-heading"><span class="section-kicker">SATU KEBUTUHAN, PILIHAN BERBEDA</span><h1>Biar pilihannya lebih jelas.</h1><p>Bandingkan 2–3 produk sejenis. Lihat harga, spesifikasi, dan komprominya sebelum menentukan pilihan.</p></div><span class="comparison-demo-tag">${icon('shield')} Data perbandingan demo</span></div>
    ${groupCards(group)}
    ${ignored ? '<div class="comparison-notice" role="status">Sebagian pilihan belum bisa ditampilkan. Perbandingan mendukung maksimal tiga produk dari kelompok yang sama.</div>' : ''}
    ${selected.length >= 2 ? comparisonTable(selected, group) : `<div class="comparison-intro"><span>${icon(group.symbol)}</span><div><h2>${group.label}</h2><p>${group.description}</p><small>${selected.length ? 'Satu produk dipilih. Tambahkan satu atau dua alternatif di bawah.' : 'Pilih produk di bawah, atau langsung lihat contoh perbandingannya.'}</small></div><a class="button button-primary" href="${escapeHTML(comparisonURL(peers.map((product) => product.id)))}">Bandingkan tiga pilihan ${icon('arrow')}</a></div>`}
    <section class="section comparison-picker"><div class="section-header"><div><span class="section-kicker">ALTERNATIF SEJENIS</span><h2>${selected.length >= 2 ? 'Atur pilihan perbandinganmu.' : 'Mulai dari tiga alternatif ini.'}</h2><p class="section-subtitle">${group.segment} · ${group.description}</p></div></div><div class="product-grid comparison-picker-grid">${peers.map((product) => productCard(product)).join('')}</div></section>
  </div>`;
  return { page: 'comparison', title: `Bandingkan ${group.label} — DOPAMINE`, body };
}
