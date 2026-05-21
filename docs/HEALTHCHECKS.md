# Health Checks

**Owner:** `pranidoctor-backend`  
**Base URL:** `http://localhost:3000` (or `BACKEND_URL`)

## Endpoints (frozen)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Aggregate status (db, redis, queues, storage, memory, event loop) |
| GET | `/health/db` | PostgreSQL only |
| GET | `/health/redis` | Redis only |
| GET | `/health/storage` | S3/Minio/local storage adapter |
| GET | `/health/modules` | Compat + Express module registry |
| GET | `/ready` | Readiness (db + redis) |
| GET | `/live` | Liveness probe |
| GET | `/api/ping` | Compat layer smoke (`{ ok, scope: "compat-web" }`) |

## Response shapes

### Aggregate `GET /health`

```json
{
  "status": "healthy | degraded | unhealthy",
  "timestamp": "ISO-8601",
  "version": "1.0.0",
  "uptime": 123,
  "checks": [{ "name", "status", "latency", "message?", "details?" }]
}
```

HTTP: `200` healthy/degraded, `503` unhealthy.

### Granular `GET /health/db|redis|storage`

```json
{
  "check": { "name", "status", "latency", "message?", "details?" },
  "timestamp": "ISO-8601"
}
```

HTTP: `200` healthy/degraded, `503` unhealthy.

### Modules `GET /health/modules`

```json
{
  "timestamp": "ISO-8601",
  "compatWeb": { "mounted": true, "legacyRouteFiles": 172, "apiPrefix": "/api" },
  "expressModules": [{ "name", "mountPath", "initialized" }],
  "totalModuleCount": 9
}
```

## Web integration

`src/lib/api-client.ts` → `fetchBackendHealth()` calls backend **`/health`** (not `/api/health`).

Web-local health routes remain at `/api/health`, `/api/admin/health`, `/api/mobile/health` (proxy or custom).

## Ops usage

```bash
# Local
curl http://localhost:3000/health
curl http://localhost:3000/health/db
curl http://localhost:3000/api/ping

# Regenerate OpenAPI (includes health paths)
cd pranidoctor-backend && npm run openapi:generate
```

## Degraded local dev (expected)

| Check | Typical local state |
|-------|---------------------|
| db | healthy when `DATABASE_URL` correct |
| redis | unhealthy if Redis not running |
| storage | unhealthy if Minio/S3 not on `:9000` |
| queues | degraded if Redis down |

Aggregate `/health` may return `503` while granular endpoints still respond — use granular probes for CI gates.
