import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CheckCircle2, Clipboard, ExternalLink, LoaderCircle, QrCode, X } from 'lucide-react';
import catalog from '../../config/catalog.json';
import { getCheckout, hideCheckout, registerCheckoutEmail, runCheckout, subscribeCheckout } from '../lib/checkout';

const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const labels = { preview: 'Cek pilihanmu dulu', unavailable: 'QRIS belum aktif', pending: 'QR sandbox siap diuji', paid: 'Pembayaran simulasi berhasil', expired: 'QR / ringkasan kedaluwarsa', failed: 'Pembayaran simulasi tidak berhasil', unknown: 'Status belum terkonfirmasi' };
export function CheckoutCard() {
  const state = useSyncExternalStore(subscribeCheckout, getCheckout);
  const [clock, setClock] = useState(Date.now());
  const [imageError, setImageError] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [email, setEmail] = useState('');
  const [emailConsent, setEmailConsent] = useState(false);
  const order = state.order;
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!state.visible) return;
    const previous = document.activeElement;
    card.current?.focus({ preventScroll: true });
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true }); };
  }, [state.visible]);
  useEffect(() => { setImageError(false); setCopyMessage(''); }, [state.qrUrl]);
  useEffect(() => { setEmail(''); setEmailConsent(false); }, [order?.orderId]);
  useEffect(() => {
    if (!state.visible || !order || !(['pending', 'unknown'].includes(order.status) || order.status === 'paid' && ['queued', 'sending', 'waiting_payment'].includes(order.emailStatus || ''))) return;
    const timer = window.setInterval(() => { void runCheckout('status'); }, 8000);
    return () => clearInterval(timer);
  }, [state.visible, order?.orderId, order?.status, order?.emailStatus]);
  useEffect(() => {
    if (!state.visible) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state.visible]);
  if (!state.visible) return null;
  const remaining = order ? Math.max(0, Math.ceil((order.expiresAt - clock) / 1000)) : 0;
  return <section ref={card} tabIndex={-1} className="av-checkout" aria-label="Checkout demo DOPAMINE" aria-busy={state.busy}>
    <header><span><QrCode size={19} /> CHECKOUT DEMO</span><button type="button" onClick={hideCheckout} aria-label="Tutup checkout demo"><X size={18} /></button></header>
    <div className="av-checkout-body">
      <span className="av-checkout-badge">MIDTRANS · SANDBOX</span>
      <h2 aria-live="polite">{order ? labels[order.status] : 'Siapkan pilihanmu'}</h2>
      {order && <>
        <ul>{order.items.map(item => <li key={item.id}><span>{item.quantity} × {catalog.products.find(p => p.id === item.id)?.name || item.id}</span><b>{money(item.price * item.quantity)}</b></li>)}</ul>
        <dl><div><dt>Subtotal demo</dt><dd>{money(order.subtotal)}</dd></div><div><dt>Ongkir contoh · {order.shipping === 'express' ? 'express' : 'reguler'}</dt><dd>{money(order.shippingCost)}</dd></div><div className="av-checkout-total"><dt>Total simulasi</dt><dd>{money(order.amount)}</dd></div></dl>
        <p className="av-checkout-warning">Uji hanya lewat simulator Midtrans. Jangan scan dengan aplikasi bank atau dompet sungguhan.</p>
        {order.status === 'unavailable' && <p>Integrasi menunggu konfigurasi sandbox dari pengelola toko. Ringkasan sudah siap; QR dan pembayaran belum dibuat.</p>}
        {order.status === 'preview' && <><p>Periksa barang dan total sebelum membuat QR sandbox. Konfirmasi berlaku 5 menit.</p><button className="av-checkout-primary" type="button" disabled={state.busy} onClick={() => void runCheckout('confirm', order.shipping, order.orderId)}>Konfirmasi & buat QR sandbox</button></>}
        {order.status === 'pending' && <>
          {remaining > 0 && state.qrUrl && !imageError ? <img className="av-checkout-qr" src={state.qrUrl} alt="QRIS sandbox Midtrans, hanya untuk simulator" referrerPolicy="no-referrer" onError={() => setImageError(true)} /> : <p>{remaining ? 'Gambar QR belum tersedia. Coba cek status lagi.' : 'Waktu QR habis. Cek status terakhir sebelum membuat ringkasan baru.'}</p>}
          <p className="av-checkout-expiry">Sisa waktu {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p>
          <a className="av-checkout-primary" href="https://simulator.sandbox.midtrans.com/v2/qris/index" target="_blank" rel="noopener noreferrer">Buka simulator <ExternalLink size={14} /></a>
          {state.qrUrl && <button type="button" onClick={() => { void navigator.clipboard.writeText(state.qrUrl).then(() => setCopyMessage('Tautan QR disalin. Tempel di simulator.'), () => setCopyMessage('Salin dari tautan QR di bawah.')); }}><Clipboard size={14} /> Salin tautan QR untuk simulator</button>}
          {copyMessage && <p role="status">{copyMessage}</p>}
          {state.qrUrl && <a href={state.qrUrl} target="_blank" rel="noopener noreferrer">Buka gambar QR sandbox</a>}
        </>}
        {order.status === 'paid' && <p className="av-checkout-success"><CheckCircle2 size={20} /> Midtrans mengonfirmasi simulasi. Tidak ada pesanan atau pengiriman nyata.</p>}
        <div className="av-checkout-email">
          {state.emailConfigured && order.emailStatus === 'not_requested' ? <form onSubmit={event => { event.preventDefault(); if (emailConsent) void registerCheckoutEmail(email); }}>
            <label htmlFor="checkout-receipt-email">Email bukti pembayaran (opsional)</label>
            <input id="checkout-receipt-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} required placeholder="nama@example.com" />
            <label className="av-checkout-email-consent"><input type="checkbox" checked={emailConsent} onChange={event => setEmailConsent(event.target.checked)} required />Saya konfirmasi alamat ini untuk menerima satu bukti pembayaran simulasi.</label>
            <button type="submit" disabled={state.busy || !emailConsent}>Simpan email bukti simulasi</button>
          </form> : <p role="status">{({ unavailable: 'Pengiriman bukti email belum aktif.', waiting_payment: 'Email tersimpan. Bukti simulasi dikirim setelah pembayaran terverifikasi.', queued: 'Bukti simulasi menunggu pengiriman email.', sending: 'Bukti simulasi sedang dikirim.', accepted: 'Server email menerima bukti simulasi. Periksa inbox atau folder spam.', failed: 'Email belum berhasil dikirim. Status pembayaran tetap berlaku.', unknown: 'Pengiriman email belum bisa dipastikan. Tidak dikirim ulang otomatis.' } as Record<string, string>)[order.emailStatus || 'unavailable']}</p>}
        </div>
        {order.status === 'unknown' && <p>Hasil belum diketahui. Cek status pesanan ini lagi; jangan buat pembayaran baru.</p>}
        {['pending', 'unknown'].includes(order.status) && <button type="button" disabled={state.busy} onClick={() => void runCheckout('status')}>Cek status Midtrans</button>}
        {['expired', 'failed'].includes(order.status) && <button type="button" disabled={state.busy} onClick={() => void runCheckout('prepare', order.shipping)}>Tinjau keranjang lagi</button>}
        <small className="av-checkout-id">{order.orderId}</small>
      </>}
      {state.error && <p className="av-error" role="alert">{state.error}</p>}
      {!order && !state.busy && <button type="button" onClick={() => void runCheckout('prepare')}>Tinjau keranjang</button>}
      {state.busy && <p className="av-checkout-loading" role="status"><LoaderCircle className="av-spinner" size={16} /> Memeriksa checkout…</p>}
      <small>Katalog, nominal dan pengiriman adalah demo. Email bukti dikirim hanya ke layanan pengirim; alamat tidak dibagikan ke Ava atau Midtrans.</small>
    </div>
  </section>;
}
