import { clientLog, getClientCorrelationId } from "@/lib/logging/client-logger";

import {
  AdminMonitoringEvent,
  type AdminApiTrackPayload,
  type AdminAuthTrackReason,
  type AdminClientMonitorEvent,
  type AdminMonitoringEventName,
} from "./admin-events";
import {
  getAdminSlowApiThresholdMs,
  getAdminSlowNavThresholdMs,
  isAdminApiDiagnosticsVerbose,
  isAdminClientMonitoringEnabled,
  isAdminServerEventIngestEnabled,
  normalizeAdminApiPath,
} from "./admin-monitoring-config";

function emitClientEvent(
  event: AdminMonitoringEventName,
  level: "debug" | "info" | "warn" | "error",
  message: string,
  metadata?: Record<string, unknown>,
): void {
  if (!isAdminClientMonitoringEnabled()) return;

  const payload: AdminClientMonitorEvent = {
    event,
    level,
    message,
    timestamp: new Date().toISOString(),
    correlationId: getClientCorrelationId(),
    ...(metadata ? { metadata } : {}),
  };

  clientLog[level](message, {
    event,
    metadata: payload.metadata,
  });

  if (
    isAdminServerEventIngestEnabled() &&
    (level === "warn" || level === "error") &&
    typeof window !== "undefined"
  ) {
    void ingestClientEvent(payload);
  }
}

async function ingestClientEvent(payload: AdminClientMonitorEvent): Promise<void> {
  try {
    await fetch("/api/admin/monitoring/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ events: [payload] }),
      keepalive: true,
    });
  } catch {
    // Best-effort — client console log remains the fallback transport.
  }
}

export function trackAdminPageView(pathname: string): void {
  emitClientEvent(AdminMonitoringEvent.PAGE_VIEW, "info", "Admin page view", {
    pathname,
  });
}

export function trackAdminPageFailure(
  source: string,
  error: unknown,
  metadata?: Record<string, unknown>,
): void {
  emitClientEvent(AdminMonitoringEvent.PAGE_FAILURE, "error", "Admin page failure", {
    source,
    ...metadata,
    errorName: error instanceof Error ? error.name : "Error",
    errorMessage: error instanceof Error ? error.message : String(error),
  });
}

export function trackAdminNavigationSlow(
  url: string,
  durationMs: number,
  thresholdMs = getAdminSlowNavThresholdMs(),
): void {
  if (durationMs < thresholdMs) return;
  emitClientEvent(AdminMonitoringEvent.NAVIGATION_SLOW, "warn", "Slow admin navigation", {
    url,
    durationMs,
    thresholdMs,
  });
}

export function trackAdminApiResult(payload: AdminApiTrackPayload): void {
  if (!isAdminClientMonitoringEnabled()) return;

  const path = normalizeAdminApiPath(payload.url);
  const meta = {
    path,
    method: payload.method,
    status: payload.status,
    durationMs: payload.durationMs,
    ok: payload.ok,
  };

  const slowThreshold = getAdminSlowApiThresholdMs();
  if (payload.durationMs >= slowThreshold) {
    emitClientEvent(AdminMonitoringEvent.API_SLOW, "warn", "Slow admin API call", {
      ...meta,
      thresholdMs: slowThreshold,
    });
  }

  if (!payload.ok) {
    const level = payload.status != null && payload.status >= 500 ? "error" : "warn";
    const diagnostics = {
      ...meta,
      url: payload.url,
      ...(payload.responseBody ? { responseBody: payload.responseBody } : {}),
      ...(payload.errorMessage ? { errorMessage: payload.errorMessage } : {}),
      ...(payload.errorStack ? { errorStack: payload.errorStack } : {}),
    };
    emitClientEvent(AdminMonitoringEvent.API_FAILURE, level, "Admin API call failed", diagnostics);
    if (isAdminApiDiagnosticsVerbose()) {
      clientLog[level]("Admin API call failed (diagnostics)", {
        event: AdminMonitoringEvent.API_FAILURE,
        metadata: diagnostics,
      });
    }
    return;
  }

  emitClientEvent(AdminMonitoringEvent.API_REQUEST, "debug", "Admin API call completed", meta);
}

export function trackAdminAction(
  action: string,
  metadata?: Record<string, unknown>,
): void {
  emitClientEvent(AdminMonitoringEvent.ACTION, "info", "Admin action", {
    action,
    ...metadata,
  });
}

export function trackAdminAuthEvent(
  event:
    | typeof AdminMonitoringEvent.AUTH_LOGIN_SUCCESS
    | typeof AdminMonitoringEvent.AUTH_LOGIN_FAILURE
    | typeof AdminMonitoringEvent.AUTH_LOGOUT
    | typeof AdminMonitoringEvent.AUTH_SESSION_REFRESH_FAILED,
  metadata?: Record<string, unknown> & { reason?: AdminAuthTrackReason },
): void {
  const level =
    event === AdminMonitoringEvent.AUTH_LOGIN_FAILURE ||
    event === AdminMonitoringEvent.AUTH_SESSION_REFRESH_FAILED
      ? "warn"
      : "info";

  const messages: Record<string, string> = {
    [AdminMonitoringEvent.AUTH_LOGIN_SUCCESS]: "Admin login success",
    [AdminMonitoringEvent.AUTH_LOGIN_FAILURE]: "Admin login failure",
    [AdminMonitoringEvent.AUTH_LOGOUT]: "Admin logout",
    [AdminMonitoringEvent.AUTH_SESSION_REFRESH_FAILED]: "Admin session refresh failed",
  };

  emitClientEvent(event, level, messages[event] ?? "Admin auth event", metadata);
}

/** @deprecated Use trackAdminPageFailure — kept for existing call sites. */
export function trackAdminClientException(
  error: unknown,
  context: {
    event?: string;
    message?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  } = {},
): void {
  trackAdminPageFailure(context.source ?? "client", error, {
    legacyEvent: context.event,
    ...context.metadata,
  });
}
