"use client";

import { cn } from "@/lib/cn";

export type FormAsyncControlSkeletonProps = Readonly<{
  id?: string;
  className?: string;
  /** Screen reader label while the real control is not in the tree */
  label: string;
}>;

/**
 * Placeholder for async-loaded selects/inputs. Keeps layout stable and avoids
 * hydration-sensitive `disabled` toggles on real form controls during initial load.
 */
export function FormAsyncControlSkeleton({ id, className, label }: FormAsyncControlSkeletonProps) {
  return (
    <div
      id={id}
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn(
        "animate-pulse rounded-lg border border-zinc-200/90 bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-800/60",
        "min-h-[2.875rem] w-full",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
