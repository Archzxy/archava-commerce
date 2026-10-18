export const AVATAR_RENDER_TOPIC = 'archava.avatar.render';
export const AVATAR_RENDER_STAGES = [
  'unknown', 'avatar_core', 'compatibility_check', 'load_character',
  'load_idle_animation', 'render_system', 'first_frame', 'idle_loop',
] as const;
type Stage = typeof AVATAR_RENDER_STAGES[number];

export interface AvatarRenderStatus {
  status: 'initializing' | 'rendered' | 'timeout' | 'empty_surface';
  stage: Stage;
  width: number;
  height: number;
}

interface RendererSource {
  onFirstRendering?: () => void;
  readonly renderSize: { width: number; height: number };
}

function renderStatus(view: RendererSource, status: AvatarRenderStatus['status']): AvatarRenderStatus {
  // Pinned AvatarKit exposes no initialization-error event. Read its internal
  // internal stage only for diagnostics; never change SDK initialization.
  const stage = (view as RendererSource & { _initStage?: unknown })._initStage;
  const safeStage = AVATAR_RENDER_STAGES.find(value => value === stage) || 'unknown';
  let width = 0, height = 0;
  try {
    const size = view.renderSize;
    width = Number.isInteger(size.width) && size.width > 0 && size.width <= 4096 ? size.width : 0;
    height = Number.isInteger(size.height) && size.height > 0 && size.height <= 4096 ? size.height : 0;
  } catch { /* The render system may not exist yet. */ }
  return { status, stage: safeStage, width, height };
}

// Observe SDK initialization independently of RTC. The caller must wait for
// onReady before constructing AvatarPlayer (Spatius RTC runtime contract).
export function observeAvatarRendering(view: RendererSource, {
  signal, onReady, onStatus, onError, timeoutMs = 30_000, intervalMs = 1_000,
}: {
  signal: AbortSignal;
  onReady: () => void;
  onStatus: (status: AvatarRenderStatus) => void;
  onError: (message: string) => void;
  timeoutMs?: number;
  intervalMs?: number;
}): void {
  if (signal.aborted) return;
  let settled = false;
  let lastStage = '';
  const clear = () => {
    clearTimeout(deadline);
    clearInterval(poll);
    signal.removeEventListener('abort', abort);
    view.onFirstRendering = undefined;
  };
  const abort = () => { settled = true; clear(); };
  const progress = () => {
    const status = renderStatus(view, 'initializing');
    if (status.stage !== lastStage) { lastStage = status.stage; onStatus(status); }
  };
  const poll = setInterval(progress, intervalMs);
  const deadline = setTimeout(() => {
    if (settled) return;
    settled = true;
    const status = renderStatus(view, 'timeout');
    clear();
    onStatus(status);
    onError(`Wajah Ava belum berhasil dimuat. Coba mulai ulang. (AV-R1: ${status.stage})`);
  }, timeoutMs);
  signal.addEventListener('abort', abort, { once: true });
  view.onFirstRendering = () => {
    if (settled) return;
    settled = true;
    const status = renderStatus(view, 'rendered');
    clear();
    if (!status.width || !status.height) {
      onStatus({ ...status, status: 'empty_surface' });
      onError('Area gambar Ava belum berhasil disiapkan. Coba mulai ulang. (AV-R2)');
    } else { onStatus(status); onReady(); }
  };
  progress();
}

export function waitForAvatarRenderer(view: RendererSource, {
  signal, onStatus, timeoutMs,
}: { signal: AbortSignal; onStatus: (status: AvatarRenderStatus) => void; timeoutMs?: number }): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Avatar initialization cancelled', 'AbortError'));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    const finish = (message?: string) => {
      signal.removeEventListener('abort', abort);
      if (message) reject(new Error(message)); else resolve();
    };
    observeAvatarRendering(view, {
      signal, onStatus, timeoutMs, onReady: () => finish(), onError: finish,
    });
  });
}
