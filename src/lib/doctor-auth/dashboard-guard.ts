import { redirect } from "next/navigation";

import { resolveDoctorPanelActor } from "./panel-access";
import { getDoctorSession } from "./session";

/**
 * Server-side gate for the doctor dashboard route group. Complements Edge middleware
 * with a Prisma-backed check so revoked or suspended users cannot render the shell.
 */
export async function ensureDoctorDashboardAccess(): Promise<void> {
  const session = await getDoctorSession();
  if (!session) {
    redirect("/doctor/login");
  }

  const actor = await resolveDoctorPanelActor(session);
  if (!actor) {
    redirect("/api/doctor/auth/session-invalid");
  }
}
