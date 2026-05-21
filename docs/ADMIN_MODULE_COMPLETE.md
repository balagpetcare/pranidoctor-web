# Admin Modules — Complete

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` priority admin modules (P0 → P2)  
**Prerequisites:** [ADMIN_LAYOUT_COMPLETE.md](./ADMIN_LAYOUT_COMPLETE.md), [ADMIN_API_MAPPING.md](./ADMIN_API_MAPPING.md)

---

## Summary

All sixteen priority modules are addressed: **full CRUD/list UX** where backend APIs exist; **structured blocked UI** (`AdminModuleUnavailable`) where they do not; **read-only** panels for roles/permissions and service categories (GET-only API).

| Priority | Module | Route | Status |
|----------|--------|-------|--------|
| P0 | Dashboard | `/admin` | ✅ Complete |
| P0 | Users | `/admin/customers`, `/admin/users` | ⏸ Blocked — no list API |
| P0 | Doctors | `/admin/doctors` | ✅ Complete |
| P0 | Roles | `/admin/settings/roles` | ✅ Read-only matrix |
| P0 | Permissions | `/admin/settings/permissions` | ✅ Read-only matrix |
| P1 | Animal | `/admin/animals` | ⏸ Blocked — no API |
| P1 | Cases | `/admin/cases` | ✅ Alias → service-requests |
| P1 | Appointments | `/admin/appointments` | ✅ Alias → service-requests |
| P1 | Payments | `/admin/billing` | ✅ Complete |
| P1 | Reports | `/admin/reports` | ✅ Dashboard stats + completed list |
| P2 | Settings | `/admin/settings` | ✅ Hub (+ billing link) |
| P2 | Notifications | `/admin/notifications` | ✅ In-app panel; SMS logs empty |
| P2 | Analytics | `/admin/analytics` | ✅ Dashboard API reuse |
| P2 | Audit | `/admin/audit` | ⚠ Partial — OTP logs only |

**Legend:** ✅ = production-ready for existing API · ⏸ = blocked pending backend · ⚠ = partial

---

## Feature matrix (requested checklist)

| Module | API | Table | Filter | Search | Pagination | Form | Validation | Error | Loading | Empty |
|--------|-----|-------|--------|--------|------------|------|------------|-------|---------|-------|
| Dashboard | ✅ | ✅ | — | — | — | — | — | ✅ | ✅ | ✅ |
| Users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | — | ✅ |
| Doctors | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Roles | ✅¹ | ✅ | — | — | — | ❌² | — | — | — | — |
| Permissions | ✅¹ | ✅ | — | — | — | ❌² | — | — | — | — |
| Animal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | — | ✅ |
| Cases | ✅ | ✅ | ✅ | — | ✅ | — | — | ✅ | ✅ | ✅ |
| Appointments | ✅ | ✅ | ✅ | — | ✅ | — | — | ✅ | ✅ | ✅ |
| Payments | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ | — | ✅ | — | — | ✅ | ✅ | ✅ |
| Settings | ✅³ | — | — | — | — | ✅³ | ✅³ | — | — | — |
| Notifications | ✅ | ✅ | ✅ | — | ✅ | — | — | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | — | — | — | — | — | ✅ | ✅ | — |
| Audit | ⚠ | ⚠ | — | — | — | — | — | ✅ | ✅ | ✅ |

¹ Client-side matrix from `permissions.ts` (no REST CRUD)  
² Role/capability assignment is code/config — no admin mutation API  
³ Billing settings sub-route only

---

## New & updated files

### Shared

| File | Purpose |
|------|---------|
| `src/components/admin/shared/AdminModuleUnavailable.tsx` | Blocked-module UI with feature checklist + missing API hint |

### P0 — Users, Roles, Permissions

| Route | Component | API |
|-------|-----------|-----|
| `/admin/customers` | `AdminModuleUnavailable` | Needs `GET /api/admin/customers` |
| `/admin/users` | `AdminModuleUnavailable` | Needs `GET /api/admin/users` |
| `/admin/settings/roles` | `RolesAdminPanel` | `getAdminPanelRoleAccessMatrix()` |
| `/admin/settings/permissions` | `PermissionsAdminPanel` | `ADMIN_ENTERPRISE_CAPABILITIES` |

### P1 — Animals, Cases, Appointments, Reports

| Route | Component | API |
|-------|-----------|-----|
| `/admin/animals` | `AdminModuleUnavailable` | Needs `GET /api/admin/animals` |
| `/admin/cases` | `ServiceRequestsList` | `GET /api/admin/service-requests` |
| `/admin/appointments` | `ServiceRequestsList` | Same |
| `/admin/reports` | `ReportsAdminView` | `GET /api/admin/dashboard/page-data` + service-requests (COMPLETED) |

### P2 — Settings, Notifications, Analytics, Audit

| Route | Component | API |
|-------|-----------|-----|
| `/admin/settings` | Settings hub | Links to billing, roles, permissions, audit |
| `/admin/notifications` | Existing panels | `GET /api/notifications`; SMS logs — no API |
| `/admin/analytics` | `AnalyticsAdminView` | `GET /api/admin/dashboard/page-data` |
| `/admin/audit` | `AuditAdminHub` | OTP: `GET /api/admin/dev-tools/otp-logs`; auth audit blocked |

### Also completed (System)

| Route | Component | API |
|-------|-----------|-----|
| `/admin/service-categories` | `ServiceCategoriesList` | `GET /api/admin/service-categories` (read-only) |

### Permissions library

| File | Change |
|------|--------|
| `src/lib/admin-auth/permissions.ts` | Exported `ADMIN_ENTERPRISE_CAPABILITIES`, `getAdminPanelRoleAccessMatrix()` |

### Navigation & shell

| File | Change |
|------|--------|
| `src/components/admin-ui/admin-nav.tsx` | Analytics, Cases, Appointments, Audit, Roles, Permissions |
| `src/components/admin-ui/admin-breadcrumbs.ts` | New segment labels |
| `src/components/admin/service-requests/ServiceRequestsList.tsx` | `initialStatus` prop for reports |

---

## Module details

### P0 — Dashboard (`/admin`)

- **API:** `GET /api/admin/dashboard/page-data`
- **Component:** `AdminDashboardView` (server-loaded)
- **Features:** KPI cards, recent requests table, quick links, unread count

### P0 — Users (`/admin/customers`, `/admin/users`)

- **Gap:** No admin customer/user list or detail endpoints in backend
- **UI:** `AdminModuleUnavailable` with checklist; dashboard still shows `totalCustomers` aggregate
- **Backend needed:** `GET /api/admin/customers` (paginated, search, filters)

### P0 — Doctors (`/admin/doctors`)

- **API:** Full CRUD under `/api/admin/doctors/*`
- **Component:** `DoctorsList`, `DoctorProfileForm`
- **Reference pattern** for list modules

### P0 — Roles & Permissions

- **Routes:** `/admin/settings/roles`, `/admin/settings/permissions`
- **Source of truth:** `src/lib/admin-auth/permissions.ts`
- **Roles:** SUPER_ADMIN, ADMIN, SUPPORT (panel sign-in)
- **Capabilities:** `serviceInstance.view`, `.review`, `.publish`
- **Note:** No REST API to mutate roles — JWT `UserRole` from database

### P1 — Animal (`/admin/animals`)

- **Gap:** No `GET /api/admin/animals`
- **Workaround:** Animal snippet visible on service-request rows

### P1 — Cases & Appointments

- **Mapping:** Operational “cases” and “appointments” = service requests
- **Routes:** `/admin/cases`, `/admin/appointments` reuse `ServiceRequestsList`
- **Canonical route:** `/admin/service-requests`

### P1 — Payments (`/admin/billing`)

- **Already complete** — invoice list, detail, commission settings

### P1 — Reports (`/admin/reports`)

- **No dedicated reports API**
- **Implementation:** Treatment summary stats from dashboard API + completed service-request table (`initialStatus=COMPLETED`)

### P2 — Settings (`/admin/settings`)

- Hub links: billing, roles, permissions, audit, OTP logs

### P2 — Notifications (`/admin/notifications`)

- **In-app:** `AdminNotificationsPanel` — filter unread, mark read, pagination
- **SMS status:** Server snapshot (no secrets)
- **SMS logs:** `AdminEmptyState` — no persistence API (`GET /api/admin/sms/logs` future)

### P2 — Analytics (`/admin/analytics`)

- Client fetch of dashboard page-data
- Stat grid + quick links to reports, billing, service-requests

### P2 — Audit (`/admin/audit`)

- **OTP dev logs:** Embedded `AdminOtpDevLogsPanel`
- **Auth audit:** Documented gap — backend has `auth-audit.service.ts` but no `GET /api/admin/audit/auth`

---

## Backend gaps (action items)

| Endpoint | Unblocks |
|----------|----------|
| `GET /api/admin/customers` | Users module (table, search, pagination) |
| `GET /api/admin/animals` | Animal profiles |
| `GET /api/admin/prescriptions` | Prescriptions stub |
| `GET /api/admin/reports` or treatment export | Dedicated reports (optional; dashboard + SR list covers MVP) |
| `POST/PATCH /api/admin/service-categories` | Category create/edit |
| `GET /api/admin/audit/auth` | Auth audit hub |
| `GET /api/admin/sms/logs` | SMS delivery table |
| `GET/POST /api/admin/roles` | Mutable role admin (optional) |

---

## Testing

```bash
npm run typecheck   # ✅ passes
```

**Manual smoke:**

1. `/admin` — dashboard loads
2. `/admin/service-categories` — table + search
3. `/admin/reports` — stats + completed requests
4. `/admin/analytics` — refresh stats
5. `/admin/settings/roles` — matrix visible
6. `/admin/customers` — blocked checklist (not blank stub)
7. `/admin/cases` — same data as service-requests

---

## Architecture notes

- **Data fetching:** `adminFetch` + `readAdminJson` + `useState`/`useEffect` (React Query planned in API mapping doc)
- **Blocked modules:** Never use bare `AdminPlaceholder` for priority routes — use `AdminModuleUnavailable`
- **Aliases:** Cases/Appointments share one API; nav exposes user-facing names without duplicate backend routes

---

**Output:** `ADMIN_MODULE_COMPLETE`
