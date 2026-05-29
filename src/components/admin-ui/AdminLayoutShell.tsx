"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";

import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth/AdminAuthProvider";
import { cn } from "@/lib/cn";

import {
  ADMIN_NAV_GROUPS,
  filterAdminNavGroups,
  getSectionTitleFromPath,
} from "./admin-nav";
import { filterAdminNavGroupsForActor } from "./admin-nav-permissions";
import { AdminFooter } from "./AdminFooter";
import { AdminSidebar } from "./AdminSidebar";
import { AdminThemeProvider } from "./AdminThemeProvider";
import { AdminTopbar } from "./AdminTopbar";
import { AdminWorkspace } from "./AdminWorkspace";
import { AdminMonitoringProvider } from "./AdminMonitoringProvider";
import { AdminLegalGate } from "@/components/admin/legal/AdminLegalGate";
import { useAdminTheme } from "./useAdminTheme";

function AdminLayoutShellInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { logout, user, status } = useAdminAuth();
  const pathname = usePathname() ?? "/admin";
  const isEnterprise = pathname.startsWith("/enterprise");
  const [mobilePath, setMobilePath] = useState(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  if (mobilePath !== pathname) {
    setMobilePath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }
  const sectionTitle = getSectionTitleFromPath(pathname);
  const authLoading = status === "loading";
  const {
    appearance,
    sidebarMode,
    sidebarTheme,
    contentWidth,
    footerVisible,
  } = useAdminTheme();

  const navGroups = useMemo(() => {
    const base = filterAdminNavGroups(ADMIN_NAV_GROUPS);
    return filterAdminNavGroupsForActor(base, user, { authLoading });
  }, [user, authLoading]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div
      id="pd-admin-root"
      data-pd-admin="shell"
      data-enterprise={isEnterprise ? "true" : "false"}
      data-admin-appearance={appearance}
      data-sidebar-mode={sidebarMode}
      data-sidebar-theme={sidebarTheme}
      data-content-width={contentWidth}
      data-footer-visible={footerVisible ? "true" : "false"}
      className="flex h-[100dvh] min-h-0 overflow-hidden bg-[var(--pd-admin-app-bg)] text-[var(--pd-admin-app-fg)]"
    >
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="মেনু বন্ধ করুন"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AdminSidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-[transform,width] duration-200 md:static md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        groups={navGroups}
        pathname={pathname}
        onCloseMobile={() => setMobileOpen(false)}
        onSignOut={() => void logout("manual")}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopbar
          sectionTitle={sectionTitle}
          navGroups={navGroups}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onSignOut={() => void logout("manual")}
        />
        <AdminWorkspace
          pathname={pathname}
          contained={contentWidth === "contained" && !isEnterprise}
        >
          {children}
        </AdminWorkspace>
        <AdminFooter />
        <Toaster
          richColors
          closeButton
          position="top-center"
          theme={appearance === "system" ? "system" : appearance}
        />
      </div>
    </div>
  );
}

export function AdminLayoutShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminThemeProvider>
      <AdminAuthProvider active>
        <AdminMonitoringProvider>
          <AdminLayoutShellInner>{children}</AdminLayoutShellInner>
          <AdminLegalGate />
        </AdminMonitoringProvider>
      </AdminAuthProvider>
    </AdminThemeProvider>
  );
}
