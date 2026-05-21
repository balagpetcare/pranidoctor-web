# Cutover defer plan

**Decision date:** 2026-05-21  
**Decision:** **Abort backend cutover** — restore production ownership to web monolith.  
**Certificate:** [BACKEND_FREEZE_CERTIFICATE.md](./BACKEND_FREEZE_CERTIFICATE.md) (58/100 — rejected)

Nothing is deleted. No code moves. No business-logic edits in this action.

---

## Architecture (effective immediately)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRODUCTION — D:\PraniDoctor\pranidoctor-web                               │
│   • Next.js UI (admin, enterprise, public)                              │
│   • 171 API route handlers (/api/*)                                     │
│   • Prisma schema + migrations (sole authority)                         │
│   • Domain services (src/lib/*)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    optional mirror sync (schema + lock file only)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STAGING — D:\PraniDoctor\pranidoctor-backend                            │
│   • Express scaffold + foundation modules (stubs)                       │
│   • src/legacy/web/* — copied reference (171 routes, 174 lib files)    │
│   • prisma/* — mirror copy; migrate/seed BLOCKED                        │
│   • db:generate only for local Express dev                              │
└─────────────────────────────────────────────────────────────────────────┘
```

| Concern | Production owner | Staging mirror |
|---------|------------------|----------------|
| HTTP API | **web** | Express (~71 routes, not production) |
| Prisma schema | **web** | Copy |
| Migrations apply | **web** | **Blocked** (`prisma-production-guard.mjs`) |
| Seed | **web** | **Blocked** |
| Client generate | **web** (primary) | **backend** (local dev only) |

**Docs:** [API_OWNER.md](./API_OWNER.md), [prisma/SCHEMA_OWNER.md](../prisma/SCHEMA_OWNER.md), `pranidoctor-backend/ARCHITECTURE.md`

**Backlog:** [EXTRACTION_BACKLOG.md](./EXTRACTION_BACKLOG.md)

---

## 1. Route parity

### 1.1 Inventory

| Surface | Route handlers | Prefix pattern |
|---------|----------------|----------------|
| **Web (production)** | **171** | `/api/{segment}/...` |
| **Backend Express (staging)** | **~71** | `/api/{module}/...` + root health |
| **Legacy mirror (reference)** | **171** | Copied Next `route.ts` under `src/legacy/web/routes` |

### 1.2 Web routes by segment

| Segment | Count | Production? |
|---------|-------|-------------|
| `mobile` | 71 | Yes |
| `admin` | 70 | Yes |
| `doctor` | 14 | Yes |
| `locations` | 7 | Yes |
| `technician` | 5 | Yes |
| `notifications` | 3 | Yes |
| `health` | 1 | Yes |
| **Total** | **171** | |

### 1.3 Backend Express routes (mounted)

**Root (no `/api` prefix):**

| Method | Path | Notes |
|--------|------|-------|
| GET/POST | `/health` | DB-dependent status |
| GET | `/ready` | Readiness |
| GET | `/live` | Liveness |
| GET | `/health/dependencies` | Dependency matrix |
| GET | `/health/system` | Dev only |

**`/api/{module}` (9 modules, ~65 handlers):**

| Module | Mount | ~Routes | Web equivalent |
|--------|-------|---------|----------------|
| `auth` | `/api/auth` | 6 | Partial overlap with `mobile/auth/otp/*` (different paths) |
| `users` | `/api/users` | 6 | Partial `mobile/me`, customer |
| `doctors` | `/api/doctors` | 7 | Partial `doctor/*` |
| `leads` | `/api/leads` | 7 | No direct web segment |
| `animals` | `/api/animals` | 8 | Partial mobile animals |
| `clinics` | `/api/clinics` | 11 | Partial AI technician clinics |
| `notifications` | `/api/notifications` | 8 | Partial `notifications/*` (3 web routes) |
| `ai` | `/api/ai` | 6 | Partial `mobile/ai-services` |
| `media` | `/api/media` | 6 | Partial `mobile/uploads`, `admin/uploads` |

### 1.4 Parity summary

| Metric | Value |
|--------|-------|
| Handler count ratio | 71 / 171 ≈ **42%** (count only) |
| Semantic / contract parity | **~0%** (paths, auth, payloads differ) |
| `admin/*` coverage | **0 / 70** |
| `mobile/*` coverage | **fragment** (auth/media partial stubs) |
| `locations/*` coverage | **0 / 7** (compat map only, no module) |
| `service-instances` | **0** (high-traffic domain, no Express module) |

**Conclusion:** Backend cannot replace web API. Staging routes are foundation stubs, not ported handlers.

---

## 2. Migration parity

| Item | Web (production) | Backend (mirror) | Parity |
|------|------------------|------------------|--------|
| Migration folders (active) | 23 | 23 (copy) | Files aligned |
| Archived foundation migration | — | `_archived_backend_foundation/` | Backend-only archive |
| `migration_lock.toml` | Owner | Synced via mirror script | Lock aligned when synced |
| `schema.prisma` | Owner | Mirror comment updated | Same content when synced |
| `migrate deploy` authority | **web** | **blocked** | Ownership reverted |
| `migrate dev` authority | **web** | **blocked** | Ownership reverted |
| `db:seed` authority | **web** | **blocked** | Ownership reverted |

**Production commands:**

```bash
cd D:\PraniDoctor\pranidoctor-web
npm run db:migrate
npm run db:deploy:safe
npm run db:seed
```

**Staging allowed:**

```bash
cd D:\PraniDoctor\pranidoctor-backend
npm run db:generate
# npm run db:migrate:deploy  → BLOCKED
```

**Mirror refresh (optional):**

```powershell
cd D:\PraniDoctor\pranidoctor-web
.\scripts\sync-prisma-mirror-to-backend.ps1
```

---

## 3. Module parity

### 3.1 Express modules (staging)

| Module | Status | Implementation |
|--------|--------|----------------|
| auth | Stub | `AUTH_MIGRATION_PENDING` |
| media | Stub | `MEDIA_MIGRATION_PENDING` |
| users, doctors, leads, animals, clinics | Foundation stubs | Pre-extraction scaffold |
| notifications, ai | Foundation stubs | Pre-extraction scaffold |
| health | Operational | Depends on DB/Redis |

### 3.2 Legacy lib domains (copied reference)

| Domain | Files in mirror | Express module |
|--------|-----------------|----------------|
| `mobile-auth` | `legacy-web` + lib | auth (stub) |
| `storage` | lib | media (stub) |
| `service-instances` | lib | **none** |
| `admin-semen` | lib | **none** |
| `admin-auth` | lib | **none** |
| `locations` | lib | **none** |
| `mobile-ai-technician` | lib | partial `clinics`/`ai` |
| `mobile-ai-services` | lib | partial `ai` |
| `notifications`, `sms` | lib | partial `notifications` |
| `doctor-service-requests` | lib | partial `doctors` |
| `mobile-service-requests` | lib | **none** |

### 3.3 Parity summary

| Metric | Value |
|--------|-------|
| Legacy lib domains | 12 |
| Express modules mounted | 9 |
| Domains with working port | 0 |
| Domains with stub only | 2 (auth, media) |

---

## 4. Runtime parity

Evidence from [BACKEND_FREEZE_CERTIFICATE.md](./BACKEND_FREEZE_CERTIFICATE.md) (2026-05-21):

| Check | Web (production path) | Backend (staging) |
|-------|----------------------|-------------------|
| Env validation | N/A script | PASS |
| Typecheck | PASS | PASS |
| Build | PASS (Next) | PASS |
| `db:generate` | PASS | PASS |
| `db:migrate:deploy` | **web** (auth fail on host) | **BLOCKED** (guard) |
| `db:seed` | FAIL (auth on host) | **BLOCKED** (guard) |
| `validate:startup` | N/A | FAIL (Postgres 28P01) |
| Server boot | `next dev` | PASS with `SKIP_STARTUP_VALIDATION` |
| `/live` | — | PASS 200 |
| `/health` | `/api/health` | FAIL 503 (DB) |
| Auth OTP | Web routes live | FAIL 500 (stub) |
| Traffic | **100% web** | **0% backend** |

| Runtime dimension | Parity |
|-------------------|--------|
| Shared Postgres credentials | Not verified on dev host |
| API traffic routing | Web only |
| Staging usable without skip flags | No |
| Production cutover safe | No |

---

## 5. Release criteria (future cutover)

Cutover may be reconsidered only when **all** gates pass:

### 5.1 Governance

- [ ] Written approval after pilot domain score ≥ 80
- [ ] Rollback runbook tested (flag flip to web &lt; 5 min)
- [ ] No dual migration authority (single repo runs `migrate deploy`)

### 5.2 Migration / data

- [ ] `migrate deploy` + `seed` green from **one** owner repo on staging DB
- [ ] Schema hash match: production → mirror script run in CI
- [ ] Zero drift: `prisma migrate status` clean on staging and production

### 5.3 Route / API

- [ ] Pilot domain (recommended: **mobile OTP + health**) — contract tests pass vs web
- [ ] Error shape parity (status codes, `code`, `message`)
- [ ] Auth middleware parity (mobile JWT, admin JWT separate)
- [ ] ≥ 1 domain at 100% route parity before expanding
- [ ] `admin` segment plan approved (70 routes — largest block)

### 5.4 Module / logic

- [ ] Stubs removed for shipped domains
- [ ] No `500` on intentional unavailable paths (use `503` + stable code)
- [ ] Business logic unchanged — ports are thin wrappers over existing `src/lib` behavior

### 5.5 Runtime

- [ ] `validate:startup` PASS without `SKIP_STARTUP_VALIDATION`
- [ ] `/health` and `/ready` 200 on staging with real Postgres
- [ ] Load test on pilot domain ≥ web p95 latency
- [ ] `npm test` green (legacy excluded or imports fixed)

### 5.6 Traffic shift

- [ ] `USE_BACKEND_{DOMAIN}` flags in web env
- [ ] 7-day shadow traffic compare (errors, latency)
- [ ] On-call sign-off

---

## 6. Actions completed (this defer)

| # | Action | Location |
|---|--------|----------|
| 1 | Web marked API owner | `docs/API_OWNER.md` |
| 2 | Backend marked mirror | `pranidoctor-backend/ARCHITECTURE.md` |
| 3 | Prisma ownership disabled in backend | `prisma/SCHEMA_OWNER.md`, schema comment |
| 4 | Migrate/seed ownership removed from backend | `package.json` + `scripts/prisma-production-guard.mjs` |
| 5 | Extraction backlog | `docs/EXTRACTION_BACKLOG.md` |
| 6 | Route comparison | §1 above |
| 7 | Deprecated reverse sync | `scripts/sync-prisma-from-backend.ps1` → exit 1 |
| 8 | Mirror sync web → backend | `scripts/sync-prisma-mirror-to-backend.ps1` |

---

## 7. What teams should do now

**Web / product engineering**

- All features ship via `pranidoctor-web` API routes and `src/lib`.
- Create migrations only in web; follow `PRISMA_MIGRATION_RULES.md`.

**Backend / platform**

- Treat `pranidoctor-backend` as R&D staging — use backlog for pilots.
- Do not point mobile or admin clients at Express port in production.
- Use `npm run db:generate` only; never `db:migrate*` from backend on shared DBs.

**DevOps**

- Single migration pipeline from web repo.
- Optional CI step: `sync-prisma-mirror-to-backend.ps1` + backend `db:generate` (no migrate).

---

## 8. Related documents

| Document | Purpose |
|----------|---------|
| [BACKEND_EXTRACTION_PLAN.md](./BACKEND_EXTRACTION_PLAN.md) | Original plan (superseded by defer) |
| [BACKEND_MIGRATION_REPORT.md](./BACKEND_MIGRATION_REPORT.md) | Copy execution report |
| [BACKEND_FREEZE_CERTIFICATE.md](./BACKEND_FREEZE_CERTIFICATE.md) | Validation score 58/100 |
| [EXTRACTION_BACKLOG.md](./EXTRACTION_BACKLOG.md) | Prioritized follow-up work |

---

*Cutover deferred. Production: `pranidoctor-web`. Staging mirror: `pranidoctor-backend`.*
