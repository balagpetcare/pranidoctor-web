/** Mirrors Prisma `ServiceRequestStatus` — no runtime Prisma import. */
export type ServiceRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

/** Mirrors Prisma `ServiceRequestType` — no runtime Prisma import. */
export type ServiceRequestType =
  | "DOCTOR_HOME_VISIT"
  | "EMERGENCY_DOCTOR"
  | "AI_SERVICE"
  | "ONLINE_CONSULTATION_LATER";

export type AdminDashboardChartSlice = {
  key: string;
  label: string;
  value: number;
};

export type AdminDashboardStats = {
  totalDoctors: number;
  totalAiTechnicians: number;
  totalCustomers: number;
  totalServiceRequests: number;
  pendingRequests: number;
  completedServiceRequests: number;
  completedTreatments: number;
  totalRevenueDisplay: string;
  paidRevenueDisplay: string;
  totalRevenueBdt?: number;
  paidRevenueBdt?: number;
  unpaidRevenueBdt?: number;
};

export type AdminDashboardRecentRequestRow = {
  id: string;
  status: ServiceRequestStatus;
  serviceType: ServiceRequestType;
  submittedAt: Date;
  customerDisplayName: string | null;
};

export type AdminDashboardDoctorStats = {
  total: number;
  active: number;
  pendingVerification: number;
  suspended: number;
  rejected: number;
};

export type AdminDashboardRevenue = {
  totalBdt: number;
  paidBdt: number;
  unpaidBdt: number;
  totalDisplay: string;
  paidDisplay: string;
  unpaidDisplay: string;
};

export type AdminDashboardCharts = {
  serviceRequestsByStatus: AdminDashboardChartSlice[];
  serviceRequestsByType: AdminDashboardChartSlice[];
  teamComposition: AdminDashboardChartSlice[];
};

export type AdminDashboardPageData = {
  stats: AdminDashboardStats;
  recentRequests: AdminDashboardRecentRequestRow[];
  unreadNotifications: number;
  charts?: AdminDashboardCharts;
  doctorStats?: AdminDashboardDoctorStats;
  revenue?: AdminDashboardRevenue;
  generatedAt?: Date;
};

export type AdminDashboardApiPayload = {
  stats: AdminDashboardStats;
  recentRequests: Array<
    Omit<AdminDashboardRecentRequestRow, "submittedAt"> & { submittedAt: string }
  >;
  unreadNotifications: number;
  charts?: AdminDashboardCharts;
  doctorStats?: AdminDashboardDoctorStats;
  revenue?: AdminDashboardRevenue;
  generatedAt?: string;
};

export function normalizeDashboardPayload(payload: AdminDashboardApiPayload): AdminDashboardPageData {
  const { stats, recentRequests, unreadNotifications, charts, doctorStats, revenue, generatedAt } =
    payload;

  return {
    stats,
    unreadNotifications,
    charts,
    doctorStats,
    revenue,
    generatedAt: generatedAt ? new Date(generatedAt) : undefined,
    recentRequests: recentRequests.map((r) => ({
      ...r,
      submittedAt: new Date(r.submittedAt),
    })),
  };
}

export const DASHBOARD_REVALIDATE_SECONDS = 30;
