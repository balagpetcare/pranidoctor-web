import { captureClientException } from "@/lib/monitoring/error-tracking-client";
import { clientLog } from "@/lib/logging/client-logger";

function isAdminSurface(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path === "/admin" || path.startsWith("/admin/") || path === "/enterprise" || path.startsWith("/enterprise/");
}

function installClientErrorHandlers(): void {
  if (!isAdminSurface()) return;

  clientLog.info("Admin client observability initialized", {
    event: "observability.client.init",
  });

  window.addEventListener("error", (event) => {
    captureClientException(event.error ?? event.message, {
      source: "client",
      tags: { kind: "window.error" },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureClientException(event.reason, {
      source: "client",
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
