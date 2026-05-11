/**
 * Applies APPROVED rows from union-parent-mapping-helper.csv into union-parent-mapping.csv.
 * Only writes validated targets; never copies PENDING rows.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";

import { loadMasterGeo } from "./_master-csv-index";
import { bodyRows } from "./_nuhil-bundle";
import { writeCsvFile } from "./_csv-out";

const MAP_DIR = path.join(process.cwd(), "data", "locations", "mappings");
const HELPER_CSV = path.join(MAP_DIR, "union-parent-mapping-helper.csv");
const APPROVED_CSV = path.join(MAP_DIR, "union-parent-mapping.csv");
const REPORT_JSON = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "approved-union-parent-mapping-report.json",
);

const OUT_HEADER = [
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
] as const;

function idxHeader(header: string[], name: string): number {
  return header.findIndex((h) => (h ?? "").trim().toLowerCase() === name.toLowerCase());
}

function sourceKey(r: string[], iSd: number, iSdi: number, iSu: number): string {
  return `${(r[iSd] ?? "").trim()}|${(r[iSdi] ?? "").trim()}|${(r[iSu] ?? "").trim()}`;
}

type Validated = {
  tgtDiv: string;
  tgtDist: string;
  tgtUp: string;
  tgtDivEn: string;
  tgtDistEn: string;
  tgtUpEn: string;
};

function validateTarget(
  geo: ReturnType<typeof loadMasterGeo>,
  tgtDiv: string,
  tgtDist: string,
  tgtUp: string,
): Validated | null {
  if (!tgtDiv || !tgtDist || !tgtUp) return null;
  if (!geo.divisionsByCode.has(tgtDiv)) return null;
  const dRow = geo.districtsByCode.get(tgtDist);
  if (!dRow || dRow.divisionCode !== tgtDiv) return null;
  const u = geo.upazilasByDistrictAndCode.get(`${tgtDist}|${tgtUp}`);
  if (!u) return null;
  const div = geo.divisionsByCode.get(tgtDiv)!;
  return {
    tgtDiv,
    tgtDist,
    tgtUp,
    tgtDivEn: div.nameEn,
    tgtDistEn: dRow.nameEn,
    tgtUpEn: u.nameEn,
  };
}

type HelperIdx = {
  source_division_code: number;
  source_district_code: number;
  source_upazila_code: number;
  source_division_name_en: number;
  source_district_name_en: number;
  source_upazila_name_en: number;
  source_division_name_bn: number;
  source_district_name_bn: number;
  source_upazila_name_bn: number;
  review_status: number;
  notes: number;
  /** -1 if column absent */
  manual_target_division_code: number;
  manual_target_district_code: number;
  manual_target_upazila_code: number;
  selected_candidate: number;
  c1div: number;
  c1dist: number;
  c1up: number;
  c2div: number;
  c2dist: number;
  c2up: number;
  c3div: number;
  c3dist: number;
  c3up: number;
};

function readHelperIndices(header: string[]): HelperIdx | null {
  const req = (name: string) => {
    const i = idxHeader(header, name);
    return i >= 0 ? i : -1;
  };
  const opt = (name: string) => {
    const i = idxHeader(header, name);
    return i >= 0 ? i : -1;
  };
  const idx: HelperIdx = {
    source_division_code: req("source_division_code"),
    source_district_code: req("source_district_code"),
    source_upazila_code: req("source_upazila_code"),
    source_division_name_en: opt("source_division_name_en"),
    source_district_name_en: opt("source_district_name_en"),
    source_upazila_name_en: opt("source_upazila_name_en"),
    source_division_name_bn: opt("source_division_name_bn"),
    source_district_name_bn: opt("source_district_name_bn"),
    source_upazila_name_bn: opt("source_upazila_name_bn"),
    review_status: req("review_status"),
    notes: opt("notes"),
    manual_target_division_code: req("manual_target_division_code"),
    manual_target_district_code: req("manual_target_district_code"),
    manual_target_upazila_code: req("manual_target_upazila_code"),
    selected_candidate: req("selected_candidate"),
    c1div: req("candidate_1_target_division_code"),
    c1dist: req("candidate_1_target_district_code"),
    c1up: req("candidate_1_target_upazila_code"),
    c2div: req("candidate_2_target_division_code"),
    c2dist: req("candidate_2_target_district_code"),
    c2up: req("candidate_2_target_upazila_code"),
    c3div: req("candidate_3_target_division_code"),
    c3dist: req("candidate_3_target_district_code"),
    c3up: req("candidate_3_target_upazila_code"),
  };
  const required: (keyof HelperIdx)[] = [
    "source_division_code",
    "source_district_code",
    "source_upazila_code",
    "review_status",
    "manual_target_division_code",
    "manual_target_district_code",
    "manual_target_upazila_code",
    "selected_candidate",
    "c1div",
    "c1dist",
    "c1up",
    "c2div",
    "c2dist",
    "c2up",
    "c3div",
    "c3dist",
    "c3up",
  ];
  if (required.some((k) => idx[k] < 0)) return null;
  return idx;
}

function cell(r: string[], i: number): string {
  if (i < 0) return "";
  return (r[i] ?? "").trim();
}

function pickFromHelperRow(
  geo: ReturnType<typeof loadMasterGeo>,
  r: string[],
  ix: HelperIdx,
): { ok: true; v: Validated } | { ok: false; reason: string } {
  const manualDiv = cell(r, ix.manual_target_division_code);
  const manualDist = cell(r, ix.manual_target_district_code);
  const manualUp = cell(r, ix.manual_target_upazila_code);
  const sel = cell(r, ix.selected_candidate).toUpperCase();
  const manualCount = [manualDiv, manualDist, manualUp].filter(Boolean).length;
  if (manualCount > 0 && manualCount < 3) {
    return {
      ok: false,
      reason: "manual_target_* is incomplete — provide all three codes or leave all empty",
    };
  }

  if (manualCount === 3) {
    const v = validateTarget(geo, manualDiv, manualDist, manualUp);
    if (v) return { ok: true, v };
    return { ok: false, reason: "manual_target_* failed validation against master CSVs" };
  }

  if (sel === "MANUAL") {
    return {
      ok: false,
      reason: "selected_candidate=MANUAL requires all manual_target_* codes",
    };
  }

  if (sel === "1" || sel === "2" || sel === "3") {
    const map = {
      "1": [ix.c1div, ix.c1dist, ix.c1up] as const,
      "2": [ix.c2div, ix.c2dist, ix.c2up] as const,
      "3": [ix.c3div, ix.c3dist, ix.c3up] as const,
    }[sel];
    const d = cell(r, map[0]);
    const di = cell(r, map[1]);
    const u = cell(r, map[2]);
    const v = validateTarget(geo, d, di, u);
    if (v) return { ok: true, v };
    return {
      ok: false,
      reason: `selected_candidate=${sel} has empty or invalid target codes`,
    };
  }

  return {
    ok: false,
    reason:
      "Set selected_candidate to 1, 2, 3 (with valid candidate codes) or fill all manual_target_* fields",
  };
}

function loadExistingApproved(
  geo: ReturnType<typeof loadMasterGeo>,
): Map<string, string[]> {
  const out = new Map<string, string[]>();
  if (!fs.existsSync(APPROVED_CSV)) return out;
  const raw = fs.readFileSync(APPROVED_CSV, "utf8").trim();
  if (!raw) return out;
  const rows = parseCsv(raw);
  const h = rows[0] ?? [];
  const colIdx = OUT_HEADER.map((name) => idxHeader(h, name));
  if (colIdx.some((i) => i < 0)) return out;

  const iRs = idxHeader(h, "review_status");
  if (iRs < 0) return out;

  for (const r of bodyRows(rows)) {
    if ((r[iRs] ?? "").trim().toUpperCase() !== "APPROVED") continue;
    const cells = OUT_HEADER.map((_, j) => (r[colIdx[j]!] ?? "").trim());
    const tgtDiv = cells[9]!;
    const tgtDist = cells[10]!;
    const tgtUp = cells[11]!;
    const v = validateTarget(geo, tgtDiv, tgtDist, tgtUp);
    if (!v) continue;
    const key = `${cells[0]}|${cells[1]}|${cells[2]}`;
    cells[9] = v.tgtDiv;
    cells[10] = v.tgtDist;
    cells[11] = v.tgtUp;
    cells[12] = v.tgtDivEn;
    cells[13] = v.tgtDistEn;
    cells[14] = v.tgtUpEn;
    cells[17] = "APPROVED";
    out.set(key, [...cells]);
  }
  return out;
}

function helperRowToOut(r: string[], ix: HelperIdx, v: Validated): string[] {
  return [
    cell(r, ix.source_division_code),
    cell(r, ix.source_district_code),
    cell(r, ix.source_upazila_code),
    cell(r, ix.source_division_name_en),
    cell(r, ix.source_district_name_en),
    cell(r, ix.source_upazila_name_en),
    cell(r, ix.source_division_name_bn),
    cell(r, ix.source_district_name_bn),
    cell(r, ix.source_upazila_name_bn),
    v.tgtDiv,
    v.tgtDist,
    v.tgtUp,
    v.tgtDivEn,
    v.tgtDistEn,
    v.tgtUpEn,
    "MANUAL",
    "HELPER_APPROVED",
    "APPROVED",
    cell(r, ix.notes),
  ];
}

function main(): void {
  const geo = loadMasterGeo();

  if (!fs.existsSync(HELPER_CSV)) {
    console.error(`Missing ${HELPER_CSV}. Run npm run locations:union-mapping-helper first.`);
    process.exit(1);
  }

  const raw = fs.readFileSync(HELPER_CSV, "utf8").trim();
  const rows = parseCsv(raw);
  const h = rows[0] ?? [];
  const ix = readHelperIndices(h);
  if (!ix) {
    console.error("Helper CSV missing required columns.");
    process.exit(1);
  }

  const merged = loadExistingApproved(geo);
  const applied: { sourceKey: string; target: string }[] = [];
  const skipped: { sourceKey: string; reason: string }[] = [];

  for (const r of bodyRows(rows)) {
    if (cell(r, ix.review_status).toUpperCase() !== "APPROVED") continue;
    const key = sourceKey(r, ix.source_division_code, ix.source_district_code, ix.source_upazila_code);
    const picked = pickFromHelperRow(geo, r, ix);
    if (!picked.ok) {
      skipped.push({ sourceKey: key, reason: picked.reason });
      continue;
    }
    merged.set(key, helperRowToOut(r, ix, picked.v));
    applied.push({ sourceKey: key, target: `${picked.v.tgtDiv}|${picked.v.tgtDist}|${picked.v.tgtUp}` });
  }

  const outRows = [...merged.values()].sort((a, b) => {
    const ka = `${a[0]}|${a[1]}|${a[2]}`;
    const kb = `${b[0]}|${b[1]}|${b[2]}`;
    return ka.localeCompare(kb);
  });

  writeCsvFile(APPROVED_CSV, [...OUT_HEADER], outRows);

  const report = {
    generatedAt: new Date().toISOString(),
    helperCsv: HELPER_CSV,
    approvedCsv: APPROVED_CSV,
    totalApprovedRowsWritten: outRows.length,
    appliedFromHelperThisRun: applied.length,
    skippedHelperApprovedInvalid: skipped,
    appliedDetails: applied,
  };
  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (skipped.length) {
    console.error(`Warning: ${skipped.length} APPROVED helper row(s) skipped — see report JSON.`);
    process.exitCode = 1;
  }
}

main();
