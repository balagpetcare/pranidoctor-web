# Phase 1 — Authentication & Identity Foundation

**Date:** 2026-05-21  
**Mode:** PLAN ONLY (no implementation in this document)  
**Status:** `PHASE1_READY=YES`

---

## 1. Purpose

Establish a **single, backend-owned identity layer** for Prani Doctor without breaking the frozen API contract ([API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md)) or architecture ([ARCHITECTURE_FREEZE.md](./ARCHITECTURE_FREEZE.md)).

Phase 1 **formalizes and hardens** what already runs in `pranidoctor-backend` via legacy compat routes. It does **not** rewrite panels, mobile clients, or response envelopes.

---

## 2. Frozen constraints (non-negotiable)

| Constraint | Implication for Phase 1 |
|------------|-------------------------|
| Architecture locked | Web proxies only; no Prisma on web |
| Backend owns DB | All migrations in `pranidoctor-backend` |
| Web consumes API | UI calls frozen paths via proxy / `api-client` |
| No schema breaking | Additive tables/columns only; nullable defaults |
| No rewrite | Keep `src/legacy/web/routes/**` behavior; port logic into modules incrementally |

---

## 3. Current state (baseline)

### 3.1 Two auth stacks (intentional debt)

| Stack | Mount | Status | Contract |
|-------|-------|--------|----------|
| **Legacy compat** | `/api/admin|doctor|technician|mobile/auth/*` | **Production** — full OTP, password login, panel cookies | `{ ok, data }` / `{ ok, false, error }` |
| **Foundation module** | `/api/auth/*` (OTP, refresh, logout) | **Stub** — `AuthService` throws `AUTH_MIGRATION_PENDING` | `{ success, data }` (different envelope) |

**Phase 1 rule:** Frozen client paths stay on **legacy compat**. Foundation routes become **aliases** that delegate to the same service implementation after port — never replace frozen paths in place.

### 3.2 Identity data already in Prisma

- `User` — `email`, `phone`, `passwordHash`, `role` (`UserRole`), `status` (`UserStatus`)
- Profiles — `AdminProfile`, `DoctorProfile`, `AiTechnicianProfile`, `CustomerProfile` (`locale` default `bn-BD`)
- `MobileOtpChallenge` — OTP lifecycle (hash, expiry, rate limits)

### 3.3 Gaps vs Phase 1 scope

| Area | Today | Phase 1 target |
|------|-------|----------------|
| **Refresh** | Mobile JWT only (30d access); no refresh token in legacy verify/login | Additive `RefreshToken` store; **optional** in verify response (additive field) |
| **Session** | Stateless JWT in cookies (panels) or Bearer (mobile) | Document session model; optional `UserSession` for revoke-all |
| **Device** | Not modeled | Additive `UserDevice` + register endpoint (mobile) |
| **Permission** | Code matrix in `admin-auth/permissions.ts` (3 capabilities) | Expand matrix; optional DB-backed grants in 1b |
| **Audit** | `logAdminLoginFailure`; domain `ServiceInstanceAuditEvent` | Additive `AuthAuditEvent` for login/logout/OTP/refresh |
| **Localization** | Bengali OTP copy; `CustomerProfile.locale` unused in APIs | Expose locale on `GET/PATCH /api/mobile/me`; central message catalog |

---

## 4. Scope — ten pillars

### 4.1 Authentication

- **Panels:** Email/phone + password → HS256 JWT in HttpOnly cookie (`ADMIN_*`, `DOCTOR_*`, `TECHNICIAN_*` session cookies).
- **Mobile:** OTP verify, legacy `send-otp`/`verify-otp`, password `login`, `register`.
- **Deliverable:** Single `IdentityAuthService` in backend modules, called by legacy route handlers (thin adapters).

### 4.2 Roles

- Authoritative enum: `UserRole` (`SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `DOCTOR`, `AI_TECHNICIAN`, `CUSTOMER`).
- Panel access: role + `UserStatus.ACTIVE` checks in `panel-access.ts` / doctor / technician equivalents.
- **Deliverable:** Role resolution helper used by all guards; no new roles in Phase 1.

### 4.3 Profile

- Mobile: `GET/PATCH /api/mobile/me` (customer profile, `addressJson.areaLabel`).
- Panels: `GET /api/*/auth/me` returns actor + profile slice per panel.
- **Deliverable:** Consistent profile DTOs documented; `locale` readable/writable on mobile me.

### 4.4 Session

- **Panels:** Cookie-bound JWT, max-age from `*_SESSION_MAX_AGE` constants.
- **Mobile:** Bearer access JWT (`aud: mobile`, `role: CUSTOMER`).
- **Deliverable:** Session semantics doc + optional DB session rows for revocation (additive).

### 4.5 Device

- **Greenfield (additive):** `POST /api/mobile/devices/register` (deviceId, platform, pushToken optional).
- Links to `User` after Bearer auth; no breaking change to login flows.

### 4.6 OTP

- `MobileOtpChallenge` + `otp-service` (rate limit, hash, SMS dispatch).
- Frozen paths: `otp/request`, `otp/verify`, `send-otp`, `verify-otp`.
- **Deliverable:** Logic lives under `modules/auth/`; legacy routes unchanged.

### 4.7 Refresh

- Foundation already defines `POST /api/auth/token/refresh` and `/refresh` (stub).
- Legacy mobile **does not** return `refreshToken` today.
- **Deliverable:** Issue refresh on OTP verify/login (additive field); new compat route `POST /api/mobile/auth/refresh` mirroring foundation behavior; frozen clients ignore until upgraded.

### 4.8 Permission

- Admin capability matrix (`serviceInstance.view|review|publish`) by role.
- Doctor/technician: route-level guards + profile status (e.g. provider verification).
- **Deliverable:** Exported capability registry; assert helpers for admin routes; document technician/doctor rules.

### 4.9 Audit

- Retain `logAdminLoginFailure` (structured logs).
- Add `AuthAuditEvent` table: `actorUserId`, `action`, `channel`, `ip`, `userAgent`, `metadata`, `createdAt`.
- Write on login success/failure, logout, OTP request/verify, refresh, permission deny (admin).

### 4.10 Localization

- Primary UX language: Bengali (`bn-BD`).
- `OTP_MSG` and panel error strings centralized in `modules/auth/i18n/`.
- `CustomerProfile.locale` exposed on mobile me; `Accept-Language` respected for **new** endpoints only.

---

## 5. Out of scope (Phase 1)

- OAuth / social login
- MFA beyond SMS OTP
- Password reset flows (unless already in legacy — not in frozen OpenAPI auth set)
- RBAC admin UI for permissions
- Breaking rename of error codes on frozen routes
- Removing `src/legacy/web/**`
- Web-side auth logic (beyond proxy + cookie read for RSC)

---

## 6. Target architecture (end of Phase 1)

```
┌─────────────────────────────────────────────────────────────┐
│ pranidoctor-web                                              │
│  Login UI → proxy → frozen /api/*/auth/*                     │
│  RSC: get*Session() + resolve*PanelActor → /api/*/auth/me     │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼─────────────────────────────────┐
│ pranidoctor-backend                                          │
│  compat-web (frozen paths) ──► identity adapters (thin)      │
│         │                                                    │
│         └──► modules/auth/                                   │
│               IdentityAuthService                            │
│               ├── panel-auth (admin|doctor|technician)       │
│               ├── mobile-otp + mobile-credentials            │
│               ├── refresh + session (additive DB)            │
│               ├── permissions                                │
│               ├── audit                                      │
│               └── i18n                                       │
│  /api/auth/*  ──► delegates to same service (alias)          │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
                     PostgreSQL (additive tables only)
```

---

## 7. Risk register

| Risk | Mitigation |
|------|------------|
| Dual envelope (`ok` vs `success`) | Never change legacy; foundation aliases only |
| Refresh token changes mobile contract | Additive fields only; old apps keep access-only flow |
| AuthService stub called by mistake | Wire foundation to legacy impl; health check lists auth readiness |
| Permission drift | Single `permissions.registry.ts` imported by legacy + modules |

---

## 8. Success criteria

| Criterion | Verification |
|-----------|--------------|
| All frozen auth paths behave identically | Contract tests + `e2e:freeze` auth suite |
| `AuthService` no longer throws migration pending | `POST /api/auth/otp/request` returns 200 in dev |
| Additive migrations applied | `prisma migrate` on backend only |
| Audit rows for login events | Query `AuthAuditEvent` after test login |
| Docs complete | Five `PHASE1_*.md` files + OpenAPI note |
| Web `PRISMA_DEPENDENCY_COUNT=0` | Unchanged |

---

## 9. Related documents

| Document | Contents |
|----------|----------|
| [PHASE1_API_MAP.md](./PHASE1_API_MAP.md) | Endpoint inventory, envelopes, headers |
| [PHASE1_DB_MAP.md](./PHASE1_DB_MAP.md) | Tables, additive schema |
| [PHASE1_UI_FLOW.md](./PHASE1_UI_FLOW.md) | Web/mobile UI flows |
| [PHASE1_IMPLEMENTATION_SEQUENCE.md](./PHASE1_IMPLEMENTATION_SEQUENCE.md) | Ordered work packages |

---

## 10. Sign-off block

```
PHASE1_READY=YES
ESTIMATED_MODULE_COUNT=12
IMPLEMENTATION_ORDER=see PHASE1_IMPLEMENTATION_SEQUENCE.md
```

### Module count breakdown (12)

| # | Module | Repo |
|---|--------|------|
| 1 | `identity-core` | backend |
| 2 | `panel-auth-admin` | backend |
| 3 | `panel-auth-doctor` | backend |
| 4 | `panel-auth-technician` | backend |
| 5 | `mobile-otp` | backend |
| 6 | `mobile-credentials` | backend |
| 7 | `session-store` (additive) | backend |
| 8 | `refresh-tokens` (additive) | backend |
| 9 | `device-registry` (additive) | backend |
| 10 | `permissions-registry` | backend |
| 11 | `auth-audit` | backend |
| 12 | `auth-i18n` | backend |

*Web contributes 0 new backend modules; 4 UI integration tracks (admin, doctor, technician, mobile proxy) reuse existing pages.*

---

## 11. IMPLEMENTATION_ORDER (summary)

1. Baseline tests + audit logging (additive)  
2. Port legacy libs → `modules/auth` (no route change)  
3. Permissions registry extraction  
4. Profile/locale on mobile me  
5. Refresh token schema + mobile refresh route (additive)  
6. Session revocation (optional DB)  
7. Device register endpoint  
8. Foundation `/api/auth` delegation  
9. i18n catalog + Accept-Language  
10. E2E auth certificate + OpenAPI annotate  

Full detail: [PHASE1_IMPLEMENTATION_SEQUENCE.md](./PHASE1_IMPLEMENTATION_SEQUENCE.md).
