# React Easy Crop Initialization Report

**Target:** `/admin/semen-service-templates/new`  
**Goal:** Replace ad‑hoc crop logic with a reusable, enterprise-grade `react-easy-crop` architecture, while preserving upload APIs and media schema.

---

## 1) New reusable architecture

**Location:** `src/components/admin/media/`

- `ImageCropperModal.tsx` — stable modal using `react-easy-crop`, preview, zoom slider, ESC close, body scroll lock.
- `cropImage.ts` — canonical export pipeline (retina scaling, async blob).
- `cropUtils.ts` — helpers for image creation, safe pixel ratio, canvas drawing, blob export.
- `useImageCropper.ts` — preview lifecycle, debounced preview generation, state reset, memory cleanup.
- `CropperPreview.tsx` — isolated preview panel UI.

**Compatibility layer:** `src/lib/admin-semen/semen-media-crop-utils.ts` now wraps `cropImageToBlob` to preserve existing APIs.

---

## 2) Modal integration

**Component:** `ImageCropperModal` (now lives in `admin/media`, re-exported from `admin/semen-template`).

Features preserved:

- **Centered modal** with `pd-semen-*` transitions.
- **ESC close**, backdrop close, **body scroll lock**.
- **Zoom, drag, crop preview** and **reset/cancel/confirm** actions.
- **Mobile‑safe sizing** (`max-h-[min(92dvh,880px)]`, responsive padding).

---

## 3) Crop export pipeline

**Function:** `cropImageToBlob(imageSrc, pixelCrop, options)`

- **Retina‑quality** with capped device pixel ratio (1–2×).
- **High‑quality smoothing** on canvas.
- **Async blob export** via `canvas.toBlob`.
- **Strict cleanup** of preview URLs in hook.

---

## 4) Upload flow integration

Flow preserved:

1. **Select file** → create object URL → open cropper.  
2. **Crop & preview** (same pipeline as final export).  
3. **Confirm** → blob generated → upload **cropped blob only**.  
4. **Row preview** updates → `uploadedFileId` stored.

Guards retained:

- **No duplicate uploads** (`uploadingIndexRef` in media section).
- **No stale preview URLs** (revoke on close/unmount).
- **No race conditions** (debounced preview + `gen` tokens).

---

## 5) Premium cropper UX

- Smooth modal transitions (`pd-semen-backdrop-enter`, `pd-semen-panel-enter`).
- **Loading state** until media is ready.
- Polished preview frame and slider thumb (styled in `admin-shell.css`).
- Disabled states while processing; consistent action hierarchy.

---

## 6) Files updated

**New**

- `src/components/admin/media/ImageCropperModal.tsx`
- `src/components/admin/media/useImageCropper.ts`
- `src/components/admin/media/CropperPreview.tsx`
- `src/components/admin/media/cropImage.ts`
- `src/components/admin/media/cropUtils.ts`

**Updated**

- `src/components/admin/semen-template/ImageCropperModal.tsx` (re-export)
- `src/lib/admin-semen/semen-media-crop-utils.ts` (wrapper)
- `src/components/admin/semen/SemenTemplateMediaSection.tsx` (typed `blob` param)

---

## 7) QA checklist

- [ ] Crop preview matches saved image (cover + gallery).  
- [ ] Modal opens centered, responsive at mobile widths.  
- [ ] ESC / backdrop close works and restores scroll.  
- [ ] No blurry export (retina scaling).  
- [ ] No console errors or hydration warnings.  

---

## 8) Remaining recommendations

1. **Focus trap** for modal (optional) to meet strict WCAG modal rules.
2. Optional **progress overlay** inside crop modal (currently handled at row level).
3. Add **unit tests** for `cropImageToBlob` if introducing snapshot testing later.

