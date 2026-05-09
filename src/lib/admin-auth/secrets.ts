/**
 * HS256 secret for admin panel JWT cookies.
 * Prefer `ADMIN_JWT_SECRET`; then `AUTH_SECRET`, then `JWT_SECRET` (≥32 chars each).
 */
export function getAdminJwtSecret(): string | null {
  const raw =
    process.env.ADMIN_JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    "";
  if (!raw || raw.length < 32) {
    return null;
  }
  return raw;
}
