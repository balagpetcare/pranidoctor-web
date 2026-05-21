# API Reference

**Canonical API:** `pranidoctor-backend`  
**Interactive docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)  
**OpenAPI JSON:** [http://localhost:3000/api/docs/openapi.json](http://localhost:3000/api/docs/openapi.json)

## Quick start

```bash
cd pranidoctor-backend
npm install
npm run openapi:generate   # writes openapi.json
npm run dev                # http://localhost:3000
```

Open Swagger UI at **`/api/docs`**.

## Architecture

```
/health, /health/*          → Native health router (root mount)
/api/docs                   → Swagger UI + openapi.json
/api/ping                   → Compat smoke test
/api/*                      → Legacy web handlers (172 route files)
/api/{module}/*             → Express modules (auth, users, …)
```

## Response conventions

**Legacy (majority):**

```json
{ "ok": true, "data": { } }
{ "ok": false, "error": { "code": "UNAUTHORIZED", "message": "..." } }
```

**Unknown route:**

```json
{ "success": false, "error": { "code": "ROUTE_NOT_FOUND", "message": "..." } }
```

## Domain index (compat legacy)

| Prefix | Description |
|--------|-------------|
| `/api/admin/*` | Admin panel APIs |
| `/api/doctor/*` | Doctor panel APIs |
| `/api/technician/*` | AI technician panel |
| `/api/mobile/*` | Mobile app APIs |
| `/api/notifications/*` | Cross-panel notifications |
| `/api/locations/*` | Location master (public) |

Full path list: see `openapi.json` (generated from filesystem).

## Express modules (foundation)

| Mount | Module |
|-------|--------|
| `/api/auth` | Authentication |
| `/api/users` | Users |
| `/api/doctors` | Doctors |
| `/api/leads` | Leads |
| `/api/animals` | Animals |
| `/api/clinics` | Clinics |
| `/api/notifications` | Notifications service |
| `/api/ai` | AI |
| `/api/media` | Media / storage |

Sub-routes are defined in each module’s `*.routes.ts` — extend OpenAPI manually when promoting a module to primary API.

## Web consumer

Set in `pranidoctor-web/.env`:

```env
BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

All `src/app/api/**` routes proxy to the same path on backend unless listed as local health exceptions.

## Regenerating spec

```bash
npm run openapi:generate
```

Outputs:

- `pranidoctor-backend/openapi.json`
- `pranidoctor-backend/docs/openapi.json`
- `pranidoctor-web/docs/openapi.json` (when sibling repo present)
