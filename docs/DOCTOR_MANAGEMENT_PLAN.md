# Doctor management — audit & implementation plan

**Project:** Prani Doctor / Animal Doctors ([pranidoctor.com](https://pranidoctor.com/))  
**Repo:** `pranidoctor-web`  
**Task card:** 05 — Doctor Management  
**Last updated:** 2026-05-09 (QA integration pass)

## 0. Plan adjustment (re-audit, 2026-05-09)

The **original plan** (section 4.3) assumed admin “working areas” would stay on **`DoctorServiceArea` → `Village`** only. The **product command** for Task Card 05 explicitly requires **`DoctorProfile` ↔ `Area`** many-to-many **and** **`DoctorProfile` ↔ `ServiceCategory`**.

**Adjustment:** Non-destructive schema evolution:

- **`DoctorProfileArea`** (`DoctorProfile` ↔ `Area`) — primary API for **assign working areas** (admin geography tree).
- **`DoctorProfileServiceCategory`** (`DoctorProfile` ↔ `ServiceCategory`) — category assignment.
- **`DoctorServiceArea`** (→ `Village`) — **left unchanged** for legacy/demo matching; no data dropped.

**Enums:** Existing **`ProviderStatus`** and **`UserStatus`** were retained to avoid breaking rows. User-facing labels such as PENDING / APPROVED / REJECTED / VERIFIED are exposed via API **`verificationSummary`** (string) plus raw **`providerStatus`**, **`user.status`**, and **`verifiedAt`**.

**Approve vs verify:** **`POST .../approve`** sets account + provider to active **without** automatically setting **`verifiedAt`**. **`POST .../verify`** sets **`verifiedAt` only** (license/document verification). Product may call both in sequence when needed.

---

## A. What was implemented (backend + admin UI)

### Prisma / data

- **`DoctorProfile`** extended: `displayName`, `degree`, `experienceYears`, `profilePhotoUrl`, `visitFeeBdt`, `acceptsEmergency`, `acceptsOnlineConsultation` (email/phone remain on **`User`**).
- **`DoctorProfileArea`**, **`DoctorProfileServiceCategory`** join tables with unique constraints.
- **Migration:** `20260508204007_doctor_management_fields` (applied in dev).

### Security

- All routes use **`requireAdminPanelApiAccess()`** (same pattern as `/api/admin/areas`).

### Library modules

- `src/lib/admin-doctors/schemas.ts` — zod validation.
- `src/lib/admin-doctors/doctor-admin-service.ts` — Prisma operations + JSON-safe serialization (`visitFeeBdt` as string in JSON).
- `src/lib/admin-doctors/mutation-errors.ts` — maps Prisma `P2002` and domain errors to **`jsonError`**.

### API endpoints (Route Handlers)

| Method | Path |
|--------|------|
| `GET` | `/api/admin/doctors` |
| `POST` | `/api/admin/doctors` |
| `GET` | `/api/admin/doctors/[id]` |
| `PATCH` | `/api/admin/doctors/[id]` |
| `POST` | `/api/admin/doctors/[id]/approve` |
| `POST` | `/api/admin/doctors/[id]/reject` |
| `POST` | `/api/admin/doctors/[id]/verify` |
| `POST` | `/api/admin/doctors/[id]/activate` |
| `POST` | `/api/admin/doctors/[id]/suspend` |
| `PUT` | `/api/admin/doctors/[id]/working-areas` |
| `PUT` | `/api/admin/doctors/[id]/service-categories` |
| `POST` | `/api/admin/doctors/[id]/visit-fee` |
| `POST` | `/api/admin/doctors/[id]/emergency-availability` |
| `POST` | `/api/admin/doctors/[id]/online-consultation-availability` |

### Supporting API (pickers)

| Method | Path |
|--------|------|
| `GET` | `/api/admin/service-categories` — lists categories for create/edit checklists (admin-only). |

### Admin UI (2026-05-09)

| Route | Component / notes |
|-------|-------------------|
| `/admin/doctors` | **`DoctorsList`** — searchable table, pagination, loading/error/empty states, row actions (view, edit, approve, verify, activate, reject, suspend) with **`window.confirm`** on reject/suspend. |
| `/admin/doctors/new` | **`DoctorProfileForm`** (`mode="create"`) — creates **`User`** + **`DoctorProfile`**, then **`PUT` working-areas** + **service-categories**. |
| `/admin/doctors/[id]` | **`DoctorDetailPanel`** — read-only detail + moderation buttons. |
| `/admin/doctors/[id]/edit` | **`DoctorProfileForm`** (`mode="edit"`) — **`PATCH`** profile + **`PUT`** areas/categories; copy directs approve/suspend flows to detail page. |

**Navigation:** Sidebar label **`ডাক্তার ম্যানেজমেন্ট`** / **Doctor management** (`AdminDashboardShell`).

**Shared:** `src/lib/admin/read-admin-json.ts` — response helper for admin client **`fetch`** calls.

### Known limitations (UI MVP)

- Working areas pick from **flat checklist** of up to **500** areas (no in-form search).
- **Activate / reject / suspend** are on **list + detail**, not on **edit** (edit focuses on profile + assignments).
- Profile photo is a **URL text field** / preview on detail when URL looks loadable; no upload pipeline.
- **`readAdminJson`** is centralized in **`src/lib/admin/read-admin-json.ts`** (used by **Areas** + **Doctors** client components); **`adminFetch`** (`src/lib/admin/admin-fetch.ts`) wraps **`fetch`** with **`credentials: "same-origin"`** for session reliability.

### Lint / build

- **`npm run lint`** — pass (2026-05-09, including admin UI).
- **`npm run build`** — pass (2026-05-09). Next.js emitted an existing **middleware deprecation** notice (not introduced by this task).

---

## B. Original audit & forward plan (historical context)

The sections below record the **pre-implementation** audit. Some rows are **superseded** by section 0 and A; kept for traceability.

This document captures a **read-only audit** of the current codebase and a **forward plan** for admin doctor management. ~~No feature implementation or migrations were performed as part of creating this file.~~ **Update:** Backend APIs and schema migration are now implemented per section A.

---

## 1. Current audit findings

### 1.1 Prisma schema

| Area | Finding |
|------|---------|
| **`DoctorProfile`** | Fields: `id`, `userId` (unique), `licenseNumber`, `specialization?`, `bio?`, `providerStatus` (`ProviderStatus`, default `PENDING_VERIFICATION`), `verifiedAt?`, timestamps. Indexed on `providerStatus`. Relations: `User`, `ServiceRequest[]`, `TreatmentCase[]`, `Prescription[]`, `BillingRecord[]`, **`DoctorServiceArea[]`**, `Review[]`, `Complaint[]`. |
| **`User` + roles** | `UserRole`: `ADMIN`, `CUSTOMER`, `DOCTOR`, `AI_TECHNICIAN`, `SUPPORT`, `SUPER_ADMIN`. Doctors use `role = DOCTOR` with optional one-to-one `doctorProfile`. |
| **`User.status`** | `UserStatus`: `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`, `INVITED`, `DELETED` — account-level gate (login / platform access). |
| **`ProviderStatus`** (on `DoctorProfile`) | `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `REJECTED` — provider onboarding / moderation layer. **`verifiedAt`** is nullable; set when verified. |
| **`Area`** | Hierarchical tree (`AreaType`: division → … → `SERVICE_AREA`), `name` / `nameBn`, `slug`, `isActive`, optional `parentId`. Used by `ServiceRequest.areaId` (legacy/parallel to `villageId`). **No direct FK from `DoctorProfile` to `Area`.** |
| **`Division` … `Village`** | Normalized BD geography. **`Village`** is what provider coverage joins use. |
| **`DoctorServiceArea`** | Join table: `doctorId` → `DoctorProfile`, `villageId` → `Village`, optional `priority`. **Unique `(doctorId, villageId)`**. This is the existing model for “doctor working areas” at village granularity. |
| **`ServiceCategory`** | Standalone catalog (`name`, `slug`, `description?`). Linked from **`ServiceRequest`** via `serviceCategoryId`. **There is no `DoctorProfile` ↔ `ServiceCategory` relation or join table** in the schema today. |
| **Fees / emergency / online** | **No fields** on `DoctorProfile` (or related models) for **visit fee**, **emergency availability**, or **online consultation availability**. `ServiceRequest` has `requestType` (`DOCTOR_VISIT`, `EMERGENCY`, `ONLINE_CONSULTATION`, etc.) and `isEmergency` at request level, not stored per-doctor preferences. |

**Audit conclusion (schema):** Status and verification are partially modeled via **`User.status`**, **`DoctorProfile.providerStatus`**, and **`verifiedAt`**, but operational fields required by the product card (fees, emergency/online flags, category assignment) **are absent**. Service areas for doctors are **`DoctorServiceArea` → `Village`** only; the unified **`Area`** tree is documented elsewhere as coexisting with village-based matching (`docs/AREA_SYSTEM_PLAN.md`).

### 1.2 Admin app / pages

| Item | Finding |
|------|---------|
| **Routes under `/admin`** | Dashboard, service-requests, **doctors**, customers, areas (full UI), animals, reports, prescriptions, billing, notifications, settings — several sections still use `AdminPlaceholder`. |
| **`/admin/doctors`** | **`DoctorsList`** — table, search, pagination, actions (see §A). |
| **`/admin/doctors/new`**, **`[id]`**, **`[id]/edit`** | Implemented (see §A). |
| **Admin layout** | `src/app/admin/layout.tsx` — minimal shell (background, typography). **`(dashboard)/layout.tsx`** loads Noto Sans Bengali, calls **`ensureAdminDashboardAccess()`**, wraps children in **`AdminDashboardShell`**. |
| **Navigation** | **`AdminDashboardShell`** (`src/components/admin/AdminDashboardShell.tsx`): sidebar + mobile header; nav items use **Bangla `labelBn`** as primary UI text and **`titleEn`** on links for English tooltips. **Doctors** is already listed (`href: /admin/doctors`, Stethoscope icon). |
| **Reference implementation** | **`/admin/areas`** is the closest full pattern: page header (English title + short English description), **“New area”** CTA (`rounded-lg bg-emerald-700`), client list **`AreasList`** with filters, pagination, loading/error states, `fetch('/api/admin/areas')`, redirect to login on 401. Forms: **`AreaForm`**, `areas/new`, `areas/[id]/edit`. |

### 1.3 API routes / auth / patterns

| Item | Finding |
|------|---------|
| **Doctor-specific admin APIs** | Implemented under **`/api/admin/doctors/**`** (see section A). Earlier audit noted none — **superseded**. |
| **Admin API protection** | **`requireAdminPanelApiAccess()`** (`src/lib/admin-auth/api-guard.ts`): reads session cookie → **`resolveAdminPanelActor`** → **`classifyAdminPanelAuth`** → **401** if no session, **403** if JWT present but user is not an active panel admin in DB. |
| **Authoritative admin identity** | **`resolveAdminPanelActor`** (`src/lib/admin-auth/panel-access.ts`): user must have **`AdminProfile`**, **`role` ∈ {`ADMIN`, `SUPER_ADMIN`}**, **`status === ACTIVE`**. |
| **Edge middleware** | **`src/middleware.ts`**: applies to **`/admin` HTML routes only** (matcher). **Does not run on `/api/*`.** Admin APIs rely on **route handlers** + **`requireAdminPanelApiAccess`**, not middleware. |
| **Dashboard SSR guard** | **`ensureAdminDashboardAccess()`** mirrors API checks so revoked users cannot render the shell even with a valid JWT edge cookie. |
| **Validation & responses** | **`zod`** schemas (often paired with `.strict()` on PATCH), **`jsonOk` / `jsonError`** from `src/lib/api-response.ts` (`{ ok: true, data }` / `{ ok: false, error: { code, message, details? } }`). **Prisma** via `src/lib/prisma`. |

### 1.4 UI / style conventions

| Pattern | Observation |
|---------|----------------|
| **Language** | Admin chrome and many headings use **Bangla** (`lang="bn"` on sections); area management uses **English** headings/descriptions on list/new pages — mixed pattern: **Bangla for nav and dashboard stats**, **English for some management copy** (e.g. areas). Sidebar: Bangla label + English `title` attribute. |
| **Layout width** | Lists often `mx-auto max-w-7xl`; forms `max-w-2xl`. |
| **Buttons** | Primary actions: `rounded-lg bg-emerald-700` (+ hover `bg-emerald-800`), white text. |
| **Forms** | Inputs: `rounded-lg border border-zinc-300`, focus ring emerald (`AreaForm` / `AreasList` helpers). |
| **Tables / lists** | **`AreasList`**: client component, loading spinner text, error banner, empty state message, pagination footer. |
| **Placeholder sections** | **`AdminPlaceholder`**: Bangla default subtitle *“এই বিভাগটি পরবর্তী আপডেটে সম্পূর্ণ করা হবে।”* |

---

## 2. Existing files found (relevant)

| Path | Role |
|------|------|
| `prisma/schema.prisma` | `DoctorProfile`, `User`, `DoctorServiceArea`, `Village`, `ServiceCategory`, enums |
| `prisma/seed.ts` | Demo doctor user/profile + `doctorServiceArea` upsert |
| `src/middleware.ts` | `/admin` JWT gate |
| `src/lib/admin-auth/*` | JWT, session, cookies, `resolveAdminPanelActor`, `requireAdminPanelApiAccess`, `ensureAdminDashboardAccess` |
| `src/lib/prisma.ts` | Prisma client |
| `src/lib/api-response.ts` | `jsonOk` / `jsonError` |
| `src/app/admin/(dashboard)/layout.tsx` | Dashboard layout + font + guard |
| `src/components/admin/AdminDashboardShell.tsx` | Sidebar nav (includes Doctors) |
| `src/app/admin/(dashboard)/doctors/page.tsx` | Placeholder only |
| `src/app/admin/(dashboard)/_lib/dashboard-stats.ts` | `prisma.doctorProfile.count()` for dashboard stat |
| `src/app/api/admin/areas/route.ts`, `[id]/route.ts` | Reference for admin REST + zod + Prisma |
| `src/components/admin/areas/*` | Reference list/form UX |
| `docs/AREA_SYSTEM_PLAN.md` | Geography vs `DoctorServiceArea` / village semantics |

---

## 3. Missing pieces

- ~~**Pages:** …~~ **Done** — see section **A** (admin UI).
- **Optional:** Admin endpoint or UI for legacy **`DoctorServiceArea`** (village-based) if matching still requires village-level edits alongside **`DoctorProfileArea`**.
- **Consistency rules:** Monitor **`User.status`** vs **`ProviderStatus`** in UI labels — APIs encode operational choices for approve/reject/suspend/activate (see section A).

---

## 4. Data model decision

### 4.1 Is existing `DoctorProfile` enough?

**Partially.** It supports **license**, **bio/specialization**, **provider lifecycle** (`providerStatus`, `verifiedAt`), and **village-based coverage** via **`DoctorServiceArea`**.

It does **not** support **visit fee**, **emergency**, **online consultation**, or **service categories per doctor** without schema changes.

### 4.2 New fields recommended (on `DoctorProfile` or small satellite table)

Recommended additions to **`DoctorProfile`** (names illustrative — finalize in implementation):

| Field | Type | Notes |
|-------|------|-------|
| `visitFeeBdt` | `Decimal` (e.g. `@db.Decimal(12, 2)`) | Nullable until set by admin |
| `acceptsEmergency` | `Boolean` @default(false) | Align naming with product copy |
| `acceptsOnlineConsultation` | `Boolean` @default(false) | Distinct from `ServiceRequest.requestType` |

Alternatives: store fees/settings in **`Setting`** keyed by doctor id — worse for querying and admin filters; **prefer columns** on `DoctorProfile` for MVP admin screens.

### 4.3 Join tables: working areas and categories

| Requirement | Decision |
|-------------|----------|
| **Working areas (Area tree)** | **`DoctorProfileArea`** links **`DoctorProfile`** ↔ **`Area`** with optional **`priority`**. Used by **`PUT /api/admin/doctors/[id]/working-areas`**. |
| **Legacy village coverage** | **`DoctorServiceArea`** (`doctorId` + `villageId`) **unchanged** — still available for seed/matching flows; not wired to new admin endpoints in this phase. |
| **Service categories** | **`DoctorProfileServiceCategory`** — unique `(doctorId, serviceCategoryId)`. **`PUT /api/admin/doctors/[id]/service-categories`** replaces the full set. |

---

## 5. Admin pages to implement

| Route | Purpose |
|-------|---------|
| `/admin/doctors` | Paginated/filterable list (status, search email/phone/license); links to detail and create. |
| `/admin/doctors/new` | Create **User** (`role: DOCTOR`) + **DoctorProfile** in one flow (or documented two-step); set initial `providerStatus` / `User.status`; optional license-only onboarding — **confirm product rule**. |
| `/admin/doctors/[id]` | Read-only overview: identity, profile, fee/flags, villages served, categories, quick actions (approve, suspend, etc.). |
| `/admin/doctors/[id]/edit` | Edit profile fields, fee, booleans, manage village list and categories (multi-select / picker). |

All routes live under **`(dashboard)`** so they inherit **`ensureAdminDashboardAccess`** and **`AdminDashboardShell`**.

---

## 6. Required admin actions (mapping)

| Action | Suggested implementation |
|--------|---------------------------|
| **Approve** | Set `providerStatus = ACTIVE`, optionally set `verifiedAt = now()`, ensure `User.status = ACTIVE` if they should sign in. |
| **Reject** | Set `providerStatus = REJECTED`; consider whether `User.status` stays `PENDING_VERIFICATION` or moves to `SUSPENDED` / blocked — **product decision**. |
| **Verify** | Set `verifiedAt = now()` (and typically keep/transition `providerStatus` to `ACTIVE` if approved). |
| **Activate** | `User.status = ACTIVE` and/or `providerStatus = ACTIVE` depending on whether both layers must move together. |
| **Suspend** | `providerStatus = SUSPENDED` and/or `User.status = SUSPENDED` — recommend **both** for hard suspension; document soft vs hard. |
| **Assign service areas (API)** | **`PUT /api/admin/doctors/[id]/working-areas`** replaces **`DoctorProfileArea`** rows ( **`Area`** IDs). Legacy **`DoctorServiceArea`** (village) unchanged — optional future admin tool. |
| **Assign service categories** | After **`DoctorServiceCategory`** exists: sync join rows from admin UI. |
| **Set visit fee** | Update new **`visitFeeBdt`** (or chosen field). |
| **Emergency / online availability** | Update new boolean fields on **`DoctorProfile`**. |

---

## 7. Required API endpoints or server actions

Prefer **Route Handlers** under **`/api/admin/doctors`** mirroring **`/api/admin/areas`** (explicit HTTP + shared JSON shape).

Suggested surface (adjust names during implementation):

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/admin/doctors` | List + filters (`q`, `providerStatus`, `userStatus`, pagination). |
| `POST` | `/api/admin/doctors` | Create doctor user + profile (if allowed). |
| `GET` | `/api/admin/doctors/[id]` | Single doctor with `user`, `doctorServiceAreas` (+ village hierarchy labels), `serviceCategories` (when join exists). |
| `PATCH` | `/api/admin/doctors/[id]` | Update profile, fee, flags, optional user email/phone with validation. |
| `POST` | `/api/admin/doctors/[id]/approve` | Dedicated transition (optional; can fold into PATCH). |
| `POST` | `/api/admin/doctors/[id]/reject` | Same. |
| `POST` | `/api/admin/doctors/[id]/verify` | Sets `verifiedAt` / status. |
| `POST` | `/api/admin/doctors/[id]/suspend` | Suspend user and/or provider. |
| `POST` | `/api/admin/doctors/[id]/activate` | Reactivate. |
| `PUT` or `PATCH` | `/api/admin/doctors/[id]/service-areas` | Replace villages for `DoctorServiceArea`. |
| `PUT` or `PATCH` | `/api/admin/doctors/[id]/service-categories` | Sync category IDs (after join table). |

**Supporting read APIs (if not reused):** authenticated endpoints or server-only loaders to list **`Village`** (with district path) and **`ServiceCategory`** for pickers.

Every handler starts with **`requireAdminPanelApiAccess()`**.

---

## 8. Validation rules (draft)

- **Email / phone:** unique on `User`; zod + Prisma P2002 handling (pattern from areas slug duplicate → 409).
- **License number:** required on profile; length bounds; consider uniqueness **product-dependent** (add `@@unique` only if business requires).
- **Visit fee:** non-negative decimal; max reasonable bound (e.g. &lt; 1e9 BDT).
- **Village IDs:** must exist; dedupe in payload; optional **priority** integer.
- **Category IDs:** must exist; dedupe; enforce max count if product requires.
- **State transitions:** reject illegal moves (e.g. `REJECTED` → `ACTIVE` without explicit “reopen”) if business rules require — encode in small state machine helper or zod refinements.

---

## 9. Security rules

| Rule | How it is enforced today / extension |
|------|--------------------------------------|
| **Only admin can access** | **`resolveAdminPanelActor`**: `ADMIN` or `SUPER_ADMIN` + **`AdminProfile`** + **`User.status === ACTIVE`**. |
| **Protected admin routes** | **Middleware** (JWT) + **`ensureAdminDashboardAccess`** (DB) for pages; **401/403** on APIs. |
| **No non-admin access** | Users with session but without admin profile get **403** on APIs and cleared cookie path in dashboard guard when actor is null. |
| **Doctors must not use admin APIs** | Same guard — doctor role without `AdminProfile` → **403**. |

**Note:** Protect **`/api/admin/*`** in every new route; do not assume middleware covers API routes.

---

## 10. Implementation checklist

- [x] Prisma fields + join tables + migration `doctor_management_fields`.
- [x] Implement `/api/admin/doctors` collection + `[id]` routes with `requireAdminPanelApiAccess`.
- [x] Implement **`DoctorProfileArea`** + **`DoctorProfileServiceCategory`** sync endpoints.
- [x] Build `DoctorsList` client component (patterns from `AreasList`).
- [x] Build forms for create/edit (`DoctorProfileForm`).
- [x] Wire approve/reject/verify/suspend/activate as POST actions with documented semantics.
- [x] Admin shell: Bangla/English nav label for doctor management (list/detail copy remains English like **Areas**).
- [ ] Update dashboard stat query if “total doctors” should exclude `REJECTED` or suspended — **product decision**.

---

## 11. Test / build checklist

- [x] `npm run lint` / `npm run build` succeed (2026-05-09).
- [ ] Manual: admin login → doctors list → CRUD smoke; non-admin cookie/session → 403 on API.
- [ ] Manual: middleware redirects unauthenticated users from `/admin/doctors` to `/admin/login?next=…`.
- [ ] Optional: add integration tests for `/api/admin/doctors`.

---

## 12. Changed files (implementation)

| Path | Notes |
|------|--------|
| `prisma/schema.prisma` | Doctor profile fields + `DoctorProfileArea` + `DoctorProfileServiceCategory` |
| `prisma/migrations/20260508204007_doctor_management_fields/migration.sql` | Migration SQL |
| `prisma/seed.ts` | Demo doctor `displayName` |
| `src/lib/admin-doctors/schemas.ts` | Zod schemas |
| `src/lib/admin-doctors/doctor-admin-service.ts` | Core logic + serialization (+ **`degree`** on list rows) |
| `src/lib/admin-doctors/mutation-errors.ts` | Error mapping |
| `src/lib/admin/read-admin-json.ts` | Shared admin JSON client helper |
| `src/types/admin-doctors.ts` | UI/API TypeScript shapes |
| `src/app/api/admin/doctors/**` | Doctor REST handlers |
| `src/app/api/admin/service-categories/route.ts` | **`GET`** category catalog for admin pickers |
| `src/components/admin/doctors/DoctorsList.tsx` | Doctor list table |
| `src/components/admin/doctors/DoctorProfileForm.tsx` | Create / edit form |
| `src/components/admin/doctors/DoctorDetailPanel.tsx` | Detail + actions |
| `src/app/admin/(dashboard)/doctors/page.tsx` | List page |
| `src/app/admin/(dashboard)/doctors/new/page.tsx` | Create page |
| `src/app/admin/(dashboard)/doctors/[id]/page.tsx` | Detail page |
| `src/app/admin/(dashboard)/doctors/[id]/edit/page.tsx` | Edit page |
| `src/components/admin/AdminDashboardShell.tsx` | Nav label for doctors |
| `src/lib/admin/admin-fetch.ts` | Same-origin **`fetch`** helper for admin browser calls |
| `src/components/admin/areas/AreasList.tsx` | Uses shared **`readAdminJson`** + **`adminFetch`** |
| `src/components/admin/areas/AreaForm.tsx` | Uses shared **`readAdminJson`** + **`adminFetch`** |
| `docs/DOCTOR_MANAGEMENT_PLAN.md` | This document |

---

## 13. Next task recommendation

- Optional: admin UI or API for legacy **`DoctorServiceArea`** (village) if dispatch still uses villages only.
- Mobile app / public onboarding aligned with **`ProviderStatus`** + **`User.status`**.

---

## QA Final Report (integration — code review + tooling)

### 1. Final implementation summary

Doctor Management for Prani Doctor includes: extended **`DoctorProfile`** + **`DoctorProfileArea`** + **`DoctorProfileServiceCategory`**; full **`/api/admin/doctors/**`** REST surface with **`requireAdminPanelApiAccess()`**; admin UI at **`/admin/doctors`** (list, new, detail, edit); **`GET /api/admin/service-categories`** for pickers; shared **`readAdminJson`** (invalid JSON guarded) and **`adminFetch`** (**`credentials: "same-origin"`**) for all admin client **`fetch`** calls used by **Areas** and **Doctors** components.

### 2. Final changed files (QA pass)

| Path | Change |
|------|--------|
| `src/lib/admin/admin-fetch.ts` | **New** — session-safe browser fetch |
| `src/lib/admin/read-admin-json.ts` | **Updated** — safe JSON parse |
| `src/components/admin/areas/AreasList.tsx` | Dedupe **`readAdminJson`**, use **`adminFetch`** |
| `src/components/admin/areas/AreaForm.tsx` | Dedupe **`readAdminJson`**, use **`adminFetch`** |
| `src/components/admin/doctors/*.tsx` | Use **`adminFetch`** for all API calls |
| `prisma/schema.prisma` | **`npx prisma format`** (no semantic schema edits this pass) |
| `docs/DOCTOR_MANAGEMENT_PLAN.md` | This QA section |

### 3. Final admin routes (pages)

| Route |
|-------|
| `/admin/doctors` |
| `/admin/doctors/new` |
| `/admin/doctors/[id]` |
| `/admin/doctors/[id]/edit` |

Protected by **`(dashboard)`** layout (**`ensureAdminDashboardAccess`**) + **`middleware`** for `/admin/*` HTML (JWT cookie).

### 4. Final API / server actions

| Method | Path |
|--------|------|
| `GET` | `/api/admin/doctors` |
| `POST` | `/api/admin/doctors` |
| `GET` | `/api/admin/doctors/[id]` |
| `PATCH` | `/api/admin/doctors/[id]` |
| `POST` | `/api/admin/doctors/[id]/approve` |
| `POST` | `/api/admin/doctors/[id]/reject` |
| `POST` | `/api/admin/doctors/[id]/verify` |
| `POST` | `/api/admin/doctors/[id]/activate` |
| `POST` | `/api/admin/doctors/[id]/suspend` |
| `PUT` | `/api/admin/doctors/[id]/working-areas` |
| `PUT` | `/api/admin/doctors/[id]/service-categories` |
| `POST` | `/api/admin/doctors/[id]/visit-fee` |
| `POST` | `/api/admin/doctors/[id]/emergency-availability` |
| `POST` | `/api/admin/doctors/[id]/online-consultation-availability` |
| `GET` | `/api/admin/service-categories` |

### 5. Final Prisma changes (this QA command)

- **No new migration.** Schema was only **`prisma format`**’d (style); **`prisma generate`** re-ran successfully.
- Existing model summary: **`DoctorProfile`** (identity/profile/fee/booleans/status), **`User`** (email/phone/status), **`DoctorProfileArea`**, **`DoctorProfileServiceCategory`**, legacy **`DoctorServiceArea`**.

### 6. QA checklist result

| Area | Result |
|------|--------|
| Data model | **Verified** in schema + service layer (`doctor-admin-service.ts`): relations, enums, joins, fees/booleans. |
| APIs listed above | **Verified** route files exist; mutations use Prisma + zod + **`requireAdminPanelApiAccess`**. |
| Admin UI routes | **Verified** pages/components present; loading/error/empty states in list; **`window.confirm`** on reject/suspend (list). |
| Forms | Client-side HTML **`required`** + server zod; create chains **`POST`** + **`PUT`** areas/categories. |
| Auth | **`middleware`** → login for unauthenticated `/admin/*`; APIs **401/403** via **`readAdminJson`** (no client-side bypass). Non-admin → **403** on APIs. |
| Code quality | **Deduped** **`readAdminJson`**; **`adminFetch`** for cookie-safe calls; no fake production data added. |
| Manual browser QA | **Recommended** on staging (login flows, button matrix). Not automated here. |

### 7. Lint result

- **`npm run lint`** — **PASS** (2026-05-09, post QA edits).

### 8. Build result

- **`npm run build`** — **PASS** (2026-05-09).
- Next.js **middleware → proxy** deprecation warning remains (framework; not introduced by this task).

### 9. Test result

- **`npm run test`** (`vitest run`) — **PASS** — 2 files, 7 tests (existing suite; no doctor-specific tests added).

### 10. Known limitations

- Area/category pickers: flat checklist (up to 500 areas); no type-ahead search.
- Moderation (approve/reject/suspend/…) on **list + detail**, not on **edit**.
- Profile photo: URL string only; no upload pipeline.
- **`DoctorServiceArea`** (village): not exposed in this admin UI/API phase.

### 11. Next task recommendation

- Optional admin tools for **`DoctorServiceArea`** if matching uses villages.
- Optional **`vitest`** integration tests for **`/api/admin/doctors`** handlers (mock Prisma).
- Product decision: dashboard **`totalDoctors`** count semantics (exclude rejected/suspended?).

---

## Build / lint notes

- **Next.js build** prints a **middleware → proxy** deprecation warning (framework-level; unrelated to doctor APIs).

---

## References in repo

- Schema: `prisma/schema.prisma`
- Admin doctor APIs: `src/app/api/admin/doctors/**`
- Admin doctor UI: `src/app/admin/(dashboard)/doctors/**`, `src/components/admin/doctors/**`
- Admin client helpers: `src/lib/admin/read-admin-json.ts`, `src/lib/admin/admin-fetch.ts`
- Admin shell & nav: `src/components/admin/AdminDashboardShell.tsx`
- API guard pattern: `src/lib/admin-auth/api-guard.ts`, `src/app/api/admin/areas/route.ts`
