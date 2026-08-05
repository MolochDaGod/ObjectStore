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
  { slot: 'head', re: /^(?:Units_)?(?:Head|Haed)_([A-Z])$/i, group: 'armor' },
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

/**
 * Stone atlas paths (grudge6-cdn-ssot): textures/grudge6/{folder}/{file}
 * Legacy assets/{folder}/textures kept as fallback in bind loaders.
 */
export const ATLAS_VARIANTS = {
  human: {
    default: 'WK_Standard_Units.webp',
    black: 'WK_StandardUnits_black.webp',
    blue: 'WK_StandardUnits_blue.webp',
    brown: 'WK_StandardUnits_brown.webp',
    green: 'WK_StandardUnits_green.webp',
    red: 'WK_StandardUnits_red.webp',
    white: 'WK_StandardUnits_white.webp',
  },
  barbarian: {
    default: 'BRB_StandardUnits_texture.webp',
    brown: 'BRB_Standard_Units_brown.webp',
  },
  elf: {
    default: 'ELF_HighElves_Texture.webp',
    high: 'ELF_HighElves_Texture.webp',
    dark: 'ELF_DarkElves_Texture.webp',
    dark_blue: 'ELF_DarkElves_Blue.webp',
    dark_green: 'ELF_DarkElves_Green.webp',
    dark_red: 'ELF_DarkElves_Red.webp',
    wood: 'ELF_WoodElves_Texture.webp',
    wood_brown: 'ELF_WoodElves_Brown.webp',
  },
  dwarf: {
    default: 'DWF_Standard_Units.webp',
    brown: 'DWF_Units_Brown.webp',
  },
  orc: {
    default: 'ORC_StandardUnits.webp',
    black: 'ORC_StandardUnits_black.webp',
    blue: 'ORC_StandardUnits_blue.webp',
    brown: 'ORC_StandardUnits_brown.webp',
    green: 'ORC_StandardUnits_green.webp',
    red: 'ORC_StandardUnits_red.webp',
  },
  undead: {
    default: 'UD_Standard_Units.webp',
    brown: 'UD_Standard_Units_brown.webp',
  },
};

export function atlasUrl(raceId, variant = 'default') {
  const a = RACE_ASSETS[raceId];
  if (!a) return null;
  const variants = ATLAS_VARIANTS[raceId] || {};
  const file =
    variants[variant] ||
    variants.default ||
    a.texture;
  // Prefer stone path; callers may fall back to legacy if 404
  return `${CDN}/textures/grudge6/${a.folder}/${file}`;
}

/** Legacy path some older deploys still use */
export function atlasUrlLegacy(raceId, variant = 'default') {
  const a = RACE_ASSETS[raceId];
  if (!a) return null;
  const variants = ATLAS_VARIANTS[raceId] || {};
  const file = variants[variant] || variants.default || a.texture;
  return `${CDN}/assets/${a.folder}/textures/${file}`;
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

  /**
   * Hard exclusivity: ONLY meshes in `this.equipped` stay visible.
   * Fixes ghost layers / stacked helmets when regex double-matched or
   * bind-pose weapons leaked visibility.
   */
  hardenVisibility() {
    const keep = new Set();
    for (const [slot, variant] of Object.entries(this.equipped || {})) {
      const mesh = this.slots[slot]?.[variant];
      if (mesh) keep.add(mesh.uuid);
    }
    for (const m of this.allMeshes) {
      m.visible = keep.has(m.uuid);
    }
    return keep.size;
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

/**
 * HARD SCALE RULES (stretch / squash always comes from breaking these):
 *
 *  ✅ DO:  root.scale.setScalar(s) once — uniform XYZ on the whole kit
 *  ✅ DO:  measure STRUCTURAL visible body only (one head/body/arms/legs, + mount/siege)
 *  ✅ DO:  plant feet from structural box.min.y (not pelvis.y)
 *
 *  ❌ NEVER: mesh.scale.set / bone.scale / scaleHeadMeshes (non-uniform → stretch)
 *  ❌ NEVER: setFromObject(whole kit) while ALL armor variants are visible
 *            (stacked A–N plumes inflate height → wrong fit scale)
 *  ❌ NEVER: hero-fit siege/weapons/projectiles to 1.8 m
 *  ❌ NEVER: non-uniform root.scale.set(sx, sy, sz) with sx≠sy≠sz
 */

/** Structural silhouette only — matches customizer CharacterModel. */
export function isStructuralMeshName(name, characterType = 'infantry') {
  const n = String(name || '').toLowerCase();
  if (/_weapon_|weapon_|_shield|shield_/.test(n)) return false;
  if (/_xtra_|quiver|wood$|_bag$|bag$|lumber|log/.test(n)) return false;
  if (/units_(body|head|arms?|legs?|shoulderpads?)_/.test(n)) return true;
  if (/^[a-z]{2,4}_(body|head|arms?|legs?|shoulderpads?)_/.test(n)) return true;
  if (characterType === 'cavalry' && /(horse|wolf|ram|mount|steed|boar)/.test(n)) return true;
  if (
    characterType === 'siege' &&
    /(catapult|boltthrower|ballista|wheel|frame|arm_l|arm_r)/.test(n)
  ) {
    return true;
  }
  return false;
}

/**
 * World AABB of structural meshes only.
 * If onlyVisible=true (default), skip hidden meshes so equip loadout drives height.
 * @param {typeof import('three')} THREE
 * @param {import('three').Object3D} root
 * @param {'infantry'|'cavalry'|'siege'} characterType
 * @param {{ onlyVisible?: boolean }} opts
 */
export function measureStructuralBBox(THREE, root, characterType = 'infantry', opts = {}) {
  const onlyVisible = opts.onlyVisible !== false;
  const box = new THREE.Box3();
  root.updateMatrixWorld(true);
  let any = false;
  root.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    if (onlyVisible && o.visible === false) return;
    if (!isStructuralMeshName(o.name, characterType)) return;
    if (!o.geometry) return;
    // Prefer live skinned extent when available
    if (o.isSkinnedMesh && typeof o.computeBoundingBox === 'function') {
      try {
        o.computeBoundingBox();
        if (o.boundingBox && !o.boundingBox.isEmpty()) {
          const mb = o.boundingBox.clone().applyMatrix4(o.matrixWorld);
          if (Number.isFinite(mb.min.y) && Number.isFinite(mb.max.y)) {
            box.union(mb);
            any = true;
            return;
          }
        }
      } catch {
        /* fall through */
      }
    }
    const mb = new THREE.Box3().setFromObject(o);
    if (Number.isFinite(mb.min.y) && Number.isFinite(mb.max.y)) {
      box.union(mb);
      any = true;
    }
  });
  if (!any) box.setFromObject(root);
  return box;
}

/**
 * Uniform SI fit on ROOT only + plant feet.
 * Replaces the old full-kit measure (which stacked every armor variant).
 *
 * @param {typeof import('three')} THREE
 * @param {import('three').Object3D} root
 * @param {number} targetH metres
 * @param {{ characterType?: 'infantry'|'cavalry'|'siege', centerXZ?: boolean }} opts
 */
export function fitRootUniformSi(THREE, root, targetH = 1.8, opts = {}) {
  const characterType = opts.characterType || 'infantry';
  const centerXZ = opts.centerXZ !== false;

  // Identity root; do not touch child mesh/bone scales
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.setScalar(1);
  root.updateMatrixWorld(true);

  let box = measureStructuralBBox(THREE, root, characterType);
  let h = Math.max(box.max.y - box.min.y, 1e-4);

  // Classic 100× (cm authored as m) — uniform decade on ROOT only
  if (h > 40) {
    root.scale.setScalar(0.01);
    root.updateMatrixWorld(true);
    box = measureStructuralBBox(THREE, root, characterType);
    h = Math.max(box.max.y - box.min.y, 1e-4);
  }

  const s = targetH / h;
  root.scale.setScalar(root.scale.x * s); // always uniform
  root.updateMatrixWorld(true);
  box = measureStructuralBBox(THREE, root, characterType);

  // Feet = structural min.y (NOT pelvis / hip bone)
  root.position.y -= box.min.y;
  if (centerXZ) {
    const cx = (box.min.x + box.max.x) * 0.5;
    const cz = (box.min.z + box.max.z) * 0.5;
    root.position.x -= cx;
    root.position.z -= cz;
  }
  root.updateMatrixWorld(true);
  box = measureStructuralBBox(THREE, root, characterType);
  const finalH = box.max.y - box.min.y;
  return { height: finalH, scale: root.scale.x, authoredH: h / (root.scale.x || 1), targetH };
}

/**
 * @deprecated name was wrong (not hip). Prefer fitRootUniformSi.
 * Kept as alias for older callers.
 */
export function groundYHip(root, THREE, targetH = 1.7) {
  return fitRootUniformSi(THREE, root, targetH, {
    characterType: 'infantry',
    centerXZ: false,
  });
}

const texCache = new Map();

export async function loadRaceTexture(THREE, raceId, variant = 'default') {
  const urls = [atlasUrl(raceId, variant), atlasUrlLegacy(raceId, variant)].filter(Boolean);
  const loader = new THREE.TextureLoader();
  for (const url of urls) {
    if (texCache.has(url)) return texCache.get(url);
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
    if (tex) return tex;
  }
  return null;
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
  // Prefer production GLB for web paperdoll (FBX still available via source:'fbx')
  const source = opts.source || 'glb';
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

  const tex = await loadRaceTexture(THREE, raceId, opts.atlasVariant || 'default');
  const matCount = tex ? bindRaceAtlas(THREE, root, tex) : 0;

  const equip = new EquipmentManager(race.prefix);
  equip.catalog(root);
  let equipResult = null;
  if (opts.meshIds?.length) equipResult = equip.applyMeshIds(opts.meshIds);
  else if (opts.skipDefaultLoadout) {
    // Leave all equippable hidden — caller applies paperdoll loadout
  } else equip.applyDefaultLoadout();

  let ground = null;
  if (opts.ground !== false) {
    ground = fitRootUniformSi(THREE, root, opts.targetHeight ?? 1.8, {
      characterType: opts.characterType || 'infantry',
      centerXZ: opts.centerXZ !== false,
    });
  }

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
