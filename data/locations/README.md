# Bangladesh location CSVs (Location Master)

CSV files in this folder feed `scripts/import-locations.ts`. **Do not invent village names or coordinates.** Empty `lat` / `lng` cells import as SQL `NULL`. Empty `is_verified` imports as `false`.

## Column reference

### `divisions.csv`

| Column | Required | Description |
|--------|----------|-------------|
| `code` | yes | Stable administrative code (e.g. BBS / HDX pcode without `BD` prefix). |
| `name_en` | yes | English label. |
| `name_bn` | no | Bangla label. |
| `lat`, `lng` | no | Decimal degrees; leave empty if unknown. |
| `source` | no | Provenance (dataset name, URL, version). |
| `is_verified` | no | `true` / `false` / `1` / `0`; default false. |

### `districts.csv`

| Column | Required | Description |
|--------|----------|-------------|
| `division_code` | yes | Parent division `code`. |
| `district_code` | yes | District code. |
| `name_en` | yes | English. |
| `name_bn` | no | Bangla. |
| `lat`, `lng`, `source`, `is_verified` | no | Same semantics as divisions. |

### `upazilas.csv`

| Column | Required | Description |
|--------|----------|-------------|
| `district_code` | yes | Parent district `code`. |
| `upazila_code` | yes | Upazila code. |
| `name_en` | yes | English. |
| `name_bn` | no | Bangla. |
| `lat`, `lng`, `source`, `is_verified` | no | Same as above. |

### `unions.csv`

Place the official union CSV here. The importer supports **two** header shapes (detected automatically):

1. **Hierarchy (recommended):**  
   `division_code,district_code,upazila_code,union_code,name_en,name_bn,lat,lng,source,is_verified`  
   Parents are validated against existing division / district / upazila rows (no parent rows are created from union lines).

2. **Legacy (8 columns):**  
   `upazila_code,union_code,name_en,name_bn,lat,lng,source,is_verified`  
   If multiple upazilas share the same `upazila_code`, the script logs a warning and picks one match — prefer the hierarchy format for production.

`lat` / `lng` are optional; invalid numbers are rejected and counted in `import-report.json`. `source` is required on hierarchy rows. Empty `is_verified` → `false`.

See `unions.sample.csv` for the hierarchy header (no data rows in repo).

### `villages.csv`

| Column | Required | Description |
|--------|----------|-------------|
| `division_code`, `district_code`, `upazila_code`, `union_code` | yes | Resolve hierarchy; **union** is matched only by `union_code` under the resolved upazila (village names are never used to guess the union). |
| `village_code` | no | Optional stable code. |
| `name_en` | no | English / transliteration when available. |
| `name_bn` | yes | Primary Bangla label (required for import row). |
| `lat`, `lng` | no | Optional; never guessed. |
| `source` | yes | Provenance string. |
| `is_verified` | no | Default `false`. Keep `false` unless data is officially verified or QA-approved. |

See `villages.sample.csv` for the header template.

### SQL diagnostics

Run `scripts/diagnostics/location-data-quality.sql` in `psql` (or your SQL client) against the app database for duplicate codes, duplicate village names per union, missing coordinates, and unverified counts by level.

## Regenerating division / district / upazila from HDX

1. Download `bgd_admin_boundaries.xlsx` from  
   [HDX cod-ab-bgd](https://data.humdata.org/dataset/cod-ab-bgd).
2. Export sheets to `tmp/hdx_admin1.csv`, `tmp/hdx_admin2.csv`, `tmp/hdx_admin3.csv` (see header comment in `scripts/generate-master-csv-from-hdx-tmp.ts`).
3. Run: `npm run locations:generate-csv`

## Union / village source pipeline

1. Place raw files under `data/locations/raw/unions/` and `data/locations/raw/villages/` (see `SOURCE_COLLECTION_GUIDE.md` and `source-registry.json`).
2. Run `npm run locations:normalize` then `npm run locations:qa`.
3. Review `data/locations/reports/*.json` and unmatched CSVs.
4. Run import dry-run / import as below.

## Import report

After `npm run locations:import` or `npm run locations:import:dry-run`, see `import-report.json` (counts, `summary.duplicateWarningsTotal`, `summary.missingCoordinatesInDb` and `summary.pendingVerificationApprox` from a **read-only** DB snapshot at end of run, `notes`). Dry-run performs validation and summary only — **no** database writes for divisions through villages.

## Official data policy

Do not add fabricated unions, villages, or coordinates. Non-official CSVs may be imported for staging, but **`is_verified` must stay false** until reviewed. Prefer BBS / LGED / other government or explicitly licensed datasets; see `VILLAGE_DATA_TODO.md` and `docs/LOCATION_MASTER_PLAN.md`.
