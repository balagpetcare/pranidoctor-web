/**
 * Load nuhil/bangladesh-geocode CSV bundle from `data/locations/raw/unions/`.
 */
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";

const RAW_UNIONS = path.join(process.cwd(), "data", "locations", "raw", "unions");

export function bodyRows(rows: string[][]): string[][] {
  return rows.slice(1).filter((r) => r.some((c) => (c ?? "").trim() !== ""));
}

/**
 * nuhil CSVs from bangladesh-geocode are usually **headerless** (first row is data).
 * Canonical union CSVs use a real header and should keep using {@link bodyRows}.
 */
export function nuhilCsvBodyRows(rows: string[][]): string[][] {
  const data = rows.filter((r) => r.some((c) => (c ?? "").trim() !== ""));
  if (data.length === 0) return [];
  const c0 = (data[0]?.[0] ?? "").replace(/"/g, "").trim().toLowerCase();
  if (
    c0 === "id" ||
    c0 === "division_code" ||
    c0 === "district_code" ||
    c0 === "upazila_code" ||
    c0 === "union_code"
  ) {
    return data.slice(1);
  }
  return data;
}

export type NuhilMaps = {
  divisions: Map<string, { nameEn: string; nameBn: string }>;
  districts: Map<string, { divisionId: string; nameEn: string; nameBn: string }>;
  upazilas: Map<string, { districtId: string; nameEn: string; nameBn: string }>;
  unions: { id: string; upazilaId: string; nameEn: string; nameBn: string }[];
};

export function loadNuhilBundle(): NuhilMaps | null {
  const divP = path.join(RAW_UNIONS, "nuhil-divisions.csv");
  const distP = path.join(RAW_UNIONS, "nuhil-districts.csv");
  const upP = path.join(RAW_UNIONS, "nuhil-upazilas.csv");
  const unP = path.join(RAW_UNIONS, "nuhil-unions.csv");
  if (![divP, distP, upP, unP].every((p) => fs.existsSync(p))) return null;

  const divisions = new Map<string, { nameEn: string; nameBn: string }>();
  const districts = new Map<string, { divisionId: string; nameEn: string; nameBn: string }>();
  const upazilas = new Map<string, { districtId: string; nameEn: string; nameBn: string }>();
  const unions: NuhilMaps["unions"] = [];

  const dRows = parseCsv(fs.readFileSync(divP, "utf8").trim());
  for (const r of nuhilCsvBodyRows(dRows)) {
    divisions.set((r[0] ?? "").replace(/"/g, "").trim(), {
      nameEn: (r[1] ?? "").trim(),
      nameBn: (r[2] ?? "").trim(),
    });
  }
  const distRows = parseCsv(fs.readFileSync(distP, "utf8").trim());
  for (const r of nuhilCsvBodyRows(distRows)) {
    districts.set((r[0] ?? "").replace(/"/g, "").trim(), {
      divisionId: (r[1] ?? "").replace(/"/g, "").trim(),
      nameEn: (r[2] ?? "").trim(),
      nameBn: (r[3] ?? "").trim(),
    });
  }
  const upRows = parseCsv(fs.readFileSync(upP, "utf8").trim());
  for (const r of nuhilCsvBodyRows(upRows)) {
    upazilas.set((r[0] ?? "").replace(/"/g, "").trim(), {
      districtId: (r[1] ?? "").replace(/"/g, "").trim(),
      nameEn: (r[2] ?? "").trim(),
      nameBn: (r[3] ?? "").trim(),
    });
  }
  const uRows = parseCsv(fs.readFileSync(unP, "utf8").trim());
  for (const r of nuhilCsvBodyRows(uRows)) {
    unions.push({
      id: (r[0] ?? "").replace(/"/g, "").trim(),
      upazilaId: (r[1] ?? "").replace(/"/g, "").trim(),
      nameEn: (r[2] ?? "").trim(),
      nameBn: (r[3] ?? "").trim(),
    });
  }
  return { divisions, districts, upazilas, unions };
}
