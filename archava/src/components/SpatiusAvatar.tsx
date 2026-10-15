import { useEffect, useRef, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { AvatarView } from "@spatius/avatarkit";
import { AvatarPlayer, LiveKitProvider } from "@spatius/avatarkit-rtc";
import { ConnectionState } from 'livekit-client';
import { type AvatarSession } from "../lib/session";
import { prepareSpatiusAvatar } from "../lib/spatius";
import { AVATAR_RENDER_TOPIC, waitForAvatarRenderer, type AvatarRenderStatus } from "../lib/avatarRendering";

import { project } from "../lib/project";

export interface SpatiusAvatarPreparation {
  appId: string;
  avatarId: string;
  connect: () => Promise<AvatarSession | null>;
}

interface SpatiusAvatarProps {
  session?: AvatarSession | null;
  preparation?: SpatiusAvatarPreparation;
  onError: (message: string) => void;
}

export function SpatiusAvatar({ session, preparation, onError }: SpatiusAvatarProps) {
  const room = useRoomContext();
  const appId = preparation?.appId || session?.spatiusAppId || '';
  const avatarId = preparation?.avatarId || session?.spatiusAvatarId || '';
  const connect = preparation?.connect;
  // Public preparation persists through ticket allocation. Its view must not
  // remount just because the session prop receives the newly allocated ticket.
  const immediateSession = useRef(session);
  immediateSession.current = session;
  const serverUrl = connect ? undefined : session?.serverUrl;
  const token = connect ? undefined : session?.token;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let firstFrameRendered = false;
    let connectionAttempted = false;
    let disposed = false;
    let view: AvatarView | undefined;
    let player: AvatarPlayer | undefined;
    let canvas: HTMLCanvasElement | null = null;
    const startupAbort = new AbortController();
    let latestStatus: AvatarRenderStatus | undefined;
    const publishStatus = (status = latestStatus) => {
      if (!status || cancelled) return;
      latestStatus = status;
      console.info('[archava] avatar render:', JSON.stringify(status));
      if (room.state === ConnectionState.Connected) {
        void room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(status)), {
          reliable: true, topic: AVATAR_RENDER_TOPIC,
        }).catch(() => {});
      }
    };
    const lostGraphics = () => {
      if (!cancelled) onError('Render wajah Ava terhenti. Coba mulai ulang. (AV-R3)');
    };

    const start = async () => {
      const avatar = await prepareSpatiusAvatar(appId, avatarId);
      if (cancelled || !containerRef.current) return;

      containerRef.current.replaceChildren();
      view = new AvatarView(avatar, containerRef.current);
      canvas = containerRef.current.querySelector('canvas');
      canvas?.addEventListener('webglcontextlost', lostGraphics);
      await waitForAvatarRenderer(view, {
        signal: startupAbort.signal,
        onStatus: publishStatus,
      });
      if (cancelled) return;
      firstFrameRendered = true;
      setReady(true);
      // Mount and render before allocating a paid voice session. A stale SDK
      // capability result cannot veto this real render, and failed rendering
      // never starts a room. Keep this exact view for the subsequent RTC call.
      const activeSession = connect ? await connect() : immediateSession.current;
      if (cancelled || !activeSession) return;
      // Official Spatius RTC contract: first render, player, attach, connect.
      player = new AvatarPlayer(new LiveKitProvider(), view);
      await player.attach(room);
      if (cancelled) return;

      connectionAttempted = true;
      await room.connect(activeSession.serverUrl, activeSession.token);
      if (cancelled) return;
      publishStatus();
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (micError) {
        console.warn("Could not auto-enable microphone:", micError);
      }
    };

    const dispose = async () => {
      if (disposed) return;
      disposed = true;
      startupAbort.abort();
      canvas?.removeEventListener('webglcontextlost', lostGraphics);
      await player?.detach().catch(() => {});
      if (connectionAttempted) await room.disconnect().catch(() => {});
      view?.dispose();
    };

    const startup = start().catch(async (cause: unknown) => {
      await dispose();
      if (!cancelled) {
        const message = cause instanceof Error && /^Wajah Ava belum|^Area gambar Ava belum/.test(cause.message)
          ? cause.message : "Avatar belum bisa ditampilkan. Periksa koneksi lalu coba lagi.";
        setError(message);
        onError(message);
      }
    });
    return () => {
      cancelled = true;
      startupAbort.abort();
      // While the API allocates a ticket the renderer is already initialized,
      // so Disconnect can release it immediately without awaiting that reply.
      if (firstFrameRendered && !player) void dispose();
      else void startup.then(dispose);
    };
  }, [room, serverUrl, token, appId, avatarId, connect, onError]);

  return (
    <div className="spatius-avatar-surface">
      <div className="spatius-avatar-canvas" ref={containerRef} />
      {(!ready || error) && (
        <div className="spatius-avatar-status" role={error ? "alert" : "status"}>
          <span className="live-pulse-dot" />
          <span>{error || `Preparing ${project.brand.hostName}'s live avatar…`}</span>
        </div>
      )}
    </div>
  );
}
