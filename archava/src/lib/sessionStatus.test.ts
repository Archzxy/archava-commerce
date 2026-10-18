import assert from 'node:assert/strict';
import test from 'node:test';
import { sessionIsEnding, sessionStartupError } from './sessionStatus.ts';

test('startup failures persist for a guest who connects after the worker failed', () => {
  assert.match(sessionStartupError(JSON.stringify({ archavaSession: { status: 'failed', code: 'avatar_credits_exhausted' } })) || '', /Kredit/);
  for (const code of ['unexpected private error', '__proto__', 'constructor']) {
    const message = sessionStartupError(JSON.stringify({ archavaSession: { status: 'failed', code } }));
    assert.equal(typeof message, 'string');
    assert.doesNotMatch(message || '', /unexpected private error/);
  }
});

test('a server-owned farewell is distinct from a lost agent or startup failure', () => {
  const ending = JSON.stringify({ archavaSession: { status: 'ending' } });
  assert.equal(sessionIsEnding(ending), true);
  assert.equal(sessionStartupError(ending), null);
  for (const value of [undefined, '', 'null', '{', '{}', '{"archavaSession":{"status":"failed"}}']) assert.equal(sessionIsEnding(value), false);
});

test('absent, malformed, and non-failure metadata does not end a call', () => {
  for (const metadata of [undefined, '', '{', 'null', '{}', '{"archavaSession":{"status":"ready"}}']) {
    assert.equal(sessionStartupError(metadata), null);
  }
});
