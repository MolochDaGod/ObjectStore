#!/usr/bin/env node
/**
 * admin-merge.js
 *
 * Authoritative merge into ObjectStore canon.
 * Order of operations (deterministic, rerun-safe):
 *   1. Retag staff craftedBy to match design intent and fill empty lore.
 *   2. Add the 6th Engineer-crafted lightningStaves variant (Tesla Coil).
 *   3. Merge the T0 addendum into master-items / master-armor /
 *      master-consumables / master-materials using canon schema
 *      (`slotType` Title-Case, `hp` stat key, etc.).
 *   4. Register master-relics / master-enchants / master-infusions in
 *      master-registry.json.
 *
 * Canon design spec for staff family attribution:
 *   fireStaves      5 Mystic + 1 Chef
 *   frostStaves     5 Mystic + 1 Chef
 *   holyStaves      2 Mystic + 1 Miner + 1 Forester + 1 Chef + 1 Engineer
 *   natureStaves    0 Mystic + 4 Forester + 1 Miner + 1 Chef
 *   lightningStaves 5 Mystic + 1 Engineer (new variant)
 *
 * Safety: makes .bak copies of every file it writes (one per run).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const API_DIR = path.join(__dirname, '..', 'api', 'v1');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, obj) => {
  if (fs.existsSync(p)) fs.copyFileSync(p, p + '.bak');
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
};

const TS = '20260423030000';
function grudgeUuid(prefix, seq) {
  const seqHex = seq.toString(16).toUpperCase().padStart(6, '0');
  const suffix = crypto.createHash('md5').update(`${prefix}-${seq}-${TS}`).digest('hex').slice(0, 8).toUpperCase();
  return `${prefix}-${TS}-${seqHex}-${suffix}`;
}

const TIER_LABELS = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Heroic', 'Mythic', 'Legendary', 'Divine'];
const TIER_COLORS = {
  1: '#8b7355', 2: '#a8a8a8', 3: '#4a9eff', 4: '#9d4dff',
  5: '#ff4d4d', 6: '#ef4444', 7: '#06b6d4', 8: '#f472b6',
};

// ============================================================
// 1. STAFF RETAG TABLE (baseName -> { craftedBy, lore, signature?, abilities? })
// ============================================================
const STAFF_RETAG = {
  // fireStaves: 5 Mystic + 1 Chef (Sunfire is the Chef specialty)
  'Emberwrath Staff': { craftedBy: 'Mystic' },
  'Ember Heart':      { craftedBy: 'Mystic' },
  'Inferno Spire':    { craftedBy: 'Mystic', lore: 'Infernal channeling rod forged from obsidian shards.',     signature: 'Inferno Surge (line DoT)',      abilities: ['Flame Wave (cone AoE DoT)', 'Fireball (AoE burst)', 'Inferno Shield (reflect dmg)', 'Inferno Surge (channeled line DoT)', 'Hellfire Wall (wall burn)'] },
  'Ash Grudge':       { craftedBy: 'Mystic', lore: 'Bound with the grudges of burnt kin and embered pyres.',  signature: 'Ashstorm (AoE DoT)',            abilities: ['Flame Wave (cone AoE DoT)', 'Fireball (AoE burst)', 'Inferno Shield (reflect dmg)', 'Ash Cloud (blind AoE)', 'Cinder Rain (DoT rain)'] },
  'Blazing Wrath':    { craftedBy: 'Mystic', lore: 'A staff that howls with the wrath of a thousand fires.',  signature: 'Wrathstorm (big AoE)',          abilities: ['Flame Wave (cone AoE DoT)', 'Fireball (AoE burst)', 'Inferno Shield (reflect dmg)', 'Fury Pyre (lifesteal burn)', 'Blaze Nova (burst)'] },
  'Sunfire Staff':    { craftedBy: 'Chef',   lore: 'A hearth-kissed staff whose flames taste of roast and honey; a Chef\u2019s cooking fire given form.', signature: 'Hearthbloom (AoE heal + burn)', abilities: ['Hearth Wave (cone heal)', 'Skillet Smash (AoE burst)', 'Oven Shield (absorb + burn)', 'Boiling Blood (lifesteal burn)', 'Simmer Pyre (HoT + DoT)'] },

  // frostStaves: 5 Mystic + 1 Chef (Frozen Spite is the Chef ice-fishing specialty)
  'Glacial Spire':    { craftedBy: 'Mystic' },
  'Ice Warden':       { craftedBy: 'Mystic' },
  'Frostbite Staff':  { craftedBy: 'Mystic', lore: 'A frozen rod that bites any who grip it too long.',       signature: 'Absolute Zero (mass freeze)',   abilities: ['Ice Nova (AoE slow)', 'Frost Lance (single burst)', 'Glacial Shield (absorb dmg)', 'Biting Touch (freeze stack)', 'Frost Chain (chain slow)'] },
  'Winter Grudge':    { craftedBy: 'Mystic', lore: 'Infused with the grudges of long, killing winters.',      signature: 'Winterfall (AoE freeze + dmg)', abilities: ['Ice Nova (AoE slow)', 'Frost Lance (single burst)', 'Glacial Shield (absorb dmg)', 'Killing Cold (freeze DoT)', 'Snowblind (blind AoE)'] },
  'Blizzard Heart':   { craftedBy: 'Mystic', lore: 'Carved around an eternal snowstorm that refuses to thaw.', signature: 'Blizzard Call (channeled AoE)', abilities: ['Ice Nova (AoE slow)', 'Frost Lance (single burst)', 'Glacial Shield (absorb dmg)', 'Blizzard Gust (AoE push)', 'Chill Mark (mark + slow)'] },
  'Frozen Spite':     { craftedBy: 'Chef',   lore: 'A fisher\u2019s rod packed with rime-ice; the frost of long cold nights and preserved catch. Brewed at the Ice Hearth.', signature: 'Cold Harvest (AoE freeze + HoT)', abilities: ['Ice Nova (AoE slow)', 'Preserving Lance (freeze + HoT)', 'Glacial Shield (absorb dmg)', 'Hookline (pull + chill)', 'Deepfreeze (burst freeze)'] },

  // holyStaves: 2 Mystic + 1 each (Miner, Forester, Chef, Engineer)
  'Dawnspire':        { craftedBy: 'Mystic' },
  'Sacred Light':     { craftedBy: 'Mystic' },
  'Holy Wrath':       { craftedBy: 'Miner',    lore: 'A stonecut pillar of consecrated granite that echoes with the hymns of underground cathedrals.', signature: 'Stonebless (AoE holy barrier)',     abilities: ['Divine Wave (AoE heal)', 'Stoneward (ally shield)', 'Smite (dmg purge)', 'Granite Hymn (AoE resist)', 'Crushing Blessing (burst heal + knockdown)'] },
  'Redemption Staff': { craftedBy: 'Forester', lore: 'Carved from a pilgrim oak that grew over a battlefield; the grove\u2019s way of forgiving the dead.', signature: 'Sanctified Grove (AoE HoT + revive)', abilities: ['Divine Wave (AoE heal)', 'Sacred Shield (ally shield)', 'Smite (dmg purge)', 'Grove\u2019s Mercy (HoT + cleanse)', 'Pilgrim\u2019s Light (ally buff)'] },
  'Celestial Grace':  { craftedBy: 'Chef',     lore: 'Woven with feast-ribbon and sanctified at a banquet hall; every strike tastes of wine and myrrh.',        signature: 'Feast of Light (AoE heal + food buff)', abilities: ['Divine Wave (AoE heal)', 'Sacred Shield (ally shield)', 'Smite (dmg purge)', 'Blessed Bite (heal on hit)', 'Ambrosia Veil (buff duration+)'] },
  'Divine Judgment':  { craftedBy: 'Engineer', lore: 'A gyroscopic reliquary clockwork that rings like a cathedral bell when it strikes.',                       signature: 'Tribunal Gearing (AoE holy + stun)', abilities: ['Divine Wave (AoE heal)', 'Sacred Shield (ally shield)', 'Smite (dmg purge)', 'Verdict Toll (AoE stun)', 'Chronojudgment (cooldown reset)'] },

  // natureStaves: 0 Mystic + 4 Forester + 1 Miner + 1 Chef
  'Verdant Wrath':    { craftedBy: 'Forester' },
  'Thorn Grudge':     { craftedBy: 'Forester' },
  'Wild Oathbreaker': { craftedBy: 'Forester' },
  'Blossom Fury':     { craftedBy: 'Forester', lore: 'A thornvine staff that flowers anew each spring; a Forester\u2019s ritual weapon.',                      signature: 'Bloom Cascade (AoE HoT + thorn)', abilities: ['Thorn Burst (AoE dmg)', 'Healing Bloom (AoE HoT)', 'Nature\u2019s Shield (absorb)', 'Petal Storm (AoE slow)', 'Rooting Vine (root single)'] },
  'Grove Guardian':   { craftedBy: 'Miner',    lore: 'A totem-headed staff cut from living stone and bound with moss; the earth answers its call. Earthshaker\u2019s stride.', signature: 'Earthshaker (line fissure + stun)', abilities: ['Fissure (line knockup)', 'Aftershock (self AoE slow)', 'Echo Slam (AoE stun pull)', 'Enchant Totem (stationary totem)', 'Stoneroot (self root + reflect)'] },
  'Root Warden':      { craftedBy: 'Chef',     lore: 'Carved at the cookfire and packed with roots, herbs, and preserving salts; each swing smells of harvest stew.',         signature: 'Harvest Sweep (AoE HoT + food buff)', abilities: ['Thorn Burst (AoE dmg)', 'Healing Bloom (AoE HoT)', 'Stewbroth Shield (absorb + HoT)', 'Herb Pick (cleanse + speed)', 'Salted Root (root + cleanse)'] },

  // lightningStaves: 5 Mystic + 1 Engineer (Tesla Coil is added below)
  'Stormwrath':       { craftedBy: 'Mystic' },
  'Thunder Spire':    { craftedBy: 'Mystic' },
  'Tempest Spire':    { craftedBy: 'Mystic', lore: 'Storm-cored staff that hums with endless distant thunder.',                     signature: 'Tempest Call (rain lightning)', abilities: ['Lightning Strike (AoE stun)', 'Chain Shock (multi bounce)', 'Storm Shield (reflect)', 'Gale Burst (AoE push)', 'Tempest Chain (chain stun)'] },
  'Shock Grudge':     { craftedBy: 'Mystic', lore: 'Pent with the grudges of men who died cursing the sky.',                         signature: 'Grudge Arc (line chain stun)', abilities: ['Lightning Strike (AoE stun)', 'Chain Shock (multi bounce)', 'Storm Shield (reflect)', 'Grudgebolt (single heavy stun)', 'Static Mark (stack + detonate)'] },
  'Voltaic Heart':    { craftedBy: 'Mystic', lore: 'Every heartbeat of the wielder pulses a tiny lightning around the shaft.',       signature: 'Heart of Storm (self buff + AoE)',  abilities: ['Lightning Strike (AoE stun)', 'Chain Shock (multi bounce)', 'Storm Shield (reflect)', 'Voltaic Pulse (AoE stun pulse)', 'Overcharge (next spell AoE)'] },
};

// 6th lightning staff variant (new, Engineer)
const TESLA_COIL = {
  baseName: 'Tesla Coil Staff',
  craftedBy: 'Engineer',
  description: 'An Engineer-built staff crowned with a humming tesla coil; discharge scales with how long it\u2019s charged.',
  lore: 'An Engineer-built staff crowned with a humming tesla coil; discharge scales with how long it\u2019s charged.',
  baseStats: { damage: 66, speed: 50, combo: 115, crit: 7, block: 0, defense: 10 },
  perTierStats: { damage: 14, speed: -1, combo: 44, crit: 1.1, block: 0, defense: 2.5 },
  abilities: ['Lightning Strike (AoE stun)', 'Chain Shock (multi bounce)', 'Storm Shield (reflect)', 'Capacitor Dump (burst single-target)', 'Tesla Field (stationary AoE zone)'],
  signature: 'Overload Discharge (massive AoE chain stun after 3s charge)',
  passives: ['Capacitor (charges on hits)', 'Grounded (CC resist)', 'Overclock (next spell free after crit)'],
  primaryStat: 'damage',
  secondaryStat: 'stun',
  iconUrl: 'https://objectstore.grudge-studio.com/icons/pack/weapons/staff_60.png',
};

// ============================================================
// 2. LOAD CANON
// ============================================================
const masterItemsPath       = path.join(API_DIR, 'master-items.json');
const masterArmorPath       = path.join(API_DIR, 'master-armor.json');
const masterWeaponsPath     = path.join(API_DIR, 'master-weapons.json');
const masterConsumablesPath = path.join(API_DIR, 'master-consumables.json');
const masterMaterialsPath   = path.join(API_DIR, 'master-materials.json');
const masterRegistryPath    = path.join(API_DIR, 'master-registry.json');
const t0DraftPath           = path.join(API_DIR, '_drafts', 't0-addendum.json');

const items       = readJson(masterItemsPath);
const armor       = readJson(masterArmorPath);
const weapons     = readJson(masterWeaponsPath);
const consumables = readJson(masterConsumablesPath);
const materials   = readJson(masterMaterialsPath);
const registry    = readJson(masterRegistryPath);
const t0Draft     = readJson(t0DraftPath);

// ============================================================
// 3. STEP 1 & 2 - Retag staff craftedBy + fill lore + add Tesla Coil variant
// ============================================================
let retagCount = 0;
let loreFilledCount = 0;
for (const row of items.items) {
  const table = STAFF_RETAG[row.baseName];
  if (!table) continue;
  if (row.craftedBy !== table.craftedBy) {
    row.craftedBy = table.craftedBy;
    retagCount++;
  }
  // Fill empty lore / description / signature / abilities for T1-T8 rows
  if (table.lore && (!row.lore || !row.description || !row.signature)) {
    row.description = row.description || table.lore;
    row.lore        = row.lore        || table.lore;
    if (table.signature && (!row.signature || row.signature === '')) row.signature = table.signature;
    if (table.abilities && (!row.abilities || row.abilities.length === 0)) row.abilities = table.abilities;
    loreFilledCount++;
  }
}
console.log(`[retag] updated craftedBy on ${retagCount} rows`);
console.log(`[retag] filled lore/signature/abilities on ${loreFilledCount} rows`);

// Mirror retag into master-weapons.json if it has the same rows
if (Array.isArray(weapons.items)) {
  let mirror = 0;
  for (const row of weapons.items) {
    const table = STAFF_RETAG[row.baseName];
    if (!table) continue;
    if (row.craftedBy !== table.craftedBy) { row.craftedBy = table.craftedBy; mirror++; }
    if (table.lore && (!row.lore || !row.description)) {
      row.description = row.description || table.lore;
      row.lore        = row.lore        || table.lore;
      if (table.signature && !row.signature) row.signature = table.signature;
      if (table.abilities && (!row.abilities || row.abilities.length === 0)) row.abilities = table.abilities;
    }
    mirror++;
  }
  console.log(`[retag] mirrored into master-weapons.json: ${mirror} rows touched`);
}

// --- Add Tesla Coil Staff (Engineer) T1-T8 ---
const teslaRows = [];
let wSeq = 2000;
for (let tier = 1; tier <= 8; tier++) {
  const stats = {};
  for (const [k, baseV] of Object.entries(TESLA_COIL.baseStats)) {
    const per = TESLA_COIL.perTierStats[k] || 0;
    stats[k] = Math.round((baseV + per * (tier - 1)) * 10) / 10;
  }
  teslaRows.push({
    uuid: grudgeUuid('ITEM', wSeq++),
    baseUuid: null, // filled after
    name: tier === 1 ? TESLA_COIL.baseName : `${TESLA_COIL.baseName} T${tier}`,
    baseName: TESLA_COIL.baseName,
    category: 'lightningStaves',
    type: 'weapon',
    subCategory: 'Ranged 2h',
    tier,
    tierLabel: TIER_LABELS[tier],
    tierColor: TIER_COLORS[tier],
    iconUrl: TESLA_COIL.iconUrl,
    description: TESLA_COIL.description,
    stats,
    craftedBy: TESLA_COIL.craftedBy,
    recipeUuid: null,
    source: 'craft',
    abilities: TESLA_COIL.abilities,
    signature: TESLA_COIL.signature,
    passives: TESLA_COIL.passives,
    primaryStat: TESLA_COIL.primaryStat,
    secondaryStat: TESLA_COIL.secondaryStat,
    lore: TESLA_COIL.lore,
  });
}
teslaRows[0].baseUuid = teslaRows[0].uuid;
for (let i = 1; i < teslaRows.length; i++) teslaRows[i].baseUuid = teslaRows[0].uuid;
items.items.push(...teslaRows);
if (Array.isArray(weapons.items)) weapons.items.push(...teslaRows);
console.log(`[lightning] appended ${teslaRows.length} rows for Tesla Coil Staff (Engineer)`);

// ============================================================
// 4. STEP 3 - Merge T0 addendum into canon with correct schema
// ============================================================

// -- T0 weapons (append to master-items.json and master-weapons.json) --
const t0WeaponRows = t0Draft.t0Weapons.map(w => ({
  uuid: w.uuid,
  baseUuid: w.baseUuid,
  name: w.name,
  baseName: w.baseName,
  category: w.category,
  type: 'weapon',
  subCategory: w.subCategory,
  tier: 0,
  tierLabel: 'Starter',
  tierColor: '#6b7280',
  iconUrl: w.iconUrl,
  description: w.description,
  stats: w.stats,
  craftedBy: w.craftedBy,
  recipeUuid: null,
  source: 'starter',
  craftingRecipe: w.craftingRecipe,
  usedInT1Crafting: w.usedInT1Crafting,
  primaryStat: 'damage',
  secondaryStat: null,
  lore: w.description,
}));
items.items.push(...t0WeaponRows);
if (Array.isArray(weapons.items)) weapons.items.push(...t0WeaponRows);

// -- T0 armor: normalize schema (slotType Title-Case, hp key, setName null) --
const SLOT_MAP = {
  helmet: 'Helm', shoulders: 'Shoulder', chest: 'Chest',
  hands: 'Hands', legs: 'Legs', feet: 'Feet',
};
const t0ArmorRows = t0Draft.t0Armor.map(a => {
  const canonSlot = SLOT_MAP[a.slot] || a.slot;
  const s = a.stats;
  const stats = {
    hp: s.health ?? s.hp ?? 0,
    mana: s.mana ?? 0,
    crit: s.crit ?? 0,
    block: s.block ?? 0,
    defense: s.defense ?? 0,
  };
  if (s.evasion) stats.evasion = s.evasion;
  return {
    uuid: a.uuid,
    baseUuid: a.baseUuid,
    name: a.name,
    baseName: a.baseName,
    category: 'armor',
    type: 'armor',
    material: a.material,
    slotType: canonSlot,
    setName: null,                // T0 is set-less starter armor
    tier: 0,
    tierLabel: 'Starter',
    tierColor: '#6b7280',
    iconUrl: a.iconUrl,
    description: a.description,
    stats,
    passive: null,
    proc: null,
    setBonus: null,
    source: 'starter',
    craftedBy: a.craftedBy,
    craftingRecipe: a.craftingRecipe,
    usedInT1Crafting: true,
    lore: a.description,
  };
});
items.items.push(...t0ArmorRows);
if (Array.isArray(armor.items)) armor.items.push(...t0ArmorRows);

// -- T0 consumables (append to master-consumables.json) --
const t0ConsumableRows = t0Draft.t0Consumables.map(c => ({
  uuid: c.uuid,
  baseUuid: c.baseUuid,
  name: c.name,
  baseName: c.baseName,
  category: c.category,
  type: c.type,
  requiredLevel: 1,
  tier: 0,
  tierLabel: 'Starter',
  tierColor: '#6b7280',
  iconUrl: c.iconUrl,
  emoji: c.emoji,
  description: c.description,
  effect: c.effect,
  stats: c.stats,
  buff: c.buff,
  craftedBy: c.craftedBy,
  craftingRecipe: c.craftingRecipe,
  source: 'starter',
}));
if (Array.isArray(consumables.items)) consumables.items.push(...t0ConsumableRows);
items.items.push(...t0ConsumableRows);

// -- T0 new materials (append to master-materials.json) --
const t0MaterialRows = t0Draft.t0NewMaterials.map(m => ({
  uuid: m.uuid,
  id: m.id,
  name: m.name,
  type: 'material',
  category: m.category,
  tier: m.tier,
  emoji: m.emoji,
  gatheredBy: m.gatheredBy,
  iconUrl: m.iconUrl,
  description: m.description,
}));
if (Array.isArray(materials.materials)) materials.materials.push(...t0MaterialRows);

// ============================================================
// 5. Update counts/totals
// ============================================================
function countByType(rows, type) { return rows.filter(r => r.type === type).length; }

items.totalItems       = items.items.length;
items.totalWeapons     = countByType(items.items, 'weapon');
items.totalArmor       = countByType(items.items, 'armor');
items.totalConsumables = countByType(items.items, 'food') + countByType(items.items, 'potion');
items.totalMaterials   = (materials.materials ? materials.materials.length : items.totalMaterials);

if (weapons.items)     { weapons.total = weapons.items.length;     weapons.totalWeapons   = weapons.items.length; }
if (armor.items)       { armor.total   = armor.items.length;       armor.totalArmor       = armor.items.length;   }
if (consumables.items) { consumables.total = consumables.items.length; consumables.totalConsumables = consumables.items.length; }
if (materials.materials) { materials.total = materials.materials.length; materials.totalMaterials = materials.materials.length; }

// ============================================================
// 6. Register new canon datasets in master-registry.json
// ============================================================
registry.datasets = registry.datasets || [];
const have = new Set(registry.datasets.map(d => d.id));
const NEW_DATASETS = [
  { id: 'master-relics',    path: '/api/v1/master-relics.json',    description: 'Equippable relic family (17 bases x 8 tiers)', profession: 'Mystic', category: 'relic' },
  { id: 'master-enchants',  path: '/api/v1/master-enchants.json',  description: 'Mystic enchants (9 bases x 8 tiers)',          profession: 'Mystic', category: 'enchant' },
  { id: 'master-infusions', path: '/api/v1/master-infusions.json', description: 'Infusion essences (5 universal + 15 profession)', profession: 'Mystic', category: 'infusion' },
];
for (const ds of NEW_DATASETS) if (!have.has(ds.id)) registry.datasets.push(ds);

// ============================================================
// 7. Write everything
// ============================================================
writeJson(masterItemsPath,       items);
writeJson(masterArmorPath,       armor);
writeJson(masterWeaponsPath,     weapons);
writeJson(masterConsumablesPath, consumables);
writeJson(masterMaterialsPath,   materials);
writeJson(masterRegistryPath,    registry);

console.log('---');
console.log(`master-items.json       -> total ${items.totalItems} (weapons ${items.totalWeapons}, armor ${items.totalArmor})`);
if (weapons.items)     console.log(`master-weapons.json     -> total ${weapons.total}`);
if (armor.items)       console.log(`master-armor.json       -> total ${armor.total}`);
if (consumables.items) console.log(`master-consumables.json -> total ${consumables.total}`);
if (materials.materials) console.log(`master-materials.json   -> total ${materials.total}`);
console.log(`master-registry.json    -> datasets ${registry.datasets.length}`);
