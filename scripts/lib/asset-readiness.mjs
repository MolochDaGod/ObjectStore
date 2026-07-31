/**
 * Game-ready readiness scoring for fleet assets.
 * Meshes need convert/bake; gamedata/ui/audio use format-specific gates.
 */

import { classifyEra } from "./asset-era.mjs";

const MESH_EXT = new Set([".glb", ".gltf", ".fbx", ".obj", ".vox", ".dae"]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".tga"]);
const AUDIO_EXT = new Set([".mp3", ".ogg", ".wav", ".flac"]);
const DATA_EXT = new Set([".json", ".glsl", ".md", ".txt"]);

/**
 * @param {string} p
 */
export function extOf(p) {
  const m = (p || "").toLowerCase().match(/(\.[a-z0-9]+)$/);
  return m ? m[1] : "";
}

/**
 * @param {object} input
 * @param {string} input.path - relative or r2 key
 * @param {number} [input.sizeBytes]
 * @param {boolean} [input.hasSidecarManifest] - name.manifest.json next to mesh
 * @param {boolean} [input.hasCollider] - name.collider.json
 * @param {boolean} [input.cdnOk] - HEAD 200 + non-HTML
 * @param {boolean} [input.inRegistry] - present in D1/master-registry
 * @param {string} [input.contentType]
 * @param {boolean} [input.allowlistProtected]
 */
export function scoreReadiness(input) {
  const path = (input.path || "").replace(/\\/g, "/");
  const ext = extOf(path);
  const era = classifyEra(path);
  const issues = [];
  let score = 0;
  const size = input.sizeBytes ?? 0;

  // Base existence
  if (size > 0 || input.cdnOk || input.inRegistry) score += 10;
  else issues.push("missing-or-zero-size");

  if (input.cdnOk === true) score += 15;
  else if (input.cdnOk === false) issues.push("cdn-unreachable");

  if (input.inRegistry) score += 10;
  else if (MESH_EXT.has(ext) || DATA_EXT.has(ext)) issues.push("not-in-registry");

  let formatOk = false;
  let converted = false;
  let bakedScale = false;
  let hasCollider = !!input.hasCollider;
  let hasManifest = !!input.hasSidecarManifest;
  let stackUsable = false;
  let gameReady = false;

  // ── Type-specific gates ──────────────────────────────────────
  if (MESH_EXT.has(ext)) {
    if (ext === ".glb" || ext === ".gltf") {
      formatOk = true;
      converted = true;
      score += 25;
      // Prefer production companions
      if (hasManifest) {
        score += 15;
        bakedScale = true;
      } else {
        issues.push("missing-convert-manifest");
        score += 5; // still loadable
      }
      if (hasCollider) {
        score += 10;
      } else if (era === "grudge6" || path.includes("character") || path.includes("hero")) {
        issues.push("missing-collider-json");
      } else {
        score += 5; // props may omit
      }
      // Budget
      if (size > 80 * 1024 * 1024) {
        issues.push("oversized-mesh-80mb");
        score -= 20;
      } else if (size > 25 * 1024 * 1024) {
        issues.push("large-mesh-25mb");
        score -= 5;
      }
      stackUsable = formatOk && size > 0 && size < 120 * 1024 * 1024;
      gameReady = stackUsable && (hasManifest || era === "tvs" || era === "grudge6");
    } else if (ext === ".fbx") {
      // grudge6 races may stay FBX
      if (era === "grudge6") {
        formatOk = true;
        converted = false;
        stackUsable = true;
        gameReady = true;
        score += 30;
        issues.push("fbx-race-exception");
      } else {
        formatOk = false;
        converted = false;
        stackUsable = false;
        gameReady = false;
        score += 5;
        issues.push("raw-fbx-needs-convert");
      }
    } else if (ext === ".obj" || ext === ".dae") {
      formatOk = false;
      converted = false;
      stackUsable = false;
      gameReady = false;
      score += 5;
      issues.push("raw-mesh-needs-convert");
    } else if (ext === ".vox") {
      formatOk = true;
      converted = false;
      stackUsable = true; // some voxel tools load .vox
      gameReady = false;
      score += 15;
      issues.push("vox-prefer-glb-bake");
    }
  } else if (IMAGE_EXT.has(ext)) {
    formatOk = true;
    converted = true;
    bakedScale = true;
    stackUsable = true;
    gameReady = true;
    score += 40;
    if (size > 8 * 1024 * 1024) {
      issues.push("large-image-8mb");
      score -= 10;
    }
  } else if (AUDIO_EXT.has(ext)) {
    formatOk = true;
    converted = true;
    stackUsable = true;
    gameReady = true;
    score += 40;
  } else if (DATA_EXT.has(ext) || era === "gamedata") {
    formatOk = true;
    converted = true;
    stackUsable = true;
    gameReady = true;
    score += 40;
  } else if (ext === ".blend" || ext === ".unity" || ext === ".max" || ext === ".ma") {
    formatOk = false;
    stackUsable = false;
    gameReady = false;
    issues.push("authoring-format");
    score += 0;
  } else {
    // unknown extension
    formatOk = size > 0;
    stackUsable = false;
    gameReady = false;
    issues.push("unknown-format");
    score += 5;
  }

  if (input.contentType && /text\/html/i.test(input.contentType)) {
    issues.push("cdn-returned-html");
    stackUsable = false;
    gameReady = false;
    score = Math.min(score, 10);
  }

  score = Math.max(0, Math.min(100, score));

  // Non-mesh assets that are stack-usable count green even without D1 join
  if (
    gameReady &&
    stackUsable &&
    (era === "ui" ||
      era === "audio" ||
      era === "gamedata" ||
      IMAGE_EXT.has(ext) ||
      AUDIO_EXT.has(ext) ||
      DATA_EXT.has(ext))
  ) {
    score = Math.max(score, 80);
  }

  // Band
  let band = "red";
  if (score >= 70 && gameReady && stackUsable) band = "green";
  else if (score >= 40 || (stackUsable && !gameReady)) band = "yellow";
  else band = "red";

  // Allowlist never auto-purge even if red
  const purgeEligible =
    !input.allowlistProtected &&
    band === "red" &&
    !stackUsable &&
    (issues.includes("raw-fbx-needs-convert") ||
      issues.includes("raw-mesh-needs-convert") ||
      issues.includes("cdn-returned-html") ||
      issues.includes("missing-or-zero-size") ||
      issues.includes("authoring-format") ||
      issues.includes("cdn-unreachable"));

  return {
    era,
    score,
    band,
    gameReady,
    converted,
    bakedScale,
    hasCollider,
    hasManifest,
    formatOk,
    stackUsable,
    purgeEligible,
    issues,
    ext,
  };
}

/**
 * Build convert queue item for salvageable yellow/red meshes.
 */
export function convertQueueHint(path, readiness) {
  const ext = readiness.ext;
  if (![".fbx", ".obj", ".glb", ".gltf", ".dae"].includes(ext)) return null;
  if (readiness.gameReady && readiness.band === "green") return null;
  if (readiness.era === "grudge6" && ext === ".fbx") return null;

  let pipeline = "glb2glb";
  if (ext === ".fbx") pipeline = "fbx2gltf";
  else if (ext === ".obj") pipeline = "obj2glb";
  else if (ext === ".gltf") pipeline = "gltf2glb";

  const height =
    readiness.era === "grudge6" ||
    path.toLowerCase().includes("character") ||
    path.toLowerCase().includes("hero")
      ? 1.8
      : null;

  return {
    path,
    pipeline,
    height,
    suggested:
      height != null
        ? `npm run convert -- ${pipeline} <in> -o dist/prod/<name>.glb --height ${height} --texture-size 1024`
        : `npm run convert -- ${pipeline} <in> -o dist/prod/<name>.glb --texture-size 1024`,
  };
}
