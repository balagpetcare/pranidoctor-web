import { jsonError, jsonOk } from "@/lib/api-response";
import { fetchBackendHealth } from "@/lib/api-client";

export async function GET() {
  const timestamp = new Date().toISOString();
  const backend = await fetchBackendHealth();
  if (!backend.ok) {
    return jsonError(
      "BACKEND_UNAVAILABLE",
      "Backend API unreachable. Check NEXT_PUBLIC_API_URL / BACKEND_URL.",
      503,
    );
  }
  return jsonOk({
    service: "Prani Doctor Admin API",
    timestamp,
    scope: "admin",
    mode: "api-consumer",
    backend: "up",
    database: "via-backend",
  });
}
