# PRODUCTION CERTIFICATE — Prani Doctor Platform

**Document type:** Production Readiness Assessment (evidence-based review only)  
**Review board role:** Production Readiness Review Board  
**Assessment date:** **2026-05-21**  
**Policy:** No feature development · No architecture redesign · Assessment only

---

## SECTION 1 — CERTIFICATION HEADER

| Field | Value |
|-------|-------|
| **Project** | Prani Doctor Platform |
| **Version** | Backend `1.0.0` · Web `0.1.0` · Mobile `1.0.0+1` |
| **Freeze version** | `P3-SNAPSHOT-20260521` (`PROJECT_FROZEN=YES`) |
| **Assessment date** | 2026-05-21 |

### Decision

| Field | Value |
|-------|-------|
| **Readiness decision** | **NOT_READY** |
| **Confidence** | **88 / 100** |

**Rationale (evidence):** [MASTER_AUDIT.md](./MASTER_AUDIT.md) records **readiness 42/100**, **risk 72/100**, and **six P0 open risks**. [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) explicitly states **`FROZEN_AS_IMPLEMENTED — not production-ready`**. Post-freeze phase work (P5–P8) adds modules and unit-test gates but does **not** close P0 deploy, CI/CD, backup, or load-test gaps documented in [audit/04_TECHNICAL_RISK.md](./audit/04_TECHNICAL_RISK.md).

### Evidence sources reviewed

| Source | Status |
|--------|--------|
| [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) | Read |
| [MASTER_AUDIT.md](./MASTER_AUDIT.md) | Read |
| [audit/04_TECHNICAL_RISK.md](./audit/04_TECHNICAL_RISK.md) | Read |
| [PHASE1_PLAN.md](./PHASE1_PLAN.md) · [PHASE1_IMPLEMENTATION.md](./PHASE1_IMPLEMENTATION.md) | Read |
| [PHASE2_AUTH.md](./PHASE2_AUTH.md) · [PHASE2_AREA.md](./PHASE2_AREA.md) · [PHASE2_AREA_IMPLEMENTATION.md](./PHASE2_AREA_IMPLEMENTATION.md) | Read |
| [PHASE3_DOCTOR.md](./PHASE3_DOCTOR.md) | **NOT FOUND** in repo |
| [PHASE4_CASE.md](./PHASE4_CASE.md) · [PHASE4_CASE_IMPLEMENTATION.md](./PHASE4_CASE_IMPLEMENTATION.md) | **NOT FOUND** in repo (P3/P5 docs used instead) |
| [PHASE5_TREATMENT.md](./PHASE5_TREATMENT.md) · [PHASE5_TREATMENT_IMPLEMENTATION.md](./PHASE5_TREATMENT_IMPLEMENTATION.md) | Read |
| [PHASE6_AI.md](./PHASE6_AI.md) · [PHASE6_AI_IMPLEMENTATION.md](./PHASE6_AI_IMPLEMENTATION.md) | Read |
| [PHASE7_VOICE.md](./PHASE7_VOICE.md) · [PHASE7_VOICE_IMPLEMENTATION.md](./PHASE7_VOICE_IMPLEMENTATION.md) | Read |
| [PHASE8_OFFLINE.md](./PHASE8_OFFLINE.md) · [PHASE8_OFFLINE_IMPLEMENTATION.md](./PHASE8_OFFLINE_IMPLEMENTATION.md) | Read |
| [HEALTHCHECKS.md](./HEALTHCHECKS.md) · [devops/BACKUP_STRATEGY.md](./devops/BACKUP_STRATEGY.md) · [devops/MONITORING.md](./devops/MONITORING.md) | Read |
| `pranidoctor-backend/docker/Dockerfile`, `docker/README.md`, `tsconfig.build.json` | Inspected |
| Backend build (2026-05-21) | `npm run build` → **PASS** |

---

## SECTION 2 — SECURITY REVIEW

Legend: **PASS** = verified working with cited evidence · **FAIL** = documented gap or failed gate · **UNKNOWN** = not measured or insufficient evidence

| Control | Status | Evidence |
|---------|--------|----------|
| Authentication | **PASS** (dev path) | P1 frozen; `p2:verify` 13/13, `p3:verify` 17/17 at freeze ([PROJECT_FREEZE.md](./PROJECT_FREEZE.md) §1) |
| Authorization | **PARTIAL → FAIL** (prod breadth) | Narrow RBAC matrix; `permissions.registry.ts` admin caps only ([audit/04 §2.1 SG-06](audit/04_TECHNICAL_RISK.md)) |
| Session controls | **PASS** (legacy path) | Refresh/device/session audit migrations P1; `p1-auth-compat` gates historically passed |
| Secret handling | **PARTIAL** | Zod env validation + JWT min 32 chars in prod ([PHASE1_IMPLEMENTATION.md](./PHASE1_IMPLEMENTATION.md)); Pino sanitizer tests redact password/otp ([`sanitizer.test.ts`](../pranidoctor-backend/src/shared/logger/sanitizer.test.ts)) |
| Env separation | **PARTIAL** | Backend Zod loader good; web lacks Zod env loader ([audit/04 §2.2](audit/04_TECHNICAL_RISK.md)); dual compose defaults |
| Rate limiting | **FAIL** | Middleware exists (`rate-limit.service.ts`) but **no** `rateLimit*` in `src/legacy/**` ([audit/04 SG-02](audit/04_TECHNICAL_RISK.md)); legacy = primary traffic |
| Audit logs | **PARTIAL** | `AuthAuditEvent`, AI safety audit, offline conflict records exist; full resource audit matrix **UNKNOWN** |
| AI safety | **PASS** (unit scope) | `ai-veterinary-core` refuses diagnosis patterns; 11/11 tests; no autonomous diagnosis in module metadata ([PHASE6_AI_IMPLEMENTATION.md](./PHASE6_AI_IMPLEMENTATION.md)) |
| Media upload | **PARTIAL** | Legacy upload path with MIME/sharp validation ([audit/04 §2.4](audit/04_TECHNICAL_RISK.md)); foundation `/api/media` returns **503** |
| Storage security | **PARTIAL** | S3/MinIO via env; `STORAGE` default disabled risk R-014; upload rate limit on foundation only |
| Input validation | **PARTIAL** | Zod on foundation controllers (P5–P8); legacy routes validation coverage **UNKNOWN** per route |
| Dependency exposure | **PARTIAL** | Lockfiles present; **no CI** to enforce `npm ci`; DEPENDENCY_FROZEN policy documented |

### Findings by severity

| Severity | ID | Finding | Evidence |
|----------|-----|---------|----------|
| **Critical** | SEC-C01 | OTP dev mode can expose codes in production logs | R-004; `OTP_MODE` dev default; warn-only guard ([audit/04 SG-01](audit/04_TECHNICAL_RISK.md)) |
| **Critical** | SEC-C02 | Production Docker artifact missing 179 legacy API routes | R-001; `tsconfig.build.json` excludes `src/legacy/**`; `docker/README.md` documents gap |
| **High** | SEC-H01 | Legacy primary routes without rate limiting | R-007; grep: no `rateLimit` in `src/legacy/**` |
| **High** | SEC-H02 | OTP debug admin panel in non-prod | R-004 related; `GET /api/admin/dev-tools/otp-logs` ([audit/04 SG-03](audit/04_TECHNICAL_RISK.md)) |
| **High** | SEC-H03 | Helmet CSP disabled | `app.ts` `contentSecurityPolicy: false` ([audit/04 SG-04](audit/04_TECHNICAL_RISK.md)) |
| **High** | SEC-H04 | Flutter placeholder dev tokens | R-025; `SessionController.signInDevPlaceholder()` |
| **Medium** | SEC-M01 | Mobile app not in git | R-015; supply-chain and release traceability gap |
| **Medium** | SEC-M02 | SMS provider placeholder / skipped sends | R-011; foundation notification stubs |
| **Low** | SEC-L01 | Flutter secure storage documented but OAuth not fully wired | [MASTER_APP_ARCHITECTURE_PLAN.md](../pranidoctor_user/docs/MASTER_APP_ARCHITECTURE_PLAN.md) |

---

## SECTION 3 — PERFORMANCE REVIEW

**Note:** No load-test artifacts, APM traces, or production latency samples were found in repository. Targets below are **documented aspirations** unless Observed/Evidence state otherwise.

| Area | Target | Observed | Evidence | Status |
|------|--------|----------|----------|--------|
| API latency (p95) | Pilot p95 per [CUTOVER_DEFER_PLAN.md](./CUTOVER_DEFER_PLAN.md) | **UNKNOWN** | No k6/locust/artillery results in repo | **UNKNOWN** |
| Cold start (API container) | Docker HEALTHCHECK 30s start-period | Image boots; legacy routes absent in prod | `docker/Dockerfile` HEALTHCHECK; R-001 | **FAIL** (functional) |
| Cache (Redis) | Area engine TTL cache | Unit tests pass when Redis optional | [PHASE2_AREA_IMPLEMENTATION.md](./PHASE2_AREA_IMPLEMENTATION.md); `REDIS_ENABLED=false` degrades | **PARTIAL** |
| Redis (OTP/queues) | Required in prod | Optional; silences OTP/queues when off | R-006 ([PROJECT_FREEZE.md](./PROJECT_FREEZE.md) debt) | **FAIL** (prod config) |
| Queue (BullMQ) | Worker for async jobs | `worker.ts` exists; not in compose prod profile | R-020 | **PARTIAL** |
| DB access | Indexed FK queries | Prisma indexes on frozen models | `schema.prisma` | **PASS** (design); query perf **UNKNOWN** |
| Flutter startup | Low-end Android | **UNKNOWN** | No startup benchmark in repo | **UNKNOWN** |
| Offline sync | Batch ≤25; backoff 30s–1h | 14/14 unit tests | [PHASE8_OFFLINE_IMPLEMENTATION.md](./PHASE8_OFFLINE_IMPLEMENTATION.md) | **PASS** (unit); prod **UNKNOWN** |
| Voice bandwidth | TRANSCRIPT_ONLY for 2G | Modes defined; no field metrics | [PHASE7_VOICE_IMPLEMENTATION.md](./PHASE7_VOICE_IMPLEMENTATION.md) | **UNKNOWN** (runtime) |
| Memory | Container limits | **UNKNOWN** | No prod memory profiling | **UNKNOWN** |

---

## SECTION 4 — MONITORING REVIEW

| Capability | Classification | Evidence |
|------------|----------------|----------|
| Health checks | **implemented** | `/health`, `/ready`, `/live`, `/health/db`, `/health/redis`, `/health/storage`, `/health/modules` ([HEALTHCHECKS.md](./HEALTHCHECKS.md); `src/api/health/`) |
| Logging | **partial** | Pino JSON + sanitizer tests; Docker log aggregation **documented** in MONITORING.md, not wired in repo |
| Alerts | **missing** | Slack/UptimeRobot in [MONITORING.md](./devops/MONITORING.md) — design doc only; no alert config in repo |
| Metrics | **missing** | Prometheus/Grafana in MONITORING.md Phase 2 — **no** `/metrics` or Prometheus client in backend grep |
| Tracing | **missing** | No OpenTelemetry/Jaeger references in application code |
| Error tracking | **missing** | No Sentry/Datadog integration ([audit/04 MP-08](audit/04_TECHNICAL_RISK.md)) |
| Uptime | **missing** | External uptime monitors documented, not configured in repo |
| Dashboard | **partial** | Admin billing aggregates only; no AnalyticsService ([PROJECT_FREEZE.md](./PROJECT_FREEZE.md) §2) |

**Readiness score component (audit):** Monitoring **15/100** ([MASTER_AUDIT.md](./MASTER_AUDIT.md) §F).

---

## SECTION 5 — BACKUP & RECOVERY

| Item | Status | Evidence |
|------|--------|----------|
| Database backup | **missing** (automation) | [BACKUP_STRATEGY.md](./devops/BACKUP_STRATEGY.md) defines cron + scripts; **no** `backup*.sh` in any repo path searched |
| Restore drill | **UNKNOWN** | Documented procedure only; no drill log in repo |
| Media backup | **missing** (automation) | MinIO backup scripts referenced in docs path `/opt/pranidoctor/scripts/` — not in git |
| Configuration backup | **missing** (automation) | Same as above |
| Seed recovery | **partial** | `prisma/seed*.ts` exist; prod seed policy non-prod unless approved ([PROJECT_FREEZE.md](./PROJECT_FREEZE.md) §7.4) |
| Rollback | **partial** | Forward-fix migration policy; standardized rollback SQL **UNKNOWN** ([PROJECT_FREEZE.md](./PROJECT_FREEZE.md) §7.3) |

| Metric | Documented target | Verified in ops |
|--------|-------------------|-----------------|
| **RPO** | 1 hour (PostgreSQL per BACKUP_STRATEGY §1.2) | **UNKNOWN** — automation not deployed |
| **RTO** | 4 hours (PostgreSQL per BACKUP_STRATEGY §1.2) | **UNKNOWN** — no restore drill evidence |

**Readiness score component (audit):** Backup **10/100** ([MASTER_AUDIT.md](./MASTER_AUDIT.md) §F).

---

## SECTION 6 — LOAD TEST REVIEW

**Verdict:** No production load-test evidence found. [PHASE1_FREEZE_CERTIFICATE.md](./PHASE1_FREEZE_CERTIFICATE.md) explicitly lists load tests as **NOT RUN**. [CUTOVER_DEFER_PLAN.md](./CUTOVER_DEFER_PLAN.md) checklist item unchecked.

| Scenario | Peak | Result | Evidence |
|----------|------|--------|----------|
| Auth (OTP/login) | **UNKNOWN** | **NOT RUN** | No load-test scripts or reports |
| Case creation (P3 pipeline) | **UNKNOWN** | **NOT RUN** | `p3:verify` = functional unit/integration gate only (17/17 at freeze) |
| Voice (STT/chat) | **UNKNOWN** | **NOT RUN** | 13/13 unit tests ([PHASE7_VOICE_IMPLEMENTATION.md](./PHASE7_VOICE_IMPLEMENTATION.md)) |
| AI (chat/triage) | **UNKNOWN** | **NOT RUN** | 11/11 unit tests ([PHASE6_AI_IMPLEMENTATION.md](./PHASE6_AI_IMPLEMENTATION.md)) |
| Offline sync | **UNKNOWN** | **NOT RUN** | 14/14 unit tests ([PHASE8_OFFLINE_IMPLEMENTATION.md](./PHASE8_OFFLINE_IMPLEMENTATION.md)) |

---

## SECTION 7 — OPERATIONS READINESS

| Area | Status | Evidence |
|------|--------|----------|
| Docker | **partial** | `docker-compose.yml` for Postgres/Redis/MinIO; API Dockerfile exists |
| Deploy | **FAIL** (prod parity) | R-001: prod image lacks legacy routes; `docker/README.md` **BLOCKED** note |
| Env | **partial** | `npm run env:validate`; `SKIP_STARTUP_VALIDATION` escape hatch (R-006 risk if misused) |
| Migration | **partial** | 30 migration folders on filesystem (P5–P8 additive); deploy via `db:migrate:deploy`; prod apply status **UNKNOWN** |
| Release | **missing** | No CI/CD, changelog, or release workflow (R-002, R-007) |
| Rollback | **partial** | Forward-fix policy; no automated rollback pipeline |
| Observability | **missing** | See Section 4 |

### Verification gates (development path — not production deploy)

| Gate | Last cited result | Scope |
|------|-------------------|-------|
| `npm run build` | **PASS** (2026-05-21 assessment) | Typecheck + compile |
| `p2:verify` | 13/13 (freeze snapshot) | P2 regression |
| `p3:verify` | 17/17 (freeze snapshot) | P3 regression |
| `e2e:freeze` | 8/9 (freeze snapshot) | Requires web on `:3001` |
| `area:verify` | 10/10 ([PHASE2_AREA_IMPLEMENTATION.md](./PHASE2_AREA_IMPLEMENTATION.md)) | Area engine |
| `treatment:verify` | 8/8 ([PHASE5_TREATMENT_IMPLEMENTATION.md](./PHASE5_TREATMENT_IMPLEMENTATION.md)) | Treatment workflow |
| `ai:verify` | 8/8 ([PHASE6_AI_IMPLEMENTATION.md](./PHASE6_AI_IMPLEMENTATION.md)) | AI core |
| `voice:verify` | 8/8 ([PHASE7_VOICE_IMPLEMENTATION.md](./PHASE7_VOICE_IMPLEMENTATION.md)) | Voice layer |
| `offline:verify` | 10/10 ([PHASE8_OFFLINE_IMPLEMENTATION.md](./PHASE8_OFFLINE_IMPLEMENTATION.md)) | Offline architecture |
| `flutter analyze` | PASS (freeze snapshot) | Mobile static analysis only |

---

## SECTION 8 — GO LIVE BLOCKERS

| BLOCKER_ID | Severity | Description | Fix path |
|------------|----------|-------------|----------|
| **GL-001** | P0 | Legacy API (179 routes) not in production Docker artifact | Phase 4.B: compile/bundle legacy into `dist/` or ship `src/legacy` in image ([docker/README.md](../pranidoctor-backend/docker/README.md)) |
| **GL-002** | P0 | No CI/CD in any repository | Phase 4.C: GitHub Actions with build + verify gates ([audit/05_EXECUTION_PLAN.md](./audit/05_EXECUTION_PLAN.md)) |
| **GL-003** | P0 | Backup strategy documented; automation not in repo | Phase 4.D: implement + schedule backup scripts; offsite sync; restore drill ([BACKUP_STRATEGY.md](./devops/BACKUP_STRATEGY.md)) |
| **GL-004** | P0 | OTP dev mode / prod misconfiguration risk | Phase 4.E: fail startup if `OTP_MODE=dev` in production (R-004) |
| **GL-005** | P0 | Redis optional silences OTP/queues | Phase 4.E: require Redis in production (R-006) |
| **GL-006** | P0 | Ops doc conflict: architecture freeze vs cutover defer | Phase 4.A: single ops authority doc (R-005) |
| **GL-007** | P1 | No payment gateway | Documented Phase 10 scope (R-010) |
| **GL-008** | P1 | SMS/push not live | Phase 9 scope (R-011) |
| **GL-009** | P1 | Mobile app not wired to API; not in git | Phase 8 mobile integration (R-015) |
| **GL-010** | P1 | Legacy routes without rate limiting | Phase 5.A security hardening (R-007) |
| **GL-011** | P1 | No web production container | Phase 7.A (R-013) |
| **GL-012** | P2 | No load-test evidence for auth/case/voice/AI/sync | Execute load tests per [CUTOVER_DEFER_PLAN.md](./CUTOVER_DEFER_PLAN.md); publish results |
| **GL-013** | P2 | Monitoring/alerting design only | Deploy Phase 1 monitoring from [MONITORING.md](./devops/MONITORING.md) or equivalent |
| **GL-014** | P2 | P8 offline + P7 voice + P6 AI not proven end-to-end on mobile | Wire Flutter contracts; field test on 2G/3G |

---

## SECTION 9 — CERTIFICATE

### Issued certificate

```
CERTIFICATION_DENIED
```

### Reasons

1. **Six P0 risks remain open** per [MASTER_AUDIT.md](./MASTER_AUDIT.md) and [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) debt register (R-001–R-006).
2. **Production deploy path ≠ verified dev path** — container cannot serve primary legacy API (R-001; confirmed in `docker/README.md` and `tsconfig.build.json`).
3. **No automated backup or verified restore** (R-003; no backup scripts in repository).
4. **No CI/CD** — release quality depends on manual runs (R-002).
5. **No load-test evidence** for auth, case, voice, AI, or offline sync under peak traffic.
6. **Monitoring and alerting not implemented** in code or infrastructure configs (MP-08; audit monitoring score 15/100).
7. **Customer mobile app not production-integrated** (R-015) — P5–P8 Flutter artifacts are contracts only.
8. **Freeze baseline explicitly disclaims production readiness** (readiness **42/100**).

**Conditional certification is not issued** because P0 blockers affect data integrity, availability, and authentication safety in a production deployment.

---

## SECTION 10 — NEXT ACTIONS

### Immediate (before any production traffic)

1. Resolve **GL-001** — ship legacy API in production artifact or formally cut over 100% traffic to a compiled compat bundle.
2. Resolve **GL-004** and **GL-005** — production env guardrails for OTP mode and Redis.
3. Implement **GL-003** — automated PostgreSQL + media backups with documented restore drill.
4. Stand up **GL-002** — CI pipeline running `build`, `p2:verify`, `p3:verify`, and phase verify scripts.

### Before Beta (limited external users)

1. Apply **GL-010** — rate limits on legacy auth/upload routes.
2. Deploy minimal monitoring (**GL-013**) — health/uptime + log aggregation + alert on `/health` unhealthy.
3. Execute **GL-012** — load tests for OTP auth and service-request creation; publish p95/p99.
4. Wire mobile app to backend (**GL-014**) — replace placeholder auth; exercise offline sync on weak networks.
5. Run **`e2e:freeze` 9/9** with web proxy consistently up.

### Before Public Launch

1. Payment gateway (**GL-007**) if monetization required.
2. SMS/push delivery (**GL-008**) for OTP and notifications in production.
3. Web production container (**GL-011**) if web is customer-facing entry.
4. Full observability stack (metrics, error tracking, tracing) per growth phase in MONITORING.md.
5. Security review closure — CSP, RBAC breadth, penetration test (**UNKNOWN** today).
6. Re-run this certificate after P4 production gate completion.

---

## APPENDIX — Phase capability vs production proof

| Phase | Module | Unit/verify evidence | Production proof |
|-------|--------|----------------------|------------------|
| P1–P3 | Auth, area, care pipeline | p2/p3 verify PASS at freeze | Legacy path only; Docker prod **FAIL** |
| P5 | Treatment workflow | 17/17 tests; treatment:verify 8/8 | Doctor auth path; no load test |
| P6 | AI veterinary core | 11/11 tests; ai:verify 8/8 | Rules-based adapter; no LLM prod SLA |
| P7 | Voice assistant | 13/13 tests; voice:verify 8/8 | No STT/TTS provider; metadata-only audio |
| P8 | Offline architecture | 14/14 tests; offline:verify 10/10 | Server sync API; Flutter not wired |

---

## FINAL OUTPUT

```
PRODUCTION_NOT_READY
```

**Signed assessment:** Production Readiness Review Board  
**Date:** 2026-05-21  
**Evidence rule applied:** Unknown → UNKNOWN · No unsupported claims · No implementation performed

---

PRODUCTION_CERTIFICATE_COMPLETE
