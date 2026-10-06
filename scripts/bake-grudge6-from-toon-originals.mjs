/**
 * Bake grudge6 race kits from LOCAL Toon RTS FBX originals (not CDN re-download).
 * Source: raw/grudge6_toon_originals/{WK|BRB|ELF|DWF|ORC|UD}_Characters.fbx + atlases
 * Out: dist/prod/grudge6_toon/{id}_Characters.glb + collider + manifest
 *
 * Usage: node scripts/bake-grudge6-from-toon-originals.mjs
 */
import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONVERT = join(ROOT, "tools/grudge-convert/bin/grudge-convert.mjs");
const SRC = join(ROOT, "raw/grudge6_toon_originals");
const WORK = join(ROOT, "raw/grudge6_bake_work");
const DIST = join(ROOT, "dist/prod/grudge6_toon");

const RACES = ["WK", "BRB", "ELF", "DWF", "ORC", "UD"];

function runConvert(args) {
  const r = spawnSync(process.execPath, [CONVERT, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 40 * 1024 * 1024,
    env: {
      ...process.env,
      BLENDER_PATH: process.env.BLENDER_PATH || "C:\\Users\\nugye\\tools\\Blender\\blender.exe",
    },
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) {
    throw new Error(`convert failed (${r.status}): ${args.join(" ")}`);
  }
}

async function main() {
  await fs.mkdir(WORK, { recursive: true });
  await fs.mkdir(DIST, { recursive: true });
  const results = [];

  for (const id of RACES) {
    console.log(`\n═══ ${id} (Toon RTS original) ═══`);
    const fbx = join(SRC, `${id}_Characters.fbx`);
    const atlas = join(SRC, `${id}_atlas.webp`);
    await fs.access(fbx);
    await fs.access(atlas);

    const rawGlb = join(WORK, `${id}_Characters.raw.glb`);
    const prodGlb = join(DIST, `${id}_Characters.glb`);

    // fbx2gltf: cm→m + atlas rebind, keep float meshes
    runConvert([
      "fbx2gltf",
      fbx,
      "-o",
      rawGlb,
      "--cm-to-m",
      "--texture",
      atlas,
      "--no-meshopt",
    ]);

    // glb2glb: body-only SI 1.8 m, texture 1024
    runConvert([
      "glb2glb",
      rawGlb,
      "-o",
      prodGlb,
      "--height",
      "1.8",
      "--texture-size",
      "1024",
    ]);

    // Copy source FBX next to GLB for CDN dual-upload (FBX remains material SSOT)
    await fs.copyFile(fbx, join(DIST, `${id}_Characters.fbx`));

    const manPath = prodGlb.replace(/\.glb$/i, ".manifest.json");
    let manifest = {};
    try {
      manifest = JSON.parse(await fs.readFile(manPath, "utf8"));
    } catch {
      /* */
    }
    const row = {
      id,
      glb: prodGlb,
      fbx: join(DIST, `${id}_Characters.fbx`),
      aabb: manifest.aabb,
      stats: manifest.stats,
    };
    results.push(row);
    const h = manifest.aabb?.size?.[1];
    console.log(
      `  ✓ ${id}: aabbY=${typeof h === "number" ? h.toFixed(3) : "?"} meshes=${manifest.stats?.meshes ?? "?"}`,
    );
  }

  const summaryPath = join(DIST, "bake-summary.json");
  await fs.writeFile(
    summaryPath,
    JSON.stringify(
      {
        producedAt: new Date().toISOString(),
        source: "raw/grudge6_toon_originals (Documents/fbxtoon_rts + ELF from prior cache)",
        races: results,
      },
      null,
      2,
    ),
  );
  console.log(`\nSummary → ${summaryPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
