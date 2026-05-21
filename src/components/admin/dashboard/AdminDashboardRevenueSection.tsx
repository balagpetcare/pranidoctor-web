"use client";

import Link from "next/link";

import type { AdminDashboardRevenue, AdminDashboardStats } from "@/lib/admin/dashboard/dashboard-types";
import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";

import { AdminBarChart } from "./AdminChartPrimitives";

export type AdminDashboardRevenueSectionProps = {
  revenue: AdminDashboardRevenue | undefined;
  stats: AdminDashboardStats;
};

function fallbackRevenue(stats: AdminDashboardStats): AdminDashboardRevenue {
  return {
    totalBdt: stats.totalRevenueBdt ?? 0,
    paidBdt: stats.paidRevenueBdt ?? 0,
    unpaidBdt: stats.unpaidRevenueBdt ?? 0,
    totalDisplay: stats.totalRevenueDisplay,
    paidDisplay: stats.paidRevenueDisplay,
    unpaidDisplay: "—",
  };
}

export function AdminDashboardRevenueSection({ revenue, stats }: AdminDashboardRevenueSectionProps) {
  const r = revenue ?? fallbackRevenue(stats);
  const paidPct = r.totalBdt > 0 ? Math.round((r.paidBdt / r.totalBdt) * 100) : 0;

  return (
    <section aria-labelledby="dash-revenue-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2
          id="dash-revenue-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          আয় ও বিলিং
        </h2>
        <Link
          href="/admin/billing"
          className="text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-400"
        >
          বিলিং →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminStatCard
          title="মোট ইস্যু"
          value={r.totalDisplay}
          description="ISSUED + PARTIAL + PAID"
        />
        <AdminStatCard
          title="পরিশোধিত"
          value={r.paidDisplay}
          description={`${paidPct}% সংগ্রহ`}
        />
        <AdminStatCard
          title="বকেয়া"
          value={r.unpaidDisplay}
          description="মোট − পরিশোধিত"
        />
      </div>

      <div className="mt-4">
        <AdminFormSection title="আদায় বিন্যাস" description="পরিশোধিত vs বকেয়া">
          <AdminBarChart
            slices={[
              { key: "paid", label: "পরিশোধিত", value: r.paidBdt, colorClass: "bg-emerald-500" },
              { key: "unpaid", label: "বকেয়া", value: r.unpaidBdt, colorClass: "bg-amber-500" },
            ]}
          />
          <div className="mt-4">
            <AdminActionButton href="/admin/billing" variant="secondary">
              বিলিং তালিকা
            </AdminActionButton>
          </div>
        </AdminFormSection>
      </div>
    </section>
  );
}
