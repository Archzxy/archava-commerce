import assert from 'node:assert/strict';
import test from 'node:test';
import { beginShoppingSession, clearShoppingSummary, confirmPendingCart, endShoppingSession, executeAssistantCommand, filterTarget, getShoppingState, parseAssistantCommand, readAssistantSummary, recommendationFacts, setShoppingBrief, undoAssistantCart, type AssistantCommand, type CartItem } from './assistant.ts';
import { createAssistantChannel } from './assistantChannel.ts';

let cart: CartItem[] = [];
const storage = new Map<string, string>();
let additions = 0;
const fakeWindow = {
  dispatchEvent: () => true,
  kalaCart: {
    read: () => cart.map(item => ({ ...item })),
    add: (id: string, count: number, expected: number) => {
      const current = cart.find(item => item.id === id);
      if ((current?.quantity || 0) !== expected) return false;
      additions++;
      if (current) current.quantity += count; else cart.push({ id, quantity: count });
      return true;
    },
    undo: ({ productId, before, after }: { productId: string; before: number; after: number }) => {
      const item = cart.find(entry => entry.id === productId);
      if (!item || item.quantity !== after) return false;
      if (before) item.quantity = before; else cart = cart.filter(entry => entry.id !== productId);
      return true;
    },
  },
};
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: { getItem: (key: string) => storage.get(key) || null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) }, configurable: true });
const command = (action: string, payload: Record<string, unknown> = {}, requestId = crypto.randomUUID()): AssistantCommand => ({ requestId, action, payload });
function reset() { cart = []; additions = 0; clearShoppingSummary(); beginShoppingSession(); }

test('commands reject arbitrary URLs, unknown fields, invalid IDs and malformed quantities', () => {
  const samples = [command('navigate', { url: 'https://elsewhere.test' }), command('request_cart', { productId: 'headphones', quantity: true }), command('request_cart', { productId: 'headphones', quantity: 0 }), command('request_cart', { productId: 'headphones', quantity: 11 }), command('request_cart', { productId: 'missing', quantity: 1 }), command('focus_product', { productId: 'headphones', field: 'password' }), command('commit_cart', { pendingRequestId: 'x' }), command('undo_cart', { extra: 'anything' }), command('__proto__', {})];
  for (const value of samples) assert.equal(parseAssistantCommand(new TextEncoder().encode(JSON.stringify(value))), null);
  assert.equal(parseAssistantCommand(new Uint8Array(4097)), null);
});

test('request does not mutate cart; confirmed retransmission cannot add twice; undo preserves other items', async () => {
  reset();
  cart = [{ id: 'ritme-lite', quantity: 2 }];
  const proposal = command('request_cart', { productId: 'headphones', quantity: 2 });
  assert.equal((await executeAssistantCommand(proposal)).status, 'pending_confirmation');
  assert.deepEqual(cart, [{ id: 'ritme-lite', quantity: 2 }]);
  const commit = command('commit_cart', { pendingRequestId: proposal.requestId });
  assert.equal((await executeAssistantCommand(commit)).code, 'cart_added');
  await executeAssistantCommand(commit);
  await executeAssistantCommand(proposal);
  assert.equal(additions, 1);
  assert.equal(getShoppingState().pendingCart, null);
  assert.equal(undoAssistantCart(), 'cart_undone');
  assert.deepEqual(cart, [{ id: 'ritme-lite', quantity: 2 }]);
});

test('confirmation refuses replaced proposals, expiry, manual changes and ended sessions', async () => {
  reset();
  const first = command('request_cart', { productId: 'headphones', quantity: 1 });
  await executeAssistantCommand(first);
  await executeAssistantCommand(command('request_cart', { productId: 'ritme-lite', quantity: 1 }));
  assert.equal((await executeAssistantCommand(command('commit_cart', { pendingRequestId: first.requestId }))).code, 'stale_confirmation');
  assert.equal(confirmPendingCart(Date.now() + 120_001), 'expired');
  await executeAssistantCommand(command('request_cart', { productId: 'headphones', quantity: 1 }));
  cart = [{ id: 'headphones', quantity: 3 }];
  assert.equal(confirmPendingCart(), 'cart_changed');
  await executeAssistantCommand(command('request_cart', { productId: 'ritme-lite', quantity: 1 }));
  endShoppingSession();
  assert.equal(getShoppingState().pendingCart, null);
  assert.equal((await executeAssistantCommand(command('request_cart', { productId: 'headphones', quantity: 1 }))).code, 'session_inactive');
  assert.equal(additions, 0);
});

test('undo refuses to overwrite a manual edit to the same item', async () => {
  reset();
  await executeAssistantCommand(command('request_cart', { productId: 'headphones', quantity: 1 }));
  assert.equal(confirmPendingCart(), 'cart_added');
  cart[0].quantity = 2;
  assert.equal(undoAssistantCart(), 'cart_changed');
  assert.equal(cart[0].quantity, 2);
});

test('corrected needs invalidate the old shortlist and pending cart, and reject over-budget cards', async () => {
  reset();
  setShoppingBrief({ budget: 500000, useCase: 'Kerja', priority: 'battery', query: 'headphone', category: 'Elektronik' });
  assert.equal((await executeAssistantCommand(command('recommend_products', { productIds: ['headphones', 'ritme-lite'] }))).status, 'applied');
  await executeAssistantCommand(command('request_cart', { productId: 'headphones', quantity: 1 }));
  setShoppingBrief({ ...getShoppingState().brief, budget: 400000 });
  assert.deepEqual(getShoppingState().recommendationIds, []);
  assert.equal(getShoppingState().pendingCart, null);
  assert.equal((await executeAssistantCommand(command('recommend_products', { productIds: ['headphones'] }))).code, 'over_budget');
  assert.ok(recommendationFacts('headphones', { ...getShoppingState().brief, budget: 500000 }).facts.includes('Baterai hingga 30 jam'));
});

test('summary persists only brief and IDs, restores after reload, and excludes pending/receipts/transcripts', async () => {
  reset();
  setShoppingBrief({ budget: 500000, useCase: 'Kerja', priority: 'battery', query: 'headphone', category: 'all' });
  await executeAssistantCommand(command('recommend_products', { productIds: ['headphones', 'ritme-lite'] }));
  await executeAssistantCommand(command('request_cart', { productId: 'headphones', quantity: 1 }));
  endShoppingSession();
  const saved = storage.get('kala-ava-summary')!;
  assert.deepEqual(Object.keys(JSON.parse(saved)).sort(), ['brief', 'recommendationIds', 'savedAt']);
  beginShoppingSession(); setShoppingBrief({ ...getShoppingState().brief, budget: 0 });
  readAssistantSummary();
  assert.equal(getShoppingState().brief.budget, 500000);
  assert.deepEqual(getShoppingState().recommendationIds, ['headphones', 'ritme-lite']);
  assert.equal(getShoppingState().pendingCart, null);
});

test('voice filters generate bounded routes and failed navigation does not change needs', async () => {
  reset();
  assert.equal(filterTarget({ query: 'headphone & mic', category: 'Elektronik', minPrice: 100000, maxPrice: 500000, sort: 'price-asc' }), '/kategori/elektronik?q=headphone+%26+mic&min=100000&max=500000&sort=price-asc');
  const p = { query: 'headphone', category: 'all', minPrice: 0, maxPrice: 500000, sort: 'price-asc' };
  Object.assign(fakeWindow, { kalaNavigate: async () => false });
  assert.equal((await executeAssistantCommand(command('filter_catalog', p))).code, 'navigation_failed');
  assert.equal(getShoppingState().brief.budget, 0);
  Object.assign(fakeWindow, { kalaNavigate: async () => true });
  assert.equal((await executeAssistantCommand(command('filter_catalog', p))).code, 'filters_applied');
  assert.equal(getShoppingState().brief.budget, 500000);
});

test('an in-flight navigation cannot overwrite a later session', async () => {
  reset();
  let resolveNavigation!: (value: boolean) => void;
  Object.assign(fakeWindow, { kalaNavigate: () => new Promise<boolean>(resolve => { resolveNavigation = resolve; }) });
  const pending = executeAssistantCommand(command('filter_catalog', { query: 'headphone', category: 'all', minPrice: 0, maxPrice: 500000, sort: 'popular' }));
  endShoppingSession(); beginShoppingSession();
  resolveNavigation(true);
  assert.equal((await pending).code, 'session_inactive');
  assert.equal(getShoppingState().brief.budget, 0);
});

test('browser channel binds actions to the voice agent and receipts carry the resulting state', async () => {
  reset();
  const receipts: { data: Record<string, unknown>; topic: string }[] = [];
  const channel = createAssistantChannel(async (data, topic) => { receipts.push({ data: JSON.parse(new TextDecoder().decode(data)), topic }); }, 'voice-agent');
  const packet = new TextEncoder().encode(JSON.stringify(command('request_cart', { productId: 'headphones', quantity: 1 })));
  assert.equal(await channel.receive(packet, 'avatar-renderer', 'archava.assistant.action'), false);
  assert.equal(receipts.length, 0);
  assert.equal(await channel.receive(packet, 'voice-agent', 'archava.assistant.action'), true);
  assert.equal(receipts[0].data.status, 'pending_confirmation');
  assert.equal((receipts[0].data.state as { pendingCart: unknown }).pendingCart !== null, true);
  assert.equal(receipts[0].topic, 'archava.assistant.result');
  channel.dispose();
  assert.equal(await channel.receive(packet, 'voice-agent', 'archava.assistant.action'), false);
});
