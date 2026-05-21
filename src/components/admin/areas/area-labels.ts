import { AREA_TYPE, type AreaType } from "@/lib/domain/area-type-constants";

/** Bangla labels for area hierarchy types (admin UI). */
export function areaTypeBn(type: AreaType | string): string {
  switch (type) {
    case AREA_TYPE.DIVISION:
      return "বিভাগ";
    case AREA_TYPE.DISTRICT:
      return "জেলা";
    case AREA_TYPE.UPAZILA:
      return "উপজেলা";
    case AREA_TYPE.UNION:
      return "ইউনিয়ন";
    case AREA_TYPE.VILLAGE:
      return "গ্রাম";
    case AREA_TYPE.SERVICE_AREA:
      return "সার্ভিস এরিয়া";
    default:
      return String(type);
  }
}
