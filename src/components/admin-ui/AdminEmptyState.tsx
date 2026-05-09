import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/cn";

export type AdminEmptyStateProps = Readonly<{
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}>;

export function AdminEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--pd-admin-radius,0.75rem)] border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/40",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
