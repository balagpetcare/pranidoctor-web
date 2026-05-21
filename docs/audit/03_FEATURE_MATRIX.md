# Feature Matrix — Current vs Target Platform

**Audit date:** 2026-05-21  
**Auditor mode:** read-only feature audit (no redesign, no fixes)  
**Inputs:** [01_REPOSITORY_INVENTORY.md](./01_REPOSITORY_INVENTORY.md), [02_ARCHITECTURE_AUDIT.md](./02_ARCHITECTURE_AUDIT.md)  
**Scope:** `pranidoctor-backend`, `pranidoctor-web`, `pranidoctor_user`

---

## Executive summary

| Metric | Value |
|--------|-------|
| Modules audited | **24** |
| **COMPLETE** | **2** (Auth, Area) |
| **PARTIAL** | **14** (includes AI — legacy technician OK, foundation chat broken) |
| **BROKEN** | **0** (no module is entirely non-functional; AI foundation `/api/ai/chat` path fails) |
| **NOT_STARTED** | **8** |
| Weighted average coverage (all modules) | **~38%** of documented target platform |
| Production-critical path coverage (admin + doctor + service-request workflow) | **~65%** |

**Interpretation:** Core **vet service-request operations** (Phase 2 profile/area + Phase 3 lead/assign/case/timeline) are the strongest implemented slice. **Platform-scale modules** (wallet, subscription, appointments, telemedicine chat, IoT, offline sync, analytics) remain documented targets with little or no runtime code. Several **foundation Express modules** exist as shells whose repositories throw at runtime — legacy compat routes carry most live traffic.

---

## Methodology

### Target platform (baseline)

Target capabilities are taken from:

| Source | Defines |
|--------|---------|
| `docs/backend/01-system-architecture.md` | 8 core backend modules + event subscribers (Analytics, Audit) |
| `docs/database/ERD.md` §15 | Future domains: wallet, subscription, appointment, offline sync, telemedicine chat, farm management |
| `docs/PHASE0_FINAL_REVIEW.md` §11 | MVP vs Phase 2+ module timeline |
| `pranidoctor_user/docs/MASTER_APP_ARCHITECTURE_PLAN.md` | Mobile farmer/customer shell expectations |
| Phase freeze certs (P1–P3) | Verified current slices |

**Target platform** = full multi-channel product: farmer mobile app, provider panels, admin console, AI services, payments/wallets, subscriptions, appointments, knowledge hub, notifications, search, analytics, localization (bn-BD + en-US), offline sync, and future IoT integrations — as described across the above documents.

### Current platform (baseline)

**Current platform** = what is implemented and reachable today via:

- Backend legacy compat routes (`179` handlers) — primary production path
- Foundation Express modules (`9` registered) — mixed persistence (some Prisma-backed, many stubs)
- Web UI panels + API proxies (`176` routes, `~171` proxy)
- Flutter scaffold (`pranidoctor_user`) — not API-integrated

### Coverage %

Estimated as: **implemented target capabilities ÷ documented target capabilities** for each module, based on schema presence, API routes, UI surfaces, verification scripts, and runtime repository status. Rounded to nearest whole percent.

### Status rules

| Status | Criteria |
|--------|----------|
| **COMPLETE** | ≥85% coverage; phase-frozen or verified end-to-end; no blocking gaps |
| **PARTIAL** | 15–84% coverage; usable slice exists but material gaps |
| **BROKEN** | Code/routes exist but primary API path fails at runtime (e.g. repository throws) |
| **NOT_STARTED** | <15% coverage; no schema, or schema-only / doc-only |

### Risk levels

| Risk | Meaning |
|------|---------|
| **Low** | Gap is future-phase or isolated |
| **Medium** | Affects UX, ops, or migration but has workaround |
| **High** | Blocks product milestone, revenue path, or mobile launch |

---

## CURRENT vs TARGET PLATFORM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TARGET PLATFORM (documented)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Identity: Auth · Users · Roles · Localization                              │
│  Geography: Area / location master · Search                               │
│  Actors: Farmer (mobile) · Doctor · Admin · AI Technician                   │
│  Clinical: Animal · Consultation · Appointment · Clinic · Knowledge         │
│  Commerce: Payment · Wallet · Subscription                                  │
│  Engagement: Notification · Chat · Feed                                     │
│  Intelligence: AI orchestration · memory · technician marketplace           │
│  Platform: Analytics · Offline sync · IoT                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ ~38% weighted module coverage
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CURRENT PLATFORM (implemented)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✅ Frozen: Auth (multi-panel + mobile OTP), Area (BD hierarchy + areas)   │
│  ✅ Verified: Profile/me, service-request pipeline (P2/P3 scripts)          │
│  🟡 Legacy-heavy: Doctor ops, animals, billing, notifications, knowledge,   │
│     AI technician/semen marketplace, admin console                          │
│  🟡 Scaffold: Foundation modules (users partial; ai/clinics/notifications/   │
│     animals repos stubbed)                                                  │
│  ⚠️ Broken sub-path: POST /api/ai/chat (foundation module; legacy AI OK)    │
│  ⬜ Not built: Wallet, subscription, appointments, telemedicine chat, feed, │
│     analytics service, IoT, offline sync engine                             │
│  ⬜ Mobile: Flutter shell only — no production API wiring                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stack comparison

| Dimension | Target | Current | Gap |
|-----------|--------|---------|-----|
| API ownership | Single Express backend | Express + Next proxy dual-hop | Cutover incomplete |
| Mobile customer | Production Flutter ↔ API | Scaffold; placeholder auth | **High** |
| Payments | Gateway + wallet settlement | Manual billing records; enum only | **High** |
| AI | Orchestrator + memory + chat | Technician legacy OK; foundation chat **broken** | **High** |
| Appointments | Slot/schedule model | `scheduledStart/End` on `ServiceRequest` only | **High** |
| Offline | Sync engine + conflict resolution | Hive cache prep only | **High** |
| Localization | bn-BD + en-US everywhere | Auth + profile locale; Flutter en-only | **Medium** |
| CI/CD | Automated gates | Local scripts only | **Medium** |

---

## Feature matrix

| Module | Status | Coverage % | Evidence | Risk |
|--------|--------|------------|----------|------|
| **Auth** | **COMPLETE** | **88%** | `modules/auth/` frozen (P1); panel login (admin/doctor/technician); mobile OTP/register/refresh/device; `p1-auth-compat-verify`, `AUTH_COMPLETE=YES`; legacy + module bidirectional wiring | **Medium** — auth↔legacy coupling; dual envelope |
| **User** | **PARTIAL** | **72%** | `User`, `CustomerProfile`, `AdminProfile`; `modules/users/` Prisma repo; `modules/profile/`; `GET/PATCH /api/mobile/me`; `p2:verify` 13/13; foundation `/api/users` vs legacy split | **Medium** — duplicate user/user(s) modules |
| **Roles** | **PARTIAL** | **50%** | `UserRole` enum (6 roles); `permissions.registry.ts` (admin service-instance caps only); `prisma/seed-data/roles.ts`; panel guards in legacy `*-auth/guard.ts`; no full RBAC matrix | **Medium** — coarse-grained permissions |
| **Area** | **COMPLETE** | **85%** | BD hierarchy (`Division`→`Village`); `Area` model; `modules/area/`; admin location QA routes; web location-master tooling; Phase 2 frozen (`PROFILE_FOUNDATION_FROZEN=YES`) | **Low** — tooling split web/backend |
| **Doctor** | **PARTIAL** | **72%** | `DoctorProfile`; admin verify/suspend/areas/fees; doctor panel auth + service-requests (accept/reject/complete/prescriptions/treatment); `modules/assignment`, `doctor-queue`, `case`; `p3:verify` workflow | **Medium** — foundation `doctors/` vs legacy clinical libs |
| **Farmer** | **PARTIAL** | **42%** | `CustomerProfile`; mobile register/me/animals/service-requests API; Flutter shell (`SessionController`, tab nav) — **Dio not wired**, placeholder tokens, default `api.example.com` | **High** — mobile launch blocker |
| **Animal** | **PARTIAL** | **68%** | `AnimalProfile` model; legacy `/api/mobile/animals` CRUD + deactivate; foundation `modules/animals/` repo **stub** (throws) | **Medium** — live path is legacy only |
| **Consultation** | **PARTIAL** | **58%** | `ServiceRequest` types (`DOCTOR_VISIT`, `EMERGENCY`, `ONLINE_CONSULTATION_LATER`); doctor visit workflow + prescriptions; `acceptsOnlineConsultation` on doctor; no video/telemedicine session | **Medium** — online consult is scheduling intent only |
| **AI** | **PARTIAL** | **62%** | **Working:** legacy AI technician + semen marketplace (`AiServiceRequest`, `AiTechnicianService`, ~40 mobile/admin routes). **Broken sub-path:** `modules/ai/ai.repository.ts` throws; `/api/ai/chat` fails if called via foundation router | **High** — dual AI stacks; orchestrator/memory not built |
| **Clinic** | **NOT_STARTED** | **8%** | `modules/clinics/` shell (service + routes); `clinics.repository.ts` throws; **no `Clinic` Prisma model**; no legacy clinic routes | **Low** — not on critical path yet |
| **Appointment** | **NOT_STARTED** | **18%** | No `Appointment` / slot models (ERD §15 future); `scheduledStart/End` on `ServiceRequest`; notification enum types `APPOINTMENT_*` in foundation types only | **Medium** — product expects scheduling |
| **Payment** | **PARTIAL** | **52%** | `BillingRecord`, `PaymentRecord`; `PaymentMethod` (BKASH, NAGAD, ROCKET, etc.); doctor complete + billing DTOs; admin billing UI/API; **no payment gateway integration** (Phase0 gap) | **High** — revenue collection manual |
| **Wallet** | **NOT_STARTED** | **5%** | `PaymentMethod` wallet enums only; ERD §15 `Wallet`, `WalletTransaction`, `Payout` **not in schema** | **Medium** — Phase 3+ per ERD |
| **Notification** | **PARTIAL** | **58%** | Legacy `/api/notifications`, `/api/mobile/notifications` + Prisma `Notification` model (working); foundation `notifications.repository.ts` **stub**; SMS/push TODOs in `notifications.service.ts` | **Medium** — delivery channels incomplete |
| **Chat** | **NOT_STARTED** | **12%** | `NotificationType.CHAT` enum; ERD telemedicine `ChatConversation`/`ChatMessage` **not implemented**; no human-to-human chat API | **Medium** — conflated with AI chat in docs |
| **Search** | **PARTIAL** | **38%** | `/api/locations/search`, `/api/mobile/locations/search`; entity list `search` filters (users, leads, doctors, animals); no unified global search index | **Low** |
| **Feed** | **NOT_STARTED** | **8%** | No social/timeline feed model; `ContentPost` serves knowledge/tutorials only | **Low** — distinct from social feed in target |
| **Knowledge** | **PARTIAL** | **78%** | `ContentPost`, `ContentCategory`; admin/doctor tutorial CRUD + approve/reject/submit; mobile `/api/mobile/tutorials`; editorial workflow enums | **Low** — strong legacy implementation |
| **Admin** | **PARTIAL** | **82%** | Full admin panel (`src/app/admin/` ~127 files); doctors, technicians, semen, billing, locations, service-requests, content; dashboard `page-data`; admin auth frozen | **Low** — analytics depth limited |
| **Analytics** | **NOT_STARTED** | **22%** | `AnalyticsService` referenced in architecture docs only; admin dashboard aggregates billing counts — no reports module, no event pipeline | **Medium** — ops visibility gap |
| **Localization** | **PARTIAL** | **48%** | Auth i18n (`bn-BD` default, `en-US`); profile `locale` on `/api/mobile/me` (Phase 2); Flutter `app_en.arb` only — no bn mobile UI | **Medium** — Bangladesh primary market |
| **Subscription** | **NOT_STARTED** | **0%** | ERD §15 `SubscriptionPlan`, `Subscription` — **not in schema**; Phase 3+ timeline in Phase0 | **Low** — future revenue model |
| **IoT** | **NOT_STARTED** | **0%** | No IoT models, routes, or docs implementation; not in MVP module map | **Low** |
| **Offline** | **NOT_STARTED** | **12%** | ERD `SyncOperation`, `SyncConflict` not built; Flutter `CacheStore`/Hive bootstrap only; MASTER plan marks full offline as incremental | **High** — Phase0 risk R-001 |

---

## Module detail — CURRENT vs TARGET

### Identity & access

| Module | Target capability | Current state | Gap |
|--------|-------------------|---------------|-----|
| Auth | OTP, JWT, refresh, device registry, audit, all panels | Implemented + P1 frozen | Legacy coupling; refresh path split |
| User | Profiles, prefs, admin user mgmt | Mobile me + users module partial | Foundation vs legacy duplication |
| Roles | Full RBAC per resource | Role enum + narrow admin matrix | Doctor/technician capability registry incomplete |

### Geography & discovery

| Module | Target capability | Current state | Gap |
|--------|-------------------|---------------|-----|
| Area | National location master + service areas | Phase 2 complete | Import tooling lives in web repo |
| Search | Cross-entity search | Location + per-list filters | No global search service |

### Actors & clinical

| Module | Target capability | Current state | Gap |
|--------|-------------------|---------------|-----|
| Farmer | Mobile app for customers/farmers | API exists; app not wired | End-to-end mobile auth |
| Doctor | Verification, queue, clinical chart | Strong admin + doctor panel + P3 | Online consult / video |
| Animal | Profiles + medical history | Mobile CRUD via legacy | Foundation module stub |
| Consultation | Visit + online + emergency | ServiceRequest workflow | Telemedicine layer |
| Clinic | Clinic entity + staff + services | Module shell only | No schema |
| Appointment | Slots, recurring availability | Field-level scheduling only | No appointment domain |

### Commerce

| Module | Target capability | Current state | Gap |
|--------|-------------------|---------------|-----|
| Payment | Gateway capture + reconciliation | Billing records + manual methods | No PSP integration |
| Wallet | Balance, transactions, payout | Enum values only | No wallet tables |
| Subscription | Plans, invoices, benefits | Documented future | Not started |

### Engagement & content

| Module | Target capability | Current state | Gap |
|--------|-------------------|---------------|-----|
| Notification | SMS + push + email + in-app | In-app via legacy Prisma | Channel integrations TODO |
| Chat | Doctor/customer messaging | Not built | Telemedicine chat in ERD |
| Feed | Activity/social feed | Not built | Content is editorial only |
| Knowledge | Tutorials / knowledge hub | Admin/doctor/mobile tutorials | Near complete for MVP scope |

### Intelligence & platform

| Module | Target capability | Current state | Gap |
|--------|-------------------|---------------|-----|
| AI | Chat, memory, orchestrator, technician AI | Technician marketplace legacy OK; foundation chat broken | AI memory tables future |
| Admin | Operations console | Extensive web admin | Analytics depth |
| Analytics | Reports, dashboards, event metrics | Dashboard aggregates only | AnalyticsService not built |
| Localization | bn-BD + en-US product-wide | Auth + profile | Mobile/UI bn missing |
| Offline | Sync engine + conflict UX | Hive prep | Sync models absent |
| IoT | Device telemetry integration | Absent | Future |

---

## Verification cross-reference

| Phase gate | Modules covered | Result |
|------------|-----------------|--------|
| P1 auth compat | Auth | Frozen (`AUTH_COMPLETE=YES`) |
| P2 verify (13 checks) | User, Profile, Area, Farmer API | **PASS** |
| P3 verify (17 checks) | Doctor assignment, Case, Timeline, Consultation workflow | **PASS** |
| P1 certificate composite | All foundation modules | **REJECTED** (76/100) — stub repos |
| e2e:freeze | Web proxy + backend | 8/9 (web proxy needs `:3001`) |
| Flutter analyze | Farmer mobile | Clean — no API integration tests |

---

## Risk summary (by priority)

| Priority | Modules | Risk |
|----------|---------|------|
| **P0 — launch blockers** | Farmer, Offline, Payment | Mobile not wired; no sync; no payment gateway |
| **P1 — functional gaps** | AI (foundation chat), Notification, Consultation, Appointment | `/api/ai/chat` throws; SMS/push missing; no scheduling domain |
| **P2 — platform debt** | User, Roles, Animal, Auth | Dual API stacks; stub foundation repos; RBAC incomplete |
| **P3 — future phase** | Wallet, Subscription, Clinic, Feed, IoT, Analytics, Chat | Documented in ERD §15; no runtime |

---

## Status distribution

```
COMPLETE     ██                    2  ( 8%)
PARTIAL      ██████████████        14 (58%)
BROKEN       ·                      0  ( 0%)
NOT_STARTED  ████████               8  (33%)
```

---

## Related documents

| Document | Relevance |
|----------|-----------|
| [01_REPOSITORY_INVENTORY.md](./01_REPOSITORY_INVENTORY.md) | Repo/file baseline |
| [02_ARCHITECTURE_AUDIT.md](./02_ARCHITECTURE_AUDIT.md) | Layer drift, dual stack |
| [../PHASE2_FREEZE.md](../PHASE2_FREEZE.md) | User / profile / area |
| [../PHASE3_FREEZE.md](../PHASE3_FREEZE.md) | Consultation workflow |
| [../PHASE0_FINAL_REVIEW.md](../PHASE0_FINAL_REVIEW.md) | Target timeline + risks |
| [../database/ERD.md](../database/ERD.md) | Future domain placeholders |
| [../backend/01-system-architecture.md](../backend/01-system-architecture.md) | Target module catalog |

---

## Output block

```
FEATURE_AUDIT_COMPLETE
```
