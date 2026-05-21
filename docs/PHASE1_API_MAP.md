# Phase 1 — API Map (Authentication & Identity)

**Date:** 2026-05-21  
**Source of truth:** [openapi.json](./openapi.json), [API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md)  
**Owner:** `pranidoctor-backend` (compat + modules)

---

## 1. Response envelopes (frozen)

### 1.1 Legacy compat (all frozen auth routes)

```json
{ "ok": true, "data": { } }
{ "ok": false, "error": { "code": "STRING", "message": "STRING", "details": {} } }
```

### 1.2 Foundation `/api/auth` (not frozen for existing clients)

```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code", "message", "requestId" } }
```

**Phase 1:** Implement foundation handlers as **delegates** to legacy-compatible internals, then add **compat shim** routes if mobile ever needs `{ success }` — primary clients keep `/api/mobile/auth/*`.

---

## 2. Transport & credentials

| Actor | Header / cookie | Me endpoint |
|-------|-----------------|-------------|
| Admin | `Cookie: admin_session=<JWT>` | `GET /api/admin/auth/me` |
| Doctor | `Cookie: doctor_session=<JWT>` | `GET /api/doctor/auth/me` |
| Technician | `Cookie: technician_session=<JWT>` | `GET /api/technician/auth/me` |
| Mobile customer | `Authorization: Bearer <JWT>` | `GET /api/mobile/me` |

Web proxy (`proxy-to-backend.ts`, `server-internal.ts`) forwards cookies and `Authorization` unchanged.

**JWT claims (frozen behavior):**

| Audience | `sub` | Extra claims |
|----------|-------|--------------|
| Admin panel | user id | `email`, `role`: `ADMIN` \| `SUPER_ADMIN` |
| Doctor panel | user id | `email`, `role`: `DOCTOR` |
| Technician panel | user id | `email`, `role`: `AI_TECHNICIAN` |
| Mobile | user id | `role`: `CUSTOMER`, `aud`: `mobile` |

---

## 3. Frozen authentication endpoints

### 3.1 Admin panel

| Method | Path | Body (login) | Success `data` (representative) |
|--------|------|--------------|--------------------------------|
| POST | `/api/admin/auth/login` | `{ email? \| identifier?, password }` | User summary + sets cookie |
| POST | `/api/admin/auth/logout` | — | Clears cookie |
| GET | `/api/admin/auth/me` | — | `AdminPanelActor` + profile fields |

**Login identifier:** email (case-insensitive) or Bangladesh mobile normalized to `User.phone`.

**Roles allowed:** `ADMIN`, `SUPER_ADMIN` (active status).

### 3.2 Doctor panel

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/doctor/auth/login` | Same pattern as admin; role `DOCTOR` |
| POST | `/api/doctor/auth/logout` | |
| GET | `/api/doctor/auth/me` | Includes doctor profile / verification state |

### 3.3 Technician panel

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/technician/auth/login` | Role `AI_TECHNICIAN` |
| POST | `/api/technician/auth/logout` | |
| GET | `/api/technician/auth/me` | Technician profile slice |

### 3.4 Mobile customer

| Method | Path | Body | Success `data` |
|--------|------|------|----------------|
| POST | `/api/mobile/auth/otp/request` | `{ phone }` | `{ sent: true, otpTtlSeconds }` |
| POST | `/api/mobile/auth/otp/verify` | `{ phone, code }` | `{ accessToken, expiresInSeconds, tokenType: "Bearer" }` |
| POST | `/api/mobile/auth/send-otp` | Legacy alias → same as otp/request | |
| POST | `/api/mobile/auth/verify-otp` | Legacy alias → same as otp/verify | |
| POST | `/api/mobile/auth/login` | `{ identifier, password }` | Same JWT shape as verify + user object |
| POST | `/api/mobile/auth/register` | Registration payload | User + token per existing handler |

**OTP security:** OTP never returned in JSON; dev log optional via env.

### 3.5 Mobile profile (identity-related)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/mobile/me` | Bearer |
| PATCH | `/api/mobile/me` | Bearer — `name`, `email`, `area` optional |

---

## 4. Foundation module routes (Phase 1 target state)

Mounted at `/api/auth` (Express module — **not** in OpenAPI legacy 172 count as separate paths; OpenAPI shows `/api/auth` stub).

| Method | Path | Validator | Intended behavior |
|--------|------|-----------|-------------------|
| POST | `/api/auth/otp/request` | `phone` | Delegate → mobile otp/request logic |
| POST | `/api/auth/otp/verify` | `phone`, `code` | Delegate → mobile otp/verify |
| POST | `/api/auth/login` | alias of verify | |
| POST | `/api/auth/token/refresh` | `refreshToken` | New refresh service |
| POST | `/api/auth/refresh` | alias | |
| POST | `/api/auth/logout` | Bearer or body userId | Revoke refresh/session |

**Phase 1 does not remove or rename these.** Implementation fills stubs.

---

## 5. Phase 1 additive endpoints (new — not breaking)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/mobile/auth/refresh` | — | `{ refreshToken }` → new access (compat envelope) |
| POST | `/api/mobile/devices/register` | Bearer | Device + push token registry |
| GET | `/api/mobile/devices` | Bearer | List devices for user (optional) |
| DELETE | `/api/mobile/devices/:id` | Bearer | Revoke device (optional) |

OpenAPI: regenerate after implementation (`npm run openapi:generate`).

---

## 6. Error codes (frozen — do not rename)

### 6.1 Mobile OTP

| Code | Typical HTTP |
|------|--------------|
| `SERVER_MISCONFIGURED` | 500 |
| `INVALID_JSON` | 400 |
| `VALIDATION_ERROR` | 422 |
| OTP-specific (from service) | 400/403/429 |

Messages: Bengali strings from `OTP_MSG` / `otp-messages.ts`.

### 6.2 Admin login

| Code | Notes |
|------|-------|
| `server_error` | Legacy lowercase — **frozen** |
| `invalid_credentials` | |
| `account_suspended` | |

### 6.3 Admin permission deny

| Code | HTTP |
|------|------|
| `FORBIDDEN` | 403 — Bengali: "এই কাজের জন্য অনুমতি নেই" |

---

## 7. Permission enforcement map (API layer)

| Capability | Roles | Example routes |
|--------------|-------|----------------|
| `serviceInstance.view` | SUPER_ADMIN, ADMIN, SUPPORT | Admin service instance list/detail |
| `serviceInstance.review` | SUPER_ADMIN, ADMIN | Review actions |
| `serviceInstance.publish` | SUPER_ADMIN | Publish actions |

Doctor/technician: enforced via `requireDoctor` / `requireTechnician` guards and profile `ProviderStatus` — document per-route in implementation tickets.

---

## 8. Web proxy mapping

Every frozen path has `pranidoctor-web/src/app/api/<mirror>/route.ts` → `proxyRouteToBackend`.

| Web path | Backend path | Notes |
|----------|--------------|-------|
| `/api/admin/auth/login` | same | POST forward |
| `/api/mobile/auth/otp/request` | same | |
| … | … | 167 proxies total |

RSC auth:

- `getAdminSession()` — reads cookie locally, verifies JWT (edge-safe)
- `resolveAdminPanelActor()` — `GET BACKEND_URL/api/admin/auth/me`

**Phase 1:** No change to proxy paths; optional new proxies for additive routes only.

---

## 9. Environment variables (auth)

| Key | Used by |
|-----|---------|
| `ADMIN_JWT_SECRET` / `AUTH_SECRET` | Panel admin JWT |
| `DOCTOR_JWT_SECRET` / `AUTH_SECRET` | Doctor panel |
| `TECHNICIAN_JWT_SECRET` / `AUTH_SECRET` | Technician panel |
| `MOBILE_JWT_SECRET` / `AUTH_SECRET` | Mobile Bearer |
| OTP/SMS vars | `otp-env.ts` (see `docs/MOBILE_OTP_ENV.md` on backend) |

---

## 10. Contract test matrix (Phase 1 exit)

| # | Request | Expect |
|---|---------|--------|
| 1 | Admin login valid | 200, `ok: true`, Set-Cookie |
| 2 | Admin login bad password | `invalid_credentials` |
| 3 | Admin me with cookie | 200 actor |
| 4 | Mobile otp request | 200 `sent: true` |
| 5 | Mobile otp verify valid | 200 `accessToken` |
| 6 | Mobile me Bearer | 200 profile |
| 7 | Mobile refresh (new) | 200 `accessToken` when refresh issued |
| 8 | Doctor/technician login | Same pattern as admin |
| 9 | Foundation otp/request | 200 (after port) or documented alias |
| 10 | Permission deny | 403 `FORBIDDEN` |

---

## 11. OpenAPI alignment

Current `openapi.json` auth paths (frozen):

- `/api/admin/auth/login|logout|me`
- `/api/doctor/auth/login|logout|me`
- `/api/technician/auth/login|logout|me`
- `/api/mobile/auth/login|register|otp/request|otp/verify|send-otp|verify-otp`
- `/api/mobile/me` (profile)
- `/api/auth` (foundation — document as secondary)

Phase 1 completion: annotate additive routes; tag group `Identity`.
