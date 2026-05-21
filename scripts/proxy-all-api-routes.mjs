// Replace src/app/api route handlers with backend proxies (preserves HTTP methods).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const API_ROOT = join(ROOT, 'src', 'app', 'api');

const SKIP = new Set([
  'health/route.ts',
  'mobile/health/route.ts',
  'admin/health/route.ts',
]);

const METHOD_RE = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS)\b/g;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name === 'route.ts') files.push(full);
  }
  return files;
}

function generateProxy(methods) {
  const lines = [
    '/** Auto-proxy to pranidoctor-backend — do not add Prisma here. */',
    'import { proxyRouteToBackend } from "@/lib/proxy-to-backend";',
    '',
  ];
  for (const m of methods) {
    lines.push(`export const ${m} = (request: Request) => proxyRouteToBackend(request);`);
  }
  lines.push('');
  return lines.join('\n');
}

let count = 0;
for (const file of walk(API_ROOT)) {
  const rel = relative(API_ROOT, file).replace(/\\/g, '/');
  if (SKIP.has(rel)) continue;

  const src = readFileSync(file, 'utf8');
  const methods = [...src.matchAll(METHOD_RE)].map((m) => m[1]);
  const unique = [...new Set(methods)];
  if (unique.length === 0) continue;

  writeFileSync(file, generateProxy(unique), 'utf8');
  count += 1;
}

console.log(`Proxied ${count} route.ts files (skipped ${SKIP.size} health routes).`);
