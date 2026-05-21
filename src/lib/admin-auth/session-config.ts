/** Default idle sign-out after 30 minutes without user activity. */
export const ADMIN_IDLE_TIMEOUT_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT_MS,
  30 * 60 * 1000,
);

/** Poll `/api/admin/auth/me` to keep panel session alive (backend `touchJwtSession`). */
export const ADMIN_SESSION_REFRESH_INTERVAL_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_ADMIN_SESSION_REFRESH_MS,
  5 * 60 * 1000,
);

/** HttpOnly session cookie max-age on backend (7 days) — used for docs / UI hints. */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
