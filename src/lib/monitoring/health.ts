import { getAppVersion, getServiceName } from "./config";

export type HealthStatus = "ok" | "degraded" | "fail";

export type UptimeSnapshot = {
  service: string;
  scope: "admin";
  status: "ok";
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  nodeEnv: string;
  appEnv: string;
  monitoringEnabled: boolean;
};

export type AdminHealthSnapshot = UptimeSnapshot & {
  mode: "api-consumer";
  backend: "up" | "down";
  database: "via-backend";
  checks: {
    process: HealthStatus;
    backend: HealthStatus;
  };
};

export function getUptimeSnapshot(scope: "admin" = "admin"): UptimeSnapshot {
  return {
    service: getServiceName(scope),
    scope,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: getAppVersion(),
    nodeEnv: process.env.NODE_ENV ?? "development",
    appEnv: process.env.APP_ENV ?? "development",
    monitoringEnabled: process.env.MONITORING_ENABLED?.trim().toLowerCase() !== "false",
  };
}

export function buildAdminHealthSnapshot(backendUp: boolean): AdminHealthSnapshot {
  const uptime = getUptimeSnapshot("admin");
  return {
    ...uptime,
    mode: "api-consumer",
    backend: backendUp ? "up" : "down",
    database: "via-backend",
    checks: {
      process: "ok",
      backend: backendUp ? "ok" : "fail",
    },
  };
}
