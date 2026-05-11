/**
 * Verifies partial unique indexes from
 * `20260511133000_location_dedupe_unique_constraints` exist in PostgreSQL.
 *
 * Usage: npm run locations:indexes:check
 */
import "dotenv/config";

import { prisma } from "@/lib/prisma";

const EXPECTED = [
  "Division_code_trim_uidx",
  "District_division_code_trim_uidx",
  "Upazila_district_code_trim_uidx",
  "Union_upazila_code_trim_uidx",
  "Village_union_code_trim_uidx",
] as const;

async function main(): Promise<void> {
  const rows = await prisma.$queryRaw<{ indexname: string }[]>`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname IN (
        'Division_code_trim_uidx',
        'District_division_code_trim_uidx',
        'Upazila_district_code_trim_uidx',
        'Union_upazila_code_trim_uidx',
        'Village_union_code_trim_uidx'
      )
  `;
  const found = new Set(rows.map((r) => r.indexname));
  const missing = EXPECTED.filter((n) => !found.has(n));

  console.log("[locations:indexes:check] Expected partial unique indexes:");
  for (const n of EXPECTED) {
    console.log(`  ${found.has(n) ? "✓" : "✗"} ${n}`);
  }

  if (missing.length > 0) {
    console.error(
      `\nMissing ${missing.length} index(es). Migration SQL may not have completed.`,
    );
    process.exit(1);
  }
  console.log("\nOK: All expected location trim-code unique indexes are present.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
