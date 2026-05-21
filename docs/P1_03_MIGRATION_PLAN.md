# P1-03 — Code Migration Plan (Legacy Auth → AuthService)

**Date:** 2026-05-21  
**Scope:** Backend `pranidoctor-backend` only  
**Constraints:** NO schema changes, NO route rename, NO web changes, NO migration reset

---

## 1. Migration strategy

**Strangler pattern:** move implementation into `src/modules/auth/`, leave compat route files as thin HTTP shells, keep `@/lib/*` paths as re-exports so 172 legacy routes and hundreds of guard imports do not break.

**Do not:**

- Run `_archived_foundation` as production `AuthService`
- Switch OTP hashing from bcrypt to SHA-256
- Introduce Redis session storage in P1-03
- Change Prisma models or run new migrations

**Do:**

- Copy behavior from `src/legacy/web/lib/*-auth` verbatim into services
- Centralize audit in services (remove duplicate route hooks)
- Wire `AuthService` to mobile OTP for foundation routes

---

## 2. Target folder layout (new)

```
src/modules/auth/
  identity-core.ts                 # exists
  identity-auth.service.ts         # NEW facade
  auth.service.ts                  # REPLACE stub → delegate
  auth-audit.service.ts            # exists
  permissions.registry.ts        # exists
  auth.controller.ts               # unchanged signatures
  auth.dto.ts                      # unchanged
  compat/
    admin-auth.adapter.ts          # jsonOk/jsonError mapping
    doctor-auth.adapter.ts
    technician-auth.adapter.ts
    mobile-auth.adapter.ts
  services/
    panel-admin-auth.service.ts
    panel-doctor-auth.service.ts
    panel-technician-auth.service.ts
    mobile-otp-auth.service.ts
    mobile-credentials-auth.service.ts
  tokens/
    panel-admin-jwt.ts             # from legacy jwt+cookies+secrets
    panel-doctor-jwt.ts
    panel-technician-jwt.ts
    mobile-jwt.ts
  guards/
    mobile-customer.guard.ts
    panel-admin.guard.ts             # api-guard, session reads
    panel-doctor.guard.ts
    panel-technician.guard.ts
  i18n/
    otp-messages.ts                  # moved from legacy
```

**Legacy bridges (keep paths):**

```
src/legacy/web/lib/mobile-auth/*.ts     → export * from modules/auth/...
src/legacy/web/lib/admin-auth/*.ts      → export * from modules/auth/...
src/legacy/web/lib/doctor-auth/*.ts     → export * from modules/auth/...
src/legacy/web/lib/technician-auth/*.ts → export * from modules/auth/...
```

**Cleanup:** Remove or empty `src/modules/auth/legacy-web/` duplicates after W1 to avoid two sources of truth.

---

## 3. Wave schedule

### Wave 1 — Mobile core (2–3 days)

| Step | Action | Verification |
|------|--------|--------------|
| W1.1 | Create `mobile-otp-auth.service.ts` — move body from `legacy/.../otp-service.ts` | Existing OTP unit behavior; manual otp request |
| W1.2 | Move otp-env, dispatch, sms, dev-log, messages | `otp-env.test.ts` passes |
| W1.3 | Create `mobile-jwt.ts` + `mobile-credentials-auth.service.ts` | login/register routes unchanged |
| W1.4 | Re-export `@/lib/mobile-auth/*` | `rg "@/lib/mobile-auth"` compiles |
| W1.5 | Move `guard.ts` → `guards/mobile-customer.guard.ts` | `/api/mobile/me` still works |

**AuthService after W1:** `requestOtp` / `verifyOtp` implemented; refresh/revoke still stub.

### Wave 2 — Panel auth (2 days)

| Step | Action | Verification |
|------|--------|--------------|
| W2.1 | `panel-admin-auth.service.ts` — extract login from `admin/auth/login/route.ts` | Same codes including `invalid_credentials` lowercase |
| W2.2 | `panel-doctor-auth.service.ts`, `panel-technician-auth.service.ts` | Doctor/technician login |
| W2.3 | Move jwt/cookies/secrets/constants per panel | Cookie names unchanged |
| W2.4 | `resolve*PanelActor` in each service | `GET */auth/me` unchanged |
| W2.5 | Re-export `@/lib/admin-auth`, `doctor-auth`, `technician-auth` | Build passes |

### Wave 3 — Thin routes + adapters (1–2 days)

| Step | Action | Target line count per route |
|------|--------|----------------------------|
| W3.1 | `admin-auth.adapter.ts` | Map service → `Response` |
| W3.2 | Refactor 15 route files to: zod parse → adapter → return | ~20–40 lines each |
| W3.3 | Remove inline audit from routes (now in services) | Audit rows still written |
| W3.4 | `send-otp` / `verify-otp` remain re-exports | No duplicate logic |

**ROUTES_TO_PORT completion:** all 15 handlers delegate to adapters.

### Wave 4 — Foundation AuthService (1 day)

| Step | Action | Verification |
|------|--------|--------------|
| W4.1 | `identity-auth.service.ts` composes panel + mobile services | Single DI entry in `auth.module.ts` |
| W4.2 | Replace stub `auth.service.ts` methods | No `AUTH_MIGRATION_PENDING` on OTP |
| W4.3 | `refreshToken`: return `null` → controller `TOKEN_INVALID` OR document 501 until P1-06 | Compat unaffected |
| W4.4 | `revokeToken`: no-op with log | Foundation logout 200 |
| W4.5 | Register `AuthService` in module with `getPrisma()` | `/api/auth/otp/request` 200 |

### Wave 5 — Verification + docs (0.5 day)

| Step | Action |
|------|--------|
| W5.1 | `npm run build` |
| W5.2 | `npx vitest run src/modules/auth/` |
| W5.3 | `npm run p1:auth-compat` |
| W5.4 | `npm run e2e:freeze` |
| W5.5 | `npm run openapi:generate` (paths unchanged) |
| W5.6 | Optional: golden JSON fixtures under `scripts/fixtures/auth/` |
| W5.7 | Update `P1_00_BASELINE.md` §3 — AuthService no longer stub |

---

## 4. Route-by-route migration checklist

| Route | Service method | Adapter |
|-------|----------------|---------|
| admin login | `panelAdmin.login(request, body)` | `admin-auth.adapter` |
| admin logout | `panelAdmin.logout(request)` | adapter |
| admin me | `panelAdmin.me(request)` | route or adapter |
| doctor login/logout/me | `panelDoctor.*` | `doctor-auth.adapter` |
| technician login/logout/me | `panelTechnician.*` | `technician-auth.adapter` |
| mobile otp request | `mobileOtp.request(phone, ctx)` | `mobile-auth.adapter` |
| mobile otp verify | `mobileOtp.verify(phone, code, ctx)` | adapter |
| mobile login | `mobileCredentials.login(...)` | adapter |
| mobile register | `mobileCredentials.register(...)` | adapter |

---

## 5. AuthService interface alignment

**Current interface** (`auth.service.ts`):

```ts
requestOtp(phone: string): Promise<OtpRequestResult>
verifyOtp(phone: string, code: string): Promise<OtpVerifyResult>
refreshToken(refreshToken: string, context: AuthContext): Promise<AuthTokens | null>
revokeToken(userId: string): Promise<void>
```

**P1-03 implementation:**

| Method | Implementation source |
|--------|----------------------|
| `requestOtp` | `MobileOtpAuthService` — map to `OtpRequestResult` (`success`, `maskedPhone`, `expiresIn`, `cooldownSeconds`) |
| `verifyOtp` | `MobileOtpAuthService` — issue access JWT only; `refreshToken` in `AuthTokens` = `""` or omit in DTO mapper |
| `refreshToken` | Return `null` (P1-06 replaces) |
| `revokeToken` | No-op |

**Optional P1-03b (not required for exit):** extend interface with `panelAdminLogin(...)` for internal testing only — compat routes should use adapters, not public Express controller.

---

## 6. Dependency graph

```
auth.module.ts
  └─ AuthService
       └─ IdentityAuthService
            ├─ MobileOtpAuthService → getPrisma(), auth-audit, identity-core, otp-i18n
            ├─ MobileCredentialsAuthService → MobileOtpAuthService (shared user creation)
            ├─ PanelAdminAuthService → getPrisma(), auth-audit, panel-admin-jwt
            ├─ PanelDoctorAuthService
            └─ PanelTechnicianAuthService

Compat routes → adapters → IdentityAuthService (same singleton)
```

**Module registration:** `auth.module.ts` constructs one `IdentityAuthService` and injects into `AuthService` + exported for adapters (or adapters import singleton from `modules/auth/index.ts`).

---

## 7. Rollback plan

| Level | Action |
|-------|--------|
| L1 | Revert route files to pre-W3 (git) — services unused |
| L2 | Re-export legacy libs from original file bodies (keep modules dormant) |
| L3 | Restore stub `AuthService` throwing `AUTH_MIGRATION_PENDING` |

No DB rollback required (no migrations in P1-03).

---

## 8. Effort estimate

| Wave | Days |
|------|------|
| W1 Mobile | 2–3 |
| W2 Panels | 2 |
| W3 Routes | 1–2 |
| W4 Foundation | 1 |
| W5 QA | 0.5 |
| **Total** | **6.5–8.5** dev-days |

---

## 9. Outputs (this planning deliverable)

| Artifact | Path |
|----------|------|
| Port plan | [P1_03_AUTH_PORT_PLAN.md](./P1_03_AUTH_PORT_PLAN.md) |
| API compat | [P1_03_API_COMPAT.md](./P1_03_API_COMPAT.md) |
| Migration plan | This file |

```
P1_03_READY=YES
BREAKING_CHANGE_RISK=LOW
ROUTES_TO_PORT=15
```

### ROUTES_TO_PORT (copy for CI/README)

```
POST /api/admin/auth/login
POST /api/admin/auth/logout
GET  /api/admin/auth/me
POST /api/doctor/auth/login
POST /api/doctor/auth/logout
GET  /api/doctor/auth/me
POST /api/technician/auth/login
POST /api/technician/auth/logout
GET  /api/technician/auth/me
POST /api/mobile/auth/otp/request
POST /api/mobile/auth/otp/verify
POST /api/mobile/auth/send-otp      # re-export
POST /api/mobile/auth/verify-otp    # re-export
POST /api/mobile/auth/login
POST /api/mobile/auth/register
```

**Plus foundation delegate (not compat port):**  
`POST /api/auth/otp/request`, `/otp/verify`, `/login`, `/token/refresh`, `/refresh`, `/logout`

---

## 10. Post P1-03 (next sequence items)

| ID | Depends on P1-03 |
|----|------------------|
| P1-04 | Compat routes already thin — merge into “done” or close |
| P1-05 | Profile locale on `mobile/me` |
| P1-06 | Refresh tokens — extend `AuthService.refreshToken` + compat optional field |
| P1-11 | i18n catalog — move `OTP_MSG` fully under `modules/auth/i18n` |
