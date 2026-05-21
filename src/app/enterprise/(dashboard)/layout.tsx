import { AdminLayoutShell } from "@/components/admin-ui/AdminLayoutShell";
import { ensureAdminDashboardAccess } from "@/lib/admin-auth/dashboard-guard";

import "../enterprise-shell.css";

export default async function EnterpriseDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureAdminDashboardAccess();

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
