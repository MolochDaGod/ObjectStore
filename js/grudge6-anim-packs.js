/**
 * grudge6 anim packs — weapon → pack → baked Bip001 clips.
 *
 * Pack ids (combat-runtime SSOT):
 *   sword_shield | longbow | magic | 2h_melee | rifle | unarmed | locomotion
 *
 * 2h_melee = greatsword + samurai set (primary), also axe/hammer/spear when 2H.
 * Aliases: twohand, greatsword → 2h_melee
 *
 * Local author: D:\Games\Models\_anim_packs\{greatsword|sword_shield|…}\
 * Runtime hosts (first hit wins):
 *   assets.grudge-studio.com/anims/baked/
 *   open.grudge-studio.com/anims/baked/
 */
export const CDN = 'https://assets.grudge-studio.com';
export const OPEN = 'https://open.grudge-studio.com';

/** Absolute URL candidates for a baked clip relative path (no .json). */
export function bakedUrls(relNoJson) {
  const rel = String(relNoJson || '')
    .replace(/^\//, '')
    .replace(/\.json$/i, '');
  const enc = rel
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/');
  return [
    `${CDN}/anims/baked/${enc}.json`,
    `${OPEN}/anims/baked/${enc}.json`,
  ];
}

/**
 * Weapon kit slot / kind → anim pack id.
 * greatsword is 2h_melee (samurai). 1H sword+shield stays sword_shield.
 */
export const WEAPON_TO_PACK = {
  // 1H + shield
  sword: 'sword_shield',
  dagger: 'sword_shield',
  shield: 'sword_shield',
  // 2H melee (greatsword = canonical 2h_melee + samurai)
  greatsword: '2h_melee',
  greataxe: '2h_melee',
  great_axe: '2h_melee',
  twohand: '2h_melee',
  '2h': '2h_melee',
  '2h_melee': '2h_melee',
  axe: '2h_melee',
  hammer: '2h_melee',
  mace: '2h_melee',
  spear: '2h_melee',
  pick: '2h_melee',
  // ranged / magic
  bow: 'longbow',
  crossbow: 'longbow',
  staff: 'magic',
  wand: 'magic',
  rifle: 'rifle',
  unarmed: 'unarmed',
};

/** Pack aliases → canonical pack id */
export const PACK_ALIASES = {
  twohand: '2h_melee',
  '2h': '2h_melee',
  greatsword: '2h_melee',
  greataxe: '2h_melee',
  greatsword_samurai: '2h_melee',
  samurai: '2h_melee',
};

/**
 * Preferred idle / attack (and gait) clip paths per pack.
 * Paths relative to /anims/baked — resolved via bakedUrls().
 */
export const PACK_CLIPS = {
  sword_shield: {
    idle: [
      'sword_shield/sword-and-shield-idle',
      'sword_shield/sword and shield idle',
      'locomotion/idle',
    ],
    walk: ['locomotion/run_forward', 'magic/Standing Walk Forward'],
    run: ['locomotion/run_forward'],
    attack: [
      'sword_shield/sword-and-shield-attack',
      'sword_shield/sword and shield attack',
    ],
  },
  /**
   * 2H melee — greatsword + samurai (primary).
   * Also used for kit hammer/axe/spear when treated as 2H.
   */
  '2h_melee': {
    idle: [
      'greatsword_samurai/gs_samurai_idle_sword',
      'greatsword/great sword idle',
      'locomotion/idle',
    ],
    walk: [
      'greatsword_samurai/gs_samurai_walk_sword',
      'magic/Standing Walk Forward',
      'locomotion/run_forward',
    ],
    run: [
      'greatsword_samurai/gs_samurai_run_sword',
      'locomotion/run_forward',
    ],
    attack: [
      'greatsword_samurai/gs_samurai_combo_a',
      'greatsword_samurai/gs_samurai_combo_b',
      'greatsword/great sword attack',
      'greatsword/great sword slash',
    ],
    skill1: ['greatsword_samurai/gs_samurai_combo_b'],
    skill2: ['greatsword_samurai/gs_samurai_dash_opener'],
    skill3: ['greatsword_samurai/gs_samurai_teleport_strike'],
    skill4: ['greatsword_samurai/gs_samurai_jump_sword'],
  },
  longbow: {
    idle: ['longbow/idle', 'longbow/standing idle 01', 'locomotion/idle'],
    walk: ['longbow/standing walk forward', 'magic/Standing Walk Forward'],
    run: ['longbow/standing run forward', 'locomotion/run_forward'],
    attack: [
      'longbow/standing-draw-arrow',
      'longbow/standing aim recoil',
      'longbow/draw',
    ],
  },
  magic: {
    idle: ['magic/standing idle', 'magic/idle', 'locomotion/idle'],
    walk: ['magic/Standing Walk Forward'],
    run: ['magic/Standing Run Forward', 'locomotion/run_forward'],
    attack: ['magic/standing 1h cast spell 01', 'locomotion/idle'],
  },
  rifle: {
    idle: ['locomotion/idle'],
    attack: [],
  },
  unarmed: {
    idle: ['unarmed/fight_idle', 'locomotion/idle'],
    attack: ['unarmed/punching'],
  },
  locomotion: {
    idle: ['locomotion/idle'],
    walk: ['magic/Standing Walk Forward', 'locomotion/run_forward'],
    run: ['locomotion/run_forward'],
    attack: [],
  },
};

// Aliases share the same clip table
PACK_CLIPS.twohand = PACK_CLIPS['2h_melee'];
PACK_CLIPS.greatsword = PACK_CLIPS['2h_melee'];
PACK_CLIPS.greatsword_samurai = PACK_CLIPS['2h_melee'];
PACK_CLIPS.samurai = PACK_CLIPS['2h_melee'];

export function normalizePackId(packOrSlot) {
  const raw = String(packOrSlot || 'sword_shield').toLowerCase().trim();
  if (PACK_ALIASES[raw]) return PACK_ALIASES[raw];
  if (PACK_CLIPS[raw]) return raw;
  if (WEAPON_TO_PACK[raw]) return WEAPON_TO_PACK[raw];
  return 'sword_shield';
}

/** Resolve pack id from weapon kit slot / kind / pack alias. */
export function packForWeaponSlot(weaponSlot) {
  if (!weaponSlot) return 'sword_shield';
  return normalizePackId(weaponSlot);
}

/** Flatten pack role → absolute URL list (CDN then Open). */
export function clipUrlsFor(packId, role = 'idle') {
  const pack = normalizePackId(packId);
  const rels = PACK_CLIPS[pack]?.[role] || PACK_CLIPS.locomotion.idle || [];
  const urls = [];
  for (const rel of rels) {
    for (const u of bakedUrls(rel)) urls.push(u);
  }
  return urls;
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

/** Load idle for a weapon slot or pack id; bind to root mixer. */
export async function playPackIdle(THREE, root, mixer, weaponSlot = 'sword') {
  const pack = packForWeaponSlot(weaponSlot);
  const urls = clipUrlsFor(pack, 'idle');
  let clip = await loadBakedClip(THREE, urls);
  if (!clip) return { pack, action: null, clip: null };
  clip = rematchClipBones(THREE, root, clip) || clip;
  const action = mixer.clipAction(clip);
  action.reset().fadeIn(0.15).play();
  mixer.update(1 / 30);
  return { pack, action, clip };
}

/** One-shot attack (samurai combo for 2h_melee / greatsword). */
export async function playPackAttack(THREE, root, mixer, weaponSlot = 'sword') {
  const pack = packForWeaponSlot(weaponSlot);
  const urls = clipUrlsFor(pack, 'attack');
  let clip = await loadBakedClip(THREE, urls);
  if (!clip) return { pack, action: null, clip: null };
  clip = rematchClipBones(THREE, root, clip) || clip;
  const action = mixer.clipAction(clip);
  action.reset().setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;
  action.fadeIn(0.08).play();
  return { pack, action, clip };
}
