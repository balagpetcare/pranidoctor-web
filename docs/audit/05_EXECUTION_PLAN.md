# Execution Plan — Prani Doctor (Post-Audit)

**Plan date:** 2026-05-21  
**Author role:** Principal Delivery Architect  
**Inputs:** [01_REPOSITORY_INVENTORY.md](./01_REPOSITORY_INVENTORY.md), [02_ARCHITECTURE_AUDIT.md](./02_ARCHITECTURE_AUDIT.md), [03_FEATURE_MATRIX.md](./03_FEATURE_MATRIX.md), [04_TECHNICAL_RISK.md](./04_TECHNICAL_RISK.md)  
**Constraint:** **No redesign** — extend frozen P1–P3 patterns (legacy compat routes, module services, web proxy, `{ ok, data }` envelope). Do not rewrite auth/session/device or Prisma ownership.

---

## Executive summary

| Item | Value |
|------|-------|
| **Completed phases** | P1 Auth · P2 Profile/Area · P3 Care pipeline (`P3_PASS=YES`, `PHASE4_READY=YES`) |
| **Next phase** | **Phase 4 — Production gate** (all P0 technical risks) |
| **Critical path** | P4 → P5 → P6 → P7 → **P8 Mobile** → P9 Commerce |
| **Estimated calendar** (single squad, sequential) | **~6–9 months** to mobile MVP + prod ops; **12+ months** to ERD Phase 3+ domains |
| **Platform coverage today** | ~38% weighted / ~65% admin-doctor workflow |

**Delivery principle:** Ship **production-safe backend artifact + CI + backups** before new product features. Keep **legacy compat** as the live API until Docker and CI prove parity; then reduce dual-hop and duplicate libs incrementally.

---

## Size estimate legend

| Size | Effort | Typical scope |
|------|--------|---------------|
| **XS** | ≤1 day | Config, docs, single script, env guard |
| **S** | 2–5 days | One route group, middleware, small module wiring |
| **M** | 1–2 weeks | Cross-repo feature, Docker/CI, provider integration scaffold |
| **L** | 2–4 weeks | Multi-module port, mobile feature slice, observability stack |
| **XL** | 1–2+ months | New domain (wallet, appointments, offline sync), PSP end-to-end |

---

## Recommended phase order

```
P1 Auth ──► P2 Profile/Area ──► P3 Care pipeline ──► [ YOU ARE HERE ]
                                                      │
                                                      ▼
                    ┌─────────────────────────────────────────────────────┐
                    │ P4 Production gate (P0)                              │
                    └──────────────────────────┬──────────────────────────┘
                                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │ P5 Security & env baseline (P1 security)             │
                    └──────────────────────────┬──────────────────────────┘
                                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │ P6 Foundation & test debt (stub modules, Vitest)     │
                    └──────────────────────────┬──────────────────────────┘
                                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │ P7 Deploy cutover & doc alignment                    │
                    └──────────────────────────┬──────────────────────────┘
                                               ▼
         ┌─────────────────────────────────────┴──────────────────────────┐
         ▼                                    ▼                          ▼
┌─────────────────┐              ┌─────────────────────┐    ┌──────────────────┐
│ P8 Farmer mobile │              │ P9 Notifications     │    │ P10 Commerce     │
│ (Flutter ↔ API)  │              │ (SMS / push / worker)│    │ (payment gateway)│
└────────┬─────────┘              └──────────┬───────────┘    └────────┬─────────┘
         │                                   │                         │
         └───────────────────┬───────────────┴─────────────────────────┘
                             ▼
              ┌──────────────────────────────────────────┐
              │ P11 Scheduling & consultation depth         │
              └──────────────────────┬─────────────────────┘
                                     ▼
              ┌──────────────────────────────────────────┐
              │ P12 Platform & ERD future (wallet, offline…) │
              └──────────────────────────────────────────┘
```

---

## Phase dependency graph

| Phase | Depends on | Blocks |
|-------|------------|--------|
| **P4** | P3 frozen | All prod deploys, CI truth |
| **P5** | P4 | Public/mobile exposure |
| **P6** | P4 (build stable) | Clean module boundaries |
| **P7** | P4, P5 | Standardized prod topology |
| **P8** | P4, P5, P7 (API URL stable) | Farmer MVP launch |
| **P9** | P4 (Redis/worker), P5 | OTP SMS live, push alerts |
| **P10** | P4, P7 | Revenue collection |
| **P11** | P3, P8 optional | Appointment product |
| **P12** | P8–P11 | ERD §15 domains |

**Parallelization allowed after P4:** P5 + P6 (different owners); P9 can start after P4 if Redis/worker ready; P8 can start after P4 env docs (API base URL) while P5 runs.

---

# Phase 4 — Production gate

**Goal:** Eliminate all **P0** risks (R-001–R-006). Backend Docker image serves **179 legacy routes**. CI runs build + phase gates. Backups executable. Prod env cannot start in unsafe OTP/Redis/storage config.

**Exit criteria:**

- `docker compose --profile production up` serves `/api/ping` + sample legacy route + `p3:verify` PASS
- GitHub Actions (or equivalent) green on `main`
- Backup script runs + documented restore drill once
- `OTP_MODE=live` enforced in production startup; `REDIS_ENABLED=true` required in prod schema refine

| Batch | Work | Risks addressed | Size | Repo |
|-------|------|-----------------|------|------|
| **4.A** | Reconcile ops docs: supersede `CUTOVER_DEFER_PLAN` with single **production owner** doc pointing to `ARCHITECTURE_FREEZE` | R-005 | **XS** | web/docs |
| **4.B** | Fix production artifact: ship `src/legacy/web/routes` + `lib` in Docker (compile to `.js` or bundle via `tsx`/esbuild); update `route-registry` to load `.js` in prod | R-001 | **M** | backend |
| **4.C** | CI pipeline: `npm run build`, `p2:verify`, `p3:verify`, `e2e:freeze` (services container), web `typecheck` | R-002 | **M** | backend + web |
| **4.D** | Backup scripts: `pg_dump` cron + MinIO sync stub per `BACKUP_STRATEGY.md`; restore runbook test | R-003 | **M** | backend/scripts |
| **4.E** | Prod env guards: fail startup if `OTP_MODE=dev`; require Redis in production; require `STORAGE_DRIVER≠disabled` when uploads enabled; document `.env.production` template | R-004, R-006, R-014 | **S** | backend |
| **4.F** | Add `p4-verify.ts`: Docker smoke + env guard matrix | — | **S** | backend |

**Dependencies:** P3 frozen (no breaking API changes during 4.B).

**Do not:** Change auth/session/device internals; alter `{ ok, data }` envelope.

---

# Phase 5 — Security & env baseline

**Goal:** Close **P1 security** gaps on the **live legacy path**. Harden abuse surfaces without architectural change.

**Exit criteria:**

- Compat router applies rate limits on auth, OTP, upload, global API
- Legacy OTP/login routes use existing `rateLimitOtpRequest`, `rateLimitLogin`, `rateLimitUpload` presets
- Foundation stub routes return **501 + clear code** (not 500) OR are unmounted until implemented
- `GET /api/admin/dev-tools/otp-logs` hard-disabled when `NODE_ENV=production`

| Batch | Work | Risks addressed | Size | Repo |
|-------|------|-----------------|------|------|
| **5.A** | Mount global + auth rate-limit middleware on `compat-web` router (before legacy handlers) | R-007 | **M** | backend |
| **5.B** | Apply upload rate limit to legacy `/api/*/uploads` routes | R-012 | **S** | backend |
| **5.C** | Foundation router guard: stub repositories → `501 NOT_IMPLEMENTED` at controller or unmount `/api/ai`, `/api/clinics`, `/api/animals` foundation paths that duplicate legacy | R-008 | **S** | backend |
| **5.D** | Replace legacy `console.*` OTP/SMS logs with Pino + sanitizer | R-021 | **S** | backend |
| **5.E** | Web env checklist: required `BACKEND_URL`, optional validation script mirroring backend | — | **XS** | web |

**Dependencies:** P4 (CI to catch regressions).

---

# Phase 6 — Foundation completion & test debt

**Goal:** Resolve **P1 broken foundation modules** and **P2 test debt** using **port-from-legacy** pattern (same as P3 lead/assignment). No new architecture.

**Exit criteria:**

- `notifications`, `animals` foundation repos delegate to legacy lib OR legacy-only documented
- `media` foundation controller calls existing `upload-service` (not 503)
- Legacy Vitest `@/` alias suites PASS or are quarantined with explicit list
- Phase 3 service modules optionally registered in OpenAPI (additive)

| Batch | Work | Risks addressed | Size | Repo |
|-------|------|-----------------|------|------|
| **6.A** | Wire `modules/notifications` repository to legacy `notification-service.ts` | R-008, R-011 partial | **M** | backend |
| **6.B** | Wire `modules/animals` repository to legacy `mobile-animals/animal-service.ts` | R-008 | **M** | backend |
| **6.C** | Port `media.controller` to legacy storage stack (`upload-service`, `upload-download`) | R-022 | **M** | backend |
| **6.D** | Defer `/api/ai/chat` foundation: explicit 501 + OpenAPI note; keep legacy AI technician untouched | R-008 | **XS** | backend |
| **6.E** | Fix Vitest `@/` for legacy suites OR move tests under `scripts/` integration | R-017 | **M** | backend |
| **6.F** | Register Phase 3 modules in `createAllModules()` **optional** — document-only if routes stay legacy-first | — | **S** | backend |

**Dependencies:** P5 stub guards; P4 CI.

**Do not:** Implement AI memory/orchestrator (ERD Phase 2+) in this phase.

---

# Phase 7 — Deploy cutover & duplicate reduction

**Goal:** Single **documented production topology**; reduce dual-hop and lib drift **incrementally** (not big-bang).

**Exit criteria:**

- Web production Dockerfile + compose profile (or platform manifest)
- `e2e:freeze` **9/9** in CI including web proxy on `:3001`
- OpenAPI + freeze docs show **179** routes (not 172)
- Web `src/lib/*` marked deprecated for domains ported to backend; admin UI uses `serverInternalFetch` / API only for 3 pilot domains

| Batch | Work | Risks addressed | Size | Repo |
|-------|------|-----------------|------|------|
| **7.A** | Next.js Dockerfile + healthcheck; env injection for `BACKEND_URL` | R-013 | **M** | web |
| **7.B** | CI job: start web `:3001` + backend `:3000`; full `e2e:freeze` | R-002 | **S** | both |
| **7.C** | Sync doc counts: `ARCHITECTURE_FREEZE`, `API_CONTRACT_FREEZE`, OpenAPI | R-005 | **XS** | web/docs |
| **7.D** | Add missing **3** web proxy routes to match backend timeline routes (if still absent) | — | **S** | web |
| **7.E** | Pilot dedup: stop importing web `src/lib` for service-requests in admin UI — API-only reads | R-009 partial | **L** | web |
| **7.F** | Unified dev compose: single Postgres/Redis/MinIO; deprecate web-only compose | DL-06 | **S** | backend + web |

**Dependencies:** P4 Docker legacy fix; P5 rate limits.

---

# Phase 8 — Farmer mobile (Flutter)

**Goal:** `pranidoctor_user` reaches **Farmer module ~75%+** — real auth, core flows against proxied API.

**Exit criteria:**

- Repo under git; CI `flutter analyze` + widget smoke
- Dio Bearer interceptor + refresh; `API_BASE_URL` → web or backend origin documented
- Flows: OTP login, me, animals list/create, service-request create, notifications list
- Remove dev placeholder sign-in from release builds

| Batch | Work | Feature module | Size | Repo |
|-------|------|----------------|------|------|
| **8.A** | Initialize git remote; CI analyze/test | Farmer | **XS** | user |
| **8.B** | `AuthRepository` → `/api/mobile/auth/otp/*`, register, refresh; session interceptor | Auth, Farmer | **M** | user |
| **8.C** | Home + animals feature repositories | Animal, Farmer | **M** | user |
| **8.D** | Service request create + list | Consultation, Farmer | **M** | user |
| **8.E** | Inbox/notifications read | Notification | **S** | user |
| **8.F** | `app_bn.arb` + locale switch aligned with profile `locale` | Localization | **M** | user |
| **8.G** | FCM token register API (depends P9.B) | Notification | **S** | user + backend |

**Dependencies:** P4, P5, P7 (stable API URL); P9.B for push optional in same release.

---

# Phase 9 — Notifications delivery & worker

**Goal:** **Notification module ~80%** — in-app (existing) + SMS OTP live + push scaffold.

**Exit criteria:**

- SMS provider configured (Bangladesh vendor); OTP dispatch uses live path in prod
- `sendPush` wired to FCM HTTP v1 or placeholder with queue
- `worker.ts` in compose production profile; BullMQ jobs for async SMS/push

| Batch | Work | Risks addressed | Size | Repo |
|-------|------|-----------------|------|------|
| **9.A** | Select + configure SMS provider; replace http-placeholder for OTP | R-011, SG-05 | **M** | backend |
| **9.B** | Device token register route + FCM send in worker | R-011, MP-05 | **M** | backend + user |
| **9.C** | Docker compose: `worker` service production profile | R-020 | **S** | backend |
| **9.D** | Notification templates for `REQUEST_UPDATE`, `PAYMENT` | Notification | **S** | backend |

**Dependencies:** P4 Redis required; P6 notifications port optional first.

---

# Phase 10 — Commerce (payment gateway)

**Goal:** **Payment module ~75%** — PSP capture for BKASH/NAGAD (or primary vendor) linked to existing `BillingRecord` / `PaymentRecord`.

**Exit criteria:**

- Initiate + webhook + reconcile flow documented in OpenAPI
- Doctor complete flow can record gateway-settled payment
- Admin billing UI shows gateway transaction id

| Batch | Work | Risks addressed | Size | Repo |
|-------|------|-----------------|------|------|
| **10.A** | PSP adapter interface + one live provider | R-010 | **XL** | backend |
| **10.B** | Webhook route + idempotent settlement on `PaymentRecord` | R-010 | **M** | backend |
| **10.C** | Admin reconciliation view (existing billing UI extend) | Payment | **M** | web |
| **10.D** | Mobile payment status on service-request (read-only) | Payment, Farmer | **S** | user |

**Dependencies:** P4, P7; legal/compliance sign-off on vendor.

**Do not:** Build wallet ledger (ERD §15) in P10 — separate P12 track.

---

# Phase 11 — Scheduling & consultation depth

**Goal:** **Consultation ~75%**, **Appointment ~40%** — extend `ServiceRequest` scheduling without full ERD appointment cluster initially.

**Exit criteria:**

- Admin/doctor scheduling UX for `scheduledStart/End`
- Notification types `APPOINTMENT_*` emitted
- Optional: minimal `Appointment` model if product requires slots (otherwise defer full cluster to P12)

| Batch | Work | Size | Repo |
|-------|------|------|------|
| **11.A** | Doctor availability API polish (existing fields) | **M** | backend + web |
| **11.B** | Customer booking UI on mobile (preferred time → request) | **M** | user |
| **11.C** | Appointment reminder jobs (worker) | **S** | backend |
| **11.D** | Evaluate ERD `Appointment` / slot models — schema additive migration only if approved | **L** | backend |

**Dependencies:** P3 workflow frozen; P9 notifications.

---

# Phase 12 — Platform & ERD future domains

**Goal:** Incremental delivery of **NOT_STARTED** modules per ERD §15 and feature matrix — **only after P8–P11 stable**.

| Track | Modules | Approach | Size |
|-------|---------|----------|------|
| **12.A Analytics** | Analytics | Event bus subscriber + admin reports beyond dashboard aggregates | **L** |
| **12.B Observability** | Monitoring | Deploy Prometheus/Grafana per `MONITORING.md`; health metrics | **L** |
| **12.C RBAC** | Roles | Extend `permissions.registry` per resource (no auth rewrite) | **L** |
| **12.D Wallet** | Wallet | Schema + ledger per ERD §15 | **XL** |
| **12.E Subscription** | Subscription | Plans + invoices per ERD | **XL** |
| **12.F Clinic** | Clinic | Prisma model + foundation module (greenfield) | **L** |
| **12.G Chat / telemedicine** | Chat, Consultation | ERD `ChatConversation` / video gateway | **XL** |
| **12.H Offline** | Offline | Sync models + Flutter queue (incremental per mobile plan) | **XL** |
| **12.I Cleanup** | Dead code | Remove `archive/web-deprecated` after soak sign-off | **S** |
| **12.J AI foundation** | AI | AiConversation persistence + provider orchestrator | **XL** |

**Dependencies:** Product prioritization; no parallel **XL** tracks without extra squads.

---

## Implementation batch summary (all phases)

| Phase | Batches | Total effort (indicative) |
|-------|---------|---------------------------|
| **P4** | 6 | **M–L** (~3–4 weeks) |
| **P5** | 5 | **M** (~2 weeks) |
| **P6** | 6 | **L** (~3–4 weeks) |
| **P7** | 6 | **L** (~3 weeks) |
| **P8** | 7 | **L** (~4 weeks) |
| **P9** | 4 | **M** (~2 weeks) |
| **P10** | 4 | **XL** (~6–8 weeks) |
| **P11** | 4 | **M–L** (~3–4 weeks) |
| **P12** | 10 tracks | **XL** (quarter+ each track) |

---

## Risk-to-phase mapping

| Risk ID | Phase | Batch |
|---------|-------|-------|
| R-001 | P4 | 4.B |
| R-002 | P4, P7 | 4.C, 7.B |
| R-003 | P4 | 4.D |
| R-004, R-006, R-014 | P4 | 4.E |
| R-005 | P4, P7 | 4.A, 7.C |
| R-007, R-012 | P5 | 5.A, 5.B |
| R-008 | P5, P6 | 5.C, 6.A–D |
| R-009 | P7 | 7.E |
| R-010 | P10 | 10.A–B |
| R-011 | P6, P9 | 6.A, 9.A–B |
| R-013 | P7 | 7.A |
| R-015 | P8 | 8.A–D |
| R-017 | P6 | 6.E |
| R-018 | P12 | 12.B |
| R-020 | P9 | 9.C |

---

## Verification gates (per phase)

| Phase | Required commands / checks |
|-------|----------------------------|
| P4 | `npm run build`; `npm run p4:verify`; Docker prod smoke; backup restore drill |
| P5 | Rate-limit integration tests; prod OTP guard unit tests |
| P6 | `npm run test` all green; media upload e2e sample |
| P7 | `npm run e2e:freeze` 9/9 in CI; web Docker health |
| P8 | `flutter analyze`; manual OTP → create request on device |
| P9 | SMS test send; FCM test push; worker consumes job |
| P10 | PSP sandbox payment → webhook → `PaymentRecord` PAID |
| P11 | Scheduled request + reminder notification |
| P12 | Track-specific acceptance tests |

**Pattern:** Reuse existing `p2:verify`, `p3:verify` in **every** CI run from P4 onward.

---

## Explicit non-goals (all phases)

Aligned with audit + freeze certs — **out of scope unless new phase approved:**

- Rewriting auth/session/device (P1 frozen)
- Changing legacy `{ ok, data }` response envelope
- Web-side Prisma migrations or schema ownership move
- Big-bang delete of `legacy/web` or `src/lib` mirrors
- Full platform redesign (microservices, new API version)
- Wallet, subscription, IoT, offline sync **before** P12 prioritization

---

## Squad allocation suggestion

| Squad focus | Phases | Rationale |
|-------------|--------|-----------|
| **Platform / SRE** | P4, P5, P7, P9, P12.B | Docker, CI, backup, monitoring |
| **Backend domain** | P6, P9, P10, P11 | Legacy ports, PSP, scheduling |
| **Web** | P7, P7.E, P10.C | Proxy, dedup pilots, billing UI |
| **Mobile** | P8, P11.B | Farmer MVP |
| **Product / ops** | P4.A, P10 vendor | Doc truth, compliance |

---

## Related documents

| Document | Use in execution |
|----------|------------------|
| [04_TECHNICAL_RISK.md](./04_TECHNICAL_RISK.md) | Risk IDs → batches |
| [03_FEATURE_MATRIX.md](./03_FEATURE_MATRIX.md) | Module priority |
| [02_ARCHITECTURE_AUDIT.md](./02_ARCHITECTURE_AUDIT.md) | Boundary constraints |
| [../PHASE3_FREEZE.md](../PHASE3_FREEZE.md) | `PHASE4_READY=YES` baseline |
| [../ARCHITECTURE_FREEZE.md](../ARCHITECTURE_FREEZE.md) | Non-goals |
| [../devops/BACKUP_STRATEGY.md](../devops/BACKUP_STRATEGY.md) | P4.D implementation spec |
| [../devops/MONITORING.md](../devops/MONITORING.md) | P12.B implementation spec |

---

## Output block

```
PLAN_COMPLETE
```
