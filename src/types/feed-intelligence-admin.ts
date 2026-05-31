export type VkVersionStatusLabel =
  | "DRAFT"
  | "IN_REVIEW"
  | "VET_APPROVAL"
  | "PUBLISHED"
  | "DEPRECATED"
  | "CHANGES_REQUESTED"
  | "REJECTED";

export type FeedIngredientListItem = {
  entityId: string;
  slug: string;
  ingredientCode: string;
  titleBn: string;
  titleEn: string;
  status: VkVersionStatusLabel;
  versionId: string;
  versionNumber: number;
  bdAvailability: string;
  publishedAt: string | null;
  updatedAt: string;
};

export type FeedIngredientDetail = FeedIngredientListItem & {
  localNamesBn: string[];
  localNamesEn: string[];
  composition: Record<string, number | undefined>;
  species: string[];
  bodyBn: string;
  bodyEn: string;
  draftVersionId: string | null;
  publishedVersionId: string | null;
};

export type ToxicAlertListItem = {
  entityId: string;
  slug: string;
  substance: string;
  titleBn: string;
  titleEn: string;
  status: VkVersionStatusLabel;
  versionId: string;
  versionNumber: number;
  vetRequired: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type ToxicAlertDetail = ToxicAlertListItem & {
  commonNamesBn: string[];
  commonNamesEn: string[];
  speciesAffected: string[];
  toxicThreshold: string;
  lethalThreshold: string | null;
  clinicalSignsBn: string[];
  clinicalSignsEn: string[];
  immediateActionBn: string;
  immediateActionEn: string;
  bodyBn: string;
  bodyEn: string;
  relatedIngredientCodes: string[];
};

export type FeedAdminListResponse<T> = {
  items: T[];
  total: number;
};

export type FeedVersionHistoryItem = {
  versionId: string;
  versionNumber: number;
  status: VkVersionStatusLabel;
  titleBn: string;
  titleEn: string;
  publishedAt: string | null;
  createdAt: string;
};

export type FeedAuditEvent = {
  id: string;
  eventType: string;
  actorId: string | null;
  actorRole: string | null;
  detailJson: unknown;
  createdAt: string;
  versionId: string | null;
};
