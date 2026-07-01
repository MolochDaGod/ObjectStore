#!/usr/bin/env node
/**
 * consolidate-items.mjs — Single Source of Truth for ALL items.
 *
 * Reads: master-weapons, master-armor, master-consumables, master-materials,
 *        master-relics, master-enchants, master-infusions, master-artifacts,
 *        master-t0-items, master-buildings, master-mounts
 *
 * Writes:
 *   1. master-items.json      — canonical combined (weapons + armor + consumables)
 *   2. master-registry.json   — UUID index across ALL item types
 *   3. items-database.json    — legacy format mirror (for backward compat, read-only)
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
const weapons = load('master-weapons.json');
const armor = load('master-armor.json');
const consumables = load('master-consumables.json');
const materials = load('master-materials.json');
const relics = load('master-relics.json');
const enchants = load('master-enchants.json');
const infusions = load('master-infusions.json');
const artifacts = load('master-artifacts.json');
const t0Weapons = load('t0-weapons.json');
const buildings = load('master-buildings.json');
const mounts = load('master-mounts.json');

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

addItems(weapons, 'items', 'ITEM', 'weapon');
addItems(armor, 'items', 'ITEM', 'armor');
addItems(consumables, 'items', 'FOOD', 'consumable');
addItems(materials, 'materials', 'MATL', 'material');
addItems(relics, 'relics', 'RELC', 'relic');
if (relics?.items) addItems({ items: relics.items }, 'items', 'RELC', 'relic');
addItems(enchants, 'enchants', 'ENCH', 'enchant');
if (enchants?.items) addItems({ items: enchants.items }, 'items', 'ENCH', 'enchant');
addItems(infusions, 'infusions', 'INFU', 'infusion');
if (infusions?.items) addItems({ items: infusions.items }, 'items', 'INFU', 'infusion');
addItems(artifacts, 'artifacts', 'ARTF', 'artifact');
addItems({ items: t0Weapons?.weapons || [] }, 'items', 'ITEM', 'weapon');
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

// ── Write master-items.json (weapons + armor + consumables only — original scope) ──
const masterItems = deduped.filter(i => ['weapon', 'armor', 'consumable'].includes(i.type));
const masterOut = {
  version: '2.0.0',
  generated: new Date().toISOString(),
  description: 'Canonical combined item database — weapons + armor + consumables. Single source of truth.',
  totalItems: masterItems.length,
  totalWeapons: masterItems.filter(i => i.type === 'weapon').length,
  totalArmor: masterItems.filter(i => i.type === 'armor').length,
  totalConsumables: masterItems.filter(i => i.type === 'consumable').length,
  totalRecipes: 0, // filled by recipe linker
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

// ── Write items-database.json (legacy mirror — same data, backward compat) ──
const legacyOut = {
  version: '2.0.0',
  generated: new Date().toISOString(),
  description: 'Legacy item database format — auto-generated from master-items.json. DO NOT EDIT DIRECTLY.',
  totalItems: deduped.length,
  items: deduped.map(item => ({
    uuid: item.uuid,
    name: item.name,
    baseName: item.baseName || item.name,
    type: item.type,
    category: item.category,
    tier: item.tier || 0,
    tierLabel: item.tierLabel || '',
    tierColor: item.tierColor || '',
    iconUrl: item.iconUrl || '',
    description: item.description || item.lore || '',
    stats: item.stats || {},
    craftedBy: item.craftedBy || null,
    tags: item.tags || [],
  })),
};
writeFileSync(join(API, 'items-database.json'), JSON.stringify(legacyOut, null, 2));
console.log(`[consolidate] Wrote items-database.json: ${deduped.length} items (legacy mirror)`);

// ── Also update items-legacy.json to be identical ──
writeFileSync(join(API, 'items-legacy.json'), JSON.stringify(legacyOut, null, 2));
console.log(`[consolidate] Wrote items-legacy.json (same as items-database.json)`);

console.log('[consolidate] Done. All items have UUIDs. One source of truth.');
