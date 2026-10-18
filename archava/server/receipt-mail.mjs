import { createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { fileMailStore, gcsMailStore } from './receipt-mail-store.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(readFileSync(new URL('../config/catalog.json', import.meta.url), 'utf8'));
const products = new Map(catalog.products.map(p => [p.id, p]));
export const EMAIL_STATUSES = ['unavailable', 'not_requested', 'waiting_payment', 'queued', 'sending', 'accepted', 'failed', 'unknown'];
export function recipientEmail(value) {
  // One explicit ASCII mailbox. No name/header syntax, silent typo correction,
  // local-part lowercasing, or recipient list. The user confirms this exact form.
  if (typeof value !== 'string' || value.length > 254 || value !== value.trim()
    || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(value)) return null;
  const [local, domain] = value.split('@');
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  return local + '@' + domain.toLowerCase();
}

export function smtpTransport(env, spawnProcess = spawn) {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  if (!required.every(k => env[k]?.trim()) || !recipientEmail(env.SMTP_FROM)) return null;
  const port = env.SMTP_PORT || '465';
  if (!/^[A-Za-z0-9.-]+$/.test(env.SMTP_HOST) || !/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535
    || !['true', 'false'].includes(env.SMTP_USE_SSL || 'true')) return null;
  const python = env.PYTHON_EXECUTABLE || (existsSync(resolve(root, '.venv/bin/python')) ? resolve(root, '.venv/bin/python') : 'python3');
  const childEnv = Object.fromEntries(['PATH', 'SSL_CERT_FILE', 'SSL_CERT_DIR', ...required, 'SMTP_PORT', 'SMTP_USE_SSL']
    .filter(k => env[k]).map(k => [k, env[k]]));
  return payload => new Promise(resolveResult => {
    let finished = false, output = '';
    const finish = value => { if (!finished) { finished = true; clearTimeout(timer); resolveResult(value); } };
    const child = spawnProcess(python, [resolve(root, 'backend/receipt_mailer.py')], { env: childEnv, stdio: ['pipe', 'pipe', 'ignore'] });
    const timer = setTimeout(() => { child.kill('SIGKILL'); finish('unknown'); }, 20000);
    child.once('error', () => finish('failed'));
    child.stdin.on('error', () => {});
    child.stdout.on('data', bytes => { output += bytes.toString(); if (output.length > 1024) { child.kill('SIGKILL'); finish('unknown'); } });
    child.once('close', () => {
      try { const v = JSON.parse(output); finish(['accepted', 'failed', 'unknown'].includes(v.status) ? v.status : 'unknown'); }
      catch { finish('unknown'); }
    });
    child.stdin.end(JSON.stringify(payload));
  });
}

export function createReceiptMail({ store, key, send, verifyPayment, now = Date.now }) {
  const configured = Boolean(store && key && send);
  const idFor = draft => createHmac('sha256', key).update(draft.projectId + ':' + draft.orderId).digest('hex');
  const snapshot = entry => !entry ? 'not_requested' : entry.value.status === 'sending' && now() - entry.value.updatedAt > 60000 ? 'unknown' : entry.value.status;
  let running, timer;
  async function read(draft) { return store.read(idFor(draft)); }
  async function observe(draft, paymentStatus) {
    if (!configured) return 'unavailable';
    try {
      let entry = await read(draft);
      if (!entry) return 'not_requested';
      if (paymentStatus === 'paid' && entry.value.status === 'waiting_payment') {
        await store.put(idFor(draft), { ...entry.value, status: 'queued', updatedAt: now() }, entry.generation);
        entry = await read(draft);
      }
      return snapshot(entry);
    } catch { return 'unknown'; }
  }
  return {
    configured,
    observe,
    async register(draft, email) {
      if (!configured) return { status: 'unavailable' };
      const address = recipientEmail(email);
      if (!address) return { status: 'invalid_recipient' };
      const id = idFor(draft);
      // Freeze a confirmed recipient for this draft; a retry cannot redirect a
      // paid receipt or create multiple deliveries by changing the address.
      let entry = await read(draft);
      if (!entry) {
        if ((await store.list()).length >= 1000) return { status: 'unavailable' };
        await store.put(id, { draft, email: address, status: 'waiting_payment', updatedAt: now(), nextCheck: now() }, null);
        entry = await read(draft);
      }
      return { status: entry.value.email === address ? snapshot(entry) : 'recipient_locked' };
    },
    tick() {
      if (!configured) return Promise.resolve();
      if (running) return running;
      running = (async () => {
        const ids = await store.list();
        for (const id of ids) {
          let entry;
          try { entry = await store.read(id); } catch { continue; }
          if (!entry || !['waiting_payment', 'queued'].includes(entry.value.status)) continue;
          let record = entry.value;
          if (now() - record.draft.createdAt > 86400000) {
            await store.put(id, { ...record, status: 'failed', updatedAt: now() }, entry.generation); continue;
          }
          if (record.status === 'waiting_payment') {
            if (record.nextCheck > now()) continue;
            // A CAS check lease prevents multiple workers polling the same
            // order. This code never creates a payment; it only reconciles it.
            if (!await store.put(id, { ...record, nextCheck: now() + 15000 }, entry.generation)) continue;
            const payment = await verifyPayment(record.draft).catch(() => 'unknown');
            if (payment === 'paid') await observe(record.draft, 'paid');
            else if (['expired', 'failed'].includes(payment)) {
              const latest = await store.read(id);
              if (latest?.value.status === 'waiting_payment') await store.put(id, { ...latest.value, status: 'failed', updatedAt: now() }, latest.generation);
            }
            entry = await store.read(id); record = entry.value;
          }
          if (record.status !== 'queued') continue;
          // Claim durably BEFORE contacting SMTP. A crash or uncertain SMTP
          // result becomes unknown and is never automatically resent.
          if (!await store.put(id, { ...record, status: 'sending', updatedAt: now() }, entry.generation)) continue;
          const claim = await store.read(id);
          const order = record.draft;
          const status = await send({ email: record.email, order: {
            orderId: order.orderId, subtotal: order.subtotal, shippingCost: order.shippingCost, amount: order.amount,
            items: order.items.map(item => ({ ...item, name: products.get(item.id)?.name || item.id })),
          } }).catch(() => 'unknown');
          await store.put(id, { ...claim.value, status: ['accepted', 'failed', 'unknown'].includes(status) ? status : 'unknown', updatedAt: now() }, claim.generation);
        }
      })().finally(() => { running = undefined; });
      return running;
    },
    start() {
      if (configured && !timer) { timer = setInterval(() => { void this.tick().catch(() => {}); }, 2000); timer.unref(); }
    },
    async close() { clearInterval(timer); timer = undefined; await running?.catch(() => {}); },
  };
}

export function configuredReceiptMail(env, signingKey, verifyPayment) {
  const disabled = () => createReceiptMail({});
  if (env.CHECKOUT_EMAIL_ENABLED !== 'true' || !signingKey) return disabled();
  const send = smtpTransport(env);
  if (!send) return disabled();
  const key = createHmac('sha256', signingKey).update('checkout-email-state-v1').digest();
  // Cloud Run's filesystem is ephemeral. A durable external bucket is required
  // there before claiming restart-safe duplicate suppression or queued mail.
  const store = env.CHECKOUT_EMAIL_BUCKET ? gcsMailStore(env.CHECKOUT_EMAIL_BUCKET, key)
    : !env.K_SERVICE ? fileMailStore(env.CHECKOUT_EMAIL_STATE_DIR || resolve(root, '.state/checkout-mail'), key) : null;
  return createReceiptMail({ store, key, send, verifyPayment });
}
