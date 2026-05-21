import { jsonError, jsonOk } from "@/lib/api-response";
import { fetchBackendHealth } from "@/lib/api-client";

export async function GET() {
  const backend = await fetchBackendHealth();
  if (!backend.ok) {
    return jsonError(
      "BACKEND_UNAVAILABLE",
      backend.error || "Backend API unreachable",
      503,
    );
  }
  return jsonOk({
    scope: "mobile",
    mode: "api-consumer",
    backend: "up",
    database: "via-backend",
  });
}
