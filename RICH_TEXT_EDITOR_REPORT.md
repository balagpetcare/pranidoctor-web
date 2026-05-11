# Rich Text Editor Rebuild — Semen Service Templates (Admin)

**Route:** `http://localhost:3000/admin/semen-service-templates/new` (shared `SemenServiceTemplateForm`).  
**Goals:** Premium TipTap UX, Bengali-friendly typography, modular reusable architecture, **unchanged** React props (`label`, `value`, `onChange`, `disabled`, `placeholder`, `minHeightClass`, `className`, `id`).

---

## 1. Architecture

| Piece | Role |
|-------|------|
| `src/components/admin/rich-text-editor/RichTextEditor.tsx` | Shell: `useEditor`, controlled HTML sync, scroll layout, focus ring, imports scoped CSS |
| `src/components/admin/rich-text-editor/RichTextToolbar.tsx` | Toolbar: `useEditorState` for reactive active/disabled states without enabling legacy global rerenders |
| `src/components/admin/rich-text-editor/rich-text-extensions.ts` | Central extension factory (`StarterKit` + `Placeholder`) |
| `src/components/admin/rich-text-editor/clear-rich-formatting.ts` | Clears marks, lifts lists, unwraps blockquote/heading → paragraph |
| `src/components/admin/rich-text-editor/rich-text-editor.css` | **Admin-scoped** (`#pd-admin-root .pd-rich-editor …`) Hind Siliguri–first typography, lists, blockquote, placeholder |
| `src/components/admin/rich-text-editor/index.ts` | Barrel exports for reuse |
| `src/components/admin/semen-template/RichTextEditor.tsx` | **Re-export** only — existing `dynamic()` imports keep working |

**SSR / hydration:** `SemenServiceTemplateForm` still uses `next/dynamic` with `ssr: false` for the editor. `useEditor({ immediatelyRender: false })` remains for client consistency.

**Stability patterns:**

- `onUpdate` uses a **ref** to the latest `onChange` to avoid stale closures without recreating the editor.
- External `value` sync uses `setContent(…, { emitUpdate: false })` and string equality to avoid feedback loops and cursor jump.
- `shouldRerenderOnTransaction: false` on the main component; toolbar uses `useEditorState` for targeted updates.

---

## 2. Toolbar improvements

- **Features:** Bold, Italic, Underline, **H2** + **H3**, bullet/ordered list, **blockquote** (re-enabled in `StarterKit`), undo/redo, **clear formatting** (eraser).
- **UI:** Grouped controls in soft pill rows, vertical dividers, **sticky** context (toolbar is `shrink-0` above a dedicated scroll area so it stays visible while the body scrolls).
- **States:** `aria-pressed` on toggles, `useEditorState` for live **active** and **canUndo/canRedo**.
- **Icons:** `lucide-react` (Bold, Italic, Underline, Heading2/3, List, ListOrdered, Quote, Undo, Redo, Eraser).
- **Accessibility:** `role="toolbar"`, Bengali `aria-label` / `title` on controls, visible focus ring (`focus-visible:ring-2`).

**Stack note:** Underline is provided via `StarterKit.configure({ underline: {} })` (no duplicate `@tiptap/extension-underline` import in the new module).

---

## 3. Typography & Bengali experience

- **Font stack:** `var(--font-pd-admin-hind)`, `"Hind Siliguri"`, then Inter — matches `admin-typography.css` / `admin-dashboard-fonts`.
- **Size / line height:** `~15px` default, `16px` from `sm` up; **line-height 1.8**; slightly increased letter-spacing for Indic text.
- **Blocks:** Tuned `p`, `h2`, `h3`, `ul`/`ol`/`li`, and **blockquote** (left border + padding).
- **Placeholder:** Styles aligned with TipTap’s `p.is-editor-empty` + `data-placeholder` pattern; fallback for `is-editor-empty` on the root.
- **Editor chrome:** `pd-rich-editor` container with soft border, focus ring, `max-h-[min(70vh,28rem)]` for balanced mobile/desktop.

---

## 4. HTML compatibility

- Kept **heading levels 2–3**, lists, paragraphs, bold/italic/underline.
- **Blockquote** is now **enabled** in `StarterKit` (previously off). Stored HTML may include `<blockquote>`; `sanitize-admin-html` already allows `blockquote`.
- No change to how the form **saves** content (`sanitizeAdminRichHtml` + field mapping).

---

## 5. Files modified / added

| File | Action |
|------|--------|
| `src/components/admin/rich-text-editor/*` | **Added** (editor, toolbar, extensions, clear helper, CSS, index) |
| `src/components/admin/semen-template/RichTextEditor.tsx` | **Replaced** with re-export from `rich-text-editor` |

---

## 6. QA checklist (manual)

- [ ] Bold / italic / underline / headings / lists / quote apply and persist after save  
- [ ] Undo/redo and clear formatting behave predictably inside lists/quotes  
- [ ] Bengali input feels readable at 15–16px / 1.8 line-height  
- [ ] Toolbar wraps on narrow widths; editor body scrolls independently  
- [ ] No hydration warnings on the template page (dynamic + `immediatelyRender: false`)  
- [ ] Cursor stable when parent re-renders (refs + controlled sync)  

**Automated:** `npm run typecheck` passes; `eslint src/components/admin/rich-text-editor/` passes.

---

## 7. Remaining recommendations

1. **Toolbar overflow menu on xs:** For very small phones, overflow actions into a “More” `DropdownMenu` (would add a small Radix/shadcn dependency or custom disclosure).
2. **Link support:** If product needs URLs inside descriptions, add TipTap `Link` extension + sanitize allowlist updates.
3. **Collaboration / persistence drafts:** Optional autosave to `localStorage` keyed by template draft id (large UX change).
4. **Remove unused dependency:** If nothing else imports `@tiptap/extension-underline`, consider removing it from `package.json` in a separate housekeeping PR (Starter Kit now supplies underline).

---

*Generated for the premium rich text editor rebuild on Prani Doctor admin semen templates.*
