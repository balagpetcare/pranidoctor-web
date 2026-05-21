# Admin Dashboard — Complete

**Date:** 2026-05-22  
**Scope:** `/admin` operations dashboard  
**Prerequisites:** [ADMIN_MODULE_COMPLETE.md](./ADMIN_MODULE_COMPLETE.md), [ADMIN_LAYOUT_COMPLETE.md](./ADMIN_LAYOUT_COMPLETE.md)

---

## Summary

The admin dashboard is a full operations hub with KPI tiles, charts, doctor/revenue panels, recent activity, quick actions, and **live polling** — optimized via server cache, client cache, lazy-loaded sections, and skeleton placeholders.

| # | Feature | Component | Status |
|---|---------|-----------|--------|
| 1 | KPI grid | `AdminDashboardKpiSection` | ✅ 9 stat cards |
| 2 | Charts | `AdminDashboardChartsSection` | ✅ Bar + donut (lazy) |
| 3 | Realtime | `useAdminDashboardRealtime` | ✅ 30s poll + manual refresh |
| 4 | Doctor stats | `AdminDashboardDoctorStatsSection` | ✅ Provider breakdown (lazy) |
| 5 | Revenue | `AdminDashboardRevenueSection` | ✅ Paid vs unpaid (lazy) |
| 6 | Recent activity | `AdminDashboardRecentActivitySection` | ✅ Latest 8 requests |
| 7 | Quick actions | `AdminDashboardQuickActionsSection` | ✅ 8 shortcuts |
| 8 | Skeleton | `AdminDashboardSkeleton` | ✅ Page + section loaders |
| 9 | Server cache | `unstable_cache` | ✅ 30s revalidate |
| 10 | Client cache | `dashboard-client-cache.ts` | ✅ 15s TTL |

---

## Architecture

```
page.tsx (RSC, revalidate=30)
└── getAdminDashboardPageData()  ← unstable_cache + backend API
    └── AdminDashboardClient (client)
        ├── useAdminDashboardRealtime(initialData)
        │     ├── writeDashboardClientCache on mount
        │     ├── poll every 30s (fetchDashboardPageDataClient)
        │     └── refresh() → refreshDashboardPageDataClient (no-store)
        ├── AdminDashboardKpiSection          (SSR-friendly)
        ├── AdminDashboardChartsSection       (dynamic, ssr:false)
        ├── AdminDashboardDoctorStatsSection  (dynamic, ssr:false)
        ├── AdminDashboardRevenueSection      (dynamic, ssr:false)
        ├── AdminDashboardQuickActionsSection
        └── AdminDashboardRecentActivitySection
```

### Data flow

1. **First paint:** Server fetches `GET /api/admin/dashboard/page-data` with `unstable_cache` (30s).
2. **Hydration:** Client writes SSR payload into in-memory cache (15s TTL).
3. **Polling:** Every 30s, client fetch uses cache if fresh; otherwise hits API.
4. **Manual refresh:** Bypasses cache (`cache: "no-store"`), updates UI + cache.
5. **Live indicator:** Green pulse dot + Bengali relative time (`date-fns/locale/bn`).

---

## Backend API (extended)

**Route:** `GET /api/admin/dashboard/page-data`  
**Backend:** `pranidoctor-backend/.../admin/dashboard/page-data/route.ts`

### Response shape

```typescript
{
  stats: {
    totalDoctors, totalAiTechnicians, totalCustomers,
    totalServiceRequests, pendingRequests, completedServiceRequests,
    completedTreatments,
    totalRevenueDisplay, paidRevenueDisplay,
    totalRevenueBdt, paidRevenueBdt, unpaidRevenueBdt  // new numerics
  },
  recentRequests: [...],       // last 8
  unreadNotifications: number,
  charts: {                    // new
    serviceRequestsByStatus: { key, label, value }[],
    serviceRequestsByType: { key, label, value }[],
    teamComposition: { key, label, value }[]
  },
  doctorStats: {               // new
    total, active, pendingVerification, suspended, rejected
  },
  revenue: {                   // new
    totalBdt, paidBdt, unpaidBdt,
    totalDisplay, paidDisplay, unpaidDisplay
  },
  generatedAt: string          // ISO — for realtime label
}
```

---

## Charts (no external library)

Pure CSS/SVG via `AdminChartPrimitives.tsx`:

| Chart | Type | Data source |
|-------|------|-------------|
| Request status | Horizontal bar | `charts.serviceRequestsByStatus` |
| Request type | Horizontal bar | `charts.serviceRequestsByType` |
| Team composition | Donut (conic-gradient) | doctors / AI / customers |
| Pipeline summary | Donut | status slices |

Charts section is **lazy-loaded** (`next/dynamic`, `ssr: false`) with `AdminDashboardSectionSkeleton` fallback.

---

## Optimization

### Lazy load

| Section | Method |
|---------|--------|
| Charts | `dynamic(..., { ssr: false })` |
| Doctor stats | `dynamic(..., { ssr: false })` |
| Revenue | `dynamic(..., { ssr: false })` |

KPI, quick actions, and recent activity render immediately from SSR data.

### Cache

| Layer | TTL | Location |
|-------|-----|----------|
| Server | 30s | `unstable_cache` in `dashboard-stats.ts` |
| Route | 30s | `export const revalidate = 30` on page |
| Client memory | 15s | `dashboard-client-cache.ts` |

### Skeleton

- **Page:** `AdminDashboardSkeleton` — full dashboard placeholder
- **Sections:** `AdminDashboardSectionSkeleton` — used as `dynamic()` loading UI
- **Suspense:** Page wrapped in `<Suspense fallback={AdminDashboardSkeleton}>`

---

## File map

| Path | Role |
|------|------|
| `src/app/admin/(dashboard)/page.tsx` | RSC entry, cache + Suspense |
| `src/app/admin/(dashboard)/_lib/dashboard-stats.ts` | Server fetch + `unstable_cache` |
| `src/lib/admin/dashboard/dashboard-types.ts` | Shared types + normalize |
| `src/lib/admin/dashboard/dashboard-client-cache.ts` | Client memory cache |
| `src/lib/admin/dashboard/use-admin-dashboard-realtime.ts` | Poll + refresh hook |
| `src/app/admin/(dashboard)/_components/AdminDashboardClient.tsx` | Client orchestrator |
| `src/components/admin/dashboard/*` | Section components + skeleton + charts |

---

## Testing

```bash
npm run typecheck                              # ✅
npm test -- src/lib/admin/dashboard/dashboard-client-cache.test.ts  # ✅ cache TTL
```

**Manual smoke:**

1. Open `/admin` — KPI + activity visible immediately
2. Charts/doctor/revenue sections appear after lazy load
3. Live dot shows “লাইভ · … ago” in Bengali
4. Click **রিফ্রেশ** — spinner, data updates
5. Wait 30s — silent poll updates counts

---

## Removed

- `AdminDashboardView.tsx` — replaced by modular `AdminDashboardClient` + sections

---

**Output:** `ADMIN_DASHBOARD_COMPLETE`
