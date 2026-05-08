import { jsonError, jsonOk } from "@/lib/api-response";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return jsonError("UNAUTHORIZED", "Not signed in", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      adminProfile: { select: { displayName: true } },
    },
  });

  if (!user) {
    return jsonError("UNAUTHORIZED", "Not signed in", 401);
  }

  return jsonOk({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.adminProfile?.displayName ?? null,
    },
  });
}
