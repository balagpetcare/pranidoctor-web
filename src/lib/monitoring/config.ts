export type ErrorTrackingProvider = "noop" | "console" | "webhook" | "sentry";

function parseBoolEnv(key: string, def: boolean): boolean {
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return def;
}

export function isMonitoringEnabled(): boolean {
  return parseBoolEnv("MONITORING_ENABLED", true);
}

export function isErrorTrackingEnabled(): boolean {
  if (!isMonitoringEnabled()) return false;
  return parseBoolEnv("ERROR_TRACKING_ENABLED", true);
}

export function isClientErrorTrackingEnabled(): boolean {
  const pub = process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED?.trim().toLowerCase();
  if (pub === "false" || pub === "0" || pub === "no") return false;
  if (pub === "true" || pub === "1" || pub === "yes") return true;
  return process.env.NODE_ENV === "production";
}

export function getErrorTrackingProvider(): ErrorTrackingProvider {
  const raw = process.env.ERROR_TRACKING_PROVIDER?.trim().toLowerCase();
  if (raw === "console" || raw === "webhook" || raw === "noop" || raw === "sentry") {
    return raw;
  }
  const dsn = process.env.SENTRY_DSN?.trim();
  const disabled = process.env.SENTRY_ENABLED?.trim().toLowerCase() === "false";
  if (dsn && !disabled) {
    return "sentry";
  }
  return process.env.NODE_ENV === "production" ? "console" : "noop";
}

export function getMonitoringAlertWebhookUrl(): string | null {
  const url = process.env.MONITORING_ALERT_WEBHOOK_URL?.trim();
  return url || null;
}

export function getAppVersion(): string {
  return (
    process.env.APP_VERSION?.trim() ||
    process.env.npm_package_version?.trim() ||
    "unknown"
  );
}

export function getServiceName(scope: "admin" | "web" = "web"): string {
  return scope === "admin" ? "pranidoctor-web-admin" : "pranidoctor-web";
}
