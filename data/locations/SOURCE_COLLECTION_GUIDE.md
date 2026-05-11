# Union & village data — source collection guide

This document describes how the Prani Doctor team collects **official or documented** raw geography files, stores them under `data/locations/raw/`, normalizes them into import-ready CSVs, and runs QA before `npm run locations:import`.

**Non‑negotiables**

- Do **not** invent union or village names, codes, or coordinates.
- Every normalized row must carry a **`source`** string that points to a registry entry (see `source-registry.json`) and ideally the original file name or URL.
- If the dataset is not an official government machine-readable export, keep **`is_verified=false`** until a documented QA pass.
- Missing coordinates: leave `lat` / `lng` empty (import stores `NULL`).

---

## 1. Where to put raw files

| Path | Use |
|------|-----|
| `data/locations/raw/unions/` | Original union exports (LGD/BBS, nuhil bundle, etc.) |
| `data/locations/raw/villages/` | Village / mouza / ward tables, census extracts, licensed CSVs |
| `data/locations/normalized/` | Optional copies of last normalized outputs (scripts also write canonical `unions.csv` / `villages.csv` in `data/locations/`) |
| `data/locations/reports/` | Normalization and QA JSON/CSV reports |

**Naming convention (recommended)**

- `YYYYMMDD-<sourceId>-<divisionOrScope>-unions.csv`
- Example: `20260510-lgd-bbs-union-official-30-unions.csv`

Use ASCII filenames where possible; keep Bangla **inside** the CSV cells.

---

## 2. Official sources (priority)

### Unions

1. **Local Government Division (LGD) / government gazette / union directory** — preferred when a reproducible CSV or API export exists.
2. **Bangladesh Bureau of Statistics (BBS)** — administrative locality lists tied to census geography, when licensing allows import.
3. **LGED** — published administrative datasets where explicitly allowed for reuse.

### Villages / mouzas

1. **BBS Population & Housing Census 2022** — community reports / locality tables **only** under an approved reuse path (no scraping of restricted portals).
2. **Official mouza / ward lists** from local government, when distributed as data (not retyped from PDF unless that is the controlled process).

### Bootstrap (unverified)

- **`nuhil/bangladesh-geocode`** — union-level open dataset with **internal numeric IDs** (not BBS geographic codes). Allowed only as bootstrap: set `source="nuhil/bangladesh-geocode"` and **`is_verified=false`** unless each row is cross-verified with an official list.

---

## 3. Canonical column layouts (normalized output)

### `unions.csv`

`division_code,district_code,upazila_code,union_code,name_en,name_bn,lat,lng,source,is_verified`

### `villages.csv`

`division_code,district_code,upazila_code,union_code,village_code,name_en,name_bn,lat,lng,source,is_verified`

---

## 4. Raw → normalized mapping

### 4.1 Already in canonical form

If a raw file’s header matches the canonical union or village header (with the same column order), the normalizer copies rows through validation and parent matching only.

### 4.2 nuhil / bangladesh-geocode (full hierarchy — preferred for Prani Doctor)

Place these **together** in `data/locations/raw/unions/` (exact names):

- `nuhil-divisions.csv` — from `divisions/divisions.csv` in the upstream repo  
- `nuhil-districts.csv` — from `districts/districts.csv`  
- `nuhil-upazilas.csv` — from `upazilas/upazilas.csv`  
- `nuhil-unions.csv` — from `unions/unions.csv`  

**Full hierarchy (no HDX cross-walk):** run **`npm run locations:nuhil:normalize-full`**. The script loads the bundle via **`scripts/locations/_nuhil-bundle.ts`** (`nuhilCsvBodyRows` — files are usually **headerless**; the first row must not be treated as a column header). It writes **`data/locations/normalized/nuhil-*.normalized.csv`** where **all four levels use nuhil’s internal numeric ids** as `division_code` / `district_code` / `upazila_code` / `union_code`. Then **`npm run locations:nuhil:switch-csv -- --execute`** replaces the four canonical master CSVs. **`source=`** `nuhil/bangladesh-geocode`, **`is_verified=false`** on every row.

**Legacy path (HDX parents + nuhil unions only):** **`scripts/locations/normalize-unions.ts`** maps nuhil unions onto existing **HDX-backed** `districts.csv` / `upazilas.csv` by **name**; mismatches go to **`unions-unmatched.csv`** until **`union-parent-mapping.csv`** is human-approved (§5.1–5.3). Prefer the full-hierarchy path above when the goal is **zero union-unmatched** at the CSV layer.

### 4.3 Bangla / English names

- Trim; NFC normalize; collapse internal whitespace (same rules as `normalizeLocationName` in code).
- Prefer **official Bangla** in `name_bn` when the source provides it.
- `name_en` may be transliteration; optional for villages if absent.

### 4.4 Missing codes

- **Union:** if the official source has no union code, leave `union_code` empty; **`name_bn` or `name_en` is required** for import matching fallback.
- **Village:** `village_code` optional; **`name_bn` required** in normalized output when the source supplies a label (mouza name may map to `name_bn` with `source` noting `mouza-based`).

### 4.5 Missing lat/lng

Leave cells empty. Do not interpolate. If a future official file includes polygon/geometry, record a TODO in your ticket tracker for centroid extraction — do not guess.

### 4.6 `is_verified`

- **Official verbatim match + code QA:** `true` only when policy allows.
- **Open source / field / manual:** default `false` until admin verification (see §6).

---

## 5. Normalization commands

```bash
npm run locations:normalize:unions
npm run locations:normalize:villages
npm run locations:normalize
npm run locations:qa
```

Outputs:

- `data/locations/unions.csv`, `data/locations/villages.csv` (canonical; **header-only** if no raw rows)
- `data/locations/reports/union-normalization-report.json`
- `data/locations/reports/village-normalization-report.json`
- `data/locations/reports/location-csv-qa-report.json` (from `npm run locations:qa`)
- Unmatched rows: `data/locations/reports/unions-unmatched.csv`, `villages-unmatched.csv` (created when needed)

### 5.1 Union parent mapping (nuhil ↔ HDX)

When nuhil unions fail because **HDX** division/district/upazila names or codes do not align with **nuhil** internal parent rows, use the mapping workflow (no silent guessing):

1. **Generate suggestions (read-only):**  
   `npm run locations:suggest-union-mappings`  
   Writes `data/locations/mappings/union-parent-mapping-review.csv` (every row **`review_status=PENDING`**) and `data/locations/reports/union-parent-mapping-report.json`.

2. **Review:** Open the review CSV. Check each suggested `target_*` against `divisions.csv` / `districts.csv` / `upazilas.csv`.

3. **Confidence labels (suggestions only):**  
   - **HIGH** — Single HDX upazila match: exact normalized EN+BN pair, or unique EN match when Bangla is absent in source. Still **requires human approval** before use.  
   - **MEDIUM** — Unique match on one dimension (e.g. district-only suggestion, or EN-only upazila when BN differs).  
   - **LOW** — Zero or multiple candidates, or broken nuhil parent chain; targets often empty — manual completion required.

4. **Approve:** Copy only verified rows into `data/locations/mappings/union-parent-mapping.csv` (see `union-parent-mapping.sample.csv` for column order). Set **`review_status=APPROVED`** and fill **all** `target_division_code`, `target_district_code`, `target_upazila_code` (and optional name columns for documentation). **Never** copy `PENDING` rows into the approved file unless you edit them to `APPROVED` after verification.

5. **Re-normalize and import:**  
   `npm run locations:normalize:unions` → `npm run locations:qa` → `npm run locations:import:dry-run` → `npm run locations:import`  

Approved mappings are keyed by **`source_division_code|source_district_code|source_upazila_code`** (nuhil **internal** ids from the raw bundle). Only **`APPROVED`** rows are applied; `PENDING` rows are ignored. Union rows keep `source=nuhil/bangladesh-geocode` and `is_verified=false`.

### 5.2 Manual-assisted union parent mapping review

When `union-parent-mapping-review.csv` has many **LOW** rows (no safe automatic target), use the helper workflow. It does **not** auto-approve anything; it only widens search heuristics into **candidate** columns for faster human review.

1. **Generate helper CSV (read-only):**  
   `npm run locations:union-mapping-helper`  
   Reads `data/locations/mappings/union-parent-mapping-review.csv`, master `divisions.csv` / `districts.csv` / `upazilas.csv`, and the nuhil bundle under `data/locations/raw/unions/`. Writes **`data/locations/mappings/union-parent-mapping-helper.csv`** — one row per source parent context, **`review_status=PENDING`**, up to three **`candidate_*`** blocks plus empty **`manual_target_*`**, **`selected_candidate`**, **`reviewed_by`**, **`notes`**. Re-running the helper **preserves** manual fields / review status / notes per source key when a previous helper file exists (back up the file if you prefer a clean slate).

2. **Review in a spreadsheet:** Open `union-parent-mapping-helper.csv`. For each row, compare **candidate 1 / 2 / 3** (codes and EN/BN names) against the master CSVs. Read **`failure_reason`** and each **`candidate_N_reason`** — especially when the note says the nuhil division was missing or unmapped and candidates were searched across **all** divisions.

3. **Record your choice:** Set **`selected_candidate`** to **`1`**, **`2`**, **`3`**, or **`MANUAL`**.  
   - Use **`1`–`3`** when that candidate’s target triple is correct.  
   - Use **`MANUAL`** (or leave **`selected_candidate`** empty) and fill **`manual_target_division_code`**, **`manual_target_district_code`**, **`manual_target_upazila_code`** from the master files when none of the candidates are right.

4. **Approve only when certain:** Set **`review_status=APPROVED`** for rows you have verified. Leave all others **`PENDING`**. Optionally set **`reviewed_by`** and extend **`notes`**.

5. **Apply approved rows only:**  
   `npm run locations:union-mapping-apply-approved`  
   Validates targets against the master CSVs, merges into **`data/locations/mappings/union-parent-mapping.csv`** ( **`APPROVED`** rows only; never writes **`PENDING`** ), and writes **`data/locations/reports/approved-union-parent-mapping-report.json`**. If **`manual_target_*`** is fully filled, it is **preferred** over **`selected_candidate`**. Incomplete manual triples are rejected.

6. **Pipeline after approval:**  
   `npm run locations:normalize:unions` → `npm run locations:qa` → `npm run locations:import:dry-run` → `npm run locations:import` (import only when you intend to load DB).

### 5.3 Simple union mapping review process

For **batched**, spreadsheet-first review of **unmatched parent contexts** (see `data/locations/reports/union-parent-mapping-report.json` for the current count), use the simple review outputs (still **no auto-approval**):

1. **Prerequisites:** Run `npm run locations:suggest-union-mappings` and `npm run locations:union-mapping-helper` so `union-parent-mapping-review.csv` and `union-parent-mapping-helper.csv` exist.

2. **Generate simple review artifacts (read-only):**  
   `npm run locations:union-mapping-simple-review`  
   Writes:
   - `data/locations/mappings/union-parent-mapping-simple-review.csv` — sorted by **`affected_union_count`** descending (largest impact first); includes **nuhil source codes** (`source_division_code`, `source_district_code`, `source_upazila_code`) plus EN/BN names; **`selected_candidate`** and **`review_status`** default empty / **`PENDING`**; candidate columns are one-line summaries (codes + EN + BN + reason). **`review_id`** is `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}` (internal ids from the nuhil bundle); **empty** division or district ids appear as **consecutive hyphens** (for example `R--1-9`).
   - `data/locations/mappings/union-parent-mapping-human-review.md` — grouped narrative (by `failure_reason`, division, district, upazila) with **guidance-only** recommended actions (never written back as `APPROVED` automatically).
   - `data/locations/reports/union-mapping-simple-review-report.json` — totals, top 20 contexts, and file paths.

3. **Review in Excel:** Open **`union-parent-mapping-simple-review.csv`**. Start with the highest **`affected_union_count`**. If **candidate 1** clearly matches the official master after you check `divisions.csv` / `districts.csv` / `upazilas.csv`, set **`selected_candidate=1`** and **`review_status=APPROVED`**. If another candidate is correct, use **`2`** or **`3`**. If none match, set **`selected_candidate=MANUAL`** and fill **`manual_target_division_code`**, **`manual_target_district_code`**, **`manual_target_upazila_code`**. If unsure, leave **`review_status=PENDING`**.

4. **Save the CSV**, then apply only when you are ready:  
   `npm run locations:union-mapping-simple-apply`  
   Reads the simple CSV and **`union-parent-mapping-helper.csv`** (for candidate codes when **`selected_candidate`** is 1–3), validates targets, merges **`APPROVED`** rows into **`union-parent-mapping.csv`**, and writes **`data/locations/reports/union-mapping-simple-apply-report.json`**. **`PENDING`** rows are never written to the approved mapping file.

5. **Pipeline:**  
   `npm run locations:normalize:unions` → `npm run locations:qa` → `npm run locations:import:dry-run` → `npm run locations:import` (import only when you intend to load DB).

Re-running **`locations:union-mapping-simple-review`** preserves **`selected_candidate`**, manual targets, **`review_status`**, **`reviewed_by`**, and **`notes`** from an existing simple review CSV keyed by **`review_id`**.

### 5.4 Nuhil Bangladesh Geocode bootstrap policy

**Source:** [nuhil/bangladesh-geocode](https://github.com/nuhil/bangladesh-geocode) (MIT License — see the repository’s `LICENSE` file).

**What the upstream repo provides:** Division, district, upazila, and union tables with English and Bangla names, parent keys, optional government website fields, and multiple export formats (CSV, SQL, JSON, XML, PHP). It is a useful **community** reference, **not** a government-certified boundary product.

**How Prani Doctor uses it**

- **Full hierarchy (current rebuild path):** All four administrative CSV levels may be replaced from the nuhil bundle using **`normalize-nuhil-full-hierarchy.ts`** + **`switch-to-nuhil-hierarchy-csv.ts`** so **codes are nuhil ids throughout** — **no** HDX name matching, **no** `unions-unmatched.csv` from vocabulary drift at the CSV layer. See **`docs/NUHIL_LOCATION_HIERARCHY_MIGRATION_PLAN.md`**.
- **Legacy / partial path:** **`normalize-unions.ts`** still supports nuhil unions **under HDX parents** with human-approved **`union-parent-mapping.csv`** when you intentionally keep OCHA division/district/upazila masters.
- **`source`:** **`nuhil/bangladesh-geocode`** on every row imported from this bundle.
- **`is_verified`:** Always **`false`** until an explicit verification workflow promotes rows.
- **Villages:** Nuhil does **not** ship villages; **`villages.csv`** stays empty/header-only until a separate dataset is integrated.
- **Admin verification:** Use `npm run locations:qa`, admin “pending verification” APIs, and (when data matches an official table) a **new** CSV export with `is_verified=true` — do not fabricate coordinates or names.

**Known risks (also discussed in upstream GitHub issues)**

- Duplicate union names under the same upazila, missing unions, missing English names, and outdated or misaligned upazila records relative to current government boundaries.

**Operational commands**

- Bundle audit: **`npm run locations:audit:nuhil-unions`** → `data/locations/reports/nuhil-union-integration-audit.json`.
- Rebuild workflow: **`npm run locations:nuhil:backup-snapshot`**, **`npm run locations:nuhil:normalize-full`**, **`npm run locations:nuhil:switch-csv`** (use **`-- --execute`** only after sign-off), **`npm run locations:audit:clear-refs`**, **`npm run locations:clear-for-nuhil-rebuild -- --execute`** (dev only, after audit), **`npm run locations:import`**. See **`docs/NUHIL_LOCATION_HIERARCHY_MIGRATION_PLAN.md`**.

---

## 6. Admin verification workflow

1. Run `npm run locations:qa` and fix issues in raw or mapping.
2. Run `npm run locations:import:dry-run`; read `data/locations/import-report.json`.
3. Use admin APIs: `/api/admin/locations/pending-verification`, `/missing-coords`, `/duplicates`.
4. For rows that pass QA against an official PDF/table, set `is_verified=true` in a **new** export (do not toggle in DB by hand unless that is your documented process).

---

## 7. Batch strategy (by division / district / upazila)

- Split large official exports into files per `division_code` or `district_code` under `raw/` using the naming convention — easier QA and rollback.
- Normalize one batch at a time; commit reports with the batch id in `source`.

---

## 8. SQL diagnostics

See `scripts/diagnostics/location-data-quality.sql` for duplicate-code and missing-coordinate checks after import.

---

## 9. Manual collection templates

Files:

- `manual_collection_template_union.csv`
- `manual_collection_template_village.csv`

These are **header-only** templates. The admin team copies them, fills one row per verified locality, and sets:

- **`source`**: who collected it, when, and reference (field form id, photo id, or official table id).
- **`is_verified`**: `false` until a supervisor confirms against an official list or signed-off field form.

Never leave `source` empty. Do not import template files directly into production without removing instruction rows (templates are header-only by design).

