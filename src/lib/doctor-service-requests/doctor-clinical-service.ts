import {
  Prisma,
  PrescriptionStatus,
  ServiceRequestStatus,
  TreatmentCaseStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  CreateDoctorPrescriptionBody,
  CreateDoctorTreatmentBody,
} from "./clinical-schemas";
import { DOCTOR_CLINICAL_REQUEST_STATUSES } from "./clinical-constants";

export type DoctorClinicalAccessResult =
  | { ok: "ALLOWED"; animalId: string; status: ServiceRequestStatus }
  | { ok: "NOT_FOUND" }
  | { ok: "INVALID_STATUS"; status: ServiceRequestStatus };

export async function assertDoctorClinicalCaseAccess(
  doctorProfileId: string,
  requestId: string,
): Promise<DoctorClinicalAccessResult> {
  const req = await prisma.serviceRequest.findFirst({
    where: { id: requestId, assignedDoctorId: doctorProfileId },
    select: { animalId: true, status: true },
  });
  if (!req) return { ok: "NOT_FOUND" };
  if (!DOCTOR_CLINICAL_REQUEST_STATUSES.includes(req.status)) {
    return { ok: "INVALID_STATUS", status: req.status };
  }
  return { ok: "ALLOWED", animalId: req.animalId, status: req.status };
}

function parseOptionalDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildPrescriptionItemInstruction(
  item: CreateDoctorPrescriptionBody["items"][number],
): string | null {
  const parts = [
    item.instruction?.trim(),
    item.frequency?.trim()
      ? `Frequency: ${item.frequency.trim()}`
      : null,
    item.note?.trim() ? `Note: ${item.note.trim()}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join("\n") : null;
}

function parseOptionalQuantity(
  raw: string | undefined,
): Prisma.Decimal | null {
  if (!raw?.trim()) return null;
  try {
    return new Prisma.Decimal(raw.trim());
  } catch {
    return null;
  }
}

export type DoctorTreatmentSummaryDto = {
  id: string;
  status: TreatmentCaseStatus;
  chiefComplaint: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  procedures: string | null;
  treatmentNotes: string | null;
  followUpNotes: string | null;
  followUpDate: string | null;
  recordedAt: string;
  updatedAt: string;
};

export type DoctorPrescriptionItemDto = {
  id: string;
  medicineName: string;
  dosage: string | null;
  duration: string | null;
  instruction: string | null;
  quantity: string | null;
};

export type DoctorPrescriptionSummaryDto = {
  id: string;
  status: PrescriptionStatus;
  instructions: string | null;
  validUntil: string | null;
  createdAt: string;
  items: DoctorPrescriptionItemDto[];
};

export function toDoctorTreatmentSummaryDto(row: {
  id: string;
  status: TreatmentCaseStatus;
  chiefComplaint: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  procedures: string | null;
  treatmentNotes: string | null;
  followUpNotes: string | null;
  followUpDate: Date | null;
  recordedAt: Date;
  updatedAt: Date;
}): DoctorTreatmentSummaryDto {
  return {
    id: row.id,
    status: row.status,
    chiefComplaint: row.chiefComplaint,
    symptoms: row.symptoms,
    diagnosis: row.diagnosis,
    procedures: row.procedures,
    treatmentNotes: row.treatmentNotes,
    followUpNotes: row.followUpNotes,
    followUpDate: row.followUpDate?.toISOString() ?? null,
    recordedAt: row.recordedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toDoctorPrescriptionSummaryDto(row: {
  id: string;
  status: PrescriptionStatus;
  instructions: string | null;
  validUntil: Date | null;
  createdAt: Date;
  items?: {
    id: string;
    medicineName: string;
    dosage: string | null;
    duration: string | null;
    instruction: string | null;
    quantity: Prisma.Decimal | null;
  }[];
}): DoctorPrescriptionSummaryDto {
  const items = row.items ?? [];
  return {
    id: row.id,
    status: row.status,
    instructions: row.instructions,
    validUntil: row.validUntil?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    items: items.map((i) => ({
      id: i.id,
      medicineName: i.medicineName,
      dosage: i.dosage,
      duration: i.duration,
      instruction: i.instruction,
      quantity: i.quantity != null ? String(i.quantity) : null,
    })),
  };
}

export async function createTreatmentCaseForDoctor(
  doctorProfileId: string,
  requestId: string,
  body: CreateDoctorTreatmentBody,
): Promise<
  | { ok: "CREATED"; treatment: DoctorTreatmentSummaryDto }
  | DoctorClinicalAccessResult
> {
  const access = await assertDoctorClinicalCaseAccess(doctorProfileId, requestId);
  if (access.ok !== "ALLOWED") return access;

  const followUp = parseOptionalDate(body.followUpDate);

  const created = await prisma.treatmentCase.create({
    data: {
      serviceRequestId: requestId,
      animalId: access.animalId,
      doctorId: doctorProfileId,
      status: TreatmentCaseStatus.FINALIZED,
      chiefComplaint: body.chiefComplaint?.trim() || null,
      symptoms: body.symptoms?.trim() || null,
      diagnosis: body.diagnosis?.trim() || null,
      procedures: body.procedures?.trim() || null,
      treatmentNotes: body.treatmentNotes?.trim() || null,
      followUpNotes: body.followUpNotes?.trim() || null,
      followUpDate: followUp,
    },
  });

  return {
    ok: "CREATED",
    treatment: toDoctorTreatmentSummaryDto(created),
  };
}

export async function createPrescriptionForDoctor(
  doctorProfileId: string,
  requestId: string,
  body: CreateDoctorPrescriptionBody,
): Promise<
  | { ok: "CREATED"; prescription: DoctorPrescriptionSummaryDto }
  | DoctorClinicalAccessResult
> {
  const access = await assertDoctorClinicalCaseAccess(doctorProfileId, requestId);
  if (access.ok !== "ALLOWED") return access;

  const validUntil = parseOptionalDate(body.validUntil);

  const prescription = await prisma.prescription.create({
    data: {
      serviceRequestId: requestId,
      animalId: access.animalId,
      doctorId: doctorProfileId,
      status: PrescriptionStatus.ACTIVE,
      instructions: body.instructions?.trim() || null,
      validUntil,
      items: {
        create: body.items.map((item) => ({
          medicineName: item.medicineName.trim(),
          dosage: item.dosage?.trim() || null,
          duration: item.duration?.trim() || null,
          instruction: buildPrescriptionItemInstruction(item),
          quantity: parseOptionalQuantity(item.quantity),
        })),
      },
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    ok: "CREATED",
    prescription: toDoctorPrescriptionSummaryDto(prescription),
  };
}
