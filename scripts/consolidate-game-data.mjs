#!/usr/bin/env node
/**
 * ObjectStore — Game Data Consolidation
 *
 * Single pipeline linking: harvest nodes → materials → recipes → items → staff looks → icons.
 * Run after generate:master:  npm run consolidate:game-data
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API = join(ROOT, 'api', 'v1');

const CDN_JSON = 'https://molochdagod.github.io/ObjectStore/api/v1';
const CDN_ASSETS = 'https://assets.grudge-studio.com';

/** Harvest drop itemId → material display name */
const DROP_ITEM_MAP = {
  ORE_COPPER_ORE_T1: 'Copper Ore',
  ORE_IRON_ORE_T2: 'Iron Ore',
  ORE_STEEL_ORE_T3: 'Steel Ore',
  WOOD_PINE_LOG_T1: 'Pine Log',
  WOOD_OAK_LOG_T2: 'Oak Log',
  WOOD_MAPLE_LOG_T3: 'Maple Log',
  GEM_ROUGH_GEM: 'Rough Gem',
  GEM_FLAWED_GEM: 'Flawed Gem',
  GEM_STANDARD_GEM: 'Standard Gem',
  LOOM_HEMP_FIBER: 'Hemp Fiber',
  LOOM_SILK: 'Silk',
  COMPONENT_COAL: 'Coal',
  COMPONENT_FLUX: 'Flux',
  COMPONENT_STRING: 'String',
  ESSENCE_MINOR_ESSENCE: 'Minor Essence',
  ESSENCE_LESSER_ESSENCE: 'Lesser Essence',
  ESSENCE_GREATER_ESSENCE: 'Greater Essence',
  POT_RED_FLOWER: 'Red Flower',
  POT_BLUE_FLOWER: 'Blue Flower',
  POT_WHITE_FLOWER: 'White Flower',
  POT_YELLOW_FLOWER: 'Yellow Flower',
  POT_MUSHROOM_M: 'Medium Mushroom',
  POT_MUSHROOM_L: 'Large Mushroom',
  POT_BLUE_WHISP: 'Blue Whisp',
};

/** Supplemental gather materials not yet in master-recipes */
const SUPPLEMENTAL_MATERIALS = Object.values(DROP_ITEM_MAP).filter((name, i, arr) => arr.indexOf(name) === i);

const STAFF_CATEGORIES = [
  'fireStaves', 'frostStaves', 'holyStaves', 'lightningStaves', 'arcaneStaves', 'natureStaves',
];
function staffIconPath(category, indexInCategory) {
  const offsets = { fireStaves: 0, frostStaves: 8, holyStaves: 16, lightningStaves: 24, arcaneStaves: 32, natureStaves: 40 };
  const n = (offsets[category] || 0) + indexInCategory + 1;
  const clamped = ((n - 1) % 50) + 1;
  return `${CDN_ASSETS}/icons/pack/weapons/staff_${clamped}.png`;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

function normalizeName(s) {
  return String(s || '').toLowerCase().replace(/\s+t\d+$/i, '').trim();
}

// ── Load canonical datasets ──
const masterItems = readJson(join(API, 'master-items.json'));
const masterRecipes = readJson(join(API, 'master-recipes.json'));
const masterMaterials = readJson(join(API, 'master-materials.json'));
const harvestSource = readJson(join(API, 'sources', 'harvest-nodes.json'));
const weapons = readJson(join(API, 'weapons.json'));

const now = new Date().toISOString();

// ── Material lookup ──
const materialByName = new Map();
for (const m of masterMaterials.materials || []) {
  materialByName.set(normalizeName(m.name), m);
}

// Add supplemental materials with stable synthetic UUIDs if missing
const supplementalAdded = [];
for (const name of SUPPLEMENTAL_MATERIALS) {
  const key = normalizeName(name);
  if (!materialByName.has(key)) {
    const slug = name.toLowerCase().replace(/\s+/g, '_');
    const entry = {
      uuid: `MATL-HARVEST-${slug.toUpperCase().replace(/_/g, '-')}`,
      name,
      type: 'material',
      source: 'harvest',
      iconUrl: `${CDN_ASSETS}/icons/materials/${slug}.png`,
    };
    materialByName.set(key, entry);
    masterMaterials.materials.push(entry);
    supplementalAdded.push(name);
  }
}

if (supplementalAdded.length) {
  masterMaterials.totalMaterials = masterMaterials.materials.length;
  masterMaterials.supplementalAdded = supplementalAdded;
  masterMaterials.generated = now;
  writeJson(join(API, 'master-materials.json'), masterMaterials);
  console.log(`  +${supplementalAdded.length} supplemental harvest materials`);
}

// ── Item / recipe indexes ──
const itemByBaseName = new Map();
const itemByUuid = new Map();
for (const item of masterItems.items || []) {
  itemByUuid.set(item.uuid, item);
  const key = normalizeName(item.baseName || item.name);
  if (!itemByBaseName.has(key) || item.tier === 1) itemByBaseName.set(key, item);
}

const recipeByResultId = new Map();
const recipesByMaterialUuid = new Map();
for (const r of masterRecipes.recipes || []) {
  if (r.resultItemId) recipeByResultId.set(r.resultItemId, r);
  for (const m of r.materials || []) {
    if (!m.uuid) continue;
    if (!recipesByMaterialUuid.has(m.uuid)) recipesByMaterialUuid.set(m.uuid, []);
    recipesByMaterialUuid.get(m.uuid).push(r.uuid);
  }
}

function resolveIconUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${CDN_ASSETS}${path}`;
}

// ── Enrich harvest nodes ──
const enrichedNodes = (harvestSource.nodes || []).map((node) => {
  const drops = (node.drops || []).map((drop) => {
    const matName = DROP_ITEM_MAP[drop.itemId] || drop.itemId;
    const mat = materialByName.get(normalizeName(matName));
    const byUuid = mat?.uuid ? (recipesByMaterialUuid.get(mat.uuid) || []) : [];
    const byName = (masterRecipes.recipes || []).filter((r) =>
      (r.materials || []).some((m) => normalizeName(m.name) === normalizeName(matName))
    ).map((r) => r.uuid);
    const recipeUuids = [...new Set([...byUuid, ...byName])];
    return {
      ...drop,
      materialName: matName,
      materialUuid: mat?.uuid || null,
      iconUrl: resolveIconUrl(mat?.iconUrl),
      recipeUuids,
    };
  });
  const dropMaterials = [...new Set(drops.map((d) => d.materialName))];
  const linkedRecipes = [...new Set(drops.flatMap((d) => d.recipeUuids))];
  return {
    ...node,
    nodeUuid: `NODE-${node.id.toUpperCase().replace(/-/g, '-')}`,
    spriteUrl: node.spritePath ? `${CDN_ASSETS}${node.spritePath}` : null,
    drops,
    links: {
      materials: dropMaterials,
      recipeCount: linkedRecipes.length,
      recipeUuids: linkedRecipes,
    },
  };
});

const harvestOut = {
  version: '1.0.0',
  generated: now,
  source: 'api/v1/sources/harvest-nodes.json',
  totalNodes: enrichedNodes.length,
  rarityChances: harvestSource.rarityChances,
  nodes: enrichedNodes,
};
writeJson(join(API, 'master-harvest-nodes.json'), harvestOut);
console.log(`  master-harvest-nodes.json — ${enrichedNodes.length} nodes`);

// ── Backfill recipeUuid on master-items from merged recipes ──
let recipeLinkFixes = 0;
for (const item of masterItems.items || []) {
  const recipe = recipeByResultId.get(item.uuid);
  if (recipe && item.recipeUuid !== recipe.uuid) {
    item.recipeUuid = recipe.uuid;
    recipeLinkFixes++;
  }
}
if (recipeLinkFixes) {
  masterItems.generated = now;
  writeJson(join(API, 'master-items.json'), masterItems);
  console.log(`  master-items.json — ${recipeLinkFixes} recipeUuid links`);
}

// ── Fix master-items staff iconUrls before building staff-looks ──
let staffIconFixes = 0;
for (const item of masterItems.items || []) {
  if (!STAFF_CATEGORIES.includes(item.category)) continue;
  const catItems = weapons.categories?.[item.category]?.items || [];
  const idx = catItems.findIndex((w) => normalizeName(w.name) === normalizeName(item.baseName || item.name));
  if (idx >= 0) {
    const url = staffIconPath(item.category, idx);
    if (item.iconUrl !== url) {
      item.iconUrl = url;
      staffIconFixes++;
    }
  }
}
if (staffIconFixes) {
  masterItems.generated = now;
  writeJson(join(API, 'master-items.json'), masterItems);
  console.log(`  master-items.json — ${staffIconFixes} staff iconUrls fixed`);
}

// ── Staff looks: merge weapons.json + master-items + recipes ──
const staffLooks = { version: '1.0.0', generated: now, categories: {} };

for (const cat of STAFF_CATEGORIES) {
  const block = weapons.categories?.[cat];
  if (!block?.items?.length) continue;

  staffLooks.categories[cat] = {
    element: block.element || cat.replace(/Staves$/, ''),
    iconBase: block.iconBase || 'staff',
    items: block.items.map((w, idx) => {
      const iconUrl = staffIconPath(cat, idx);
      const master = itemByBaseName.get(normalizeName(w.name));
      const recipe = master ? recipeByResultId.get(master.uuid) : null;
      return {
        id: w.id,
        name: w.name,
        lore: w.lore || null,
        element: block.element || null,
        craftedBy: w.craftedBy || master?.craftedBy || 'Mystic',
        iconUrl,
        spritePath: `/icons/pack/weapons/staff_${((idx % 50) + 1)}.png`,
        itemUuid: master?.uuid || null,
        recipeUuid: master?.recipeUuid || recipe?.uuid || null,
        recipeMaterials: recipe?.materials || null,
        tiers: (masterItems.items || [])
          .filter((i) => normalizeName(i.baseName || i.name) === normalizeName(w.name))
          .map((i) => ({ tier: i.tier, uuid: i.uuid, iconUrl: i.iconUrl, stats: i.stats })),
        stats: w.stats || master?.stats || null,
        abilities: w.abilities || master?.abilities || [],
        signatureAbility: w.signatureAbility || master?.signature || null,
      };
    }),
  };

  // Patch weapons.json sprite paths in-place
  block.items.forEach((w, idx) => {
    w.iconUrl = staffIconPath(cat, idx);
    w.spritePath = `/icons/pack/weapons/staff_${((idx % 50) + 1)}.png`;
  });
}

weapons.updated = now.split('T')[0];
weapons.staffIconsResolved = true;
writeJson(join(API, 'weapons.json'), weapons);
writeJson(join(API, 'staff-looks.json'), staffLooks);
console.log(`  staff-looks.json — ${Object.keys(staffLooks.categories).length} staff categories`);
console.log('  weapons.json — staff spritePath/iconUrl patched');

// ── Game data manifest (single entry point) ──
const manifest = {
  version: '1.0.0',
  generated: now,
  canonical: true,
  description: 'Grudge Studio unified game data — single source of truth',
  endpoints: {
    manifest: `${CDN_JSON}/game-data-manifest.json`,
    items: `${CDN_JSON}/master-items.json`,
    recipes: `${CDN_JSON}/master-recipes.json`,
    materials: `${CDN_JSON}/master-materials.json`,
    harvestNodes: `${CDN_JSON}/master-harvest-nodes.json`,
    staffLooks: `${CDN_JSON}/staff-looks.json`,
    weapons: `${CDN_JSON}/weapons.json`,
    armor: `${CDN_JSON}/armor.json`,
    consumables: `${CDN_JSON}/consumables.json`,
    professions: `${CDN_JSON}/master-professions.json`,
    professionTrees: `${CDN_JSON}/master-professionTrees.json`,
    weaponSkills: `${CDN_JSON}/master-weaponSkills.json`,
    classSkillTrees: `${CDN_JSON}/master-skillTrees.json`,
    attributes: `${CDN_JSON}/master-attributes.json`,
    classRelics: `${CDN_JSON}/master-classRelics.json`,
    benchMeshes: `${CDN_JSON}/bench-mesh-catalog.json`,
    resourceMeshes: `${CDN_JSON}/resource-mesh-catalog.json`,
    weaponsMaster: `${CDN_JSON}/master-weapons.json`,
    registry: `${CDN_JSON}/master-registry.json`,
    iconResolver: 'https://molochdagod.github.io/ObjectStore/utils/icon-resolver.js',
  },
  assetCdn: CDN_ASSETS,
  counts: {
    items: masterItems.totalItems || masterItems.items?.length,
    recipes: masterRecipes.totalRecipes || masterRecipes.recipes?.length,
    materials: masterMaterials.totalMaterials || masterMaterials.materials?.length,
    harvestNodes: enrichedNodes.length,
    staffCategories: Object.keys(staffLooks.categories).length,
    itemsWithRecipes: (masterItems.items || []).filter((i) => i.recipeUuid).length,
    harvestDropsLinked: enrichedNodes.flatMap((n) => n.drops).filter((d) => d.materialUuid).length,
    staffWithRecipes: Object.values(staffLooks.categories).flatMap((c) => c.items).filter((i) => i.recipeUuid).length,
  },
  graph: {
    harvestToMaterial: 'master-harvest-nodes.json → drops[].materialUuid',
    materialToRecipe: 'master-recipes.json → materials[].uuid',
    recipeToItem: 'master-recipes.json → resultItemId → master-items.json',
    itemToIcon: 'master-items.json → iconUrl | staff-looks.json → iconUrl',
    staffToRecipe: 'staff-looks.json → recipeUuid → master-recipes.json',
  },
  recipeSources: masterRecipes.sources || null,
  deprecated: {
    'items-database.json': 'Use master-items.json',
    'grudge-game-data-hub': 'Archived — do not use',
  },
};
writeJson(join(API, 'game-data-manifest.json'), manifest);
console.log('  game-data-manifest.json — canonical index written');
console.log('\nConsolidation complete.');