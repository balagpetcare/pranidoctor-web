# Prani Doctor — Admin Web Audit

**Repository:** `pranidoctor-web`  
**Audit date:** 2026-05-22  
**Scope:** Admin panel only (`/admin/*`, `/enterprise/*` review shell)  
**Backend:** Express API (`pranidoctor-backend`) via proxy — web is API-consumer mode

---

## Executive Summary

The admin web is a **Next.js App Router** application with **50 admin pages** and **6 enterprise review pages**, sharing a unified shell (`AdminLayoutShell`). The architecture is mature for core operational modules (doctors, AI technicians, service requests, billing, knowledge hub, semen/breeding). **Five modules remain stub placeholders** despite some having backend APIs available elsewhere.

| Metric | Count |
|--------|-------|
| Admin `page.tsx` files | 50 |
| Enterprise review pages | 6 |
| Admin API route handlers (`/api/admin/*`) | 71 |
| Sidebar-linked routes | 22 (+ enterprise review) |
| Stub pages (`AdminPlaceholder`) | 5 |
| Implemented feature modules | ~17 |

**Overall completion estimate:** ~75% of navigable admin modules are functional; ~10% are partial/inconsistent; ~15% are stubs or dead routes.

---

## 1. Architecture & Environment

### 1.1 API-consumer mode

Web does **not** access the database directly. `src/lib/prisma.ts` throws on use. All business logic flows:

```
Browser → same-origin /api/* → proxyRouteToBackend → BACKEND_URL (Express)
Server Components → serverInternalJson/serverInternalFetch → /api/* → backend
```

~172 of 176 `/api/*` routes are thin proxies (`src/lib/proxy-to-backend.ts`).

### 1.2 Environment variables (from `.env.example`)

| Variable | Purpose | Notes |
|----------|---------|-------|
| `APP_URL` | Server-side app origin | Example: `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public links | Same as above in example |
| `NEXT_PUBLIC_API_URL` | Canonical API base | `http://localhost:3000/api` |
| `BACKEND_URL` | Express origin for proxy | `http://localhost:3000` |
| `ADMIN_JWT_SECRET` | Admin JWT signing | Must match backend |
| `SESSION_COOKIE_NAME` | Documented as `prani_admin_token` | **Not wired** — hardcoded in `constants.ts` |
| `NEXTAUTH_*` | NextAuth placeholders | **Unused** |
| `OTP_DEBUG_PANEL_ENABLED` | Gates dev OTP logs page | Used by `/admin/dev-tools/otp-logs` |

**Misconfiguration risk:** `.env.example` sets `APP_URL`, `NEXT_PUBLIC_API_URL`, and `BACKEND_URL` all to `:3000` while comments say run Next.js on `:3001`. Same-origin `/api/*` works when Next proxies correctly, but `server-internal` health checks against `BACKEND_URL` fail if only Next is running on 3000.

### 1.3 Routing structure

```
src/app/admin/
├── layout.tsx                 # Root: fonts, base styles
├── login/page.tsx             # /admin/login (no sidebar)
└── (dashboard)/               # Route group — omitted from URL
    ├── layout.tsx             # Auth guard + AdminLayoutShell
    ├── page.tsx               # /admin
    └── [feature]/page.tsx     # All other admin pages

src/app/enterprise/(dashboard)/
└── services/review/...        # /enterprise/services/review/*
```

No `pages/` directory. No admin-specific `loading.tsx`, `error.tsx`, or `not-found.tsx`.

---

## 2. Current Admin Pages

### 2.1 Complete modules (functional UI + API integration)

| URL | Module | Key components | Primary APIs |
|-----|--------|----------------|--------------|
| `/admin` | Dashboard | `AdminDashboardView` | `GET /api/admin/dashboard/page-data` |
| `/admin/areas` | Areas CRUD | `AreasList`, `AreaForm` | `/api/admin/areas` |
| `/admin/locations` | Location master hub | Server page + sub-routes | `/api/admin/locations/*` |
| `/admin/locations/missing-coords` | Missing coordinates table | Inline table (non-standard) | `/api/admin/locations/missing-coords` |
| `/admin/locations/pending-verification` | Pending verification table | Inline table | `/api/admin/locations/pending-verification` |
| `/admin/doctors` | Doctors CRUD | `DoctorsList`, `DoctorProfileForm`, `DoctorDetailPanel` | `/api/admin/doctors`, `/api/admin/doctors/[id]/*` |
| `/admin/ai-technicians` | AI technicians CRUD | `TechniciansList`, `TechnicianProfileForm`, `TechnicianDetailPanel` | `/api/admin/ai-technicians` |
| `/admin/ai-technicians/applications` | Application review | `ApplicationsList`, `ApplicationReviewPanel` | `/api/admin/ai-technician-applications` |
| `/admin/ai-technician-complaints` | Complaints admin | `AiTechnicianComplaintsAdmin` | `/api/admin/ai-technician-complaints` |
| `/admin/semen-providers` | Semen providers | `SemenProvidersList`, `SemenProviderForm` | `/api/admin/semen-providers` |
| `/admin/livestock-breeds` | Livestock breeds | `LivestockBreedsList`, `LivestockBreedForm` | `/api/admin/livestock-breeds` |
| `/admin/semen-service-templates` | Semen templates | `SemenServiceTemplatesList`, `SemenServiceTemplateForm`, detail view | `/api/admin/semen-service-templates` |
| `/admin/service-requests` | Service requests | `ServiceRequestsList`, `ServiceRequestDetailPanel` | `/api/admin/service-requests` |
| `/admin/billing` | Billing | `AdminBillingList`, `AdminBillingDetail` | `/api/admin/billing` |
| `/admin/settings/billing` | Billing settings | `AdminBillingSettingsForm` | `/api/admin/settings/billing` |
| `/admin/knowledge-hub` | Knowledge hub hub | Links to categories/posts | — |
| `/admin/knowledge-hub/categories` | KH categories | `KnowledgeHubCategoriesList`, `KnowledgeHubCategoryForm` | `/api/admin/content-categories` |
| `/admin/knowledge-hub/posts` | KH posts | `KnowledgeHubPostsList`, `KnowledgeHubPostForm`, detail | `/api/admin/tutorials` |
| `/admin/notifications` | Notifications & SMS | `AdminNotificationsPanel`, `AdminSmsLogsSection` | `/api/notifications`, SMS endpoints |
| `/admin/dev-tools/otp-logs` | Dev OTP logs | Gated by env | `/api/admin/dev-tools/otp-logs` |
| `/admin/login` | Login | `AdminLoginForm` | `POST /api/admin/auth/login` |
| `/enterprise/services/review` | Enterprise service review | `ServiceInstancesReviewConsole` | `/api/admin/service-instances` |

### 2.2 Stub / placeholder pages (in sidebar nav)

| URL | Status | API available? |
|-----|--------|----------------|
| `/admin/customers` | `AdminPlaceholder` | **No** admin list API; mobile has `/api/mobile/me`, animals |
| `/admin/animals` | `AdminPlaceholder` | **No** admin list API; mobile has `/api/mobile/animals` |
| `/admin/reports` | `AdminPlaceholder` (চিকিৎসা রেকর্ড) | **No** admin reports API |
| `/admin/prescriptions` | `AdminPlaceholder` | **No** admin prescriptions API; doctor panel has `/api/doctor/service-requests/[id]/prescriptions` |

### 2.3 Stub page (not in sidebar — dead route)

| URL | Status | API available? |
|-----|--------|----------------|
| `/admin/service-categories` | `AdminPlaceholder` | **Yes** — `GET/POST /api/admin/service-categories` used by doctor/technician forms |

### 2.4 Partial / minimal modules

| URL | Status |
|-----|--------|
| `/admin/settings` | Link hub to billing settings only |
| `/admin/locations` | Functional but uses bespoke `StatCard` and inline tables, not `AdminTable`/`AdminStatCard` |

### 2.5 Secondary routes (expected — reached via CTAs, not sidebar)

All `/new`, `/[id]`, `/[id]/edit`, and detail routes under implemented modules. Enterprise tab deep-links (`/enterprise/services/review/pending`, etc.) are routable but **not linked** — console uses in-page tabs.

---

## 3. Existing Layout

### 3.1 Layout hierarchy

| File | Scope | Responsibility |
|------|-------|----------------|
| `src/app/admin/layout.tsx` | All `/admin/*` | Bengali fonts, `min-h-screen`, light/dark base |
| `src/app/admin/(dashboard)/layout.tsx` | Dashboard pages | `ensureAdminDashboardAccess()` + `AdminLayoutShell` |
| `src/app/enterprise/(dashboard)/layout.tsx` | Enterprise pages | Same shell + same guard |
| `src/app/admin/admin-shell.css` | Dashboard shell styles | Imported by dashboard layout |
| `src/app/admin/admin-typography.css` | Typography | Root admin layout |

### 3.2 Shell components (`src/components/admin-ui/`)

| Component | Role |
|-----------|------|
| `AdminLayoutShell` | Full app shell: sidebar, topbar, content, footer, theme, mobile overlay, sign-out |
| `AdminSidebar` + `AdminSidebarGroup` | Collapsible grouped navigation |
| `AdminTopbar` | Mobile menu, section title, theme customizer, profile/notifications menus |
| `AdminContent` | Main scroll area; optional contained width |
| `AdminFooter` | Optional footer |
| `AdminThemeProvider` + `AdminThemeCustomizer` | Theme persistence (appearance, sidebar, content width) |

Navigation config: `admin-nav.tsx` + `admin-nav-sections.ts` (11 groups, Bengali labels).

**Deprecated aliases:** `AdminDashboardShell` → re-exports `AdminLayoutShell`; `StatCard` in `admin/` → re-exports `AdminStatCard`.

---

## 4. Existing Components

### 4.1 Design system (`admin-ui`)

No shadcn `@/components/ui` layer. Styling is Tailwind + CSS variables (`--pd-admin-*`).

**Page chrome:** `AdminPageHeader`, `AdminFormSection`, `AdminActionButton`, `AdminBadge`, `AdminStatCard`  
**States:** `AdminEmptyState`, `AdminLoadingState`, `AdminErrorState`, `FormAsyncControlSkeleton`  
**Tables:** `AdminTable` (wrapper only — consumers supply `<thead>`/`<tbody>`)

### 4.2 Domain components (`src/components/admin/`)

Organized by feature: `areas/`, `doctors/`, `ai-technicians/`, `service-requests/`, `billing/`, `knowledge-hub/`, `semen/`, `notifications/`, `media/`, `rich-text/`.

**Schema form:** `src/components/schema-form/PraniSchemaRenderer.tsx` — used for enterprise review.

**Enterprise:** `src/components/enterprise/ServiceInstancesReviewConsole.tsx`, `ServiceInstanceActionSheet.tsx`.

### 4.3 Modals / overlays

| Component | Scope |
|-----------|-------|
| `ImageCropperModal` | Reusable image crop (`react-easy-crop`) |
| `ServiceInstanceActionSheet` | Enterprise confirm/note sheet |
| `ApplicationReviewPanel` | Full-page review (not generic modal) |

No generic `AdminModal` / `AdminDialog` primitive.

---

## 5. Existing State Management

| Approach | Used? | Location |
|----------|-------|----------|
| Redux / Zustand / Jotai | No | — |
| TanStack React Query / SWR | No | — |
| React Context | Yes (UI only) | `AdminThemeContext` / `AdminThemeProvider` |
| `next-themes` | Yes | Theme appearance |
| Component `useState` | Yes | All lists, forms, login |
| Server state (RSC) | Yes | Dashboard, locations hub, some detail pages |
| `react-hook-form` | In deps, **unused** | — |

**Data-fetch pattern:**

- **Client lists:** `useState` + `useEffect` → `adminFetch` → `readAdminJson` → offset pagination (`PAGE_SIZE = 20`)
- **Server pages:** `serverInternalJson` / feature-specific admin clients
- **Forms:** Controlled React state → inline validation → `POST/PATCH` → server Zod

---

## 6. Existing API Services

### 6.1 HTTP layer

| File | Role |
|------|------|
| `src/lib/proxy-to-backend.ts` | Proxies App Router requests to `BACKEND_URL` |
| `src/lib/api-client.ts` | Server-only backend client |
| `src/lib/server-internal.ts` | RSC/guards: backend calls with forwarded cookies |
| `src/lib/admin/admin-fetch.ts` | Browser fetch with `credentials: "same-origin"` |
| `src/lib/admin/read-admin-json.ts` | Parses `{ ok, data }` envelope; redirects on 401 |
| `src/lib/admin/fetch-with-retry.ts` | Retry wrapper for bootstrap |

**Axios** is in `package.json` but **not imported** anywhere in `src/`.

### 6.2 Admin API routes (71 handlers)

Grouped by domain:

- **Auth:** `auth/login`, `auth/logout`, `auth/me`
- **Dashboard:** `dashboard/page-data`
- **Areas, doctors, AI technicians, applications, complaints**
- **Locations:** `stats`, `missing-coords`, `pending-verification`, `duplicates`, `import-report`
- **Service requests, service instances, service categories**
- **Semen:** providers, breeds, templates
- **Billing, settings/billing**
- **Knowledge hub:** `content-categories`, `tutorials`
- **Uploads, dev-tools/otp-logs, health**

All proxied except `health` (local check).

### 6.3 Legacy `src/lib/*-service.ts` files (41 files)

Pre-migration Prisma services remain (e.g. `admin-billing-service.ts`, `otp-service.ts`, `notification-service.ts`). Route handlers **no longer import** these — auth enforcement is on backend. Schemas and types may still be referenced.

**Active backend clients (non-proxy direct use):**

- `src/lib/admin-semen/templates-service.ts`
- `src/lib/locations/location-master-admin-client.ts`
- `src/app/admin/(dashboard)/_lib/dashboard-stats.ts`

### 6.4 Dead API guard code

Defined but **not imported** by any route handler:

- `src/lib/admin-auth/api-guard.ts` — `requireAdminApiActor`
- `src/lib/doctor-auth/api-guard.ts`
- `src/lib/technician-auth/api-guard.ts`
- `src/lib/notifications/guard.ts`

---

## 7. Existing Auth Flow

### 7.1 Admin authentication

| Piece | Detail |
|-------|--------|
| Cookie | `prani_admin_token` (`ADMIN_SESSION_COOKIE`) — httpOnly, 7 days |
| JWT lib | `src/lib/admin-auth/jwt.ts`, `secrets.ts`, `cookies.ts`, `session.ts` |
| Login | `AdminLoginForm` → `POST /api/admin/auth/login` (proxied) |
| Logout | `AdminLayoutShell` → `POST /api/admin/auth/logout` |
| Actor resolution | `panel-access.ts` → `GET /api/admin/auth/me` via `serverInternalJson` |
| Secret | `ADMIN_JWT_SECRET` (fallbacks: `AUTH_SECRET`, `JWT_SECRET`) |

### 7.2 Dual verification layers

1. **Edge middleware** (`src/middleware.ts`): Local JWT verify only — fast gate for HTML routes
2. **Server layout guard** (`ensureAdminDashboardAccess`): JWT + backend `/auth/me` actor check — revokes stale sessions

**Requirement:** JWT secrets must match between web and backend or users pass middleware but fail layout (or vice versa).

### 7.3 Auth flow diagram

```
Login → POST /api/admin/auth/login → backend sets JWT cookie
       ↓
Request /admin/* → middleware verifies JWT locally
       ↓
Dashboard layout → ensureAdminDashboardAccess → GET /api/admin/auth/me
       ↓
Client fetch → adminFetch /api/admin/* → proxy → backend (cookie forwarded)
       ↓
401 → readAdminJson redirects to /admin/login?next=...
```

### 7.4 Documentation mismatch

`docs/ADMIN_AUTH_PLAN.md` may reference 24-hour sessions; code uses **7 days** (`ADMIN_SESSION_MAX_AGE`).

---

## 8. Existing Route Guards

### 8.1 Edge middleware

**File:** `src/middleware.ts`  
**Matcher:** `/admin`, `/admin/:path*`, `/doctor`, `/doctor/:path*`

| Path | Behavior |
|------|----------|
| `/admin/login` | Redirect to `/admin` if JWT valid |
| Other `/admin/*` | Require valid JWT; else redirect to login with `?next=` |
| `/api/*` | **Not protected** by middleware |
| `/enterprise/*` | **Not in matcher** — relies on server layout guard only |

### 8.2 Server guards

| Guard | File | Used in |
|-------|------|---------|
| `ensureAdminDashboardAccess` | `dashboard-guard.ts` | Admin + enterprise dashboard layouts |
| `ensureDoctorDashboardAccess` | `doctor-auth/dashboard-guard.ts` | Doctor dashboard (out of admin scope) |

### 8.3 Client-side guard

`readAdminJson` handles 401 by redirecting to login.

### 8.4 Role-based nav filtering

`navItemIsVisible()` in `admin-nav.tsx` always returns `true`. `permission` field on nav items is reserved but **not enforced**.

---

## 9. Existing Dashboard

### 9.1 Implementation

| File | Role |
|------|------|
| `src/app/admin/(dashboard)/page.tsx` | Server page: session + `getAdminDashboardPageData()` |
| `src/app/admin/(dashboard)/_lib/dashboard-stats.ts` | Fetches from `/api/admin/dashboard/page-data` |
| `src/app/admin/(dashboard)/_components/AdminDashboardView.tsx` | KPI cards, quick links, recent requests table |

### 9.2 Dashboard data

**Stats:** total doctors, AI technicians, customers, service requests, pending/completed counts, revenue display  
**Recent requests:** Last N service requests with status badges  
**Notifications:** Unread count

### 9.3 Issues

- Service request status labels duplicated inline in `AdminDashboardView` instead of reusing `service-request-labels.ts`
- Customer count shown on dashboard but `/admin/customers` page is a stub

---

## 10. Existing Tables

### 10.1 Shared primitive

`AdminTable` — card wrapper + optional toolbar. **Not a data grid library.** No TanStack Table, AG Grid, or React Data Grid.

### 10.2 Standard list pattern

Client components with:

- `adminFetch` + `readAdminJson`
- Offset pagination (`PAGE_SIZE = 20`)
- Toolbar filters
- `AdminLoadingState` / `AdminEmptyState` / `AdminErrorState`
- Row actions via `AdminActionButton`

| Component | Domain |
|-----------|--------|
| `AreasList` | Areas |
| `DoctorsList` | Doctors |
| `TechniciansList` | AI technicians |
| `ApplicationsList` | Applications |
| `AiTechnicianComplaintsAdmin` | Complaints |
| `ServiceRequestsList` | Service requests |
| `AdminBillingList` | Billing |
| `KnowledgeHubCategoriesList` | KH categories |
| `KnowledgeHubPostsList` | KH posts |
| `AdminNotificationsPanel` | Notifications |
| `AdminSmsLogsSection` | SMS logs |
| `SemenServiceTemplatesList` | Semen templates |
| `SemenProvidersList` | Semen providers |
| `LivestockBreedsList` | Livestock breeds |
| `ServiceInstancesReviewConsole` | Enterprise review |

### 10.3 Non-standard tables

| Location | Issue |
|----------|-------|
| `locations/missing-coords/page.tsx` | Inline `<table>` with `neutral-*` classes |
| `locations/pending-verification/page.tsx` | Same pattern |
| `locations/page.tsx` | Bespoke `StatCard`, not `AdminStatCard` |

---

## 11. Existing Forms

### 11.1 Form layout

`AdminFormSection` — bordered card with optional section title. Used across profile forms, settings, semen, KH, billing.

### 11.2 Validation pattern

**All forms use controlled React state — no `react-hook-form`.**

Flow: inline client checks → `setFormError` → `AdminErrorState` → `POST/PATCH` → server Zod schemas in `src/lib/*/schemas.ts`.

| Form | Domain |
|------|--------|
| `AreaForm` | Areas |
| `DoctorProfileForm` | Doctors (+ service categories multi-select) |
| `TechnicianProfileForm` | AI technicians |
| `KnowledgeHubCategoryForm` | KH categories |
| `KnowledgeHubPostForm` | KH posts |
| `SemenProviderForm`, `LivestockBreedForm` | Semen masters |
| `SemenServiceTemplateForm` | Large monolithic form (~1400+ lines) |
| `AdminBillingSettingsForm` | Billing settings |
| `AdminLoginForm` | Login (API error code mapping) |

### 11.3 Input styling duplication

| Helper | Location | Used by |
|--------|----------|---------|
| `inputClassName()` | Copied in ~11 files | Most admin lists/forms |
| `khInputClass()`, `khLabelClass()`, etc. | `knowledge-hub/styles.ts` | KH + semen forms |

### 11.4 Server-side Zod schemas (present, not wired to form library)

- `admin-doctors/schemas.ts`
- `admin-ai-technicians/schemas.ts`
- `admin-ai-technician-applications/schemas.ts`
- `admin-service-requests/schemas.ts`
- `admin-billing/schemas.ts`
- `admin-semen/schemas.ts`

### 11.5 Detail panels (read + actions)

`DoctorDetailPanel`, `TechnicianDetailPanel`, `ServiceRequestDetailPanel`, `AdminBillingDetail`, `KnowledgeHubPostDetailView`, `SemenServiceTemplateDetailView`, `ApplicationReviewPanel`.

---

## 12. Duplicate Implementations

| Duplicate | Locations | Recommendation |
|-----------|-----------|----------------|
| Rich text stack | `admin/rich-text/` vs `admin/rich-text-editor/` | Collapse to single barrel |
| `RichTextEditor` import paths | `semen-template/RichTextEditor.tsx` vs direct | Unify import path |
| `ImageCropperModal` | `media/` vs `semen-template/` (re-export) | Keep one source |
| Semen template aliases | `semen-template/TemplateForm`, `GalleryUploader` | Re-exports only — low priority |
| `inputClassName()` | 11 files | Extract to `admin-ui/admin-input-styles.ts` |
| `khInputClass` vs `inputClassName` | Two design tokens | Consolidate |
| Service request status labels | `service-request-labels.ts` vs `AdminDashboardView` | Reuse shared labels |
| Stat cards | `AdminStatCard` vs local `StatCard` in locations | Migrate locations page |
| Table chrome | `AdminTable` vs raw tables on location subpages | Migrate to `AdminTable` |
| Layout shell name | `AdminLayoutShell` vs `AdminDashboardShell` | Alias only — document deprecation |
| Legacy `*-service.ts` | 41 files in `src/lib/` | Audit and remove dead code |

---

## 13. Dead Pages & Unlinked Routes

| Route | Classification | Notes |
|-------|----------------|-------|
| `/admin/service-categories` | Dead (no nav link) | API exists and is used from doctor/technician forms |
| `/enterprise/services/review/pending` (+ approved, published, archived, needs-correction) | Deep-link only | Console uses in-page tabs; zero in-repo `href` links |
| `/admin/customers`, `/admin/animals`, `/admin/reports`, `/admin/prescriptions` | Stub in nav | Visible in sidebar but non-functional |
| CRUD sub-routes (`/new`, `/[id]/edit`) | Expected secondary | Reached from list CTAs — not dead |
| `/admin/settings/billing` | Secondary | Linked from settings hub, profile menu, billing list |

---

## 14. API Mismatch Analysis

### 14.1 APIs without admin UI pages

| API endpoint | UI status | Notes |
|--------------|-----------|-------|
| `GET/POST /api/admin/service-categories` | Stub page exists, not in nav | Used inline in doctor/technician forms |
| `GET /api/admin/locations/duplicates` | No dedicated page | Stats shown on locations hub; no drill-down UI |
| `GET /api/admin/locations/import-report` | Read from filesystem client | Not a live API call from UI |
| Doctor/technician sub-resource APIs | No standalone admin pages | Embedded in profile forms (working areas, fees, availability, etc.) |

### 14.2 UI modules without admin APIs

| Page | Gap |
|------|-----|
| `/admin/customers` | No `/api/admin/customers`; mobile APIs exist (`/api/mobile/me`, profile) |
| `/admin/animals` | No `/api/admin/animals`; mobile has `/api/mobile/animals` |
| `/admin/reports` | No admin treatment records API |
| `/admin/prescriptions` | No admin prescriptions API; doctor panel has prescription endpoints per service request |

### 14.3 Cross-namespace API usage

| UI module | API namespace | Notes |
|-----------|---------------|-------|
| `AdminNotificationsPanel` | `/api/notifications` (not `/api/admin/notifications`) | Shared notifications API — intentional but inconsistent prefix |
| Knowledge hub | `/api/admin/content-categories` + `/api/admin/tutorials` | Naming differs from UI label "Knowledge Hub" |

### 14.4 Auth / env mismatches

| Issue | Impact |
|-------|--------|
| JWT secret mismatch web ↔ backend | Middleware pass + layout fail (or reverse) |
| `BACKEND_URL` port collision in `.env.example` | Health checks and proxy failures in local dev |
| Dead `api-guard.ts` modules | False sense of route protection if edited |
| `SESSION_COOKIE_NAME` env not wired | Env change has no effect |
| Docs say 24h session, code says 7d | Operator confusion |

### 14.5 Technician panel (out of admin scope but related)

API routes exist (`/api/technician/*`), auth lib exists, but **no `/technician` HTML pages** and **no middleware** (explicit TODO in `middleware.ts`).

---

## 15. Module Completion Matrix

| Module | Page | List | Create | Edit | Detail | API | Nav |
|--------|------|------|--------|------|--------|-----|-----|
| Dashboard | ✅ | — | — | — | — | ✅ | ✅ |
| Areas | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Locations | ✅ | partial | — | — | — | ✅ | ✅ |
| Doctors | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI Technicians | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI Applications | ✅ | ✅ | — | — | ✅ | ✅ | ✅ |
| AI Complaints | ✅ | ✅ | — | — | — | ✅ | ✅ |
| Enterprise Review | ✅ | ✅ | — | — | ✅ | ✅ | ✅ |
| Semen Providers | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Livestock Breeds | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Semen Templates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Requests | ✅ | ✅ | — | — | ✅ | ✅ | ✅ |
| Billing | ✅ | ✅ | — | — | ✅ | ✅ | ✅ |
| Billing Settings | ✅ | — | — | ✅ | — | ✅ | secondary |
| Knowledge Hub | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | — | — | — | ✅ | ✅ |
| Dev OTP Logs | ✅ | ✅ | — | — | — | ✅ | ✅ |
| Settings | partial | — | — | — | — | partial | ✅ |
| Service Categories | stub | — | — | — | — | ✅ | ❌ |
| Customers | stub | — | — | — | — | ❌ | ✅ |
| Animals | stub | — | — | — | — | ❌ | ✅ |
| Reports | stub | — | — | — | — | ❌ | ✅ |
| Prescriptions | stub | — | — | — | — | ❌ | ✅ |

---

## 16. Recommended Completion Priorities

Ordered by impact and existing backend readiness:

1. **Service Categories admin page** — API exists; wire list/CRUD UI; add to nav or merge into settings
2. **Customers admin module** — Requires new `/api/admin/customers` on backend (or proxy mobile data with admin guard)
3. **Animals admin module** — Requires new `/api/admin/animals` on backend
4. **Prescriptions / Treatment records** — Backend admin APIs needed; doctor panel endpoints exist as reference
5. **Locations UI consistency** — Migrate to `AdminTable`/`AdminStatCard`; add duplicates drill-down page
6. **Enterprise tab deep-links** — Either link from console or remove unused routes
7. **Consolidation** — Shared `inputClassName`, rich-text barrels, remove dead `*-service.ts` and `api-guard.ts`
8. **Env/docs alignment** — Fix `.env.example` ports, wire or remove `SESSION_COOKIE_NAME`, update session TTL docs

---

## 17. Key File Reference

| Concern | Path |
|---------|------|
| Admin pages | `src/app/admin/` |
| Enterprise review | `src/app/enterprise/(dashboard)/services/review/` |
| Shell / design system | `src/components/admin-ui/` |
| Domain components | `src/components/admin/` |
| Navigation | `src/components/admin-ui/admin-nav.tsx` |
| Middleware | `src/middleware.ts` |
| Dashboard guard | `src/lib/admin-auth/dashboard-guard.ts` |
| Admin fetch helper | `src/lib/admin/admin-fetch.ts` |
| API proxy | `src/lib/proxy-to-backend.ts` |
| Admin API routes | `src/app/api/admin/` |
| Placeholder component | `src/components/admin/AdminPlaceholder.tsx` |
| Existing admin docs | `docs/ADMIN_*.md`, `docs/ADMIN_CREDENTIAL_SETUP.md` |

---

*Generated by frontend architecture audit — repository: `pranidoctor-web` only.*
