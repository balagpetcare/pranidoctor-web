import "server-only";

import type { LogLevel } from "@/lib/logging/types";
import { serverLog } from "@/lib/logging/server-logger";

import type { AdminMonitoringEventName } from "./admin-events";
import { isAdminMonitoringEnabled } from "./admin-monitoring-config";

export function trackAdminServerEvent(
  event: AdminMonitoringEventName | string,
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>,
): void {
  if (!isAdminMonitoringEnabled()) return;

  serverLog[level](message, {
    event,
    ...(metadata ? { metadata } : {}),
  });
}

export function trackAdminProxySlow(
  path: string,
  method: string,
  status: number,
  durationMs: number,
  thresholdMs: number,
): void {
  trackAdminServerEvent(
    "admin.proxy.slow",
    "warn",
    "Slow admin proxy request",
    {
      path,
      method,
      status,
      durationMs,
      thresholdMs,
    },
  );
}

export function trackAdminAuthDenied(
  kind: "unauthorized" | "forbidden",
  path: string,
  method: string,
): void {
  trackAdminServerEvent(
    kind === "unauthorized"
      ? "admin.auth.unauthorized"
      : "admin.auth.forbidden",
    "warn",
    kind === "unauthorized" ? "Admin API unauthorized" : "Admin API forbidden",
    { path, method },
  );
}
