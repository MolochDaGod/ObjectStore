#!/usr/bin/env node
/**
 * sync-to-r2.js — Bulk-upload ObjectStore assets to R2 via Worker API
 *
 * Usage:
 *   node scripts/sync-to-r2.js [--dry-run] [--category <cat>] [--dir <subdir>]
 *
 * Environment:
 *   OBJECTSTORE_API_KEY — Required. Worker X-API-Key for authenticated uploads.
 *   OBJECTSTORE_API_URL — Optional. Defaults to https://objectstore.grudge-studio.com
 *
 * Examples:
 *   node scripts/sync-to-r2.js --dir models/characters --category Characters
 *   node scripts/sync-to-r2.js --dir worlds --category Worlds --dry-run
 *   node scripts/sync-to-r2.js --dir textures --category Textures
 */

const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────
const API_URL = process.env.OBJECTSTORE_API_URL || 'https://objectstore.grudge-studio.com';
const API_KEY = process.env.OBJECTSTORE_API_KEY;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const dirIdx = args.indexOf('--dir');
const catIdx = args.indexOf('--category');
const TARGET_DIR = dirIdx >= 0 ? args[dirIdx + 1] : null;
const CATEGORY = catIdx >= 0 ? args[catIdx + 1] : null;

const ROOT = path.resolve(__dirname, '..');

// File extensions to sync (skip source files, scripts, HTML, etc.)
const SYNC_EXTENSIONS = new Set([
  '.glb', '.gltf', '.fbx', '.obj', '.stl',    // 3D models
  '.png', '.jpg', '.jpeg', '.webp', '.gif',    // Images
  '.svg',                                       // Vector
  '.ws', '.trn',                                // World data
  '.mp3', '.ogg', '.wav',                       // Audio
  '.json',                                      // Data (in asset dirs only)
  '.glsl',                                      // GLSL shaders
]);

// Directories that contain uploadable assets
const ASSET_DIRS = ['models', 'textures', 'sprites', 'icons', 'worlds', 'vfx', 'audio', '3dfx', 'effects'];

// Pipeline-specific directories (optimized GLBs + effect textures)
const PIPELINE_DIRS = ['models/_optimized', 'effects/3d'];
const PIPELINE_MODE = args.includes('--pipeline');

// ── Helpers ─────────────────────────────────────────────────────────
function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (SYNC_EXTENSIONS.has(ext)) {
        files.push(full);
      }
    }
  }
  return files;
}

function inferCategory(relPath) {
  if (CATEGORY) return CATEGORY;
  const parts = relPath.split('/');

  // Pipeline optimized models: models/_optimized/{category}/{file}.glb
  if (parts[0] === 'models' && parts[1] === '_optimized') {
    const sub = parts[2] || '';
    if (sub === 'animations') return 'Optimized Animations';
    if (sub === 'effects') return `Optimized Effects/${parts[3] || 'misc'}`;
    return `Optimized Models/${sub || 'misc'}`;
  }

  // Effect textures: effects/3d/{category}/{file}.png
  if (parts[0] === 'effects' && parts[1] === '3d') {
    const sub = parts[2] || 'misc';
    return `Effect Textures/${sub}`;
  }

  if (parts[0] === 'models') {
    if (parts[1] === 'animations') return 'Animations';
    if (parts[1] === 'characters' && parts[2] === 'kaykit') return 'KayKit Characters';
    if (parts[1] === 'characters') return 'Characters';
    if (parts[1] === 'buildings') return 'Buildings';
    if (parts[1] === 'ships') return 'Ships';
    return 'Models';
  }
  if (parts[0] === 'textures') return 'Textures';
  if (parts[0] === 'sprites') return 'Sprites';
  if (parts[0] === 'icons') return 'Icons';
  if (parts[0] === 'worlds') return 'Worlds';
  if (parts[0] === 'vfx') return 'VFX';
  if (parts[0] === 'effects') return 'Effects';
  if (parts[0] === '3dfx') {
    if (parts[1] === 'shaders') return '3DFX Shaders';
    if (parts[1] === 'definitions') return '3DFX';
    return '3DFX';
  }
  return 'uncategorized';
}

async function uploadFile(filePath, relPath, category) {
  const stat = fs.statSync(filePath);
  const filename = path.basename(filePath);

  if (DRY_RUN) {
    console.log(`  [dry-run] ${relPath} (${Math.ceil(stat.size / 1024)}KB) → category: ${category}`);
    return { success: true, dry: true };
  }

  const body = fs.readFileSync(filePath);
  const res = await fetch(`${API_URL}/v1/assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-API-Key': API_KEY,
      'X-Filename': filename,
      'X-Category': category,
      'X-Tags': JSON.stringify([path.extname(filename).slice(1).toLowerCase()]),
      'X-Metadata': JSON.stringify({ source: 'github-sync', path: relPath, sizeKB: Math.ceil(stat.size / 1024) }),
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `${res.status}: ${err}` };
  }
  return { success: true, data: await res.json() };
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('ObjectStore R2 Sync');
  console.log('═'.repeat(50));
  console.log(`API:      ${API_URL}`);
  console.log(`Dry run:  ${DRY_RUN}`);
  console.log(`Dir:      ${TARGET_DIR || '(all asset dirs)'}`);
  console.log(`Category: ${CATEGORY || '(auto-detect)'}`);
  console.log();

  if (!DRY_RUN && !API_KEY) {
    console.error('ERROR: Set OBJECTSTORE_API_KEY env var (or use --dry-run)');
    process.exit(1);
  }

  // Collect files
  let dirs;
  if (TARGET_DIR) {
    dirs = [path.join(ROOT, TARGET_DIR)];
  } else if (PIPELINE_MODE) {
    console.log('Pipeline mode: syncing only optimized outputs\n');
    dirs = PIPELINE_DIRS.map(d => path.join(ROOT, d)).filter(d => fs.existsSync(d));
  } else {
    dirs = ASSET_DIRS.map(d => path.join(ROOT, d)).filter(d => fs.existsSync(d));
  }

  const files = [];
  for (const dir of dirs) {
    files.push(...walk(dir));
  }

  console.log(`Found ${files.length} files to sync\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const filePath of files) {
    const relPath = path.relative(ROOT, filePath).split(path.sep).join('/');
    const category = inferCategory(relPath);

    const result = await uploadFile(filePath, relPath, category);
    if (result.success) {
      uploaded++;
      if (!DRY_RUN) {
        console.log(`  ✓ ${relPath} → ${result.data?.id || 'ok'}`);
      }
    } else {
      errors++;
      console.log(`  ✗ ${relPath}: ${result.error}`);
    }
  }

  console.log();
  console.log('═'.repeat(50));
  console.log(`Done. Uploaded: ${uploaded}, Errors: ${errors}, Skipped: ${skipped}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
