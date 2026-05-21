# Technical Risk Audit — Prani Doctor

**Audit date:** 2026-05-21  
**Auditor mode:** read-only technical risk assessment (no fixes applied)  
**Inputs:** [01_REPOSITORY_INVENTORY.md](./01_REPOSITORY_INVENTORY.md), [02_ARCHITECTURE_AUDIT.md](./02_ARCHITECTURE_AUDIT.md), [03_FEATURE_MATRIX.md](./03_FEATURE_MATRIX.md)  
**Scope:** `pranidoctor-backend`, `pranidoctor-web`, `pranidoctor_user`

---

## Executive summary

| Severity | Count | Theme |
|----------|-------|-------|
| **P0** | **6** | Production deploy broken for legacy API; no CI/CD; OTP misconfig risk; no automated backup execution |
| **P1** | **14** | Foundation module stubs; legacy rate-limit gap; secret/env drift; duplicate logic; payment/SMS gaps |
| **P2** | **12** | Dead/archived code; observability docs-only; test debt; documentation ownership conflict |
| **P3** | **8** | Minor dead code; git hygiene; platform polish |

**Highest-impact finding:** The backend **production Docker image** (`docker/Dockerfile` → `node dist/server.js`) does **not** ship `legacy/web/routes/` (179 compat handlers). `route-registry.ts` walks for `route.ts` under `dist/legacy/web/routes` — **directory absent after build**. Dev (`tsx src/server.ts`) works; **containerized production does not match verified dev path**.

**Second critical gap:** **No CI/CD** in any repository — phase verification is manual script-only (`p2:verify`, `p3:verify`, `e2e:freeze`).

---

## Severity definitions

| Level | Definition | Response expectation |
|-------|------------|----------------------|
| **P0** | Production outage, data loss, or exploit likely without immediate mitigation | Block release; fix before prod |
| **P1** | Major functional/security gap; no acceptable prod workaround | Fix in current sprint |
| **P2** | Material debt; workaround exists | Plan and schedule |
| **P3** | Low impact hygiene or future concern | Backlog |

---

## 1. Detected issues

### 1.1 Dead code

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| DC-01 | P2 | **Archived web domain libs** (46 TS files) frozen but retained | `pranidoctor-web/archive/web-deprecated/src/lib/*` — policy: do not delete until soak (`ARCHITECTURE_FREEZE.md`) |
| DC-02 | P2 | **Foundation archive folders** excluded from build, never loaded | `src/modules/auth/_archived_foundation/*`, `src/modules/media/_archived_foundation/*` |
| DC-03 | P3 | **Web geo helper** appears unreferenced | `pranidoctor-web/src/lib/mobile-locations/geo-resolve.ts` — no imports under `src/app` or `src/lib` |
| DC-04 | P2 | **~178 web `src/lib/*` files** largely superseded by backend legacy port but still present | Parallel to `pranidoctor-backend/src/legacy/web/lib/` (~175 TS files) |
| DC-05 | P3 | **Flutter placeholder gateways** | `VideoCallGateway` NoOp, `MediaUploadCoordinator` stub (`MASTER_APP_ARCHITECTURE_PLAN.md`) |

### 1.2 Broken modules (runtime)

| ID | Severity | Module / path | Failure mode | Evidence |
|----|----------|---------------|--------------|----------|
| BM-01 | **P0** | **Compat legacy router in Docker prod** | 0 routes or startup walk failure; API surface missing | `dist/legacy/web/routes` **missing**; registry matches `route.ts` only; Dockerfile copies `dist/` only |
| BM-02 | P1 | **`/api/ai/*` foundation** | All repository methods throw | `modules/ai/ai.repository.ts` → `Not implemented - awaiting database migration` |
| BM-03 | P1 | **`/api/clinics/*` foundation** | Repository throws (12 methods) | `modules/clinics/clinics.repository.ts` |
| BM-04 | P1 | **`/api/animals/*` foundation** | Repository throws (8 methods) | `modules/animals/animals.repository.ts` |
| BM-05 | P1 | **`/api/notifications/*` foundation** | Repository throws; `sendSms`/`sendPush` throw | `notifications.repository.ts`, `notifications.service.ts` |
| BM-06 | P1 | **`/api/media/*` foundation** | All handlers return `503 MEDIA_MIGRATION_PENDING` | `modules/media/media.controller.ts` |
| BM-07 | P2 | **`/api/doctors` create** | `create()` throws — directs to legacy | `doctors.repository.ts` line 77 |
| BM-08 | P2 | **Legacy Vitest suites** | 12 suites fail on `@/` alias | Inventory §1.10; blocks automated regression |

**Note:** Primary product traffic uses **legacy compat routes** (working under `tsx` dev). Foundation routes are a **second, mostly broken API surface**.

### 1.3 Duplicate logic

| ID | Severity | Pattern | Evidence | Risk |
|----|----------|---------|----------|------|
| DL-01 | P1 | **Mirrored domain lib trees** | Web 178 TS vs backend legacy 175 TS | Divergent bug fixes; double maintenance |
| DL-02 | P1 | **Auth implementation dual stack** | `modules/auth/*` ↔ `legacy/web/lib/*-auth/*` bidirectional imports | Circular coupling (architecture audit §C.2) |
| DL-03 | P1 | **API response helpers ×3** | `legacy/web/lib/api-response.ts`, `compat/compat-api-response.ts`, web `src/lib/api-response.ts` | Envelope drift |
| DL-04 | P2 | **Parallel domain modules** | `lead/` vs `leads/`, `doctor/` vs `doctors/`, `user/` vs `users/` | Wrong module invoked |
| DL-05 | P2 | **Dual API stacks** | Next 176 routes proxy + Express 179 legacy + 9 foundation | Route count mismatch; dual-hop latency |
| DL-06 | P2 | **Dual Postgres compose** | Backend compose + web compose (different defaults) | Wrong DB in dev |
| DL-07 | P2 | **Prisma client sync** | Web postinstall copy from backend | Schema drift if sync skipped |

### 1.4 Security gaps

| ID | Severity | Gap | Evidence |
|----|----------|-----|----------|
| SG-01 | **P0** | **OTP dev mode in production** | `OTP_MODE` defaults dev; `warnIfProdDevOtpMode()` logs warning only; OTP printed to console / dev log |
| SG-02 | P1 | **Legacy routes without rate limiting** | No `rateLimit*` in `src/legacy/**` or `compat-web/`; limits on foundation `/api/media` only |
| SG-03 | P1 | **OTP debug admin endpoint** | `GET /api/admin/dev-tools/otp-logs` — gated by `isOtpDebugPanelAllowed()` but exposes OTP snapshots in dev/staging |
| SG-04 | P1 | **Helmet CSP disabled** | `app.ts`: `contentSecurityPolicy: false` |
| SG-05 | P1 | **SMS provider placeholder** | `sms/providers/http-placeholder.ts` — generic HTTP; fails open with `skipped: true` when creds missing |
| SG-06 | P2 | **Narrow RBAC matrix** | `permissions.registry.ts` — admin caps for service-instance only; not full resource RBAC |
| SG-07 | P2 | **Web `prisma` proxy bypass via types-only imports** | Guard in `src/lib/prisma.ts` throws; many files still import `@/generated/prisma/client` enums — low direct DB risk but policy drift |
| SG-08 | P3 | **Flutter dev placeholder tokens** | `SessionController.signInDevPlaceholder()` writes `dev-token` |
| SG-09 | P3 | **Mobile app not version-controlled** | `pranidoctor_user` — no `.git/` |

### 1.5 Missing production pieces

| ID | Severity | Missing piece | Documented | In repo |
|----|----------|---------------|------------|---------|
| MP-01 | **P0** | **CI/CD pipeline** | Phase0 DevOps PASS (docs) | **No** `.github/workflows` in any repo |
| MP-02 | **P0** | **Production-safe backend artifact** | `docker/Dockerfile` | Legacy routes not in image |
| MP-03 | **P0** | **Automated backup jobs** | `docs/devops/BACKUP_STRATEGY.md` | **Docs only** — no cron/scripts in repo |
| MP-04 | P1 | **Payment gateway integration** | Phase0 §11.1 | Manual `BillingRecord` / `PaymentRecord` only |
| MP-05 | P1 | **SMS / push delivery** | Module map | TODO + throw in foundation; placeholder SMS |
| MP-06 | P1 | **Web production container** | — | No Next.js Dockerfile |
| MP-07 | P1 | **Release / versioning process** | — | No changelog, tags, or release workflow |
| MP-08 | P2 | **APM / error tracking** | `MONITORING.md`, `ERROR_STANDARD.md` | No Sentry/Prometheus/Datadog in code |
| MP-09 | P2 | **Worker deployment** | `src/worker.ts`, BullMQ | Not in Docker compose profile |
| MP-10 | P2 | **External backup storage** | BACKUP_STRATEGY | S3 offsite documented, not wired |
| MP-11 | P3 | **iOS / store pipeline** | Mobile plan | Android only |

---

## 2. Domain reviews

### 2.1 Auth

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Implementation** | Phase 1 frozen; panel JWT cookies + mobile Bearer; session/device modules | **Medium** — auth↔legacy cycle |
| **OTP** | Redis-backed when enabled; dev mode logs plaintext OTP | **P0** if `OTP_MODE=dev` in prod |
| **Refresh / device** | Routes proxied; `p1-auth-compat-verify` passed historically | Low on legacy path |
| **Audit** | `AuthAuditEvent`, `auth-audit.service.ts` | Partial coverage |
| **Rate limit** | Foundation presets exist (`AUTH_OTP_REQUEST`, `AUTH_LOGIN`) | **P1** — not applied to legacy OTP/login routes |

**Findings:** Auth works on legacy path (verified Phase 1–3). Foundation `/api/auth/*` coexists. Production risk is **configuration** (OTP mode, debug panel) not missing auth code.

### 2.2 Env

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Backend validation** | Zod `config.schema.ts` + `env.validation.ts` + `npm run env:validate` | **Good** |
| **Production rules** | JWT secrets min 32 chars; reject `CHANGE_ME` in production | **Good** |
| **Redis optional** | `REDIS_ENABLED=false` — OTP/cache/queues off | **P1** in prod if disabled |
| **Web env** | `.env.example` 169+ lines; `BACKEND_URL`, `NEXT_PUBLIC_API_URL` | **P2** — no Zod loader on web |
| **Dual compose defaults** | Backend `pranidoctor_dev_password`; web compose separate | **P2** — dev miswire |
| **Skip validation** | `SKIP_STARTUP_VALIDATION=true` supported | **P1** if used in prod |

### 2.3 Secret

| Aspect | Current state | Risk |
|--------|---------------|------|
| **JWT secrets** | Separate admin/mobile/doctor/technician/refresh | **Good** design |
| **Storage keys** | S3/MinIO via env; validated when driver ≠ disabled | **Medium** if `disabled` in prod uploads |
| **Gitignore** | `.env` ignored; `.env.example` committed (backend) | **Good** |
| **Logging** | Pino sanitizer redacts password/token/otp keys | **Good** on backend |
| **OTP dev log** | In-memory store readable by admin debug route | **P1** in non-prod leaks; **P0** if panel enabled in prod |
| **Flutter** | Secrets via secure storage; OAuth keys in platform config (doc) | **P3** — Firebase not fully configured |

### 2.4 Upload

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Legacy path (live)** | `/api/mobile/uploads`, `/api/admin/uploads`, profile/cover images | **Working** via `legacy/web/lib/storage/upload-service.ts` |
| **Validation** | MIME sniff, dangerous extension block, purpose-based size limits, Sharp processing | **Good** on legacy |
| **Foundation path** | `media.validation.ts` strong rules | **N/A** — controller returns 503 |
| **Rate limit** | `rateLimitUpload` on foundation media routes only | **P1** — legacy uploads unlimited by shared middleware |

### 2.5 Storage

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Drivers** | `disabled` \| `local` \| `minio` \| `s3` | Config-driven |
| **Default** | `STORAGE_DRIVER=disabled` in schema default | **P1** if prod uploads expected without config |
| **MinIO** | Both composes provision MinIO; init bucket job | **Good** for dev |
| **Signed URLs** | `upload-download.ts`, expiry via config | Legacy path OK |
| **Production** | S3-compatible documented | **P2** — no IaC for prod bucket policy |

### 2.6 Validation

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Foundation modules** | Zod validators per module (`*.validator.ts`) | **Good** where routes wired |
| **Legacy routes** | Mixed Zod + hand-rolled schemas in `legacy/web/lib` | **P2** — inconsistent |
| **Upload** | Buffer sniff + declared MIME cross-check | **Good** (legacy + media.validation) |
| **Proxy layer** | Web proxies pass body through unchanged | Validation must happen on backend — OK if backend reached |

### 2.7 Logging

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Backend** | Pino structured JSON; request context (requestId, traceId); sanitizer | **Good** |
| **Legacy** | Some `console.warn` / `console.info` (OTP dev, SMS placeholder) | **P2** — bypasses structured logger |
| **Web** | No equivalent centralized logger for API routes | **P2** — proxy-only, low volume |
| **Audit trail** | Auth audit events; service-instance audit | **P2** — not platform-wide |

### 2.8 Monitoring

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Health probes** | Backend `/health`, `/health/db`, `/ready`; web composite `/api/health` | **Good** basics |
| **Metrics** | `MONITORING.md` describes Prometheus/Grafana stack | **P2** — **not in repo** |
| **Tracing** | `X-Request-Id`, `X-Trace-Id` headers | Partial |
| **Alerting** | Documented in devops docs | **Not implemented** |
| **Error monitoring** | `ERROR_STANDARD.md` references monitoring | No Sentry integration |

### 2.9 Backup

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Strategy doc** | `docs/devops/BACKUP_STRATEGY.md` — 3-2-1, hourly DB, daily MinIO | Comprehensive on paper |
| **Automation** | Queue job name `backup` in queue strategy doc | **No scripts/cron in repos** |
| **Manual backups** | `pranidoctor-web/backups/`, location CSV backups | Ad hoc |
| **Restore testing** | Documented procedure | **P0** — no evidence of execution |
| **RPO/RTO** | 1h / 4h claimed for PostgreSQL | **P0** without automation |

### 2.10 Deploy

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Backend Docker** | Multi-stage Dockerfile, non-root user, healthcheck | **Good** skeleton |
| **Backend compose** | `production` profile for API service | **P0** — image missing legacy routes |
| **Web deploy** | No container; `next build` / `next start` assumed | **P1** — no standardized prod manifest |
| **Database migrate** | `prisma migrate deploy` documented | Manual; guarded on backend mirror |
| **Cutover state** | `CUTOVER_DEFER_PLAN.md` vs `ARCHITECTURE_FREEZE.md` conflict | **P2** — ops confusion on prod owner |

### 2.11 Release

| Aspect | Current state | Risk |
|--------|---------------|------|
| **Versioning** | `APP_VERSION` env; package.json semver | No release tags observed |
| **Git history** | Commits: "Initial upload" while tree is Phase 1–3 | **P3** — traceability |
| **OpenAPI sync** | `npm run openapi:generate` (backend) | Manual step in freeze workflow |
| **Phase gates** | `p2:verify`, `p3:verify`, `e2e:freeze` | **Manual** — not in CI |
| **Mobile release** | No Fastlane/store config | **P2** |

---

## 3. Consolidated risk register

| ID | Sev | Category | Title | Impact |
|----|-----|----------|-------|--------|
| R-001 | **P0** | Deploy | Legacy API absent from production Docker artifact | Total API failure in container deploy |
| R-002 | **P0** | Release | No CI/CD in any repository | Undetected regressions; no automated gates |
| R-003 | **P0** | Backup | Backup strategy documented but not automated | Data loss beyond RPO |
| R-004 | **P0** | Auth | OTP dev mode can expose codes in prod logs | Account takeover / OTP bypass perception |
| R-005 | **P0** | Ops | Documentation conflict: cutover defer vs architecture freeze | Wrong prod owner decisions |
| R-006 | **P0** | Env | `REDIS_ENABLED=false` disables OTP/session/queues silently | Auth degradation in prod |
| R-007 | P1 | Security | Legacy `/api/*` without rate limiting | Brute force / abuse |
| R-008 | P1 | Broken module | Foundation stubs callable (`/api/ai`, `/api/clinics`, etc.) | 500 errors for misrouted clients |
| R-009 | P1 | Duplicate | 178 + 175 mirrored lib files | Fix drift, security patches missed |
| R-010 | P1 | Payment | No payment gateway | Revenue / reconciliation manual |
| R-011 | P1 | Notification | SMS/push not implemented in foundation | Alerts not delivered |
| R-012 | P1 | Upload | Legacy upload path lacks shared rate limit | Storage abuse |
| R-013 | P1 | Deploy | No web production container / manifest | Inconsistent web deploys |
| R-014 | P1 | Secret | Storage default `disabled` | Upload failures in prod |
| R-015 | P1 | Mobile | Flutter not wired; not in git | Customer app untraceable |
| R-016 | P2 | Dead code | archive/web-deprecated + _archived_foundation | Repo bloat, confusion |
| R-017 | P2 | Test | Legacy Vitest `@/` failures | No unit safety net |
| R-018 | P2 | Monitoring | Prometheus/Grafana docs-only | Blind prod failures |
| R-019 | P2 | Security | CSP disabled via Helmet | XSS impact surface |
| R-020 | P2 | Worker | BullMQ worker not in compose prod profile | Async jobs not running |
| R-021 | P2 | Logging | Legacy console OTP/SMS logs | Unsanitized sensitive output |
| R-022 | P2 | Media | Foundation `/api/media` 503 | Broken if clients use foundation path |
| R-023 | P3 | Dead code | Unreferenced web geo-resolve | Minor clutter |
| R-024 | P3 | Git | Initial commit messages vs actual scope | Audit/compliance traceability |
| R-025 | P3 | Auth | Flutter dev-token placeholder | Dev-only risk |

---

## 4. Priority matrix

```
IMPACT ↑
  HIGH  │ R-001 R-002 R-003 R-004  │ R-007 R-009 R-010
        │ R-005 R-006              │ R-015
  MED   │ R-008 R-011              │ R-017 R-018 R-019
        │                          │ R-013 R-014
  LOW   │                          │ R-016 R-023 R-024
        └──────────────────────────┴────────────────────→ LIKELIHOOD
              HIGH                      MED           LOW
```

---

## 5. Production readiness checklist (observed)

| Area | Ready? | Blocker |
|------|--------|---------|
| Auth (legacy path) | **Conditional** | OTP_MODE, Redis, rate limits |
| API (legacy path, tsx) | **Yes** (dev verified) | Not in Docker prod |
| API (Docker prod) | **No** | R-001 |
| Web proxy layer | **Yes** | Dual-hop; no CI |
| Uploads (legacy) | **Conditional** | STORAGE_DRIVER, rate limits |
| Payments | **No** | R-010 |
| Notifications delivery | **Partial** | In-app OK; SMS/push not |
| Monitoring | **No** | R-018 |
| Backup/restore | **No** | R-003 |
| Automated release | **No** | R-002, R-007 |

---

## 6. Positive controls (existing)

| Control | Location | Notes |
|---------|----------|-------|
| JWT secret validation (prod) | `config.schema.ts` | Min length + no CHANGE_ME |
| Log redaction | `shared/logger/sanitizer.ts` | password, token, otp fields |
| Upload MIME sniff + blocklist | `mime-sniff.ts`, `upload-service.ts` | Legacy path |
| Web Prisma guard | `web/src/lib/prisma.ts` | Throws on direct DB access |
| Phase verification scripts | `scripts/p2-verify.ts`, `p3-verify.ts` | Manual but thorough |
| Helmet + CORS + compression | `app.ts` | CSP off is exception |
| Docker non-root user | `docker/Dockerfile` | `appuser` |
| Startup validation | `validate-startup.ts` | DB/Redis/storage checks |

---

## 7. Related documents

| Document | Relevance |
|----------|-----------|
| [02_ARCHITECTURE_AUDIT.md](./02_ARCHITECTURE_AUDIT.md) | Dual stack, coupling, drift |
| [03_FEATURE_MATRIX.md](./03_FEATURE_MATRIX.md) | Module-level gaps |
| [../ARCHITECTURE_FREEZE.md](../ARCHITECTURE_FREEZE.md) | Target backend-first policy |
| [../CUTOVER_DEFER_PLAN.md](../CUTOVER_DEFER_PLAN.md) | Conflicts with freeze (web-as-prod) |
| [../devops/BACKUP_STRATEGY.md](../devops/BACKUP_STRATEGY.md) | Unimplemented backup design |
| [../devops/MONITORING.md](../devops/MONITORING.md) | Unimplemented monitoring design |
| [../PHASE1_FINAL_FREEZE_CERTIFICATE.md](../PHASE1_FINAL_FREEZE_CERTIFICATE.md) | Foundation repo stubs noted |

---

## Output block

```
TECHNICAL_AUDIT_COMPLETE
```
