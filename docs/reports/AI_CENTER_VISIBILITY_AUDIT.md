# AI Center Visibility Audit

**Date:** 2026-05-30  
**Scope:** Why AI Center does not appear in the admin sidebar on the running application  
**Environment tested:** `http://localhost:3001` (Next.js dev), backend via BFF  
**Method:** Static code trace + live HTTP checks + permission matrix review  
**Fixes applied:** None (audit only)

---

## Executive summary

**AI Center is registered in navigation config but is never rendered in the sidebar.**

The exact root cause is a **sidebar section mapping gap**: `getAdminNavSectionsForSidebar()` in `admin-nav-sections.ts` only renders nav groups whose `id` appears in `SECTION_SPECS.groupIds`. The AI Center group uses `id: "ai-center"`, which is **not referenced in any section**. The group is filtered out before `AdminSidebar` renders, so no AI Center items appear regardless of role or permissions.

This is **not** caused by feature flags, missing permissions for `ADMIN`, or missing route registration.

---

## Root cause (exact)

```
ADMIN_NAV_GROUPS  ──►  filterAdminNavGroupsForActor  ──►  ai-center group KEPT (11 children)
                                                              │
                                                              ▼
                                              getAdminNavSectionsForSidebar
                                                              │
                         SECTION_SPECS has no "ai-center" ───►│──► group DROPPED
                                                              │
                                                              ▼
                                              AdminSidebar renders nothing for AI Center
```

**File:** `src/components/admin-ui/admin-nav-sections.ts`

```typescript
const SECTION_SPECS = [
  // ...
  { id: "sec-ai", titleBn: "এআই অপারেশন", groupIds: ["ai-technician-mgmt"] },
  // ai-center is NOT listed here
];
```

**Historical note:** The previous group id was `ai-ops`. It was also never listed in `SECTION_SPECS`, so the AI admin section has likely **never** appeared in the sidebar since the enterprise IA section layout was introduced.

---

## 1. Is AI Center registered in `admin-nav.tsx`?

**Yes — EXISTS**

| Property | Value |
|----------|-------|
| Group id | `ai-center` |
| labelEn | `AI Center` |
| labelBn | `এআই সেন্টার` |
| Group roles | `SUPER_ADMIN`, `ADMIN`, `SUPPORT` |
| Children | 11 items (Dashboard → Settings) |

Source: `src/components/admin-ui/admin-nav.tsx` lines 196–281.

---

## 2. Which permissions are required?

### Group-level gate

| Requirement | Value |
|-------------|-------|
| Role | One of `SUPER_ADMIN`, `ADMIN`, `SUPPORT` |

### Item-level capabilities

| Nav item | Capability |
|----------|------------|
| Dashboard | `ai.view` |
| Providers | `ai.view` |
| Models | `ai.view` |
| Routing | `ai.view` |
| API Keys | `ai.view` |
| Prompts | `ai.view` |
| Analytics | `ai.view` |
| Marketplace | `ai.view` |
| Health | `ai.view` |
| Logs | `ai.view` |
| Settings | `ai.manage` |

Filter logic: `src/components/admin-ui/admin-nav-permissions.ts` → `navItemVisibleForActor()` / `filterAdminNavGroupsForActor()`.

### Page-level guards (direct URL access)

| Route | Server guard |
|-------|--------------|
| All except Settings | `ensureAiCenterAccess('ai.view')` |
| `/admin/ai-ops/settings` | `ensureAiCenterAccess('ai.manage')` |

Source: `src/lib/admin-auth/ai-ops-guard.ts`, individual `page.tsx` files.

---

## 3. Which roles have those permissions?

From `src/lib/admin-auth/permissions-core.ts`:

| Capability | SUPER_ADMIN | ADMIN | SUPPORT |
|------------|:-----------:|:-----:|:-------:|
| `ai.view` | ✓ | ✓ | ✓ |
| `ai.manage` | ✓ | ✓ | — |

**Seeded panel user:** `admin@pranidoctor.com` → role **`ADMIN`** (confirmed via live login API).

An `ADMIN` actor passes both group role gate and all AI Center nav capability checks (10× `ai.view` + Settings requires `ai.manage`, which ADMIN has).

**Conclusion:** Permissions are **not** why AI Center is hidden for the default admin user.

---

## 4. Is AI Center hidden behind feature flags?

**No — not feature-flagged**

Searched `pranidoctor-web` for admin nav feature flags, `AI_CENTER`, `ai-center`, and env-gated nav logic. Findings:

| Check | Result |
|-------|--------|
| Feature flag on nav group | **None** |
| Env var gating AI Center | **None** |
| `AdminLayoutShell` extra filter | Only `filterAdminNavGroupsForActor` |
| `mobile.feature.flags` / DB settings | Mobile-only; does not affect admin sidebar |

Sidebar visibility is determined solely by: `ADMIN_NAV_GROUPS` → permission filter → **`admin-nav-sections.ts` section map** → `AdminSidebar`.

---

## 5. Are routes accessible directly?

**Yes — routes exist and respond when authenticated**

Live tests against `http://localhost:3001` with session cookie after login as `admin@pranidoctor.com`:

| Route | HTTP status | Notes |
|-------|-------------|-------|
| `/admin/ai-ops` | **200** | Page renders; body contains `"AI Center"` (page header) |
| `/admin/ai-ops/providers` | **200** | |
| `/admin/ai-ops/models` | **200** | |
| `/admin/ai-ops/routes` | **200** | |
| `/admin/ai-ops/api-keys` | **200** | |
| `/admin/ai-ops/prompts` | **200** | |
| `/admin/ai-ops/analytics` | **200** | |
| `/admin/ai-ops/marketplace` | **200** | |
| `/admin/ai-ops/health` | **200** | |
| `/admin/ai-ops/logs` | **200** | |
| `/admin/ai-ops/settings` | **200** | ADMIN has `ai.manage` |

**Sidebar HTML check** on `/admin/doctors` (authenticated):

| String searched | Found in sidebar HTML |
|-----------------|----------------------|
| `AI Center` | **No** |
| `ai-center` | **No** |
| `/admin/ai-ops/providers` | **No** |
| `মার্কেটপ্লেস` (Marketplace) | **No** |

Direct navigation works; sidebar links do not exist in the DOM.

---

## Permission filter vs section filter (verified)

Programmatic check (same logic as production):

| Step | `ai-center` present? |
|------|----------------------|
| `ADMIN_NAV_GROUPS` | **Yes** (11 children) |
| After `filterAdminNavGroupsForActor(ADMIN)` | **Yes** (11 children) |
| After `getAdminNavSectionsForSidebar()` | **No** — group omitted |

---

## Secondary findings

### Orphaned nav groups (same bug pattern)

These groups exist in `ADMIN_NAV_GROUPS` but are **also missing** from `SECTION_SPECS`:

| Group id | labelEn |
|----------|---------|
| `ai-center` | AI Center |
| `feed-ecosystem` | Feed & Livestock Ecosystem |

Both are invisible in the sidebar for the same reason.

### Auth loading behavior (not the primary issue)

While `status === "loading"`, groups with `roles` are hidden (`filterAdminNavGroupsForActor`). Once `/api/admin/auth/me` completes, an `ADMIN` user would see AI Center **if** the section mapper included it. This is transient, not the persistent root cause.

### SUPPORT role note

SUPPORT has `ai.view` but not `ai.manage`. They would see 10 nav items (not Settings) once section mapping is fixed.

---

## Answer checklist

| Question | Answer |
|----------|--------|
| Registered in `admin-nav.tsx`? | **Yes** |
| Permissions required? | Group: panel admin role; items: `ai.view` / `ai.manage` |
| Current seeded admin has permissions? | **Yes** (`ADMIN` has `ai.view` + `ai.manage`) |
| Hidden by feature flags? | **No** |
| Direct routes accessible? | **Yes** (HTTP 200 when logged in) |
| **Why not visible in sidebar?** | **`ai-center` not in `admin-nav-sections.ts` `SECTION_SPECS`** |

---

## Recommended fix (not implemented)

Add `ai-center` to an appropriate section in `SECTION_SPECS`, e.g.:

```typescript
{ id: "sec-ai-center", titleBn: "এআই সেন্টার", groupIds: ["ai-center"] },
```

Or append `"ai-center"` to an existing section such as `sec-ai` (alongside `ai-technician-mgmt`).

Also add `feed-ecosystem` if that section should be visible.

---

## Files involved

| File | Role |
|------|------|
| `src/components/admin-ui/admin-nav.tsx` | Defines `ai-center` group ✓ |
| `src/components/admin-ui/admin-nav-permissions.ts` | Role/capability filter ✓ |
| `src/components/admin-ui/admin-nav-sections.ts` | **Missing `ai-center` — root cause** |
| `src/components/admin-ui/AdminSidebar.tsx` | Renders only section-mapped groups |
| `src/components/admin-ui/AdminLayoutShell.tsx` | Wires nav → sidebar |
| `src/lib/admin-auth/permissions-core.ts` | Capability matrix |

---

**Audit completed:** 2026-05-30 — no code fixes applied.
