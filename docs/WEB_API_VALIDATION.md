# Web API Validation (Phase 5)

**Date:** 2026-05-21

## Build matrix

| Target | Command | Result |
|--------|---------|--------|
| Web | `npm run build` | **PASS** |
| Backend | `npm run build` | **PASS** (`tsconfig.build.json`, legacy excluded from emit) |
| Backend dev | `npm run dev` | Starts; compat router registers **1032** method bindings (172 route files × 6 verbs) |

## Runtime checklist

1. Backend: `npm run dev` → log lines `Compat web API routes registered` + `Server started`
2. Smoke: `GET http://localhost:3000/api/ping` → `{ "ok": true, "scope": "compat-web" }`
3. Smoke: `GET http://localhost:3000/api/mobile/health` → `{ ok: true, data: { scope: "mobile", database: "up" } }` (shape per `jsonOk`)
4. Web: `npm run dev` → open `/admin` (dashboard loads via backend page-data)
5. Web proxy: `curl http://localhost:3000/api/admin/auth/me` with admin cookie → same JSON as backend direct

> If `/api/*` returns `ROUTE_NOT_FOUND` while `/health` works, restart the backend process (tsx watch) so `app.use('/api', compatRouter)` and route path prefix fixes are loaded.

## Validation metrics (requested)

```
WEB_API_READY=YES
PRISMA_DEPENDENCY_COUNT=0
MODULES_REMAINING=0
DELETE_READY=YES
```

### Definitions

| Metric | Meaning | Value |
|--------|---------|-------|
| `WEB_API_READY` | Web has no runtime DB; API/RSC use backend | **YES** |
| `PRISMA_DEPENDENCY_COUNT` | `import … from '@/lib/prisma'` in `src/` | **0** |
| `MODULES_REMAINING` | Prisma service modules still executing on web | **0** (45 archived + stubs) |
| `DELETE_READY` | Archive complete; safe to remove archived tree after soak | **YES** |

### Notes

- **Enum-only** `@/generated/prisma/client` imports remain (types/constants) — not counted as DB dependencies.
- Backend legacy lib typecheck is deferred (`npm run typecheck:legacy` for full audit).
- Align `DATABASE_URL` on backend with working Postgres user (health may show `28P01` until credentials match).

## No schema / migration changes

This migration performed **no** Prisma schema edits and **no** migrate commands on web.
