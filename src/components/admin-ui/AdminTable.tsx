import { cn } from "@/lib/cn";

export type AdminTableProps = Readonly<{
  children: React.ReactNode;
  className?: string;
  /** Outer wrapper — toolbar + table */
  toolbar?: React.ReactNode;
}>;

/**
 * Larkon-like table chrome: bordered card, horizontal scroll, dense header row.
 * Pass a native <table> as child (with thead/tbody).
 */
export function AdminTable({ children, className, toolbar }: AdminTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--pd-admin-radius,0.75rem)] border border-zinc-200/90 bg-[var(--pd-admin-surface)] shadow-[var(--pd-admin-card-shadow)]",
        "dark:border-zinc-800 dark:bg-zinc-900/80",
        className,
      )}
    >
      {toolbar ? (
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          {toolbar}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
          {children}
        </table>
      </div>
    </div>
  );
}
