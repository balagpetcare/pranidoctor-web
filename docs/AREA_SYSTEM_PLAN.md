# Area System — Task Card 03 Plan

**Project:** [Prani Doctor](https://pranidoctor.com/) / Animal Doctors  
**Repository:** `pranidoctor-web`  
**Scope:** Area management foundation for Bangladesh-based service matching.  
**Isolation:** This plan applies only to Prani Doctor. It does not reference or reuse BPA/WPA, Quarbani 2026, or other projects.

**Status:** **Task Card 03 — Final validation completed (2026-05-09)** — backend + admin UI + migrations verified on host; `npm run lint`, `npm run build`, and `prisma migrate status` passed. Automated tests still optional.

---

## Implementation notes — Part 2 (admin UI, 2026-05-09)

### Routes

| Route | Description |
|-------|-------------|
| `/admin/areas` | List, filters, pagination, edit/deactivate/activate |
| `/admin/areas/new` | Create form |
| `/admin/areas/[id]/edit` | Edit form (loads via `GET /api/admin/areas/[id]`) |

Sidebar **Areas** link was already present in `AdminDashboardShell`; unchanged.

### User flow

1. Admin opens **Areas** → sees table with optional filters (search, type, parent, active/inactive). **Apply filters** runs a new query; **Reset** clears filters and reloads.
2. **New area** → fill English name, optional Bangla name, slug (with “Suggest from English name” on create), optional code, type, parent (filtered by hierarchy rules), sort order, active checkbox → **Create** → `POST /api/admin/areas` → redirect to list.
3. **Edit** → same fields → **Save** → `PATCH /api/admin/areas/[id]` → redirect to list.
4. **Deactivate** → browser **confirm** → `DELETE /api/admin/areas/[id]` (soft `isActive: false`). **Activate** → `PATCH` with `isActive: true` (no confirm).

### API integration

- All requests use **`fetch`** with JSON bodies; responses parsed with a small **`readAdminJson`** helper (inlined in `AreasList` and `AreaForm` to avoid a Turbopack bundling issue seen with a separate shared module).
- **`401`** redirects to `/admin/login?next=…` (cookie session required).
- **Parent picker** loads **`GET /api/admin/areas?limit=500`** (active + inactive rows); options are filtered by expected parent **type**; on edit, the **current parent id** is always included so inactive parents still display.

### UI / copy conventions

- **English** chrome for admin (headings, buttons, errors); **Bangla** only as stored **data** (`nameBn`) and placeholders (“e.g. ঢাকা বিভাগ”).
- **No toast library** in the repo — success is implicit redirect; errors use **inline red banners** (same pattern as `AdminLoginForm`). **Deactivate** uses **`window.confirm`** only.

### Client bundle note (Prisma)

- Client components import **`AreaType`** from **`@/generated/prisma/browser`**, not `@/generated/prisma/client`, so the admin UI bundle does not pull the full Node Prisma engine.

### API addition (supports edit screen)

- **`GET /api/admin/areas/[id]`** — returns single area with `parent` + `_count.children` (same shape as list rows).

### Changed files (Part 2)

| Path | Change |
|------|--------|
| `src/app/admin/(dashboard)/areas/page.tsx` | Real list + “New area” |
| `src/app/admin/(dashboard)/areas/new/page.tsx` | **New** — create |
| `src/app/admin/(dashboard)/areas/[id]/edit/page.tsx` | **New** — edit |
| `src/app/api/admin/areas/[id]/route.ts` | **GET** single area |
| `src/components/admin/areas/AreasList.tsx` | **New** — table, filters, pagination, actions |
| `src/components/admin/areas/AreaForm.tsx` | **New** — create/edit form |
| `src/components/admin/areas/parent-options.ts` | **New** — parent filtering + labels |
| `src/types/admin-areas.ts` | Shared row types (`AreaType` from Prisma **browser** entry) |
| `docs/AREA_SYSTEM_PLAN.md` | This update |

### Pending / follow-ups

- **Toasts / snackbars:** not present; add a small library later if product wants non-blocking success noise.
- **Breadcrumbs:** list shows parent column + children count; full multi-level breadcrumb would need extra API or tree fetch.
- **Tests:** still none for admin UI.

---

## Implementation notes — Part 1 (2026-05-09)

### Schema / migration

- Added Prisma enum **`AreaType`**: `DIVISION`, `DISTRICT`, `UPAZILA`, `UNION`, `VILLAGE`, `SERVICE_AREA`.
- Extended **`Area`** (additive only — **non-destructive**):
  - `nameBn`, `code`, `type` (default `DIVISION` for existing rows), `sortOrder` (default `0`), `isActive` (default `true`).
  - Indexes: `type`, `isActive`, `[parentId, type]`.
  - **`ServiceRequest.areaId` → `Area`** unchanged; normalized `Division`…`Village` tables unchanged.
- Migration: **`20260508200401_area_hierarchy`** — creates PostgreSQL enum `AreaType`, `ALTER TABLE "Area" ADD COLUMN …`, creates indexes. **No table drops, no data wipe.**

### Auth pattern

- **`/api/admin/*` is not covered by `middleware.ts`** (only `/admin/*` paths).
- Area routes use **`requireAdminPanelApiAccess()`** in `src/lib/admin-auth/api-guard.ts`: requires cookie session via **`getAdminSession()`** and an existing **`AdminProfile`** (same spirit as `/api/admin/auth/me`, plus explicit panel guard).

### API summary

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/areas` | List with optional `q`, `type`, `parentId` (`__root__` = roots only), `isActive`, `limit`, `offset`. Includes `parent` summary and `_count.children`. |
| `GET` | `/api/admin/areas/[id]` | Single area (same includes as list row). |
| `POST` | `/api/admin/areas` | Create; validates hierarchy (`DIVISION` root or `DIVISION`→`DIVISION`; `DISTRICT` under `DIVISION`; …; `SERVICE_AREA` under `VILLAGE`). |
| `PATCH` | `/api/admin/areas/[id]` | Partial update; blocks self-parent and ancestor cycles when changing `parentId`. |
| `DELETE` | `/api/admin/areas/[id]` | **Soft deactivate** (`isActive: false`) — no hard delete. |

Errors use existing **`jsonOk` / `jsonError`** envelopes and **Zod** validation (`422` / `409` on duplicate slug).

### Seed data notes

- **`Area` tree**: Dhaka Division → Dhaka + Gazipur districts → Savar + Gazipur Sadar upazilas → Ashulia + Konabari unions (with `-area` suffix slugs where needed to avoid clashes with relational tables). Legacy **`bangladesh`** row kept **inactive** (`isActive: false`).
- **Relational `Division`…`Village`**: aligned to the same realistic names; demo **`Village`** remains slug **`sample-service-village-001`** (now under Ashulia union) so **`PRANI_SEED_DEMO`** doctor/AI links stay stable.

### Automated tests

- **Not added in this task.** Recommended follow-up: integration tests for hierarchy validation and auth on `/api/admin/areas`.

### Changed files (Part 1)

| Path | Change |
|------|--------|
| `prisma/schema.prisma` | `AreaType` enum; `Area` fields + indexes |
| `prisma/migrations/20260508200401_area_hierarchy/migration.sql` | New migration |
| `prisma/seed.ts` | Area + relational geography sample data |
| `src/lib/admin-auth/api-guard.ts` | **New** — admin API session + profile guard |
| `src/lib/admin-areas/parent-validation.ts` | **New** — hierarchy + cycle checks |
| `src/app/api/admin/areas/route.ts` | **New** — GET, POST |
| `src/app/api/admin/areas/[id]/route.ts` | **New** — GET, PATCH, DELETE (soft) |
| `src/generated/prisma/*` | Regenerated client |

---

## 1. Current audit findings *(historical baseline — see Implementation notes above for current state)*

### 1.1 Prisma schema (`prisma/schema.prisma`)

| Topic | Finding |
|-------|---------|
| **Canonical geography** | Explicit hierarchy already modeled: `Division` → `District` → `Upazila` → `Union` → `Village`. Each row has `name`, unique `slug`, optional `code`, timestamps. Foreign keys use `onDelete: Restrict` down the chain (safe for referenced rows). |
| **Legacy `Area` model** | Self-referential tree (`parentId`, `children`, `parent`) with `name`, `slug`, optional `metadataJson`. Comment in schema: *"Legacy hierarchical area tree — retained for backward compatibility until requests are migrated to `Village`."* |
| **`ServiceRequest` links** | Optional `areaId` (→ `Area`, legacy) and optional `villageId` (→ `Village`, preferred). Comment: *"Legacy link — prefer `villageId` for new records."* Indexes: `[areaId, serviceCategoryId]`, `[villageId]`. |
| **Provider coverage** | `DoctorServiceArea` and `AiTechnicianServiceArea` are **many-to-one from provider to `Village`** (not to `Area`). Unique `(doctorId, villageId)` and `(aiTechnicianId, villageId)`. |
| **`User` / profiles** | No direct FK from `User`, `DoctorProfile`, or `CustomerProfile` to `Area` or geography tables. Location for customers can live in `CustomerProfile.addressJson`; matching is driven by `ServiceRequest` + provider↔`Village` joins. |
| **Enums** | There is **no** geographic-level enum (e.g. division vs district). Domain enums cover users, animals, requests, billing, etc., but not administrative geography type. |
| **Generated client** | `generator` outputs to `src/generated/prisma` (`provider = "prisma-client"`). |

### 1.2 Migration state (`prisma/migrations/`)

| Item | Finding |
|------|---------|
| **Committed migrations** | Present: `20260208120000_init_mvp` (introduces `Area`, `ServiceRequest.areaId`, etc.) and `20260508195220_prani_doctor_mvp_schema` (adds `Division` … `Village`, `villageId` on `ServiceRequest`, provider service area tables, and related changes). |
| **`migration_lock.toml`** | Present (PostgreSQL). |
| **Implication** | New area-management features should prefer **additive** migrations (new columns, optional FKs, indexes) unless product explicitly schedules legacy `Area` removal. |

### 1.3 Admin routes and pages (`src/app/admin/`)

| Topic | Finding |
|-------|---------|
| **Layout** | `admin/layout.tsx`: full-height zinc background wrapper. `(dashboard)/layout.tsx` wraps children in `AdminDashboardShell`. |
| **Navigation** | `AdminDashboardShell` defines sidebar links; **Areas** → `/admin/areas` with `MapPin` icon. Brand styling: emerald accents, zinc neutrals, dark mode classes. |
| **Areas page** | `src/app/admin/(dashboard)/areas/page.tsx` renders only `<AdminPlaceholder title="Areas" />` — **no table, forms, or data fetching**. |
| **Other admin sections** | Most subsections (e.g. doctors, customers) also use `AdminPlaceholder`; **dashboard** (`page.tsx`) is the main implemented page: server component, `getAdminSession()`, Prisma-backed stats via `./_lib/dashboard-stats`, `StatCard` grid. |
| **Patterns** | **No** established admin CRUD list/detail pattern or shared data-table component yet. **No** React Server Actions observed for admin mutations; **login** uses client `fetch` to Route Handlers. |

### 1.4 API routes (`src/app/api/`)

| Route | Role |
|-------|------|
| `POST /api/admin/auth/login` | Zod body validation; `jsonError` / `jsonOk`; sets HTTP-only session cookie. |
| `POST /api/admin/auth/logout` | Clears session. |
| `GET /api/admin/auth/me` | Uses `getAdminSession()`; returns 401 if absent; `jsonOk` user payload. |
| `GET /api/admin/health` | DB ping; `jsonOk` / `jsonError`. |
| `GET /api/mobile/health` | Mobile scope health check. |

**Area-specific APIs:** **None.** No `GET/POST/PATCH/DELETE` for geography or legacy `Area`.

**Admin auth on APIs:** `src/middleware.ts` only matches `/admin` and `/admin/:path*`. **`/api/admin/*` is not protected by middleware.** Each admin Route Handler must call `getAdminSession()` (or equivalent) and return `401` when missing — consistent with `api/admin/auth/me`.

**Validation / response style:** Request bodies parsed as JSON with try/catch; **Zod** `safeParse` for validation; errors use `jsonError(code, message, status, details?)`. Success uses `jsonOk(data)`. Types in `src/types/api.ts` (`ApiSuccess`, `ApiErrorBody`).

### 1.5 Seed (`prisma/seed.ts`, `prisma.config.ts`)

| Topic | Finding |
|-------|---------|
| **Runner** | `prisma.config.ts` sets `seed: "tsx prisma/seed.ts"`. |
| **Core seed** | Admin user + `AdminProfile`, `ServiceCategory` upserts, **`Area` tree** (root `bangladesh`, child `dhaka-division`), **`Division` / `District` / `Upazila` / `Union` / `Village`** chain with placeholder/sample names (one chain ending at `sample-service-village-001`), `Setting` for `app.name`. |
| **Demo flag** | `PRANI_SEED_DEMO=true` (non-production): demo doctor/AI users, links `DoctorServiceArea` / `AiTechnicianServiceArea` to the seeded `Village`, draft `ContentPost`. |
| **Style** | Heavy use of `upsert` by unique `slug`; bcrypt for passwords; env overrides for emails/passwords. |

### 1.6 UI / component conventions

| Element | Finding |
|---------|---------|
| **Buttons** | Primary actions often `rounded-lg bg-emerald-700`, hover `emerald-800`, disabled opacity; sidebar uses zinc hover backgrounds. |
| **Inputs** | `rounded-lg border border-zinc-300`, focus ring `ring-emerald-600` / `focus:border-emerald-600`, dark-mode zinc variants (`AdminLoginForm`). |
| **Cards / layout** | Dashboard uses `StatCard`; placeholders use simple `max-w-3xl` typography (`text-2xl font-semibold`, muted `text-sm text-zinc-600`). |
| **Tables** | No shared table component found in admin for listing entities. |
| **Copy** | Admin UI strings observed in **English** (“Dashboard”, “Sign out”, “Admin sign in”). `CustomerProfile.locale` defaults to `bn-BD` — product intent for Bengali in customer-facing surfaces; admin copy remains English unless specified otherwise. |

---

## 2. Current Area model status

| Layer | Status |
|-------|--------|
| **Legacy `Area`** | Implemented; used by `ServiceRequest.areaId`; seeded with placeholder Bangladesh/Dhaka nodes; flexible tree but **not** aligned to typed BD levels in DB. |
| **`Division` → `Village`** | Implemented as first-class relational models; **this is the correct foundation** for BD hierarchy and for provider coverage (`DoctorServiceArea` / `AiTechnicianServiceArea`). |
| **`Village` as service granularity** | Effectively the **service-area leaf** for matching today (provider joins and preferred `ServiceRequest.villageId`). |
| **Gap** | Admin UX and HTTP API for managing geography (and optionally legacy `Area`) are **not built**. Seed has **one** division chain, not the richer minimum sample set described in section 7 of this plan. |

---

## 3. Recommended area hierarchy (product + data model)

**Bangladesh administrative hierarchy for matching:**

**Division → District → Upazila → Union → Village / service area**

- **Village** in the schema maps to the finest resolved location used for **assignment and coverage** (label in UI may be “Village” or “Service area” depending on product copy).
- **Legacy `Area`** should be treated as **technical debt**: new features should write **`villageId`** on `ServiceRequest`; admin tooling can focus on the relational geography first, then plan migration/cleanup of `Area` and nullable `areaId` when historical data allows.

---

## 4. Proposed Prisma schema changes

*Planning only — exact diff to be decided in implementation.*

| Change | Rationale |
|--------|-----------|
| **Soft-delete / lifecycle** | Add optional `isActive Boolean @default(true)` or `deactivatedAt DateTime?` on `Division`, `District`, `Upazila`, `Union`, `Village` so admins can **deactivate** without breaking FK `Restrict` semantics (combined with “do not delete if children exist” in application logic). |
| **Display names (BN)** | Optional `nameBn String?` on each geography model for Bengali UI without replacing slug/code conventions. |
| **Ordering** | Optional `sortOrder Int?` for admin-defined ordering within the same parent. |
| **Optional `Area` deprecation path** | Later migration: backfill `Village` from `Area` where possible; stop seeding `Area`; eventually drop `ServiceRequest.areaId` after data migration — **separate task** once production data is understood. |
| **Enums** | Consider `AdministrativeLevel` enum **only if** a polymorphic “single API” design needs it in Prisma; otherwise **discriminate by route or query param** without enum duplication across tables. |

No breaking FK changes are required for an MVP admin geo CRUD if rows remain `Restrict`-safe and deletes are replaced by deactivation.

---

## 5. Proposed admin panel routes / pages

| Route | Purpose |
|-------|---------|
| `/admin/areas` | Overview hub: links or tabs to manage each level; optional tree/breadcrumb filter (replace `AdminPlaceholder`). |
| `/admin/areas/divisions` | List + create/edit division. |
| `/admin/areas/districts` | List filtered by division; create/edit with division FK. |
| `/admin/areas/upazilas` | List filtered by district; create/edit. |
| `/admin/areas/unions` | List filtered by upazila; create/edit. |
| `/admin/areas/villages` | List filtered by union; create/edit; show usage hints (provider coverage / requests). |

**Alternative (single section):** One `/admin/areas` page with level tabs and a shared table component — fewer routes, slightly heavier client/server logic.

**Conventions to match:** `AdminDashboardShell`, zinc/emerald Tailwind patterns, server components for initial loads where practical, client forms where interactivity is needed (consistent with `AdminLoginForm`).

---

## 6. Proposed API endpoints

All under **`/api/admin/`** with **`getAdminSession()`** guard and Zod validation. Response envelope: existing `jsonOk` / `jsonError`.

**Option A — Unified “area” resource (recommended for parity with task wording)**

| Method | Endpoint | Behavior |
|--------|----------|----------|
| `GET` | `/api/admin/areas` | Query: `level` = `division|district|upazila|union|village`, optional `parentId` (parent row’s id at previous level), optional `includeInactive`. Returns paginated list or tree slice. |
| `POST` | `/api/admin/areas` | Body: `level` + fields (`name`, `slug`, `code?`, `parentId` / FK id appropriate to level). Creates one row. |
| `PATCH` | `/api/admin/areas/[id]` | Body: partial updates (`name`, `slug`, `code`, `isActive`, `sortOrder`, `nameBn`, etc.) + optional `level` or inferred from DB. |
| `DELETE` | `/api/admin/areas/[id]` | Prefer **soft deactivate** (`PATCH` with `isActive: false`) as primary product behavior; if hard delete is exposed, return **409** when FK children or `ServiceRequest`/provider links exist. |

**Option B — RESTful per table**

| Method | Endpoint |
|--------|----------|
| `GET` | `/api/admin/geo/divisions`, `.../districts?divisionId=`, `.../upazilas?districtId=`, etc. |
| `POST` | Same segments |
| `PATCH` | `/api/admin/geo/divisions/[id]`, etc. |
| `DELETE` | Same as Option A regarding deactivate vs delete |

**Legacy `Area` (optional phase 2):** Separate `/api/admin/legacy-areas` only if product still needs to edit the tree before full deprecation.

---

## 7. Proposed seed sample data

Extend **`prisma/seed.ts`** (non-demo portion) so geography reflects **realistic Bangladesh naming** while staying clearly **sample** data:

| Level | Count | Example content (illustrative) |
|-------|-------|--------------------------------|
| **Division** | ≥ 1 | Keep or refine **Dhaka Division** (`slug` e.g. `dhaka-division-geo`, `code` `30`). |
| **District** | ≥ 2 | e.g. **Dhaka District**, **Gazipur District** (distinct slugs/codes under same division). |
| **Upazila** | ≥ 2 | e.g. one under Dhaka District, one under Gazipur District (replace purely fictional “Dhanmondi as upazila” with plausible placeholder names if desired). |
| **Union** | ≥ 2 | One union per seeded upazila (minimum). |
| **Village / service area** | ≥ 2 | One village under each seeded union; keep existing demo doctor/AI linkage updated to use one of these villages if multiple exist. |

**Consistency:** Continue **upsert-by-slug** pattern; ensure slugs remain globally unique per model as required by schema.

---

## 8. Implementation checklist

- [ ] Replace `/admin/areas` placeholder with hub and/or leveled list pages.
- [ ] Add shared admin components (table, form fields, breadcrumb/parent selector) reusing Tailwind conventions.
- [ ] Implement `GET/POST/PATCH` (+ deactivate semantics) for geography per section 6.
- [ ] Wire forms to Route Handlers via `fetch` or progressive enhancement (match existing login pattern unless Server Actions are introduced project-wide).
- [ ] Apply `getAdminSession()` to every new admin geo route; verify **401** without cookie.
- [ ] Extend seed per section 7; run `PRANI_SEED_DEMO` path to confirm provider↔village links still work.
- [ ] Document slug rules and Bengali name fields for operators (short internal README or inline admin copy — only if product asks).
- [ ] Plan follow-up: migrate legacy `ServiceRequest.areaId` usage to `villageId` where missing.

---

## 9. Validation checklist (before merge)

| Step | Command / action |
|------|------------------|
| Prisma client | `npm run db:generate` |
| Database | After schema changes in a future task: `npm run db:migrate` (or project-approved migration workflow); verify migration SQL in review |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Manual | Sign in to admin, exercise geo CRUD, confirm deactivated rows do not break existing FK rows |

---

## 10. Risk notes

| Risk | Mitigation |
|------|------------|
| **Migration safety** | Prefer additive columns; avoid dropping `Area` or `areaId` until backfill is validated. Review FK `Restrict` — hard deletes on parent rows will fail if children exist. |
| **Existing data compatibility** | Rows using `ServiceRequest.areaId` without `villageId` remain valid until product migrates; matching logic must define precedence (**prefer `villageId`**). |
| **Parent-child edge cases** | Moving a node to a new parent (e.g. wrong district) may orphan slug semantics; restrict parent changes or regenerate slug with caution. Cycles impossible for typed FK chain but **still possible in legacy `Area`** if editing — validate no self-parent. |
| **API security** | Middleware does not cover `/api/admin/*`; **every** handler must verify admin session. |
| **Slug collisions** | Global uniqueness per table; enforce in Zod + handle Prisma unique constraint errors with `409` / clear message. |

---

## 11. Changed files section

See **Implementation notes — Part 1** → *Changed files (Part 1)*. Future milestones (admin UI, tests, legacy `areaId` migration) will extend this list.

*Historical note:* The pre-implementation expectation table below is superseded by Part 1 for backend/API.

| Area | Likely paths *(pre-implementation)* |
|------|----------------|
| Schema | `prisma/schema.prisma`; migrations under `prisma/migrations/` |
| Seed | `prisma/seed.ts` |
| Admin UI | `src/app/admin/(dashboard)/areas/**` ✅ |
| API | `src/app/api/admin/areas/**` ✅ |

---

## 12. Next task recommendation

1. **Customer/mobile geography API** (read-only, authenticated appropriately).
2. **`ServiceRequest` location rules:** prefer **`villageId`**; plan migration off legacy **`areaId`** where needed.
3. **Automated tests** for admin areas API and UI when test tooling is chosen.

**Follow-up task (later card):** Data migration from legacy `Area` + `areaId` to `Village`/`villageId` only, analytics on current usage, and removal plan.

---

## Audit summary (executive)

The database models Bangladesh geography as **`Division` → `District` → `Upazila` → `Union` → `Village`** (normalized tables) and uses **`Village`** for provider coverage and preferred **`ServiceRequest.villageId`**. The unified **`Area`** model includes **`AreaType`**, Bengali and optional codes, ordering, and soft-deactivation via **`isActive`**. Admin **`GET` / `POST` / `PATCH` / `DELETE`** live under **`/api/admin/areas`**, guarded by **`requireAdminPanelApiAccess()`** (HTTP-only session + **`AdminProfile`**). **`middleware.ts`** still does not apply to **`/api/admin/*`**. Admin UI ships **`/admin/areas`**, **`/admin/areas/new`**, and **`/admin/areas/[id]/edit`**. **Seed** uses upserts for Dhaka / Gazipur samples (**`Area`** + relational geography).

---

**Plan file path:** `docs/AREA_SYSTEM_PLAN.md`

**Recommended commands after pulling these changes:**

```bash
cd D:\PraniDoctor\pranidoctor-web
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run lint && npm run build
```

For local dev with a fresh shadow DB, `npx prisma migrate dev` applies the same migration as `20260508200401_area_hierarchy`.

---

## Final Validation Report

**Run date:** 2026-05-09 · **Repository:** `pranidoctor-web` · **Isolation:** Prani Doctor / Animal Doctors only (no BPA/WPA, Quarbani 2026, or other project logic).

### 1. Completed features

| Layer | Delivered |
|-------|-----------|
| **Prisma** | `AreaType` enum; extended **`Area`** (`nameBn`, `code`, `type`, `sortOrder`, `isActive`, indexes); **`ServiceRequest.areaId`** retained |
| **Migrations** | `20260508200401_area_hierarchy` among committed migrations; additive DDL |
| **Seed** | Idempotent upserts (`prisma/seed.ts` via `npm run db:seed`) |
| **API** | Admin areas list/create/read/update + soft delete |
| **Admin UI** | Areas list (filters, pagination), create, edit, activate/deactivate |
| **Navigation** | **Areas** link in `AdminDashboardShell` |

### 2. API endpoint list

| Method | Path |
|--------|------|
| `GET` | `/api/admin/areas` |
| `POST` | `/api/admin/areas` |
| `GET` | `/api/admin/areas/[id]` |
| `PATCH` | `/api/admin/areas/[id]` |
| `DELETE` | `/api/admin/areas/[id]` |

### 3. Admin page list

| Path |
|------|
| `/admin/areas` |
| `/admin/areas/new` |
| `/admin/areas/[id]/edit` |

### 4. Prisma / migration status

| Step | Result |
|------|--------|
| `npx prisma format` | Passed |
| `npx prisma generate` | Passed |
| `npx prisma migrate status` | **Database schema is up to date** (3 migrations); pending migration: **none** on validation DB |
| `npx prisma migrate dev` | **Not run** — not required when status is up to date (no reset, no data deletion) |

### 5. Seed data status

| Item | Detail |
|------|--------|
| Script | `npm run db:seed` → `prisma db seed` → `tsx prisma/seed.ts` |
| Safety | Upsert-based; **does not wipe** existing rows |
| Run | Executed successfully on validation host |

### 6. Test / build / lint results

| Command | Result |
|---------|--------|
| `npm run lint` | Passed |
| `npm run build` | Passed |
| Automated tests | Not part of Task Card 03 |

### 7. Known limitations

- No **toast** library; inline errors and **`window.confirm`** for deactivate.
- Client **`AreaType`** from **`@/generated/prisma/browser`**; small **`readAdminJson`** helper inlined in area UI components (bundler constraint).
- **Public/mobile** read-only geography endpoints not built (admin session required for `/api/admin/areas`).
- **Unified `Area`** vs **`Division`…`Village`** duplication remains until a consolidation milestone.

### 8. Changed files (validation pass)

| Path | Note |
|------|------|
| `docs/AREA_SYSTEM_PLAN.md` | This report + status/executive refresh |
| `prisma/schema.prisma` | Output of **`npx prisma format`** |
| `src/generated/prisma/*` | Output of **`npx prisma generate`** |

### 9. Next task recommendation

**Next card:** **Customer/mobile geography read API** (cascading picks or tree, proper auth) **and/or** **`ServiceRequest` location policy** (`villageId` vs `areaId`); add **automated tests** when the stack for API/UI tests is chosen.

