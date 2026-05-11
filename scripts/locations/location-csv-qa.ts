/**
 * QA checks for `data/locations/unions.csv` and `data/locations/villages.csv` before import.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";
import {
  normalizeLocationName,
  parseNullableCoordinate,
  validateLatitude,
  validateLocationCsvRow,
  validateLongitude,
  validateUnionCsvHierarchyRow,
} from "@/lib/locations/location-data-quality";

import { loadMasterGeo, resolveDistrict, resolveUpazila } from "./_master-csv-index";

const DATA = path.join(process.cwd(), "data", "locations");
const REPORT = path.join(DATA, "reports", "location-csv-qa-report.json");

function body(rows: string[][]): string[][] {
  return rows.slice(1).filter((r) => r.some((c) => (c ?? "").trim() !== ""));
}

function readCsv(name: string): string[][] | null {
  const p = path.join(DATA, name);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8").trim();
  if (!raw) return null;
  return parseCsv(raw);
}

const NUHIL_EXPECTED = {
  divisions: 8,
  districts: 64,
  upazilas: 494,
  unions: 4540,
} as const;

type QaReport = {
  generatedAt: string;
  /** Row counts from master CSVs (division → union), for nuhil rebuild verification. */
  hierarchyCsvCounts: {
    divisions: number;
    districts: number;
    upazilas: number;
    unions: number;
  };
  nuhilBootstrapExpected: typeof NUHIL_EXPECTED;
  hierarchyMatchesNuhilBootstrapCounts: boolean;
  unions: {
    rowCount: number;
    missingSource: number;
    invalidVerified: number;
    invalidCoords: number;
    missingParent: number;
    duplicateUnionUnderUpazila: number;
    validationErrors: number;
  };
  villages: {
    rowCount: number;
    missingSource: number;
    invalidVerified: number;
    invalidCoords: number;
    missingParent: number;
    duplicateVillageUnderUnion: number;
    validationErrors: number;
    unionNotInUnionsCsv: number;
  };
  safeToImport: boolean;
  notes: string[];
};

function main(): void {
  const geo = loadMasterGeo();
  const generatedAt = new Date().toISOString();
  const notes: string[] = [];

  const unionRows = readCsv("unions.csv");
  const vilRows = readCsv("villages.csv");
  const unionsParsed = unionRows && unionRows.length > 1 ? body(unionRows) : [];
  const vilParsed = vilRows && vilRows.length > 1 ? body(vilRows) : [];

  const unionKeys = new Map<string, number>();
  let uMissingSource = 0;
  let uInvalidVerified = 0;
  let uInvalidCoords = 0;
  let uMissingParent = 0;
  let uDup = 0;
  let uValErr = 0;

  for (const r of unionsParsed) {
    const chk = validateUnionCsvHierarchyRow(r);
    if (!chk.ok) {
      uValErr += 1;
      continue;
    }
    if (!chk.source?.trim()) uMissingSource += 1;
    if (chk.isVerified && chk.source?.includes("nuhil")) uInvalidVerified += 1;

    const latP = parseNullableCoordinate(r[6]);
    const lngP = parseNullableCoordinate(r[7]);
    if (latP.error || lngP.error) uInvalidCoords += 1;
    if (latP.value != null && !validateLatitude(latP.value)) uInvalidCoords += 1;
    if (lngP.value != null && !validateLongitude(lngP.value)) uInvalidCoords += 1;

    if (!geo.divisionsByCode.get(chk.divisionCode!)) {
      uMissingParent += 1;
      continue;
    }
    const dist = resolveDistrict(geo, chk.divisionCode!, chk.districtCode!, null, null);
    if (!dist) {
      uMissingParent += 1;
      continue;
    }
    const up = resolveUpazila(geo, dist.districtCode, chk.upazilaCode!, null, null);
    if (!up) {
      uMissingParent += 1;
      continue;
    }

    const k = `${up.upazilaCode}|${normalizeLocationName(chk.unionCode ?? "")}|${normalizeLocationName(chk.nameBn ?? chk.nameEn ?? "")}`;
    unionKeys.set(k, (unionKeys.get(k) ?? 0) + 1);
  }
  for (const [, c] of unionKeys) {
    if (c > 1) uDup += c - 1;
  }

  const unionMasterKeys = new Set<string>();
  for (const r of unionsParsed) {
    const div = (r[0] ?? "").trim();
    const dist = (r[1] ?? "").trim();
    const up = (r[2] ?? "").trim();
    const code = (r[3] ?? "").trim();
    unionMasterKeys.add(`${div}|${dist}|${up}|${code}`);
  }

  const vilKeys = new Map<string, number>();
  let vMissingSource = 0;
  let vInvalidVerified = 0;
  let vInvalidCoords = 0;
  let vMissingParent = 0;
  let vDup = 0;
  let vValErr = 0;
  let vUnionMissing = 0;

  for (const r of vilParsed) {
    const chk = validateLocationCsvRow(r);
    if (!chk.ok) {
      vValErr += 1;
      continue;
    }
    if (!chk.source?.trim()) vMissingSource += 1;
    if (chk.isVerified && chk.source?.includes("nuhil")) vInvalidVerified += 1;

    const latP = parseNullableCoordinate(r[7]);
    const lngP = parseNullableCoordinate(r[8]);
    if (latP.error || lngP.error) vInvalidCoords += 1;
    if (latP.value != null && !validateLatitude(latP.value)) vInvalidCoords += 1;
    if (lngP.value != null && !validateLongitude(lngP.value)) vInvalidCoords += 1;

    if (!geo.divisionsByCode.get(chk.divisionCode!)) {
      vMissingParent += 1;
      continue;
    }
    const dist = resolveDistrict(geo, chk.divisionCode!, chk.districtCode!, null, null);
    if (!dist) {
      vMissingParent += 1;
      continue;
    }
    const up = resolveUpazila(geo, dist.districtCode, chk.upazilaCode!, null, null);
    if (!up) {
      vMissingParent += 1;
      continue;
    }
    const uk = `${chk.divisionCode}|${chk.districtCode}|${chk.upazilaCode}|${chk.unionCode}`;
    if (unionsParsed.length > 0 && !unionMasterKeys.has(uk)) vUnionMissing += 1;

    const vk = `${chk.unionCode}|${normalizeLocationName(chk.nameBn ?? "")}|${normalizeLocationName(chk.nameEn ?? "")}`;
    vilKeys.set(vk, (vilKeys.get(vk) ?? 0) + 1);
  }
  for (const [, c] of vilKeys) {
    if (c > 1) vDup += c - 1;
  }

  if (unionsParsed.length === 0) notes.push("unions.csv has no data rows.");
  if (vilParsed.length === 0) notes.push("villages.csv has no data rows.");

  const hierarchyCsvCounts = {
    divisions: geo.divisions.length,
    districts: geo.districts.length,
    upazilas: geo.upazilas.length,
    unions: unionsParsed.length,
  };
  const hierarchyMatchesNuhilBootstrapCounts =
    hierarchyCsvCounts.divisions === NUHIL_EXPECTED.divisions &&
    hierarchyCsvCounts.districts === NUHIL_EXPECTED.districts &&
    hierarchyCsvCounts.upazilas === NUHIL_EXPECTED.upazilas &&
    hierarchyCsvCounts.unions === NUHIL_EXPECTED.unions;
  if (!hierarchyMatchesNuhilBootstrapCounts) {
    notes.push(
      `hierarchyCsvCounts ${JSON.stringify(hierarchyCsvCounts)} differ from nuhil baseline ${JSON.stringify(NUHIL_EXPECTED)} — confirm raw bundle / normalize step.`,
    );
  }

  const blocking =
    uMissingSource +
    uInvalidCoords +
    uMissingParent +
    uValErr +
    vMissingSource +
    vInvalidCoords +
    vMissingParent +
    vValErr +
    vUnionMissing;

  const safeToImport = blocking === 0;
  if (uInvalidVerified + vInvalidVerified > 0) {
    notes.push(
      "Review invalidVerified: rows marked verified=true with nuhil source should be corrected.",
    );
  }

  const report: QaReport = {
    generatedAt,
    hierarchyCsvCounts,
    nuhilBootstrapExpected: NUHIL_EXPECTED,
    hierarchyMatchesNuhilBootstrapCounts,
    unions: {
      rowCount: unionsParsed.length,
      missingSource: uMissingSource,
      invalidVerified: uInvalidVerified,
      invalidCoords: uInvalidCoords,
      missingParent: uMissingParent,
      duplicateUnionUnderUpazila: uDup,
      validationErrors: uValErr,
    },
    villages: {
      rowCount: vilParsed.length,
      missingSource: vMissingSource,
      invalidVerified: vInvalidVerified,
      invalidCoords: vInvalidCoords,
      missingParent: vMissingParent,
      duplicateVillageUnderUnion: vDup,
      validationErrors: vValErr,
      unionNotInUnionsCsv: vUnionMissing,
    },
    safeToImport,
    notes,
  };

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main();
