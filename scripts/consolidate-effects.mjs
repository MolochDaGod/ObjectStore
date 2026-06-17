#!/usr/bin/env node
/**
 * consolidate-effects.mjs — Grudge Effect Texture Consolidator
 *
 * Copies and categorizes effect textures from the FRESH-GRUDGE Unity project
 * into ObjectStore's effects/3d/{category}/ structure with consistent naming.
 *
 * Source packs discovered in F:\GitHub\FRESH-GRUDGE\Assets:
 *   - !FX/ARPG Effects         (84 textures) — portals, beams, fire, quest markers, auras
 *   - NEW EFFECTS/AOE Magic spells Vol.1 (47) — spell circles, cracks, fire, lightning, noise
 *   - SineVFX/TopDownEffects   (108) — ground FX, rings, waves, top-down combat
 *   - KriptoFX/Realistic Effects Pack v4 (3) — realistic fire/smoke/distortion
 *   - KriptoFX/Realistic Effects Pack 3 (1)
 *   - KY_effects               (5)  — magic sparkles, energy
 *   - FXVShieldEffect          (7)  — shield domes, barriers
 *   - NEW EFFECTS/Wizard spells pack (3) — spell icons
 *   - Travis Game Assets/Status Effects (1) — status overlays
 *   - KTK_Effect_Samples       (5)  — anime/toon FX
 *   - EffectTexturesAndPrefabs (1)  — spark particles
 *
 * Categories (BabylonJS particle system oriented):
 *   auras       — glows, beams, rings, character auras
 *   fire        — flames, fire sprites, lava, torch
 *   ice         — crystals, frost, frozen
 *   lightning   — sparks, electric, bolts
 *   spells      — magic circles, runewords, spell casts
 *   portals     — portal swirls, warp effects
 *   projectiles — arrows, bullets, ranged particles
 *   impacts     — hit effects, cracks, explosions
 *   shields     — barrier domes, shield bubbles
 *   buffs       — status icons, overhead markers
 *   environment — rain, clouds, leaves, fog
 *   ground      — AoE indicators, ground rings, craters
 *   noise       — tileable noise/gradient textures for shaders
 *   misc        — uncategorized
 *
 * Usage:
 *   node scripts/consolidate-effects.mjs
 *   node scripts/consolidate-effects.mjs --dry-run
 *   node scripts/consolidate-effects.mjs --pack=arpg-effects
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_BASE = path.join(ROOT, 'effects', '3d');

const dryRun = process.argv.includes('--dry-run');
const packFilter = process.argv.find(a => a.startsWith('--pack='))?.split('=')[1] || null;

// ═══════════════════════════════════════════════════════════
// SOURCE PACK DEFINITIONS
// ═══════════════════════════════════════════════════════════
const UNITY_ROOT = process.env.FRESH_GRUDGE_ROOT
  ? `${process.env.FRESH_GRUDGE_ROOT}\\Assets`
  : 'C:\\Users\\david\\Desktop\\FRESH-GRUDGE\\Assets';

const PACKS = [
  {
    id: 'arpg-effects',
    name: 'ARPG Effects',
    dirs: [
      path.join(UNITY_ROOT, '!FX', 'ARPG Effects', 'Textures'),
      path.join(UNITY_ROOT, '!FX', 'ARPG Effects', 'Demo', 'Textures'),
    ],
    tags: ['combat', 'arpg', 'portals', 'loot', 'orbs'],
  },
  {
    id: 'aoe-magic-spells',
    name: 'AOE Magic Spells Vol.1',
    dirs: [
      path.join(UNITY_ROOT, 'NEW EFFECTS', 'AOE Magic spells Vol.1', 'Textures'),
    ],
    tags: ['aoe', 'spell', 'magic', 'circle'],
  },
  {
    id: 'topdown-effects',
    name: 'SineVFX TopDown Effects',
    dirs: [
      path.join(UNITY_ROOT, 'SineVFX', 'TopDownEffects', 'Resources', 'Textures'),
    ],
    tags: ['topdown', 'ground', 'aoe', 'combat'],
  },
  {
    id: 'kriptofx-v4',
    name: 'KriptoFX Realistic Effects Pack v4',
    dirs: [
      path.join(UNITY_ROOT, 'KriptoFX', 'Realistic Effects Pack v4', 'Effects', 'Textures'),
      path.join(UNITY_ROOT, 'KriptoFX', 'Realistic Effects Pack v4', 'Textures'),
    ],
    tags: ['realistic', 'fire', 'smoke', 'distortion'],
  },
  {
    id: 'kriptofx-v3',
    name: 'KriptoFX Realistic Effects Pack 3',
    dirs: [
      path.join(UNITY_ROOT, 'KriptoFX', 'Realistic Effects Pack 3', 'Effects', 'Textures'),
      path.join(UNITY_ROOT, 'KriptoFX', 'Realistic Effects Pack 3', 'Textures'),
    ],
    tags: ['realistic', 'fire', 'smoke'],
  },
  {
    id: 'ky-effects',
    name: 'KY Magic Effects',
    dirs: [
      path.join(UNITY_ROOT, 'KY_effects'),
    ],
    tags: ['magic', 'energy', 'sparkle'],
  },
  {
    id: 'shield-effects',
    name: 'FXV Shield Effects',
    dirs: [
      path.join(UNITY_ROOT, 'FXVShieldEffect'),
    ],
    tags: ['shield', 'barrier', 'defense'],
  },
  {
    id: 'wizard-spells',
    name: 'Wizard Spells Pack',
    dirs: [
      path.join(UNITY_ROOT, 'NEW EFFECTS', 'Wizard spells pack'),
    ],
    tags: ['spell', 'wizard', 'magic'],
  },
  {
    id: 'status-effects',
    name: 'Travis Status Effects',
    dirs: [
      path.join(UNITY_ROOT, 'Travis Game Assets', 'Status Effects'),
    ],
    tags: ['buff', 'debuff', 'status'],
  },
  {
    id: 'ktk-effects',
    name: 'KTK Effect Samples',
    dirs: [
      path.join(UNITY_ROOT, 'KTK_Effect_Samples'),
    ],
    tags: ['anime', 'toon', 'slash'],
  },
  {
    id: 'effect-textures',
    name: 'Effect Textures And Prefabs',
    dirs: [
      path.join(UNITY_ROOT, 'EffectTexturesAndPrefabs', 'Textures'),
    ],
    tags: ['particles', 'spark'],
  },
  {
    id: 'magic-effects',
    name: 'Magic Effects Pack',
    dirs: [
      path.join(UNITY_ROOT, 'NEW EFFECTS', 'Magic effects pack'),
    ],
    tags: ['magic', 'spell', 'cast'],
  },
];

// ═══════════════════════════════════════════════════════════
// CATEGORY CLASSIFICATION
// ═══════════════════════════════════════════════════════════
// Pattern-based: match filename → category
const CATEGORY_RULES = [
  // Portals
  { pattern: /portal/i, category: 'portals' },
  { pattern: /warp|teleport/i, category: 'portals' },

  // Fire
  { pattern: /fire|flame|torch|lava|burn|ember|inferno/i, category: 'fire' },

  // Ice
  { pattern: /ice|frost|frozen|crystal|cold|snow/i, category: 'ice' },
  { pattern: /EGACrystal/i, category: 'ice' },

  // Lightning
  { pattern: /lightning|electric|spark|bolt|thunder|shock/i, category: 'lightning' },

  // Shields
  { pattern: /shield|barrier|dome|protect|ward|bubble/i, category: 'shields' },
  { pattern: /icon_reward/i, category: 'shields' },

  // Spells / Magic
  { pattern: /magic|spell|rune|circle\d|summon|cast|wizard|arcane|enchant/i, category: 'spells' },
  { pattern: /runeword/i, category: 'spells' },
  { pattern: /Magic_Circle/i, category: 'spells' },

  // Projectiles
  { pattern: /arrow|projectile|bullet|missile/i, category: 'projectiles' },

  // Impacts
  { pattern: /crack|impact|hit|explod|explos|shatter|smash|debris/i, category: 'impacts' },
  { pattern: /rain_impact|roundsmooth/i, category: 'impacts' },

  // Buffs / Status
  { pattern: /buff|debuff|status|quest|icon_w_|exclamation|question|speech|star/i, category: 'buffs' },
  { pattern: /icon_quest|questmarker/i, category: 'buffs' },
  { pattern: /levelup/i, category: 'buffs' },

  // Auras / Glows
  { pattern: /aura|glow|beam|ring|orb|halo|radiance/i, category: 'auras' },
  { pattern: /basicglow|beamglow|iconglow|character_ring/i, category: 'auras' },
  { pattern: /treasure_ray|chestrays/i, category: 'auras' },
  { pattern: /Flare|Flash|Point\d/i, category: 'auras' },
  { pattern: /Semicircle/i, category: 'auras' },

  // Environment
  { pattern: /rain|cloud|leaf|fog|mist|wind|weather|dust|snow/i, category: 'environment' },
  { pattern: /grass|stone|brick|wood|ambient/i, category: 'environment' },

  // Ground AoE
  { pattern: /ground|crater|floor|decal|circle(?!_)/i, category: 'ground' },
  { pattern: /Crater\d/i, category: 'ground' },

  // Noise / Shader textures
  { pattern: /noise|gradient|mask|normal|wave_form|distort/i, category: 'noise' },
  { pattern: /Noise\d|Gradient\d|Mask\d|NormalMap/i, category: 'noise' },
  { pattern: /verticalgradient/i, category: 'noise' },
  { pattern: /MaskForShader/i, category: 'noise' },

  // Smoke
  { pattern: /smoke/i, category: 'fire' },
];

function classifyTexture(filename) {
  const base = path.basename(filename, path.extname(filename));
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(base)) {
      return rule.category;
    }
  }
  return 'misc';
}

// ═══════════════════════════════════════════════════════════
// CONSOLIDATION
// ═══════════════════════════════════════════════════════════
function scanDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDir(full));
    } else if (/\.(png|tga|jpg|jpeg)$/i.test(entry.name)) {
      // Skip Unity meta files, editor textures, thumbnails
      if (entry.name.endsWith('.meta')) continue;
      if (/editor|preview|thumbnail|demo_scene/i.test(entry.name)) continue;
      results.push(full);
    }
  }
  return results;
}

const stats = { copied: 0, skipped: 0, errors: 0, packs: 0 };
const allEntries = []; // for manifest

console.log('═══ Grudge Effect Texture Consolidation ═══');
console.log(`Source: ${UNITY_ROOT}`);
console.log(`Output: ${OUT_BASE}`);
if (dryRun) console.log('DRY RUN — no files written');
console.log('');

for (const pack of PACKS) {
  if (packFilter && pack.id !== packFilter) continue;

  const texFiles = [];
  for (const dir of pack.dirs) {
    texFiles.push(...scanDir(dir));
  }

  if (texFiles.length === 0) {
    continue;
  }

  console.log(`[${pack.id}] ${pack.name} — ${texFiles.length} textures`);
  stats.packs++;

  for (const srcPath of texFiles) {
    const originalName = path.basename(srcPath);
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext);

    // Determine category
    const category = classifyTexture(baseName);

    // Build output filename: {pack-id}_{original}.{ext}
    const outName = `${pack.id}_${originalName}`;
    const outDir = path.join(OUT_BASE, category);
    const outPath = path.join(outDir, outName);

    // Skip if already exists and same size
    if (fs.existsSync(outPath)) {
      const srcSize = fs.statSync(srcPath).size;
      const destSize = fs.statSync(outPath).size;
      if (srcSize === destSize) {
        stats.skipped++;
        continue;
      }
    }

    if (dryRun) {
      console.log(`  → ${category}/${outName}`);
      stats.copied++;
      continue;
    }

    try {
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.copyFileSync(srcPath, outPath);
      stats.copied++;
      process.stdout.write('.');
    } catch (e) {
      console.error(`  ERR: ${originalName}: ${e.message}`);
      stats.errors++;
    }

    // Collect manifest entry
    allEntries.push({
      pack: pack.id,
      filename: outName,
      original: originalName,
      path: `effects/3d/${category}/${outName}`,
      category,
      tags: pack.tags,
      size: fs.existsSync(outPath) ? fs.statSync(outPath).size : 0,
      needsConversion: ext === '.tga',
    });
  }
  console.log('');
}

console.log('');
console.log('═══ CONSOLIDATION COMPLETE ═══');
console.log(`Packs:   ${stats.packs}`);
console.log(`Copied:  ${stats.copied}`);
console.log(`Skipped: ${stats.skipped}`);
console.log(`Errors:  ${stats.errors}`);
