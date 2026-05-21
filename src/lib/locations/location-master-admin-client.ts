import { serverInternalJson } from "@/lib/server-internal";

export type LocationAdminStats = {
  counts: {
    divisions: number;
    districts: number;
    upazilas: number;
    unions: number;
    villages: number;
  };
  pendingVerification: {
    divisions: number;
    districts: number;
    upazilas: number;
    unions: number;
    villages: number;
  };
  missingCoordinates: {
    divisions: number;
    districts: number;
    upazilas: number;
    unions: number;
    villages: number;
  };
  duplicateWarningCounts: {
    divisions: number;
    districts: number;
    upazilas: number;
    unions: number;
    unionVillageNamePairs: number;
  };
};

export async function getLocationAdminStats(): Promise<LocationAdminStats> {
  const res = await serverInternalJson<LocationAdminStats>("/api/admin/locations/stats");
  if (!res.ok) throw new Error(`Location stats failed (${res.status})`);
  return res.data;
}

export type LocationListQuery = {
  level: string;
  limit: number;
};

export type LocationAdminRow = {
  id: string;
  level: string;
  code: string | null;
  nameEn: string;
  nameBn: string | null;
};

type LocationListResponse = { items: LocationAdminRow[] };

export async function listMissingCoords(
  params: LocationListQuery,
): Promise<LocationAdminRow[]> {
  const q = new URLSearchParams({
    level: params.level,
    limit: String(params.limit),
  });
  const res = await serverInternalJson<LocationListResponse>(
    `/api/admin/locations/missing-coords?${q}`,
  );
  if (!res.ok) throw new Error(`Missing coords failed (${res.status})`);
  return res.data.items ?? [];
}

export async function listPendingVerification(
  params: LocationListQuery,
): Promise<LocationAdminRow[]> {
  const q = new URLSearchParams({
    level: params.level,
    limit: String(params.limit),
  });
  const res = await serverInternalJson<LocationListResponse>(
    `/api/admin/locations/pending-verification?${q}`,
  );
  if (!res.ok) throw new Error(`Pending verification failed (${res.status})`);
  return res.data.items ?? [];
}

export type LocationImportReport = {
  generatedAt?: string;
  dryRun?: boolean;
  summary?: {
    missingParent?: number;
    invalidCoordinate?: number;
    pendingVerificationApprox?: number;
    duplicateWarningsTotal?: number;
    missingCoordinatesInDb?: number | null;
  };
  unions?: { imported?: number; updated?: number; invalid?: number };
  villages?: { imported?: number; updated?: number; invalid?: number };
};

export async function getLocationImportReport(): Promise<LocationImportReport | null> {
  const res = await serverInternalJson<{ report: LocationImportReport | null }>(
    "/api/admin/locations/import-report",
  );
  if (!res.ok) return null;
  return res.data.report ?? null;
}

