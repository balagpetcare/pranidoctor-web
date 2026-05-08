import { prisma } from "@/lib/prisma";
import {
  BillingRecordStatus,
  ServiceRequestStatus,
  TreatmentRecordStatus,
} from "@/generated/prisma/client";

export type AdminDashboardStats = {
  totalDoctors: number;
  totalCustomers: number;
  totalServiceRequests: number;
  pendingRequests: number;
  completedTreatments: number;
  totalRevenueDisplay: string;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const pendingStatuses: ServiceRequestStatus[] = [
    ServiceRequestStatus.SUBMITTED,
    ServiceRequestStatus.ASSIGNED,
    ServiceRequestStatus.IN_PROGRESS,
  ];

  const revenueStatuses: BillingRecordStatus[] = [
    BillingRecordStatus.ISSUED,
    BillingRecordStatus.PAID,
  ];

  const [
    totalDoctors,
    totalCustomers,
    totalServiceRequests,
    pendingRequests,
    completedTreatments,
    revenueAgg,
  ] = await Promise.all([
    prisma.doctorProfile.count(),
    prisma.customerProfile.count(),
    prisma.serviceRequest.count(),
    prisma.serviceRequest.count({
      where: { status: { in: pendingStatuses } },
    }),
    prisma.treatmentRecord.count({
      where: { status: TreatmentRecordStatus.FINALIZED },
    }),
    prisma.billingRecord.aggregate({
      _sum: { total: true },
      where: { status: { in: revenueStatuses } },
    }),
  ]);

  const sum = revenueAgg._sum.total;
  const amount = sum == null ? 0 : Number(sum);
  const totalRevenueDisplay = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

  return {
    totalDoctors,
    totalCustomers,
    totalServiceRequests,
    pendingRequests,
    completedTreatments,
    totalRevenueDisplay,
  };
}