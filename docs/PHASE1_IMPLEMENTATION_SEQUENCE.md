# Phase 1 — Implementation Sequence

**Date:** 2026-05-21  
**Prerequisite docs:** [PHASE1_AUTH_PLAN.md](./PHASE1_AUTH_PLAN.md), [PHASE1_API_MAP.md](./PHASE1_API_MAP.md), [PHASE1_DB_MAP.md](./PHASE1_DB_MAP.md), [PHASE1_UI_FLOW.md](./PHASE1_UI_FLOW.md)

---

## Sign-off

```
PHASE1_READY=YES
ESTIMATED_MODULE_COUNT=12
```

---

## IMPLEMENTATION_ORDER

Execute in order. **Do not skip contract tests** between waves.

| Step | ID | Work package | Depends on | Est. |
|------|-----|--------------|------------|------|
| 1 | P1-00 | Baseline & freeze verification | — | 0.5d |
| 2 | P1-01 | Auth audit (additive DB + writers) | P1-00 | 1d |
| 3 | P1-02 | Extract `permissions-registry` | P1-00 | 0.5d |
| 4 | P1-03 | Port legacy auth libs → `modules/auth` | P1-00 | 2d |
| 5 | P1-04 | Wire compat routes → module services (thin adapters) | P1-03 | 1d |
| 6 | P1-05 | Profile & locale on mobile me | P1-04 | 0.5d |
| 7 | P1-06 | RefreshToken schema + service | P1-01 | 1.5d |
| 8 | P1-07 | Mobile refresh route + optional verify field | P1-06 | 1d |
| 9 | P1-08 | UserSession + logout revocation | P1-06 | 1d |
| 10 | P1-09 | UserDevice register API | P1-04 | 1d |
| 11 | P1-10 | Foundation `/api/auth` delegation | P1-04, P1-06 | 1d |
| 12 | P1-11 | auth-i18n catalog + Accept-Language | P1-03 | 1d |
| 13 | P1-12 | E2E auth certificate + OpenAPI | P1-07–P1-11 | 1d |
| 14 | P1-13 | Optional technician login page (web) | P1-04 | 0.5d |

**Total estimate:** ~12–14 engineering days (1 developer), parallelizable P1-01 + P1-02 after P1-00.

---

## P1-00 — Baseline & freeze verification

**Goal:** Prove starting point before identity work.

**Tasks:**

1. Run `npm run e2e:freeze` in backend (backend on :3000).
2. Snapshot auth responses for golden paths (admin login, mobile otp request mock/dev).
3. Document current `AuthService` stub behavior (`AUTH_MIGRATION_PENDING`).
4. Confirm web `PRISMA_DEPENDENCY_COUNT=0`.

**Exit:** Checklist in `docs/E2E_CERTIFICATE.md` auth section (append).

---

## P1-01 — Auth audit

**Goal:** `AuthAuditEvent` table + writers on all auth mutations.

**Tasks:**

1. Migration: `AuthAuditAction` + `AuthAuditEvent` ([PHASE1_DB_MAP.md](./PHASE1_DB_MAP.md)).
2. `modules/auth/auth-audit.service.ts` — `record(event)`.
3. Hook: admin/doctor/technician login success/failure, logout.
4. Hook: mobile OTP request/verify, password login.
5. Hook: permission deny (`assertAdminCan`).
6. Retain existing `logAdminLoginFailure` (dual-write to DB + log).

**Exit:** Rows visible in DB after test login; no response shape change.

---

## P1-02 — Permissions registry

**Goal:** Single source for capability matrix.

**Tasks:**

1. Create `modules/auth/permissions.registry.ts` from `legacy/web/lib/admin-auth/permissions.ts`.
2. Re-export from legacy path (re-export only, no logic change).
3. Document doctor/technician route guards in registry comments.
4. Unit tests: SUPER_ADMIN publish, SUPPORT view-only.

**Exit:** `adminCan` behavior identical to pre-extract.

---

## P1-03 — Port legacy libs → modules/auth

**Goal:** `AuthService` implementation exists (no stub).

**Tasks:**

1. Move implementations from `legacy/web/lib/mobile-auth/*` into `modules/auth/` (otp, jwt, guard, phone, credentials).
2. Move panel auth: `admin-auth`, `doctor-auth`, `technician-auth` jwt/cookies/secrets into subfolders.
3. Keep `legacy-web/` copies as re-exports during transition (or symlink imports).
4. Shared `identity-core`: normalize phone, resolve user by role, status checks.

**Exit:** Unit tests for OTP hash, JWT sign/verify pass in module path.

---

## P1-04 — Compat route adapters

**Goal:** Legacy route files ≤ 30 lines — delegate to services.

**Tasks:**

1. `admin/auth/login` → `PanelAdminAuthService.login`
2. Repeat doctor, technician, mobile otp/login/register/me.
3. Remove duplicate Prisma calls from routes where service centralizes queries.
4. **Do not** change JSON keys or error codes.

**Exit:** Contract tests P1-00 still green.

---

## P1-05 — Profile & locale

**Goal:** Expose `CustomerProfile.locale` on mobile me.

**Tasks:**

1. `GET /api/mobile/me` — include `locale` in `data`.
2. `PATCH /api/mobile/me` — accept optional `locale` (validate `bn-BD`, `en-US` whitelist).
3. Update OpenAPI / Flutter contract doc (additive field).

**Exit:** PATCH round-trip in integration test.

---

## P1-06 — Refresh tokens

**Goal:** DB-backed refresh for mobile.

**Tasks:**

1. Migration `RefreshToken`.
2. `RefreshTokenService.issue(userId, context)` on OTP verify + password login.
3. `RefreshTokenService.rotate(hash)` for refresh endpoint.
4. Hash tokens with server pepper; never log raw token.

**Exit:** Unit tests for issue, rotate, revoke, expired.

---

## P1-07 — Mobile refresh API

**Goal:** Clients can refresh without re-OTP.

**Tasks:**

1. Add `POST /api/mobile/auth/refresh` compat route — envelope `{ ok, data: { accessToken, expiresInSeconds } }`.
2. Add optional `refreshToken` to `otp/verify` and `login` **data** (additive).
3. Flutter guide: store refresh when present; fallback to long-lived access if absent.

**Exit:** New route in OpenAPI; old clients unaffected.

---

## P1-08 — Session store

**Goal:** Revocable panel/mobile sessions.

**Tasks:**

1. Migration `UserSession` (optional link refresh to session id).
2. On panel login: insert session row; embed `sessionId` in JWT claim (additive claim — only new logins).
3. Logout: revoke session + clear cookie.
4. Middleware: if session revoked, treat as logged out (backward compat: no sessionId in old JWTs → valid until exp).

**Exit:** Logout invalidates session row; old JWTs without sessionId still work until TTL.

---

## P1-09 — Device registry

**Goal:** Track mobile devices for push/revoke.

**Tasks:**

1. Migration `UserDevice`.
2. `POST /api/mobile/devices/register` — Bearer required.
3. Web proxy `src/app/api/mobile/devices/register/route.ts`.
4. Audit: `DEVICE_REGISTER` action (extend enum if needed).

**Exit:** Device row after register; duplicate `deviceKey` upserts.

---

## P1-10 — Foundation `/api/auth` delegation

**Goal:** Remove `AUTH_MIGRATION_PENDING`.

**Tasks:**

1. `AuthController` calls same services as compat.
2. Map foundation DTOs to legacy shapes where external callers use foundation (document differences).
3. Optional: add compat shim `POST /api/auth/otp/request` → redirect internally to mobile path for single entry — **low priority**.

**Exit:** `POST /api/auth/otp/request` returns 200 in dev with valid phone.

---

## P1-11 — Localization catalog

**Goal:** Central i18n for auth messages.

**Tasks:**

1. `modules/auth/i18n/messages.bn.ts`, `messages.en.ts`.
2. Replace inline `OTP_MSG` imports with catalog (re-export for compat).
3. `resolveMessage(code, locale)` for new endpoints.
4. Honor `Accept-Language` on device register + refresh errors only (frozen routes keep existing Bengali strings).

**Exit:** No string content change on frozen mobile OTP errors.

---

## P1-12 — E2E auth certificate

**Goal:** Release gate for Phase 1.

**Tasks:**

1. Extend `scripts/e2e-freeze-verify.ts` with auth subset (or `e2e:auth-phase1`).
2. Update `docs/E2E_CERTIFICATE.md`.
3. `npm run openapi:generate` — include new paths.
4. Mark `FEATURE_READY` auth slice in architecture doc appendix.

**Exit:** Script passes 10/10 contract matrix ([PHASE1_API_MAP.md](./PHASE1_API_MAP.md) §10).

---

## P1-13 — Optional technician login page

**Goal:** Parity with doctor web UX.

**Tasks:**

1. `src/app/technician/login/page.tsx` + form component.
2. POST `/api/technician/auth/login` — same UX as doctor.

**Exit:** Manual login test; can defer post-Phase 1.

---

## Module-to-step mapping

| Module | Steps |
|--------|-------|
| identity-core | P1-03, P1-04 |
| panel-auth-admin | P1-03, P1-04, P1-08 |
| panel-auth-doctor | P1-03, P1-04, P1-08 |
| panel-auth-technician | P1-03, P1-04, P1-08, P1-13 |
| mobile-otp | P1-03, P1-04, P1-11 |
| mobile-credentials | P1-03, P1-04 |
| session-store | P1-08 |
| refresh-tokens | P1-06, P1-07, P1-10 |
| device-registry | P1-09 |
| permissions-registry | P1-02 |
| auth-audit | P1-01 |
| auth-i18n | P1-11 |

---

## Parallelization guide

```
P1-00 ──┬──► P1-01 (audit)
        ├──► P1-02 (permissions)
        └──► P1-03 ──► P1-04 ──┬──► P1-05 (profile)
                               ├──► P1-06 ──► P1-07
                               ├──► P1-08
                               ├──► P1-09
                               └──► P1-10
                                        └──► P1-11 ──► P1-12
```

---

## Rollback strategy

| Change type | Rollback |
|-------------|----------|
| Additive migration | Leave tables; feature-flag writers |
| Service port | Revert adapter imports to legacy lib |
| New routes | Remove route file; clients unused until shipped |
| JWT sessionId claim | Old tokens work without claim |

---

## Definition of done (Phase 1 complete)

- [ ] All steps P1-00–P1-12 complete (P1-13 optional)
- [ ] `AuthService` fully implemented
- [ ] Frozen auth paths unchanged (contract tests)
- [ ] Additive migrations deployed to staging
- [ ] `PHASE1_*` docs merged
- [ ] OpenAPI regenerated
- [ ] Flutter team notified of additive `refreshToken` + `locale`

---

## Output block (copy for CI/README)

```
PHASE1_READY=YES
ESTIMATED_MODULE_COUNT=12
IMPLEMENTATION_ORDER=P1-00,P1-01,P1-02,P1-03,P1-04,P1-05,P1-06,P1-07,P1-08,P1-09,P1-10,P1-11,P1-12[,P1-13]
```
