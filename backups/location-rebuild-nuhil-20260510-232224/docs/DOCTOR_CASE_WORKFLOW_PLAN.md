# Doctor case workflow — audit & implementation plan

**Project:** Prani Doctor / Animal Doctors ([pranidoctor.com](https://pranidoctor.com/))  
**Repo:** [github.com/balagpetcare/pranidoctor-web](https://github.com/balagpetcare/pranidoctor-web)  
**Task card:** 12 — Doctor case workflow (accept, treatment, prescription)  
**Last updated:** 2026-05-09 (integration audit: Task Card 12 parts 1–4 + admin assign UI + shared provider list-tab helper)

This document records a **read-only audit** of `pranidoctor-web` and a **forward plan** for the doctor case lifecycle. It is scoped to this repository only.

---

## 0. Implementation status (Task Card 12 — parts 1–4)

**Shipped in code:**

| Area | Details |
|------|---------|
| **Doctor panel auth** | Cookie **`prani_doctor_session`** (JWT HS256, claim `role: "DOCTOR"`). Secret: **`DOCTOR_JWT_SECRET`** (preferred) or **`AUTH_SECRET`** (min 32 chars). Edge **`middleware.ts`** protects `/doctor` HTML routes except `/doctor/login`. SSR **`ensureDoctorDashboardAccess()`** clears bad cookies and redirects — mirrors admin layering. |
| **List API** | `GET /api/doctor/service-requests` with **`tab`** = `new` / `active` / `completed`, **`limit`**, **`offset`**. |
| **Dispatch (admin)** | **`POST /api/admin/service-requests/[id]/assign-doctor`** and **`POST .../assign-technician`** — set **`assignedDoctorId`** / **`assignedTechnicianId`**, **`assignedAt`**, **`status = ASSIGNED`** from **`PENDING`** (see **`docs/REQUEST_ASSIGNMENT_PLAN.md`** §0). |
| **Detail & actions** | `GET /api/doctor/service-requests/[id]` — scoped by **`assignedDoctorId`**, includes **`treatments`** and **`prescriptions`** for this doctor on that case. **`POST .../accept`** — **`ASSIGNED` → `ACCEPTED`**. **`POST .../reject`** — optional **`{ reason?: string }`**; **`ASSIGNED`** or **`ACCEPTED` → `REJECTED`**; reason on **`cancelReason`** with prefix **`Doctor rejected:`**. **`POST .../complete`** — from **`ASSIGNED`**, **`ACCEPTED`**, or **`IN_PROGRESS`** to **`COMPLETED`**; sets **`completedAt`**; requires **≥ 1** **`TreatmentCase`** (**`FINALIZED`**) for this **`doctorId`** on the request; idempotent if already **`COMPLETED`** (**`meta.alreadyCompleted`**). **`422`** **`TREATMENT_REQUIRED`** if no finalized treatment by this doctor. |
| **Clinical write APIs** | **`POST /api/doctor/service-requests/[id]/treatment-cases`** — creates **`TreatmentCase`** (**`FINALIZED`**) with existing text fields; at least one clinical field required (zod). **`POST .../prescriptions`** — creates **`Prescription`** (**`ACTIVE`**) + **`PrescriptionItem`** rows; **`frequency`** / per-line **`note`** merged into each item’s **`instruction`** string; optional header **`instructions`**, **`validUntil`**. Allowed only when request status ∈ **`{ ASSIGNED, ACCEPTED, IN_PROGRESS }`** and **`assignedDoctorId`** matches session. |
| **Other auth APIs** | `POST /api/doctor/auth/login`, `POST /api/doctor/auth/logout`, `GET /api/doctor/auth/me`. |
| **Pages** | `/doctor/login`, `/doctor`, `/doctor/requests/*`, **`DoctorCaseDetailPanel`** + **`DoctorCaseClinicalSection`** (lists + forms; **Complete case** with confirm dialog; completed banner + **`completedAt`**). |
| **List filtering** | **new:** `ASSIGNED`, `ACCEPTED`; **active:** `IN_PROGRESS`; **completed:** `COMPLETED` — all scoped with **`assignedDoctorId = currentDoctorProfileId`**. |

**Not yet implemented:** **`ACCEPTED` → `IN_PROGRESS`** with **`startedAt`** (explicit “start visit” handoff), **edit/void** prescription, **DRAFT** treatment workflow.

**Integration (manual QA):** Customer or seed → **`PENDING`** → admin assigns doctor (**`POST /api/admin/service-requests/[id]/assign-doctor`**) → **`ASSIGNED`** → doctor sees request (**`/doctor/requests/new`**) → accept (**`ACCEPTED`**) → treatment + prescription → complete (**`COMPLETED`**, **`completedAt`**) → admin detail reflects new status. Technician path: **`POST .../assign-technician`** + **`/api/technician/service-requests`** (API-only panel; no `/technician` HTML shell yet).

### 0.1 Note on §1–§2 (historical audit)

Sections **§1** (schema findings) and **§2** (file inventory) mix **pre-shipment** audit text with the current tree. **§0** and the integration note above are the **authoritative** description of what is shipped today.

---

**Repo / tooling note:** `tsconfig.json` **no longer includes** `.next/dev/types/**/*.ts` so `tsc --noEmit` does not pull stale dev-only route validators that conflict with `.next/types` after route changes. Run **`next dev`** or **`next build`** to refresh generated types when adding routes.

**Prisma:** No schema migration for parts 1–4 (uses existing **`completedAt`** on **`ServiceRequest`**).

**Client bundle:** Clinical status allow-list lives in **`clinical-constants.ts`** (no Prisma import in client-only paths) so doctor UI does not pull **`pg`** into the browser.

---
## 1. Current findings

### 1.1 Prisma schema — audited models

| Model | Location | Summary |
|--------|-----------|---------|
| **`User`** | `prisma/schema.prisma` | `id`, `email` (unique), `phone?`, `passwordHash`, `role` (`UserRole`), `status` (`UserStatus`), timestamps. Relations: optional `adminProfile`, `doctorProfile`, `customerProfile`, `aiTechnicianProfile`, etc. **`UserRole` includes `DOCTOR`.** |
| **`DoctorProfile`** | same | One-to-one with `User` via `userId`. Operational fields include `displayName`, `licenseNumber`, `degree`, `specialization`, `experienceYears`, `bio`, `profilePhotoUrl`, `visitFeeBdt`, `acceptsEmergency`, `acceptsOnlineConsultation`, `providerStatus` (`ProviderStatus`), `verifiedAt`. Relations: **`assignedRequests`** → `ServiceRequest[]`, **`treatmentCases`**, **`prescriptions`**, areas/categories, billing, reviews, complaints. |
| **`ServiceRequest`** | same | Links `customerId`, `animalId`, `serviceCategoryId`, optional `areaId` / `villageId`, **`assignedDoctorId`**, **`assignedTechnicianId`** (DB column mapped as `assignedAiTechnicianId`), **`status`** (`ServiceRequestStatus`, default `PENDING`), scheduling and symptom fields, `isEmergency`, lifecycle timestamps (`submittedAt`, `assignedAt`, `startedAt`, `cancelledAt`, `completedAt`, etc.). Indexes include **`[assignedDoctorId, status]`**. |
| **`TreatmentCase`** | same | **Logical “treatment record”**: Prisma model name `TreatmentCase` with **`@@map("TreatmentRecord")`** to preserve the existing PostgreSQL table. Fields: `serviceRequestId`, `animalId`, optional `doctorId` / `aiTechnicianId`, **`status`** (`TreatmentCaseStatus`: `DRAFT`, `FINALIZED`, `CANCELLED`), clinical text fields (`chiefComplaint`, `symptoms`, `diagnosis`, `procedures`, `treatmentNotes`, `followUpNotes`, `followUpDate`), `recordedAt`. **Many rows can exist per service request** (no unique constraint on `serviceRequestId`). |
| **`Prescription`** | same | `serviceRequestId`, `animalId`, optional `doctorId` / `aiTechnicianId`, **`status`** (`PrescriptionStatus`: `ACTIVE`, `VOIDED`), `instructions`, `validUntil`, **`items`** (`PrescriptionItem[]`). |
| **`PrescriptionItem`** | same | Child of `Prescription`: `medicineName`, `dosage`, `duration`, `instruction`, `quantity`. |
| **`AnimalProfile`** | same | Owned by `customerId` → `CustomerProfile`; linked from requests/treatments/prescriptions. |
| **`CustomerProfile`** | same | Owned by `userId` → `User`; `displayName`, optional `addressJson`, relations to animals and **`serviceRequests`**. |

**Enums already aligned with the task’s suggested request lifecycle (no rename required):**

- **`ServiceRequestStatus`:** `PENDING`, `ACCEPTED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REJECTED` (see `prisma/schema.prisma` and migration `20260509120000_service_request_booking_enums_fields`).
- **`TreatmentCaseStatus`:** `DRAFT`, `FINALIZED`, `CANCELLED` — **orthogonal** to `ServiceRequestStatus`; finalize treatment documentation here while driving high-level case state on `ServiceRequest`.
- **`PrescriptionStatus`:** `ACTIVE`, `VOIDED`.

### 1.2 Auth / session / JWT / middleware

| Concern | Finding |
|---------|---------|
| **Admin panel** | **JWT (HS256, `jose`)** in httpOnly cookie **`prani_admin_session`**; Edge **`src/middleware.ts`** protects **`/admin`** HTML routes only; **`verifyAdminToken`** allows roles `ADMIN` \| `SUPER_ADMIN`. APIs use **`requireAdminPanelApiAccess()`** → **`resolveAdminPanelActor`** (must have `AdminProfile`, active admin role). See `src/lib/admin-auth/*`, `docs/ADMIN_AUTH_PLAN.md`. |
| **Mobile customer API** | **`Authorization: Bearer`** JWT with audience **`mobile`**, claim **`role: "CUSTOMER"`**; **`requireMobileCustomer`** in `src/lib/mobile-auth/guard.ts` loads `User` + `customerProfile` and enforces active customer. Implemented in **`signMobileCustomerToken` / `verifyMobileJwt`** (`src/lib/mobile-auth/jwt.ts`). |
| **Doctor / provider API** | **Implemented:** cookie **`prani_doctor_session`**, **`requireDoctorApiActor()`**, **`/api/doctor/auth/*`**, **`/api/doctor/service-requests`** (list/detail/accept/reject/complete/clinical). See **`src/lib/doctor-auth/*`**, **`src/lib/doctor-service-requests/*`**. |
| **Middleware scope** | **`src/middleware.ts`** matcher includes **`/admin`** and **`/doctor`** HTML routes (not **`/api/*`**). |

### 1.3 Routes, pages, API handlers, services, utilities

| Area | Finding |
|------|---------|
| **Admin service requests** | **`GET`** list/detail + **`POST .../assign-doctor`** / **`assign-technician`** (`src/lib/admin-service-requests/*`). UI: **`ServiceRequestsList`**, **`ServiceRequestDetailPanel`**, **`ServiceRequestAssignmentActions`**. |
| **Mobile service requests** | `src/lib/mobile-service-requests/service-request-service.ts`: **create** (always **`PENDING`**), **list/get** for owning customer, **cancel** → `CANCELLED` with rules in **`CUSTOMER_CANCELLABLE_STATUSES`** (`PENDING`, `ACCEPTED`, `ASSIGNED` only — not `IN_PROGRESS`). APIs under `/api/mobile/service-requests`. |
| **Doctor management (admin)** | Full CRUD/moderation under `/api/admin/doctors/**` and pages under `/admin/doctors/**` (see `docs/DOCTOR_MANAGEMENT_PLAN.md`). **Separate from** “doctor treating a case” workflow. |
| **Customer / doctor “apps”** | **Doctor panel** exists: **`/doctor/login`**, **`/doctor/requests/*`**, middleware for **`/doctor`**. Customer mobile APIs under **`/api/mobile/*`**. |
| **Mobile auth HTTP** | **`signMobileCustomerToken`** exists but **no `POST /api/mobile/auth/login`** (or similar) is present in-repo; other docs (`docs/ANIMAL_PROFILE_PLAN.md`) already note tokens must be minted server-side or via a future route. Same gap applies to any future **doctor** token unless added. |

### 1.4 Request status enum / lifecycle (code vs schema)

- **Schema** supports the full **`ServiceRequestStatus`** set listed in §1.1.
- **Application code** drives **`PENDING`** (create), **`CANCELLED`** (customer cancel), **`ASSIGNED`** (admin assign), **`ACCEPTED`/`REJECTED`/`COMPLETED`** (doctor), **`IN_PROGRESS`** (reserved / future), plus clinical writes — see **`docs/REQUEST_ASSIGNMENT_PLAN.md`** §1.7 for the combined table.

### 1.5 Treatment and prescription code

| Item | Finding |
|------|---------|
| **`TreatmentCase` / `Prescription` CRUD (doctor)** | **Implemented** under **`/api/doctor/service-requests/[id]/treatment-cases`** and **`.../prescriptions`** (doctor-scoped). Admin read-only for requests. |
| **Metrics only** | `src/app/admin/(dashboard)/_lib/dashboard-stats.ts` counts **`treatmentCase`** rows with **`TreatmentCaseStatus.FINALIZED`** for “completed treatments” on the admin dashboard. |
| **Relations** | Schema correctly links treatments and prescriptions to **`serviceRequest`**, **`animal`**, and optional **`doctor`**, supporting a doctor-led workflow once APIs exist. |

---

## 2. Existing files and gaps

### 2.1 Key existing files (reference for implementers)

| Path | Role |
|------|------|
| `prisma/schema.prisma` | Source of truth for models/enums above |
| `src/lib/mobile-service-requests/service-request-service.ts` | Customer create/list/get/cancel |
| `src/lib/mobile-service-requests/service-request-mapper.ts` | DTO mapping, `CUSTOMER_CANCELLABLE_STATUSES`, includes `assignedDoctor` |
| `src/lib/admin-service-requests/service-request-admin-service.ts` | Admin list/get for requests |
| `src/lib/admin-service-requests/service-request-assignment-service.ts` | **`assignDoctorToServiceRequest`** / **`assignTechnicianToServiceRequest`** (admin assign rules) |
| `src/lib/admin-service-requests/schemas.ts` | Zod for admin list query |
| `src/lib/mobile-auth/guard.ts`, `jwt.ts` | Customer-only Bearer guard |
| `src/lib/admin-auth/api-guard.ts`, `jwt.ts`, `panel-access.ts` | Admin panel guard |
| `src/middleware.ts` | **`/admin`** and **`/doctor`** HTML routes (not **`/api/*`**); **`/technician`** deferred |
| `src/components/admin/service-requests/*` | List, detail, **`ServiceRequestAssignmentActions`** (assign doctor / technician) |
| `docs/DOCTOR_MANAGEMENT_PLAN.md` | Onboarding/admin doctor lifecycle (related but distinct) |
| `docs/ADMIN_AUTH_PLAN.md` | Admin security model |

### 2.2 Historical gaps (Task Card 12 — largely resolved)

The numbered gaps below were **blocking** before implementation; they are **addressed in code** as of the **§0** status table (doctor auth + APIs + UI, admin assign APIs + UI, complete case, clinical writes). **Still recommended:** explicit **`ACCEPTED` → `IN_PROGRESS`** + **`startedAt`**, richer state-machine docs in code comments, edit/void prescription, DRAFT treatment workflow.

---

## 3. Proposed doctor case workflow (product-level)

This flow **reuses existing enum values** and maps them to clear responsibilities.

1. **Customer submits request** — already: `ServiceRequest` **`PENDING`**, `assignedDoctorId` typically null until dispatch.
2. **Admin assigns doctor (recommended for MVP)** — set `assignedDoctorId`, set **`assignedAt`**, move status to **`ASSIGNED`** (or **`ACCEPTED`** if business treats assignment as implicit acceptance; see §7).
3. **Doctor opens “new requests”** — list requests where **`assignedDoctorId` = current `DoctorProfile.id`** and status in **`{ ASSIGNED, ACCEPTED }`** (or **`PENDING`** if using an “eligible pool” model without assignment first — **not recommended** without extra anti-gaming rules).
4. **Doctor accepts** — transition to **`IN_PROGRESS`** (or **`ACCEPTED` → `IN_PROGRESS`** if you use both); set **`startedAt`** when work actually begins if not set at accept.
5. **Doctor documents treatment** — create/update **`TreatmentCase`** in **`DRAFT`**, then **`FINALIZED`** when clinical note is complete (multiple drafts acceptable per schema; product may enforce “one open draft” in application logic).
6. **Doctor creates prescription** — create **`Prescription`** + **`PrescriptionItem`** rows with `doctorId` set; status **`ACTIVE`**.
7. **Doctor completes case** — `ServiceRequest` → **`COMPLETED`**, set **`completedAt`**; ensure related **`TreatmentCase`** expectations are met (e.g. at least one **`FINALIZED`** record — product choice).
8. **Doctor rejects** — if the doctor declines before or after accepting: set **`REJECTED`** (and optionally clear `assignedDoctorId` vs retain for audit — **product/legal** choice); capture reason (reuse **`cancelReason`** or add a dedicated field — see §4).

**Parallel:** Customer **`CANCELLED`** remains valid per existing customer cancel rules; extend if **`IN_PROGRESS`** cancellation should be allowed from the app.

---

## 4. Required database / schema changes (if any)

**None are strictly mandatory** for an MVP if you reuse:

- `ServiceRequest.status`, `assignedDoctorId`, `assignedAt`, `startedAt`, `completedAt`, `cancelReason`
- `TreatmentCase` + `TreatmentCaseStatus`
- `Prescription` + `PrescriptionItem` + `PrescriptionStatus`

**Optional / recommended (evaluate during implementation):**

| Change | Rationale |
|--------|-----------|
| **`rejectReason` / `doctorDeclineReason`** on `ServiceRequest` | Avoid overloading **`cancelReason`** (customer vs doctor semantics). |
| **Partial unique constraint** (e.g. one **`DRAFT`** treatment per request per doctor) | Only if product wants a single open chart; otherwise keep flexible many-rows model. |
| **Audit table** | Trace accept/reject/assign for support and security reviews. |

Avoid renaming **`ServiceRequestStatus`** or **`TreatmentRecord`** table mapping unless there is a strong migration reason.

---

## 5. Required API endpoints

All doctor endpoints must run behind **doctor auth** (§8) and return **`jsonOk` / `jsonError`** consistent with `src/lib/api-response.ts`.

| # | Endpoint (suggested) | Method | Purpose |
|---|-------------------|--------|---------|
| 1 | `/api/doctor/service-requests` | `GET` | **Doctor request list** — filter by tab: new (`ASSIGNED`/`ACCEPTED`), in progress, completed; pagination; strict doctor scope. |
| 2 | `/api/doctor/service-requests/[id]` | `GET` | **Doctor request detail** — includes animal summary, customer contact policy (see privacy note below), category, status, existing treatments/prescriptions. |
| 3 | `/api/doctor/service-requests/[id]/accept` | `POST` | **Accept request** — valid from **`ASSIGNED`** (or product-defined); sets status toward **`IN_PROGRESS`** or **`ACCEPTED`** per §7; sets timestamps. |
| 4 | `/api/doctor/service-requests/[id]/reject` | `POST` | **Reject request** — body: reason; sets **`REJECTED`** with rules in §3. |
| 5 | `/api/doctor/service-requests/[id]/treatment-cases` | `POST` (and optionally `PATCH` for draft edits) | **Create treatment record** — creates `TreatmentCase` with `doctorId`, `animalId` from request. |
| 6 | `/api/doctor/service-requests/[id]/prescriptions` | `POST` | **Create prescription** — nested items; `doctorId` + `animalId` + `serviceRequestId`. |
| 7 | `/api/doctor/service-requests/[id]/complete` | `POST` | **Complete case** — `COMPLETED` + `completedAt`; validate prerequisites (e.g. finalized treatment). |

**Admin companion (if not already planned elsewhere):**

| Endpoint | Purpose |
|----------|---------|
| `PATCH` or `POST` `/api/admin/service-requests/[id]/assign-doctor` | Set `assignedDoctorId`, `assignedAt`, status to **`ASSIGNED`** (keeps doctor-only APIs from self-assigning unless product allows). |

**Privacy note:** Customer PII on detail responses should follow policy (mask phone/email for doctors vs full for admin).

---

## 6. Required doctor panel pages (Next.js app)

Assume route group **`/doctor`** (names are suggestions).

| Page | Purpose |
|------|---------|
| **`/doctor/login`** | Doctor credentials → session (cookie JWT mirroring admin **or** Bearer-only SPA — pick one stack-wide). **Currently missing.** |
| **`/doctor` (layout)** | Protected shell + nav; middleware matcher addition parallel to `/admin`. **Currently missing.** |
| **`/doctor/requests/new`** | **New requests** — list assigned/eligible **`ASSIGNED`/`ACCEPTED`**. |
| **`/doctor/requests/active`** | **Accepted / in progress** — filter `IN_PROGRESS` (and optionally `ACCEPTED` if used as a holding state). |
| **`/doctor/requests/[id]`** | **Case detail** — read-only overview + CTAs (accept/reject/complete) + links to forms. |
| **Treatment form** | Either embedded on case detail or **`/doctor/requests/[id]/treatment`** — creates/updates **`TreatmentCase`**. |
| **Prescription form** | **`/doctor/requests/[id]/prescription/new`** — posts prescription + items. |
| **Complete case action** | Button on case detail calling **`POST .../complete`** with confirmation. |

Reuse admin UX patterns where sensible: `adminFetch` / `readAdminJson` equivalents for doctor session (`credentials: "same-origin"` if cookie-based).

---

## 7. Status lifecycle suggestion

**Use existing `ServiceRequestStatus` values** (already in schema):

| State | Meaning |
|-------|---------|
| **`PENDING`** | Submitted; may be unassigned or awaiting admin/dispatch. |
| **`ACCEPTED`** | Optional intermediate: doctor or platform acknowledged but visit not started (use only if product needs it; otherwise skip). |
| **`ASSIGNED`** | Doctor (or technician) chosen; doctor should see this in “new.” |
| **`IN_PROGRESS`** | Doctor accepted / actively treating. |
| **`COMPLETED`** | Case closed successfully; **`completedAt`** set. |
| **`REJECTED`** | Declined by doctor or platform (define who can set — likely doctor reject + admin override). |
| **`CANCELLED`** | Customer or system cancellation (existing customer path). |

**`TreatmentCaseStatus`:** use **`DRAFT`** while editing notes; **`FINALIZED`** when submitted as the official record for that episode.

**Clarify in implementation:** Whether **`ACCEPTED`** is redundant with **`ASSIGNED`** for doctor visits. Pick **one primary path** to reduce UI confusion; the enum can keep both values for backward compatibility.

---

## 8. Security rules

1. **Doctor isolation:** Every Prisma query for case data must include **`where: { id, assignedDoctorId: doctorProfileId }`** (or explicit admin/service-desk role exception). **Never** accept `doctorId` from the client body for authorization — derive from session.
2. **Eligible vs assigned:** If “open pool” **`PENDING`** requests are listed to doctors, require **non-spoofable eligibility** (e.g. area + category match) and **atomic claim** (transaction: only one doctor wins) to prevent double-accept. **Prefer admin `ASSIGNED` for MVP.**
3. **No cross-doctor access:** Return **404** (not 403) for non-owned request IDs to avoid leaking existence, unless product mandates 403.
4. **Admin-only actions remain admin-only:** Doctor APIs must **not** call `requireAdminPanelApiAccess`; admin assign/list stays under `/api/admin/*` with existing guard.
5. **Provider status gate:** Reject doctor session or API access if **`User.status !== ACTIVE`** or **`DoctorProfile.providerStatus`** is not suitable (typically **`ACTIVE`** for production care).
6. **Separate JWT secrets / cookies:** Do **not** reuse admin JWT for doctors; use a distinct cookie name or Bearer issuer/audience claim (e.g. `aud: "doctor"`) to prevent token confusion.
7. **CSRF:** If using cookie sessions for doctor panel same as admin, follow same-site patterns documented in `docs/ADMIN_AUTH_PLAN.md` for mutating requests.

---

## 9. Step-by-step implementation checklist

1. **Product decision:** Single-step vs two-step (`ASSIGNED` then accept → `IN_PROGRESS`); who assigns doctors (admin only vs self-claim).
2. **Add doctor auth module:** e.g. `src/lib/doctor-auth/` — JWT sign/verify, session cookie name, `resolveDoctorActor` (user + `doctorProfile`), `requireDoctorApiAccess` for route handlers.
3. **Extend middleware:** protect `/doctor` pages (mirror `src/middleware.ts` admin pattern) + login exception.
4. **Dashboard layout guard:** `ensureDoctorDashboardAccess()` analogous to `ensureAdminDashboardAccess()` for SSR shell safety.
5. **Admin assign endpoint (if needed):** `POST /api/admin/service-requests/[id]/assign-doctor` + optional UI in `ServiceRequestDetailPanel` (doctor picker, status update).
6. **Prisma service layer:** `src/lib/doctor-service-requests/` — list, get, accept, reject, complete with zod schemas and explicit state preconditions.
7. **Treatment service:** create/finalize `TreatmentCase` rows scoped to doctor + request.
8. **Prescription service:** create `Prescription` + nested `PrescriptionItem` rows.
9. **Route handlers:** wire `src/app/api/doctor/**/route.ts` to services + guards.
10. **Doctor UI pages:** login, lists, detail, forms; use existing Tailwind/admin patterns.
11. **Customer mobile impact:** decide if mobile app should show **`IN_PROGRESS`** / prescription summaries — may require read-only customer APIs (separate small card).
12. **Notifications (optional):** hook accept/complete to `Notification` model later.

---

## 10. Test / build / lint checklist

From `package.json` scripts:

| Command | When |
|---------|------|
| **`npm run lint`** | After TypeScript/React changes |
| **`npm run typecheck`** | After new modules or Prisma client usage |
| **`npm run build`** | Before merge; catches Next.js route/config issues |
| **`npm test`** | Add **vitest** unit tests for pure helpers (JWT classification, state transition guards, zod parsers) mirroring `docs/ADMIN_AUTH_PLAN.md` / existing admin patterns |
| **`npx prisma validate`** | After any schema edit |
| **`npm run db:migrate`** (or CI migrate) | When schema changes ship |

**Manual QA (doctor flow):**

- Doctor A cannot open Doctor B’s request URL (404/403).
- Unauthenticated doctor API → **401**.
- Suspended doctor / rejected provider → **403** on doctor APIs.
- Happy path: assign → list → detail → accept → treatment draft → finalize → prescription → complete.
- Customer cancel while `IN_PROGRESS` behaves as defined (today cancel API **rejects** `IN_PROGRESS`; confirm product expectation).

---

## Appendix — quick reference: enum values (schema)

**`ServiceRequestStatus`:** `PENDING`, `ACCEPTED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REJECTED`  
**`TreatmentCaseStatus`:** `DRAFT`, `FINALIZED`, `CANCELLED`  
**`PrescriptionStatus`:** `ACTIVE`, `VOIDED`

---

## Document history

| Date | Author / role | Change |
|------|----------------|--------|
| 2026-05-09 | Task Card 12 audit | Initial plan from repository scan |
