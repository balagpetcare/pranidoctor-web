import { cn } from "@/lib/cn";

export type AdminLoadingStateProps = Readonly<{
  message?: React.ReactNode;
  className?: string;
}>;

export function AdminLoadingState({
  message = "লোড হচ্ছে…",
  className,
}: AdminLoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[var(--pd-admin-radius,0.75rem)] border border-zinc-200 bg-[var(--pd-admin-surface)] px-6 py-12 dark:border-zinc-800 dark:bg-zinc-900/80",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-xs flex-col gap-2">
        <div className="h-2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-2 w-4/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-2 w-3/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  );
}
