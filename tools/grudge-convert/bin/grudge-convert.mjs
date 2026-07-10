#!/usr/bin/env node
/**
 * grudge-convert — production asset converter CLI
 *
 * Usage:
 *   grudge-convert <input> -o <output.glb> [options]
 *   grudge-convert fbx2gltf <in.fbx> -o <out.glb> [options]
 *   grudge-convert glb2glb  <in.glb> -o <out.glb> [options]
 *   grudge-convert glb2gltf <in.glb> -o <out.gltf>
 *   grudge-convert obj2fbx  <in.obj> -o <out.fbx>
 *   grudge-convert batch <dir> -o <outDir> [options]
 *   grudge-convert inspect <input.glb>
 *   grudge-convert doctor
 *
 * Formats in:  .fbx .obj .glb .gltf .blend .dae .stl .ply
 * Formats out: .glb .gltf .fbx (+ .collider.json + .manifest.json)
 */
import { promises as fs } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import {
  convertProduction,
  glbToGltf,
  gltfToGlb,
  NAMED_PIPELINES,
} from "../lib/convert.mjs";
import { detectTooling } from "../lib/detect.mjs";

const NAMED = new Set(Object.keys(NAMED_PIPELINES));

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  if (name.startsWith("--") && (i + 1 >= process.argv.length || process.argv[i + 1].startsWith("-"))) {
    return true;
  }
  return process.argv[i + 1] ?? fallback;
}

function has(flag) {
  return process.argv.includes(flag);
}

function printHelp() {
  const namedList = Object.entries(NAMED_PIPELINES)
    .map(([k, v]) => `  ${k.padEnd(12)} ${v.desc}`)
    .join("\n");

  console.log(`
@grudge-studio/asset-convert — production converter

USAGE
  grudge-convert <input> -o <output> [options]
  grudge-convert <pipeline> <input> -o <output> [options]
  grudge-convert batch <inputDir> -o <outputDir> [options]
  grudge-convert inspect <file.glb|gltf>
  grudge-convert doctor

NAMED PIPELINES
${namedList}

CONVERSIONS (auto from extensions)
  fbx→glb   FBX2glTF (preferred) → Blender fallback → glTF-Transform optimize
  obj→glb   Blender → optimize
  obj→fbx   Blender export FBX
  glb→glb   mesh/texture/anim/collider bake
  glb→gltf  container flip (+ optional full bake if scale/texture flags set)
  gltf→glb  container flip
  blend/dae/stl/ply → glb via Blender

OPTIONS
  -o, --out <path>         Output file or directory (batch)
  --height <m>             Normalize bbox height (e.g. 1.7 for heroes)
  --scale <n>              Explicit uniform scale (baked into meshes)
  --cm-to-m                Scale ×0.01 before other transforms (FBX cm)
  --no-y-hip               Do not ground bbox.min.y = 0
  --texture <image>        Rebind all materials to this atlas (webp/png/jpg)
  --texture-size <px>      Max texture edge (default 1024)
  --texture-format <fmt>   webp|png|jpeg|none (default webp)
  --simplify <0-1>         Triangle keep ratio (e.g. 0.5 for LOD)
  --no-meshopt             Skip quantize compression pass
  --no-mesh-bake           Skip flatten/join mesh bake (static props)
  --draco                  Enable Draco (optional dependency)
  --no-anims               Skip animation resampling / bake flags
  --no-colliders           Skip collider extras + .collider.json
  --format glb|gltf|fbx    Output container (default glb)
  --work-dir <path>        Intermediate files directory

OUTPUTS (production pack)
  <name>.glb               Optimized binary glTF
  <name>.collider.json     Capsule/box colliders for game loaders
  <name>.manifest.json     Provenance + stats + pipeline options

See tools/grudge-convert/README.md
`.trim());
}

async function cmdDoctor() {
  const t = detectTooling();
  console.log("grudge-convert doctor\n");
  console.log(`  node:        ${t.node.version}`);
  console.log(`  fbx2gltf:    ${t.fbx2gltf.available ? t.fbx2gltf.path : "MISSING — " + t.fbx2gltf.reason}`);
  console.log(`  blender:     ${t.blender.available ? t.blender.path : "MISSING — " + t.blender.reason}`);
  console.log(`  gltf-transform: bundled @gltf-transform/*`);
  console.log(`  sharp:       texture encode (webp/png/jpeg)`);
  console.log(`  package:     ${t.packageDir}`);
  console.log("\nEnv overrides: FBX2GLTF_PATH, BLENDER_PATH, GRUDGE_FBX2GLTF, GRUDGE_BLENDER");
  console.log("\nNamed pipelines: " + Object.keys(NAMED_PIPELINES).join(", "));
  if (!t.fbx2gltf.available && !t.blender.available) {
    console.log("\n⚠ No FBX/OBJ converter backend. Install: npm i fbx2gltf  and/or Blender.");
    process.exitCode = 2;
  } else if (!t.fbx2gltf.available) {
    console.log("\n⚠ FBX2glTF missing — FBX will use Blender only (slower). npm i fbx2gltf");
  } else if (!t.blender.available) {
    console.log("\n⚠ Blender missing — OBJ/BLEND/obj2fbx unavailable. Set BLENDER_PATH.");
  } else {
    console.log("\n✓ Backends ready for production convert.");
  }
}

async function cmdInspect(file) {
  const { NodeIO } = await import("@gltf-transform/core");
  const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(file);
  const root = doc.getRoot();
  console.log(
    JSON.stringify(
      {
        file,
        generator: root.getAsset().generator,
        meshes: root.listMeshes().length,
        materials: root.listMaterials().length,
        textures: root.listTextures().length,
        skins: root.listSkins().length,
        animations: root.listAnimations().map((a) => a.getName()),
        nodes: root.listNodes().length,
        scenes: root.listScenes().length,
        extras: root.listScenes()[0]?.getExtras() || null,
      },
      null,
      2,
    ),
  );
}

function parseOpts(formatOverride = null) {
  const texFmt = arg("--texture-format", "webp");
  return {
    targetHeight: Number(arg("--height", 0)) || 0,
    uniformScale: Number(arg("--scale", 0)) || 0,
    cmToMeters: has("--cm-to-m"),
    yHipGround: !has("--no-y-hip"),
    rebindTexture: arg("--texture", null),
    textureSize: Number(arg("--texture-size", 1024)) || 1024,
    textureFormat: texFmt === "none" ? false : texFmt,
    simplify: Number(arg("--simplify", 0)) || 0,
    meshopt: !has("--no-meshopt"),
    bakeMeshes: !has("--no-mesh-bake"),
    draco: has("--draco"),
    bakeAnims: !has("--no-anims"),
    bakeColliders: !has("--no-colliders"),
    format: formatOverride || arg("--format", "glb"),
    workDir: arg("--work-dir", null),
  };
}

async function convertOne(input, output, opts) {
  console.log(`→ ${input}`);
  const r = await convertProduction(resolve(input), resolve(output), opts);
  if (!r.ok) {
    console.error("✗", (r.errors || []).join("; "));
    for (const w of r.warnings || []) console.warn("  warn:", w);
    return false;
  }
  console.log(`  ✓ ${r.outputPath}`);
  if (r.colliderPath) console.log(`  ✓ ${r.colliderPath}`);
  if (r.manifestPath) console.log(`  ✓ ${r.manifestPath}`);
  if (r.manifest?.stats) {
    const s = r.manifest.stats;
    console.log(
      `  meshes=${s.meshes} mats=${s.materials} tex=${s.textures} anims=${s.animations}${s.skins != null ? ` skins=${s.skins}` : ""}`,
    );
  }
  for (const w of r.warnings || []) console.warn("  warn:", w);
  return true;
}

function needsFullOptimize(opts) {
  return !!(
    opts.targetHeight ||
    opts.uniformScale ||
    opts.cmToMeters ||
    opts.rebindTexture ||
    has("--texture-size") ||
    has("--simplify") ||
    has("--draco") ||
    !opts.bakeColliders === false
  );
}

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || has("--help") || has("-h")) {
    printHelp();
    return;
  }

  if (argv[0] === "doctor") {
    await cmdDoctor();
    return;
  }

  if (argv[0] === "inspect") {
    const f = argv[1];
    if (!f) {
      console.error("inspect requires a file");
      process.exit(1);
    }
    await cmdInspect(resolve(f));
    return;
  }

  // Named pipeline: grudge-convert fbx2gltf in.fbx -o out.glb
  let pipeline = null;
  let argvRest = argv;
  if (NAMED.has(argv[0])) {
    pipeline = argv[0];
    argvRest = argv.slice(1);
  }

  const formatFromPipeline = pipeline ? NAMED_PIPELINES[pipeline].out : null;
  const opts = parseOpts(formatFromPipeline);
  const out = arg("-o", null) || arg("--out", null);

  if (argv[0] === "batch" || (pipeline === null && argvRest[0] === "batch")) {
    const dir = argv[0] === "batch" ? argv[1] : argvRest[1] || argvRest[0];
    // normalize: batch is first token
    const batchDir = argv.includes("batch") ? argv[argv.indexOf("batch") + 1] : null;
    const inputDir = batchDir;
    if (!inputDir || !out) {
      console.error("batch requires <inputDir> -o <outputDir>");
      process.exit(1);
    }
    const exts = new Set([".fbx", ".obj", ".glb", ".gltf", ".blend", ".dae", ".stl", ".ply"]);
    const entries = await fs.readdir(inputDir);
    const files = entries.filter((f) => exts.has(extname(f).toLowerCase()));
    await fs.mkdir(out, { recursive: true });
    let ok = 0,
      fail = 0;
    const outExt = opts.format === "gltf" ? "gltf" : opts.format === "fbx" ? "fbx" : "glb";
    for (const f of files) {
      const input = join(inputDir, f);
      const stem = basename(f, extname(f));
      const output = join(out, `${stem}.${outExt}`);
      const good = await convertOne(input, output, opts);
      if (good) ok++;
      else fail++;
    }
    console.log(`\nbatch done: ${ok} ok, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
    return;
  }

  // Collect positional input (skip flags and their values)
  const skipValues = new Set();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("-") && argv[i + 1] && !argv[i + 1].startsWith("-")) {
      skipValues.add(i + 1);
    }
  }
  const reserved = new Set(["batch", "inspect", "doctor", ...NAMED]);
  const inputs = argv.filter((a, i) => {
    if (a.startsWith("-")) return false;
    if (reserved.has(a)) return false;
    if (skipValues.has(i)) return false;
    return true;
  });

  const inFile = inputs[0];
  if (!inFile || !out) {
    console.error("Usage: grudge-convert [pipeline] <input> -o <output> [options]");
    console.error("       grudge-convert doctor | inspect <file> | --help");
    process.exit(1);
  }

  // Validate named pipeline vs extension
  if (pipeline) {
    const allowed = NAMED_PIPELINES[pipeline].in;
    const inExt = extname(inFile).toLowerCase();
    if (!allowed.includes(inExt)) {
      console.error(`Pipeline ${pipeline} expects ${allowed.join("|")}, got ${inExt}`);
      process.exit(1);
    }
    // Force output extension for named pipeline if user omitted it
    if (!extname(out) || ![".glb", ".gltf", ".fbx"].includes(extname(out).toLowerCase())) {
      // keep out as-is; convertProduction adds extension
    }
  }

  const inExt = extname(inFile).toLowerCase();
  const outExt = extname(out).toLowerCase();

  // Fast path: pure container flips without full optimize
  const pureFlip =
    !opts.targetHeight &&
    !opts.uniformScale &&
    !opts.cmToMeters &&
    !opts.rebindTexture &&
    !has("--simplify") &&
    !has("--draco") &&
    has("--no-colliders") &&
    has("--no-mesh-bake");

  if (inExt === ".glb" && outExt === ".gltf" && pureFlip) {
    const p = await glbToGltf(resolve(inFile), resolve(out));
    console.log("✓", p);
    return;
  }
  if (inExt === ".gltf" && outExt === ".glb" && pureFlip) {
    const p = await gltfToGlb(resolve(inFile), resolve(out));
    console.log("✓", p);
    return;
  }

  // glb2gltf named with no bake flags still does full production by default
  // (colliders + webp) unless user asks pure flip via --no-colliders --texture-format none
  if (pipeline === "glb2gltf" && !opts.targetHeight && !opts.rebindTexture && has("--texture-format") && arg("--texture-format") === "none" && has("--no-colliders")) {
    const p = await glbToGltf(resolve(inFile), resolve(out));
    console.log("✓", p);
    return;
  }

  const good = await convertOne(inFile, out, opts);
  process.exitCode = good ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
