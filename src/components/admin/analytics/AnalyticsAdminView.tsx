"use client";

import Link from "next/link";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";
import { useDashboardPageData } from "@/lib/admin/dashboard/use-dashboard-page-data";

export function AnalyticsAdminView() {
  const { data, loading, error, reload } = useDashboardPageData();
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <AdminActionButton variant="secondary" onClick={() => void reload()}>
          রিফ্রেশ
        </AdminActionButton>
        <Link href="/admin" className="text-sm text-emerald-700 underline hover:no-underline dark:text-emerald-400">
          ড্যাশবোর্ড
        </Link>
      </div>

      {loading ? <AdminLoadingState message="অ্যানালিটিক্স লোড হচ্ছে…" /> : null}
      {error ? <AdminErrorState message={error} onRetry={() => void reload()} /> : null}

      {!loading && !error && stats ? (
        <>
          <AdminFormSection
            title="প্ল্যাটফর্ম সারাংশ"
            description="ড্যাশবোর্ড API — ক্লায়েন্ট ক্যাশ শেয়ার (`dashboard-client-cache`)।"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard title="ডাক্তার" value={String(stats.totalDoctors)} />
              <AdminStatCard title="এআই টেকনিশিয়ান" value={String(stats.totalAiTechnicians)} />
              <AdminStatCard title="গ্রাহক" value={String(stats.totalCustomers)} />
              <AdminStatCard title="সার্ভিস রিকোয়েস্ট" value={String(stats.totalServiceRequests)} />
              <AdminStatCard title="অপেক্ষমাণ" value={String(stats.pendingRequests)} />
              <AdminStatCard title="সম্পন্ন রিকোয়েস্ট" value={String(stats.completedServiceRequests)} />
              <AdminStatCard title="সম্পন্ন চিকিৎসা" value={String(stats.completedTreatments)} />
              <AdminStatCard title="মোট আয়" value={stats.totalRevenueDisplay} />
              <AdminStatCard title="পরিশোধিত আয়" value={stats.paidRevenueDisplay} />
              <AdminStatCard
                title="অপঠিত নোটিফিকেশন"
                value={String(data?.unreadNotifications ?? 0)}
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="দ্রুত লিঙ্ক" description="বিস্তারিত তালিকা ও রিপোর্ট।">
            <div className="flex flex-wrap gap-2">
              <AdminActionButton href="/admin/service-requests" variant="secondary">
                সার্ভিস রিকোয়েস্ট
              </AdminActionButton>
              <AdminActionButton href="/admin/reports" variant="secondary">
                চিকিৎসা রেকর্ড
              </AdminActionButton>
              <AdminActionButton href="/admin/billing" variant="secondary">
                বিলিং
              </AdminActionButton>
            </div>
          </AdminFormSection>
        </>
      ) : null}
    </div>
  );
}
