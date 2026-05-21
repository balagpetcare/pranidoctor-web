# PHASE 1 — BACKEND FOUNDATION

**Document type:** Implementation plan (infrastructure layer)  
**Date:** 2026-05-21  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) — freeze rules **override** all work  
**Scope:** Express backend shared kernel (`pranidoctor-backend/src/shared`, `src/infra`, `src/api/health`, Docker ops)  
**Not in scope:** Auth domain (see [PHASE1_FREEZE.md](./PHASE1_FREEZE.md)), feature modules, schema changes, API contract changes

**Naming note:** This plan covers **backend infrastructure foundation**. It is distinct from the historical **Auth Phase 1** freeze (`PHASE1_FREEZE.md` / `PHASE1_AUTH_PLAN.md`).

---

## Scope Validation

Freeze flags at plan time:

```
DATABASE_FROZEN=true
API_FROZEN=true
MIGRATION_FROZEN=true
DEPENDENCY_FROZEN=true
```

| Freeze gate | Rule applied to this phase |
|-------------|---------------------------|
| **SAFE_TO_MODIFY** | `pranidoctor-backend/src/shared/**`, `src/infra/**`, `src/api/health/**`, `scripts/foundation-verify.ts`, `docker/README.md`, docs |
| **DO_NOT_TOUCH** | `legacy/web/routes/**`, `legacy/web/lib/api-response.ts`, `compat/compat-api-response.ts`, frozen P1–P3 modules, response envelope files |
| **API_FROZEN** | No changes to `/api/*` handler semantics or JSON envelopes on existing routes |
| **DATABASE_FROZEN** | No schema/migration edits |
| **MIGRATION_FROZEN** | No new migration folders |
| **DEPENDENCY_FROZEN** | No upgrades/removals; no new runtime packages |

### Task compliance matrix

| # | Work item | Status | DATABASE | API | MIGRATION | DEPENDENCY | Notes |
|---|-----------|--------|----------|-----|-----------|------------|-------|
| 1 | Config System | **ALLOWED** | ✓ | ✓ | ✓ | ✓ | Extend `shared/config/*`; no schema |
| 2 | Validation Layer | **ALLOWED** | ✓ | ✓ | ✓ | ✓ | Zod middleware + schemas only |
| 3 | Logger | **ALLOWED** | ✓ | ✓ | ✓ | ✓ | Pino wrapper; no log format breaking clients |
| 4 | Global Error Handler | **CONDITIONAL** | ✓ | ⚠ | ✓ | ✓ | Foundation `{ success, error }` only — **must not** alter legacy compat envelope |
| 5 | Response Wrapper | **CONDITIONAL** | ✓ | ⚠ | ✓ | ✓ | `shared/utils/response.ts` OK; **DO NOT** edit `legacy/web/lib/api-response.ts` |
| 6 | Redis Integration | **ALLOWED** | ✓ | ✓ | ✓ | ✓ | `infra/redis/*`; graceful degrade when disabled |
| 7 | Queue Infrastructure | **ALLOWED** | ✓ | ✓ | ✓ | ✓ | `infra/queue/*`; no new job processors (business logic) |
| 8 | Health Check | **ALLOWED** | ✓ | ✓ | ✓ | ✓ | `/health`, `/ready`, `/live` — additive fields OK |
| 9 | Audit Log | **ALLOWED** | ✓ | ✓ | ✓ | ✓ | Redis-backed `shared/security/audit/*`; uses existing `AuthAuditEvent` DB only via auth (frozen) |
| 10 | Docker Foundation | **CONDITIONAL** | ✓ | ⚠ | ✓ | ✓ | Dev compose/docs **ALLOWED**; prod legacy route artifact (R-001) **BLOCKED** without legacy compile pipeline |
| 11 | Environment Manager | **ALLOWED** | ✓ | ✓ | ✓ | ✓ | `load-env.ts`, `env.resolver.ts`, `env.validation.ts`, `.env.example` |

**Legend:** ✓ = compliant · ⚠ = must preserve frozen contracts · **BLOCKED** = cannot implement under current freeze

---

## Work Breakdown

### 1. Config System

| Field | Detail |
|-------|--------|
| **Objective** | Typed Zod config load, env resolution, startup validation flags |
| **Files affected** | `src/shared/config/config.schema.ts`, `config.loader.ts`, `env.resolver.ts`, `env.validation.ts`, `startup-validation.ts`, `infra.flags.ts`, `load-env.ts` |
| **Dependencies** | `zod`, `dotenv` (dev) |
| **Risk** | Low — mis-typed env can block boot in strict mode |
| **Rollback** | Revert config file edits; restore prior `.env` |

**Current state:** Implemented. **Action:** Add unit tests + foundation verify probes.

---

### 2. Validation Layer

| Field | Detail |
|-------|--------|
| **Objective** | Reusable Zod schemas + Express `validate*` middleware |
| **Files affected** | `src/shared/validation/common.schemas.ts`, `validate.middleware.ts`, `index.ts` |
| **Dependencies** | `zod`, `shared/errors/http.errors.ts` |
| **Risk** | Low — middleware throws `ValidationError` → foundation envelope only |
| **Rollback** | Revert validation files |

**Current state:** Implemented. **Action:** Schema unit tests.

---

### 3. Logger

| Field | Detail |
|-------|--------|
| **Objective** | Structured Pino logging with request context mixin + redaction |
| **Files affected** | `src/shared/logger/logger.ts`, `sanitizer.ts`, `middleware/logger.middleware.ts` |
| **Dependencies** | `pino`, `pino-http`, `pino-pretty` (dev) |
| **Risk** | Low — internal observability only |
| **Rollback** | Revert logger config |

**Current state:** Implemented. **Action:** Document in foundation barrel; verify redaction paths in tests (sanitizer).

---

### 4. Global Error Handler

| Field | Detail |
|-------|--------|
| **Objective** | Central Express error middleware for foundation modules |
| **Files affected** | `src/shared/errors/error.handler.ts`, `app.error.ts`, `http.errors.ts`, `app.ts` (`finalizeApp`) |
| **Dependencies** | Request context, logger |
| **Risk** | **Medium** — must remain last middleware; compat routes use Next-style handlers with own envelopes |
| **Rollback** | Revert `error.handler.ts` |

**Current state:** Implemented (foundation `{ success: false, error }`). **Blocked:** Rewiring legacy compat to use this handler.

---

### 5. Response Wrapper

| Field | Detail |
|-------|--------|
| **Objective** | Foundation success helpers `{ success, data }` |
| **Files affected** | `src/shared/utils/response.ts` |
| **Dependencies** | Request context |
| **Risk** | **High if misapplied** — legacy must keep `{ ok, data }` via `legacy/web/lib/api-response.ts` (**DO_NOT_TOUCH**) |
| **Rollback** | Revert `response.ts` |

**Current state:** Implemented. **Action:** Unit tests only; no legacy migration.

---

### 6. Redis Integration

| Field | Detail |
|-------|--------|
| **Objective** | Singleton ioredis client, key prefixing, health probe |
| **Files affected** | `src/infra/redis/redis.client.ts`, `src/infra/cache/cache.service.ts`, `server.ts` boot |
| **Dependencies** | `ioredis`, `REDIS_ENABLED`, `REDIS_URL` |
| **Risk** | Medium — R-006 prod should require Redis; dev may disable |
| **Rollback** | Set `REDIS_ENABLED=false`; revert client changes |

**Current state:** Implemented. **Action:** Graceful health when client not initialized.

---

### 7. Queue Infrastructure

| Field | Detail |
|-------|--------|
| **Objective** | BullMQ connection factory, queue registry, worker scaffolding |
| **Files affected** | `src/infra/queue/queue.service.ts`, `queue.config.ts`, `queue.types.ts`, `src/worker.ts` |
| **Dependencies** | `bullmq`, Redis |
| **Risk** | Low without job processors — R-020 worker not in compose prod |
| **Rollback** | `closeAllQueues()` on shutdown (already wired) |

**Current state:** Implemented. **Blocked:** Registering business job processors (feature work).

---

### 8. Health Check

| Field | Detail |
|-------|--------|
| **Objective** | Liveness, readiness, dependency probes for ops |
| **Files affected** | `src/api/health/health.routes.ts`, `health.service.ts`, `health.types.ts` |
| **Dependencies** | DB, Redis, queue, storage checks |
| **Risk** | Low — additive JSON fields allowed on `/health*` |
| **Rollback** | Revert health service |

**Current state:** Implemented (`/health`, `/ready`, `/live`, `/health/db`, `/health/redis`, etc.). **Action:** Readiness respects `REDIS_ENABLED`.

---

### 9. Audit Log

| Field | Detail |
|-------|--------|
| **Objective** | Redis-indexed audit trail + async queue fallback |
| **Files affected** | `src/shared/security/audit/audit.service.ts`, `audit.types.ts`, `audit/index.ts` |
| **Dependencies** | Redis, BullMQ `SCHEDULED` queue |
| **Risk** | Medium — requires Redis; separate from Prisma `AuthAuditEvent` (auth module, frozen) |
| **Rollback** | Disable Redis; audit calls fail closed in strict paths |

**Current state:** Implemented. **Blocked:** Rewiring auth module audit internals.

---

### 10. Docker Foundation

| Field | Detail |
|-------|--------|
| **Objective** | Reproducible local infra + documented prod gap |
| **Files affected** | `docker/Dockerfile`, `docker-compose.yml`, `docker/README.md` (new) |
| **Dependencies** | postgres, redis, minio images |
| **Risk** | **High for prod** — R-001: `tsconfig.build.json` excludes `src/legacy/**`; prod `dist/` cannot load `.ts` legacy routes |
| **Rollback** | Use `docker compose --profile production` only after legacy compile pipeline (Phase 4) |

**Current state:** Compose infra services OK; prod API profile **incomplete**. **Action:** Document gap + dev workflow; **BLOCKED:** prod legacy fix without build pipeline change.

---

### 11. Environment Manager

| Field | Detail |
|-------|--------|
| **Objective** | Idempotent `.env` load, URL resolution, CLI validation |
| **Files affected** | `load-env.ts`, `env.resolver.ts`, `env.validation.ts`, `.env.example`, `scripts/env-validate.ts` |
| **Dependencies** | `dotenv`, `zod` |
| **Risk** | Low |
| **Rollback** | Revert resolver/validation |

**Current state:** Implemented. **Action:** Tests for URL resolution; foundation verify includes `npm run env:validate`.

---

## Implementation order

1. Foundation unit tests (config, validation, errors, response, sanitizer)
2. Redis/health graceful degrade fixes
3. `scripts/foundation-verify.ts` + `npm run foundation:verify`
4. `src/shared/foundation/index.ts` public barrel
5. `docker/README.md` (R-001 documentation)
6. `docs/PHASE1_IMPLEMENTATION.md` report

---

## Exit criteria

| Criterion | Target |
|-----------|--------|
| All 11 areas documented with compliance status | Met in this plan |
| No freeze violations | Zero edits to DO_NOT_TOUCH paths |
| `npm run test` foundation tests pass | Required |
| `npm run foundation:verify` pass (unit + static) | Required |
| `npm run build` pass | Required |
| Prod Docker legacy gap documented | Required (not silently fixed) |

---

## Sign-off (post-implementation)

```
BACKEND_FOUNDATION_PLANNED=YES
FREEZE_COMPLIANT=YES
```
