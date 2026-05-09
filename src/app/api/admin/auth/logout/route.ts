import { clearAdminSessionCookie } from "@/lib/admin-auth/cookies";
import { jsonOk } from "@/lib/api-response";

export async function POST() {
  const res = jsonOk({ signedOut: true });
  clearAdminSessionCookie(res);
  return res;
}
