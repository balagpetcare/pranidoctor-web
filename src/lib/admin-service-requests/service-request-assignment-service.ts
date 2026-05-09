import {
  ProviderStatus,
  ServiceRequestStatus,
  UserStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { adminGetServiceRequest } from "./service-request-admin-service";
import type { AdminServiceRequestDto } from "./service-request-admin-service";

const TERMINAL: ServiceRequestStatus[] = [
  ServiceRequestStatus.COMPLETED,
  ServiceRequestStatus.CANCELLED,
  ServiceRequestStatus.REJECTED,
];

async function assertAssignableDoctor(
  doctorProfileId: string,
): Promise<boolean> {
  const row = await prisma.doctorProfile.findFirst({
    where: {
      id: doctorProfileId,
      providerStatus: ProviderStatus.ACTIVE,
      user: { status: UserStatus.ACTIVE },
    },
    select: { id: true },
  });
  return Boolean(row);
}

async function assertAssignableTechnician(
  technicianProfileId: string,
): Promise<boolean> {
  const row = await prisma.aiTechnicianProfile.findFirst({
    where: {
      id: technicianProfileId,
      providerStatus: ProviderStatus.ACTIVE,
      user: { status: UserStatus.ACTIVE },
    },
    select: { id: true },
  });
  return Boolean(row);
}

export type AssignServiceRequestDoctorResult =
  | { ok: "UPDATED"; request: AdminServiceRequestDto }
  | { ok: "NOT_FOUND" }
  | { ok: "INVALID_DOCTOR" }
  | { ok: "TERMINAL_STATUS"; status: ServiceRequestStatus }
  | { ok: "INVALID_TRANSITION"; status: ServiceRequestStatus };

/**
 * Assigns or replaces the doctor on a service request and ensures status is ASSIGNED
 * when the request was PENDING, or remains in an assignable pre-completion state.
 *
 * Rules (MVP): not COMPLETED/CANCELLED/REJECTED; from PENDING or ASSIGNED only for
 * doctor swap before acceptance; ACCEPTED/IN_PROGRESS only if same doctor (no-op refresh).
 */
export async function assignDoctorToServiceRequest(
  serviceRequestId: string,
  doctorProfileId: string,
): Promise<AssignServiceRequestDoctorResult> {
  const doctorOk = await assertAssignableDoctor(doctorProfileId);
  if (!doctorOk) {
    return { ok: "INVALID_DOCTOR" };
  }

  const req = await prisma.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    select: {
      id: true,
      status: true,
      assignedDoctorId: true,
    },
  });

  if (!req) {
    return { ok: "NOT_FOUND" };
  }

  if (TERMINAL.includes(req.status)) {
    return { ok: "TERMINAL_STATUS", status: req.status };
  }

  if (
    req.status === ServiceRequestStatus.ACCEPTED ||
    req.status === ServiceRequestStatus.IN_PROGRESS
  ) {
    if (req.assignedDoctorId !== doctorProfileId) {
      return { ok: "INVALID_TRANSITION", status: req.status };
    }
    const dto = await adminGetServiceRequest(serviceRequestId);
    return dto ? { ok: "UPDATED", request: dto } : { ok: "NOT_FOUND" };
  }

  if (
    req.status !== ServiceRequestStatus.PENDING &&
    req.status !== ServiceRequestStatus.ASSIGNED
  ) {
    return { ok: "INVALID_TRANSITION", status: req.status };
  }

  await prisma.serviceRequest.update({
    where: { id: serviceRequestId },
    data: {
      assignedDoctorId: doctorProfileId,
      status: ServiceRequestStatus.ASSIGNED,
      assignedAt: new Date(),
    },
  });

  const dto = await adminGetServiceRequest(serviceRequestId);
  return dto ? { ok: "UPDATED", request: dto } : { ok: "NOT_FOUND" };
}

export type AssignServiceRequestTechnicianResult =
  | { ok: "UPDATED"; request: AdminServiceRequestDto }
  | { ok: "NOT_FOUND" }
  | { ok: "INVALID_TECHNICIAN" }
  | { ok: "TERMINAL_STATUS"; status: ServiceRequestStatus }
  | { ok: "INVALID_TRANSITION"; status: ServiceRequestStatus };

/**
 * Assigns or replaces the AI technician on a service request.
 * Same status rules as doctor assignment (MVP).
 */
export async function assignTechnicianToServiceRequest(
  serviceRequestId: string,
  technicianProfileId: string,
): Promise<AssignServiceRequestTechnicianResult> {
  const techOk = await assertAssignableTechnician(technicianProfileId);
  if (!techOk) {
    return { ok: "INVALID_TECHNICIAN" };
  }

  const req = await prisma.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    select: {
      id: true,
      status: true,
      assignedTechnicianId: true,
    },
  });

  if (!req) {
    return { ok: "NOT_FOUND" };
  }

  if (TERMINAL.includes(req.status)) {
    return { ok: "TERMINAL_STATUS", status: req.status };
  }

  if (
    req.status === ServiceRequestStatus.ACCEPTED ||
    req.status === ServiceRequestStatus.IN_PROGRESS
  ) {
    if (req.assignedTechnicianId === technicianProfileId) {
      const dto = await adminGetServiceRequest(serviceRequestId);
      return dto ? { ok: "UPDATED", request: dto } : { ok: "NOT_FOUND" };
    }
    if (req.assignedTechnicianId == null) {
      await prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: {
          assignedTechnicianId: technicianProfileId,
          assignedAt: new Date(),
        },
      });
      const dto = await adminGetServiceRequest(serviceRequestId);
      return dto ? { ok: "UPDATED", request: dto } : { ok: "NOT_FOUND" };
    }
    return { ok: "INVALID_TRANSITION", status: req.status };
  }

  if (
    req.status !== ServiceRequestStatus.PENDING &&
    req.status !== ServiceRequestStatus.ASSIGNED
  ) {
    return { ok: "INVALID_TRANSITION", status: req.status };
  }

  await prisma.serviceRequest.update({
    where: { id: serviceRequestId },
    data: {
      assignedTechnicianId: technicianProfileId,
      status: ServiceRequestStatus.ASSIGNED,
      assignedAt: new Date(),
    },
  });

  const dto = await adminGetServiceRequest(serviceRequestId);
  return dto ? { ok: "UPDATED", request: dto } : { ok: "NOT_FOUND" };
}
