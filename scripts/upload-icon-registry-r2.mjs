#!/usr/bin/env node
/**
 * Upload ALL ObjectStore icons to R2 and emit a UUID-organized icon registry.
 *
 * Walks icons/** (skills, sigils, abilities, class/race/faction, weapons, etc.),
 * uploads to grudge-assets bucket under game-assets/icons/...,
 * and writes api/v1/icon-registry.json with deterministic ICON- UUIDs.
 *
 * Usage:
 *   node scripts/upload-icon-registry-r2.mjs --dry-run
 *   node scripts/upload-icon-registry-r2.mjs
 *   node scripts/upload-icon-registry-r2.mjs --category=skills --dry-run
 *   node scripts/upload-icon-registry-r2.mjs --skip-upload --registry-only
 */

import { createHash } from 'node:crypto';
import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ICONS_ROOT = 'icons';

const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));

const BUCKET = argv.bucket || 'grudge-assets';
const KEY_PREFIX = (argv.prefix || 'game-assets').replace(/^\/+|\/+$/g, '');
const CDN_BASE = (argv['cdn-base'] || 'https://assets.grudge-studio.com').replace(/\/+$/g, '');
const DRY = !!argv['dry-run'];
const SKIP_UPLOAD = !!argv['skip-upload'];
const REGISTRY_ONLY = !!argv['registry-only'];
const CATEGORY_FILTER = argv.category || null;
const SKIP_REMOTE_VERIFY = !!argv['skip-remote-verify'];
const MAX_FILES = argv.limit ? Number(argv.limit) : Infinity;

const IMAGE_RE = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

/** Map relative icons/ path segments → registry category */
function inferCategory(relPath) {
  const p = relPath.replace(/\\/g, '/').toLowerCase();
  if (p.includes('/sigils/') || p.startsWith('sigils/')) return 'sigil';
  if (p.includes('/abilities/') || p.startsWith('abilities/')) return 'ability';
  if (p.includes('/skills/class/')) return 'class-skill';
  if (p.includes('/skills/') || p.startsWith('skills/')) return 'skill';
  if (p.includes('/spells/') || p.startsWith('spells/')) return 'spell';
  if (p.includes('/pack/factions/') || p.includes('/factions/') || p.includes('factiuon')) return 'faction';
  if (p.includes('/pack/entities/') || p.includes('/entities/')) return 'entity';
  if (p.includes('/professions/') || p.startsWith('professions/')) return 'profession';
  if (p.includes('/weapons/') || p.startsWith('weapons/')) return 'weapon';
  if (p.includes('/armor/') || p.startsWith('armor/')) return 'armor';
  if (p.includes('/consumables/') || p.startsWith('consumables/')) return 'consumable';
  if (p.includes('/materials/') || p.startsWith('materials/')) return 'material';
  if (p.includes('/items/') || p.startsWith('items/')) return 'item';
  if (p.includes('/ui/') || p.startsWith('ui/')) return 'ui';
  if (p.includes('/pack/classes/') || /_(warrior|mage|rogue|cleric|ranger|paladin|monk|druid|warlock)/.test(p)) return 'class';
  if (p.includes('/pack/races/') || /(human|barbarian|elf|dwarf|orc|undead|worge|crusade|legion|fabled|wild)/.test(p)) return 'race';
  return 'misc';
}

function inferSubcategory(relPath, category) {
  const parts = relPath.replace(/\\/g, '/').split('/');
  if (category === 'faction' && parts.includes('factions')) {
    return basename(parts[parts.indexOf('factions') + 1] || '', extname(relPath)).replace(/-emblem$/, '');
  }
  if (category === 'entity') {
    const name = basename(relPath, extname(relPath));
    const raceMatch = name.match(/^(human|barbarian|elf|dwarf|orc|undead|worge)/);
    if (raceMatch) return raceMatch[1];
    const classMatch = name.match(/_(warrior|mage|rogue|cleric|ranger|paladin|monk|druid|warlock)$/);
    if (classMatch) return classMatch[1];
  }
  if (parts.length >= 2) return parts[parts.length - 2];
  return undefined;
}

function deriveIconGrudgeUuid(r2Key) {
  const h = createHash('sha1').update(`grudge-asset:${r2Key}`).digest('hex');
  return `ICON-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`.toUpperCase();
}

function buildCdnUrl(r2Key) {
  return `${CDN_BASE}/${r2Key}`;
}

function toIconPath(relFromIcons) {
  return `/icons/${relFromIcons.replace(/\\/g, '/')}`;
}

async function* walkIcons(dir) {
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
      yield* walkIcons(rel);
      continue;
    }
    if (entry.isFile() && IMAGE_RE.test(entry.name)) {
      yield rel;
    }
  }
}

function wrangler(args, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = spawnSync('wrangler', args, { stdio: 'inherit', shell: true });
    if (res.status === 0) return;
    if (attempt < retries) {
      const delay = attempt * 2000;
      console.warn(`wrangler failed (attempt ${attempt}/${retries}), retrying in ${delay}ms...`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
    } else {
      throw new Error(`wrangler ${args.join(' ')} failed (${res.status}) after ${retries} attempts`);
    }
  }
}

async function verifyRemoteUrls(urls, sampleSize = 20) {
  const sample = urls.length <= sampleSize
    ? urls
    : urls.filter((_, i) => i % Math.ceil(urls.length / sampleSize) === 0).slice(0, sampleSize);
  const failed = [];
  for (const url of sample) {
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
  return { failed, sampled: sample.length };
}

async function main() {
  const files = [];
  for await (const rel of walkIcons(ICONS_ROOT)) {
    if (files.length >= MAX_FILES) break;
    const relFromIcons = relative(ICONS_ROOT, rel).replace(/\\/g, '/');
    const category = inferCategory(relFromIcons);
    if (CATEGORY_FILTER && category !== CATEGORY_FILTER) continue;
    files.push({ rel, relFromIcons, category });
  }

  console.log(`Icon files found: ${files.length}`);
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Prefix: ${KEY_PREFIX}`);
  console.log(`Mode: ${REGISTRY_ONLY ? 'REGISTRY ONLY' : (DRY ? 'DRY RUN' : (SKIP_UPLOAD ? 'SKIP UPLOAD' : 'LIVE UPLOAD'))}`);

  const entries = {};
  const categories = {};

  for (const { rel, relFromIcons, category } of files) {
    const r2Key = `${KEY_PREFIX}/icons/${relFromIcons}`;
    const grudgeUuid = deriveIconGrudgeUuid(r2Key);
    const iconPath = toIconPath(relFromIcons);
    const cdnUrl = buildCdnUrl(r2Key);
    const full = join(ROOT, rel);
    const s = await stat(full);
    const subcategory = inferSubcategory(relFromIcons, category);

    categories[category] = (categories[category] || 0) + 1;

    entries[grudgeUuid] = {
      grudgeUuid,
      category,
      r2Key,
      iconPath,
      cdnUrl,
      fileName: basename(relFromIcons),
      name: basename(relFromIcons, extname(relFromIcons)),
      ...(subcategory ? { subcategory } : {}),
      sizeBytes: s.size,
    };

    if (!REGISTRY_ONLY && !SKIP_UPLOAD) {
      if (DRY) {
        console.log(`[dry] ${r2Key} → ${grudgeUuid} (${category})`);
      } else {
        console.log(`put ${r2Key} (${grudgeUuid})`);
        wrangler(['r2', 'object', 'put', `${BUCKET}/${r2Key}`, `--file=${full}`, '--remote']);
      }
    }
  }

  const registry = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    cdnBase: CDN_BASE,
    keyPrefix: KEY_PREFIX,
    totalEntries: Object.keys(entries).length,
    categories,
    entries,
  };

  const registryPath = join(ROOT, 'api/v1/icon-registry.json');
  if (!DRY) {
    await writeFile(registryPath, JSON.stringify(registry, null, 2), 'utf8');
    console.log(`\nWrote ${registryPath} (${registry.totalEntries} entries)`);

    const r2RegistryKey = `${KEY_PREFIX}/api/v1/icon-registry.json`;
    if (!SKIP_UPLOAD && !REGISTRY_ONLY) {
      console.log(`put ${r2RegistryKey}`);
      wrangler(['r2', 'object', 'put', `${BUCKET}/${r2RegistryKey}`, `--file=${registryPath}`, '--remote']);
    }
  } else {
    console.log(`\n[dry] Would write ${registryPath} with ${registry.totalEntries} entries`);
    console.log('[dry] Categories:', categories);
  }

  if (!SKIP_REMOTE_VERIFY && !DRY && !SKIP_UPLOAD && files.length > 0) {
    const urls = Object.values(entries).map(e => e.cdnUrl);
    const { failed, sampled } = await verifyRemoteUrls(urls);
    if (failed.length) {
      console.error(`\nRemote URL verification failed for ${failed.length}/${sampled} sampled files.`);
      console.error(failed.slice(0, 10));
      process.exitCode = 1;
    } else {
      console.log(`\nRemote URL verification passed (${sampled} sampled).`);
    }
  }

  if (!process.exitCode) {
    console.log('\nDone.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});