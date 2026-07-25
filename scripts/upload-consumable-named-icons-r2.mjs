#!/usr/bin/env node
/**
 * Upload named consumable icons + JSON to R2 grudge-assets.
 *
 * Keys:
 *   icons/consumables/{category}/{slug}.png
 *   icons/consumables/named/{slug}.png
 *   api/v1/consumables.json  (optional --json)
 *
 * Usage:
 *   node scripts/upload-consumable-named-icons-r2.mjs --dry-run
 *   node scripts/upload-consumable-named-icons-r2.mjs --remote
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'grudge-assets';
const dry = process.argv.includes('--dry-run');
const remote = process.argv.includes('--remote');
const withJson = process.argv.includes('--json');

const CATS = ['redFoods', 'greenFoods', 'blueFoods', 'mysticPotions', 'engineerConsumables', 'named'];

function walkPngs(dir, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkPngs(p, base));
    else if (/\.png$/i.test(ent.name)) out.push(p);
  }
  return out;
}

function put(localFile, key) {
  const args = [
    'wrangler',
    'r2',
    'object',
    'put',
    `${BUCKET}/${key}`,
    `--file=${localFile}`,
    '--content-type=image/png',
  ];
  if (remote) args.push('--remote');
  if (dry) {
    console.log(`[dry-run] ${key}`);
    return true;
  }
  console.log(`→ ${key}`);
  const r = spawnSync('npx', args, { cwd: ROOT, stdio: 'inherit', shell: true });
  return r.status === 0;
}

let ok = 0;
let fail = 0;
for (const cat of CATS) {
  const dir = path.join(ROOT, 'icons', 'consumables', cat);
  for (const file of walkPngs(dir)) {
    const rel = path.relative(path.join(ROOT, 'icons'), file).replace(/\\/g, '/');
    const key = `icons/${rel}`;
    if (put(file, key)) ok++;
    else fail++;
  }
}

if (withJson) {
  const jp = path.join(ROOT, 'api', 'v1', 'consumables.json');
  const args = [
    'wrangler',
    'r2',
    'object',
    'put',
    `${BUCKET}/api/v1/consumables.json`,
    `--file=${jp}`,
    '--content-type=application/json',
  ];
  if (remote) args.push('--remote');
  if (dry) console.log('[dry-run] api/v1/consumables.json');
  else {
    console.log('→ api/v1/consumables.json');
    const r = spawnSync('npx', args, { cwd: ROOT, stdio: 'inherit', shell: true });
    if (r.status !== 0) fail++;
    else ok++;
  }
}

console.log(`\nDone. ok=${ok} fail=${fail} remote=${remote} dry=${dry}`);
if (fail) process.exit(1);
console.log('CDN examples:');
console.log('  https://assets.grudge-studio.com/icons/consumables/redFoods/grilled-steak.png');
console.log('  https://assets.grudge-studio.com/icons/consumables/named/grilled-steak.png');
console.log('Pages (after git push main): https://info.grudge-studio.com/SPRITE_DATABASE.html#consumables');
