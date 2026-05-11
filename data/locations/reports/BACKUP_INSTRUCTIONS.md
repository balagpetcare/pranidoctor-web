# Location dedupe & migration — backup (read before `--apply`)

Do **not** run `npm run locations:dedupe -- --apply` or `npx prisma migrate deploy` against production without a verified backup.

## 1. Logical dump (PostgreSQL)

Replace connection string with your admin URL (not the pooled serverless URL if `pg_dump` fails).

```bash
pg_dump "$DATABASE_URL" --format=custom --file=backup-locations-$(date -u +%Y%m%d%H%M%S).dump
```

Restore (example):

```bash
pg_restore --clean --if-exists --dbname="$DATABASE_URL" backup-locations-....dump
```

## 2. CSV / seed sources

Copy `data/locations/*.csv` (and any custom hierarchy CSV) to version control or object storage before destructive merges.

## 3. Failed migration (P3009)

If a migration failed mid-way:

1. Confirm DB state (partial indexes may exist): `\di *Division_code*` in `psql`.
2. Use `npx prisma migrate resolve` only with the correct status after you understand what applied — see project runbook / Prisma docs for `--rolled-back` vs applied.

## 4. Order of operations

1. Backup (above).
2. `npm run locations:duplicates` (or `locations:report-duplicates`) — review JSON/Markdown.
3. `npm run locations:dedupe -- --dry-run` — review planned merges.
4. `npm run locations:dedupe -- --apply` — only when reports show **no** unsafe same-code–different-label groups for your policy.
5. `npx prisma migrate deploy` — after duplicates are resolved and migration prerequisites pass.
