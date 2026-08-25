/**
 * Main Panel hero viewport — SSOT path via grudge6-kit.js
 *
 * Visual contract (grudge6 paperdoll):
 *  1. Production kit from CDN (GLB primary + embedded atlas; FBX fallback)
 *  2. EquipmentManager: hide all → exclusive body/weapon variants only
 *  3. hardenVisibility() — no ghost layers
 *  4. Root SI fit only (1.8 m human; no special orc stretch) — never per-mesh scale
 *  5. NEVER write Euler/yaw on the kit root after mixer.update.
 *  6. CDN Mixamo→Bip001 idle (Bip001_* tracks) is Y-up. FBX bind uses −90 X
 *     on Bip001 so bind stands. Playing those clips on top of −90 folds the
 *     doll after first paint. Identity the kit quaternion ONCE before mixer,
 *     then sample idle, then plant. Do not also parent the −90.
 *  7. Never auto invert UV V on production kits (opts.invertUvV opt-in only)
 */
import * as THREE from 'https://esm.sh/three@0.185.0';
import { GLTFLoader } from 'https://esm.sh/three@0.185.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://esm.sh/three@0.185.0/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.185.0/examples/jsm/controls/OrbitControls.js';
import {
  RACE_ASSETS,
  ATLAS_VARIANTS,
  loadRaceKit,
  loadRaceTexture,
  bindRaceAtlas,
  bindRigidHeldToHands,
  WEAPON_R,
  WEAPON_L,
  WEAPON_1H,
  measureStructuralBBox,
  GRUDGE6_FACE_CAMERA_YAW,
} from './grudge6-kit.js';
import {
  createTomeOffhand,
  isTomeItem,
  resolveTomeVariant,
} from './grudge6-tome-offhand.js';
import {
  applyWeaponHoldPose,
  resolveHoldKindFromEquip,
} from './grudge6-weapon-hold-pose.js?v=holdspin2';
import {
  PaperdollPreviewPlayer,
  paperdollSkipHoldPose,
} from './grudge6-anim-packs.js?v=paperdollidle3';
import {
  placeRootBetweenFeet,
  applyFootIk,
  flatGround,
} from './grudge6-foot-ik.js?v=feet1';

/**
 * Paperdoll SI — one human yardstick for ALL races (grudge6-cdn-ssot:
 * no special orc stretch). Proportions come from the mesh, not per-race height hacks.
 */
const PAPERDOLL_HEIGHT_M = 1.8;

/** Panel armor slot → kit equip slot (canonical paperdoll → grudge6 kit) */
const PANEL_TO_BODY = {
  Helm: 'head',
  Chest: 'body',
  Hands: 'arms',
  Legs: 'legs',
  Feet: 'legs', // Toon kits fold boots into legs mesh
  Shoulder: 'shoulders',
  Cloak: 'shoulders',
};

/**
 * Facing is the WRAPPER's job. Do not set kit-root Euler after the mixer.
 * Kept as a no-op export so old call sites do not reintroduce the fold.
 */
export const FACE_CAMERA_YAW = GRUDGE6_FACE_CAMERA_YAW;

export function applyFaceCamera(_root, _yaw = FACE_CAMERA_YAW) {
  // Intentionally empty. Writing root.rotation after mixer.update decomposes
  // the Bip001 quaternion to Euler and folds the character (3rd time).
}

/**
 * Race → baked idle clip on assets CDN (verified HEAD 200).
 * Prefer pack idle; fall back to locomotion/idle.json.
 * Tracks use Bip001_* names — rematchClipBones maps _ ↔ space for FBX kits.
 */
const IDLE_CLIP_URLS = {
  human: [
    'https://assets.grudge-studio.com/anims/baked/sword_shield/sword-and-shield-idle.json',
    'https://assets.grudge-studio.com/anims/baked/locomotion/idle.json',
  ],
  barbarian: [
    'https://assets.grudge-studio.com/anims/baked/sword_shield/sword-and-shield-idle.json',
    'https://assets.grudge-studio.com/anims/baked/locomotion/idle.json',
  ],
  orc: [
    'https://assets.grudge-studio.com/anims/baked/sword_shield/sword-and-shield-idle.json',
    'https://assets.grudge-studio.com/anims/baked/locomotion/idle.json',
  ],
  elf: [
    'https://assets.grudge-studio.com/anims/baked/longbow/idle.json',
    'https://assets.grudge-studio.com/anims/baked/locomotion/idle.json',
  ],
  undead: [
    'https://assets.grudge-studio.com/anims/baked/locomotion/idle.json',
  ],
  dwarf: [
    'https://assets.grudge-studio.com/anims/baked/sword_shield/sword-and-shield-idle.json',
    'https://assets.grudge-studio.com/anims/baked/locomotion/idle.json',
  ],
};

function armorLetterFromItem(item) {
  if (!item) return 'A';
  const v = item.variant || item.meshVariant || item.armorVariant;
  if (v && /^[A-Za-z]$/.test(String(v))) return String(v).toUpperCase();
  const n = String(item.name || item.label || '');
  const m = n.match(/\b([A-D])\b/);
  if (m) return m[1].toUpperCase();
  const t = Number(item.tier) || 1;
  if (t <= 1) return 'A';
  if (t === 2) return 'B';
  if (t === 3) return 'C';
  return 'A';
}

function weaponSlotFromItem(item) {
  if (!item) return null;
  const cat = String(item.category || item.type || item.name || '').toLowerCase();
  if (/shield/.test(cat)) return 'shield';
  if (/sword|blade/.test(cat)) return 'sword';
  if (/axe|greataxe/.test(cat)) return 'axe';
  if (/hammer|maul/.test(cat)) return 'hammer';
  if (/mace|club/.test(cat)) return 'mace';
  if (/dagger|knife/.test(cat)) return 'dagger';
  if (/spear|lance|pole/.test(cat)) return 'spear';
  if (/pick/.test(cat)) return 'pick';
  if (/bow|longbow|crossbow/.test(cat)) return 'bow';
  if (/tome|grimoire|spellbook|offhand-tome|codex/.test(cat)) return 'tome';
  if (/staff|stave|wand/.test(cat)) return 'staff';
  if (/gun|rifle|pistol/.test(cat)) return 'sword';
  return null;
}

/** Anim pack kind from catalog item (guns stay pistol/rifle even if kit mesh is sword). */
function animKindFromItem(item) {
  if (!item) return null;
  const cat = String(item.category || item.type || item.weaponType || item.name || '').toLowerCase();
  if (/rifle|shotgun/.test(cat)) return 'rifle';
  if (/\bpistol\b|handgun|\bguns?\b|flint/.test(cat) && !/crossbow/.test(cat)) return 'pistol';
  if (/shield/.test(cat)) return 'shield';
  if (/spear|lance|pole/.test(cat)) return 'spear';
  if (/hammer|maul/.test(cat)) return /2h|hammers2h/.test(cat) ? 'hammers2h' : 'hammer';
  if (/greataxe/.test(cat)) return 'greataxe';
  if (/greatsword/.test(cat)) return 'greatsword';
  if (/\baxe\b/.test(cat)) return 'axe';
  if (/dagger|knife/.test(cat)) return 'dagger';
  if (/mace|club/.test(cat)) return 'mace';
  if (/bow|longbow|crossbow/.test(cat)) return 'bow';
  if (/staff|stave|wand/.test(cat)) return 'staff';
  if (/tome|grimoire/.test(cat)) return 'tome';
  if (/claw/.test(cat)) return 'claw';
  if (/sword|blade/.test(cat)) return 'sword';
  return weaponSlotFromItem(item);
}

/** True if kit 1H weapon can equip main or off (same bone reception). */
function isOneHandWeaponSlot(slot) {
  return slot && WEAPON_1H.has(slot);
}

function pickVariant(slotMap, preferred) {
  if (!slotMap) return null;
  const keys = Object.keys(slotMap);
  if (!keys.length) return null;
  if (preferred && slotMap[preferred]) return preferred;
  if (slotMap.A) return 'A';
  if (slotMap._default) return '_default';
  return keys.sort()[0];
}

/**
 * Apply paperdoll equippedItems onto EquipmentManager.
 */
export function applyPanelEquip(equip, equippedItems, findItem) {
  if (!equip) return;

  for (const [panelSlot, kitSlot] of Object.entries(PANEL_TO_BODY)) {
    const uuid = equippedItems?.[panelSlot];
    const item = uuid && findItem ? findItem(uuid) : null;
    const letter = armorLetterFromItem(item);
    const v = pickVariant(equip.slots[kitSlot], item ? letter : 'A');
    if (v) equip.equip(kitSlot, v);
    else if (!item) {
      const def = pickVariant(equip.slots[kitSlot], 'A');
      if (def) equip.equip(kitSlot, def);
    } else equip.unequip?.(kitSlot);
  }

  if (!equippedItems?.Shoulder && !equippedItems?.Cloak && equip.slots.shoulders) {
    equip.unequip('shoulders');
  }

  equip.hideGroup('weapon_r');
  equip.hideGroup('weapon_l');
  equip.hideGroup('shield');
  equip.hideGroup('utility');
  equip.clearOffhandClone?.();

  const main = equippedItems?.Mainhand && findItem ? findItem(equippedItems.Mainhand) : null;
  const off = equippedItems?.Offhand && findItem ? findItem(equippedItems.Offhand) : null;

  if (main) {
    const slot = weaponSlotFromItem(main);
    if (slot && slot !== 'shield' && slot !== 'tome') {
      const letter = armorLetterFromItem(main);
      if (WEAPON_R.has(slot) || WEAPON_L.has(slot)) {
        const v =
          pickVariant(equip.slots[slot], letter) ||
          pickVariant(equip.slots[slot], '_default');
        if (v) equip.equipWeapon(slot, v);
      }
    } else if (slot === 'shield') {
      const v = pickVariant(equip.slots.shield, armorLetterFromItem(main));
      if (v) equip.equip('shield', v);
    }
  } else {
    // No mainhand: still show a default sword for paperdoll preview (variant A)
    if (equip.slots.sword) {
      const v = pickVariant(equip.slots.sword, 'A');
      if (v) equip.equipWeapon('sword', v);
    }
  }

  // Off-hand: same 1H weapons as main (clone → L_hand), OR shield, OR tome
  equip._pendingTomeOffhand = null;
  if (off) {
    const slot = weaponSlotFromItem(off);
    if (slot === 'shield' || /shield/i.test(String(off.category || off.type || ''))) {
      const v = pickVariant(equip.slots.shield, armorLetterFromItem(off));
      if (v) equip.equip('shield', v);
    } else if (isTomeItem(off) || slot === 'tome') {
      equip._pendingTomeOffhand = off;
    } else if (isOneHandWeaponSlot(slot) || isOneHandWeaponSlot(weaponSlotFromItem({ ...off, category: off.type }))) {
      // Same reception as main: sword/dagger/mace/hammer/axe on L_hand_container
      const kind = isOneHandWeaponSlot(slot) ? slot : 'sword';
      const letter = armorLetterFromItem(off);
      const v =
        pickVariant(equip.slots[kind], letter) ||
        pickVariant(equip.slots[kind], '_default') ||
        pickVariant(equip.slots.sword, letter) ||
        pickVariant(equip.slots.dagger, '_default');
      const useSlot = equip.slots[kind] && v ? kind : equip.slots.dagger ? 'dagger' : equip.slots.sword ? 'sword' : null;
      const useVar = useSlot
        ? pickVariant(equip.slots[useSlot], letter) || pickVariant(equip.slots[useSlot], '_default')
        : null;
      if (useSlot && useVar && typeof equip.equipWeaponOffhand === 'function') {
        equip.equipWeaponOffhand(useSlot, useVar);
      }
    }
  }

  // Utility always off on paperdoll
  for (const m of equip.allMeshes || []) {
    const n = (m.name || '').toLowerCase();
    if (/bag|wood|lumber|quiver|xtra_/.test(n)) m.visible = false;
  }

  // CRITICAL: only equipped slots remain visible (no stacked ghosts)
  if (typeof equip.hardenVisibility === 'function') {
    equip.hardenVisibility();
  } else {
    // Fallback if old kit cached
    const keep = new Set();
    for (const [slot, variant] of Object.entries(equip.equipped || {})) {
      const mesh = equip.slots[slot]?.[variant];
      if (mesh) keep.add(mesh.uuid);
    }
    for (const m of equip.allMeshes || []) {
      m.visible = keep.has(m.uuid);
    }
  }
}

/**
 * SI plant WITHOUT touching rotation.
 * fitRootUniformSi zeros root.rotation — that destroys FBX/Bip001 Y-up
 * (−π/2 on the scene root) and folds the doll after idle samples.
 */
function plantPaperdollSi(root, targetH) {
  if (!root) return 0;
  // Scale + feet only. Leave quaternion / Euler exactly as authored (and as
  // the mixer last wrote). Do not identity-rotate — that folds Bip001.
  root.position.set(0, 0, 0);
  root.scale.setScalar(1);
  root.updateMatrixWorld(true);

  let box = measureStructuralBBox(THREE, root, 'infantry', { onlyVisible: true });
  if (!box || !Number.isFinite(box.min.y)) {
    box = new THREE.Box3().setFromObject(root);
  }
  let h = Math.max(box.max.y - box.min.y, 1e-4);
  if (h > 40) {
    root.scale.setScalar(0.01);
    root.updateMatrixWorld(true);
    box = measureStructuralBBox(THREE, root, 'infantry', { onlyVisible: true }) || box;
    h = Math.max(box.max.y - box.min.y, 1e-4);
  }
  root.scale.multiplyScalar(targetH / h);
  root.updateMatrixWorld(true);
  if (!placeRootBetweenFeet(root, flatGround)) {
    box = measureStructuralBBox(THREE, root, 'infantry', { onlyVisible: true });
    if (!box || !Number.isFinite(box.min.y)) box = new THREE.Box3().setFromObject(root);
    root.position.x -= (box.min.x + box.max.x) * 0.5;
    root.position.z -= (box.min.z + box.max.z) * 0.5;
    root.position.y -= box.min.y;
    root.updateMatrixWorld(true);
  }
  applyFootIk(root, flatGround);
  const out = measureStructuralBBox(THREE, root, 'infantry', { onlyVisible: true });
  return out && Number.isFinite(out.max.y) ? out.max.y - out.min.y : targetH;
}

/** Mixamo→Bip001 JSON uses Bip001_Pelvis (underscore). Native FBX uses spaces. */
function isMixamoBipBake(clip) {
  return !!clip?.tracks?.some((t) => /^Bip001_/.test(t.name || ''));
}

/**
 * Drop root / exact-Bip001 / position tracks. Mixer on Bip001 (the FBX hip
 * root) plus Mixamo pelvis is the fold. Keep Pelvis/Spine/limbs only.
 */
function rematchClipBones(root, clip) {
  if (!clip?.tracks?.length || !root) return clip;
  const names = new Set();
  root.traverse((o) => {
    if (o.name) names.add(o.name);
  });
  const skipNode = (node) => {
    if (!node) return true;
    if (node === root.name) return true;
    if (/^(Bip001|RootNode|Armature|Scene|Hips|mixamorigHips)$/i.test(node)) return true;
    if (
      /(?:weapon_|units_)?(?:sword|axe|hammer|mace|dagger|spear|bow|staff|shield|pick)(?:_[A-Z])?$/i.test(
        node,
      ) &&
      !/hand|bip|mixamo|container/i.test(node)
    ) {
      return true;
    }
    return false;
  };
  const resolved = [];
  for (const track of clip.tracks) {
    // Skip hip/root position and scale — prevents float after SI ground
    if (/\.position$|\.scale$/i.test(track.name)) continue;
    const dot = track.name.indexOf('.');
    const node = dot < 0 ? track.name : track.name.slice(0, dot);
    if (skipNode(node)) continue;
  for (const track of clip.tracks) {
    if (/\.(position|scale)$/.test(track.name)) continue;
    const dot = track.name.indexOf('.');
    const node = dot < 0 ? track.name : track.name.slice(0, dot);
    if (skipNode(node)) continue;
    if (dot < 0) continue;
    const prop = track.name.slice(dot + 1);
    if (prop !== 'quaternion') continue;
    let hit = null;
    if (names.has(node)) hit = node;
    else if (names.has(node.replace(/_/g, ' '))) hit = node.replace(/_/g, ' ');
    else if (names.has(node.replace(/ /g, '_'))) hit = node.replace(/ /g, '_');
    if (!hit || skipNode(hit)) continue;
    if (hit !== node) {
      const t = track.clone();
      t.name = `${hit}.${prop}`;
      resolved.push(t);
    } else {
      resolved.push(track);
    }
  }
  if (!resolved.length) return null;
  return new THREE.AnimationClip(clip.name, clip.duration, resolved);
}

/** Load first available baked Bip001 idle JSON from URL list */
async function tryLoadIdleClip(urls) {
  const list = Array.isArray(urls) ? urls : urls ? [urls] : [];
  for (const url of list) {
    if (!url) continue;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || /^\s*</.test(text)) continue;
      const data = JSON.parse(text);
      // Fleet baked: { name, duration, tracks:[{name,times,values,type}] }
      if (data.tracks && Array.isArray(data.tracks)) {
        return THREE.AnimationClip.parse(data);
      }
      if (data.clip) return THREE.AnimationClip.parse(data.clip);
    } catch (e) {
      console.warn('[main-panel hero] idle fetch fail', url, e);
    }
  }
  return null;
}

/** Plant feet after first anim sample (position tracks may have shifted hips). */
function reGroundFeet(root) {
  if (!root) return;
  root.updateMatrixWorld(true);
  // Bone/structural measure — never setFromObject on modular skinned kits
  // (unskinned Units_* geo piles at origin and plants feet wrong).
  const box = measureStructuralBBox(THREE, root, 'infantry', { onlyVisible: true });
  if (!box || !Number.isFinite(box.min.y)) return;
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);
}

let _state = null;

/**
 * Mount / remount hero 3D preview into host element.
 * @param {HTMLElement} host
 * @param {{ race: string, equippedItems: Record<string,string>, findItem: (uuid:string)=>any, source?: 'fbx'|'glb' }} opts
 */
export async function mountHeroViewport(host, opts) {
  if (!host) return;
  disposeHeroViewport();

  const race = opts.race || 'human';
  if (!RACE_ASSETS[race]) {
    console.warn('[main-panel hero] unknown race', race);
  }
  const targetH = PAPERDOLL_HEIGHT_M;
  const w = Math.max(host.clientWidth, 200);
  const h = Math.max(host.clientHeight, 280);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x120c08);
  const camera = new THREE.PerspectiveCamera(35, w / h, 0.05, 80);
  // Slightly elevated look-at for full body in frame
  camera.position.set(0, 1.05, 3.6);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.innerHTML = '';
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;border-radius:8px;';

  scene.add(new THREE.AmbientLight(0xfff0e0, 0.55));
  scene.add(new THREE.HemisphereLight(0xffe8c8, 0x1a1008, 0.7));
  const key = new THREE.DirectionalLight(0xfff5e6, 1.2);
  key.position.set(2.5, 4, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa0c0ff, 0.35);
  fill.position.set(-2, 1.5, -1);
  scene.add(fill);
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 32),
    new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.9, 0);
  controls.enableDamping = true;
  controls.autoRotate = false;
  controls.minDistance = 1.4;
  controls.maxDistance = 7;
  controls.maxPolarAngle = Math.PI * 0.55;

  const status = document.createElement('div');
  status.style.cssText =
    'position:absolute;left:8px;bottom:8px;font-size:9px;color:#8a7a60;pointer-events:none;font-family:monospace;z-index:2;';
  status.textContent = `Loading ${race} kit…`;
  host.style.position = 'relative';
  host.appendChild(status);

  let root = null;
  let doll = null;
  let equip = null;
  let mixer = null;
  let poseReady = false;
  let lastEquipArgs = { equippedItems: opts.equippedItems || {}, findItem: opts.findItem };
  let raf = 0;
  let disposed = false;
  /** @type {Awaited<ReturnType<typeof createTomeOffhand>>|null} */
  let tomeCtrl = null;
  const clock = new THREE.Clock();

  function kindsFromEquip(equippedItems, findItem) {
    const main = equippedItems?.Mainhand && findItem ? findItem(equippedItems.Mainhand) : null;
    const off = equippedItems?.Offhand && findItem ? findItem(equippedItems.Offhand) : null;
    const mainKind =
      animKindFromItem(main) || (equip ? resolveHoldKindFromEquip(equip) : 'sword') || 'sword';
    const offKind = animKindFromItem(off);
    const twoHanded = /greatsword|greataxe|hammers2h|staff|spear|bow|rifle/.test(String(mainKind));
    return { mainKind, offKind, twoHanded };
  }

  async function refreshPreview(equippedItems, findItem) {
    if (!preview || disposed) return;
    const k = kindsFromEquip(equippedItems, findItem);
    try {
      const pack = await preview.setLoadout(k.mainKind, k.offKind, { twoHanded: k.twoHanded });
      if (status?.parentNode && pack) status.textContent = `${race} · ${pack}`;
    } catch (e) {
      console.warn('[main-panel hero] pack idle', e);
    }
  }

  const tick = () => {
    if (disposed) return;
    const dt = clock.getDelta();
    if (poseReady && mixer) mixer.update(dt);
    if (poseReady && root) {
      placeRootBetweenFeet(root, flatGround);
      applyFootIk(root, flatGround);
    }
    if (poseReady && mixer && equip) {
      const kind = resolveHoldKindFromEquip(equip);
      const offKind = equip.equippedOffhand?.slot || null;
      applyWeaponHoldPose(mixer, 'idle', kind, {
        THREE,
        hand: 'both',
        offKind,
        root,
      });
    }
    if (tomeCtrl) tomeCtrl.update(dt);
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const onResize = () => {
    if (disposed || !host.isConnected) return;
    const nw = Math.max(host.clientWidth, 200);
    const nh = Math.max(host.clientHeight, 280);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh, false);
  };
  window.addEventListener('resize', onResize);

  _state = {
    disposed: false,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (tomeCtrl) {
        try { tomeCtrl.dispose(); } catch { /* ok */ }
        tomeCtrl = null;
      }
      if (preview) {
        try { preview.dispose(); } catch { /* ok */ }
        preview = null;
      }
      if (root) scene.remove(root);
      mixer = null;
      equip = null;
      host.innerHTML = '';
      _state = null;
    },
    applyEquip(equippedItems, findItem) {
      if (!equip) return;
      lastEquipArgs = { equippedItems: equippedItems || {}, findItem };
      applyPanelEquip(equip, equippedItems || {}, findItem);
      bindRigidHeldToHands(root, equip);
      void refreshPreview(equippedItems || {}, findItem);
      // Async external tome (book_set split) — shoulder rest → cast on L hand
      const pending = equip._pendingTomeOffhand;
      void (async () => {
        if (tomeCtrl) {
          try { tomeCtrl.dispose(); } catch { /* ok */ }
          tomeCtrl = null;
        }
        if (!pending || !root || disposed) return;
        try {
          const variant = resolveTomeVariant(pending);
          tomeCtrl = await createTomeOffhand(THREE, { GLTFLoader }, root, {
            variant,
            useCastMesh: true,
          });
          // Rest pose only — no demo cast loop, no spinning weapons.
        } catch (e) {
          console.warn('[main-panel] tome offhand', e);
        }
      })();
    },
    /** Trigger tome cast pose (skills / hotkeys) */
    castTome() {
      tomeCtrl?.beginCast();
    },
    endTomeCast() {
      tomeCtrl?.endCast();
    },
    setSlot(slot, variant) {
      if (!equip) return false;
      if (!variant) {
        if (WEAPON_R.has(slot) || WEAPON_L.has(slot)) {
          equip.hideGroup?.(WEAPON_R.has(slot) ? 'weapon_r' : 'weapon_l');
        } else if (slot === 'shield') {
          equip.hideGroup?.('shield');
        } else {
          equip.unequip?.(slot);
        }
        equip.hardenVisibility?.();
        return true;
      }
      if (WEAPON_R.has(slot) || WEAPON_L.has(slot)) {
        equip.equipWeapon(slot, variant || '_default');
      } else {
        equip.equip(slot, variant);
      }
      equip.hardenVisibility?.();
      return true;
    },
    getSlots() {
      return equip?.summary?.() || equip?.summary() || {};
    },
    getVisibleMeshes() {
      return (equip?.allMeshes || [])
        .filter((m) => m.visible)
        .map((m) => m.name);
    },
    async setAtlas(variant = 'default') {
      if (!root) return 0;
      // Team / color swap: rebind atlas only — never invert UVs (already on kit)
      const tex = await loadRaceTexture(THREE, race, variant);
      if (!tex) return 0;
      const n = bindRaceAtlas(THREE, root, tex);
      root.userData.grudge6MaterialMode = 'atlas-rebind';
      return n;
    },
    listAtlasVariants() {
      return Object.keys(ATLAS_VARIANTS[race] || { default: true });
    },
    root: null,
    equip: null,
  };

  try {
    // Paperdoll SSOT: GLB is fine once SI measure uses bones (see grudge6-kit
    // measureBoneStructuralBBox). Prefer GLB for atlas embed; FBX fallback.
    // Never pass invertUvV here — that double-process scrambles production kits.
    let kit;
    try {
      kit = await loadRaceKit(THREE, { FBXLoader, GLTFLoader }, race, {
        // GOLDEN Toon RTS {race}.glb — paperdoll is not world play (no foot IK)
        source: opts.source || 'toonRts',
        play: false,
        ground: false,
        skipDefaultLoadout: true,
        atlasVariant: opts.atlasVariant || 'default',
        forceAtlas: !!(opts.atlasVariant && opts.atlasVariant !== 'default'),
        invertUvV: opts.invertUvV === true,
      });
    } catch (glbErr) {
      console.warn('[main-panel hero] Toon RTS fail, trying FBX', glbErr);
      kit = await loadRaceKit(THREE, { FBXLoader, GLTFLoader }, race, {
        source: 'fbx',
        ground: false,
        skipDefaultLoadout: true,
        atlasVariant: opts.atlasVariant || 'default',
        forceAtlas: true,
        invertUvV: false,
      });
    }
    if (disposed) return;

    root = kit.root;
    equip = kit.equip;

    // Baseline wardrobe (body/arms/legs/head A + sword) then overlay bag.
    // Empty bag must not leave a T-pose with zero visible meshes.
    equip.applyDefaultLoadout?.();
    applyPanelEquip(equip, opts.equippedItems || {}, opts.findItem);
    equip.hardenVisibility?.();
    let vis = equip.allMeshes?.filter((m) => m.visible).length ?? 0;
    if (vis < 1) {
      equip.applyDefaultLoadout?.();
      equip.hardenVisibility?.();
      vis = equip.allMeshes?.filter((m) => m.visible).length ?? 0;
    }
    bindRigidHeldToHands(root, equip);

    // CDN Mixamo bake only. Embedded kit clips (when present) are a second
    // mixer source and fight the bake — that is the late fold.
    const idleClip = await tryLoadIdleClip(IDLE_CLIP_URLS[race] || IDLE_CLIP_URLS.human);
    if (idleClip && isMixamoBipBake(idleClip)) {
      root.quaternion.identity();
    }

    let finalH = 0;
    if (idleClip) {
      mixer = new THREE.AnimationMixer(root);
      let idle = idleClip;
      try {
        idle = rematchClipBones(root, idle) || idle;
      } catch (remapErr) {
        console.warn('[main-panel hero] bone remap skipped', remapErr);
      }
      try {
        const action = mixer.clipAction(idle);
        action.play();
        mixer.update(1 / 30);
      } catch (animErr) {
        console.warn('[main-panel hero] idle bind failed (skeleton mismatch?)', animErr);
      }
    }
    finalH = plantPaperdollSi(root, targetH);

    doll = new THREE.Group();
    doll.name = 'paperdoll-facing';
    doll.add(root);
    scene.add(doll);
    _state.root = root;
    _state.doll = doll;
    _state.equip = equip;
    _state.materialMode = kit.materialMode;
    clock.getDelta();
    poseReady = true;

    vis = equip.allMeshes?.filter((m) => m.visible).length ?? 0;
    const matMode = kit.materialMode || root.userData.grudge6MaterialMode || '?';
    status.textContent = `${race} · ${kit.source} · h≈${finalH.toFixed(2)}m · vis=${vis}`;
    console.info('[main-panel hero]', {
      race,
      url: kit.url,
      source: kit.source,
      materialMode: matMode,
      uvInverted: !!kit.uvInverted,
      matCount: kit.matCount,
      height: finalH,
      visible: vis,
      visibleNames: equip.allMeshes?.filter((m) => m.visible).map((m) => m.name),
      slots: equip.summary?.() || equip.summary(),
      note: 'mixamo idle in Y-up; no Euler after mixer',
    });
    setTimeout(() => {
      if (status.parentNode) status.remove();
    }, 3200);
  } catch (e) {
    console.error('[main-panel hero]', e);
    status.textContent = 'Hero kit failed — check CDN FBX/atlas';
    status.style.color = '#c44';
  }
}

export function disposeHeroViewport() {
  if (_state) _state.dispose();
}

export function refreshHeroEquip(equippedItems, findItem) {
  if (_state?.applyEquip) _state.applyEquip(equippedItems, findItem);
}

export function setHeroMeshSlot(slot, variant) {
  return _state?.setSlot?.(slot, variant) ?? false;
}

export function getHeroMeshSlots() {
  return _state?.getSlots?.() || {};
}

export function getHeroVisibleMeshes() {
  return _state?.getVisibleMeshes?.() || [];
}

export async function setHeroAtlas(variant) {
  return _state?.setAtlas?.(variant) ?? 0;
}

export function listHeroAtlasVariants() {
  return _state?.listAtlasVariants?.() || ['default'];
}
