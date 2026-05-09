import { cn } from "@/lib/cn";

const variants = {
  default: "bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700",
  success:
    "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-900/15 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-500/25",
  warning:
    "bg-amber-50 text-amber-950 ring-1 ring-amber-900/15 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-500/25",
  danger:
    "bg-red-50 text-red-900 ring-1 ring-red-900/15 dark:bg-red-950/40 dark:text-red-100 dark:ring-red-500/25",
  info: "bg-sky-50 text-sky-950 ring-1 ring-sky-900/15 dark:bg-sky-950/40 dark:text-sky-100 dark:ring-sky-500/25",
  neutral:
    "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700",
} as const;

export type AdminBadgeVariant = keyof typeof variants;

export type AdminBadgeProps = Readonly<{
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
  className?: string;
}>;

export function AdminBadge({ children, variant = "default", className }: AdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
