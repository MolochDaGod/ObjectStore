/**
 * icon-resolver.js — Single Source of Truth for Item Icon URLs
 *
 * Extracted from ItemBrowser.html so every page resolves the same icon
 * for the same item name. ItemBrowser.html is the canonical reference.
 *
 * Usage:
 *   import { getIconUrl, getFallbackUrl } from './utils/icon-resolver.js';
 *   const url = getIconUrl(item);         // primary icon (named file)
 *   const fb  = getFallbackUrl(item);     // pack-based fallback
 *
 * item shape expected:
 *   { id, name, type, tier?, category?, slotType?, iconBase?, iconOffset?, iconMax?, noPad? }
 */

// ── Armor slot → icon prefix ──
const ARMOR_SLOT_MAP = {
  'Helm': 'Helm', 'Shoulder': 'Shoulder', 'Chest': 'Chest',
  'Hands': 'Gloves', 'Feet': 'Boots', 'Ring': 'Ring',
  'Necklace': 'necklace', 'Relic': 'Back', 'Belt': 'Belt'
};

// Weapon-type icon counts in wcs/weapons/
const WCS_COUNTS = {
  'Sword': 61, 'Axe': 50, 'Dagger': 60, 'Hammer': 54,
  'Spear': 40, 'Bow': 40, 'Crossbow': 10, 'Bolt': 10,
  'staff': 54, 'Staff': 54, 'Book': 25, 'Scythe': 7,
  'shield': 51, 'Arrow': 40
};

// Tool name → weapon icon type
const TOOL_ICON_MAP = {
  'mining-pick': 'Hammer', 'lumber-axe': 'Axe', 'skinning-knife': 'Dagger',
  'harvesting-sickle': 'Scythe', 'fishing-rod': 'Spear', 'engineers-toolkit': 'Hammer'
};

// Consumable keyword → food icon
const FOOD_KEYWORDS = [
  ['steak', 'food_steak_cooked'], ['roast', 'food_steak_cooked'], ['curry', 'food_steak_cooked'],
  ['feast', 'food_steak_cooked'], ['platter', 'food_steak_cooked'], ['lamb', 'food_steak_cooked'],
  ['ribs', 'food_steak_rare'], ['venison', 'food_steak_rare'], ['skewer', 'food_steak_rare'],
  ['cutlet', 'food_steak_rare'], ['bacon', 'food_steak_rare'], ['rabbit', 'food_steak_rare'],
  ['sausage', 'food_ham'], ['ham', 'food_ham'], ['burger', 'food_ham'], ['chicken', 'food_ham'],
  ['meat', 'food_meat_raw'], ['boar', 'food_meat_raw'],
  ['fish', 'food_fish_red'], ['lobster', 'food_crab'], ['crab', 'food_crab'], ['shrimp', 'food_crab'],
  ['squid', 'food_squid'],
  ['bread', 'food_bread'], ['pie', 'food_bread'], ['cake', 'food_bread'], ['wrap', 'food_bread'],
  ['croissant', 'food_croissant'],
  ['cheese', 'food_cheese'], ['apple', 'food_apple'], ['banana', 'food_banana'],
  ['mango', 'food_mango'], ['grapes', 'food_grapes'], ['mushroom', 'food_mushroom'],
  ['carrot', 'food_carrot'], ['wheat', 'food_wheat'],
  ['beer', 'food_beer'], ['ale', 'food_beer'], ['wine', 'food_beer'],
  ['salad', 'food_grapes'], ['greens', 'food_grapes']
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
  'gems': 'fine-gem', 'essence': 'greater-essence'
};

// ── Helpers ──
export function hashStr(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pad2(n) { return String(n).padStart(2, '0'); }

// ── Primary icon URL (specific named icon) ──
export function getIconUrl(item, base) {
  base = base || '.';
  var baseId = String(item.id).replace(/-t\d+$/, '');
  if (item.type === 'weapon') return base + '/icons/weapons/' + baseId + '.png';
  if (item.type === 'material') return base + '/icons/materials/' + baseId + '.png';
  if (item.type === 'armor') return getArmorIcon(item, baseId, base);
  if (item.type === 'consumable') return getConsumableIcon(item, baseId, base);
  return base + '/icons/pack/resources/Loot_01.png';
}

// ── Fallback icon URL (pack-based, always exists) ──
export function getFallbackUrl(item, base) {
  base = base || '.';
  var baseId = String(item.id).replace(/-t\d+$/, '');
  if (item.type === 'weapon') return getWeaponPackIcon(item, baseId, base);
  if (item.type === 'material') return getMaterialFallback(item, baseId, base);
  if (item.type === 'armor') return base + '/icons/pack/armor/Chest_01.png';
  if (item.type === 'consumable') return base + '/icons/consumables/alchemy_1.png';
  return base + '/icons/pack/resources/Loot_01.png';
}

function getArmorIcon(item, baseId, base) {
  var slot = item.slotType || 'Chest';
  var prefix = ARMOR_SLOT_MAP[slot] || 'Chest';
  var num = (hashStr(baseId) % 20) + 1;
  return base + '/icons/pack/armor/' + prefix + '_' + pad2(num) + '.png';
}

function getWeaponPackIcon(item, baseId, base) {
  var iconBase = TOOL_ICON_MAP[baseId] || item.iconBase || 'Sword';
  var offset = item.iconOffset || 0;
  var max = item.iconMax || WCS_COUNTS[iconBase] || 40;
  var sliceSize = Math.min(max, 10);
  var num = (hashStr(baseId) % sliceSize) + offset + 1;
  var numStr = item.noPad ? String(num) : pad2(num);
  return base + '/icons/wcs/weapons/' + iconBase + '_' + numStr + '.png';
}

function getMaterialFallback(item, baseId, base) {
  var cat = (item.category || '').toLowerCase();
  var fallbackName = MAT_FALLBACK[cat];
  if (fallbackName) return base + '/icons/materials/' + fallbackName + '.png';
  var lootNum = (hashStr(baseId) % 120) + 1;
  return base + '/icons/pack/resources/Loot_' + pad2(lootNum) + '.png';
}

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
