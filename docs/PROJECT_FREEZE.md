# PROJECT FREEZE

**Document type:** Implementation snapshot freeze (as-built)  
**Authority:** [MASTER_AUDIT.md](./MASTER_AUDIT.md) (2026-05-21 audit synthesis)  
**Policy:** Freeze **current behavior and contracts** exactly as implemented. **No redesign.** Production readiness gaps are recorded as debt, not blockers to this freeze.

---

## 1. Freeze Metadata

| Field | Value |
|-------|-------|
| **Project name** | Prani Doctor Platform |
| **Freeze date** | **2026-05-21** |
| **Version label** | **`P3-SNAPSHOT-20260521`** (backend `1.0.0` · web `0.1.0` · mobile `1.0.0+1`) |
| **Audit source** | [MASTER_AUDIT.md](./MASTER_AUDIT.md) ← `docs/audit/01`–`05` |
| **Phase baseline** | P1 Auth · P2 Profile/Area · P3 Care pipeline — **FROZEN** |
| **Freeze status** | **`FROZEN_AS_IMPLEMENTED`** — documents reality; **not** production-ready (readiness **42/100**) |
| **Next planned work** | Phase 4 Production gate ([05_EXECUTION_PLAN.md](./audit/05_EXECUTION_PLAN.md)) — **outside this freeze** |

**Verification snapshot at freeze (from MASTER_AUDIT §A.5):**

| Gate | Result |
|------|--------|
| Backend `npm run build` | PASS |
| Web `npm run typecheck` | PASS |
| `p2:verify` | 13/13 PASS |
| `p3:verify` | 17/17 PASS |
| `e2e:freeze` | 8/9 (web proxy requires web on `:3001`) |
| Flutter `flutter analyze` | PASS |

**Sign-off block:**

```
PROJECT_FROZEN=YES
P1_FROZEN=YES
P2_FROZEN=YES
P3_FROZEN=YES
PHASE4_READY=YES
READINESS_SCORE=42
RISK_SCORE=72
COMPLETION_PCT=38
```

---

## 2. Current Stable Modules

Classification: **Stable** = phase-frozen + verified end-to-end · **Partial** = usable slice with known gaps · **Experimental** = scaffold, stub, or not API-integrated.

| Module | Status | Purpose | Dependencies | Risks |
|--------|--------|---------|--------------|-------|
| **Auth** | **Stable** | Multi-panel JWT cookies; mobile OTP/register/refresh/device; session audit | Redis (when enabled), `modules/auth`, legacy `*-auth/*` | R-004 OTP dev mode; R-007 no legacy rate limits; auth↔legacy coupling |
| **Area** | **Stable** | BD location hierarchy; admin location QA; service areas | `modules/area`, legacy location master, PostgreSQL | Location tooling split across web scripts + backend runtime |
| **User / Profile** | **Partial** | Customer profile; `GET/PATCH /api/mobile/me`; foundation `/api/users` | P1 auth, `modules/profile`, `modules/users` | Duplicate user/user(s) modules; foundation vs legacy split |
| **Roles** | **Partial** | `UserRole` enum; admin service-instance permission matrix | Auth, `permissions.registry.ts` | Narrow RBAC; not full resource matrix |
| **Doctor** | **Partial** | Admin verify/suspend; doctor panel; clinical workflows | P3 assignment/case, legacy doctor libs | Foundation `doctors` create throws; online consult/video absent |
| **Lead / Care pipeline** | **Stable** | Intake → assign → accept → case → complete + timeline | P2 profile, `modules/lead`, `assignment`, `case`, `timeline`, `doctor-queue` | Wired via legacy routes only |
| **Leads (CRM)** | **Partial** | Foundation `/api/leads` CRM distinct from service-request `lead/` | Auth, `modules/leads` | Naming collision with Phase 3 `lead/` |
| **Farmer / Mobile** | **Experimental** | Customer mobile app shell | Planned: web/backend API | R-015 not in git; Dio not wired; placeholder auth |
| **Animal** | **Partial** | Livestock profiles; mobile CRUD | Legacy `/api/mobile/animals` | Foundation `/api/animals` repository **stub** |
| **Consultation** | **Partial** | `ServiceRequest` workflow (visit, emergency, online-later types) | P3 pipeline, billing hooks | No telemedicine/video; appointment domain absent |
| **AI (technician)** | **Partial** | AI technician + semen marketplace (~40 routes) | Legacy libs, PostgreSQL AI models | Foundation `/api/ai/chat` **stub** |
| **AI (foundation chat)** | **Experimental** | Foundation `/api/ai/*` orchestration | `modules/ai` | Repository throws; non-functional |
| **Clinic** | **Experimental** | Foundation module shell | `modules/clinics` | No Prisma model; repository stub |
| **Appointment** | **Experimental** | Scheduling fields on `ServiceRequest` only | ServiceRequest | No Appointment/slot models |
| **Payment / Billing** | **Partial** | `BillingRecord`, `PaymentRecord`; doctor complete billing | Legacy billing libs | R-010 no payment gateway |
| **Wallet** | **Experimental** | PaymentMethod enums only | — | No wallet tables |
| **Notification (in-app)** | **Partial** | Legacy Prisma notifications; mobile + panel routes | Legacy `notification-service` | R-011 SMS/push not live; foundation stub |
| **Chat** | **Experimental** | `NotificationType.CHAT` enum only | — | No messaging API |
| **Search** | **Partial** | Location search; entity list filters | Location master, list endpoints | No global search index |
| **Feed** | **Experimental** | — | — | Not implemented |
| **Knowledge** | **Partial** | Tutorials / `ContentPost` editorial workflow | Admin/doctor/mobile tutorial routes | Near MVP complete |
| **Admin** | **Partial** | Operations console (~127 app files) | Web UI + proxied API | Analytics depth limited |
| **Analytics** | **Experimental** | Dashboard billing aggregates only | Admin dashboard route | No AnalyticsService |
| **Localization** | **Partial** | Auth bn-BD/en-US; profile locale | `modules/auth/i18n`, profile | Flutter en-only |
| **Subscription** | **Experimental** | — | — | Not in schema |
| **IoT** | **Experimental** | — | — | Not in MVP |
| **Offline** | **Experimental** | Hive cache bootstrap (mobile) | Flutter `CacheStore` | No sync engine |
| **Media (legacy upload)** | **Partial** | Mobile/admin uploads; MIME validation | Legacy `upload-service`, MinIO/S3 | R-012 upload rate limits; R-014 storage default disabled |
| **Media (foundation)** | **Experimental** | `/api/media` | `modules/media` | Controller returns **503** |
| **Compat API router** | **Stable** (dev path) | 179 legacy route handlers — **primary traffic** | `modules/compat-web`, `legacy/web/routes` | **R-001** absent from Docker prod artifact |
| **Web proxy layer** | **Stable** | ~171/176 routes forward to backend | `proxy-to-backend.ts` | Dual-hop latency; 3-route gap vs backend (179 vs 176) |

---

## 3. Database Freeze

**Canonical owner:** `pranidoctor-backend/prisma/` ([SCHEMA_OWNER.md](../pranidoctor-backend/prisma/SCHEMA_OWNER.md) — paths relative to backend repo).

### 3.1 Current schema state

| Attribute | Value |
|-----------|-------|
| **Engine** | PostgreSQL 16 (per docker-compose) |
| **ORM** | Prisma 7.8 |
| **Schema file** | `pranidoctor-backend/prisma/schema.prisma` |
| **Model count** | **59** Prisma models |
| **Migration folders** | **26** timestamped directories under `prisma/migrations/` (MASTER_AUDIT cited 27; filesystem count 2026-05-21 = 26) |
| **Archived SQL** | `prisma/_archived_out_of_chain/` — **not** applied by Prisma migrate |
| **Web mirror** | `pranidoctor-web/src/generated/prisma/` — **types/client sync only**; **no migrations on web** |
| **Phase 3 additive** | `Lead`, `LeadActivity`, `ServiceRequestTimelineEvent`; `ServiceRequest.priority`, `leadId`, `adminNote` |

### 3.2 Active tables (Prisma models)

All models below exist in `schema.prisma` at freeze:

`User`, `UserDevice`, `UserSession`, `RefreshToken`, `AdminProfile`, `DoctorProfile`, `AiTechnicianProfile`, `CustomerProfile`, `MobileOtpChallenge`, `Division`, `District`, `Upazila`, `Union`, `Village`, `Area`, `DoctorServiceArea`, `AiTechnicianServiceArea`, `ServiceCategory`, `DoctorProfileArea`, `AiTechnicianProfileArea`, `DoctorProfileServiceCategory`, `AiTechnicianProfileServiceCategory`, `AiTechnicianDivisionServiceArea`, `AiTechnicianDocument`, `UploadedFile`, `SemenProvider`, `LivestockBreed`, `SemenServiceTemplate`, `SemenServiceTemplateBreedMix`, `SemenServiceTemplateMedia`, `AiTechnicianService`, `TechnicianSemenInventory`, `AiServiceRequest`, `AiServiceRecord`, `AiTechnicianReview`, `AiTechnicianComplaint`, `AnimalProfile`, `ServiceRequest`, `TreatmentCase`, `ServiceRequestTimelineEvent`, `Lead`, `LeadActivity`, `Prescription`, `PrescriptionItem`, `BillingRecord`, `PaymentRecord`, `Review`, `ContentCategory`, `ContentPost`, `Complaint`, `Notification`, `ServiceInstance`, `ServiceInstanceMedia`, `ServiceInstanceStatusLog`, `ServiceInstanceReview`, `ServiceInstancePublishLog`, `ServiceInstanceAuditEvent`, `AuthAuditEvent`, `Setting`

**Physical table mapping note:** `TreatmentCase` maps to table `TreatmentRecord` (`@@map("TreatmentRecord")`). Selected join tables use `@@map` (e.g. `user_devices`, `user_sessions`, `refresh_tokens`).

### 3.3 Naming conventions (as implemented)

| Element | Convention |
|---------|------------|
| Prisma models | PascalCase singular (`ServiceRequest`, `CustomerProfile`) |
| Fields | camelCase (`customerId`, `createdAt`) |
| Primary keys | `id String @id @default(cuid())` (dominant pattern) |
| Timestamps | `createdAt`, `updatedAt` on most domain models |
| Enums | PascalCase enum name; SCREAMING_SNAKE values |
| Indexes | `@@index([field])` on FKs, status fields, search fields |
| Relations | Explicit `@relation`; many use `onDelete: Cascade` on customer-owned rows |

### 3.4 Relation rules (as implemented)

- **User hub:** `User` 1:1 with profile tables (`AdminProfile`, `DoctorProfile`, `CustomerProfile`, `AiTechnicianProfile`).
- **Customer domain:** `CustomerProfile` → `AnimalProfile`, `ServiceRequest` (1:N).
- **Care pipeline:** `ServiceRequest` → `TreatmentCase`, `Prescription`, `BillingRecord`, `ServiceRequestTimelineEvent`; optional `Lead` link via `leadId`.
- **Location hierarchy:** `Division` → `District` → `Upazila` → `Union` → `Village` (1:N chain).
- **Cross-module rule (documented target):** each model has single module owner — **not fully enforced in code** (architecture drift).

### 3.5 Index rules (as implemented)

- Foreign keys and filter columns indexed (`customerId`, `userId`, `status`, `role`, location hierarchy IDs).
- Composite indexes on common list queries (e.g. `[role, status]`, `[userId, channel]`).
- Soft-deleted rows: `ServiceInstance` uses `@@index([deletedAt])`.

### 3.6 Soft delete policy (as implemented)

| Pattern | Models / fields | Behavior |
|---------|-----------------|----------|
| **`deletedAt DateTime?`** | `ServiceInstance`, `ServiceInstanceMedia` | Soft delete with index on `deletedAt` |
| **`active Boolean`** | `AnimalProfile` (`active @default(true)`) | Deactivate via `/api/mobile/animals/{id}/deactivate` — not global soft-delete |
| **`UserStatus.DELETED`** | `User.status` enum | User lifecycle state — **not** automatic cascade soft delete |
| **Other models** | Majority | **Hard delete / status enums** — no universal `deletedAt` |

**Assumption:** No platform-wide soft-delete middleware; behavior is **per-model** as above.

### 3.7 Constraints (as implemented)

- Prisma-level `@unique`, `@@unique`, FK constraints enforced in PostgreSQL via migrations.
- Location dedupe: migration `20260511133000_location_dedupe_unique_constraints`.
- Enum constraints for status transitions enforced in **application layer** (legacy services + Phase 3 modules), not DB triggers (unless defined in specific migrations — **UNKNOWN** for trigger inventory; assume app-layer).

### 3.8 Database freeze flag

```
DATABASE_FROZEN=true
```

**Meaning:** From this date, **no breaking schema changes** (drop/rename column, destructive enum narrowing) without migration version bump and explicit unfreeze. **Additive** columns/tables allowed only via new migrations under backend ownership.

**Web rule:** **No** `prisma migrate`, **no** schema edits in `pranidoctor-web`.

---

## 4. API Freeze

### 4.1 Current API groups

| Group | Prefix / mount | Handlers | Runtime owner | Traffic priority |
|-------|----------------|----------|---------------|------------------|
| **Health** | `/health`, `/ready`, `/health/db` | 3+ | `src/api/health/` | Ops |
| **OpenAPI docs** | `/api/docs` | 1 | `src/api/docs/` | Docs |
| **Legacy compat** | `/api/*` (179 routes) | 179 | `legacy/web/routes/` via `compat-web` | **Primary** |
| **Foundation modules** | `/api/{auth,users,doctors,leads,animals,clinics,notifications,ai,media}` | 9 routers | `src/modules/*` | Secondary; several stubs |
| **Web proxy** | Same paths on `:3001` | 176 | `pranidoctor-web/src/app/api/` | Client-facing entry (dual-hop) |

**Route groups by actor (legacy compat):**

- `/api/admin/*` — admin panel
- `/api/doctor/*` — doctor panel
- `/api/technician/*` — AI technician panel
- `/api/mobile/*` — customer mobile API
- `/api/notifications/*` — shared notifications
- `/api/locations/*` — public location catalog

### 4.2 Public contracts

| Contract | Specification |
|----------|---------------|
| **Legacy/compat envelope** | Success: `{ "ok": true, "data": T }` · Error: `{ "ok": false, "error": { "code", "message", "details?" } }` |
| **Foundation envelope** | Success: `{ "success": true, "data": T }` · Error: `{ "success": false, "error": { "code", "message", "requestId?" } }` |
| **OpenAPI snapshot** | `pranidoctor-backend/openapi.json` (generated; audit cites **179** legacy paths + modules) |
| **Phase 3 frozen routes** | See [PHASE3_FREEZE.md](./PHASE3_FREEZE.md) §1.1 |
| **Phase 2 frozen routes** | `GET/PATCH /api/mobile/me`, location routes — [PHASE2_FREEZE.md](./PHASE2_FREEZE.md) |
| **Phase 1 frozen auth** | Panel login/me/logout; mobile OTP/register/refresh/device — [PHASE1_FREEZE.md](./PHASE1_FREEZE.md) |

### 4.3 Versioning

| Item | Value |
|------|-------|
| **HTTP header** | `X-API-Version: v1` (set in Express `app.ts`) |
| **URL versioning** | **None** — paths are unversioned `/api/...` |
| **Breaking change policy** | Remove/rename route or response field → requires version bump + changelog ([API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md)) |
| **Additive policy** | New fields in `data` allowed; new routes on backend first |

### 4.4 Response envelope (frozen)

**Do not change** legacy `{ ok, data }` / `{ ok, false, error }` for compat routes. Web proxy passes responses **unchanged**.

### 4.5 Auth assumptions (frozen)

| Actor | Credential | Me route |
|-------|------------|----------|
| Admin | Admin JWT cookie | `GET /api/admin/auth/me` |
| Doctor | Doctor JWT cookie | `GET /api/doctor/auth/me` |
| Technician | Technician JWT cookie | `GET /api/technician/auth/me` |
| Mobile customer | Bearer JWT | `GET /api/mobile/me` |

**Frozen env keys (transport):** `BACKEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_BASE_URL`

**JWT secrets (backend):** separate `ADMIN_JWT_SECRET`, `MOBILE_JWT_SECRET`, `DOCTOR_JWT_SECRET`, `TECHNICIAN_JWT_SECRET`, refresh secret — min 32 chars in production per `config.schema.ts`.

### 4.6 Backward compatibility rules

1. Existing route paths and HTTP methods remain callable with same semantics.
2. Additive JSON fields only unless API version bump declared.
3. Timeline events remain **append-only**; no delete/update of `ServiceRequestTimelineEvent` via public API.
4. Phase 3 status transition order preserved: `CREATED → ASSIGNED → ACCEPTED → CASE_OPENED → COMPLETED` (with reject/cancel side paths as implemented).
5. Web continues to proxy; must not reintroduce direct Prisma in route handlers.

### 4.7 API freeze flag

```
API_FROZEN=true
```

---

## 5. Folder Freeze

### 5.1 Repository roots

| Path | Role |
|------|------|
| `D:\PraniDoctor\pranidoctor-backend\` | Canonical API + Prisma |
| `D:\PraniDoctor\pranidoctor-web\` | UI + proxy + docs hub |
| `D:\PraniDoctor\pranidoctor_user\` | Flutter customer (no git at freeze) |

### 5.2 Frozen directories (canonical implementation)

| Path | Owner | Freeze note |
|------|-------|-------------|
| `pranidoctor-backend/prisma/` | Backend | Schema + migrations — **sole migration authority** |
| `pranidoctor-backend/src/legacy/web/routes/` | Backend | 179 compat handlers — **primary API** |
| `pranidoctor-backend/src/legacy/web/lib/` | Backend | Domain logic for compat routes |
| `pranidoctor-backend/src/modules/auth/` | Backend | **P1 FROZEN** — no internal rewrite |
| `pranidoctor-backend/src/modules/profile/` | Backend | **P2 FROZEN** |
| `pranidoctor-backend/src/modules/area/` | Backend | **P2 FROZEN** |
| `pranidoctor-backend/src/modules/{lead,assignment,case,timeline,doctor-queue}/` | Backend | **P3 FROZEN** |
| `pranidoctor-backend/src/modules/compat-web/` | Backend | Legacy Express adapter |
| `pranidoctor-backend/src/shared/` | Backend | Config, DB, logger, security kernel |
| `pranidoctor-web/src/app/api/` | Web | Proxy route handlers |
| `pranidoctor-web/src/lib/proxy-to-backend.ts` | Web | Proxy transport |
| `pranidoctor-web/src/lib/server-internal.ts` | Web | RSC/guard fetch |
| `pranidoctor-web/src/lib/prisma.ts` | Web | DB guard (throws) |
| `pranidoctor-web/docs/PHASE*_FREEZE.md` | Web | Phase certificates |

### 5.3 Generated directories (do not hand-edit)

| Path | Generated by |
|------|--------------|
| `pranidoctor-backend/src/generated/prisma/` | `npm run db:generate` |
| `pranidoctor-backend/dist/` | `npm run build` |
| `pranidoctor-web/src/generated/prisma/` | postinstall `copy-prisma-client-from-backend.mjs` |
| `pranidoctor-web/.next/` | `next build` |
| `pranidoctor_user/lib/**/*.g.dart`, `*.freezed.dart` | `build_runner` / `flutter gen-l10n` |

### 5.4 Temporary / local directories

| Path | Treatment |
|------|-----------|
| `pranidoctor-backend/.local-storage/` | Local storage driver artifact — gitignored |
| `pranidoctor-web/backups/` | Ad hoc backups — not canonical |
| `pranidoctor-web/archive/web-deprecated/` | Retained until soak sign-off — **do not delete** per ARCHITECTURE_FREEZE |
| `node_modules/`, `.dart_tool/`, `build/` | Ephemeral |

### 5.5 Ownership boundaries

| Concern | Owner repo |
|---------|------------|
| Prisma schema + migrations | **backend only** |
| Business logic (canonical) | **backend** (`legacy/web/lib` + `modules/*`) |
| Admin/doctor/enterprise UI | **web** |
| Customer mobile UI | **pranidoctor_user** |
| OpenAPI generation | **backend** (`npm run openapi:generate`) |
| Location master CSV tooling | **web** `scripts/locations/`, `data/` |

---

## 6. Dependency Freeze

### 6.1 Runtime dependencies (pinned at freeze)

**pranidoctor-backend** (`package.json` ^ ranges; lock via `package-lock.json`):

| Package | Declared | Role |
|---------|----------|------|
| `express` | ^5.1.0 | HTTP server |
| `@prisma/client` | ^7.8.0 | Database ORM |
| `pg` | ^8.21.0 | PostgreSQL driver |
| `ioredis` | ^5.6.0 | Redis |
| `bullmq` | ^5.34.0 | Queues |
| `jose` | ^6.2.3 | JWT |
| `zod` | ^3.25.0 | Config/validation |
| `pino` | ^9.6.0 | Logging |
| `@aws-sdk/client-s3` | ^3.1051.0 | Object storage |
| `sharp` | ^0.34.5 | Image processing |
| `next` | `file:./shims/next-compat` | Legacy route shim |

**pranidoctor-web:**

| Package | Declared | Role |
|---------|----------|------|
| `next` | 16.2.6 | Framework |
| `react` | 19.x | UI |
| `@prisma/client` | ^7.8.0 | Types only (synced) |
| `zod` | ^4.4.x | Validation |
| `jose`, `jsonwebtoken` | ^6.x / ^9.x | Token helpers |

**pranidoctor_user** (`pubspec.yaml`):

| Package | Declared | Role |
|---------|----------|------|
| `flutter_riverpod` | ^2.6.1 | State |
| `go_router` | ^14.6.2 | Routing |
| `dio` | ^5.7.0 | HTTP |
| `hive` / `hive_flutter` | ^2.2.3 / ^1.1.0 | Cache |
| SDK | ^3.11.5 | Dart |

### 6.2 Dev dependencies (representative)

| Repo | Key dev deps |
|------|--------------|
| Backend | `typescript` ^5.8, `tsx` ^4.21, `vitest` ^4.1.5, `prisma` ^7.8, `eslint` ^9 |
| Web | `typescript` ^5, `vitest` ^4.1, `tailwindcss` ^4, `eslint-config-next` |
| Mobile | `build_runner`, `freezed`, `json_serializable`, `flutter_lints` |

### 6.3 Version locking rules

1. **Authoritative lockfiles:** `package-lock.json` (backend, web), `pubspec.lock` (mobile).
2. **Install command:** `npm ci` in backend/web CI (when implemented); `flutter pub get` for mobile.
3. **Node engine:** `>=20.0.0` (backend).
4. **No silent lockfile drift** on release branches without explicit dependency-unfreeze.

### 6.4 Upgrade policy (during freeze)

| Allowed | Forbidden without unfreeze |
|---------|---------------------------|
| Patch/minor within same major for **dev-only** tools if CI passes | Major upgrades to Express, Next, Prisma, React, Flutter SDK |
| Security patches after review + full `p2:verify` + `p3:verify` | Changing `next` shim behavior |
| Adding **new** dependency for Phase 4+ work with ADR note | Removing dependencies used by frozen paths |
| Syncing web Prisma client from backend schema | Running `npm update` blindly on release branch |

### 6.5 Forbidden upgrades (explicit)

- **Express 4.x downgrade** or unverified Express 6.x
- **Prisma major** without full migration replay test
- **Next.js major** without web build + e2e verification
- **Breaking `jose` / JWT API** without auth compat re-verify
- **Replacing `file:./shims/next-compat`** without compat route regression suite

### 6.6 Dependency freeze flag

```
DEPENDENCY_FROZEN=true
```

---

## 7. Migration Freeze

### 7.1 Existing migration state

| Item | Value |
|------|-------|
| **Owner** | `pranidoctor-backend/prisma/migrations/` |
| **Count** | 26 migration directories (filesystem, 2026-05-21) |
| **Baseline** | `20260208120000_init_mvp` through `20260521190000_phase1_device_audit_actions` |
| **Deploy command** | `npm run db:migrate:deploy` |
| **Dev command** | `npm run db:migrate` |
| **Out of chain** | `prisma/_archived_out_of_chain/` — manual reference only |
| **Web** | **Blocked** — `prisma-production-guard.mjs`; no web migrations |
| **Phase 3 schema** | Applied via project history (includes `Lead`, timeline); verify with `npx prisma migrate status` on target DB |

### 7.2 Migration naming policy (frozen convention)

Format: `YYYYMMDDHHMMSS_descriptive_snake_case` directory containing `migration.sql`.

Examples at freeze: `20260521180000_phase1_refresh_session_device`, `20260509120000_service_request_booking_enums_fields`.

### 7.3 Rollback rules

1. **Production:** prefer **forward-fix migration** over `migrate reset`.
2. **`prisma migrate reset`:** **dev/staging only** — destructive.
3. **Rollback SQL:** **UNKNOWN** standardized playbook in repo — treat as manual DBA procedure until P4 backup/restore exists (R-003).
4. **Never** delete applied migration folders from git history.

### 7.4 Data safety constraints

- No destructive column drops on frozen Phase 1–3 tables without two-phase migration (add new → migrate data → drop old).
- Timeline table **append-only** — migrations must not truncate `ServiceRequestTimelineEvent` in prod scripts.
- Location master migrations affect large FK graphs — require backup before apply (R-003 gap).
- Seeds: `seed.ts`, `seed-admin.ts`, `seed-demo.ts` — **non-prod** unless explicitly approved.

### 7.5 Migration freeze flag

```
MIGRATION_FROZEN=true
```

**Meaning:** Only **additive** migrations permitted until explicit schema unfreeze. Web repo must not add migration folders.

---

## 8. Technical Debt Register

From [MASTER_AUDIT.md](./MASTER_AUDIT.md) Appendix A.2 + A.3. **Do not implement** as part of this freeze.

| ID | Severity | Area | Description | Suggested future resolution (Phase) |
|----|----------|------|-------------|-----------------------------------|
| R-001 | P0 | Deploy | Legacy API absent from Docker prod artifact | P4.B — ship legacy routes in image |
| R-002 | P0 | Release | No CI/CD | P4.C — GitHub Actions gates |
| R-003 | P0 | Backup | Backups documented not automated | P4.D — scripts + restore drill |
| R-004 | P0 | Auth | OTP dev mode in prod logs | P4.E — fail startup if OTP_MODE=dev |
| R-005 | P0 | Ops | cutover defer vs architecture freeze conflict | P4.A — single ops doc |
| R-006 | P0 | Env | REDIS_ENABLED=false silences OTP/queues | P4.E — require Redis in prod |
| R-007 | P1 | Security | Legacy routes without rate limiting | P5.A |
| R-008 | P1 | Modules | Foundation stubs return 500 | P5.C / P6 |
| R-009 | P1 | Duplication | ~353 mirrored lib TS files | P7.E incremental dedup |
| R-010 | P1 | Payment | No payment gateway | P10 |
| R-011 | P1 | Notification | SMS/push not implemented | P9 |
| R-012 | P1 | Upload | Legacy upload rate limits missing | P5.B |
| R-013 | P1 | Deploy | No web production container | P7.A |
| R-014 | P1 | Secret | Storage default disabled | P4.E env template |
| R-015 | P1 | Mobile | Flutter not wired; not in git | P8 |
| R-016 | P2 | Dead code | archive + _archived_foundation | P12.I after soak |
| R-017 | P2 | Test | Legacy Vitest @/ failures | P6.E |
| R-018 | P2 | Monitoring | Prometheus/Grafana docs-only | P12.B |
| R-019 | P2 | Security | CSP disabled (Helmet) | P5+ hardening |
| R-020 | P2 | Worker | Worker not in compose prod | P9.C |
| R-021 | P2 | Logging | Legacy console OTP/SMS logs | P5.D |
| R-022 | P2 | Media | Foundation /api/media 503 | P6.C |
| R-023 | P3 | Dead code | Unreferenced web geo-resolve | P7 cleanup |
| R-024 | P3 | Git | Misleading initial commit messages | Hygiene |
| R-025 | P3 | Auth | Flutter dev-token placeholder | P8 |

---

## 9. Non-Breaking Rules

Mandatory from this freeze until explicit **PROJECT_UNFREEZE**:

1. **No breaking schema changes** — no column/table renames or drops on frozen models without migration version policy.
2. **No route renames** — `/api/*` paths used by web proxy and mobile clients remain stable.
3. **No folder relocation** — do not move `legacy/web`, `modules/auth`, P2/P3 modules, or web `src/app/api` without migration plan.
4. **No silent dependency upgrades** — lockfile changes require review + phase verify scripts.
5. **No API response contract changes** on compat routes — preserve `{ ok, data }` / `{ ok, false, error }`.
6. **No destructive migration** in production — no reset; forward-only fixes.
7. **No cross-module coupling increases** — new imports from `legacy` → `modules` or reverse require review (architecture drift).
8. **No web-side Prisma migrations or direct DB access** in route handlers.
9. **No auth/session/device internal rewrites** — P1 frozen surface only (additive endpoints allowed with version note).
10. **No deletion** of `pranidoctor-web/archive/web-deprecated/` until ops sign-off ([ARCHITECTURE_FREEZE.md](./ARCHITECTURE_FREEZE.md)).

---

## 10. Safe Change Matrix

### SAFE_TO_MODIFY

Areas where changes are permitted **if non-breaking** per §9:

| Path / area | Allowed change types |
|-------------|---------------------|
| `pranidoctor-web/docs/**` | Documentation, audit, execution plans |
| `pranidoctor-backend/scripts/p4-verify.ts` (future) | New verify scripts |
| `pranidoctor-web/src/app/admin/**` UI | Presentational UI, new pages calling existing API |
| `pranidoctor-web/src/app/doctor/**` UI | Same |
| `pranidoctor-web/src/app/enterprise/**` UI | Same |
| `pranidoctor-backend/prisma/migrations/` | **Additive migrations only** |
| `pranidoctor-backend/openapi.json` | Regenerate after backend route changes |
| `pranidoctor-user/lib/**` | Mobile feature work (Experimental module) |
| `pranidoctor-web/scripts/locations/**` | Location data pipeline tooling |
| `.env.example` files | Document new env vars (non-secret) |
| Phase 4+ batches per [05_EXECUTION_PLAN.md](./audit/05_EXECUTION_PLAN.md) | Ops/CI/Docker fixes **without** breaking §9 |

### DO_NOT_TOUCH

Frozen without explicit unfreeze approval:

| Path / area | Reason |
|-------------|--------|
| `pranidoctor-backend/src/modules/auth/**` | P1 FROZEN |
| `pranidoctor-backend/src/modules/profile/**` | P2 FROZEN |
| `pranidoctor-backend/src/modules/area/**` | P2 FROZEN |
| `pranidoctor-backend/src/modules/{lead,assignment,case,timeline,doctor-queue}/**` | P3 FROZEN |
| `pranidoctor-backend/src/legacy/web/routes/**` | Contract surface — change only with API version policy |
| `pranidoctor-backend/src/legacy/web/lib/api-response.ts` | Response envelope |
| `pranidoctor-backend/src/compat/compat-api-response.ts` | Compat envelope |
| `pranidoctor-web/src/lib/api-response.ts` | Web envelope mirror |
| `pranidoctor-web/src/lib/proxy-to-backend.ts` | Proxy semantics |
| `pranidoctor-web/src/lib/prisma.ts` | DB guard |
| `pranidoctor-web/src/app/api/**/route.ts` | Proxy handlers — no business logic |
| `pranidoctor-web/archive/web-deprecated/**` | Soak retention |
| `pranidoctor-backend/src/modules/auth/_archived_foundation/**` | Archived |
| `pranidoctor-backend/src/modules/media/_archived_foundation/**` | Archived |
| `pranidoctor-web/src/generated/prisma/**` | Generated — sync from backend only |
| `pranidoctor-backend/src/generated/prisma/**` | Generated |
| Phase 3 frozen route behaviors | See [PHASE3_FREEZE.md](./PHASE3_FREEZE.md) §1.1 |
| Timeline append-only semantics | P3 invariant |

---

## 11. Exit Criteria

This **PROJECT FREEZE** document is complete when:

| Criterion | Status |
|-----------|--------|
| All §1–§10 sections populated from MASTER_AUDIT | **Met** |
| No source code modified for freeze | **Met** |
| No migrations applied for freeze | **Met** |
| No dependency changes for freeze | **Met** |
| Assumptions marked where audit silent | **Met** (migration rollback playbook, DB triggers) |
| Debt register linked to R-001–R-025 | **Met** |
| Phase P1–P3 boundaries preserved | **Met** |
| Production gaps documented not hidden | **Met** (readiness 42/100) |

**Post-freeze work entry:** Phase 4 Production gate — see [05_EXECUTION_PLAN.md](./audit/05_EXECUTION_PLAN.md). Phase 4 work **does not** invalidate this snapshot; it requires a new freeze revision or additive PROJECT_FREEZE amendment.

---

## Appendix A — Score reference (from MASTER_AUDIT)

| Metric | Value |
|--------|-------|
| Platform completion % | **38%** |
| Critical-path completion % | **65%** |
| Roadmap phase completion | **25%** (3/12) |
| Readiness score | **42 / 100** |
| Risk score | **72 / 100** |

---

## Appendix B — Related freeze documents

| Document | Scope |
|----------|-------|
| [PHASE1_FREEZE.md](./PHASE1_FREEZE.md) | Auth |
| [PHASE2_FREEZE.md](./PHASE2_FREEZE.md) | Profile, area |
| [PHASE3_FREEZE.md](./PHASE3_FREEZE.md) | Care pipeline |
| [ARCHITECTURE_FREEZE.md](./ARCHITECTURE_FREEZE.md) | Topology policy |
| [API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md) | API envelope |
| [MASTER_AUDIT.md](./MASTER_AUDIT.md) | Source of truth |

---

FREEZE_COMPLETE
