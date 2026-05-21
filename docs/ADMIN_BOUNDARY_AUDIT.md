# Admin Boundary Audit

**Project:** Prani Doctor Web (`pranidoctor-web`)  
**Date:** 2026-05-22  
**Scope:** Server ↔ client architecture boundaries for admin panel runtime

---

## Executive summary

| Area | Before | After |
|------|--------|-------|
| Prisma in client bundles | `@/generated/prisma/browser` re-exported full Node client (`index.js`) | Browser shim targets `index-browser.js`; UI uses local domain contracts |
| `node:fs` in shared modules | `location-master-admin-client.ts` mixed fetch + filesystem | Filesystem isolated to `location-import-report.server.ts` with `server-only` |
| CommonJS boundary warnings | `export * from "./index.js"` pulled CJS Prisma runtime into Turbopack client graph | Client UI no longer imports generated Prisma; shim fixed for any legacy path |
| Middleware deprecation | `src/middleware.ts` + `middleware()` export | `src/proxy.ts` + `proxy()` export (Next.js 16) |
| Error boundary logging | Double log per error (`clientLog` + `captureClientException`) | Single structured log via `captureClientException` with explicit `event` |

**Verdict:** Boundary violations remediated. Production build passes.

---

## A. Server ↔ Client boundary

### Findings

1. **No direct `"use client"` → `server-only` imports** were found in active `src/`.
2. **13+ client-boundary files** imported `@/generated/prisma/browser` for enum values only.
3. **`location-master-admin-client.ts`** imported `node:fs` / `node:path` without a boundary guard despite being consumed from admin server pages only.

### Fixes applied

| Change | Files |
|--------|-------|
| Local enum contracts (mirrors Prisma, no generated imports) | `src/lib/domain/service-request-constants.ts`, `payment-constants.ts`, `area-type-constants.ts`, `semen-template-media-constants.ts` |
| Replace Prisma browser imports in UI | Admin service-requests, billing, areas, reports, doctor case panels, semen media upload, admin area types |
| Split filesystem helper | `src/lib/locations/location-import-report.server.ts` (`import "server-only"`) |
| Server pages use `USER_ROLE` not Prisma | `audit/page.tsx`, `dev-tools/otp-logs/page.tsx` |

### Pattern to follow

Existing conventions preserved:

- `src/lib/admin-auth/user-role.ts` — role strings
- `src/components/admin/ai-technicians/ai-technician-status-constants.ts` — AI technician status
- `src/lib/service-instances/service-instance-public.types.ts` — public DTOs

New domain modules follow the same `CONST + type` pattern.

---

## B. Prisma isolation

### Root cause

`scripts/copy-prisma-client-from-backend.mjs` wrote `browser.ts` as:

```ts
export * from "./index.js";  // full Node Prisma client — WRONG
```

This caused Turbopack to trace `src/generated/prisma/*` into client component browser bundles, producing:

- `Cannot find module node:fs`
- `Unsupported external type Url`
- CommonJS `export *` warnings

### Fix

```ts
export * from "./index-browser.js";
export type * from "./index-browser.js";
```

### Client import inventory (remediated)

All active `@/generated/prisma/browser` imports in `src/` (excluding generated tree) were removed from UI/shared client modules.

Server-only Prisma usage in `src/lib/**/schemas.ts` and API route handlers remains acceptable and unchanged.

---

## C. Runtime isolation

| Module | Runtime API | Boundary |
|--------|-------------|----------|
| `location-import-report.server.ts` | `node:fs`, `node:path`, `process.cwd()` | Server-only |
| `location-master-admin-client.ts` | `fetch` via `serverInternalJson` | Server-safe (no Node APIs) |
| Generated Prisma | Node query engine | Never imported from client UI after this audit |

---

## D. Next.js compatibility

| Item | Action |
|------|--------|
| Middleware → Proxy | Renamed `src/middleware.ts` → `src/proxy.ts`, export `proxy()` |
| Turbopack | `npm run build` succeeds on Next.js 16.2.6 (Turbopack) |
| SSR | Preserved — no `"use client"` added to server pages |
| Auth | Preserved — proxy matcher and JWT cookie logic unchanged |
| Caching | Preserved — dashboard client cache untouched |

Build output confirms: `ƒ Proxy (Middleware)`.

---

## E. Error handling

### Before

Each admin/enterprise error handler logged twice:

1. `clientLog.error(...)` with route/boundary-specific event
2. `captureClientException(...)` which also called `clientLog.error`

In production (`isClientErrorTrackingEnabled()` true), this doubled log volume during outages.

### After

- `captureClientException` accepts optional `event` and `message` in context
- Always emits **one** structured log
- Boundary handlers pass explicit events: `admin.error_boundary`, `admin.route_error`, `enterprise.route_error`
- Fallback UI unchanged (`AdminErrorState`)

### Additional dashboard fix

`use-admin-dashboard-realtime.ts` coerces `generatedAt` from SSR JSON strings to `Date` before `toISOString()` — prevents client render crash on `/admin` refresh.

---

## Validation matrix

| Check | Result |
|-------|--------|
| `npm run build` | Pass (158 routes, TypeScript clean) |
| `npm run dev` | Running; `/admin` returns 200 via `proxy.ts` |
| Prisma in client grep (`@/generated/prisma/browser` in `src/`) | Zero matches (UI) |
| `node:fs` in non-server-only client paths | Zero |
| Proxy migration | `src/proxy.ts` active |

Manual checks recommended in browser: login → `/admin` → dashboard refresh → logout.

---

## Residual / out of scope

- **Server lib schemas** (~35 files) import `@/generated/prisma/client` without `import "server-only"`. Not currently leaked; add guards incrementally if desired.
- **CommonJS Turbopack warning** for `index-browser.js` only appears if code imports `@/generated/prisma/browser`. Active UI no longer does.
- **`archive/web-deprecated/`** — frozen legacy Prisma usage, excluded from active bundle paths.

---

## Files changed (summary)

- `scripts/copy-prisma-client-from-backend.mjs`
- `src/generated/prisma/browser.ts`
- `src/lib/domain/*-constants.ts` (4 new)
- 15+ UI/lib/type files (Prisma → domain constants)
- `src/lib/locations/location-import-report.server.ts` (new)
- `src/lib/locations/location-master-admin-client.ts`
- `src/proxy.ts` (new, replaces `middleware.ts`)
- `src/lib/monitoring/error-tracking-client.ts`
- `src/lib/monitoring/error-tracking-types.ts`
- `src/components/admin-ui/AdminErrorBoundary.tsx`
- `src/app/admin/error.tsx`, `src/app/enterprise/error.tsx`
- `src/lib/admin/dashboard/use-admin-dashboard-realtime.ts`
