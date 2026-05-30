# AI Center Build Fix Report

**Date:** 2026-05-30  
**Scope:** Resolve AI Center compilation errors in `pranidoctor-web` without changing runtime behavior.

---

## Summary

The AI Center build failed because JSX badge components lived in a `.ts` hook file. TypeScript parsed `<span>` as a generic comparison operator, producing `Expected '>', got 'ident'`. A secondary type error in the permissions settings panel surfaced once the primary issue was fixed.

All three verification commands now pass:

| Command | Result |
|---------|--------|
| `pnpm typecheck` | ✅ Pass |
| `pnpm lint` | ✅ Pass (2 pre-existing warnings, unrelated) |
| `pnpm build` | ✅ Pass |

---

## Root Cause

### 1. JSX in `.ts` file (primary)

**File:** `src/components/admin/ai-ops/use-ai-admin-resource.ts`

The file mixed hook/utility logic with two React components:

- `EnabledBadge`
- `CircuitBadge`

Because the extension was `.ts`, the TypeScript compiler did not enable JSX parsing. Lines such as `<span className=...>` were interpreted as invalid generic/comparison syntax.

### 2. Incomplete capability map (cascading)

**File:** `src/components/admin/settings/PermissionsAdminPanel.tsx`

`CAPABILITY_DETAILS` was typed as `Record<ServiceInstanceAdminCapability, …>` but only listed enterprise/analytics capabilities. After AI capabilities were added to `ServiceInstanceAdminCapability` in `permissions-core.ts`, the record became incomplete and failed typecheck.

---

## Fixes Applied

### Fix 1 — Extract badge components from hook file

**Approach:** Keep the hook file as pure TypeScript (no JSX). Move UI components to a dedicated `.tsx` file.

| Action | File |
|--------|------|
| Created | `src/components/admin/ai-ops/ai-admin-badges.tsx` |
| Updated | `src/components/admin/ai-ops/use-ai-admin-resource.ts` — removed `EnabledBadge` and `CircuitBadge` |

**Import updates** (badge imports split from hook imports):

- `FailoverPanel.tsx` — `CircuitBadge`, `EnabledBadge` from `./ai-admin-badges`
- `ModelPanel.tsx` — `EnabledBadge` from `./ai-admin-badges`
- `MarketplacePanel.tsx` — `EnabledBadge` from `./ai-admin-badges`
- `RoutePanel.tsx` — `EnabledBadge` from `./ai-admin-badges`
- `ProviderPanel.tsx` — `EnabledBadge` from `./ai-admin-badges`

Hook consumers (`AiOpsOverview`, `AiLogsPanel`, `ApiKeysPanel`, `UsageAnalyticsPanel`, `HealthPanel`) required no changes; they only import from `use-ai-admin-resource`.

**Behavior:** Unchanged — same markup, class names, and props.

### Fix 2 — Complete AI capability entries

**File:** `src/components/admin/settings/PermissionsAdminPanel.tsx`

Added `CAPABILITY_DETAILS` entries for:

- `ai.view`
- `ai.manage`
- `ai.secrets.manage`
- `ai.analytics.export`

These align with labels already defined in `ADMIN_ENTERPRISE_CAPABILITIES` and nav routes under `/admin/ai-ops/*`.

**Behavior:** Unchanged for displayed rows — the panel already iterated `ADMIN_ENTERPRISE_CAPABILITIES`, which includes AI entries; the missing map keys only blocked compilation.

---

## Verification

```text
pnpm typecheck   → exit 0
pnpm lint        → exit 0 (warnings in panel-access.ts only)
pnpm build       → exit 0, 319 static pages generated
```

AI Center routes confirmed in build output, including:

- `/admin/ai-ops`
- `/admin/ai-ops/providers`
- `/admin/ai-ops/models`
- `/admin/ai-ops/routes`
- `/admin/ai-ops/api-keys`
- `/admin/ai-ops/analytics`
- `/admin/ai-ops/marketplace`
- `/admin/ai-ops/health`
- `/admin/ai-ops/failover`
- `/admin/ai-ops/logs`
- `/admin/ai-ops/settings`

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/ai-ops/ai-admin-badges.tsx` | **New** — `EnabledBadge`, `CircuitBadge` |
| `src/components/admin/ai-ops/use-ai-admin-resource.ts` | Removed JSX components |
| `src/components/admin/ai-ops/FailoverPanel.tsx` | Updated imports |
| `src/components/admin/ai-ops/ModelPanel.tsx` | Updated imports |
| `src/components/admin/ai-ops/MarketplacePanel.tsx` | Updated imports |
| `src/components/admin/ai-ops/RoutePanel.tsx` | Updated imports |
| `src/components/admin/ai-ops/ProviderPanel.tsx` | Updated imports |
| `src/components/admin/settings/PermissionsAdminPanel.tsx` | Added AI capability details |

---

## Notes

- Renaming `use-ai-admin-resource.ts` → `.tsx` was **not** chosen; separating hooks/utilities from presentational components keeps clearer module boundaries.
- No API, routing, or business logic was modified.
- Pre-existing ESLint warnings in `panel-access.ts` files were not touched (out of scope).
