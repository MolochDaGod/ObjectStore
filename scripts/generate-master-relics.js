#!/usr/bin/env node
/**
 * generate-master-relics.js
 *
 * Builds `api/v1/master-relics.json` for ObjectStore canon.
 *
 * Relics are an equippable family (slot: "relic") separate from world artifacts.
 * 17 base relics x 8 tiers = 136 rows, structured to match ObjectStore
 * conventions used in master-materials.json and master-items.json.
 *
 * Base definitions sourced from Warlord-Crafting-Suite T1 relic reference,
 * re-named where needed and normalized to canon ObjectStore naming.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Canon tier metadata (aligned with master-items.json + equipment.json) ---
const TIER_LABELS = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Heroic', 'Mythic', 'Legendary', 'Divine'];
const TIER_COLORS = {
  1: '#8b7355', 2: '#a8a8a8', 3: '#4a9eff', 4: '#9d4dff',
  5: '#ff4d4d', 6: '#ef4444', 7: '#06b6d4', 8: '#f472b6',
};

// --- 17 base relic templates (T1 stats, scaling rule) ---
// primaryStat / secondaryStat keys reference the ObjectStore displayStatMap
// in equipment.json (physicalDamage, defense, health, mana, etc.).
const RELIC_BASE = [
  // 6 elemental resistance relics
  { id: 'relic-frost',     name: 'Relic of Frost',      category: 'elemental', element: 'frost',     lore: 'Channels the chill of endless winter, granting protection against ice.',      t1: { elementResist: 15, defense: 5 }, perTier: { elementResist: 3, defense: 1 } },
  { id: 'relic-flame',     name: 'Relic of Flame',      category: 'elemental', element: 'fire',      lore: 'Burns with inner fire, shielding against flame attacks.',                     t1: { elementResist: 15, defense: 5 }, perTier: { elementResist: 3, defense: 1 } },
  { id: 'relic-storm',     name: 'Relic of Storm',      category: 'elemental', element: 'lightning', lore: 'Crackles with lightning energy, deflecting electrical damage.',               t1: { elementResist: 15, defense: 5 }, perTier: { elementResist: 3, defense: 1 } },
  { id: 'relic-earth',     name: 'Relic of Earth',      category: 'elemental', element: 'earth',     lore: 'Solid as stone, granting resistance to earth magic.',                         t1: { elementResist: 15, defense: 5 }, perTier: { elementResist: 3, defense: 1 } },
  { id: 'relic-arcane',    name: 'Relic of Arcane',     category: 'elemental', element: 'arcane',    lore: 'Shimmers with pure magic, defending against arcane forces.',                  t1: { elementResist: 15, defense: 5 }, perTier: { elementResist: 3, defense: 1 } },
  { id: 'relic-sanctity',  name: 'Relic of Sanctity',   category: 'elemental', element: 'holy',      lore: 'Radiates divine light, protecting from holy energy.',                         t1: { elementResist: 15, defense: 5 }, perTier: { elementResist: 3, defense: 1 } },

  // 3 combat relics
  { id: 'relic-fury',      name: 'Relic of Fury',       category: 'combat',    lore: 'Pulses with battle rage, amplifying critical strikes.',                                    t1: { damage: 5, criticalChance: 3, criticalDamage: 10 }, perTier: { damage: 2, criticalChance: 1, criticalDamage: 2 } },
  { id: 'relic-precision', name: 'Relic of Precision',  category: 'combat',    lore: 'Hones the senses, improving accuracy in combat.',                                           t1: { damage: 3, accuracy: 8 },                            perTier: { damage: 1, accuracy: 2 } },
  { id: 'relic-wrath',     name: 'Relic of Wrath',      category: 'combat',    lore: 'Channels pure aggression, increasing raw damage.',                                          t1: { damage: 10 },                                        perTier: { damage: 3 } },

  // 3 defensive relics
  { id: 'relic-guardian',  name: 'Relic of the Guardian', category: 'defensive', lore: 'Embodies protective strength, bolstering defense.',                                      t1: { defense: 15 },                                        perTier: { defense: 4 } },
  { id: 'relic-bulwark',   name: 'Relic of Bulwark',    category: 'defensive', lore: 'A wall against all attacks, improving block chance.',                                       t1: { defense: 5, block: 5, blockFactor: 15 },             perTier: { defense: 1, block: 2, blockFactor: 3 } },
  { id: 'relic-vitality',  name: 'Relic of Vitality',   category: 'defensive', lore: 'Overflows with life energy, granting bonus health.',                                        t1: { health: 50, defense: 5 },                            perTier: { health: 15, defense: 1 } },

  // 5 utility relics
  { id: 'relic-wisdom',    name: 'Relic of Wisdom',     category: 'utility',   lore: 'Contains ancient knowledge, expanding mana reserves.',                                      t1: { mana: 40 },                                          perTier: { mana: 12 } },
  { id: 'relic-endurance', name: 'Relic of Endurance',  category: 'utility',   lore: 'Never tires, boosting stamina capacity.',                                                   t1: { stamina: 30 },                                       perTier: { stamina: 10 } },
  { id: 'relic-vampire',   name: 'Relic of the Vampire', category: 'utility',  lore: 'Drains life from enemies with each strike.',                                                t1: { drainHealth: 3 },                                    perTier: { drainHealth: 1 } },
  { id: 'relic-reflection', name: 'Relic of Reflection', category: 'utility',  lore: 'Returns damage to those who would harm you.',                                               t1: { resistance: 5, reflectDamage: 5 },                   perTier: { resistance: 1, reflectDamage: 2 } },
  // 17th (new): cooldown-focused utility to round out the utility branch
  { id: 'relic-celerity',  name: 'Relic of Celerity',   category: 'utility',   lore: 'Accelerates the wearer\u2019s instincts, sharpening reflexes in battle.',                    t1: { cooldownReduction: 3, attackSpeed: 3 },              perTier: { cooldownReduction: 1, attackSpeed: 1 } },
];

// --- Craft cost scaling by tier (uses canon ObjectStore material ids) ---
const TIER_ESSENCE_ID = {
  1: 'minor-essence', 2: 'lesser-essence', 3: 'greater-essence', 4: 'superior-essence',
  5: 'refined-essence', 6: 'perfect-essence', 7: 'ancient-essence', 8: 'divine-essence',
};
const TIER_GEM_ID = {
  1: 'rough-gem', 2: 'flawed-gem', 3: 'standard-gem', 4: 'fine-gem',
  5: 'pristine-gem', 6: 'flawless-gem', 7: 'radiant-gem', 8: 'divine-gem',
};

// --- Deterministic UUID helper (RELC-YYYYMMDDHHMMSS-######-XXXXXXXX) ---
const TS = '20260423030000';
function grudgeUuid(seq) {
  const seqHex = seq.toString(16).toUpperCase().padStart(6, '0');
  const suffix = crypto.createHash('md5').update(`relic-${seq}-${TS}`).digest('hex').slice(0, 8).toUpperCase();
  return `RELC-${TS}-${seqHex}-${suffix}`;
}

// --- Build 17 x 8 = 136 relic rows ---
const relics = [];
let seq = 0x001;
for (const base of RELIC_BASE) {
  for (let tier = 1; tier <= 8; tier++) {
    const stats = {};
    for (const [stat, baseValue] of Object.entries(base.t1)) {
      const perTier = base.perTier[stat] || 0;
      stats[stat] = baseValue + perTier * (tier - 1);
    }
    const tierLabel = TIER_LABELS[tier];
    const displayName = tier === 1 ? base.name : `${base.name} T${tier}`;
    relics.push({
      uuid: grudgeUuid(seq++),
      baseUuid: null, // filled in below with the T1 uuid for the family
      baseName: base.name,
      id: tier === 1 ? base.id : `${base.id}-t${tier}`,
      name: displayName,
      type: 'relic',
      category: base.category,
      slot: 'relic',
      tier,
      tierLabel,
      tierColor: TIER_COLORS[tier],
      element: base.element || null,
      description: base.lore,
      lore: base.lore,
      iconUrl: `https://objectstore.grudge-studio.com/icons/relics/${base.id}.png`,
      stats,
      craftedBy: 'Mystic',
      craftingRecipe: {
        profession: 'Mystic',
        materials: [
          { id: TIER_ESSENCE_ID[tier], quantity: 2 + tier },
          { id: TIER_GEM_ID[tier], quantity: 1 + Math.floor(tier / 2) },
        ],
        craftTime: 30 + tier * 10,
        gold: 50 * Math.pow(2, tier - 1),
      },
      source: 'craft',
    });
  }
}

// Link tiered variants back to the T1 baseUuid for their family
const baseUuidByBaseName = {};
for (const r of relics) {
  if (r.tier === 1) baseUuidByBaseName[r.baseName] = r.uuid;
}
for (const r of relics) {
  r.baseUuid = baseUuidByBaseName[r.baseName];
}

// --- Write the file ---
const out = {
  version: '3.0.0',
  generated: new Date().toISOString(),
  total: relics.length,
  totalRelics: relics.length,
  baseRelics: RELIC_BASE.length,
  tiersPerRelic: 8,
  note: 'Equippable relics for the `relic` gear slot. Distinct from world-drop artifacts (see master-artifacts.json).',
  categories: ['elemental', 'combat', 'defensive', 'utility'],
  relics,
};

const outPath = path.join(__dirname, '..', 'api', 'v1', 'master-relics.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Wrote ${relics.length} relic rows to ${outPath}`);
