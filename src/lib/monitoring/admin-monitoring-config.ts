function parseBoolEnv(key: string, def: boolean): boolean {
  if (typeof process === "undefined") return def;
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return def;
}

function parsePositiveIntEnv(key: string, def: number): number {
  if (typeof process === "undefined") return def;
  const raw = process.env[key]?.trim();
  if (!raw) return def;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

/** Master toggle for admin structured event tracking (server). */
export function isAdminMonitoringEnabled(): boolean {
  return parseBoolEnv("MONITORING_ENABLED", true);
}

/** Client-side toggle; falls back to server flag when unset. */
export function isAdminClientMonitoringEnabled(): boolean {
  const pub = process.env.NEXT_PUBLIC_ADMIN_MONITORING_ENABLED?.trim().toLowerCase();
  if (pub === "false" || pub === "0" || pub === "no") return false;
  if (pub === "true" || pub === "1" || pub === "yes") return true;
  return isAdminMonitoringEnabled();
}

/** POST warn/error client events to BFF for centralized logs. */
export function isAdminServerEventIngestEnabled(): boolean {
  const pub = process.env.NEXT_PUBLIC_ADMIN_MONITOR_SERVER_INGEST?.trim().toLowerCase();
  if (pub === "false" || pub === "0" || pub === "no") return false;
  if (pub === "true" || pub === "1" || pub === "yes") return true;
  return process.env.NODE_ENV === "production";
}

export function getAdminSlowApiThresholdMs(): number {
  return parsePositiveIntEnv("NEXT_PUBLIC_ADMIN_SLOW_API_MS", 3000);
}

export function getAdminSlowProxyThresholdMs(): number {
  return parsePositiveIntEnv("ADMIN_SLOW_PROXY_MS", 3000);
}

export function getAdminSlowNavThresholdMs(): number {
  return parsePositiveIntEnv("NEXT_PUBLIC_ADMIN_SLOW_NAV_MS", 4000);
}

/** Extra client console fields (URL, response body, error stack) on failed admin API calls. */
export function isAdminApiDiagnosticsVerbose(): boolean {
  return parseBoolEnv("NEXT_PUBLIC_ADMIN_API_DIAGNOSTICS", true);
}

/** Collapse dynamic path segments to limit log cardinality. */
export function normalizeAdminApiPath(url: string): string {
  try {
    const parsed = url.startsWith("http")
      ? new URL(url)
      : new URL(url, "http://localhost");
    return parsed.pathname
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, "/:id")
      .replace(/\/\d+(?=\/|$)/g, "/:id");
  } catch {
    return url.split("?")[0] ?? url;
  }
}
