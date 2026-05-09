import { getAdminSession } from "@/lib/admin-auth/session";

import { AdminDashboardView } from "./_components/AdminDashboardView";
import { getAdminDashboardPageData } from "./_lib/dashboard-stats";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const data = await getAdminDashboardPageData(session?.sub);

  return (
    <AdminDashboardView data={data} sessionEmail={session?.email ?? null} />
  );
}
