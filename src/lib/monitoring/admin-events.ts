/**
 * Admin monitoring event catalog — shared between client and server.
 * All events use the `admin.*` namespace for log aggregation filters.
 */

export const AdminMonitoringEvent = {
  PAGE_VIEW: "admin.page.view",
  PAGE_FAILURE: "admin.page.failure",
  API_REQUEST: "admin.api.request",
  API_FAILURE: "admin.api.failure",
  API_SLOW: "admin.api.slow",
  PROXY_SLOW: "admin.proxy.slow",
  ACTION: "admin.action",
  AUTH_LOGIN_SUCCESS: "admin.auth.login_success",
  AUTH_LOGIN_FAILURE: "admin.auth.login_failure",
  AUTH_LOGOUT: "admin.auth.logout",
  AUTH_SESSION_REFRESH_FAILED: "admin.auth.session_refresh_failed",
  AUTH_UNAUTHORIZED: "admin.auth.unauthorized",
  AUTH_FORBIDDEN: "admin.auth.forbidden",
  NAVIGATION_SLOW: "admin.navigation.slow",
} as const;

export type AdminMonitoringEventName =
  (typeof AdminMonitoringEvent)[keyof typeof AdminMonitoringEvent];

export type AdminApiTrackPayload = {
  url: string;
  method: string;
  status: number | null;
  durationMs: number;
  ok: boolean;
  /** Populated when `ok` is false (diagnostics only). */
  responseBody?: string;
  errorMessage?: string;
  errorStack?: string;
};

export type AdminAuthTrackReason =
  | "invalid_credentials"
  | "db_unavailable"
  | "server_error"
  | "unauthorized"
  | "forbidden"
  | "network"
  | string;

export type AdminClientMonitorEvent = {
  event: AdminMonitoringEventName;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  correlationId?: string;
};
