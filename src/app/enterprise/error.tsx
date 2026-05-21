"use client";

import { useEffect } from "react";

import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { captureClientException } from "@/lib/monitoring/error-tracking-client";

export default function EnterpriseRouteError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    captureClientException(error, {
      source: "client",
      event: "enterprise.route_error",
      message: "Enterprise route error",
      tags: { kind: "route_error", scope: "enterprise" },
      digest: error.digest,
    });
  }, [error]);

  return (
    <AdminErrorState
      title="Enterprise review error"
      message="This enterprise page failed to load. Try again or contact support if the problem persists."
      onRetry={reset}
      className="m-6"
    />
  );
}
