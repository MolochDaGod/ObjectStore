#!/usr/bin/env node
/**
 * optimize-textures.js — Texture optimization pipeline
 *
 * Processes all textures in ObjectStore:
 *   1. TGA → PNG conversion (TGA not web-compatible)
 *   2. Generate WebP variants (40-60% smaller, supported by all modern browsers)
 *   3. Resize textures > 2048px to max 2048px (game-ready, saves bandwidth)
 *   4. Generate thumbnail variants (256px) for browsers/previews
 *
 * Uses sharp (libvips) — fastest Node.js image processor.
 *
 * Usage:
 *   node scripts/optimize-textures.js
 *   node scripts/optimize-textures.js --category monsters
 *   node scripts/optimize-textures.js --dry-run
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────
const BASE = 'D:\\ObjectStore';
const MAX_SIZE = 2048;       // max dimension for game textures
const THUMB_SIZE = 256;      // thumbnail size for browsers
const WEBP_QUALITY = 82;     // WebP quality (80-85 is visually lossless for game art)
const PNG_QUALITY = 90;      // PNG compression level

// Directories to scan for textures
const TEXTURE_DIRS = [
  'effects/3d', 'monsters/textures', 'npcs/textures', 'characters/textures',
  'environment/textures', 'mounts/textures', 'ships/textures', 'ui/textures',
  'weapons/textures', 'effects/textures',
];

// ── CLI args ────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const catFilter = args.find(a => a.startsWith('--category='))?.split('=')[1]
  || (args.indexOf('--category') >= 0 ? args[args.indexOf('--category') + 1] : null);

// ── Stats ───────────────────────────────────────────────────
let stats = { scanned: 0, converted: 0, webp: 0, resized: 0, thumbs: 0, errors: 0, savedBytes: 0 };

async function main() {
  console.log('=== Texture Optimization Pipeline ===');
  console.log(`Base: ${BASE}`);
  console.log(`Max size: ${MAX_SIZE}px | Thumb: ${THUMB_SIZE}px | WebP quality: ${WEBP_QUALITY}`);
  if (dryRun) console.log('DRY RUN — no files will be written');
  if (catFilter) console.log(`Category filter: ${catFilter}`);
  console.log('');

  for (const dir of TEXTURE_DIRS) {
    if (catFilter && !dir.includes(catFilter)) continue;
    const fullDir = path.join(BASE, dir);
    if (!fs.existsSync(fullDir)) continue;

    console.log(`Processing: ${dir}`);
    await processDirectory(fullDir, dir);
  }

  // Also scan category subdirs inside effects/3d
  const fxBase = path.join(BASE, 'effects', '3d');
  if (fs.existsSync(fxBase)) {
    for (const sub of fs.readdirSync(fxBase, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      if (catFilter && !sub.name.includes(catFilter)) continue;
      const subPath = path.join(fxBase, sub.name);
      await processDirectory(subPath, `effects/3d/${sub.name}`);
    }
  }

  console.log('\n=== Optimization Complete ===');
  console.log(`Scanned:    ${stats.scanned}`);
  console.log(`TGA→PNG:    ${stats.converted}`);
  console.log(`WebP gen:   ${stats.webp}`);
  console.log(`Resized:    ${stats.resized}`);
  console.log(`Thumbnails: ${stats.thumbs}`);
  console.log(`Errors:     ${stats.errors}`);
  console.log(`Saved:      ${(stats.savedBytes / 1024 / 1024).toFixed(1)} MB`);
}

async function processDirectory(dirPath, label) {
  const files = fs.readdirSync(dirPath).filter(f =>
    /\.(png|tga|jpg|jpeg)$/i.test(f)
  );

  for (const file of files) {
    stats.scanned++;
    const filePath = path.join(dirPath, file);
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);

    try {
      // 1. TGA → PNG conversion
      if (ext === '.tga') {
        const pngPath = path.join(dirPath, `${base}.png`);
        if (!fs.existsSync(pngPath)) {
          if (!dryRun) {
            await sharp(filePath).png({ quality: PNG_QUALITY }).toFile(pngPath);
            // Remove TGA after successful conversion
            const origSize = fs.statSync(filePath).size;
            const newSize = fs.statSync(pngPath).size;
            stats.savedBytes += Math.max(0, origSize - newSize);
          }
          stats.converted++;
          process.stdout.write('C');
        }
        // Skip further processing for TGA — use the PNG we just created
        continue;
      }

      const metadata = await sharp(filePath).metadata();
      const { width, height } = metadata;

      // 2. Resize if > MAX_SIZE
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const resizedPath = filePath; // overwrite original with optimized version
        if (!dryRun) {
          const origSize = fs.statSync(filePath).size;
          await sharp(filePath)
            .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
            .png({ quality: PNG_QUALITY })
            .toFile(filePath + '.tmp');
          fs.renameSync(filePath + '.tmp', filePath);
          const newSize = fs.statSync(filePath).size;
          stats.savedBytes += Math.max(0, origSize - newSize);
        }
        stats.resized++;
        process.stdout.write('R');
      }

      // 3. Generate WebP variant
      const webpPath = path.join(dirPath, `${base}.webp`);
      if (!fs.existsSync(webpPath)) {
        if (!dryRun) {
          await sharp(filePath)
            .webp({ quality: WEBP_QUALITY })
            .toFile(webpPath);
          const origSize = fs.statSync(filePath).size;
          const webpSize = fs.statSync(webpPath).size;
          stats.savedBytes += Math.max(0, origSize - webpSize);
        }
        stats.webp++;
        process.stdout.write('W');
      }

      // 4. Generate thumbnail
      const thumbDir = path.join(dirPath, 'thumbs');
      const thumbPath = path.join(thumbDir, `${base}_thumb.webp`);
      if (!fs.existsSync(thumbPath)) {
        if (!dryRun) {
          if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
          await sharp(filePath)
            .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
            .webp({ quality: 70 })
            .toFile(thumbPath);
        }
        stats.thumbs++;
        process.stdout.write('T');
      }

    } catch (err) {
      stats.errors++;
      process.stdout.write('E');
      // Log but don't halt — some TGA files may have unsupported formats
      if (stats.errors <= 20) {
        console.error(`\n  ERR: ${file}: ${err.message}`);
      }
    }
  }
  process.stdout.write('\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
