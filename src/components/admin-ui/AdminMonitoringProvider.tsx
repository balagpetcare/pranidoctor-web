"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import {
  trackAdminNavigationSlow,
  trackAdminPageView,
} from "@/lib/monitoring/admin-monitoring-client";
import { getAdminSlowNavThresholdMs } from "@/lib/monitoring/admin-monitoring-config";

type AdminMonitoringProviderProps = Readonly<{
  children: React.ReactNode;
}>;

/**
 * Tracks admin page views and slow client-side navigations.
 * Renders children only — no UI changes.
 */
export function AdminMonitoringProvider({ children }: AdminMonitoringProviderProps) {
  const pathname = usePathname() ?? "/admin";
  const navStartedRef = useRef<number | null>(null);
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const started = navStartedRef.current;
    if (previousPathRef.current && started != null) {
      const durationMs = Math.round(performance.now() - started);
      trackAdminNavigationSlow(pathname, durationMs, getAdminSlowNavThresholdMs());
    }

    previousPathRef.current = pathname;
    navStartedRef.current = performance.now();
    trackAdminPageView(pathname);
  }, [pathname]);

  return children;
}
