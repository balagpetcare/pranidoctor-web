/**
 * One-off / maintainer script: reads HDX-derived CSV exports in tmp/ and writes
 * `data/locations/{divisions,districts,upazilas}.csv` in the import format.
 *
 * Prerequisite (run from repo root):
 *   npx xlsx-cli -f tmp/bgd_admin_boundaries.xlsx -s bgd_admin1 -o tmp/hdx_admin1.csv
 *   npx xlsx-cli -f tmp/bgd_admin_boundaries.xlsx -s bgd_admin2 -o tmp/hdx_admin2.csv
 *   npx xlsx-cli -f tmp/bgd_admin_boundaries.xlsx -s bgd_admin3 -o tmp/hdx_admin3.csv
 *
 * Data source: OCHA HDX cod-ab-bgd v03 (admin1/2/3 centroids).
 * https://data.humdata.org/dataset/cod-ab-bgd
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data", "locations");

const HDX_SOURCE =
  "HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)";

const DIVISION_BN: Record<string, string> = {
  "10": "বরিশাল বিভাগ",
  "20": "চট্টগ্রাম বিভাগ",
  "30": "ঢাকা বিভাগ",
  "40": "খুলনা বিভাগ",
  "45": "ময়মনসিংহ বিভাগ",
  "50": "রাজশাহী বিভাগ",
  "55": "রংপুর বিভাগ",
  "60": "সিলেট বিভাগ",
};

function stripBdPrefix(pcode: string): string {
  const t = pcode.trim();
  return t.startsWith("BD") ? t.slice(2) : t;
}

function parseCsvLine(line: string): string[] {
  return line.split(",");
}

function readDataRows(file: string): string[][] {
  const raw = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const rows: string[][] = [];
  for (let i = 1; i < raw.length; i++) {
    rows.push(parseCsvLine(raw[i]));
  }
  return rows;
}

function esc(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function main(): void {
  const a1 = path.join(ROOT, "tmp", "hdx_admin1.csv");
  const a2 = path.join(ROOT, "tmp", "hdx_admin2.csv");
  const a3 = path.join(ROOT, "tmp", "hdx_admin3.csv");
  for (const f of [a1, a2, a3]) {
    if (!fs.existsSync(f)) {
      throw new Error(
        `Missing ${f}. Export HDX sheets to tmp/ first (see script header).`,
      );
    }
  }

  fs.mkdirSync(OUT, { recursive: true });

  const divRows = readDataRows(a1);
  const divisions: string[][] = [];
  for (const c of divRows) {
    const nameEn = c[0]?.trim() ?? "";
    const pcode = stripBdPrefix(c[4] ?? "");
    const lat = c[19]?.trim() ?? "";
    const lng = c[20]?.trim() ?? "";
    const nameBn = DIVISION_BN[pcode] ?? "";
    divisions.push([
      pcode,
      nameEn,
      nameBn,
      lat,
      lng,
      HDX_SOURCE,
      "true",
    ]);
  }

  const distRows = readDataRows(a2);
  const districts: string[][] = [];
  for (const c of distRows) {
    const nameEn = c[0]?.trim() ?? "";
    const dcode = stripBdPrefix(c[4] ?? "");
    const divCode = stripBdPrefix(c[9] ?? "");
    const lat = c[24]?.trim() ?? "";
    const lng = c[25]?.trim() ?? "";
    districts.push([
      divCode,
      dcode,
      nameEn,
      "",
      lat,
      lng,
      HDX_SOURCE,
      "true",
    ]);
  }

  const upRows = readDataRows(a3);
  const upazilas: string[][] = [];
  for (const c of upRows) {
    const nameEn = c[0]?.trim() ?? "";
    const ucode = stripBdPrefix(c[4] ?? "");
    const dcode = stripBdPrefix(c[9] ?? "");
    const lat = c[29]?.trim() ?? "";
    const lng = c[30]?.trim() ?? "";
    upazilas.push([dcode, ucode, nameEn, "", lat, lng, HDX_SOURCE, "true"]);
  }

  const divHeader =
    "code,name_en,name_bn,lat,lng,source,is_verified";
  const distHeader =
    "division_code,district_code,name_en,name_bn,lat,lng,source,is_verified";
  const upHeader =
    "district_code,upazila_code,name_en,name_bn,lat,lng,source,is_verified";

  fs.writeFileSync(
    path.join(OUT, "divisions.csv"),
    [divHeader, ...divisions.map((r) => r.map(esc).join(","))].join("\n") +
      "\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(OUT, "districts.csv"),
    [distHeader, ...districts.map((r) => r.map(esc).join(","))].join("\n") +
      "\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(OUT, "upazilas.csv"),
    [upHeader, ...upazilas.map((r) => r.map(esc).join(","))].join("\n") + "\n",
    "utf8",
  );

  // Header-only unions until LGED/BBS union export is added.
  fs.writeFileSync(
    path.join(OUT, "unions.csv"),
    "upazila_code,union_code,name_en,name_bn,lat,lng,source,is_verified\n",
    "utf8",
  );

  console.log(
    `Wrote divisions=${divisions.length} districts=${districts.length} upazilas=${upazilas.length} to ${OUT}`,
  );
}

main();
