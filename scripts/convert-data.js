const fs = require('fs');
const path = require('path');

const SUITE = 'C:/Users/nugye/Documents/1111111/Warlord-Crafting-Suite-Clean/api/grudge-builder/data';
const OUT = 'C:/Users/nugye/Documents/1111111/ObjectStore/api/v1';

// ─── Parsers (mirror the TS parseWeaponStats / parseStats) ───
function parseWeaponStats(dmg, speed, combo, crit, block, def) {
  const p = s => { const [b, t] = s.split(' +').map(Number); return { base: b || 0, perTier: t || 0 }; };
  return {
    damageBase: p(dmg).base, damagePerTier: p(dmg).perTier,
    speedBase: p(speed).base, speedPerTier: p(speed).perTier,
    comboBase: p(combo).base, comboPerTier: p(combo).perTier,
    critBase: p(crit).base, critPerTier: p(crit).perTier,
    blockBase: p(block).base, blockPerTier: p(block).perTier,
    defenseBase: p(def).base, defensePerTier: p(def).perTier,
  };
}
function parseEquipStats(hp, mana, crit, block, def) {
  const p = s => { const [b, t] = s.split(' +').map(Number); return { base: b || 0, perTier: t || 0 }; };
  return {
    hpBase: p(hp).base, hpPerTier: p(hp).perTier,
    manaBase: p(mana).base, manaPerTier: p(mana).perTier,
    critBase: p(crit).base, critPerTier: p(crit).perTier,
    blockBase: p(block).base, blockPerTier: p(block).perTier,
    defenseBase: p(def).base, defensePerTier: p(def).perTier,
  };
}

// ─── Read sprite maps ───
function readSpriteMap() {
  const src = fs.readFileSync(path.join(SUITE, 'weaponSpriteMap.ts'), 'utf8');
  const weapons = {}, armor = {};
  // Parse WEAPON_SPRITE_MAP
  const wMatch = src.match(/WEAPON_SPRITE_MAP[^{]*\{([^}]+)\}/s);
  if (wMatch) {
    for (const m of wMatch[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)) weapons[m[1]] = m[2];
  }
  // Parse ARMOR_SPRITE_MAP
  const aMatch = src.match(/ARMOR_SPRITE_MAP[^{]*\{([^}]+)\}/s);
  if (aMatch) {
    for (const m of aMatch[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)) armor[m[1]] = m[2];
  }
  return { weapons, armor };
}

// ─── Type folder map ───
const TYPE_FOLDERS = {
  "Sword": "swords", "Axe": "axes", "Dagger": "daggers",
  "Hammer1h": "hammers", "Hammer2h": "hammers",
  "Greatsword": "swords", "Greataxe": "axes",
  "Bow": "bows", "Crossbow": "crossbows", "Gun": "guns",
  "Fire Staff": "staves", "Frost Staff": "staves", "Nature Staff": "staves",
  "Holy Staff": "staves", "Arcane Staff": "staves", "Lightning Staff": "staves",
  "Fire Tome": "tomes", "Frost Tome": "tomes", "Nature Tome": "tomes",
  "Holy Tome": "tomes", "Arcane Tome": "tomes", "Lightning Tome": "tomes",
};
const SLOT_FOLDERS = {
  "Helm": "helms", "Shoulder": "shoulders", "Chest": "chest",
  "Hands": "hands", "Feet": "boots", "Ring": "rings",
  "Necklace": "necklaces", "Relic": "back",
};

// ─── Category key map (weapons.ts type -> ObjectStore category key) ───
const CAT_KEY_MAP = {
  "Sword": "swords", "Axe": "axes1h", "Dagger": "daggers",
  "Hammer1h": "hammers1h", "Hammer2h": "hammers2h",
  "Greatsword": "greatswords", "Greataxe": "greataxes",
  "Bow": "bows", "Crossbow": "crossbows", "Gun": "guns",
  "Fire Staff": "fireStaves", "Frost Staff": "frostStaves",
  "Nature Staff": "natureStaves", "Holy Staff": "holyStaves",
  "Arcane Staff": "arcaneStaves", "Lightning Staff": "lightningStaves",
};
const EMOJI_MAP = {
  "Sword": "⚔️", "Axe": "🪓", "Dagger": "🗡️",
  "Hammer1h": "🔨", "Hammer2h": "🔨",
  "Greatsword": "⚔️", "Greataxe": "🪓",
  "Bow": "🏹", "Crossbow": "🎯", "Gun": "🔫",
  "Fire Staff": "🔥", "Frost Staff": "❄️", "Nature Staff": "🌿",
  "Holy Staff": "✨", "Arcane Staff": "🔮", "Lightning Staff": "⚡",
  "Fire Tome": "🔥", "Frost Tome": "❄️", "Nature Tome": "🌿",
  "Holy Tome": "✨", "Arcane Tome": "🔮", "Lightning Tome": "⚡",
};

// ─── Parse weapons.ts ───
function parseWeapons() {
  const src = fs.readFileSync(path.join(SUITE, 'crafting/weapons.ts'), 'utf8');
  const weapons = [];

  // Match each weapon object: { id: "...", name: "...", ... }
  const objRe = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*lore:\s*"([^"]+)",\s*stats:\s*parseWeaponStats\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\),\s*basicAbility:\s*"([^"]+)",\s*abilities:\s*\[([^\]]+)\],\s*signatureAbility:\s*"([^"]+)",\s*passives:\s*\[([^\]]+)\],\s*craftedBy:\s*"([^"]+)"/g;

  let m;
  while ((m = objRe.exec(src)) !== null) {
    const abilities = m[13].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
    const passives = m[15].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
    weapons.push({
      id: m[1], name: m[2], type: m[3], category: m[4], lore: m[5],
      stats: parseWeaponStats(m[6], m[7], m[8], m[9], m[10], m[11]),
      basicAbility: m[12], abilities, signatureAbility: m[14],
      passives, craftedBy: m[16],
    });
  }
  return weapons;
}

// ─── Parse equipment.ts ───
function parseEquipment() {
  const src = fs.readFileSync(path.join(SUITE, 'crafting/equipment.ts'), 'utf8');
  const items = [];

  const objRe = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*material:\s*"([^"]+)",\s*lore:\s*"([^"]+)",\s*stats:\s*parseStats\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\),\s*passive:\s*"([^"]+)",\s*attribute:\s*"([^"]+)",\s*effect:\s*"([^"]+)",\s*proc:\s*"([^"]+)",\s*setBonus:\s*"([^"]+)"/g;

  let m;
  while ((m = objRe.exec(src)) !== null) {
    items.push({
      id: m[1], name: m[2], type: m[3], material: m[4], lore: m[5],
      stats: parseEquipStats(m[6], m[7], m[8], m[9], m[10]),
      passive: m[11], attribute: m[12], effect: m[13],
      proc: m[14], setBonus: m[15],
    });
  }
  return items;
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════

const sprites = readSpriteMap();
console.log(`Parsed ${Object.keys(sprites.weapons).length} weapon sprites, ${Object.keys(sprites.armor).length} armor sprites`);

// ─── 1. Build enriched weapons.json ───
const sourceWeapons = parseWeapons();
console.log(`Parsed ${sourceWeapons.length} weapons from source`);

// Read existing weapons.json to preserve structure
const existingWeapons = JSON.parse(fs.readFileSync(path.join(OUT, 'weapons.json'), 'utf8'));

// Build a lookup from source weapons: type -> weapons[]
const byType = {};
for (const w of sourceWeapons) {
  if (!byType[w.type]) byType[w.type] = [];
  byType[w.type].push(w);
}

// Enrich each category
let totalWeapons = 0;
for (const [catKey, catData] of Object.entries(existingWeapons.categories)) {
  // Find matching source type
  const sourceType = Object.entries(CAT_KEY_MAP).find(([, v]) => v === catKey)?.[0];
  const sourceItems = sourceType ? (byType[sourceType] || []) : [];

  if (catData.items) {
    for (let i = 0; i < catData.items.length; i++) {
      const item = catData.items[i];
      // Try to find matching source weapon by name similarity
      const srcW = sourceItems.find(sw =>
        sw.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]) ||
        item.name.toLowerCase().includes(sw.name.toLowerCase().split(' ')[0]) ||
        sw.id.includes(item.id.replace(/-/g, ''))
      );

      if (srcW) {
        item.lore = srcW.lore;
        item.category = srcW.category;
        item.stats = srcW.stats;
        item.basicAbility = srcW.basicAbility;
        item.abilities = srcW.abilities;
        item.signatureAbility = srcW.signatureAbility;
        item.passives = srcW.passives;
        item.craftedBy = srcW.craftedBy;
        // Sprite path
        const spriteKey = srcW.id;
        if (sprites.weapons[spriteKey]) {
          const folder = TYPE_FOLDERS[srcW.type] || 'misc';
          item.spritePath = `/icons/weapons/${folder}/${sprites.weapons[spriteKey]}.png`;
        }
      }
      totalWeapons++;
    }
  }
}

// Add tome categories that may not exist yet
const tomeTypes = ['Fire Tome', 'Frost Tome', 'Nature Tome', 'Holy Tome', 'Arcane Tome', 'Lightning Tome'];
for (const tType of tomeTypes) {
  const tomeKey = tType.replace(' ', '').replace('Tome', 'Tomes');
  const tomeKeyLower = tomeKey.charAt(0).toLowerCase() + tomeKey.slice(1);
  if (!existingWeapons.categories[tomeKeyLower]) {
    const tomes = byType[tType] || [];
    if (tomes.length > 0) {
      existingWeapons.categories[tomeKeyLower] = {
        iconBase: 'Tome',
        iconMax: 20,
        items: tomes.map(t => ({
          id: t.id,
          name: t.name,
          lore: t.lore,
          category: t.category,
          primaryStat: t.type.includes('Fire') ? 'burn' : t.type.includes('Frost') ? 'slow' : t.type.includes('Nature') ? 'heal' : t.type.includes('Holy') ? 'heal' : t.type.includes('Arcane') ? 'mana' : 'shock',
          secondaryStat: 'crit',
          emoji: EMOJI_MAP[t.type] || '📖',
          grudgeType: 'item',
          stats: t.stats,
          basicAbility: t.basicAbility,
          abilities: t.abilities,
          signatureAbility: t.signatureAbility,
          passives: t.passives,
          craftedBy: t.craftedBy,
          spritePath: sprites.weapons[t.id] ? `/icons/weapons/tomes/${sprites.weapons[t.id]}.png` : null,
        })),
        grudgeType: 'equipment',
      };
      totalWeapons += tomes.length;
    }
  }
}

// Update total count
const actualTotal = Object.values(existingWeapons.categories).reduce((sum, cat) => sum + (cat.items?.length || 0), 0);
existingWeapons.total = actualTotal;
existingWeapons.version = '2.0.0';
existingWeapons.updated = '2026-02-27';

fs.writeFileSync(path.join(OUT, 'weapons.json'), JSON.stringify(existingWeapons, null, 2));
console.log(`✅ weapons.json: ${actualTotal} weapons enriched`);

// ─── 2. Build spriteMaps.json ───
// NOTE: equipment.json is deprecated — armor data now lives in armor.json (generated by export-armor.js)
const spriteMapsJSON = {
  version: '1.0.0',
  updated: '2026-02-27',
  totalMappings: Object.keys(sprites.weapons).length + Object.keys(sprites.armor).length,
  weapons: {},
  armor: {},
  typeFolders: TYPE_FOLDERS,
  slotFolders: SLOT_FOLDERS,
};

// Weapons with full paths
for (const [id, sprite] of Object.entries(sprites.weapons)) {
  const typePart = id.split('-')[0];
  const typeMap = {
    sword: 'swords', axe: 'axes', dagger: 'daggers',
    hammer1h: 'hammers', hammer2h: 'hammers',
    greatsword: 'swords', greataxe: 'axes',
    bow: 'bows', crossbow: 'crossbows', gun: 'guns',
    staff: 'staves', tome: 'tomes',
  };
  const folder = typeMap[typePart] || 'misc';
  spriteMapsJSON.weapons[id] = {
    sprite,
    path: `/icons/weapons/${folder}/${sprite}.png`,
  };
}

// Armor with full paths
for (const [id, sprite] of Object.entries(sprites.armor)) {
  const parts = id.split('-');
  const slotPart = parts[parts.length - 1];
  const slotMap = {
    helm: 'helms', shoulder: 'shoulders', chest: 'chest',
    hands: 'hands', feet: 'boots', ring: 'rings',
    necklace: 'necklaces', relic: 'back',
  };
  const folder = slotMap[slotPart] || slotPart;
  spriteMapsJSON.armor[id] = {
    sprite,
    path: `/icons/armor/${folder}/${sprite}.png`,
  };
}

fs.writeFileSync(path.join(OUT, 'spriteMaps.json'), JSON.stringify(spriteMapsJSON, null, 2));
console.log(`✅ spriteMaps.json: ${spriteMapsJSON.totalMappings} mappings`);

console.log('\n✅ All conversions complete!');
