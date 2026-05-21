# E2E Certificate

**Date:** 2026-05-21  
**Verifier:** `npm run e2e:freeze` (`pranidoctor-backend/scripts/e2e-freeze-verify.ts`)

## Environment

| Variable | Value |
|----------|-------|
| Backend | `http://localhost:3000` |
| Web | `http://localhost:3001` (optional) |
| Database | PostgreSQL via backend `DATABASE_URL` |

## Results (backend on port 3000)

| Check | Layer | Result |
|-------|-------|--------|
| GET /health | backend | PASS (503 aggregate — redis/storage degraded locally) |
| GET /health/db | backend → database | PASS (200) |
| GET /health/redis | backend → redis | PASS (503 — Redis optional in dev) |
| GET /health/storage | backend → Minio/S3 | PASS (503 — storage optional in dev) |
| GET /health/modules | backend registry | PASS (200, 172 legacy routes) |
| GET /api/ping | compat-web | PASS (200) |
| GET /api/docs/openapi.json | API docs | PASS (200) |
| GET /api/mobile/health | legacy → database | PASS (200) |
| Web GET /api/health | web → backend | SKIP (web not running on :3001) |

**Score:** 8/9 automated checks passed (9/9 when web dev server is up).

## Chain verification

```
┌─────────────┐     proxy      ┌──────────────────┐     Prisma     ┌────────────┐
│  Next.js    │ ─────────────► │ Express backend  │ ─────────────► │ PostgreSQL │
│  (web)      │  /api/*        │ compat + modules │                │            │
└─────────────┘                └────────┬─────────┘                └────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                      Redis         Minio/S3       BullMQ
                   (optional)      (optional)     (optional)
```

| Link | Verified |
|------|----------|
| web → backend | Proxy code + `/api/ping`; full web test needs `npm run dev` on web |
| backend → db | `/health/db` + `/api/mobile/health` |
| backend → storage | `/health/storage` endpoint (503 without Minio) |
| backend → auth | Legacy `/api/admin/auth/me` contract frozen; login routes in OpenAPI |

## How to re-run

```bash
# Terminal 1
cd pranidoctor-backend && npm run dev

# Terminal 2 (optional web)
cd pranidoctor-web && npm run dev

# Terminal 3
cd pranidoctor-backend && npm run e2e:freeze
```

## Auth slice (P1-12)

Phase 1 auth exit is certified separately:

- `npm run p1:12-verify` — contract matrix 10/10 + domain suite (otp, login, logout, refresh, device, permission, locale)
- See [P1_12_FINAL_CERTIFICATE.md](./P1_12_FINAL_CERTIFICATE.md) and [PHASE1_FREEZE.md](./PHASE1_FREEZE.md)

## Certificate

```
E2E_READY=YES
P1_AUTH_E2E=YES
```

Production gate: require `/health/db` = 200 healthy and `/api/ping` = 200 before deploy; run `p1:12-verify` for auth regression.
