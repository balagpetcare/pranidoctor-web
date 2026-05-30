# Web Release Fix Plan — pranidoctor-web

**Date:** 2026-05-30  
**Status:** COMPLETE  
**Goal:** Green typecheck, lint (release scope), and production build.

## Baseline audit

| Gate | Baseline | Final |
|------|----------|-------|
| `pnpm run typecheck` | **FAIL** (~35 errors) | **PASS** |
| `pnpm run build` | **FAIL** | **PASS** |
| `pnpm run lint:release` | **FAIL** | **PASS** |
| Sentry peers | **FAIL** | **PASS** |

## Root-cause categories (all addressed)

### RC-1 — Admin nav group role typing (P0) ✅
### RC-2 — Admin UI prop drift (P0) ✅
### RC-3 — TipTap duplicate `@tiptap/core` (P0) ✅
### RC-4 — Zod 4 API change (P0) ✅
### RC-5 — Legal gate callback typing (P1) ✅
### RC-6 — Lint release script on Windows (P0) ✅
### RC-7 — Sentry peer alignment (P1) ✅

## Fix order (executed)

1. ✅ Document plan
2. ✅ admin-nav roles + filter
3. ✅ Admin UI prop renames
4. ✅ TipTap dedupe + imports
5. ✅ Zod + legal gate fixes
6. ✅ lint-release Windows glob + batch ESLint
7. ✅ Sentry `@sentry/nextjs@10.x`
8. ✅ Analytics / feed dashboard ESLint errors
9. ✅ Verify typecheck / lint:release / build
10. ✅ Verification report

## Verification criteria

- [x] `pnpm run typecheck` succeeds
- [x] `pnpm run lint:release` succeeds
- [x] `pnpm run build` succeeds
- [x] `pnpm peers check` clean
- [x] Verification report under `docs/releases/`
