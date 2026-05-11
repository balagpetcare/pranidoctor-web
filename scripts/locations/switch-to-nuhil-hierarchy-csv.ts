/**
 * Replace divisions/districts/upazilas/unions CSVs with normalized nuhil exports (optional --execute).
 * Never touches villages.csv or the database.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

const DATA = path.join(process.cwd(), "data", "locations");
const NORM = path.join(DATA, "normalized");
const REPORT = path.join(DATA, "reports", "nuhil-hierarchy-switch-report.json");

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function main(): void {
  const execute = process.argv.includes("--execute");
  const ts = stamp();
  const innerBackup = path.join(DATA, "backups", ts);
  const files = [
    ["nuhil-divisions.normalized.csv", "divisions.csv"],
    ["nuhil-districts.normalized.csv", "districts.csv"],
    ["nuhil-upazilas.normalized.csv", "upazilas.csv"],
    ["nuhil-unions.normalized.csv", "unions.csv"],
  ] as const;

  const notes: string[] = [];
  for (const [srcName, destName] of files) {
    const src = path.join(NORM, srcName);
    if (!fs.existsSync(src)) {
      console.error(`Missing ${src}. Run npm run locations:nuhil:normalize-full`);
      process.exit(1);
    }
  }

  fs.mkdirSync(innerBackup, { recursive: true });
  for (const [, destName] of files) {
    const from = path.join(DATA, destName);
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, path.join(innerBackup, destName));
    }
  }
  notes.push(`Backed up current CSVs to ${innerBackup}`);

  if (!execute) {
    notes.push("Dry-run only — no CSV files replaced. Re-run with `--execute` after you accept comparison + migration risks.");
    const report = {
      generatedAt: new Date().toISOString(),
      dryRun: true,
      innerBackupDir: innerBackup,
      wouldReplace: files.map(([s, d]) => ({ from: path.join(NORM, s), to: path.join(DATA, d) })),
      notes,
    };
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  for (const [srcName, destName] of files) {
    fs.copyFileSync(path.join(NORM, srcName), path.join(DATA, destName));
  }
  notes.push("Replaced divisions.csv, districts.csv, upazilas.csv, unions.csv with normalized nuhil exports.");
  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: false,
    innerBackupDir: innerBackup,
    replaced: files.map(([s, d]) => ({ from: path.join(NORM, s), to: path.join(DATA, d) })),
    notes,
  };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main();
