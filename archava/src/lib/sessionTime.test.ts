import assert from 'node:assert/strict';
import test from 'node:test';
import { remainingSessionSeconds } from './sessionTime.ts';

test('API expiry in Unix seconds preserves the full call and ends at its deadline', () => {
  const now = 1_791_000_000_000;
  assert.equal(remainingSessionSeconds(now / 1000 + 120, now), 120);
  assert.equal(remainingSessionSeconds(now / 1000 + 120, now + 119_001), 1);
  assert.equal(remainingSessionSeconds(now / 1000 + 120, now + 120_000), 0);
  assert.equal(remainingSessionSeconds(now / 1000 + 120, now + 130_000), 0);
});
