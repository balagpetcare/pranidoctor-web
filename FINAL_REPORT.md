# Semen Service Template Admin — Analysis & Implementation Report

## 1. Executive summary

Work focused on `/admin/semen-service-templates/new` (and the shared form used on edit). The **provider dropdown** was empty because the list API rejected the client query. **Media cropping**, **metadata**, **rich text**, **validation**, and **UX feedback** were upgraded while keeping existing API contracts and server validation.

---

## 2. Analysis — provider dropdown (“সিমেন প্রদানকারী”)

### Trace

| Layer | Finding |
|--------|---------|
| **Frontend** | `SemenServiceTemplateForm` called `GET /api/admin/semen-providers?limit=200&isActive=true`. |
| **API** | `src/app/api/admin/semen-providers/route.ts` uses `listSemenProvidersQuerySchema`. |
| **Validation** | `limit` was `z.coerce.number().int().min(1).max(100)` while the client sent **`limit=200`**. |
| **Result** | Zod failed → **422** → `readAdminJson` threw → `catch` swallowed the error → **`providers` stayed `[]`**. |
| **UX** | Silent failure; dropdown showed only “নির্বাচন করুন”. |

### Failure point (exact)

**`listSemenProvidersQuerySchema` max limit (100) vs client `limit=200`.**

### Fix

- Raised provider list `limit` maximum to **200** in `src/lib/admin-semen/schemas.ts` (with an inline comment).
- Replaced silent failure with **`providersLoading` / `providersError`**, **`toast.error`**, and the dedicated **`ProviderSelect`** component (loading spinner, inline error, link to create providers, BN label in options when `nameBn` exists).

---

## 3. Image cropper rebuild

### Prior issues addressed

- **Aspect ratio**: Gallery used **4:3**; product requirement is **1:1** for gallery and **16:9** for cover/banner.
- **Preview vs upload**: Tightened flow so the **cropped blob** is what gets uploaded; **`roundCropAreaPixels`** on `react-easy-crop` for cleaner pixel crops.
- **Modal UX**: New **`ImageCropperModal`** — scroll lock, responsive layout, zoom slider, **reset**, **cancel / confirm**, optional **debounced preview** panel, clearer errors.
- **Memory**: Preview blob URLs revoked; unmount revokes preview URL without redundant `setState` in cleanup; parent still revokes the **source** `objectURL` after successful upload (see `SemenTemplateMediaSection`).
- **Race**: Upload errors no longer revoke the crop source before the user can retry; successful path revokes after upload completes.
- **Validation**: **5 MB** max for raster images, **80 MB** for template video uploads (aligned with server defaults in `purposeMaxBytes`).

### Files

- New: `src/components/admin/semen-template/ImageCropperModal.tsx`
- Updated: `src/components/admin/semen/SemenTemplateMediaSection.tsx` (uses modal above; aspects + limits)
- Removed: `src/components/admin/semen/SemenTemplateMediaCropDialog.tsx` (superseded)

### Re-export (requested structure)

- `src/components/admin/semen-template/GalleryUploader.tsx` re-exports `SemenTemplateMediaSection` as **`GalleryUploader`** so the form can depend on the new folder without duplicating the large grid.

---

## 4. Rich text (Tiptap)

- New **`RichTextEditor`**: StarterKit (headings 2–3, lists, undo/redo), underline, placeholder, **`immediatelyRender: false`** for Next.js client compatibility.
- **Persistence**: HTML stored in existing string columns; **`sanitizeAdminRichHtml`** applied before save via `richToStored()` in the form payload builder.
- **Read path**: `SemenServiceTemplateDetailView` renders description fields with **`dangerouslySetInnerHTML`** after the same sanitization.

### Dependency

- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/extension-underline`, `isomorphic-dompurify`.

---

## 5. Metadata UX

- New **`MetadataBuilder`**: key/value rows, add/remove, JSON built on change; syncs from parent `tagsJson` on load using `lastEmittedRef` to avoid feedback loops; duplicate-key warning in UI.

---

## 6. Validation & UX

- Inline / submit checks: internal name, provider, base price, OTHER label, offer vs discount XOR, breed sum, rejection reason.
- **`sonner`** Toaster in **`AdminLayoutShell`** (theme follows admin appearance).
- Toasts on **save success**, **save failure**, **approval success/failure**.

---

## 7. Architecture / routing

| File | Role |
|------|------|
| `src/components/admin/semen-template/TemplateForm.tsx` | Re-exports form as **`TemplateForm`** |
| `src/components/admin/semen-template/ProviderSelect.tsx` | Provider field |
| `src/components/admin/semen-template/RichTextEditor.tsx` | Tiptap |
| `src/components/admin/semen-template/MetadataBuilder.tsx` | Metadata |
| `src/components/admin/semen-template/ImageCropperModal.tsx` | Crop modal |
| `src/components/admin/semen-template/GalleryUploader.tsx` | Alias to media section |

Pages **`new`** and **`[id]/edit`** now import **`TemplateForm`** from `semen-template/`.

Main logic remains in **`SemenServiceTemplateForm.tsx`** (exported props type: **`SemenServiceTemplateFormProps`**).

---

## 8. QA performed (automated)

- `npm run typecheck` — **pass**
- `eslint` on touched admin semen / semen-template paths — **pass**

### Manual QA recommended

- Logged-in admin: open new template → confirm providers populate; create provider if list empty.
- Crop cover (16:9) and gallery (1:1); confirm preview and uploaded file match aspect.
- Save template; open detail view — HTML descriptions render safely.
- Edit existing template with **plain-text** legacy descriptions — should still display in the editor.
- Mobile/narrow viewport on crop modal.

---

## 9. Files modified / added (high level)

- **Added**: `src/components/admin/semen-template/*` (components above), `src/lib/sanitize-admin-html.ts`, `FINAL_REPORT.md`
- **Updated**: `SemenServiceTemplateForm.tsx`, `SemenTemplateMediaSection.tsx`, `SemenServiceTemplateDetailView.tsx`, `AdminLayoutShell.tsx`, `schemas.ts` (provider limit), `package.json` / lockfile (new deps), semen template **pages** (import `TemplateForm`)
- **Removed**: `SemenTemplateMediaCropDialog.tsx`

---

## 10. Remaining risks

- **Legacy data**: Old plain-text descriptions load into Tiptap as plain text; fine visually, first save may wrap in `<p>…</p>`.
- **Mobile API / consumers**: If mobile clients assumed plain text only, they may need to **strip HTML** on read.
- **MetadataBuilder**: Only flat string values via inputs; nested JSON from old data is stringified in one value field when parsed.
- **Crop preview**: Debounced extra `canvas` work on slower devices — acceptable tradeoff; can disable `showPreview` if needed.

---

## 11. Future recommendations

- Optional **`@tailwindcss/typography`** for cleaner prose in the editor and detail view.
- **Pagination** or search on provider select if count exceeds 200.
- **E2E tests** (Playwright) for provider load, crop upload, and submit.
- **Server-side HTML sanitize** on PATCH/POST (defense in depth) if templates are ever edited outside this admin UI.

---

*Generated as part of the semen service template admin overhaul (May 2026).*
