#!/usr/bin/env node
/**
 * GRUDGE Item Database — Icon Reassignment Script
 * 
 * Parses all items from GRUDGE_Item_Database.html and assigns the correct
 * icon from the ObjectStore icon library based on item name + category keywords.
 * 
 * Icon sources (all under https://molochdagod.github.io/ObjectStore/icons/):
 *   pack/weapons/   — Sword, Axe, Dagger, Hammer, Bow, Crossbow, Book, Spear, staff, shield, Scythe
 *   pack/armor/      — Helm, Shoulder, Chest, Belt, Boots, Pants, Gloves, Bracer, Back, necklace, Ring
 *   pack/potions/    — Potions
 *   pack/resources/  — Loot/Res/Quest items
 *   pack/misc/       — Buildings, mounts, effects
 *   496_rpg_icons/   — RPG-style weapons (W_), skills (S_), items (I_), potions (P_), armor (A_), etc.
 *   consumables/     — Food, potions, herbs
 *   food/            — Prepared food icons
 *   materials/       — Crafting materials (ores, ingots, logs, thread, leather, gems, essences)
 *   abilities/       — Named ability icons
 *   skills/          — Skill icons
 *   skill_nobg/      — Skill icons (no background)
 *   loot/            — Loot bag/chest icons
 */

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, 'GRUDGE_Item_Database.html');
const ICON_BASE = 'https://molochdagod.github.io/ObjectStore/icons';

// ─── Icon inventories (gathered from the filesystem) ────────────────────────

// Build file lists from disk
function listIcons(dir) {
  const full = path.join(__dirname, 'icons', dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith('.png'));
}

const PACK_WEAPONS = listIcons('pack/weapons');
const PACK_ARMOR = listIcons('pack/armor');
const PACK_POTIONS = listIcons('pack/potions');
const PACK_RESOURCES = listIcons('pack/resources');
const PACK_MISC = listIcons('pack/misc');
const RPG_ICONS = listIcons('496_rpg_icons');
const CONSUMABLE_ICONS = listIcons('consumables');
const FOOD_ICONS = listIcons('food');
const MATERIAL_ICONS = listIcons('materials');
const ABILITY_ICONS = listIcons('abilities');
const SKILL_ICONS = listIcons('skills');
const LOOT_ICONS = listIcons('loot');

// Helper: pick icons by prefix from a set
function byPrefix(list, prefix) {
  return list.filter(f => f.startsWith(prefix)).sort();
}

// Helper: deterministic pick based on name hash (consistent per item)
function hashPick(arr, name) {
  if (!arr.length) return null;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return arr[Math.abs(h) % arr.length];
}

// Helper: tier-aware pick — use tier index to offset into the array
function tierPick(arr, name, tier) {
  if (!arr.length) return null;
  const t = parseInt(tier) || 0;
  if (t > 0 && t <= arr.length) return arr[Math.min(t - 1, arr.length - 1)];
  return hashPick(arr, name);
}

// Pre-sorted icon pools
const POOL = {
  // pack/weapons
  sword: byPrefix(PACK_WEAPONS, 'Sword_'),
  axe: byPrefix(PACK_WEAPONS, 'Axe_'),
  dagger: byPrefix(PACK_WEAPONS, 'Dagger_'),
  hammer: byPrefix(PACK_WEAPONS, 'Hammer_'),
  bow: byPrefix(PACK_WEAPONS, 'Bow_'),
  crossbow: byPrefix(PACK_WEAPONS, 'Crossbow_'),
  book: byPrefix(PACK_WEAPONS, 'Book_'),
  spear: byPrefix(PACK_WEAPONS, 'Spear_'),
  staff: byPrefix(PACK_WEAPONS, 'staff_'),
  shield: byPrefix(PACK_WEAPONS, 'shield_'),
  scythe: byPrefix(PACK_WEAPONS, 'Scythe_'),
  arrow: byPrefix(PACK_WEAPONS, 'Arrow_'),
  bolt: byPrefix(PACK_WEAPONS, 'Bolt_'),
  // pack/armor
  helm: byPrefix(PACK_ARMOR, 'Helm_'),
  shoulder: byPrefix(PACK_ARMOR, 'Shoulder_'),
  chest: byPrefix(PACK_ARMOR, 'Chest_'),
  belt: byPrefix(PACK_ARMOR, 'Belt_'),
  boots: byPrefix(PACK_ARMOR, 'Boots_'),
  pants: byPrefix(PACK_ARMOR, 'Pants_'),
  gloves: byPrefix(PACK_ARMOR, 'Gloves_'),
  bracer: byPrefix(PACK_ARMOR, 'Bracer_'),
  back: byPrefix(PACK_ARMOR, 'Back_'),
  necklace: byPrefix(PACK_ARMOR, 'necklace_'),
  ring: byPrefix(PACK_ARMOR, 'Ring_'),
  // 496 rpg
  rpg_sword: byPrefix(RPG_ICONS, 'W_Sword'),
  rpg_axe: byPrefix(RPG_ICONS, 'W_Axe'),
  rpg_dagger: byPrefix(RPG_ICONS, 'W_Dagger'),
  rpg_bow: byPrefix(RPG_ICONS, 'W_Bow'),
  rpg_mace: byPrefix(RPG_ICONS, 'W_Mace'),
  rpg_spear: byPrefix(RPG_ICONS, 'W_Spear'),
  rpg_staff: byPrefix(RPG_ICONS, 'W_Staff'),
  rpg_book: byPrefix(RPG_ICONS, 'W_Book'),
  rpg_gun: byPrefix(RPG_ICONS, 'W_Gun'),
  rpg_fist: byPrefix(RPG_ICONS, 'W_Fist'),
  rpg_throw: byPrefix(RPG_ICONS, 'W_Throw'),
  // rpg skills
  sk_fire: byPrefix(RPG_ICONS, 'S_Fire'),
  sk_ice: byPrefix(RPG_ICONS, 'S_Ice'),
  sk_holy: byPrefix(RPG_ICONS, 'S_Holy'),
  sk_earth: byPrefix(RPG_ICONS, 'S_Earth'),
  sk_thunder: byPrefix(RPG_ICONS, 'S_Thunder'),
  sk_shadow: byPrefix(RPG_ICONS, 'S_Shadow'),
  sk_water: byPrefix(RPG_ICONS, 'S_Water'),
  sk_wind: byPrefix(RPG_ICONS, 'S_Wind'),
  sk_light: byPrefix(RPG_ICONS, 'S_Light'),
  sk_poison: byPrefix(RPG_ICONS, 'S_Poison'),
  sk_magic: byPrefix(RPG_ICONS, 'S_Magic'),
  sk_sword: byPrefix(RPG_ICONS, 'S_Sword'),
  sk_axe: byPrefix(RPG_ICONS, 'S_Axe'),
  sk_bow: byPrefix(RPG_ICONS, 'S_Bow'),
  sk_dagger: byPrefix(RPG_ICONS, 'S_Dagger'),
  sk_buff: byPrefix(RPG_ICONS, 'S_Buff'),
  sk_physic: byPrefix(RPG_ICONS, 'S_Physic'),
  // rpg items
  rpg_crystal: RPG_ICONS.filter(f => f.startsWith('I_Crystal')),
  rpg_gem: RPG_ICONS.filter(f => /^I_(Diamond|Ruby|Sapphire|Jade|Opal|Agate|Amethist)/.test(f)),
  rpg_potion_red: byPrefix(RPG_ICONS, 'P_Red'),
  rpg_potion_blue: byPrefix(RPG_ICONS, 'P_Blue'),
  rpg_potion_green: byPrefix(RPG_ICONS, 'P_Green'),
  rpg_potion_yellow: byPrefix(RPG_ICONS, 'P_Yellow'),
  rpg_potion_white: byPrefix(RPG_ICONS, 'P_White'),
  rpg_potion_orange: byPrefix(RPG_ICONS, 'P_Orange'),
  rpg_potion_pink: byPrefix(RPG_ICONS, 'P_Pink'),
  rpg_potion_med: byPrefix(RPG_ICONS, 'P_Medicine'),
  rpg_metal: RPG_ICONS.filter(f => f.startsWith('E_Metal')),
  rpg_wood: RPG_ICONS.filter(f => f.startsWith('E_Wood')),
  rpg_bone: RPG_ICONS.filter(f => f.startsWith('E_Bones')),
  rpg_gold: RPG_ICONS.filter(f => f.startsWith('E_Gold') || f.startsWith('I_GoldBar') || f.startsWith('I_GoldCoin')),
  rpg_food: RPG_ICONS.filter(f => f.startsWith('I_C_')),
  rpg_scroll: RPG_ICONS.filter(f => f.startsWith('I_Scroll')),
  rpg_key: RPG_ICONS.filter(f => f.startsWith('I_Key')),
  rpg_chest: RPG_ICONS.filter(f => f.startsWith('I_Chest')),
  rpg_ring: RPG_ICONS.filter(f => f.startsWith('Ac_Ring')),
  rpg_necklace: RPG_ICONS.filter(f => f.startsWith('Ac_Necklace')),
  rpg_medal: RPG_ICONS.filter(f => f.startsWith('Ac_Medal')),
  rpg_armor: RPG_ICONS.filter(f => f.startsWith('A_Arm')),
  rpg_clothing: RPG_ICONS.filter(f => f.startsWith('A_Clothing')),
  rpg_shoes: RPG_ICONS.filter(f => f.startsWith('A_Shoes')),
  rpg_helm: RPG_ICONS.filter(f => f.startsWith('C_')),
};

// ─── Extract tier from name ──────────────────────────────────────────────────
function extractTier(name) {
  const m = name.match(/\bT(\d)\b/);
  return m ? parseInt(m[1]) : 0;
}

// Strip tier from name for base matching
function baseName(name) {
  return name.replace(/\s+T\d\b/, '').replace(/\s+Vol\s+[IVX]+/i, '').trim();
}

// ─── Weapon icon resolver ────────────────────────────────────────────────────
function resolveWeapon(name, tier) {
  const n = name.toLowerCase();
  const bn = baseName(name);

  // Swords
  if (/sword|blade|saber|sabre|rapier|scimitar|cutlass|falchion/i.test(n))
    return `pack/weapons/${tierPick(POOL.sword, bn, tier)}`;
  // Daggers
  if (/dagger|knife|shiv|dirk|kris|stiletto/i.test(n))
    return `pack/weapons/${tierPick(POOL.dagger, bn, tier)}`;
  // Axes
  if (/\baxe\b|hatchet|cleaver|tomahawk/i.test(n))
    return `pack/weapons/${tierPick(POOL.axe, bn, tier)}`;
  // Hammers / Maces / Clubs
  if (/hammer|mace|club|maul|flail|warhammer|morningstar/i.test(n))
    return `pack/weapons/${tierPick(POOL.hammer, bn, tier)}`;
  // Bows
  if (/\bbow\b|longbow|shortbow/i.test(n))
    return `pack/weapons/${tierPick(POOL.bow, bn, tier)}`;
  // Crossbows
  if (/crossbow|repeater/i.test(n))
    return `pack/weapons/${tierPick(POOL.crossbow, bn, tier)}`;
  // Guns
  if (/\bgun\b|pistol|rifle|musket|blaster|blunderbuss|cannon/i.test(n))
    return `496_rpg_icons/${hashPick(POOL.rpg_gun, bn)}`;
  // Spears
  if (/spear|lance|pike|halberd|trident|javelin/i.test(n))
    return `pack/weapons/${tierPick(POOL.spear, bn, tier)}`;
  // Staffs
  if (/\bstaff\b|rod\b|scepter|wand/i.test(n))
    return `pack/weapons/${tierPick(POOL.staff, bn, tier)}`;
  // Books / Tomes
  if (/\bbook\b|\btome\b|grimoire|codex|spell\s*book|scripture/i.test(n))
    return `pack/weapons/${tierPick(POOL.book, bn, tier)}`;
  // Scythes
  if (/scythe|sickle/i.test(n))
    return `pack/weapons/${tierPick(POOL.scythe, bn, tier)}`;
  // Shields (some weapons are shields in uMMORPG)
  if (/shield|buckler|bulwark|aegis/i.test(n))
    return `pack/weapons/${tierPick(POOL.shield, bn, tier)}`;
  // Arrows
  if (/\barrow\b|quiver/i.test(n))
    return `pack/weapons/${tierPick(POOL.arrow, bn, tier)}`;
  // Bolt
  if (/\bbolt\b/i.test(n))
    return `pack/weapons/${tierPick(POOL.bolt, bn, tier)}`;
  // Fist weapons
  if (/fist|knuckle|claw|gauntlet/i.test(n))
    return `496_rpg_icons/${hashPick(POOL.rpg_fist, bn)}`;

  // Fallback: use rpg sword
  return `pack/weapons/${hashPick(POOL.sword, bn)}`;
}

// ─── Armor icon resolver ─────────────────────────────────────────────────────
function resolveArmor(name, tier) {
  const n = name.toLowerCase();
  const bn = baseName(name);

  if (/shoulder/i.test(n)) return `pack/armor/${tierPick(POOL.shoulder, bn, tier)}`;
  if (/head\b|helm|helmet|crown|hood|mask|circlet|coif/i.test(n)) return `pack/armor/${tierPick(POOL.helm, bn, tier)}`;
  if (/chest|robe|tunic|vest|jerkin|breastplate|cuirass|hauberk|mail\b/i.test(n)) return `pack/armor/${tierPick(POOL.chest, bn, tier)}`;
  if (/belt|waist|sash|girdle/i.test(n)) return `pack/armor/${tierPick(POOL.belt, bn, tier)}`;
  if (/feet|boot|shoes|greaves|sabatons/i.test(n)) return `pack/armor/${tierPick(POOL.boots, bn, tier)}`;
  if (/legs|pants|legging|breeches|cuisses|tasset/i.test(n)) return `pack/armor/${tierPick(POOL.pants, bn, tier)}`;
  if (/hand|glove|gauntlet|mitt/i.test(n)) return `pack/armor/${tierPick(POOL.gloves, bn, tier)}`;
  if (/bracer|wrist|vambrace|cuff/i.test(n)) return `pack/armor/${tierPick(POOL.bracer, bn, tier)}`;
  if (/back|cape|cloak|mantle/i.test(n)) return `pack/armor/${tierPick(POOL.back, bn, tier)}`;
  if (/necklace|amulet|pendant|choker|chain\b/i.test(n)) return `pack/armor/${tierPick(POOL.necklace, bn, tier)}`;

  // Cloth/Leather/Metal/Plate — try to infer slot from name patterns
  // uMMORPG naming: "Apprentice Cloth Shoulders T1" — slot word is in name
  // Already matched above, so this is a final fallback
  return `pack/armor/${hashPick(POOL.chest, bn)}`;
}

// ─── Offhand icon resolver ──────────────────────────────────────────────────
function resolveOffhand(name, tier) {
  const n = name.toLowerCase();
  const bn = baseName(name);

  if (/shield|buckler|bulwark|aegis|ward/i.test(n))
    return `pack/weapons/${tierPick(POOL.shield, bn, tier)}`;
  if (/\bbook\b|\btome\b|orb|relic|focus|crystal/i.test(n))
    return `pack/weapons/${tierPick(POOL.book, bn, tier)}`;
  // Default offhand → shield
  return `pack/weapons/${tierPick(POOL.shield, bn, tier)}`;
}

// ─── Ring icon resolver ──────────────────────────────────────────────────────
function resolveRing(name, tier) {
  const bn = baseName(name);
  if (POOL.ring.length) return `pack/armor/${tierPick(POOL.ring, bn, tier)}`;
  return `496_rpg_icons/${hashPick(POOL.rpg_ring, bn)}`;
}

// ─── Relic icon resolver ─────────────────────────────────────────────────────
function resolveRelic(name, tier) {
  const n = name.toLowerCase();
  const bn = baseName(name);

  // Element-themed relics → matching crystal/gem
  if (/frost|ice|cold|glacier/i.test(n)) return `496_rpg_icons/${hashPick(POOL.rpg_crystal.concat(RPG_ICONS.filter(f => /Sapphire/.test(f))), bn)}`;
  if (/fire|fury|flame|ember|blaze/i.test(n)) return `496_rpg_icons/${hashPick(POOL.rpg_crystal.concat(RPG_ICONS.filter(f => /Ruby/.test(f))), bn)}`;
  if (/nature|earth|verdant|growth/i.test(n)) return `496_rpg_icons/${hashPick(POOL.rpg_crystal.concat(RPG_ICONS.filter(f => /Jade/.test(f))), bn)}`;
  if (/void|shadow|dark|chaos/i.test(n)) return `496_rpg_icons/${hashPick(POOL.rpg_crystal.concat(RPG_ICONS.filter(f => /Amethist/.test(f))), bn)}`;
  if (/holy|light|divine|sacred/i.test(n)) return `496_rpg_icons/${hashPick(POOL.rpg_crystal.concat(RPG_ICONS.filter(f => /Diamond/.test(f))), bn)}`;
  if (/lightning|thunder|storm/i.test(n)) return `496_rpg_icons/${hashPick(POOL.rpg_crystal.concat(RPG_ICONS.filter(f => /Opal/.test(f))), bn)}`;

  // Generic relic → crystal
  const allGems = POOL.rpg_crystal.concat(POOL.rpg_gem);
  return `496_rpg_icons/${tierPick(allGems, bn, tier)}`;
}

// ─── Skill icon resolver ─────────────────────────────────────────────────────
function resolveSkill(name) {
  const n = name.toLowerCase();
  const bn = baseName(name);

  // Named abilities (check abilities/ directory first)
  const abilityMatch = ABILITY_ICONS.find(f => {
    const abilName = f.replace('ability_', '').replace('.png', '').replace(/_/g, ' ');
    return n.includes(abilName) || abilName.includes(n.replace(/[()]/g, '').trim());
  });
  if (abilityMatch) return `abilities/${abilityMatch}`;

  // Element keywords → RPG skill icons
  if (/fire|flame|burn|blaze|inferno|ember|scorch|ignite|immolat|pyro/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_fire, bn)}`;
  if (/ice|frost|freeze|blizzard|glacier|cold|chill/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_ice, bn)}`;
  if (/holy|heal|divine|smite|blessing|sacred|purif|resurrect|prayer|grace/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_holy, bn)}`;
  if (/nature|earth|root|vine|thorn|entangle|growth|verdant|bloom/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_earth, bn)}`;
  if (/lightning|thunder|storm|shock|bolt|electr|tempest/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_thunder, bn)}`;
  if (/shadow|dark|void|curse|drain|fear|terror|death|necro|soul/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_shadow, bn)}`;
  if (/water|wave|torrent|flood|tide|aqua|rain/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_water, bn)}`;
  if (/wind|gust|cyclone|tornado|breeze|aerial/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_wind, bn)}`;
  if (/light|radian|glow|flash|illumin/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_light, bn)}`;
  if (/poison|venom|toxic|plague|disease|infect/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_poison, bn)}`;

  // Weapon-themed skills
  if (/sword|slash|cleave|strike|blade|cut\b|rend/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_sword, bn)}`;
  if (/axe|chop|hew|split/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_axe, bn)}`;
  if (/\bbow\b|arrow|shot|volley|barrage|snipe/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_bow, bn)}`;
  if (/dagger|stab|backstab|ambush|stealth|assassin/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_dagger, bn)}`;

  // Buff/debuff skills
  if (/buff|aura|fortif|empower|strengthen|haste|berserk|rally|protect|ward|barrier/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_buff, bn)}`;

  // Physical skills
  if (/attack|charge|bash|smash|crush|punch|kick|whirl|spin|rush|stun|knockback|catapult|ballista|brute|siege/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_physic.concat(POOL.sk_sword), bn)}`;

  // Mage/Arcane
  if (/mage|arcane|magic|spell|archmage|blink|teleport|portal|mana|polymorph|enchant/i.test(n)) return `496_rpg_icons/${hashPick(POOL.sk_magic, bn)}`;

  // Fallback
  return `496_rpg_icons/${hashPick(POOL.sk_magic, bn)}`;
}

// ─── Consumable icon resolver ────────────────────────────────────────────────
function resolveConsumable(name, tier) {
  const n = name.toLowerCase();
  const bn = baseName(name);

  // Many "consumables" in the uMMORPG export are actually ARMOR pieces
  // Check for armor slot keywords first
  if (/shoulder/i.test(n)) return resolveArmor(name, tier);
  if (/head\b|helm|helmet|crown|hood|mask|circlet|coif/i.test(n)) return resolveArmor(name, tier);
  if (/chest|robe|tunic|vest|jerkin|breastplate/i.test(n)) return resolveArmor(name, tier);
  if (/belt|waist|sash|girdle/i.test(n)) return resolveArmor(name, tier);
  if (/feet|boot|shoes|greaves/i.test(n)) return resolveArmor(name, tier);
  if (/legs|pants|legging/i.test(n)) return resolveArmor(name, tier);
  if (/hand|glove|gauntlet/i.test(n)) return resolveArmor(name, tier);
  if (/bracer|wrist|vambrace/i.test(n)) return resolveArmor(name, tier);
  if (/back|cape|cloak|mantle/i.test(n)) return resolveArmor(name, tier);
  if (/necklace|amulet|pendant/i.test(n)) return resolveArmor(name, tier);
  // Cloth/Leather/Metal armor pieces without explicit slot in name
  if (/\bcloth\b|\bleather\b|\bplate\b|\bmail\b|\bmetal\b/i.test(n) && /\bT\d\b/.test(name))
    return resolveArmor(name, tier);

  // Rings
  if (/\bring\b|\bband\b/i.test(n)) return resolveRing(name, tier);

  // Shields
  if (/shield|buckler/i.test(n)) return resolveOffhand(name, tier);

  // Weapons that ended up in consumable
  if (/sword|blade|dagger|axe|hammer|mace|bow|crossbow|staff|spear/i.test(n))
    return resolveWeapon(name, tier);

  // Potions
  if (/health\s*potion|hp\s*potion|healing\s*potion|red\s*potion/i.test(n))
    return `consumables/${hashPick(CONSUMABLE_ICONS.filter(f => /health_potion/.test(f)), bn) || 'health_potion01.png'}`;
  if (/mana\s*potion|mp\s*potion|blue\s*potion/i.test(n))
    return `consumables/${hashPick(CONSUMABLE_ICONS.filter(f => /mana_potion/.test(f)), bn) || 'mana_potion01.png'}`;
  if (/potion|elixir|tonic|flask|vial|draught/i.test(n)) {
    const allPotions = POOL.rpg_potion_red.concat(POOL.rpg_potion_blue, POOL.rpg_potion_green, POOL.rpg_potion_yellow, POOL.rpg_potion_orange);
    return `496_rpg_icons/${hashPick(allPotions, bn)}`;
  }

  // Food
  if (/bread|meat|fish|cheese|apple|pie|steak|chicken|mushroom|fruit|carrot|berry|grape|banana|cherry|nut|pear|lemon|orange|pepper|radish|strawberry|watermelon|pineapple/i.test(n)) {
    // Try consumables/ food icons first
    const foodConsumables = CONSUMABLE_ICONS.filter(f => /^food_/.test(f));
    if (foodConsumables.length) return `consumables/${hashPick(foodConsumables, bn)}`;
    // Then food/
    if (FOOD_ICONS.length) return `food/${hashPick(FOOD_ICONS, bn)}`;
    return `496_rpg_icons/${hashPick(POOL.rpg_food, bn)}`;
  }
  if (/meal|feast|soup|stew|curry|sushi|ramen|pizza|burger|sandwich|cookie|cake/i.test(n)) {
    return `food/${hashPick(FOOD_ICONS, bn)}`;
  }

  // Herbs
  if (/herb|plant|seed|flower|leaf|root|sprout|bouquet|lavender|seaweed/i.test(n)) {
    const herbs = CONSUMABLE_ICONS.filter(f => /^herb_/.test(f));
    if (herbs.length) return `consumables/${hashPick(herbs, bn)}`;
    return `496_rpg_icons/${hashPick(RPG_ICONS.filter(f => /I_Leaf|I_Clover/.test(f)), bn)}`;
  }

  // Mounts / pets
  if (/horse|mount|saber|raptor|wolf|bear|spider|warg|griffin|drake|wyvern|scorpion|boar/i.test(n)) {
    // Use misc icons for mounts
    const mountIcons = PACK_MISC.filter(f => /Icon|Ship|Boat|Copter|Glider|Skeeter|Mecha/i.test(f));
    if (mountIcons.length) return `pack/misc/${hashPick(mountIcons, bn)}`;
    return `loot/${hashPick(LOOT_ICONS, bn)}`;
  }

  // Scrolls
  if (/scroll|recipe|blueprint|schematic/i.test(n))
    return `496_rpg_icons/${hashPick(POOL.rpg_scroll, bn)}`;

  // Keys
  if (/\bkey\b/i.test(n)) return `496_rpg_icons/${hashPick(POOL.rpg_key, bn)}`;

  // Chests / bags
  if (/chest|box|bag|crate|satchel|pack\b/i.test(n))
    return `496_rpg_icons/${hashPick(POOL.rpg_chest, bn)}`;

  // Gold / Coins
  if (/\bgold\b|coin|money|currency/i.test(n))
    return `496_rpg_icons/${hashPick(POOL.rpg_gold, bn)}`;

  // Arrows (ammo)
  if (/\barrow\b|ammo|bolt|bullet/i.test(n))
    return `pack/weapons/${hashPick(POOL.arrow, bn)}`;

  // Crafting reagents that ended up as consumable
  if (/ingot|ore|bar\b|plank|log\b|thread|leather|hide|cloth|gem|essence|dust|shard|fragment/i.test(n))
    return resolveMaterial(name, tier);

  // Skill books
  if (/skill|spell|ability|technique|mastery/i.test(n))
    return resolveSkill(name);

  // Generic loot
  return `loot/${hashPick(LOOT_ICONS, bn)}`;
}

// ─── Material icon resolver ──────────────────────────────────────────────────
function resolveMaterial(name, tier) {
  const n = name.toLowerCase();
  const bn = baseName(name);

  // Ores
  if (/ore|stone\b|rock/i.test(n)) {
    const ores = MATERIAL_ICONS.filter(f => /ore/.test(f));
    if (ores.length) return `materials/${tierPick(ores, bn, tier)}`;
    return `496_rpg_icons/${hashPick(RPG_ICONS.filter(f => /I_Rock/.test(f)), bn)}`;
  }
  // Ingots / Bars / Metal
  if (/ingot|bar\b|metal|iron|steel|copper|bronze|mithril|adamant|orichalcum|starmetal/i.test(n)) {
    const ingots = MATERIAL_ICONS.filter(f => /ingot/.test(f));
    if (ingots.length) return `materials/${hashPick(ingots, bn)}`;
    return `496_rpg_icons/${hashPick(POOL.rpg_metal, bn)}`;
  }
  // Wood / Logs / Planks
  if (/wood|log\b|plank|lumber|timber|pine|oak|maple|ash|ebony|driftwood|ironwood|wyrmwood|worldtree/i.test(n)) {
    const woods = MATERIAL_ICONS.filter(f => /log|plank/.test(f));
    if (woods.length) return `materials/${hashPick(woods, bn)}`;
    return `496_rpg_icons/${hashPick(POOL.rpg_wood, bn)}`;
  }
  // Thread / Cloth / Fabric
  if (/thread|cloth|fabric|linen|cotton|silk|wool|weave|arcane.*thread|celestial.*thread|divine.*thread|enchanted.*thread/i.test(n)) {
    const threads = MATERIAL_ICONS.filter(f => /thread/.test(f));
    if (threads.length) return `materials/${hashPick(threads, bn)}`;
    return `496_rpg_icons/${hashPick(RPG_ICONS.filter(f => /I_Fabric/.test(f)), bn)}`;
  }
  // Leather / Hide
  if (/leather|hide|rawhide|pelt|skin\b|fur\b|scale\b/i.test(n)) {
    const leathers = MATERIAL_ICONS.filter(f => /leather|hide|rawhide/.test(f));
    if (leathers.length) return `materials/${hashPick(leathers, bn)}`;
    return `496_rpg_icons/${hashPick(RPG_ICONS.filter(f => /I_WolfFur|I_Fabric/.test(f)), bn)}`;
  }
  // Gems / Crystals
  if (/gem|crystal|jewel|diamond|ruby|sapphire|emerald|topaz|amethyst/i.test(n)) {
    const gems = MATERIAL_ICONS.filter(f => /gem/.test(f));
    if (gems.length) return `materials/${tierPick(gems, bn, tier)}`;
    return `496_rpg_icons/${hashPick(POOL.rpg_gem.concat(POOL.rpg_crystal), bn)}`;
  }
  // Essence
  if (/essence|mana.*shard|soul.*shard|arcane.*dust|enchanting/i.test(n)) {
    const essences = MATERIAL_ICONS.filter(f => /essence/.test(f));
    if (essences.length) return `materials/${hashPick(essences, bn)}`;
    return `496_rpg_icons/${hashPick(POOL.rpg_crystal, bn)}`;
  }
  // Bones
  if (/bone|skull|skeleton/i.test(n))
    return `496_rpg_icons/${hashPick(POOL.rpg_bone.concat(RPG_ICONS.filter(f => /I_Bone/.test(f))), bn)}`;
  // Coal
  if (/coal|charcoal/i.test(n))
    return `496_rpg_icons/${hashPick(RPG_ICONS.filter(f => /I_Coal/.test(f)), bn)}`;
  // Feathers
  if (/feather|plume|quill/i.test(n))
    return `496_rpg_icons/${hashPick(RPG_ICONS.filter(f => /I_Feather/.test(f)), bn)}`;
  // Herbs/Plants
  if (/herb|plant|flower|seed|leaf|root/i.test(n)) {
    const herbs = CONSUMABLE_ICONS.filter(f => /herb/.test(f));
    if (herbs.length) return `consumables/${hashPick(herbs, bn)}`;
    return `496_rpg_icons/${hashPick(RPG_ICONS.filter(f => /I_Leaf|I_Clover/.test(f)), bn)}`;
  }
  // Scraps / Fragments
  if (/scrap|fragment|shard|piece|chunk|remnant/i.test(n)) {
    const scraps = MATERIAL_ICONS.filter(f => /scrap/.test(f));
    if (scraps.length) return `materials/${hashPick(scraps, bn)}`;
    return `496_rpg_icons/${hashPick(POOL.rpg_metal, bn)}`;
  }
  // Rope / String
  if (/rope|string|twine|cord/i.test(n))
    return `496_rpg_icons/${hashPick(RPG_ICONS.filter(f => /I_Fabric/.test(f)), bn)}`;

  // Generic material → loot/resource
  const resIcons = PACK_RESOURCES.filter(f => /^Res/.test(f));
  if (resIcons.length) return `pack/resources/${hashPick(resIcons, bn)}`;
  return `loot/${hashPick(LOOT_ICONS, bn)}`;
}

// ─── Master resolver ─────────────────────────────────────────────────────────
function resolveIcon(name, category) {
  const tier = extractTier(name);

  switch (category) {
    case 'weapon':     return resolveWeapon(name, tier);
    case 'armor':      return resolveArmor(name, tier);
    case 'offhand':    return resolveOffhand(name, tier);
    case 'ring':       return resolveRing(name, tier);
    case 'relic':      return resolveRelic(name, tier);
    case 'skill':      return resolveSkill(name);
    case 'consumable': return resolveConsumable(name, tier);
    case 'material':   return resolveMaterial(name, tier);
    default:           return `loot/${hashPick(LOOT_ICONS, name)}`;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
let html = fs.readFileSync(HTML_PATH, 'utf-8');

// Match each item-card block and replace its icon
const itemCardRe = /(<div\s+class="item-card"\s+data-name="([^"]+)"\s+data-category="([^"]+)">\s*<div\s+class="item-icon">\s*)<img\s+[^>]*?(?:src="[^"]*")[^>]*?>/g;

let count = 0;
let stats = { weapon: 0, armor: 0, offhand: 0, ring: 0, relic: 0, skill: 0, consumable: 0, material: 0 };

html = html.replace(itemCardRe, (match, prefix, name, category) => {
  const iconPath = resolveIcon(name, category);
  if (!iconPath) return match; // safety

  count++;
  stats[category] = (stats[category] || 0) + 1;

  const newImg = `<img src="${ICON_BASE}/${iconPath}" alt="${name.replace(/"/g, '&quot;')}" loading="lazy">`;
  return prefix + newImg;
});

fs.writeFileSync(HTML_PATH, html, 'utf-8');

console.log(`\n✅ Reassigned ${count} item icons`);
console.log('Category breakdown:');
for (const [cat, n] of Object.entries(stats)) {
  if (n > 0) console.log(`  ${cat}: ${n}`);
}
console.log('\nDone!');
