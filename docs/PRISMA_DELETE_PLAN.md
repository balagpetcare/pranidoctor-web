# Prisma safe cleanup plan (Phase 5)

**Date:** 2026-05-21  
**Rule:** **DO NOT DELETE** until all validation gates pass.  
**Current:** **DELETE_READY = NO**

---

## Preconditions (all required for DELETE_READY = YES)

| # | Gate | Status |
|---|------|--------|
| 1 | Backend `migrate deploy` on target DB | PASS |
| 2 | Backend `db:seed` | PASS |
| 3 | Web `DATABASE_URL` works for `migrate status` | **FAIL** (P1000) |
| 4 | 23/23 `migration.sql` hashes match | PASS |
| 5 | `PRISMA_CANONICAL_PLAN` applied (docs + sync script) | PARTIAL |
| 6 | CI runs migrate from backend only | Not verified |
| 7 | Team sign-off on BACKEND-FIRST | Pending |

---

## Backup path (before any delete)

```powershell
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = "D:\PraniDoctor\_prisma_backup_$stamp"
New-Item -ItemType Directory -Force -Path $backup

# Web duplicate assets
Copy-Item -Recurse "D:\PraniDoctor\pranidoctor-web\prisma\migrations" "$backup\web-migrations"
Copy-Item "D:\PraniDoctor\pranidoctor-web\prisma\schema.prisma" "$backup\web-schema.prisma"
Copy-Item -Recurse "D:\PraniDoctor\pranidoctor-web\prisma\seed-data" "$backup\web-seed-data" -ErrorAction SilentlyContinue
Copy-Item "D:\PraniDoctor\pranidoctor-web\prisma\seed.ts" "$backup\web-seed.ts"

# Optional: seed variants
Copy-Item "D:\PraniDoctor\pranidoctor-web\prisma\seed-*.ts" "$backup\" -ErrorAction SilentlyContinue
```

Store backup outside both repos. Verify zip/hash before deletion.

---

## Removable from WEB only (after DELETE_READY = YES)

**Not removable yet.** Planned targets:

| Path (web) | Reason | Replacement |
|------------|--------|-------------|
| `prisma/migrations/` (entire tree) | Duplicate of backend chain | Migrate via backend; web keeps no SQL history |
| `prisma/seed.ts` | Duplicate | Run seed from backend CI or remove web seed script |
| `prisma/seed-admin.ts` | Duplicate | `backend` `db:seed:admin` |
| `prisma/seed-demo.ts` | Duplicate | Backend scripts |
| `prisma/seed-demo-reset.ts` | Duplicate | Backend scripts |
| `prisma/demo-seed-shared.ts` | Duplicate | Backend copy |
| `prisma/seed-data/` | Duplicate | Backend copy |

**Keep in web (permanent):**

| Path | Reason |
|------|--------|
| `prisma/schema.prisma` | Synced copy for `prisma generate` |
| `prisma/migrations/migration_lock.toml` | Synced lock file |
| `prisma/SCHEMA_OWNER.md` | Documents synced copy role |
| `src/generated/prisma/` | Runtime client output |

---

## Never delete (both repos)

| Path | Reason |
|------|--------|
| `backend/prisma/migrations/*.sql` | Canonical history |
| `backend/prisma/_archived_out_of_chain/` | Archived foundation reference |
| `backend/src/legacy/**` | Legacy mirror |
| `web/src/lib/**` | Production API logic |
| `web/src/app/api/**` | Production routes |

---

## Removable from BACKEND only (optional, low priority)

| Path | When |
|------|------|
| `scripts/prisma-production-guard.mjs` | After team confirms migrate restored |
| Duplicate `src/legacy/web/lib` if ever re-copied | Never auto-delete |

---

## Rollback steps

1. Restore web `prisma/migrations/` from backup.
2. Restore web seed files from backup.
3. Re-run `npm run db:generate` in web.
4. Point `DATABASE_URL` to last known good DB snapshot (if schema rollback needed, use DB restore — **no** `migrate reset`).
5. Revert `SCHEMA_OWNER.md` to web-owner if abandoning BACKEND-FIRST.
6. Re-enable web `db:deploy:safe` as primary deploy path.

**Do not use:** `prisma migrate reset`, `db push --force-reset`, force push.

---

## Execution order (future)

1. Backup (above).
2. Update CI to backend-only migrate.
3. Run `sync-prisma-from-backend.ps1` (restored).
4. Remove web `prisma/migrations/` directories (23 folders) — **files only after sign-off**.
5. Remove duplicate web seed scripts; update `package.json` to drop `db:seed` or proxy to backend docs.
6. Verify `next build` + `db:generate`.

---

## DELETE_READY

**NO** — web env + canonical doc sync incomplete. Re-evaluate after web `migrate status` passes read-only against `pranidoctor_db`.
