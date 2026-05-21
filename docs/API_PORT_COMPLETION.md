# API Port Completion (Phase 2)

**Date:** 2026-05-21

## Architecture

```
Browser / Mobile
    → Next.js (pranidoctor-web)
        → src/app/api/**/route.ts  (proxy only)
        → OR RSC serverInternalFetch / api-client
    → Express (pranidoctor-backend:3000)
        → /api/*  compat-web router (legacy Next route handlers)
        → /api/*  modular routers (auth, notifications, …)
    → PostgreSQL (Prisma on backend only)
```

## Backend deliverables

| Path | Purpose |
|------|---------|
| `src/modules/compat-web/next-adapter.ts` | Express ↔ Web `Request`/`Response` |
| `src/modules/compat-web/route-registry.ts` | Lazy-load legacy `route.ts` per path |
| `src/modules/compat-web/compat-web.routes.ts` | Router factory |
| `src/server.ts` | Mount `app.use('/api', compatRouter)` |
| `src/legacy/web/routes/**` | Original web API handlers (unchanged contracts) |
| `src/legacy/web/lib/**` | Services, guards, mappers |
| `src/legacy/web/routes/admin/dashboard/page-data/route.ts` | Admin dashboard aggregates |

## Dependencies added on backend

- `next` → `file:./shims/next-compat` (headers + NextResponse shim)
- `date-fns`, `server-only`

## Build

```bash
cd pranidoctor-backend
npm run build   # uses tsconfig.build.json (excludes src/legacy from tsc emit)
```

Runtime uses `tsx` + dynamic import of legacy `.ts` routes (no full legacy typecheck in CI build yet).

## Web contract preservation

- Response helpers: `jsonOk` / `jsonError` in `src/legacy/web/lib/api-response.ts` (uses `Response.json`, not `next/server`)
- Proxy preserves status, headers, and body verbatim

## Scripts

| Script | Repo |
|--------|------|
| `scripts/proxy-all-api-routes.mjs` | web — rewrite API routes to proxy |
| `scripts/archive-prisma-libs.mjs` | web — move prisma libs to archive |
| `scripts/fix-archived-type-shims.mjs` | web — type-only stubs for UI |
