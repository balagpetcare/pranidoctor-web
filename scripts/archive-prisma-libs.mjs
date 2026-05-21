// Move prisma-backed lib modules to archive/web-deprecated; leave type-only re-exports in src.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, unlinkSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SRC_LIB = join(ROOT, 'src', 'lib');
const ARCHIVE = join(ROOT, 'archive', 'web-deprecated', 'src', 'lib');

const KEEP = new Set([
  'prisma.ts',
  'proxy-to-backend.ts',
  'server-internal.ts',
  'api-client.ts',
  'admin-auth/panel-access.ts',
  'doctor-auth/panel-access.ts',
  'technician-auth/panel-access.ts',
  'locations/location-master-admin-client.ts',
  'admin-semen/templates-service.ts',
]);

const PRISMA_RE = /from\s+["']@\/lib\/prisma["']/;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith('.ts') && !name.endsWith('.test.ts')) files.push(full);
  }
  return files;
}

let moved = 0;
for (const file of walk(SRC_LIB)) {
  const rel = relative(SRC_LIB, file).replace(/\\/g, '/');
  if (KEEP.has(rel)) continue;
  const src = readFileSync(file, 'utf8');
  if (!PRISMA_RE.test(src)) continue;

  const dest = join(ARCHIVE, rel);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(file, dest);
  unlinkSync(file);

  const archiveImport = `../../../archive/web-deprecated/src/lib/${rel.replace(/\.ts$/, '')}`;
  const shim = [
    '/** Implementation archived — DB via pranidoctor-backend. Types preserved for UI. */',
    `export type * from "${archiveImport}";`,
    '',
  ].join('\n');
  writeFileSync(file, shim, 'utf8');
  moved += 1;
}

console.log(`Archived ${moved} prisma lib modules (type shims left in src/lib).`);
