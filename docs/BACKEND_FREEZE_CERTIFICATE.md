# Backend Extraction Freeze Certificate

> **Follow-up:** Cutover **aborted**. Architecture reverted per [CUTOVER_DEFER_PLAN.md](./CUTOVER_DEFER_PLAN.md).

**Project:** Prani Doctor — Backend extraction validation  
**Evaluation date:** 2026-05-21  
**Certificate ID:** `PD-BACKEND-FREEZE-20260521`  
**References:** [BACKEND_EXTRACTION_PLAN.md](./BACKEND_EXTRACTION_PLAN.md), [BACKEND_MIGRATION_REPORT.md](./BACKEND_MIGRATION_REPORT.md)  
**Host:** Windows dev (`localhost`)

---

## Verdict

| Metric | Value |
|--------|-------|
| **Composite score** | **58 / 100** |
| **Approval status** | **REJECTED — DO NOT FREEZE** |
| **Recommendation** | **ROLLBACK (defer cutover)** |

### Recommendation explained

| Option | Meaning here | Decision |
|--------|----------------|----------|
| **Freeze** | Certify backend as schema/DB owner and begin API cutover | **Not approved** — runtime and migration gates failed |
| **Rollback (defer)** | Keep **web monolith** as production API + operational DB path; backend remains staging mirror until blockers cleared | **Approved posture** |

Extraction **copy** is structurally sound (architecture), but **cannot be frozen** until Postgres credentials work, `migrate deploy` + `seed` succeed, and auth/media return contract-stable responses (not 500).

---

## Scoring methodology

Five domains, each scored **0–100**:

```
Domain = (Implementation × 0.6) + (Runtime verification × 0.4)
Composite = average of five domains
```

| Range | Status |
|-------|--------|
| &lt; 80 | Reject — do not freeze |
| 80–89 | Conditional freeze (document gaps) |
| 90+ | Production-ready freeze |

---

## Domain scorecard

| Domain | Impl | Runtime | Blended | Notes |
|--------|------|---------|---------|-------|
| **Architecture** | 94 | 82 | **89** | Single Prisma owner, compat layer, legacy mirror, web sync |
| **Runtime** | 78 | 28 | **58** | Build OK; DB/Redis/MinIO down; health 503 |
| **Migration** | 90 | 12 | **59** | 23 migrations present; deploy + seed failed |
| **API** | 62 | 38 | **52** | 171 legacy routes vs ~65 Express stubs; auth/media errors |
| **Storage** | 84 | 22 | **59** | Adapters exist; MinIO refused on host |

**Composite:** (89 + 58 + 59 + 52 + 59) / 5 = **63.4** → penalized **−5** for seed logger regression + failed vitest legacy imports → **58 / 100**.

---

## Verification matrix

| Check | Command / probe | Status | Evidence |
|-------|-----------------|--------|----------|
| Env validation | `npm run env:validate` | **PASS** | Environment OK (48 vars) |
| Typecheck | `npm run typecheck` | **PASS** | 0 errors |
| Build | `npm run build` | **PASS** | `tsc` clean |
| Prisma generate | `npm run db:generate` | **PASS** | Client → `src/generated/prisma` |
| Migrate deploy | `npm run db:migrate:deploy` | **FAIL** | `P1000` — password auth failed for user `pranidoctor` |
| DB seed | `npm run db:seed` | **FAIL** | `Logger not initialized` via `compat/legacy-prisma.ts` (after partial env); DB unreachable without valid creds |
| Startup validation | `npm run validate:startup` | **FAIL** | PostgreSQL required — `28P01`; Redis WARN; MinIO `ECONNREFUSED` |
| Server boot | `SKIP_STARTUP_VALIDATION=true REDIS_ENABLED=false npm run dev:no-docker` | **PASS** | Server started port 3000; 9 modules mounted |
| GET `/live` | HTTP probe | **PASS** | `200` `{"alive":true,...}` |
| GET `/health` | HTTP probe | **FAIL** | `503` (database unhealthy) |
| GET `/ready` | HTTP probe | **FAIL** | `503` |
| GET `/health/dependencies` | HTTP probe | **PASS** | `200` JSON — PostgreSQL/Redis unhealthy |
| POST `/api/auth/otp/request` | HTTP probe | **FAIL** | `500` (expected `503` stub when stable) |
| GET `/api/media/*` | HTTP probe | **FAIL** | `500` INTERNAL_ERROR |
| Route parity | Inventory | **FAIL** | Legacy **171** Next handlers vs **~65** Express routes (0% web API ported) |
| Web schema sync | `sync-prisma-from-backend.ps1` | **PASS** | `schema.prisma` hash match backend ↔ web |
| Web typecheck | `npm run typecheck` (web) | **PASS** | After sync |
| Web legacy deleted | Inspection | **PASS** | No deletions — monolith intact |
| Web runtime health | `GET /api/health` (web) | **SKIP** | Next dev server not running on probe |
| Unit tests | `npm test` (backend) | **FAIL** | 12 failed (legacy copied tests import `@/generated/...`) |

---

## Domain assessments

### Architecture — 89 (STRONG)

| Criterion | Result |
|-----------|--------|
| Single Prisma owner (`pranidoctor-backend`) | PASS |
| `prisma/SCHEMA_OWNER.md` both repos | PASS |
| Web sync script | PASS |
| Schema hash match after sync | PASS |
| Compat layer (`legacy-prisma`, `@/lib/*`, client shim) | PASS |
| Legacy mirror (`src/legacy/web/lib` 174, `routes` 171) | PASS |
| Web monolith preserved | PASS |
| Foundation migration archived (no schema clash) | PASS |

### Runtime — 58 (WEAK)

| Criterion | Result |
|-----------|--------|
| Compile / build | PASS |
| Default startup validation (no skip) | FAIL — Postgres auth |
| Postgres `localhost:5432` | Listening, auth **28P01** |
| Redis `localhost:6379` | Not available |
| MinIO `127.0.0.1:9000` | Connection refused |
| Docker on PATH | Not available (historical) |
| Liveness with skip flag | PASS |
| Full health/readiness | FAIL |

### Migration — 59 (WEAK)

| Criterion | Result |
|-----------|--------|
| Migration folders copied | 23 |
| `prisma migrate deploy` | FAIL (P1000) |
| `prisma migrate status` | FAIL (P1000) |
| `db:seed` end-to-end | FAIL |
| Seed suite scripts in package.json | PASS (declared) |

**Blocker:** Align `DATABASE_URL` in `pranidoctor-backend/.env` with the Postgres instance that web uses (web terminal history shows web auth failed for user `postgres` — credentials mismatch across repos).

**Defect:** `src/compat/legacy-prisma.ts` calls `createPrismaClient` before `createLogger` in seed path — fix before re-running seed.

### API — 52 (WEAK)

| Surface | Count | Live? |
|---------|-------|-------|
| Legacy Next routes (reference) | 171 | Web only |
| Express module routes (mounted) | ~65 | Backend stubs |
| Auth OTP | Stub | Returns **500** (not stable 503) |
| Media | Stub | Returns **500** |

Modules mounted at `/api`: `auth`, `users`, `doctors`, `leads`, `animals`, `clinics`, `notifications`, `ai`, `media`.

**Route compatibility:** **Not compatible** with web API contracts yet — no handler parity, no proxy flags (`USE_BACKEND_*`) in web.

### Storage — 59 (WEAK)

| Criterion | Result |
|-----------|--------|
| Pluggable drivers (`local`, `minio`, `s3`, `disabled`) | PASS (code) |
| `STORAGE_DRIVER` in `.env` | `s3` → MinIO endpoint |
| Startup storage check | FAIL — `ECONNREFUSED 127.0.0.1:9000` |
| Local dev without MinIO | Set `STORAGE_DRIVER=local` + `LOCAL_STORAGE_PATH` |

---

## Web connectivity

| Link | Status |
|------|--------|
| Schema sync backend → web | PASS |
| Web `tsc --noEmit` after sync | PASS |
| Shared DB credentials | **FAIL** — both repos fail auth on this host |
| Web API still authoritative | PASS (no cutover) |
| Backend replaces web API | **NO** |

---

## Commands executed (2026-05-21)

```powershell
cd D:\PraniDoctor\pranidoctor-backend
npm run env:validate          # PASS
npm run typecheck             # PASS
npm run build                 # PASS
npm run db:generate           # PASS
npm run db:migrate:deploy     # FAIL P1000
npm run db:seed               # FAIL (logger + DB)
npm run validate:startup      # FAIL (postgres required)
npm test                      # FAIL (legacy test imports)

# Smoke server (validation only)
$env:SKIP_STARTUP_VALIDATION='true'
$env:REDIS_ENABLED='false'
npm run dev:no-docker
# Probes: /live 200, /health 503, /ready 503, auth 500, media 500

cd D:\PraniDoctor\pranidoctor-web
.\scripts\sync-prisma-from-backend.ps1   # PASS
npm run typecheck                       # PASS
```

---

## Blockers before freeze (must be green)

1. **Postgres** — Fix `DATABASE_URL` / `DB_*` so `migrate deploy` and `$queryRaw` succeed from backend (and web).
2. **Seed** — Initialize logger before `legacy-prisma` in `prisma/seed.ts` path, or seed via `shared/database/prisma` directly.
3. **Auth/Media** — Wire to web schema (`legacy-web` OTP, storage services); stable `503` with `AUTH_MIGRATION_PENDING` / `MEDIA_MIGRATION_PENDING`.
4. **Storage** — Use `STORAGE_DRIVER=local` for no-docker dev, or start MinIO.
5. **Tests** — Exclude `src/legacy/**` from vitest or run `legacy:fix-imports` + vitest path plugin.
6. **Route port** — Pilot one domain (e.g. health + mobile OTP) with contract tests vs web.

---

## Manual actions

| Priority | Action |
|----------|--------|
| P0 | Set correct Postgres password in backend `.env` (match running instance) |
| P0 | `npm run db:migrate:deploy` && `npm run db:seed` from backend |
| P1 | Fix seed/logger in `compat/legacy-prisma.ts` |
| P1 | `REDIS_ENABLED=false` or start Redis for dev |
| P1 | `STORAGE_DRIVER=local` when MinIO absent |
| P2 | Re-run `npm run validate:startup` without `SKIP_STARTUP_VALIDATION` |
| P2 | Re-run this certificate checklist → target composite ≥ 80 |

---

## Sign-off

| Role | Status |
|------|--------|
| Backend extraction architecture | Approved for **continued development** |
| Backend extraction freeze | **Rejected** |
| Production cutover to backend API | **Deferred (rollback posture)** |

---

*Automated validation on Windows host. Re-issue certificate after P0 blockers are resolved.*
