import assert from 'node:assert/strict';
import test from 'node:test';
import { sessionStartupError } from './sessionStatus.ts';

test('startup failures persist for a guest who connects after the worker failed', () => {
  assert.match(sessionStartupError(JSON.stringify({ archavaSession: { status: 'failed', code: 'avatar_credits_exhausted' } })) || '', /Kredit/);
  for (const code of ['unexpected private error', '__proto__', 'constructor']) {
    const message = sessionStartupError(JSON.stringify({ archavaSession: { status: 'failed', code } }));
    assert.equal(typeof message, 'string');
    assert.doesNotMatch(message || '', /unexpected private error/);
  }
});

test('absent, malformed, and non-failure metadata does not end a call', () => {
  for (const metadata of [undefined, '', '{', 'null', '{}', '{"archavaSession":{"status":"ready"}}']) {
    assert.equal(sessionStartupError(metadata), null);
  }
});
