# Prani Doctor MVP Audit & Launch Checklist

**Document type:** Combined **Web/Admin/API + Mobile + Ops** launch readiness for Prani Doctor / Animal Doctors only.  
**Last consolidated update:** 2026-05-09 (merges prior web-only and mobile-only checklist drafts).

---

## 1. Project Scope

| Item | Detail |
|------|--------|
| **Domain** | [https://pranidoctor.com/](https://pranidoctor.com/) |
| **Web / Admin / API repo** | [https://github.com/balagpetcare/pranidoctor-web](https://github.com/balagpetcare/pranidoctor-web) — Next.js 16 (App Router), PostgreSQL + Prisma 7, REST Route Handlers under `/api/*` |
| **Mobile repo** | [https://github.com/balagpetcare/pranidoctor-mobile](https://github.com/balagpetcare/pranidoctor-mobile) — Flutter (`pranidoctor_mobile`), Riverpod, Dio, go_router |
| **MVP target** | Area-aware veterinary marketplace: customer onboarding (OTP intent), animal profiles, service requests, admin assignment, doctor/technician clinical workflow, billing/commission visibility, in-app + SMS notifications — aligned with shared Prisma schema |
| **Pilot launch target** | One **pilot geography**, limited verified doctors/technicians, **manual payment reconciliation**, staging/production SMS provider — **not** a broad public launch until customer auth + payments + ops hardening are closed |

**Isolation:** This scope applies **only** to Prani Doctor / Animal Doctors — **not** BPA/WPA, Quarbani 2026, or unrelated products.

---

## 2. Current MVP Readiness Summary

Percentages are planning estimates (not audited metrics).

| Area | Status | Readiness % | Launch Risk | Notes |
|------|--------|-------------|-------------|-------|
| **Web/Admin/API** | Strong core | **72%** | Medium | Next.js builds; admin + doctor panels + APIs largely implemented; public health endpoints; middleware deprecation warning |
| **Database** | Strong schema | **88%** | Low–Medium | Prisma schema rich; migrations exist; seed optional admin from env |
| **Admin Panel** | Operational | **85%** | Low–Medium | Dashboard, areas, doctors, technicians, requests, billing views, settings |
| **Doctor Workflow** | Web solid | **78%** | Medium | `/doctor` HTML + `/api/doctor/*`; earnings summary; technician HTML deferred |
| **Customer Mobile App** | Shell + APIs wired | **42%** | High | Repositories exist; **login is UI-only**; demo bypass to home without JWT |
| **Customer API** | Partial | **45%** | High | Bearer JWT + `/api/mobile/*` except **no `/api/mobile/auth/*`** to mint tokens |
| **Area/Provider Matching** | Partial | **55%** | Medium | Backend finder APIs; mobile filters pilot-locked (`ashulia-union-area`); booking wizard omits structured `areaId`/`villageId` in submit body |
| **Billing & Commission** | Schema + admin | **55%** | Medium | `BillingRecord` + commission fields; admin billing UI/API; calculation docs — full automation TBD |
| **Payment** | Immature | **25%** | High | No gateway; no mobile payment APIs; manual ops acceptable **only** with process |
| **Notification & SMS** | In-app strong | **55%** | Medium | DB notifications + SMS abstraction; OTP SMS helper **unused** until auth API |
| **Security** | Mixed | **50%** | Medium–High | JWT secrets required; `/api/admin/*` not middleware-covered (per-route guards); health endpoints public; login rate limits not verified |
| **Deployment** | Needs runbooks | **55%** | Medium | Docker Compose for local DB; production checklist incomplete in README |
| **Pilot Operations** | Process-dependent | **45%** | High | Blocked by customer auth end-to-end + SMS + billing discipline |

---

## 3. Completed Features

### Web / Admin / API

- [x] Next.js 16 App Router; `npm run lint` + `npm run build` pass (verified 2026-05-09).
- [x] Prisma 7 PostgreSQL schema (users, profiles, geography + `Area`, animals, service requests, treatment/prescriptions, billing/payments, notifications, content/Knowledge Hub, settings).
- [x] Prisma migrations under `prisma/migrations/`.
- [x] Admin UI: login, dashboard, areas, doctors, AI technicians, customers, animals, service categories, service requests, billing, prescriptions, reports, notifications, settings (incl. billing commission), Knowledge Hub.
- [x] Admin APIs with `requireAdminPanelApiAccess` / similar per-route guards.
- [x] Doctor UI + APIs: auth, requests, accept/reject/complete, treatment cases, prescriptions, earnings summary, tutorials.
- [x] Technician APIs (auth + scoped requests); **no** `/technician` HTML dashboard.
- [x] Mobile customer APIs: animals, providers, service categories, service requests, cancel, tutorials; **`requireMobileCustomer`** Bearer JWT.
- [x] JWT stacks: `ADMIN_JWT_SECRET`, `DOCTOR_JWT_SECRET`, `MOBILE_JWT_SECRET`, `TECHNICIAN_JWT_SECRET`, fallback `AUTH_SECRET`.
- [x] Edge middleware for `/admin/*` and `/doctor/*` HTML only (not `/api/*`).
- [x] Unified `/api/notifications` with mobile Bearer **or** panel session (`requireNotificationViewer`).
- [x] SMS module: `SMS_PROVIDER` (`local` | `noop` | `http`), `SMS_HTTP_URL`, `SMS_HTTP_API_KEY`; dev-safe forcing when `http` + non-production.
- [x] `signMobileCustomerToken` / `notifyOtpSms` helpers (OTP route wiring pending).

### Mobile

- [x] Flutter app: Riverpod, GoRouter, Dio + `Authorization: Bearer` interceptor, `flutter_secure_storage` token keys.
- [x] Splash → onboarding → login entry → home shell (IndexedStack tabs).
- [x] Animals CRUD UI → `/api/mobile/animals`.
- [x] Service requests list/detail/cancel + booking wizard → `/api/mobile/service-requests`.
- [x] Provider finder list/detail → `/api/mobile/providers/doctors` & `technicians`.
- [x] Tutorials / Knowledge Hub consumption.
- [x] Notifications list + mark read → `/api/notifications`.
- [x] Doctor routes **stub** (`/doctor/login`, `/doctor/home`) — not production workflow.
- [x] `flutter analyze` clean; `flutter build apk --debug` succeeded (2026-05-09).

### Database

- [x] Single source of truth in `prisma/schema.prisma`; additive migrations.
- [x] Seed script `prisma/seed.ts` — geography/Knowledge Hub samples; optional admin from env; demo users gated by env.

### Admin

- [x] Full operational CRUD and assignment paths for MVP operations (see §9).

### Doctor

- [x] **Web** doctor journey (see §10). **Mobile** doctor app: **not** implemented beyond stubs.

### Customer

- [x] **API-side** animal + request + finder + notifications **given a valid JWT**.
- [x] **Mobile UI** for major flows; **no** live OTP/login wiring.

### Billing

- [x] Schema + admin billing screens/APIs + doctor earnings summary API + `PLATFORM_COMMISSION_RATE` pattern via settings (see `docs/BILLING_COMMISSION_PLAN.md`).

### Notification / SMS

- [x] In-app notification rows + lifecycle hooks for request events; SMS send abstraction; OTP SMS body helper.

---

## 4. Incomplete Features

### P0 — Launch Blockers

- [ ] **Customer OTP/login HTTP API** (`/api/mobile/auth/*`) — **not implemented** in `pranidoctor-web`; `signMobileCustomerToken` unused by routes.
- [ ] **Mobile app stores JWT on login** — `LoginEntryScreen` bypasses auth (`context.go(/home)`); `TokenStorage` never populated on success.
- [ ] **End-to-end customer journey without manual JWT** — blocked until both items above ship.
- [ ] **Customer payment** — no gateway; no `/api/mobile/.../payment`; mobile has no payment UI.

### P1 — Required Before Pilot

- [ ] **Production SMS** — real Bangladesh provider + `SMS_HTTP_*` (or native adapter) + compliant templates; OTP **storage/TTL/rate limits** when auth ships.
- [ ] **Structured area in booking** — mobile wizard should send `areaId` and/or `villageId` when product requires; backend already supports fields.
- [ ] **Technician HTML dashboard** — API-only today.
- [ ] **Automated assignment / routing rules** — admin manual assign works; smart routing not guaranteed.
- [ ] **Android release hygiene** — replace `com.example.pranidoctor_mobile`; restrict cleartext; release signing.
- [ ] **401 handling + auth gate on mobile** — global logout / login redirect when token invalid.

### P2 — Can Wait Until After Pilot

- [ ] Push notifications (FCM) on mobile.
- [ ] Next.js `middleware` → `proxy` migration (framework deprecation notice).
- [ ] File upload pipeline for symptom photos (virus scan, storage) — policy TBD.
- [ ] iOS store pipeline verification (folder exists; not store-tested in audit).
- [ ] Rich operational README / runbooks (root README still generic template text).

---

## 5. Bugs / Broken Areas

| Issue | Area | File / module | Severity | Recommended fix |
|-------|------|---------------|----------|-------------------|
| Customer login bypass (no JWT) | Mobile | `lib/src/features/auth/login_entry_screen.dart` | **High** | Wire OTP + token persistence; remove demo bypass for release builds |
| Home menu tiles no-op | Mobile | `lib/src/features/home/home_screen.dart` | Low | Add navigation or remove placeholders |
| Doctor mobile stub bypass | Mobile | `lib/src/features/auth/doctor/presentation/doctor_login_screen.dart` | Medium | Integrate `/api/doctor/auth/login` or hide route until ready |
| Customer APIs need issuer | Web/API | N/A (gap) | **High** | Implement `/api/mobile/auth/*` + mobile integration |
| Public DB probe endpoints | Web/API | `src/app/api/admin/health/route.ts`, `src/app/api/mobile/health/route.ts` | Low | Restrict by network / gateway in production |
| Pilot-only area slug filter | Mobile | `lib/src/features/providers/data/provider_finder_repository.dart` | Low | Expand `_allowedAreaSlugs` when pilot geography expands |

---

## 6. Security Risks

| Risk | Severity | Current evidence | Required fix before launch |
|------|----------|------------------|----------------------------|
| **Missing customer auth API** | **Critical** | No `/api/mobile/auth/*`; mobile does not store tokens on login | Ship OTP request/verify + rate limits + secure OTP store (TTL) |
| **JWT secret misuse / absence** | **High** | `.env.example` documents secrets; weak/missing values break or weaken auth | Long random secrets per role; never commit `.env` |
| **Admin API not Edge-middleware protected** | Medium | `/api/admin/*` relies on each route calling `requireAdminPanelApiAccess` | Code review every new admin route; integration tests |
| **OTP abuse / enumeration** | **High** (once OTP exists) | Not implemented yet | Rate limit per IP/phone; lockouts; monitoring |
| **Public health endpoints** | Low–Medium | Return DB connectivity JSON | Firewall / internal-only or auth in sensitive deployments |
| **Cleartext HTTP (mobile)** | Medium | `android:usesCleartextTraffic="true"`; default API `http://localhost:3000` | HTTPS + network security config; correct `API_BASE_URL` |
| **Session fixation / doctor shell** | Medium | Doctor mobile continues without credentials | Remove stub or implement real login |
| **Logging sensitive data** | Low | API base URL shown on login screens (mobile) | Gate debug labels to debug builds |
| **Brute-force panel login** | Medium | No verified rate limiting on `/api/admin/auth/login`, `/api/doctor/auth/login` | Add rate limits / WAF rules |
| **Production build (Android)** | Medium | Release signing placeholder in Gradle | Real keystore + Play policy |

---

## 7. Missing Environment Variables

Only variables **found in repo config/code** or **mobile compile-time defines** are listed. This project uses **JWT secrets**, not NextAuth — **`NEXTAUTH_*` is not applicable**.

| Variable | Repo | Required for | Example | Required before pilot? |
|----------|------|--------------|---------|-------------------------|
| `DATABASE_URL` | Web | Prisma / Postgres | `postgresql://user:pass@host:5432/db?schema=public` | **Yes** |
| `AUTH_SECRET` | Web | Fallback JWT HMAC (≥32 chars) | (long random) | **Yes** |
| `ADMIN_JWT_SECRET` | Web | Admin panel session cookie JWT | (long random) | **Yes** |
| `DOCTOR_JWT_SECRET` | Web | Doctor panel session JWT | (long random) | **Yes** |
| `MOBILE_JWT_SECRET` | Web | Sign/verify mobile Bearer JWT | (long random) | **Yes** |
| `TECHNICIAN_JWT_SECRET` | Web | Technician API/session JWT | (long random) | If technician pilot |
| `SMS_PROVIDER` | Web | SMS routing (`local` / `noop` / `http`) | `local` dev; `http` prod intent | **Yes** (real SMS for OTP pilot) |
| `SMS_HTTP_URL` | Web | HTTP SMS placeholder adapter | Vendor REST URL | If `SMS_PROVIDER=http` |
| `SMS_HTTP_API_KEY` | Web | HTTP SMS auth | Vendor API key | If `SMS_PROVIDER=http` |
| `NODE_ENV` | Web | Production behavior (SMS safety, cookies) | `production` | **Yes** |
| `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` | Web (seed) | `prisma db seed` admin upsert | Operator-chosen | **Recommended** for first admin |
| `PRANI_SEED_*` | Web (seed) | Aliases / optional phone / demo flags | See `prisma/seed.ts` | Optional |
| `API_BASE_URL` | Mobile | Dio `baseUrl` via `--dart-define=API_BASE_URL=...` (`lib/src/core/config/app_config.dart`) | `https://api.pranidoctor.com` | **Yes** on device |
| `NEXT_PUBLIC_*` | Web | — | **Not used** in audited API codebase for auth URL | N/A |
| `NEXTAUTH_SECRET` | Web | — | **Not used** (JWT stack instead) | N/A |
| `SMS_SENDER_ID` | Web | — | **Not referenced** in `.env.example` / `src/lib/sms` scan | Add when vendor requires |
| `PAYMENT_PROVIDER` / `PAYMENT_API_KEY` | Web | — | **Not present** — gateway future | No |
| `APP_ENV` | — | — | **Not used**; `NODE_ENV` used on web | Optional convention |

---

## 8. Database Launch Checklist

- [x] **Schema validated** — `npx prisma validate` passes (2026-05-09).
- [x] **Migrations ready** — `prisma/migrations/` contains ordered history (init MVP through Knowledge Hub + service request booking enums).
- [x] **Seed admin ready** — set `DEFAULT_ADMIN_EMAIL` + `DEFAULT_ADMIN_PASSWORD` (or `PRANI_SEED_ADMIN_*`); run `npx prisma db seed`.
- [x] **Seed area / geography samples** — seed includes Dhaka/Gazipur-style samples per existing seed script (verify target pilot area post-seed).
- [ ] **Backup plan** — automated snapshots + restore test (operator).
- [ ] **Production `DATABASE_URL`** — SSL params per host (Neon/RDS/etc.).
- [ ] **Migration command (prod)** — `npx prisma migrate deploy` in CI/CD (never `migrate dev` on prod).
- [ ] **Rollback plan** — prefer additive migrations; document restore-from-snapshot if destructive change unavoidable.

---

## 9. Admin Launch Checklist

- [x] Admin login (`/admin/login`, `/api/admin/auth/login`)
- [x] Protected HTML routes via middleware + dashboard layout guards
- [x] Dashboard counters
- [x] Area management (unified `Area` tree + APIs)
- [x] Doctor management (verify/suspend/fee/categories/working areas)
- [x] AI technician management (parallel)
- [x] Service request list/detail + assign doctor/technician
- [x] Billing list/detail + billing commission settings
- [x] Notifications page (in-app); SMS via backend provider (no dedicated “SMS log” UI audited)
- [x] Settings + Knowledge Hub admin workflows

---

## 10. Doctor Workflow Launch Checklist

**Primary surface today: web doctor panel + APIs.**

- [x] Doctor account + login API (`/api/doctor/auth/login`)
- [x] Admin verification / approval workflow
- [x] Service areas + categories on profile
- [x] Request list (active/completed/new) + detail
- [x] Accept / reject
- [x] Treatment record (treatment cases API + UI)
- [x] Prescription flow
- [x] Complete case
- [x] Earnings / billing visibility (`/api/doctor/earnings/summary`)
- [ ] **Mobile doctor app** — **not ready** (stubs only in `pranidoctor-mobile`)

---

## 11. Customer Workflow Launch Checklist

- [ ] **OTP login** — backend routes missing; mobile UI disabled / bypass
- [ ] **Customer profile** — rich profile/settings minimal on mobile; backend customer tied to `User`/`CustomerProfile`
- [x] **Animal profile** — API + mobile UI (**needs JWT**)
- [ ] **Structured area selection** — partial (text location; IDs not sent from mobile booking submit)
- [x] **Doctor/technician finder** — API + mobile (**pilot area filter** on mobile)
- [x] **Request booking / list / detail / cancel** — API + mobile (**needs JWT**)
- [x] **Notifications** — in-app list (**needs JWT**)
- [ ] **Payment / manual payment** — process-only for pilot (cash/MFS confirmed offline; record in admin billing)

---

## 12. Payment & Billing Launch Checklist

- [x] **Billing records** — schema + admin visibility + doctor earnings summary path
- [x] **Commission model** — settings key + calculation documentation (`docs/BILLING_COMMISSION_PLAN.md`)
- [ ] **Payment status at scale** — gateway + webhooks **future**
- [ ] **Provider payout automation** — **post-MVP**; manual reconciliation for pilot
- [x] **Manual pilot readiness** — **acceptable if** operators document cash/MFS confirmation + admin updates `BillingRecord` / `PaymentRecord`
- [ ] **Customer-facing payment confirmation in app** — **not built**

---

## 13. Notification & SMS Launch Checklist

| Channel | Status |
|---------|--------|
| **OTP SMS** | Helper `notifyOtpSms` — **blocked** until auth API calls it |
| **Request submitted** | Implemented in notification events + customer SMS when phone present |
| **Doctor accepted / lifecycle** | Partial via in-app notifications — verify product matrix vs SMS |
| **Request completed** | Extend event hooks as product requires |
| **Follow-up reminder** | **Future** — scheduler not audited |
| **Dev logger** | `SMS_PROVIDER=local` — stderr logging |
| **Production provider** | Configure `http` adapter + credentials; compliance (sender, template) |

---

## 14. Deployment Checklist

1. [ ] **Production env** — set all secrets from §7 on host; no `.env` in image if avoidable.
2. [ ] **Database** — managed Postgres; network access from app only.
3. [ ] **Migration** — `npx prisma migrate deploy`.
4. [ ] **Seed admin + pilot area data** — seed script + manual area/doctor onboarding.
5. [ ] **Build web app** — `npm run build`.
6. [ ] **Deploy** web/admin/API (Vercel or chosen host).
7. [ ] **Domain** — `pranidoctor.com` (or staging subdomain) DNS.
8. [ ] **SSL** — TLS at edge.
9. [ ] **Test API health** — `GET /api/mobile/health` / `GET /api/admin/health` (from allowed network).
10. [ ] **Test admin login** — browser + cookie JWT.
11. [ ] **Test mobile API URL** — device/emulator `API_BASE_URL` points to deployed API (HTTPS).
12. [ ] **Build Android APK** — `flutter build apk` (release when signing fixed).
13. [ ] **Pilot device install** — internal distribution track.
14. [ ] **Smoke test** — auth (when ready), animal create, request create, admin visibility, doctor accept (web).
15. [ ] **Log monitoring** — aggregate logs; alert on 5xx spikes.
16. [ ] **Backup** — DB snapshots automated.
17. [ ] **Rollback** — redeploy previous artifact; DB backward-compatible migrations only.

---

## 15. Pilot Launch Checklist

- [ ] Choose **1 pilot area** (union/service leaf) and configure doctor/technician coverage.
- [ ] Onboard **3–5 doctors** (verified, fees, categories, areas).
- [ ] Onboard **1–2 AI technicians** if required by pilot scope.
- [ ] Onboard **1–2 admin/operator** users (seed + training on assignment + billing).
- [ ] Run **~10 customer flows** (OTP + animal + request + notification) — **blocked** until P0 auth ships; substitute **manual JWT** only for internal testing.
- [ ] Run **~5 doctor case flows** on **web doctor panel** (accept → treat → prescribe → complete).
- [ ] Test **billing records** vs manual cash/MFS reconciliation.
- [ ] Test **SMS** (OTP + transactional) in staging with real provider.
- [ ] Collect **feedback** (farmers, doctors, ops).
- [ ] **Daily issue triage** during pilot week(s).
- [ ] **Weekly readiness review** — promote/block public launch.

---

## 16. Go / No-Go Decision

| Gate | Decision | Why |
|------|----------|-----|
| **Public MVP** | **Not Ready** | No customer OTP/login API + no mobile token lifecycle + no in-app payment + incomplete customer journey hardening |
| **Pilot Launch** | **Not Ready** *(engineering)* / **Conditional** *(ops-only)* | **Not ready** for real farmers until P0 auth+SMS; **conditional** internal pilot possible with **manual JWT**, web doctor panel, and strict manual billing |
| **Internal Alpha** | **Ready** | Web admin/doctor + API + DB support demos; mobile UI walkthrough without security claims |

---

## 17. Final Recommendations

**Immediate next task:** Implement **Web: `POST /api/mobile/auth/otp/request` + `…/verify`** (rate limits, OTP persistence, `signMobileCustomerToken`) **and** **Mobile: login screens + `TokenStorage` + remove demo bypass** — single coordinated task across both repos.

**Top 5 launch blockers**

1. No **`/api/mobile/auth/*`** — cannot issue customer JWTs.
2. Mobile **does not persist or gate on** access tokens.
3. No **production OTP SMS** path end-to-end.
4. **Payment** still manual / out-of-band — must be operationally documented.
5. **Pilot geography + provider matching** still constrained (mobile filter + booking without area IDs).

**Safest pilot strategy:** Run **web-first pilot** (admin + doctor on browser); **one village/union**; **manual payments**; invite **limited trusted farmers** only after OTP mobile path is green in staging.

**What not to build before pilot:** Payment gateway webhooks, automated payouts, push notifications, AI technician HTML dashboard, full multi-region expansion — ship **thin vertical slice** first.

---

### Verification log — Task Card 16 final (2026-05-09)

**Web (`pranidoctor-web`):**

| Check | Result |
|-------|--------|
| `npx prisma validate` | Passed |
| `npx prisma generate` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed (Next.js middleware→proxy deprecation warning only) |

**Mobile (`pranidoctor-mobile`):**

| Check | Result |
|-------|--------|
| `flutter pub get` | Passed |
| `flutter analyze` | No issues found |
| `flutter test` | All tests passed |
| `flutter build apk --debug` | Passed (`app-debug.apk`) |

---

### Related docs

- `docs/BILLING_COMMISSION_PLAN.md`
- `docs/NOTIFICATION_SMS_PLAN.md`
- `docs/PRANI_DOCTOR_PROJECT_SCOPE_AND_MVP.md`
- Mobile: `docs/MVP_AUDIT_AND_LAUNCH_CHECKLIST.md` (mobile-only snapshot in **`pranidoctor-mobile`** repo — **superseded for launch decisions by this combined document**)
