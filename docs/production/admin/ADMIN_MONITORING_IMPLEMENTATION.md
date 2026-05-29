# Admin Monitoring — Implementation

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Scope:** `pranidoctor-web` admin panel structured event tracking  
**Plan reference:** [admin-monitoring-plan.md](./admin-monitoring-plan.md)

---

## Summary

Structured admin monitoring is implemented as a **thin instrumentation layer** on top of existing logging, error tracking, and proxy infrastructure. No admin UI behavior changes — only observability hooks.

| Category | Event prefix | Where emitted |
|----------|--------------|---------------|
| Page failures | `admin.page.*` | Error boundary, route errors, window errors |
| Page views / slow nav | `admin.page.view`, `admin.navigation.slow` | `AdminMonitoringProvider` |
| API failures / slow calls | `admin.api.*` | `adminFetch` (client) |
| Proxy failures / slow upstream | `admin.proxy.*` | `proxy-to-backend.ts` (server) |
| Admin actions | `admin.action.*` | Auth provider, optional `AdminActionButton` |
| Authentication | `admin.auth.*` | Login form, auth API, api-guard, server login logs |
| Performance | `admin.api.slow`, `admin.proxy.slow`, `admin.navigation.slow` | Threshold-based |

---

## Architecture

```
Browser (admin / enterprise)
  ├─ AdminMonitoringProvider     → page.view, navigation.slow
  ├─ adminFetch                  → api.request | api.failure | api.slow
  ├─ AdminAuthProvider           → auth.login | logout | session_refresh_failed
  ├─ AdminLoginForm              → auth.login_success | auth.login_failure
  ├─ Error boundary / error.tsx  → page.failure
  └─ instrumentation-client.ts   → page.failure (unhandled)

  warn/error client events ──POST──► /api/admin/monitoring/events (optional ingest)
                                           └─ serverLog (stdout JSON)

Next.js BFF
  ├─ proxy-to-backend.ts         → admin.proxy | admin.proxy.error | admin.proxy.slow
  └─ api-guard.ts                → admin.auth.unauthorized | admin.auth.forbidden
```

All events use the existing **structured JSON log format** (`event`, `metadata`, `correlationId`, `requestId`). Client logs emit to the browser console in production; warn/error events are also POSTed to the BFF for centralized log shipping.

---

## Module reference

| Module | Path | Runtime |
|--------|------|---------|
| Event catalog | `src/lib/monitoring/admin-events.ts` | Shared |
| Config / thresholds | `src/lib/monitoring/admin-monitoring-config.ts` | Shared |
| Client tracker | `src/lib/monitoring/admin-monitoring-client.ts` | Browser |
| Server tracker | `src/lib/monitoring/admin-monitoring-server.ts` | Node (server-only) |
| Page provider | `src/components/admin-ui/AdminMonitoringProvider.tsx` | Browser |
| Event ingest API | `src/app/api/admin/monitoring/events/route.ts` | Node |

### Public client API

```typescript
import {
  trackAdminPageView,
  trackAdminPageFailure,
  trackAdminApiResult,
  trackAdminAction,
  trackAdminAuthEvent,
} from "@/lib/monitoring/admin-monitoring-client";
```

### Public server API

```typescript
import { trackAdminServerEvent } from "@/lib/monitoring/admin-monitoring-server";
```

---

## Event catalog

| Event | Level | Trigger |
|-------|-------|---------|
| `admin.page.view` | info | Route change in authenticated shell |
| `admin.page.failure` | error | React error boundary, route error, unhandled exception |
| `admin.api.request` | debug | Successful admin API call (sub-threshold) |
| `admin.api.failure` | warn/error | HTTP 4xx/5xx or network error from `adminFetch` |
| `admin.api.slow` | warn | Client API duration ≥ threshold |
| `admin.proxy.slow` | warn | BFF upstream proxy duration ≥ threshold |
| `admin.action` | info | Explicit action (logout, button with `monitorAction`) |
| `admin.auth.login_success` | info | Successful login |
| `admin.auth.login_failure` | warn | Failed login (client or server) |
| `admin.auth.logout` | info | Manual / idle / expired logout |
| `admin.auth.session_refresh_failed` | warn | `/me` refresh failed while authenticated |
| `admin.auth.unauthorized` | warn | API guard 401 |
| `admin.auth.forbidden` | warn | API guard 403 |

Legacy events remain for backward compatibility: `admin.proxy`, `admin.proxy.error`, `admin.login.failure`, `admin.error_boundary`, `admin.route_error`.

---

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `MONITORING_ENABLED` | `true` | Master toggle (existing) |
| `NEXT_PUBLIC_ADMIN_MONITORING_ENABLED` | mirrors `MONITORING_ENABLED` | Client-side toggle |
| `NEXT_PUBLIC_ADMIN_SLOW_API_MS` | `3000` | Client slow API threshold |
| `ADMIN_SLOW_PROXY_MS` | `3000` | Server slow proxy threshold |
| `NEXT_PUBLIC_ADMIN_SLOW_NAV_MS` | `4000` | Slow client navigation threshold |
| `NEXT_PUBLIC_ADMIN_MONITOR_SERVER_INGEST` | `true` in production | POST warn/error to BFF |

---

## Backward compatibility

- `adminFetch` signature unchanged — monitoring is internal
- `AdminActionButton` accepts optional `monitorAction?: string` (ignored when omitted)
- Existing log events and env vars continue to work
- No new required environment variables
- UI components, routes, and API contracts unchanged

---

## Verification

```bash
cd pranidoctor-web
npm run typecheck
npm test
```

Manual smoke:

1. Open `/admin` — console shows `admin.page.view` JSON line
2. Trigger dashboard load — `admin.api.request` or `admin.api.slow` on slow network
3. Failed login — `admin.auth.login_failure` (client + server `admin.login.failure`)
4. Sign out — `admin.auth.logout` with `reason: manual`
5. Force React error in dev — `admin.page.failure` from boundary

---

## Related documents

| Document | Location |
|----------|----------|
| Monitoring plan | `docs/production/admin/admin-monitoring-plan.md` |
| Admin observability | `docs/ADMIN_OBSERVABILITY.md` |
| Health probes | `docs/HEALTHCHECKS.md` |

---

*End of ADMIN_MONITORING_IMPLEMENTATION.md*
