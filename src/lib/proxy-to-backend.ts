import { NextResponse } from "next/server";

import {
  applyRequestCorrelationHeaders,
  resolveRequestCorrelation,
} from "@/lib/logging/correlation";
import { REQUEST_ID_HEADER, CORRELATION_ID_HEADER } from "@/lib/logging/constants";
import { runWithRequestContext } from "@/lib/logging/request-context";
import { serverLog } from "@/lib/logging/server-logger";
import { requireAdminPanelApiAccess } from "@/lib/admin-auth/api-guard";
import { getAdminSlowProxyThresholdMs } from "@/lib/monitoring/admin-monitoring-config";
import {
  alertAdminProxy5xx,
  alertAdminProxySlow,
} from "@/lib/monitoring/alerts";
import {
  trackAdminAuthDenied,
  trackAdminProxySlow,
} from "@/lib/monitoring/admin-monitoring-server";

/**
 * Proxy Next.js App Router handlers to canonical Express backend.
 * Preserves method, query, headers, and body.
 */

function getBackendOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "";
  return process.env.BACKEND_URL ?? (api || "http://localhost:3000");
}

function isAdminProxyPath(pathname: string): boolean {
  return pathname.startsWith("/api/admin");
}

/** Admin auth routes and health probes stay public at the BFF layer. */
function isAdminApiPublicPath(pathname: string): boolean {
  const publicPaths = [
    "/api/admin/auth/login",
    "/api/admin/auth/logout",
    "/api/admin/auth/session-invalid",
    "/api/admin/health",
    "/api/admin/health/live",
    "/api/admin/health/ready",
  ];
  return publicPaths.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

async function assertAdminProxyAccess(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!isAdminProxyPath(url.pathname) || isAdminApiPublicPath(url.pathname)) {
    return null;
  }
  const denied = await requireAdminPanelApiAccess();
  if (denied) {
    const status = denied.status;
    trackAdminAuthDenied(
      status === 403 ? "forbidden" : "unauthorized",
      url.pathname,
      request.method,
    );
  }
  return denied;
}

async function proxyOnce(request: Request): Promise<Response> {
  const origin = getBackendOrigin();
  const url = new URL(request.url);
  const target = `${origin}${url.pathname}${url.search}`;
  const ids = resolveRequestCorrelation(request.headers);
  const started = Date.now();

  return runWithRequestContext(
    {
      ...ids,
      path: url.pathname,
      method: request.method,
    },
    async () => {
      const headers = new Headers(request.headers);
      // Hop-by-hop / Node fetch-incompatible headers must not be forwarded upstream.
      for (const name of [
        "host",
        "connection",
        "keep-alive",
        "transfer-encoding",
        "te",
        "trailer",
        "upgrade",
        "proxy-authorization",
        "proxy-connection",
        "expect",
      ]) {
        headers.delete(name);
      }
      applyRequestCorrelationHeaders(headers, ids);

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

      try {
        const upstream = await fetch(target, init);
        const responseHeaders = new Headers(upstream.headers);
        // Node fetch decompresses gzip/br bodies; drop encoding/length so clients
        // do not wait for compressed bytes that will never arrive (BFF hang / invalid JSON).
        for (const name of [
          "transfer-encoding",
          "content-encoding",
          "content-length",
        ]) {
          responseHeaders.delete(name);
        }
        responseHeaders.set(REQUEST_ID_HEADER, ids.requestId);
        responseHeaders.set(CORRELATION_ID_HEADER, ids.correlationId);

        const body = await upstream.arrayBuffer();

        if (isAdminProxyPath(url.pathname)) {
          const durationMs = Date.now() - started;
          const level = upstream.status >= 500 ? "error" : upstream.status >= 400 ? "warn" : "info";
          serverLog[level]("Backend proxy completed", {
            event: "admin.proxy",
            metadata: {
              path: url.pathname,
              method: request.method,
              status: upstream.status,
              durationMs,
            },
          });
          if (upstream.status >= 500) {
            void alertAdminProxy5xx(url.pathname, request.method, upstream.status);
          }
          const slowThreshold = getAdminSlowProxyThresholdMs();
          if (durationMs >= slowThreshold) {
            trackAdminProxySlow(
              url.pathname,
              request.method,
              upstream.status,
              durationMs,
              slowThreshold,
            );
            void alertAdminProxySlow(
              url.pathname,
              request.method,
              durationMs,
              slowThreshold,
            );
          }
        }

        return new Response(body.byteLength > 0 ? body : null, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: responseHeaders,
        });
      } catch (error) {
        if (isAdminProxyPath(url.pathname)) {
          serverLog.error("Backend proxy failed", {
            event: "admin.proxy.error",
            error,
            metadata: {
              path: url.pathname,
              method: request.method,
              durationMs: Date.now() - started,
            },
          });
        }
        throw error;
      }
    },
  );
}

export async function proxyRouteToBackend(request: Request): Promise<Response> {
  const denied = await assertAdminProxyAccess(request);
  if (denied) return denied;
  return proxyOnce(request);
}

/** Use when handler must return NextResponse (e.g. cookie mutations). */
export async function proxyRouteToBackendNext(request: Request): Promise<NextResponse> {
  const denied = await assertAdminProxyAccess(request);
  if (denied) return denied as NextResponse;
  const res = await proxyOnce(request);
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
