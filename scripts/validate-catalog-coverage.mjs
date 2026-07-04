#!/usr/bin/env node
/**
 * Verify GRUDGE Item Database sources cover master-registry + expected counts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API = path.join(ROOT, 'api', 'v1');

const SOURCES = [
  { file: 't0-weapons.json', key: 'weapons', defaultType: 'weapon' },
  { file: 'master-weapons.json', key: 'items', defaultType: 'weapon' },
  { file: 'master-armor.json', key: 'items', defaultType: 'armor' },
  { file: 'master-consumables.json', key: 'items' },
  { file: 'master-materials.json', key: 'materials', defaultType: 'material' },
  { file: 'master-relics.json', key: 'relics', defaultType: 'relic' },
  { file: 'master-enchants.json', key: 'enchants', defaultType: 'enchant' },
  { file: 'master-infusions.json', key: 'infusions', defaultType: 'infusion' },
  { file: 'master-artifacts.json', key: 'artifacts', defaultType: 'artifact' },
  { file: 'master-recipes.json', key: 'recipes', defaultType: 'recipe' },
  { file: 'master-spellRecipes.json', key: 'recipes', defaultType: 'spell-recipe' },
  { file: 'master-buildings.json', key: 'buildings', defaultType: 'building' },
  { file: 'master-mounts.json', key: 'mounts', defaultType: 'mount' },
];

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(API, name), 'utf8'));
}

function itemType(item, fallback) {
  return item.type || fallback || 'unknown';
}

const catalogUuids = new Set();
const byType = {};
let total = 0;

for (const src of SOURCES) {
  const data = load(src.file);
  if (data.deprecated || data.archived) continue;
  const rows = data[src.key] || [];
  for (const row of rows) {
    const uuid = row.uuid || row.id;
    if (!uuid) continue;
    catalogUuids.add(uuid);
    const t = src.defaultType || itemType(row);
    byType[t] = (byType[t] || 0) + 1;
    total++;
  }
}

const registry = load('master-registry.json');
const missing = [];
for (const [uuid, entry] of Object.entries(registry.entries || {})) {
  if (!catalogUuids.has(uuid)) missing.push({ uuid, type: entry.type, name: entry.name });
}

const report = {
  generated: new Date().toISOString(),
  catalogTotal: total,
  catalogUnique: catalogUuids.size,
  byType,
  registryTotal: registry.totalEntries,
  registryMissing: missing.length,
  missing,
  consumables: {
    food: byType.food || 0,
    potion: byType.potion || 0,
    engineer: byType.consumable || 0,
    sum: (byType.food || 0) + (byType.potion || 0) + (byType.consumable || 0),
  },
  recipes: (byType.recipe || 0) + (byType['spell-recipe'] || 0),
  ok: missing.length === 0,
};

const outDir = path.join(API, '_audit');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'catalog-coverage.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  ok: report.ok,
  catalogTotal: report.catalogTotal,
  registryMissing: report.registryMissing,
  byType: report.byType,
  consumables: report.consumables,
  recipes: report.recipes,
}, null, 2));

if (!report.ok) {
  console.error('Missing from catalog:', missing.slice(0, 10).map((m) => `${m.type}: ${m.name}`).join(', '));
  process.exit(1);
}