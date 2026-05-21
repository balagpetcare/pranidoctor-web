# PHASE 2 — BANGLADESH AREA ENGINE IMPLEMENTATION

**Date:** 2026-05-21  
**Role:** Principal Platform Architect  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) · Plan: [PHASE2_AREA.md](./PHASE2_AREA.md)  
**Repositories:** `pranidoctor-backend` (module) · `pranidoctor_user` (Flutter contract) · `pranidoctor-web/docs` (this report)

**Disambiguation:** New **`modules/area-engine/`** platform module. Frozen **`modules/area/**`** and legacy **`/api/locations/*`** routes were not modified.

---

## Summary

Delivered a reusable Bangladesh Area Engine with:

1. **Hierarchy API** at `/api/area/*` (foundation envelope `{ success, data }`)
2. **Redis cache layer** for hierarchy + search with versioned keys and TTL
3. **Idempotent seed pipeline** wrapping existing BD reference data + village rows
4. **Bilingual search** (Bengali / English / slug / code, partial match, hierarchy scope)
5. **Flutter integration contracts** (DTOs, repository, offline cache)
6. **Unit tests + `area:verify` gate**

No schema migrations. No dependency changes. No edits to frozen area/auth/profile modules.

---

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Area module tests | `npm run test -- --run src/modules/area-engine scripts/area-seed-lib.test.ts` | **11/11 PASS** |
| Build | `npm run build` | **PASS** |
| Area verify | `npm run area:verify` | **10/10 PASS** |

```
AREA_ENGINE_VERIFY=PASS
AREA_COMPLETE=YES
FREEZE_COMPLIANT=YES
```

**Regression (recommended):** `npm run p1:12-verify` · `npm run phase2:auth-verify`

---

## REPORT

### Created

| Component | Path |
|-----------|------|
| Module entry | `src/modules/area-engine/area-engine.module.ts` |
| Controller | `src/modules/area-engine/area-engine.controller.ts` |
| Routes | `src/modules/area-engine/area-engine.routes.ts` |
| Types | `src/modules/area-engine/area-engine.types.ts` |
| Domain mapper | `src/modules/area-engine/domain/area.mapper.ts` |
| Repository | `src/modules/area-engine/repository/area.repository.ts` |
| Search service | `src/modules/area-engine/search/area-search.service.ts` |
| Cache keys | `src/modules/area-engine/cache/area-cache.keys.ts` |
| Cache service | `src/modules/area-engine/cache/area-cache.service.ts` |
| Seed service (runtime) | `src/modules/area-engine/seed/area-seed.service.ts` |
| Seed library | `scripts/area-seed-lib.ts` |
| Seed CLI | `scripts/area-seed.ts` |
| Verify CLI | `scripts/area-verify.ts` |
| Plan doc | `docs/PHASE2_AREA.md` |
| Implementation doc | `docs/PHASE2_AREA_IMPLEMENTATION.md` |

### Seeded

| Item | Detail |
|------|--------|
| Source | `prisma/seed-data/bd-locations.ts` (Division → Union reference rows) |
| Village rows | `scripts/area-seed-lib.ts` → `AREA_ENGINE_VILLAGE_ROWS` |
| Version key | `Setting.key = area_engine.seed_version` |
| Version value | `2026.05.21-area-engine-1` |
| Execution | `npm run area:seed` · `prisma db seed` (via `applyAreaEngineSeed`) |
| Idempotency | Upsert by `slug` / trim-code helpers in `location-trim-upserts.ts` |
| Rollback | Forward-fix only (`isActive: false`) — no destructive deletes |

### Endpoints

All mounted under **`/api/area`** (foundation envelope):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/divisions` | List divisions (paginated) |
| GET | `/divisions/:id/districts` | Districts by division |
| GET | `/districts/:id/upazilas` | Upazilas by district |
| GET | `/upazilas/:id/unions` | Unions by upazila |
| GET | `/unions/:id/villages` | Villages by union |
| GET | `/search` | Bilingual partial search + hierarchy scope |
| GET | `/seed/version` | Applied seed version metadata |

**Query params:** `page`, `pageSize`, `locale` (`bn` \| `en`); search adds `q`, `level`, `divisionId`, `districtId`, `upazilaId`, `unionId`.

### Cache

| Layer | Key pattern | TTL |
|-------|-------------|-----|
| Hierarchy | `area:v1:divisions:{page}:{pageSize}` | 86400s |
| Hierarchy | `area:v1:districts:{divisionId}:{page}:{pageSize}` | 86400s |
| Hierarchy | `area:v1:upazilas:{districtId}:...` | 86400s |
| Hierarchy | `area:v1:unions:{upazilaId}:...` | 86400s |
| Hierarchy | `area:v1:villages:{unionId}:...` | 86400s |
| Search | `area:v1:search:{hash\|params}` | 3600s |
| Invalidation | `area:v1:*` via `delPattern` after seed | — |
| Warmup | `warmupDivisions(page, pageSize, loader)` | — |
| Fallback | DB loader when Redis unavailable | — |

### Flutter

| File | Purpose |
|------|---------|
| `lib/core/area/area_dto.dart` | `AreaNodeDto`, `AreaSearchHitDto`, `AreaPage`, `AreaPageMeta` |
| `lib/core/area/area_repository_contract.dart` | HTTP repository interface + `AreaApiPaths` |
| `lib/core/area/area_cache_contract.dart` | Hive/offline cache keys, TTL, readiness check |

**Offline readiness:** cache seed version + divisions (`bn`) on startup; 7-day local TTL; invalidate when server seed version changes.

### Migration

| Item | Status |
|------|--------|
| New Prisma migration | **None** — uses existing `Division` → `Village` models |
| Seed version storage | `Setting` table (additive JSON, no schema change) |
| ID preservation | Upsert by `slug` / trim-code — existing IDs retained |

### Blocked

| Item | Reason |
|------|--------|
| Edit `modules/area/**` | P2 freeze — `DO_NOT_TOUCH` |
| Edit `/api/locations/*` legacy routes | API freeze |
| Doctor / clinic / appointment logic | Out of scope |
| Auth redesign | Out of scope |
| Dependency upgrades | `DEPENDENCY_FROZEN` |
| Destructive schema migration | `MIGRATION_FROZEN` |

---

## Tests

| Suite | File | Coverage |
|-------|------|----------|
| Mapper / hierarchy | `domain/area.mapper.test.ts` | Labels, DTO mapping, slug dedupe |
| Cache keys | `cache/area-cache.keys.test.ts` | Key format, search determinism, invalidation pattern |
| Cache service | `cache/area-cache.service.test.ts` | getOrSet delegation, pattern invalidation |
| Search | `search/area-search.service.test.ts` | Blank query short-circuit |
| Seed (runtime) | `seed/area-seed.service.test.ts` | Stable version constant |
| Seed (lib) | `scripts/area-seed-lib.test.ts` | Village row manifest |
| API routes | `area-engine.routes.test.ts` | All hierarchy + search paths registered |

---

## Module wiring

`src/modules/index.ts` mounts `createAreaEngineModule()` as module name `'area'` → Express router prefix `/api/area`.

Frozen legacy `createAreaModule()` remains unchanged for profile/compat flows.

---

## Next steps (optional, not in scope)

- Bulk village CSV import via `pranidoctor-web/scripts/locations/**` ops tooling
- Integration tests against live DB + Redis
- Flutter concrete `AreaRepository` Dio implementation in app layer
