# Production QA Report — Semen Service Template Admin (`/admin/semen-service-templates/new`)

## Completed checks (automated)

| Check | Result |
|--------|--------|
| `npm run typecheck` | Pass |
| ESLint on semen template form, `semen-template/*`, `SemenTemplateMediaSection`, upload + retry helpers | Pass (max-warnings 0) |

## Bugs fixed / hardened

### Upload stability

- **AbortController + `signal`** on `uploadAdminSemenFileWithProgress` (`semen-media-upload.ts`): unmount or new upload aborts in-flight XHR; **single `finish()` guard** avoids double resolve/reject.
- **Duplicate uploads**: `runUpload` and crop confirm bail if `uploadingIndexRef.current !== null`; **pick handler** blocks new files while an upload runs or while the **crop modal is open** for raster rows (clear user message).
- **Stale closure on crop confirm**: `cropRef` always holds the latest crop session; confirm handler reads `cropRef.current` instead of a stale `crop` closure.
- **Unmount state updates**: `mountedRef` in media section gates `setUploadPct` / `setMediaRow`; **`formAliveRef`** on the main form gates provider load and breed list updates after async work.
- **Unmount cleanup**: abort active upload; **revoke** any open crop `objectURL` on unmount.
- **Dynamic `ImageCropperModal`**: code-splits `react-easy-crop` until the crop UI is needed.

### Crop modal

- **Preview race**: monotonic `previewGenRef` + `mountedRef` so stale debounced previews do not call `setState` after a newer crop or unmount.
- **Backdrop**: click outside panel closes (when not working); **Escape** closes.
- **Focus**: panel receives initial focus for keyboard users.
- **A11y**: `aria-describedby`, zoom slider `aria-*`, preview `alt`, `aria-busy` on confirm.

### Form / API resilience

- **`withRetry`** (`lib/admin/fetch-with-retry.ts`) for **providers** (2 retries) and **breeds** (1 retry) with backoff.
- **Provider refetch**: `ProviderSelect` **`onRetry`** + **পুনঃচেষ্টা** button; `aria-busy` / `aria-invalid` / `aria-describedby` on select.
- **Initial load**: `queueMicrotask` defers `loadProviders()` to satisfy strict `react-hooks` lint on effects.

### Metadata builder

- **`emit` `useCallback`**: destructure `onChange` from props so exhaustive-deps is satisfied; no bogus re-renders from full `props` identity.

### Performance

- **`next/dynamic` + `ssr: false`**: **`LazyRichTextEditor`**, **`LazyGalleryUploader`** (and nested dynamic **ImageCropperModal** in the media section) reduce initial JS for the new-template page.
- **`RichTextEditor`**: wrapped in **`React.memo`** + `displayName`; toolbar **`aria-pressed`** on toggles; editor area **`overflow-x-hidden`** and wrapper **`min-w-0`**.

### Responsive / layout

- Crop modal: **stacked preview** on small screens (`grid-cols-1` → `lg:grid`), **shorter min-height** on narrow viewports, **safe `min-w-0`** on grid.
- Metadata rows: **`min-w-0`** on grid and inputs to avoid horizontal overflow.
- Media kind `<select>`: **`max-w-full min-w-0`** + **`aria-label`**.

## Performance improvements (summary)

- Lazy-loaded **Tiptap**, **gallery/media UI**, and **cropper** chunks.
- Fewer unnecessary **metadata** callback churn via stable `emit` dependencies.
- **Debounced preview** guarded against stale async completion.

## Remaining recommendations

1. **E2E (Playwright)**: full flows (provider retry, crop, save, edit) on real browsers.
2. **`loadTemplate`**: add `formAliveRef` guards on every `setState` after `await` for parity with providers/breeds.
3. **Toast on successful retry**: optional subtle success toast after `onRetry` refetch.
4. **Rate limiting**: cap manual retries server-side if abuse becomes a concern.
5. **ImageCropperModal**: optional `inert` on siblings for stronger focus trap (polyfill or small helper).

## Files touched (this pass)

- `src/lib/admin-semen/semen-media-upload.ts` — abort + settled guard  
- `src/lib/admin/fetch-with-retry.ts` — (existing) retry helper used from form  
- `src/components/admin/semen/SemenTemplateMediaSection.tsx` — abort, guards, refs, dynamic modal, a11y  
- `src/components/admin/semen-template/ImageCropperModal.tsx` — preview gen, escape, focus, layout, a11y  
- `src/components/admin/semen-template/RichTextEditor.tsx` — memo, a11y, overflow  
- `src/components/admin/semen-template/MetadataBuilder.tsx` — destructuring, `min-w-0`, `cn` grid  
- `src/components/admin/semen-template/ProviderSelect.tsx` — retry, ARIA, `useId` error region  
- `src/components/admin/semen/SemenServiceTemplateForm.tsx` — `formAliveRef`, `withRetry`, dynamic lazy components, `queueMicrotask` load  

---

*Generated for Command 2 — Deep Bug Fix + Production Polish.*
