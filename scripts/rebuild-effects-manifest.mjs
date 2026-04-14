#!/usr/bin/env node
/**
 * rebuild-effects-manifest.mjs — Regenerate Effects Manifest & BabylonJS Definitions
 *
 * Scans effects/3d/{category}/ for actual placed files and produces:
 *   1. effects/3d/manifest.json — complete texture registry with pack, tags, categories
 *   2. api/v1/effect-definitions.json — BabylonJS-ready particle system configs per texture
 *
 * The effect-definitions.json maps every texture to a recommended BabylonJS particle system
 * configuration (blend mode, emitter shape, lifetime, speed, atlas grid, etc.) so any game
 * client can load effects with: `await loadGrudgeEffect('portals/arpg-effects_portal.png')`
 *
 * Usage:
 *   node scripts/rebuild-effects-manifest.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const EFFECTS_DIR = path.join(ROOT, 'effects', '3d');
const API_DIR = path.join(ROOT, 'api', 'v1');

// ═══════════════════════════════════════════════════════════
// PACK METADATA (matches consolidate-effects.mjs)
// ═══════════════════════════════════════════════════════════
const PACK_META = {
  'arpg-effects':    { name: 'ARPG Effects',              tags: ['combat', 'arpg', 'portals', 'loot', 'orbs'] },
  'aoe-magic-spells':{ name: 'AOE Magic Spells Vol.1',    tags: ['aoe', 'spell', 'magic', 'circle'] },
  'topdown-effects': { name: 'SineVFX TopDown Effects',   tags: ['topdown', 'ground', 'aoe', 'combat'] },
  'kriptofx-v4':     { name: 'KriptoFX Realistic v4',     tags: ['realistic', 'fire', 'smoke', 'distortion'] },
  'kriptofx-v3':     { name: 'KriptoFX Realistic v3',     tags: ['realistic', 'fire', 'smoke'] },
  'ky-effects':      { name: 'KY Magic Effects',          tags: ['magic', 'energy', 'sparkle'] },
  'shield-effects':  { name: 'FXV Shield Effects',        tags: ['shield', 'barrier', 'defense'] },
  'wizard-spells':   { name: 'Wizard Spells Pack',        tags: ['spell', 'wizard', 'magic'] },
  'status-effects':  { name: 'Travis Status Effects',     tags: ['buff', 'debuff', 'status'] },
  'ktk-effects':     { name: 'KTK Effect Samples',        tags: ['anime', 'toon', 'slash'] },
  'effect-textures': { name: 'Effect Textures & Prefabs', tags: ['particles', 'spark'] },
  'magic-effects':   { name: 'Magic Effects Pack',        tags: ['magic', 'spell', 'cast'] },
};

// ═══════════════════════════════════════════════════════════
// BABYLONJS EFFECT PATTERN TEMPLATES
// ═══════════════════════════════════════════════════════════
// Each category maps to a default particle system config that works well in BabylonJS.
// Games override these per-use, but these are sane defaults for each effect type.
const BABYLON_PATTERNS = {
  portals: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'cylinder',
    emitterRadius: 1.5,
    minLifeTime: 0.8,
    maxLifeTime: 2.0,
    minEmitPower: 0.5,
    maxEmitPower: 1.5,
    minSize: 0.3,
    maxSize: 1.2,
    emitRate: 60,
    gravity: [0, 0.2, 0],
    rotationSpeed: 2.0,
    loop: true,
    usage: 'Portal swirl effect — attach to portal mesh, use with additive blend',
  },
  fire: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'cone',
    emitterRadius: 0.3,
    minLifeTime: 0.3,
    maxLifeTime: 1.0,
    minEmitPower: 1.0,
    maxEmitPower: 3.0,
    minSize: 0.1,
    maxSize: 0.6,
    emitRate: 80,
    gravity: [0, 2.0, 0],
    rotationSpeed: 0,
    loop: true,
    usage: 'Fire/flame particles — use atlas grid if filename contains NxM pattern',
  },
  ice: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'sphere',
    emitterRadius: 0.5,
    minLifeTime: 1.0,
    maxLifeTime: 3.0,
    minEmitPower: 0.2,
    maxEmitPower: 0.8,
    minSize: 0.1,
    maxSize: 0.5,
    emitRate: 30,
    gravity: [0, -0.3, 0],
    rotationSpeed: 0.5,
    loop: true,
    usage: 'Frost/crystal effect — slow drift downward with shimmer',
  },
  lightning: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'point',
    emitterRadius: 0,
    minLifeTime: 0.05,
    maxLifeTime: 0.2,
    minEmitPower: 5.0,
    maxEmitPower: 10.0,
    minSize: 0.05,
    maxSize: 0.4,
    emitRate: 120,
    gravity: [0, 0, 0],
    rotationSpeed: 10.0,
    loop: true,
    usage: 'Electric sparks — short lifetime, high emit power for snappy zaps',
  },
  spells: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'cylinder',
    emitterRadius: 1.0,
    minLifeTime: 0.5,
    maxLifeTime: 2.0,
    minEmitPower: 0.1,
    maxEmitPower: 0.5,
    minSize: 0.5,
    maxSize: 2.0,
    emitRate: 20,
    gravity: [0, 0, 0],
    rotationSpeed: 1.0,
    loop: false,
    usage: 'Magic circles/runes — display as ground decal or billboard, usually oneshot',
  },
  projectiles: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'point',
    emitterRadius: 0,
    minLifeTime: 0.1,
    maxLifeTime: 0.5,
    minEmitPower: 8.0,
    maxEmitPower: 15.0,
    minSize: 0.05,
    maxSize: 0.2,
    emitRate: 100,
    gravity: [0, -1.0, 0],
    rotationSpeed: 0,
    loop: true,
    usage: 'Trail particles for arrows/bullets — attach to projectile transform',
  },
  impacts: {
    blendMode: 'BLENDMODE_STANDARD',
    emitterType: 'sphere',
    emitterRadius: 0.3,
    minLifeTime: 0.2,
    maxLifeTime: 0.8,
    minEmitPower: 2.0,
    maxEmitPower: 5.0,
    minSize: 0.1,
    maxSize: 0.8,
    emitRate: 200,
    gravity: [0, -5.0, 0],
    rotationSpeed: 3.0,
    loop: false,
    usage: 'Hit/explosion burst — oneshot, high initial emit then stop',
  },
  shields: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'sphere',
    emitterRadius: 1.2,
    minLifeTime: 1.0,
    maxLifeTime: 3.0,
    minEmitPower: 0.0,
    maxEmitPower: 0.1,
    minSize: 0.5,
    maxSize: 2.5,
    emitRate: 15,
    gravity: [0, 0, 0],
    rotationSpeed: 0.3,
    loop: true,
    usage: 'Shield dome — overlay on character with alpha blend, billboard mode',
  },
  buffs: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'point',
    emitterRadius: 0,
    minLifeTime: 1.5,
    maxLifeTime: 3.0,
    minEmitPower: 0.5,
    maxEmitPower: 1.0,
    minSize: 0.3,
    maxSize: 0.8,
    emitRate: 5,
    gravity: [0, 0.5, 0],
    rotationSpeed: 0,
    loop: true,
    usage: 'Overhead status icon — billboard, float above character head',
  },
  auras: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'cylinder',
    emitterRadius: 0.8,
    minLifeTime: 0.5,
    maxLifeTime: 1.5,
    minEmitPower: 0.2,
    maxEmitPower: 0.8,
    minSize: 0.1,
    maxSize: 0.6,
    emitRate: 40,
    gravity: [0, 0.5, 0],
    rotationSpeed: 1.0,
    loop: true,
    usage: 'Character glow/aura — ring around feet or body-hugging particles',
  },
  environment: {
    blendMode: 'BLENDMODE_STANDARD',
    emitterType: 'box',
    emitterRadius: 10.0,
    minLifeTime: 2.0,
    maxLifeTime: 6.0,
    minEmitPower: 0.1,
    maxEmitPower: 0.5,
    minSize: 0.02,
    maxSize: 0.15,
    emitRate: 100,
    gravity: [0, -2.0, 0],
    rotationSpeed: 0.2,
    loop: true,
    usage: 'Weather/ambient particles — large emitter box covering scene area',
  },
  ground: {
    blendMode: 'BLENDMODE_ADD',
    emitterType: 'cylinder',
    emitterRadius: 2.0,
    minLifeTime: 0.5,
    maxLifeTime: 1.5,
    minEmitPower: 0.0,
    maxEmitPower: 0.1,
    minSize: 1.0,
    maxSize: 3.0,
    emitRate: 5,
    gravity: [0, 0, 0],
    rotationSpeed: 0.5,
    loop: false,
    usage: 'Ground AoE indicator — project onto terrain as decal or flat billboard',
  },
  noise: {
    blendMode: 'BLENDMODE_STANDARD',
    emitterType: null,
    usage: 'Shader input texture — use as noise/distortion/mask in custom shaders, not as particle',
    isShaderTexture: true,
  },
  misc: {
    blendMode: 'BLENDMODE_STANDARD',
    emitterType: 'point',
    emitterRadius: 0,
    minLifeTime: 1.0,
    maxLifeTime: 2.0,
    minEmitPower: 0.5,
    maxEmitPower: 1.0,
    minSize: 0.1,
    maxSize: 0.5,
    emitRate: 20,
    gravity: [0, 0, 0],
    rotationSpeed: 0,
    loop: true,
    usage: 'General purpose — adjust per use case',
  },
};

// ═══════════════════════════════════════════════════════════
// SCAN & BUILD
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('═══ Rebuild Effects Manifest ═══');

  const categories = fs.readdirSync(EFFECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const textures = [];
  const definitions = [];
  const byCategory = {};
  const byPack = {};

  for (const cat of categories) {
    const catDir = path.join(EFFECTS_DIR, cat);
    const files = fs.readdirSync(catDir)
      .filter(f => /\.(png|tga|jpg|jpeg|webp)$/i.test(f));

    byCategory[cat] = files.length;

    for (const file of files) {
      const filePath = path.join(catDir, file);
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);
      const size = fs.statSync(filePath).size;

      // Extract pack id from filename prefix (e.g., "arpg-effects_portal.png")
      const packMatch = baseName.match(/^([a-z0-9-]+?)_/);
      const packId = packMatch ? packMatch[1] : 'unknown';
      const original = packMatch ? baseName.substring(packId.length + 1) + ext : file;
      const meta = PACK_META[packId] || { name: 'Unknown', tags: [cat] };

      byPack[packId] = (byPack[packId] || 0) + 1;

      // Detect atlas grid from filename (e.g., "fire_16x4" → 16 columns, 4 rows)
      const atlasMatch = baseName.match(/(\d+)x(\d+)/);
      const atlas = atlasMatch
        ? { cols: parseInt(atlasMatch[1]), rows: parseInt(atlasMatch[2]) }
        : null;

      // Get image dimensions
      let width = 0, height = 0;
      if (ext !== '.tga') {
        try {
          const imgMeta = await sharp(filePath).metadata();
          width = imgMeta.width || 0;
          height = imgMeta.height || 0;
        } catch { /* skip unreadable */ }
      }

      // Manifest entry
      textures.push({
        pack: packId,
        filename: file,
        original,
        path: `effects/3d/${cat}/${file}`,
        category: cat,
        tags: meta.tags,
        size,
        width,
        height,
        atlas,
        needsConversion: ext === '.tga',
      });

      // BabylonJS effect definition
      const pattern = BABYLON_PATTERNS[cat] || BABYLON_PATTERNS.misc;
      definitions.push({
        id: `${cat}/${baseName}`,
        texture: `effects/3d/${cat}/${file}`,
        category: cat,
        pack: packId,
        atlas,
        width,
        height,
        babylonjs: { ...pattern },
      });
    }
  }

  // Sort
  textures.sort((a, b) => a.category.localeCompare(b.category) || a.filename.localeCompare(b.filename));
  definitions.sort((a, b) => a.id.localeCompare(b.id));

  // ── Write manifest.json ──
  const manifest = {
    version: '2.0.0',
    source: 'FRESH GRUDGE Unity Project + consolidated packs',
    generatedAt: new Date().toISOString(),
    totalTextures: textures.length,
    byCategory,
    byPack,
    textures,
  };

  fs.writeFileSync(
    path.join(EFFECTS_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`Manifest: effects/3d/manifest.json (${textures.length} textures)`);

  // ── Write effect-definitions.json ──
  if (!fs.existsSync(API_DIR)) fs.mkdirSync(API_DIR, { recursive: true });

  const effectDefs = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    description: 'BabylonJS particle system configurations for Grudge effect textures',
    totalEffects: definitions.length,
    categories: Object.keys(BABYLON_PATTERNS).map(cat => ({
      id: cat,
      count: byCategory[cat] || 0,
      defaults: BABYLON_PATTERNS[cat],
    })),
    effects: definitions,
  };

  fs.writeFileSync(
    path.join(API_DIR, 'effect-definitions.json'),
    JSON.stringify(effectDefs, null, 2)
  );
  console.log(`Definitions: api/v1/effect-definitions.json (${definitions.length} effects)`);

  // Category summary
  console.log('\nCategories:');
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count.toString().padStart(3)} ${cat}`);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
