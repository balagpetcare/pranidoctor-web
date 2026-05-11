"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import {
  flattenSectionOrderedNavItems,
  getAdminNavSectionsForSidebar,
} from "./admin-nav-sections";
import { filterAdminNavGroups, resolveAdminActiveHref, type AdminNavGroup } from "./admin-nav";
import {
  AdminSidebarCollapsedLink,
  AdminSidebarGroup,
  AdminSidebarSingleGroup,
} from "./AdminSidebarGroup";
import { useAdminTheme } from "./useAdminTheme";

export type AdminSidebarProps = Readonly<{
  groups: AdminNavGroup[];
  pathname: string;
  onSignOut: () => void | Promise<void>;
  onCloseMobile?: () => void;
  className?: string;
}>;

export function AdminSidebar({
  groups,
  pathname,
  onSignOut,
  onCloseMobile,
  className,
}: AdminSidebarProps) {
  const { sidebarMode, sidebarTheme } = useAdminTheme();
  const isCollapsed = sidebarMode === "collapsed";

  const normalized =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  const filteredGroups = useMemo(() => filterAdminNavGroups(groups), [groups]);
  const filteredSections = useMemo(
    () => getAdminNavSectionsForSidebar(filteredGroups),
    [filteredGroups],
  );
  const flatItems = useMemo(
    () => flattenSectionOrderedNavItems(filteredSections),
    [filteredSections],
  );
  const activeHref = useMemo(
    () => resolveAdminActiveHref(normalized, flatItems),
    [normalized, flatItems],
  );
  const activeGroupId = useMemo(() => {
    const g = filteredGroups.find((gr) => gr.children.some((c) => c.href === activeHref));
    return g?.id ?? null;
  }, [filteredGroups, activeHref]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const isGroupOpen = useCallback(
    (id: string) => id === activeGroupId || expandedIds.has(id),
    [activeGroupId, expandedIds],
  );

  const toggleGroup = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const brandTitle = "Prani Doctor Admin — পশু সেবা ও অপারেশন";
  const brandAria = "প্রাণী ডাক্তার অ্যাডমিন — হোম";

  const navEntries = useMemo(() => {
    const out: ReactNode[] = [];
    for (const section of filteredSections) {
      if (!isCollapsed) {
        out.push(
          <li key={`${section.id}-head`} className="pd-admin-nav-section-head-wrap" role="presentation">
            <div
              id={`pd-nav-section-${section.id}`}
              className="pd-admin-nav-section-head"
              role="heading"
              aria-level={2}
            >
              {section.titleBn}
            </div>
          </li>,
        );
      }
      for (const group of section.groups) {
        if (group.children.length === 1) {
          out.push(
            <AdminSidebarSingleGroup
              key={group.id}
              groupId={group.id}
              labelEn={group.labelEn}
              titleEn={group.titleEn}
              icon={group.icon}
              item={group.children[0]!}
              activeHref={activeHref}
              isCollapsed={isCollapsed}
              onNavigate={onCloseMobile}
            />,
          );
        } else {
          out.push(
            <AdminSidebarGroup
              key={group.id}
              groupId={group.id}
              labelEn={group.labelEn}
              labelBn={group.labelBn}
              titleEn={group.titleEn}
              icon={group.icon}
              items={group.children}
              activeHref={activeHref}
              isOpen={isGroupOpen(group.id)}
              onToggle={() => {
                toggleGroup(group.id);
              }}
              isCollapsed={isCollapsed}
              onNavigate={onCloseMobile}
            />,
          );
        }
      }
    }
    return out;
  }, [
    filteredSections,
    isCollapsed,
    activeHref,
    isGroupOpen,
    toggleGroup,
    onCloseMobile,
  ]);

  const collapsedRailLinks = useMemo(
    () =>
      flatItems.map((item) => (
        <AdminSidebarCollapsedLink
          key={item.href}
          item={item}
          activeHref={activeHref}
          isCollapsed={isCollapsed}
          onNavigate={onCloseMobile}
        />
      )),
    [flatItems, activeHref, isCollapsed, onCloseMobile],
  );

  return (
    <aside
      data-pd-sidebar="rail"
      data-pd-sidebar-theme={sidebarTheme}
      className={cn(
        "pd-admin-sidebar pd-larkon-sidebar flex w-[min(100%,var(--pd-admin-sidebar-w,18rem))] max-w-[var(--pd-admin-sidebar-w,18rem)] flex-col border-r border-[var(--pd-admin-sidebar-border)] bg-[var(--pd-admin-sidebar-bg)] shadow-[var(--pd-admin-card-shadow-lg)] md:shadow-none",
        className,
      )}
      style={{ width: "min(100%, var(--pd-admin-sidebar-w, 18rem))" }}
      lang="bn"
      aria-label="অ্যাডমিন মেনু"
    >
      <div
        className={cn(
          "pd-larkon-sidebar-header flex h-[var(--pd-admin-topbar-h,3.75rem)] shrink-0 items-center gap-2 border-b border-[var(--pd-admin-sidebar-border)]",
          isCollapsed ? "md:justify-center md:px-2" : "px-3",
        )}
      >
        <Link
          href="/admin"
          className={cn(
            "pd-larkon-brand-link min-w-0 flex-1 rounded-[var(--pd-admin-radius-sm)] text-[0.9375rem] font-semibold leading-snug tracking-tight text-[var(--pd-admin-sidebar-brand-fg)] transition-colors hover:bg-[var(--pd-admin-sidebar-hover-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
            isCollapsed && "max-md:block md:hidden",
          )}
          title={brandTitle}
          aria-label={brandAria}
          onClick={() => {
            onCloseMobile?.();
          }}
        >
          <span className="block truncate">প্রাণী ডাক্তার</span>
          <span className="block truncate text-xs font-normal leading-normal text-[var(--pd-admin-sidebar-muted)]">
            অ্যাডমিন · Prani Doctor
          </span>
        </Link>
        {isCollapsed ? (
          <Link
            href="/admin"
            className="pd-larkon-brand-mark hidden size-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 md:flex"
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

      <div className="pd-larkon-sidebar-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
        <nav id="pd-navbar-nav" className="pd-larkon-sidebar-nav flex-1" aria-label="প্রশাসন মেনু">
          {isCollapsed ? (
            <>
              <ul className="pd-larkon-navbar-nav navbar-nav flex flex-col md:hidden">{navEntries}</ul>
              <ul
                className="pd-larkon-navbar-nav navbar-nav hidden flex-col md:flex"
                aria-label="প্রশাসন মেনু (সংক্ষিপ্ত)"
              >
                {collapsedRailLinks}
              </ul>
            </>
          ) : (
            <ul className="pd-larkon-navbar-nav navbar-nav flex flex-col">{navEntries}</ul>
          )}
        </nav>
      </div>

      <div
        className={cn(
          "pd-larkon-sidebar-footer shrink-0 border-t border-[var(--pd-admin-sidebar-border)]",
          isCollapsed ? "md:px-2 md:py-2" : "p-2 sm:p-3",
        )}
      >
        <button
          type="button"
          onClick={() => void onSignOut()}
          aria-label="লগ আউট"
          title="লগ আউট"
          className={cn(
            "pd-larkon-nav-link pd-larkon-sidebar-logout nav-link flex w-full items-center gap-3 border-0 bg-transparent text-left font-medium",
            isCollapsed && "pd-larkon-nav-link--collapsed-rail",
          )}
        >
          <span className="nav-icon pd-larkon-nav-icon" aria-hidden>
            <LogOut className="pd-larkon-icon-svg" />
          </span>
          <span className="nav-text pd-larkon-nav-text">লগ আউট</span>
        </button>
      </div>
    </aside>
  );
}
