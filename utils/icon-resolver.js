/**
 * icon-resolver.js — Single Source of Truth for Item Icon URLs
 *
 * Aligned with GRUDGE_Item_Database.html icon resolution (the canonical reference).
 * Uses the same directories: pack/weapons/, armor_full/, items/artifacts/,
 * items/alchemy/, abilities/, consumables/, food/, materials/.
 *
 * Usage:
 *   import { getIconUrl, getFallbackUrl } from './utils/icon-resolver.js';
 *   const url = getIconUrl(item);         // primary icon
 *   const fb  = getFallbackUrl(item);     // guaranteed-exists fallback
 *
 * item shape expected:
 *   { id, name, type, tier?, category?, slotType?, material?,
 *     weaponType?, subType?, baseName?, iconUrl?, iconBase? }
 */

// ── Armor slot → icon prefix + count in icons/armor_full/ ──
const ARMOR_SLOT_ICON = {
  'Helm':     { prefix: 'Helm',     count: 72 },
  'Shoulder': { prefix: 'Shoulder', count: 71 },
  'Chest':    { prefix: 'Chest',    count: 83 },
  'Hands':    { prefix: 'Gloves',   count: 28 },
  'Feet':     { prefix: 'Boots',    count: 56 },
  'Ring':     { prefix: 'Ring',     count: 57 },
  'Necklace': { prefix: 'necklace', count: 36 },
  'Legs':     { prefix: 'Pants',    count: 42 },
  'Offhand':  { prefix: 'Bracer',   count: 7  },
  'Relic':    { prefix: 'Ring',     count: 57 },
  'Belt':     { prefix: 'Bracer',   count: 7  },
};

// Weapon type → { prefix, count } in icons/pack/weapons/
const WEAPON_TYPE_ICON = {
  'swords':      { prefix: 'Sword',    count: 61 },
  'greatswords':  { prefix: 'Sword',    count: 61 },
  'axes1h':       { prefix: 'Axe',      count: 50 },
  'greataxes':    { prefix: 'Axe',      count: 50 },
  'daggers':      { prefix: 'Dagger',   count: 60 },
  'hammers1h':    { prefix: 'Hammer',   count: 50 },
  'hammers2h':    { prefix: 'Hammer',   count: 50 },
  'wands':        { prefix: 'staff',    count: 50, nopad: true },
  'spears':       { prefix: 'Spear',    count: 40 },
  'bows':         { prefix: 'Bow',      count: 40 },
  'crossbows':    { prefix: 'Crossbow', count: 10 },
  'guns':         { prefix: 'Crossbow', count: 10 },
  'scythes':      { prefix: 'Scythe',   count: 7  },
  'shields':      { prefix: 'shield',   count: 51 },
  'tools':        { prefix: 'Hammer',   count: 50 },
  'offhand-tome': { prefix: 'Book',     count: 25, nopad: true },
  // Singular fallback names (from category field)
  'sword':    { prefix: 'Sword',    count: 61 },
  'axe':      { prefix: 'Axe',      count: 50 },
  'dagger':   { prefix: 'Dagger',   count: 60 },
  'hammer':   { prefix: 'Hammer',   count: 50 },
  'spear':    { prefix: 'Spear',    count: 40 },
  'bow':      { prefix: 'Bow',      count: 40 },
  'crossbow': { prefix: 'Crossbow', count: 10 },
  'gun':      { prefix: 'Crossbow', count: 10 },
  'scythe':   { prefix: 'Scythe',   count: 7  },
  'shield':   { prefix: 'shield',   count: 51 },
  'staff':    { prefix: 'staff',    count: 50, nopad: true },
  'wand':     { prefix: 'staff',    count: 50, nopad: true },
  'tome':     { prefix: 'Book',     count: 25, nopad: true },
};

// Tool name → weapon icon type
const TOOL_ICON_MAP = {
  'mining-pick': 'Hammer', 'lumber-axe': 'Axe', 'skinning-knife': 'Dagger',
  'harvesting-sickle': 'Scythe', 'fishing-rod': 'Spear', 'engineers-toolkit': 'Hammer'
};

// Enchant stat → ability icon filename
const ENCH_ICON = {
  'damage':       'ability_arcane_bolt',
  'defense':      'ability_bark_skin',
  'speed':        'ability_arrow_storm',
  'crit':         'ability_arcane_focus',
  'critChance':   'ability_arcane_focus',
  'critDamage':   'ability_arcane_focus',
  'fire':         'ability_arcane_cataclysm',
  'lightning':    'ability_arcane_cataclysm',
  'frost':        'ability_avatar_form',
  'health':       'ability_avatar',
  'mana':         'ability_arcane_focus',
  'elementResist':'ability_bark_skin',
};

// Consumable keyword → food icon
const FOOD_KEYWORDS = [
  ['steak', 'food_steak_cooked'], ['seared', 'food_steak_cooked'],
  ['roast', 'food_steak_cooked'], ['curry', 'food_steak_cooked'],
  ['feast', 'food_steak_cooked'], ['platter', 'food_steak_cooked'], ['lamb', 'food_steak_cooked'],
  ['ribs', 'food_steak_rare'], ['venison', 'food_steak_rare'], ['skewer', 'food_steak_rare'],
  ['cutlet', 'food_steak_rare'], ['bacon', 'food_steak_rare'], ['rabbit', 'food_steak_rare'],
  ['sausage', 'food_ham'], ['ham', 'food_ham'], ['burger', 'food_ham'], ['chicken', 'food_ham'],
  ['wings', 'food_crab'], ['bbq', 'food_steak_rare'],
  ['meat', 'food_meat_raw'], ['boar', 'food_meat_raw'], ['charred', 'food_steak_raw'],
  ['fish', 'food_fish_red'], ['sashimi', 'food_fish_red'],
  ['lobster', 'food_crab'], ['crab', 'food_crab'], ['shrimp', 'food_crab'],
  ['squid', 'food_squid'],
  ['bread', 'food_bread'], ['pie', 'food_bread'], ['cake', 'food_bread'],
  ['croissant', 'food_croissant'],
  ['cheese', 'food_cheese'], ['apple', 'food_apple'], ['banana', 'food_banana'],
  ['mango', 'food_mango'], ['grapes', 'food_grapes'], ['mushroom', 'food_mushroom'],
  ['carrot', 'food_carrot'], ['wheat', 'food_wheat'],
  ['beer', 'food_beer'], ['ale', 'food_beer'], ['wine', 'food_beer'],
  ['salad', 'food_grapes'], ['greens', 'food_grapes'],
  ['stew', 'food_mushroom'], ['soup', 'food_mushroom'],
  ['herb', 'herb_herb_leaf'], ['tea', 'herb_herb_leaf'],
  ['wrap', 'food_carrot'], ['roll', 'food_carrot'],
];

const HERB_ICONS = [
  'herb_herb_bouquet', 'herb_herb_branch', 'herb_herb_bundle_berries',
  'herb_herb_bundle', 'herb_herb_crystalplant', 'herb_herb_grass',
  'herb_herb_lavender', 'herb_herb_leaf', 'herb_herb_leaves', 'herb_herb_seaweed'
];

const ALL_FOODS = [
  'food_steak_cooked', 'food_steak_rare', 'food_ham', 'food_bread',
  'food_cheese', 'food_fish_red', 'food_mushroom', 'food_meat_raw',
  'food_apple', 'food_banana', 'food_crab', 'food_grapes'
];

// Material category → fallback icon
const MAT_FALLBACK = {
  'cloth': 'wool-thread', 'leather': 'hardened-leather',
  'ore': 'iron-ore', 'ingots': 'iron-ingot', 'wood': 'oak-log',
  'gems': 'fine-gem', 'essence': 'greater-essence',
  'gem': 'fine-gem', 'metal': 'iron-ingot',
};

// Shoulder_63 is missing from the armor asset pack
const SKIP_ICONS = { 'Shoulder': [63] };

const MAT_OFFSET = { cloth: 0, leather: 0.33, metal: 0.66, gem: 0.5 };

// Skill keyword → real ability icon filename (without ability_ prefix & .png)
const SKILL_ABILITY_MAP = [
  ['fireball', 'fireball'], ['fire nova', 'fire_mastery'], ['flame', 'flame_brand'],
  ['inferno', 'fire_mastery'], ['meteor', 'meteor_strike'], ['lava', 'flame_brand'],
  ['ignite', 'ignite_weapon'],
  ['freeze', 'ice_mastery'], ['frost', 'ice_mastery'], ['ice bolt', 'ice_mastery'],
  ['hail', 'tempest'], ['frozen', 'ice_mastery'], ['blizzard', 'ice_mastery'],
  ['lightning', 'chain_lightning'], ['chain lightning', 'chain_lightning'],
  ['shock', 'chain_lightning'], ['static', 'storm_touch'], ['thunder', 'tempest'],
  ['heal', 'heal'], ['resurrect', 'blessing'], ['smite', 'holy_nova'],
  ['holy', 'holy_nova'], ['divine', 'divine_shield'], ['blessing', 'blessing'],
  ['purify', 'purify'],
  ['nature', 'wild_growth'], ['entangle', 'entangle_roots'], ['stone', 'shatter'],
  ['tornado', 'tempest'], ['rejuv', 'rejuvenate'], ['wild growth', 'wild_growth'],
  ['bark', 'bark_skin'],
  ['arcane', 'arcane_bolt'], ['blink', 'wind_walk'], ['portal', 'spell_echo'],
  ['magic missile', 'arcane_bolt'], ['mana', 'mana_flow'], ['spell', 'spellweave'],
  ['summon', 'bewilderment'],
  ['shadow', 'evasion'], ['stealth', 'swift_blade'], ['assassin', 'death_blossom'],
  ['backstab', 'lacerate'], ['poison', 'venom_edge'], ['venom', 'venom_arrow'],
  ['shield bash', 'shield_specialist'], ['whirlwind', 'whirlwind'],
  ['war cry', 'war_cry'], ['warcry', 'war_cry'], ['cleave', 'blade_storm'],
  ['execute', 'execute'], ['charge', 'bloodlust'], ['berserker', 'bloodlust'],
  ['taunt', 'taunt'], ['bash', 'concussive_blow'], ['sunder', 'sunder_armor'],
  ['arrow', 'arrow_storm'], ['multishot', 'multishot'], ['multi shot', 'multishot'],
  ['sniper', 'sniper_shot'], ['headshot', 'headshot'], ['volley', 'multishot'],
  ['piercing', 'piercing_shot'], ['rain of arrows', 'arrow_storm'],
  ['bear form', 'bear_form'], ['raptor', 'evasion'], ['primal', 'primal_roar'],
  ['feral', 'feral_instinct'], ['howl', 'primal_roar'], ['alpha', 'alpha_predator'],
  ['sprint', 'wind_walk'], ['speed', 'wind_walk'], ['evasion', 'evasion'],
  ['trap', 'bear_trap'],
];

// ── Helpers ──
export function hashStr(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pad2(n) { return String(n).padStart(2, '0'); }

// ── Primary icon URL ──
export function getIconUrl(item, base) {
  base = base || '.';
  var baseId = String(item.id).replace(/-t\d+$/, '');
  if (item.type === 'weapon')     return getWeaponIcon(item, baseId, base);
  if (item.type === 'armor')      return getArmorIcon(item, baseId, base);
  if (item.type === 'material')   return getMaterialIcon(item, baseId, base);
  if (item.type === 'consumable') return getConsumableIcon(item, baseId, base);
  if (item.type === 'enchant')    return getEnchantIcon(item, baseId, base);
  if (item.type === 'infusion')   return getInfusionIcon(item, baseId, base);
  if (item.type === 'relic')      return getRelicIcon(item, baseId, base);
  if (item.type === 'artifact')   return getArtifactIcon(item, baseId, base);
  if (item.type === 'skill' || (item.category || '').toLowerCase() === 'skill') return getSkillIcon(item, baseId, base);
  return base + '/icons/pack/resources/Loot_01.png';
}

// ── Fallback icon URL (guaranteed to exist) ──
export function getFallbackUrl(item, base) {
  base = base || '.';
  var baseId = String(item.id).replace(/-t\d+$/, '');
  if (item.type === 'weapon')     return getWeaponPackIcon(item, baseId, base);
  if (item.type === 'armor')      return base + '/icons/armor_full/Chest_01.png';
  if (item.type === 'material')   return getMaterialFallback(item, baseId, base);
  if (item.type === 'consumable') return base + '/icons/consumables/alchemy_1.png';
  if (item.type === 'enchant')    return base + '/icons/abilities/ability_arcane_bolt.png';
  if (item.type === 'infusion')   return base + '/icons/items/alchemy/alchemy_01_framed.png';
  if (item.type === 'relic')      return base + '/icons/items/artifacts/artifacts_01_framed.png';
  if (item.type === 'artifact')   return base + '/icons/loot/loot_1.png';
  if (item.type === 'skill' || (item.category || '').toLowerCase() === 'skill') return base + '/icons/abilities/ability_quick_strike.png';
  return base + '/icons/pack/resources/Loot_01.png';
}

// ── Weapon: try named icon first, then pack/weapons/ ──
function getWeaponIcon(item, baseId, base) {
  // If the item already has a working iconUrl path, use it
  var raw = item.iconUrl || '';
  if (raw && raw.includes('/icons/weapons/') && !raw.match(/\/(staff|Sword|Axe|Dagger|Hammer|Spear|Bow|Crossbow|Book|Scythe|shield)_/i)) {
    // Convert absolute GitHub Pages / CDN URLs to relative for same-origin loading
    var relMatch = raw.match(/\/icons\/weapons\/.+$/);
    if (relMatch) return base + relMatch[0];
    return raw;
  }
  // Staves special case: lowercase staff_1..staff_50, uppercase Staff_51..54
  var wt = (item.weaponType || item.subType || item.category || '').toLowerCase();
  if (wt.includes('stav') || wt.includes('staff')) {
    var sn = hashStr(item.baseName || item.name || '') % 50 + 1;
    var sp = sn >= 51 ? 'Staff' : 'staff';
    return base + '/icons/pack/weapons/' + sp + '_' + sn + '.png';
  }
  // Map weaponType → pack/weapons/ generic icons
  var slot = WEAPON_TYPE_ICON[wt];
  if (slot) {
    var n = hashStr(item.baseName || item.name || '') % slot.count + 1;
    var num = slot.nopad ? String(n) : pad2(n);
    return base + '/icons/pack/weapons/' + slot.prefix + '_' + num + '.png';
  }
  // Fallback: try named file, then generic sword
  return raw ? (raw.startsWith('http') ? raw : base + raw) : base + '/icons/pack/weapons/Sword_01.png';
}

// ── Weapon fallback (pack/weapons/) ──
function getWeaponPackIcon(item, baseId, base) {
  var iconBase = TOOL_ICON_MAP[baseId] || item.iconBase || 'Sword';
  var slot = WEAPON_TYPE_ICON[iconBase.toLowerCase()] || { prefix: 'Sword', count: 61 };
  var n = (hashStr(baseId) % Math.min(slot.count, 10)) + 1;
  var numStr = slot.nopad ? String(n) : pad2(n);
  return base + '/icons/pack/weapons/' + slot.prefix + '_' + numStr + '.png';
}

// ── Armor: use armor_full/ with slot-based prefix (matches GRUDGE_Item_Database) ──
function getArmorIcon(item, baseId, base) {
  var slotType = item.slotType || 'Chest';
  var slot = ARMOR_SLOT_ICON[slotType];
  if (!slot) return base + '/icons/armor_full/Chest_01.png';
  var matShift = MAT_OFFSET[(item.material || '').toLowerCase()] || 0;
  var baseNum = Math.floor(matShift * slot.count);
  var n = (baseNum + hashStr(item.baseName || item.name || baseId) % Math.ceil(slot.count / 3)) % slot.count + 1;
  var skip = SKIP_ICONS[slotType];
  if (skip && skip.includes(n)) n++;
  return base + '/icons/armor_full/' + slot.prefix + '_' + pad2(n) + '.png';
}

// ── Enchant: stat-based ability icon ──
function getEnchantIcon(item, baseId, base) {
  // stat lives in item.effect.stat in the master JSON, fall back to top-level fields
  var effectStat = (item.effect && item.effect.stat) ? item.effect.stat : '';
  var stat = (effectStat || item.stat || item.primaryStat || item.category || '').toLowerCase();
  for (var key in ENCH_ICON) {
    if (stat.includes(key.toLowerCase())) {
      return base + '/icons/abilities/' + ENCH_ICON[key] + '.png';
    }
  }
  // Also try matching the enchant name for element keywords
  var name = (item.name || '').toLowerCase();
  if (name.includes('fire') || name.includes('flame')) return base + '/icons/abilities/ability_arcane_cataclysm.png';
  if (name.includes('frost') || name.includes('ice')) return base + '/icons/abilities/ability_avatar_form.png';
  if (name.includes('lightning') || name.includes('storm')) return base + '/icons/abilities/ability_arcane_cataclysm.png';
  if (name.includes('strength') || name.includes('power')) return base + '/icons/abilities/ability_arcane_bolt.png';
  if (name.includes('agility') || name.includes('speed') || name.includes('swift')) return base + '/icons/abilities/ability_arrow_storm.png';
  if (name.includes('fortitude') || name.includes('defense') || name.includes('guard')) return base + '/icons/abilities/ability_bark_skin.png';
  if (name.includes('wisdom') || name.includes('intel') || name.includes('mana')) return base + '/icons/abilities/ability_arcane_focus.png';
  if (name.includes('vital') || name.includes('health') || name.includes('life')) return base + '/icons/abilities/ability_avatar.png';
  if (name.includes('luck') || name.includes('crit') || name.includes('precision')) return base + '/icons/abilities/ability_arcane_focus.png';
  return base + '/icons/abilities/ability_arcane_bolt.png';
}

// ── Infusion: tier-indexed alchemy framed icons ──
function getInfusionIcon(item, baseId, base) {
  var tier = item.tier || 1;
  var idx = ((tier - 1) % 12) + 1;
  return base + '/icons/items/alchemy/alchemy_' + pad2(idx) + '_framed.png';
}

// ── Relic: tier-indexed artifacts framed icons ──
function getRelicIcon(item, baseId, base) {
  var tier = item.tier || 1;
  var idx = ((tier - 1) % 12) + 1;
  return base + '/icons/items/artifacts/artifacts_' + pad2(idx) + '_framed.png';
}

// ── Artifact: loot icons ──
function getArtifactIcon(item, baseId, base) {
  var n = (hashStr(baseId) % 20) + 1;
  return base + '/icons/loot/loot_' + n + '.png';
}

// ── Material primary icon (kebab-case name, not UUID) ──
function getMaterialIcon(item, baseId, base) {
  // UUIDs (MATL-...) don't map to icon filenames — derive from item name
  var kebabName = (item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return base + '/icons/materials/' + kebabName + '.png';
}

// ── Material fallback ──
function getMaterialFallback(item, baseId, base) {
  var cat = (item.category || '').toLowerCase();
  var fallbackName = MAT_FALLBACK[cat];
  if (fallbackName) return base + '/icons/materials/' + fallbackName + '.png';
  var lootNum = (hashStr(baseId) % 120) + 1;
  return base + '/icons/pack/resources/Loot_' + pad2(lootNum) + '.png';
}

// ── Skill icon ──
function getSkillIcon(item, baseId, base) {
  if (item.icon && item.icon.includes('/abilities/')) {
    var match = item.icon.match(/\/icons\/abilities\/.+$/);
    if (match) return base + match[0];
  }
  var name = (item.name || '').toLowerCase();
  for (var i = 0; i < SKILL_ABILITY_MAP.length; i++) {
    if (name.includes(SKILL_ABILITY_MAP[i][0])) {
      return base + '/icons/abilities/ability_' + SKILL_ABILITY_MAP[i][1] + '.png';
    }
  }
  var abilityFallbacks = ['quick_strike', 'double_strike', 'blade_storm', 'arcane_bolt', 'fireball', 'heal', 'arrow_storm', 'whirlwind'];
  var idx = hashStr(baseId) % abilityFallbacks.length;
  return base + '/icons/abilities/ability_' + abilityFallbacks[idx] + '.png';
}

// ── Consumable icon (food + potions + herbs) ──
function getConsumableIcon(item, baseId, base) {
  var name = (item.name || '').toLowerCase();
  var cat = (item.category || '').toLowerCase();

  // Potions & alchemy
  if (name.includes('potion') || name.includes('elixir') || name.includes('flask') ||
      name.includes('tincture') || name.includes('brew') || name.includes('vial') ||
      cat.includes('potion') || cat.includes('mystic')) {
    if (name.includes('health')) return base + '/icons/consumables/health_potion.png';
    if (name.includes('mana')) return base + '/icons/consumables/mana_potion.png';
    var pNum = (hashStr(baseId) % 48) + 1;
    return base + '/icons/consumables/potion_' + pNum + '.png';
  }

  // Engineer consumables
  if (cat.includes('engineer')) {
    var aNum = (hashStr(baseId) % 48) + 1;
    return base + '/icons/consumables/alchemy_' + aNum + '.png';
  }

  // Herbs / salves
  if (name.includes('herb') || name.includes('salve') || name.includes('balm') ||
      name.includes('tonic') || name.includes('remedy') || name.includes('tea') ||
      cat.includes('green')) {
    var hIdx = hashStr(baseId) % HERB_ICONS.length;
    return base + '/icons/consumables/' + HERB_ICONS[hIdx] + '.png';
  }

  // Food — match by keyword
  for (var i = 0; i < FOOD_KEYWORDS.length; i++) {
    if (name.includes(FOOD_KEYWORDS[i][0])) {
      return base + '/icons/consumables/' + FOOD_KEYWORDS[i][1] + '.png';
    }
  }

  // Default: deterministic food icon
  var fIdx = hashStr(baseId) % ALL_FOODS.length;
  return base + '/icons/consumables/' + ALL_FOODS[fIdx] + '.png';
}
