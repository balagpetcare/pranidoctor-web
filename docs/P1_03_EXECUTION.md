# P1-03 — Execution Report (Legacy Auth Port)

**Date:** 2026-05-21  
**Scope:** Backend `pranidoctor-backend` only — no web/schema changes

---

## 1. Summary

P1-03 ports legacy authentication business logic into `src/modules/auth/` while keeping all **15 frozen compat routes** as thin re-exports to compat adapters. Foundation `AuthService` implements mobile OTP (no longer `AUTH_MIGRATION_PENDING`).

---

## 2. Modules delivered

| Module | Path | Role |
|--------|------|------|
| identity-core | `identity-core.ts`, `phone.ts` | Channels, role helpers, BD phone normalize |
| identity-auth | `identity-auth.service.ts` | Facade: admin, doctor, technician, mobileOtp |
| panel-admin-auth | `services/panel-admin-auth.service.ts` | Login, logout audit, resolveActor |
| panel-doctor-auth | `services/panel-doctor-auth.service.ts` | Doctor panel login + actor |
| panel-technician-auth | `services/panel-technician-auth.service.ts` | Technician panel login + actor |
| mobile-otp-auth | `services/mobile-otp-auth.service.ts` | OTP request/verify (bcrypt, Prisma) |
| tokens | `tokens/panel-*-token.ts`, `mobile-jwt.ts` | jose HS256 signing (frozen claims) |
| AuthService | `auth.service.ts` | Foundation OTP + noop refresh/revoke |
| compat adapters | `compat/*-auth.adapter.ts` | Map services → `{ ok, data }` |

---

## 3. Legacy bridges (re-exports)

| Legacy path | Canonical |
|-------------|-----------|
| `@/lib/admin-auth/jwt`, `secrets`, `constants` | `tokens/panel-admin-token.ts` |
| `@/lib/doctor-auth/*` (jwt, secrets, constants) | `tokens/panel-doctor-token.ts` |
| `@/lib/technician-auth/*` | `tokens/panel-technician-token.ts` |
| `@/lib/mobile-auth/jwt`, `secrets`, `constants` | `tokens/mobile-jwt.ts` |
| `@/lib/mobile-auth/otp-service` | `services/mobile-otp-auth.service.ts` |
| `@/lib/mobile-auth/phone` | `phone.ts` |
| `@/lib/admin-auth/panel-access` | `PanelAdminAuthService.resolveActor` |
| `@/lib/doctor-auth/panel-access` | `PanelDoctorAuthService.resolveActor` |
| `@/lib/technician-auth/panel-access` | `PanelTechnicianAuthService.resolveActor` |
| `@/lib/admin-auth/permissions` | `permissions.registry.ts` (P1-02) |

---

## 4. Compat routes (thin)

All handlers are one-line re-exports, e.g.:

```ts
export { handleAdminLogin as POST } from '@auth/compat/admin-auth.adapter.js';
```

| Route file | Adapter |
|------------|---------|
| `admin/auth/login|logout|me` | `admin-auth.adapter` |
| `doctor/auth/login|logout|me` | `doctor-auth.adapter` |
| `technician/auth/login|logout|me` | `technician-auth.adapter` |
| `mobile/auth/otp/request|verify|login|register` | `mobile-auth.adapter` |
| `mobile/auth/send-otp` | re-export `otp/request` |
| `mobile/auth/verify-otp` | re-export `otp/verify` |

---

## 5. Verification results

| Command | Result |
|---------|--------|
| `npm run build` | **PASS** |
| `npx vitest run src/modules/auth/` (excl. archived) | **17/17 PASS** |
| `npm run openapi:generate` | **PASS** (172 legacy paths) |
| `npm run p1:auth-compat` | **2/2 PASS** |
| `npm run e2e:freeze` | **9/9 PASS** |

**Note:** Health/db probes return 503 when DB is unreachable in the running process; compat envelope checks still pass.

---

## 6. Foundation AuthService

| Method | Status |
|--------|--------|
| `requestOtp` | Implemented → `MobileOtpAuthService` |
| `verifyOtp` | Implemented → access JWT, empty `refreshToken` |
| `refreshToken` | Returns `null` (P1-06) |
| `revokeToken` | No-op log (P1-08) |

---

## 7. Intentionally deferred

- Mobile password `login` / `register` logic remains in `customer-credentials-service` (adapter calls legacy lib)
- `_archived_foundation` Redis auth — not activated
- Refresh tokens in compat OTP response
- Web repo changes

---

## 8. Sign-off

```
P1_03_COMPLETE=YES
AUTH_SERVICE_READY=YES
LEGACY_PORTED=YES
BREAKING_CHANGE=NO
```
