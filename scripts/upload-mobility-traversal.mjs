#!/usr/bin/env node
/**
 * Upload retargeted mobility climb/swim JSON → fleet baked paths.
 *
 *   node scripts/upload-mobility-traversal.mjs
 *   node scripts/upload-mobility-traversal.mjs --dry
 *
 * Keys:
 *   anims/baked/mobility/climb/*.json
 *   anims/baked/mobility/swim/*.json
 *   prod/anims/traversal/{role}.json  (packages-weapons cdnBase roles)
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = "D:\\Games\\Models\\_anim_packs\\retargeted\\mobility";
const STAGE = join(ROOT, "dist/prod/anims/mobility");
const BUCKET = process.env.R2_BUCKET || "grudge-assets";
const dry = process.argv.includes("--dry");

/** Map disk file → traversal pack role aliases for packages-weapons.json */
const ROLE_ALIASES = {
  "climb/climbing.json": ["climb", "climbLadder"],
  "climb/up.json": ["climbUp"],
  "climb/down.json": ["climbDown"],
  "climb/to_top.json": ["toTop", "mantle"],
  "climb/hang_idle.json": ["hang"],
  "climb/jump_to_hang.json": ["jumpToHang"],
  "climb/stand_to_hang.json": ["standToHang"],
  "climb/freehang_climb.json": ["freehangClimb"],
  "climb/wall_run.json": ["wallRun"],
  "swim/swimming.json": ["swim", "swimFast"],
  "swim/treading.json": ["treadWater"],
  "swim/to_edge.json": ["swimToEdge"],
};

function put(file, key) {
  return new Promise((resolve, reject) => {
    const wr =
      process.env.WRANGLER_BIN ||
      (process.platform === "win32" ? "wrangler.cmd" : "wrangler");
    const child = spawn(
      wr,
      [
        "r2",
        "object",
        "put",
        `${BUCKET}/${key}`,
        "--file",
        file,
        "--content-type",
        "application/json",
        "--remote",
      ],
      { cwd: ROOT, shell: true, stdio: ["ignore", "pipe", "pipe"] }
    );
    let err = "";
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.slice(0, 300) || `exit ${code}`));
    });
  });
}

function assertBakedJson(file) {
  const raw = readFileSync(file, "utf8");
  const j = JSON.parse(raw);
  const tracks = j.tracks || j.clip?.tracks;
  if (!Array.isArray(tracks) || !tracks.length) {
    throw new Error(`no tracks: ${file}`);
  }
  // glTF-style name or three clip JSON
  return { bytes: statSync(file).size, tracks: tracks.length, name: j.name || basename(file) };
}

async function main() {
  if (!existsSync(SRC)) throw new Error(`missing ${SRC}`);
  mkdirSync(join(STAGE, "climb"), { recursive: true });
  mkdirSync(join(STAGE, "swim"), { recursive: true });

  const files = [];
  for (const folder of ["climb", "swim"]) {
    const dir = join(SRC, folder);
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".json")) continue;
      const src = join(dir, name);
      const rel = `${folder}/${name}`;
      const dest = join(STAGE, folder, name);
      copyFileSync(src, dest);
      const info = assertBakedJson(dest);
      files.push({ rel, dest, ...info });
    }
  }

  console.log(`mobility files: ${files.length}`);
  let ok = 0;
  let fail = 0;

  for (const f of files) {
    const bakedKey = `anims/baked/mobility/${f.rel}`;
    console.log(`${dry ? "DRY" : "PUT"} ${bakedKey} (${f.bytes} B, tracks=${f.tracks})`);
    if (!dry) {
      try {
        await put(f.dest, bakedKey);
        ok++;
      } catch (e) {
        console.error("FAIL", bakedKey, e.message);
        fail++;
        continue;
      }
    }
    const aliases = ROLE_ALIASES[f.rel] || [];
    for (const role of aliases) {
      const travKey = `prod/anims/traversal/${role}.json`;
      console.log(`${dry ? "DRY" : "PUT"} ${travKey} ← ${f.rel}`);
      if (!dry) {
        try {
          await put(f.dest, travKey);
          ok++;
        } catch (e) {
          console.error("FAIL", travKey, e.message);
          fail++;
        }
      }
    }
  }

  console.log(`done ok=${ok} fail=${fail} dry=${dry}`);
  if (fail) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
