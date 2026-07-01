#!/usr/bin/env node
/**
 * Audit Grudge Warlords canonical item graph — prefabs ↔ master-items ↔ registry ↔ recipes.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = join(dirname(fileURLToPath(import.meta.url)), '..', 'api', 'v1');

function load(name) {
  return JSON.parse(readFileSync(join(API, name), 'utf8'));
}

const prefabs = load('master-weapon-prefabs.json');
const items = load('master-items.json');
const consumables = load('master-consumables.json');
const registry = load('master-registry.json');
const recipes = load('master-recipes.json');

const itemByUuid = new Map((items.items || []).map((i) => [i.uuid, i]));
const registryUuids = new Set(Object.keys(registry.entries || {}));
const recipeUuids = new Set((recipes.recipes || []).map((r) => r.uuid));

let errors = 0;
let warnings = 0;

function err(msg) {
  console.error(`  ✗ ${msg}`);
  errors += 1;
}
function warn(msg) {
  console.warn(`  ⚠ ${msg}`);
  warnings += 1;
}

console.log('Canonical Items Audit (Grudge Warlords)');
console.log('======================================');

// 1. Every prefab in master-items
const prefabMissingFromItems = [];
for (const p of prefabs.prefabs) {
  if (!itemByUuid.has(p.uuid)) prefabMissingFromItems.push(p.id || p.uuid);
}
if (prefabMissingFromItems.length) {
  warn(`${prefabMissingFromItems.length} prefabs missing from master-items.json`);
  if (prefabMissingFromItems.length <= 10) {
    prefabMissingFromItems.forEach((id) => warn(`    ${id}`));
  }
} else {
  console.log(`  ✓ All ${prefabs.prefabs.length} prefabs in master-items.json`);
}

// 2. Consumables fully aggregated
const consTypes = { food: 0, potion: 0, consumable: 0 };
for (const c of consumables.items || []) consTypes[c.type] = (consTypes[c.type] || 0) + 1;
const inMaster = { food: 0, potion: 0, consumable: 0 };
for (const i of items.items || []) {
  if (consTypes[i.type] != null) inMaster[i.type] = (inMaster[i.type] || 0) + 1;
}
for (const [t, n] of Object.entries(consTypes)) {
  if ((inMaster[t] || 0) < n) {
    err(`master-items missing ${n - (inMaster[t] || 0)} consumables of type "${t}"`);
  }
}
if (!errors) {
  console.log(`  ✓ Consumables aggregated (${consumables.items.length} in master-consumables)`);
}

// 3. Prefab recipe refs
let badRecipes = 0;
for (const p of prefabs.prefabs) {
  if (p.recipeUuid && !recipeUuids.has(p.recipeUuid)) badRecipes += 1;
}
if (badRecipes) warn(`${badRecipes} prefabs reference missing RECP-*`);
else console.log('  ✓ Prefab recipe UUIDs resolve');

// 4. Registry coverage for prefabs
let prefabNotInRegistry = 0;
for (const p of prefabs.prefabs) {
  if (!registryUuids.has(p.uuid)) prefabNotInRegistry += 1;
}
if (prefabNotInRegistry) warn(`${prefabNotInRegistry} prefabs not in master-registry.json`);
else console.log('  ✓ Prefabs indexed in master-registry.json');

// 5. Duplicate UUIDs in master-items
const seen = new Set();
let dupes = 0;
for (const i of items.items || []) {
  if (seen.has(i.uuid)) dupes += 1;
  seen.add(i.uuid);
}
if (dupes) err(`${dupes} duplicate UUIDs in master-items.json`);

console.log('\nSummary');
console.log(`  Prefabs: ${prefabs.prefabs.length}`);
console.log(`  master-items: ${items.items.length} (${JSON.stringify(
  (items.items || []).reduce((a, i) => { a[i.type] = (a[i.type] || 0) + 1; return a; }, {}),
)})`);
console.log(`  Registry: ${registryUuids.size}`);
console.log(`  Recipes: ${recipeUuids.size}`);
console.log(`  Errors: ${errors} · Warnings: ${warnings}`);

if (errors) process.exit(1);
console.log('\n✓ Canonical items audit passed');
process.exit(warnings ? 0 : 0);