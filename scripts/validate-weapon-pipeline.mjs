#!/usr/bin/env node
/**
 * Audit canonical weapon pipeline — prefabs, skills, T0, cast times, attribute links.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');

function load(name) {
  return JSON.parse(readFileSync(join(API, name), 'utf8'));
}

const prefabs = load('master-weapon-prefabs.json');
const t0 = load('t0-weapons.json');
const skills = load('master-weaponSkills.json');
const aliases = load('_meta/ability-aliases.json');

const issues = [];
const warnings = [];

const t0Expected = t0.total ?? t0.weapons?.length ?? 15;
const t0Actual = prefabs.prefabs.filter((p) => p.tier === 0).length;
if (t0Actual !== t0Expected) {
  issues.push(`T0 count mismatch: expected ${t0Expected}, got ${t0Actual}`);
}

const uuids = prefabs.prefabs.map((p) => p.uuid);
const dupes = uuids.filter((u, i) => uuids.indexOf(u) !== i);
if (dupes.length) issues.push(`Duplicate prefab UUIDs: ${[...new Set(dupes)].join(', ')}`);

function prefabHasSkills(p) {
  if (p.skills.skillUuids?.length) return true;
  return (p.skills.slots || []).some((s) => s.skillIds?.length > 0);
}

const noSkills = prefabs.prefabs.filter(
  (p) => !prefabHasSkills(p) && p.weaponType !== 'TOOL' && p.tier > 0,
);
if (noSkills.length) {
  const byType = {};
  noSkills.forEach((p) => {
    byType[p.weaponType] = (byType[p.weaponType] || 0) + 1;
  });
  issues.push(`T1+ prefabs without SKIL-* bindings: ${noSkills.length} (${JSON.stringify(byType)})`);
}

const t0NoSkills = prefabs.prefabs.filter((p) => p.tier === 0 && !prefabHasSkills(p) && p.weaponType !== 'TOOL');
if (t0NoSkills.length) {
  warnings.push(`T0 starters without skills: ${t0NoSkills.map((p) => p.name).join(', ')}`);
}

const noAffinity = prefabs.prefabs.filter((p) => p.primaryStat && !p.attributeAffinity?.primary);
if (noAffinity.length) {
  warnings.push(`${noAffinity.length} prefabs with unmapped primaryStat → attribute`);
}

let skillRows = 0;
let castSet = 0;
for (const wt of skills.weaponTypes || []) {
  for (const slot of wt.slots || []) {
    for (const sk of slot.skills || []) {
      skillRows++;
      if (sk.castTime != null) castSet++;
    }
  }
}
const castPct = skillRows ? Math.round((castSet / skillRows) * 100) : 0;
if (castPct < 30) {
  warnings.push(`Cast time coverage low: ${castSet}/${skillRows} (${castPct}%)`);
}

const manaSkills = [];
for (const wt of skills.weaponTypes || []) {
  for (const slot of wt.slots || []) {
    for (const sk of slot.skills || []) {
      if (sk.manaCost != null || sk.resourceCost != null) manaSkills.push(sk.name);
    }
  }
}
if (!manaSkills.length) {
  warnings.push('master-weaponSkills.json has no manaCost/resourceCost fields — run enrich-weapon-skills.mjs');
}

console.log('Weapon Pipeline Validation');
console.log('==========================');
console.log(`Prefabs: ${prefabs.total}`);
console.log(`T0: ${t0Actual} (expected ${t0Expected})`);
console.log(`With skills: ${prefabs.totals?.withSkills ?? 'n/a'}`);
console.log(`T1+ missing skills: ${noSkills.length}`);
console.log(`TOOLS (gather, no combat skills): ${prefabs.prefabs.filter((p) => p.weaponType === 'TOOL').length}`);
console.log(`Cast times: ${castSet}/${skillRows} (${castPct}%)`);
console.log(`Alias map types: ${Object.keys(aliases.byWeaponType || {}).length}`);

if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (issues.length) {
  console.log('\nIssues:');
  issues.forEach((i) => console.log(`  ✗ ${i}`));
  process.exit(1);
}

console.log('\n✓ Pipeline validation passed');
process.exit(0);