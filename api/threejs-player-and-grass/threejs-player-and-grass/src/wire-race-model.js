/**
 * Wire module — loaded before script.js so it can set `window.Grudge.race`
 * before the Player constructor runs. It pulls THREE + FBXLoader from the
 * importmap, then kicks off race loading and exposes:
 *
 *   window.Grudge = {
 *     sdk,               // GrudgeModelsSDK instance
 *     client,            // RaceModelClient instance
 *     race,              // Promise<{ root, animations, clips, equipment, ... }>
 *     defaultRaceId,     // e.g. 'human'
 *     switchRace(id),    // Promise — swaps model + anims on the live Player
 *   };
 *
 * Override the default race with <script>window.__GRUDGE_RACE__ = 'orc_classic'</script>
 * before this module loads, or via the URL query ?race=elf.
 */

import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
import { GrudgeModelsSDK } from './GrudgeModelsSDK.js';
import { RaceModelClient } from './RaceModelClient.js';

// Shared LoadingManager so every *.tga reference encountered by FBXLoader / GLTFLoader
// / TextureLoader is routed through TGALoader (threejs-textures skill — "register
// custom handlers on the manager"). Without this, Three.js silently fails to decode
// the Unity Toon_RTS TGA textures and the race models render as black silhouettes.
const manager = new THREE.LoadingManager();
manager.addHandler(/\.tga$/i, new TGALoader());

// Post-process every texture this manager loads: proper color-space + filtering,
// straight from the threejs-textures skill quick-reference.
manager.onLoad = () => { /* all assets done — hook for progress UI if added later */ };
function configureTexture(tex, { isColor = true } = {}) {
  if (!tex) return tex;
  if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

const VALID_RACES = new Set(['human', 'barbarian', 'elf', 'dwarf', 'orc_classic', 'undead']);

function pickDefaultRace() {
  try {
    const q = new URLSearchParams(window.location.search);
    const fromQuery = q.get('race');
    if (fromQuery && VALID_RACES.has(fromQuery)) return fromQuery;
  } catch (_) { /* ignore */ }
  if (typeof window !== 'undefined' && VALID_RACES.has(window.__GRUDGE_RACE__)) {
    return window.__GRUDGE_RACE__;
  }
  return 'human';
}

const defaultRaceId = pickDefaultRace();

const sdk = new GrudgeModelsSDK({
  // Use same-origin fallback by default; once the PR lands, set:
  //   baseUrl: 'https://objectstore.grudge-studio.com'
  manifestPath: '/api/v1/race-models.json',
});

// NOTE: we don't pass `renderer` here — this wire module runs *before*
// script.js creates the WebGLRenderer. script.js calls
// `window.Grudge.client.attachRenderer(renderer)` once the renderer exists,
// which activates KTX2 transcoding without needing a second init pass.
const client = new RaceModelClient({
  THREE,
  FBXLoader,
  GLTFLoader,
  DRACOLoader,
  KTX2Loader,
  manager,
  sdk,
});

// Kick off race load immediately — the Player awaits this.
const racePromise = client.loadRace(defaultRaceId).then((bundle) => {
  // Walk every mesh on the race root and normalize its textures through the
  // threejs-textures + threejs-shaders skill patterns:
  //   * color maps -> SRGBColorSpace
  //   * normal/roughness/metal/AO -> leave default (NoColorSpace)
  //   * enable anisotropy so textures read at glancing angles
  //   * flip .map flipY to match the Unity/FBX convention
  try {
    bundle.root.traverse((o) => {
      if (!o.isMesh && !o.isSkinnedMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        if (m.map)           configureTexture(m.map,          { isColor: true });
        if (m.emissiveMap)   configureTexture(m.emissiveMap,  { isColor: true });
        if (m.normalMap)     configureTexture(m.normalMap,    { isColor: false });
        if (m.roughnessMap)  configureTexture(m.roughnessMap, { isColor: false });
        if (m.metalnessMap)  configureTexture(m.metalnessMap, { isColor: false });
        if (m.aoMap)         configureTexture(m.aoMap,        { isColor: false });
        if (m.alphaMap)      configureTexture(m.alphaMap,     { isColor: false });
        // FBX/Unity baked textures default to black when no lights hit the backface;
        // rendering both sides fixes the "silhouette" look on flat equipment planes.
        m.side = THREE.DoubleSide;
        m.transparent = !!m.alphaMap || m.transparent;
        m.needsUpdate = true;
      });
    });
  } catch (err) {
    console.warn('[Grudge] texture normalization failed:', err);
  }
  // Equip a sensible default loadout so the naked rig isn't shown.
  try {
    const eq = bundle.equipment;
    if (eq) {
      ['body', 'arms', 'legs', 'head', 'shoulders'].forEach((slot) => eq.equipFirst(slot));
      // Pick a weapon from the race's allowed list if any variants are present.
      for (const slot of (bundle.race?.allowedWeapons || [])) {
        if (eq.catalog[slot] && eq.catalog[slot].length) { eq.equipFirst(slot); break; }
      }
      if (eq.catalog.shield?.length) eq.equipFirst('shield');
    }
  } catch (err) {
    console.warn('[Grudge] default loadout failed:', err);
  }
  return bundle;
}).catch((err) => {
  console.warn('[Grudge] race preload failed:', err);
  throw err;
});

// Swap the currently mounted race at runtime (re-mounts on the existing Player).
async function switchRace(raceId, opts = {}) {
  if (!VALID_RACES.has(raceId)) throw new Error(`Unknown race: ${raceId}`);
  const player = window.GrudgePlayer;
  if (!player || typeof player._mountModel !== 'function') {
    throw new Error('Player not ready yet');
  }
  const bundle = await client.loadRace(raceId, opts);
  // Remove previous model from Player.group (everything except the placeholder box).
  for (let i = player.group.children.length - 1; i >= 0; i--) {
    const c = player.group.children[i];
    if (c.isSkinnedMesh || c.isMesh || c.isGroup || c.isObject3D) player.group.remove(c);
  }
  player.actions = {};
  player.currentAction = null;
  player.mixer = null;
  player.equipment = bundle.equipment;
  player.boneContainers = bundle.boneContainers;
  player._mountModel(bundle.root, bundle.animations, bundle.clips);
  return bundle;
}

if (typeof window !== 'undefined') {
  window.Grudge = Object.assign(window.Grudge || {}, {
    sdk,
    client,
    race: racePromise,
    defaultRaceId,
    switchRace,
    THREE,
    FBXLoader,
    GLTFLoader,
    TGALoader,
    manager,
    configureTexture,
  });
}

export { sdk, client, racePromise as race, defaultRaceId, switchRace };
