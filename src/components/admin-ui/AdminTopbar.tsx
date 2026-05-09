"use client";

import { ChevronsLeft, ChevronsRight, Menu, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";

import { AdminNotificationsMenu } from "./AdminNotificationsMenu";
import { AdminProfileMenu } from "./AdminProfileMenu";
import { AdminThemeCustomizer } from "./AdminThemeCustomizer";
import { useAdminTheme } from "./useAdminTheme";

export type AdminTopbarProps = Readonly<{
  sectionTitle: string;
  onOpenMobileMenu: () => void;
  onSignOut: () => void | Promise<void>;
}>;

export function AdminTopbar({ sectionTitle, onOpenMobileMenu, onSignOut }: AdminTopbarProps) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const { sidebarMode, setSidebarMode } = useAdminTheme();
  const sidebarCollapsed = sidebarMode === "collapsed";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-[var(--pd-admin-topbar-h,3.75rem)] shrink-0 items-center gap-1.5 border-b border-[var(--pd-admin-border)] bg-[var(--pd-admin-topbar-bg)] px-2 backdrop-blur sm:gap-2 sm:px-3 md:hidden dark:border-zinc-800",
        )}
      >
        <button
          type="button"
          className="shrink-0 rounded-[var(--pd-admin-radius-sm)] p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={onOpenMobileMenu}
          aria-label="মেনু খুলুন"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {sectionTitle}
        </h1>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <AdminNotificationsMenu />
          <button
            type="button"
            className="shrink-0 rounded-[var(--pd-admin-radius-sm)] p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => setThemeCustomizerOpen(true)}
            aria-label="থিম সেটিংস"
            title="থিম সেটিংস"
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden />
          </button>
          <AdminProfileMenu onSignOut={onSignOut} />
        </div>
      </header>

      <header
        className={cn(
          "pd-admin-topbar-desktop hidden h-[var(--pd-admin-topbar-h,3.75rem)] shrink-0 items-center justify-between gap-4 border-b border-[var(--pd-admin-border)] bg-[var(--pd-admin-topbar-bg)] px-4 backdrop-blur sm:px-6 md:flex dark:border-zinc-800",
        )}
        lang="bn"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="hidden shrink-0 rounded-[var(--pd-admin-radius-sm)] p-2 text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 md:inline-flex dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={() => setSidebarMode(sidebarCollapsed ? "expanded" : "collapsed")}
            aria-label={sidebarCollapsed ? "সাইডবার বড় করুন" : "সাইডবার ছোট করুন"}
            title={sidebarCollapsed ? "সাইডবার বড় করুন" : "সাইডবার ছোট করুন"}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="h-5 w-5" aria-hidden />
            ) : (
              <ChevronsLeft className="h-5 w-5" aria-hidden />
            )}
          </button>
          <span className="shrink-0 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
            প্রাণী ডাক্তার
          </span>
          <span className="h-4 w-px shrink-0 bg-[var(--pd-admin-border)]" aria-hidden />
          <h1 className="min-w-0 truncate text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
            {sectionTitle}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <AdminNotificationsMenu />
          <button
            type="button"
            className="rounded-[var(--pd-admin-radius-sm)] p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={() => setThemeCustomizerOpen(true)}
            aria-label="থিম সেটিংস"
            title="থিম সেটিংস"
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden />
          </button>
          <AdminProfileMenu onSignOut={onSignOut} />
        </div>
      </header>

      <AdminThemeCustomizer
        open={themeCustomizerOpen}
        onClose={() => setThemeCustomizerOpen(false)}
      />
    </>
  );
}
