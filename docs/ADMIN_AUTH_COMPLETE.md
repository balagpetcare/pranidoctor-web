# Admin Authentication — Complete

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` admin panel (`/admin/*`, `/enterprise/*`)  
**Backend:** Existing Express routes only — no new admin auth endpoints

---

## Summary

Admin authentication is implemented end-to-end using the existing backend contract:

| # | Feature | Status | Mechanism |
|---|---------|--------|-----------|
| 1 | Login | ✅ | `POST /api/admin/auth/login` + httpOnly cookie |
| 2 | Refresh Token | ✅ | Session refresh via `GET /api/admin/auth/me` (`touchJwtSession`) |
| 3 | Logout | ✅ | `POST /api/admin/auth/logout` + cookie clear |
| 4 | Session Restore | ✅ | `AdminAuthProvider` calls `/me` on shell mount |
| 5 | Route Guard | ✅ | Edge middleware + server `ensureAdminDashboardAccess` |
| 6 | Permission Guard | ✅ | `adminCan()` + `AdminPermissionGuard` + `ensureAdminCapability` |
| 7 | Role Guard | ✅ | `hasRole()` + `AdminRoleGuard` + `ensureAdminRole` |
| 8 | Idle Timeout | ✅ | Client idle detector → logout → `?reason=idle` |
| 9 | Remember Login | ✅ | localStorage identifier + 7-day httpOnly session cookie |
| 10 | Profile Sync | ✅ | Context + profile menu re-fetch via `/me` |

**Note on refresh:** Admin panel does **not** use mobile-style refresh tokens (`pd_rt_*`). The backend exposes session extension through **`GET /api/admin/auth/me`**, which validates the actor and calls `touchJwtSession` when a panel session id (`sid`) is present in the JWT.

---

## Backend API (unchanged)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/auth/login` | POST | Authenticate; set `prani_admin_token` cookie (7 days) |
| `/api/admin/auth/logout` | POST | Revoke panel session; clear cookie |
| `/api/admin/auth/me` | GET | Resolve actor; touch session; return profile |

### Login body (`loginBodySchema`)

```json
{ "email"?: string, "identifier"?: string, "password": string }
```

### Me response

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "displayName": "...",
      "role": "ADMIN" | "SUPER_ADMIN"
    }
  }
}
```

### Permissions (service instances only)

| Capability | SUPER_ADMIN | ADMIN |
|------------|:-----------:|:-----:|
| `serviceInstance.view` | ✅ | ✅ |
| `serviceInstance.review` | ✅ | ✅ |
| `serviceInstance.publish` | ✅ | ❌ |

All other admin routes require active panel admin (`admin.panel`).

---

## Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Login page (/admin/login)                                   │
│   AdminLoginForm → POST /api/admin/auth/login               │
│   Remember identifier → localStorage (optional)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ Set-Cookie: prani_admin_token
┌─────────────────────────────────────────────────────────────┐
│ Edge middleware (/admin/*, /enterprise/*)                   │
│   verifyAdminToken (JWT, fast gate)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Server layout guard                                         │
│   ensureAdminDashboardAccess → GET /api/admin/auth/me       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ AdminLayoutShell + AdminAuthProvider                        │
│   • Session restore (/me on mount)                          │
│   • Periodic refresh (every 5 min)                          │
│   • Idle timeout (30 min default)                           │
│   • Profile sync + permission helpers                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Map

### Core modules (`src/lib/admin-auth/`)

| File | Responsibility |
|------|----------------|
| `auth-api.ts` | `adminLoginRequest`, `adminLogoutRequest`, `adminMeRequest`, `adminRefreshSessionRequest` |
| `AdminAuthProvider.tsx` | React context: login, logout, refresh, sync, `can`, `hasRole` |
| `guards.tsx` | Client `AdminPermissionGuard`, `AdminRoleGuard` |
| `dashboard-guard.ts` | Server `ensureAdminDashboardAccess`, `getAdminDashboardActor`, `ensureAdminRole`, `ensureAdminCapability` |
| `remember-login.ts` | Remember-me identifier in `localStorage` |
| `use-idle-timeout.ts` | Activity-based idle detection |
| `session-config.ts` | `ADMIN_IDLE_TIMEOUT_MS`, `ADMIN_SESSION_REFRESH_INTERVAL_MS` |
| `login-messages.ts` | Bilingual login / redirect messages |
| `permissions.ts` | `adminCan`, `assertAdminCan` (capability matrix) |
| `jwt.ts` | Edge JWT verify (includes optional `sid`) |
| `constants.ts` | `ADMIN_SESSION_COOKIE`, `ADMIN_SESSION_MAX_AGE` |

### UI integration

| Component | Change |
|-----------|--------|
| `AdminLoginForm` | Remember-me checkbox; idle/expired notices; `credentials: same-origin` |
| `AdminLayoutShell` | Wraps `AdminAuthProvider`; centralized logout |
| `AdminProfileMenu` | Uses `useAdminAuth()`; syncs profile on open |
| `ServiceInstancesReviewConsole` | Uses `can("serviceInstance.publish")` from context |
| `middleware.ts` | Guards `/enterprise/*` with same admin JWT |

---

## Feature Details

### 1. Login

- Form: `/admin/login`
- API: `POST /api/admin/auth/login`
- On success: full navigation to safe `?next=` path (default `/admin`)
- Errors mapped via `login-messages.ts` (EN + BN)

### 2. Refresh Token (session refresh)

- **No separate refresh endpoint** for admin (by design on backend)
- `AdminAuthProvider` polls `GET /api/admin/auth/me` every **5 minutes** (configurable)
- Backend `handleAdminMe` calls `touchJwtSession(session)` to keep panel session alive in DB
- JWT cookie TTL remains **7 days** (`ADMIN_SESSION_MAX_AGE`)

Configure interval:

```env
NEXT_PUBLIC_ADMIN_SESSION_REFRESH_MS=300000
```

### 3. Logout

- `logout("manual" | "idle" | "expired")` in context
- Calls `POST /api/admin/auth/logout` (backend revokes panel session when `sid` present)
- Redirects to `/admin/login` with optional `?reason=`

### 4. Session Restore

On dashboard shell mount:

1. `AdminAuthProvider` sets `status: loading`
2. Calls `GET /api/admin/auth/me`
3. On success → `authenticated` + `user`
4. On failure → `unauthenticated` (API calls still redirect via `readAdminJson`)

Server-side restore for RSC:

- `getAdminDashboardActor()` → `/me` via `serverInternalJson`

### 5. Route Guard

**Layer 1 — Edge (`src/middleware.ts`)**

- Matcher: `/admin/*`, `/enterprise/*`, `/doctor/*`
- Validates JWT in `prani_admin_token`
- Redirects unauthenticated users to `/admin/login?next=...`

**Layer 2 — Server layout**

- `ensureAdminDashboardAccess()` in admin + enterprise dashboard layouts
- Validates actor via backend `/me` (catches revoked roles)

**Layer 3 — Client API**

- `readAdminJson` redirects on HTTP 401

### 6. Permission Guard

**Client:**

```tsx
import { AdminPermissionGuard } from "@/lib/admin-auth/guards";
import { useAdminAuth } from "@/lib/admin-auth/AdminAuthProvider";

const { can } = useAdminAuth();
if (can("serviceInstance.publish")) { /* ... */ }

<AdminPermissionGuard capability="serviceInstance.review">
  <ReviewActions />
</AdminPermissionGuard>
```

**Server (RSC / pages):**

```ts
import { ensureAdminCapability } from "@/lib/admin-auth/dashboard-guard";

await ensureAdminCapability("serviceInstance.publish");
```

### 7. Role Guard

**Client:**

```tsx
import { AdminRoleGuard } from "@/lib/admin-auth/guards";

<AdminRoleGuard roles="SUPER_ADMIN">
  <SuperAdminTools />
</AdminRoleGuard>
```

**Server:**

```ts
import { ensureAdminRole } from "@/lib/admin-auth/dashboard-guard";

await ensureAdminRole("SUPER_ADMIN", "ADMIN");
```

### 8. Idle Timeout

- Default: **30 minutes** without mouse/keyboard/scroll/touch activity
- On idle: `logout("idle")` → `/admin/login?reason=idle`
- Login form shows bilingual notice

Configure:

```env
NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT_MS=1800000
```

### 9. Remember Login

- Checkbox on login form
- When checked: saves **identifier only** (email/phone) to `localStorage` key `prani_admin_remember_identifier`
- **Never** stores password or tokens client-side
- Session persistence: backend httpOnly cookie (7 days)
- Unchecking clears saved identifier on next successful login

### 10. Profile Sync

- `AdminAuthProvider.user` is source of truth after restore
- `syncProfile()` / `refreshSession()` re-fetches `/me`
- `AdminProfileMenu` calls `syncProfile()` when opened
- Displays `displayName`, `email`, `role`

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ADMIN_JWT_SECRET` | — | Must match backend; signs/verifies admin JWT |
| `NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT_MS` | `1800000` | Idle sign-out (ms) |
| `NEXT_PUBLIC_ADMIN_SESSION_REFRESH_MS` | `300000` | `/me` poll interval (ms) |

Cookie name is hardcoded: `prani_admin_token` (`ADMIN_SESSION_COOKIE`).

---

## Testing

| Test | Path |
|------|------|
| Remember identifier storage | `src/lib/admin-auth/remember-login.test.ts` |
| Panel auth classify | `src/lib/admin-auth/panel-classify.test.ts` |
| Safe next path | `src/lib/admin-auth/safe-next-path.test.ts` |

Manual checklist:

1. Login with valid admin → lands on dashboard
2. Refresh page → still authenticated (session restore)
3. Wait for `/me` poll → no logout (session touch)
4. Idle past timeout → redirect with `?reason=idle`
5. Logout → cookie cleared; `/admin` redirects to login
6. Enterprise route without cookie → redirect to login
7. SUPER_ADMIN sees publish controls; ADMIN does not

---

## Known Limitations (backend contract)

1. **No OAuth-style refresh token** for admin — session refresh is `/me` only
2. **Remember me** does not extend cookie beyond 7 days (no backend `rememberMe` flag)
3. **SUPPORT** role exists in permission registry but cannot log into admin panel today
4. **`SESSION_COOKIE_NAME` env** is documented but not wired (cookie name is hardcoded)
5. JWT rotation on refresh is **not** performed — cookie issued at login remains until expiry or logout

These are backend constraints; frontend implements the fullest auth UX possible without new API routes.

---

## Related Docs

- [ADMIN_WEB_AUDIT.md](./ADMIN_WEB_AUDIT.md)
- [ADMIN_API_MAPPING.md](./ADMIN_API_MAPPING.md)
- [ADMIN_CREDENTIAL_SETUP.md](./ADMIN_CREDENTIAL_SETUP.md)
- [ADMIN_AUTH_PLAN.md](./ADMIN_AUTH_PLAN.md)

---

*Admin authentication complete — existing backend APIs only.*
