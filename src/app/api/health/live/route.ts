import { jsonOk } from "@/lib/api-response";

/** Liveness probe — process is running. */
export async function GET() {
  return jsonOk({
    service: "pranidoctor-web",
    probe: "live",
    status: "alive",
  });
}
