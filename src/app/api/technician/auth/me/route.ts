import { jsonError, jsonOk } from "@/lib/api-response";
import { resolveTechnicianPanelActor } from "@/lib/technician-auth/panel-access";
import { getTechnicianSession } from "@/lib/technician-auth/session";

export async function GET() {
  const session = await getTechnicianSession();
  if (!session) {
    return jsonError("UNAUTHORIZED", "Not signed in", 401);
  }

  const actor = await resolveTechnicianPanelActor(session);
  if (!actor) {
    return jsonError("FORBIDDEN", "Technician panel access required", 403);
  }

  return jsonOk({
    user: {
      id: actor.userId,
      email: actor.email,
      displayName: actor.displayName,
      aiTechnicianProfileId: actor.aiTechnicianProfileId,
    },
  });
}
