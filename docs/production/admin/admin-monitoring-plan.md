# Admin Panel Monitoring Plan

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Scope:** `pranidoctor-web` Next.js admin panel (`/admin/*`, `/enterprise/*`) and its BFF/API integrations with `pranidoctor-backend`  
**Status:** Implemented (v1) — structured event tracking shipped; external APM and Phase 2 stack not deployed  
**Implementation:** [ADMIN_MONITORING_IMPLEMENTATION.md](./ADMIN_MONITORING_IMPLEMENTATION.md)  
**Readiness report:** [ADMIN_MONITORING_READINESS_REPORT.md](./ADMIN_MONITORING_READINESS_REPORT.md) (2026-05-30 — **READY** with ops follow-ups)

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Current-state audit](#2-current-state-audit)
3. [Monitoring architecture](#3-monitoring-architecture)
4. [Monitoring plan](#4-monitoring-plan)
5. [Metrics plan](#5-metrics-plan)
6. [Alerting plan](#6-alerting-plan)
7. [Dashboard ↔ probe mapping](#7-dashboard--probe-mapping)
8. [Environment & ops checklist](#8-environment--ops-checklist)
9. [Implementation roadmap](#9-implementation-roadmap)
10. [Related documents](#10-related-documents)

---

## 1. Executive summary

The Prani Doctor admin panel is a **Next.js BFF (Backend-for-Frontend)** that proxies almost all `/api/admin/*` traffic to the Express backend. It ships a **business/operations monitoring surface** (KPI dashboards, Phase 05 analytics, AI ops, feed ecosystem analytics) and an **observability foundation** (structured JSON logs, correlation IDs, health probes, webhook alerts, optional Sentry).

What the admin UI is **not** today:

- An infrastructure APM console (no Grafana/Prometheus UI in-app)
- A product analytics platform (no PostHog/GA/Firebase in admin)
- A unified on-call pager (webhook alerts exist; external uptime wiring is ops-owned)

| Layer | Maturity | Notes |
|-------|----------|-------|
| **Business dashboards** | Strong | Operations dashboard + 7 analytics sub-views + feed/AI panels |
| **Health probes** | Shipped | Web BFF + backend `/health/*`; Launch Ops page for manual checks |
| **Structured logging** | Shipped | JSON server/client logs, proxy `admin.proxy` events, correlation IDs |
| **Error tracking** | Partial | Sentry init + webhook/console providers; client SDK wiring incomplete |
| **Structured admin events** | Shipped | Page/API/auth/action/performance events — see implementation doc |
| **Technical metrics** | Weak | Backend basic `/metrics`; admin System Analytics explicitly defers APM |
| **External monitoring stack** | Not deployed | Prometheus/Grafana/Loki documented in `docs/devops/MONITORING.md` only |

**Recommendation:** Treat admin dashboards as **human-facing operational visibility**. Pair them with **external uptime monitors**, **log aggregation**, and **Slack/PagerDuty webhooks** for production SLOs. Promote Prometheus/Grafana when traffic and team size justify Phase 2.

---

## 2. Current-state audit

### 2.1 Admin dashboards (UI)

| Route | Component | Purpose | Refresh | Data source |
|-------|-----------|---------|---------|-------------|
| `/admin` | `AdminDashboardClient` | Executive KPIs, charts, doctor breakdown, revenue, recent requests | SSR 30s revalidate + client cache 15s + **30s poll** | `GET /api/admin/dashboard/page-data` |
| `/admin/analytics` | `OverviewAnalyticsView` | Platform KPIs, trends, status charts | On demand (date range) | `GET /api/admin/analytics/overview` |
| `/admin/analytics/revenue` | `RevenueAnalyticsView` | Revenue time series, commission, service-type breakdown | On demand | `GET /api/admin/analytics/revenue` |
| `/admin/analytics/doctors` | `DoctorsAnalyticsView` | Doctor leaderboard, acceptance/completion rates | On demand | `GET /api/admin/analytics/doctors` |
| `/admin/analytics/farmers` | `FarmersAnalyticsView` | Farmer engagement, retention | On demand | `GET /api/admin/analytics/farmers` |
| `/admin/analytics/livestock` | `LivestockAnalyticsView` | Clinical cases, species, diseases | On demand | `GET /api/admin/analytics/livestock` |
| `/admin/analytics/geography` | `GeographyAnalyticsView` | Regional demand, heatmap | On demand | `GET /api/admin/analytics/geography` |
| `/admin/analytics/system` | `SystemAnalyticsView` | Offline queue, sessions, users by role | On demand | `GET /api/admin/analytics/system` |
| `/admin/feed-ecosystem/analytics` | `FeedAnalyticsPanel` | Feed items, consumption cost, recommendations | 7/30/90 day selector | `GET /api/admin/feed-analytics` |
| `/admin/ai-ops` | `AiOpsOverview` | AI session counts, escalations, recommendations | On mount | `GET /api/admin/ai-ops/overview` |
| `/admin/ai-ops/risk` | `AiRiskPanel` | High-risk farms, outbreak signals | On mount | `GET /api/admin/ai-ops/analytics/risk` |
| `/admin/ai-ops/prompts` | `PromptList` | Prompt lifecycle management | CRUD | `GET/POST /api/admin/ai-ops/prompts` |
| `/admin/ai-ops/knowledge` | `KnowledgeList` | Knowledge base management | CRUD | `GET/POST /api/admin/ai-ops/knowledge` |
| `/admin/ai-ops/governance` | `AiGovernancePanel` | Kill switch (persisted PG+Redis), history, escalations | On demand | `GET /api/admin/ai-ops/governance` → `{ escalations, governance, history }` |
| `/admin/reports` | `ReportsAdminView` | Treatment summary + completed requests list | Manual refresh | Dashboard API + service-requests |
| `/admin/launch-ops` | `LaunchOpsPage` | **Manual health probe UI** | On mount | Local fetch to web health routes |
| `/admin/audit` | `AuditAdminHub` | OTP dev logs (not production audit trail) | — | Dev-only |
| `/admin/dev-tools/otp-logs` | `AdminOtpDevLogsPanel` | OTP dispatch diagnostics | — | Dev-only |

**Navigation:** Grouped sidebar in `src/components/admin-ui/admin-nav.tsx` — Overview, Analytics, Feed Ecosystem, AI Operations, System (includes Launch Ops).

**Important distinction:**

- **Business analytics** (`/admin/analytics/*`, feed/AI panels) = aggregated DB metrics for ops/product decisions.
- **Infrastructure monitoring** = health probes, logs, alerts, external uptime — mostly outside the admin UI except Launch Ops and System Analytics placeholders.

### 2.2 API integrations

#### BFF proxy pattern

Almost all admin APIs flow:

```
Browser → Next.js /api/admin/* → proxy-to-backend.ts → Express backend /api/admin/*
```

Key integration modules:

| Integration | Web route | Backend module | Auth |
|-------------|-----------|----------------|------|
| Dashboard | `/api/admin/dashboard/page-data` | Legacy dashboard route | Admin JWT (BFF guard) |
| Platform analytics | `/api/admin/analytics/{overview,revenue,doctors,farmers,livestock,geography,system,reports}` | `admin-analytics` module | Admin JWT |
| Feed analytics | `/api/admin/feed-analytics` | Feed ecosystem services | Admin JWT |
| AI ops | `/api/admin/ai-ops/*` | AI admin module | Admin JWT (SUPER_ADMIN/ADMIN for nav) |
| Health (public at BFF) | `/api/admin/health`, `/live`, `/ready`, `/uptime` | Backend `/health` via `fetchBackendHealth()` | Public |
| Auth | `/api/admin/auth/login`, `/logout`, `/me` | Panel admin auth | Login public; others JWT |

**Proxy observability** (`src/lib/proxy-to-backend.ts`):

- Generates/forwards `x-request-id` and `x-correlation-id`
- Emits structured log per request: event `admin.proxy` or `admin.proxy.error`
- Log level by status: 2xx/3xx → `info`, 4xx → `warn`, 5xx/network → `error`
- Includes `durationMs`, path, method, status

**Analytics export:** `AnalyticsExportButton` → `GET /api/admin/analytics/reports?format=csv&report={id}` (proxied to backend).

**System analytics gap (explicit in code):** Backend `AdminAnalyticsService.getSystem()` returns:

```json
{
  "apiMetrics": {
    "available": false,
    "message": "Integrate APM (Sentry/Datadog) for API latency and error rates"
  }
}
```

This confirms admin System Analytics is **queue/session visibility only** until APM is wired.

### 2.3 Existing logging & error tracking

#### Web (`pranidoctor-web`)

| Component | Path | Role |
|-----------|------|------|
| Server logger | `src/lib/logging/server-logger.ts` | JSON lines → stdout/stderr; service `pranidoctor-web-admin` |
| Client logger | `src/lib/logging/client-logger.ts` | JSON in production browser console |
| Correlation | `src/lib/logging/correlation.ts` | UUID request/correlation IDs |
| Request context | `src/lib/logging/request-context.ts` | AsyncLocalStorage for nested server logs |
| Redaction | `src/lib/logging/redact.ts` | Sensitive keys → `[REDACTED]` |
| Error boundary | `AdminErrorBoundary`, `admin/error.tsx` | UI errors → `clientLog` + `captureClientException` |
| Instrumentation | `src/instrumentation.ts` | Boot validation, Sentry init, `onRequestError` → capture + alert |
| Error tracking | `src/lib/monitoring/error-tracking.ts` | Providers: `noop` \| `console` \| `webhook` \| `sentry` |
| Sentry init | `src/lib/monitoring/sentry-init.ts` | Server-side when `SENTRY_DSN` set |
| Alerts | `src/lib/monitoring/alerts.ts` | `MONITORING_ALERT_WEBHOOK_URL` → Slack/PagerDuty JSON |
| Health | `src/lib/monitoring/health.ts` | Admin health snapshot builder |

**Log events to index in production:**

| Event | Source | Use |
|-------|--------|-----|
| `admin.proxy` | proxy-to-backend | Latency, status codes, path-level error rates |
| `admin.proxy.error` | proxy-to-backend | Upstream failures |
| `admin.route_error` | client error pages | UI render failures |
| `monitoring.alert` | alerts.ts | Alert delivery fallback |
| `error_tracking.exception` | error-tracking | Captured server exceptions |
| `admin.auth.*` | login error helpers | Auth failure patterns |

#### Backend (`pranidoctor-backend`)

| Component | Path | Role |
|-----------|------|------|
| Logger | `src/shared/logger/logger.ts` | Pino JSON, request context mixin, sanitizer |
| Health | `src/api/health/` | `/health`, `/ready`, `/live`, `/health/db`, `/redis`, `/storage`, `/modules` |
| Metrics | `src/api/metrics/metrics.routes.ts` | Prometheus text: uptime, heap, compat route count (token-gated in prod) |

#### Cross-service trace flow

```
Browser tab (correlationId in sessionStorage)
  └─ fetch /api/admin/*  (+ x-request-id per call)
       └─ Next.js proxy (serverLog with both IDs)
            └─ Express backend (Pino requestId from forwarded headers)
```

---

## 3. Monitoring architecture

### 3.1 Layered model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ADMIN MONITORING ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  L4 — BUSINESS VISIBILITY (in-app)                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ /admin dashboard · /admin/analytics/* · feed-ecosystem · ai-ops       │  │
│  │ Human operators: KPIs, trends, exports, AI risk, offline queue        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              ▲ reads aggregated APIs                         │
│                                                                              │
│  L3 — APPLICATION OBSERVABILITY (code-shipped)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Structured   │  │ Health       │  │ Error        │  │ Webhook      │   │
│  │ JSON logs    │  │ probes       │  │ tracking     │  │ alerts       │   │
│  │ (web+backend)│  │ (BFF+API)    │  │ (Sentry/wh)  │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         └─────────────────┴─────────────────┴─────────────────┘             │
│                              ▼ ship to ops tools                             │
│                                                                              │
│  L2 — OPS PLATFORMS (deploy separately — Phase 1 minimum)                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ External uptime (UptimeRobot / Better Stack)                          │  │
│  │ Log aggregator (CloudWatch / Datadog / Loki via Promtail)             │  │
│  │ Alert channel (Slack #pranidoctor-alerts)                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  L1 — METRICS STACK (Phase 2 — optional at current scale)                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Prometheus scrape → Grafana dashboards → Alertmanager                 │  │
│  │ Node exporter · cAdvisor · postgres/redis exporters                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Probe topology

| Probe target | Owner | Used by | Purpose |
|--------------|-------|---------|---------|
| `GET /health` | Backend | Ops, load balancer | Full dependency check (DB, Redis, storage, queues, memory) |
| `GET /ready` | Backend | K8s/Docker readiness | DB + Redis ready |
| `GET /live` | Backend | Liveness | Process alive |
| `GET /metrics` | Backend | Prometheus (Phase 2) | Process metrics (token auth in prod) |
| `GET /api/admin/health/ready` | Web BFF | External uptime, Launch Ops | Admin can serve traffic if backend up |
| `GET /api/admin/health/live` | Web BFF | Container liveness | Next.js process alive |
| `GET /api/admin/uptime` | Web BFF | External uptime | Version, uptime, monitoring flag |
| `GET /api/health/*` | Web | Launch Ops | Generic web health (non-admin scope) |

**Production uptime minimum (Phase 1):**

1. `https://<api-host>/health` — backend aggregate
2. `https://<web-host>/api/admin/health/ready` — admin BFF readiness
3. `https://<web-host>/admin/login` — keyword or status check (user-facing shell)

### 3.3 Data flow: dashboard load

```
/admin (SSR)
  └─ getAdminDashboardPageData() [unstable_cache 30s]
       └─ GET /api/admin/dashboard/page-data (proxy)
            └─ Backend aggregates Prisma counts

/admin (client poll every 30s)
  └─ fetchDashboardPageDataClient() [15s memory cache]
       └─ same proxy path

/admin/analytics/system
  └─ fetchSystemAnalytics()
       └─ GET /api/admin/analytics/system (proxy)
            └─ admin-analytics module: offline queue + sessions
                 └─ apiMetrics: placeholder until APM
```

---

## 4. Monitoring plan

### 4.1 Objectives

| Objective | Success criteria |
|-----------|------------------|
| **Detect outages** | External monitor alerts within 2 min of admin or API hard down |
| **Diagnose incidents** | Correlate user report → `correlationId` → proxy logs → backend logs |
| **Operate the platform** | Ops team uses `/admin` + analytics without DB access |
| **Watch AI & feed subsystems** | AI ops and feed analytics reviewed weekly; risk panel for escalations |
| **Pre-launch verification** | Launch Ops probes green before go-live |

### 4.2 What to monitor (by subsystem)

#### Admin web (Next.js BFF)

| Signal | Source | Tool |
|--------|--------|------|
| Process up | `/api/admin/health/live` | Uptime monitor |
| Can serve admin | `/api/admin/health/ready` | Uptime monitor |
| Proxy error rate | `admin.proxy.error` logs | Log query |
| p95 proxy duration | `durationMs` in `admin.proxy` | Log metric or APM |
| React errors | `admin.route_error`, Sentry | Sentry + logs |
| Auth failures | `admin.auth.*` warn/error logs | Log alert |

#### Backend API

| Signal | Source | Tool |
|--------|--------|------|
| Aggregate health | `/health` | Uptime + on-call |
| DB connectivity | `/health/db` | Uptime (dependency) |
| Redis / storage | `/health/redis`, `/health/storage` | Degraded alerts |
| 5xx rate | Pino error logs | Log alert / Sentry |
| Queue depth | System analytics offline queue | Admin UI + future metric |
| Module registry | `/health/modules` | Post-deploy smoke |

#### Business operations (admin UI — not automated alerts unless scripted)

| Signal | Dashboard | Review cadence |
|--------|-----------|----------------|
| Pending service requests | `/admin` KPI | Daily |
| Doctor verification backlog | `/admin` doctor stats | Daily |
| Revenue trend | `/admin/analytics/revenue` | Weekly |
| Emergency call volume | `/admin/analytics` overview | Daily during launch |
| AI escalations | `/admin/ai-ops` | Daily |
| High-risk farms | `/admin/ai-ops/risk` | Daily |
| Feed consumption anomalies | `/admin/feed-ecosystem/analytics` | Weekly |
| Offline sync backlog | `/admin/analytics/system` | Hourly during mobile rollout |

### 4.3 Roles & responsibilities

| Role | Primary tools | Actions |
|------|---------------|---------|
| **On-call engineer** | Uptime dashboard, Slack alerts, log search, Sentry | Acknowledge, triage, rollback |
| **Ops lead** | `/admin`, Launch Ops, analytics exports | Pre-launch checks, weekly KPI review |
| **Product/admin staff** | Dashboard, analytics sub-nav | Day-to-day operations (not infra) |
| **AI ops admin** | `/admin/ai-ops/*` | Prompt/knowledge changes, risk review |

### 4.4 Monitoring phases

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **P0 — Launch** | Now | External uptime on 3 probes; log shipping; `MONITORING_ALERT_WEBHOOK_URL`; Sentry DSN on web |
| **P1 — Hardening** | +2–4 weeks | Log-based alerts (5xx spike, ready probe fail); backend `/metrics` scrape; complete Sentry client |
| **P2 — Scale** | Growth | Prometheus + Grafana per `docs/devops/MONITORING.md`; fill System Analytics `apiMetrics`; synthetic admin login |

---

## 5. Metrics plan

### 5.1 Metric categories

#### A. Golden signals (SLO-oriented)

| Metric ID | Definition | Source today | Target collection |
|-----------|------------|--------------|-------------------|
| `admin.uptime.ratio` | Ratio of successful ready probes | External uptime | UptimeRobot/Better Stack |
| `admin.proxy.error_rate` | 5xx + network errors / total admin proxy requests | `admin.proxy*` logs | Log metric or Prometheus |
| `admin.proxy.p95_ms` | 95th percentile `durationMs` for `/api/admin/*` | Proxy logs | Loki metric query / APM |
| `backend.health.status` | 1=healthy, 0.5=degraded, 0=unhealthy | `/health` JSON | Synthetic check |
| `backend.error_rate` | 5xx / total API requests | Pino + future middleware | Sentry / Prometheus |

**Suggested SLOs (initial):**

- Admin ready probe availability: **99.5%** monthly
- Admin proxy p95 latency: **< 3s** (excludes analytics export)
- Backend `/health` availability: **99.9%** monthly

#### B. Business metrics (admin dashboards — already available)

| Metric | Dashboard | Backend endpoint |
|--------|-----------|------------------|
| Total / active users | Analytics overview | `/api/admin/analytics/overview` |
| Service requests by status | Dashboard + overview | `dashboard/page-data`, overview |
| Completed consultations | Dashboard, overview | Same |
| Revenue (BDT) | Dashboard, revenue analytics | Same |
| Doctor leaderboard | Doctors analytics | `/api/admin/analytics/doctors` |
| Farmer retention | Farmers analytics | `/api/admin/analytics/farmers` |
| Livestock cases by species | Livestock analytics | `/api/admin/analytics/livestock` |
| Geographic demand | Geography analytics | `/api/admin/analytics/geography` |
| Offline queue by status | System analytics | `/api/admin/analytics/system` |
| Active sessions | System analytics | Same |
| Feed consumption cost | Feed ecosystem analytics | `/api/admin/feed-analytics` |
| AI chat / escalation counts | AI ops overview | `/api/admin/ai-ops/overview` |
| Farm risk scores | AI risk panel | `/api/admin/ai-ops/analytics/risk` |

#### C. Infrastructure metrics (partial today)

| Metric | Source | Status |
|--------|--------|--------|
| `pranidoctor_process_uptime_seconds` | Backend `GET /metrics` | Shipped |
| `pranidoctor_heap_used_bytes` | Backend `GET /metrics` | Shipped |
| `pranidoctor_compat_routes` | Backend `GET /metrics` | Shipped |
| Node CPU / memory / disk | node-exporter | Phase 2 |
| PostgreSQL connections / slow queries | postgres-exporter | Phase 2 |
| Redis memory | redis-exporter | Phase 2 |
| HTTP request histogram | Web `/api/metrics` | **Not implemented** (devops doc is aspirational) |

#### D. AI & cost metrics (future)

| Metric | Purpose | Source |
|--------|---------|--------|
| `ai_requests_total{provider,status}` | Provider reliability | Backend AI module + Prometheus |
| `ai_tokens_used_total` | Budget guard | Backend AI audit logs |
| `ai_escalations_total` | Safety monitoring | AI ops overview (UI today) |

### 5.2 Metric naming convention (recommended)

```
pranidoctor_{subsystem}_{metric}_{unit}

Examples:
  pranidoctor_admin_proxy_duration_seconds
  pranidoctor_admin_proxy_requests_total{status,path_group}
  pranidoctor_backend_health_check{dependency}
  pranidoctor_business_service_requests_total{status}
```

**Path grouping for admin proxy metrics:** Collapse IDs to reduce cardinality:

- `/api/admin/doctors/[id]` → `/api/admin/doctors/:id`
- `/api/admin/analytics/overview` → keep literal

### 5.3 Log-derived metrics (Phase 1 stopgap)

Until Prometheus middleware ships, derive from JSON logs:

```logql
# Proxy error rate (5m) — Loki-style example
sum(rate({service="pranidoctor-web-admin"} | json | event="admin.proxy" | status >= 500 [5m]))
/
sum(rate({service="pranidoctor-web-admin"} | json | event="admin.proxy" [5m]))

# p95 proxy latency
quantile_over_time(0.95,
  {service="pranidoctor-web-admin"} | json | event="admin.proxy" | unwrap durationMs [5m]
)
```

CloudWatch Logs Insights equivalent: filter `@message` JSON `event = "admin.proxy"`, stats on `metadata.durationMs`.

### 5.4 Dashboard ↔ metric ownership

| Grafana/dashboard (Phase 2) | Admin UI equivalent today |
|-----------------------------|----------------------------|
| Overview: uptime, error rate, latency | Launch Ops + `/admin/analytics/system` (partial) |
| Application: endpoint latency | Proxy logs only |
| Business: service requests, revenue | `/admin` + `/admin/analytics/*` |
| AI: tokens, errors | `/admin/ai-ops` |
| Database | Backend `/health/db` only |

---

## 6. Alerting plan

### 6.1 Alert philosophy

1. **Alert on user impact** — ready probe down beats high CPU
2. **Actionable only** — every alert has a runbook link
3. **Severity tiers** — critical pages immediately; warnings batched
4. **Avoid duplicate noise** — prefer Sentry for stack traces, webhooks for ops signals

### 6.2 Alert channels

| Channel | Config | Use |
|---------|--------|-----|
| Slack / PagerDuty webhook | `MONITORING_ALERT_WEBHOOK_URL` | Health failures, server errors (shipped) |
| Sentry | `SENTRY_DSN`, `ERROR_TRACKING_PROVIDER=sentry` | Exceptions with stack traces |
| External uptime email/Slack | UptimeRobot/Better Stack UI | Probe failures |
| Email (Phase 2) | Alertmanager | Critical infra |

**Webhook payload shape** (from `alerts.ts`):

```json
{
  "title": "Admin health check failed",
  "message": "/api/admin/health/ready — Backend API unreachable",
  "severity": "critical",
  "service": "pranidoctor-web-admin",
  "timestamp": "ISO-8601",
  "metadata": { "endpoint": "...", "reason": "..." }
}
```

### 6.3 Alert catalog

#### P0 — Critical (page immediately)

| Alert | Condition | Source | Response |
|-------|-----------|--------|----------|
| **AdminReadyDown** | `/api/admin/health/ready` non-200 for 2 min | External uptime | Check backend `/health`, DB, deploy rollback |
| **BackendHealthDown** | `/health` status `unhealthy` or HTTP 503 | External uptime | DB/Redis recovery runbook |
| **AdminServerError** | `onRequestError` fired | Web instrumentation → `alertServerError` | Sentry issue + log correlation |
| **HealthCheckFailure** | Programmatic health failure | `alertHealthCheckFailure()` | Same as AdminReadyDown |
| **SSLExpiring** | Cert < 7 days | External SSL monitor | Renew cert |

#### P1 — Warning (respond < 1 hour)

| Alert | Condition | Source |
|-------|-----------|--------|
| **AdminProxy5xxSpike** | >5% admin proxy 5xx over 10 min | Log metric |
| **AdminProxySlow** | p95 `durationMs` > 5000 for 15 min | Log metric |
| **BackendDegraded** | `/health` status `degraded` > 10 min | Uptime synthetic |
| **OfflineQueueBacklog** | Pending offline queue > threshold | System analytics (manual or scheduled query) |
| **AIEscalationSpike** | Escalations > N in 1h | AI ops overview |
| **SentryNewIssue** | New unresolved issue in production | Sentry alert rules |

#### P2 — Info (business hours)

| Alert | Condition | Source |
|-------|-----------|--------|
| **PendingDoctorsHigh** | Pending verification > N | Dashboard KPI |
| **NoServiceRequests** | Zero requests in 2h (production only) | Analytics overview |
| **FeedConsumptionAnomaly** | Daily cost > 2× 7-day avg | Feed analytics |
| **CertificateExpiry30d** | SSL < 30 days | External monitor |

### 6.4 In-app vs external alerting

| Mechanism | Location | Auto-alert? |
|-----------|----------|-------------|
| `alertHealthCheckFailure` | `src/lib/monitoring/alerts.ts` | Yes (if webhook set) |
| `alertServerError` | `instrumentation.ts` | Yes |
| Launch Ops red status | `/admin/launch-ops` | **No** — manual pre-launch only |
| Dashboard poll error | `useAdminDashboardRealtime` | **No** — UI message only |
| Analytics fetch error | `AnalyticsShell` | **No** — operator must notice |

**Gap:** Admin UI does not push infra alerts to operators. External uptime + webhook alerts are required for unattended operation.

### 6.5 Incident severity matrix

| Severity | Examples | Response | Notification |
|----------|----------|----------|--------------|
| **Critical** | Admin down, DB down, auth broken | Immediate | Webhook + uptime + Sentry |
| **Warning** | Slow analytics, degraded Redis, queue backlog | < 1 hour | Slack webhook |
| **Info** | KPI threshold, cert 30-day warning | Business hours | Slack optional |

### 6.6 Runbook quick links

| Scenario | First steps |
|----------|-------------|
| Admin 503 on login | Check `/api/admin/health/ready`; verify `BACKEND_URL`; inspect `admin.proxy.error` logs |
| Dashboard stale | Expected during backend outage; check 30s poll errors in browser network tab |
| Analytics timeout | Heavy date range — check backend DB load; reduce range; review admin-analytics cache |
| AI ops empty | Verify backend AI module mounted; check `/health/modules` |
| Launch Ops all red | Follow probe order: backend `/health` → web `/api/admin/health/ready` |

---

## 7. Dashboard ↔ probe mapping

Use this table during incidents to know which probe validates which admin surface.

| Admin surface | Validating probe | Supporting API smoke |
|---------------|------------------|----------------------|
| Login page | `/admin/login` HTTP 200 | `POST /api/admin/auth/login` |
| Main dashboard | `/api/admin/health/ready` | `GET /api/admin/dashboard/page-data` |
| Analytics hub | `/api/admin/health/ready` | `GET /api/admin/analytics/overview?from=&to=` |
| Feed analytics | Same | `GET /api/admin/feed-analytics?periodDays=7` |
| AI ops | Same | `GET /api/admin/ai-ops/overview` |
| CSV export | Same | `GET /api/admin/analytics/reports?format=csv&report=overview` |
| Launch Ops page itself | `/api/health/live` (web process) | All probes listed on page |

---

## 8. Environment & ops checklist

### 8.1 Production environment (web)

```bash
# Logging
LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=warn

# Monitoring
MONITORING_ENABLED=true
ERROR_TRACKING_ENABLED=true
ERROR_TRACKING_PROVIDER=sentry          # when SENTRY_DSN set
MONITORING_ALERT_WEBHOOK_URL=<slack-or-pagerduty-url>

# Error tracking
SENTRY_DSN=<server-dsn>
NEXT_PUBLIC_SENTRY_DSN=<client-dsn>     # when client SDK complete
APP_VERSION=<git-tag-or-sha>

# Backend connectivity
BACKEND_URL=https://api.<production-host>
NEXT_PUBLIC_API_URL=https://api.<production-host>/api
```

### 8.2 Production environment (backend)

```bash
LOG_LEVEL=info
APP_VERSION=<git-tag-or-sha>
METRICS_TOKEN=<random-secret>           # for GET /metrics in production
```

### 8.3 Pre-launch verification

1. Open `/admin/launch-ops` — all probes green
2. External monitor configured for `/api/admin/health/ready` and backend `/health`
3. Trigger test alert: temporarily set invalid webhook URL → confirm `monitoring.alert.webhook_failed` log; restore URL → send test critical alert
4. Load `/admin` — KPI tiles populate; 30s poll indicator green
5. Load `/admin/analytics/system` — offline queue renders; note `apiMetrics.available: false` until APM
6. Confirm log aggregator receives JSON lines with `correlationId`
7. Force test exception in staging → Sentry event with `APP_VERSION` release tag

### 8.4 Log shipping

Ship **container stdout/stderr** from both web and backend containers. JSON-per-line format is ready — no log parser transformation required.

**Minimum indexed fields:** `timestamp`, `level`, `service`, `event`, `requestId`, `correlationId`, `message`, `metadata.durationMs`, `metadata.status`, `metadata.path`.

---

## 9. Implementation roadmap

| Priority | Item | Effort | Unblocks |
|----------|------|--------|----------|
| P0 | Wire external uptime to 3 probes | 1h ops | Unattended outage detection |
| P0 | Configure `MONITORING_ALERT_WEBHOOK_URL` in prod | 30m | Critical alerts |
| P0 | Ship logs to aggregator | 2h ops | Incident diagnosis |
| P1 | Complete Sentry client (`error-tracking-client.ts`) | 1–2 dev days | Browser error visibility |
| P1 | Log-based alert rules (5xx spike, ready down) | 1 dev day | Proxy SLO alerts |
| ~~P1~~ | ~~Structured admin event tracking~~ | ~~Done~~ | See `ADMIN_MONITORING_IMPLEMENTATION.md` |
| P1 | Backend health returns `commit` SHA | Small | Release correlation |
| P2 | Prometheus scrape backend `/metrics` | 1 dev day | Infra dashboards |
| P2 | Implement web request metrics middleware | 2–3 dev days | System Analytics `apiMetrics` |
| P2 | Deploy Grafana stack per devops doc | 1–2 ops days | Unified infra view |
| P2 | Synthetic admin login check | 1h ops | End-user path validation |
| P3 | Business metric alerts from analytics API | Custom | Ops automation |

---

## 10. Related documents

| Document | Location | Relevance |
|----------|----------|-----------|
| Admin observability (shipped) | `docs/ADMIN_OBSERVABILITY.md` | Logging, correlation IDs |
| Monitoring gap analysis | `docs/MONITORING_COMPLETE.md` | Cross-repo status |
| DevOps monitoring (Phase 2 design) | `docs/devops/MONITORING.md` | Prometheus/Grafana/Loki |
| Health endpoints | `docs/HEALTHCHECKS.md` | Backend probe reference |
| Admin analytics plan | `docs/phases/PHASE_05_ADMIN_ANALYTICS_PLAN.md` | Dashboard KPI definitions |
| Admin dashboard | `docs/ADMIN_DASHBOARD_COMPLETE.md` | Polling, cache architecture |
| API connection audit | `docs/API_CONNECTION_AUDIT.md` | Route wiring status |
| Admin certificate | `docs/ADMIN_CERTIFICATE_V2.md` | P0 monitoring gates |

---

## Document control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-30 | Platform / DevOps | Initial admin monitoring plan from codebase audit |

---

*End of admin-monitoring-plan.md*
