#!/usr/bin/env node
/**
 * generate-t0-addendum.js
 *
 * Produces `api/v1/_drafts/t0-addendum.json` for review before merging
 * into canon files (master-items.json, master-consumables.json,
 * master-materials.json).
 *
 * Scope per product direction:
 *   - T0 weapons: one starter row per physical weapon family.
 *     Magic collapses at T0 to one wand and one nature staff.
 *   - T0 armor: 6 parts (helmet, shoulders, chest, hands, legs, feet)
 *     x 3 materials (cloth coverings from hemp, skinned leather
 *     from leather scraps, ore-sealed stone from raw ore + stone).
 *     Uniform craft cost: helmet 3, shoulders 3, chest 5,
 *     hands 2, legs 3, feet 2.
 *   - T0 consumables: tiny starter layer (potions + campfire food).
 *   - 2 new T0 materials: hemp, rough-stone.
 *
 * All rows follow existing ObjectStore naming/structure conventions.
 * No WCS set names (Bloodfeud/Wraithfang/etc.) or "Rusty Sword" style
 * starter names are imported.
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

const TIER_LABEL_T0 = 'Starter';
const TIER_COLOR_T0 = '#6b7280'; // neutral gray, distinct from T1 Common

// ============================================================
// T0 WEAPONS
// ============================================================
// Stats are ~40% of a canonical T1 baseline (damage ~50 @ T1 for swords),
// shared starter arithmetic so every family feels comparable.
const T0_WEAPON_DEFS = [
  // 11 physical families
  { id: 't0-sword',       name: 'Training Sword',      category: 'swords',       subCategory: '1h',        craftedBy: 'Miner',    icon: 'swords/sword_01.png',       stats: { damage: 18, speed: 95,  combo: 0,  crit: 1, block: 2, defense: 6  }, desc: 'A blunted training blade for recruits.',                  materials: [{ id: 'scrap-ingot', quantity: 2 }, { id: 'driftwood-log', quantity: 1 }] },
  { id: 't0-axe1h',       name: 'Hand Axe',            category: 'axes1h',       subCategory: '1h',        craftedBy: 'Miner',    icon: 'axes1h/axe_01.png',         stats: { damage: 20, speed: 105, combo: 0,  crit: 1, block: 2, defense: 5  }, desc: 'A simple woodcutter\u2019s axe pressed into battle.',     materials: [{ id: 'scrap-ingot', quantity: 2 }, { id: 'driftwood-log', quantity: 1 }] },
  { id: 't0-dagger',      name: 'Training Dagger',     category: 'daggers',      subCategory: '1h',        craftedBy: 'Miner',    icon: 'daggers/dagger_01.png',     stats: { damage: 14, speed: 70,  combo: 10, crit: 2, block: 0, defense: 3  }, desc: 'A short utility knife used in sparring.',                 materials: [{ id: 'scrap-ingot', quantity: 1 }, { id: 'scraps-leather', quantity: 1 }] },
  { id: 't0-hammer1h',    name: 'Training Hammer',     category: 'hammers1h',    subCategory: '1h',        craftedBy: 'Miner',    icon: 'hammers1h/hammer_01.png',   stats: { damage: 22, speed: 115, combo: 0,  crit: 0, block: 3, defense: 7  }, desc: 'A smith\u2019s hammer, heavy enough to bruise.',          materials: [{ id: 'scrap-ingot', quantity: 2 }, { id: 'driftwood-log', quantity: 1 }] },
  { id: 't0-spear',       name: 'Hunting Spear',       category: 'spears',       subCategory: '2h',        craftedBy: 'Forester', icon: 'spears/spear_01.png',       stats: { damage: 24, speed: 110, combo: 0,  crit: 1, block: 2, defense: 7  }, desc: 'A pointed stick bound with rawhide.',                     materials: [{ id: 'driftwood-log', quantity: 2 }, { id: 'scrap-ingot', quantity: 1 }] },
  { id: 't0-greatsword',  name: 'Training Greatsword', category: 'greatswords',  subCategory: '2h',        craftedBy: 'Miner',    icon: 'greatswords/sword_30.png',  stats: { damage: 28, speed: 125, combo: 0,  crit: 1, block: 3, defense: 10 }, desc: 'An oversized training blade meant for practice swings.',  materials: [{ id: 'scrap-ingot', quantity: 3 }, { id: 'driftwood-log', quantity: 2 }] },
  { id: 't0-greataxe',    name: 'Training Greataxe',   category: 'greataxes',    subCategory: '2h',        craftedBy: 'Miner',    icon: 'greataxes/axe_20.png',      stats: { damage: 30, speed: 135, combo: 0,  crit: 1, block: 3, defense: 11 }, desc: 'A woodsman\u2019s greataxe sharpened for war.',           materials: [{ id: 'scrap-ingot', quantity: 3 }, { id: 'driftwood-log', quantity: 2 }] },
  { id: 't0-hammer2h',    name: 'Training Warhammer',  category: 'hammers2h',    subCategory: '2h',        craftedBy: 'Miner',    icon: 'hammers2h/hammer_20.png',   stats: { damage: 32, speed: 145, combo: 0,  crit: 0, block: 4, defense: 12 }, desc: 'A two-handed maul used to split logs.',                   materials: [{ id: 'scrap-ingot', quantity: 3 }, { id: 'driftwood-log', quantity: 2 }] },
  { id: 't0-bow',         name: 'Short Bow',           category: 'bows',         subCategory: 'ranged-2h', craftedBy: 'Forester', icon: 'bows/bow_01.png',           stats: { damage: 20, speed: 85,  combo: 15, crit: 2, block: 0, defense: 4  }, desc: 'A hunting bow carved from seasoned driftwood.',           materials: [{ id: 'driftwood-log', quantity: 2 }, { id: 'rag-thread', quantity: 2 }] },
  { id: 't0-crossbow',    name: 'Light Crossbow',      category: 'crossbows',    subCategory: 'ranged-2h', craftedBy: 'Engineer', icon: 'crossbows/crossbow_01.png', stats: { damage: 24, speed: 75,  combo: 5,  crit: 2, block: 1, defense: 5  }, desc: 'A crude repeater cobbled from scrap.',                    materials: [{ id: 'driftwood-log', quantity: 1 }, { id: 'scrap-ingot', quantity: 2 }, { id: 'rag-thread', quantity: 1 }] },
  { id: 't0-gun',         name: 'Flintlock Pistol',    category: 'guns',         subCategory: 'ranged-2h', craftedBy: 'Engineer', icon: 'guns/gun_01.png',           stats: { damage: 28, speed: 80,  combo: 20, crit: 3, block: 0, defense: 3  }, desc: 'A homemade flintlock more loud than accurate.',           materials: [{ id: 'scrap-ingot', quantity: 2 }, { id: 'driftwood-log', quantity: 1 }, { id: 'rough-stone', quantity: 1 }] },

  // Magic weapons: collapsed at T0 to a single wand + one nature staff
  { id: 't0-wand',        name: 'Apprentice Wand',     category: 'wands',        subCategory: '1h-magic',  craftedBy: 'Mystic',   icon: 'weapons/staff_01.png',      stats: { damage: 14, speed: 70,  combo: 50, crit: 1, block: 0, defense: 3  }, desc: 'A novice\u2019s wand that flickers with raw magic. Branches into fire, frost, holy, arcane, and lightning staves at T1.', materials: [{ id: 'driftwood-log', quantity: 1 }, { id: 'faint-essence', quantity: 2 }] },
  { id: 't0-nature-staff', name: 'Sapling Staff',      category: 'natureStaves', subCategory: '2h-magic',  craftedBy: 'Mystic',   icon: 'weapons/staff_02.png',      stats: { damage: 16, speed: 95,  combo: 60, crit: 1, block: 1, defense: 5  }, desc: 'A living branch that roots the wielder to the earth.',    materials: [{ id: 'driftwood-log', quantity: 2 }, { id: 'faint-essence', quantity: 1 }] },

  // Tools family (gathering) + offhand-tome
  { id: 't0-tool',        name: 'Crude Tool',          category: 'tools',        subCategory: 'gathering', craftedBy: 'Miner',    icon: 'tools/tool_01.png',         stats: { damage: 8,  speed: 100, combo: 0,  crit: 0, block: 0, defense: 2  }, desc: 'A multipurpose gathering tool for chipping, cutting, and prying.', materials: [{ id: 'scrap-ingot', quantity: 1 }, { id: 'driftwood-log', quantity: 1 }] },
  { id: 't0-offhand-tome', name: 'Novice Tome',        category: 'offhand-tome', subCategory: 'offhand',   craftedBy: 'Mystic',   icon: 'tomes/tome_01.png',         stats: { damage: 0,  speed: 0,   combo: 30, crit: 0, block: 2, defense: 4  }, desc: 'A beginner\u2019s spellbook with a handful of cantrips.', materials: [{ id: 'scraps-leather', quantity: 2 }, { id: 'rag-thread', quantity: 1 }, { id: 'faint-essence', quantity: 1 }] },
];

let wSeq = 1;
const t0Weapons = T0_WEAPON_DEFS.map(w => ({
  uuid: grudgeUuid('ITEM', wSeq++),
  baseUuid: null,
  id: w.id,
  name: w.name,
  baseName: w.name,
  category: w.category,
  type: 'weapon',
  subCategory: w.subCategory,
  tier: 0,
  tierLabel: TIER_LABEL_T0,
  tierColor: TIER_COLOR_T0,
  iconUrl: `https://objectstore.grudge-studio.com/icons/${w.icon}`,
  description: w.desc,
  stats: w.stats,
  craftedBy: w.craftedBy,
  craftingRecipe: {
    profession: null, // T0 can be crafted without profession bench
    station: 'Anywhere',
    materials: w.materials,
    craftTime: 10,
    gold: 0,
  },
  source: 'starter',
  usedInT1Crafting: true,
}));
t0Weapons.forEach(r => { r.baseUuid = r.uuid; });

// ============================================================
// T0 ARMOR
// ============================================================
// 6 parts x 3 materials = 18 rows.
// Uniform craft quantities per part, switched by material source.
const ARMOR_PARTS = [
  { slot: 'helmet',    qty: 3, hpMult: 1.0 },
  { slot: 'shoulders', qty: 3, hpMult: 1.0 },
  { slot: 'chest',     qty: 5, hpMult: 1.6 },
  { slot: 'hands',     qty: 2, hpMult: 0.6 },
  { slot: 'legs',      qty: 3, hpMult: 1.2 },
  { slot: 'feet',      qty: 2, hpMult: 0.7 },
];

const ARMOR_MATERIALS = [
  {
    key: 'cloth',    label: 'Cloth Coverings',     material: 'cloth',   primary: 'hemp',
    namePrefix: 'Hemp',
    partName: { helmet: 'Wrap', shoulders: 'Mantle', chest: 'Tunic', hands: 'Wraps', legs: 'Trousers', feet: 'Sandals' },
    baseStats: { health: 8,  mana: 12, defense: 1, evasion: 1 },
    profession: 'Mystic',
    icon: (part) => `armor/cloth/cloth-${part}-t0.png`,
    extraRecipe: null, // material = primary only
  },
  {
    key: 'leather',  label: 'Skinned Leather',    material: 'leather', primary: 'scraps-leather',
    namePrefix: 'Skinned Leather',
    partName: { helmet: 'Cap', shoulders: 'Pauldrons', chest: 'Vest', hands: 'Gloves', legs: 'Breeches', feet: 'Boots' },
    baseStats: { health: 14, mana: 4,  defense: 3, evasion: 2 },
    profession: 'Forester',
    icon: (part) => `armor/leather/leather-${part}-t0.png`,
    extraRecipe: null,
  },
  {
    key: 'stone',    label: 'Ore-Sealed Stone',   material: 'metal',   primary: 'scrap-ore',
    namePrefix: 'Stonebound',
    partName: { helmet: 'Helm', shoulders: 'Pauldrons', chest: 'Chestplate', hands: 'Gauntlets', legs: 'Greaves', feet: 'Sabatons' },
    baseStats: { health: 20, mana: 0,  defense: 6, evasion: 0, block: 1 },
    profession: 'Miner',
    icon: (part) => `armor/metal/metal-${part}-t0.png`,
    // ore-sealed stone uses raw ore + rough stone together
    extraRecipe: { id: 'rough-stone', ratio: 1.0 },
  },
];

let aSeq = 1;
const t0Armor = [];
for (const mat of ARMOR_MATERIALS) {
  for (const part of ARMOR_PARTS) {
    const stats = {};
    for (const [k, v] of Object.entries(mat.baseStats)) {
      stats[k] = Math.round(v * part.hpMult * (k === 'defense' ? 1 : 1));
    }
    const materials = [{ id: mat.primary, quantity: part.qty }];
    if (mat.extraRecipe) {
      materials.push({ id: mat.extraRecipe.id, quantity: Math.max(1, Math.round(part.qty * mat.extraRecipe.ratio)) });
    }
    t0Armor.push({
      uuid: grudgeUuid('ITEM', 100 + aSeq),
      baseUuid: null,
      id: `t0-${mat.key}-${part.slot}`,
      name: `${mat.namePrefix} ${mat.partName[part.slot]}`,
      baseName: `${mat.namePrefix} ${mat.partName[part.slot]}`,
      category: 'armor',
      type: 'armor',
      slot: part.slot,
      material: mat.material,
      materialLabel: mat.label,
      tier: 0,
      tierLabel: TIER_LABEL_T0,
      tierColor: TIER_COLOR_T0,
      iconUrl: `https://objectstore.grudge-studio.com/icons/${mat.icon(part.slot)}`,
      description: `${mat.label} ${part.slot} worn by fresh settlers.`,
      stats,
      craftedBy: mat.profession,
      craftingRecipe: {
        profession: null,
        station: 'Anywhere',
        materials,
        craftTime: 10,
        gold: 0,
      },
      source: 'starter',
      usedInT1Crafting: true,
    });
    aSeq++;
  }
}
t0Armor.forEach(r => { r.baseUuid = r.uuid; });

// ============================================================
// T0 CONSUMABLES
// ============================================================
const T0_CONSUMABLES = [
  { id: 't0-weak-health-potion',  name: 'Weak Health Potion',  category: 'mysticPotions',     type: 'potion', icon: 'consumables/mysticPotions_t0_health.png',  effect: 'Restores 25 HP',      buff: { heal: '25 HP' },    materials: [{ id: 'wild-herb', quantity: 2 }, { id: 'water-flask', quantity: 1 }], desc: 'A crude brew that tastes of bitter roots.' },
  { id: 't0-weak-mana-potion',    name: 'Weak Mana Potion',    category: 'mysticPotions',     type: 'potion', icon: 'consumables/mysticPotions_t0_mana.png',    effect: 'Restores 15 MP',      buff: { mana: '15 MP' },    materials: [{ id: 'wild-herb', quantity: 2 }, { id: 'water-flask', quantity: 1 }], desc: 'A shimmering sip that cools the mind.' },
  { id: 't0-weak-stamina-potion', name: 'Weak Stamina Potion', category: 'mysticPotions',     type: 'potion', icon: 'consumables/mysticPotions_t0_stamina.png', effect: 'Restores 20 Stamina', buff: { stamina: '20' },    materials: [{ id: 'wild-herb', quantity: 2 }, { id: 'water-flask', quantity: 1 }], desc: 'A gritty draught that jolts the legs.' },
  { id: 't0-charred-meat',        name: 'Charred Meat',        category: 'redFoods',           type: 'food',   icon: 'consumables/redFoods_t0.png',              effect: 'Restores 10 HP, +2 Stamina Regen for 30s', buff: { heal: '10 HP', staminaRegen: '+2/s 30s' }, materials: [{ id: 'raw-meat', quantity: 1 }], desc: 'Barely edible but filling enough to keep going.' },
  { id: 't0-smoked-fish',         name: 'Smoked Fish',         category: 'blueFoods',          type: 'food',   icon: 'consumables/blueFoods_t0.png',             effect: 'Restores 8 HP, +3 Mana Regen for 30s',      buff: { heal: '8 HP', manaRegen: '+3/s 30s' },     materials: [{ id: 'raw-fish', quantity: 1 }], desc: 'Simple preserved fish, calming and clear-headed.' },
];

let cSeq = 1;
const t0Consumables = T0_CONSUMABLES.map(c => {
  const prefix = c.type === 'potion' ? 'POTN' : 'FOOD';
  const uuid = grudgeUuid(prefix, 300 + cSeq++);
  return {
    uuid,
    baseUuid: uuid,
    id: c.id,
    name: c.name,
    baseName: c.name,
    category: c.category,
    type: c.type,
    requiredLevel: 1,
    tier: 0,
    tierLabel: TIER_LABEL_T0,
    tierColor: TIER_COLOR_T0,
    iconUrl: `https://objectstore.grudge-studio.com/icons/${c.icon}`,
    emoji: c.type === 'potion' ? '🧪' : '🍖',
    description: c.desc,
    effect: c.effect,
    stats: c.buff,
    buff: JSON.stringify(c.buff),
    craftedBy: c.type === 'potion' ? 'Mystic' : 'Chef',
    craftingRecipe: {
      profession: null,
      station: 'Campfire',
      materials: c.materials,
      craftTime: 5,
      gold: 0,
    },
    source: 'starter',
    usedInT1Crafting: true,
  };
});

// ============================================================
// NEW T0 MATERIALS (only the ones not yet in master-materials.json)
// ============================================================
const T0_NEW_MATERIALS = [
  { id: 'hemp',          name: 'Hemp',              category: 'cloth',     tier: 0, emoji: '🌾', gatheredBy: 'Mystic',   icon: 'hemp.png',          desc: 'Rough plant fiber gathered from wild hemp stalks. Used in cloth-covering T0 armor.' },
  { id: 'rough-stone',   name: 'Rough Stone',       category: 'component', tier: 0, emoji: '🪨', gatheredBy: 'Miner',    icon: 'rough-stone.png',   desc: 'Unshaped stone fragments. Paired with raw ore to seal stone armor.' },
  { id: 'wild-herb',     name: 'Wild Herb',         category: 'ingredient',tier: 0, emoji: '🌿', gatheredBy: 'Chef',     icon: 'wild-herb.png',     desc: 'Forageable medicinal plants used in starter potions.' },
  { id: 'water-flask',   name: 'Water Flask',       category: 'ingredient',tier: 0, emoji: '💧', gatheredBy: 'Chef',     icon: 'water-flask.png',   desc: 'A flask of fresh water collected from streams or wells.' },
  { id: 'raw-meat',      name: 'Raw Meat',          category: 'ingredient',tier: 0, emoji: '🥩', gatheredBy: 'Forester', icon: 'raw-meat.png',      desc: 'Untreated meat from hunted game.' },
  { id: 'raw-fish',      name: 'Raw Fish',          category: 'ingredient',tier: 0, emoji: '🐟', gatheredBy: 'Forester', icon: 'raw-fish.png',      desc: 'Freshly caught fish.' },
];

let mSeq = 1;
const t0Materials = T0_NEW_MATERIALS.map(m => ({
  uuid: grudgeUuid('MATL', 400 + mSeq++),
  id: m.id,
  name: m.name,
  type: 'material',
  category: m.category,
  tier: m.tier,
  emoji: m.emoji,
  gatheredBy: m.gatheredBy,
  iconUrl: `https://objectstore.grudge-studio.com/icons/materials/${m.icon}`,
  description: m.desc,
}));

// ============================================================
// WRITE DRAFT
// ============================================================
const draft = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  note: 'Draft T0 addendum. Merge into master-items.json / master-consumables.json / master-materials.json after review. Do NOT import WCS set names (Bloodfeud, Wraithfang, Oathbreaker, Kinrend, Dusksinger, Emberclad) or the Rusty Sword / Chipped Axe starter names. ObjectStore naming is canon.',
  totals: {
    t0Weapons: t0Weapons.length,
    t0Armor: t0Armor.length,
    t0Consumables: t0Consumables.length,
    t0NewMaterials: t0Materials.length,
  },
  t0Weapons,
  t0Armor,
  t0Consumables,
  t0NewMaterials: t0Materials,
};

const outDir = path.join(__dirname, '..', 'api', 'v1', '_drafts');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 't0-addendum.json');
fs.writeFileSync(outPath, JSON.stringify(draft, null, 2));
console.log(`Wrote T0 addendum draft to ${outPath}`);
console.log(`  weapons: ${t0Weapons.length}, armor: ${t0Armor.length}, consumables: ${t0Consumables.length}, new materials: ${t0Materials.length}`);
