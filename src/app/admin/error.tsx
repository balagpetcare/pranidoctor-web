"use client";

import { useEffect } from "react";

import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminMonitoringEvent } from "@/lib/monitoring/admin-events";
import { captureClientException } from "@/lib/monitoring/error-tracking-client";

export default function AdminRouteError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    captureClientException(error, {
      source: "client",
      event: AdminMonitoringEvent.PAGE_FAILURE,
      message: "Admin route error",
      tags: { kind: "route_error", scope: "admin" },
      digest: error.digest,
    });
  }, [error]);

  return (
    <AdminErrorState
      title="Admin panel error"
      message="This admin page failed to load. Try again or contact support if the problem persists."
      onRetry={reset}
      className="m-6"
    />
  );
}
