import { useEffect, useRef } from 'react';
import { useConnectionState, useRoomContext, useVoiceAssistant } from '@livekit/components-react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { ASSISTANT_CHANGE_EVENT } from '../lib/assistant';
import { createAssistantChannel } from '../lib/assistantChannel';

export function ShoppingAssistantBridge() {
  const room = useRoomContext();
  const connection = useConnectionState();
  const { agent } = useVoiceAssistant();
  const revision = useRef(0);
  useEffect(() => {
    if (connection !== ConnectionState.Connected || !agent?.identity) return;
    const channel = createAssistantChannel((data, topic) => room.localParticipant.publishData(new Uint8Array(data), { reliable: true, topic }), agent.identity, revision.current);
    const publishState = () => { void channel.publish().catch(() => {}); };
    const onData = (data: Uint8Array, participant: { identity: string } | undefined, _kind: unknown, topic?: string) => { void channel.receive(data, participant?.identity, topic).catch(() => {}); };
    room.on(RoomEvent.DataReceived, onData);
    window.addEventListener(ASSISTANT_CHANGE_EVENT, publishState);
    window.addEventListener('kala:context-change', publishState);
    const timer = window.setInterval(publishState, 3000);
    publishState();
    return () => { revision.current = channel.revision; channel.dispose(); clearInterval(timer); room.off(RoomEvent.DataReceived, onData); window.removeEventListener(ASSISTANT_CHANGE_EVENT, publishState); window.removeEventListener('kala:context-change', publishState); };
  }, [room, connection, agent?.identity]);
  return null;
}
