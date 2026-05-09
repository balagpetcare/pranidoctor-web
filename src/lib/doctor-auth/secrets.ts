/**
 * HS256 secret for doctor panel JWT cookies.
 * Prefer `DOCTOR_JWT_SECRET`; `AUTH_SECRET` is a fallback (min 32 chars), same convention as admin.
 */
export function getDoctorJwtSecret(): string | null {
  const raw =
    process.env.DOCTOR_JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "";
  if (!raw || raw.length < 32) {
    return null;
  }
  return raw;
}
