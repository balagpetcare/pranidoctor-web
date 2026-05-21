import "server-only";

import { serverLog } from "@/lib/logging/server-logger";

import { sendAlert } from "./alerts";
import {
  getErrorTrackingProvider,
  getMonitoringAlertWebhookUrl,
  isErrorTrackingEnabled,
} from "./config";
import type { ErrorTrackingContext } from "./error-tracking-types";

export type { ErrorTrackingContext } from "./error-tracking-types";

function serializeError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { name: "Error", message: String(error) };
}

async function postWebhookEvent(
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const webhookUrl = getMonitoringAlertWebhookUrl();
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        service: "pranidoctor-web-admin",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch (error) {
    serverLog.error("Error tracking webhook delivery failed", {
      event: "monitoring.error_tracking.webhook_failed",
      error,
      metadata: { eventName: event },
    });
  }
}

export function captureException(
  error: unknown,
  context: ErrorTrackingContext = {},
): void {
  if (!isErrorTrackingEnabled()) return;

  const serialized = serializeError(error);
  const provider = getErrorTrackingProvider();

  if (provider === "noop") return;

  if (provider === "console") {
    serverLog.error("Captured server exception", {
      event: "error_tracking.exception",
      error,
      metadata: { ...context, errorName: serialized.name },
      requestId: context.requestId,
      correlationId: context.correlationId,
    });
    return;
  }

  void postWebhookEvent("exception", {
    error: serialized,
    context,
  });
  void sendAlert(
    "Unhandled admin error",
    serialized.message,
    "critical",
    { ...context, errorName: serialized.name },
  );
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context: ErrorTrackingContext = {},
): void {
  if (!isErrorTrackingEnabled()) return;

  const provider = getErrorTrackingProvider();
  if (provider === "noop") return;

  if (provider === "console") {
    serverLog[level === "error" ? "error" : level === "warning" ? "warn" : "info"](message, {
      event: "error_tracking.message",
      metadata: context,
      requestId: context.requestId,
      correlationId: context.correlationId,
    });
    return;
  }

  void postWebhookEvent("message", { level, message, context });
}

export function initErrorTracking(): void {
  if (!isErrorTrackingEnabled()) return;
  captureMessage("Error tracking initialized", "info", {
    source: "server",
    tags: { provider: getErrorTrackingProvider() },
  });
}
