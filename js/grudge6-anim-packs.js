/**
 * grudge6 anim packs — SSOT bridge from disk `_anim_packs` / CDN baked Bip001.
 *
 * Ideal ship path (no old systems, no stretch):
 *   weapon → pack id → baked JSON (rotation-first) → rematch Bip001 → mixer
 *
 * Local author root (dev): D:\Games\Models\_anim_packs\{pack}\*.fbx
 * Production runtime: https://assets.grudge-studio.com/anims/baked/{pack}/…
 */
export const CDN = 'https://assets.grudge-studio.com';

/** Weapon kit slot → anim pack id (grudge6-combat-runtime). */
export const WEAPON_TO_PACK = {
  sword: 'sword_shield',
  axe: 'sword_shield',
  hammer: 'sword_shield',
  mace: 'sword_shield',
  dagger: 'sword_shield',
  spear: 'sword_shield',
  pick: 'sword_shield',
  shield: 'sword_shield',
  bow: 'longbow',
  staff: 'magic',
};

/** Preferred idle / attack clip URLs per pack (CDN verified where possible). */
export const PACK_CLIPS = {
  sword_shield: {
    idle: [
      `${CDN}/anims/baked/sword_shield/sword-and-shield-idle.json`,
      `${CDN}/anims/baked/locomotion/idle.json`,
    ],
    attack: [
      `${CDN}/anims/baked/sword_shield/sword-and-shield-attack.json`,
    ],
  },
  longbow: {
    idle: [
      `${CDN}/anims/baked/longbow/idle.json`,
      `${CDN}/anims/baked/locomotion/idle.json`,
    ],
    attack: [
      `${CDN}/anims/baked/longbow/standing-draw-arrow.json`,
      `${CDN}/anims/baked/longbow/draw.json`,
    ],
  },
  magic: {
    idle: [
      `${CDN}/anims/baked/locomotion/idle.json`,
    ],
    attack: [
      `${CDN}/anims/baked/locomotion/idle.json`,
    ],
  },
  rifle: {
    idle: [`${CDN}/anims/baked/locomotion/idle.json`],
    attack: [],
  },
  locomotion: {
    idle: [`${CDN}/anims/baked/locomotion/idle.json`],
    attack: [],
  },
};

export function packForWeaponSlot(weaponSlot) {
  if (!weaponSlot) return 'sword_shield';
  return WEAPON_TO_PACK[weaponSlot] || 'sword_shield';
}

/**
 * Rematch baked tracks onto kit bones (space vs underscore).
 * Drops .position so grounded SI feet stay planted.
 */
export function rematchClipBones(THREE, root, clip) {
  if (!clip?.tracks?.length || !root) return clip;
  const names = new Set();
  root.traverse((o) => {
    if (o.name) names.add(o.name);
  });
  const resolved = [];
  for (const track of clip.tracks) {
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
  return new THREE.AnimationClip(clip.name || 'clip', clip.duration, resolved);
}

export async function loadBakedClip(THREE, urls) {
  const list = Array.isArray(urls) ? urls : urls ? [urls] : [];
  for (const url of list) {
    if (!url) continue;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.tracks && Array.isArray(data.tracks)) {
        return THREE.AnimationClip.parse(data);
      }
      if (data.clip) return THREE.AnimationClip.parse(data.clip);
    } catch {
      /* next */
    }
  }
  return null;
}

/** Load idle (and optional attack) for a weapon slot; bind to root mixer. */
export async function playPackIdle(THREE, root, mixer, weaponSlot = 'sword') {
  const pack = packForWeaponSlot(weaponSlot);
  const urls = PACK_CLIPS[pack]?.idle || PACK_CLIPS.locomotion.idle;
  let clip = await loadBakedClip(THREE, urls);
  if (!clip) return { pack, action: null, clip: null };
  clip = rematchClipBones(THREE, root, clip) || clip;
  const action = mixer.clipAction(clip);
  action.reset().play();
  mixer.update(1 / 30);
  return { pack, action, clip };
}
