/**
 * Read-only audit: nuhil/bangladesh-geocode raw bundle vs HDX-backed unions pipeline.
 * Writes data/locations/reports/nuhil-union-integration-audit.json
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
} from "./_master-csv-index";
import { bodyRows, loadNuhilBundle, nuhilCsvBodyRows, type NuhilMaps } from "./_nuhil-bundle";

const RAW = path.join(process.cwd(), "data", "locations", "raw", "unions");
const UNIONS_CSV = path.join(process.cwd(), "data", "locations", "unions.csv");
const NORM_REPORT = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "union-normalization-report.json",
);
const PARENT_REPORT = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "union-parent-mapping-report.json",
);
const UNMATCHED_CSV = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "unions-unmatched.csv",
);
const IMPORT_REPORT = path.join(process.cwd(), "data", "locations", "import-report.json");
const REVIEW_CSV = path.join(
  process.cwd(),
  "data",
  "locations",
  "mappings",
  "union-parent-mapping-review.csv",
);
const OUT_AUDIT = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "nuhil-union-integration-audit.json",
);

const NUHIL_SOURCE = "nuhil/bangladesh-geocode";
const NUHIL_REPO = "https://github.com/nuhil/bangladesh-geocode";

function nk(s: string): string {
  return normalizeLocationName(s).toLowerCase();
}

function idxHeader(header: string[], name: string): number {
  return header.findIndex((h) => (h ?? "").trim().toLowerCase() === name.toLowerCase());
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
    } {
  const up = nuhil.upazilas.get(u.upazilaId);
  if (!up) {
    return {
      ok: false,
      failure: "nuhil_missing_upazila",
      srcDivId: "",
      srcDistId: "",
      srcUpId: u.upazilaId,
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
    };
  }
  void u;
  return { ok: true };
}

function analyzeNuhilRawUnions(): {
  total: number;
  missingNameEn: number;
  missingNameBn: number;
  duplicateGroupCount: number;
  unionRowsInDuplicateGroups: number;
} {
  const p = path.join(RAW, "nuhil-unions.csv");
  if (!fs.existsSync(p)) {
    return {
      total: 0,
      missingNameEn: 0,
      missingNameBn: 0,
      duplicateGroupCount: 0,
      unionRowsInDuplicateGroups: 0,
    };
  }
  const rows = parseCsv(fs.readFileSync(p, "utf8").trim());
  const body = nuhilCsvBodyRows(rows).filter((r) => r.some((c) => (c ?? "").trim() !== ""));
  let missingNameEn = 0;
  let missingNameBn = 0;
  const byKey = new Map<string, number>();
  for (const r of body) {
    const upId = (r[1] ?? "").replace(/"/g, "").trim();
    const nameEn = (r[2] ?? "").trim();
    const nameBn = (r[3] ?? "").trim();
    if (!nameEn.trim()) missingNameEn += 1;
    if (!nameBn.trim()) missingNameBn += 1;
    const bnK = nk(nameBn);
    const enK = nk(nameEn);
    const key =
      bnK ? `${upId}|bn:${bnK}` : enK ? `${upId}|en:${enK}` : `${upId}|id:${(r[0] ?? "").trim()}`;
    byKey.set(key, (byKey.get(key) ?? 0) + 1);
  }
  let duplicateGroupCount = 0;
  let unionRowsInDuplicateGroups = 0;
  for (const c of byKey.values()) {
    if (c > 1) {
      duplicateGroupCount += 1;
      unionRowsInDuplicateGroups += c;
    }
  }
  return {
    total: body.length,
    missingNameEn,
    missingNameBn,
    duplicateGroupCount,
    unionRowsInDuplicateGroups,
  };
}

function analyzeUnionsCsv(): {
  totalDataRows: number;
  nuhilSourceRows: number;
  missingNameEn: number;
  missingNameBn: number;
  verifiedTrue: number;
} {
  if (!fs.existsSync(UNIONS_CSV)) {
    return { totalDataRows: 0, nuhilSourceRows: 0, missingNameEn: 0, missingNameBn: 0, verifiedTrue: 0 };
  }
  const rows = parseCsv(fs.readFileSync(UNIONS_CSV, "utf8").trim());
  const h = rows[0] ?? [];
  const iSrc = idxHeader(h, "source");
  const iEn = idxHeader(h, "name_en");
  const iBn = idxHeader(h, "name_bn");
  const iV = idxHeader(h, "is_verified");
  if ([iSrc, iEn, iBn, iV].some((i) => i < 0)) {
    return { totalDataRows: 0, nuhilSourceRows: 0, missingNameEn: 0, missingNameBn: 0, verifiedTrue: 0 };
  }
  let total = 0;
  let nuhil = 0;
  let me = 0;
  let mb = 0;
  let vt = 0;
  for (const r of bodyRows(rows)) {
    total += 1;
    const src = (r[iSrc] ?? "").trim();
    if (src === NUHIL_SOURCE) nuhil += 1;
    if (!(r[iEn] ?? "").trim()) me += 1;
    if (!(r[iBn] ?? "").trim()) mb += 1;
    const v = (r[iV] ?? "").trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes") vt += 1;
  }
  return { totalDataRows: total, nuhilSourceRows: nuhil, missingNameEn: me, missingNameBn: mb, verifiedTrue: vt };
}

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function main(): void {
  const generatedAt = new Date().toISOString();
  const geo = loadMasterGeo();
  const nuhil = loadNuhilBundle();

  const nuhilDivisions = nuhil ? nuhil.divisions.size : 0;
  const nuhilDistricts = nuhil ? nuhil.districts.size : 0;
  const nuhilUpazilas = nuhil ? nuhil.upazilas.size : 0;
  const rawUnionQuality = analyzeNuhilRawUnions();
  const nuhilUnionsRaw = nuhil ? nuhil.unions.length : rawUnionQuality.total;

  const unionsCsv = analyzeUnionsCsv();
  const normReport = readJson<{
    outputRowCount?: number;
    unmatchedCount?: number;
    generatedAt?: string;
  }>(NORM_REPORT);
  const parentReport = readJson<{
    uniqueSourceParentCombinations?: number;
    failureBreakdown?: Record<string, number>;
    unmatchedUnionRowsBefore?: number;
  }>(PARENT_REPORT);
  const importReport = readJson<{
    dryRun?: boolean;
    unions?: { imported?: number; updated?: number; skipped?: number; invalid?: number };
    summary?: { missingParent?: number; duplicateWarningsTotal?: number };
  }>(IMPORT_REPORT);

  const unmatchedCsvRows = fs.existsSync(UNMATCHED_CSV)
    ? Math.max(0, parseCsv(fs.readFileSync(UNMATCHED_CSV, "utf8").trim()).length - 1)
    : 0;

  const parentMismatch: Record<string, number> = {};
  const parentContextKeys = new Set<string>();
  let matchedUnions = 0;
  let unmatchedUnions = 0;
  if (nuhil) {
    for (const u of nuhil.unions) {
      const c = classifyUnion(geo, nuhil, u);
      if (c.ok) matchedUnions += 1;
      else {
        unmatchedUnions += 1;
        parentMismatch[c.failure] = (parentMismatch[c.failure] ?? 0) + 1;
        parentContextKeys.add(
          `${c.failure}|${c.srcDivId}|${c.srcDistId}|${c.srcUpId}`,
        );
      }
    }
  }

  const normalizedUnionCount =
    normReport?.outputRowCount ?? unionsCsv.totalDataRows;
  const unmatchedUnionCount =
    normReport?.unmatchedCount ?? unmatchedCsvRows;
  let uniqueParentContexts = parentReport?.uniqueSourceParentCombinations ?? 0;
  if (!uniqueParentContexts && fs.existsSync(REVIEW_CSV)) {
    const rr = parseCsv(fs.readFileSync(REVIEW_CSV, "utf8").trim());
    uniqueParentContexts = Math.max(0, rr.length - 1);
  }
  if (!uniqueParentContexts) uniqueParentContexts = parentContextKeys.size;

  const recommendations: string[] = [
    `Treat ${NUHIL_REPO} as **bootstrap only**: MIT license, community-maintained, with known gaps (duplicates, missing names, outdated boundaries per upstream issues).`,
    "Keep `source='nuhil/bangladesh-geocode'` and `is_verified=false` on all rows from this bundle until an official source verifies them.",
    "Resolve parent mismatches only via **manually approved** `union-parent-mapping.csv` entries (simple review / helper workflows) — never auto-approve.",
    "Prefer HDX (or LGED/BBS when available) for authoritative division/district/upazila; nuhil fills union-level gaps under those parents.",
  ];
  if (unmatchedUnionCount > 0) {
    recommendations.push(
      `**${unmatchedUnionCount}** union rows remain unmatched to HDX parents — review \`union-parent-mapping-simple-review.csv\` in batches.`,
    );
  }
  if (rawUnionQuality.duplicateGroupCount > 0) {
    recommendations.push(
      `Raw nuhil unions show **${rawUnionQuality.duplicateGroupCount}** duplicate-name groups under the same upazila — dedupe keys in normalization use upazila+union id+names; watch for data quality when verifying.`,
    );
  }

  const canUseBootstrap = Boolean(nuhil && nuhilUnionsRaw > 0);

  const report = {
    generatedAt,
    nuhilSource: {
      repositoryUrl: NUHIL_REPO,
      license: "MIT (see repository LICENSE)",
      attributionNote:
        "Community dataset; GitHub issues cite duplicate unions, missing unions, missing English names, and outdated upazila records — use only as unverified bootstrap.",
    },
    requiredOutputSchema: {
      file: "data/locations/unions.csv",
      columns: [
        "division_code",
        "district_code",
        "upazila_code",
        "union_code",
        "name_en",
        "name_bn",
        "lat",
        "lng",
        "source",
        "is_verified",
      ],
      nuhilRowPolicy: {
        source: NUHIL_SOURCE,
        is_verified: false,
        latLngFromNuhilUnions: "Not used in current normalize path (empty in unions.csv for nuhil rows).",
      },
    },
    nuhilRawCounts: {
      divisions: nuhilDivisions,
      districts: nuhilDistricts,
      upazilas: nuhilUpazilas,
      unions: nuhilUnionsRaw,
    },
    nuhilRawUnionQuality: {
      missingEnglishName: rawUnionQuality.missingNameEn,
      missingBanglaName: rawUnionQuality.missingNameBn,
      duplicateNameGroupsUnderSameUpazila: rawUnionQuality.duplicateGroupCount,
      unionRowsInThoseDuplicateGroups: rawUnionQuality.unionRowsInDuplicateGroups,
    },
    unionsCsvSnapshot: {
      path: UNIONS_CSV,
      totalDataRows: unionsCsv.totalDataRows,
      rowsWithSourceNuhil: unionsCsv.nuhilSourceRows,
      missingEnglishName: unionsCsv.missingNameEn,
      missingBanglaName: unionsCsv.missingNameBn,
      isVerifiedTrue: unionsCsv.verifiedTrue,
    },
    normalizationReportSnapshot: normReport,
    parentMappingReportSnapshot: {
      uniqueSourceParentCombinations: parentReport?.uniqueSourceParentCombinations,
      failureBreakdown: parentReport?.failureBreakdown,
      unmatchedUnionRowsBefore: parentReport?.unmatchedUnionRowsBefore,
    },
    pipelineCounts: {
      nuhilUnionRowsInSource: nuhilUnionsRaw,
      matchedToHdxParentsByClassifier: matchedUnions,
      unmatchedNuhilUnionRows: unmatchedUnions,
      normalizedUnionRowsWritten: normalizedUnionCount,
      unmatchedUnionRowsReported: unmatchedUnionCount,
      uniqueUnmatchedSourceParentContexts: uniqueParentContexts,
      uniqueUnmatchedSourceParentContextsDerived: parentContextKeys.size,
      unionsUnmatchedCsvDataRows: unmatchedCsvRows,
    },
    parentMismatchReasons: parentMismatch,
    lastImportReportSnapshot: importReport
      ? {
          dryRun: importReport.dryRun ?? null,
          unions: importReport.unions ?? null,
          summary: importReport.summary ?? null,
        }
      : null,
    importSafety: {
      safeToImportIfQaPasses:
        "Run `npm run locations:qa` after each normalize; use `locations:import:dry-run` before production import. Import upserts — it does not delete existing unions.",
      nuhilDoesNotReplaceHdxParents: true,
    },
    canNuhilBeUsedAsBootstrapData: canUseBootstrap,
    dataPipelineNotes: [
      "nuhil CSVs from bangladesh-geocode are headerless; `loadNuhilBundle` uses `nuhilCsvBodyRows` so the first data row is not skipped (older `bodyRows` logic incorrectly dropped division id 1 and the first row of each nuhil file).",
    ],
    recommendation: recommendations,
  };

  fs.mkdirSync(path.dirname(OUT_AUDIT), { recursive: true });
  fs.writeFileSync(OUT_AUDIT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main();
