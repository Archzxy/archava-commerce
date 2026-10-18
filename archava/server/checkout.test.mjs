import assert from 'node:assert/strict';
import test from 'node:test';
import { checkoutSigningKey, createCheckout, midtransSandbox, priceCart } from './checkout.mjs';

const key = checkoutSigningKey({ CHECKOUT_SIGNING_KEY: 'offline-test-secret' });
const items = [{ id: 'headphones', quantity: 1 }];
const body = { items, shipping: 'standard' };
function fixture() {
  let clock = 1800000000000;
  let transaction = null;
  let charges = 0;
  const provider = {
    async status() { return transaction; },
    async charge(draft) { charges++; transaction = { status_code: '201', order_id: draft.orderId, transaction_id: '0d8178e1-c6c7-4ab4-81a6-893be9d924ab', gross_amount: draft.amount + '.00', currency: 'IDR', payment_type: 'qris', transaction_status: 'pending', fraud_status: 'accept' }; return transaction; },
  };
  const options = { projectId: 'unit-project', signingKey: key, provider, now: () => clock };
  const checkout = createCheckout(options);
  return { checkout, options, provider, get transaction() { return transaction; }, get charges() { return charges; }, advance: ms => { clock += ms; } };
}
test('server prices exact catalog IDs/quantities and demo shipping; rejects user totals and PII', () => {
  const f = fixture();
  const draft = f.checkout.draft(body);
  assert.equal(draft.order.amount, priceCart(items, 'standard').amount);
  assert.equal(priceCart(items, 'express').shippingCost, 30000);
  for (const invalid of [{ ...body, amount: 1 }, { ...body, recipient: 'private' }, { ...body, items: [{ ...items[0], price: 1 }] }, { ...body, items: [...items, ...items] }, { ...body, items: [{ id: 'invented', quantity: 1 }] }, { ...body, items: [{ id: 'headphones', quantity: 1.5 }] }, { ...body, items: [{ id: 'headphones', quantity: 11 }] }]) assert.throws(() => f.checkout.draft(invalid), { status: 400 });
});
test('no key gives an honest unavailable receipt without a QR or provider call', async () => {
  const checkout = createCheckout({ projectId: 'unit-project', signingKey: key });
  const draft = checkout.draft(body);
  assert.equal(draft.order.status, 'unavailable');
  assert.equal(draft.qrUrl, undefined);
  assert.equal((await checkout.update({ token: draft.token, confirmed: true }, true)).order.status, 'unavailable');
});
test('confirmation required; signed draft is project/purpose/tamper/expiry bound', async () => {
  const f = fixture(); const draft = f.checkout.draft(body);
  for (const value of [{ token: draft.token, confirmed: false }, { token: draft.token }, { token: draft.receipt, confirmed: true }, { token: draft.token + 'x', confirmed: true }]) await assert.rejects(() => f.checkout.update(value, true), { status: 400 });
  const other = createCheckout({ ...f.options, projectId: 'other-project' });
  await assert.rejects(() => other.update({ token: draft.token }), { status: 400 });
  f.advance(301000);
  assert.equal((await f.checkout.update({ token: draft.token, confirmed: true }, true)).order.status, 'expired');
  assert.equal(f.charges, 0);
});
test('concurrent confirms, retries and restarts reuse one order; settlement is provider verified', async () => {
  const f = fixture(); const draft = f.checkout.draft(body);
  const results = await Promise.all([1, 2, 3].map(() => f.checkout.update({ token: draft.token, confirmed: true }, true)));
  assert.equal(f.charges, 1);
  assert(results.every(r => r.order.status === 'pending'));
  assert(results[0].qrUrl.startsWith('https://api.sandbox.midtrans.com/v2/qris/'));
  f.transaction.transaction_status = 'settlement';
  const restarted = createCheckout(f.options);
  assert.equal((await restarted.update({ token: draft.token })).order.status, 'paid');
  assert.equal(f.charges, 1);
  f.advance(86400001);
  await assert.rejects(() => restarted.update({ token: draft.token }), { status: 400 });
});
test('ambiguous charge timeout reconciles status without a new payment', async () => {
  const f = fixture(); const charge = f.provider.charge;
  f.provider.charge = async d => { await charge(d); throw new Error('network timeout with private detail'); };
  const draft = f.checkout.draft(body);
  assert.equal((await f.checkout.update({ token: draft.token, confirmed: true }, true)).order.status, 'unknown');
  assert.equal((await f.checkout.update({ token: draft.token, confirmed: true }, true)).order.status, 'pending');
  assert.equal(f.charges, 1);
});
test('amount/order/type/currency mismatches and unaccepted fraud never become paid', async () => {
  for (const override of [{ gross_amount: '1.00' }, { order_id: 'another-order' }, { payment_type: 'credit_card' }, { currency: 'USD' }, { fraud_status: 'challenge' }, { transaction_status: 'invented' }]) {
    const f = fixture(); const draft = f.checkout.draft(body);
    await f.checkout.update({ token: draft.token, confirmed: true }, true);
    Object.assign(f.transaction, { transaction_status: 'settlement' }, override);
    assert.equal((await f.checkout.update({ token: draft.token })).order.status, 'unknown');
  }
});
test('elapsed pending QR hides, but late authoritative settlement still wins', async () => {
  const f = fixture(); const draft = f.checkout.draft(body);
  await f.checkout.update({ token: draft.token, confirmed: true }, true);
  f.advance(900001);
  const expired = await f.checkout.update({ token: draft.token });
  assert.equal(expired.order.status, 'expired'); assert.equal(expired.qrUrl, undefined);
  f.transaction.transaction_status = 'settlement';
  assert.equal((await f.checkout.update({ token: draft.token })).order.status, 'paid');
});
test('both dashboard key formats stay pinned to sandbox and send no customer details', async () => {
  for (const invalid of ['Mid-client-offline-test', 'SB-Mid-client-offline-test', 'Mid-server-bad:key', 'Mid-server-short', 'Mid-server-' + 'a'.repeat(201), 'Mid-server-offline-test\n']) assert.throws(() => midtransSandbox(invalid));
  assert.equal(midtransSandbox(''), null);
  const calls = [];
  for (const key of ['SB-Mid-server-offline-test', 'Mid-server-offline-test', 'Mid-server-offline~test', 'Mid-server-offline|test', 'Mid-server-offline#test']) {
    const adapter = midtransSandbox(key, async (url, options) => { calls.push({ url, options }); return new Response(JSON.stringify({ status_code: '201' })); });
    await adapter.charge(fixture().checkout.draft(body).order);
  }
  assert.equal(calls.length, 5);
  assert(calls.every(call => call.url === 'https://api.sandbox.midtrans.com/v2/charge'));
  assert.equal(calls[0].url, 'https://api.sandbox.midtrans.com/v2/charge');
  assert.equal(calls[0].options.redirect, 'error');
  const charge = JSON.parse(calls[0].options.body);
  assert.equal(charge.customer_details, undefined);
  assert.equal(charge.custom_expiry.expiry_duration, 15);
  assert.equal(charge.payment_type, 'qris');
});

test('sandbox authentication failure never retries a production endpoint or leaks credentials', async () => {
  const urls = [];
  const adapter = midtransSandbox('Mid-server-offline-test', async url => {
    urls.push(url);
    return new Response(JSON.stringify({ status_code: '401', status_message: 'private provider detail' }), { status: 401 });
  });
  await assert.rejects(() => adapter.status('unit-order'), { message: 'Sandbox request failed' });
  assert.deepEqual(urls, ['https://api.sandbox.midtrans.com/v2/unit-order/status']);
});

test('an in-process charge retries across service restarts with the same bounded provider key', async () => {
  const calls = [];
  let charges = 0;
  const provider = midtransSandbox('Mid-server-offline-test', async (url, options) => {
    calls.push({ url, options });
    if (options.method === 'GET') return new Response(JSON.stringify({ status_code: '404' }), { status: 404 });
    charges++;
    if (charges === 1) return new Response(JSON.stringify({ status_code: '202' }), { status: 202 });
    const transaction = JSON.parse(options.body).transaction_details;
    return new Response(JSON.stringify({ status_code: '201', order_id: transaction.order_id,
      transaction_id: '0d8178e1-c6c7-4ab4-81a6-893be9d924ab', gross_amount: transaction.gross_amount + '.00',
      currency: 'IDR', payment_type: 'qris', transaction_status: 'pending' }));
  });
  const options = { projectId: 'unit-project', signingKey: key, provider };
  const first = createCheckout(options);
  const draft = first.draft(body);
  assert.equal((await first.update({ token: draft.token, confirmed: true }, true)).order.status, 'unknown');
  const restarted = createCheckout(options);
  assert.equal((await restarted.update({ token: draft.token, confirmed: true }, true)).order.status, 'pending');
  const posts = calls.filter(call => call.options.method === 'POST');
  assert.equal(posts.length, 2);
  assert(posts.every(call => call.options.headers['Idempotency-Key'] === draft.order.orderId));
  assert(posts.every(call => call.options.headers['Idempotency-Key'].length <= 46));
  assert.equal(posts[0].options.body, posts[1].options.body);
  assert(calls.filter(call => call.options.method === 'GET').every(call => !call.options.headers['Idempotency-Key']));
  assert(calls.every(call => call.url.startsWith('https://api.sandbox.midtrans.com/')));
});
