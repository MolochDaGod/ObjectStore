#!/usr/bin/env node
/**
 * Export WCS attributeSystem.ts → api/v1/master-attributes.json
 * Canonical source: Warlord-Crafting-Suite/shared/attributeSystem.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WCS_ATTR = path.resolve(ROOT, '..', 'Warlord-Crafting-Suite', 'shared', 'attributeSystem.ts');
const WCS_CONST = path.resolve(ROOT, '..', 'Warlord-Crafting-Suite', 'shared', 'gameConstants.ts');
const OUT = path.join(ROOT, 'api', 'v1', 'master-attributes.json');

const PERCENT_UI_STATS = new Set([
  'block', 'blockEffect', 'evasion', 'accuracy', 'criticalChance', 'criticalDamage',
  'attackSpeed', 'movementSpeed', 'resistance', 'cdrResist', 'defenseBreakResist',
  'armorPenetration', 'blockPenetration', 'defenseBreak', 'drainHealth', 'manaRegen',
  'healthRegen', 'cooldownReduction', 'abilityCost', 'spellAccuracy', 'stagger',
  'ccResistance', 'damageReduction', 'bleedResist', 'statusEffect', 'spellblock',
  'dodge', 'reflexTime', 'criticalEvasion', 'fallDamage', 'comboCooldownRed',
]);

const STAT_TO_UI = {
  health: 'health',
  mana: 'mana',
  stamina: 'stamina',
  damage: 'damage',
  defense: 'defense',
  blockChance: 'block',
  blockFactor: 'blockEffect',
  criticalChance: 'criticalChance',
  criticalFactor: 'criticalDamage',
  accuracy: 'accuracy',
  resistance: 'resistance',
  drainHealthFactor: 'drainHealth',
  drainManaFactor: 'manaRegen',
  reflectFactor: 'damageReduction',
  absorbHealthFactor: 'healthRegen',
  absorbManaFactor: 'abilityCost',
  defenseBreakFactor: 'defenseBreak',
  blockBreakFactor: 'blockPenetration',
  critEvasion: 'criticalEvasion',
};

const STAT_LABELS = {
  health: 'Health',
  mana: 'Mana',
  stamina: 'Stamina',
  damage: 'Damage',
  defense: 'Defense',
  block: 'Block Chance',
  blockEffect: 'Block Factor',
  evasion: 'Evasion',
  accuracy: 'Accuracy',
  criticalChance: 'Critical Chance',
  criticalDamage: 'Critical Factor',
  attackSpeed: 'Attack Speed',
  movementSpeed: 'Movement Speed',
  resistance: 'Resistance',
  cdrResist: 'CDR Resist',
  defenseBreakResist: 'Defense Break Resist',
  armorPenetration: 'Armor Penetration',
  blockPenetration: 'Block Penetration',
  defenseBreak: 'Defense Break',
  drainHealth: 'Health Drain',
  manaRegen: 'Mana Regen',
  healthRegen: 'Health Regen',
  cooldownReduction: 'Cooldown Reduction',
  abilityCost: 'Ability Cost Reduction',
  spellAccuracy: 'Spell Accuracy',
  stagger: 'Stagger',
  ccResistance: 'CC Resistance',
  armor: 'Armor',
  damageReduction: 'Damage Reduction',
  bleedResist: 'Bleed Resist',
  statusEffect: 'Status Effect Power',
  spellblock: 'Spell Block',
  dodge: 'Dodge',
  reflexTime: 'Reflex Time',
  criticalEvasion: 'Critical Evasion',
  fallDamage: 'Fall Damage Reduction',
  comboCooldownRed: 'Combo Cooldown Reduction',
};

const EMOJI = {
  strength: '💪',
  vitality: '❤️',
  endurance: '🛡️',
  intellect: '🧠',
  wisdom: '✨',
  dexterity: '🎯',
  agility: '⚡',
  tactics: '📜',
};

const SIGIL_ICON = {
  strength: 'game-assets/icons/sigils/strength.png',
  vitality: 'game-assets/icons/sigils/vitality.png',
  endurance: 'game-assets/icons/sigils/endurance.png',
  intellect: 'game-assets/icons/sigils/intellect.png',
  wisdom: 'game-assets/icons/sigils/wisdom.png',
  dexterity: 'game-assets/icons/sigils/dexterity.png',
  agility: 'game-assets/icons/sigils/agility.png',
  tactics: 'game-assets/icons/sigils/tactics.png',
};

let _seq = 0;
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return ((h >>> 0) ^ ((h >>> 0) >>> 16)).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}
function uuid(prefix, meta = '') {
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  _seq++;
  return `${prefix}-${ts}-${_seq.toString(16).toUpperCase().padStart(6, '0')}-${fnv1a(`${prefix}-${ts}-${_seq}-${meta}`)}`;
}

function parseObjectBlock(src, name) {
  const re = new RegExp(`export const ${name}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\};`);
  const m = src.match(re);
  if (!m) throw new Error(`Could not parse ${name}`);
  return m[1];
}

function parseAttributes(src) {
  const block = parseObjectBlock(src, 'ATTRIBUTES');
  const entries = [];
  const attrRe = /(\w+):\s*\{([\s\S]*?)\n  \}/g;
  let m;
  while ((m = attrRe.exec(block)) !== null) {
    const id = m[1];
    const body = m[2];
    const pick = (key) => {
      const r = body.match(new RegExp(`${key}:\\s*'([^']*)'`));
      return r ? r[1] : body.match(new RegExp(`${key}:\\s*"([^"]*)"`))?.[1];
    };
    const color = body.match(/color:\s*'([^']+)'/)?.[1];
    const effects = [];
    const fxBlock = body.match(/effects:\s*\[([\s\S]*?)\]/);
    if (fxBlock) {
      const fxRe = /\{\s*stat:\s*'([^']+)',\s*flat:\s*([^,]+),\s*percent:\s*([^}]+)\s*\}/g;
      let fx;
      while ((fx = fxRe.exec(fxBlock[1])) !== null) {
        effects.push({ stat: fx[1], flat: parseFloat(fx[2]), percent: parseFloat(fx[3]) });
      }
    }
    entries.push({
      id,
      name: pick('name'),
      abbrev: pick('abbrev'),
      role: pick('role'),
      description: pick('description'),
      color,
      effects,
    });
  }
  return entries;
}

function parseStatDefinitions(src) {
  const block = parseObjectBlock(src, 'STAT_DEFINITIONS');
  const defs = {};
  const statRe = /(\w+):\s*\{([\s\S]*?)\n  \}/g;
  let m;
  while ((m = statRe.exec(block)) !== null) {
    const id = m[1];
    const body = m[2];
    const desc = body.match(/description:\s*'([^']*)'/)?.[1];
    const isPct = /isPercentage:\s*true/.test(body);
    defs[id] = { description: desc, isPercentage: isPct };
  }
  return defs;
}

function parseCombatCaps(src) {
  const block = src.match(/export const COMBAT_CAPS = \{([\s\S]*?)\} as const/)?.[1] || '';
  const caps = {};
  const capRe = /(\w+):\s*([\d.]+)/g;
  let m;
  while ((m = capRe.exec(block)) !== null) caps[m[1]] = parseFloat(m[2]);
  return caps;
}

function toUiGain(stat, flat, percent) {
  const uiKey = STAT_TO_UI[stat] || stat;
  const isPercent = PERCENT_UI_STATS.has(uiKey);
  const gain = { label: STAT_LABELS[uiKey] || uiKey };
  if (flat) gain.flat = isPercent ? +(flat * 100).toFixed(4) : flat;
  if (percent) gain.percent = +(percent * 100).toFixed(4);
  return { key: uiKey, gain };
}

function formatCapDisplay(key, value, isPercent) {
  if (isPercent) return `${Math.round(value * (value <= 1 ? 100 : 1))}%`;
  if (key === 'criticalFactor') return `${value}×`;
  return String(value);
}

const attrSrc = fs.readFileSync(WCS_ATTR, 'utf8');
const constSrc = fs.readFileSync(WCS_CONST, 'utf8');
const parsedAttrs = parseAttributes(attrSrc);
const statDefs = parseStatDefinitions(attrSrc);
const combatCaps = parseCombatCaps(constSrc);

const ALL_37_STATS = [
  'health', 'mana', 'stamina', 'damage', 'defense',
  'block', 'blockEffect', 'evasion', 'accuracy', 'criticalChance', 'criticalDamage',
  'attackSpeed', 'movementSpeed', 'resistance', 'cdrResist', 'defenseBreakResist',
  'armorPenetration', 'blockPenetration', 'defenseBreak', 'drainHealth', 'manaRegen',
  'healthRegen', 'cooldownReduction', 'abilityCost', 'spellAccuracy', 'stagger',
  'ccResistance', 'armor', 'damageReduction', 'bleedResist', 'statusEffect',
  'spellblock', 'dodge', 'reflexTime', 'criticalEvasion', 'fallDamage', 'comboCooldownRed',
];

const statDescriptions = {};
for (const key of ALL_37_STATS) {
  const reverse = Object.entries(STAT_TO_UI).find(([, v]) => v === key);
  const engineKey = reverse?.[0];
  if (engineKey && statDefs[engineKey]) {
    statDescriptions[key] = statDefs[engineKey].description;
  } else {
    statDescriptions[key] = STAT_LABELS[key] || key;
  }
}

const CAP_RATIONALE = {
  block: 'Prevents permanent immunity',
  blockEffect: 'Blocked hits must still deal some damage',
  criticalChance: 'Balanced with Critical Evasion',
  criticalDamage: 'Crit multiplier ceiling',
  criticalEvasion: 'Counters excessive crit stacking',
  accuracy: 'Debuffs must have failure chance',
  resistance: 'Magic damage remains relevant',
  drainHealth: 'Lifesteal cap prevents full sustain',
  defenseBreak: 'Armor cannot be fully ignored',
  blockPenetration: 'Block builds remain viable',
  damageReduction: 'Reflect/absorb cannot negate all damage',
  evasion: 'Cannot dodge more than half of attacks',
  dodge: 'Cannot dodge more than half of attacks',
};

const UI_CAP_MAP = {
  blockChance: 'block',
  blockFactor: 'blockEffect',
  criticalChance: 'criticalChance',
  criticalFactor: 'criticalDamage',
  accuracy: 'accuracy',
  resistance: 'resistance',
  drainHealth: 'drainHealth',
  drainMana: 'manaRegen',
  reflectFactor: 'damageReduction',
  absorbHealth: 'healthRegen',
  absorbMana: 'abilityCost',
  defenseBreak: 'defenseBreak',
  blockBreak: 'blockPenetration',
  critEvasion: 'criticalEvasion',
  evasion: 'evasion',
};

const statCaps = {};
for (const [engineKey, uiKey] of Object.entries(UI_CAP_MAP)) {
  const val = combatCaps[engineKey];
  if (val === undefined) continue;
  const isPercent = PERCENT_UI_STATS.has(uiKey);
  statCaps[uiKey] = {
    value: val,
    display: formatCapDisplay(uiKey, val, isPercent),
    rationale: CAP_RATIONALE[uiKey] || 'Combat balance cap from gameConstants.ts',
  };
}

const attributes = parsedAttrs.map((a) => {
  const gains = {};
  for (const fx of a.effects) {
    const { key, gain } = toUiGain(fx.stat, fx.flat, fx.percent);
    gains[key] = gain;
  }
  return {
    uuid: uuid('ATTR', a.id),
    id: a.id,
    name: a.name,
    abbrev: a.abbrev,
    role: a.role,
    description: a.description,
    color: a.color,
    icon: SIGIL_ICON[a.id],
    emoji: EMOJI[a.id],
    gains,
  };
});

const output = {
  version: '2.0.0',
  updated: new Date().toISOString().split('T')[0],
  canonical: true,
  source: 'Warlord-Crafting-Suite/shared/attributeSystem.ts',
  totalAttributes: 8,
  totalDerivedStats: 37,
  allocation: {
    startingPoints: 20,
    pointsPerLevel: 7,
    maxLevel: 20,
    maxPoints: 160,
    diminishingReturns: {
      enabled: true,
      threshold: 25,
      tier1Efficiency: 0.5,
      tier2Efficiency: 0.25,
    },
  },
  attributes,
  statDescriptions,
  statCaps,
  combatFormulas: {
    mitigation: 'Damage Taken = Incoming × (100 - √Defense) / 100',
    block: 'IF Random < Block Chance → Damage = Damage × (1 - Block Factor)',
    critical: 'IF Random < Crit Chance → Damage = Damage × Crit Factor (blocked hits cannot crit)',
    debuff: 'Success = clamp(Accuracy - Resistance, 5%, 95%)',
  },
};

fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');
console.log(`✅ Wrote ${OUT}`);
console.log(`   ${attributes.length} attributes, ${Object.keys(statDescriptions).length} derived stats`);