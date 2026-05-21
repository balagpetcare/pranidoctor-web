# Prisma web backup report (Phase 1)

**Date:** 2026-05-21  
**Backup ID:** `20260521-151048`  
**Location:** `docs/prisma_cleanup_backup/20260521-151048/`

---

## Backed up from `pranidoctor-web`

| Item | Path in backup | Files |
|------|----------------|-------|
| Prisma folder | `prisma/` | schema, migrations (23), seeds, seed-data |
| Prisma config | `prisma.config.ts` | 1 |
| Package snapshot | `package.json.snapshot` | prisma-related scripts captured |
| Manifest | `MANIFEST.txt` | inventory |

**Total items in backup tree:** 62 files

---

## Not backed up (still in repo)

| Item | Notes |
|------|-------|
| `src/generated/prisma/` | Regenerated via `npm run db:client:sync` from backend |
| `src/app/api/**` | 171 route handlers unchanged |
| `src/lib/**` services | Unmigrated server modules |

---

## Rollback (restore ownership to web)

```powershell
$bak = "D:\PraniDoctor\pranidoctor-web\docs\prisma_cleanup_backup\20260521-151048"
Copy-Item -Recurse "$bak\prisma" "D:\PraniDoctor\pranidoctor-web\prisma" -Force
Copy-Item "$bak\prisma.config.ts" "D:\PraniDoctor\pranidoctor-web\prisma.config.ts" -Force
# Restore package.json scripts manually from package.json.snapshot
cd D:\PraniDoctor\pranidoctor-web
npm install
npm run db:generate
```

**Database:** No backup/restore of DB contents performed (per rules).

---

## Status

**Backup:** COMPLETE  
**Integrity:** Verified (folder exists, 62 files)
