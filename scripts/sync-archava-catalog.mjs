import { writeFile } from 'node:fs/promises';
import { products, categories } from '../data/products.js';
import { comparisonGroups } from '../data/comparison.js';

// Only public, operator-authored demo data. No browser state or environment.
const catalog = {
  version: 2, currency: 'IDR', demo: true,
  notice: 'Harga, stok, rating, dan spesifikasi adalah contoh; pembayaran dan pengiriman tidak aktif.',
  categories: categories.map(({ name, slug, label }) => ({ name, slug, label })),
  groups: comparisonGroups,
  products: products.map(({ id, name, brand, category, price, oldPrice, rating, stock, specs, keywords, description, knowledge, comparison, image }) => ({ id, name, brand, category, price, oldPrice, rating, stock, specs, keywords, description, knowledge, image, demo: true, ...(comparison ? { comparison } : {}) })),
};
await writeFile(new URL('../archava/config/catalog.json', import.meta.url), JSON.stringify(catalog, null, 2) + '\n');
console.log(`Archava catalog synced: ${products.length} demo products, ${comparisonGroups.length} comparison groups.`);
