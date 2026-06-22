#!/usr/bin/env node
/**
 * ObjectStore — Link canonical harvest → material → recipe → item graph.
 * Run after import:recipes:  npm run link:canonical
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API = join(ROOT, 'api', 'v1');
const now = new Date().toISOString();

function readJson(p) { return JSON.parse(readFileSync(p, 'utf8')); }
function writeJson(p, d) { writeFileSync(p, JSON.stringify(d, null, 2), 'utf8'); }
function normalizeName(s) { return String(s || '').toLowerCase().replace(/\s+t\d+$/i, '').trim(); }
function slugToTitle(slug) {
  return String(slug || '').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return ((h ^ (h >>> 16)) >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}
function stableUuid(kind, key) {
  return `${kind}-20260617000000-${fnv1a(key).slice(0, 6)}-${fnv1a(`${kind}-${key}`)}`;
}

const masterMaterials = readJson(join(API, 'master-materials.json'));
const masterRecipes = readJson(join(API, 'master-recipes.json'));
const masterItems = readJson(join(API, 'master-items.json'));
const harvestSource = readJson(join(API, 'sources', 'harvest-nodes.json'));

const MATERIAL_ALIASES = {
  'wild herbs': 'Wild Herb',
  'pine plank': 'Pine Plank',
  'oak plank': 'Oak Plank',
};

const materialByName = new Map();
const materialById = new Map();
for (const m of masterMaterials.materials || []) {
  materialByName.set(normalizeName(m.name), m);
  if (m.id) materialById.set(m.id, m);
}

function resolveMaterial(ref) {
  if (!ref) return null;
  const byId = materialById.get(ref);
  if (byId) return byId;
  const alias = MATERIAL_ALIASES[normalizeName(ref)];
  if (alias) return materialByName.get(normalizeName(alias)) || null;
  const titled = slugToTitle(ref);
  return materialByName.get(normalizeName(titled))
    || materialByName.get(normalizeName(ref))
    || null;
}

// ── 1. Resolve material UUIDs on all recipes ──
let matUuidFixes = 0;
for (const r of masterRecipes.recipes || []) {
  for (const m of r.materials || []) {
    if (m.uuid) continue;
    const resolved = resolveMaterial(m.name) || resolveMaterial(m.id)
      || resolveMaterial(m.name?.replace(/s$/i, ''));
    if (resolved) {
      m.uuid = resolved.uuid;
      if (!m.name || m.name === 'null') m.name = resolved.name;
      matUuidFixes++;
    } else if (m.name && !materialByName.has(normalizeName(m.name))) {
      const slug = m.name.toLowerCase().replace(/\s+/g, '-');
      const entry = {
        uuid: `MATL-LINK-${slug.toUpperCase().replace(/-/g, '-')}`,
        id: slug,
        name: m.name,
        type: 'material',
        source: 'recipe-link',
        category: 'component',
      };
      materialByName.set(normalizeName(m.name), entry);
      masterMaterials.materials.push(entry);
      m.uuid = entry.uuid;
      matUuidFixes++;
    }
  }
}
console.log(`  recipe material UUIDs resolved: ${matUuidFixes}`);

// Drop broken WCS CSV recipes — tiered-crafting + chef/engineer masters are canonical
const beforePrune = masterRecipes.recipes.length;
masterRecipes.recipes = (masterRecipes.recipes || []).filter((r) => {
  if (r.source !== 'wcs-csv') return true;
  if (r.resultItemId) return true;
  return false;
});
const pruned = beforePrune - masterRecipes.recipes.length;
if (pruned) console.log(`  pruned ${pruned} orphan wcs-csv recipes (no resultItemId)`);

// ── 2. Resolve resultItemId for material-output recipes ──
const itemByUuid = new Map();
const itemByBaseTier = new Map();
for (const item of masterItems.items || []) {
  itemByUuid.set(item.uuid, item);
  itemByBaseTier.set(`${normalizeName(item.baseName || item.name)}|${item.tier || 1}`, item);
}

let resultFixes = 0;
for (const r of masterRecipes.recipes || []) {
  if (r.resultItemId) continue;
  const mat = resolveMaterial(r.resultName) || resolveMaterial(r.id?.replace(/-/g, ' '));
  if (mat) {
    r.resultItemId = mat.uuid;
    r.resultName = mat.name;
    r.resultType = 'material';
    resultFixes++;
    continue;
  }
  const craftName = (r.name || '')
    .replace(/^Craft\s+/i, '').replace(/^Smelt\s+/i, '').replace(/^Saw\s+/i, '')
    .replace(/^Weave\s+/i, '').replace(/^Tan\s+/i, '').replace(/^Spin\s+/i, '');
  const item = itemByBaseTier.get(`${normalizeName(craftName)}|${r.tier || 1}`);
  if (item) {
    r.resultItemId = item.uuid;
    r.resultName = item.name;
    r.resultType = 'item';
    resultFixes++;
  }
}
console.log(`  recipe resultItemId resolved: ${resultFixes}`);

// ── 3. Ensure basic processing recipes for harvest drops ──
const PROCESSING = [
  { id: 'proc-hemp-thread', name: 'Spin Hemp Thread', result: 'Linen Thread', mats: [{ name: 'Hemp Fiber', qty: 2 }], profession: 'Mystic', station: 'Spinning Wheel', tier: 1 },
  { id: 'proc-rough-gem-cut', name: 'Cut Rough Gem', result: 'Flawed Gem', mats: [{ name: 'Rough Gem', qty: 1 }, { name: 'Flux', qty: 1 }], profession: 'Miner', station: 'Gem Cutter', tier: 1 },
  { id: 'proc-flawed-gem-cut', name: 'Cut Flawed Gem', result: 'Standard Gem', mats: [{ name: 'Flawed Gem', qty: 1 }, { name: 'Flux', qty: 1 }], profession: 'Miner', station: 'Gem Cutter', tier: 2 },
  { id: 'proc-standard-gem-cut', name: 'Cut Standard Gem', result: 'Fine Gem', mats: [{ name: 'Standard Gem', qty: 1 }, { name: 'Flux', qty: 1 }], profession: 'Miner', station: 'Gem Cutter', tier: 3 },
  { id: 'proc-red-flower-tea', name: 'Brew Red Flower Tea', result: 'Red Flower', mats: [{ name: 'Red Flower', qty: 2 }], profession: 'Chef', station: 'Campfire', tier: 1, usesMaterial: true },
  { id: 'proc-blue-flower-tea', name: 'Brew Blue Flower Tea', result: 'Blue Flower', mats: [{ name: 'Blue Flower', qty: 2 }], profession: 'Chef', station: 'Campfire', tier: 1, usesMaterial: true },
  { id: 'proc-white-flower-tea', name: 'Brew White Flower Tea', result: 'White Flower', mats: [{ name: 'White Flower', qty: 2 }], profession: 'Chef', station: 'Campfire', tier: 1, usesMaterial: true },
  { id: 'proc-yellow-flower-tea', name: 'Brew Yellow Flower Tea', result: 'Yellow Flower', mats: [{ name: 'Yellow Flower', qty: 2 }], profession: 'Chef', station: 'Campfire', tier: 1, usesMaterial: true },
  { id: 'proc-mushroom-soup', name: 'Cook Mushroom Soup', result: 'Medium Mushroom', mats: [{ name: 'Medium Mushroom', qty: 1 }], profession: 'Chef', station: 'Kitchen', tier: 2, usesMaterial: true },
  { id: 'proc-whisp-essence', name: 'Distill Blue Whisp', result: 'Minor Essence', mats: [{ name: 'Blue Whisp', qty: 2 }], profession: 'Mystic', station: 'Alchemy Table', tier: 1 },
];

const recipeMap = new Map((masterRecipes.recipes || []).map((r) => [r.id || r.uuid, r]));
let addedRecipes = 0;
for (const proc of PROCESSING) {
  if (recipeMap.has(proc.id)) continue;
  const resultMat = resolveMaterial(proc.result);
  if (!resultMat && !proc.usesMaterial) continue;
  const materials = proc.mats.map((m) => {
    const mat = resolveMaterial(m.name);
    return mat
      ? { uuid: mat.uuid, name: mat.name, quantity: m.qty }
      : { uuid: null, name: m.name, quantity: m.qty };
  }).filter((m) => m.uuid || m.name);
  if (materials.some((m) => !m.uuid)) continue;

  const recipe = {
    uuid: stableUuid('RECP', proc.id),
    id: proc.id,
    name: proc.name,
    resultItemId: proc.usesMaterial ? resultMat?.uuid : (resultMat?.uuid || null),
    resultName: proc.result,
    profession: proc.profession,
    category: 'processing',
    station: proc.station,
    tier: proc.tier,
    materials,
    source: 'harvest-processing',
  };
  masterRecipes.recipes.push(recipe);
  recipeMap.set(proc.id, recipe);
  addedRecipes++;
}
if (addedRecipes) {
  masterRecipes.total = masterRecipes.recipes.length;
  masterRecipes.totalRecipes = masterRecipes.recipes.length;
  console.log(`  +${addedRecipes} harvest processing recipes`);
}

// ── 4. Backfill item.recipeUuid from recipes ──
const recipeByResultId = new Map();
for (const r of masterRecipes.recipes || []) {
  if (r.resultItemId) recipeByResultId.set(r.resultItemId, r);
}
let itemRecipeLinks = 0;
for (const item of masterItems.items || []) {
  const recipe = recipeByResultId.get(item.uuid);
  if (recipe && item.recipeUuid !== recipe.uuid) {
    item.recipeUuid = recipe.uuid;
    itemRecipeLinks++;
  }
}
for (const m of masterMaterials.materials || []) {
  const recipe = recipeByResultId.get(m.uuid);
  if (recipe && m.recipeUuid !== recipe.uuid) {
    m.recipeUuid = recipe.uuid;
  }
}
console.log(`  item recipeUuid links: ${itemRecipeLinks}`);

// ── 5. Rebuild harvest node recipe links ──
const DROP_ITEM_MAP = {
  ORE_COPPER_ORE_T1: 'Copper Ore', ORE_IRON_ORE_T2: 'Iron Ore', ORE_STEEL_ORE_T3: 'Steel Ore',
  WOOD_PINE_LOG_T1: 'Pine Log', WOOD_OAK_LOG_T2: 'Oak Log', WOOD_MAPLE_LOG_T3: 'Maple Log',
  GEM_ROUGH_GEM: 'Rough Gem', GEM_FLAWED_GEM: 'Flawed Gem', GEM_STANDARD_GEM: 'Standard Gem',
  LOOM_HEMP_FIBER: 'Hemp Fiber', LOOM_SILK: 'Silk', COMPONENT_COAL: 'Coal',
  COMPONENT_FLUX: 'Flux', COMPONENT_STRING: 'String',
  ESSENCE_MINOR_ESSENCE: 'Minor Essence', ESSENCE_LESSER_ESSENCE: 'Lesser Essence',
  ESSENCE_GREATER_ESSENCE: 'Greater Essence',
  POT_RED_FLOWER: 'Red Flower', POT_BLUE_FLOWER: 'Blue Flower', POT_WHITE_FLOWER: 'White Flower',
  POT_YELLOW_FLOWER: 'Yellow Flower', POT_MUSHROOM_M: 'Medium Mushroom',
  POT_MUSHROOM_L: 'Large Mushroom', POT_BLUE_WHISP: 'Blue Whisp',
};

const recipesByMaterialUuid = new Map();
for (const r of masterRecipes.recipes || []) {
  for (const m of r.materials || []) {
    if (!m.uuid) continue;
    if (!recipesByMaterialUuid.has(m.uuid)) recipesByMaterialUuid.set(m.uuid, []);
    recipesByMaterialUuid.get(m.uuid).push(r.uuid);
  }
}

const enrichedNodes = (harvestSource.nodes || []).map((node) => {
  const drops = (node.drops || []).map((drop) => {
    const matName = DROP_ITEM_MAP[drop.itemId] || drop.itemId;
    const mat = materialByName.get(normalizeName(matName));
    const byUuid = mat?.uuid ? (recipesByMaterialUuid.get(mat.uuid) || []) : [];
    const byName = (masterRecipes.recipes || []).filter((r) =>
      (r.materials || []).some((m) => normalizeName(m.name) === normalizeName(matName))
    ).map((r) => r.uuid);
    const recipeUuids = [...new Set([...byUuid, ...byName])];
    return { ...drop, materialName: matName, materialUuid: mat?.uuid || null, recipeUuids };
  });
  const linkedRecipes = [...new Set(drops.flatMap((d) => d.recipeUuids))];
  return {
    ...node,
    nodeUuid: `NODE-${node.id.toUpperCase().replace(/-/g, '-')}`,
    drops,
    links: { materials: [...new Set(drops.map((d) => d.materialName))], recipeCount: linkedRecipes.length, recipeUuids: linkedRecipes },
  };
});

const dropsWithRecipes = enrichedNodes.flatMap((n) => n.drops).filter((d) => d.recipeUuids?.length).length;
const totalDrops = enrichedNodes.flatMap((n) => n.drops).length;

masterRecipes.generated = now;
masterMaterials.generated = now;
masterItems.generated = now;

writeJson(join(API, 'master-recipes.json'), masterRecipes);
writeJson(join(API, 'master-materials.json'), masterMaterials);
writeJson(join(API, 'master-items.json'), masterItems);
writeJson(join(API, 'master-harvest-nodes.json'), {
  version: '1.0.0', generated: now,
  source: 'api/v1/sources/harvest-nodes.json',
  totalNodes: enrichedNodes.length,
  rarityChances: harvestSource.rarityChances,
  nodes: enrichedNodes,
  stats: { totalDrops, dropsWithRecipeChain: dropsWithRecipes },
});

console.log(`  harvest drops with recipe chain: ${dropsWithRecipes}/${totalDrops}`);
console.log('Canonical graph linking complete.');