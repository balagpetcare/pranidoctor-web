import { captureClientException } from "@/lib/monitoring/error-tracking-client";
import { initClientSentry } from "@/lib/monitoring/sentry-client";
import { clientLog } from "@/lib/logging/client-logger";
import { getAdminSlowNavThresholdMs } from "@/lib/monitoring/admin-monitoring-config";
import { trackAdminNavigationSlow } from "@/lib/monitoring/admin-monitoring-client";

function isAdminSurface(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path === "/admin" || path.startsWith("/admin/") || path === "/enterprise" || path.startsWith("/enterprise/");
}

function installClientErrorHandlers(): void {
  if (!isAdminSurface()) return;

  initClientSentry();

  clientLog.info("Admin client observability initialized", {
    event: "observability.client.init",
  });

  window.addEventListener("error", (event) => {
    captureClientException(event.error ?? event.message, {
      source: "client",
      event: "admin.page.failure",
      tags: { kind: "window.error" },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureClientException(event.reason, {
      source: "client",
      event: "admin.page.failure",
      tags: { kind: "unhandledrejection" },
    });
  });
}

try {
  installClientErrorHandlers();
} catch (error) {
  clientLog.error("Failed to initialize admin client observability", {
    event: "observability.client.init_failed",
    error,
  });
}

export function onRouterTransitionStart(url: string): void {
  if (!isAdminSurface()) return;
  performance.mark(`admin-nav-start:${url}`);
  clientLog.debug("Admin navigation started", {
    event: "admin.navigation.start",
    metadata: { url },
  });
}

export function onRouterTransitionComplete(url: string): void {
  if (!isAdminSurface()) return;
  const markName = `admin-nav-start:${url}`;
  const marks = performance.getEntriesByName(markName, "mark");
  const startMark = marks[marks.length - 1];
  if (!startMark) return;
  const durationMs = Math.round(performance.now() - startMark.startTime);
  trackAdminNavigationSlow(url, durationMs, getAdminSlowNavThresholdMs());
  performance.clearMarks(markName);
}
