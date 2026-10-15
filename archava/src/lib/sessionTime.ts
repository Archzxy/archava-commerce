/** The session API returns Unix seconds, while the browser clock uses milliseconds. */
export function remainingSessionSeconds(endsAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((endsAt * 1000 - now) / 1000));
}
