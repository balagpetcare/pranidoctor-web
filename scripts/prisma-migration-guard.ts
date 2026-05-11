/**
 * Preflight for safe `prisma migrate deploy`:
 * - Optional: fail if `prisma/migrations` differs from git HEAD (when `.git` exists).
 * - Fail if `prisma migrate status` reports failed migrations.
 * - Fail if location duplicate trimmed-code groups exist (same checks as failed migration SQL).
 * - Warn when DATABASE_URL suggests non-disposable DB (heuristic).
 *
 * Usage: npm run db:guard
 * Does NOT run migrate deploy.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

import { prisma } from "@/lib/prisma";

const root = process.cwd();

function hasGit(): boolean {
  return fs.existsSync(path.join(root, ".git"));
}

function migrationsDirtyVsHead(): boolean {
  if (!hasGit()) {
    console.warn("[db:guard] No .git directory — skipping git diff on prisma/migrations.");
    return false;
  }
  const r = spawnSync(
    "git diff --quiet HEAD -- prisma/migrations/",
    { cwd: root, shell: true, encoding: "utf8" },
  );
  if (r.status === 0) return false;
  if (r.status === 1) return true;
  console.warn("[db:guard] git diff returned unexpected status — treat as dirty:", r.status);
  return true;
}

function migrateStatusText(): { ok: boolean; stdout: string; stderr: string; code: number | null } {
  const r = spawnSync("npx prisma migrate status", {
    cwd: root,
    shell: true,
    encoding: "utf8",
    env: process.env,
  });
  const stdout = (r.stdout as string) ?? "";
  const stderr = (r.stderr as string) ?? "";
  return { ok: r.status === 0, stdout, stderr, code: r.status };
}

async function duplicatePreflight(): Promise<number> {
  const [divisions, districts, upazilas, unions, villages] = await Promise.all([
    prisma.$queryRaw<{ n: bigint }[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT trim(both from "code") AS c FROM "Division"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1 HAVING count(*) > 1
      ) t`,
    prisma.$queryRaw<{ n: bigint }[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT "divisionId", trim(both from "code") AS c FROM "District"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1, 2 HAVING count(*) > 1
      ) t`,
    prisma.$queryRaw<{ n: bigint }[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT "districtId", trim(both from "code") AS c FROM "Upazila"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1, 2 HAVING count(*) > 1
      ) t`,
    prisma.$queryRaw<{ n: bigint }[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT "upazilaId", trim(both from "code") AS c FROM "Union"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1, 2 HAVING count(*) > 1
      ) t`,
    prisma.$queryRaw<{ n: bigint }[]>`
      SELECT count(*)::bigint AS n FROM (
        SELECT "unionId", trim(both from "code") AS c FROM "Village"
        WHERE "code" IS NOT NULL AND trim(both from "code") <> ''
        GROUP BY 1, 2 HAVING count(*) > 1
      ) t`,
  ]);
  return (
    Number(divisions[0]?.n ?? 0) +
    Number(districts[0]?.n ?? 0) +
    Number(upazilas[0]?.n ?? 0) +
    Number(unions[0]?.n ?? 0) +
    Number(villages[0]?.n ?? 0)
  );
}

function warnIfNonDisposableDb(): void {
  const u = process.env.DATABASE_URL ?? "";
  const lower = u.toLowerCase();
  const looksProd =
    lower.includes("amazonaws.com") ||
    lower.includes("azure.com") ||
    lower.includes("neon.tech") ||
    lower.includes("/production") ||
    lower.includes("prod.");
  if (looksProd || process.env.NODE_ENV === "production") {
    console.warn(
      "\n[db:guard] WARNING: DATABASE_URL or NODE_ENV looks like a non-local database.",
    );
    console.warn(
      "  Never run `npm run db:migrate` (prisma migrate dev) against real user data without a disposable branch DB.",
    );
    console.warn("  Prefer `npm run db:deploy:safe` after backups and review.\n");
  }
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[db:guard] DATABASE_URL is not set.");
    process.exit(1);
  }

  warnIfNonDisposableDb();

  const lifecycle = process.env.npm_lifecycle_event ?? "";
  if (lifecycle === "db:migrate" || process.argv.includes("--warn-migrate-dev")) {
    console.warn(
      "[db:guard] You are using a path that can run `prisma migrate dev`. That can reset drift in dev — never point it at production.",
    );
  }

  if (migrationsDirtyVsHead()) {
    console.error(
      "\n[db:guard] FAIL: `prisma/migrations` differs from git HEAD (tracked files).\n" +
        "  Restore migration files from git before deploy, or commit intentional changes.\n" +
        "  See docs/PRISMA_MIGRATION_RULES.md\n",
    );
    process.exit(1);
  }

  const dupSum = await duplicatePreflight();
  if (dupSum > 0) {
    console.error(
      `\n[db:guard] FAIL: ${dupSum} duplicate trimmed-code group(s) under location tables.\n` +
        "  Run: npm run locations:duplicates\n" +
        "  Then: npm run locations:dedupe:dry-run  →  locations:dedupe:apply (after backup)\n" +
        "  If a migration already failed on duplicates, fix data then use migrate resolve (see repair doc).\n",
    );
    process.exit(1);
  }

  const st = migrateStatusText();
  const combined = `${st.stdout}\n${st.stderr}`;

  if (/Following migration have failed/i.test(combined)) {
    console.error(
      "\n[db:guard] FAIL: Prisma reports failed migration(s).\n" +
        "  Inspect: npm run prisma:migration:failed\n" +
        "  Repair: docs/prisma-migration-repair-20260511.md\n" +
        "  Then: npx prisma migrate resolve --rolled-back \"…\" OR --applied \"…\"\n",
    );
    console.error(combined);
    process.exit(1);
  }

  if (/drift detected/i.test(combined)) {
    console.error(
      "\n[db:guard] FAIL: Prisma reports schema drift.\n" +
        "  Do not run `prisma migrate reset` on databases with important data.\n" +
        "  Follow: docs/prisma-migration-repair-20260511.md (checksum / history repair).\n",
    );
    console.error(combined);
    process.exit(1);
  }

  const pendingOnly =
    !st.ok &&
    /not yet been applied|pending migrations|migrations have not yet been applied/i.test(
      combined,
    );
  if (!st.ok && !pendingOnly) {
    console.error(
      "\n[db:guard] FAIL: `prisma migrate status` exited with an error (not only pending migrations).\n",
    );
    console.error(combined);
    process.exit(1);
  }
  if (!st.ok && pendingOnly) {
    console.warn(
      "\n[db:guard] NOTE: migrations are pending — `npm run db:deploy:safe` will run `prisma migrate deploy` next.\n",
    );
  }

  console.log(
    "[db:guard] OK: migrations clean vs HEAD (if git), location preflight clear, no failed migrations, no drift line.\n",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
