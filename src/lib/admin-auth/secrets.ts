/**
 * HS256 secret for admin panel JWT cookies.
 * Prefer `ADMIN_JWT_SECRET`; then `AUTH_SECRET`, then `JWT_SECRET`.
 * Production requires ≥32 characters; non-production allows ≥16 for local `.env.example` values.
 */
export function getAdminJwtSecret(): string | null {
  const raw =
    process.env.ADMIN_JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    "";
  if (!raw) {
    return null;
  }
  const minLen = process.env.NODE_ENV === "production" ? 32 : 16;
  if (raw.length < minLen) {
    return null;
  }
  return raw;
}
