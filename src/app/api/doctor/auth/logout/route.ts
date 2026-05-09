import { clearDoctorSessionCookie } from "@/lib/doctor-auth/cookies";
import { jsonOk } from "@/lib/api-response";

export async function POST() {
  const res = jsonOk({ signedOut: true });
  clearDoctorSessionCookie(res);
  return res;
}
