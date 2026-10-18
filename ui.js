import { categories } from './data/products.js';
import { getCategory, money, discount, categoryCount } from './data/catalog.js';

export const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const icon = (name, className = '') => `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
export const compareButton = (product, className = '') => product.comparison ? `<button class="compare-toggle ${className}" data-compare="${product.id}" aria-pressed="false" aria-label="Bandingkan ${escapeHTML(product.name)}">${icon('compare')}<span data-compare-label>Bandingkan</span><span class="compare-check" aria-hidden="true">${icon('check')}</span></button>` : '';

export function productCard(product, { sale = false, favorites = new Set() } = {}) {
  const favorite = favorites.has(product.id);
  const category = getCategory(product.category);
  return `<article class="product-card" data-card-id="${product.id}">
    <div class="product-image-wrap ${product.contain ? 'product-image-contain' : ''}" style="--product-bg:${category.color}">
      <a class="product-image-button" href="/produk/${product.id}" aria-label="Lihat detail ${escapeHTML(product.name)}"><img class="product-image" src="${product.image}" alt="${escapeHTML(product.name)}" data-product-image="${product.id}" loading="lazy" width="400" height="400"/></a>
      ${sale ? `<span class="product-badge discount">-${discount(product)}%</span>` : product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      <button class="favorite-toggle ${favorite ? 'is-favorite' : ''}" data-favorite="${product.id}" aria-label="${favorite ? 'Hapus dari' : 'Simpan ke'} favorit: ${escapeHTML(product.name)}" aria-pressed="${favorite}">${icon('heart')}</button>
      <button class="quick-add" data-add="${product.id}" aria-label="Tambah ${escapeHTML(product.name)} ke keranjang">${icon('plus')}</button>
    </div>
    <div class="product-meta"><div class="product-brand">${escapeHTML(product.brand)}</div><a class="product-name" href="/produk/${product.id}">${escapeHTML(product.name)}</a>
      <div class="product-price-row"><span class="product-price">${money(product.price)}</span><span class="product-old-price">${money(product.oldPrice)}</span></div>
      <div class="product-rating-row"><span class="product-rating">${icon('star')} ${product.rating.toFixed(1)}</span><span class="product-sold">${product.sold > 999 ? `${(product.sold / 1000).toFixed(1)}rb` : product.sold} terjual</span></div>
      <div class="product-location">${escapeHTML(product.location)}</div>
      ${compareButton(product)}
      ${sale ? `<div class="sale-progress"><span style="width:${product.progress || Math.min(88, 35 + discount(product))}%"></span></div><div class="sale-stock">Pilihan promo · Sisa ${product.stock}</div>` : ''}
    </div>
  </article>`;
}

export function categoryCard(category) {
  return `<a class="category-card" style="--category-bg:${category.color}" href="/kategori/${category.slug}"><span class="category-emoji" aria-hidden="true">${icon(category.symbol)}</span><strong>${category.label}</strong><small>${categoryCount(category)} produk pilihan</small></a>`;
}

export function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Beranda</a>${items.map((item) => `${icon('chevron')} ${item.href ? `<a href="${escapeHTML(item.href)}">${escapeHTML(item.label)}</a>` : `<span aria-current="page">${escapeHTML(item.label)}</span>`}`).join('')}</nav>`;
}

export function emptyState({ title = 'Belum ketemu yang cocok.', text = 'Coba kata kunci atau filter lain, ya.', href = '/produk', label = 'Jelajahi semua produk', symbol = 'search', primary = false } = {}) {
  const tag = primary ? 'h1' : 'h2';
  return `<div class="empty-state page-empty">${icon(symbol)}<${tag}>${title}</${tag}><p>${text}</p><a class="button button-primary" href="${href}">${label} ${icon('arrow')}</a></div>`;
}

export function cartItem(product, quantity) {
  return `<article class="cart-page-item" data-cart-item="${product.id}"><a class="cart-product-image" href="/produk/${product.id}"><img class="${product.contain ? 'contain' : ''}" src="${product.image}" alt="${escapeHTML(product.name)}" data-product-image="${product.id}"/></a><div class="cart-page-item-info"><span class="product-brand">${escapeHTML(product.brand)}</span><a href="/produk/${product.id}" class="cart-product-title">${escapeHTML(product.name)}</a><span class="product-location">${escapeHTML(product.location)}</span><button class="remove-item" data-remove="${product.id}">Hapus</button></div><div class="cart-page-item-price"><strong>${money(product.price * quantity)}</strong><small>${money(product.price)} / barang</small><div class="quantity-control"><button data-quantity="${product.id}" data-delta="-1" aria-label="Kurangi jumlah ${escapeHTML(product.name)}" ${quantity === 1 ? 'disabled' : ''}>${icon('minus')}</button><span>${quantity}</span><button data-quantity="${product.id}" data-delta="1" aria-label="Tambah jumlah ${escapeHTML(product.name)}" ${quantity >= Math.min(10, product.stock) ? 'disabled' : ''}>${icon('plus')}</button></div></div></article>`;
}

export function fallbackImage(product) {
  const category = categories.find((item) => item.name === product.category);
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="${category.color}"/><circle cx="300" cy="265" r="130" fill="#ffffff88"/><path d="M235 215h130v125H235zM275 220v-30a25 25 0 0 1 50 0v30" fill="none" stroke="#7b3dff" stroke-width="8"/><text x="300" y="455" font-family="sans-serif" font-size="20" fill="#1f1f24" text-anchor="middle">${escapeHTML(product.brand)}</text></svg>`)}`;
}
