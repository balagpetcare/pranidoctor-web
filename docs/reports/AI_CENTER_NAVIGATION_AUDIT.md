# AI Center Navigation Audit

**Date:** 2026-05-30  
**Scope:** Why AI Center does not appear in the admin sidebar  
**Repos inspected:** `pranidoctor-web`  
**Method:** Static code trace of navigation builders, route inventory, permission matrix, and sidebar render pipeline

---

## Executive summary

**AI Center was fully registered in navigation config and all routes existed, but the sidebar never rendered the group.**

Root cause: **`admin-nav-sections.ts` section mapping gap.** The `ai-center` nav group was defined in `admin-nav.tsx` but its `id` was not listed in `SECTION_SPECS.groupIds`. `AdminSidebar` only renders groups that survive `getAdminNavSectionsForSidebar()`, so AI Center was dropped before paint.

This was **not** caused by missing routes, role/permission denial for `ADMIN`, feature flags, or environment variables.

---

## Navigation pipeline

```
ADMIN_NAV_GROUPS (admin-nav.tsx)
        │
        ▼
filterAdminNavGroups() — legacy no-op filter
        │
        ▼
filterAdminNavGroupsForActor() — role + capability gate
        │
        ▼
getAdminNavSectionsForSidebar() — SECTION_SPECS groupIds map  ◄── ROOT CAUSE
        │
        ▼
AdminSidebar — renders section headers + collapsible groups
```

**Files involved:**

| File | Role |
|------|------|
| `src/components/admin-ui/admin-nav.tsx` | Primary nav config — groups, items, hrefs |
| `src/components/admin-ui/admin-nav-permissions.ts` | Role/capability filtering per actor |
| `src/components/admin-ui/admin-nav-sections.ts` | Enterprise IA — maps group ids → sidebar sections |
| `src/components/admin-ui/AdminLayoutShell.tsx` | Wires auth + nav groups into sidebar |
| `src/components/admin-ui/AdminSidebar.tsx` | Renders section-mapped groups only |
| `src/components/admin-ui/AdminNavSearch.tsx` | Search uses flattened groups (not section-filtered) |
| `src/components/admin-ui/admin-breadcrumbs.ts` | Breadcrumbs use `ADMIN_NAV_ITEMS` (unaffected) |

There are **no other navigation builders** beyond the files above.

---

## 1. `admin-nav.tsx` — AI Center registration

**Status: EXISTS**

| Property | Value |
|----------|-------|
| Group id | `ai-center` |
| labelEn | `AI Center` |
| labelBn | `এআই সেন্টার` |
| Group roles | `SUPER_ADMIN`, `ADMIN`, `SUPPORT` |
| Children | 11 items |

Source: `src/components/admin-ui/admin-nav.tsx` lines 196–281.

---

## 2. Route verification

All required App Router pages exist under `src/app/admin/(dashboard)/ai-ops/`:

| Route | Page file | Status |
|-------|-----------|--------|
| `/admin/ai-ops` | `ai-ops/page.tsx` | ✓ |
| `/admin/ai-ops/providers` | `ai-ops/providers/page.tsx` | ✓ |
| `/admin/ai-ops/models` | `ai-ops/models/page.tsx` | ✓ |
| `/admin/ai-ops/routes` | `ai-ops/routes/page.tsx` | ✓ |
| `/admin/ai-ops/api-keys` | `ai-ops/api-keys/page.tsx` | ✓ |
| `/admin/ai-ops/prompts` | `ai-ops/prompts/page.tsx` | ✓ |
| `/admin/ai-ops/analytics` | `ai-ops/analytics/page.tsx` | ✓ |
| `/admin/ai-ops/marketplace` | `ai-ops/marketplace/page.tsx` | ✓ |
| `/admin/ai-ops/health` | `ai-ops/health/page.tsx` | ✓ |
| `/admin/ai-ops/logs` | `ai-ops/logs/page.tsx` | ✓ |
| `/admin/ai-ops/settings` | `ai-ops/settings/page.tsx` | ✓ |

**Additional ai-ops pages (not in nav):** `failover`, `governance`, `knowledge`, `risk` — present but intentionally not listed in sidebar nav.

Each listed page uses `ensureAiCenterAccess()` from `src/lib/admin-auth/ai-ops-guard.ts`.

---

## 3. Sidebar registration

| Layer | Registered? | Notes |
|-------|:-----------:|-------|
| `ADMIN_NAV_GROUPS` | ✓ | Group `ai-center` with 11 children |
| `filterAdminNavGroupsForActor` | ✓ | Passes for `ADMIN` / `SUPER_ADMIN` / `SUPPORT` |
| `SECTION_SPECS` (pre-fix) | ✗ | **`ai-center` missing — group never rendered** |
| `AdminSidebar` | — | Consumes section-mapped groups only |

---

## 4. Visibility gates

### Role checks

Group-level roles: `SUPER_ADMIN`, `ADMIN`, `SUPPORT`.

`filterAdminNavGroupsForActor()` hides groups with `roles` while `authLoading === true`. After `/api/admin/auth/me` resolves, eligible roles see the group **if** section mapping includes it.

### Permission checks (capabilities)

| Nav item | Capability |
|----------|------------|
| Dashboard, Providers, Models, Routing, API Keys, Prompts, Analytics, Marketplace, Health, Logs | `ai.view` |
| Settings | `ai.manage` |

From `src/lib/admin-auth/permissions-core.ts`:

| Capability | SUPER_ADMIN | ADMIN | SUPPORT |
|------------|:-----------:|:-----:|:-------:|
| `ai.view` | ✓ | ✓ | ✓ |
| `ai.manage` | ✓ | ✓ | — |

**Conclusion:** Permissions are not the blocker for default `ADMIN` users.

### Feature flags

No feature flag, env var, or runtime toggle gates AI Center nav. Searched for `AI_CENTER`, `ai-center`, and nav-specific env checks — none found.

### Environment checks

No environment-based nav filtering in `AdminLayoutShell` or sidebar components.

---

## 5. AI Operations vs AI Center (unchanged separation)

| Group id | Sidebar section (pre-fix) | Purpose |
|----------|---------------------------|---------|
| `ai-technician-mgmt` | `sec-ai` — "এআই অপারেশন" | Business workflow: applications, complaints, enterprise review |
| `ai-center` | *(missing)* | AI Operating System: providers, models, routing, keys, etc. |

These are intentionally separate groups in `admin-nav.tsx`. The bug only affected `ai-center` section mapping; `ai-technician-mgmt` was already visible under "এআই অপারেশন".

---

## 6. Filter pipeline verification

| Step | `ai-center` present? |
|------|----------------------|
| `ADMIN_NAV_GROUPS` | Yes (11 children) |
| After `filterAdminNavGroupsForActor(ADMIN)` | Yes (11 children) |
| After `getAdminNavSectionsForSidebar()` (pre-fix) | **No** |
| After fix (see implementation report) | **Yes** |

---

## 7. Secondary finding

`feed-ecosystem` group is also missing from `SECTION_SPECS` and remains sidebar-invisible for the same reason. Out of scope for this audit unless product requests it.

---

## Answer checklist

| Question | Answer |
|----------|--------|
| Registered in `admin-nav.tsx`? | **Yes** |
| All 11 routes exist? | **Yes** |
| Sidebar section mapping? | **Missing (pre-fix)** |
| Hidden by roles? | **No** (for ADMIN/SUPER_ADMIN/SUPPORT) |
| Hidden by permissions? | **No** (for ADMIN) |
| Hidden by feature flags? | **No** |
| Hidden by environment? | **No** |
| **Why not visible?** | **`ai-center` not in `SECTION_SPECS`** |

---

## Fix applied

See `docs/reports/AI_CENTER_NAVIGATION_IMPLEMENTATION.md`.

**Audit completed:** 2026-05-30
