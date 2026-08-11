/**
 * @grudge-studio/grudge6-kit (ObjectStore js/)
 *
 * HARDENED Warlords / grudge6 PLAY system — only this module for heroes.
 * Doc: docs/GRUDGE6_PLAY_PATH_PURGE.md · api/v1/grudge6-warlords-play-contract.json
 *
 * Usage:
 *   import { RACE_ASSETS, loadRaceKit, EquipmentManager, assertPlayKitUrl } from './grudge6-kit.js';
 *   const { root, equip } = await loadRaceKit(THREE, loaders, 'human'); // Toon RTS ★ default
 *
 * HARD: uniform root SI only — never non-uniform mesh/bone stretch.
 * HARD: never pose() every SkinnedMesh; never forceAtlas on good Toon embeds.
 */
export const CDN = 'https://assets.grudge-studio.com';

/** Contract version — stamp on every play kit root.userData */
export const WARLORDS_PLAY_CONTRACT_VERSION = '2026-08-07.harden.1';

/** PLAY mesh path fragment (Toon RTS ★). */
export const WARLORDS_PLAY_KIT_PATH =
  'asset-packs/toon-rts-characters/glb/characters/';

/** Race ids accepted by loadRaceKit play path. */
export const WARLORDS_PLAY_RACE_IDS = Object.freeze([
  'human',
  'barbarian',
  'elf',
  'dwarf',
  'orc',
  'undead',
]);

/**
 * Anti-patterns for PLAY (agents + loaders). Do not reintroduce.
 * Lab/author may use non-play sources only with explicit opts.source.
 */
export const WARLORDS_PLAY_BANNED = Object.freeze([
  'skeleton.pose_on_every_skinned_mesh',
  'unifySkeletons_multi_pose_play',
  'setFromObject_skinned_si_fit',
  'facePlusZ_default_true_toon_play',
  'forceAtlas_on_good_toon_embeds',
  'play_default_races_bake',
  'play_default_metaverse',
  'play_default_fbx',
  'silent_fallback_toon_to_races_metaverse_fbx',
  'anim_rematch_to_units_head_meshes',
  'whole_body_glb_swap_for_equip',
]);

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

/**
 * Canonical race kits — ONE golden play mesh for fleet / heroes / Warlords / lab.
 *
 * GOLDEN (Toon RTS ★, embedded-kept): asset-packs/toon-rts-characters/glb/characters/{id}.glb
 *   → fields: toonRts, glb (alias), kitUrl() default
 * Compare-only bake: models/grudge6/races/{PREFIX}_Characters.glb → racesBake
 * Metaverse / FBX: diagnostics only — never play default
 */
const TOON = (id) => `${CDN}/asset-packs/toon-rts-characters/glb/characters/${id}.glb`;
const RACES = (pfx) => `${CDN}/models/grudge6/races/${pfx}_Characters.glb`;
const FBX = (pfx) => `${CDN}/models/grudge6/races/${pfx}_Characters.fbx`;
const META = (id) => `${CDN}/models/grudge6/metaverse/${id}.glb`;

export const RACE_ASSETS = {
  human: {
    id: 'human',
    prefix: 'WK_',
    folder: 'western-kingdoms',
    texture: 'WK_Standard_Units.webp',
    toonRts: TOON('human'),
    glb: TOON('human'),
    racesBake: RACES('WK'),
    fbx: FBX('WK'),
    metaverse: META('human'),
    toonDisk: 'human',
    mountTexture: 'WK_Horse_A.png',
  },
  barbarian: {
    id: 'barbarian',
    prefix: 'BRB_',
    folder: 'barbarians',
    texture: 'BRB_StandardUnits_texture.webp',
    toonRts: TOON('barbarian'),
    glb: TOON('barbarian'),
    racesBake: RACES('BRB'),
    fbx: FBX('BRB'),
    metaverse: META('barbarian'),
    toonDisk: 'barbarian',
  },
  orc: {
    id: 'orc',
    prefix: 'ORC_',
    folder: 'orcs',
    texture: 'ORC_StandardUnits.webp',
    toonRts: TOON('orc'),
    glb: TOON('orc'),
    racesBake: RACES('ORC'),
    fbx: FBX('ORC'),
    metaverse: META('orc'),
    toonDisk: 'orc',
    mountTexture: 'ORC_Wolf_texture_A.png',
  },
  elf: {
    id: 'elf',
    prefix: 'ELF_',
    folder: 'elves',
    texture: 'ELF_HighElves_Texture.webp',
    toonRts: TOON('elf'),
    glb: TOON('elf'),
    racesBake: RACES('ELF'),
    fbx: FBX('ELF'),
    metaverse: META('elf'),
    toonDisk: 'elf',
  },
  undead: {
    id: 'undead',
    prefix: 'UD_',
    folder: 'undead',
    texture: 'UD_Standard_Units.webp',
    toonRts: TOON('undead'),
    glb: TOON('undead'),
    racesBake: RACES('UD'),
    fbx: FBX('UD'),
    metaverse: META('undead'),
    toonDisk: 'undead',
  },
  dwarf: {
    id: 'dwarf',
    prefix: 'DWF_',
    folder: 'dwarves',
    texture: 'DWF_Standard_Units.webp',
    toonRts: TOON('dwarf'),
    glb: TOON('dwarf'),
    racesBake: RACES('DWF'),
    fbx: FBX('DWF'),
    metaverse: META('dwarf'),
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

/**
 * Match after race prefix strip (WK_/BRB_/UD_/…).
 * Most races: Units_Body_A · Barbarian BRB pack: body_A (no Units_ token).
 */
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
 * 1H weapons that use the same kit mesh on main OR off hand.
 * Off-hand clones the R mesh onto L_hand_container (same variant letter).
 * 2H (spear, pick, greataxe/greatsword as kinds) stay main-only.
 */
export const WEAPON_1H = new Set(['sword', 'dagger', 'mace', 'hammer', 'axe']);

/** Left-hand socket candidates for dual-wield / off-hand 1H (Toon RTS). */
export const L_HAND_SOCKETS = [
  'L_hand_container',
  'Bip001 L Hand',
  'Bip001_L_Hand',
  'mixamorig:LeftHand',
  'mixamorigLeftHand',
];

export function findLHandSocket(root) {
  if (!root) return null;
  for (const n of L_HAND_SOCKETS) {
    const o = root.getObjectByName(n);
    if (o) return o;
  }
  let hit = null;
  root.traverse((o) => {
    if (hit) return;
    const nm = String(o.name || '');
    if (/L_hand_container|Bip001.?L.?Hand|LeftHand/i.test(nm)) hit = o;
  });
  return hit;
}

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

/**
 * Kit URL by source.
 * Play / heroes / Warlords / default: Toon RTS ★ (glb === toonRts).
 * Compare bake only: races | racesBake | compare | prodBake.
 * metaverse / fbx: diagnostics only — never play default.
 */
export function kitUrl(raceId, source = 'toonRts') {
  const a = RACE_ASSETS[raceId];
  if (!a) return null;
  if (source === 'fbx' || source === 'raceFbx') return a.fbx;
  if (source === 'metaverse') return a.metaverse || a.toonRts || a.glb;
  if (
    source === 'races' ||
    source === 'racesBake' ||
    source === 'compare' ||
    source === 'prodBake'
  ) {
    return a.racesBake || a.glb;
  }
  // toonRts | toon | glb | prod | default → GOLDEN
  return a.toonRts || a.glb;
}

/** True if URL is Warlords PLAY Toon RTS kit. */
export function isToonRtsPlayUrl(url) {
  return new RegExp(
    `${WARLORDS_PLAY_KIT_PATH.replace(/\//g, '\\/')}[a-z]+\\.glb`,
    'i',
  ).test(String(url || ''));
}

/**
 * Fail closed: PLAY kits must be Toon RTS GLB on assets CDN.
 * @param {string} url
 * @param {{ allowNonPlay?: boolean }} [opts] — lab only when true
 * @returns {string} url
 */
export function assertPlayKitUrl(url, opts = {}) {
  const u = String(url || '');
  if (!u) throw new Error('[grudge6-kit] empty kit URL');
  if (opts.allowNonPlay === true) return u;
  if (!isToonRtsPlayUrl(u)) {
    throw new Error(
      `[grudge6-kit] PLAY refuse non-Toon kit URL: ${u} ` +
        `(need …/${WARLORDS_PLAY_KIT_PATH}{race}.glb)`,
    );
  }
  if (/metaverse|meshy|capsule/i.test(u)) {
    throw new Error(`[grudge6-kit] PLAY refuse banned host/path: ${u}`);
  }
  return u;
}

/**
 * Safe skeleton update after load/clone.
 * NEVER pose every SkinnedMesh (1-joint head skins → head-at-feet).
 * Optional: pose widest body skeleton once only.
 */
export function safeSkeletonUpdate(root, opts = {}) {
  if (!root) return;
  if (opts.poseWidestOnce === true) {
    let widest = null;
    root.traverse((o) => {
      if (o.isSkinnedMesh && o.skeleton) {
        if (!widest || o.skeleton.bones.length > widest.bones.length) widest = o.skeleton;
      }
    });
    if (widest) {
      widest.pose();
      widest.update();
    }
  }
  root.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton) {
      o.skeleton.update();
      o.frustumCulled = false;
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
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
    // Legacy stubs → GOLDEN Toon RTS pack (not races bake, not FBX)
    if (race && RACE_ASSETS[race]) return RACE_ASSETS[race].toonRts || RACE_ASSETS[race].glb;
  }
  // Old “prod” races kit URL → GOLDEN toon pack when used as play mesh
  const racesKit = key.match(/^models\/grudge6\/races\/(WK|BRB|ELF|DWF|ORC|UD)_Characters\.glb$/i);
  if (racesKit) {
    const pfx = racesKit[1].toUpperCase();
    const byPfx = { WK: 'human', BRB: 'barbarian', ELF: 'elf', DWF: 'dwarf', ORC: 'orc', UD: 'undead' };
    const race = byPfx[pfx];
    if (race && RACE_ASSETS[race]) return RACE_ASSETS[race].toonRts || RACE_ASSETS[race].glb;
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
    /** @type {{ slot: string, variant: string }|null} */
    this.equippedOffhand = null;
    /** @type {import('three').Object3D|null} clone on L_hand */
    this._offhandClone = null;
    this.allMeshes = [];
    this.root = null;
  }

  catalog(root) {
    this.root = root;
    this.slots = {};
    this.allMeshes = [];
    this.equipped = {};
    this.clearOffhandClone();
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

  /**
   * Off-hand 1H: same kit weapon family as main, mirrored on L_hand_container.
   * Clones the main-hand mesh so both can show at once (kit only has R variants).
   */
  equipWeaponOffhand(slot, variant = '_default') {
    if (!WEAPON_1H.has(slot)) return false;
    const src = this.slots[slot]?.[variant] || this.slots[slot]?._default;
    if (!src || !this.root) return false;
    this.clearOffhandClone();
    const socket = findLHandSocket(this.root);
    if (!socket) return false;

    const clone = src.clone(true);
    clone.name = (src.name || slot) + '_offhand';
    clone.visible = true;
    clone.userData.equipSlot = slot;
    clone.userData.equipVariant = variant;
    clone.userData.equipGroup = 'weapon_l_offhand';
    clone.userData.isOffhandClone = true;
    // Drop skinning issues: bind to same skeleton if skinned
    clone.traverse((o) => {
      if (o.isSkinnedMesh && src.isSkinnedMesh && src.skeleton) {
        try {
          o.bind(src.skeleton, o.bindMatrix || src.bindMatrix);
        } catch {
          /* keep unbound mesh under socket */
        }
      }
      o.frustumCulled = false;
      o.castShadow = true;
    });
    // Local identity in hand socket (same reception as main grip)
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    socket.add(clone);
    this._offhandClone = clone;
    this.equippedOffhand = { slot, variant };
    return true;
  }

  clearOffhandClone() {
    if (this._offhandClone) {
      if (this._offhandClone.parent) this._offhandClone.parent.remove(this._offhandClone);
      this._offhandClone.traverse((o) => {
        if (o.geometry && o.userData?.isOffhandClone) {
          /* leave geometry shared with source — do not dispose */
        }
      });
      this._offhandClone = null;
    }
    this.equippedOffhand = null;
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
    // Off-hand dual clone is not in allMeshes / equipped — keep visible
    if (this._offhandClone) {
      this._offhandClone.visible = true;
      this._offhandClone.traverse((o) => {
        if (o.isMesh || o.isSkinnedMesh) o.visible = true;
      });
    }
    return keep.size;
  }
}

/**
 * 1×1 / empty maps = failed embed stubs (must rebind atlas).
 *
 * IMPORTANT: a Texture that exists but has not finished decoding
 * (`image` null, or width/height still 0) is NOT a stub — keep the embed.
 * Treating pending decode as stub caused races/* GLBs (BIN webp) to force
 * atlas-rebind while Toon RTS data-URI PNGs (often sync-decoded) stayed
 * embedded-kept. That made Prod look “rebound” and Toon look correct.
 */
export function isStubMap(map) {
  if (!map) return true;

  // Prefer resolved image; also check Texture.source (three r152+)
  const img = map.image || map.source?.data || null;
  if (!img) {
    // Texture object is present but pixels not ready → keep embed
    return false;
  }

  const w = img.naturalWidth || img.width || img.videoWidth || 0;
  const h = img.naturalHeight || img.height || img.videoHeight || 0;
  if (w > 0 && h > 0) return w <= 2 || h <= 2;

  // Typed array image data (DataTexture / raw)
  if (img.data && typeof img.data.length === 'number') {
    return img.data.length <= 16;
  }

  // Incomplete HTMLImageElement / ImageBitmap still loading → keep embed
  if (typeof img.complete === 'boolean' && !img.complete) return false;
  return false;
}

/** Sample first usable embed atlas size for lab status (e.g. 512×512). */
export function sampleEmbedAtlasSize(root) {
  let out = null;
  if (!root) return out;
  root.traverse((obj) => {
    if (out) return;
    if (!obj.isMesh && !obj.isSkinnedMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      const map = m?.map;
      if (!map || isStubMap(map)) continue;
      const img = map.image || map.source?.data;
      const w = img?.naturalWidth || img?.width || 0;
      const h = img?.naturalHeight || img?.height || 0;
      if (w > 2 && h > 2) {
        out = { w, h };
        return;
      }
    }
  });
  return out;
}

/** True when kit already has a real color map (production GLB bake). */
export function kitHasUsableMaps(root) {
  let ok = false;
  if (!root) return false;
  root.traverse((obj) => {
    if (ok) return;
    if (!obj.isMesh && !obj.isSkinnedMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (m?.map && !isStubMap(m.map)) {
        ok = true;
        return;
      }
    }
  });
  return ok;
}

/**
 * Normalize embedded glTF/FBX maps in place — NO UV rewrite, NO atlas swap.
 * Production race GLBs already ship the correct atlas + UVs (asset-convert).
 */
export function normalizeEmbeddedMaps(THREE, root) {
  if (!root || !THREE) return 0;
  let n = 0;
  root.traverse((obj) => {
    if (!obj.isMesh && !obj.isSkinnedMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (!m) continue;
      if (m.map && !isStubMap(m.map)) {
        m.map.colorSpace = THREE.SRGBColorSpace;
        m.map.flipY = false;
        m.map.wrapS = m.map.wrapT = THREE.ClampToEdgeWrapping;
        m.map.needsUpdate = true;
        if (m.color) m.color.setHex(0xffffff);
        if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0, 0.15);
        if ('roughness' in m && (m.roughness == null || m.roughness < 0.2)) m.roughness = 0.75;
        m.needsUpdate = true;
        n++;
      } else if (m.map && isStubMap(m.map)) {
        m.map = null;
        m.needsUpdate = true;
      }
    }
  });
  root.userData.grudge6MaterialMode = 'embedded';
  return n;
}

/**
 * Bind race atlas onto every mesh.
 * Soft path (default): swap `map` on existing materials (matches GRUDGE6_Characters).
 * Hard path: only when mesh has no material.
 * Never inverts UVs — that is a separate, opt-in step.
 *
 * @param {typeof import('three')} THREE
 * @param {import('three').Object3D} root
 * @param {import('three').Texture} texture
 */
export function bindRaceAtlas(THREE, root, texture) {
  if (!texture || !root) return 0;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  let n = 0;
  root.traverse((obj) => {
    if (!obj.isMesh && !obj.isSkinnedMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;

    const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
    if (!mats.length) {
      obj.material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        metalness: 0,
        roughness: 0.75,
        side: THREE.DoubleSide,
      });
      n++;
      return;
    }

    const next = mats.map((mat) => {
      if (!mat) {
        return new THREE.MeshStandardMaterial({
          map: texture,
          color: 0xffffff,
          metalness: 0,
          roughness: 0.75,
          side: THREE.DoubleSide,
        });
      }
      // Clone so we do not mutate shared FBX/glTF material templates across kits
      const m = typeof mat.clone === 'function' ? mat.clone() : mat;
      m.map = texture;
      if (m.color?.setHex) m.color.setHex(0xffffff);
      if ('metalness' in m) m.metalness = 0;
      if ('roughness' in m) m.roughness = 0.75;
      if ('side' in m) m.side = THREE.DoubleSide;
      // Avoid accidental cutouts from stale alphaTest on cloned mats
      if ('alphaTest' in m && m.alphaTest > 0 && m.alphaTest < 0.5) m.alphaTest = 0;
      m.needsUpdate = true;
      return m;
    });
    obj.material = next.length === 1 ? next[0] : next;
    n++;
  });
  root.userData.grudge6AtlasBound = true;
  root.userData.grudge6MaterialMode = 'atlas-rebind';
  return n;
}

/**
 * Invert UV V once (idempotent).
 * ONLY for Blender glTF exports that still disagree with FBX atlas space.
 * Production CDN race GLBs from asset-convert must NOT use this (already correct).
 * @returns {boolean} true if inverted this call
 */
export function invertGeometryUVV(root, { force = false } = {}) {
  if (!root) return false;
  if (root.userData.grudge6UvVInverted && !force) return false;
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
  root.userData.grudge6UvVInverted = true;
  return true;
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
 * Find first named node (Bip001 space or underscore).
 * @param {import('three').Object3D} root
 * @param {string[]} names
 */
function findNamed(root, names) {
  for (const n of names) {
    const o = root.getObjectByName(n);
    if (o) return o;
  }
  return null;
}

/**
 * Bone-driven structural AABB for grudge6 skinned kits.
 *
 * CRITICAL: modular Units_* SkinnedMesh geometry is authored in *local bind*
 * pieces near the origin. `geometry.boundingBox * matrixWorld` and
 * `SkinnedMesh.computeBoundingBox()` are UNSKINNED — they measure a pile of
 * parts at the root (~3–5 m) while the real skinned silhouette is ~20–25 m
 * (Unity scale 2.54). SI fit then under-scales → paperdoll looks like
 * exploded modular debris in frame.
 *
 * Bones follow the bind pose correctly; measure them (feet→head + hands).
 *
 * @param {typeof import('three')} THREE
 * @param {import('three').Object3D} root
 * @returns {import('three').Box3 | null}
 */
export function measureBoneStructuralBBox(THREE, root) {
  if (!root || !THREE) return null;
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton) o.skeleton.update();
  });

  const groups = [
    ['Bip001_Head', 'Bip001 Head', 'Head'],
    ['Bip001_HeadNub', 'Bip001 HeadNub'],
    ['Bip001_Pelvis', 'Bip001 Pelvis', 'Pelvis'],
    ['Bip001_Spine', 'Bip001 Spine'],
    ['Bip001_L_Foot', 'Bip001 L Foot'],
    ['Bip001_R_Foot', 'Bip001 R Foot'],
    ['Bip001_L_Toe0', 'Bip001 L Toe0'],
    ['Bip001_R_Toe0', 'Bip001 R Toe0'],
    ['Bip001_L_Hand', 'Bip001 L Hand'],
    ['Bip001_R_Hand', 'Bip001 R Hand'],
    ['Bip001_L_Calf', 'Bip001 L Calf'],
    ['Bip001_R_Calf', 'Bip001 R Calf'],
  ];

  const box = new THREE.Box3();
  let n = 0;
  const p = new THREE.Vector3();
  for (const names of groups) {
    const bone = findNamed(root, names);
    if (!bone) continue;
    bone.getWorldPosition(p);
    if (!Number.isFinite(p.x + p.y + p.z)) continue;
    if (n === 0) box.min.copy(p), box.max.copy(p);
    else box.expandByPoint(p);
    n++;
  }
  if (n < 2) return null;

  // Pad: ankles are not soles; skull bone is not crown. ~10% of bone height.
  const h = Math.max(box.max.y - box.min.y, 1e-4);
  const pad = Math.max(h * 0.1, h * 0.02);
  box.min.y -= pad * 0.55;
  box.max.y += pad * 0.45;
  box.min.x -= pad * 0.35;
  box.max.x += pad * 0.35;
  box.min.z -= pad * 0.35;
  box.max.z += pad * 0.35;
  return box;
}

/**
 * World AABB of structural body (skinned kits = bone measure first).
 * If onlyVisible=true (default), mesh fallback skips hidden equip variants.
 * @param {typeof import('three')} THREE
 * @param {import('three').Object3D} root
 * @param {'infantry'|'cavalry'|'siege'} characterType
 * @param {{ onlyVisible?: boolean }} opts
 */
export function measureStructuralBBox(THREE, root, characterType = 'infantry', opts = {}) {
  const onlyVisible = opts.onlyVisible !== false;
  root.updateMatrixWorld(true);

  // Infantry / cavalry heroes: bone chain is the only reliable structural meter
  // for modular skinned grudge6 kits (see measureBoneStructuralBBox docs).
  if (characterType === 'infantry' || characterType === 'cavalry') {
    const boneBox = measureBoneStructuralBBox(THREE, root);
    if (boneBox && Number.isFinite(boneBox.min.y) && Number.isFinite(boneBox.max.y)) {
      const bh = boneBox.max.y - boneBox.min.y;
      // Reject degenerate bone chains (missing feet)
      if (bh > 0.05) return boneBox;
    }
  }

  const box = new THREE.Box3();
  let any = false;
  root.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    if (onlyVisible && o.visible === false) return;
    if (!isStructuralMeshName(o.name, characterType)) return;
    if (!o.geometry) return;
    // Skinned modular geo is local-bind — do NOT use geometry.boundingBox * matrixWorld
    // (that reintroduces the explode / under-scale paperdoll bug).
    if (o.isSkinnedMesh && o.skeleton) {
      try {
        o.skeleton.update();
      } catch {
        /* ignore */
      }
    }
    // setFromObject still uses unskinned geo for SkinnedMesh in three r185 —
    // only useful for static siege/props. Prefer bone path above for heroes.
    const mb = new THREE.Box3().setFromObject(o);
    if (Number.isFinite(mb.min.y) && Number.isFinite(mb.max.y) && mb.max.y > mb.min.y) {
      if (!any) {
        box.copy(mb);
        any = true;
      } else {
        box.union(mb);
      }
    }
  });
  if (!any) {
    const fallback = measureBoneStructuralBBox(THREE, root);
    if (fallback) return fallback;
    box.setFromObject(root);
  }
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

/**
 * Default view facing (Characters lab + Race Scenes + Warstrat lobby).
 *
 * Camera sits on **+Z** looking at the origin (typical OrbitControls start).
 * Grudge6 / Toon RTS kits are **art-forward +Z** after SI plant → yaw **0**
 * faces the user. **Never** use Math.PI here (that shows the back).
 *
 * Author FBX that still faces +X needs +π/2 once (see facePlusXArtToPlusZ).
 */
export const GRUDGE6_FACE_CAMERA_YAW = 0;
/** FBX art often faces +X → play +Z with one yaw. */
export const GRUDGE6_ART_PLUSX_TO_PLUSZ_YAW = Math.PI / 2;

/**
 * Face root toward the user camera (+Z).
 * @param {import('three').Object3D} root
 * @param {{ artFacesPlusX?: boolean }} [opts]
 */
export function faceRootTowardCamera(root, opts = {}) {
  const yaw = opts.artFacesPlusX ? GRUDGE6_ART_PLUSX_TO_PLUSZ_YAW : GRUDGE6_FACE_CAMERA_YAW;
  root.rotation.set(0, yaw, 0);
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
 * Load race kit + catalog equipment + materials (HARDENED Warlords play).
 *
 * Default source = **toonRts** (PLAY). Non-play sources require explicit opts.source
 * and set root.userData.grudge6Play = false.
 *
 * Texture SSOT:
 *  - Toon play GLB: keep embeds (normalize only). forceAtlas on play needs allowForceAtlas.
 *  - FBX / stub maps / team atlas variant: rebind CDN atlas, flipY=false.
 *  - invert UV V: OPT-IN only (`opts.invertUvV === true`).
 *
 * @param {object} loaders { FBXLoader, GLTFLoader } classes
 * @param {string} raceId
 * @param {{ source?: string, url?: string, meshIds?: string[], ground?: boolean,
 *           atlasVariant?: string, forceAtlas?: boolean, allowForceAtlas?: boolean,
 *           invertUvV?: boolean, skipDefaultLoadout?: boolean, targetHeight?: number,
 *           characterType?: string, centerXZ?: boolean, play?: boolean }} opts
 */
export async function loadRaceKit(THREE, loaders, raceId, opts = {}) {
  const race = RACE_ASSETS[raceId];
  if (!race) throw new Error(`Unknown race: ${raceId}`);

  // GOLDEN default = toonRts. Never races bake / metaverse as implicit default.
  const source = opts.source || 'toonRts';
  const nonPlaySources = new Set([
    'fbx',
    'raceFbx',
    'races',
    'racesBake',
    'compare',
    'prodBake',
    'metaverse',
  ]);
  const isPlay =
    opts.play !== false && !nonPlaySources.has(source) && source !== 'fbx';

  let url = opts.url || kitUrl(raceId, source);
  // Only rewrite legacy play paths to golden; leave explicit racesBake / fbx alone
  if (!nonPlaySources.has(source)) {
    url = resolveCanonicalAssetUrl(url);
  }

  if (isPlay) {
    assertPlayKitUrl(url, { allowNonPlay: false });
  }

  let root;
  let animations = [];
  const isFbxUrl = /\.fbx($|\?)/i.test(url);
  if (isFbxUrl) {
    if (isPlay) {
      throw new Error('[grudge6-kit] PLAY refuse FBX — use Toon RTS GLB');
    }
    if (!loaders.FBXLoader) throw new Error('[grudge6-kit] FBXLoader required for fbx source');
    const loader = new loaders.FBXLoader();
    root = await loader.loadAsync(url);
    animations = root.animations || [];
  } else {
    if (!loaders.GLTFLoader) throw new Error('[grudge6-kit] GLTFLoader required');
    const loader = new loaders.GLTFLoader();
    const gltf = await loader.loadAsync(url);
    root = gltf.scene || gltf;
    animations = gltf.animations || [];
  }

  // Bind pose as loaded — do not multi-pose (head-at-feet)
  safeSkeletonUpdate(root, { poseWidestOnce: false });

  // Opt-in UV V flip only (Blender export mismatch). Idempotent.
  let uvInverted = false;
  if (opts.invertUvV === true) {
    uvInverted = invertGeometryUVV(root);
  }

  const atlasVariant = opts.atlasVariant || 'default';
  const hasUsable = kitHasUsableMaps(root);

  // PLAY Toon: never forceAtlas unless allowForceAtlas (lab emergency only)
  let forceAtlas = opts.forceAtlas === true;
  if (isPlay && forceAtlas && opts.allowForceAtlas !== true) {
    console.warn(
      '[grudge6-kit] PLAY ignored forceAtlas (set allowForceAtlas:true only for lab emergencies)',
    );
    forceAtlas = false;
  }

  const mustRebind =
    forceAtlas ||
    isFbxUrl ||
    !hasUsable ||
    (atlasVariant && atlasVariant !== 'default');

  let tex = null;
  let matCount = 0;
  let materialMode = 'none';

  if (mustRebind) {
    tex = await loadRaceTexture(THREE, raceId, atlasVariant);
    if (tex) {
      matCount = bindRaceAtlas(THREE, root, tex);
      materialMode = uvInverted ? 'atlas-rebind+invert' : 'atlas-rebind';
    } else if (hasUsable) {
      matCount = normalizeEmbeddedMaps(THREE, root);
      materialMode = 'embedded-fallback';
    }
  } else {
    matCount = normalizeEmbeddedMaps(THREE, root);
    materialMode = 'embedded';
    tex = await loadRaceTexture(THREE, raceId, atlasVariant);
  }

  root.userData.grudge6MaterialMode = materialMode;
  root.userData.grudge6UvVInverted = !!root.userData.grudge6UvVInverted;
  root.userData.grudge6Play = isPlay;
  root.userData.grudge6Source = isFbxUrl ? 'fbx' : source;
  root.userData.grudge6KitUrl = url;
  root.userData.warlordsPlayContract = WARLORDS_PLAY_CONTRACT_VERSION;
  root.userData.importPipeline = isPlay ? 'toon-rts-glb' : source;

  const equip = new EquipmentManager(race.prefix);
  equip.catalog(root);
  let equipResult = null;
  if (opts.meshIds?.length) equipResult = equip.applyMeshIds(opts.meshIds);
  else if (opts.skipDefaultLoadout) {
    // Leave all equippable hidden — caller applies paperdoll loadout
  } else equip.applyDefaultLoadout();

  // Harden exclusive visibility after equip
  if (typeof equip.hardenVisibility === 'function' && !opts.skipDefaultLoadout) {
    equip.hardenVisibility();
  }

  let ground = null;
  if (opts.ground !== false) {
    // Bone structural SI — not setFromObject(SkinnedMesh)
    ground = fitRootUniformSi(THREE, root, opts.targetHeight ?? 1.8, {
      characterType: opts.characterType || 'infantry',
      centerXZ: opts.centerXZ !== false,
    });
    // Toon play faces camera with yaw 0 (never π/2 by default)
    if (isPlay && opts.facePlusZ !== true) {
      faceRootTowardCamera(root, { artFacesPlusX: false });
    } else if (opts.facePlusZ === true) {
      faceRootTowardCamera(root, { artFacesPlusX: true });
    }
  }

  return {
    root,
    animations,
    equip,
    race,
    url,
    source: isFbxUrl ? 'fbx' : source,
    play: isPlay,
    contract: WARLORDS_PLAY_CONTRACT_VERSION,
    atlas: tex,
    matCount,
    materialMode,
    uvInverted,
    equipResult,
    ground,
  };
}

/** Machine-readable contract blob for API / agents. */
export function warlordsPlayContract() {
  return {
    version: WARLORDS_PLAY_CONTRACT_VERSION,
    cdn: CDN,
    playKitPath: WARLORDS_PLAY_KIT_PATH,
    raceIds: [...WARLORDS_PLAY_RACE_IDS],
    kitUrlTemplate: `${CDN}/${WARLORDS_PLAY_KIT_PATH}{raceId}.glb`,
    code: 'ObjectStore/js/grudge6-kit.js#loadRaceKit',
    banned: [...WARLORDS_PLAY_BANNED],
    siHumanM: 1.8,
    faceCameraYawPlay: GRUDGE6_FACE_CAMERA_YAW,
    materialsPlay: 'embedded-normalize',
    equip: 'mesh_ids_visibility',
    skeleton: 'Bip001_no_multi_pose',
    measure: 'bone_structural_bbox',
  };
}
