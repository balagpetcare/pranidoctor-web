# Web Prisma removal report (Phase 2)

**Date:** 2026-05-21  
**Backup:** [PRISMA_WEB_BACKUP_REPORT.md](./PRISMA_WEB_BACKUP_REPORT.md)

---

## Deleted from web (after backup)

| Path | Status |
|------|--------|
| `prisma/` (entire directory) | **REMOVED** |
| `prisma/migrations/` | **REMOVED** (included in above) |
| `prisma/seed.ts` | **REMOVED** |
| `prisma.config.ts` | **REMOVED** |

**Nothing deleted outside `prisma/` + `prisma.config.ts`.**

---

## Removed `package.json` scripts

| Removed script |
|----------------|
| `db:generate` (prisma CLI) |
| `db:guard` |
| `db:deploy:safe` |
| `db:migrate` |
| `db:push` |
| `db:seed` |
| `db:seed:demo` |
| `db:seed:reset-demo` |
| `seed` |
| `seed:admin` |
| `db:studio` |
| `prisma:migration:status` |
| `prisma:migration:failed` |

---

## Added scripts

| Script | Purpose |
|--------|---------|
| `db:client:sync` | Copy `src/generated/prisma` from backend |
| `postinstall` | Auto-sync client on `npm install` |

---

## Removed dependencies

| Package | Notes |
|---------|-------|
| `prisma` (CLI) | Removed from dependencies |

**Kept (transitional):** `@prisma/client`, `@prisma/adapter-pg`, `pg` — unmigrated server routes still use `src/lib/prisma.ts`.

---

## Kept / replaced

| Item | Location |
|------|----------|
| Generated client | `src/generated/prisma/` (synced from backend) |
| Browser enum shim | `src/generated/prisma/browser.ts` (auto-written on sync) |
| Ownership doc | Removed `prisma/SCHEMA_OWNER.md` with folder — see [SCHEMA_OWNERSHIP_LOCK.md](./SCHEMA_OWNERSHIP_LOCK.md) |

---

## DELETE_EXECUTED

**YES** — web `prisma/` ownership artifacts removed after backup.

---

## Database impact

**NONE** — no migrations, seeds, or resets run from web during removal.
