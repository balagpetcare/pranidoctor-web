"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminMonitoringEvent } from "@/lib/monitoring/admin-events";
import { trackAdminPageFailure } from "@/lib/monitoring/admin-monitoring-client";
import { captureClientException } from "@/lib/monitoring/error-tracking-client";

type AdminErrorBoundaryProps = Readonly<{
  children: ReactNode;
  scope?: "admin" | "enterprise";
}>;

type AdminErrorBoundaryState = {
  hasError: boolean;
};

export class AdminErrorBoundary extends Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  state: AdminErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AdminErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    trackAdminPageFailure("error_boundary", error, {
      scope: this.props.scope ?? "admin",
      componentStack: info.componentStack,
    });
    captureClientException(error, {
      source: "client",
      event: AdminMonitoringEvent.PAGE_FAILURE,
      message: "Admin UI error boundary caught an error",
      tags: {
        kind: "error_boundary",
        scope: this.props.scope ?? "admin",
      },
      digest: info.componentStack ?? undefined,
    });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <AdminErrorState
          title="Admin panel error"
          message="Something went wrong while rendering this page. You can try again or refresh the browser."
          onRetry={this.handleRetry}
          className="m-6"
        />
      );
    }

    return this.props.children;
  }
}
