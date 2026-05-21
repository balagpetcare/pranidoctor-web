import { AREA_TYPE, type AreaType } from "@/lib/domain/area-type-constants";

import type { AdminAreaRow } from "@/types/admin-areas";

export function filterParentCandidates(
  childType: AreaType,
  options: AdminAreaRow[],
  excludeId?: string,
  alwaysIncludeIds?: ReadonlySet<string>,
): AdminAreaRow[] {
  const base = options.filter(
    (o) =>
      o.id !== excludeId &&
      (o.isActive || alwaysIncludeIds?.has(o.id)),
  );

  switch (childType) {
    case AREA_TYPE.DIVISION:
      return base.filter((o) => o.type === AREA_TYPE.DIVISION);
    case AREA_TYPE.DISTRICT:
      return base.filter((o) => o.type === AREA_TYPE.DIVISION);
    case AREA_TYPE.UPAZILA:
      return base.filter((o) => o.type === AREA_TYPE.DISTRICT);
    case AREA_TYPE.UNION:
      return base.filter((o) => o.type === AREA_TYPE.UPAZILA);
    case AREA_TYPE.VILLAGE:
      return base.filter((o) => o.type === AREA_TYPE.UNION);
    case AREA_TYPE.SERVICE_AREA:
      return base.filter((o) => o.type === AREA_TYPE.VILLAGE);
  }
}

export function formatAreaOptionLabel(a: AdminAreaRow): string {
  const bn = a.nameBn ? ` · ${a.nameBn}` : "";
  return `${a.type} · ${a.name}${bn}`;
}
