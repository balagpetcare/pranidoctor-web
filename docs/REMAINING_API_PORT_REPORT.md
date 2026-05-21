# Remaining API Port Report (Phase 1)

**Date:** 2026-05-21  
**Web:** `pranidoctor-web`  
**Backend:** `pranidoctor-backend`

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Files importing `@/lib/prisma` | ~59 | **0** |
| `src/app/api/**/route.ts` with inline DB logic | ~171 | **167 proxies** (+3 health kept local, +1 new dashboard proxy) |
| Prisma schema owner on web | removed (prior phase) | unchanged |
| Canonical API runtime | web | **backend** (`compat-web` + legacy handlers) |

## Phase 1 scan results

### Eliminated on web

- All `@/lib/prisma` imports under `src/` (replaced with proxy client, archived services, or backend fetch helpers).
- Direct Prisma usage in App Router API handlers (replaced by `proxyRouteToBackend`).

### Intentionally retained on web (non-DB)

| Area | Reason |
|------|--------|
| `@/generated/prisma/client` | Enums/types only for UI and Zod schemas |
| `src/lib/prisma.ts` | Throws at runtime — guard stub |
| `src/lib/api-client.ts`, `server-internal.ts`, `proxy-to-backend.ts` | API consumer transport |
| Health routes (`/api/health`, panel health) | Local diagnostics / unchanged contracts |

### RSC pages that previously called Prisma services

| Page / module | Replacement |
|---------------|-------------|
| `admin/(dashboard)/page.tsx` | `getAdminDashboardPageData` → `GET /api/admin/dashboard/page-data` |
| `admin/.../locations/*` | `location-master-admin-client.ts` → admin location APIs |
| `admin/.../semen-service-templates/[id]` | `adminGetSemenTemplate` → `GET /api/admin/semen-service-templates/:id` |
| `admin-auth` / `doctor-auth` / `technician-auth` `panel-access.ts` | `serverInternalJson` → `*/auth/me` |

### Archived (45 modules)

Full implementations copied to `archive/web-deprecated/src/lib/**` (not deleted).  
`src/lib/**` stubs export types only; runtime logic runs on backend.

## Backend surface (Phase 2)

- **Compat module:** `pranidoctor-backend/src/modules/compat-web/`
- **Legacy routes:** `src/legacy/web/routes/**` (172 `route.ts` files)
- **Legacy lib:** `src/legacy/web/lib/**` (Prisma + business rules)
- **New route:** `admin/dashboard/page-data` (dashboard aggregates)
- **Shims:** `shims/next-compat` (`next/headers`, `next/server`), `src/compat/next-headers.ts` (cookie ALS)

## Follow-up (runtime)

1. Restart backend after pulling: `cd pranidoctor-backend && npm run dev`
2. Confirm `Compat web API mounted` in logs and `GET /api/ping` returns `{ ok: true, scope: "compat-web" }`
3. Set web `.env`: `BACKEND_URL=http://localhost:3000`, `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
