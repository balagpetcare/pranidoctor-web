/**
 * UI-only semen admin enums (mirrors Prisma enums in prisma/schema.prisma).
 * Must not import Prisma — safe for Client Components.
 */

export const ANIMAL_TYPE_OPTIONS = [
  { value: "CATTLE", label: "Cattle" },
  { value: "GOAT", label: "Goat" },
  { value: "POULTRY", label: "Poultry" },
  { value: "DOG", label: "Dog" },
  { value: "CAT", label: "Cat" },
  { value: "OTHER", label: "Other" },
] as const;

export type AnimalTypeValue = (typeof ANIMAL_TYPE_OPTIONS)[number]["value"];

export const SEMEN_PRODUCT_KIND_OPTIONS = [
  { value: "NORMAL", label: "Normal" },
  { value: "SEXED", label: "Sexed" },
  { value: "PREMIUM", label: "Premium" },
  { value: "IMPORTED", label: "Imported" },
  { value: "LOCAL", label: "Local" },
  { value: "OTHER", label: "Other" },
] as const;

export type SemenProductKindValue = (typeof SEMEN_PRODUCT_KIND_OPTIONS)[number]["value"];

export const SEMEN_TEMPLATE_APPROVAL_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export type SemenTemplateApprovalStatusValue =
  (typeof SEMEN_TEMPLATE_APPROVAL_STATUS_OPTIONS)[number]["value"];

export const SEMEN_PROVIDER_VERIFICATION_STATUS_OPTIONS = [
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "PARTNER", label: "Partner" },
  { value: "OFFICIAL", label: "Official" },
] as const;

export type SemenProviderVerificationStatusValue =
  (typeof SEMEN_PROVIDER_VERIFICATION_STATUS_OPTIONS)[number]["value"];

export const SEMEN_TEMPLATE_MEDIA_KIND_OPTIONS = [
  { value: "COVER", label: "Cover" },
  { value: "GALLERY", label: "Gallery" },
  { value: "VIDEO_UPLOAD", label: "Video upload" },
  { value: "VIDEO_URL", label: "Video URL" },
] as const;

export type SemenTemplateMediaKindValue =
  (typeof SEMEN_TEMPLATE_MEDIA_KIND_OPTIONS)[number]["value"];

/** Default when adding a new media row (matches prior Prisma enum default). */
export const DEFAULT_SEMEN_TEMPLATE_MEDIA_KIND: SemenTemplateMediaKindValue = "COVER";
