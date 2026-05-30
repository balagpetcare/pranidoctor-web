# AI Admin Panel Integration Audit

**Date:** 2026-05-30  
**Scope:** Prani Doctor web admin panel — AI Operating System (AI Ops / AIMS)  
**Repos audited:** `pranidoctor-web` (primary), `pranidoctor-backend` (BFF target / legacy routes)  
**Method:** Static code review — no code changes, no runtime verification

---

## Executive summary

The AI Administration panel is **substantially integrated** in the web app: sidebar navigation, App Router pages, client components, shared admin layout, and BFF proxy routes exist for most core AI Ops surfaces. Integration is **strongest** for navigation, routing, and read-only list views. It is **weakest** for marketplace (entirely absent in web), main-dashboard AI widgets, page-level permission enforcement, and full CRUD UX on several panels.

| Area | Verdict |
|------|---------|
| Sidebar navigation | **EXISTS** |
| Admin menu (sidebar) | **EXISTS** |
| Route registration | **EXISTS** (requested routes except marketplace) |
| Page components | **EXISTS** / **PARTIAL** |
| Layout integration | **EXISTS** |
| Permission integration | **PARTIAL** |
| Dashboard widgets (main `/admin`) | **MISSING** |
| AI Ops dashboard widgets (`/admin/ai-ops`) | **EXISTS** |
| Marketplace admin | **MISSING** (backend only) |

---

## 1. Sidebar navigation registration

**Status: EXISTS**

**Source:** `src/components/admin-ui/admin-nav.tsx` — group `id: "ai-ops"` (`labelEn: "AI Administration"`).

**Group role gate:** `SUPER_ADMIN`, `ADMIN`, `SUPPORT`.

**Child items (12):**

| Sidebar item | href | capability |
|--------------|------|------------|
| AI ড্যাশবোর্ড | `/admin/ai-ops` | `ai.view` |
| প্রোভাইডার | `/admin/ai-ops/providers` | `ai.view` |
| মডেল | `/admin/ai-ops/models` | `ai.view` |
| রাউট | `/admin/ai-ops/routes` | `ai.view` |
| API কী | `/admin/ai-ops/api-keys` | `ai.view` |
| প্রম্পট | `/admin/ai-ops/prompts` | `ai.view` |
| ব্যবহার অ্যানালিটিক্স | `/admin/ai-ops/analytics` | `ai.view` |
| ফেইলওভার | `/admin/ai-ops/failover` | `ai.view` |
| হেলথ স্ট্যাটাস | `/admin/ai-ops/health` | `ai.view` |
| নলেজ বেস | `/admin/ai-ops/knowledge` | `ai.view` |
| ঝুঁকি মনিটরিং | `/admin/ai-ops/risk` | `ai.view` |
| গভর্নেন্স | `/admin/ai-ops/governance` | `ai.manage` |

**Missing from sidebar:** `/admin/ai-ops/marketplace` — **MISSING**

**Wiring:** `AdminLayoutShell` → `filterAdminNavGroupsForActor` → `AdminSidebar` (`src/components/admin-ui/AdminLayoutShell.tsx`).

---

## 2. Admin menu registration

**Status: EXISTS**

The admin menu is the same `ADMIN_NAV_GROUPS` structure consumed by `AdminSidebar` and `AdminTopbar` (section title via `getSectionTitleFromPath`). There is no separate menu registry; sidebar **is** the admin menu for AI Ops.

**Cross-link:** `src/app/admin/(dashboard)/launch-ops/page.tsx` links to `/admin/ai-ops/governance` — **EXISTS**.

---

## 3. Route registration

### Requested routes

| Route | App Router page | Status |
|-------|-----------------|--------|
| `/admin/ai-ops` | `src/app/admin/(dashboard)/ai-ops/page.tsx` | **EXISTS** |
| `/admin/ai-ops/providers` | `src/app/admin/(dashboard)/ai-ops/providers/page.tsx` | **EXISTS** |
| `/admin/ai-ops/models` | `src/app/admin/(dashboard)/ai-ops/models/page.tsx` | **EXISTS** |
| `/admin/ai-ops/routes` | `src/app/admin/(dashboard)/ai-ops/routes/page.tsx` | **EXISTS** |
| `/admin/ai-ops/prompts` | `src/app/admin/(dashboard)/ai-ops/prompts/page.tsx` | **EXISTS** |
| `/admin/ai-ops/analytics` | `src/app/admin/(dashboard)/ai-ops/analytics/page.tsx` | **EXISTS** |
| `/admin/ai-ops/marketplace` | — | **MISSING** |

### Additional AI Ops routes (not in audit list)

| Route | Page | Status |
|-------|------|--------|
| `/admin/ai-ops/api-keys` | `api-keys/page.tsx` | **EXISTS** |
| `/admin/ai-ops/failover` | `failover/page.tsx` | **EXISTS** |
| `/admin/ai-ops/health` | `health/page.tsx` | **EXISTS** |
| `/admin/ai-ops/knowledge` | `knowledge/page.tsx` | **EXISTS** |
| `/admin/ai-ops/risk` | `risk/page.tsx` | **EXISTS** |
| `/admin/ai-ops/governance` | `governance/page.tsx` | **EXISTS** |

**Dedicated `ai-ops/layout.tsx`:** **MISSING** (pages inherit `(dashboard)/layout.tsx` — acceptable).

---

## 4. Page components

| Page | Component | File | Status |
|------|-----------|------|--------|
| Dashboard | `AiOpsOverview` | `src/components/admin/ai-ops/AiOpsOverview.tsx` | **EXISTS** |
| Providers | `ProviderPanel` | `ProviderPanel.tsx` | **EXISTS** |
| Models | `ModelPanel` | `ModelPanel.tsx` | **EXISTS** |
| Routes | `RoutePanel` | `RoutePanel.tsx` | **EXISTS** |
| Prompts | `PromptList` | `PromptList.tsx` | **EXISTS** |
| Analytics | `UsageAnalyticsPanel` | `UsageAnalyticsPanel.tsx` | **EXISTS** |
| Marketplace | — | — | **MISSING** |
| API Keys | `ApiKeysPanel` | `ApiKeysPanel.tsx` | **EXISTS** |
| Failover | `FailoverPanel` | `FailoverPanel.tsx` | **EXISTS** |
| Health | `HealthPanel` | `HealthPanel.tsx` | **EXISTS** |
| Knowledge | `KnowledgeList` | `KnowledgeList.tsx` | **EXISTS** |
| Risk | `AiRiskPanel` | `AiRiskPanel.tsx` | **EXISTS** |
| Governance | `AiGovernancePanel` | `AiGovernancePanel.tsx` | **EXISTS** |

**Shared hook:** `use-ai-admin-resource.ts` — **EXISTS**

### Component depth (functional completeness)

| Component | Status | Gaps |
|-----------|--------|------|
| `AiOpsOverview` | **EXISTS** | Read-only KPIs + by-model table |
| `ProviderPanel` | **PARTIAL** | List + enable/disable; no create/edit provider form |
| `ModelPanel` | **PARTIAL** | List + toggle; no create/edit |
| `RoutePanel` | **PARTIAL** | List + toggle; no create/edit chain editor |
| `PromptList` | **PARTIAL** | Versioning, publish, rollback, draft-from-published; **no** prompt body editor or create flow |
| `UsageAnalyticsPanel` | **PARTIAL** | 30-day dashboard only; BFF routes for trends/report/export unused |
| `ApiKeysPanel` | **PARTIAL** | List, test, revoke; **no** add/rotate UI |
| `FailoverPanel` | **PARTIAL** | Circuit breakers + rule list + toggle; no rule create/edit |
| `HealthPanel` | **EXISTS** | Probes, validation, snapshots (read-only) |
| `KnowledgeList` | **PARTIAL** | List + publish; no create/edit |
| `AiRiskPanel` | **EXISTS** | Read-only risk/outbreak data |
| `AiGovernancePanel` | **EXISTS** | Kill switch + escalations |

---

## 5. Layout integration

**Status: EXISTS**

| Layer | Path | AI Ops behavior |
|-------|------|-----------------|
| Root admin layout | `src/app/admin/layout.tsx` | Typography, error boundary, robots meta — **EXISTS** |
| Dashboard layout | `src/app/admin/(dashboard)/layout.tsx` | `ensureAdminDashboardAccess()` + `AdminLayoutShell` — **EXISTS** |
| AI Ops layout | — | **MISSING** (uses dashboard layout — **PARTIAL** if dedicated sub-nav was intended) |

All AI Ops pages render inside `AdminLayoutShell` (sidebar, topbar, legal gate, monitoring provider) — **EXISTS**.

---

## 6. Permission integration

**Status: PARTIAL**

### Capability keys (`src/lib/admin-auth/permissions-core.ts`)

| Capability | SUPER_ADMIN | ADMIN | SUPPORT |
|------------|:-----------:|:-----:|:-------:|
| `ai.view` | ✓ | ✓ | ✓ |
| `ai.manage` | ✓ | ✓ | — |
| `ai.secrets.manage` | ✓ | — | — |
| `ai.analytics.export` | ✓ | ✓ | — |

### Nav enforcement

- Group: role gate (`SUPER_ADMIN`, `ADMIN`, `SUPPORT`) — **EXISTS**
- Items: `capability: "ai.view"` or `"ai.manage"` — **EXISTS**
- **Gap:** API Keys nav uses `ai.view`, not `ai.secrets.manage` — **PARTIAL**

### Page-level enforcement

- AI Ops pages do **not** call `ensureAdminRole()` or `assertAdminCan()` — **MISSING** on pages (rely on nav hide + BFF).
- Compare: `/admin/audit` and `/admin/dev-tools/otp-logs` use `ensureAdminRole` — AI Ops does not.

### BFF / API enforcement

- `proxyRouteToBackend` → `requireAdminPanelApiAccess()` — **EXISTS** (session-based admin gate).
- Backend legacy routes use `requireAiAdminActor()` (ADMIN/SUPER_ADMIN) — **EXISTS** on backend.
- SUPER_ADMIN-only vault mutations enforced on **backend**, not differentiated in web UI — **PARTIAL**.

### Tests

- `admin-nav-permissions.test.ts` — generic role tests only; **no AI-specific permission tests** — **PARTIAL**

---

## 7. Dashboard widgets

### Main admin dashboard (`/admin`)

**Status: MISSING**

- `AdminDashboardClient` (`src/app/admin/(dashboard)/_components/AdminDashboardClient.tsx`) has KPI, charts, doctor stats, revenue — **no AI Ops widgets or links**.
- `src/components/admin/dashboard/*` — **no AI references**.

### AI Ops dashboard (`/admin/ai-ops`)

**Status: EXISTS**

- `AiOpsOverview` widgets: LLM usage KPIs (requests, tokens, cost, latency, fallbacks), by-model table, top users/customers, ecosystem activity counts — **EXISTS**.

---

## 8. AI Ops pages — BFF proxy coverage

Web BFF routes under `src/app/api/admin/ai-ops/` proxy to backend legacy routes.

| BFF prefix | Web proxy | Backend legacy | UI consumer |
|------------|-----------|----------------|-------------|
| `/overview` | **EXISTS** | **EXISTS** | `AiOpsOverview` |
| `/providers` | **EXISTS** | **EXISTS** | `ProviderPanel` |
| `/providers/dashboard` | **EXISTS** | **EXISTS** | `ProviderPanel` |
| `/models` | **EXISTS** | **EXISTS** | `ModelPanel` |
| `/routes` | **EXISTS** | **EXISTS** | `RoutePanel` |
| `/secrets` | **EXISTS** | **EXISTS** | `ApiKeysPanel` |
| `/prompts` (+ sub-routes) | **EXISTS** | **PARTIAL** on backend legacy (list/create/activate only; full management via Express module) | `PromptList` |
| `/analytics/usage/dashboard` | **EXISTS** | **EXISTS** | `UsageAnalyticsPanel` |
| `/analytics/usage/*` (other) | **EXISTS** | **PARTIAL** (dashboard route added; others via unmounted Express admin module) | **MISSING** UI |
| `/failover/*` | **EXISTS** | **EXISTS** | `FailoverPanel` |
| `/health` | **EXISTS** | **EXISTS** | `HealthPanel` |
| `/knowledge` | **EXISTS** | **EXISTS** | `KnowledgeList` |
| `/analytics/risk` | **EXISTS** | **EXISTS** | `AiRiskPanel` |
| `/governance` | **EXISTS** | **EXISTS** | `AiGovernancePanel` |
| `/marketplace/*` | **MISSING** | **EXISTS** (backend only) | **MISSING** |

### Marketplace backend APIs (no web BFF)

Backend routes exist at `pranidoctor-backend/src/legacy/web/routes/admin/ai-ops/marketplace/`:

- `extensions` (GET/POST)
- `adapters` (GET)
- `models/external` (GET/POST)
- `veterinary/models` (GET)
- `openrouter/sync` (POST)

**Web BFF + page + sidebar: MISSING**

---

## Page & sidebar matrix (requested routes)

| Item | Sidebar | Route | Page | Component | BFF | Overall |
|------|---------|-------|------|-----------|-----|---------|
| `/admin/ai-ops` | **EXISTS** | **EXISTS** | **EXISTS** | **EXISTS** | **EXISTS** | **EXISTS** |
| `/admin/ai-ops/providers` | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** | **EXISTS** | **PARTIAL** |
| `/admin/ai-ops/models` | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** | **EXISTS** | **PARTIAL** |
| `/admin/ai-ops/routes` | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** | **EXISTS** | **PARTIAL** |
| `/admin/ai-ops/prompts` | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** | **PARTIAL** | **PARTIAL** |
| `/admin/ai-ops/analytics` | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** | **PARTIAL** | **PARTIAL** |
| `/admin/ai-ops/marketplace` | **MISSING** | **MISSING** | **MISSING** | **MISSING** | **MISSING** | **MISSING** |

---

## Additional sidebar items (full AI Ops section)

| Item | Sidebar | Route | Page | Component | Overall |
|------|---------|-------|------|-----------|---------|
| API Keys | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** | **PARTIAL** |
| Failover | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** | **PARTIAL** |
| Health | **EXISTS** | **EXISTS** | **EXISTS** | **EXISTS** | **EXISTS** |
| Knowledge | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** | **PARTIAL** |
| Risk | **EXISTS** | **EXISTS** | **EXISTS** | **EXISTS** | **EXISTS** |
| Governance | **EXISTS** | **EXISTS** | **EXISTS** | **EXISTS** | **PARTIAL** (nav uses `ai.manage`; page unguarded) |

---

## Documentation vs implementation

| Doc | Location | Alignment |
|-----|----------|-----------|
| `docs/ai/AI_ADMIN_PANEL.md` | web | Matches implemented pages; **does not** document marketplace |
| Backend `docs/ai/AI_ADMIN_PANEL.md` | backend | Describes APIs including marketplace — **ahead of web UI** |
| `docs/openapi.json` | web | **PARTIAL** — older ai-ops subset; no providers/models/routes/marketplace |

---

## Priority gaps (recommended follow-up — audit only, not implemented)

1. **Marketplace** — page, sidebar item, BFF proxies (`/marketplace/extensions`, `/openrouter/sync`, etc.).
2. **Main dashboard AI widgets** — summary KPIs or quick link card to `/admin/ai-ops`.
3. **Page-level permissions** — `assertAdminCan('ai.view')` on AI Ops pages; `ai.secrets.manage` on API Keys; hide destructive actions for SUPPORT.
4. **CRUD UX** — provider/model/route create forms; prompt editor; API key add/rotate; marketplace extension installer UI.
5. **Analytics depth** — wire trends, provider comparison, CSV export UI to existing BFF routes.
6. **OpenAPI** — regenerate to include full ai-ops surface.

---

## File reference index

| Concern | Primary files |
|---------|---------------|
| Sidebar / menu | `src/components/admin-ui/admin-nav.tsx` |
| Nav permissions | `src/components/admin-ui/admin-nav-permissions.ts`, `src/lib/admin-auth/permissions-core.ts` |
| Layout | `src/app/admin/(dashboard)/layout.tsx`, `src/components/admin-ui/AdminLayoutShell.tsx` |
| Pages | `src/app/admin/(dashboard)/ai-ops/**/page.tsx` |
| Components | `src/components/admin/ai-ops/*.tsx` |
| BFF | `src/app/api/admin/ai-ops/**/route.ts` |
| Backend targets | `pranidoctor-backend/src/legacy/web/routes/admin/ai-ops/**` |

---

**Audit completed:** 2026-05-30 — read-only; no application code modified.
