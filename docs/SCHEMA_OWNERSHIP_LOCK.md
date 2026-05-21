# Schema ownership lock

**Effective:** 2026-05-21  
**Policy:** BACKEND-FIRST (permanent)

---

## Backend owns (`D:\PraniDoctor\pranidoctor-backend`)

| Asset | Path |
|-------|------|
| Schema | `prisma/schema.prisma` |
| Migrations | `prisma/migrations/` (23 active) |
| Archives | `prisma/_archived_out_of_chain/` |
| Seed suite | `prisma/seed.ts`, `seed-admin.ts`, `seed-demo*.ts`, `seed-data/` |
| Prisma config | `prisma.config.ts` |
| Migrate / seed commands | `npm run db:migrate`, `db:migrate:deploy`, `db:seed` |
| Generated client (source) | `src/generated/prisma/` |

**Database:** `pranidoctor_db` @ `localhost:5432` — all DDL/DML authority via backend.

---

## Web owns (`D:\PraniDoctor\pranidoctor-web`)

| Asset | Path |
|-------|------|
| UI | `src/app/**`, `src/components/**` |
| API client | `src/lib/api-client.ts` |
| Types / enums (synced) | `src/generated/prisma/` (copy from backend) |
| BFF routes (interim) | `src/app/api/**` — migrating to HTTP consumer |

**Web does NOT own:**

- `prisma/schema.prisma` — **deleted**
- `prisma/migrations/` — **deleted**
- `prisma/seed*.ts` — **deleted**
- `prisma.config.ts` — **deleted**

---

## Sync contract

```powershell
# After backend schema change:
cd D:\PraniDoctor\pranidoctor-backend
npm run db:migrate:deploy
npm run db:generate

cd D:\PraniDoctor\pranidoctor-web
npm run db:client:sync
npm run build
```

---

## Enforcement

| Rule | Enforcement |
|------|-------------|
| No web migrations | `prisma/` folder absent |
| No web seed on prod DB | Scripts removed |
| Client sync | `postinstall` → `copy-prisma-client-from-backend.mjs` |
| Optional DB block on web | `WEB_API_ONLY=true` |

---

## Supersedes

- `CUTOVER_DEFER_PLAN.md` (web Prisma owner) — **superseded for schema**
- `PRISMA_CANONICAL_PLAN.md` — implemented via this lock

---

## Sign-off matrix

| Role | Owner |
|------|--------|
| Schema + migrations + seed | **backend** |
| UI + API client | **web** |
| PostgreSQL DDL | **backend only** |
| Generated types in web | **synced copy** |
