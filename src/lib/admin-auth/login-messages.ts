import type { AdminLoginErrorCode } from "./admin-login-errors";

/** Maps API `error.code` from `POST /api/admin/auth/login`. */
export function adminLoginErrorBn(code: string): string {
  switch (code) {
    case "invalid_credentials":
    case "INVALID_CREDENTIALS":
      return "ভুল ইমেইল/ফোন বা পাসওয়ার্ড";
    case "db_unavailable":
    case "DATABASE_UNAVAILABLE":
      return "সার্ভারের সাথে সংযোগ করা যাচ্ছে না";
    case "server_error":
    case "SERVER_MISCONFIGURED":
    case "VALIDATION_ERROR":
    case "INVALID_JSON":
      return "সিস্টেম সাময়িকভাবে ব্যস্ত";
    default:
      return "সিস্টেম সাময়িকভাবে ব্যস্ত";
  }
}

export function adminLoginErrorEn(code: string): string {
  switch (code) {
    case "invalid_credentials":
    case "INVALID_CREDENTIALS":
      return "Incorrect email or phone, or password.";
    case "db_unavailable":
    case "DATABASE_UNAVAILABLE":
      return "We could not reach the database. Please try again shortly.";
    case "server_error":
    case "SERVER_MISCONFIGURED":
    case "VALIDATION_ERROR":
    case "INVALID_JSON":
      return "Something went wrong. Please try again in a moment.";
    default:
      return "Something went wrong. Please try again in a moment.";
  }
}

export function formatAdminLoginError(code: AdminLoginErrorCode | string): string {
  return `${adminLoginErrorEn(code)} — ${adminLoginErrorBn(code)}`;
}

export function adminLoginRedirectMessage(reason: string | null): string | null {
  switch (reason) {
    case "idle":
      return "নিষ্ক্রিয়তার কারণে সেশন শেষ হয়েছে। আবার লগ ইন করুন। / Signed out due to inactivity.";
    case "expired":
      return "সেশনের মেয়াদ শেষ। আবার লগ ইন করুন। / Session expired. Please sign in again.";
    default:
      return null;
  }
}
