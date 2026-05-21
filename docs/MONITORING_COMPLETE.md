# MONITORING_COMPLETE

**Project:** Prani Doctor  
**Repos:** `pranidoctor-web`, `pranidoctor-backend`, `pranidoctor_user`  
**Status:** Foundation shipped — production SDKs and release pipeline gaps remain  
**Audited:** 2026-05-22  
**Design reference:** [devops/MONITORING.md](./devops/MONITORING.md) (Phase 2 aspirational — not deployed)

---

## Executive summary

| Pillar | Web | Backend | User app (Flutter) | Verdict |
|--------|-----|---------|-------------------|---------|
| **Crash reporting** | Client handlers + logs only | Logs only | **None** | Gap |
| **Analytics** | Admin KPI dashboard (business stats) | None | **None** (no product telemetry SDK) | Gap |
| **App health** | Admin health/uptime probes | Full `/health/*` + Docker | Optional `/api/mobile/health` only | Partial |
| **Release monitoring** | `APP_VERSION` on probes; CI build | Docker HEALTHCHECK; no deploy markers | Obfuscation script; no crash symbol upload | Gap |
| **Error tracking** | Webhook/console abstraction; no Sentry | Pino + global error handler | Dio errors → UI only | Partial |

**Overall:** ~55% complete for *production monitoring*. Observability **foundation** (structured logs, health probes, alert webhooks) exists on web + backend. Missing: hosted crash reporting (Sentry/Crashlytics), product analytics, Prometheus metrics, and release↔error correlation.

---

## Existing implementation (verified)

### pranidoctor-web

| Area | Status | Evidence |
|------|--------|----------|
| **Error tracking (server)** | Shipped | `src/lib/monitoring/error-tracking.ts` — `captureException`, `captureMessage`; providers `noop` \| `console` \| `webhook` |
| **Error tracking (client)** | Shipped | `error-tracking-client.ts` — logs to `clientLog`; `instrumentation-client.ts` window error handlers (admin surface only) |
| **Instrumentation** | Shipped | `instrumentation.ts` — `onRequestError` → capture + `alertServerError` |
| **Alerts** | Shipped | `alerts.ts` — `MONITORING_ALERT_WEBHOOK_URL`; health failure + server errors |
| **App health** | Shipped | `GET /api/admin/health`, `/live`, `/ready`, `/uptime` — `src/lib/monitoring/health.ts` |
| **Structured logging** | Shipped | `server-logger.ts`, `client-logger.ts`, correlation IDs — [ADMIN_OBSERVABILITY.md](./ADMIN_OBSERVABILITY.md) |
| **UI error surfaces** | Shipped | `AdminErrorBoundary`, `admin/error.tsx`, `enterprise/error.tsx` |
| **Analytics (product)** | **Not shipped** | `/admin/analytics` = dashboard KPIs (`AnalyticsAdminView`), not PostHog/GA/Firebase |
| **Crash reporting SDK** | **Missing** | No `@sentry/nextjs` or equivalent |
| **Metrics** | **Missing** | No `/api/metrics` (Prometheus) despite devops doc example |

**Env (`.env.example`):**

```env
MONITORING_ENABLED=true
ERROR_TRACKING_ENABLED=true
ERROR_TRACKING_PROVIDER=console   # webhook | noop
# MONITORING_ALERT_WEBHOOK_URL=
# NEXT_PUBLIC_ERROR_TRACKING_ENABLED=true
# APP_VERSION=0.1.0
```

### pranidoctor-backend

| Area | Status | Evidence |
|------|--------|----------|
| **App health** | Shipped | `src/api/health/` — `/health`, `/ready`, `/live`, `/health/db`, `/health/redis`, `/health/storage`, `/health/modules` |
| **Error tracking** | Partial | `error.handler.ts` + Pino `logError` for 5xx; no external error SaaS |
| **Structured logging** | Shipped | `src/shared/logger/logger.ts` — JSON, sanitizer, request context |
| **Docker / ops health** | Shipped | `Dockerfile` HEALTHCHECK, `docker-compose.yml` service healthchecks |
| **Crash reporting** | **Missing** | No Sentry/Datadog SDK |
| **Metrics** | **Missing** | No Prometheus `/metrics` exporter in repo |
| **Release monitoring** | **Missing** | No `APP_VERSION` / git SHA in health response |

### pranidoctor_user (customer Flutter app)

| Area | Status | Evidence |
|------|--------|----------|
| **Crash reporting** | **Missing** | No `firebase_crashlytics`, `sentry_flutter` |
| **Analytics** | **Missing** | No `firebase_analytics` / PostHog; FCM only |
| **App health** | Partial | Can call backend `/api/mobile/health` (documented); no startup probe in app |
| **Error tracking** | Partial | `AppException` + snackbars; `clientLog` N/A (no monitoring module) |
| **Release monitoring** | Partial | `scripts/build_release.ps1` obfuscation + `split-debug-info`; no symbol upload to crash backend |

**Note:** `pranidoctor_mobile` (technician enterprise app) has analytics *ports* (`TemplateLearningAnalytics`, `MediaUploadAnalyticsPort`) — debugPrint hooks only, no SDK. Out of customer-app scope unless unified platform monitoring.

### Cross-cutting docs (aspirational)

- [devops/MONITORING.md](./devops/MONITORING.md) — Prometheus/Grafana/Loki compose (not in repo as deployed stack)
- [PRODUCTION_CERTIFICATE.md](./PRODUCTION_CERTIFICATE.md) — marks metrics/alerts as partial/missing

---

## Gap matrix

| Pillar | What exists | Gap |
|--------|-------------|-----|
| **Crash reporting** | Web client error listeners → logs | Sentry/Crashlytics for web, backend, Flutter; symbol upload |
| **Analytics** | Admin business KPI page | Product analytics SDK + privacy-safe event schema |
| **App health** | Web admin probes + backend `/health` | External uptime monitors wired; mobile startup health check |
| **Release monitoring** | `APP_VERSION` on web probes; CI build | Release env in all apps; Sentry release health; deploy notifications |
| **Error tracking** | Webhook/console + Pino | Sentry provider in `ERROR_TRACKING_PROVIDER`; backend unhandled rejection hook |

---

## Gap implementation spec (gaps only)

### G1 — Crash reporting (all runtimes)

**Web (`pranidoctor-web`):**

- Add `@sentry/nextjs` (or chosen vendor).
- Extend `ERROR_TRACKING_PROVIDER` with `sentry`; implement in `error-tracking.ts` + `error-tracking-client.ts`.
- Wire `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` (= `APP_VERSION` / git SHA).
- Upload source maps in CI on production build.

**Backend (`pranidoctor-backend`):**

- Add `@sentry/node`; init in app bootstrap; hook Express `errorHandler` 5xx + `unhandledRejection`.
- Tag events with `release`, `requestId`.

**Mobile (`pranidoctor_user`):**

- Add `sentry_flutter` (or Firebase Crashlytics if Firebase already required for FCM).
- `main.dart`: `FlutterError.onError`, `PlatformDispatcher.instance.onError`, run app in guarded zone.
- Pass `SENTRY_DSN` / environment via `--dart-define`; upload debug symbols from `build/debug-info/`.

### G2 — Product analytics

**Web:** Optional PostHog or GA4 — `NEXT_PUBLIC_ANALYTICS_*`; track admin funnel only (login, assign, cancel) with consent banner if needed.

**Mobile:** Firebase Analytics or PostHog Flutter — events: `login`, `booking_created`, `sync_completed`, `offline_queued`; no PII in properties.

**Backend:** Log structured business events only (already partially via domain logs); no duplicate client events server-side unless audit trail required.

### G3 — App health (operational)

- Document external monitors (UptimeRobot/Better Stack) pointing at:
  - `https://<api>/health` (backend)
  - `https://<web>/api/admin/health/ready` (web BFF readiness)
- **Mobile:** optional `HealthCheckService` on app resume calling `/api/mobile/health`; soft banner if API down.
- Optional: implement `GET /api/metrics` on backend (prom-client) — Phase 2; not blocking if external HTTP monitors suffice.

### G4 — Release monitoring

- CI: inject `APP_VERSION=${{ github.sha }}` (or tag) into web build, backend Docker image label, Flutter `--dart-define=APP_VERSION=`.
- Sentry: create release per deploy; attach commits.
- Slack/deploy webhook on successful production deploy (GitHub Actions).
- Health probes already expose `version` — ensure backend `/health` returns `version` + `commit` fields.

### G5 — Error tracking hardening

- Replace default prod `ERROR_TRACKING_PROVIDER=console` with `sentry` when DSN set.
- Map `captureClientException` to Sentry browser SDK with user id hashed.
- Backend: sample rate, scrub phone/token in `beforeSend`.
- Alert routing: keep `MONITORING_ALERT_WEBHOOK_URL` for P1; Sentry for stack traces.

---

## Completion checklist

| # | Pillar | Web | Backend | User app | Done |
|---|--------|-----|---------|----------|------|
| 1 | Structured logging | ☑ | ☑ | partial | ☐ unified |
| 2 | Health probes | ☑ | ☑ | partial | ☐ |
| 3 | Alert webhooks | ☑ | — | — | ☐ Sentry alerts |
| 4 | Crash reporting SDK | — | — | — | ☐ |
| 5 | Product analytics | — | — | — | ☐ |
| 6 | Release ↔ errors | partial | — | partial | ☐ |
| 7 | Error tracking SaaS | partial | partial | — | ☐ |

---

## Verification steps

1. **Crash:** Force React error on `/admin` → event in Sentry with release tag. Force Flutter throw → Crashlytics/Sentry event with symbols resolved.
2. **Analytics:** Complete booking → `booking_created` event visible in analytics dashboard (staging).
3. **Health:** Stop backend → `/api/admin/health/ready` returns non-200; uptime monitor alerts within 2 min.
4. **Release:** Deploy tag `v1.2.3` → Sentry release created; health JSON shows `"version":"v1.2.3"`.
5. **Error tracking:** API 500 → Sentry issue + Pino log line with same `requestId`.

---

## ONE Cursor Composer command

Copy everything inside the block into **Cursor Composer** (one run).

```
@pranidoctor-web @pranidoctor-backend @pranidoctor_user

Prani Doctor — Add production monitoring (gaps only).

READ FIRST:
- docs/MONITORING_COMPLETE.md
- docs/ADMIN_OBSERVABILITY.md
- docs/devops/MONITORING.md (ops context only — do not deploy full Prometheus stack unless G3 metrics chosen)
- pranidoctor_user/docs/PRODUCTION_READINESS.md

RULES:
- Verify existing monitoring code before writing. Reuse src/lib/monitoring/*, instrumentation.ts, alerts.ts, health probes, backend Pino logger.
- Extend ERROR_TRACKING_PROVIDER — do not replace webhook/console paths; add sentry provider when DSN present.
- Minimal diffs; no unrelated refactors.
- Secrets via env / dart-define only — never commit DSN keys.
- Admin /admin/analytics KPI page is BUSINESS analytics — do not confuse with product telemetry (G2).

PILLARS:
crash reporting | analytics | app health | release monitoring | error tracking

TASKS (in order):

1) AUDIT VERIFY
   - Confirm MONITORING_COMPLETE.md matrix; update checklist if drift.

2) G1 — Crash reporting
   - Web: @sentry/nextjs, server + client, source maps in CI.
   - Backend: @sentry/node in Express bootstrap + errorHandler.
   - Flutter: sentry_flutter in main.dart + release symbol upload doc/script.

3) G2 — Product analytics
   - Web: env-gated analytics helper (PostHog or Firebase/GA per existing stack).
   - Mobile: firebase_analytics or posthog_flutter — core events only (login, book, sync, offline).
   - Document event schema in MONITORING_COMPLETE.md.

4) G3 — App health
   - Add docs/ops/uptime-monitors.md with probe URLs (backend /health, web /api/admin/health/ready).
   - Mobile: optional health check on resume (reuse backend /api/mobile/health).
   - Optional backend GET /metrics behind auth if quick win.

5) G4 — Release monitoring
   - CI: APP_VERSION / SENTRY_RELEASE from git SHA or tag (web + backend Docker + Flutter dart-define).
   - Sentry release + deploy webhook step in GitHub Actions.
   - Backend health response: add version + commit fields.

6) G5 — Error tracking
   - Wire sentry into captureException / captureClientException / onRequestError.
   - Backend 5xx → Sentry with requestId; scrub PII in beforeSend.
   - .env.example updates for all repos.

7) DOCS
   - Finalize docs/MONITORING_COMPLETE.md: checklist ☑, Shipped files table, production env table.

8) SMOKE
   - npm test (web monitoring tests), backend unit tests if touched, flutter analyze (user app).
   - Note manual verification steps performed.

OUTPUT (reply with exactly this structure):

## MONITORING_COMPLETE

### Shipped
- per pillar with repo + key files + env vars

### Checklist
- table with Done ☑

### Verify
- manual steps run

### Remaining
- None or blocked (e.g. pending Sentry project DSN from ops)
```

---

## Production env reference (after implementation)

| Variable | Repo | Purpose |
|----------|------|---------|
| `SENTRY_DSN` | web, backend | Server error ingest |
| `NEXT_PUBLIC_SENTRY_DSN` | web | Client errors |
| `SENTRY_ENVIRONMENT` | all | `production` / `staging` |
| `SENTRY_RELEASE` | all | Git tag or SHA |
| `MONITORING_ALERT_WEBHOOK_URL` | web | Slack/PagerDuty (keep) |
| `ERROR_TRACKING_PROVIDER` | web | `sentry` when DSN set |
| `APP_VERSION` | web, backend | Health + release |
| `NEXT_PUBLIC_ANALYTICS_*` | web | Product analytics |
| `SENTRY_DSN` (dart-define) | user app | Flutter crashes |

---

## Shipped files (populate after Composer run)

| Gap | Repo | Files |
|-----|------|-------|
| G1 | web, backend, user | _pending_ |
| G2 | web, user | _pending_ |
| G3 | web, backend, user, docs | _pending_ |
| G4 | CI, all | _pending_ |
| G5 | web, backend | _pending_ |

---

## Reuse index (do not reimplement)

| Component | Path |
|-----------|------|
| Error tracking API | `pranidoctor-web/src/lib/monitoring/error-tracking.ts` |
| Client capture | `pranidoctor-web/src/lib/monitoring/error-tracking-client.ts` |
| Config / env | `pranidoctor-web/src/lib/monitoring/config.ts` |
| Health snapshots | `pranidoctor-web/src/lib/monitoring/health.ts` |
| Alerts | `pranidoctor-web/src/lib/monitoring/alerts.ts` |
| Next instrumentation | `pranidoctor-web/src/instrumentation.ts` |
| Backend logger | `pranidoctor-backend/src/shared/logger/logger.ts` |
| Backend health | `pranidoctor-backend/src/api/health/` |

---

*Run the Composer command above to reach full MONITORING_COMPLETE status.*
