import "server-only";

/**
 * HTTP client for canonical Express API (pranidoctor-backend).
 * Web does not own Prisma schema/migrations — consume backend only.
 */

const DEFAULT_BACKEND_ORIGIN = "http://localhost:3000";

function getBackendOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "";
  return process.env.BACKEND_URL ?? (api || DEFAULT_BACKEND_ORIGIN);
}

function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    `${getBackendOrigin()}/api`
  ).replace(/\/$/, "");
}

export type ApiClientOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined>;
};

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; body?: unknown };

export function getBackendApiBase(): string {
  return getApiBase();
}

export function getBackendOriginUrl(): string {
  return getBackendOrigin();
}

export async function apiRequest<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<ApiResult<T>> {
  const base = getApiBase();
  const url = new URL(path.startsWith("/") ? `${base}${path}` : `${base}/${path}`);

  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    const text = await response.text();
    let parsed: unknown = text;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: `HTTP ${response.status}`,
        body: parsed,
      };
    }

    return { ok: true, status: response.status, data: parsed as T };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Ops probe against backend root `/health` (not under `/api`). */
export async function fetchBackendHealth(): Promise<ApiResult<{ status?: string; alive?: boolean }>> {
  const origin = getBackendOrigin();
  try {
    const response = await fetch(`${origin}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = (await response.json()) as { status?: string; alive?: boolean };
    if (!response.ok) {
      return { ok: false, status: response.status, error: `HTTP ${response.status}`, body: data };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
