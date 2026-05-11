# District trim-code conflict resolution

- generatedAt: 2026-05-11T00:23:43.836Z
- apply: true
- conflictGroups: 1

## cmp06al59000pcw8o0m3behy8|3033

- **Canonical:** `cmp01tafx001ad48ocdcas83c`
- **Duplicates:** `cmp01tafb0017d48on37ju3oh`

| District id | Slug | Code | Display (EN) | Upazilas | Tech profiles | Div. areas |
| --- | --- | --- | --- | ---: | ---: | ---: |
| `cmp01tafb0017d48on37ju3oh` | gazipur-district | 3033 | Gazipur | 5 | 0 | 0 |
| `cmp01tafx001ad48ocdcas83c` | tangail-district | 3033 | Tangail | 12 | 0 | 0 |

- Reassign district cmp01tafb0017d48on37ju3oh (Gazipur) → merge into canonical cmp01tafx001ad48ocdcas83c: move 5 upazila(s), 0 technician profile(s), 0 division service area row(s); then delete district cmp01tafb0017d48on37ju3oh.
- If an upazila on a duplicate district shares the same trimmed code as one on the canonical district, child upazila rows are merged (unions + FKs moved, duplicate upazila deleted).
