# PHASE 2 — AUTHENTICATION & USER SYSTEM

**Document type:** Identity architecture plan  
**Date:** 2026-05-21  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) — freeze rules **override** all work  
**Prerequisites:** [PHASE1_PLAN.md](./PHASE1_PLAN.md) (backend foundation), [PHASE1_FREEZE.md](./PHASE1_FREEZE.md) (auth), [PHASE2_FREEZE.md](./PHASE2_FREEZE.md) (profile/area)  
**Implementation repo:** `pranidoctor-backend/src/modules/identity/` (new, additive)

**Naming note:** This **Phase 2 Auth & User** plan is distinct from the historical **Profile Phase 2** freeze (`PHASE2_FREEZE.md`). It completes identity orchestration **without rewriting** frozen P1 auth or P2 profile internals.

---

## Freeze Compatibility

```
DATABASE_FROZEN=true
API_FROZEN=true
MIGRATION_FROZEN=true   (additive only)
DEPENDENCY_FROZEN=true
```

| Gate | Application |
|------|-------------|
| **SAFE_TO_MODIFY** | New `modules/identity/**`, extend `modules/user/**`, `scripts/phase2-auth-verify.ts`, docs, additive `/api/identity/*` routes |
| **DO_NOT_TOUCH** | `modules/auth/**`, `modules/profile/**`, `modules/area/**`, `legacy/web/routes/**`, response envelope files |
| **Rule §9** | No auth/session/device **internal rewrites** — delegate to frozen services only |
| **Rule §5** | Compat routes keep `{ ok, data }`; new routes use foundation `{ success, data }` |

### Compliance summary

| Area | Status | Notes |
|------|--------|-------|
| AUTH core (OTP, panel login, refresh) | **BLOCKED** (edit) | Frozen in `modules/auth/**` — use delegation |
| AUTH orchestration layer | **ALLOWED** | New `LoginOrchestrator` wraps frozen services |
| USER lifecycle (customer) | **ALLOWED** | Extend `modules/user/**` |
| PROFILE read/update | **BLOCKED** (edit) | Frozen `modules/profile/**` — facade only |
| SESSION engine facade | **ALLOWED** | Wrap `SessionService` / `DeviceService` |
| Email login (panel) | **CONDITIONAL** | Delegate to frozen panel auth — no new compat routes |
| Email login (mobile) | **BLOCKED** | No mobile email route in freeze; stub provider only |
| Social login | **CONDITIONAL** | Provider abstraction + stub; **no OAuth routes** until schema unfreeze |
| SocialIdentity DB table | **BLOCKED** (this phase) | Additive migration deferred — stub returns `NOT_IMPLEMENTED` |
| New `/api/identity/*` routes | **ALLOWED** | Additive foundation envelope |
| Role matrix changes | **BLOCKED** | `permissions.registry.ts` frozen |
| Brute-force on legacy routes | **BLOCKED** | R-007 — legacy rate limits deferred |

---

## Modules

### AUTH

| Field | Detail |
|-------|--------|
| **Purpose** | Unified login orchestration across OTP, email (panel), and future social |
| **Responsibilities** | Method discovery, provider routing, token lifecycle delegation |
| **Boundaries** | Does **not** implement OTP/crypto — delegates to `IdentityAuthService` |
| **Integration** | `getIdentityAuthService()`, `RefreshTokenService`, panel auth services |
| **Files impacted** | `modules/identity/login/*`, `otp/*`, `email/*`, `social/*` (**new**) |
| **Migration impact** | None |
| **Rollback** | Remove `identity` module mount; delete `modules/identity/` |

### USER

| Field | Detail |
|-------|--------|
| **Purpose** | Customer user lifecycle — lookup, activation state |
| **Responsibilities** | Role/status helpers, customer activation checks |
| **Boundaries** | Customer scope only; admin role assignment stays in admin flows |
| **Integration** | `modules/user` repository, Prisma `User` / `UserRole` / `UserStatus` |
| **Files impacted** | `modules/user/user.repository.ts`, `user.service.ts`, `user.types.ts` |
| **Migration impact** | None |
| **Rollback** | Revert user module extensions |

### PROFILE

| Field | Detail |
|-------|--------|
| **Purpose** | Read-only facade over frozen profile services |
| **Responsibilities** | Basic, address, language, farm summary aggregation |
| **Boundaries** | No edits to `customer-profile.service.ts` or address schema |
| **Integration** | `CustomerProfileService`, `CustomerAddressService`, `FarmContextService` |
| **Files impacted** | `modules/identity/profile/profile-facade.service.ts` (**new**) |
| **Migration impact** | None |
| **Rollback** | Remove facade |

### SESSION

| Field | Detail |
|-------|--------|
| **Purpose** | Multi-device session management facade |
| **Responsibilities** | List devices, revoke device, session activity metadata |
| **Boundaries** | Delegates to frozen `SessionService` / `DeviceService` |
| **Integration** | `getSessionService()`, `getDeviceService()`, `AuthAuditEvent` via auth audit |
| **Files impacted** | `modules/identity/session/session-engine.service.ts` (**new**) |
| **Migration impact** | None |
| **Rollback** | Remove session facade |

---

## Identity Model

### Login Methods

| Method | Status | Implementation |
|--------|--------|----------------|
| **Mobile OTP** | **Stable** (frozen P1) | `DelegateOtpProvider` → `IdentityAuthService.mobileOtp` |
| **Email login** | **Partial** | Panel: `PanelEmailAuthProvider` → frozen panel services; Mobile: **not exposed** |
| **Social login** | **Experimental** | `StubSocialAuthProvider` — interface only, returns `NOT_IMPLEMENTED` |

### Roles (Prisma `UserRole` mapping)

| Domain role | Prisma enum | Notes |
|-------------|-------------|-------|
| farmer | `CUSTOMER` | Mobile OTP primary |
| doctor | `DOCTOR` | Panel email + password |
| ai_technician | `AI_TECHNICIAN` | Panel email + password |
| admin | `ADMIN` | Panel email + password |
| super_admin | `SUPER_ADMIN` | Extended admin matrix |

Helpers: `identity-core.ts` (frozen) + new `identity/guards/role.guard.ts`

### Profile dimensions

| Dimension | Frozen owner | Phase 2 access |
|-----------|--------------|----------------|
| basic | `CustomerProfileService` | Facade `getBasicProfile(userId)` |
| address | `CustomerAddressService` | Facade `getAddressSummary(userId)` |
| language | `locale` on profile | Facade `getLocale(userId)` |
| farm | `FarmContextService` | Facade `getFarmSummary(userId)` |

### Sessions

| Capability | Frozen owner | Phase 2 access |
|------------|--------------|----------------|
| multi-device | `DeviceService` | `SessionEngine.listDevices(userId)` |
| revoke | `DeviceService.revokeWithCascade` | `SessionEngine.revokeDevice(userId, deviceId)` |
| device tracking | `UserDevice` table | Existing P1-09 |
| activity | `UserSession.lastSeenAt` | `SessionEngine.getActiveSessionCount(userId)` |

---

## Security

| Topic | Policy |
|-------|--------|
| **Token lifecycle** | Access JWT + refresh rotation via frozen `RefreshTokenService` — identity layer does not mint tokens directly except via orchestrator delegation |
| **Refresh strategy** | Rotate-on-refresh (P1-07 frozen); compat **401** vs foundation **400** on bad refresh preserved |
| **Session expiry** | TTL from `refresh-token.config.ts`; `SessionService.assertActive` |
| **Brute-force protection** | OTP rate limits in frozen OTP services; legacy routes **without** rate limits remain R-007 debt |
| **Audit compatibility** | All revoke paths call frozen `recordAuthAuditFireAndForget` via `DeviceService` |
| **Permission boundaries** | Admin matrix frozen in `permissions.registry.ts`; identity guards are read-only checks |

---

## Additive API surface

| Method | Path | Envelope | Auth |
|--------|------|----------|------|
| GET | `/api/identity/capabilities` | `{ success, data }` | Public |
| GET | `/api/identity/session/devices` | `{ success, data }` | Bearer (mobile JWT) |
| POST | `/api/identity/session/devices/:deviceId/revoke` | `{ success, data }` | Bearer |
| GET | `/api/identity/profile/summary` | `{ success, data }` | Bearer |

**Frozen routes unchanged:** all `/api/mobile/auth/*`, panel auth, `/api/mobile/me`, devices compat paths.

---

## Implementation order

1. `modules/identity/` core types + providers + orchestrator
2. Session engine + profile facade + user lifecycle extensions
3. Identity module routes + mount in `modules/index.ts`
4. Unit tests (auth delegation, session, role, profile, user)
5. `scripts/phase2-auth-verify.ts`
6. `docs/PHASE2_IMPLEMENTATION.md`

---

## Exit criteria

| Criterion | Target |
|-----------|--------|
| Zero edits to DO_NOT_TOUCH paths | Required |
| Additive routes only | Required |
| No schema migration (social deferred) | Required |
| `npm run test` identity tests pass | Required |
| `npm run phase2:auth-verify` pass | Required |
| `npm run build` pass | Required |
| `p1:12-verify` + `p2:verify` regression | Required |

---

```
PHASE2_AUTH_PLANNED=YES
FREEZE_COMPLIANT=YES
```
