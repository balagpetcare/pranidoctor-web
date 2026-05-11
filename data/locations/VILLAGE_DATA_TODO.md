# Verified village / mouza / para data — TODO

The Prani Doctor location master **does not** ship a complete national village inventory. Villages are highly granular; only **official or explicitly licensed** lists should be imported.

## Recommended sources (verify license and freshness before use)

1. **Bangladesh Bureau of Statistics (BBS)** — census and administrative locality publications / GIS products.  
2. **Local Government Engineering Department (LGED)** — union / mouza / village administrative datasets where published for reuse.  
3. **OCHA HDX** — check whether updated admin bundles include finer levels than adm3; attribute correctly in `source`.

## How to add villages

1. Obtain a CSV (or convert a published table) matching `data/locations/README.md` → `villages.csv` layout.  
2. **Never** interpolate coordinates; leave `lat` / `lng` blank unless the source provides surveyed or official centroid values.  
3. Set `is_verified` to `true` only after human or procedural QA.  
4. Run `npm run locations:import:dry-run` first, then `npm run locations:import`, and review `data/locations/import-report.json`.  
5. Use `scripts/diagnostics/location-data-quality.sql` and admin APIs under `/api/admin/locations/*` for ongoing QA.

See also `villages.sample.csv` for a **non-authoritative** structural example (replace with real rows before production use).
