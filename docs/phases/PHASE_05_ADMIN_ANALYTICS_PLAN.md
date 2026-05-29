# Phase 05 — Admin Analytics Plan

**Plan ID:** `PHASE_05_ADMIN_ANALYTICS_PLAN`  
**Status:** Complete — audited 2026-05-29 ([PHASE_05_ADMIN_ANALYTICS_REPORT.md](./PHASE_05_ADMIN_ANALYTICS_REPORT.md))  
**Date:** 2026-05-29  
**Scope:** Prani Doctor platform — `pranidoctor_user` (Flutter), `pranidoctor-backend` (API/DB), `pranidoctor-web` (Admin BFF + UI)

---

## 0. Purpose

Deliver a unified **admin analytics platform** for operations, revenue, provider performance, farmer engagement, livestock health, geography, and system health — with exportable reports. This document audits what exists today, maps gaps against target KPIs (sections A–H), and defines database, API, UI, chart, and performance work (sections I–M).

**Out of scope for Phase 05:** Farmer-facing mobile analytics (partially covered by Phase 4 `livestock-analytics` planning), doctor self-service dashboards, and real-time WebSocket doctor monitoring (Phase 3 backlog).

---

## 1. Executive summary

| Area | Current maturity | Phase 05 target |
|------|------------------|-----------------|
| Executive KPIs | Partial (`/api/admin/dashboard/page-data`) | Full executive dashboard with trends |
| Revenue | Lifetime totals only | Time-bucketed + breakdown by service type |
| Doctor analytics | Counts by `ProviderStatus` only | Leaderboards, rates, ratings, response time, earnings |
| Farmer analytics | Customer count only | Active/new/retention, consultation frequency |
| Livestock (clinical) | Treatment counts; no species/disease rollups | Cases by species + disease taxonomy |
| Livestock (Phase 4 farm) | Scaffold BFF routes (feed/livestock) | Fix + consolidate in backend; align with admin UX |
| Geographic | Location master stats only | Division → upazila rollups + heat map |
| Operational | None in admin | API/error/queue metrics |
| Reporting | None | PDF, Excel, CSV export jobs |

**Critical architectural decision:** Move all admin analytics queries into a dedicated **`admin-analytics` module** in `pranidoctor-backend`, with `pranidoctor-web` BFF routes proxying only (same pattern as `dashboard/page-data`). Today, `/api/admin/analytics/feed` and `/livestock` run Prisma directly inside Next.js and have **schema/query mismatches** (see §2.3).

---

## 2. Current-state audit

### 2.1 Backend analytics-related APIs

| Endpoint | Auth | Purpose | Data sources | Status |
|----------|------|---------|--------------|--------|
| `GET /api/admin/dashboard/page-data` | Admin JWT | Platform KPIs, charts, recent requests, doctor status breakdown, revenue totals | `DoctorProfile`, `AiTechnicianProfile`, `CustomerProfile`, `ServiceRequest`, `TreatmentCase`, `BillingRecord`, `Notification` | **Production** — single heavy aggregate endpoint |
| `GET /api/admin/billing` | Admin JWT | Paginated invoice list (filterable) | `BillingRecord` | **Production** — list, not analytics |
| `GET /api/admin/billing/:id` | Admin JWT | Invoice detail + commission formula | `BillingRecord`, `PaymentRecord` | **Production** |
| `GET /api/admin/settings/billing` | Admin JWT | Commission rate settings | `Setting` | **Production** |
| `GET /api/admin/locations/stats` | Admin JWT | Location master completeness | `Village`, `Union`, etc. | **Production** — master data, not demand geography |
| `GET /api/mobile/feeds/analytics` | Mobile customer | Per-farmer feed cost/trend | `FeedRecord` | **Production** — not admin |
| `GET /api/admin/analytics/feed` | — | — | — | **Not in backend** |
| `GET /api/admin/analytics/livestock` | — | — | — | **Not in backend** |
| `GET /api/admin/analytics/doctors` | — | — | — | **Planned** (Phase 3 API_GAPS) — **not implemented** |
| `GET /api/admin/analytics/system` | — | — | — | **Planned** (Phase 3 API_GAPS) — **not implemented** |

**Dashboard payload today** (`page-data/route.ts`):

- Counts: doctors, AI technicians, customers, service requests (total/pending/completed), finalized treatments.
- Revenue: sum `BillingRecord.total` (issued/partial/paid) and paid subset; no date dimension.
- Charts: service requests by `status`, by `serviceType`, team composition donut.
- Doctor stats: active / pending verification / suspended / rejected (`ProviderStatus`).
- Recent: last 8 service requests.

**Not exposed:** total `User` rows, active users, new registrations, cancelled requests, emergency count, farmer-specific metrics, time-series revenue, top doctors, geographic breakdown, operational metrics.

### 2.2 Admin panel (pranidoctor-web) — pages & modules

| Route | Component | API(s) | Notes |
|-------|-----------|--------|-------|
| `/admin` | `AdminDashboardClient` + KPI/charts/doctor/revenue sections | `GET /api/admin/dashboard/page-data` (proxied to backend) | Richest analytics UI today; 30s RSC revalidate + 15s client cache + 30s poll |
| `/admin/analytics` | `FeedAnalyticsDashboard` | `GET /api/admin/analytics/feed`, `/livestock` (Next.js Prisma, **not proxied**) | **Replaced** legacy `AnalyticsAdminView` (still in repo, unused) |
| `/admin/reports` | `ReportsAdminView` | Dashboard + `GET /api/admin/service-requests` | Treatment summary; no export |
| `/admin/billing` | Billing list/detail | `GET /api/admin/billing` | Operational billing, not analytics hub |
| `/admin/customers`, `/admin/users` | `AdminModuleUnavailable` | None | No customer list API |
| `/admin/doctors` | `DoctorsList` | CRUD under `/api/admin/doctors/*` | No per-doctor analytics tab |
| `/admin/service-requests`, `/cases`, `/appointments` | `ServiceRequestsList` | Service request APIs | Operational, not aggregated |
| `/admin/locations/*` | Location admin | `locations/stats`, import tools | Master data quality |
| `/admin/feed-catalog`, `/admin/feed-items` | Catalog CRUD | Feed catalog admin APIs | Catalog management, not platform analytics |

**Navigation:** `admin-nav.tsx` links **Analytics** → `/admin/analytics` (feed/livestock only). Executive KPIs live on **Dashboard** only.

### 2.3 Phase 4 admin analytics scaffold — technical debt

`src/app/api/admin/analytics/feed/route.ts` issues (must fix in Phase 05 or pre-work):

1. Uses `prisma.feedCategory.count()` — **`FeedCategory` is an enum on `FeedItem`, not a table**.
2. Raw SQL references column `date` on `feed_consumption` — schema field is **`recordedDate`**.
3. Joins `feed_category` table — **does not exist**; inventory-by-category should group on `FeedItem.category` enum or `FeedCatalogItem` (if migrated).
4. Runs only in **Next.js BFF** — bypasses backend auth/logging conventions and duplicates DB access.

`livestock/route.ts` is closer to schema (`Livestock`, `WeightRecord`) but still BFF-only and uses `status` on `Livestock` while schema uses `lifecycleStatus` / `healthStatus` — **verify generated client vs route** before production use.

### 2.4 Flutter user app (`pranidoctor_user`)

| Capability | Status |
|------------|--------|
| Product analytics SDK | **Stub** — `NoOpAnalyticsReporter` / placeholder `FirebaseAnalyticsReporter` |
| Admin-facing data | **None** — mobile APIs are per-customer |
| Events → admin warehouse | **None** |

Phase 05 admin analytics does **not** depend on Flutter SDK wiring, but **active user** and **session** KPIs can use `UserDevice.lastActiveAt` / `UserSession.lastSeenAt` populated by existing auth flows.

### 2.5 Related planning artifacts

- `docs/plans/phase-4-livestock-feed-ecosystem/analytics-plan.md` — farmer/farm metrics, `FeedAnalyticsCache`, mobile `/api/mobile/analytics/livestock`
- `docs/phases/phase-3-real-doctor-workflow/API_GAPS.md` §10 — aspirational `analytics/doctors`, `analytics/system` contracts
- `docs/ADMIN_DASHBOARD_COMPLETE.md`, `docs/API_CONNECTION_AUDIT.md` — dashboard wiring

---

## 3. Target KPI catalog & gap analysis

Legend: ✅ Available today · 🟡 Partial / derivable with effort · ❌ Missing

### A. Executive Dashboard

| KPI | Definition (canonical) | Primary source | Today | Gap |
|-----|------------------------|----------------|-------|-----|
| Total Users | `COUNT(User)` all roles | `User` | ❌ | New aggregate |
| Active Users | Users with `UserDevice.lastActiveAt` or `UserSession.lastSeenAt` in last 30d (configurable) | `UserDevice`, `UserSession` | ❌ | Define window + dedupe by user |
| New Registrations | `COUNT(User)` where `createdAt` in period | `User` | ❌ | Time-series endpoint |
| Total Farmers | `COUNT(CustomerProfile)` | `CustomerProfile` | 🟡 | Exposed as `totalCustomers` (label mismatch) |
| Total Doctors | `COUNT(DoctorProfile)` | `DoctorProfile` | ✅ | On dashboard |
| Verified Doctors | `providerStatus = ACTIVE` AND `verifiedAt IS NOT NULL` | `DoctorProfile` | 🟡 | Active count exists; verified subset not split |
| Pending Doctors | `providerStatus = PENDING_VERIFICATION` | `DoctorProfile` | ✅ | `doctorStats.pendingVerification` |
| Total Consultations | `COUNT(ServiceRequest)` where `serviceType` ∈ doctor consultation types | `ServiceRequest` | 🟡 | Included in `totalServiceRequests` (mixed with AI) |
| Completed Consultations | `status = COMPLETED` + type filter | `ServiceRequest` | 🟡 | `completedServiceRequests` is all types |
| Cancelled Consultations | `status = CANCELLED` | `ServiceRequest` | ❌ | Add to dashboard + chart |
| Emergency Calls | `isEmergency = true` OR `serviceType = EMERGENCY_DOCTOR` | `ServiceRequest` | ❌ | Indexed fields exist |
| Livestock Cases | `COUNT(TreatmentCase)` or requests with `AnimalProfile.animalType` / `Livestock` | `TreatmentCase`, `AnimalProfile` | 🟡 | `completedTreatments` = finalized cases only |

**Recommendation:** Split **platform executive** (`/admin`) from **ecosystem analytics** (`/admin/analytics/feed`) via sub-nav: *Platform* | *Revenue* | *Feed & Farm*.

### B. Revenue Analytics

| KPI | Definition | Source | Today | Gap |
|-----|------------|--------|-------|-----|
| Daily / Weekly / Monthly / Yearly Revenue | `SUM(BillingRecord.total)` or `totalCollected` by `issuedAt`/`paidAt` bucket | `BillingRecord` | ❌ | Only lifetime totals |
| Consultation Revenue | Sum where linked `ServiceRequest.serviceType` ∈ consultation types | `BillingRecord` ⋈ `ServiceRequest` | ❌ | |
| Emergency Revenue | Sum where request `isEmergency` or type emergency |同上 | ❌ | |
| Commission Revenue | `SUM(platformCommission)` for paid/issued bills | `BillingRecord` | 🟡 | Field exists; not aggregated in admin |

Use **`paidAt`** for cash-basis charts and **`issuedAt`** for accrual; document which the UI shows (default: paid).

### C. Doctor Analytics

| KPI | Definition | Source | Today | Gap |
|-----|------------|--------|-------|-----|
| Top Doctors | Rank by completed consultations or revenue in period | `ServiceRequest`, `BillingRecord`, `Review` | ❌ | |
| Consultation Count | Per doctor `COUNT` completed requests | `ServiceRequest.assignedDoctorId` | ❌ | |
| Acceptance Rate | `ACCEPTED|ASSIGNED|IN_PROGRESS|COMPLETED` / eligible offers | Timeline `ACCEPTED` vs `REJECTED` or status transitions | ❌ | Needs timeline analytics |
| Completion Rate | `COMPLETED` / (`COMPLETED`+`CANCELLED`+`REJECTED`) | `ServiceRequest` | ❌ | |
| Average Rating | `AVG(Review.rating)` where `status` published | `Review` | ❌ | |
| Average Response Time | `ACCEPTED.createdAt - CREATED.createdAt` from `ServiceRequestTimelineEvent` | Timeline events | ❌ | Events exist; no rollup |
| Earnings | `SUM(providerPayout)` or service fee net of commission | `BillingRecord` | 🟡 | Per-invoice in billing detail only |

**Note:** Real-time “online doctor” counts from Phase 3 are **not** in DB today — would need heartbeat table or Redis (future).

### D. Farmer Analytics

| KPI | Definition | Source | Today | Gap |
|-----|------------|--------|-------|-----|
| Active Farmers | Customers with ≥1 request or `lastActiveAt` in period | `CustomerProfile`, `ServiceRequest`, `User` | ❌ | |
| New Farmers | `CustomerProfile.createdAt` in period | `CustomerProfile` | ❌ | |
| Retention | Cohort: farmers active in month N who return in N+1 | Snapshots | ❌ | Needs `analytics_daily_snapshot` |
| Consultation Frequency | Avg requests per active farmer per period | `ServiceRequest` | ❌ | |

### E. Livestock Analytics

Two domains must not be conflated:

1. **Clinical / marketplace livestock** — `AnimalProfile`, `ServiceRequest`, `TreatmentCase`, `HealthEvent`
2. **Phase 4 farm registry** — `Livestock`, `LivestockHealthRecord`, `WeightRecord`

| KPI | Definition | Source | Today | Gap |
|-----|------------|--------|-------|-----|
| Cow Cases | Requests/cases where `animalType = CATTLE` or `LivestockSpecies.COW/BUFFALO` | `AnimalProfile`, `Livestock` | ❌ | |
| Goat Cases | `GOAT` / `SHEEP` |同上 | ❌ | |
| Poultry Cases | `POULTRY` / `CHICKEN` / `DUCK` |同上 | ❌ | |
| Pet Cases | `DOG` / `CAT` |同上 | ❌ | |
| Disease Categories | Group by normalized disease/diagnosis | `TreatmentCase.diagnosis`, `HealthEvent.diseaseName`, `LivestockHealthRecord.diseaseName` | ❌ | Free text — needs taxonomy or top-N |

### F. Geographic Analytics

| KPI | Definition | Source | Today | Gap |
|-----|------------|--------|-------|-----|
| Division / District / Upazila | Roll up requests/users by `Area.type` or `Village` → `Union` → hierarchy | `Area`, `Village`, `ServiceRequest.villageId`, `CustomerProfile.primaryVillageId`, `addressJson` | ❌ | `locations/stats` is data quality only |
| Heat Map | Intensity by village lat/lng | `Village.latitude/longitude`, request counts | ❌ | Many villages missing coords |

**Hierarchy path:** `ServiceRequest.villageId` → `Village.unionId` → `Union` → upazila/district/division (location master). Fallback: `ServiceRequest.areaId` on `Area` tree.

### G. Operational Analytics

| KPI | Definition | Source | Today | Gap |
|-----|------------|--------|-------|-----|
| API Usage | Request count by route/method/day | **New** `ApiRequestLog` or APM | ❌ | No persistence |
| Error Rate | 5xx / total | APM or logs | ❌ | |
| Response Time | p50/p95 latency | APM | ❌ | |
| Queue Statistics | Offline sync backlog | `OfflineSyncItem` by `status` | ❌ | Table exists, no admin API |

### H. Reporting System

| Format | Scope | Today | Gap |
|--------|-------|-------|-----|
| PDF | Executive summary, doctor leaderboard, revenue | ❌ | Server-side generation (e.g. `@react-pdf/renderer` or headless Chromium) |
| Excel | Wide tables, pivot-friendly | ❌ | `exceljs` in BFF or backend job |
| CSV | Raw exports per report type | ❌ | Streaming CSV from analytics queries |

**Requirements:** Admin role gate, async job for large exports, audit log entry (`AuthAuditEvent` or new `ReportExportLog`).

---

## 4. Canonical definitions (implement once, reuse everywhere)

```text
consultation_types = [
  DOCTOR_HOME_VISIT,
  EMERGENCY_DOCTOR,
  ONLINE_CONSULTATION_LATER
]

emergency_request = isEmergency OR serviceType = EMERGENCY_DOCTOR

farmer = CustomerProfile (user.role = CUSTOMER)

verified_doctor = providerStatus = ACTIVE AND verifiedAt IS NOT NULL

revenue_recognized = BillingRecord.status IN (ISSUED, PARTIALLY_PAID, PAID)
revenue_collected   = BillingRecord.status = PAID (use paidAt)
```

**Active user (default):** distinct `userId` where `UserDevice.lastActiveAt >= now() - interval '30 days'`.

**Response time:** for each `ServiceRequest`, `minutes(ACCEPTED_event.createdAt - CREATED_event.createdAt)`; CREATED may be implicit from `submittedAt` if no CREATED event.

---

## 5. Proposed information architecture (admin UI)

```text
/admin/analytics                    → Executive overview (platform KPIs + trends)
/admin/analytics/revenue            → Revenue time series + breakdown
/admin/analytics/doctors            → Leaderboard + drill-down
/admin/analytics/farmers            → Acquisition & retention
/admin/analytics/livestock          → Clinical cases by species & disease
/admin/analytics/geography          → Division/district/upazila + map
/admin/analytics/operations         → API / errors / offline queue
/admin/analytics/feed-farm          → Phase 4 feed inventory (move from root page)
/admin/reports                      → Export center + scheduled reports (links to H)
```

Keep `/admin` as **operations home** (recent activity, quick actions); deep analytics move under `/admin/analytics/*` to avoid overloading `page-data`.

---

## 6. Implementation plan by section

### A. Executive Dashboard — implementation

**Backend:** `GET /api/admin/analytics/executive?from=&to=&tz=Asia/Dhaka`

Response includes all KPIs in §3A plus prior-period comparison (`deltaPercent`).

**Frontend:** New `ExecutiveAnalyticsDashboard` — stat cards, sparklines (7/30 day), links to drill-downs.

**Migrate:** Slim down `page-data` to operational subset (recent requests, unread notifications) OR keep fat endpoint but add cached materialized view (see §13).

### B. Revenue Analytics — implementation

**Backend:** `GET /api/admin/analytics/revenue?grain=day|week|month|year&from=&to=&basis=paid|issued`

Sub-resources:

- `.../revenue/by-service-type`
- `.../revenue/commission`

**Charts:** Multi-series line (total vs commission), stacked bar by service type.

### C. Doctor Analytics — implementation

**Backend:**

- `GET /api/admin/analytics/doctors?sort=consultations|rating|responseTime|earnings&limit=20`
- `GET /api/admin/analytics/doctors/:id/summary?from=&to=`

**Frontend:** Sortable table + doctor detail analytics tab (feeds `/admin/doctors/[id]`).

### D. Farmer Analytics — implementation

**Backend:** `GET /api/admin/analytics/farmers?from=&to=` — active, new, retention cohort matrix, avg consultations per active farmer.

**Retention:** Precompute monthly in snapshot table (see §9).

### E. Livestock Analytics — implementation

**Backend:** `GET /api/admin/analytics/livestock/cases?from=&to=` — buckets: cow, goat, poultry, pet, other.

**Disease:** Phase 05b — `DiseaseCategory` lookup + map free text; until then **top 20** `diseaseName`/`diagnosis` by count.

**Consolidate** Phase 4 `feed`/`livestock` farm metrics under `GET /api/admin/analytics/farm-ecosystem` (fix schema bugs).

### F. Geographic Analytics — implementation

**Backend:** `GET /api/admin/analytics/geography?level=division|district|upazila&from=&to=&metric=requests|farmers|revenue`

**Heat map:** `GET /api/admin/analytics/geography/heatmap?from=&to=` → `[{ lat, lng, weight, villageId, label }]`

**Frontend:** Bangladesh geo JSON (divisions/districts) + MapLibre/Leaflet; table fallback when coords missing.

### G. Operational Analytics — implementation

**Phase 05a (minimal):** `GET /api/admin/analytics/operations/offline-queue` — counts by `OfflineSyncItemStatus`, oldest `nextRetryAt`, failed items.

**Phase 05b (full):** Instrument Express/Next middleware → `ApiRequestMetric` rollup; or integrate **Sentry/Datadog** and embed admin iframe/panels.

### H. Reporting System — implementation

**Backend:**

- `POST /api/admin/reports/export` body: `{ reportType, format: pdf|xlsx|csv, from, to, filters }`
- `GET /api/admin/reports/export/:jobId` — poll status, download URL

**Report types (v1):** `executive_summary`, `revenue`, `doctor_leaderboard`, `service_requests`, `geography`.

**Storage:** S3-compatible object store or local `exports/` with signed URLs; TTL 7 days.

---

## 7. Section I — Required database changes

| Change | Priority | Rationale |
|--------|----------|-----------|
| `analytics_daily_snapshot` | P0 | Fast executive/revenue/geo dashboards |
| `analytics_doctor_daily` | P0 | Top doctors, response time, ratings without heavy joins |
| `analytics_geography_daily` | P1 | Division/district/upazila counts |
| `DiseaseCategory` + optional `disease_category_id` on health/treatment tables | P2 | Disease analytics |
| `ReportExportJob` | P1 | Async PDF/Excel/CSV |
| `ApiRequestMetric` (date, route, count, error_count, latency_p95_ms) | P2 | Operational analytics |
| Extend `FeedAnalyticsCache` pattern → `AdminAnalyticsCache` (optional) | P2 | Reuse Phase 4 caching approach |
| Indexes: `BillingRecord(paidAt)`, `BillingRecord(issuedAt)`, `User(createdAt)`, `ServiceRequest(submittedAt, status, serviceType)`, `ServiceRequestTimelineEvent(serviceRequestId, eventType, createdAt)` | P0 | Query performance |

### `analytics_daily_snapshot` (proposed)

```prisma
model AnalyticsDailySnapshot {
  id                    String   @id @default(cuid())
  snapshotDate          DateTime @db.Date
  totalUsers            Int
  activeUsers           Int
  newUsers              Int
  totalFarmers          Int
  activeFarmers         Int
  newFarmers            Int
  totalDoctors          Int
  verifiedDoctors       Int
  pendingDoctors        Int
  totalConsultations    Int
  completedConsultations Int
  cancelledConsultations Int
  emergencyCalls        Int
  livestockCases        Int
  revenueIssuedBdt      Decimal  @db.Decimal(14, 2)
  revenuePaidBdt        Decimal  @db.Decimal(14, 2)
  commissionBdt         Decimal  @db.Decimal(14, 2)
  createdAt             DateTime @default(now())

  @@unique([snapshotDate])
  @@index([snapshotDate])
}
```

**Job:** nightly cron + backfill script for last 90 days.

### `analytics_doctor_daily` (proposed)

Per `doctorId` + `snapshotDate`: `consultationCount`, `completedCount`, `cancelledCount`, `acceptedCount`, `rejectedCount`, `avgResponseMinutes`, `avgRating`, `earningsBdt`, `commissionBdt`.

### `ReportExportJob` (proposed)

`id`, `requestedByAdminId`, `reportType`, `format`, `paramsJson`, `status` (PENDING|RUNNING|DONE|FAILED), `fileUrl`, `error`, `createdAt`, `completedAt`.

---

## 8. Section J — Required APIs

All routes: **Admin JWT**, envelope `{ ok, data }`, Zod-validated query params, `from`/`to` ISO dates, max range 366 days (stricter for raw exports).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/analytics/executive` | Section A KPIs + trends |
| GET | `/api/admin/analytics/revenue` | Section B time series |
| GET | `/api/admin/analytics/revenue/breakdown` | By service type / emergency / commission |
| GET | `/api/admin/analytics/doctors` | Section C leaderboard |
| GET | `/api/admin/analytics/doctors/:id` | Doctor detail metrics |
| GET | `/api/admin/analytics/farmers` | Section D |
| GET | `/api/admin/analytics/livestock/cases` | Section E clinical |
| GET | `/api/admin/analytics/farm-ecosystem` | Phase 4 feed/livestock (fixed queries) |
| GET | `/api/admin/analytics/geography` | Section F rollups |
| GET | `/api/admin/analytics/geography/heatmap` | Heat map points |
| GET | `/api/admin/analytics/operations` | Section G summary |
| GET | `/api/admin/analytics/operations/offline-queue` | Queue stats |
| POST | `/api/admin/reports/export` | Section H enqueue |
| GET | `/api/admin/reports/export/:jobId` | Poll/download |

**BFF (pranidoctor-web):** thin `proxyRouteToBackend` for each; **remove** direct Prisma from `api/admin/analytics/feed|livestock`.

**Deprecation:** Extend `page-data` with new fields only for backward compatibility during migration; target removal of duplicate aggregates in Phase 05.1.

---

## 9. Section K — Required frontend pages

| Page | Components (new) | APIs |
|------|------------------|------|
| `/admin/analytics` | `ExecutiveAnalyticsView` | `analytics/executive` |
| `/admin/analytics/revenue` | `RevenueAnalyticsView` | `analytics/revenue*` |
| `/admin/analytics/doctors` | `DoctorAnalyticsView`, `DoctorLeaderboardTable` | `analytics/doctors` |
| `/admin/analytics/farmers` | `FarmerAnalyticsView`, cohort table | `analytics/farmers` |
| `/admin/analytics/livestock` | `LivestockCaseAnalyticsView` | `analytics/livestock/cases` |
| `/admin/analytics/geography` | `GeographyAnalyticsView`, `BangladeshHeatMap` | `geography`, `heatmap` |
| `/admin/analytics/operations` | `OperationsAnalyticsView` | `operations*` |
| `/admin/analytics/feed-farm` | Refactor `FeedAnalyticsDashboard` | `farm-ecosystem` |
| `/admin/reports` | `ReportsExportCenter` | `reports/export` |
| `/admin/doctors/[id]` | Tab: **Analytics** | `analytics/doctors/:id` |

**Shared libs:** `src/lib/admin/analytics/*` — types, hooks, date-range picker, comparison helpers.

**i18n:** Bengali labels for stat cards (match existing admin BN-first pattern).

**Permissions:** `analytics.view` capability for SUPPORT vs SUPER_ADMIN (extend `permissions.ts`).

---

## 10. Section L — Required charts

| Chart | Type | Section | Library |
|-------|------|---------|---------|
| Platform KPI trends | Sparkline / line | A | Recharts (already used via `AdminBarChart` / `AdminDonutChart`) |
| Consultations by status | Donut / bar | A | Existing `AdminBarChart` pattern |
| Revenue over time | Line / area | B | Recharts |
| Revenue by service type | Stacked bar | B | Recharts |
| Commission vs gross | Dual-axis line | B | Recharts |
| Top doctors | Horizontal bar | C | Recharts |
| Acceptance vs completion | Grouped bar | C | Recharts |
| Response time distribution | Histogram / box | C | Recharts |
| Rating distribution | Bar 1–5 stars | C | Recharts |
| Farmer cohort retention | Cohort heatmap grid | D | Custom CSS or Recharts |
| Consultation frequency | Histogram | D | Recharts |
| Livestock cases by species | Pie / bar | E | Recharts |
| Top diseases | Horizontal bar | E | Recharts |
| Geography | Choropleth map (BD districts) | F | MapLibre + GeoJSON |
| Demand heat map | Point heat | F | MapLibre heatmap layer |
| API latency & errors | Line | G | Recharts |
| Offline queue depth | Line / gauge | G | Recharts |
| Feed consumption trend | Line | Feed-farm | Recharts (replace list-only UI) |
| Inventory by category | Bar | Feed-farm | Recharts |

**Accessibility:** Provide data tables under every chart (`sr-only` summary + visible table toggle).

---

## 11. Section M — Performance optimization

| Technique | Application |
|-----------|-------------|
| **Materialized daily snapshots** | Executive, revenue, geography, farmer retention |
| **Redis cache** (optional) | `executive` + `revenue` keyed by `dateRange` — TTL 5 min |
| **Query limits** | Max 366-day range; heat map max 5k points; leaderboard default top 20 |
| **Indexes** | See §7 |
| **Split `page-data`** | Stop 15–20s cold loads (noted in API_CONNECTION_AUDIT) — move aggregates to snapshots |
| **Read replica** | Route analytics reads to replica when available |
| **Background export** | Never generate PDF/Excel in request thread |
| **Incremental snapshot job** | Process prior day at 00:30 Asia/Dhaka; re-run safe upsert |
| **Pre-aggregated doctor daily** | Avoid timeline event scans at request time |

**SLA targets (admin):**

- Executive dashboard (cached): **< 800 ms** p95
- Uncached historical drill-down: **< 3 s** p95
- Export job enqueue: **< 200 ms**; generation async

---

## 12. Phased delivery roadmap

| Phase | Deliverable | Est. |
|-------|-------------|------|
| **05.0** | Fix feed/livestock BFF bugs; proxy stubs to backend module skeleton | 1 sprint |
| **05.1** | DB snapshots + nightly job; `executive` + `revenue` APIs; executive & revenue pages | 2 sprints |
| **05.2** | Doctor + farmer analytics APIs & pages; doctor detail tab | 1–2 sprints |
| **05.3** | Livestock cases + geography rollups; maps | 2 sprints |
| **05.4** | Operations (offline queue + APM embed); CSV export | 1 sprint |
| **05.5** | PDF/Excel exports, `ReportExportJob`, reports center | 1–2 sprints |
| **05.6** | Disease taxonomy (optional); real-time doctor online metrics (Phase 3 dependency) | backlog |

---

## 13. Cross-repo dependencies

| Repo | Work |
|------|------|
| **pranidoctor-backend** | `admin-analytics` module, snapshot cron, all new routes, export worker |
| **pranidoctor-web** | BFF proxies, new pages/charts, nav updates, remove Prisma from analytics routes |
| **pranidoctor_user** | No admin UI; optional: ensure `UserDevice.lastActiveAt` updated on app resume for active-user KPI |

---

## 14. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Mixed service types in legacy `ServiceRequest` data | Explicit `serviceType` + `isEmergency` filters; data quality report |
| Free-text diagnosis/disease | Top-N + manual taxonomy later |
| Missing village coordinates | Heat map coverage % indicator; centroids at upazila level fallback |
| Revenue double-counting (`total` vs `totalCollected`) | Document single canonical field per chart |
| BFF/backend schema drift | Single Prisma schema in backend; web generated client synced in CI |
| Heavy exports on production DB | Snapshots + read replica + job queue |
| PII in exports | Redact phone/email; admin audit log |

---

## 15. Acceptance criteria (Phase 05 complete)

1. All section **A** KPIs visible on `/admin/analytics` with date range and period comparison.
2. Section **B** revenue charts support day/week/month/year grains.
3. Section **C** doctor leaderboard with sort by consultations, rating, response time, earnings.
4. Section **D** farmer active/new/retention visible.
5. Section **E** livestock case breakdown by species; top diseases list.
6. Section **F** division/district/upazila tables + heat map (with coverage disclaimer).
7. Section **G** offline queue stats; API metrics or integrated APM panel.
8. Section **H** at least CSV + Excel export for executive and revenue reports.
9. No admin analytics business logic in Next.js Prisma routes.
10. Cold load executive dashboard **< 3 s** p95 with snapshots enabled.

---

## 16. References

| Document | Path |
|----------|------|
| Dashboard API implementation | `pranidoctor-backend/src/legacy/web/routes/admin/dashboard/page-data/route.ts` |
| Admin dashboard UI | `pranidoctor-web/docs/ADMIN_DASHBOARD_COMPLETE.md` |
| API connection audit | `pranidoctor-web/docs/API_CONNECTION_AUDIT.md` |
| Phase 3 analytics contracts (aspirational) | `pranidoctor-web/docs/phases/phase-3-real-doctor-workflow/API_GAPS.md` |
| Phase 4 farmer analytics | `pranidoctor-web/docs/plans/phase-4-livestock-feed-ecosystem/analytics-plan.md` |
| Prisma domain models | `pranidoctor-backend/prisma/schema.prisma` |

---

---

## 17. Implementation status (2026-05-29)

### Backend (`pranidoctor-backend`)

| Item | Status |
|------|--------|
| `src/modules/admin-analytics/` | Done — service, repository, cache, schemas, RBAC via `analytics.view` / `analytics.export` |
| `GET /api/admin/analytics/overview` | Done |
| `GET /api/admin/analytics/revenue` | Done — `grain`, `basis` query params |
| `GET /api/admin/analytics/doctors` | Done |
| `GET /api/admin/analytics/farmers` | Done |
| `GET /api/admin/analytics/livestock` | Done |
| `GET /api/admin/analytics/geography` | Done — `level` param |
| `GET /api/admin/analytics/system` | Done |
| `GET /api/admin/analytics/reports` | Done — catalog JSON; `format=csv&report=` export |
| In-memory cache (5 min TTL) | Done |
| `analytics_daily_snapshot` table | Deferred (Phase 05.1) |

### Admin UI (`pranidoctor-web`)

| Route | Status |
|-------|--------|
| `/admin/analytics` | Done — overview KPIs + charts |
| `/admin/analytics/revenue` | Done |
| `/admin/analytics/doctors` | Done |
| `/admin/analytics/farmers` | Done |
| `/admin/analytics/livestock` | Done |
| `/admin/analytics/geography` | Done |
| `/admin/analytics/system` | Done |
| BFF proxies | Done — all routes use `proxyRouteToBackend` |
| CSV export button | Done |
| Charts (line, area, bar, pie, donut, trend) | Done — SVG/CSS in `AnalyticsCharts.tsx` |

### Follow-ups

- PDF/Excel export jobs (`ReportExportJob`)
- Nightly `analytics_daily_snapshot` cron
- MapLibre heat map UI
- APM integration for API metrics
- Remove legacy `FeedAnalyticsDashboard` or mount under `/admin/analytics/feed-farm`

*End of plan.*
