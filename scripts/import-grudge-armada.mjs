#!/usr/bin/env node
/**
 * Import grudge-armada fleet packs (R2 CDN) into ObjectStore api/v1/grudge-armada.json
 *
 * Source: organized/index.json from advance_wars asset pipeline
 * CDN:    https://assets.grudge-studio.com/grudge-armada/
 *
 * Usage:
 *   node scripts/import-grudge-armada.mjs
 *   node scripts/import-grudge-armada.mjs --index "C:/path/to/organized/index.json"
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_PATH = join(ROOT, 'api', 'v1', 'grudge-armada.json');

const indexArg = process.argv.find((a) => a.startsWith('--index='));
const INDEX_PATH = indexArg
  ? indexArg.split('=').slice(1).join('=')
  : 'C:/Users/nugye/Documents/advance_wars_infantry__mech_units/organized/index.json';

const CDN_ROOT = 'https://assets.grudge-studio.com/grudge-armada';

function uuidFromSeed(seed) {
  const h = createHash('sha256').update(`grudge-armada:${seed}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function titleCase(id) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferTags(category, pack) {
  const tags = ['armada', 'grudge-armada', category];
  if (pack.has_gltf) tags.push('gltf', '3d');
  if (pack.has_fbx) tags.push('fbx');
  if (pack.has_anims) tags.push('animated');
  if (category === 'units') tags.push('rts', 'unit');
  if (category === 'vehicles') tags.push('vehicle', 'fleet');
  if (category === 'environments') tags.push('environment', 'level');
  if (category === 'materials') tags.push('pbr', 'material');
  if (category === 'audio') tags.push('audio', 'sfx');
  if (category === 'effects') tags.push('vfx', 'effect');
  if (category === 'weapons') tags.push('weapon', 'turret');
  return [...new Set(tags)];
}

function main() {
  const raw = readFileSync(INDEX_PATH, 'utf8').replace(/^\uFEFF/, '');
  const index = JSON.parse(raw);
  const packs = index.packs || index;
  const packEntries = typeof packs === 'object' && !Array.isArray(packs) ? Object.entries(packs) : [];

  const categories = {};
  const models = [];

  for (const [id, pack] of packEntries) {
    const category = pack.category || 'misc';
    if (!categories[category]) {
      categories[category] = { id: category, name: titleCase(category), packs: [] };
    }

    const loadUrl = pack.load_url || (pack.primary_model && pack.cdn_base
      ? `${pack.cdn_base}/${pack.primary_model}`
      : null);

    const entry = {
      id,
      grudgeId: `armada-${id}`,
      name: titleCase(id),
      category,
      zip: pack.zip || null,
      r2Prefix: pack.r2_prefix || `grudge-armada/${category}/${id}`,
      cdnBase: pack.cdn_base || `${CDN_ROOT}/${category}/${id}`,
      primaryModel: pack.primary_model || null,
      loadUrl,
      files: pack.files || 0,
      bytes: pack.bytes || 0,
      hasGltf: !!pack.has_gltf,
      hasFbx: !!pack.has_fbx,
      hasAnims: !!pack.has_anims,
      gltf: pack.gltf || [],
      fbx: pack.fbx || [],
      tags: inferTags(category, pack),
    };

    categories[category].packs.push(entry);

    if (loadUrl) {
      models.push({
        grudgeId: `armada-mdl-${id}`,
        grudgeType: 'armada_model',
        name: id,
        displayName: entry.name,
        category,
        format: (pack.primary_model || '').endsWith('.glb') ? 'GLB' : 'GLTF',
        url: loadUrl,
        cdnUrl: loadUrl,
        r2Key: pack.primary_model ? `${entry.r2Prefix}/${pack.primary_model}` : entry.r2Prefix,
        packId: id,
        tags: entry.tags,
        hasAnimations: !!pack.has_anims,
      });
    }
  }

  const categoryList = Object.values(categories).map((c) => ({
    ...c,
    packCount: c.packs.length,
  }));

  const doc = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    description: 'Grudge Armada fleet asset packs — units, vehicles, environments, materials, audio, effects. Served from assets.grudge-studio.com/grudge-armada/',
    era: 'armada',
    cdnRoot: CDN_ROOT,
    objectStoreApi: '/api/v1/grudge-armada.json',
    indexSource: INDEX_PATH,
    totalPacks: packEntries.length,
    totalModels: models.length,
    totalFiles: packEntries.reduce((n, [, p]) => n + (p.files || 0), 0),
    categories: categoryList,
    byCategory: Object.fromEntries(
      categoryList.map((c) => [c.id, c.packs.map((p) => ({
        id: p.id,
        loadUrl: p.loadUrl,
        primaryModel: p.primaryModel,
        hasGltf: p.hasGltf,
      }))]),
    ),
    models,
    packs: Object.fromEntries(packEntries.map(([id, pack]) => {
      const loadUrl = pack.load_url || (pack.primary_model && pack.cdn_base
        ? `${pack.cdn_base}/${pack.primary_model}`
        : null);
      return [id, {
        category: pack.category,
        cdnBase: pack.cdn_base,
        loadUrl,
        primaryModel: pack.primary_model,
        files: pack.files,
      }];
    })),
    usage: {
      catalog: 'GET https://objectstore.grudge-studio.com/api/v1/grudge-armada.json',
      packIndex: 'GET https://assets.grudge-studio.com/grudge-armada/index.json',
      loadModel: 'GLTFLoader.load(pack.loadUrl)',
      threeJs: 'const armada = await fetch("/api/v1/grudge-armada.json").then(r => r.json())',
    },
  };

  writeFileSync(OUT_PATH, JSON.stringify(doc, null, 2) + '\n');
  console.log(`[import-grudge-armada] ${packEntries.length} packs → ${OUT_PATH}`);
  console.log(`[import-grudge-armada] ${models.length} primary models, ${doc.totalFiles} total files`);
}

main();