#!/usr/bin/env node
/**
 * Build weapon-stat-bridge.json — canonical graph linking prefabs, SKIL-*, attributes, derived stats.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAttributeIndex,
  buildPrefabStatConnections,
  CANONICAL_ATTRIBUTES,
  DAMAGE_TYPE_SCALING,
  WEAPON_STAT_FIELDS,
  WEAPON_TYPE_PRIMARY_ATTR,
} from './lib/stat-connections.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');
const CDN = 'https://molochdagod.github.io/ObjectStore/api/v1';

function load(name) {
  return JSON.parse(readFileSync(join(API, name), 'utf8'));
}

const attributes = load('master-attributes.json');
const skills = load('master-weaponSkills.json');
const prefabs = load('master-weapon-prefabs.json');
const aliases = JSON.parse(readFileSync(join(API, '_meta', 'ability-aliases.json'), 'utf8'));

const attrIndex = buildAttributeIndex(attributes);
const primaryStatMap = aliases.primaryStatToAttribute || {};

const skillPool = [];
for (const wt of skills.weaponTypes || []) {
  for (const slot of [...(wt.slots || []), ...(wt.starterSlots || [])]) {
    for (const sk of slot.skills || []) skillPool.push({ ...sk, _weaponType: wt.id });
  }
  if (wt.shieldTypes) {
    for (const st of Object.values(wt.shieldTypes)) {
      for (const slot of st.slots || []) {
        for (const sk of slot.skills || []) skillPool.push({ ...sk, _weaponType: 'SHIELD' });
      }
    }
  }
  if (wt.couplingModes) {
    for (const mode of Object.values(wt.couplingModes)) {
      for (const slot of mode.slots || []) {
        for (const sk of slot.skills || []) skillPool.push({ ...sk, _weaponType: 'TOME' });
      }
    }
  }
}

const prefabSamples = {};
for (const p of prefabs.prefabs.slice(0, 5)) {
  prefabSamples[p.weaponType] = buildPrefabStatConnections(p, skillPool, attrIndex, primaryStatMap);
}

const out = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  description: 'Canonical connections — weapon stats, SKIL-*, 8 attributes, 37 derived stats',
  endpoints: {
    attributes: `${CDN}/master-attributes.json`,
    weaponSkills: `${CDN}/master-weaponSkills.json`,
    weaponPrefabs: `${CDN}/master-weapon-prefabs.json`,
    primaryStatMap: `${CDN}/_meta/ability-aliases.json`,
    statPattern: `${CDN}/_meta/weapon-stats-attributes.json`,
  },
  attributes: {
    count: attributes.totalAttributes || 8,
    abbreviations: CANONICAL_ATTRIBUTES,
    index: Object.fromEntries(
      CANONICAL_ATTRIBUTES.map((abbr) => {
        const a = attrIndex.byAbbrev[abbr];
        return [abbr, a ? { uuid: a.uuid, id: a.id, name: a.name, role: a.role } : null];
      }),
    ),
  },
  derivedStats: {
    count: attributes.totalDerivedStats || 37,
    combatFormulas: attributes.combatFormulas || {},
    statCaps: attributes.statCaps || {},
    allocation: attributes.allocation || {},
  },
  weaponStatSchema: WEAPON_STAT_FIELDS,
  primaryStatToAttribute: primaryStatMap,
  damageTypeScaling: DAMAGE_TYPE_SCALING,
  weaponTypePrimaryAttribute: WEAPON_TYPE_PRIMARY_ATTR,
  graph: {
    prefabToStats: 'prefab.stats.{damage,speed,crit,block,defense,combo} → derived stats',
    prefabToAttributes: 'prefab.primaryStat → primaryStatToAttribute → ATTR-* uuid',
    skillToAttributes: 'SKIL-*.statConnections.scalesWith → STR|DEX|INT|…',
    skillToDerived: 'SKIL-*.statConnections.derivedStats → damage|block|criticalChance|…',
    skillResource: 'SKIL-*.resourceCost.mana → INT · stamina → END',
    combatPipeline: attributes.combatFormulas
      ? Object.keys(attributes.combatFormulas)
      : ['mitigation', 'block', 'critical', 'debuff'],
  },
  counts: {
    prefabs: prefabs.total,
    skillsInPool: skillPool.length,
    prefabsWithPrimaryStat: prefabs.prefabs.filter((p) => p.primaryStat).length,
    prefabsWithAffinity: prefabs.prefabs.filter((p) => p.attributeAffinity?.primary).length,
  },
  samples: prefabSamples,
};

writeFileSync(join(API, 'weapon-stat-bridge.json'), JSON.stringify(out, null, 2));

// Compact meta pattern (for agents / codegen)
const pattern = {
  version: '1.0.0',
  generated: out.generated,
  description: 'Weapon stats ↔ attributes ↔ SKIL-* connection pattern',
  weaponStatFields: Object.keys(WEAPON_STAT_FIELDS),
  attributes: CANONICAL_ATTRIBUTES,
  primaryStatToAttribute: primaryStatMap,
  damageTypeScaling: DAMAGE_TYPE_SCALING,
  weaponTypePrimaryAttribute: WEAPON_TYPE_PRIMARY_ATTR,
  skillFields: ['damage', 'cooldown', 'castTime', 'damageType', 'resourceCost', 'effects', 'statConnections'],
  prefabFields: ['stats', 'primaryStat', 'secondaryStat', 'attributeAffinity', 'statConnections', 'skills'],
  loadOrder: [
    'master-attributes.json',
    'master-weaponSkills.json',
    'master-weapon-prefabs.json',
    'weapon-stat-bridge.json',
  ],
};
writeFileSync(join(API, '_meta', 'weapon-stats-attributes.json'), JSON.stringify(pattern, null, 2));

console.log(`Built weapon-stat-bridge.json — ${prefabs.total} prefabs (connections on each prefab)`);
console.log(`  → api/v1/_meta/weapon-stats-attributes.json`);