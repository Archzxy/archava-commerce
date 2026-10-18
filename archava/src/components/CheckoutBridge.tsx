import { useEffect, useRef } from 'react';
import { useConnectionState, useRoomContext, useVoiceAssistant } from '@livekit/components-react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { CHECKOUT_ACTION, CHECKOUT_RESULT, CHECKOUT_STATE, parseCheckoutCommand } from '../lib/checkoutProtocol';
import { getCheckout, runCheckout } from '../lib/checkout';

export function CheckoutBridge() {
  const room = useRoomContext();
  const connected = useConnectionState();
  const { agent } = useVoiceAssistant();
  const revision = useRef(0);
  useEffect(() => {
    if (connected !== ConnectionState.Connected || !agent?.identity) return;
    let disposed = false;
    const seen = new Set<string>();
    const send = (value: object, topic: string) => room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(value)), { reliable: true, topic });
    const publish = () => { if (!disposed) void send({ revision: ++revision.current, receipt: getCheckout().receipt }, CHECKOUT_STATE).catch(() => {}); };
    const receive = async (data: Uint8Array, participant: { identity: string } | undefined, _kind: unknown, topic?: string) => {
      if (disposed || topic !== CHECKOUT_ACTION || participant?.identity !== agent.identity) return;
      const cmd = parseCheckoutCommand(data);
      if (!cmd || seen.has(cmd.requestId) || seen.size >= 100) return;
      seen.add(cmd.requestId);
      const code = await runCheckout(cmd.action, cmd.shipping, cmd.orderId);
      if (!disposed) await send({ requestId: cmd.requestId, revision: ++revision.current, code, receipt: ['review_ready', 'status_received'].includes(code) ? getCheckout().receipt : null }, CHECKOUT_RESULT);
    };
    const onData = (...args: Parameters<typeof receive>) => { void receive(...args).catch(() => {}); };
    room.on(RoomEvent.DataReceived, onData);
    window.addEventListener('archava:checkout-state', publish);
    publish();
    return () => { disposed = true; room.off(RoomEvent.DataReceived, onData); window.removeEventListener('archava:checkout-state', publish); };
  }, [room, connected, agent?.identity]);
  return null;
}
