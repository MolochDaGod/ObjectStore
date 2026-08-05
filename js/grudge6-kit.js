/**
 * @grudge-studio/grudge6-kit (ObjectStore js/)
 *
 * Shared modular race kit loader + equipment for Grudge games / browse.
 *
 * TWO surfaces (do not invent a third):
 *  A) Production monolith kits on CDN — FBX/GLB Characters for paperdoll/cinema
 *  B) Editable Toon RTS split tree (infantry/cavalry/siege) — SSOT catalog:
 *     api/v1/grudge6-toon-rts-ssot.json  ← built from Asset-Rig-Editor public/assets
 *
 * Usage:
 *   import { RACE_ASSETS, loadRaceKit, EquipmentManager, bindRaceAtlas,
 *            toonRtsUnitUrl, TOON_RTS_HEIGHT_M } from './grudge6-kit.js';
 *   const { root, equip } = await loadRaceKit(THREE, loaders, 'human', { source: 'fbx' });
 */
export const CDN = 'https://assets.grudge-studio.com';

/** Fleet catalog of editable Toon RTS tree (regenerate via customizer script) */
export const TOON_RTS_SSOT_URL = '/api/v1/grudge6-toon-rts-ssot.json';
export const TOON_RTS_INDEX_URL = '/api/v1/grudge6-toon-rts-index.json';

/**
 * Local / customizer base for split glTF+bin packs.
 * When hosting the Asset-Rig-Editor customizer: `/assets/{diskFolder}/...`
 * When promoting to CDN, map diskFolder → R2 under models/grudge6/toon-rts/{diskFolder}/
 */
export const TOON_RTS_DISK = {
  human: 'human',
  orc: 'orc',
  elf: 'elf',
  dwarf: 'dwarf',
  undead: 'undead',
  barbarian: 'barbarian',
};

/**
 * Faction allies share siege / range engines (Toon RTS SSOT):
 *   dwarf → elf boltthrower · undead → orc catapult · barbarian → human catapult
 * Infantry + cavalry stay per-race (own glTF on disk).
 */
export const TOON_RTS_SIEGE_ALLY = {
  dwarf: 'elf',
  undead: 'orc',
  barbarian: 'human',
};

/** SI heights (m) — infantry from race manifests; cavalry/siege from customizer SSOT.
 *  Ally races use the provider race's siege height. */
export const TOON_RTS_HEIGHT_M = {
  human: { infantry: 1.83, cavalry: 2.55, siege: 3.5 },
  orc: { infantry: 2.13, cavalry: 2.9, siege: 4.2 },
  elf: { infantry: 1.95, cavalry: 2.65, siege: 3.6 },
  dwarf: { infantry: 1.52, cavalry: 2.1, siege: 3.6 }, // shares elf boltthrower
  undead: { infantry: 1.83, cavalry: 2.55, siege: 4.2 }, // shares orc catapult
  barbarian: { infantry: 1.98, cavalry: 2.7, siege: 3.5 }, // shares human catapult
};

/** Siege / range engines — relative path on the *provider* race folder */
export const TOON_RTS_SIEGE = {
  human: 'character/siege_wk_catapult.gltf',
  orc: 'character/siege_orc_catapult.gltf',
  elf: 'character/siege_elf_boltthrower.gltf',
  // allies resolve via TOON_RTS_SIEGE_ALLY → provider entry
  dwarf: 'character/siege_elf_boltthrower.gltf',
  undead: 'character/siege_orc_catapult.gltf',
  barbarian: 'character/siege_wk_catapult.gltf',
};

/** Resolve which race folder owns siege mesh + clips for this fleet race */
export function toonRtsSiegeProvider(raceId) {
  return TOON_RTS_SIEGE_ALLY[raceId] || raceId;
}

/**
 * Resolve a Toon RTS unit glTF URL.
 * @param {string} raceId fleet id (human|orc|…)
 * @param {'infantry'|'cavalry'|'siege'} kind
 * @param {{ base?: string }} opts base defaults to `/assets/{disk}/`
 *   For siege, base is the *provider* race folder when ally share applies.
 */
export function toonRtsUnitUrl(raceId, kind = 'infantry', opts = {}) {
  if (kind === 'siege') {
    // Always load from provider race folder (ally share)
    const provider = toonRtsSiegeProvider(raceId);
    const disk = TOON_RTS_DISK[provider];
    if (!disk) return null;
    const rel = TOON_RTS_SIEGE[provider];
    if (!rel) return null;
    const base = (opts.base || `/assets/${disk}/`).replace(/\/?$/, '/');
    return `${base}${rel}`;
  }
  const disk = TOON_RTS_DISK[raceId];
  if (!disk) return null;
  const base = (opts.base || `/assets/${disk}/`).replace(/\/?$/, '/');
  if (kind === 'infantry') return `${base}character/infantry.gltf`;
  if (kind === 'cavalry') return `${base}character/cavalry.gltf`;
  return null;
}

/** Siege animation clip URLs live on the provider race folder */
export function toonRtsSiegeAnimBase(raceId) {
  const provider = toonRtsSiegeProvider(raceId);
  const disk = TOON_RTS_DISK[provider];
  return disk ? `/assets/${disk}/animations/` : null;
}

/** Canonical race kits — FBX is production paperdoll SSOT until GLB passes visual gate */
export const RACE_ASSETS = {
  human: {
    id: 'human',
    prefix: 'WK_',
    folder: 'western-kingdoms',
    texture: 'WK_Standard_Units.webp',
    fbx: `${CDN}/models/grudge6/races/WK_Characters.fbx`,
    glb: `${CDN}/models/grudge6/races/WK_Characters.glb`,
    toonDisk: 'human',
    mountTexture: 'WK_Horse_A.png',
  },
  barbarian: {
    id: 'barbarian',
    prefix: 'BRB_',
    folder: 'barbarians',
    texture: 'BRB_StandardUnits_texture.webp',
    fbx: `${CDN}/models/grudge6/races/BRB_Characters.fbx`,
    glb: `${CDN}/models/grudge6/races/BRB_Characters.glb`,
    toonDisk: 'barbarian',
  },
  orc: {
    id: 'orc',
    prefix: 'ORC_',
    folder: 'orcs',
    texture: 'ORC_StandardUnits.webp',
    fbx: `${CDN}/models/grudge6/races/ORC_Characters.fbx`,
    glb: `${CDN}/models/grudge6/races/ORC_Characters.glb`,
    toonDisk: 'orc',
    mountTexture: 'ORC_Wolf_texture_A.png',
  },
  elf: {
    id: 'elf',
    prefix: 'ELF_',
    folder: 'elves',
    texture: 'ELF_HighElves_Texture.webp',
    fbx: `${CDN}/models/grudge6/races/ELF_Characters.fbx`,
    glb: `${CDN}/models/grudge6/races/ELF_Characters.glb`,
    toonDisk: 'elf',
  },
  undead: {
    id: 'undead',
    prefix: 'UD_',
    folder: 'undead',
    texture: 'UD_Standard_Units.webp',
    fbx: `${CDN}/models/grudge6/races/UD_Characters.fbx`,
    glb: `${CDN}/models/grudge6/races/UD_Characters.glb`,
    toonDisk: 'undead',
  },
  dwarf: {
    id: 'dwarf',
    prefix: 'DWF_',
    folder: 'dwarves',
    texture: 'DWF_Standard_Units.webp',
    fbx: `${CDN}/models/grudge6/races/DWF_Characters.fbx`,
    glb: `${CDN}/models/grudge6/races/DWF_Characters.glb`,
    toonDisk: 'dwarf',
  },
};

/** Legacy / stub paths games must NOT use (overwrite on CDN or rewrite in loaders) */
export const BLOCKED_ASSET_PREFIXES = [
  'models/characters/grudge6/',
  'models/characters/grudge6/race/',
  'models/characters/grudge6/metaverse/',
];

export const STUB_MAX_BYTES = 50_000; // known bad placeholder ~44089

export const SLOT_DEFS = [
  { slot: 'body', re: /^(?:Units_)?Body_([A-Z])$/i, group: 'armor' },
  { slot: 'arms', re: /^(?:Units_)?Arms_([A-Z])$/i, group: 'armor' },
  { slot: 'legs', re: /^(?:Units_)?Legs_([A-Z])$/i, group: 'armor' },
  { slot: 'head', re: /^(?:Units_)?Head_([A-Z])$/i, group: 'armor' },
  { slot: 'shoulders', re: /^(?:Units_)?Shoulderpads_([A-Z])$/i, group: 'armor' },
  { slot: 'axe', re: /^(?:Units_|weapon_|Weapon_)?[Aa]xe(?:_([A-Z]))?$/i, group: 'weapon_r' },
  { slot: 'hammer', re: /^(?:Units_|weapon_|Weapon_)?[Hh]ammer(?:_([A-Z]))?$/i, group: 'weapon_r' },
  { slot: 'mace', re: /^(?:Units_|weapon_|Weapon_)?[Mm]ace(?:_([A-Z]))?$/i, group: 'weapon_r' },
  { slot: 'sword', re: /^(?:Units_|weapon_|Weapon_)?[Ss]word(?:_([A-Z]))?$/i, group: 'weapon_r' },
  { slot: 'dagger', re: /^(?:Units_|weapon_|Weapon_)?[Dd]agger(?:_([A-Z]))?$/i, group: 'weapon_r' },
  { slot: 'pick', re: /^(?:Units_|weapon_|Weapon_)?[Pp]ick(?:_([A-Z]))?$/i, group: 'weapon_r' },
  { slot: 'spear', re: /^(?:Units_|weapon_|Weapon_)?[Ss]pear(?:_([A-Z]))?$/i, group: 'weapon_r' },
  { slot: 'bow', re: /^(?:Units_|weapon_|Weapon_)?[Bb]ow$/i, group: 'weapon_l', noVariant: true },
  { slot: 'staff', re: /^(?:Units_|weapon_|Weapon_)?[Ss]taff_([A-Z])$/i, group: 'weapon_l' },
  { slot: 'shield', re: /^(?:Units_)?[Ss]hield_([A-Z])$/i, group: 'shield' },
  { slot: 'bag', re: /^(?:Xtra_|Units_)?[Bb]ag$/i, group: 'utility', noVariant: true },
  { slot: 'wood', re: /^(?:Xtra_|Units_)?[Ww]ood$/i, group: 'utility', noVariant: true },
  { slot: 'quiver', re: /^(?:Xtra_|Units_)?[Qq]uiver$/i, group: 'utility', noVariant: true },
];

export const WEAPON_R = new Set(['axe', 'hammer', 'mace', 'sword', 'dagger', 'pick', 'spear']);
export const WEAPON_L = new Set(['bow', 'staff']);

export function atlasUrl(raceId) {
  const a = RACE_ASSETS[raceId];
  if (!a) return null;
  return `${CDN}/assets/${a.folder}/textures/${a.texture}`;
}

export function kitUrl(raceId, source = 'fbx') {
  const a = RACE_ASSETS[raceId];
  if (!a) return null;
  if (source === 'glb' || source === 'raceGlb') return a.glb;
  return a.fbx;
}

/** Rewrite known-bad legacy paths to canonical race kit or mesh library */
export function resolveCanonicalAssetUrl(urlOrKey) {
  if (!urlOrKey) return urlOrKey;
  const s = String(urlOrKey);
  const key = s.replace(/^https?:\/\/assets\.grudge-studio\.com\//, '');
  // models/characters/grudge6/{race}.glb → races kit FBX
  const m = key.match(/^models\/characters\/grudge6\/(?:race\/|metaverse\/)?([a-z_]+)\.glb$/i);
  if (m) {
    const id = m[1].toLowerCase();
    const map = {
      human: 'human',
      elf: 'elf',
      dwarf: 'dwarf',
      orc: 'orc',
      undead: 'undead',
      barbarian: 'barbarian',
      goblin: 'orc',
      troll: 'orc',
      dark_elf: 'elf',
    };
    const race = map[id];
    if (race && RACE_ASSETS[race]) return RACE_ASSETS[race].fbx;
  }
  // toon-rts separate equipment → prefer mesh library path (best-effort naming)
  const eq = key.match(
    /^asset-packs\/toon-rts-characters\/glb\/equipment\/([a-z]+)\/([A-Za-z0-9_]+)\.glb$/i,
  );
  if (eq) {
    const race = eq[1].toLowerCase();
    const base = eq[2];
    if (RACE_ASSETS[race]) {
      // Prefer library A-variant when name has no letter: WK_weapon_sword → WK_weapon_sword_A
      const stem = /_[A-Z]$/i.test(base) ? base : `${base}_A`.replace(/_A_A$/, '_A');
      // Shield/bow naming variants handled by callers; return library URL for primary form
      const lib = `${CDN}/models/grudge6/races/library/${race}/${stem}.glb`;
      return lib;
    }
  }
  return s.startsWith('http') ? s : `${CDN}/${key}`;
}

export function meshKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/^wk_|^brb_|^orc_|^elf_|^ud_|^dwf_/, '')
    .replace(/units_/g, '')
    .replace(/xtra_/g, '')
    .replace(/weapon_/g, 'weapon')
    .replace(/shield_/g, 'shield')
    .replace(/shoulderpads_/g, 'shoulders')
    .replace(/[^a-z0-9]/g, '');
}

export function meshMatchesId(meshName, meshId) {
  if (!meshName || !meshId) return false;
  if (meshName === meshId) return true;
  if (meshName.endsWith(meshId) || meshId.endsWith(meshName)) return true;
  const a = meshKey(meshName);
  const b = meshKey(meshId);
  return a === b || a.endsWith(b) || b.endsWith(a);
}

export class EquipmentManager {
  constructor(prefix) {
    this.prefix = prefix.endsWith('_') ? prefix : `${prefix}_`;
    this.slots = {};
    this.equipped = {};
    this.allMeshes = [];
    this.root = null;
  }

  catalog(root) {
    this.root = root;
    this.slots = {};
    this.allMeshes = [];
    this.equipped = {};
    root.traverse((child) => {
      if (!child.isMesh && !child.isSkinnedMesh) return;
      child.visible = false;
      this.allMeshes.push(child);
      const stripped = child.name.startsWith(this.prefix)
        ? child.name.slice(this.prefix.length)
        : child.name;
      for (const def of SLOT_DEFS) {
        const match = stripped.match(def.re);
        if (!match) continue;
        const variant = def.noVariant
          ? '_default'
          : (match[1] || '_default').toUpperCase();
        if (!this.slots[def.slot]) this.slots[def.slot] = {};
        this.slots[def.slot][variant] = child;
        child.userData.equipSlot = def.slot;
        child.userData.equipVariant = variant;
        child.userData.equipGroup = def.group;
        break;
      }
    });
    return this.summary();
  }

  summary() {
    const out = {};
    for (const [slot, variants] of Object.entries(this.slots)) {
      out[slot] = Object.keys(variants).sort();
    }
    return out;
  }

  equip(slot, variant) {
    const variants = this.slots[slot];
    if (!variants) return false;
    for (const [v, mesh] of Object.entries(variants)) {
      mesh.visible = v === variant;
    }
    this.equipped[slot] = variant;
    return true;
  }

  equipWeapon(slot, variant = '_default') {
    const def = SLOT_DEFS.find((d) => d.slot === slot);
    if (!def) return false;
    for (const mesh of this.allMeshes) {
      if (mesh.userData.equipGroup === def.group) {
        mesh.visible = false;
        delete this.equipped[mesh.userData.equipSlot];
      }
    }
    return this.equip(slot, variant);
  }

  /** UI helper: all meshes with equip metadata */
  listAllMeshes() {
    return this.allMeshes
      .map((m) => ({
        name: m.name,
        slot: m.userData.equipSlot,
        variant: m.userData.equipVariant,
        group: m.userData.equipGroup,
        visible: m.visible,
        mesh: m,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  unequip(slot) {
    const variants = this.slots[slot];
    if (!variants) return;
    for (const mesh of Object.values(variants)) mesh.visible = false;
    delete this.equipped[slot];
  }

  hideGroup(group) {
    for (const mesh of this.allMeshes) {
      if (mesh.userData.equipGroup === group) {
        mesh.visible = false;
        delete this.equipped[mesh.userData.equipSlot];
      }
    }
  }

  applyDefaultLoadout() {
    for (const slot of ['body', 'arms', 'legs', 'head', 'shoulders']) {
      const variants = this.slots[slot];
      if (!variants) continue;
      const keys = Object.keys(variants).sort();
      const pick = keys.includes('A') ? 'A' : keys[0];
      if (pick) this.equip(slot, pick);
    }
    if (this.slots.sword) {
      const v = this.slots.sword.A ? 'A' : Object.keys(this.slots.sword).sort()[0];
      this.equipWeapon('sword', v);
    } else {
      for (const slot of WEAPON_R) {
        if (this.slots[slot]) {
          this.equipWeapon(slot, Object.keys(this.slots[slot]).sort()[0]);
          break;
        }
      }
    }
  }

  /** D1 gear_presets.mesh_ids → visibility */
  applyMeshIds(meshIds = []) {
    const wanted = (meshIds || []).map(String);
    const matched = [];
    const missing = [];
    for (const m of this.allMeshes) m.visible = false;
    this.equipped = {};
    for (const id of wanted) {
      const hit = this.allMeshes.find((m) => meshMatchesId(m.name, id));
      if (hit) {
        hit.visible = true;
        matched.push(hit.name);
        if (hit.userData.equipSlot) {
          this.equipped[hit.userData.equipSlot] = hit.userData.equipVariant;
        }
      } else missing.push(id);
    }
    return { matched, missing, wanted };
  }
}

/**
 * Bind race atlas onto every mesh (MeshStandardMaterial).
 * @param {typeof import('three')} THREE
 */
export function bindRaceAtlas(THREE, root, texture) {
  if (!texture || !root) return 0;
  let n = 0;
  root.traverse((obj) => {
    if (!obj.isMesh && !obj.isSkinnedMesh) return;
    const prev = obj.material;
    obj.material = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xffffff,
      metalness: 0,
      roughness: 0.75,
      side: THREE.DoubleSide,
      alphaTest: 0.02,
    });
    obj.castShadow = true;
    obj.receiveShadow = true;
    n++;
    try {
      if (Array.isArray(prev)) prev.forEach((m) => m?.dispose?.());
      else prev?.dispose?.();
    } catch {
      /* */
    }
  });
  return n;
}

/** Invert UV V (Blender glTF often differs from FBXLoader space for these kits) */
export function invertGeometryUVV(root) {
  const seen = new Set();
  root.traverse((obj) => {
    const g = obj.geometry;
    if (!g?.attributes?.uv) return;
    if (seen.has(g.uuid)) return;
    seen.add(g.uuid);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
    uv.needsUpdate = true;
  });
}

export function groundYHip(root, THREE, targetH = 1.7) {
  root.position.set(0, 0, 0);
  root.scale.setScalar(1);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.y > 0.01) {
    root.scale.setScalar(targetH / size.y);
    root.updateMatrixWorld(true);
    box.setFromObject(root);
  }
  root.position.y = -box.min.y;
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  return { height: box.max.y - box.min.y };
}

const texCache = new Map();

export async function loadRaceTexture(THREE, raceId) {
  const url = atlasUrl(raceId);
  if (!url) return null;
  if (texCache.has(url)) return texCache.get(url);
  const loader = new THREE.TextureLoader();
  const tex = await new Promise((resolve) => {
    loader.load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.flipY = false;
        t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
        t.anisotropy = 8;
        t.needsUpdate = true;
        texCache.set(url, t);
        resolve(t);
      },
      undefined,
      () => resolve(null),
    );
  });
  return tex;
}

/**
 * Load race kit + catalog equipment + bind atlas.
 * @param {object} loaders { FBXLoader, GLTFLoader } classes
 * @param {string} raceId
 * @param {{ source?: 'fbx'|'glb', meshIds?: string[], ground?: boolean }} opts
 */
export async function loadRaceKit(THREE, loaders, raceId, opts = {}) {
  const race = RACE_ASSETS[raceId];
  if (!race) throw new Error(`Unknown race: ${raceId}`);
  const source = opts.source || 'fbx';
  let url = kitUrl(raceId, source);
  url = resolveCanonicalAssetUrl(url);

  let root;
  let animations = [];
  if (/\.fbx($|\?)/i.test(url)) {
    const loader = new loaders.FBXLoader();
    root = await loader.loadAsync(url);
    animations = root.animations || [];
  } else {
    const loader = new loaders.GLTFLoader();
    const gltf = await loader.loadAsync(url);
    root = gltf.scene || gltf;
    animations = gltf.animations || [];
    if (source !== 'fbx') invertGeometryUVV(root);
  }

  const tex = await loadRaceTexture(THREE, raceId);
  const matCount = tex ? bindRaceAtlas(THREE, root, tex) : 0;

  const equip = new EquipmentManager(race.prefix);
  equip.catalog(root);
  let equipResult = null;
  if (opts.meshIds?.length) equipResult = equip.applyMeshIds(opts.meshIds);
  else equip.applyDefaultLoadout();

  let ground = null;
  if (opts.ground !== false) ground = groundYHip(root, THREE, opts.targetHeight ?? 1.7);

  return {
    root,
    animations,
    equip,
    race,
    url,
    source,
    atlas: tex,
    matCount,
    equipResult,
    ground,
  };
}
