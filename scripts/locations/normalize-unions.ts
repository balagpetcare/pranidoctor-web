/**
 * Normalize union raw files under `data/locations/raw/unions/` into `data/locations/unions.csv`.
 *
 * Supports:
 * - **Canonical** CSV (header matches import layout).
 * - **nuhil** bundle: `nuhil-divisions.csv`, `nuhil-districts.csv`, `nuhil-upazilas.csv`, `nuhil-unions.csv`
 *   (copy from https://github.com/nuhil/bangladesh-geocode ). Output `is_verified=false`, `source=nuhil/bangladesh-geocode`.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";

import { writeCsvFile } from "./_csv-out";
import {
  loadMasterGeo,
  mapNuhilDivisionIdToOurDivisionCode,
  resolveDistrict,
  resolveUpazila,
} from "./_master-csv-index";
import { bodyRows, loadNuhilBundle } from "./_nuhil-bundle";

const MAP_APPROVED = path.join(
  process.cwd(),
  "data",
  "locations",
  "mappings",
  "union-parent-mapping.csv",
);

const RAW_UNIONS = path.join(process.cwd(), "data", "locations", "raw", "unions");
const OUT_UNIONS = path.join(process.cwd(), "data", "locations", "unions.csv");
const OUT_NORMALIZED = path.join(
  process.cwd(),
  "data",
  "locations",
  "normalized",
  "unions-normalized.csv",
);
const REPORT = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "union-normalization-report.json",
);
const UNMATCHED = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "unions-unmatched.csv",
);

const UNION_HEADER = [
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
];

function isCanonicalUnionHeader(firstRow: string[]): boolean {
  const h = (firstRow[0] ?? "").trim().toLowerCase();
  return h === "division_code";
}

function idxHeader(header: string[], name: string): number {
  return header.findIndex((h) => (h ?? "").trim().toLowerCase() === name.toLowerCase());
}

type ApprovedParent = { tgtDiv: string; tgtDist: string; tgtUp: string };

/** Keys: `source_division_code|source_district_code|source_upazila_code` (nuhil internal ids, may be empty). */
function loadApprovedParentMappings(): Map<string, ApprovedParent> {
  const out = new Map<string, ApprovedParent>();
  if (!fs.existsSync(MAP_APPROVED)) return out;
  const raw = fs.readFileSync(MAP_APPROVED, "utf8").trim();
  if (!raw) return out;
  const rows = parseCsv(raw);
  const h = rows[0] ?? [];
  const iSd = idxHeader(h, "source_division_code");
  const iSdi = idxHeader(h, "source_district_code");
  const iSu = idxHeader(h, "source_upazila_code");
  const iTd = idxHeader(h, "target_division_code");
  const iTdi = idxHeader(h, "target_district_code");
  const iTu = idxHeader(h, "target_upazila_code");
  const iRs = idxHeader(h, "review_status");
  if ([iSd, iSdi, iSu, iTd, iTdi, iTu, iRs].some((i) => i < 0)) return out;
  for (const r of bodyRows(rows)) {
    if ((r[iRs] ?? "").trim().toUpperCase() !== "APPROVED") continue;
    const tgtDiv = (r[iTd] ?? "").trim();
    const tgtDist = (r[iTdi] ?? "").trim();
    const tgtUp = (r[iTu] ?? "").trim();
    if (!tgtDiv || !tgtDist || !tgtUp) continue;
    const key = `${(r[iSd] ?? "").trim()}|${(r[iSdi] ?? "").trim()}|${(r[iSu] ?? "").trim()}`;
    out.set(key, { tgtDiv, tgtDist, tgtUp });
  }
  return out;
}

function mappingKey(divId: string, distId: string, upId: string): string {
  return `${divId.trim()}|${distId.trim()}|${upId.trim()}`;
}

function main(): void {
  const geo = loadMasterGeo();
  const generatedAt = new Date().toISOString();
  const outRows: string[][] = [];
  const unmatched: string[][] = [];
  const notes: string[] = [];
  let duplicateWarnings = 0;
  const seen = new Set<string>();

  const listCsv = fs.existsSync(RAW_UNIONS)
    ? fs.readdirSync(RAW_UNIONS).filter((f) => f.toLowerCase().endsWith(".csv"))
    : [];

  if (listCsv.length === 0) {
    notes.push("No CSV files in data/locations/raw/unions — output header only.");
  }

  for (const file of listCsv.sort()) {
    if (file.startsWith("nuhil-")) continue;
    const fp = path.join(RAW_UNIONS, file);
    const raw = fs.readFileSync(fp, "utf8").trim();
    if (!raw) continue;
    const rows = parseCsv(raw);
    if (rows.length < 2) continue;
    if (!isCanonicalUnionHeader(rows[0] ?? [])) {
      notes.push(`Skipped non-canonical file (not nuhil-* bundle): ${file}`);
      continue;
    }
    for (const r of bodyRows(rows)) {
      const division_code = (r[0] ?? "").trim();
      const district_code = (r[1] ?? "").trim();
      const upazila_code = (r[2] ?? "").trim();
      let union_code = (r[3] ?? "").trim();
      const name_en = (r[4] ?? "").trim();
      const name_bn = (r[5] ?? "").trim();
      const lat = (r[6] ?? "").trim();
      const lng = (r[7] ?? "").trim();
      const source = (r[8] ?? "").trim();
      const is_verified = (r[9] ?? "").trim().toLowerCase();
      if (!source) {
        unmatched.push(["missing_source", file, JSON.stringify(r)]);
        continue;
      }
      const dist = resolveDistrict(geo, division_code, district_code || null, null, null);
      if (!dist) {
        unmatched.push(["no_district_match", file, JSON.stringify(r)]);
        continue;
      }
      const up = resolveUpazila(geo, dist.districtCode, upazila_code || null, null, null);
      if (!up) {
        unmatched.push(["no_upazila_match", file, JSON.stringify(r)]);
        continue;
      }
      if (!union_code && !name_en && !name_bn) {
        unmatched.push(["missing_union_code_and_names", file, JSON.stringify(r)]);
        continue;
      }
      if (!union_code) union_code = "";
      const dedupeKey = `${up.upazilaCode}|${union_code}|${name_bn}|${name_en}`;
      if (seen.has(dedupeKey)) {
        duplicateWarnings += 1;
        continue;
      }
      seen.add(dedupeKey);
      outRows.push([
        dist.divisionCode,
        dist.districtCode,
        up.upazilaCode,
        union_code,
        name_en,
        name_bn,
        lat,
        lng,
        source,
        is_verified === "true" || is_verified === "1" || is_verified === "yes"
          ? "true"
          : "false",
      ]);
    }
  }

  const nuhil = loadNuhilBundle();
  if (nuhil) {
    notes.push("Processing nuhil/bangladesh-geocode bundle (bootstrap, is_verified=false).");
    const SOURCE_TAG = "nuhil/bangladesh-geocode";
    const approvedMap = loadApprovedParentMappings();
    if (approvedMap.size > 0) {
      notes.push(
        `Applied ${approvedMap.size} approved parent mapping key(s) from data/locations/mappings/union-parent-mapping.csv`,
      );
    }

    const tryApproved = (divId: string, distId: string, upId: string, u: (typeof nuhil.unions)[0]): boolean => {
      const appr = approvedMap.get(mappingKey(divId, distId, upId));
      if (!appr?.tgtDiv || !appr.tgtDist || !appr.tgtUp) return false;
      const dedupeKey = `${appr.tgtDist}|${appr.tgtUp}|${u.id}|${u.nameBn}|${u.nameEn}`;
      if (seen.has(dedupeKey)) {
        duplicateWarnings += 1;
        return true;
      }
      seen.add(dedupeKey);
      outRows.push([
        appr.tgtDiv,
        appr.tgtDist,
        appr.tgtUp,
        u.id,
        u.nameEn,
        u.nameBn,
        "",
        "",
        SOURCE_TAG,
        "false",
      ]);
      return true;
    };

    for (const u of nuhil.unions) {
      const up = nuhil.upazilas.get(u.upazilaId);
      if (!up) {
        if (tryApproved("", "", u.upazilaId, u)) continue;
        unmatched.push(["nuhil_missing_upazila", u.id, JSON.stringify(u)]);
        continue;
      }
      const dist = nuhil.districts.get(up.districtId);
      if (!dist) {
        if (tryApproved("", up.districtId, u.upazilaId, u)) continue;
        unmatched.push(["nuhil_missing_district", u.id, JSON.stringify(u)]);
        continue;
      }
      const div = nuhil.divisions.get(dist.divisionId);
      if (!div) {
        if (tryApproved(dist.divisionId, up.districtId, u.upazilaId, u)) continue;
        unmatched.push(["nuhil_missing_division", u.id, JSON.stringify(u)]);
        continue;
      }
      if (tryApproved(dist.divisionId, up.districtId, u.upazilaId, u)) continue;

      const ourDiv = mapNuhilDivisionIdToOurDivisionCode(geo, dist.divisionId, div.nameEn);
      if (!ourDiv) {
        unmatched.push([
          "nuhil_division_map_failed",
          dist.divisionId,
          JSON.stringify({ div: div.nameEn, union: u }),
        ]);
        continue;
      }
      const ourDist = resolveDistrict(geo, ourDiv, null, dist.nameEn, dist.nameBn);
      if (!ourDist) {
        unmatched.push(["nuhil_district_name_no_match", dist.nameEn, JSON.stringify(u)]);
        continue;
      }
      const ourUp = resolveUpazila(
        geo,
        ourDist.districtCode,
        null,
        up.nameEn,
        up.nameBn,
      );
      if (!ourUp) {
        unmatched.push(["nuhil_upazila_name_no_match", up.nameEn, JSON.stringify(u)]);
        continue;
      }
      const dedupeKey = `${ourUp.upazilaCode}|${u.id}|${u.nameBn}|${u.nameEn}`;
      if (seen.has(dedupeKey)) {
        duplicateWarnings += 1;
        continue;
      }
      seen.add(dedupeKey);
      outRows.push([
        ourDiv,
        ourDist.districtCode,
        ourUp.upazilaCode,
        u.id,
        u.nameEn,
        u.nameBn,
        "",
        "",
        SOURCE_TAG,
        "false",
      ]);
    }
  } else if (listCsv.some((f) => f.startsWith("nuhil-"))) {
    notes.push(
      "Incomplete nuhil bundle: need nuhil-divisions.csv, nuhil-districts.csv, nuhil-upazilas.csv, nuhil-unions.csv together.",
    );
  }

  writeCsvFile(OUT_UNIONS, UNION_HEADER, outRows);
  writeCsvFile(OUT_NORMALIZED, UNION_HEADER, outRows);

  if (unmatched.length) {
    writeCsvFile(UNMATCHED, ["reason", "detail", "payload"], unmatched);
  } else if (fs.existsSync(UNMATCHED)) {
    fs.unlinkSync(UNMATCHED);
  }

  const report = {
    generatedAt,
    inputFiles: listCsv,
    outputRowCount: outRows.length,
    unmatchedCount: unmatched.length,
    duplicateWarnings,
    notes,
  };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");

  console.log(JSON.stringify(report, null, 2));
}

main();
