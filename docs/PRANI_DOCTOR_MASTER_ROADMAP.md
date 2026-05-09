# Prani Doctor / Animal Doctors — Master Roadmap

**Project title:** Prani Doctor (Animal Doctors) — veterinary service platform for Bangladesh.

**Public domain:** [https://pranidoctor.com/](https://pranidoctor.com/)

**GitHub:** [pranidoctor-web](https://github.com/balagpetcare/pranidoctor-web) · [pranidoctor-mobile](https://github.com/balagpetcare/pranidoctor-mobile)

**Purpose of this document:** Single source of truth for **repo reality**, **MVP direction** (cross-checked with `docs/PRANI_DOCTOR_PROJECT_SCOPE_AND_MVP.md`), and **multi-chat task cards**. Fulfills **Task Card 01** (audit & roadmap). Do not treat unchecked items as implemented.

---

## Task Card 01 — Section checklist

Use this table to verify the roadmap against Task Card 01 requirements.

| # | Required section | Heading below |
|---|------------------|---------------|
| 1 | Current repo status | [Current repo status](#current-repo-status) |
| 2 | Current completed features | [Current completed features](#current-completed-features-evidence-based) |
| 3 | Missing core modules | [Missing core modules](#missing-core-modules) |
| 4 | MVP feature list | [MVP feature list](#mvp-feature-list) |
| 5 | Web/Admin/API tasks | [Web / Admin / API tasks](#web--admin--api-tasks) |
| 6 | Mobile app tasks | [Mobile app tasks](#mobile-app-tasks) |
| 7 | Database/schema tasks | [Database / schema tasks](#database--schema-tasks) |
| 8 | Area-based service tasks | [Area-based service tasks](#area-based-service-tasks) |
| 9 | Doctor workflow tasks | [Doctor workflow tasks](#doctor-workflow-tasks) |
| 10 | AI technician workflow tasks | [AI technician workflow tasks](#ai-technician-workflow-tasks) |
| 11 | Customer workflow tasks | [Customer workflow tasks](#customer-workflow-tasks) |
| 12 | Billing/commission tasks | [Billing / commission tasks](#billing--commission-tasks) |
| 13 | Content/tutorial tasks | [Content / tutorial tasks](#content--tutorial-tasks) |
| 14 | Notification/SMS tasks | [Notification / SMS tasks](#notification--sms-tasks) |
| 15 | Testing and launch checklist | [Testing and launch checklist](#testing-and-launch-checklist) |
| 16 | Multi-chat task card index | [Multi-chat task card index](#multi-chat-task-card-index) |
| 17 | Project isolation rule | [Strict project isolation rule](#strict-project-isolation-rule) |

---

## Strict project isolation rule

Do **not** use or mix any BPA/WPA, Quarbani 2026, or other project data, features, naming, schema, business rules, or assumptions. Only use Prani Doctor / Animal Doctors information found in **this repository** (`pranidoctor-web`) and the **mobile repository** (`pranidoctor-mobile` on GitHub; local clone name may differ — see [Repositories and local paths](#repositories-and-local-paths)).

---

## Repositories and local paths

| Repository | GitHub | Local path (verified this pass) |
|------------|--------|----------------------------------|
| Web / Admin / API | `balagpetcare/pranidoctor-web` | `D:\PraniDoctor\pranidoctor-web` |
| Mobile (Flutter) | `balagpetcare/pranidoctor-mobile` | `D:\PraniDoctor\pranidoctor_mobile` ✓ |

**Local path note:** On the machine used for this audit, `D:\PraniDoctor\pranidoctor-mobile` (hyphen) **does not exist**; the Flutter project lives at **`D:\PraniDoctor\pranidoctor_mobile`** (underscore). Clone the GitHub repo into either folder name locally; keep paths consistent in your IDE and env scripts.

---

## Current repo status

### pranidoctor-web (Next.js)

| Area | Status |
|------|--------|
| **Framework** | Next.js **16.2.6**, React **19.2.4**, TypeScript **5** (`package.json`) |
| **Database** | PostgreSQL via **Prisma 7.8** (`prisma/schema.prisma`, `prisma.config.ts`) |
| **Local DB** | `docker-compose.yml` — Postgres 16 Alpine, DB `pranidoctor_db`, port **5432** |
| **Migrations** | One migration folder: `prisma/migrations/20260208120000_init_mvp` |
| **Seed** | `prisma/seed.ts` — admin user, service categories, placeholder areas, `app.name` setting |
| **App structure** | `src/app/` — App Router; `/` public home; `/admin/*`; `/api/*` |
| **Middleware** | `src/middleware.ts` — protects `/admin` (JWT cookie). *Next.js 16 build may warn that the “middleware” convention is deprecated in favor of “proxy” — track framework migration separately.* |
| **Docs in repo** | `docs/PRANI_DOCTOR_PROJECT_SCOPE_AND_MVP.md`. **No** `docs/LOCAL_DATABASE_SETUP.md` (still referenced in `.env.example` comment only). |
| **README** | Default create-next-app style; minimal Prani Doctor–specific setup |
| **CI** | **Not found in current repo audit** (no `.github/workflows`) |
| **Automated tests** | **Not found in current repo audit** (no Jest/Vitest/playwright config or `*.test.ts` / `*.spec.ts` discovered) |
| **Lint / build** | `npm run lint`, `npm run build` present and used for validation |

### pranidoctor_mobile (Flutter)

| Area | Status |
|------|--------|
| **SDK** | Dart `^3.11.5` (`pubspec.yaml`) |
| **State / routing / HTTP** | Riverpod, go_router, Dio, flutter_secure_storage, shared_preferences, intl |
| **Entry** | `lib/main.dart`, `lib/app/app.dart`, `lib/app/router.dart` |
| **Features (screens)** | Splash → role selection → customer/doctor login → customer/doctor home (placeholders) |
| **README** | Default Flutter template |
| **Tests** | `test/widget_test.dart` — smoke widget test |
| **CI** | **Not found in current repo audit** |
| **Lint** | `analysis_options.yaml` + `flutter_lints` |

---

## Current completed features (evidence-based)

### Web / Admin / API

- **Prisma MVP schema:** `User` + `UserRole` (ADMIN, CUSTOMER, DOCTOR), profiles, `AnimalProfile`, hierarchical `Area`, `ServiceCategory`, `ServiceRequest`, `TreatmentRecord`, `Prescription`, `BillingRecord`, `Notification`, `Setting`.
- **DB connectivity** from routes via Prisma (`SELECT 1` in health handlers).
- **Admin JWT cookie auth:** `POST` login, `POST` logout, `GET` me; helpers under `src/lib/admin-auth/`.
- **Admin UI:** layout, login, dashboard with **live Prisma aggregates** (counts + BDT revenue from issued/paid billing).
- **Admin nav routes** for animals, areas, billing, customers, doctors, prescriptions, reports, service categories, service requests, settings — **placeholder content** (`AdminPlaceholder`) except dashboard.
- **Public home** (`/`) with links to admin and health URLs.
- **Health:** `GET /api/admin/health`, `GET /api/mobile/health`.
- **Generated Prisma client** under `src/generated/prisma/` (present in tree).

### Mobile

- **Shell:** theme, `GoRouter`, `ProviderScope`.
- **Navigation:** Splash → role selection → role-specific login → role-specific home.
- **Login UI:** Bengali copy; phone/OTP fields **disabled**; placeholder button writes dummy token and navigates home.
- **Home:** placeholder + API base URL display; sign-out clears storage.
- **Dio:** JSON defaults + **Bearer** interceptor from secure storage.
- **`AppConfig.apiBaseUrl`** via `--dart-define=API_BASE_URL=...` (default `http://localhost:3000`).

---

## Missing core modules

*(Vs schema and scope doc; not implemented in audited code.)*

- **Mobile OTP / password auth** and **`/api/mobile/...` auth** beyond health (no customer/doctor login API found).
- **Service request lifecycle** APIs + mobile screens (create, list, detail, status updates).
- **Assignment** (doctor / future technician) rules and APIs.
- **AI technician** as a role: **not** in `UserRole` in `schema.prisma`.
- **Admin CRUD** for sidebar entities (all placeholders except dashboard).
- **Commission / emergency fee** modeling (scope doc; not in schema beyond `BillingRecord` totals).
- **SMS / push** integration (not found in audited source).
- **File / image upload** for cases (not found in current repo audit).
- **Deep geography** + **doctor–area** mapping (tree model exists; seed and UI are minimal).

---

## MVP feature list

*Aligned with repo + `docs/PRANI_DOCTOR_PROJECT_SCOPE_AND_MVP.md`.*

Priorities inferred **only** from schema, implemented routes, and the scope doc:

1. **Auth:** Admin email/password ✓. Customer/doctor **OTP** (mobile + API) — **not done**.
2. **Customer:** profile, animals, **service request** create/track — schema ready; **flows not done**.
3. **Doctor:** assigned queue, treatment, prescription, billing — schema ready; **flows not done**.
4. **AI technician** — described in scope doc; **no code/schema role found**.
5. **Admin:** CRUD, request board, fee/commission settings — **mostly not done**.
6. **Notifications** (SMS + in-app) — **not done** in code (`Notification` model unused in audited API).
7. **Area-based matching** — partial (model + seed); **rules/UI not done**.

---

## Web / Admin / API tasks

- **Domain APIs** aligned with Prisma: customers, doctors, animals, areas, categories, service requests, treatments, prescriptions, billing (admin + mobile namespaces as appropriate).
- **Replace `AdminPlaceholder`** with tables, filters, create/edit flows, and read-only audit views where needed.
- **Admin session hardening** review (cookie flags already env-aware; secret length enforced on login).
- **Fix doc drift:** add `docs/LOCAL_DATABASE_SETUP.md` **or** remove reference from `.env.example`.
- **README:** Prani-specific quickstart (compose, migrate, seed, admin URL, health checks).
- **Tests + CI:** introduce minimal API route tests and a workflow file when ready.

---

## Mobile app tasks

- **OTP (or agreed auth)** request/verify + token lifecycle; remove placeholder-only path for production builds.
- **401 handling** / optional refresh once backend defines it.
- **Customer:** animals, area + category selection, request wizard, list/detail, post-visit prescription & bill views.
- **Doctor:** inbox, case detail, allowed status transitions, clinical notes, prescription, billing capture.
- **AI technician** surfaces — **blocked** until role exists in API/schema.
- **Resilience:** offline/error UI, timeouts (Dio already has connect/receive timeouts).

---

## Database / schema tasks

- **Production migration** process beyond single initial migration.
- **Technician / AI role** decision: extend `UserRole`, separate profile, or external workforce model.
- **Commission, platform fee, emergency fee** storage and versioning (if not `Setting` JSON only).
- **Doctor–area** (and technician–area) **many-to-many** if matching requires it.
- **Structured prescription lines** (optional; today `instructions` string).
- **Geography import** or admin tooling for full BD hierarchy (not in repo audit).

---

## Area-based service tasks

- Grow `Area` tree; admin UI for parent/child and metadata.
- Enforce **leaf (or agreed level)** selection on new requests.
- **Matching engine:** area + category + availability + verification flags — implement in API/service layer.

---

## Doctor workflow tasks

- Mobile + API: **assigned** `ServiceRequest` list/detail; status updates per policy.
- Create/link **TreatmentRecord**, **Prescription**, **BillingRecord** from doctor flow.
- Admin: **verification** (`verifiedAt`), license fields, suspend/activate linkage to `User.status`.

---

## AI technician workflow tasks

- **Product + schema** sign-off (see risks).
- **Queue API** and allowed actions (triage, coordination, handoff) per scope doc.
- **Commission-eligible events** for technicians if revenue model requires it — **no dedicated fields found** in audit.

---

## Customer workflow tasks

- Onboarding after auth: profile, locale, address JSON pattern.
- Animal CRUD.
- Request: symptoms, urgency, window, area, category; optional media when upload exists.
- Tracking: assignment visibility, timeline, outcomes.
- Read-only **customer-facing** bill (hide internal commission if required by product).

---

## Billing / commission tasks

- Doctor-initiated **BillingRecord** draft → admin issue/paid (or automated rules later).
- **Commission engine** + reporting; admin-configured rates (likely `Setting` or new tables).
- **Emergency fee** flag and calculation rules.

---

## Content / tutorial tasks

- Mobile: help/FAQ links to **pranidoctor.com** where content exists.
- Admin runbooks (support, reassignment, disputes) — **not found in repo** beyond scope doc.

---

## Notification / SMS tasks

- Provider abstraction + env config (BD SMS gateway or similar) — **not in audited code**.
- Persist **Notification** rows + `GET/PATCH` APIs + mobile inbox; optional push channel later.

---

## Testing and launch checklist

| Item | Web | Mobile |
|------|-----|--------|
| Lint / analyze | `npm run lint` | `flutter analyze` |
| Unit / integration tests | Not established in audit | `flutter test` (smoke only) |
| Build | `npm run build` | `flutter build apk` / store pipelines |
| Env | `DATABASE_URL`, `ADMIN_JWT_SECRET` (≥ 32 chars) | `API_BASE_URL` via `--dart-define` |
| DB | `docker compose`, `prisma migrate`, `prisma db seed` | Point to deployed API |
| Smoke | `/api/admin/health`, `/api/mobile/health` | Same health + future auth smoke |
| Security | Cookie `secure` in prod, secret rotation | TLS, secure storage, no dummy tokens in prod |

---

## Multi-chat task card index

### Quick reference

| ID | Title |
|----|--------|
| **01** | Project audit & master roadmap (this document) |
| **02** | Database schema planning |
| **03** | Admin panel foundation |
| **04** | Area & service coverage system |
| **05** | Doctor management |
| **06** | AI technician workflow |
| **07** | Customer app flow |
| **08** | Billing & commission |
| **09** | Notification & SMS |
| **10** | Testing & launch readiness |

**Implementation order (suggested, not mandatory):** Often **02 → 03 → 04** unblocks admin and geography; **07** needs mobile auth APIs (small dedicated spike or sub-card under 07); **05–06–08–09** parallelize after core data paths exist; **10** runs continuously from first API merge.

---

### Copy-paste task cards (start a new chat with one block)

---

**Task Card 01 — Project Audit & Master Roadmap**  
**Goal:** Keep repo audit and roadmap accurate; no feature implementation.  
**Scope:** Update `docs/PRANI_DOCTOR_MASTER_ROADMAP.md` only; re-verify both repos; run lint/build/analyze/test where applicable.  
**Out of scope:** Application code changes.  
**Done when:** Roadmap reflects current tree; checklist and task index up to date.

---

**Task Card 02 — Database Schema Planning**  
**Goal:** Close gaps between `PRANI_DOCTOR_PROJECT_SCOPE_AND_MVP.md`, billing/commission needs, and `prisma/schema.prisma`.  
**Scope:** Decide AI/technician representation; commission/emergency fee storage; doctor–area (and technician–area) relations; migration plan from current `init_mvp`.  
**Out of scope:** Full admin UI (see Card 03).  
**Done when:** Approved schema design + migration approach documented or implemented in a follow-up coding task.

---

**Task Card 03 — Admin Panel Foundation**  
**Goal:** Replace placeholders with real list/detail/create flows for **one** vertical slice (e.g. `ServiceCategory` or `Area`) and establish patterns (data fetching, forms, errors).  
**Scope:** Next.js admin pages + API routes + Prisma; reuse existing auth.  
**Out of scope:** Mobile apps.  
**Done when:** One entity is fully CRUD-capable in admin; patterns documented for copying to other entities.

---

**Task Card 04 — Area & Service Coverage System**  
**Goal:** Operational geography and service categories aligned with requests.  
**Scope:** Area tree CRUD (admin), validation on `ServiceRequest.areaId`, seed/import strategy for BD hierarchy; service category maintenance.  
**Out of scope:** Automatic doctor matching (can stub) unless small.  
**Done when:** Requests can only attach to valid areas/categories; admin can maintain tree.

---

**Task Card 05 — Doctor Management**  
**Goal:** Admin and APIs support doctor lifecycle: list, verify (`verifiedAt`), deactivate; optional profile fields.  
**Scope:** Admin doctors UI + supporting API; link to `User`/`DoctorProfile`.  
**Out of scope:** Doctor mobile case execution (pair with doctor workflow + request APIs).  
**Done when:** Admin can onboard/verify/suspend doctors with DB updates reflected in health/dashboard counts.

---

**Task Card 06 — AI Technician Workflow**  
**Goal:** Define and implement technician participation **after** Card 02 decisions.  
**Scope:** Role model, assignment, allowed status transitions, handoff to doctor; technician-facing surface (admin-only first or mobile later per product).  
**Out of scope:** Unrelated customer features.  
**Done when:** At least one end-to-end technician path exists in API + one UI surface agreed by product.

---

**Task Card 07 — Customer App Flow**  
**Goal:** Real customer journey on Flutter: auth, profile, animals, service request, tracking.  
**Scope:** Mobile screens + `/api/mobile/...` contracts; remove production reliance on placeholder token.  
**Out of scope:** Doctor app (separate track).  
**Done when:** Customer can complete a request against staging API and see status updates.

---

**Task Card 08 — Billing & Commission**  
**Goal:** Billing lifecycle and commission rules persisted and auditable.  
**Scope:** APIs for billing draft/issue/paid; commission calculation or `Setting`-driven rules; admin reporting minimum.  
**Out of scope:** Payment gateway capture (unless already in scope for MVP).  
**Done when:** Issued/paid totals in dashboard match rule-driven records; doctor flow can create valid drafts.

---

**Task Card 09 — Notification & SMS**  
**Goal:** Operators and users get timely events (assignment, status change).  
**Scope:** `Notification` persistence, list/mark-read APIs, SMS provider integration with safe logging (no secrets).  
**Out of scope:** Marketing campaigns.  
**Done when:** At least one real event creates a notification and optionally an SMS in dev/staging.

---

**Task Card 10 — Testing & Launch Readiness**  
**Goal:** Reduce regression risk and ship checklist.  
**Scope:** Web route tests or E2E smoke; GitHub Actions (or chosen CI); release notes; env templates verified.  
**Out of scope:** Feature development unless blocking tests.  
**Done when:** CI runs on PR; documented launch checklist executed on staging.

---

## Suggested next task cards (short list)

1. **Task Card 02 — Database schema planning** — Unblocks technician, commission, and area–doctor modeling without rework.
2. **Task Card 03 — Admin panel foundation** — Turns schema into operable data quickly after schema is stable enough.
3. **Task Card 07 — Customer app flow** — Highest user-visible value once **mobile auth APIs** exist (may require a small spike inside or before Card 07).

---

## Known risks and open questions

- **`UserRole` has no TECHNICIAN / AI** while scope doc references AI technicians — **Card 02** must resolve.
- **`.env.example` → `docs/LOCAL_DATABASE_SETUP.md`** reference missing — onboarding friction.
- **No web automated tests / CI** — regression risk.
- **Placeholder mobile auth** — must not ship to production.
- **Commission / emergency fee** in prose vs schema — risk of late rework (**Card 02 + 08**).
- **Next.js “middleware → proxy”** deprecation message on build — plan framework upgrade path separately.
- **Local folder name** `pranidoctor_mobile` vs GitHub `pranidoctor-mobile` — standardize in team docs.

---

*Statements about “not found” or “not in audit” mean: not discovered in a focused pass over these two repositories; they are not claims about future intent.*
