import test from 'node:test';
import assert from 'node:assert/strict';
import { observeAvatarRendering, waitForAvatarRenderer, type AvatarRenderStatus } from './avatarRendering.ts';

function setup(view = { renderSize: { width: 360, height: 360 }, _initStage: 'load_character', onFirstRendering: undefined as (() => void) | undefined }, timeoutMs = 500) {
  const controller = new AbortController();
  const statuses: AvatarRenderStatus[] = [], errors: string[] = [];
  let ready = false;
  observeAvatarRendering(view, { signal: controller.signal, timeoutMs, intervalMs: 5,
    onReady: () => { ready = true; }, onStatus: status => statuses.push(status), onError: message => errors.push(message) });
  return { view, controller, statuses, errors, get ready() { return ready; } };
}

test('RTC initialization waits for an independently rendered first frame', async () => {
  const controller = new AbortController();
  const view = { renderSize: { width: 360, height: 360 }, onFirstRendering: undefined as (() => void) | undefined };
  let rtcStarted = false;
  const startup = waitForAvatarRenderer(view, { signal: controller.signal, onStatus: () => {} })
    .then(() => { rtcStarted = true; });
  await Promise.resolve();
  assert.equal(rtcStarted, false);
  view.onFirstRendering?.();
  await startup;
  assert.equal(rtcStarted, true);
  controller.abort();
});

test('leaving rejects pending first-render startup before RTC can attach', async () => {
  const controller = new AbortController();
  const view = { renderSize: { width: 360, height: 360 }, onFirstRendering: undefined as (() => void) | undefined };
  const startup = waitForAvatarRenderer(view, { signal: controller.signal, onStatus: () => {} });
  controller.abort();
  await assert.rejects(startup, { name: 'AbortError' });
  assert.equal(view.onFirstRendering, undefined);
});

test('a stalled SDK reports its bounded stage instead of waiting indefinitely', async () => {
  const state = setup(undefined, 15);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(state.ready, false);
  assert.equal(state.statuses.at(-1)?.status, 'timeout');
  assert.equal(state.statuses.at(-1)?.stage, 'load_character');
  assert.match(state.errors[0], /AV-R1: load_character/);
  assert.equal(state.view.onFirstRendering, undefined);
});

test('diagnostics exclude arbitrary SDK messages and invalid canvas sizes', () => {
  const state = setup({ renderSize: { width: Infinity, height: -1 }, _initStage: 'secret-in-error', onFirstRendering: undefined });
  try {
    assert.deepEqual(state.statuses[0], { status: 'initializing', stage: 'unknown', width: 0, height: 0 });
    state.view.onFirstRendering?.();
    assert.equal(state.ready, false);
    assert.equal(state.statuses.at(-1)?.status, 'empty_surface');
    assert.match(state.errors[0], /AV-R2/);
  } finally { state.controller.abort(); }
});

test('leaving removes readiness callbacks and cancels timeout errors', async () => {
  const state = setup(undefined, 15);
  state.controller.abort();
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(state.view.onFirstRendering, undefined);
  assert.equal(state.ready, false);
  assert.deepEqual(state.errors, []);
  assert.equal(state.statuses.length, 1);
});
