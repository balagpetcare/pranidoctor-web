import type { AdminLoginPayload, AdminLoginResult, AdminSessionUser } from "./types";
import { appendAdminCorrelationHeaders } from "@/lib/logging/client-logger";
import { AdminMonitoringEvent } from "@/lib/monitoring/admin-events";
import { trackAdminAuthEvent } from "@/lib/monitoring/admin-monitoring-client";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export class AdminAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

function parseEnvelope<T>(body: unknown): T {
  const parsed = body as ApiEnvelope<T>;
  if (!parsed || typeof parsed !== "object" || !("ok" in parsed)) {
    throw new AdminAuthError("server_error", "Invalid response from server");
  }
  if (!parsed.ok) {
    throw new AdminAuthError(parsed.error.code, parsed.error.message);
  }
  return parsed.data;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    throw new AdminAuthError("server_error", "Invalid response from server");
  }
}

export async function adminLoginRequest(payload: AdminLoginPayload): Promise<AdminLoginResult> {
  const res = await fetch("/api/admin/auth/login", {
    method: "POST",
    headers: appendAdminCorrelationHeaders({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  const body = await readJson(res);

  if (!res.ok) {
    try {
      const parsed = body as ApiEnvelope<unknown>;
      if (!parsed.ok) {
        trackAdminAuthEvent(AdminMonitoringEvent.AUTH_LOGIN_FAILURE, {
          reason: parsed.error.code,
          status: res.status,
        });
      }
    } catch {
      trackAdminAuthEvent(AdminMonitoringEvent.AUTH_LOGIN_FAILURE, {
        reason: "server_error",
        status: res.status,
      });
    }
  }

  try {
    const data = parseEnvelope<{
      result: "success";
      user: AdminSessionUser;
    }>(body);
    trackAdminAuthEvent(AdminMonitoringEvent.AUTH_LOGIN_SUCCESS, {
      role: data.user.role,
    });
    return { user: data.user };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      trackAdminAuthEvent(AdminMonitoringEvent.AUTH_LOGIN_FAILURE, {
        reason: error.code,
        status: res.status,
      });
    }
    throw error;
  }
}

export async function adminLogoutRequest(): Promise<void> {
  await fetch("/api/admin/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: appendAdminCorrelationHeaders(),
  });
}

export async function adminMeRequest(): Promise<AdminSessionUser> {
  const res = await fetch("/api/admin/auth/me", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: appendAdminCorrelationHeaders(),
  });
  const body = await readJson(res);
  if (res.status === 401 || res.status === 403) {
    throw new AdminAuthError("UNAUTHORIZED", "Not signed in");
  }
  const data = parseEnvelope<{ user: AdminSessionUser }>(body);
  return data.user;
}

/** Session refresh uses existing backend `/me` (touches panel session server-side). */
export async function adminRefreshSessionRequest(): Promise<AdminSessionUser> {
  return adminMeRequest();
}
