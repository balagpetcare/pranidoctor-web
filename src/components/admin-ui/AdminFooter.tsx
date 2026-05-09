"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";

import { useAdminTheme } from "./useAdminTheme";

/**
 * Larkon-style shell footer — visibility follows `footerVisible` in {@link useAdminTheme}.
 * Sits below the scrolling {@link AdminContent} column so long pages do not overlap it.
 */
export function AdminFooter() {
  const { footerVisible, contentWidth } = useAdminTheme();

  if (!footerVisible) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <footer
      className="pd-admin-footer shrink-0 border-t border-[var(--pd-admin-border)] bg-[var(--pd-admin-app-bg)] text-xs text-[var(--pd-admin-muted)]"
      role="contentinfo"
      lang="bn"
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5 lg:px-8",
          contentWidth === "contained" && "max-w-[1600px]",
        )}
      >
        <p className="shrink-0 text-zinc-600 dark:text-zinc-400">
          © {year} Prani Doctor
        </p>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">প্রাণী ডাক্তার অ্যাডমিন</span>
          <nav
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--pd-admin-muted)]"
            aria-label="ফুটার লিংক"
          >
            <Link
              href="/admin/settings"
              className="rounded-sm text-emerald-800 underline-offset-4 transition-colors hover:text-emerald-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
              title="Settings"
            >
              সেটিংস
            </Link>
            <Link
              href="/admin/notifications"
              className="rounded-sm text-emerald-800 underline-offset-4 transition-colors hover:text-emerald-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
              title="Notifications"
            >
              নোটিফিকেশন
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
