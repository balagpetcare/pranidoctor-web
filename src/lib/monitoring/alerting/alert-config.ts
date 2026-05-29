import {
  getAppVersion,
  getMonitoringAlertWebhookUrl,
  getServiceName,
  isMonitoringEnabled,
} from "../config";

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function isAlertingEnabled(): boolean {
  return isMonitoringEnabled();
}

export function getAlertWebhookUrl(): string | null {
  return getMonitoringAlertWebhookUrl();
}

export function getAlertDedupWindowMs(): number {
  return parsePositiveInt(process.env.ALERT_DEDUP_WINDOW_MS, 15 * 60 * 1000);
}

export function getAlertEscalationThreshold(): number {
  return parsePositiveInt(process.env.ALERT_ESCALATION_THRESHOLD, 5);
}

export function getAlertStormLimit(severity: "critical" | "warning" | "info"): number {
  switch (severity) {
    case "critical":
      return parsePositiveInt(process.env.ALERT_MAX_CRITICAL_PER_MIN, 10);
    case "warning":
      return parsePositiveInt(process.env.ALERT_MAX_WARNING_PER_MIN, 30);
    default:
      return parsePositiveInt(process.env.ALERT_MAX_INFO_PER_MIN, 60);
  }
}

export function getAlertServiceName(): string {
  return getServiceName("admin");
}

export function getAlertEnvironment(): string {
  return process.env.APP_ENV?.trim() || process.env.NODE_ENV?.trim() || "development";
}

export function getAlertAppVersion(): string {
  return getAppVersion();
}
