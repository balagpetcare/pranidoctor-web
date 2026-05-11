# Nuhil full-hierarchy migration plan

## Current policy (2026)

**Prani Doctor intentionally rebuilt** the normalized location master (division → district → upazila → union) from the **nuhil/bangladesh-geocode** raw bundle only (`data/locations/raw/unions/`). There is **no** cross-walk to HDX/OCHA codes in this path: all four levels share **nuhil’s internal numeric id space**, so **CSV-level parent mismatch is zero by construction**.

- **`source`:** `nuhil/bangladesh-geocode` on every imported row from this bundle.
- **`isVerified`:** `false` for all such rows until an explicit verification workflow promotes them.
- **Villages:** **not** part of the nuhil bundle. `villages.csv` stays **header-only or unchanged** unless FK cleanup forces deleting existing `Village` rows (dev rebuild only). National village data remains **pending**.

## 1. Why HDX parents + nuhil unions caused unmatched rows (legacy path)

- **HDX** administrative codes (e.g. division `20`, district `2003`) come from OCHA **cod-ab-bgd** p-codes.
- **nuhil** uses **different** integer ids for division (1–8), district, upazila, and union.
- Mapping nuhil unions onto HDX parents by **name** produced **unmatched** rows when spellings or groupings diverged.

## 2. Full nuhil hierarchy (this migration)

If **divisions.csv**, **districts.csv**, **upazilas.csv**, and **unions.csv** all come from **`normalize-nuhil-full-hierarchy.ts`**, each union row’s `(division_code, district_code, upazila_code)` references rows that exist in the other CSVs. **No** HDX name-matching step.

## 3. Expected nuhil counts (raw bundle, after `nuhilCsvBodyRows`)

| Level     | Expected count |
|-----------|----------------|
| Divisions | 8              |
| Districts | 64             |
| Upazilas  | 494            |
| Unions    | 4540           |

Run `npm run locations:nuhil:normalize-full` and read the JSON summary for exact counts from your working copy.

## 4. Risks and policies

- **nuhil is bootstrap data** (MIT-licensed community project) — not a certified government boundary product.
- **Coordinates:** only when present and valid in source CSVs (district centroids may appear in `nuhil-districts.csv`; other levels may be blank).
- **API response shape** is unchanged; **ids (cuid) and `code` values** will change after a **clear + re-import** on an existing database. Clients must not treat old ids/codes as stable across this rebuild.

## 5. Phased procedure (development / local)

### Phase 1 — Backup

```bash
npm run locations:nuhil:backup-snapshot
```

Creates `backups/location-rebuild-nuhil-YYYYMMDD-HHMMSS/` with CSV snapshots, `raw/`, `normalized/`, `mappings/`, `reports/`, `prisma/schema.prisma`, `package.json`, and full `docs/`. Writes `BACKUP_STATUS.md` (host `pg_dump` if available; Docker `pg_dump` example for `pranidoctor-postgres`).

### Phase 2 — Reference audit

```bash
npm run locations:audit:clear-refs
```

Writes `data/locations/reports/location-clear-reference-audit.json`. If `summary.canClearHierarchyWithScript` is **false**, **do not** run the clear script until FKs are understood and fixed.

### Phase 3 — Normalize

```bash
npm run locations:nuhil:normalize-full
```

Writes `data/locations/normalized/nuhil-*.normalized.csv`.

### Phase 4 — Switch canonical CSVs

Dry-run (default):

```bash
npm run locations:nuhil:switch-csv
```

Execute:

```bash
npm run locations:nuhil:switch-csv -- --execute
```

### Phase 5 — QA and import dry-run

```bash
npm run locations:qa
npm run locations:import:dry-run
```

Confirm `location-csv-qa-report.json`: `hierarchyMatchesNuhilBootstrapCounts: true`, `safeToImport: true`, and `import-report.json`: `summary.missingParent: 0`, `summary.invalidCoordinate: 0`.

### Phase 6 — Clear DB hierarchy (manual, after audit OK)

```bash
npm run locations:clear-for-nuhil-rebuild -- --execute
```

Requires a fresh `locations:audit:clear-refs` with `canClearHierarchyWithScript: true`. Optional escape hatch: `--force-without-audit` (not recommended).

### Phase 7 — Import

```bash
npm run locations:import
```

### Phase 8 — API verification

- `GET /api/locations/divisions`
- `GET /api/locations/districts?divisionId=`
- `GET /api/locations/upazilas?districtId=`
- `GET /api/locations/unions?upazilaId=`
- `GET /api/locations/search?q=dhaka&level=ALL&limit=10`
- `GET /api/locations/tree?divisionId=`

Mobile mirrors: `/api/mobile/locations/*` with the same query patterns.

## 6. Rollback

1. Restore files from the latest `backups/location-rebuild-nuhil-*/` snapshot (or git).
2. Re-run `npm run locations:qa` and `npm run locations:import:dry-run`.
3. Restore PostgreSQL from a `.sql` dump taken before the clear/import if needed.

## 7. Scripts reference

| Script | Purpose |
|--------|---------|
| `scripts/locations/backup-nuhil-full-hierarchy-snapshot.ts` | `backups/location-rebuild-nuhil-*`, `BACKUP_STATUS.md`, optional `pg_dump` |
| `scripts/locations/normalize-nuhil-full-hierarchy.ts` | Normalized nuhil CSVs under `data/locations/normalized/` |
| `scripts/locations/switch-to-nuhil-hierarchy-csv.ts` | Replaces four master CSVs; `--execute` to apply |
| `scripts/locations/audit-location-references-before-clear.ts` | Pre-clear FK audit JSON |
| `scripts/locations/clear-location-master-for-nuhil-rebuild.ts` | Transactional clear; `--execute` |
| `scripts/locations/compare-current-vs-nuhil-hierarchy.ts` | Comparison report (optional) |

See `docs/LOCATION_MASTER_PLAN.md` §13 and `data/locations/SOURCE_COLLECTION_GUIDE.md` §5.4.
