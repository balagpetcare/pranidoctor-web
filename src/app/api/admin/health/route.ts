import { jsonError, jsonOk } from "@/lib/api-response";
import { fetchBackendHealth } from "@/lib/api-client";
import { alertHealthCheckFailure } from "@/lib/monitoring/alerts";
import { buildAdminHealthSnapshot } from "@/lib/monitoring/health";

export async function GET() {
  const backend = await fetchBackendHealth();
  if (!backend.ok) {
    await alertHealthCheckFailure(
      "/api/admin/health",
      backend.error || "Backend API unreachable",
    );
    return jsonError(
      "BACKEND_UNAVAILABLE",
      "Backend API unreachable. Check NEXT_PUBLIC_API_URL / BACKEND_URL.",
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
    await alertHealthCheckFailure("/api/admin/health", "Backend health check failed");
    return jsonError("BACKEND_UNHEALTHY", "Backend health check failed", 503);
  }

  return jsonOk(buildAdminHealthSnapshot(true));
}
