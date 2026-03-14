#!/usr/bin/env node
/**
 * Split horizontal sprite sheets into individual frames.
 *
 * Detects images wider than 2× their height, divides into equal-width
 * square (or near-square) frames, and writes each frame as a separate
 * PNG file with a label: {effectName}_frame_01.png, _frame_02.png, etc.
 *
 * Usage:
 *   node scripts/split-spritesheets.mjs [SOURCE_DIR] [DEST_DIR]
 *
 * Defaults:
 *   SOURCE = RPG-MODULAR/public/effects  (+ pixel/ subfolder)
 *   DEST   = ObjectStore/sprites/effects/frames/
 */

import { readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('❌ sharp is required. Run: npm install sharp');
  process.exit(1);
}

const SRC = process.argv[2] || 'C:\\Users\\nugye\\Documents\\RPG-MODULAR\\RPG-MODULAR\\public\\effects';
const DEST = process.argv[3] || join(ROOT, 'sprites', 'effects', 'frames');

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/**
 * Collect all sprite-sheet candidates from a directory (non-recursive).
 * A sprite sheet is any image whose width > 2 × height.
 */
async function findSheets(dir) {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter(f => IMAGE_EXTS.has(extname(f).toLowerCase()))
    .map(f => join(dir, f));

  const sheets = [];
  for (const file of files) {
    try {
      const meta = await sharp(file).metadata();
      if (meta.width && meta.height && meta.width > meta.height * 2) {
        sheets.push({ file, width: meta.width, height: meta.height });
      }
    } catch { /* skip unreadable */ }
  }
  return sheets;
}

/**
 * Split a single sprite sheet into equal-width frames.
 * Frame width = image height (assumes square frames) clamped to actual width.
 */
async function splitSheet({ file, width, height }) {
  const name = basename(file, extname(file)).replace(/_spritesheet$/, '');
  const frameW = height; // assume square frames
  const frameCount = Math.floor(width / frameW);
  if (frameCount < 2) return 0;

  const outDir = join(DEST, name);
  ensureDir(outDir);

  let written = 0;
  for (let i = 0; i < frameCount; i++) {
    const left = i * frameW;
    const outFile = join(outDir, `${name}_frame_${String(i + 1).padStart(2, '0')}.png`);
    if (existsSync(outFile)) { written++; continue; }

    try {
      await sharp(file)
        .extract({ left, top: 0, width: frameW, height })
        .png()
        .toFile(outFile);
      written++;
    } catch (err) {
      console.warn(`  ⚠ Failed frame ${i + 1} of ${basename(file)}: ${err.message}`);
    }
  }

  console.log(`  ✂ ${basename(file)} → ${frameCount} frames (${frameW}×${height}) → ${name}/`);
  return frameCount;
}

// ── Main ──
console.log(`📂 Source: ${SRC}`);
console.log(`📂 Dest:   ${DEST}`);
console.log('');

ensureDir(DEST);

let totalFrames = 0;
let totalSheets = 0;

// Root-level effect sheets
const rootSheets = await findSheets(SRC);
for (const sheet of rootSheets) {
  totalFrames += await splitSheet(sheet);
  totalSheets++;
}

// Pixel sub-folder
const pixelDir = join(SRC, 'pixel');
const pixelSheets = await findSheets(pixelDir);
for (const sheet of pixelSheets) {
  totalFrames += await splitSheet(sheet);
  totalSheets++;
}

// Impact sub-folder
const impactDir = join(SRC, 'impact');
const impactSheets = await findSheets(impactDir);
for (const sheet of impactSheets) {
  totalFrames += await splitSheet(sheet);
  totalSheets++;
}

// Retro impact sub-folder
const retroDir = join(SRC, 'retro_impact');
const retroSheets = await findSheets(retroDir);
for (const sheet of retroSheets) {
  totalFrames += await splitSheet(sheet);
  totalSheets++;
}

// Bullet impact sub-folder
const bulletDir = join(SRC, 'bullet_impact');
const bulletSheets = await findSheets(bulletDir);
for (const sheet of bulletSheets) {
  totalFrames += await splitSheet(sheet);
  totalSheets++;
}

// Custom sub-folder
const customDir = join(SRC, 'custom');
const customSheets = await findSheets(customDir);
for (const sheet of customSheets) {
  totalFrames += await splitSheet(sheet);
  totalSheets++;
}

console.log('');
console.log(`✅ Split ${totalSheets} sprite sheets into ${totalFrames} individual frames`);
console.log(`✅ Output: ${DEST}`);
