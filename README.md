# Prani Doctor — Web (Next.js)

## Bangladesh Location Master

Geography (division → district → upazila → union → village) lives in normalized Prisma models `Division` … `Village`, with optional `latitude` / `longitude`, `source`, and `isVerified`. See `docs/LOCATION_MASTER_PLAN.md`.

**Generate CSVs from HDX** (after exporting sheets from `bgd_admin_boundaries.xlsx` into `tmp/` — see `scripts/generate-master-csv-from-hdx-tmp.ts`):

```bash
npm run locations:generate-csv
```

**Migrate and import:**

```bash
npx prisma migrate dev --name add_location_master
npm run locations:import
```

**Public read APIs:** `/api/locations/divisions`, `/districts`, `/upazilas`, `/unions`, `/villages`, `/search`, `/tree`.

**Mobile:** `/api/mobile/locations/divisions`, `/districts`, `/upazilas`, `/unions`, `/villages`, `/search`.

**Admin (authenticated):** `/api/admin/locations/stats`, `/missing-coords`, `/pending-verification`, `/duplicates`, `/import-report` (query `level=` including `ALL`, `limit=`).

**Import dry-run:** `npm run locations:import:dry-run` (writes `import-report.json`, no DB writes).

**Normalize + QA (unions/villages from `raw/`):** `npm run locations:normalize`, `npm run locations:qa`.

**Union parent mapping (nuhil ↔ HDX):** `npm run locations:suggest-union-mappings` (see `data/locations/SOURCE_COLLECTION_GUIDE.md` §5.1).

**Admin UI:** `/admin/locations` (+ missing-coords / pending-verification subpages).

**SQL QA:** `scripts/diagnostics/location-data-quality.sql`.

Village bulk data is not pre-filled; see `data/locations/VILLAGE_DATA_TODO.md`.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npx prisma validate
```

## Original create-next-app notes

This project was bootstrapped with [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app). See [Next.js documentation](https://nextjs.org/docs) for framework features.
