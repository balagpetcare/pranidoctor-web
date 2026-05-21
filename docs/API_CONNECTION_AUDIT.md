# Admin Panel ↔ API Connection Audit

**Date:** 2026-05-22  
**Projects:** `pranidoctor-web` (BFF + UI) · `pranidoctor-backend` (Express API)  
**Method:** Static route inventory, call-site grep, live smoke tests against `localhost:3001` → `BACKEND_URL`

## Architecture

```
Browser adminFetch ──► /api/admin/* (Next BFF) ──► BACKEND_URL/api/admin/*
RSC / guards       ──► serverInternalJson ──► same backend paths
```

Response envelope (both repos): `{ ok: true, data }` | `{ ok: false, error: { code, message, details? } }`

---

## Summary counts

| Status | Count | Notes |
|--------|------:|-------|
| WORKING | 58 | Page + API connected, envelope OK |
| PARTIAL | 9 | API exists; UI incomplete or alternate data source |
| BROKEN | 4 | Fixed in this repair (see below) |
| DEAD | 5 | Nav stub — no backend admin API |
| UNUSED | 12 | Backend route proxied but no UI caller |

---

## Master inventory

| Page | Component | API Called | Method | Endpoint | Expected Response | Actual Response | Status |
|------|-----------|------------|--------|----------|-------------------|-----------------|--------|
| `/admin/login` | `AdminLoginForm` | `auth-api` | POST | `/api/admin/auth/login` | `{ ok, data: { result, user } }` | 200 + cookie | WORKING |
| Shell | `AdminAuthProvider` | `auth-api` | GET | `/api/admin/auth/me` | `{ ok, data: { user } }` | 200 | WORKING |
| Shell | `AdminAuthProvider` | `auth-api` | POST | `/api/admin/auth/logout` | `{ ok, data }` | 200 | WORKING |
| `/admin` | `AdminDashboardClient` | `dashboard-client-cache` | GET | `/api/admin/dashboard/page-data` | `AdminDashboardPageData` | 200 (~15–20s cold) | WORKING |
| `/admin/analytics` | `AnalyticsAdminView` | `useDashboardPageData` | GET | `/api/admin/dashboard/page-data` | same | 200 | WORKING |
| `/admin/reports` | `ReportsAdminView` | dashboard + list | GET | dashboard + `/api/admin/service-requests` | mixed | 200 | WORKING |
| `/admin/areas` | `AreasList` | inline | GET/PATCH/DELETE | `/api/admin/areas` | `{ areas, meta }` | 200 | WORKING |
| `/admin/areas/new`, `…/edit` | `AreaForm` | inline | GET/POST/PATCH | `/api/admin/areas` | `{ area }` | 200 | WORKING |
| `/admin/locations` | RSC page | `location-master-admin-client` | GET | `/api/admin/locations/stats` | stats object | 200 | WORKING |
| `/admin/locations` | RSC page | `getLocationImportReport` | GET | `/api/admin/locations/import-report` | `{ report }` | was local file — **FIXED** | WORKING |
| `/admin/locations/missing-coords` | RSC | `listMissingCoords` | GET | `…/missing-coords` | `{ items }` | 200 | WORKING |
| `/admin/locations/pending-verification` | RSC | `listPendingVerification` | GET | `…/pending-verification` | `{ items }` | 200 | WORKING |
| — | — | — | GET | `/api/admin/locations/duplicates` | `{ items }` | 200 (no page) | UNUSED |
| `/admin/doctors` | `DoctorsList` | inline | GET/POST | `/api/admin/doctors` | list + actions | 200 | WORKING |
| `/admin/doctors/[id]` | `DoctorDetailPanel` | inline | GET/POST | `/api/admin/doctors/:id/*` | `{ doctor }` | 200 | WORKING |
| `/admin/doctors/*/edit` | `DoctorProfileForm` | inline | GET/PATCH/PUT | doctors + working-areas + service-categories | `{ doctor }` | 200 | WORKING |
| — | — | — | POST | `…/visit-fee`, `…/emergency-availability`, `…/online-consultation-availability` | — | proxied | UNUSED |
| `/admin/ai-technicians` | `TechniciansList` | inline | GET/POST | `/api/admin/ai-technicians` | list | 200 | WORKING |
| `/admin/ai-technicians/applications` | `ApplicationsList` | inline | GET | `/api/admin/ai-technician-applications` | list | 200 | WORKING |
| `/admin/ai-technicians/applications/[id]` | `ApplicationReviewPanel` | inline | GET/POST | applications + transition | detail | 200 | WORKING |
| `/admin/ai-technician-complaints` | `AiTechnicianComplaintsAdmin` | inline | GET/POST | `/api/admin/ai-technician-complaints` | list + status | 200 | WORKING |
| — | — | — | PUT/POST | village-service-areas, service-fee, emergency-availability | — | proxied | UNUSED |
| `/admin/service-requests` | `ServiceRequestsList` | inline | GET | `/api/admin/service-requests` | `{ requests, total }` | 200 | WORKING |
| `/admin/service-requests/[id]` | `ServiceRequestDetailPanel` | inline | GET | `/api/admin/service-requests/:id` | `{ request }` | 200 | WORKING |
| `/admin/service-requests/[id]` | `ServiceRequestAssignmentActions` | inline | POST | assign-doctor / assign-technician | `{ request }` | 200 | WORKING |
| — | — | — | GET | `/api/admin/service-requests/:id/timeline` | timeline events | proxy **ADDED** | UNUSED |
| `/admin/cases`, `/admin/appointments` | `ServiceRequestsPageShell` | same as service-requests | GET | `/api/admin/service-requests` | filtered list | 200 | WORKING |
| `/admin/billing` | `AdminBillingList` | inline | GET | `/api/admin/billing` | `{ rows, total }` | 200 | WORKING |
| `/admin/billing/[id]` | `AdminBillingDetail` | inline | GET | `/api/admin/billing/:id` | detail DTO | 200 | WORKING |
| `/admin/settings/billing` | `AdminBillingSettingsForm` | inline | GET/PUT | `/api/admin/settings/billing` | settings DTO | 200 | WORKING |
| `/admin/semen-providers` | `SemenProvidersList` | inline | CRUD | `/api/admin/semen-providers` | list/detail | 200 | WORKING |
| `/admin/livestock-breeds` | `LivestockBreedsList` | inline | CRUD | `/api/admin/livestock-breeds` | list/detail | 200 | WORKING |
| `/admin/semen-service-templates` | `SemenServiceTemplatesList` | inline | CRUD | `/api/admin/semen-service-templates` | list/detail | 200 | WORKING |
| `/admin/knowledge-hub/*` | KH components | inline | CRUD | content-categories + tutorials | admin DTOs | 200 | WORKING |
| `/admin/service-categories` | `ServiceCategoriesList` | inline | GET | `/api/admin/service-categories` | `{ categories }` | 200 | PARTIAL (read-only UI) |
| `/admin/notifications` | `AdminNotificationsPanel` | inline | GET/PATCH | `/api/notifications` | notifications list | 200 w/ session | WORKING |
| Shell | `AdminNotificationsMenu` | inline | GET | `/api/notifications` | unread counts | 200 w/ session | WORKING |
| `/admin/notifications` | `AdminSmsLogsSection` | — | — | — | — | static placeholder | DEAD |
| `/enterprise/services/review` | `ServiceInstancesReviewConsole` | inline | GET/PATCH | `/api/admin/service-instances` | instance + review | 200 | WORKING |
| `/admin/dev-tools/otp-logs` | `AdminOtpDevLogsPanel` | raw fetch | GET | `/api/admin/dev-tools/otp-logs` | `{ entries }` | 200 (dev env) | WORKING |
| `/admin/settings/roles` | `RolesAdminPanel` | static matrix | — | — | — | no API | DEAD |
| `/admin/settings/permissions` | `PermissionsAdminPanel` | static matrix | — | — | — | no API | DEAD |
| `/admin/users` | `AdminModuleUnavailable` | — | — | `/api/admin/users` | — | missing API | DEAD |
| `/admin/customers` | `AdminModuleUnavailable` | — | — | `/api/admin/customers` | — | missing API | DEAD |
| `/admin/animals` | `AdminModuleUnavailable` | — | — | `/api/admin/animals` | — | missing API | DEAD |
| `/admin/prescriptions` | `AdminModuleUnavailable` | — | — | `/api/admin/prescriptions` | — | missing API | DEAD |
| `/admin/audit` | `AuditAdminHub` | — | — | `/api/admin/audit/auth` | — | missing API | PARTIAL |
| Ops | health routes | `fetchBackendHealth` | GET | `/api/admin/health` | admin snapshot | was 503 — **FIXED** | WORKING |
| All proxied POST | BFF | `proxyRouteToBackend` | * | `/api/admin/*` | passthrough | 500 w/ `Expect` header — **FIXED** | WORKING |

---

## Fixes applied (2026-05-22)

1. **`src/lib/proxy-to-backend.ts`** — Strip hop-by-hop headers (`expect`, `connection`, …) before upstream fetch (fixes 500 on login/API when clients send `Expect: 100-continue`).
2. **`src/lib/api-client.ts` + health routes** — Probe `/api/admin/health` (DB) instead of root `/health` (S3/Redis/memory) so admin health returns 200 in dev.
3. **`src/app/api/admin/service-requests/[id]/timeline/route.ts`** — Added missing BFF proxy (backend route existed).
4. **`src/app/admin/(dashboard)/locations/page.tsx`** — Import report via `/api/admin/locations/import-report` (backend path `data/locations/import-report.json`), not web-local `data/location-import-report.json`.

---

## Env notes

| Variable | Role |
|----------|------|
| `BACKEND_URL` | Primary proxy target (`http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Fallback origin |
| `NEXT_PUBLIC_API_BASE_URL` | Used by `api-client` only — can diverge from `BACKEND_URL` |
| `ADMIN_JWT_SECRET` | Must match backend for cookie session |

Web dev runs on **3001** when backend occupies **3000**; `NEXT_PUBLIC_APP_URL` may still point at `:3000` — use `:3001` for LAN admin UI testing.
