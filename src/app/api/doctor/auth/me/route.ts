import { jsonError, jsonOk } from "@/lib/api-response";
import { resolveDoctorPanelActor } from "@/lib/doctor-auth/panel-access";
import { getDoctorSession } from "@/lib/doctor-auth/session";

export async function GET() {
  const session = await getDoctorSession();
  if (!session) {
    return jsonError("UNAUTHORIZED", "Not signed in", 401);
  }

  const actor = await resolveDoctorPanelActor(session);
  if (!actor) {
    return jsonError("FORBIDDEN", "Doctor panel access required", 403);
  }

  return jsonOk({
    user: {
      id: actor.userId,
      email: actor.email,
      displayName: actor.displayName,
      doctorProfileId: actor.doctorProfileId,
    },
  });
}
