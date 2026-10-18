// Sandbox-only checkout. Signed drafts survive restarts; Midtrans owns payment state.
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync(new URL('../config/catalog.json', import.meta.url), 'utf8'));
const products = new Map(catalog.products.map(product => [product.id, product]));
const ORIGIN = 'https://api.sandbox.midtrans.com';
const DAY = 86_400_000;
export class CheckoutError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = () => { throw new CheckoutError(400, 'Ringkasan checkout tidak valid. Tinjau keranjang lagi.'); };
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join(',') === [...keys].sort().join(',');

export function checkoutSigningKey(env) {
  const secret = env.CHECKOUT_SIGNING_KEY || env.LIVEKIT_API_SECRET;
  return secret ? createHmac('sha256', secret).update('archava-checkout-v1').digest() : null;
}
export function signCheckout(value, key) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  return payload + '.' + createHmac('sha256', key).update(payload).digest('base64url');
}
function verify(token, key) {
  if (!key || typeof token !== 'string' || token.length > 3500 || !/^[\w-]+\.[\w-]+$/.test(token)) return bad();
  const [payload, mac] = token.split('.');
  const actual = Buffer.from(mac, 'base64url');
  const expected = createHmac('sha256', key).update(payload).digest();
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return bad();
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return bad(); }
}
export function priceCart(items, shipping) {
  if (!['standard', 'express'].includes(shipping) || !Array.isArray(items) || !items.length || items.length > 12) return bad();
  const ids = new Set();
  const lines = items.map(item => {
    const product = products.get(item?.id);
    if (!exact(item, ['id', 'quantity']) || !product || ids.has(item.id) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > Math.min(10, product.stock)) return bad();
    ids.add(item.id);
    return { id: item.id, quantity: item.quantity, price: product.price };
  }).sort((a, b) => a.id.localeCompare(b.id));
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shippingCost = shipping === 'express' ? 30000 : subtotal >= 500000 ? 0 : 15000;
  if (!Number.isSafeInteger(subtotal) || subtotal + shippingCost > 100_000_000) return bad();
  return { items: lines, shipping, subtotal, shippingCost, amount: subtotal + shippingCost };
}

export function midtransSandbox(serverKey, fetcher = fetch) {
  if (!serverKey) return null;
  // Dashboard keys can omit SB- and contain symbols. Do not infer their
  // environment from examples: the pinned sandbox endpoint authenticates them.
  // Visible ASCII excludes control characters and ':' (the Basic auth separator).
  if (!/^(?:SB-)?Mid-server-[\x21-\x39\x3b-\x7e]{8,200}$/.test(serverKey)) throw new Error('Use a Midtrans Server Key from the Sandbox dashboard');
  async function call(path, body) {
    const response = await fetcher(ORIGIN + path, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(7000),
      headers: { authorization: 'Basic ' + Buffer.from(serverKey + ':').toString('base64'), accept: 'application/json', ...(body ? { 'content-type': 'application/json', 'Idempotency-Key': body.transaction_details.order_id } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    if ((response.status === 404 || data.status_code === '404') && !body) return null;
    if (!response.ok || !['200', '201', '202'].includes(data.status_code)) throw new Error('Sandbox request failed');
    return data;
  }
  return {
    status: orderId => call(`/v2/${encodeURIComponent(orderId)}/status`),
    charge: draft => call('/v2/charge', {
      payment_type: 'qris', qris: { acquirer: 'gopay' },
      transaction_details: { order_id: draft.orderId, gross_amount: draft.amount },
      // No recipient/contact fields are sent to the provider.
      custom_expiry: { order_time: new Date(draft.createdAt + 7 * 3600000).toISOString().slice(0, 19).replace('T', ' ') + ' +0700', expiry_duration: 15, unit: 'minute' },
    }),
  };
}

export function createCheckout({ projectId, signingKey, provider = null, mail = null, now = Date.now }) {
  const locks = new Map();
  const configured = Boolean(provider && signingKey);
  const view = (draft, status, transactionId) => {
    const value = { ...draft, v: 2, purpose: 'receipt', status, configured, observedAt: now(), emailStatus: mail?.configured ? 'not_requested' : 'unavailable' };
    return { order: value, receipt: signCheckout(value, signingKey), emailConfigured: Boolean(mail?.configured),
      ...(transactionId && status === 'pending' ? { qrUrl: `${ORIGIN}/v2/qris/${transactionId}/qr-code` } : {}) };
  };
  async function withMail(draft, result) {
    if (mail?.configured) {
      // SMTP runs only in the separate outbox process. Its failure never changes
      // a verified payment result or causes another provider charge.
      const emailStatus = await mail.observe(draft, result.order.status).catch(() => 'unknown');
      // A prior SMTP result cannot establish the current provider payment
      // state during an outage. Keep the signed v2 schema consistent, without
      // changing the durable mail outcome or trying another submission.
      result.order.emailStatus = result.order.status !== 'paid' && ['queued', 'sending', 'accepted'].includes(emailStatus) ? 'unknown' : emailStatus;
      result.order.observedAt = now();
      result.receipt = signCheckout(result.order, signingKey);
    }
    return result;
  }
  const readDraft = token => {
    const draft = verify(token, signingKey);
    if (draft.v !== 1 || draft.purpose !== 'draft' || draft.projectId !== projectId || !/^DOPA-SBX-[a-f0-9-]{36}$/.test(draft.orderId)
      || !Number.isSafeInteger(draft.createdAt) || draft.createdAt > now() || now() > draft.createdAt + DAY || draft.expiresAt !== draft.createdAt + 900000) return bad();
    return draft;
  };
  function providerView(draft, data) {
    if (data.order_id !== draft.orderId || !/^\d+(?:\.00)?$/.test(String(data.gross_amount)) || Number(data.gross_amount) !== draft.amount
      || data.currency !== 'IDR' || data.payment_type !== 'qris' || !/^[a-f0-9-]{36}$/.test(data.transaction_id || '')) throw new Error('Sandbox response mismatch');
    const status = { pending: 'pending', settlement: 'paid', expire: 'expired', deny: 'failed', cancel: 'failed' }[data.transaction_status];
    if (!status || data.fraud_status && data.fraud_status !== 'accept') return view(draft, 'unknown');
    // Hide an elapsed QR, but still accept a later authoritative settlement.
    return view(draft, status === 'pending' && now() >= draft.expiresAt ? 'expired' : status, data.transaction_id);
  }
  async function inspect(draft, create) {
    if (!configured) return view(draft, 'unavailable');
    try {
      const existing = await provider.status(draft.orderId);
      if (existing) return providerView(draft, existing);
      if (now() > draft.createdAt + 300000) return view(draft, 'expired');
      if (!create) return view(draft, 'preview');
      return providerView(draft, await provider.charge(draft));
    } catch {
      // A charge timeout can mean it succeeded. Keep the SAME order and reconcile
      // via status on retry; never mint another order or infer success.
      return view(draft, 'unknown');
    }
  }
  return {
    configured,
    async paymentStatus(draft) { return (await inspect(draft, false)).order.status; },
    draft(body) {
      if (!signingKey) throw new CheckoutError(503, 'Checkout demo belum tersedia.');
      if (!exact(body, ['items', 'shipping'])) return bad();
      const createdAt = now();
      const draft = { v: 1, purpose: 'draft', projectId, orderId: 'DOPA-SBX-' + randomUUID(), ...priceCart(body.items, body.shipping), createdAt, expiresAt: createdAt + 900000 };
      return { ...view(draft, configured ? 'preview' : 'unavailable'), token: signCheckout(draft, signingKey) };
    },
    async update(body, create = false) {
      if (!exact(body, create ? ['token', 'confirmed'] : ['token']) || create && body.confirmed !== true) return bad();
      const draft = readDraft(body.token);
      // Only one charge attempt at a time per order in this process. Midtrans's
      // unique order_id is the cross-instance/restart boundary. The same charge
      // also reuses its provider idempotency header (five-minute provider window).
      const previous = locks.get(draft.orderId) || Promise.resolve();
      const next = previous.catch(() => {}).then(() => inspect(draft, create));
      locks.set(draft.orderId, next);
      try { return await withMail(draft, await next); } finally { if (locks.get(draft.orderId) === next) locks.delete(draft.orderId); }
    },
    async email(body) {
      if (!exact(body, ['token', 'email', 'consent']) || body.consent !== true) return bad();
      const draft = readDraft(body.token);
      if (!mail?.configured) throw new CheckoutError(503, 'Pengiriman email belum dikonfigurasi. Pembayaran tetap dapat diperiksa.');
      const result = await mail.register(draft, body.email);
      if (result.status === 'invalid_recipient') throw new CheckoutError(400, 'Periksa alamat email lengkap yang akan menerima bukti simulasi.');
      if (result.status === 'recipient_locked') throw new CheckoutError(409, 'Email untuk ringkasan ini sudah dikonfirmasi. Alamat tidak dapat diganti setelah disimpan.');
      if (result.status === 'unavailable') throw new CheckoutError(503, 'Pengiriman email sedang belum tersedia.');
      return withMail(draft, await inspect(draft, false));
    },
  };
}
