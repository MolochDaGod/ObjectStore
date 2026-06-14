/**
 * Item Collections — Data Integrity Test Suite
 *
 * Validates master-relics, master-enchants, master-infusions, and master-artifacts
 * against the shapes expected by the worker's /v1/relics, /v1/enchants,
 * /v1/infusions, and /v1/artifacts endpoints.
 *
 * Run:  node tests/item-collections.test.cjs
 */

'use strict';

const path = require('path');

const relicsData    = require(path.join(__dirname, '..', 'api', 'v1', 'master-relics.json'));
const enchantsData  = require(path.join(__dirname, '..', 'api', 'v1', 'master-enchants.json'));
const infusionsData = require(path.join(__dirname, '..', 'api', 'v1', 'master-infusions.json'));
const artifactsData = require(path.join(__dirname, '..', 'api', 'v1', 'master-artifacts.json'));

// ── Test runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, id, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(`FAIL [${id}]: ${message}`);
  }
}

function assertField(obj, field, id, type) {
  const val = obj[field];
  if (type === 'string') {
    assert(typeof val === 'string' && val.length > 0, id, `"${field}" must be a non-empty string`);
  } else if (type === 'number') {
    assert(typeof val === 'number', id, `"${field}" must be a number`);
  }
}

// ── Shared validation helpers ────────────────────────────────────────────────

const VALID_TIER_LABELS = new Set([
  'Common', 'Uncommon', 'Rare', 'Epic', 'Heroic', 'Mythic', 'Ancient', 'Legendary',
  // Relics and enchants use "Divine" for T8 — pre-existing data; accepted here.
  'Divine',
]);

function validateBaseItem(item, id) {
  assertField(item, 'id',          id, 'string');
  assertField(item, 'name',        id, 'string');
  assertField(item, 'type',        id, 'string');
  assertField(item, 'description', id, 'string');
  assertField(item, 'iconUrl',     id, 'string');
  assert(typeof item.tier === 'number' || item.tier === null, id, '"tier" must be a number or null');
  if (item.tierLabel !== undefined) {
    assert(VALID_TIER_LABELS.has(item.tierLabel), id, `Unknown tierLabel "${item.tierLabel}"`);
  }
}

// ── Top-level dataset checks ─────────────────────────────────────────────────

function checkDatasetHeader(data, arrayKey, totalKey, label) {
  assert(Array.isArray(data[arrayKey]) && data[arrayKey].length > 0, label,
    `"${arrayKey}" must be a non-empty array`);
  const declared = data[totalKey] ?? data.total;
  assert(
    typeof declared === 'number' && declared === data[arrayKey].length,
    label,
    `Declared total (${declared}) doesn't match actual count (${data[arrayKey].length})`
  );
  assert(typeof data.version === 'string', label, 'Missing version field');
  assert(typeof data.generated === 'string', label, 'Missing generated timestamp');
}

// ════════════════════════════════════════════════════════════════════
//  master-relics.json
// ════════════════════════════════════════════════════════════════════

checkDatasetHeader(relicsData, 'relics', 'totalRelics', 'RELICS:HEADER');

const VALID_RELIC_CATEGORIES = new Set(relicsData.categories || []);

for (const relic of relicsData.relics) {
  const id = relic.id || relic.uuid || '(unknown)';
  validateBaseItem(relic, id);
  assert(relic.type === 'relic', id, `type must be "relic", got "${relic.type}"`);
  assert(relic.slot === 'relic', id, `slot must be "relic", got "${relic.slot}"`);
  assert(VALID_RELIC_CATEGORIES.size === 0 || VALID_RELIC_CATEGORIES.has(relic.category), id,
    `Unknown relic category "${relic.category}"`);
  assert(typeof relic.stats === 'object' && relic.stats !== null, id, 'Missing stats object');
  // uuid must follow RELC- prefix
  assert(typeof relic.uuid === 'string' && relic.uuid.startsWith('RELC-'), id,
    `uuid "${relic.uuid}" must start with "RELC-"`);
}

// No duplicate ids
const relicIds = relicsData.relics.map((r) => r.id);
const relicIdSet = new Set(relicIds);
assert(relicIdSet.size === relicIds.length, 'RELICS:HEADER', 'Duplicate relic ids found');

// ════════════════════════════════════════════════════════════════════
//  master-enchants.json
// ════════════════════════════════════════════════════════════════════

checkDatasetHeader(enchantsData, 'enchants', 'totalEnchants', 'ENCHANTS:HEADER');

for (const enchant of enchantsData.enchants) {
  const id = enchant.id || enchant.uuid || '(unknown)';
  validateBaseItem(enchant, id);
  assert(enchant.type === 'enchant', id, `type must be "enchant", got "${enchant.type}"`);
  // target field: "weapon", "armor", or pipe-separated like "weapon|armor"
  assert(typeof enchant.target === 'string' && enchant.target.length > 0, id,
    'Missing or empty "target" field');
  const validTargets = new Set(['weapon', 'armor']);
  for (const t of enchant.target.split('|')) {
    assert(validTargets.has(t.trim()), id, `Unknown enchant target "${t}"`);
  }
  assert(typeof enchant.effect === 'object' && enchant.effect !== null, id, 'Missing effect object');
  assertField(enchant.effect, 'stat',  id + '.effect', 'string');
  assert(typeof enchant.effect.value === 'number', id, 'effect.value must be a number');
  // uuid must follow ENCH- prefix
  assert(typeof enchant.uuid === 'string' && enchant.uuid.startsWith('ENCH-'), id,
    `uuid "${enchant.uuid}" must start with "ENCH-"`);
}

const enchantIds = enchantsData.enchants.map((e) => e.id);
assert(new Set(enchantIds).size === enchantIds.length, 'ENCHANTS:HEADER', 'Duplicate enchant ids found');

// ════════════════════════════════════════════════════════════════════
//  master-infusions.json
// ════════════════════════════════════════════════════════════════════

checkDatasetHeader(infusionsData, 'infusions', 'total', 'INFUSIONS:HEADER');

const VALID_INFUSION_SCOPES = new Set(['universal', 'profession']);

for (const infusion of infusionsData.infusions) {
  const id = infusion.id || infusion.uuid || '(unknown)';
  validateBaseItem(infusion, id);
  assert(infusion.type === 'infusion', id, `type must be "infusion", got "${infusion.type}"`);
  assert(VALID_INFUSION_SCOPES.has(infusion.scope), id,
    `Unknown scope "${infusion.scope}" — must be "universal" or "profession"`);
  if (infusion.scope === 'profession') {
    assert(typeof infusion.profession === 'string' && infusion.profession.length > 0, id,
      'Profession-scoped infusion must have a "profession" field');
  }
  assert(typeof infusion.iterationsGranted === 'number' && infusion.iterationsGranted > 0, id,
    '"iterationsGranted" must be a positive number');
  assert(infusion.consumedOnApply === true, id, '"consumedOnApply" must be true');
  // uuid must follow INFU- prefix
  assert(typeof infusion.uuid === 'string' && infusion.uuid.startsWith('INFU-'), id,
    `uuid "${infusion.uuid}" must start with "INFU-"`);
}

const infusionIds = infusionsData.infusions.map((i) => i.id);
assert(new Set(infusionIds).size === infusionIds.length, 'INFUSIONS:HEADER', 'Duplicate infusion ids found');

// ════════════════════════════════════════════════════════════════════
//  master-artifacts.json
// ════════════════════════════════════════════════════════════════════

checkDatasetHeader(artifactsData, 'artifacts', 'totalArtifacts', 'ARTIFACTS:HEADER');

const VALID_HANDEDNESS = new Set(['1h', '2h', 'offhand']);

for (const artifact of artifactsData.artifacts) {
  const id = artifact.uuid || artifact.name || '(unknown)';
  // Artifacts may omit 'id' field; name is always present
  assertField(artifact, 'name',        id, 'string');
  assertField(artifact, 'type',        id, 'string');
  assertField(artifact, 'description', id, 'string');
  // D3: category and type must both be 'artifact'
  assert(artifact.category === 'artifact', id, `category must be "artifact", got "${artifact.category}" (D3)`);
  assert(artifact.type     === 'artifact', id, `type must be "artifact", got "${artifact.type}" (D3)`);
  assert(artifact.classification === 'artifact', id,
    `classification must be "artifact", got "${artifact.classification}" (D3)`);
  // discovery field
  assert(typeof artifact.discovery === 'object' && artifact.discovery !== null, id, 'Missing discovery object');
  assert(typeof artifact.discovery.hiddenUntilFound === 'boolean', id,
    'discovery.hiddenUntilFound must be boolean (D3)');
  // handedness
  if (artifact.handedness !== undefined) {
    assert(VALID_HANDEDNESS.has(artifact.handedness), id,
      `Unknown handedness "${artifact.handedness}"`);
  }
  // uuid must follow ITEM- prefix
  assert(typeof artifact.uuid === 'string' && artifact.uuid.startsWith('ITEM-'), id,
    `uuid "${artifact.uuid}" must start with "ITEM-"`);
}

const artifactUuids = artifactsData.artifacts.map((a) => a.uuid);
assert(new Set(artifactUuids).size === artifactUuids.length, 'ARTIFACTS:HEADER', 'Duplicate artifact uuids found');

// ── Report ───────────────────────────────────────────────────────────────────

const separator = '='.repeat(60);
console.log('\n' + separator);
console.log('  Item Collections — Data Integrity Report');
console.log(separator);
console.log(`  Relics tested:    ${relicsData.relics.length}`);
console.log(`  Enchants tested:  ${enchantsData.enchants.length}`);
console.log(`  Infusions tested: ${infusionsData.infusions.length}`);
console.log(`  Artifacts tested: ${artifactsData.artifacts.length}`);
console.log(separator);
console.log(`  Passed:  ${passed}`);
console.log(`  Failed:  ${failed}`);
console.log(separator);

if (failures.length) {
  console.log('\nFAILURES:');
  failures.forEach((f) => console.log('  ' + f));
}

console.log('');
process.exit(failed > 0 ? 1 : 0);
