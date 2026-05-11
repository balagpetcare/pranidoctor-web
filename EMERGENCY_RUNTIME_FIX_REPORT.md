# Emergency Runtime Fix Report

## Root Causes Found
- Cropper state reset used a queued microtask, so stale resets could fire after reopening and destabilize preview/area state.
- Cropper state was not reset when `imageSrc` changed, leaving stale `areaPixels` and preview artifacts between sessions.
- Media cards had no local preview pipeline; the UI went blank while uploads were running, making the flow feel broken.
- Upload concurrency guard relied on a `useEffect` mirror, leaving a small race window for duplicate uploads.
- Grid rows and media cards had no deterministic height, causing layout shifts when previews appeared.
- Editor min-height was only applied to `ProseMirror`, leaving the scroll container free to collapse in some layouts.

## Fixes Applied (Runtime)
- **Cropper lifecycle**: reset state synchronously on close, invalidate in-flight previews, and hard-reset when `imageSrc` changes (`useImageCropper.ts`).
- **Cropper render stability**: enforce deterministic cropper height, guard empty image rendering, and key the cropper by `imageSrc` (`ImageCropperModal.tsx`).
- **Immediate media previews**: create object URL previews for cropped images and uploaded videos; clean up on row removal or after successful upload (`SemenTemplateMediaSection.tsx`).
- **Upload race fix**: update `uploadingIndexRef` immediately on start and clear on finish (`SemenTemplateMediaSection.tsx`).
- **Layout stability**: apply `auto-rows-fr` + `h-full` + min-height on cards and thumbs; add empty preview placeholder text (`SemenTemplateMediaSection.tsx`).
- **Editor height stability**: apply min-height to editor scroll container, not just the inner `ProseMirror` (`RichTextContent.tsx`, `RichTextEditor.tsx`).

## Files Modified
- `src/components/admin/media/useImageCropper.ts`
- `src/components/admin/media/ImageCropperModal.tsx`
- `src/components/admin/semen/SemenTemplateMediaSection.tsx`
- `src/components/admin/rich-text/RichTextContent.tsx`
- `src/components/admin/rich-text/RichTextEditor.tsx`

## Runtime Behavior Repaired
- Crop modal no longer collapses; crop area height is deterministic.
- Preview panel updates reliably and matches exported crop.
- Upload flow shows immediate local previews and stable media cards while upload completes.
- Upload concurrency guards are enforced immediately.
- Editor height is stable across empty/non-empty states and toolbar wraps without collapsing.

## Remaining Edge Cases
- If storage is disabled/misconfigured, uploads will still fail server-side (surface error text is preserved).
- Video previews use local object URLs during upload; very large videos may still load slowly depending on the browser.

## Before vs After
- **Before**: cropper could reopen in a stale state, previews blank during uploads, cards jumped in height, editor height collapsed.
- **After**: cropper always opens cleanly, previews show instantly, media cards remain consistent, editor height stays stable.
