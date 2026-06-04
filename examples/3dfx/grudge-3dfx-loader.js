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

/** @type {string} ObjectStore CDN base URL */
export const OBJECTSTORE_BASE = 'https://objectstore.grudge-studio.com';

/**
 * @typedef {Object} Grudge3DFXResult
 * @property {Record<string, object>} effects  - All effects keyed by ID
 * @property {Record<string, object>} categories - Category metadata
 * @property {Record<string, string>} uuids    - ID → GRDG-3DFX-* UUID map
 * @property {string}                 version  - Registry version
 * @property {number}                 effectCount
 * @property {number}                 spellCount
 * @property {number}                 uuidCount
 * @property {(uuid: string) => object|null} byUUID - Lookup effect by Grudge UUID
 */

/**
 * Load the full 3DFX registry including effects, spells, and UUIDs.
 * @returns {Promise<Grudge3DFXResult>}
 */
export async function loadGrudge3DFX() {
  const [reg, spells, uuidData] = await Promise.all([
    fetch(`${OBJECTSTORE_BASE}/api/v1/3dfx-registry.json`).then(r => r.json()).catch(() => null),
    fetch(`${OBJECTSTORE_BASE}/api/v1/vfx-spells.json`).then(r => r.json()).catch(() => null),
    fetch(`${OBJECTSTORE_BASE}/api/v1/3dfx-uuids.json`).then(r => r.json()).catch(() => null)
  ]);
  const effects = { ...(reg?.effects || {}) };
  if (spells?.spells) Object.assign(effects, spells.spells);
  const uuids = uuidData?.uuids || {};

  // Build reverse map: UUID → effect ID
  const reverseUUID = {};
  for (const [id, uuid] of Object.entries(uuids)) reverseUUID[uuid] = id;

  return {
    effects,
    categories: { ...(reg?.categories || {}), ...(spells?.categories || {}) },
    uuids,
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
      return id ? effects[id] || null : null;
    }
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
