/**
 * grudge6 anim packs — weapon → pack → baked Bip001 clips.
 *
 * Pack ids (combat-runtime SSOT):
 *   WEAPON: sword_shield | 2h_melee | polearm | longbow | pistol | rifle | magic | dagger
 *   LOCO/EVENTS: locomotion_8way | traversal | unarmed | harvest | building
 *                | gestures | emotes | events | block | reactions | extra
 *
 * Bake: scripts/bake-all-weapon-anim-packs.mjs (Mixamo→Bip001 → prod/anims/<pack>)
 * Events = non-combat (channel, teleport, emote, tool, farm, build).
 * Weapon skills = attack/heavy/skill1–4 + MM lunge + block/parry overlays.
 *
 * Locomotion (Warlords):
 *   Author: D:\Games\Models\_anim_packs\grudge6_incoming_2026-08-01\grudge-8-Way-Locomotion-Pack
 *   Bake:   Mixamo → Bip001 rotation-only (bake-anims.mjs)
 *   CDN:    prod/anims/locomotion_8way/*.json
 *   Blend:  DirLocoBlend — gait bands idle@0 / walk@0.34 / run@0.7 / sprint@1 + 8 LocoDir
 *   Overlay attacks scale loco by (1 - influence) — "blend off" locomotion
 *
 * Local author: D:\Games\Models\_anim_packs\{greatsword|sword_shield|…}\
 * Runtime hosts (first hit wins):
 *   assets.grudge-studio.com/prod/anims/  (prod: prefix)
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
  shield: 'sword_shield',
  // dagger dual / dual wield
  dagger: 'dagger',
  dual_dagger: 'dagger',
  // 2H melee
  greatsword: '2h_melee',
  greataxe: '2h_melee',
  great_axe: '2h_melee',
  twohand: '2h_melee',
  '2h': '2h_melee',
  '2h_melee': '2h_melee',
  axe: '2h_melee',
  hammer: '2h_melee',
  mace: '2h_melee',
  pick: '2h_melee',
  // spear / polearm
  spear: 'polearm',
  polearm: 'polearm',
  lance: 'polearm',
  // ranged
  bow: 'longbow',
  longbow: 'longbow',
  // 1H sidearm family (pistol loco + fire overlays; also 1H xbow / tome)
  crossbow: 'pistol',
  hand_crossbow: 'pistol',
  pistol: 'pistol',
  handgun: 'pistol',
  /** Tome/grimoire cast uses magic pack; loco can still fall back to 1H sidearm if needed */
  tome: 'magic',
  grimoire: 'magic',
  book: 'magic',
  wand: 'magic',
  // 2H gun
  rifle: 'rifle',
  shotgun: 'rifle',
  // casting 2H staff
  staff: 'magic',
  magic: 'magic',
  unarmed: 'unarmed',
  adventure: 'unarmed',
  dual: 'dagger',
  kick: 'unarmed',
  stomp: 'unarmed',
  harvest: 'harvest',
  hoe: 'harvest',
};

/** Pack aliases → canonical pack id */
export const PACK_ALIASES = {
  twohand: '2h_melee',
  '2h': '2h_melee',
  greatsword: '2h_melee',
  greataxe: '2h_melee',
  greatsword_samurai: '2h_melee',
  samurai: '2h_melee',
  spear: 'polearm',
  crossbow: 'pistol',
  tome: 'magic',
  grimoire: 'magic',
  book: 'magic',
  shotgun: 'rifle',
};

/**
 * Preferred idle / attack (and gait) clip paths per pack.
 * Paths relative to /anims/baked — resolved via bakedUrls().
 */
export const PACK_CLIPS = {
  sword_shield: {
    idle: [
      'prod:sword_shield/sword-and-shield-idle.json',
      'sword_shield/sword-and-shield-idle',
      'sword_shield/sword and shield idle',
      'locomotion/idle',
    ],
    walk: [
      'prod:sword_shield/sword-and-shield-run.json',
      'locomotion/run_forward',
      'magic/Standing Walk Forward',
    ],
    run: ['prod:sword_shield/sword-and-shield-run.json', 'locomotion/run_forward'],
    attack: [
      'prod:sword_shield/sword-and-shield-attack.json',
      'prod:sword_shield/sword-and-shield-attack-2.json',
      'prod:sword_shield/one-hand-sword-combo.glb',
      'prod:sword_shield/slash-advance.glb',
      'sword_shield/sword-and-shield-attack',
      'sword_shield/sword and shield attack',
    ],
    attack2: ['prod:sword_shield/sword-and-shield-attack-2.json'],
    attack3: ['prod:sword_shield/sword-and-shield-attack-3.json'],
    heavy: ['prod:sword_shield/sword-and-shield-attack-4.json'],
    block: [
      'prod:sword_shield/sword-and-shield-block.json',
      'prod:sword_shield/sword-and-shield-block-idle.json',
    ],
    jumpAttack: [
      'prod:sword_shield/jump-attack.json',
      'prod:sword_shield/standing-melee-run-jump-attack.json',
    ],
    skill1: ['prod:sword_shield/gap-close-step.json'],
    skill2: ['prod:sword_shield/jump-attack.json'],
    skill3: ['prod:sword_shield/shield-throw.json'],
    strafe: ['prod:sword_shield/sword-and-shield-strafe.json'],
    draw: ['prod:sword_shield/draw-sword-1.json', 'prod:sword_shield/draw-sword-1.glb'],
    sheath: ['prod:sword_shield/sheath-sword-1.glb'],
  },
  /**
   * 2H melee / greatsword.
   * Author FBX: D:\Games\Models\_anim_packs\_gap_fill_stage\2h_melee
   * Prod bake:  assets…/prod/anims/2h_melee/*.glb
   * Companion:  greatsword_samurai baked JSON (fleet-proven idle/combo)
   */
  '2h_melee': {
    idle: [
      // prod gap-fill bake (when uploaded)
      'prod:2h_melee/great-sword-idle.glb',
      'greatsword_samurai/gs_samurai_idle_sword',
      'greatsword/great sword idle',
      'locomotion/idle',
    ],
    walk: [
      'prod:2h_melee/great-sword-walk.glb',
      'greatsword_samurai/gs_samurai_walk_sword',
      'magic/Standing Walk Forward',
      'locomotion/run_forward',
    ],
    run: [
      'prod:2h_melee/great-sword-run.glb',
      'greatsword_samurai/gs_samurai_run_sword',
      'locomotion/run_forward',
    ],
    attack: [
      // spear (animator-dist) + greataxe combo + greatsword
      'prod:2h_melee/lance-spartan.glb',
      'prod:2h_melee/rising-thrust.glb',
      'prod:2h_melee/upward-thrust.glb',
      'prod:2h_melee/great-axe-combo.glb',
      'prod:2h_melee/great-sword-slash.glb',
      'prod:2h_melee/great-sword-attack.glb',
      'prod:2h_melee/great-sword-slide-attack.glb',
      'greatsword_samurai/gs_samurai_combo_a',
      'greatsword_samurai/gs_samurai_combo_b',
      'greatsword/great sword attack',
      'greatsword/great sword slash',
    ],
    heavy: [
      'prod:2h_melee/great-axe-combo.glb',
      'prod:2h_melee/great-sword-high-spin-attack.glb',
      'prod:2h_melee/great-sword-jump-attack.glb',
      'greatsword_samurai/gs_samurai_combo_b',
    ],
    block: [
      'prod:2h_melee/great-sword-blocking.glb',
      'greatsword_samurai/gs_samurai_idle_sword',
    ],
    skill1: ['greatsword_samurai/gs_samurai_combo_b', 'prod:2h_melee/great-sword-slash-2.glb'],
    skill2: ['greatsword_samurai/gs_samurai_dash_opener', 'prod:2h_melee/great-sword-slide-attack.glb'],
    skill3: ['greatsword_samurai/gs_samurai_teleport_strike'],
    skill4: ['greatsword_samurai/gs_samurai_jump_sword', 'prod:2h_melee/great-sword-jump-attack.glb'],
    authorSource: 'D:\\\\Games\\\\Models\\\\_anim_packs\\\\_gap_fill_stage\\\\2h_melee',
  },
  longbow: {
    idle: [
      'prod:longbow/standing-idle-01.json',
      'prod:extra/aim-idle.glb',
      'longbow/idle',
      'longbow/standing idle 01',
      'locomotion/idle',
    ],
    walk: [
      'prod:longbow/standing-walk-forward.json',
      'longbow/standing walk forward',
      'magic/Standing Walk Forward',
    ],
    run: [
      'prod:longbow/standing-run-forward.json',
      'longbow/standing run forward',
      'locomotion/run_forward',
    ],
    attack: [
      'prod:longbow/standing-draw-arrow.json',
      'prod:longbow/standing-aim-recoil.json',
      'longbow/standing-draw-arrow',
      'longbow/draw',
    ],
    heavy: ['prod:longbow/standing-aim-overdraw.json'],
    dodgeFwd: ['prod:longbow/standing-dodge-forward.json'],
    dodgeBack: ['prod:longbow/standing-dodge-backward.json'],
    dodgeL: ['prod:longbow/standing-dodge-left.json'],
    dodgeR: ['prod:longbow/standing-dodge-right.json'],
    aim: ['prod:longbow/standing-idle-01.json', 'prod:extra/aim-idle.glb'],
  },
  magic: {
    idle: [
      'prod:magic/standing-idle.json',
      'magic/standing idle',
      'magic/idle',
      'locomotion/idle',
    ],
    walk: ['prod:magic/standing-walk-forward.json', 'magic/Standing Walk Forward'],
    run: [
      'prod:magic/standing-run-forward.json',
      'prod:magic/standing-sprint-forward.json',
      'magic/Standing Run Forward',
      'locomotion/run_forward',
    ],
    attack: [
      'prod:magic/standing-1h-cast-spell-01.json',
      'prod:magic/standing-1h-magic-attack-01.json',
      'magic/standing 1h cast spell 01',
    ],
    cast: ['prod:magic/standing-1h-cast-spell-01.json', 'prod:magic/standing-2h-cast-spell-01.json'],
    cast2h: ['prod:magic/standing-2h-cast-spell-01.json'],
    heavy: [
      'prod:magic/standing-2h-magic-attack-01.json',
      'prod:magic/standing-2h-magic-area-attack-01.json',
    ],
    skill1: ['prod:magic/standing-1h-magic-attack-02.json'],
    skill2: ['prod:magic/standing-2h-magic-attack-02.json'],
    skill3: ['prod:magic/standing-2h-magic-area-attack-01.json'],
    skill4: ['prod:magic/standing-2h-magic-area-attack-02.json'],
  },
  pistol: {
    idle: ['prod:pistol/pistol-idle.json', 'prod:pistol/idle.json', 'locomotion/idle'],
    walk: ['prod:pistol/pistol-walk.json', 'prod:pistol/walk-forward.json'],
    run: ['prod:pistol/pistol-run.json', 'prod:pistol/run-forward.json'],
    attack: [
      'prod:pistol/gunplay.json',
      'prod:pistol/bigpistol-gunplay.json',
      'prod:pistol/shotgun-gunplay.json',
    ],
    heavy: ['prod:pistol/charged-pistol.json', 'prod:pistol/crouch-rapid-fire.json'],
    skill1: ['prod:pistol/pistol-whip.json'],
    whip: ['prod:pistol/pistol-whip.json'],
    jump: ['prod:pistol/pistol-jump.json'],
    block: ['prod:rifle/block.json'],
  },
  rifle: {
    idle: [
      'prod:rifle/idle.json',
      'prod:rifle/idle-aiming.json',
      'prod:extra/aim-idle.glb',
      'locomotion/idle',
    ],
    walk: ['prod:rifle/run-forward.json', 'locomotion/run_forward'],
    run: ['prod:rifle/run-forward.json'],
    attack: [
      'prod:rifle/shotgun-gunplay.json',
      'prod:rifle/crouch-rapid-fire.json',
      'prod:pistol/gunplay.json',
    ],
    block: ['prod:rifle/block.json', 'prod:rifle/block-with-rifle.json'],
    sheath: ['prod:rifle/sheath.json', 'prod:rifle/put-back-rifle-behind-shoulder.json'],
    aim: ['prod:rifle/idle-aiming.json', 'prod:extra/aim-idle.glb'],
  },
  polearm: {
    idle: ['prod:locomotion_8way/idle.json', 'locomotion/idle'],
    walk: ['prod:locomotion_8way/walk-forward.json'],
    run: ['prod:locomotion_8way/run-forward.json'],
    attack: ['prod:polearm/stab-spear.json', 'prod:polearm/stabspear.json'],
    heavy: ['prod:polearm/spear-thrust-slash.json'],
    skill1: ['prod:polearm/spear-thrust-slash.json'],
    skill2: ['prod:polearm/upward-thrust.json'],
    skill3: ['prod:polearm/gap-close-step.json'],
    jumpAttack: ['prod:2h_melee/jump-attack.json'],
  },
  dagger: {
    idle: ['prod:locomotion_8way/idle.json', 'locomotion/idle'],
    walk: ['prod:locomotion_8way/walk-forward.json'],
    run: ['prod:locomotion_8way/run-forward.json'],
    attack: [
      'prod:dagger/double-dagger-stab.json',
      'prod:dagger/1-double-dagger-stab.json',
    ],
    attack2: ['prod:dagger/1-double-dagger-stab.json', 'prod:dagger/double-dagger-stab-2.json'],
    attack3: ['prod:dagger/double-dagger-stab-2.json'],
    heavy: ['prod:dagger/upward-thrust.json'],
    skill1: ['prod:dagger/upward-thrust.json'],
    skill2: ['prod:dagger/upward-thrust-2.json'],
    skill3: ['prod:dagger/knee-punch-combo.json'],
  },
  unarmed: {
    idle: ['unarmed/fight_idle', 'locomotion/idle'],
    attack: [
      'prod:unarmed/knee-punch-combo.json',
      'prod:extra/utility-kick.glb',
      'prod:extra/stomp.glb',
      'prod:extra/hurricane-kick.glb',
      'unarmed/punching',
    ],
    skill1: ['prod:unarmed/push.json', 'prod:extra/stomp.glb'],
    skill2: ['prod:unarmed/grab-slam.json', 'prod:extra/utility-kick.glb'],
    skill3: ['prod:unarmed/throw.json', 'prod:extra/hurricane-kick.glb'],
  },
  harvest: {
    idle: ['prod:harvest/holding-idle.json', 'prod:harvest/kneeling-idle.json', 'locomotion/idle'],
    walk: ['prod:harvest/holding-walk.json'],
    attack: [
      'prod:2h_melee/great-sword-slash.json',
      'prod:2h_melee/great-sword-impact.json',
    ],
    harvest: ['prod:harvest/dig-and-plant-seeds.json'],
    plant: ['prod:harvest/plant-tree.json', 'prod:harvest/plant-a-plant.json'],
    water: ['prod:harvest/watering.json'],
    gather: ['prod:harvest/pick-fruit.json'],
    carryIdle: ['prod:harvest/holding-idle.json', 'prod:harvest/box-idle.json'],
    carryWalk: ['prod:harvest/holding-walk.json', 'prod:harvest/box-walk-arc.json'],
    mine: ['prod:2h_melee/great-sword-slash.json', 'prod:2h_melee/great-sword-impact.json'],
    tool: ['prod:harvest/dig-and-plant-seeds.json', 'prod:harvest/watering.json'],
  },
  building: {
    idle: ['prod:building/kneeling-idle.json', 'prod:harvest/kneeling-idle.json', 'locomotion/idle'],
    build: [
      'prod:building/dig-and-plant-seeds.json',
      'prod:harvest/dig-and-plant-seeds.json',
    ],
    place: ['prod:building/plant-a-plant.json', 'prod:harvest/plant-a-plant.json'],
    push: ['prod:building/push.json', 'prod:building/pushing.json', 'prod:extra/pushing.json'],
    pull: ['prod:building/pull-heavy.json', 'prod:harvest/pull-heavy.json'],
    hammer: ['prod:2h_melee/great-sword-impact.json'],
  },
  gestures: {
    idle: ['prod:locomotion_8way/idle.json'],
    gesture: ['prod:gestures/acknowledging.json', 'prod:gestures/happy-hand-gesture.json'],
    acknowledge: ['prod:gestures/acknowledging.json'],
    dismiss: ['prod:gestures/dismissing-gesture.json'],
    wave: ['prod:gestures/happy-hand-gesture.json'],
    think: ['prod:gestures/thoughtful-head-shake.json'],
    sigh: ['prod:gestures/relieved-sigh.json'],
    cocky: ['prod:gestures/being-cocky.json'],
  },
  emotes: {
    idle: ['prod:locomotion_8way/idle.json'],
    emote: [
      'prod:emotes/hip-hop-dancing.json',
      'prod:extra/hip-hop-dancing.json',
      'prod:emotes/intoout.json',
    ],
    dance: ['prod:emotes/hip-hop-dancing.json', 'prod:extra/hip-hop-dancing.json'],
    celebrate: ['prod:emotes/spinning.json', 'prod:emotes/butterfly-twirl.json'],
  },
  events: {
    idle: ['prod:events/sitting-idle.json', 'prod:locomotion_8way/idle.json'],
    /** Looping channel cast — overlay while mana ticks */
    channel: [
      'prod:events/casting-spell.json',
      'prod:events/standing-2h-cast-spell-01.json',
      'prod:magic/standing-2h-cast-spell-01.json',
      'prod:magic/standing-1h-cast-spell-01.json',
    ],
    channelLoop: [
      'prod:events/casting-spell.json',
      'prod:magic/standing-2h-cast-spell-01.json',
    ],
    teleport: ['prod:events/intoout.json', 'prod:extra/intoout.json'],
    teleportIn: ['prod:events/intoout.json', 'prod:extra/intoout.json'],
    teleportOut: ['prod:events/jump-away.json', 'prod:extra/jump-away.json'],
    sit: ['prod:events/sitting-idle.json', 'prod:events/sitting-pose.json'],
    look: ['prod:events/look-around.json', 'prod:events/look-over-shoulder.json'],
    torchIdle: ['prod:events/standing-torch-idle.json'],
  },
  block: {
    idle: ['prod:block/standing-block-idle.json'],
    block: [
      'prod:block/standing-block-idle.json',
      'prod:block/left-block.json',
      'prod:sword_shield/sword-and-shield-block.json',
    ],
    blockL: ['prod:block/left-block.json'],
    blockR: ['prod:block/right-block.json'],
    blockHit: [
      'prod:block/block-react-large.json',
      'prod:block/standing-block-react-large.json',
    ],
    parry: ['prod:block/parry.json', 'prod:reactions/parry.json'],
  },
  traversal: {
    idle: ['prod:locomotion_8way/idle.json'],
    climb: [
      'prod:traversal/tree-climbing.json',
      'prod:traversal/climbing.json',
      'prod:traversal/climbing-1.json',
      'prod:traversal/freehang-climb.json',
    ],
    climbLadder: ['prod:traversal/climbing-ladder.json'],
    mantle: ['prod:traversal/climbing-to-top.json'],
    hang: ['prod:traversal/hanging-idle.json'],
    wallRun: ['prod:traversal/wall-run.json'],
    swim: ['prod:traversal/swimming.json', 'prod:traversal/swimming-1.json'],
    swimFast: ['prod:traversal/swimming-2.json'],
    treadWater: ['prod:traversal/treading-water.json', 'prod:traversal/treading-water-1.json'],
    swimToEdge: ['prod:traversal/swimming-to-edge.json', 'prod:traversal/swimming-to-edge-1.json'],
    jump: ['prod:traversal/running-jump.json', 'prod:locomotion_8way/jump-up.json'],
    flip: ['prod:traversal/cross-jumps-rotation.json', 'prod:extra/front-flip.json'],
    getUp: ['prod:traversal/get-up.json', 'prod:reactions/get-up.json'],
    trip: ['prod:traversal/trip.json'],
    dodge: ['prod:traversal/aerial-evade.json', 'prod:extra/running-slide.json'],
    crawl: ['prod:traversal/crawl.json'],
  },
  /**
   * Hit reactions (animator-dist reactions/*).
   * Stage: D:/Games/Models/_anim_packs/_incoming_2026-08-06_animator-dist/reactions
   * Bake → prod/anims/reactions/*.glb
   */
  reactions: {
    idle: ['locomotion/idle'],
    hit: [
      'prod:reactions/hit-to-head.glb',
      'prod:reactions/big-body-blow.glb',
      'prod:reactions/stunned.glb',
    ],
    stagger: [
      'prod:reactions/jogging-stumble.glb',
      'prod:reactions/flying-back.glb',
    ],
    knockback: [
      'prod:reactions/knocked-up-and-back.glb',
      'prod:reactions/knocked-up.glb',
      'prod:reactions/jump-away.glb',
    ],
    knockdown: [
      'prod:reactions/knocked-out.glb',
      'prod:reactions/knocked-unconscious.glb',
      'prod:reactions/fallen.glb',
      'prod:reactions/falling.glb',
      'prod:reactions/falling-idle.glb',
    ],
    getup: ['prod:reactions/get-up.glb'],
    dodge: ['prod:reactions/dodging-back.glb'],
    parry: ['prod:reactions/parry.glb'],
    special: [
      'prod:reactions/uppercut.glb',
      'prod:reactions/wall-crash.glb',
      'prod:reactions/running-crawl.glb',
    ],
    authorSource:
      'D:\\\\Games\\\\Models\\\\_anim_packs\\\\_incoming_2026-08-06_animator-dist\\\\reactions',
  },
  /**
   * Base locomotion — prefers grudge 8-way pack (Warlords SSOT), then legacy baked.
   * For directional blend use resolveLoco8Way / DirLocoBlend, not just walk/run roles.
   */
  /**
   * Mobility extras (animator-dist extra/*) — overlay one-shots only.
   * Never add as gait bands (would fight DirLocoBlend).
   * Bake → prod/anims/extra/*.glb (or .json Bip001 rotation-only preferred).
   */
  extra: {
    jump: [
      'prod:extra/jump-up.glb',
      'prod:extra/jumping-down.glb',
      'prod:extra/backwards-jump.glb',
      'prod:extra/long-backward-jump.glb',
    ],
    jump_up: ['prod:extra/jump-up.glb'],
    jump_down: ['prod:extra/jumping-down.glb'],
    /** Air evade / stylish flip — skill overlay while airborne */
    air_evade: [
      'prod:extra/running-forward-flip.glb',
      'prod:extra/front-twist-flip.glb',
      'prod:extra/front-flip.glb',
      'prod:extra/stylish-flip.glb',
      'prod:extra/corkscrew-evade.glb',
    ],
    flip: [
      'prod:extra/front-flip.glb',
      'prod:extra/front-twist-flip.glb',
      'prod:extra/running-forward-flip.glb',
      'prod:extra/stylish-flip.glb',
    ],
    dodge: [
      'prod:extra/running-slide.glb',
      'prod:extra/corkscrew-evade.glb',
      'prod:extra/evading-a-threat.glb',
      'prod:extra/jump-away.glb',
      'prod:extra/left-side-step.glb',
      'prod:reactions/dodging-back.glb',
    ],
    slide: ['prod:extra/running-slide.glb'],
    strafe: ['prod:extra/left-side-step.glb', 'prod:extra/right-pivot.glb'],
    pivot: ['prod:extra/right-pivot.glb'],
    sprint_enter: ['prod:extra/crouched-to-sprinting.glb'],
    throw: ['prod:extra/grenade-throw.glb'],
    emote: ['prod:extra/hip-hop-dancing.glb', 'prod:extra/intoout.glb'],
    authorSource:
      'D:\\\\Games\\\\Models\\\\_anim_packs\\\\_incoming_2026-08-06_animator-dist\\\\extra',
  },
  locomotion: {
    idle: [
      'prod:locomotion_8way/idle.json',
      'locomotion/idle',
    ],
    walk: [
      'prod:locomotion_8way/walk-forward.json',
      'magic/Standing Walk Forward',
      'locomotion/run_forward',
    ],
    run: [
      'prod:locomotion_8way/run-forward.json',
      'prod:locomotion_8way/sprint-forward.json',
      'locomotion/run_forward',
    ],
    sprint: [
      'prod:locomotion_8way/sprint-forward.json',
      'prod:locomotion_8way/run-forward.json',
      'prod:extra/crouched-to-sprinting.glb',
    ],
    jump: [
      'prod:extra/jump-up.glb',
      'prod:locomotion_8way/jump-up.json',
      'prod:locomotion_8way/jump-loop.json',
    ],
    land: ['prod:extra/jumping-down.glb'],
    dodge: [
      'prod:extra/running-slide.glb',
      'prod:extra/evading-a-threat.glb',
      'prod:extra/corkscrew-evade.glb',
      'prod:extra/jump-away.glb',
    ],
    air_evade: [
      'prod:extra/running-forward-flip.glb',
      'prod:extra/front-twist-flip.glb',
      'prod:extra/front-flip.glb',
    ],
    attack: [],
    authorSource:
      'D:\\\\Games\\\\Models\\\\_anim_packs\\\\grudge6_incoming_2026-08-01\\\\grudge-8-Way-Locomotion-Pack',
  },
  locomotion_8way: {
    idle: ['prod:locomotion_8way/idle.json'],
    walk: ['prod:locomotion_8way/walk-forward.json'],
    run: ['prod:locomotion_8way/run-forward.json'],
    sprint: ['prod:locomotion_8way/sprint-forward.json'],
    jump: ['prod:locomotion_8way/jump-up.json'],
    attack: [],
    authorSource:
      'D:\\\\Games\\\\Models\\\\_anim_packs\\\\grudge6_incoming_2026-08-01\\\\grudge-8-Way-Locomotion-Pack',
  },
};

// Aliases share the same clip table
PACK_CLIPS.twohand = PACK_CLIPS['2h_melee'];
PACK_CLIPS.greatsword = PACK_CLIPS['2h_melee'];
PACK_CLIPS.greatsword_samurai = PACK_CLIPS['2h_melee'];
PACK_CLIPS.samurai = PACK_CLIPS['2h_melee'];
PACK_CLIPS['8way'] = PACK_CLIPS.locomotion_8way;
PACK_CLIPS.loco8 = PACK_CLIPS.locomotion_8way;
PACK_CLIPS.mobility = PACK_CLIPS.extra;
PACK_CLIPS.evade = PACK_CLIPS.extra;

/**
 * AnimationDirector / mixer role map (best practices).
 *
 * LAYER A — gait (loop, DirLocoBlend): idle | walk | run | sprint
 * LAYER B — events (loop or one-shot, non-combat): channel, emote, gesture, tool, farm, build, sit
 * LAYER C — combat overlay (requestOneShot, scale loco by 1-influence):
 *   attack, heavy, skill1–4, jumpAttack, block, parry, dodge, hit
 * LAYER D — MM (Maneuver Motion): physics lunge while skill overlay plays (useDash)
 *
 * Never put flips/evades/channel in gait bands.
 * Hotkeys: Q E R F skills · C parry · X dodge · E/hold block · Space jump · RMB focus
 */
export const MIXER_ROLE_USE = {
  locomotion: {
    gait: ['idle', 'walk', 'run', 'sprint'],
    jump: 'jump',
    land: 'land',
    dodge: 'dodge',
    air_evade: 'air_evade',
  },
  events: {
    channel: 'channel',
    channelLoop: 'channelLoop',
    teleport: 'teleport',
    emote: 'emote',
    gesture: 'gesture',
    sit: 'sit',
    tool: 'tool',
    harvest: 'harvest',
    build: 'build',
    place: 'place',
  },
  weapon: {
    attack: 'attack',
    attack2: 'attack2',
    attack3: 'attack3',
    heavy: 'heavy',
    combo: 'combo',
    skill1: 'skill1',
    skill2: 'skill2',
    skill3: 'skill3',
    skill4: 'skill4',
    jumpAttack: 'jumpAttack',
    cast: 'cast',
    draw: 'draw',
    sheath: 'sheath',
    aim: 'aim',
    fire: 'fire',
  },
  defense: {
    block: 'block',
    blockL: 'blockL',
    blockR: 'blockR',
    blockHit: 'blockHit',
    parry: 'parry',
  },
  reactions: {
    hit: 'hit',
    stagger: 'stagger',
    knockback: 'knockback',
    knockdown: 'knockdown',
    getup: 'getup',
    parry: 'parry',
  },
  extra: {
    jump: 'jump',
    air_evade: 'air_evade',
    flip: 'flip',
    dodge: 'dodge',
    slide: 'slide',
    roll: 'roll',
    throw: 'throw',
    emote: 'emote',
  },
};

/**
 * Weapon skill slot setup — which pack role + MM + defense defaults.
 * Used by combat runtime / Q&A playtests (not a second skill system).
 *
 * MM (gap close): when focus locked and out of reach, apply lungeSpeed for lungeDuration
 * while skill one-shot plays. Guns/bows: useDash false (no melee charge).
 */
export const WEAPON_SKILL_SETUP = {
  sword_shield: {
    primary: { role: 'attack', reach: 2.4, lungeSpeed: 3.5, lungeDuration: 0.22, useDash: true },
    skills: [
      { slot: 1, role: 'attack', reach: 2.4, lungeSpeed: 3.5, lungeDuration: 0.22, useDash: true },
      { slot: 2, role: 'attack2', reach: 2.5, lungeSpeed: 4.0, lungeDuration: 0.28, useDash: true },
      { slot: 3, role: 'heavy', reach: 2.8, lungeSpeed: 2.0, lungeDuration: 0.35, useDash: true },
      { slot: 4, role: 'jumpAttack', reach: 3.0, lungeSpeed: 5.0, lungeDuration: 0.4, useDash: true },
    ],
    block: { pack: 'block', role: 'block', fallbackPack: 'sword_shield' },
    parry: { pack: 'block', role: 'parry', fallbackPack: 'reactions' },
  },
  '2h_melee': {
    primary: { role: 'attack', reach: 3.0, lungeSpeed: 5.0, lungeDuration: 0.28, useDash: true },
    skills: [
      { slot: 1, role: 'attack', reach: 3.0, lungeSpeed: 5.0, lungeDuration: 0.28, useDash: true },
      { slot: 2, role: 'heavy', reach: 3.2, lungeSpeed: 4.0, lungeDuration: 0.35, useDash: true },
      { slot: 3, role: 'slideAttack', reach: 3.5, lungeSpeed: 7.0, lungeDuration: 0.4, useDash: true },
      { slot: 4, role: 'jumpAttack', reach: 3.2, lungeSpeed: 6.0, lungeDuration: 0.45, useDash: true },
    ],
    block: { pack: '2h_melee', role: 'block', fallbackPack: 'block' },
    parry: { pack: 'block', role: 'parry' },
  },
  polearm: {
    primary: { role: 'attack', reach: 3.6, lungeSpeed: 5.5, lungeDuration: 0.2, useDash: true },
    skills: [
      { slot: 1, role: 'attack', reach: 3.6, lungeSpeed: 5.5, lungeDuration: 0.2, useDash: true },
      { slot: 2, role: 'heavy', reach: 3.8, lungeSpeed: 6.0, lungeDuration: 0.3, useDash: true },
      { slot: 3, role: 'skill2', reach: 3.4, lungeSpeed: 4.0, lungeDuration: 0.25, useDash: true },
      { slot: 4, role: 'skill3', reach: 4.0, lungeSpeed: 7.0, lungeDuration: 0.35, useDash: true },
    ],
    block: { pack: 'block', role: 'block' },
    parry: { pack: 'block', role: 'parry' },
  },
  longbow: {
    primary: { role: 'attack', reach: 24, lungeSpeed: 0, lungeDuration: 0, useDash: false },
    skills: [
      { slot: 1, role: 'attack', reach: 24, useDash: false },
      { slot: 2, role: 'heavy', reach: 28, useDash: false },
      { slot: 3, role: 'dodgeFwd', reach: 0, useDash: false },
      { slot: 4, role: 'dodgeBack', reach: 0, useDash: false },
    ],
    block: { pack: 'longbow', role: 'block', fallbackPack: 'block' },
    parry: { pack: 'block', role: 'parry' },
  },
  pistol: {
    primary: { role: 'attack', reach: 22, useDash: false },
    skills: [
      { slot: 1, role: 'attack', reach: 22, useDash: false },
      { slot: 2, role: 'heavy', reach: 18, useDash: false },
      { slot: 3, role: 'whip', reach: 2.0, lungeSpeed: 3.0, lungeDuration: 0.15, useDash: true },
      { slot: 4, role: 'fire', reach: 20, useDash: false },
    ],
    block: { pack: 'rifle', role: 'block', fallbackPack: 'block' },
    parry: { pack: 'block', role: 'parry' },
  },
  rifle: {
    primary: { role: 'attack', reach: 30, useDash: false },
    skills: [
      { slot: 1, role: 'attack', reach: 30, useDash: false },
      { slot: 2, role: 'fire', reach: 28, useDash: false },
      { slot: 3, role: 'block', reach: 0, useDash: false },
      { slot: 4, role: 'sheath', reach: 0, useDash: false },
    ],
    block: { pack: 'rifle', role: 'block', fallbackPack: 'block' },
    parry: { pack: 'block', role: 'parry' },
  },
  magic: {
    primary: { role: 'cast', reach: 18, useDash: false },
    skills: [
      { slot: 1, role: 'cast', reach: 18, useDash: false },
      { slot: 2, role: 'attack', reach: 16, useDash: false },
      { slot: 3, role: 'heavy', reach: 14, useDash: false },
      { slot: 4, role: 'areaCast', reach: 10, useDash: false },
    ],
    /** Hold skill / channel mode */
    channel: { pack: 'events', role: 'channel', loop: true },
    teleport: { pack: 'events', role: 'teleport', useDash: false },
    block: { pack: 'block', role: 'block' },
    parry: { pack: 'block', role: 'parry' },
  },
  dagger: {
    primary: { role: 'attack', reach: 1.8, lungeSpeed: 6.0, lungeDuration: 0.15, useDash: true },
    skills: [
      { slot: 1, role: 'attack', reach: 1.8, lungeSpeed: 6.0, lungeDuration: 0.15, useDash: true },
      { slot: 2, role: 'attack2', reach: 1.9, lungeSpeed: 5.5, lungeDuration: 0.18, useDash: true },
      { slot: 3, role: 'heavy', reach: 2.0, lungeSpeed: 4.0, lungeDuration: 0.22, useDash: true },
      { slot: 4, role: 'skill3', reach: 2.2, lungeSpeed: 5.0, lungeDuration: 0.25, useDash: true },
    ],
    block: { pack: 'block', role: 'block' },
    parry: { pack: 'block', role: 'parry' },
  },
  unarmed: {
    primary: { role: 'attack', reach: 1.8, lungeSpeed: 4.0, lungeDuration: 0.15, useDash: true },
    skills: [
      { slot: 1, role: 'attack', reach: 1.8, lungeSpeed: 4.0, lungeDuration: 0.15, useDash: true },
      { slot: 2, role: 'skill1', reach: 2.0, lungeSpeed: 3.5, lungeDuration: 0.2, useDash: true },
      { slot: 3, role: 'skill2', reach: 2.2, lungeSpeed: 5.0, lungeDuration: 0.3, useDash: true },
      { slot: 4, role: 'skill3', reach: 2.5, lungeSpeed: 4.0, lungeDuration: 0.25, useDash: true },
    ],
    block: { pack: 'block', role: 'block' },
    parry: { pack: 'block', role: 'parry' },
  },
};

/** Event pack ids (non-combat) for Q&A / UI routing */
export const EVENT_PACK_IDS = [
  'locomotion_8way',
  'locomotion',
  'traversal',
  'unarmed',
  'harvest',
  'building',
  'gestures',
  'emotes',
  'events',
  'extra',
  'reactions',
  'block',
];

/** Resolve skill setup for a weapon slot */
export function weaponSkillSetupFor(weaponSlot) {
  const pack = packForWeaponSlot(weaponSlot);
  return WEAPON_SKILL_SETUP[pack] || WEAPON_SKILL_SETUP.sword_shield;
}

/**
 * URLs for a skill slot (1–4) or primary attack, with MM metadata.
 */
export function skillClipForWeapon(weaponSlot, slot = 1) {
  const setup = weaponSkillSetupFor(weaponSlot);
  const pack = packForWeaponSlot(weaponSlot);
  const def =
    slot === 0 || slot === 'primary'
      ? setup.primary
      : (setup.skills || []).find((s) => s.slot === slot) || setup.primary;
  const role = def?.role || 'attack';
  return {
    pack,
    role,
    urls: clipUrlsFor(pack, role),
    reach: def?.reach ?? 2.2,
    lungeSpeed: def?.lungeSpeed ?? 0,
    lungeDuration: def?.lungeDuration ?? 0,
    useDash: !!def?.useDash,
    focusGapClose: !!def?.useDash,
  };
}

/** Block / parry URLs for equipped weapon (pack-aware). */
export function defenseClipsForWeapon(weaponSlot) {
  const setup = weaponSkillSetupFor(weaponSlot);
  const blockPack = setup.block?.pack || 'block';
  const parryPack = setup.parry?.pack || 'block';
  return {
    block: clipUrlsFor(blockPack, setup.block?.role || 'block').concat(
      setup.block?.fallbackPack ? clipUrlsFor(setup.block.fallbackPack, 'block') : [],
    ),
    parry: clipUrlsFor(parryPack, setup.parry?.role || 'parry').concat(
      clipUrlsFor('reactions', 'parry'),
    ),
    blockHit: clipUrlsFor('block', 'blockHit'),
  };
}

/** Non-combat event clip resolver */
export function eventClipUrls(kind) {
  const map = {
    channel: ['events', 'magic'],
    teleport: ['events', 'extra'],
    emote: ['emotes', 'extra', 'gestures'],
    gesture: ['gestures', 'emotes'],
    harvest: ['harvest'],
    farm: ['harvest'],
    tool: ['harvest', 'building'],
    build: ['building', 'harvest'],
    place: ['building', 'harvest'],
    climb: ['traversal'],
    swim: ['traversal'],
    sit: ['events'],
  };
  const packs = map[kind] || ['events'];
  const role =
    kind === 'farm' ? 'harvest' : kind === 'tool' ? 'tool' : kind === 'place' ? 'place' : kind;
  const urls = [];
  for (const p of packs) {
    if (!PACK_CLIPS[p]) continue;
    urls.push(...clipUrlsFor(p, role));
    if (role === 'channel') urls.push(...clipUrlsFor(p, 'channelLoop'));
  }
  return urls;
}

/**
 * Gap-fill: resolve best clip URLs for a combat role across packs.
 * Prefer weapon pack → extra → locomotion → reactions.
 * Does NOT fall back to idle when role missing (unlike clipUrlsFor alone).
 */
export function clipUrlsForCombatRole(weaponSlot, role) {
  const weaponPack = packForWeaponSlot(weaponSlot);
  const order = [
    weaponPack,
    'block',
    'extra',
    'locomotion',
    'locomotion_8way',
    'reactions',
    'events',
    'unarmed',
  ];
  const seen = new Set();
  const urls = [];
  for (const p of order) {
    if (seen.has(p) || !PACK_CLIPS[p]) continue;
    seen.add(p);
    const rels = PACK_CLIPS[p][role];
    if (!Array.isArray(rels) || !rels.length) continue;
    for (const rel of rels) {
      if (typeof rel !== 'string' || rel.startsWith('authorSource')) continue;
      if (rel.startsWith('prod:')) {
        const u = `${CDN}/prod/anims/${rel.slice(5)}`;
        if (!urls.includes(u)) urls.push(u);
      } else {
        for (const u of bakedUrls(rel)) {
          if (!urls.includes(u)) urls.push(u);
        }
      }
    }
    if (urls.length) break;
  }
  return urls;
}

/** Preferred in-game bake format (director + Bip001 rematch). */
export const BAKE_FORMAT_SSOT = {
  preferred: 'json',
  note: 'Three.AnimationClip JSON, Bip001 rotation tracks only (strip root/hip position). Rematch spaces/underscores at runtime.',
  alt: 'glb',
  altWhen: 'Full-body flip/ragdoll-heavy clips where JSON track export is incomplete',
  cdnLayout: 'prod/anims/{pack}/{clip-id}.{json|glb}',
  authorStage: 'D:/Games/Models/_anim_packs/_incoming_2026-08-06_animator-dist/',
};

/** 8 cardinal/diagonal move directions (matches character-kit LocoDir). */
export const LOCO_DIRS = [
  'forward',
  'forward-left',
  'forward-right',
  'backward',
  'backward-left',
  'backward-right',
  'left',
  'right',
];

/**
 * Map gait band + direction → prod locomotion_8way clip file (no path prefix).
 * Crouch uses walk-crouching-* only (no run/sprint crouch in author pack).
 */
export function resolveLoco8WayFile(band, dir = 'forward', crouch = false) {
  const d = LOCO_DIRS.includes(dir) ? dir : 'forward';
  if (band === 'idle' || !band) {
    if (crouch) return 'idle-crouching.json';
    return 'idle.json';
  }
  if (crouch) {
    return `walk-crouching-${d}.json`;
  }
  const speed =
    band === 'walk' ? 'walk' : band === 'sprint' ? 'sprint' : 'run';
  return `${speed}-${d}.json`;
}

/** Absolute CDN URLs for an 8-way band+dir (prod first). */
export function clipUrlsForLoco8Way(band, dir = 'forward', crouch = false) {
  const file = resolveLoco8WayFile(band, dir, crouch);
  return [
    `${CDN}/prod/anims/locomotion_8way/${file}`,
    ...bakedUrls(`locomotion_8way/${file.replace(/\.json$/i, '')}`),
  ];
}

/**
 * Stick / camera-relative (lx = strafe right+, lz = forward+) → LocoDir.
 * Deadzone ~0.08. Mirrors arpg tpsMath 8-way quantize.
 */
export function quantizeLocoDir(lx, lz, dead = 0.08) {
  const x = Number(lx) || 0;
  const z = Number(lz) || 0;
  if (Math.hypot(x, z) < dead) return 'forward';
  const ang = Math.atan2(x, z); // -PI..PI, 0 = forward
  const deg = (ang * 180) / Math.PI;
  if (deg >= -22.5 && deg < 22.5) return 'forward';
  if (deg >= 22.5 && deg < 67.5) return 'forward-right';
  if (deg >= 67.5 && deg < 112.5) return 'right';
  if (deg >= 112.5 && deg < 157.5) return 'backward-right';
  if (deg >= 157.5 || deg < -157.5) return 'backward';
  if (deg >= -157.5 && deg < -112.5) return 'backward-left';
  if (deg >= -112.5 && deg < -67.5) return 'left';
  return 'forward-left';
}

/**
 * Gait target 0..1 from move speed + sprint (DirLocoBlend / AnimationDirector bands).
 */
export function computeGaitTarget(speed01, sprint, moving) {
  if (!moving || speed01 < 0.05) return 0;
  if (sprint) return 1;
  const t = Math.min(1, Math.max(0, speed01));
  if (t < 0.6) return 0.34 + (t / 0.6) * 0.36;
  return 0.7 + ((t - 0.6) / 0.4) * 0.29;
}

const GAIT_BANDS = [
  { band: 'idle', at: 0 },
  { band: 'walk', at: 0.34 },
  { band: 'run', at: 0.7 },
  { band: 'sprint', at: 1 },
];

/**
 * 8-way locomotion blend tree for Warlords / grudge6 (one mixer layer).
 * setBlend(dir, crouch) rebinds clips; setGaitTarget + update each frame.
 * Call setOverlayInfluence(0..1) so attacks "blend off" locomotion weight.
 */
export class DirLocoBlend {
  constructor(ensureAction) {
    this.ensureAction = ensureAction;
    this.gait = 0;
    this.gaitTarget = 0;
    this.gaitRate = 9;
    this.dir = 'forward';
    this.crouch = false;
    this.overlayInfluence = 0;
    this.bandKeys = { idle: '', walk: '', run: '', sprint: '' };
    this.bandActions = {};
  }

  /**
   * @param {string} dir LocoDir
   * @param {boolean} [crouch]
   * @param {number} [fade]
   */
  setBlend(dir, crouch = false, fade = 0.15) {
    this.dir = LOCO_DIRS.includes(dir) ? dir : 'forward';
    this.crouch = !!crouch;
    for (const { band } of GAIT_BANDS) {
      const file = resolveLoco8WayFile(band, this.dir, this.crouch);
      const key = `loco8:${file}`;
      if (key === this.bandKeys[band] && this.bandActions[band]) continue;
      this.bandKeys[band] = key;
      // ensureAction(key, urls) must return a looping AnimationAction (or null).
      const action = this.ensureAction(key, clipUrlsForLoco8Way(band, this.dir, this.crouch));
      if (!action) continue;
      const prev = this.bandActions[band];
      action.enabled = true;
      action.setEffectiveWeight(0);
      try {
        // THREE.LoopRepeat === 2201
        action.setLoop(2201, Infinity);
      } catch {
        /* ignore */
      }
      action.play();
      if (prev && prev !== action) prev.fadeOut(fade);
      this.bandActions[band] = action;
    }
  }

  setGaitTarget(target) {
    this.gaitTarget = Math.max(0, Math.min(1, Number(target) || 0));
  }

  /** 0 = full loco, 1 = attack/skill fully takes over (blend off locomotion). */
  setOverlayInfluence(v) {
    this.overlayInfluence = Math.max(0, Math.min(1, Number(v) || 0));
  }

  update(dt) {
    const rate = this.gaitRate;
    this.gait +=
      (this.gaitTarget - this.gait) * (1 - Math.exp(-rate * Math.max(0, dt || 0)));
    const w = { idle: 0, walk: 0, run: 0, sprint: 0 };
    if (this.gait >= 1) {
      w.sprint = 1;
    } else {
      for (let i = 0; i < GAIT_BANDS.length - 1; i++) {
        const a = GAIT_BANDS[i];
        const b = GAIT_BANDS[i + 1];
        if (this.gait >= a.at && this.gait <= b.at) {
          const t = (this.gait - a.at) / (b.at - a.at || 1);
          w[a.band] = 1 - t;
          w[b.band] = t;
          break;
        }
      }
    }
    const scale = 1 - this.overlayInfluence;
    for (const { band } of GAIT_BANDS) {
      const action = this.bandActions[band];
      if (action) action.setEffectiveWeight(w[band] * scale);
    }
  }

  reset(fade = 0.12) {
    for (const { band } of GAIT_BANDS) {
      this.bandActions[band]?.fadeOut(fade);
      this.bandKeys[band] = '';
      delete this.bandActions[band];
    }
    this.gait = 0;
    this.gaitTarget = 0;
    this.overlayInfluence = 0;
  }
}

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
  const rels = (PACK_CLIPS[pack]?.[role] || PACK_CLIPS.locomotion.idle || []).filter(
    (r) => typeof r === 'string' && !r.startsWith('authorSource'),
  );
  const urls = [];
  for (const rel of rels) {
    if (typeof rel !== 'string') continue;
    // prod:2h_melee/great-sword-idle.glb → assets…/prod/anims/2h_melee/…
    if (rel.startsWith('prod:')) {
      const rest = rel.slice('prod:'.length);
      urls.push(`${CDN}/prod/anims/${rest}`);
      continue;
    }
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
