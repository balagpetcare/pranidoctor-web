# Local Development Without Docker

**Project:** Prani Doctor Backend (`pranidoctor-backend`)  
**Goal:** Run the API against external or local services — Docker optional (CI/deploy only).

---

## Quick start (no Docker)

### 1. PostgreSQL (required)

Use any PostgreSQL 16+ instance (local install, cloud, or Docker if you prefer):

```powershell
cd D:\PraniDoctor\pranidoctor-backend
copy .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/pranidoctor
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./.local-storage
REDIS_ENABLED=false
```

### 2. Database setup

```powershell
npm run env:validate
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

### 3. Start API

```powershell
npm run dev:no-docker
```

Or with file watch + Postgres port wait only:

```powershell
npm run dev
```

`predev` now waits for **PostgreSQL only** (not Redis/MinIO).

---

## Environment variables

| Variable | Required | Dev behavior | Prod behavior |
|----------|----------|--------------|---------------|
| `DATABASE_URL` | Yes | External Postgres URL | External/managed Postgres |
| `REDIS_URL` | If Redis enabled | Optional — warn if down | Required |
| `REDIS_ENABLED` | No | `false` skips Redis entirely | Should be `true` |
| `STORAGE_DRIVER` | No | `local` / `disabled` OK | `s3` or `minio` required |
| `S3_ENDPOINT` | If s3/minio | Optional | Required |
| `S3_BUCKET` | If s3/minio | Optional | Required |
| `S3_ACCESS_KEY` | If s3/minio | Optional | Required |
| `S3_SECRET_KEY` | If s3/minio | Optional | Required |
| `LOCAL_STORAGE_PATH` | If `local` | Default `./.local-storage` | N/A |
| `SKIP_STARTUP_VALIDATION` | No | Bypass all checks | **Not recommended** |

Aliases: `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` still supported.

---

## Startup validation rules

| Service | Development | Production |
|---------|-------------|------------|
| PostgreSQL | **Required** — fail if down | **Required** |
| Redis | Warn if down or disabled | **Required** (when enabled) |
| Storage | Warn if misconfigured | **Required** (not `disabled`) |

```powershell
npm run validate:startup
npm run env:validate
```

---

## Storage drivers

| `STORAGE_DRIVER` | Use case |
|------------------|----------|
| `disabled` | API-only dev, no uploads |
| `local` | Files on disk (`LOCAL_STORAGE_PATH`) |
| `minio` | S3-compatible (MinIO, path-style) |
| `s3` | AWS S3 or compatible |

Implementation: `src/modules/media/storage/adapters/`

---

## Optional Redis (OTP / sessions)

```env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

Without Redis:

- Server starts in development (with warnings)
- OTP login, session cache, and BullMQ queues **will not work**

---

## Docker (optional)

For teams that want containers:

```powershell
npm run docker:up
$env:WAIT_FOR="postgres,redis,minio"
npm run wait:services
```

`docker-compose.yml` remains for CI and production profiles.

---

## NPM scripts

| Script | Purpose |
|--------|---------|
| `npm run env:validate` | Infrastructure env check |
| `npm run validate:startup` | DB + optional Redis/storage health |
| `npm run db:generate` | Prisma client |
| `npm run db:migrate` | Create/apply dev migrations |
| `npm run db:migrate:deploy` | Deploy migrations (CI/prod) |
| `npm run db:push` | Schema push (prototyping) |
| `npm run db:seed` | Seed roles/users |
| `npm run dev:no-docker` | Dev server (no predev wait) |
| `npm run dev` | Dev server (waits for Postgres only) |

---

## Migration notes

1. **Default `STORAGE_DRIVER`** changed from `s3` to `disabled` in schema; `.env.example` recommends `local`.
2. **Storage code** moved to `src/modules/media/storage/`; `src/infra/storage/` re-exports for compatibility.
3. **`predev`** no longer blocks on Redis/MinIO — only Postgres (configurable via `WAIT_FOR`).
4. **Production** still enforces strict validation via `NODE_ENV=production`.
5. Update your `.env`: set explicit `DATABASE_URL` to your real Postgres credentials.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Wrong Postgres credentials | Use `npm run env:validate` and `validate:startup` |
| Auth broken without Redis | Set `REDIS_ENABLED=true` when testing OTP |
| Port 5432 conflict (host vs Docker Postgres) | Use one Postgres; align `DATABASE_URL` |
| `SKIP_STARTUP_VALIDATION` hides issues | Use only for debugging |
| Local storage not shared across instances | Use `s3`/`minio` in multi-instance deploys |

---

## Changed files (this migration)

| Area | Files |
|------|-------|
| Env | `src/shared/config/env.validation.ts`, `infra.flags.ts`, `config.schema.ts`, `config.loader.ts` |
| Startup | `src/shared/config/startup-validation.ts`, `src/server.ts` |
| Storage | `src/modules/media/storage/**`, `src/infra/storage/*` (re-exports) |
| Scripts | `scripts/wait-for-services.ts`, `scripts/validate-startup.ts`, `scripts/env-validate.ts` |
| Config | `.env.example`, `package.json` |
| Docs | `docs/LOCAL_DEV_NO_DOCKER.md` |
