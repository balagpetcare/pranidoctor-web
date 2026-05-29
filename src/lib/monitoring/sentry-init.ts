import "server-only";

import { serverLog } from "@/lib/logging/server-logger";

import {
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate,
  isSentryEnabled,
  scrubSentryEvent,
} from "./sentry-config";

let sentryReady = false;

export function isSentryInitialized(): boolean {
  return sentryReady;
}

export async function initSentry(): Promise<void> {
  if (!isSentryEnabled()) return;

  const dsn = process.env.SENTRY_DSN!.trim();

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      environment: getSentryEnvironment(),
      release: getSentryRelease(),
      tracesSampleRate: getSentryTracesSampleRate(),
      sendDefaultPii: false,
      beforeSend: scrubSentryEvent,
    });
    sentryReady = true;
    serverLog.info("Sentry initialized for admin web", {
      metadata: {
        environment: getSentryEnvironment(),
        release: getSentryRelease(),
      },
    });
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
      if (context.correlationId) {
        scope.setTag("correlation_id", String(context.correlationId));
      }
      if (context.source) scope.setTag("source", String(context.source));
      if (context.digest) scope.setTag("digest", String(context.digest));
      Sentry.captureException(error);
    });
  } catch {
    // ignore
  }
}
