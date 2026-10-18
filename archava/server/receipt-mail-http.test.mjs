// Entire checkout API → durable outbox → real Python SMTP helper → local TLS
// mail server. Never contacts Midtrans, an external SMTP host or a real inbox.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createServer as createTLSServer } from 'node:tls';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileMailStore } from './receipt-mail-store.mjs';
import { createReceiptMail, smtpTransport } from './receipt-mail.mjs';
import { createCheckout } from './checkout.mjs';
import { createApp } from './app.mjs';
import { runtimeConfig } from './config.mjs';

test('HTTP consent → simulated settlement → encrypted outbox → TLS SMTP accepted once across restart', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'receipt-smtp-'));
  t.after(() => rm(dir, { force: true, recursive: true }));
  const cert = join(dir, 'cert.pem'), privateKey = join(dir, 'key.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', privateKey, '-out', cert, '-days', '1', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'], { stdio: 'ignore' });
  const letters = [], sockets = new Set();
  const smtp = createTLSServer({ key: await readFile(privateKey), cert: await readFile(cert) }, socket => {
    sockets.add(socket); socket.on('close', () => sockets.delete(socket)); socket.on('error', () => {});
    socket.setEncoding('utf8'); socket.write('220 fixture ESMTP\r\n'); let buffer = '', data = false, message = '';
    socket.on('data', chunk => {
      buffer += chunk;
      while (buffer.includes('\r\n')) {
        const at = buffer.indexOf('\r\n'), line = buffer.slice(0, at); buffer = buffer.slice(at + 2);
        if (data) {
          if (line === '.') { letters.push(message); message = ''; data = false; socket.write('250 accepted\r\n'); }
          else message += line + '\r\n';
        } else if (/^EHLO/i.test(line)) socket.write('250-fixture\r\n250 AUTH PLAIN\r\n');
        else if (/^AUTH PLAIN/i.test(line)) socket.write('235 ok\r\n');
        else if (/^(MAIL|RCPT)/i.test(line)) socket.write('250 ok\r\n');
        else if (/^DATA/i.test(line)) { data = true; socket.write('354 continue\r\n'); }
        else if (/^QUIT/i.test(line)) socket.end('221 bye\r\n');
        else socket.write('250 ok\r\n');
      }
    });
  });
  await new Promise(done => smtp.listen(0, '127.0.0.1', done));
  t.after(async () => { for (const s of sockets) s.destroy(); await new Promise(done => smtp.close(done)); });
  const send = smtpTransport({ PATH: process.env.PATH, PYTHON_EXECUTABLE: 'python3', SSL_CERT_FILE: cert,
    SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtp.address().port), SMTP_USER: 'fixture', SMTP_PASS: 'offline-fixture', SMTP_FROM: 'store@example.test', SMTP_USE_SSL: 'true' });
  assert(send);
  const signingKey = Buffer.alloc(32, 8); let transaction, checkout, mail;
  const provider = {
    async status() { return transaction || null; },
    async charge(d) { return transaction = { order_id: d.orderId, gross_amount: String(d.amount), currency: 'IDR', payment_type: 'qris', transaction_id: '0d8178e1-c6c7-4ab4-81a6-893be9d924ab', transaction_status: 'pending' }; },
  };
  function restart() {
    mail = createReceiptMail({ store: fileMailStore(join(dir, 'spool'), signingKey), key: signingKey, send, verifyPayment: d => checkout.paymentStatus(d) });
    checkout = createCheckout({ projectId: 'http-email', signingKey, provider, mail });
  }
  restart();
  const origin = 'https://store.example.test';
  const proxy = { draft: b => checkout.draft(b), update: (...a) => checkout.update(...a), email: b => checkout.email(b) };
  const app = createServer(createApp({ config: runtimeConfig({ WEB_ORIGIN: origin }), sessions: {}, checkout: proxy }).handle);
  await new Promise(done => app.listen(0, '127.0.0.1', done));
  t.after(async () => { app.closeAllConnections(); await new Promise(done => app.close(done)); });
  const call = async (path, body, from = origin) => {
    const r = await fetch(`http://127.0.0.1:${app.address().port}/api/checkout/${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin: from }, body: JSON.stringify(body) });
    return { status: r.status, body: await r.json() };
  };
  const { body: draft } = await call('draft', { items: [{ id: 'headphones', quantity: 1 }], shipping: 'standard' });
  assert.equal((await call('email', { token: draft.token, email: 'buyer@example.test', consent: true }, 'https://foreign.example.test')).status, 403);
  const registered = await call('email', { token: draft.token, email: 'buyer@example.test', consent: true });
  assert.equal(registered.status, 200); assert.equal(registered.body.order.emailStatus, 'waiting_payment');
  assert(!JSON.stringify(registered.body).includes('buyer@example.test'));
  await mail.tick(); assert.equal(letters.length, 0);
  await call('confirm', { token: draft.token, confirmed: true }); transaction.transaction_status = 'settlement';
  assert.equal((await call('status', { token: draft.token })).body.order.emailStatus, 'queued');
  await mail.tick();
  assert.equal((await call('status', { token: draft.token })).body.order.emailStatus, 'accepted');
  assert.equal(letters.length, 1); assert.match(letters[0], /buyer@example.test/);
  assert.match(letters[0], /SIMULASI/); assert.match(letters[0], /Rp444\.000/);
  restart(); await mail.tick();
  assert.equal((await call('status', { token: draft.token })).body.order.emailStatus, 'accepted');
  assert.equal(letters.length, 1);
});
