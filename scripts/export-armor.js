#!/usr/bin/env node
/**
 * Export WCS equipment data to ObjectStore armor.json
 * Uses EXACT stats from Warlord-Crafting-Suite equipment.ts
 * Run: node scripts/export-armor.js
 */
const fs = require('fs');
const path = require('path');

// Emoji map per material+slot
const EMOJI_MAP = {
  "Helm": { Cloth: "🧢", Leather: "🪖", Metal: "⛑️", Gem: "💎" },
  "Shoulder": { Cloth: "🦺", Leather: "🦺", Metal: "🛡️", Gem: "💎" },
  "Chest": { Cloth: "👘", Leather: "🧥", Metal: "🦺", Gem: "💎" },
  "Hands": { Cloth: "🧤", Leather: "🧤", Metal: "🧤", Gem: "💎" },
  "Feet": { Cloth: "👟", Leather: "🥾", Metal: "🥾", Gem: "💎" },
  "Ring": { Cloth: "💍", Leather: "💍", Metal: "💍", Gem: "💎" },
  "Necklace": { Cloth: "📿", Leather: "📿", Metal: "📿", Gem: "💎" },
  "Relic": { Cloth: "🔮", Leather: "🗡️", Metal: "🛡️", Gem: "💎" },
  "Offhand": { Cloth: "🔮", Leather: "🔮", Metal: "🔮", Gem: "💎" },
};

const SET_NAMES = ["Bloodfeud", "Wraithfang", "Oathbreaker", "Kinrend", "Dusksinger", "Emberclad"];
const SLOTS = ["Helm", "Shoulder", "Chest", "Hands", "Feet", "Ring", "Necklace", "Relic"];
const MATERIALS = ["Cloth", "Leather", "Metal"];

const LORE = {
  Bloodfeud: "Forged in endless clan blood feuds",
  Wraithfang: "Whispers forgotten grudges in the dark",
  Oathbreaker: "Breaks ancient oaths of peace",
  Kinrend: "Rends bonds of blood and kinship",
  Dusksinger: "Sings of twilight and ending grudges",
  Emberclad: "Clad in flames of burning hatred",
};

// Set bonuses/effects per material per set (from WCS equipment.ts)
const SETS = {
  Bloodfeud: {
    Cloth: { passive: "Mana Surge (+regen)", attribute: "+Int", effect: "Spell Amp (+5% magic dmg)", proc: "Mana Burst (10% restore mana)", setBonus: "Arcane Ward (group shield)" },
    Leather: { passive: "Leather Stealth (+evade)", attribute: "+Dex", effect: "Speed Boost (+move)", proc: "Evade Proc (15% dodge)", setBonus: "Rogue Set (invis on crit)" },
    Metal: { passive: "Tank Stance (+threat)", attribute: "+Vit", effect: "Armor Amp (+def)", proc: "Block Proc (20% reflect)", setBonus: "Guardian Set (AoE taunt)" },
  },
  Wraithfang: {
    Cloth: { passive: "Shadow Veil (+stealth)", attribute: "+Wis", effect: "Evasion Boost (+dodge)", proc: "Shadow Fade (15% invis)", setBonus: "Wraith Echo (duplicate spell)" },
    Leather: { passive: "Shadow Cloak (+stealth)", attribute: "+Agi", effect: "Crit Amp (+crit dmg)", proc: "Shadow Strike (10% backstab)", setBonus: "Phantom Set (teleport on low HP)" },
    Metal: { passive: "Shadow Tank (+resist)", attribute: "+Str", effect: "Block Boost (+block dmg)", proc: "Wraith Proc (15% fear)", setBonus: "Phantom Set (absorb dmg)" },
  },
  Oathbreaker: {
    Cloth: { passive: "Purge Ward (+cleanse)", attribute: "+Int", effect: "Debuff Resist (+resist)", proc: "Oath Break (20% purge enemy)", setBonus: "Broken Oath (heal on purge)" },
    Leather: { passive: "Purge Leather (+cleanse)", attribute: "+Dex", effect: "Debuff Boost (+debuff dur)", proc: "Oath Proc (12% purge)", setBonus: "Breaker Set (amp dmg on purged)" },
    Metal: { passive: "Purge Metal (+cleanse)", attribute: "+Vit", effect: "Debuff Resist (+resist)", proc: "Oath Proc (18% purge)", setBonus: "Breaker Set (counter on block)" },
  },
  Kinrend: {
    Cloth: { passive: "Blood Link (+lifesteal)", attribute: "+Wis", effect: "Heal Amp (+healing)", proc: "Kin Bond (15% group heal)", setBonus: "Family Guard (shared shield)" },
    Leather: { passive: "Blood Leather (+lifesteal)", attribute: "+Agi", effect: "Heal Boost (+self heal)", proc: "Kin Proc (14% heal on hit)", setBonus: "Family Set (group buff share)" },
    Metal: { passive: "Blood Metal (+lifesteal)", attribute: "+Str", effect: "Heal Amp (+self heal)", proc: "Kin Proc (16% heal on block)", setBonus: "Family Set (group shield)" },
  },
  Dusksinger: {
    Cloth: { passive: "Twilight Aura (+speed)", attribute: "+Int", effect: "Mobility Boost (+move)", proc: "Dusk Shift (10% teleport)", setBonus: "Evening Veil (AoE invis)" },
    Leather: { passive: "Twilight Leather (+speed)", attribute: "+Dex", effect: "Mobility Amp (+dash)", proc: "Dusk Proc (11% speed burst)", setBonus: "Evening Set (AoE speed aura)" },
    Metal: { passive: "Twilight Metal (+speed)", attribute: "+Vit", effect: "Mobility Boost (+move)", proc: "Dusk Proc (13% speed burst)", setBonus: "Evening Set (AoE resist aura)" },
  },
  Emberclad: {
    Cloth: { passive: "Burn Ward (+fire resist)", attribute: "+Wis", effect: "DoT Amp (+DoT dmg)", proc: "Ember Proc (12% burn enemy)", setBonus: "Flame Cloak (reflect fire)" },
    Leather: { passive: "Burn Leather (+fire resist)", attribute: "+Agi", effect: "DoT Boost (+DoT dur)", proc: "Ember Proc (13% burn)", setBonus: "Flame Set (reflect on block)" },
    Metal: { passive: "Burn Metal (+fire resist)", attribute: "+Str", effect: "DoT Amp (+DoT dmg)", proc: "Ember Proc (14% burn)", setBonus: "Flame Set (reflect on hit)" },
  },
};

// ============================================================================
// EXACT STATS FROM WCS equipment.ts
// Format: [hpBase, hpPerTier, manaBase, manaPerTier, critBase, critPerTier, blockBase, blockPerTier, defenseBase, defensePerTier]
// Slot groups: A=Helm/Shoulder, B=Chest, C=Hands, D=Feet, E=Ring/Necklace/Relic
// ============================================================================

const EXACT_STATS = {
  Cloth: {
    Bloodfeud: {
      A: [50,10, 100,21, 5,0.5, 1,0.1, 10,2],
      B: [60,12, 120,25, 6,0.6, 2,0.2, 12,2.5],
      C: [40,8, 80,17, 4,0.4, 0.8,0.08, 8,1.6],
      D: [45,9, 90,19, 4.5,0.45, 0.9,0.09, 9,1.8],
      E: [25,5, 50,11, 2.5,0.25, 0.5,0.05, 5,1],
    },
    Wraithfang: {
      A: [45,9, 105,22, 6,0.6, 0.5,0.05, 9,1.8],
      B: [55,11, 125,26, 7,0.7, 1.5,0.15, 11,2.2],
      C: [35,7, 85,18, 5,0.5, 0.3,0.03, 7,1.4],
      D: [40,8, 95,20, 5.5,0.55, 0.4,0.04, 8,1.6],
      E: [22.5,4.5, 52.5,11.5, 3,0.3, 0.25,0.025, 4.5,0.9],
    },
    Oathbreaker: {
      A: [55,11, 95,20, 4,0.4, 1.5,0.15, 11,2.2],
      B: [65,13, 115,24, 5,0.5, 2.5,0.25, 13,2.6],
      C: [45,9, 75,16, 3,0.3, 1.3,0.13, 9,1.8],
      D: [50,10, 85,18, 3.5,0.35, 1.4,0.14, 10,2],
      E: [27.5,5.5, 47.5,10.5, 2,0.2, 0.75,0.075, 5.5,1.1],
    },
    Kinrend: {
      A: [52,10.5, 98,20.5, 5.5,0.55, 1,0.1, 10.5,2.1],
      B: [62,12.5, 118,24.5, 6.5,0.65, 2,0.2, 12.5,2.5],
      C: [42,8.5, 78,16.5, 4.5,0.45, 0.8,0.08, 8.5,1.7],
      D: [47,9.5, 88,18.5, 5,0.5, 0.9,0.09, 9.5,1.9],
      E: [26,5.25, 49,10.75, 2.75,0.275, 0.5,0.05, 5.25,1.05],
    },
    Dusksinger: {
      A: [48,9.5, 102,21.5, 4.5,0.45, 0.8,0.08, 9.5,1.9],
      B: [58,11.5, 122,25.5, 5.5,0.55, 1.8,0.18, 11.5,2.3],
      C: [38,7.5, 82,17.5, 3.5,0.35, 0.6,0.06, 7.5,1.5],
      D: [43,8.5, 92,19.5, 4,0.4, 0.7,0.07, 8.5,1.7],
      E: [24,4.75, 51,11.25, 2.25,0.225, 0.4,0.04, 4.75,0.95],
    },
    Emberclad: {
      A: [53,11, 97,20, 5,0.5, 1.2,0.12, 10,2],
      B: [63,12.5, 117,24.5, 6,0.6, 2.2,0.22, 12,2.5],
      C: [43,8.5, 77,16.5, 4,0.4, 1,0.1, 8,1.6],
      D: [48,9.5, 87,18.5, 4.5,0.45, 1.1,0.11, 9,1.8],
      E: [26.5,5.25, 48.5,10.75, 2.5,0.25, 0.6,0.06, 5,1],
    },
  },
  Leather: {
    Bloodfeud: {
      A: [80,16, 50,10, 6,0.6, 3,0.3, 20,4],
      B: [90,18, 60,12, 7,0.7, 4,0.4, 22,4.5],
      C: [70,14, 40,8, 5,0.5, 2.5,0.25, 18,3.6],
      D: [75,15, 45,9, 5.5,0.55, 2.8,0.28, 19,3.8],
      E: [40,8, 25,5, 3,0.3, 1.5,0.15, 10,2],
    },
    Wraithfang: {
      A: [75,15, 55,11, 7,0.7, 2.5,0.25, 19,3.8],
      B: [85,17, 65,13, 8,0.8, 3.5,0.35, 21,4.2],
      C: [65,13, 45,9, 6,0.6, 2,0.2, 17,3.4],
      D: [70,14, 50,10, 6.5,0.65, 2.3,0.23, 18,3.6],
      E: [37.5,7.5, 27.5,5.5, 3.5,0.35, 1.25,0.125, 9.5,1.9],
    },
    Oathbreaker: {
      A: [85,17, 45,9, 5,0.5, 3.5,0.35, 21,4.2],
      B: [95,19, 55,11, 6,0.6, 4.5,0.45, 23,4.6],
      C: [75,15, 35,7, 4,0.4, 3,0.3, 19,3.8],
      D: [80,16, 40,8, 4.5,0.45, 3.3,0.33, 20,4],
      E: [42.5,8.5, 22.5,4.5, 2.5,0.25, 1.75,0.175, 10.5,2.1],
    },
    Kinrend: {
      A: [82,16.5, 48,9.5, 6.5,0.65, 3,0.3, 20.5,4.1],
      B: [92,18.5, 58,11.5, 7.5,0.75, 4,0.4, 22.5,4.5],
      C: [72,14.5, 38,7.5, 5.5,0.55, 2.5,0.25, 18.5,3.7],
      D: [77,15.5, 43,8.5, 6,0.6, 2.8,0.28, 19.5,3.9],
      E: [41,8.25, 24,4.75, 3.25,0.325, 1.5,0.15, 10.25,2.05],
    },
    Dusksinger: {
      A: [78,15.5, 52,10.5, 5.5,0.55, 2.8,0.28, 19.5,3.9],
      B: [88,17.5, 62,12.5, 6.5,0.65, 3.8,0.38, 21.5,4.3],
      C: [68,13.5, 42,8.5, 4.5,0.45, 2.3,0.23, 17.5,3.5],
      D: [73,14.5, 47,9.5, 5,0.5, 2.6,0.26, 18.5,3.7],
      E: [39,7.75, 26,5.25, 2.75,0.275, 1.4,0.14, 9.75,1.95],
    },
    Emberclad: {
      A: [83,16.5, 47,9.5, 6,0.6, 3.2,0.32, 20,4],
      B: [93,18.5, 57,11.5, 7,0.7, 4.2,0.42, 22,4.5],
      C: [73,14.5, 37,7.5, 5,0.5, 2.7,0.27, 18,3.6],
      D: [78,15.5, 42,8.5, 5.5,0.55, 3,0.3, 19,3.8],
      E: [41.5,8.25, 23.5,4.75, 3,0.3, 1.6,0.16, 10,2],
    },
  },
  Metal: {
    Bloodfeud: {
      A: [100,21, 20,4, 2,0.2, 8,0.8, 30,6],
      B: [110,23, 30,6, 3,0.3, 9,0.9, 32,6.5],
      C: [80,17, 15,3, 1.5,0.15, 6.5,0.65, 25,5],
      D: [90,19, 18,3.5, 1.8,0.18, 7.2,0.72, 27,5.4],
      E: [50,10.5, 10,2, 1,0.1, 4,0.4, 15,3],
    },
    Wraithfang: {
      A: [95,20, 25,5, 3,0.3, 7.5,0.75, 29,5.8],
      B: [105,22, 35,7, 4,0.4, 8.5,0.85, 31,6.2],
      C: [75,16, 20,4, 2.5,0.25, 6,0.6, 24,4.8],
      D: [85,18, 23,4.5, 2.8,0.28, 6.7,0.67, 26,5.2],
      E: [47.5,10, 12.5,2.5, 1.5,0.15, 3.75,0.375, 14.5,2.9],
    },
    Oathbreaker: {
      A: [105,22, 15,3, 1,0.1, 8.5,0.85, 31,6.2],
      B: [115,24, 25,5, 2,0.2, 9.5,0.95, 33,6.6],
      C: [85,18, 10,2, 0.5,0.05, 7,0.7, 26,5.2],
      D: [95,20, 13,2.5, 0.8,0.08, 7.7,0.77, 28,5.6],
      E: [52.5,11, 7.5,1.5, 0.5,0.05, 4.25,0.425, 15.5,3.1],
    },
    Kinrend: {
      A: [102,21.5, 18,3.5, 2.5,0.25, 8,0.8, 30.5,6.1],
      B: [112,23.5, 28,5.5, 3.5,0.35, 9,0.9, 32.5,6.5],
      C: [82,17.5, 13,2.5, 2,0.2, 6.5,0.65, 25.5,5.1],
      D: [92,19.5, 16,3, 2.3,0.23, 7.2,0.72, 27.5,5.5],
      E: [51,10.75, 9,1.75, 1.25,0.125, 4,0.4, 15.25,3.05],
    },
    Dusksinger: {
      A: [98,20.5, 22,4.5, 1.5,0.15, 7.8,0.78, 29.5,5.9],
      B: [108,22.5, 32,6.5, 2.5,0.25, 8.8,0.88, 31.5,6.3],
      C: [78,16.5, 17,3.5, 1,0.1, 6.3,0.63, 24.5,4.9],
      D: [88,18.5, 20,4, 1.3,0.13, 7,0.7, 26.5,5.3],
      E: [49,10.25, 11,2.25, 0.75,0.075, 3.9,0.39, 14.75,2.95],
    },
    Emberclad: {
      A: [103,21.5, 17,3.5, 2,0.2, 8.2,0.82, 30,6],
      B: [113,23.5, 27,5.5, 3,0.3, 9.2,0.92, 32,6.5],
      C: [83,17.5, 12,2.5, 1.5,0.15, 6.7,0.67, 25,5],
      D: [93,19.5, 15,3, 1.8,0.18, 7.4,0.74, 27,5.4],
      E: [51.5,10.75, 8.5,1.75, 1,0.1, 4.1,0.41, 15,3],
    },
  },
};

// Gem offhand stats (exact from WCS)
const GEM_STATS = {
  Bloodfeud: [30,6, 100,20, 7,1.2, 0,0, 10,2],
  Wraithfang: [27,5.5, 105,21, 8,1.4, 0,0, 9,1.8],
  Oathbreaker: [33,6.5, 95,19, 6,1, 0,0, 11,2.2],
  Kinrend: [31,6.25, 98,19.5, 7.5,1.25, 0,0, 10.5,2.1],
  Dusksinger: [29,5.75, 102,20.5, 6.5,1.1, 0,0, 9.5,1.9],
  Emberclad: [33,6.5, 97,19.5, 6,1, 0,0, 10,2],
};

const GEM_SETS = {
  Bloodfeud: { passive: "Mana Gem (+mana regen)", attribute: "+Int", effect: "Spell Amp (+magic)", proc: "Mana Proc (12% restore)", setBonus: "Arcane Gem (group mana)" },
  Wraithfang: { passive: "Shadow Gem (+stealth)", attribute: "+Wis", effect: "Evasion Boost (+dodge)", proc: "Shadow Proc (14% invis)", setBonus: "Wraith Gem (duplicate cast)" },
  Oathbreaker: { passive: "Purge Gem (+cleanse)", attribute: "+Int", effect: "Debuff Resist (+resist)", proc: "Oath Proc (18% purge)", setBonus: "Breaker Gem (amp on purge)" },
  Kinrend: { passive: "Blood Gem (+lifesteal)", attribute: "+Wis", effect: "Heal Amp (+healing)", proc: "Kin Proc (15% group heal)", setBonus: "Family Gem (shared heal)" },
  Dusksinger: { passive: "Twilight Gem (+speed)", attribute: "+Int", effect: "Mobility Boost (+move)", proc: "Dusk Proc (11% teleport)", setBonus: "Evening Gem (AoE invis)" },
  Emberclad: { passive: "Burn Gem (+fire resist)", attribute: "+Wis", effect: "DoT Amp (+DoT)", proc: "Ember Proc (13% burn)", setBonus: "Flame Gem (reflect fire)" },
};

// Slot group mapping: Helm/Shoulder share stats, Ring/Necklace/Relic share stats
const SLOT_GROUP = {
  Helm: 'A',
  Shoulder: 'A',
  Chest: 'B',
  Hands: 'C',
  Feet: 'D',
  Ring: 'E',
  Necklace: 'E',
  Relic: 'E',
};

function arrayToStats(arr) {
  return {
    hpBase: arr[0],
    hpPerTier: arr[1],
    manaBase: arr[2],
    manaPerTier: arr[3],
    critBase: arr[4],
    critPerTier: arr[5],
    blockBase: arr[6],
    blockPerTier: arr[7],
    defenseBase: arr[8],
    defensePerTier: arr[9],
  };
}

function generateItems() {
  const items = { cloth: [], leather: [], metal: [], gem: [] };

  for (const material of MATERIALS) {
    const matKey = material.toLowerCase();
    for (const setName of SET_NAMES) {
      for (const slot of SLOTS) {
        const group = SLOT_GROUP[slot];
        const statArr = EXACT_STATS[material][setName][group];
        const setInfo = SETS[setName][material];
        const emoji = (EMOJI_MAP[slot] || {})[material] || "🛡️";

        items[matKey].push({
          id: `${matKey}-${setName.toLowerCase()}-${slot.toLowerCase()}`,
          name: `${setName} ${slot}`,
          type: slot,
          material,
          lore: LORE[setName],
          emoji,
          grudgeType: "equipment",
          stats: arrayToStats(statArr),
          passive: setInfo.passive,
          attribute: setInfo.attribute,
          effect: setInfo.effect,
          proc: setInfo.proc,
          setBonus: setInfo.setBonus,
          spritePath: null,
        });
      }
    }
  }

  // Gem offhands
  for (const setName of SET_NAMES) {
    const gemInfo = GEM_SETS[setName];
    items.gem.push({
      id: `gem-${setName.toLowerCase()}-offhand`,
      name: `${setName} Gem`,
      type: "Offhand",
      material: "Gem",
      lore: LORE[setName],
      emoji: "💎",
      grudgeType: "equipment",
      stats: arrayToStats(GEM_STATS[setName]),
      passive: gemInfo.passive,
      attribute: gemInfo.attribute,
      effect: gemInfo.effect,
      proc: gemInfo.proc,
      setBonus: gemInfo.setBonus,
      spritePath: null,
    });
  }

  return items;
}

// Build final armor.json
const items = generateItems();
const totalItems = items.cloth.length + items.leather.length + items.metal.length + items.gem.length;

const armorJson = {
  version: "2.1.0",
  updated: new Date().toISOString().split("T")[0],
  total: totalItems,
  sets: SET_NAMES,
  materials: {
    cloth: {
      name: "Cloth Armor",
      description: "Lightweight magical armor for spellcasters",
      primaryAttribute: "Int/Wis",
      count: items.cloth.length,
      items: items.cloth,
    },
    leather: {
      name: "Leather Armor",
      description: "Balanced armor for agile fighters",
      primaryAttribute: "Dex/Agi",
      count: items.leather.length,
      items: items.leather,
    },
    metal: {
      name: "Metal Armor",
      description: "Heavy armor for tanking and defense",
      primaryAttribute: "Vit/Str",
      count: items.metal.length,
      items: items.metal,
    },
    gem: {
      name: "Gem Offhands",
      description: "Magical gem offhand accessories for casters",
      primaryAttribute: "Int/Wis",
      count: items.gem.length,
      items: items.gem,
    },
  },
  slots: {
    helm: { name: "Helm", iconBase: "Helm_", iconFolder: "armor", maxIcons: 40 },
    shoulder: { name: "Shoulder Guard", iconBase: "Shoulder_", iconFolder: "armor", maxIcons: 30 },
    chest: { name: "Chestplate", iconBase: "Chest_", iconFolder: "armor", maxIcons: 40 },
    hands: { name: "Gauntlets", iconBase: "Gloves_", iconFolder: "armor", maxIcons: 30 },
    feet: { name: "Boots", iconBase: "Boots_", iconFolder: "armor", maxIcons: 40 },
    ring: { name: "Ring", iconBase: "Ring_", iconFolder: "armor", maxIcons: 30 },
    necklace: { name: "Necklace", iconBase: "necklace_", iconFolder: "armor", maxIcons: 20 },
    relic: { name: "Relic", iconBase: "Relic_", iconFolder: "armor", maxIcons: 30 },
    back: { name: "Cloak/Cape", iconBase: "Back_", iconFolder: "armor", maxIcons: 30 },
  },
  tiers: 8,
  tierColors: {
    "1": { name: "Common", color: "#9ca3af", bgColor: "#374151" },
    "2": { name: "Uncommon", color: "#22c55e", bgColor: "#166534" },
    "3": { name: "Rare", color: "#3b82f6", bgColor: "#1e40af" },
    "4": { name: "Epic", color: "#a855f7", bgColor: "#6b21a8" },
    "5": { name: "Legendary", color: "#f59e0b", bgColor: "#b45309" },
    "6": { name: "Mythic", color: "#ef4444", bgColor: "#b91c1c" },
    "7": { name: "Eternal", color: "#ec4899", bgColor: "#be185d" },
    "8": { name: "Divine", color: "#fbbf24", bgColor: "#d97706", animated: true },
  },
  setDescriptions: {
    Bloodfeud: { theme: "Arcane/Stealth/Tank", colors: ["#dc2626", "#991b1b"], description: "Forged in endless clan blood feuds — each piece fuels mana surges, stealth evasion, or tanking stances depending on material." },
    Wraithfang: { theme: "Shadow/Crit/Resist", colors: ["#6366f1", "#312e81"], description: "Whispers forgotten grudges — shadow magic for cloth, backstab crits for leather, fear procs for metal." },
    Oathbreaker: { theme: "Purge/Debuff/Counter", colors: ["#84cc16", "#365314"], description: "Breaks oaths of peace — cleansing and debuff mechanics across all materials." },
    Kinrend: { theme: "Lifesteal/Heal/Shield", colors: ["#f97316", "#9a3412"], description: "Rends bonds of blood — healing and lifesteal focus for sustain builds." },
    Dusksinger: { theme: "Speed/Mobility/Teleport", colors: ["#8b5cf6", "#4c1d95"], description: "Twilight movement — speed bursts, teleports, and mobility enhancement." },
    Emberclad: { theme: "Fire/DoT/Reflect", colors: ["#ef4444", "#7f1d1d"], description: "Burning hatred — fire damage over time and damage reflection." },
  },
};

const outputPath = path.join(__dirname, '..', 'api', 'v1', 'armor.json');
fs.writeFileSync(outputPath, JSON.stringify(armorJson, null, 2));
console.log(`✅ Generated armor.json with ${totalItems} items at ${outputPath}`);
console.log(`   Cloth: ${items.cloth.length}, Leather: ${items.leather.length}, Metal: ${items.metal.length}, Gem: ${items.gem.length}`);
