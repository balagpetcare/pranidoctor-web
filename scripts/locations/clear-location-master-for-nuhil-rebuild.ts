/**
 * Phase 4 — Clear normalized BD location master (Village → … → Division) for nuhil rebuild.
 *
 * - Default: dry-run (writes report, no DB writes).
 * - `npm run locations:clear-for-nuhil-rebuild -- --execute` performs the clear inside a transaction.
 *
 * Does not delete users, doctors, technicians, service requests, or other business rows.
 * Nullifies optional location FKs; nullifies ServiceRequest.villageId; village junction tables CASCADE.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { prisma } from "@/lib/prisma";

const REPORT = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "location-clear-report.json",
);

const AUDIT_REPORT = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "location-clear-reference-audit.json",
);

type ActionCounts = {
  serviceRequestVillageIdNullified: number;
  aiTechnicianProfileDistrictNullified: number;
  aiTechnicianProfileUpazilaNullified: number;
  aiTechnicianProfileUnionNullified: number;
  aiTechnicianDivisionServiceAreaDistrictNullified: number;
  aiTechnicianDivisionServiceAreaUpazilaNullified: number;
  aiTechnicianDivisionServiceAreaUnionNullified: number;
  villagesDeleted: number;
  unionsDeleted: number;
  upazilasDeleted: number;
  districtsDeleted: number;
  divisionsDeleted: number;
};

async function main(): Promise<void> {
  const execute = process.argv.includes("--execute");
  const forceWithoutAudit = process.argv.includes("--force-without-audit");
  const generatedAt = new Date().toISOString();

  const pre = {
    villages: await prisma.village.count(),
    unions: await prisma.union.count(),
    upazilas: await prisma.upazila.count(),
    districts: await prisma.district.count(),
    divisions: await prisma.division.count(),
    serviceRequestWithVillage: await prisma.serviceRequest.count({ where: { villageId: { not: null } } }),
    doctorServiceAreas: await prisma.doctorServiceArea.count(),
    aiTechnicianServiceAreas: await prisma.aiTechnicianServiceArea.count(),
  };

  if (execute && !forceWithoutAudit) {
    if (!fs.existsSync(AUDIT_REPORT)) {
      console.error(
        `Missing ${AUDIT_REPORT}. Run: npm run locations:audit:clear-refs\nOr pass --force-without-audit (not recommended).`,
      );
      process.exit(1);
    }
    try {
      const audit = JSON.parse(fs.readFileSync(AUDIT_REPORT, "utf8")) as {
        summary?: { canClearHierarchyWithScript?: boolean };
      };
      if (!audit.summary?.canClearHierarchyWithScript) {
        console.error(
          `Audit reports unsafe clear (canClearHierarchyWithScript=false). See ${AUDIT_REPORT}`,
        );
        process.exit(1);
      }
    } catch (e) {
      console.error("Failed to read audit JSON:", e);
      process.exit(1);
    }
  }

  if (!execute) {
    const report = {
      generatedAt,
      executed: false,
      dryRun: true,
      pre,
      plannedActions: [
        "Nullify ServiceRequest.villageId where set",
        "Nullify AiTechnicianProfile.districtId, upazilaId, unionId where set",
        "Nullify AiTechnicianDivisionServiceArea districtId, upazilaId, unionId where set",
        "DELETE FROM Village (CASCADE: DoctorServiceArea, AiTechnicianServiceArea junction rows only)",
        "DELETE FROM Union, Upazila, District, Division",
      ],
      notes: [
        "Re-run with `--execute` only after `audit-location-references-before-clear.ts` and import dry-run review.",
        "Doctor/technician profiles and service requests are not deleted; village coverage links are removed with villages.",
      ],
    };
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const counts: ActionCounts = {
    serviceRequestVillageIdNullified: 0,
    aiTechnicianProfileDistrictNullified: 0,
    aiTechnicianProfileUpazilaNullified: 0,
    aiTechnicianProfileUnionNullified: 0,
    aiTechnicianDivisionServiceAreaDistrictNullified: 0,
    aiTechnicianDivisionServiceAreaUpazilaNullified: 0,
    aiTechnicianDivisionServiceAreaUnionNullified: 0,
    villagesDeleted: 0,
    unionsDeleted: 0,
    upazilasDeleted: 0,
    districtsDeleted: 0,
    divisionsDeleted: 0,
  };

  await prisma.$transaction(async (tx) => {
    const r0 = await tx.serviceRequest.updateMany({
      where: { villageId: { not: null } },
      data: { villageId: null },
    });
    counts.serviceRequestVillageIdNullified = r0.count;

    const r1 = await tx.aiTechnicianProfile.updateMany({
      where: { districtId: { not: null } },
      data: { districtId: null },
    });
    counts.aiTechnicianProfileDistrictNullified = r1.count;

    const r2 = await tx.aiTechnicianProfile.updateMany({
      where: { upazilaId: { not: null } },
      data: { upazilaId: null },
    });
    counts.aiTechnicianProfileUpazilaNullified = r2.count;

    const r3 = await tx.aiTechnicianProfile.updateMany({
      where: { unionId: { not: null } },
      data: { unionId: null },
    });
    counts.aiTechnicianProfileUnionNullified = r3.count;

    const r4 = await tx.aiTechnicianDivisionServiceArea.updateMany({
      where: { districtId: { not: null } },
      data: { districtId: null },
    });
    counts.aiTechnicianDivisionServiceAreaDistrictNullified = r4.count;

    const r5 = await tx.aiTechnicianDivisionServiceArea.updateMany({
      where: { upazilaId: { not: null } },
      data: { upazilaId: null },
    });
    counts.aiTechnicianDivisionServiceAreaUpazilaNullified = r5.count;

    const r6 = await tx.aiTechnicianDivisionServiceArea.updateMany({
      where: { unionId: { not: null } },
      data: { unionId: null },
    });
    counts.aiTechnicianDivisionServiceAreaUnionNullified = r6.count;

    const vd = await tx.village.deleteMany({});
    counts.villagesDeleted = vd.count;

    const ud = await tx.union.deleteMany({});
    counts.unionsDeleted = ud.count;

    const upd = await tx.upazila.deleteMany({});
    counts.upazilasDeleted = upd.count;

    const dd = await tx.district.deleteMany({});
    counts.districtsDeleted = dd.count;

    const divd = await tx.division.deleteMany({});
    counts.divisionsDeleted = divd.count;
  });

  const post = {
    villages: await prisma.village.count(),
    unions: await prisma.union.count(),
    upazilas: await prisma.upazila.count(),
    districts: await prisma.district.count(),
    divisions: await prisma.division.count(),
  };

  const report = {
    generatedAt,
    executed: true,
    dryRun: false,
    pre,
    counts,
    post,
    notes: [
      "Normalized Division…Village tables cleared. Re-import with `npm run locations:import`.",
      "Area tree untouched. CSV files on disk unchanged by this script.",
    ],
  };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
