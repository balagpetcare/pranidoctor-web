# Typography & Sidebar Report — Prani Doctor Admin

## Fonts added

| Font | Role | Loading |
|------|------|-----------|
| **Inter** | Latin / numeric UI | `next/font/google` → CSS variable `--font-pd-admin-inter` |
| **Hind Siliguri** | Bengali-first body & UI | `next/font/google` → CSS variable `--font-pd-admin-hind`, weights 400–700, subsets `latin` + `bengali` |

**Stack (admin scope):**  
`var(--font-pd-admin-inter), var(--font-pd-admin-hind), "Hind Siliguri", "Inter", ui-sans-serif, system-ui, sans-serif`  
Applied on `.pd-admin-app-fonts` (wrapper in `src/app/admin/layout.tsx`) with `display: "swap"` to limit CLS.

**Removed:** `Noto_Sans_Bengali` from the dashboard-only wrapper (replaced by the admin-root font setup).

## Files modified / added

| File | Change |
|------|--------|
| `src/app/admin/layout.tsx` | Loads `admin-typography.css`; applies `adminDashboardFontVariablesClassName` + `.pd-admin-app-fonts` wrapper |
| `src/app/admin/admin-typography.css` | **New** — global admin font stack, legibility, page / topbar / section title utilities |
| `src/lib/admin-ui/admin-dashboard-fonts.ts` | **New** — shared `Inter` + `Hind_Siliguri` instances |
| `src/app/admin/(dashboard)/layout.tsx` | Removed duplicate Bengali font wrapper; shell only |
| `src/components/admin-ui/admin-nav.tsx` | Added `labelBn` on every `AdminNavGroup` (Bengali parent labels) |
| `src/components/admin-ui/admin-nav-sections.ts` | **New** — section IA (`getAdminNavSectionsForSidebar`, `flattenSectionOrderedNavItems`) |
| `src/components/admin-ui/AdminSidebar.tsx` | Section headers + memoized nav; collapsed rail order follows sections; `useCallback` for toggles |
| `src/components/admin-ui/AdminSidebarGroup.tsx` | Parent row shows `labelBn`; improved `title` / `aria-label` |
| `src/app/admin/admin-shell.css` | Sidebar metrics (14px nav, 20px icons), active row background + border, section header chrome, submenu easing, active `.nav-text` inherit |
| `src/components/admin-ui/AdminPageHeader.tsx` | `pd-admin-page-title` + `pd-admin-page-description` |
| `src/components/admin-ui/AdminTopbar.tsx` | `pd-admin-topbar-title` (desktop); mobile title slightly larger |
| `src/components/admin-ui/AdminFormSection.tsx` | `pd-admin-section-title` + shared helper description class |
| `src/components/admin/knowledge-hub/styles.ts` | Labels **14px**, inputs **15px**, min height, placeholder contrast |

## Sidebar architecture changes

1. **Section headers** — Non-interactive list rows (`pd-admin-nav-section-head`) with Bengali titles (e.g. *লোকেশন ও এরিয়া ব্যবস্থাপনা*, *সিমেন ও ব্রিডিং ব্যবস্থাপনা*), muted 12px-style label, bottom divider. Hidden when the rail is **collapsed** on desktop (icon-only mode unchanged).
2. **Data model** — `ADMIN_NAV_GROUPS` is unchanged (same `id`s, `href`s, children). `admin-nav-sections.ts` maps **`groupIds` → sections** for presentation only.
3. **Collapsed rail** — Flat list order follows **section order** via `flattenSectionOrderedNavItems` (no duplicate nav logic beyond ordering).
4. **Bengali parent rows** — Collapsible group triggers show **`labelBn`** instead of English `labelEn` (English remains in `title` / `aria-label` for tooling and screen readers).
5. **Width** — Kept **17.5rem (~280px)** expanded; padding tightened slightly for Bengali line length.

## Typography improvements

- **Admin shell:** `optimizeLegibility`, antialiased stack on `.pd-admin-app-fonts`; base **line-height 1.6**.
- **Page headings:** ~**20–22px**, weight **700** (`.pd-admin-page-title`).
- **Section titles (forms):** **16px**, weight **600** (`.pd-admin-section-title`).
- **Topbar context title:** **16px**, weight **600** (`.pd-admin-topbar-title`).
- **Sidebar links:** **14px**, weight **500** (default), **600** when active; **14px** sub-links with clearer indent (`1rem`).
- **Form labels / inputs (shared `kh*`):** **14px** labels, **15px** inputs, **min-height** for touch, stronger placeholders.

## Accessibility improvements

- Section headings use **`role="heading"`** + **`aria-level={2}`** (landmarks without adding rogue `<h2>` in the tab order conflict).
- Parent **`aria-label`** includes Bengali + English for clarity.
- Active route: **higher contrast** (background + left border + inherited label color).
- **Focus-visible** outlines unchanged; keyboard users keep visible focus on nav controls.

## Remaining recommendations

1. **Variable fonts** — If bundle size becomes an issue, consider subsetting or fewer Hind Siliguri weights.
2. **E2E** — Playwright: open sidebar, tab through first section header + parent + child links, assert no duplicate `id`s.
3. **Login page** — Optionally reuse `pd-admin-page-title` on `admin/login` for full alignment with dashboard chrome.
4. **Further IA** — If product splits “এআই অনুমোদিত” vs “রিপোর্ট” later, add routes first, then extend `ADMIN_NAV_GROUPS` + `SECTION_SPECS` (single source of truth for order).

---

*Generated for Enterprise Bengali Typography + Sidebar Architecture upgrade.*
