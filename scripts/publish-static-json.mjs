#!/usr/bin/env node
/**
 * Publish api/v1 JSON files to R2 static-json cache (objectstore.grudge-studio.com)
 *
 * Worker serves R2 key static-json/{name}.json before upstream fallback.
 *
 * Usage:
 *   node scripts/publish-static-json.mjs grudge-armada catalog
 *   node scripts/publish-static-json.mjs --all-catalog
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API_DIR = join(ROOT, 'api', 'v1');
const BUCKET = 'grudge-assets';

const args = process.argv.slice(2);
const allCatalog = args.includes('--all-catalog');
const names = allCatalog
  ? readdirSync(API_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
  : args.filter((a) => !a.startsWith('--'));

if (!names.length) {
  console.error('Usage: node scripts/publish-static-json.mjs <name> [name2...]');
  console.error('       node scripts/publish-static-json.mjs --all-catalog');
  process.exit(1);
}

function publish(name) {
  const local = join(API_DIR, `${name}.json`);
  if (!existsSync(local)) {
    console.warn(`SKIP missing: ${name}.json`);
    return false;
  }
  const key = `static-json/${name}.json`;
  const cmd = `npx wrangler r2 object put ${BUCKET}/${key} --file="${local}" --content-type="application/json" --remote`;
  try {
    execSync(cmd, { stdio: 'pipe', cwd: ROOT, timeout: 120000 });
    console.log(`OK  ${key}`);
    return true;
  } catch (e) {
    console.error(`ERR ${key}: ${e.message}`);
    return false;
  }
}

let ok = 0;
let fail = 0;
for (const name of names) {
  if (publish(name)) ok++;
  else fail++;
}
console.log(`\nPublished ${ok}/${names.length} (${fail} failed)`);
console.log(`Live: https://objectstore.grudge-studio.com/api/v1/<name>.json`);