# Prani Doctor Admin UI — Larkon Migration Plan

**Purpose:** Long-term standard for the Prani Doctor (Animal Doctors) admin panel by adopting visual and structural patterns from **Larkon — Next.js 16 Ecommerce Management Admin & Dashboard Template**, without replacing business logic, data layer, or auth.

**Permanent admin UI rules (normative for all new pages):** [`docs/ADMIN_UI_DESIGN_RULES.md`](./ADMIN_UI_DESIGN_RULES.md) — design contract, required components, prohibitions, and PR checklist.

**Template location (reference only, not copied wholesale):**  
`D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2\Larkon\TS\` (TypeScript variant recommended as the audit source; a JS variant exists under `Larkon\JS\`).

**Application root:** `D:\PraniDoctor\pranidoctor-web`

**Last audited / updated:** 2026-05-09 (code, docs, **Larkon-inspired theme chrome** final pass).

---

## Larkon theme chrome implemented

Prani-owned **Path A** theme and navigation chrome (Larkon-inspired; **no** Bootstrap, **no** Larkon `app.scss` in-repo) lives under **`src/components/admin-ui/`** and **`src/app/admin/admin-shell.css`**.

- **Preferences:** **`AdminThemeProvider`** wraps the dashboard shell; **`useAdminTheme()`**; persisted JSON in **`localStorage`** key **`pd-admin-ui-v1`** (`schemaVersion: 1`); **`#pd-admin-root`** data attributes for appearance, sidebar mode/theme, content width, sticky topbar, footer visibility.
- **UI:** **`AdminThemeCustomizer`** (drawer), **`AdminSidebar`** (expanded/collapsed desktop + light/dark rail; mobile overlay unchanged), **`AdminTopbar`** (sidebar toggle, notifications menu, theme control, profile menu), **`AdminFooter`** (optional), **`AdminContent`** (contained/full).
- **APIs (existing only):** **`AdminProfileMenu`** → **`GET /api/admin/auth/me`** on first open; **`AdminNotificationsMenu`** → **`GET /api/notifications`** for badge + preview. **No** new notification or auth routes for chrome.
- **Logout:** Unchanged **`signOut()`** — **`POST /api/admin/auth/logout`** then **`/admin/login`** (also in sidebar and profile menu).

**Detail:** [`docs/ADMIN_UI_LARKON_THEME_CHROME_PLAN.md`](./ADMIN_UI_LARKON_THEME_CHROME_PLAN.md) — **§14 Final status** (checklist, files, limitations, build note).

---

## Implemented Foundation (2026-05-09)

This section records what is **live in the codebase** after the first implementation pass. Path A (**Tailwind + scoped tokens**, no Bootstrap / no Larkon `app.scss`) is in use.

### Layout and shell

- **`AdminLayoutShell`** (`src/components/admin-ui/AdminLayoutShell.tsx`) — client shell: `#pd-admin-root`, mobile overlay, sidebar slide-in, main column with topbar + content. **Auth unchanged:** same `signOut()` → `POST /api/admin/auth/logout` then `window.location.href = "/admin/login"`.
- **`AdminSidebar`** — scrollable nav from **`ADMIN_NAV_ITEMS`** (`src/components/admin-ui/admin-nav.tsx`). **Order** aligned with product priorities: Dashboard → Areas → Doctors → AI Technicians → Customers → Service requests → Animals → Treatment records → Prescriptions → Billing → Knowledge Hub → **Notifications & SMS** (Bangla label) → Settings. Brand block: **প্রাণী ডাক্তার** / **Prani Doctor** admin.
- **`AdminTopbar`** — mobile: menu, section title, **`AdminNotificationsMenu`**, theme drawer control, **`AdminProfileMenu`** (logout inside profile). Desktop: sidebar width toggle, brand, section title, same menus + theme. No separate text logout on topbar (sidebar retains logout).
- **`AdminContent`** — padded main region with optional **`max-w-[1600px]`** centered wrapper (`contained` default `true`).
- **Dashboard layout** (`src/app/admin/(dashboard)/layout.tsx`) — still **`ensureAdminDashboardAccess()`** + Noto Sans Bengali; imports **`../admin-shell.css`**; wraps children in **`AdminLayoutShell`** (replaces direct `AdminDashboardShell` usage).
- **`AdminDashboardShell`** — thin **deprecated re-export** of `AdminLayoutShell` for older docs/imports (`src/components/admin/AdminDashboardShell.tsx`).

### Scoped styling

- **`src/app/admin/admin-shell.css`** — CSS variables under **`#pd-admin-root`**: appearance (light / dark / system), sidebar width (expanded / collapsed; mobile overlay forces expanded width), sidebar light/dark rail tokens, sticky desktop topbar, card shadows, primary/surface/border/muted. Loaded only from the **admin dashboard** layout.

### Reusable primitives (`src/components/admin-ui/`)

| Export | Role |
|--------|------|
| `AdminPageHeader` | Title, description, optional actions row |
| `AdminStatCard` | Larkon-style KPI tile (optional `lucide` icon in soft circle) |
| `AdminTable` | Bordered card + optional toolbar + horizontal scroll; child = `<table>` contents |
| `AdminFormSection` | Grouped form block with optional title/description |
| `AdminActionButton` | Primary / secondary / ghost / danger / link; **`href`** → `next/link`, else `<button>` |
| `AdminBadge` | Status tint variants |
| `AdminEmptyState` | Empty list / section placeholder |
| `AdminLoadingState` | Skeleton + message |
| `AdminErrorState` | Alert + optional retry (`use client`) |
| `index.ts` | Barrel re-exports |

### Final admin UI standard (mandatory for new pages)

**Authoritative document:** [`docs/ADMIN_UI_DESIGN_RULES.md`](./ADMIN_UI_DESIGN_RULES.md) — use that file for the full rule set, prohibitions, and new-page checklist. The following is a short in-plan summary.

1. **Shell:** Routes under `src/app/admin/(dashboard)/` render inside **`AdminLayoutShell`** → **`AdminTopbar`** + **`AdminContent`** (enforced by layout). Avoid parallel full-viewport wrappers that bypass `AdminContent` padding/max-width unless a PR documents an exception (e.g. full-bleed maps).
2. **Page chrome:** Use **`AdminPageHeader`** for title, description, and actions. Avoid ad-hoc `<h1>` + loose copy for the same role.
3. **Data surfaces:** Lists → **`AdminTable`** (+ optional toolbar); filters → **`AdminFormSection`** or a compact strip with **`AdminActionButton`**; status chips → **`AdminBadge`**; empty / loading / retry → **`AdminEmptyState`**, **`AdminLoadingState`**, **`AdminErrorState`**.
4. **Forms:** **`AdminFormSection`** blocks; **`AdminActionButton`** for submit, cancel, and navigation.
5. **KPIs:** **`AdminStatCard`** for metric tiles.
6. **Stubs:** Use **`AdminPlaceholder`** ( **`AdminPageHeader`** + **`AdminEmptyState`** ) until APIs and flows exist.
7. **Copy:** **Bangla-first** labels consistent with **`ADMIN_NAV_ITEMS`**; English for `title` tooltips and legacy server validation strings until i18n.
8. **Branding:** **প্রাণী ডাক্তার** / **Prani Doctor** in shell and login; no competing product names in admin UI copy.
9. **Dependencies:** No Bootstrap, Larkon `app.scss`, or template package bloat; extend **`admin-shell.css`** + Tailwind for tokens.

### UI consistency pass (2026-05-09)

- **`AdminPlaceholder`** — uses **`AdminPageHeader`** + **`AdminEmptyState`**; stub routes (**কাস্টমার**, **প্রাণীর প্রোফাইল**, **চিকিৎসা রেকর্ড**, **প্রেসক্রিপশন**, **সার্ভিস ক্যাটাগরি**) use aligned Bengali titles/descriptions.
- **`/admin/settings`** — hub uses **`AdminPageHeader`**, **`AdminFormSection`**, **`AdminActionButton`** (billing entry only for now).
- **`AdminContent` / `AdminLayoutShell`** — flex column **`min-h-0`** and main **`overflow-y-auto`** so long pages scroll within the shell without overlapping sidebar/topbar.
- **`/admin/login`** — branding line **Prani Doctor · অ্যাডমিন** and clearer Bengali subtitle.
- **Template hygiene:** No Larkon template tree under `pranidoctor-web`; only comments reference Larkon.

#### Remaining known issues (tracked)

- Mixed **English** validation / error strings on some migrated forms (doctors, areas, billing, etc.).
- **Billing** list KPI sums over **current page** only (see Billing section).
- **SMS** has no persisted delivery log in Prisma (admin SMS table is explanatory placeholder).
- **Dashboard** “recent requests” table is global last 8 rows, not scoped to assignee.

### Dashboard page (redesign completed — 2026-05-09)

- **Route:** `/admin` (unchanged). **Auth:** unchanged layout `ensureAdminDashboardAccess()` + session.
- **UI:** Larkon-inspired **অপারেশন ড্যাশবোর্ড** with `AdminPageHeader`, KPI grid (`AdminStatCard`), **দ্রুত কাজ** link cards, **সাম্প্রতিক সেবা অনুরোধ** table (`AdminTable` + `AdminBadge` + `AdminEmptyState`), Bengali copy.
- **Data:** `getAdminDashboardPageData()` in `_lib/dashboard-stats.ts` — extends Prisma aggregates (doctors, **AI technicians**, customers, service requests, pending, **completed requests**, finalized treatments, **paid vs issued/partial/paid billing sums**, **unread notifications** for the signed-in admin `userId`) + **8 most recent** service requests for the table. **No schema or API route changes.**

### Dependencies

- **No new npm packages.** Larkon-only libraries (Bootstrap, ApexCharts, GridJS, next-auth, etc.) were **not** added.

### Follow-ups (not done in this pass)

- **Customer / animal / report / prescription / service-category** routes remain **data placeholders** until APIs ship; chrome is now aligned via **`AdminPlaceholder`** / settings hub (see **UI consistency pass** above).
- **`/admin/service-categories`** remains **unlisted** in nav until the feature ships.
- **Dashboard:** no charts (no ApexCharts). “Recent” table is **last 8 service requests globally**, not filtered by assignee. **SMS** delivery is not in Prisma — only in-app **`Notification`** unread count for the signed-in admin.

### Dashboard migration — files touched (2026-05-09)

| File | Change |
|------|--------|
| `src/app/admin/(dashboard)/page.tsx` | Uses `getAdminDashboardPageData` + `AdminDashboardView`. |
| `src/app/admin/(dashboard)/_lib/dashboard-stats.ts` | Extended aggregates; `getAdminDashboardPageData`; recent rows; unread notifications. |
| `src/app/admin/(dashboard)/_components/AdminDashboardView.tsx` | **New** — Larkon-style dashboard (server component). |
| `docs/ADMIN_UI_LARKON_MIGRATION_PLAN.md` | Dashboard marked complete; this table. |

**Dashboard — known limitations**

- **`StatCard`** shim still used elsewhere; dashboard uses **`AdminStatCard`** via the view only.
- **Unread notifications** = `Notification` rows for **`userId ===` JWT `sub`** with `readAt == null` (not all users).
- **Paid revenue** = `BillingRecord` sum where **`status === PAID`**; card description still shows issued + partial + paid total for context.

### Area management pages (migrated — 2026-05-09)

**Routes (unchanged):** `/admin/areas`, `/admin/areas/new`, `/admin/areas/[id]/edit`. **APIs / Prisma:** unchanged — same list filters, pagination, PATCH/DELETE activate/deactivate, POST/PATCH create/edit, parent hierarchy rules (`AreaForm` + `parent-options`).

**UI:** Larkon-inspired layout using **`AdminPageHeader`**, **`AdminActionButton`**, **`AdminFormSection`** (filters + form blocks), **`AdminTable`** (list + toolbar pagination), **`AdminBadge`** (সক্রিয় / নিষ্ক্রিয়), **`AdminEmptyState`**, **`AdminLoadingState`**, **`AdminErrorState`** (list load + form load with retry). Shared **`areaTypeBn()`** for বিভাগ / জেলা / উপজেলা / ইউনিয়ন / গ্রাম / সার্ভিস এরিয়া in filters, table, and type select.

| File | Change |
|------|--------|
| `src/app/admin/(dashboard)/areas/page.tsx` | `AdminPageHeader` + primary action. |
| `src/app/admin/(dashboard)/areas/new/page.tsx` | Header + back control + copy. |
| `src/app/admin/(dashboard)/areas/[id]/edit/page.tsx` | Same pattern. |
| `src/components/admin/areas/AreasList.tsx` | Foundation components; Bengali chrome; logic preserved. |
| `src/components/admin/areas/AreaForm.tsx` | Sectioned form + loading/error primitives; logic preserved. |
| `src/components/admin/areas/area-labels.ts` | **New** — `areaTypeBn()` for hierarchy labels. |

**Remaining / minor**

- Validation error strings for slug/sort order remain **English** (existing messages).
- Row action buttons use **`AdminActionButton` `ghost`**; padding is slightly tighter than default ghost.

### Doctor management pages (migrated — 2026-05-09)

**Routes (unchanged):** `/admin/doctors`, `/admin/doctors/new`, `/admin/doctors/[id]`, `/admin/doctors/[id]/edit`. **APIs / Prisma:** unchanged — same list search, pagination, POST create, PATCH profile, PUT working-areas / service-categories, POST `approve` / `verify` / `activate` / `reject` / `suspend` on list and detail.

**UI:** Larkon-style **`AdminPageHeader`**, **`AdminFormSection`**, **`AdminTable`** + toolbar, **`AdminBadge`** (account, provider, verification summaries in Bangla via **`doctor-labels.ts`**), **`AdminActionButton`**, **`AdminEmptyState`**, **`AdminLoadingState`**, **`AdminErrorState`** (list + detail load + form load with retry). Bengali labels e.g. **ডাক্তার**, **যাচাই**, **অনুমোদন**, **সক্রিয়**, **সাসপেন্ডেড** (as **সাসপেন্ড** action), **সার্ভিস এলাকা**, **ভিজিট ফি**, **জরুরি সেবা**.

| File | Change |
|------|--------|
| `src/app/admin/(dashboard)/doctors/page.tsx` | `AdminPageHeader` + **নতুন ডাক্তার**. |
| `src/app/admin/(dashboard)/doctors/new/page.tsx` | Header + back + copy. |
| `src/app/admin/(dashboard)/doctors/[id]/page.tsx` | Detail shell. |
| `src/app/admin/(dashboard)/doctors/[id]/edit/page.tsx` | Edit shell. |
| `src/components/admin/doctors/DoctorsList.tsx` | Admin-ui list + table; logic preserved. |
| `src/components/admin/doctors/DoctorDetailPanel.tsx` | Sectioned profile + actions. |
| `src/components/admin/doctors/DoctorProfileForm.tsx` | Sectioned form + load error retry. |
| `src/components/admin/doctors/doctor-labels.ts` | **New** — BN labels + badge variant helpers. |

**Remaining / minor**

- Form validation messages (slug-like rules for experience/fee/password) remain **English**.
- List row packs many moderation buttons; on very narrow screens the actions column wraps heavily (acceptable for admin desktop-first).

### AI technician management pages (migrated — 2026-05-09)

**Routes (unchanged):** `/admin/ai-technicians`, `/admin/ai-technicians/new`, `/admin/ai-technicians/[id]`, `/admin/ai-technicians/[id]/edit`. **APIs / Prisma:** unchanged — same list search, pagination, POST create, PATCH profile, PUT working-areas / service-categories, POST `approve` / `verify` / `activate` / `reject` / `suspend`.

**UI:** Larkon-style **`AdminPageHeader`**, **`AdminFormSection`**, **`AdminTable`** + toolbar, **`AdminBadge`** (verification + provider stacked; account; **সার্ভিস এলাকা** summary chips for working / village / service counts), **`AdminActionButton`**, **`AdminEmptyState`**, **`AdminLoadingState`**, **`AdminErrorState`** (list + detail + form refs/technician load with retry). Bengali labels: **এআই টেকনিশিয়ান**, **কৃত্রিম প্রজনন** (service-category section copy), **সার্ভিস এলাকা**, **যাচাইকরণ**, **সক্রিয়** / **অনুমোদন অপেক্ষমাণ** (via shared verification/provider strings from **`technician-labels.ts`** → `doctor-labels`).

| File | Change |
|------|--------|
| `src/app/admin/(dashboard)/ai-technicians/page.tsx` | `AdminPageHeader` + primary action. |
| `src/app/admin/(dashboard)/ai-technicians/new/page.tsx` | Header + back + copy. |
| `src/app/admin/(dashboard)/ai-technicians/[id]/page.tsx` | Detail shell. |
| `src/app/admin/(dashboard)/ai-technicians/[id]/edit/page.tsx` | Edit shell. |
| `src/components/admin/ai-technicians/TechniciansList.tsx` | Admin-ui list + table; logic preserved. |
| `src/components/admin/ai-technicians/TechnicianDetailPanel.tsx` | Sectioned profile + chips + actions. |
| `src/components/admin/ai-technicians/TechnicianProfileForm.tsx` | Sectioned form + refs/technician error retry. |
| `src/components/admin/ai-technicians/technician-labels.ts` | **New** — re-exports BN badge helpers from `doctor-labels` (same `verificationSummary` pipeline). |

**Remaining / minor**

- Validation messages for fee/password remain **English** (unchanged).
- List row action density matches doctors (desktop-first).

### Service request / booking pages (migrated — 2026-05-09)

**Routes (unchanged):** `/admin/service-requests`, `/admin/service-requests/[id]`. **APIs:** unchanged — `GET` list with `status`, `serviceType`, `areaId`, pagination; `GET` detail; `POST` `assign-doctor` / `assign-technician` (same eligibility rules in UI).

**UI:** **`AdminPageHeader`**; list uses **status tab strip** (`AdminActionButton`) plus **`AdminFormSection`** for type/area filters; **`AdminTable`** + toolbar pagination; **`AdminBadge`** for status, service type, and **জরুরি** when `EMERGENCY_DOCTOR` or `isEmergency`; detail uses **`AdminFormSection`** cards (সারাংশ, গ্রাহক, পশু, ডাক্তার ও এআই টেকনিশিয়ান, বিবরণ) + **`ServiceRequestAssignmentActions`** in **`AdminFormSection`**; **`AdminLoadingState`**, **`AdminErrorState`** with retry on detail load. Shared BN + badge helpers in **`service-request-labels.ts`** (**সেবা অনুরোধ**, **জরুরি**, **ডাক্তার হোম ভিজিট**, **এআই সার্ভিস**, **অপেক্ষমাণ**, **গ্রহণ করা হয়েছে**, **সম্পন্ন**, **বাতিল**, etc.). **Billing:** not included on request DTO — no billing card (unchanged data model).

| File | Change |
|------|--------|
| `src/app/admin/(dashboard)/service-requests/page.tsx` | `AdminPageHeader` + list. |
| `src/app/admin/(dashboard)/service-requests/[id]/page.tsx` | Header + back + detail. |
| `src/components/admin/service-requests/ServiceRequestsList.tsx` | Tabs + `AdminTable`; logic preserved. |
| `src/components/admin/service-requests/ServiceRequestDetailPanel.tsx` | Sectioned cards + load retry. |
| `src/components/admin/service-requests/ServiceRequestAssignmentActions.tsx` | `AdminFormSection` + `AdminActionButton`; copy BN. |
| `src/components/admin/service-requests/service-request-labels.ts` | **New** — BN status/type + emergency helper. |

**Remaining / minor**

- Dashboard recent-requests table still uses its own duplicate status/type BN helpers (could import `service-request-labels` later).

### Billing & commission admin (migrated — 2026-05-09)

**Routes (unchanged):** `/admin/billing`, `/admin/billing/[id]`, `/admin/settings/billing`. **APIs / calculations:** unchanged — same list filters and pagination (`GET /api/admin/billing`), detail (`GET /api/admin/billing/[id]`), settings get/put (`/api/admin/settings/billing`); **`admin-billing-service`** commission formula text and stored amounts unchanged.

**UI:** **`AdminPageHeader`** (list links to commission settings); list uses **`AdminStatCard`** rows (filtered **total** count + **current-page** sums for collections, commission, payout, service fee, travel+medicine, discount — page sums labeled explicitly); **`AdminFormSection`** filters; **`AdminTable`** + toolbar pagination; **`AdminBadge`** for **পেমেন্ট স্ট্যাটাস**; **`formatBdt`** (৳ + `en-BD`) in **`billing-labels.ts`**. Detail: **`AdminStatCard`** strip for **সার্ভিস ফি**, **যাতায়াত খরচ**, **ওষুধ খরচ**, **ডিসকাউন্ট**, **মোট আদায়**, **প্ল্যাটফর্ম কমিশন**, **প্রোভাইডার পেআউট**; sections for payment/billing status, commission formula block (unchanged English lines from server), linked records; **`AdminLoadingState` / `AdminErrorState`** + retry. Settings form: **`AdminFormSection`**, **`AdminActionButton`**, load/save error handling.

| File | Change |
|------|--------|
| `src/app/admin/(dashboard)/billing/page.tsx` | `AdminPageHeader` + settings shortcut. |
| `src/app/admin/(dashboard)/billing/[id]/page.tsx` | Header + back + detail. |
| `src/app/admin/(dashboard)/settings/billing/page.tsx` | `AdminPageHeader` + back. |
| `src/components/admin/billing/AdminBillingList.tsx` | Stat cards + `AdminTable`; logic preserved. |
| `src/components/admin/billing/AdminBillingDetail.tsx` | Stat cards + sections + retry. |
| `src/components/admin/billing/AdminBillingSettingsForm.tsx` | Sections + admin primitives. |
| `src/components/admin/billing/billing-labels.ts` | **New** — BDT format, BN payment/method/billing labels, payment badge variants. |

**Remaining / minor**

- List **stat card money totals** are sums over the **current page** only (API does not return global aggregates for filtered rows). Full-list totals would need a future API extension.

### Knowledge Hub / Tutorial admin (migrated — 2026-05-09)

**Routes (unchanged):** `/admin/knowledge-hub` hub, `/admin/knowledge-hub/categories`, `categories/new`, `categories/[id]/edit`, `/admin/knowledge-hub/posts`, `posts/new`, `posts/[id]`, `posts/[id]/edit`. **APIs / Prisma / workflows:** unchanged — same `ContentPost`-backed tutorials list (`GET /api/admin/tutorials` with filters), detail, `POST` `submit` / `approve` / `reject`, create `POST` / edit `PATCH`, categories `GET/POST/PATCH` on `/api/admin/content-categories*`.

**UI:** Larkon-style **`AdminPageHeader`**, **`AdminFormSection`**, **`AdminTable`** (posts + categories lists), **`AdminBadge`** (approval status via **`KnowledgeHubStatusBadge`** + **`knowledge-hub-labels.ts`**: **অনুমোদন অপেক্ষমাণ**, **অনুমোদিত**, **বাতিল**, খসড়া; category name chips; active yes/no on categories), **`AdminActionButton`**, **`AdminLoadingState`**, **`AdminEmptyState`**, **`AdminErrorState`** with retry on detail and edit form loads. Bengali chrome: **নলেজ হাব**, **টিউটোরিয়াল**, **ক্যাটাগরি**, **লেখক**, list/detail layout preserved.

| File | Change |
|------|--------|
| `src/components/admin/knowledge-hub/knowledge-hub-labels.ts` | **New** — BN approval labels + `AdminBadge` variant mapping + English `title` tooltips. |
| `src/components/admin/knowledge-hub/KnowledgeHubStatusBadge.tsx` | Uses **`AdminBadge`** + label helpers. |
| `src/components/admin/knowledge-hub/KnowledgeHubPostsList.tsx` | Filters in **`AdminFormSection`**; **`AdminTable`** rows; status + category badges; loading/empty/error. |
| `src/components/admin/knowledge-hub/KnowledgeHubCategoriesList.tsx` | Search section + **`AdminTable`** + badges + primitives. |
| `src/components/admin/knowledge-hub/KnowledgeHubPostDetailView.tsx` | **`AdminPageHeader`** + sectioned preview; submit / approve / reject actions on **`AdminActionButton`**. |
| `src/components/admin/knowledge-hub/KnowledgeHubPostForm.tsx` | Sectioned create/edit form + load error retry. |
| `src/components/admin/knowledge-hub/KnowledgeHubCategoryForm.tsx` | Sectioned form + load error retry. |
| `src/app/admin/(dashboard)/knowledge-hub/**/page.tsx` | **`AdminPageHeader`** / **`AdminActionButton`** shells on hub, lists, new, edit, detail wrapper. |

**Remaining / minor**

- Body editor remains plain **textarea** (no rich-text bundle change).
- Form cancel control label **বাতিল** is navigate-back (unchanged pattern); rejected **status** label **বাতিল** is separate in badges.

### Notifications & SMS admin (migrated — 2026-05-09)

**Routes (unchanged):** `/admin/notifications`. **APIs:** unchanged — same **`GET/PATCH /api/notifications`**, **`PATCH /api/notifications/read-all`**, **`PATCH /api/notifications/[id]/read`** via `requireNotificationViewer` (admin cookie session). **SMS:** no new persisted log API; runtime still uses **`getSmsService()`** / `SMS_PROVIDER` / local logger vs HTTP placeholder (`src/lib/sms/*`). **Admin-only read-only snapshot** **`getSmsAdminStatusSnapshot()`** in `src/lib/sms/service.ts` exposes booleans and provider names only (no URLs, API keys, OTPs, or message bodies).

**UI:** **`AdminPageHeader`**; **`AdminSmsStatusSection`** (`AdminFormSection` + **`AdminStatCard`** + **`AdminBadge`** for **লোকাল লগ**, **প্রোডাকশন প্রোভাইডার**, **পাঠানো হয়েছে** / **ব্যর্থ** / **অপেক্ষমাণ** semantics where applicable); **`AdminSmsLogsSection`** — table chrome + empty row explaining no DB log yet; **`AdminNotificationsPanel`** — filters, **`AdminTable`** rows, event type badges (**ওটিপি** copy in SMS section), read state (**অপেক্ষমাণ** / **পঠিত**), **`AdminLoadingState` / `AdminEmptyState` / `AdminErrorState`**. Doctor panel still uses **`NotificationListPanel`** unchanged.

| File | Change |
|------|--------|
| `src/lib/sms/service.ts` | **`SmsAdminStatusSnapshot`** + **`getSmsAdminStatusSnapshot()`** (safe admin dashboard fields). |
| `src/components/admin/notifications/notification-sms-labels.ts` | **New** — BN notification types, read badges, SMS provider labels + runtime badge copy. |
| `src/components/admin/notifications/AdminSmsStatusSection.tsx` | **New** — provider status cards + badges. |
| `src/components/admin/notifications/AdminSmsLogsSection.tsx` | **New** — placeholder SMS log table + BN explanation. |
| `src/components/admin/notifications/AdminNotificationsPanel.tsx` | **New** — admin Larkon-style list (same notification API contract). |
| `src/app/admin/(dashboard)/notifications/page.tsx` | Composes header + SMS sections + **`AdminNotificationsPanel`**. |

**Remaining / minor**

- Persisted SMS / delivery webhooks would need a future Prisma model + admin API before the log table can list real rows.

---

## 1. Current Prani Doctor admin structure audit

### 1.1 Admin routes and pages

| Area | Path | Notes |
|------|------|--------|
| Login (public under `/admin`) | `/admin/login` | Custom page + `AdminLoginForm`; middleware allows without session |
| Dashboard | `/admin` | Server page; **`AdminDashboardView`** + `getAdminDashboardPageData` / `_lib/dashboard-stats` |
| Service requests | `/admin/service-requests`, `/admin/service-requests/[id]` | **Larkon-style admin UI** — migrated `2026-05-09` (see **Service request / booking pages**) |
| Doctors | `/admin/doctors`, `new`, `[id]`, `[id]/edit` | **Larkon-style admin UI** — migrated `2026-05-09` (see **Doctor management pages**) |
| AI technicians | `/admin/ai-technicians`, `new`, `[id]`, `[id]/edit` | **Larkon-style admin UI** — migrated `2026-05-09` (see **AI technician management pages**) |
| Customers | `/admin/customers` | **`AdminPlaceholder`** — aligned BN chrome; no list API yet |
| Areas | `/admin/areas`, `new`, `[id]/edit` | **Larkon-style admin UI** — `AdminPageHeader`, `AdminFormSection`, `AdminTable`, badges, empty/loading/error (`2026-05-09`) |
| Animals | `/admin/animals` | **`AdminPlaceholder`** — aligned BN chrome; no list API yet |
| Treatment records | `/admin/reports` | **`AdminPlaceholder`** — aligned BN chrome; no list API yet |
| Prescriptions | `/admin/prescriptions` | **`AdminPlaceholder`** — aligned BN chrome; no list API yet |
| Billing | `/admin/billing`, `/admin/billing/[id]` | **Larkon-style admin UI** — migrated `2026-05-09` (see **Billing & commission admin**); settings at `/admin/settings/billing` |
| Notifications | `/admin/notifications` | **Larkon-style admin UI** — migrated `2026-05-09` (see **Notifications & SMS admin** above); **`NotificationListPanel`** retained for doctor panel |
| Knowledge Hub | `/admin/knowledge-hub` hub + categories + posts CRUD | **Larkon-style admin UI** — migrated `2026-05-09` (see **Knowledge Hub / Tutorial admin** above); APIs unchanged |
| Settings | `/admin/settings`, `/admin/settings/billing` | **Hub:** `AdminPageHeader` + `AdminFormSection` + `AdminActionButton` (`2026-05-09`). **Billing:** full form (`AdminBillingSettingsForm`) |
| Service categories | `/admin/service-categories` | **`AdminPlaceholder`** — aligned BN chrome — **not linked in sidebar** (`ADMIN_NAV_ITEMS`) |

Route group: `src/app/admin/(dashboard)/` for authenticated shell; `src/app/admin/login/` sits outside that group.

### 1.2 Layout files

- **Root app layout:** `src/app/layout.tsx` — Geist fonts, `globals.css`, minimal shell (`body` flex column).
- **Admin dashboard layout:** `src/app/admin/(dashboard)/layout.tsx` — **Server Component**:
  - Calls `ensureAdminDashboardAccess()` (Prisma-backed; complements middleware).
  - Applies **Noto Sans Bengali** via `next/font/google` on a wrapper `div`.
  - Imports **`admin-shell.css`** and renders **`AdminLayoutShell`** around `{children}` (see **Implemented Foundation**).
- **No** `src/app/admin/layout.tsx` — login page does not inherit the dashboard shell (correct for UX).

### 1.3 Auth-protected area

| Layer | Implementation |
|--------|----------------|
| Edge / Node middleware | `src/middleware.ts` — matcher `/admin`, `/admin/:path*`. Cookie `ADMIN_SESSION_COOKIE`; `verifyAdminToken`. Unauthenticated users redirected to `/admin/login?next=…`. Login path exempt; session redirects to `/admin` if already signed in. |
| Server layout guard | `ensureAdminDashboardAccess()` in `src/lib/admin-auth/dashboard-guard.ts` — `getAdminSession()` + `resolveAdminPanelActor()`; clears cookie and redirects if actor invalid. |
| Admin APIs | `requireAdminPanelApiAccess` / `requireAdminApiActor` in `src/lib/admin-auth/api-guard.ts` on `src/app/api/admin/**` routes. |
| Browser API calls | `adminFetch()` in `src/lib/admin/admin-fetch.ts` — same-origin `fetch` with credentials for cookie session. |

**Important:** Prani Doctor admin auth is **custom JWT-in-cookie + Prisma role checks**, not NextAuth.

### 1.4 Sidebar, topbar, header usage

Single client shell: **`AdminLayoutShell`** in `src/components/admin-ui/` (alias: deprecated **`AdminDashboardShell`** re-export).

- **Sidebar:** Fixed / slide-in on mobile; emerald/zinc + scoped CSS variables; **Bangla** labels + English `title` tooltips; **lucide-react** icons; nav from **`ADMIN_NAV_ITEMS`** in `admin-nav.tsx`.
- **Top area:** Mobile sticky bar (menu, section title, logout); desktop bar with brand + section title.
- **Content:** `<main>` in **`AdminContent`** — padded, optional **`max-w-[1600px]`** inner wrapper; scrollable region **`min-h-0 overflow-y-auto`** so main column does not spill under the sidebar on long pages.

There is no separate “page title” breadcrumb component; each page composes its own headings.

### 1.5 CSS, theme, Tailwind, global styles

- **Tailwind CSS v4** via `@import "tailwindcss"` in `src/app/globals.css`, with `@theme inline` for CSS variables (background/foreground, Geist font vars).
- **Dark mode:** Mostly `dark:` Tailwind classes; `:root` in `globals.css` uses `prefers-color-scheme` for base variables — **not** `next-themes` at root (dependency exists in `package.json` but is unused in `src` as of audit).
- **No Bootstrap / SCSS** in the Prani app today.
- Utility helper: `src/lib/cn.ts` — `clsx` + `tailwind-merge`.

### 1.6 Reusable admin UI components (existing)

| Component / area | Role |
|------------------|------|
| `AdminLayoutShell` (+ sidebar/topbar/content) | Full admin chrome |
| `AdminDashboardShell` | Deprecated alias → `AdminLayoutShell` |
| `AdminLoginForm` | Login UX |
| `AdminPlaceholder` | Stub routes — **`AdminPageHeader`** + **`AdminEmptyState`** (consistency pass `2026-05-09`) |
| `StatCard` | Dashboard metric tiles (shim → `AdminStatCard`) |
| `admin-ui/*` primitives | Page header, table chrome, forms, badges, empty/loading/error, buttons |
| `areas/*`, `doctors/*`, `ai-technicians/*`, `service-requests/*`, `billing/*`, `knowledge-hub/*`, `notifications/*` | Feature-specific lists, forms, panels (**knowledge-hub**, **notifications** aligned with `admin-ui` primitives, `2026-05-09`) |
| `components/notifications/NotificationListPanel` | Shared notifications UI (doctor + legacy-style); admin route uses **`AdminNotificationsPanel`** |

**Shared patterns:** `adminFetch` + `readAdminJson` for API error handling; heavy use of client components with `useState`/`useEffect` for tables and filters.

---

## 2. Larkon template audit

**Source:** `Larkon\TS\` — Next.js App Router with **route groups** `(admin)` and `(other)`.

### 2.1 App / pages routing style

- **`(admin)`** — Main dashboard demo routes (e.g. `dashboard`, `products`, `orders`, `tables`, `forms`, …).
- **`(other)`** — Auth marketing-style pages (`auth/sign-in`, `sign-up`, …) and misc (`404`, maintenance).
- **Layouts:** `(admin)/layout.tsx` composes shell: `AuthProtectionWrapper` → `wrapper` div → **dynamic** `TopNavigationBar` + `VerticalNavigationBar` → `page-content` → `container-fluid` + `Footer`.

### 2.2 Layout structure (conceptual)

```
AuthProtectionWrapper (client; NextAuth session)
  └─ .wrapper
       ├─ TopNavigationBar (topbar)
       ├─ VerticalNavigationBar (sidebar)
       └─ .page-content > .container-fluid > children + Footer
```

### 2.3 Sidebar design

- **`VerticalNavigationBar/page.tsx`:** `LogoBox`, `HoverMenuToggle`, **SimpleBar** scroll (`simplebar-react`), `AppMenu` fed by `getMenuItems()` from `src/helpers/Manu.ts` (re-exports `MENU_ITEMS` from `src/assets/data/menu-items`).
- Styling driven by **SCSS** (`structure/vertical`, components) and **Bootstrap** grid/utilities.

### 2.4 Topbar design

- **`TopNavigationBar/page.tsx`:** `header.topbar` with `LeftSideBarToggle`, `TopBarTitle`, `ThemeModeToggle`, `Notifications`, `ThemeCustomizerToggle`, `ActivityStreamToggle`, `ProfileDropdown`, optional search form.
- Uses **Iconify** via `IconifyIcon` wrapper (`@iconify/react` in template `package.json`).

### 2.5 Dashboard cards

- Example: `src/app/(admin)/dashboard/components/Stats.tsx` — **`react-bootstrap`** `Card`, `Row`, `Col`; optional **ApexCharts** (`react-apexcharts`); **Iconify** icons; demo data.

### 2.6 Tables

- Dependencies include **`gridjs` / `gridjs-react`**, **`@tanstack/react-table`**, and SCSS for GridJS theme (`app.scss` imports `gridjs/dist/theme/mermaid.css`).
- Demo pages under `(admin)/tables/*`.

### 2.7 Forms

- **`react-hook-form`** + **`@hookform/resolvers`** + **`yup`** (template) vs Prani’s **zod** + `@hookform/resolvers` — same hook-form family; validation library differs.
- **`react-select`**, **`react-flatpickr`**, **`choices.js`**, **`react-quill-new`**, masks, dropzone — rich form ecosystem in template.

### 2.8 Buttons, badges, modals, dropdowns

- Primarily **Bootstrap 5** + **react-bootstrap** (`Button`, `Modal`, `Dropdown`, `Badge`, etc.).
- **SweetAlert2** + `sweetalert2-react-content` for alerts.
- **react-toastify** in `AppProvidersWrapper`.

### 2.9 Theme, color, font, assets

- **Global SCSS entry:** `src/assets/scss/app.scss` imports Bootstrap functions/variables/mixins, **`config/variables`**, **`variables-dark`**, **`variables-custom`**, full Bootstrap, then structure + components + plugins (simplebar, calendar, gridjs, apexcharts, maps, flatpickr, swiper, toastify, …).
- **Root layout font:** **Play** (Google) on `body`.
- **Splash screen** inline styles + logo image in root `layout.tsx`.
- **nextjs-toploader** for route progress.

### 2.10 Package dependencies (Larkon TS — highlights)

From `Larkon\TS\package.json`: **next ^16.0.8**, **react ^19.2.1**, **bootstrap ^5.3.8**, **react-bootstrap**, **sass**, **apexcharts** / **react-apexcharts**, **@tanstack/react-table**, **gridjs** / **gridjs-react**, **@fullcalendar/***, **next-auth**, **nextjs-toploader**, **simplebar-react**, **sweetalert2**, **swiper**, **dayjs** / **moment**, **react-toastify**, maps and rating libraries, etc.

### 2.11 Incompatibilities / differences vs current Prani Doctor app

| Topic | Prani Doctor today | Larkon template | Risk / note |
|--------|-------------------|-----------------|-------------|
| Styling stack | Tailwind v4 + minimal global CSS | Bootstrap 5 + large SCSS + many plugins | **High:** global Bootstrap reboot/utilities vs Tailwind preflight and utility naming |
| Auth | Cookie JWT + middleware + Prisma guard | **next-auth** `SessionProvider` + `AuthProtectionWrapper` | **Do not** wire Prani admin to NextAuth for this migration; keep existing auth |
| `next.config` | `next.config.ts`, default strict | `next.config.mjs`, **`reactStrictMode: false`** | Align strict mode consciously; do not copy config blindly |
| Fonts | Geist (root) + Noto Bengali (admin layout) | Play on body | Keep **Noto Bengali** for admin copy; optionally add Larkon display font for Latin UI chrome |
| Icons | `lucide-react` | Iconify + some Solar/BX icons in demos | Choose one system for new shell or map icons gradually |
| Validation | **zod** | **yup** in template demos | Keep zod for Prani forms |
| Theme toggle | OS-driven vars + `dark:` classes | Client theme mode + customizer in template | Decide if Prani admin should adopt explicit theme toggle (`next-themes` already in Prani deps) |

---

## 3. Migration strategy

### 3.1 Principles

1. **Do not paste the entire Larkon app** into Prani Doctor. Treat Larkon as a **design system reference** and a **parts catalog**.
2. **Preserve** all Prani **API routes**, **Prisma** usage, **middleware + JWT + dashboard guard**, and **page URLs** unless a URL change is explicitly approved later.
3. **Replace or evolve only the UI layer:** shell (sidebar/topbar/content frame), shared primitives (cards, tables, forms, empty/loading/error), and per-page presentation — **one vertical slice at a time**.
4. **Auth:** Keep middleware and `ensureAdminDashboardAccess`. If any Larkon wrapper references `useSession`, **do not use it**; optional no-op provider only if a third-party component hard-requires a context (prefer components that do not).

### 3.2 Styling approach (recommended default)

**Avoid loading Larkon’s full `app.scss` into the Prani root** on the first pass: Bootstrap + Tailwind v4 on the same document usually causes **global conflicts** (reboot, buttons, forms, `.container`, etc.).

**Preferred path A — “Larkon look, Prani stack” (lower risk):**

- Extract **colors, radii, shadows, typography scale** from Larkon `variables-custom` / `variables` / dark files into **CSS variables** or **Tailwind `@theme`** extensions in Prani.
- Rebuild **Admin shell** (sidebar, topbar, content frame, page header) as **Tailwind + small scoped CSS** (or CSS modules) matching Larkon spacing and hierarchy.
- Reuse **lucide-react** where possible; introduce **Iconify** only if needed for parity.

**Alternate path B — “Bootstrap inside admin only” (higher risk, faster visual parity):**

- Import Larkon SCSS only under admin layout and **mitigate** Tailwind conflicts by:
  - Tailwind **important selector** scoped to a root id (e.g. `#__prani_public`) for marketing pages if needed, **or**
  - **Disabling Tailwind preflight** globally (usually undesirable), **or**
  - Splitting admin to a separate deployable app (large operational cost — only if product demands).

Path A should be the **default** unless the team explicitly accepts Bootstrap global tradeoffs.

### 3.3 What to extract from Larkon (catalog)

- **Layout:** `wrapper`, `page-content`, `main-nav`, `topbar` behavior (collapse, overlay) — reimplemented in Tailwind.
- **Components:** Card hierarchy, table density, form label/help text, modal/drawer patterns, badge semantics — as Prani React components.
- **Optional plugins (later):** SimpleBar for long nav; ApexCharts only where analytics justify bundle size; GridJS or TanStack Table only if a page needs that pattern — **justify each dependency**.

### 3.4 Adaptation when structures differ

- Larkon `(admin)/layout.tsx` is **not** a drop-in. Prani uses **`AdminLayoutShell`** fed by **`ADMIN_NAV_ITEMS`** in `admin-nav.tsx`, equivalent to Larkon’s `MENU_ITEMS` / `getMenuItems`. The **`AdminDashboardShell`** name remains as a deprecated alias only.
- Larkon’s **`AuthProtectionWrapper`** maps to Prani’s **middleware + `ensureAdminDashboardAccess`** — same responsibility, different implementation; **do not merge** NextAuth into Prini admin without a dedicated auth epic.

---

## 4. Proposed new admin UI architecture (target)

| Layer | Responsibility |
|--------|----------------|
| **Admin layout shell** | Route group layout: fonts, guard, optional theme provider, outer flex/grid. |
| **Admin sidebar** | Collapsible sections, active route, Bengali + optional English subtitle, scroll region, footer actions (logout). |
| **Admin topbar** | Mobile menu trigger, global search (future), quick actions, notifications entry, user menu (future: profile link). |
| **Admin page header** | Title, description, primary actions (buttons), optional breadcrumbs. |
| **Admin content wrapper** | Max width, padding, responsive grid for page body. |
| **Admin cards** | Metric cards, section cards, KPI + chart slots (optional). |
| **Admin tables** | Consistent filter bar, pagination, loading skeleton, empty state, row actions. |
| **Admin forms** | Field spacing, validation messages, sticky footer actions for long forms. |
| **Admin empty states** | Illustration/icon + copy + CTA when lists are empty. |
| **Admin loading / error** | Skeletons, inline alerts, retry; API errors mapped from `readAdminJson` patterns. |

All of the above can ship incrementally behind the same routes.

---

## 5. Page-by-page migration order (recommended)

Order balances **user impact**, **dependency on shell**, and **readiness** (full vs placeholder).

1. ~~**Admin shell + dashboard** (`/admin`)~~ **Done (2026-05-09):** shell + redesigned dashboard (`AdminDashboardView`, extended Prisma stats, recent requests table, quick actions).
2. ~~**Area management**~~ **Done (2026-05-09):** `/admin/areas*` redesigned with admin-ui primitives (see **Area management pages** above).
3. ~~**Doctor management**~~ **Done (2026-05-09):** `/admin/doctors*` redesigned with admin-ui primitives (see **Doctor management pages**).
4. ~~**AI technician management**~~ **Done (2026-05-09):** `/admin/ai-technicians*` redesigned with admin-ui primitives (see **AI technician management pages**).
5. ~~**Service requests + detail**~~ **Done (2026-05-09):** `/admin/service-requests*` redesigned with admin-ui primitives (see **Service request / booking pages**).
6. ~~**Billing list + detail + billing settings**~~ **Done (2026-05-09):** `/admin/billing*`, `/admin/settings/billing` redesigned with admin-ui primitives (see **Billing & commission admin**).
7. ~~**Knowledge Hub**~~ **Done (2026-05-09):** `/admin/knowledge-hub*` hub, categories, posts, detail, editor flows — **`AdminPageHeader`**, **`AdminTable`**, **`AdminFormSection`**, badges, loading/error/retry (see **Knowledge Hub / Tutorial admin** above). Rich text deferred (textarea unchanged).
8. ~~**Notifications**~~ **Done (2026-05-09):** `/admin/notifications` — **`AdminPageHeader`**, SMS provider status (safe snapshot), placeholder SMS log table, **`AdminNotificationsPanel`** + **`AdminTable`** (see **Notifications & SMS admin** above).
9. ~~**Settings hub** (`/admin/settings`)~~ **Done (minimal, 2026-05-09):** index uses **`AdminPageHeader`** + **`AdminFormSection`** + link to billing settings; further settings modules extend the same pattern.
10. **Customer management** — currently placeholder; implement when API exists, using finalized table primitives.
11. **Prescriptions / treatment records (`reports`) / animals** — feature UIs pending APIs; **stub chrome** uses **`AdminPlaceholder`** (aligned empty state) until tables/forms ship.
12. **Service categories** — add to **sidebar** when feature is real; currently page exists but **not in `NAV`**.

**Login page** (`/admin/login`): outside dashboard shell by design; uses Noto Bengali + **`AdminLoginForm`**; branding line aligned with **Prani Doctor** (`2026-05-09`).

---

## 6. Risk list and mitigations

| Risk | Description | Safer approach |
|------|-------------|----------------|
| **Dependency conflict** | Adding `react-bootstrap`, `sass`, charts, and many plugins increases overlap with existing stack and Renovate noise. | Add packages **incrementally**; prefer Tailwind port first; pin versions. |
| **CSS conflict** | Bootstrap vs Tailwind preflight/utilities; both target `body`, `button`, `input`. | Default to **Path A** (tokens + Tailwind components); if Path B, plan explicit conflict testing on `/admin` and public pages. |
| **Next.js version mismatch** | Template `^16.0.8`, Prani `16.2.6` — generally compatible; template uses `next.config.mjs` with `reactStrictMode: false`. | Keep Prani strict mode unless debugging a library; align Next on 16.2.x across repos. |
| **Server / client component boundaries** | Larkon mixes client wrappers heavily; Prani dashboard layout is server-first with client shell. | Keep **server layout** for `ensureAdminDashboardAccess`; client-only for interactivity. |
| **Auth middleware conflict** | Replacing routes or layout tree could skip middleware coverage. | Any new route groups must remain under `src/app/admin/…` matched by `middleware.ts`. |
| **Asset path conflict** | Larkon images/fonts under `src/assets`; Prani may use `public/`. | Namespace admin assets under `public/admin/…` or `src/assets/admin/…`; use `next/image` consistently. |
| **Package bloat** | Full Larkon dependency set is large relative to current Prani web app. | **Budget:** add ApexCharts only when a chart ships; avoid `moment` (template has it) — use `date-fns` already in Prani. |
| **i18n / Bengali** | Larkon demos are English-first. | Preserve **Noto Sans Bengali** and existing Bangla strings; use English for developer-facing settings text where already mixed. |

---

## 7. Exact implementation checklist for the next coding session

Use this as a sprint-ready backlog **after** this document is merged.

1. **Decision record:** Confirm **Path A (Tailwind + tokens)** vs **Path B (Bootstrap in admin)** in team chat or ADR; default Path A unless product requires pixel-perfect Larkon with minimal effort.
2. **Token pass:** Open Larkon `src/assets/scss/config/variables-custom.scss` (and related) and list primary, secondary, neutrals, sidebar width, topbar height — map to Prani `globals.css` `@theme` or a new `src/app/admin/admin-theme.css` imported only from admin layout.
3. **Scaffold components folder:** e.g. `src/components/admin-ui/` (or `src/components/admin/shell/`) for `AdminSidebar`, `AdminTopbar`, `AdminPageHeader`, `AdminContent`, `AdminCard` — **without** changing route behavior.
4. ~~**Refactor `AdminDashboardShell`:**~~ **Done:** `AdminLayoutShell` + `admin-nav.tsx` + `admin-ui` primitives; **`signOut()`** unchanged.
5. **Dashboard page only:** Restyle `StatCard` (or replace with Larkon-inspired metric card) using tokens — verify dark mode behavior.
6. **Visual regression pass:** `/admin`, `/admin/login`, one list page (`/admin/areas`), one detail page — desktop + mobile widths.
7. **Document dependency policy:** Add a short comment in the PR description: “No NextAuth; no full `app.scss` until ADR accepts Bootstrap conflict risk.”
8. **Sidebar gap:** Decide whether to add **`/admin/service-categories`** to navigation when the placeholder is replaced (track as follow-up).

---

## Appendix — quick file index

**Prani (admin UI touchpoints):**

- `docs/ADMIN_UI_DESIGN_RULES.md` — **permanent** admin UI rule set for new pages (see link at top of this doc)
- `docs/ADMIN_UI_LARKON_MIGRATION_PLAN.md` — this migration / audit document
- `src/middleware.ts`
- `src/app/admin/(dashboard)/layout.tsx`
- `src/app/admin/login/page.tsx`
- `src/components/admin-ui/AdminLayoutShell.tsx` (+ `admin-nav.tsx`, `admin-shell.css`)
- `src/components/admin/AdminDashboardShell.tsx` (re-export only)
- `src/lib/admin-auth/*`, `src/lib/admin/admin-fetch.ts`

**Larkon (reference):**

- `Larkon/TS/src/app/(admin)/layout.tsx`
- `Larkon/TS/src/app/layout.tsx` + `src/assets/scss/app.scss`
- `Larkon/TS/src/components/layout/VerticalNavigationBar/page.tsx`
- `Larkon/TS/src/components/layout/TopNavigationBar/page.tsx`
- `Larkon/TS/src/assets/data/menu-items` (menu source)
- `Larkon/TS/package.json`

This plan records **history and migration context**; **all new admin UI work** must comply with **`docs/ADMIN_UI_DESIGN_RULES.md`**. It respects current Prani Doctor architecture, treats Larkon as the visual standard, and calls out the largest technical risk (Bootstrap vs Tailwind) with a default mitigation.
