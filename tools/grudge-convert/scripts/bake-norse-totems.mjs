/**
 * Bake XList totem poles: Z-up author → Y-up SI, feet on ground, compressed.
 * Totem is a ground spike — height slightly above a 1.8 m human, rising by tier.
 *
 * Usage (from tools/grudge-convert):
 *   node scripts/bake-norse-totems.mjs play   # Tyr/Loki/Freya 1.2 m → GrudgeBuilder public
 *   node bin/grudge-convert.mjs ship <play-dir>/tyr_tier_2.glb --key models/vfx/totems/tyr_tier_2.glb
 *   node scripts/bake-norse-totems.mjs slam   # juggernaut break, 5 m footprint
 *   node scripts/bake-norse-totems.mjs tiers  # Open 8-tier ladder
 *   node scripts/bake-norse-totems.mjs all
 */
import { mkdirSync, copyFileSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { optimizeGlb } from "../lib/optimize.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = "C:/Users/nugye/Documents";
const OUT_DIR = "C:/Users/nugye/Documents/totem-prod";
const OPEN_DIR = "C:/Users/nugye/Documents/gameopen/artifacts/animator/public/models/vfx/totems";
/** Warlords T0 mage/priest caster totems — 1.2 m SI, not the Open tier ladder. */
const PLAY_DIR = "F:/GitHub/GrudgeBuilder/client/public/models/vfx/totems";
const PLAY_HEIGHT_M = 1.2;
const SLAM_SRC = "D:/Games/Models/juggernaut_being_slammed_into_the_ground (1).glb";
const SLAM_DIR = "F:/GitHub/GrudgeBuilder/client/public/models/vfx/impacts";
const SLAM_FOOTPRINT_M = 5;

const JOBS = [
  { src: "xlist_totem_nordin_tier_0.glb", out: "totem_nordin_t0.glb", heightM: 2.15 },
  { src: "xlist_totem_nordin_tier_1.glb", out: "totem_nordin_t1.glb", heightM: 2.3 },
  { src: "xlist_totem_tyr_tier_2.glb", out: "totem_tyr_t2.glb", heightM: 2.5 },
  { src: "xlist_totem_freya_tier_3.glb", out: "totem_freya_t3.glb", heightM: 2.7 },
  { src: "xlist_totem_loki_tier_4.glb", out: "totem_loki_t4.glb", heightM: 2.9 },
  { src: "xlist_totem_thor_tier_5.glb", out: "totem_thor_t5.glb", heightM: 3.15 },
  { src: "xlist_totem_odin_tier_6.glb", out: "totem_odin_t6.glb", heightM: 3.4 },
  { src: "xlist_valhalla_totem_pole_tier_7.glb", out: "totem_valhalla_t7.glb", heightM: 3.85 },
];

const PLAY_JOBS = [
  { src: "xlist_totem_tyr_tier_2.glb", out: "tyr_tier_2.glb", heightM: PLAY_HEIGHT_M },
  { src: "xlist_totem_loki_tier_4.glb", out: "loki_tier_4.glb", heightM: PLAY_HEIGHT_M },
  { src: "xlist_totem_freya_tier_3.glb", out: "freya_tier_3.glb", heightM: PLAY_HEIGHT_M },
];

function aabbPositions(document) {
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  const el = [0, 0, 0];
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      if (!pos) continue;
      for (let i = 0; i < pos.getCount(); i++) {
        pos.getElement(i, el);
        min[0] = Math.min(min[0], el[0]);
        min[1] = Math.min(min[1], el[1]);
        min[2] = Math.min(min[2], el[2]);
        max[0] = Math.max(max[0], el[0]);
        max[1] = Math.max(max[1], el[1]);
        max[2] = Math.max(max[2], el[2]);
      }
    }
  }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

function mapVec3(document, attrNames, fn) {
  const seen = new Set();
  const el = [0, 0, 0];
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      for (const name of attrNames) {
        const acc = prim.getAttribute(name);
        if (!acc || seen.has(acc)) continue;
        seen.add(acc);
        for (let i = 0; i < acc.getCount(); i++) {
          acc.getElement(i, el);
          fn(el);
          acc.setElement(i, el);
        }
      }
    }
  }
}

/** Author poles: longest axis +Z. Rotate −90° around X so +Z becomes +Y. */
function rotateZUpToYUp(el) {
  const y = el[1];
  const z = el[2];
  el[1] = z;
  el[2] = -y;
}

function bakeScale(document, s) {
  mapVec3(document, ["POSITION"], (el) => {
    el[0] *= s;
    el[1] *= s;
    el[2] *= s;
  });
  for (const node of document.getRoot().listNodes()) {
    const t = node.getTranslation();
    node.setTranslation([t[0] * s, t[1] * s, t[2] * s]);
  }
}

function bakeGroundY(document) {
  const box = aabbPositions(document);
  const dy = -box.min[1];
  mapVec3(document, ["POSITION"], (el) => {
    el[1] += dy;
  });
  for (const node of document.getRoot().listNodes()) {
    const t = node.getTranslation();
    node.setTranslation([t[0], t[1] + dy, t[2]]);
  }
}

async function orientAndFit(inputPath, tempPath, heightM) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(inputPath);
  mapVec3(document, ["POSITION", "NORMAL"], rotateZUpToYUp);
  const afterRot = aabbPositions(document);
  const h = Math.max(afterRot.size[1], 1e-4);
  bakeScale(document, heightM / h);
  bakeGroundY(document);
  const final = aabbPositions(document);
  await io.write(tempPath, document);
  return { afterRot, final };
}

const TIER_OPT = {
  targetHeight: 0,
  yHipGround: false,
  textureSize: 512,
  textureFormat: "webp",
  simplify: 0.4,
  bakeAnims: true,
  bakeMeshes: true,
  bakeColliders: true,
  meshopt: true,
};

/** Play totems: 1.2 m pole, 256 WebP, meshopt — web payload not DCC dump. */
const PLAY_OPT = {
  targetHeight: 0,
  yHipGround: false,
  textureSize: 256,
  textureFormat: "webp",
  simplify: 0.35,
  bakeAnims: true,
  bakeMeshes: true,
  bakeColliders: true,
  meshopt: true,
};

async function bakeJob(job, destDir, copyDir, opt = TIER_OPT) {
  const src = join(SRC_DIR, job.src);
  const tmp = join(destDir, "_orient_" + job.out);
  const dest = join(destDir, job.out);
  mkdirSync(destDir, { recursive: true });
  console.log("orient", job.src, "→", job.heightM, "m Y-up", "tex", opt.textureSize);
  const stats = await orientAndFit(src, tmp, job.heightM);
  await optimizeGlb(tmp, dest, opt);
  if (copyDir) {
    mkdirSync(copyDir, { recursive: true });
    copyFileSync(dest, join(copyDir, job.out));
  }
  try {
    unlinkSync(tmp);
  } catch {
    /* oriented dump is only a bake temp */
  }
  console.log(
    "  baked Y",
    stats.final.size[1].toFixed(3),
    "m  footprint",
    stats.final.size[0].toFixed(2),
    "×",
    stats.final.size[2].toFixed(2),
    "→",
    dest,
  );
}

function bakeScaleXzFootprint(document, footprintM) {
  const box = aabbPositions(document);
  const span = Math.max(box.size[0], box.size[2], 1e-4);
  bakeScale(document, footprintM / span);
}

async function bakeSlam() {
  mkdirSync(SLAM_DIR, { recursive: true });
  const tmp = join(SLAM_DIR, "_orient_ground_slam_break.glb");
  const dest = join(SLAM_DIR, "ground_slam_break.glb");
  console.log("slam footprint", SLAM_FOOTPRINT_M, "m  src", SLAM_SRC);
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(SLAM_SRC);
  bakeScaleXzFootprint(document, SLAM_FOOTPRINT_M);
  bakeGroundY(document);
  const final = aabbPositions(document);
  await io.write(tmp, document);
  await optimizeGlb(tmp, dest, {
    targetHeight: 0,
    yHipGround: false,
    textureSize: 512,
    textureFormat: "webp",
    simplify: 0.5,
    bakeAnims: true,
    bakeMeshes: true,
    bakeColliders: false,
    meshopt: true,
  });
  try {
    unlinkSync(tmp);
  } catch {
    /* temp */
  }
  console.log(
    "  slam Y",
    final.size[1].toFixed(3),
    "m  footprint",
    final.size[0].toFixed(2),
    "×",
    final.size[2].toFixed(2),
    "→",
    dest,
  );
}

async function main() {
  const mode = String(process.argv[2] || "play").toLowerCase();
  if (mode === "tiers" || mode === "all") {
    mkdirSync(OUT_DIR, { recursive: true });
    mkdirSync(OPEN_DIR, { recursive: true });
    for (const job of JOBS) {
      await bakeJob(job, OUT_DIR, OPEN_DIR);
    }
  }
  if (mode === "play" || mode === "all") {
    mkdirSync(PLAY_DIR, { recursive: true });
    for (const job of PLAY_JOBS) {
      await bakeJob(job, PLAY_DIR, null, PLAY_OPT);
    }
  }
  if (mode === "slam" || mode === "all") {
    await bakeSlam();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
