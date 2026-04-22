/**
 * scripts/defs/weapons.mjs
 *
 * Category-by-category weapon definitions. Each item lists a `slug`;
 * the generator resolves icons by:
 *   1. /icons/weapons/<slug>.png  (bespoke) if present on disk
 *   2. pack fallback (Sword_NN.png / Axe_NN.png / ...) otherwise
 * If two base items resolve to the same final URL, the generator fails.
 *
 * Each category also accepts a single `starter` entry -- a generic low-tier
 * item used to absorb the vanilla items from items-legacy.json that have no
 * distinct design identity (Rusty Sword, Blacksmiths Sword, Mining Pick,
 * Fishing Pole, etc.). Starters are profession-less, world-drop sourced,
 * and exist only at T1.
 *
 * Session #1 (swords, axes, daggers) -- signed off 2026-04-22 via "ok
 * continue". Starters fold legacy vanillas per Q-S1.2 default. Icons wired
 * per Q-S1.1 default.
 */

export const WEAPONS = {
  swords: {
    profession: 'Miner',
    subCategory: '1h',
    starter: {
      name: 'Iron Sword',
      slug: 'iron-sword',
      desc: 'A plain iron shortsword. Crafted en masse, carried by militia and scavengers.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 2, 'Leather': 1 },
      stats: { damageBase: 15, damagePerTier: 0, speedBase: 95, speedPerTier: 0, critBase: 1, critPerTier: 0, blockBase: 2, blockPerTier: 0, defenseBase: 6, defensePerTier: 0 },
      foldsInLegacy: ['rusty-sword', 'metal-sword', 'heavy-iron-blade', 'blacksmiths-sword', 'commandor-sword', 'mining-pick', 'fishing-pole', 'pickaxe', 'engineers-toolkit'],
    },
    items: [
      { name: 'Bloodfeud Blade', slug: 'bloodfeud-blade', desc: 'Forged in endless clan blood feuds. Vengeful Slash: Builds Grudge Mark stack.', mats: { 'Iron Ingot': 3, 'Leather': 1 }, stats: { damageBase: 50, damagePerTier: 12, speedBase: 100, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 }, abilities: ['Blood Rush', 'Iron Grudge', 'Clan Charge', 'Heroic Cleave', 'Parry Counter', 'Deep Wound'], signature: 'Crimson Reprisal', passives: ['Bloodlust (5% lifesteal)', 'Swift Vengeance (+15% atk speed)', 'Deep Cuts (+20% bleed dmg)'] },
      { name: 'Wraithfang', slug: 'wraithfang', desc: 'Whispers forgotten grudges. Shadow Edge: Dash + Stun.', mats: { 'Steel Ingot': 3, 'Void Dust': 1 }, stats: { damageBase: 55, damagePerTier: 13, speedBase: 80, speedPerTier: 20, critBase: 5, critPerTier: 0.8, blockBase: 3, blockPerTier: 0.8, defenseBase: 15, defensePerTier: 5 }, abilities: ['Shadow Edge', 'Execute', 'Bleed Chain', 'Fatal Strike'], signature: "Night's Judgment", passives: ['Life Leech', 'Aggressive Rush', 'Grudge Bleed'] },
      { name: 'Oathbreaker', slug: 'oathbreaker', desc: 'Breaks ancient oaths. Lunging Strike: Ranged thrust.', mats: { 'Dark Iron Ingot': 3, 'Obsidian': 1 }, stats: { damageBase: 48, damagePerTier: 11, speedBase: 120, speedPerTier: 30, critBase: 2, critPerTier: 0.4, blockBase: 8, blockPerTier: 1.5, defenseBase: 25, defensePerTier: 7 }, abilities: ['Lunging Strike', 'Shadow Dash', 'Fearful Swipe', 'Hamstring', "Betrayer's Mark", 'Oathbreak'], signature: 'Ancestral Curse', passives: ['Resilience', 'Armor Pen', 'Block Mastery'] },
      { name: 'Kinrend', slug: 'kinrend', desc: 'Rends bonds of kinship. Kin Strike: High single target damage.', mats: { 'Blood Stone': 3, 'Bone': 2 }, stats: { damageBase: 52, damagePerTier: 12, speedBase: 110, speedPerTier: 28, critBase: 4, critPerTier: 0.6, blockBase: 4, blockPerTier: 1, defenseBase: 18, defensePerTier: 6 }, abilities: ['Kin Strike', 'Ancestral Fury', 'Family Grudge', 'Root Bind'], signature: 'Wrath of Kin', passives: ['Bloodlust', 'Swift Vengeance', 'Deep Cuts'] },
      { name: 'Dusksinger', slug: 'dusksinger', desc: 'Sings of twilight. Dusk Blade: Invisible dash.', mats: { 'Shadow Ingot': 3, 'Gem': 1 }, stats: { damageBase: 53, damagePerTier: 12, speedBase: 90, speedPerTier: 22, critBase: 6, critPerTier: 1, blockBase: 4, blockPerTier: 0.9, defenseBase: 17, defensePerTier: 5 }, abilities: ['Dusk Blade', 'Twilight Slash', 'Night Strike'], signature: 'Eventide Reckoning', passives: ['Shadow Walk', 'Crit Surge', 'Evasion Master'] },
      { name: 'Emberclad', slug: 'emberclad', desc: 'Clad in flames. Flame Slash: Applies burn.', mats: { 'Fire Essence': 3, 'Steel Ingot': 2 }, stats: { damageBase: 56, damagePerTier: 14, speedBase: 95, speedPerTier: 24, critBase: 4, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 16, defensePerTier: 5 }, abilities: ['Flame Slash', 'Inferno Wave', 'Magma Strike'], signature: 'Solar Annihilation', passives: ['Burn Master', 'Fire Aura', 'Ember Shield'] },
    ],
  },

  axes: {
    profession: 'Miner',
    subCategory: '1h',
    starter: {
      name: 'Iron Axe',
      slug: 'iron-axe',
      desc: 'Workshop-run hatchet. Heavy enough to split bone, cheap enough to leave behind.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 2, 'Wood': 1 },
      stats: { damageBase: 16, damagePerTier: 0, speedBase: 85, speedPerTier: 0, critBase: 1, critPerTier: 0, blockBase: 2, blockPerTier: 0, defenseBase: 5, defensePerTier: 0 },
      foldsInLegacy: ['wood-axe', 'hatchet', 'mining-axe', 'chopper', 'woodsmans-axe'],
    },
    items: [
      { name: 'Gorehowl', slug: 'gorehowl', desc: 'Howls with gore. Rending Chop: Applies Bleed.', mats: { 'Iron Ingot': 3, 'Wood': 2 }, stats: { damageBase: 55, damagePerTier: 14, speedBase: 90, speedPerTier: 22, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 18, defensePerTier: 5 } },
      { name: 'Skullsplitter', slug: 'skullsplitter', desc: 'Splits skulls. Headcracker: Stun + Damage.', mats: { 'Steel Ingot': 3, 'Bone': 2 }, stats: { damageBase: 58, damagePerTier: 15, speedBase: 85, speedPerTier: 20, critBase: 4, critPerTier: 0.6, blockBase: 3, blockPerTier: 0.8, defenseBase: 16, defensePerTier: 5 } },
      { name: 'Veinreaver', slug: 'veinreaver', desc: 'Reaves veins. Blood Harvest: AoE Lifesteal.', mats: { 'Dark Iron Ingot': 3, 'Blood': 2 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 95, speedPerTier: 23, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 } },
      { name: 'Ironmaw', slug: 'ironmaw', desc: 'Maw of iron. Iron Bite: Ignores defense.', mats: { 'Iron Ingot': 5, 'Obsidian': 1 }, stats: { damageBase: 60, damagePerTier: 15, speedBase: 80, speedPerTier: 18, critBase: 2, critPerTier: 0.4, blockBase: 6, blockPerTier: 1.2, defenseBase: 22, defensePerTier: 7 } },
      { name: 'Dreadcleaver', slug: 'dreadcleaver', desc: 'Cleaves dread. Frenzied Chop: High burst damage.', mats: { 'Shadow Ingot': 3, 'Void Dust': 2 }, stats: { damageBase: 57, damagePerTier: 14, speedBase: 88, speedPerTier: 21, critBase: 5, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 15, defensePerTier: 5 } },
      { name: 'Bonehew', slug: 'bonehew', desc: 'Hews bone. Bone Break: Reduces armor.', mats: { 'Bone': 5, 'Steel Ingot': 2 }, stats: { damageBase: 54, damagePerTier: 13, speedBase: 92, speedPerTier: 22, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 19, defensePerTier: 6 } },
    ],
  },

  daggers: {
    profession: 'Miner',
    subCategory: '1h',
    starter: {
      name: 'Iron Dagger',
      slug: 'iron-dagger',
      desc: 'A simple iron blade. Fast, cheap, and easy to conceal.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 1, 'Leather': 1 },
      stats: { damageBase: 10, damagePerTier: 0, speedBase: 140, speedPerTier: 0, critBase: 4, critPerTier: 0, blockBase: 1, blockPerTier: 0, defenseBase: 3, defensePerTier: 0 },
      foldsInLegacy: ['bone-dagger', 'rusty-knife', 'sailors-knife', 'throwing-knife'],
    },
    items: [
      { name: 'Nightfang', slug: 'nightfang', desc: 'Fang of night. Shadow Stab: Builds Mark.', mats: { 'Iron Ingot': 2, 'Leather': 1 }, stats: { damageBase: 35, damagePerTier: 9, speedBase: 150, speedPerTier: 35, critBase: 8, critPerTier: 1.2, blockBase: 2, blockPerTier: 0.5, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Bloodshiv', slug: 'bloodshiv', desc: 'Drips blood. Crimson Stab: High bleed.', mats: { 'Steel Ingot': 2, 'Blood': 1 }, stats: { damageBase: 38, damagePerTier: 10, speedBase: 145, speedPerTier: 33, critBase: 7, critPerTier: 1, blockBase: 2, blockPerTier: 0.5, defenseBase: 7, defensePerTier: 3 } },
      { name: 'Wraithclaw', slug: 'wraithclaw', desc: 'Claw of wraith. Shadow Strike: AoE Silence.', mats: { 'Dark Iron Ingot': 2, 'Void Dust': 1 }, stats: { damageBase: 36, damagePerTier: 9, speedBase: 155, speedPerTier: 36, critBase: 9, critPerTier: 1.3, blockBase: 1, blockPerTier: 0.4, defenseBase: 6, defensePerTier: 2 } },
      { name: 'Emberfang', slug: 'emberfang', desc: 'Burning hate. Flame Dagger: Burn DoT.', mats: { 'Fire Essence': 2, 'Steel Ingot': 1 }, stats: { damageBase: 40, damagePerTier: 10, speedBase: 140, speedPerTier: 32, critBase: 6, critPerTier: 0.9, blockBase: 2, blockPerTier: 0.5, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Ironspike', slug: 'ironspike', desc: 'Unyielding iron. Pinning Stab: Root burst.', mats: { 'Iron Ingot': 4 }, stats: { damageBase: 37, damagePerTier: 9, speedBase: 148, speedPerTier: 34, critBase: 7, critPerTier: 1, blockBase: 3, blockPerTier: 0.6, defenseBase: 10, defensePerTier: 3 } },
      { name: 'Duskblade', slug: 'duskblade', desc: 'Blade of dusk. Frenzied Cuts: Multi burst.', mats: { 'Shadow Ingot': 2, 'Gem': 1 }, stats: { damageBase: 42, damagePerTier: 11, speedBase: 152, speedPerTier: 35, critBase: 10, critPerTier: 1.5, blockBase: 1, blockPerTier: 0.4, defenseBase: 6, defensePerTier: 2 } },
    ],
  },
};

// Categories that have been migrated from the inline generator table into this file.
// The generator falls back to the inline table for any category NOT in this set.
export const CATEGORIES_MIGRATED = new Set(Object.keys(WEAPONS));
