import { appendAdminCorrelationHeaders } from "@/lib/logging/client-logger";
import { trackAdminApiResult } from "@/lib/monitoring/admin-monitoring-client";

function resolveRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function resolveRequestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input !== "string" && !(input instanceof URL) && input.method) {
    return input.method.toUpperCase();
  }
  return "GET";
}

/**
 * Same-origin admin API calls — ensures session cookies and correlation headers
 * are included in the browser. Emits structured monitoring events (non-breaking).
 */
export function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = resolveRequestUrl(input);
  const method = resolveRequestMethod(input, init);
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();

  const headers = appendAdminCorrelationHeaders(init?.headers);

  return fetch(input, {
    credentials: "same-origin",
    ...init,
    headers,
  })
    .then((res) => {
      const durationMs = Math.round(
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - started,
      );
      trackAdminApiResult({
        url,
        method,
        status: res.status,
        durationMs,
        ok: res.ok,
      });
      return res;
    })
    .catch((error) => {
      const durationMs = Math.round(
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - started,
      );
      trackAdminApiResult({
        url,
        method,
        status: null,
        durationMs,
        ok: false,
      });
      throw error;
    });
}
