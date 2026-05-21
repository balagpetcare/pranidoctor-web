# Media System Implementation Report

**Phase:** 1.5  
**Date:** 2026-05-21  
**Status:** Complete

---

## Overview

Phase 1.5 implements a production-ready media system for the Prani Doctor backend using MinIO (S3-compatible) object storage. The system provides upload handling, image compression, thumbnail generation, metadata persistence, signed URLs, folder-based object keys, and strict file validation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                 │
│  POST /api/media/upload    GET /api/media/:id/url               │
│  POST /api/media/presign   DELETE /api/media/:id                │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     Media Module                                 │
│  Controller → Service → Repository                               │
│  Validation · Image Processor · Events                           │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
┌────────────▼────────────┐    ┌─────────────▼────────────────────┐
│   PostgreSQL (Media)    │    │   Storage Abstraction (S3/MinIO) │
│   Metadata persistence  │    │   IStorageProvider interface     │
└─────────────────────────┘    └──────────────────────────────────┘
```

---

## Components Implemented

### 1. Storage Abstraction (`src/infra/storage/`)

| File | Purpose |
|------|---------|
| `storage.types.ts` | `IStorageProvider` interface and config types |
| `s3-storage.provider.ts` | S3/MinIO implementation via AWS SDK v3 |
| `storage.factory.ts` | Singleton factory and initialization |
| `mime-sniff.ts` | Magic-byte MIME detection |
| `index.ts` | Public exports |

**IStorageProvider Interface:**
```typescript
interface IStorageProvider {
  isConfigured(): boolean;
  putObject(input: PutObjectInput): Promise<PutObjectResult>;
  deleteObject(key: string): Promise<void>;
  objectExists(key: string): Promise<boolean>;
  getSignedGetUrl(options: SignedUrlOptions): Promise<string>;
  getSignedPutUrl(options: SignedUrlOptions): Promise<string>;
  checkHealth(): Promise<StorageHealthResult>;
}
```

**Features:**
- S3-compatible (AWS S3, MinIO, DigitalOcean Spaces, Wasabi)
- Path-style URLs for MinIO (`S3_FORCE_PATH_STYLE=true`)
- Presigned GET and PUT URLs
- Private objects with short-lived signed access
- Health check via HeadObject

---

### 2. Media Module (`src/modules/media/`)

| File | Purpose |
|------|---------|
| `media.types.ts` | Context, purpose, status, metadata types |
| `media.folder.ts` | Object key generation and folder strategy |
| `media.validation.ts` | MIME, size, dangerous file checks |
| `media.image.processor.ts` | Sharp-based compression and thumbnails |
| `media.upload.middleware.ts` | Multer memory storage middleware |
| `media.dto.ts` | Request/response DTOs |
| `media.validator.ts` | Zod schemas |
| `media.repository.ts` | Metadata persistence (Prisma + in-memory fallback) |
| `media.service.ts` | Upload, signed URL, delete orchestration |
| `media.controller.ts` | HTTP handlers |
| `media.routes.ts` | Route definitions |
| `media.events.ts` | Domain events |
| `media.module.ts` | Module registration |

---

## Folder Strategy

Object keys follow the Phase 0 convention:

```
uploads/{context}/{yyyy}/{mm}/{fileId}[_{variant}].{ext}
```

| Segment | Values | Example |
|---------|--------|---------|
| Prefix | `uploads` | `uploads/` |
| Context | `farmer`, `doctor`, `ai-tech`, `admin` | `uploads/farmer/` |
| Year/Month | UTC `yyyy/mm` | `2026/05/` |
| File ID | nanoid(16) | `V1StGXR8_Z5jdHi6B` |
| Variant | `_thumb`, `_compressed` (optional) | `_thumb.webp` |

**Examples:**
```
uploads/farmer/2026/05/V1StGXR8_Z5jdHi6B.webp
uploads/doctor/2026/05/abc123_thumb.webp
uploads/admin/2026/05/xyz789_compressed.webp
```

---

## Upload Pipeline

```
1. Rate limit check (rateLimitUpload)
2. Optional authentication
3. Multer parses multipart (memory, size-capped)
4. Zod validates context + purpose
5. MIME sniff from magic bytes (not client Content-Type alone)
6. Size + allowlist validation
7. Image compression (JPEG/PNG/WebP → WebP, max 1600px)
8. Upload original to S3
9. Generate thumbnail (320px cover crop, WebP)
10. Upload thumbnail to S3
11. Persist metadata to database
12. Return signed download URLs
```

---

## Image Processing

| Operation | Settings |
|-----------|----------|
| Compression | Max 1600×1600, fit inside, WebP quality 82 |
| Thumbnail | 320×320 cover crop, WebP quality 75 |
| Auto-rotate | EXIF orientation applied |
| Fallback | Original bytes if Sharp fails |

---

## Validation Rules

| Check | Behavior |
|-------|----------|
| MIME sniff | Magic bytes override client-declared type |
| Allowlist | Separate lists for image, document, video |
| Max size | 5 MB images, 10 MB documents, 80 MB video (configurable) |
| Dangerous files | Blocks executables, scripts, audio |
| Extension | Blocks `.exe`, `.bat`, `.js`, etc. |
| Storage disabled | Returns `STORAGE_DISABLED` error |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/media/upload` | Multipart upload (field: `file`, body: `context`, `purpose`) |
| `POST` | `/api/media/presign` | Get presigned PUT URL for direct client upload |
| `GET` | `/api/media/mine` | List current user's uploads |
| `GET` | `/api/media/:id` | Get media metadata |
| `GET` | `/api/media/:id/url` | Get signed download URL (`?variant=original\|thumbnail\|compressed`) |
| `DELETE` | `/api/media/:id` | Soft-delete metadata and remove S3 objects |

---

## Signed URLs

- Default expiry: 300 seconds (configurable via `S3_SIGNED_URL_EXPIRY_SECONDS`)
- Variants: `original`, `thumbnail`, `compressed`
- Bucket remains private; clients never receive permanent public URLs
- Presigned PUT for direct-to-S3 uploads (reduces API memory load)

---

## Database Model

```prisma
model Media {
  id            String      @id @default(cuid())
  fileId        String      @unique
  context       String
  objectKey     String      @unique
  bucket        String
  thumbnailKey  String?
  compressedKey String?
  metadata      Json
  uploadedBy    String?
  tenantId      String?
  status        MediaStatus @default(ACTIVE)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  deletedAt     DateTime?

  @@map("media")
}
```

Repository falls back to in-memory storage when Prisma/media table is unavailable (development without migration).

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `STORAGE_DRIVER` | `s3` | `s3` or `disabled` |
| `S3_ENDPOINT` | — | MinIO endpoint (e.g. `http://127.0.0.1:9000`) |
| `S3_REGION` | `us-east-1` | Region (arbitrary for MinIO) |
| `S3_BUCKET` | `pranidoctor-dev` | Target bucket |
| `S3_ACCESS_KEY_ID` | — | Access key |
| `S3_SECRET_ACCESS_KEY` | — | Secret key |
| `S3_FORCE_PATH_STYLE` | `true` | Required for MinIO |
| `S3_SIGNED_URL_EXPIRY_SECONDS` | `300` | Signed URL TTL |
| `UPLOAD_MAX_IMAGE_MB` | `5` | Max image size |
| `UPLOAD_MAX_DOCUMENT_MB` | `10` | Max document size |
| `UPLOAD_MAX_VIDEO_MB` | `80` | Max video size |
| `UPLOAD_ALLOWED_IMAGE_TYPES` | jpeg,png,webp | MIME allowlist |
| `UPLOAD_ALLOWED_DOCUMENT_TYPES` | pdf,jpeg,png,webp | MIME allowlist |
| `UPLOAD_ALLOWED_VIDEO_TYPES` | mp4,webm | MIME allowlist |

---

## Docker (MinIO)

`docker-compose.yml` includes:

- **minio** — API `:9000`, Console `:9001`
- **minio-init** — Creates bucket on startup

```bash
docker compose up -d postgres redis minio
```

Default credentials: `minioadmin` / `minioadmin`

---

## Dependencies Added

| Package | Purpose |
|---------|---------|
| `@aws-sdk/client-s3` | S3/MinIO client |
| `@aws-sdk/s3-request-presigner` | Signed URL generation |
| `sharp` | Image compression and thumbnails |
| `multer` | Multipart upload parsing |

---

## Domain Events

| Event | Payload |
|-------|---------|
| `media.uploaded` | mediaId, fileId, context, mimeType, size |
| `media.deleted` | mediaId, fileId |

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `STORAGE_DISABLED` | 400 | Uploads disabled |
| `STORAGE_NOT_CONFIGURED` | 400 | Missing S3 credentials |
| `UPLOAD_NO_FILE` | 400 | No file in request |
| `UPLOAD_FILE_TOO_LARGE` | 400 | Exceeds size limit |
| `UPLOAD_INVALID_TYPE` | 400 | MIME not allowed |
| `UPLOAD_DANGEROUS_FILE` | 400 | Blocked file type |
| `MEDIA_NOT_FOUND` | 404 | Unknown media ID |
| `MEDIA_ACCESS_DENIED` | 403 | Not owner |

---

## File Structure

```
src/infra/storage/
├── storage.types.ts
├── s3-storage.provider.ts
├── storage.factory.ts
├── mime-sniff.ts
└── index.ts

src/modules/media/
├── media.types.ts
├── media.folder.ts
├── media.validation.ts
├── media.image.processor.ts
├── media.upload.middleware.ts
├── media.dto.ts
├── media.validator.ts
├── media.repository.ts
├── media.repository.types.ts
├── media.service.ts
├── media.controller.ts
├── media.routes.ts
├── media.events.ts
├── media.module.ts
└── index.ts
```

---

## Usage Example

```bash
# Upload a profile photo
curl -X POST http://localhost:3000/api/media/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@photo.jpg" \
  -F "context=farmer" \
  -F "purpose=profile_photo"

# Get signed download URL
curl "http://localhost:3000/api/media/{id}/url?variant=thumbnail"

# Presign direct upload
curl -X POST http://localhost:3000/api/media/presign \
  -H "Content-Type: application/json" \
  -d '{"context":"farmer","purpose":"gallery","mimeType":"image/jpeg","originalName":"photo.jpg"}'
```

---

## Phase 1.5 Completion Checklist

- [x] Storage abstraction (S3/MinIO compatible)
- [x] Upload with multipart handling
- [x] Image compression (WebP)
- [x] Thumbnail generation
- [x] Media metadata persistence
- [x] Signed URL (GET and PUT)
- [x] Folder strategy (`uploads/{context}/{yyyy}/{mm}/...`)
- [x] File validation (MIME sniff, size, allowlist)
- [x] Media module (full structure)
- [x] MinIO in docker-compose
- [x] Configuration and env example
- [x] Domain events
- [x] Rate limiting on uploads
- [x] Media report documentation
