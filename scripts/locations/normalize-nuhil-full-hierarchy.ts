/**
 * Normalize nuhil/bangladesh-geocode raw bundle into standalone CSVs (nuhil codes only).
 * Does not replace data/locations/*.csv — writes under data/locations/normalized/.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";
import { validateLatitude, validateLongitude } from "@/lib/locations/location-data-quality";

import { loadNuhilBundle, nuhilCsvBodyRows } from "./_nuhil-bundle";
import { writeCsvFile } from "./_csv-out";

const OUT_DIR = path.join(process.cwd(), "data", "locations", "normalized");
const DIST_RAW = path.join(process.cwd(), "data", "locations", "raw", "unions", "nuhil-districts.csv");
const SOURCE = "nuhil/bangladesh-geocode";
const VERIFIED = "false";

const DIV_H = ["code", "name_en", "name_bn", "lat", "lng", "source", "is_verified"];
const DIST_H = [
  "division_code",
  "district_code",
  "name_en",
  "name_bn",
  "lat",
  "lng",
  "source",
  "is_verified",
];
const UP_H = [
  "district_code",
  "upazila_code",
  "name_en",
  "name_bn",
  "lat",
  "lng",
  "source",
  "is_verified",
];
const UN_H = [
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

function safeLat(s: string): string {
  const t = (s ?? "").trim();
  if (!t) return "";
  const n = Number(t);
  if (!Number.isFinite(n) || !validateLatitude(n)) return "";
  return String(n);
}

function safeLng(s: string): string {
  const t = (s ?? "").trim();
  if (!t) return "";
  const n = Number(t);
  if (!Number.isFinite(n) || !validateLongitude(n)) return "";
  return String(n);
}

function main(): void {
  const nuhil = loadNuhilBundle();
  if (!nuhil) {
    console.error("nuhil bundle missing under data/locations/raw/unions/");
    process.exit(1);
  }

  const divRows: string[][] = [];
  for (const [code, d] of [...nuhil.divisions.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    divRows.push([code, d.nameEn, d.nameBn, "", "", SOURCE, VERIFIED]);
  }

  const distLatLng = new Map<string, { lat: string; lng: string }>();
  const dRaw = fs.readFileSync(DIST_RAW, "utf8").trim();
  const dParsed = parseCsv(dRaw);
  for (const r of nuhilCsvBodyRows(dParsed)) {
    const id = (r[0] ?? "").replace(/"/g, "").trim();
    const lat = safeLat(r[4] ?? "");
    const lng = safeLng(r[5] ?? "");
    if (id) distLatLng.set(id, { lat, lng });
  }

  const distRows: string[][] = [];
  for (const [distCode, d] of [...nuhil.districts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const ll = distLatLng.get(distCode) ?? { lat: "", lng: "" };
    distRows.push([
      d.divisionId,
      distCode,
      d.nameEn,
      d.nameBn,
      ll.lat,
      ll.lng,
      SOURCE,
      VERIFIED,
    ]);
  }

  const upRows: string[][] = [];
  for (const [upCode, u] of [...nuhil.upazilas.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    upRows.push([u.districtId, upCode, u.nameEn, u.nameBn, "", "", SOURCE, VERIFIED]);
  }

  const unRows: string[][] = [];
  for (const u of nuhil.unions) {
    const up = nuhil.upazilas.get(u.upazilaId);
    if (!up) continue;
    const dist = nuhil.districts.get(up.districtId);
    if (!dist) continue;
    unRows.push([
      dist.divisionId,
      up.districtId,
      u.upazilaId,
      u.id,
      u.nameEn,
      u.nameBn,
      "",
      "",
      SOURCE,
      VERIFIED,
    ]);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outDiv = path.join(OUT_DIR, "nuhil-divisions.normalized.csv");
  const outDist = path.join(OUT_DIR, "nuhil-districts.normalized.csv");
  const outUp = path.join(OUT_DIR, "nuhil-upazilas.normalized.csv");
  const outUn = path.join(OUT_DIR, "nuhil-unions.normalized.csv");

  writeCsvFile(outDiv, DIV_H, divRows);
  writeCsvFile(outDist, DIST_H, distRows);
  writeCsvFile(outUp, UP_H, upRows);
  writeCsvFile(outUn, UN_H, unRows);

  const report = {
    generatedAt: new Date().toISOString(),
    outputs: [outDiv, outDist, outUp, outUn],
    counts: {
      divisions: divRows.length,
      districts: distRows.length,
      upazilas: upRows.length,
      unions: unRows.length,
    },
    source: SOURCE,
    isVerified: false,
  };
  console.log(JSON.stringify(report, null, 2));
}

main();
