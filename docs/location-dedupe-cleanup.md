# Location master: duplicate cleanup and backups

This note supports **safe deduplication** of Bangladesh `Division` → `District` → `Upazila` → `Union` → `Village` rows when the same official code or the same English display label appears more than once under the same parent (common after repeated CSV imports or slug drift).

## Order of operations

1. Inspect reports (optional): `npm run locations:report-duplicates`
2. **Back up the database** (commands below)
3. Dry-run dedupe: `npm run locations:dedupe -- --dry-run`
4. Review `data/locations/reports/location-duplicates-report.json` and `location-dedupe-last-run.json`
5. Apply dedupe: `npm run locations:dedupe -- --apply`
6. Re-run duplicate report; confirm code-based duplicate groups are gone
7. Apply Prisma migration for partial unique indexes on trimmed codes:  
   `npx prisma migrate dev --name location_dedupe_unique_constraints`  
   (or deploy the migration in your environment)

## Backup (PowerShell)

Set variables from `.env` (same folder as the web app). **Do not commit secrets.**

```powershell
cd D:\PraniDoctor\pranidoctor-web
# Load DATABASE_URL (requires a small helper or paste URL manually)
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*DATABASE_URL\s*=\s*"(.+)"\s*$') { $env:DATABASE_URL = $matches[1] }
  elseif ($_ -match '^\s*DATABASE_URL\s*=\s*(.+)\s*$') { $env:DATABASE_URL = $matches[1].Trim('"') }
}
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = "D:\PraniDoctor\pranidoctor-web\backups\pranidoctor-pre-location-dedupe-$stamp.sql"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null
pg_dump --dbname=$env:DATABASE_URL --format=custom --file="$out.dump" --no-owner --no-acl
pg_dump --dbname=$env:DATABASE_URL --file=$out --no-owner --no-acl --schema-only
Write-Host "Wrote $out and $out.dump"
```

If `pg_dump` is not installed, use your host’s managed backup / snapshot, or install [PostgreSQL client tools](https://www.postgresql.org/download/) so `pg_dump` is available. A schema-only export is better than nothing, but **prefer a full custom-format dump** (`--format=custom`) for restore testing.

## Scripts and outputs

| Step | Command | Output |
|------|---------|--------|
| Duplicate report | `npm run locations:report-duplicates` | `data/locations/reports/location-duplicates-report.json`, `.md` |
| Dedupe | `npm run locations:dedupe -- --dry-run` or `--apply` | `data/locations/reports/location-dedupe-last-run.json` |

## Duplicate groups vs code collisions

- **Mergeable duplicates** (in `districts`, `upazilas`, … arrays): same parent, same trimmed official `code`, and the **same** normalized English display label — safe for `locations:dedupe --apply` after backup.
- **Code collisions** (`warnings.districtSameCodeDifferentLabels`): same parent + same trimmed `code` but **different** labels (example: two different districts incorrectly given `3033`). **Do not run the dedupe merge** on these; fix the CSV or `UPDATE` the wrong `code` first. The partial unique index migration **will fail** until these are resolved.
- Repoints FKs (`District.divisionId`, `Upazila.districtId`, `Union.upazilaId`, `Village.unionId`, technician profile and service-area FKs, `ServiceRequest.villageId`, doctor/technician service area village links).
- Deletes duplicate geography rows only after references are moved.
- **Dry-run** does not write; it reports how many duplicate **groups** would be merged in the first pass per level (see JSON note in script output).

## Import idempotency

`scripts/import-locations.ts` trims and normalizes official codes, resolves existing rows by normalized code (and name fallback) using in-memory caches, and keeps CSV re-imports from creating parallel rows for the same trimmed code under the same parent.

## API behaviour

`src/lib/locations/location-master-service.ts` filters list responses so the mobile picker does not show two rows with the same trimmed code or the same English/Bangla display key under the same parent.

## Mobile plan document

`D:\PraniDoctor\pranidoctor_mobile\docs\ai_technician_layout_service_area_location_dedupe_plan.md` was **not present** in the workspace; this doc replaces that gap for the web/backend workflow.
