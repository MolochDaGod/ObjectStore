/**
 * RaceModelClient
 *
 * Minimal Three.js race-model loader for the Grudge MMO race kits.
 * Resolves a race manifest (GrudgeModelsSDK), loads the FBX/GLB model plus
 * its animation pack, and returns a ready-to-mount object for the Player.
 *
 * The existing `script.js` bundle already owns a THREE instance; we can't
 * import 'three' from here without duplicating it. So this module is
 * written to be passed a THREE namespace + FBXLoader + GLTFLoader at
 * construction time by whatever entry script wires it in. It then attaches
 * itself to `window.RaceModelClient` for the bundled Player to consume.
 *
 *   import { RaceModelClient } from './RaceModelClient.js';
 *   const client = new RaceModelClient({ THREE, FBXLoader, GLTFLoader });
 *   const { root, animations, clips, race, equipment } = await client.loadRace('human');
 *   mixer = new THREE.AnimationMixer(root);
 *   mixer.clipAction(clips.idle).play();
 *
 * `clips` maps the logical state names in the manifest (idle/walk/run/
 * attack/heavy/jump/sneak/block/death) to actual AnimationClip objects
 * from the animation pack.
 */

import { GrudgeModelsSDK } from './GrudgeModelsSDK.js';

const MANIFEST_LS_KEY = 'grudge.raceManifest.v1';
const MANIFEST_TTL_MS = 10 * 60 * 1000;

// ─── small utilities ───────────────────────────────────────────────────────

function norm(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\|/g, ' ')
    .replace(/mixamo[_.]?com/g, '')
    .replace(/[\s_\-.()]+/g, ' ')
    .trim();
}

function findClip(animations, target) {
  if (!animations?.length || !target) return null;
  const t = norm(target);
  // 1) exact normalized match
  let hit = animations.find(c => norm(c.name) === t);
  if (hit) return hit;
  // 2) normalized contains target
  hit = animations.find(c => norm(c.name).includes(t));
  if (hit) return hit;
  // 3) target contains normalized clip name (handles long mixamo names)
  hit = animations.find(c => t.includes(norm(c.name)));
  return hit || null;
}

function mapClips(animations, clipNameMap) {
  const out = {};
  for (const [state, target] of Object.entries(clipNameMap || {})) {
    const clip = findClip(animations, target);
    if (clip) out[state] = clip;
  }
  // Safety fallback: if 'idle' is missing, pick the first clip.
  if (!out.idle && animations?.length) out.idle = animations[0];
  return out;
}

// ─── EquipmentManager ──────────────────────────────────────────────────────

export class EquipmentManager {
  /**
   * @param {THREE.Object3D} root — the loaded race root (armature or Group).
   * @param {string} prefix — race prefix, e.g. 'WK_' — stripped from child names
   *                          before matching `slotPatterns`.
   * @param {Record<string,string|string[]>} slotPatterns — regex strings keyed by slot.
   */
  constructor(root, prefix, slotPatterns) {
    this.root = root;
    this.prefix = prefix || '';
    this.patterns = {};
    for (const [slot, src] of Object.entries(slotPatterns || {})) {
      const list = Array.isArray(src) ? src : String(src).split('|');
      this.patterns[slot] = list.map(s => new RegExp(s, 'i'));
    }
    // Catalog of all equipment-eligible children, grouped by slot.
    this.catalog = this._buildCatalog();
    this.currentBySlot = {};
    // Start hidden so the base rig shows alone; caller can `equip()` later.
    this._hideAll();
  }

  _buildCatalog() {
    const catalog = {};
    for (const slot of Object.keys(this.patterns)) catalog[slot] = [];
    this.root.traverse(obj => {
      if (!obj.name) return;
      const stripped = this.prefix && obj.name.startsWith(this.prefix)
        ? obj.name.slice(this.prefix.length)
        : obj.name;
      for (const [slot, regs] of Object.entries(this.patterns)) {
        if (regs.some(r => r.test(stripped))) {
          catalog[slot].push(obj);
          return; // first-matching slot wins
        }
      }
    });
    return catalog;
  }

  _hideAll() {
    for (const list of Object.values(this.catalog)) {
      for (const obj of list) obj.visible = false;
    }
  }

  listVariants(slot) {
    return (this.catalog[slot] || []).map(o => o.name);
  }

  listSlots() {
    return Object.keys(this.catalog);
  }

  /**
   * Equip a specific variant by name (e.g. 'WK_Units_Body_A' or 'Units_Body_A').
   * Pass `null` to unequip. Returns the variant that became visible, or null.
   */
  equip(slot, variantName) {
    const list = this.catalog[slot];
    if (!list) return null;
    // Hide all first
    for (const obj of list) obj.visible = false;
    if (!variantName) {
      this.currentBySlot[slot] = null;
      return null;
    }
    const target = list.find(o => o.name === variantName)
               || list.find(o => o.name.endsWith(variantName));
    if (target) {
      target.visible = true;
      this.currentBySlot[slot] = target.name;
      return target;
    }
    return null;
  }

  /** Equip the first variant in the slot (handy for quick smoke tests). */
  equipFirst(slot) {
    const list = this.catalog[slot] || [];
    return list[0] ? this.equip(slot, list[0].name) : null;
  }

  /** Bulk apply: `{ body: 'Units_Body_A', sword: 'Units_sword_B', ... }` */
  applyLoadout(loadout) {
    for (const [slot, variant] of Object.entries(loadout || {})) {
      this.equip(slot, variant);
    }
  }
}

// ─── RaceModelClient ───────────────────────────────────────────────────────

export class RaceModelClient {
  /**
   * @param {object} deps
   * @param {*} deps.THREE
   * @param {*} deps.FBXLoader
   * @param {*} [deps.GLTFLoader]
   * @param {*} [deps.DRACOLoader]
   * @param {*} [deps.KTX2Loader]
   * @param {*} [deps.MeshoptDecoder]
   * @param {*} [deps.renderer] — needed by KTX2Loader.detectSupport
   * @param {GrudgeModelsSDK} [deps.sdk]
   */
  constructor(deps) {
    if (!deps || !deps.THREE) throw new Error('RaceModelClient: THREE is required');
    this.THREE = deps.THREE;
    this.FBXLoader = deps.FBXLoader || null;
    this.GLTFLoader = deps.GLTFLoader || null;
    this.DRACOLoader = deps.DRACOLoader || null;
    this.KTX2Loader  = deps.KTX2Loader  || null;
    this.MeshoptDecoder = deps.MeshoptDecoder || null;
    this.sdk = deps.sdk || new GrudgeModelsSDK();
    // Shared LoadingManager (from wire-race-model.js) — has .tga handler registered.
    this.manager = deps.manager || new deps.THREE.LoadingManager();

    // GLTF pipeline (optional — only used for GLB race models/packs if added later).
    if (this.GLTFLoader) {
      this.gltf = new this.GLTFLoader(this.manager);
      if (this.DRACOLoader) {
        const draco = new this.DRACOLoader();
        draco.setDecoderPath?.('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
        this.gltf.setDRACOLoader?.(draco);
      }
      if (this.MeshoptDecoder) this.gltf.setMeshoptDecoder?.(this.MeshoptDecoder);
    } else {
      this.gltf = null;
    }

    if (this.FBXLoader) this.fbx = new this.FBXLoader(this.manager);

    // Attach renderer for KTX2 if we already have one (unusual — wire module
    // runs *before* the bundled renderer exists, so this is typically deferred
    // to .attachRenderer() once main.js has constructed the renderer).
    if (deps.renderer) this.attachRenderer(deps.renderer);

    this._assetCache = new Map(); // url -> Promise<{ root, animations }>
    this._manifestMem = null;
  }

  /**
   * Deferred KTX2 support detection. Safe to call once the WebGLRenderer is
   * available; no-op if KTX2Loader or GLTFLoader weren't supplied.
   */
  attachRenderer(renderer) {
    this.renderer = renderer;
    if (!renderer || !this.gltf || !this.KTX2Loader) return;
    if (this._ktx2Attached) return;
    const ktx2 = new this.KTX2Loader(this.manager);
    ktx2.setTranscoderPath?.('https://unpkg.com/three@0.182.0/examples/jsm/libs/basis/');
    ktx2.detectSupport?.(renderer);
    this.gltf.setKTX2Loader?.(ktx2);
    this._ktx2Attached = true;
  }

  // ─── Manifest (SWR) ──────────────────────────────────────────────────────

  async getManifest() {
    if (this._manifestMem) return this._manifestMem;
    // Hot path: localStorage SWR so reloads cost 0 network.
    let cached = null;
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(MANIFEST_LS_KEY) : null;
      if (raw) cached = JSON.parse(raw);
    } catch (_) { /* ignore */ }

    const fresh = cached && Date.now() - cached.at < MANIFEST_TTL_MS;
    const revalidate = this.sdk.getRaceModels().then(data => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(MANIFEST_LS_KEY, JSON.stringify({ at: Date.now(), data }));
        }
      } catch (_) { /* quota/ssr — ignore */ }
      this._manifestMem = data;
      return data;
    }).catch(err => {
      if (cached) return cached.data;
      throw err;
    });

    if (fresh) {
      this._manifestMem = cached.data;
      // still revalidate in the background
      revalidate.catch(() => {});
      return cached.data;
    }
    return revalidate;
  }

  // ─── Primitive loaders ───────────────────────────────────────────────────

  async _load(url, format) {
    if (this._assetCache.has(url)) return this._assetCache.get(url);
    const p = this._loadRaw(url, format);
    this._assetCache.set(url, p);
    return p;
  }

  async _loadRaw(url, format) {
    if (format === 'fbx') {
      if (!this.fbx) throw new Error('FBXLoader was not supplied to RaceModelClient');
      const root = await this.fbx.loadAsync(url);
      // FBXLoader returns a Group with .animations
      return { root, animations: root.animations || [] };
    }
    if (format === 'gltf' || format === 'glb') {
      if (!this.gltf) throw new Error('GLTFLoader was not supplied to RaceModelClient');
      const gltf = await this.gltf.loadAsync(url);
      return { root: gltf.scene, animations: gltf.animations || [] };
    }
    throw new Error(`Unsupported model format: ${format}`);
  }

  // ─── High-level race loading ─────────────────────────────────────────────

  /**
   * Load a race model + its animation pack and return a ready-to-mount bundle.
   * @param {string} raceId — one of 'human' | 'barbarian' | 'elf' | 'dwarf' |
   *                          'orc_classic' | 'undead'
   * @param {object} [opts]
   * @param {string} [opts.animPackId] — override the race's defaultAnimPack
   */
  async loadRace(raceId, opts = {}) {
    const manifest = await this.getManifest();
    const race = manifest.races?.[raceId];
    if (!race) throw new Error(`RaceModelClient: unknown race '${raceId}'`);

    const modelUrl = this.sdk.getAssetUrl(race.model, manifest);
    const { root } = await this._load(modelUrl, race.format);

    // Apply scale + yOffset once.
    if (race.scale) root.scale.setScalar(race.scale);
    if (race.yOffset) root.position.y += race.yOffset;

    // Animation pack (may be shared across races).
    const packId = opts.animPackId || race.defaultAnimPack;
    let pack = null;
    let animations = [];
    let clips = {};
    if (packId && manifest.animationPacks?.[packId]) {
      pack = manifest.animationPacks[packId];
      if (pack.clipFiles && typeof pack.clipFiles === 'object') {
        // New shape: one FBX per logical state. Load in parallel, then take
        // each file's first AnimationClip and rename it to the state key so
        // the Player's clip-name heuristics still work.
        const base = (pack.clipFilesBase || '').replace(/\/$/, '');
        const format = pack.format || 'fbx';
        const entries = Object.entries(pack.clipFiles);
        const loaded = await Promise.all(entries.map(async ([state, file]) => {
          const rel = base ? `${base}/${file}` : file;
          const url = this.sdk.getAssetUrl(rel, manifest);
          try {
            const { animations: anims } = await this._load(url, format);
            const clip = anims && anims[0];
            if (!clip) return null;
            // Clone + rename so separate-state clips don't collide.
            const renamed = clip.clone();
            renamed.name = state;
            return { state, clip: renamed };
          } catch (err) {
            console.warn(`[Grudge] anim load failed for '${state}' (${url}):`, err);
            return null;
          }
        }));
        for (const e of loaded) {
          if (!e) continue;
          clips[e.state] = e.clip;
          animations.push(e.clip);
        }
      } else if (pack.path) {
        // Legacy: single FBX with multiple clips inside.
        const packUrl = this.sdk.getAssetUrl(pack.path, manifest);
        const packed = await this._load(packUrl, pack.format);
        animations = packed.animations;
        clips = mapClips(animations, pack.clips);
      }
    }

    const equipment = new EquipmentManager(
      root,
      race.prefix,
      manifest.slotPatterns,
    );

    return {
      race,
      pack,
      root,
      animations,
      clips,
      equipment,
      boneContainers: manifest.boneContainers,
    };
  }

  /** Resolve a bone container on the loaded race root, by logical key. */
  findBone(root, containerKey, manifest) {
    const name = manifest?.boneContainers?.[containerKey];
    if (!name) return null;
    let found = null;
    root.traverse(o => { if (!found && o.name === name) found = o; });
    return found;
  }
}

export default RaceModelClient;
