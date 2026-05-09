import { cn } from "@/lib/cn";

export type AdminContentProps = Readonly<{
  children: React.ReactNode;
  className?: string;
  /** When false, skips max-width container (full-bleed tables). Default true. */
  contained?: boolean;
}>;

/**
 * Main scrollable content region — Larkon-style page padding and optional max width.
 */
export function AdminContent({
  children,
  className,
  contained = true,
}: AdminContentProps) {
  return (
    <main
      className={cn(
        "min-h-0 flex-1 overflow-y-auto bg-[var(--pd-admin-main-bg)] p-4 sm:p-6 lg:p-8",
        className,
      )}
    >
      {contained ? (
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
      ) : (
        children
      )}
    </main>
  );
}
