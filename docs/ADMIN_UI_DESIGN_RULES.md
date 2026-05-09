# Prani Doctor — Admin UI design rules

**Project:** Prani Doctor (Animal Doctors) — web admin panel  
**Code root:** `D:\PraniDoctor\pranidoctor-web`  
**Audience:** Engineers and contributors adding or changing **admin UI** only.

This document is the **permanent** design contract for authenticated admin pages. Historical migration notes and audits live in **`docs/ADMIN_UI_LARKON_MIGRATION_PLAN.md`**, which references this file.

---

## 1. Admin UI source of truth

### Visual and structural reference

- **Larkon — Next.js 16 Ecommerce Management Admin & Dashboard Template**  
  Use it as a **design reference** (spacing, hierarchy, cards, tables, density). Do **not** paste whole demo apps or global Bootstrap/SCSS into Prani Doctor.

### Local template path (read-only on disk)

```
D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2
```

Recommended audit subtree: **`Larkon\TS\`** (TypeScript). A JavaScript variant may exist under **`Larkon\JS\`**.

### Implementation in Prani Doctor

- **Path A:** Tailwind v4 + **`src/app/admin/admin-shell.css`** tokens scoped under **`#pd-admin-root`**.  
- **Components:** `src/components/admin-ui/*` — Prani-owned React primitives that **look** Larkon-inspired but **do not** depend on Larkon’s npm stack.

---

## 2. Core rule

**Every new or updated admin page under `src/app/admin/(dashboard)/` must use the reusable Prani Doctor admin UI foundation** (`AdminLayoutShell`, `AdminContent`, `AdminPageHeader`, tables, forms, badges, states, buttons) instead of inventing one-off page layouts, ad-hoc card CSS, or duplicate chrome.

- **UI-only tasks** must not change business rules, Prisma models, or API contracts unless a separate change is explicitly approved.  
- **Auth** stays: middleware + `ensureAdminDashboardAccess()` + existing admin session APIs.

---

## 3. Required components for future pages

These ship from **`src/components/admin-ui/`** (import from `@/components/admin-ui/...` or the barrel **`@/components/admin-ui`**).

| Component | Role |
|-----------|------|
| **`AdminLayoutShell`** | Root admin chrome: `#pd-admin-root`, sidebar + topbar + scrollable main. Used by dashboard layout — **do not nest a second full shell** inside a page. |
| **`AdminSidebar`** | Navigation; driven by **`ADMIN_NAV_ITEMS`** in `admin-nav.tsx`. |
| **`AdminTopbar`** | Mobile menu, section title, **`AdminNotificationsMenu`** (bell + dropdown), **`AdminThemeCustomizer`** entry, **`AdminProfileMenu`** (profile + settings/billing/logout). |
| **`AdminNotificationsMenu`** | Shell-only bell **dropdown**: unread badge via existing **`GET /api/notifications`**, short preview, link to **`/admin/notifications`**; Bengali-first copy; no duplicate full notification UI on feature pages. |
| **`AdminProfileMenu`** | Shell-only **profile dropdown**: identity from **`GET /api/admin/auth/me`** when the menu first opens (cached until reload), generic **Admin / প্রাণী ডাক্তার** if unavailable; links to settings, billing settings, and **logout** via the same handler as the rest of the shell. |
| **`AdminThemeCustomizer`** | Larkon-style **theme layout drawer** (appearance, sidebar, content width, etc.); opened from the topbar settings control. **Shell-only** — feature pages under `(dashboard)/` do **not** need to render or import it; preferences come from **`useAdminTheme`** / `localStorage` when you need to read settings in other client components. |
| **`AdminFooter`** | Optional shell footer (copyright + admin label + safe links); visibility from **`footerVisible`** in **`useAdminTheme`**. Rendered by **`AdminLayoutShell`** below **`AdminContent`** — **do not** duplicate a full-width footer inside feature pages. |
| **`AdminPageHeader`** | Page title, description, optional action row — **default** page heading pattern. |
| **`AdminContent`** | Main padded column; optional max-width wrapper (`contained`). |
| **`AdminStatCard`** | KPI / summary tiles. |
| **`AdminTable`** | Bordered table chrome + optional toolbar; pass `<thead>` / `<tbody>` as children. |
| **`AdminFormSection`** | Grouped form blocks with title/description. |
| **`AdminBadge`** | Status and type chips (consistent colors). |
| **`AdminEmptyState`** | Empty lists and “no data yet” sections. |
| **`AdminLoadingState`** | Loading skeleton + short message. |
| **`AdminErrorState`** | Recoverable errors + optional retry (`use client`). |

**Also required in practice (same folder):**

| Component | Role |
|-----------|------|
| **`AdminActionButton`** | Primary / secondary / ghost / danger / link — **all** primary actions, back links styled as ghost, and table row actions. |
| **`AdminPlaceholder`** (`src/components/admin/AdminPlaceholder.tsx`) | Stub routes: composes **`AdminPageHeader`** + **`AdminEmptyState`** until the feature exists. |

**Data fetching pattern:** Prefer **`adminFetch`** + **`readAdminJson`** for `/api/admin/*` client calls; notifications and other shared APIs may use the same response shape — follow existing feature modules.

---

## 4. Visual rules

1. **Spacing:** Use shell padding from **`AdminContent`**; inside pages prefer `space-y-6` / `gap-4` style rhythm consistent with migrated pages. Avoid random `px-2` / `mt-1`-only layouts that fight the shell.  
2. **Layout:** **Card-based** sections — **`AdminFormSection`**, **`AdminTable`**, **`AdminStatCard`** — not raw floating divs that mimic cards with one-off borders.  
3. **Tables:** **`AdminTable`** for dense admin lists; toolbar row for filters/pagination when needed.  
4. **Status:** **`AdminBadge`** (and small helpers in feature `*-labels.ts` files when enums are shared).  
5. **Actions:** **`AdminActionButton`**; use **ghost** for “back to list”, **primary** for main CTA, **danger** for destructive moderation.  
6. **Labels:** **Bangla-first** for user-visible chrome; align wording with **`ADMIN_NAV_ITEMS`**. English is fine for **`title`** tooltips on icons/links and for legacy server validation text until a dedicated i18n pass.  
7. **Branding:** **প্রাণী ডাক্তার** / **Prani Doctor** in shell and login — do not introduce other product names in admin copy.  
8. **Responsive:** Desktop-first admin; sidebar overlays on small screens (existing shell). Long pages must scroll **inside** **`AdminContent`** (`min-h-0` / `overflow-y-auto` on the main column) so content does not sit under the fixed sidebar.  
9. **Dark mode:** Support `dark:` variants consistent with existing primitives.

---

## 5. Prohibited

1. **Do not** copy unrelated Larkon demo pages (e-commerce products, orders UI, etc.) wholesale into Prani Doctor.  
2. **Do not** add unused template dependencies (Bootstrap, Larkon `app.scss`, GridJS, ApexCharts, etc.) for admin polish — justify each new package in a PR.  
3. **Do not** weaken **auth/session protection** (middleware, `ensureAdminDashboardAccess`, admin API guards) when changing UI.  
4. **Do not** change **business logic** during UI-only tasks (workflows, calculations, permissions) unless the task explicitly includes it.  
5. **Do not** mix **other project** context (BPA, WPA, Quarbani, unrelated client names) into Prani Doctor admin copy, routes, or examples.

---

## 6. New admin page checklist

Before merging a new **`/admin/(dashboard)/...`** page:

- [ ] **Route protected** — under dashboard layout; `ensureAdminDashboardAccess()` applies; middleware still covers `/admin`.  
- [ ] **Uses admin shell** — no duplicate outer shell; body content only inside **`AdminContent`**.  
- [ ] **Has page header** — **`AdminPageHeader`** (title + description + actions as needed).  
- [ ] **Uses standard components** — **`AdminTable`** / **`AdminFormSection`** / **`AdminStatCard`** / **`AdminBadge`** / **`AdminActionButton`** as appropriate; stub → **`AdminPlaceholder`**.  
- [ ] **States** — **`AdminLoadingState`**, **`AdminErrorState`** (with retry where fetch can fail), **`AdminEmptyState`** when lists can be empty.  
- [ ] **Nav** — if the page is product-visible, add/update **`ADMIN_NAV_ITEMS`** with Bangla **`labelBn`** + English **`titleEn`** + icon; verify **`getSectionTitleFromPath`** matches.  
- [ ] **Lint / build** — `npm run lint` and `npm run build` pass.  
- [ ] **Docs** — if the change defines a new pattern, add a short note to **`docs/ADMIN_UI_LARKON_MIGRATION_PLAN.md`** or extend this file.

---

## 7. Related documents

| Document | Purpose |
|----------|---------|
| **`docs/ADMIN_UI_LARKON_MIGRATION_PLAN.md`** | Migration history, per-area notes, audit of Larkon vs Prani, remaining follow-ups. **Normative rules for new pages are summarized here and detailed in this design rules file.** |
| **`docs/ADMIN_UI_LARKON_THEME_CHROME_PLAN.md`** | Larkon theme **gap analysis + as-built** notes; **§14 Final status** lists chrome files, verification, and limitations. |

---

## 8. Theme chrome — normative rules

These rules apply to **shell-only** components under **`src/components/admin-ui/`** and **`src/app/admin/admin-shell.css`**. Feature pages **must not** re-implement theme storage, duplicate the customizer, or nest a second full shell.

### 8.1 `AdminThemeProvider` / `useAdminTheme`

- **Single source of truth** for UI-only preferences: `appearance`, `sidebarMode`, `sidebarTheme`, `contentWidth`, `topbarSticky`, `footerVisible`, plus setters and `resetAdminTheme()`.
- **Persistence:** `localStorage` key **`pd-admin-ui-v1`**; include `schemaVersion` in JSON for future migrations.
- **Hydration:** Default to safe server/client-first paint; restore from storage after mount without overwriting storage prematurely (see provider implementation).
- **Bridge:** **`#pd-admin-root`** exposes **`data-admin-appearance`**, **`data-sidebar-mode`**, **`data-sidebar-theme`**, **`data-content-width`**, **`data-topbar-sticky`**, **`data-footer-visible`** for **`admin-shell.css`**.
- **Do not** store secrets, JWTs, or session tokens in `localStorage`.

### 8.2 `AdminThemeCustomizer`

- **Shell-only** drawer from the topbar settings control; Bengali-first labels; **Reset** restores defaults and clears the storage key.
- **No** Bootstrap Offcanvas; **no** new npm dependencies for the panel.

### 8.3 `AdminFooter`

- Rendered by **`AdminLayoutShell`** **below** the scrolling **`AdminContent`** (`shrink-0`), controlled by **`footerVisible`**.
- **Do not** add a second full-width footer inside individual pages.

### 8.4 `AdminProfileMenu` / `AdminNotificationsMenu`

- **Topbar-only**; use **existing** **`GET /api/admin/auth/me`** and **`GET /api/notifications`** (same-origin **`adminFetch`** + **`readAdminJson`**). **No** new APIs for chrome.
- **Logout** in the profile menu must call the **same** `onSignOut` / `signOut` behavior as the sidebar (POST logout, redirect).

### 8.5 Sidebar settings (`sidebarMode`, `sidebarTheme`)

- **Desktop:** `expanded` vs `collapsed` (icon rail); **`sidebarTheme`** `light` vs `dark` maps to **`admin-shell.css`** sidebar CSS variables.
- **Mobile overlay:** Always **expanded** drawer width (CSS media override on `#pd-admin-root`); do not apply collapsed rail layout on small viewports.
- **Navigation source of truth** remains **`ADMIN_NAV_ITEMS`** in **`admin-nav.tsx`** — order, Bangla labels, English `titleEn`, and icons.

---

*End of document.*
