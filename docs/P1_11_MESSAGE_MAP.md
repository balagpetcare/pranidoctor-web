# P1-11 — Auth Error & Message Catalog

**Project:** Prani Doctor  
**Mode:** PLAN (canonical map for implementation)  
**Date:** 2026-05-21  
**Locales:** `bn-BD` (default), `en-US`  
**Contract:** `error.code` frozen; `error.message` localized

---

## 1. How to read this document

| Column | Meaning |
|--------|---------|
| **Code** | Stable `error.code` in `{ ok: false, error: { code, message } }` |
| **Domain** | Functional area for P1-11 coverage |
| **Frozen BN** | When `YES`, `bn-BD` text must match production today (no drift) |
| **Accept-Language** | `full` = header + profile locale; `frozen-bn` = always Bengali; `panel` = header only |
| **Routes** | Representative compat paths |

**Parameters:** Messages marked `{param}` support interpolation (e.g. `{seconds}`, `{capability}`).

---

## 2. Locale resolution (reference)

| Input | Resolved |
|-------|----------|
| (none) | `bn-BD` |
| `Accept-Language: en` | `en-US` |
| `Accept-Language: bn` | `bn-BD` |
| `CustomerProfile.locale: en-US` (mobile, no header) | `en-US` |
| `PATCH /api/mobile/me { "locale": "bn-BD" }` | Persists; used as fallback |

Response header (P1-11-C routes): `Content-Language: bn-BD` or `en-US`.

---

## 3. Common / transport

| Code | Domain | Frozen BN | Accept-Language | Routes |
|------|--------|-----------|-----------------|--------|
| `INVALID_JSON` | common | NO | full | All JSON POST bodies |
| `VALIDATION_ERROR` | common | NO | full | Zod failures (auth, device, me) |
| `SERVER_MISCONFIGURED` | common | partial | full | OTP, refresh, token issue |
| `DATABASE_ERROR` | common | NO | full | me, guard profile init |
| `NOT_FOUND` | common | NO | full | me, device revoke, profile missing |

### Messages

| Code | bn-BD (message) | en-US (message) |
|------|-----------------|-----------------|
| `INVALID_JSON` | অনুরোধের তথ্য সঠিক নয়। JSON পাঠান। | Request body must be JSON. |
| `VALIDATION_ERROR` | দেওয়া তথ্য সঠিক নয়। | The submitted data is invalid. |
| `SERVER_MISCONFIGURED` | সার্ভার সঠিকভাবে কনফিগার করা নেই। সাইট প্রশাসককে জানান। | Server is misconfigured. Contact the site administrator. |
| `DATABASE_ERROR` | ডাটাবেস ত্রুটি। পরে আবার চেষ্টা করুন। | Database error. Please try again later. |
| `NOT_FOUND` | তথ্য পাওয়া যায়নি। | Resource not found. |

---

## 4. OTP (`/api/mobile/auth/otp/*`)

| Code | Domain | Frozen BN | Accept-Language | Routes |
|------|--------|-----------|-----------------|--------|
| `VALIDATION_ERROR` | otp | YES | frozen-bn | `otp/request` (phone) |
| `RESEND_COOLDOWN` | otp | YES | frozen-bn | `otp/request` |
| `RATE_LIMITED` | otp | YES | frozen-bn | `otp/request` |
| `OTP_REQUEST_FAILED` | otp | YES | frozen-bn | `otp/request` |
| `SMS_UNAVAILABLE` | otp | YES | frozen-bn | `otp/request` (internal map) |
| `SMS_NOT_CONFIGURED` | otp | YES | frozen-bn | `otp/request` |
| `WRONG_OTP` | otp | YES | frozen-bn | `otp/verify` |
| `EXPIRED_OTP` | otp | YES | frozen-bn | `otp/verify` |
| `TOO_MANY_ATTEMPTS` | otp | YES | frozen-bn | `otp/verify` |
| `LOGIN_NOT_ALLOWED` | otp | YES | frozen-bn | `otp/verify` |
| `SIGNUP_FAILED` | otp | YES | frozen-bn | `otp/verify` |

### Messages (must match `OTP_MSG` today for bn-BD)

| Code | bn-BD (message) | en-US (message) |
|------|-----------------|-----------------|
| `VALIDATION_ERROR` (phone) | সঠিক বাংলাদেশি মোবাইল নম্বর দিন। | Enter a valid Bangladesh mobile number. |
| `RESEND_COOLDOWN` | অনুরোধ খুব দ্রুত। {seconds} সেকেন্ড পর আবার চেষ্টা করুন। | Please wait {seconds} seconds before requesting another code. |
| `RATE_LIMITED` | এই নম্বরে অনেকবার কোড পাঠানো হয়েছে। এক ঘণ্টা পর আবার চেষ্টা করুন। | Too many codes sent to this number. Try again in one hour. |
| `OTP_REQUEST_FAILED` | যাচাইকরণ কোড পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন। | Could not send verification code. Try again shortly. |
| `SMS_UNAVAILABLE` | এসএমএস পাঠানো যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন। | SMS is unavailable. Try again shortly. |
| `SMS_NOT_CONFIGURED` | এসএমএস গেটওয়ে কনফিগার করা নেই। সাইট প্রশাসককে জানান। | SMS gateway is not configured. Contact the administrator. |
| `WRONG_OTP` | OTP কোডটি সঠিক নয়। আবার চেষ্টা করুন। | Incorrect OTP. Please try again. |
| `EXPIRED_OTP` | কোডের মেয়াদ শেষ হয়ে গেছে। নতুন কোড নিন। | Code has expired. Request a new code. |
| `TOO_MANY_ATTEMPTS` | অনেকবার ভুল OTP দেওয়া হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন। | Too many incorrect attempts. Try again later. |
| `LOGIN_NOT_ALLOWED` | এই নম্বর দিয়ে প্রবেশ করা যাচ্ছে না। | Sign-in is not allowed for this number. |
| `SIGNUP_FAILED` | প্রবেশ সম্পূর্ণ করা যায়নি। আবার চেষ্টা করুন। | Could not complete sign-in. Please try again. |
| `SERVER_MISCONFIGURED` (JWT) | মোবাইল প্রবেশের জন্য সার্ভারে JWT সিক্রেট সেট করা নেই। সাইট প্রশাসককে জানান। | Mobile JWT secret is not configured. Contact the administrator. |
| `SERVER_MISCONFIGURED` (token) | অ্যাক্সেস টোকেন তৈরি করা যায়নি। সার্ভার কনফিগারেশন পরীক্ষা করুন। | Could not issue access token. Check server configuration. |

---

## 5. Credentials (`/api/mobile/auth/login`, `register`)

| Code | Domain | Frozen BN | Accept-Language | Routes |
|------|--------|-----------|-----------------|--------|
| `VALIDATION_ERROR` | credentials | YES | frozen-bn | login, register |
| `DUPLICATE_PHONE` | credentials | YES | frozen-bn | register |
| `DUPLICATE_EMAIL` | credentials | YES | frozen-bn | register |
| `WRONG_IDENTIFIER_OR_PASSWORD` | credentials | YES | frozen-bn | login |
| `SIGNUP_FAILED` | credentials | YES | frozen-bn | register |

### Messages (from `CRED_MSG` — bn-BD frozen)

| Code | bn-BD (message) | en-US (message) |
|------|-----------------|-----------------|
| `VALIDATION_ERROR` (name) | নাম প্রয়োজন। | Name is required. |
| `VALIDATION_ERROR` (phone) | সঠিক মোবাইল নম্বর দিন। | Enter a valid mobile number. |
| `VALIDATION_ERROR` (password) | পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে। | Password must be at least 8 characters. |
| `VALIDATION_ERROR` (email) | সঠিক ইমেইল দিন। | Enter a valid email address. |
| `DUPLICATE_PHONE` | এই মোবাইল নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে। | This mobile number is already registered. |
| `DUPLICATE_EMAIL` | এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে। | This email is already registered. |
| `WRONG_IDENTIFIER_OR_PASSWORD` | মোবাইল/ইমেইল বা পাসওয়ার্ড সঠিক নয়। | Mobile/email or password is incorrect. |
| `SIGNUP_FAILED` | নিবন্ধন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন। | Registration could not be completed. Try again. |

---

## 6. Session & token

| Code | Domain | Frozen BN | Accept-Language | Routes |
|------|--------|-----------|-----------------|--------|
| `UNAUTHORIZED` | session | NO | full | Bearer guard, panel `me` |
| `TOKEN_INVALID` | session | NO | full | `auth/refresh`, foundation refresh |
| `FORBIDDEN` | session | NO | full | Customer role guard |
| `SESSION_REVOKED` | session | NO | full | Optional alias when `sid` revoked (same UX as UNAUTHORIZED) |

### Messages

| Code | bn-BD (message) | en-US (message) |
|------|-----------------|-----------------|
| `UNAUTHORIZED` (no bearer) | প্রবেশের জন্য Bearer টোকেন প্রয়োজন। | Authorization Bearer token is required. |
| `UNAUTHORIZED` (invalid/expired) | টোকেন সঠিক নয় বা মেয়াদ শেষ। | Invalid or expired token. |
| `TOKEN_INVALID` | রিফ্রেশ টোকেন সঠিক নয় বা মেয়াদ শেষ। | Invalid or expired refresh token. |
| `FORBIDDEN` (not customer) | এই সেবার জন্য গ্রাহক অ্যাকাউন্ট প্রয়োজন। | A customer account is required for this resource. |
| `SESSION_REVOKED` | সেশন বাতিল করা হয়েছে। আবার প্রবেশ করুন। | Session was revoked. Please sign in again. |

**Audit metadata (not user-facing):** `TOKEN_NOT_FOUND`, `TOKEN_REUSE`, `TOKEN_EXPIRED`, `SESSION_INACTIVE`, `DEVICE_REVOKED` — remain in `AuthAuditEvent.metadata` only; optional map for logs, not HTTP body in P1-11.

---

## 7. Device (`/api/mobile/devices/*`)

| Code | Domain | Frozen BN | Accept-Language | Routes |
|------|--------|-----------|-----------------|--------|
| `VALIDATION_ERROR` | device | NO | full | register (payload, platform) |
| `NOT_FOUND` | device | NO | full | DELETE revoke |
| `DEVICE_PLATFORM_INVALID` | device | NO | full | register (`platform` enum) |

### Messages

| Code | bn-BD (message) | en-US (message) |
|------|-----------------|-----------------|
| `VALIDATION_ERROR` (payload) | ডিভাইস তথ্য সঠিক নয়। | Invalid device payload. |
| `VALIDATION_ERROR` (deviceKey) | deviceKey প্রয়োজন। | deviceKey is required. |
| `DEVICE_PLATFORM_INVALID` | platform অবশ্যই android, ios, বা web হতে হবে। | platform must be android, ios, or web. |
| `VALIDATION_ERROR` (device id) | ডিভাইস আইডি প্রয়োজন। | Device id is required. |
| `NOT_FOUND` (device) | ডিভাইস পাওয়া যায়নি বা ইতিমধ্যে বাতিল। | Device not found or already revoked. |

**Success copy (optional `data.message`):** not required P1-11; clients use `registered`, `replaced`, `revoked` flags only.

---

## 8. Permission & panel access

| Code | Domain | Frozen BN | Accept-Language | Routes |
|------|--------|-----------|-----------------|--------|
| `PERMISSION_DENIED` | permission | partial | panel | Admin capability routes |
| `FORBIDDEN` | permission | NO | panel | `*/auth/me`, panel guards |
| `UNAUTHORIZED` | permission | NO | panel | `*/auth/me` |
| `DB_UNAVAILABLE` | panel-login | NO | panel | `*/auth/login` |
| `INVALID_CREDENTIALS` | panel-login | NO | panel | doctor, technician login |
| `invalid_credentials` | panel-login | NO | panel | admin login (legacy lowercase code) |

### Messages

| Code | bn-BD (message) | en-US (message) |
|------|-----------------|-----------------|
| `PERMISSION_DENIED` | এই কাজের জন্য অনুমতি নেই। | You do not have permission for this action. |
| `FORBIDDEN` (admin panel) | অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই। | Admin panel access is required. |
| `FORBIDDEN` (doctor panel) | ডাক্তার প্যানেলে প্রবেশের অনুমতি নেই। | Doctor panel access is required. |
| `FORBIDDEN` (technician panel) | টেকনিশিয়ান প্যানেলে প্রবেশের অনুমতি নেই। | Technician panel access is required. |
| `DB_UNAVAILABLE` | ডাটাবেস সংযোগ উপলব্ধ নয়। পরে আবার চেষ্টা করুন। | Database is unavailable. Try again later. |
| `INVALID_CREDENTIALS` / `invalid_credentials` | ইমেইল/পাসওয়ার্ড সঠিক নয়। | Email or password is incorrect. |

**Note:** Admin login uses code `invalid_credentials` (lowercase) today — **do not rename** in P1-11; add catalog alias only.

---

## 9. Mobile profile locale (not errors)

| Field | Domain | Values | Routes |
|-------|--------|--------|--------|
| `data.locale` | profile | `bn-BD` \| `en-US` | `GET /api/mobile/me` |
| `locale` (PATCH) | profile | same whitelist | `PATCH /api/mobile/me` |

| Validation code | bn-BD | en-US |
|-----------------|-------|-------|
| `VALIDATION_ERROR` (locale) | সাপোর্টেড ভাষা: bn-BD, en-US | Supported locales: bn-BD, en-US |

---

## 10. Code inventory summary

| Domain | Code count (approx.) | Frozen BN count |
|--------|----------------------|-----------------|
| common | 5 | 0 |
| otp | 12 | 12 |
| credentials | 5 | 5 |
| session | 4 | 0 |
| device | 4 | 0 |
| permission / panel | 7 | 1 (`PERMISSION_DENIED` bn text) |
| **Total** | **~37** | **~18** |

---

## 11. Implementation aliases

Map legacy codes to catalog keys without changing HTTP codes:

| HTTP `error.code` (legacy) | Catalog key |
|----------------------------|-------------|
| `invalid_credentials` | `INVALID_CREDENTIALS` |
| `db_unavailable` | `DB_UNAVAILABLE` |
| `TOKEN_INVALID` | `TOKEN_INVALID` |

---

## 12. Verification hooks

| Test | Assert |
|------|--------|
| OTP BN parity | `resolveAuthMessage('WRONG_OTP', 'bn-BD') === OTP_MSG.wrongCode` |
| Device EN | `Accept-Language: en` + missing `deviceKey` → EN message |
| OTP EN frozen | `Accept-Language: en` + wrong OTP → still BN message |
| Locale PATCH | Round-trip `en-US` on `/api/mobile/me` |

---

## 13. References

- [P1_11_PLAN.md](./P1_11_PLAN.md)
- `pranidoctor-backend/src/legacy/web/lib/mobile-auth/otp-messages.ts`
- `pranidoctor-backend/src/modules/auth/legacy-web/customer-credentials-messages.ts`

---

*Catalog version: P1-11 PLAN. Update this file when codes ship in `modules/auth/i18n/`.*
