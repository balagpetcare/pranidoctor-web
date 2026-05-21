import { jsonError, jsonOk } from "@/lib/api-response";
import { fetchBackendHealth } from "@/lib/api-client";

/**
 * Public ops probe: web shell + backend API connectivity (no direct DB).
 */
export async function GET() {
  const backend = await fetchBackendHealth();
  if (!backend.ok) {
    return jsonError(
      "backend_unavailable",
      backend.error || "Backend API unreachable",
      503,
    );
  }

  const healthy =
    backend.data?.status === "healthy" ||
    backend.data?.status === "degraded" ||
    backend.data?.alive === true;

  if (!healthy) {
    return jsonError("backend_unhealthy", "Backend health check failed", 503);
  }

  return jsonOk({
    service: "pranidoctor-web",
    status: "ok",
    mode: "api-consumer",
    backend: "up",
    database: "via-backend",
  });
}
