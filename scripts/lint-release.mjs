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
import { existsSync } from "node:fs";
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

if (uniqueTargets.length === 0) {
  console.log("lint-release: no files in release scope — skipping ESLint");
  process.exit(0);
}

console.log(
  `lint-release: ESLint on ${uniqueTargets.length} target(s) (${adminOnly ? "admin-only" : changedOnly ? "changed-only" : "admin + changed"})`,
);

const eslintBin =
  process.platform === "win32"
    ? path.join("node_modules", ".bin", "eslint.cmd")
    : path.join("node_modules", ".bin", "eslint");

const result = spawnSync(eslintBin, ["--max-warnings", "0", ...uniqueTargets], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
