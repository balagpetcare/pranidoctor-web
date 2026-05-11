/**
 * Suggest HDX parent targets for nuhil union parent chains that failed automatic matching.
 * Writes review CSV (all PENDING) + JSON report. Humans copy APPROVED rows to union-parent-mapping.csv.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";
import { normalizeLocationName } from "@/lib/locations/location-data-quality";

import {
  loadMasterGeo,
  mapNuhilDivisionIdToOurDivisionCode,
  resolveDistrict,
  resolveUpazila,
  type MasterGeo,
  type UpazilaRow,
} from "./_master-csv-index";
import { bodyRows, loadNuhilBundle, type NuhilMaps } from "./_nuhil-bundle";
import { writeCsvFile } from "./_csv-out";

const MAP_DIR = path.join(process.cwd(), "data", "locations", "mappings");
const REVIEW_CSV = path.join(MAP_DIR, "union-parent-mapping-review.csv");
const REPORT_JSON = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "union-parent-mapping-report.json",
);

const REVIEW_HEADER = [
  "source_division_code",
  "source_district_code",
  "source_upazila_code",
  "source_division_name_en",
  "source_district_name_en",
  "source_upazila_name_en",
  "source_division_name_bn",
  "source_district_name_bn",
  "source_upazila_name_bn",
  "target_division_code",
  "target_district_code",
  "target_upazila_code",
  "target_division_name_en",
  "target_district_name_en",
  "target_upazila_name_en",
  "match_confidence",
  "match_method",
  "review_status",
  "notes",
];

type Confidence = "HIGH" | "MEDIUM" | "LOW";

type ParentCtx = {
  key: string;
  failure: string;
  unionCount: number;
  srcDivId: string;
  srcDistId: string;
  srcUpId: string;
  srcDivEn: string;
  srcDivBn: string;
  srcDistEn: string;
  srcDistBn: string;
  srcUpEn: string;
  srcUpBn: string;
};

function nk(s: string): string {
  return normalizeLocationName(s).toLowerCase();
}

function listUpazilasInDistrict(geo: MasterGeo, districtCode: string): UpazilaRow[] {
  return geo.upazilas.filter((u) => u.districtCode === districtCode);
}

function matchUpazilasStrict(
  geo: MasterGeo,
  districtCode: string,
  upEn: string,
  upBn: string,
): { matches: UpazilaRow[]; method: string } {
  const cands = listUpazilasInDistrict(geo, districtCode);
  const enK = nk(upEn);
  const bnK = nk(upBn);
  const both =
    enK &&
    bnK &&
    cands.filter(
      (u) =>
        (nk(u.nameEn) === enK || nk(u.nameBn) === enK) &&
        (nk(u.nameBn) === bnK || nk(u.nameEn) === bnK),
    );
  if (both && both.length === 1) return { matches: both, method: "EN_AND_BN_EXACT" };
  const enOnly = enK
    ? cands.filter((u) => nk(u.nameEn) === enK || nk(u.nameBn) === enK)
    : [];
  if (!bnK && enOnly.length === 1) return { matches: enOnly, method: "EN_SINGLE_NO_BN" };
  if (enOnly.length === 1) return { matches: enOnly, method: "EN_EXACT_SINGLE" };
  const bnOnly = bnK
    ? cands.filter((u) => nk(u.nameBn) === bnK || nk(u.nameEn) === bnK)
    : [];
  if (bnOnly.length === 1) return { matches: bnOnly, method: "BN_EXACT_SINGLE" };
  return { matches: [], method: "NONE_OR_AMBIGUOUS" };
}

function suggestForContext(
  geo: MasterGeo,
  nuhil: NuhilMaps,
  ctx: ParentCtx,
): {
  targetDiv: string;
  targetDist: string;
  targetUp: string;
  tgtDivEn: string;
  tgtDistEn: string;
  tgtUpEn: string;
  confidence: Confidence;
  method: string;
  notes: string;
} {
  const empty = () => ({
    targetDiv: "",
    targetDist: "",
    targetUp: "",
    tgtDivEn: "",
    tgtDistEn: "",
    tgtUpEn: "",
    confidence: "LOW" as Confidence,
    method: "NONE",
    notes: "",
  });

  if (ctx.failure === "nuhil_missing_upazila") {
    const o = empty();
    o.notes = `nuhil upazila id ${ctx.srcUpId} missing from nuhil-upazilas.csv; ${ctx.unionCount} unions reference it.`;
    return o;
  }
  if (ctx.failure === "nuhil_missing_district") {
    const o = empty();
    o.notes = `nuhil district id ${ctx.srcDistId} missing; ${ctx.unionCount} unions.`;
    return o;
  }
  if (ctx.failure === "nuhil_missing_division") {
    const o = empty();
    o.notes = `nuhil division id ${ctx.srcDivId} missing; ${ctx.unionCount} unions.`;
    return o;
  }
  if (ctx.failure === "nuhil_division_map_failed") {
    const o = empty();
    o.notes = `Could not map nuhil division name "${ctx.srcDivEn}" to HDX division code.`;
    return o;
  }

  const ourDiv = mapNuhilDivisionIdToOurDivisionCode(geo, ctx.srcDivId, ctx.srcDivEn);
  if (!ourDiv) {
    const o = empty();
    o.notes = "Division map failed (unexpected).";
    return o;
  }
  const divRow = geo.divisionsByCode.get(ourDiv);
  const tgtDivEn = divRow?.nameEn ?? "";

  if (ctx.failure === "nuhil_district_name_no_match") {
    const knEn = nk(ctx.srcDistEn);
    const knBn = nk(ctx.srcDistBn);
    const pool = geo.districts.filter((d) => d.divisionCode === ourDiv);
    const hits = pool.filter(
      (d) =>
        (knEn && (nk(d.nameEn) === knEn || nk(d.nameBn) === knEn)) ||
        (knBn && (nk(d.nameBn) === knBn || nk(d.nameEn) === knBn)),
    );
    if (hits.length === 1) {
      const d = hits[0]!;
      return {
        targetDiv: ourDiv,
        targetDist: d.districtCode,
        targetUp: "",
        tgtDivEn,
        tgtDistEn: d.nameEn,
        tgtUpEn: "",
        confidence: "MEDIUM",
        method: "DISTRICT_NAME_UNIQUE_IN_DIVISION",
        notes: `Unique district name match; upazila not resolved — fill target_upazila manually or re-run after fixing district spelling in source. Unions affected: ${ctx.unionCount}.`,
      };
    }
    const o = empty();
    o.targetDiv = ourDiv;
    o.tgtDivEn = tgtDivEn;
    o.notes = `District match ambiguous (${hits.length} candidates) or zero. Unions: ${ctx.unionCount}.`;
    return o;
  }

  if (ctx.failure === "nuhil_upazila_name_no_match") {
    const ourDist = resolveDistrict(geo, ourDiv, null, ctx.srcDistEn, ctx.srcDistBn);
    if (!ourDist) {
      const o = empty();
      o.targetDiv = ourDiv;
      o.tgtDivEn = tgtDivEn;
      o.notes = "District resolved in suggest path failed (inconsistent with failure tag).";
      return o;
    }
    const { matches, method } = matchUpazilasStrict(
      geo,
      ourDist.districtCode,
      ctx.srcUpEn,
      ctx.srcUpBn,
    );
    if (matches.length === 1) {
      const u = matches[0]!;
      const conf: Confidence =
        method === "EN_AND_BN_EXACT" || method === "EN_SINGLE_NO_BN"
          ? "HIGH"
          : method === "BN_EXACT_SINGLE"
            ? "MEDIUM"
            : "MEDIUM";
      return {
        targetDiv: ourDiv,
        targetDist: ourDist.districtCode,
        targetUp: u.upazilaCode,
        tgtDivEn,
        tgtDistEn: ourDist.nameEn,
        tgtUpEn: u.nameEn,
        confidence: conf,
        method,
        notes: `Unions in this upazila bucket: ${ctx.unionCount}.`,
      };
    }
    const o = empty();
    o.targetDiv = ourDiv;
    o.targetDist = ourDist.districtCode;
    o.tgtDivEn = tgtDivEn;
    o.tgtDistEn = ourDist.nameEn;
    o.notes = `Upazila "${ctx.srcUpEn}" / "${ctx.srcUpBn}": ${matches.length} HDX matches in district ${ourDist.districtCode}. Unions: ${ctx.unionCount}.`;
    return o;
  }

  void nuhil;
  const o = empty();
  o.notes = `Unknown failure ${ctx.failure}`;
  return o;
}

function classifyUnion(
  geo: MasterGeo,
  nuhil: NuhilMaps,
  u: { id: string; upazilaId: string; nameEn: string; nameBn: string },
):
  | { ok: true }
  | {
      ok: false;
      failure: string;
      srcDivId: string;
      srcDistId: string;
      srcUpId: string;
      srcDivEn: string;
      srcDivBn: string;
      srcDistEn: string;
      srcDistBn: string;
      srcUpEn: string;
      srcUpBn: string;
    } {
  const up = nuhil.upazilas.get(u.upazilaId);
  if (!up) {
    return {
      ok: false,
      failure: "nuhil_missing_upazila",
      srcDivId: "",
      srcDistId: "",
      srcUpId: u.upazilaId,
      srcDivEn: "",
      srcDivBn: "",
      srcDistEn: "",
      srcDistBn: "",
      srcUpEn: "",
      srcUpBn: "",
    };
  }
  const dist = nuhil.districts.get(up.districtId);
  if (!dist) {
    return {
      ok: false,
      failure: "nuhil_missing_district",
      srcDivId: "",
      srcDistId: up.districtId,
      srcUpId: u.upazilaId,
      srcDivEn: "",
      srcDivBn: "",
      srcDistEn: "",
      srcDistBn: "",
      srcUpEn: up.nameEn,
      srcUpBn: up.nameBn,
    };
  }
  const div = nuhil.divisions.get(dist.divisionId);
  if (!div) {
    return {
      ok: false,
      failure: "nuhil_missing_division",
      srcDivId: dist.divisionId,
      srcDistId: up.districtId,
      srcUpId: u.upazilaId,
      srcDivEn: "",
      srcDivBn: "",
      srcDistEn: dist.nameEn,
      srcDistBn: dist.nameBn,
      srcUpEn: up.nameEn,
      srcUpBn: up.nameBn,
    };
  }
  const ourDiv = mapNuhilDivisionIdToOurDivisionCode(geo, dist.divisionId, div.nameEn);
  if (!ourDiv) {
    return {
      ok: false,
      failure: "nuhil_division_map_failed",
      srcDivId: dist.divisionId,
      srcDistId: up.districtId,
      srcUpId: u.upazilaId,
      srcDivEn: div.nameEn,
      srcDivBn: div.nameBn,
      srcDistEn: dist.nameEn,
      srcDistBn: dist.nameBn,
      srcUpEn: up.nameEn,
      srcUpBn: up.nameBn,
    };
  }
  const ourDist = resolveDistrict(geo, ourDiv, null, dist.nameEn, dist.nameBn);
  if (!ourDist) {
    return {
      ok: false,
      failure: "nuhil_district_name_no_match",
      srcDivId: dist.divisionId,
      srcDistId: up.districtId,
      srcUpId: u.upazilaId,
      srcDivEn: div.nameEn,
      srcDivBn: div.nameBn,
      srcDistEn: dist.nameEn,
      srcDistBn: dist.nameBn,
      srcUpEn: up.nameEn,
      srcUpBn: up.nameBn,
    };
  }
  const ourUp = resolveUpazila(geo, ourDist.districtCode, null, up.nameEn, up.nameBn);
  if (!ourUp) {
    return {
      ok: false,
      failure: "nuhil_upazila_name_no_match",
      srcDivId: dist.divisionId,
      srcDistId: up.districtId,
      srcUpId: u.upazilaId,
      srcDivEn: div.nameEn,
      srcDivBn: div.nameBn,
      srcDistEn: dist.nameEn,
      srcDistBn: dist.nameBn,
      srcUpEn: up.nameEn,
      srcUpBn: up.nameBn,
    };
  }
  void u;
  return { ok: true };
}

function main(): void {
  const geo = loadMasterGeo();
  const nuhil = loadNuhilBundle();
  const generatedAt = new Date().toISOString();
  const notes: string[] = [];

  if (!nuhil) {
    notes.push("nuhil bundle missing under data/locations/raw/unions/");
    const report = {
      generatedAt,
      unmatchedUnionRowsBefore: 0,
      uniqueSourceParentCombinations: 0,
      high: 0,
      medium: 0,
      low: 0,
      approvedMappingsAppliedHint: 0,
      notes,
    };
    fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
    fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  const agg = new Map<string, ParentCtx>();

  for (const u of nuhil.unions) {
    const c = classifyUnion(geo, nuhil, u);
    if (c.ok) continue;
    const key = `${c.failure}|${c.srcDivId}|${c.srcDistId}|${c.srcUpId}`;
    const ex = agg.get(key);
    if (ex) {
      ex.unionCount += 1;
    } else {
      agg.set(key, {
        key,
        failure: c.failure,
        unionCount: 1,
        srcDivId: c.srcDivId,
        srcDistId: c.srcDistId,
        srcUpId: c.srcUpId,
        srcDivEn: c.srcDivEn,
        srcDivBn: c.srcDivBn,
        srcDistEn: c.srcDistEn,
        srcDistBn: c.srcDistBn,
        srcUpEn: c.srcUpEn,
        srcUpBn: c.srcUpBn,
      });
    }
  }

  const contexts = [...agg.values()].sort((a, b) => a.key.localeCompare(b.key));
  const failureBreakdown: Record<string, number> = {};
  for (const ctx of contexts) {
    failureBreakdown[ctx.failure] = (failureBreakdown[ctx.failure] ?? 0) + 1;
  }
  const reviewRows: string[][] = [];
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const ctx of contexts) {
    const s = suggestForContext(geo, nuhil, ctx);
    if (s.confidence === "HIGH") high += 1;
    else if (s.confidence === "MEDIUM") medium += 1;
    else low += 1;

    reviewRows.push([
      ctx.srcDivId,
      ctx.srcDistId,
      ctx.srcUpId,
      ctx.srcDivEn,
      ctx.srcDistEn,
      ctx.srcUpEn,
      ctx.srcDivBn,
      ctx.srcDistBn,
      ctx.srcUpBn,
      s.targetDiv,
      s.targetDist,
      s.targetUp,
      s.tgtDivEn,
      s.tgtDistEn,
      s.tgtUpEn,
      s.confidence,
      s.method,
      "PENDING",
      `${ctx.failure}; ${s.notes}`,
    ]);
  }

  fs.mkdirSync(MAP_DIR, { recursive: true });
  writeCsvFile(REVIEW_CSV, REVIEW_HEADER, reviewRows);

  const unmatchedUnionRows = nuhil.unions.filter((u) => !classifyUnion(geo, nuhil, u).ok).length;

  let approvedCount = 0;
  const approvedPath = path.join(MAP_DIR, "union-parent-mapping.csv");
  if (fs.existsSync(approvedPath)) {
    const raw = fs.readFileSync(approvedPath, "utf8").trim();
    if (raw) {
      const rows = parseCsv(raw);
      const h = rows[0] ?? [];
      const st = h.findIndex((x) => x.trim().toLowerCase() === "review_status");
      if (st >= 0) {
        for (const r of bodyRows(rows)) {
          if ((r[st] ?? "").trim().toUpperCase() === "APPROVED") approvedCount += 1;
        }
      }
    }
  }

  const report = {
    generatedAt,
    unmatchedUnionRowsBefore: unmatchedUnionRows,
    uniqueSourceParentCombinations: contexts.length,
    high,
    medium,
    low,
    failureBreakdown,
    approvedMappingsInFile: approvedCount,
    reviewCsv: REVIEW_CSV,
    reportJson: REPORT_JSON,
    notes: [
      ...notes,
      "All review rows use review_status=PENDING. Copy rows you approve into union-parent-mapping.csv with review_status=APPROVED.",
    ],
  };
  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main();
