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
  sword: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 1.05, animPack: 'sword_shield' },
  axe: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 1.05, animPack: '2h_melee' },
  spear: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 2.0, animPack: '2h_melee' },
  crossbow: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 0.95, animPack: 'longbow' },
  dagger: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 0.45, animPack: 'sword_shield' },
  mace: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 1.0, animPack: '2h_melee' },
  hammer: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 0.9, animPack: '2h_melee' },
  staff: { defaultSlot: 'staff', canOffhand: false, targetLenM: 1.85, animPack: 'magic' },
  wand: { defaultSlot: 'staff', canOffhand: false, targetLenM: 1.85, animPack: 'magic' },
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
    if (!meta.canOffhand) return null;
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
        map.colorSpace = THREE.SRGBColorSpace;
        map.flipY = false;
        map.needsUpdate = true;
      }
      n++;
      if (Toon) {
        const t = new Toon({
          map,
          color: map ? 0xffffff : mat.color?.getHex?.() ?? 0xcccccc,
          side: THREE.FrontSide,
        });
        if (mat.normalMap) t.normalMap = mat.normalMap;
        return t;
      }
      const m = mat.clone?.() || mat;
      if (m.color?.setHex) m.color.setHex(map ? 0xffffff : m.color.getHex?.() ?? 0xcccccc);
      if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0.15, 0.2);
      if ('roughness' in m) m.roughness = Math.max(m.roughness ?? 0.7, 0.55);
      m.map = map;
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
export function attachToSocket(kitRoot, weaponRoot, slot, held) {
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
  weaponRoot.position.set(0, 0, 0);
  weaponRoot.rotation.set(0, 0, 0);
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
