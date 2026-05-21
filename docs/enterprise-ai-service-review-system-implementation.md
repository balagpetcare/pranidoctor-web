# Enterprise AI Service Review — Implementation Summary

**Repos:** `pranidoctor-web`, `pranidoctor_mobile`  
**Date:** 2026-05-12  

This document describes what was implemented for the **enterprise service instance** workflow (semen main template → worker submission → admin review → publish → `AiTechnicianService`), aligned with `docs/enterprise-ai-service-review-system-plan.md`.

---

## 1. Database (Prisma)

- **Enums:** `ServiceInstanceStatus`, `ServiceInstanceMediaKind`, `ServiceInstanceMediaModerationStatus`, `ServiceInstanceReviewDecision`, `ServiceInstanceReviewVisibility`, `ServiceInstancePublishAction`, `ServiceInstanceAuditAction`.
- **Models:** `ServiceInstance`, `ServiceInstanceMedia`, `ServiceInstanceStatusLog`, `ServiceInstanceReview`, `ServiceInstancePublishLog`, `ServiceInstanceAuditEvent`.
- **`MobileUploadPurpose`:** `AI_SERVICE_INSTANCE_COVER`, `GALLERY`, `VIDEO`, `DOCUMENT`.
- **Migration:** `prisma/migrations/20260512150000_enterprise_service_instances/migration.sql`
- **Branch isolation:** `ServiceInstance.deploymentBranch` (default `"main"`). List/detail/admin mutations filter by `deploymentBranch` query param (UI default `main`).

---

## 2. Backend modules (`src/lib/service-instances/`)

| File | Role |
|------|------|
| `request-meta.ts` | `getClientRequestMeta` — IP / user-agent from request headers |
| `fingerprint.ts` | Stable SHA-256 fingerprint for duplicate detection |
| `semen-instance-schema.ts` | **Dynamic** `PraniSchemaDocument` built from template shape (no hand-built per-field admin forms) |
| `payload-validation.ts` | Decimal / offer-vs-discount rules |
| `media-validation.ts` | MIME allowlist per `ServiceInstanceMediaKind` |
| `workflow-engine.ts` | Allowed status transitions (worker vs admin) |
| `audit-service.ts` | `appendServiceInstanceAudit` |
| `mobile-service-instance-service.ts` | Worker CRUD, submit, media replace, signed previews |
| `admin-service-instance-service.ts` | Admin list (search, cursor, `statuses=`), detail, status patch, review patch, publish/rollback/unpublish |

---

## 3. RBAC (`src/lib/admin-auth/permissions.ts`)

- `serviceInstance.view` — `ADMIN`, `SUPER_ADMIN`, `SUPPORT`
- `serviceInstance.review` — `ADMIN`, `SUPER_ADMIN`
- `serviceInstance.publish` — **`SUPER_ADMIN` only** (publish API also checks `actor.role`)

`AdminPanelActor` now includes **`role`** (`panel-classify.ts`, `panel-access.ts`). `/api/admin/auth/me` returns `user.role`.

---

## 4. HTTP APIs

### Admin (`requireAdminApiActor`)

- `GET /api/admin/service-instances` — query: `status`, `statuses` (comma-separated), `q`, `deploymentBranch`, `tenantId`, `cursor`, `limit`
- `GET /api/admin/service-instances/[id]` — `deploymentBranch`
- `PATCH /api/admin/service-instances/[id]/status` — body `{ toStatus, reason? }`
- `PATCH /api/admin/service-instances/[id]/review` — body `{ decision, body, visibility? }`
- `PATCH /api/admin/service-instances/[id]/publish` — body `{ action: "PUBLISH" | "UNPUBLISH" | "ROLLBACK" }`

### Mobile AI technician (`requireMobileAiTechnicianActor`)

- `GET/POST /api/mobile/ai-technician/service-instances`
- `GET/PUT /api/mobile/ai-technician/service-instances/[id]`
- `POST /api/mobile/ai-technician/service-instances/[id]/submit`

### Uploads

- `src/lib/storage/upload-service.ts` extended for new `MobileUploadPurpose` values (size + MIME).

---

## 5. Admin UI — Enterprise shell

- **Layout:** `src/app/enterprise/(dashboard)/layout.tsx` — reuses `ensureAdminDashboardAccess` + `AdminLayoutShell`.
- **Routes:** `/enterprise/services/review` (+ `pending`, `needs-correction`, `approved`, `published`, `archived`) → `ServiceInstancesReviewConsole` with optional `initialTab`.
- **Nav:** `admin-nav.tsx` — link **এন্টারপ্রাইজ সেবা পর্যালোচনা** → `/enterprise/services/review`; `getSectionTitleFromPath` handles `/enterprise/*`.
- **Components:** `src/components/enterprise/ServiceInstancesReviewConsole.tsx`, `src/components/schema-form/PraniSchemaRenderer.tsx`, `src/components/schema-form/JsonDiffViewer.tsx`.

**Crop / background upload / optimization:** Reuses existing **Sharp** pipeline in `ingestMobileUpload` for images; client-side **crop** is not duplicated here — mobile app should keep using existing crop flows before upload, or extend later.

---

## 6. Mobile (Flutter) — worker panel (MVP)

- **`ApiClient.put`** added for `PUT` service instance updates.
- **`ServiceInstanceRepository`** + `serviceInstanceRepositoryProvider`.
- **Screens:** `AiServiceInstancesListScreen`, `AiServiceInstanceDetailScreen` (JSON payload edit + save + submit when `DRAFT` / `NEEDS_CORRECTION`).
- **Router:** `/profile/ai-technician/service-instances` and `.../:instanceId`.
- **Dashboard entry:** `EnterpriseTechnicianDashboardContent` — secondary button **এন্টারপ্রাইজ সেবা জমা (পর্যালোচনা)** (approved/published technicians).

**Create-from-template:** FAB opens existing **semen template catalog**; creating an enterprise instance from a template in-app can call `ServiceInstanceRepository.create(templateId: ...)` (e.g. extend template confirm flow later).

---

## 7. Publish behaviour (non-breaking)

- On **PUBLISH**, upserts **`AiTechnicianService`** for `(aiTechnicianId, semenServiceTemplateId)`, sets **`ACTIVE`**, optional **`TechnicianSemenInventory`** from `payloadJson.initialInventoryLot` when empty.
- **ROLLBACK** sets linked service **`INACTIVE`** + `isAvailable: false`, instance → **`APPROVED`**, clears `publishedAiTechnicianServiceId` / `publishedAt`.
- **UNPUBLISH** action sets listing inactive and instance **`ARCHIVED`**.

Existing **`POST …/services/from-template`** flow is **unchanged**.

---

## 8. Verification checklist

1. Run migration: `npm run db:deploy:safe` (or `prisma migrate dev` on disposable DB).
2. `npm run typecheck` — passes.
3. **Admin:** sign in → **এন্টারপ্রাইজ সেবা পর্যালোচনা** → list, drawer, actions (super admin for publish).
4. **Mobile:** approved technician → dashboard button → list → detail → edit JSON payload → submit.
5. **Branch:** change branch filter in enterprise UI and confirm empty/other branch lists.
6. **Upload:** multipart with new `MobileUploadPurpose` values for instance media.

---

## 9. Known gaps / follow-ups

- Vitest / API e2e tests not added in this pass.
- Flutter UI does not yet embed the **schema-driven form** from `schema` (server returns it on `GET` detail); technician can edit raw `payloadJson` as MVP.
- **Web worker panel** at `/enterprise/worker/*` was not added (technicians use **mobile JWT**, not admin cookies).
- **Optimistic locking:** `expectedVersion` supported on mobile `PUT`; enterprise UI does not send it yet.

---

*End of implementation summary.*
