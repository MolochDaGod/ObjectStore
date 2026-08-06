#!/usr/bin/env node
/**
 * build-prod-anim-packages.mjs
 *
 * Production combat animation packages + weapon mesh companions.
 *
 * Packs (weapon locomotion + attacks):
 *   sword_shield   — knight 1H + shield (FBX sources + any baked)
 *   greatsword_samurai — samurai 2H (baked JSON, Bip001)
 *   pistol         — pistol loco/attacks (FBX → GLB library)
 *   rifle          — rifle baked JSON
 *   polearm/spear  — spear Bip001 baked (madarame polearm)
 *   harvest        — farming FBX → GLB
 *   block          — block/parry FBX → GLB
 *   roll_dodge     — reactions dodge/roll FBX → GLB
 *   locomotion     — base loco baked JSON
 *   longbow, magic — existing baked
 *   2h_melee       — AUTHOR: D:\Games\Models\_anim_packs\_gap_fill_stage\2h_melee
 *                    (greatsword 2H FBX) + relatedPack greatsword_samurai baked JSON
 *
 * Layout on R2:
 *   prod/anims/<pack>/*.json|*.glb
 *   prod/anims/packages.json          — package catalog + role maps
 *   prod/gltf/weapons/{pistol,rifle,greatsword}.glb
 *
 * Usage:
 *   node scripts/build-prod-anim-packages.mjs
 *   node scripts/build-prod-anim-packages.mjs --upload --remote
 *   node scripts/build-prod-anim-packages.mjs --only=2h_melee --upload --remote
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import crypto from "node:crypto";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist/prod/anims");
const WEAP_OUT = path.join(ROOT, "dist/prod/gltf/weapons");
const CONVERT = path.join(ROOT, "tools/grudge-convert/bin/grudge-convert.mjs");
const CDN = "https://assets.grudge-studio.com";
const BUCKET = "grudge-assets";
const PROD_ANIMS = "prod/anims";

const has = (f) => process.argv.includes(f);

// ── source trees ──────────────────────────────────────────────────────────
const ANIM = path.join(ROOT, "..", "gameopen", "artifacts", "animator", "public", "anim");
const BAKED_OPEN = path.join(ROOT, "..", "gameopen", "artifacts", "animator", "public", "anims", "baked");
const BAKED_VENDOR = path.join(
  ROOT,
  "..",
  "GrudgeBuilder",
  "vendor",
  "grudge-character-animator",
  "artifacts",
  "grudge-game",
  "public",
  "anims",
  "baked",
);
const SAMURAI = path.join(ROOT, "..", "GrudgeBuilder", "client", "public", "anims", "baked", "greatsword_samurai");

/** Gap-fill author tree (desktop) — 2h_melee greatsword FBX SSOT */
const GAP_FILL_2H = "D:\\Games\\Models\\_anim_packs\\_gap_fill_stage\\2h_melee";
const GREAT_SWORD_PACK = "D:\\Games\\Models\\_anim_packs\\greatsword";

const ONLY = (() => {
  const a = process.argv.find((x) => x.startsWith("--only="));
  return a ? a.slice("--only=".length) : null;
})();

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd || ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      shell: opts.shell ?? false,
      env: process.env,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      if (code === 0) resolve({ out, err });
      else reject(new Error(`${cmd} exit ${code}: ${(err || out).slice(0, 500)}`));
    });
  });
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

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function copyGlob(srcDir, destDir, exts = [".json"]) {
  if (!(await exists(srcDir))) return [];
  const out = [];
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isFile()) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (!exts.includes(ext)) continue;
    if (e.name === "manifest.json" || e.name === "combat-map.json") {
      // still copy
    }
    const dest = path.join(destDir, e.name);
    await copyFile(path.join(srcDir, e.name), dest);
    out.push(e.name);
  }
  return out;
}

async function listFbx(dir) {
  if (!(await exists(dir))) return [];
  const all = await fs.readdir(dir);
  return all.filter((n) => n.toLowerCase().endsWith(".fbx")).map((n) => path.join(dir, n));
}

/** Convert single FBX → GLB into destDir/slug.glb (animation library). */
async function fbxToGlb(fbxPath, destGlb) {
  await ensureDir(path.dirname(destGlb));
  const rawBase = destGlb.replace(/\.glb$/i, ".raw");
  await run(process.execPath, [
    CONVERT,
    "fbx2gltf",
    fbxPath,
    "-o",
    rawBase + ".glb",
    "--no-meshopt",
  ]);
  // Prefer raw if glb2glb strips anims; try copy raw as prod
  const rawGlb = rawBase + ".glb";
  if (await exists(rawGlb)) {
    // light pass keep anims
    try {
      await run(process.execPath, [
        CONVERT,
        "glb2glb",
        rawGlb,
        "-o",
        destGlb,
        "--texture-size",
        "512",
      ]);
    } catch {
      await copyFile(rawGlb, destGlb);
    }
  }
  if (!(await exists(destGlb))) throw new Error(`no glb for ${fbxPath}`);
  return destGlb;
}

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Role map: runtime looks up idle/walk/run/attack/block/roll/…
 * Prefer explicit filenames when present.
 */
function buildRoleMap(files, packId) {
  const lower = Object.fromEntries(files.map((f) => [f.toLowerCase(), f]));
  const pick = (...candidates) => {
    for (const c of candidates) {
      const hit = files.find((f) => f.toLowerCase() === c.toLowerCase());
      if (hit) return hit;
      const partial = files.find((f) => f.toLowerCase().includes(c.toLowerCase().replace(/\.(json|glb)$/, "")));
      if (partial) return partial;
    }
    return null;
  };

  const roles = {};
  if (packId === "greatsword_samurai") {
    roles.idle = pick("gs_samurai_idle.json", "gs_samurai_idle_sword.json");
    roles.walk = pick("gs_samurai_walk.json", "gs_samurai_walk_sword.json");
    roles.run = pick("gs_samurai_run.json", "gs_samurai_run_sword.json");
    roles.jump = pick("gs_samurai_jump.json");
    roles.attack = pick("gs_samurai_combo_a.json", "gs_samurai_dash_opener.json");
    roles.heavy = pick("gs_samurai_combo_b.json", "gs_samurai_teleport_strike.json");
    roles.draw = pick("gs_samurai_sword_on.json");
    roles.sheath = pick("gs_samurai_sword_off.json");
  } else if (packId === "sword_shield") {
    roles.idle = pick("sword-and-shield-idle.glb", "sword and shield idle.json", "idle.glb");
    roles.walk = pick("sword-and-shield-run.glb", "sword-and-shield-strafe.glb");
    roles.run = pick("sword-and-shield-run.glb", "sword-and-shield-run-2.glb");
    roles.attack = pick("sword-and-shield-attack.glb", "sword-and-shield-attack-2.glb");
    roles.attack2 = pick("sword-and-shield-attack-2.glb");
    roles.attack3 = pick("sword-and-shield-attack-3.glb");
    roles.heavy = pick("sword-and-shield-attack-5.glb", "sword-and-shield-attack-4.glb");
    roles.block = pick("sword-and-shield-block.glb", "sword-and-shield-block-idle.glb");
    roles.blockIdle = pick("sword-and-shield-block-idle.glb");
    roles.death = pick("sword-and-shield-death.glb");
    roles.cast = pick("sword-and-shield-casting.glb");
  } else if (packId === "pistol") {
    roles.idle = pick("idle.glb");
    roles.walk = pick("walk-forward.glb");
    roles.run = pick("run-forward.glb");
    roles.attack = pick("gunplay.glb", "pistol-whip.glb");
    roles.heavy = pick("charged-pistol.glb");
    roles.draw = pick("drawing-gun.glb");
    roles.jump = pick("pistol-jump.glb", "jump.glb");
    roles.strafeL = pick("strafe-left.glb");
    roles.strafeR = pick("strafe-right.glb");
  } else if (packId === "rifle") {
    roles.idle = pick("rifle-aiming-idle.json", "idle.glb", "downrange-aiming-idle.json");
    roles.walk = pick("walking.json");
    roles.run = pick("rifle-run.json", "run-forward.glb");
    roles.attack = pick("firing-rifle.json");
    roles.reload = pick("reloading.json");
    roles.jump = pick("rifle-jump.json");
    roles.hit = pick("hit-reaction.json");
  } else if (packId === "polearm" || packId === "spear") {
    roles.idle = pick("idle.json");
    roles.walk = pick("walk.json");
    roles.run = pick("run.json");
    roles.attack = pick("attack.json", "thrust.json");
    roles.heavy = pick("overhead.json", "power.json");
    roles.combo = pick("combo.json");
    roles.hurt = pick("hurt.json");
    roles.death = pick("death.json");
  } else if (packId === "harvest") {
    roles.harvest = pick("dig-and-plant-seeds.glb", "pull-plant.glb");
    roles.plant = pick("plant-tree.glb", "dig-and-plant-seeds.glb");
    roles.water = pick("watering.glb");
    roles.gather = pick("pick-fruit.glb", "pull-plant.glb");
  } else if (packId === "block") {
    roles.block = pick("standing-block-idle.glb", "left-block.glb");
    roles.blockL = pick("left-block.glb");
    roles.blockR = pick("right-block.glb");
    roles.parry = pick("parry.glb");
    roles.blockHit = pick("block-react-large.glb", "standing-block-react-large.glb");
  } else if (packId === "roll_dodge") {
    roles.dodge = pick("dodging-back.glb", "jump-away.glb");
    roles.roll = pick("dodging-back.glb"); // best available; no pure roll in set
    roles.getUp = pick("get-up.glb");
    roles.hit = pick("hit-to-head.glb", "big-body-blow.glb");
  } else if (packId === "locomotion") {
    roles.idle = pick("crouch_idle.json", "idle.json");
    roles.jump = pick("jump.json");
    roles.dodgeBack = pick("dodge_back.json");
    roles.dodgeFwd = pick("dodge_fwd.json");
    roles.dodgeL = pick("dodge_l.json");
    roles.dodgeR = pick("dodge_r.json");
    roles.plant = pick("plant_seed.json"); // harvest bridge
    roles.fall = pick("fall_in.json");
    roles.swim = pick("swim.json");
  } else if (packId === "2h_melee") {
    roles.idle = pick("great-sword-idle.glb");
    roles.walk = pick("great-sword-walk.glb");
    roles.run = pick("great-sword-run.glb");
    roles.attack = pick("great-sword-slash.glb", "quick-slash.glb");
    roles.heavy = pick("great-sword-overhead.glb", "great-sword-combo.glb");
    roles.block = pick("great-sword-blocking.glb");
    roles.jumpAttack = pick("great-sword-jump-attack.glb");
  } else {
    // generic heuristics
    roles.idle = pick("idle.json", "idle.glb");
    roles.walk = pick("walk.json", "walking.json", "walk.glb");
    roles.run = pick("run.json", "running.json", "run.glb");
    roles.attack = pick("attack.json", "slash.json");
  }

  // drop nulls
  for (const k of Object.keys(roles)) {
    if (!roles[k]) delete roles[k];
  }
  return roles;
}

async function convertFbxDir(srcDir, destDir, limit = 40) {
  const files = await listFbx(srcDir);
  const written = [];
  let i = 0;
  for (const fbx of files) {
    if (i++ >= limit) break;
    const slug = slugify(path.basename(fbx));
    const dest = path.join(destDir, `${slug}.glb`);
    process.stdout.write(`  fbx→glb ${slug}…`);
    try {
      await fbxToGlb(fbx, dest);
      written.push(`${slug}.glb`);
      console.log(" ok");
    } catch (e) {
      console.log(" FAIL", e.message.slice(0, 80));
    }
  }
  return written;
}

async function uploadR2(localFile, r2Key, contentType, remote) {
  const wranglerBin = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
  const args = [
    "r2",
    "object",
    "put",
    `${BUCKET}/${r2Key}`,
    `--file=${localFile}`,
    `--content-type=${contentType}`,
  ];
  if (remote) args.push("--remote");
  console.log("  r2 put", r2Key);
  await execFileAsync(wranglerBin, args, {
    cwd: ROOT,
    maxBuffer: 40 * 1024 * 1024,
    shell: process.platform === "win32",
  });
}

async function bakeWeaponMeshes() {
  const jobs = [
    { slug: "pistol", cdn: "models/weapons/pistol.glb" },
    { slug: "rifle", cdn: "models/weapons/rifle.glb" },
    { slug: "greatsword", cdn: "models/weapons/greatsword.glb" },
  ];
  const results = [];
  await ensureDir(WEAP_OUT);
  for (const j of jobs) {
    const cache = path.join(ROOT, "raw/cdn-cache", `${j.slug}.glb`);
    const out = path.join(WEAP_OUT, `${j.slug}.glb`);
    try {
      if (!(await exists(cache))) {
        console.log(`  GET ${j.cdn}`);
        const r = await fetch(`${CDN}/${j.cdn}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        await ensureDir(path.dirname(cache));
        await fs.writeFile(cache, Buffer.from(await r.arrayBuffer()));
      }
      await run(process.execPath, [
        CONVERT,
        "glb2glb",
        cache,
        "-o",
        out,
        "--texture-size",
        "1024",
      ]);
      const st = await fs.stat(out);
      results.push({
        id: `weapons/${j.slug}`,
        r2Key: `prod/gltf/weapons/${j.slug}.glb`,
        cdnUrl: `${CDN}/prod/gltf/weapons/${j.slug}.glb`,
        bytes: st.size,
        localPath: out,
      });
      console.log(`  weapon ${j.slug} ${st.size} B`);
    } catch (e) {
      console.error(`  weapon ${j.slug} FAIL`, e.message);
    }
  }
  return results;
}

async function main() {
  const doUpload = has("--upload");
  const remote = has("--remote");

  console.log("grudge-convert doctor…");
  await run(process.execPath, [CONVERT, "doctor"]);

  await ensureDir(OUT);
  const packages = [];

  // ── 1. Samurai (baked JSON, Bip001 underscore tracks) ───────────────────
  {
    const id = "greatsword_samurai";
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} (retargeted samurai 2H) ═══`);
    const files = await copyGlob(SAMURAI, dest, [".json"]);
    const roles = buildRoleMap(files, id);
    const man = {
      id,
      name: "Greatsword Samurai",
      skeleton: "Bip001",
      boneStyle: "underscore", // Bip001_Head
      format: "json-tracks",
      retargeted: true,
      weapon: "greatsword",
      locomotion: true,
      attacks: true,
      roles,
      clips: files.filter((f) => f.endsWith(".json") && !f.includes("manifest") && !f.includes("combat-map")),
      source: "GrudgeBuilder/client/public/anims/baked/greatsword_samurai",
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
    console.log(`  ${man.clips.length} clips · roles: ${Object.keys(roles).join(", ")}`);
  }

  // ── 2. Sword & shield knight (FBX originals — Mixamo/Bip-style) ─────────
  {
    const id = "sword_shield";
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} (knight sword+shield) ═══`);
    // Prefer baked if any
    let files = await copyGlob(path.join(BAKED_VENDOR, "sword_shield"), dest, [".json"]);
    files = files.concat(await copyGlob(path.join(BAKED_OPEN, "sword_shield"), dest, [".json"]));
    // Convert priority S&S FBX set
    const swordDir = path.join(ANIM, "sword");
    const wanted = [
      "sword-and-shield-idle.fbx",
      "sword-and-shield-run.fbx",
      "sword-and-shield-run-2.fbx",
      "sword-and-shield-attack.fbx",
      "sword-and-shield-attack-2.fbx",
      "sword-and-shield-attack-3.fbx",
      "sword-and-shield-attack-4.fbx",
      "sword-and-shield-attack-5.fbx",
      "sword-and-shield-block.fbx",
      "sword-and-shield-block-idle.fbx",
      "sword-and-shield-casting.fbx",
      "sword-and-shield-death.fbx",
      "sword-and-shield-strafe.fbx",
      "sword-and-shield-turn.fbx",
      "one-hand-sword-combo.fbx",
    ];
    for (const name of wanted) {
      const src = path.join(swordDir, name);
      if (!(await exists(src))) continue;
      const slug = slugify(name);
      try {
        await fbxToGlb(src, path.join(dest, `${slug}.glb`));
        files.push(`${slug}.glb`);
        console.log(`  + ${slug}.glb`);
      } catch (e) {
        console.warn(`  skip ${name}: ${e.message.slice(0, 60)}`);
      }
    }
    const roles = buildRoleMap(files, id);
    const man = {
      id,
      name: "Knight Sword & Shield",
      skeleton: "Bip001",
      boneStyle: "mixed",
      format: "json+glb",
      retargeted: true,
      weapon: "sword_shield",
      locomotion: true,
      attacks: true,
      block: true,
      roles,
      clips: files,
      source: "gameopen/.../anim/sword + baked sword_shield",
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
    console.log(`  ${files.length} clips · roles: ${Object.keys(roles).join(", ")}`);
  }

  // ── 3. Pistol package ───────────────────────────────────────────────────
  {
    const id = "pistol";
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} ═══`);
    const files = await convertFbxDir(path.join(ANIM, "pistol"), dest, 30);
    const roles = buildRoleMap(files, id);
    const man = {
      id,
      name: "Pistol Locomotion + Attacks",
      skeleton: "Bip001",
      format: "glb",
      retargeted: true,
      weapon: "pistol",
      locomotion: true,
      attacks: true,
      roles,
      clips: files,
      meshCdn: `${CDN}/prod/gltf/weapons/pistol.glb`,
      source: "gameopen/.../anim/pistol",
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
  }

  // ── 4. Rifle (baked JSON preferred) ─────────────────────────────────────
  {
    const id = "rifle";
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} ═══`);
    let files = await copyGlob(path.join(BAKED_VENDOR, "rifle"), dest, [".json"]);
    // supplement with FBX if sparse
    if (files.length < 5) {
      files = files.concat(await convertFbxDir(path.join(ANIM, "rifle"), dest, 15));
    }
    const roles = buildRoleMap(files, id);
    const man = {
      id,
      name: "Rifle Locomotion + Attacks",
      skeleton: "Bip001",
      format: files.some((f) => f.endsWith(".json")) ? "json+glb" : "glb",
      retargeted: true,
      weapon: "rifle",
      locomotion: true,
      attacks: true,
      roles,
      clips: files,
      meshCdn: `${CDN}/prod/gltf/weapons/rifle.glb`,
      source: "grudge-game baked/rifle + anim/rifle",
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
  }

  // ── 5. Polearm / spear (Bip001 rotation-only JSON — original usable) ─────
  {
    const id = "polearm";
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} (spear / Bip001 original bake) ═══`);
    const files = await copyGlob(path.join(BAKED_OPEN, "polearm"), dest, [".json"]);
    // also alias pack "spear"
    const roles = buildRoleMap(files, "polearm");
    const man = {
      id,
      name: "Polearm / Spear (Bip001)",
      skeleton: "Bip001",
      boneStyle: "spaced", // Bip001 Pelvis
      format: "json-tracks",
      retargeted: true,
      originalBip001: true,
      weapon: "spear",
      locomotion: true,
      attacks: true,
      roles,
      clips: files.filter((f) => f.endsWith(".json") && f !== "manifest.json" && f !== "package.json"),
      aliases: ["spear"],
      source: "gameopen bake-madarame-polearm",
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    // spear alias dir
    const spearDest = path.join(OUT, "spear");
    await ensureDir(spearDest);
    for (const f of man.clips) {
      await copyFile(path.join(dest, f), path.join(spearDest, f));
    }
    const spearMan = { ...man, id: "spear", name: "Spear (alias of polearm)", cdnBase: `${CDN}/${PROD_ANIMS}/spear/` };
    await fs.writeFile(path.join(spearDest, "package.json"), JSON.stringify(spearMan, null, 2));
    packages.push(man, spearMan);
    console.log(`  ${man.clips.length} bip001 clips`);
  }

  // ── 6. Harvest (farming FBX — bip001 usable) ────────────────────────────
  {
    const id = "harvest";
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} ═══`);
    const files = await convertFbxDir(path.join(ANIM, "farming"), dest, 10);
    // also plant_seed from locomotion baked
    const plant = path.join(BAKED_VENDOR, "locomotion", "plant_seed.json");
    if (await exists(plant)) {
      await copyFile(plant, path.join(dest, "plant_seed.json"));
      files.push("plant_seed.json");
    }
    const roles = buildRoleMap(files, id);
    const man = {
      id,
      name: "Harvest / Farming",
      skeleton: "Bip001",
      format: "glb+json",
      originalBip001: true,
      weapon: null,
      roles,
      clips: files,
      source: "anim/farming + locomotion plant_seed",
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
  }

  // ── 7. Block ────────────────────────────────────────────────────────────
  {
    const id = "block";
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} ═══`);
    const files = await convertFbxDir(path.join(ANIM, "block"), dest, 15);
    const roles = buildRoleMap(files, id);
    const man = {
      id,
      name: "Block / Parry",
      skeleton: "Bip001",
      format: "glb",
      originalBip001: true,
      roles,
      clips: files,
      source: "anim/block",
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
  }

  // ── 8. Roll / dodge (reactions) ─────────────────────────────────────────
  {
    const id = "roll_dodge";
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} ═══`);
    const react = path.join(ANIM, "reactions");
    const want = [
      "dodging-back.fbx",
      "jump-away.fbx",
      "get-up.fbx",
      "hit-to-head.fbx",
      "big-body-blow.fbx",
      "parry.fbx",
      "falling.fbx",
    ];
    const files = [];
    for (const name of want) {
      const src = path.join(react, name);
      if (!(await exists(src))) continue;
      const slug = slugify(name);
      try {
        await fbxToGlb(src, path.join(dest, `${slug}.glb`));
        files.push(`${slug}.glb`);
      } catch (e) {
        console.warn("  skip", name, e.message.slice(0, 40));
      }
    }
    // vendor dodge json
    for (const n of ["dodge_back.json", "dodge_fwd.json", "dodge_l.json", "dodge_r.json", "aerial_evade.json"]) {
      const src = path.join(BAKED_VENDOR, "locomotion", n);
      if (await exists(src)) {
        await copyFile(src, path.join(dest, n));
        files.push(n);
      }
    }
    const roles = buildRoleMap(files, id);
    const man = {
      id,
      name: "Roll / Dodge / Hit Reactions",
      skeleton: "Bip001",
      format: "glb+json",
      originalBip001: true,
      roles,
      clips: files,
      note: "No dedicated roll FBX in reactions; dodging-back + dodge_*.json used as roll/dodge",
      source: "anim/reactions + baked locomotion dodges",
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
  }

  // ── 9. Locomotion + longbow + magic + 2h ────────────────────────────────
  for (const [id, src] of [
    ["locomotion", path.join(BAKED_VENDOR, "locomotion")],
    ["longbow", path.join(BAKED_VENDOR, "longbow")],
    ["magic", path.join(BAKED_VENDOR, "magic")],
  ]) {
    const dest = path.join(OUT, id);
    console.log(`\n═══ ${id} ═══`);
    let files = await copyGlob(src, dest, [".json"]);
    // open fallbacks
    files = files.concat(await copyGlob(path.join(BAKED_OPEN, id), dest, [".json"]));
    files = [...new Set(files)];
    const roles = buildRoleMap(files, id);
    const man = {
      id,
      name: id,
      skeleton: "Bip001",
      format: "json-tracks",
      retargeted: true,
      locomotion: id === "locomotion" || true,
      attacks: id !== "locomotion",
      roles,
      clips: files.filter((f) => f.endsWith(".json")),
      source: src,
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
    console.log(`  ${man.clips.length} clips`);
  }

  // 2h_melee — AUTHOR SSOT: _gap_fill_stage/2h_melee (greatsword 2H FBX)
  // Fallback: _anim_packs/greatsword · legacy anim/greatsword
  if (!ONLY || ONLY === "2h_melee") {
    const id = "2h_melee";
    const dest = path.join(OUT, id);
    await ensureDir(dest);
    console.log(`\n═══ ${id} ═══`);
    const sources = [GAP_FILL_2H, GREAT_SWORD_PACK, path.join(ANIM, "greatsword")];
    let srcDir = null;
    for (const d of sources) {
      if (await exists(d)) {
        srcDir = d;
        break;
      }
    }
    console.log(`  source: ${srcDir || "(missing)"}`);
    let files = [];
    if (srcDir) {
      // Convert ALL FBX in gap-fill (slugify spaces → hyphens)
      files = await convertFbxDir(srcDir, dest, 80);
      // Prefer non-numbered idle/walk/run for roles when both exist
    }
    // Copy any already-baked local GLBs if convert failed partial
    if (await exists(path.join(OUT, id))) {
      const existing = await fs.readdir(dest);
      for (const e of existing) {
        if (e.endsWith(".glb") && !e.includes(".raw") && !files.includes(e)) files.push(e);
      }
    }
    const roles = buildRoleMap(files, id);
    // Explicit role picks for gap-fill naming (great-sword-idle.glb etc.)
    const pickFile = (...cands) => {
      for (const c of cands) {
        const hit = files.find((f) => f.toLowerCase() === c.toLowerCase());
        if (hit) return hit;
      }
      for (const c of cands) {
        const key = c.replace(/\.(glb|json)$/i, "").toLowerCase();
        const hit = files.find((f) => f.toLowerCase().includes(key));
        if (hit) return hit;
      }
      return null;
    };
    roles.idle =
      pickFile("great-sword-idle.glb", "great-sword-idle-2.glb", "great-sword-idle-3.glb") ||
      roles.idle;
    roles.walk = pickFile("great-sword-walk.glb", "great-sword-walk-2.glb") || roles.walk;
    roles.run = pickFile("great-sword-run.glb", "great-sword-run-2.glb") || roles.run;
    roles.attack =
      pickFile(
        "great-sword-slash.glb",
        "great-sword-attack.glb",
        "great-sword-slash-2.glb",
        "great-sword-high-spin-attack.glb",
      ) || roles.attack;
    roles.heavy =
      pickFile("great-sword-overhead.glb", "great-sword-combo.glb", "great-sword-jump-attack.glb") ||
      roles.heavy;
    roles.block =
      pickFile("great-sword-blocking.glb", "great-sword-blocking-2.glb") || roles.block;
    roles.jumpAttack = pickFile("great-sword-jump-attack.glb") || roles.jumpAttack;
    roles.draw = pickFile("draw-a-great-sword-1.glb", "draw-a-great-sword-2.glb") || roles.draw;
    roles.death =
      pickFile("two-handed-sword-death.glb", "two-handed-sword-death-2.glb") || roles.death;

    const man = {
      id,
      name: "2H Melee / Greatsword",
      skeleton: "Bip001",
      format: "glb",
      retargeted: true,
      weapon: "greatsword",
      locomotion: true,
      attacks: true,
      block: true,
      roles,
      clips: files,
      relatedPack: "greatsword_samurai",
      relatedNote: "Samurai baked JSON is companion set for 2h_melee idle/combo when GLB clips missing",
      meshCdn: `${CDN}/prod/gltf/weapons/greatsword.glb`,
      authorSource: GAP_FILL_2H,
      source: srcDir || GAP_FILL_2H,
      cdnBase: `${CDN}/${PROD_ANIMS}/${id}/`,
    };
    await fs.writeFile(path.join(dest, "package.json"), JSON.stringify(man, null, 2));
    packages.push(man);
    console.log(`  ${files.length} clips · roles: ${Object.keys(roles).join(", ")}`);
  }

  if (ONLY === "2h_melee") {
    // Skip rest of pack builds when --only=2h_melee
    const catalogOnly = {
      version: 1,
      updatedAt: new Date().toISOString(),
      packages: packages.map((p) => ({
        id: p.id,
        name: p.name,
        roles: p.roles,
        clipCount: (p.clips || []).length,
        cdnBase: p.cdnBase,
        authorSource: p.authorSource,
        relatedPack: p.relatedPack,
      })),
      weaponToAnimPack: {
        greatsword: "2h_melee",
        greataxe: "2h_melee",
        "2h": "2h_melee",
        "2h_melee": "2h_melee",
        twohand: "2h_melee",
        samurai: "2h_melee",
        greatsword_samurai: "2h_melee",
        axe: "2h_melee",
        hammer: "2h_melee",
        spear: "2h_melee",
      },
    };
    await fs.writeFile(path.join(OUT, "packages.json"), JSON.stringify(catalogOnly, null, 2));
    console.log("\n--only=2h_melee done →", path.join(OUT, "2h_melee"));
    if (has("--upload")) {
      const { uploadProdAnims } = await import("./upload-prod-anims.mjs").catch(() => ({}));
      // fallback inline upload of 2h_melee folder
      const dest = path.join(OUT, "2h_melee");
      const entries = await fs.readdir(dest);
      for (const e of entries) {
        if (e.includes(".raw.")) continue;
        const local = path.join(dest, e);
        const st = await fs.stat(local);
        if (!st.isFile()) continue;
        const ct = e.endsWith(".json") ? "application/json" : "model/gltf-binary";
        await uploadR2(local, `${PROD_ANIMS}/2h_melee/${e}`, ct, has("--remote"));
      }
      console.log("uploaded prod/anims/2h_melee/*");
    }
    process.exit(0);
  }

  // ── Weapon meshes ───────────────────────────────────────────────────────
  console.log("\n═══ weapon meshes pistol/rifle/greatsword ═══");
  const weapons = await bakeWeaponMeshes();

  // ── Master catalog ──────────────────────────────────────────────────────
  const catalog = {
    version: 1,
    updatedAt: new Date().toISOString(),
    cdnBase: CDN,
    prefix: PROD_ANIMS,
    usage: {
      load: `${CDN}/${PROD_ANIMS}/<pack>/<clip>`,
      packageMeta: `${CDN}/${PROD_ANIMS}/<pack>/package.json`,
      catalog: `${CDN}/${PROD_ANIMS}/packages.json`,
      openSameOrigin: "https://open.grudge-studio.com/anims/baked/<pack>/ (legacy partial)",
    },
    skeletonNote:
      "Bip001 packs use either spaced names (Bip001 Pelvis) or underscore (Bip001_Pelvis). Runtime rematch both.",
    packages: packages.map((p) => ({
      id: p.id,
      name: p.name,
      skeleton: p.skeleton,
      format: p.format,
      retargeted: !!p.retargeted,
      originalBip001: !!p.originalBip001,
      weapon: p.weapon ?? null,
      locomotion: !!p.locomotion,
      attacks: !!p.attacks,
      block: !!p.block,
      clipCount: (p.clips || []).length,
      roles: p.roles,
      cdnBase: p.cdnBase,
      meshCdn: p.meshCdn,
      aliases: p.aliases,
      note: p.note,
    })),
    weapons: weapons.map((w) => ({
      id: w.id,
      r2Key: w.r2Key,
      cdnUrl: w.cdnUrl,
      bytes: w.bytes,
    })),
    weaponToAnimPack: {
      sword: "sword_shield",
      sword_shield: "sword_shield",
      knight: "sword_shield",
      bow: "longbow",
      longbow: "longbow",
      staff: "magic",
      magic: "magic",
      spear: "polearm",
      polearm: "polearm",
      pistol: "pistol",
      rifle: "rifle",
      gun: "rifle",
      assault_rifle: "rifle",
      greatsword: "2h_melee",
      greataxe: "2h_melee",
      twohand: "2h_melee",
      "2h": "2h_melee",
      "2h_melee": "2h_melee",
      samurai: "2h_melee",
      greatsword_samurai: "2h_melee",
      axe: "2h_melee",
      hammer: "2h_melee",
      spear: "2h_melee",
      harvest: "harvest",
      block: "block",
      roll: "roll_dodge",
      dodge: "roll_dodge",
      locomotion: "locomotion",
    },
  };

  await fs.writeFile(path.join(OUT, "packages.json"), JSON.stringify(catalog, null, 2));
  await ensureDir(path.join(ROOT, "dist/packages"));
  await fs.writeFile(
    path.join(ROOT, "dist/packages/grudge-prod-anim-packages.json"),
    JSON.stringify(catalog, null, 2),
  );

  console.log("\n════════════════════════════════════════");
  console.log(`Anim packages: ${packages.length}`);
  for (const p of catalog.packages) {
    console.log(
      `  ${p.id.padEnd(22)} clips=${String(p.clipCount).padStart(3)} roles=${Object.keys(p.roles || {}).length} ${p.retargeted ? "retargeted" : p.originalBip001 ? "bip001" : ""}`,
    );
  }
  console.log(`Weapons: ${weapons.map((w) => w.id).join(", ")}`);
  console.log(`Catalog: ${path.join(OUT, "packages.json")}`);

  // ── Upload ──────────────────────────────────────────────────────────────
  if (doUpload) {
    console.log("\nUploading…");
    // walk all files under OUT
    async function walk(dir, acc = []) {
      for (const e of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) await walk(full, acc);
        else acc.push(full);
      }
      return acc;
    }
    const all = await walk(OUT);
    let ok = 0;
    let fail = 0;
    for (const file of all) {
      const rel = path.relative(OUT, file).replace(/\\/g, "/");
      const key = `${PROD_ANIMS}/${rel}`;
      const ext = path.extname(file).toLowerCase();
      const ct =
        ext === ".glb"
          ? "model/gltf-binary"
          : ext === ".json"
            ? "application/json"
            : "application/octet-stream";
      try {
        await uploadR2(file, key, ct, remote);
        ok++;
      } catch (e) {
        console.error("  FAIL", key, e.message?.slice?.(0, 80) || e);
        fail++;
      }
    }
    for (const w of weapons) {
      try {
        await uploadR2(w.localPath, w.r2Key, "model/gltf-binary", remote);
        ok++;
      } catch (e) {
        console.error("  FAIL weapon", w.id, e.message);
        fail++;
      }
    }
    // also mirror catalog to manifests/
    try {
      await uploadR2(
        path.join(OUT, "packages.json"),
        "manifests/grudge-prod-anim-packages.json",
        "application/json",
        remote,
      );
    } catch (e) {
      console.warn("manifest mirror fail", e.message);
    }
    console.log(`Upload done ok=${ok} fail=${fail}`);
  } else {
    console.log("Tip: re-run with --upload --remote to ship CDN");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
