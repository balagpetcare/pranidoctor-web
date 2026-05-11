"use client";

import { cn } from "@/lib/cn";

export type CropperPreviewProps = Readonly<{
  previewUrl: string | null;
  aspect: number;
  isReady: boolean;
  labelId: string;
}>;

export function CropperPreview(props: CropperPreviewProps) {
  const { previewUrl, aspect, isReady, labelId } = props;
  return (
    <div
      className="flex max-h-44 min-h-0 flex-col gap-2 overflow-hidden border-t border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950 lg:max-h-none lg:border-l lg:border-t-0"
      aria-describedby={labelId}
    >
      <p
        id={labelId}
        className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        প্রিভিউ
      </p>
      <div
        className={cn(
          "relative mx-auto w-full max-w-[11rem] shrink-0 overflow-hidden rounded-xl border border-zinc-200/95 bg-white shadow-inner ring-1 ring-black/[0.04] dark:border-zinc-600 dark:bg-zinc-900 dark:ring-white/[0.06]",
        )}
        style={{ aspectRatio: aspect }}
      >
        {previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- blob preview */
          <img
            src={previewUrl}
            alt="ক্রপের প্রিভিউ"
            className="h-full w-full object-cover"
            decoding="async"
          />
        ) : (
          <div className="flex h-full min-h-[4.5rem] items-center justify-center px-2 text-center text-[11px] text-zinc-400">
            {!isReady ? "ছবি লোড হচ্ছে…" : "ক্রপ সরালে প্রিভিউ দেখাবে"}
          </div>
        )}
      </div>
    </div>
  );
}
