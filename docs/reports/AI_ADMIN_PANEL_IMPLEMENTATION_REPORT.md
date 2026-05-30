# AI Admin Panel Implementation Report

**Date:** 2026-05-30  
**Scope:** Complete Admin Panel integration for the AI Operating System (AI Center)  
**Repository:** `pranidoctor-web` (+ BFF proxies to `pranidoctor-backend`)

---

## Summary

The AI Center admin section is fully integrated with sidebar navigation, App Router pages, server-side permission guards, BFF API proxies, loading/error UX, dashboard summary cards, breadcrumbs, and three new surfaces (Marketplace, Logs, Settings).

---

## 1. Sidebar — AI Center

**File:** `src/components/admin-ui/admin-nav.tsx`

| Nav item | Route | Capability |
|----------|-------|------------|
| Dashboard | `/admin/ai-ops` | `ai.view` |
| Providers | `/admin/ai-ops/providers` | `ai.view` |
| Models | `/admin/ai-ops/models` | `ai.view` |
| Routing | `/admin/ai-ops/routes` | `ai.view` |
| API Keys | `/admin/ai-ops/api-keys` | `ai.view` |
| Prompts | `/admin/ai-ops/prompts` | `ai.view` |
| Analytics | `/admin/ai-ops/analytics` | `ai.view` |
| Marketplace | `/admin/ai-ops/marketplace` | `ai.view` |
| Health | `/admin/ai-ops/health` | `ai.view` |
| Logs | `/admin/ai-ops/logs` | `ai.view` |
| Settings | `/admin/ai-ops/settings` | `ai.manage` |

Group id: `ai-center` (English label: **AI Center**).  
Roles: `SUPER_ADMIN`, `ADMIN`, `SUPPORT`.

Legacy nav items (failover, knowledge, risk, governance) removed from sidebar; routes remain reachable at their URLs for backward compatibility.

---

## 2. Pages

| Route | Page file | Component | Guard |
|-------|-----------|-----------|-------|
| `/admin/ai-ops` | `ai-ops/page.tsx` | `AiOpsOverview` | `ai.view` |
| `/admin/ai-ops/providers` | `providers/page.tsx` | `ProviderPanel` | `ai.view` |
| `/admin/ai-ops/models` | `models/page.tsx` | `ModelPanel` | `ai.view` |
| `/admin/ai-ops/routes` | `routes/page.tsx` | `RoutePanel` | `ai.view` |
| `/admin/ai-ops/api-keys` | `api-keys/page.tsx` | `ApiKeysPanel` | `ai.view` + `ai.secrets.manage` for mutations |
| `/admin/ai-ops/prompts` | `prompts/page.tsx` | `PromptList` | `ai.view` |
| `/admin/ai-ops/analytics` | `analytics/page.tsx` | `UsageAnalyticsPanel` | `ai.view` |
| `/admin/ai-ops/marketplace` | `marketplace/page.tsx` | `MarketplacePanel` | `ai.view` |
| `/admin/ai-ops/health` | `health/page.tsx` | `HealthPanel` | `ai.view` |
| `/admin/ai-ops/logs` | `logs/page.tsx` | `AiLogsPanel` | `ai.view` |
| `/admin/ai-ops/settings` | `settings/page.tsx` | `AiSettingsPanel` | `ai.manage` |

**Guard helper:** `src/lib/admin-auth/ai-ops-guard.ts` → `ensureAiCenterAccess(capability)`.

---

## 3. API connections (BFF → backend)

### Existing proxies (used by pages)

| Page | BFF endpoints |
|------|----------------|
| Dashboard | `GET /api/admin/ai-ops/overview`, `providers`, `health` |
| Providers | `GET /api/admin/ai-ops/providers`, `providers/dashboard`; `POST …/toggle` |
| Models | `GET /api/admin/ai-ops/models`; `POST …/toggle` |
| Routing | `GET /api/admin/ai-ops/routes`; `POST …/toggle` |
| API Keys | `GET /api/admin/ai-ops/secrets`; `POST …/test`, `…/disable` |
| Prompts | `GET/POST /api/admin/ai-ops/prompts/*` |
| Analytics | `GET /api/admin/ai-ops/analytics/usage/dashboard` |
| Health | `GET /api/admin/ai-ops/health` |
| Settings | `GET/POST /api/admin/ai-ops/governance` |

### New BFF proxies

| Route | Methods | Backend target |
|-------|---------|----------------|
| `/api/admin/ai-ops/marketplace/extensions` | GET, POST | Legacy marketplace extensions |
| `/api/admin/ai-ops/marketplace/adapters` | GET | Adapter registry |
| `/api/admin/ai-ops/marketplace/models/external` | GET, POST | External model registration |
| `/api/admin/ai-ops/marketplace/veterinary/models` | GET | Veterinary models |
| `/api/admin/ai-ops/marketplace/openrouter/sync` | POST | OpenRouter catalog sync |
| `/api/admin/ai-ops/audit` | GET | Express `GET /api/admin/ai-ops/audit` |

### Logs page APIs

| Tab | Endpoint |
|-----|----------|
| Usage logs | `GET /api/admin/ai-ops/analytics/usage/report?sinceDays=7&limit=100` |
| Audit log | `GET /api/admin/ai-ops/audit?sinceDays=7` |

---

## 4. Permission integration

| Layer | Implementation |
|-------|----------------|
| Sidebar | `capability` on each nav item; filtered by `filterAdminNavGroupsForActor` |
| Server pages | `ensureAiCenterAccess()` on every AI Center page |
| API Keys UI | `canManageSecrets` prop from `adminCan(actor, 'ai.secrets.manage')` — SUPPORT sees read-only list |
| Settings | Requires `ai.manage` (SUPPORT excluded) |
| BFF | Existing `requireAdminPanelApiAccess()` on all admin proxies |

---

## 5. Dashboard summary cards

**File:** `src/components/admin/ai-ops/AiOpsOverview.tsx`

- **Summary row:** Requests (30d), est. cost, active providers ratio, system health (reachable/total).
- **Quick links:** Grid of cards linking to all AI Center sub-pages.
- **Detail sections:** LLM usage KPIs, by-model table, top users/tenants, ecosystem activity.

---

## 6. Loading & error handling

**Shared component:** `src/components/admin/ai-ops/AiOpsResourceBoundary.tsx`

- Wraps all primary AI Center panels.
- Uses `AdminLoadingState` while fetching.
- Uses `AdminErrorState` with retry callback on failure.

Updated panels: `ProviderPanel`, `ModelPanel`, `RoutePanel`, `ApiKeysPanel`, `UsageAnalyticsPanel`, `HealthPanel`, `MarketplacePanel`, `AiLogsPanel`, `AiOpsOverview`, `AiGovernancePanel` (via settings).

---

## 7. Breadcrumbs

**File:** `src/components/admin-ui/admin-breadcrumbs.ts`

- Added `EXTRA_SEGMENTS` for `ai-ops`, `marketplace`, `logs`, `routes`, `providers`, `models`, `health`, `api-keys`, `prompts`.
- Nav item `labelBn` used as primary crumb via `findNavItem`.
- **Test added:** `buildAdminBreadcrumbs("/admin/ai-ops/providers")` → includes `প্রোভাইডার`.

---

## 8. New components

| Component | Purpose |
|-----------|---------|
| `MarketplacePanel` | Extensions, external/veterinary models, adapters, OpenRouter sync |
| `AiLogsPanel` | Usage execution log + governance audit log (tabbed) |
| `AiSettingsPanel` | Wraps governance/kill-switch UI for Settings page |
| `AiOpsResourceBoundary` | Shared loading/error shell |

---

## 9. Other updates

- `launch-ops/page.tsx`: governance link → `/admin/ai-ops/settings`.
- `AiGovernancePanel`: optional `headingTitle` / `headingDescription` props; loading + error states.

---

## 10. Verification

| Check | Result |
|-------|--------|
| Breadcrumb unit tests | **PASS** (4/4) |
| TypeScript | Pre-existing JSX in `use-ai-admin-resource.ts` (`.ts` extension) — unchanged |

---

## File index

```
src/lib/admin-auth/ai-ops-guard.ts
src/components/admin-ui/admin-nav.tsx
src/components/admin-ui/admin-breadcrumbs.ts
src/components/admin/ai-ops/AiOpsResourceBoundary.tsx
src/components/admin/ai-ops/AiOpsOverview.tsx
src/components/admin/ai-ops/MarketplacePanel.tsx
src/components/admin/ai-ops/AiLogsPanel.tsx
src/components/admin/ai-ops/AiSettingsPanel.tsx
src/app/admin/(dashboard)/ai-ops/**/page.tsx
src/app/api/admin/ai-ops/marketplace/**/route.ts
src/app/api/admin/ai-ops/audit/route.ts
```

---

**Implementation completed:** 2026-05-30
