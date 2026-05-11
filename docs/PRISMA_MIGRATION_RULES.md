# Prisma migration rules (Prani Doctor web)

These rules apply to **all** environments where the database may contain non-disposable data.

## 1. Never edit an applied migration

After a migration has been applied to **any** shared database (staging, production, or a teammate’s machine you care about), **do not change** its `migration.sql` or folder name. Prisma stores a checksum in `_prisma_migrations`; a mismatch causes **drift** and blocks `migrate deploy` (e.g. P3009).

**If a migration is wrong:** add a **new** forward migration that corrects schema/data.

## 2. Failed migration first, new migration second

If SQL was wrong but **not** yet applied everywhere, fix the migration only on branches/DBs that never received it. Once applied anywhere important, use a **new** migration instead of rewriting history.

## 3. Inspect `_prisma_migrations` before `migrate resolve`

When Prisma reports a **failed** migration:

1. Read the row in `_prisma_migrations` for that name (`npm run prisma:migration:failed`).
2. Determine whether the SQL **fully applied**, **partially** applied, or **rolled back** (manually or by DB restore).
3. Only then choose `--rolled-back` vs `--applied` for `prisma migrate resolve`.

Wrong `resolve` can desynchronize migration history from the real database.

## 4. Use `migrate resolve` only after verification

- **`--rolled-back`**: The failed migration’s changes are **not** in the database (or you reverted them). You will **re-run** the migration on next `migrate deploy`.
- **`--applied`**: The database **already matches** what the migration intended (including manual hotfix). Prisma will **skip** executing that migration file again.

## 5. Never `migrate reset` on important data

`prisma migrate reset` **drops** the database and reapplies migrations. Use **only** on explicitly disposable local databases when everyone agrees data loss is acceptable.

## 6. Unique indexes on location masters require preflight

Before adding **unique** (or partial unique) indexes on `Division` / `District` / `Upazila` / `Union` / `Village`:

1. Backup.
2. `npm run locations:duplicates` (or `locations:report-duplicates`).
3. `npm run locations:migration:preflight` (duplicate trimmed-code groups must be **0**).
4. `npm run locations:dedupe:dry-run`, then `locations:dedupe:apply` after review (script rewires FKs such as `AiTechnicianProfile` / `AiTechnicianDivisionServiceArea` / `AiTechnicianServiceArea` before deleting duplicate rows).

## 7. Always backup before migration repair

Before `migrate resolve`, manual SQL, or dedupe `--apply`, take a logical backup (`pg_dump` or provider snapshot). See `docs/prisma-migration-repair-20260511.md` for PowerShell examples.

## 8. Prefer safe deploy in CI and ops

Use:

```powershell
npm run db:deploy:safe
```

instead of raw `npx prisma migrate deploy`. The guard enforces git cleanliness on tracked migrations (when `.git` exists), blocks failed/drift status from Prisma, and runs location duplicate preflight.

## 9. Drift and checksum warnings

If Prisma reports **drift** or “migration modified after it was applied”, restore migration files from the **exact git revision** that matches the checksums in `_prisma_migrations`, or follow Prisma’s documented repair path—**do not** reset production.

## 10. Document exceptions

Any intentional exception to the above must be recorded in `docs/` with date, author, database name, and rollback plan.
