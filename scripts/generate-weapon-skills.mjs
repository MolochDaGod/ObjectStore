#!/usr/bin/env node
/**
 * Generate weaponSkills.json from WCS weaponSkills.ts
 * Parses all 13 existing weapon types + adds missing types
 * (Arcane Staves, Hammers, Spears, Scythes, Tools, Tomes)
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WCS_PATH = resolve(__dirname, '../../Warlord-Crafting-Suite-Clean/client/src/data/weaponSkills.ts');
const OUT_PATH = resolve(__dirname, '../api/v1/weaponSkills.json');
const ICON_BASE = './icons/wcs';

const raw = readFileSync(WCS_PATH, 'utf-8');

// Rewrite icon paths from /icons/weapons/X.png → ./icons/wcs/weapons/X.png
function fixIcon(iconPath) {
  if (!iconPath) return null;
  return iconPath.replace(/^\/icons\//, `${ICON_BASE}/`);
}

// ============================================================
// PARSE EXISTING 13 WEAPON TYPES FROM weaponSkills.ts
// ============================================================
// We eval the TS by stripping types and converting to plain JS objects
function parseWeaponSkillsTS() {
  // Strip TypeScript type annotations and export keywords for eval
  let js = raw
    .replace(/export\s+interface\s+\w+\s*\{[^}]*\}/gs, '')
    .replace(/export\s+function\s+\w+[^}]*\}/gs, '')
    .replace(/export\s+const\s+WEAPON_SKILLS_BY_TYPE[^;]*;/s, '')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/:\s*WeaponTypeSkills\s*=/g, ' =')
    .replace(/:\s*Record<string,\s*WeaponTypeSkills>\s*=/g, ' =')
    .replace(/:\s*string\b/g, '')
    .replace(/:\s*number\b/g, '')
    .replace(/:\s*boolean\b/g, '')
    .replace(/\?\s*:/g, ':');

  // Extract each const block
  const results = {};
  const constRegex = /const\s+(\w+)\s*=\s*(\{[\s\S]*?\n\};)/g;
  let match;
  while ((match = constRegex.exec(js)) !== null) {
    const name = match[1];
    let body = match[2];
    try {
      const obj = new Function(`return ${body}`)();
      results[name] = obj;
    } catch (e) {
      console.warn(`  Failed to parse ${name}: ${e.message}`);
    }
  }
  return results;
}

// Map const names to weapon type keys
const TYPE_MAP = {
  SWORD_SKILLS: { key: 'swords', name: 'Swords', emoji: '⚔️' },
  AXE_1H_SKILLS: { key: 'axes1h', name: '1H Axes', emoji: '🪓' },
  GREATSWORD_SKILLS: { key: 'greatswords', name: 'Greatswords', emoji: '⚔️' },
  GREATAXE_SKILLS: { key: 'greataxes', name: 'Greataxes', emoji: '🪓' },
  DAGGER_SKILLS: { key: 'daggers', name: 'Daggers', emoji: '🗡️' },
  BOW_SKILLS: { key: 'bows', name: 'Bows', emoji: '🏹' },
  CROSSBOW_SKILLS: { key: 'crossbows', name: 'Crossbows', emoji: '🎯' },
  GUN_SKILLS: { key: 'guns', name: 'Guns', emoji: '🔫' },
  FIRE_STAFF_SKILLS: { key: 'fireStaves', name: 'Fire Staves', emoji: '🔥' },
  FROST_STAFF_SKILLS: { key: 'frostStaves', name: 'Frost Staves', emoji: '❄️' },
  HOLY_STAFF_SKILLS: { key: 'holyStaves', name: 'Holy Staves', emoji: '✨' },
  LIGHTNING_STAFF_SKILLS: { key: 'lightningStaves', name: 'Lightning Staves', emoji: '⚡' },
  NATURE_STAFF_SKILLS: { key: 'natureStaves', name: 'Nature Staves', emoji: '🌿' },
};

function transformTypeSkills(raw) {
  const shared = {
    slot1: (raw.slot1Options || []).map(s => ({ ...s, icon: fixIcon(s.icon), slot: 'slot1', slotLabel: 'Attack' })),
    slot2: (raw.slot2Options || []).map(s => ({ ...s, icon: fixIcon(s.icon), slot: 'slot2', slotLabel: 'Core Skill' })),
    slot3: (raw.slot3Options || []).map(s => ({ ...s, icon: fixIcon(s.icon), slot: 'slot3', slotLabel: 'Defensive' })),
  };
  const weapons = {};
  for (const [weaponId, options] of Object.entries(raw.slot4Options || {})) {
    weapons[weaponId] = {
      slot4: (options || []).map(s => ({ ...s, icon: fixIcon(s.icon), slot: 'slot4', slotLabel: 'Weapon Special' })),
      slot5: raw.slot5Unique?.[weaponId]
        ? { ...raw.slot5Unique[weaponId], icon: fixIcon(raw.slot5Unique[weaponId].icon), slot: 'slot5', slotLabel: 'Ultimate' }
        : null,
    };
  }
  return { sharedSkills: shared, weapons };
}

function countSkills(typeData) {
  let count = 0;
  const s = typeData.sharedSkills;
  count += (s.slot1?.length || 0) + (s.slot2?.length || 0) + (s.slot3?.length || 0);
  for (const w of Object.values(typeData.weapons)) {
    count += (w.slot4?.length || 0);
    if (w.slot5) count++;
  }
  return count;
}

// ============================================================
// ADD MISSING WEAPON TYPES
// ============================================================

// ARCANE STAVES — uses staff_55+ (but we only have up to 54 in WCS, so reuse some + use misc arcane icons)
const ARCANE_STAVES = {
  sharedSkills: {
    slot1: [
      { id: 'arcane-bolt', name: 'Arcane Bolt', icon: `${ICON_BASE}/misc/Chaos.png`, description: 'Arcane projectile dealing pure magic damage', cooldown: 0, manaCost: 6, damageMultiplier: 1.0, slot: 'slot1', slotLabel: 'Attack' },
      { id: 'arcane-missile', name: 'Arcane Missile', icon: `${ICON_BASE}/misc/Chaos_2.png`, description: 'Homing arcane missile', cooldown: 0, manaCost: 7, damageMultiplier: 0.9, effect: 'homing', slot: 'slot1', slotLabel: 'Attack' },
      { id: 'arcane-pulse', name: 'Mana Pulse', icon: `${ICON_BASE}/misc/ChaosCircle.png`, description: 'Short range mana burst', cooldown: 0, manaCost: 5, damageMultiplier: 0.8, effect: 'AoE close', slot: 'slot1', slotLabel: 'Attack' },
    ],
    slot2: [
      { id: 'arcane-barrage', name: 'Arcane Barrage', icon: `${ICON_BASE}/misc/Power.png`, description: 'Rapid arcane projectile burst', cooldown: 6, manaCost: 25, damageMultiplier: 0.5, effect: '5 missiles', slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'arcane-explosion', name: 'Arcane Explosion', icon: `${ICON_BASE}/misc/Effect.png`, description: 'AoE arcane burst around caster', cooldown: 8, manaCost: 30, effect: 'AoE 360', slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'arcane-beam', name: 'Arcane Beam', icon: `${ICON_BASE}/misc/Glow.png`, description: 'Channeled arcane beam', cooldown: 5, manaCost: 22, effect: 'channel beam', slot: 'slot2', slotLabel: 'Core Skill' },
    ],
    slot3: [
      { id: 'arcane-shield', name: 'Mana Shield', icon: `${ICON_BASE}/weapons/shield_22.png`, description: 'Absorb damage using mana', cooldown: 12, manaCost: 0, effect: 'mana as HP', slot: 'slot3', slotLabel: 'Defensive' },
      { id: 'arcane-blink', name: 'Blink', icon: `${ICON_BASE}/misc/Flow.png`, description: 'Instant teleport to target location', cooldown: 8, manaCost: 18, effect: 'teleport', slot: 'slot3', slotLabel: 'Defensive' },
      { id: 'arcane-ward', name: 'Spell Ward', icon: `${ICON_BASE}/weapons/shield_23.png`, description: 'Reflect next spell back at caster', cooldown: 15, manaCost: 25, effect: 'spell reflect', slot: 'slot3', slotLabel: 'Defensive' },
    ],
  },
  weapons: {
    'voidspire': {
      slot4: [
        { id: 'void-rift', name: 'Void Rift', icon: `${ICON_BASE}/weapons/staff_50.png`, description: 'Open void rift dealing sustained damage', cooldown: 12, manaCost: 35, effect: 'zone DoT', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'void-pull', name: 'Void Pull', icon: `${ICON_BASE}/weapons/Staff_51.png`, description: 'Pull all enemies toward point', cooldown: 15, manaCost: 30, effect: 'AoE pull', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'voidspire-collapse', name: "Voidspire's Collapse", icon: `${ICON_BASE}/weapons/Staff_52.png`, description: 'Create massive void implosion', cooldown: 70, manaCost: 70, effect: 'AoE implosion', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'arcane-fury': {
      slot4: [
        { id: 'fury-surge', name: 'Arcane Surge', icon: `${ICON_BASE}/weapons/staff_44.png`, description: 'Boost all spell damage by 40%', cooldown: 15, manaCost: 20, effect: '+40% damage 8s', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'fury-volley', name: 'Fury Volley', icon: `${ICON_BASE}/weapons/staff_45.png`, description: 'Rapid multi-target arcane bolts', cooldown: 8, manaCost: 28, effect: 'multi-target', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'arcane-fury-overdrive', name: "Arcane Fury's Overdrive", icon: `${ICON_BASE}/weapons/staff_46.png`, description: 'All spells instant cast for 5s', cooldown: 90, manaCost: 50, effect: 'instant cast 5s', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'mystic-grudge': {
      slot4: [
        { id: 'mystic-drain', name: 'Mana Drain', icon: `${ICON_BASE}/weapons/staff_47.png`, description: 'Steal mana from target', cooldown: 10, manaCost: 0, effect: 'mana steal', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'mystic-siphon', name: 'Arcane Siphon', icon: `${ICON_BASE}/weapons/staff_48.png`, description: 'Convert enemy mana to health', cooldown: 12, manaCost: 15, effect: 'mana to HP', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'mystic-grudge-infinity', name: "Mystic Grudge's Infinity", icon: `${ICON_BASE}/weapons/staff_49.png`, description: 'Infinite mana for 8s', cooldown: 120, manaCost: 0, effect: 'free casting 8s', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'ether-heart': {
      slot4: [
        { id: 'ether-restore', name: 'Ether Restore', icon: `${ICON_BASE}/misc/Life.png`, description: 'Restore mana to all allies', cooldown: 15, manaCost: 0, effect: 'AoE mana restore', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'ether-link', name: 'Mana Link', icon: `${ICON_BASE}/misc/Lights.png`, description: 'Share mana pool with ally', cooldown: 20, manaCost: 10, effect: 'mana share 10s', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'ether-heart-wellspring', name: "Ether Heart's Wellspring", icon: `${ICON_BASE}/misc/Core.png`, description: 'Create mana fountain healing and restoring mana', cooldown: 60, manaCost: 40, effect: 'zone heal + mana', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'void-warden': {
      slot4: [
        { id: 'warden-silence', name: 'Void Silence', icon: `${ICON_BASE}/weapons/shield_24.png`, description: 'Silence all enemies in area', cooldown: 15, manaCost: 35, effect: 'AoE silence 4s', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'warden-dispel', name: 'Mass Dispel', icon: `${ICON_BASE}/weapons/shield_25.png`, description: 'Remove all buffs from enemies', cooldown: 18, manaCost: 30, effect: 'AoE dispel', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'void-warden-lockdown', name: "Void Warden's Lockdown", icon: `${ICON_BASE}/weapons/shield_26.png`, description: 'No spells can be cast in area for 5s', cooldown: 80, manaCost: 60, effect: 'anti-magic zone', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'chaos-spire': {
      slot4: [
        { id: 'chaos-bolt', name: 'Chaos Bolt', icon: `${ICON_BASE}/misc/Burns.png`, description: 'Random element damage, always crits', cooldown: 8, manaCost: 25, effect: 'random element + crit', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'chaos-storm', name: 'Chaos Storm', icon: `${ICON_BASE}/misc/Lava.png`, description: 'Multi-element AoE storm', cooldown: 12, manaCost: 35, effect: 'random AoE', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'chaos-spire-entropy', name: "Chaos Spire's Entropy", icon: `${ICON_BASE}/misc/Firestar.png`, description: 'Reality warps, random devastating effects', cooldown: 60, manaCost: 55, effect: 'random mega effect', slot: 'slot5', slotLabel: 'Ultimate' },
    },
  },
};

// SPEAR SKILLS — Spear_01 to Spear_40
const SPEAR_SKILLS = {
  sharedSkills: {
    slot1: [
      { id: 'spear-thrust', name: 'Spear Thrust', icon: `${ICON_BASE}/weapons/Spear_01.png`, description: 'Long reach thrust attack', cooldown: 0, manaCost: 0, damageMultiplier: 1.0, slot: 'slot1', slotLabel: 'Attack' },
      { id: 'spear-sweep', name: 'Low Sweep', icon: `${ICON_BASE}/weapons/Spear_02.png`, description: 'Wide sweeping attack at legs', cooldown: 0, manaCost: 0, damageMultiplier: 0.9, effect: 'trip', slot: 'slot1', slotLabel: 'Attack' },
      { id: 'spear-poke', name: 'Quick Poke', icon: `${ICON_BASE}/weapons/Spear_03.png`, description: 'Fast jabbing attack', cooldown: 0, manaCost: 0, damageMultiplier: 0.7, effect: 'fast', slot: 'slot1', slotLabel: 'Attack' },
    ],
    slot2: [
      { id: 'spear-impale', name: 'Impale', icon: `${ICON_BASE}/weapons/Spear_04.png`, description: 'Deep impaling thrust for 180% damage', cooldown: 6, manaCost: 18, damageMultiplier: 1.8, slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'spear-whirlwind', name: 'Spear Spin', icon: `${ICON_BASE}/weapons/Spear_05.png`, description: 'Spin with spear extended hitting all', cooldown: 8, manaCost: 22, effect: 'AoE 360', slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'spear-javelin', name: 'Javelin Throw', icon: `${ICON_BASE}/weapons/Spear_06.png`, description: 'Throw spear for ranged damage', cooldown: 10, manaCost: 20, effect: 'ranged + pin', slot: 'slot2', slotLabel: 'Core Skill' },
    ],
    slot3: [
      { id: 'spear-brace', name: 'Brace', icon: `${ICON_BASE}/weapons/Spear_07.png`, description: 'Brace spear against charges', cooldown: 8, manaCost: 10, effect: 'counter charge 200%', slot: 'slot3', slotLabel: 'Defensive' },
      { id: 'spear-vault', name: 'Vault', icon: `${ICON_BASE}/misc/Flow.png`, description: 'Pole vault over enemies', cooldown: 10, manaCost: 12, effect: 'leap + i-frames', slot: 'slot3', slotLabel: 'Defensive' },
      { id: 'spear-deflect', name: 'Deflect', icon: `${ICON_BASE}/weapons/Spear_08.png`, description: 'Deflect projectiles with shaft', cooldown: 6, manaCost: 8, effect: 'projectile block', slot: 'slot3', slotLabel: 'Defensive' },
    ],
  },
  weapons: {
    'bloodlance': {
      slot4: [
        { id: 'bloodlance-impale', name: 'Blood Impale', icon: `${ICON_BASE}/weapons/Spear_09.png`, description: 'Impale causing massive bleed', cooldown: 10, manaCost: 25, effect: 'bleed 8s', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'bloodlance-drain', name: 'Lance Drain', icon: `${ICON_BASE}/weapons/Spear_10.png`, description: 'Heal from thrust damage', cooldown: 12, manaCost: 20, effect: 'lifesteal', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'bloodlance-skewer', name: "Bloodlance's Skewer", icon: `${ICON_BASE}/weapons/Spear_11.png`, description: 'Charge through enemies impaling all', cooldown: 50, manaCost: 45, effect: 'charge + impale all', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'wraithpike': {
      slot4: [
        { id: 'wraithpike-phase', name: 'Phase Thrust', icon: `${ICON_BASE}/weapons/Spear_12.png`, description: 'Thrust passes through shields', cooldown: 8, manaCost: 22, effect: 'unblockable', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'wraithpike-shadow', name: 'Shadow Spear', icon: `${ICON_BASE}/weapons/Spear_13.png`, description: 'Throw spectral spear copy', cooldown: 10, manaCost: 25, effect: 'magic ranged', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'wraithpike-reaper', name: "Wraithpike's Reaper", icon: `${ICON_BASE}/weapons/Spear_14.png`, description: 'Become spectral, all thrusts phase through armor', cooldown: 60, manaCost: 50, effect: 'true damage 8s', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'emberspear': {
      slot4: [
        { id: 'ember-thrust', name: 'Blazing Thrust', icon: `${ICON_BASE}/weapons/Spear_15.png`, description: 'Fire-imbued thrust causing burn', cooldown: 8, manaCost: 20, effect: 'burn 5s', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'ember-javelin', name: 'Fire Javelin', icon: `${ICON_BASE}/weapons/Spear_16.png`, description: 'Flaming javelin throw with AoE', cooldown: 12, manaCost: 28, effect: 'AoE fire', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'emberspear-eruption', name: "Emberspear's Eruption", icon: `${ICON_BASE}/weapons/Spear_17.png`, description: 'Slam spear creating fire geyser', cooldown: 55, manaCost: 50, effect: 'ground fire AoE', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'ironpike': {
      slot4: [
        { id: 'iron-slam', name: 'Iron Slam', icon: `${ICON_BASE}/weapons/Spear_18.png`, description: 'Heavy overhead slam stun', cooldown: 12, manaCost: 25, effect: 'stun 2s', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'iron-wall', name: 'Pike Wall', icon: `${ICON_BASE}/weapons/Spear_19.png`, description: 'Create defensive pike stance', cooldown: 15, manaCost: 20, effect: 'block + counter', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'ironpike-fortress', name: "Ironpike's Fortress", icon: `${ICON_BASE}/weapons/Spear_20.png`, description: 'Become immovable, counter all attacks', cooldown: 70, manaCost: 40, effect: 'counter stance 5s', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'duskpiercer': {
      slot4: [
        { id: 'dusk-swift', name: 'Swift Strikes', icon: `${ICON_BASE}/weapons/Spear_21.png`, description: 'Three rapid thrusts', cooldown: 6, manaCost: 18, damageMultiplier: 0.6, effect: '3 hits', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'dusk-dash', name: 'Piercing Dash', icon: `${ICON_BASE}/weapons/Spear_22.png`, description: 'Dash forward with spear extended', cooldown: 10, manaCost: 22, effect: 'dash + damage', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'duskpiercer-storm', name: "Duskpiercer's Storm", icon: `${ICON_BASE}/weapons/Spear_23.png`, description: 'Flurry of 10 rapid thrusts', cooldown: 45, manaCost: 45, effect: '10 hit combo', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'gorespear': {
      slot4: [
        { id: 'gore-rend', name: 'Gore Rend', icon: `${ICON_BASE}/weapons/Spear_24.png`, description: 'Ripping thrust causing bleed', cooldown: 8, manaCost: 20, effect: 'heavy bleed', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'gore-charge', name: 'Charging Pierce', icon: `${ICON_BASE}/weapons/Spear_25.png`, description: 'Charge with spear lowered', cooldown: 12, manaCost: 25, effect: 'charge + knockdown', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'gorespear-annihilate', name: "Gorespear's Annihilate", icon: `${ICON_BASE}/weapons/Spear_26.png`, description: 'Massive impale dealing 400% damage', cooldown: 60, manaCost: 55, damageMultiplier: 4.0, slot: 'slot5', slotLabel: 'Ultimate' },
    },
  },
};

// HAMMER SKILLS — Hammer_01 to Hammer_54
const HAMMER_SKILLS = {
  sharedSkills: {
    slot1: [
      { id: 'hammer-smash', name: 'Smash', icon: `${ICON_BASE}/weapons/Hammer_01.png`, description: 'Heavy overhead smash', cooldown: 0, manaCost: 0, damageMultiplier: 1.3, slot: 'slot1', slotLabel: 'Attack' },
      { id: 'hammer-swing', name: 'Side Swing', icon: `${ICON_BASE}/weapons/Hammer_02.png`, description: 'Wide horizontal swing', cooldown: 0, manaCost: 0, damageMultiplier: 1.1, effect: 'knockback', slot: 'slot1', slotLabel: 'Attack' },
      { id: 'hammer-uppercut', name: 'Uppercut', icon: `${ICON_BASE}/weapons/Hammer_03.png`, description: 'Upward swing launching enemies', cooldown: 0, manaCost: 0, damageMultiplier: 1.0, effect: 'knockup', slot: 'slot1', slotLabel: 'Attack' },
    ],
    slot2: [
      { id: 'hammer-quake', name: 'Earthquake', icon: `${ICON_BASE}/weapons/Hammer_04.png`, description: 'Ground slam creating shockwave', cooldown: 8, manaCost: 25, effect: 'AoE knockdown', slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'hammer-crush', name: 'Crushing Blow', icon: `${ICON_BASE}/weapons/Hammer_05.png`, description: 'Massive single target hit', cooldown: 6, manaCost: 20, damageMultiplier: 2.0, slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'hammer-shatter', name: 'Shield Shatter', icon: `${ICON_BASE}/weapons/Hammer_06.png`, description: 'Break shields and armor', cooldown: 10, manaCost: 22, effect: 'armor break + stun', slot: 'slot2', slotLabel: 'Core Skill' },
    ],
    slot3: [
      { id: 'hammer-block', name: 'Hammer Guard', icon: `${ICON_BASE}/weapons/Hammer_07.png`, description: 'Block with hammer haft', cooldown: 8, manaCost: 10, effect: '60% reduction', slot: 'slot3', slotLabel: 'Defensive' },
      { id: 'hammer-charge', name: 'Bull Rush', icon: `${ICON_BASE}/weapons/Hammer_08.png`, description: 'Charge forward with hammer', cooldown: 10, manaCost: 15, effect: 'charge + stun', slot: 'slot3', slotLabel: 'Defensive' },
      { id: 'hammer-stomp', name: 'Ground Stomp', icon: `${ICON_BASE}/weapons/Hammer_09.png`, description: 'Stomp stunning nearby enemies', cooldown: 12, manaCost: 18, effect: 'AoE stun 1.5s', slot: 'slot3', slotLabel: 'Defensive' },
    ],
  },
  weapons: {
    'skullcrusher': {
      slot4: [
        { id: 'skull-smash', name: 'Skull Smash', icon: `${ICON_BASE}/weapons/Hammer_10.png`, description: 'Devastating head blow', cooldown: 12, manaCost: 28, effect: 'stun 3s + armor break', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'skull-execute', name: 'Brain Bash', icon: `${ICON_BASE}/weapons/Hammer_11.png`, description: 'Execute stunned enemies', cooldown: 15, manaCost: 30, damageMultiplier: 3.0, effect: 'execute stunned', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'skullcrusher-doom', name: "Skullcrusher's Doom", icon: `${ICON_BASE}/weapons/Hammer_12.png`, description: 'Massive overhead slam stunning everything', cooldown: 60, manaCost: 50, effect: 'AoE stun 4s', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'bloodhammer': {
      slot4: [
        { id: 'blood-smash', name: 'Blood Smash', icon: `${ICON_BASE}/weapons/Hammer_13.png`, description: 'Heal on each hammer hit', cooldown: 10, manaCost: 22, effect: 'lifesteal', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'blood-quake', name: 'Crimson Quake', icon: `${ICON_BASE}/weapons/Hammer_14.png`, description: 'AoE slam with lifesteal', cooldown: 14, manaCost: 30, effect: 'AoE lifesteal', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'bloodhammer-carnage', name: "Bloodhammer's Carnage", icon: `${ICON_BASE}/weapons/Hammer_15.png`, description: 'Blood rage: +50% damage, heal per kill', cooldown: 55, manaCost: 40, effect: 'berserker + heal on kill', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'wraithmaul': {
      slot4: [
        { id: 'wraith-crush', name: 'Spirit Crush', icon: `${ICON_BASE}/weapons/Hammer_16.png`, description: 'Magic damage hammer blow', cooldown: 8, manaCost: 25, effect: 'magic damage', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'wraith-fear', name: 'Dread Smash', icon: `${ICON_BASE}/weapons/Hammer_17.png`, description: 'Fear enemies on hit', cooldown: 12, manaCost: 28, effect: 'fear 3s', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'wraithmaul-oblivion', name: "Wraithmaul's Oblivion", icon: `${ICON_BASE}/weapons/Hammer_18.png`, description: 'Banish enemy to shadow realm briefly', cooldown: 70, manaCost: 55, effect: 'banish 4s', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'emberforge': {
      slot4: [
        { id: 'ember-smash', name: 'Molten Strike', icon: `${ICON_BASE}/weapons/Hammer_19.png`, description: 'Fire damage slam', cooldown: 8, manaCost: 22, effect: 'burn 5s', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'ember-ground', name: 'Lava Pool', icon: `${ICON_BASE}/weapons/Hammer_20.png`, description: 'Create lava on ground', cooldown: 14, manaCost: 35, effect: 'ground fire 6s', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'emberforge-volcano', name: "Emberforge's Volcano", icon: `${ICON_BASE}/weapons/Hammer_21.png`, description: 'Volcanic eruption from ground', cooldown: 65, manaCost: 60, effect: 'massive fire AoE', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'ironmallet': {
      slot4: [
        { id: 'iron-crush', name: 'Iron Crush', icon: `${ICON_BASE}/weapons/Hammer_22.png`, description: 'Armor-crushing blow', cooldown: 10, manaCost: 25, effect: 'armor destroy', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'iron-fortress', name: 'Fortress Stance', icon: `${ICON_BASE}/weapons/Hammer_23.png`, description: 'Gain shield and reflect', cooldown: 15, manaCost: 20, effect: 'shield + reflect', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'ironmallet-bulwark', name: "Ironmallet's Bulwark", icon: `${ICON_BASE}/weapons/Hammer_24.png`, description: 'Team-wide damage immunity 3s', cooldown: 90, manaCost: 45, effect: 'team invuln', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'duskmallet': {
      slot4: [
        { id: 'dusk-flash', name: 'Flash Smash', icon: `${ICON_BASE}/weapons/Hammer_25.png`, description: 'Instant teleport + slam', cooldown: 8, manaCost: 22, effect: 'blink + stun', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'dusk-clone', name: 'Shadow Clone', icon: `${ICON_BASE}/weapons/Hammer_26.png`, description: 'Create hammer-wielding clone', cooldown: 15, manaCost: 30, effect: 'clone 6s', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'duskmallet-eclipse', name: "Duskmallet's Eclipse", icon: `${ICON_BASE}/weapons/Hammer_27.png`, description: 'Darkness slam blinding all', cooldown: 50, manaCost: 45, effect: 'AoE blind + stun', slot: 'slot5', slotLabel: 'Ultimate' },
    },
  },
};

// SCYTHE SKILLS — Scythe_01 to Scythe_07 + reuse dark/death icons
const SCYTHE_SKILLS = {
  sharedSkills: {
    slot1: [
      { id: 'scythe-reap', name: 'Reap', icon: `${ICON_BASE}/weapons/Scythe_01.png`, description: 'Wide sweeping reap attack', cooldown: 0, manaCost: 0, damageMultiplier: 1.2, slot: 'slot1', slotLabel: 'Attack' },
      { id: 'scythe-slash', name: 'Crescent Slash', icon: `${ICON_BASE}/weapons/Scythe_02.png`, description: 'Arcing slash in crescent', cooldown: 0, manaCost: 0, damageMultiplier: 1.0, effect: 'bleed', slot: 'slot1', slotLabel: 'Attack' },
      { id: 'scythe-thrust', name: 'Piercing Thrust', icon: `${ICON_BASE}/weapons/Scythe_03.png`, description: 'Use scythe point to thrust', cooldown: 0, manaCost: 0, damageMultiplier: 1.1, effect: 'armor pen', slot: 'slot1', slotLabel: 'Attack' },
    ],
    slot2: [
      { id: 'scythe-harvest', name: 'Soul Harvest', icon: `${ICON_BASE}/weapons/Scythe_04.png`, description: 'AoE reap stealing health per hit', cooldown: 8, manaCost: 25, effect: 'AoE + lifesteal', slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'scythe-doom', name: 'Death Mark', icon: `${ICON_BASE}/weapons/Scythe_05.png`, description: 'Mark enemy for death after 5s', cooldown: 15, manaCost: 30, effect: 'delayed execute', slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'scythe-spin', name: 'Reaper Spin', icon: `${ICON_BASE}/weapons/Scythe_06.png`, description: 'Spin with scythe extended', cooldown: 10, manaCost: 22, effect: 'AoE 360', slot: 'slot2', slotLabel: 'Core Skill' },
    ],
    slot3: [
      { id: 'scythe-phase', name: 'Death Step', icon: `${ICON_BASE}/misc/Flow.png`, description: 'Phase through shadow realm briefly', cooldown: 10, manaCost: 18, effect: 'invulnerable dash', slot: 'slot3', slotLabel: 'Defensive' },
      { id: 'scythe-fear', name: 'Reaper Fear', icon: `${ICON_BASE}/weapons/Scythe_07.png`, description: 'Terrify nearby enemies', cooldown: 15, manaCost: 22, effect: 'AoE fear 3s', slot: 'slot3', slotLabel: 'Defensive' },
      { id: 'scythe-drain', name: 'Life Drain', icon: `${ICON_BASE}/misc/Life.png`, description: 'Drain life from nearby enemies', cooldown: 12, manaCost: 20, effect: 'AoE lifesteal', slot: 'slot3', slotLabel: 'Defensive' },
    ],
  },
  weapons: {
    'deathreaver': {
      slot4: [
        { id: 'death-reap', name: 'Final Reaping', icon: `${ICON_BASE}/weapons/Scythe_04.png`, description: 'Execute below 20% HP', cooldown: 12, manaCost: 30, effect: 'execute', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'death-curse', name: 'Death Curse', icon: `${ICON_BASE}/misc/Chaos.png`, description: 'Curse reducing healing received', cooldown: 10, manaCost: 25, effect: '-50% healing 8s', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'deathreaver-apocalypse', name: "Deathreaver's Apocalypse", icon: `${ICON_BASE}/weapons/Scythe_01.png`, description: 'Reap all enemies in massive arc', cooldown: 60, manaCost: 55, damageMultiplier: 3.5, effect: 'AoE execute', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'soulscythe': {
      slot4: [
        { id: 'soul-steal', name: 'Soul Steal', icon: `${ICON_BASE}/misc/Chaos_2.png`, description: 'Steal buff from enemy', cooldown: 10, manaCost: 25, effect: 'buff steal', slot: 'slot4', slotLabel: 'Weapon Special' },
        { id: 'soul-rend', name: 'Soul Rend', icon: `${ICON_BASE}/weapons/Scythe_05.png`, description: 'Deal magic damage ignoring armor', cooldown: 8, manaCost: 22, effect: 'true magic', slot: 'slot4', slotLabel: 'Weapon Special' },
      ],
      slot5: { id: 'soulscythe-harvest', name: "Soulscythe's Harvest", icon: `${ICON_BASE}/weapons/Scythe_02.png`, description: 'Harvest all souls in area, gaining power per kill', cooldown: 70, manaCost: 60, effect: 'AoE + stacking power', slot: 'slot5', slotLabel: 'Ultimate' },
    },
  },
};

// TOOLS — Mining Pick, Lumber Axe, Skinning Knife, Harvesting Sickle, Fishing Rod, Engineer's Toolkit
// Use various icons from existing sets
const TOOL_SKILLS = {
  sharedSkills: {
    slot1: [
      { id: 'tool-strike', name: 'Tool Strike', icon: `${ICON_BASE}/weapons/Hammer_28.png`, description: 'Basic melee attack with tool', cooldown: 0, manaCost: 0, damageMultiplier: 0.6, slot: 'slot1', slotLabel: 'Attack' },
      { id: 'tool-throw', name: 'Tool Throw', icon: `${ICON_BASE}/weapons/Hammer_29.png`, description: 'Throw tool for ranged damage', cooldown: 0, manaCost: 0, damageMultiplier: 0.5, effect: 'ranged', slot: 'slot1', slotLabel: 'Attack' },
    ],
    slot2: [
      { id: 'tool-harvest', name: 'Efficient Harvest', icon: `${ICON_BASE}/weapons/Hammer_30.png`, description: 'Gather resources faster', cooldown: 0, manaCost: 0, effect: '+20% gather speed', slot: 'slot2', slotLabel: 'Core Skill' },
      { id: 'tool-prospect', name: 'Prospect', icon: `${ICON_BASE}/misc/Glow.png`, description: 'Reveal nearby resource nodes', cooldown: 30, manaCost: 10, effect: 'detect resources', slot: 'slot2', slotLabel: 'Core Skill' },
    ],
    slot3: [
      { id: 'tool-dodge', name: 'Quick Step', icon: `${ICON_BASE}/misc/Flow.png`, description: 'Dodge while gathering', cooldown: 8, manaCost: 5, effect: 'dodge', slot: 'slot3', slotLabel: 'Defensive' },
    ],
  },
  weapons: {
    'mining-pick': {
      slot4: [{ id: 'pick-strike', name: 'Pickaxe Strike', icon: `${ICON_BASE}/weapons/Hammer_31.png`, description: 'Heavy pick swing, bonus vs stone enemies', cooldown: 8, manaCost: 12, effect: '+50% vs stone', slot: 'slot4', slotLabel: 'Weapon Special' }],
      slot5: { id: 'pick-vein', name: 'Vein Finder', icon: `${ICON_BASE}/weapons/Hammer_32.png`, description: 'Reveal all ore veins in large area', cooldown: 60, manaCost: 20, effect: 'detect ore', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'lumber-axe': {
      slot4: [{ id: 'lumber-chop', name: 'Timber Chop', icon: `${ICON_BASE}/weapons/Axe_46.png`, description: 'Fell trees in one hit at high level', cooldown: 5, manaCost: 10, effect: 'instant harvest', slot: 'slot4', slotLabel: 'Weapon Special' }],
      slot5: { id: 'lumber-clear', name: 'Clear Cut', icon: `${ICON_BASE}/weapons/Axe_47.png`, description: 'Harvest all trees in area', cooldown: 60, manaCost: 25, effect: 'AoE harvest', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'skinning-knife': {
      slot4: [{ id: 'skin-precise', name: 'Precise Cut', icon: `${ICON_BASE}/weapons/Dagger_22.png`, description: 'Higher quality leather/hide', cooldown: 0, manaCost: 5, effect: '+quality', slot: 'slot4', slotLabel: 'Weapon Special' }],
      slot5: { id: 'skin-master', name: 'Master Skinner', icon: `${ICON_BASE}/weapons/Dagger_23.png`, description: 'Double materials from skinning', cooldown: 60, manaCost: 15, effect: 'double yield', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'harvesting-sickle': {
      slot4: [{ id: 'sickle-sweep', name: 'Harvest Sweep', icon: `${ICON_BASE}/weapons/Scythe_03.png`, description: 'Harvest all herbs in reach', cooldown: 5, manaCost: 8, effect: 'AoE harvest', slot: 'slot4', slotLabel: 'Weapon Special' }],
      slot5: { id: 'sickle-bloom', name: 'Force Bloom', icon: `${ICON_BASE}/misc/NatureFlower.png`, description: 'Force nearby plants to bloom for harvest', cooldown: 120, manaCost: 30, effect: 'respawn herbs', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'fishing-rod': {
      slot4: [{ id: 'fish-cast', name: 'Lucky Cast', icon: `${ICON_BASE}/weapons/Bow_14.png`, description: 'Increased rare fish chance', cooldown: 0, manaCost: 5, effect: '+luck', slot: 'slot4', slotLabel: 'Weapon Special' }],
      slot5: { id: 'fish-net', name: 'Net Toss', icon: `${ICON_BASE}/weapons/Arrow_09.png`, description: 'Catch multiple fish at once', cooldown: 60, manaCost: 20, effect: 'multi-catch', slot: 'slot5', slotLabel: 'Ultimate' },
    },
    'engineers-toolkit': {
      slot4: [{ id: 'eng-repair', name: 'Quick Repair', icon: `${ICON_BASE}/weapons/Hammer_33.png`, description: 'Repair equipment in field', cooldown: 30, manaCost: 15, effect: 'repair', slot: 'slot4', slotLabel: 'Weapon Special' }],
      slot5: { id: 'eng-turret', name: 'Deploy Turret', icon: `${ICON_BASE}/weapons/Crossbow_05.png`, description: 'Place auto-attacking turret', cooldown: 60, manaCost: 40, effect: 'summon turret', slot: 'slot5', slotLabel: 'Ultimate' },
    },
  },
};

// TOMES — 6 element types × 2 weapons each, using Book icons
function buildTomeSkills(element, emoji, iconStart, effect1, effect2) {
  const b = (n) => `${ICON_BASE}/weapons/Book_${n}.png`;
  return {
    sharedSkills: {
      slot1: [
        { id: `${element}-tome-bolt`, name: `${element[0].toUpperCase()+element.slice(1)} Bolt`, icon: b(iconStart), description: `Basic ${element} tome projectile`, cooldown: 0, manaCost: 5, damageMultiplier: 1.0, slot: 'slot1', slotLabel: 'Attack' },
      ],
      slot2: [
        { id: `${element}-tome-blast`, name: `${element[0].toUpperCase()+element.slice(1)} Blast`, icon: b(iconStart+1), description: `Powerful ${element} burst`, cooldown: 6, manaCost: 20, damageMultiplier: 1.5, effect: effect1, slot: 'slot2', slotLabel: 'Core Skill' },
      ],
      slot3: [
        { id: `${element}-tome-ward`, name: `${element[0].toUpperCase()+element.slice(1)} Ward`, icon: b(iconStart+2), description: `Protective ${element} barrier`, cooldown: 12, manaCost: 20, effect: effect2, slot: 'slot3', slotLabel: 'Defensive' },
      ],
    },
    weapons: {},
  };
}

// ============================================================
// BUILD & OUTPUT
// ============================================================
console.log('Parsing weaponSkills.ts...');
const parsed = parseWeaponSkillsTS();

const output = {
  version: '2.0.0',
  updated: new Date().toISOString().split('T')[0],
  description: 'Complete weapon skills database for Grudge Warlords - all weapon types with icons',
  iconBase: ICON_BASE,
  weaponTypes: {},
  totalSkills: 0,
  totalWeaponTypes: 0,
};

// Process parsed TS types
for (const [constName, meta] of Object.entries(TYPE_MAP)) {
  if (parsed[constName]) {
    console.log(`  ✓ ${meta.name} (${meta.key})`);
    const data = transformTypeSkills(parsed[constName]);
    output.weaponTypes[meta.key] = { name: meta.name, emoji: meta.emoji, ...data };
    output.totalSkills += countSkills(data);
  } else {
    console.warn(`  ✗ ${meta.name} not found`);
  }
}

// Add manually defined types
const manualTypes = {
  arcaneStaves: { name: 'Arcane Staves', emoji: '🔮', ...ARCANE_STAVES },
  spears: { name: 'Spears', emoji: '🔱', ...SPEAR_SKILLS },
  hammers: { name: 'Hammers', emoji: '🔨', ...HAMMER_SKILLS },
  scythes: { name: 'Scythes', emoji: '⚰️', ...SCYTHE_SKILLS },
  tools: { name: 'Tools', emoji: '🔧', ...TOOL_SKILLS },
  fireTomes: { name: 'Fire Tomes', emoji: '🔥', ...buildTomeSkills('fire', '🔥', 16, 'burn 5s', 'fire shield') },
  frostTomes: { name: 'Frost Tomes', emoji: '❄️', ...buildTomeSkills('frost', '❄️', 18, 'freeze 2s', 'ice armor') },
  natureTomes: { name: 'Nature Tomes', emoji: '🌿', ...buildTomeSkills('nature', '🌿', 20, 'HoT 8s', 'barkskin') },
  holyTomes: { name: 'Holy Tomes', emoji: '✨', ...buildTomeSkills('holy', '✨', 22, 'heal 30%', 'divine shield') },
  arcaneTomes: { name: 'Arcane Tomes', emoji: '🔮', ...buildTomeSkills('arcane', '🔮', 24, 'mana drain', 'spell ward') },
  lightningTomes: { name: 'Lightning Tomes', emoji: '⚡', ...buildTomeSkills('lightning', '⚡', 16, 'shock + stun', 'static shield') },
};

for (const [key, data] of Object.entries(manualTypes)) {
  console.log(`  + ${data.name} (${key})`);
  output.weaponTypes[key] = data;
  output.totalSkills += countSkills(data);
}

output.totalWeaponTypes = Object.keys(output.weaponTypes).length;
console.log(`\nTotal: ${output.totalWeaponTypes} weapon types, ${output.totalSkills} skills`);

writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
console.log(`Written to ${OUT_PATH}`);
