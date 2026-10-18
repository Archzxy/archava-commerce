// Production renderer regressions. Only public avatar assets are fetched;
// every voice-session request is intercepted, so no provider room is created.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, '.logs/avatar-browser');
const base = process.env.KALA_AVATAR_TEST_URL || 'http://localhost:5173';
const config = await (await fetch(`${base}/api/config`)).json();
assert.equal(config.avatarProvider, 'spatius');
assert.ok(config.spatiusAppId && config.spatiusAvatarId, 'Public avatar IDs are required');
await mkdir(output, { recursive: true });
const reports = [];

for (const mode of ['normal', 'cached-false', 'graphics-recovery', 'cancel-render', 'mic-wait', 'mic-denied', 'mic-cancel']) {
  const browser = await chromium.launch({
    headless: false,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/usr/bin/brave',
    args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  });
  let releaseAllocation;
  try {
    const context = await browser.newContext({ permissions: ['microphone'], viewport: { width: 1440, height: 900 } });
    await context.addInitScript(({ mode }) => {
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      window.__avatarMicCalls = 0;
      window.__avatarMicTracks = [];
      navigator.mediaDevices.getUserMedia = constraints => {
        window.__avatarMicCalls++;
        const acquire = async () => {
          const stream = await original(constraints);
          window.__avatarMicTracks.push(...stream.getTracks());
          return stream;
        };
        if (!mode.startsWith('mic-')) return acquire();
        return new Promise((resolveMic, rejectMic) => {
          window.__releaseAvatarMic = () => resolveMic(acquire());
          window.__denyAvatarMic = () => rejectMic(new DOMException('Fixture denied microphone', 'NotAllowedError'));
        });
      };
    }, { mode });
    if (['cached-false', 'graphics-recovery', 'cancel-render'].includes(mode)) {
      await context.addInitScript(({ mode }) => {
        const original = HTMLCanvasElement.prototype.getContext;
        window.__avatarGraphicsRecovered = mode === 'cached-false';
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          if (type === 'webgl2' && (!window.__avatarGraphicsRecovered || (mode === 'cached-false' && !this.isConnected))) return null;
          return Reflect.apply(original, this, [type, ...args]);
        };
        // Exercise the SDK's supported WebGL path without a WebGPU fallback.
        Object.defineProperty(navigator, 'gpu', { configurable: true, value: undefined });
      }, { mode });
    }
    const page = await context.newPage();
    const errors = [];
    let firstFrameAt, clickedAt, preloadedBeforeClick = false;
    let rendered = false, sessionRequests = 0, sockets = 0, connectedBeforeFrame = false, blankCanvas = false;
    page.on('pageerror', error => errors.push(error.message));
    page.on('websocket', () => sockets++);
    page.on('console', message => {
      if (message.text().includes('[AvatarView] Blank canvas:')) blankCanvas = true;
      if (!message.text().startsWith('[archava] avatar render: ')) return;
      const status = JSON.parse(message.text().slice('[archava] avatar render: '.length));
      if (status.status === 'rendered') { rendered = true; firstFrameAt ??= Date.now(); }
    });
    await page.route('**/api/config', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...config, sessionsEnabled: true, providerConfigured: true }) }));
    await page.route('**/api/session', async route => {
      sessionRequests++;
      if (!rendered) connectedBeforeFrame = true;
      await new Promise(resolveReady => { releaseAllocation = resolveReady; });
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Intercepted test session; no room created"}' }).catch(() => {});
    });
    await page.goto(`${base}/kategori`, { waitUntil: 'domcontentloaded' });
    if (mode === 'normal') {
      // No hover, click or permission request: public assets warm on idle.
      await page.waitForFunction(() => performance.getEntriesByName('archava-avatar-preloaded').length > 0, null, { timeout: 60_000 });
      assert.equal(await page.evaluate(() => window.__avatarMicCalls), 0);
      assert.equal(await page.locator('.spatius-avatar-canvas canvas').count(), 0);
      assert.equal(sessionRequests, 0);
      preloadedBeforeClick = true;
    }
    clickedAt = Date.now();
    await page.getByRole('button', { name: 'Tanya Ava', exact: true }).click();

    if (mode.startsWith('mic-')) {
      await page.waitForFunction(() => document.querySelector('.spatius-avatar-status') === null && document.querySelector('.spatius-avatar-canvas canvas') !== null, null, { timeout: 60_000 });
      assert.equal(rendered, true, 'The face must appear while microphone permission is still pending');
      assert.equal(await page.evaluate(() => window.__avatarMicCalls), 1);
      assert.equal(sessionRequests, 0, 'A rendered face alone must not allocate a room');
      if (mode === 'mic-wait') await page.evaluate(() => window.__releaseAvatarMic());
    }
    if (mode === 'mic-denied') {
      await page.evaluate(() => window.__denyAvatarMic());
      await page.getByText('Izinkan mikrofon di browser untuk ngobrol dengan Ava.', { exact: true }).waitFor();
      assert.equal(await page.locator('.spatius-avatar-canvas canvas').count(), 0);
      assert.equal(sessionRequests, 0);
      await page.getByRole('button', { name: 'Disconnect Ava', exact: true }).click();
    } else if (mode === 'mic-cancel') {
      await page.getByRole('button', { name: 'Disconnect Ava', exact: true }).click();
      await page.locator('.av-launcher').waitFor({ state: 'visible' });
      assert.equal(await page.locator('.spatius-avatar-canvas canvas').count(), 0);
      await page.evaluate(() => window.__releaseAvatarMic());
      await page.waitForFunction(() => window.__avatarMicTracks.length > 0 && window.__avatarMicTracks.every(track => track.readyState === 'ended'));
      assert.equal(sessionRequests, 0, 'Late permission after Disconnect must release the mic without starting a room');
    } else if (mode === 'cancel-render') {
      await page.locator('.spatius-avatar-canvas canvas').waitFor({ timeout: 60_000 });
      await page.getByRole('button', { name: 'Disconnect Ava', exact: true }).click();
      await page.locator('.av-launcher').waitFor({ state: 'visible' });
      assert.equal(sessionRequests, 0);
      assert.equal(await page.locator('.spatius-avatar-canvas canvas').count(), 0);
    } else {
      if (mode === 'graphics-recovery') {
        await page.getByRole('button', { name: 'Coba lagi', exact: true }).waitFor({ timeout: 60_000 });
        assert.equal(sessionRequests, 0, 'An unrenderable face must not allocate a room');
        assert.match(await page.locator('.av-connection-status').textContent(), /AV-R1: render_system/);
        await page.screenshot({ path: resolve(output, `${mode}-unavailable.png`) });
        await page.evaluate(() => { window.__avatarGraphicsRecovered = true; });
        await page.getByRole('button', { name: 'Coba lagi', exact: true }).click();
      }
      await page.waitForFunction(() => document.querySelector('.spatius-avatar-status') === null && document.querySelector('.spatius-avatar-canvas canvas') !== null, null, { timeout: 60_000 });
      // The intercepted API is deliberately still pending. The rendered face
      // and controls must already be usable, before a session response exists.
      const deadline = Date.now() + 5_000;
      while (!sessionRequests && Date.now() < deadline) await page.waitForTimeout(50);
      assert.equal(rendered, true);
      assert.equal(sessionRequests, 1);
      assert.equal(connectedBeforeFrame, false);
      assert.equal(await page.evaluate(() => window.__avatarMicTracks.every(track => track.readyState === 'ended')), true);
      assert.equal(await page.locator('.av-call-actions > button').count(), 3);
      assert.equal(await page.getByRole('button', { name: 'Aktifkan mikrofon', exact: true }).isDisabled(), true);
      const canvas = await page.locator('.spatius-avatar-canvas canvas').elementHandle();
      await page.getByRole('button', { name: 'Buka chat', exact: true }).click();
      await page.getByRole('button', { name: 'Tutup chat', exact: true }).click();
      assert.equal(await canvas.evaluate(node => node === document.querySelector('.spatius-avatar-canvas canvas')), true);
      // AvatarKit samples its own rendered canvas after 1 second. Allow that
      // check and viewport resize presentation to finish before inspecting it.
      await page.waitForTimeout(1_500);
      assert.equal(blankCanvas, false, 'The SDK reported a blank canvas after its first-frame callback');
      await page.screenshot({ path: resolve(output, `${mode}-rendered.png`) });
      await page.getByRole('button', { name: 'Disconnect Ava', exact: true }).click();
      await page.locator('.av-launcher').waitFor({ state: 'visible' });
      assert.equal(await page.locator('.spatius-avatar-canvas canvas').count(), 0);
      releaseAllocation();
      if (mode === 'normal') {
        // Reusing the loaded avatar after disposing a successful view is a
        // different lifecycle from minimize/reopen. Cover the next call too.
        rendered = false;
        blankCanvas = false;
        await page.getByRole('button', { name: 'Tanya Ava', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('.spatius-avatar-status') === null && document.querySelector('.spatius-avatar-canvas canvas') !== null, null, { timeout: 60_000 });
        const restartDeadline = Date.now() + 5_000;
        while (sessionRequests < 2 && Date.now() < restartDeadline) await page.waitForTimeout(50);
        assert.equal(sessionRequests, 2);
        assert.equal(rendered, true);
        assert.equal(connectedBeforeFrame, false);
        assert.equal(await canvas.evaluate(node => node === document.querySelector('.spatius-avatar-canvas canvas')), false);
        await page.waitForTimeout(1_500);
        assert.equal(blankCanvas, false);
        await page.screenshot({ path: resolve(output, 'normal-restarted.png') });
        await page.getByRole('button', { name: 'Disconnect Ava', exact: true }).click();
        await page.locator('.av-launcher').waitFor({ state: 'visible' });
        assert.equal(await page.locator('.spatius-avatar-canvas canvas').count(), 0);
        releaseAllocation();
      }
    }
    assert.equal(sockets, 0);
    assert.deepEqual(errors, []);
    reports.push({ mode, result: 'passed', rendered, preloadedBeforeClick, clickToFirstFrameHarnessMs: firstFrameAt ? firstFrameAt - clickedAt : null, restartAfterDisconnect: mode === 'normal', sessionRequests, providerRooms: 0, sockets, errors });
  } finally {
    releaseAllocation?.();
    await browser.close();
  }
}
await writeFile(resolve(output, 'report.json'), JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports, null, 2));
