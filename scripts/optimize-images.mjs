#!/usr/bin/env node
/**
 * Image Optimization Script
 * Generates 64px WebP thumbnails for all sprite assets.
 * Requires: npm install sharp
 * Usage: node scripts/optimize-images.mjs
 */
import { readdir, mkdir, stat } from 'fs/promises';
import { join, extname, relative } from 'path';

const ROOT = process.cwd();
const THUMB_DIR = join(ROOT, 'thumbs');
const THUMB_SIZE = 64;
const IMAGE_DIRS = ['sprites', 'icons', 'backgrounds', 'images', 'map_nodes'];
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Error: sharp is not installed. Run: npm install sharp');
  process.exit(1);
}

let processed = 0, skipped = 0, errors = 0;

async function ensureDir(dir) {
  try { await mkdir(dir, { recursive: true }); } catch {}
}

async function processFile(srcPath) {
  const rel = relative(ROOT, srcPath);
  const outPath = join(THUMB_DIR, rel.replace(extname(rel), '.webp'));

  try {
    const outStat = await stat(outPath).catch(() => null);
    const srcStat = await stat(srcPath);
    if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) {
      skipped++;
      return;
    }
  } catch {}

  try {
    await ensureDir(join(outPath, '..'));
    await sharp(srcPath)
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80 })
      .toFile(outPath);
    processed++;
    if (processed % 100 === 0) console.log(`  Processed ${processed} images...`);
  } catch (err) {
    errors++;
    if (errors <= 5) console.warn(`  Warning: ${rel} - ${err.message}`);
  }
}

async function walkDir(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  const tasks = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      tasks.push(walkDir(full));
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      tasks.push(processFile(full));
    }
  }
  await Promise.all(tasks);
}

console.log('🖼️  ObjectStore Image Optimizer');
console.log(`   Thumbnail size: ${THUMB_SIZE}px WebP`);
console.log(`   Output: ${THUMB_DIR}\n`);

await ensureDir(THUMB_DIR);

for (const dir of IMAGE_DIRS) {
  const fullDir = join(ROOT, dir);
  console.log(`📁 Processing ${dir}/...`);
  await walkDir(fullDir);
}

console.log(`\n✅ Done: ${processed} generated, ${skipped} unchanged, ${errors} errors`);
