import catalog from '../../config/catalog.json' with { type: 'json' };

export const ASSISTANT_ACTION_TOPIC = 'archava.assistant.action';
export const ASSISTANT_RESULT_TOPIC = 'archava.assistant.result';
export const ASSISTANT_STATE_TOPIC = 'archava.assistant.state';
export const ASSISTANT_CHANGE_EVENT = 'archava:shopping-state';
export const priorityLabels = { none: 'Belum ditentukan', battery: 'Baterai tahan lama', weight: 'Ringan', price: 'Harga terjangkau' };
export type Priority = keyof typeof priorityLabels;
export type Brief = { budget: number; useCase: string; priority: Priority; query: string; category: string };
export type CartItem = { id: string; quantity: number };
export type CartReceipt = { productId: string; before: number; after: number };
export type PendingCart = { requestId: string; productId: string; quantity: number; before: number; expiresAt: number };
export type ShoppingState = { brief: Brief; recommendationIds: string[]; pendingCart: PendingCart | null; undo: CartReceipt | null; notice: string; active: boolean; savedAt: number };
type Product = { id: string; name: string; brand: string; price: number; stock: number; specs: string[]; knowledge: { useCase: string; unknowns: string[] }; comparison?: { group: string; attributes: Record<string, string | number | boolean>; tradeoffs: string[] } };
export const assistantProducts = new Map<string, Product>((catalog.products as Product[]).map(product => [product.id, product]));
const emptyBrief = (): Brief => ({ budget: 0, useCase: '', priority: 'none', query: '', category: 'all' });
const summaryKey = 'kala-ava-summary';
const listeners = new Set<() => void>();
let state: ShoppingState = { brief: emptyBrief(), recommendationIds: [], pendingCart: null, undo: null, notice: '', active: false, savedAt: 0 };
const processed = new Map<string, Promise<ActionResult>>();
let sessionEpoch = 0;

declare global {
  interface Window {
    kalaCart?: {
      read: () => CartItem[];
      add: (productId: string, quantity: number, expectedBefore: number) => boolean;
      undo: (receipt: CartReceipt) => boolean;
    };
  }
}

const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const integer = (value: unknown, max = 100_000_000): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
const text = (value: unknown, max: number): value is string => typeof value === 'string' && value.length <= max && !/[\u0000-\u001f]/.test(value);
export function validBrief(value: unknown): value is Brief {
  return object(value) && Object.keys(value).sort().join(',') === 'budget,category,priority,query,useCase'
    && integer(value.budget) && text(value.useCase, 160) && text(value.query, 120)
    && typeof value.priority === 'string' && Object.hasOwn(priorityLabels, value.priority)
    && (value.category === 'all' || catalog.categories.some(category => category.name === value.category));
}
export function validRecommendationIds(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 3 && new Set(value).size === value.length && value.every(id => typeof id === 'string' && assistantProducts.has(id));
}
export function sameComparisonGroup(ids: string[]) {
  const group = assistantProducts.get(ids[0])?.comparison?.group;
  return ids.length >= 2 && ids.length <= 3 && Boolean(group) && ids.every(id => assistantProducts.get(id)?.comparison?.group === group);
}
export function readAssistantSummary() {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(summaryKey) || 'null');
    if (object(saved) && validBrief(saved.brief) && validRecommendationIds(saved.recommendationIds) && integer(saved.savedAt, Number.MAX_SAFE_INTEGER) && Date.now() >= saved.savedAt && Date.now() - saved.savedAt < 86_400_000) {
      state = { ...state, brief: saved.brief, recommendationIds: saved.recommendationIds, savedAt: saved.savedAt };
    }
  } catch { /* Browsers with disabled storage still retain state in memory. */ }
}
if (typeof window !== 'undefined') readAssistantSummary();

export const getShoppingState = () => state;
export const subscribeShoppingState = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
function saveSummary() {
  try { sessionStorage.setItem(summaryKey, JSON.stringify({ brief: state.brief, recommendationIds: state.recommendationIds, savedAt: state.savedAt })); } catch { /* In-memory summary remains available. */ }
}
function update(change: Partial<ShoppingState>) {
  state = { ...state, ...change };
  for (const listener of listeners) listener();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ASSISTANT_CHANGE_EVENT));
}
export function setShoppingBrief(brief: Brief) {
  if (!validBrief(brief)) return false;
  if (JSON.stringify(brief) === JSON.stringify(state.brief)) return true;
  // A corrected constraint invalidates the old shortlist and any pending purchase.
  update({ brief: { ...brief }, recommendationIds: [], pendingCart: null, notice: '', ...(!state.active ? { savedAt: Date.now() } : {}) });
  if (!state.active) saveSummary();
  return true;
}
export function beginShoppingSession() { sessionEpoch++; processed.clear(); update({ active: true, pendingCart: null, undo: null, notice: '' }); }
export function endShoppingSession() { sessionEpoch++; update({ active: false, pendingCart: null, savedAt: Date.now() }); saveSummary(); }
export function clearShoppingSummary() { update({ brief: emptyBrief(), recommendationIds: [], pendingCart: null, undo: null, savedAt: 0, notice: '' }); try { sessionStorage.removeItem(summaryKey); } catch { /* Optional persistence. */ } }
export function assistantSnapshot(revision: number) {
  return { revision, brief: state.brief, recommendationIds: state.recommendationIds, pendingCart: state.pendingCart ? { requestId: state.pendingCart.requestId, productId: state.pendingCart.productId, quantity: state.pendingCart.quantity, expiresAt: state.pendingCart.expiresAt } : null, cart: window.kalaCart?.read() || [], undoAvailable: Boolean(state.undo) };
}

export function recommendationFacts(productId: string, brief = state.brief) {
  const product = assistantProducts.get(productId)!;
  const facts: string[] = [];
  if (brief.budget) facts.push(product.price <= brief.budget ? 'Dalam budgetmu' : 'Di atas budget terbaru');
  const attributes = product.comparison?.attributes || {};
  if (brief.priority === 'battery') {
    if (typeof attributes.batteryHours === 'number') facts.push(`Baterai hingga ${attributes.batteryHours} jam`);
    else if (typeof attributes.batteryDays === 'number') facts.push(`Baterai hingga ${attributes.batteryDays} hari`);
  }
  if (brief.priority === 'weight') {
    if (typeof attributes.weightG === 'number') facts.push(`Berat ${attributes.weightG} g`);
    else if (typeof attributes.weightKg === 'number') facts.push(`Berat ${attributes.weightKg} kg`);
  }
  if (facts.length < 2) facts.push(...product.specs.slice(0, 2 - facts.length));
  return { facts, useCase: product.knowledge.useCase, tradeoff: product.comparison?.tradeoffs[0] || product.knowledge.unknowns[0] || 'Informasi ini berasal dari katalog demo.' };
}

export type AssistantCommand = { requestId: string; action: string; payload: Record<string, unknown> };
export type ActionResult = { requestId: string; status: 'applied' | 'pending_confirmation' | 'cancelled' | 'rejected'; code: string };
const fields: Record<string, string[]> = {
  update_brief: ['brief'], filter_catalog: ['query', 'category', 'minPrice', 'maxPrice', 'sort'],
  focus_product: ['productId', 'field'], recommend_products: ['productIds'],
  request_cart: ['productId', 'quantity'], commit_cart: ['pendingRequestId'], cancel_cart: [], undo_cart: [],
};
export function parseAssistantCommand(data: Uint8Array): AssistantCommand | null {
  if (data.byteLength > 4096) return null;
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(data));
    if (!object(value) || Object.keys(value).sort().join(',') !== 'action,payload,requestId' || !text(value.requestId, 64) || !/^[a-zA-Z0-9-]{8,64}$/.test(value.requestId) || typeof value.action !== 'string' || !Object.hasOwn(fields, value.action) || !object(value.payload)) return null;
    const p = value.payload;
    if (Object.keys(p).sort().join(',') !== [...fields[value.action]].sort().join(',')) return null;
    if (value.action === 'update_brief' && !validBrief(p.brief)) return null;
    if (value.action === 'filter_catalog' && (!text(p.query, 120) || !(p.category === 'all' || catalog.categories.some(c => c.name === p.category)) || !integer(p.minPrice) || !integer(p.maxPrice) || Boolean(p.maxPrice && p.minPrice > p.maxPrice) || !['popular', 'price-asc', 'price-desc', 'rating', 'newest'].includes(String(p.sort)))) return null;
    if (value.action === 'focus_product' && (!assistantProducts.has(String(p.productId)) || !text(p.field, 40) || (p.field !== 'product' && p.field !== 'price' && !Object.hasOwn(assistantProducts.get(String(p.productId))?.comparison?.attributes || {}, p.field)))) return null;
    if (value.action === 'recommend_products' && (!validRecommendationIds(p.productIds) || !p.productIds.length)) return null;
    if (value.action === 'request_cart' && (!assistantProducts.has(String(p.productId)) || !integer(p.quantity, 10) || p.quantity < 1)) return null;
    if (value.action === 'commit_cart' && (!text(p.pendingRequestId, 64) || !/^[a-zA-Z0-9-]{8,64}$/.test(p.pendingRequestId))) return null;
    return value as AssistantCommand;
  } catch { return null; }
}

export function filterTarget(payload: Record<string, unknown>) {
  const category = catalog.categories.find(item => item.name === payload.category);
  const query = new URLSearchParams();
  if (payload.query) query.set('q', String(payload.query));
  if (payload.minPrice) query.set('min', String(payload.minPrice));
  if (payload.maxPrice) query.set('max', String(payload.maxPrice));
  if (payload.sort !== 'popular') query.set('sort', String(payload.sort));
  return `${category ? `/kategori/${category.slug}` : '/produk'}${query.size ? `?${query}` : ''}`;
}
export function cancelPendingCart() { update({ pendingCart: null, notice: 'Permintaan keranjang dibatalkan.' }); }
export function confirmPendingCart(now = Date.now()) {
  const pending = state.pendingCart;
  if (!pending) return 'no_pending_cart';
  if (!state.active || pending.expiresAt <= now) { update({ pendingCart: null, notice: 'Konfirmasi kedaluwarsa. Minta Ava menyiapkan ulang.' }); return 'expired'; }
  if (!window.kalaCart?.add(pending.productId, pending.quantity, pending.before)) { update({ pendingCart: null, notice: 'Keranjang berubah atau jumlah melewati batas. Minta Ava menyiapkan ulang.' }); return 'cart_changed'; }
  update({ pendingCart: null, undo: { productId: pending.productId, before: pending.before, after: pending.before + pending.quantity }, notice: `${pending.quantity} ${assistantProducts.get(pending.productId)!.name} ditambahkan ke keranjang demo.` });
  return 'cart_added';
}
export function undoAssistantCart() {
  if (!state.undo) return 'nothing_to_undo';
  if (!window.kalaCart?.undo(state.undo)) { update({ undo: null, notice: 'Jumlah barang sudah berubah. Undo tidak diterapkan.' }); return 'cart_changed'; }
  update({ undo: null, notice: 'Penambahan terakhir oleh Ava dibatalkan.' });
  return 'cart_undone';
}

async function perform(command: AssistantCommand): Promise<ActionResult> {
  const { requestId, action, payload: p } = command;
  const result = (status: ActionResult['status'], code: string): ActionResult => ({ requestId, status, code });
  if (!state.active) return result('rejected', 'session_inactive');
  const epoch = sessionEpoch;
  if (action === 'update_brief') { setShoppingBrief(p.brief as Brief); return result('applied', 'brief_updated'); }
  if (action === 'filter_catalog') {
    if (!window.kalaNavigate || !await window.kalaNavigate(filterTarget(p))) return result('rejected', 'navigation_failed');
    if (epoch !== sessionEpoch || !state.active) return result('rejected', 'session_inactive');
    setShoppingBrief({ ...state.brief, query: p.query as string, category: p.category as string, budget: p.maxPrice as number });
    window.dispatchEvent(new Event('archava:show-page'));
    return result('applied', 'filters_applied');
  }
  if (action === 'recommend_products') {
    const ids = p.productIds as string[];
    if (ids.some(id => state.brief.budget && assistantProducts.get(id)!.price > state.brief.budget)) return result('rejected', 'over_budget');
    update({ recommendationIds: [...ids], notice: '' });
    window.dispatchEvent(new Event('archava:show-shopping'));
    return result('applied', 'recommendations_shown');
  }
  if (action === 'focus_product') {
    const id = p.productId as string, field = p.field as string;
    let element = field === 'product' ? document.querySelector<HTMLElement>(`#mainContent [data-card-id="${id}"]`) : document.querySelector<HTMLElement>(`#mainContent [data-ava-field="${field}"][data-ava-product="${id}"]`);
    if (!element) {
      if (!window.kalaNavigate || !await window.kalaNavigate(`/produk/${id}`)) return result('rejected', 'navigation_failed');
      if (epoch !== sessionEpoch || !state.active) return result('rejected', 'session_inactive');
      element = document.querySelector<HTMLElement>(field === 'product' ? '[data-ava-detail]' : `[data-ava-field="${field}"][data-ava-product="${id}"]`);
    }
    if (!element) return result('rejected', 'target_missing');
    if (field !== 'product' && field !== 'price') document.querySelector<HTMLButtonElement>('[data-product-tab="specifications"]')?.click();
    document.querySelectorAll('.ava-highlight').forEach(item => item.classList.remove('ava-highlight'));
    element.closest('tr')?.removeAttribute('hidden');
    element.classList.add('ava-highlight');
    element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center', inline: 'center' });
    window.dispatchEvent(new Event('archava:show-page'));
    window.setTimeout(() => element?.classList.remove('ava-highlight'), 7000);
    return result('applied', 'product_focused');
  }
  if (action === 'request_cart') {
    if (!window.kalaCart) return result('rejected', 'cart_unavailable');
    const productId = p.productId as string, quantity = p.quantity as number;
    const before = window.kalaCart.read().find(item => item.id === productId)?.quantity || 0;
    if (before + quantity > Math.min(10, assistantProducts.get(productId)!.stock)) return result('rejected', 'quantity_limit');
    update({ pendingCart: { requestId, productId, quantity, before, expiresAt: Date.now() + 120_000 }, notice: '' });
    window.dispatchEvent(new Event('archava:show-shopping'));
    return result('pending_confirmation', 'confirm_cart');
  }
  if (action === 'commit_cart') {
    if (state.pendingCart?.requestId !== p.pendingRequestId) return result('rejected', 'stale_confirmation');
    const code = confirmPendingCart();
    return result(code === 'cart_added' ? 'applied' : 'rejected', code);
  }
  if (action === 'cancel_cart') { cancelPendingCart(); return result('cancelled', 'cart_cancelled'); }
  const code = undoAssistantCart();
  return result(code === 'cart_undone' ? 'applied' : 'rejected', code);
}
export function executeAssistantCommand(command: AssistantCommand): Promise<ActionResult> {
  // Revalidate internal callers, and make retransmission unable to add twice.
  if (!parseAssistantCommand(new TextEncoder().encode(JSON.stringify(command)))) return Promise.resolve({ requestId: command.requestId, status: 'rejected', code: 'invalid_command' });
  if (processed.has(command.requestId)) return processed.get(command.requestId)!;
  if (processed.size >= 256) return Promise.resolve({ requestId: command.requestId, status: 'rejected', code: 'action_limit' });
  const pending = perform(command).catch((): ActionResult => ({ requestId: command.requestId, status: 'rejected', code: 'action_failed' }));
  processed.set(command.requestId, pending);
  return pending;
}
