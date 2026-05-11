/**
 * Resolve duplicate `District` rows that share the same `divisionId` + trimmed non-empty `code`
 * (same rule as migration `20260511133000_location_dedupe_unique_constraints`).
 *
 * Default: dry-run (prints plan + writes reports).
 * Apply: `npm run locations:resolve-district-code-conflicts -- --apply`
 *
 * Does not touch divisions, upazila/union merge except when two upazilas would share the same
 * trimmed code under the canonical district after a district merge (then merges child upazila).
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { normalizeLocationCode, normalizeLocationName } from "@/lib/locations/location-data-quality";

const APPLY = process.argv.includes("--apply");
const REPORT_DIR = path.join(process.cwd(), "data", "locations", "reports");
const JSON_OUT = path.join(REPORT_DIR, "district-trim-code-conflict-resolution.json");
const MD_OUT = path.join(REPORT_DIR, "district-trim-code-conflict-resolution.md");

type DistrictRow = {
  id: string;
  divisionId: string;
  code: string | null;
  name: string;
  nameBn: string | null;
  nameEn: string | null;
  slug: string;
  createdAt: Date;
};

type DistrictStats = {
  id: string;
  upazilaCount: number;
  aiTechnicianProfileCount: number;
  aiTechnicianDivisionServiceAreaCount: number;
  businessRefTotal: number;
};

function trimCodeGroupKey(divisionId: string, code: string): string {
  return `${divisionId}|${code}`;
}

function displayEnglishLabel(d: DistrictRow): string {
  return (
    normalizeLocationName(d.nameEn) ||
    normalizeLocationName(d.nameBn) ||
    normalizeLocationName(d.name)
  );
}

function nameCleanlinessScore(d: DistrictRow): number {
  const label = displayEnglishLabel(d);
  if (!label) return 0;
  if (/\b(unknown|tbd|duplicate|test)\b/i.test(label)) return 0;
  return label.length;
}

async function districtStats(id: string): Promise<DistrictStats> {
  const [upazilaCount, aiTechnicianProfileCount, aiTechnicianDivisionServiceAreaCount] =
    await Promise.all([
      prisma.upazila.count({ where: { districtId: id } }),
      prisma.aiTechnicianProfile.count({ where: { districtId: id } }),
      prisma.aiTechnicianDivisionServiceArea.count({ where: { districtId: id } }),
    ]);
  return {
    id,
    upazilaCount,
    aiTechnicianProfileCount,
    aiTechnicianDivisionServiceAreaCount,
    businessRefTotal: aiTechnicianProfileCount + aiTechnicianDivisionServiceAreaCount,
  };
}

function pickCanonicalDistrict(rows: DistrictRow[], stats: Map<string, DistrictStats>): DistrictRow {
  return [...rows].sort((a, b) => {
    const sa = stats.get(a.id)!;
    const sb = stats.get(b.id)!;
    if (sa.upazilaCount !== sb.upazilaCount) return sb.upazilaCount - sa.upazilaCount;
    if (sa.businessRefTotal !== sb.businessRefTotal) return sb.businessRefTotal - sa.businessRefTotal;
    const na = nameCleanlinessScore(a);
    const nb = nameCleanlinessScore(b);
    if (na !== nb) return nb - na;
    return a.id.localeCompare(b.id);
  })[0]!;
}

async function mergeUpazilaIntoCanonical(
  tx: Prisma.TransactionClient,
  fromUpazilaId: string,
  toUpazilaId: string,
): Promise<void> {
  await tx.union.updateMany({
    where: { upazilaId: fromUpazilaId },
    data: { upazilaId: toUpazilaId },
  });
  await tx.aiTechnicianProfile.updateMany({
    where: { upazilaId: fromUpazilaId },
    data: { upazilaId: toUpazilaId },
  });
  await tx.aiTechnicianDivisionServiceArea.updateMany({
    where: { upazilaId: fromUpazilaId },
    data: { upazilaId: toUpazilaId },
  });
  await tx.upazila.delete({ where: { id: fromUpazilaId } });
}

async function moveUpazilasFromDuplicateDistrict(
  tx: Prisma.TransactionClient,
  dupDistrictId: string,
  canonDistrictId: string,
): Promise<{ upazilasReparented: number; mergedUpazilaPairs: number }> {
  let upazilasReparented = 0;
  let mergedUpazilaPairs = 0;
  const dupUpazilas = await tx.upazila.findMany({ where: { districtId: dupDistrictId } });
  const canonUpazilas = await tx.upazila.findMany({ where: { districtId: canonDistrictId } });
  const canonByTrimCode = new Map<string, string>();
  for (const u of canonUpazilas) {
    const c = normalizeLocationCode(u.code);
    if (c) canonByTrimCode.set(c, u.id);
  }
  for (const up of dupUpazilas) {
    const c = normalizeLocationCode(up.code);
    if (!c) {
      await tx.upazila.update({
        where: { id: up.id },
        data: { districtId: canonDistrictId },
      });
      upazilasReparented += 1;
      continue;
    }
    const targetId = canonByTrimCode.get(c);
    if (!targetId) {
      await tx.upazila.update({
        where: { id: up.id },
        data: { districtId: canonDistrictId },
      });
      canonByTrimCode.set(c, up.id);
      upazilasReparented += 1;
      continue;
    }
    if (targetId === up.id) continue;
    await mergeUpazilaIntoCanonical(tx, up.id, targetId);
    mergedUpazilaPairs += 1;
  }
  return { upazilasReparented, mergedUpazilaPairs };
}

async function remainingDistrictRefsTx(
  tx: Prisma.TransactionClient,
  districtId: string,
): Promise<string[]> {
  const [u, p, a] = await Promise.all([
    tx.upazila.count({ where: { districtId } }),
    tx.aiTechnicianProfile.count({ where: { districtId } }),
    tx.aiTechnicianDivisionServiceArea.count({ where: { districtId } }),
  ]);
  const blockers: string[] = [];
  if (u) blockers.push(`Upazila.districtId=${u}`);
  if (p) blockers.push(`AiTechnicianProfile.districtId=${p}`);
  if (a) blockers.push(`AiTechnicianDivisionServiceArea.districtId=${a}`);
  return blockers;
}

async function main(): Promise<void> {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  if (APPLY) {
    console.log("Mode: APPLY (writes to database)\n");
  } else {
    console.log("Mode: DRY-RUN (no writes). Pass --apply to execute after review.\n");
  }

  const districts = await prisma.district.findMany({
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

  const groups = new Map<string, DistrictRow[]>();
  for (const d of districts) {
    const c = normalizeLocationCode(d.code);
    if (!c) continue;
    const k = trimCodeGroupKey(d.divisionId, c);
    const arr = groups.get(k) ?? [];
    arr.push(d as DistrictRow);
    groups.set(k, arr);
  }

  const conflicts = [...groups.values()].filter((g) => g.length > 1);
  const divisionIds = [...new Set(conflicts.flatMap((g) => g.map((r) => r.divisionId)))];
  const divisions = await prisma.division.findMany({
    where: { id: { in: divisionIds } },
    select: { id: true, name: true, nameBn: true, nameEn: true, code: true },
  });
  const divisionById = new Map(divisions.map((x) => [x.id, x]));

  type ConflictPlan = {
    groupKey: string;
    divisionId: string;
    divisionLabel: string;
    trimmedCode: string;
    rows: (DistrictRow & {
      stats: DistrictStats;
    })[];
    canonicalId: string;
    duplicateIds: string[];
    steps: string[];
  };

  const plans: ConflictPlan[] = [];

  for (const rows of conflicts) {
    const stats = new Map<string, DistrictStats>();
    for (const r of rows) {
      stats.set(r.id, await districtStats(r.id));
    }
    const canonical = pickCanonicalDistrict(rows, stats);
    const dupes = rows.filter((r) => r.id !== canonical.id);
    const div = divisionById.get(rows[0]!.divisionId);
    const divLabel =
      normalizeLocationName(div?.nameEn) ||
      normalizeLocationName(div?.nameBn) ||
      normalizeLocationName(div?.name) ||
      rows[0]!.divisionId;
    const tc = normalizeLocationCode(rows[0]!.code);
    const groupKey = trimCodeGroupKey(rows[0]!.divisionId, tc);

    const steps: string[] = [];
    for (const d of dupes) {
      const s = stats.get(d.id)!;
      steps.push(
        `Reassign district ${d.id} (${displayEnglishLabel(d) || d.slug}) → merge into canonical ${canonical.id}: ` +
          `move ${s.upazilaCount} upazila(s), ${s.aiTechnicianProfileCount} technician profile(s), ` +
          `${s.aiTechnicianDivisionServiceAreaCount} division service area row(s); then delete district ${d.id}.`,
      );
    }
    steps.push(
      `If an upazila on a duplicate district shares the same trimmed code as one on the canonical district, ` +
        `child upazila rows are merged (unions + FKs moved, duplicate upazila deleted).`,
    );

    plans.push({
      groupKey,
      divisionId: rows[0]!.divisionId,
      divisionLabel: divLabel,
      trimmedCode: tc,
      rows: rows.map((r) => ({ ...r, stats: stats.get(r.id)! })),
      canonicalId: canonical.id,
      duplicateIds: dupes.map((r) => r.id),
      steps,
    });
  }

  for (const plan of plans) {
    console.log("--- Conflict group ---");
    console.log(`groupKey=${plan.groupKey}`);
    console.log(`division=${plan.divisionLabel} (${plan.divisionId})`);
    console.log(`trimmedCode=${plan.trimmedCode}`);
    console.log(`canonicalDistrictId=${plan.canonicalId} (recommended)`);
    console.log(`duplicateDistrictIds=${plan.duplicateIds.join(", ")}`);
    for (const r of plan.rows) {
      const divN = divisionById.get(r.divisionId);
      console.log(
        JSON.stringify(
          {
            id: r.id,
            code: r.code,
            slug: r.slug,
            name: r.name,
            nameBn: r.nameBn,
            nameEn: r.nameEn,
            displayEnglish: displayEnglishLabel(r),
            divisionId: r.divisionId,
            divisionName: divN?.name ?? null,
            upazilaCount: r.stats.upazilaCount,
            aiTechnicianProfileCount: r.stats.aiTechnicianProfileCount,
            aiTechnicianDivisionServiceAreaCount: r.stats.aiTechnicianDivisionServiceAreaCount,
            businessRefTotal: r.stats.businessRefTotal,
            isCanonical: r.id === plan.canonicalId,
          },
          null,
          2,
        ),
      );
    }
    for (const s of plan.steps) console.log(`  step: ${s}`);
    console.log("");
  }

  if (APPLY && plans.length > 0) {
    for (const plan of plans) {
      const canonical = plan.rows.find((r) => r.id === plan.canonicalId)!;
      for (const dupId of plan.duplicateIds) {
        await prisma.$transaction(async (tx) => {
          const { upazilasReparented, mergedUpazilaPairs } = await moveUpazilasFromDuplicateDistrict(
            tx,
            dupId,
            canonical.id,
          );
          await tx.aiTechnicianProfile.updateMany({
            where: { districtId: dupId },
            data: { districtId: canonical.id },
          });
          await tx.aiTechnicianDivisionServiceArea.updateMany({
            where: { districtId: dupId },
            data: { districtId: canonical.id },
          });
          const blockers = await remainingDistrictRefsTx(tx, dupId);
          if (blockers.length > 0) {
            throw new Error(
              `Cannot delete district ${dupId}: references remain — ${blockers.join("; ")} ` +
                `(after upazila moves: reparented=${upazilasReparented}, upazila merges=${mergedUpazilaPairs})`,
            );
          }
          await tx.district.delete({ where: { id: dupId } });
        });
        console.log(`Applied: merged duplicate district ${dupId} into ${canonical.id}`);
      }
    }
  }

  const md: string[] = [];
  md.push(`# District trim-code conflict resolution`);
  md.push("");
  md.push(`- generatedAt: ${new Date().toISOString()}`);
  md.push(`- apply: ${APPLY}`);
  md.push(`- conflictGroups: ${plans.length}`);
  md.push("");
  for (const p of plans) {
    md.push(`## ${p.groupKey}`);
    md.push("");
    md.push(`- **Canonical:** \`${p.canonicalId}\``);
    md.push(`- **Duplicates:** ${p.duplicateIds.map((id) => `\`${id}\``).join(", ")}`);
    md.push("");
    md.push("| District id | Slug | Code | Display (EN) | Upazilas | Tech profiles | Div. areas |");
    md.push("| --- | --- | --- | --- | ---: | ---: | ---: |");
    for (const r of p.rows) {
      md.push(
        `| \`${r.id}\` | ${r.slug} | ${r.code ?? ""} | ${(displayEnglishLabel(r) || "—").replace(/\|/g, "\\|")} | ${r.stats.upazilaCount} | ${r.stats.aiTechnicianProfileCount} | ${r.stats.aiTechnicianDivisionServiceAreaCount} |`,
      );
    }
    md.push("");
    for (const s of p.steps) md.push(`- ${s}`);
    md.push("");
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    apply: APPLY,
    conflictCount: plans.length,
    plans: plans.map((p) => ({
      groupKey: p.groupKey,
      divisionId: p.divisionId,
      divisionLabel: p.divisionLabel,
      trimmedCode: p.trimmedCode,
      canonicalId: p.canonicalId,
      duplicateIds: p.duplicateIds,
      rows: p.rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        code: r.code,
        name: r.name,
        nameBn: r.nameBn,
        nameEn: r.nameEn,
        displayEnglish: displayEnglishLabel(r),
        upazilaCount: r.stats.upazilaCount,
        aiTechnicianProfileCount: r.stats.aiTechnicianProfileCount,
        aiTechnicianDivisionServiceAreaCount: r.stats.aiTechnicianDivisionServiceAreaCount,
        businessRefTotal: r.stats.businessRefTotal,
        isCanonical: r.id === p.canonicalId,
      })),
      steps: p.steps,
    })),
  };

  fs.writeFileSync(JSON_OUT, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(MD_OUT, md.join("\n"), "utf8");
  console.log(`Wrote ${JSON_OUT}`);
  console.log(`Wrote ${MD_OUT}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
