import * as fs from "node:fs";
import * as path from "node:path";

function esc(s: string): string {
  const t = s.replace(/"/g, '""');
  if (/[",\r\n]/.test(t)) return `"${t}"`;
  return t;
}

export function rowToLine(cells: string[]): string {
  return cells.map(esc).join(",");
}

export function writeCsvFile(filePath: string, header: string[], rows: string[][]): void {
  const lines = [rowToLine(header), ...rows.map(rowToLine)];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}
