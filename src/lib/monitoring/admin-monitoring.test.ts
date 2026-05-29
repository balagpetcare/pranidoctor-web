import { afterEach, describe, expect, it, vi } from "vitest";

describe("admin-monitoring-config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes UUID path segments", async () => {
    const { normalizeAdminApiPath } = await import("./admin-monitoring-config");
    expect(
      normalizeAdminApiPath("/api/admin/doctors/550e8400-e29b-41d4-a716-446655440000"),
    ).toBe("/api/admin/doctors/:id");
  });

  it("normalizes numeric path segments", async () => {
    const { normalizeAdminApiPath } = await import("./admin-monitoring-config");
    expect(normalizeAdminApiPath("/api/admin/billing/42")).toBe("/api/admin/billing/:id");
  });

  it("defaults slow API threshold to 3000ms", async () => {
    const { getAdminSlowApiThresholdMs } = await import("./admin-monitoring-config");
    expect(getAdminSlowApiThresholdMs()).toBe(3000);
  });

  it("respects NEXT_PUBLIC_ADMIN_SLOW_API_MS", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADMIN_SLOW_API_MS", "5000");
    const { getAdminSlowApiThresholdMs } = await import("./admin-monitoring-config");
    expect(getAdminSlowApiThresholdMs()).toBe(5000);
  });

  it("disables client monitoring when MONITORING_ENABLED=false", async () => {
    vi.stubEnv("MONITORING_ENABLED", "false");
    const { isAdminClientMonitoringEnabled } = await import("./admin-monitoring-config");
    expect(isAdminClientMonitoringEnabled()).toBe(false);
  });
});

describe("admin-monitoring-client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("emits api.failure for non-ok responses", async () => {
    vi.stubEnv("MONITORING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_MONITORING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_MONITOR_SERVER_INGEST", "false");

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { trackAdminApiResult } = await import("./admin-monitoring-client");
    trackAdminApiResult({
      url: "/api/admin/dashboard/page-data",
      method: "GET",
      status: 503,
      durationMs: 120,
      ok: false,
    });

    expect(errorSpy).toHaveBeenCalled();
    const payload = errorSpy.mock.calls[0]?.[1] as { event?: string };
    expect(payload?.event).toBe("admin.api.failure");
  });

  it("emits api.slow when duration exceeds threshold", async () => {
    vi.stubEnv("MONITORING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_MONITORING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_SLOW_API_MS", "100");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_MONITOR_SERVER_INGEST", "false");

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { trackAdminApiResult } = await import("./admin-monitoring-client");
    trackAdminApiResult({
      url: "/api/admin/analytics/overview",
      method: "GET",
      status: 200,
      durationMs: 250,
      ok: true,
    });

    const slowCall = warnSpy.mock.calls.find((call) => {
      const payload = call[1] as { event?: string } | undefined;
      return payload?.event === "admin.api.slow";
    });
    expect(slowCall).toBeDefined();
  });
});

describe("admin-events", () => {
  it("defines stable event names", async () => {
    const { AdminMonitoringEvent } = await import("./admin-events");
    expect(AdminMonitoringEvent.PAGE_FAILURE).toBe("admin.page.failure");
    expect(AdminMonitoringEvent.API_SLOW).toBe("admin.api.slow");
    expect(AdminMonitoringEvent.AUTH_LOGOUT).toBe("admin.auth.logout");
  });
});
