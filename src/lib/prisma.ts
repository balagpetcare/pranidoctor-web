import "server-only";

/**
 * Direct Prisma access is disabled on web (API-consumer mode).
 * Use @/lib/server-internal or @/lib/api-client against pranidoctor-backend.
 */
export type { Prisma } from "@/generated/prisma/client";

const MSG =
  "Web is API-consumer only. Use serverInternalFetch/api-client — DB lives in pranidoctor-backend.";

export const prisma = new Proxy(
  {},
  {
    get() {
      throw new Error(MSG);
    },
  },
) as never;

export async function disconnectPrisma(): Promise<void> {
  /* no-op */
}
