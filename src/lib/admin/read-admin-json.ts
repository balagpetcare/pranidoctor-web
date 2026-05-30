/**
 * Parses `{ ok: true, data }` admin API responses and redirects on 401.
 * Used by client components calling `/api/admin/*`.
 */
export async function readAdminJson<T>(res: Response): Promise<T> {
  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  const body = parsed as
    | { ok: true; data: T }
    | { ok: false; error?: { code?: string; message?: string } };

  if (res.status === 401 || res.status === 403) {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/api/admin/auth/session-invalid?next=${encodeURIComponent(next)}`;
    throw new Error("Not signed in");
  }

  if (!body.ok || !("data" in body)) {
    const code = body.error?.code?.trim();
    const msg = body.error?.message?.trim() || "Request failed";
    throw new Error(code ? `${code}: ${msg}` : msg);
  }

  return body.data;
}
