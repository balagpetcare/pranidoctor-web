import type { Metadata } from "next";

import "./admin-typography.css";

import {
  adminDashboardFontVariablesClassName,
} from "@/lib/admin-ui/admin-dashboard-fonts";
import { AdminErrorBoundary } from "@/components/admin-ui/AdminErrorBoundary";

/** Admin panel must not be indexed by search engines. */
export const metadata: Metadata = {
  title: {
    default: "Admin · Prani Doctor",
    template: "%s · Prani Doctor Admin",
  },
  description: "Prani Doctor operations admin panel",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${adminDashboardFontVariablesClassName} pd-admin-app-fonts min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50`}
    >
      <AdminErrorBoundary scope="admin">{children}</AdminErrorBoundary>
    </div>
  );
}
