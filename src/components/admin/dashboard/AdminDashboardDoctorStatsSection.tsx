"use client";

import Link from "next/link";

import type { AdminDashboardDoctorStats } from "@/lib/admin/dashboard/dashboard-types";
import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";

export type AdminDashboardDoctorStatsSectionProps = {
  doctorStats: AdminDashboardDoctorStats | undefined;
  totalFromKpi: number;
};

export function AdminDashboardDoctorStatsSection({
  doctorStats,
  totalFromKpi,
}: AdminDashboardDoctorStatsSectionProps) {
  const stats = doctorStats ?? {
    total: totalFromKpi,
    active: 0,
    pendingVerification: 0,
    suspended: 0,
    rejected: 0,
  };

  const activePct =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  return (
    <section aria-labelledby="dash-doctor-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2
          id="dash-doctor-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          ডাক্তার পরিসংখ্যান
        </h2>
        <Link
          href="/admin/doctors"
          className="text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-400"
        >
          সব ডাক্তার →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
          <AdminStatCard
            title="মোট"
            value={String(stats.total)}
            description="ডাক্তার প্রোফাইল"
          />
          <AdminStatCard
            title="সক্রিয়"
            value={String(stats.active)}
            description={`${activePct}% অনুমোদিত`}
          />
          <AdminStatCard
            title="যাচাই অপেক্ষমাণ"
            value={String(stats.pendingVerification)}
            description="PENDING_VERIFICATION"
          />
          <AdminStatCard
            title="স্থগিত / প্রত্যাখ্যাত"
            value={String(stats.suspended + stats.rejected)}
            description={`${stats.suspended} স্থগিত · ${stats.rejected} প্রত্যাখ্যাত`}
          />
        </div>

        <AdminFormSection
          title="দ্রুত স্ট্যাটাস"
          description="প্রোভাইডার স্ট্যাটাস ব্রেকডাউন"
        >
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between gap-2">
              <span>সক্রিয়</span>
              <AdminBadge variant="success">{stats.active}</AdminBadge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span>যাচাই অপেক্ষমাণ</span>
              <AdminBadge variant="warning">{stats.pendingVerification}</AdminBadge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span>স্থগিত</span>
              <AdminBadge variant="neutral">{stats.suspended}</AdminBadge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span>প্রত্যাখ্যাত</span>
              <AdminBadge variant="danger">{stats.rejected}</AdminBadge>
            </li>
          </ul>
          <div className="mt-4">
            <AdminActionButton href="/admin/doctors/new" variant="primary">
              নতুন ডাক্তার
            </AdminActionButton>
          </div>
        </AdminFormSection>
      </div>
    </section>
  );
}
