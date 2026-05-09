import { jsonOk } from "@/lib/api-response";
import { clearTechnicianSessionCookie } from "@/lib/technician-auth/cookies";

export async function POST() {
  const res = jsonOk({ signedOut: true });
  clearTechnicianSessionCookie(res);
  return res;
}
