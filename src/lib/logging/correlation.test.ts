import { describe, expect, it } from "vitest";

import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from "./constants";
import { resolveRequestCorrelation } from "./correlation";

describe("logging correlation", () => {
  it("generates ids when headers are missing", () => {
    const headers = new Headers();
    const ids = resolveRequestCorrelation(headers);
    expect(ids.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(ids.correlationId).toBe(ids.requestId);
  });

  it("preserves incoming request and correlation ids", () => {
    const headers = new Headers();
    headers.set(REQUEST_ID_HEADER, "req-123");
    headers.set(CORRELATION_ID_HEADER, "corr-456");
    const ids = resolveRequestCorrelation(headers);
    expect(ids.requestId).toBe("req-123");
    expect(ids.correlationId).toBe("corr-456");
  });

  it("defaults correlation id to request id", () => {
    const headers = new Headers();
    headers.set(REQUEST_ID_HEADER, "req-only");
    const ids = resolveRequestCorrelation(headers);
    expect(ids.requestId).toBe("req-only");
    expect(ids.correlationId).toBe("req-only");
  });
});
