/**
 * Mobile customer profile — `GET` / `PATCH` `/api/mobile/me`.
 *
 * `area` is stored under `CustomerProfile.addressJson.areaLabel` (string) for MVP;
 * no Prisma schema migration required.
 */
import { jsonError, jsonOk } from "@/lib/api-response";
import { requireMobileCustomer } from "@/lib/mobile-auth/guard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

const patchBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().max(200).optional(),
  area: z.string().trim().min(1).max(500).optional(),
});

function readAreaLabel(addressJson: Prisma.JsonValue | null): string | null {
  if (addressJson == null || typeof addressJson !== "object" || Array.isArray(addressJson)) {
    return null;
  }
  const o = addressJson as Record<string, unknown>;
  const v = o.areaLabel ?? o.area ?? o.label;
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function serializeMe(user: {
  id: string;
  email: string;
  phone: string | null;
  customerProfile: {
    displayName: string;
    addressJson: Prisma.JsonValue | null;
    profilePhotoUrl: string | null;
    coverPhotoUrl: string | null;
  };
}) {
  const area = readAreaLabel(user.customerProfile.addressJson);
  return {
    id: user.id,
    name: user.customerProfile.displayName,
    phone: user.phone ?? "",
    email: user.email,
    area,
    role: "customer" as const,
    profilePhotoUrl: user.customerProfile.profilePhotoUrl,
    coverPhotoUrl: user.customerProfile.coverPhotoUrl,
  };
}

export async function GET(request: Request) {
  const auth = await requireMobileCustomer(request);
  if (!auth.ok) return auth.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.ctx.userId },
      include: { customerProfile: true },
    });
    if (!user?.customerProfile) {
      return jsonError("NOT_FOUND", "Customer profile missing", 404);
    }
    return jsonOk(serializeMe(user as Parameters<typeof serializeMe>[0]));
  } catch {
    return jsonError("DATABASE_ERROR", "Could not load profile", 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireMobileCustomer(request);
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError("INVALID_JSON", "Request body must be JSON", 400);
  }

  if (json !== null && typeof json === "object" && !Array.isArray(json)) {
    const body = { ...(json as Record<string, unknown>) };
    if (body.email === "") delete body.email;
    json = body;
  }

  const parsed = patchBodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid body", 422, parsed.error.flatten());
  }
  const { name, email, area } = parsed.data;
  if (name === undefined && email === undefined && area === undefined) {
    return jsonError("VALIDATION_ERROR", "No updatable fields provided", 422);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.ctx.userId },
      include: { customerProfile: true },
    });
    if (!user?.customerProfile) {
      return jsonError("NOT_FOUND", "Customer profile missing", 404);
    }

    if (email !== undefined) {
      const clash = await prisma.user.findFirst({
        where: { email, NOT: { id: user.id } },
        select: { id: true },
      });
      if (clash) {
        return jsonError("EMAIL_IN_USE", "This email is already registered", 409);
      }
    }

    const existingJson =
      user.customerProfile.addressJson &&
      typeof user.customerProfile.addressJson === "object" &&
      !Array.isArray(user.customerProfile.addressJson)
        ? (user.customerProfile.addressJson as Record<string, unknown>)
        : {};

    let nextAddress: Prisma.InputJsonValue | undefined;
    if (area !== undefined) {
      nextAddress = { ...existingJson, areaLabel: area };
    }

    await prisma.$transaction(async (tx) => {
      if (email !== undefined) {
        await tx.user.update({
          where: { id: user.id },
          data: { email },
        });
      }
      if (name !== undefined || nextAddress !== undefined) {
        await tx.customerProfile.update({
          where: { id: user.customerProfile!.id },
          data: {
            ...(name !== undefined ? { displayName: name } : {}),
            ...(nextAddress !== undefined ? { addressJson: nextAddress } : {}),
          },
        });
      }
    });

    const fresh = await prisma.user.findUnique({
      where: { id: auth.ctx.userId },
      include: { customerProfile: true },
    });
    if (!fresh?.customerProfile) {
      return jsonError("NOT_FOUND", "Customer profile missing", 404);
    }
    return jsonOk(serializeMe(fresh as Parameters<typeof serializeMe>[0]));
  } catch {
    return jsonError("DATABASE_ERROR", "Could not update profile", 500);
  }
}
