import { afterEach, describe, expect, it, vi } from "vitest";

describe("edge logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("writes JSON logs via console (edge-safe)", async () => {
    vi.stubEnv("LOG_LEVEL", "info");
    vi.resetModules();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const { edgeLog } = await import("./edge-logger");
    edgeLog.info("Edge test", {
      event: "test.edge",
      requestId: "req-edge",
    });

    expect(log).toHaveBeenCalledOnce();
    const line = String(log.mock.calls[0]?.[0]);
    const parsed = JSON.parse(line) as {
      level: string;
      message: string;
      requestId?: string;
      event?: string;
    };
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("Edge test");
    expect(parsed.requestId).toBe("req-edge");
    expect(parsed.event).toBe("test.edge");
  });

  it("routes errors to console.error", async () => {
    vi.stubEnv("LOG_LEVEL", "info");
    vi.resetModules();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const { edgeLog } = await import("./edge-logger");
    edgeLog.error("Edge failure", { event: "test.edge.error" });

    expect(error).toHaveBeenCalledOnce();
    const parsed = JSON.parse(String(error.mock.calls[0]?.[0])) as { level: string };
    expect(parsed.level).toBe("error");
  });
});
