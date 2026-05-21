"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AdminDashboardPageData } from "@/lib/admin/dashboard/dashboard-types";
import {
  fetchDashboardPageDataClient,
  readDashboardClientCache,
  refreshDashboardPageDataClient,
} from "@/lib/admin/dashboard/dashboard-client-cache";

export type UseDashboardPageDataOptions = {
  /** Use cached data on mount when available (default true). */
  preferCache?: boolean;
};

export type UseDashboardPageDataResult = {
  data: AdminDashboardPageData | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

/** Shared client loader for dashboard page-data (cache-aware). */
export function useDashboardPageData(
  options: UseDashboardPageDataOptions = {},
): UseDashboardPageDataResult {
  const { preferCache = true } = options;
  const cached = preferCache ? readDashboardClientCache() : null;
  const [data, setData] = useState<AdminDashboardPageData | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const next = force
        ? await refreshDashboardPageDataClient()
        : await fetchDashboardPageDataClient();
      if (!mountedRef.current) return;
      setData(next);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "ডেটা লোড করা যায়নি");
      if (force) setData(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cached && preferCache) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void reload();
  }, [cached, preferCache, reload]);

  return {
    data,
    loading,
    error,
    reload: () => reload(true),
  };
}
