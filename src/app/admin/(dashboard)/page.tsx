import { redirect } from "next/navigation";

import { StatCard } from "@/components/admin/StatCard";
import { getAdminSession } from "@/lib/admin-auth/session";

import { getAdminDashboardStats } from "./_lib/dashboard-stats";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const stats = await getAdminDashboardStats();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as <span className="font-medium">{session.email}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total doctors"
          value={String(stats.totalDoctors)}
          description="Registered doctor profiles"
        />
        <StatCard
          title="Total customers"
          value={String(stats.totalCustomers)}
          description="Customer profiles"
        />
        <StatCard
          title="Total service requests"
          value={String(stats.totalServiceRequests)}
          description="All request statuses"
        />
        <StatCard
          title="Pending requests"
          value={String(stats.pendingRequests)}
          description="Submitted, assigned, or in progress"
        />
        <StatCard
          title="Completed treatments"
          value={String(stats.completedTreatments)}
          description="Finalized treatment records"
        />
        <StatCard
          title="Total revenue"
          value={stats.totalRevenueDisplay}
          description="Issued and paid billing records"
        />
      </div>
    </div>
  );
}
