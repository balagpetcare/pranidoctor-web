import type { Instrumentation } from "next";

function isEdgeRuntime(): boolean {
  return process.env.NEXT_RUNTIME === "edge";
}

export async function register() {
  if (isEdgeRuntime()) return;

  const { assertProductionEnvOrThrow } = await import("@/lib/env/production-validation");
  const { initErrorTracking } = await import("@/lib/monitoring/error-tracking");
  const { initSentry } = await import("@/lib/monitoring/sentry-init");

  assertProductionEnvOrThrow();
  await initSentry();
  initErrorTracking();
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (isEdgeRuntime()) return;

  const err = error as Error & { digest?: string };
  const headerGetter = {
    get(name: string): string | null {
      const target = name.toLowerCase();
      for (const [key, value] of Object.entries(request.headers)) {
        if (key.toLowerCase() !== target) continue;
        return Array.isArray(value) ? value[0] ?? null : (value ?? null);
      }
      return null;
    },
  };

  const { resolveRequestCorrelation } = await import("@/lib/logging/correlation");
  const { captureException } = await import("@/lib/monitoring/error-tracking");
  const { alertServerError } = await import("@/lib/monitoring/alerts");

  const ids = resolveRequestCorrelation(headerGetter);

  captureException(err, {
    digest: err.digest,
    route: request.path,
    method: request.method,
    source: "server",
    requestId: ids.requestId,
    correlationId: ids.correlationId,
    tags: {
      routeType: context.routeType,
      routerKind: context.routerKind,
    },
  });

  await alertServerError(err.message, {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    digest: err.digest,
    requestId: ids.requestId,
    correlationId: ids.correlationId,
  });
};
