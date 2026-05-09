import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type AdminStatCardProps = {
  title: string;
  value: string;
  description?: string;
  /** Optional icon in a soft circle (Larkon-style KPI tile). */
  icon?: LucideIcon;
  className?: string;
};

export function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--pd-admin-radius,0.75rem)] border border-zinc-200/90 bg-[var(--pd-admin-surface)] p-5 shadow-[var(--pd-admin-card-shadow)]",
        "dark:border-zinc-800 dark:bg-zinc-900/80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
          {description ? (
            <p className="mt-1.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--pd-admin-radius-sm,0.5rem)] bg-emerald-50 text-emerald-800 ring-1 ring-emerald-900/10 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/20"
            aria-hidden
          >
            <Icon className="h-5 w-5 opacity-90" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
