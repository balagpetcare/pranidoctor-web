# Admin authentication and layout — audit and plan

**Project:** Prani Doctor (`https://pranidoctor.com/`)  
**Repository:** `pranidoctor-web`  
**Task card:** 04 — Admin authentication and layout

---

## 1. Current audit findings

| Area | Status |
|------|--------|
| **`src/app/admin`** | Present: login at `/admin/login`, dashboard route group `(dashboard)` with pages (dashboard, doctors, customers, areas, etc.), root `admin/layout.tsx` (minimal shell styling). |
| **`src/app/api/admin`** | Present: `auth/login`, `auth/logout`, `auth/me`, `health`, `areas` (+ `[id]`). Health is intentionally unauthenticated for connectivity checks. |
| **`src/middleware.ts`** | Protects all `/admin` paths except login; verifies JWT from cookie; redirects unauthenticated users to `/admin/login?next=…`; redirects authenticated users away from login to `/admin`. |
| **`src/lib/admin-auth/*`** | **Before this task:** `constants.ts`, `jwt.ts` (jose HS256), `session.ts` (`getAdminSession`), `api-guard.ts` (`requireAdminPanelApiAccess`). **After:** added `secrets.ts` (`getAdminJwtSecret` — `ADMIN_JWT_SECRET` or `AUTH_SECRET`), `cookies.ts` (shared httpOnly / sameSite / secure / maxAge). JWT `exp` aligned with `ADMIN_SESSION_MAX_AGE`. |
| **`src/lib/session*` / `jwt*` (generic)** | No separate non-admin session; admin is isolated under `src/lib/admin-auth/`. |
| **`src/lib/db` / `prisma.ts`** | Single Prisma client with `@prisma/adapter-pg` pool (`src/lib/prisma.ts`). |
| **`prisma/schema.prisma`** | `User` has `passwordHash`, `role` (`ADMIN`, `SUPER_ADMIN`, …), `status`; `AdminProfile` 1:1 with `User`. |
| **`prisma/seed.ts`** | Panel admin only when **`DEFAULT_ADMIN_EMAIL` + `DEFAULT_ADMIN_PASSWORD`** (or legacy **`PRANI_SEED_*`** pair) are set; otherwise **warn + skip** admin. **`bcrypt` cost 12**; role always **`ADMIN`**; **`AdminProfile`** upserted. Demo users still use dev defaults when `PRANI_SEED_DEMO=true`. |
| **`.env.example`** | Documents `DATABASE_URL`, `ADMIN_JWT_SECRET`, optional `AUTH_SECRET`, and seed-related variables (commented). |
| **`package.json`** | `lint`, `build`, `db:seed`, **`seed`** (alias), **`test`** → **`vitest run`**. Auth-related deps: `bcryptjs`, `jose` (JWT), `jsonwebtoken` installed but admin flow uses **jose** only. |

**Gaps addressed in this pass**

- `/api/admin/auth/me` previously trusted JWT only; it now uses the same DB-backed check as mutating admin APIs (`resolveAdminPanelActor`).
- `requireAdminPanelApiAccess` previously required `adminProfile` only; it now also requires `role` ∈ {`ADMIN`, `SUPER_ADMIN`} and `status === ACTIVE`.
- Cookie options and signing secret resolution are centralized for consistency and documentation.

**Intentional design choice**

- **Edge middleware** validates the JWT only (no DB per request) for latency and Edge runtime limits. **Server guard** on the dashboard route group (see §13) re-checks Prisma so demoted/suspended users lose access immediately on navigation.

---

## 13. Route & API protection — approach (Task Card 04 continuation)

**Goals**

1. Protect all **`/admin/*`** HTML routes except **`/admin/login`** (and trivial static filenames if ever added under `/admin`).
2. **Do not** run admin auth logic on `/_next/*`, `/api/*` (except paths are not matched), `/favicon.ico`, `public/` assets at root, or **mobile/customer/doctor** APIs — the middleware **`config.matcher`** is limited to `/admin` and `/admin/:path*` only, so no conflicts.
3. **Unauthenticated** browser visits to `/admin` (except login) → redirect **`/admin/login?next=…`**.
4. **Authenticated** (valid admin JWT) visit to **`/admin/login`** → redirect **`/admin`**.
5. **Non-admin / revoked access:** JWT that fails signature/expiry/role claim → treated as logged out at middleware (redirect login). JWT still valid but user **no longer** qualifies in DB (role/status/profile) → **`ensureAdminDashboardAccess()`** in **`src/app/admin/(dashboard)/layout.tsx`** calls **`resolveAdminPanelActor`**; on failure → **`cookies().delete(prani_admin_session)`** (best-effort) + **`redirect('/admin/login')`** so the shell never renders for revoked users.
6. **Admin APIs:** **`requireAdminPanelApiAccess()`** → **401** if no/invalid session cookie, **403** if session verifies but DB says not an active panel admin. **`/api/admin/health`** stays public for ops checks. **`/api/admin/auth/login`** / **`logout`** stay unguarded by design.

**Layers**

| Layer | Scope | Mechanism |
|-------|--------|-----------|
| Middleware | `/admin` pages only | `verifyAdminToken` (Edge-safe **jose**); skip login path; optional skip static extension under `/admin`. |
| Server layout | `(dashboard)` route group | `ensureAdminDashboardAccess()` → DB-backed **`resolveAdminPanelActor`**. |
| API route handlers | Mutating/read admin APIs | **`requireAdminPanelApiAccess()`** uses **`classifyAdminPanelAuth`** (`panel-classify.ts`) + **`resolveAdminPanelActor`** (`panel-access.ts`) for 401 vs 403. |

**Lightweight tests**

- Pure helpers (no Prisma at import time): **`getSafeAdminNextPath`**, **`classifyAdminPanelAuth`** in **`panel-classify.ts`**. Run via **`vitest run`** (`npm test`).

**Implemented (route/API protection pass)**

- **`src/middleware.ts`:** Matcher unchanged (`/admin` only); skip likely static files under `/admin` via extension regex; comments clarify non-interference with `/_next`, `/api`, etc.
- **`panel-classify.ts`:** `AdminPanelActor`, `classifyAdminPanelAuth` (401 vs 403 mapping logic).
- **`panel-access.ts`:** `resolveAdminPanelActor` only (Prisma).
- **`api-guard.ts`:** Uses classify + resolve; re-exports `resolveAdminPanelActor` and `AdminPanelActor`.
- **`dashboard-guard.ts`:** `ensureAdminDashboardAccess()` — DB check + cookie delete on forbidden + `redirect('/admin/login')`.
- **`src/app/admin/(dashboard)/layout.tsx`:** Async server layout calling `ensureAdminDashboardAccess()` before rendering `AdminDashboardShell`.
- **`safe-next-path.ts`** + **`AdminLoginForm`** use shared redirect helper; **`panel-classify.test.ts`**, **`safe-next-path.test.ts`**; **`vitest`**, **`vitest.config.ts`**, **`npm run test`**.

---

## 14. Admin shell & navigation — as implemented

| Item | Status |
|------|--------|
| **Sidebar** | Bengali MVP nav (11 links), `md:w-72`, drawer + overlay on small screens, emerald active state, English `title` tooltips on links. |
| **Topbar** | **Desktop:** brand + divider + current section (BN). **Mobile:** menu + title + logout icon. |
| **Font** | **`Noto_Sans_Bengali`** on `(dashboard)/layout.tsx` and login page. |
| **Login** | Bengali-first form + errors; veterinary styling. |
| **Dashboard `/admin`** | Bengali stats copy; `lang="bn"`. |
| **`/admin/notifications`** | Placeholder page. |
| **`AdminPlaceholder`** | Bengali default stub line. |
| **Service categories** | Not in primary nav; **`/admin/service-categories`** route remains. |

---

## 2. Existing admin folder status

- **`src/app/admin/layout.tsx`:** Full-viewport wrapper (`min-h-screen`, light/dark background).
- **`src/app/admin/login/page.tsx`:** Centered login with `Suspense` around `AdminLoginForm`.
- **`src/app/admin/(dashboard)/layout.tsx`:** Async server layout: **`ensureAdminDashboardAccess()`** then `AdminDashboardShell` (sidebar, mobile menu, sign-out).
- **Dashboard pages:** Placeholder or feature pages under `(dashboard)/…`; Bengali shell + MVP nav (§14); **`/admin/notifications`** stub added.

---

## 3. Existing auth / session / middleware status

| Component | Role |
|-----------|------|
| **Login API** | Validates email/password with `bcrypt.compare`, ensures user is active panel admin with `AdminProfile`, issues JWT, sets httpOnly cookie. |
| **Logout API** | Clears session cookie. |
| **JWT** | HS256; payload: `sub` (user id), `email`, `role` (`ADMIN` \| `SUPER_ADMIN`); expiry = `ADMIN_SESSION_MAX_AGE` seconds. |
| **Cookie** | Name `prani_admin_session`; `httpOnly`, `sameSite: lax`, `secure` when `NODE_ENV === "production"`, `path: /`, `maxAge` matches session max age. |
| **Middleware** | Cookie + `verifyAdminToken`; protects `/admin` except `/admin/login`. |
| **API guard** | `getAdminSession` → **`classifyAdminPanelAuth`** + **`resolveAdminPanelActor`** (`requireAdminPanelApiAccess`) → 401/403 for guarded `/api/admin/*` routes. |

---

## 4. Proposed admin auth architecture (current + stable extensions)

1. **Credentials:** Email + password against `User.passwordHash` (bcrypt).
2. **Authorization for login:** `User.role` in {`ADMIN`, `SUPER_ADMIN`}, `User.status === ACTIVE`, `AdminProfile` exists.
3. **Session:** Signed JWT in httpOnly cookie; verification via **jose** (Edge-compatible).
4. **Route protection:** Next.js `middleware.ts` for pages under `/admin`.
5. **API protection:** Shared `requireAdminPanelApiAccess()`; `me` uses `resolveAdminPanelActor` directly.
6. **Future (not in scope here):** Refresh tokens, IP binding, step-up MFA, audit log, CSRF for cookie-using POST from third-party origins (same-site lax reduces risk for same-site admin UI).

---

## 5. Cookie / JWT / session strategy

| Item | Value |
|------|--------|
| Cookie name | `prani_admin_session` (`ADMIN_SESSION_COOKIE`) |
| Token format | JWT (HS256) |
| Signing secret | `ADMIN_JWT_SECRET` **or** `AUTH_SECRET`; minimum **32** characters after trim |
| Lifetime | `ADMIN_SESSION_MAX_AGE` (7 days); JWT `exp` uses the same duration string (`${ADMIN_SESSION_MAX_AGE}s`) |
| Transport | `secure: true` in production; `httpOnly: true`; `sameSite: "lax"` |

---

## 6. Admin route protection strategy

- **Middleware matcher:** `/admin`, `/admin/:path*`.
- **Public:** `/admin/login` (and subpaths if any).
- **Authenticated redirect:** If valid session cookie on login path → redirect to `/admin`.
- **Unauthenticated:** Redirect to `/admin/login?next=<original path>` (open redirect avoided on client via `AdminLoginForm` prefix check for `next`).

---

## 7. Non-admin blocking strategy

- **Login API:** Rejects users without admin role + profile + active status (same error message as wrong password to avoid account enumeration).
- **API:** `resolveAdminPanelActor` enforces role, status, and profile.
- **Middleware:** JWT payload includes `role`; tampering fails HMAC verification. Role in JWT is informational for middleware; **APIs** re-check the database.

---

## 8. Admin layout strategy

- **Root `admin/layout.tsx`:** Global admin chrome (background, typography).
- **Dashboard route group:** `ensureAdminDashboardAccess()` (Prisma) then `AdminDashboardShell` — navigation, responsive drawer, sign-out calling `/api/admin/auth/logout` then full navigation to login (ensures cookie cleared before next paint).

---

## 9. Seed default admin strategy

**Policy (env-only panel admin — implemented 2026-05-09)**

1. **No hardcoded admin password.** Removed dev defaults such as `admin@pranidoctor.local` / `ChangeMe!Admin123` for the panel admin path.
2. **Panel admin is created or updated only when** both **`DEFAULT_ADMIN_EMAIL`** and **`DEFAULT_ADMIN_PASSWORD`** are set and non-empty after trim, **or** the legacy pair **`PRANI_SEED_ADMIN_EMAIL`** + **`PRANI_SEED_ADMIN_PASSWORD`** (same rules). Precedence: `DEFAULT_*` first, then `PRANI_SEED_*`.
3. **If either is missing:** seed **skips** panel admin creation and logs a **clear `console.warn`**; the rest of the seed (categories, areas, settings, optional demo users) still runs.
4. **Password hashing:** `bcrypt.hashSync(plain, BCRYPT_COST)` with **`BCRYPT_COST = 12`**, matching the cost used historically and compatible with **`bcrypt.compare`** in **`/api/admin/auth/login`**.
5. **Role:** seeded user is always **`UserRole.ADMIN`** (not `SUPER_ADMIN`). Re-seeding an existing admin or super-admin at the same email sets role back to **`ADMIN`**.
6. **Duplicate handling:** `upsert` on **`email`**. If a user exists with that email and role is **not** admin-class, seed **skips** with a warning (does not overwrite a doctor/customer).
7. **Safe updates:** `status` → **ACTIVE**; **`passwordHash`** updated when env password is present; **`phone`** updated only when `PRANI_SEED_ADMIN_PHONE` is non-null; **`AdminProfile.displayName`** from **`DEFAULT_ADMIN_NAME`** or **`PRANI_SEED_ADMIN_DISPLAY_NAME`** or default string **"Prani Doctor Admin"** (display name only, not a secret).
8. **Demo seed (`PRANI_SEED_DEMO`):** draft **`ContentPost`** uses the panel admin as author only if an admin was seeded; otherwise demo content post is skipped with a warning.
9. **Commands:** `npm run db:seed` or **`npm run seed`** (alias). Configure seed entry in **`prisma.config.ts`** (`tsx prisma/seed.ts`).

**Required env (to actually get an admin user)**

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `DEFAULT_ADMIN_EMAIL` or `PRANI_SEED_ADMIN_EMAIL` | Yes (pair) | Admin login email |
| `DEFAULT_ADMIN_PASSWORD` or `PRANI_SEED_ADMIN_PASSWORD` | Yes (pair) | Plain password (only at seed time; hash stored) |
| `DEFAULT_ADMIN_NAME` or `PRANI_SEED_ADMIN_DISPLAY_NAME` | No | `AdminProfile.displayName` |

**Never commit** real secrets; **`.env.example`** lists placeholders and comments only.

---

## 10. Testing checklist

- [ ] `.env` has `ADMIN_JWT_SECRET` (or `AUTH_SECRET`) ≥ 32 chars.
- [ ] Set `DEFAULT_ADMIN_EMAIL` + `DEFAULT_ADMIN_PASSWORD` (or legacy `PRANI_SEED_*`), then `npm run db:seed` or `npm run seed`; confirm warn when unset.
- [ ] Valid login sets cookie; `/admin` loads; logout clears session and returns to login.
- [ ] Wrong password / non-admin user → 401 from login API; no cookie.
- [ ] `/api/admin/areas` without cookie → 401.
- [ ] `/api/admin/auth/me` with valid cookie but user demoted in DB (manual test) → 403.
- [ ] `next` query on login: only internal `/admin…` paths accepted in client redirect.
- [ ] Production: cookie `Secure` (verify over HTTPS).

---

## 11. Changed file checklist (Task 04 implementation pass)

| File | Change |
|------|--------|
| `docs/ADMIN_AUTH_PLAN.md` | **Added** — this document. |
| `src/lib/admin-auth/secrets.ts` | **Added** — `getAdminJwtSecret()`. |
| `src/lib/admin-auth/cookies.ts` | **Added** — shared cookie set/clear. |
| `src/lib/admin-auth/jwt.ts` | **Updated** — use secret helper + expiry tied to `ADMIN_SESSION_MAX_AGE`. |
| `src/lib/admin-auth/api-guard.ts` | **Updated** — `resolveAdminPanelActor`, role/status checks. |
| `src/app/api/admin/auth/login/route.ts` | **Updated** — secret helper + `setAdminSessionCookie`. |
| `src/app/api/admin/auth/logout/route.ts` | **Updated** — `clearAdminSessionCookie`. |
| `src/app/api/admin/auth/me/route.ts` | **Updated** — DB-backed actor resolution. |
| `prisma/seed.ts` | **Env-only panel admin** via `seedPanelAdminFromEnv`; bcrypt cost **12**; role **ADMIN**; `AdminProfile` upsert; demo block unchanged except ContentPost author when admin skipped. |
| `.env.example` | **Updated** — documented secrets and seed env vars. |

**Unchanged but relevant:** `src/middleware.ts`, `src/lib/admin-auth/constants.ts`, `src/lib/admin-auth/session.ts`, dashboard layouts and shell components, existing admin API routes using `requireAdminPanelApiAccess`.

---

## 12. Continuation audit (Task Card 04 — login UX & messages)

**Audited (this pass)**

| Path | Finding |
|------|---------|
| `src/app/admin/login/page.tsx` | Bengali branding, Noto Bengali, gradient, `Suspense` fallback. |
| `src/components/admin/AdminLoginForm.tsx` | Client POST to `/api/admin/auth/login`; `next` query limited to `/admin…`; errors showed API English strings including `INVALID_CREDENTIALS` (safe text but not BN). |
| `src/app/api/admin/auth/login/route.ts` | Zod `email` + `password` min(1); user lookup case-insensitive; panel roles `ADMIN` **or** `SUPER_ADMIN` with `UserStatus.ACTIVE` and `AdminProfile`; bcrypt verify; same `INVALID_CREDENTIALS` for wrong password and non-panel users (no enumeration); no password/token logging. |
| `src/app/api/admin/auth/logout/route.ts` | Clears httpOnly session cookie via shared helper. |
| `src/components/admin/AdminDashboardShell.tsx` | Logout: POST logout then `window.location.href = "/admin/login"`. |

**Implementation decisions (this pass)**

1. **Bengali-first UI** on `/admin/login`: headings, descriptions, labels, button, loading, and Suspense fallback in Bengali; short English subtitle where useful for mixed teams.
2. **`Noto_Sans_Bengali`** (next/font) scoped on the login page for reliable Bengali rendering without changing the global root font stack.
3. **Veterinary / animal-care tone**: emerald palette, paw motif, soft gradient background, card with subtle emerald border/shadow (reuses Tailwind patterns used elsewhere in admin shell).
4. **Mobile**: `min-h-11` touch targets, `text-base` inputs on small screens, responsive padding, compact header on small screens with icon inside the form.
5. **Failed login messaging**: client maps `error.code` to **fixed Bengali** strings so responses never need to carry Bangla in JSON; `INVALID_CREDENTIALS` and wrong-role paths stay **one generic sentence** (does not reveal email vs password).
6. **Successful login**: after JSON success, **`window.location.assign(safe)`** full navigation to `/admin` (or safe `next`) so the new httpOnly cookie is used immediately (same pattern as logout → login).
7. **Logout**: unchanged behavior (POST clears cookie, full redirect to `/admin/login`).
8. **Panel roles**: login still allows **`ADMIN` and `SUPER_ADMIN`** (both have `AdminProfile` in seed); other roles cannot obtain a session.

**Manual code-path review**

| Path | Behaviour |
|------|-----------|
| Login success | Valid user + bcrypt + secret → JWT set on response → client navigates to `/admin`. |
| Login failure | Wrong password / missing user / wrong role / inactive / no `AdminProfile` → `401` + `INVALID_CREDENTIALS`; Zod fail → `422` + `VALIDATION_ERROR`; UI shows Bengali only. |
| Logout | POST → empty cookie `maxAge: 0` → client hard redirect to `/admin/login`. |
| Non-admin | Doctor/customer etc. → treated as `!isPanelAdmin` → same `401` + `INVALID_CREDENTIALS` as wrong password. |

**Changed files (this pass)**

| File | Change |
|------|--------|
| `src/app/admin/login/page.tsx` | Bengali + English subtitle, Noto Bengali font, gradient + branding header, improved Suspense fallback. |
| `src/components/admin/AdminLoginForm.tsx` | Bengali form UI, error code → BN messages, trim email, full redirect on success, paw accent, accessibility (`sr-only` English for fields). |
| `docs/ADMIN_AUTH_PLAN.md` | This section and revision entry. |

---

## 15. Task Card 04 — completion verification (final)

**Final status:** **Completed** for Prani Doctor / Animal Doctors (`pranidoctor-web`) — admin authentication, route protection, dashboard shell, Bengali UX, and env-only panel admin seed are implemented and verified against this document.

### Verification checklist (2026-05-09)

| # | Check | Result |
|---|--------|--------|
| 1 | `/admin/login` exists | Yes — `src/app/admin/login/page.tsx` |
| 2 | Admin login API | Yes — `POST /api/admin/auth/login` |
| 3 | Admin logout API | Yes — `POST /api/admin/auth/logout` |
| 4 | Session cookie + JWT | Yes — httpOnly `prani_admin_session`, HS256 via **jose**, `cookies.ts` / `jwt.ts` |
| 5 | Unauthenticated `/admin/*` → login | Yes — `src/middleware.ts` + `?next=` |
| 6 | Non-admin cannot use panel | Yes — login API + `resolveAdminPanelActor`; middleware rejects invalid JWT roles |
| 7 | Logged-in admin on `/admin/login` → `/admin` | Yes — middleware |
| 8 | Sidebar | Yes — `AdminDashboardShell` |
| 9 | Topbar | Yes — desktop + mobile headers in shell |
| 10 | Dashboard shell | Yes — guard + `AdminDashboardShell` + `main` |
| 11 | Bengali-friendly UI | Yes — login + dashboard layout font + shell + dashboard page |
| 12 | Mobile responsive | Yes — drawer, overlay, touch targets |
| 13 | Safe env-based admin seed | Yes — `seedPanelAdminFromEnv` in `prisma/seed.ts` |
| 14 | No real secrets in repo | Yes — `.env.example` placeholders only; `.env` gitignored |
| 15 | No unrelated project refs in auth code | Verified via search in auth/seed paths |
| 16 | No unnecessary breaking route changes | Public and mobile routes unchanged; matcher remains `/admin` only |

### Automated verification (commands)

Recorded in the agent run for this task: `npm run lint`, `npm run build`, `npx prisma validate`, `npm run test` — all **passed** after doc sync (re-run locally after any edit).

### Doc sync (this completion pass)

- **§14** updated from stale “before implementation” audit to **“as implemented”** summary.
- **§1** `package.json` row: added **`seed`** alias.
- **§3** API guard row: mentions **`classifyAdminPanelAuth`**.
- **§11** `prisma/seed.ts` row: aligned with **env-only** admin policy.

### Known limitations (unchanged)

- Middleware is **JWT-only**; **dashboard layout** is the Prisma-backed gate for revoked users.
- Next.js 16 **middleware → proxy** deprecation notice may require a future migration.
- Demo doctor/AI in `prisma/seed.ts` still use **dev-only** defaults when `PRANI_SEED_DEMO=true` (panel admin does not).

### Recommended next task

**Task Card 05 — Admin Dashboard Overview & Core Metrics** (deeper metrics, charts, and/or live data wiring on `/admin` unless a security or migration item is prioritized first).

---

## Revision history

- **2026-05-09:** Initial plan + foundation hardening (this file and listed code changes).
- **2026-05-09 (continuation):** Admin login page Bengali UX, generic BN errors, veterinary styling, full redirect after login; plan doc updated (§12).
- **2026-05-09 (route/API protection):** Middleware static skip + comments; `panel-classify` / `panel-access` split; `dashboard-guard` + async dashboard layout; Vitest for `classifyAdminPanelAuth` + `getSafeAdminNextPath`; `npm run test`.
- **2026-05-09 (admin shell UI):** Bengali nav + desktop topbar + mobile logout; Noto Sans Bengali on dashboard layout; `/admin/notifications` placeholder; dashboard stats copy BN; §14 plan.
- **2026-05-09 (env-only admin seed):** No default admin password; `seedPanelAdminFromEnv`; §9 plan; `.env.example`; `npm run seed` alias.
- **2026-05-09 (Task Card 04 final verification):** §14 corrected to “as implemented”; §15 completion; minor §1/§3/§11 alignment; checklist + next task.
