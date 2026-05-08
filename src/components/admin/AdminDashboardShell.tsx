"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PawPrint,
  Pill,
  Settings,
  Stethoscope,
  Tags,
  Users,
  Wallet2,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/animals", label: "Animals", icon: PawPrint },
  { href: "/admin/service-requests", label: "Service Requests", icon: ClipboardList },
  { href: "/admin/areas", label: "Areas", icon: MapPin },
  { href: "/admin/service-categories", label: "Service Categories", icon: Tags },
  { href: "/admin/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/admin/billing", label: "Billing", icon: Wallet2 },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

async function signOut(): Promise<void> {
  await fetch("/api/admin/auth/logout", { method: "POST" });
  window.location.href = "/admin/login";
}

export function AdminDashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:static md:translate-x-0 dark:border-zinc-800 dark:bg-zinc-950",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link
            href="/admin"
            className="text-sm font-semibold tracking-tight text-emerald-800 dark:text-emerald-400"
            onClick={() => setMobileOpen(false)}
          >
            Prani Doctor
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:min-h-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-zinc-50/95 px-4 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
          <button
            type="button"
            className="rounded-md p-2 text-zinc-700 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Admin
          </span>
        </header>

        <main className="flex-1 bg-zinc-50 p-4 sm:p-6 lg:p-8 dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
