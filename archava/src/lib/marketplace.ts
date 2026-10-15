import catalog from '../../config/catalog.json';

export const MARKET_TOPIC = 'archava.market';
export const MARKET_ACK_TOPIC = 'archava.market.ack';
export const MARKET_NAVIGATION_TOPIC = 'archava.market.navigation';
const products = new Map(catalog.products.map((product) => [product.id, product]));
export interface ShoppingPage { page: string; productIds: string[]; comparisonIds: string[] }

export function validShoppingPage(page: unknown): page is string {
  if (typeof page !== 'string') return false;
  return ['/', '/produk', '/kategori', '/promo', '/bandingkan', '/favorit', '/keranjang', '/checkout', '/akun', '/bantuan'].includes(page)
    || (page.startsWith('/produk/') && products.has(page.slice(8)))
    || catalog.categories.some((category) => page === `/kategori/${category.slug}`);
}
export function selectedProducts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && products.has(id)))].slice(0, 12);
}
export function sameGroup(ids: unknown, minimum = 2): ids is string[] {
  if (!Array.isArray(ids) || ids.length < minimum || ids.length > 3 || selectedProducts(ids).length !== ids.length) return false;
  const group = products.get(ids[0])?.comparison?.group;
  return Boolean(group && ids.every((id) => products.get(id)?.comparison?.group === group));
}
export function currentShoppingPage(): ShoppingPage {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const page = validShoppingPage(pathname) ? pathname : '/';
  const detail = document.body.dataset.productId;
  const productIds = selectedProducts(detail ? [detail] : [...document.querySelectorAll('#mainContent [data-card-id], #mainContent [data-cart-item]')].map((item) => (item as HTMLElement).dataset.cardId || (item as HTMLElement).dataset.cartItem));
  let comparisonIds: string[] = [];
  try { const stored = JSON.parse(localStorage.getItem('kala-compare') || '[]'); if (sameGroup(stored, 1)) comparisonIds = stored; } catch { /* No selections. */ }
  return { page, productIds, comparisonIds };
}
export function navigationTarget(data: Uint8Array): string | null {
  if (data.byteLength > 1024) return null;
  try {
    const message = JSON.parse(new TextDecoder().decode(data));
    if (message.action === 'product' && Object.keys(message).length === 2 && typeof message.productId === 'string' && products.has(message.productId)) return `/produk/${message.productId}`;
    if (message.action === 'compare' && Object.keys(message).length === 2 && sameGroup(message.productIds)) return `/bandingkan?${new URLSearchParams({ produk: message.productIds.join(',') })}`;
  } catch { /* Drop unknown or malformed commands. */ }
  return null;
}
