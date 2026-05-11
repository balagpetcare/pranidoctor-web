import { cn } from "@/lib/cn";

export type AdminFormSectionProps = Readonly<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}>;

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: AdminFormSectionProps) {
  return (
    <section
      className={cn(
        "space-y-5 rounded-[var(--pd-admin-radius,0.75rem)] border border-zinc-200/90 bg-[var(--pd-admin-surface)] p-5 shadow-[var(--pd-admin-card-shadow)] sm:p-6",
        "dark:border-zinc-800 dark:bg-zinc-900/80",
        className,
      )}
    >
      {title || description ? (
        <div className="space-y-1 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          {title ? (
            <h2 className="pd-admin-section-title text-zinc-900 dark:text-zinc-50">{title}</h2>
          ) : null}
          {description ? (
            <p className="pd-admin-page-description">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
