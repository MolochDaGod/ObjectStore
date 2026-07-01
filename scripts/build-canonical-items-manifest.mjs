#!/usr/bin/env node
/**
 * Build canonical-items-manifest.json — full Grudge Warlords item universe:
 * authority file per category, counts, status, UUID prefixes, resolution order.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');
const CDN = 'https://molochdagod.github.io/ObjectStore/api/v1';

function load(name) {
  const p = join(API, name);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

function len(arr) {
  return Array.isArray(arr) ? arr.length : 0;
}

const prefabs = load('master-weapon-prefabs.json');
const items = load('master-items.json');
const registry = load('master-registry.json');
const armor = load('master-armor.json');
const consumables = load('master-consumables.json');
const materials = load('master-materials.json');
const recipes = load('master-recipes.json');
const relics = load('master-relics.json');
const enchants = load('master-enchants.json');
const infusions = load('master-infusions.json');
const artifacts = load('master-artifacts.json');
const buildings = load('master-buildings.json');
const mounts = load('master-mounts.json');
const harvest = load('master-harvest-nodes.json');
const pattern = load('_meta/canonical-equipment-pattern.json');

const combatPrefabs = (prefabs?.prefabs || []).filter((p) => p.weaponType !== 'TOOL');
const toolPrefabs = (prefabs?.prefabs || []).filter((p) => p.weaponType === 'TOOL');

const itemTypes = {};
for (const it of items?.items || []) {
  const t = it.type || 'unknown';
  itemTypes[t] = (itemTypes[t] || 0) + 1;
}

const out = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  game: 'grudge-warlords',
  description: 'Canonical item authority map — every Warlords-era item category, UUID prefix, and runtime status',
  startHere: `${CDN}/games-library.json`,
  equipmentPattern: `${CDN}/_meta/canonical-equipment-pattern.json`,

  resolutionOrder: [
    'master-weapon-prefabs.json (equipped weapons + tools — runtime prefab)',
    'master-items.json (weapons + armor + consumables catalog)',
    'master-materials.json / master-relics.json / master-enchants.json (stackables & mods)',
    'master-registry.json (UUID index fallback)',
  ],

  uuidPrefixes: registry?.prefixes || {
    ITEM: 'Weapons, armor, T0 starters',
    FOOD: 'Chef food buffs',
    POTN: 'Alchemist potions',
    MATL: 'Harvest / craft materials',
    RECP: 'Recipes',
    RELC: 'Relics',
    ENCH: 'Enchantments',
    INFU: 'Infusions',
    ARTF: 'Artifacts',
    BLDG: 'Island buildings',
    MNT: 'Mounts',
    SKIL: 'Weapon abilities',
    ATTR: 'Character attributes',
    ICON: 'Icon images on CDN',
  },

  categories: {
    combatWeapons: {
      status: 'live',
      authority: 'master-weapon-prefabs.json',
      designLayer: 'weapons.json',
      uuidPrefix: 'ITEM-*',
      count: combatPrefabs.length,
      notes: 'Runtime prefab — skills, assets, recipes, statConnections',
      url: `${CDN}/master-weapon-prefabs.json`,
    },
    harvestTools: {
      status: 'live',
      authority: 'master-weapon-prefabs.json',
      filter: 'weaponType === TOOL',
      uuidPrefix: 'ITEM-*',
      count: toolPrefabs.length,
      harvestNodes: `${CDN}/master-harvest-nodes.json`,
      url: `${CDN}/master-weapon-prefabs.json`,
    },
    armor: {
      status: 'catalog-live',
      runtimePrefab: 'planned',
      authority: 'master-armor.json',
      aggregatedIn: 'master-items.json',
      designLayer: 'armor.json',
      uuidPrefix: 'ITEM-*',
      count: armor?.total || len(armor?.items),
      targetPrefab: 'master-armor-prefabs.json',
      url: `${CDN}/master-armor.json`,
    },
    consumables: {
      status: 'live',
      authority: 'master-consumables.json',
      aggregatedIn: 'master-items.json',
      designLayer: 'consumables.json',
      uuidPrefixes: ['FOOD-*', 'POTN-*', 'CONS-*'],
      count: consumables?.total || len(consumables?.items),
      byType: {
        food: (consumables?.items || []).filter((i) => i.type === 'food').length,
        potion: (consumables?.items || []).filter((i) => i.type === 'potion').length,
        consumable: (consumables?.items || []).filter((i) => i.type === 'consumable').length,
      },
      url: `${CDN}/master-consumables.json`,
    },
    materials: {
      status: 'live',
      authority: 'master-materials.json',
      designLayer: 'materials.json',
      uuidPrefix: 'MATL-*',
      count: materials?.total || len(materials?.materials),
      harvestGraph: 'master-harvest-nodes.json → materialUuid → master-recipes.json',
      url: `${CDN}/master-materials.json`,
    },
    recipes: {
      status: 'live',
      authority: 'master-recipes.json',
      uuidPrefix: 'RECP-*',
      count: recipes?.totalRecipes || len(recipes?.recipes),
      url: `${CDN}/master-recipes.json`,
    },
    relics: {
      status: 'live',
      authority: 'master-relics.json',
      uuidPrefix: 'RELC-*',
      count: relics?.total || len(relics?.relics) || len(relics?.items),
      url: `${CDN}/master-relics.json`,
    },
    enchants: {
      status: 'live',
      authority: 'master-enchants.json',
      uuidPrefix: 'ENCH-*',
      count: enchants?.total || len(enchants?.enchants),
      bridge: 'ummorpg-systems-bridge.json',
      url: `${CDN}/master-enchants.json`,
    },
    infusions: {
      status: 'live',
      authority: 'master-infusions.json',
      uuidPrefix: 'INFU-*',
      count: infusions?.total || len(infusions?.infusions),
      url: `${CDN}/master-infusions.json`,
    },
    artifacts: {
      status: 'live',
      authority: 'master-artifacts.json',
      uuidPrefix: 'ARTF-*',
      count: artifacts?.total || len(artifacts?.artifacts),
      url: `${CDN}/master-artifacts.json`,
    },
    buildings: {
      status: 'live',
      authority: 'master-buildings.json',
      uuidPrefix: 'BLDG-*',
      count: len(buildings?.buildings),
      url: `${CDN}/master-buildings.json`,
    },
    mounts: {
      status: 'live',
      authority: 'master-mounts.json',
      uuidPrefix: 'MNT-*',
      count: len(mounts?.mounts),
      url: `${CDN}/master-mounts.json`,
    },
    harvestNodes: {
      status: 'live',
      authority: 'master-harvest-nodes.json',
      count: harvest?.totalNodes || len(harvest?.nodes),
      url: `${CDN}/master-harvest-nodes.json`,
    },
  },

  aggregates: {
    masterItems: {
      url: `${CDN}/master-items.json`,
      total: items?.totalItems || len(items?.items),
      byType: itemTypes,
    },
    masterRegistry: {
      url: `${CDN}/master-registry.json`,
      total: registry?.totalEntries || Object.keys(registry?.entries || {}).length,
    },
    weaponPrefabs: {
      total: prefabs?.total || len(prefabs?.prefabs),
      withSkills: (prefabs?.prefabs || []).filter((p) => p.skills?.skillUuids?.length > 0).length,
      withRecipes: (prefabs?.prefabs || []).filter((p) => p.recipeUuid).length,
    },
  },

  pipelines: {
    weaponsAndTools: 'npm run build:weapon-pipeline',
    allItems: 'npm run consolidate:items && npm run build:canonical-items',
    validate: 'npm run audit:canonical-items',
  },

  status: pattern?.status || {},
  deprecated: pattern?.deprecated || {},
};

writeFileSync(join(API, 'canonical-items-manifest.json'), JSON.stringify(out, null, 2));
console.log(`Built canonical-items-manifest.json — ${Object.keys(out.categories).length} categories`);