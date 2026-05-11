/**
 * Phase 1 — Timestamped backup for nuhil location rebuild.
 * Folder: backups/location-rebuild-nuhil-YYYYMMDD-HHMMSS/
 *
 * Copies: data/locations CSVs + raw/normalized/mappings/reports, prisma/schema.prisma,
 * package.json, full docs/. Tries pg_dump; documents Docker fallback in BACKUP_STATUS.md.
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const DATA_LOC = path.join(ROOT, "data", "locations");

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function copyFile(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function main(): void {
  const ts = stamp();
  const outDir = path.join(ROOT, "backups", `location-rebuild-nuhil-${ts}`);
  fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(DATA_LOC)) {
    for (const name of fs.readdirSync(DATA_LOC)) {
      const fp = path.join(DATA_LOC, name);
      const st = fs.statSync(fp);
      if (st.isDirectory()) {
        if (["raw", "normalized", "mappings", "reports"].includes(name)) {
          copyDir(fp, path.join(outDir, "data", "locations", name));
        }
      } else if (name.endsWith(".csv")) {
        copyFile(fp, path.join(outDir, "data", "locations", name));
      }
    }
  }

  copyFile(path.join(ROOT, "prisma", "schema.prisma"), path.join(outDir, "prisma", "schema.prisma"));
  copyFile(path.join(ROOT, "package.json"), path.join(outDir, "package.json"));
  copyDir(path.join(ROOT, "docs"), path.join(outDir, "docs"));

  const status: string[] = [];
  status.push(`# Backup snapshot — nuhil location rebuild (${ts})`);
  status.push("");
  status.push(`- **Snapshot directory:** \`${outDir.replace(/\\/g, "/")}\``);
  status.push(
    "- **Included:** `data/locations/*.csv`, `raw/`, `normalized/`, `mappings/`, `reports/`, `prisma/schema.prisma`, `package.json`, `docs/`",
  );
  status.push("");

  const sqlName = `pranidoctor_location_rebuild_nuhil_${ts}.sql`;
  const sqlOut = path.join(ROOT, "backups", sqlName);
  let dbDumpOk = false;
  const url = (process.env.DATABASE_URL ?? "").trim();

  const where = spawnSync(process.platform === "win32" ? "where" : "which", ["pg_dump"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const pgDump = where.status === 0 ? (where.stdout ?? "").split(/\r?\n/)[0]!.trim() : "";

  if (pgDump && url) {
    const r = spawnSync(pgDump, ["-f", sqlOut, "--dbname", url, "--no-owner"], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
    if (r.status === 0 && fs.existsSync(sqlOut) && fs.statSync(sqlOut).size > 0) {
      dbDumpOk = true;
      status.push(`- **pg_dump:** OK → \`${sqlOut.replace(/\\/g, "/")}\``);
    } else {
      status.push(`- **pg_dump:** failed — ${(r.stderr ?? r.stdout ?? "").slice(0, 800)}`);
    }
  } else {
    if (!pgDump) status.push("- **pg_dump:** not found on PATH.");
    if (!url) status.push("- **DATABASE_URL:** empty — skipped SQL dump.");
  }

  status.push("");
  status.push("## PostgreSQL via Docker (local compose)");
  status.push("");
  status.push("Service: `db`, container name: **`pranidoctor-postgres`**, database: **`pranidoctor_db`**, user: **`postgres`**.");
  status.push("");
  status.push("Dump to a file inside the container, then copy to the host:");
  status.push("");
  status.push("```bash");
  status.push(
    "docker exec pranidoctor-postgres pg_dump -U postgres -d pranidoctor_db --no-owner -f /tmp/pranidoctor-pre-nuhil.sql",
  );
  status.push(
    "docker cp pranidoctor-postgres:/tmp/pranidoctor-pre-nuhil.sql ./backups/pranidoctor-pre-nuhil-manual.sql",
  );
  status.push("```");
  status.push("");

  if (!dbDumpOk) {
    status.push("## Warning");
    status.push("");
    status.push(
      "Automated `pg_dump` did not produce a SQL file. Take a manual dump (host `pg_dump` or Docker above) before **clear** or destructive imports.",
    );
    status.push("");
  }

  status.push("CSV and docs snapshots are independent of SQL dumps.");

  fs.writeFileSync(path.join(outDir, "BACKUP_STATUS.md"), `${status.join("\n")}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        snapshotDir: outDir,
        databaseSqlDump: dbDumpOk ? sqlOut : null,
        backupStatusMd: path.join(outDir, "BACKUP_STATUS.md"),
      },
      null,
      2,
    ),
  );
}

main();
