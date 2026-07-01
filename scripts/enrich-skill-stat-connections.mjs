#!/usr/bin/env node
/**
 * Enrich master-weaponSkills.json — statConnections per SKIL-* (attributes + derived stats).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAttributeIndex,
  inferSkillStatConnections,
} from './lib/stat-connections.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');

function loadMeta() {
  try {
    return JSON.parse(readFileSync(join(API, '_meta', 'ability-aliases.json'), 'utf8'));
  } catch {
    return { primaryStatToAttribute: {} };
  }
}

function enrichSkill(skill, weaponType, slotType, primaryStatMap) {
  const conn = inferSkillStatConnections({ ...skill, _slotType: slotType }, weaponType, primaryStatMap);
  return { ...skill, statConnections: conn };
}

function walkSlots(slots, weaponType, primaryStatMap) {
  return (slots || []).map((slot) => ({
    ...slot,
    skills: (slot.skills || []).map((sk) => enrichSkill(sk, weaponType, slot.type, primaryStatMap)),
  }));
}

const data = JSON.parse(readFileSync(join(API, 'master-weaponSkills.json'), 'utf8'));
const attrs = JSON.parse(readFileSync(join(API, 'master-attributes.json'), 'utf8'));
const meta = loadMeta();
const attrIndex = buildAttributeIndex(attrs);
const primaryStatMap = meta.primaryStatToAttribute || {};

let enriched = 0;

for (const wt of data.weaponTypes || []) {
  if (wt.slots) wt.slots = walkSlots(wt.slots, wt.id, primaryStatMap);
  if (wt.starterSlots) wt.starterSlots = walkSlots(wt.starterSlots, wt.id, primaryStatMap);
  if (wt.shieldTypes) {
    for (const st of Object.values(wt.shieldTypes)) {
      st.slots = walkSlots(st.slots, 'SHIELD', primaryStatMap);
    }
  }
  if (wt.couplingModes) {
    for (const mode of Object.values(wt.couplingModes)) {
      mode.slots = walkSlots(mode.slots, 'TOME', primaryStatMap);
    }
  }
  enriched += (wt.slots || []).flatMap((s) => s.skills).length;
  enriched += (wt.starterSlots || []).flatMap((s) => s.skills).length;
}

for (const aw of data.artifactWeapons || []) {
  if (aw.slots) aw.slots = walkSlots(aw.slots, aw.id, primaryStatMap);
}

data.statConnectionsEnriched = new Date().toISOString();
data.statConnectionsMeta = {
  attributes: 'master-attributes.json',
  primaryStatMap: '_meta/ability-aliases.json → primaryStatToAttribute',
  attributeCount: attrs.totalAttributes || attrIndex.byAbbrev.length,
};

writeFileSync(join(API, 'master-weaponSkills.json'), JSON.stringify(data, null, 2));
console.log(`Enriched statConnections on ~${enriched} skills → master-weaponSkills.json`);