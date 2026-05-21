import {
  getMonitoringAlertWebhookUrl,
  isMonitoringEnabled,
} from "./config";
import { monitoringLog } from "./log";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertPayload = {
  title: string;
  message: string;
  severity: AlertSeverity;
  service: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

function buildAlertPayload(
  title: string,
  message: string,
  severity: AlertSeverity,
  metadata?: Record<string, unknown>,
): AlertPayload {
  return {
    title,
    message,
    severity,
    service: "pranidoctor-web-admin",
    timestamp: new Date().toISOString(),
    ...(metadata ? { metadata } : {}),
  };
}

export async function sendAlert(
  title: string,
  message: string,
  severity: AlertSeverity = "warning",
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!isMonitoringEnabled()) return;

  const payload = buildAlertPayload(title, message, severity, metadata);
  const webhookUrl = getMonitoringAlertWebhookUrl();

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      monitoringLog.error("Alert webhook delivery failed", {
        event: "monitoring.alert.webhook_failed",
        error,
        metadata: { title, severity },
      });
    }
    return;
  }

  monitoringLog.warn(`${title}: ${message}`, {
    event: "monitoring.alert",
    metadata: { severity, ...metadata },
  });
}

export async function alertHealthCheckFailure(
  endpoint: string,
  reason: string,
): Promise<void> {
  await sendAlert(
    "Admin health check failed",
    `${endpoint} — ${reason}`,
    "critical",
    { endpoint, reason },
  );
}

export async function alertServerError(
  message: string,
  context?: Record<string, unknown>,
): Promise<void> {
  await sendAlert("Admin server error", message, "critical", context);
}
