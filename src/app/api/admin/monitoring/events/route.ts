import { jsonError, jsonOk } from "@/lib/api-response";
import { serverLog } from "@/lib/logging/server-logger";
import { resolveRequestCorrelation } from "@/lib/logging/correlation";
import { requireAdminPanelApiAccess } from "@/lib/admin-auth/api-guard";
import type { AdminClientMonitorEvent } from "@/lib/monitoring/admin-events";
import { isAdminMonitoringEnabled } from "@/lib/monitoring/admin-monitoring-config";

type IngestBody = {
  events?: AdminClientMonitorEvent[];
};

function logIngestedEvent(
  event: AdminClientMonitorEvent,
  requestId: string,
  correlationId: string,
): void {
  const level =
    event.level === "error" ? "error" : event.level === "warn" ? "warn" : "info";
  serverLog[level](event.message, {
    event: event.event,
    requestId,
    correlationId: event.correlationId ?? correlationId,
    metadata: {
      ...event.metadata,
      clientTimestamp: event.timestamp,
      ingest: "client",
    },
  });
}

/** Accept structured client monitoring events for centralized log shipping. */
export async function POST(request: Request) {
  if (!isAdminMonitoringEnabled()) {
    return jsonOk({ accepted: 0 });
  }

  const denied = await requireAdminPanelApiAccess();
  if (denied) return denied;

  let body: IngestBody;
  try {
    body = (await request.json()) as IngestBody;
  } catch {
    return jsonError("INVALID_BODY", "Expected JSON body", 400);
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, 20) : [];
  if (events.length === 0) {
    return jsonOk({ accepted: 0 });
  }

  const ids = resolveRequestCorrelation(request.headers);

  for (const event of events) {
    if (!event?.event || !event.message) continue;
    logIngestedEvent(event, ids.requestId, ids.correlationId);
  }

  return jsonOk({ accepted: events.length });
}
