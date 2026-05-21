# Prisma state report (Phase 0 — discovery)

**Date:** 2026-05-21  
**Canonical direction:** BACKEND-FIRST  
**Database:** `pranidoctor_db` @ `localhost:5432`

---

## Repository roles (target)

| Repo | Path | Target role |
|------|------|-------------|
| Backend | `D:\PraniDoctor\pranidoctor-backend` | Schema + migrations + seed owner |
| Web | `D:\PraniDoctor\pranidoctor-web` | Generated client + API (legacy) |

**Note:** Docs from cutover defer (`CUTOVER_DEFER_PLAN.md`) conflict with BACKEND-FIRST — reconcile via [PRISMA_CANONICAL_PLAN.md](./PRISMA_CANONICAL_PLAN.md).

---

## Migration counts

| Location | Active migration folders | `migration.sql` present | Extra |
|----------|-------------------------|------------------------|-------|
| **backend** `prisma/migrations/` | 23 | 23/23 | Archive moved to `prisma/_archived_out_of_chain/` |
| **web** `prisma/migrations/` | 23 | 23/23 | None |
| **backend** (pre-repair) | 24 detected | Parent `_archived_backend_foundation` lacked SQL → **P3015** | Fixed by relocate |

---

## Schema differences

| File | Backend hash | Web hash | Diff |
|------|--------------|----------|------|
| `schema.prisma` | `151C2B0B…` | `6DACB0A4…` | **1 line** — owner comment only |
| `migration_lock.toml` | `99836963…` | `99836963…` | **Identical** |
| Per-folder `migration.sql` (23) | — | — | **All hashes match** |

**Generator (both):**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```

**Web** uses `prisma-client` path under `src/generated/prisma` (Next). **Backend** uses `src/generated/prisma` (Express).

---

## Missing files

| Check | Backend | Web |
|-------|---------|-----|
| Active folders missing `migration.sql` | None | None |
| Web-only migration folders | — | None |
| Backend-only migration folders | None (23 match web) | — |
| Recoverable from web → backend | **N/A** — nothing missing in active 23 |

**Pre-repair defect (backend):** `migrations/_archived_backend_foundation/` had nested SQL only — no top-level `migration.sql` → Prisma **P3015**.

---

## Duplicate ownership (conflict)

| Asset | backend `SCHEMA_OWNER.md` | web `SCHEMA_OWNER.md` | Effective before repair |
|-------|---------------------------|----------------------|-------------------------|
| Schema | Staging mirror (web owner) | Production owner (web) | **Web** |
| Migrate scripts | Guarded (blocked) | Full `db:migrate`, `db:deploy:safe` | **Web only** |
| Seed | Guarded | `prisma db seed` | **Web only** |

**package.json scripts:**

| Script | Backend (pre-repair) | Web |
|--------|---------------------|-----|
| `db:migrate` | Guard → blocked | `prisma migrate dev` |
| `db:migrate:deploy` | Guard → blocked | via `db:deploy:safe` |
| `db:seed` | Guard → blocked | `prisma db seed` |
| `db:generate` | Allowed | Allowed |

**Repair applied:** Backend migrate/seed scripts **restored** for BACKEND-FIRST validation.

---

## `prisma.config.ts`

| Field | Backend | Web |
|-------|---------|-----|
| schema path | `prisma/schema.prisma` | Same |
| migrations path | `prisma/migrations` | Same |
| seed | `tsx prisma/seed.ts` | Same |
| datasource | `DATABASE_URL` | Same |
| Extra | `applyResolvedEnv()` via `resolve-env.mjs` | dotenv only |

---

## Seed files

| File | Backend | Web |
|------|---------|-----|
| `seed.ts` | Yes | Yes |
| `seed-admin.ts` | Yes | Yes |
| `seed-demo.ts` | Yes | Yes |
| `seed-demo-reset.ts` | Yes | Yes |
| `demo-seed-shared.ts` | Yes | Yes |
| `seed-data/*` | Yes | Yes |

---

## Environment (database)

| Repo | `DATABASE_URL` DB name | Auth (2026-05-21) |
|------|------------------------|-------------------|
| Backend | `pranidoctor_db` | **Works** (`postgres` user) |
| Web | `pranidoctor_db` | **Fails** P1000 (`postgres:postgres` password) |

Align web `.env` with working credentials before web-side `migrate status`.

---

## Summary

- Active migration SQL is **byte-identical** across repos (23 folders).
- Schema body is **aligned**; only owner comment differs.
- Backend had **invalid archive layout** blocking deploy (repaired).
- Ownership docs/scripts were **inconsistent** with BACKEND-FIRST (repair in progress).
