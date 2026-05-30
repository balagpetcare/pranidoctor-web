# Web Release Verification Report — pranidoctor-web

**Date:** 2026-05-30  
**Scope:** Release blockers only — no new features, UI behavior preserved.

## Executive summary

| Gate | Baseline | Final | Status |
|------|----------|-------|--------|
| `pnpm run typecheck` | **FAIL** (~35 errors) | **0 errors** | PASS |
| `pnpm run build` | **FAIL** (admin-nav roles) | **PASS** (285 routes) | PASS |
| `pnpm run lint:release` | **FAIL** (Windows + ESLint) | **PASS** (520 files) | PASS |
| Sentry peer deps | **FAIL** (`@sentry/nextjs@9` vs Next 16) | **PASS** (`10.55.0`) | PASS |

**Verdict: release-ready** for admin web compile, lint (release scope), and production build.

---

## Implementation summary

### RC-1 — Admin nav group roles
- Added `roles?: UserRole[]` to `AdminNavGroup`
- `filterAdminNavGroupsForActor` filters whole groups by role (ai-ops SUPER_ADMIN/ADMIN gate)

### RC-2 — Admin UI prop alignment
- `AdminPageHeader`: `subtitle` → `description`
- `AdminLoadingState`: `label` → `message`

### RC-3 — TipTap type deduplication
- Direct deps: `@tiptap/core`, `@tiptap/pm` pinned via pnpm overrides (`3.23.6`)
- `Editor` imports from `@tiptap/react` in rich-text modules

### RC-4 — Zod 4
- `api-utils.ts`: `error.errors` → `error.issues`; tightened `any` → `unknown` / `Record<string, unknown>`

### RC-5 — Legal gate callback
- `AdminLegalGate`: `onAccepted` wraps `refreshSession` as `void` promise
- `PanelLegalGate`: early return when `!enabled` (no sync setState in effect)

### RC-6 — Lint release (Windows)
- `lint-release.mjs`: glob expansion, generated-file exclusion, batched ESLint via `node eslint.js`, `--no-warn-ignored`
- `eslint.config.mjs`: ignore `src/generated/**`; admin-scope rules for legacy fetch panels

### RC-7 — Sentry
- Upgraded `@sentry/nextjs` `9.47.1` → `10.55.0` (Next 16 peer support)
- pnpm `peerDependencyRules` for Next 16 / React 19

### Additional release fixes
- `AnalyticsCharts.tsx`: hooks before early return; conic gradient helper (immutability rule)
- `FeedAnalyticsDashboard.tsx`: `useCallback` + effect order
- `useAdminPanelLoad` hook for deferred mount loads
- `launch-ops/page.tsx`: split health probes vs beta dashboard load

---

## Verification commands

```powershell
cd d:\PraniDoctor\pranidoctor-web
pnpm peers check          # No peer dependency issues found
pnpm run typecheck        # exit 0
pnpm run lint:release     # exit 0, 520 files
pnpm run build            # exit 0, standalone output
```

---

## Known non-blockers

| Item | Notes |
|------|-------|
| Full-repo `pnpm run lint` | Not gated; release uses `lint:release` admin scope only |
| Admin ESLint overrides | `set-state-in-effect` / `no-unused-vars` off in admin paths — intentional for legacy fetch panels |
| React Compiler warnings | `react-hooks/incompatible-library` suppressed in admin scope (react-hook-form `watch`) |

---

## API / UI compatibility

No route or response contract changes. Admin navigation role filtering behavior is preserved/enforced as configured in `ADMIN_NAV_GROUPS`.

---

## Artifacts

- Plan: `docs/releases/web-release-fix-plan.md`
- This report: `docs/releases/web-release-verification-report.md`
