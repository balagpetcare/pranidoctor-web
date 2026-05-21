"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AdminDashboardPageData } from "@/lib/admin/dashboard/dashboard-types";
import {
  DASHBOARD_POLL_INTERVAL_MS,
  fetchDashboardPageDataClient,
  refreshDashboardPageDataClient,
  writeDashboardClientCache,
} from "@/lib/admin/dashboard/dashboard-client-cache";

export type UseAdminDashboardRealtimeOptions = {
  /** Initial SSR payload — written to client cache on mount. */
  initialData: AdminDashboardPageData;
  pollIntervalMs?: number;
  enabled?: boolean;
};

export type UseAdminDashboardRealtimeResult = {
  data: AdminDashboardPageData;
  isRefreshing: boolean;
  lastUpdated: Date;
  error: string | null;
  refresh: () => Promise<void>;
};

function coerceDashboardTimestamp(value: Date | string | undefined): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return new Date();
}

export function useAdminDashboardRealtime({
  initialData,
  pollIntervalMs = DASHBOARD_POLL_INTERVAL_MS,
  enabled = true,
}: UseAdminDashboardRealtimeOptions): UseAdminDashboardRealtimeResult {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(
    () => coerceDashboardTimestamp(initialData.generatedAt),
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    writeDashboardClientCache(initialData);
  }, [initialData]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const next = await refreshDashboardPageDataClient();
      if (!mountedRef.current) return;
      setData(next);
      setLastUpdated(coerceDashboardTimestamp(next.generatedAt));
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "ড্যাশবোর্ড রিফ্রেশ ব্যর্থ");
    } finally {
      if (mountedRef.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function poll() {
      try {
        const next = await fetchDashboardPageDataClient();
        if (cancelled) return;
        setData(next);
        setLastUpdated(coerceDashboardTimestamp(next.generatedAt));
        setError(null);
      } catch {
        if (!cancelled) {
          setError("লাইভ আপডেট ব্যর্থ — শেষ ডেটা দেখানো হচ্ছে");
        }
      }
    }

    const id = window.setInterval(() => {
      void poll();
    }, pollIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, pollIntervalMs]);

  return { data, isRefreshing, lastUpdated, error, refresh };
}
