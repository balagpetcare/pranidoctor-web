/**
 * Scan Division → Village tables for duplicate identity groups (normalized code or
 * display name under the same parent). Writes JSON + Markdown reports.
 *
 * Usage: npx tsx scripts/locations/report-location-duplicates.ts
 *    or: npm run locations:report-duplicates
 *    or: npm run locations:duplicates
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { prisma } from "@/lib/prisma";
import { normalizeLocationCode, normalizeLocationName } from "@/lib/locations/location-data-quality";
import {
  displayEnglishLabel,
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

const REPORT_DIR = path.join(process.cwd(), "data", "locations", "reports");
const JSON_PATH = path.join(REPORT_DIR, "location-duplicates-report.json");
const MD_PATH = path.join(REPORT_DIR, "location-duplicates-report.md");

type RowOut = LocationDedupeBase & {
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  unionId?: string;
};

type GroupOut = {
  identityKey: string;
  count: number;
  canonicalId: string;
  duplicateIds: string[];
  rows: RowOut[];
};

function groupByKey<T extends LocationDedupeBase>(
  rows: T[],
  keyFn: (r: T) => string,
): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const k = keyFn(r);
    const arr = m.get(k) ?? [];
    arr.push(r);
    m.set(k, arr);
  }
  return m;
}

function toGroups<T extends LocationDedupeBase>(
  rows: T[],
  keyFn: (r: T) => string,
): GroupOut[] {
  const m = groupByKey(rows, keyFn);
  const groups: GroupOut[] = [];
  for (const [identityKey, list] of m) {
    if (list.length < 2) continue;
    const canonical = pickCanonicalLocationRow(list);
    const duplicateIds = list.filter((r) => r.id !== canonical.id).map((r) => r.id);
    groups.push({
      identityKey,
      count: list.length,
      canonicalId: canonical.id,
      duplicateIds,
      rows: list.map((r) => ({ ...r })) as RowOut[],
    });
  }
  groups.sort((a, b) => b.count - a.count || a.identityKey.localeCompare(b.identityKey));
  return groups;
}

function mdEscape(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/** Same official code under one parent but different English labels — fix manually (do not auto-merge). */
function districtCodeLabelCollisions(
  rows: (LocationDedupeBase & { divisionId: string })[],
): {
  collisionKey: string;
  code: string;
  distinctLabels: string[];
  rows: RowOut[];
}[] {
  const m = new Map<string, (LocationDedupeBase & { divisionId: string })[]>();
  for (const r of rows) {
    const c = normalizeLocationCode(r.code);
    if (!c) continue;
    const k = `${r.divisionId}|${c}`;
    const arr = m.get(k) ?? [];
    arr.push(r);
    m.set(k, arr);
  }
  const out: {
    collisionKey: string;
    code: string;
    distinctLabels: string[];
    rows: RowOut[];
  }[] = [];
  for (const [collisionKey, list] of m) {
    if (list.length < 2) continue;
    const labels = new Set(
      list.map((r) => normalizeLocationName(displayEnglishLabel(r)).toLowerCase()),
    );
    if (labels.size > 1) {
      const code = normalizeLocationCode(list[0]!.code);
      out.push({
        collisionKey,
        code,
        distinctLabels: [...labels].sort(),
        rows: list.map((r) => ({ ...r })) as RowOut[],
      });
    }
  }
  return out.sort((a, b) => a.collisionKey.localeCompare(b.collisionKey));
}

async function main(): Promise<void> {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const [divisions, districts, upazilas, unions, villages] = await Promise.all([
    prisma.division.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        nameBn: true,
        nameEn: true,
        slug: true,
        createdAt: true,
      },
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

  const divGroups = toGroups(divisions, divisionIdentityKey);
  const distGroups = toGroups(districts, districtIdentityKey);
  const upGroups = toGroups(upazilas, upazilaIdentityKey);
  const unGroups = toGroups(unions, unionIdentityKey);
  const vilGroups = toGroups(villages, villageIdentityKey);

  const divTrim = trimCodeDuplicateGroups(divisions, (r) => divisionTrimCodeKey(r));
  const distTrim = trimCodeDuplicateGroups(districts, (r) =>
    districtTrimCodeKey(r as LocationDedupeBase & { divisionId: string }),
  );
  const upTrim = trimCodeDuplicateGroups(upazilas, (r) =>
    upazilaTrimCodeKey(r as LocationDedupeBase & { districtId: string }),
  );
  const unTrim = trimCodeDuplicateGroups(unions, (r) =>
    unionTrimCodeKey(r as LocationDedupeBase & { upazilaId: string }),
  );
  const vilTrim = trimCodeDuplicateGroups(villages, (r) =>
    villageTrimCodeKey(r as LocationDedupeBase & { unionId: string }),
  );

  const slimTrim = <T extends LocationDedupeBase>(
    groups: { trimKey: string; count: number; safeForAutoMerge: boolean; distinctNormalizedLabels: string[]; rows: T[] }[],
  ) =>
    groups.map((g) => ({
      trimKey: g.trimKey,
      count: g.count,
      safeForAutoMerge: g.safeForAutoMerge,
      distinctNormalizedLabels: g.distinctNormalizedLabels,
      rows: g.rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        code: r.code,
        nameEn: r.nameEn,
        nameBn: r.nameBn,
      })),
    }));

  const districtCodeCollisions = districtCodeLabelCollisions(districts);

  const generatedAt = new Date().toISOString();
  const payload = {
    generatedAt,
    summary: {
      duplicateDivisionGroups: divGroups.length,
      duplicateDistrictGroups: distGroups.length,
      duplicateUpazilaGroups: upGroups.length,
      duplicateUnionGroups: unGroups.length,
      duplicateVillageGroups: vilGroups.length,
      duplicateDivisionRows: divGroups.reduce((s, g) => s + g.count, 0),
      duplicateDistrictRows: distGroups.reduce((s, g) => s + g.count, 0),
      duplicateUpazilaRows: upGroups.reduce((s, g) => s + g.count, 0),
      duplicateUnionRows: unGroups.reduce((s, g) => s + g.count, 0),
      duplicateVillageRows: vilGroups.reduce((s, g) => s + g.count, 0),
      districtCodeCollisionGroups: districtCodeCollisions.length,
      partialUniqueTrimCodeGroupsDivision: divTrim.length,
      partialUniqueTrimCodeGroupsDistrict: distTrim.length,
      partialUniqueTrimCodeGroupsUpazila: upTrim.length,
      partialUniqueTrimCodeGroupsUnion: unTrim.length,
      partialUniqueTrimCodeGroupsVillage: vilTrim.length,
      partialUniqueTrimCodeUnsafeDivision: divTrim.filter((g) => !g.safeForAutoMerge).length,
      partialUniqueTrimCodeUnsafeDistrict: distTrim.filter((g) => !g.safeForAutoMerge).length,
      partialUniqueTrimCodeUnsafeUpazila: upTrim.filter((g) => !g.safeForAutoMerge).length,
      partialUniqueTrimCodeUnsafeUnion: unTrim.filter((g) => !g.safeForAutoMerge).length,
      partialUniqueTrimCodeUnsafeVillage: vilTrim.filter((g) => !g.safeForAutoMerge).length,
    },
    warnings: {
      districtSameCodeDifferentLabels: districtCodeCollisions,
    },
    divisions: divGroups,
    districts: distGroups,
    upazilas: upGroups,
    unions: unGroups,
    villages: vilGroups,
    /** Same trimmed non-empty `code` as enforced by migration `20260511133000_location_dedupe_unique_constraints`. */
    partialUniqueTrimCodeConflicts: {
      divisions: slimTrim(divTrim),
      districts: slimTrim(distTrim),
      upazilas: slimTrim(upTrim),
      unions: slimTrim(unTrim),
      villages: slimTrim(vilTrim),
    },
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2), "utf8");

  const md: string[] = [];
  md.push(`# Location duplicate report`);
  md.push(``);
  md.push(`Generated: **${generatedAt}**`);
  md.push(``);
  md.push(`## Summary`);
  md.push(``);
  md.push(`| Level | Duplicate groups | Rows in those groups |`);
  md.push(`| --- | ---: | ---: |`);
  md.push(
    `| Divisions | ${payload.summary.duplicateDivisionGroups} | ${payload.summary.duplicateDivisionRows} |`,
  );
  md.push(
    `| Districts | ${payload.summary.duplicateDistrictGroups} | ${payload.summary.duplicateDistrictRows} |`,
  );
  md.push(
    `| Upazilas | ${payload.summary.duplicateUpazilaGroups} | ${payload.summary.duplicateUpazilaRows} |`,
  );
  md.push(
    `| Unions | ${payload.summary.duplicateUnionGroups} | ${payload.summary.duplicateUnionRows} |`,
  );
  md.push(
    `| Villages | ${payload.summary.duplicateVillageGroups} | ${payload.summary.duplicateVillageRows} |`,
  );
  md.push(``);
  md.push(
    `**District code collisions (same division + code, different labels):** ${payload.summary.districtCodeCollisionGroups} — fix manually in CSV/DB before applying unique indexes; see \`warnings.districtSameCodeDifferentLabels\` in JSON.`,
  );
  md.push(``);
  md.push(`## Partial unique index risks (trimmed official code)`);
  md.push(``);
  md.push(
    `These groups would block \`CREATE UNIQUE INDEX … (trim(code))\` until merged or corrected. ` +
      `**unsafe** = same trim(code) under parent but **different** normalized English labels — not auto-merged by \`locations:dedupe\`.`,
  );
  md.push(``);
  md.push(`| Level | Groups | Unsafe groups |`);
  md.push(`| --- | ---: | ---: |`);
  md.push(
    `| Division | ${payload.summary.partialUniqueTrimCodeGroupsDivision} | ${payload.summary.partialUniqueTrimCodeUnsafeDivision} |`,
  );
  md.push(
    `| District | ${payload.summary.partialUniqueTrimCodeGroupsDistrict} | ${payload.summary.partialUniqueTrimCodeUnsafeDistrict} |`,
  );
  md.push(
    `| Upazila | ${payload.summary.partialUniqueTrimCodeGroupsUpazila} | ${payload.summary.partialUniqueTrimCodeUnsafeUpazila} |`,
  );
  md.push(
    `| Union | ${payload.summary.partialUniqueTrimCodeGroupsUnion} | ${payload.summary.partialUniqueTrimCodeUnsafeUnion} |`,
  );
  md.push(
    `| Village | ${payload.summary.partialUniqueTrimCodeGroupsVillage} | ${payload.summary.partialUniqueTrimCodeUnsafeVillage} |`,
  );
  md.push(``);
  md.push(`See JSON path \`partialUniqueTrimCodeConflicts\` for row details.`);
  md.push(``);
  md.push(`JSON: \`${path.relative(process.cwd(), JSON_PATH)}\``);
  md.push(``);

  function section(title: string, groups: GroupOut[], maxRows: number): void {
    md.push(`## ${title}`);
    md.push(``);
    if (groups.length === 0) {
      md.push(`_No duplicate groups._`);
      md.push(``);
      return;
    }
    md.push(`| Identity key | Count | Canonical id | Duplicate ids |`);
    md.push(`| --- | ---: | --- | --- |`);
    for (const g of groups.slice(0, maxRows)) {
      md.push(
        `| ${mdEscape(g.identityKey)} | ${g.count} | \`${g.canonicalId}\` | ${g.duplicateIds.map((id) => `\`${id}\``).join(", ")} |`,
      );
    }
    if (groups.length > maxRows) {
      md.push(``);
      md.push(`_…and ${groups.length - maxRows} more groups (see JSON)._`);
    }
    md.push(``);
  }

  md.push(`## District code collisions (manual fix)`);
  md.push(``);
  if (districtCodeCollisions.length === 0) {
    md.push(`_None._`);
  } else {
    md.push(
      `_These rows share a trimmed BBS \`code\` under the same division but have different English labels — **not** safe merge candidates._`,
    );
    md.push(``);
    for (const c of districtCodeCollisions) {
      md.push(
        `- **${mdEscape(c.collisionKey)}** — labels: ${c.distinctLabels.map((l) => `\`${mdEscape(l)}\``).join(", ")}`,
      );
      for (const r of c.rows) {
        md.push(
          `  - \`${r.id}\` slug=${mdEscape(r.slug)} nameEn=${mdEscape(r.nameEn ?? "")}`,
        );
      }
    }
  }
  md.push(``);

  section("Divisions (same code + label, or same label when code empty)", divGroups, 40);
  section("Districts (per division)", distGroups, 40);
  section("Upazilas (per district)", upGroups, 40);
  section("Unions (per upazila)", unGroups, 40);
  section("Villages (per union)", vilGroups, 40);

  fs.writeFileSync(MD_PATH, md.join("\n"), "utf8");

  console.log(`Wrote ${JSON_PATH}`);
  console.log(`Wrote ${MD_PATH}`);
  console.log(JSON.stringify(payload.summary, null, 2));
  if (districtCodeCollisions.length) {
    console.log(
      JSON.stringify(
        { districtCodeCollisions: districtCodeCollisions.length },
        null,
        2,
      ),
    );
  }
  const unsafeTrim =
    payload.summary.partialUniqueTrimCodeUnsafeDivision +
    payload.summary.partialUniqueTrimCodeUnsafeDistrict +
    payload.summary.partialUniqueTrimCodeUnsafeUpazila +
    payload.summary.partialUniqueTrimCodeUnsafeUnion +
    payload.summary.partialUniqueTrimCodeUnsafeVillage;
  if (unsafeTrim > 0) {
    console.log(
      JSON.stringify(
        {
          partialUniqueTrimCodeUnsafeGroupsTotal: unsafeTrim,
          hint: "Unsafe = same trimmed code under parent but different English labels — not auto-merged by locations:dedupe",
        },
        null,
        2,
      ),
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
