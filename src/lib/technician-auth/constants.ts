/** HttpOnly cookie storing the AI technician panel JWT. */
export const TECHNICIAN_SESSION_COOKIE = "prani_technician_session";

/** Session length in seconds (7 days, aligned with doctor/admin panels). */
export const TECHNICIAN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
