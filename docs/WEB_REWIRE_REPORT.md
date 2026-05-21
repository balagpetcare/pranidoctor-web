# Web Rewire Report (Phase 3)

**Date:** 2026-05-21

## Transport layer

| File | Role |
|------|------|
| `src/lib/proxy-to-backend.ts` | App Router `route.ts` → backend (method, query, body, cookies) |
| `src/lib/server-internal.ts` | RSC / server-only → backend with session cookies |
| `src/lib/api-client.ts` | Client/browser → backend (existing) |

## API routes

- **167** handlers rewritten to one-liner proxies (`proxy-all-api-routes.mjs`).
- **Skipped (local):** `api/health`, `api/mobile/health`, `api/admin/health`.
- **Added:** `api/admin/dashboard/page-data/route.ts` (proxy for new backend route).

Example:

```typescript
import { proxyRouteToBackend } from "@/lib/proxy-to-backend";

export const GET = (request: Request) => proxyRouteToBackend(request);
```

## Server libs rewired (no Prisma)

| Module | Backend endpoint |
|--------|------------------|
| `admin-auth/panel-access.ts` | `GET /api/admin/auth/me` |
| `doctor-auth/panel-access.ts` | `GET /api/doctor/auth/me` |
| `technician-auth/panel-access.ts` | `GET /api/technician/auth/me` |
| `admin/(dashboard)/_lib/dashboard-stats.ts` | `GET /api/admin/dashboard/page-data` |
| `locations/location-master-admin-client.ts` | `GET /api/admin/locations/*` |
| `admin-semen/templates-service.ts` | `GET /api/admin/semen-service-templates/:id` |

## Environment

```env
BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Build status

`npm run build` — **PASS** (Next.js 16.2.6)
