/**
 * Production bake all grudge6 race kits → dist/prod/grudge6/
 * textured · meshed · SI 1.8 m body · glb2glb · per-mesh accurate colliders
 *
 * Usage: node scripts/bake-grudge6-races.mjs
 */
import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONVERT = join(ROOT, "tools/grudge-convert/bin/grudge-convert.mjs");
const RAW = join(ROOT, "raw/grudge6");
const DIST = join(ROOT, "dist/prod/grudge6");
const CDN = "https://assets.grudge-studio.com";

const RACES = [
  {
    id: "WK",
    fbx: "models/grudge6/races/WK_Characters.fbx",
    atlas: "textures/grudge6/western-kingdoms/WK_Standard_Units.webp",
  },
  {
    id: "BRB",
    fbx: "models/grudge6/races/BRB_Characters.fbx",
    atlas: "textures/grudge6/barbarians/BRB_StandardUnits_texture.webp",
  },
  {
    id: "ELF",
    fbx: "models/grudge6/races/ELF_Characters.fbx",
    atlas: "textures/grudge6/elves/ELF_HighElves_Texture.webp",
  },
  {
    id: "DWF",
    fbx: "models/grudge6/races/DWF_Characters.fbx",
    atlas: "textures/grudge6/dwarves/DWF_Standard_Units.webp",
  },
  {
    id: "ORC",
    fbx: "models/grudge6/races/ORC_Characters.fbx",
    atlas: "textures/grudge6/orcs/ORC_StandardUnits.webp",
  },
  {
    id: "UD",
    fbx: "models/grudge6/races/UD_Characters.fbx",
    atlas: "textures/grudge6/undead/UD_Standard_Units.webp",
  },
];

async function download(url, dest) {
  try {
    await fs.access(dest);
    const st = await fs.stat(dest);
    if (st.size > 1000) {
      console.log(`  skip download (exists) ${dest}`);
      return;
    }
  } catch {
    /* need download */
  }
  console.log(`  GET ${url}`);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.mkdir(dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  console.log(`  wrote ${dest} (${buf.length} bytes)`);
}

function runConvert(args) {
  const r = spawnSync(process.execPath, [CONVERT, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) {
    throw new Error(`convert failed (${r.status}): ${args.join(" ")}`);
  }
}

async function main() {
  await fs.mkdir(RAW, { recursive: true });
  await fs.mkdir(DIST, { recursive: true });
  const results = [];

  for (const race of RACES) {
    console.log(`\n═══ ${race.id} ═══`);
    const fbxLocal = join(RAW, `${race.id}_Characters.fbx`);
    const atlasLocal = join(RAW, `${race.id}_atlas.webp`);
    const rawGlb = join(RAW, `${race.id}_Characters.raw.glb`);
    const prodGlb = join(DIST, `${race.id}_Characters.glb`);

    await download(`${CDN}/${race.fbx}`, fbxLocal);
    await download(`${CDN}/${race.atlas}`, atlasLocal);

    // fbx2gltf: convert + atlas, no height yet (avoid double-fit); cm-to-m
    runConvert([
      "fbx2gltf",
      fbxLocal,
      "-o",
      rawGlb,
      "--cm-to-m",
      "--texture",
      atlasLocal,
      "--no-meshopt", // float meshes for accurate second bake
    ]);

    // glb2glb: body-only height 1.8, texture 1024, full mesh accuracy
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

    // inspect
    const insp = spawnSync(process.execPath, [CONVERT, "inspect", prodGlb], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    let info = {};
    try {
      info = JSON.parse(insp.stdout || "{}");
    } catch {
      info = { raw: insp.stdout };
    }
    const manPath = prodGlb.replace(/\.glb$/i, ".manifest.json");
    let manifest = {};
    try {
      manifest = JSON.parse(await fs.readFile(manPath, "utf8"));
    } catch {
      /* */
    }
    const row = {
      id: race.id,
      glb: prodGlb,
      meshes: info.meshes ?? manifest.stats?.meshes,
      skins: info.skins ?? manifest.stats?.skins,
      textures: info.textures ?? manifest.stats?.textures,
      materials: info.materials ?? manifest.stats?.materials,
      aabb: manifest.aabb,
      rootCollider: info.extras?.grudgeRootCollider || null,
    };
    results.push(row);
    console.log(
      `  ✓ ${race.id}: meshes=${row.meshes} skins=${row.skins} tex=${row.textures} aabbY=${row.aabb?.size?.[1]?.toFixed?.(3) ?? "?"}`,
    );
  }

  const summaryPath = join(DIST, "bake-summary.json");
  await fs.writeFile(
    summaryPath,
    JSON.stringify({ producedAt: new Date().toISOString(), races: results }, null, 2),
  );
  console.log(`\nSummary → ${summaryPath}`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
