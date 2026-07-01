#!/usr/bin/env node
/**
 * Enrich master-weaponSkills.json — UUIDs for nested off-hand skills,
 * resourceCost defaults, castTime backfill hints.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');
const OUT = join(API, 'master-weaponSkills.json');

function synthUuid(skillId, weaponType) {
  const hash = createHash('sha1').update(`${weaponType}:${skillId}`).digest('hex').slice(0, 12).toUpperCase();
  return `SKIL-20260630-${hash.slice(0, 6)}-${hash.slice(6)}`;
}

function enrichSkill(skill, weaponType, defaults) {
  const next = { ...skill };
  if (!next.uuid) next.uuid = synthUuid(next.id || next.name, weaponType);
  if (next.castTime === undefined) next.castTime = defaults.castTime ?? null;
  if (!next.resourceCost) {
    next.resourceCost = {
      mana: defaults.mana ?? 0,
      stamina: defaults.stamina ?? 0,
    };
  }
  return next;
}

function walkSlots(slots, weaponType, defaults) {
  return (slots || []).map((slot) => ({
    ...slot,
    skills: (slot.skills || []).map((sk) => enrichSkill(sk, weaponType, defaults)),
  }));
}

const data = JSON.parse(readFileSync(OUT, 'utf8'));
let addedUuids = 0;
let addedResource = 0;

for (const wt of data.weaponTypes || []) {
  const defaults = {
    castTime: ['WAND', 'STAFF', 'MACE', 'SCYTHE', 'GREATSWORD', 'GREATAXE', 'SPEAR', 'GUN'].includes(wt.id) ? 0 : null,
    mana: ['STAFF', 'WAND', 'TOME', 'MACE'].includes(wt.id) ? 5 : 0,
    stamina: ['SWORD', 'AXE', 'DAGGER', 'HAMMER', 'BOW', 'CROSSBOW', 'GUN', 'GREATSWORD', 'GREATAXE', 'SPEAR', 'SCYTHE'].includes(wt.id) ? 3 : 0,
  };

  if (wt.slots) {
    const before = JSON.stringify(wt);
    wt.slots = walkSlots(wt.slots, wt.id, defaults);
    if (!before.includes('"uuid"') && JSON.stringify(wt).includes('"uuid"')) addedUuids++;
  }

  if (wt.shieldTypes) {
    for (const [key, st] of Object.entries(wt.shieldTypes)) {
      st.slots = walkSlots(st.slots, `SHIELD_${key}`, { mana: 0, stamina: 4 });
    }
  }

  if (wt.couplingModes) {
    for (const [key, mode] of Object.entries(wt.couplingModes)) {
      mode.slots = walkSlots(mode.slots, `TOME_${key}`, { mana: 8, stamina: 0 });
    }
  }
}

for (const aw of data.artifactWeapons || []) {
  if (aw.slots) aw.slots = walkSlots(aw.slots, aw.id, { mana: 0, stamina: 5 });
}

data.enriched = new Date().toISOString();
data.enrichmentNote = 'UUIDs + resourceCost added by enrich-weapon-skills.mjs';

writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(`Enriched ${OUT}`);
console.log('  Re-run: npm run build:weapon-pipeline');