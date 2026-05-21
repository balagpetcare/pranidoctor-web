import { NextResponse } from "next/server";

/**
 * Proxy Next.js App Router handlers to canonical Express backend.
 * Preserves method, query, headers, and body.
 */

function getBackendOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "";
  return process.env.BACKEND_URL ?? (api || "http://localhost:3000");
}

export async function proxyRouteToBackend(request: Request): Promise<Response> {
  const origin = getBackendOrigin();
  const url = new URL(request.url);
  const target = `${origin}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.arrayBuffer();
    if (body.byteLength > 0) {
      init.body = body;
    }
  }

  const upstream = await fetch(target, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("transfer-encoding");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

/** Use when handler must return NextResponse (e.g. cookie mutations). */
export async function proxyRouteToBackendNext(request: Request): Promise<NextResponse> {
  const res = await proxyRouteToBackend(request);
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
