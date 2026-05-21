/**
 * Area hierarchy enum values — mirrors Prisma without importing generated client
 * in browser bundles (admin areas UI).
 */
export const AREA_TYPE = {
  DIVISION: "DIVISION",
  DISTRICT: "DISTRICT",
  UPAZILA: "UPAZILA",
  UNION: "UNION",
  VILLAGE: "VILLAGE",
  SERVICE_AREA: "SERVICE_AREA",
} as const;

export type AreaType = (typeof AREA_TYPE)[keyof typeof AREA_TYPE];
