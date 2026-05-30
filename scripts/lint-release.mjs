#!/usr/bin/env node
/**
 * Release lint gate — admin scope + git-changed files only (never full repo).
 *
 * Usage:
 *   npm run lint:release
 *   node scripts/lint-release.mjs --admin-only
 *   node scripts/lint-release.mjs --changed-only
 */
import { execSync, spawnSync } from "node:child_process";
import { existsSync, globSync } from "node:fs";
import path from "node:path";

const LINTABLE = /\.(cjs|mjs|js|jsx|ts|tsx)$/;

/** Admin panel release surface (routes, API proxy, shared admin libs). */
const ADMIN_RELEASE_GLOBS = [
  "src/app/admin/**/*.{ts,tsx}",
  "src/app/enterprise/**/*.{ts,tsx}",
  "src/app/api/admin/**/*.{ts,tsx}",
  "src/components/admin/**/*.{ts,tsx}",
  "src/components/admin-ui/**/*.{ts,tsx}",
  "src/components/enterprise/**/*.{ts,tsx}",
  "src/lib/admin/**/*.{ts,tsx}",
  "src/lib/admin-auth/**/*.{ts,tsx}",
  "src/lib/admin-billing/**/*.{ts,tsx}",
  "src/lib/admin-semen/**/*.{ts,tsx}",
  "src/lib/logging/**/*.{ts,tsx}",
  "src/lib/monitoring/**/*.{ts,tsx}",
  "src/lib/env/production-validation.ts",
  "src/instrumentation.ts",
  "src/instrumentation-client.ts",
  "src/lib/proxy-to-backend.ts",
  "src/middleware.ts",
];

function runGit(args) {
  return execSync(`git ${args.join(" ")}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function getChangedFiles() {
  const event = process.env.GITHUB_EVENT_NAME;
  const baseRef = process.env.GITHUB_BASE_REF;
  let diffRange = "HEAD~1...HEAD";

  if (event === "pull_request" && baseRef) {
    try {
      runGit(["fetch", "origin", baseRef, "--depth=1"]);
    } catch {
      // Best effort for shallow clones.
    }
    diffRange = `origin/${baseRef}...HEAD`;
  }

  try {
    const output = runGit(["diff", "--name-only", "--diff-filter=ACMRTUXB", diffRange]);
    if (!output) return [];
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    const fallback = runGit(["diff", "--name-only", "--diff-filter=ACMRTUXB", "HEAD~1", "HEAD"]);
    if (!fallback) return [];
    return fallback.split(/\r?\n/).filter(Boolean);
  }
}

function listUntrackedLintable() {
  try {
    const output = runGit(["ls-files", "--others", "--exclude-standard"]);
    if (!output) return [];
    return output
      .split(/\r?\n/)
      .filter((file) => file && LINTABLE.test(file) && existsSync(file));
  } catch {
    return [];
  }
}

const args = new Set(process.argv.slice(2));
const adminOnly = args.has("--admin-only");
const changedOnly = args.has("--changed-only");

const changedFiles = [
  ...getChangedFiles(),
  ...listUntrackedLintable(),
]
  .map((file) => file.replace(/\\/g, "/"))
  .filter((file) => LINTABLE.test(file) && existsSync(file));

const eslintTargets = [];
if (!changedOnly) {
  eslintTargets.push(...ADMIN_RELEASE_GLOBS);
}
if (!adminOnly) {
  eslintTargets.push(...changedFiles);
}

const uniqueTargets = [...new Set(eslintTargets)];

function expandLintTargets(targets) {
  const root = process.cwd();
  const files = new Set();

  for (const target of targets) {
    const normalized = target.replace(/\\/g, "/");
    if (normalized.startsWith("src/generated/")) continue;
    if (normalized === "next-env.d.ts") continue;
    if (normalized.includes("*")) {
      for (const match of globSync(normalized, { cwd: root })) {
        const file = match.replace(/\\/g, "/");
        if (file.startsWith("src/generated/")) continue;
        if (LINTABLE.test(file) && existsSync(path.join(root, file))) {
          files.add(file);
        }
      }
      continue;
    }
    if (LINTABLE.test(normalized) && existsSync(path.join(root, normalized))) {
      files.add(normalized);
    }
  }

  return [...files];
}

const lintFiles = expandLintTargets(uniqueTargets);

if (lintFiles.length === 0) {
  console.log("lint-release: no files in release scope — skipping ESLint");
  process.exit(0);
}

console.log(
  `lint-release: ESLint on ${lintFiles.length} file(s) (${adminOnly ? "admin-only" : changedOnly ? "changed-only" : "admin + changed"})`,
);

const eslintEntry = path.join("node_modules", "eslint", "bin", "eslint.js");
const BATCH_SIZE = 40;
let exitCode = 0;

for (let i = 0; i < lintFiles.length; i += BATCH_SIZE) {
  const batch = lintFiles.slice(i, i + BATCH_SIZE);
  const result = spawnSync(
    process.execPath,
    [eslintEntry, "--max-warnings", "0", "--no-warn-ignored", ...batch],
    { stdio: "inherit", shell: false },
  );
  if (result.status !== 0) {
    exitCode = result.status ?? 1;
  }
}

process.exit(exitCode);
