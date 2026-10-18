export const CHECKOUT_ACTION = 'archava.checkout.action';
export const CHECKOUT_RESULT = 'archava.checkout.result';
export const CHECKOUT_STATE = 'archava.checkout.state';
export type CheckoutAction = 'prepare' | 'confirm' | 'status';
export function parseCheckoutCommand(data: Uint8Array): { requestId: string; action: CheckoutAction; orderId: string; shipping: 'standard' | 'express' } | null {
  if (data.byteLength > 512) return null;
  try {
    const v = JSON.parse(new TextDecoder().decode(data));
    if (!v || Object.keys(v).sort().join(',') !== 'action,orderId,requestId,shipping'
      || typeof v.requestId !== 'string' || !/^[a-zA-Z0-9-]{8,64}$/.test(v.requestId)
      || !['prepare', 'confirm', 'status'].includes(v.action) || !['standard', 'express'].includes(v.shipping)
      || typeof v.orderId !== 'string' || !(v.orderId === '' || /^DOPA-SBX-[a-f0-9-]{36}$/.test(v.orderId))
      || v.action === 'confirm' && !v.orderId) return null;
    return v;
  } catch { return null; }
}
export const cartFingerprint = (items: { id: string; quantity: number }[], shipping: string) => JSON.stringify({ items: items.map(({ id, quantity }) => ({ id, quantity })).sort((a, b) => a.id.localeCompare(b.id)), shipping });
