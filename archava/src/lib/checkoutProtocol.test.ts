import assert from 'node:assert/strict';
import test from 'node:test';
import { cartFingerprint, parseCheckoutCommand } from './checkoutProtocol.ts';
const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));
const valid = { requestId: 'unit-request', action: 'prepare', orderId: '', shipping: 'standard' };
test('checkout commands accept only bounded actions and reject payment/URL/consent injection', () => {
  assert.deepEqual(parseCheckoutCommand(encode(valid)), valid);
  for (const value of [{ ...valid, action: 'mark_paid' }, { ...valid, confirmed: true }, { ...valid, url: 'https://evil.test' }, { ...valid, shipping: 'real' }, { ...valid, action: 'confirm' }, { ...valid, orderId: 'victim' }, { ...valid, requestId: {} }]) assert.equal(parseCheckoutCommand(encode(value)), null);
  assert.equal(parseCheckoutCommand(new Uint8Array(513)), null);
});
test('cart binding ignores item order but detects quantity, product and shipping edits', () => {
  const a = [{ id: 'a', quantity: 1 }, { id: 'b', quantity: 2 }];
  assert.equal(cartFingerprint(a, 'standard'), cartFingerprint([...a].reverse(), 'standard'));
  assert.notEqual(cartFingerprint(a, 'standard'), cartFingerprint(a, 'express'));
  assert.notEqual(cartFingerprint(a, 'standard'), cartFingerprint([{ id: 'a', quantity: 2 }, a[1]], 'standard'));
});
