import type { ServiceRequestStatus, ServiceRequestType } from "@/generated/prisma/client";
import { serverInternalJson } from "@/lib/server-internal";

export type AdminDashboardStats = {
  totalDoctors: number;
  totalAiTechnicians: number;
  totalCustomers: number;
  totalServiceRequests: number;
  pendingRequests: number;
  completedServiceRequests: number;
  completedTreatments: number;
  totalRevenueDisplay: string;
  paidRevenueDisplay: string;
};

export type AdminDashboardRecentRequestRow = {
  id: string;
  status: ServiceRequestStatus;
  serviceType: ServiceRequestType;
  submittedAt: Date;
  customerDisplayName: string | null;
};

export type AdminDashboardPageData = {
  stats: AdminDashboardStats;
  recentRequests: AdminDashboardRecentRequestRow[];
  unreadNotifications: number;
};

type ApiPayload = {
  stats: AdminDashboardStats;
  recentRequests: Array<
    Omit<AdminDashboardRecentRequestRow, "submittedAt"> & { submittedAt: string }
  >;
  unreadNotifications: number;
};

export async function getAdminDashboardPageData(
  adminUserId: string | undefined,
): Promise<AdminDashboardPageData> {
  const q =
    adminUserId != null && adminUserId !== ""
      ? `?adminUserId=${encodeURIComponent(adminUserId)}`
      : "";
  const res = await serverInternalJson<ApiPayload>(`/api/admin/dashboard/page-data${q}`);
  if (!res.ok) {
    throw new Error(`Dashboard load failed (${res.status})`);
  }
  const { stats, recentRequests, unreadNotifications } = res.data;
  return {
    stats,
    unreadNotifications,
    recentRequests: recentRequests.map((r) => ({
      ...r,
      submittedAt: new Date(r.submittedAt),
    })),
  };
}

/** @deprecated Use getAdminDashboardPageData — stats only via backend API */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const page = await getAdminDashboardPageData(undefined);
  return page.stats;
}
