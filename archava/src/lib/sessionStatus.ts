const messages: Record<string, string> = {
  avatar_credits_exhausted: 'Kredit layanan avatar habis. Pengelola perlu mengisi kredit sebelum percakapan bisa dimulai.',
  avatar_unavailable: 'Layanan avatar belum bisa tersambung. Coba lagi nanti.',
};

export function sessionStartupError(metadata: string | undefined): string | null {
  try {
    const status = JSON.parse(metadata || '{}')?.archavaSession;
    return status?.status === 'failed'
      ? (typeof status.code === 'string' && Object.hasOwn(messages, status.code) ? messages[status.code] : messages.avatar_unavailable)
      : null;
  } catch {
    return null;
  }
}
