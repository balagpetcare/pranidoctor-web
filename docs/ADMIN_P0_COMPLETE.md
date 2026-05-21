# Admin Web — P0 Production Blockers Complete

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` admin panel (`/admin/*`, `/enterprise/*`)  
**Baseline:** [ADMIN_PRODUCTION.md](./ADMIN_PRODUCTION.md)

---

## Verdict

# ADMIN_P0_DONE

All **P0 production blockers** from the admin production audit are implemented: monitoring probes, fail-fast production env validation, and a CI quality gate. No UI redesign or feature work was added.

| P0 Gate | Status |
|---------|--------|
| Monitoring (health, uptime, error tracking, alerts) | ✅ |
| Production env validation (fail-fast boot) | ✅ |
| CI/CD gate (build, typecheck, test, lint changed) | ✅ |

---

## 1. Monitoring

### Health checks

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /api/admin/health` | Composite admin probe (process + backend reachability) | Public |
| `GET /api/admin/health/live` | Liveness — process alive | Public |
| `GET /api/admin/health/ready` | Readiness — backend API reachable | Public |
| `GET /api/admin/uptime` | External uptime monitor target | Public |

Implementation:

- Shared snapshot helpers: `src/lib/monitoring/health.ts`
- Backend failure on `/api/admin/health` triggers alert hook (`alertHealthCheckFailure`)

### Uptime endpoint

`GET /api/admin/uptime` returns:

```json
{
  "ok": true,
  "data": {
    "service": "pranidoctor-web-admin",
    "scope": "admin",
    "status": "ok",
    "timestamp": "2026-05-22T…",
    "uptimeSeconds": 123,
    "version": "0.1.0",
    "nodeEnv": "production",
    "appEnv": "production",
    "monitoringEnabled": true,
    "probe": "uptime"
  }
}
```

Configure UptimeRobot / Better Uptime against this URL; alert when status ≠ 200.

### Error tracking abstraction

| Layer | File | Behaviour |
|-------|------|-----------|
| Server | `src/lib/monitoring/error-tracking.ts` | `captureException`, `captureMessage`, providers: `noop` \| `console` \| `webhook` |
| Server hook | `src/instrumentation.ts` | `onRequestError` → error tracking + alert |
| Client (admin/enterprise) | `src/instrumentation-client.ts` | `captureClientException` for unhandled errors |

### Environment toggles

| Variable | Default | Purpose |
|----------|---------|---------|
| `MONITORING_ENABLED` | `true` | Master switch for alerts + server error tracking |
| `ERROR_TRACKING_ENABLED` | `true` | Server error capture |
| `ERROR_TRACKING_PROVIDER` | `console` in prod | `noop` \| `console` \| `webhook` |
| `NEXT_PUBLIC_ERROR_TRACKING_ENABLED` | on in prod builds | Client admin error capture |
| `MONITORING_ALERT_WEBHOOK_URL` | unset | Optional Slack/generic webhook |
| `APP_VERSION` | package version | Shown on health/uptime probes |

### Alert hooks

`src/lib/monitoring/alerts.ts`:

- `sendAlert(title, message, severity, metadata?)`
- `alertHealthCheckFailure(endpoint, reason)` — used by admin health route
- `alertServerError(message, context?)` — used by `onRequestError`

When `MONITORING_ALERT_WEBHOOK_URL` is set, alerts POST JSON payloads. Otherwise warnings go to server logs.

---

## 2. Production env validation

### Startup validation (fail-fast)

| Trigger | Mechanism |
|---------|-----------|
| Server boot | `src/instrumentation.ts` → `assertProductionEnvOrThrow()` |
| Deploy pipeline | `npm run validate:production-env` |

Runs when `NODE_ENV=production` **or** `APP_ENV=production`. Emergency bypass: `SKIP_PRODUCTION_ENV_VALIDATION=true` (not recommended).

### Rules enforced

| Check | Requirement |
|-------|-------------|
| `ADMIN_JWT_SECRET` | ≥ 32 chars (or `AUTH_SECRET` / `JWT_SECRET` fallback); no `.env.example` placeholders |
| `OTP_MODE` | Must be `live` |
| `OTP_DEBUG_PANEL_ENABLED` | Must be `false` |
| `ENABLE_DEV_OTP` | Must be `false` |
| `BACKEND_URL` | Required, valid http(s) URL; https when `APP_ENV=production` |
| `NEXT_PUBLIC_API_URL` | Warning if unset; error if invalid URL |

Implementation: `src/lib/env/production-validation.ts`

Tests: `src/lib/env/production-validation.test.ts` (6 cases)

---

## 3. CI/CD gate

### Workflow

File: `.github/workflows/ci.yml`

| Job | Command | Gate |
|-----|---------|------|
| Typecheck | `npm run typecheck` | Required |
| Test | `npm test` | Required |
| Lint | `npm run lint:changed` | Required — changed `*.{js,jsx,ts,tsx,cjs,mjs}` only |
| Build | `npm run build` | Required after lint/test/typecheck |

Build job sets `SKIP_PRODUCTION_ENV_VALIDATION=true` plus minimal secrets so CI can compile without production `.env`.

### Lint changed files only

Script: `scripts/lint-changed.mjs`

- PRs: diff against `origin/$GITHUB_BASE_REF`
- Push: diff against `HEAD~1`
- Skips cleanly when no lintable files changed

### NPM scripts added

```json
"lint:changed": "node scripts/lint-changed.mjs",
"validate:production-env": "tsx scripts/validate-production-env.ts"
```

---

## 4. Files added / changed

| Area | Path |
|------|------|
| Monitoring | `src/lib/monitoring/*` |
| Env validation | `src/lib/env/production-validation.ts` |
| Instrumentation | `src/instrumentation.ts`, `src/instrumentation-client.ts` |
| Admin probes | `src/app/api/admin/health/*`, `src/app/api/admin/uptime/route.ts` |
| CI | `.github/workflows/ci.yml`, `scripts/lint-changed.mjs` |
| Deploy guard | `scripts/validate-production-env.ts` |
| Docs / env | `.env.example` (monitoring vars) |

---

## 5. Verification log (2026-05-22)

```bash
cd pranidoctor-web
npm run typecheck          # exit 0
npm test                   # 88 passed (20 files)
npm run lint:changed       # exit 0 (skips when no git diff locally)
npm run build              # exit 0 (with SKIP_PRODUCTION_ENV_VALIDATION for CI-like env)
npx eslint src/lib/monitoring …  # exit 0 on new files
```

New routes compiled in build output:

- `/api/admin/health`, `/api/admin/health/live`, `/api/admin/health/ready`, `/api/admin/uptime`

---

## 6. Production deploy checklist (ops)

Before go-live, confirm:

```bash
NODE_ENV=production
APP_ENV=production
ADMIN_JWT_SECRET=<random ≥32 chars>
OTP_MODE=live
OTP_DEBUG_PANEL_ENABLED=false
ENABLE_DEV_OTP=false
BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
MONITORING_ENABLED=true
# optional: MONITORING_ALERT_WEBHOOK_URL=https://hooks.slack.com/…
```

Run before deploy:

```bash
npm run validate:production-env   # must exit 0
curl -f https://<host>/api/admin/health
curl -f https://<host>/api/admin/uptime
```

Point external uptime monitoring at `/api/admin/uptime` (or `/api/admin/health/ready` for backend dependency).

---

## Remaining (not P0)

These stay **P1+** per [ADMIN_PRODUCTION.md](./ADMIN_PRODUCTION.md):

- Structured JSON logging + correlation IDs
- Sentry/Datadog SDK integration (webhook abstraction is ready)
- CSP header
- Full-repo ESLint cleanup (1100+ legacy issues)
- Bundle analyzer on release branches

---

**Output:** `ADMIN_P0_DONE`
