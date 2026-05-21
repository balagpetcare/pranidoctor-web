# Enterprise AI Worker Service Submission — Admin Review — Publish Workflow

**Project:** Prani Doctor (`pranidoctor-web`, `pranidoctor_mobile`)  
**Document type:** Architecture analysis + implementation plan only (no code changes in this deliverable).  
**Last updated:** 2026-05-12  

---

## Executive summary

The codebase already ships a **semen-centric “main template” system** (`SemenServiceTemplate` + `SemenServiceTemplateMedia` + breed mix), **AI technician identity onboarding** with a rich status machine (`AiTechnicianStatus`), and **technician service listings** (`AiTechnicianService` + optional `semenServiceTemplateId` + `TechnicianSemenInventory`). Validation is **Zod + Prisma**, uploads are **`UploadedFile` + `MobileUploadPurpose`**, and admin APIs use **`requireAdminPanelApiAccess` / `requireAdminApiActor`**.

There is **no** global multi-tenant model, **no** git-style branch dimension in the database, **no** centralized `AuditLog` table, and **no** JSON `schema_json`–driven form renderer for services—templates today are **relational columns**, not a generic field registry.

This plan defines an **additive** enterprise layer—**`ServiceInstance*` tables and APIs**—that **wraps** the existing template + technician service story so **production booking (`AiServiceRequest.serviceId`) and farmer discovery** keep working. The `/enterprise/services/review` UI is a **new route group** (or alias) that reuses **`AdminLayoutShell`**, list/detail patterns from **`/admin/ai-technicians/applications`**, and the same auth stack until granular RBAC exists.

---

## Phase 1 — Architecture analysis (as-is)

### 1.1 Backend — service modules

| Concern | Location / pattern | Notes |
|--------|-------------------|--------|
| Legacy doctor/customer requests | `ServiceRequest`, `TreatmentCase` | Distinct from native AI module. |
| Native AI farmer bookings | `AiServiceRequest`, `AiServiceRecord` | Optional `serviceId` → `AiTechnicianService`. |
| Technician gigs | `src/lib/mobile-ai-technician/technician-services-service.ts` | CRUD + serialization; merges locked semen template payload when `semenServiceTemplateId` set. |
| Semen template admin CRUD | `src/lib/admin-semen/templates-service.ts`, `src/app/api/admin/semen-service-templates/*` | Zod in `src/lib/admin-semen/schemas.ts`. |
| Farmer-facing AI discovery | `src/lib/mobile-ai-services/ai-services-service.ts` | Requires published technician + **ACTIVE** `AiTechnicianService`. |

### 1.2 Backend — template modules

| Model | Role |
|-------|------|
| **`SemenServiceTemplate`** | Admin “main template” for semen listings: copy, pricing defaults, `approvalStatus` (`SemenTemplateApprovalStatus`: DRAFT, PENDING_REVIEW, APPROVED, REJECTED), `approvedById` / `approvedAt`. |
| **`SemenServiceTemplateBreedMix`**, **`SemenServiceTemplateMedia`** | Structured children; media links `UploadedFile` or `externalUrl`. |
| **`SemenProvider`**, **`LivestockBreed`** | Masters. |

**Gap vs requested “schema_json renderer”:** Template fields are **fixed Prisma columns**, not a document of field descriptors. Any dynamic renderer must either (1) **emit** a `schema_json` view model from this relational shape for v1 semen, or (2) introduce a **`ServiceTemplateDefinition`** table with `schemaJson` for **future** non-semen verticals—without duplicating semen’s validated columns until migration is justified.

### 1.3 Backend — AI worker modules

| Model / flow | Role |
|--------------|------|
| **`AiTechnicianProfile`** | Worker identity; `AiTechnicianStatus` (DRAFT → SUBMITTED → UNDER_REVIEW → NEEDS_CORRECTION → APPROVED → PUBLISHED / REJECTED / SUSPENDED); `reviewedById`, `reviewedAt`, `correctionNote`, `adminNote`, `publishedAt`. |
| **`AiTechnicianDocument`** | NID etc.; `uploadedFileId`, `reviewStatus`. |
| **Application review** | `src/lib/admin-ai-technician-applications/application-review-service.ts`, `POST /api/admin/ai-technician-applications/[id]/transition` | State machine + serialization; good **reference implementation** for enterprise service review. |
| **`AiTechnicianService`** | Worker service row; `AiTechnicianServiceStatus` (DRAFT, PENDING_REVIEW, ACTIVE, INACTIVE, REJECTED); optional **`semenServiceTemplateId`**; unique `(aiTechnicianId, semenServiceTemplateId)` when template-bound. |

### 1.4 Backend — admin modules

| Area | Pattern |
|------|---------|
| Dashboard layout | `src/app/admin/(dashboard)/layout.tsx` → `ensureAdminDashboardAccess` + `AdminLayoutShell` (`src/components/admin-ui/*`). |
| Navigation | `ADMIN_NAV_GROUPS` in `admin-nav` (sidebar). |
| API auth | `src/lib/admin-auth/api-guard.ts` — session + actor; coarse **admin panel** gate, not per-resource RBAC flags. |
| List + detail + transition | e.g. `src/app/admin/(dashboard)/ai-technicians/applications/*`, semen template pages under `semen-service-templates/*`. |

**Gap:** No **`/enterprise/*`** app routes today; enterprise naming is a **product/routing** addition.

### 1.5 Prisma schema — highlights

- **Enums** already mirror parts of the desired workflow: `AiTechnicianStatus`, `SemenTemplateApprovalStatus`, `AiTechnicianServiceStatus`, `ContentApprovalStatus` (Knowledge Hub).  
- **`UploadedFile`**: `ownerUserId`, `bucket`, `storageKey`, `mimeType`, `sizeBytes`, `fileCategory` (`MobileUploadPurpose`), optional dimensions, `checksum`, `status` (ACTIVE/DELETED). Relations: technician docs, semen provider logo, semen template media.  
- **No** `Tenant`, **no** `Branch`, **no** `AuditEvent` table—audit is **column-level** (who approved, when) or implied by status changes without append-only history.

### 1.6 Validation system

- **Zod** schemas colocated with domains (`*-schemas.ts`, route-level `safeParse`).  
- **Prisma** constraints (uniques, FKs).  
- **Business rules** in services (e.g. template-backed PATCH paths, stock aggregation in `semen-inventory-service.ts`).

### 1.7 Media upload system

| Path | Role |
|------|------|
| Mobile | `src/app/api/mobile/uploads/route.ts`, `[id]/route.ts`, purpose-specific routes (`profile-image`, `cover-image`). |
| Ingest | `src/lib/storage/upload-service.ts` (`ingestMobileUpload` per docs). |
| Admin | `src/app/api/admin/uploads/route.ts` — actor-bound uploads for admin-owned assets. |
| Purposes | `MobileUploadPurpose` enum — extend for **worker service instance** media with new enum values (additive). |

### 1.8 Auth / permission system

- **Mobile AI technician:** `requireMobileAiTechnicianModuleUser` / `requireMobileAiTechnicianActor` (`src/lib/mobile-ai-technician/mobile-module-guard.ts`).  
- **Admin:** `requireAdminPanelApiAccess`, `requireAdminApiActor`; roles include `ADMIN`, `SUPER_ADMIN`, `SUPPORT` on `User` — **fine-grained permissions** for “review only” vs “publish” are **not** modeled in DB today.

### 1.9 Audit system

- **Implicit:** `reviewedById`, `approvedById`, timestamps on domain rows.  
- **No** unified append-only audit stream; **no** IP capture on transitions at the application layer (would need middleware + new table).

### 1.10 Frontend — admin panel

- **Shell:** Larkon-themed admin UI (`AdminLayoutShell`, `AdminSidebar`, design rules in `docs/ADMIN_UI_DESIGN_RULES.md`).  
- **Heavy forms:** `SemenServiceTemplateForm.tsx` (large single form; audit meta display for template saves).  
- **Tables / lists:** standard admin pages with server components + client fetch where used; applications list pattern under `ai-technicians/applications`.

### 1.11 Frontend — dynamic form / schema renderer

- **Does not exist** as a generic JSON-schema form engine for services.  
- **Closest patterns:** Zod-driven forms, hand-built semen template form, Knowledge Hub editorial forms.  
- **Implication:** Phase 6 requires a **new shared component package** (e.g. `src/components/schema-form/`) with a **typed contract** for `schema_json` blocks; initial vertical can **generate** schema from `SemenServiceTemplate` for read-only admin review, then evolve to full edit.

### 1.12 Frontend — drawers / modals / badges

- Use existing design system primitives under `src/components/admin-ui` and shared UI (`cn`, etc.); no single global “drawer registry”—compose per feature like applications detail.

### 1.13 Mobile — current service flow

| Topic | Location / behavior |
|-------|---------------------|
| Technician application | `lib/src/features/ai_technician_application/*` — multi-step, uploads via `UploadRepository` / `upload_providers.dart`. |
| Semen from template | `ai_semen_template_catalog_screen.dart`, `ai_semen_from_template_confirm_screen.dart`, inventory screens — calls mobile APIs documented in `docs/AI_TECHNICIAN_API.md`. |
| Services list | Repository + `/profile/ai-technician/services` route — uses `/api/mobile/ai-technician/services`. |

**Upload flow:** `UploadRepository` + API client; purposes must align with server `MobileUploadPurpose` when adding instance media.

---

## Phase 2 — Target enterprise flow (to-be)

```text
MAIN TEMPLATE (SemenServiceTemplate today; generalized later)
        ↓
SERVICE INSTANCE (draft payload + media + validation snapshot)
        ↓  submit
UNDER_REVIEW (admin queue)
        ↓
NEEDS_CORRECTION ↔ worker resubmit
        ↓
APPROVED
        ↓  publish action
PUBLISHED  ←→  optional link/sync to AiTechnicianService (ACTIVE) for marketplace
        ↓
ARCHIVED (soft-delete / end-of-life)
```

**Non-breaking rule:** Farmer discovery and `AiServiceRequest` continue to reference **`AiTechnicianService`** where applicable. The **enterprise instance** either:

1. **Owns** the lifecycle until publish, then **creates or updates** one `AiTechnicianService` row in a transaction; or  
2. **References** an existing `AiTechnicianService` as `publishedListingId` after first publish.

**Recommendation:** For template-backed semen listings, keep **`AiTechnicianService` as the public listing row** (already integrated) and use **`ServiceInstance` as the moderation + history envelope** with `publishedAiTechnicianServiceId` set on publish—avoids duplicating pricing/stock tables.

---

## Phase 3 — Database design

### 3.1 Naming and scope

Use **PascalCase** models consistent with Prisma. Table names below match user request; prefix with product namespace if collision is a concern (e.g. `AiServiceInstance`).

### 3.2 Enum: `ServiceInstanceStatus`

Align with the requested lifecycle (map legacy enums at API boundary only):

| Value | Meaning |
|-------|---------|
| `DRAFT` | Worker editing; not in admin queue. |
| `SUBMITTED` | Submitted; awaiting triage. |
| `UNDER_REVIEW` | Actively reviewed by admin. |
| `NEEDS_CORRECTION` | Admin sent back with notes. |
| `APPROVED` | Content approved; not yet visible as published listing. |
| `REJECTED` | Terminal negative. |
| `PUBLISHED` | Linked live listing / public visibility per product rules. |
| `ARCHIVED` | Soft-retired. |

**Note:** `AiTechnicianServiceStatus` and `SemenTemplateApprovalStatus` remain on their tables; **sync policy** must be documented (e.g. instance PUBLISHED ⇒ technician service ACTIVE + `isAvailable` true).

### 3.3 Model: `ServiceInstance` (core)

| Field | Type | Purpose |
|-------|------|---------|
| `id` | cuid | PK |
| `templateId` | String FK → `SemenServiceTemplate` (v1) | **Main template** reference; later polymorphic `templateType` + `templateId` if multiple template families. |
| `aiTechnicianProfileId` | String FK | Worker |
| `status` | `ServiceInstanceStatus` | Current state |
| `schemaVersion` | Int | Template or renderer contract version |
| `payloadJson` | Json | **Worker-editable** answers / overrides allowed by template policy (source for dynamic renderer). |
| `lockedSnapshotJson` | Json? | Optional immutable snapshot at submit/review boundary for diff |
| `validationResultJson` | Json? | Last server validation / rule engine output |
| `duplicateOfId` | String? self-FK | Duplicate detection |
| `correctionNote` / `adminInternalNote` | Text? | Moderation |
| `submittedAt`, `publishedAt`, `archivedAt` | DateTime? | Milestones |
| `lastReviewedById` | String? → User | Denormalized quick pointer |
| `publishedAiTechnicianServiceId` | String? unique → `AiTechnicianService` | Link to live listing |
| **Branch / environment** | `deploymentBranch` String? | e.g. `main`, `preview/pr-123` — **no** existing column pattern; use nullable + index |
| **Tenant** | `tenantId` String? | Nullable = default single-tenant; FK to future `Tenant` |
| **Soft delete** | `deletedAt` DateTime? | Standard `@index([deletedAt])` |
| `createdAt`, `updatedAt` | DateTime | |

**Indexes:** `(status, submittedAt)`, `(aiTechnicianProfileId, templateId)`, `(tenantId, deploymentBranch)`, full-text later if needed.

### 3.4 Model: `ServiceInstanceMedia`

| Field | Purpose |
|-------|---------|
| `id`, `serviceInstanceId` | FK cascade |
| `kind` | Enum: COVER, GALLERY, VIDEO_UPLOAD, VIDEO_URL, DOCUMENT, … |
| `uploadedFileId` | Optional → `UploadedFile` |
| `externalUrl` | Optional |
| `sortOrder`, `moderationStatus`, `moderationNote` | |
| `deletedAt` | Soft delete row |

### 3.5 Model: `ServiceInstanceStatusLog`

Append-only status transitions:

| Field | Purpose |
|-------|---------|
| `id`, `serviceInstanceId`, `fromStatus`, `toStatus` | |
| `actorUserId` | Admin or worker |
| `actorRole` | Denormalized string or enum for reporting |
| `reason` | Text |
| `ipAddress` | String? (from `x-forwarded-for` / `request.ip`) |
| `userAgent` | String? |
| `metadataJson` | Extra (e.g. client build) |
| `createdAt` | |

Supports **status history** and **audit** for transitions.

### 3.6 Model: `ServiceInstanceReview`

Admin review rounds (distinct from status log if multiple notes per state):

| Field | Purpose |
|-------|---------|
| `id`, `serviceInstanceId` | |
| `reviewerUserId` | |
| `decision` | Enum: APPROVE, REJECT, REQUEST_CORRECTION, COMMENT |
| `body` | Text |
| `visibility` | INTERNAL / WORKER_VISIBLE |
| `createdAt` | |

### 3.7 Model: `ServiceInstancePublishLog`

| Field | Purpose |
|-------|---------|
| `id`, `serviceInstanceId` | |
| `action` | PUBLISH, UNPUBLISH, ROLLBACK |
| `actorUserId` | |
| `previousPublishedServiceId`, `newPublishedServiceId` | Nullable FKs to `AiTechnicianService` |
| `payloadSnapshotJson` | Optional |
| `createdAt` | |

**Rollback:** New publish log row + status revert + optional `AiTechnicianService.status` / `isAvailable` rollback in one transaction; never delete prior logs.

### 3.8 Optional: `ServiceInstanceAuditEvent` (if beyond status/review)

If product demands read-model for **all** field edits, add generic audit with `path`, `oldValue`, `newValue` JSON—else Phase 3.5–3.6 may suffice for MVP.

### 3.9 Prisma / migration principles

Follow `docs/PRISMA_MIGRATION_RULES.md`: forward-only, additive migrations, backfill scripts separate from deploy when needed.

---

## Phase 4 — Backend API design

### 4.1 AI worker (mobile) — proposed routes

Base: `/api/mobile/…` with existing JWT + `requireMobileAiTechnicianActor`.

| Method | Path | Behavior |
|--------|------|----------|
| `POST` | `/service-instances` | Create DRAFT from `templateId`; validate template APPROVED + worker canManageServices |
| `PUT` | `/service-instances/:id` | Patch `payloadJson` / media order when status ∈ {DRAFT, NEEDS_CORRECTION} |
| `GET` | `/my/service-instances` | Paginated list; filter by status |
| `GET` | `/my/service-instances/:id` | Detail + timelines (status logs, reviews worker-visible) |
| `POST` | `/service-instances/:id/submit` | DRAFT/NEEDS_CORRECTION → SUBMITTED/UNDER_REVIEW; write `ServiceInstanceStatusLog`; optional duplicate check |

**Compatibility:** Optionally keep current `/api/mobile/ai-technician/services/from-template` as **facade** that creates both `AiTechnicianService` (DRAFT) and `ServiceInstance`—reduces mobile churn; document deprecation path.

### 4.2 Admin — proposed routes

Under `/api/admin/…` with `requireAdminApiActor`.

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/admin/service-instances` | Pagination (`cursor`/`page`), filters (status, template, worker, date range, branch, tenant), search `q` on worker name / id |
| `GET` | `/admin/service-instances/:id` | Full detail: payload, media signed URLs, logs, reviews, validation |
| `PATCH` | `/admin/service-instances/:id/status` | Controlled transitions + `ServiceInstanceStatusLog`; validate FSM |
| `PATCH` | `/admin/service-instances/:id/publish` | APPROVED → PUBLISHED + sync `AiTechnicianService`; `ServiceInstancePublishLog` |
| `PATCH` | `/admin/service-instances/:id/review` | Append `ServiceInstanceReview` + optional auto status |

**RBAC:** Until DB-backed permissions exist, enforce in code: e.g. only `SUPER_ADMIN` for `publish`/`rollback`, `ADMIN` for review—config-driven constants in `src/lib/admin-auth/permissions.ts` (new file).

### 4.3 Cross-cutting API requirements

| Requirement | Approach |
|-------------|----------|
| Validation | Zod per route + domain validators (reuse decimal/tag patterns from `admin-semen/schemas.ts`). |
| RBAC | Role checks + future `AdminPermission` table. |
| Branch filtering | Require `deploymentBranch` query header or param; default `main` or null. |
| Audit | Status log + publish log + review rows; optional IP in log. |
| Pagination | Cursor on `(updatedAt, id)` for large queues. |
| Duplicate detection | Hash canonical `templateId` + normalized payload subset + `aiTechnicianProfileId`; store `duplicateOfId`. |
| Media validation | MIME allowlist per `kind`; max size; virus scan hook placeholder; `UploadedFile.checksum` dedupe. |

---

## Phase 5 — Admin panel UI architecture (`/enterprise/services/review`)

### 5.1 Routing plan

| Route | Purpose |
|-------|---------|
| `/enterprise/services/review` | Dashboard KPIs + tabs linking to lists |
| `/enterprise/services/review/pending` | `UNDER_REVIEW` + `SUBMITTED` triage |
| `/enterprise/services/review/needs-correction` | Filtered list |
| `/enterprise/services/review/approved` | Pre-publish |
| `/enterprise/services/review/published` | Live |
| `/enterprise/services/review/archived` | Archived / soft-deleted |
| `/enterprise/services/review/[id]` | Detail |

**Implementation choice:**

- **A)** New `src/app/enterprise/(dashboard)/…` with **shared** `AdminLayoutShell` and **reuse** `ensureAdminDashboardAccess` (or stricter `ensureEnterpriseReviewerAccess`).  
- **B)** Implement under `src/app/admin/(dashboard)/enterprise/services/review` and **redirect** `/enterprise/...` via `next.config` rewrites for URL branding.

Either way, **do not fork** the design system—import the same shell/components.

### 5.2 Screen composition

| # | Screen / panel | Building blocks |
|---|----------------|------------------|
| 1 | Review dashboard | KPI cards, charts optional later |
| 2–6 | Queues | Reuse applications table pattern; server-driven filters in querystring |
| 7 | Service detail | Split layout: summary header + tabs |
| 8 | Media preview | Reuse signed URL pattern from technician documents / semen media |
| 9 | Diff viewer | Compare `lockedSnapshotJson` vs current `payloadJson` (JSON diff lib) |
| 10 | Review timeline | `ServiceInstanceReview` list |
| 11 | Audit timeline | Union of status logs + publish logs + optional audit events |
| 12 | Status history | `ServiceInstanceStatusLog` |
| 13 | Validation panel | `validationResultJson` pretty-print + links to fields |

### 5.3 Actions UI

Primary buttons on detail: **Approve**, **Reject**, **Request correction**, **Publish**, **Archive**, **Rollback** (with confirm modals and reason fields).

---

## Phase 6 — Dynamic renderer (schema-driven)

### 6.1 Contract

Define a **versioned** `schema_json` format (e.g. `PraniSchemaV1`) stored on template or derived:

```text
{ "version": 1, "sections": [ { "id", "title", "fields": [ { "key", "type", "label", "validation", "widget" } ] } ] }
```

**Types to support (phased):** `text`, `textarea`, `richText` (store HTML or markdown + sanitize), `tags`, `pricing`, `animalCondition`, `dosage`, `media`, `table`, `section`, `accordion`, `warning`, `note`.

### 6.2 Implementation strategy

1. **Phase 6a — Read-only:** Server builds `schema_json` + `payloadJson` for semen template-backed instances; admin UI uses renderer in review mode only.  
2. **Phase 6b — Worker edit:** Mobile/web worker forms consume same schema for **non-hardcoded** fields; locked fields still sourced from `SemenServiceTemplate` via policy flags in schema (`readOnly: true`, `source: "template"`).  
3. **Phase 6c — Generic templates:** New `ServiceTemplate` table with `schemaJson` for non-semen products; `ServiceInstance.templateFamily` discriminator.

### 6.3 Safety

- Sanitize rich text; CSP for admin.  
- **No `eval`** on schema; use allowlisted `type` → component map.

---

## Phase 7 — Media system (enterprise)

**Reuse:** `UploadedFile`, multipart mobile upload, admin upload route, S3/MinIO per `docs/UPLOAD_STORAGE_SETUP.md`.

**Add:**

- New `MobileUploadPurpose` values: e.g. `AI_SERVICE_INSTANCE_COVER`, `…_GALLERY`, `…_VIDEO`, `…_DOC`.  
- Client: extend Flutter `UploadRepository` with background upload / retry / progress (partially exists—audit `upload_repository.dart` for gaps).  
- **Crop / optimize:** profile crop flow exists on mobile (`profile_photo_crop_flow.dart`) — extract reusable cropper widget for instance images.  
- **Moderation:** `ServiceInstanceMedia.moderationStatus` + admin bulk actions.

---

## Phase 8 — Review workflow (actions matrix)

| Actor | Action | Preconditions | Effects |
|-------|--------|-----------------|---------|
| Worker | Edit draft | `DRAFT` or `NEEDS_CORRECTION` | Update `payloadJson` / media |
| Worker | Submit | Valid payload | → `SUBMITTED` or `UNDER_REVIEW`; log |
| Admin | Request correction | In review | → `NEEDS_CORRECTION`; review row |
| Admin | Reject | In review | → `REJECTED` |
| Admin | Approve | In review | → `APPROVED` |
| Admin | Publish | `APPROVED` | → `PUBLISHED`; create/update `AiTechnicianService`; publish log |
| Admin | Archive | Various | → `ARCHIVED`; optionally `isAvailable` false |
| Admin | Rollback publish | `PUBLISHED` | Revert listing; publish log `ROLLBACK` |

Worker **status tracking:** expose on `GET /my/service-instances` same fields as today’s service list for consistency.

---

## Phase 9 — Security and audit

| Topic | Plan |
|-------|------|
| RBAC | Introduce `assertAdminCan(actor, "serviceInstance.publish")` helper; map roles; future DB permissions. |
| Audit logs | `ServiceInstanceStatusLog`, `ServiceInstancePublishLog`, `ServiceInstanceReview` |
| Moderation logs | Reviews + internal notes; visibility enum |
| IP tracking | Capture on transition handlers from Next.js `headers()` |
| Duplicate protection | Hash + unique partial index where `deletedAt` null |
| Branch isolation | All queries filter `deploymentBranch` |
| Permission guards | Server-only; mirror UI hide for actions |
| Validation guards | Zod + server business rules; block publish if validation fails |

---

## Phase 10 — Deliverables checklist (this document)

1. **Architecture overview** — Phases 1–2.  
2. **Database plan** — Phase 3.  
3. **Prisma changes** — New models/enums + indexes + FKs to existing tables.  
4. **API structure** — Phase 4.  
5. **Frontend architecture** — Phase 5 + 6.  
6. **Routing plan** — §5.1.  
7. **Permission matrix** — Phase 9 + table below.  
8. **UI component plan** — Phase 5–6.  
9. **Migration plan** — §10.1.  
10. **Rollout strategy** — §10.2.  
11. **Risks** — §11.  
12. **Edge cases** — §12.  
13. **Optimization strategy** — §13.

### 10.1 Migration plan (ordered)

1. Add enums + tables with **no** runtime dependency from existing flows.  
2. Deploy migration; no UI switch.  
3. Backfill optional: create `ServiceInstance` rows from existing `PENDING_REVIEW` `AiTechnicianService` if product wants one queue (scripted, idempotent).  
4. Ship admin read-only list/detail reading new tables.  
5. Ship worker APIs behind feature flag.  
6. Wire publish to `AiTechnicianService` ACTIVE path; run integration tests per `docs/AI_TECHNICIAN_SEMEN_SERVICE_TESTING.md`.  
7. Enable `/enterprise/services/review` navigation link for admins.

### 10.2 Rollout strategy

- **Feature flag** (env): `ENTERPRISE_SERVICE_INSTANCE_WORKFLOW`.  
- **Dual-write period:** creating template-backed service from mobile writes **both** legacy `AiTechnicianService` and `ServiceInstance` (optional) until mobile switches to instance-first API.  
- **Monitoring:** metrics on queue depth, time-in-state, publish failures.

### 10.3 Permission matrix (initial)

| Capability | CUSTOMER | AI_TECHNICIAN | ADMIN | SUPER_ADMIN | SUPPORT |
|------------|----------|---------------|-------|-------------|---------|
| CRUD own instance | — | ✓ (own) | — | — | — |
| List all instances | — | — | ✓ | ✓ | view-only? |
| Change status / review | — | — | ✓ | ✓ | policy |
| Publish / rollback | — | — | ✗ | ✓ | ✗ |

(Configurable per org once tenant exists.)

---

## Phase 11 — Risks

| Risk | Mitigation |
|------|------------|
| Duplicating `AiTechnicianService` state vs instance state | Single source of truth for **public listing**; document sync |
| Mobile API churn | Facade routes + feature flags |
| Schema renderer XSS | Sanitize + strict component allowlist |
| No tenant in DB | `tenantId` nullable; enforce non-null in enterprise deploy when ready |
| Performance on large JSON | Pagination of logs; compress old snapshots to cold storage later |

---

## Phase 12 — Edge cases

- Worker deletes account while instance `UNDER_REVIEW` — block or auto-withdraw.  
- Template **deactivated** after instance draft — warn; block submit or allow with snapshot.  
- **Concurrent** admin transitions — optimistic locking (`version` int on `ServiceInstance`) or `SELECT FOR UPDATE`.  
- Publish when **`AiTechnicianService` unique** `(aiTechnicianId, semenServiceTemplateId)` violated — return actionable error.  
- **Partial media upload** failure — transactional create with cleanup job for orphan `UploadedFile`.

---

## Phase 13 — Optimization strategy

- DB: composite indexes for queue queries; partial indexes for `deletedAt IS NULL`.  
- API: include only needed JSON keys in list endpoints; full payload on detail.  
- CDN: public media via signed URLs with short TTL for admin review.  
- Caching: template metadata Redis cache (optional) keyed by `templateId` + `schemaVersion`.

---

## Appendix A — Key file index (for implementers)

| Area | Path |
|------|------|
| Prisma | `prisma/schema.prisma` |
| Admin auth | `src/lib/admin-auth/api-guard.ts` |
| Application review reference | `src/lib/admin-ai-technician-applications/application-review-service.ts` |
| Technician services | `src/lib/mobile-ai-technician/technician-services-service.ts` |
| Semen template plan | `docs/AI_TECHNICIAN_SEMEN_SERVICE_TEMPLATE_PLAN.md` |
| API reference | `docs/AI_TECHNICIAN_API.md` |
| Mobile technician feature | `pranidoctor_mobile/lib/src/features/ai_technician_application/` |

---

## Appendix B — Relationship to requested model name

The user asked for tables named `service_instances`, etc. In Prisma these become **`ServiceInstance`**, **`ServiceInstanceMedia`**, **`ServiceInstanceStatusLog`**, **`ServiceInstanceReview`**, **`ServiceInstancePublishLog`** — consistent with existing `AiTechnicianService` naming.

---

*End of plan document. Implementation should follow this document in phased PRs; do not enable publish path until integration tests with farmer discovery pass.*
