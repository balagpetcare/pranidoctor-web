/**
 * Generates a compact CSV + human-readable markdown for batched union parent mapping review.
 * Read-only: does not modify helper, approved mapping, or DB.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";

import { bodyRows } from "./_nuhil-bundle";
import { writeCsvFile } from "./_csv-out";

const MAP_DIR = path.join(process.cwd(), "data", "locations", "mappings");
const HELPER_CSV = path.join(MAP_DIR, "union-parent-mapping-helper.csv");
const REVIEW_CSV = path.join(MAP_DIR, "union-parent-mapping-review.csv");
const SIMPLE_CSV = path.join(MAP_DIR, "union-parent-mapping-simple-review.csv");
const HUMAN_MD = path.join(MAP_DIR, "union-parent-mapping-human-review.md");
const REPORT_JSON = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "union-mapping-simple-review-report.json",
);

const UNMATCHED_CSV = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "unions-unmatched.csv",
);

const SIMPLE_HEADER = [
  "review_id",
  "affected_union_count",
  "failure_reason",
  "source_division_code",
  "source_district_code",
  "source_upazila_code",
  "source_division_name_en",
  "source_district_name_en",
  "source_upazila_name_en",
  "source_division_name_bn",
  "source_district_name_bn",
  "source_upazila_name_bn",
  "candidate_1_summary",
  "candidate_2_summary",
  "candidate_3_summary",
  "selected_candidate",
  "manual_target_division_code",
  "manual_target_district_code",
  "manual_target_upazila_code",
  "review_status",
  "reviewed_by",
  "notes",
] as const;

function idxHeader(header: string[], name: string): number {
  return header.findIndex((h) => (h ?? "").trim().toLowerCase() === name.toLowerCase());
}

function sourceKey(sd: string, sdi: string, su: string): string {
  return `${sd.trim()}|${sdi.trim()}|${su.trim()}`;
}

function reviewId(sd: string, sdi: string, su: string): string {
  return `R-${sd.trim()}-${sdi.trim()}-${su.trim()}`;
}

function parseUnionCountFromNotes(notes: string): number {
  const t = notes ?? "";
  let m = t.match(/Unions:\s*(\d+)/i);
  if (m) return parseInt(m[1]!, 10);
  m = t.match(/(\d+)\s+unions\.?/i);
  return m ? parseInt(m[1]!, 10) : 0;
}

function loadReviewUnionCounts(): Map<string, number> {
  const m = new Map<string, number>();
  if (!fs.existsSync(REVIEW_CSV)) return m;
  const rows = parseCsv(fs.readFileSync(REVIEW_CSV, "utf8").trim());
  const h = rows[0] ?? [];
  const iSd = idxHeader(h, "source_division_code");
  const iSdi = idxHeader(h, "source_district_code");
  const iSu = idxHeader(h, "source_upazila_code");
  const iNotes = idxHeader(h, "notes");
  if ([iSd, iSdi, iSu, iNotes].some((i) => i < 0)) return m;
  for (const r of bodyRows(rows)) {
    const key = sourceKey(r[iSd] ?? "", r[iSdi] ?? "", r[iSu] ?? "");
    const n = parseUnionCountFromNotes(r[iNotes] ?? "");
    m.set(key, n);
  }
  return m;
}

function countUnmatchedCsvRows(): number | null {
  if (!fs.existsSync(UNMATCHED_CSV)) return null;
  const raw = fs.readFileSync(UNMATCHED_CSV, "utf8").trim();
  if (!raw) return 0;
  const rows = parseCsv(raw);
  return Math.max(0, rows.length - 1);
}

type RecAction =
  | "APPROVE_CANDIDATE_1"
  | "REVIEW_CANDIDATES"
  | "MANUAL_TARGET_REQUIRED"
  | "SKIP_FOR_NOW";

function recommendAction(failureReason: string, c1Div: string, c1Reason: string): RecAction {
  if (
    failureReason.startsWith("nuhil_missing_") ||
    failureReason === "nuhil_division_map_failed"
  ) {
    return "SKIP_FOR_NOW";
  }
  if (!c1Div.trim()) return "MANUAL_TARGET_REQUIRED";
  const r = (c1Reason ?? "").toLowerCase();
  if (r.includes("weak") || r.includes("different hdx division")) return "REVIEW_CANDIDATES";
  if (r.includes("exact normalized")) return "APPROVE_CANDIDATE_1";
  return "REVIEW_CANDIDATES";
}

function manualLikelyRequired(action: RecAction): boolean {
  return action === "MANUAL_TARGET_REQUIRED" || action === "SKIP_FOR_NOW";
}

function candidateSummary(
  div: string,
  dist: string,
  up: string,
  divEn: string,
  distEn: string,
  upEn: string,
  divBn: string,
  distBn: string,
  upBn: string,
  reason: string,
): string {
  const codes = [div, dist, up].every((x) => (x ?? "").trim()) ? `${div}/${dist}/${up}` : "";
  const en = [divEn, distEn, upEn].filter((x) => (x ?? "").trim()).join(" / ");
  const bn = [divBn, distBn, upBn].filter((x) => (x ?? "").trim()).join(" / ");
  const parts = [
    codes ? `codes ${codes}` : "",
    en ? `EN: ${en}` : "",
    bn ? `BN: ${bn}` : "",
    reason ? `reason: ${reason}` : "",
  ].filter(Boolean);
  return parts.join(" | ") || "(no candidate)";
}

function escMd(s: string): string {
  return (s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .trim();
}

type HelperRow = {
  source_division_code: string;
  source_district_code: string;
  source_upazila_code: string;
  source_division_name_en: string;
  source_district_name_en: string;
  source_upazila_name_en: string;
  source_division_name_bn: string;
  source_district_name_bn: string;
  source_upazila_name_bn: string;
  failure_reason: string;
  c1: { div: string; dist: string; up: string; divEn: string; distEn: string; upEn: string; divBn: string; distBn: string; upBn: string; reason: string };
  c2: { div: string; dist: string; up: string; divEn: string; distEn: string; upEn: string; divBn: string; distBn: string; upBn: string; reason: string };
  c3: { div: string; dist: string; up: string; divEn: string; distEn: string; upEn: string; divBn: string; distBn: string; upBn: string; reason: string };
  manual_div: string;
  manual_dist: string;
  manual_up: string;
  selected_candidate: string;
  review_status: string;
  reviewed_by: string;
  notes: string;
};

function parseHelperRows(): HelperRow[] {
  const raw = fs.readFileSync(HELPER_CSV, "utf8").trim();
  const rows = parseCsv(raw);
  const h = rows[0] ?? [];
  const ix = (name: string) => idxHeader(h, name);
  const need = [
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
  ];
  const idx = new Map<string, number>();
  for (const n of need) {
    const i = ix(n);
    if (i < 0) throw new Error(`Helper CSV missing column: ${n}`);
    idx.set(n, i);
  }

  const out: HelperRow[] = [];
  for (const r of bodyRows(rows)) {
    const g = (name: string) => (r[idx.get(name)!] ?? "").trim();
    const cand = (p: 1 | 2 | 3) => ({
      div: g(`candidate_${p}_target_division_code`),
      dist: g(`candidate_${p}_target_district_code`),
      up: g(`candidate_${p}_target_upazila_code`),
      divEn: g(`candidate_${p}_target_division_name_en`),
      distEn: g(`candidate_${p}_target_district_name_en`),
      upEn: g(`candidate_${p}_target_upazila_name_en`),
      divBn: g(`candidate_${p}_target_division_name_bn`),
      distBn: g(`candidate_${p}_target_district_name_bn`),
      upBn: g(`candidate_${p}_target_upazila_name_bn`),
      reason: g(`candidate_${p}_reason`),
    });
    out.push({
      source_division_code: g("source_division_code"),
      source_district_code: g("source_district_code"),
      source_upazila_code: g("source_upazila_code"),
      source_division_name_en: g("source_division_name_en"),
      source_district_name_en: g("source_district_name_en"),
      source_upazila_name_en: g("source_upazila_name_en"),
      source_division_name_bn: g("source_division_name_bn"),
      source_district_name_bn: g("source_district_name_bn"),
      source_upazila_name_bn: g("source_upazila_name_bn"),
      failure_reason: g("failure_reason"),
      c1: cand(1),
      c2: cand(2),
      c3: cand(3),
      manual_div: g("manual_target_division_code"),
      manual_dist: g("manual_target_district_code"),
      manual_up: g("manual_target_upazila_code"),
      selected_candidate: g("selected_candidate"),
      review_status: g("review_status"),
      reviewed_by: g("reviewed_by"),
      notes: g("notes"),
    });
  }
  return out;
}

type Preserved = {
  selected_candidate: string;
  manual_div: string;
  manual_dist: string;
  manual_up: string;
  review_status: string;
  reviewed_by: string;
  notes: string;
};

function loadPreservedSimple(): Map<string, Preserved> {
  const m = new Map<string, Preserved>();
  if (!fs.existsSync(SIMPLE_CSV)) return m;
  const rows = parseCsv(fs.readFileSync(SIMPLE_CSV, "utf8").trim());
  const h = rows[0] ?? [];
  const iId = idxHeader(h, "review_id");
  if (iId < 0) return m;
  const col = (n: string) => idxHeader(h, n);
  const iSel = col("selected_candidate");
  const iMd = col("manual_target_division_code");
  const iMdi = col("manual_target_district_code");
  const iMu = col("manual_target_upazila_code");
  const iRs = col("review_status");
  const iRb = col("reviewed_by");
  const iNo = col("notes");
  for (const r of bodyRows(rows)) {
    const id = (r[iId] ?? "").trim();
    if (!id) continue;
    m.set(id, {
      selected_candidate: iSel >= 0 ? (r[iSel] ?? "").trim() : "",
      manual_div: iMd >= 0 ? (r[iMd] ?? "").trim() : "",
      manual_dist: iMdi >= 0 ? (r[iMdi] ?? "").trim() : "",
      manual_up: iMu >= 0 ? (r[iMu] ?? "").trim() : "",
      review_status: iRs >= 0 ? (r[iRs] ?? "").trim() : "",
      reviewed_by: iRb >= 0 ? (r[iRb] ?? "").trim() : "",
      notes: iNo >= 0 ? (r[iNo] ?? "").trim() : "",
    });
  }
  return m;
}

type Enriched = HelperRow & {
  review_id: string;
  source_key: string;
  affected_union_count: number;
  action: RecAction;
  manual_required_hint: boolean;
  s1: string;
  s2: string;
  s3: string;
};

function main(): void {
  if (!fs.existsSync(HELPER_CSV)) {
    console.error(`Missing ${HELPER_CSV}. Run npm run locations:union-mapping-helper first.`);
    process.exit(1);
  }

  const reviewCounts = loadReviewUnionCounts();
  const preserved = loadPreservedSimple();
  const helperRows = parseHelperRows();

  const enriched: Enriched[] = helperRows.map((hr) => {
    const key = sourceKey(hr.source_division_code, hr.source_district_code, hr.source_upazila_code);
    const rid = reviewId(hr.source_division_code, hr.source_district_code, hr.source_upazila_code);
    let n = reviewCounts.get(key) ?? 0;
    if (!n) n = parseUnionCountFromNotes(hr.notes);
    const action = recommendAction(hr.failure_reason, hr.c1.div, hr.c1.reason);
    const manual_required_hint = manualLikelyRequired(action);
    const s1 = candidateSummary(
      hr.c1.div,
      hr.c1.dist,
      hr.c1.up,
      hr.c1.divEn,
      hr.c1.distEn,
      hr.c1.upEn,
      hr.c1.divBn,
      hr.c1.distBn,
      hr.c1.upBn,
      hr.c1.reason,
    );
    const s2 = candidateSummary(
      hr.c2.div,
      hr.c2.dist,
      hr.c2.up,
      hr.c2.divEn,
      hr.c2.distEn,
      hr.c2.upEn,
      hr.c2.divBn,
      hr.c2.distBn,
      hr.c2.upBn,
      hr.c2.reason,
    );
    const s3 = candidateSummary(
      hr.c3.div,
      hr.c3.dist,
      hr.c3.up,
      hr.c3.divEn,
      hr.c3.distEn,
      hr.c3.upEn,
      hr.c3.divBn,
      hr.c3.distBn,
      hr.c3.upBn,
      hr.c3.reason,
    );
    return {
      ...hr,
      review_id: rid,
      source_key: key,
      affected_union_count: n,
      action,
      manual_required_hint,
      s1,
      s2,
      s3,
    };
  });

  enriched.sort((a, b) => b.affected_union_count - a.affected_union_count || a.review_id.localeCompare(b.review_id));

  const csvRows: string[][] = [];
  for (const e of enriched) {
    const pr = preserved.get(e.review_id);
    const sel = pr?.selected_candidate ?? "";
    const md = pr?.manual_div ?? "";
    const mdi = pr?.manual_dist ?? "";
    const mu = pr?.manual_up ?? "";
    const rs = (pr?.review_status ?? "").trim().toUpperCase() === "APPROVED" ? "APPROVED" : "PENDING";
    const rb = pr?.reviewed_by ?? "";
    const notesParts = [e.notes, pr?.notes].filter((x) => (x ?? "").trim());
    const mergedNotes = notesParts.join(" | ").trim();
    csvRows.push([
      e.review_id,
      String(e.affected_union_count),
      e.failure_reason,
      e.source_division_code,
      e.source_district_code,
      e.source_upazila_code,
      e.source_division_name_en,
      e.source_district_name_en,
      e.source_upazila_name_en,
      e.source_division_name_bn,
      e.source_district_name_bn,
      e.source_upazila_name_bn,
      e.s1,
      e.s2,
      e.s3,
      sel,
      md || e.manual_div,
      mdi || e.manual_dist,
      mu || e.manual_up,
      rs,
      rb,
      mergedNotes,
    ]);
  }

  writeCsvFile(SIMPLE_CSV, [...SIMPLE_HEADER], csvRows);

  const totalContexts = enriched.length;
  const totalAffected = enriched.reduce((a, e) => a + e.affected_union_count, 0);
  const top20 = enriched.slice(0, 20).map((e) => ({
    review_id: e.review_id,
    affected_union_count: e.affected_union_count,
    failure_reason: e.failure_reason,
    source_division_name_en: e.source_division_name_en,
    source_district_name_en: e.source_district_name_en,
    source_upazila_name_en: e.source_upazila_name_en,
    recommended_action: e.action,
  }));

  const byFailure = new Map<string, Enriched[]>();
  for (const e of enriched) {
    const k = e.failure_reason || "(unknown)";
    if (!byFailure.has(k)) byFailure.set(k, []);
    byFailure.get(k)!.push(e);
  }
  for (const arr of byFailure.values()) {
    arr.sort(
      (a, b) =>
        a.source_division_name_en.localeCompare(b.source_division_name_en) ||
        a.source_district_name_en.localeCompare(b.source_district_name_en) ||
        a.source_upazila_name_en.localeCompare(b.source_upazila_name_en),
    );
  }

  const failureKeys = [...byFailure.keys()].sort();

  const mdLines: string[] = [];
  mdLines.push("# Union parent mapping — human review");
  mdLines.push("");
  mdLines.push(`Generated **${new Date().toISOString()}** (machine timestamp, UTC).`);
  mdLines.push("");
  mdLines.push("This file is **guidance only**. It does **not** approve mappings. Edit the simple review CSV and run the apply script when you are ready.");
  mdLines.push("");
  mdLines.push(`- **Total source parent contexts:** ${totalContexts}`);
  mdLines.push(`- **Total affected union rows (sum of per-context counts from review notes):** ${totalAffected}`);
  const um = countUnmatchedCsvRows();
  if (um !== null) {
    mdLines.push(`- **Rows in unions-unmatched.csv (data rows):** ${um} (reference only)`);
  }
  mdLines.push("");
  mdLines.push("## Recommendation legend");
  mdLines.push("");
  mdLines.push("| Tag | Meaning |");
  mdLines.push("|-----|---------|");
  mdLines.push("| **APPROVE_CANDIDATE_1** | Candidate 1 looks strong on text heuristics — **still verify** in master CSVs before you APPROVE in the simple review file. |");
  mdLines.push("| **REVIEW_CANDIDATES** | Compare candidates 1–3 (and reasons); pick one or use manual codes. |");
  mdLines.push("| **MANUAL_TARGET_REQUIRED** | No candidate 1 triple — you must supply HDX codes from `divisions.csv` / `districts.csv` / `upazilas.csv`. |");
  mdLines.push("| **SKIP_FOR_NOW** | Broken or unmapped nuhil parent chain — fix upstream nuhil rows or defer; mapping may be impossible until source data is corrected. |");
  mdLines.push("");

  for (const fr of failureKeys) {
    mdLines.push(`## Failure: \`${escMd(fr)}\``);
    mdLines.push("");
    const group = byFailure.get(fr)!;
    let lastDivCode = "";
    let lastDistCode = "";
    for (const e of group) {
      if (e.source_division_code !== lastDivCode) {
        const divLabel = `${escMd(e.source_division_name_en)} (nuhil div **${escMd(e.source_division_code)}**)`;
        mdLines.push(`### Division: ${divLabel}`);
        mdLines.push("");
        lastDivCode = e.source_division_code;
        lastDistCode = "";
      }
      if (e.source_district_code !== lastDistCode) {
        const distLabel = `${escMd(e.source_district_name_en)} (nuhil district **${escMd(e.source_district_code)}**)`;
        mdLines.push(`#### District: ${distLabel}`);
        mdLines.push("");
        lastDistCode = e.source_district_code;
      }
      mdLines.push(`##### Upazila: ${escMd(e.source_upazila_name_en)} / ${escMd(e.source_upazila_name_bn)} (nuhil upazila **${escMd(e.source_upazila_code)}**)`);
      mdLines.push("");
mdLines.push(`- **review_id:** \`${e.review_id}\` (format \`R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}\`; empty segments appear as consecutive hyphens, e.g. \`R--1-9\`)`);
      mdLines.push(`- **Affected union rows:** ${e.affected_union_count}`);
      mdLines.push(
        `- **Manual target likely required:** ${e.manual_required_hint ? "Yes (hint)" : "No (hint — still verify)"}`,
      );
      mdLines.push(`- **Recommended human action (guidance):** **${e.action}**`);
      mdLines.push(`- **Source codes:** \`${e.source_division_code}\` / \`${e.source_district_code}\` / \`${e.source_upazila_code}\``);
      mdLines.push(`- **Candidate 1:** ${escMd(e.s1)}`);
      mdLines.push(`- **Candidate 2:** ${escMd(e.s2)}`);
      mdLines.push(`- **Candidate 3:** ${escMd(e.s3)}`);
      mdLines.push("");
    }
  }

  fs.mkdirSync(path.dirname(HUMAN_MD), { recursive: true });
  fs.writeFileSync(HUMAN_MD, `${mdLines.join("\n")}\n`, "utf8");

  const approveHint = enriched.filter((e) => e.action === "APPROVE_CANDIDATE_1").length;
  const manualHint = enriched.filter((e) => e.action === "MANUAL_TARGET_REQUIRED").length;
  const reviewHint = enriched.filter((e) => e.action === "REVIEW_CANDIDATES").length;
  const skipHint = enriched.filter((e) => e.action === "SKIP_FOR_NOW").length;

  const report = {
    generatedAt: new Date().toISOString(),
    paths: {
      simpleReviewCsv: SIMPLE_CSV,
      humanReviewMd: HUMAN_MD,
      helperCsv: HELPER_CSV,
      reviewCsv: REVIEW_CSV,
      reportJson: REPORT_JSON,
    },
    totals: {
      sourceParentContexts: totalContexts,
      sumAffectedUnionRowsFromReviewNotes: totalAffected,
      unmatchedCsvDataRows: um,
    },
    guidanceCounts: {
      approveCandidate1: approveHint,
      reviewCandidates: reviewHint,
      manualTargetRequired: manualHint,
      skipForNow: skipHint,
    },
    reviewBurden: {
      allContextsRequireHumanSignOff: totalContexts,
      heuristicSuggestApproveCandidate1Only: approveHint,
      heuristicSuggestFurtherReviewOrManual: reviewHint + manualHint + skipHint,
    },
    top20ByAffectedUnionCount: top20,
    preservedSimpleRows: preserved.size,
    notes: [
      "Guidance labels are heuristics only — always verify against divisions/districts/upazilas.csv before APPROVED.",
      "Re-running this script preserves selected_candidate, manual_*, review_status, reviewed_by, notes from an existing union-parent-mapping-simple-review.csv keyed by review_id.",
    ],
  };

  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main();
