# Prisma schema (synced copy)

**Canonical owner:** `pranidoctor-backend`  
**This repo:** generated client + legacy API; **not** migration authority.

## Sync from backend

```powershell
.\scripts\sync-prisma-from-backend.ps1
npm run db:generate
```

## Allowed here

```bash
npm run db:generate
npx prisma validate
```

## Do not (shared environments)

- `prisma migrate dev` / `migrate deploy` — use **backend**
- `db:seed` on production — use **backend** `npm run db:seed`

## Plans

- [PRISMA_CANONICAL_PLAN.md](../docs/PRISMA_CANONICAL_PLAN.md)
- [PRISMA_DELETE_PLAN.md](../docs/PRISMA_DELETE_PLAN.md) — web duplicate cleanup (not executed yet)
