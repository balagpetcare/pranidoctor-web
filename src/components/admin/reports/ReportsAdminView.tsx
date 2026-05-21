"use client";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";
import { ServiceRequestsList } from "@/components/admin/service-requests/ServiceRequestsList";
import { SERVICE_REQUEST_STATUS } from "@/lib/domain/service-request-constants";
import { useDashboardPageData } from "@/lib/admin/dashboard/use-dashboard-page-data";

export function ReportsAdminView() {
  const { data, loading, error, reload } = useDashboardPageData();
  const stats = data?.stats;

  return (
    <div className="space-y-8">
      <AdminFormSection
        title="চিকিৎসা সারাংশ"
        description="সম্পন্ন সার্ভিস রিকোয়েস্ট ও চিকিৎসা কাউন্ট — ড্যাশবোর্ড API (shared cache)।"
      >
        {loading ? <AdminLoadingState message="সারাংশ লোড হচ্ছে…" /> : null}
        {error ? <AdminErrorState message={error} onRetry={() => void reload()} /> : null}
        {!loading && !error && stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AdminStatCard title="মোট রিকোয়েস্ট" value={String(stats.totalServiceRequests)} />
            <AdminStatCard
              title="সম্পন্ন রিকোয়েস্ট"
              value={String(stats.completedServiceRequests)}
            />
            <AdminStatCard title="সম্পন্ন চিকিৎসা" value={String(stats.completedTreatments)} />
          </div>
        ) : null}
        <div className="mt-4">
          <AdminActionButton href="/admin/analytics" variant="secondary">
            অ্যানালিটিক্স
          </AdminActionButton>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="সম্পন্ন সার্ভিস রিকোয়েস্ট"
        description="চিকিৎসা রেকর্ড হিসেবে সম্পন্ন স্ট্যাটাসে ফিল্টার করা তালিকা।"
      >
        <ServiceRequestsList initialStatus={SERVICE_REQUEST_STATUS.COMPLETED} />
      </AdminFormSection>
    </div>
  );
}
