# P1-03 — API Compatibility Matrix (Frozen vs Foundation)

**Date:** 2026-05-21  
**Policy:** No route rename, no envelope change on compat, no new required fields

---

## 1. Envelope rules (immutable)

### 1.1 Compat (all `/api/admin|doctor|technician|mobile/auth/*`)

```json
{ "ok": true, "data": { } }
{ "ok": false, "error": { "code": "STRING", "message": "STRING", "details": {} } }
```

**Adapter rule:** `IdentityAuthService` returns typed results; compat route maps to `jsonOk` / `jsonError` only — never `success`.

### 1.2 Foundation (`/api/auth/*`)

```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code", "message", "requestId" } }
```

**Mapper rule:** `auth.dto.ts` functions unchanged; controller calls same service as compat.

---

## 2. Compat route contract table

### 2.1 Admin panel

| Path | Request body | Success `data` | Error codes (frozen) |
|------|--------------|----------------|----------------------|
| `POST /api/admin/auth/login` | `{ email?, identifier?, password }` | `{ result: "success", user: { id, email, displayName, name, role } }` + `Set-Cookie: prani_admin_token` | `invalid_credentials`, `db_unavailable`, `server_error` |
| `POST /api/admin/auth/logout` | — | `{ signedOut: true }` + clear cookie | — |
| `GET /api/admin/auth/me` | Cookie | `{ user: { id, email, displayName, role } }` | `UNAUTHORIZED`, `FORBIDDEN` |

**P1-03:** Service returns `PanelLoginResult`; adapter sets cookie via existing `setAdminSessionCookie`.

### 2.2 Doctor panel

| Path | Request | Success `data` | Errors |
|------|---------|----------------|--------|
| `POST /api/doctor/auth/login` | `{ email, password }` | `{ user: { id, email, displayName, name, role: "DOCTOR" } }` + `prani_doctor_session` | `INVALID_CREDENTIALS`, `SERVER_MISCONFIGURED`, `VALIDATION_ERROR`, `INVALID_JSON` |
| `POST /api/doctor/auth/logout` | — | `{ signedOut: true }` | — |
| `GET /api/doctor/auth/me` | Cookie | `{ user: … }` | `UNAUTHORIZED`, `FORBIDDEN` |

### 2.3 Technician panel

| Path | Request | Success `data` | Errors |
|------|---------|----------------|--------|
| `POST /api/technician/auth/login` | `{ email, password }` | `{ user: { …, role: "AI_TECHNICIAN" } }` + `prani_technician_session` | Same family as doctor |
| `POST /api/technician/auth/logout` | — | `{ signedOut: true }` | — |
| `GET /api/technician/auth/me` | Cookie | `{ user: … }` | `UNAUTHORIZED`, `FORBIDDEN` |

**Login gate:** `AiTechnicianProfile.providerStatus === ACTIVE` (unchanged).

### 2.4 Mobile customer

| Path | Request | Success `data` | Errors |
|------|---------|----------------|--------|
| `POST /api/mobile/auth/otp/request` | `{ phone }` | `{ sent: true, otpTtlSeconds }` | `SERVER_MISCONFIGURED`, `VALIDATION_ERROR`, `INVALID_JSON`, `RESEND_COOLDOWN`, `RATE_LIMITED`, `OTP_REQUEST_FAILED`, `SMS_*` |
| `POST /api/mobile/auth/otp/verify` | `{ phone, code }` | `{ accessToken, expiresInSeconds, tokenType: "Bearer" }` | OTP verify codes + `SERVER_MISCONFIGURED` |
| `POST /api/mobile/auth/send-otp` | same as otp/request | same | same |
| `POST /api/mobile/auth/verify-otp` | same as otp/verify | same | same |
| `POST /api/mobile/auth/login` | `{ identifier, password }` | `{ accessToken, expiresInSeconds, tokenType, user }` | credential service codes |
| `POST /api/mobile/auth/register` | `{ name, mobile, email?, password }` | same JWT shape as login | register validation codes |

**P1-03 explicit non-changes:**

- No `refreshToken` in compat verify/login responses
- Bengali `OTP_MSG` strings unchanged
- OTP never returned in JSON body

---

## 3. Foundation `/api/auth` mapping (post port)

| Foundation path | Compat equivalent | Service | Response mapper |
|-----------------|-------------------|---------|-----------------|
| `POST /api/auth/otp/request` | `mobile/auth/otp/request` | `requestOtp()` | `toOtpRequestResponseDto` |
| `POST /api/auth/otp/verify` | `mobile/auth/otp/verify` | `verifyOtp()` | `toOtpVerifyResponseDto` — `refreshToken` optional empty until P1-06 |
| `POST /api/auth/login` | alias of verify | `verifyOtp()` | same |
| `POST /api/auth/token/refresh` | *none on compat* | `refreshToken()` | deferred P1-06 |
| `POST /api/auth/refresh` | alias | `refreshToken()` | deferred |
| `POST /api/auth/logout` | *no compat equivalent* | `revokeToken()` | noop OK |

### 3.1 Field mapping: OTP request

| Legacy compat `data` | Foundation `data` | P1-03 rule |
|---------------------|-------------------|------------|
| `sent: true` | implied by `success: true` | Foundation mapper derives from service |
| `otpTtlSeconds` | `expiresIn` + `otpLength` | Map TTL from `getOtpConfig()` |
| — | `maskedPhone` | Foundation-only field (additive on foundation only) |

### 3.2 Field mapping: OTP verify

| Legacy compat `data` | Foundation `data` | P1-03 rule |
|---------------------|-------------------|------------|
| `accessToken` | `accessToken` | Same signing function |
| `expiresInSeconds` | `expiresIn` | Convert seconds |
| `tokenType: "Bearer"` | — | Compat only |
| — | `refreshToken` | Omit or `""` until P1-06 |
| — | `user: { id, phone, isNewUser }` | Foundation only; compat unchanged |

---

## 4. Internal service result types (new — not HTTP)

Proposed domain types (not exposed over wire):

```ts
// Compat-facing (adapter maps to jsonOk/jsonError)
type CompatError = { code: string; message: string; httpStatus: number; details?: unknown };

type PanelLoginSuccess = {
  token: string;
  user: { id: string; email: string; displayName: string | null; name: string; role: string };
};

type MobileOtpRequestSuccess = { otpTtlSeconds: number };
type MobileTokenSuccess = {
  accessToken: string;
  expiresInSeconds: number;
  user?: MobileAuthUser; // only for password login/register
};
```

Adapters **must not** rename error codes when moving audit into services.

---

## 5. Guards and non-auth routes

These are **not** HTTP port targets but must keep working via re-exports:

| Import path | Used by | P1-03 |
|-------------|---------|-------|
| `@/lib/mobile-auth/guard` | `/api/mobile/*` | Re-export from `guards/mobile-customer.guard.ts` |
| `@/lib/admin-auth/api-guard` | Admin APIs | Re-export |
| `@/lib/doctor-auth/api-guard` | Doctor APIs | Re-export |
| `@/lib/technician-auth/api-guard` | Technician APIs | Re-export |
| `@/lib/admin-auth/permissions` | Admin services | Already → `permissions.registry` |

**`GET /api/mobile/me`:** Not in ROUTES_TO_PORT; continues to use `requireMobileCustomer` (ported guard).

---

## 6. Audit + permission compatibility

| Hook | Location after P1-03 | HTTP impact |
|------|----------------------|-------------|
| `recordAuthAuditFireAndForget` | Inside auth services | None |
| `logAdminLoginFailure` | Admin login service | None |
| `assertAdminCan` | `permissions.registry` | Same 403 body |
| `adminCan` in service-instance | registry | Same `{ ok: "FORBIDDEN" }` internal |

---

## 7. Environment variables (frozen)

| Variable | Panels | Mobile |
|----------|--------|--------|
| `AUTH_SECRET` | fallback | fallback |
| `ADMIN_JWT_SECRET` | admin | — |
| `DOCTOR_JWT_SECRET` | doctor | — |
| `TECHNICIAN_JWT_SECRET` | technician | — |
| `MOBILE_JWT_SECRET` | — | mobile |
| OTP / SMS vars | — | unchanged |

---

## 8. Contract test matrix (P1-03 exit)

| # | Test | Pass criteria |
|---|------|---------------|
| 1 | `npm run p1:auth-compat` | 2/2 envelope |
| 2 | Admin invalid login | `ok: false`, code ∈ frozen set |
| 3 | Mobile otp request (dev) | `ok: true`, `data.sent === true` |
| 4 | `POST /api/auth/otp/request` | Not `AUTH_MIGRATION_PENDING` |
| 5 | Cookie names | `prani_admin_token` etc. unchanged |
| 6 | Permissions test | `permissions.registry.test.ts` green |
| 7 | OpenAPI path list | Still 172 legacy paths; auth paths unchanged |

---

## 9. Breaking-change risk by surface

| Surface | Risk | Notes |
|---------|------|-------|
| Compat auth JSON | **LOW** | Adapters enforce parity |
| Cookies / JWT | **LOW** | Copy signing code, don’t replace with `shared/security/jwt` |
| Foundation `/api/auth` | **MEDIUM** | Moves from stub to live — clients using foundation benefit |
| Non-auth routes using guards | **LOW** | Re-export only |
| DB | **NONE** | No schema changes in P1-03 |

**Overall:** `BREAKING_CHANGE_RISK=LOW` (see [P1_03_AUTH_PORT_PLAN.md](./P1_03_AUTH_PORT_PLAN.md)).
