# Runtime Verification Report

**Project:** Prani Doctor Backend (`pranidoctor-backend`)  
**Date:** 2026-05-21  
**Environment:** Windows 10, Node v22.22.0, local host  
**Overall status:** **FAIL** — infrastructure dependencies unavailable on this host

---

## Executive summary

The API **builds and boots** with all 9 modules mounted when `SKIP_STARTUP_VALIDATION=true`. HTTP routes respond, including new contract aliases (`POST /health`, `POST /api/auth/login`, `POST /api/auth/refresh`). **Runtime green** (migrate → seed → healthy deps → auth flow) is **blocked** because:

1. **Docker is not on PATH** — cannot start Postgres/Redis/MinIO from `docker-compose.yml`.
2. **PostgreSQL on `:5432`** accepts connections but rejects credentials for user `pranidoctor` (`P1000` / `28P01`).
3. **Redis `:6379`** and **MinIO `:9000`** are not listening.

After fixing infrastructure (see [Remediation](#remediation)), re-run:

```bash
cd pranidoctor-backend
docker compose up -d postgres redis minio
npm run db:migrate:deploy
npm run db:seed
npm run validate:startup
npm run dev
npm run verify:runtime
```

---

## PASS/FAIL matrix

| # | Check | Command / endpoint | Expected | Result | Notes |
|---|--------|-------------------|----------|--------|-------|
| 1 | TypeScript build | `npm run build` | 0 errors | **PASS** | `typecheck` + `tsc` clean |
| 2 | Prisma generate | `npx prisma generate` | Client generated | **PASS** | |
| 3 | Migration deploy | `npx prisma migrate deploy` | Applied migrations | **FAIL** | `P1000` — password auth failed for `pranidoctor` |
| 4 | Database seed | `npm run db:seed` | Roles + dev users | **FAIL** | Same DB auth error (seed fixed to use adapter — see [Changes](#changes-made)) |
| 5 | Startup validation | `npm run validate:startup` | All required deps OK | **FAIL** | PostgreSQL, Redis, MinIO all unhealthy |
| 6 | Module load | Server logs / `loadModules` | 9 modules mounted | **PASS** | auth, users, doctors, leads, animals, clinics, notifications, ai, media |
| 7 | Server boot | `SKIP_STARTUP_VALIDATION=true npx tsx src/server.ts` | Listen `:3000` | **PASS** | With validation skipped |
| 8 | DB connection | `validate:startup` / `GET /health` | Healthy | **FAIL** | `28P01` password authentication failed |
| 9 | Cache (Redis) | `validate:startup` / health deps | PONG | **FAIL** | `ECONNREFUSED` / connection closed |
| 10 | Storage (MinIO/S3) | `validate:startup` | Bucket reachable | **FAIL** | `ECONNREFUSED 127.0.0.1:9000` |
| 11 | `GET /health` | `GET http://localhost:3000/health` | 200 or 503 JSON | **PASS**† | Route OK; status **503 unhealthy** (deps down) |
| 12 | `POST /health` | `POST http://localhost:3000/health` | Same as GET | **PASS**† | Alias added; returns health JSON |
| 13 | `GET /health/dependencies` | `GET .../health/dependencies` | 200 + dependency list | **PASS** | Reports DB/Redis unhealthy |
| 14 | `POST /api/auth/otp/request` | OTP request | 200 + masked phone | **FAIL** | **500** when Redis unavailable |
| 15 | `POST /api/auth/login` (alias) | Maps to OTP verify | 200 or 4xx | **FAIL** | Route exists; **500** without Redis/DB |
| 16 | `POST /api/auth/refresh` (alias) | Maps to token refresh | 400 invalid token | **PASS**† | Route exists; returns validation/error (not 404) |
| 17 | `POST /api/auth/token/refresh` | Canonical refresh | 400 invalid token | **PASS**† | Handler wired |
| 18 | Media module | `GET /api/media/:key` | Module mounted | **PASS**† | Route OK; **500** without storage/DB |
| 19 | Docker available | `docker compose` | CLI on PATH | **FAIL** | Docker not installed or not in PATH |
| 20 | Automated verify script | `npm run verify:runtime` | Exit 0 when green | **FAIL** | Blocked on migrate/DB/Redis |

† **Route/handler PASS** — infrastructure **FAIL** until deps are up.

---

## HTTP endpoint map (contract vs implementation)

| Requested | Implemented | Module |
|-----------|-------------|--------|
| `POST /health` | `POST /health` | Root health router |
| `POST /auth/login` | `POST /api/auth/login` → `verifyOtp` | Auth (`/api` prefix) |
| `POST /auth/refresh` | `POST /api/auth/refresh` → `refreshToken` | Auth |
| (canonical login) | `POST /api/auth/otp/request` + `POST /api/auth/otp/verify` | Auth |
| (canonical refresh) | `POST /api/auth/token/refresh` | Auth |

All API modules mount under **`/api`** (`server.ts` → `loadModules(..., { apiPrefix: '/api' })`).

---

## Dependency validation detail

### PostgreSQL

```
Resolved: postgresql://pranidoctor:***@localhost:5432/pranidoctor
Error:    password authentication failed for user "pranidoctor" (28P01)
```

Port `5432` is open (likely a non-Docker Postgres instance with different credentials).

### Redis

```
Resolved: redis://localhost:6379
Error:    Connection refused / Connection is closed
```

### MinIO (S3-compatible storage)

```
Resolved: http://127.0.0.1:9000/
Error:    connect ECONNREFUSED 127.0.0.1:9000
```

---

## Module load evidence

With `SKIP_STARTUP_VALIDATION=true`, server startup logs confirm:

- **9 modules initialized:** auth, users, doctors, leads, animals, clinics, notifications, ai, media
- **Routes mounted:** `/api/auth`, `/api/users`, `/api/doctors`, `/api/leads`, `/api/animals`, `/api/clinics`, `/api/notifications`, `/api/ai`, `/api/media`
- Log line: `API modules mounted`

---

## Changes made (this verification pass)

| File | Change |
|------|--------|
| `src/api/health/health.routes.ts` | `POST /health` handler (same as GET) |
| `src/modules/auth/auth.routes.ts` | `POST /login`, `POST /refresh` aliases |
| `scripts/runtime-verification.ts` | Automated migrate/seed/infra/HTTP matrix |
| `scripts/validate-startup.ts` | Initialize logger before Prisma |
| `prisma/seed.ts` | Use `createPrismaClient` + adapter (Prisma 7) |
| `src/infra/redis/redis.client.ts` | Safe `disconnectRedis` when connection never established |
| `package.json` | `verify:runtime` script |

---

## Remediation (to achieve runtime green)

### 1. Start stack (recommended)

Install Docker Desktop, then from `pranidoctor-backend`:

```powershell
docker compose up -d postgres redis minio
npm run wait:services
```

Ensure `.env` matches `docker-compose.yml` credentials (`DB_USER` / `DB_PASSWORD` / `DATABASE_URL`).

### 2. Migrate and seed

```powershell
npm run db:migrate:deploy
npm run db:seed
```

### 3. Validate and run

```powershell
npm run validate:startup   # expect: All required services are healthy
npm run dev                # predev waits for services
npm run verify:runtime     # full matrix; exit 0
```

### 4. Auth smoke test (with Redis + DB up)

```bash
# Request OTP (code logged in dev console)
curl -X POST http://localhost:3000/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phone":"+8801712345678"}'

# Verify / login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+8801712345678","code":"<otp-from-logs>"}'

# Refresh
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-from-login-response>"}'
```

### Alternative: point `.env` at existing Postgres

If using a local Postgres (not Docker), create role/database and align `DATABASE_URL`:

```sql
CREATE USER pranidoctor WITH PASSWORD 'pranidoctor_dev_password';
CREATE DATABASE pranidoctor OWNER pranidoctor;
```

Also run Redis and MinIO locally or update `REDIS_URL` / `MINIO_*` in `.env`.

---

## Acceptance criteria checklist

| Criterion | Status |
|-----------|--------|
| `migrate deploy` succeeds | ❌ |
| `db:seed` succeeds | ❌ |
| All modules load | ✅ |
| `POST /health` responds | ✅ (503 until deps healthy) |
| `POST /api/auth/login` responds | ✅ route (❌ E2E without Redis) |
| `POST /api/auth/refresh` responds | ✅ |
| DB + cache + storage validated | ❌ |
| **Runtime green** | ❌ |

---

## Related reports

- [typecheck-report.md](./typecheck-report.md)
- [auth-repository-report.md](./auth-repository-report.md)
- [runtime-unblock-report.md](./runtime-unblock-report.md)
- [infrastructure-report.md](./infrastructure-report.md)
