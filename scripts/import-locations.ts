/**
 * Import Bangladesh location master rows from `data/locations/*.csv`.
 * Safe upsert: never invents unions/villages or coordinates.
 *
 * Usage:
 *   npx tsx scripts/import-locations.ts
 *   npx tsx scripts/import-locations.ts --dry-run
 *   npm run locations:import
 *   npm run locations:import:dry-run
 *
 * Requires: DATABASE_URL, applied location master migration (lat/lng columns).
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/locations/csv-parse";
import {
  normalizeLocationCode,
  normalizeLocationName,
  validateLatitude,
  validateLocationCsvRow,
  validateLongitude,
  validateUnionCsvHierarchyRow,
} from "@/lib/locations/location-data-quality";
import { slugifyGeoLabel } from "@/lib/locations/slugify";

const DATA_DIR = path.join(process.cwd(), "data", "locations");
const REPORT_PATH = path.join(DATA_DIR, "import-report.json");

const DRY_RUN = process.argv.includes("--dry-run");

const LEGACY_DIVISION_SLUG: Record<string, string> = {
  "30": "dhaka-division-geo",
};

type LevelStats = {
  imported: number;
  updated: number;
  skipped: number;
  invalid: number;
  duplicateWarnings: number;
};

type ImportReport = {
  generatedAt: string;
  dryRun: boolean;
  divisions: LevelStats;
  districts: LevelStats;
  upazilas: LevelStats;
  unions: LevelStats;
  villages: LevelStats;
  summary: {
    missingParent: number;
    invalidCoordinate: number;
    pendingVerificationApprox: number;
    /** Sum of duplicateWarnings from union + village passes (import-time heuristics). */
    duplicateWarningsTotal: number;
    /** Active rows missing latitude or longitude (DB snapshot at end of run). */
    missingCoordinatesInDb: number;
  };
  notes: string[];
};

function emptyLevel(): LevelStats {
  return {
    imported: 0,
    updated: 0,
    skipped: 0,
    invalid: 0,
    duplicateWarnings: 0,
  };
}

function parseBool(s: string | undefined): boolean {
  const t = (s ?? "").trim().toLowerCase();
  if (!t) return false;
  return t === "true" || t === "1" || t === "yes";
}

function toDecimal(n: number | null): Prisma.Decimal | null {
  if (n == null) return null;
  try {
    return new Prisma.Decimal(n);
  } catch {
    return null;
  }
}

function nonempty(s: string | undefined): string | null {
  const t = (s ?? "").trim();
  return t.length ? t : null;
}

async function uniqueSlug(
  model: "division" | "district" | "upazila" | "union" | "village",
  base: string,
): Promise<string> {
  let slug = base;
  let n = 0;
  for (;;) {
    const exists =
      model === "division"
        ? await prisma.division.findFirst({ where: { slug }, select: { id: true } })
        : model === "district"
          ? await prisma.district.findFirst({ where: { slug }, select: { id: true } })
          : model === "upazila"
            ? await prisma.upazila.findFirst({ where: { slug }, select: { id: true } })
            : model === "union"
              ? await prisma.union.findFirst({ where: { slug }, select: { id: true } })
              : await prisma.village.findFirst({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

function readCsv(name: string): string[][] | null {
  const p = path.join(DATA_DIR, name);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8").trim();
  if (!raw) return null;
  return parseCsv(raw);
}

function bodyRows(rows: string[][]): string[][] {
  return rows.slice(1).filter((r) => r.some((c) => (c ?? "").trim() !== ""));
}

function isHierarchyUnionHeader(header: string): boolean {
  const h = header.toLowerCase();
  return h.includes("division_code") && h.includes("upazila_code");
}

/** Stable synthetic ids so `--dry-run` can resolve CSV hierarchy before rows exist in DB. */
const DRY_RUN_LOC_PREFIX = "__dry_run_loc__";

function dryRunVirtualDivisionId(code: string): string {
  return `${DRY_RUN_LOC_PREFIX}div:${code}`;
}

function dryRunVirtualDistrictId(divCode: string, distCode: string): string {
  return `${DRY_RUN_LOC_PREFIX}dist:${divCode}:${distCode}`;
}

function dryRunVirtualUpazilaId(divCode: string, distCode: string, upCode: string): string {
  return `${DRY_RUN_LOC_PREFIX}up:${divCode}:${distCode}:${upCode}`;
}

function isDryRunVirtualLocationId(id: string): boolean {
  return id.startsWith(DRY_RUN_LOC_PREFIX);
}

function writeReport(report: ImportReport): void {
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
}

async function resolveUpazilaId(
  divisionByCode: Map<string, { id: string }>,
  divCode: string,
  distCode: string,
  upCode: string,
  dryRunUpazilaByKey?: Map<string, string>,
): Promise<string | null> {
  const divN = normalizeLocationCode(divCode);
  const distN = normalizeLocationCode(distCode);
  const upN = normalizeLocationCode(upCode);
  const cacheKey = `${divN}|${distN}|${upN}`;
  if (dryRunUpazilaByKey?.has(cacheKey)) {
    return dryRunUpazilaByKey.get(cacheKey)!;
  }
  const div = divisionByCode.get(divN) ?? divisionByCode.get(divCode);
  if (!div) return null;
  const dists = await prisma.district.findMany({
    where: { divisionId: div.id, isActive: true },
    select: { id: true, code: true },
  });
  const dist = dists.find((d) => normalizeLocationCode(d.code) === distN);
  if (!dist) return null;
  const ups = await prisma.upazila.findMany({
    where: { districtId: dist.id, isActive: true },
    select: { id: true, code: true },
  });
  const up = ups.find((u) => normalizeLocationCode(u.code) === upN);
  return up?.id ?? null;
}

async function main(): Promise<void> {
  const report: ImportReport = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    divisions: emptyLevel(),
    districts: emptyLevel(),
    upazilas: emptyLevel(),
    unions: emptyLevel(),
    villages: emptyLevel(),
    summary: {
      missingParent: 0,
      invalidCoordinate: 0,
      pendingVerificationApprox: 0,
      duplicateWarningsTotal: 0,
      missingCoordinatesInDb: 0,
    },
    notes: DRY_RUN ? ["dry_run=true (no database writes)"] : [],
  };

  const divCsv = readCsv("divisions.csv");
  if (!divCsv) {
    report.notes.push("divisions.csv missing — abort.");
    writeReport(report);
    throw new Error("divisions.csv missing under data/locations/");
  }

  if (!(divCsv[0]?.join(",") ?? "").includes("code")) {
    throw new Error("divisions.csv: unexpected header");
  }

  const divisionByCode = new Map<string, { id: string }>();

  type DivisionCacheRow = { id: string; slug: string; code: string | null };
  let divisionCache: DivisionCacheRow[] = [];

  async function refreshDivisionCache(): Promise<void> {
    if (DRY_RUN) return;
    divisionCache = await prisma.division.findMany({
      select: { id: true, slug: true, code: true },
    });
  }

  type DistrictCacheRow = {
    id: string;
    slug: string;
    divisionId: string;
    code: string | null;
    nameEn: string | null;
  };
  let districtCache: DistrictCacheRow[] = [];

  async function refreshDistrictCache(): Promise<void> {
    if (DRY_RUN) return;
    districtCache = await prisma.district.findMany({
      select: { id: true, slug: true, divisionId: true, code: true, nameEn: true },
    });
  }

  type UpazilaCacheRow = {
    id: string;
    slug: string;
    districtId: string;
    code: string | null;
    nameEn: string | null;
  };
  let upazilaCache: UpazilaCacheRow[] = [];

  async function refreshUpazilaCache(): Promise<void> {
    if (DRY_RUN) return;
    upazilaCache = await prisma.upazila.findMany({
      select: { id: true, slug: true, districtId: true, code: true, nameEn: true },
    });
  }

  await refreshDivisionCache();

  const dryRunDivisionHits = DRY_RUN
    ? await prisma.division.findMany({ select: { id: true, slug: true, code: true } })
    : [];

  for (const row of bodyRows(divCsv)) {
    const rawCode = nonempty(row[0]);
    const code = rawCode ? normalizeLocationCode(rawCode) : null;
    const nameEn = nonempty(row[1]);
    const nameBn = nonempty(row[2]);
    const latN = parseNullableNumber(row[3]);
    const lngN = parseNullableNumber(row[4]);
    if (latN.invalid || lngN.invalid) {
      report.summary.invalidCoordinate += 1;
    }
    let latNum = latN.n;
    let lngNum = lngN.n;
    if (latNum != null && !validateLatitude(latNum)) {
      report.summary.invalidCoordinate += 1;
      latNum = null;
    }
    if (lngNum != null && !validateLongitude(lngNum)) {
      report.summary.invalidCoordinate += 1;
      lngNum = null;
    }
    const lat = toDecimal(latNum);
    const lng = toDecimal(lngNum);
    const source = nonempty(row[5]);
    const isVerified = parseBool(row[6]);

    if (!code || !nameEn) {
      report.divisions.invalid += 1;
      continue;
    }

    const legacySlug = code ? LEGACY_DIVISION_SLUG[code] : undefined;
    const existing = DRY_RUN
      ? (dryRunDivisionHits.find((d) => normalizeLocationCode(d.code) === code) ??
        (legacySlug ? dryRunDivisionHits.find((d) => d.slug === legacySlug) : undefined) ??
        null)
      : (divisionCache.find((d) => normalizeLocationCode(d.code) === code) ??
        (legacySlug ? divisionCache.find((d) => d.slug === legacySlug) : undefined) ??
        null);

    const displayEn = nameEn;
    const slug =
      existing?.slug ??
      legacySlug ??
      (await uniqueSlug(
        "division",
        `${slugifyGeoLabel(displayEn) || "division"}-division`,
      ));

    if (!DRY_RUN) {
      if (existing) {
        await prisma.division.update({
          where: { id: existing.id },
          data: {
            name: displayEn,
            nameEn: displayEn,
            nameBn: nameBn,
            code,
            latitude: lat,
            longitude: lng,
            source,
            isVerified,
            isActive: true,
          },
        });
        report.divisions.updated += 1;
      } else {
        await prisma.division.create({
          data: {
            slug,
            name: displayEn,
            nameEn: displayEn,
            nameBn: nameBn,
            code,
            latitude: lat,
            longitude: lng,
            source,
            isVerified,
            isActive: true,
            sortOrder: 0,
          },
        });
        report.divisions.imported += 1;
      }
      await refreshDivisionCache();
    } else {
      if (existing) report.divisions.updated += 1;
      else report.divisions.imported += 1;
    }

    const persistedDiv =
      DRY_RUN && code
        ? { id: dryRunVirtualDivisionId(code) }
        : code
          ? (divisionCache.find((d) => normalizeLocationCode(d.code) === code) ?? null)
          : null;
    if (persistedDiv) {
      divisionByCode.set(code, { id: persistedDiv.id });
    }
  }

  const distCsv = readCsv("districts.csv");
  if (!distCsv) {
    report.notes.push("districts.csv missing — skipped districts.");
  } else {
    const districtByCode = new Map<string, { id: string; divisionCode: string }>();
    const dryRunUpazilaByKey = new Map<string, string>();

    await refreshDistrictCache();
    const dryRunDistrictHits = DRY_RUN
      ? await prisma.district.findMany({
          select: { id: true, slug: true, divisionId: true, code: true, nameEn: true },
        })
      : [];

    for (const row of bodyRows(distCsv)) {
      const divCodeRaw = nonempty(row[0]);
      const distCodeRaw = nonempty(row[1]);
      const divCode = divCodeRaw ? normalizeLocationCode(divCodeRaw) : null;
      const distCodeNorm = distCodeRaw ? normalizeLocationCode(distCodeRaw) : null;
      const nameEn = nonempty(row[2]);
      const nameBn = nonempty(row[3]);
      const latN = parseNullableNumber(row[4]);
      const lngN = parseNullableNumber(row[5]);
      if (latN.invalid || lngN.invalid) {
        report.summary.invalidCoordinate += 1;
      }
      let latNumD = latN.n;
      let lngNumD = lngN.n;
      if (latNumD != null && !validateLatitude(latNumD)) {
        report.summary.invalidCoordinate += 1;
        latNumD = null;
      }
      if (lngNumD != null && !validateLongitude(lngNumD)) {
        report.summary.invalidCoordinate += 1;
        lngNumD = null;
      }
      const lat = toDecimal(latNumD);
      const lng = toDecimal(lngNumD);
      const source = nonempty(row[6]);
      const isVerified = parseBool(row[7]);

      if (!divCode || !distCodeNorm || !nameEn) {
        report.districts.invalid += 1;
        continue;
      }
      const div = divisionByCode.get(divCode);
      if (!div) {
        report.summary.missingParent += 1;
        report.districts.invalid += 1;
        continue;
      }

      const displayEn = nameEn;

      const existing =
        isDryRunVirtualLocationId(div.id)
          ? null
          : DRY_RUN
            ? distCodeNorm
              ? (dryRunDistrictHits.find(
                  (r) =>
                    r.divisionId === div.id &&
                    normalizeLocationCode(r.code) === distCodeNorm,
                ) ?? null)
              : (dryRunDistrictHits.find(
                  (r) =>
                    r.divisionId === div.id &&
                    r.nameEn &&
                    normalizeLocationName(r.nameEn).toLowerCase() ===
                      normalizeLocationName(displayEn).toLowerCase(),
                ) ?? null)
            : distCodeNorm
              ? (districtCache.find(
                  (r) =>
                    r.divisionId === div.id &&
                    normalizeLocationCode(r.code) === distCodeNorm,
                ) ?? null)
              : (districtCache.find(
                  (r) =>
                    r.divisionId === div.id &&
                    r.nameEn &&
                    normalizeLocationName(r.nameEn).toLowerCase() ===
                      normalizeLocationName(displayEn).toLowerCase(),
                ) ?? null);

      const slug =
        existing?.slug ??
        (await uniqueSlug(
          "district",
          `${slugifyGeoLabel(displayEn) || "district"}-district`,
        ));

      if (!DRY_RUN) {
        if (existing) {
          await prisma.district.update({
            where: { id: existing.id },
            data: {
              name: displayEn,
              nameEn: displayEn,
              nameBn: nameBn,
              code: distCodeNorm,
              latitude: lat,
              longitude: lng,
              source,
              isVerified,
              isActive: true,
            },
          });
          report.districts.updated += 1;
        } else {
          await prisma.district.create({
            data: {
              divisionId: div.id,
              slug,
              name: displayEn,
              nameEn: displayEn,
              nameBn: nameBn,
              code: distCodeNorm,
              latitude: lat,
              longitude: lng,
              source,
              isVerified,
              isActive: true,
              sortOrder: 0,
            },
          });
          report.districts.imported += 1;
        }
      } else {
        if (existing) report.districts.updated += 1;
        else report.districts.imported += 1;
      }

      if (!DRY_RUN) {
        await refreshDistrictCache();
      }

      const persistedDist =
        DRY_RUN && isDryRunVirtualLocationId(div.id)
          ? { id: dryRunVirtualDistrictId(divCode, distCodeNorm) }
          : distCodeNorm
            ? (DRY_RUN
                ? dryRunDistrictHits.find(
                    (r) =>
                      r.divisionId === div.id &&
                      normalizeLocationCode(r.code) === distCodeNorm,
                  )
                : districtCache.find(
                    (r) =>
                      r.divisionId === div.id &&
                      normalizeLocationCode(r.code) === distCodeNorm,
                  )) ?? null
            : null;
      if (persistedDist) {
        districtByCode.set(distCodeNorm, {
          id: persistedDist.id,
          divisionCode: divCode,
        });
      }
    }

    const upCsv = readCsv("upazilas.csv");
    if (!upCsv) {
      report.notes.push("upazilas.csv missing — skipped upazilas.");
    } else {
      await refreshUpazilaCache();
      const dryRunUpazilaHits = DRY_RUN
        ? await prisma.upazila.findMany({
            select: { id: true, slug: true, districtId: true, code: true, nameEn: true },
          })
        : [];

      for (const row of bodyRows(upCsv)) {
        const distCodeRawUp = nonempty(row[0]);
        const upCodeRaw = nonempty(row[1]);
        const distCodeKey = distCodeRawUp ? normalizeLocationCode(distCodeRawUp) : null;
        const upCodeNorm = upCodeRaw ? normalizeLocationCode(upCodeRaw) : null;
        const nameEn = nonempty(row[2]);
        const nameBn = nonempty(row[3]);
        const latNu = parseNullableNumber(row[4]);
        const lngNu = parseNullableNumber(row[5]);
        if (latNu.invalid || lngNu.invalid) {
          report.summary.invalidCoordinate += 1;
        }
        let latNumU = latNu.n;
        let lngNumU = lngNu.n;
        if (latNumU != null && !validateLatitude(latNumU)) {
          report.summary.invalidCoordinate += 1;
          latNumU = null;
        }
        if (lngNumU != null && !validateLongitude(lngNumU)) {
          report.summary.invalidCoordinate += 1;
          lngNumU = null;
        }
        const lat = toDecimal(latNumU);
        const lng = toDecimal(lngNumU);
        const source = nonempty(row[6]);
        const isVerified = parseBool(row[7]);

        if (!distCodeKey || !upCodeNorm || !nameEn) {
          report.upazilas.invalid += 1;
          continue;
        }
        const dist = districtByCode.get(distCodeKey);
        if (!dist) {
          report.summary.missingParent += 1;
          report.upazilas.invalid += 1;
          continue;
        }

        const displayEn = nameEn;

        const existing =
          isDryRunVirtualLocationId(dist.id)
            ? null
            : DRY_RUN
              ? (dryRunUpazilaHits.find(
                  (r) =>
                    r.districtId === dist.id &&
                    normalizeLocationCode(r.code) === upCodeNorm,
                ) ?? null)
              : (upazilaCache.find(
                  (r) =>
                    r.districtId === dist.id &&
                    normalizeLocationCode(r.code) === upCodeNorm,
                ) ?? null);

        const slug =
          existing?.slug ??
          (await uniqueSlug(
            "upazila",
            `${slugifyGeoLabel(displayEn) || "upazila"}-upazila`,
          ));

        if (!DRY_RUN) {
          if (existing) {
            await prisma.upazila.update({
              where: { id: existing.id },
              data: {
                name: displayEn,
                nameEn: displayEn,
                nameBn: nameBn,
                code: upCodeNorm,
                latitude: lat,
                longitude: lng,
                source,
                isVerified,
                isActive: true,
              },
            });
            report.upazilas.updated += 1;
          } else {
            await prisma.upazila.create({
              data: {
                districtId: dist.id,
                slug,
                name: displayEn,
                nameEn: displayEn,
                nameBn: nameBn,
                code: upCodeNorm,
                latitude: lat,
                longitude: lng,
                source,
                isVerified,
                isActive: true,
                sortOrder: 0,
              },
            });
            report.upazilas.imported += 1;
          }
        } else {
          if (existing) report.upazilas.updated += 1;
          else report.upazilas.imported += 1;
        }

        if (!DRY_RUN) {
          await refreshUpazilaCache();
        }

        if (DRY_RUN && isDryRunVirtualLocationId(dist.id)) {
          dryRunUpazilaByKey.set(
            `${normalizeLocationCode(dist.divisionCode)}|${distCodeKey}|${upCodeNorm}`,
            dryRunVirtualUpazilaId(dist.divisionCode, distCodeKey, upCodeNorm),
          );
        }
      }

      const unCsv = readCsv("unions.csv");
      if (!unCsv) {
        report.notes.push("unions.csv missing — union import skipped.");
      } else if (bodyRows(unCsv).length === 0) {
        report.notes.push(
          "unions.csv has no data rows (header-only or empty) — union import skipped until official rows are added.",
        );
      } else {
        const header = unCsv[0]?.join(",") ?? "";
        const hierarchy = isHierarchyUnionHeader(header);

        for (const row of bodyRows(unCsv)) {
          let upazilaId: string | null = null;
          let v:
            | ReturnType<typeof validateUnionCsvHierarchyRow>
            | null = null;

          if (hierarchy) {
            v = validateUnionCsvHierarchyRow(row);
            if (!v.ok) {
              if (v.errors.some((e) => e.includes("lat") || e.includes("lng"))) {
                report.summary.invalidCoordinate += 1;
              }
              report.unions.invalid += 1;
              continue;
            }
            const dvc = v.divisionCode!;
            const dsc = v.districtCode!;
            const upc = v.upazilaCode!;
            upazilaId = await resolveUpazilaId(
              divisionByCode,
              dvc,
              dsc,
              upc,
              DRY_RUN ? dryRunUpazilaByKey : undefined,
            );
            if (!upazilaId) {
              report.summary.missingParent += 1;
              report.unions.invalid += 1;
              continue;
            }
          } else {
            const upCode = nonempty(row[0]);
            const unionCode = nonempty(row[1]);
            const nameEn = nonempty(row[2]);
            const nameBn = nonempty(row[3]);
            const latP = parseNullableNumber(row[4]);
            const lngP = parseNullableNumber(row[5]);
            const source = nonempty(row[6]);
            const isVerified = parseBool(row[7]);
            if (!upCode || !unionCode || (!nameEn && !nameBn)) {
              report.unions.invalid += 1;
              continue;
            }
            if (latP.invalid || lngP.invalid) {
              report.summary.invalidCoordinate += 1;
              report.unions.invalid += 1;
              continue;
            }
            let latNum = latP.n;
            let lngNum = lngP.n;
            if (latNum != null && !validateLatitude(latNum)) {
              report.summary.invalidCoordinate += 1;
              latNum = null;
            }
            if (lngNum != null && !validateLongitude(lngNum)) {
              report.summary.invalidCoordinate += 1;
              lngNum = null;
            }
            const upNorm = normalizeLocationCode(upCode);
            const upsList = DRY_RUN
              ? await prisma.upazila.findMany({
                  where: { isActive: true },
                  select: { id: true, code: true },
                })
              : upazilaCache;
            const ups = upsList
              .filter((u) => normalizeLocationCode(u.code) === upNorm)
              .slice(0, 2)
              .map((u) => ({ id: u.id }));
            if (ups.length !== 1) {
              report.unions.duplicateWarnings += 1;
              if (ups.length === 0) {
                report.summary.missingParent += 1;
                report.unions.invalid += 1;
                continue;
              }
              if (ups.length > 1) {
                report.notes.push(
                  `legacy unions.csv: multiple upazilas with code ${upCode} — using first match`,
                );
              }
            }
            upazilaId = ups[0]!.id;
            v = {
              ok: true,
              errors: [],
              divisionCode: null,
              districtCode: null,
              upazilaCode: upCode,
              unionCode,
              nameEn,
              nameBn,
              lat: latNum,
              lng: lngNum,
              source,
              isVerified: source ? isVerified : false,
            };
            if (!source) {
              report.notes.push(
                "legacy union row without source — isVerified forced false",
              );
            }
          }

          const unionCode = v!.unionCode!;
          const unionCodeNorm = normalizeLocationCode(unionCode);
          const nameEn = v!.nameEn;
          const nameBn = v!.nameBn;
          const displayEn = nameEn ?? nameBn ?? "Union";
          const lat = toDecimal(v!.lat);
          const lng = toDecimal(v!.lng);
          const source = v!.source;
          const isVerified = v!.source ? v!.isVerified : false;

          const skipUnionDbLookups = DRY_RUN && isDryRunVirtualLocationId(upazilaId!);

          const unionCandidates = skipUnionDbLookups
            ? []
            : await prisma.union.findMany({
                where: { upazilaId: upazilaId!, isActive: true },
                select: { id: true, slug: true, code: true, nameEn: true, nameBn: true },
              });

          if (unionCodeNorm && !skipUnionDbLookups) {
            const dupUnions = unionCandidates.filter(
              (u) => normalizeLocationCode(u.code) === unionCodeNorm,
            );
            if (dupUnions.length > 1) {
              report.unions.duplicateWarnings += 1;
            }
          }

          const existing = skipUnionDbLookups
            ? null
            : unionCodeNorm
              ? (unionCandidates.find(
                  (u) => normalizeLocationCode(u.code) === unionCodeNorm,
                ) ?? null)
              : (unionCandidates.find((u) => {
                  if (
                    nameEn &&
                    u.nameEn &&
                    normalizeLocationName(u.nameEn).toLowerCase() ===
                      normalizeLocationName(nameEn).toLowerCase()
                  ) {
                    return true;
                  }
                  if (
                    nameBn &&
                    u.nameBn &&
                    normalizeLocationName(u.nameBn).toLowerCase() ===
                      normalizeLocationName(nameBn).toLowerCase()
                  ) {
                    return true;
                  }
                  return false;
                }) ?? null);

          const slug =
            existing?.slug ??
            (await uniqueSlug(
              "union",
              `${slugifyGeoLabel(displayEn) || "union"}-union`,
            ));

          if (!DRY_RUN) {
            if (existing) {
              await prisma.union.update({
                where: { id: existing.id },
                data: {
                  name: displayEn,
                  nameEn: nameEn,
                  nameBn: nameBn,
                  code: unionCodeNorm,
                  latitude: lat,
                  longitude: lng,
                  source,
                  isVerified,
                  isActive: true,
                },
              });
              report.unions.updated += 1;
            } else {
              await prisma.union.create({
                data: {
                  upazilaId: upazilaId!,
                  slug,
                  name: displayEn,
                  nameEn: nameEn,
                  nameBn: nameBn,
                  code: unionCodeNorm,
                  latitude: lat,
                  longitude: lng,
                  source,
                  isVerified,
                  isActive: true,
                  sortOrder: 0,
                },
              });
              report.unions.imported += 1;
            }
          } else {
            if (existing) report.unions.updated += 1;
            else report.unions.imported += 1;
          }
        }
      }

      const vilCsv = readCsv("villages.csv");
      if (!vilCsv) {
        report.notes.push("villages.csv missing — village import skipped.");
      } else if (bodyRows(vilCsv).length === 0) {
        report.notes.push(
          "villages.csv has no data rows (header-only or empty) — village import skipped until official rows are added.",
        );
      } else {
        const vheader = vilCsv[0]?.join(",") ?? "";
        if (!vheader.toLowerCase().includes("village_code")) {
          report.notes.push("villages.csv: expected village_code column — check README.");
        }

        for (const row of bodyRows(vilCsv)) {
          const chk = validateLocationCsvRow(row);
          if (!chk.ok) {
            if (chk.errors.some((e) => e.includes("lat") || e.includes("lng"))) {
              report.summary.invalidCoordinate += 1;
            }
            report.villages.invalid += 1;
            continue;
          }

          const upazilaId = await resolveUpazilaId(
            divisionByCode,
            chk.divisionCode!,
            chk.districtCode!,
            chk.upazilaCode!,
            DRY_RUN ? dryRunUpazilaByKey : undefined,
          );
          if (!upazilaId) {
            report.summary.missingParent += 1;
            report.villages.invalid += 1;
            continue;
          }

          const unionCodeV = normalizeLocationCode(chk.unionCode!);
          const unionsForUp = await prisma.union.findMany({
            where: { upazilaId, isActive: true },
            select: { id: true, slug: true, code: true },
          });
          const unionRow = unionsForUp.find(
            (u) => normalizeLocationCode(u.code) === unionCodeV,
          );

          if (!unionRow) {
            report.summary.missingParent += 1;
            report.villages.invalid += 1;
            continue;
          }

          const displayBn = chk.nameBn!;
          const displayEn = chk.nameEn ?? displayBn;
          const villageCodeRaw = chk.villageCode;
          const villageCodeNorm = villageCodeRaw ? normalizeLocationCode(villageCodeRaw) : null;
          const lat = toDecimal(chk.lat);
          const lng = toDecimal(chk.lng);

          if (villageCodeNorm) {
            const dupV = await prisma.village.findMany({
              where: {
                unionId: unionRow.id,
                code: villageCodeNorm,
              },
              select: { id: true },
              take: 2,
            });
            if (dupV.length > 1) {
              report.villages.duplicateWarnings += 1;
            }
          } else {
            const dupV = await prisma.village.findMany({
              where: {
                unionId: unionRow.id,
                nameBn: { equals: displayBn, mode: "insensitive" },
              },
              select: { id: true },
              take: 2,
            });
            if (dupV.length > 1) {
              report.villages.duplicateWarnings += 1;
            }
          }

          const existing = villageCodeNorm
            ? await prisma.village.findFirst({
                where: { unionId: unionRow.id, code: villageCodeNorm },
                select: { id: true, slug: true },
              })
            : await prisma.village.findFirst({
                where: {
                  unionId: unionRow.id,
                  nameBn: { equals: displayBn, mode: "insensitive" },
                },
                select: { id: true, slug: true },
              });

          const slug =
            existing?.slug ??
            (await uniqueSlug(
              "village",
              `${slugifyGeoLabel(displayEn) || "village"}-village`,
            ));

          if (!DRY_RUN) {
            if (existing) {
              await prisma.village.update({
                where: { id: existing.id },
                data: {
                  name: displayBn,
                  nameBn: displayBn,
                  nameEn: chk.nameEn,
                  code: villageCodeNorm,
                  latitude: lat,
                  longitude: lng,
                  source: chk.source,
                  isVerified: chk.source ? chk.isVerified : false,
                  isActive: true,
                },
              });
              report.villages.updated += 1;
            } else {
              await prisma.village.create({
                data: {
                  unionId: unionRow.id,
                  slug,
                  name: displayBn,
                  nameBn: displayBn,
                  nameEn: chk.nameEn,
                  code: villageCodeNorm,
                  latitude: lat,
                  longitude: lng,
                  source: chk.source,
                  isVerified: chk.source ? chk.isVerified : false,
                  isActive: true,
                },
              });
              report.villages.imported += 1;
            }
          } else {
            if (existing) report.villages.updated += 1;
            else report.villages.imported += 1;
          }
        }
      }
    }
  }

  report.summary.duplicateWarningsTotal =
    report.unions.duplicateWarnings + report.villages.duplicateWarnings;

  const [mcDiv, mcDist, mcUp, mcUn, mcVil, pendDiv, pendDist, pendUp, pendUn, pendVil] =
    await Promise.all([
      prisma.division.count({
        where: { isActive: true, OR: [{ latitude: null }, { longitude: null }] },
      }),
      prisma.district.count({
        where: { isActive: true, OR: [{ latitude: null }, { longitude: null }] },
      }),
      prisma.upazila.count({
        where: { isActive: true, OR: [{ latitude: null }, { longitude: null }] },
      }),
      prisma.union.count({
        where: { isActive: true, OR: [{ latitude: null }, { longitude: null }] },
      }),
      prisma.village.count({
        where: { isActive: true, OR: [{ latitude: null }, { longitude: null }] },
      }),
      prisma.division.count({ where: { isActive: true, isVerified: false } }),
      prisma.district.count({ where: { isActive: true, isVerified: false } }),
      prisma.upazila.count({ where: { isActive: true, isVerified: false } }),
      prisma.union.count({ where: { isActive: true, isVerified: false } }),
      prisma.village.count({ where: { isActive: true, isVerified: false } }),
    ]);
  report.summary.missingCoordinatesInDb =
    mcDiv + mcDist + mcUp + mcUn + mcVil;
  report.summary.pendingVerificationApprox =
    pendDiv + pendDist + pendUp + pendUn + pendVil;

  writeReport(report);
  console.log(JSON.stringify(report, null, 2));
}

function parseNullableNumber(
  raw: string | undefined,
): { n: number | null; invalid: boolean } {
  const t = (raw ?? "").trim();
  if (!t) return { n: null, invalid: false };
  const n = Number(t);
  if (!Number.isFinite(n)) return { n: null, invalid: true };
  return { n, invalid: false };
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
