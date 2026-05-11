/**
 * Applies APPROVED rows from union-parent-mapping-simple-review.csv using
 * candidate codes from union-parent-mapping-helper.csv (or manual codes from the simple file).
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";

import { loadMasterGeo } from "./_master-csv-index";
import { bodyRows } from "./_nuhil-bundle";
import { writeCsvFile } from "./_csv-out";

const MAP_DIR = path.join(process.cwd(), "data", "locations", "mappings");
const SIMPLE_CSV = path.join(MAP_DIR, "union-parent-mapping-simple-review.csv");
const HELPER_CSV = path.join(MAP_DIR, "union-parent-mapping-helper.csv");
const APPROVED_CSV = path.join(MAP_DIR, "union-parent-mapping.csv");
const REPORT_JSON = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "union-mapping-simple-apply-report.json",
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

function sourceKey(sd: string, sdi: string, su: string): string {
  return `${sd.trim()}|${sdi.trim()}|${su.trim()}`;
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

function reviewId(sd: string, sdi: string, su: string): string {
  return `R-${sd}-${sdi}-${su}`;
}

/** Parses `R-{division}-{district}-{upazila}`; any segment may be empty (e.g. `R--1-9`). */
function parseReviewId(id: string): { sd: string; sdi: string; su: string } | null {
  const t = (id ?? "").trim();
  if (!t.startsWith("R-")) return null;
  const rest = t.slice(2);
  const parts = rest.split("-");
  if (parts.length < 3) return null;
  const su = (parts[parts.length - 1] ?? "").trim();
  const sdi = (parts[parts.length - 2] ?? "").trim();
  const sd = parts.slice(0, -2).join("-").trim();
  return { sd, sdi, su };
}

type HelperRow = {
  key: string;
  source_division_code: string;
  source_district_code: string;
  source_upazila_code: string;
  source_division_name_en: string;
  source_district_name_en: string;
  source_upazila_name_en: string;
  source_division_name_bn: string;
  source_district_name_bn: string;
  source_upazila_name_bn: string;
  notes: string;
  c1div: string;
  c1dist: string;
  c1up: string;
  c2div: string;
  c2dist: string;
  c2up: string;
  c3div: string;
  c3dist: string;
  c3up: string;
};

function loadHelperMap(): Map<string, HelperRow> {
  const m = new Map<string, HelperRow>();
  if (!fs.existsSync(HELPER_CSV)) return m;
  const rows = parseCsv(fs.readFileSync(HELPER_CSV, "utf8").trim());
  const h = rows[0] ?? [];
  const ix = (n: string) => idxHeader(h, n);
  const names = [
    "source_division_code",
    "source_district_code",
    "source_upazila_code",
    "source_division_name_en",
    "source_district_name_en",
    "source_upazila_name_en",
    "source_division_name_bn",
    "source_district_name_bn",
    "source_upazila_name_bn",
    "notes",
    "candidate_1_target_division_code",
    "candidate_1_target_district_code",
    "candidate_1_target_upazila_code",
    "candidate_2_target_division_code",
    "candidate_2_target_district_code",
    "candidate_2_target_upazila_code",
    "candidate_3_target_division_code",
    "candidate_3_target_district_code",
    "candidate_3_target_upazila_code",
  ];
  const idx: Record<string, number> = {};
  for (const n of names) {
    const i = ix(n);
    if (i < 0) throw new Error(`Helper CSV missing column: ${n}`);
    idx[n] = i;
  }
  for (const r of bodyRows(rows)) {
    const g = (n: string) => (r[idx[n]!] ?? "").trim();
    const sd = g("source_division_code");
    const sdi = g("source_district_code");
    const su = g("source_upazila_code");
    const key = sourceKey(sd, sdi, su);
    m.set(key, {
      key,
      source_division_code: sd,
      source_district_code: sdi,
      source_upazila_code: su,
      source_division_name_en: g("source_division_name_en"),
      source_district_name_en: g("source_district_name_en"),
      source_upazila_name_en: g("source_upazila_name_en"),
      source_division_name_bn: g("source_division_name_bn"),
      source_district_name_bn: g("source_district_name_bn"),
      source_upazila_name_bn: g("source_upazila_name_bn"),
      notes: g("notes"),
      c1div: g("candidate_1_target_division_code"),
      c1dist: g("candidate_1_target_district_code"),
      c1up: g("candidate_1_target_upazila_code"),
      c2div: g("candidate_2_target_division_code"),
      c2dist: g("candidate_2_target_district_code"),
      c2up: g("candidate_2_target_upazila_code"),
      c3div: g("candidate_3_target_division_code"),
      c3dist: g("candidate_3_target_district_code"),
      c3up: g("candidate_3_target_upazila_code"),
    });
  }
  return m;
}

function loadExistingApproved(geo: ReturnType<typeof loadMasterGeo>): Map<string, string[]> {
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
    const v = validateTarget(geo, cells[9]!, cells[10]!, cells[11]!);
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

function pickTarget(
  geo: ReturnType<typeof loadMasterGeo>,
  sel: string,
  manualDiv: string,
  manualDist: string,
  manualUp: string,
  hr: HelperRow,
): { ok: true; v: Validated } | { ok: false; reason: string } {
  const s = sel.trim().toUpperCase();
  if (!["1", "2", "3", "MANUAL"].includes(s)) {
    return { ok: false, reason: "selected_candidate must be 1, 2, 3, or MANUAL for APPROVED rows" };
  }

  if (s === "MANUAL") {
    if (!manualDiv || !manualDist || !manualUp) {
      return { ok: false, reason: "MANUAL requires manual_target_division_code, manual_target_district_code, manual_target_upazila_code" };
    }
    const v = validateTarget(geo, manualDiv, manualDist, manualUp);
    if (!v) return { ok: false, reason: "manual_target_* failed validation against master CSVs" };
    return { ok: true, v };
  }

  const map =
    s === "1"
      ? [hr.c1div, hr.c1dist, hr.c1up]
      : s === "2"
        ? [hr.c2div, hr.c2dist, hr.c2up]
        : [hr.c3div, hr.c3dist, hr.c3up];
  const v = validateTarget(geo, map[0]!, map[1]!, map[2]!);
  if (!v) {
    return {
      ok: false,
      reason: `selected_candidate=${s} points to empty or invalid codes in helper CSV`,
    };
  }
  return { ok: true, v };
}

function main(): void {
  const geo = loadMasterGeo();
  if (!fs.existsSync(SIMPLE_CSV)) {
    console.error(`Missing ${SIMPLE_CSV}. Run npm run locations:union-mapping-simple-review first.`);
    process.exit(1);
  }
  const helperMap = loadHelperMap();
  if (helperMap.size === 0) {
    console.error(`Missing or empty ${HELPER_CSV}.`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(SIMPLE_CSV, "utf8").trim());
  const h = rows[0] ?? [];
  const ix = (n: string) => idxHeader(h, n);
  const iId = ix("review_id");
  const iRs = ix("review_status");
  const iSel = ix("selected_candidate");
  const iMd = ix("manual_target_division_code");
  const iMdi = ix("manual_target_district_code");
  const iMu = ix("manual_target_upazila_code");
  const iNo = ix("notes");
  if ([iId, iRs, iSel, iMd, iMdi, iMu].some((i) => i < 0)) {
    console.error("Simple review CSV missing required columns.");
    process.exit(1);
  }

  const merged = loadExistingApproved(geo);
  const applied: { review_id: string; sourceKey: string; target: string }[] = [];
  const skipped: { review_id: string; reason: string }[] = [];

  for (const r of bodyRows(rows)) {
    if ((r[iRs] ?? "").trim().toUpperCase() !== "APPROVED") continue;
    const rid = (r[iId] ?? "").trim();
    const parsed = parseReviewId(rid);
    if (!parsed) {
      skipped.push({
        review_id: rid || "(empty)",
        reason:
          "review_id must be R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id} (empty segments allowed, e.g. R--1-9)",
      });
      continue;
    }
    const key = sourceKey(parsed.sd, parsed.sdi, parsed.su);
    const hr = helperMap.get(key);
    if (!hr) {
      skipped.push({ review_id: rid, reason: "no matching row in union-parent-mapping-helper.csv for this source key" });
      continue;
    }
    const sel = (r[iSel] ?? "").trim();
    const md = (r[iMd] ?? "").trim();
    const mdi = (r[iMdi] ?? "").trim();
    const mu = (r[iMu] ?? "").trim();
    const picked = pickTarget(geo, sel, md, mdi, mu, hr);
    if (!picked.ok) {
      skipped.push({ review_id: rid, reason: picked.reason });
      continue;
    }
    const noteSimple = iNo >= 0 ? (r[iNo] ?? "").trim() : "";
    const notesOut = [hr.notes, noteSimple].filter(Boolean).join(" | ").trim();
    merged.set(key, [
      hr.source_division_code,
      hr.source_district_code,
      hr.source_upazila_code,
      hr.source_division_name_en,
      hr.source_district_name_en,
      hr.source_upazila_name_en,
      hr.source_division_name_bn,
      hr.source_district_name_bn,
      hr.source_upazila_name_bn,
      picked.v.tgtDiv,
      picked.v.tgtDist,
      picked.v.tgtUp,
      picked.v.tgtDivEn,
      picked.v.tgtDistEn,
      picked.v.tgtUpEn,
      "MANUAL",
      "HELPER_SIMPLE_REVIEW",
      "APPROVED",
      notesOut,
    ]);
    applied.push({
      review_id: rid,
      sourceKey: key,
      target: `${picked.v.tgtDiv}|${picked.v.tgtDist}|${picked.v.tgtUp}`,
    });
  }

  const outRows = [...merged.values()].sort((a, b) => {
    const ka = `${a[0]}|${a[1]}|${a[2]}`;
    const kb = `${b[0]}|${b[1]}|${b[2]}`;
    return ka.localeCompare(kb);
  });

  writeCsvFile(APPROVED_CSV, [...OUT_HEADER], outRows);

  const report = {
    generatedAt: new Date().toISOString(),
    simpleReviewCsv: SIMPLE_CSV,
    helperCsv: HELPER_CSV,
    approvedCsv: APPROVED_CSV,
    totalApprovedRowsWritten: outRows.length,
    appliedFromSimpleReviewThisRun: applied.length,
    skipped: skipped,
    appliedDetails: applied,
  };
  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (skipped.length) {
    console.error(`Warning: ${skipped.length} APPROVED simple row(s) skipped — see report JSON.`);
    process.exitCode = 1;
  }
}

main();
