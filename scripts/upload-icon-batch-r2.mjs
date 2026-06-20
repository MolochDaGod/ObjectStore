#!/usr/bin/env node
/**
 * Uploads icon batch to R2 CDN keyspace and verifies URL + master JSON alignment.
 *
 * Target dirs:
 *   - icons/items/**
 *   - icons/skills/class/**
 *   - icons/ui/buttons/**
 *
 * Usage:
 *   node scripts/upload-icon-batch-r2.mjs --dry-run
 *   node scripts/upload-icon-batch-r2.mjs
 *   node scripts/upload-icon-batch-r2.mjs --verify-only
 */

import { readdir, stat, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TARGET_DIRS = [
  'icons/items',
  'icons/skills/class',
  'icons/ui/buttons',
];

const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));

const BUCKET = argv.bucket || 'grudge-assets';
const KEY_PREFIX = (argv.prefix || 'game-assets').replace(/^\/+|\/+$/g, '');
const CDN_BASE = (argv['cdn-base'] || 'https://assets.grudge-studio.com').replace(/\/+$/g, '');
const DRY = !!argv['dry-run'];
const VERIFY_ONLY = !!argv['verify-only'];
const SKIP_REMOTE_VERIFY = !!argv['skip-remote-verify'];

async function* walk(dir) {
  let entries = [];
  try {
    entries = await readdir(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return;
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      yield* walk(rel);
      continue;
    }
    if (entry.isFile() && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(entry.name)) {
      yield rel;
    }
  }
}

function wrangler(args) {
  const res = spawnSync('wrangler', args, { stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    throw new Error(`wrangler ${args.join(' ')} failed (${res.status})`);
  }
}

function collectIconUrls(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) collectIconUrls(item, out);
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    if (k === 'iconUrl' && typeof v === 'string') out.push(v);
    else collectIconUrls(v, out);
  }
  return out;
}

function normalizeIconUrl(iconUrl) {
  if (!iconUrl) return null;
  if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) return iconUrl;
  if (iconUrl.startsWith('/icons/')) return `${CDN_BASE}/${KEY_PREFIX}${iconUrl}`;
  return null;
}

async function verifyMasterIconBases() {
  const files = [
    'api/v1/master-items.json',
    'api/v1/master-weapons.json',
    'api/v1/master-armor.json',
    'api/v1/master-consumables.json',
    'api/v1/master-materials.json',
  ];

  let total = 0;
  const mismatches = [];

  for (const relFile of files) {
    const raw = await readFile(join(ROOT, relFile), 'utf8');
    const data = JSON.parse(raw);
    const icons = collectIconUrls(data);
    for (const iconUrl of icons) {
      total++;
      const normalized = normalizeIconUrl(iconUrl);
      if (!normalized) {
        mismatches.push({ file: relFile, iconUrl, reason: 'Unsupported iconUrl format' });
        continue;
      }
      if (iconUrl.startsWith('http') && !normalized.startsWith(`${CDN_BASE}/${KEY_PREFIX}/icons/`)) {
        mismatches.push({ file: relFile, iconUrl, reason: 'Absolute URL does not use CDN base' });
      }
    }
  }

  return { total, mismatches };
}

async function verifyRemoteUrls(urls) {
  const failed = [];
  for (const url of urls) {
    try {
      let res = await fetch(url, { method: 'HEAD' });
      if (res.status === 405 || res.status === 403) {
        res = await fetch(url, { method: 'GET' });
      }
      if (!res.ok) failed.push({ url, status: res.status });
    } catch (err) {
      failed.push({ url, error: err.message });
    }
  }
  return failed;
}

async function main() {
  const files = [];
  for (const dir of TARGET_DIRS) {
    for await (const rel of walk(dir)) files.push(rel);
  }

  const keys = files.map(rel => `${KEY_PREFIX}/${rel}`);
  const urls = keys.map(k => `${CDN_BASE}/${k}`);

  console.log(`Target dirs: ${TARGET_DIRS.join(', ')}`);
  console.log(`Files found: ${files.length}`);
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Prefix: ${KEY_PREFIX}`);
  console.log(`Mode: ${VERIFY_ONLY ? 'VERIFY ONLY' : (DRY ? 'DRY RUN' : 'LIVE UPLOAD')}`);

  if (!VERIFY_ONLY) {
    for (let i = 0; i < files.length; i++) {
      const rel = files[i];
      const key = keys[i];
      const full = join(ROOT, rel);
      const s = await stat(full);

      if (DRY) {
        console.log(`[dry] ${key} (${Math.ceil(s.size / 1024)} KB)`);
        continue;
      }

      console.log(`put ${key}`);
      wrangler(['r2', 'object', 'put', `${BUCKET}/${key}`, `--file=${full}`]);
    }
  }

  if (!SKIP_REMOTE_VERIFY) {
    const remoteFailures = await verifyRemoteUrls(urls);
    if (remoteFailures.length) {
      console.error(`\nRemote URL verification failed for ${remoteFailures.length} files.`);
      console.error(remoteFailures.slice(0, 20));
      process.exitCode = 1;
    } else {
      console.log('\nRemote URL verification passed for all uploaded batch files.');
    }
  } else {
    console.log('\nSkipping remote URL verification (--skip-remote-verify).');
  }

  const { total, mismatches } = await verifyMasterIconBases();
  console.log(`\nMaster JSON iconUrl entries checked: ${total}`);
  if (mismatches.length) {
    console.error(`Master JSON iconUrl mismatches: ${mismatches.length}`);
    console.error(mismatches.slice(0, 20));
    process.exitCode = 1;
  } else {
    console.log('Master JSON iconUrl references align with CDN base normalization.');
  }

  if (!process.exitCode) {
    console.log('\nDone.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
