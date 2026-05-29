import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AlertDeduplicator } from "./alert-deduplicator";
import { resetProductionAlertingForTests, sendProductionAlert } from "./alert-service";
import { severityToTier } from "./alert-types";

describe("severityToTier", () => {
  it("maps info to informational tier", () => {
    expect(severityToTier("info")).toBe("informational");
  });
});

describe("AlertDeduplicator", () => {
  let dedup: AlertDeduplicator;

  beforeEach(() => {
    dedup = new AlertDeduplicator(60_000, 5, () => 100);
  });

  it("allows first alert", () => {
    const d = dedup.evaluate("ALT-DOWN-04", "critical");
    expect(d.allow).toBe(true);
    expect(d.deduplicated).toBe(false);
  });

  it("suppresses duplicates in window", () => {
    dedup.evaluate("ALT-DOWN-04", "critical");
    const d = dedup.evaluate("ALT-DOWN-04", "critical");
    expect(d.allow).toBe(false);
    expect(d.deduplicated).toBe(true);
  });
});

describe("sendProductionAlert", () => {
  afterEach(() => {
    resetProductionAlertingForTests();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("deduplicates repeated critical alerts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("MONITORING_ALERT_WEBHOOK_URL", "https://hooks.example.com/alerts");

    await sendProductionAlert({
      alertId: "ALT-DOWN-04",
      title: "Test",
      message: "One",
      severity: "critical",
    });
    await sendProductionAlert({
      alertId: "ALT-DOWN-04",
      title: "Test",
      message: "Two",
      severity: "critical",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.event).toBe("production.alert");
    expect(body.alertId).toBe("ALT-DOWN-04");
    expect(body.escalation.repeatCount).toBe(1);
  });

  it("respects MONITORING_ENABLED=false", async () => {
    vi.stubEnv("MONITORING_ENABLED", "false");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendProductionAlert({
      alertId: "ALT-DOWN-04",
      title: "Test",
      message: "Disabled",
      severity: "critical",
    });

    expect(result.sent).toBe(false);
    expect(result.reason).toBe("disabled");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("includes critical tier in webhook payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("MONITORING_ALERT_WEBHOOK_URL", "https://hooks.example.com/alerts");

    await sendProductionAlert({
      alertId: "ALT-ERR-03",
      title: "Admin error",
      message: "Unhandled",
      severity: "critical",
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.severity).toBe("critical");
    expect(body.tier).toBe("critical");
    expect(body.service).toBeTruthy();
  });
});
