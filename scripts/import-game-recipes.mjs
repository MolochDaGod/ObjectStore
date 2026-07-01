#!/usr/bin/env node
/**
 * ObjectStore — Import & generate unified recipes
 *
 * Merges:
 *   1. Existing master-recipes.json (chef/engineer from generate:master)
 *   2. WCS MASTER_ALL_RECIPES.csv (smelting, woodworking, weaving, armor, etc.)
 *   3. Tiered weapon/staff recipes (from tieredCrafting rules + weapons.json)
 *
 * Run: npm run import:recipes  (after generate:master)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API = join(ROOT, 'api', 'v1');

const TIERS = [1, 2, 3, 4, 5, 6, 7, 8];
const TIER_MATERIALS = {
  ore: ['Copper Ore', 'Iron Ore', 'Steel Ore', 'Mithril Ore', 'Adamantine Ore', 'Orichalcum Ore', 'Starmetal Ore', 'Divine Ore'],
  ingot: ['Copper Ingot', 'Iron Ingot', 'Steel Ingot', 'Mithril Ingot', 'Adamantine Ingot', 'Orichalcum Ingot', 'Starmetal Ingot', 'Divine Ingot'],
  wood: ['Pine Log', 'Oak Log', 'Maple Log', 'Ash Log', 'Ironwood Log', 'Ebony Log', 'Wyrmwood Log', 'Worldtree Log'],
  plank: ['Pine Plank', 'Oak Plank', 'Maple Plank', 'Ash Plank', 'Ironwood Plank', 'Ebony Plank', 'Wyrmwood Plank', 'Worldtree Plank'],
  cloth: ['Linen Thread', 'Wool Thread', 'Cotton Thread', 'Silk Thread', 'Moonweave Thread', 'Starweave Thread', 'Voidweave Thread', 'Divine Thread'],
  fabric: ['Linen Cloth', 'Wool Cloth', 'Cotton Cloth', 'Silk Cloth', 'Moonweave Cloth', 'Starweave Cloth', 'Voidweave Cloth', 'Divine Cloth'],
  leather: ['Rawhide', 'Thick Hide', 'Rugged Leather', 'Hardened Leather', 'Wyrm Leather', 'Infernal Leather', 'Titan Leather', 'Divine Leather'],
  essence: ['Minor Essence', 'Lesser Essence', 'Greater Essence', 'Superior Essence', 'Refined Essence', 'Perfect Essence', 'Ancient Essence', 'Divine Essence'],
  gem: ['Rough Gem', 'Flawed Gem', 'Standard Gem', 'Fine Gem', 'Pristine Gem', 'Flawless Gem', 'Radiant Gem', 'Divine Gem'],
};
const TIER_COSTS = {
  baseMaterialCount: [2, 3, 4, 5, 6, 8, 10, 12],
  craftingTime: ['3s', '4s', '5s', '7s', '10s', '14s', '18s', '25s'],
  successChance: [100, 98, 95, 90, 85, 80, 75, 70],
  gold: [100, 200, 400, 800, 1600, 3200, 6400, 12800],
};

const WEAPON_CONFIGS = [
  { setKey: 'swords', profession: 'Miner', primaryMaterial: 'ingot', secondaryMaterial: 'leather' },
  { setKey: 'daggers', profession: 'Miner', primaryMaterial: 'ingot', secondaryMaterial: 'fabric' },
  { setKey: 'greatswords', profession: 'Miner', primaryMaterial: 'ingot', secondaryMaterial: 'leather' },
  { setKey: 'hammers2h', profession: 'Miner', primaryMaterial: 'ingot', secondaryMaterial: 'plank' },
  { setKey: 'axes1h', profession: 'Forester', primaryMaterial: 'ingot', secondaryMaterial: 'plank' },
  { setKey: 'greataxes', profession: 'Forester', primaryMaterial: 'ingot', secondaryMaterial: 'plank' },
  { setKey: 'bows', profession: 'Forester', primaryMaterial: 'plank', secondaryMaterial: 'leather' },
  { setKey: 'natureStaves', profession: 'Forester', primaryMaterial: 'plank', secondaryMaterial: 'fabric' },
  { setKey: 'hammers1h', profession: 'Engineer', primaryMaterial: 'ingot', secondaryMaterial: 'plank' },
  { setKey: 'crossbows', profession: 'Engineer', primaryMaterial: 'ingot', secondaryMaterial: 'plank' },
  { setKey: 'guns', profession: 'Engineer', primaryMaterial: 'ingot', secondaryMaterial: 'plank' },
  { setKey: 'thunderGrudge', profession: 'Engineer', primaryMaterial: 'ingot', secondaryMaterial: 'fabric' },
  { setKey: 'fireStaves', profession: 'Mystic', primaryMaterial: 'plank', secondaryMaterial: 'fabric' },
  { setKey: 'frostStaves', profession: 'Mystic', primaryMaterial: 'plank', secondaryMaterial: 'fabric' },
  { setKey: 'holyStaves', profession: 'Mystic', primaryMaterial: 'plank', secondaryMaterial: 'fabric' },
  { setKey: 'lightningStaves', profession: 'Mystic', primaryMaterial: 'plank', secondaryMaterial: 'fabric' },
  { setKey: 'arcaneStaves', profession: 'Mystic', primaryMaterial: 'plank', secondaryMaterial: 'fabric' },
  { setKey: 'spears', profession: 'Forester', primaryMaterial: 'ingot', secondaryMaterial: 'plank' },
  { setKey: 'shields', profession: 'Miner', primaryMaterial: 'ingot', secondaryMaterial: 'leather' },
  { setKey: 'tools', profession: 'Miner', primaryMaterial: 'ingot', secondaryMaterial: 'plank' },
];

const STATIONS = {
  Miner: 'Smithing Table', Forester: 'Lumber Table', Mystic: 'Loom Table',
  Chef: 'Cooking Table', Engineer: 'Tinker Table',
};

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
  const ts = '20260617000000';
  const seq = fnv1a(key).slice(0, 6);
  return `${kind}-${ts}-${seq}-${fnv1a(`${kind}-${key}`)}`;
}

// ── Load datasets ──
const masterRecipes = readJson(join(API, 'master-recipes.json'));
const masterMaterials = readJson(join(API, 'master-materials.json'));
const masterItems = readJson(join(API, 'master-items.json'));
const weapons = readJson(join(API, 'weapons.json'));
const csvRaw = readFileSync(join(API, 'sources', 'master-recipes-export.csv'), 'utf8');
const now = new Date().toISOString();

// ── Material indexes ──
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
  const titled = slugToTitle(ref);
  return materialByName.get(normalizeName(titled)) || materialByName.get(normalizeName(ref)) || null;
}

function matEntry(ref, qty) {
  const m = resolveMaterial(ref);
  return m ? { uuid: m.uuid, name: m.name, quantity: qty } : { uuid: null, name: slugToTitle(ref), quantity: qty };
}

// ── Item indexes ──
const itemByUuid = new Map();
const itemByKey = new Map(); // category:weaponId:tier
const itemByBaseTier = new Map(); // baseName|tier

for (const item of masterItems.items || []) {
  itemByUuid.set(item.uuid, item);
  const bt = `${normalizeName(item.baseName || item.name)}|${item.tier || 1}`;
  itemByBaseTier.set(bt, item);
}

// master-weapons.json is authoritative for tier-expanded rows (tools, spears, shields)
try {
  const masterWeapons = readJson(join(API, 'master-weapons.json'));
  for (const item of masterWeapons.items || []) {
    itemByUuid.set(item.uuid, item);
    const bt = `${normalizeName(item.baseName || item.name)}|${item.tier ?? 1}`;
    itemByBaseTier.set(bt, item);
    if (item.category && item.id) {
      itemByKey.set(`${item.category}:${item.id}:${item.tier ?? 1}`, item);
    }
  }
} catch {
  /* optional */
}

for (const [cat, block] of Object.entries(weapons.categories || {})) {
  for (const w of block.items || []) {
    for (let tier = 1; tier <= 8; tier++) {
      const name = tier === 1 ? w.name : `${w.name} T${tier}`;
      const item = itemByBaseTier.get(`${normalizeName(w.name)}|${tier}`);
      if (item) itemByKey.set(`${cat}:${w.id}:${tier}`, item);
      else if (tier === 1) {
        const fallback = itemByBaseTier.get(`${normalizeName(name)}|1`);
        if (fallback) itemByKey.set(`${cat}:${w.id}:1`, fallback);
      }
    }
  }
}

function resolveResultItem(outputId, recipeName, tier = 1) {
  // Material output (copper-ingot, pine-plank)
  const mat = resolveMaterial(outputId)
    || resolveMaterial(recipeName.replace(/^Smelt\s+/i, '').replace(/^Saw\s+/i, '').replace(/^Weave\s+/i, '').replace(/^Spin\s+/i, '').replace(/^Tan\s+/i, ''));
  if (mat) return { uuid: mat.uuid, name: mat.name, type: 'material' };

  // Weapon slug patterns: t1-staff-fire-emberwrath, t1-sword-bloodfeud
  const parts = outputId.split('-');
  if (parts[0]?.match(/^t\d$/i)) {
    const t = parseInt(parts[0].slice(1), 10) || tier;
    const weaponSlug = parts.slice(3).join('-') || parts[parts.length - 1];
    for (const [cat, block] of Object.entries(weapons.categories || {})) {
      const w = (block.items || []).find((i) => i.id === weaponSlug || i.id === parts.slice(2).join('-'));
      if (w) {
        const item = itemByKey.get(`${cat}:${w.id}:${t}`);
        if (item) return { uuid: item.uuid, name: item.name, type: 'item' };
      }
    }
  }

  // Name-based fallback from recipe name "Craft Emberwrath Staff"
  const craftName = recipeName.replace(/^Craft\s+/i, '').replace(/^Smelt\s+/i, '').replace(/^Saw\s+/i, '')
    .replace(/^Weave\s+/i, '').replace(/^Tan\s+/i, '').replace(/^Cook\s+/i, '').replace(/^Brew\s+/i, '');
  const item = itemByBaseTier.get(`${normalizeName(craftName)}|${tier}`);
  if (item) return { uuid: item.uuid, name: item.name, type: 'item' };

  return { uuid: null, name: slugToTitle(outputId), type: 'unknown' };
}

const merged = new Map(); // recipeId → recipe

// Keep existing recipes
for (const r of masterRecipes.recipes || []) {
  const key = r.uuid || r.name;
  merged.set(key, r);
}

// ── Parse CSV recipes ──
let csvCount = 0;
for (const line of csvRaw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const cols = trimmed.split(',');
  if (cols.length < 14 || cols[0] === 'GrudgeUUID') continue;

  const [
    grudgeUuid, recipeId, recipeName, outputItemId, outputQty, tier,
    category, subCategory, station, craftTime, goldCost, successRate,
    requiredLevel, profession,
    mat1, mat1Qty, mat2, mat2Qty, mat3, mat3Qty, mat4, mat4Qty, mat5, mat5Qty,
  ] = cols;

  const materials = [];
  for (const [ref, qty] of [[mat1, mat1Qty], [mat2, mat2Qty], [mat3, mat3Qty], [mat4, mat4Qty], [mat5, mat5Qty]]) {
    if (ref && qty) materials.push(matEntry(ref, parseInt(qty, 10) || 1));
  }

  const result = resolveResultItem(outputItemId, recipeName, parseInt(tier, 10) || 1);
  const uuid = grudgeUuid?.startsWith('RECP-') ? grudgeUuid : stableUuid('RECP', recipeId);

  merged.set(recipeId, {
    uuid,
    id: recipeId,
    name: recipeName,
    resultItemId: result.uuid,
    resultName: result.name,
    profession: profession || 'Miner',
    category: category || 'crafting',
    subCategory: subCategory || null,
    station: station || null,
    tier: parseInt(tier, 10) || 1,
    craftTime: craftTime || null,
    goldCost: parseInt(goldCost, 10) || 0,
    successRate: parseInt(successRate, 10) || 100,
    requiredLevel: parseInt(requiredLevel, 10) || 1,
    materials,
    source: 'wcs-csv',
  });
  csvCount++;
}

// ── Generate tiered weapon/staff recipes ──
let tieredCount = 0;
for (const config of WEAPON_CONFIGS) {
  const block = weapons.categories?.[config.setKey];
  if (!block?.items?.length) continue;

  for (const weapon of block.items) {
    for (const tier of TIERS) {
      const baseCount = TIER_COSTS.baseMaterialCount[tier - 1];
      const materials = [
        matEntry(TIER_MATERIALS[config.primaryMaterial][tier - 1], baseCount),
        matEntry(TIER_MATERIALS[config.secondaryMaterial][tier - 1], Math.max(1, Math.floor(baseCount / 2))),
      ];
      if (tier >= 4) materials.push(matEntry(TIER_MATERIALS.essence[tier - 1], Math.floor((tier - 3) * 1.5)));
      if (tier >= 5) materials.push(matEntry(TIER_MATERIALS.gem[tier - 1], Math.floor((tier - 4) / 2) + 1));

      const item =
        itemByKey.get(`${config.setKey}:${weapon.id}:${tier}`)
        || itemByBaseTier.get(`${normalizeName(weapon.name)}|${tier}`);
      const recipeId = `tiered-${weapon.id}-t${tier}`;
      const recipeName = tier === 1 ? `Craft ${weapon.name}` : `Craft ${weapon.name} T${tier}`;

      merged.set(recipeId, {
        uuid: stableUuid('RECP', recipeId),
        id: recipeId,
        name: recipeName,
        resultItemId: item?.uuid || null,
        resultName: item?.name || recipeName.replace(/^Craft\s+/, ''),
        profession: config.profession,
        category: config.setKey,
        subCategory: 'weapon',
        station: STATIONS[config.profession] || 'Crafting Table',
        tier,
        craftTime: TIER_COSTS.craftingTime[tier - 1],
        goldCost: TIER_COSTS.gold[tier - 1],
        successRate: TIER_COSTS.successChance[tier - 1],
        requiredLevel: Math.max(1, (tier - 1) * 10 + 5),
        materials,
        source: 'tiered-crafting',
      });
      tieredCount++;
    }
  }
}

const allRecipes = [...merged.values()];
const out = {
  version: '3.1.0',
  generated: now,
  total: allRecipes.length,
  totalRecipes: allRecipes.length,
  sources: {
    existing: (masterRecipes.recipes || []).length,
    wcsCsv: csvCount,
    tieredGenerated: tieredCount,
  },
  recipes: allRecipes,
};

writeJson(join(API, 'master-recipes.json'), out);
console.log(`  master-recipes.json — ${allRecipes.length} recipes (${csvCount} CSV + ${tieredCount} tiered + ${(masterRecipes.recipes || []).length} existing)`);