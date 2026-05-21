# API Contract Freeze

**Date:** 2026-05-21  
**Status:** FROZEN — backend-first, no contract changes without version bump

## Response envelope (legacy + compat)

All legacy web handlers use `src/legacy/web/lib/api-response.ts`:

| Shape | HTTP | Body |
|-------|------|------|
| Success | 2xx | `{ "ok": true, "data": T }` |
| Error | 4xx/5xx | `{ "ok": false, "error": { "code", "message", "details?" } }` |

Foundation Express modules may also return `{ "success": false, "error": { "code", "message", "requestId" } }` for unknown routes — web proxy passes through unchanged.

## Web → backend transport

| Layer | File | Target |
|-------|------|--------|
| App Router API | `src/lib/proxy-to-backend.ts` | `BACKEND_URL` + same path/query/body |
| RSC / server | `src/lib/server-internal.ts` | Same + forwards cookies / Authorization |
| Client | `src/lib/api-client.ts` | `NEXT_PUBLIC_API_URL` (default `http://localhost:3000/api`) |

**Frozen env keys:** `BACKEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_BASE_URL`

## Route inventory

| Surface | Count | Owner |
|---------|-------|-------|
| Legacy compat routes | **172** | `pranidoctor-backend/src/legacy/web/routes/**` |
| Express modules | **9** | `/api/{auth,users,doctors,leads,animals,clinics,notifications,ai,media}` |
| Web proxy routes | **167** + health exceptions | `pranidoctor-web/src/app/api/**` |

Web does **not** duplicate business logic; proxies preserve method, headers, and body.

## Auth contract (frozen)

| Actor | Web session | Backend route | Token / cookie |
|-------|-------------|---------------|----------------|
| Admin | `getAdminSession()` + cookie | `GET /api/admin/auth/me` | Admin JWT cookie |
| Doctor | `getDoctorSession()` | `GET /api/doctor/auth/me` | Doctor JWT cookie |
| Technician | `getTechnicianSession()` | `GET /api/technician/auth/me` | Technician JWT cookie |
| Mobile customer | Bearer JWT | `GET /api/mobile/me` | `Authorization: Bearer` |
| Notifications | Multi | `GET /api/notifications` | Bearer or panel cookies |

Panel `resolve*PanelActor` on web calls backend `/api/*/auth/me` — **no Prisma on web**.

Login routes (frozen paths):

- `POST /api/admin/auth/login`
- `POST /api/doctor/auth/login`
- `POST /api/technician/auth/login`
- `POST /api/mobile/auth/login`, `register`, OTP flows

## DTO compatibility

| Concern | Rule |
|---------|------|
| Prisma enums | Imported from `@/generated/prisma/client` on web (types only) |
| Service DTOs | Archived under `archive/web-deprecated/`; UI uses `import type` or loose API shapes |
| Dashboard | `GET /api/admin/dashboard/page-data` → `{ stats, recentRequests, unreadNotifications }` |
| Locations admin | `GET /api/admin/locations/stats`, `missing-coords`, `pending-verification` |
| Semen template | `GET /api/admin/semen-service-templates/:id` → `{ template }` |

## Breaking-change policy

1. Additive fields in `data` objects — allowed  
2. New routes on backend first; web proxy auto-includes path if under `src/app/api`  
3. Removing/renaming fields, codes, or routes — requires `API_VERSION` bump and changelog  
4. No Prisma or migrations from web repo  

## Verification

- `PRISMA_DEPENDENCY_COUNT=0` on web  
- `WEB_API_READY=YES`  
- OpenAPI spec: `pranidoctor-backend/openapi.json` (172 legacy paths + health + modules)
