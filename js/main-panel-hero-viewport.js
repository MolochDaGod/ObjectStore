/**
 * Main Panel hero viewport — SSOT path via grudge6-kit.js
 *
 * Deep fix (vs ad-hoc GLB + soft name regex):
 *  1. loadRaceKit: race FBX preferred + race atlas rebind (sRGB, flipY=false)
 *  2. EquipmentManager: hide all equippable → show exclusive body/weapon variants
 *  3. Utility bag/lumber/quiver always off for paperdoll
 *  4. Root SI fit only (1.8 m human yardstick; race bands) — never per-mesh scale
 *  5. Art-forward +Z yaw once
 *
 * Reference: grudge6-modular-characters skill, Asset-Rig-Editor classifyPart/defaultLoadout,
 * tpose-for-mixamo SI (~1.8 m human mesh extents).
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
  fitRootUniformSi,
} from './grudge6-kit.js';

/** SI height targets (m) — human 1.8 yardstick; orc taller; dwarf shorter */
const RACE_HEIGHT_M = {
  human: 1.8,
  orc: 2.05,
  elf: 1.85,
  dwarf: 1.45,
  undead: 1.8,
  barbarian: 1.95,
};

/** Panel armor slot → kit equip slot */
const PANEL_TO_BODY = {
  Helm: 'head',
  Chest: 'body',
  Hands: 'arms',
  Feet: 'legs',
  Shoulder: 'shoulders',
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

/** Map inventory weapon category → kit weapon slot id */
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
  if (/staff|stave|wand|tome|book/.test(cat)) return 'staff';
  if (/gun|rifle|pistol/.test(cat)) return 'sword'; // no gun slot — leave unarmed look
  return null;
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
 * Mirrors customizer defaultLoadout: body A base, weapons only if equipped, utility off.
 */
export function applyPanelEquip(equip, equippedItems, findItem) {
  if (!equip) return;

  // Body slots: always one letter (A if empty)
  for (const [panelSlot, kitSlot] of Object.entries(PANEL_TO_BODY)) {
    const uuid = equippedItems?.[panelSlot];
    const item = uuid && findItem ? findItem(uuid) : null;
    const letter = armorLetterFromItem(item);
    const v = pickVariant(equip.slots[kitSlot], letter);
    if (v) equip.equip(kitSlot, v);
    else equip.unequip?.(kitSlot);
  }

  // Shoulders optional — hide if no shoulder piece
  if (!equippedItems?.Shoulder && equip.slots.shoulders) {
    equip.unequip('shoulders');
  }

  // Clear all weapons / shields / utility first
  equip.hideGroup('weapon_r');
  equip.hideGroup('weapon_l');
  equip.hideGroup('shield');
  equip.hideGroup('utility');

  const main = equippedItems?.Mainhand && findItem ? findItem(equippedItems.Mainhand) : null;
  const off = equippedItems?.Offhand && findItem ? findItem(equippedItems.Offhand) : null;

  if (main) {
    const slot = weaponSlotFromItem(main);
    if (slot && slot !== 'shield') {
      const letter = armorLetterFromItem(main);
      if (WEAPON_R.has(slot) || WEAPON_L.has(slot)) {
        const v = pickVariant(equip.slots[slot], letter) || pickVariant(equip.slots[slot], '_default');
        if (v) equip.equipWeapon(slot, v);
      }
    } else if (slot === 'shield') {
      const v = pickVariant(equip.slots.shield, armorLetterFromItem(main));
      if (v) equip.equip('shield', v);
    }
  }

  if (off) {
    const slot = weaponSlotFromItem(off);
    if (slot === 'shield' || /shield/i.test(String(off.category || off.type || ''))) {
      const v = pickVariant(equip.slots.shield, armorLetterFromItem(off));
      if (v) equip.equip('shield', v);
    }
  }

  // Hard-hide utility even if something matched wrong
  for (const m of equip.allMeshes || []) {
    const n = (m.name || '').toLowerCase();
    if (/bag|wood|lumber|quiver|xtra_/.test(n)) m.visible = false;
  }
}

/**
 * Paperdoll SI fit — ROOT uniform only + structural body measure.
 * Stretch comes from mesh.scale / non-uniform / measuring stacked variants.
 */
function fitRootSi(root, targetH) {
  const result = fitRootUniformSi(THREE, root, targetH, {
    characterType: 'infantry',
    centerXZ: true,
  });
  // Paperdoll: face camera (kit art-forward +Z; camera on +Z)
  root.rotation.y = 0;
  root.updateMatrixWorld(true);
  return result.height;
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
  const targetH = RACE_HEIGHT_M[race] ?? 1.8;
  const w = Math.max(host.clientWidth, 200);
  const h = Math.max(host.clientHeight, 280);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x120c08);
  const camera = new THREE.PerspectiveCamera(35, w / h, 0.05, 80);
  camera.position.set(0, 1.15, 3.4);
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
  controls.target.set(0, 0.95, 0);
  controls.enableDamping = true;
  controls.minDistance = 1.4;
  controls.maxDistance = 7;
  controls.maxPolarAngle = Math.PI * 0.55;

  const status = document.createElement('div');
  status.style.cssText =
    'position:absolute;left:8px;bottom:8px;font-size:9px;color:#8a7a60;pointer-events:none;font-family:monospace;z-index:2;';
  status.textContent = `Loading ${race} kit (FBX+atlas)…`;
  host.style.position = 'relative';
  host.appendChild(status);

  let root = null;
  let equip = null;
  let mixer = null;
  let raf = 0;
  let disposed = false;
  const clock = new THREE.Clock();

  const tick = () => {
    if (disposed) return;
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);
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
      if (root) scene.remove(root);
      mixer = null;
      equip = null;
      host.innerHTML = '';
      _state = null;
    },
    applyEquip(equippedItems, findItem) {
      if (!equip) return;
      applyPanelEquip(equip, equippedItems || {}, findItem);
    },
    /** Mesh-level: equip one slot letter (body A, sword B, …); empty = unequip */
    setSlot(slot, variant) {
      if (!equip) return false;
      if (!variant) {
        if (WEAPON_R.has(slot) || WEAPON_L.has(slot)) {
          equip.hideGroup?.(WEAPON_R.has(slot) ? 'weapon_r' : 'weapon_l');
          return true;
        }
        if (slot === 'shield') {
          equip.hideGroup?.('shield');
          return true;
        }
        equip.unequip?.(slot);
        return true;
      }
      if (WEAPON_R.has(slot) || WEAPON_L.has(slot)) {
        return equip.equipWeapon(slot, variant || '_default');
      }
      return equip.equip(slot, variant);
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
      const tex = await loadRaceTexture(THREE, race, variant);
      if (!tex) return 0;
      return bindRaceAtlas(THREE, root, tex);
    },
    listAtlasVariants() {
      return Object.keys(ATLAS_VARIANTS[race] || { default: true });
    },
    root: null,
    equip: null,
  };

  try {
    // Prefer production GLB (optimized); FBX fallback for paperdoll SSOT gate
    let kit;
    try {
      kit = await loadRaceKit(THREE, { FBXLoader, GLTFLoader }, race, {
        source: opts.source || 'glb',
        ground: false, // we fit ourselves with race height
        meshIds: null,
        atlasVariant: opts.atlasVariant || 'default',
      });
    } catch (glbErr) {
      console.warn('[main-panel hero] GLB fail, trying FBX', glbErr);
      kit = await loadRaceKit(THREE, { FBXLoader, GLTFLoader }, race, {
        source: 'fbx',
        ground: false,
        atlasVariant: opts.atlasVariant || 'default',
      });
    }
    if (disposed) return;

    root = kit.root;
    equip = kit.equip;

    // Paperdoll loadout (not default sword dump)
    applyPanelEquip(equip, opts.equippedItems || {}, opts.findItem);

    const finalH = fitRootSi(root, targetH);
    scene.add(root);
    _state.root = root;
    _state.equip = equip;

    // Idle clip if embedded on kit
    const clips = kit.animations || [];
    if (clips.length) {
      mixer = new THREE.AnimationMixer(root);
      const idle =
        clips.find((c) => /idle|stand|wait/i.test(c.name)) || clips[0];
      const action = mixer.clipAction(idle);
      action.play();
    }

    const vis = equip.allMeshes?.filter((m) => m.visible).length ?? 0;
    status.textContent = `${race} · ${kit.source} · atlas×${kit.matCount || 0} · h≈${finalH.toFixed(2)}m · vis=${vis}`;
    console.info('[main-panel hero]', {
      race,
      url: kit.url,
      source: kit.source,
      matCount: kit.matCount,
      height: finalH,
      visible: vis,
      slots: equip.summary?.() || equip.summary(),
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

/** Live mesh-slot edit from main-panel mesh editor UI */
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
