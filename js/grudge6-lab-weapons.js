/**
 * grudge6 lab tier weapons — external GLBs (not race kit children).
 *
 * Attach SSOT (match Toon RTS kit hierarchy):
 *   R_hand_container  — main hand (sword, axe, spear, hammer, mace, dagger, crossbow)
 *   L_hand_container  — staff / wand / bow (same socket as kit staff & bow)
 *   L_hand_container  — off-hand dual: dagger | mace | hammer only
 *   L_shield_container — shields (kit only; not lab tier)
 *
 * Pipeline: load GLB → SI normalize → toon materials → hand socket → box collider userData.
 * Does NOT rewrite race kit binaries.
 */

/** @typedef {'main_hand'|'staff'|'off_hand'} LabAttachSlot */

/** Kit socket name candidates (first match wins). */
export const LAB_SOCKETS = {
  main_hand: ['R_hand_container', 'Bip001 R Hand', 'Bip001_R_Hand', 'mixamorig:RightHand'],
  staff: ['L_hand_container', 'Bip001 L Hand', 'Bip001_L_Hand', 'mixamorig:LeftHand'],
  off_hand: ['L_hand_container', 'Bip001 L Hand', 'Bip001_L_Hand', 'mixamorig:LeftHand'],
};

/**
 * Per kind: default attach + dual-wield off-hand allow.
 * Wand → staff socket (same as kit staff/bow).
 */
export const LAB_WEAPON_KIND = {
  // 1H — same reception main OR off (L_hand clone of kit mesh)
  sword: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 1.05, animPack: 'sword_shield' },
  dagger: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 0.45, animPack: 'sword_shield' },
  knife: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 0.4, animPack: 'sword_shield' },
  // 2H melee — main only
  greatsword: {
    defaultSlot: 'main_hand',
    canOffhand: false,
    targetLenM: 1.55,
    animPack: '2h_melee',
  },
  greataxe: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 1.35, animPack: '2h_melee' },
  axe: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 1.05, animPack: '2h_melee' },
  spear: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 2.0, animPack: '2h_melee' },
  mace: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 1.0, animPack: '2h_melee' },
  hammer: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 0.9, animPack: '2h_melee' },
  // ranged / magic
  crossbow: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 0.95, animPack: 'longbow' },
  staff: { defaultSlot: 'staff', canOffhand: false, targetLenM: 1.85, animPack: 'magic' },
  wand: { defaultSlot: 'staff', canOffhand: false, targetLenM: 0.55, animPack: 'magic' },
  /**
   * Off-hand grimoire/tome — rest: left shoulder hover; cast: L_hand / shield zone.
   * Prefab runtime: js/grudge6-tome-offhand.js (book_set.glb split).
   * Mesh SSOT: models/weapons/tomes/tome_{arcanist|blacksmith|knight|warlock}[_cast].glb
   */
  tome: {
    defaultSlot: 'off_hand',
    canOffhand: true,
    targetLenM: 0.28,
    animPack: 'magic',
    meshCdn: [
      'https://assets.grudge-studio.com/models/weapons/tomes/tome_arcanist.glb',
      'https://assets.grudge-studio.com/models/weapons/tomes/tome_warlock.glb',
      'https://assets.grudge-studio.com/models/weapons/tomes/tome_knight.glb',
      'https://assets.grudge-studio.com/models/weapons/tomes/tome_blacksmith.glb',
      'https://assets.grudge-studio.com/models/weapons/tome.glb',
      'https://assets.grudge-studio.com/models/weapons/grimoire.glb',
    ],
    gripOffset: { x: 0.04, y: 0.02, z: 0.06 },
    gripEuler: { x: -0.35, y: 0.15, z: 0.4 },
    restSocket: 'shoulder_l',
    castSocket: 'L_hand_container',
    behavior: 'tome_shoulder_hover_cast',
  },
  grimoire: {
    defaultSlot: 'off_hand',
    canOffhand: true,
    targetLenM: 0.28,
    animPack: 'magic',
    meshCdn: [
      'https://assets.grudge-studio.com/models/weapons/tomes/tome_warlock.glb',
      'https://assets.grudge-studio.com/models/weapons/tomes/tome_arcanist.glb',
      'https://assets.grudge-studio.com/models/weapons/grimoire.glb',
      'https://assets.grudge-studio.com/models/weapons/tome.glb',
    ],
    gripOffset: { x: 0.04, y: 0.02, z: 0.06 },
    gripEuler: { x: -0.35, y: 0.15, z: 0.4 },
    restSocket: 'shoulder_l',
    castSocket: 'L_hand_container',
    behavior: 'tome_shoulder_hover_cast',
  },
  bow: { defaultSlot: 'staff', canOffhand: false, targetLenM: 1.0, animPack: 'longbow' },
};

export function kindMeta(kind) {
  const k = String(kind || '').toLowerCase();
  return (
    LAB_WEAPON_KIND[k] || {
      defaultSlot: 'main_hand',
      canOffhand: false,
      targetLenM: 1.0,
      animPack: 'sword_shield',
    }
  );
}

/** Resolve attach slot for a catalog entry + role ('main' | 'off'). */
export function resolveLabAttachSlot(entry, role = 'main') {
  const meta = kindMeta(entry?.kind);
  if (role === 'off') {
    // Catalog flag wins when present; else kind table
    const ok = entry?.canOffhand != null ? !!entry.canOffhand : !!meta.canOffhand;
    if (!ok) return null;
    return 'off_hand';
  }
  // Prefer catalog.attach when valid
  const a = entry?.attach;
  if (a === 'staff' || a === 'main_hand' || a === 'off_hand') return a;
  return meta.defaultSlot;
}

export function findSocket(root, slot) {
  if (!root || !slot) return null;
  const names = LAB_SOCKETS[slot] || LAB_SOCKETS.main_hand;
  for (const n of names) {
    const o = root.getObjectByName(n);
    if (o) return o;
  }
  return null;
}

/**
 * SI fit: scale uniform so longest bbox axis ≈ targetLenM (meters).
 * Weapons author pack is already ~SI; only clamp extremes.
 */
export function fitLabWeaponSi(THREE, root, targetLenM = 1.0) {
  if (!root || !THREE) return { scale: 1, lengthM: 0 };
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return { scale: 1, lengthM: 0 };
  const size = new THREE.Vector3();
  box.getSize(size);
  const len = Math.max(size.x, size.y, size.z);
  if (!(len > 1e-4)) return { scale: 1, lengthM: 0 };
  // Only rescales if far from target (author pack is already SI)
  let scale = 1;
  if (len > targetLenM * 1.35 || len < targetLenM * 0.55) {
    scale = targetLenM / len;
    root.scale.multiplyScalar(scale);
    root.updateMatrixWorld(true);
  }
  const box2 = new THREE.Box3().setFromObject(root);
  const size2 = new THREE.Vector3();
  box2.getSize(size2);
  return {
    scale,
    lengthM: Math.max(size2.x, size2.y, size2.z),
    size: { x: size2.x, y: size2.y, z: size2.z },
  };
}

/**
 * Toon-friendly materials: MeshToonMaterial when available, else MeshStandard
 * low-metal / higher roughness, keep maps, sRGB, double-side off for weapons.
 */
export function applyLabWeaponToonMaterials(THREE, root) {
  if (!root || !THREE) return 0;
  let n = 0;
  const Toon = THREE.MeshToonMaterial;
  root.traverse((obj) => {
    if (!obj.isMesh && !obj.isSkinnedMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const list = Array.isArray(obj.material) ? obj.material : [obj.material];
    const next = list.map((mat) => {
      if (!mat) {
        n++;
        return Toon
          ? new Toon({ color: 0xcccccc })
          : new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.1, roughness: 0.75 });
      }
      const map = mat.map || null;
      if (map) {
        // sRGB base color; flipY false matches glTF-embedded maps
        if ('colorSpace' in map) map.colorSpace = THREE.SRGBColorSpace;
        else if ('encoding' in map) map.encoding = THREE.sRGBEncoding;
        map.flipY = false;
        map.needsUpdate = true;
      }
      n++;
      // Prefer texture-driven color (0xffffff) so cover/page art is not crushed
      const baseColor = map ? 0xffffff : mat.color?.getHex?.() ?? 0xc4a574;
      if (Toon) {
        const t = new Toon({
          map,
          color: baseColor,
          side: THREE.FrontSide,
        });
        if (mat.normalMap) t.normalMap = mat.normalMap;
        if (mat.emissiveMap) {
          t.emissiveMap = mat.emissiveMap;
          t.emissive = new THREE.Color(0x222222);
        }
        return t;
      }
      const m = mat.clone?.() || new THREE.MeshStandardMaterial();
      if (m.color?.setHex) m.color.setHex(baseColor);
      if ('metalness' in m) m.metalness = Math.min(Number(m.metalness) || 0.12, 0.18);
      if ('roughness' in m) m.roughness = Math.max(Number(m.roughness) || 0.72, 0.6);
      m.map = map;
      m.side = THREE.FrontSide;
      m.needsUpdate = true;
      return m;
    });
    obj.material = next.length === 1 ? next[0] : next;
  });
  return n;
}

/** Axis-aligned box collider in local root space (for physics / debug). */
export function buildLabWeaponCollider(THREE, root) {
  if (!root || !THREE) return null;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return null;
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);
  // Convert world center to root-local
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  center.applyMatrix4(inv);
  // Approx local size (uniform scale assumption)
  const sx = root.scale.x || 1;
  const half = {
    x: (size.x / Math.abs(sx)) * 0.5,
    y: (size.y / Math.abs(root.scale.y || 1)) * 0.5,
    z: (size.z / Math.abs(root.scale.z || 1)) * 0.5,
  };
  return {
    type: 'box',
    halfExtents: half,
    center: { x: center.x, y: center.y, z: center.z },
    sizeM: { x: size.x, y: size.y, z: size.z },
  };
}

export function attachColliderUserData(THREE, root, meshId) {
  const col = buildLabWeaponCollider(THREE, root);
  if (!col) return null;
  root.userData.labWeaponCollider = col;
  root.userData.meshId = meshId;
  root.userData.labWeapon = true;
  return col;
}

/**
 * Prepare a loaded weapon root: SI, toon, collider, identity local TRS for hand.
 */
export function prepareLabWeaponRoot(THREE, root, entry) {
  const meta = kindMeta(entry?.kind);
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  const fit = fitLabWeaponSi(THREE, root, meta.targetLenM);
  const mats = applyLabWeaponToonMaterials(THREE, root);
  const collider = attachColliderUserData(THREE, root, entry?.meshId || entry?.id);
  root.name = entry?.meshId || entry?.id || 'lab_weapon';
  return { fit, mats, collider, meta };
}

/**
 * Attach prepared weapon under kit socket. Manages exclusive lab slots.
 * @param {{ main?: THREE.Object3D|null, off?: THREE.Object3D|null }} held
 */
/**
 * Apply grip offset so held props (esp. tome/grimoire) sit outside the palm
 * and do not pierce the forearm/body mesh.
 */
export function applyGripTransform(weaponRoot, entry) {
  if (!weaponRoot) return;
  const meta = kindMeta(entry?.kind);
  const off = entry?.gripOffset || meta.gripOffset || { x: 0, y: 0, z: 0 };
  const eu = entry?.gripEuler || meta.gripEuler || { x: 0, y: 0, z: 0 };
  weaponRoot.position.set(off.x || 0, off.y || 0, off.z || 0);
  weaponRoot.rotation.set(eu.x || 0, eu.y || 0, eu.z || 0);
}

export function attachToSocket(kitRoot, weaponRoot, slot, held, entry) {
  const socket = findSocket(kitRoot, slot);
  if (!socket) return { ok: false, error: `no socket for ${slot}` };
  // Clear previous for this logical slot
  if (slot === 'main_hand' && held.main?.parent) held.main.parent.remove(held.main);
  if ((slot === 'staff' || slot === 'off_hand') && held.off?.parent) held.off.parent.remove(held.off);
  // staff and off_hand share L_hand_container — exclusive
  if (slot === 'staff' || slot === 'off_hand') {
    if (held.off?.parent) held.off.parent.remove(held.off);
    held.off = weaponRoot;
  } else {
    held.main = weaponRoot;
  }
  socket.add(weaponRoot);
  applyGripTransform(weaponRoot, entry);
  weaponRoot.userData.labAttachSlot = slot;
  weaponRoot.userData.projectileOrigin = true; // cast bolt/heal/aura from this mesh
  return { ok: true, socket: socket.name, slot };
}

/** Hide kit weapon groups for the active lab slots. */
export function hideKitWeaponsForLab(equip, slot) {
  if (!equip) return;
  if (slot === 'main_hand') equip.hideGroup?.('weapon_r');
  if (slot === 'staff' || slot === 'off_hand') equip.hideGroup?.('weapon_l');
}

/**
 * Enrich catalog weapon row with attach SSOT (mutates copy).
 */
export function enrichWeaponEntry(w) {
  const meta = kindMeta(w.kind);
  return {
    ...w,
    attach: meta.defaultSlot,
    canOffhand: !!meta.canOffhand,
    targetLenM: meta.targetLenM,
    animPack: meta.animPack,
    sockets: {
      main: meta.defaultSlot === 'staff' ? 'L_hand_container' : 'R_hand_container',
      off: meta.canOffhand ? 'L_hand_container' : null,
    },
  };
}
