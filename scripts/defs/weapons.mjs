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

  // Session #2 (hammers, greatswords, greataxes) -- 2026-04-22, default apply.
  hammers: {
    profession: 'Miner',
    subCategory: '2h',
    starter: {
      name: 'Iron Maul', slug: 'iron-maul',
      desc: 'Heavy iron hauling hammer pressed into combat.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 4, 'Wood': 2 },
      stats: { damageBase: 22, damagePerTier: 0, speedBase: 58, speedPerTier: 0, critBase: 1, critPerTier: 0, blockBase: 3, blockPerTier: 0, defenseBase: 10, defensePerTier: 0 },
      foldsInLegacy: ['mining-sledge', 'rusty-mallet'],
    },
    items: [
      { name: 'Titanmaul', slug: 'titanmaul', desc: 'Titanic grudge. Earthshatter: AoE Slow.', mats: { 'Iron Ingot': 6, 'Stone': 4 }, stats: { damageBase: 75, damagePerTier: 18, speedBase: 60, speedPerTier: 14, critBase: 2, critPerTier: 0.3, blockBase: 8, blockPerTier: 1.5, defenseBase: 30, defensePerTier: 8 } },
      { name: 'Bloodcrusher', slug: 'bloodcrusher', desc: 'Crushes with blood. Crimson Smash: AoE Bleed.', mats: { 'Steel Ingot': 6, 'Blood': 4 }, stats: { damageBase: 78, damagePerTier: 19, speedBase: 55, speedPerTier: 13, critBase: 3, critPerTier: 0.4, blockBase: 6, blockPerTier: 1.2, defenseBase: 25, defensePerTier: 7 } },
      { name: 'Stonebreaker', slug: 'stonebreaker', desc: 'Breaks stone. Shattering Blow: Armor Break.', mats: { 'Mithril Ingot': 6, 'Obsidian': 4 }, stats: { damageBase: 80, damagePerTier: 20, speedBase: 50, speedPerTier: 12, critBase: 2, critPerTier: 0.3, blockBase: 10, blockPerTier: 2, defenseBase: 35, defensePerTier: 9 } },
      { name: 'Oathcrusher', slug: 'oathcrusher', desc: 'Crushes oaths. Oath Shatter: Dispel Buffs.', mats: { 'Dark Iron Ingot': 6, 'Void Dust': 2 }, stats: { damageBase: 72, damagePerTier: 17, speedBase: 58, speedPerTier: 14, critBase: 2, critPerTier: 0.4, blockBase: 7, blockPerTier: 1.4, defenseBase: 28, defensePerTier: 7 } },
      { name: 'Doomhammer', slug: 'doomhammer', desc: 'Hammer of doom. Cataclysmic Strike: Stun AoE.', mats: { 'Shadow Ingot': 6, 'Bone': 4 }, stats: { damageBase: 82, damagePerTier: 20, speedBase: 52, speedPerTier: 12, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Divine Maul', slug: 'divine-maul', desc: 'Divine judgment. Holy Smash: True Damage.', mats: { 'Divine Ingot': 6, 'Holy Essence': 2 }, stats: { damageBase: 85, damagePerTier: 22, speedBase: 48, speedPerTier: 11, critBase: 4, critPerTier: 0.6, blockBase: 8, blockPerTier: 1.5, defenseBase: 30, defensePerTier: 8 } },
    ],
  },

  greatswords: {
    profession: 'Miner',
    subCategory: '2h',
    starter: {
      name: 'Iron Greatsword', slug: 'iron-greatsword',
      desc: 'Over-built iron longsword. Slow, heavy, cheap.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 5, 'Leather': 1 },
      stats: { damageBase: 25, damagePerTier: 0, speedBase: 65, speedPerTier: 0, critBase: 1, critPerTier: 0, blockBase: 2, blockPerTier: 0, defenseBase: 8, defensePerTier: 0 },
      foldsInLegacy: ['runed-great-sword', 'rusty-claymore'],
    },
    items: [
      { name: 'Vengeance Blade', slug: 'vengeance-blade', desc: 'Blade of vengeance. Grudge Sweep: Builds Mark.', mats: { 'Iron Ingot': 8, 'Leather': 2 }, stats: { damageBase: 70, damagePerTier: 16, speedBase: 70, speedPerTier: 16, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Bloodwrath', slug: 'bloodwrath', desc: 'Wrath of blood. Crimson Arc: AoE Lifesteal.', mats: { 'Steel Ingot': 8, 'Blood': 4 }, stats: { damageBase: 74, damagePerTier: 17, speedBase: 65, speedPerTier: 15, critBase: 4, critPerTier: 0.6, blockBase: 4, blockPerTier: 0.9, defenseBase: 20, defensePerTier: 6 } },
      { name: 'Shadowcleave', slug: 'shadowcleave', desc: 'Cleaves shadows. Shadow Slash: Dash + AoE.', mats: { 'Dark Iron Ingot': 8, 'Void Dust': 2 }, stats: { damageBase: 72, damagePerTier: 17, speedBase: 68, speedPerTier: 16, critBase: 5, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 18, defensePerTier: 5 } },
      { name: 'Kinslayer', slug: 'kinslayer', desc: 'Slays kin. Family Grudge: High Single Target.', mats: { 'Blood Stone': 6, 'Bone': 4 }, stats: { damageBase: 76, damagePerTier: 18, speedBase: 62, speedPerTier: 14, critBase: 4, critPerTier: 0.6, blockBase: 4, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 } },
      { name: 'Duskbringer', slug: 'duskbringer', desc: 'Brings dusk. Twilight Wave: AoE Blind.', mats: { 'Shadow Ingot': 8, 'Gem': 2 }, stats: { damageBase: 73, damagePerTier: 17, speedBase: 66, speedPerTier: 15, critBase: 6, critPerTier: 0.8, blockBase: 3, blockPerTier: 0.8, defenseBase: 17, defensePerTier: 5 } },
      { name: 'Divine Judgment', slug: 'divine-judgment', desc: 'Divine judgment. Holy Cleave: True Damage.', mats: { 'Divine Ingot': 10, 'Holy Essence': 3 }, stats: { damageBase: 80, damagePerTier: 20, speedBase: 60, speedPerTier: 14, critBase: 5, critPerTier: 0.7, blockBase: 5, blockPerTier: 1, defenseBase: 24, defensePerTier: 7 } },
    ],
  },

  greataxes: {
    profession: 'Miner',
    subCategory: '2h',
    starter: {
      name: 'Iron Greataxe', slug: 'iron-greataxe',
      desc: 'Two-handed cleaver from the foundry surplus bin.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 5, 'Wood': 2 },
      stats: { damageBase: 28, damagePerTier: 0, speedBase: 62, speedPerTier: 0, critBase: 1, critPerTier: 0, blockBase: 2, blockPerTier: 0, defenseBase: 7, defensePerTier: 0 },
      foldsInLegacy: [],
    },
    items: [
      { name: 'Skullsunder', slug: 'skullsunder', desc: 'Sunders skulls. Brutal Hew: AoE Bleed.', mats: { 'Iron Ingot': 5, 'Wood': 3 }, stats: { damageBase: 72, damagePerTier: 17, speedBase: 65, speedPerTier: 15, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 } },
      { name: 'Bloodreaver', slug: 'bloodreaver', desc: 'Crimson Harvest: AoE Heal.', mats: { 'Steel Ingot': 5, 'Blood': 3 }, stats: { damageBase: 74, damagePerTier: 18, speedBase: 62, speedPerTier: 14, critBase: 4, critPerTier: 0.6, blockBase: 3, blockPerTier: 0.9, defenseBase: 18, defensePerTier: 5 } },
      { name: 'Worldsplitter', slug: 'worldsplitter', desc: 'Cataclysm: Massive AoE.', mats: { 'Mithril Ingot': 8, 'Void Essence': 3 }, stats: { damageBase: 80, damagePerTier: 20, speedBase: 55, speedPerTier: 12, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Oathcleaver', slug: 'oathcleaver', desc: "Betrayer's Arc: Bonus vs Allies.", mats: { 'Dark Iron Ingot': 6, 'Obsidian': 2 }, stats: { damageBase: 76, damagePerTier: 18, speedBase: 60, speedPerTier: 13, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Duskrend', slug: 'duskrend', desc: 'Twilight Cleave: Invisible.', mats: { 'Shadow Ingot': 6, 'Gem': 2 }, stats: { damageBase: 74, damagePerTier: 17, speedBase: 63, speedPerTier: 14, critBase: 5, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 17, defensePerTier: 5 } },
      { name: 'World Breaker', slug: 'world-breaker', desc: 'Apocalypse: Screen Clear.', mats: { 'Divine Ingot': 8, 'Void Essence': 5 }, stats: { damageBase: 85, damagePerTier: 22, speedBase: 50, speedPerTier: 11, critBase: 4, critPerTier: 0.6, blockBase: 5, blockPerTier: 1, defenseBase: 24, defensePerTier: 7 } },
    ],
  },

  // Session #3 (spears, maces, shields) -- 2026-04-22, default apply.
  spears: {
    profession: 'Miner',
    subCategory: '2h',
    starter: {
      name: 'Iron Pike Starter', slug: 'iron-pike-starter',
      desc: 'Plain iron-tipped pike. Militia issue.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 2, 'Wood': 3 },
      stats: { damageBase: 14, damagePerTier: 0, speedBase: 100, speedPerTier: 0, critBase: 1, critPerTier: 0, blockBase: 2, blockPerTier: 0, defenseBase: 6, defensePerTier: 0 },
      foldsInLegacy: [],
    },
    items: [
      { name: 'Iron Pike', slug: 'iron-pike', desc: 'Thrust: Long range poke.', mats: { 'Iron Ingot': 4, 'Wood': 3 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 110, speedPerTier: 26, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 15, defensePerTier: 4 } },
      { name: 'Steel Lance', slug: 'steel-lance', desc: 'Charge: Gap closer.', mats: { 'Steel Ingot': 4, 'Wood': 3 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 105, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 16, defensePerTier: 5 } },
      { name: 'Mithril Javelin', slug: 'mithril-javelin', desc: 'Hurl: Ranged attack.', mats: { 'Mithril Ingot': 4, 'Leather': 2 }, stats: { damageBase: 50, damagePerTier: 12, speedBase: 115, speedPerTier: 28, critBase: 4, critPerTier: 0.6, blockBase: 3, blockPerTier: 0.8, defenseBase: 12, defensePerTier: 4 } },
      { name: 'Bloodspear', slug: 'bloodspear', desc: 'Impale: Lifesteal.', mats: { 'Dark Iron Ingot': 5, 'Blood': 3 }, stats: { damageBase: 55, damagePerTier: 14, speedBase: 100, speedPerTier: 24, critBase: 3, critPerTier: 0.5, blockBase: 4, blockPerTier: 1, defenseBase: 18, defensePerTier: 5 } },
      { name: 'Voidpiercer', slug: 'voidpiercer', desc: 'Phase Strike: Ignore armor.', mats: { 'Shadow Ingot': 5, 'Void Essence': 2 }, stats: { damageBase: 58, damagePerTier: 14, speedBase: 98, speedPerTier: 23, critBase: 5, critPerTier: 0.7, blockBase: 3, blockPerTier: 0.8, defenseBase: 14, defensePerTier: 4 } },
      { name: 'Divine Trident', slug: 'divine-trident', desc: 'Trinity Strike: Triple hit.', mats: { 'Divine Ingot': 6, 'Holy Essence': 3 }, stats: { damageBase: 62, damagePerTier: 16, speedBase: 95, speedPerTier: 22, critBase: 4, critPerTier: 0.6, blockBase: 5, blockPerTier: 1, defenseBase: 20, defensePerTier: 6 } },
    ],
  },

  maces: {
    profession: 'Miner',
    subCategory: '1h',
    starter: {
      name: 'Iron Club', slug: 'iron-club',
      desc: 'Banded iron club. Plenty of weight, no finesse.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 2, 'Wood': 2 },
      stats: { damageBase: 13, damagePerTier: 0, speedBase: 90, speedPerTier: 0, critBase: 1, critPerTier: 0, blockBase: 3, blockPerTier: 0, defenseBase: 8, defensePerTier: 0 },
      foldsInLegacy: ['club'],
    },
    items: [
      { name: 'Iron Cudgel', slug: 'iron-cudgel', desc: 'Bash: Stun chance.', mats: { 'Iron Ingot': 5, 'Wood': 2 }, stats: { damageBase: 45, damagePerTier: 11, speedBase: 95, speedPerTier: 22, critBase: 2, critPerTier: 0.4, blockBase: 6, blockPerTier: 1.2, defenseBase: 24, defensePerTier: 6 } },
      { name: 'Steel Flail', slug: 'steel-flail', desc: 'Whirl: AoE damage.', mats: { 'Steel Ingot': 5, 'Chain': 2 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 90, speedPerTier: 20, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 22, defensePerTier: 6 } },
      { name: 'Spiked Morningstar', slug: 'spiked-morningstar', desc: 'Crush: Armor break.', mats: { 'Mithril Ingot': 5, 'Iron Ingot': 3 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 88, speedPerTier: 20, critBase: 3, critPerTier: 0.5, blockBase: 5, blockPerTier: 1, defenseBase: 24, defensePerTier: 7 } },
      { name: 'Bloodbludgeon', slug: 'bloodbludgeon', desc: 'Splatter: Bleed AoE.', mats: { 'Dark Iron Ingot': 6, 'Blood': 3 }, stats: { damageBase: 50, damagePerTier: 12, speedBase: 92, speedPerTier: 21, critBase: 3, critPerTier: 0.5, blockBase: 6, blockPerTier: 1.2, defenseBase: 26, defensePerTier: 7 } },
      { name: 'Obsidian Crusher', slug: 'obsidian-crusher', desc: 'Shatter: Shield break.', mats: { 'Obsidian': 8, 'Shadow Ingot': 3 }, stats: { damageBase: 55, damagePerTier: 14, speedBase: 85, speedPerTier: 19, critBase: 2, critPerTier: 0.4, blockBase: 7, blockPerTier: 1.4, defenseBase: 28, defensePerTier: 8 } },
      { name: 'Divine Scepter', slug: 'divine-scepter', desc: 'Judgment: True damage.', mats: { 'Divine Ingot': 6, 'Holy Essence': 2 }, stats: { damageBase: 58, damagePerTier: 15, speedBase: 82, speedPerTier: 18, critBase: 4, critPerTier: 0.6, blockBase: 6, blockPerTier: 1.2, defenseBase: 26, defensePerTier: 7 } },
    ],
  },

  shields: {
    profession: 'Miner',
    subCategory: 'offhand',
    starter: {
      name: 'Iron Buckler Starter', slug: 'iron-buckler-starter',
      desc: 'Plain iron buckler. Basic block.',
      source: 'world-drop',
      mats: { 'Iron Ingot': 2 },
      stats: { damageBase: 0, damagePerTier: 0, blockBase: 6, blockPerTier: 0, defenseBase: 15, defensePerTier: 0 },
      foldsInLegacy: [],
    },
    items: [
      { name: 'Iron Buckler', slug: 'iron-buckler', desc: '+10% Block.', mats: { 'Iron Ingot': 3 }, stats: { blockBase: 10, blockPerTier: 2, defenseBase: 30, defensePerTier: 8 } },
      { name: 'Steel Kite Shield', slug: 'steel-kite-shield', desc: '+15% Block.', mats: { 'Steel Ingot': 5 }, stats: { blockBase: 15, blockPerTier: 3, defenseBase: 40, defensePerTier: 10 } },
      { name: 'Obsidian Shield', slug: 'obsidian-shield', desc: 'Fire Resist.', mats: { 'Obsidian': 10, 'Iron Ingot': 5 }, stats: { blockBase: 12, blockPerTier: 2.5, defenseBase: 45, defensePerTier: 12 } },
      { name: 'Mithril Tower Shield', slug: 'mithril-tower-shield', desc: '+25% Block.', mats: { 'Mithril Ingot': 8 }, stats: { blockBase: 25, blockPerTier: 5, defenseBase: 55, defensePerTier: 14 } },
      { name: 'Void Aegis', slug: 'void-aegis', desc: 'Spell Reflect.', mats: { 'Shadow Ingot': 6, 'Void Essence': 3 }, stats: { blockBase: 18, blockPerTier: 3.5, defenseBase: 50, defensePerTier: 13 } },
      { name: 'Divine Bulwark', slug: 'divine-bulwark', desc: 'Immunity Proc.', mats: { 'Divine Ingot': 10, 'Holy Essence': 5 }, stats: { blockBase: 30, blockPerTier: 6, defenseBase: 65, defensePerTier: 16 } },
    ],
  },

  // Session #4 (bows, crossbows, guns) -- 2026-04-22, default apply.
  bows: {
    profession: 'Forester',
    subCategory: '2h',
    starter: {
      name: 'Wood Bow Starter', slug: 'wood-bow-starter',
      desc: 'Plain wooden recurve. Trainees and militia carry it.',
      source: 'world-drop',
      mats: { 'Wood': 3, 'String': 1 },
      stats: { damageBase: 12, damagePerTier: 0, speedBase: 115, speedPerTier: 0, critBase: 2, critPerTier: 0, blockBase: 0, blockPerTier: 0, defenseBase: 2, defensePerTier: 0 },
      foldsInLegacy: ['wood-bow', 'recurve', 'bow', 'steady-bow', 'swift-bow', 'war-bow', 'white-bow'],
    },
    items: [
      { name: 'Wraithbone Bow', slug: 'wraithbone', desc: 'Shadow Arrow: Builds Mark.', mats: { 'Wood': 4, 'Bone': 2, 'String': 2 }, stats: { damageBase: 45, damagePerTier: 11, speedBase: 120, speedPerTier: 28, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Bloodstring', slug: 'bloodstring', desc: 'Crimson Shot: Bleed.', mats: { 'Hardwood': 4, 'Blood': 2, 'Sinew': 2 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 115, speedPerTier: 27, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Shadowflight', slug: 'shadowflight', desc: 'Shadow Volley: AoE.', mats: { 'Darkwood': 4, 'Void Dust': 2 }, stats: { damageBase: 46, damagePerTier: 11, speedBase: 125, speedPerTier: 30, critBase: 7, critPerTier: 1, blockBase: 0, blockPerTier: 0, defenseBase: 4, defensePerTier: 2 } },
      { name: 'Emberthorn', slug: 'emberthorn', desc: 'Flame Arrow: DoT.', mats: { 'Ashwood': 4, 'Fire Essence': 2 }, stats: { damageBase: 50, damagePerTier: 12, speedBase: 118, speedPerTier: 28, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Ironvine', slug: 'ironvine', desc: 'Root Shot: Snare.', mats: { 'Ironwood': 4, 'Vine': 3 }, stats: { damageBase: 44, damagePerTier: 11, speedBase: 122, speedPerTier: 29, critBase: 4, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 6, defensePerTier: 2 } },
      { name: 'Duskreaver', slug: 'duskreaver', desc: 'Twilight Volley: Pierce.', mats: { 'Worldtree Wood': 6, 'Shadow Essence': 3 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 112, speedPerTier: 26, critBase: 8, critPerTier: 1.2, blockBase: 0, blockPerTier: 0, defenseBase: 6, defensePerTier: 2 } },
    ],
  },

  crossbows: {
    profession: 'Engineer',
    subCategory: '2h',
    starter: {
      name: 'Iron Crossbow Starter', slug: 'iron-crossbow-starter',
      desc: 'Barracks-issue hand crossbow. Simple and reliable.',
      source: 'world-drop',
      mats: { 'Iron': 2, 'Wood': 2 },
      stats: { damageBase: 18, damagePerTier: 0, speedBase: 100, speedPerTier: 0, critBase: 2, critPerTier: 0, blockBase: 0, blockPerTier: 0, defenseBase: 4, defensePerTier: 0 },
      foldsInLegacy: [],
    },
    items: [
      { name: 'Ironveil Repeater', slug: 'ironveil', desc: 'Heavy Bolt: Builds Mark.', mats: { 'Iron': 3, 'Wood': 2 }, stats: { damageBase: 55, damagePerTier: 13, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Skullpiercer', slug: 'skullpiercer', desc: 'Headshot: Silence.', mats: { 'Steel': 3, 'Bone': 2 }, stats: { damageBase: 58, damagePerTier: 14, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 7, defensePerTier: 3 } },
      { name: 'Bloodreaver XB', slug: 'bloodreaver-xbow', desc: 'Explosive Round: AoE.', mats: { 'Dark Iron': 3, 'Blood': 2 }, stats: { damageBase: 56, damagePerTier: 13, speedBase: 98, speedPerTier: 23, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Wraithspike', slug: 'wraithspike', desc: 'Shadow Trap: Slow.', mats: { 'Void Dust': 3, 'Wood': 2 }, stats: { damageBase: 54, damagePerTier: 13, speedBase: 102, speedPerTier: 24, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 6, defensePerTier: 2 } },
      { name: 'Emberbolt', slug: 'emberbolt', desc: 'Firestorm Bolt: DoT.', mats: { 'Fire Essence': 3, 'Steel': 2 }, stats: { damageBase: 60, damagePerTier: 15, speedBase: 92, speedPerTier: 21, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 7, defensePerTier: 3 } },
      { name: 'Ironshard', slug: 'ironshard', desc: 'Shrapnel: Armor break.', mats: { 'Iron': 5, 'Obsidian': 1 }, stats: { damageBase: 62, damagePerTier: 15, speedBase: 90, speedPerTier: 20, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 9, defensePerTier: 3 } },
    ],
  },

  guns: {
    profession: 'Engineer',
    subCategory: '2h',
    starter: {
      name: 'Old Flintlock', slug: 'old-flintlock',
      desc: 'Antique firearm. Fires most of the time.',
      source: 'world-drop',
      mats: { 'Iron': 2, 'Powder': 1 },
      stats: { damageBase: 22, damagePerTier: 0, speedBase: 72, speedPerTier: 0, critBase: 3, critPerTier: 0, blockBase: 0, blockPerTier: 0, defenseBase: 2, defensePerTier: 0 },
      foldsInLegacy: ['old-flintlock', 'rusty-pistol'],
    },
    items: [
      { name: 'Blackpowder Blaster', slug: 'blackpowder', desc: 'Grudge Shot: Mark.', mats: { 'Iron': 3, 'Powder': 2 }, stats: { damageBase: 65, damagePerTier: 16, speedBase: 75, speedPerTier: 18, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Ironstorm Gun', slug: 'ironstorm', desc: 'Sniper Round: Range.', mats: { 'Steel': 3, 'Iron': 2 }, stats: { damageBase: 68, damagePerTier: 17, speedBase: 70, speedPerTier: 16, critBase: 7, critPerTier: 1, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Bloodcannon', slug: 'bloodcannon', desc: 'Crimson Blast: Lifesteal.', mats: { 'Dark Iron': 3, 'Blood': 2 }, stats: { damageBase: 70, damagePerTier: 17, speedBase: 72, speedPerTier: 17, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 6, defensePerTier: 2 } },
      { name: 'Wraithbarrel', slug: 'wraithbarrel', desc: 'Shadow Shot: Silence.', mats: { 'Void Dust': 3, 'Steel': 2 }, stats: { damageBase: 66, damagePerTier: 16, speedBase: 74, speedPerTier: 17, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Emberrifle', slug: 'emberrifle', desc: 'Flame Burst: DoT AoE.', mats: { 'Fire Essence': 3, 'Iron': 2 }, stats: { damageBase: 72, damagePerTier: 18, speedBase: 68, speedPerTier: 16, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
      { name: 'Duskblaster', slug: 'duskblaster', desc: 'Shrapnel Spray: Pierce.', mats: { 'Shadow Ingot': 3, 'Gem': 1 }, stats: { damageBase: 75, damagePerTier: 19, speedBase: 65, speedPerTier: 15, critBase: 7, critPerTier: 1, blockBase: 0, blockPerTier: 0, defenseBase: 5, defensePerTier: 2 } },
    ],
  },

  // Session #5 (staves) -- 2026-04-22, default apply.
  fireStaves: {
    profession: 'Mystic', subCategory: '2h',
    items: [
      { name: 'Emberwrath Staff', slug: 'emberwrath', desc: 'Fire Bolt: Builds Burn stacks.', mats: { 'Pine Log': 3, 'Minor Fire Essence': 2 }, stats: { damageBase: 42, damagePerTier: 10, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Sunfire Staff', slug: 'sunfire', desc: 'Solar Flare: AoE Burn.', mats: { 'Oak Log': 3, 'Fire Essence': 2 }, stats: { damageBase: 45, damagePerTier: 11, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Inferno Spire', slug: 'inferno-spire', desc: 'Inferno Wave: Line AoE.', mats: { 'Maple Log': 4, 'Greater Fire Essence': 3 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 90, speedPerTier: 21, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 9, defensePerTier: 3 } },
      { name: 'Phoenix Staff', slug: 'phoenix-staff', desc: 'Rebirth: Self-resurrect proc.', mats: { 'Ash Log': 5, 'Phoenix Feather': 1 }, stats: { damageBase: 52, damagePerTier: 13, speedBase: 85, speedPerTier: 20, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 10, defensePerTier: 3 } },
    ],
  },
  frostStaves: {
    profession: 'Mystic', subCategory: '2h',
    items: [
      { name: 'Glacial Spire', slug: 'glacial-spire', desc: 'Frost Bolt: Applies Chill.', mats: { 'Pine Log': 3, 'Minor Frost Essence': 2 }, stats: { damageBase: 40, damagePerTier: 10, speedBase: 105, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 10, defensePerTier: 3 } },
      { name: "Winter's Grudge", slug: 'winters-grudge', desc: 'Blizzard: AoE Slow.', mats: { 'Oak Log': 3, 'Frost Essence': 2 }, stats: { damageBase: 43, damagePerTier: 11, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 12, defensePerTier: 4 } },
      { name: 'Frostbite Staff', slug: 'frostbite-staff', desc: 'Deep Freeze: Stun.', mats: { 'Maple Log': 4, 'Greater Frost Essence': 3 }, stats: { damageBase: 46, damagePerTier: 12, speedBase: 95, speedPerTier: 22, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 14, defensePerTier: 4 } },
      { name: 'Absolute Zero', slug: 'absolute-zero', desc: 'Time Stop: Ultimate frost.', mats: { 'Worldtree Log': 8, 'Void Ice': 5 }, stats: { damageBase: 50, damagePerTier: 13, speedBase: 88, speedPerTier: 20, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 16, defensePerTier: 5 } },
    ],
  },
  holyStaves: {
    profession: 'Mystic', subCategory: '2h',
    items: [
      { name: 'Dawnspire', slug: 'dawnspire', desc: 'Holy Light: Heals allies.', mats: { 'Pine Log': 3, 'Minor Holy Essence': 2 }, stats: { damageBase: 35, damagePerTier: 8, speedBase: 110, speedPerTier: 26, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 12, defensePerTier: 4 } },
      { name: 'Redemption Staff', slug: 'redemption-staff', desc: 'Cleanse: Remove debuffs.', mats: { 'Oak Log': 3, 'Holy Essence': 2 }, stats: { damageBase: 38, damagePerTier: 9, speedBase: 105, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 14, defensePerTier: 4 } },
      { name: 'Sacred Light', slug: 'sacred-light', desc: 'Divine Shield: Immunity.', mats: { 'Maple Log': 4, 'Greater Holy Essence': 3 }, stats: { damageBase: 40, damagePerTier: 10, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 16, defensePerTier: 5 } },
      { name: 'Divine Judgment Staff', slug: 'divine-judgment-staff', desc: 'Smite Evil: Ultimate holy.', mats: { 'Worldtree Log': 8, 'Divine Essence': 5 }, stats: { damageBase: 45, damagePerTier: 11, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 18, defensePerTier: 5 } },
    ],
  },
  lightningStaves: {
    profession: 'Mystic', subCategory: '2h',
    items: [
      { name: 'Stormwrath', slug: 'stormwrath', desc: 'Thunder Bolt: Chain lightning.', mats: { 'Pine Log': 3, 'Minor Storm Essence': 2 }, stats: { damageBase: 48, damagePerTier: 12, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 7, defensePerTier: 2 } },
      { name: 'Tempest Spire', slug: 'tempest-spire', desc: 'Thunder Clap: AoE Stun.', mats: { 'Oak Log': 3, 'Storm Essence': 2 }, stats: { damageBase: 50, damagePerTier: 13, speedBase: 92, speedPerTier: 21, critBase: 5, critPerTier: 0.8, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
      { name: 'Thunderlord Staff', slug: 'thunderlord-staff', desc: 'Lightning Strike: Burst dmg.', mats: { 'Maple Log': 4, 'Greater Storm Essence': 3 }, stats: { damageBase: 54, damagePerTier: 14, speedBase: 88, speedPerTier: 20, critBase: 6, critPerTier: 0.9, blockBase: 0, blockPerTier: 0, defenseBase: 8, defensePerTier: 3 } },
      { name: "Zeus's Fury", slug: 'zeus-fury', desc: 'Godly Thunder: Ultimate.', mats: { 'Worldtree Log': 8, 'Divine Storm': 5 }, stats: { damageBase: 58, damagePerTier: 15, speedBase: 85, speedPerTier: 19, critBase: 7, critPerTier: 1, blockBase: 0, blockPerTier: 0, defenseBase: 9, defensePerTier: 3 } },
    ],
  },
  natureStaves: {
    profession: 'Mystic', subCategory: '2h',
    items: [
      { name: 'Verdant Wrath', slug: 'verdant-wrath', desc: "Nature's Touch: HoT.", mats: { 'Pine Log': 3, 'Minor Nature Essence': 2 }, stats: { damageBase: 38, damagePerTier: 9, speedBase: 108, speedPerTier: 26, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 10, defensePerTier: 3 } },
      { name: 'Thorn Grudge', slug: 'thorn-grudge', desc: 'Thorns: Reflect damage.', mats: { 'Oak Log': 3, 'Nature Essence': 2 }, stats: { damageBase: 40, damagePerTier: 10, speedBase: 105, speedPerTier: 25, critBase: 3, critPerTier: 0.5, blockBase: 0, blockPerTier: 0, defenseBase: 12, defensePerTier: 4 } },
      { name: 'Grove Guardian', slug: 'grove-guardian', desc: 'Entangle: Root AoE.', mats: { 'Maple Log': 4, 'Greater Nature Essence': 3 }, stats: { damageBase: 42, damagePerTier: 10, speedBase: 100, speedPerTier: 24, critBase: 4, critPerTier: 0.6, blockBase: 0, blockPerTier: 0, defenseBase: 14, defensePerTier: 4 } },
      { name: 'World Tree', slug: 'world-tree', desc: 'Life Bloom: Ultimate heal.', mats: { 'Worldtree Log': 8, 'Divine Nature': 5 }, stats: { damageBase: 46, damagePerTier: 11, speedBase: 95, speedPerTier: 22, critBase: 5, critPerTier: 0.7, blockBase: 0, blockPerTier: 0, defenseBase: 16, defensePerTier: 5 } },
    ],
  },
};

// Categories that have been migrated from the inline generator table into this file.
// The generator falls back to the inline table for any category NOT in this set.
export const CATEGORIES_MIGRATED = new Set(Object.keys(WEAPONS));
