# AI Technician module — HTTP API reference

**Project:** Prani Doctor / Animal Doctors (`pranidoctor-web`)  
**Base URL (mobile):** `/api/mobile/…` — Bearer JWT (OTP session), JSON `{ ok, data | error }`.  
**Base URL (admin):** `/api/admin/…` — admin session / cookie per `requireAdminPanelApiAccess` / `requireAdminApiActor` where noted.

Canonical narrative and delivery history: [`AI_TECHNICIAN_IMPLEMENTATION_PLAN.md`](./AI_TECHNICIAN_IMPLEMENTATION_PLAN.md). Manual QA: [`AI_TECHNICIAN_QA_CHECKLIST.md`](./AI_TECHNICIAN_QA_CHECKLIST.md).

---

## 1. Flow overview (API order of use)

1. **Customer** logs in (same mobile auth as rest of app).  
2. **Become technician:** `POST /api/mobile/ai-technician/apply` → draft profile; `POST …/documents` → NID etc.; `POST …/service-areas` → division coverage; `POST …/services` → gigs; `PATCH …/settings` if needed; `POST …/submit` → admin queue.  
3. **Admin** lists applications → `GET /api/admin/ai-technician-applications` → detail `GET …/[id]` → transitions `POST …/[id]/transition` (actor id stored). Optional legacy admin CRUD under `/api/admin/ai-technicians/*`.  
4. **Published technician:** `GET /api/mobile/ai-technician/dashboard`, services CRUD, job list `GET …/requests`, lifecycle `POST …/accept|decline|status|complete`.  
5. **Farmer (customer):** `GET /api/mobile/ai-services/technicians` (area) → `GET …/technicians/[id]` → `POST /api/mobile/ai-services/requests` → `GET …/requests/me` & `GET …/requests/[id]` → when **COMPLETED**, `GET …/record`, `POST …/review`, `POST …/complaint`.

---

## 2. Mobile — farmer / public AI services (`/api/mobile/ai-services/`)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/api/mobile/ai-services/technicians` | None | Area + optional filters; only **PUBLISHED** + **ACTIVE** provider + ≥1 **ACTIVE** service. |
| `GET` | `/api/mobile/ai-services/technicians/[id]` | None | Public profile payload; **no** NID/document URLs. |
| `POST` | `/api/mobile/ai-services/requests` | Customer | Creates **`AiServiceRequest`**. |
| `GET` | `/api/mobile/ai-services/requests/me` | Customer | Own history (`customerUserId`). |
| `GET` | `/api/mobile/ai-services/requests/[id]` | Customer | Single owned request; includes **`hasAiReview`** when applicable. |
| `GET` | `/api/mobile/ai-services/requests/[id]/record` | Customer **or** technician actor | Digital **`AiServiceRecord`** when request **COMPLETED** and viewer allowed. |
| `POST` | `/api/mobile/ai-services/requests/[id]/review` | Customer | One review per completed native request; see quality schemas. |
| `POST` | `/api/mobile/ai-services/requests/[id]/complaint` | Customer | Complaint tied to own request; technician must be assigned. |

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
| `GET` | `/api/mobile/ai-technician/services` | Module user | |
| `POST` | `/api/mobile/ai-technician/services` | Module user | |
| `PATCH` | `/api/mobile/ai-technician/services/[id]` | Module user | |
| `DELETE` | `/api/mobile/ai-technician/services/[id]` | Module user | |
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
