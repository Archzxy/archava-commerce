import { products, categories } from './products.js';
import { comparisonGroups } from './comparison.js';

export const getProduct = (id) => products.find((product) => product.id === id);
export const getCategory = (slugOrName) => categories.find((category) => category.slug === slugOrName || category.name === slugOrName);
export const money = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
export const discount = (product) => Math.round((1 - product.price / product.oldPrice) * 100);
export const categoryCount = (category) => products.filter((product) => product.category === category.name).length;
export const popularProducts = (count = 8) => [...products].sort((a, b) => b.sold - a.sold).slice(0, count);
export const saleProducts = () => products.filter((product) => discount(product) >= 20).sort((a, b) => discount(b) - discount(a));
export const getComparisonGroup = (productOrId) => comparisonGroups.find((group) => group.id === (productOrId?.comparison?.group || productOrId));
export const comparisonProducts = (groupId) => products.filter((product) => product.comparison?.group === groupId);
export const competitorsFor = (product) => product.comparison ? comparisonProducts(product.comparison.group).filter((item) => item.id !== product.id) : [];
export function comparisonSelection(ids = []) {
  const candidates = [...new Set((Array.isArray(ids) ? ids : String(ids).split(',')).slice(0, 30))].map(getProduct).filter((product) => product?.comparison);
  return candidates.filter((product) => product.comparison.group === candidates[0]?.comparison.group).slice(0, 3);
}
export function comparisonURL(ids = []) {
  const selected = comparisonSelection(ids).map((product) => product.id);
  return `/bandingkan${selected.length ? `?${new URLSearchParams({ produk: selected.join(',') })}` : ''}`;
}

const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const positiveNumber = (value) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : 0; };
export function catalogOptions(params, category = null, promo = false) {
  return {
    query: (params.get('q') || '').trim().slice(0, 120),
    category: category?.name || '', promo,
    sort: ['popular', 'price-asc', 'price-desc', 'rating', 'newest'].includes(params.get('sort')) ? params.get('sort') : 'popular',
    min: positiveNumber(params.get('min')), max: positiveNumber(params.get('max')),
    rating: Math.min(5, positiveNumber(params.get('rating'))),
    page: Math.max(1, Math.min(10000, Math.floor(positiveNumber(params.get('page')) || 1))),
  };
}
export function filterProducts(options) {
  const tokens = normalize(options.query || '').match(/[\p{L}\p{N}]+/gu) || [];
  const result = products.filter((product) => {
    const words = normalize(`${product.name} ${product.brand} ${product.category} ${product.keywords || ''} ${product.specs.join(' ')}`).match(/[\p{L}\p{N}]+/gu) || [];
    return (!options.category || product.category === options.category) &&
      (!options.promo || discount(product) >= 20) &&
      (!options.min || product.price >= options.min) &&
      (!options.max || product.price <= options.max) &&
      (!options.rating || product.rating >= options.rating) && tokens.every((token) => words.some((word) => word.startsWith(token)));
  });
  return result.sort((a, b) => {
    if (options.sort === 'price-asc') return a.price - b.price;
    if (options.sort === 'price-desc') return b.price - a.price;
    if (options.sort === 'rating') return b.rating - a.rating || b.sold - a.sold;
    if (options.sort === 'newest') return b.created - a.created;
    return b.sold - a.sold;
  });
}
export function paginate(items, requestedPage, pageSize = 12) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, requestedPage));
  const offset = (page - 1) * pageSize;
  return { page, totalPages, total: items.length, offset, items: items.slice(offset, offset + pageSize) };
}
export function pageURL(path, params, updates = {}) {
  const query = new URLSearchParams(params);
  query.delete('page');
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '' || value === 0 || (key === 'sort' && value === 'popular')) query.delete(key);
    else query.set(key, String(value));
  }
  const suffix = query.toString();
  return `${path}${suffix ? `?${suffix}` : ''}`;
}
