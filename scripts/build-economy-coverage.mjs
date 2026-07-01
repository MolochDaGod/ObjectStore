#!/usr/bin/env node
/**
 * Build economy achievability coverage — spider chart axes for Grudge Warlords product.
 * Harvest nodes → materials → recipes → craftable items.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = join(dirname(fileURLToPath(import.meta.url)), '..', 'api', 'v1');

function load(name) {
  return JSON.parse(readFileSync(join(API, name), 'utf8'));
}

const harvest = load('master-harvest-nodes.json');
const materials = load('master-materials.json');
const recipes = load('master-recipes.json');
const prefabs = load('master-weapon-prefabs.json');
const items = load('master-items.json');
const consumables = load('master-consumables.json');

const matList = materials.materials || [];
const matByUuid = new Map(matList.map((m) => [m.uuid, m]));
const recipeList = recipes.recipes || [];
const recipeByUuid = new Map(recipeList.map((r) => [r.uuid, r]));
const recipeByResult = new Map();
for (const r of recipeList) {
  if (r.resultItemId) recipeByResult.set(r.resultItemId, r);
}

const harvestableMatUuids = new Set();
const nodeGaps = [];

for (const node of harvest.nodes || []) {
  let nodeOk = false;
  for (const drop of node.drops || []) {
    if (drop.materialUuid) {
      harvestableMatUuids.add(drop.materialUuid);
      const hasRecipe = (drop.recipeUuids || []).some((id) => recipeByUuid.has(id));
      if (hasRecipe) nodeOk = true;
    }
  }
  if (!nodeOk) nodeGaps.push(node.id || node.name);
}

const t0MatUuids = new Set(matList.filter((m) => (m.tier ?? 0) === 0).map((m) => m.uuid));
const obtainableMats = new Set([...harvestableMatUuids, ...t0MatUuids]);

function recipeInputsObtainable(recipe) {
  const mats = recipe.materials || [];
  if (!mats.length) return false;
  return mats.every((m) => obtainableMats.has(m.uuid) || t0MatUuids.has(m.uuid));
}

let recipesFullChain = 0;
const recipeGaps = [];
for (const r of recipeList) {
  if (recipeInputsObtainable(r)) recipesFullChain++;
  else if (recipeGaps.length < 25) recipeGaps.push(r.name || r.uuid);
}

const combatWeapons = prefabs.prefabs.filter((p) => p.weaponType && p.weaponType !== 'TOOL');
const tools = prefabs.prefabs.filter((p) => p.weaponType === 'TOOL');

let craftableWeapons = 0;
let starterWeapons = 0;
for (const p of combatWeapons) {
  if ((p.tier ?? 0) === 0) starterWeapons++;
  if (!p.recipeUuid) continue;
  const rec = recipeByUuid.get(p.recipeUuid);
  if (rec && recipeInputsObtainable(rec)) craftableWeapons++;
}

let craftableTools = 0;
for (const p of tools) {
  if (p.harvestProfile || p.gather) craftableTools++;
  else if (p.recipeUuid) {
    const rec = recipeByUuid.get(p.recipeUuid);
    if (rec && recipeInputsObtainable(rec)) craftableTools++;
  }
}

const consList = consumables.items || [];
let craftableConsumables = 0;
for (const c of consList) {
  const rec = recipeByResult.get(c.uuid);
  if (rec && recipeInputsObtainable(rec)) craftableConsumables++;
}

const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

const spider = {
  harvestMaterials: pct(harvestableMatUuids.size, matList.length),
  obtainableMaterials: pct(obtainableMats.size, matList.length),
  recipeChain: pct(recipesFullChain, recipeList.length),
  craftableWeapons: pct(craftableWeapons, Math.max(combatWeapons.length - starterWeapons, 1)),
  harvestTools: pct(craftableTools, tools.length),
  craftableFood: pct(craftableConsumables, consList.length),
  harvestNodesLive: pct((harvest.nodes || []).length - nodeGaps.length, (harvest.nodes || []).length || 1),
};

const output = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  product: 'grudge-warlords',
  description: 'Economy achievability — can players gather → craft → equip?',
  spider,
  counts: {
    materials: matList.length,
    harvestableMaterials: harvestableMatUuids.size,
    obtainableMaterials: obtainableMats.size,
    recipes: recipeList.length,
    recipesFullChain,
    combatWeapons: combatWeapons.length,
    craftableWeapons,
    tools: tools.length,
    craftableTools,
    consumables: consList.length,
    craftableConsumables,
    harvestNodes: (harvest.nodes || []).length,
    harvestNodesWithRecipeChain: (harvest.nodes || []).length - nodeGaps.length,
  },
  gaps: {
    harvestNodesMissingRecipeChain: nodeGaps.slice(0, 20),
    sampleUnachievableRecipes: recipeGaps.slice(0, 15),
  },
  ui: 'docs/economy-spider.html',
};

writeFileSync(join(API, 'economy-coverage.json'), JSON.stringify(output, null, 2) + '\n');
console.log('economy-coverage.json');
console.log('Spider axes:', JSON.stringify(spider, null, 2));