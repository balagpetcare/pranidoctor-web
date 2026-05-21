"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Toaster } from "sonner";

import { cn } from "@/lib/cn";

import { ADMIN_NAV_GROUPS, getSectionTitleFromPath } from "./admin-nav";
import { AdminContent } from "./AdminContent";
import { AdminFooter } from "./AdminFooter";
import { AdminSidebar } from "./AdminSidebar";
import { AdminThemeProvider } from "./AdminThemeProvider";
import { AdminTopbar } from "./AdminTopbar";
import { useAdminTheme } from "./useAdminTheme";

async function signOut(): Promise<void> {
  await fetch("/api/admin/auth/logout", { method: "POST" });
  window.location.href = "/admin/login";
}

function AdminLayoutShellInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isEnterprise = pathname?.startsWith("/enterprise") ?? false;
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionTitle = getSectionTitleFromPath(pathname);
  const {
    appearance,
    sidebarMode,
    sidebarTheme,
    contentWidth,
    topbarSticky,
    footerVisible,
  } = useAdminTheme();

  return (
    <div
      id="pd-admin-root"
      data-pd-admin="shell"
      data-enterprise={isEnterprise ? "true" : "false"}
      data-admin-appearance={appearance}
      data-sidebar-mode={sidebarMode}
      data-sidebar-theme={sidebarTheme}
      data-content-width={contentWidth}
      data-topbar-sticky={topbarSticky ? "true" : "false"}
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
        groups={ADMIN_NAV_GROUPS}
        pathname={pathname}
        onCloseMobile={() => setMobileOpen(false)}
        onSignOut={signOut}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopbar
          sectionTitle={sectionTitle}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onSignOut={signOut}
        />
        <AdminContent contained={contentWidth === "contained" && !isEnterprise}>
          {children}
        </AdminContent>
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
      <AdminLayoutShellInner>{children}</AdminLayoutShellInner>
    </AdminThemeProvider>
  );
}
