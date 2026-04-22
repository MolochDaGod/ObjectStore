#!/usr/bin/env node
/**
 * ObjectStore — Master Database Generator
 *
 * Generates unified master JSON files with GRUDGE UUIDs, tier expansion,
 * and recipe linking from the canonical weapon/item definitions.
 *
 * Output: api/v1/master-items.json, master-recipes.json, master-materials.json, master-attributes.json
 *
 * Usage: node scripts/generate-master-database.mjs
 *
 * Originally from grudge-game-data-hub (now archived).
 * Moved into ObjectStore as the single source of truth.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const API_DIR = join(ROOT, 'api', 'v1');

if (!existsSync(API_DIR)) mkdirSync(API_DIR, { recursive: true });

// ============================================================
// GRUDGE UUID GENERATOR
// ============================================================
const PREFIX_MAP = {
  item: 'ITEM', recipe: 'RECP', material: 'MATL', node: 'NODE',
  food: 'FOOD', potion: 'POTN', skill: 'SKIL', attribute: 'ATTR',
  class: 'CLAS', race: 'RACE', consumable: 'CONS',
};

let sequenceCounter = 0;

function fnv1aHash8(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash = hash >>> 0;
  const h2 = (hash ^ (hash >>> 16)) >>> 0;
  return h2.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

function generateUuid(entityType, metadata = '') {
  const prefix = PREFIX_MAP[entityType] || entityType.slice(0, 4).toUpperCase();
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  sequenceCounter++;
  const seq = sequenceCounter.toString(16).toUpperCase().padStart(6, '0');
  const hashInput = `${prefix}-${ts}-${seq}-${metadata}-${Math.random()}`;
  const hash = fnv1aHash8(hashInput);
  return `${prefix}-${ts}-${seq}-${hash}`;
}

// ============================================================
// OBJECTSTORE CDN BASE
// ============================================================
const CDN = 'https://molochdagod.github.io/ObjectStore';
const ICON = (path) => `${CDN}/icons/${path}`;
const PACK_ICON = (path) => `${CDN}/icons/pack/${path}`;

// ============================================================
// TIER SYSTEM
// ============================================================
// D5: tier labels — T5 renamed to 'Heroic', T8 renamed to 'Legendary'.
// The word 'Legendary' is reserved for the T8 tier label only. The
// 'Artifact' *category* (see scripts/defs/artifacts.mjs, D3) covers end-game
// world-found items and must not reuse these tier labels.
const TIERS = [
  { tier: 1, name: 'Bronze',  color: '#8b7355', label: 'Common' },
  { tier: 2, name: 'Silver',  color: '#a8a8a8', label: 'Uncommon' },
  { tier: 3, name: 'Blue',    color: '#4a9eff', label: 'Rare' },
  { tier: 4, name: 'Purple',  color: '#9d4dff', label: 'Epic' },
  { tier: 5, name: 'Red',     color: '#ff4d4d', label: 'Heroic' },
  { tier: 6, name: 'Orange',  color: '#ffaa00', label: 'Mythic' },
  { tier: 7, name: 'Gold',    color: '#d4a84b', label: 'Ancient' },
  { tier: 8, name: 'Shimmer', color: '#f0d890', label: 'Legendary' },
];

function scaleStat(base, perTier, tier) {
  return Math.round(base + perTier * (tier - 1));
}

// ============================================================
// ICON MAPPING
// ============================================================
const WEAPON_ICONS = {
  swords:     (i) => PACK_ICON(`weapons/Sword_${String(i).padStart(2, '0')}.png`),
  axes:       (i) => PACK_ICON(`weapons/Axe_${String(i).padStart(2, '0')}.png`),
  daggers:    (i) => PACK_ICON(`weapons/Dagger_${String(i).padStart(2, '0')}.png`),
  hammers:    (i) => PACK_ICON(`weapons/Hammer_${String(i).padStart(2, '0')}.png`),
  greatswords:(i) => PACK_ICON(`weapons/Sword_${String(i + 9).padStart(2, '0')}.png`),
  greataxes:  (i) => PACK_ICON(`weapons/Axe_${String(i + 9).padStart(2, '0')}.png`),
  spears:     (i) => PACK_ICON(`weapons/Spear_${String(i).padStart(2, '0')}.png`),
  maces:      (i) => PACK_ICON(`weapons/Hammer_${String(i + 9).padStart(2, '0')}.png`),
  shields:    (i) => PACK_ICON(`weapons/Shield_${String(i).padStart(2, '0')}.png`),
  bows:       (i) => PACK_ICON(`weapons/Bow_${String(i).padStart(2, '0')}.png`),
  crossbows:  (i) => PACK_ICON(`weapons/Crossbow_${String(i).padStart(2, '0')}.png`),
  guns:       (i) => PACK_ICON(`weapons/Crossbow_${String(i + 9).padStart(2, '0')}.png`),
  fireStaves: (i) => PACK_ICON(`weapons/Staff_${String(i).padStart(2, '0')}.png`),
  frostStaves:(i) => PACK_ICON(`weapons/Staff_${String(i + 4).padStart(2, '0')}.png`),
  holyStaves: (i) => PACK_ICON(`weapons/Staff_${String(i + 8).padStart(2, '0')}.png`),
  lightningStaves: (i) => PACK_ICON(`weapons/Staff_${String(i + 12).padStart(2, '0')}.png`),
  natureStaves:    (i) => PACK_ICON(`weapons/Staff_${String(i + 16).padStart(2, '0')}.png`),
  tomes:      (i) => PACK_ICON(`weapons/Book_${i}.png`),
};

const POTION_ICONS = {
  health:      ICON('consumables/health_potion.png'),
  mana:        ICON('consumables/mana_potion.png'),
  stamina:     ICON('consumables/potion_3.png'),
  antidote:    ICON('consumables/potion_5.png'),
  rage:        ICON('consumables/potion_8.png'),
  speed:       ICON('consumables/potion_12.png'),
  defense:     ICON('consumables/potion_15.png'),
  invisibility:ICON('consumables/potion_18.png'),
  fireResist:  ICON('consumables/potion_22.png'),
  frostResist: ICON('consumables/potion_25.png'),
  focus:       ICON('consumables/potion_28.png'),
  luck:        ICON('consumables/potion_32.png'),
  exp:         ICON('consumables/potion_35.png'),
  flight:      ICON('consumables/potion_38.png'),
  divine:      ICON('consumables/potion_42.png'),
};

// ============================================================
// WEAPON DEFINITIONS (canonical data)
// ============================================================
const WEAPON_DEFINITIONS = {
  swords: {
    profession: 'Miner', category: '1h', items: [
      { name: 'Bloodfeud Blade',  desc: 'Forged in endless clan blood feuds. Vengeful Slash: Builds Grudge Mark stack.', mats: { 'Iron Ingot': 3, 'Leather': 1 }, stats: { damageBase: 50, damagePerTier: 12, speedBase: 100, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 }, abilities: ['Blood Rush', 'Iron Grudge', 'Clan Charge', 'Heroic Cleave', 'Parry Counter', 'Deep Wound'], signature: 'Crimson Reprisal', passives: ['Bloodlust (5% lifesteal)', 'Swift Vengeance (+15% atk speed)', 'Deep Cuts (+20% bleed dmg)'] },
      { name: 'Wraithfang',       desc: 'Whispers forgotten grudges. Shadow Edge: Dash + Stun.', mats: { 'Steel Ingot': 3, 'Void Dust': 1 }, stats: { damageBase: 55, damagePerTier: 13, speedBase: 80, speedPerTier: 20, critBase: 5, critPerTier: 0.8, blockBase: 3, blockPerTier: 0.8, defenseBase: 15, defensePerTier: 5 }, abilities: ['Shadow Edge', 'Execute', 'Bleed Chain', 'Fatal Strike'], signature: "Night's Judgment", passives: ['Life Leech', 'Aggressive Rush', 'Grudge Bleed'] },
      { name: 'Oathbreaker',      desc: 'Breaks ancient oaths. Lunging Strike: Ranged thrust.', mats: { 'Dark Iron Ingot': 3, 'Obsidian': 1 }, stats: { damageBase: 48, damagePerTier: 11, speedBase: 120, speedPerTier: 30, critBase: 2, critPerTier: 0.4, blockBase: 8, blockPerTier: 1.5, defenseBase: 25, defensePerTier: 7 }, abilities: ['Lunging Strike', 'Shadow Dash', 'Fearful Swipe', 'Hamstring', "Betrayer's Mark", 'Oathbreak'], signature: 'Ancestral Curse', passives: ['Resilience', 'Armor Pen', 'Block Mastery'] },
      { name: 'Kinrend',          desc: 'Rends bonds of kinship. Kin Strike: High single target damage.', mats: { 'Blood Stone': 3, 'Bone': 2 }, stats: { damageBase: 52, damagePerTier: 12, speedBase: 110, speedPerTier: 28, critBase: 4, critPerTier: 0.6, blockBase: 4, blockPerTier: 1, defenseBase: 18, defensePerTier: 6 }, abilities: ['Kin Strike', 'Ancestral Fury', 'Family Grudge', 'Root Bind'], signature: 'Wrath of Kin', passives: ['Bloodlust', 'Swift Vengeance', 'Deep Cuts'] },
      { name: 'Dusksinger',       desc: 'Sings of twilight. Dusk Blade: Invisible dash.', mats: { 'Shadow Ingot': 3, 'Gem': 1 }, stats: { damageBase: 53, damagePerTier: 12, speedBase: 90, speedPerTier: 22, critBase: 6, critPerTier: 1, blockBase: 4, blockPerTier: 0.9, defenseBase: 17, defensePerTier: 5 }, abilities: ['Dusk Blade', 'Twilight Slash', 'Night Strike'], signature: 'Eventide Reckoning', passives: ['Shadow Walk', 'Crit Surge', 'Evasion Master'] },
      { name: 'Emberclad',        desc: 'Clad in flames. Flame Slash: Applies burn.', mats: { 'Fire Essence': 3, 'Steel Ingot': 2 }, stats: { damageBase: 56, damagePerTier: 14, speedBase: 95, speedPerTier: 24, critBase: 4, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 16, defensePerTier: 5 }, abilities: ['Flame Slash', 'Inferno Wave', 'Magma Strike'], signature: 'Solar Annihilation', passives: ['Burn Master', 'Fire Aura', 'Ember Shield'] },
    ]
  },
  axes: {
    profession: 'Miner', category: '1h', items: [
      { name: 'Gorehowl',     desc: 'Howls with gore. Rending Chop: Applies Bleed.', mats: { 'Iron Ingot': 3, 'Wood': 2 }, stats: { damageBase: 55, damagePerTier: 14, speedBase: 90, speedPerTier: 22, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 18, defensePerTier: 5 } },
      { name: 'Skullsplitter', desc: 'Splits skulls. Headcracker: Stun + Damage.', mats: { 'Steel Ingot': 3, 'Bone': 2 }, stats: { damageBase: 58, damagePerTier: 15, speedBase: 85, speedPerTier: 20, critBase: 4, critPerTier: 0.6, blockBase: 3, blockPerTier: 0.8, defenseBase: 16, defensePerTier: 5 } },
      { name: 'Veinreaver',    desc: 'Reaves veins. Blood Harvest: AoE Lifesteal.', mats: { 'Dark Iron Ingot': 3, 'Blood': 2 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 95, speedPerTier: 23, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 } },
      { name: 'Ironmaw',       desc: 'Maw of iron. Iron Bite: Ignores defense.', mats: { 'Iron Ingot': 5, 'Obsidian': 1 }, stats: { damageBase: 60, damagePerTier: 15, speedBase: 80, speedPerTier: 18, critBase: 2, critPerTier: 0.4, blockBase: 6, blockPerTier: 1.2, defenseBase: 22, defensePerTier: 7 } },
      { name: 'Dreadcleaver',  desc: 'Cleaves dread. Frenzied Chop: High burst damage.', mats: { 'Shadow Ingot': 3, 'Void Dust': 2 }, stats: { damageBase: 57, damagePerTier: 14, speedBase: 88, speedPerTier: 21, critBase: 5, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 15, defensePerTier: 5 } },
      { name: 'Bonehew',       desc: 'Hews bone. Bone Break: Reduces armor.', mats: { 'Bone': 5, 'Steel Ingot': 2 }, stats: { damageBase: 54, damagePerTier: 13, speedBase: 92, speedPerTier: 22, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 19, defensePerTier: 6 } },
    ]
  },
  daggers: {
    profession: 'Miner', category: '1h', items: [
      { name: 'Nightfang',  desc: 'Fang of night. Shadow Stab: Builds Mark.', mats: { 'Iron Ingot': 2, 'Leather': 1 }, stats: { damageBase: 35, damagePerTier: 9, speedBase: 150, speedPerTier: 35, critBase: 8, critPerTier: 1.2, blockBase: 2, blockPerTier: 0.5, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Bloodshiv',  desc: 'Drips blood. Crimson Stab: High bleed.', mats: { 'Steel Ingot': 2, 'Blood': 1 }, stats: { damageBase: 38, damagePerTier: 10, speedBase: 145, speedPerTier: 33, critBase: 7, critPerTier: 1, blockBase: 2, blockPerTier: 0.5, defenseBase: 7, defensePerTier: 3 } },
      { name: 'Wraithclaw', desc: 'Claw of wraith. Shadow Strike: AoE Silence.', mats: { 'Dark Iron Ingot': 2, 'Void Dust': 1 }, stats: { damageBase: 36, damagePerTier: 9, speedBase: 155, speedPerTier: 36, critBase: 9, critPerTier: 1.3, blockBase: 1, blockPerTier: 0.4, defenseBase: 6, defensePerTier: 2 } },
      { name: 'Emberfang',  desc: 'Burning hate. Flame Dagger: Burn DoT.', mats: { 'Fire Essence': 2, 'Steel Ingot': 1 }, stats: { damageBase: 40, damagePerTier: 10, speedBase: 140, speedPerTier: 32, critBase: 6, critPerTier: 0.9, blockBase: 2, blockPerTier: 0.5, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Ironspike',  desc: 'Unyielding iron. Pinning Stab: Root burst.', mats: { 'Iron Ingot': 4 }, stats: { damageBase: 37, damagePerTier: 9, speedBase: 148, speedPerTier: 34, critBase: 7, critPerTier: 1, blockBase: 3, blockPerTier: 0.6, defenseBase: 10, defensePerTier: 3 } },
      { name: 'Duskblade',  desc: 'Blade of dusk. Frenzied Cuts: Multi burst.', mats: { 'Shadow Ingot': 2, 'Gem': 1 }, stats: { damageBase: 42, damagePerTier: 11, speedBase: 152, speedPerTier: 35, critBase: 10, critPerTier: 1.5, blockBase: 1, blockPerTier: 0.4, defenseBase: 6, defensePerTier: 2 } },
    ]
  },
  hammers: {
    profession: 'Miner', category: '2h', items: [
      { name: 'Titanmaul',    desc: 'Titanic grudge. Earthshatter: AoE Slow.', mats: { 'Iron Ingot': 6, 'Stone': 4 }, stats: { damageBase: 75, damagePerTier: 18, speedBase: 60, speedPerTier: 14, critBase: 2, critPerTier: 0.3, blockBase: 8, blockPerTier: 1.5, defenseBase: 30, defensePerTier: 8 } },
      { name: 'Bloodcrusher', desc: 'Crushes with blood. Crimson Smash: AoE Bleed.', mats: { 'Steel Ingot': 6, 'Blood': 4 }, stats: { damageBase: 78, damagePerTier: 19, speedBase: 55, speedPerTier: 13, critBase: 3, critPerTier: 0.4, blockBase: 6, blockPerTier: 1.2, defenseBase: 25, defensePerTier: 7 } },
      { name: 'Stonebreaker', desc: 'Breaks stone. Shattering Blow: Armor Break.', mats: { 'Mithril Ingot': 6, 'Obsidian': 4 }, stats: { damageBase: 80, damagePerTier: 20, speedBase: 50, speedPerTier: 12, critBase: 2, critPerTier: 0.3, blockBase: 10, blockPerTier: 2, defenseBase: 35, defensePerTier: 9 } },
      { name: 'Oathcrusher', desc: 'Crushes oaths. Oath Shatter: Dispel Buffs.', mats: { 'Dark Iron Ingot': 6, 'Void Dust': 2 }, stats: { damageBase: 72, damagePerTier: 17, speedBase: 58, speedPerTier: 14, critBase: 2, critPerTier: 0.4, blockBase: 7, blockPerTier: 1.4, defenseBase: 28, defensePerTier: 7 } },
      { name: 'Doomhammer',  desc: 'Hammer of doom. Cataclysmic Strike: Stun AoE.', mats: { 'Shadow Ingot': 6, 'Bone': 4 }, stats: { damageBase: 82, damagePerTier: 20, speedBase: 52, speedPerTier: 12, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Divine Maul', desc: 'Divine judgment. Holy Smash: True Damage.', mats: { 'Divine Ingot': 6, 'Holy Essence': 2 }, stats: { damageBase: 85, damagePerTier: 22, speedBase: 48, speedPerTier: 11, critBase: 4, critPerTier: 0.6, blockBase: 8, blockPerTier: 1.5, defenseBase: 30, defensePerTier: 8 } },
    ]
  },
  greatswords: {
    profession: 'Miner', category: '2h', items: [
      { name: 'Vengeance Blade', desc: 'Blade of vengeance. Grudge Sweep: Builds Mark.', mats: { 'Iron Ingot': 8, 'Leather': 2 }, stats: { damageBase: 70, damagePerTier: 16, speedBase: 70, speedPerTier: 16, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Bloodwrath',      desc: 'Wrath of blood. Crimson Arc: AoE Lifesteal.', mats: { 'Steel Ingot': 8, 'Blood': 4 }, stats: { damageBase: 74, damagePerTier: 17, speedBase: 65, speedPerTier: 15, critBase: 4, critPerTier: 0.6, blockBase: 4, blockPerTier: 0.9, defenseBase: 20, defensePerTier: 6 } },
      { name: 'Shadowcleave',    desc: 'Cleaves shadows. Shadow Slash: Dash + AoE.', mats: { 'Dark Iron Ingot': 8, 'Void Dust': 2 }, stats: { damageBase: 72, damagePerTier: 17, speedBase: 68, speedPerTier: 16, critBase: 5, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 18, defensePerTier: 5 } },
      { name: 'Kinslayer',       desc: 'Slays kin. Family Grudge: High Single Target.', mats: { 'Blood Stone': 6, 'Bone': 4 }, stats: { damageBase: 76, damagePerTier: 18, speedBase: 62, speedPerTier: 14, critBase: 4, critPerTier: 0.6, blockBase: 4, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 } },
      { name: 'Duskbringer',     desc: 'Brings dusk. Twilight Wave: AoE Blind.', mats: { 'Shadow Ingot': 8, 'Gem': 2 }, stats: { damageBase: 73, damagePerTier: 17, speedBase: 66, speedPerTier: 15, critBase: 6, critPerTier: 0.8, blockBase: 3, blockPerTier: 0.8, defenseBase: 17, defensePerTier: 5 } },
      { name: 'Divine Judgment',  desc: 'Divine judgment. Holy Cleave: True Damage.', mats: { 'Divine Ingot': 10, 'Holy Essence': 3 }, stats: { damageBase: 80, damagePerTier: 20, speedBase: 60, speedPerTier: 14, critBase: 5, critPerTier: 0.7, blockBase: 5, blockPerTier: 1, defenseBase: 24, defensePerTier: 7 } },
    ]
  },
  greataxes: {
    profession: 'Miner', category: '2h', items: [
      { name: 'Skullsunder',   desc: 'Sunders skulls. Brutal Hew: AoE Bleed.', mats: { 'Iron Ingot': 5, 'Wood': 3 }, stats: { damageBase: 72, damagePerTier: 17, speedBase: 65, speedPerTier: 15, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 } },
      { name: 'Bloodreaver',   desc: 'Crimson Harvest: AoE Heal.', mats: { 'Steel Ingot': 5, 'Blood': 3 }, stats: { damageBase: 74, damagePerTier: 18, speedBase: 62, speedPerTier: 14, critBase: 4, critPerTier: 0.6, blockBase: 3, blockPerTier: 0.9, defenseBase: 18, defensePerTier: 5 } },
      { name: 'Worldsplitter', desc: 'Cataclysm: Massive AoE.', mats: { 'Mithril Ingot': 8, 'Void Essence': 3 }, stats: { damageBase: 80, damagePerTier: 20, speedBase: 55, speedPerTier: 12, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Oathcleaver',   desc: "Betrayer's Arc: Bonus vs Allies.", mats: { 'Dark Iron Ingot': 6, 'Obsidian': 2 }, stats: { damageBase: 76, damagePerTier: 18, speedBase: 60, speedPerTier: 13, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Duskrend',      desc: 'Twilight Cleave: Invisible.', mats: { 'Shadow Ingot': 6, 'Gem': 2 }, stats: { damageBase: 74, damagePerTier: 17, speedBase: 63, speedPerTier: 14, critBase: 5, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 17, defensePerTier: 5 } },
      { name: 'World Breaker', desc: 'Apocalypse: Screen Clear.', mats: { 'Divine Ingot': 8, 'Void Essence': 5 }, stats: { damageBase: 85, damagePerTier: 22, speedBase: 50, speedPerTier: 11, critBase: 4, critPerTier: 0.6, blockBase: 5, blockPerTier: 1, defenseBase: 24, defensePerTier: 7 } },
    ]
  },
  spears: {
    profession: 'Miner', category: '2h', items: [
      { name: 'Iron Pike',      desc: 'Thrust: Long range poke.', mats: { 'Iron Ingot': 4, 'Wood': 3 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 110, speedPerTier: 26, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 15, defensePerTier: 4 } },
      { name: 'Steel Lance',    desc: 'Charge: Gap closer.', mats: { 'Steel Ingot': 4, 'Wood': 3 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 105, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 16, defensePerTier: 5 } },
      { name: 'Mithril Javelin', desc: 'Hurl: Ranged attack.', mats: { 'Mithril Ingot': 4, 'Leather': 2 }, stats: { damageBase: 50, damagePerTier: 12, speedBase: 115, speedPerTier: 28, critBase: 4, critPerTier: 0.6, blockBase: 3, blockPerTier: 0.8, defenseBase: 12, defensePerTier: 4 } },
      { name: 'Bloodspear',     desc: 'Impale: Lifesteal.', mats: { 'Dark Iron Ingot': 5, 'Blood': 3 }, stats: { damageBase: 55, damagePerTier: 14, speedBase: 100, speedPerTier: 24, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 18, defensePerTier: 5 } },
      { name: 'Voidpiercer',    desc: 'Phase Strike: Ignore armor.', mats: { 'Shadow Ingot': 5, 'Void Essence': 2 }, stats: { damageBase: 58, damagePerTier: 14, speedBase: 98, speedPerTier: 23, critBase: 5, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 14, defensePerTier: 4 } },
      { name: 'Divine Trident', desc: 'Trinity Strike: Triple hit.', mats: { 'Divine Ingot': 6, 'Holy Essence': 3 }, stats: { damageBase: 62, damagePerTier: 16, speedBase: 95, speedPerTier: 22, critBase: 4, critPerTier: 0.6, blockBase: 5, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 } },
    ]
  },
  maces: {
    profession: 'Miner', category: '1h', items: [
      { name: 'Iron Cudgel',        desc: 'Bash: Stun chance.', mats: { 'Iron Ingot': 5, 'Wood': 2 }, stats: { damageBase: 45, damagePerTier: 11, speedBase: 95, speedPerTier: 22, critBase: 2, critPerTier: 0.4, blockBase: 6, blockPerTier: 1.2, defenseBase: 24, defensePerTier: 6 } },
      { name: 'Steel Flail',        desc: 'Whirl: AoE damage.', mats: { 'Steel Ingot': 5, 'Chain': 2 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 90, speedPerTier: 20, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Spiked Morningstar', desc: 'Crush: Armor break.', mats: { 'Mithril Ingot': 5, 'Iron Ingot': 3 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 88, speedPerTier: 20, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 24, defensePerTier: 7 } },
      { name: 'Bloodbludgeon',      desc: 'Splatter: Bleed AoE.', mats: { 'Dark Iron Ingot': 6, 'Blood': 3 }, stats: { damageBase: 50, damagePerTier: 12, speedBase: 92, speedPerTier: 21, critBase: 3, critPerTier: 0.5, blockBase: 6, blockPerTier: 1.2, defenseBase: 26, defensePerTier: 7 } },
      { name: 'Obsidian Crusher',   desc: 'Shatter: Shield break.', mats: { 'Obsidian': 8, 'Shadow Ingot': 3 }, stats: { damageBase: 55, damagePerTier: 14, speedBase: 85, speedPerTier: 19, critBase: 2, critPerTier: 0.4, blockBase: 7, blockPerTier: 1.4, defenseBase: 28, defensePerTier: 8 } },
      { name: 'Divine Scepter',     desc: 'Judgment: True damage.', mats: { 'Divine Ingot': 6, 'Holy Essence': 2 }, stats: { damageBase: 58, damagePerTier: 15, speedBase: 82, speedPerTier: 18, critBase: 4, critPerTier: 0.6, blockBase: 6, blockPerTier: 1.2, defenseBase: 26, defensePerTier: 7 } },
    ]
  },
  shields: {
    profession: 'Miner', category: 'offhand', items: [
      { name: 'Iron Buckler',         desc: '+10% Block.', mats: { 'Iron Ingot': 3 }, stats: { blockBase: 10, blockPerTier: 2, defenseBase: 30, defensePerTier: 8 } },
      { name: 'Steel Kite Shield',    desc: '+15% Block.', mats: { 'Steel Ingot': 5 }, stats: { blockBase: 15, blockPerTier: 3, defenseBase: 40, defensePerTier: 10 } },
      { name: 'Obsidian Shield',      desc: 'Fire Resist.', mats: { 'Obsidian': 10, 'Iron Ingot': 5 }, stats: { blockBase: 12, blockPerTier: 2.5, defenseBase: 45, defensePerTier: 12 } },
      { name: 'Mithril Tower Shield', desc: '+25% Block.', mats: { 'Mithril Ingot': 8 }, stats: { blockBase: 25, blockPerTier: 5, defenseBase: 55, defensePerTier: 14 } },
      { name: 'Void Aegis',           desc: 'Spell Reflect.', mats: { 'Shadow Ingot': 6, 'Void Essence': 3 }, stats: { blockBase: 18, blockPerTier: 3.5, defenseBase: 50, defensePerTier: 13 } },
      { name: 'Divine Bulwark',       desc: 'Immunity Proc.', mats: { 'Divine Ingot': 10, 'Holy Essence': 5 }, stats: { blockBase: 30, blockPerTier: 6, defenseBase: 65, defensePerTier: 16 } },
    ]
  },
  bows: {
    profession: 'Forester', category: '2h', items: [
      { name: 'Wraithbone Bow', desc: 'Shadow Arrow: Builds Mark.', mats: { 'Wood': 4, 'Bone': 2, 'String': 2 }, stats: { damageBase: 45, damagePerTier: 11, speedBase: 120, speedPerTier: 28, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Bloodstring',    desc: 'Crimson Shot: Bleed.', mats: { 'Hardwood': 4, 'Blood': 2, 'Sinew': 2 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 115, speedPerTier: 27, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Shadowflight',   desc: 'Shadow Volley: AoE.', mats: { 'Darkwood': 4, 'Void Dust': 2 }, stats: { damageBase: 46, damagePerTier: 11, speedBase: 125, speedPerTier: 30, critBase: 7, critPerTier: 1, blockBase: 0, blockPerTier: 0, defenseBase: 4, defensePerTier: 2 } },
      { name: 'Emberthorn',     desc: 'Flame Arrow: DoT.', mats: { 'Ashwood': 4, 'Fire Essence': 2 }, stats: { damageBase: 50, damagePerTier: 12, speedBase: 118, speedPerTier: 28, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Ironvine',       desc: 'Root Shot: Snare.', mats: { 'Ironwood': 4, 'Vine': 3 }, stats: { damageBase: 44, damagePerTier: 11, speedBase: 122, speedPerTier: 29, critBase: 4, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 6, defensePerTier: 2 } },
      { name: 'Duskreaver',     desc: 'Twilight Volley: Pierce.', mats: { 'Worldtree Wood': 6, 'Shadow Essence': 3 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 112, speedPerTier: 26, critBase: 8, critPerTier: 1.2, blockBase: 0, blockPerTier: 0, defenseBase: 6, defensePerTier: 2 } },
    ]
  },
  crossbows: {
    profession: 'Engineer', category: '2h', items: [
      { name: 'Ironveil Repeater', desc: 'Heavy Bolt: Builds Mark.', mats: { 'Iron': 3, 'Wood': 2 }, stats: { damageBase: 55, damagePerTier: 13, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Skullpiercer',      desc: 'Headshot: Silence.', mats: { 'Steel': 3, 'Bone': 2 }, stats: { damageBase: 58, damagePerTier: 14, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 7, defensePerTier: 3 } },
      { name: 'Bloodreaver XB',    desc: 'Explosive Round: AoE.', mats: { 'Dark Iron': 3, 'Blood': 2 }, stats: { damageBase: 56, damagePerTier: 13, speedBase: 98, speedPerTier: 23, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Wraithspike',       desc: 'Shadow Trap: Slow.', mats: { 'Void Dust': 3, 'Wood': 2 }, stats: { damageBase: 54, damagePerTier: 13, speedBase: 102, speedPerTier: 24, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 6, defensePerTier: 2 } },
      { name: 'Emberbolt',         desc: 'Firestorm Bolt: DoT.', mats: { 'Fire Essence': 3, 'Steel': 2 }, stats: { damageBase: 60, damagePerTier: 15, speedBase: 92, speedPerTier: 21, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 7, defensePerTier: 3 } },
      { name: 'Ironshard',         desc: 'Shrapnel: Armor break.', mats: { 'Iron': 5, 'Obsidian': 1 }, stats: { damageBase: 62, damagePerTier: 15, speedBase: 90, speedPerTier: 20, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 9, defensePerTier: 3 } },
    ]
  },
  guns: {
    profession: 'Engineer', category: '2h', items: [
      { name: 'Blackpowder Blaster', desc: 'Grudge Shot: Mark.', mats: { 'Iron': 3, 'Powder': 2 }, stats: { damageBase: 65, damagePerTier: 16, speedBase: 75, speedPerTier: 18, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Ironstorm Gun',       desc: 'Sniper Round: Range.', mats: { 'Steel': 3, 'Iron': 2 }, stats: { damageBase: 68, damagePerTier: 17, speedBase: 70, speedPerTier: 16, critBase: 7, critPerTier: 1, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Bloodcannon',         desc: 'Crimson Blast: Lifesteal.', mats: { 'Dark Iron': 3, 'Blood': 2 }, stats: { damageBase: 70, damagePerTier: 17, speedBase: 72, speedPerTier: 17, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 6, defensePerTier: 2 } },
      { name: 'Wraithbarrel',        desc: 'Shadow Shot: Silence.', mats: { 'Void Dust': 3, 'Steel': 2 }, stats: { damageBase: 66, damagePerTier: 16, speedBase: 74, speedPerTier: 17, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Emberrifle',          desc: 'Flame Burst: DoT AoE.', mats: { 'Fire Essence': 3, 'Iron': 2 }, stats: { damageBase: 72, damagePerTier: 18, speedBase: 68, speedPerTier: 16, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Duskblaster',         desc: 'Shrapnel Spray: Pierce.', mats: { 'Shadow Ingot': 3, 'Gem': 1 }, stats: { damageBase: 75, damagePerTier: 19, speedBase: 65, speedPerTier: 15, critBase: 7, critPerTier: 1, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
    ]
  },
  fireStaves:      { profession: 'Mystic', category: '2h', items: [
    { name: 'Emberwrath Staff', desc: 'Fire Bolt: Builds Burn stacks.', mats: { 'Pine Log': 3, 'Minor Fire Essence': 2 }, stats: { damageBase: 42, damagePerTier: 10, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
    { name: 'Sunfire Staff',    desc: 'Solar Flare: AoE Burn.', mats: { 'Oak Log': 3, 'Fire Essence': 2 }, stats: { damageBase: 45, damagePerTier: 11, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
    { name: 'Inferno Spire',   desc: 'Inferno Wave: Line AoE.', mats: { 'Maple Log': 4, 'Greater Fire Essence': 3 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 90, speedPerTier: 21, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 9, defensePerTier: 3 } },
    { name: 'Phoenix Staff',   desc: 'Rebirth: Self-resurrect proc.', mats: { 'Ash Log': 5, 'Phoenix Feather': 1 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 85, speedPerTier: 20, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 10, defensePerTier: 3 } },
  ] },
  frostStaves:     { profession: 'Mystic', category: '2h', items: [
    { name: 'Glacial Spire',    desc: 'Frost Bolt: Applies Chill.', mats: { 'Pine Log': 3, 'Minor Frost Essence': 2 }, stats: { damageBase: 40, damagePerTier: 10, speedBase: 105, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 10, defensePerTier: 3 } },
    { name: "Winter's Grudge",   desc: 'Blizzard: AoE Slow.', mats: { 'Oak Log': 3, 'Frost Essence': 2 }, stats: { damageBase: 43, damagePerTier: 11, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 12, defensePerTier: 4 } },
    { name: 'Frostbite Staff',   desc: 'Deep Freeze: Stun.', mats: { 'Maple Log': 4, 'Greater Frost Essence': 3 }, stats: { damageBase: 46, damagePerTier: 12, speedBase: 95, speedPerTier: 22, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 14, defensePerTier: 4 } },
    { name: 'Absolute Zero',     desc: 'Time Stop: Ultimate frost.', mats: { 'Worldtree Log': 8, 'Void Ice': 5 }, stats: { damageBase: 50, damagePerTier: 13, speedBase: 88, speedPerTier: 20, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 16, defensePerTier: 5 } },
  ] },
  holyStaves:      { profession: 'Mystic', category: '2h', items: [
    { name: 'Dawnspire',         desc: 'Holy Light: Heals allies.', mats: { 'Pine Log': 3, 'Minor Holy Essence': 2 }, stats: { damageBase: 35, damagePerTier: 8, speedBase: 110, speedPerTier: 26, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 12, defensePerTier: 4 } },
    { name: 'Redemption Staff',  desc: 'Cleanse: Remove debuffs.', mats: { 'Oak Log': 3, 'Holy Essence': 2 }, stats: { damageBase: 38, damagePerTier: 9, speedBase: 105, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 14, defensePerTier: 4 } },
    { name: 'Sacred Light',      desc: 'Divine Shield: Immunity.', mats: { 'Maple Log': 4, 'Greater Holy Essence': 3 }, stats: { damageBase: 40, damagePerTier: 10, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 16, defensePerTier: 5 } },
    { name: 'Divine Judgment Staff', desc: 'Smite Evil: Ultimate holy.', mats: { 'Worldtree Log': 8, 'Divine Essence': 5 }, stats: { damageBase: 45, damagePerTier: 11, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 18, defensePerTier: 5 } },
  ] },
  lightningStaves: { profession: 'Mystic', category: '2h', items: [
    { name: 'Stormwrath',        desc: 'Thunder Bolt: Chain lightning.', mats: { 'Pine Log': 3, 'Minor Storm Essence': 2 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 7, defensePerTier: 2 } },
    { name: 'Tempest Spire',     desc: 'Thunder Clap: AoE Stun.', mats: { 'Oak Log': 3, 'Storm Essence': 2 }, stats: { damageBase: 50, damagePerTier: 13, speedBase: 92, speedPerTier: 21, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
    { name: 'Thunderlord Staff', desc: 'Lightning Strike: Burst dmg.', mats: { 'Maple Log': 4, 'Greater Storm Essence': 3 }, stats: { damageBase: 54, damagePerTier: 14, speedBase: 88, speedPerTier: 20, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
    { name: "Zeus's Fury",       desc: 'Godly Thunder: Ultimate.', mats: { 'Worldtree Log': 8, 'Divine Storm': 5 }, stats: { damageBase: 58, damagePerTier: 15, speedBase: 85, speedPerTier: 19, critBase: 7, critPerTier: 1, blockBase: 0, blockPerTier: 0, defenseBase: 9, defensePerTier: 3 } },
  ] },
  natureStaves:    { profession: 'Mystic', category: '2h', items: [
    { name: 'Verdant Wrath',  desc: "Nature's Touch: HoT.", mats: { 'Pine Log': 3, 'Minor Nature Essence': 2 }, stats: { damageBase: 38, damagePerTier: 9, speedBase: 108, speedPerTier: 26, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 10, defensePerTier: 3 } },
    { name: 'Thorn Grudge',   desc: 'Thorns: Reflect damage.', mats: { 'Oak Log': 3, 'Nature Essence': 2 }, stats: { damageBase: 40, damagePerTier: 10, speedBase: 105, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 12, defensePerTier: 4 } },
    { name: 'Grove Guardian', desc: 'Entangle: Root AoE.', mats: { 'Maple Log': 4, 'Greater Nature Essence': 3 }, stats: { damageBase: 42, damagePerTier: 10, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 14, defensePerTier: 4 } },
    { name: 'World Tree',     desc: 'Life Bloom: Ultimate heal.', mats: { 'Worldtree Log': 8, 'Divine Nature': 5 }, stats: { damageBase: 46, damagePerTier: 11, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 16, defensePerTier: 5 } },
  ] },
  tomes: {
    profession: 'Mystic', category: 'offhand', items: [
      { name: 'Fire Tome',      desc: 'Allows Fire spell selection.', mats: { 'Paper': 5, 'Fire Essence': 3 }, stats: {} },
      { name: 'Frost Tome',     desc: 'Allows Frost spell selection.', mats: { 'Paper': 5, 'Frost Essence': 3 }, stats: {} },
      { name: 'Holy Tome',      desc: 'Allows Holy spell selection.', mats: { 'Paper': 5, 'Holy Essence': 3 }, stats: {} },
      { name: 'Lightning Tome', desc: 'Allows Storm spell selection.', mats: { 'Paper': 5, 'Storm Essence': 3 }, stats: {} },
      { name: 'Nature Tome',    desc: 'Allows Nature spell selection.', mats: { 'Paper': 5, 'Nature Essence': 3 }, stats: {} },
      { name: 'Arcane Tome',    desc: 'Allows Arcane spell selection.', mats: { 'Paper': 5, 'Arcane Essence': 3 }, stats: {} },
      { name: 'Spellbook',      desc: 'Multi-school spell selection.', mats: { 'Enchanted Paper': 10, 'All Essence': 2 }, stats: {} },
      { name: 'Arcane Book',    desc: 'Advanced spell recipes.', mats: { 'Divine Paper': 15, 'Soul Core': 1 }, stats: {} },
    ]
  },
};

// ============================================================
// FOOD + POTION DATA (abbreviated — same as game-data-hub)
// ============================================================
const FOOD_COLORS = ['red', 'green', 'blue'];
const FOOD_SAMPLE = {
  red:   [{ name: 'Grilled Steak', lvl: 20, buff: '+10% Damage', mats: { 'Beef': 2, 'Pepper': 1 } }, { name: 'Dragon Steak', lvl: 85, buff: '+36% Attack', mats: { 'Dragon Flank': 1, 'Liquid Fire': 1 } }],
  green: [{ name: 'Simple Salad', lvl: 1, buff: '+2 HP/s', mats: { 'Lettuce': 2, 'Tomato': 1 } }, { name: 'World Tree Nectar', lvl: 90, buff: '+38 HP/s', mats: { 'World Tree Sap': 2, 'Divine Pollen': 1 } }],
  blue:  [{ name: 'Fish Stew', lvl: 20, buff: '+10 MP/s', mats: { 'Fish': 2, 'Potato': 2, 'Broth': 1 } }, { name: 'Nectar of Gods', lvl: 95, buff: '+40 MP/s', mats: { 'Astral Fruit': 10, 'Holy Water': 1 } }],
};

const POTION_DATA = [
  { name: 'Minor Health Potion', effect: 'Restores 50 HP', icon: 'health', mats: { 'Red Herb': 2, 'Water': 1 } },
  { name: 'Minor Mana Potion', effect: 'Restores 50 MP', icon: 'mana', mats: { 'Blue Herb': 2, 'Water': 1 } },
  { name: 'Health Potion', effect: 'Restores 150 HP', icon: 'health', mats: { 'Blood Moss': 3, 'Distilled Water': 1 } },
  { name: 'Mana Potion', effect: 'Restores 150 MP', icon: 'mana', mats: { 'Mana Bloom': 3, 'Distilled Water': 1 } },
  { name: 'Rage Potion', effect: '+30% Damage, 30s', icon: 'rage', mats: { 'Berserker Root': 3, 'Fire Essence': 1 } },
  { name: 'Speed Potion', effect: '+30% Speed, 30s', icon: 'speed', mats: { 'Swift Herb': 3, 'Wind Essence': 1 } },
  { name: 'Defense Potion', effect: '+30% Defense, 30s', icon: 'defense', mats: { 'Ironbark': 3, 'Earth Essence': 1 } },
  { name: 'Greater Health Potion', effect: 'Restores 300 HP', icon: 'health', mats: { 'Heart Blossom': 4, 'Life Essence': 1 } },
  { name: 'Greater Mana Potion', effect: 'Restores 300 MP', icon: 'mana', mats: { 'Mana Crystal Dust': 4, 'Arcane Water': 1 } },
  { name: 'Invisibility Potion', effect: 'Invisible 20s', icon: 'invisibility', mats: { 'Ghost Orchid': 4, 'Shadow Essence': 2 } },
  { name: 'Divine Health', effect: 'Full HP restore', icon: 'divine', mats: { 'Phoenix Tear': 2, 'Divine Essence': 1 } },
  { name: 'Elixir of Immortality', effect: 'Revive on death', icon: 'divine', mats: { "Philosopher's Stone": 1, 'Dragon Blood': 3 } },
];

// ============================================================
// GENERATE
// ============================================================
console.log('Generating ObjectStore master database...\n');

const allItems = [];
const allRecipes = [];
const materialUuids = new Map();

function getMaterialUuid(name) {
  if (!materialUuids.has(name)) materialUuids.set(name, generateUuid('material', name));
  return materialUuids.get(name);
}

// --- Weapons ---
let weaponCount = 0;
for (const [weaponType, def] of Object.entries(WEAPON_DEFINITIONS)) {
  const iconFn = WEAPON_ICONS[weaponType];
  def.items.forEach((item, idx) => {
    const baseUuid = generateUuid('item', `${weaponType}-${item.name}`);
    const recipeUuid = generateUuid('recipe', `recipe-${item.name}`);
    const recipeMaterials = Object.entries(item.mats).map(([matName, qty]) => ({
      uuid: getMaterialUuid(matName), name: matName, quantity: qty,
    }));

    allRecipes.push({
      uuid: recipeUuid, name: `Craft ${item.name}`, resultItemId: baseUuid,
      resultName: item.name, profession: def.profession, category: weaponType, materials: recipeMaterials,
    });

    for (let tier = 1; tier <= 8; tier++) {
      const tierUuid = tier === 1 ? baseUuid : generateUuid('item', `${weaponType}-${item.name}-T${tier}`);
      const tierData = TIERS[tier - 1];
      const stats = {};
      if (item.stats) {
        for (const [key, val] of Object.entries(item.stats)) {
          if (key.endsWith('Base')) {
            const statName = key.replace('Base', '');
            const perTier = item.stats[`${statName}PerTier`] || 0;
            stats[statName] = scaleStat(val, perTier, tier);
          }
        }
      }
      allItems.push({
        uuid: tierUuid, baseUuid, name: tier === 1 ? item.name : `${item.name} T${tier}`,
        baseName: item.name, category: weaponType, type: 'weapon', subCategory: def.category,
        tier, tierLabel: tierData.label, tierColor: tierData.color,
        iconUrl: iconFn ? iconFn(idx + 1) : '', description: item.desc, stats,
        craftedBy: def.profession, recipeUuid,
        abilities: item.abilities || [], signature: item.signature || '', passives: item.passives || [],
      });
      weaponCount++;
    }
  });
}
console.log(`  ${weaponCount} weapon items (${weaponCount / 8} base x 8 tiers)`);

// --- Food ---
let foodCount = 0;
const foodIcons = {
  red: ICON('consumables/food_steak_cooked.png'),
  green: ICON('consumables/food_grapes.png'),
  blue: ICON('consumables/food_fish_red.png'),
};
for (const [color, foods] of Object.entries(FOOD_SAMPLE)) {
  foods.forEach((food) => {
    const foodUuid = generateUuid('food', `food-${color}-${food.name}`);
    const recipeUuid = generateUuid('recipe', `recipe-food-${food.name}`);
    const recipeMaterials = Object.entries(food.mats).map(([matName, qty]) => ({
      uuid: getMaterialUuid(matName), name: matName, quantity: qty,
    }));
    allRecipes.push({
      uuid: recipeUuid, name: `Cook ${food.name}`, resultItemId: foodUuid,
      resultName: food.name, profession: 'Chef', category: `food-${color}`, materials: recipeMaterials,
    });
    allItems.push({
      uuid: foodUuid, name: food.name, category: `food-${color}`, type: 'food',
      tier: Math.ceil(food.lvl / 12), requiredLevel: food.lvl,
      iconUrl: foodIcons[color], description: food.buff, buff: food.buff,
      craftedBy: 'Chef', recipeUuid,
    });
    foodCount++;
  });
}
console.log(`  ${foodCount} food items`);

// --- Potions ---
let potionCount = 0;
POTION_DATA.forEach((potion) => {
  const potionUuid = generateUuid('potion', `potion-${potion.name}`);
  const recipeUuid = generateUuid('recipe', `recipe-potion-${potion.name}`);
  const recipeMaterials = Object.entries(potion.mats).map(([matName, qty]) => ({
    uuid: getMaterialUuid(matName), name: matName, quantity: qty,
  }));
  allRecipes.push({
    uuid: recipeUuid, name: `Brew ${potion.name}`, resultItemId: potionUuid,
    resultName: potion.name, profession: 'Mystic', category: 'potion', materials: recipeMaterials,
  });
  allItems.push({
    uuid: potionUuid, name: potion.name, category: 'potion', type: 'potion', tier: 1,
    iconUrl: POTION_ICONS[potion.icon] || ICON('consumables/health_potion.png'),
    description: potion.effect, effect: potion.effect, craftedBy: 'Mystic', recipeUuid,
  });
  potionCount++;
});
console.log(`  ${potionCount} potions`);

// --- Materials ---
const allMaterials = [];
for (const [name, uuid] of materialUuids) {
  allMaterials.push({
    uuid, name, type: 'material',
    iconUrl: ICON(`materials/${name.toLowerCase().replace(/\s+/g, '_')}.png`),
  });
}
console.log(`  ${allMaterials.length} unique materials`);

// ============================================================
// WRITE
// ============================================================
const now = new Date().toISOString();

const outputs = [
  ['master-items.json', {
    version: '2.0.0', generated: now, source: 'ObjectStore/scripts/generate-master-database.mjs',
    totalItems: allItems.length, totalRecipes: allRecipes.length, totalMaterials: allMaterials.length,
    items: allItems,
  }],
  ['master-recipes.json', {
    version: '2.0.0', generated: now, totalRecipes: allRecipes.length, recipes: allRecipes,
  }],
  ['master-materials.json', {
    version: '2.0.0', generated: now, totalMaterials: allMaterials.length, materials: allMaterials,
  }],
];

for (const [filename, data] of outputs) {
  const json = JSON.stringify(data, null, 2);
  writeFileSync(join(API_DIR, filename), json);
}

console.log(`\nMaster database generated!`);
console.log(`  api/v1/master-items.json      — ${allItems.length} items`);
console.log(`  api/v1/master-recipes.json     — ${allRecipes.length} recipes`);
console.log(`  api/v1/master-materials.json   — ${allMaterials.length} materials`);
