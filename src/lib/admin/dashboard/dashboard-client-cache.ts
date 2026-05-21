import type { AdminDashboardPageData } from "@/lib/admin/dashboard/dashboard-types";
import {
  normalizeDashboardPayload,
  type AdminDashboardApiPayload,
} from "@/lib/admin/dashboard/dashboard-types";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";

export const DASHBOARD_CLIENT_CACHE_TTL_MS = 15_000;
export const DASHBOARD_POLL_INTERVAL_MS = 30_000;

type CacheEntry = {
  data: AdminDashboardPageData;
  fetchedAt: number;
};

let memoryCache: CacheEntry | null = null;

export function readDashboardClientCache(
  maxAgeMs = DASHBOARD_CLIENT_CACHE_TTL_MS,
): AdminDashboardPageData | null {
  if (!memoryCache) return null;
  if (Date.now() - memoryCache.fetchedAt >= maxAgeMs) return null;
  return memoryCache.data;
}

export function writeDashboardClientCache(data: AdminDashboardPageData): void {
  memoryCache = { data, fetchedAt: Date.now() };
}

export function clearDashboardClientCache(): void {
  memoryCache = null;
}

export async function fetchDashboardPageDataClient(): Promise<AdminDashboardPageData> {
  const cached = readDashboardClientCache();
  if (cached) return cached;

  const body = await readAdminJson<AdminDashboardApiPayload>(
    await adminFetch("/api/admin/dashboard/page-data"),
  );
  const normalized = normalizeDashboardPayload(body);
  writeDashboardClientCache(normalized);
  return normalized;
}

/** Force network refresh; updates client cache. */
export async function refreshDashboardPageDataClient(): Promise<AdminDashboardPageData> {
  const body = await readAdminJson<AdminDashboardApiPayload>(
    await adminFetch("/api/admin/dashboard/page-data", { cache: "no-store" }),
  );
  const normalized = normalizeDashboardPayload(body);
  writeDashboardClientCache(normalized);
  return normalized;
}
