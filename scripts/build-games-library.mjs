#!/usr/bin/env node
/**
 * Build unified games-library.json — single entry point for runtime prefabs + economy graph.
 * Run after build:weapon-prefabs (included in build:weapon-pipeline).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');
const CDN_JSON = 'https://molochdagod.github.io/ObjectStore/api/v1';
const CDN_ASSETS = 'https://assets.grudge-studio.com';

function load(name) {
  return JSON.parse(readFileSync(join(API, name), 'utf8'));
}

const prefabs = load('master-weapon-prefabs.json');
const harvest = load('master-harvest-nodes.json');
const recipes = load('master-recipes.json');
const enchants = load('master-enchants.json');
const pattern = load('_meta/canonical-equipment-pattern.json');

const combatPrefabs = prefabs.prefabs.filter((p) => p.weaponType !== 'TOOL');
const toolPrefabs = prefabs.prefabs.filter((p) => p.weaponType === 'TOOL');
const t0Prefabs = prefabs.prefabs.filter((p) => p.tier === 0);

const byType = {};
for (const p of prefabs.prefabs) {
  byType[p.weaponType] = (byType[p.weaponType] || 0) + 1;
}

const withRecipes = prefabs.prefabs.filter((p) => p.recipeUuid).length;
const withSkills = prefabs.prefabs.filter((p) => p.skills?.skillUuids?.length > 0).length;
const withHarvestProfile = toolPrefabs.filter((p) => p.skills?.harvestProfile?.nodes?.length > 0).length;

const out = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  description: 'Grudge Studio games library — runtime equipment prefabs and economy wiring',
  canonical: true,
  assetCdn: CDN_ASSETS,
  staticApi: CDN_JSON,
  workerApi: 'https://objectstore.grudge-studio.com/api/v1',
  d1: {
    database: prefabs.d1Database || 'objectstore-meta',
    table: prefabs.d1Table || 'weapon_prefabs',
    seed: 'workers/seed/weapon-prefabs.sql',
  },
  runtime: {
    weaponPrefabs: `${CDN_JSON}/master-weapon-prefabs.json`,
    t0Weapons: `${CDN_JSON}/t0-weapons.json`,
    weaponSkills: `${CDN_JSON}/master-weaponSkills.json`,
    ummorpgBridge: `${CDN_JSON}/ummorpg-systems-bridge.json`,
    registry: `${CDN_JSON}/master-registry.json`,
    harvestNodes: `${CDN_JSON}/master-harvest-nodes.json`,
    recipes: `${CDN_JSON}/master-recipes.json`,
    materials: `${CDN_JSON}/master-materials.json`,
    enchants: `${CDN_JSON}/master-enchants.json`,
    attributes: `${CDN_JSON}/master-attributes.json`,
    weaponStatBridge: `${CDN_JSON}/weapon-stat-bridge.json`,
    statPattern: `${CDN_JSON}/_meta/weapon-stats-attributes.json`,
    equipmentPattern: `${CDN_JSON}/_meta/canonical-equipment-pattern.json`,
    manifest: `${CDN_JSON}/game-data-manifest.json`,
    archive: `${CDN_JSON}/archive/manifest.json`,
  },
  design: {
    weapons: `${CDN_JSON}/weapons.json`,
    note: 'Design templates only — abilities/passives for editors, not runtime ITEM-*',
  },
  counts: {
    prefabs: prefabs.total,
    combatWeapons: combatPrefabs.length,
    harvestTools: toolPrefabs.length,
    t0Starters: t0Prefabs.length,
    withSkills,
    withRecipes,
    toolsWithHarvestProfile: withHarvestProfile,
    recipes: recipes.totalRecipes || recipes.recipes?.length || 0,
    harvestNodes: harvest.totalNodes || harvest.nodes?.length || 0,
    enchants: enchants.enchants?.length || enchants.total || 0,
    byWeaponType: byType,
  },
  loadOrder: [
    'games-library.json',
    'master-attributes.json',
    'master-weapon-prefabs.json',
    'master-weaponSkills.json',
    'weapon-stat-bridge.json',
    'master-harvest-nodes.json',
    'master-recipes.json',
    'ummorpg-systems-bridge.json',
  ],
  sdk: {
    primary: 'getWeaponPrefabs()',
    designOnly: 'getWeapons()',
    harvest: 'getHarvestNodes()',
    init: 'GameDataClient.init() + loadGamesLibrary()',
  },
  status: pattern.status || {},
  deprecated: pattern.deprecated || {},
};

writeFileSync(join(API, 'games-library.json'), JSON.stringify(out, null, 2));
console.log(`Built games-library.json — ${out.counts.prefabs} prefabs (${out.counts.combatWeapons} combat + ${out.counts.harvestTools} tools)`);