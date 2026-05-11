# AI Technician management — audit & implementation plan

**Project:** Prani Doctor / Animal Doctors ([pranidoctor.com](https://pranidoctor.com/))  
**Repository:** `pranidoctor-web` (`D:\PraniDoctor\pranidoctor-web`)  
**Task card:** 06 — AI Technician Management  
**Last updated:** 2026-05-09 (finalize QA + Final Implementation Report)

**Isolation:** This plan uses only structures and docs present in **this** repo. No BPA/WPA, Quarbani 2026, or external project assumptions.

---

## Reality Adjustment (2026-05-09)

The original plan deferred **`AiTechnicianProfileArea`** to a later phase. Implementation aligned **doctor parity** and Bangladesh geography sooner:

- **`AiTechnicianProfileArea`** (`AiTechnicianProfile` ↔ **`Area`**) was added now — mirrors **`DoctorProfileArea`** so admin/API can assign unified tree coverage alongside legacy **`AiTechnicianServiceArea`** → **`Village`**.
- **`AiTechnicianProfileServiceCategory`** was added — mirrors **`DoctorProfileServiceCategory`** so technicians can be tagged with catalog rows such as slug **`ai-service`** without only relying on JSON.

Breed/semen specificity uses **`metadataJson`** on **`AiTechnicianProfile`** for MVP (structured tables deferred).

Naming: Prisma models remain **`AiTechnicianProfile`** / **`AiTechnicianServiceArea`** (not renamed to `TechnicianProfile`) for stable relations and migrations.

---

## Implementation Progress — Database Foundation

| Item | Detail |
|------|--------|
| **Changed files** | `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/20260508205522_ai_technician_foundation/migration.sql`, regenerated `src/generated/prisma/**`, `docs/AI_TECHNICIAN_MANAGEMENT_PLAN.md` |
| **Schema decisions** | Extended **`AiTechnicianProfile`** with `displayName`, `serviceFeeBdt`, `acceptsEmergency`, `metadataJson`. Added **`AiTechnicianProfileArea`** and **`AiTechnicianProfileServiceCategory`**. **`UserRole.AI_TECHNICIAN`** unchanged (already present). Verification continues via **`ProviderStatus`** + **`verifiedAt`** + **`User.status`**. |
| **Migration** | `20260508205522_ai_technician_foundation` — **applied** successfully (local Postgres `localhost:5432`). |
| **`prisma generate`** | **Succeeded** |
| **`npm run lint`** | **Passed** |
| **`npm run build`** | **Passed** (existing Next.js middleware deprecation warning only) |
| **`npm test`** | **Passed** (7 tests) |
| **Errors** | None on this machine |
| **Next implementation step** | ~~Admin APIs + UI~~ **Done** — optional polish (dashboard count, village picker). |

---

## Implementation Progress — Admin API

| Item | Detail |
|------|--------|
| **Endpoints added** | Base path **`/api/admin/ai-technicians`** — see route table below. |
| **Auth** | Every handler calls **`requireAdminPanelApiAccess()`** (same pattern as **`/api/admin/doctors`**). |
| **Responses** | **`jsonOk` / `jsonError`**. List: **`{ technicians, meta }`**. Detail / mutations: **`{ technician }`** (mirror **`doctor`** key). **`serviceFeeBdt`** serialized as decimal **string** or **null**. |
| **Validation** | **Zod** in **`src/lib/admin-ai-technicians/schemas.ts`**; PATCH bodies **`.strict()`** where applicable. |
| **Security** | **`passwordHash`** never returned; create accepts **`password`** once. **`User`** select: `id`, `email`, `phone`, `role`, `status`, timestamps only. |
| **Transactions** | **`$transaction`** used for create (user + profile + optional joins), PATCH when user + profile change, and replace-* area/category helpers. |
| **Changed files** | **`src/lib/admin-ai-technicians/{schemas,mutation-errors,technician-admin-service}.ts`**, **`src/app/api/admin/ai-technicians/**`**, this doc. |
| **`npm run db:generate`** | Ran (schema unchanged). |
| **`npm run lint`** | Passed |
| **`npm run build`** | Passed |
| **`npm test`** | Passed |
| **Blockers** | None |

### Admin API routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/admin/ai-technicians` | List; **`q`** search; **`providerStatus`**, **`userStatus`**; **`areaId`**, **`villageId`** filters; **`limit`**, **`offset`**. |
| `POST` | `/api/admin/ai-technicians` | Create **`User`** (`AI_TECHNICIAN`) + **`AiTechnicianProfile`**; optional **`initialAreaIds`**, **`initialVillageIds`**, **`initialServiceCategoryIds`**, fee, **`acceptsEmergency`**, **`metadataJson`**. |
| `GET` | `/api/admin/ai-technicians/[id]` | Detail with **`workingAreas`** (unified **`Area`**), **`villageServiceAreas`**, **`serviceCategories`**. |
| `PATCH` | `/api/admin/ai-technicians/[id]` | Profile + **`email`** / **`phone`** + fee + **`acceptsEmergency`** + **`metadataJson`** + optional **`userStatus`** (sets **`providerStatus`** for **ACTIVE**/**SUSPENDED**; cannot activate **REJECTED**). |
| `POST` | `.../[id]/approve` | Approve onboarding. |
| `POST` | `.../[id]/reject` | Reject. |
| `POST` | `.../[id]/verify` | Set **`verifiedAt`**. |
| `POST` | `.../[id]/activate` | Account + provider active. |
| `POST` | `.../[id]/suspend` | Account + provider suspended. |
| `PUT` | `.../[id]/working-areas` | **`{ areaIds }`** → **`AiTechnicianProfileArea`**. |
| `PUT` | `.../[id]/village-service-areas` | **`{ villageIds }`** → **`AiTechnicianServiceArea`**. |
| `PUT` | `.../[id]/service-categories` | **`{ serviceCategoryIds }`** → **`AiTechnicianProfileServiceCategory`**. |
| `POST` | `.../[id]/service-fee` | **`{ serviceFeeBdt }`**. |
| `POST` | `.../[id]/emergency-availability` | **`{ acceptsEmergency }`**. |

**Next implementation step:** ~~Admin UI~~ **Done** — see **Implementation Progress — Admin UI**.

---

## Implementation Progress — Admin UI

| Item | Detail |
|------|--------|
| **Pages** | `/admin/ai-technicians` (list), `/new` (create), `/[id]` (detail), `/[id]/edit` (edit) — under `(dashboard)` with existing shell. |
| **Components** | `TechniciansList`, `TechnicianProfileForm`, `TechnicianDetailPanel` in `src/components/admin/ai-technicians/`. |
| **Types** | `src/types/admin-ai-technicians.ts` — list row + detail (incl. village hierarchy). |
| **Navigation** | `AdminDashboardShell` — new item **এআই টেকনিশিয়ান** / “AI Technicians” after doctors, icon **`Cpu`**, href `/admin/ai-technicians`. |
| **UX** | Same Tailwind patterns as doctors (emerald CTA, table, search, pagination, `adminFetch` + `readAdminJson`, confirm on reject/suspend). List: search only (no extra dropdown filters, matching doctors). Create uses **`POST`** with **`initialAreaIds`** / **`initialServiceCategoryIds`** when set; edit uses **`PATCH`** + **`PUT`** areas/categories. Account status **`userStatus`** on edit form (ACTIVE / SUSPENDED / PENDING_VERIFICATION / INVITED). Village coverage shown **read-only** on detail (assign via API **`PUT .../village-service-areas`** if needed; no village picker in MVP UI). |
| **Lint / build / test** | `npm run lint`, `npm run build`, `npm test` — **passed**. |
| **Blockers** | None |

**Next implementation step:** Optional: village-ID editor UI; dashboard stat card for technician count.

---

## 1. Current audit findings

### 1.1 Project structure (high level)

| Area | Finding |
|------|---------|
| **Framework** | Next.js **16.2.6**, React **19**, App Router under `src/app/` |
| **Database** | PostgreSQL, Prisma **7.8** (`prisma/schema.prisma`, `prisma.config.ts`, seed via `tsx prisma/seed.ts`) |
| **Generated client** | Output: `src/generated/prisma/` |
| **Admin app** | `/admin/login`, `/admin` dashboard route group `(dashboard)` with shell + guards |
| **Admin APIs** | `src/app/api/admin/**` — REST-style route handlers, JSON `{ ok, data }` / `{ ok: false, error }` |
| **Tests** | `vitest` (`npm test`), small suite under `src/lib/admin-auth/*.test.ts`; `vitest.config.ts` present |
| **Lint / build** | `npm run lint` (eslint), `npm run build` |

### 1.2 Package scripts (`package.json`)

| Script | Purpose |
|--------|---------|
| `dev` / `build` / `start` | Next.js |
| `lint` | ESLint |
| `test` | `vitest run` |
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` |
| `db:push` | `prisma db push` |
| `db:seed` / `seed` | Prisma seed |

### 1.3 Prisma — role, user, technician models (already present)

| Item | Status |
|------|--------|
| **`UserRole.AI_TECHNICIAN`** | **Already in** `prisma/schema.prisma` (alongside `ADMIN`, `CUSTOMER`, `DOCTOR`, `SUPPORT`, `SUPER_ADMIN`). |
| **`User.aiTechnicianProfile`** | Optional 1:1 relation. |
| **`AiTechnicianProfile`** | Exists: `certification`, `bio`, **`providerStatus`** (`ProviderStatus`), **`verifiedAt`**, timestamps; relations to `ServiceRequest`, `TreatmentCase`, `Prescription`, `BillingRecord`, **`AiTechnicianServiceArea[]`**, `Review`, `Complaint`. |
| **`AiTechnicianServiceArea`** | Join **`AiTechnicianProfile` ↔ `Village`** with optional `priority`; unique `(aiTechnicianId, villageId)` — **same village-granularity pattern as legacy doctor coverage** (`DoctorServiceArea`). |
| **`User.status`** | `UserStatus` — use for **account** active/suspended (`ACTIVE`, `SUSPENDED`, …). |
| **Verification / moderation** | **`ProviderStatus`** on profile: `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `REJECTED` — mirrors **`DoctorProfile`** lifecycle. |

**Naming note:** The task text refers to “TechnicianProfile” / “TechnicianServiceArea”. The codebase and migrations use **`AiTechnicianProfile`** and **`AiTechnicianServiceArea`**. **Do not rename** these models in MVP (stable relations and existing seed); use “AI technician” in UI copy.

### 1.4 Gaps vs doctor management (functional)

| Capability | Doctors | AI technicians today |
|------------|---------|-------------------------|
| **Admin list / CRUD UI** | Implemented (`/admin/doctors`, …) | Implemented **`/admin/ai-technicians`** (list, new, detail, edit). |
| **Admin JSON APIs** | `/api/admin/doctors/**` | **`/api/admin/ai-technicians/**`** implemented (see **Implementation Progress — Admin API**). |
| **Service library** | `src/lib/admin-doctors/*` | **`src/lib/admin-ai-technicians/*`** implemented. |
| **Visit / service fee on profile** | `DoctorProfile.visitFeeBdt` | **`AiTechnicianProfile.serviceFeeBdt`** (admin API). |
| **Display name** | `DoctorProfile.displayName` | **`AiTechnicianProfile.displayName`**. |
| **Working areas (unified `Area` tree)** | `DoctorProfileArea` … | **`AiTechnicianProfileArea`** + **`PUT .../working-areas`**. |
| **Service categories** | `DoctorProfileServiceCategory` | **`AiTechnicianProfileServiceCategory`** + **`PUT .../service-categories`**. |

### 1.5 Admin auth & layout (existing)

| Mechanism | Location / behavior |
|-----------|---------------------|
| **Middleware** | `src/middleware.ts` — JWT cookie for `/admin` HTML routes; login path exempt. |
| **Dashboard SSR guard** | `src/app/admin/(dashboard)/layout.tsx` → `ensureAdminDashboardAccess()`. |
| **API guard** | `requireAdminPanelApiAccess()` → `resolveAdminPanelActor` — **`ADMIN` / `SUPER_ADMIN`** with **`AdminProfile`** and **`User.status === ACTIVE`**. |
| **Shell / nav** | `src/components/admin/AdminDashboardShell.tsx` — Bengali labels + English `title`; **AI Technicians** nav item after doctors. |

### 1.6 Seed (`prisma/seed.ts`)

| Finding |
|---------|
| When **`PRANI_SEED_DEMO=true`** (non-production), seed upserts a **demo AI technician** user (`UserRole.AI_TECHNICIAN`), **`AiTechnicianProfile`**, and **`AiTechnicianServiceArea`** to the demo village (`sample-service-village-001`). |
| Env overrides: **`PRANI_SEED_AI_TECH_EMAIL`**, **`PRANI_SEED_AI_TECH_PASSWORD`** (defaults `ai-tech@pranidoctor.local` / `ChangeMe!AiTech123`). |

### 1.7 Documentation drift

| Doc | Note |
|-----|------|
| `docs/PRANI_DOCTOR_MASTER_ROADMAP.md` | States AI technician **not** in `UserRole` — **out of date** vs current `schema.prisma`. |

---

## 2. Existing relevant files and patterns (reuse targets)

| Path | Reuse for AI technicians |
|------|---------------------------|
| `docs/DOCTOR_MANAGEMENT_PLAN.md` | Endpoint matrix, approve vs verify semantics, UI limitations. |
| `docs/ADMIN_AUTH_PLAN.md` | Auth layers; **technician admin uses same guards** (admins manage technicians). |
| `docs/AREA_SYSTEM_PLAN.md` | Bangladesh `Area` tree vs `Village` — decide technician coverage strategy. |
| `src/lib/admin-doctors/doctor-admin-service.ts` | **`verificationSummary`**, serialization (`Decimal` → string), list/detail includes. |
| `src/lib/admin-doctors/schemas.ts` | Zod patterns for list query + create/patch body. |
| `src/lib/admin-doctors/mutation-errors.ts` | Map Prisma `P2002` / domain errors → `jsonError`. |
| `src/lib/api-response.ts` | `jsonOk` / `jsonError`. |
| `src/lib/admin/read-admin-json.ts` | Client `fetch` JSON helper for admin components. |
| `src/lib/admin/admin-fetch.ts` | `credentials: "same-origin"` wrapper. |
| `src/app/api/admin/doctors/**` | Route handler layout (GET query parse → service → `jsonOk`). |
| `src/components/admin/doctors/*` | List table, forms, detail panel — **mirror UX** (search, pagination, confirm on destructive actions). |
| `src/app/api/admin/areas/route.ts` | Area picker data if adding **`AiTechnicianProfileArea`**. |

---

## 3. Required Prisma schema changes

### 3.1 `UserRole` — `AI_TECHNICIAN`

- **Action:** **None required** — enum value already exists. Confirm all create/update paths set `role: AI_TECHNICIAN` when provisioning technicians.

### 3.2 Profile model naming (“TechnicianProfile” vs existing)

- **Keep** **`AiTechnicianProfile`** as the single profile table (avoid rename / table remap).

### 3.3 Recommended MVP additions on `AiTechnicianProfile`

| Field | Type | Purpose |
|-------|------|---------|
| `displayName` | `String?` | Admin-visible name (aligned with `DoctorProfile.displayName`). |
| `serviceFeeBdt` | `Decimal?` `@db.Decimal(12, 2)` | **Fee setup** — mirror `visitFeeBdt` naming on doctor side (`visitFeeBdt` vs `serviceFeeBdt`: pick **one** consistent name; e.g. **`serviceFeeBdt`** distinguishes AI service from doctor visit). |

Optional later (not blocking MVP):

- `profilePhotoUrl` — parity with doctors if marketing profiles need photos.

### 3.4 `AiTechnicianServiceArea` (existing)

- **Keep** as-is for **village-level** coverage (matches seed and Bangladesh union/village geography).
- **PUT** semantics should mirror **`/api/admin/doctors/[id]/working-areas`** (replace set of village IDs + priorities), adapted for **`AiTechnicianServiceArea`**.

### 3.5 Unified `Area` tree (optional MVP+)

If product requires **same admin “Area management” picker** as doctors:

- Add **`AiTechnicianProfileArea`** (`AiTechnicianProfile` ↔ `Area`, unique `(aiTechnicianId, areaId)`, optional `priority`) — parallel to **`DoctorProfileArea`**.
- **Non-destructive:** retain **`AiTechnicianServiceArea`** for village/demo/legacy matching until product retires it.

**MVP recommendation:** Implement **village-based `PUT .../working-areas` first** (fastest, matches seed); add **`AiTechnicianProfileArea`** in a follow-up migration if matching logic must align with **`Area`**-based requests (`ServiceRequest.areaId`).

### 3.6 Verification status

- **No new enum required.** Use existing **`ProviderStatus`** + **`verifiedAt`** + **`User.status`**, same patterns as **`adminVerifyDoctor`**, approve/reject/suspend/activate (mirror `doctor-admin-service`).

### 3.7 AI service type / breed / semen (MVP recommendation)

| Topic | Recommendation |
|-------|----------------|
| **Service type** | **`ServiceRequest.requestType`** already includes **`AI_SERVICE`**. **`ServiceCategory`** includes slug **`ai-service`**. No schema change strictly required for “type” at request level. |
| **Breed / semen-specific catalog** | **Defer** dedicated breed/semen tables for MVP. If admin must tag technicians: optional **`metadataJson`** on **`AiTechnicianProfile`** for unstructured tags, **or** a future **`AiTechnicianProfileServiceCategory`** join mirroring doctors — only if product requires structured filters. |

---

## 4. Required admin pages

Align with doctor flows: list → new → `[id]` detail → `[id]/edit`.

| Route | Purpose |
|-------|---------|
| **`/admin/ai-technicians`** | List: search, filters (`providerStatus`, `userStatus`), pagination, row actions. |
| **`/admin/ai-technicians/new`** | Create `User` + `AiTechnicianProfile`, then assign working areas + fee. |
| **`/admin/ai-technicians/[id]`** | **Detail** — read-only summary + moderation buttons (same pattern as **`DoctorDetailPanel`**). |
| **`/admin/ai-technicians/[id]/edit`** | Edit profile fields, fee, working areas (PATCH + PUT). |

**Actions to expose (match doctors):**

- **Approve / reject / verify** (`POST` endpoints; confirm destructive actions in UI).
- **Activate / suspend** — update **`User.status`** (and align **`providerStatus`** per same business rules as doctors).
- **Area assignment** — village IDs (MVP); optionally **`Area`** checklist when **`AiTechnicianProfileArea`** exists.
- **Fee setup** — edit **`serviceFeeBdt`** (after schema add).

**Navigation:** Add item to **`AdminDashboardShell`** `NAV` (e.g. after Doctors — label Bangla + English `title`), icon e.g. **`Cpu`** or **`FlaskConical`** from `lucide-react` (pick one consistent icon).

---

## 5. Required API endpoints

Mirror **`/api/admin/doctors`** naming under a dedicated prefix (avoid colliding with doctors):

**Suggested base path:** `/api/admin/ai-technicians`

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/admin/ai-technicians` | Query: `q`, `providerStatus`, `userStatus`, `limit`, `offset` — mirror list doctors. |
| `POST` | `/api/admin/ai-technicians` | Create user + profile (`role: AI_TECHNICIAN`). |
| `GET` | `/api/admin/ai-technicians/[id]` | Detail include: `user`, `aiTechnicianServiceAreas` + nested `village` (+ union/upazila/district for labels). |
| `PATCH` | `/api/admin/ai-technicians/[id]` | Profile fields + optional password reset. |
| `POST` | `/api/admin/ai-technicians/[id]/approve` | Same semantics as doctor approve (document in handler comments). |
| `POST` | `/api/admin/ai-technicians/[id]/reject` | |
| `POST` | `/api/admin/ai-technicians/[id]/verify` | Sets **`verifiedAt`** consistent with doctor verify. |
| `POST` | `/api/admin/ai-technicians/[id]/activate` | User active + provider active pathway. |
| `POST` | `/api/admin/ai-technicians/[id]/suspend` | |
| `PUT` | `/api/admin/ai-technicians/[id]/working-areas` | Body: list of `{ villageId, priority? }` — replace join rows for **`AiTechnicianServiceArea`**. |
| `POST` | `/api/admin/ai-technicians/[id]/service-fee` | Or fold fee into **`PATCH`** only — prefer **one clear approach** (doctor uses dedicated **`visit-fee`** POST; parallel **`service-fee`** POST keeps symmetry). |

**Auth:** Every handler starts with **`await requireAdminPanelApiAccess()`**; on failure return same **401/403** pattern as doctors.

**Reuse:** `jsonOk` / `jsonError`, zod schemas, **`verificationSummary`** (copy or extract shared helper to e.g. `src/lib/admin-providers/verification-summary.ts` if duplication becomes noisy).

---

## 6. Required seed changes

| Change | Detail |
|--------|--------|
| **Demo profile fields** | After adding `displayName` / `serviceFeeBdt`, extend **`prisma/seed.ts`** demo **`AiTechnicianProfile` upsert** to set sample values (non-production only). |
| **No removal** | Keep existing demo AI technician email/password env pattern. |
| **Optional** | Document new fields in `.env.example` only if new env vars added (prefer **no** new env for fee — stored on profile). |

---

## 7. Migration / generate / test / build / lint checklist

Run from repo root (`pranidoctor-web`):

1. **`npx prisma format`** — after editing `schema.prisma`.
2. **`npm run db:generate`** — regenerate `src/generated/prisma`.
3. **`npm run db:migrate`** — create migration for new profile columns (and optional join table if implemented).
4. **`npm run seed`** (optional local) — verify demo AI technician still seeds with `PRANI_SEED_DEMO=true`.
5. **`npm test`** — existing vitest suite + add tests for any extracted pure helpers (optional).
6. **`npm run lint`**
7. **`npm run build`**

**Database:** Ensure `DATABASE_URL` points at dev Postgres (e.g. Docker compose per project docs).

---

## 8. Risk notes and rollback notes

| Risk | Mitigation |
|------|------------|
| **Duplicate domain logic** | Extract shared provider lifecycle helpers (approve/verify/suspend) used by both doctor and technician services **only when** stable and identical; otherwise keep parallel functions with shared comments to avoid wrong coupling. |
| **Area mismatch** | Requests may use **`areaId`** (`Area` tree) while technician coverage is **village**-based — document matching rules in code comments; future **`AiTechnicianProfileArea`** aligns admin UX. |
| **Breaking mobile/API clients** | New routes are **additive**; no change to public route names required. |

**Rollback:**

1. Revert Git commits implementing admin technician feature.
2. If migration already applied: **new migration** that drops added columns/tables (or restore DB snapshot before migrate). Do **not** drop **`AiTechnicianProfile`** / **`AiTechnicianServiceArea`** — those pre-exist and are used by `ServiceRequest` / billing relations.

---

## 9. Exact implementation file checklist

### Prisma

- [x] `prisma/schema.prisma` — `displayName`, `serviceFeeBdt`, `acceptsEmergency`, `metadataJson`; **`AiTechnicianProfileArea`** + **`AiTechnicianProfileServiceCategory`**.
- [x] `prisma/migrations/20260508205522_ai_technician_foundation/` — applied.

### Library (new — mirror `admin-doctors`)

- [x] `src/lib/admin-ai-technicians/schemas.ts`
- [x] `src/lib/admin-ai-technicians/technician-admin-service.ts`
- [x] `src/lib/admin-ai-technicians/mutation-errors.ts`

### API routes

- [x] `src/app/api/admin/ai-technicians/route.ts` — `GET`, `POST`
- [x] `src/app/api/admin/ai-technicians/[id]/route.ts` — `GET`, `PATCH`
- [x] `src/app/api/admin/ai-technicians/[id]/approve/route.ts`
- [x] `src/app/api/admin/ai-technicians/[id]/reject/route.ts`
- [x] `src/app/api/admin/ai-technicians/[id]/verify/route.ts`
- [x] `src/app/api/admin/ai-technicians/[id]/activate/route.ts`
- [x] `src/app/api/admin/ai-technicians/[id]/suspend/route.ts`
- [x] `src/app/api/admin/ai-technicians/[id]/working-areas/route.ts` — `PUT`
- [x] `src/app/api/admin/ai-technicians/[id]/village-service-areas/route.ts` — `PUT`
- [x] `src/app/api/admin/ai-technicians/[id]/service-categories/route.ts` — `PUT`
- [x] `src/app/api/admin/ai-technicians/[id]/service-fee/route.ts` — `POST`
- [x] `src/app/api/admin/ai-technicians/[id]/emergency-availability/route.ts` — `POST`

### Admin UI

- [x] `src/components/admin/ai-technicians/TechniciansList.tsx`
- [x] `src/components/admin/ai-technicians/TechnicianProfileForm.tsx`
- [x] `src/components/admin/ai-technicians/TechnicianDetailPanel.tsx`
- [x] `src/app/admin/(dashboard)/ai-technicians/page.tsx`
- [x] `src/app/admin/(dashboard)/ai-technicians/new/page.tsx`
- [x] `src/app/admin/(dashboard)/ai-technicians/[id]/page.tsx`
- [x] `src/app/admin/(dashboard)/ai-technicians/[id]/edit/page.tsx`
- [x] `src/components/admin/AdminDashboardShell.tsx` — nav entry

### Seed & docs

- [x] `prisma/seed.ts` — demo technician: new profile fields, **`AiTechnicianProfileArea`** (Ashulia union), **`AiTechnicianProfileServiceCategory`** (`ai-service`), existing **`AiTechnicianServiceArea`** village link preserved.
- [ ] *(Optional)* `docs/PRANI_DOCTOR_MASTER_ROADMAP.md` — fix stale `UserRole` bullet when touching docs next

---

## Appendix — Recommended implementation order

1. ~~**Schema migration** — `displayName`, `serviceFeeBdt`; regenerate client.~~ **Done** — see **Implementation Progress — Database Foundation**.
2. ~~**`technician-admin-service` + schemas**~~ **Done** — see **Admin API** section.
3. ~~**Route handlers**~~ **Done** — `/api/admin/ai-technicians/**`.
4. ~~**Admin UI** — list → detail → new/edit~~ **Done**
5. ~~**Nav** — shell link for AI technicians~~ **Done**
6. Optional: dashboard stat, village coverage editor.
7. ~~`AiTechnicianProfileArea`~~ **Done** in schema; area assignment in **admin UI** via checkbox list (same as doctors).

---

## Final Implementation Report

### 1. Completed features

- **`UserRole.AI_TECHNICIAN`** — present in Prisma enum; all technician admin queries scope **`user.role === AI_TECHNICIAN`**.
- **`AiTechnicianProfile`** — extended with **`displayName`**, **`serviceFeeBdt`**, **`acceptsEmergency`**, **`metadataJson`**; verification via **`verifiedAt`** + **`providerStatus`** + **`User.status`** (same mental model as doctors).
- **`AiTechnicianProfileArea`** — join to unified **`Area`** tree; admin UI checkbox flow mirrors doctors.
- **`AiTechnicianProfileServiceCategory`** — catalog tagging (e.g. **`ai-service`** slug).
- **`AiTechnicianServiceArea`** — legacy village-level coverage preserved; API **`PUT .../village-service-areas`**; detail page shows read-only village list (no village picker in MVP UI).
- **Admin REST API** — full CRUD + moderation (**approve/reject/verify/activate/suspend**) + **working-areas**, **village-service-areas**, **service-categories**, **service-fee**, **emergency-availability** under **`/api/admin/ai-technicians`** with **`requireAdminPanelApiAccess`**.
- **Admin UI** — list (search), new, detail, edit; nav entry in **`AdminDashboardShell`** after doctors.
- **Seed** — optional demo AI technician when **`PRANI_SEED_DEMO=true`** and **non-production** (uses **`PRANI_SEED_AI_TECH_EMAIL`** / **`PRANI_SEED_AI_TECH_PASSWORD`** or dev defaults); panel admin creation remains opt-in via **`DEFAULT_ADMIN_EMAIL`** / **`DEFAULT_ADMIN_PASSWORD`** (or legacy **`PRANI_SEED_ADMIN_*`**).
- **Security / hygiene** — **`.env`** is gitignored and **not** tracked; no BPA/WPA/Quarbani product logic added in technician modules.

### 2. Changed files (grouped)

| Area | Paths |
|------|--------|
| **Docs** | `docs/AI_TECHNICIAN_MANAGEMENT_PLAN.md` |
| **Prisma** | `prisma/schema.prisma`, `prisma/migrations/20260508205522_ai_technician_foundation/migration.sql`, regenerated `src/generated/prisma/**` |
| **Seed** | `prisma/seed.ts` |
| **API (lib)** | `src/lib/admin-ai-technicians/schemas.ts`, `mutation-errors.ts`, `technician-admin-service.ts` |
| **API (routes)** | `src/app/api/admin/ai-technicians/route.ts`, `[id]/route.ts`, `[id]/{approve,reject,verify,activate,suspend}/route.ts`, `[id]/{working-areas,village-service-areas,service-categories,service-fee,emergency-availability}/route.ts` |
| **Admin UI** | `src/types/admin-ai-technicians.ts`, `src/components/admin/ai-technicians/{TechniciansList,TechnicianProfileForm,TechnicianDetailPanel}.tsx`, `src/app/admin/(dashboard)/ai-technicians/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`, `src/components/admin/AdminDashboardShell.tsx` (nav) |
| **Tests / config** | No technician-specific test files added; existing **`vitest`** suite passes (7 tests). |

### 3. Prisma changes

- **Enum:** **`UserRole.AI_TECHNICIAN`** (unchanged; confirmed in use).
- **`AiTechnicianProfile`:** new columns **`displayName`**, **`serviceFeeBdt`**, **`acceptsEmergency`**, **`metadataJson`**.
- **New tables:** **`AiTechnicianProfileArea`**, **`AiTechnicianProfileServiceCategory`** with indexes and FKs to **`AiTechnicianProfile`**, **`Area`**, **`ServiceCategory`**.
- **Existing:** **`AiTechnicianServiceArea`** (technician ↔ **`Village`**) unchanged in purpose; used for village coverage APIs.

### 4. API endpoints

| Method | Path |
|--------|------|
| `GET` | `/api/admin/ai-technicians` |
| `POST` | `/api/admin/ai-technicians` |
| `GET` | `/api/admin/ai-technicians/[id]` |
| `PATCH` | `/api/admin/ai-technicians/[id]` |
| `POST` | `/api/admin/ai-technicians/[id]/approve` |
| `POST` | `/api/admin/ai-technicians/[id]/reject` |
| `POST` | `/api/admin/ai-technicians/[id]/verify` |
| `POST` | `/api/admin/ai-technicians/[id]/activate` |
| `POST` | `/api/admin/ai-technicians/[id]/suspend` |
| `PUT` | `/api/admin/ai-technicians/[id]/working-areas` |
| `PUT` | `/api/admin/ai-technicians/[id]/village-service-areas` |
| `PUT` | `/api/admin/ai-technicians/[id]/service-categories` |
| `POST` | `/api/admin/ai-technicians/[id]/service-fee` |
| `POST` | `/api/admin/ai-technicians/[id]/emergency-availability` |

### 5. Admin pages

| Route | Purpose |
|-------|---------|
| `/admin/ai-technicians` | List + search |
| `/admin/ai-technicians/new` | Create technician |
| `/admin/ai-technicians/[id]` | Detail + moderation + fee + emergency + areas + categories |
| `/admin/ai-technicians/[id]/edit` | Edit profile / account fields |

**Route protection:** **`src/middleware.ts`** matches **`/admin/**`** (HTML admin shell). **`/api/admin/*`** uses **`requireAdminPanelApiAccess`** per route (technician APIs included).

### 6. Seed data

- **Always:** hierarchy / catalog / service categories as defined in **`prisma/seed.ts`** (unchanged summary here).
- **Demo AI technician (conditional):** when **`PRANI_SEED_DEMO=true`** and **not** production — creates/links demo **`AI_TECHNICIAN`** user, **`AiTechnicianProfile`** fields, **`AiTechnicianProfileArea`** (Ashulia union), **`AiTechnicianProfileServiceCategory`** (**`ai-service`**), **`AiTechnicianServiceArea`** village link where seed data exists.
- **Panel admin:** skipped unless **`DEFAULT_ADMIN_EMAIL`** + **`DEFAULT_ADMIN_PASSWORD`** (or legacy **`PRANI_SEED_ADMIN_*`**) are set — **by design** for safe seeds.

### 7. Commands run and result

| Command | Result |
|---------|--------|
| `npx prisma format` | **Pass** |
| `npm run db:generate` (`prisma generate`) | **Pass** |
| `npx prisma migrate status` | **Pass** — 5 migrations, DB up to date |
| `npx prisma validate` | **Pass** |
| `npm run seed` | **Pass** (demo branch/environment-dependent; panel admin optional) |
| `npm run lint` | **Pass** |
| `npm run build` | **Pass** (Next.js **middleware → proxy** deprecation warning only — framework) |
| `npm test` (`vitest run`) | **Pass** — 7 tests |

### 8. Known issues / follow-up

- **Admin UI:** no editor for **village** service areas — API **`PUT .../village-service-areas`** exists; detail view is read-only for villages.
- **List UI:** search only — list API supports **`providerStatus`**, **`userStatus`**, **`areaId`**, **`villageId`**; filters not exposed in UI yet.
- **Optional:** admin dashboard stat card for technician count.
- **Docs:** `docs/PRANI_DOCTOR_MASTER_ROADMAP.md` may still mention stale role bullets — fix when that file is next edited.
- **Framework:** migrate off deprecated **`middleware`** convention when adopting Next.js **proxy** (project-wide; not technician-specific).

### 9. Manual QA checklist

1. Log into **`/admin/login`** with a panel admin account.
2. Open **`/admin/ai-technicians`** — list loads; search works.
3. **`/admin/ai-technicians/new`** — create technician (password, profile, optional areas/categories/fee).
4. Open detail — verify/reject/approve/suspend/activate as applicable; set fee and emergency flag.
5. Edit profile — save; confirm detail reflects changes.
6. Working areas — multi-select saves via API from UI; reload detail.
7. Service categories — assign/remove; reload detail.
8. Confirm **`/api/admin/ai-technicians`** returns **401/403** without admin credentials (e.g. curl unauthenticated).

### 10. Recommended next task

- **Mobile / technician app slice:** authentication and profile fetch for **`AI_TECHNICIAN`** role against existing mobile API conventions **or** **admin polish:** village coverage editor + list filters + dashboard count — pick based on product priority.

---

**Task Card 06 status:** **Completed** — database foundation, admin API, admin UI, and seed hooks delivered for Prani Doctor / Animal Doctors; remaining items are optional polish (see §8).
