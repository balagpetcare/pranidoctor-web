"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/cn";

import { buildAdminBreadcrumbs } from "./admin-breadcrumbs";

export type AdminBreadcrumbProps = Readonly<{
  pathname: string;
  className?: string;
}>;

export function AdminBreadcrumb({ pathname, className }: AdminBreadcrumbProps) {
  const crumbs = useMemo(() => buildAdminBreadcrumbs(pathname), [pathname]);

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="ব্রেডক্রাম্ব"
      className={cn(
        "pd-admin-breadcrumb flex min-w-0 flex-wrap items-center gap-1 text-xs text-[var(--pd-admin-muted)] sm:text-sm",
        className,
      )}
      lang="bn"
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isFirst = index === 0;
        return (
          <span key={`${crumb.label}-${index}`} className="inline-flex min-w-0 items-center gap-1">
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
            ) : null}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="inline-flex max-w-[12rem] items-center gap-1 truncate rounded-sm text-emerald-800 underline-offset-2 transition-colors hover:text-emerald-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 sm:max-w-none"
              >
                {isFirst ? <Home className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                <span className="truncate">{crumb.label}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  "inline-flex max-w-[14rem] items-center gap-1 truncate sm:max-w-none",
                  isLast && "font-medium text-zinc-800 dark:text-zinc-100",
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {isFirst ? <Home className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                <span className="truncate">{crumb.label}</span>
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
