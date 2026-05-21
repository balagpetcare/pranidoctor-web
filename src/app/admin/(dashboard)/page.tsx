import { Suspense } from "react";

import { getAdminSession } from "@/lib/admin-auth/session";

import {
  AdminDashboardClient,
  AdminDashboardSkeleton,
} from "./_components/AdminDashboardClient";
import { getAdminDashboardPageData } from "./_lib/dashboard-stats";

export const revalidate = 30;

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const data = await getAdminDashboardPageData(session?.sub);

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardClient
        initialData={data}
        sessionEmail={session?.email ?? null}
      />
    </Suspense>
  );
}
