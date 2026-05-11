import { cn } from "@/lib/cn";

export type AdminPageHeaderProps = Readonly<{
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Primary actions (buttons, links) aligned end on desktop */
  actions?: React.ReactNode;
  className?: string;
}>;

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="pd-admin-page-title min-w-0 flex-1 truncate text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description ? (
          <div className="pd-admin-page-description max-w-2xl">{description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
