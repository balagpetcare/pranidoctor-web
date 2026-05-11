# Media Upload System Rebuild — Semen Service Templates (Admin)

**Scope:** `/admin/semen-service-templates/new` (and shared `SemenTemplateMediaSection` on edit flows).  
**Constraints preserved:** Upload API (`POST /api/admin/uploads`), form schema (`SemenTemplateMediaFormRow`), media kinds (COVER / GALLERY / VIDEO_UPLOAD / VIDEO_URL), purposes (`ADMIN_SEMEN_TEMPLATE_*`), TypeScript strict mode.

---

## Part 1 — Root causes identified

| Area | Symptom | Cause |
|------|---------|--------|
| Crop modal | Panel felt “collapsed” or cramped | Flex/grid chain without guaranteed minimum height on the crop stage; mobile `items-stretch` / missing `min-h` on the crop column |
| Crop preview | Mismatch vs uploaded asset | Preview and upload sometimes diverged if output scaling differed; blob pipeline now shares one options helper (`cropBlobOptions()` + `getCroppedImageBlob` options) |
| Crop preview | Blank / late preview | `areaPixels` empty until interaction; preview effect did not wait for media load — added `mediaReady` gated on `onMediaLoaded` |
| Upload flow | Modal “freezing” or double duty | Crop modal stayed responsible for upload progress; upload happened while modal was logically still tied to crop session — **confirm now closes crop first (`revokeCropUrl`), then `runUpload`** so progress shows on the card |
| Drag & drop | Unreliable highlight | `dragLeave` with `currentTarget === target` fails when moving between nested children |
| Drag & drop | Flaky drop target | No `dragenter` depth / counter — highlights toggled incorrectly |
| Drag & drop | Multi-file ambiguity | Only first file used without feedback — now warns when `files.length > 1` |
| Canvas output | Soft crops on retina | Export used raw crop pixel dimensions only — added capped **device pixel ratio scaling** (max 2×) in `getCroppedImageBlob` |
| Memory | Object URL leaks | Already revoked on unmount/close; reinforced flow so modal closes before long upload |
| Duplicate uploads | Rare double POST | Guard via `uploadingIndexRef` + single in-flight upload |
| Media rows | Weak hierarchy | Status chips, reorder grip affordance, stronger drag-active styling, clearer actions |

---

## Part 2 — Cropper fixes (technical)

1. **Layout:** Dialog uses `max-h-[100dvh]` / `sm:max-h-[min(92vh,880px)]`, crop stage `min-h-[min(52vh,420px)]` (larger on `sm`), grid `min-h-0 flex-1` to avoid zero-height flex bugs.
2. **Load gate:** Spinner until `onMediaLoaded`; zoom/confirm disabled until ready.
3. **Errors:** `mediaProps.onError` surfaces load failure copy; `mediaReady` stays false.
4. **Preview vs confirm:** Both call `getCroppedImageBlob(..., cropBlobOptions())` with identical JPEG quality and **pixel ratio**.
5. **Confirm copy:** Primary action labeled **ক্রপ নিশ্চিত করুন** (upload happens on the row after close).
6. **Accessibility:** Dialog focus trap friendly (`tabIndex={-1}`, focus on open), ESC unchanged, range input for zoom, preview region labeled.

---

## Part 3 — Upload architecture changes

**Intended flow (unchanged API, clarified sequencing):**

1. User selects image → `URL.createObjectURL` → crop modal opens (`key` = object URL).
2. User adjusts crop → debounced preview blob matches confirm pipeline.
3. User confirms → **blob generated in modal** → parent **`revokeCropUrl()`** (closes modal, revokes URL) → **`runUpload(rowIndex, blob, fileName)`** → progress on row → `uploadedFileId` set.

**No original file upload** for COVER/GALLERY — only cropped JPEG blob (as before).

---

## Part 4 — Files modified

| File | Change summary |
|------|----------------|
| `src/lib/admin-semen/semen-media-crop-utils.ts` | Optional `CroppedImageBlobOptions`; retina-friendly canvas scaling; `image.decoding`; rounding via `Math.round` for dimensions |
| `src/components/admin/semen-template/ImageCropperModal.tsx` | Layout, load/error handling, shared crop output options, `mediaProps`, preview debounce deps fix |
| `src/components/admin/semen/SemenTemplateMediaSection.tsx` | Confirm→close→upload ordering; per-row drag depth map; `dragend` cleanup; drop multi-file message; premium drop zone + busy panel; status chips; reorder grip; contextual footer buttons; image `alt`; `aria-describedby` on file pick |

**Unchanged (by design):** `semen-media-upload.ts`, API routes, Prisma/media schema, `TemplateForm` / `SemenServiceTemplateForm` contract.

---

## Part 5 — QA checklist (manual)

Recommended checks in browser (`npm run dev`):

- [ ] COVER 16∶9 crop + preview matches saved thumbnail  
- [ ] GALLERY 1∶1 crop + preview matches saved thumbnail  
- [ ] Confirm crop → modal closes → progress card → preview updates  
- [ ] ESC / backdrop / বাতিল close without upload  
- [ ] Drag highlight stable across dashed zone children  
- [ ] Drop 2+ files → warning + first file used  
- [ ] Invalid MIME / oversize → validation messages  
- [ ] Reorder + delete + “পুনরায় ক্রপ” / “ফাইল বেছে নিন”  
- [ ] VIDEO_URL unchanged (URL + embed)  
- [ ] Console: no React hydration errors on this page (media section is `ssr: false`)  

**Automated:** `npm run typecheck` passes; ESLint clean for touched files (project still has unrelated script warnings).

---

## Part 6 — Remaining recommendations

1. **Server-side image normalization:** Optionally run Sharp on upload to cap max dimensions/MB for consistent CDN behavior (mobile API already has pipelines — align admin uploads if needed).
2. **Toast vs form error:** `onError` still maps to top-level form error in `SemenServiceTemplateForm`; optional improvement is row-scoped toasts for faster feedback without scrolling.
3. **Drag-reorder:** Current UX uses explicit up/down buttons + grip affordance; full drag-sort reorder would need a lightweight sortable list dependency or larger refactor.
4. **Video poster:** For `VIDEO_UPLOAD`, optional poster frame upload could reuse the same crop utilities with a video-first picker (out of current scope).

---

*Generated as part of the media upload rebuild for Prani Doctor admin semen service templates.*
