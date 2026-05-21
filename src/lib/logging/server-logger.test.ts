import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("server logger", () => {  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("writes JSON logs to stdout", async () => {
    vi.stubEnv("LOG_LEVEL", "info");
    vi.resetModules();
    const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    const { serverLog } = await import("./server-logger");
    serverLog.info("Test message", {
      event: "test.event",
      requestId: "req-1",
      correlationId: "corr-1",
    });

    expect(stdout).toHaveBeenCalledOnce();
    const line = String(stdout.mock.calls[0]?.[0]);
    const parsed = JSON.parse(line) as {
      level: string;
      message: string;
      requestId?: string;
      correlationId?: string;
      event?: string;
    };
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("Test message");
    expect(parsed.requestId).toBe("req-1");
    expect(parsed.correlationId).toBe("corr-1");
    expect(parsed.event).toBe("test.event");
  });

  it("redacts sensitive metadata keys", async () => {
    vi.stubEnv("LOG_LEVEL", "info");
    vi.resetModules();
    const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    const { serverLog } = await import("./server-logger");
    serverLog.info("Sensitive test", {
      metadata: { password: "secret", path: "/admin" },
    });

    const parsed = JSON.parse(String(stdout.mock.calls[0]?.[0])) as {
      metadata?: Record<string, unknown>;
    };
    expect(parsed.metadata?.password).toBe("[REDACTED]");
    expect(parsed.metadata?.path).toBe("/admin");
  });
});
