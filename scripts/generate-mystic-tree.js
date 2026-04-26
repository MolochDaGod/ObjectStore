#!/usr/bin/env node
/**
 * generate-mystic-tree.js
 *
 * Produces two canon files for the Mystic-governed upgrade system:
 *
 *   api/v1/master-enchants.json
 *     9 Mystic-crafted enchants x 8 tiers = 72 rows.
 *     Consumable materials applied to weapons/armor that permanently
 *     bake a stat bonus into the item (flat or percentage).
 *
 *   api/v1/master-infusions.json
 *     20 infusion essence definitions:
 *       - 5 universal drop tiers (minor -> perfect)
 *       - 15 profession-gated infusions (Miner, Forester, Mystic,
 *         Chef, Engineer - 3 each at T3/T4/T5)
 *     Each infusion grants "+1 (or +2) iterations" when applied via
 *     the Mystic-tree Enchanting Bench. Iterations increment a gear
 *     item along the T-track without changing its base recipe.
 *
 * Sources: Warlord-Crafting-Suite `shared/definitions/recipes.ts`
 * (enchant recipes) and `shared/definitions/materials.ts`
 * (infusion essence definitions). Names normalized to canon
 * ObjectStore conventions.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TS = '20260423030000';
function grudgeUuid(prefix, seq) {
  const seqHex = seq.toString(16).toUpperCase().padStart(6, '0');
  const suffix = crypto.createHash('md5').update(`${prefix}-${seq}-${TS}`).digest('hex').slice(0, 8).toUpperCase();
  return `${prefix}-${TS}-${seqHex}-${suffix}`;
}

// --- Canon tier metadata ---
const TIER_LABELS = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Heroic', 'Mythic', 'Legendary', 'Divine'];
const TIER_COLORS = {
  1: '#8b7355', 2: '#a8a8a8', 3: '#4a9eff', 4: '#9d4dff',
  5: '#ff4d4d', 6: '#ef4444', 7: '#06b6d4', 8: '#f472b6',
};

// ============================================================
// ENCHANTS
// ============================================================
// Each enchant targets a specific item category and bakes a permanent
// bonus when consumed. Stats scale per-tier along the canonical curve.
const ENCHANT_BASE = [
  { id: 'enchant-strength',  name: 'Strength Enchant',  stat: 'damage',            t1: 5,   perTier: 2,  type: 'flat',       target: 'weapon|armor', acquisition: 'purchasable', unlockNode: null,               cost: 200, lore: 'Binds raw physical might to weapon or armor.' },
  { id: 'enchant-intellect', name: 'Intellect Enchant', stat: 'mana',              t1: 20,  perTier: 8,  type: 'flat',       target: 'weapon|armor', acquisition: 'purchasable', unlockNode: null,               cost: 200, lore: 'Channels arcane intellect into the wearer\u2019s gear.' },
  { id: 'enchant-speed',     name: 'Speed Enchant',     stat: 'attackSpeed',       t1: 2,   perTier: 1,  type: 'percentage', target: 'weapon',       acquisition: 'skillTree',   unlockNode: 'Glyph Mastery',    cost: 0,   lore: 'Quickens the weilder\u2019s strikes.' },
  { id: 'enchant-lifesteal', name: 'Lifesteal Enchant', stat: 'drainHealth',       t1: 2,   perTier: 1,  type: 'percentage', target: 'weapon',       acquisition: 'skillTree',   unlockNode: 'Blood Magic',      cost: 0,   lore: 'Bleeds enemy vitality back into the wielder.' },
  { id: 'enchant-fire',      name: 'Fire Enchant',      stat: 'fireDamage',        t1: 6,   perTier: 3,  type: 'flat',       target: 'weapon',       acquisition: 'purchasable', unlockNode: null,               cost: 250, lore: 'Kindles flames along the strike surface.' },
  { id: 'enchant-frost',     name: 'Frost Enchant',     stat: 'frostDamage',       t1: 6,   perTier: 3,  type: 'flat',       target: 'weapon',       acquisition: 'purchasable', unlockNode: null,               cost: 250, lore: 'Sheathes the weapon in biting cold.' },
  { id: 'enchant-arcane',    name: 'Arcane Enchant',    stat: 'spellPower',        t1: 4,   perTier: 2,  type: 'percentage', target: 'weapon|armor', acquisition: 'skillTree',   unlockNode: 'Arcane Mastery',   cost: 0,   lore: 'Saturates gear with pure arcane pressure.' },
  { id: 'enchant-divine',    name: 'Divine Enchant',    stat: 'holyDamage',        t1: 8,   perTier: 4,  type: 'flat',       target: 'weapon|armor', acquisition: 'dropOnly',    unlockNode: null,               cost: 0,   lore: 'Binds a shard of holy radiance to the item.',  dropSource: 'Holy temples' },
  { id: 'enchant-void',      name: 'Void Enchant',      stat: 'shadowDamage',      t1: 8,   perTier: 4,  type: 'flat',       target: 'weapon|armor', acquisition: 'dropOnly',    unlockNode: null,               cost: 0,   lore: 'Laces gear with the cold hunger of the void.', dropSource: 'Void rifts' },
];

const TIER_ESSENCE_ID = {
  1: 'minor-essence', 2: 'lesser-essence', 3: 'greater-essence', 4: 'superior-essence',
  5: 'refined-essence', 6: 'perfect-essence', 7: 'ancient-essence', 8: 'divine-essence',
};
const TIER_INFUSION_UNIVERSAL = {
  1: 'minor-infusion', 2: 'lesser-infusion', 3: 'greater-infusion', 4: 'superior-infusion',
  5: 'perfect-infusion', 6: 'perfect-infusion', 7: 'perfect-infusion', 8: 'perfect-infusion',
};

const enchants = [];
let eSeq = 1;
for (const base of ENCHANT_BASE) {
  for (let tier = 1; tier <= 8; tier++) {
    const value = base.t1 + base.perTier * (tier - 1);
    const displayName = tier === 1 ? base.name : `${base.name} T${tier}`;
    enchants.push({
      uuid: grudgeUuid('ENCH', eSeq++),
      baseUuid: null,
      baseName: base.name,
      id: tier === 1 ? base.id : `${base.id}-t${tier}`,
      name: displayName,
      type: 'enchant',
      category: 'enchant',
      tier,
      tierLabel: TIER_LABELS[tier],
      tierColor: TIER_COLORS[tier],
      target: base.target,        // which item type(s) this applies to
      effect: {
        stat: base.stat,
        value,
        valueType: base.type,    // flat | percentage
      },
      iconUrl: `https://molochdagod.github.io/ObjectStore/icons/enchants/${base.id}.png`,
      description: base.lore,
      lore: base.lore,
      profession: 'Mystic',
      acquisition: base.acquisition,
      unlockNode: base.unlockNode,
      purchaseCost: base.acquisition === 'purchasable' ? base.cost * Math.pow(2, tier - 1) : null,
      dropSource: base.dropSource || null,
      craftingRecipe: base.acquisition === 'dropOnly' ? null : {
        profession: 'Mystic',
        station: 'Enchanting Bench',
        materials: [
          { id: TIER_ESSENCE_ID[tier], quantity: 2 + tier },
          { id: TIER_INFUSION_UNIVERSAL[tier], quantity: 1 },
        ],
        craftTime: 20 + tier * 10,
        gold: 100 * Math.pow(2, tier - 1),
      },
      consumedOnApply: true,
      permanent: true,
    });
  }
}
// link baseUuid
const enchBaseByName = {};
for (const r of enchants) if (r.tier === 1) enchBaseByName[r.baseName] = r.uuid;
for (const r of enchants) r.baseUuid = enchBaseByName[r.baseName];

// ============================================================
// INFUSIONS
// ============================================================
// Universal drops + profession-gated unlocks, exactly matching the
// WCS infusion system. Each infusion grants iterations to a gear item
// when applied at the Mystic Enchanting Bench.
const INFUSIONS = [
  // Universal drops
  { id: 'minor-infusion',     name: 'Minor Infusion Essence',    tier: 1, iterations: 1, scope: 'universal', profession: null,       acquisition: 'dropOnly', dropSource: 'Common enemies',     lore: 'Basic upgrade material gathered from slain common foes.' },
  { id: 'lesser-infusion',    name: 'Lesser Infusion Essence',   tier: 2, iterations: 1, scope: 'universal', profession: null,       acquisition: 'dropOnly', dropSource: 'Uncommon enemies',   lore: 'Common upgrade material found on elite enemies.' },
  { id: 'greater-infusion',   name: 'Greater Infusion Essence',  tier: 3, iterations: 1, scope: 'universal', profession: null,       acquisition: 'dropOnly', dropSource: 'Rare enemies',       lore: 'Quality infusion used to iterate mid-tier gear.' },
  { id: 'superior-infusion',  name: 'Superior Infusion Essence', tier: 4, iterations: 2, scope: 'universal', profession: null,       acquisition: 'dropOnly', dropSource: 'Elite enemies',      lore: 'Elite-grade infusion, grants +2 iterations per apply.' },
  { id: 'perfect-infusion',   name: 'Perfect Infusion Essence',  tier: 5, iterations: 2, scope: 'universal', profession: null,       acquisition: 'dropOnly', dropSource: 'Boss drops',         lore: 'Boss-drop infusion used to bind high-tier gear.' },

  // Miner-profession infusions
  { id: 'forge-infusion',     name: 'Forge Infusion Essence',    tier: 3, iterations: 1, scope: 'profession', profession: 'Miner',    acquisition: 'skillTree', unlockNode: 'Forge Master',      sideEffect: 'adds +10% fire damage to weapons',       lore: 'Molten infusion used by Miners to forge-bind fire into weapons.' },
  { id: 'earthen-infusion',   name: 'Earthen Infusion Essence',  tier: 4, iterations: 2, scope: 'profession', profession: 'Miner',    acquisition: 'skillTree', unlockNode: 'Deep Earth Mastery', sideEffect: '+5% defense on plate armor',             lore: 'Stoneforged infusion that thickens plate defenses.' },
  { id: 'crystal-infusion',   name: 'Crystal Infusion Essence',  tier: 5, iterations: 2, scope: 'profession', profession: 'Miner',    acquisition: 'skillTree', unlockNode: 'Gem Cutter',         sideEffect: '+8% critical damage on weapons',         lore: 'Crystalline infusion that sharpens weapon crit.' },

  // Forester-profession infusions
  { id: 'verdant-infusion',   name: 'Verdant Infusion Essence',  tier: 3, iterations: 1, scope: 'profession', profession: 'Forester', acquisition: 'skillTree', unlockNode: 'Nature\u2019s Touch', sideEffect: '+10% nature damage',                     lore: 'Green-touched infusion used by Foresters.' },
  { id: 'beast-infusion',     name: 'Beast Infusion Essence',    tier: 4, iterations: 2, scope: 'profession', profession: 'Forester', acquisition: 'skillTree', unlockNode: 'Beast Mastery',      sideEffect: '+5% attack speed',                       lore: 'Primal infusion drawn from hunted apex beasts.' },
  { id: 'primal-infusion',    name: 'Primal Infusion Essence',   tier: 5, iterations: 2, scope: 'profession', profession: 'Forester', acquisition: 'skillTree', unlockNode: 'Primal Fury',        sideEffect: '+15% bleed damage',                      lore: 'Savage infusion that amps bleed output.' },

  // Mystic-profession infusions
  { id: 'arcane-infusion',    name: 'Arcane Infusion Essence',   tier: 3, iterations: 1, scope: 'profession', profession: 'Mystic',   acquisition: 'skillTree', unlockNode: 'Arcane Mastery',    sideEffect: '+10% spell power',                       lore: 'Arcane infusion that deepens the magical pool.' },
  { id: 'void-infusion',      name: 'Void Infusion Essence',     tier: 4, iterations: 2, scope: 'profession', profession: 'Mystic',   acquisition: 'skillTree', unlockNode: 'Void Walker',       sideEffect: '+12% shadow damage',                     lore: 'Void-touched infusion used for shadow-aligned gear.' },
  { id: 'celestial-infusion', name: 'Celestial Infusion Essence',tier: 5, iterations: 2, scope: 'profession', profession: 'Mystic',   acquisition: 'skillTree', unlockNode: 'Celestial Weaver',  sideEffect: '+15% holy damage',                       lore: 'Celestial infusion woven from moonlight.' },

  // Chef-profession infusions
  { id: 'vitality-infusion',  name: 'Vitality Infusion Essence', tier: 3, iterations: 1, scope: 'profession', profession: 'Chef',     acquisition: 'skillTree', unlockNode: 'Life Cook',         sideEffect: '+8% max HP',                             lore: 'Chef-brewed infusion that bolsters life force.' },
  { id: 'stamina-infusion',   name: 'Stamina Infusion Essence',  tier: 4, iterations: 2, scope: 'profession', profession: 'Chef',     acquisition: 'skillTree', unlockNode: 'Endurance Brewer',  sideEffect: '+10% stamina regen',                     lore: 'Endurance-brewed infusion used for long fights.' },
  { id: 'elixir-infusion',    name: 'Elixir Infusion Essence',   tier: 5, iterations: 2, scope: 'profession', profession: 'Chef',     acquisition: 'skillTree', unlockNode: 'Grand Alchemist',   sideEffect: '+20% potion effectiveness',              lore: 'Alchemist infusion that amplifies all potion effects.' },

  // Engineer-profession infusions
  { id: 'mechanical-infusion', name: 'Mechanical Infusion Essence', tier: 3, iterations: 1, scope: 'profession', profession: 'Engineer', acquisition: 'skillTree', unlockNode: 'Gear Master',       sideEffect: '+10% ranged damage',                     lore: 'Engineer-tuned infusion for precision weapons.' },
  { id: 'explosive-infusion', name: 'Explosive Infusion Essence',tier: 4, iterations: 2, scope: 'profession', profession: 'Engineer', acquisition: 'skillTree', unlockNode: 'Demolition Expert', sideEffect: '+12% AoE damage',                        lore: 'Volatile infusion that amps area damage.' },
  { id: 'automaton-infusion', name: 'Automaton Infusion Essence',tier: 5, iterations: 2, scope: 'profession', profession: 'Engineer', acquisition: 'skillTree', unlockNode: 'Automata Master',   sideEffect: '+15% turret/summon damage',              lore: 'Construct infusion that reinforces summoned allies.' },
];

let iSeq = 1;
const infusions = INFUSIONS.map(inf => ({
  uuid: grudgeUuid('INFU', iSeq++),
  id: inf.id,
  name: inf.name,
  type: 'infusion',
  category: 'infusion',
  tier: inf.tier,
  tierLabel: TIER_LABELS[inf.tier],
  tierColor: TIER_COLORS[inf.tier],
  scope: inf.scope,                 // universal | profession
  profession: inf.profession,
  iterationsGranted: inf.iterations,
  appliedAt: 'Enchanting Bench (Mystic)',
  sideEffect: inf.sideEffect || null,
  iconUrl: `https://molochdagod.github.io/ObjectStore/icons/infusions/${inf.id}.png`,
  description: inf.lore,
  lore: inf.lore,
  acquisition: inf.acquisition,
  unlockNode: inf.unlockNode || null,
  dropSource: inf.dropSource || null,
  consumedOnApply: true,
}));

// ============================================================
// WRITE FILES
// ============================================================
const apiDir = path.join(__dirname, '..', 'api', 'v1');
fs.mkdirSync(apiDir, { recursive: true });

const enchantsOut = {
  version: '3.0.0',
  generated: new Date().toISOString(),
  total: enchants.length,
  totalEnchants: enchants.length,
  baseEnchants: ENCHANT_BASE.length,
  tiersPerEnchant: 8,
  profession: 'Mystic',
  appliedAt: 'Enchanting Bench (Mystic tree)',
  note: 'Mystic-crafted enchants. Consumed on apply; bakes a permanent stat bonus into the target weapon or armor. Unlocks and crafting all live inside the Mystic profession tree.',
  enchants,
};
fs.writeFileSync(path.join(apiDir, 'master-enchants.json'), JSON.stringify(enchantsOut, null, 2));

const infusionsOut = {
  version: '3.0.0',
  generated: new Date().toISOString(),
  total: infusions.length,
  universalCount: infusions.filter(i => i.scope === 'universal').length,
  professionCount: infusions.filter(i => i.scope === 'profession').length,
  appliedAt: 'Enchanting Bench (Mystic tree)',
  note: 'Infusion essences used to iterate gear through its tier track. Applying at the Mystic Enchanting Bench consumes the essence and grants `iterationsGranted` progress toward the next tier. Profession-scoped essences require the listed unlockNode in the matching profession tree; universal essences drop from enemies and require no unlock.',
  infusions,
};
fs.writeFileSync(path.join(apiDir, 'master-infusions.json'), JSON.stringify(infusionsOut, null, 2));

console.log(`Wrote ${enchants.length} enchant rows to master-enchants.json`);
console.log(`Wrote ${infusions.length} infusion rows to master-infusions.json`);
