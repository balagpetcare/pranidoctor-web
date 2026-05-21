import { serverInternalJson } from "@/lib/server-internal";

export type SerializedSemenTemplate = {
  id: string;
  internalName: string;
  animalType: string;
  semenProductKind: string;
  otherSemenLabel: string | null;
  shortDescription: string | null;
  detailedDescription: string | null;
  expectedBenefits: string | null;
  recommendedAnimalCondition: string | null;
  warningsContraindications: string | null;
  defaultBasePrice: string;
  defaultOfferPrice: string | null;
  defaultDiscountPercent: string | null;
  isActive: boolean;
  approvalStatus: string;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  tagsJson: unknown;
  semenProvider: { id: string; slug: string; name: string; nameBn: string | null };
  approvedBy: { id: string; email: string } | null;
  breedMix: Array<{
    id: string;
    percentage: string;
    breed: { nameEn: string; nameBn: string | null };
  }>;
  media: Array<{
    id: string;
    kind: string;
    uploadedFileId: string | null;
    externalUrl: string | null;
    caption: string | null;
    sortOrder: number;
  }>;
};

export async function adminGetSemenTemplate(
  id: string,
): Promise<SerializedSemenTemplate | null> {
  const res = await serverInternalJson<{ template: SerializedSemenTemplate }>(
    `/api/admin/semen-service-templates/${encodeURIComponent(id)}`,
  );
  if (!res.ok) return null;
  return res.data.template;
}
