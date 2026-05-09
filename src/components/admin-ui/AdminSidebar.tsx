"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";

import { cn } from "@/lib/cn";

import type { AdminNavItem } from "./admin-nav";
import { useAdminTheme } from "./useAdminTheme";

export type AdminSidebarProps = Readonly<{
  items: AdminNavItem[];
  pathname: string;
  onSignOut: () => void | Promise<void>;
  onCloseMobile?: () => void;
  className?: string;
}>;

function isActive(href: string, normalized: string): boolean {
  if (href === "/admin") {
    return normalized === "/admin";
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}

export function AdminSidebar({
  items,
  pathname,
  onSignOut,
  onCloseMobile,
  className,
}: AdminSidebarProps) {
  const { sidebarMode, sidebarTheme } = useAdminTheme();
  const isCollapsed = sidebarMode === "collapsed";

  const normalized =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  const brandTitle = "Prani Doctor Admin — পশু সেবা ও অপারেশন";
  const brandAria = "প্রাণী ডাক্তার অ্যাডমিন — হোম";

  return (
    <aside
      data-pd-sidebar="rail"
      data-pd-sidebar-theme={sidebarTheme}
      className={cn(
        "pd-admin-sidebar flex w-[min(100%,var(--pd-admin-sidebar-w,18rem))] max-w-[var(--pd-admin-sidebar-w,18rem)] flex-col border-r border-[var(--pd-admin-sidebar-border)] bg-[var(--pd-admin-sidebar-bg)] shadow-[var(--pd-admin-card-shadow-lg)] md:shadow-none",
        className,
      )}
      style={{ width: "min(100%, var(--pd-admin-sidebar-w, 18rem))" }}
      lang="bn"
      aria-label="অ্যাডমিন মেনু"
    >
      <div
        className={cn(
          "flex h-[var(--pd-admin-topbar-h,3.75rem)] shrink-0 items-center gap-2 border-b border-[var(--pd-admin-sidebar-border)] px-3",
          isCollapsed && "md:justify-center md:px-2",
        )}
      >
        <Link
          href="/admin"
          className={cn(
            "min-w-0 flex-1 rounded-[var(--pd-admin-radius-sm)] text-sm font-semibold leading-tight tracking-tight text-[var(--pd-admin-sidebar-brand-fg)] transition-colors hover:bg-[var(--pd-admin-sidebar-hover-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
            isCollapsed && "max-md:block md:hidden",
          )}
          title={brandTitle}
          aria-label={brandAria}
          onClick={() => {
            onCloseMobile?.();
          }}
        >
          <span className="block truncate">প্রাণী ডাক্তার</span>
          <span className="block truncate text-[11px] font-normal text-[var(--pd-admin-sidebar-muted)]">
            অ্যাডমিন · Prani Doctor
          </span>
        </Link>
        {isCollapsed ? (
          <Link
            href="/admin"
            className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 md:flex"
            title={brandTitle}
            aria-label={brandAria}
            onClick={() => {
              onCloseMobile?.();
            }}
          >
            <span aria-hidden>প</span>
          </Link>
        ) : null}
        {onCloseMobile ? (
          <button
            type="button"
            className="shrink-0 rounded-[var(--pd-admin-radius-sm)] p-2 text-[var(--pd-admin-sidebar-icon-fg)] hover:bg-[var(--pd-admin-sidebar-hover-bg)] md:hidden"
            onClick={onCloseMobile}
            aria-label="সাইডবার বন্ধ করুন"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        ) : null}
      </div>

      <nav className={cn("flex-1 space-y-0.5 overflow-y-auto p-2 sm:p-3", isCollapsed && "md:px-1.5 md:py-2")}>
        {items.map(({ href, labelBn, titleEn, icon: Icon }) => {
          const active = isActive(href, normalized);
          const itemTitle = isCollapsed ? `${labelBn} — ${titleEn}` : titleEn;
          const itemAria = `${labelBn}. ${titleEn}`;
          return (
            <Link
              key={href}
              href={href}
              title={itemTitle}
              aria-label={itemAria}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                onCloseMobile?.();
              }}
              className={cn(
                "flex items-center gap-3 rounded-[var(--pd-admin-radius-sm)] px-3 py-2.5 text-sm font-medium leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
                isCollapsed && "md:justify-center md:px-2",
                active
                  ? "bg-[var(--pd-admin-sidebar-active-bg)] text-[var(--pd-admin-sidebar-active-fg)] ring-1 ring-[var(--pd-admin-sidebar-active-ring)]"
                  : "text-[var(--pd-admin-sidebar-link-fg)] hover:bg-[var(--pd-admin-sidebar-hover-bg)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  isCollapsed && "md:sr-only",
                )}
              >
                {labelBn}
              </span>
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-[var(--pd-admin-sidebar-border)] p-2 sm:p-3",
          isCollapsed && "md:px-1.5 md:py-2",
        )}
      >
        <button
          type="button"
          onClick={() => void onSignOut()}
          aria-label="লগ আউট"
          title="লগ আউট"
          className={cn(
            "flex w-full items-center gap-2 rounded-[var(--pd-admin-radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--pd-admin-sidebar-link-fg)] transition-colors hover:bg-[var(--pd-admin-sidebar-hover-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
            isCollapsed && "md:justify-center md:px-2",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          <span className={cn("leading-snug", isCollapsed && "md:sr-only")}>লগ আউট</span>
        </button>
      </div>
    </aside>
  );
}
