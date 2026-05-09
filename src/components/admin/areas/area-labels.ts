import { AreaType } from "@/generated/prisma/browser";

/** Bangla labels for area hierarchy types (admin UI). */
export function areaTypeBn(type: AreaType | string): string {
  switch (type) {
    case AreaType.DIVISION:
      return "বিভাগ";
    case AreaType.DISTRICT:
      return "জেলা";
    case AreaType.UPAZILA:
      return "উপজেলা";
    case AreaType.UNION:
      return "ইউনিয়ন";
    case AreaType.VILLAGE:
      return "গ্রাম";
    case AreaType.SERVICE_AREA:
      return "সার্ভিস এরিয়া";
    default:
      return String(type);
  }
}
