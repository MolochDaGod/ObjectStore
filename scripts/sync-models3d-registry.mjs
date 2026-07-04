#!/usr/bin/env node
/**
 * Enrich api/v1/models3d.json with game-ready URLs and audit metadata.
 */
import fs from 'node:fs';
import path from 'node:path';
import { API_DIR } from './lib/model-game-utils.mjs';

const REGISTRY = path.join(API_DIR, 'models3d.json');
const GAME = path.join(API_DIR, 'models3d-game.json');
const AUDIT = path.join(API_DIR, 'models3d-audit.json');

function load(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
  const registry = load(REGISTRY);
  const game = fs.existsSync(GAME) ? load(GAME) : null;
  const audit = fs.existsSync(AUDIT) ? load(AUDIT) : null;

  const gameByPath = new Map((game?.models || []).map((m) => [m.sourcePath, m]));
  const auditByPath = new Map((audit?.models || []).map((m) => [m.path, m]));

  let enriched = 0;
  registry.models = (registry.models || []).map((m) => {
    const p = (m.path || '').replace(/\\/g, '/');
    const g = gameByPath.get(p);
    const a = auditByPath.get(p);
    if (!g && !a) return m;
    enriched += 1;
    return {
      ...m,
      meshes: a?.meshes ?? g?.meshes ?? m.meshes,
      animations: a?.animations ?? g?.animations ?? m.animations,
      textures: a?.textures ?? g?.textures ?? m.textures,
      materials: a?.materials ?? g?.materials ?? m.materials,
      compressionType: g?.compressionType || a?.compressionType || m.compressionType,
      gameReadyPath: g?.gameReadyPath || null,
      _gameReadyUrl: g?._gameReadyUrl || null,
      _cdnUrl: g?._cdnUrl || m._cdnUrl,
      gameReadiness: g?.gameReadiness ?? a?.gameReadiness ?? null,
      gameReady: g?.gameReady ?? a?.gameReady ?? false,
      textureStatus: g?.textureStatus || a?.textureStatus || null,
      kind: g?.kind || a?.kind || null,
      attachmentProfile: g?.attachmentProfile || null,
      previewUnitUrl: g?.previewUnitUrl || null,
    };
  });

  registry.version = '2.1.0';
  registry.generated = new Date().toISOString();
  registry.gamePipeline = 'npm run build:models-pipeline';
  registry.summary = {
    totalModels: registry.models.length,
    gameReady: registry.models.filter((m) => m.gameReady).length,
    avgReadiness: game?.summary?.avgReadiness || audit?.summary?.avgReadiness || null,
  };

  fs.writeFileSync(REGISTRY, JSON.stringify(registry, null, 2));
  console.log(`[sync:models3d] Enriched ${enriched}/${registry.models.length} entries in models3d.json`);
}

main();