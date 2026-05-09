import type { AreaType } from "@/generated/prisma/browser";

export type AdminAreaParentSummary = {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  type: AreaType;
  isActive: boolean;
};

/** Shape returned by `/api/admin/areas` list and single-area GET. */
export type AdminAreaRow = {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  code: string | null;
  type: AreaType;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadataJson?: unknown;
  parent: AdminAreaParentSummary | null;
  _count: { children: number };
};
