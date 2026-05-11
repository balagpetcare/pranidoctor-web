/**
 * Phase 2 — Reference audit before clearing Division→Village hierarchy.
 * Writes: data/locations/reports/location-clear-reference-audit.json
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
  "location-clear-reference-audit.json",
);

type Referenced = "Division" | "District" | "Upazila" | "Union" | "Village";

type RefRow = {
  referencingModel: string;
  prismaField: string;
  referencedModel: Referenced;
  isRequired: boolean;
  onDelete: string;
  rowCountWithNonNullReference: number;
  safeToNullify: boolean;
  /** True if deleting the referenced location row would fail without prior action. */
  deleteWouldBeBlocked: boolean;
  notes: string;
};

const STATIC_REFS: Omit<RefRow, "rowCountWithNonNullReference">[] = [
  {
    referencingModel: "District",
    prismaField: "divisionId",
    referencedModel: "Division",
    isRequired: true,
    onDelete: "Restrict",
    safeToNullify: false,
    deleteWouldBeBlocked: false,
    notes: "Hierarchy child; cleared when parent chain is deleted bottom-up.",
  },
  {
    referencingModel: "Upazila",
    prismaField: "districtId",
    referencedModel: "District",
    isRequired: true,
    onDelete: "Restrict",
    safeToNullify: false,
    deleteWouldBeBlocked: false,
    notes: "Hierarchy child.",
  },
  {
    referencingModel: "Union",
    prismaField: "upazilaId",
    referencedModel: "Upazila",
    isRequired: true,
    onDelete: "Restrict",
    safeToNullify: false,
    deleteWouldBeBlocked: false,
    notes: "Hierarchy child.",
  },
  {
    referencingModel: "Village",
    prismaField: "unionId",
    referencedModel: "Union",
    isRequired: true,
    onDelete: "Restrict",
    safeToNullify: false,
    deleteWouldBeBlocked: false,
    notes: "Hierarchy child; delete villages before unions.",
  },
  {
    referencingModel: "AiTechnicianProfile",
    prismaField: "districtId",
    referencedModel: "District",
    isRequired: false,
    onDelete: "SetNull",
    safeToNullify: true,
    deleteWouldBeBlocked: false,
    notes: "Nullable FK; clear script sets null before hierarchy delete.",
  },
  {
    referencingModel: "AiTechnicianProfile",
    prismaField: "upazilaId",
    referencedModel: "Upazila",
    isRequired: false,
    onDelete: "SetNull",
    safeToNullify: true,
    deleteWouldBeBlocked: false,
    notes: "Nullable FK; clear script sets null before hierarchy delete.",
  },
  {
    referencingModel: "AiTechnicianProfile",
    prismaField: "unionId",
    referencedModel: "Union",
    isRequired: false,
    onDelete: "SetNull",
    safeToNullify: true,
    deleteWouldBeBlocked: false,
    notes: "Nullable FK; clear script sets null before hierarchy delete.",
  },
  {
    referencingModel: "AiTechnicianDivisionServiceArea",
    prismaField: "districtId",
    referencedModel: "District",
    isRequired: false,
    onDelete: "SetNull",
    safeToNullify: true,
    deleteWouldBeBlocked: false,
    notes: "Nullable FK; clear script sets null.",
  },
  {
    referencingModel: "AiTechnicianDivisionServiceArea",
    prismaField: "upazilaId",
    referencedModel: "Upazila",
    isRequired: false,
    onDelete: "SetNull",
    safeToNullify: true,
    deleteWouldBeBlocked: false,
    notes: "Nullable FK; clear script sets null.",
  },
  {
    referencingModel: "AiTechnicianDivisionServiceArea",
    prismaField: "unionId",
    referencedModel: "Union",
    isRequired: false,
    onDelete: "SetNull",
    safeToNullify: true,
    deleteWouldBeBlocked: false,
    notes: "Nullable FK; clear script sets null.",
  },
  {
    referencingModel: "ServiceRequest",
    prismaField: "villageId",
    referencedModel: "Village",
    isRequired: false,
    onDelete: "Restrict",
    safeToNullify: true,
    deleteWouldBeBlocked: true,
    notes: "Must nullify before Village delete (Restrict). Clear script nullifies; does not delete requests.",
  },
  {
    referencingModel: "DoctorServiceArea",
    prismaField: "villageId",
    referencedModel: "Village",
    isRequired: true,
    onDelete: "Cascade",
    safeToNullify: false,
    deleteWouldBeBlocked: false,
    notes: "Junction rows; removed by ON DELETE CASCADE when Village is deleted. Doctor rows preserved.",
  },
  {
    referencingModel: "AiTechnicianServiceArea",
    prismaField: "villageId",
    referencedModel: "Village",
    isRequired: true,
    onDelete: "Cascade",
    safeToNullify: false,
    deleteWouldBeBlocked: false,
    notes: "Junction rows; CASCADE on village delete. Technician profiles preserved.",
  },
];

type PgFkRow = {
  from_table: string;
  from_column: string;
  to_table: string;
  delete_rule: string;
};

async function counts(): Promise<Map<string, number>> {
  const [
    districtDiv,
    upazilaDist,
    unionUp,
    villageUn,
    techDist,
    techUp,
    techUn,
    divAreaDist,
    divAreaUp,
    divAreaUn,
    reqVil,
    docSa,
    aiSa,
  ] = await Promise.all([
    prisma.district.count(),
    prisma.upazila.count(),
    prisma.union.count(),
    prisma.village.count(),
    prisma.aiTechnicianProfile.count({ where: { districtId: { not: null } } }),
    prisma.aiTechnicianProfile.count({ where: { upazilaId: { not: null } } }),
    prisma.aiTechnicianProfile.count({ where: { unionId: { not: null } } }),
    prisma.aiTechnicianDivisionServiceArea.count({ where: { districtId: { not: null } } }),
    prisma.aiTechnicianDivisionServiceArea.count({ where: { upazilaId: { not: null } } }),
    prisma.aiTechnicianDivisionServiceArea.count({ where: { unionId: { not: null } } }),
    prisma.serviceRequest.count({ where: { villageId: { not: null } } }),
    prisma.doctorServiceArea.count(),
    prisma.aiTechnicianServiceArea.count(),
  ]);

  return new Map<string, number>([
    ["District.divisionId", districtDiv],
    ["Upazila.districtId", upazilaDist],
    ["Union.upazilaId", unionUp],
    ["Village.unionId", villageUn],
    ["AiTechnicianProfile.districtId", techDist],
    ["AiTechnicianProfile.upazilaId", techUp],
    ["AiTechnicianProfile.unionId", techUn],
    ["AiTechnicianDivisionServiceArea.districtId", divAreaDist],
    ["AiTechnicianDivisionServiceArea.upazilaId", divAreaUp],
    ["AiTechnicianDivisionServiceArea.unionId", divAreaUn],
    ["ServiceRequest.villageId", reqVil],
    ["DoctorServiceArea.villageId", docSa],
    ["AiTechnicianServiceArea.villageId", aiSa],
  ]);
}

async function loadPgFks(): Promise<PgFkRow[]> {
  try {
    const rows = await prisma.$queryRaw<PgFkRow[]>`
      SELECT
        conrelid::regclass::text AS "from_table",
        (SELECT attname FROM pg_attribute WHERE attrelid = c.conrelid AND attnum = c.conkey[1]) AS "from_column",
        confrelid::regclass::text AS "to_table",
        CASE c.confdeltype
          WHEN 'a' THEN 'NO ACTION'
          WHEN 'r' THEN 'RESTRICT'
          WHEN 'c' THEN 'CASCADE'
          WHEN 'n' THEN 'SET NULL'
          WHEN 'd' THEN 'SET DEFAULT'
          ELSE c.confdeltype::text
        END AS "delete_rule"
      FROM pg_constraint c
      WHERE c.contype = 'f'
        AND confrelid::regclass::text IN (
          '"Division"', '"District"', '"Upazila"', '"Union"', '"Village"'
        )
      ORDER BY 1, 2;
    `;
    return rows;
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const countMap = await counts();
  const pgFks = await loadPgFks();

  const knownReferencingTables = new Set([
    "District",
    "Upazila",
    "Union",
    "Village",
    "AiTechnicianProfile",
    "AiTechnicianDivisionServiceArea",
    "ServiceRequest",
    "DoctorServiceArea",
    "AiTechnicianServiceArea",
  ]);
  const unexpectedPgForeignKeys = pgFks.filter((r) => {
    const t = r.from_table.replace(/"/g, "");
    return !knownReferencingTables.has(t);
  });

  const references: RefRow[] = STATIC_REFS.map((s) => {
    const key = `${s.referencingModel}.${s.prismaField}`;
    const n = countMap.get(key) ?? 0;
    return { ...s, rowCountWithNonNullReference: n };
  });

  const blockingRequiredFks = references.filter(
    (r) =>
      r.isRequired &&
      r.referencingModel !== "District" &&
      r.referencingModel !== "Upazila" &&
      r.referencingModel !== "Union" &&
      r.referencingModel !== "Village" &&
      r.rowCountWithNonNullReference > 0 &&
      r.deleteWouldBeBlocked,
  );

  const canClearHierarchyWithScript =
    unexpectedPgForeignKeys.length === 0 &&
    blockingRequiredFks.length === 0 &&
    references.every((r) => {
      if (!r.isRequired) return true;
      if (["District", "Upazila", "Union", "Village"].includes(r.referencingModel)) return true;
      if (r.referencingModel === "DoctorServiceArea" || r.referencingModel === "AiTechnicianServiceArea")
        return true;
      return r.rowCountWithNonNullReference === 0;
    });

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      canClearHierarchyWithScript,
      unexpectedPgForeignKeys,
      blockingRequiredForeignKeys: blockingRequiredFks.map((r) => ({
        model: r.referencingModel,
        field: r.prismaField,
        rows: r.rowCountWithNonNullReference,
      })),
      recommendation: canClearHierarchyWithScript
        ? "Run `npm run locations:clear-for-nuhil-rebuild -- --execute` after CSV switch + dry-run import review. Junction village coverage rows will CASCADE; ServiceRequest.villageId will be nullified."
        : unexpectedPgForeignKeys.length > 0
          ? "PostgreSQL reports FK references to Division…Village from tables not in the audited allowlist — extend the audit script or remap data before clear."
          : "Do not run the clear script until required FK blockers are resolved. See references with deleteWouldBeBlocked and isRequired.",
    },
    expectedNuhilCounts: {
      divisions: 8,
      districts: 64,
      upazilas: 494,
      unions: 4540,
    },
    references,
    databaseForeignKeysToLocationTables: pgFks,
    note:
      "Area model is separate from Division…Village; not listed here. DoctorProfileArea / AiTechnicianProfileArea reference Area, not normalized BD tables.",
  };

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report.summary, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
