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
const loadoutPattern = load('_meta/weapon-loadout-pattern.json');

const issues = [];
const warnings = [];

const OFFHAND_TYPES = ['SHIELD', 'TOME'];
const EXPECTED_INJECT = ['primary', 'secondary', 'ability'];

for (const typeId of OFFHAND_TYPES) {
  const wt = skills.weaponTypes?.find((w) => w.id === typeId);
  if (!wt) {
    issues.push(`Off-hand type missing from master-weaponSkills.json: ${typeId}`);
    continue;
  }
  const mech = wt.mechanic || {};
  if (mech.toggleKey !== loadoutPattern.toggleKey) {
    issues.push(`${typeId} toggleKey must be "${loadoutPattern.toggleKey}", got "${mech.toggleKey || 'none'}"`);
  }
  const affected = mech.affectedSlots || [];
  const affectedOk =
    affected.length === EXPECTED_INJECT.length &&
    EXPECTED_INJECT.every((s) => affected.includes(s)) &&
    !affected.includes('ultimate');
  if (!affectedOk) {
    issues.push(`${typeId} affectedSlots must be [primary, secondary, ability] only — got ${JSON.stringify(affected)}`);
  }
  if (!mech.doesNotAffectSlot4 || !mech.doesNotAffectSlot5) {
    issues.push(`${typeId} must set doesNotAffectSlot4 and doesNotAffectSlot5`);
  }
}

const sampleMain = prefabs.prefabs.find((p) => p.weaponType === 'SWORD' && p.tier >= 1);
const sampleShield = prefabs.prefabs.find((p) => p.weaponType === 'SHIELD');
const sampleTome = prefabs.prefabs.find((p) => p.weaponType === 'TOME');
if (sampleMain && sampleMain.loadout?.offhandModifier?.toggleKey !== loadoutPattern.toggleKey) {
  issues.push('Mainhand prefab missing loadout.offhandModifier.toggleKey=F (rebuild prefabs)');
}
for (const sample of [sampleShield, sampleTome]) {
  if (!sample) continue;
  if (sample.tier === 0) {
    if (sample.loadout?.pattern !== 'three-slot-starter' && sample.weaponType === 'TOME') {
      issues.push('T0 TOME prefab must use three-slot-starter loadout');
    }
    continue;
  }
  if (!sample.loadout?.whenToggleActive) {
    issues.push(`${sample.weaponType} T1+ prefab missing loadout.whenToggleActive (rebuild prefabs)`);
  }
}

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

const badT0Starter = prefabs.prefabs.filter((p) => {
  if (p.tier !== 0 || p.weaponType === 'TOOL') return false;
  if (p.skills.slotPattern !== 'three-slot-starter') return true;
  const slots = p.skills.slots || [];
  if (slots.length !== 3) return true;
  const prim = slots.find((s) => s.type === 'primary');
  const sec = slots.find((s) => s.type === 'secondary');
  const abil = slots.find((s) => s.type === 'ability');
  if (!prim || prim.skillIds?.length !== 1) return true;
  if (!sec || sec.skillIds?.length !== 1) return true;
  if (!abil || (abil.skillIds?.length || 0) < 2) return true;
  return false;
});
if (badT0Starter.length) {
  issues.push(
    `T0 starters need three-slot-starter (1+1+2+ skills): ${badT0Starter.length} wrong (e.g. ${badT0Starter.slice(0, 3).map((p) => p.name).join(', ')})`,
  );
}

const badSlot1 = prefabs.prefabs.filter((p) => {
  if (p.tier < 1 || p.weaponType === 'TOOL') return false;
  const prim = p.skills.slots?.find((s) => s.type === 'primary');
  return !prim || prim.skillIds?.length !== 1;
});
if (badSlot1.length) {
  issues.push(
    `Slot 1 must be exactly 1 standard attack: ${badSlot1.length} prefabs wrong (e.g. ${badSlot1.slice(0, 3).map((p) => p.name).join(', ')})`,
  );
}

const noFiveSlot = prefabs.prefabs.filter(
  (p) => p.tier >= 1 && p.weaponType !== 'TOOL' && p.skills.slotPattern !== 'five-slot',
);
if (noFiveSlot.length) {
  warnings.push(`${noFiveSlot.length} T1+ prefabs missing slotPattern=five-slot (rebuild prefabs)`);
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
function normSigName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const sigMismatches = prefabs.prefabs.filter((p) => {
  if (p.tier < 1 || p.weaponType === 'TOOL') return false;
  const ult = p.skills.slots?.find((s) => s.type === 'ultimate');
  const expected = parseAbilityName(p.signature);
  if (!expected || !ult?.signature) return false;
  return normSigName(ult.signature) !== normSigName(expected);
});
if (sigMismatches.length > 20) {
  warnings.push(
    `Slot 4 signature mismatches: ${sigMismatches.length} (e.g. ${sigMismatches.slice(0, 2).map((p) => `${p.name}: want ${parseAbilityName(p.signature)}, got ${p.skills.slots?.find((s) => s.type === 'ultimate')?.signature}`).join('; ')})`,
  );
}

function parseAbilityName(str) {
  if (!str) return null;
  return String(str).replace(/\s*\([^)]*\)\s*/g, ' ').trim().split(/\s{2,}/)[0].trim() || null;
}

console.log(`Slot 1 wrong (not exactly 1 attack): ${badSlot1.length}`);
console.log(`Slot 4 signature mismatches: ${sigMismatches.length}`);
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