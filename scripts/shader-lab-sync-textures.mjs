#!/usr/bin/env node
// Push Shader.lab textures + cubemap faces to R2 at
// assets.grudge-studio.com/shader-lab/textures/. Requires wrangler
// authenticated against the Cloudflare account that owns grudge-assets.
//
// Source directory defaults to ../Shader.lab next to ObjectStore. Pass
// --src=<path> to override.
//
// Usage:
//   npm run shader-lab:sync-textures
//   node scripts/shader-lab-sync-textures.mjs --src=/c/Users/nugye/Documents/1111111/Shader.lab
//   node scripts/shader-lab-sync-textures.mjs --dry-run

import { readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));
const SRC = argv.src || join(REPO_ROOT, '..', 'Shader.lab');
const BUCKET = argv.bucket || 'grudge-assets';
const DRY = !!argv['dry-run'];

async function* walkTextures(root) {
  const flat = await readdir(join(root, 'textures')).catch(() => []);
  for (const entry of flat) {
    const full = join(root, 'textures', entry);
    const s = await stat(full).catch(() => null);
    if (!s) continue;
    if (s.isFile() && /\.(png|jpg|jpeg)$/i.test(entry)) {
      yield { full, key: `shader-lab/textures/${entry}` };
    }
  }
  const cubeRoot = join(root, 'textures', 'cube');
  const cubes = await readdir(cubeRoot).catch(() => []);
  for (const cube of cubes) {
    const faces = await readdir(join(cubeRoot, cube)).catch(() => []);
    for (const face of faces) {
      yield {
        full: join(cubeRoot, cube, face),
        key: `shader-lab/textures/cube/${cube}/${face}`,
      };
    }
  }
}

function wrangler(args) {
  const res = spawnSync('wrangler', args, { stdio: 'inherit', shell: true });
  if (res.status !== 0) throw new Error(`wrangler ${args.join(' ')} failed (${res.status})`);
}

async function main() {
  console.log(`Source:   ${SRC}`);
  console.log(`Bucket:   ${BUCKET}`);
  console.log(`Mode:     ${DRY ? 'DRY RUN (no uploads)' : 'LIVE'}`);
  let count = 0;
  for await (const { full, key } of walkTextures(SRC)) {
    count++;
    if (DRY) {
      console.log(`[dry] ${key}  ←  ${full}`);
      continue;
    }
    console.log(`put ${key}`);
    wrangler(['r2', 'object', 'put', `${BUCKET}/${key}`, `--file=${full}`]);
  }
  console.log(`${DRY ? 'Would upload' : 'Uploaded'} ${count} objects.`);
}

main().catch(err => { console.error(err); process.exit(1); });
