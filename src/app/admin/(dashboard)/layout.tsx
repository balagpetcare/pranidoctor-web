import { Noto_Sans_Bengali } from "next/font/google";

import { AdminLayoutShell } from "@/components/admin-ui/AdminLayoutShell";
import { ensureAdminDashboardAccess } from "@/lib/admin-auth/dashboard-guard";

import "../admin-shell.css";

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureAdminDashboardAccess();

  return (
    <div className={notoBengali.className}>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </div>
  );
}
