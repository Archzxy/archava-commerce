import { useEffect, useRef, useState } from 'react';
import { useConnectionState, useRoomContext } from '@livekit/components-react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { currentShoppingPage, MARKET_TOPIC, MARKET_ACK_TOPIC, MARKET_NAVIGATION_TOPIC, navigationTarget } from '../lib/marketplace';
import { nextRevision } from '../lib/siteAwareness';

export function ShoppingAwareness() {
  const room = useRoomContext();
  const connection = useConnectionState();
  const [confirmed, setConfirmed] = useState(false);
  const revision = useRef(0);
  useEffect(() => {
    setConfirmed(false);
    if (connection !== ConnectionState.Connected) return;
    let last = '';
    let pending: { page: string; revision: number } | null = null;
    let retry: ReturnType<typeof setTimeout>;
    let attempts = 0;
    let disposed = false;
    const send = (force = false) => {
      const page = currentShoppingPage();
      const key = JSON.stringify(page);
      if (key === last && !force) return;
      last = key;
      if (!force) attempts = 0;
      revision.current = nextRevision(revision.current);
      pending = { page: page.page, revision: revision.current };
      setConfirmed(false);
      clearTimeout(retry);
      const sentRevision = revision.current;
      const resend = () => { if (!disposed && pending?.revision === sentRevision && attempts++ < 4) retry = setTimeout(() => send(true), 1500); };
      void room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ ...page, revision: sentRevision })), { reliable: true, topic: MARKET_TOPIC }).then(resend, resend);
    };
    const onData = (data: Uint8Array, participant: { isAgent: boolean } | undefined, _kind: unknown, topic?: string) => {
      if (!participant?.isAgent) return;
      if (topic === MARKET_ACK_TOPIC && data.byteLength <= 256) {
        try {
          const ack = JSON.parse(new TextDecoder().decode(data));
          if (Object.keys(ack).length === 2 && pending && ack.page === pending.page && ack.revision === pending.revision) { setConfirmed(true); pending = null; clearTimeout(retry); }
        } catch { /* Ignore malformed acknowledgements. */ }
      }
      if (topic === MARKET_NAVIGATION_TOPIC) {
        const target = navigationTarget(data);
        if (target) void window.kalaNavigate?.(target);
      }
    };
    const changed = () => send();
    const rejoined = (participant: { isAgent: boolean }) => { if (participant.isAgent) { attempts = 0; send(true); } };
    room.on(RoomEvent.DataReceived, onData);
    room.on(RoomEvent.ParticipantConnected, rejoined);
    window.addEventListener('kala:context-change', changed);
    window.addEventListener('storage', changed);
    send(true);
    return () => { disposed = true; clearTimeout(retry); room.off(RoomEvent.DataReceived, onData); room.off(RoomEvent.ParticipantConnected, rejoined); window.removeEventListener('kala:context-change', changed); window.removeEventListener('storage', changed); };
  }, [room, connection]);
  return <div className={`av-context ${confirmed ? 'is-confirmed' : ''}`} role="status"><span />{confirmed ? 'Produk pilihanmu sudah diterima Ava' : 'Menyambungkan konteks produk…'}</div>;
}
