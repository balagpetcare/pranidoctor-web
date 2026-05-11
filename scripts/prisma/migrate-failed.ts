/**
 * Lists recent `_prisma_migrations` rows and highlights failed / error logs.
 *
 * Usage: npm run prisma:migration:failed
 */
import "dotenv/config";

import { prisma } from "@/lib/prisma";

async function main(): Promise<void> {
  const rows = await prisma.$queryRaw<
    {
      migration_name: string;
      started_at: Date;
      finished_at: Date | null;
      rolled_back_at: Date | null;
      logs: string | null;
    }[]
  >`
    SELECT migration_name, started_at, finished_at, rolled_back_at, logs
    FROM "_prisma_migrations"
    ORDER BY started_at DESC
    LIMIT 40
  `;

  console.log("[prisma:migration:failed] Recent _prisma_migrations (newest first):\n");
  for (const r of rows) {
    const hasLog = r.logs != null && String(r.logs).trim().length > 0;
    const flag =
      hasLog && /error|failed|exception/i.test(String(r.logs))
        ? " [LOG MAY INDICATE FAILURE]"
        : r.finished_at == null && r.rolled_back_at == null
          ? " [NO finished_at — investigate]"
          : "";
    console.log(`— ${r.migration_name}${flag}`);
    console.log(`    started: ${r.started_at?.toISOString?.() ?? r.started_at}`);
    console.log(`    finished: ${r.finished_at ?? "(null)"}`);
    console.log(`    rolled_back: ${r.rolled_back_at ?? "(null)"}`);
    if (hasLog) {
      const snippet = String(r.logs).slice(0, 500);
      console.log(`    logs: ${snippet}${String(r.logs).length > 500 ? "…" : ""}`);
    }
    console.log("");
  }

  const target = rows.find(
    (r) => r.migration_name === "20260511133000_location_dedupe_unique_constraints",
  );
  if (target) {
    console.log("— Target migration row (location_dedupe_unique_constraints):");
    console.log(JSON.stringify(target, null, 2));
  } else {
    console.log(
      "(No row named 20260511133000_location_dedupe_unique_constraints in last 40 — widen LIMIT in script if needed.)",
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
