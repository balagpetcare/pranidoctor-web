import { jsonOk } from "@/lib/api-response";
import { getUptimeSnapshot } from "@/lib/monitoring/health";

/** Lightweight liveness probe — process is running. */
export async function GET() {
  return jsonOk({
    ...getUptimeSnapshot("admin"),
    probe: "live",
  });
}
