import { useCallback, useEffect, useRef, useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { LoaderCircle, Minus, Sparkles } from 'lucide-react';
import { apiUrl, canStartSession, endAvatarSession, getConfig, startAvatarSession, supportsAvatarRendering, type AppConfig, type AvatarSession } from './lib/session';
import { ApiError } from './lib/apiError';
import { preserveCallNavigation } from './lib/navigation';
import { AvatarCallControls } from './components/AvatarCallControls';
import { ShoppingConversation } from './components/ShoppingConversation';
import type { SpatiusAvatarPreparation } from './components/SpatiusAvatar';
import { ShoppingWorkspace } from './components/ShoppingWorkspace';
import { beginShoppingSession, endShoppingSession } from './lib/assistant';
import { installCheckout } from './lib/checkout';
import { CheckoutCard } from './components/CheckoutCard';

export default function App() {
  useEffect(installCheckout, []);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [session, setSession] = useState<AvatarSession | null>(null);
  const [preparation, setPreparation] = useState<SpatiusAvatarPreparation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const activeSession = useRef<AvatarSession | null>(null);
  const opening = useRef(false);
  const attempt = useRef(0);
  const panel = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const stop = useCallback(() => {
    attempt.current++;
    opening.current = false;
    setLoading(false);
    setPreparation(null);
    const active = activeSession.current;
    activeSession.current = null;
    if (active) {
      endShoppingSession();
      void endAvatarSession(active.ticket).catch(() => {});
    }
    setSession(null);
  }, []);
  const disconnect = useCallback(() => {
    stop();
    setOpen(false);
    setDetailsOpen(false);
    setQuestion('');
    setError('');
  }, [stop]);
  const fail = useCallback((message: string) => {
    stop();
    setError(message);
    setOpen(true);
  }, [stop]);
  const roomError = useCallback(() => fail('Koneksi percakapan terputus. Coba lagi.'), [fail]);
  const roomDisconnected = useCallback(() => {
    // A failure already clears activeSession and must leave its error visible.
    if (activeSession.current) disconnect();
  }, [disconnect]);

  const start = useCallback(async (draft?: string) => {
    setOpen(true);
    if (draft) { setQuestion(draft); setDetailsOpen(true); }
    if (opening.current || activeSession.current) return;
    const current = ++attempt.current;
    const cancelled = () => attempt.current !== current;
    opening.current = true;
    setLoading(true);
    setError('');
    let waitingForRenderer = false;
    const reportFailure = (cause: unknown) => {
      if (cancelled()) return;
      fail(cause instanceof DOMException && cause.name === 'NotAllowedError' ? 'Izinkan mikrofon di browser untuk ngobrol dengan Ava.'
        : cause instanceof Error && cause.message === 'service_unavailable' ? 'Ava sedang belum bisa tersambung. Coba lagi sebentar.'
        : cause instanceof Error && cause.message === 'browser' ? 'Avatar memerlukan browser dengan dukungan percakapan langsung.'
        : cause instanceof ApiError && cause.status === 429 ? 'Batas sesi sementara tercapai. Coba lagi sebentar.'
        : 'Ava belum bisa tersambung. Periksa koneksi lalu coba lagi.');
    };
    const allocateSession = async (expected?: { appId: string; avatarId: string }): Promise<AvatarSession | null> => {
      if (cancelled()) return null;
      try {
        const next = await startAvatarSession();
        if (cancelled()) {
          // Disconnect may have happened while the API was allocating the room.
          void endAvatarSession(next.ticket).catch(() => {});
          return null;
        }
        if (expected && (next.avatarProvider !== 'spatius' || next.spatiusAppId !== expected.appId || next.spatiusAvatarId !== expected.avatarId)) {
          void endAvatarSession(next.ticket).catch(() => {});
          throw new Error('service_unavailable');
        }
        activeSession.current = next;
        beginShoppingSession();
        setSession(next);
        return next;
      } catch (cause) { reportFailure(cause); return null; }
      finally {
        if (!cancelled()) { opening.current = false; setLoading(false); }
      }
    };
    try {
      // Refresh readiness on the click; a cached offline config can be stale.
      const readyConfig = await getConfig();
      if (cancelled()) return;
      setConfig(readyConfig);
      if (!canStartSession(readyConfig)) throw new Error('service_unavailable');
      if (!supportsAvatarRendering(readyConfig)) throw new Error('browser');
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('microphone');
      // Permission and the visible renderer can prepare together. A slow or
      // unanswered permission prompt must not hold up the face, but both must
      // succeed before allocating a voice room. Always release late mic tracks.
      const microphoneReady = navigator.mediaDevices.getUserMedia({ audio: true }).then(microphone => {
        microphone.getTracks().forEach(track => track.stop());
        return !cancelled();
      }, cause => { reportFailure(cause); return false; });
      if (readyConfig.avatarProvider === 'spatius') {
        // The visible view proves readiness before a voice room is allocated.
        // It stays mounted when allocateSession supplies the room credentials.
        waitingForRenderer = true;
        const source = { appId: readyConfig.spatiusAppId || '', avatarId: readyConfig.spatiusAvatarId || '' };
        setPreparation({ ...source, connect: async () => await microphoneReady ? allocateSession(source) : null });
      } else if (await microphoneReady) {
        await allocateSession();
      }
    } catch (cause) { reportFailure(cause); }
    finally {
      if (!waitingForRenderer && !cancelled()) { opening.current = false; setLoading(false); }
    }
  }, [fail]);

  useEffect(() => {
    let disposed = false;
    const refresh = () => void getConfig().then(value => { if (!disposed) setConfig(value); }).catch(() => { if (!disposed) setConfig(null); });
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    const show = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      void start(typeof detail?.question === 'string' ? detail.question : undefined);
    };
    const navigationError = () => setError('Halaman belum berhasil dibuka. Coba klik lagi.');
    const showShopping = () => { setDetailsOpen(true); setOpen(true); };
    const showPage = () => { if (window.matchMedia('(max-width: 640px)').matches) { setDetailsOpen(false); setOpen(false); } };
    const leaving = () => {
      attempt.current++;
      const active = activeSession.current;
      if (active) navigator.sendBeacon(apiUrl('/api/session/end'), new Blob([JSON.stringify({ ticket: active.ticket })], { type: 'application/json' }));
    };
    window.addEventListener('archava:open', show);
    window.addEventListener('archava:navigation-error', navigationError);
    window.addEventListener('archava:show-shopping', showShopping);
    window.addEventListener('archava:show-page', showPage);
    window.addEventListener('pagehide', leaving);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener('archava:open', show); window.removeEventListener('archava:navigation-error', navigationError); window.removeEventListener('archava:show-shopping', showShopping); window.removeEventListener('archava:show-page', showPage); window.removeEventListener('pagehide', leaving); };
  }, [start]);
  useEffect(() => { preserveCallNavigation(Boolean(session)); return () => preserveCallNavigation(false); }, [session]);
  const preload = useCallback(() => {
    if (!canStartSession(config) || config?.avatarProvider !== 'spatius' || !supportsAvatarRendering(config)) return;
    // Cached SDK initialization/public assets only: no view, microphone or room.
    void import('./lib/spatius').then(({ prepareSpatiusAvatar }) =>
      prepareSpatiusAvatar(config.spatiusAppId || '', config.spatiusAvatarId || '')).then(() => {
        if (!performance.getEntriesByName('archava-avatar-preloaded').length) performance.mark('archava-avatar-preloaded');
      }).catch(() => {});
  }, [config]);
  useEffect(() => {
    // Like the reference clients, warm while visitors read the store. Yield to
    // the initial storefront work and respect the browser's data-saving setting.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData || document.visibilityState === 'hidden') return;
    if ('requestIdleCallback' in window) {
      const idle = window.requestIdleCallback(preload, { timeout: 1_500 });
      return () => window.cancelIdleCallback(idle);
    }
    const timer = setTimeout(preload, 1_500);
    return () => clearTimeout(timer);
  }, [preload]);
  useEffect(() => {
    panel.current?.toggleAttribute('inert', !open);
    if (open) panel.current?.focus({ preventScroll: true });
    else if (wasOpen.current) launcher.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);
  const minimize = () => { setDetailsOpen(false); setOpen(false); };
  const toggleChat = () => setDetailsOpen(value => !value);

  return <div className="av-root">
    <aside id="ava-panel" ref={panel} className={`av-panel ${open ? 'is-open' : 'is-minimized'} ${detailsOpen ? 'is-expanded' : ''}`} aria-label="Asisten belanja Ava" aria-hidden={!open} tabIndex={-1}>
      <header className="av-header"><span className="av-icon"><Sparkles size={19} /></span><div><strong>Ava</strong><span>Teman belanjamu di DOPAMINE</span></div><button type="button" onClick={minimize} aria-label="Minimalkan Ava"><Minus size={20} /></button></header>
      {session || preparation ? <LiveKitRoom token={preparation ? undefined : session?.token} serverUrl={preparation ? undefined : session?.serverUrl} connect={Boolean(session && session.avatarProvider !== 'spatius')} audio video={false} options={preparation || session?.avatarProvider === 'spatius' ? { singlePeerConnection: false } : undefined} onDisconnected={roomDisconnected} onError={roomError}>
        <RoomAudioRenderer /><ShoppingConversation session={session} preparation={preparation || undefined} onClose={disconnect} onError={fail} question={question} detailsOpen={detailsOpen} onToggleChat={toggleChat} />
      </LiveKitRoom> : <div className="av-conversation">
        <div className="av-video av-connecting"><div className="av-connection-status" role={error ? 'alert' : 'status'}>
          {loading ? <LoaderCircle className="av-spinner" size={28} /> : <Sparkles size={28} />}
          <strong>{error ? 'Ava belum tersambung' : 'Menghubungkan Ava…'}</strong>
          <p>{error || 'Sebentar, Ava sedang menyiapkan wajah dan suara.'}</p>
          {error && <button className="av-retry" type="button" onClick={() => void start()}>Coba lagi</button>}
        </div></div>
        <AvatarCallControls chatOpen={detailsOpen} onChat={toggleChat} onDisconnect={disconnect} />
        <p className="av-note">Asisten AI · Katalog dan keranjang demo</p>
        <div id="ava-details" className="av-details" hidden={!detailsOpen}>
          <p className="av-chat-wait">Chat tersedia saat Ava sudah tersambung.</p>
          <ShoppingWorkspace />
        </div>
      </div>}
    </aside>
    <CheckoutCard />
    <button ref={launcher} hidden={open} className={`av-launcher ${session ? 'in-call' : ''}`} type="button" aria-expanded={open} aria-controls="ava-panel" aria-label={session ? 'Buka Ava' : 'Tanya Ava'} onPointerEnter={preload} onFocus={preload} onClick={() => void start()}><Sparkles size={21} /><span>{session ? 'Lanjut ngobrol' : 'Tanya Ava'}</span><i /></button>
  </div>;
}
