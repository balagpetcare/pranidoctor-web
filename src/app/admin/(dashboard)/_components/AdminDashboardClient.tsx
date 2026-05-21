"use client";

import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { RefreshCw } from "lucide-react";

import type { AdminDashboardPageData } from "@/lib/admin/dashboard/dashboard-types";
import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminDashboardKpiSection } from "@/components/admin/dashboard/AdminDashboardKpiSection";
import { AdminDashboardQuickActionsSection } from "@/components/admin/dashboard/AdminDashboardQuickActionsSection";
import { AdminDashboardRecentActivitySection } from "@/components/admin/dashboard/AdminDashboardRecentActivitySection";
import {
  AdminDashboardSectionSkeleton,
  AdminDashboardSkeleton,
} from "@/components/admin/dashboard/AdminDashboardSkeleton";
import { useAdminDashboardRealtime } from "@/lib/admin/dashboard/use-admin-dashboard-realtime";
import { cn } from "@/lib/cn";

const AdminDashboardChartsSection = dynamic(
  () =>
    import("@/components/admin/dashboard/AdminDashboardChartsSection").then(
      (m) => m.AdminDashboardChartsSection,
    ),
  {
    loading: () => (
      <section className="grid gap-4 lg:grid-cols-2">
        <AdminDashboardSectionSkeleton rows={5} />
        <AdminDashboardSectionSkeleton rows={5} />
      </section>
    ),
    ssr: false,
  },
);

const AdminDashboardDoctorStatsSection = dynamic(
  () =>
    import("@/components/admin/dashboard/AdminDashboardDoctorStatsSection").then(
      (m) => m.AdminDashboardDoctorStatsSection,
    ),
  {
    loading: () => <AdminDashboardSectionSkeleton rows={4} />,
    ssr: false,
  },
);

const AdminDashboardRevenueSection = dynamic(
  () =>
    import("@/components/admin/dashboard/AdminDashboardRevenueSection").then(
      (m) => m.AdminDashboardRevenueSection,
    ),
  {
    loading: () => <AdminDashboardSectionSkeleton rows={3} />,
    ssr: false,
  },
);

export type AdminDashboardClientProps = Readonly<{
  initialData: AdminDashboardPageData;
  sessionEmail: string | null;
}>;

export function AdminDashboardClient({
  initialData,
  sessionEmail,
}: AdminDashboardClientProps) {
  const { data, isRefreshing, lastUpdated, error, refresh } = useAdminDashboardRealtime({
    initialData,
  });

  return (
    <div className="space-y-10" lang="bn">
      <AdminPageHeader
        title="অপারেশন ড্যাশবোর্ড"
        description={
          <>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              প্রাণী ডাক্তার অ্যাডমিন
            </span>
            {" · "}
            সাইন ইন:{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {sessionEmail ?? "—"}
            </span>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs text-[var(--pd-admin-muted)]"
              title={lastUpdated.toISOString()}
            >
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  isRefreshing ? "animate-pulse bg-amber-500" : "bg-emerald-500",
                )}
                aria-hidden
              />
              লাইভ ·{" "}
              {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: bn })}
            </span>
            <AdminActionButton
              variant="secondary"
              onClick={() => void refresh()}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("mr-1.5 inline h-4 w-4", isRefreshing && "animate-spin")}
                aria-hidden
              />
              রিফ্রেশ
            </AdminActionButton>
            <AdminActionButton href="/admin/service-requests" variant="secondary">
              সব অনুরোধ
            </AdminActionButton>
            <AdminActionButton href="/admin/billing">বিলিং</AdminActionButton>
          </div>
        }
      />

      {error ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
          role="status"
        >
          {error}
        </p>
      ) : null}

      <AdminDashboardKpiSection data={data} />

      <AdminDashboardChartsSection charts={data.charts} />

      <AdminDashboardDoctorStatsSection
        doctorStats={data.doctorStats}
        totalFromKpi={data.stats.totalDoctors}
      />

      <AdminDashboardRevenueSection revenue={data.revenue} stats={data.stats} />

      <AdminDashboardQuickActionsSection />

      <AdminDashboardRecentActivitySection recentRequests={data.recentRequests} />
    </div>
  );
}

export { AdminDashboardSkeleton };
