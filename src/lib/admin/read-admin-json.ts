import { ForbiddenError } from "@/lib/errors";
import { clientLog } from "@/lib/logging/client-logger";
import { isAdminApiDiagnosticsVerbose } from "@/lib/monitoring/admin-monitoring-config";

export { ForbiddenError };

/**
 * Parses `{ ok: true, data }` admin API responses and redirects on 401 only.
 * 403 responses throw {@link ForbiddenError} without clearing the session cookie.
 * Used by client components calling `/api/admin/*`.
 */
export async function readAdminJson<T>(res: Response): Promise<T> {
  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    if (isAdminApiDiagnosticsVerbose()) {
      clientLog.error("Admin JSON parse failed", {
        event: "admin.api.parse_failure",
        metadata: {
          url: res.url,
          status: res.status,
          statusText: res.statusText,
        },
      });
    }
    throw new Error("Invalid response from server");
  }

  const body = parsed as
    | { ok: true; data: T }
    | { ok: false; error?: { code?: string; message?: string } };

  if (res.status === 401) {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/api/admin/auth/session-invalid?next=${encodeURIComponent(next)}`;
    throw new Error("Not signed in");
  }

  if (res.status === 403) {
    const detail = body.error?.message?.trim();
    const message = detail ? `Access denied: ${detail}` : "Access denied";
    const err = new ForbiddenError(message);
    if (isAdminApiDiagnosticsVerbose()) {
      clientLog.warn("Admin API forbidden", {
        event: "admin.api.forbidden",
        metadata: {
          url: res.url,
          status: res.status,
          errorCode: body.error?.code,
          errorMessage: detail,
        },
        error: err,
      });
    }
    throw err;
  }

  if (!body.ok || !("data" in body)) {
    const code = body.error?.code?.trim();
    const msg = body.error?.message?.trim() || "Request failed";
    const err = new Error(code ? `${code}: ${msg}` : msg);
    if (isAdminApiDiagnosticsVerbose()) {
      clientLog.error("Admin API returned error envelope", {
        event: "admin.api.error_envelope",
        metadata: {
          url: res.url,
          status: res.status,
          responseBody: JSON.stringify(parsed),
          errorCode: code,
          errorMessage: msg,
        },
        error: err,
      });
    }
    throw err;
  }

  return body.data;
}
