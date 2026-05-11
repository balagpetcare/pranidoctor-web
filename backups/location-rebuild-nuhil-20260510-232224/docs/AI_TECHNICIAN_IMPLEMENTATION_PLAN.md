# Artificial Insemination (AI) Technician Module — Implementation Plan

**Project:** Prani Doctor / Animal Doctors ([pranidoctor.com](https://pranidoctor.com/))  
**Repositories:** `pranidoctor-web` (Next.js admin + API), `pranidoctor_mobile` (Flutter)  
**English code name:** `AiTechnician` (Prisma: `AiTechnicianProfile`, `UserRole.AI_TECHNICIAN`)  
**Bengali UI label:** এআই টেকনিশিয়ান / কৃত্রিম প্রজনন সেবা — **AI here means Artificial Insemination**, not artificial intelligence.

**Related docs:** Operational delivery history for admin/API foundation lives in [`docs/AI_TECHNICIAN_MANAGEMENT_PLAN.md`](./AI_TECHNICIAN_MANAGEMENT_PLAN.md). **API reference:** [`docs/AI_TECHNICIAN_API.md`](./AI_TECHNICIAN_API.md). **QA & security checklist:** [`docs/AI_TECHNICIAN_QA_CHECKLIST.md`](./AI_TECHNICIAN_QA_CHECKLIST.md). Mobile UI task notes: `pranidoctor_mobile/docs/tasks/M10_AI_TECHNICIAN_SERVICE_PLAN.md`.

**Naming for APIs and mobile DTOs (conceptual):**

| Concept | Preferred API / app name | Persistent model today | Notes |
|--------|---------------------------|-------------------------|--------|
| Farmer’s booking for AI field work | **`AiServiceRequest`** | **(a)** Legacy `ServiceRequest` where `serviceType = AI_SERVICE` **or (b)** new `AiServiceRequest` table | Do **not** rename the `ServiceRequest` table. New native table links optionally via `linkedServiceRequestId`. |
| Post-visit structured outcome | **`AiServiceRecord`** | **`AiServiceRecord`** Prisma model (1:1 with native `AiServiceRequest`) | COMMAND 02. Legacy `TreatmentCase` remains for doctor/clinical flows. |

---

## COMMAND 02 — Database foundation (completed)

**Date:** 2026-05-10  
**Migration:** `prisma/migrations/20260510092800_ai_technician_foundation/`  
*(Earlier migration `20260508205522_ai_technician_foundation` added profile-area joins; this migration extends the AI domain additively.)*

### Enums added

`AiTechnicianStatus`, `AiTechnicianDocumentType`, `AiTechnicianDocumentReviewStatus`, `AiTechnicianServiceStatus`, `AiServiceRequestStatus`, `AiPaymentStatus`.

### Tables / extensions

| Artifact | Purpose |
|----------|---------|
| **`AiTechnicianProfile`** | Extended with onboarding/address/NID/experience fields, `status` (`AiTechnicianStatus`, default `UNDER_REVIEW`), admin review fields; **`providerStatus`** unchanged. |
| **`AiTechnicianDocument`** | Documents tied to technician profile (`fileUrl` / `storageKey`). |
| **`AiTechnicianDivisionServiceArea`** | District / upazila / optional union text (parallel to **`AiTechnicianServiceArea`** villages and **`AiTechnicianProfileArea`** tree). |
| **`AiTechnicianService`** | Technician gig / priced service row. |
| **`AiServiceRequest`** | Farmer-native request; `customerUserId` → `User`; optional `linkedServiceRequestId` → `ServiceRequest`. |
| **`AiServiceRecord`** | Structured completion record; unique `aiServiceRequestId`. |
| **`ServiceRequest`** | Optional relation **`linkedAiServiceRequest`** only (no column change on legacy table). |

### Backfill

Migration SQL sets `AiTechnicianProfile.status` from existing `providerStatus` (`ACTIVE`→`PUBLISHED`, etc.).

### Deferred

Separate **`AiTechnicianApplication`** table (can start with profile `status = DRAFT`); duplicate **review** models (use existing **`Review`** / **`Complaint`**).

### Verify locally

`npx prisma migrate dev`, `npm run db:generate`, `npm run typecheck`, `npm run build`, `npm test`. If `tsc` errors inside `.next/dev/types/routes.d.ts`, delete `.next` and rebuild (known dev corruption).

---

## COMMAND 03 — Mobile AI technician application API (completed)

**Date:** 2026-05-10  
**Auth (updated COMMAND 06):** `requireMobileAiTechnicianModuleUser` — same Bearer mobile JWT as customer OTP (`role: CUSTOMER` in token); allows active **`UserRole.CUSTOMER`** with **`CustomerProfile`**, or active **`UserRole.AI_TECHNICIAN`** with **`AiTechnicianProfile`**, so promoted technicians keep access without a separate login.  
**Module:** `src/lib/mobile-ai-technician/` (`schemas.ts`, `application-service.ts`).  
**Tests:** `src/lib/mobile-ai-technician/schemas.test.ts`.

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/mobile/ai-technician/me` | Own technician profile + documents + division service areas + services summary; `profile: null` if not started. |
| `POST` | `/api/mobile/ai-technician/apply` | Create or update draft (`AiTechnicianStatus.DRAFT` on create; editable also in `NEEDS_CORRECTION`). |
| `POST` | `/api/mobile/ai-technician/submit` | Submit for admin review → `SUBMITTED` + `providerStatus` `PENDING_VERIFICATION`. Validates display name, profile `district`/`upazila`, ≥1 active `AiTechnicianDivisionServiceArea`, NID front + back documents. |
| `POST` | `/api/mobile/ai-technician/documents` | Add document metadata (`fileUrl` and/or `storageKey`, `type`, `title`). |
| `DELETE` | `/api/mobile/ai-technician/documents/[id]` | Remove document while editable. |
| `POST` | `/api/mobile/ai-technician/service-areas` | Add `AiTechnicianDivisionServiceArea` row. |
| `DELETE` | `/api/mobile/ai-technician/service-areas/[id]` | Remove division service area while editable. |

### Validation rules (mobile)

- Edits allowed only when `status` is **`DRAFT`** or **`NEEDS_CORRECTION`**.
- Mobile cannot set **`PUBLISHED`**, **`APPROVED`**, or arbitrary `status` (no `status` in apply body; `submit` only sets `SUBMITTED`).
- **`REJECTED`** / **`SUBMITTED`** / **`UNDER_REVIEW`** / etc. → apply/documents/service-areas return **409** `NOT_EDITABLE`.
- **`POST …/apply`:** optional `email` must not belong to another user (updates `User.email` when a non-empty unique email is sent).

### Manual smoke (curl)

Replace `TOKEN` with customer Bearer JWT from OTP verify.

```bash
curl -sS -H "Authorization: Bearer TOKEN" https://localhost:3000/api/mobile/ai-technician/me
curl -sS -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d "{\"displayName\":\"টেস্ট\"}" https://localhost:3000/api/mobile/ai-technician/apply
```

### Known limitations

- **JWT role label:** The mobile token may still carry `role: CUSTOMER` from OTP; access for **`AI_TECHNICIAN`** users is enforced in **`requireMobileAiTechnicianModuleUser`** by loading `User.role` from the database.
- **Upload:** No multipart pipeline; documents are **metadata only** (`fileUrl` or `storageKey` from client/CDN).
- **Public listing:** Unchanged; technician discovery remains existing public `/api/mobile/providers/technicians`.

---

## 1. Current state summary

### Backend (`pranidoctor-web`)

- **Stack:** Next.js App Router, PostgreSQL, Prisma 7 (`prisma/schema.prisma`, client in `src/generated/prisma`).
- **Unified user model:** `User` with `UserRole` including `CUSTOMER`, `DOCTOR`, `AI_TECHNICIAN`, admin roles. Profile split: `CustomerProfile`, `DoctorProfile`, `AiTechnicianProfile`.
- **AI technician profile:** `AiTechnicianProfile` with `providerStatus` (`ProviderStatus`), `verifiedAt`, `serviceFeeBdt`, `acceptsEmergency`, `metadataJson`, service-area joins (`AiTechnicianProfileArea` ↔ `Area`, `AiTechnicianServiceArea` ↔ `Village`), and `AiTechnicianProfileServiceCategory`.
- **Service requests:** Single `ServiceRequest` model supports `ServiceRequestType.AI_SERVICE`; category slug must be `ai-service` (enforced in `SERVICE_TYPE_EXPECTED_CATEGORY_SLUG`). Assignment uses `assignedTechnicianId` (DB column historically `assignedAiTechnicianId`).
- **Clinical / billing reuse:** `TreatmentCase`, `Prescription`, `BillingRecord`, `PaymentRecord` already allow `aiTechnicianId` where relevant.
- **Admin:** Full CRUD-style AI technician management under `/admin/ai-technicians` with REST handlers under `/api/admin/ai-technicians/**` (`requireAdminPanelApiAccess`), Zod schemas in `src/lib/admin-ai-technicians/`. **Applications inbox:** `/admin/ai-technicians/applications` + `/api/admin/ai-technician-applications/**` (COMMAND 04).
- **Technician panel API (server):** Email/password login at `/api/technician/auth/login` sets HttpOnly cookie; list/detail service requests at `/api/technician/service-requests` (cookie session via `requireTechnicianApiActor`). Lists rows **already assigned** to the technician (`assignedTechnicianId`).
- **Mobile AI technician application API:** `GET/POST /api/mobile/ai-technician/me|apply|submit`, documents & division service-area routes (`src/app/api/mobile/ai-technician/**`); logic in `src/lib/mobile-ai-technician/*` (COMMAND 03).
- **Mobile public discovery:** `GET /api/mobile/providers/technicians` (no auth) with area/animal filters via `listTechniciansForMobile`.
- **Document storage:** `AiTechnicianDocument` links optional **`uploadedFileId`** → **`UploadedFile`**; legacy `fileUrl` / `storageKey` still supported. Upload pipeline: **`POST /api/mobile/uploads`** + signed download routes (see `docs/UPLOAD_STORAGE_SETUP.md`).

### Admin panel

- Larkon-style shell; nav **এআই টেকনিশিয়ান** → `/admin/ai-technicians`; **এআই আবেদন** → `/admin/ai-technicians/applications` (`src/components/admin-ui/admin-nav.tsx`).
- List, create, detail, edit pages exist under `src/app/admin/(dashboard)/ai-technicians/`; application review under `…/ai-technicians/applications/`.

### Mobile (`pranidoctor_mobile`)

- **Customer auth:** OTP → Bearer token; `SessionNotifier` with `AppRole.customer` | `doctor` | `technician`.
- **Technician UX:** Feature module `lib/src/features/technician_ai/` (dashboard, requests, jobs, detail, AI record form, complete job). Routes under `/technician/...` in `router.dart`; `/technician` paths bypass customer login redirect (same pattern as `/doctor`).
- **Technician login screen:** Stub UI; “continue shell” sets role without real credentials (`technician_login_screen.dart`).
- **Live technician repository:** `TechnicianJobRepositoryLive` calls **`/api/mobile/technician/*`** — **these routes do not exist** on the web server (audit: no `src/app/api/mobile/technician/**`). Production path uses **`USE_MOCK_TECHNICIAN_API`** (`AppConfig`).
- **Provider finder:** `technician_list_screen` / `technician_detail_screen` + `provider_finder_repository` align with `/api/mobile/providers/technicians`.

### Gaps vs product goal (this plan’s target)

| Goal | Gap |
|------|-----|
| Same login for user, doctor, AI technician | Today: **customer** = OTP JWT; **technician** = separate cookie session on `/api/technician/auth/*`; **doctor** = separate panel patterns. Unification requires a **single mobile auth story** (e.g. OTP or passwordless + role claims) and **one** secure mobile session model. |
| Farmer applies to become technician | **API:** `/api/mobile/ai-technician/*` (COMMAND 03). **Admin review / publish** COMMAND 04 (`/api/admin/ai-technician-applications/**`, `/admin/ai-technicians/applications`). |
| Technician submits NID, certificates, documents | **API:** `POST …/documents` + submit validation for NID front/back. **Upload** metadata-only until CDN/multipart exists. |
| Technician creates service/gig/package | **DB:** `AiTechnicianService`. **API:** CRUD not in COMMAND 03 (read-only summary on `me`). |
| Technician accepts incoming work | Backend technician list is **post-assignment** only; no “offered” pool or technician-initiated accept from **unassigned** `PENDING` requests unless new workflow + APIs. |
| Mobile live technician API | Path and auth mismatch (`/api/mobile/technician` + Bearer vs `/api/technician` + cookie). |

---

## 2. Files/modules found

### 2.1 Backend — auth & guards

| Path | Role |
|------|------|
| `src/lib/mobile-auth/guard.ts` | `requireMobileCustomer` — Bearer JWT, `UserRole.CUSTOMER` |
| `src/lib/mobile-auth/jwt.ts`, `otp-service.ts`, `src/app/api/mobile/auth/otp/**` | Customer OTP issue/verify |
| `src/lib/technician-auth/*` | Cookie JWT, `getTechnicianSession`, `requireTechnicianApiActor` |
| `src/app/api/technician/auth/login|logout|me/route.ts` | Technician session |
| `src/lib/admin-auth/api-guard.ts`, `panel-access.ts` | Admin API JWT/cookie |

### 2.2 Backend — AI technician domain

| Path | Role |
|------|------|
| `prisma/schema.prisma` | `AiTechnicianProfile`, areas, categories, `ServiceRequest` AI fields |
| `src/lib/admin-ai-technicians/*` | Admin business logic + Zod |
| `src/lib/admin-ai-technician-applications/*` | Admin application review + transitions (COMMAND 04) |
| `src/app/api/admin/ai-technicians/**` | Admin REST |
| `src/app/api/admin/ai-technician-applications/**` | Admin application list/detail/transition (COMMAND 04) |
| `src/lib/mobile-ai-technician/*` | Mobile AI technician application (COMMAND 03) |
| `src/app/api/mobile/ai-technician/**` | Mobile AI technician HTTP routes |

### 2.3 Backend — service requests (farmer / mobile)

| Path | Role |
|------|------|
| `src/lib/mobile-service-requests/schemas.ts` | Create body; geo required for `AI_SERVICE` |
| `src/lib/mobile-service-requests/service-request-service.ts` | Create/list/cancel customer requests |
| `src/lib/mobile-service-requests/service-request-mapper.ts` | DTOs, slug map |
| `src/app/api/mobile/service-requests/**` | Customer service requests |
| `src/lib/admin-service-requests/service-request-assignment-service.ts` | Assign technician (admin) |

### 2.4 Backend — areas & providers

| Path | Role |
|------|------|
| `prisma/schema.prisma` | `Area`, `Division`…`Village`, profile area M2Ms |
| `src/lib/mobile-providers/provider-service.ts` | `listTechniciansForMobile`, doctor parity |
| `src/app/api/mobile/providers/technicians/**` | Public technician discovery |

### 2.5 Admin UI

| Path | Role |
|------|------|
| `src/components/admin-ui/admin-nav.tsx` | Nav |
| `src/app/admin/(dashboard)/ai-technicians/**` | Pages |
| `src/components/admin/ai-technicians/*` | Lists, forms, detail |

### 2.6 Mobile — structure & design system

| Path | Role |
|------|------|
| `lib/src/app/router.dart`, `app.dart`, `theme.dart` | Routing, theme |
| `lib/src/design_system/**` | Tokens, `prani_*` widgets, colors, shadows |
| `lib/src/features/session/application/session_notifier.dart` | Roles + token hydrate |
| `lib/src/features/auth/login_entry_screen.dart`, `mobile_otp_auth_repository.dart` | Customer OTP |
| `lib/src/features/technician_ai/**` | Technician workflow UI + repositories |
| `lib/src/features/service_requests/**` | Booking wizard, customer requests |
| `lib/src/features/providers/**` | Doctor/technician lists |
| `lib/src/core/network/api_client.dart` | Dio + Bearer |

### 2.7 API response convention

| Pattern | Location |
|---------|----------|
| `{ ok: true, data }` / `{ ok: false, error: { code, message, details? } }` | `src/lib/api-response.ts` |

---

## 3. Required database models

**Principle:** Prefer **additive** tables. **Bookings:** legacy **`ServiceRequest`** (`AI_SERVICE`) stays; native **`AiServiceRequest`** + **`AiServiceRecord`** are now available for COMMAND 03+ APIs.

| Model / artifact | Purpose | Status (post COMMAND 02) |
|------------------|---------|---------------------------|
| **`AiTechnicianProfile`** + status enums | Application / verification / publish | **Extended** — APIs still need to read/write new fields |
| **`AiTechnicianDocument`** | NID, certificates, proofs | **Done** |
| **`AiTechnicianDivisionServiceArea`** | District-level coverage | **Done** (alongside existing village + `Area` M2Ms) |
| **`AiTechnicianService`** | Gig / priced offering | **Done** |
| **`AiServiceRequest`** / **`AiServiceRecord`** | Farmer AI booking + outcome | **Done** |
| **`TechnicianOnboardingApplication`** (optional) | Isolated pre-user application | **Deferred** — use profile `DRAFT`/`SUBMITTED` first |

**Enum considerations:** Keep `UserRole.AI_TECHNICIAN`, `ProviderStatus`, `ServiceRequestType`, `ServiceRequestStatus`. New AI enums are additive only.

---

## 4. Required backend APIs

Grouped by actor. All new routes should follow **`jsonOk` / `jsonError`** (`src/lib/api-response.ts`).

### 4.1 Mobile — unified session (future)

| Method | Path (proposed) | Purpose |
|--------|-----------------|---------|
| `GET` | `/api/mobile/me` (extended) or `/api/mobile/session` | Return resolved **role** + profile summary (customer / doctor / technician) once unified auth exists |
| `POST` | `/api/mobile/auth/*` | Evolve OTP or add password/OIDC branch for non-customer roles **without** breaking existing customer OTP |

### 4.2 Mobile — technician (Bearer-first for Flutter)

Align with `TechnicianJobRepositoryLive` **or** update the app to a single convention:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/mobile/technician/requests` | Incoming queue (define: unassigned `PENDING` in area vs offered vs admin-pre-assigned) |
| `GET` | `/api/mobile/technician/jobs` | Active jobs for logged-in technician |
| `GET` | `/api/mobile/technician/jobs/:id` | Detail |
| `PATCH` | `/api/mobile/technician/jobs/:id` | `action: accept | reject` |
| `PATCH` | `/api/mobile/technician/jobs/:id/ai-record` | Persist **AiServiceRecord** payload |
| `PATCH` | `/api/mobile/technician/jobs/:id/complete` | Complete service, set statuses, trigger billing draft |

**Auth:** New `requireMobileAiTechnician` mirroring `requireMobileCustomer` but validating `UserRole.AI_TECHNICIAN` + active `AiTechnicianProfile`.

**Compatibility:** Keep `/api/technician/**` cookie routes for a possible web technician portal, or deprecate behind feature flag after mobile parity.

### 4.3 Mobile — farmer onboarding as technician

| Method | Path (proposed) | Purpose |
|--------|-----------------|---------|
| `POST` | `/api/mobile/technician-application` | Submit application + document references |
| `GET` | `/api/mobile/technician-application` | Status for current user |

### 4.4 Mobile — technician profile & gigs

| Method | Path (proposed) | Purpose |
|--------|-----------------|---------|
| `GET`/`PATCH` | `/api/mobile/technician/profile` | Editable pre-publish vs post-publish rules |
| `CRUD` | `/api/mobile/technician/packages` | Service packages / gigs |

### 4.5 Admin — extensions

| Method | Path (proposed) | Purpose |
|--------|-----------------|---------|
| `GET` | `/api/admin/technician-applications` | Queue review |
| `POST` | `.../[id]/approve` | Promote user / attach profile (transaction) |
| `POST` | `.../[id]/reject` | Reject with reason |
| `GET`/`PATCH` | Document verification endpoints | Tie into `TechnicianDocument` |

### 4.6 Existing APIs to reuse (no rename)

- `POST /api/mobile/service-requests` — farmer **AiServiceRequest** creation (`serviceType: AI_SERVICE`).
- `GET /api/mobile/providers/technicians` — discovery by area + `animalType`.
- Admin assign technician — extend UI to call existing assignment service where applicable.

---

## 5. Required admin pages

| Page | Status | Work |
|------|--------|------|
| AI technician list/detail/edit | **Exists** | Wire new fields when models land (documents, application status) |
| **Technician applications** inbox | **Done (COMMAND 04)** | `/admin/ai-technicians/applications` + transition API |
| **Document review** | **New** | Optional sub-panel on technician or application detail |
| Service request detail | **Exists** | Ensure AI requests show technician assignment + **AiServiceRecord** link when implemented |
| Areas | **Exists** | Continue using for coverage |

---

## 6. Required mobile screens

| Screen | Status | Work |
|--------|--------|------|
| `LoginEntryScreen` | **Exists** | Role-aware entry or post-login dashboard switch |
| `TechnicianLoginScreen` | **Stub** | Real auth + token storage (`signInTechnician` analogue) |
| `TechnicianDashboardScreen` | **Exists** | Hook to live APIs |
| `TechnicianRequestsScreen`, `TechnicianJobsScreen`, job detail / record / complete | **Exists** | Align endpoints; loading/error states |
| **Technician onboarding wizard** | **New** | Apply: profile, areas, documents, experience |
| **Technician packages** (gigs) | **New** | CRUD list + editor |
| `BookingWizardScreen` | **Exists** | Ensure AI path selects `AI_SERVICE` + `ai-service` category + geo |
| `TechnicianListScreen` / detail | **Exists** | Optional: deep link to package |

---

## 7. Verification workflow

1. **Farmer** submits technician application + documents (mobile).
2. **Admin** reviews queue; opens document previews (signed URLs).
3. **Admin** approves → creates or upgrades `User` to `AI_TECHNICIAN`, creates `AiTechnicianProfile`, sets `ProviderStatus` appropriately (e.g. `PENDING_VERIFICATION` until docs complete, then `ACTIVE`).
4. **Admin** may still use manual `POST /api/admin/ai-technicians` for staff-created accounts (keep both paths).
5. **Technician** completes profile publish checklist (areas, categories, optional packages).
6. **System** marks technician visible in provider finder when `ACTIVE` + published rules satisfied.

---

## 8. Technician service/gig workflow

1. Technician maintains **service areas** (`AiTechnicianProfileArea` / village tables) — sync from mobile or admin-only MVP.
2. Technician creates **packages** (title, price, animal types, description).
3. **Publish** gate: at least one area, one category (`ai-service`), optional package, `ProviderStatus.ACTIVE`, `UserStatus.ACTIVE`.
4. Packages surface on technician detail (mobile) and optionally filter farmer booking.

---

## 9. Farmer booking workflow

1. Farmer selects animal with `animalType` (e.g. cattle).
2. **Discovery:** `GET /api/mobile/providers/technicians?areaId=...&animalType=...` (and/or `serviceCategoryId` for `ai-service`).
3. Optional: farmer picks a **package** or technician default `serviceFeeBdt`.
4. **Create AiServiceRequest:** `POST /api/mobile/service-requests` with `serviceType: AI_SERVICE`, valid `serviceCategoryId`, geo (`areaId` / `villageId` / `locationText`).
5. **Matching:** either (a) admin assigns technician, (b) round-robin / first-in-area auto-assign, or (c) **broadcast** to eligible technicians until one accepts (requires new state machine — recommend explicit `OFFERED` / `PENDING_TECHNICIAN_ACCEPT` or use `ASSIGNED` with nullable technician until accept).

---

## 10. Service completion and AI record workflow

1. Technician opens job → confirms animal + location.
2. **In progress:** `ServiceRequestStatus.IN_PROGRESS` + `startedAt`.
3. **AiServiceRecord:** persist via **`AiServiceRecord`** model linked to native **`AiServiceRequest`** (or legacy `TreatmentCase` when booking stayed on `ServiceRequest` only).
4. **Complete:** `COMPLETED`, `completedAt`, finalize `TreatmentCase` if used.
5. **Notifications:** reuse `notifyServiceRequestSubmitted` patterns for status transitions.

---

## 11. Payment/follow-up workflow

1. On completion, create or update **`BillingRecord`** (`aiTechnicianId`, fee lines aligned with `billing-calculation` / commission plan).
2. **`paymentStatus`:** technician or farmer marks cash/wallet — reuse `PaymentRecord` + invoice `paymentStatus` enums already in schema.
3. **Follow-up:** `TreatmentCase.followUpDate` / `followUpNotes` already exist — expose in mobile technician complete flow and farmer notifications.

---

## 12. Step-by-step implementation order

1. **Domain naming & DTOs:** Expose native **`AiServiceRequest`** / **`AiServiceRecord`** in APIs alongside legacy **`ServiceRequest`** where needed; keep names distinct in OpenAPI/Flutter.
2. **Mobile technician API layer:** Implement `/api/mobile/technician/**` with Bearer guard **or** redirect Flutter to cookie jar — **pick one**; update `TechnicianJobRepositoryLive` accordingly.
3. **Technician accept workflow:** Map **`AiServiceRequestStatus`** transitions; legacy `ServiceRequest` flow unchanged until explicitly linked.
4. **AiServiceRecord persistence:** DB done — wire PATCH handlers + mobile form to **`AiServiceRecord`** / native **`AiServiceRequest`**.
5. **Billing hook:** Wire completion to billing service for AI rows.
6. **Technician onboarding:** Application + document storage (S3/local strategy).
7. **Admin application inbox:** UI + APIs.
8. **Packages:** Schema + mobile + admin optional.
9. **Unified login / dashboard:** Single entry after OTP or staged rollout (technician still email/password interim).
10. **Hardening:** Rate limits, audit logs, notification copy in Bengali.

---

## 13. Risks and compatibility notes

| Risk | Mitigation |
|------|------------|
| Renaming Prisma models (`ServiceRequest` → `AiServiceRequest`) | **Do not** rename; use DTO names only. |
| Breaking mobile customer OTP | Additive JWT claims or separate technician token family behind feature flags. |
| Cookie vs Bearer on mobile | Prefer **Bearer** for Flutter (`Authorization` header already in `ApiClient`); document cookie routes as secondary. |
| Technician list only shows assigned jobs | Product mismatch — implement “incoming” query before UX promises accept flow. |
| `TreatmentCase` name vs AI record | Keep DB map name (`TreatmentRecord`) per `@map`; document user-facing **AiServiceRecord**. |
| Duplicate planning docs | This file = **end-to-end** roadmap; `AI_TECHNICIAN_MANAGEMENT_PLAN` = historical admin delivery log; M10 = mobile UI detail. |

---

## 14. No backend-breaking migration strategy

1. **Only additive migrations:** COMMAND 02 added `AiTechnicianDocument`, `AiTechnicianDivisionServiceArea`, `AiTechnicianService`, `AiServiceRequest`, `AiServiceRecord`, and profile columns; further tables (e.g. isolated application) only if needed.
2. **Never rename** `ServiceRequest`, `assignedTechnicianId` / DB column `assignedAiTechnicianId`, or enum values in place — use `@map` only as already done.
3. **Backfill:** optional scripts to migrate `metadataJson` blobs into structured rows once stable.
4. **API versioning:** If response shapes change, add fields with defaults; keep old clients working.
5. **Feature flags:** `OFFERED` workflow, packages, unified login behind env toggles.

---

## 15. Testing checklist

- [ ] Customer OTP unchanged (`/api/mobile/auth/otp/*`, `/api/mobile/me`).
- [ ] `POST /api/mobile/service-requests` with `AI_SERVICE` + `ai-service` category + geo passes validation.
- [ ] `GET /api/mobile/providers/technicians` filters by area + animal type.
- [ ] Technician Bearer auth rejects suspended / non-`ACTIVE` provider.
- [ ] Accept/reject/complete transitions preserve DB integrity (FKs, single assignee).
- [ ] **AiServiceRecord** payload round-trip (API + mobile form).
- [ ] Billing created with correct `aiTechnicianId` and totals.
- [ ] Admin application approve creates user/profile and idempotent retry behavior.
- [x] Document upload ACL (only owner + admin) — owner `GET /api/mobile/uploads/[id]`, admin `GET /api/admin/uploads/[id]` (signed redirect).
- [ ] Flutter: `USE_MOCK_TECHNICIAN_API=false` E2E against local API once routes exist.
- [ ] Regression: doctor flows, existing service requests, admin doctors.

---

## COMMAND 04 — Admin panel review & publish workflow (completed)

**Date:** 2026-05-10  
**Auth:** Same as other admin JSON routes — `requireAdminPanelApiAccess()` on reads; `requireAdminApiActor()` on `POST …/transition` so the acting admin `id` is stored on `reviewedBy` / `reviewedAt`.  
**Module:** `src/lib/admin-ai-technician-applications/` (`schemas.ts`, `application-review-service.ts`).  
**Admin UI:** `src/components/admin/ai-technicians/ApplicationsList.tsx`, `ApplicationReviewPanel.tsx`, `application-labels.ts`; pages under `src/app/admin/(dashboard)/ai-technicians/applications/`.  
**Nav:** `ADMIN_NAV_ITEMS` entry **এআই আবেদন** → `/admin/ai-technicians/applications` (`src/components/admin-ui/admin-nav.tsx`).

### Admin routes (actual)

| Path | Purpose |
|------|---------|
| `/admin/ai-technicians/applications` | Applications inbox (filters, search, table). |
| `/admin/ai-technicians/applications/[id]` | Review detail + actions. |

*(Using `…/applications` avoids colliding with existing technician list/detail/edit under `/admin/ai-technicians`.)*

### Admin APIs

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/admin/ai-technician-applications` | Paginated list; excludes `DRAFT`; optional `applicationStatus`, `q` (name, district, upazila, email, phone), `limit`, `offset`. |
| `GET` | `/api/admin/ai-technician-applications/[id]` | Full application payload: personal/professional fields, division service areas, documents, admin/correction notes, reviewer, timestamps. |
| `POST` | `/api/admin/ai-technician-applications/[id]/transition` | JSON `{ action, note?, adminNote? }` — server-side transition rules only. |

**Actions:** `mark_under_review`, `request_correction` (requires `note`), `approve` (optional `adminNote`), `reject` (requires `note`), `publish`, `unpublish`, `suspend`, `lift_suspension`.

### Status transitions (enforced in `adminApplyTechnicianApplicationTransition`)

- `SUBMITTED` → `UNDER_REVIEW` (`mark_under_review`)
- `UNDER_REVIEW` → `NEEDS_CORRECTION` | `APPROVED` | `REJECTED`
- `APPROVED` → `PUBLISHED` (`publish`; sets `User.role` `AI_TECHNICIAN`, `User.status` `ACTIVE`, profile `PUBLISHED`, `ProviderStatus.ACTIVE`, `verifiedAt`)
- `PUBLISHED` → `APPROVED`-like (`unpublish`: profile `APPROVED`, `publishedAt` cleared, `PENDING_VERIFICATION`) or `SUSPENDED`
- `APPROVED` → `SUSPENDED` (`suspend`)
- `SUSPENDED` → `APPROVED` (`lift_suspension`; provider `PENDING_VERIFICATION`, user `ACTIVE`)
- `NEEDS_CORRECTION` → `SUBMITTED` remains **mobile** (`POST /api/mobile/ai-technician/submit`) — not admin

### Known limitations

- **Status history:** No dedicated audit table; UI shows `reviewedAt` / `publishedAt` / notes and a short Bengali note in the payload.
- **Publish vs role:** Publishing assigns `AI_TECHNICIAN`; unpublish does not revert role (unlist semantics — adjust later if product requires demotion).

### Verify locally

`npm run lint`, `npm run typecheck`, `npm run build`, `npm test`. Smoke: open **এআই আবেদন**, filter tabs, search, open a row, run a transition, confirm error handling when the transition is invalid.

---

## COMMAND 06 — AI Technician dashboard & service/gig management (completed)

**Date:** 2026-05-10  

### Backend

| Path | Role |
|------|------|
| `src/lib/mobile-ai-technician/mobile-module-guard.ts` | `requireMobileAiTechnicianModuleUser` — Bearer `verifyMobileJwt`; DB role `CUSTOMER`+`CustomerProfile` **or** `AI_TECHNICIAN`+`AiTechnicianProfile`. |
| `src/lib/mobile-ai-technician/dashboard-service.ts` | `getMobileTechnicianDashboard` — profile snapshot, request counts (`AiServiceRequest`), earnings sum from completed `finalFee`, rating placeholders, `activeServices` (`AiTechnicianServiceStatus.ACTIVE`). |
| `src/lib/mobile-ai-technician/technician-services-schemas.ts` | Zod create/patch service + patch settings (`acceptsEmergency`). |
| `src/lib/mobile-ai-technician/technician-services-service.ts` | List/create/patch/deactivate own services; **`APPROVED`** or **`PUBLISHED`** required to mutate services; edits blocked for **`ACTIVE`**, **`REJECTED`**, **`INACTIVE`**; new rows default **`DRAFT`**; settings patch only when profile **`PUBLISHED`**. |

All existing `src/app/api/mobile/ai-technician/**` routes use **`requireMobileAiTechnicianModuleUser`** (replacing `requireMobileCustomer`).

### Mobile HTTP (user-facing)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/mobile/ai-technician/dashboard` | Dashboard payload (profile status, publish flag, counts, earnings, rating placeholders, active services, admin/correction notes). |
| `GET` | `/api/mobile/ai-technician/services` | List own `AiTechnicianService` rows. |
| `POST` | `/api/mobile/ai-technician/services` | Create service (body: title, animalType, optional breed/semen, description, basePrice, optional visit/emergency fees, repeat policy, followUpIncluded). |
| `PATCH` | `/api/mobile/ai-technician/services/[id]` | Update own service when status allows. |
| `DELETE` | `/api/mobile/ai-technician/services/[id]` | Deactivate → **`INACTIVE`**. |
| `PATCH` | `/api/mobile/ai-technician/settings` | `{ acceptsEmergency }` — **published** technicians only (availability / urgent-call signal). |

### Mobile app (`pranidoctor_mobile`)

- **Repository:** `AiTechnicianRepository` — `fetchDashboard`, `listServices`, `createService`, `patchService`, `deactivateService`, `patchSettings`.
- **Screens:** `AiTechnicianDashboardScreen` (`/profile/ai-technician/dashboard`), `AiTechnicianServicesListScreen`, `AiTechnicianServiceFormScreen` (nested `…/services/new`, `…/services/:serviceId/edit`).
- **Entry:** Profile **এআই টেকনিশিয়ান আবেদন** opens **dashboard** when status is **`APPROVED`** or **`PUBLISHED`**; pipeline statuses still open read-only **status** screen. Bengali copy for services (e.g. নতুন সার্ভিস তৈরি করুন, বেস ফি, ভিজিট ফি, জরুরি সেবা ফি, ফলোআপ অন্তর্ভুক্ত, অ্যাডমিন অনুমোদনের অপেক্ষায়).

### Deferred / known limitations

- **Service → `ACTIVE` (public gig):** No mobile self-publish; only **`ACTIVE`** services are included in dashboard “active” list and public discovery should gate on **`ACTIVE`** (admin activation UI = later phase; align with existing admin technician tooling).
- **Per-service admin approve/reject:** Not implemented; services default **`DRAFT`** unless admin workflow elsewhere sets **`PENDING_REVIEW`** / **`ACTIVE`**.
- **Ratings:** Placeholders on dashboard until review aggregation is wired.

### Verify locally

`npm run lint`, `npm run typecheck`, `npm run build`, `npm test`; Flutter `dart format .`, `flutter analyze`, `flutter test`.

---

## COMMAND 07 — Farmer AI service request & area-based technician listing (completed)

**Date:** 2026-05-10  

### Backend (`pranidoctor-web`)

| Path | Role |
|------|------|
| `src/lib/mobile-ai-services/schemas.ts` | Zod: list technicians query, create `AiServiceRequest` body, list “my requests” query. |
| `src/lib/mobile-ai-services/ai-services-service.ts` | Public list/detail; `createAiServiceRequestForCustomer`; `listMyAiServiceRequests`; area match on **`AiTechnicianDivisionServiceArea`**; ratings (approved **`Review`**), completed counts. |
| `src/lib/mobile-ai-services/schemas.test.ts` | Vitest coverage for schemas. |

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/mobile/ai-services/technicians` | None | List **PUBLISHED** + **ACTIVE** provider technicians with ≥1 **`ACTIVE`** `AiTechnicianService`, matching division **district/upazila** (optional **unionOrArea**), optional **animalType** & **emergency** (`acceptsEmergency`). |
| `GET` | `/api/mobile/ai-services/technicians/[id]` | None | Public profile (no documents/NID): services, division areas, trust stats. |
| `POST` | `/api/mobile/ai-services/requests` | `requireMobileCustomer` | Create **`AiServiceRequest`**; optional **`technicianProfileId`** / **`serviceId`** with area + service validation. |
| `GET` | `/api/mobile/ai-services/requests/me` | `requireMobileCustomer` | Farmer’s own AI request history. |
| `GET` | `/api/mobile/ai-services/requests/[id]` | `requireMobileCustomer` | Single owned request (detail). |
| `GET` | `/api/mobile/ai-services/requests/[id]/record` | Customer **or** approved technician Bearer | Digital **`AiServiceRecord`** when request **`COMPLETED`**. |

### Mobile (`pranidoctor_mobile`)

- **Module:** `lib/src/features/ai_farmer_services/` — repository, providers, screens.
- **Home:** `AiServiceHomeEntryCard` (“কৃত্রিম প্রজনন সেবা” / “আপনার এলাকায় যাচাইকৃত এআই টেকনিশিয়ান খুঁজুন”); home chip **AI টেকনিশিয়ান** opens **new finder** (legacy `/providers/technicians` unchanged).
- **Screens / routes:** finder (`/ai-services/technicians`), public profile (`…/technicians/:technicianId`), request form (`/ai-services/request`), my requests (`/ai-services/my-requests`); profile menu **আমার এআই অনুরোধ**.

### Known limitations

- **Area model:** Listing uses **text** district/upazila/union on **`AiTechnicianDivisionServiceArea`**, not hierarchical `Area` IDs (aligned with technician application coverage).
- **Notes:** API field **`note`** is merged into **`healthIssueNote`** on persist (single DB column).
- **Admin override:** No special-case bypass for technician/area mismatch beyond current rules.

### Verify locally

`npm run lint`, `npm run typecheck`, `npm run build`, `npm test`; Flutter `dart format lib`, `flutter analyze`, `flutter test`.

---

## COMMAND 08 — Technician request handling & service completion record (completed)

**Date:** 2026-05-10  

### Backend (`pranidoctor-web`)

| Path | Role |
|------|------|
| `src/lib/mobile-ai-technician/mobile-module-guard.ts` | `requireMobileAiTechnicianActor` — Bearer JWT, **`UserRole.AI_TECHNICIAN` only**, profile **`APPROVED`** or **`PUBLISHED`**. |
| `src/lib/mobile-ai-technician/technician-ai-requests-schemas.ts` | Zod: list query (`tab`), decline body, status body, complete body (MVP **`AiPaymentStatus`** only). |
| `src/lib/mobile-ai-technician/technician-ai-requests-service.ts` | List (area pool + assignee), get, accept, decline (`declineReason`), safe status transitions, complete → **`AiServiceRecord`** + request **`COMPLETED`**, record viewer by customer user or assignee technician. |
| `prisma/migrations/20260510183000_ai_service_request_decline_reason/` | Optional **`declineReason`** on **`AiServiceRequest`**. |

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/mobile/ai-technician/requests` | `requireMobileAiTechnicianActor` | Tabbed list (`tab=new|accepted|ongoing|completed|cancelled|all`). |
| `GET` | `/api/mobile/ai-technician/requests/[id]` | Actor | Request detail if visible (assignee or area-matched **PENDING** pool). |
| `POST` | `…/requests/[id]/accept` | Actor | **PENDING** → **ACCEPTED**, assign technician; area check. |
| `POST` | `…/requests/[id]/decline` | Actor | **PENDING** → **DECLINED**, optional **`reason`** → **`declineReason`**. |
| `POST` | `…/requests/[id]/status` | Actor | **ACCEPTED**→**ON_THE_WAY**→**ARRIVED**→**IN_PROGRESS** (strict +1). |
| `POST` | `…/requests/[id]/complete` | Actor | From **IN_PROGRESS**: create **`AiServiceRecord`**, set request **COMPLETED**, **`finalFee`** / **`paymentStatus`** (MVP manual/cash). |
| `GET` | `/api/mobile/ai-services/requests/[id]` | `requireMobileCustomer` | Farmer-owned request detail. |
| `GET` | `/api/mobile/ai-services/requests/[id]/record` | Customer **or** technician actor | JSON record when **COMPLETED** and viewer allowed. |

`src/lib/mobile-ai-services/ai-services-service.ts` — `serializeAiServiceRecord`, **`declineReason`** on **`serializeAiServiceRequest`**, **`getMyAiServiceRequestById`**.

### Mobile (`pranidoctor_mobile`)

- **Technician:** `AiTechnicianRequestsListScreen`, `AiTechnicianRequestDetailScreen`, `AiTechnicianRequestCompleteScreen`; dashboard link **কাজের অনুরোধ**; `AiTechnicianRepository` job methods; `aiTechnicianJobRequestsForTabProvider` / detail family; `invalidateAiTechnicianJobRequestLists`.
- **Farmer:** `AiFarmerMyRequestDetailScreen`, list → detail navigation; shared **`AiDigitalServiceRecordViewScreen`** (“ডিজিটাল এআই সার্ভিস রেকর্ড”); repository **`getMyRequest`**, **`fetchServiceRecord`**.
- **Routes:** `/profile/ai-technician/requests`, `…/:requestId`, `…/complete`, `…/record`; `/ai-services/my-requests/:requestId`, `…/record`.

### Status transitions (technician)

`PENDING` → (`accept`) → `ACCEPTED` → `ON_THE_WAY` → `ARRIVED` → `IN_PROGRESS` → (`complete`) → `COMPLETED`. Pool **`PENDING`**: accept / decline. **`DECLINED`** / **`CANCELLED`**: read-only.

### Known limitations

- **List pagination:** Technician list applies area filter after a capped DB scan (**`truncated`** flag when ≥ 400 rows); prefer tabs/filters in heavy areas.
- **Pool decline:** Technician declining an unassigned **PENDING** request marks it **DECLINED** for all (product choice for MVP).
- **DB:** Apply migration **`20260510183000_ai_service_request_decline_reason`** in each environment.

### Verify locally

`npm run typecheck`, `npm run build`, `npm test`; `dart format lib`, `flutter analyze`, `flutter test`.

---

## COMMAND 09 — Reviews, complaints, follow-up visibility & quality control (completed)

**Date:** 2026-05-10

### Backend (`pranidoctor-web`)

| Item | Notes |
|------|--------|
| `prisma/schema.prisma` | Models **`AiTechnicianReview`**, **`AiTechnicianComplaint`**; enums for review visibility & complaint status. |
| `prisma/migrations/20260510210000_ai_technician_quality_tables/` | Tables for native AI quality control. |
| `src/lib/mobile-ai-services/ai-quality-service.ts` | Create review/complaint (customer), module rating bundle, admin list & status update. |
| `src/lib/mobile-ai-services/ai-quality-schemas.ts` | Zod bodies/queries. |
| `src/lib/mobile-ai-services/ai-services-service.ts` | **`getMyAiServiceRequestById`** adds **`hasAiReview`**; public rating merge with legacy approved **`Review`** where applicable. |
| `src/lib/mobile-ai-technician/dashboard-service.ts` | Dashboard **`recentReviews`** (module reviews only). |

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/mobile/ai-services/requests/[id]/review` | `requireMobileCustomer` | One **VISIBLE** review per **COMPLETED** request with technician; rating 1–5, optional comment. |
| `GET` | `/api/mobile/ai-technician/reviews` | Technician actor | Technician’s own review summary (MVP). |
| `POST` | `/api/mobile/ai-services/requests/[id]/complaint` | Customer | Complaint for own request; requires **technician** on request. |
| `GET` | `/api/admin/ai-technician-complaints` | Admin | Paginated complaint list + technician display name. |
| `POST` | `/api/admin/ai-technician-complaints/[id]/status` | Admin | Set status (`OPEN` / `UNDER_REVIEW` / `RESOLVED` / `REJECTED`) + optional **`adminNote`**. |

**Rules:** Averages for the module path use **`AiTechnicianReview.visibility === VISIBLE`** only; native **`AiTechnicianReview`** is authoritative per **`AiServiceRequest`** (no duplicate legacy row for that flow). **No** new scheduled pregnancy notifications (existing **`Notification`** model unchanged).

### Admin (`pranidoctor-web`)

- Nav: **`এআই অভিযোগ`** → `/admin/ai-technician-complaints` (`admin-nav.tsx`).
- Page: `src/app/admin/(dashboard)/ai-technician-complaints/page.tsx` + **`AiTechnicianComplaintsAdmin`**: filter tabs, table, row selection, status/note update, link to **`/admin/ai-technicians/[id]`**.

### Mobile (`pranidoctor_mobile`)

- **Farmer:** `AiFarmerMyRequestDetailScreen` — **সমস্যা জানান** (if technician assigned), **সেবার রিভিউ দিন** when **COMPLETED** and **`hasAiReview` ≠ true**; **`AiFarmerRequestReviewScreen`**, **`AiFarmerRequestComplaintScreen`**; repository **`submitTechnicianReview`** / **`submitTechnicianComplaint`**; routes under **`/ai-services/my-requests/:requestId/review`** and **`…/complaint`**.
- **Technician:** `AiTechnicianDashboardScreen` — **সাম্প্রতিক রিভিউ** from **`recentReviews`**; models **`AiTechnicianReviewSnippet`** + **`AiTechnicianDashboardData.recentReviews`**.
- **Record:** `AiDigitalServiceRecordViewScreen` — highlighted **পরবর্তী পর্যবেক্ষণ** card for follow-up & pregnancy check dates when present.

### Known limitations (MVP)

- **`GET /api/mobile/ai-technician/reviews`** is minimal (technician-facing aggregate/list as implemented); farmer list does not expose **`hasAiReview`** (detail only).
- **Admin** complaint UI is a single list + inline panel (no separate complaint permalink).
- **Pregnancy reminder** is display-only on the digital record; no new push/cron.

### Verify locally

`npm run typecheck`, `npm run build`, `npm test`; `dart format lib`, `flutter analyze`, `flutter test`.

---

## COMMAND 10 — Final QA, security, documentation & git preparation (completed)

**Date:** 2026-05-10

### Documentation added/updated

| File | Purpose |
|------|---------|
| [`docs/AI_TECHNICIAN_API.md`](./AI_TECHNICIAN_API.md) | Flow overview, grouped **mobile** + **admin** route table, models summary, status transitions, errors, limitations. |
| [`docs/AI_TECHNICIAN_QA_CHECKLIST.md`](./AI_TECHNICIAN_QA_CHECKLIST.md) | Manual E2E list, **security checklist** with code anchors, UI/backend/mobile commands, regression matrix, future work. |
| This file | Links to the above; COMMAND 10 closure. |

### Security review (summary)

| Topic | Result |
|--------|--------|
| Self-approve / self-publish | Admin transitions require **`requireAdminApiActor`**; not callable with mobile-only JWT. |
| Cross-user application | Mobile AI technician routes resolve profile by **`userId`** from token. |
| Cross-technician jobs | **`requestVisibleToTechnician`** + assignee checks on accept/status/complete. |
| Cross-farmer requests | **`customerUserId`** filter on farmer AI service request APIs. |
| Documents on public profile | Public **`getAiServiceTechnicianPublic`** omits document payloads. |
| Unpublished listing | **`publishedTechnicianBaseWhere`** = **PUBLISHED** + **ACTIVE** provider + active **User**. |
| Admin surface | **`requireAdminPanelApiAccess`** / **`requireAdminApiActor`** on AI admin JSON routes. |
| Status / completion | Strict technician status chain; **`ALREADY_COMPLETED`** if record exists. |
| Negative price | Zod **`nonnegative`** / safe string pattern on complete body **`totalFee`**. |

### UI review (summary)

Flutter AI farmer + technician flows use shared **Prani** widgets (`PraniScaffold`, cards, buttons, loading). Bengali-first copy on review/complaint/record/dashboard. Residual risk: long text on very small screens — treat as ongoing manual device QA.

### Commands run (reference)

**Web:** `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, `npx prisma generate`, `npx prisma validate`, `npx prisma migrate status` (last: reports **pending** migrations until `prisma migrate dev` / `deploy` is run on that database).  
**Mobile:** `dart format .`, `flutter analyze`, `flutter test`, `flutter build apk --debug`.

### Git hygiene

Before commit: **`git status`**, ensure **`.env`**, **`node_modules`**, build outputs (e.g. `.next/`, `build/`, `dist/`), and secrets are **not** staged. Use **`git add -p`** for large diffs.

---

NEXT COMMAND: COMPLETED — AI Technician MVP Module Ready for Manual QA
