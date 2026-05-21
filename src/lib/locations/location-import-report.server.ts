import "server-only";

import * as fs from "node:fs";
import * as path from "node:path";

/** Reads local import report JSON (filesystem only — not DB). */
export function readLocationImportReport(): unknown | null {
  const reportPath = path.join(process.cwd(), "data", "location-import-report.json");
  if (!fs.existsSync(reportPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf8")) as unknown;
  } catch {
    return null;
  }
}
