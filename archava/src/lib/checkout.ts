import { apiUrl } from './session';
import { cartFingerprint, type CheckoutAction } from './checkoutProtocol';

export type PaymentStatus = 'preview' | 'unavailable' | 'pending' | 'paid' | 'expired' | 'failed' | 'unknown';
export type EmailStatus = 'unavailable' | 'not_requested' | 'waiting_payment' | 'queued' | 'sending' | 'accepted' | 'failed' | 'unknown';
export interface CheckoutOrder {
  orderId: string; items: { id: string; quantity: number; price: number }[];
  shipping: 'standard' | 'express'; subtotal: number; shippingCost: number; amount: number;
  status: PaymentStatus; createdAt: number; expiresAt: number; observedAt: number; configured: boolean; emailStatus?: EmailStatus;
}
type Response = { order: CheckoutOrder; receipt: string; token?: string; qrUrl?: string; emailConfigured?: boolean };
type State = { visible: boolean; busy: boolean; error: string; order: CheckoutOrder | null; receipt: string | null; qrUrl: string; emailConfigured: boolean };
let state: State = { visible: false, busy: false, error: '', order: null, receipt: null, qrUrl: '', emailConfigured: false };
let token = '';
let fingerprint = '';
let restoredOrderId = '';
const key = 'kala-checkout-sandbox';
const listeners = new Set<() => void>();
export const getCheckout = () => state;
export const subscribeCheckout = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const update = (change: Partial<State>) => { state = { ...state, ...change }; listeners.forEach(fn => fn()); window.dispatchEvent(new Event('archava:checkout-state')); };
export const hideCheckout = () => update({ visible: false });
const cart = () => window.kalaCart?.read() || [];
function save() {
  try { sessionStorage.setItem(key, JSON.stringify({ token, fingerprint, orderId: state.order?.orderId || restoredOrderId, savedAt: Date.now() })); } catch { /* Memory works without storage. */ }
}
export function restoreCheckout() {
  try {
    const v = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (v && typeof v.token === 'string' && v.token.length < 3500 && typeof v.fingerprint === 'string' && v.fingerprint.length < 2000 && /^DOPA-SBX-[a-f0-9-]{36}$/.test(v.orderId) && Number.isSafeInteger(v.savedAt) && Date.now() >= v.savedAt && Date.now() - v.savedAt < 86400000) {
      token = v.token; fingerprint = v.fingerprint; restoredOrderId = v.orderId;
    }
  } catch { /* Never restore recipient forms or unverified payment status. */ }
}
async function request(path: string, body: unknown) {
  const response = await fetch(apiUrl('/api/checkout/' + path), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  const value = await response.json();
  if (!response.ok) throw new Error(value?.error || 'Checkout belum berhasil. Coba lagi.');
  const data = value as Response;
  if (!data.order || typeof data.receipt !== 'string' || !['preview', 'unavailable', 'pending', 'paid', 'expired', 'failed', 'unknown'].includes(data.order.status)) throw new Error('Status checkout belum bisa diverifikasi.');
  if (data.token) token = data.token;
  restoredOrderId = data.order.orderId;
  update({ order: data.order, receipt: data.receipt, emailConfigured: data.emailConfigured === true, qrUrl: typeof data.qrUrl === 'string' && /^https:\/\/api\.sandbox\.midtrans\.com\/v2\/qris\/[a-f0-9-]{36}\/qr-code$/.test(data.qrUrl) ? data.qrUrl : '' });
  save();
}
// A single queue prevents a manual click, a voice action and polling from racing.
export async function runCheckout(action: CheckoutAction, shipping: 'standard' | 'express' = 'standard', expectedOrderId = ''): Promise<string> {
  if (state.busy) return 'busy';
  update({ busy: true, visible: true, error: '' });
  try {
    if (action === 'prepare') {
      if (token && !state.order) await request('status', { token });
      const next = cartFingerprint(cart(), shipping);
      if (state.order && fingerprint === next && !['expired', 'failed'].includes(state.order.status)) {
        await request('status', { token });
        return 'review_ready';
      }
      if (state.order && ['pending', 'unknown'].includes(state.order.status)) throw new Error('QR sandbox sebelumnya masih perlu dicek. Selesaikan pengecekan sebelum membuat ringkasan baru.');
      if (!cart().length) throw new Error('Keranjang masih kosong. Pilih barang dulu, yuk.');
      await request('draft', { items: cart(), shipping });
      fingerprint = next; save();
      return 'review_ready';
    }
    if (!token) throw new Error('Tinjau keranjang terlebih dahulu.');
    if (action === 'confirm') {
      if (!state.order || state.order.orderId !== expectedOrderId) return 'stale_order';
      if (fingerprint !== cartFingerprint(cart(), state.order.shipping)) throw new Error('Keranjang berubah. Tinjau ulang sebelum membuat QR.');
      // Save the capability BEFORE charge, so reload/retry reconciles the same ID.
      save();
      await request('confirm', { token, confirmed: true });
    } else await request('status', { token });
    return 'status_received';
  } catch (error) {
    update({ error: error instanceof Error ? error.message : 'Status belum diketahui. Cek lagi sebelum mengulang.' });
    return 'checkout_not_applied';
  } finally { update({ busy: false }); }
}
export async function registerCheckoutEmail(email: string) {
  if (state.busy || !token) return;
  update({ busy: true, error: '' });
  try { await request('email', { token, email, consent: true }); }
  catch (e) { update({ error: e instanceof Error ? e.message : 'Email belum tersimpan. Coba lagi.' }); }
  finally { update({ busy: false }); }
}
export function installCheckout() {
  restoreCheckout();
  const open = () => { void runCheckout('prepare', document.querySelector<HTMLInputElement>('input[name="shipping"]:checked')?.value === 'express' ? 'express' : 'standard'); };
  window.addEventListener('archava:checkout-open', open);
  return () => { window.removeEventListener('archava:checkout-open', open); };
}
