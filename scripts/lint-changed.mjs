#!/usr/bin/env node
import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const LINTABLE = /\.(cjs|mjs|js|jsx|ts|tsx)$/;

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

const changed = getChangedFiles().filter((file) => LINTABLE.test(file) && existsSync(file));

if (changed.length === 0) {
  console.log("lint-changed: no lintable changed files — skipping ESLint");
  process.exit(0);
}

console.log(`lint-changed: linting ${changed.length} file(s)`);

const eslintBin = process.platform === "win32"
  ? "node_modules\\.bin\\eslint.cmd"
  : "node_modules/.bin/eslint";

const result = spawnSync(eslintBin, changed, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
