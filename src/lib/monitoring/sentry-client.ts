import {
  getClientSentryDsn,
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate,
  isClientSentryEnabled,
  scrubSentryEvent,
} from "./sentry-config";
import type { ErrorTrackingContext } from "./error-tracking-types";

let clientSentryReady = false;

export function isClientSentryInitialized(): boolean {
  return clientSentryReady;
}

export function initClientSentry(): void {
  if (clientSentryReady || !isClientSentryEnabled()) return;

  const dsn = getClientSentryDsn();
  if (!dsn) return;

  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: getSentryEnvironment(),
        release: getSentryRelease(),
        tracesSampleRate: getSentryTracesSampleRate(),
        sendDefaultPii: false,
        beforeSend: scrubSentryEvent,
      });
      clientSentryReady = true;
    })
    .catch(() => {
      // Client SDK load failure must not break admin UI.
    });
}

export function captureSentryClientException(
  error: unknown,
  context: ErrorTrackingContext = {},
): void {
  if (!clientSentryReady) return;

  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.withScope((scope) => {
        if (context.requestId) scope.setTag("request_id", String(context.requestId));
        if (context.correlationId) {
          scope.setTag("correlation_id", String(context.correlationId));
        }
        if (context.source) scope.setTag("source", String(context.source));
        if (context.route) scope.setTag("route", String(context.route));
        if (context.tags) {
          for (const [key, value] of Object.entries(context.tags)) {
            scope.setTag(key, String(value));
          }
        }
        Sentry.captureException(error);
      });
    })
    .catch(() => {
      // ignore
    });
}
