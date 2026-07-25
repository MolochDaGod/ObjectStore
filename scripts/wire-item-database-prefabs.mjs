/**
 * Wire Item Database SSOT:
 *  1. Point frost / ice staffs at undead_frost T1 ice mesh
 *  2. Inject T0 weapons + T1 race-element staffs into master-items
 *  3. Emit master-item-prefabs.json (canonical prefab / assets / effects)
 *  4. Patch weapon-model-game-urls for frost staves + new prefabs
 *
 * Usage: node scripts/wire-item-database-prefabs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API = path.join(ROOT, 'api', 'v1');
const CDN = 'https://assets.grudge-studio.com';

const ICE_STAFF_R2 = 'models/codex/t1/staffs/undead_frost.glb';
const ICE_STAFF_URL = `${CDN}/${ICE_STAFF_R2}`;
const ICE_STAFF_GAME = ICE_STAFF_R2;

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(API, name), 'utf8'));
}
function writeJson(name, data) {
  const out = path.join(API, name);
  fs.writeFileSync(out, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`wrote ${name} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
}

function stableUuid(prefix, seed) {
  const h = crypto.createHash('sha1').update(String(seed)).digest('hex').toUpperCase();
  return `${prefix}-${h.slice(0, 12)}-${h.slice(12, 20)}`;
}

// ─── T1 race-element staffs (mirrors GrudgeBuilder raceElementStaffs.ts) ───
const RACE_ELEMENT_STAFFS = [
  {
    id: 't1_staff_human_holy',
    raceId: 'human',
    name: 'Crusade Dawn Staff',
    element: 'holy',
    damageType: 'holy',
    school: 'holy',
    stem: 'human_holy',
    castAuraVariant: 'holy',
    impactVariant: 'yellow',
    vfxKeys: ['holy', 'smite', 'radiant', 'fx.mage.holy'],
    raceKitStaffVariant: 'A',
    description: 'Human / Crusade T1 staff — holy light for heal and smite tests.',
    iconUrl: `${CDN}/icons/pack/weapons/staff_1.png`,
  },
  {
    id: 't1_staff_barbarian_fire',
    raceId: 'barbarian',
    name: 'Ashbrand Warstaff',
    element: 'fire',
    damageType: 'fire',
    school: 'fire',
    stem: 'barbarian_fire',
    castAuraVariant: 'fire',
    impactVariant: 'original',
    vfxKeys: ['fire', 'flame', 'meteor', 'fx.mage.fire_fissure'],
    raceKitStaffVariant: 'B',
    description: 'Barbarian T1 staff — fire school for fissure / ember tests.',
    iconUrl: `${CDN}/icons/pack/weapons/staff_1.png`,
  },
  {
    id: 't1_staff_elf_nature',
    raceId: 'elf',
    name: 'Verdant Spire',
    element: 'nature',
    damageType: 'nature',
    school: 'nature',
    stem: 'elf_nature',
    castAuraVariant: 'nature',
    impactVariant: 'yellow',
    vfxKeys: ['nature', 'root', 'bloom', 'regen'],
    raceKitStaffVariant: 'A',
    description: 'Elf / Fabled T1 staff — nature school for roots and HoTs.',
    iconUrl: `${CDN}/icons/pack/weapons/staff_02.png`,
  },
  {
    id: 't1_staff_dwarf_arcane',
    raceId: 'dwarf',
    name: 'Rune-Cane of the Hold',
    element: 'arcane',
    damageType: 'arcane',
    school: 'arcane',
    stem: 'dwarf_arcane',
    castAuraVariant: 'arcane',
    impactVariant: 'purple',
    vfxKeys: ['arcane', 'mana', 'missile', 'reality'],
    raceKitStaffVariant: 'C',
    description: 'Dwarf T1 staff — arcane missiles and rune pulse tests.',
    iconUrl: `${CDN}/icons/pack/weapons/staff_5.png`,
  },
  {
    id: 't1_staff_orc_shadow',
    raceId: 'orc',
    name: 'Maw-Shadow Staff',
    element: 'shadow',
    damageType: 'shadow',
    school: 'shadow',
    stem: 'orc_shadow',
    castAuraVariant: 'shadow',
    impactVariant: 'purple',
    vfxKeys: ['shadow', 'void', 'dark', 'necro'],
    raceKitStaffVariant: 'B',
    description: 'Orc / Legion T1 staff — shadow school for drain and fear tests.',
    iconUrl: `${CDN}/icons/pack/weapons/staff_3.png`,
  },
  {
    id: 't1_staff_undead_frost',
    raceId: 'undead',
    name: 'Grave-Ice Scepter',
    element: 'frost',
    damageType: 'frost',
    school: 'frost',
    stem: 'undead_frost',
    castAuraVariant: 'frost',
    impactVariant: 'blue',
    vfxKeys: ['frost', 'ice', 'freeze', 'chill'],
    raceKitStaffVariant: 'C',
    description: 'Undead T1 ice staff — frost school for chill and ice bolt tests. Canonical ice staff mesh.',
    iconUrl: `${CDN}/icons/pack/weapons/staff_10.png`,
    /** Flag: this is the fleet ice staff SSOT mesh */
    isIceStaffCanonical: true,
  },
];

// ─── T0 weapons (item + visual SSOT) ───────────────────────────────────────
const T0_WEAPONS = [
  {
    id: 't0_sword',
    name: 'Training Sword',
    category: 'swords',
    weaponType: 'SWORD',
    subType: 'sword',
    stats: { damage: 18, speed: 95, crit: 1, block: 2, defense: 6 },
    description: 'A blunted training blade for recruits.',
    iconUrl: `${CDN}/icons/pack/weapons/Sword_01.png`,
    modelR2Key: 'models/codex/glitch-weapons/weapons/copper_sword.glb',
    raceKit: { slot: 'sword', variant: 'A' },
    attachBone: 'R_hand_container',
    attachmentProfile: 'main_hand',
    effects: ['Starter physical'],
    abilities: ['Practice Slash', 'Guard Stance'],
  },
  {
    id: 't0_bone_dagger',
    name: 'Bone Dagger',
    category: 'daggers',
    weaponType: 'DAGGER',
    subType: 'dagger',
    stats: { damage: 14, speed: 110, crit: 4, block: 0, defense: 2 },
    description: 'Sharpened bone dagger — T0 offhand / dual-wield starter (2bone_knife.glb).',
    iconUrl: `${CDN}/icons/pack/weapons/Dagger_01.png`,
    modelR2Key: 'models/codex/t0/bone_dagger.glb',
    raceKit: { slot: 'dagger', variant: 'A' },
    attachBone: 'R_hand_container',
    attachmentProfile: 'main_hand',
    effects: ['Bleed chance (light)'],
    abilities: ['Quick Stab', 'Bone Flurry'],
  },
  {
    id: 't0_dagger',
    name: 'Training Dagger',
    category: 'daggers',
    weaponType: 'DAGGER',
    subType: 'dagger',
    stats: { damage: 12, speed: 108, crit: 3, block: 0, defense: 2 },
    description: 'Training dagger — shares bone dagger mesh.',
    iconUrl: `${CDN}/icons/pack/weapons/Dagger_01.png`,
    modelR2Key: 'models/codex/t0/bone_dagger.glb',
    raceKit: { slot: 'dagger', variant: 'A' },
    attachBone: 'R_hand_container',
    attachmentProfile: 'main_hand',
    effects: ['Starter physical'],
    abilities: ['Quick Stab'],
  },
  {
    id: 't0_axe',
    name: 'Training Axe',
    category: 'axes1h',
    weaponType: 'AXE',
    subType: 'axe',
    stats: { damage: 20, speed: 85, crit: 2, block: 1, defense: 4 },
    description: 'Crude woodcutter axe for recruits.',
    iconUrl: `${CDN}/icons/pack/weapons/Axe_01.png`,
    modelR2Key: 'models/codex/glitch-weapons/weapons/copper_axe.glb',
    raceKit: { slot: 'axe', variant: 'A' },
    attachBone: 'R_hand_container',
    attachmentProfile: 'main_hand',
    effects: ['Starter physical'],
    abilities: ['Practice Chop', 'Wind-Up'],
  },
  {
    id: 't0_bow',
    name: 'Training Bow',
    category: 'bows',
    weaponType: 'BOW',
    subType: 'bow',
    stats: { damage: 15, speed: 90, crit: 2, range: 0, defense: 1 },
    description: 'Simple shortbow for range drills.',
    iconUrl: `${CDN}/icons/pack/weapons/Bow_01.png`,
    modelR2Key: null,
    raceKit: { slot: 'bow', variant: '_default' },
    attachBone: 'L_hand_container',
    attachmentProfile: 'ranged_2h',
    effects: ['Starter physical'],
    abilities: ['Practice Shot'],
  },
  {
    id: 't0_staff',
    name: 'Gnarled Staff',
    category: 'staves',
    weaponType: 'STAFF',
    subType: 'staff',
    stats: { damage: 12, speed: 80, crit: 1, block: 2, defense: 3 },
    description: 'Starter staff — race kit staff_A. Use T1 race-element staffs for spell tests.',
    iconUrl: `${CDN}/icons/pack/weapons/staff_1.png`,
    modelR2Key: null,
    raceKit: { slot: 'staff', variant: 'A' },
    attachBone: 'R_hand_container',
    attachmentProfile: 'two_hand',
    effects: ['Starter arcane'],
    abilities: ['Practice Bolt'],
  },
  {
    id: 't0_hammer',
    name: 'Stone Hammer',
    category: 'hammers1h',
    weaponType: 'HAMMER',
    subType: 'hammer',
    stats: { damage: 19, speed: 75, crit: 1, block: 3, defense: 5 },
    description: 'Heavy stone hammer for recruits.',
    iconUrl: `${CDN}/icons/pack/weapons/Hammer_01.png`,
    modelR2Key: 'models/codex/glitch-weapons/weapons/copper_picaxe.glb',
    raceKit: { slot: 'hammer', variant: 'A' },
    attachBone: 'R_hand_container',
    attachmentProfile: 'main_hand',
    effects: ['Starter physical'],
    abilities: ['Practice Smash'],
  },
  {
    id: 't0_shield',
    name: 'Training Shield',
    category: 'shields',
    weaponType: 'SHIELD',
    subType: 'shield',
    stats: { damage: 0, speed: 0, crit: 0, block: 18, defense: 12 },
    description: 'Wooden training shield.',
    iconUrl: `${CDN}/icons/pack/weapons/shield_01.png`,
    modelR2Key: null,
    raceKit: { slot: 'shield', variant: 'A' },
    attachBone: 'L_shield_container',
    attachmentProfile: 'off_hand',
    effects: ['Block chance'],
    abilities: ['Raise Guard'],
  },
];

// Frost ability packs from staff-looks / crafting weapons
const FROST_ABILITIES_DEFAULT = [
  'Ice Nova (AoE slow)',
  'Frost Lance (single burst)',
  'Glacial Shield (absorb dmg)',
  'Blizzard Strike (channeled AoE slow dmg)',
];
const FROST_SIGNATURE = 'Absolute Zero (mass freeze)';
const FROST_PASSIVES = ['Chill Mastery (+slow effect)', 'Mana Regen', 'Crit Chance'];

function staffItemFromRace(def) {
  const r2 = `models/codex/t1/staffs/${def.stem}.glb`;
  const uuid = stableUuid('ITEM', def.id);
  return {
    uuid,
    baseUuid: uuid,
    id: def.id,
    name: def.name,
    baseName: def.name,
    type: 'weapon',
    category: `${def.element}Staves`,
    weaponType: 'STAFF',
    subCategory: '2h',
    tier: 1,
    tierLabel: 'Common',
    tierColor: '#8b7355',
    element: def.element,
    school: def.school,
    damageType: def.damageType,
    race: def.raceId,
    stats: { damage: 28, speed: 88, crit: 3, block: 2, defense: 4 },
    primaryStat: def.element === 'frost' ? 'slow' : 'damage',
    iconUrl: def.iconUrl,
    description: def.description,
    lore: def.description,
    craftedBy: 'Mystic',
    source: 'race-element-test',
    modelR2Key: r2,
    modelUrl: `${CDN}/${r2}`,
    modelPath: r2,
    runtimePrefab: true,
    prefabSource: 'raceElementStaffs.ts',
    attachmentProfile: 'two_hand',
    attachBone: 'R_hand_container',
    raceKit: { slot: 'staff', variant: def.raceKitStaffVariant },
    abilities: [`${def.element} Bolt`, `${def.school} Nova`],
    signature: `${def.element} Ult`,
    passives: [`${def.school} Mastery`],
    effects: {
      castAura: { variant: def.castAuraVariant, school: def.school, damageType: def.damageType },
      impact: { variant: def.impactVariant, school: def.school, damageType: def.damageType, vfxKey: def.vfxKeys[0] },
      vfxKeys: def.vfxKeys,
      animKey: 'magic_cast',
    },
    assets: {
      mesh: { r2Key: r2, cdnUrl: `${CDN}/${r2}`, localPath: `/models/codex/t1/staffs/${def.stem}.glb` },
      icon: { cdnUrl: def.iconUrl },
      raceKitFallback: `staff_${def.raceKitStaffVariant}`,
    },
    prefab: {
      kind: 'weapon',
      style: 't1_race_element_staff',
      sockets: ['R_hand_container', 'mixamorig:RightHand'],
      attachmentProfile: 'two_hand',
      grudge6Ready: true,
      isIceStaffCanonical: !!def.isIceStaffCanonical,
    },
  };
}

function t0ItemFromDef(def) {
  const uuid = stableUuid('ITEM', def.id);
  const modelUrl = def.modelR2Key ? `${CDN}/${def.modelR2Key}` : null;
  return {
    uuid,
    baseUuid: uuid,
    id: def.id,
    name: def.name,
    baseName: def.name,
    type: 'weapon',
    category: def.category,
    weaponType: def.weaponType,
    subCategory: def.subType === 'bow' || def.subType === 'staff' ? '2h' : '1h',
    tier: 0,
    tierLabel: 'Starter',
    tierColor: '#6b7280',
    stats: def.stats,
    iconUrl: def.iconUrl,
    description: def.description,
    craftedBy: 'Anywhere',
    source: 'starter',
    modelR2Key: def.modelR2Key,
    modelUrl,
    modelPath: def.modelR2Key,
    runtimePrefab: true,
    prefabSource: 't0WeaponVisuals.ts',
    attachmentProfile: def.attachmentProfile,
    attachBone: def.attachBone,
    raceKit: def.raceKit,
    abilities: def.abilities,
    effects: def.effects,
    assets: {
      mesh: def.modelR2Key
        ? { r2Key: def.modelR2Key, cdnUrl: modelUrl }
        : { raceKitOnly: true, slot: def.raceKit?.slot, variant: def.raceKit?.variant },
      icon: { cdnUrl: def.iconUrl },
    },
    prefab: {
      kind: 'weapon',
      style: 't0_starter',
      sockets: [def.attachBone],
      attachmentProfile: def.attachmentProfile,
      grudge6Ready: true,
      visualKind: def.modelR2Key ? 'external_glb' : 'race_kit',
    },
  };
}

function isFrostStaffItem(item) {
  const cat = String(item.category || item.weaponType || '').toLowerCase();
  const name = String(item.name || item.baseName || '').toLowerCase();
  const id = String(item.id || item.uuid || '').toLowerCase();
  if (cat.includes('frost') && (cat.includes('staff') || item.weaponType === 'STAFF')) return true;
  if (name.includes('frostbite') || name.includes('glacial spire') || name.includes('winter grudge')) return true;
  if (name.includes('ice warden') || name.includes('blizzard heart') || name.includes('frozen spite')) return true;
  if (id.includes('frost') && (cat.includes('staff') || item.weaponType === 'STAFF')) return true;
  if (item.element === 'frost' && (item.weaponType === 'STAFF' || cat.includes('staff'))) return true;
  return false;
}

function applyIceStaffMesh(item) {
  if (!isFrostStaffItem(item)) return false;
  item.modelR2Key = ICE_STAFF_R2;
  item.modelUrl = ICE_STAFF_URL;
  item.modelPath = ICE_STAFF_R2;
  item.element = item.element || 'frost';
  item.school = item.school || 'frost';
  item.damageType = item.damageType || 'frost';
  item.runtimePrefab = true;
  item.prefabSource = item.prefabSource || 'ice-staff-canonical';
  item.attachmentProfile = item.attachmentProfile || 'two_hand';
  item.attachBone = item.attachBone || 'R_hand_container';
  // Enrich empty abilities from frost pack
  if (!Array.isArray(item.abilities) || item.abilities.length === 0) {
    item.abilities = [...FROST_ABILITIES_DEFAULT];
  }
  if (!item.signature) item.signature = FROST_SIGNATURE;
  if (!Array.isArray(item.passives) || item.passives.length === 0) {
    item.passives = [...FROST_PASSIVES];
  }
  item.effects = {
    ...(typeof item.effects === 'object' && !Array.isArray(item.effects) ? item.effects : {}),
    castAura: { variant: 'frost', school: 'frost', damageType: 'frost' },
    impact: { variant: 'blue', school: 'frost', damageType: 'frost', vfxKey: 'frost' },
    vfxKeys: ['frost', 'ice', 'freeze', 'chill'],
    animKey: 'magic_cast',
  };
  item.assets = {
    mesh: { r2Key: ICE_STAFF_R2, cdnUrl: ICE_STAFF_URL, aliasOf: 't1_staff_undead_frost' },
    icon: { cdnUrl: item.iconUrl || `${CDN}/icons/pack/weapons/staff_10.png` },
    raceKitFallback: 'staff_C',
  };
  item.prefab = {
    kind: 'weapon',
    style: 'frost_staff_ice_mesh',
    sockets: ['R_hand_container', 'mixamorig:RightHand'],
    attachmentProfile: 'two_hand',
    grudge6Ready: true,
    meshCanonical: ICE_STAFF_R2,
    isIceStaff: true,
  };
  return true;
}

function buildPrefabRecord(item) {
  const modelR2 = item.modelR2Key || item.modelPath || item.assets?.mesh?.r2Key || null;
  const modelUrl =
    item.modelUrl ||
    item.assets?.mesh?.cdnUrl ||
    (modelR2 ? `${CDN}/${String(modelR2).replace(/^\//, '')}` : null);
  const iconUrl = item.iconUrl || item.iconCdnUrl || item.assets?.icon?.cdnUrl || null;

  const effects = [];
  if (item.effect) effects.push(typeof item.effect === 'string' ? item.effect : JSON.stringify(item.effect));
  if (item.buff) effects.push(typeof item.buff === 'string' ? item.buff : JSON.stringify(item.buff));
  if (item.passive) effects.push(`passive: ${item.passive}`);
  if (item.proc) effects.push(`proc: ${item.proc}`);
  if (item.setBonus) effects.push(`set: ${item.setBonus}`);
  if (item.sideEffect) effects.push(item.sideEffect);
  if (Array.isArray(item.effects)) effects.push(...item.effects.map(String));
  if (item.effects && typeof item.effects === 'object' && !Array.isArray(item.effects)) {
    if (item.effects.vfxKeys) effects.push(`vfx: ${item.effects.vfxKeys.join(', ')}`);
    if (item.effects.castAura) effects.push(`castAura: ${item.effects.castAura.variant || item.effects.castAura.school}`);
    if (item.effects.impact) effects.push(`impact: ${item.effects.impact.variant || item.effects.impact.vfxKey}`);
  }
  if (Array.isArray(item.abilities)) effects.push(...item.abilities.map((a) => `ability: ${a}`));
  if (item.signature) effects.push(`signature: ${item.signature}`);
  if (Array.isArray(item.passives)) {
    effects.push(
      ...item.passives.map((p) => `passive: ${typeof p === 'object' ? p.name || JSON.stringify(p) : p}`),
    );
  }

  return {
    uuid: item.uuid || item.id,
    id: item.id || item.uuid,
    name: item.name,
    type: item.type,
    category: item.category,
    tier: item.tier,
    element: item.element || item.school || null,
    prefab: item.prefab || {
      kind: item.type || 'item',
      runtimePrefab: !!item.runtimePrefab,
      prefabSource: item.prefabSource || null,
      attachmentProfile: item.attachmentProfile || null,
      attachBone: item.attachBone || null,
      sockets: item.attachBone ? [item.attachBone] : [],
      grudge6Ready: !!(modelUrl && item.attachmentProfile),
    },
    assets: {
      iconUrl,
      modelUrl,
      modelR2Key: modelR2,
      raceKit: item.raceKit || null,
      ...(item.assets || {}),
    },
    effects,
    effectsRaw: item.effects || null,
    abilities: item.abilities || [],
    signature: item.signature || null,
    passives: item.passives || [],
    stats: item.stats || {},
    recipeUuid: item.recipeUuid || null,
    craftedBy: item.craftedBy || null,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────
const now = new Date().toISOString();
console.log('wire-item-database-prefabs', now);

const masterItems = readJson('master-items.json');
const masterWeapons = readJson('master-weapons.json');
const weaponModels = readJson('weapon-model-game-urls.json');
let staffLooks = null;
try {
  staffLooks = readJson('staff-looks.json');
} catch {
  /* optional */
}

// Build inject list
const injectItems = [
  ...T0_WEAPONS.map(t0ItemFromDef),
  ...RACE_ELEMENT_STAFFS.map(staffItemFromRace),
];

// Index existing
const byId = new Map();
const byUuid = new Map();
for (const it of masterItems.items || []) {
  if (it.id) byId.set(String(it.id), it);
  if (it.uuid) byUuid.set(String(it.uuid), it);
}

let icePatched = 0;
let injected = 0;
let updated = 0;

// Patch frost staves in master-items
for (const it of masterItems.items || []) {
  if (applyIceStaffMesh(it)) icePatched++;
}

// Inject / upsert T0 + T1
for (const fresh of injectItems) {
  const existing = byId.get(fresh.id) || byUuid.get(fresh.uuid);
  if (existing) {
    Object.assign(existing, fresh, { uuid: existing.uuid || fresh.uuid });
    updated++;
  } else {
    masterItems.items.push(fresh);
    byId.set(fresh.id, fresh);
    byUuid.set(fresh.uuid, fresh);
    injected++;
  }
}

// Patch master-weapons frost
let weaponsIce = 0;
for (const w of masterWeapons.items || masterWeapons.weapons || []) {
  if (applyIceStaffMesh(w)) weaponsIce++;
}

// Inject weapons list too
const wList = masterWeapons.items || masterWeapons.weapons || [];
const wById = new Map(wList.map((w) => [String(w.id || w.uuid), w]));
for (const fresh of injectItems) {
  if (!wById.has(fresh.id) && !wById.has(fresh.uuid)) {
    wList.push(fresh);
  }
}
if (masterWeapons.items) masterWeapons.items = wList;
else masterWeapons.weapons = wList;

// Patch weapon-model-game-urls for frost + new prefabs
const mappings = weaponModels.mappings || [];
const mapByUuid = new Map(mappings.map((m) => [m.prefabUuid, m]));

function upsertMapping(item) {
  const uuid = item.uuid;
  if (!uuid) return;
  const r2 = item.modelR2Key || item.modelPath;
  if (!r2) return;
  const entry = {
    prefabUuid: uuid,
    prefabName: item.name,
    weaponType: item.weaponType || 'STAFF',
    category: item.category || '',
    grudgeUUID: mapByUuid.get(uuid)?.grudgeUUID || `GRDG-3D-${crypto.createHash('md5').update(uuid).digest('hex').slice(0, 8).toUpperCase()}`,
    sourcePath: r2,
    gameReadyPath: r2.startsWith('models/') ? r2 : `models/_game-ready/${r2}`,
    modelUrl: item.modelUrl || `${CDN}/${r2}`,
    cdnUrl: item.modelUrl || `${CDN}/${r2}`,
    attachmentProfile: item.attachmentProfile || 'two_hand',
    textureStatus: 'embedded',
    categoryFallback: false,
    iceStaffCanonical: !!item.prefab?.isIceStaff || !!item.prefab?.isIceStaffCanonical,
  };
  if (mapByUuid.has(uuid)) {
    Object.assign(mapByUuid.get(uuid), entry);
  } else {
    mappings.push(entry);
    mapByUuid.set(uuid, entry);
  }
}

// Frost mappings → ice staff mesh
for (const m of mappings) {
  const name = String(m.prefabName || '').toLowerCase();
  const cat = String(m.category || '').toLowerCase();
  if (
    cat.includes('frost') ||
    name.includes('frostbite') ||
    name.includes('glacial') ||
    name.includes('winter grudge') ||
    name.includes('ice warden') ||
    name.includes('blizzard') ||
    name.includes('frozen spite') ||
    name.includes('grave-ice')
  ) {
    // Fix wrong gun mesh on Ice Warden etc.
    m.sourcePath = ICE_STAFF_R2;
    m.gameReadyPath = ICE_STAFF_GAME;
    m.modelUrl = ICE_STAFF_URL;
    m.cdnUrl = ICE_STAFF_URL;
    m.attachmentProfile = 'two_hand';
    m.weaponType = 'STAFF';
    m.iceStaffCanonical = true;
  }
}

for (const fresh of injectItems) upsertMapping(fresh);

// Enrich frost from staff-looks abilities where present
if (staffLooks?.categories?.frostStaves?.items) {
  for (const look of staffLooks.categories.frostStaves.items) {
    const uuid = look.itemUuid;
    const item = byUuid.get(uuid);
    if (!item) continue;
    if (Array.isArray(look.abilities) && look.abilities.length) {
      item.abilities = look.abilities;
    }
    if (look.signatureAbility) item.signature = look.signatureAbility;
    applyIceStaffMesh(item);
  }
}

// Counts
masterItems.totalItems = masterItems.items.length;
masterItems.totalWeapons = masterItems.items.filter((i) => i.type === 'weapon').length;
masterItems.generated = now;
masterItems.iceStaffCanonical = {
  mesh: ICE_STAFF_R2,
  cdnUrl: ICE_STAFF_URL,
  itemId: 't1_staff_undead_frost',
  label: 'Grave-Ice Scepter',
  notes: 'All frost staves + Frostbite family use undead_frost T1 ice staff GLB',
};

if (masterWeapons.total != null) masterWeapons.total = (masterWeapons.items || masterWeapons.weapons || []).length;
masterWeapons.generated = now;

weaponModels.generated = now;
weaponModels.iceStaffCanonical = ICE_STAFF_R2;

// Build master-item-prefabs index (all items with prefab/assets/effects)
const prefabEntries = [];
const prefabByUuid = new Map();
for (const it of masterItems.items) {
  const rec = buildPrefabRecord(it);
  prefabEntries.push(rec);
  if (rec.uuid) prefabByUuid.set(rec.uuid, rec);
}
// Also fold armor-like fields from master if needed later

const prefabDoc = {
  version: '1.1.0',
  generated: now,
  description:
    'Canonical prefab / assets / effects index for GRUDGE_Item_Database — every catalog item should resolve through this.',
  iceStaff: {
    id: 't1_staff_undead_frost',
    name: 'Grave-Ice Scepter',
    r2Key: ICE_STAFF_R2,
    cdnUrl: ICE_STAFF_URL,
    element: 'frost',
    castAura: 'frost',
    impact: 'blue',
    vfxKeys: ['frost', 'ice', 'freeze', 'chill'],
  },
  total: prefabEntries.length,
  entries: prefabEntries,
  byUuid: Object.fromEntries(prefabByUuid),
};

writeJson('master-items.json', masterItems);
writeJson('master-weapons.json', masterWeapons);
writeJson('weapon-model-game-urls.json', weaponModels);
writeJson('master-item-prefabs.json', prefabDoc);

// Compact race+t0 addendum for HTML hot-load
const addendum = {
  version: '1.0.0',
  generated: now,
  iceStaffCanonical: {
    id: 't1_staff_undead_frost',
    name: 'Grave-Ice Scepter',
    r2Key: ICE_STAFF_R2,
    cdnUrl: ICE_STAFF_URL,
  },
  items: injectItems,
};
writeJson('master-t0-t1-addendum.json', addendum);

console.log(
  JSON.stringify(
    {
      icePatchedMasterItems: icePatched,
      icePatchedWeapons: weaponsIce,
      injected,
      updated,
      totalItems: masterItems.items.length,
      prefabEntries: prefabEntries.length,
      mappings: mappings.length,
    },
    null,
    2,
  ),
);
