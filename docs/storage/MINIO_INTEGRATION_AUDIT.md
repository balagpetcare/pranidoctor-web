# MinIO Integration Audit

**Date:** 2026-05-22  
**Scope:** `pranidoctor-backend`, `pranidoctor-web` (proxy), `pranidoctor_user` (Flutter)

## Current status

### Storage backend (live path)

| Component | Location | Status |
|-----------|----------|--------|
| MinIO docker service | `pranidoctor-backend/docker-compose.yml` | Configured (`:9000` API, `:9001` console) |
| Env resolution | `src/shared/config/env.resolver.ts` | Resolves `MINIO_*` → `S3_ENDPOINT` |
| Legacy upload ingest | `src/legacy/web/lib/storage/upload-service.ts` | **Active** — multipart → MinIO/S3 → `UploadedFile` row |
| S3 client | `src/legacy/web/lib/storage/s3-client.ts` | PUT, signed GET/PUT, DELETE |
| Storage facade | `src/legacy/web/lib/storage/storage-module.ts` | **Added** — `uploadFile`, `deleteFile`, `getPublicUrl`, `generatePresignedUrl` |
| Signed download | `src/legacy/web/lib/storage/upload-download.ts` | GET redirect to presigned object URL |
| Media module | `src/modules/media/*` | Infrastructure exists; HTTP routes return 503 (migration pending) |

### API routes

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/mobile/upload` | Customer JWT | Generic upload with `purpose` + `file` |
| `POST /api/mobile/upload/multiple` | Customer JWT | Batch upload (max 10) |
| `DELETE /api/mobile/upload/:id` | Customer JWT | Soft-delete DB row + remove object |
| `GET /api/mobile/upload/presigned` | Customer JWT | Presigned PUT (new) or GET (existing file) |
| `POST /api/mobile/uploads` | AI technician JWT | Legacy generic upload |
| `POST /api/mobile/uploads/profile-image` | Customer JWT | Profile / animal photo + DB field update |
| `POST /api/mobile/uploads/cover-image` | Customer JWT | Farm cover + DB field update |
| `POST /api/mobile/support/upload` | Customer JWT | Support attachments |
| `GET /api/mobile/uploads/:id` | Purpose-based | 302 → presigned MinIO URL |

Web (`pranidoctor-web`) proxies all `/api/mobile/upload*` routes to backend via `proxyRouteToBackend`.

### Bucket structure (live)

```
uploads/v1/{ownerUserId}/{MobileUploadPurpose}/{uuid}-{sanitizedName}.{ext}
```

- **Bucket:** `pranidoctor-dev` (default, from `S3_BUCKET` / `MINIO_BUCKET`)
- **Access:** Private objects; app URLs redirect to short-lived signed GET URLs (default 300s)

### Upload response shape (new routes)

Envelope: `{ ok: true, data: { ... } }` (existing API convention)

`data` fields:

```json
{
  "success": true,
  "url": "http://PC:3000/api/mobile/uploads/{fileId}",
  "objectKey": "uploads/v1/...",
  "mimeType": "image/webp",
  "size": "12345",
  "bucket": "pranidoctor-dev",
  "fileId": "cuid..."
}
```

### Environment variables

**Backend (`pranidoctor-backend/.env.example`):**

| Variable | Role |
|----------|------|
| `STORAGE_ENABLED` | Master toggle |
| `STORAGE_DRIVER` | `minio` / `s3` / `local` / `disabled` |
| `MINIO_HOST`, `MINIO_PORT`, `MINIO_USE_SSL` | Built into endpoint |
| `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | Credentials (aliases: `S3_ACCESS_KEY*`) |
| `MINIO_BUCKET`, `MINIO_PUBLIC_URL` | Bucket + optional public origin hint |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_FORCE_PATH_STYLE` | SDK config |
| `S3_SIGNED_URL_EXPIRY_SECONDS` | Presigned TTL |
| `UPLOAD_MAX_*_MB`, `UPLOAD_ALLOWED_*_TYPES` | Validation |

**Flutter (`pranidoctor_user/.env.example`):**

| Variable | Role |
|----------|------|
| `API_BASE_URL` | Backend origin (e.g. `http://192.168.10.111:3000`) |
| `UPLOAD_URL` | Optional; defaults to `API_BASE_URL` |

### Flutter integration

| Feature | Widget / service | Endpoint |
|---------|------------------|----------|
| Shared module | `lib/features/shared/upload/` | Central `UploadService` |
| Profile avatar | `ProfileRepository` + `ImagePickerTile` | `/api/mobile/uploads/profile-image` |
| Farm cover | `FarmImageUpload` → `ImagePickerTile` | `/api/mobile/uploads/cover-image` |
| Animal photo | `AnimalImageUpload` → `ImagePickerTile` | `/api/mobile/uploads/profile-image` |
| Support attachments | `SupportAttachmentPicker` + `UploadService` | `/api/mobile/support/upload` |
| Offline sync | `SyncCoordinator` | Uses `UploadService` |

### Android local HTTP

- Debug: `android/app/src/debug/res/xml/network_security_config.xml` — cleartext allowed
- Release: HTTPS required (`AppEnv.assertProductionReady`)

## Missing / deferred (unchanged architecture)

| Item | Notes |
|------|-------|
| Prescription / report / chat file upload UI | Backend DTOs do not expose attachment fields yet; shared module ready |
| `/api/media/*` module | Still 503; legacy path is canonical |
| Direct MinIO upload from mobile | Presigned PUT endpoint exists; app currently uses multipart via API |
| `UploadedFile.publicUrl` column | Not populated; app URLs used instead |
| Release cleartext config | Intentionally omitted; production must use HTTPS |

## Integration map

```
Flutter (pranidoctor_user)
  │
  │  multipart POST + Bearer JWT
  ▼
Backend API (:3000)  pranidoctor-backend
  │
  │  ingestMobileUpload → putObjectBytes
  ▼
MinIO (:9000)  bucket: pranidoctor-dev
  │
  │  GET /api/mobile/uploads/:id → 302 presigned URL
  ▼
Flutter Image.network / browser preview
```

**WiFi dev chain:**

```
Phone (192.168.x.x)
  → http://PC_IP:3000/api/mobile/upload*
  → http://127.0.0.1:9000 (MinIO on PC)
```

## Key files

| Repo | Path |
|------|------|
| Backend | `src/legacy/web/lib/storage/storage-module.ts` |
| Backend | `src/legacy/web/routes/mobile/upload/` |
| Web | `src/app/api/mobile/upload/` |
| Flutter | `lib/features/shared/upload/` |
| Docs | `docs/storage/MINIO_CHECKLIST.md` |
