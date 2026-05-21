# Extraction backlog (staging mirror)

**Cutover:** Deferred — production stays on `pranidoctor-web`.  
**Plan:** [CUTOVER_DEFER_PLAN.md](./CUTOVER_DEFER_PLAN.md)

Priority: **P0** = blocks cutover | **P1** = domain pilot | **P2** = polish

---

## P0 — Governance (done / maintain)

| ID | Item | Status |
|----|------|--------|
| G-1 | Web marked API + Prisma owner | Done |
| G-2 | Backend marked staging mirror | Done |
| G-3 | Backend migrate/seed scripts guarded | Done |
| G-4 | `sync-prisma-mirror-to-backend.ps1` (web → backend) | Done |
| G-5 | Deprecate `sync-prisma-from-backend.ps1` | Done |

---

## P0 — Infrastructure

| ID | Item | Owner repo | Notes |
|----|------|------------|-------|
| I-1 | Align `DATABASE_URL` on dev/staging hosts | web | P1000 auth blocked migrate/seed |
| I-2 | Fix backend seed + `legacy-prisma` logger init | backend | Seed fails without `createLogger` |
| I-3 | Document `REDIS_ENABLED=false`, `STORAGE_DRIVER=local` for no-docker | backend | LOCAL_DEV_NO_DOCKER.md |
| I-4 | Exclude `src/legacy/**` from vitest or fix `@/` imports | backend | 12 test files fail |

---

## P1 — Auth (pilot domain)

| ID | Item | Legacy source | Express target |
|----|------|---------------|----------------|
| A-1 | Wire OTP to web schema (`MobileOtpChallenge`) | `src/lib/mobile-auth` | `/api/auth` |
| A-2 | Contract test: OTP request/verify vs web | `mobile/auth/otp/*` | `/api/auth/otp/*` |
| A-3 | Remove `AUTH_MIGRATION_PENDING` stub | `auth.service.ts` | — |
| A-4 | Admin panel JWT (separate from mobile) | `admin-auth` | New module or web-only |

---

## P1 — Media / storage

| ID | Item | Legacy source | Express target |
|----|------|---------------|----------------|
| M-1 | Port universal uploads | `src/lib/storage` | `/api/media` |
| M-2 | Contract test vs `mobile/uploads`, `admin/uploads` | web routes | backend media |
| M-3 | Stable 503 → 501/503 with error codes (not 500) | stubs | controllers |

---

## P1 — Health & ops

| ID | Item | Notes |
|----|------|-------|
| H-1 | `/health` 200 when DB up (mirror uses same DB) | parity with web `/api/health` |
| H-2 | Readiness gate before any traffic shift | k8s / load balancer |

---

## P2 — Route ports (by web segment)

| Segment | Routes | Backend module | Priority |
|---------|--------|----------------|----------|
| `mobile` | 71 | multiple | After auth pilot |
| `admin` | 70 | new `admin-*` modules | Large effort |
| `doctor` | 14 | `doctors` (partial) | Medium |
| `locations` | 7 | new `locations` | Medium |
| `technician` | 5 | overlap `ai`? | Low |
| `notifications` | 3 | `notifications` stub | Low |
| `health` | 1 | root health | Done (partial) |

---

## P2 — Modules without Express mount

| Legacy lib domain | Mapped in compat | Express module |
|-------------------|------------------|----------------|
| `service-instances` | yes | **none** |
| `admin-semen` | yes | **none** |
| `admin-auth` | no | **none** |
| `sms` | no | **none** |
| `mobile-service-requests` | no | **none** |
| `locations` | yes | **none** |

---

## P2 — Cutover mechanics (when criteria met)

| ID | Item |
|----|------|
| C-1 | Feature flag `USE_BACKEND_API` per domain in web |
| C-2 | Reverse proxy / API gateway route map |
| C-3 | Dual-write audit period |
| C-4 | Rollback runbook (flip flag to web) |

---

## Explicit non-goals (this phase)

- Delete legacy in web
- Move files between repos
- Change business logic in services
- Backend-owned migrations
