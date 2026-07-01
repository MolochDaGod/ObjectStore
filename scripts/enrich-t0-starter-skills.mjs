#!/usr/bin/env node
/**
 * Merge T0 starter slot pattern into master-weaponSkills.json as starterSlots per type.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');
const SKILLS_PATH = join(API, 'master-weaponSkills.json');
const PATTERN_PATH = join(API, '_meta', 't0-starter-slot-pattern.json');

function synthUuid(skillId, weaponType) {
  const hash = createHash('sha1').update(`T0:${weaponType}:${skillId}`).digest('hex').slice(0, 12).toUpperCase();
  return `SKIL-T0-${hash.slice(0, 6)}-${hash.slice(6)}`;
}

function enrichStarterSkill(raw, weaponType, typeDef, defaults) {
  const icon = typeDef?.icon || '/icons/pack/weapons/Sword_01.png';
  return {
    uuid: synthUuid(raw.id, weaponType),
    id: raw.id,
    name: raw.name,
    description: raw.description,
    icon,
    tier: 0,
    damage: raw.damage ?? 0,
    cooldown: raw.cooldown ?? 0,
    castTime: raw.castTime ?? defaults.castTime ?? null,
    range: raw.range ?? null,
    projectile: raw.projectile ?? null,
    damageType: raw.damageType ?? defaults.damageType ?? 'physical',
    effects: raw.effects || ['Starter'],
    resourceCost: {
      mana: defaults.mana ?? 0,
      stamina: defaults.stamina ?? 0,
    },
  };
}

function buildStarterSlots(typeDef, pattern) {
  if (!pattern) return null;
  const defaults = {
    castTime: ['WAND', 'STAFF', 'TOME'].includes(typeDef.id) ? 0.5 : null,
    mana: ['WAND', 'STAFF', 'TOME'].includes(typeDef.id) ? 4 : 0,
    stamina: ['SWORD', 'AXE', 'DAGGER', 'HAMMER', 'BOW', 'CROSSBOW', 'GUN', 'GREATSWORD', 'GREATAXE', 'SPEAR'].includes(typeDef.id) ? 2 : 0,
    damageType: typeDef.id === 'STAFF' ? 'nature' : typeDef.id === 'TOME' ? 'arcane' : 'physical',
  };

  const slot1 = enrichStarterSkill(pattern.slot1, typeDef.id, typeDef, defaults);
  const slot2 = enrichStarterSkill(pattern.slot2, typeDef.id, typeDef, defaults);
  const slot3 = (pattern.slot3Options || []).map((sk) => enrichStarterSkill(sk, typeDef.id, typeDef, defaults));

  return [
    {
      type: 'primary',
      label: 'Slot 1 · Starter Attack',
      unlockTier: 0,
      fixed: true,
      skills: [slot1],
    },
    {
      type: 'secondary',
      label: 'Slot 2 · Starter Style',
      unlockTier: 0,
      fixed: true,
      skills: [slot2],
    },
    {
      type: 'ability',
      label: 'Slot 3 · Choose One',
      unlockTier: 0,
      choice: true,
      skills: slot3,
    },
  ];
}

const pattern = JSON.parse(readFileSync(PATTERN_PATH, 'utf8'));
const data = JSON.parse(readFileSync(SKILLS_PATH, 'utf8'));
let merged = 0;

for (const wt of data.weaponTypes || []) {
  const typePattern = pattern.types?.[wt.id];
  if (!typePattern) continue;
  wt.starterSlots = buildStarterSlots(wt, typePattern);
  merged++;
}

data.t0StarterPattern = pattern.slotPattern;
data.t0StarterEnriched = new Date().toISOString();

writeFileSync(SKILLS_PATH, JSON.stringify(data, null, 2));
console.log(`Merged T0 starterSlots into ${merged} weapon types → ${SKILLS_PATH}`);
console.log('  Next: npm run build:weapon-pipeline');