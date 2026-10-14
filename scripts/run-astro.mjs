#!/usr/bin/env node
/**
 * Always patch Vite, then run the local Astro CLI (not a global `astro`).
 * Usage: node scripts/run-astro.mjs dev|build|preview
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mode = process.argv[2] || 'dev';

const patch = spawnSync(process.execPath, [join(root, 'scripts/patch-vite-container.mjs')], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
if (patch.status !== 0) process.exit(patch.status ?? 1);

const astroBin = join(root, 'node_modules/astro/bin/astro.mjs');
if (!existsSync(astroBin)) {
  console.error('[design-studio] Astro not installed:', astroBin);
  process.exit(1);
}

const args = [astroBin];
if (mode === 'build') args.push('build');
else if (mode === 'preview') args.push('preview');
else if (mode === 'dev') args.push('dev');
else {
  console.error('[design-studio] Unknown mode:', mode, '(use dev, build, or preview)');
  process.exit(1);
}

const run = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env: process.env });
process.exit(run.status ?? 0);
