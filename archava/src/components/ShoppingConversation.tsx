import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BarVisualizer, isTrackReference, StartAudio, useChat, useConnectionState, useLocalParticipant, useRoomContext, useTracks, useTranscriptions, useVoiceAssistant, VideoTrack } from '@livekit/components-react';
import { ConnectionState, RoomEvent, Track, type RemoteParticipant } from 'livekit-client';
import { Mic, Send } from 'lucide-react';
import type { AvatarSession } from '../lib/session';
import { ShoppingAwareness } from './ShoppingAwareness';
import { SiteAwareness } from './SiteAwareness';
import { ShoppingAssistantBridge } from './ShoppingAssistantBridge';
import { ShoppingWorkspace } from './ShoppingWorkspace';
import { AvatarCallControls } from './AvatarCallControls';
import type { SpatiusAvatarPreparation } from './SpatiusAvatar';
import { remainingSessionSeconds } from '../lib/sessionTime';
import { sessionStartupError } from '../lib/sessionStatus';

const SpatiusAvatar = lazy(() => import('./SpatiusAvatar').then(module => ({ default: module.SpatiusAvatar })));
const labels: Record<string, string> = { speaking: 'Archava sedang menjawab', thinking: 'Sedang mencari pilihan', listening: 'Archava mendengarkan', idle: 'Siap ngobrol', disconnected: 'Menghubungkan…', initializing: 'Menyiapkan Archava…', connecting: 'Menghubungkan…', 'pre-connect-buffering': 'Menyiapkan audio…', failed: 'Koneksi terputus' };

export function ShoppingConversation({ session, preparation, onClose, onError, question, detailsOpen, onToggleChat }: { session: AvatarSession | null; preparation?: SpatiusAvatarPreparation; onClose: () => void; onError: (message: string) => void; question: string; detailsOpen: boolean; onToggleChat: () => void }) {
  const { state, audioTrack, agent } = useVoiceAssistant();
  const room = useRoomContext();
  const connected = useConnectionState() === ConnectionState.Connected;
  const ready = Boolean(session) && ['listening', 'speaking', 'thinking', 'idle'].includes(state);
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera]);
  const video = tracks.find(track => isTrackReference(track) && track.participant.isAgent);
  const { send, isSending, chatMessages } = useChat();
  const transcriptions = useTranscriptions();
  const [message, setMessage] = useState(question);
  const [sendError, setSendError] = useState('');
  const chatLog = useRef<HTMLDivElement>(null);
  const chatInput = useRef<HTMLInputElement>(null);
  const allowed = (identity: string | undefined) => identity === localParticipant.identity || Boolean(agent?.identity && identity === agent.identity);
  const messages = [
    ...transcriptions.filter(item => allowed(item.participantInfo.identity)).map(item => ({ id: `voice-${item.streamInfo.id}`, text: item.text, timestamp: item.streamInfo.timestamp, self: item.participantInfo.identity === localParticipant.identity })),
    ...chatMessages.filter(item => allowed(item.from?.identity)).map(item => ({ id: `chat-${item.id}`, text: item.message, timestamp: item.timestamp, self: item.from?.identity === localParticipant.identity })),
  ].filter(item => item.text.trim()).sort((a, b) => a.timestamp - b.timestamp).slice(-30);
  const endsAt = session?.endsAt;
  const [seconds, setSeconds] = useState(endsAt ? remainingSessionSeconds(endsAt) : 0);
  useEffect(() => {
    const check = () => { const message = sessionStartupError(room.metadata); if (message) onError(message); };
    room.on(RoomEvent.RoomMetadataChanged, check);
    room.on(RoomEvent.Connected, check);
    check();
    return () => { room.off(RoomEvent.RoomMetadataChanged, check); room.off(RoomEvent.Connected, check); };
  }, [room, onError]);
  useEffect(() => { if (question) setMessage(question); }, [question]);
  useEffect(() => { if (detailsOpen && ready) chatInput.current?.focus({ preventScroll: true }); }, [detailsOpen, ready]);
  useEffect(() => { if (detailsOpen && chatLog.current) chatLog.current.scrollTop = chatLog.current.scrollHeight; }, [detailsOpen, messages.length, messages.at(-1)?.text]);
  useEffect(() => {
    if (!endsAt) return;
    const disconnected = (participant: RemoteParticipant) => {
      if (Date.now() >= endsAt * 1000 || !participant.isAgent) return;
      if (participant.identity === agent?.identity || participant.attributes['lk.publish_on_behalf'] === agent?.identity) onError('Koneksi Archava terputus. Mulai percakapan lagi untuk menyambung.');
    };
    room.on(RoomEvent.ParticipantDisconnected, disconnected);
    return () => { room.off(RoomEvent.ParticipantDisconnected, disconnected); };
  }, [room, agent?.identity, endsAt, onError]);
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => { const remaining = remainingSessionSeconds(endsAt); setSeconds(remaining); if (!remaining) onClose(); };
    const timer = window.setInterval(tick, 1000);
    tick();
    return () => clearInterval(timer);
  }, [endsAt, onClose]);
  return <div className="av-conversation">
    <div className="av-video">
      {preparation || session?.avatarProvider === 'spatius' ? <Suspense fallback={<div className="av-video-loading">Menyiapkan avatar…</div>}><SpatiusAvatar session={session} preparation={preparation} onError={onError} /></Suspense>
        : video && isTrackReference(video) ? <VideoTrack trackRef={video} /> : <div className="av-voice"><Mic size={38} /><BarVisualizer state={state} trackRef={audioTrack} barCount={5} /></div>}
      {session && <span className="av-time">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>}
      <div className="av-state">{labels[state] || 'Menghubungkan…'}</div>
      {session && <StartAudio className="av-enable-audio" label="Aktifkan suara" />}
    </div>
    {session && <><ShoppingAwareness /><ShoppingAssistantBridge /><SiteAwareness /></>}
    <AvatarCallControls microphoneEnabled={isMicrophoneEnabled} onMicrophone={connected ? () => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled).catch(() => setSendError('Akses mikrofon belum tersedia.')) : undefined} chatOpen={detailsOpen} onChat={onToggleChat} onDisconnect={onClose} />
    {sendError && <p className="av-error" role="alert">{sendError}</p>}
    <p className="av-note">Asisten AI · Katalog dan keranjang demo</p>
    <div id="ava-details" className="av-details" hidden={!detailsOpen}>
      {session ? <section className="av-chat" aria-label="Chat dengan Ava"><h3>Chat dengan Ava</h3>
        <div ref={chatLog} className="av-transcripts" role="log" aria-live={detailsOpen ? 'polite' : 'off'} aria-label="Percakapan dengan Ava">
          {messages.length ? messages.map(item => <p key={item.id} className={item.self ? 'is-self' : ''}><strong>{item.self ? 'Kamu' : 'Ava'}</strong>{item.text}</p>) : <p className="av-chat-empty">Ngobrol langsung atau ketik pertanyaanmu di sini.</p>}
        </div>
        <form id="ava-typed-question" className="av-message" onSubmit={async event => { event.preventDefault(); const text = message.trim(); if (!ready || !text || isSending) return; setSendError(''); try { await send(text); setMessage(''); } catch { setSendError('Pesan belum terkirim. Coba lagi.'); } }}>
          <input ref={chatInput} aria-label="Pertanyaan untuk Archava" placeholder="Ketik pertanyaanmu…" maxLength={1000} value={message} onChange={event => setMessage(event.target.value)} />
          <button type="submit" aria-label="Kirim pertanyaan" disabled={!ready || isSending || !message.trim()}><Send size={17} /></button>
        </form>
      </section> : <p className="av-chat-wait">Chat tersedia saat Ava sudah tersambung.</p>}
      <ShoppingWorkspace />
    </div>
  </div>;
}
