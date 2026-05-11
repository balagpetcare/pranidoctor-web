# AI Technician module — HTTP API reference

**Project:** Prani Doctor / Animal Doctors (`pranidoctor-web`)  
**Base URL (mobile):** `/api/mobile/…` — Bearer JWT (OTP session), JSON `{ ok, data | error }`.  
**Base URL (admin):** `/api/admin/…` — admin session / cookie per `requireAdminPanelApiAccess` / `requireAdminApiActor` where noted.

Canonical narrative and delivery history: [`AI_TECHNICIAN_IMPLEMENTATION_PLAN.md`](./AI_TECHNICIAN_IMPLEMENTATION_PLAN.md). Manual QA: [`AI_TECHNICIAN_QA_CHECKLIST.md`](./AI_TECHNICIAN_QA_CHECKLIST.md). Semen template / inventory QA: [`AI_TECHNICIAN_SEMEN_SERVICE_TESTING.md`](./AI_TECHNICIAN_SEMEN_SERVICE_TESTING.md).

---

## 1. Flow overview (API order of use)

1. **Customer** logs in (same mobile auth as rest of app).  
2. **Become technician:** `POST /api/mobile/ai-technician/apply` → draft profile; `POST …/documents` → NID etc.; `POST …/service-areas` → division coverage; `POST …/services` → gigs; `PATCH …/settings` if needed; `POST …/submit` → admin queue.  
3. **Admin** lists applications → `GET /api/admin/ai-technician-applications` → detail `GET …/[id]` → transitions `POST …/[id]/transition` (actor id stored). Optional legacy admin CRUD under `/api/admin/ai-technicians/*`.  
4. **Published technician:** `GET /api/mobile/ai-technician/dashboard`, services CRUD, optional **semen-from-template** flow (`GET …/semen-templates`, `POST …/services/from-template`, inventory under `…/services/[id]/semen-inventory`), job list `GET …/requests`, lifecycle `POST …/accept|decline|status|complete`.  
5. **Farmer (customer):** `GET /api/mobile/ai-services/technicians` (area) → `GET …/technicians/[id]` → `POST /api/mobile/ai-services/requests` → `GET …/requests/me` & `GET …/requests/[id]` → when **COMPLETED**, `GET …/record`, `POST …/review`, `POST …/complaint`. Technician `serviceListings` entries may include semen stock and locked template metadata (see §2.1).

---

## 2. Mobile — farmer / public AI services (`/api/mobile/ai-services/`)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/mobile/ai-services/technicians` | None | Area + optional filters; only **PUBLISHED** + **ACTIVE** provider + ≥1 **ACTIVE** service with **`isAvailable: true`**. |
| `GET` | `/api/mobile/ai-services/technicians/[id]` | None | Public profile payload; **no** NID/document URLs; services filtered to **ACTIVE** + **`isAvailable: true`**. |
| `POST` | `/api/mobile/ai-services/requests` | Customer | Creates **`AiServiceRequest`**. |
| `GET` | `/api/mobile/ai-services/requests/me` | Customer | Own history (`customerUserId`). |
| `GET` | `/api/mobile/ai-services/requests/[id]` | Customer | Single owned request; includes **`hasAiReview`** when applicable. |
| `GET` | `/api/mobile/ai-services/requests/[id]/record` | Customer **or** technician actor | Digital **`AiServiceRecord`** when request **COMPLETED** and viewer allowed. |
| `POST` | `/api/mobile/ai-services/requests/[id]/review` | Customer | One review per completed native request; see quality schemas. |
| `POST` | `/api/mobile/ai-services/requests/[id]/complaint` | Customer | Complaint tied to own request; technician must be assigned. |

### 2.1 Semen-related fields on each `serviceListings[]` item

Public list/detail serializers attach the following to every active service in `serviceListings` (in addition to legacy fields such as `title`, `basePrice`, `visitFee`, `emergencyFee`, `followUpIncluded`, `isAvailable`):

| Field | Type | Notes |
|--------|------|--------|
| `offerPrice` | `string \| null` | Decimal string when set. |
| `discountPercent` | `string \| null` | Decimal string when set. |
| `stockSummary` | `{ totalAvailable: number; lotsCount: number; lowStock: boolean }` | Aggregated from **active** `TechnicianSemenInventory` rows (`totalAvailable` sums `max(0, currentQuantity - reservedQuantity)` per lot). |
| `semenServiceTemplateId` | `string \| null` | Present when the gig was created from a semen template. |
| `semenTemplateLocked` | `object \| null` | When non-null, snapshot subset of the template for farmers: `templateId`, `internalName`, `semenProductKind`, `shortDescription`, `warningsContraindications`, `provider` (`id`, `slug`, `name`, `nameBn`), `breedMix` (`percentage` string, `nameEn`, `nameBn` per line), `media` (`kind`, `uploadedFileId`, `externalUrl`). |

---

## 3. Mobile — technician module (`/api/mobile/ai-technician/`)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/mobile/ai-technician/me` | Module user | Customer **or** AI technician — own application snapshot. |
| `POST` | `/api/mobile/ai-technician/apply` | Module user | Draft / upsert application path. |
| `POST` | `/api/mobile/ai-technician/documents` | Module user | Upload metadata; storage handled in service. |
| `DELETE` | `/api/mobile/ai-technician/documents/[id]` | Module user | Own document only; editable states enforced in service. |
| `POST` | `/api/mobile/ai-technician/service-areas` | Module user | Division coverage rows. |
| `DELETE` | `/api/mobile/ai-technician/service-areas/[id]` | Module user | |
| `GET` | `/api/mobile/ai-technician/services` | Module user | Each service may include `semenServiceTemplateId`, `offerPrice`, `discountPercent`, `stockSummary`, `semenTemplateLocked` (see §9.1). |
| `POST` | `/api/mobile/ai-technician/services` | Module user | Manual gig (no template); unchanged. |
| `PATCH` | `/api/mobile/ai-technician/services/[id]` | Module user | Template-backed services accept only the **template-backed** patch shape (§11.2). Non-template services use the original manual patch until terminal status. |
| `DELETE` | `/api/mobile/ai-technician/services/[id]` | Module user | |
| `GET` | `/api/mobile/ai-technician/semen-templates` | Module user | Approved + active catalog; query: `animalType`, `providerId`, `breedId`, `limit` (1–50, default 30), `offset`. Returns `{ total, templates[] }`. |
| `GET` | `/api/mobile/ai-technician/semen-templates/[id]` | Module user | Single catalog template; `{ template }` or 404. |
| `POST` | `/api/mobile/ai-technician/services/from-template` | Module user | Creates one `AiTechnicianService` linked to the template; body §11.1. |
| `GET` | `/api/mobile/ai-technician/services/[id]/semen-inventory` | Module user | Lists inventory lots for a **template-backed** service; `{ lots }`. |
| `POST` | `/api/mobile/ai-technician/services/[id]/semen-inventory` | Module user | Creates a lot; body §11.3. |
| `PATCH` | `/api/mobile/ai-technician/services/[id]/semen-inventory/[lotId]` | Module user | Partial lot update (API exists; dedicated mobile UI may be deferred). |
| `PATCH` | `/api/mobile/ai-technician/settings` | Module user | e.g. `acceptsEmergency`. |
| `POST` | `/api/mobile/ai-technician/submit` | Module user | Submit for admin review. |
| `GET` | `/api/mobile/ai-technician/dashboard` | Module user | Stats + **`recentReviews`** for technician. |
| `GET` | `/api/mobile/ai-technician/reviews` | **Technician actor** | MVP technician-facing reviews summary. |
| `GET` | `/api/mobile/ai-technician/requests` | **Technician actor** | Tabbed list; visibility + area rules in service. |
| `GET` | `/api/mobile/ai-technician/requests/[id]` | **Technician actor** | |
| `POST` | `…/requests/[id]/accept` | **Technician actor** | |
| `POST` | `…/requests/[id]/decline` | **Technician actor** | |
| `POST` | `…/requests/[id]/status` | **Technician actor** | Strict **ACCEPTED → ON_THE_WAY → ARRIVED → IN_PROGRESS**. |
| `POST` | `…/requests/[id]/complete` | **Technician actor** | Creates **`AiServiceRecord`**, sets **COMPLETED**; **`totalFee`** non-negative (Zod). |

**Guards:** `requireMobileAiTechnicianModuleUser` — active **CUSTOMER** (with customer profile) or **AI_TECHNICIAN** with profile. `requireMobileAiTechnicianActor` — **only** `UserRole.AI_TECHNICIAN` with profile **`APPROVED`** or **`PUBLISHED`**.

### 3.1 Mobile — Profile tab dashboard context

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/mobile/profile/dashboard-context` | `requireMobileProfileDashboardContextUser` | Same Bearer mobile JWT as `/api/mobile/me`. Allows **active** `CUSTOMER` (minimal customer profile ensured), **`AI_TECHNICIAN`** (with `AiTechnicianProfile`), or **`DOCTOR`** (with `DoctorProfile`). Returns one payload the Flutter **Profile** tab uses to choose root UI. |

**Response `data`:**

- `dashboardType`: `"GENERAL"` \| `"AI_TECHNICIAN"` \| `"AI_TECHNICIAN_PENDING"` \| `"AI_TECHNICIAN_REJECTED"` \| `"AI_TECHNICIAN_SUSPENDED"` \| `"DOCTOR"` — derived from `User.role`, `DoctorProfile` presence, and `AiTechnicianProfile.status` (`AiTechnicianStatus` enum).
- `user`: `{ id, name, phone, email, avatarUrl }` — `avatarUrl` prefers customer profile photo, else doctor photo, else technician **PROFILE_PHOTO** document URL when present.
- `aiTechnician`: `null` when the user has no AI technician profile; otherwise `{ id, status, displayName, serviceAreas[], todayRequestCount, pendingRequestCount, completedServiceCount, rating: { average, count } }`. **Counts and merged rating are only populated when `dashboardType === "AI_TECHNICIAN"`**; for pending / rejected / suspended they are **0** / `average: null`.

`doctor` is always **`null`** (reserved). Narrative: [`AI_TECHNICIAN_PROFILE_DASHBOARD_FLOW_PLAN.md`](./AI_TECHNICIAN_PROFILE_DASHBOARD_FLOW_PLAN.md).

---

## 4. Admin — AI technicians & applications

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/admin/ai-technician-applications` | Admin panel | Queue list. |
| `GET` | `/api/admin/ai-technician-applications/[id]` | Admin panel | Full detail including documents for review. |
| `POST` | `/api/admin/ai-technician-applications/[id]/transition` | **`requireAdminApiActor`** | Approve / publish / reject / etc.; **`auth.actor.id`** persisted as reviewer. |
| `GET` | `/api/admin/ai-technicians` | Admin panel | |
| `POST` | `/api/admin/ai-technicians` | Admin panel | |
| `GET` | `/api/admin/ai-technicians/[id]` | Admin panel | |
| `PATCH` | `/api/admin/ai-technicians/[id]` | Admin panel | |
| `POST` | `/api/admin/ai-technicians/[id]/approve` | Admin panel | |
| `POST` | `/api/admin/ai-technicians/[id]/reject` | Admin panel | |
| `POST` | `/api/admin/ai-technicians/[id]/verify` | Admin panel | |
| `POST` | `/api/admin/ai-technicians/[id]/suspend` | Admin panel | |
| `POST` | `/api/admin/ai-technicians/[id]/activate` | Admin panel | |
| `PUT` | `/api/admin/ai-technicians/[id]/working-areas` | Admin panel | |
| `PUT` | `/api/admin/ai-technicians/[id]/village-service-areas` | Admin panel | |
| `PUT` | `/api/admin/ai-technicians/[id]/service-categories` | Admin panel | |
| `POST` | `/api/admin/ai-technicians/[id]/service-fee` | Admin panel | |
| `POST` | `/api/admin/ai-technicians/[id]/emergency-availability` | Admin panel | |
| `GET` | `/api/admin/ai-technician-complaints` | Admin panel | Farmer complaints list. |
| `POST` | `/api/admin/ai-technician-complaints/[id]/status` | Admin panel | Resolve / reject / etc. |

Admin UI routes (not API): `/admin/ai-technicians`, `/admin/ai-technicians/applications`, `/admin/ai-technician-complaints`.  
Semen admin UI (not API): `/admin/semen-providers`, `/admin/livestock-breeds`, `/admin/semen-service-templates`.

### 4.1 Admin — semen providers (`/api/admin/semen-providers`)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/admin/semen-providers` | Admin panel | Query: `q`, `isActive` (`true` / `false`), `limit` (1–100, default 50), `offset`. Response: `{ total, providers[] }` where each provider has `id`, `slug`, `name`, `nameBn`, `description`, `descriptionBn`, `logoUploadedFileId`, `logoMimeType`, `isActive`, `verificationStatus`, `sortOrder`, `createdAt`, `updatedAt`. |
| `POST` | `/api/admin/semen-providers` | Admin panel | Body (`createSemenProviderBodySchema`): `slug` (kebab-case), `name`, optional `nameBn`, `description`, `descriptionBn`, `logoUploadedFileId`, `isActive`, `verificationStatus`, `sortOrder`. Response `{ provider }` (201). Errors include `LOGO_FILE_NOT_FOUND`, `DUPLICATE` (409). |
| `GET` | `/api/admin/semen-providers/[id]` | Admin panel | `{ provider }` or 404. |
| `PATCH` | `/api/admin/semen-providers/[id]` | Admin panel | Partial of create body. `{ provider }` or 404. |

### 4.2 Admin — livestock breeds (`/api/admin/livestock-breeds`)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/admin/livestock-breeds` | Admin panel | Query: `q`, `animalType`, `isActive`, `limit` (1–100, default 50), `offset`. Response: `{ total, breeds[] }` with `id`, `slug`, `nameEn`, `nameBn`, `animalType`, `description`, `isActive`, `createdAt`, `updatedAt`. |
| `POST` | `/api/admin/livestock-breeds` | Admin panel | Body: `slug`, `nameEn`, `nameBn`, `animalType`, optional `description`, `isActive`. `{ breed }` (201). |
| `GET` | `/api/admin/livestock-breeds/[id]` | Admin panel | `{ breed }` or 404. |
| `PATCH` | `/api/admin/livestock-breeds/[id]` | Admin panel | Partial of create body. `{ breed }` or 404. |

### 4.3 Admin — semen service templates (`/api/admin/semen-service-templates`)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/admin/semen-service-templates` | Admin panel | Query: `q`, `animalType`, `semenProviderId`, `approvalStatus`, `isActive` (`true`/`false`), `limit` (1–100, default 50), `offset`. Response: `{ total, templates[] }` — each template matches `serializeSemenTemplate` (see below). |
| `POST` | `/api/admin/semen-service-templates` | Admin panel | Body (`createSemenServiceTemplateBodySchema`): `internalName`, `animalType`, `semenProviderId`, `semenProductKind`, optional `otherSemenLabel` (required when kind is `OTHER`), text fields (`shortDescription`, `detailedDescription`, `expectedBenefits`, `recommendedAnimalCondition`, `warningsContraindications`), `defaultBasePrice`, optional `defaultOfferPrice` **XOR** optional `defaultDiscountPercent` (0–100), optional `tagsJson`, `isActive`, `approvalStatus`, `breedMix[]` (`breedId`, `percentage` — sum must be 100), `media[]` (`kind`, `uploadedFileId` and/or `externalUrl` per kind rules). `{ template }` (201). Errors: `BREED_NOT_FOUND`, `BREED_ANIMAL_TYPE_MISMATCH`, `MULTIPLE_COVERS`, `MEDIA_FILE_NOT_FOUND`, `PROVIDER_NOT_FOUND`, `OFFER_DISCOUNT_BOTH`. |
| `GET` | `/api/admin/semen-service-templates/[id]` | Admin panel | `{ template }` or 404. |
| `PATCH` | `/api/admin/semen-service-templates/[id]` | Admin panel | Partial create body; same validation errors as POST where applicable. |
| `POST` | `/api/admin/semen-service-templates/[id]/approve` | Admin panel + **`requireAdminApiActor`** | Body: `{ "action": "APPROVE" \| "REJECT", "rejectedReason"?: string }` — `rejectedReason` required when `REJECT`. `{ template }` with updated `approvalStatus`, `approvedById`, `approvedAt`, `rejectedReason`. |

**`serializeSemenTemplate` response shape:** `id`, `internalName`, `animalType`, `semenProviderId`, `semenProvider` (`id`, `slug`, `name`, `nameBn`), `semenProductKind`, `otherSemenLabel`, `shortDescription`, `detailedDescription`, `expectedBenefits`, `recommendedAnimalCondition`, `warningsContraindications`, `defaultBasePrice` / `defaultOfferPrice` / `defaultDiscountPercent` (strings), `tagsJson`, `isActive`, `approvalStatus`, `approvedById`, `approvedAt`, `rejectedReason`, `createdAt`, `updatedAt`, `breedMix[]` (`id`, `breedId`, `percentage` string, nested `breed`), `media[]` (`id`, `kind`, `uploadedFileId`, `externalUrl`, `sortOrder`).

**Mobile catalog template shape** (`GET …/semen-templates`, detail): `id`, `internalName`, `animalType`, `semenProductKind`, `otherSemenLabel`, `shortDescription`, `semenProvider`, `breedMix[]` (`breedId`, `percentage` string, `breed`), `media[]`, `defaultBasePrice` / `defaultOfferPrice` / `defaultDiscountPercent`, `warningsContraindications`, `expectedBenefits`, `recommendedAnimalCondition`, `detailedDescription`.

---

## 5. Core database models (Prisma)

| Model | Role |
|--------|------|
| **`User`** | `UserRole.AI_TECHNICIAN` or `CUSTOMER`; links to profiles. |
| **`AiTechnicianProfile`** | Application + published technician; `status`, `providerStatus`, areas, fees, admin notes. |
| **`AiTechnicianDocument`** | NID etc.; not exposed on public technician GET. |
| **`AiTechnicianDivisionServiceArea`** | Text district/upazila/union coverage for farmer matching. |
| **`AiTechnicianService`** | Gig / priced service (`ACTIVE` required for public listing). |
| **`AiServiceRequest`** | Native farmer request; `customerUserId`, optional `technicianProfileId`, `status`, fees, **`declineReason`**. |
| **`AiServiceRecord`** | 1:1 completion record after **IN_PROGRESS** → complete; follow-up / pregnancy dates. |
| **`AiTechnicianReview`** | Farmer rating tied to completed request (one per request). |
| **`AiTechnicianComplaint`** | Farmer complaint; admin workflow. |
| **`SemenProvider`** | Master list of semen companies / brands. |
| **`LivestockBreed`** | Breed reference data; used in template breed mix. |
| **`SemenServiceTemplate`** | Admin-defined semen product template; approval workflow. |
| **`SemenServiceTemplateBreedMix`** | Template ↔ breed percentages (relation field `breedMixes` on `SemenServiceTemplate`). |
| **`SemenServiceTemplateMedia`** | Cover / gallery / video metadata for templates. |
| **`TechnicianSemenInventory`** | Per-technician-service stock lots (`currentQuantity`, `reservedQuantity`, `usedQuantity`, alerts, batch/expiry notes). |

---

## 6. Status transitions

### `AiTechnicianProfile.status` (application / lifecycle)

Documented in admin application service — typical path: **DRAFT** → **SUBMITTED** → **UNDER_REVIEW** → **NEEDS_CORRECTION** | **APPROVED** → **PUBLISHED** | **REJECTED** | **SUSPENDED**. Exact transitions enforced server-side on `POST …/transition`.

### `AiServiceRequest.status` (native job)

`PENDING` → (**accept**) → `ACCEPTED` → `ON_THE_WAY` → `ARRIVED` → `IN_PROGRESS` → (**complete**) → `COMPLETED`.  
**Decline** from **PENDING** → `DECLINED`. Read-only terminal states: **COMPLETED**, **DECLINED**, **CANCELLED**.

---

## 7. Error shape

Mobile and admin JSON APIs use `jsonOk` / `jsonError` with `error: { code, message, … }`. Validation failures return **422** with Zod flatten details where implemented.

---

## 8. Known limitations & future improvements

| Topic | MVP limitation | Future |
|--------|----------------|--------|
| Public list | **PUBLISHED** only; suspended/unpublished hidden by query | Optional “preview” mode for admins only. |
| Technician list scan | Capped scan + **`truncated`** flag | DB-side filter optimization. |
| Record edits | No public API to mutate **`AiServiceRecord`** after create | Admin correction flow + audit log. |
| Payments | Manual / cash enums on complete | Gateway + webhooks. |
| Notifications | No new pregnancy cron | Integrate existing **`Notification`** when product-ready. |
| Reviews | Farmer list lacks **`hasAiReview`** | Add to list payload or cache client-side. |

---

## 9. Semen templates — domain rules

### 9.1 Locked template fields vs technician-editable fields

When `AiTechnicianService.semenServiceTemplateId` is set, **catalog copy** fields come from the approved template and are not editable via the manual service patch: `title`, `animalType`, `breedOrSemenType` (derived breed mix label), `description` (from template `shortDescription`), and all fields inside `semenTemplateLocked` on mobile reads.

Technicians may adjust (via `PATCH /api/mobile/ai-technician/services/[id]` using `patchTemplateBackedAiTechnicianServiceBodySchema`): `basePrice`, `visitFee`, `emergencyFee`, `offerPrice`, `discountPercent` (not both non-empty), `isAvailable`, `technicianServiceNote`, `repeatServicePolicy`, `followUpIncluded`. Template-backed rows in **REJECTED** status are not patchable (`NOT_EDITABLE`).

### 9.2 One technician service per semen template

The application enforces at most one `AiTechnicianService` per `(aiTechnicianId, semenServiceTemplateId)` (Prisma `@@unique`). Creating a second service from the same template returns **409** `DUPLICATE_TEMPLATE_SERVICE` from `POST …/services/from-template`.

### 9.3 Inventory lot model

`TechnicianSemenInventory` stores per-batch rows for a **template-backed** service only. API list/create/patch require the service to have `semenServiceTemplateId`. Quantities must satisfy `reservedQuantity <= currentQuantity` (and non-negative). `stockSummary` for farmers and mobile uses **active** lots only.

### 9.4 Offer model: `offerPrice` XOR `discountPercent`

At template create/patch (defaults: `defaultOfferPrice` vs `defaultDiscountPercent`), at `POST …/services/from-template`, at template-backed `PATCH …/services/[id]`, and in Zod refinements: **do not** send both a non-empty offer price and a non-empty discount percent. Conflicts return `OFFER_DISCOUNT_BOTH` (or Zod validation on admin create).

### 9.5 Deferred / follow-up work (not in current MVP scope)

- **In-panel upload wizard** for template media (admins use `POST /api/admin/uploads` with purposes `ADMIN_SEMEN_PROVIDER_LOGO`, `ADMIN_SEMEN_TEMPLATE_COVER`, `ADMIN_SEMEN_TEMPLATE_GALLERY`, plus form fields for `uploadedFileId`).  
- **Inventory PATCH UI** on mobile (the API `PATCH …/semen-inventory/[lotId]` exists).  
- **Stock decrement on booking** — inventory is not automatically reduced when a farmer books an AI service.

### 9.6 Prisma migration reference

Semen template system migration: **`20260511194500_ai_technician_semen_template_system`**.

---

## 10. Mobile request bodies (semen)

### 10.1 `POST /api/mobile/ai-technician/services/from-template`

Strict JSON object:

- `templateId` (string, required)  
- `basePrice`, `offerPrice`, `discountPercent`, `visitFee`, `emergencyFee` — optional; decimals as number or string (`\d+(\.\d{1,2})?`); `discountPercent` 0–100  
- `technicianServiceNote` — optional string, max 8000  
- `isAvailable` — optional boolean (default true on create)  
- `initialInventoryLot` — optional object: `currentQuantity` (int ≥0), optional `reservedQuantity`, `usedQuantity`, `minStockAlert`, `batchNumber`, `expiryDate` (string, max 40 chars), `sourceNote`, `storageNote`; `reservedQuantity` must not exceed `currentQuantity`

Responses: **201** `{ service }`; **404** `TEMPLATE_NOT_FOUND`; **409** `DUPLICATE_TEMPLATE_SERVICE`; **422** `OFFER_DISCOUNT_BOTH`, validation, or `NO_PROFILE`.

### 10.2 `POST /api/mobile/ai-technician/services/[id]/semen-inventory`

Body matches `createSemenInventoryLotBodySchema`: `currentQuantity` (int ≥0), optional `reservedQuantity`, `usedQuantity`, `minStockAlert`, `batchNumber`, `expiryDate`, `sourceNote`, `storageNote`. Response **201** `{ lot }`. Errors: `NOT_SEMEN_SERVICE`, `INVALID_STOCK`, `NOT_FOUND`, `NOT_ALLOWED`.

### 10.3 `PATCH /api/mobile/ai-technician/services/[id]/semen-inventory/[lotId]`

Body: `patchSemenInventoryLotBodySchema` — partial of the create body plus optional `isActive`. Response `{ lot }`.

---

Manual test scenarios for admin + mobile + public flows: [`AI_TECHNICIAN_SEMEN_SERVICE_TESTING.md`](./AI_TECHNICIAN_SEMEN_SERVICE_TESTING.md).
