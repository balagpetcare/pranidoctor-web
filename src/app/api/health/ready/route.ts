import { jsonError, jsonOk } from "@/lib/api-response";
import { fetchBackendHealth } from "@/lib/api-client";

/** Readiness probe — web can serve traffic and backend is reachable. */
export async function GET() {
  const backend = await fetchBackendHealth();
  if (!backend.ok) {
    return jsonError(
      "backend_unavailable",
      backend.error || "Backend API unreachable",
      503,
    );
  }

  const ready =
    backend.data?.status === "healthy" ||
    backend.data?.status === "degraded" ||
    backend.data?.alive === true;

  if (!ready) {
    return jsonError("backend_unhealthy", "Backend not ready", 503);
  }

  return jsonOk({
    service: "pranidoctor-web",
    probe: "ready",
    status: "ok",
    backend: "up",
  });
}
