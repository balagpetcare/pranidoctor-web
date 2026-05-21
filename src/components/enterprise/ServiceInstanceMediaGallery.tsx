"use client";

/* Signed object URLs — avoid next/image remote host coupling; lazy native img. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/cn";

export type MediaPreviewItem = {
  id: string;
  kind: string;
  signedUrl: string | null;
};

function isVideoKind(kind: string, url: string | null): boolean {
  const k = kind.toUpperCase();
  if (k.includes("VIDEO")) return true;
  if (!url) return false;
  const u = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp4|webm|ogg|mov)(\b|$)/i.test(u);
}

function MediaLightbox(props: {
  item: MediaPreviewItem;
  onClose: () => void;
}) {
  const { item, onClose } = props;
  const [scale, setScale] = useState(1);
  const video = isVideoKind(item.kind, item.signedUrl);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (video) return;
      e.preventDefault();
      setScale((s) => Math.min(4, Math.max(0.5, s - e.deltaY * 0.001)));
    },
    [video],
  );

  if (!item.signedUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="মিডিয়া প্রিভিউ"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] max-w-[min(96vw,1200px)] overflow-hidden rounded-xl bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
      >
        <button
          type="button"
          className="absolute right-2 top-2 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white hover:bg-black/70"
          onClick={onClose}
        >
          বন্ধ (Esc)
        </button>
        {!video ? (
          <img
            src={item.signedUrl}
            alt=""
            className="max-h-[88vh] max-w-full object-contain transition-transform duration-75 ease-out"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
          />
        ) : (
          <video
            className="max-h-[88vh] max-w-full"
            src={item.signedUrl}
            controls
            playsInline
            preload="metadata"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-xs text-white">
          <span className="font-medium">{item.kind}</span>
          {!video ? (
            <span className="ml-2 text-white/70">মাউস হুইলে জুম</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ServiceInstanceMediaGallery(props: {
  items: MediaPreviewItem[];
  className?: string;
}) {
  const [active, setActive] = useState<MediaPreviewItem | null>(null);
  const withUrl = useMemo(() => props.items.filter((m) => m.signedUrl), [props.items]);

  if (props.items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
        কোনো মিডিয়া সংযুক্ত নেই।
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", props.className)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {props.items.map((m) => {
          const vid = isVideoKind(m.kind, m.signedUrl);
          return (
            <button
              key={m.id}
              type="button"
              disabled={!m.signedUrl}
              onClick={() => m.signedUrl && setActive(m)}
              className={cn(
                "group relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 text-left transition hover:border-emerald-600/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900",
              )}
            >
              {m.signedUrl && !vid ? (
                <img
                  src={m.signedUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                />
              ) : m.signedUrl && vid ? (
                <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-xs text-zinc-300">
                  ভিডিও — ট্যাপ করে চালান
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-500">URL নেই</div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-white">{m.kind}</span>
              </div>
            </button>
          );
        })}
      </div>
      {withUrl.length === 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">সাইন করা URL পাওয়া যায়নি — স্টোরেজ কনফিগ চেক করুন।</p>
      ) : null}
      {active ? <MediaLightbox item={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}
