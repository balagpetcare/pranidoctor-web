import type { AlertSeverity } from "./alerting/alert-types";

export type { AlertSeverity };

export type AlertPayload = {
  title: string;
  message: string;
  severity: AlertSeverity;
  service: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export {
  sendProductionAlert,
  sendCriticalAlert,
  sendWarningAlert,
  sendInformationalAlert,
  resetProductionAlertingForTests,
} from "./alerting/alert-service";

export type { ProductionAlertInput, AlertEscalation } from "./alerting/alert-types";

import { sendProductionAlert } from "./alerting/alert-service";

export async function sendAlert(
  title: string,
  message: string,
  severity: AlertSeverity = "warning",
  metadata?: Record<string, unknown>,
): Promise<void> {
  const alertId =
    severity === "critical"
      ? "ALT-ERR-03"
      : severity === "warning"
        ? "ALT-ERR-04"
        : "ALT-INFO-01";

  await sendProductionAlert({
    alertId,
    title,
    message,
    severity,
    metadata,
    fingerprint:
      typeof metadata?.endpoint === "string"
        ? metadata.endpoint
        : typeof metadata?.path === "string"
          ? metadata.path
          : undefined,
  });
}

export async function alertHealthCheckFailure(
  endpoint: string,
  reason: string,
): Promise<void> {
  await sendProductionAlert({
    alertId: "ALT-DOWN-04",
    title: "Admin health check failed",
    message: `${endpoint} — ${reason}`,
    severity: "critical",
    metadata: { endpoint, reason },
    fingerprint: endpoint,
  });
}

export async function alertServerError(
  message: string,
  context?: Record<string, unknown>,
): Promise<void> {
  await sendProductionAlert({
    alertId: "ALT-ERR-03",
    title: "Admin server error",
    message,
    severity: "critical",
    metadata: context,
    fingerprint: typeof context?.path === "string" ? context.path : undefined,
  });
}

export async function alertAdminProxy5xx(
  path: string,
  method: string,
  status: number,
): Promise<void> {
  await sendProductionAlert({
    alertId: "ALT-ERR-04",
    title: "Admin proxy 5xx",
    message: `${method} ${path} — HTTP ${status}`,
    severity: "warning",
    metadata: { path, method, status },
    fingerprint: `${method}:${path}`,
  });
}

export async function alertAdminProxySlow(
  path: string,
  method: string,
  durationMs: number,
  thresholdMs: number,
): Promise<void> {
  await sendProductionAlert({
    alertId: "ALT-SLOW-01",
    title: "Admin proxy slow",
    message: `${method} ${path} — ${durationMs}ms (threshold ${thresholdMs}ms)`,
    severity: "warning",
    metadata: { path, method, durationMs, thresholdMs },
    fingerprint: `${method}:${path}`,
  });
}
