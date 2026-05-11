# Backup snapshot — nuhil location rebuild (20260510-232224)

- **Snapshot directory:** `D:/PraniDoctor/pranidoctor-web/backups/location-rebuild-nuhil-20260510-232224`
- **Included:** `data/locations/*.csv`, `raw/`, `normalized/`, `mappings/`, `reports/`, `prisma/schema.prisma`, `package.json`, `docs/`

- **pg_dump:** not found on PATH.

## PostgreSQL via Docker (local compose)

Service: `db`, container name: **`pranidoctor-postgres`**, database: **`pranidoctor_db`**, user: **`postgres`**.

Dump to a file inside the container, then copy to the host:

```bash
docker exec pranidoctor-postgres pg_dump -U postgres -d pranidoctor_db --no-owner -f /tmp/pranidoctor-pre-nuhil.sql
docker cp pranidoctor-postgres:/tmp/pranidoctor-pre-nuhil.sql ./backups/pranidoctor-pre-nuhil-manual.sql
```

## Warning

Automated `pg_dump` did not produce a SQL file. Take a manual dump (host `pg_dump` or Docker above) before **clear** or destructive imports.

CSV and docs snapshots are independent of SQL dumps.
