/**
 * Grudge 3DFX Loader — UUID-aware SDK for any Three.js or Babylon.js project.
 *
 * Usage:
 *   import { loadGrudge3DFX, loadEffectByUUID } from 'https://objectstore.grudge-studio.com/examples/3dfx/grudge-3dfx-loader.js';
 *
 *   // Load full library
 *   const fx = await loadGrudge3DFX();
 *   const def = fx.effects['fire_slash'];
 *   const sameDef = fx.byUUID('GRDG-3DFX-7BD0A8E1'); // lookup by Grudge UUID
 *
 *   // Or load a single effect by UUID
 *   const effect = await loadEffectByUUID('GRDG-3DFX-7BD0A8E1');
 *
 * All registry data is served by the ObjectStore static API:
 *   https://objectstore.grudge-studio.com/api/v1/3dfx-registry.json
 *   https://objectstore.grudge-studio.com/api/v1/vfx-spells.json
 *   https://objectstore.grudge-studio.com/api/v1/3dfx-uuids.json
 *   https://objectstore.grudge-studio.com/api/v1/3dfx-examples.json
 */

/** @type {string} Canonical info/ObjectStore base (info is preferred; objectstore often 404) */
export const OBJECTSTORE_BASE = 'https://info.grudge-studio.com';
export const CDN_BASE = 'https://assets.grudge-studio.com';

const BASES = [
  'https://info.grudge-studio.com',
  'https://objectstore.grudge-studio.com',
  typeof location !== 'undefined' ? location.origin : '',
].filter(Boolean);

async function fetchFirstJson(path) {
  let lastErr;
  for (const base of BASES) {
    try {
      const r = await fetch(`${base}${path}`);
      if (r.ok) return await r.json();
      lastErr = new Error(`${base}${path} → ${r.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`Failed ${path}`);
}

/**
 * @typedef {Object} Grudge3DFXResult
 * @property {Record<string, object>} effects  - All effects keyed by ID
 * @property {Record<string, object>} categories - Category metadata
 * @property {Record<string, string>} uuids    - ID → GRDG-3DFX-* UUID map
 * @property {object[]}               productionGlb - R2 production meshes
 * @property {string}                 version  - Registry version
 * @property {number}                 effectCount
 * @property {number}                 spellCount
 * @property {number}                 uuidCount
 * @property {(uuid: string) => object|null} byUUID - Lookup effect by Grudge UUID
 * @property {(effectId: string) => object|null} glbForEffect - Production GLB for effect id
 */

/**
 * Load the full 3DFX registry including effects, spells, UUIDs, and production GLBs.
 * @returns {Promise<Grudge3DFXResult>}
 */
export async function loadGrudge3DFX() {
  const [reg, spells, uuidData, glbPack] = await Promise.all([
    fetchFirstJson('/api/v1/3dfx-registry.json').catch(() => null),
    fetchFirstJson('/api/v1/vfx-spells.json').catch(() => null),
    fetchFirstJson('/api/v1/3dfx-uuids.json').catch(() => null),
    fetchFirstJson('/api/v1/vfx-production-glb.json').catch(() => null),
  ]);
  const effects = { ...(reg?.effects || {}) };
  if (spells?.spells) Object.assign(effects, spells.spells);
  const uuids = uuidData?.uuids || {};
  const productionGlb = glbPack?.meshes || [];

  // Build reverse map: UUID → effect ID
  const reverseUUID = {};
  for (const [id, uuid] of Object.entries(uuids)) reverseUUID[uuid] = id;
  for (const m of productionGlb) {
    if (m.grudgeUuid) reverseUUID[m.grudgeUuid] = m.id;
  }

  const effectToGlb = new Map();
  for (const m of productionGlb) {
    for (const eid of m.effectIds || []) effectToGlb.set(eid, m);
  }

  return {
    effects,
    categories: { ...(reg?.categories || {}), ...(spells?.categories || {}) },
    uuids,
    productionGlb,
    cdnBase: glbPack?.cdnBase || CDN_BASE,
    version: reg?.version,
    spellCount: spells ? Object.keys(spells.spells || {}).length : 0,
    effectCount: Object.keys(effects).length,
    uuidCount: Object.keys(uuids).length,
    /**
     * Look up an effect definition by its Grudge UUID.
     * @param {string} uuid - e.g. 'GRDG-3DFX-7BD0A8E1'
     * @returns {object|null} The effect definition, or null
     */
    byUUID(uuid) {
      const id = reverseUUID[uuid];
      if (!id) return null;
      return effects[id] || productionGlb.find((m) => m.id === id) || null;
    },
    glbForEffect(effectId) {
      return effectToGlb.get(effectId) || null;
    },
    glbUrl(mesh) {
      if (!mesh?.path) return null;
      return `${glbPack?.cdnBase || CDN_BASE}/${String(mesh.path).replace(/^\//, '')}`;
    },
  };
}

/**
 * Load a single effect by its Grudge UUID.
 * @param {string} uuid - e.g. 'GRDG-3DFX-7BD0A8E1'
 * @returns {Promise<object|null>} The effect definition, or null if not found
 */
export async function loadEffectByUUID(uuid) {
  const fx = await loadGrudge3DFX();
  return fx.byUUID(uuid);
}

/**
 * Load the downloadable examples registry.
 * @returns {Promise<object>}
 */
export async function loadGrudge3DFXExamples() {
  return fetch(`${OBJECTSTORE_BASE}/api/v1/3dfx-examples.json`).then(r => r.json());
}
