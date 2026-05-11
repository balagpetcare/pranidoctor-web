# UI Enhancement Report — Semen Service Template Admin (Enterprise Pass)

Scope: `/admin/semen-service-templates/new`, `/admin/semen-service-templates/[id]/edit`, and shared components (`SemenServiceTemplateForm`, `SemenTemplateMediaSection`, `RichTextEditor`, `MetadataBuilder`, `ImageCropperModal`), plus scoped admin CSS for modal motion.

## Before → After (summary)

| Area | Before | After |
|------|--------|--------|
| **Visual hierarchy** | Flat cards, uniform chrome | Step chips (`ধাপ ১`…`৫`), top emerald accent bar, hover elevation on cards, gradient headers on media panel |
| **Form journey** | No progress affordance | Create mode: **journey strip** with %, progress bar, four milestone tiles (25 / 50 / 75 / 100%) |
| **Loading** | Single `AdminLoadingState` on edit load | **Multi-block skeleton** + short status line |
| **Sticky actions** | Simple bottom bar | **Elevated sticky bar** with duplicate progress, “মিডিয়া ব্যস্ত” hint, stronger primary submit, `aria-busy` on save |
| **Media / gallery** | Rows sorted by kind (cover always first visually) | **List order = save order** (matches `sortOrder` index); **#n** badges; **↑ / ↓** reorder; richer empty state; hover shadow on tiles; **16∶9 / 1∶1** preview frames for cover / gallery |
| **Drag–drop** | Per-row dashed zone | Same behavior + **stronger drag-over** (scale, ring, tint) |
| **Crop modal** | Instant appear | **Backdrop + panel enter** animations (`admin-shell.css`, classes on modal) |
| **Rich text** | Standard border | **Compact** default min-height / max-height; **focus-within** emerald ring; gradient toolbar; toolbar buttons get **focus-visible** ring |
| **Metadata** | Stacked “cards” per row | **Responsive table** (thead + tbody), row hover tint, overflow-safe wrapper |
| **Pages** | Full-bleed only | **`max-w-[min(100%,88rem)]`** for readable line length on ultra-wide screens |

## Completed enhancement checklist

- [x] Section grouping & card polish (`SemenAdminFormCard`)
- [x] Sticky action bar upgrade + non-blocking hints
- [x] Progress indicators (create journey + footer bar + weighted %)
- [x] Skeleton loading for edit-mode template fetch
- [x] Lazy-load placeholders (media + editor) as lightweight skeletons
- [x] Upload UX: empty state, drag-over feedback, gallery preview framing
- [x] Reorderable media list (adjacent swap; preserves payload semantics)
- [x] Rich text: compact editor, toolbar polish, focus states
- [x] Metadata: table-like editor, quick add/remove, row transitions
- [x] Modal: enter animation (scoped under `#pd-admin-root`)
- [x] Responsive / overflow: table scroll, `min-w-0`, page max-width
- [x] Accessibility: `role="progressbar"`, reorder `aria-label`s, table `scope`, `sr-only` labels
- [x] TypeScript + ESLint clean on touched paths

## Behavioral note (intentional)

**Media rows are now shown in array order**, not auto-sorted by kind. Saved `sortOrder` has always followed array index; the UI now matches that so reordering and mental model stay aligned. Recommendation: add **COVER** first, then **GALLERY**, then video rows — helper copy was updated to say this.

## Files touched

- `src/components/admin/semen/SemenServiceTemplateForm.tsx` — journey strip, skeleton, steps, completion %, sticky bar, `swapMediaAdjacent`, lazy skeletons  
- `src/components/admin/semen/SemenTemplateMediaSection.tsx` — enterprise media shell, reorder controls, list order, previews, drag-over polish  
- `src/components/admin/semen-template/RichTextEditor.tsx` — focus ring, compact chrome  
- `src/components/admin/semen-template/MetadataBuilder.tsx` — table layout  
- `src/components/admin/semen-template/ImageCropperModal.tsx` — animation classes  
- `src/app/admin/admin-shell.css` — `@keyframes` + utility classes for modal  
- `src/app/admin/(dashboard)/semen-service-templates/new/page.tsx` — max width  
- `src/app/admin/(dashboard)/semen-service-templates/[id]/edit/page.tsx` — max width  

## Remaining recommendations (non-blocking)

1. **Keyboard reorder**: optional `Alt+Arrow` on focused row for power users.  
2. **Drag-and-drop reorder**: HTML5 DND between tiles (more code; current buttons stay as accessible baseline).  
3. **Edit mode journey**: optional slim progress strip (currently create-only).  
4. **Playwright**: snapshot tests for sticky bar + table metadata on narrow viewports.

---

*Generated for Command 3 — Enterprise UI/UX Enhancement.*
