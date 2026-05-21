# Admin API Failure Report

**Date:** 2026-05-22  
**Detection:** Static analysis + live requests (web `:3001`, backend `:3000`)

---

## Critical (fixed)

### F-001 — BFF proxy crashes on `Expect` header

| Field | Detail |
|-------|--------|
| **Symptom** | POST `/api/admin/auth/login` → 500; log: `expect header not supported` |
| **Root cause** | `proxy-to-backend.ts` forwarded client `Expect: 100-continue` to Node fetch upstream |
| **File** | `src/lib/proxy-to-backend.ts` |
| **Impact** | Login/API failure for PowerShell, some HTTP clients, integration tests |
| **Fix** | Strip hop-by-hop headers (`expect`, `connection`, …) before upstream fetch |
| **Status** | FIXED |

### F-002 — Admin health always 503 in dev

| Field | Detail |
|-------|--------|
| **Symptom** | GET `/api/admin/health` → `{ ok: false, code: BACKEND_UNAVAILABLE \| BACKEND_UNHEALTHY }` |
| **Root cause** | `fetchBackendHealth()` used root `/health` which returns `status: unhealthy` when S3/Redis absent |
| **File** | `src/lib/api-client.ts`, `src/app/api/admin/health/route.ts`, `health/ready/route.ts` |
| **Impact** | Monitoring alerts, readiness probe false negatives; admin UI otherwise works |
| **Fix** | Prefer `/api/admin/health` (DB probe); accept `database: up` as healthy |
| **Status** | FIXED |

### F-003 — Location import report wrong data source

| Field | Detail |
|-------|--------|
| **Symptom** | `/admin/locations` shows "—" for last import despite backend report existing |
| **Root cause** | Web read `data/location-import-report.json`; backend uses `data/locations/import-report.json` |
| **File** | `src/app/admin/(dashboard)/locations/page.tsx`, `location-import-report.server.ts` |
| **Impact** | Misleading location hub stats |
| **Fix** | RSC calls `getLocationImportReport()` → `/api/admin/locations/import-report` |
| **Status** | FIXED |

### F-004 — Missing BFF proxy for service-request timeline

| Field | Detail |
|-------|--------|
| **Symptom** | Any future UI calling timeline would 404 on web |
| **Root cause** | Backend route exists; no `src/app/api/admin/service-requests/[id]/timeline/route.ts` |
| **File** | Added proxy route |
| **Impact** | Timeline feature blocked on web |
| **Fix** | Auto-proxy route added |
| **Status** | FIXED (proxy); UI still absent — UNUSED |

---

## Non-blocking (documented, no code change per scope)

### F-101 — Stub admin modules

| Pages | `/admin/users`, `/admin/customers`, `/admin/animals`, `/admin/prescriptions` |
| **Impact** | Nav links show "module unavailable" |
| **Fix plan** | Requires new backend admin routes + UI (out of scope — no redesign) |

### F-102 — Static roles/permissions settings

| Pages | `/admin/settings/roles`, `/admin/settings/permissions` |
| **Impact** | No live RBAC API; matrix is static |
| **Fix plan** | Future admin RBAC API |

### F-103 — SMS logs placeholder

| Page | `/admin/notifications` SMS section |
| **Impact** | No API wired |
| **Fix plan** | Backend SMS log endpoint + panel fetch |

### F-104 — Doctor/technician sub-resource routes unused

| Routes | visit-fee, emergency-availability, online-consultation, village-service-areas |
| **Impact** | Fields may be PATCH-only on main profile; dedicated endpoints idle |
| **Fix plan** | Wire forms if product requires split endpoints |

### F-105 — Dashboard cold latency

| Endpoint | `/api/admin/dashboard/page-data` |
| **Symptom** | 15–20s on cold DB aggregate |
| **Impact** | Slow first paint; polling tolerates via cache |
| **Fix plan** | DB indexes / materialized stats (backend perf, not integration) |

### F-106 — Env URL mismatch

| Vars | `NEXT_PUBLIC_APP_URL` → `:3000`, web dev on `:3001`, `NEXT_PUBLIC_API_BASE_URL` → LAN IP |
| **Impact** | LAN bookmark confusion; proxy uses `BACKEND_URL` correctly |
| **Fix plan** | Align `.env` for local dev (`NEXT_PUBLIC_APP_URL=http://localhost:3001`) |

### F-107 — Response envelope not `{ success: true }`

| **Note** | User spec suggested `{ success, data, message }`; codebase standard is `{ ok, data }` |
| **Fix plan** | Changing would break all `readAdminJson` callers — **not applied** (minimal breaking changes) |

---

## Auth/session verification

| Check | Result |
|-------|--------|
| Login POST | 200 + `prani_admin_token` cookie |
| `/me` with cookie | 200 |
| `/me` without cookie | 401 → client redirect `/admin/login` |
| Panel guard on backend | 401/403 for inactive admin |
| Notifications with admin cookie | 200 (shared guard) |

---

## Error code reference (observed)

| Code | HTTP | Meaning |
|------|------|---------|
| UNAUTHORIZED | 401 | Missing/invalid session |
| FORBIDDEN | 403 | Not panel admin |
| VALIDATION_ERROR | 422 | Zod query/body fail |
| DATABASE_ERROR | 500 | Prisma failure |
| BACKEND_UNAVAILABLE | 503 | Web cannot reach backend |
| BACKEND_UNHEALTHY | 503 | Health probe fail (fixed for dev) |
