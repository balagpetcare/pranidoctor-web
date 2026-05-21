# Admin Web — Production Certification v2

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` admin panel (`/admin/*`, `/enterprise/*`)  
**Certifier:** Automated re-run (local, Windows)  
**Baselines reviewed:** [ADMIN_PRODUCTION.md](./ADMIN_PRODUCTION.md), [ADMIN_P0_COMPLETE.md](./ADMIN_P0_COMPLETE.md), [ADMIN_OBSERVABILITY.md](./ADMIN_OBSERVABILITY.md), [ADMIN_LINT_RELEASE.md](./ADMIN_LINT_RELEASE.md), [ADMIN_DASHBOARD_COMPLETE.md](./ADMIN_DASHBOARD_COMPLETE.md), [ADMIN_AUTH_COMPLETE.md](./ADMIN_AUTH_COMPLETE.md), [ADMIN_QA.md](./ADMIN_QA.md)

---

## Verdict

# ADMIN_WEB_READY

All **automated certification gates** pass. P0 blockers from the original production audit (monitoring probes, structured logging, production env validation, CI quality gate) are implemented and verified. Remaining items are **operational follow-ups (P1/P2)** — external uptime wiring, log shipping, Sentry SDK, CSP — and do not block shipping admin features with the ops checklist below.

| Gate | Status | Evidence |
|------|--------|----------|
| **Build** | ✅ PASS | `npm run build` exit **0** (~76s) |
| **Types** | ✅ PASS | `npm run typecheck` exit **0** |
| **Tests** | ✅ PASS | `npm test` — **93/93**, **22** files |
| **Monitoring** | ✅ PASS | Health, uptime, error tracking, alerts in code |
| **Logging** | ✅ PASS | Structured JSON server/client logs + correlation IDs |
| **Env** | ✅ PASS | Fail-fast boot + `validate:production-env` + unit tests |
| **CI** | ✅ PASS | `.github/workflows/ci.yml` mirrors local gates |
| **Performance** | ✅ PASS | Design-verified caching + lazy load (no load test this run) |

---

## Certification run log

**Environment:** Node 20, `pranidoctor-web@0.1.0`, Turbopack production build  
**Build env (matches CI):**

```powershell
$env:NODE_ENV="production"
$env:SKIP_PRODUCTION_ENV_VALIDATION="true"
$env:ADMIN_JWT_SECRET="ci-admin-jwt-secret-minimum-32-characters-long"
$env:BACKEND_URL="https://api.example.com"
$env:NEXT_PUBLIC_API_URL="https://api.example.com/api"
```

| Step | Command | Exit | Output summary |
|------|---------|------|----------------|
| 1 | `npm run typecheck` | **0** | `tsc --noEmit` clean |
| 2 | `npm test` | **0** | 93 passed / 22 files / ~9s |
| 3 | `npm run lint:release` | **0** | 92 ESLint targets (admin + changed) |
| 4 | `npm run build` | **0** | Full app compiled; admin + enterprise routes present |
| 5 | `npm run validate:production-env` (valid prod vars) | **0** | `Environment OK.` |
| 6 | `npm test -- src/lib/env/production-validation.test.ts` | **0** | 6/6 pass (fail cases covered) |

### Build fix applied during certification

Initial build **failed** because `error-tracking.ts` imported `server-logger` (uses `server-only` / `node:async_hooks`) into the client bundle via `instrumentation-client.ts`.

**Fix:** Split into:

| Module | Role |
|--------|------|
| `src/lib/monitoring/error-tracking-types.ts` | Shared types |
| `src/lib/monitoring/error-tracking-client.ts` | `captureClientException` (client-safe) |
| `src/lib/monitoring/error-tracking.ts` | Server-only `captureException`, `initErrorTracking` |

Re-build after fix: **exit 0**.

---

## 1. Build

### Result

```bash
npm run build   # exit 0
```

### Route inventory (source tree)

| Surface | Count | Pattern |
|---------|-------|---------|
| Admin pages | **57** | `src/app/admin/**/page.tsx` |
| Enterprise pages | **6** | `src/app/enterprise/**/page.tsx` |
| Admin API proxies | **74** | `src/app/api/admin/**/route.ts` |

Includes monitoring routes: `/api/admin/health`, `/health/live`, `/health/ready`, `/api/admin/uptime`.

### Non-blocking warnings

| Warning | Notes |
|---------|-------|
| Middleware → proxy deprecation (Next 16) | Tracked; works today |
| Prisma CJS in client graph | Pre-existing; use `@/generated/prisma/browser` in client components |

---

## 2. Types

```bash
npm run typecheck   # tsc --noEmit — exit 0
```

No TypeScript errors in admin release surface or CI build path.

---

## 3. Tests

```bash
npm test   # vitest run — exit 0
```

| Metric | Value |
|--------|-------|
| Test files | 22 |
| Tests | 93 passed |
| Duration | ~9s |

### Observability & env coverage (representative)

| Suite | File | Tests |
|-------|------|-------|
| Correlation IDs | `src/lib/logging/correlation.test.ts` | pass |
| Server logger | `src/lib/logging/server-logger.test.ts` | pass |
| Production env | `src/lib/env/production-validation.test.ts` | 6 pass |

Env validation tests prove failure on: short secret, `OTP_MODE=dev`, debug flags enabled; skip when `SKIP_PRODUCTION_ENV_VALIDATION=true`.

---

## 4. Monitoring

### Health & uptime endpoints

| Endpoint | File | Purpose |
|----------|------|---------|
| `GET /api/admin/health` | `src/app/api/admin/health/route.ts` | Composite probe |
| `GET /api/admin/health/live` | `src/app/api/admin/health/live/route.ts` | Liveness |
| `GET /api/admin/health/ready` | `src/app/api/admin/health/ready/route.ts` | Readiness (backend) |
| `GET /api/admin/uptime` | `src/app/api/admin/uptime/route.ts` | External uptime target |

Shared logic: `src/lib/monitoring/health.ts`  
Alerts on health failure: `src/lib/monitoring/alerts.ts` → `alertHealthCheckFailure`

### Error tracking

| Layer | Module | Functions |
|-------|--------|-----------|
| Server | `error-tracking.ts` | `captureException`, `captureMessage`, `initErrorTracking` |
| Client | `error-tracking-client.ts` | `captureClientException` |
| Boot | `src/instrumentation.ts` | `onRequestError` → capture + alert |
| Client boot | `src/instrumentation-client.ts` | `window.error`, `unhandledrejection` on admin/enterprise |

Providers: `noop` | `console` | `webhook` via `ERROR_TRACKING_PROVIDER` and `MONITORING_ALERT_WEBHOOK_URL`.

### Ops follow-up (P1 — not code blockers)

- Point UptimeRobot / Better Uptime at `GET /api/admin/uptime`
- Set `MONITORING_ALERT_WEBHOOK_URL` for Slack/PagerDuty
- Wire Sentry/Datadog SDK into provider abstraction (P1)

---

## 5. Logging

### Structured logging modules

| Module | Scope | Transport |
|--------|-------|-----------|
| `src/lib/logging/server-logger.ts` | Server-only | JSON lines → stdout/stderr |
| `src/lib/logging/client-logger.ts` | Browser | JSON in production console |
| `src/lib/logging/correlation.ts` | Shared | UUID generation |
| `src/lib/logging/request-context.ts` | Server | AsyncLocalStorage context |
| `src/lib/logging/redact.ts` | Shared | Sensitive key redaction |

### Propagation

| Layer | Behaviour |
|-------|-----------|
| `src/middleware.ts` | Sets `x-request-id`, `x-correlation-id` on admin/enterprise requests |
| `src/lib/proxy-to-backend.ts` | Logs proxy start/complete with duration + status |
| `src/app/admin/error.tsx`, `enterprise/error.tsx` | Route errors → `clientLog` + `captureClientException` |
| `AdminErrorBoundary` | React render errors → client capture |

### Ops follow-up

- Ship container stdout to CloudWatch / Datadog Logs (JSON-per-line ready)
- Set `LOG_LEVEL=info`, `NEXT_PUBLIC_LOG_LEVEL=info` in production

---

## 6. Environment

### Validation mechanisms

| Mechanism | Location | Behaviour |
|-----------|----------|-----------|
| Boot fail-fast | `src/instrumentation.ts` → `assertProductionEnvOrThrow()` | Throws on misconfiguration |
| Deploy script | `npm run validate:production-env` | Exit 1 on errors |
| Runtime guards | `src/lib/admin-auth/secrets.ts`, OTP helpers | Secret length, dev OTP blocked |

### Required production variables (validated)

| Variable | Rule |
|----------|------|
| `ADMIN_JWT_SECRET` | ≥32 chars, no placeholders |
| `OTP_MODE` | Must be `live` |
| `OTP_DEBUG_PANEL_ENABLED` | Must be `false` |
| `ENABLE_DEV_OTP` | Must be `false` |
| `BACKEND_URL` | Valid https URL when `APP_ENV=production` |
| `NEXT_PUBLIC_API_URL` | Valid http(s) URL (warning if unset) |

### Evidence

```bash
# Valid production config — exit 0
NODE_ENV=production APP_ENV=production SKIP_PRODUCTION_ENV_VALIDATION=false \
  ADMIN_JWT_SECRET=ci-admin-jwt-secret-minimum-32-characters-long \
  OTP_MODE=live OTP_DEBUG_PANEL_ENABLED=false ENABLE_DEV_OTP=false \
  BACKEND_URL=https://api.example.com \
  NEXT_PUBLIC_API_URL=https://api.example.com/api \
  npm run validate:production-env
# → Environment OK.

# Unit tests — exit 0, 6/6
npm test -- src/lib/env/production-validation.test.ts
```

**Note:** Local `.env` may set `SKIP_PRODUCTION_ENV_VALIDATION=true` for dev builds. CI and production deploys must not skip validation.

---

## 7. CI

**Workflow:** `.github/workflows/ci.yml`

| Job | Command | Blocks merge |
|-----|---------|--------------|
| Typecheck | `npm run typecheck` | ✅ |
| Test | `npm test` | ✅ |
| Lint (release scope) | `npm run lint:release` | ✅ |
| Build | `npm run build` | ✅ (needs typecheck + test + lint) |

Build job env matches certification build env above.

Release lint strategy: [ADMIN_LINT_RELEASE.md](./ADMIN_LINT_RELEASE.md) — admin surface + git-changed files only; full-repo ESLint explicitly out of scope.

---

## 8. Performance

**Method:** Design verification against [ADMIN_DASHBOARD_COMPLETE.md](./ADMIN_DASHBOARD_COMPLETE.md) + source inspection. No Lighthouse or load test executed in this certification run.

| Pattern | Implementation | Evidence |
|---------|----------------|----------|
| SSR cache | `unstable_cache`, 30s revalidate | `src/app/admin/(dashboard)/_lib/dashboard-stats.ts` |
| Page revalidate | `export const revalidate = 30` | `src/app/admin/(dashboard)/page.tsx` |
| Client cache | 15s TTL | `dashboard-client-cache.ts` (documented) |
| Lazy charts | `next/dynamic`, `ssr: false` | `AdminDashboardClient.tsx`, semen forms |
| Live poll | 30s interval | `useAdminDashboardRealtime` |

**Verdict:** ✅ PASS (architecture matches production dashboard spec).

**P2 follow-up:** Bundle analyzer, Lighthouse CI on `/admin` login + dashboard.

---

## 9. Security (informational)

Inherited from [ADMIN_PRODUCTION.md](./ADMIN_PRODUCTION.md) + P0/P1 work:

| Control | Status |
|---------|--------|
| JWT middleware + httpOnly cookies | ✅ |
| Security headers on admin/enterprise | ✅ |
| `robots: noindex,nofollow` | ✅ |
| Content-Security-Policy | ⚠️ P1 — not yet added |
| Rate limiting at Next layer | P2 — backend owns auth limits |

---

## 10. Pre-deploy ops checklist

```bash
# Required
NODE_ENV=production
APP_ENV=production
ADMIN_JWT_SECRET=<random ≥32 chars>
OTP_MODE=live
OTP_DEBUG_PANEL_ENABLED=false
ENABLE_DEV_OTP=false
BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
SKIP_PRODUCTION_ENV_VALIDATION=false   # must NOT be true in prod

# Recommended
MONITORING_ENABLED=true
ERROR_TRACKING_PROVIDER=webhook          # or console until Sentry wired
MONITORING_ALERT_WEBHOOK_URL=<slack/pagerduty url>
LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=info
APP_VERSION=<release tag>
```

**Deploy pipeline:**

```bash
npm run validate:production-env   # must exit 0
npm run typecheck && npm test && npm run lint:release && npm run build
```

**Post-deploy:**

1. Configure external monitor → `GET https://<host>/api/admin/uptime`
2. Confirm `GET /api/admin/health/ready` returns 200 when backend is up
3. Verify structured logs appear in log aggregator
4. Smoke-test `/admin/login` → dashboard

---

## 11. Known limitations (non-blocking)

| Item | Severity | Notes |
|------|----------|-------|
| Full-repo ESLint | P2 | ~2000+ legacy issues; release lint covers admin |
| Sentry/Datadog SDK | P1 | Abstraction ready; SDK not integrated |
| CSP header | P1 | Add after inline script audit |
| Load / Lighthouse metrics | P2 | Not measured this certification |
| Prisma browser imports | P2 | Some client components import full Prisma client |

---

## 12. Document lineage

| Document | Status |
|----------|--------|
| ADMIN_PRODUCTION.md | Superseded for gates by this certificate (was `ADMIN_WEB_NOT_READY`) |
| ADMIN_P0_COMPLETE.md | P0 blockers done |
| ADMIN_OBSERVABILITY.md | Logging/observability done |
| ADMIN_LINT_RELEASE.md | Release lint strategy done |
| **ADMIN_CERTIFICATE_V2.md** | **Current certification — `ADMIN_WEB_READY`** |

---

## Final token

```
ADMIN_WEB_READY
```

**Signed:** Automated certification run, 2026-05-22  
**Evidence bundle:** Sections 1–8 command outputs + source paths above
