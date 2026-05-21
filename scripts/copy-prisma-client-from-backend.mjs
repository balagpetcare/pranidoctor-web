/**
 * Sync generated Prisma client from canonical backend (no local schema required).
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const backendGenerated = join(root, '..', 'pranidoctor-backend', 'src', 'generated', 'prisma');
const webGenerated = join(root, 'src', 'generated', 'prisma');

if (!existsSync(backendGenerated)) {
  console.error('Missing backend client. Run in pranidoctor-backend: npm run db:generate');
  process.exit(1);
}

if (existsSync(webGenerated)) {
  rmSync(webGenerated, { recursive: true, force: true });
}
mkdirSync(join(root, 'src', 'generated'), { recursive: true });
cpSync(backendGenerated, webGenerated, { recursive: true });

const browserShim = `/**
 * Browser + server enum/types shim (legacy @/generated/prisma/browser imports).
 */
export * from "./index.js";
export type * from "./index.js";
`;
import { writeFileSync } from 'node:fs';
writeFileSync(join(webGenerated, 'browser.ts'), browserShim, 'utf8');

console.log('Copied Prisma client: backend -> web/src/generated/prisma (+ browser.ts shim)');
