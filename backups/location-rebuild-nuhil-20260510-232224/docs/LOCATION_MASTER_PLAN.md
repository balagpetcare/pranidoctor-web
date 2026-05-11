# Bangladesh Location Master — Plan

## 1. Executive summary

This document defines a **centralized Bangladesh geography layer** (division → district → upazila → union → village) with bilingual labels, optional coordinates, **data source tracking**, **verification flags**, CSV import, and shared read APIs for web, admin, and mobile.

**Schema decision (backward compatibility):** The codebase already uses normalized Prisma models `Division`, `District`, `Upazila`, `Union`, and `Village` with foreign keys on AI technician profiles, service areas, and service requests. Introducing parallel `LocationDivision`… tables would duplicate IDs and break existing clients. The implementation **extends these existing models** with the fields and indexes described in the product brief (conceptually the “Location*” layer). All APIs continue to expose stable `id` (cuid) values.

## 2. Existing location implementation audit

| Area | Implementation |
|------|----------------|
| **Prisma** | `Division`, `District`, `Upazila`, `Union`, `Village` plus separate `Area` tree for admin “unified hierarchy”. |
| **Mobile APIs** | `GET /api/mobile/locations/districts`, `upazilas`, `unions`, `search` — implemented in `src/lib/mobile-locations/locations-service.ts`. No divisions or villages list endpoints existed. |
| **Seed** | `prisma/seed-data/bd-locations.ts` patches a division and upserts a small district/upazila/union sample. `prisma/seed.ts` upserts Dhaka/Gazipur demo chain + `seedBdReferenceLocations`. |
| **Validation** | `src/lib/mobile-locations/geo-resolve.ts` checks district ↔ upazila ↔ union consistency for technician flows. |
| **Admin** | `Area` CRUD under `/api/admin/areas` and admin UI pages — separate from normalized BD tables. |

## 3. Current database / schema audit (pre-change)

- **Division / District / Upazila / Union:** `name`, optional `nameBn` / `nameEn`, `slug` (unique), optional `code`, `sortOrder`, `isActive`, timestamps. No `latitude` / `longitude` / `source` / `isVerified`.
- **Village:** `name`, `slug` (unique), optional `code`, `unionId`, timestamps. No bilingual split, coords, source, or verification.
- **Indexes:** Mostly `divisionId`, `districtId`, `upazilaId`, `unionId`, `isActive`; no composite uniqueness on administrative codes under parent.

## 4. Where location is used (integration map)

| Consumer | Usage |
|----------|--------|
| **Mobile** | `LocationRepository` (Flutter) calls mobile location endpoints for cascaded selects (AI farmer / technician flows). |
| **Mobile AI technician** | `districtId`, `upazilaId`, `unionId` on profiles and division service areas; geo-resolve for labels. |
| **Mobile service requests** | Optional `villageId` resolution against `Village`. |
| **Admin** | `Area` tree for legacy geography UI; technician admin may list villages from Prisma. |
| **Future** | Map features, provider search by geometry — should read from the same APIs / DB fields, not hardcoded arrays. |

**Integration changes in this phase (minimal):** Centralize **read** paths through `src/lib/locations/location-master-service.ts`; extend mobile DTOs with optional `code`, `latitude`, `longitude`, `isVerified` without removing existing fields. No change to JWT contracts or envelope shape (`{ ok, data }`).

## 5. Proposed normalized schema (logical = physical models)

Prisma models are named `Division`, `District`, `Upazila`, `Union`, and `Village` (not separate `Location*` tables) so existing foreign keys and mobile `id` values remain stable.

Fields added to **all five** levels (where applicable):

- `latitude`, `longitude` — `Decimal(10,7)` nullable; never fabricated in import.
- `source` — nullable string (e.g. HDX dataset id / version).
- `isVerified` — boolean, default `false`; `true` only when data comes from an approved import row with explicit `is_verified` in CSV or policy for trusted admin boundaries.

**Village** additionally: optional `nameBn`, `nameEn` (legacy `name` remains required for backward compatibility; import sets `name` from `name_bn` or `name_en`).

**Uniqueness / indexes:**

- **`code` is not unique** on `Division`, nor on `(parentId, code)` for `District`, `Upazila`, or `Union`. Legacy and merged seeds (e.g. demo + HDX import) can assign the same administrative `code` twice under one parent (example: `3033` for two district rows under Dhaka division). Enforcing `@@unique` caused migration **P3018**; the schema uses **non-unique composite indexes** on `(parentId, code)` for lookup only.
- **`slug`** remains `@unique` per row (stable API identity).
- **Matching for imports / merges:** use `(parentId, code)` when unambiguous; otherwise **`slug`** or **`parent + normalized name`** (`nameEn` / `nameBn`) as implemented in `scripts/import-locations.ts`.
- `Village` — `@@index([unionId, nameBn])`, `@@index([unionId, nameEn])` only (no `@@unique` on village `code`).

### 5.1 Administrative `code` and migration P3018

Source datasets and historical seeds may disagree on coding schemes or contain duplicates. **Do not assume** `code` is a primary key at any level except where your own data pipeline guarantees it. Prefer **`id` (cuid)** in APIs and FKs; use `code` as a hint for CSV import and display only.

**Failed migration recovery (dev):** If `20260510145715_add_location_master_fields` failed with a duplicate-key error on a unique index, mark it rolled back, then re-apply after pulling the corrected migration SQL (no unique on `(divisionId, code)` etc.):

```bash
npx prisma migrate resolve --rolled-back 20260510145715_add_location_master_fields
npx prisma migrate dev
```

Then run `npm run locations:import` if needed. See `scripts/diagnostics/location-code-duplicates.sql` to inspect duplicates before adding any future unique constraint.

## 6. Import / seed strategy

1. **Authoritative bulk rows (division / district / upazila):** Generated from **OCHA HDX** “Bangladesh: Administrative Boundaries” (`cod-ab-bgd`) XLSX sheets `bgd_admin1`, `bgd_admin2`, `bgd_admin3` — English names and centroid lat/lon. P-codes strip the `BD` prefix to match legacy numeric-style codes where applicable (e.g. `BD3026` → district code `3026`).
2. **Unions:** The HDX admin bundle used here does **not** ship a national union (admin4) sheet in the same XLSX. **`unions.csv`** may remain **header-only** until an official union list is added — or it may be populated from the **nuhil/bangladesh-geocode** CSV bundle as **bootstrap** data (`source=nuhil/bangladesh-geocode`, `is_verified=false`) normalized under HDX parents; see **§13 Nuhil Bangladesh Geocode bootstrap policy**. Existing unions created by Prisma seed remain; import does not delete missing rows.
3. **Villages:** **No fabricated villages.** `villages.csv` is optional; if absent or empty, import skips village upserts. `villages.sample.csv` and `VILLAGE_DATA_TODO.md` document how to attach verified village data later.
4. **Idempotent upsert:** Import matches primarily by `(parentId, code)`; fallback match by `(parentId, nameEn)` normalized to reduce duplicate rows when historical `code` values differ (e.g. centroid-based pcode updates from HDX).
5. **Prisma seed:** Keep `seedBdReferenceLocations` for dev samples; run `import-locations` after migrations for full national rows in local/staging.

## 7. API list

### Public (read-only, no auth)

- `GET /api/locations/divisions`
- `GET /api/locations/districts?divisionId=` (optional)
- `GET /api/locations/upazilas?districtId=`
- `GET /api/locations/unions?upazilaId=`
- `GET /api/locations/villages?unionId=`
- `GET /api/locations/search?q=&level=&limit=`
- `GET /api/locations/tree?divisionId=&districtId=&upazilaId=&unionId=`

Response item shape (shared): `id`, `code`, `nameEn`, `nameBn`, `latitude`, `longitude`, `isVerified` (and `slug` where legacy mobile consumers still expect it on mobile routes).

### Mobile aliases (same semantics / envelope as existing mobile locations)

- `GET /api/mobile/locations/divisions`
- `GET /api/mobile/locations/districts`
- `GET /api/mobile/locations/upazilas`
- `GET /api/mobile/locations/unions`
- `GET /api/mobile/locations/villages`
- `GET /api/mobile/locations/search` (extended optional `level` query)

### Admin (authenticated)

- `GET /api/admin/locations/stats` — counts, pending verification, missing coordinates by level, duplicate-warning aggregates.
- `GET /api/admin/locations/missing-coords?level=DIVISION|…|VILLAGE|ALL&limit=`
- `GET /api/admin/locations/pending-verification?level=…&limit=`
- `GET /api/admin/locations/duplicates?level=…&limit=` — sample rows involved in duplicate-code / duplicate-name-under-union groups.
- `GET /api/admin/locations/import-report` — last `data/locations/import-report.json` payload (or null if missing).

**Admin UI:** Minimal pages at `/admin/locations`, `/admin/locations/missing-coords`, `/admin/locations/pending-verification` (stats + tables). Existing `Area` admin pages stay unchanged.

## 8. Validation strategy

- Zod query validation on all routes (cuid checks for parent ids).
- **Programmatic hierarchy validation** in `src/lib/locations/location-hierarchy-validation.ts`:
  - Valid IDs exist and `isActive` where applicable.
  - Village requires union; union requires upazila; upazila requires district; district requires division.
- Import-time validation: parent keys must resolve before child insert; invalid rows counted and logged in `import-report.json`.

## 9. Missing data strategy

- Missing CSV column for lat/lng → store `NULL`.
- Missing `is_verified` → `false`.
- Missing English or Bangla name: use the other language or legacy `name` column; never invent village names.
- Missing union/village national CSV: **do not** generate; document in `VILLAGE_DATA_TODO.md`.

## 10. Rollback strategy

1. **Database:** `npx prisma migrate resolve` / down migration if in dev, or restore from pre-migration backup in staging/prod.
2. **Data:** Re-import previous CSV snapshot from version control; import is upsert-only and does not truncate tables.
3. **Application:** Revert deployment; old clients ignore new optional JSON fields.

## 11. Testing checklist

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npx prisma validate`
- [ ] `npx prisma migrate dev --name add_location_master`
- [ ] `npx tsx scripts/import-locations.ts`
- [ ] Curl / Invoke-WebRequest checks for each `/api/locations/*` and `/api/mobile/locations/*` route
- [ ] Spot-check: mobile district → upazila → union cascade still returns 200 and consistent hierarchy

## 12. Next steps (post-MVP)

- Full **union** CSV from LGED/BBS export + import QA.
- Verified **village** / mouza / para dataset with licensing review.
- Admin UI: filterable master list, bulk verify, coordinate editor.
- Optional: link `Area` tree to normalized master for a single geography UX.

## 13. Nuhil Bangladesh Geocode bootstrap policy

**Repository:** [https://github.com/nuhil/bangladesh-geocode](https://github.com/nuhil/bangladesh-geocode) — **MIT License** (verify current `LICENSE` in the repo before redistribution).

**Full-hierarchy migration plan:** **`docs/NUHIL_LOCATION_HIERARCHY_MIGRATION_PLAN.md`** (backup, FK audit, clear, import, API checklist, rollback).

### 13.1 Active approach: full nuhil hierarchy (division → union)

For **Prani Doctor / Animal Doctors**, the **canonical** administrative CSVs may be rebuilt **entirely** from the nuhil raw bundle under `data/locations/raw/unions/`:

- `nuhil-divisions.csv`, `nuhil-districts.csv`, `nuhil-upazilas.csv`, `nuhil-unions.csv`

**`scripts/locations/normalize-nuhil-full-hierarchy.ts`** emits `data/locations/normalized/nuhil-*.normalized.csv`; **`npm run locations:nuhil:switch-csv -- --execute`** copies them to `divisions.csv`, `districts.csv`, `upazilas.csv`, `unions.csv`.

- **`source`:** `nuhil/bangladesh-geocode` on every row from this pipeline.
- **`is_verified`:** `false` until an explicit verification workflow promotes rows.
- **Villages:** not supplied by nuhil; **`villages.csv`** remains out of scope until a separate official dataset is integrated.
- **Dev DB rebuild:** After `npm run locations:audit:clear-refs` shows `canClearHierarchyWithScript: true`, **`npm run locations:clear-for-nuhil-rebuild -- --execute`** clears normalized `Division`…`Village` tables (nullifies optional business FKs; removes village junction coverage rows via CASCADE) so **`npm run locations:import`** loads a single consistent hierarchy. **Do not** use this on production without backup and sign-off.

### 13.2 Legacy approach: HDX parents + nuhil unions only

Older workflows kept **HDX/OCHA** division/district/upazila CSVs and mapped **nuhil unions** onto them with **`normalize-unions.ts`** and optional **`union-parent-mapping.csv`**. That path can produce **`unions-unmatched.csv`** when names diverge; see `data/locations/SOURCE_COLLECTION_GUIDE.md` §5.1–5.3. **Never** auto-approve parent mappings.

### 13.3 Risk summary

- Upstream issues note **duplicate unions**, **missing unions**, **missing English names**, and **outdated** records.
- **`npm run locations:audit:nuhil-unions`** still helps inspect bundle integration; **`npm run locations:audit:clear-refs`** is required before a destructive hierarchy clear.

**Conclusion:** Nuhil is **unverified bootstrap** data. The full-hierarchy path removes CSV cross-vocabulary mismatch; HDX-only purists should treat official boundaries as a future verification source, not as something this repo fabricates.
