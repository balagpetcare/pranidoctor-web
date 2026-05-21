# P1-00 — Baseline & Freeze Verification

**Date:** 2026-05-21  
**Scope:** Pre-implementation snapshot before Phase 1 auth foundation (P1-01, P1-02)

---

## 1. Architecture freeze (confirmed)

| Check | Result |
|-------|--------|
| Backend owns Prisma | `pranidoctor-backend/prisma/schema.prisma` |
| Web API-consumer only | `pranidoctor-web/src/lib/prisma.ts` throws at runtime |
| Compat router active | 172 legacy routes via `compat-web` |
| Frozen envelope | `{ ok, data }` / `{ ok: false, error: { code, message } }` |

References: [ARCHITECTURE_FREEZE.md](./ARCHITECTURE_FREEZE.md), [API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md)

---

## 2. Web Prisma dependency

| Metric | Value |
|--------|-------|
| `PRISMA_DEPENDENCY_COUNT` (runtime DB) | **0** — proxy throws |
| Type-only Prisma imports | Allowed (`import type { Prisma }`) |

---

## 3. Foundation `AuthService` (pre–P1-03)

`pranidoctor-backend/src/modules/auth/auth.service.ts` remains a **stub**:

- All methods throw `ServiceUnavailableError('AUTH_MIGRATION_PENDING', …)`
- Production auth runs on **legacy compat** paths only (`/api/admin|doctor|technician|mobile/auth/*`)

**Not changed in P1-00–P1-02** (by design).

---

## 4. E2E freeze (`npm run e2e:freeze`)

**Run:** 2026-05-21 (backend `http://localhost:3000`)

| Check | Result |
|-------|--------|
| GET /health | PASS (503 — degraded acceptable per script) |
| GET /health/db | PASS (503) |
| GET /health/redis | PASS (503) |
| GET /health/storage | PASS (503) |
| GET /health/modules | PASS (200, compat route count > 0) |
| GET /api/ping | PASS (200, `ok: true`) |
| GET /api/docs/openapi.json | PASS (200) |
| GET /api/mobile/health | PASS (503) |
| Web proxy /api/health | FAIL (web not on :3001) |

**Score:** 8/9 (web proxy skipped — no web changes in this wave)

---

## 5. Auth compat envelope (`npx tsx scripts/p1-auth-compat-verify.ts`)

| Check | Result |
|-------|--------|
| GET /api/ping | PASS |
| POST /api/admin/auth/login (invalid user) | PASS — `{ ok: false, error: { code, message } }` |

Example error (DB reachable or not): codes remain frozen (`invalid_credentials`, `db_unavailable`, `server_error`).

**AUTH_COMPAT:** PASS

---

## 6. Build & tests

| Command | Result |
|---------|--------|
| `npm run build` (backend) | **PASS** |
| `npm run openapi:generate` | **PASS** (172 legacy paths) |
| `npx vitest run src/modules/auth/*.test.ts` + legacy-web phone/otp-env | **PASS** (14 tests) |
| `npm run test` (full suite) | 12 legacy suites fail on `@/` vitest aliases (pre-existing); module tests pass |

---

## 7. Golden auth paths (frozen — unchanged)

- `POST /api/admin/auth/login|logout`, `GET /api/admin/auth/me`
- `POST /api/doctor/auth/login|logout`, `GET /api/doctor/auth/me`
- `POST /api/technician/auth/login|logout`, `GET /api/technician/auth/me`
- `POST /api/mobile/auth/otp/request|otp/verify|login|register`, `send-otp`, `verify-otp`
- `GET /api/mobile/me`

---

## 8. P1-00 exit

| Item | Status |
|------|--------|
| Baseline documented | YES |
| Compat smoke | PASS |
| Web Prisma guard | PASS |
| Ready for P1-01 / P1-02 | YES |
