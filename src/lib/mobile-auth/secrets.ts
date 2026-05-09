/**
 * HS256 secret for mobile customer Bearer JWTs.
 * Prefer `MOBILE_JWT_SECRET`; falls back to `AUTH_SECRET` (min 32 chars, same as admin pattern).
 */
export function getMobileJwtSecret(): string | null {
  const raw =
    process.env.MOBILE_JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "";
  if (!raw || raw.length < 32) {
    return null;
  }
  return raw;
}
