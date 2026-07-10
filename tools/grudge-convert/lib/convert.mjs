/**
 * Format conversion backends → production GLB (or FBX when requested).
 *
 * Named pipelines:
 *   fbx2gltf / fbx2glb  → FBX2glTF → optimize
 *   glb2glb             → optimize only
 *   glb2gltf / gltf2glb → container flip (+ optional optimize)
 *   obj2glb / obj2fbx   → Blender
 *   blend/dae/stl/ply   → Blender → GLB → optimize
 */
import { promises as fs } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { detectBlender, detectFbx2gltf, runCmd } from "./detect.mjs";
import { optimizeGlb, glbToGltf, gltfToGlb } from "./optimize.mjs";

const BLENDER_TO_GLB = `
import bpy, sys, os
argv = sys.argv[sys.argv.index('--') + 1:]
in_path, out_path = argv[0], argv[1]
ext = os.path.splitext(in_path)[1].lower()
scale = float(argv[2]) if len(argv) > 2 else 1.0
bake_anims = (argv[3] if len(argv) > 3 else '1') == '1'

bpy.ops.wm.read_factory_settings(use_empty=True)
if ext == '.blend':
    bpy.ops.wm.open_mainfile(filepath=in_path)
elif ext == '.fbx':
    bpy.ops.import_scene.fbx(filepath=in_path, automatic_bone_orientation=True)
elif ext in ('.obj',):
    bpy.ops.wm.obj_import(filepath=in_path)
elif ext in ('.dae',):
    bpy.ops.wm.collada_import(filepath=in_path)
elif ext in ('.ply',):
    bpy.ops.wm.ply_import(filepath=in_path)
elif ext in ('.stl',):
    bpy.ops.wm.stl_import(filepath=in_path)
elif ext in ('.glb', '.gltf'):
    bpy.ops.import_scene.gltf(filepath=in_path)
else:
    raise SystemExit('Unsupported input ext: ' + ext)

if abs(scale - 1.0) > 1e-8:
    for obj in bpy.context.scene.objects:
        obj.scale = (obj.scale[0] * scale, obj.scale[1] * scale, obj.scale[2] * scale)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',
    export_apply=True,
    export_animations=bake_anims,
    export_skins=True,
    export_morph=True,
    export_nla_strips=True,
    export_force_sampling=bake_anims,
    export_frame_range=bake_anims,
    export_def_bones=False,
)
`.trim();

const BLENDER_TO_FBX = `
import bpy, sys, os
argv = sys.argv[sys.argv.index('--') + 1:]
in_path, out_path = argv[0], argv[1]
ext = os.path.splitext(in_path)[1].lower()
scale = float(argv[2]) if len(argv) > 2 else 1.0
bake_anims = (argv[3] if len(argv) > 3 else '1') == '1'

bpy.ops.wm.read_factory_settings(use_empty=True)
if ext == '.blend':
    bpy.ops.wm.open_mainfile(filepath=in_path)
elif ext == '.fbx':
    bpy.ops.import_scene.fbx(filepath=in_path, automatic_bone_orientation=True)
elif ext in ('.obj',):
    bpy.ops.wm.obj_import(filepath=in_path)
elif ext in ('.dae',):
    bpy.ops.wm.collada_import(filepath=in_path)
elif ext in ('.ply',):
    bpy.ops.wm.ply_import(filepath=in_path)
elif ext in ('.stl',):
    bpy.ops.wm.stl_import(filepath=in_path)
elif ext in ('.glb', '.gltf'):
    bpy.ops.import_scene.gltf(filepath=in_path)
else:
    raise SystemExit('Unsupported input ext: ' + ext)

if abs(scale - 1.0) > 1e-8:
    for obj in bpy.context.scene.objects:
        obj.scale = (obj.scale[0] * scale, obj.scale[1] * scale, obj.scale[2] * scale)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

bpy.ops.export_scene.fbx(
    filepath=out_path,
    use_selection=False,
    apply_scale_options='FBX_SCALE_ALL',
    bake_space_transform=True,
    object_types={'ARMATURE', 'MESH', 'EMPTY', 'OTHER'},
    use_mesh_modifiers=True,
    add_leaf_bones=False,
    bake_anim=bake_anims,
    bake_anim_use_all_actions=True,
    bake_anim_force_startend_keying=True,
    path_mode='COPY',
    embed_textures=True,
)
`.trim();

async function runBlenderScript(scriptBody, inputPath, outPath, { scale = 1, bakeAnims = true } = {}) {
  const blender = detectBlender();
  if (!blender.available) {
    return { ok: false, error: blender.reason };
  }
  const scriptPath = join(tmpdir(), `grudge-convert-${randomUUID()}.py`);
  await fs.writeFile(scriptPath, scriptBody, "utf8");
  const r = runCmd(
    blender.path,
    ["-b", "--python", scriptPath, "--", inputPath, outPath, String(scale), bakeAnims ? "1" : "0"],
    { timeoutMs: 600_000 },
  );
  try {
    await fs.unlink(scriptPath);
  } catch {
    /* */
  }
  if (r.code !== 0 || !(await fs.stat(outPath).catch(() => null))) {
    return {
      ok: false,
      error: `Blender failed (exit ${r.code}): ${(r.stderr || r.stdout || r.error || "").slice(0, 600)}`,
    };
  }
  return { ok: true, path: outPath, backend: "blender" };
}

async function blenderToGlb(inputPath, outGlb, opts = {}) {
  return runBlenderScript(BLENDER_TO_GLB, inputPath, outGlb, opts);
}

async function blenderToFbx(inputPath, outFbx, opts = {}) {
  return runBlenderScript(BLENDER_TO_FBX, inputPath, outFbx, opts);
}

async function fbx2gltfToGlb(inputPath, outBase, { bakeAnims = true } = {}) {
  const tool = detectFbx2gltf();
  if (!tool.available) return { ok: false, error: tool.reason };
  const args = ["-i", inputPath, "-o", outBase, "-b", "--pbr-metallic-roughness"];
  if (bakeAnims) args.push("--anim-framerate", "bake30");
  const r = runCmd(tool.path, args, { timeoutMs: 600_000 });
  const outGlb = `${outBase}.glb`;
  if (r.code !== 0 || !(await fs.stat(outGlb).catch(() => null))) {
    return {
      ok: false,
      error: `FBX2glTF failed (exit ${r.code}): ${(r.stderr || r.stdout || r.error || "").slice(0, 500)}`,
    };
  }
  return { ok: true, path: outGlb, backend: "fbx2gltf" };
}

/**
 * Convert any supported source → intermediate GLB (before optimize).
 * @returns {Promise<{ok:boolean, path?:string, backend?:string, error?:string, warnings:string[]}>}
 */
export async function convertToGlb(inputPath, workDir, opts = {}) {
  const warnings = [];
  const ext = extname(inputPath).toLowerCase();
  await fs.mkdir(workDir, { recursive: true });
  const stem = basename(inputPath, ext);
  const outGlb = join(workDir, `${stem}.raw.glb`);
  const outBase = join(workDir, `${stem}.raw`);

  if (ext === ".glb") {
    await fs.copyFile(inputPath, outGlb);
    return { ok: true, path: outGlb, backend: "copy", warnings };
  }

  if (ext === ".gltf") {
    try {
      const out = await gltfToGlb(inputPath, outGlb);
      return { ok: true, path: out, backend: "gltf-transform", warnings };
    } catch (e) {
      return { ok: false, error: String(e.message || e), warnings };
    }
  }

  if (ext === ".fbx") {
    const a = await fbx2gltfToGlb(inputPath, outBase, opts);
    if (a.ok) return { ...a, warnings };
    warnings.push(a.error);
    const b = await blenderToGlb(inputPath, outGlb, opts);
    if (b.ok) return { ...b, warnings };
    return { ok: false, error: b.error, warnings };
  }

  if ([".obj", ".dae", ".stl", ".ply", ".blend"].includes(ext)) {
    const b = await blenderToGlb(inputPath, outGlb, opts);
    if (b.ok) return { ...b, warnings };
    return { ok: false, error: b.error, warnings };
  }

  return {
    ok: false,
    error: `Unsupported input extension: ${ext}. Supported: .fbx .obj .glb .gltf .blend .dae .stl .ply`,
    warnings,
  };
}

/**
 * Export to FBX via Blender (obj2fbx, glb2fbx, etc.).
 */
export async function convertToFbx(inputPath, outputPath, opts = {}) {
  const workDir = opts.workDir || join(tmpdir(), `grudge-convert-${randomUUID()}`);
  await fs.mkdir(workDir, { recursive: true });
  await fs.mkdir(dirname(outputPath), { recursive: true });
  const outFbx = outputPath.endsWith(".fbx") ? outputPath : `${outputPath}.fbx`;

  const r = await blenderToFbx(inputPath, outFbx, {
    scale: opts.preScale || opts.uniformScale || 1,
    bakeAnims: opts.bakeAnims !== false,
  });
  if (!r.ok) {
    return { ok: false, errors: [r.error], warnings: [], outputPath: null };
  }

  const manifest = {
    version: 1,
    generator: "@grudge-studio/asset-convert@1.0.0",
    pipeline: "to-fbx",
    source: inputPath,
    output: outFbx,
    intermediateBackend: "blender",
    producedAt: new Date().toISOString(),
  };
  const manPath = outFbx.replace(/\.fbx$/i, ".manifest.json");
  await fs.writeFile(manPath, JSON.stringify(manifest, null, 2));

  return {
    ok: true,
    errors: [],
    warnings: [],
    outputPath: outFbx,
    colliderPath: null,
    manifestPath: manPath,
    manifest,
    steps: [r],
  };
}

/**
 * Full production pipeline: convert → optimize → colliders → manifest.
 */
export async function convertProduction(inputPath, outputPath, opts = {}) {
  // FBX output short-circuit
  const wantFbx =
    opts.format === "fbx" ||
    (typeof outputPath === "string" && outputPath.toLowerCase().endsWith(".fbx"));
  if (wantFbx) {
    return convertToFbx(inputPath, outputPath, opts);
  }

  const workDir = opts.workDir || join(tmpdir(), `grudge-convert-${randomUUID()}`);
  await fs.mkdir(workDir, { recursive: true });

  const step1 = await convertToGlb(inputPath, workDir, {
    scale: opts.preScale || 1,
    bakeAnims: opts.bakeAnims !== false,
  });
  if (!step1.ok) {
    return { ok: false, errors: [step1.error], warnings: step1.warnings || [], steps: [step1] };
  }

  let finalOut = outputPath;
  if (!finalOut.endsWith(".glb") && !finalOut.endsWith(".gltf")) {
    finalOut = opts.format === "gltf" ? `${outputPath}.gltf` : `${outputPath}.glb`;
  }

  await fs.mkdir(dirname(finalOut), { recursive: true });

  const opt = await optimizeGlb(step1.path, finalOut, {
    targetHeight: opts.targetHeight ?? 0,
    uniformScale: opts.uniformScale ?? 0,
    cmToMeters: opts.cmToMeters ?? false,
    yHipGround: opts.yHipGround !== false,
    textureSize: opts.textureSize ?? 1024,
    textureFormat: opts.textureFormat ?? "webp",
    meshopt: opts.meshopt !== false,
    draco: !!opts.draco,
    simplify: opts.simplify ?? 0,
    bakeAnims: opts.bakeAnims !== false,
    bakeMeshes: opts.bakeMeshes !== false,
    bakeColliders: opts.bakeColliders !== false,
    colliderCompanion: opts.colliderCompanion !== false,
    rebindTexture: opts.rebindTexture || null,
    format: finalOut.endsWith(".gltf") ? "gltf" : "glb",
  });

  const manifest = {
    version: 1,
    generator: "@grudge-studio/asset-convert@1.0.0",
    source: inputPath,
    output: finalOut,
    intermediateBackend: step1.backend,
    warnings: step1.warnings || [],
    stats: opt.stats,
    aabb: opt.aabb,
    collider: opt.companion,
    producedAt: new Date().toISOString(),
    production: {
      format: finalOut.endsWith(".gltf") ? "gltf" : "glb",
      yHipGround: opts.yHipGround !== false,
      textures: opts.textureFormat ?? "webp",
      maxTexture: opts.textureSize ?? 1024,
      meshCompression: opts.draco ? "draco" : opts.meshopt !== false ? "quantize" : "none",
      bakeMeshes: opts.bakeMeshes !== false,
      bakeAnims: opts.bakeAnims !== false,
      bakeColliders: opts.bakeColliders !== false,
    },
  };

  const manPath = finalOut.replace(/\.glb$/i, ".manifest.json").replace(/\.gltf$/i, ".manifest.json");
  await fs.writeFile(manPath, JSON.stringify(manifest, null, 2));

  return {
    ok: true,
    errors: [],
    warnings: step1.warnings || [],
    outputPath: finalOut,
    colliderPath: opt.companion,
    manifestPath: manPath,
    manifest,
    steps: [step1, { backend: "gltf-transform-optimize", path: finalOut }],
  };
}

/** Named conversion shorthands used by CLI. */
export const NAMED_PIPELINES = {
  fbx2gltf: { in: [".fbx"], out: "glb", desc: "FBX → production GLB (FBX2glTF + optimize)" },
  fbx2glb: { in: [".fbx"], out: "glb", desc: "Alias of fbx2gltf" },
  glb2glb: { in: [".glb"], out: "glb", desc: "Re-bake GLB (scale, textures, anims, colliders)" },
  glb2gltf: { in: [".glb"], out: "gltf", desc: "GLB → glTF JSON (+ optional optimize)" },
  gltf2glb: { in: [".gltf"], out: "glb", desc: "glTF → GLB (+ optional optimize)" },
  obj2glb: { in: [".obj"], out: "glb", desc: "OBJ → production GLB via Blender" },
  obj2fbx: { in: [".obj"], out: "fbx", desc: "OBJ → FBX via Blender" },
  glb2fbx: { in: [".glb", ".gltf"], out: "fbx", desc: "GLB/glTF → FBX via Blender" },
  blend2glb: { in: [".blend"], out: "glb", desc: "Blender scene → production GLB" },
};

export { glbToGltf, gltfToGlb, optimizeGlb, blenderToGlb, blenderToFbx, fbx2gltfToGlb };
