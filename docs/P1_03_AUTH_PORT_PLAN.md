# P1-03 — Auth Port Plan (Legacy → Foundation AuthService)

**Date:** 2026-05-21  
**Mode:** PLAN ONLY  
**Prerequisites:** P1_FOUNDATION_READY=YES, P1-01 audit, P1-02 permissions, P1-00 baseline  
**Status:** `P1_03_READY=YES`

---

## 1. Objective

Replace **legacy auth internals** with a single backend-owned implementation under `src/modules/auth/`, while:

- Keeping all **frozen compat route paths** (`/api/admin|doctor|technician|mobile/auth/*`)
- Preserving **`{ ok, data }` / `{ ok: false, error }`** envelopes on compat
- Leaving **web, Flutter, and Prisma schema** unchanged
- Retaining **P1-01 audit** and **P1-02 permissions** behavior

Production traffic today flows: **compat route → `@/lib/*-auth` → Prisma + jose JWT**.  
After P1-03: **compat route (thin) → `IdentityAuthService` / `AuthService` → same Prisma + same jose claims**.

---

## 2. Current state (post P1-00–P1-02)

### 2.1 Two stacks

| Stack | Mount | Runtime | Envelope |
|-------|-------|---------|----------|
| **Compat (production)** | `/api/admin|doctor|technician|mobile/auth/*` | Legacy route handlers + `@/lib/*-auth` | `{ ok, data }` |
| **Foundation (stub)** | `/api/auth/*` | `AuthController` + stub `AuthService` | `{ success, data }` |

`AuthService` (`auth.service.ts`) still throws `AUTH_MIGRATION_PENDING` on all methods.

### 2.2 Already in `modules/auth`

| Module | Status |
|--------|--------|
| `identity-core.ts` | Role/status helpers, `AUTH_CHANNELS`, phone normalize re-export |
| `auth-audit.service.ts` | DB audit writers (hooks in routes today) |
| `permissions.registry.ts` | Admin capability matrix + `PERMISSION_DENIED` audit |
| `legacy-web/` | Partial duplicate of mobile files; **not** canonical (still imports `@/lib/mobile-auth`) |

### 2.3 Intentionally out of scope for P1-03

| Item | Defer to |
|------|----------|
| `_archived_foundation/auth.service.ts` (Redis sessions, `shared/security/jwt`, SHA-256 OTP) | **Do not activate** — diverges from legacy |
| Refresh token DB + mobile `refreshToken` field | P1-06 / P1-07 |
| `UserSession` revocation | P1-08 |
| `UserDevice` register | P1-09 |
| Web repo changes | Never in Phase 1 backend port |

---

## 3. Target architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Compat routes (frozen paths, unchanged filenames)               │
│  admin|doctor|technician|mobile/auth/*.ts  (~15 handlers)      │
└────────────────────────────┬────────────────────────────────────┘
                             │ parse body (zod stays in route)
                             │ map Response via jsonOk/jsonError
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Compat auth adapters (NEW)                                       │
│  modules/auth/compat/admin-auth.adapter.ts                       │
│  modules/auth/compat/mobile-auth.adapter.ts  …                    │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ IdentityAuthService (NEW facade)                                 │
│  ├─ PanelAdminAuthService      (login, logout, resolveActor)    │
│  ├─ PanelDoctorAuthService                                       │
│  ├─ PanelTechnicianAuthService                                   │
│  ├─ MobileOtpAuthService         (request + verify OTP)          │
│  └─ MobileCredentialsAuthService (login + register password)     │
└────────────────────────────┬────────────────────────────────────┘
                             │ uses
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  identity-core      auth-audit.service   permissions.registry
  panel-jwt (jose)   getPrisma()          (admin only)
```

**Foundation `AuthService`** implements `AuthServiceInterface` by delegating:

| Method | Delegates to | P1-03 behavior |
|--------|--------------|----------------|
| `requestOtp` | `MobileOtpAuthService.request` | Real impl (bcrypt OTP, same as legacy) |
| `verifyOtp` | `MobileOtpAuthService.verify` | Real impl; **no refresh token** in tokens yet |
| `refreshToken` | — | Keep **legacy parity**: return `null` or controlled error until P1-06 (no DB refresh table) |
| `revokeToken` | — | No-op / log only until P1-08 |

`/api/auth/*` continues to use `{ success, data }` via existing `auth.dto.ts` — **not** mixed into compat envelopes.

---

## 4. Port map (legacy → module)

### 4.1 Mobile (`@/lib/mobile-auth`)

| Legacy file | Target module path | Notes |
|-------------|-------------------|--------|
| `otp-service.ts` | `services/mobile-otp-auth.service.ts` | bcrypt OTP; `MobileOtpChallenge` unchanged |
| `otp-env.ts`, `otp-dispatch.ts`, `otp-live-sms.ts`, `otp-dev-log.ts` | `services/mobile-otp/` | SMS + dev mode |
| `otp-messages.ts` | `i18n/otp-messages.ts` (or keep path) | Bengali strings frozen |
| `jwt.ts`, `secrets.ts`, `constants.ts` | `tokens/mobile-jwt.ts` | `aud: mobile`, 30d TTL |
| `customer-credentials-service.ts` | `services/mobile-credentials-auth.service.ts` | login + register |
| `guard.ts` | `guards/mobile-customer.guard.ts` | Bearer + `requireMobileCustomer` |
| `phone.ts` | **Delete duplicate**; use `identity-core` | Already re-exported |

`@/lib/mobile-auth/*` → re-export from `modules/auth` (same as permissions pattern).

### 4.2 Admin panel (`@/lib/admin-auth`)

| Legacy file | Target | Notes |
|-------------|--------|--------|
| Login logic in `routes/admin/auth/login` | `services/panel-admin-auth.service.ts` | identifier email/phone, bcrypt |
| `jwt.ts`, `cookies.ts`, `secrets.ts`, `constants.ts` | `tokens/panel-admin-jwt.ts` | cookie `prani_admin_token` |
| `panel-access.ts` | `services/panel-admin-auth.service.ts` | `resolveAdminPanelActor` |
| `panel-classify.ts` | `types/panel-actor.types.ts` | shared actor types |
| `admin-login-errors.ts` | `services/panel-admin-auth.service.ts` | keep `logAdminLoginFailure` + audit |
| `api-guard.ts`, `dashboard-guard.ts`, `session.ts` | `guards/panel-admin.guard.ts` | re-export only |
| `safe-next-path.ts` | unchanged location | UI helper; low risk |

### 4.3 Doctor / technician panels

Same layout as admin:

- `services/panel-doctor-auth.service.ts` + `tokens/panel-doctor-jwt.ts`
- `services/panel-technician-auth.service.ts` + `tokens/panel-technician-jwt.ts`
- `panel-access.ts` logic per role (`ProviderStatus.ACTIVE` for doctor/technician login)

### 4.4 Cross-cutting (already done — wire only)

| Concern | Module | P1-03 action |
|---------|--------|--------------|
| Audit | `auth-audit.service.ts` | Move calls **into services**; routes stop duplicating `recordAuthAuditFireAndForget` |
| Permissions | `permissions.registry.ts` | Unchanged; guards keep importing `@/lib/admin-auth/permissions` |
| Identity | `identity-core.ts` | Used by all panel login + OTP phone normalize |

---

## 5. Token flow (must remain byte-compatible)

### 5.1 Panel sessions (cookie)

| Panel | Cookie name | JWT alg | Claims (frozen) | Max-Age |
|-------|-------------|---------|-----------------|---------|
| Admin | `prani_admin_token` | HS256 | `sub`, `email`, `role`: ADMIN \| SUPER_ADMIN | 7d |
| Doctor | `prani_doctor_session` | HS256 | `sub`, `email`, `role`: DOCTOR | 7d |
| Technician | `prani_technician_session` | HS256 | `sub`, `email`, `role`: AI_TECHNICIAN | 7d |

Secrets: `ADMIN_JWT_SECRET` / `DOCTOR_JWT_SECRET` / `TECHNICIAN_JWT_SECRET` / fallback `AUTH_SECRET` — **same resolution order as today**.

### 5.2 Mobile Bearer

| Field | Value |
|-------|--------|
| Header | `Authorization: Bearer <jwt>` |
| `aud` | `mobile` |
| `role` claim | `CUSTOMER` |
| TTL | 30 days (`MOBILE_SESSION_MAX_AGE`) |
| Refresh | **Not issued** on compat verify/login in P1-03 |

### 5.3 Foundation `/api/auth` (secondary)

| Endpoint | Service method | Response envelope |
|----------|----------------|-------------------|
| `POST /api/auth/otp/request` | `requestOtp` | `{ success, data: { maskedPhone, otpLength, expiresIn, cooldownSeconds } }` |
| `POST /api/auth/otp/verify` | `verifyOtp` | `{ success, data: { accessToken, refreshToken?, expiresIn, user } }` — `refreshToken` empty/absent until P1-06 |
| `POST /api/auth/token/refresh` | `refreshToken` | Stays unavailable or explicit `TOKEN_INVALID` until P1-06 |
| `POST /api/auth/logout` | `revokeToken` | No-op compatible with legacy |

**Do not** switch compat routes to `{ success, data }`.

---

## 6. Permission flow (unchanged contract)

| Layer | Behavior |
|-------|----------|
| Admin API routes | `adminCan` / `assertAdminCan` from registry |
| Service-instance admin | `recordAdminCapabilityDeny` on FORBIDDEN |
| Doctor / technician | Profile + `ProviderStatus` in login service and `require*` guards — **not** capability matrix |

P1-03 moves no permission rules; only ensures registry remains the single matrix source.

---

## 7. Audit flow (consolidate into services)

Today: compat routes call `recordAuthAuditFireAndForget` inline (P1-01).

P1-03 target: **services** emit audit events; routes only pass `authRequestContext(request)`.

| Event | Service method |
|-------|----------------|
| `LOGIN_SUCCESS` / `LOGIN_FAILURE` | `Panel*AuthService.login` |
| `LOGOUT` | `Panel*AuthService.logout` |
| `OTP_REQUEST` | `MobileOtpAuthService.request` |
| `OTP_VERIFY_*` | `MobileOtpAuthService.verify` |
| `PERMISSION_DENIED` | `permissions.registry` (keep) |

---

## 8. Implementation waves (summary)

See [P1_03_MIGRATION_PLAN.md](./P1_03_MIGRATION_PLAN.md) for step-by-step order.

| Wave | Deliverable |
|------|-------------|
| W1 | Mobile OTP + credentials services; `@/lib/mobile-auth` re-exports |
| W2 | Panel admin/doctor/technician auth services + JWT modules |
| W3 | Thin compat routes + adapters; remove duplicated Prisma from routes |
| W4 | Implement `AuthService` (delegate); remove `AUTH_MIGRATION_PENDING` for OTP |
| W5 | Contract tests + `p1-auth-compat` + golden login snapshots |

---

## 9. Verification (exit criteria)

| Check | Command / artifact |
|-------|-------------------|
| Build | `npm run build` (backend) |
| Module tests | `npx vitest run src/modules/auth/` |
| Compat envelope | `npm run p1:auth-compat` |
| E2E smoke | `npm run e2e:freeze` (backend up) |
| No stub OTP | `POST /api/auth/otp/request` returns 200 in dev (not 503 migration) |
| Admin login shape | `POST /api/admin/auth/login` invalid → `invalid_credentials` or `db_unavailable` with `{ ok: false }` |
| Audit rows | Login still writes `AuthAuditEvent` |

---

## 10. Risk summary

| Risk | Mitigation |
|------|------------|
| Activating `_archived_foundation` (wrong OTP hash, Redis sessions) | **Explicit ban**; port from `legacy/web/lib` only |
| JWT claim / cookie name drift | Constants imported from one `tokens/*` module |
| Dual envelope confusion | Separate compat adapters vs `auth.dto` mappers |
| `modules/auth/legacy-web` drift | Delete or make thin re-exports after W1 |
| Audit double-write | Remove route-level audit once service owns it |

---

## 11. Sign-off block

```
P1_03_READY=YES
BREAKING_CHANGE_RISK=LOW
ROUTES_TO_PORT=15
```

### ROUTES_TO_PORT (15 compat handlers)

| # | Method | Frozen path | Route file |
|---|--------|-------------|------------|
| 1 | POST | `/api/admin/auth/login` | `legacy/web/routes/admin/auth/login/route.ts` |
| 2 | POST | `/api/admin/auth/logout` | `legacy/web/routes/admin/auth/logout/route.ts` |
| 3 | GET | `/api/admin/auth/me` | `legacy/web/routes/admin/auth/me/route.ts` |
| 4 | POST | `/api/doctor/auth/login` | `legacy/web/routes/doctor/auth/login/route.ts` |
| 5 | POST | `/api/doctor/auth/logout` | `legacy/web/routes/doctor/auth/logout/route.ts` |
| 6 | GET | `/api/doctor/auth/me` | `legacy/web/routes/doctor/auth/me/route.ts` |
| 7 | POST | `/api/technician/auth/login` | `legacy/web/routes/technician/auth/login/route.ts` |
| 8 | POST | `/api/technician/auth/logout` | `legacy/web/routes/technician/auth/logout/route.ts` |
| 9 | GET | `/api/technician/auth/me` | `legacy/web/routes/technician/auth/me/route.ts` |
| 10 | POST | `/api/mobile/auth/otp/request` | `legacy/web/routes/mobile/auth/otp/request/route.ts` |
| 11 | POST | `/api/mobile/auth/otp/verify` | `legacy/web/routes/mobile/auth/otp/verify/route.ts` |
| 12 | POST | `/api/mobile/auth/send-otp` | `legacy/web/routes/mobile/auth/send-otp/route.ts` (re-export → #10) |
| 13 | POST | `/api/mobile/auth/verify-otp` | `legacy/web/routes/mobile/auth/verify-otp/route.ts` (re-export → #11) |
| 14 | POST | `/api/mobile/auth/login` | `legacy/web/routes/mobile/auth/login/route.ts` |
| 15 | POST | `/api/mobile/auth/register` | `legacy/web/routes/mobile/auth/register/route.ts` |

**Foundation routes (delegate only, not “port”):** 6 handlers under `/api/auth` (see [P1_03_API_COMPAT.md](./P1_03_API_COMPAT.md)).

**Non-route libs to port:** ~47 files under `@/lib/admin-auth`, `doctor-auth`, `technician-auth`, `mobile-auth` → re-export from `modules/auth` (no path changes for consumers).
