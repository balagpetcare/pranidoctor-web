import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SRC_LIB = join(ROOT, 'src', 'lib');
const ARCHIVE = join(ROOT, 'archive', 'web-deprecated', 'src', 'lib');

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith('.ts')) files.push(full);
  }
  return files;
}

const TYPE_RE = /^export type (\w+)/gm;

let fixed = 0;
for (const shim of walk(SRC_LIB)) {
  const text = readFileSync(shim, 'utf8');
  if (!text.includes('archive/web-deprecated')) continue;

  const rel = relative(SRC_LIB, shim).replace(/\\/g, '/');
  const archived = join(ARCHIVE, rel);
  const src = readFileSync(archived, 'utf8');
  const names = [...new Set([...src.matchAll(TYPE_RE)].map((m) => m[1]))];

  const lines = [
    '/** Implementation archived — DB via pranidoctor-backend. */',
    ...names.map((n) => `export type ${n} = Record<string, unknown>;`),
    '',
  ];
  if (names.length === 0) {
    lines.splice(1, 0, 'export type ArchivedModule = Record<string, unknown>;');
  }
  writeFileSync(shim, lines.join('\n'), 'utf8');
  fixed += 1;
}

console.log(`Fixed ${fixed} type shim files.`);
