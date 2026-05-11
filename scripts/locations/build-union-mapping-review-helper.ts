/**
 * Builds union-parent-mapping-helper.csv from the review CSV + master geo + nuhil bundle.
 * One row per source parent context; up to 3 non-approved candidate targets for manual review.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";
import { normalizeLocationName } from "@/lib/locations/location-data-quality";

import {
  loadMasterGeo,
  mapNuhilDivisionIdToOurDivisionCode,
  type MasterGeo,
  type UpazilaRow,
} from "./_master-csv-index";
import { bodyRows, loadNuhilBundle } from "./_nuhil-bundle";
import { writeCsvFile } from "./_csv-out";

const MAP_DIR = path.join(process.cwd(), "data", "locations", "mappings");
const REVIEW_CSV = path.join(MAP_DIR, "union-parent-mapping-review.csv");
const HELPER_CSV = path.join(MAP_DIR, "union-parent-mapping-helper.csv");
const RAW_UNIONS = path.join(process.cwd(), "data", "locations", "raw", "unions");

const HELPER_HEADER = [
  "source_division_code",
  "source_district_code",
  "source_upazila_code",
  "source_division_name_en",
  "source_district_name_en",
  "source_upazila_name_en",
  "source_division_name_bn",
  "source_district_name_bn",
  "source_upazila_name_bn",
  "failure_reason",
  "candidate_1_target_division_code",
  "candidate_1_target_district_code",
  "candidate_1_target_upazila_code",
  "candidate_1_target_division_name_en",
  "candidate_1_target_district_name_en",
  "candidate_1_target_upazila_name_en",
  "candidate_1_target_division_name_bn",
  "candidate_1_target_district_name_bn",
  "candidate_1_target_upazila_name_bn",
  "candidate_1_reason",
  "candidate_2_target_division_code",
  "candidate_2_target_district_code",
  "candidate_2_target_upazila_code",
  "candidate_2_target_division_name_en",
  "candidate_2_target_district_name_en",
  "candidate_2_target_upazila_name_en",
  "candidate_2_target_division_name_bn",
  "candidate_2_target_district_name_bn",
  "candidate_2_target_upazila_name_bn",
  "candidate_2_reason",
  "candidate_3_target_division_code",
  "candidate_3_target_district_code",
  "candidate_3_target_upazila_code",
  "candidate_3_target_division_name_en",
  "candidate_3_target_district_name_en",
  "candidate_3_target_upazila_name_en",
  "candidate_3_target_division_name_bn",
  "candidate_3_target_district_name_bn",
  "candidate_3_target_upazila_name_bn",
  "candidate_3_reason",
  "manual_target_division_code",
  "manual_target_district_code",
  "manual_target_upazila_code",
  "selected_candidate",
  "review_status",
  "reviewed_by",
  "notes",
] as const;

function nk(s: string): string {
  return normalizeLocationName(s).toLowerCase();
}

function idxHeader(header: string[], name: string): number {
  return header.findIndex((h) => (h ?? "").trim().toLowerCase() === name.toLowerCase());
}

function extractFailureReason(notes: string): string {
  const t = (notes ?? "").trim();
  const i = t.indexOf(";");
  return (i >= 0 ? t.slice(0, i) : t).trim();
}

function namesExact(a: string, b: string): boolean {
  const x = nk(a);
  const y = nk(b);
  return Boolean(x && y && x === y);
}

function namesLoose(a: string, b: string): boolean {
  const x = nk(a);
  const y = nk(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.length >= 4 && y.length >= 4 && (x.includes(y) || y.includes(x))) return true;
  return false;
}

function districtMatchesSource(
  geo: MasterGeo,
  d: { divisionCode: string; districtCode: string; nameEn: string; nameBn: string },
  srcDistEn: string,
  srcDistBn: string,
): boolean {
  return (
    namesExact(d.nameEn, srcDistEn) ||
    namesExact(d.nameBn, srcDistEn) ||
    namesExact(d.nameEn, srcDistBn) ||
    namesExact(d.nameBn, srcDistBn) ||
    namesLoose(d.nameEn, srcDistEn) ||
    namesLoose(d.nameBn, srcDistBn)
  );
}

type UpMatchKind = "exact_bn" | "exact_en" | "similar";

function classifyUpazilaMatch(u: UpazilaRow, srcUpEn: string, srcUpBn: string): UpMatchKind | null {
  const knEn = nk(srcUpEn);
  const knBn = nk(srcUpBn);
  if (knBn && (nk(u.nameBn) === knBn || nk(u.nameEn) === knBn)) return "exact_bn";
  if (knEn && (nk(u.nameEn) === knEn || nk(u.nameBn) === knEn)) return "exact_en";
  if (knEn.length >= 4) {
    for (const lab of [u.nameEn, u.nameBn]) {
      const k = nk(lab);
      if (k && (k.includes(knEn) || knEn.includes(k))) return "similar";
    }
  }
  if (knBn.length >= 4) {
    for (const lab of [u.nameEn, u.nameBn]) {
      const k = nk(lab);
      if (k && (k.includes(knBn) || knBn.includes(k))) return "similar";
    }
  }
  return null;
}

type ScoredCand = {
  div: string;
  dist: string;
  up: string;
  score: number;
  reason: string;
};

function targetBnEn(
  geo: MasterGeo,
  divCode: string,
  distCode: string,
  upCode: string,
): {
  divEn: string;
  distEn: string;
  upEn: string;
  divBn: string;
  distBn: string;
  upBn: string;
} {
  const div = geo.divisionsByCode.get(divCode);
  const dist = geo.districtsByCode.get(distCode);
  const up = geo.upazilasByDistrictAndCode.get(`${distCode}|${upCode}`);
  return {
    divEn: div?.nameEn ?? "",
    distEn: dist?.nameEn ?? "",
    upEn: up?.nameEn ?? "",
    divBn: div?.nameBn ?? "",
    distBn: dist?.nameBn ?? "",
    upBn: up?.nameBn ?? "",
  };
}

function collectCandidates(
  geo: MasterGeo,
  opts: {
    ourDiv: string | null;
    srcDivEn: string;
    srcDistEn: string;
    srcDistBn: string;
    srcUpEn: string;
    srcUpBn: string;
    divisionUnmapped: boolean;
  },
): ScoredCand[] {
  const { ourDiv, srcDivEn, srcDistEn, srcDistBn, srcUpEn, srcUpBn, divisionUnmapped } = opts;
  const pool: ScoredCand[] = [];
  const seen = new Set<string>();

  const push = (c: ScoredCand) => {
    const k = `${c.div}|${c.dist}|${c.up}`;
    if (seen.has(k)) return;
    seen.add(k);
    pool.push(c);
  };

  for (const u of geo.upazilas) {
    const distRow = geo.districtsByCode.get(u.districtCode);
    if (!distRow) continue;
    const divCode = distRow.divisionCode;
    const upKind = classifyUpazilaMatch(u, srcUpEn, srcUpBn);
    if (!upKind) continue;

    const distHit = districtMatchesSource(geo, distRow, srcDistEn, srcDistBn);
    let score = 0;
    let reason = "";

    if (upKind === "exact_bn") {
      score += 100;
      reason = "Exact normalized Bangla (or cross-field) upazila name match";
    } else if (upKind === "exact_en") {
      score += 95;
      reason = "Exact normalized English (or cross-field) upazila name match";
    } else {
      score += 55;
      reason = "District + upazila name similarity (token / substring)";
      if (!distHit) {
        score -= 40;
        reason = "Upazila name similarity only (weak — verify district)";
      }
    }

    if (distHit) {
      score += 45;
      if (!reason.includes("District")) {
        reason = `Target district aligns with source district name; ${reason}`;
      }
    }

    if (ourDiv && divCode === ourDiv) {
      score += 50;
      reason = `Within mapped HDX division (${srcDivEn || "nuhil"}); ${reason}`;
    } else if (ourDiv) {
      score -= 25;
      reason = `Different HDX division than nuhil-mapped ${ourDiv}; ${reason}`;
    }

    if (divisionUnmapped || !ourDiv) {
      reason = `nuhil division missing or unmapped — searched all divisions; ${reason}`;
    }

    push({
      div: divCode,
      dist: distRow.districtCode,
      up: u.upazilaCode,
      score,
      reason: reason.replace(/;\s*;/g, "; ").trim(),
    });
  }

  pool.sort((a, b) => b.score - a.score || a.dist.localeCompare(b.dist) || a.up.localeCompare(b.up));
  return pool.slice(0, 3);
}

function enrichFromNuhil(
  nuhil: NonNullable<ReturnType<typeof loadNuhilBundle>>,
  srcDivId: string,
  srcDistId: string,
  srcUpId: string,
): {
  srcDivEn: string;
  srcDivBn: string;
  srcDistEn: string;
  srcDistBn: string;
  srcUpEn: string;
  srcUpBn: string;
} {
  let srcDivEn = "";
  let srcDivBn = "";
  let srcDistEn = "";
  let srcDistBn = "";
  let srcUpEn = "";
  let srcUpBn = "";

  const up = nuhil.upazilas.get(srcUpId);
  if (up) {
    srcUpEn = up.nameEn;
    srcUpBn = up.nameBn;
    const dist = nuhil.districts.get(up.districtId);
    if (dist) {
      srcDistEn = dist.nameEn;
      srcDistBn = dist.nameBn;
      const div = nuhil.divisions.get(dist.divisionId);
      if (div) {
        srcDivEn = div.nameEn;
        srcDivBn = div.nameBn;
      }
    }
  } else {
    const dist = nuhil.districts.get(srcDistId);
    if (dist) {
      srcDistEn = dist.nameEn;
      srcDistBn = dist.nameBn;
      const div = nuhil.divisions.get(dist.divisionId);
      if (div) {
        srcDivEn = div.nameEn;
        srcDivBn = div.nameBn;
      }
    }
  }
  if (!srcDivEn && srcDivId) {
    const div = nuhil.divisions.get(srcDivId);
    if (div) {
      srcDivEn = div.nameEn;
      srcDivBn = div.nameBn;
    }
  }
  return { srcDivEn, srcDivBn, srcDistEn, srcDistBn, srcUpEn, srcUpBn };
}

function main(): void {
  const geo = loadMasterGeo();
  const nuhil = loadNuhilBundle();

  if (!fs.existsSync(REVIEW_CSV)) {
    console.error(`Missing ${REVIEW_CSV}. Run npm run locations:suggest-union-mappings first.`);
    process.exit(1);
  }

  const raw = fs.readFileSync(REVIEW_CSV, "utf8").trim();
  const rows = parseCsv(raw);
  const h = rows[0] ?? [];
  const iSd = idxHeader(h, "source_division_code");
  const iSdi = idxHeader(h, "source_district_code");
  const iSu = idxHeader(h, "source_upazila_code");
  const iNotes = idxHeader(h, "notes");
  const iSde = idxHeader(h, "source_division_name_en");
  const iSdiE = idxHeader(h, "source_district_name_en");
  const iSue = idxHeader(h, "source_upazila_name_en");
  const iSdb = idxHeader(h, "source_division_name_bn");
  const iSdib = idxHeader(h, "source_district_name_bn");
  const iSub = idxHeader(h, "source_upazila_name_bn");
  if ([iSd, iSdi, iSu, iNotes].some((i) => i < 0)) {
    console.error("Review CSV missing required columns.");
    process.exit(1);
  }

  const preserved = new Map<string, string[]>();
  if (fs.existsSync(HELPER_CSV)) {
    const prev = parseCsv(fs.readFileSync(HELPER_CSV, "utf8").trim());
    const ph = prev[0] ?? [];
    const pick = (name: string) => idxHeader(ph, name);
    const keys = [
      "source_division_code",
      "source_district_code",
      "source_upazila_code",
      "manual_target_division_code",
      "manual_target_district_code",
      "manual_target_upazila_code",
      "selected_candidate",
      "review_status",
      "reviewed_by",
      "notes",
    ] as const;
    const idx: Record<(typeof keys)[number], number> = {
      source_division_code: pick("source_division_code"),
      source_district_code: pick("source_district_code"),
      source_upazila_code: pick("source_upazila_code"),
      manual_target_division_code: pick("manual_target_division_code"),
      manual_target_district_code: pick("manual_target_district_code"),
      manual_target_upazila_code: pick("manual_target_upazila_code"),
      selected_candidate: pick("selected_candidate"),
      review_status: pick("review_status"),
      reviewed_by: pick("reviewed_by"),
      notes: pick("notes"),
    };
    if (idx.source_division_code >= 0 && idx.source_district_code >= 0 && idx.source_upazila_code >= 0) {
      for (const r of bodyRows(prev)) {
        const k = `${(r[idx.source_division_code] ?? "").trim()}|${(r[idx.source_district_code] ?? "").trim()}|${(r[idx.source_upazila_code] ?? "").trim()}`;
        preserved.set(k, [
          (r[idx.manual_target_division_code] ?? "").trim(),
          (r[idx.manual_target_district_code] ?? "").trim(),
          (r[idx.manual_target_upazila_code] ?? "").trim(),
          (r[idx.selected_candidate] ?? "").trim(),
          (r[idx.review_status] ?? "").trim(),
          (r[idx.reviewed_by] ?? "").trim(),
          (r[idx.notes] ?? "").trim(),
        ]);
      }
    }
  }

  const outRows: string[][] = [];
  let totalCandidates = 0;
  let contexts = 0;
  let rowsWithZeroCandidates = 0;

  for (const r of bodyRows(rows)) {
    contexts += 1;
    const srcDivId = (r[iSd] ?? "").trim();
    const srcDistId = (r[iSdi] ?? "").trim();
    const srcUpId = (r[iSu] ?? "").trim();
    const notesFull = (r[iNotes] ?? "").trim();
    const failureReason = extractFailureReason(notesFull);

    let srcDivEn = (r[iSde] ?? "").trim();
    let srcDistEn = (r[iSdiE] ?? "").trim();
    let srcUpEn = (r[iSue] ?? "").trim();
    let srcDivBn = (r[iSdb] ?? "").trim();
    let srcDistBn = (r[iSdib] ?? "").trim();
    let srcUpBn = (r[iSub] ?? "").trim();

    if (nuhil && (!srcDivEn || !srcDistEn || !srcUpEn)) {
      const en = enrichFromNuhil(nuhil, srcDivId, srcDistId, srcUpId);
      if (!srcDivEn) srcDivEn = en.srcDivEn;
      if (!srcDivBn) srcDivBn = en.srcDivBn;
      if (!srcDistEn) srcDistEn = en.srcDistEn;
      if (!srcDistBn) srcDistBn = en.srcDistBn;
      if (!srcUpEn) srcUpEn = en.srcUpEn;
      if (!srcUpBn) srcUpBn = en.srcUpBn;
    }

    const ourDiv = srcDivEn
      ? mapNuhilDivisionIdToOurDivisionCode(geo, srcDivId, srcDivEn)
      : null;
    const divisionUnmapped =
      failureReason === "nuhil_division_map_failed" ||
      failureReason === "nuhil_missing_division" ||
      !srcDivEn;

    const cands = collectCandidates(geo, {
      ourDiv,
      srcDivEn,
      srcDistEn,
      srcDistBn,
      srcUpEn,
      srcUpBn,
      divisionUnmapped,
    });

    totalCandidates += cands.length;
    if (cands.length === 0) rowsWithZeroCandidates += 1;

    const candCells: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const c = cands[i];
      if (!c) {
        candCells.push("", "", "", "", "", "", "", "", "", "");
        continue;
      }
      const t = targetBnEn(geo, c.div, c.dist, c.up);
      candCells.push(
        c.div,
        c.dist,
        c.up,
        t.divEn,
        t.distEn,
        t.upEn,
        t.divBn,
        t.distBn,
        t.upBn,
        c.reason,
      );
    }

    const key = `${srcDivId}|${srcDistId}|${srcUpId}`;
    const prevRow = preserved.get(key);
    const manualDiv = prevRow?.[0] ?? "";
    const manualDist = prevRow?.[1] ?? "";
    const manualUp = prevRow?.[2] ?? "";
    const selected = prevRow?.[3] ?? "";
    const revStatus = (prevRow?.[4] || "PENDING").trim() || "PENDING";
    const reviewedBy = prevRow?.[5] ?? "";
    const userNotes = prevRow?.[6] ?? "";

    const mergedNotes = [notesFull, userNotes].filter(Boolean).join(" | ");

    outRows.push([
      srcDivId,
      srcDistId,
      srcUpId,
      srcDivEn,
      srcDistEn,
      srcUpEn,
      srcDivBn,
      srcDistBn,
      srcUpBn,
      failureReason,
      ...candCells,
      manualDiv,
      manualDist,
      manualUp,
      selected,
      revStatus.toUpperCase() === "APPROVED" ? "APPROVED" : "PENDING",
      reviewedBy,
      mergedNotes,
    ]);
  }

  fs.mkdirSync(path.dirname(HELPER_CSV), { recursive: true });
  writeCsvFile(HELPER_CSV, [...HELPER_HEADER], outRows);

  const nuhilNote = fs.existsSync(path.join(RAW_UNIONS, "nuhil-divisions.csv"))
    ? "nuhil bundle found under data/locations/raw/unions/"
    : "nuhil bundle not found — names taken from review CSV only";

  const summary = {
    generatedAt: new Date().toISOString(),
    reviewCsv: REVIEW_CSV,
    helperCsv: HELPER_CSV,
    sourceParentContexts: contexts,
    helperRowsWritten: outRows.length,
    candidateSlotsFilled: totalCandidates,
    rowsWithAtLeastOneCandidate: contexts - rowsWithZeroCandidates,
    rowsWithZeroCandidates,
    preservedManualFieldsFromExistingHelper: preserved.size,
    notes: [
      nuhilNote,
      "All rows use review_status=PENDING unless preserved from a previous helper file.",
      "Candidates are suggestions only — verify before APPROVED.",
    ],
  };
  console.log(JSON.stringify(summary, null, 2));
}

main();
