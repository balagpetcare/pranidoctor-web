# Universal uploads — S3 / MinIO setup

The mobile upload API (`POST /api/mobile/uploads`) stores bytes in **S3-compatible** object storage and metadata in **`UploadedFile`** (Prisma). Clients receive a **`downloadUrl`** that hits **`GET /api/mobile/uploads/[id]`** (owner) or **`GET /api/admin/uploads/[id]`** (admin); those routes redirect with a **short-lived signed S3 URL** — the bucket is not exposed publicly by default.

## Environment variables

Copy from `.env.example` (never commit real `.env`):

| Variable | Role |
|----------|------|
| `STORAGE_DRIVER` | `s3` (default) or `disabled` to turn off uploads |
| `S3_ENDPOINT` | Optional; set for MinIO / custom endpoints (e.g. `http://127.0.0.1:9000`) |
| `S3_REGION` | AWS region or arbitrary string for MinIO |
| `S3_BUCKET` | Target bucket |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Credentials |
| `S3_FORCE_PATH_STYLE` | `true` for MinIO and many S3-compatible providers |
| `UPLOAD_MAX_IMAGE_MB` / `UPLOAD_MAX_DOCUMENT_MB` | Size caps |
| `UPLOAD_ALLOWED_IMAGE_TYPES` / `UPLOAD_ALLOWED_DOCUMENT_TYPES` | Comma-separated MIME allowlists |

`APP_URL` or `NEXT_PUBLIC_APP_URL` should match your public site origin so `downloadUrl` is correct behind proxies.

## Local MinIO (recommended: Docker Compose)

From **`pranidoctor-web`** (repo root):

```bash
docker compose up -d
```

This starts **PostgreSQL**, **MinIO** (API `:9000`, console `:9001`), and a one-shot **`minio-init`** job that creates the bucket **`pranidoctor-dev`** if missing (same default name as `S3_BUCKET` in **`.env.example`**). Objects stay **private**; the app issues **short-lived signed GET** URLs via `/api/mobile/uploads/[id]` and `/api/admin/uploads/[id]`.

Default dev credentials (see `docker-compose.yml`): console user **`admin`** / password **`Admin@12345678`**. Align `.env` with the same access key, secret, endpoint `http://127.0.0.1:9000`, bucket **`pranidoctor-dev`**, and `S3_FORCE_PATH_STYLE=true`.

### One-off MinIO (without Compose)

Create a bucket (e.g. `pranidoctor-dev`) in the MinIO console (`:9001`) or with `mc`, then point `.env` at it.

```bash
docker run -p 9000:9000 -p 9001:9001 --name pranidoctor-minio \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"
```

## Production (AWS S3, DigitalOcean Spaces, Wasabi, etc.)

- Use the provider’s endpoint and region.
- Set `S3_FORCE_PATH_STYLE` per provider docs (often `false` on AWS).
- Ensure the bucket exists and the IAM user can `PutObject` and `GetObject`.

## Bangladesh reference locations (dropdowns)

Geography for mobile district / upazila / union pickers is loaded from **`Division` → `District` → `Upazila` → `Union`** rows. Seed or refresh reference data (idempotent **`upsert`** on slugs):

```bash
cd pranidoctor-web
npx prisma generate
npm run db:seed
# or: npx prisma db seed
```

Source: `prisma/seed-data/bd-locations.ts` (`seedBdReferenceLocations`). Expand rows there for more districts; production may use a larger import job.

## Related code

- Env parsing: `src/lib/storage/storage-env.ts`
- Upload pipeline: `src/lib/storage/upload-service.ts`, `mime-sniff.ts`, `s3-client.ts`
- Routes: `src/app/api/mobile/uploads`, `src/app/api/mobile/uploads/[id]`, `src/app/api/admin/uploads/[id]`
- Mobile location APIs: `src/app/api/mobile/locations/*`
