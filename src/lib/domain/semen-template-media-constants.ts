/**
 * Semen template media kind values — mirrors Prisma without importing generated client
 * in browser bundles (admin semen media upload UI).
 */
export const SEMEN_TEMPLATE_MEDIA_KIND = {
  COVER: "COVER",
  GALLERY: "GALLERY",
  VIDEO_UPLOAD: "VIDEO_UPLOAD",
  VIDEO_URL: "VIDEO_URL",
} as const;

export type SemenTemplateMediaKind =
  (typeof SEMEN_TEMPLATE_MEDIA_KIND)[keyof typeof SEMEN_TEMPLATE_MEDIA_KIND];
