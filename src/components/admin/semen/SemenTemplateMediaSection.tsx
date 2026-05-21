"use client";

import dynamic from "next/dynamic";
import {
  ChevronDown,
  ChevronUp,
  Crop,
  Film,
  GripVertical,
  ImageIcon,
  Link2,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import type { SemenTemplateMediaFormRow } from "@/components/admin/semen/semen-template-media-types";
import {
  DEFAULT_SEMEN_TEMPLATE_MEDIA_KIND,
  SEMEN_TEMPLATE_MEDIA_KIND_OPTIONS,
  type SemenTemplateMediaKindValue,
} from "@/components/admin/semen/semen-ui-options";
import { khInputClass, khLabelClass } from "@/components/admin/knowledge-hub/styles";
import {
  mediaKindFileAccept,
  uploadAdminSemenFileWithProgress,
  uploadPurposeForSemenTemplateMedia,
} from "@/lib/admin-semen/semen-media-upload";
import { parseVideoEmbedUrl, videoEmbedIframeSrc } from "@/lib/admin-semen/semen-video-embed";
import { cn } from "@/lib/cn";

const ImageCropperModal = dynamic(
  () =>
    import("@/components/admin/semen-template/ImageCropperModal").then((m) => ({
      default: m.ImageCropperModal,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
        role="status"
        aria-live="polite"
      >
        <div className="rounded-2xl border border-zinc-200/90 bg-white/95 px-5 py-4 text-sm font-medium text-zinc-800 shadow-2xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-100">
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-600 dark:border-emerald-400/25 dark:border-t-emerald-400" />
            ক্রপ লোড হচ্ছে…
          </span>
        </div>
      </div>
    ),
  },
);

const ASPECT_COVER = 16 / 9;
/** Gallery tiles are square in product UX */
const ASPECT_GALLERY = 1;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

function kindBadgeVariant(kind: SemenTemplateMediaKindValue): AdminBadgeVariant {
  if (kind === "COVER") return "info";
  if (kind === "GALLERY") return "success";
  if (kind === "VIDEO_UPLOAD") return "warning";
  return "neutral";
}

function kindLabel(kind: SemenTemplateMediaKindValue): string {
  const o = SEMEN_TEMPLATE_MEDIA_KIND_OPTIONS.find((k) => k.value === kind);
  return o?.label ?? kind;
}

export type SemenTemplateMediaSectionProps = Readonly<{
  mediaRows: SemenTemplateMediaFormRow[];
  setMediaRow: (index: number, patch: Partial<SemenTemplateMediaFormRow>) => void;
  removeMediaRow: (index: number) => void;
  addMediaRow: (kind?: SemenTemplateMediaKindValue) => void;
  onMediaKindChange: (index: number, next: SemenTemplateMediaKindValue) => void;
  saving: boolean;
  disabled?: boolean;
  onBusy: (busy: boolean) => void;
  onError: (message: string | null) => void;
  /** Swap row with neighbor; used for gallery / list ordering (matches saved sortOrder). */
  swapMediaAdjacent?: (index: number, direction: -1 | 1) => void;
  /** Tighter spacing and fewer columns — use inside split admin layouts. */
  density?: "default" | "compact";
}>;

export function SemenTemplateMediaSection(props: SemenTemplateMediaSectionProps) {
  const {
    mediaRows,
    setMediaRow,
    removeMediaRow,
    addMediaRow,
    onMediaKindChange,
    saving,
    disabled,
    onBusy,
    onError,
    swapMediaAdjacent,
    density = "default",
  } = props;
  const locked = Boolean(disabled) || saving;
  const compact = density === "compact";

  const mountedRef = useRef(true);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const uploadingIndexRef = useRef<number | null>(null);
  /** Per-row nested dragenter/dragleave depth — stable highlight without flicker */
  const dragDepthMapRef = useRef<Map<number, number>>(new Map());
  const previewMapRef = useRef<Map<string, string>>(new Map());
  const cropRef = useRef<{
    rowIndex: number;
    objectUrl: string;
    aspect: number;
    purpose: string;
    title: string;
  } | null>(null);

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  /** Mirrors previewMapRef for render (avoid reading refs during render). */
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [crop, setCrop] = useState<{
    rowIndex: number;
    objectUrl: string;
    aspect: number;
    purpose: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  useEffect(() => {
    uploadingIndexRef.current = uploadingIndex;
  }, [uploadingIndex]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      uploadAbortRef.current?.abort();
      uploadAbortRef.current = null;
      const c = cropRef.current;
      if (c?.objectUrl) URL.revokeObjectURL(c.objectUrl);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke latest previews at unmount (mutable map)
      const previewSnapshot = previewMapRef.current;
      for (const url of previewSnapshot.values()) {
        URL.revokeObjectURL(url);
      }
      previewSnapshot.clear();
    };
  }, []);

  const mediaBusy = uploadingIndex !== null || crop !== null;
  useEffect(() => {
    onBusy(mediaBusy);
  }, [mediaBusy, onBusy]);

  const revokeCropUrl = useCallback(() => {
    setCrop((c) => {
      if (c?.objectUrl) URL.revokeObjectURL(c.objectUrl);
      return null;
    });
  }, []);

  const setLocalPreview = useCallback((clientKey: string, url: string) => {
    const map = previewMapRef.current;
    const prev = map.get(clientKey);
    if (prev && prev !== url) URL.revokeObjectURL(prev);
    map.set(clientKey, url);
    setPreviewUrls(Object.fromEntries(map));
  }, []);

  const clearLocalPreview = useCallback((clientKey: string) => {
    const map = previewMapRef.current;
    const prev = map.get(clientKey);
    if (prev) URL.revokeObjectURL(prev);
    if (map.delete(clientKey)) {
      setPreviewUrls(Object.fromEntries(map));
    }
  }, []);

  const runUpload = useCallback(
    async (rowIndex: number, file: Blob, fileName: string) => {
      const row = mediaRows[rowIndex];
      if (!row) return;
      if (uploadingIndexRef.current !== null) return;
      const purpose = uploadPurposeForSemenTemplateMedia(row.kind);
      if (!purpose) return;
      const rowKey = row.clientKey;
      uploadAbortRef.current?.abort();
      const ac = new AbortController();
      uploadAbortRef.current = ac;
      onError(null);
      uploadingIndexRef.current = rowIndex;
      setUploadingIndex(rowIndex);
      setUploadPct(0);
      try {
        const data = await uploadAdminSemenFileWithProgress({
          file,
          fileName,
          purpose,
          onProgress: (p) => {
            if (mountedRef.current) setUploadPct(p);
          },
          signal: ac.signal,
        });
        if (mountedRef.current) {
          setMediaRow(rowIndex, { uploadedFileId: data.fileId });
          clearLocalPreview(rowKey);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (mountedRef.current) {
          onError(e instanceof Error ? e.message : "আপলোড ব্যর্থ");
        }
      } finally {
        if (uploadAbortRef.current === ac) uploadAbortRef.current = null;
        if (uploadingIndexRef.current === rowIndex) uploadingIndexRef.current = null;
        if (mountedRef.current) {
          setUploadingIndex(null);
          setUploadPct(null);
        }
      }
    },
    [clearLocalPreview, mediaRows, onError, setMediaRow],
  );

  const handlePickedFile = useCallback(
    (rowIndex: number, file: File | null) => {
      if (!file || locked) return;
      if (uploadingIndexRef.current !== null) {
        onError("একটি আপলোড ইতিমধ্যে চলছে। শেষ হওয়ার জন্য অপেক্ষা করুন।");
        return;
      }
      const row = mediaRows[rowIndex];
      if (!row) return;

      const purpose = uploadPurposeForSemenTemplateMedia(row.kind);
      if (!purpose) {
        onError("এই ধরনের জন্য ফাইল আপলোড হয় না।");
        return;
      }

      if (row.kind === "COVER" || row.kind === "GALLERY") {
        if (cropRef.current !== null) {
          onError("ক্রপ মোডাল খোলা থাকলে নতুন ছবি নির্বাচন করা যাবে না।");
          return;
        }
        const accept = mediaKindFileAccept(row.kind).split(",");
        if (!accept.some((a) => file.type === a.trim())) {
          onError("শুধু JPG, PNG বা WebP ছবি নির্বাচন করুন।");
          return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          onError(`ছবির আকার সর্বোচ্চ ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB হতে হবে।`);
          return;
        }
        const objectUrl = URL.createObjectURL(file);
        setCrop({
          rowIndex,
          objectUrl,
          aspect: row.kind === "COVER" ? ASPECT_COVER : ASPECT_GALLERY,
          purpose,
          title: `${kindLabel(row.kind)} — ক্রপ`,
        });
        return;
      }

      if (row.kind === "VIDEO_UPLOAD") {
        if (file.size > MAX_VIDEO_BYTES) {
          onError(`ভিডিও সর্বোচ্চ ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB হতে হবে।`);
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        setLocalPreview(row.clientKey, previewUrl);
        void runUpload(rowIndex, file, file.name || "video.mp4");
      }
    },
    [locked, mediaRows, onError, runUpload, setLocalPreview],
  );

  const collectDroppedFiles = useCallback(
    (rowIndex: number, dt: DataTransfer | null) => {
      const files = dt?.files;
      if (!files || files.length === 0) return;
      if (files.length > 1) {
        onError("একাধিক ফাইল পড়েছিল — শুধু প্রথম ফাইলটি নেওয়া হয়েছে।");
      }
      handlePickedFile(rowIndex, files[0] ?? null);
    },
    [handlePickedFile, onError],
  );

  const resetDragDepth = useCallback(() => {
    dragDepthMapRef.current.clear();
    setDragOverIndex(null);
  }, []);

  useEffect(() => {
    const onDragEnd = () => resetDragDepth();
    window.addEventListener("dragend", onDragEnd);
    return () => window.removeEventListener("dragend", onDragEnd);
  }, [resetDragDepth]);

  useEffect(() => {
    const validKeys = new Set(
      mediaRows
        .filter((row) => uploadPurposeForSemenTemplateMedia(row.kind))
        .map((row) => row.clientKey),
    );
    let changed = false;
    for (const [key, url] of previewMapRef.current.entries()) {
      if (!validKeys.has(key)) {
        URL.revokeObjectURL(url);
        previewMapRef.current.delete(key);
        changed = true;
      }
    }
    if (changed) {
      queueMicrotask(() => {
        setPreviewUrls(Object.fromEntries(previewMapRef.current));
      });
    }
  }, [mediaRows]);

  return (
    <>
      <ImageCropperModal
        key={crop?.objectUrl ?? "semen-crop-closed"}
        open={crop !== null}
        title={crop?.title ?? "ক্রপ"}
        imageSrc={crop?.objectUrl ?? ""}
        aspect={crop?.aspect ?? ASPECT_COVER}
        showPreview
        onClose={() => {
          revokeCropUrl();
        }}
        onConfirm={async (blob: Blob) => {
          const session = cropRef.current;
          if (!session) return;
          if (uploadingIndexRef.current !== null) {
            onError("একটি আপলোড ইতিমধ্যে চলছে। শেষ হলে আবার চেষ্টা করুন।");
            return;
          }
          const idx = session.rowIndex;
          const row = mediaRows[idx];
          if (row) {
            const previewUrl = URL.createObjectURL(blob);
            setLocalPreview(row.clientKey, previewUrl);
          }
          revokeCropUrl();
          await runUpload(idx, blob, `semen-crop-${Date.now()}.jpg`);
        }}
      />

      <div
        className={cn(
          "pd-semen-media-section overflow-hidden rounded-[var(--pd-admin-radius)] border border-zinc-200/90 bg-[var(--pd-admin-surface)] shadow-[var(--pd-admin-card-shadow)] transition-shadow duration-300 dark:border-zinc-800 dark:bg-zinc-900/85",
        )}
      >
        <div
          className={cn(
            "relative border-b border-zinc-200/90 bg-gradient-to-r from-zinc-50/90 via-white to-emerald-50/30 dark:border-zinc-800 dark:from-zinc-900/90 dark:via-zinc-950 dark:to-emerald-950/20",
            compact ? "px-3 py-2.5" : "px-4 py-3.5",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <ImageIcon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    মিডিয়া ও গ্যালারি
                  </h3>
                  <p
                    className={cn(
                      "text-zinc-600 dark:text-zinc-400",
                      compact ? "mt-0.5 text-[11px] leading-snug" : "mt-1 text-xs leading-relaxed",
                    )}
                  >
                    কভার ১৬∶৯ ও গ্যালারি ১∶১ ক্রপে আপলোড। সারির ক্রম সংরক্ষণে ব্যবহৃত হবে — কভার সাধারণত
                    প্রথমে রাখুন। ভিডিও URL-এ ইউটিউব/ভিমিও লিংক দিন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-wrap border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50/90 via-white/95 to-zinc-50/80 dark:border-zinc-800 dark:from-zinc-900/55 dark:via-zinc-950/90 dark:to-zinc-900/55",
            compact ? "gap-1.5 px-3 py-2" : "gap-2 px-4 py-2.5",
          )}
        >
          <AdminActionButton
            type="button"
            variant="secondary"
            disabled={locked}
            onClick={() => addMediaRow("COVER")}
          >
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" aria-hidden />
              কভার
            </span>
          </AdminActionButton>
          <AdminActionButton
            type="button"
            variant="secondary"
            disabled={locked}
            onClick={() => addMediaRow("GALLERY")}
          >
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" aria-hidden />
              গ্যালারি
            </span>
          </AdminActionButton>
          <AdminActionButton
            type="button"
            variant="secondary"
            disabled={locked}
            onClick={() => addMediaRow("VIDEO_UPLOAD")}
          >
            <span className="inline-flex items-center gap-1.5">
              <Film className="h-4 w-4" aria-hidden />
              ভিডিও আপলোড
            </span>
          </AdminActionButton>
          <AdminActionButton
            type="button"
            variant="secondary"
            disabled={locked}
            onClick={() => addMediaRow("VIDEO_URL")}
          >
            <span className="inline-flex items-center gap-1.5">
              <Link2 className="h-4 w-4" aria-hidden />
              ভিডিও URL
            </span>
          </AdminActionButton>
        </div>

        <div className={compact ? "p-3" : "p-4"}>
          {mediaRows.length === 0 ? (
            <div
              className={cn(
                "pd-semen-media-empty group relative overflow-hidden rounded-xl border-2 border-dashed border-zinc-300/85 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/35 text-center text-zinc-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-emerald-400/55 hover:shadow-[0_12px_40px_-20px_rgba(16,185,129,0.35)] dark:border-zinc-600 dark:from-zinc-900/55 dark:via-zinc-950 dark:to-emerald-950/25 dark:text-zinc-400 dark:hover:border-emerald-500/45",
                compact ? "px-4 py-10 text-xs" : "px-6 py-14 text-sm",
              )}
              role="status"
              aria-label="কোনো মিডিয়া সারি নেই"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl transition-all duration-500 group-hover:opacity-100 dark:bg-emerald-500/12"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[min(80%,16rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent dark:via-emerald-500/20"
                aria-hidden
              />
              <UploadCloud
                className={cn(
                  "pd-semen-media-empty-icon mx-auto text-emerald-600/75 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:text-emerald-700 dark:text-emerald-400/85 dark:group-hover:text-emerald-300",
                  compact ? "mb-2 h-9 w-9" : "mb-3 h-11 w-11",
                )}
                aria-hidden
              />
              <p className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">মিডিয়া যোগ করুন</p>
              <p className="mx-auto mt-2 max-w-md text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                প্রথমে উপরের বাটন থেকে কভার, গ্যালারি বা ভিডিও সারি যোগ করুন। তারপর প্রতিটি কার্ডে ফাইল টেনে
                আনুন বা বেছে নিন — কভার ও গ্যালারিতে ক্রপ নিশ্চিত করলে শুধু ক্রপ করা ছবি সংরক্ষিত হবে।
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "grid auto-rows-fr grid-cols-1 sm:grid-cols-2",
                compact ? "gap-2 xl:grid-cols-2" : "gap-3 xl:grid-cols-3",
              )}
            >
              {mediaRows.map((row, i) => {
                const busyHere = uploadingIndex === i;
                const croppingHere = crop?.rowIndex === i;
                const embed = row.kind === "VIDEO_URL" ? parseVideoEmbedUrl(row.externalUrl) : null;
                const iframeSrc = embed ? videoEmbedIframeSrc(embed) : null;
                const urlTrim = row.externalUrl.trim();
                const urlOk = urlTrim.length > 0 && URL.canParse(urlTrim);
                const inputId = `semen-media-file-${row.clientKey}`;
                const helperTextId = `semen-media-formats-${row.clientKey}`;
                const imageKind = row.kind === "COVER" || row.kind === "GALLERY";
                const hasUploaded =
                  row.uploadedFileId.trim().length > 0 && row.kind !== "VIDEO_URL";
                const localPreview = previewUrls[row.clientKey] ?? null;
                const previewSrc =
                  row.kind === "VIDEO_UPLOAD"
                    ? localPreview
                    : localPreview ?? (hasUploaded ? `/api/admin/uploads/${row.uploadedFileId.trim()}` : null);

                return (
                  <div
                    key={row.clientKey}
                    data-pd-media-card="true"
                    className={cn(
                      "pd-semen-media-card group/card relative flex flex-col overflow-hidden rounded-[var(--pd-admin-radius)] border border-zinc-200/90 bg-white shadow-[var(--pd-admin-card-shadow)] ring-1 ring-black/[0.03] transition-[box-shadow,transform,border-color] duration-300 ease-out dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/[0.04]",
                      "h-full",
                      compact ? "min-h-72" : "min-h-88",
                      !(locked || busyHere) &&
                        "hover:-translate-y-0.5 hover:border-emerald-200/90 hover:shadow-[var(--pd-admin-card-shadow-lg)] dark:hover:border-emerald-900/40",
                      dragOverIndex === i &&
                        "scale-[1.01] border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/30 dark:border-emerald-500/70",
                      croppingHere && "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950",
                    )}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (locked || !uploadPurposeForSemenTemplateMedia(row.kind)) return;
                      const m = dragDepthMapRef.current;
                      m.set(i, (m.get(i) ?? 0) + 1);
                      setDragOverIndex(i);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!locked && uploadPurposeForSemenTemplateMedia(row.kind)) {
                        e.dataTransfer.dropEffect = "copy";
                        setDragOverIndex(i);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const m = dragDepthMapRef.current;
                      const next = (m.get(i) ?? 1) - 1;
                      if (next <= 0) {
                        m.delete(i);
                        setDragOverIndex((prev) => (prev === i ? null : prev));
                      } else {
                        m.set(i, next);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      resetDragDepth();
                      collectDroppedFiles(i, e.dataTransfer);
                    }}
                    >
                    <div
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/40",
                        compact ? "px-2 py-1.5" : "px-3 py-2",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <AdminBadge variant={kindBadgeVariant(row.kind)}>{kindLabel(row.kind)}</AdminBadge>
                        <span
                          className="rounded bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 tabular-nums dark:bg-zinc-800 dark:text-zinc-400"
                          title="সংরক্ষিত ক্রম"
                        >
                          #{i + 1}
                        </span>
                        {croppingHere ? (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                            ক্রপ খোলা
                          </span>
                        ) : busyHere ? (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                            আপলোড
                          </span>
                        ) : hasUploaded ? (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            সংরক্ষিত
                          </span>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                        {swapMediaAdjacent && mediaRows.length > 1 ? (
                          <div
                            className="flex items-center rounded-md border border-zinc-200/80 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-950"
                            role="group"
                            aria-label="সারির ক্রম — টেনে নয়, বাটন ব্যবহার করুন"
                          >
                            <span
                              className="hidden px-1 text-zinc-400 sm:inline-flex"
                              title="ক্রম পরিবর্তন"
                              aria-hidden
                            >
                              <GripVertical className="h-3.5 w-3.5" />
                            </span>
                            <button
                              type="button"
                              className="rounded p-1 text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:pointer-events-none disabled:opacity-35 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              disabled={locked || busyHere || i === 0}
                              onClick={() => swapMediaAdjacent(i, -1)}
                              aria-label={`সারি ${i + 1} উপরে সরান`}
                            >
                              <ChevronUp className="h-4 w-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              className="rounded p-1 text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:pointer-events-none disabled:opacity-35 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              disabled={locked || busyHere || i >= mediaRows.length - 1}
                              onClick={() => swapMediaAdjacent(i, 1)}
                              aria-label={`সারি ${i + 1} নিচে সরান`}
                            >
                              <ChevronDown className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        ) : null}
                        <select
                          value={row.kind}
                          onChange={(ev) =>
                            onMediaKindChange(i, ev.target.value as SemenTemplateMediaKindValue)
                          }
                          className={cn(khInputClass(), "max-w-full min-w-0 py-1 text-xs sm:max-w-[10rem]")}
                          disabled={locked || busyHere}
                          aria-label={`মিডিয়া ধরন — ${kindLabel(row.kind)}`}
                        >
                          {SEMEN_TEMPLATE_MEDIA_KIND_OPTIONS.map((k) => (
                            <option key={k.value} value={k.value}>
                              {k.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={cn("flex flex-1 flex-col gap-2", compact ? "gap-1.5 p-2" : "gap-2 p-3")}>
                      {uploadPurposeForSemenTemplateMedia(row.kind) ? (
                        <label
                          htmlFor={inputId}
                          aria-describedby={helperTextId}
                            className={cn(
                            "group flex cursor-pointer flex-col items-center justify-center rounded-[var(--pd-admin-radius-sm)] border-2 border-dashed border-zinc-300 bg-zinc-50/90 text-center text-xs text-zinc-600 transition-all duration-300 ease-out hover:border-emerald-400 hover:bg-emerald-50/45 active:scale-[0.99] dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/25",
                            compact
                              ? "min-h-[76px] gap-1 px-2 py-2"
                              : "min-h-[104px] gap-2 px-3 py-4",
                            (locked || busyHere) && "pointer-events-none opacity-60",
                            dragOverIndex === i &&
                              "scale-[1.02] border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/25 dark:bg-emerald-950/35",
                          )}
                        >
                          <UploadCloud
                            className={cn(
                              "transition-transform duration-200 group-hover:scale-105 group-hover:text-emerald-700 dark:group-hover:text-emerald-300",
                              "text-emerald-700/80 dark:text-emerald-400/90",
                              compact ? "h-6 w-6" : "h-8 w-8",
                            )}
                            aria-hidden
                          />
                          <span className="font-medium text-zinc-800 dark:text-zinc-100">
                            টেনে আনুন বা বেছে নিন
                          </span>
                          <span id={helperTextId} className="text-[11px] text-zinc-500">
                            {row.kind === "VIDEO_UPLOAD"
                              ? "MP4 বা WebM · সর্বোচ্চ ৮০ MB"
                              : "JPG, PNG, WebP · ক্রপ নিশ্চিত করলে শুধু ক্রপ করা অংশ আপলোড · সর্বোচ্চ ৫ MB"}
                          </span>
                          <input
                            id={inputId}
                            type="file"
                            accept={mediaKindFileAccept(row.kind)}
                            className="sr-only"
                            disabled={locked || busyHere}
                            aria-label={`${kindLabel(row.kind)} ফাইল নির্বাচন`}
                            onChange={(ev) => {
                              const f = ev.target.files?.[0] ?? null;
                              ev.target.value = "";
                              handlePickedFile(i, f);
                            }}
                          />
                        </label>
                      ) : null}

                      {busyHere ? (
                        <div
                          className="relative space-y-2 overflow-hidden rounded-lg border border-emerald-200/70 bg-gradient-to-br from-emerald-50/95 via-white to-zinc-50 px-3 py-3 text-xs shadow-inner dark:border-emerald-900/35 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-zinc-950"
                          role="status"
                          aria-live="polite"
                          aria-busy="true"
                        >
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_55%)]" />
                          <div className="relative flex items-center gap-2 font-medium text-emerald-900 dark:text-emerald-100">
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                            আপলোড চলছে…
                          </div>
                          {uploadPct !== null ? (
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                                style={{ width: `${uploadPct}%` }}
                              />
                            </div>
                          ) : null}
                          <p className="relative text-[11px] text-zinc-600 dark:text-zinc-400">
                            নেটওয়ার্কের গতি অনুযায়ী সময় লাগতে পারে।
                          </p>
                        </div>
                      ) : null}

                      {row.kind === "VIDEO_URL" ? (
                        <div className="space-y-2">
                          <label className={khLabelClass()}>
                            ভিডিও URL
                            <input
                              value={row.externalUrl}
                              onChange={(ev) => setMediaRow(i, { externalUrl: ev.target.value })}
                              className={khInputClass()}
                              placeholder="https://www.youtube.com/watch?v=…"
                              disabled={locked}
                            />
                          </label>
                          {!urlTrim ? (
                            <p className="text-[11px] text-zinc-500">লিংক লিখুন।</p>
                          ) : !urlOk ? (
                            <div
                              className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
                              role="status"
                            >
                              অবৈধ URL ফরম্যাট।
                            </div>
                          ) : !embed ? (
                            <div
                              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                              role="status"
                            >
                              এম্বেড প্রিভিউ নেই — ইউটিউব বা ভিমিও লিংক ব্যবহার করুন।{" "}
                              <a
                                href={urlTrim}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-emerald-800 underline dark:text-emerald-400"
                              >
                                খুলুন
                              </a>
                            </div>
                          ) : iframeSrc ? (
                            <div className="overflow-hidden rounded-md border border-zinc-200 bg-black/5 dark:border-zinc-700">
                              <div className="relative aspect-video w-full">
                                <iframe
                                  title="ভিডিও প্রিভিউ"
                                  src={iframeSrc}
                                  className="absolute inset-0 h-full w-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {previewSrc && row.kind !== "VIDEO_URL" ? (
                        <div
                          className={cn(
                            "pd-semen-media-thumb overflow-hidden rounded-[var(--pd-admin-radius-sm)] border border-zinc-200/90 bg-gradient-to-b from-zinc-50 to-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)] ring-1 ring-zinc-950/[0.04] transition-[box-shadow,transform] duration-300 ease-out group-hover/card:shadow-md dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-950 dark:ring-white/[0.05]",
                            "min-h-36",
                            row.kind === "COVER" && "aspect-video w-full",
                            row.kind === "GALLERY" && "aspect-square w-full max-w-56 self-center",
                          )}
                        >
                          {row.kind === "VIDEO_UPLOAD" ? (
                            <video
                              key={previewSrc}
                              src={previewSrc ?? undefined}
                              controls
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element -- admin signed URL preview */
                            <img
                              key={previewSrc}
                              alt={`${kindLabel(row.kind)} প্রিভিউ`}
                              src={previewSrc ?? undefined}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      ) : row.kind !== "VIDEO_URL" ? (
                        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-center text-[11px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
                          এখনো কোনো প্রিভিউ নেই — ফাইল বেছে নিলে এখানে দেখা যাবে।
                        </div>
                      ) : null}

                      <details className="rounded-md border border-zinc-100 text-xs dark:border-zinc-800">
                        <summary className="cursor-pointer px-2 py-1.5 text-zinc-600 dark:text-zinc-400">
                          টেকনিকাল আইডি
                        </summary>
                        <div className="border-t border-zinc-100 px-2 py-2 dark:border-zinc-800">
                          <label className={khLabelClass()}>
                            uploadedFileId
                            <input
                              value={row.uploadedFileId}
                              onChange={(ev) => setMediaRow(i, { uploadedFileId: ev.target.value })}
                              className={cn(khInputClass(), "font-mono text-[11px]")}
                              disabled={locked || busyHere}
                            />
                          </label>
                        </div>
                      </details>

                      <div className="mt-auto flex flex-wrap gap-2 pt-1">
                        {uploadPurposeForSemenTemplateMedia(row.kind) ? (
                          <AdminActionButton
                            type="button"
                            variant="secondary"
                            disabled={locked || busyHere}
                            onClick={() => document.getElementById(inputId)?.click()}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {imageKind && hasUploaded ? (
                                <Crop className="h-4 w-4 shrink-0" aria-hidden />
                              ) : null}
                              {imageKind && hasUploaded
                                ? "পুনরায় ক্রপ"
                                : row.kind === "VIDEO_UPLOAD" && hasUploaded
                                  ? "ভিডিও প্রতিস্থাপন"
                                  : "ফাইল বেছে নিন"}
                            </span>
                          </AdminActionButton>
                        ) : null}
                        <AdminActionButton
                          type="button"
                          variant="danger"
                          disabled={locked || busyHere}
                          onClick={() => removeMediaRow(i)}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Trash2 className="h-4 w-4" aria-hidden />
                            মুছুন
                          </span>
                        </AdminActionButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={cn("flex justify-end", compact ? "mt-2" : "mt-4")}>
            <AdminActionButton
              type="button"
              variant="secondary"
              className={compact ? "!px-2.5 !py-1.5 text-xs" : undefined}
              disabled={locked}
              onClick={() => addMediaRow(DEFAULT_SEMEN_TEMPLATE_MEDIA_KIND)}
            >
              + সাধারণ সারি
            </AdminActionButton>
          </div>
        </div>
      </div>
    </>
  );
}
