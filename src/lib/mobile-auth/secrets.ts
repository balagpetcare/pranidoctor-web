/**
 * HS256 secret for mobile customer Bearer JWTs.
 * Prefer `MOBILE_JWT_SECRET`; falls back to `AUTH_SECRET`.
 *
 * **Production** (`NODE_ENV=production`): requires length ≥ 32 (same as admin pattern).
 *
 * **Local dev OTP** (`NODE_ENV` not `production`, `APP_ENV=development`, `ENABLE_DEV_OTP=true`):
 * accepts 16–31 char secrets, or a built-in dev-only fallback when unset (never used in production builds).
 */
const DEV_OTP_INTERNAL_JWT_FALLBACK =
  "pranidoctor-local-mobile-jwt-secret-not-for-production-use";

export function isMobileDevOtpServerEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return (
    process.env.APP_ENV?.trim().toLowerCase() === "development" &&
    (process.env.ENABLE_DEV_OTP?.trim().toLowerCase() === "true" ||
      process.env.ENABLE_DEV_OTP === "1")
  );
}

export function getMobileJwtSecret(): string | null {
  const raw =
    process.env.MOBILE_JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "";

  if (raw.length >= 32) {
    return raw;
  }

  if (isMobileDevOtpServerEnabled()) {
    if (raw.length >= 16) {
      if (raw.length < 32) {
        console.warn(
          "[mobile-auth] MOBILE_JWT_SECRET / AUTH_SECRET is under 32 characters; allowed only for local dev (APP_ENV=development, ENABLE_DEV_OTP=true, NODE_ENV!=production).",
        );
      }
      return raw;
    }
    if (raw.length > 0) {
      console.warn(
        "[mobile-auth] MOBILE_JWT_SECRET / AUTH_SECRET is shorter than 16 characters; using built-in dev JWT secret for this session.",
      );
      return DEV_OTP_INTERNAL_JWT_FALLBACK;
    }
    console.warn(
      "[mobile-auth] No MOBILE_JWT_SECRET or AUTH_SECRET set; using built-in dev JWT secret. Set MOBILE_JWT_SECRET (32+ random characters) before any production deploy.",
    );
    return DEV_OTP_INTERNAL_JWT_FALLBACK;
  }

  return null;
}
