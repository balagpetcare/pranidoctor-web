# AI Technician form — stepper & upload plan

This note tracks how the AI Technician onboarding stepper should attach **documents** and **photos**.

## Status

- **Upload architecture (universal S3 / MinIO + DB metadata)** — **implemented.**  
  - API: `POST /api/mobile/uploads` (`multipart/form-data`: `file`, `purpose`).  
  - Documents: `POST /api/mobile/ai-technician/documents` accepts **`uploadedFileId`** (+ `documentType`, `title`) with legacy **`fileUrl` / `storageKey`** still supported.  
  - Setup: see **`docs/UPLOAD_STORAGE_SETUP.md`**.
- **Admin document verification (AI Technician application review)** — **completed (COMMAND 06).**  
  - Admin detail API includes **safe** per-document `uploadedFile` metadata (name, MIME, size, timestamps — no bucket/storage secrets).  
  - Files open via **`GET /api/admin/uploads/[id]`** (session-gated admin actor → short-lived signed redirect). Owners use **`GET /api/mobile/uploads/[id]`**; private object URLs are not embedded in JSON.  
  - UI: `ApplicationReviewPanel` — profile summary, service areas with location IDs, document cards, validation checklist, image modal preview, PDF open via protected route, confirmation modals for sensitive transitions, Bengali copy.

## Purpose values (MVP)

Aligned with `MobileUploadPurpose` in Prisma: `AI_TECHNICIAN_NID_FRONT`, `AI_TECHNICIAN_NID_BACK`, `AI_TECHNICIAN_PROFILE_PHOTO`, `AI_TECHNICIAN_TRAINING_CERTIFICATE`, `AI_TECHNICIAN_AI_CERTIFICATE`, `AI_TECHNICIAN_OTHER`.

## Mobile flow (recommended)

1. `POST /api/mobile/uploads` with the correct `purpose` for the step.  
2. Use returned `fileId` / `downloadUrl` as needed in UI.  
3. `POST /api/mobile/ai-technician/documents` with `uploadedFileId` matching the document type.

---

## COMMAND 07 — Final QA (completed)

**Mobile (`pranidoctor_mobile`):** Six-step wizard verified in code paths: intro (step 1) lists all steps; personal (2), professional (3), address + division service areas (4), documents (5), review (6). Draft `apply` keeps server state; in-memory controllers preserve data between steps. Location pickers cascade on IDs; uploads show progress (`onSendProgress` → linear indicator), Bengali errors for type/size/API failures, client pre-check **~5 MB** / **~10 MB** aligned with `storage-env.ts` defaults. Bottom navigation adds **`MediaQuery.viewInsets.bottom`** so primary actions stay above the keyboard. `InputDecorationTheme` uses **`FloatingLabelBehavior.auto`** and slightly taller field padding to reduce label overlap.

**Backend:** Location read APIs under `/api/mobile/locations/*`; reference geography seeded idempotently via **`seedBdReferenceLocations`** in `prisma db seed` (`prisma/seed-data/bd-locations.ts`). Uploads require **`requireMobileAiTechnicianModuleUser`**; MIME sniff + allowlists; size caps; raster images optionally resized to WebP via **sharp** in `upload-service.ts`. Private objects: **`docker-compose.yml`** MinIO init creates the bucket only (no anonymous public read).

**Admin:** Application list/detail + `ApplicationReviewPanel` transitions and protected file routes unchanged from COMMAND 06.

**Further QA:** Use **`docs/AI_TECHNICIAN_QA_CHECKLIST.md`** (section I) for manual regression.
