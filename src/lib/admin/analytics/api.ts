import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

import type {
  AnalyticsQueryParams,
  DoctorsAnalytics,
  FarmersAnalytics,
  GeographyAnalytics,
  LivestockAnalytics,
  OverviewAnalytics,
  RevenueAnalytics,
  SystemAnalytics,
} from './types';
import { buildAnalyticsQuery } from './date-range';

async function fetchAnalytics<T>(path: string, params: AnalyticsQueryParams): Promise<T> {
  const query = buildAnalyticsQuery(params);
  const res = await adminFetch(`/api/admin/analytics/${path}${query}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Analytics request failed (${res.status})`);
  }
  return readAdminJson<T>(res);
}

export function fetchOverviewAnalytics(params: AnalyticsQueryParams) {
  return fetchAnalytics<OverviewAnalytics>('overview', params);
}

export function fetchRevenueAnalytics(
  params: AnalyticsQueryParams & { grain?: string; basis?: string },
) {
  return fetchAnalytics<RevenueAnalytics>('revenue', params);
}

export function fetchDoctorsAnalytics(params: AnalyticsQueryParams) {
  return fetchAnalytics<DoctorsAnalytics>('doctors', params);
}

export function fetchFarmersAnalytics(params: AnalyticsQueryParams) {
  return fetchAnalytics<FarmersAnalytics>('farmers', params);
}

export function fetchLivestockAnalytics(params: AnalyticsQueryParams) {
  return fetchAnalytics<LivestockAnalytics>('livestock', params);
}

export function fetchGeographyAnalytics(
  params: AnalyticsQueryParams & { level?: string },
) {
  return fetchAnalytics<GeographyAnalytics>('geography', params);
}

export function fetchSystemAnalytics(params: AnalyticsQueryParams) {
  return fetchAnalytics<SystemAnalytics>('system', params);
}

export async function exportAnalyticsCsv(
  report: string,
  params: AnalyticsQueryParams,
): Promise<void> {
  const query = buildAnalyticsQuery({ ...params, format: 'csv', report });
  const res = await adminFetch(`/api/admin/analytics/reports${query}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Export failed (${res.status})`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `${report}-export.csv`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
