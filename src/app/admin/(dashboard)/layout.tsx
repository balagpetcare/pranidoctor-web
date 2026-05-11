import { AdminLayoutShell } from "@/components/admin-ui/AdminLayoutShell";
import { ensureAdminDashboardAccess } from "@/lib/admin-auth/dashboard-guard";

import "../admin-shell.css";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureAdminDashboardAccess();

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
