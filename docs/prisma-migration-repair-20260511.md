# Prisma P3009 repair — `20260511133000_location_dedupe_unique_constraints` (2026-05-11)

This document describes how Prani Doctor **pranidoctor-web** ended up with migration **P3009 / failed migration / drift** symptoms around location unique indexes, how to **diagnose** safely, and how to **repair without `migrate reset`** or dropping location data.

---

## A. Diagnosis snapshot (workspace inspection)

### A.1 Migrations involved

| Folder | Purpose |
|--------|---------|
| `prisma/migrations/20260510145715_add_location_master_fields` | Adds `isVerified`, geo, `nameBn`/`nameEn` on villages, non-unique indexes on codes/names. |
| `prisma/migrations/20260511133000_location_dedupe_unique_constraints` | **Pre-flight DO block** counts duplicate `(parent, trim(code))` groups; then creates **partial unique** indexes on `TRIM(code)` where code is non-empty. |

### A.2 Root cause of failure (typical)

1. **Duplicate rows** still exist for the same trimmed `code` under the same parent (e.g. two `District` rows with same `divisionId` + trimmed `code`). The migration’s `RAISE EXCEPTION` aborts before indexes are created → Prisma records the migration as **failed** (P3009 family).

2. **Checksum / drift**: If `migration.sql` (or an earlier applied migration) was **edited after** it was applied, Prisma reports **drift** and that the file was “modified after it was applied”. **Do not silently re-edit** applied files on shared DBs; restore from git or follow Prisma’s repair story (see `docs/PRISMA_MIGRATION_RULES.md`).

### A.3 What the failed migration SQL does (no silent edits in this doc)

File: `prisma/migrations/20260511133000_location_dedupe_unique_constraints/migration.sql`

- Runs a **DO** block that **counts** duplicate groups (same logic as `npm run locations:migration:preflight`).
- If any count &gt; 0 → **exception** with instructions to run duplicate reports and dedupe.
- If counts are 0 → creates these **partial unique indexes** (PostgreSQL):

  - `Division_code_trim_uidx`
  - `District_division_code_trim_uidx`
  - `Upazila_district_code_trim_uidx`
  - `Union_upazila_code_trim_uidx`
  - `Village_union_code_trim_uidx`

Indexes use `WHERE code IS NOT NULL AND trim(code) &lt;&gt; ''` so empty codes do not participate.

### A.4 Data-preserving dedupe (FK safety)

`npm run locations:dedupe:apply` runs `scripts/locations/dedupe-locations.ts`, which **rewires foreign keys** before deleting duplicate location rows, including (non-exhaustive):

- `AiTechnicianProfile` (`districtId`, `upazilaId`, `unionId`, …)
- `AiTechnicianDivisionServiceArea`
- `AiTechnicianServiceArea` (village merges)
- `District` / `Upazila` / … children of merged parents

**Do not delete duplicate location rows by hand** until references are updated.

### A.5 Git / schema note (this repo)

At documentation time, `git status` may show `prisma/schema.prisma` modified and some migration folders as **untracked** (`??`) depending on clone state. **Your** repair must use **your** `git diff` / history. Rule: migration files on disk must match what was applied (checksum) or you must `migrate resolve` and/or restore from git.

---

## B. Backup before any repair (PowerShell, Windows)

**Never skip backup** on a database you care about.

### B.1 `pg_dump` custom format (recommended)

```powershell
# From repo root; ensure PostgreSQL client tools are on PATH.
New-Item -ItemType Directory -Force -Path ".\backups" | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = Join-Path (Resolve-Path ".\backups") "pranidoctor-pre-migrate-$stamp.dump"
pg_dump --dbname="$env:DATABASE_URL" -Fc -f "$out"
Write-Host "Wrote $out"
```

### B.2 Plain SQL (alternative)

```powershell
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = ".\backups\pranidoctor-pre-migrate-$stamp.sql"
New-Item -ItemType Directory -Force -Path ".\backups" | Out-Null
pg_dump --dbname="$env:DATABASE_URL" -f "$out"
```

### B.3 Hosted DB (RDS, Neon, etc.)

Use the provider’s **snapshot / backup** UI or CLI **in addition** to `pg_dump` when possible.

---

## C. Diagnostic commands (PowerShell)

Run from `D:\PraniDoctor\pranidoctor-web` with `DATABASE_URL` set (e.g. `.env` loaded in your shell or `dotenv` via npm scripts).

```powershell
npm run prisma:migration:status
npm run prisma:migration:failed
npm run locations:duplicates
npm run locations:migration:preflight
npm run locations:indexes:check   # only succeeds if all five unique indexes exist
npm run db:guard                  # full gate (git + duplicates + prisma status)
```

---

## D. Scenario 1 — Failed migration SQL was **not** fully applied

**Symptoms:** `npm run locations:indexes:check` **fails** (one or more of the five `_trim_uidx` indexes missing). `_prisma_migrations` shows the migration as failed; Prisma suggests `migrate resolve`.

**Goal:** Clear duplicate data, mark migration rolled back, deploy again so Prisma **re-executes** the migration.

### D.1 Steps

1. **Backup** (section B).
2. `npm run locations:duplicates` — review JSON/MD under `data/locations/reports/`.
3. `npm run locations:dedupe:dry-run` — review `data/locations/reports/location-dedupe-last-run.json`.
4. `npm run locations:dedupe:apply` — **only after** backup and review (mutates DB).
5. `npm run locations:migration:preflight` — must print **OK** (0 duplicate groups).
6. Mark the failed migration as rolled back (tells Prisma it did **not** complete):

   ```powershell
   npx prisma migrate resolve --rolled-back "20260511133000_location_dedupe_unique_constraints"
   ```

7. Deploy and generate:

   ```powershell
   npm run db:deploy:safe
   ```

   (Or manually: `npm run db:guard && npx prisma migrate deploy && npx prisma generate`.)

8. Validate:

   ```powershell
   npm run locations:indexes:check
   npm run prisma:migration:status
   ```

---

## E. Scenario 2 — SQL was **already** applied (manually or migration partially succeeded)

**Symptoms:** All five partial unique indexes **exist** (`locations:indexes:check` passes). Duplicates are gone. Prisma still lists the migration as **failed** (history out of sync).

**Goal:** Tell Prisma the migration is already satisfied so history advances **without** re-running destructive SQL.

### E.1 Steps

1. **Backup** (section B).
2. `npm run locations:migration:preflight` — should be 0.
3. `npm run locations:indexes:check` — must pass.
4. Optionally compare index definitions in DB to `migration.sql` (names + predicate + indexed columns).
5. Mark applied:

   ```powershell
   npx prisma migrate resolve --applied "20260511133000_location_dedupe_unique_constraints"
   ```

6. Continue deploy:

   ```powershell
   npm run db:deploy:safe
   ```

---

## F. Drift / “modified after applied” on `20260510145715_*`

If Prisma complains **`20260510145715_add_location_master_fields` was modified after it was applied**:

1. **Do not** edit that file on disk for shared DBs without aligning checksum strategy.
2. **Restore** `prisma/migrations/20260510145715_add_location_master_fields/migration.sql` from git to the **commit** that matches the checksum stored in `_prisma_migrations` for that row.
3. If the database **already** has the columns/indexes from a hotfix, prefer a **new** corrective migration for any *additional* change, and keep historical files immutable.

Details: [Prisma — baselining / drift](https://www.prisma.io/docs/guides/migrate/production-troubleshooting) and internal policy `docs/PRISMA_MIGRATION_RULES.md`.

---

## G. Preventing recurrence

1. Before any deploy that adds location uniqueness: `npm run locations:migration:preflight`.
2. Use **`npm run db:deploy:safe`** instead of raw `npx prisma migrate deploy`.
3. Never edit applied migrations; use new migrations for fixes.
4. Keep `locations:dedupe` dry-run output in version control or ticket system for audit when merging duplicates in prod.

---

## H. Recommended command sequence **right now** (operator checklist)

> Adjust **Scenario 1 vs 2** after `locations:indexes:check`.

```powershell
Set-Location D:\PraniDoctor\pranidoctor-web

# 1) Backup
New-Item -ItemType Directory -Force -Path ".\backups" | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
pg_dump --dbname="$env:DATABASE_URL" -Fc -f ".\backups\pranidoctor-pre-migrate-$stamp.dump"

# 2) Diagnostics
npm run prisma:migration:status
npm run prisma:migration:failed
npm run locations:duplicates
npm run locations:migration:preflight

# 3) Dedupe (if preflight fails)
npm run locations:dedupe:dry-run
# Review output + data/locations/reports/location-dedupe-last-run.json
npm run locations:dedupe:apply

# 4) Re-check
npm run locations:migration:preflight

# 5) Decide resolve:
#    If indexes MISSING → rolled back:
# npx prisma migrate resolve --rolled-back "20260511133000_location_dedupe_unique_constraints"
#    If all five indexes PRESENT → applied:
# npx prisma migrate resolve --applied "20260511133000_location_dedupe_unique_constraints"

# 6) Deploy + generate (guard + deploy + generate)
npm run db:deploy:safe

# 7) Future routine
# npm run db:deploy:safe
```

---

## I. Script map (package.json)

| Script | Role |
|--------|------|
| `prisma:migration:status` | `prisma migrate status` |
| `prisma:migration:failed` | Prints `_prisma_migrations` rows |
| `locations:duplicates` | Duplicate report (JSON + MD) |
| `locations:dedupe:dry-run` | Dedupe without `--apply` |
| `locations:dedupe:apply` | Dedupe with writes |
| `locations:migration:preflight` | SQL duplicate counts (same as migration DO block) |
| `locations:indexes:check` | Verifies five partial unique indexes exist |
| `db:guard` | `scripts/prisma-migration-guard.ts` |
| `db:deploy:safe` | `db:guard` + `migrate deploy` + `generate` |

---

## J. Manual test checklist (after repair)

1. `npm run prisma:migration:status` → no failed migrations; schema in sync.
2. `npm run locations:migration:preflight` → OK.
3. `npm run locations:indexes:check` → OK.
4. App queries against locations / technician profiles still work.
5. CI uses `npm run db:deploy:safe` for deploy jobs.
