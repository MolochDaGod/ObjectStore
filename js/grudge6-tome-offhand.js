/**
 * grudge6-tome-offhand.js — Off-hand tome prefab behavior for main-panel / labs.
 *
 * Rest: hover behind left shoulder (off-hand side).
 * Cast: move down toward L_hand / L_shield (shield-adjacent off-hand), play cast anim if present.
 *
 * Mesh SSOT (split from Documents/book_set.glb):
 *   assets.grudge-studio.com/models/weapons/tomes/tome_{arcanist|blacksmith|knight|warlock}.glb
 *   …_cast.glb includes spell VFX + NLA clips
 *
 * Bones (Toon RTS / grudge6):
 *   rest  → Bip001 L Clavicle / L UpperArm (fallback L_hand)
 *   cast  → L_hand_container → L_shield_container → Bip001 L Hand
 *
 * Extends lab weapons SSOT (grudge6-lab-weapons.js) — does not invent a second attach system.
 */

/**
 * THREE + GLTFLoader are injected by the host (main-panel uses esm.sh three@0.185).
 * Do not hard-import 'three' — keeps paperdoll and labs on one peer.
 */
import {
  LAB_WEAPON_KIND,
  findSocket,
  fitLabWeaponSi,
  applyLabWeaponToonMaterials,
} from './grudge6-lab-weapons.js';

const CDN = 'https://assets.grudge-studio.com';

/** Catalog of book_set split tomes */
export const TOME_VARIANTS = {
  arcanist: {
    id: 'tome_arcanist',
    name: 'Arcanist Tome',
    mesh: `${CDN}/models/weapons/tomes/tome_arcanist.glb`,
    castMesh: `${CDN}/models/weapons/tomes/tome_arcanist_cast.glb`,
    castClips: ['Spells_ArcanistSpell', 'Spells_ArcanistSpell.001'],
  },
  blacksmith: {
    id: 'tome_blacksmith',
    name: 'Blacksmith Tome',
    mesh: `${CDN}/models/weapons/tomes/tome_blacksmith.glb`,
    castMesh: `${CDN}/models/weapons/tomes/tome_blacksmith_cast.glb`,
    castClips: ['Spells_BlacksmithSpell', 'Spells_BlacksmithSpell.001'],
  },
  knight: {
    id: 'tome_knight',
    name: 'Knight Tome',
    mesh: `${CDN}/models/weapons/tomes/tome_knight.glb`,
    castMesh: `${CDN}/models/weapons/tomes/tome_knight_cast.glb`,
    castClips: ['Spells_KnightSpell', 'Spells_KnightSpell.001'],
  },
  warlock: {
    id: 'tome_warlock',
    name: 'Warlock Tome',
    mesh: `${CDN}/models/weapons/tomes/tome_warlock.glb`,
    castMesh: `${CDN}/models/weapons/tomes/tome_warlock_cast.glb`,
    castClips: ['Spells_WarlockSpell', 'Spells_WarlockSpell.001'],
  },
};

export const TOME_CDN_KEYS = Object.values(TOME_VARIANTS).flatMap((v) => [
  v.mesh.replace(CDN + '/', ''),
  v.castMesh.replace(CDN + '/', ''),
]);

/** Shoulder rest sockets (off-hand / left) */
const SHOULDER_BONES = [
  'Bip001 L Clavicle',
  'Bip001_L_Clavicle',
  'Bip001 L UpperArm',
  'Bip001_L_UpperArm',
  'mixamorig:LeftShoulder',
  'mixamorigLeftShoulder',
  'L_clavicle',
  'LeftShoulder',
];

/** Cast / read position near shield / left hand */
const CAST_SOCKETS = [
  'L_hand_container',
  'L_shield_container',
  'Bone_L_Shield',
  'Bip001 L Hand',
  'Bip001_L_Hand',
  'mixamorig:LeftHand',
];

const REST_LOCAL = {
  // Behind left shoulder, slightly up + back (meters, local to shoulder)
  pos: { x: -0.06, y: 0.12, z: -0.14 },
  euler: { x: 0.4, y: 0.9, z: 0.15 },
  hoverAmp: 0.012,
  hoverHz: 1.1,
};

const CAST_LOCAL = {
  // Near off-hand / shield plane (in front of left palm)
  pos: { x: 0.05, y: 0.04, z: 0.08 },
  euler: { x: -0.55, y: 0.2, z: 0.35 },
};

function findBone(root, names) {
  if (!root) return null;
  for (const n of names) {
    const o = root.getObjectByName(n);
    if (o) return o;
  }
  // soft match
  let hit = null;
  root.traverse((o) => {
    if (hit) return;
    const nm = o.name || '';
    for (const n of names) {
      if (nm === n || nm.endsWith(n) || nm.includes(n.replace(/\s/g, ''))) {
        hit = o;
        return;
      }
    }
  });
  return hit;
}

const _cache = new Map();

export async function loadTomeGltf(GLTFLoader, url) {
  if (_cache.has(url)) return _cache.get(url);
  const loader = new GLTFLoader();
  const p = loader.loadAsync(url).then((g) => {
    _cache.set(url, g);
    return g;
  });
  _cache.set(url, p);
  return p;
}

/**
 * Create a tome offhand controller bound to a character kit root.
 * @param {typeof THREE} THREE
 * @param {{ GLTFLoader: typeof GLTFLoader }} loaders
 * @param {THREE.Object3D} kitRoot - grudge6 race root
 * @param {{ variant?: string, useCastMesh?: boolean }} opts
 */
export async function createTomeOffhand(THREE, loaders, kitRoot, opts = {}) {
  const variantKey = String(opts.variant || 'arcanist').toLowerCase();
  const def = TOME_VARIANTS[variantKey] || TOME_VARIANTS.arcanist;
  const url = opts.useCastMesh !== false ? def.castMesh : def.mesh;
  const gltf = await loadTomeGltf(loaders.GLTFLoader, url);
  const root = gltf.scene.clone(true);
  root.name = def.id;

  // SI already baked ~0.28m; light re-fit
  fitLabWeaponSi(THREE, root, LAB_WEAPON_KIND.tome.targetLenM);
  try {
    applyLabWeaponToonMaterials(THREE, root);
  } catch {
    /* optional */
  }

  const shoulder =
    findBone(kitRoot, SHOULDER_BONES) ||
    findSocket(kitRoot, 'off_hand') ||
    kitRoot;
  const castSocket =
    findBone(kitRoot, CAST_SOCKETS) ||
    findSocket(kitRoot, 'off_hand') ||
    shoulder;

  // Pivot lives under shoulder for rest; we reparent on cast transitions
  const pivot = new THREE.Group();
  pivot.name = 'tome_offhand_pivot';
  shoulder.add(pivot);
  pivot.add(root);
  root.position.set(REST_LOCAL.pos.x, REST_LOCAL.pos.y, REST_LOCAL.pos.z);
  root.rotation.set(REST_LOCAL.euler.x, REST_LOCAL.euler.y, REST_LOCAL.euler.z);

  let mixer = null;
  let castAction = null;
  if (gltf.animations?.length) {
    mixer = new THREE.AnimationMixer(root);
    const prefer = def.castClips || [];
    let clip =
      gltf.animations.find((c) => prefer.some((p) => c.name.includes(p.replace('Spells_', '')))) ||
      gltf.animations.find((c) => /spell|cast|open/i.test(c.name)) ||
      gltf.animations[0];
    if (clip) {
      castAction = mixer.clipAction(clip);
      castAction.setLoop(THREE.LoopOnce, 1);
      castAction.clampWhenFinished = true;
    }
  }

  const state = {
    mode: 'rest', // rest | casting | cast
    t: 0,
    blend: 0, // 0 rest → 1 cast pose
    castDuration: 0.55,
  };

  const _tmpPos = new THREE.Vector3();
  const _tmpQuat = new THREE.Quaternion();
  const _restPos = new THREE.Vector3(REST_LOCAL.pos.x, REST_LOCAL.pos.y, REST_LOCAL.pos.z);
  const _castPos = new THREE.Vector3(CAST_LOCAL.pos.x, CAST_LOCAL.pos.y, CAST_LOCAL.pos.z);
  const _restQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(REST_LOCAL.euler.x, REST_LOCAL.euler.y, REST_LOCAL.euler.z),
  );
  const _castQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(CAST_LOCAL.euler.x, CAST_LOCAL.euler.y, CAST_LOCAL.euler.z),
  );

  function setLocalPose(blend, hoverY = 0) {
    _tmpPos.lerpVectors(_restPos, _castPos, blend);
    _tmpPos.y += hoverY * (1 - blend);
    root.position.copy(_tmpPos);
    _tmpQuat.slerpQuaternions(_restQuat, _castQuat, blend);
    root.quaternion.copy(_tmpQuat);
  }

  /**
   * Call when character starts a magic cast / tome skill.
   */
  function beginCast() {
    state.mode = 'casting';
    state.t = 0;
    // Reparent to cast socket while preserving world transform
    if (castSocket && root.parent !== castSocket) {
      castSocket.attach(root);
      // re-apply local cast blend from current
    }
    if (castAction) {
      castAction.reset();
      castAction.play();
    }
  }

  /**
   * End cast — return to shoulder hover.
   */
  function endCast() {
    state.mode = 'rest';
    state.t = 0;
    if (shoulder && root.parent !== shoulder) {
      shoulder.attach(root);
    }
    if (castAction) {
      castAction.fadeOut(0.2);
    }
  }

  /**
   * Per-frame update (seconds).
   */
  function update(dt) {
    if (mixer) mixer.update(dt);
    state.t += dt;

    if (state.mode === 'casting') {
      state.blend = Math.min(1, state.blend + dt / state.castDuration);
      if (state.blend >= 1) state.mode = 'cast';
    } else if (state.mode === 'rest') {
      state.blend = Math.max(0, state.blend - dt / (state.castDuration * 1.2));
    }

    const hover =
      Math.sin(state.t * Math.PI * 2 * REST_LOCAL.hoverHz) * REST_LOCAL.hoverAmp;
    setLocalPose(state.blend, hover);
  }

  function dispose() {
    if (root.parent) root.parent.remove(root);
    if (pivot.parent) pivot.parent.remove(pivot);
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose?.();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m.dispose?.());
      }
    });
  }

  return {
    root,
    pivot,
    def,
    beginCast,
    endCast,
    update,
    dispose,
    get mode() {
      return state.mode;
    },
    get blend() {
      return state.blend;
    },
  };
}

/**
 * Prefab descriptor for master-weaponSkills / ObjectStore catalogs.
 */
export function tomePrefabBlock(variant = 'arcanist') {
  const def = TOME_VARIANTS[String(variant).toLowerCase()] || TOME_VARIANTS.arcanist;
  return {
    modelRef: def.mesh,
    castModelRef: def.castMesh,
    animationClip: 'magic', // character pack
    propAnimation: def.castClips[0] || null,
    attach: 'off_hand',
    restSocket: 'shoulder_l',
    castSocket: 'L_hand_container',
    restOffset: { ...REST_LOCAL.pos },
    castOffset: { ...CAST_LOCAL.pos },
    behavior: 'tome_shoulder_hover_cast',
    kind: 'tome',
    targetLenM: LAB_WEAPON_KIND.tome.targetLenM,
    animPack: 'magic',
  };
}

/**
 * Resolve item → tome variant slug from name/category.
 */
export function resolveTomeVariant(item) {
  const n = String(item?.name || item?.id || item?.uuid || '').toLowerCase();
  if (/warlock|shadow|void|necro|death/i.test(n)) return 'warlock';
  if (/knight|holy|light|paladin|order/i.test(n)) return 'knight';
  if (/blacksmith|forge|fire|ember|craft/i.test(n)) return 'blacksmith';
  if (/arcane|mage|wizard|arcanist|spell/i.test(n)) return 'arcanist';
  return 'arcanist';
}

export function isTomeItem(item) {
  if (!item) return false;
  const t = String(item.type || item.category || '').toLowerCase();
  const n = String(item.name || '').toLowerCase();
  return (
    t === 'tome' ||
    t === 'offhand-tome' ||
    t === 'grimoire' ||
    /tome|grimoire|spellbook|codex|book/i.test(n) ||
    /tome|book|grimoire/i.test(t)
  );
}

export { REST_LOCAL, CAST_LOCAL, SHOULDER_BONES, CAST_SOCKETS };
