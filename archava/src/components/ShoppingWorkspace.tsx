import { useEffect, useState, useSyncExternalStore } from 'react';
import catalog from '../../config/catalog.json';
import { assistantProducts, cancelPendingCart, clearShoppingSummary, confirmPendingCart, executeAssistantCommand, getShoppingState, priorityLabels, recommendationFacts, sameComparisonGroup, setShoppingBrief, subscribeShoppingState, undoAssistantCart, type Brief, type Priority } from '../lib/assistant';

const money = (value: number) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
export function ShoppingWorkspace() {
  const state = useSyncExternalStore(subscribeShoppingState, getShoppingState);
  const [draft, setDraft] = useState<Brief>(state.brief);
  const [formError, setFormError] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { setDraft(state.brief); }, [state.brief]);
  useEffect(() => { if (!state.pendingCart) return; const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [state.pendingCart]);
  const hasBrief = Boolean(state.brief.budget || state.brief.useCase || state.brief.query || state.brief.priority !== 'none' || state.brief.category !== 'all');
  if (!state.active && !hasBrief && !state.recommendationIds.length && !state.notice) return null;
  const chips = [state.brief.budget ? `Maks. ${money(state.brief.budget)}` : 'Budget terbuka', state.brief.useCase, state.brief.query, state.brief.priority !== 'none' ? priorityLabels[state.brief.priority] : '', state.brief.category !== 'all' ? state.brief.category : ''].filter(Boolean);
  const pending = state.pendingCart;
  const expired = Boolean(pending && pending.expiresAt <= now);
  const request = (action: string, payload: Record<string, unknown>) => void executeAssistantCommand({ requestId: crypto.randomUUID(), action, payload });
  const compareUrl = `/bandingkan?${new URLSearchParams({ produk: state.recommendationIds.join(',') })}`;
  return <section className="av-workspace" aria-label={state.active ? 'Pilihan belanja bersama Ava' : 'Ringkasan belanja Ava'}>
    <div className="av-workspace-heading"><div><span className="av-eyebrow">{state.active ? 'KITA CARI YANG PAS' : 'PILIHANMU TETAP DI SINI'}</span><h3>{state.active ? 'Kebutuhan belanjamu' : 'Ringkasan belanja'}</h3></div>{!state.active && <button type="button" className="av-text-button" onClick={clearShoppingSummary}>Hapus</button>}</div>
    <div className="av-brief-chips" aria-live="polite">{chips.map(chip => <span key={chip}>{chip}</span>)}</div>
    {state.active && <details className="av-brief-editor"><summary>Koreksi kebutuhan</summary><form onSubmit={event => { event.preventDefault(); setFormError(setShoppingBrief(draft) ? '' : 'Periksa budget dan panjang kebutuhanmu.'); }}>
      <label>Budget maksimal (Rp)<input aria-label="Budget maksimal Ava" type="number" min="0" max="100000000" step="1" value={draft.budget || ''} placeholder="Belum ditentukan" onChange={event => setDraft({ ...draft, budget: Number(event.target.value) })} /></label>
      <label>Dipakai untuk<input maxLength={160} value={draft.useCase} placeholder="Misalnya: kerja dan perjalanan" onChange={event => setDraft({ ...draft, useCase: event.target.value })} /></label>
      <label>Jenis produk<input maxLength={120} value={draft.query} placeholder="Misalnya: headphone" onChange={event => setDraft({ ...draft, query: event.target.value })} /></label>
      <label>Prioritas<select value={draft.priority} onChange={event => setDraft({ ...draft, priority: event.target.value as Priority })}>{Object.entries(priorityLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label>Kategori<select value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}><option value="all">Semua kategori</option>{catalog.categories.map(category => <option key={category.name}>{category.name}</option>)}</select></label>
      {formError && <p role="alert">{formError}</p>}<button className="av-small-primary" type="submit">Simpan kebutuhan</button>
    </form></details>}
    {state.recommendationIds.length > 0 && <div className="av-recommendations"><h4>{state.active ? 'Pilihan dari Ava' : 'Shortlist dari percakapanmu'}</h4><p className="av-workspace-caption">Harga, spesifikasi, dan alasan berikut berasal dari katalog demo.</p>{state.recommendationIds.map((id, index) => {
      const product = assistantProducts.get(id)!;
      const facts = recommendationFacts(id);
      return <article className="av-recommendation" data-ava-recommendation-id={id} key={id}><span className="av-recommendation-number">{index + 1}</span><div><small>{product.brand}</small><h4>{product.name}</h4><strong>{money(product.price)}</strong><ul>{facts.facts.map(fact => <li key={fact}>{fact}</li>)}</ul><p><b>Kegunaan:</b> {facts.useCase}</p><p><b>Perlu dipertimbangkan:</b> {facts.tradeoff}</p><div className="av-card-actions"><a href={`/produk/${id}`}>Lihat detail</a>{state.active && <><button type="button" onClick={() => request('focus_product', { productId: id, field: 'product' })}>Tunjukkan</button><button type="button" onClick={() => request('request_cart', { productId: id, quantity: 1 })}>Siapkan keranjang</button></>}</div></div></article>;
    })}{sameComparisonGroup(state.recommendationIds) && <a className="av-compare-link" href={compareUrl}>Bandingkan pilihan ini →</a>}</div>}
    {pending && <div className="av-cart-confirmation" role="region" aria-label="Konfirmasi keranjang Ava"><span className="av-eyebrow">KONFIRMASI PILIHANMU</span><h4>{assistantProducts.get(pending.productId)!.name}</h4><p>Tambah {pending.quantity} barang · {money(assistantProducts.get(pending.productId)!.price * pending.quantity)}</p><small>{expired ? 'Permintaan kedaluwarsa. Siapkan ulang lewat Ava.' : 'Ucapkan “ya, tambahkan” atau gunakan tombol di bawah.'}</small><div className="av-card-actions"><button className="av-small-primary" type="button" disabled={expired || !state.active} onClick={() => confirmPendingCart()}>Ya, tambahkan</button><button type="button" onClick={cancelPendingCart}>Batalkan</button></div></div>}
    {state.notice && <p className="av-action-notice" role="status">{state.notice}</p>}
    {state.undo && <button type="button" className="av-undo" onClick={undoAssistantCart}>Urungkan penambahan terakhir</button>}
    {!state.active && <p className="av-workspace-caption">Tersimpan di tab ini selama 24 jam. Mulai sesi lagi untuk melanjutkan pilihanmu.</p>}
  </section>;
}
