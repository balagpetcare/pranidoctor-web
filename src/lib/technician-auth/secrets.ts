/**
 * HS256 secret for AI technician panel JWT cookies.
 * Prefer `TECHNICIAN_JWT_SECRET`; fall back to `DOCTOR_JWT_SECRET` then `AUTH_SECRET` (min 32 chars).
 */
export function getTechnicianJwtSecret(): string | null {
  const raw =
    process.env.TECHNICIAN_JWT_SECRET?.trim() ||
    process.env.DOCTOR_JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "";
  if (!raw || raw.length < 32) {
    return null;
  }
  return raw;
}
