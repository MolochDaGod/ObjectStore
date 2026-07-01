#!/usr/bin/env node
/**
 * Merge T0 starter slot pattern into master-weaponSkills.json (starterSlots per type)
 * and embed slots 1–3 weapon skills on each row in t0-weapons.json.
 *
 * T0 rule: always exactly 3 abilities — auto-assigned, one fixed skill per slot (no manual pick).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');
const SKILLS_PATH = join(API, 'master-weaponSkills.json');
const T0_PATH = join(API, 't0-weapons.json');
const PATTERN_PATH = join(API, '_meta', 't0-starter-slot-pattern.json');

const CATEGORY_TO_WEAPON_TYPE = {
  swords: 'SWORD',
  axes1h: 'AXE',
  greataxes: 'GREATAXE',
  greatswords: 'GREATSWORD',
  daggers: 'DAGGER',
  bows: 'BOW',
  crossbows: 'CROSSBOW',
  guns: 'GUN',
  hammers1h: 'HAMMER',
  hammers2h: 'HAMMER',
  spears: 'SPEAR',
  natureStaves: 'STAFF',
  wands: 'WAND',
  tools: 'TOOL',
  'offhand-tome': 'TOME',
};

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

function typeDefaults(weaponType) {
  return {
    castTime: ['WAND', 'STAFF', 'TOME'].includes(weaponType) ? 0.5 : null,
    mana: ['WAND', 'STAFF', 'TOME'].includes(weaponType) ? 4 : 0,
    stamina: ['SWORD', 'AXE', 'DAGGER', 'HAMMER', 'BOW', 'CROSSBOW', 'GUN', 'GREATSWORD', 'GREATAXE', 'SPEAR', 'TOOL'].includes(weaponType) ? 2 : 0,
    damageType: weaponType === 'STAFF' ? 'nature' : weaponType === 'TOME' ? 'arcane' : 'physical',
  };
}

function resolveSlot3(pattern) {
  return pattern.slot3 || pattern.slot3Options?.[0] || null;
}

function buildStarterSlots(typeDef, pattern, weaponType) {
  if (!pattern?.slot1 || !pattern?.slot2) return null;
  const slot3Raw = resolveSlot3(pattern);
  if (!slot3Raw) return null;

  const defaults = typeDefaults(weaponType);
  const slot1 = enrichStarterSkill(pattern.slot1, weaponType, typeDef, defaults);
  const slot2 = enrichStarterSkill(pattern.slot2, weaponType, typeDef, defaults);
  const slot3 = enrichStarterSkill(slot3Raw, weaponType, typeDef, defaults);

  return [
    {
      type: 'primary',
      label: 'Slot 1 · Starter Attack',
      unlockTier: 0,
      fixed: true,
      autoAssigned: true,
      skills: [slot1],
    },
    {
      type: 'secondary',
      label: 'Slot 2 · Starter Style',
      unlockTier: 0,
      fixed: true,
      autoAssigned: true,
      skills: [slot2],
    },
    {
      type: 'ability',
      label: 'Slot 3 · Starter Ability',
      unlockTier: 0,
      fixed: true,
      autoAssigned: true,
      skills: [slot3],
    },
  ];
}

function toPrefabSlots(starterSlots) {
  return starterSlots.map((slot) => ({
    type: slot.type,
    label: slot.label,
    unlockTier: slot.unlockTier,
    fixed: slot.fixed,
    autoAssigned: slot.autoAssigned,
    shared: true,
    skillIds: slot.skills.map((s) => s.id),
    skillUuids: slot.skills.map((s) => s.uuid),
    skills: slot.skills,
  }));
}

const pattern = JSON.parse(readFileSync(PATTERN_PATH, 'utf8'));
pattern.description =
  'T0 starter loadout — always 3 auto-assigned abilities (one fixed skill per slot). Craft T1 from T0 + materials.';
pattern.labels = {
  primary: 'Slot 1 · Starter Attack',
  secondary: 'Slot 2 · Starter Style',
  ability: 'Slot 3 · Starter Ability',
};
pattern.autoAssign = true;
writeFileSync(PATTERN_PATH, JSON.stringify(pattern, null, 2));

const data = JSON.parse(readFileSync(SKILLS_PATH, 'utf8'));
const t0Data = JSON.parse(readFileSync(T0_PATH, 'utf8'));
const byType = Object.fromEntries((data.weaponTypes || []).map((wt) => [wt.id, wt]));

let mergedTypes = 0;
let mergedWeapons = 0;

for (const wt of data.weaponTypes || []) {
  const typePattern = pattern.types?.[wt.id];
  if (!typePattern) continue;
  wt.starterSlots = buildStarterSlots(wt, typePattern, wt.id);
  mergedTypes++;
}

for (const weapon of t0Data.weapons || []) {
  const weaponType = CATEGORY_TO_WEAPON_TYPE[weapon.category];
  const typePattern = pattern.types?.[weaponType];
  if (!typePattern) continue;

  const typeDef = byType[weaponType] || { id: weaponType, icon: weapon.iconUrl };
  const starterSlots = buildStarterSlots(typeDef, typePattern, weaponType);
  if (!starterSlots) continue;

  const prefabSlots = toPrefabSlots(starterSlots);
  const skillUuids = starterSlots.flatMap((s) => s.skills.map((sk) => sk.uuid));

  const slotPattern = weaponType === 'TOOL' ? 'gather-starter' : 'three-slot-starter';

  weapon.slotPattern = slotPattern;
  weapon.autoAssignSkills = true;
  weapon.weaponSkills = {
    slot1: starterSlots[0].skills[0],
    slot2: starterSlots[1].skills[0],
    slot3: starterSlots[2].skills[0],
  };
  weapon.skills = {
    slots: prefabSlots,
    passives: [],
    skillUuids,
    slotPattern,
    bindingMode: weaponType === 'TOOL' ? 'gather' : 'starter',
    autoAssigned: true,
    craftsInto: 'T1',
  };
  mergedWeapons++;
}

data.t0StarterPattern = pattern.slotPattern;
data.t0StarterAutoAssign = true;
data.t0StarterEnriched = new Date().toISOString();
t0Data.t0StarterEnriched = new Date().toISOString();
t0Data.note =
  'Canonical T0 starters — always 3 auto-assigned abilities (slot1, slot2, slot3). No tier upgrades; craft T1 from T0 + materials.';

writeFileSync(SKILLS_PATH, JSON.stringify(data, null, 2));
writeFileSync(T0_PATH, JSON.stringify(t0Data, null, 2));

console.log(`Merged T0 starterSlots into ${mergedTypes} weapon types → ${SKILLS_PATH}`);
console.log(`Embedded 3 auto-assigned abilities on ${mergedWeapons} T0 weapons → ${T0_PATH}`);
console.log('  Next: npm run build:weapon-pipeline');