import { jsonError, jsonOk } from "@/lib/api-response";
import { fetchBackendHealth } from "@/lib/api-client";
import { buildAdminHealthSnapshot } from "@/lib/monitoring/health";

/** Readiness probe — admin web can serve traffic via backend API. */
export async function GET() {
  const backend = await fetchBackendHealth();
  if (!backend.ok) {
    return jsonError(
      "BACKEND_UNAVAILABLE",
      backend.error || "Backend API unreachable",
      503,
    );
  }

  const adminDbUp = backend.data?.database === "up";
  const healthy =
    adminDbUp ||
    backend.data?.status === "healthy" ||
    backend.data?.status === "degraded" ||
    backend.data?.alive === true;

  if (!healthy) {
    return jsonError("BACKEND_UNHEALTHY", "Backend health check failed", 503);
  }

  return jsonOk({
    ...buildAdminHealthSnapshot(true),
    probe: "ready",
  });
}
