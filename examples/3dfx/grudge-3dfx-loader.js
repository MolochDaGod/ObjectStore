/**
 * Grudge 3DFX Loader — tiny helper for any Three.js project.
 *
 * Usage:
 *   import { loadGrudge3DFX } from 'https://objectstore.grudge-studio.com/examples/3dfx/grudge-3dfx-loader.js';
 *   const fx = await loadGrudge3DFX();
 *   const def = fx.effects['fire_slash'];
 *
 * All registry data is served by the ObjectStore static API:
 *   https://objectstore.grudge-studio.com/api/v1/3dfx-registry.json
 *   https://objectstore.grudge-studio.com/api/v1/vfx-spells.json
 *   https://objectstore.grudge-studio.com/api/v1/3dfx-examples.json
 */
export const OBJECTSTORE_BASE = 'https://objectstore.grudge-studio.com';

export async function loadGrudge3DFX() {
  const [reg, spells] = await Promise.all([
    fetch(`${OBJECTSTORE_BASE}/api/v1/3dfx-registry.json`).then(r => r.json()).catch(() => null),
    fetch(`${OBJECTSTORE_BASE}/api/v1/vfx-spells.json`).then(r => r.json()).catch(() => null)
  ]);
  const effects = { ...(reg?.effects || {}) };
  if (spells?.spells) Object.assign(effects, spells.spells);
  return {
    effects,
    categories: { ...(reg?.categories || {}), ...(spells?.categories || {}) },
    version: reg?.version,
    spellCount: spells ? Object.keys(spells.spells || {}).length : 0,
    effectCount: Object.keys(effects).length
  };
}

export async function loadGrudge3DFXExamples() {
  return fetch(`${OBJECTSTORE_BASE}/api/v1/3dfx-examples.json`).then(r => r.json());
}
