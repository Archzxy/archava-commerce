import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileMailStore, gcsMailStore } from './receipt-mail-store.mjs';
import { createReceiptMail, recipientEmail, configuredReceiptMail, smtpTransport } from './receipt-mail.mjs';
import { checkoutSigningKey, createCheckout } from './checkout.mjs';

const key = Buffer.alloc(32, 7);
const recipient = 'Buyer@EXAMPLE.test';
const body = { items: [{ id: 'headphones', quantity: 1 }], shipping: 'standard' };
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'dopamine-receipt-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let transaction = null, sends = 0, result = 'accepted', delay, providerUnavailable = false;
  const sent = [];
  const store = fileMailStore(directory, key);
  const mailOptions = { store, key, send: async payload => { sends++; sent.push(payload); if (delay) await delay; return result; }, verifyPayment: draft => checkout.paymentStatus(draft) };
  const mail = createReceiptMail(mailOptions);
  const checkout = createCheckout({ projectId: 'email-test', signingKey: key, mail, provider: {
    async status() { if (providerUnavailable) throw new Error('Synthetic provider outage'); return transaction; },
    async charge(draft) { return transaction = { order_id: draft.orderId, gross_amount: String(draft.amount), currency: 'IDR', payment_type: 'qris', transaction_id: '0d8178e1-c6c7-4ab4-81a6-893be9d924ab', transaction_status: 'pending' }; },
  } });
  const draft = checkout.draft(body);
  return { directory, store, mail, mailOptions, checkout, draft, sent,
    get sends() { return sends; }, settle() { transaction.transaction_status = 'settlement'; },
    setResult(v) { result = v; }, block(v) { delay = v; }, failProvider(v) { providerUnavailable = v; } };
}

test('recipient is explicit, one mailbox, no silent typo rewriting or header injection', () => {
  assert.equal(recipientEmail(recipient), 'Buyer@example.test');
  assert.equal(recipientEmail('a@gamil.com'), 'a@gamil.com');
  for (const value of [' a@example.test', 'a@example.test\r\nBcc: victim@example.test', 'a@example.test,b@example.test', 'A <a@example.test>', 'a..b@example.test', 'a@localhost', 'a@-bad.test']) assert.equal(recipientEmail(value), null);
});

test('registration requires exact consent and signed capability; never sends before verified settlement', async t => {
  const f = await fixture(t);
  for (const request of [
    { token: f.draft.token, email: recipient, consent: false },
    { token: f.draft.token, email: recipient, consent: true, amount: 1 },
    { token: 'fake.token', email: recipient, consent: true },
  ]) await assert.rejects(f.checkout.email(request), { status: 400 });
  const registered = await f.checkout.email({ token: f.draft.token, email: recipient, consent: true });
  assert.equal(registered.order.emailStatus, 'waiting_payment');
  assert(!JSON.stringify(registered).includes('Buyer'));
  assert(!JSON.stringify(JSON.parse(Buffer.from(registered.receipt.split('.')[0], 'base64url'))).includes('@'));
  await f.mail.tick(); assert.equal(f.sends, 0);
  await f.checkout.update({ token: f.draft.token, confirmed: true }, true);
  await f.mail.tick(); assert.equal(f.sends, 0);
  await assert.rejects(f.checkout.email({ token: f.draft.token, email: 'other@example.test', consent: true }), { status: 409 });
});

test('email is queued off the payment response; concurrent poll, duplicate worker and restart send once', async t => {
  const f = await fixture(t);
  await f.checkout.email({ token: f.draft.token, email: recipient, consent: true });
  await f.checkout.update({ token: f.draft.token, confirmed: true }, true); f.settle();
  let release; f.block(new Promise(done => { release = done; }));
  const paid = await f.checkout.update({ token: f.draft.token });
  assert.equal(paid.order.status, 'paid'); assert.equal(paid.order.emailStatus, 'queued'); assert.equal(f.sends, 0);
  const other = createReceiptMail({ ...f.mailOptions, store: fileMailStore(f.directory, key) });
  const sending = Promise.all([f.mail.tick(), other.tick()]);
  for (let i = 0; !f.sends && i < 30; i++) await new Promise(done => setTimeout(done, 5));
  assert.equal(f.sends, 1);
  assert.equal((await f.checkout.update({ token: f.draft.token })).order.emailStatus, 'sending');
  release(); await sending;
  const restarted = createReceiptMail({ ...f.mailOptions, store: fileMailStore(f.directory, key) });
  await restarted.tick();
  assert.equal((await f.checkout.update({ token: f.draft.token })).order.emailStatus, 'accepted');
  assert.equal(f.sends, 1);
  assert.equal(f.sent[0].order.amount, paid.order.amount);
  assert.equal(f.sent[0].email, 'Buyer@example.test');
  for (const id of await readdir(f.directory)) {
    assert(!id.includes('DOPA') && !id.includes('Buyer'));
    for (const file of await readdir(join(f.directory, id))) {
      const value = await readFile(join(f.directory, id, file), 'utf8');
      assert(!value.includes('Buyer') && !value.includes(paid.order.orderId));
    }
  }
});

test('background reconciles a registered paid order without an open browser', async t => {
  const f = await fixture(t);
  await f.checkout.email({ token: f.draft.token, email: recipient, consent: true });
  await f.checkout.update({ token: f.draft.token, confirmed: true }, true); f.settle();
  await f.mail.tick(); assert.equal(f.sends, 1);
});

test('uncertain delivery remains unknown across restart and is never resent; payment remains paid', async t => {
  const f = await fixture(t); f.setResult('unknown');
  await f.checkout.email({ token: f.draft.token, email: recipient, consent: true });
  await f.checkout.update({ token: f.draft.token, confirmed: true }, true); f.settle();
  await f.checkout.update({ token: f.draft.token }); await f.mail.tick();
  const restarted = createReceiptMail({ ...f.mailOptions, store: fileMailStore(f.directory, key) });
  await restarted.tick();
  const paid = await f.checkout.update({ token: f.draft.token });
  assert.equal(paid.order.status, 'paid'); assert.equal(paid.order.emailStatus, 'unknown'); assert.equal(f.sends, 1);
});

test('encrypted state cannot be moved to another order or decrypted with a different key', async t => {
  const f = await fixture(t); const id = 'a'.repeat(64);
  await f.store.put(id, { private: 'private-canary' });
  assert.equal(await f.store.put(id, { private: 'replacement' }), false);
  await assert.rejects(fileMailStore(f.directory, Buffer.alloc(32, 9)).read(id));
});

test('a crash after durable claim is unknown on restart, without another send attempt', async t => {
  const f = await fixture(t);
  await f.checkout.email({ token: f.draft.token, email: recipient, consent: true });
  await f.checkout.update({ token: f.draft.token, confirmed: true }, true); f.settle();
  await f.checkout.update({ token: f.draft.token });
  const [id] = await f.store.list(), entry = await f.store.read(id);
  await f.store.put(id, { ...entry.value, status: 'sending', updatedAt: Date.now() - 61000 }, entry.generation);
  const restarted = createReceiptMail({ ...f.mailOptions, store: fileMailStore(f.directory, key) });
  await restarted.tick();
  const result = await f.checkout.update({ token: f.draft.token });
  assert.equal(result.order.status, 'paid'); assert.equal(result.order.emailStatus, 'unknown');
  assert.equal(f.sends, 0);
});

test('SMTP failure never changes a paid receipt or retries on restart', async t => {
  const f = await fixture(t); f.setResult('failed');
  await f.checkout.email({ token: f.draft.token, email: recipient, consent: true });
  await f.checkout.update({ token: f.draft.token, confirmed: true }, true); f.settle();
  await f.checkout.update({ token: f.draft.token }); await f.mail.tick();
  await createReceiptMail({ ...f.mailOptions }).tick();
  const result = await f.checkout.update({ token: f.draft.token });
  assert.equal(result.order.status, 'paid'); assert.equal(result.order.emailStatus, 'failed');
  assert.equal(f.sends, 1);
});

test('a later provider outage keeps v2 status consistent without changing accepted mail or resending', async t => {
  const f = await fixture(t);
  await f.checkout.email({ token: f.draft.token, email: recipient, consent: true });
  await f.checkout.update({ token: f.draft.token, confirmed: true }, true); f.settle();
  await f.checkout.update({ token: f.draft.token }); await f.mail.tick();
  f.failProvider(true);
  const uncertain = await f.checkout.update({ token: f.draft.token });
  assert.equal(uncertain.order.status, 'unknown'); assert.equal(uncertain.order.emailStatus, 'unknown');
  const [id] = await f.store.list(); assert.equal((await f.store.read(id)).value.status, 'accepted');
  f.failProvider(false);
  const recovered = await f.checkout.update({ token: f.draft.token });
  assert.equal(recovered.order.status, 'paid'); assert.equal(recovered.order.emailStatus, 'accepted');
  await f.mail.tick(); assert.equal(f.sends, 1);
});

test('configuration stays disabled without sender or durable Cloud Run storage', () => {
  assert.equal(configuredReceiptMail({}, key, async () => 'paid').configured, false);
  const env = { CHECKOUT_EMAIL_ENABLED: 'true', SMTP_HOST: 'smtp.example.test', SMTP_PORT: '465', SMTP_FROM: 'shop@example.test', SMTP_USER: 'shop', SMTP_PASS: 'fake-secret', K_SERVICE: 'cloud-demo' };
  assert.equal(configuredReceiptMail(env, key, async () => 'paid').configured, false);
  assert.equal(smtpTransport({ ...env, SMTP_PORT: '0' }), null);
  assert.equal(configuredReceiptMail({ ...env, CHECKOUT_EMAIL_BUCKET: 'private-test-bucket' }, key, async () => 'paid').configured, true);
});

test('GCS adapter uses generation-pinned reads and CAS claims, with encrypted body and no recipient URL', async () => {
  let generation = 0, payload; const urls = [];
  const adapter = gcsMailStore('private-test-bucket', key, async (url, options) => {
    urls.push(url); assert(!url.includes('Buyer'));
    if (url.includes('metadata.google.internal')) return Response.json({ access_token: 'fake-metadata-token', expires_in: 3600 });
    assert.equal(options.headers.authorization, 'Bearer fake-metadata-token');
    if (url.includes('/upload/')) {
      const expected = new URL(url).searchParams.get('ifGenerationMatch');
      if (expected !== String(generation)) return new Response('', { status: 412 });
      payload = options.body; generation++; return Response.json({ generation: String(generation) });
    }
    if (url.includes('alt=media')) return new Response(payload);
    if (url.includes('maxResults')) return Response.json({ items: [{ name: 'checkout-mail-v1/' + 'a'.repeat(64) }] });
    if (!generation) return new Response('', { status: 404 });
    return Response.json({ generation: String(generation) });
  });
  const id = 'a'.repeat(64);
  assert.equal(await adapter.read(id), null);
  assert(await adapter.put(id, { email: recipient }));
  assert(!payload.includes('Buyer'));
  const v = await adapter.read(id); assert.equal(v.value.email, recipient);
  assert.equal(await adapter.put(id, { status: 'sending' }, '0'), false);
  assert(await adapter.put(id, { status: 'sending' }, v.generation));
  assert.deepEqual(await adapter.list(), [id]);
  assert(urls.some(u => u.includes('alt=media&generation=1')));
});
