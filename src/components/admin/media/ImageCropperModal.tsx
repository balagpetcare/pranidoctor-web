"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { cn } from "@/lib/cn";

import { CropperPreview } from "./CropperPreview";
import { type CropImageOptions } from "./cropImage";
import { useImageCropper } from "./useImageCropper";

export type ImageCropperModalProps = Readonly<{
  open: boolean;
  title: string;
  imageSrc: string;
  /** Width / height, e.g. 16/9 or 1 */
  aspect: number;
  onClose: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
  /** Optional: show debounced crop preview panel */
  showPreview?: boolean;
}>;

const CROP_OPTIONS: CropImageOptions = {
  mimeType: "image/jpeg",
  quality: 0.92,
};

/**
 * Responsive crop modal. Parent should remount with `key` when `imageSrc` changes.
 */
export function ImageCropperModal(props: ImageCropperModalProps) {
  const titleId = useId();
  const helpId = useId();
  const previewHelpId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState(false);
  const hasImage = Boolean(props.imageSrc);

  const cropOptions = useMemo(() => CROP_OPTIONS, []);
  const {
    crop,
    zoom,
    areaPixels,
    previewUrl,
    mediaReady,
    error,
    setCrop,
    setZoom,
    setError,
    onCropComplete,
    onMediaLoaded,
    onMediaError,
    resetView,
    createCroppedBlob,
  } = useImageCropper({
    open: props.open,
    imageSrc: props.imageSrc,
    showPreview: props.showPreview,
    cropOptions,
  });

  useEffect(() => {
    if (!props.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [props.open]);

  useEffect(() => {
    if (!props.open) return;
    const onClose = props.onClose;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        if (!working) onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose, working]);

  useEffect(() => {
    if (!props.open) return;
    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [props.open]);

  async function confirm() {
    if (!areaPixels) return;
    setWorking(true);
    setError(null);
    try {
      const blob = await createCroppedBlob();
      if (!blob) return;
      await props.onConfirm(blob);
    } catch {
      setError("ক্রপ বা প্রস্তুতকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setWorking(false);
    }
  }

  if (!props.open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[3px] sm:p-6",
        "pd-semen-backdrop-enter",
      )}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !working) props.onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={helpId}
        tabIndex={-1}
        className={cn(
          "pd-semen-panel-enter mx-auto flex max-h-[min(92dvh,880px)] w-full max-w-[min(52rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] outline-none ring-1 ring-black/[0.04] dark:border-zinc-700 dark:bg-zinc-900 dark:ring-white/[0.06]",
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200/95 bg-gradient-to-r from-white via-zinc-50/40 to-emerald-50/25 px-4 py-3.5 dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-950 dark:to-emerald-950/20 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {props.title}
            </h2>
            <p id={helpId} className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              ছবি টেনে সরান, স্লাইডারে জুম করুন। নিশ্চিত করলে শুধু ক্রপ করা অংশ আপলোড হবে। Esc চাপলে বন্ধ।
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={props.onClose}
            disabled={working}
            aria-label="ক্রপ বন্ধ করুন"
          >
            বন্ধ
          </button>
        </div>

        <div
          className={cn(
            "grid min-h-0 flex-1 overflow-hidden",
            props.showPreview ? "grid-cols-1 lg:grid lg:grid-cols-[minmax(0,1fr)_12.5rem]" : "grid-cols-1",
          )}
        >
          <div className="relative flex min-h-0 w-full min-w-0 flex-shrink-0 flex-col bg-zinc-950">
            {!mediaReady ? (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-zinc-950 text-xs text-zinc-400"
                role="status"
                aria-live="polite"
              >
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                {hasImage ? "ছবি লোড হচ্ছে…" : "ছবি খুঁজে পাওয়া যায়নি"}
              </div>
            ) : null}
            <div className="relative h-[min(52vh,420px)] min-h-64 flex-1 touch-none sm:h-[min(58vh,480px)]">
              {hasImage ? (
                <Cropper
                  key={props.imageSrc}
                  image={props.imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={props.aspect}
                  minZoom={1}
                  maxZoom={4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  onMediaLoaded={onMediaLoaded}
                  mediaProps={{
                    draggable: false,
                    alt: "",
                    onError: () => {
                      onMediaError("ছবি লোড হয়নি। বাতিল করে অন্য ফাইল চেষ্টা করুন।");
                    },
                  }}
                  showGrid
                  restrictPosition
                  zoomWithScroll
                  objectFit="contain"
                  roundCropAreaPixels
                />
              ) : null}
            </div>
          </div>

          {props.showPreview ? (
            <CropperPreview
              previewUrl={previewUrl}
              aspect={props.aspect}
              isReady={mediaReady}
              labelId={previewHelpId}
            />
          ) : null}
        </div>

        <div className="shrink-0 space-y-3 border-t border-zinc-200/95 bg-zinc-50/40 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-950/50 sm:px-5">
          <label className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              জুম
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="hidden w-7 shrink-0 text-center text-[10px] font-semibold tabular-nums text-zinc-400 sm:inline dark:text-zinc-500">
                ১×
              </span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="pd-semen-crop-zoom h-2 min-w-0 flex-1 cursor-pointer rounded-full bg-zinc-200 accent-emerald-600 dark:bg-zinc-700"
                disabled={working || !mediaReady}
                aria-valuemin={1}
                aria-valuemax={4}
                aria-valuenow={zoom}
                aria-label="জুম স্তর"
              />
              <span className="hidden w-7 shrink-0 text-center text-[10px] font-semibold tabular-nums text-zinc-400 sm:inline dark:text-zinc-500">
                ৪×
              </span>
            </div>
          </label>
          {error ? (
            <p className="text-xs text-rose-600 dark:text-rose-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200/80 pt-3 dark:border-zinc-800 sm:gap-3">
            <AdminActionButton type="button" variant="ghost" onClick={props.onClose} disabled={working}>
              বাতিল
            </AdminActionButton>
            <AdminActionButton type="button" variant="secondary" onClick={resetView} disabled={working || !mediaReady}>
              রিসেট
            </AdminActionButton>
            <AdminActionButton
              type="button"
              variant="primary"
              className="min-w-[9rem] shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-md active:scale-[0.98]"
              onClick={() => void confirm()}
              disabled={working || !areaPixels || !mediaReady}
              aria-busy={working}
            >
              {working ? "প্রস্তুত…" : "ক্রপ নিশ্চিত করুন"}
            </AdminActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
