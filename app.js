import { products } from './data/products.js';
import { getProduct, money, getComparisonGroup, comparisonSelection, comparisonURL } from './data/catalog.js';
import { icon, escapeHTML, productCard, cartItem, emptyState, fallbackImage } from './ui.js';

const $ = (selector) => document.querySelector(selector);
let page = document.body.dataset.page;
function readStored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function loadCart() {
  const stored = readStored('kala-cart', []);
  if (!Array.isArray(stored)) return [];
  return stored.filter((item, index, list) => item && getProduct(item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && list.findIndex((other) => other?.id === item.id) === index).map((item) => ({ id: item.id, quantity: Math.min(item.quantity, 10, getProduct(item.id).stock) }));
}
function loadFavorites() {
  const stored = readStored('kala-favorites', []);
  return new Set(Array.isArray(stored) ? stored.filter((id) => getProduct(id)) : []);
}
function loadComparison() {
  return comparisonSelection(readStored('kala-compare', [])).map((product) => product.id);
}
const state = { cart: loadCart(), favorites: loadFavorites(), compare: loadComparison() };
let comparisonParams = new URLSearchParams(window.location.search);
let toastTimer;
let cartStorageAvailable = true;
function persist() {
  try {
    localStorage.setItem('kala-cart', JSON.stringify(state.cart));
    localStorage.setItem('kala-favorites', JSON.stringify([...state.favorites]));
    localStorage.setItem('kala-compare', JSON.stringify(state.compare));
    cartStorageAvailable = true;
  } catch { cartStorageAvailable = false; /* The current session remains usable without storage. */ }
}
function toast(message, link = false) {
  clearTimeout(toastTimer);
  $('#toast').innerHTML = `<span>${escapeHTML(message)}</span>${link ? '<a href="/keranjang">Lihat keranjang →</a>' : ''}`;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), link ? 5000 : 3500);
}
function totals() {
  return state.cart.reduce((total, item) => ({ quantity: total.quantity + item.quantity, price: total.price + getProduct(item.id).price * item.quantity }), { quantity: 0, price: 0 });
}
function syncFavorites() {
  document.querySelectorAll('[data-favorite]').forEach((button) => {
    const favorite = state.favorites.has(button.dataset.favorite);
    button.classList.toggle('is-favorite', favorite);
    button.setAttribute('aria-pressed', String(favorite));
    button.setAttribute('aria-label', `${favorite ? 'Hapus dari' : 'Simpan ke'} favorit: ${getProduct(button.dataset.favorite).name}`);
    const label = button.querySelector('[data-favorite-label]');
    if (label) label.textContent = favorite ? 'Tersimpan di favorit' : 'Simpan ke favorit';
  });
}
function updateShared() {
  const total = totals();
  $('#favoriteCount').textContent = state.favorites.size;
  $('#favoriteCount').hidden = !state.favorites.size;
  $('#cartCount').textContent = total.quantity;
  $('#cartCount').hidden = !total.quantity;
  $('#cartButton').setAttribute('aria-label', `Keranjang, ${total.quantity} barang`);
  $('#wishlistButton').setAttribute('aria-label', `Favorit, ${state.favorites.size} produk`);
  if ($('#accountFavoriteCount')) $('#accountFavoriteCount').textContent = state.favorites.size;
  if ($('#accountCartCount')) $('#accountCartCount').textContent = total.quantity;
  syncFavorites();
  renderComparisonSelection();
  window.dispatchEvent(new CustomEvent('kala:context-change'));
}
function renderComparisonSelection() {
  document.querySelectorAll('[data-compare]').forEach((button) => {
    const selected = state.compare.includes(button.dataset.compare);
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'Hapus dari perbandingan:' : 'Bandingkan'} ${getProduct(button.dataset.compare).name}`);
    button.querySelector('[data-compare-label]').textContent = selected ? 'Dipilih' : 'Bandingkan';
  });
  const tray = $('#comparisonTray');
  const focused = tray.contains(document.activeElement) ? document.activeElement : null;
  const focusedId = focused?.dataset.compareRemove;
  const items = state.compare.map(getProduct);
  const visible = items.length > 0 && !(page === 'comparison' && $('.comparison-table'));
  tray.hidden = !visible;
  document.body.classList.toggle('has-comparison-tray', visible);
  if (!visible) { tray.innerHTML = ''; return; }
  const group = getComparisonGroup(items[0]);
  tray.innerHTML = `<div class="comparison-tray-title">${icon('compare')}<div><strong>${escapeHTML(group.label)}</strong><small>${items.length}/3 pilihan ${items.length < 2 ? '· Tambah satu lagi' : '· Siap dibandingkan'}</small></div></div><div class="comparison-tray-products">${items.map((product) => `<div class="comparison-tray-product"><img src="${product.image}" class="${product.contain ? 'contain' : ''}" alt="${escapeHTML(product.name)}"/><span>${escapeHTML(product.brand)}</span><button data-compare-remove="${product.id}" aria-label="Hapus ${escapeHTML(product.name)} dari pilihan">${icon('close')}</button></div>`).join('')}</div><div class="comparison-tray-actions"><button class="clear-comparison" data-compare-clear>Kosongkan</button>${items.length >= 2 ? `<a class="button button-primary" id="openComparison" href="${escapeHTML(comparisonURL(state.compare))}">Bandingkan (${items.length}) ${icon('arrow')}</a>` : '<button class="button button-primary" id="openComparison" disabled>Pilih min. 2 produk</button>'}</div>`;
  if (focusedId) (tray.querySelector(`[data-compare-remove="${focusedId}"]`) || tray.querySelector('[data-compare-remove]'))?.focus({ preventScroll: true });
}
function toggleComparison(id) {
  const product = getProduct(id);
  if (!product?.comparison) return;
  if (state.compare.includes(id)) state.compare = state.compare.filter((item) => item !== id);
  else {
    if (state.compare.length && getProduct(state.compare[0]).comparison.group !== product.comparison.group) {
      toast(`Pilihanmu berisi ${getComparisonGroup(getProduct(state.compare[0])).label.toLowerCase()}. Kosongkan pilihan untuk beralih kelompok.`);
      return;
    }
    if (state.compare.length === 3) { toast('Maksimal tiga produk. Hapus satu pilihan untuk menggantinya.'); return; }
    state.compare.push(id);
  }
  persist(); updateShared();
  if (page === 'comparison' && comparisonParams.has('produk')) navigateTo(comparisonURL(state.compare));
}
function renderFavorites() {
  if (page !== 'favorites') return;
  const items = products.filter((product) => state.favorites.has(product.id));
  $('#favoritesGrid').innerHTML = items.map((product) => productCard(product, { favorites: state.favorites })).join('');
  $('#favoritesEmpty').hidden = items.length > 0;
  $('#favoritesTotal').textContent = `${items.length} produk`;
}
function shippingCost() {
  return $('input[name="shipping"]:checked')?.value === 'express' ? 30000 : totals().price >= 500000 ? 0 : 15000;
}
function summaryCard(total, checkout = false) {
  return `<aside class="shopping-summary"><span class="section-kicker">PILIHAN YANG PAS</span><h2>Ringkasan belanja</h2><div class="summary-line"><span>Subtotal (${total.quantity} barang)</span><strong>${money(total.price)}</strong></div><div class="summary-line shipping-summary"><span>Pengiriman</span><small>${checkout ? 'Simulasi' : 'Dihitung di checkout'}</small></div>${checkout ? `<div class="summary-line"><span>Ongkir contoh</span><strong id="checkoutShipping">${money(shippingCost())}</strong></div>` : ''}<div class="summary-total"><span>${checkout ? 'Total contoh' : 'Subtotal'}</span><strong ${checkout ? 'id="checkoutTotal"' : ''}>${money(total.price + (checkout ? shippingCost() : 0))}</strong></div>${checkout ? `<button class="button button-primary" type="submit" form="checkoutForm">Pratinjau pesanan demo ${icon('arrow')}</button><button class="button button-outline" type="button" data-checkout-sandbox>Checkout QRIS sandbox</button>` : `<a class="button button-primary" href="/checkout">Lanjut ke checkout ${icon('arrow')}</a>`}<a class="summary-continue" href="${checkout ? '/keranjang' : '/produk'}">${checkout ? 'Kembali ke keranjang' : 'Lanjut belanja'}</a><p class="summary-demo-note">${icon('shield')} Belanja demo. QRIS hanya lewat simulator sandbox; pembayaran nyata tidak tersedia.</p></aside>`;
}
function renderCart() {
  if (page !== 'cart') return;
  const total = totals();
  const focused = document.activeElement;
  const action = focused?.dataset.quantity ? { id: focused.dataset.quantity, delta: focused.dataset.delta } : null;
  $('#cartPageContent').innerHTML = state.cart.length ? `<div class="shopping-layout"><section class="cart-page-list"><div class="cart-page-toolbar"><h2>${total.quantity} barang pilihanmu</h2><span>${state.cart.length} produk</span></div>${state.cart.map((item) => cartItem(getProduct(item.id), item.quantity)).join('')}</section>${summaryCard(total)}</div>` : emptyState({ title: 'Keranjangmu masih punya ruang.', text: 'Tambahkan barang pilihanmu, lalu temukan semuanya di sini.', symbol: 'bag' });
  if (action) {
    const matching = $(`[data-quantity="${action.id}"][data-delta="${action.delta}"]`);
    const replacement = matching?.disabled ? $(`[data-quantity="${action.id}"][data-delta="${-Number(action.delta)}"]`) : matching;
    replacement?.focus({ preventScroll: true });
  }
}
function toggleFavorite(id) {
  const focusedIndex = [...document.querySelectorAll('#favoritesGrid [data-favorite]')].indexOf(document.activeElement);
  if (state.favorites.has(id)) { state.favorites.delete(id); toast('Produk dihapus dari favorit.'); }
  else { state.favorites.add(id); toast('Tersimpan! Temukan lagi di halaman Favorit.'); }
  persist(); renderFavorites(); updateShared();
  if (page === 'favorites' && focusedIndex >= 0) {
    const buttons = [...document.querySelectorAll('#favoritesGrid [data-favorite]')];
    (buttons[Math.min(focusedIndex, buttons.length - 1)] || $('#wishlistButton')).focus({ preventScroll: true });
  }
}
function addToCart(id, quantity = 1) {
  const product = getProduct(id);
  if (!product) return false;
  const existing = state.cart.find((item) => item.id === id);
  const limit = Math.min(10, product.stock);
  const available = limit - (existing?.quantity || 0);
  if (!available) { toast(`Maksimal ${limit} barang untuk produk ini.`); return false; }
  const count = Math.min(Math.max(1, Math.floor(quantity)), available);
  if (existing) existing.quantity += count;
  else state.cart.push({ id, quantity: count });
  persist(); renderCart(); updateShared();
  toast(`${count} ${product.name} masuk keranjang.`, true);
  return true;
}
// Public widget adapter: exact additions and conditional undo, never checkout data.
function synchronizeCart() {
  if (!cartStorageAvailable) return;
  try {
    if (localStorage.getItem('kala-cart') !== null) state.cart = loadCart();
  } catch { /* Keep the current in-memory cart when storage is unavailable. */ }
}
window.kalaCart = {
  read: () => { synchronizeCart(); return state.cart.map(item => ({ ...item })); },
  add: (id, quantity, expectedBefore) => {
    synchronizeCart();
    const product = getProduct(id);
    const item = state.cart.find(entry => entry.id === id);
    const before = item?.quantity || 0;
    if (!product || !Number.isInteger(quantity) || quantity < 1 || before !== expectedBefore || before + quantity > Math.min(10, product.stock)) return false;
    if (item) item.quantity += quantity;
    else state.cart.push({ id, quantity });
    persist(); renderCart(); refreshCheckoutCart(); updateShared();
    toast(`${quantity} ${product.name} masuk keranjang.`, true);
    return true;
  },
  undo: ({ productId, before, after }) => {
    synchronizeCart();
    const item = state.cart.find(entry => entry.id === productId);
    if (!item || item.quantity !== after || !Number.isInteger(before) || before < 0 || before >= after) return false;
    if (before) item.quantity = before;
    else state.cart = state.cart.filter(entry => entry.id !== productId);
    persist(); renderCart(); refreshCheckoutCart(); updateShared();
    toast('Penambahan oleh Ava dibatalkan.');
    return true;
  },
};
function detailQuantity() {
  const input = $('#detailQuantity');
  const quantity = Math.max(1, Math.min(Number(input.max), Math.floor(Number(input.value) || 1)));
  input.value = quantity;
  $('[data-detail-quantity="-1"]').disabled = quantity <= 1;
  $('[data-detail-quantity="1"]').disabled = quantity >= Number(input.max);
  return quantity;
}
function switchProductTab(name, focus = false) {
  document.querySelectorAll('[data-product-tab]').forEach((button) => {
    const active = button.dataset.productTab === name;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    $(`#panel-${button.dataset.productTab}`).hidden = !active;
    if (active && focus) button.focus();
  });
}
function renderCheckout() {
  if (page !== 'checkout') return;
  const total = totals();
  if (!state.cart.length) {
    $('#checkoutPageContent').innerHTML = emptyState({ title: 'Pilih barang dulu, yuk.', text: 'Tambahkan produk ke keranjang untuk mencoba checkout.', symbol: 'bag' });
    return;
  }
  $('#checkoutPageContent').innerHTML = `<div id="checkoutFormView" class="shopping-layout checkout-layout"><div class="checkout-main"><form id="checkoutForm" class="checkout-form"><div class="checkout-block"><div class="checkout-block-title"><span>01</span><h2>Informasi penerima</h2></div><p class="checkout-form-note">Isi data contoh untuk pratinjau pengiriman. Untuk menerima bukti simulasi, isi email di kartu checkout QRIS.</p><div class="checkout-field-grid"><label>Nama penerima<input name="recipient" autocomplete="off" placeholder="Nama penerima" required maxlength="80"/></label><label>Nomor telepon<input name="phone" type="tel" autocomplete="off" placeholder="Contoh: 081234567890" required pattern="[0-9+ ]{8,20}" maxlength="20"/></label><label class="full-width">Email contoh (pratinjau)<input name="email" type="email" autocomplete="off" placeholder="nama@example.com" required maxlength="120"/></label><label class="full-width">Alamat pengiriman<textarea name="address" placeholder="Nama jalan, nomor rumah, dan detail alamat" required maxlength="300" rows="3"></textarea></label><label>Kota<input name="city" autocomplete="off" placeholder="Contoh: Jakarta Selatan" required maxlength="80"/></label><label>Kode pos<input name="postal" inputmode="numeric" pattern="[0-9]{5}" placeholder="12345" required maxlength="5"/></label></div></div><fieldset class="checkout-block"><legend class="checkout-block-title"><span>02</span>Pengiriman contoh</legend><label class="shipping-option"><input type="radio" name="shipping" value="standard" checked/><span><strong>Reguler</strong><small>Simulasi 2–4 hari</small></span><b>${total.price >= 500000 ? 'Gratis*' : money(15000)}</b></label><label class="shipping-option"><input type="radio" name="shipping" value="express"/><span><strong>Express</strong><small>Simulasi 1–2 hari</small></span><b>${money(30000)}</b></label><small class="shipping-footnote">*Ongkir contoh gratis untuk subtotal Rp500.000 ke atas.</small></fieldset></form><div class="checkout-block checkout-products"><div class="checkout-block-title"><span>03</span><h2>Barang pilihanmu</h2></div>${state.cart.map((item) => { const product = getProduct(item.id); return `<div class="checkout-product"><img src="${product.image}" class="${product.contain ? 'contain' : ''}" alt="${escapeHTML(product.name)}" data-product-image="${product.id}"/><div><a href="/produk/${product.id}">${escapeHTML(product.name)}</a><small>${item.quantity} × ${money(product.price)}</small></div><strong>${money(product.price * item.quantity)}</strong></div>`; }).join('')}</div></div>${summaryCard(total, true)}</div><div id="checkoutConfirmation" hidden></div>`;
  $('#checkoutForm').addEventListener('change', (event) => {
    if (event.target.name === 'shipping') {
      $('#checkoutShipping').textContent = money(shippingCost());
      $('#checkoutTotal').textContent = money(totals().price + shippingCost());
    }
  });
  $('#checkoutForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.cart.length) { toast('Pilih barang sebelum melanjutkan pratinjau.'); return; }
    if (!event.currentTarget.reportValidity()) return;
    const fields = new FormData(event.currentTarget);
    $('#checkoutConfirmation').innerHTML = `<div class="checkout-confirmation">${icon('shield')}<span class="section-kicker">PRATINJAU PESANAN</span><h2>Pilihanmu sudah siap dilihat.</h2><p>Ini ringkasan demo. Tidak ada pesanan yang dibuat atau pembayaran yang ditagihkan.</p><div class="confirmation-address"><strong>${escapeHTML(fields.get('recipient'))}</strong><span>${escapeHTML(fields.get('address'))}</span><span>${escapeHTML(fields.get('city'))}, ${escapeHTML(fields.get('postal'))}</span><small>${escapeHTML(fields.get('phone'))} · ${escapeHTML(fields.get('email'))}</small></div><dl><div><dt>Barang</dt><dd>${totals().quantity} barang</dd></div><div><dt>Subtotal</dt><dd>${money(totals().price)}</dd></div><div><dt>Ongkir contoh</dt><dd>${money(shippingCost())}</dd></div><div><dt>Total contoh</dt><dd><strong>${money(totals().price + shippingCost())}</strong></dd></div></dl><div class="confirmation-actions"><a class="button button-primary" href="/produk">Lanjut jelajah ${icon('arrow')}</a><button class="button button-outline" data-checkout-back>Kembali ke form</button></div></div>`;
    $('#checkoutFormView').hidden = true;
    $('#checkoutConfirmation').hidden = false;
    $('#checkoutConfirmation').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#checkoutConfirmation h2').tabIndex = -1;
    $('#checkoutConfirmation h2').focus({ preventScroll: true });
  });
}
function refreshCheckoutCart() {
  if (page !== 'checkout') return;
  if (!$('#checkoutForm')) { renderCheckout(); return; }
  // Update only public cart blocks; keep recipient fields and their DOM intact.
  const total = totals();
  const productsBlock = $('.checkout-products');
  productsBlock.innerHTML = `<div class="checkout-block-title"><span>03</span><h2>Barang pilihanmu</h2></div>${state.cart.map(item => { const product = getProduct(item.id); return `<div class="checkout-product"><img src="${product.image}" class="${product.contain ? 'contain' : ''}" alt="${escapeHTML(product.name)}" data-product-image="${product.id}"/><div><a href="/produk/${product.id}">${escapeHTML(product.name)}</a><small>${item.quantity} × ${money(product.price)}</small></div><strong>${money(product.price * item.quantity)}</strong></div>`; }).join('')}`;
  $('.shopping-summary').outerHTML = total.quantity ? summaryCard(total, true) : `<aside class="shopping-summary">${emptyState({ title: 'Keranjang masih kosong.', text: 'Pilih barang sebelum melanjutkan pratinjau.', symbol: 'bag' })}</aside>`;
  $('#checkoutFormView').hidden = false;
  $('#checkoutConfirmation').hidden = true;
  $('#checkoutConfirmation').innerHTML = '';
  $('input[name="shipping"][value="standard"]').closest('.shipping-option').querySelector('b').textContent = total.price >= 500000 ? 'Gratis*' : money(15000);
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('button, a');
  if (!target) return;
  if (target.hasAttribute('data-archava-open')) window.dispatchEvent(new CustomEvent('archava:open', { detail: { question: target.dataset.archavaQuestion || '' } }));
  if (target.hasAttribute('data-checkout-sandbox')) window.dispatchEvent(new Event('archava:checkout-open'));
  if (target.dataset.favorite) toggleFavorite(target.dataset.favorite);
  if (target.dataset.compare) toggleComparison(target.dataset.compare);
  if (target.dataset.compareRemove) toggleComparison(target.dataset.compareRemove);
  if (target.hasAttribute('data-compare-clear')) {
    const group = state.compare.length ? getComparisonGroup(getProduct(state.compare[0])) : null;
    state.compare = []; persist(); updateShared();
    if (page === 'comparison' && comparisonParams.has('produk')) navigateTo(`/bandingkan${group ? `?grup=${group.id}` : ''}`);
    else (document.querySelector('[data-compare]') || $('#cartButton')).focus({ preventScroll: true });
  }
  if (target.dataset.add) addToCart(target.dataset.add);
  if (target.dataset.quantity) {
    const item = state.cart.find((item) => item.id === target.dataset.quantity);
    if (item) item.quantity = Math.max(1, Math.min(10, getProduct(item.id).stock, item.quantity + Number(target.dataset.delta)));
    persist(); renderCart(); updateShared();
  }
  if (target.dataset.remove) {
    const oldIndex = [...document.querySelectorAll('[data-remove]')].indexOf(target);
    state.cart = state.cart.filter((item) => item.id !== target.dataset.remove);
    persist(); renderCart(); updateShared(); toast('Produk dihapus dari keranjang.');
    const buttons = [...document.querySelectorAll('[data-remove]')];
    (buttons[Math.min(oldIndex, buttons.length - 1)] || $('#cartButton')).focus({ preventScroll: true });
  }
  if (target.dataset.detailQuantity) {
    $('#detailQuantity').value = Number($('#detailQuantity').value) + Number(target.dataset.detailQuantity);
    detailQuantity();
  }
  if (target.dataset.galleryImage) {
    $('#detailImage').src = target.dataset.galleryImage;
    document.querySelectorAll('[data-gallery-image]').forEach((button) => { const active = button === target; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  }
  if (target.dataset.productTab) switchProductTab(target.dataset.productTab);
  if (target.hasAttribute('data-checkout-back')) {
    $('#checkoutConfirmation').hidden = true;
    $('#checkoutFormView').hidden = false;
    $('#checkoutForm input').focus();
  }
});
document.addEventListener('error', (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.dataset.productImage || image.dataset.fallback) return;
  const product = getProduct(image.dataset.productImage);
  if (!product) return;
  image.dataset.fallback = 'true'; image.src = fallbackImage(product);
}, true);
function refreshStoredState() {
  const cart = loadCart();
  const cartChanged = JSON.stringify(cart) !== JSON.stringify(state.cart);
  state.cart = cart;
  state.favorites = loadFavorites();
  const comparison = loadComparison();
  const comparisonChanged = JSON.stringify(comparison) !== JSON.stringify(state.compare);
  state.compare = comparison;
  renderFavorites();
  if (cartChanged) { renderCart(); renderCheckout(); }
  updateShared();
  if (comparisonChanged && page === 'comparison' && comparisonParams.has('produk')) navigateTo(comparisonURL(state.compare), true);
}
window.addEventListener('storage', (event) => {
  if (['kala-cart', 'kala-favorites', 'kala-compare', null].includes(event.key)) refreshStoredState();
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) refreshStoredState();
});
function navigateTo(url, replace = false) {
  if (typeof window.kalaNavigate === 'function') { void window.kalaNavigate(url, { replace }); return; }
  if (replace) window.location.replace(url); else window.location.assign(url);
}
$('#menuToggle').addEventListener('click', () => {
  const open = $('#mainNav').classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', String(open));
});
$('#searchForm').addEventListener('submit', () => { $('#searchInput').value = $('#searchInput').value.trim(); });
let countdownTimer;
function hydratePage() {
  page = document.body.dataset.page;
  comparisonParams = new URLSearchParams(window.location.search);
  state.cart = loadCart(); state.favorites = loadFavorites(); state.compare = loadComparison();
  clearInterval(countdownTimer);
  $('#mainNav').classList.remove('open');
  $('#menuToggle').setAttribute('aria-expanded', 'false');
if (page === 'comparison' && comparisonParams.has('produk')) {
  state.compare = comparisonSelection(comparisonParams.get('produk')).map((product) => product.id);
  try { localStorage.setItem('kala-compare', JSON.stringify(state.compare)); } catch { /* Session selection still works. */ }
} else if (page === 'comparison' && !comparisonParams.has('grup') && state.compare.length) {
  navigateTo(comparisonURL(state.compare), true);
}
document.querySelectorAll('[data-auto-submit]').forEach((input) => input.addEventListener('change', () => input.form.requestSubmit()));
if ($('#mobileFilterToggle')) $('#mobileFilterToggle').addEventListener('click', () => {
  const open = $('#catalogSidebar').classList.toggle('open');
  $('#mobileFilterToggle').setAttribute('aria-expanded', String(open));
});
if ($('#differencesOnly')) $('#differencesOnly').addEventListener('change', (event) => {
  document.querySelectorAll('.comparison-table [data-same="true"]').forEach((row) => { row.hidden = event.target.checked; });
});
if ($('#shareComparison')) $('#shareComparison').addEventListener('click', async () => {
  const url = new URL(comparisonURL(state.compare), window.location.origin).href;
  try { await navigator.clipboard.writeText(url); toast('Link perbandingan disalin.'); }
  catch {
    const field = $('#comparisonShareFallback');
    field.hidden = false; field.value = url; field.focus(); field.select();
    toast('Link siap disalin dari kolom di atas tabel.');
  }
});
if ($('#newsletterForm')) $('#newsletterForm').addEventListener('submit', (event) => { event.preventDefault(); toast('Pendaftaran newsletter belum aktif. Email kamu belum dikirim atau disimpan.'); });
if ($('#productBuyForm')) {
  $('#detailQuantity').addEventListener('change', detailQuantity);
  $('#productBuyForm').addEventListener('submit', (event) => { event.preventDefault(); addToCart(document.body.dataset.productId, detailQuantity()); });
  $('#buyNowButton').addEventListener('click', () => { if (addToCart(document.body.dataset.productId, detailQuantity())) navigateTo('/checkout'); });
  document.querySelectorAll('[data-product-tab]').forEach((tab, index, tabs) => tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); switchProductTab(tabs[next].dataset.productTab, true); }
  }));
}
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
document.querySelectorAll('#mainNav a, .header-actions a, .mobile-bottom-nav a').forEach((link) => {
  const href = new URL(link.href).pathname;
  const active = href === pathname || (link.closest('.mobile-bottom-nav') && href === '/kategori' && pathname.startsWith('/kategori/')) || (link.closest('.mobile-bottom-nav') && href === '/produk' && pathname.startsWith('/produk/'));
  link.classList.toggle('active', Boolean(active));
  if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
});
if ($('#countdown')) {
  let end;
  try { end = Number(sessionStorage.getItem('kala-countdown')); if (!Number.isFinite(end) || end < Date.now()) { end = Date.now() + 8.5 * 3600000; sessionStorage.setItem('kala-countdown', String(end)); } }
  catch { end = Date.now() + 8.5 * 3600000; }
  const update = () => { const seconds = Math.max(0, Math.floor((end - Date.now()) / 1000)); const values = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]; $('#countdown').innerHTML = values.map((value) => `<b>${String(value).padStart(2, '0')}</b>`).join('<i>:</i>'); };
  update(); countdownTimer = setInterval(update, 1000);
}
renderFavorites(); renderCart(); renderCheckout(); updateShared();
}
window.addEventListener('kala:pagechange', hydratePage);
hydratePage();
