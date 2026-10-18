// Offline browser integration: real UI + API, synthetic provider, no voice/payment calls.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../archava/server/app.mjs';
import { runtimeConfig } from '../archava/server/config.mjs';
import { checkoutSigningKey, createCheckout } from '../archava/server/checkout.mjs';
import { createReceiptMail } from '../archava/server/receipt-mail.mjs';
import { fileMailStore } from '../archava/server/receipt-mail-store.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, '.logs/checkout-browser');
await mkdir(output, { recursive: true });
const mailState = await mkdtemp(resolve(tmpdir(), 'dopamine-email-browser-'));
const portProbe = createServer();
await new Promise(done => portProbe.listen(0, '127.0.0.1', done));
const port = portProbe.address().port;
await new Promise(done => portProbe.close(done));
const base = `http://127.0.0.1:${port}`;
let active, transaction, charges = 0;
const key = checkoutSigningKey({ CHECKOUT_SIGNING_KEY: 'offline-browser-fixture' });
const provider = {
  async status() { return transaction || null; },
  async charge(draft) { charges++; return transaction = { order_id: draft.orderId, gross_amount: String(draft.amount), currency: 'IDR', payment_type: 'qris', transaction_id: '0d8178e1-c6c7-4ab4-81a6-893be9d924ab', transaction_status: 'pending' }; },
};
const sessions = { start() { throw new Error('No voice calls allowed in offline QA'); } };
const checkout = { draft: body => active.draft(body), update: (...args) => active.update(...args), email: body => active.email(body) };
const api = createServer(createApp({ config: runtimeConfig({ WEB_ORIGIN: base }), sessions, checkout }).handle);
await new Promise(done => api.listen(0, '127.0.0.1', done));
const server = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), ARCHAVA_API_PORT: String(api.address().port) }, stdio: 'ignore' });
let browser;
const report = { mode: 'offline synthetic provider; no Midtrans/voice calls', checks: [] };
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* wait for own server */ }
    if (i > 60) throw new Error('Fixture web server did not start');
    await new Promise(done => setTimeout(done, 100));
  }
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/usr/bin/brave', args: ['--no-sandbox'] });
  for (const width of [1440, 390, 320]) {
    transaction = null;
    active = createCheckout({ projectId: 'kala-archava', signingKey: key });
    const context = await browser.newContext({ viewport: { width, height: 950 } });
    const page = await context.newPage();
    const errors = [], requestFields = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', req => { if (req.url().includes('/api/checkout/')) requestFields.push({ path: new URL(req.url()).pathname, fields: Object.keys(req.postDataJSON()).sort() }); });
    // This fixture image is deliberately not a QR; the product never generates a fake payment code.
    await page.route('https://api.sandbox.midtrans.com/**', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="20" y="100" font-size="16">QA fixture — no QR</text></svg>' }));
    await page.goto(base + '/checkout', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.setItem('kala-cart', JSON.stringify([{ id: 'headphones', quantity: 1 }])));
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.av-launcher').waitFor();
    await page.locator('input[name="recipient"]').fill('Contoh penerima demo');
    const open = () => page.getByRole('button', { name: 'Checkout QRIS sandbox', exact: true }).click();
    await open();
    await page.getByRole('heading', { name: 'QRIS belum aktif', exact: true }).waitFor();
    assert.equal(await page.locator('.av-checkout-qr').count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Konfirmasi & buat QR sandbox', exact: true }).count(), 0);
    assert.equal(await page.locator('input[name="recipient"]').inputValue(), 'Contoh penerima demo');
    const bounds = await page.locator('.av-checkout').boundingBox();
    assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: resolve(output, `unavailable-${width}.png`) });
    await page.getByRole('button', { name: 'Tutup checkout demo', exact: true }).click();
    const sent = [];
    const mail = createReceiptMail({ store: fileMailStore(resolve(mailState, String(width)), key), key,
      send: async payload => { sent.push(payload); return 'accepted'; }, verifyPayment: d => active.paymentStatus(d) });
    active = createCheckout({ projectId: 'kala-archava', signingKey: key, provider, mail });
    await open();
    await page.getByRole('heading', { name: 'Cek pilihanmu dulu', exact: true }).waitFor();
    const saveEmail = page.getByRole('button', { name: 'Simpan email bukti simulasi', exact: true });
    assert.equal(await saveEmail.isDisabled(), true);
    await page.getByLabel('Email bukti pembayaran (opsional)', { exact: true }).fill('browser-buyer@example.test');
    await page.getByRole('checkbox', { name: /Saya konfirmasi alamat/ }).check();
    await page.screenshot({ path: resolve(output, `email-form-${width}.png`) });
    await saveEmail.click();
    await page.getByText('Email tersimpan. Bukti simulasi dikirim setelah pembayaran terverifikasi.', { exact: true }).waitFor();
    await mail.tick(); assert.equal(sent.length, 0);
    const before = charges;
    await page.getByRole('button', { name: 'Konfirmasi & buat QR sandbox', exact: true }).click();
    await page.getByRole('heading', { name: 'QR sandbox siap diuji', exact: true }).waitFor();
    assert.equal(charges, before + 1);
    assert.match(await page.locator('.av-checkout-warning').textContent(), /Jangan scan/);
    assert.match(await page.getByRole('link', { name: /Buka simulator/ }).getAttribute('href'), /\/v2\/qris\/index$/);
    await page.screenshot({ path: resolve(output, `email-pending-${width}.png`) });
    const firstOrder = await page.locator('.av-checkout-id').textContent();
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.av-launcher').waitFor();
    await open();
    await page.getByRole('heading', { name: 'QR sandbox siap diuji', exact: true }).waitFor();
    assert.equal(await page.locator('.av-checkout-id').textContent(), firstOrder);
    assert.equal(charges, before + 1, 'reload must reconcile, not charge again');
    transaction.transaction_status = 'settlement';
    await page.getByRole('button', { name: 'Cek status Midtrans', exact: true }).click();
    await page.getByRole('heading', { name: 'Pembayaran simulasi berhasil', exact: true }).waitFor();
    assert.match(await page.locator('.av-checkout-success').textContent(), /Tidak ada pesanan atau pengiriman nyata/);
    await mail.tick(); assert.equal(sent.length, 1);
    await page.getByText('Server email menerima bukti simulasi. Periksa inbox atau folder spam.', { exact: true }).waitFor({ timeout: 12000 });
    await mail.tick(); assert.equal(sent.length, 1);
    assert.equal(sent[0].email, 'browser-buyer@example.test');
    assert.equal(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }).includes('browser-buyer@example.test')), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: resolve(output, `email-accepted-${width}.png`) });
    assert.equal(charges, before + 1);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('kala-cart'))[0].quantity), 1);
    assert(requestFields.every(({path, fields}) => !fields.some(field => ['recipient', 'address', 'phone', 'amount', 'status'].includes(field)) && (!fields.includes('email') || path === '/api/checkout/email')));
    assert.deepEqual(errors, []);
    report.checks.push({ width, unavailable: true, preview: true, pending: true, paid: true, restartSameOrder: true, noPrivateFormFields: true, emailConsent: true, emailAfterSettlementOnly: true, emailAcceptedOnce: true, noEmailInBrowserStorage: true, noJsErrors: true });
    await context.close();
  }
  report.result = 'passed';
} catch (error) { report.result = 'failed'; report.error = error.message; throw error; }
finally {
  await browser?.close();
  server.kill('SIGTERM');
  await new Promise(done => { api.close(done); api.closeAllConnections(); });
  await rm(mailState, { recursive: true, force: true });
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
