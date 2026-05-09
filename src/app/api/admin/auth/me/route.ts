import { jsonError, jsonOk } from "@/lib/api-response";
import { resolveAdminPanelActor } from "@/lib/admin-auth/panel-access";
import { getAdminSession } from "@/lib/admin-auth/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return jsonError("UNAUTHORIZED", "Not signed in", 401);
  }

  const actor = await resolveAdminPanelActor(session);
  if (!actor) {
    return jsonError("FORBIDDEN", "Admin panel access required", 403);
  }

  return jsonOk({
    user: {
      id: actor.id,
      email: actor.email,
      displayName: actor.displayName,
    },
  });
}
