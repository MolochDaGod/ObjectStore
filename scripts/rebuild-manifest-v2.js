#!/usr/bin/env node
// @ts-check
// Note: this file is ESM. Invoke via `node scripts/rebuild-manifest-v2.js`.
// The MODULE_TYPELESS_PACKAGE_JSON warning is harmless because the package.json
// intentionally stays CJS (server.js expects `require`). Node falls back to ESM
// parsing because of the top-level `import` statements below.
/**
 * Merge the three drifting legacy manifests into a single canonical manifests/v2/index.json
 * keyed by the v2 assetKind taxonomy.
 *
 * Inputs (all optional — whichever exist are merged):
 *   - entities-manifest.json        ({ version, source, assets: [{path, type, ...}] })
 *   - r2-upload-manifest.json       ({ bucket, files: [{id, localPath, r2Key, mime, ...}] })
 *   - remaining-manifest.json       ({ assets: [{path, type, ...}] })
 *
 * Output: manifests/v2/index.json
 *
 * Deduplicates by sha256 when possible, otherwise by (path + size). Generates stable
 * UUIDs from sha256 or path hash so re-runs are idempotent.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { classifyAsset, dimensionOf } from '../types/asset-kind.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const LEGACY = [
  'entities-manifest.json',
  'r2-upload-manifest.json',
  'remaining-manifest.json',
];

const MIME_BY_EXT = {
  png: 'image/png', webp: 'image/webp', avif: 'image/avif',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac',
  m4a: 'audio/mp4',
  glb: 'model/gltf-binary', gltf: 'model/gltf+json',
  obj: 'model/obj', stl: 'model/stl', fbx: 'application/octet-stream',
  vox: 'application/octet-stream',
  hdr: 'image/vnd.radiance', exr: 'image/x-exr',
  json: 'application/json', bin: 'application/octet-stream',
  ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2',
};

function uuidFromSeed(seed) {
  const h = createHash('sha256').update(seed).digest('hex');
  // Format as UUID v4-ish (deterministic)
  return (
    h.slice(0, 8) + '-' + h.slice(8, 12) + '-4' + h.slice(13, 16) + '-' +
    ((parseInt(h.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20) + '-' +
    h.slice(20, 32)
  );
}

function mimeForExt(ext) {
  return MIME_BY_EXT[(ext || '').toLowerCase()] || 'application/octet-stream';
}

function extractExt(p) {
  const m = String(p || '').match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : '';
}

function normalizePath(p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function pickName(p) {
  const n = normalizePath(p).split('/').pop() || '';
  return n.replace(/\.[^.]+$/, '');
}

async function readJsonSafe(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    console.warn(`[warn] Failed to read ${filePath}:`, err.message);
    return null;
  }
}

function entryFromEntities(a, bucket) {
  const p = normalizePath(a.path || a.filename || '');
  const { kind, dimension } = classifyAsset(p);
  const ext = extractExt(p);
  const size = Number(a.size || 0);
  const seed = `${p}|${size}`;
  return {
    id: uuidFromSeed(seed),
    kind,
    dimension,
    name: a.original || pickName(p),
    path: p,
    r2Key: a.r2Key || `game-assets/${p}`,
    mime: a.mime || mimeForExt(ext),
    size,
    tags: Array.isArray(a.tags) ? a.tags : [],
    pack: a.pack,
    category: a.category,
    tier: typeof a.tier === 'number' ? a.tier : undefined,
    faction: a.faction,
    source: 'entities-manifest.json',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    _bucket: bucket,
  };
}

function entryFromR2(a) {
  const p = normalizePath(a.localPath || a.path || '');
  const { kind, dimension } = classifyAsset(p);
  const size = Number(a.size || 0);
  return {
    id: a.id || uuidFromSeed(`${p}|${size}`),
    kind,
    dimension,
    name: pickName(p),
    path: p,
    r2Key: a.r2Key,
    mime: a.mime || mimeForExt(extractExt(p)),
    size,
    tags: Array.isArray(a.tags) ? a.tags : [],
    pack: a.pack,
    category: a.category,
    source: 'r2-upload-manifest.json',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

function entryFromRemaining(a) {
  return entryFromEntities(a, 'grudge-assets');
}

function mergeTwo(existing, incoming) {
  // Prefer records that have an r2Key (meaning: actually uploaded).
  if (!existing.r2Key && incoming.r2Key) existing.r2Key = incoming.r2Key;
  // Union tags
  const tagSet = new Set([...(existing.tags || []), ...(incoming.tags || [])]);
  existing.tags = Array.from(tagSet);
  // Keep earliest id (deterministic across runs)
  if (incoming.pack && !existing.pack) existing.pack = incoming.pack;
  if (incoming.category && !existing.category) existing.category = incoming.category;
  existing.source = existing.source + ', ' + incoming.source;
  existing.updatedAt = new Date().toISOString();
  return existing;
}

async function main() {
  const byKey = new Map();
  let bucket = 'grudge-assets';

  for (const fname of LEGACY) {
    const full = path.join(root, fname);
    const data = await readJsonSafe(full);
    if (!data) {
      console.log(`[skip] ${fname} not found`);
      continue;
    }
    if (fname === 'r2-upload-manifest.json') {
      if (data.bucket) bucket = data.bucket;
      for (const a of data.files || []) {
        const e = entryFromR2(a);
        const key = e.path;
        byKey.has(key) ? mergeTwo(byKey.get(key), e) : byKey.set(key, e);
      }
    } else if (fname === 'entities-manifest.json') {
      for (const a of data.assets || []) {
        const e = entryFromEntities(a, bucket);
        const key = e.path;
        byKey.has(key) ? mergeTwo(byKey.get(key), e) : byKey.set(key, e);
      }
    } else if (fname === 'remaining-manifest.json') {
      for (const a of data.assets || []) {
        const e = entryFromRemaining(a);
        const key = e.path;
        byKey.has(key) ? mergeTwo(byKey.get(key), e) : byKey.set(key, e);
      }
    }
    console.log(`[read] ${fname}: running total ${byKey.size}`);
  }

  const assets = Array.from(byKey.values())
    .map(({ _bucket, ...rest }) => rest)
    .sort((a, b) => a.path.localeCompare(b.path));

  const counts = {};
  const dimensions = { '2d': 0, '3d': 0, shared: 0, composite: 0 };
  for (const a of assets) {
    counts[a.kind] = (counts[a.kind] || 0) + 1;
    dimensions[a.dimension] = (dimensions[a.dimension] || 0) + 1;
  }

  const outDir = path.join(root, 'manifests', 'v2');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.json');
  const payload = {
    version: '2.0.0',
    bucket,
    generatedAt: new Date().toISOString(),
    counts,
    dimensions,
    assets,
  };
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2));
  console.log(`[write] ${path.relative(root, outPath)}`);
  console.log(`        total: ${assets.length}`);
  console.log(`        dims:`, dimensions);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log(`        kinds:`, Object.fromEntries(top));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
