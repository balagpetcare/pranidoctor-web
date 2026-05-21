import { describe, expect, it, beforeEach } from "vitest";

import type { AdminDashboardPageData } from "@/lib/admin/dashboard/dashboard-types";
import {
  clearDashboardClientCache,
  readDashboardClientCache,
  writeDashboardClientCache,
} from "@/lib/admin/dashboard/dashboard-client-cache";

const sample: AdminDashboardPageData = {
  stats: {
    totalDoctors: 1,
    totalAiTechnicians: 2,
    totalCustomers: 3,
    totalServiceRequests: 4,
    pendingRequests: 1,
    completedServiceRequests: 2,
    completedTreatments: 1,
    totalRevenueDisplay: "৳100",
    paidRevenueDisplay: "৳50",
  },
  recentRequests: [],
  unreadNotifications: 0,
};

describe("dashboard-client-cache", () => {
  beforeEach(() => {
    clearDashboardClientCache();
  });

  it("returns null when empty", () => {
    expect(readDashboardClientCache()).toBeNull();
  });

  it("returns cached data within TTL", () => {
    writeDashboardClientCache(sample);
    expect(readDashboardClientCache()).toEqual(sample);
  });

  it("expires cache after TTL", () => {
    writeDashboardClientCache(sample);
    const now = Date.now();
    const original = Date.now;
    Date.now = () => now + 20_000;
    try {
      expect(readDashboardClientCache()).toBeNull();
    } finally {
      Date.now = original;
    }
  });
});
