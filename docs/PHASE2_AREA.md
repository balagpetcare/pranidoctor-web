# PHASE 2 — BANGLADESH AREA ENGINE

**Document type:** Platform module plan  
**Date:** 2026-05-21  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) — freeze rules **override** all work  
**Prerequisites:** [PHASE1_PLAN.md](./PHASE1_PLAN.md) (foundation), [PHASE2_AUTH.md](./PHASE2_AUTH.md) (identity layer)  
**Implementation:** `pranidoctor-backend/src/modules/area-engine/` (**new** — does not edit frozen `modules/area/**`)

**Naming note:** Distinct from historical **Profile Phase 2** area freeze ([PHASE2_FREEZE.md](./PHASE2_FREEZE.md)). This builds a **reusable platform module** with foundation API + cache + seed + Flutter contract.

---

## Freeze Validation

```
DATABASE_FROZEN=true
API_FROZEN=true
MIGRATION_FROZEN=true   (additive only)
DEPENDENCY_FROZEN=true
```

| Gate | Status | Notes |
|------|--------|-------|
| `modules/area/**` | **BLOCKED** (edit) | P2 frozen — delegate via new module, no edits |
| `legacy/web/routes/**` locations | **BLOCKED** (edit) | Compat `/api/locations/*`, `/api/mobile/locations/*` frozen |
| `legacy/web/lib/locations/**` | **CONDITIONAL** | Read-only import discouraged; reimplement in area-engine |
| New `modules/area-engine/**` | **ALLOWED** | Platform module |
| Additive `/api/area/*` routes | **ALLOWED** | Foundation envelope `{ success, data }` |
| `prisma/seed-data/**` | **ALLOWED** | Location seed only |
| `pranidoctor-user/lib/core/area/**` | **ALLOWED** | Flutter contract |
| `pranidoctor-web/scripts/locations/**` | **ALLOWED** | Existing CSV tooling (reference only) |
| Schema change | **CONDITIONAL** | Prefer `Setting` for seed version — **no migration required** |
| Doctor/clinic/business logic | **BLOCKED** | Out of scope |

---

## Area Hierarchy

| Level | Prisma model | Parent FK | Owner module |
|-------|--------------|-----------|--------------|
| 1 Division | `Division` | — | `area-engine` (read) |
| 2 District | `District` | `divisionId` | `area-engine` |
| 3 Upazila | `Upazila` | `districtId` | `area-engine` |
| 4 Union | `Union` | `upazilaId` | `area-engine` |
| 5 Village | `Village` | `unionId` | `area-engine` |

### Relation rules

- Strict tree: Village → Union → Upazila → District → Division (1:N chain)
- List endpoints validate parent exists + `isActive: true`
- Hierarchy mismatch validation remains in frozen `AreaCatalogService` (profile) — area-engine does not rewrite it

### Unique constraints (existing schema)

| Model | Unique |
|-------|--------|
| All levels | `slug` globally unique |
| District+ | `(divisionId, TRIM(code))` partial index (migration `20260511133000`) |
| Upazila+ | `(districtId, TRIM(code))` |
| Union+ | `(upazilaId, TRIM(code))` |
| Village+ | `(unionId, TRIM(code))` |

### Code strategy

- BBS-style hierarchical codes stored in `code` (string, nullable)
- Stable **`slug`** as seed identity key (e.g. `gopalganj-district`)
- API exposes `id` (cuid) + `slug` + `code`

### Multilingual strategy

| Field | Usage |
|-------|--------|
| `nameBn` | Primary Bengali label |
| `nameEn` | English label |
| `name` | Legacy fallback display |
| API DTO | `{ nameBn, nameEn, label }` where `label` = locale-aware default (`bn` prefers `nameBn`) |

### Search strategy

- PostgreSQL `contains` on `name`, `nameBn`, `nameEn`, `slug`, `code` (case-insensitive where applicable)
- Bengali partial match via Unicode `contains` on `nameBn`
- Optional `level` filter: `DIVISION` \| `DISTRICT` \| `UPAZILA` \| `UNION` \| `VILLAGE` \| `ALL`
- Optional hierarchy scope: `divisionId`, `districtId`, `upazilaId`, `unionId`
- Dedupe by `slug` in list responses

---

## Seed Strategy

| Item | Definition |
|------|------------|
| **Source structure** | `prisma/seed-data/bd-locations.ts` (reference) + `prisma/seed-data/area-engine/` (manifest, villages, version) |
| **Execution** | `npm run area:seed` · included in `prisma db seed` hook |
| **Idempotent seed** | Upsert by `slug` / trim-code helpers in `location-trim-upserts.ts` |
| **Versioning** | `Setting.key = area_engine.seed_version` (JSON `{ version, appliedAt }`) |
| **Rollback** | Forward-fix only — deactivate rows via `isActive: false` (no destructive delete in prod) |
| **Scope** | Location tables only — no business entities |

**CSV bulk import:** remains in `pranidoctor-web/scripts/locations/**` (ops tooling); area-engine seed uses programmatic reference rows.

---

## API Contract

**Base path:** `/api/area` (foundation module mount)  
**Envelope:** `{ success: true, data, meta? }` / `{ success: false, error }`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/divisions` | All active divisions |
| GET | `/divisions/:id/districts` | Districts in division |
| GET | `/districts/:id/upazilas` | Upazilas in district |
| GET | `/upazilas/:id/unions` | Unions in upazila |
| GET | `/unions/:id/villages` | Villages in union |
| GET | `/search` | Cross-level search |

### Query parameters

| Param | Endpoints | Default |
|-------|-----------|---------|
| `page` | list + search | 1 |
| `pageSize` | list + search | 20 (max 100) |
| `q` | search | required |
| `level` | search | `ALL` |
| `divisionId`, `districtId`, `upazilaId`, `unionId` | search | optional hierarchy scope |
| `locale` | all | `bn` \| `en` (label preference) |

### Response DTO (`AreaNode`)

```json
{
  "id": "cuid",
  "slug": "gopalganj-district",
  "code": "3035",
  "nameBn": "গোপালগঞ্জ",
  "nameEn": "Gopalganj",
  "label": "গোপালগঞ্জ",
  "level": "DISTRICT",
  "parentId": "division-cuid",
  "latitude": null,
  "longitude": null,
  "isVerified": false
}
```

**Frozen compat routes unchanged:** `/api/locations/*`, `/api/mobile/locations/*`

---

## Cache Strategy

| Key pattern | Content | TTL |
|-------------|---------|-----|
| `area:v1:divisions` | Division list | 86400s (24h) |
| `area:v1:districts:{divisionId}` | District list | 86400s |
| `area:v1:upazilas:{districtId}` | Upazila list | 86400s |
| `area:v1:unions:{upazilaId}` | Union list | 86400s |
| `area:v1:villages:{unionId}` | Village list | 86400s |
| `area:v1:search:{hash}` | Search results | 3600s |

**Prefix:** `{REDIS_PREFIX}cache:` (via `getCacheService()`)

**Invalidation:** `delPattern('area:v1:*')` on seed apply  
**Warmup:** `warmAreaHierarchyCache()` — divisions + optional top-level preload  
**Fallback:** DB direct when Redis unavailable (non-fatal)

---

## Flutter Integration

| Artifact | Path |
|----------|------|
| DTOs | `lib/core/area/area_dto.dart` |
| Repository contract | `lib/core/area/area_repository_contract.dart` |
| Local cache contract | `lib/core/area/area_cache_contract.dart` |
| Offline readiness | Hive keys documented in cache contract |

**Repository methods mirror API:** `getDivisions()`, `getDistricts(divisionId)`, …, `search(q)`

---

## Exit criteria

| Criterion | Target |
|-----------|--------|
| Zero edits to `modules/area/**` | Required |
| Additive `/api/area/*` only | Required |
| Seed idempotent + version recorded | Required |
| Tests: seed, API, hierarchy, search, cache | Required |
| `npm run area:verify` pass | Required |
| Flutter contract files present | Required |

---

```
AREA_ENGINE_PLANNED=YES
FREEZE_COMPLIANT=YES
```
