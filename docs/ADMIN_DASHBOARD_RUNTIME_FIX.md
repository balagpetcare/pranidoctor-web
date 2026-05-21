# Admin dashboard runtime fix

**Date:** 2026-05-22  
**Symptom:** `GET /admin` → 500 after successful login (`POST /api/admin/auth/login` → 200).  
**Status:** Fixed — dashboard renders; cache and auth preserved.

---

## Primary error

```
Route /admin used `headers()` inside a function cached with `unstable_cache()`
```

**Stack:** `serverInternalFetch` → `serverInternalJson` → `fetchDashboardPageDataRaw` → `dashboard-stats.ts` → `AdminDashboardPage`

Next.js forbids dynamic APIs (`headers()`, `cookies()`) inside `unstable_cache()` callbacks. The dashboard fetch ran inside cache but called `serverInternalFetch`, which always read request cookies.

---

## Secondary issue

`@/generated/prisma/client` was pulled into client bundles via:

```
AdminLayoutShell → admin-nav-permissions → permissions.ts → UserRole (value import)
admin-nav.tsx → UserRole (value import)
```

Turbopack warned about CommonJS `export *` from `src/generated/prisma/index.js` on admin layout paths.

---

## Fixes (no auth/cache redesign)

### 1. Move dynamic auth outside `unstable_cache`

**File:** `src/app/admin/(dashboard)/_lib/dashboard-stats.ts`

- Read `cookies()` in `getAdminDashboardPageData()` **before** `unstable_cache`.
- Build `DashboardRequestContext` `{ adminUserId, cookieHeader }`.
- Pass context into cached fetch; cache key remains `adminUserId` (30s revalidate unchanged).

### 2. Skip dynamic reads when auth headers supplied

**File:** `src/lib/server-internal.ts`

- If `init.headers` already includes `cookie` or `authorization`, do **not** call `headers()` / `cookies()`.
- Allows cached code paths to forward session without touching request scope.

### 3. Isolate Prisma from admin shell client bundle

| New file | Purpose |
|----------|---------|
| `src/lib/admin-auth/user-role.ts` | `USER_ROLE` constants + `UserRole` type (no Prisma) |
| `src/lib/admin-auth/permissions-core.ts` | `adminCan`, role matrix — client-safe |

- `permissions.ts` re-exports core + server-only `assertAdminCan`.
- `admin-nav.tsx`, `admin-nav-permissions.ts` import from `user-role` / `permissions-core`.
- `dashboard-types.ts` uses local string unions instead of `@/generated/prisma/client`.

---

## Preserved behavior

| Concern | Status |
|---------|--------|
| Dashboard cache (`unstable_cache`, 30s, `admin-dashboard` tag) | Unchanged |
| Auth (middleware JWT + `/me` guard) | Unchanged |
| SSR (`AdminDashboardPage` server component) | Unchanged |
| Observability (proxy logs, correlation headers) | Unchanged |
| Performance (per-user cache key, backend page-data API) | Unchanged |

---

## Validation

| Step | Command / action | Expected |
|------|------------------|----------|
| Login | `POST /api/admin/auth/login` | 200 + `prani_admin_token` cookie |
| Open `/admin` | Browser or curl with cookie | 200 (not 500, not login redirect) |
| Refresh | Repeat `GET /admin` | 200; cache hit after first load |
| Logout | `POST /api/admin/auth/logout` | Cookie cleared; `/admin` → login |
| Build | `npm run build` | Success |

**Note:** Use `curl.exe` (not PowerShell `curl`) for API tests — `Invoke-WebRequest` sends `Expect: 100-continue`, which breaks the backend proxy.

---

## Files changed

- `src/app/admin/(dashboard)/_lib/dashboard-stats.ts`
- `src/lib/server-internal.ts`
- `src/lib/admin/dashboard/dashboard-types.ts`
- `src/lib/admin-auth/user-role.ts` *(new)*
- `src/lib/admin-auth/permissions-core.ts` *(new)*
- `src/lib/admin-auth/permissions.ts`
- `src/components/admin-ui/admin-nav.tsx`
- `src/components/admin-ui/admin-nav-permissions.ts`
- Admin auth type/import updates (`types.ts`, `panel-classify.ts`, `guards.tsx`, `AdminAuthProvider.tsx`, `dashboard-guard.ts`)
- Test updates (`admin-nav-permissions.test.ts`, `panel-classify.test.ts`)

---

## Related docs

- `docs/ADMIN_LOGIN_DEBUG.md` — login cookie / JWT secret alignment
- `docs/ADMIN_AUTH_COMPLETE.md` — full admin auth architecture
