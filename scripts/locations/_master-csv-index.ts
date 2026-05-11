/**
 * Load division / district / upazila rows from `data/locations/*.csv` for normalization scripts.
 */
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";
import { normalizeLocationName } from "@/lib/locations/location-data-quality";

const DATA = path.join(process.cwd(), "data", "locations");

export type DivisionRow = {
  code: string;
  nameEn: string;
  nameBn: string;
};

export type DistrictRow = {
  divisionCode: string;
  districtCode: string;
  nameEn: string;
  nameBn: string;
};

export type UpazilaRow = {
  districtCode: string;
  upazilaCode: string;
  nameEn: string;
  nameBn: string;
};

function read(name: string): string[][] | null {
  const p = path.join(DATA, name);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8").trim();
  if (!raw) return null;
  return parseCsv(raw);
}

function body(rows: string[][]): string[][] {
  return rows.slice(1).filter((r) => r.some((c) => (c ?? "").trim() !== ""));
}

export type MasterGeo = {
  divisions: DivisionRow[];
  districts: DistrictRow[];
  upazilas: UpazilaRow[];
  divisionsByCode: Map<string, DivisionRow>;
  districtsByCode: Map<string, DistrictRow>;
  upazilasByDistrictAndCode: Map<string, UpazilaRow>;
};

export function loadMasterGeo(): MasterGeo {
  const divCsv = read("divisions.csv");
  const distCsv = read("districts.csv");
  const upCsv = read("upazilas.csv");

  const divisions: DivisionRow[] = [];
  const districts: DistrictRow[] = [];
  const upazilas: UpazilaRow[] = [];

  if (divCsv) {
    for (const r of body(divCsv)) {
      divisions.push({
        code: (r[0] ?? "").trim(),
        nameEn: (r[1] ?? "").trim(),
        nameBn: (r[2] ?? "").trim(),
      });
    }
  }
  if (distCsv) {
    for (const r of body(distCsv)) {
      districts.push({
        divisionCode: (r[0] ?? "").trim(),
        districtCode: (r[1] ?? "").trim(),
        nameEn: (r[2] ?? "").trim(),
        nameBn: (r[3] ?? "").trim(),
      });
    }
  }
  if (upCsv) {
    for (const r of body(upCsv)) {
      upazilas.push({
        districtCode: (r[0] ?? "").trim(),
        upazilaCode: (r[1] ?? "").trim(),
        nameEn: (r[2] ?? "").trim(),
        nameBn: (r[3] ?? "").trim(),
      });
    }
  }

  const divisionsByCode = new Map(divisions.map((d) => [d.code, d]));
  const districtsByCode = new Map(districts.map((d) => [d.districtCode, d]));
  const upazilasByDistrictAndCode = new Map(
    upazilas.map((u) => [`${u.districtCode}|${u.upazilaCode}`, u]),
  );

  return {
    divisions,
    districts,
    upazilas,
    divisionsByCode,
    districtsByCode,
    upazilasByDistrictAndCode,
  };
}

function keyName(s: string): string {
  return normalizeLocationName(s).toLowerCase();
}

/** Match district by code, or by normalized name within a division. */
export function resolveDistrict(
  geo: MasterGeo,
  divisionCode: string,
  districtCode: string | null,
  districtNameEn: string | null,
  districtNameBn: string | null,
): DistrictRow | null {
  if (districtCode && geo.districtsByCode.has(districtCode)) {
    const d = geo.districtsByCode.get(districtCode)!;
    if (d.divisionCode === divisionCode) return d;
  }
  const knEn = districtNameEn ? keyName(districtNameEn) : "";
  const knBn = districtNameBn ? keyName(districtNameBn) : "";
  for (const d of geo.districts) {
    if (d.divisionCode !== divisionCode) continue;
    if (knEn && (keyName(d.nameEn) === knEn || keyName(d.nameBn) === knEn)) return d;
    if (knBn && (keyName(d.nameBn) === knBn || keyName(d.nameEn) === knBn)) return d;
  }
  return null;
}

/** Match upazila by district + code, or by name within district. */
export function resolveUpazila(
  geo: MasterGeo,
  districtCode: string,
  upazilaCode: string | null,
  upazilaNameEn: string | null,
  upazilaNameBn: string | null,
): UpazilaRow | null {
  if (upazilaCode) {
    const k = `${districtCode}|${upazilaCode}`;
    const u = geo.upazilasByDistrictAndCode.get(k);
    if (u) return u;
  }
  const knEn = upazilaNameEn ? keyName(upazilaNameEn) : "";
  const knBn = upazilaNameBn ? keyName(upazilaNameBn) : "";
  const candidates = geo.upazilas.filter((u) => u.districtCode === districtCode);
  let hit: UpazilaRow | null = null;
  for (const u of candidates) {
    if (knEn && (keyName(u.nameEn) === knEn || keyName(u.nameBn) === knEn)) {
      if (hit) return null;
      hit = u;
    } else if (knBn && (keyName(u.nameBn) === knBn || keyName(u.nameEn) === knBn)) {
      if (hit) return null;
      hit = u;
    }
  }
  return hit;
}

/** Map nuhil division id (1–8) to HDX-style division `code` using division name + our master list. */
export function mapNuhilDivisionIdToOurDivisionCode(
  geo: MasterGeo,
  _nuhilDivisionId: string,
  nuhilDivisionNameEn: string,
): string | null {
  const aliases: Record<string, string> = {
    chattagram: "20",
    chattogram: "20",
    rajshahi: "50",
    khulna: "40",
    barisal: "10",
    barishal: "10",
    sylhet: "60",
    dhaka: "30",
    rangpur: "55",
    mymensingh: "45",
  };
  const k = keyName(nuhilDivisionNameEn);
  const fromAlias = aliases[k];
  if (fromAlias && geo.divisionsByCode.has(fromAlias)) return fromAlias;
  for (const d of geo.divisions) {
    if (keyName(d.nameEn) === k || keyName(d.nameBn) === k) return d.code;
  }
  void _nuhilDivisionId;
  return null;
}
