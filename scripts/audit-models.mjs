#!/usr/bin/env node
/**
 * Audit all GLB models in models3d.json for game readiness.
 * Outputs: api/v1/models3d-audit.json
 *
 * Usage:
 *   node scripts/audit-models.mjs
 *   node scripts/audit-models.mjs --verbose
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  API_DIR,
  ROOT,
  analyzeTextureStatus,
  classifyModel,
  extractGltfCounts,
  fileSizeKB,
  loadRegistry,
  loadUuidMap,
  modelGrudgeUuid,
  parseGlbJson,
  resolvePreviewUnitUrl,
  scoreGameReadiness,
} from './lib/model-game-utils.mjs';

const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const OUT = path.join(API_DIR, 'models3d-audit.json');

function log(msg) { console.log(`[audit:models] ${msg}`); }
function vlog(msg) { if (verbose) console.log(`  ${msg}`); }

function auditEntry(entry, uuidMap) {
  const relPath = (entry.path || '').replace(/\\/g, '/');
  const absPath = path.join(ROOT, relPath);
  const grudgeUUID = entry.uuid || uuidMap[relPath] || modelGrudgeUuid(relPath);

  const base = {
    grudgeUUID,
    name: entry.name,
    path: relPath,
    category: entry.category,
    format: entry.format || 'GLB',
    sourceSizeKB: entry.sizeKB || 0,
  };

  if (!relPath.toLowerCase().endsWith('.glb')) {
    return {
      ...base,
      valid: false,
      skipReason: 'non-glb',
      kind: 'source-asset',
      gameReadiness: 0,
    };
  }

  if (!fs.existsSync(absPath)) {
    return {
      ...base,
      valid: false,
      skipReason: 'missing-file',
      kind: 'unknown',
      gameReadiness: 0,
    };
  }

  try {
    const glbJson = parseGlbJson(absPath);
    const counts = extractGltfCounts(glbJson);
    const textureInfo = analyzeTextureStatus(absPath, glbJson);
    const classification = classifyModel(entry, counts);
    const previewUnitUrl = resolvePreviewUnitUrl(classification, entry.name);

    const extensions = new Set();
    for (const mat of glbJson.materials || []) {
      for (const ext of Object.keys(mat.extensions || {})) extensions.add(ext);
    }
    for (const mesh of glbJson.meshes || []) {
      for (const prim of mesh.primitives || []) {
        for (const ext of Object.keys(prim.extensions || {})) extensions.add(ext);
      }
    }

    const meta = {
      valid: true,
      ...counts,
      ...textureInfo,
      ...classification,
      previewUnitUrl,
      extensions: [...extensions],
      compressionType: extensions.has('KHR_draco_mesh_compression') ? 'draco' : 'none',
      actualSizeKB: fileSizeKB(absPath),
    };
    meta.gameReadiness = scoreGameReadiness(meta);

    vlog(`${entry.name}: ${meta.kind} · textures=${meta.textureStatus} · score=${meta.gameReadiness}`);
    return { ...base, ...meta };
  } catch (err) {
    return {
      ...base,
      valid: false,
      error: err.message,
      kind: 'unknown',
      gameReadiness: 0,
    };
  }
}

function buildSummary(results) {
  const summary = {
    total: results.length,
    valid: 0,
    invalid: 0,
    avgReadiness: 0,
    byKind: {},
    byTextureStatus: {},
    byCategory: {},
    needsOptimization: 0,
    missingTextures: 0,
    animationClips: 0,
    gameReadyCandidates: 0,
  };

  let readinessSum = 0;
  for (const r of results) {
    if (r.valid) summary.valid += 1;
    else summary.invalid += 1;

    readinessSum += r.gameReadiness || 0;
    summary.byKind[r.kind || 'unknown'] = (summary.byKind[r.kind || 'unknown'] || 0) + 1;
    if (r.textureStatus) {
      summary.byTextureStatus[r.textureStatus] = (summary.byTextureStatus[r.textureStatus] || 0) + 1;
    }
    summary.byCategory[r.category || 'uncategorized'] = (summary.byCategory[r.category || 'uncategorized'] || 0) + 1;

    if (r.kind === 'animation-clip') summary.animationClips += 1;
    if (r.missingTextures?.length) summary.missingTextures += 1;
    if (r.valid && (r.gameReadiness || 0) < 80) summary.needsOptimization += 1;
    if (r.valid && (r.gameReadiness || 0) >= 80) summary.gameReadyCandidates += 1;
  }

  summary.avgReadiness = results.length
    ? Math.round(readinessSum / results.length)
    : 0;

  return summary;
}

function main() {
  log('Auditing 3D model catalog…');
  const registry = loadRegistry();
  const uuidMap = loadUuidMap();
  const models = registry.models || [];
  log(`Registry: ${models.length} models`);

  const results = models.map((entry) => auditEntry(entry, uuidMap));
  const summary = buildSummary(results);

  const output = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    pipeline: 'npm run audit:models',
    registryVersion: registry.version || null,
    summary,
    models: results,
  };

  fs.mkdirSync(API_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

  log(`Wrote ${OUT}`);
  log(`Valid: ${summary.valid} | Invalid: ${summary.invalid} | Avg readiness: ${summary.avgReadiness}%`);
  log(`Animation clips: ${summary.animationClips} | Needs optimization: ${summary.needsOptimization}`);
  if (summary.missingTextures) log(`Missing external textures: ${summary.missingTextures} models`);
}

main();