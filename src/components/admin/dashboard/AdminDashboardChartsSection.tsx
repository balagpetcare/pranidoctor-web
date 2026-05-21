"use client";

import type { AdminDashboardCharts } from "@/lib/admin/dashboard/dashboard-types";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";

import { AdminBarChart, AdminDonutChart } from "./AdminChartPrimitives";

export type AdminDashboardChartsSectionProps = {
  charts: AdminDashboardCharts | undefined;
};

export function AdminDashboardChartsSection({ charts }: AdminDashboardChartsSectionProps) {
  if (!charts) {
    return (
      <section className="grid gap-4 lg:grid-cols-2">
        <AdminFormSection title="চার্ট" description="চার্ট ডেটা লোড হয়নি।">
          <p className="text-sm text-[var(--pd-admin-muted)]">API আপডেট প্রয়োজন হতে পারে।</p>
        </AdminFormSection>
      </section>
    );
  }

  const statusTotal = charts.serviceRequestsByStatus.reduce((s, x) => s + x.value, 0);

  return (
    <section aria-labelledby="dash-charts-heading" className="grid gap-4 lg:grid-cols-2">
      <h2 id="dash-charts-heading" className="sr-only">
        চার্ট
      </h2>

      <AdminFormSection
        title="অনুরোধ — স্ট্যাটাস"
        description="সার্ভিস রিকোয়েস্ট স্ট্যাটাস বিন্যাস"
      >
        <AdminBarChart slices={charts.serviceRequestsByStatus} />
      </AdminFormSection>

      <AdminFormSection
        title="অনুরোধ — ধরন"
        description="সেবার ধরন অনুযায়ী"
      >
        <AdminBarChart slices={charts.serviceRequestsByType} />
      </AdminFormSection>

      <AdminFormSection
        title="টিম কম্পোজিশন"
        description="ডাক্তার · এআই · গ্রাহক"
      >
        <AdminDonutChart
          slices={charts.teamComposition}
          centerLabel="মোট"
          centerValue={String(
            charts.teamComposition.reduce((s, x) => s + x.value, 0),
          )}
        />
      </AdminFormSection>

      <AdminFormSection
        title="পাইপলাইন সারাংশ"
        description={`মোট ${statusTotal.toLocaleString("en-BD")} অনুরোধ`}
      >
        <AdminDonutChart
          slices={charts.serviceRequestsByStatus.filter((s) => s.value > 0)}
          centerLabel="অনুরোধ"
          centerValue={String(statusTotal)}
        />
      </AdminFormSection>
    </section>
  );
}
