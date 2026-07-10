/**
 * Production glTF optimize + scale + texture + animation + mesh bake via glTF-Transform.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  metalRough,
  prune,
  quantize,
  resample,
  simplify,
  textureCompress,
  weld,
  flatten,
  join as joinMeshes,
} from "@gltf-transform/functions";
import sharp from "sharp";
import { readFileSync, existsSync } from "node:fs";
import { bakeColliders, writeColliderCompanion } from "./collider.mjs";

/**
 * @typedef {object} OptimizeOptions
 * @property {number} [targetHeight]
 * @property {number} [uniformScale]
 * @property {boolean} [cmToMeters]
 * @property {boolean} [yHipGround]
 * @property {number} [textureSize]
 * @property {'webp'|'png'|'jpeg'|false} [textureFormat]
 * @property {boolean} [meshopt]
 * @property {boolean} [draco]
 * @property {number} [simplify]
 * @property {boolean} [bakeAnims]
 * @property {boolean} [bakeMeshes]  Flatten/join/weld production mesh bake
 * @property {boolean} [bakeColliders]
 * @property {boolean} [colliderCompanion]
 * @property {string} [rebindTexture]
 * @property {'glb'|'gltf'} [format]
 */

function createIO() {
  return new NodeIO().registerExtensions(ALL_EXTENSIONS);
}

/**
 * Compute AABB from POSITION accessors.
 * Prefer accessor min/max (float-space bounds) so quantized meshes
 * still report real-world extents for colliders / height normalize.
 */
function meshAabb(document) {
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  let has = false;

  const expandFromAccessor = (pos) => {
    // getMin/getMax are dequantized float bounds when quantization is present
    let amin = pos.getMin([]);
    let amax = pos.getMax([]);
    if (
      amin &&
      amax &&
      amin.length >= 3 &&
      amax.length >= 3 &&
      Number.isFinite(amin[0]) &&
      Number.isFinite(amax[0])
    ) {
      has = true;
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], amin[i]);
        max[i] = Math.max(max[i], amax[i]);
      }
      return;
    }
    // Fallback: walk elements (handles non-quantized + missing min/max)
    const count = pos.getCount();
    if (!count) return;
    has = true;
    const el = [0, 0, 0];
    for (let i = 0; i < count; i++) {
      pos.getElement(i, el);
      min[0] = Math.min(min[0], el[0]);
      min[1] = Math.min(min[1], el[1]);
      min[2] = Math.min(min[2], el[2]);
      max[0] = Math.max(max[0], el[0]);
      max[1] = Math.max(max[1], el[1]);
      max[2] = Math.max(max[2], el[2]);
    }
  };

  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      if (!pos) continue;
      expandFromAccessor(pos);
    }
  }
  if (!has) return null;
  return {
    min,
    max,
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
  };
}

/**
 * Scale all POSITION accessors + node translations by s (true mesh bake).
 */
function bakeScaleIntoMeshes(document, s) {
  if (!s || s === 1) return;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      if (!pos) continue;
      const arr = pos.getArray();
      if (!arr) continue;
      for (let i = 0; i < arr.length; i++) arr[i] *= s;
      pos.setArray(arr);
      // Scale morph targets if present
      for (const target of prim.listTargets()) {
        const tpos = target.getAttribute("POSITION");
        if (!tpos) continue;
        const tarr = tpos.getArray();
        if (!tarr) continue;
        for (let i = 0; i < tarr.length; i++) tarr[i] *= s;
        tpos.setArray(tarr);
      }
    }
  }
  for (const node of document.getRoot().listNodes()) {
    const t = node.getTranslation();
    node.setTranslation([t[0] * s, t[1] * s, t[2] * s]);
  }
  // Scale translation tracks in animations so baked scale stays consistent
  for (const anim of document.getRoot().listAnimations()) {
    for (const channel of anim.listChannels()) {
      if (channel.getTargetPath() !== "translation") continue;
      const sampler = channel.getSampler();
      if (!sampler) continue;
      const output = sampler.getOutput();
      if (!output) continue;
      const arr = output.getArray();
      if (!arr) continue;
      for (let i = 0; i < arr.length; i++) arr[i] *= s;
      output.setArray(arr);
    }
  }
}

function bakeYGround(document) {
  const aabb = meshAabb(document);
  if (!aabb) return;
  const dy = -aabb.min[1];
  if (Math.abs(dy) < 1e-6) return;
  const scenes = document.getRoot().listScenes();
  let applied = false;
  for (const scene of scenes) {
    const kids = scene.listChildren();
    if (kids.length === 1) {
      const t = kids[0].getTranslation();
      kids[0].setTranslation([t[0], t[1] + dy, t[2]]);
      applied = true;
    }
  }
  if (!applied) {
    for (const node of document.getRoot().listNodes()) {
      if (!node.getParentNode()) {
        const t = node.getTranslation();
        node.setTranslation([t[0], t[1] + dy, t[2]]);
      }
    }
  }
}

async function rebindBaseColorTexture(document, imagePath) {
  if (!imagePath || !existsSync(imagePath)) return false;
  const bytes = new Uint8Array(readFileSync(imagePath));
  const lower = imagePath.toLowerCase();
  const mime = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".webp")
      ? "image/webp"
      : lower.endsWith(".jpg") || lower.endsWith(".jpeg")
        ? "image/jpeg"
        : "image/png";

  const texture = document
    .createTexture(imagePath.split(/[/\\]/).pop() || "atlas")
    .setMimeType(mime)
    .setImage(bytes);

  for (const mat of document.getRoot().listMaterials()) {
    mat.setBaseColorTexture(texture);
    mat.setBaseColorFactor([1, 1, 1, 1]);
  }
  return true;
}

/**
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {OptimizeOptions} opts
 */
export async function optimizeGlb(inputPath, outputPath, opts = {}) {
  const {
    targetHeight = 0,
    uniformScale = 0,
    cmToMeters = false,
    yHipGround = true,
    textureSize = 1024,
    textureFormat = "webp",
    meshopt: useMeshopt = true,
    draco: useDraco = false,
    simplify: simplifyRatio = 0,
    bakeAnims = true,
    bakeMeshes = true,
    bakeColliders: doColliders = true,
    colliderCompanion = true,
    rebindTexture = null,
    format = "glb",
  } = opts;

  const io = createIO();
  const document = await io.read(inputPath);

  const pipelineExtras = {
    optimizedAt: new Date().toISOString(),
    options: {
      targetHeight,
      uniformScale,
      cmToMeters,
      yHipGround,
      textureSize,
      textureFormat,
      meshopt: useMeshopt,
      simplifyRatio,
      bakeAnims,
      bakeMeshes,
      bakeColliders: doColliders,
    },
  };

  // --- Scale bake ---
  let scale = uniformScale > 0 ? uniformScale : 1;
  if (cmToMeters) scale *= 0.01;

  if (targetHeight > 0) {
    if (cmToMeters || uniformScale) bakeScaleIntoMeshes(document, scale);
    scale = 1;
    const aabb = meshAabb(document);
    if (aabb && aabb.size[1] > 1e-4) {
      const s = targetHeight / aabb.size[1];
      bakeScaleIntoMeshes(document, s);
    }
  } else if (scale !== 1) {
    bakeScaleIntoMeshes(document, scale);
  }

  if (yHipGround) bakeYGround(document);

  if (rebindTexture) {
    await rebindBaseColorTexture(document, rebindTexture);
  }

  // Ensure PBR metal-rough workflow
  await document.transform(metalRough());

  // --- Mesh bake: flatten hierarchy + join where safe, then weld/dedup ---
  const transforms = [];
  if (bakeMeshes) {
    // flatten can break skinned characters — only join static-ish scenes
    const hasSkin = document.getRoot().listSkins().length > 0;
    if (!hasSkin) {
      try {
        transforms.push(flatten());
        transforms.push(joinMeshes());
      } catch {
        /* non-fatal */
      }
    }
  }
  transforms.push(dedup(), weld());

  if (bakeAnims) transforms.push(resample());

  if (simplifyRatio > 0 && simplifyRatio < 1) {
    // meshoptimizer is a peer for simplify
    try {
      const { MeshoptSimplifier } = await import("meshoptimizer");
      await MeshoptSimplifier.ready;
      transforms.push(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: simplifyRatio,
          error: 0.001,
        }),
      );
    } catch {
      transforms.push(simplify({ ratio: simplifyRatio, error: 0.001 }));
    }
  }

  // Keep skinned mesh attributes; still drop unreferenced buffers
  transforms.push(prune({ keepAttributes: true, keepLeaves: true }));

  if (textureFormat) {
    transforms.push(
      textureCompress({
        encoder: sharp,
        targetFormat: textureFormat === false ? undefined : textureFormat,
        resize: textureSize > 0 ? [textureSize, textureSize] : undefined,
      }),
    );
  }

  await document.transform(...transforms);

  // Colliders + final AABB must run on float (or dequant-aware) geometry.
  // Bake colliders BEFORE quantize/draco so companion JSON is meter-space.
  let colliderPayload = null;
  if (doColliders) {
    colliderPayload = bakeColliders(document, {
      capsule: true,
      yHip: yHipGround,
      // When height-normalized (heroes), use production character capsule
      characterHeight: targetHeight > 0 ? targetHeight : 0,
    });
  }
  const aabbPreCompress = meshAabb(document);

  if (useMeshopt) {
    try {
      await document.transform(quantize());
    } catch {
      /* non-fatal */
    }
  }

  if (useDraco) {
    try {
      const draco3d = await import("draco3dgltf");
      const { draco } = await import("@gltf-transform/functions");
      io.registerDependencies({
        "draco3d.encoder": await draco3d.createEncoderModule(),
        "draco3d.decoder": await draco3d.createDecoderModule(),
      });
      await document.transform(draco({ method: "edgebreaker" }));
    } catch {
      /* optional */
    }
  }

  // Stamp after all transforms — writer tools may overwrite earlier generator strings
  const asset = document.getRoot().getAsset();
  asset.generator = `@grudge-studio/asset-convert@1.0.0`;
  asset.extras = {
    ...(asset.extras || {}),
    grudgePipeline: pipelineExtras,
  };

  const writePath =
    format === "gltf"
      ? outputPath.replace(/\.glb$/i, ".gltf")
      : outputPath.endsWith(".glb") || outputPath.endsWith(".gltf")
        ? outputPath
        : `${outputPath}.glb`;

  await io.write(writePath, document);

  let companion = null;
  if (colliderCompanion && colliderPayload) {
    companion = writeColliderCompanion(writePath, colliderPayload);
  }

  // Prefer pre-compress AABB (true meters); fall back to post-write read
  const aabb = aabbPreCompress || meshAabb(document);
  return {
    outputPath: writePath,
    companion,
    aabb,
    colliderPayload,
    stats: {
      meshes: document.getRoot().listMeshes().length,
      materials: document.getRoot().listMaterials().length,
      textures: document.getRoot().listTextures().length,
      animations: document.getRoot().listAnimations().length,
      nodes: document.getRoot().listNodes().length,
      skins: document.getRoot().listSkins().length,
    },
  };
}

export async function glbToGltf(inputPath, outputPath) {
  const io = createIO();
  const document = await io.read(inputPath);
  const out = outputPath.endsWith(".gltf") ? outputPath : `${outputPath}.gltf`;
  await io.write(out, document);
  return out;
}

export async function gltfToGlb(inputPath, outputPath) {
  const io = createIO();
  const document = await io.read(inputPath);
  const out = outputPath.endsWith(".glb") ? outputPath : `${outputPath}.glb`;
  await io.write(out, document);
  return out;
}
