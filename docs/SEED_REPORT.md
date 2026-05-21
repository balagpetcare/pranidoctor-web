# Seed validation report (Phase 3)

**Date:** 2026-05-21  
**Prerequisite:** Backend `prisma migrate deploy` — **PASS** (see [DB_VALIDATION_REPORT.md](./DB_VALIDATION_REPORT.md))

---

## Seed discovery

### `prisma.config.ts` (both repos)

```ts
seed: 'tsx prisma/seed.ts'
```

### Backend `package.json`

| Script | Command |
|--------|---------|
| `db:seed` | `tsx prisma/seed.ts` |
| `db:seed:admin` | `tsx prisma/seed-admin.ts` |
| `db:seed:demo` | `tsx prisma/seed-demo.ts` |
| `db:seed:reset-demo` | `tsx prisma/seed-demo-reset.ts` |

### Web `package.json`

| Script | Command |
|--------|---------|
| `db:seed` | `prisma db seed` → `tsx prisma/seed.ts` |
| `seed:admin` | `tsx prisma/seed-admin.ts` |
| `db:seed:demo` | `tsx prisma/seed-demo.ts` |

### Seed files (both repos)

- `prisma/seed.ts` (main)
- `prisma/seed-admin.ts`
- `prisma/seed-demo.ts`
- `prisma/seed-demo-reset.ts`
- `prisma/demo-seed-shared.ts`
- `prisma/seed-data/bd-locations.ts`, `location-trim-upserts.ts`, `users.ts`, `roles.ts`

---

## Run (backend — authoritative)

```bash
cd D:\PraniDoctor\pranidoctor-backend
npm run db:seed
```

| Item | Result |
|------|--------|
| Exit code | **0** |
| Panel admin | Skipped (no `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`) |
| Knowledge Hub categories | 7 upserted |
| Semen reference masters | Upserted |
| Prisma disconnect | Clean |

### Repair used for seed

`src/compat/legacy-prisma.ts` — added `createLogger(config)` before `createPrismaClient` (infrastructure fix; seed was failing with "Logger not initialized").

---

## Web seed

Not executed — web `DATABASE_URL` auth fails (P1000). After aligning web `.env` with backend credentials:

```bash
cd D:\PraniDoctor\pranidoctor-web
npm run db:seed
```

Expect equivalent outcome if `seed.ts` remains in sync.

---

## Optional seeds (not run)

| Script | Purpose |
|--------|---------|
| `db:seed:admin` | Panel admin from env |
| `db:seed:demo` | Demo dataset |
| `db:seed:reset-demo` | Reset demo |

---

## Seed status

| Check | Status |
|-------|--------|
| Migration prerequisite | PASS |
| Backend `db:seed` | **PASS** |
| Web `db:seed` | **NOT RUN** (env) |
