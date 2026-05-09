import { AreaType } from "@/generated/prisma/browser";

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
    case AreaType.DIVISION:
      return base.filter((o) => o.type === AreaType.DIVISION);
    case AreaType.DISTRICT:
      return base.filter((o) => o.type === AreaType.DIVISION);
    case AreaType.UPAZILA:
      return base.filter((o) => o.type === AreaType.DISTRICT);
    case AreaType.UNION:
      return base.filter((o) => o.type === AreaType.UPAZILA);
    case AreaType.VILLAGE:
      return base.filter((o) => o.type === AreaType.UNION);
    case AreaType.SERVICE_AREA:
      return base.filter((o) => o.type === AreaType.VILLAGE);
  }
}

export function formatAreaOptionLabel(a: AdminAreaRow): string {
  const bn = a.nameBn ? ` · ${a.nameBn}` : "";
  return `${a.type} · ${a.name}${bn}`;
}
