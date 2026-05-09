import { jsonError, jsonOk } from "@/lib/api-response";
import { requireMobileCustomer } from "@/lib/mobile-auth/guard";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireMobileCustomer(request);
  if (!auth.ok) return auth.response;

  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });
    return jsonOk({ categories });
  } catch {
    return jsonError("DATABASE_ERROR", "Could not load service categories", 500);
  }
}
