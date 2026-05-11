/**
 * Merge duplicate Division → Village rows by normalized identity (see
 * `report-location-duplicates.ts`). Updates FKs, then deletes duplicates.
 *
 * Usage:
 *   npm run locations:dedupe -- --dry-run   (default if neither flag)
 *   npm run locations:dedupe -- --apply
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { prisma } from "@/lib/prisma";
import {
  districtIdentityKey,
  districtTrimCodeKey,
  divisionIdentityKey,
  divisionTrimCodeKey,
  pickCanonicalLocationRow,
  trimCodeDuplicateGroups,
  unionIdentityKey,
  unionTrimCodeKey,
  upazilaIdentityKey,
  upazilaTrimCodeKey,
  villageIdentityKey,
  villageTrimCodeKey,
  type LocationDedupeBase,
} from "@/lib/locations/location-dedupe-logic";

const APPLY = process.argv.includes("--apply");
const REPORT_DIR = path.join(process.cwd(), "data", "locations", "reports");
const PLAN_PATH = path.join(REPORT_DIR, "location-dedupe-last-run.json");

type AnyLoc = LocationDedupeBase & Record<string, unknown>;

async function logUnsafeTrimCodeSkips(): Promise<void> {
  const [divisions, districts, upazilas, unions, villages] = await Promise.all([
    prisma.division.findMany({
      select: { id: true, code: true, name: true, nameBn: true, nameEn: true, slug: true, createdAt: true },
    }),
    prisma.district.findMany({
      select: {
        id: true,
        divisionId: true,
        code: true,
        name: true,
        nameBn: true,
        nameEn: true,
        slug: true,
        createdAt: true,
      },
    }),
    prisma.upazila.findMany({
      select: {
        id: true,
        districtId: true,
        code: true,
        name: true,
        nameBn: true,
        nameEn: true,
        slug: true,
        createdAt: true,
      },
    }),
    prisma.union.findMany({
      select: {
        id: true,
        upazilaId: true,
        code: true,
        name: true,
        nameBn: true,
        nameEn: true,
        slug: true,
        createdAt: true,
      },
    }),
    prisma.village.findMany({
      select: {
        id: true,
        unionId: true,
        code: true,
        name: true,
        nameBn: true,
        nameEn: true,
        slug: true,
        createdAt: true,
      },
    }),
  ]);
  const unsafe =
    trimCodeDuplicateGroups(divisions, (r) => divisionTrimCodeKey(r)).filter((g) => !g.safeForAutoMerge).length +
    trimCodeDuplicateGroups(districts, (r) =>
      districtTrimCodeKey(r as LocationDedupeBase & { divisionId: string }),
    ).filter((g) => !g.safeForAutoMerge).length +
    trimCodeDuplicateGroups(upazilas, (r) =>
      upazilaTrimCodeKey(r as LocationDedupeBase & { districtId: string }),
    ).filter((g) => !g.safeForAutoMerge).length +
    trimCodeDuplicateGroups(unions, (r) =>
      unionTrimCodeKey(r as LocationDedupeBase & { upazilaId: string }),
    ).filter((g) => !g.safeForAutoMerge).length +
    trimCodeDuplicateGroups(villages, (r) =>
      villageTrimCodeKey(r as LocationDedupeBase & { unionId: string }),
    ).filter((g) => !g.safeForAutoMerge).length;
  if (unsafe > 0) {
    console.warn(
      `\n[locations:dedupe] ${unsafe} trim-code duplicate group(s) have conflicting English labels — skipped. ` +
        `Fix CSV/source data or merge manually, then re-run. See duplicate report JSON: partialUniqueTrimCodeConflicts.\n`,
    );
  }
}

async function mergeDivisionsTrimCodeSafe(): Promise<number> {
  const rows = await prisma.division.findMany({
    select: { id: true, code: true, name: true, nameBn: true, nameEn: true, slug: true, createdAt: true },
  });
  const groups = trimCodeDuplicateGroups(rows as AnyLoc[], (r) =>
    divisionTrimCodeKey(r as LocationDedupeBase),
  );
  let merged = 0;
  for (const g of groups) {
    if (!g.safeForAutoMerge) continue;
    const canonical = pickCanonicalLocationRow(g.rows);
    const dupIds = g.rows.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    await prisma.$transaction(async (tx) => {
      await tx.district.updateMany({
        where: { divisionId: { in: dupIds } },
        data: { divisionId: canonical.id },
      });
      await tx.division.deleteMany({ where: { id: { in: dupIds } } });
    });
  }
  return merged;
}

async function mergeDistrictsTrimCodeSafe(): Promise<number> {
  const rows = await prisma.district.findMany({
    select: {
      id: true,
      divisionId: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = trimCodeDuplicateGroups(rows as AnyLoc[], (r) =>
    districtTrimCodeKey(r as LocationDedupeBase & { divisionId: string }),
  );
  let merged = 0;
  for (const g of groups) {
    if (!g.safeForAutoMerge) continue;
    const canonical = pickCanonicalLocationRow(g.rows);
    const dupIds = g.rows.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    await prisma.$transaction(async (tx) => {
      await tx.upazila.updateMany({
        where: { districtId: { in: dupIds } },
        data: { districtId: canonical.id },
      });
      await tx.aiTechnicianProfile.updateMany({
        where: { districtId: { in: dupIds } },
        data: { districtId: canonical.id },
      });
      await tx.aiTechnicianDivisionServiceArea.updateMany({
        where: { districtId: { in: dupIds } },
        data: { districtId: canonical.id },
      });
      await tx.district.deleteMany({ where: { id: { in: dupIds } } });
    });
  }
  return merged;
}

async function mergeUpazilasTrimCodeSafe(): Promise<number> {
  const rows = await prisma.upazila.findMany({
    select: {
      id: true,
      districtId: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = trimCodeDuplicateGroups(rows as AnyLoc[], (r) =>
    upazilaTrimCodeKey(r as LocationDedupeBase & { districtId: string }),
  );
  let merged = 0;
  for (const g of groups) {
    if (!g.safeForAutoMerge) continue;
    const canonical = pickCanonicalLocationRow(g.rows);
    const dupIds = g.rows.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    await prisma.$transaction(async (tx) => {
      await tx.union.updateMany({
        where: { upazilaId: { in: dupIds } },
        data: { upazilaId: canonical.id },
      });
      await tx.aiTechnicianProfile.updateMany({
        where: { upazilaId: { in: dupIds } },
        data: { upazilaId: canonical.id },
      });
      await tx.aiTechnicianDivisionServiceArea.updateMany({
        where: { upazilaId: { in: dupIds } },
        data: { upazilaId: canonical.id },
      });
      await tx.upazila.deleteMany({ where: { id: { in: dupIds } } });
    });
  }
  return merged;
}

async function mergeUnionsTrimCodeSafe(): Promise<number> {
  const rows = await prisma.union.findMany({
    select: {
      id: true,
      upazilaId: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = trimCodeDuplicateGroups(rows as AnyLoc[], (r) =>
    unionTrimCodeKey(r as LocationDedupeBase & { upazilaId: string }),
  );
  let merged = 0;
  for (const g of groups) {
    if (!g.safeForAutoMerge) continue;
    const canonical = pickCanonicalLocationRow(g.rows);
    const dupIds = g.rows.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    await prisma.$transaction(async (tx) => {
      await tx.village.updateMany({
        where: { unionId: { in: dupIds } },
        data: { unionId: canonical.id },
      });
      await tx.aiTechnicianProfile.updateMany({
        where: { unionId: { in: dupIds } },
        data: { unionId: canonical.id },
      });
      await tx.aiTechnicianDivisionServiceArea.updateMany({
        where: { unionId: { in: dupIds } },
        data: { unionId: canonical.id },
      });
      await tx.union.deleteMany({ where: { id: { in: dupIds } } });
    });
  }
  return merged;
}

async function mergeVillagesTrimCodeSafe(): Promise<number> {
  const rows = await prisma.village.findMany({
    select: {
      id: true,
      unionId: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = trimCodeDuplicateGroups(rows as AnyLoc[], (r) =>
    villageTrimCodeKey(r as LocationDedupeBase & { unionId: string }),
  );
  let merged = 0;
  for (const g of groups) {
    if (!g.safeForAutoMerge) continue;
    const canonical = pickCanonicalLocationRow(g.rows);
    const dupIds = g.rows.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    for (const dupId of dupIds) {
      await prisma.$transaction(async (tx) => {
        await tx.serviceRequest.updateMany({
          where: { villageId: dupId },
          data: { villageId: canonical.id },
        });

        const doctorAreas = await tx.doctorServiceArea.findMany({
          where: { villageId: dupId },
          select: { id: true, doctorId: true },
        });
        for (const r of doctorAreas) {
          const clash = await tx.doctorServiceArea.findFirst({
            where: { doctorId: r.doctorId, villageId: canonical.id },
            select: { id: true },
          });
          if (clash) await tx.doctorServiceArea.delete({ where: { id: r.id } });
          else
            await tx.doctorServiceArea.update({
              where: { id: r.id },
              data: { villageId: canonical.id },
            });
        }

        const techAreas = await tx.aiTechnicianServiceArea.findMany({
          where: { villageId: dupId },
          select: { id: true, aiTechnicianId: true },
        });
        for (const r of techAreas) {
          const clash = await tx.aiTechnicianServiceArea.findFirst({
            where: { aiTechnicianId: r.aiTechnicianId, villageId: canonical.id },
            select: { id: true },
          });
          if (clash) await tx.aiTechnicianServiceArea.delete({ where: { id: r.id } });
          else
            await tx.aiTechnicianServiceArea.update({
              where: { id: r.id },
              data: { villageId: canonical.id },
            });
        }

        await tx.village.delete({ where: { id: dupId } });
      });
    }
  }
  return merged;
}

async function mergeAllTrimCodeSafeOnce(): Promise<{
  divisions: number;
  districts: number;
  upazilas: number;
  unions: number;
  villages: number;
}> {
  const divisions = await mergeDivisionsTrimCodeSafe();
  const districts = await mergeDistrictsTrimCodeSafe();
  const upazilas = await mergeUpazilasTrimCodeSafe();
  const unions = await mergeUnionsTrimCodeSafe();
  const villages = await mergeVillagesTrimCodeSafe();
  return { divisions, districts, upazilas, unions, villages };
}

function groupDuplicates<T extends AnyLoc>(rows: T[], keyFn: (r: T) => string): T[][] {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const k = keyFn(r);
    const arr = m.get(k) ?? [];
    arr.push(r);
    m.set(k, arr);
  }
  return [...m.values()].filter((g) => g.length > 1);
}

async function mergeDivisionsOnce(): Promise<number> {
  const rows = await prisma.division.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = groupDuplicates(rows as AnyLoc[], (r) =>
    divisionIdentityKey(r as LocationDedupeBase),
  );
  let merged = 0;
  for (const g of groups) {
    const canonical = pickCanonicalLocationRow(g);
    const dupIds = g.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    await prisma.$transaction(async (tx) => {
      await tx.district.updateMany({
        where: { divisionId: { in: dupIds } },
        data: { divisionId: canonical.id },
      });
      await tx.division.deleteMany({ where: { id: { in: dupIds } } });
    });
  }
  return merged;
}

async function mergeDistrictsOnce(): Promise<number> {
  const rows = await prisma.district.findMany({
    select: {
      id: true,
      divisionId: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = groupDuplicates(rows as AnyLoc[], (r) =>
    districtIdentityKey(
      r as LocationDedupeBase & { divisionId: string },
    ),
  );
  let merged = 0;
  for (const g of groups) {
    const canonical = pickCanonicalLocationRow(g);
    const dupIds = g.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    await prisma.$transaction(async (tx) => {
      await tx.upazila.updateMany({
        where: { districtId: { in: dupIds } },
        data: { districtId: canonical.id },
      });
      await tx.aiTechnicianProfile.updateMany({
        where: { districtId: { in: dupIds } },
        data: { districtId: canonical.id },
      });
      await tx.aiTechnicianDivisionServiceArea.updateMany({
        where: { districtId: { in: dupIds } },
        data: { districtId: canonical.id },
      });
      await tx.district.deleteMany({ where: { id: { in: dupIds } } });
    });
  }
  return merged;
}

async function mergeUpazilasOnce(): Promise<number> {
  const rows = await prisma.upazila.findMany({
    select: {
      id: true,
      districtId: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = groupDuplicates(rows as AnyLoc[], (r) =>
    upazilaIdentityKey(r as LocationDedupeBase & { districtId: string }),
  );
  let merged = 0;
  for (const g of groups) {
    const canonical = pickCanonicalLocationRow(g);
    const dupIds = g.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    await prisma.$transaction(async (tx) => {
      await tx.union.updateMany({
        where: { upazilaId: { in: dupIds } },
        data: { upazilaId: canonical.id },
      });
      await tx.aiTechnicianProfile.updateMany({
        where: { upazilaId: { in: dupIds } },
        data: { upazilaId: canonical.id },
      });
      await tx.aiTechnicianDivisionServiceArea.updateMany({
        where: { upazilaId: { in: dupIds } },
        data: { upazilaId: canonical.id },
      });
      await tx.upazila.deleteMany({ where: { id: { in: dupIds } } });
    });
  }
  return merged;
}

async function mergeUnionsOnce(): Promise<number> {
  const rows = await prisma.union.findMany({
    select: {
      id: true,
      upazilaId: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = groupDuplicates(rows as AnyLoc[], (r) =>
    unionIdentityKey(r as LocationDedupeBase & { upazilaId: string }),
  );
  let merged = 0;
  for (const g of groups) {
    const canonical = pickCanonicalLocationRow(g);
    const dupIds = g.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    await prisma.$transaction(async (tx) => {
      await tx.village.updateMany({
        where: { unionId: { in: dupIds } },
        data: { unionId: canonical.id },
      });
      await tx.aiTechnicianProfile.updateMany({
        where: { unionId: { in: dupIds } },
        data: { unionId: canonical.id },
      });
      await tx.aiTechnicianDivisionServiceArea.updateMany({
        where: { unionId: { in: dupIds } },
        data: { unionId: canonical.id },
      });
      await tx.union.deleteMany({ where: { id: { in: dupIds } } });
    });
  }
  return merged;
}

async function mergeVillagesOnce(): Promise<number> {
  const rows = await prisma.village.findMany({
    select: {
      id: true,
      unionId: true,
      code: true,
      name: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      createdAt: true,
    },
  });
  const groups = groupDuplicates(rows as AnyLoc[], (r) =>
    villageIdentityKey(r as LocationDedupeBase & { unionId: string }),
  );
  let merged = 0;
  for (const g of groups) {
    const canonical = pickCanonicalLocationRow(g);
    const dupIds = g.filter((r) => r.id !== canonical.id).map((r) => r.id);
    if (dupIds.length === 0) continue;
    merged += 1;
    if (!APPLY) continue;
    for (const dupId of dupIds) {
      await prisma.$transaction(async (tx) => {
        await tx.serviceRequest.updateMany({
          where: { villageId: dupId },
          data: { villageId: canonical.id },
        });

        const doctorAreas = await tx.doctorServiceArea.findMany({
          where: { villageId: dupId },
          select: { id: true, doctorId: true },
        });
        for (const r of doctorAreas) {
          const clash = await tx.doctorServiceArea.findFirst({
            where: { doctorId: r.doctorId, villageId: canonical.id },
            select: { id: true },
          });
          if (clash) await tx.doctorServiceArea.delete({ where: { id: r.id } });
          else
            await tx.doctorServiceArea.update({
              where: { id: r.id },
              data: { villageId: canonical.id },
            });
        }

        const techAreas = await tx.aiTechnicianServiceArea.findMany({
          where: { villageId: dupId },
          select: { id: true, aiTechnicianId: true },
        });
        for (const r of techAreas) {
          const clash = await tx.aiTechnicianServiceArea.findFirst({
            where: { aiTechnicianId: r.aiTechnicianId, villageId: canonical.id },
            select: { id: true },
          });
          if (clash) await tx.aiTechnicianServiceArea.delete({ where: { id: r.id } });
          else
            await tx.aiTechnicianServiceArea.update({
              where: { id: r.id },
              data: { villageId: canonical.id },
            });
        }

        await tx.village.delete({ where: { id: dupId } });
      });
    }
  }
  return merged;
}

async function main(): Promise<void> {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  if (!APPLY) {
    console.log("Mode: DRY-RUN (no writes). Re-run with --apply after backup + review.\n");
  } else {
    console.log("Mode: APPLY — mutating database.\n");
  }

  if (APPLY) {
    await logUnsafeTrimCodeSkips();
  }

  const trimWaves: {
    round: number;
    divisions: number;
    districts: number;
    upazilas: number;
    unions: number;
    villages: number;
  }[] = [];

  for (let round = 0; round < 20; round += 1) {
    const t = await mergeAllTrimCodeSafeOnce();
    trimWaves.push({ round, ...t });
    const tsum = t.divisions + t.districts + t.upazilas + t.unions + t.villages;
    if (tsum === 0) break;
    if (!APPLY) break;
  }

  const waves: {
    round: number;
    divisions: number;
    districts: number;
    upazilas: number;
    unions: number;
    villages: number;
  }[] = [];

  for (let round = 0; round < 20; round += 1) {
    const divisions = await mergeDivisionsOnce();
    const districts = await mergeDistrictsOnce();
    const upazilas = await mergeUpazilasOnce();
    const unions = await mergeUnionsOnce();
    const villages = await mergeVillagesOnce();
    const sum = divisions + districts + upazilas + unions + villages;
    waves.push({ round, divisions, districts, upazilas, unions, villages });
    if (sum === 0) break;
    if (!APPLY) {
      // Dry-run: one synthetic pass only (multi-pass needs DB writes).
      break;
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    apply: APPLY,
    trimWaves,
    waves,
  };
  fs.writeFileSync(PLAN_PATH, JSON.stringify(out, null, 2), "utf8");
  console.log(JSON.stringify(out, null, 2));
  console.log(`\nWrote ${PLAN_PATH}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
