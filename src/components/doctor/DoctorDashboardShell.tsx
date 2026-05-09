"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  PlayCircle,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  labelBn: string;
  titleEn: string;
  icon: LucideIcon;
};

const NAV: NavItem[] = [
  {
    href: "/doctor",
    labelBn: "হোম",
    titleEn: "Home",
    icon: Home,
  },
  {
    href: "/doctor/notifications",
    labelBn: "নোটিফিকেশন",
    titleEn: "Notifications",
    icon: Bell,
  },
  {
    href: "/doctor/knowledge-hub",
    labelBn: "নলেজ হাব",
    titleEn: "Knowledge Hub",
    icon: BookOpen,
  },
  {
    href: "/doctor/requests/new",
    labelBn: "নতুন অনুরোধ",
    titleEn: "New requests",
    icon: ClipboardList,
  },
  {
    href: "/doctor/requests/active",
    labelBn: "চলমান কেস",
    titleEn: "Active cases",
    icon: PlayCircle,
  },
  {
    href: "/doctor/requests/completed",
    labelBn: "সম্পন্ন",
    titleEn: "Completed",
    icon: CheckCircle2,
  },
];

function getCurrentSectionTitle(pathname: string): string {
  const normalized =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  const sorted = [...NAV].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    const active =
      item.href === "/doctor"
        ? normalized === "/doctor"
        : normalized === item.href || normalized.startsWith(`${item.href}/`);
    if (active) return item.labelBn;
  }
  return NAV[0].labelBn;
}

async function signOut(): Promise<void> {
  await fetch("/api/doctor/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  window.location.href = "/doctor/login";
}

export function DoctorDashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionTitle = getCurrentSectionTitle(pathname);

  return (
    <div className="flex min-h-screen">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="মেনু বন্ধ করুন"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col border-r border-teal-900/10 bg-white transition-transform duration-200 md:static md:w-72 md:max-w-[18rem] md:translate-x-0 dark:border-teal-500/10 dark:bg-zinc-950",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        lang="bn"
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800">
          <Link
            href="/doctor"
            className="min-w-0 text-sm font-semibold leading-tight tracking-tight text-teal-800 dark:text-teal-400"
            title="Prani Doctor — doctor"
            onClick={() => setMobileOpen(false)}
          >
            <span className="block truncate">প্রাণী ডাক্তার</span>
            <span className="block truncate text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
              ডাক্তার প্যানেল
            </span>
          </Link>
          <button
            type="button"
            className="shrink-0 rounded-md p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={() => setMobileOpen(false)}
            aria-label="সাইডবার বন্ধ করুন"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 sm:p-3">
          {NAV.map(({ href, labelBn, titleEn, icon: Icon }) => {
            const normalized =
              pathname.endsWith("/") && pathname !== "/"
                ? pathname.slice(0, -1)
                : pathname;
            const active =
              href === "/doctor"
                ? normalized === "/doctor"
                : normalized === href || normalized.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={titleEn}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium leading-snug transition-colors",
                  active
                    ? "bg-teal-50 text-teal-950 ring-1 ring-teal-900/10 dark:bg-teal-950/40 dark:text-teal-50 dark:ring-teal-500/20"
                    : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                <span className="min-w-0 flex-1">{labelBn}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-zinc-200 p-2 sm:p-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            <span className="leading-snug">লগ আউট</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:min-h-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 bg-zinc-50/95 px-3 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
          <button
            type="button"
            className="shrink-0 rounded-md p-2 text-zinc-700 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => setMobileOpen(true)}
            aria-label="মেনু খুলুন"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {sectionTitle}
          </h1>
          <button
            type="button"
            className="shrink-0 rounded-md p-2 text-zinc-700 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => void signOut()}
            aria-label="লগ আউট"
          >
            <LogOut className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <header
          className="hidden h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/90 px-6 backdrop-blur md:flex dark:border-zinc-800 dark:bg-zinc-950/90"
          lang="bn"
        >
          <span className="text-sm font-semibold text-teal-800 dark:text-teal-400">
            প্রাণী ডাক্তার
          </span>
          <span
            className="h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700"
            aria-hidden
          />
          <h1 className="min-w-0 text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
            {sectionTitle}
          </h1>
        </header>

        <main className="flex-1 bg-zinc-50 p-4 sm:p-6 lg:p-8 dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
