import "server-only";

import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

import { serverInternalJson } from "@/lib/server-internal";

import {
  DASHBOARD_REVALIDATE_SECONDS,
  normalizeDashboardPayload,
  type AdminDashboardApiPayload,
  type AdminDashboardPageData,
  type AdminDashboardStats,
} from "@/lib/admin/dashboard/dashboard-types";

export type {
  AdminDashboardChartSlice,
  AdminDashboardCharts,
  AdminDashboardDoctorStats,
  AdminDashboardPageData,
  AdminDashboardRecentRequestRow,
  AdminDashboardRevenue,
  AdminDashboardStats,
} from "@/lib/admin/dashboard/dashboard-types";

export { DASHBOARD_REVALIDATE_SECONDS, normalizeDashboardPayload };

export type DashboardRequestContext = {
  adminUserId: string | undefined;
  cookieHeader: string;
};

async function fetchDashboardPageDataRaw(
  context: DashboardRequestContext,
): Promise<AdminDashboardPageData> {
  const { adminUserId, cookieHeader } = context;
  const q =
    adminUserId != null && adminUserId !== ""
      ? `?adminUserId=${encodeURIComponent(adminUserId)}`
      : "";
  const res = await serverInternalJson<AdminDashboardApiPayload>(
    `/api/admin/dashboard/page-data${q}`,
    cookieHeader ? { headers: { cookie: cookieHeader } } : {},
  );
  if (!res.ok) {
    throw new Error(`Dashboard load failed (${res.status})`);
  }
  return normalizeDashboardPayload(res.data);
}

export async function getAdminDashboardPageData(
  adminUserId: string | undefined,
): Promise<AdminDashboardPageData> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const context: DashboardRequestContext = { adminUserId, cookieHeader };

  return unstable_cache(
    async () => fetchDashboardPageDataRaw(context),
    ["admin-dashboard-page-data", adminUserId ?? "anonymous"],
    { revalidate: DASHBOARD_REVALIDATE_SECONDS, tags: ["admin-dashboard"] },
  )();
}

/** @deprecated Use getAdminDashboardPageData — stats only via backend API */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const page = await getAdminDashboardPageData(undefined);
  return page.stats;
}
