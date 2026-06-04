/**
 * Grudge Game Data Hub — ObjectStore API
 *
 * Canonical URL builders for all Grudge assets on Cloudflare R2.
 * Every game client should import from here instead of hardcoding CDN paths.
 *
 * Usage:
 *   import { getRaceCharacterUrl, getRaceManifest } from '../lib/objectstore-api.js';
 *   const url = getRaceCharacterUrl('orc');
 *   // → https://assets.grudge-studio.com/asset-packs/toon-rts-characters/glb/characters/orc.glb
 */

const CDN = 'https://assets.grudge-studio.com';
const PACK_BASE = `${CDN}/asset-packs/toon-rts-characters`;

// ═══════════════════════════════════════════════════════════════════
// Race Character Models (pre-baked GLBs, textures baked in, ~955KB)
// ═══════════════════════════════════════════════════════════════════

const RACES = ['human', 'orc', 'elf', 'dwarf', 'undead', 'barbarian'];

const RACE_META = {
  human:     { name: 'Human',     displayName: 'Western Kingdoms', prefix: 'WK_',  faction: 'crusade', factionColor: '#c9a04e', mountType: 'horse' },
  orc:       { name: 'Orc',       displayName: 'Orcs',             prefix: 'ORC_', faction: 'legion',  factionColor: '#8b2020', mountType: 'wolf' },
  elf:       { name: 'Elf',       displayName: 'Elves',            prefix: 'ELF_', faction: 'fabled',  factionColor: '#7ec8e3', mountType: 'stag' },
  dwarf:     { name: 'Dwarf',     displayName: 'Dwarves',          prefix: 'DWF_', faction: 'fabled',  factionColor: '#7ec8e3', mountType: 'boar' },
  undead:    { name: 'Undead',     displayName: 'Undead',           prefix: 'UD_',  faction: 'legion',  factionColor: '#8b2020', mountType: 'skeletal_horse' },
  barbarian: { name: 'Barbarian',  displayName: 'Barbarians',       prefix: 'BRB_', faction: 'crusade', factionColor: '#c9a04e', mountType: 'warhorse' },
};

/**
 * Get the pre-baked GLB URL for a race character (textures baked in).
 * @param {string} race - One of: human, orc, elf, dwarf, undead, barbarian
 * @returns {string} Full CDN URL to the .glb file
 */
export function getRaceCharacterUrl(race) {
  return `${PACK_BASE}/glb/characters/${race.toLowerCase()}.glb`;
}

/**
 * Get the GLB URL for a race's cavalry/mounted unit.
 * @param {string} race
 * @returns {string}
 */
export function getRaceCavalryUrl(race) {
  return `${PACK_BASE}/glb/cavalry/${race.toLowerCase()}.glb`;
}

/**
 * Get the GLB URL for a race's siege unit (human/orc catapult, elf bolt thrower).
 * @param {string} race
 * @returns {string|null} null if the race has no siege unit
 */
export function getRaceSiegeUrl(race) {
  const hasSiege = ['human', 'orc', 'elf'];
  if (!hasSiege.includes(race.toLowerCase())) return null;
  return `${PACK_BASE}/glb/siege/${race.toLowerCase()}.glb`;
}

/**
 * Get metadata for a race (name, faction, prefix, mount type, etc.)
 * @param {string} race
 * @returns {object|null}
 */
export function getRaceMeta(race) {
  return RACE_META[race.toLowerCase()] || null;
}

/**
 * Get all available race IDs.
 * @returns {string[]}
 */
export function getRaceIds() {
  return [...RACES];
}

/**
 * Get all race metadata objects.
 * @returns {object[]}
 */
export function getAllRaces() {
  return RACES.map(id => ({ id, ...RACE_META[id] }));
}

// ═══════════════════════════════════════════════════════════════════
// Race Pack Manifest (full customizable FBX data, equipment slots)
// ═══════════════════════════════════════════════════════════════════

let _manifestCache = null;

/**
 * Fetch the full toon-rts-characters manifest from CDN.
 * Cached after first call.
 * @returns {Promise<object|null>}
 */
export async function getRaceManifest() {
  if (_manifestCache) return _manifestCache;
  try {
    const res = await fetch(`${PACK_BASE}/manifest.json`);
    if (!res.ok) return null;
    _manifestCache = await res.json();
    return _manifestCache;
  } catch { return null; }
}

/**
 * Get equipment slot definitions from the manifest.
 * @returns {Promise<object|null>}
 */
export async function getEquipmentSlots() {
  const m = await getRaceManifest();
  return m?.meta?.sharedEquipmentSlots || null;
}

/**
 * Get bone container mappings for attaching weapons/shields.
 * @returns {Promise<object|null>}
 */
export async function getBoneContainers() {
  const m = await getRaceManifest();
  return m?.meta?.boneContainers || null;
}

/**
 * Get animation pack info (shared across all races).
 * @returns {Promise<object|null>}
 */
export async function getAnimationPacks() {
  const m = await getRaceManifest();
  return m?.animationPacks?.packs || null;
}

/**
 * Get race-specific data from the manifest (models, textures, extra weapons, animations).
 * @param {string} race
 * @returns {Promise<object|null>}
 */
export async function getRaceData(race) {
  const m = await getRaceManifest();
  return m?.races?.[race.toLowerCase()] || null;
}

// ═══════════════════════════════════════════════════════════════════
// Generic Asset URL Builders
// ═══════════════════════════════════════════════════════════════════

/**
 * Build a CDN URL for any asset path on R2.
 * @param {string} path - Relative path within the R2 bucket
 * @returns {string}
 */
export function assetUrl(path) {
  return `${CDN}/${path.replace(/^\//, '')}`;
}

/** Icon URL builder */
export function iconUrl(path) {
  return `${CDN}/icons/${path}`;
}

/** Icon pack URL builder */
export function packIconUrl(path) {
  return `${CDN}/icons/pack/${path}`;
}

/** 3D model URL builder */
export function modelUrl(path) {
  return `${CDN}/models/${path}`;
}

/** 3D VFX texture URL builder */
export function effectUrl(path) {
  return `${CDN}/effects/${path}`;
}

/** Shader URL builder */
export function shaderUrl(path) {
  return `${CDN}/api/v1/shader-lab/${path}`;
}

/** Animation URL builder (shared Mixamo packs) */
export function animationUrl(pack, clip) {
  return `${CDN}/animations/weapons/${pack}/${clip}`;
}

/** Audio URL builder */
export function audioUrl(path) {
  return `${CDN}/audio/${path}`;
}

/** Background/skybox URL builder */
export function backgroundUrl(path) {
  return `${CDN}/backgrounds/${path}`;
}

/** Sprite URL builder (2D character/NPC sprites) */
export function spriteUrl(path) {
  return `${CDN}/sprites/${path}`;
}

/** Texture URL builder (terrain, materials) */
export function textureUrl(path) {
  return `${CDN}/textures/${path}`;
}

/** UI asset URL builder */
export function uiUrl(path) {
  return `${CDN}/ui/${path}`;
}

// ═══════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// Fallback-Aware Asset Loader
// ═══════════════════════════════════════════════════════════════════

const GH_PAGES = 'https://molochdagod.github.io/ObjectStore';

/**
 * Load an asset URL with CDN-first, GitHub Pages fallback.
 * The CDN Worker auto-backfills on miss, but if the asset hasn't been
 * accessed yet it may 404 on CDN. This helper tries CDN first,
 * falls back to GH Pages.
 * @param {string} path - Relative path (e.g. 'icons/pack/weapons/Hammer_01.png')
 * @returns {Promise<string|null>} The first URL that returns 200, or null
 */
export async function resolveAssetUrl(path) {
  const cleanPath = path.replace(/^\//, '');
  const urls = [
    `${CDN}/${cleanPath}`,
    `${GH_PAGES}/${cleanPath}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return url;
    } catch { continue; }
  }
  return null;
}

/**
 * Warm the CDN cache for an asset by fetching it (triggers auto-backfill
 * from GitHub Pages if the asset exists there but not yet on R2).
 * @param {string} path
 * @returns {Promise<boolean>} true if the asset is now available on CDN
 */
export async function warmCdnAsset(path) {
  const cleanPath = path.replace(/^\//, '');
  try {
    const res = await fetch(`${CDN}/${cleanPath}`, { method: 'HEAD' });
    return res.ok;
  } catch { return false; }
}

/**
 * Batch-warm multiple asset paths on the CDN.
 * @param {string[]} paths
 * @returns {Promise<{ok: string[], missing: string[]}>}
 */
export async function warmCdnBatch(paths) {
  const results = await Promise.allSettled(
    paths.map(async p => {
      const ok = await warmCdnAsset(p);
      return { path: p, ok };
    })
  );
  const ok = [], missing = [];
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value.ok) ok.push(r.value.path);
    else missing.push(r.value?.path || 'unknown');
  });
  return { ok, missing };
}

// ═══════════════════════════════════════════════════════════════════
// R2 Availability Map (known state from audit)
// ═══════════════════════════════════════════════════════════════════

export const R2_STATUS = {
  characters: { available: ['human','orc','elf','dwarf','undead','barbarian'], missing: [] },
  cavalry:    { available: [], missing: ['human','orc','elf','dwarf','undead','barbarian'] },
  siege:      { available: [], missing: ['human','orc','elf'] },
  icons: {
    onR2: ['icons/pack/weapons/Sword_01.png','icons/pack/weapons/Axe_01.png','icons/pack/weapons/Dagger_01.png',
           'icons/weapons/bloodfeud-blade.png','icons/consumables/health_potion.png',
           'icons/consumables/mana_potion.png','icons/consumables/food_steak_cooked.png',
           'icons/wcs/weapons/Sword_01.png','icons/pack/misc/Burns.png'],
    ghOnly: ['icons/pack/weapons/Hammer_01.png','icons/pack/weapons/Bow_01.png',
             'icons/pack/weapons/Crossbow_01.png','icons/pack/weapons/Spear_01.png',
             'icons/pack/weapons/Sword_02.png','icons/pack/misc/Effect.png',
             'css/tier-system.css','sdk/grudge-sdk.js'],
    nowhere: ['icons/pack/weapons/Staff_01.png','icons/pack/weapons/Shield_01.png',
              'icons/materials/iron_ingot.png','icons/wcs/attributes/strength.png'],
    caseFixNeeded: { 'icons/pack/weapons/Shield_01.png': 'icons/pack/weapons/shield_01.png' },
  },
};

/**
 * Check if a race's cavalry GLB is available on R2.
 */
export function isCavalryAvailable(race) {
  return R2_STATUS.cavalry.available.includes(race.toLowerCase());
}

/**
 * Check if a race's siege GLB is available on R2.
 */
export function isSiegeAvailable(race) {
  return R2_STATUS.siege.available.includes(race.toLowerCase());
}

export { CDN, PACK_BASE, RACES, RACE_META, GH_PAGES };
