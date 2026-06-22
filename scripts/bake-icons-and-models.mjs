#!/usr/bin/env node
/**
 * bake-icons-and-models.mjs
 *
 * Reads all master-*.json API files, resolves every iconUrl via icon-resolver.js,
 * writes resolved absolute CDN URLs back into iconUrl, and adds modelUrl for weapons.
 * Generates api/v1/unified-registry.json for game clients.
 *
 * Usage: node scripts/bake-icons-and-models.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { resolveCatalogIcon } from '../utils/icon-resolver.js';
import { ICON_CDN, MODEL_CDN } from '../utils/asset-config.js';

const ROOT = join(import.meta.dirname, '..');
const API  = join(ROOT, 'api', 'v1');
const CDN  = ICON_CDN;
const R2   = 'https://objectstore.grudge-studio.com';

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function buildModelIndex() {
  const modelsDir = join(ROOT, 'models', 'weapons');
  const index = {};
  if (!existsSync(modelsDir)) return index;
  for (const cat of readdirSync(modelsDir, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    const catDir = join(modelsDir, cat.name);
    const glbs = readdirSync(catDir).filter(f => f.endsWith('.glb'));
    index[cat.name] = glbs.map(f => ({
      file: f,
      path: `models/weapons/${cat.name}/${f}`,
      cdnUrl: `${MODEL_CDN}/models/weapons/${cat.name}/${f}`,
      r2Url: `${R2}/v1/assets/models/weapons/${cat.name}/${f}`,
    }));
  }
  return index;
}

const CATEGORY_TO_MODEL = {
  swords: 'sword', greatswords: 'greatsword', axes1h: 'axe', greataxes: 'greataxe',
  daggers: 'dagger', hammers1h: 'hammer', hammers2h: 'hammer', spears: 'spear',
  bows: 'bow', crossbows: 'crossbow', guns: 'gun', scythes: 'scythe', shields: 'shield',
  tools: 'hammer', wands: 'wand', 'offhand-tome': 'tome',
  firestaves: 'staff', froststaves: 'staff', lightningstaves: 'staff',
  naturestaves: 'staff', holystaves: 'staff', arcanestaves: 'staff',
};

function assignModel(item, modelIndex) {
  const wt = (item.weaponType || item.subType || item.category || '').toLowerCase();
  const modelCat = CATEGORY_TO_MODEL[wt];
  if (!modelCat || !modelIndex[modelCat]?.length) return null;
  const models = modelIndex[modelCat];
  const idx = hashStr(item.baseName || item.name || '') % models.length;
  return models[idx];
}

console.log('Building model index...');
const modelIndex = buildModelIndex();
const modelCounts = Object.entries(modelIndex).map(([k, v]) => `${k}:${v.length}`).join(', ');
console.log(`  Models: ${modelCounts}`);

const SOURCES = [
  { file: 'master-weapons.json', key: 'items', type: 'weapon' },
  { file: 'master-armor.json', key: 'items', type: 'armor' },
  { file: 'master-consumables.json', key: 'items', type: 'consumable' },
  { file: 'master-materials.json', key: 'materials', type: 'material' },
  { file: 'master-relics.json', key: 'relics', type: 'relic' },
  { file: 'master-enchants.json', key: 'enchants', type: 'enchant' },
  { file: 'master-infusions.json', key: 'infusions', type: 'infusion' },
  { file: 'master-artifacts.json', key: 'artifacts', type: 'artifact' },
];

let totalItems = 0, iconsBaked = 0, modelsLinked = 0;
const unifiedItems = [];

for (const src of SOURCES) {
  const filePath = join(API, src.file);
  if (!existsSync(filePath)) { console.log(`  SKIP ${src.file} (not found)`); continue; }

  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const items = data[src.key] || [];
  let baked = 0, linked = 0;

  for (const item of items) {
    if (!item.type) item.type = src.type;

    const resolved = resolveCatalogIcon(item);
    if (resolved && resolved !== item.iconUrl) {
      item.iconUrl = resolved;
      baked++;
    }

    if (['weapon', 'tool', 'offhand-tome'].includes(item.type)) {
      const model = assignModel(item, modelIndex);
      if (model) {
        item.modelUrl = model.cdnUrl;
        item.modelPath = model.path;
        linked++;
      }
    }

    unifiedItems.push({
      uuid: item.uuid,
      name: item.name,
      baseName: item.baseName || item.name,
      type: item.type,
      category: item.category,
      tier: item.tier,
      tierLabel: item.tierLabel,
      tierColor: item.tierColor,
      iconUrl: item.iconUrl,
      modelUrl: item.modelUrl || null,
      slotType: item.slotType || null,
      material: item.material || null,
      element: item.element || null,
    });
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  totalItems += items.length;
  iconsBaked += baked;
  modelsLinked += linked;
  console.log(`  ${src.file.padEnd(28)} ${items.length} items, ${baked} icons baked, ${linked} models linked`);
}

const registry = {
  version: '3.2.0',
  generated: new Date().toISOString(),
  total: unifiedItems.length,
  cdnBase: CDN,
  r2Base: R2,
  items: unifiedItems,
};
const registryPath = join(API, 'unified-registry.json');
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(`\n  unified-registry.json: ${unifiedItems.length} items`);

console.log('\n=== DONE ===');
console.log(`  Total items: ${totalItems}`);
console.log(`  Icons baked: ${iconsBaked}`);
console.log(`  Models linked: ${modelsLinked}`);
console.log(`  Registry: ${registryPath}`);