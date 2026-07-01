#!/usr/bin/env node
/**
 * consolidate-items.mjs — Single Source of Truth for ALL items.
 *
 * Reads: master-weapon-prefabs (runtime weapon authority), master-armor,
 *        master-consumables, master-materials, master-relics, master-enchants,
 *        master-infusions, master-artifacts, master-buildings, master-mounts
 *
 * Writes:
 *   1. master-items.json      — canonical combined (weapons/tools + armor + consumables)
 *   2. master-registry.json   — UUID index across ALL item types
 *
 * Ensures: every item has a UUID. Items with FOOD/POTN/MATL/RECP prefixes
 * are valid - we don't force ITEM prefix on everything.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = join(ROOT, 'api', 'v1');

function load(name) {
  try { return JSON.parse(readFileSync(join(API, name), 'utf-8')); }
  catch { return null; }
}

// UUID generator for items missing one
const TS = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
let seq = 0;
function genUUID(prefix, name) {
  const s = String(seq++).padStart(6, '0');
  const h = createHash('md5').update(name + s).digest('hex').slice(0, 8).toUpperCase();
  return `${prefix}-${TS}-${s}-${h}`;
}

// ── Load all sources ──
const prefabs = load('master-weapon-prefabs.json');
const armor = load('master-armor.json');
const consumables = load('master-consumables.json');
const materials = load('master-materials.json');
const relics = load('master-relics.json');
const enchants = load('master-enchants.json');
const infusions = load('master-infusions.json');
const artifacts = load('master-artifacts.json');
const buildings = load('master-buildings.json');
const mounts = load('master-mounts.json');
const recipes = load('master-recipes.json');

const CONSUMABLE_TYPES = new Set(['consumable', 'food', 'potion']);

function prefabToCatalogItem(p) {
  const isTool = p.weaponType === 'TOOL';
  return {
    uuid: p.uuid,
    name: p.name,
    baseName: p.baseName || p.name,
    id: p.id,
    type: isTool ? 'tool' : 'weapon',
    category: p.category || p.weaponType?.toLowerCase(),
    weaponType: p.weaponType,
    tier: p.tier,
    tierLabel: p.tierLabel,
    stats: p.stats,
    primaryStat: p.primaryStat,
    iconUrl: p.assets?.iconUrl,
    modelR2Key: p.assets?.modelR2Key,
    recipeUuid: p.recipeUuid,
    craftedBy: p.craftedBy,
    runtimePrefab: true,
    prefabSource: 'master-weapon-prefabs.json',
  };
}

// ── Ensure UUIDs ──
function ensureUUID(item, prefix) {
  if (!item.uuid) item.uuid = genUUID(prefix, item.name || 'unknown');
  return item;
}

// ── Collect ALL items ──
const allItems = [];
const uuidIndex = {};

function addItems(source, key, prefix, type) {
  if (!source) return;
  const items = source[key] || source.items || [];
  for (const item of items) {
    ensureUUID(item, prefix);
    if (!item.type) item.type = type;
    allItems.push(item);
    uuidIndex[item.uuid] = {
      name: item.name,
      type: item.type || type,
      category: item.category || type,
      tier: item.tier,
      iconUrl: item.iconUrl || null,
    };
  }
}

if (prefabs?.prefabs) {
  for (const p of prefabs.prefabs) {
    const item = prefabToCatalogItem(p);
    ensureUUID(item, 'ITEM');
    allItems.push(item);
    uuidIndex[item.uuid] = {
      name: item.name,
      type: item.type,
      category: item.category,
      tier: item.tier,
      iconUrl: item.iconUrl || null,
      runtimePrefab: true,
    };
  }
}
addItems(armor, 'items', 'ITEM', 'armor');
for (const c of consumables?.items || []) {
  const item = { ...c };
  if (!item.type) item.type = 'consumable';
  ensureUUID(item, item.uuid?.startsWith('POTN') ? 'POTN' : 'FOOD');
  allItems.push(item);
  uuidIndex[item.uuid] = {
    name: item.name,
    type: item.type,
    category: item.category || item.type,
    tier: item.tier,
    iconUrl: item.iconUrl || null,
  };
}
addItems(materials, 'materials', 'MATL', 'material');
addItems(relics, 'relics', 'RELC', 'relic');
if (relics?.items) addItems({ items: relics.items }, 'items', 'RELC', 'relic');
addItems(enchants, 'enchants', 'ENCH', 'enchant');
if (enchants?.items) addItems({ items: enchants.items }, 'items', 'ENCH', 'enchant');
addItems(infusions, 'infusions', 'INFU', 'infusion');
if (infusions?.items) addItems({ items: infusions.items }, 'items', 'INFU', 'infusion');
addItems(artifacts, 'artifacts', 'ARTF', 'artifact');
addItems(buildings, 'buildings', 'BLDG', 'building');
addItems(mounts, 'mounts', 'MNT', 'mount');

// ── Deduplicate by UUID ──
const seen = new Set();
const deduped = [];
for (const item of allItems) {
  if (seen.has(item.uuid)) continue;
  seen.add(item.uuid);
  deduped.push(item);
}

console.log(`[consolidate] Collected ${allItems.length} items, deduped to ${deduped.length}`);

// ── Count by type ──
const byCat = {};
for (const item of deduped) {
  const cat = item.type || item.category || 'unknown';
  byCat[cat] = (byCat[cat] || 0) + 1;
}
console.log('[consolidate] By type:', JSON.stringify(byCat));

// ── Check UUID coverage ──
const withUuid = deduped.filter(i => i.uuid).length;
const withoutUuid = deduped.filter(i => !i.uuid).length;
console.log(`[consolidate] UUID coverage: ${withUuid}/${deduped.length} (${withoutUuid} missing)`);

// ── Write master-items.json (prefab weapons/tools + armor + all consumables) ──
const masterItems = deduped.filter((i) =>
  ['weapon', 'tool', 'armor'].includes(i.type) || CONSUMABLE_TYPES.has(i.type),
);
const masterOut = {
  version: '2.1.0',
  generated: new Date().toISOString(),
  description: 'Canonical Warlords item catalog — runtime prefabs + armor + consumables. Weapons/tools authority: master-weapon-prefabs.json.',
  canonicalManifest: 'canonical-items-manifest.json',
  weaponAuthority: 'master-weapon-prefabs.json',
  totalItems: masterItems.length,
  totalWeapons: masterItems.filter((i) => i.type === 'weapon').length,
  totalTools: masterItems.filter((i) => i.type === 'tool').length,
  totalArmor: masterItems.filter((i) => i.type === 'armor').length,
  totalConsumables: masterItems.filter((i) => CONSUMABLE_TYPES.has(i.type)).length,
  totalRecipes: recipes?.totalRecipes || 0,
  totalMaterials: materials?.materials?.length || 0,
  items: masterItems,
};
writeFileSync(join(API, 'master-items.json'), JSON.stringify(masterOut, null, 2));
console.log(`[consolidate] Wrote master-items.json: ${masterItems.length} items`);

// ── Write master-registry.json (UUID index for ALL types) ──
const registryOut = {
  version: '2.0.0',
  generated: new Date().toISOString(),
  description: 'UUID registry across ALL item types — weapons, armor, consumables, materials, relics, enchants, infusions, artifacts, buildings, mounts.',
  totalEntries: Object.keys(uuidIndex).length,
  prefixes: {
    ITEM: 'Weapons + Armor + T0 items',
    FOOD: 'Food consumables',
    POTN: 'Potions',
    MATL: 'Crafting materials',
    RELC: 'Relics',
    ENCH: 'Enchantments',
    INFU: 'Infusions',
    ARTF: 'Artifacts',
    BLDG: 'Buildings + crafting stations',
    MNT:  'Mounts',
  },
  entries: uuidIndex,
};
writeFileSync(join(API, 'master-registry.json'), JSON.stringify(registryOut, null, 2));
console.log(`[consolidate] Wrote master-registry.json: ${Object.keys(uuidIndex).length} entries`);

// Legacy items-database.json / items-legacy.json archived — see api/v1/archive/manifest.json

console.log('[consolidate] Done. All items have UUIDs. One source of truth (master-items.json).');
