# Backend Migration Report

> **Superseded (2026-05-21):** Cutover deferred. Production API + Prisma owner is **pranidoctor-web** again. See [CUTOVER_DEFER_PLAN.md](./CUTOVER_DEFER_PLAN.md).

**Date:** 2026-05-21  
**Plan executed:** [BACKEND_EXTRACTION_PLAN.md](./BACKEND_EXTRACTION_PLAN.md)  
**Source (legacy, unchanged):** `D:\PraniDoctor\pranidoctor-web`  
**Target:** `D:\PraniDoctor\pranidoctor-backend`  
**Mode:** COPY only — no deletions in web  

---

## Executive summary

Backend extraction Phase 1–3 is **complete for infrastructure**. `pranidoctor-backend` is now the **single Prisma owner** (52 models, 23 migrations, full seed suite). Web remains **fully operational** with its original `src/lib`, API routes, and Prisma client — plus a sync script to pull schema from backend.

Express **auth** and **media** modules return `503` (`AUTH_MIGRATION_PENDING` / `MEDIA_MIGRATION_PENDING`) until legacy `mobile-auth` / `storage` services are wired to the web schema. Legacy code is mirrored under `src/legacy/web/` (174 lib files, 171 route handlers) but **excluded from TypeScript compile**.

| Check | Status |
|-------|--------|
| Prisma copied to backend | PASS |
| Migrations (23) + seed suite | PASS |
| Legacy mirror (lib + routes) | PASS |
| Compat layer | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| Web legacy deleted | N/A (not deleted) |
| Auth/media Express APIs live | PENDING |
| Runtime DB migrate/seed verified | NOT RUN (env) |

---

## 1. Single Prisma owner

| Item | Owner | Notes |
|------|--------|------|
| `schema.prisma` | **backend** | 52 models; generator `prisma-client-js` → `src/generated/prisma` |
| `prisma/migrations/` | **backend** | 23 web migrations; foundation migration **archived** (not applied) |
| `prisma/seed*.ts`, `seed-data/` | **backend** | Full MVP + admin + demo seeds |
| Client generation | **backend** | `npm run db:generate` |
| Web copy | **sync only** | `scripts/sync-prisma-from-backend.ps1` copies schema + lock file |

**Archived (incompatible with web schema):**

- `prisma/migrations/_archived_backend_foundation/20260521120000_foundation_core_tables/`

**Documentation:**

- `pranidoctor-backend/prisma/SCHEMA_OWNER.md`
- `pranidoctor-web/prisma/SCHEMA_OWNER.md`

---

## 2. Backend owns DB

All migration and seed commands run **only** from `pranidoctor-backend`:

```powershell
cd D:\PraniDoctor\pranidoctor-backend
# Set DATABASE_URL in .env (see .env.example)
npm run db:migrate:deploy
npm run db:seed
# Optional:
npm run db:seed:admin
npm run db:seed:demo
```

Web must **not** run `prisma migrate dev` against shared databases.

---

## 3. What was copied (not moved)

### 3.1 Prisma / data layer

| From (web) | To (backend) |
|------------|--------------|
| `prisma/schema.prisma` | `prisma/schema.prisma` |
| `prisma/migrations/*` (23 dirs) | `prisma/migrations/*` |
| `prisma/migration_lock.toml` | `prisma/migrations/migration_lock.toml` |
| `prisma/seed.ts` | `prisma/seed.ts` |
| `prisma/seed-admin.ts` | `prisma/seed-admin.ts` |
| `prisma/seed-demo.ts` | `prisma/seed-demo.ts` |
| `prisma/seed-demo-reset.ts` | `prisma/seed-demo-reset.ts` |
| `prisma/demo-seed-shared.ts` | `prisma/demo-seed-shared.ts` |
| `prisma/seed-data/*` | `prisma/seed-data/*` |

**Not copied:** `node_modules`, `.next`, `dist`, `.env`, web `src/generated/prisma` (regenerated locally).

### 3.2 Domain mirror (reference + future Express ports)

| From (web) | To (backend) | Count |
|------------|--------------|-------|
| `src/lib/**` | `src/legacy/web/lib/**` | 174 files |
| `src/app/api/**/route.ts` | `src/legacy/web/routes/**` | 171 handlers |

### 3.3 Auth legacy (partial)

| From (web) | To (backend) |
|------------|--------------|
| `src/lib/mobile-auth/**` | `src/modules/auth/legacy-web/**` |

Foundation auth (`Role` / `UserSession` / Redis OTP) moved to `src/modules/auth/_archived_foundation/` — incompatible with web `MobileOtpChallenge` schema.

### 3.4 Modules / services / repositories / routes

Express module shells remain in `src/modules/*`. Active HTTP surface:

- **Health** — operational
- **Auth** — stub (`AUTH_MIGRATION_PENDING`)
- **Media** — stub (`MEDIA_MIGRATION_PENDING`)
- **Users, doctors, leads, animals, clinics, notifications, ai** — foundation stubs from pre-extraction

Storage adapters (`local`, `minio`, `s3`, `disabled`) retained under `src/modules/media/storage/`.

---

## 4. Compatibility layer

| File | Purpose |
|------|---------|
| `src/compat/legacy-prisma.ts` | Proxy `prisma` for seeds / legacy services |
| `src/lib/prisma.ts` | Shim: re-exports compat prisma |
| `src/generated/prisma/client.ts` | Shim: `@/generated/prisma/client` → `index.js` |
| `src/compat/legacy-modules.ts` | Maps Express modules → legacy lib folders |
| `src/compat/web-paths.ts` | Documents `@/lib/*` path aliases |
| `src/legacy/registry.ts` | Route/lib domain registry |

**TypeScript paths** (`tsconfig.json`):

```json
"@/generated/prisma/client": ["src/generated/prisma/client.ts"],
"@/lib/*": ["src/legacy/web/lib/*"]
```

**Excluded from compile:** `src/legacy/**`, `*_archived_foundation/**`, `auth/legacy-web/**`

**Import rewriter (optional):** `scripts/fix-legacy-imports.mjs` — run before enabling legacy in build.

---

## 5. Web kept operational

| Change (web) | Purpose |
|--------------|---------|
| `scripts/sync-prisma-from-backend.ps1` | Pull schema + lock from backend |
| `prisma/SCHEMA_OWNER.md` | Documents backend ownership |
| Legacy `src/lib`, `src/app/api` | **Untouched** — still serve traffic |

After backend schema changes:

```powershell
cd D:\PraniDoctor\pranidoctor-web
.\scripts\sync-prisma-from-backend.ps1
npm run db:generate
npm run dev
```

---

## 6. Environment updates

### Backend (`.env.example`)

- `DATABASE_URL` — required for migrate/seed
- `REDIS_ENABLED` — optional in dev (`false` = no OTP queues)
- `STORAGE_DRIVER` — `disabled | local | minio | s3`
- JWT secrets aligned with web (`ADMIN_JWT_SECRET`, `MOBILE_JWT_SECRET`, etc.)

Copy and fill locally (never commit `.env`):

```powershell
cd D:\PraniDoctor\pranidoctor-backend
copy .env.example .env
# Edit DATABASE_URL, secrets
npm run env:validate
```

### Web (future proxy — not implemented)

When routing API to backend, add (documented in extraction plan):

- `BACKEND_API_URL=http://localhost:3000`
- `USE_BACKEND_AUTH=false` (default until auth port complete)

---

## 7. Changed / created files

### 7.1 `pranidoctor-backend` (primary)

**Prisma**

- `prisma/schema.prisma` — replaced with web schema (52 models)
- `prisma/migrations/` — 23 migration folders + README
- `prisma/migrations/_archived_backend_foundation/` — moved foundation migration
- `prisma/seed.ts`, `seed-admin.ts`, `seed-demo*.ts`, `demo-seed-shared.ts`
- `prisma/seed-data/*`
- `prisma/SCHEMA_OWNER.md`

**Compat / generated**

- `src/compat/legacy-prisma.ts`, `legacy-modules.ts`, `web-paths.ts`
- `src/lib/prisma.ts`
- `src/generated/prisma/client.ts` (shim)
- `src/generated/prisma/*` (from `prisma generate`)

**Legacy mirror**

- `src/legacy/web/lib/**` (~174 files)
- `src/legacy/web/routes/**` (171 route handlers)
- `src/legacy/registry.ts`

**Modules**

- `src/modules/auth/auth.service.ts` — migration stub
- `src/modules/auth/legacy-web/**` — copied mobile-auth
- `src/modules/auth/_archived_foundation/**` — old foundation auth
- `src/modules/media/media.service.ts`, `media.repository.ts`, `media.controller.ts` — stubs
- `src/modules/media/_archived_foundation/**` — old foundation media
- `src/modules/media/media.module.ts` — controller wiring fix

**Config / scripts**

- `tsconfig.json` — path aliases + excludes
- `package.json` — seed scripts, `bcryptjs`, `legacy:fix-imports`
- `.env.example` — storage/redis/jwt alignment
- `scripts/fix-legacy-imports.mjs`
- `scripts/sync-prisma-from-backend.ps1` — N/A (lives in web)

### 7.2 `pranidoctor-web` (operational sync only)

- `scripts/sync-prisma-from-backend.ps1` — **new**
- `prisma/SCHEMA_OWNER.md` — **new**
- `docs/BACKEND_MIGRATION_REPORT.md` — this file
- `docs/BACKEND_EXTRACTION_PLAN.md` — plan (pre-existing)

**Not deleted:** any `src/lib`, `src/app/api`, `prisma/migrations` in web.

---

## 8. Commands reference

### Backend — setup

```powershell
cd D:\PraniDoctor\pranidoctor-backend
npm install
copy .env.example .env
# Edit DATABASE_URL
npm run db:generate
npm run env:validate
```

### Backend — database

```powershell
npm run db:migrate:deploy
npm run db:seed
npm run db:seed:admin
```

### Backend — dev / verify

```powershell
npm run dev:no-docker          # Postgres required; Redis/storage warn-only
npm run typecheck
npm run build
npm run verify:runtime         # Full matrix (needs services)
```

### Backend — legacy import fix (before compiling legacy)

```powershell
npm run legacy:fix-imports
```

### Web — stay in sync

```powershell
cd D:\PraniDoctor\pranidoctor-web
.\scripts\sync-prisma-from-backend.ps1
npm run db:generate
npm run dev
```

---

## 9. Manual actions required

| # | Action | Owner |
|---|--------|-------|
| 1 | Set `DATABASE_URL` in `pranidoctor-backend/.env` pointing to the **same** Postgres web uses (or a clone) | DevOps |
| 2 | Run `npm run db:migrate:deploy` from backend on each environment | DevOps |
| 3 | Run `npm run db:seed` / `db:seed:admin` after migrate | Dev |
| 4 | Sync web schema after every backend migration: `sync-prisma-from-backend.ps1` + `db:generate` | Dev |
| 5 | Wire `AuthService` to `src/modules/auth/legacy-web/otp-service.ts` (web schema) | Backend |
| 6 | Wire `MediaService` to `src/legacy/web/lib/storage/*` or new repository | Backend |
| 7 | Port Express routes domain-by-domain from `src/legacy/web/routes/` | Backend |
| 8 | Add `BACKEND_API_URL` + feature flags in web when ready to proxy | Web |
| 9 | Initialize git in `pranidoctor-backend` if versioning needed (repo not detected) | Team |

---

## 10. Risks and known gaps

| Risk | Mitigation |
|------|------------|
| Two repos apply migrations | Only backend runs `migrate`; web syncs schema file only |
| Foundation auth used Redis + different tables | Archived; stub returns 503 until mobile-auth port |
| Legacy `@/` imports break if compiled | `tsconfig` excludes `src/legacy/**`; use `fix-legacy-imports` later |
| Schema drift if sync script skipped | CI check: hash `schema.prisma` between repos |
| Runtime not verified on host | Postgres auth / Docker PATH issues — run verify when DB up |

---

## 11. Next phases (from extraction plan)

1. **Auth port** — connect `legacy-web` OTP to Express `AuthController`
2. **Media port** — universal uploads + storage adapters
3. **Route ports** — map 171 Next handlers → Express routers
4. **Web proxy** — `USE_BACKEND_*` flags, gradual traffic shift
5. **Decommission** — only after parity tests; **never delete web legacy until then**

---

## 12. Verification log (this session)

```
cd pranidoctor-backend
npm run typecheck   → exit 0
npm run build       → exit 0
```

Not executed (requires live Postgres):

- `npm run db:migrate:deploy`
- `npm run db:seed`
- `npm run verify:runtime`

---

*Generated after executing BACKEND_EXTRACTION_PLAN.md Phase 1–3 (copy, compat, single owner).*
