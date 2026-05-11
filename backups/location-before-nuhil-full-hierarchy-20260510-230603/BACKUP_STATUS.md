# Backup snapshot (20260510-230603)

- **Snapshot directory:** `D:\PraniDoctor\pranidoctor-web\backups\location-before-nuhil-full-hierarchy-20260510-230603`
- **Legacy backup:** `D:\PraniDoctor\pranidoctor-web\backups\location-before-nuhil`
- **Legacy backup:** expected CSVs + `mappings/` + `reports/` + `schema.prisma` present.

- **pg_dump:** not found on PATH.

## Docker hint

```
pranidoctor-minio
pranidoctor-postgres
qurbani_postgres
```

Example (adjust container/user/db): `docker exec pranidoctor-postgres pg_dump -U postgres pranidoctor_db --no-owner -f /tmp/d.sql` then `docker cp` to host.

CSV snapshots are independent of SQL dumps. Create a DB dump manually before any destructive import if automation failed.
