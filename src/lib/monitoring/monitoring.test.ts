import { afterEach, describe, expect, it, vi } from "vitest";

describe("monitoring config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults monitoring to enabled", async () => {
    const { isMonitoringEnabled } = await import("./config");
    expect(isMonitoringEnabled()).toBe(true);
  });

  it("respects MONITORING_ENABLED=false", async () => {
    vi.stubEnv("MONITORING_ENABLED", "false");
    const { isMonitoringEnabled, isErrorTrackingEnabled } = await import("./config");
    expect(isMonitoringEnabled()).toBe(false);
    expect(isErrorTrackingEnabled()).toBe(false);
  });
});

describe("monitoring health", () => {
  it("returns admin uptime snapshot", async () => {
    const { getUptimeSnapshot } = await import("./health");
    const snapshot = getUptimeSnapshot("admin");
    expect(snapshot.scope).toBe("admin");
    expect(snapshot.service).toBe("pranidoctor-web-admin");
    expect(snapshot.status).toBe("ok");
    expect(snapshot.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
