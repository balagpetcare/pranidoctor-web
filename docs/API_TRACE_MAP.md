# Admin API Trace Map

**Date:** 2026-05-22  
**Format:** PAGE → COMPONENT → HOOK/SERVICE → CLIENT → API (BFF) → BACKEND ROUTE → SERVICE → DB

---

## Auth & shell

```
/admin/login
  → AdminLoginForm
  → auth-api.adminLoginRequest
  → adminFetch (credentials: same-origin)
  → POST /api/admin/auth/login
  → legacy/web/routes/admin/auth/login/route.ts → handleAdminLogin
  → PanelAdminAuthService.login (modules/auth)
  → User, AdminProfile, session store

Shell (all /admin/*)
  → AdminAuthProvider
  → auth-api (me, logout, refresh poll)
  → adminFetch
  → GET/POST /api/admin/auth/me|logout
  → auth/me|logout routes
  → PanelAdminAuthService
  → JWT cookie prani_admin_token

Edge guard
  → src/proxy.ts
  → verifyAdminToken (ADMIN_JWT_SECRET)
  → redirect /admin/login
```

---

## Dashboard & analytics

```
/admin, /admin/analytics, /admin/reports (stats)
  → AdminDashboardClient | AnalyticsAdminView | ReportsAdminView
  → useAdminDashboardRealtime | useDashboardPageData
  → dashboard-client-cache (module cache, poll 60s)
  → adminFetch → GET /api/admin/dashboard/page-data
  → dashboard/page-data/route.ts
  → inline prisma aggregates
  → DoctorProfile, AiTechnicianProfile, CustomerProfile, ServiceRequest, BillingRecord, Notification, TreatmentCase
```

---

## Areas

```
/admin/areas*
  → AreasList | AreaForm
  → useEffect + adminFetch
  → adminFetch + readAdminJson
  → GET/POST/PATCH/DELETE /api/admin/areas[/:id]
  → areas/route.ts, areas/[id]/route.ts
  → prisma Area + validateAreaParentPair
  → Area table
```

---

## Locations

```
/admin/locations
  → RSC AdminLocationsPage
  → getLocationAdminStats, getLocationImportReport
  → serverInternalJson (forwards cookies)
  → GET /api/admin/locations/stats|import-report
  → locations/*/route.ts
  → location-master-admin.ts
  → Division, District, Upazila, Union, Village + import report file

/admin/locations/missing-coords | pending-verification
  → RSC tables
  → listMissingCoords | listPendingVerification
  → serverInternalJson
  → GET /api/admin/locations/missing-coords|pending-verification
  → location-master-admin list helpers
  → location tables
```

---

## Doctors

```
/admin/doctors*
  → DoctorsList | DoctorDetailPanel | DoctorProfileForm
  → adminFetch + readAdminJson
  → /api/admin/doctors[/:id][/approve|reject|verify|activate|suspend|working-areas|service-categories]
  → doctors/**/route.ts
  → doctor-admin-service.ts
  → DoctorProfile, User, Area, ServiceCategory
```

---

## AI technicians

```
/admin/ai-technicians*
  → TechniciansList | TechnicianDetailPanel | TechnicianProfileForm
  → adminFetch
  → /api/admin/ai-technicians/**
  → ai-technicians/**/route.ts
  → technician-admin-service.ts
  → AiTechnicianProfile, related join tables

/admin/ai-technicians/applications*
  → ApplicationsList | ApplicationReviewPanel
  → adminFetch
  → /api/admin/ai-technician-applications/**
  → application-review-service.ts
  → AiTechnicianApplication, uploads

/admin/ai-technician-complaints
  → AiTechnicianComplaintsAdmin
  → adminFetch
  → /api/admin/ai-technician-complaints/**
  → ai-quality-service.ts
  → AiTechnicianModuleComplaint
```

---

## Service requests

```
/admin/service-requests* | /admin/cases | /admin/appointments
  → ServiceRequestsPageShell → ServiceRequestsList | ServiceRequestDetailPanel | ServiceRequestAssignmentActions
  → adminFetch + readAdminJson
  → GET /api/admin/service-requests, GET :id, POST assign-doctor|assign-technician
  → service-requests/**/route.ts
  → service-request-admin-service.ts, service-request-assignment-service.ts
  → ServiceRequest, DoctorProfile, AiTechnicianProfile, Area

Timeline (proxy ready, no UI yet)
  → — 
  → GET /api/admin/service-requests/:id/timeline
  → timeline/route.ts
  → handleAdminTimelineGet (modules/timeline)
  → ServiceRequestTimelineEvent
```

---

## Billing

```
/admin/billing*
  → AdminBillingList | AdminBillingDetail
  → adminFetch + readAdminJson
  → GET /api/admin/billing[/:id]
  → billing/route.ts
  → admin-billing-service.ts
  → BillingRecord

/admin/settings/billing
  → AdminBillingSettingsForm
  → adminFetch + readAdminJson
  → GET/PUT /api/admin/settings/billing
  → settings/billing/route.ts
  → admin-billing-settings-service.ts
  → platform settings store
```

---

## Semen catalog

```
/admin/semen-providers* | livestock-breeds* | semen-service-templates*
  → Semen*List/Form/Detail components
  → adminFetch (+ XHR upload for template media)
  → /api/admin/semen-providers|livestock-breeds|semen-service-templates/**
  → semen route handlers
  → providers-service, breeds-service, templates-service
  → SemenProvider, LivestockBreed, SemenServiceTemplate, UploadedFile
```

---

## Knowledge hub

```
/admin/knowledge-hub/*
  → KnowledgeHub* components
  → adminFetch + readAdminJson
  → /api/admin/content-categories, /api/admin/tutorials/**
  → content-categories, tutorials routes
  → knowledge-hub/service.ts + dto.ts
  → ContentCategory, Tutorial
```

---

## Notifications

```
/admin/notifications + shell menu
  → AdminNotificationsPanel | AdminNotificationsMenu
  → adminFetch + readAdminJson
  → GET/PATCH /api/notifications[/:id/read|/read-all]
  → notifications/**/route.ts (not under /api/admin)
  → requireNotificationViewer (admin cookie OK)
  → notification-service → Notification table
```

---

## Enterprise service review

```
/enterprise/services/review/*
  → ServiceInstancesReviewConsole
  → adminFetch + readAdminJson
  → /api/admin/service-instances/**
  → service-instances routes
  → admin-service-instance-service.ts + adminCan capability matrix
  → ServiceInstance, schema merge, media
```

---

## Dev tools

```
/admin/dev-tools/otp-logs
  → AdminOtpDevLogsPanel
  → fetch (manual envelope parse)
  → GET /api/admin/dev-tools/otp-logs
  → dev-tools route + env gate
  → OTP dev log snapshot
```

---

## BFF proxy layer (all `/api/admin/*` except custom health)

```
src/app/api/admin/**/route.ts
  → proxyRouteToBackend(request)
  → src/lib/proxy-to-backend.ts
  → fetch(BACKEND_URL + path) with cookie forward
  → Express compat-web mounts legacy/web/routes/admin/**
```

## Server-side direct backend (RSC)

```
serverInternalJson(path)
  → src/lib/server-internal.ts
  → fetch(BACKEND_URL + path) + cookie from next/headers
  → same backend handlers
```
