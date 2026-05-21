"use client";

import { cn } from "@/lib/cn";

import { AdminBreadcrumb } from "./AdminBreadcrumb";

export type AdminWorkspaceProps = Readonly<{
  children: React.ReactNode;
  pathname: string;
  className?: string;
  /** When false, skips max-width container (full-bleed tables). Default true. */
  contained?: boolean;
}>;

/**
 * Scrollable main workspace: breadcrumb rail + page content column.
 */
export function AdminWorkspace({
  children,
  pathname,
  className,
  contained = true,
}: AdminWorkspaceProps) {
  return (
    <main
      id="pd-admin-workspace"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--pd-admin-main-bg)]",
        className,
      )}
    >
      <div className="border-b border-[var(--pd-admin-border)] bg-[var(--pd-admin-topbar-bg)]/60 px-4 py-2 sm:px-6 lg:px-8">
        {contained ? (
          <div className="mx-auto w-full max-w-[1600px]">
            <AdminBreadcrumb pathname={pathname} />
          </div>
        ) : (
          <AdminBreadcrumb pathname={pathname} />
        )}
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        {contained ? (
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
