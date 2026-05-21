# Prisma canonical ownership plan (Phase 4)

**Date:** 2026-05-21  
**Decision:** **BACKEND-FIRST** — supersedes cutover defer web-owner docs for Prisma only.

---

## Final owner

| Asset | Owner | Path |
|-------|--------|------|
| `schema.prisma` | **backend** | `pranidoctor-backend/prisma/schema.prisma` |
| `prisma/migrations/` | **backend** | `pranidoctor-backend/prisma/migrations/` |
| `prisma.config.ts` | **backend** | `pranidoctor-backend/prisma.config.ts` |
| Seed suite | **backend** | `pranidoctor-backend/prisma/seed*.ts` |
| `migrate dev` / `migrate deploy` | **backend** | `npm run db:migrate`, `db:migrate:deploy` |
| Generated client (runtime) | **web** | `pranidoctor-web/src/generated/prisma/` |
| Generated client (runtime) | **backend** | `pranidoctor-backend/src/generated/prisma/` |

---

## Web responsibilities (after transition)

1. **Generate only** — `npm run db:generate` after syncing schema from backend.
2. **No new migrations** in web for shared environments.
3. **No seed** against production from web (optional local-only with same DB creds).
4. Keep `src/lib/prisma.ts` using web-generated client until API cutover completes.

---

## Sync workflow

```powershell
# After backend schema/migration changes:
cd D:\PraniDoctor\pranidoctor-backend
npx prisma migrate dev --name <change>
npm run db:migrate:deploy   # staging/prod
npm run db:generate

# Push schema to web (new script — replace deprecated reverse sync):
cd D:\PraniDoctor\pranidoctor-web
.\scripts\sync-prisma-from-backend.ps1   # restore: backend → web
npm run db:generate
```

**Deprecate:** `sync-prisma-mirror-to-backend.ps1` (web → backend) for routine use.

---

## Documentation updates required

| File | New content |
|------|-------------|
| `backend/prisma/SCHEMA_OWNER.md` | Backend owns schema + migrations |
| `web/prisma/SCHEMA_OWNER.md` | Synced copy; generate only |
| `backend/ARCHITECTURE.md` | Backend-first Prisma |
| `backend/prisma/schema.prisma` line 4 | Owner comment → backend |
| `web/prisma/schema.prisma` line 4 | Owner comment → synced from backend |
| Retire / annotate | `CUTOVER_DEFER_PLAN.md` Prisma sections |

---

## Script changes (done 2026-05-21)

| Repo | Change |
|------|--------|
| Backend | Restored `db:migrate`, `db:migrate:deploy`, `db:seed` (removed production guard) |
| Backend | Keep `scripts/prisma-production-guard.mjs` unused or repurpose as warning-only |

---

## Single source of truth rules

1. **One migration chain** — only backend creates folders under `prisma/migrations/`.
2. **One deploy path** — CI runs `npm run db:migrate:deploy` from backend.
3. **Web parity** — `migration.sql` files synced via script; hashes must match (verified 23/23).
4. **Archives** — out-of-chain SQL under `prisma/_archived_out_of_chain/`, never under `migrations/`.

---

## API ownership (unchanged in this phase)

- **Production API:** still `pranidoctor-web` until Express route parity (see `CUTOVER_DEFER_PLAN.md` API section).
- **Prisma owner ≠ API owner** during transition.

---

## Validation gate before web Prisma cleanup

- [x] Backend `migrate deploy` green on `pranidoctor_db`
- [x] Backend `db:seed` green
- [ ] Web `DATABASE_URL` aligned with backend
- [ ] Web `migrate status` shows up to date (read-only check)
- [ ] `sync-prisma-from-backend.ps1` restored and run in CI
- [ ] Schema comment/hash match after sync
