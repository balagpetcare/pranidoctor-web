# Prani Doctor admin shell — Larkon theme & chrome gap analysis

**Project:** Prani Doctor (Animal Doctors) — `pranidoctor-web`  
**Larkon reference (read-only):** `D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2\Larkon\TS`  
**Related docs:** [`ADMIN_UI_LARKON_MIGRATION_PLAN.md`](./ADMIN_UI_LARKON_MIGRATION_PLAN.md), [`ADMIN_UI_DESIGN_RULES.md`](./ADMIN_UI_DESIGN_RULES.md)

**Status:** **Theme chrome complete (Phases 1–5).** Prani-owned shell under **`#pd-admin-root`**: persisted preferences, customizer, sidebar rail modes + themes, footer, profile + notifications menus. Optional follow-ups: dedicated **`AdminThemeToggle`** chip in the bar, **`AdminHeaderSearch`**. Full verification, file list, and limitations: **§14 Final status** (below).  
**Constraints:** No Bootstrap, no Larkon `app.scss`, no NextAuth, no ApexCharts/GridJS or other template-only dependencies. No route/API/Prisma/business-logic changes for chrome work. **Bengali-first** admin labels; **প্রাণী ডাক্তার / Prani Doctor** branding only.

---

## 1. Executive summary

Prani Doctor ships a **Path A** admin shell: Tailwind + **`#pd-admin-root`** tokens in **`admin-shell.css`**, with **`AdminLayoutShell`**, **`AdminSidebar`**, **`AdminTopbar`**, **`AdminContent`**, optional **`AdminFooter`**, and client chrome (**`AdminThemeProvider`**, **`AdminThemeCustomizer`**, **`AdminProfileMenu`**, **`AdminNotificationsMenu`**). Feature pages use Larkon-*inspired* cards/tables/forms.

**As-built (2026):** The gap list in **§2–6** is largely **historical** (Larkon vs early Prani). **§7–11** describe the implemented component set and phases. **§14** records the **final consistency pass** outcome, touched files, and remaining limitations.

This document remains the **audit reference** for Larkon file paths and “do not copy” rules, plus **implementation** and **validation** history.

---

## 2. Larkon reference audit (template paths)

| # | Larkon area | Primary files (under `Larkon/TS/src/`) | What it provides |
|---|-------------|----------------------------------------|-------------------|
| 1 | **TopNavigationBar** | `components/layout/TopNavigationBar/page.tsx` | Bootstrap `container-fluid`, `navbar-header`; composes toggles, notifications, profile, search form. |
| 2 | **VerticalNavigationBar** | `components/layout/VerticalNavigationBar/page.tsx` | `LogoBox`, **`HoverMenuToggle`**, **SimpleBar** scroll, **`AppMenu`** (menu from `getMenuItems()`). |
| 3 | **Footer** | `components/layout/Footer.tsx` | `react-bootstrap` `Container`/`Row`/`Col`; copyright row. |
| 4 | **ThemeModeToggle** | `components/layout/TopNavigationBar/components/ThemeModeToggle.tsx` | Toggles `light`/`dark` via **`useLayoutContext`** (`changeTheme`). Iconify icons. |
| 5 | **ThemeCustomizerToggle** | `components/layout/TopNavigationBar/components/ThemeCustomizerToggle.tsx` | Opens **`ThemeCustomizer`** offcanvas (dynamic import). |
| 6 | **ActivityStreamToggle** | `components/layout/TopNavigationBar/components/ActivityStreamToggle.tsx` | Opens **`wrappers/ActivityStream`** offcanvas (demo “activity” feed). |
| 7 | **ProfileDropdown** | `components/layout/TopNavigationBar/components/ProfileDropdown.tsx` | `react-bootstrap` **Dropdown**; avatar; links (profile, messages, pricing, help, lock, logout). |
| 8 | **Notifications** | `components/layout/TopNavigationBar/components/Notifications.tsx` | Async demo **`getNotifications()`**; **Dropdown** with SimpleBar list, badge count, “View All”. |
| 9 | **Sidebar behavior** | `VerticalNavigationBar/components/HoverMenuToggle.tsx`, **`context/useLayoutContext.tsx`**, **`LeftSideBarToggle.tsx`** | **Menu sizes**: `default`, `condensed`, `hidden`, `sm-hover`, `sm-hover-active`; **`data-menu-size`** on `html`; backdrop for hidden; viewport hook forces `hidden` ≤1140px. |
| 10 | **Layout / theme storage** | `context/useLayoutContext.tsx` + `hooks/useLocalStorage` | **`LayoutProvider`** wraps admin layout; state: `theme`, `topbarTheme`, `menu.theme`, `menu.size`; **`localStorage`** key **`__REBACK_NEXT_CONFIG__`**; optional **query param overrides** for theme/menu; **`toggleDocumentAttribute`** sets `data-bs-theme`, `data-topbar-color`, `data-menu-color`, `data-menu-size` on `<html>`. Offcanvas state: theme customizer, activity stream, backdrop. |
| 11 | **SCSS / variables** | `assets/scss/...` (imported via `app.scss` in Larkon root layout) | Full Bootstrap + SCSS theme pipeline; **not** used in Prani Path A. |

---

## 3. Prani current implementation audit

> **Note (2026):** The rows below describe the **early** Prani shell before phased chrome work. **Current** behavior is implemented in **`AdminLayoutShell`**, **`AdminSidebar`**, **`AdminTopbar`**, **`admin-shell.css`**, and related **`admin-ui`** modules — see **§14 Final status**.

| File | Role today | Theme / chrome coverage |
|------|------------|---------------------------|
| **`src/components/admin-ui/AdminLayoutShell.tsx`** | `#pd-admin-root`, mobile overlay, sidebar + column with topbar + `AdminContent`; `signOut` | No theme provider; no footer; sidebar width fixed via CSS var; mobile open **local React state** only. |
| **`src/components/admin-ui/AdminSidebar.tsx`** | Flat nav from props; active link styling; brand link; logout | **No** collapse/condensed/hover; **no** sidebar theme toggle (always surface vars + `dark:`); **no** SimpleBar (native scroll). |
| **`src/components/admin-ui/AdminTopbar.tsx`** | Mobile: menu, section title, logout. Desktop: brand, section title, **bell link** to `/admin/notifications`, logout | **No** theme toggle, customizer, search, profile menu, notification **dropdown**, activity panel. Desktop topbar is **not** sticky (`sticky` only on mobile header). |
| **`src/components/admin-ui/admin-nav.tsx`** | `ADMIN_NAV_ITEMS`, `getSectionTitleFromPath` | OK for product order/labels; unrelated to Larkon `MENU_ITEMS`. |
| **`src/app/admin/admin-shell.css`** | Scoped CSS variables + **`prefers-color-scheme: dark`** overrides | **No** `data-bs-theme`-style attribute bridge; no separate “topbar theme” / “menu theme” vars; sidebar width/topbar height only. |
| **`src/app/admin/(dashboard)/layout.tsx`** | `ensureAdminDashboardAccess`, Noto Bengali wrapper, imports shell CSS, **`AdminLayoutShell`** | No `AdminThemeProvider` wrapper (future). |
| **`src/components/admin-ui/index.ts`** | Barrel exports | New shell components would be exported here when built. |
| **`src/components/admin/AdminDashboardShell.tsx`** | Re-export alias | Unchanged by chrome work. |

---

## 4. Gap matrix: Larkon has → Prani does not (yet)

| Capability | Larkon | Prani today |
|------------|--------|-------------|
| **Explicit color mode** | `light` / `dark` on `html` via `data-bs-theme` + context | OS-driven dark via `prefers-color-scheme` in `admin-shell.css` only |
| **Topbar / menu color** | Separate `topbarTheme`, `menu.theme` | Single surface model |
| **Sidebar size modes** | default / condensed / hidden / sm-hover / sm-hover-active | Fixed width; mobile slide-over only |
| **Theme customizer UI** | react-bootstrap **Offcanvas** with radios | None |
| **Activity stream** | Offcanvas demo | None (likely **low value** for Prani MVP) |
| **Profile menu** | Dropdown + avatar + links | Logout only in topbar/sidebar; no profile/settings submenu in topbar |
| **Notifications in topbar** | Dropdown with list + badge | Single **Bell → full page** (`/admin/notifications`) |
| **Global search** | `app-search` form (placeholder) | None |
| **Footer** | Copyright `Footer` under `page-content` | None |
| **Layout provider** | `LayoutProvider` + `useLayoutContext` | None |
| **localStorage theme** | `__REBACK_NEXT_CONFIG__` + optional URL overrides | None for chrome |
| **Icon system** | Iconify in topbar | `lucide-react` in Prani shell |

---

## 5. What we should implement now (recommended priority)

**High value / low conflict with Path A**

1. **`AdminThemeProvider`** (client) — holds `appearance: light | dark | system`, applies `class` or `data-*` on `#pd-admin-root` (or `document.documentElement` with care not to break non-admin pages — **prefer `#pd-admin-root`** for scoped dark/light if feasible, else document why `html` is required).
2. **`AdminThemeToggle`** — small control in **`AdminTopbar`**: light / dark / system; Bengali `title`s.
3. **`localStorage`** persistence for the above — **UI only**; new key e.g. `pd-admin-ui-settings` (do **not** reuse Larkon’s `__REBACK_NEXT_CONFIG__`).
4. **`AdminContent`** — wire optional **`contained={false}`** from settings (`contentWidth`) if product wants full-bleed tables (already supported by prop).

**Medium value**

5. **`AdminThemeCustomizer`** — **Prani-built** drawer (Tailwind + `fixed` panel or Headless UI / native `<dialog>` if later allowed — **not** react-bootstrap Offcanvas) with a **subset** of Larkon options: appearance, sidebar mode (expanded/collapsed), maybe **sidebar tone** (dark/light) mapped to CSS variables under `#pd-admin-root`.
6. **`AdminSidebarModeToggle`** — desktop narrow sidebar (icon rail + tooltips) vs expanded; must coexist with existing **mobile** drawer behavior.
7. **`AdminProfileMenu`** — minimal: show session email if passed from server snapshot or client `/api/admin/auth/me`, links: “সেটিংস” → `/admin/settings`, **লগ আউট** (avoid duplicating logout in three places — refactor later).
8. **`AdminHeaderSearch`** — **disabled** input or button opening a placeholder “খুঁজুন (শীঘ্রই)” popover — no backend search until product defines it.

**Lower priority / optional**

9. **`AdminNotificationsMenu`** — **optional** dropdown preview (last N from `/api/notifications`) + “সব দেখুন” link; **must not** fork Prisma auth; reuse existing notification API and cookie session.
10. **`AdminFooter`** — short Bengali/English copyright + version/env hint (non-secret); respects `footerVisible`.

**Defer / probably skip**

- **ActivityStreamToggle** — Larkon demo; **no Prani product equivalent** unless rebranded as “সাম্প্রতিক কার্যকলাপ” with real data — treat as **out of scope** unless PM requests.
- **Larkon query-param theme overrides** (`?layout_theme=`) — security/UX noise; **avoid** unless internal QA needs (document if added).

---

## 6. What we must avoid copying (Bootstrap / SCSS / dependency conflict)

| Larkon dependency / pattern | Risk | Prani approach |
|----------------------------|------|-----------------|
| **`app.scss` / Bootstrap** | Global style collision with Tailwind v4 | Do **not** import Larkon SCSS or Bootstrap into `pranidoctor-web`. |
| **`react-bootstrap`** Dropdown, Offcanvas, Container | Bundle + class conflicts | Build dropdowns/drawers with **Tailwind** + minimal headless primitives if needed later (evaluate **without** adding packages in Phase 1–2). |
| **Iconify** everywhere | Extra icon runtime / dependency | Keep **`lucide-react`** for shell chrome consistency. |
| **`data-bs-theme` + SCSS variable web** | Tied to Bootstrap theme pipeline | Map appearance to **CSS variables** under `#pd-admin-root` and/or `class="dark"` scoped strategies already compatible with Tailwind `dark:`. |
| **`AuthProtectionWrapper` / NextAuth** | Wrong auth model for Prani | Never merge; Prani keeps middleware + JWT cookie + `ensureAdminDashboardAccess`. |
| **Larkon `getNotifications` demo data** | Not Prani data | Any dropdown must call **real** `/api/notifications` or remain placeholder. |
| **Copy-paste `ThemeCustomizer.tsx` UI** | Entangles Bootstrap form controls | Reimplement **layout only** with Prani design tokens. |

---

## 7. Proposed Prani-owned components (names & responsibilities)

| Component | Responsibility |
|-----------|------------------|
| **`AdminThemeProvider`** | React context: read/write UI settings; hydrate from `localStorage` on mount; expose setters; **no** Prisma; **no** auth side effects. |
| **`AdminThemeCustomizer`** | Slide-over / drawer panel: groups settings with Bengali labels; opens from topbar toggle. |
| **`AdminThemeToggle`** | Cycles or selects appearance (light / dark / system); icons via `lucide`. |
| **`AdminSidebarModeToggle`** | Expanded vs collapsed (desktop); updates context + CSS class on shell root. |
| **`AdminFooter`** | Optional footer strip below `AdminContent` children area (inside shell column). |
| **`AdminProfileMenu`** | Dropdown: user hint + settings + logout (coordinate with existing logout). |
| **`AdminNotificationsMenu`** | Optional: mini-list + link to full page; unread badge if API provides count (may need small client fetch). |
| **`AdminHeaderSearch`** | Placeholder search UI only until global search exists. |

**Integration point:** Wrap **`AdminLayoutShell`** inner tree (or entire shell) with **`AdminThemeProvider`** in **`src/app/admin/(dashboard)/layout.tsx`** — **only** if provider is a client component boundary; prefer **single** client boundary to avoid waterfall (e.g. `AdminChromeProvider` composing theme + sidebar mode).

---

## 8. Proposed admin theme settings (client-only schema)

Stored as one JSON object in **`localStorage`** (single key, e.g. `pd-admin-ui-v1`).

| Key | Type | Purpose |
|-----|------|---------|
| **`appearance`** | `light` \| `dark` \| `system` | Color mode; `system` follows `prefers-color-scheme`. |
| **`sidebarMode`** | `expanded` \| `collapsed` | Desktop icon rail vs full labels. |
| **`sidebarTheme`** | `dark` \| `light` | Sidebar surface contrast (CSS vars under `#pd-admin-root`). |
| **`contentWidth`** | `contained` \| `full` | Maps to **`AdminContent`** `contained` prop. |
| **`topbarSticky`** | `boolean` | When true, desktop topbar uses `sticky top-0` (evaluate z-index vs sidebar). |
| **`footerVisible`** | `boolean` | Toggles **`AdminFooter`**. |

**Versioning:** Include `schemaVersion: 1` in JSON for future migrations.

**Security / privacy:** Do not store emails in localStorage unless necessary; prefer reading session for profile menu via existing **`/api/admin/auth/me`** when dropdown opens.

---

## 9. Storage rules

- **`localStorage` only** for these preferences — **no Prisma** tables for theme chrome in early phases.  
- **Do not** store tokens, passwords, or PII beyond what is already acceptable in client memory.  
- **Do not** change **`ADMIN_SESSION_COOKIE`** behaviour or session lifetime from theme code.  
- **SSR:** Default settings until hydrated to avoid flash — consider inline script in layout **only if** product requires FOUC fix (document tradeoffs; not required in Phase 1 audit).

---

## 10. Implementation phases

| Phase | Scope | Outcome |
|-------|-------|---------|
| **Phase 1** | **`AdminThemeProvider`** + settings state + **`localStorage`** read/write + apply **`appearance`** to `#pd-admin-root` (or agreed root) | **Done:** `AdminThemeProvider` / `useAdminTheme`, key `pd-admin-ui-v1`, data attributes (`data-admin-appearance`, `data-sidebar-mode`, `data-sidebar-theme`, `data-content-width`, `data-topbar-sticky`, `data-footer-visible`), shell CSS vars for sidebar width modes, sidebar tone, sticky desktop topbar, and appearance-driven app/surface tokens. Hydration-safe defaults until client restore. |
| **Phase 2** | **`AdminThemeToggle`** + **`AdminThemeCustomizer`** drawer + **`AdminHeaderSearch`** placeholder | **Done (partial):** **`AdminThemeCustomizer`** right drawer (overlay on small screens), reset + close, all settings wired to **`useAdminTheme`**; topbar **SlidersHorizontal** control with Bengali **`title` / `aria-label` “থিম সেটিংস”**. Not in this phase: separate **`AdminThemeToggle`** chip in the bar, **`AdminHeaderSearch`** — defer unless product asks. |
| **Phase 3** | **`AdminSidebarModeToggle`** + `sidebarTheme` + width CSS vars for collapsed rail | **Done:** Desktop **সাইডবার ছোট/বড়** toggle in **`AdminTopbar`**; **`AdminSidebar`** reads **`useAdminTheme`** (`sidebarMode`, `sidebarTheme`); collapsed **md+** icon-first nav with **`title` / `aria-label`**; compact **প** brand; **active** state via shell CSS vars; **mobile** overlay keeps **expanded** width (CSS media override). Sidebar light/dark **link / active / hover** tokens in **`admin-shell.css`**. Main column **`min-w-0`** to avoid flex overlap. |
| **Phase 4** | **`AdminFooter`** + `footerVisible` | **Done:** **`AdminFooter`** (`pd-admin-footer`) below **`AdminContent`** in the shell column (`shrink-0`, not inside the scrollable `<main>`); copyright **© year Prani Doctor**; Bangla admin label + links to **`/admin/settings`** and **`/admin/notifications`**; **`contentWidth`** aligns **`max-w-[1600px]`** with contained pages; visibility from **`useAdminTheme`** / theme customizer toggle. |
| **Phase 5** | **`AdminProfileMenu`**, optional **`AdminNotificationsMenu`**; **`topbarSticky`** tuning; z-index / scroll regression on mobile/tablet | **Done:** **`AdminProfileMenu`** (avatar trigger, **`/api/admin/auth/me`** on first open, generic **Admin / প্রাণী ডাক্তার** fallback, সেটিংস · বিলিং সেটিংস · লগ আউট); **`AdminNotificationsMenu`** (bell + unread badge from existing list API, preview rows, “সব নোটিফিকেশন দেখুন”, error fallback copy). Desktop + mobile topbars; plain bell/logout links removed. |

---

## 11. Exact files to create / update (when implementation starts)

**New (expected)**

- `src/components/admin-ui/AdminThemeProvider.tsx` (client context)
- `src/components/admin-ui/AdminThemeCustomizer.tsx` (client drawer)
- `src/components/admin-ui/AdminThemeToggle.tsx`
- `src/components/admin-ui/AdminSidebarModeToggle.tsx`
- `src/components/admin-ui/AdminFooter.tsx`
- `src/components/admin-ui/AdminProfileMenu.tsx`
- `src/components/admin-ui/AdminNotificationsMenu.tsx` (optional)
- `src/components/admin-ui/AdminHeaderSearch.tsx` (placeholder)
- `src/components/admin-ui/admin-theme-types.ts` (types + default settings + storage key)
- Optional: `src/components/admin-ui/useAdminUiSettings.ts` (hook)

**Update (expected)**

- `src/app/admin/(dashboard)/layout.tsx` — wrap shell with theme provider (client boundary strategy TBD).
- `src/components/admin-ui/AdminLayoutShell.tsx` — consume context: sidebar class, pass callbacks, optional footer slot.
- `src/components/admin-ui/AdminTopbar.tsx` — add toggles, profile, search placeholder, optional notifications popover.
- `src/components/admin-ui/AdminSidebar.tsx` — collapsed layout, optional dark/light sidebar vars.
- `src/components/admin-ui/AdminContent.tsx` — `contained` from context when wired.
- `src/app/admin/admin-shell.css` — extra variables for sidebar tone / collapsed width; `dark` class pairing if not using `prefers-color-scheme` only.
- `src/components/admin-ui/index.ts` — export new public components.
- `docs/ADMIN_UI_LARKON_MIGRATION_PLAN.md` + **`docs/ADMIN_UI_DESIGN_RULES.md`** — add “Theme chrome” subsection and link to **this** plan.

---

## 12. Validation checklist (post-implementation)

- [x] **`npm run lint`** and **`npm run build`** pass.  
- [x] No new forbidden dependencies (Bootstrap, Larkon SCSS, NextAuth, ApexCharts, GridJS, etc.).  
- [x] `/admin/login` unchanged in auth behaviour; dashboard routes still guarded.  
- [x] Theme changes **do not** clear or alter session cookies.  
- [x] With `appearance: system`, OS theme changes update admin UI within reason.  
- [x] Mobile: sidebar overlay + topbar; backdrop closes menu; topbar dropdowns usable.  
- [x] Desktop: collapsed sidebar uses icons + `title` / `aria-label`; expanded shows Bangla labels.  
- [x] Bengali strings for chrome; English `title` tooltips where helpful.  
- [x] **Prani Doctor** branding preserved in shell.  
- [x] Docs updated: migration plan + design rules reference this file.

---

## 13. References (Larkon file paths for developers)

```
D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2\Larkon\TS\src\app\(admin)\layout.tsx
D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2\Larkon\TS\src\components\layout\TopNavigationBar\page.tsx
D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2\Larkon\TS\src\components\layout\VerticalNavigationBar\page.tsx
D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2\Larkon\TS\src\components\layout\Footer.tsx
D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2\Larkon\TS\src\context\useLayoutContext.tsx
D:\PraniDoctor\docs\Larkon-Nextjs_v2.0.2\Larkon\TS\src\components\ThemeCustomizer.tsx
```

---

## 14. Final status (theme chrome consistency pass)

**Date:** 2026-05-09 (final pass). **Scope:** Sidebar, topbar, scroll shell, footer, theme customizer, collapsed mode, appearance light/dark/system, mobile overlay. **Routes verified in plan:** `/admin`, `/admin/areas`, `/admin/doctors`, `/admin/ai-technicians`, `/admin/service-requests`, `/admin/billing`, `/admin/knowledge-hub` (and nested paths via `getSectionTitleFromPath` + `isActive` prefix rules), `/admin/notifications`, `/admin/settings`, stub **`AdminPlaceholder`** pages — all use **`AdminLayoutShell`** from **`src/app/admin/(dashboard)/layout.tsx`** (no duplicate shell).

### 14.1 Consistency checklist (verified)

| # | Item | Notes |
|---|------|--------|
| 1 | Sidebar expanded | Full Bangla labels + brand; **`ADMIN_NAV_ITEMS`** unchanged. |
| 2 | Sidebar collapsed (desktop) | Icon rail, **`md:sr-only`** labels, **`title`/`aria-label`**, compact **প** brand. |
| 3 | Sidebar light theme | **`admin-shell.css`** `--pd-admin-sidebar-*` light tokens. |
| 4 | Sidebar dark theme | Dark rail tokens; active/hover readable. |
| 5 | Appearance light/dark/system | **`data-admin-appearance`** drives **`admin-shell.css`** app/surface/main/topbar vars. |
| 6 | Theme customizer | **`AdminThemeCustomizer`** drawer; **`localStorage`** `pd-admin-ui-v1`. |
| 7 | Topbar sticky on/off | **`data-topbar-sticky`** + `.pd-admin-topbar-desktop` CSS. |
| 8 | Footer visible/hidden | **`AdminFooter`** + **`footerVisible`**. |
| 9 | Desktop layout overlap | Main column **`min-w-0`**; root **`h-[100dvh] overflow-hidden`** so **`AdminContent`** scrolls internally. |
| 10 | Mobile overlay | Backdrop **`z-40`**, sidebar **`z-50`**; collapsed width forced to expanded on small viewports in CSS. |
| 11 | Long pages scroll | **`main`** **`min-h-0 flex-1 overflow-y-auto`** in **`AdminContent`**. |
| 12 | Active nav | **`aria-current="page"`** + ring/bg from sidebar CSS vars. |
| 13 | Bengali labels | Nav + chrome per **`ADMIN_NAV_ITEMS`** / component copy. |
| 14 | No other-project names | Design rules prohibition; shell copy audited. |
| 15 | No Larkon tree in repo | Template only under external `docs/Larkon-*` path. |
| 16 | No extra dependencies | Tailwind + `lucide-react` only for chrome. |

### 14.2 Files touched (chrome layer)

| Area | Files |
|------|--------|
| Shell layout | `src/components/admin-ui/AdminLayoutShell.tsx` |
| Sidebar | `src/components/admin-ui/AdminSidebar.tsx`, `src/components/admin-ui/admin-nav.tsx` |
| Topbar | `src/components/admin-ui/AdminTopbar.tsx` |
| Content | `src/components/admin-ui/AdminContent.tsx` |
| Theme state | `src/components/admin-ui/AdminThemeProvider.tsx`, `AdminThemeContext.tsx`, `useAdminTheme.ts`, `admin-theme-types.ts` |
| Customizer | `src/components/admin-ui/AdminThemeCustomizer.tsx` |
| Footer | `src/components/admin-ui/AdminFooter.tsx` |
| Menus | `src/components/admin-ui/AdminProfileMenu.tsx`, `AdminNotificationsMenu.tsx` |
| Tokens | `src/app/admin/admin-shell.css` |
| Barrel | `src/components/admin-ui/index.ts` |
| Layout import | `src/app/admin/(dashboard)/layout.tsx` (imports `admin-shell.css`; shell components) |

### 14.3 Remaining limitations (by design or backlog)

- **Tailwind `dark:` utilities** on some primitives still follow **OS** `prefers-color-scheme`; shell **surfaces** follow **`data-admin-appearance`** via CSS variables. Full alignment would need a scoped Tailwind dark variant or more `var(--pd-admin-*)` usage on feature pages.  
- **`AdminThemeToggle`** in the bar and **`AdminHeaderSearch`** placeholder were deferred (Phase 2 partial).  
- **Larkon-only** features not ported: activity stream, Bootstrap theme customizer, `sm-hover` multi-mode sidebar, URL query theme overrides.  
- **Profile / notifications** menus use **existing** `GET /api/admin/auth/me` and `GET /api/notifications` (no new routes).  
- **Viewport height:** Shell uses **`h-[100dvh]`** so inner scroll is reliable; very old browsers without `dvh` support may fall back poorly — acceptable for admin targets.

### 14.4 Build hygiene

If **`next build`** fails TypeScript inside **`.next/`** generated artifacts (rare corruption), delete **`.next`** and rebuild. No Prisma or API contract changes are required for chrome work.

---

*End of audit / plan. Implementation should follow [`ADMIN_UI_DESIGN_RULES.md`](./ADMIN_UI_DESIGN_RULES.md) and remain UI-only unless explicitly expanded.*
