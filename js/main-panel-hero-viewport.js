/**
 * Main Panel hero viewport — grudge6 modular race GLB + equip visibility.
 * Hides bag/lumber/quiver and all unequipped mesh variants.
 */
import * as THREE from 'https://esm.sh/three@0.185.0';
import { GLTFLoader } from 'https://esm.sh/three@0.185.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.185.0/examples/jsm/controls/OrbitControls.js';

const CDN = 'https://assets.grudge-studio.com';

/** grudge6 race kits (modular Bip001 — visibility equip) */
export const RACE_GLB = {
  human: `${CDN}/models/grudge6/races/WK_Characters.glb`,
  orc: `${CDN}/models/grudge6/races/ORC_Characters.glb`,
  elf: `${CDN}/models/grudge6/races/ELF_Characters.glb`,
  dwarf: `${CDN}/models/grudge6/races/DWF_Characters.glb`,
  undead: `${CDN}/models/grudge6/races/UD_Characters.glb`,
  barbarian: `${CDN}/models/grudge6/races/BRB_Characters.glb`,
};

const RACE_PREFIX = {
  human: 'WK_',
  orc: 'ORC_',
  elf: 'ELF_',
  dwarf: 'DWF_',
  undead: 'UD_',
  barbarian: 'BRB_',
};

/** Always hidden — never part of "worn character" paperdoll */
const UTILITY_RE =
  /bag|lumber|wood_|bone_wood|bone_bag|quiver|pick_|tool_wood|xtra_|resource|log|plank/i;

/** Body part A kits — base body always shown */
const BODY_A_RE = /units_head_a|units_body_a|units_arms_a|units_legs_a/i;

/** Weapon / shield mesh (not body units) */
const WEAPONISH_RE =
  /weapon|sword|axe|bow|staff|shield|dagger|hammer|spear|mace|gun|crossbow|tome|quiver|pick/i;

/** Map paperdoll item category → mesh name hints */
function weaponHintsFromItem(item) {
  if (!item) return [];
  const cat = String(item.category || item.type || item.name || '').toLowerCase();
  const hints = [];
  if (/sword|blade/.test(cat)) hints.push('sword');
  if (/axe|greataxe/.test(cat)) hints.push('axe');
  if (/dagger|knife/.test(cat)) hints.push('dagger');
  if (/hammer|mace|club/.test(cat)) hints.push('hammer', 'mace');
  if (/spear|lance|pole/.test(cat)) hints.push('spear');
  if (/bow|longbow/.test(cat)) hints.push('bow');
  if (/crossbow/.test(cat)) hints.push('crossbow');
  if (/gun|rifle|pistol/.test(cat)) hints.push('gun', 'rifle');
  if (/staff|stave|wand/.test(cat)) hints.push('staff');
  if (/shield/.test(cat)) hints.push('shield');
  if (/tome|book|offhand/.test(cat)) hints.push('tome', 'offhand', 'book');
  if (!hints.length) {
    // last resort: first word of name
    const w = String(item.name || '').toLowerCase().split(/\s+/)[0];
    if (w) hints.push(w);
  }
  return hints;
}

function armorVariantFromItem(item) {
  if (!item) return 'A';
  // Prefer explicit variant / letter suffix
  const v = item.variant || item.meshVariant || item.armorVariant;
  if (v && /^[A-Za-z]$/.test(String(v))) return String(v).toUpperCase();
  const n = String(item.name || '');
  const m = n.match(/\b([A-D])\b/);
  if (m) return m[1].toUpperCase();
  // Tier-ish demo: tier 1 → A
  const t = Number(item.tier) || 1;
  if (t <= 1) return 'A';
  if (t === 2) return 'B';
  if (t === 3) return 'C';
  return 'A';
}

function bodySlotKey(meshName) {
  const n = meshName.toLowerCase();
  if (/units_head|head_/.test(n) && !/helmet|helm_/.test(n)) return 'head';
  if (/units_body|body_/.test(n)) return 'body';
  if (/units_arms|arms_/.test(n)) return 'arms';
  if (/units_legs|legs_/.test(n)) return 'legs';
  if (/helmet|helm_|hat|hood/.test(n)) return 'helm';
  if (/shoulder/.test(n)) return 'shoulder';
  return null;
}

/**
 * Apply visibility so only base body + currently equipped mesh gear shows.
 * @param {THREE.Object3D} root
 * @param {Record<string,string>} equippedItems slot → uuid
 * @param {(uuid:string)=>any} findItem
 */
export function applyEquipVisibility(root, equippedItems, findItem) {
  const main = equippedItems?.Mainhand ? findItem?.(equippedItems.Mainhand) : null;
  const off = equippedItems?.Offhand ? findItem?.(equippedItems.Offhand) : null;
  const helm = equippedItems?.Helm ? findItem?.(equippedItems.Helm) : null;
  const chest = equippedItems?.Chest ? findItem?.(equippedItems.Chest) : null;
  const hands = equippedItems?.Hands ? findItem?.(equippedItems.Hands) : null;
  const feet = equippedItems?.Feet ? findItem?.(equippedItems.Feet) : null;
  const shoulder = equippedItems?.Shoulder ? findItem?.(equippedItems.Shoulder) : null;

  const wantBody = {
    head: armorVariantFromItem(helm) || 'A',
    body: armorVariantFromItem(chest) || 'A',
    arms: armorVariantFromItem(hands) || 'A',
    legs: armorVariantFromItem(feet) || 'A',
  };
  // If no helm equipped, still show head A (face)
  if (!helm) wantBody.head = 'A';
  if (!chest) wantBody.body = 'A';
  if (!hands) wantBody.arms = 'A';
  if (!feet) wantBody.legs = 'A';

  const mainHints = weaponHintsFromItem(main);
  const offHints = weaponHintsFromItem(off);
  const showShoulder = !!shoulder;

  const weaponCandidates = [];

  root.traverse((o) => {
    const mesh = /** @type {THREE.Mesh} */ (o);
    if (!mesh.isMesh && !mesh.isSkinnedMesh) return;
    const name = mesh.name || '';
    const n = name.toLowerCase();

    // 1) Always hide bag / lumber / quiver / utility
    if (UTILITY_RE.test(n)) {
      mesh.visible = false;
      return;
    }

    // 2) Body kits — only one letter per slot
    const bodyKey = bodySlotKey(name);
    if (bodyKey === 'helm') {
      // Helmet meshes: only if helm equipped and name matches loosely
      mesh.visible = !!helm;
      return;
    }
    if (bodyKey === 'shoulder') {
      mesh.visible = showShoulder;
      return;
    }
    if (bodyKey === 'head' || bodyKey === 'body' || bodyKey === 'arms' || bodyKey === 'legs') {
      const letter = wantBody[bodyKey] || 'A';
      // Match _A / _B suffix or letter in name
      const hasLetter =
        new RegExp(`_${letter}(?:_|$)|units_\\w+_${letter}`, 'i').test(name) ||
        (letter === 'A' && BODY_A_RE.test(n));
      // Prefer explicit letter match; fallback show A if nothing matched later
      mesh.visible = hasLetter;
      mesh.userData.__bodyKey = bodyKey;
      mesh.userData.__letterMatch = hasLetter;
      return;
    }

    // 3) Weapons / shields — collect, decide after pass
    if (WEAPONISH_RE.test(n) && !/units_/.test(n)) {
      mesh.visible = false;
      weaponCandidates.push(mesh);
      return;
    }

    // 4) Unknown cosmetic meshes — hide (clean paperdoll)
    if (/weapon|shield|armor|helm|hat|cape|cloak|wing|tail|horn/i.test(n)) {
      mesh.visible = false;
      return;
    }

    // Skinned root / armature shells: keep if needed for skinning (usually no geometry draw)
    // Hide generic extras
    if (/camera|light|helper|collider|hitbox/i.test(n)) {
      mesh.visible = false;
    }
  });

  // Ensure each body slot has something visible (fallback A)
  for (const key of ['head', 'body', 'arms', 'legs']) {
    let any = false;
    root.traverse((o) => {
      const m = /** @type {THREE.Mesh} */ (o);
      if (!(m.isMesh || m.isSkinnedMesh)) return;
      if (m.userData.__bodyKey === key && m.visible) any = true;
    });
    if (!any) {
      root.traverse((o) => {
        const m = /** @type {THREE.Mesh} */ (o);
        if (!(m.isMesh || m.isSkinnedMesh)) return;
        if (m.userData.__bodyKey !== key) return;
        if (BODY_A_RE.test(m.name || '') || /_a(?:_|$)/i.test(m.name || '')) {
          m.visible = true;
        }
      });
    }
  }

  // Weapons: show best mainhand match + offhand/shield match
  function pickWeapon(hints, preferShield) {
    if (!hints.length && !preferShield) return null;
    let best = null;
    let bestScore = -1;
    for (const mesh of weaponCandidates) {
      const n = (mesh.name || '').toLowerCase();
      if (preferShield && !/shield/.test(n)) continue;
      if (!preferShield && /shield/.test(n)) continue;
      let score = 0;
      for (const h of hints) {
        if (n.includes(h)) score += 2;
      }
      // Prefer _A variants
      if (/_a(?:_|$)/i.test(mesh.name || '')) score += 1;
      if (score > bestScore) {
        bestScore = score;
        best = mesh;
      }
    }
    // If mainhand and no hint match, first non-shield weapon _A
    if (!best && !preferShield) {
      best =
        weaponCandidates.find((m) => !/shield/i.test(m.name || '') && /_a/i.test(m.name || '')) ||
        weaponCandidates.find((m) => !/shield/i.test(m.name || '')) ||
        null;
    }
    if (!best && preferShield) {
      best = weaponCandidates.find((m) => /shield/i.test(m.name || '')) || null;
    }
    return best;
  }

  if (main) {
    const w = pickWeapon(mainHints, /shield/i.test(String(main.category || main.type || '')));
    if (w) w.visible = true;
  }
  if (off) {
    const isShield = /shield/i.test(String(off.category || off.type || off.name || ''));
    const w = pickWeapon(offHints, isShield);
    if (w) w.visible = true;
  }
}

function fitHeight(root, targetH = 1.85) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const h = Math.max(size.y, 1e-3);
  let s = targetH / h;
  // decade fix
  if (h > 20) s = targetH / (h * 0.01) * 0.01;
  if (h > 20) {
    root.scale.multiplyScalar(0.01);
    root.updateMatrixWorld(true);
    const h2 = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).y;
    s = targetH / Math.max(h2, 1e-3);
  }
  root.scale.multiplyScalar(s);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  root.position.y -= box2.min.y;
  // center XZ
  root.position.x -= (box2.min.x + box2.max.x) * 0.5;
  root.position.z -= (box2.min.z + box2.max.z) * 0.5;
}

let _state = null;

/**
 * Mount / remount hero 3D preview into host element.
 * @param {HTMLElement} host
 * @param {{ race: string, equippedItems: Record<string,string>, findItem: (uuid:string)=>any }} opts
 */
export async function mountHeroViewport(host, opts) {
  if (!host) return;
  disposeHeroViewport();

  const race = opts.race || 'human';
  const url = RACE_GLB[race] || RACE_GLB.human;
  const w = Math.max(host.clientWidth, 200);
  const h = Math.max(host.clientHeight, 280);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x120c08);
  const camera = new THREE.PerspectiveCamera(35, w / h, 0.05, 50);
  camera.position.set(0, 1.1, 3.2);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.innerHTML = '';
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;border-radius:8px;';

  scene.add(new THREE.AmbientLight(0xfff0e0, 0.55));
  scene.add(new THREE.HemisphereLight(0xffe8c8, 0x1a1008, 0.65));
  const key = new THREE.DirectionalLight(0xfff5e6, 1.15);
  key.position.set(2.5, 4, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa0c0ff, 0.35);
  fill.position.set(-2, 1.5, -1);
  scene.add(fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.95, 0);
  controls.enableDamping = true;
  controls.minDistance = 1.4;
  controls.maxDistance = 6;
  controls.maxPolarAngle = Math.PI * 0.55;

  const status = document.createElement('div');
  status.style.cssText =
    'position:absolute;left:8px;bottom:8px;font-size:9px;color:#8a7a60;pointer-events:none;font-family:monospace;';
  status.textContent = 'Loading hero…';
  host.style.position = 'relative';
  host.appendChild(status);

  let root = null;
  let raf = 0;
  let disposed = false;

  const tick = () => {
    if (disposed) return;
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
      host.innerHTML = '';
      _state = null;
    },
    applyEquip(equippedItems, findItem) {
      if (!root) return;
      applyEquipVisibility(root, equippedItems || {}, findItem);
    },
    root: null,
  };

  try {
    const loader = new GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
    if (disposed) return;
    root = gltf.scene;
    // grudge6 art-forward +Z
    root.rotation.y = Math.PI / 2;
    fitHeight(root, 1.9);
    scene.add(root);
    applyEquipVisibility(root, opts.equippedItems || {}, opts.findItem);
    _state.root = root;
    status.textContent = `${race} · equip mesh filter on`;
    setTimeout(() => {
      if (status.parentNode) status.remove();
    }, 2200);
  } catch (e) {
    console.warn('[main-panel hero]', e);
    status.textContent = 'Hero model failed to load';
    status.style.color = '#c44';
  }
}

export function disposeHeroViewport() {
  if (_state) _state.dispose();
}

export function refreshHeroEquip(equippedItems, findItem) {
  if (_state?.applyEquip) _state.applyEquip(equippedItems, findItem);
}
