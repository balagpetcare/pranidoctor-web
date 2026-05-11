/**
 * Compare current HDX-style location CSVs vs normalized full-nuhil hierarchy (read-only).
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseCsv } from "@/lib/locations/csv-parse";
import { normalizeLocationName } from "@/lib/locations/location-data-quality";

import { bodyRows } from "./_nuhil-bundle";

const DATA = path.join(process.cwd(), "data", "locations");
const NORM = path.join(DATA, "normalized");
const OUT = path.join(DATA, "reports", "current-vs-nuhil-hierarchy-report.json");

function nk(s: string): string {
  return normalizeLocationName(s).toLowerCase();
}

function loadCsv(path: string): string[][] | null {
  if (!fs.existsSync(path)) return null;
  const raw = fs.readFileSync(path, "utf8").trim();
  if (!raw) return null;
  return parseCsv(raw);
}

function main(): void {
  const curDiv = loadCsv(path.join(DATA, "divisions.csv"));
  const curDist = loadCsv(path.join(DATA, "districts.csv"));
  const curUp = loadCsv(path.join(DATA, "upazilas.csv"));
  const curUn = loadCsv(path.join(DATA, "unions.csv"));

  const nDiv = loadCsv(path.join(NORM, "nuhil-divisions.normalized.csv"));
  const nDist = loadCsv(path.join(NORM, "nuhil-districts.normalized.csv"));
  const nUp = loadCsv(path.join(NORM, "nuhil-upazilas.normalized.csv"));
  const nUn = loadCsv(path.join(NORM, "nuhil-unions.normalized.csv"));

  if (!nDiv || !nDist || !nUp || !nUn) {
    console.error("Run npm run locations:nuhil:normalize-full first.");
    process.exit(1);
  }

  const curDivBody = curDiv ? bodyRows(curDiv) : [];
  const curDistBody = curDist ? bodyRows(curDist) : [];
  const curUpBody = curUp ? bodyRows(curUp) : [];
  const curUnBody = curUn ? bodyRows(curUn) : [];
  const nDivBody = bodyRows(nDiv);
  const nDistBody = bodyRows(nDist);
  const nUpBody = bodyRows(nUp);
  const nUnBody = bodyRows(nUn);

  const curDivCodes = new Set(curDivBody.map((r) => (r[0] ?? "").trim()).filter(Boolean));
  const nDivCodes = new Set(nDivBody.map((r) => (r[0] ?? "").trim()).filter(Boolean));
  const divCodeIntersection = [...curDivCodes].filter((c) => nDivCodes.has(c)).length;

  const curByDivName = new Map<string, string>();
  for (const r of curDivBody) {
    curByDivName.set(nk(r[1] ?? ""), (r[0] ?? "").trim());
  }
  let matchingDivisionsByName = 0;
  const divisionRenames: { currentCode: string; nuhilCode: string; nameEn: string }[] = [];
  for (const r of nDivBody) {
    const nc = (r[0] ?? "").trim();
    const ne = (r[1] ?? "").trim();
    const k = nk(ne);
    const cc = curByDivName.get(k);
    if (cc) {
      matchingDivisionsByName += 1;
      if (cc !== nc) {
        divisionRenames.push({ currentCode: cc, nuhilCode: nc, nameEn: ne });
      }
    }
  }

  const curDistKeys = new Set(
    curDistBody.map((r) => `${(r[0] ?? "").trim()}|${(r[1] ?? "").trim()}`).filter((x) => x !== "|"),
  );
  const nDistKeys = new Set(
    nDistBody.map((r) => `${(r[0] ?? "").trim()}|${(r[1] ?? "").trim()}`).filter((x) => x !== "|"),
  );
  const distKeyIntersection = [...curDistKeys].filter((k) => nDistKeys.has(k)).length;

  const curDistByName = new Map<string, { div: string; dist: string; name: string }>();
  for (const r of curDistBody) {
    const div = (r[0] ?? "").trim();
    const dist = (r[1] ?? "").trim();
    const ne = (r[2] ?? "").trim();
    curDistByName.set(`${nk(ne)}`, { div, dist, name: ne });
  }
  let matchingDistrictsByName = 0;
  for (const r of nDistBody) {
    const ne = (r[2] ?? "").trim();
    if (curDistByName.has(nk(ne))) matchingDistrictsByName += 1;
  }

  const curUpKeys = new Set(
    curUpBody.map((r) => `${(r[0] ?? "").trim()}|${(r[1] ?? "").trim()}`).filter((x) => x !== "|"),
  );
  const nUpKeys = new Set(
    nUpBody.map((r) => `${(r[0] ?? "").trim()}|${(r[1] ?? "").trim()}`).filter((x) => x !== "|"),
  );
  const upKeyIntersection = [...curUpKeys].filter((k) => nUpKeys.has(k)).length;

  const currentOnlyUpazilas = curUpKeys.size - upKeyIntersection;
  const nuhilOnlyUpazilas = nUpKeys.size - upKeyIntersection;

  const renamedSamples = {
    divisionsDifferentCodeSameNormalizedName: divisionRenames.slice(0, 40),
  };

  const codeSpaceDisjointAtDivision =
    divCodeIntersection === 0 && curDivCodes.size > 0 && nDivCodes.size > 0;

  const apiRiskLevel = codeSpaceDisjointAtDivision ? "HIGH" : "MEDIUM";
  const importRiskLevel = codeSpaceDisjointAtDivision ? "HIGH" : "MEDIUM";
  const safeToSwitchCsv = false;
  const safeToSwitchCsvReason =
    "Administrative codes differ between HDX and nuhil; switching CSVs without a DB/code/cuid migration would orphan or duplicate hierarchy rows and break FKs. Manual approval + migration plan required.";

  const report = {
    generatedAt: new Date().toISOString(),
    currentCsvCounts: {
      divisions: curDivBody.length,
      districts: curDistBody.length,
      upazilas: curUpBody.length,
      unions: curUnBody.length,
    },
    nuhilNormalizedCounts: {
      divisions: nDivBody.length,
      districts: nDistBody.length,
      upazilas: nUpBody.length,
      unions: nUnBody.length,
    },
    codeOverlap: {
      divisionCodesIntersectionCount: divCodeIntersection,
      districtKeysIntersectionCount: distKeyIntersection,
      upazilaKeysIntersectionCount: upKeyIntersection,
      codeSpaceDisjointAtDivisionLevel: codeSpaceDisjointAtDivision,
    },
    nameAlignment: {
      matchingDivisionsByNormalizedEnglishName: matchingDivisionsByName,
      matchingDistrictsByNormalizedEnglishName: matchingDistrictsByName,
    },
    currentOnlyUpazilasApprox: currentOnlyUpazilas,
    nuhilOnlyUpazilasApprox: nuhilOnlyUpazilas,
    potentialRenamedOrMovedSamples: renamedSamples,
    expectedUnionCountAfterFullNuhilSwitch: nUnBody.length,
    expectedUnmatchedUnionCountAfterFullNuhilSwitchWithinCsv: 0,
    expectedUnmatchedUnionNote:
      "With a pure nuhil parent chain, union rows reference nuhil division/district/upazila ids — there is no HDX↔nuhil name mismatch inside the CSV. Database import is separate: existing Prisma rows use HDX-style `code` values and cuids; switching CSV codes without an id-mapping migration risks duplicate divisions and broken foreign keys.",
    apiRiskLevel,
    importRiskLevel,
    safeToSwitchCsv,
    safeToSwitchCsvReason,
    schemaMigrationNeeded: false,
    apiShapeChangesNeeded: false,
    recommendation: [
      codeSpaceDisjointAtDivision
        ? "Division (and likely district/upazila) **administrative codes** differ between HDX (e.g. 20) and nuhil (e.g. 1). Replacing CSVs alone does **not** migrate existing `Division`/`District`/… rows or mobile-stored **cuids** safely."
        : "Code overlap exists at division level — still verify district/upazila keys before any switch.",
      "Before switching live CSVs: plan a **DB migration** (code remap or full re-seed) and retest all cascades; keep `villages.csv` unchanged per policy.",
      "Until then: keep HDX parents + `normalize-unions` mapping workflow, or run imports only on a disposable database.",
    ],
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main();
