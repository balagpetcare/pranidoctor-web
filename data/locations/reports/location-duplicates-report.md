# Location duplicate report

Generated: **2026-05-11T00:23:58.451Z**

## Summary

| Level | Duplicate groups | Rows in those groups |
| --- | ---: | ---: |
| Divisions | 0 | 0 |
| Districts | 0 | 0 |
| Upazilas | 0 | 0 |
| Unions | 0 | 0 |
| Villages | 0 | 0 |

**District code collisions (same division + code, different labels):** 0 — fix manually in CSV/DB before applying unique indexes; see `warnings.districtSameCodeDifferentLabels` in JSON.

## Partial unique index risks (trimmed official code)

These groups would block `CREATE UNIQUE INDEX … (trim(code))` until merged or corrected. **unsafe** = same trim(code) under parent but **different** normalized English labels — not auto-merged by `locations:dedupe`.

| Level | Groups | Unsafe groups |
| --- | ---: | ---: |
| Division | 0 | 0 |
| District | 0 | 0 |
| Upazila | 0 | 0 |
| Union | 0 | 0 |
| Village | 0 | 0 |

See JSON path `partialUniqueTrimCodeConflicts` for row details.

JSON: `data\locations\reports\location-duplicates-report.json`

## District code collisions (manual fix)

_None._

## Divisions (same code + label, or same label when code empty)

_No duplicate groups._

## Districts (per division)

_No duplicate groups._

## Upazilas (per district)

_No duplicate groups._

## Unions (per upazila)

_No duplicate groups._

## Villages (per union)

_No duplicate groups._
