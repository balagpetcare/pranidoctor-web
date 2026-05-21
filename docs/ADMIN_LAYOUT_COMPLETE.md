# Admin UI Shell — Complete

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` admin + enterprise dashboard chrome  
**Prerequisite:** [ADMIN_AUTH_COMPLETE.md](./ADMIN_AUTH_COMPLETE.md)

---

## Summary

The admin UI shell is a single Larkon-inspired layout shared by `/admin/*` and `/enterprise/*`. All ten shell features are implemented in `src/components/admin-ui/`.

| # | Feature | Component | Status |
|---|---------|-----------|--------|
| 1 | Sidebar | `AdminSidebar` | ✅ Permission-filtered nav |
| 2 | Header | `AdminTopbar` | ✅ Mobile + desktop |
| 3 | Breadcrumb | `AdminBreadcrumb` | ✅ Workspace rail |
| 4 | Workspace | `AdminWorkspace` | ✅ Scroll + contained width |
| 5 | Search | `AdminNavSearch` | ✅ Ctrl+K palette |
| 6 | Notification | `AdminNotificationsMenu` | ✅ Bell + preview |
| 7 | Profile | `AdminProfileMenu` | ✅ Auth-synced |
| 8 | Theme | `AdminThemeCustomizer` | ✅ Drawer from header |
| 9 | Permission Menu | `AdminPermissionMenu` | ✅ Role + capabilities |
| 10 | Layout orchestration | `AdminLayoutShell` | ✅ Full integration |

---

## Shell Architecture

```
AdminLayoutShell
├── AdminThemeProvider
├── AdminAuthProvider
└── AdminLayoutShellInner
    ├── AdminSidebar          ← permission-filtered ADMIN_NAV_GROUPS
    ├── column
    │   ├── AdminTopbar       ← header: menu, title, search, actions
    │   ├── AdminWorkspace    ← breadcrumb rail + scrollable content
    │   ├── AdminFooter
    │   └── Toaster
    └── mobile overlay
```

### Scroll model

- Root: `h-[100dvh] overflow-hidden`
- **Workspace** (`#pd-admin-workspace`): sole vertical scroll region
- Footer: fixed below workspace (non-scrolling shell chrome)

---

## Components

### 1. Sidebar (`AdminSidebar.tsx`)

- Grouped navigation via `admin-nav-sections.ts` (Bengali section headers)
- Collapsible groups + collapsed desktop icon rail
- Mobile: fixed overlay drawer with close button and backdrop
- **Permission filtering:** receives `filterAdminNavGroupsForActor()` output from shell
- Footer: sign-out button

**Nav config:** `admin-nav.tsx` → `ADMIN_NAV_GROUPS`

### 2. Header (`AdminTopbar.tsx`)

| Breakpoint | Layout |
|------------|--------|
| `< md` | Hamburger · centered title · search icon · notifications · permissions · theme · profile |
| `≥ md` | Collapse toggle · brand · title · inline search field · action cluster |

Sticky behavior controlled by `topbarSticky` in `useAdminTheme`.

### 3. Breadcrumb (`AdminBreadcrumb.tsx`)

- Built from pathname via `buildAdminBreadcrumbs()` (`admin-breadcrumbs.ts`)
- Bengali labels; links for non-terminal crumbs
- Hidden on `/admin` (dashboard only)
- Rendered in workspace rail above page content

**Supported paths:** all sidebar routes, CRUD subpaths (`/new`, `/edit`, `/[id]`), enterprise review tabs.

### 4. Workspace (`AdminWorkspace.tsx`)

- Replaces direct `AdminContent` usage in the shell
- Breadcrumb rail + padded content column
- `contained` prop → `max-w-[1600px]` (respects theme `contentWidth`; enterprise defaults full-bleed)

`AdminContent` remains exported for backward compatibility but the shell uses `AdminWorkspace`.

### 5. Search (`AdminNavSearch.tsx`)

- **Desktop:** inline “মডিউল খুঁজুন…” trigger in header
- **Mobile:** compact search icon
- **Modal palette:** fuzzy match on Bengali label, English title, href
- **Shortcut:** `Ctrl+K` / `Cmd+K`
- Keyboard: ↑↓ navigate, Enter go, Escape close
- Respects permission-filtered nav items

### 6. Notification (`AdminNotificationsMenu.tsx`)

- Unread badge from `GET /api/notifications`
- Preview list (3 items) + link to `/admin/notifications`
- Unchanged API contract; integrated in header action cluster

### 7. Profile (`AdminProfileMenu.tsx`)

- Uses `useAdminAuth()` for live profile
- `syncProfile()` on menu open
- Links: settings, billing settings, logout
- Shows role when available

### 8. Theme (`AdminThemeCustomizer.tsx`)

- Opened from header sliders icon
- Controls: appearance, sidebar mode/theme, content width, sticky topbar, footer visibility
- Persisted in `localStorage` (`ADMIN_UI_STORAGE_KEY`)

### 9. Permission Menu (`AdminPermissionMenu.tsx`)

- Shield icon in header
- Shows current role (Bengali label)
- Lists enterprise capabilities with granted/denied styling
- Quick link to enterprise review (when `serviceInstance.view`)
- Uses `adminCan()` from auth context

### 10. Permission-aware navigation (`admin-nav-permissions.ts`)

| Nav item field | Effect |
|----------------|--------|
| `capability` | Hide unless `adminCan(actor, capability)` |
| `roles` | Hide unless actor role in list |

**Applied to:**

- `/enterprise/services/review` → requires `serviceInstance.view`

---

## Navigation Fixes

### Duplicate route / label fixes

| Issue | Fix |
|-------|-----|
| Two sidebar groups labeled “এআই টেকনিশিয়ান” | Renamed operations group to **“এআই অপারেশন”** |
| `/admin/service-categories` dead / unlinked | Added to **System** nav group |
| Enterprise tab URLs not in section title | `getSectionTitleFromPath` resolves tab Bengali labels |
| Enterprise deep links unlinked from console | Breadcrumb + section title support tab segments |

### Permission filtering

- Sidebar and search both use the same filtered `navGroups` from `AdminLayoutShell`
- Prevents showing enterprise review to actors without `serviceInstance.view`

### Mobile responsiveness fixes

| Fix | Implementation |
|-----|----------------|
| Auto-close drawer on navigation | `useEffect` on `pathname` in shell |
| Body scroll lock when drawer open | `document.body.style.overflow = hidden` |
| Mobile sidebar max-width | CSS clamp on collapsed mode overlay |
| Safe-area padding on search modal | `env(safe-area-inset-top)` |
| Touch-friendly header targets | `min-h-11` patterns preserved |

---

## File Map

| File | Role |
|------|------|
| `AdminLayoutShell.tsx` | Root orchestrator |
| `AdminSidebar.tsx` | Side navigation |
| `AdminTopbar.tsx` | Header |
| `AdminWorkspace.tsx` | Main workspace |
| `AdminBreadcrumb.tsx` | Breadcrumb UI |
| `admin-breadcrumbs.ts` | Path → crumb builder |
| `AdminNavSearch.tsx` | Global search palette |
| `AdminNotificationsMenu.tsx` | Notifications dropdown |
| `AdminProfileMenu.tsx` | Profile dropdown |
| `AdminPermissionMenu.tsx` | Role/capability dropdown |
| `AdminThemeCustomizer.tsx` | Theme drawer |
| `admin-nav.tsx` | Nav item definitions |
| `admin-nav-sections.ts` | Section grouping |
| `admin-nav-permissions.ts` | Permission filters |
| `admin-shell.css` | Scoped tokens + breadcrumb/mobile rules |

---

## Usage (feature pages)

Feature pages under `src/app/admin/(dashboard)/` should **not** render a second shell. Use:

```tsx
import { AdminPageHeader, AdminTable } from "@/components/admin-ui";

export default function MyPage() {
  return (
    <>
      <AdminPageHeader title="…" description="…" />
      <AdminTable>{/* … */}</AdminTable>
    </>
  );
}
```

Optional client guards:

```tsx
import { AdminPermissionGuard, AdminRoleGuard } from "@/components/admin-ui";

<AdminPermissionGuard capability="serviceInstance.publish">
  <PublishButton />
</AdminPermissionGuard>
```

---

## Testing

| Test | Path |
|------|------|
| Breadcrumb builder | `src/components/admin-ui/admin-breadcrumbs.test.ts` |

Manual checklist:

1. Sidebar expands/collapses on desktop
2. Mobile menu opens, navigates, closes on route change
3. Breadcrumb shows on nested routes (e.g. `/admin/doctors/new`)
4. Ctrl+K search finds and navigates to modules
5. Permission menu reflects SUPER_ADMIN vs ADMIN
6. Enterprise review hidden from nav if capability denied (future SUPPORT role)
7. Theme customizer persists across reload

---

## Related Docs

- [ADMIN_UI_DESIGN_RULES.md](./ADMIN_UI_DESIGN_RULES.md)
- [ADMIN_WEB_AUDIT.md](./ADMIN_WEB_AUDIT.md)
- [ADMIN_AUTH_COMPLETE.md](./ADMIN_AUTH_COMPLETE.md)

---

*Admin layout shell complete.*
