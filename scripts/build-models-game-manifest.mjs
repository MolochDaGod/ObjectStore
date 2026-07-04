#!/usr/bin/env node
/**
 * Build game-runtime manifest merging audit + game-ready paths.
 * Output: api/v1/models3d-game.json
 *
 * Usage: node scripts/build-models-game-manifest.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  API_DIR,
  ATTACHMENT_PROFILES,
  CDN_FALLBACK,
  CDN_PRIMARY,
  ROOT,
  RACE_PREFIXES,
  TOON_RTS_PACK,
  fileSizeKB,
  gameReadyRelPath,
  loadRegistry,
  md5File,
  modelGrudgeUuid,
  resolveCdnUrls,
  resolvePreviewUnitUrl,
} from './lib/model-game-utils.mjs';

const OUT = path.join(API_DIR, 'models3d-game.json');
const AUDIT_PATH = path.join(API_DIR, 'models3d-audit.json');

function log(msg) { console.log(`[build:models-game] ${msg}`); }

function loadAudit() {
  if (!fs.existsSync(AUDIT_PATH)) {
    log('No audit file — run npm run audit:models first');
    return { models: [], summary: {} };
  }
  return JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8'));
}

function buildPreviewUnitsCatalog() {
  const races = Object.entries(RACE_PREFIXES).map(([prefix, race]) => ({
    prefix,
    race,
    characterUrl: `${TOON_RTS_PACK}/characters/${race}.glb`,
    cavalryUrl: `${TOON_RTS_PACK}/cavalry/${race}.glb`,
  }));
  return {
    toonRts: races,
    kaykit: [
      { id: 'knight', url: `${CDN_FALLBACK}/models/characters/kaykit/Knight.glb` },
      { id: 'barbarian', url: `${CDN_FALLBACK}/models/characters/kaykit/Barbarian.glb` },
      { id: 'mage', url: `${CDN_FALLBACK}/models/characters/kaykit/Mage.glb` },
      { id: 'ranger', url: `${CDN_FALLBACK}/models/characters/kaykit/Ranger.glb` },
      { id: 'rogue', url: `${CDN_FALLBACK}/models/characters/kaykit/Rogue.glb` },
    ],
  };
}

function buildGameEntry(registryEntry, auditEntry) {
  const sourcePath = (registryEntry.path || auditEntry?.path || '').replace(/\\/g, '/');
  const grudgeUUID = auditEntry?.grudgeUUID || registryEntry.uuid || modelGrudgeUuid(sourcePath);
  const gameReadyPath = gameReadyRelPath(sourcePath);
  const gameReadyAbs = path.join(ROOT, gameReadyPath);
  const hasGameReady = fs.existsSync(gameReadyAbs);

  const cdn = resolveCdnUrls(sourcePath);
  const gameCdn = resolveCdnUrls(gameReadyPath);

  const entry = {
    grudgeUUID,
    name: registryEntry.name || auditEntry?.name,
    format: registryEntry.format || 'GLB',
    category: registryEntry.category || auditEntry?.category,
    sourcePath,
    gameReadyPath: hasGameReady ? gameReadyPath : null,
    sizeKB: hasGameReady ? fileSizeKB(gameReadyAbs) : (registryEntry.sizeKB || auditEntry?.actualSizeKB || 0),
    sourceSizeKB: registryEntry.sizeKB || auditEntry?.actualSizeKB || 0,

    // Runtime URL priority: game-ready GitHub Pages → source GitHub Pages → R2
    _gameReadyUrl: hasGameReady ? gameCdn.githubPagesUrl : null,
    _cdnUrl: registryEntry._cdnUrl || cdn.githubPagesUrl,
    _cdnFallback: cdn.fallbackUrl,
    _r2Url: cdn.cdnUrl,

    kind: auditEntry?.kind || 'unknown',
    boneMap: auditEntry?.boneMap || null,
    attachmentProfile: auditEntry?.attachmentProfile || null,
    weaponType: auditEntry?.weaponType || null,
    previewUnit: auditEntry?.previewUnit || null,
    previewVariant: auditEntry?.previewVariant || null,
    previewUnitUrl: auditEntry?.previewUnitUrl || resolvePreviewUnitUrl(auditEntry || {}, registryEntry.name),

    meshes: auditEntry?.meshes ?? registryEntry.meshes ?? 0,
    animations: auditEntry?.animations ?? registryEntry.animations ?? 0,
    textures: auditEntry?.textures ?? registryEntry.textures ?? 0,
    materials: auditEntry?.materials ?? registryEntry.materials ?? 0,
    textureStatus: auditEntry?.textureStatus || 'unknown',
    compressionType: hasGameReady ? 'draco' : (auditEntry?.compressionType || 'none'),
    gameReadiness: auditEntry?.gameReadiness || 0,
    valid: auditEntry?.valid ?? true,
    extensions: auditEntry?.extensions || registryEntry.extensions || [],
  };

  if (hasGameReady) {
    try {
      entry.checksum = md5File(gameReadyAbs);
    } catch {
      /* skip */
    }
  }

  return entry;
}

function buildSummary(entries) {
  const summary = {
    total: entries.length,
    gameReadyOnDisk: 0,
    avgReadiness: 0,
    byKind: {},
    byCategory: {},
    highReadiness: 0,
  };

  let sum = 0;
  for (const e of entries) {
    sum += e.gameReadiness || 0;
    if (e.gameReadyPath) summary.gameReadyOnDisk += 1;
    if ((e.gameReadiness || 0) >= 80) summary.highReadiness += 1;
    summary.byKind[e.kind || 'unknown'] = (summary.byKind[e.kind || 'unknown'] || 0) + 1;
    summary.byCategory[e.category || 'uncategorized'] = (summary.byCategory[e.category || 'uncategorized'] || 0) + 1;
  }
  summary.avgReadiness = entries.length ? Math.round(sum / entries.length) : 0;
  return summary;
}

function main() {
  log('Building game manifest…');
  const registry = loadRegistry();
  const audit = loadAudit();
  const auditByPath = new Map((audit.models || []).map((m) => [m.path, m]));

  const entries = (registry.models || []).map((reg) => {
    const rel = (reg.path || '').replace(/\\/g, '/');
    return buildGameEntry(reg, auditByPath.get(rel));
  });

  entries.sort((a, b) => {
    const c = (a.category || '').localeCompare(b.category || '');
    return c || (a.name || '').localeCompare(b.name || '');
  });

  const output = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    description: 'Game-runtime 3D model manifest — optimized GLBs, attachment profiles, preview units, CDN URLs',
    pipeline: {
      audit: 'npm run audit:models',
      optimize: 'npm run optimize:models',
      manifest: 'npm run build:models-game',
      full: 'npm run build:models-pipeline',
    },
    cdn: {
      primary: CDN_PRIMARY,
      fallback: CDN_FALLBACK,
      urlPriority: ['_gameReadyUrl', '_cdnUrl', '_r2Url'],
    },
    attachmentProfiles: ATTACHMENT_PROFILES,
    previewUnits: buildPreviewUnitsCatalog(),
    summary: buildSummary(entries),
    models: entries,
  };

  fs.mkdirSync(API_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

  log(`Wrote ${OUT}`);
  log(`Models: ${entries.length} | Game-ready on disk: ${output.summary.gameReadyOnDisk} | Avg readiness: ${output.summary.avgReadiness}%`);
}

main();