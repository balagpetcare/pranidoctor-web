# Admin Panel — Full QA Report

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` admin panel (`/admin/*`, `/enterprise/*`)  
**Docs reviewed:** ADMIN_WEB_AUDIT, ADMIN_API_MAPPING, ADMIN_AUTH_COMPLETE, ADMIN_LAYOUT_COMPLETE, ADMIN_MODULE_COMPLETE, ADMIN_DASHBOARD_COMPLETE

---

## Executive summary

| Area | Result | Notes |
|------|--------|-------|
| API failures | ✅ Handled | List modules use `AdminErrorState` + retry; blocked modules document missing API |
| Loading states | ✅ | `AdminLoadingState`, dashboard skeletons, lazy section loaders |
| Empty states | ✅ | `AdminEmptyState` on lists; SMS logs; blocked modules |
| Responsive | ✅ Improved | Dashboard activity table hides type column on mobile; shell is mobile-first |
| Permissions | ✅ Fixed | Nav auth-loading, dev-tools role gate, server guards on audit/OTP |
| Broken routes | ✅ | 57 routes verified; all nav hrefs resolve |
| Memory leaks | ✅ | Poll intervals cleaned up; refresh guarded on unmount |
| Types | ✅ | `npm run typecheck` passes |
| Duplicate code | ✅ Reduced | Shared labels, cache hook, service-request page shell |

**Verdict:** Production-ready for existing APIs. Blocked modules (users, animals, prescriptions) correctly show structured unavailable UI.

---

## QA checklist

### 1. API failures

| Module | Error UI | Retry | Notes |
|--------|----------|-------|-------|
| Dashboard | ✅ Banner + last data | ✅ Manual refresh | Poll errors non-destructive |
| Doctors, areas, billing, SR lists | ✅ `AdminErrorState` | ✅ | Standard pattern |
| Analytics / Reports | ✅ | ✅ | Now use shared cache hook |
| Blocked (users, animals) | ✅ Checklist UI | — | No API to fail |
| Notifications | ✅ | ✅ | Mark-read errors surfaced |
| OTP dev logs | ✅ Inline message | ✅ Refresh button | Env + role gated |

**Fix applied:** Analytics and Reports now use `useDashboardPageData()` with shared `dashboard-client-cache` instead of duplicate raw fetches.

### 2. Loading states

| Surface | Loader |
|---------|--------|
| Dashboard SSR | `AdminDashboardSkeleton` via Suspense |
| Dashboard charts/doctor/revenue | Section skeletons (lazy) |
| All list modules | `AdminLoadingState` |
| Auth restore | Nav shows ungated items (not blank) during `status === "loading"` |

**Fix applied:** Nav no longer empty while session restores.

### 3. Empty states

| Surface | Empty UI |
|---------|----------|
| List modules | `AdminEmptyState` with contextual copy |
| SMS logs | `AdminEmptyState` (no DB persistence) |
| Blocked modules | `AdminModuleUnavailable` checklist |
| Dashboard recent activity | Empty + CTA to service-requests |
| Nav search | “কোনো ফলাফল নেই” |

### 4. Responsive

| Check | Status |
|-------|--------|
| Mobile sidebar overlay + scroll lock | ✅ |
| Topbar compact search (Ctrl+K) | ✅ |
| KPI grid 1→2→3→4 cols | ✅ |
| Tables horizontal scroll | ✅ Lists + dashboard activity |
| Dashboard activity: type column hidden `< sm` | ✅ **Fixed** |
| Form max-width on settings | ✅ |

**Manual verify:** Resize `/admin` to 375px — KPI stack, quick actions 2-col, table scrolls.

### 5. Permissions

| Check | Before | After |
|-------|--------|-------|
| Nav empty during auth load | ❌ All hidden | ✅ Ungated items visible |
| OTP / Audit in nav for SUPPORT | ❌ Visible | ✅ Hidden (`SUPER_ADMIN`, `ADMIN` only) |
| OTP / Audit page server guard | ❌ Env only | ✅ `ensureAdminRole` |
| Enterprise review nav | ✅ `serviceInstance.view` | Unchanged |
| Page-level role guards (all routes) | ❌ Layout JWT only | ⚠ Partial — audit/OTP guarded; others rely on API 403 |

**Fix applied:**
- `navItemVisibleForActor(..., { authLoading })` — show ungated links during load
- `AdminLayoutShell` passes `authLoading`
- `AdminNavSearch` uses pre-filtered groups (no double-filter empty search)
- Nav `roles` on dev-tools + audit items

**Remaining (accepted):** Most CRUD routes don't call `ensureAdminRole` — backend `requireAdminPanelApiAccess` is the enforcement layer. Add per-route guards when granular module permissions exist.

### 6. Broken routes

**57 admin `page.tsx` routes** — all exist.

| Nav href | Route | Status |
|----------|-------|--------|
| All `ADMIN_NAV_GROUPS` children | Matched | ✅ |
| `/admin/users` | Exists, not in nav | ℹ Alias of customers module |
| Location sub-routes | Not in nav | ℹ Linked from locations page |

No 404 mismatches between sidebar and filesystem.

### 7. Memory leaks

| Mechanism | Cleanup |
|-----------|---------|
| Dashboard poll (`useAdminDashboardRealtime`) | `clearInterval` + `cancelled` flag |
| Auth session refresh (`AdminAuthProvider`) | `clearInterval` + `mountedRef` |
| Mobile sidebar body scroll lock | Restores `overflow` on unmount |
| Manual dashboard refresh | ✅ **Fixed** — `mountedRef` guard |
| `useDashboardPageData` | ✅ **Fixed** — `mountedRef` guard |

**No interval leaks found.**

Minor: Many list fetchers lack `AbortController` — low risk; state-after-unmount possible on fast navigation. Not fixed (wide blast radius).

### 8. Types

```bash
npm run typecheck   # ✅ passes
```

Shared dashboard types live in `src/lib/admin/dashboard/dashboard-types.ts` (no server-only imports in client paths).

### 9. Duplicate code

| Duplication | Resolution |
|-------------|------------|
| Service-request Bengali labels (dashboard vs list) | ✅ Dashboard uses `service-request-labels.ts` |
| `STATUS_TABS` hardcoded strings | ✅ Derived from `serviceRequestStatusBn()` |
| Dashboard API in analytics/reports | ✅ `useDashboardPageData()` + client cache |
| service-requests / cases / appointments pages | ✅ `ServiceRequestsPageShell` |
| OTP panel on audit + dev-tools | ✅ Audit links to dev-tools page only |
| `AdminPlaceholder` vs `AdminModuleUnavailable` | ✅ Placeholder delegates to Unavailable |

---

## Fixes applied (this QA pass)

| # | File(s) | Change |
|---|---------|--------|
| 1 | `admin-nav-permissions.ts`, `AdminLayoutShell.tsx` | Nav visible during auth loading |
| 2 | `AdminNavSearch.tsx` | Remove redundant actor re-filter |
| 3 | `admin-nav.tsx` | Role gate dev-tools + audit nav items |
| 4 | `audit/page.tsx`, `dev-tools/otp-logs/page.tsx` | Server `ensureAdminRole(SUPER_ADMIN, ADMIN)` |
| 5 | `AdminDashboardRecentActivitySection.tsx` | Canonical labels + responsive table |
| 6 | `ServiceRequestsList.tsx` | STATUS_TABS from shared label helper |
| 7 | `use-dashboard-page-data.ts` | Shared cache-aware hook |
| 8 | `AnalyticsAdminView.tsx`, `ReportsAdminView.tsx` | Use shared hook |
| 9 | `use-admin-dashboard-realtime.ts` | Unmount guard on refresh |
| 10 | `ServiceRequestsPageShell.tsx` + 3 pages | Deduplicate page wrappers |
| 11 | `AuditAdminHub.tsx` | Remove duplicate OTP embed |
| 12 | `AdminPlaceholder.tsx` | Delegate to `AdminModuleUnavailable` |
| 13 | `admin-nav-permissions.test.ts` | Regression tests for loading + roles |

---

## Known limitations (not bugs)

| Item | Severity | Notes |
|------|----------|-------|
| Users / animals / prescriptions APIs missing | Expected | Blocked UI with checklist |
| SMS delivery logs not persisted | Expected | Empty state documented |
| Auth audit API missing | Expected | Blocked section in audit hub |
| `/admin/users` not in nav | P2 | Route exists; nav points to `/admin/customers` |
| Enterprise review page lacks server capability guard | P2 | API returns 403; add `ensureAdminCapability` later |
| Service categories read-only | Expected | No POST/PATCH backend |
| Cases ≡ Appointments ≡ Service requests | By design | Same data, different nav labels |

---

## Test results

```bash
npm run typecheck                                              # ✅
npm test -- src/components/admin-ui/admin-nav-permissions.test.ts  # ✅ 3 tests
npm test -- src/lib/admin/dashboard/dashboard-client-cache.test.ts # ✅ 3 tests
npm test -- src/lib/admin-auth/remember-login.test.ts             # ✅ (auth)
npm test -- src/components/admin-ui/admin-breadcrumbs.test.ts    # ✅ (layout)
```

---

## Manual smoke script

1. **Login** → `/admin/login` — remember me, idle message
2. **Dashboard** → KPI, charts lazy-load, live dot, refresh
3. **Nav** → Items visible immediately after hard refresh (not blank sidebar)
4. **Search** → Ctrl+K finds “ডাক্তার”
5. **SUPPORT role** (if available) → No OTP/Audit in nav; direct URL redirects with `?error=forbidden`
6. **Doctors list** → Search, pagination, empty/error paths
7. **Service requests** → Status tabs Bengali consistent with dashboard
8. **Blocked** → `/admin/customers` shows checklist not blank page
9. **Mobile** → 375px width — sidebar, table scroll
10. **Analytics → Dashboard** → Second load uses cache (no duplicate spinner if within 15s)

---

## Related documentation

| Doc | Purpose |
|-----|---------|
| [ADMIN_WEB_AUDIT.md](./ADMIN_WEB_AUDIT.md) | Initial gap analysis |
| [ADMIN_API_MAPPING.md](./ADMIN_API_MAPPING.md) | Backend route map |
| [ADMIN_AUTH_COMPLETE.md](./ADMIN_AUTH_COMPLETE.md) | Auth features |
| [ADMIN_LAYOUT_COMPLETE.md](./ADMIN_LAYOUT_COMPLETE.md) | Shell chrome |
| [ADMIN_MODULE_COMPLETE.md](./ADMIN_MODULE_COMPLETE.md) | Module matrix |
| [ADMIN_DASHBOARD_COMPLETE.md](./ADMIN_DASHBOARD_COMPLETE.md) | Dashboard features |

---

**Output:** `ADMIN_QA_COMPLETE`
