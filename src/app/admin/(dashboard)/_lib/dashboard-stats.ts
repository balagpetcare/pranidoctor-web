import { prisma } from "@/lib/prisma";
import {
  BillingStatus,
  ServiceRequestStatus,
  ServiceRequestType,
  TreatmentCaseStatus,
} from "@/generated/prisma/client";

export type AdminDashboardStats = {
  totalDoctors: number;
  totalAiTechnicians: number;
  totalCustomers: number;
  totalServiceRequests: number;
  pendingRequests: number;
  /** `ServiceRequest.status === COMPLETED` */
  completedServiceRequests: number;
  completedTreatments: number;
  /** Billing totals where status is issued, partially paid, or paid (existing definition). */
  totalRevenueDisplay: string;
  /** Sum of billing `total` where status is `PAID` only (collection). */
  paidRevenueDisplay: string;
};

export type AdminDashboardRecentRequestRow = {
  id: string;
  status: ServiceRequestStatus;
  serviceType: ServiceRequestType;
  submittedAt: Date;
  customerDisplayName: string | null;
};

export type AdminDashboardPageData = {
  stats: AdminDashboardStats;
  recentRequests: AdminDashboardRecentRequestRow[];
  unreadNotifications: number;
};

const pendingStatuses: ServiceRequestStatus[] = [
  ServiceRequestStatus.PENDING,
  ServiceRequestStatus.ACCEPTED,
  ServiceRequestStatus.ASSIGNED,
  ServiceRequestStatus.IN_PROGRESS,
];

const revenueStatuses: BillingStatus[] = [
  BillingStatus.ISSUED,
  BillingStatus.PARTIALLY_PAID,
  BillingStatus.PAID,
];

function formatBdt(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    totalDoctors,
    totalAiTechnicians,
    totalCustomers,
    totalServiceRequests,
    pendingRequests,
    completedServiceRequests,
    completedTreatments,
    revenueAgg,
    paidAgg,
  ] = await Promise.all([
    prisma.doctorProfile.count(),
    prisma.aiTechnicianProfile.count(),
    prisma.customerProfile.count(),
    prisma.serviceRequest.count(),
    prisma.serviceRequest.count({
      where: { status: { in: pendingStatuses } },
    }),
    prisma.serviceRequest.count({
      where: { status: ServiceRequestStatus.COMPLETED },
    }),
    prisma.treatmentCase.count({
      where: { status: TreatmentCaseStatus.FINALIZED },
    }),
    prisma.billingRecord.aggregate({
      _sum: { total: true },
      where: { status: { in: revenueStatuses } },
    }),
    prisma.billingRecord.aggregate({
      _sum: { total: true },
      where: { status: BillingStatus.PAID },
    }),
  ]);

  const sum = revenueAgg._sum.total;
  const amount = sum == null ? 0 : Number(sum);
  const paidSum = paidAgg._sum.total;
  const paidAmount = paidSum == null ? 0 : Number(paidSum);

  return {
    totalDoctors,
    totalAiTechnicians,
    totalCustomers,
    totalServiceRequests,
    pendingRequests,
    completedServiceRequests,
    completedTreatments,
    totalRevenueDisplay: formatBdt(amount),
    paidRevenueDisplay: formatBdt(paidAmount),
  };
}

const RECENT_LIMIT = 8;

export async function getAdminDashboardPageData(
  adminUserId: string | undefined,
): Promise<AdminDashboardPageData> {
  const [stats, recentRows, unreadNotifications] = await Promise.all([
    getAdminDashboardStats(),
    prisma.serviceRequest.findMany({
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
      take: RECENT_LIMIT,
      select: {
        id: true,
        status: true,
        serviceType: true,
        submittedAt: true,
        customer: { select: { displayName: true } },
      },
    }),
    adminUserId
      ? prisma.notification.count({
          where: { userId: adminUserId, readAt: null },
        })
      : Promise.resolve(0),
  ]);

  const recentRequests: AdminDashboardRecentRequestRow[] = recentRows.map((r) => ({
    id: r.id,
    status: r.status,
    serviceType: r.serviceType,
    submittedAt: r.submittedAt,
    customerDisplayName: r.customer.displayName,
  }));

  return { stats, recentRequests, unreadNotifications };
}
