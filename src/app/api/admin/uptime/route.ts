import { jsonOk } from "@/lib/api-response";
import { getUptimeSnapshot } from "@/lib/monitoring/health";

/**
 * External uptime monitor target (UptimeRobot, Better Uptime, etc.).
 * Returns 200 when the admin web process is alive.
 */
export async function GET() {
  return jsonOk({
    ...getUptimeSnapshot("admin"),
    probe: "uptime",
  });
}
