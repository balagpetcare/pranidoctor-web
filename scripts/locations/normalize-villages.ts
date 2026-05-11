/**
 * Normalize village raw files under `data/locations/raw/villages/` into `data/locations/villages.csv`.
 *
 * Canonical header (11 cols) plus optional trailing columns for union name fallback when `union_code` is empty:
 * `union_name_en`, `union_name_bn` (12th and 13th columns).
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";
import { normalizeLocationName } from "@/lib/locations/location-data-quality";

import { writeCsvFile } from "./_csv-out";
import { loadMasterGeo, resolveDistrict, resolveUpazila } from "./_master-csv-index";

const RAW_VIL = path.join(process.cwd(), "data", "locations", "raw", "villages");
const OUT_VIL = path.join(process.cwd(), "data", "locations", "villages.csv");
const OUT_NORMALIZED = path.join(
  process.cwd(),
  "data",
  "locations",
  "normalized",
  "villages-normalized.csv",
);
const REPORT = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "village-normalization-report.json",
);
const UNMATCHED = path.join(
  process.cwd(),
  "data",
  "locations",
  "reports",
  "villages-unmatched.csv",
);
const UNIONS_MASTER = path.join(process.cwd(), "data", "locations", "unions.csv");

const VIL_HEADER = [
  "division_code",
  "district_code",
  "upazila_code",
  "union_code",
  "village_code",
  "name_en",
  "name_bn",
  "lat",
  "lng",
  "source",
  "is_verified",
];

function bodyRows(rows: string[][]): string[][] {
  return rows.slice(1).filter((r) => r.some((c) => (c ?? "").trim() !== ""));
}

function isCanonicalVillageHeader(row: string[]): boolean {
  return (row[0] ?? "").trim().toLowerCase() === "division_code";
}

type UnionRow = {
  divisionCode: string;
  districtCode: string;
  upazilaCode: string;
  unionCode: string;
  nameEn: string;
  nameBn: string;
};

function loadUnionsMaster(): UnionRow[] {
  if (!fs.existsSync(UNIONS_MASTER)) return [];
  const raw = fs.readFileSync(UNIONS_MASTER, "utf8").trim();
  if (!raw) return [];
  const rows = parseCsv(raw);
  const out: UnionRow[] = [];
  for (const r of bodyRows(rows)) {
    if ((r[0] ?? "").toLowerCase() === "division_code") continue;
    out.push({
      divisionCode: (r[0] ?? "").trim(),
      districtCode: (r[1] ?? "").trim(),
      upazilaCode: (r[2] ?? "").trim(),
      unionCode: (r[3] ?? "").trim(),
      nameEn: (r[4] ?? "").trim(),
      nameBn: (r[5] ?? "").trim(),
    });
  }
  return out;
}

function nk(s: string): string {
  return normalizeLocationName(s).toLowerCase();
}

function resolveUnionForVillage(
  unions: UnionRow[],
  divisionCode: string,
  districtCode: string,
  upazilaCode: string,
  unionCode: string | null,
  unionNameEn: string | null,
  unionNameBn: string | null,
): UnionRow | null {
  const pool = unions.filter(
    (u) =>
      u.divisionCode === divisionCode &&
      u.districtCode === districtCode &&
      u.upazilaCode === upazilaCode,
  );
  if (unionCode && unionCode.trim()) {
    const byCode = pool.filter((u) => u.unionCode === unionCode.trim());
    if (byCode.length === 1) return byCode[0]!;
    if (byCode.length > 1) return null;
  }
  const knEn = unionNameEn ? nk(unionNameEn) : "";
  const knBn = unionNameBn ? nk(unionNameBn) : "";
  if (!knEn && !knBn) return null;
  let hit: UnionRow | null = null;
  for (const u of pool) {
    if (knEn && (nk(u.nameEn) === knEn || nk(u.nameBn) === knEn)) {
      if (hit) return null;
      hit = u;
    } else if (knBn && (nk(u.nameBn) === knBn || nk(u.nameEn) === knBn)) {
      if (hit) return null;
      hit = u;
    }
  }
  return hit;
}

function main(): void {
  const geo = loadMasterGeo();
  const unions = loadUnionsMaster();
  const generatedAt = new Date().toISOString();
  const outRows: string[][] = [];
  const unmatched: string[][] = [];
  const notes: string[] = [];
  let duplicateWarnings = 0;
  const seen = new Set<string>();

  if (unions.length === 0) {
    notes.push(
      "unions.csv has no data rows — village normalization cannot resolve parents; output header only unless canonical rows self-contain union_code.",
    );
  }

  const listCsv = fs.existsSync(RAW_VIL)
    ? fs.readdirSync(RAW_VIL).filter((f) => f.toLowerCase().endsWith(".csv"))
    : [];

  if (listCsv.length === 0) {
    notes.push("No CSV files in data/locations/raw/villages — output header only.");
  }

  for (const file of listCsv.sort()) {
    const fp = path.join(RAW_VIL, file);
    const raw = fs.readFileSync(fp, "utf8").trim();
    if (!raw) continue;
    const rows = parseCsv(raw);
    if (rows.length < 2) continue;
    const header = rows[0] ?? [];
    if (!isCanonicalVillageHeader(header)) {
      notes.push(`Skipped unknown header format: ${file}`);
      continue;
    }
    const idx = (name: string) =>
      header.findIndex((h) => (h ?? "").trim().toLowerCase() === name.toLowerCase());
    const iDiv = idx("division_code");
    const iDist = idx("district_code");
    const iUp = idx("upazila_code");
    const iUn = idx("union_code");
    const iVil = idx("village_code");
    const iNe = idx("name_en");
    const iNb = idx("name_bn");
    const iLat = idx("lat");
    const iLng = idx("lng");
    const iSrc = idx("source");
    const iVer = idx("is_verified");
    const iUne = idx("union_name_en");
    const iUnb = idx("union_name_bn");
    if ([iDiv, iDist, iUp, iUn, iVil, iNe, iNb, iLat, iLng, iSrc, iVer].some((i) => i < 0)) {
      notes.push(`Missing required columns in ${file}`);
      continue;
    }

    for (const r of bodyRows(rows)) {
      const g = (i: number) => (r[i] ?? "").trim();
      const division_code = g(iDiv);
      const district_code = g(iDist);
      const upazila_code = g(iUp);
      let union_code = g(iUn);
      const village_code = g(iVil);
      const name_en = g(iNe);
      const name_bn = g(iNb);
      const lat = g(iLat);
      const lng = g(iLng);
      const source = g(iSrc);
      const is_verified = g(iVer).toLowerCase();
      const union_name_en = iUne >= 0 ? g(iUne) : "";
      const union_name_bn = iUnb >= 0 ? g(iUnb) : "";

      if (!source) {
        unmatched.push(["missing_source", file, JSON.stringify(r)]);
        continue;
      }
      if (!name_bn) {
        unmatched.push(["missing_name_bn", file, JSON.stringify(r)]);
        continue;
      }

      const dist = resolveDistrict(geo, division_code, district_code || null, null, null);
      if (!dist) {
        unmatched.push(["no_district", file, JSON.stringify(r)]);
        continue;
      }
      const up = resolveUpazila(geo, dist.districtCode, upazila_code || null, null, null);
      if (!up) {
        unmatched.push(["no_upazila", file, JSON.stringify(r)]);
        continue;
      }

      if (union_code) {
        if (unions.length > 0) {
          const pool = unions.filter(
            (u) =>
              u.divisionCode === division_code &&
              u.districtCode === dist.districtCode &&
              u.upazilaCode === up.upazilaCode &&
              u.unionCode === union_code,
          );
          if (pool.length === 0) {
            unmatched.push(["union_code_not_found_in_unions_csv", file, JSON.stringify(r)]);
            continue;
          }
        }
      } else {
        const uRow = resolveUnionForVillage(
          unions,
          division_code,
          dist.districtCode,
          up.upazilaCode,
          null,
          union_name_en || null,
          union_name_bn || null,
        );
        if (!uRow || !uRow.unionCode) {
          unmatched.push([
            "no_union_match_need_code_or_name_and_unions_master",
            file,
            JSON.stringify(r),
          ]);
          continue;
        }
        union_code = uRow.unionCode;
      }

      const mouzaNote = source;
      const dedupeKey = `${union_code}|${village_code}|${nk(name_bn)}|${nk(name_en)}`;
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
        village_code,
        name_en,
        name_bn,
        lat,
        lng,
        mouzaNote,
        is_verified === "true" || is_verified === "1" || is_verified === "yes"
          ? "true"
          : "false",
      ]);
    }
  }

  writeCsvFile(OUT_VIL, VIL_HEADER, outRows);
  writeCsvFile(OUT_NORMALIZED, VIL_HEADER, outRows);

  if (unmatched.length) {
    writeCsvFile(UNMATCHED, ["reason", "file", "row_json"], unmatched);
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
