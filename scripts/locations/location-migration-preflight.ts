/**
 * Read-only duplicate counts matching
 * `20260511133000_location_dedupe_unique_constraints` pre-flight DO block.
 *
 * Usage: npm run locations:migration:preflight
 * Exit code: 0 only if all counts are 0 (safe to create partial unique indexes).
 */
import "dotenv/config";

import { prisma } from "@/lib/prisma";

type CountRow = { n: bigint };

async function main(): Promise<void> {
  const [divisions, districts, upazilas, unions, villages] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT trim(both from "code") AS c
        FROM "Division"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1
        HAVING count(*) > 1
      ) t`,
    prisma.$queryRaw<CountRow[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT "divisionId", trim(both from "code") AS c
        FROM "District"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1, 2
        HAVING count(*) > 1
      ) t`,
    prisma.$queryRaw<CountRow[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT "districtId", trim(both from "code") AS c
        FROM "Upazila"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1, 2
        HAVING count(*) > 1
      ) t`,
    prisma.$queryRaw<CountRow[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT "upazilaId", trim(both from "code") AS c
        FROM "Union"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1, 2
        HAVING count(*) > 1
      ) t`,
    prisma.$queryRaw<CountRow[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT "unionId", trim(both from "code") AS c
        FROM "Village"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1, 2
        HAVING count(*) > 1
      ) t`,
  ]);

  const d = Number(divisions[0]?.n ?? 0);
  const di = Number(districts[0]?.n ?? 0);
  const u = Number(upazilas[0]?.n ?? 0);
  const un = Number(unions[0]?.n ?? 0);
  const v = Number(villages[0]?.n ?? 0);
  const sum = d + di + u + un + v;

  console.log("[locations:migration:preflight] Duplicate trimmed-code groups:");
  console.log(`  divisions : ${d}`);
  console.log(`  districts : ${di}`);
  console.log(`  upazilas  : ${u}`);
  console.log(`  unions    : ${un}`);
  console.log(`  villages  : ${v}`);
  console.log(`  total bad groups: ${sum}`);

  if (sum > 0) {
    console.error(
      "\nFAIL: Fix duplicates before unique indexes (see docs/prisma-migration-repair-20260511.md).",
    );
    console.error("  npm run locations:duplicates");
    console.error("  npm run locations:dedupe:dry-run");
    console.error("  npm run locations:dedupe:apply   # after backup + review\n");
    process.exit(1);
  }
  console.log("\nOK: No duplicate trimmed-code groups under the migration rules.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
