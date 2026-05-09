/** OTP validity window (seconds). */
export const MOBILE_OTP_TTL_SECONDS = 600;

/** Max OTP SMS requests per phone per rolling hour window. */
export const MOBILE_OTP_MAX_SENDS_PER_HOUR = 5;

/** Rolling window for SMS send rate limit (ms). */
export const MOBILE_OTP_SEND_WINDOW_MS = 60 * 60 * 1000;

/** Max wrong OTP attempts per challenge before it is invalidated. */
export const MOBILE_OTP_MAX_VERIFY_ATTEMPTS = 5;
