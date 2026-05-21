# Admin Web — Observability Complete

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` admin panel (`/admin/*`, `/enterprise/*`)  
**Baseline:** [ADMIN_P0_COMPLETE.md](./ADMIN_P0_COMPLETE.md)

---

## Verdict

# ADMIN_OBSERVABILITY_DONE

Structured logging replaces ad-hoc `console.*` in admin observability paths. Request and correlation IDs propagate through middleware, admin API proxy, server logs, and client logs. Admin UI has error boundaries and route-level error pages.

| Capability | Status |
|------------|--------|
| Structured server logger (JSON) | ✅ |
| Structured client logger (JSON) | ✅ |
| Request ID | ✅ |
| Correlation ID | ✅ |
| Server log context (AsyncLocalStorage) | ✅ |
| Client error boundary | ✅ |
| Route error pages (`error.tsx`) | ✅ |
| Admin proxy request logging | ✅ |

---

## 1. Structured logging

### Server logger

**Module:** `src/lib/logging/server-logger.ts` (server-only)

```typescript
import { serverLog } from "@/lib/logging/server-logger";

serverLog.info("Backend proxy completed", {
  event: "admin.proxy",
  metadata: { path: "/api/admin/auth/me", status: 200, durationMs: 42 },
});
```

Output (one JSON object per line on stdout/stderr):

```json
{
  "timestamp": "2026-05-22T12:00:00.000Z",
  "level": "info",
  "service": "pranidoctor-web-admin",
  "scope": "server",
  "message": "Backend proxy completed",
  "event": "admin.proxy",
  "requestId": "8f2c…",
  "correlationId": "8f2c…",
  "metadata": { "path": "/api/admin/auth/me", "status": 200, "durationMs": 42, "version": "0.1.0" }
}
```

| Env | Default | Purpose |
|-----|---------|---------|
| `LOG_LEVEL` | `info` in production, `debug` in dev | Minimum level: `debug` \| `info` \| `warn` \| `error` |

Sensitive keys (`password`, `token`, `otp`, `jwt`, etc.) are redacted to `[REDACTED]` in metadata.

### Client logger

**Module:** `src/lib/logging/client-logger.ts`

```typescript
import { clientLog } from "@/lib/logging/client-logger";

clientLog.error("Admin route error", {
  event: "admin.route_error",
  error,
  metadata: { digest: error.digest },
});
```

| Env | Default | Purpose |
|-----|---------|---------|
| `NEXT_PUBLIC_LOG_LEVEL` | `info` in production | Client minimum log level |

In production the client logger emits **JSON strings** (browser console is the transport). In development it emits structured objects for readability.

---

## 2. Request ID & correlation ID

### Headers

| Header | Constant | Meaning |
|--------|----------|---------|
| `x-request-id` | `REQUEST_ID_HEADER` | Unique ID for one HTTP request |
| `x-correlation-id` | `CORRELATION_ID_HEADER` | Trace across requests/services |

**Module:** `src/lib/logging/correlation.ts`, `src/lib/logging/constants.ts`

### Where IDs are set

| Layer | Behaviour |
|-------|-----------|
| **Middleware** (`src/middleware.ts`) | Adds both headers to `/admin`, `/enterprise`, `/doctor` HTML responses |
| **Admin API proxy** (`src/lib/proxy-to-backend.ts`) | Reads or generates IDs, sets on upstream request and downstream response, binds AsyncLocalStorage context |
| **Client session** | `sessionStorage` key `pd_admin_correlation_id` — stable per browser tab |
| **Client fetch helper** | `appendAdminCorrelationHeaders()` adds IDs to outgoing admin API calls |

### Propagation flow

```
Browser tab
  └─ correlationId (sessionStorage)
       └─ fetch /api/admin/*  → x-request-id (per call) + x-correlation-id
            └─ proxy-to-backend → backend Express API
                 └─ serverLog entries include requestId + correlationId
```

### Server request context

**Module:** `src/lib/logging/request-context.ts`

Proxy handlers run inside `runWithRequestContext()` so nested `serverLog.*` calls automatically include the active `requestId` / `correlationId`.

---

## 3. Error boundaries & route errors

| Component | Path | Purpose |
|-----------|------|---------|
| `AdminErrorBoundary` | `src/components/admin-ui/AdminErrorBoundary.tsx` | Catches React render errors in admin/enterprise shells |
| Admin route error | `src/app/admin/error.tsx` | Next.js App Router segment error UI |
| Enterprise route error | `src/app/enterprise/error.tsx` | Same for enterprise review routes |

Wired in:

- `src/app/admin/layout.tsx` — wraps all admin pages
- `src/app/enterprise/layout.tsx` — wraps enterprise pages

All boundary/route errors log via `clientLog` + `captureClientException`.

---

## 4. Console replacement map

Ad-hoc `console.*` removed from admin observability code paths:

| Before | After | File |
|--------|-------|------|
| `console.info/warn` login lines | `serverLog.info/warn` | `admin-login-errors.ts` |
| `console.error/warn` monitoring | `serverLog.error/warn` | `monitoring/alerts.ts` |
| `console.error` error tracking | `serverLog` / `clientLog` | `monitoring/error-tracking.ts` |
| `console.warn/error` boot validation | `writeBootLog()` JSON | `env/production-validation.ts` |
| `console.error` instrumentation client | `clientLog.error` | `instrumentation-client.ts` |

**Note:** Non-admin modules (mobile OTP, SMS local provider) still use `console.*` — out of scope for this pass.

---

## 5. Instrumentation integration

| Hook | File | Logging |
|------|------|---------|
| Server boot | `src/instrumentation.ts` | Env validation boot logs + error tracking init |
| Server request errors | `onRequestError` | `captureException` with request/correlation IDs |
| Client boot | `src/instrumentation-client.ts` | Admin surface detection + unhandled error hooks |
| Client navigation | `onRouterTransitionStart` | `clientLog.debug` navigation events |

---

## 6. Admin proxy observability

For paths under `/api/admin/*`, `proxyRouteToBackend`:

1. Resolves/generates request + correlation IDs
2. Forwards IDs to backend
3. Returns IDs on response headers
4. Logs one structured line per proxy (`admin.proxy` or `admin.proxy.error`)

Log level by HTTP status:

| Status | Level |
|--------|-------|
| 2xx/3xx | `info` |
| 4xx | `warn` |
| 5xx / network error | `error` |

---

## 7. Files added / changed

| Area | Path |
|------|------|
| Logging core | `src/lib/logging/*` |
| Proxy + IDs | `src/lib/proxy-to-backend.ts` |
| Middleware headers | `src/middleware.ts` |
| Error UI | `AdminErrorBoundary`, `admin/error.tsx`, `enterprise/error.tsx` |
| Layout wiring | `admin/layout.tsx`, `enterprise/layout.tsx` |
| Monitoring | `monitoring/alerts.ts`, `monitoring/error-tracking.ts` |
| Auth logs | `admin-auth/admin-login-errors.ts` |
| Instrumentation | `instrumentation.ts`, `instrumentation-client.ts` |
| Env example | `.env.example` (`LOG_LEVEL`, `NEXT_PUBLIC_LOG_LEVEL`) |

---

## 8. Verification log (2026-05-22)

```bash
cd pranidoctor-web
npm run typecheck     # exit 0
npm test              # 93 passed (22 files)
npx eslint src/lib/logging src/lib/monitoring/alerts.ts src/lib/monitoring/error-tracking.ts src/components/admin-ui/AdminErrorBoundary.tsx  # exit 0
```

New tests:

- `src/lib/logging/correlation.test.ts` — ID resolution
- `src/lib/logging/server-logger.test.ts` — JSON output + redaction

---

## 9. Ops checklist

Forward **stdout/stderr** JSON lines to your log aggregator (CloudWatch, Datadog, Loki, etc.).

Recommended production env:

```bash
LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=warn
MONITORING_ENABLED=true
ERROR_TRACKING_ENABLED=true
```

Verify correlation in logs:

1. Open `/admin` in browser
2. Trigger an admin API call (e.g. login or dashboard load)
3. Confirm server logs share the same `correlationId` for related proxy lines
4. Confirm response headers include `x-request-id` and `x-correlation-id`

---

## 10. Remaining (post-observability)

| Item | Priority |
|------|----------|
| Sentry/Datadog SDK wiring into error-tracking provider | P1 |
| Central client log ingestion endpoint (optional) | P2 |
| Replace `console.*` in mobile OTP/SMS modules | P2 |
| CSP header | P1 |

---

**Output:** `ADMIN_OBSERVABILITY_DONE`
