import {
  AiTechnicianServiceStatus,
  AiTechnicianStatus,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  CreateAiTechnicianServiceBody,
  PatchAiTechnicianServiceBody,
} from "./technician-services-schemas";

function toDecimal(
  v: number | string,
): Prisma.Decimal {
  const s = typeof v === "number" ? String(v) : v.trim();
  return new Prisma.Decimal(s);
}

async function getTechnicianProfileIdForUser(userId: string) {
  return prisma.aiTechnicianProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      status: true,
    },
  });
}

export function canManageTechnicianServices(
  status: AiTechnicianStatus,
): boolean {
  return status === AiTechnicianStatus.APPROVED || status === AiTechnicianStatus.PUBLISHED;
}

export function serializeAiTechnicianService(
  row: Prisma.AiTechnicianServiceGetPayload<Record<string, never>>,
) {
  return {
    id: row.id,
    aiTechnicianId: row.aiTechnicianId,
    title: row.title,
    animalType: row.animalType,
    breedOrSemenType: row.breedOrSemenType,
    description: row.description,
    basePrice: row.basePrice.toString(),
    visitFee: row.visitFee?.toString() ?? null,
    emergencyFee: row.emergencyFee?.toString() ?? null,
    repeatServicePolicy: row.repeatServicePolicy,
    followUpIncluded: row.followUpIncluded,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listTechnicianServicesForMobileUser(userId: string) {
  const profile = await getTechnicianProfileIdForUser(userId);
  if (!profile) {
    return { ok: true as const, services: [] };
  }
  const rows = await prisma.aiTechnicianService.findMany({
    where: { aiTechnicianId: profile.id },
    orderBy: [{ updatedAt: "desc" }],
  });
  return { ok: true as const, services: rows.map(serializeAiTechnicianService) };
}

export async function createTechnicianServiceForMobileUser(
  userId: string,
  body: CreateAiTechnicianServiceBody,
) {
  const profile = await prisma.aiTechnicianProfile.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });
  if (!profile) {
    return { ok: "NO_PROFILE" as const };
  }
  if (!canManageTechnicianServices(profile.status)) {
    return { ok: "NOT_ALLOWED" as const, status: profile.status };
  }

  const created = await prisma.aiTechnicianService.create({
    data: {
      aiTechnicianId: profile.id,
      title: body.title.trim(),
      animalType: body.animalType,
      breedOrSemenType: body.breedOrSemenType?.trim() || null,
      description: body.description?.trim() || null,
      basePrice: toDecimal(body.basePrice),
      visitFee:
        body.visitFee === undefined || body.visitFee === null
          ? null
          : toDecimal(body.visitFee),
      emergencyFee:
        body.emergencyFee === undefined || body.emergencyFee === null
          ? null
          : toDecimal(body.emergencyFee),
      repeatServicePolicy: body.repeatServicePolicy?.trim() || null,
      followUpIncluded: body.followUpIncluded ?? false,
      status: AiTechnicianServiceStatus.DRAFT,
    },
  });

  return { ok: true as const, service: serializeAiTechnicianService(created) };
}

export async function patchTechnicianServiceForMobileUser(
  userId: string,
  serviceId: string,
  body: PatchAiTechnicianServiceBody,
) {
  const profile = await prisma.aiTechnicianProfile.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });
  if (!profile) {
    return { ok: "NO_PROFILE" as const };
  }
  if (!canManageTechnicianServices(profile.status)) {
    return { ok: "NOT_ALLOWED" as const, status: profile.status };
  }

  const existing = await prisma.aiTechnicianService.findFirst({
    where: { id: serviceId, aiTechnicianId: profile.id },
  });
  if (!existing) {
    return { ok: "NOT_FOUND" as const };
  }

  if (
    existing.status === AiTechnicianServiceStatus.ACTIVE ||
    existing.status === AiTechnicianServiceStatus.REJECTED ||
    existing.status === AiTechnicianServiceStatus.INACTIVE
  ) {
    return { ok: "NOT_EDITABLE" as const, status: existing.status };
  }

  const data: Prisma.AiTechnicianServiceUpdateInput = {};
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.animalType !== undefined) data.animalType = body.animalType;
  if (body.breedOrSemenType !== undefined) {
    data.breedOrSemenType = body.breedOrSemenType?.trim() || null;
  }
  if (body.description !== undefined) {
    data.description = body.description?.trim() || null;
  }
  if (body.basePrice !== undefined) data.basePrice = toDecimal(body.basePrice);
  if (body.visitFee !== undefined) {
    data.visitFee =
      body.visitFee === null ? null : toDecimal(body.visitFee);
  }
  if (body.emergencyFee !== undefined) {
    data.emergencyFee =
      body.emergencyFee === null ? null : toDecimal(body.emergencyFee);
  }
  if (body.repeatServicePolicy !== undefined) {
    data.repeatServicePolicy = body.repeatServicePolicy?.trim() || null;
  }
  if (body.followUpIncluded !== undefined) {
    data.followUpIncluded = body.followUpIncluded;
  }

  if (Object.keys(data).length === 0) {
    return { ok: true as const, service: serializeAiTechnicianService(existing) };
  }

  const updated = await prisma.aiTechnicianService.update({
    where: { id: serviceId },
    data,
  });

  return { ok: true as const, service: serializeAiTechnicianService(updated) };
}

export async function deactivateTechnicianServiceForMobileUser(
  userId: string,
  serviceId: string,
) {
  const profile = await prisma.aiTechnicianProfile.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });
  if (!profile) {
    return { ok: "NO_PROFILE" as const };
  }
  if (!canManageTechnicianServices(profile.status)) {
    return { ok: "NOT_ALLOWED" as const, status: profile.status };
  }

  const existing = await prisma.aiTechnicianService.findFirst({
    where: { id: serviceId, aiTechnicianId: profile.id },
  });
  if (!existing) {
    return { ok: "NOT_FOUND" as const };
  }

  if (existing.status === AiTechnicianServiceStatus.INACTIVE) {
    return { ok: true as const, service: serializeAiTechnicianService(existing) };
  }

  const updated = await prisma.aiTechnicianService.update({
    where: { id: serviceId },
    data: { status: AiTechnicianServiceStatus.INACTIVE },
  });

  return { ok: true as const, service: serializeAiTechnicianService(updated) };
}

export async function patchTechnicianSettingsForMobileUser(
  userId: string,
  acceptsEmergency: boolean,
) {
  const profile = await prisma.aiTechnicianProfile.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });
  if (!profile) {
    return { ok: "NO_PROFILE" as const };
  }
  if (profile.status !== AiTechnicianStatus.PUBLISHED) {
    return { ok: "NOT_PUBLISHED" as const };
  }

  await prisma.aiTechnicianProfile.update({
    where: { id: profile.id },
    data: { acceptsEmergency },
  });

  return { ok: true as const };
}
