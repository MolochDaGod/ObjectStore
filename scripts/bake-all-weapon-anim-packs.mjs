#!/usr/bin/env node
/**
 * bake-all-weapon-anim-packs.mjs
 *
 * Stage Mixamo author FBX → character-viewer bake-anims.mjs (Mixamo→Bip001
 * rotation-only JSON) → dist/prod/anims/<pack> + package.json roles.
 *
 * Covers weapon skills / cast / attack / combo / specials from:
 *   D:\Games\Models\_anim_packs\_gap_fill_stage\*
 *   D:\Games\Models\_anim_packs\{sword_shield,greatsword,longbow,pistol,rifle,farming,traversal,magic_*}
 *   D:\Games\Models\gge (spear, jump attack, gun, climb, react)
 *
 * Usage (from ObjectStore root):
 *   node scripts/bake-all-weapon-anim-packs.mjs
 *   node scripts/bake-all-weapon-anim-packs.mjs --only=sword_shield,polearm
 *   node scripts/bake-all-weapon-anim-packs.mjs --upload --remote
 *   node scripts/bake-all-weapon-anim-packs.mjs --skip-bake   # package already-baked only
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist", "prod", "anims");
const CDN = "https://assets.grudge-studio.com";
const BUCKET = "grudge-assets";
const PROD_ANIMS = "prod/anims";

const VIEWER = path.resolve(
  ROOT,
  "..",
  "grudge-character-animator",
  "artifacts",
  "character-viewer",
);
const STAGE_ANIMS = path.join(VIEWER, "public", "anims");
const BAKED = path.join(STAGE_ANIMS, "baked");
const BAKE_SCRIPT = path.join(VIEWER, "tools", "bake-anims.mjs");
const TARGET_FBX = path.join(
  VIEWER,
  "public",
  "assets",
  "barbarians",
  "models",
  "characters",
  "BRB_Characters_customizable.FBX",
);

const GAP = "D:\\Games\\Models\\_anim_packs\\_gap_fill_stage";
const ANIM = "D:\\Games\\Models\\_anim_packs";
const GGE = "D:\\Games\\Models\\gge";
const INCOMING = "D:\\Games\\Models\\_anim_packs\\_incoming_2026-08-06_animator-dist";
const GO_ANIM = path.join(
  ROOT,
  "..",
  "gameopen",
  "artifacts",
  "animator",
  "public",
  "anim",
);
// Prefer Documents/gameopen if monorepo sibling missing
const GO_ANIM_DOCS = "C:\\Users\\nugye\\Documents\\gameopen\\artifacts\\animator\\public\\anim";
const LOCO8 =
  "D:\\Games\\Models\\_anim_packs\\grudge6_incoming_2026-08-01\\grudge-8-Way-Locomotion-Pack";

const has = (f) => process.argv.includes(f);
const ONLY = (() => {
  const a = process.argv.find((x) => x.startsWith("--only="));
  if (!a) return null;
  return new Set(
    a
      .slice("--only=".length)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
})();

function slugify(name) {
  return String(name)
    .replace(/\.fbx$/i, "")
    .replace(/\.json$/i, "")
    .toLowerCase()
    .replace(/[()#]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(d) {
  await fs.mkdir(d, { recursive: true });
}

async function listFbx(dir) {
  if (!(await exists(dir))) return [];
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!/\.fbx$/i.test(e.name)) continue;
    if (/heavy_mixamo/i.test(e.name)) continue;
    out.push(path.join(dir, e.name));
  }
  return out;
}

/**
 * Pack SSOT: ordered source dirs (first wins on same slug).
 * ggeEntries: explicit { file, as? } from GGE root.
 */
const PACKS = {
  sword_shield: {
    name: "Knight Sword & Shield",
    weapon: "sword_shield",
    sources: [path.join(GAP, "sword_shield"), path.join(ANIM, "sword_shield")],
    gge: [
      { file: "Standing Melee Run Jump Attack.fbx", as: "jump-attack" },
      { file: "Jump Attack.fbx", as: "jump-attack-2" },
      { file: "shieldthrow.fbx", as: "shield-throw" },
      { file: "Long Step Forward.fbx", as: "gap-close-step" },
    ],
    combat: true,
  },
  "2h_melee": {
    name: "2H Melee / Greatsword",
    weapon: "greatsword",
    sources: [path.join(GAP, "2h_melee"), path.join(ANIM, "greatsword")],
    gge: [
      { file: "Great Sword Slide Attack.fbx", as: "great-sword-slide-attack" },
      { file: "Standing Melee Run Jump Attack.fbx", as: "jump-attack" },
      { file: "Jump Attack.fbx", as: "jump-attack-2" },
    ],
    combat: true,
    relatedPack: "greatsword_samurai",
  },
  polearm: {
    name: "Spear / Polearm",
    weapon: "spear",
    sources: [],
    gge: [
      { file: "stabspear.fbx", as: "stab-spear" },
      { file: "spearThrust Slash.fbx", as: "spear-thrust-slash" },
      { file: "1Upward Thrust.fbx", as: "upward-thrust" },
      { file: "2Upward Thrust.fbx", as: "upward-thrust-2" },
      { file: "Long Step Forward.fbx", as: "gap-close-step" },
    ],
    combat: true,
  },
  longbow: {
    name: "Longbow / 2H Ranged",
    weapon: "longbow",
    sources: [path.join(GAP, "longbow"), path.join(ANIM, "longbow")],
    gge: [],
    combat: true,
  },
  pistol: {
    name: "Pistol / 1H Sidearm (also 1H xbow / tome loco)",
    weapon: "pistol",
    sources: [path.join(GAP, "pistol"), path.join(ANIM, "pistol")],
    gge: [
      { file: "bigpistolGunplay.fbx", as: "gunplay" },
      { file: "Pistol Whip.fbx", as: "pistol-whip" },
      { file: "Crouch Rapid Fire.fbx", as: "crouch-rapid-fire" },
      { file: "shotgunGunplay.fbx", as: "shotgun-gunplay" },
    ],
    combat: true,
  },
  rifle: {
    name: "Rifle / Shotgun",
    weapon: "rifle",
    sources: [path.join(GAP, "rifle"), path.join(ANIM, "rifle")],
    gge: [
      { file: "Block With Rifle.fbx", as: "block" },
      { file: "Put Back Rifle Behind Shoulder.fbx", as: "sheath" },
      { file: "Rifle Idle.fbx", as: "idle" },
      { file: "shotgunGunplay.fbx", as: "shotgun-gunplay" },
      { file: "Crouch Rapid Fire.fbx", as: "crouch-rapid-fire" },
    ],
    combat: true,
  },
  magic: {
    name: "Staff / Wand / Casting",
    weapon: "staff",
    sources: [
      path.join(GAP, "magic"),
      path.join(ANIM, "magic_spell"),
      path.join(ANIM, "magic_loco"),
    ],
    gge: [],
    combat: true,
  },
  dagger: {
    name: "Dagger / Dual Dagger",
    weapon: "dagger",
    sources: [],
    gge: [
      { file: "1Double Dagger Stab.fbx", as: "double-dagger-stab" },
      { file: "2Double Dagger Stab.fbx", as: "double-dagger-stab-2" },
      { file: "1Upward Thrust.fbx", as: "upward-thrust" },
      { file: "2Upward Thrust.fbx", as: "upward-thrust-2" },
      { file: "Flying Knee Punch Combo.fbx", as: "knee-punch-combo" },
    ],
    combat: true,
  },
  harvest: {
    name: "Harvest / Farming / Carry / Tools",
    weapon: null,
    sources: [
      path.join(GAP, "farming"),
      path.join(ANIM, "farming"),
      path.join(GO_ANIM_DOCS, "farming"),
      path.join(GO_ANIM, "farming"),
    ],
    gge: [
      { file: "Pull Heavy Object.fbx", as: "pull-heavy" },
      { file: "Holding Turn Left.fbx", as: "holding-turn-left" },
      { file: "Holding Turn Right.fbx", as: "holding-turn-right" },
    ],
    combat: false,
    event: true,
  },
  /** Building / place / construction — tool + carry reuse until dedicated set */
  building: {
    name: "Building / Place / Construction tools",
    weapon: null,
    sources: [
      path.join(GAP, "farming"),
      path.join(GO_ANIM_DOCS, "farming"),
      path.join(GO_ANIM_DOCS, "extra"),
    ],
    gge: [
      { file: "Pull Heavy Object.fbx", as: "pull-heavy" },
      { file: "Push.fbx", as: "push" },
    ],
    combat: false,
    event: true,
    maxFiles: 30,
  },
  traversal: {
    name: "Traversal / Climb / Swim / Parkour",
    weapon: null,
    sources: [
      path.join(GAP, "traversal"),
      path.join(ANIM, "traversal"),
      path.join(GO_ANIM_DOCS, "climb"),
      path.join(GO_ANIM_DOCS, "swim"),
      path.join(GO_ANIM, "climb"),
      path.join(GO_ANIM, "swim"),
    ],
    gge: [
      { file: "treeclimbing.fbx", as: "tree-climbing" },
      { file: "Climbing Ladder.fbx", as: "climbing-ladder" },
      { file: "Cross Jumps Rotation.fbx", as: "cross-jumps-rotation" },
      { file: "Running Jump.fbx", as: "running-jump" },
      { file: "fallfromlowswhilerunning.fbx", as: "fall-from-low-running" },
      { file: "Trip.fbx", as: "trip" },
      { file: "trip Running Slide.fbx", as: "trip-running-slide" },
      { file: "Runintowall.fbx", as: "run-into-wall" },
      { file: "fromstomachStand Up.fbx", as: "get-up" },
      { file: "hitbyStumbling.fbx", as: "stumble" },
      { file: "Aerial Evade.fbx", as: "aerial-evade" },
      { file: "lowhealthCrawling.fbx", as: "crawl" },
      { file: "Sprint.fbx", as: "sprint" },
    ],
    combat: false,
    event: true,
  },
  unarmed: {
    name: "Unarmed / Brawler / Cover",
    weapon: "unarmed",
    sources: [
      path.join(ANIM, "action_adventure"),
      path.join(GO_ANIM_DOCS, "action-adventure"),
      path.join(GO_ANIM, "action-adventure"),
    ],
    gge: [
      { file: "Flying Knee Punch Combo.fbx", as: "knee-punch-combo" },
      { file: "Grab And Slam.fbx", as: "grab-slam" },
      { file: "Push.fbx", as: "push" },
      { file: "mainhandThrow.fbx", as: "throw" },
    ],
    combat: true,
    event: true,
    maxFiles: 40,
  },
  /** Social gestures (acknowledge, dismiss, etc.) */
  gestures: {
    name: "Gestures / Social hand signals",
    weapon: null,
    sources: [path.join(GO_ANIM_DOCS, "gestures"), path.join(GO_ANIM, "gestures")],
    gge: [],
    combat: false,
    event: true,
  },
  /** Emotes / dance / celebration */
  emotes: {
    name: "Emotes / Dance / Celebration",
    weapon: null,
    sources: [path.join(GO_ANIM_DOCS, "extra"), path.join(INCOMING, "extra")],
    gge: [],
    combat: false,
    event: true,
    /** only stage emote-like names */
    nameFilter: /hip-hop|dance|intoout|spinning|butterfly|cocky|happy|weight-shift|pose/i,
    maxFiles: 20,
  },
  /** Ambient + channel cast loops + teleport / non-combat events */
  events: {
    name: "Non-combat events (ambient, channel, teleport)",
    weapon: null,
    sources: [
      path.join(GO_ANIM_DOCS, "ambient"),
      path.join(GO_ANIM_DOCS, "magic"),
      path.join(GO_ANIM_DOCS, "extra"),
      path.join(GAP, "magic"),
    ],
    gge: [{ file: "Male Sitting Pose.fbx", as: "sitting-pose" }],
    combat: false,
    event: true,
    maxFiles: 40,
  },
  /** Defense SSOT — block / parry (shared across weapons) */
  block: {
    name: "Block / Parry",
    weapon: null,
    sources: [path.join(GO_ANIM_DOCS, "block"), path.join(GO_ANIM, "block"), path.join(INCOMING, "reactions")],
    gge: [{ file: "Block With Rifle.fbx", as: "rifle-block" }],
    combat: true,
    event: false,
  },
  /** Hit reacts / knockdown / get-up */
  reactions: {
    name: "Hit reactions / Knockdown",
    weapon: null,
    sources: [
      path.join(GO_ANIM_DOCS, "reactions"),
      path.join(GO_ANIM, "reactions"),
      path.join(INCOMING, "reactions"),
    ],
    gge: [
      { file: "hitbyStumbling.fbx", as: "stumble" },
      { file: "Trip.fbx", as: "trip" },
      { file: "fromstomachStand Up.fbx", as: "get-up" },
    ],
    combat: false,
    event: true,
  },
  /** Mobility overlays — flips, rolls, air evade (never gait) */
  extra: {
    name: "Mobility extras (flip / roll / evade / jump)",
    weapon: null,
    sources: [
      path.join(GO_ANIM_DOCS, "extra"),
      path.join(GO_ANIM, "extra"),
      path.join(INCOMING, "extra"),
    ],
    gge: [],
    combat: false,
    event: true,
    maxFiles: 50,
  },
  locomotion_8way: {
    name: "8-Way Locomotion",
    weapon: null,
    sources: [LOCO8, path.join(ANIM, "locomotion")],
    gge: [],
    combat: false,
    event: true,
    skipIfBaked: true,
  },
};

function pickRole(files, ...cands) {
  for (const c of cands) {
    const hit = files.find((f) => f === c || f.replace(/\.json$/i, "") === c.replace(/\.json$/i, ""));
    if (hit) return hit;
  }
  for (const c of cands) {
    const key = c.replace(/\.json$/i, "").toLowerCase();
    const hit = files.find((f) => f.toLowerCase().includes(key));
    if (hit) return hit;
  }
  return null;
}

/** Heuristic role map for skills / cast / combo / specials. */
function buildRoles(files, packId) {
  const roles = {};
  const set = (k, ...c) => {
    const v = pickRole(files, ...c);
    if (v) roles[k] = v;
  };

  set("idle", "idle.json", "standing-idle.json", "pistol-idle.json", "great-sword-idle.json", "sword-and-shield-idle.json", "rifle-idle.json");
  set("walk", "walk-forward.json", "standing-walk-forward.json", "pistol-walk.json", "great-sword-walk.json", "sword-and-shield-run.json", "walking.json");
  set("run", "run-forward.json", "standing-run-forward.json", "pistol-run.json", "great-sword-run.json", "sword-and-shield-run.json");
  set("sprint", "sprint-forward.json", "standing-sprint-forward.json", "sprint.json");

  // Attacks / combos
  set(
    "attack",
    "sword-and-shield-attack.json",
    "great-sword-slash.json",
    "great-sword-attack.json",
    "stab-spear.json",
    "stabspear.json",
    "gunplay.json",
    "bigpistol-gunplay.json",
    "standing-1h-magic-attack-01.json",
    "standing-draw-arrow.json",
    "double-dagger-stab.json",
    "one-hand-sword-combo.json",
  );
  set(
    "attack2",
    "sword-and-shield-attack-2.json",
    "great-sword-slash-2.json",
    "double-dagger-stab-2.json",
    "standing-1h-magic-attack-02.json",
    "spear-thrust-slash.json",
  );
  set(
    "attack3",
    "sword-and-shield-attack-3.json",
    "great-sword-slash-3.json",
    "standing-1h-magic-attack-03.json",
  );
  set(
    "heavy",
    "sword-and-shield-attack-4.json",
    "great-sword-high-spin-attack.json",
    "great-sword-jump-attack.json",
    "spear-thrust-slash.json",
    "standing-2h-magic-attack-01.json",
    "standing-aim-overdraw.json",
  );
  set(
    "combo",
    "one-hand-sword-combo.json",
    "great-sword-slash.json",
    "knee-punch-combo.json",
    "standing-2h-magic-attack-02.json",
  );

  // Skills / specials
  set("skill1", "gap-close-step.json", "great-sword-slide-attack.json", "slash-advance.json", "long-step-forward.json");
  set("skill2", "jump-attack.json", "standing-melee-run-jump-attack.json", "great-sword-jump-attack.json");
  set("skill3", "shield-throw.json", "grab-slam.json", "aerial-evade.json");
  set("skill4", "jump-attack-2.json", "upward-thrust.json");
  set("jumpAttack", "jump-attack.json", "standing-melee-run-jump-attack.json", "jump-attack-2.json");
  set("slideAttack", "great-sword-slide-attack.json", "trip-running-slide.json");

  // Cast / ranged fire
  set("cast", "standing-1h-cast-spell-01.json", "standing-2h-cast-spell-01.json");
  set("cast2h", "standing-2h-cast-spell-01.json");
  set("areaCast", "standing-2h-magic-area-attack-01.json", "standing-2h-magic-area-attack-02.json");
  set("draw", "standing-draw-arrow.json", "draw-sword-1.json", "drawing-gun.json");
  set("recoil", "standing-aim-recoil.json");
  set("overdraw", "standing-aim-overdraw.json");
  set("fire", "gunplay.json", "shotgun-gunplay.json", "crouch-rapid-fire.json", "standing-draw-arrow.json");
  set("whip", "pistol-whip.json");

  // Defense
  set("block", "sword-and-shield-block.json", "block.json", "block-with-rifle.json", "standing-block.json");
  set("blockIdle", "sword-and-shield-block-idle.json", "block-idle.json");
  set("parry", "parry.json", "sword-and-shield-block-2.json");

  // Mobility / special
  set("jump", "running-jump.json", "standing-jump.json", "pistol-jump.json", "jump-up.json");
  set("dodge", "aerial-evade.json", "standing-dodge-forward.json", "dodging.json");
  set("dodgeFwd", "standing-dodge-forward.json");
  set("dodgeBack", "standing-dodge-backward.json");
  set("dodgeL", "standing-dodge-left.json");
  set("dodgeR", "standing-dodge-right.json");
  set("strafe", "sword-and-shield-strafe.json", "pistol-strafe.json");
  set("death", "sword-and-shield-death.json", "two-handed-sword-death.json", "standing-death-forward-01.json");
  set("sheath", "sheath.json", "sheath-sword-1.json", "put-back-rifle-behind-shoulder.json");
  set("drawWeapon", "draw-sword-1.json", "drawing-gun.json");

  // Harvest / interact
  set("harvest", "dig-and-plant-seeds.json");
  set("plant", "plant-tree.json", "plant-a-plant.json");
  set("water", "watering.json");
  set("gather", "pick-fruit.json", "pull-plant.json");
  set("carryIdle", "holding-idle.json", "box-idle.json");
  set("carryWalk", "holding-walk.json", "box-walk-arc.json");
  set("kneel", "kneeling-idle.json", "pistol-kneeling-idle.json");

  // Traversal
  set("climb", "tree-climbing.json", "climbing.json", "climbing-up-wall.json", "freehang-climb.json");
  set("climbLadder", "climbing-ladder.json");
  set("mantle", "climbing-to-top.json");
  set("hang", "hanging-idle.json", "freehang-climb.json");
  set("wallRun", "wall-run.json");
  set("swim", "swimming.json", "swimming-1.json");
  set("swimFast", "swimming-2.json");
  set("treadWater", "treading-water.json", "treading-water-1.json");
  set("swimToEdge", "swimming-to-edge.json", "swimming-to-edge-1.json");
  set("flip", "cross-jumps-rotation.json", "front-flip.json", "running-forward-flip.json");
  set("getUp", "get-up.json", "from-stomach-stand-up.json", "kip-up.json");
  set("trip", "trip.json");
  set("stumble", "stumble.json", "hit-by-stumbling.json", "jogging-stumble.json");
  set("crawl", "crawl.json", "lowhealth-crawling.json", "running-crawl.json");

  // Channel / teleport / non-combat events
  set(
    "channel",
    "standing-2h-cast-spell-01.json",
    "casting-spell.json",
    "standing-1h-cast-spell-01.json",
    "standing-2h-magic.json",
  );
  set("channelLoop", "casting-spell.json", "standing-2h-cast-spell-01.json");
  set("teleport", "intoout.json", "jump-away.json");
  set("teleportIn", "intoout.json");
  set("teleportOut", "jump-away.json", "intoout.json");
  set("sit", "sitting-idle.json", "sitting-pose.json", "male-sitting-pose.json");
  set("look", "look-around.json", "look-over-shoulder.json");
  set("torchIdle", "standing-torch-idle.json", "standing-torch-idle-2.json");

  // Emotes / gestures
  set("emote", "hip-hop-dancing.json", "intoout.json", "spinning.json", "butterfly-twirl.json");
  set("dance", "hip-hop-dancing.json");
  set("gesture", "acknowledging.json", "happy-hand-gesture.json", "dismissing-gesture.json");
  set("acknowledge", "acknowledging.json");
  set("dismiss", "dismissing-gesture.json");
  set("wave", "happy-hand-gesture.json", "acknowledging.json");

  // Building / tools (non-combat work loops)
  set("build", "dig-and-plant-seeds.json", "plant-a-plant.json", "kneeling-idle.json");
  set("place", "plant-a-plant.json", "plant-tree.json");
  set("hammer", "dig-and-plant-seeds.json");
  set("push", "push.json", "pushing.json", "pull-heavy.json");
  set("pull", "pull-heavy.json", "pull-plant.json");

  // Block / parry (defense pack + reactions)
  set("block", "standing-block-idle.json", "left-block.json", "right-block.json", "block.json", "sword-and-shield-block.json");
  set("blockL", "left-block.json");
  set("blockR", "right-block.json");
  set("blockHit", "block-react-large.json", "standing-block-react-large.json");
  set("parry", "parry.json");

  // Hit reacts
  set("hit", "hit-to-head.json", "big-body-blow.json", "stunned.json");
  set("stagger", "jogging-stumble.json", "flying-back.json", "stumble.json");
  set("knockdown", "knocked-out.json", "fallen.json", "knocked-unconscious.json");
  set("knockback", "knocked-up-and-back.json", "knocked-up.json");

  // Extra mobility
  set("air_evade", "running-forward-flip.json", "front-twist-flip.json", "aerial-evade.json", "corkscrew-evade.json");
  set("slide", "running-slide.json", "trip-running-slide.json");
  set("roll", "falling-to-roll.json", "roll-running.json", "quick-roll-to-run.json");
  set("land", "jumping-down.json", "hard-landing.json");

  // Magic multi-attack bank (skill tree)
  const magicAtks = files.filter((f) => /magic-attack|1h-magic|2h-magic|cast-spell|area-attack|casting-spell/i.test(f));
  if (magicAtks.length) {
    roles.attacks = magicAtks;
    if (!roles.attack) roles.attack = magicAtks[0];
    if (!roles.channel) roles.channel = magicAtks.find((f) => /cast/i.test(f)) || magicAtks[0];
  }

  // Emote bank
  const emoteFiles = files.filter((f) =>
    /dance|gesture|acknowledge|dismiss|happy|cocky|wave|sigh|emote|hip-hop|spinning|butterfly/i.test(f),
  );
  if (emoteFiles.length) roles.emoteBank = emoteFiles;

  // 2h slash bank
  const slashes = files.filter((f) => /slash|attack|impact|combo|thrust|stab|gunplay|whip/i.test(f));
  if (slashes.length && packId !== "traversal" && packId !== "locomotion_8way") {
    roles.attackBank = slashes.slice(0, 16);
  }

  return roles;
}

async function stagePack(packId, cfg) {
  const stageDir = path.join(STAGE_ANIMS, packId);
  await ensureDir(stageDir);
  // clear old staged fbx
  for (const e of await fs.readdir(stageDir)) {
    if (/\.fbx$/i.test(e)) await fs.unlink(path.join(stageDir, e));
  }

  const staged = new Map(); // slug -> abs path
  const max = cfg.maxFiles || 80;

  const nameFilter = cfg.nameFilter || null;
  for (const srcDir of cfg.sources || []) {
    const files = await listFbx(srcDir);
    for (const f of files) {
      const base = path.basename(f);
      if (nameFilter && !nameFilter.test(base)) continue;
      const slug = slugify(base);
      if (staged.has(slug)) continue;
      staged.set(slug, f);
      if (staged.size >= max) break;
    }
    if (staged.size >= max) break;
  }

  for (const g of cfg.gge || []) {
    const src = path.join(GGE, g.file);
    if (!(await exists(src))) continue;
    const slug = g.as || slugify(g.file);
    if (staged.has(slug)) continue;
    staged.set(slug, src);
  }

  let n = 0;
  for (const [slug, src] of staged) {
    const dest = path.join(stageDir, `${slug}.fbx`);
    await fs.copyFile(src, dest);
    n++;
  }
  console.log(`  staged ${n} fbx → ${stageDir}`);
  return n;
}

function runNode(script, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => {
      const s = d.toString();
      out += s;
      process.stdout.write(s);
    });
    child.stderr.on("data", (d) => {
      const s = d.toString();
      err += s;
      process.stderr.write(s);
    });
    child.on("close", (code) => {
      if (code === 0) resolve({ out, err });
      else reject(new Error(`${script} exit ${code}: ${(err || out).slice(-400)}`));
    });
  });
}

async function packagePack(packId, cfg) {
  const bakedDir = path.join(BAKED, packId);
  const dest = path.join(OUT, packId);
  await ensureDir(dest);

  // Remove legacy spaced names that break wrangler R2 keys
  if (await exists(dest)) {
    for (const e of await fs.readdir(dest)) {
      if (/\s/.test(e) || e.includes(".raw.")) {
        try {
          await fs.unlink(path.join(dest, e));
        } catch {
          /* ignore */
        }
      }
    }
  }

  const files = [];
  if (await exists(bakedDir)) {
    for (const e of await fs.readdir(bakedDir)) {
      if (!e.endsWith(".json")) continue;
      // e may already have spaces — always slugify basename
      const outName = `${slugify(e.replace(/\.json$/i, ""))}.json`;
      await fs.copyFile(path.join(bakedDir, e), path.join(dest, outName));
      if (!files.includes(outName)) files.push(outName);
    }
  }
  // keep existing dist slug-only json (no spaces)
  if (await exists(dest)) {
    for (const e of await fs.readdir(dest)) {
      if (
        e.endsWith(".json") &&
        e !== "package.json" &&
        !/\s/.test(e) &&
        !e.includes(".raw.") &&
        !files.includes(e)
      ) {
        files.push(e);
      }
    }
  }
  files.sort();
  const roles = buildRoles(files, packId);
  const man = {
    id: packId,
    name: cfg.name,
    skeleton: "Bip001",
    format: "json-tracks",
    retargeted: true,
    weapon: cfg.weapon,
    combat: !!cfg.combat,
    locomotion: !cfg.combat || ["longbow", "pistol", "rifle", "magic", "sword_shield", "2h_melee"].includes(packId),
    attacks: !!cfg.combat,
    roles,
    clips: files,
    relatedPack: cfg.relatedPack || undefined,
    authorSources: [...(cfg.sources || []), ...(cfg.gge?.length ? [GGE] : [])],
    bake: "Mixamo→Bip001 rotation-only via bake-anims.mjs",
    cdnBase: `${CDN}/${PROD_ANIMS}/${packId}/`,
    skillRoles: ["attack", "attack2", "attack3", "heavy", "combo", "skill1", "skill2", "skill3", "skill4", "cast", "jumpAttack", "block", "dodge"].filter(
      (r) => roles[r],
    ),
  };
  await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
  console.log(`  package ${packId}: ${files.length} clips · roles: ${Object.keys(roles).join(", ")}`);
  return man;
}

async function uploadDir(packId) {
  const dest = path.join(OUT, packId);
  if (!(await exists(dest))) return;
  const wranglerBin = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
  for (const e of await fs.readdir(dest)) {
    // Skip keys/paths with spaces or raw intermediates
    if (/\s/.test(e) || e.includes(".raw.")) continue;
    const local = path.join(dest, e);
    const st = await fs.stat(local);
    if (!st.isFile()) continue;
    const ct = e.endsWith(".json")
      ? "application/json"
      : e.endsWith(".glb")
        ? "model/gltf-binary"
        : "application/octet-stream";
    const r2Key = `${BUCKET}/${PROD_ANIMS}/${packId}/${e}`;
    const args = ["r2", "object", "put", r2Key, "--file", local, "--content-type", ct];
    if (has("--remote")) args.push("--remote");
    console.log("  r2 put", `${PROD_ANIMS}/${packId}/${e}`);
    let lastErr;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        await execFileAsync(wranglerBin, args, {
          cwd: ROOT,
          maxBuffer: 40 * 1024 * 1024,
          shell: process.platform === "win32",
          windowsHide: true,
        });
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`  retry ${attempt}/4 ${e}: ${(err.message || "").slice(0, 80)}`);
        await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }
    if (lastErr) throw lastErr;
  }
}

async function main() {
  console.log("bake-all-weapon-anim-packs");
  console.log("  viewer:", VIEWER);
  console.log("  target:", (await exists(TARGET_FBX)) ? "OK" : "MISSING BRB FBX");
  console.log("  bake:  ", (await exists(BAKE_SCRIPT)) ? "OK" : "MISSING");

  if (!(await exists(BAKE_SCRIPT))) {
    throw new Error("bake-anims.mjs not found — open grudge-character-animator character-viewer");
  }
  if (!(await exists(TARGET_FBX))) {
    console.log("  downloading BRB target…");
    await ensureDir(path.dirname(TARGET_FBX));
    const res = await fetch("https://assets.grudge-studio.com/models/grudge6/races/BRB_Characters.fbx");
    if (!res.ok) throw new Error("BRB download failed " + res.status);
    await fs.writeFile(TARGET_FBX, Buffer.from(await res.arrayBuffer()));
  }

  await ensureDir(OUT);
  const packages = [];
  const packIds = Object.keys(PACKS).filter((id) => !ONLY || ONLY.has(id.toLowerCase()));

  for (const packId of packIds) {
    const cfg = PACKS[packId];
    console.log(`\n═══ ${packId} ═══`);

    const bakedDir = path.join(BAKED, packId);
    const already = (await exists(bakedDir))
      ? (await fs.readdir(bakedDir)).filter((f) => f.endsWith(".json")).length
      : 0;

    if (!has("--skip-bake")) {
      if (cfg.skipIfBaked && already > 20) {
        console.log(`  skip bake (${already} already baked)`);
      } else {
        const n = await stagePack(packId, cfg);
        if (n === 0) {
          console.log("  no FBX sources — skip bake");
        } else {
          console.log(`  baking ${packId}…`);
          await runNode(BAKE_SCRIPT, [packId], VIEWER);
        }
      }
    }

    const man = await packagePack(packId, cfg);
    packages.push(man);

    if (has("--upload")) {
      await uploadDir(packId);
    }
  }

  // catalog
  const catalog = {
    version: 2,
    updatedAt: new Date().toISOString(),
    note: "Weapon combat packs — Mixamo→Bip001; skills/cast/combo roles in package.json",
    packages: packages.map((p) => ({
      id: p.id,
      name: p.name,
      weapon: p.weapon,
      clipCount: p.clips?.length || 0,
      skillRoles: p.skillRoles,
      roles: Object.keys(p.roles || {}),
      cdnBase: p.cdnBase,
    })),
    weaponToAnimPack: {
      sword: "sword_shield",
      shield: "sword_shield",
      dagger: "dagger",
      greatsword: "2h_melee",
      greataxe: "2h_melee",
      axe: "2h_melee",
      hammer: "2h_melee",
      mace: "2h_melee",
      pick: "2h_melee",
      spear: "polearm",
      polearm: "polearm",
      bow: "longbow",
      longbow: "longbow",
      crossbow: "pistol",
      pistol: "pistol",
      handgun: "pistol",
      tome: "pistol",
      wand: "pistol",
      rifle: "rifle",
      shotgun: "rifle",
      staff: "magic",
      magic: "magic",
      unarmed: "unarmed",
      harvest: "harvest",
      farming: "harvest",
      tool: "harvest",
      building: "building",
      build: "building",
      traversal: "traversal",
      emote: "emotes",
      gesture: "gestures",
      channel: "events",
      teleport: "events",
      block: "block",
      parry: "block",
    },
    eventPacks: [
      "locomotion_8way",
      "traversal",
      "unarmed",
      "harvest",
      "building",
      "gestures",
      "emotes",
      "events",
      "extra",
      "reactions",
      "block",
    ],
  };
  await fs.writeFile(path.join(OUT, "packages-weapons.json"), JSON.stringify(catalog, null, 2));
  console.log("\nwrote dist/prod/anims/packages-weapons.json");

  if (has("--upload")) {
    const wranglerBin = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
    const cat = path.join(OUT, "packages-weapons.json");
    const args = [
      "r2",
      "object",
      "put",
      `${BUCKET}/${PROD_ANIMS}/packages-weapons.json`,
      `--file=${cat}`,
      "--content-type=application/json",
    ];
    if (has("--remote")) args.push("--remote");
    await execFileAsync(wranglerBin, args, { cwd: ROOT, shell: process.platform === "win32" });

    const animJs = path.join(ROOT, "js", "grudge6-anim-packs.js");
    if (await exists(animJs)) {
      const a2 = [
        "r2",
        "object",
        "put",
        `${BUCKET}/js/grudge6-anim-packs.js`,
        `--file=${animJs}`,
        "--content-type=application/javascript",
      ];
      if (has("--remote")) a2.push("--remote");
      try {
        await execFileAsync(wranglerBin, a2, { cwd: ROOT, shell: process.platform === "win32" });
        console.log("uploaded js/grudge6-anim-packs.js");
      } catch (e) {
        console.warn("anim-packs.js upload failed (retry later):", e.message.slice(0, 120));
      }
    }
  }

  console.log("\nDONE packs:", packIds.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
