import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { products } from '../data/products.js';

test('all listings have usable product knowledge and explicit gaps', () => {
  assert.equal(products.length, 80);
  for (const product of products) {
    assert.ok(product.knowledge.summary, product.id);
    assert.ok(product.knowledge.useCase, product.id);
    assert.ok(product.knowledge.specifications.length, product.id);
    assert.ok(product.knowledge.unknowns.length, product.id);
    assert.equal(product.knowledge.source.type, 'demo');
    assert.ok(!product.specs.some(spec => ['Pilihan gadget', 'Desain praktis', 'Pilihan fashion', 'Untuk rumah', 'Koleksi beauty'].includes(spec)), product.id);
  }
});

test('public snapshot carries the same prices and knowledge as the storefront', () => {
  const snapshot = JSON.parse(readFileSync(new URL('../archava/config/catalog.json', import.meta.url)));
  assert.equal(snapshot.products.length, products.length);
  for (const product of products) {
    const exported = snapshot.products.find(p => p.id === product.id);
    assert.equal(exported.price, product.price, product.id);
    assert.equal(exported.description, product.description, product.id);
    assert.deepEqual(exported.knowledge, product.knowledge, product.id);
  }
});

test('source facts stay product specific and do not fill missing model variants', () => {
  const get = id => products.find(p => p.id === id);
  assert.ok(get('lenovo-yoga-920').specs.includes('Laptop 2-in-1'));
  assert.ok(get('beats-flex-wireless-earphones').specs.includes('Baterai hingga 12 jam'));
  assert.match(get('apple-macbook-pro-14-inch-space-grey').knowledge.unknowns.join(), /RAM/);
  assert.match(get('sunglasses').knowledge.unknowns.join(), /UV/);
  assert.match(get('apple-airpower-wireless-charger').knowledge.unknowns.join(), /tidak membuktikan ketersediaan ritel/);
});
