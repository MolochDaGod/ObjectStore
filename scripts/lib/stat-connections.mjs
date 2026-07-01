/**
 * Canonical connections: weapon stats ↔ attributes ↔ SKIL-* ↔ derived stats.
 * Source of truth for enrich + prefab + bridge builders.
 */

export const CANONICAL_ATTRIBUTES = ['STR', 'VIT', 'END', 'INT', 'WIS', 'DEX', 'AGI', 'TAC'];

export const WEAPON_STAT_FIELDS = {
  damage: {
    derivedStat: 'damage',
    label: 'Damage',
    scalesWith: ['STR', 'DEX'],
    combatStep: 1,
  },
  speed: {
    derivedStat: 'attackSpeed',
    label: 'Attack Speed',
    scalesWith: ['AGI', 'DEX'],
    combatStep: 1,
  },
  crit: {
    derivedStat: 'criticalChance',
    label: 'Critical Chance',
    scalesWith: ['DEX', 'AGI'],
    combatStep: 6,
  },
  block: {
    derivedStat: 'block',
    label: 'Block Chance',
    scalesWith: ['STR', 'VIT'],
    combatStep: 5,
  },
  defense: {
    derivedStat: 'defense',
    label: 'Defense',
    scalesWith: ['VIT', 'END'],
    combatStep: 3,
  },
  combo: {
    derivedStat: 'comboCooldownRed',
    label: 'Combo Reduction',
    scalesWith: ['DEX', 'TAC'],
    combatStep: 1,
  },
};

export const DAMAGE_TYPE_SCALING = {
  physical: ['STR', 'DEX'],
  nature: ['WIS', 'INT'],
  arcane: ['INT', 'WIS'],
  fire: ['INT', 'WIS'],
  frost: ['INT', 'WIS'],
  holy: ['WIS', 'INT'],
  lightning: ['INT', 'DEX'],
  poison: ['DEX', 'INT'],
};

export const WEAPON_TYPE_PRIMARY_ATTR = {
  SWORD: 'STR',
  AXE: 'STR',
  GREATSWORD: 'STR',
  GREATAXE: 'STR',
  HAMMER: 'STR',
  SPEAR: 'DEX',
  DAGGER: 'DEX',
  BOW: 'DEX',
  CROSSBOW: 'DEX',
  GUN: 'DEX',
  STAFF: 'INT',
  WAND: 'INT',
  TOME: 'INT',
  SHIELD: 'VIT',
  TOOL: 'END',
  MACE: 'INT',
  SCYTHE: 'DEX',
};

const EFFECT_DERIVED_MAP = [
  { re: /block|guard|stance|parry/i, stats: ['block', 'blockEffect'] },
  { re: /crit|critical/i, stats: ['criticalChance', 'criticalDamage'] },
  { re: /bleed|deep cut/i, stats: ['bleedResist'] },
  { re: /stun|fear|slow|root|freeze/i, stats: ['accuracy', 'ccResistance'] },
  { re: /heal|lifesteal|drain/i, stats: ['drainHealth', 'healthRegen'] },
  { re: /mana|arcane|spell/i, stats: ['mana', 'spellAccuracy'] },
  { re: /dodge|evasion/i, stats: ['evasion', 'dodge'] },
  { re: /penetrat|armor pen|break/i, stats: ['armorPenetration', 'defenseBreak'] },
  { re: /gather|chop|mine|skin/i, stats: ['efficiency'] },
];

export function buildAttributeIndex(attributesJson) {
  const byAbbrev = {};
  const byId = {};
  for (const attr of attributesJson?.attributes || []) {
    byAbbrev[attr.abbrev] = attr;
    byId[attr.id] = attr;
  }
  return { byAbbrev, byId };
}

export function resolveAttributeRef(abbrevOrStat, attrIndex, primaryStatMap = {}) {
  if (!abbrevOrStat) return null;
  const key = String(abbrevOrStat).toLowerCase();
  if (CANONICAL_ATTRIBUTES.includes(String(abbrevOrStat).toUpperCase())) {
    const abbrev = abbrevOrStat.toUpperCase();
    const attr = attrIndex.byAbbrev[abbrev];
    return attr ? { abbrev, uuid: attr.uuid, id: attr.id, name: attr.name } : { abbrev };
  }
  const mapped = primaryStatMap[key] || primaryStatMap[abbrevOrStat];
  if (mapped) {
    const attr = attrIndex.byAbbrev[mapped];
    return attr ? { abbrev: mapped, uuid: attr.uuid, id: attr.id, name: attr.name, from: key } : { abbrev: mapped, from: key };
  }
  return null;
}

export function inferSkillStatConnections(skill, weaponType, primaryStatMap = {}) {
  const damageType = skill.damageType || 'physical';
  const typeDefault = WEAPON_TYPE_PRIMARY_ATTR[weaponType] || 'STR';
  const scalesWith = DAMAGE_TYPE_SCALING[damageType] || [typeDefault, 'DEX'];

  const derivedStats = new Set();
  if (skill.damage > 0) derivedStats.add('damage');
  if (skill.damage < 0) derivedStats.add('heal');
  if (skill.cooldown > 0) derivedStats.add('cooldownReduction');
  if (skill.castTime > 0) derivedStats.add('abilityCost');

  const effectText = (skill.effects || []).join(' ');
  for (const { re, stats } of EFFECT_DERIVED_MAP) {
    if (re.test(effectText)) stats.forEach((s) => derivedStats.add(s));
  }

  let resourceAttribute = null;
  const mana = skill.resourceCost?.mana ?? skill.manaCost ?? 0;
  const stamina = skill.resourceCost?.stamina ?? 0;
  if (mana > 0) resourceAttribute = 'INT';
  else if (stamina > 0) resourceAttribute = 'END';

  return {
    scalesWith,
    primaryAttribute: scalesWith[0],
    resourceAttribute,
    derivedStats: [...derivedStats],
    damageType,
    slotRole: skill._slotType || null,
  };
}

export function buildWeaponStatConnections(stats = {}, primaryStat, secondaryStat, attrIndex, primaryStatMap) {
  const weaponStats = {};
  for (const [field, meta] of Object.entries(WEAPON_STAT_FIELDS)) {
    const base = stats[field];
    if (base == null && base !== 0) continue;
    weaponStats[field] = {
      base,
      derivedStat: meta.derivedStat,
      label: meta.label,
      scalesWith: meta.scalesWith,
      combatStep: meta.combatStep,
      attributeUuids: meta.scalesWith
        .map((abbr) => attrIndex.byAbbrev[abbr]?.uuid)
        .filter(Boolean),
    };
  }
  return {
    weaponStats,
    primaryAttribute: resolveAttributeRef(primaryStat, attrIndex, primaryStatMap),
    secondaryAttribute: resolveAttributeRef(secondaryStat, attrIndex, primaryStatMap),
  };
}

export function buildPrefabStatConnections(prefab, skillPool, attrIndex, primaryStatMap) {
  const base = buildWeaponStatConnections(
    prefab.stats,
    prefab.primaryStat,
    prefab.secondaryStat,
    attrIndex,
    primaryStatMap,
  );

  const skillConnections = {};
  for (const slot of prefab.skills?.slots || []) {
    for (const skillId of slot.skillIds || []) {
      const skill = skillPool.find((s) => s.id === skillId);
      if (!skill) continue;
      skillConnections[skill.uuid || skillId] = {
        skillId,
        slotType: slot.type,
        ...inferSkillStatConnections({ ...skill, _slotType: slot.type }, prefab.weaponType, primaryStatMap),
      };
    }
  }

  return {
    ...base,
    attributeAffinity: prefab.attributeAffinity,
    canonicalAttributes: 'master-attributes.json',
    canonicalSkills: 'master-weaponSkills.json',
    combatPipeline: 'master-attributes.json → combatFormulas (8 steps)',
    skills: skillConnections,
  };
}