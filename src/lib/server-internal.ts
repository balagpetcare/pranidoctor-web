import "server-only";

import { cookies, headers } from "next/headers";

/**
 * Server-side fetch to canonical backend for RSC / guards (no direct Prisma).
 */

function getBackendOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "";
  return process.env.BACKEND_URL ?? (api || "http://localhost:3000");
}

export async function serverInternalFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const origin = getBackendOrigin();
  const url = path.startsWith("http") ? path : `${origin}${path.startsWith("/") ? path : `/${path}`}`;

  const hdrs = new Headers(init.headers);
  const incoming = await headers();
  const cookieStore = await cookies();

  const auth = incoming.get("authorization");
  if (auth && !hdrs.has("authorization")) hdrs.set("authorization", auth);

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (cookieHeader && !hdrs.has("cookie")) hdrs.set("cookie", cookieHeader);

  if (!hdrs.has("accept")) hdrs.set("accept", "application/json");

  return fetch(url, {
    ...init,
    headers: hdrs,
    cache: "no-store",
  });
}

export async function serverInternalJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; status: number; body: unknown }> {
  const res = await serverInternalFetch(path, init);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, status: res.status, body };
  }
  if (body && typeof body === "object" && "ok" in body && (body as { ok: boolean }).ok === true) {
    return { ok: true, data: (body as { data: T }).data };
  }
  return { ok: true, data: body as T };
}
