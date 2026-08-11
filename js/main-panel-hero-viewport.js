/**
 * Main Panel hero viewport — SSOT path via grudge6-kit.js
 *
 * Visual contract (grudge6 paperdoll):
 *  1. Production kit from CDN (GLB primary + embedded atlas; FBX fallback)
 *  2. EquipmentManager: hide all → exclusive body/weapon variants only
 *  3. hardenVisibility() — no ghost layers
 *  4. Root SI fit only (1.8 m human; no special orc stretch) — never per-mesh scale
 *  5. Face camera: yaw = 0 (Toon art-forward +Z; camera on +Z → faces user). Never π.
 *  6. Idle from CDN baked pack when kit has no embedded clips
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
  WEAPON_R,
  WEAPON_L,
  WEAPON_1H,
  fitRootUniformSi,
  measureStructuralBBox,
  faceRootTowardCamera,
  GRUDGE6_FACE_CAMERA_YAW,
} from './grudge6-kit.js';
import {
  createTomeOffhand,
  isTomeItem,
  resolveTomeVariant,
} from './grudge6-tome-offhand.js';

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
 * Paperdoll face-user yaw (SSOT: grudge6-kit GRUDGE6_FACE_CAMERA_YAW = 0).
 * Camera sits on +Z looking at origin. Toon kits are art-forward +Z at yaw 0
 * so they face the user. Math.PI shows the BACK — that was the bug.
 * Re-applied every frame so idle tracks cannot undo it.
 */
export const FACE_CAMERA_YAW = GRUDGE6_FACE_CAMERA_YAW; // 0 — not Math.PI

export function applyFaceCamera(root, yaw = FACE_CAMERA_YAW) {
  if (!root) return;
  // Kit helper: full rotation clean plant; yaw 0 faces +Z camera
  if (typeof faceRootTowardCamera === 'function' && Math.abs(yaw) < 1e-6) {
    faceRootTowardCamera(root, { artFacesPlusX: false });
  } else {
    root.rotation.order = 'YXZ';
    root.rotation.y = yaw;
  }
  root.userData.paperdollFaceYaw = root.rotation.y;
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
    const v = pickVariant(equip.slots[kitSlot], letter);
    if (v) equip.equip(kitSlot, v);
    else equip.unequip?.(kitSlot);
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
 * Paperdoll SI fit + face camera.
 * Camera on +Z → Toon face user at yaw 0 (grudge6-kit SSOT). Not π.
 */
function fitRootSi(root, targetH) {
  const result = fitRootUniformSi(THREE, root, targetH, {
    characterType: 'infantry',
    centerXZ: true,
  });
  applyFaceCamera(root, FACE_CAMERA_YAW);
  root.updateMatrixWorld(true);
  return result.height;
}

/**
 * Map baked track node names onto kit bones.
 * CDN JSON uses Bip001_Pelvis; FBX kits use "Bip001 Pelvis".
 * Drop .position tracks so grounded SI feet stay planted.
 */
function rematchClipBones(root, clip) {
  if (!clip?.tracks?.length || !root) return clip;
  const names = new Set();
  root.traverse((o) => {
    if (o.name) names.add(o.name);
  });
  const resolved = [];
  for (const track of clip.tracks) {
    // Skip hip/root position — prevents float after SI ground
    if (/\.position$/.test(track.name)) continue;
    const dot = track.name.indexOf('.');
    if (dot < 0) {
      resolved.push(track);
      continue;
    }
    const node = track.name.slice(0, dot);
    const prop = track.name.slice(dot + 1);
    let hit = null;
    if (names.has(node)) hit = node;
    else if (names.has(node.replace(/_/g, ' '))) hit = node.replace(/_/g, ' ');
    else if (names.has(node.replace(/ /g, '_'))) hit = node.replace(/ /g, '_');
    if (!hit) continue;
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
      const data = await res.json();
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

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.9, 0);
  controls.enableDamping = true;
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
  let equip = null;
  let mixer = null;
  let raf = 0;
  let disposed = false;
  /** @type {Awaited<ReturnType<typeof createTomeOffhand>>|null} */
  let tomeCtrl = null;
  const clock = new THREE.Clock();

  const tick = () => {
    if (disposed) return;
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);
    if (tomeCtrl) tomeCtrl.update(dt);
    // Lock face-user yaw after mixer (anim may write root rotation tracks)
    if (root) applyFaceCamera(root, FACE_CAMERA_YAW);
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
      if (root) scene.remove(root);
      mixer = null;
      equip = null;
      host.innerHTML = '';
      _state = null;
    },
    applyEquip(equippedItems, findItem) {
      if (!equip) return;
      applyPanelEquip(equip, equippedItems || {}, findItem);
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
          // Demo cast loop for paperdoll preview (gentle)
          let castT = 0;
          const prevUpdate = tomeCtrl.update.bind(tomeCtrl);
          tomeCtrl.update = (dt) => {
            castT += dt;
            if (castT > 4.5) {
              castT = 0;
              tomeCtrl.beginCast();
              setTimeout(() => { try { tomeCtrl?.endCast(); } catch { /* ok */ } }, 1600);
            }
            prevUpdate(dt);
          };
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
        // GOLDEN: Toon RTS pack (same as Characters lab ★) — keep embeds
        source: opts.source || 'toonRts',
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

    // Paperdoll loadout only (no default dump + panel double-apply ghosts)
    applyPanelEquip(equip, opts.equippedItems || {}, opts.findItem);
    // Exclusive wardrobe — no stacked A–N variants looking like explode
    equip.hardenVisibility?.();

    // SI fit AFTER equip visibility (bone measure ignores mesh visibility, OK)
    let finalH = fitRootSi(root, targetH);
    scene.add(root);
    _state.root = root;
    _state.equip = equip;
    _state.materialMode = kit.materialMode;

    // Idle: embedded kit clips first, else CDN baked Bip001 idle (fixes T-pose)
    let clips = (kit.animations || []).slice();
    if (!clips.length) {
      const idleClip = await tryLoadIdleClip(IDLE_CLIP_URLS[race] || IDLE_CLIP_URLS.human);
      if (idleClip) clips = [idleClip];
    }
    if (clips.length) {
      mixer = new THREE.AnimationMixer(root);
      let idle =
        clips.find((c) => /idle|stand|wait/i.test(c.name || '')) || clips[0];
      idle = rematchClipBones(root, idle) || idle;
      try {
        const action = mixer.clipAction(idle);
        action.play();
        // Sample one frame so skinned weapons leave bind-float, then re-SI + re-ground
        mixer.update(1 / 30);
        finalH = fitRootSi(root, targetH);
      } catch (animErr) {
        console.warn('[main-panel hero] idle bind failed (skeleton mismatch?)', animErr);
        reGroundFeet(root);
      }
    }

    const vis = equip.allMeshes?.filter((m) => m.visible).length ?? 0;
    const matMode = kit.materialMode || root.userData.grudge6MaterialMode || '?';
    status.textContent = `${race} · ${kit.source} · faceYaw=${(root.rotation.y).toFixed(2)} · h≈${finalH.toFixed(2)}m · vis=${vis}`;
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
      faceCameraYawSSOT: FACE_CAMERA_YAW,
      yaw: root.rotation.y,
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
