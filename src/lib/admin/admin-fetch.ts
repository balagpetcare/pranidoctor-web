import { appendAdminCorrelationHeaders } from "@/lib/logging/client-logger";
import { trackAdminApiResult } from "@/lib/monitoring/admin-monitoring-client";

const MAX_DIAG_RESPONSE_CHARS = 4096;

async function readDiagnosticResponseBody(res: Response): Promise<string | undefined> {
  try {
    const text = await res.clone().text();
    if (!text) return undefined;
    return text.length > MAX_DIAG_RESPONSE_CHARS
      ? `${text.slice(0, MAX_DIAG_RESPONSE_CHARS)}…`
      : text;
  } catch {
    return undefined;
  }
}

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
    .then(async (res) => {
      const durationMs = Math.round(
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - started,
      );
      const responseBody = res.ok ? undefined : await readDiagnosticResponseBody(res);
      trackAdminApiResult({
        url,
        method,
        status: res.status,
        durationMs,
        ok: res.ok,
        responseBody,
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
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    });
}
