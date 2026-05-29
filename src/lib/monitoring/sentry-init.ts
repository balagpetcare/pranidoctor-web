import "server-only";

import { serverLog } from "@/lib/logging/server-logger";

let sentryReady = false;

export function isSentryInitialized(): boolean {
  return sentryReady;
}

export async function initSentry(): Promise<void> {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? "development",
      release: process.env.APP_VERSION?.trim(),
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    });
    sentryReady = true;
    serverLog.info("Sentry initialized for admin web");
  } catch (error) {
    serverLog.warn("SENTRY_DSN set but @sentry/nextjs failed to load", {
      error,
    });
  }
}

export async function captureSentryException(
  error: unknown,
  context: Record<string, unknown> = {},
): Promise<void> {
  if (!sentryReady) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.withScope((scope) => {
      if (context.requestId) scope.setTag("request_id", String(context.requestId));
      if (context.route) scope.setTag("route", String(context.route));
      Sentry.captureException(error);
    });
  } catch {
    // ignore
  }
}
