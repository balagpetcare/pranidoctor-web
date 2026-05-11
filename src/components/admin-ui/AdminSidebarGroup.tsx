"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

import type { AdminNavItem } from "./admin-nav";

export function linkIsActive(itemHref: string, activeHref: string | null): boolean {
  return activeHref !== null && itemHref === activeHref;
}

/** One top-level link (Larkon leaf `nav-item` + `nav-link`) — used for single-child groups. */
export function AdminSidebarSingleGroup({
  groupId,
  titleEn,
  item,
  activeHref,
  isCollapsed,
  onNavigate,
}: Readonly<{
  groupId: string;
  labelEn: string;
  titleEn: string;
  icon: LucideIcon;
  item: AdminNavItem;
  activeHref: string | null;
  isCollapsed: boolean;
  onNavigate?: () => void;
}>) {
  const { href, labelBn, titleEn: childTitleEn, icon: ItemIcon } = item;
  const active = linkIsActive(href, activeHref);
  const itemTitle = `${labelBn} — ${childTitleEn} (${titleEn})`;
  const itemAria = `${labelBn}. ${childTitleEn}`;

  return (
    <li className="pd-larkon-nav-item nav-item">
      <Link
        id={`pd-admin-nav-leaf-${groupId}`}
        href={href}
        title={itemTitle}
        aria-label={itemAria}
        aria-current={active ? "page" : undefined}
        onClick={() => {
          onNavigate?.();
        }}
        className={cn(
          "pd-larkon-nav-link nav-link",
          active && "active",
          isCollapsed && "pd-larkon-nav-link--collapsed-rail",
        )}
      >
        <span className="nav-icon pd-larkon-nav-icon" aria-hidden>
          <ItemIcon className="pd-larkon-icon-svg" />
        </span>
        <span className={cn("nav-text pd-larkon-nav-text", isCollapsed && "md:sr-only")}>{labelBn}</span>
      </Link>
    </li>
  );
}

export type AdminSidebarGroupProps = Readonly<{
  groupId: string;
  labelEn: string;
  labelBn: string;
  titleEn: string;
  icon: LucideIcon;
  items: AdminNavItem[];
  activeHref: string | null;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onNavigate?: () => void;
}>;

export function AdminSidebarGroup({
  groupId,
  labelEn,
  labelBn,
  titleEn,
  icon: GroupIcon,
  items,
  activeHref,
  isOpen,
  onToggle,
  isCollapsed,
  onNavigate,
}: AdminSidebarGroupProps) {
  const groupHasActive = items.some((c) => linkIsActive(c.href, activeHref));
  const panelId = `pd-admin-nav-group-${groupId}`;
  const triggerId = `${panelId}-trigger`;

  return (
    <li className="pd-larkon-nav-item nav-item">
      <button
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        title={`${labelBn} — ${titleEn}`}
        aria-label={`${labelBn}. ${labelEn}. ${titleEn}`}
        onClick={onToggle}
        className={cn(
          "pd-larkon-nav-link pd-larkon-nav-link--parent nav-link menu-arrow",
          (groupHasActive || isOpen) && "show",
          groupHasActive && "active",
          isCollapsed && "pd-larkon-nav-link--collapsed-rail",
        )}
      >
        <span className="nav-icon pd-larkon-nav-icon" aria-hidden>
          <GroupIcon className="pd-larkon-icon-svg" />
        </span>
        <span className={cn("nav-text pd-larkon-nav-text", isCollapsed && "md:sr-only")}>{labelBn}</span>
        <ChevronDown
          className={cn("pd-larkon-menu-arrow menu-arrow", isOpen && "pd-larkon-menu-arrow--open")}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          "pd-larkon-submenu-wrap",
          isOpen ? "pd-larkon-submenu-wrap--open" : "pd-larkon-submenu-wrap--closed",
        )}
      >
        <div className="pd-larkon-submenu-inner">
          <ul className="pd-larkon-sub-navbar-nav sub-navbar-nav nav">
            {items.map(({ href, labelBn, titleEn: childTitleEn, icon: Icon }) => {
              const active = linkIsActive(href, activeHref);
              const itemTitle = `${labelBn} — ${childTitleEn}`;
              const itemAria = `${labelBn}. ${childTitleEn}`;
              return (
                <li key={href} className="pd-larkon-sub-nav-item sub-nav-item">
                  <Link
                    href={href}
                    title={itemTitle}
                    aria-label={itemAria}
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      onNavigate?.();
                    }}
                    className={cn(
                      "pd-larkon-sub-nav-link sub-nav-link",
                      active && "active",
                      isCollapsed && "pd-larkon-sub-nav-link--collapsed-rail",
                    )}
                  >
                    <span className="nav-icon pd-larkon-nav-icon" aria-hidden>
                      <Icon className="pd-larkon-icon-svg pd-larkon-icon-svg--sub" />
                    </span>
                    <span className={cn("nav-text pd-larkon-nav-text", isCollapsed && "md:sr-only")}>
                      {labelBn}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}

/** Collapsed desktop rail: icon-first links (Larkon condensed rail pattern). */
export function AdminSidebarCollapsedLink({
  item,
  activeHref,
  isCollapsed,
  onNavigate,
}: Readonly<{
  item: AdminNavItem;
  activeHref: string | null;
  isCollapsed: boolean;
  onNavigate?: () => void;
}>) {
  const { href, labelBn, titleEn, icon: Icon } = item;
  const active = linkIsActive(href, activeHref);
  const itemTitle = `${labelBn} — ${titleEn}`;
  const itemAria = `${labelBn}. ${titleEn}`;
  return (
    <li className="pd-larkon-nav-item nav-item">
      <Link
        href={href}
        title={itemTitle}
        aria-label={itemAria}
        aria-current={active ? "page" : undefined}
        onClick={() => {
          onNavigate?.();
        }}
        className={cn(
          "pd-larkon-nav-link nav-link",
          active && "active",
          isCollapsed && "pd-larkon-nav-link--collapsed-rail",
        )}
      >
        <span className="nav-icon pd-larkon-nav-icon" aria-hidden>
          <Icon className="pd-larkon-icon-svg" />
        </span>
        <span className={cn("nav-text pd-larkon-nav-text", isCollapsed && "md:sr-only")}>{labelBn}</span>
      </Link>
    </li>
  );
}
