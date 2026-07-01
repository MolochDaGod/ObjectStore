#!/usr/bin/env node
/**
 * Add missing variant signature abilities from weapons.json into master-weaponSkills
 * ultimate pools so slot 4 binds the correct named-weapon signature per prefab.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeKey, parseAbilityName } from './lib/weapon-five-slot.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');

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
  fireStaves: 'STAFF',
  frostStaves: 'STAFF',
  holyStaves: 'STAFF',
  lightningStaves: 'STAFF',
  natureStaves: 'STAFF',
  arcaneStaves: 'STAFF',
  staves: 'STAFF',
  wands: 'WAND',
  maces: 'MACE',
  scythes: 'SCYTHE',
  shields: 'SHIELD',
  fireTomes: 'TOME',
  frostTomes: 'TOME',
  natureTomes: 'TOME',
  holyTomes: 'TOME',
  arcaneTomes: 'TOME',
  lightningTomes: 'TOME',
  'offhand-tome': 'TOME',
};

function synthUuid(skillId, weaponType) {
  const hash = createHash('sha1').update(`SIG:${weaponType}:${skillId}`).digest('hex').slice(0, 12).toUpperCase();
  return `SKIL-SIG-${hash.slice(0, 6)}-${hash.slice(6)}`;
}

function slugId(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function parseSigDescription(raw) {
  const m = String(raw || '').match(/\(([^)]+)\)/);
  return m ? m[1] : String(raw || '').trim();
}

function defaultDamageForType(weaponType) {
  const map = {
    SWORD: 120,
    AXE: 130,
    DAGGER: 100,
    BOW: 110,
    GUN: 140,
    STAFF: 150,
    WAND: 130,
    HAMMER: 160,
    GREATSWORD: 170,
    GREATAXE: 175,
    SPEAR: 140,
    MACE: 145,
    CROSSBOW: 125,
    SCYTHE: 150,
    SHIELD: 80,
    TOME: 120,
  };
  return map[weaponType] || 120;
}

function buildSignatureSkill(sigRaw, weaponType, typeDef) {
  const name = parseAbilityName(sigRaw);
  if (!name) return null;
  const id = `${weaponType.toLowerCase()}_${slugId(name)}`;
  const desc = parseSigDescription(sigRaw);
  return {
    uuid: synthUuid(id, weaponType),
    id,
    name,
    description: desc || `${name} — variant signature`,
    icon: typeDef?.icon || '/icons/pack/misc/Effect.png',
    tier: 3,
    damage: defaultDamageForType(weaponType),
    cooldown: 45,
    castTime: ['STAFF', 'WAND', 'TOME'].includes(weaponType) ? 1.0 : null,
    range: null,
    projectile: ['BOW', 'CROSSBOW', 'GUN'].includes(weaponType) ? 'projectile' : null,
    damageType: ['STAFF', 'WAND', 'TOME'].includes(weaponType) ? 'arcane' : 'physical',
    effects: ['Signature'],
    resourceCost: {
      mana: ['STAFF', 'WAND', 'TOME'].includes(weaponType) ? 15 : 0,
      stamina: ['STAFF', 'WAND', 'TOME'].includes(weaponType) ? 0 : 5,
    },
  };
}

function poolHasSignature(pool, sigName) {
  const key = normalizeKey(sigName);
  return pool.some((sk) => {
    const skKey = normalizeKey(sk.name);
    return skKey === key || skKey.includes(key) || key.includes(skKey);
  });
}

const weapons = JSON.parse(readFileSync(join(API, 'weapons.json'), 'utf8'));
const skills = JSON.parse(readFileSync(join(API, 'master-weaponSkills.json'), 'utf8'));
const aliases = JSON.parse(readFileSync(join(API, '_meta', 'ability-aliases.json'), 'utf8'));

const byType = Object.fromEntries((skills.weaponTypes || []).map((wt) => [wt.id, wt]));
let added = 0;
const aliasAdds = {};

for (const [catKey, cat] of Object.entries(weapons.categories || {})) {
  const weaponType = CATEGORY_TO_WEAPON_TYPE[catKey];
  if (!weaponType || weaponType === 'TOOL') continue;
  const typeDef = byType[weaponType];
  if (!typeDef) continue;

  let ultimate = typeDef.slots?.find((s) => s.type === 'ultimate');
  if (!ultimate) {
    ultimate = { type: 'ultimate', label: 'ULTIMATE', unlockTier: 3, skills: [] };
    typeDef.slots = typeDef.slots || [];
    typeDef.slots.push(ultimate);
  }
  if (!aliasAdds[weaponType]) aliasAdds[weaponType] = { ...(aliases.byWeaponType?.[weaponType] || {}) };

  for (const item of cat.items || []) {
    const sigRaw = item.signatureAbility || item.signature;
    const sigName = parseAbilityName(sigRaw);
    if (!sigName) continue;

    const aliasKey = normalizeKey(sigName);
    if (!aliasAdds[weaponType][aliasKey]) {
      aliasAdds[weaponType][aliasKey] = normalizeKey(sigName);
    }

    if (poolHasSignature(ultimate.skills, sigName)) continue;

    const skill = buildSignatureSkill(sigRaw, weaponType, typeDef);
    if (!skill) continue;
    ultimate.skills.push(skill);
    aliasAdds[weaponType][aliasKey] = normalizeKey(skill.name);
    added++;
  }
}

aliases.byWeaponType = { ...(aliases.byWeaponType || {}), ...aliasAdds };
aliases.signatureEnriched = new Date().toISOString();

skills.variantSignaturesEnriched = new Date().toISOString();
skills.signatureSkillsAdded = added;

writeFileSync(join(API, 'master-weaponSkills.json'), JSON.stringify(skills, null, 2));
writeFileSync(join(API, '_meta', 'ability-aliases.json'), JSON.stringify(aliases, null, 2));

console.log(`Added ${added} variant signature skills to ultimate pools`);
console.log('  → api/v1/master-weaponSkills.json');
console.log('  → api/v1/_meta/ability-aliases.json');
console.log('  Next: npm run build:weapon-pipeline');