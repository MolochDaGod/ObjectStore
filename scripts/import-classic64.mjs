/**
 * import-classic64.mjs
 *
 * Full pipeline for Classic 64 Asset Pack:
 *   1. Extracts the zip (0.3 or 0.6)
 *   2. Converts all .blend files → .glb via Blender headless
 *   3. Uploads all GLBs + PNGs/JPGs to objectstore.grudge-studio.com
 *
 * Usage:
 *   node scripts/import-classic64.mjs                  # uses 0.6 zip
 *   node scripts/import-classic64.mjs --zip 0.3        # uses 0.3 zip
 *   node scripts/import-classic64.mjs --skip-convert   # skip blend→glb, upload textures only
 *   node scripts/import-classic64.mjs --dry-run        # preview only, no uploads
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import AdmZip from 'adm-zip';

// ── Config ──────────────────────────────────────────────────────────
const BLENDER_EXE   = 'D:\\Gamewithall\\Blender\\blender.exe';
const BLEND_SCRIPT  = path.resolve('scripts/blend-to-glb.py');
const WORKER_URL    = 'https://objectstore.grudge-studio.com';
const API_KEY       = process.env.OBJECTSTORE_API_KEY || process.env.INTERNAL_API_KEY;
const OUT_DIR       = path.resolve('_classic64_converted');

const ZIP_PATHS = {
  '0.3': 'C:\\Users\\nugye\\Documents\\- Classic 64 Asset Pack 0.3.zip',
  '0.6': 'C:\\Users\\nugye\\Documents\\- Classic 64 Asset Pack 0.6.zip',
};
const EXTRACTED_06  = 'C:\\Users\\nugye\\Documents\\- Classic 64 Asset Pack 0.6';

// ── Args ────────────────────────────────────────────────────────────
const args         = process.argv.slice(2);
const versionArg   = args.includes('--zip') ? args[args.indexOf('--zip') + 1] : '0.6';
const skipConvert  = args.includes('--skip-convert');
const dryRun       = args.includes('--dry-run');
const onlyTextures = args.includes('--textures-only');

// ── Helpers ──────────────────────────────────────────────────────────
function log(msg, type = 'info') {
  const prefix = { info: '→', ok: '✓', warn: '⚠', err: '✗' }[type] || '·';
  console.log(`${prefix} ${msg}`);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)}KB`;
  return `${(bytes/1024/1024).toFixed(1)}MB`;
}

/** Map folder name → objectstore category */
function folderToCategory(folderName) {
  const map = {
    'Bricks': '3d-textures', 'Concrete': '3d-textures', 'Metal': '3d-textures',
    'Wood': '3d-textures',   'Tiles': '3d-textures',    'Ground': '3d-textures',
    'Rock': '3d-textures',   'Rocks': '3d-textures',    'Road': '3d-textures',
    'Roof': '3d-textures',   'Floor': '3d-textures',    'Walls': '3d-textures',
    'Panels': '3d-textures', 'Water': '3d-textures',    'Materials': '3d-textures',
    'Colors': '3d-textures',
    'Buildings': '3d-models', 'Doors': '3d-models',     'Windows': '3d-models',
    'Shelves': '3d-models',   'Boxes': '3d-models',     'Signs': '3d-models',
    'Vehicles': '3d-models',  'Units': '3d-models',     'Industrial': '3d-models',
    'Electrical': '3d-models','Tools': '3d-models',     'Misc': '3d-models',
    'Art': '3d-models',
    'Nature': 'nature-assets', 'Food': 'food-assets',
    'Gems': 'items',          'Products': 'items',       'Papers': 'items',
  };
  return map[folderName] || '3d-models';
}

// ── Step 1: Extract zip ──────────────────────────────────────────────
async function extractPack() {
  // Use already-extracted 0.6 if it exists and we're on 0.6
  if (versionArg === '0.6' && fs.existsSync(EXTRACTED_06)) {
    log(`Using already-extracted folder: ${EXTRACTED_06}`, 'ok');
    return EXTRACTED_06;
  }

  const zipPath = ZIP_PATHS[versionArg];
  if (!zipPath || !fs.existsSync(zipPath)) {
    throw new Error(`Zip not found: ${zipPath}`);
  }

  const extractTo = path.join('C:\\Users\\nugye\\Documents', `_classic64_${versionArg}_extracted`);
  log(`Extracting ${path.basename(zipPath)} (${formatSize(fs.statSync(zipPath).size)})…`);

  if (!dryRun) {
    if (!fs.existsSync(extractTo)) fs.mkdirSync(extractTo, { recursive: true });
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractTo, true);
  }

  log(`Extracted to: ${extractTo}`, 'ok');
  return extractTo;
}

// ── Step 2: Inventory files ──────────────────────────────────────────
function inventoryFiles(rootDir) {
  const blends = [], textures = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.blend') blends.push(full);
      else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) textures.push(full);
    }
  }
  walk(rootDir);
  return { blends, textures };
}

// ── Step 3: Convert .blend → .glb ────────────────────────────────────
async function convertBlends(blendFiles, rootDir) {
  if (!fs.existsSync(BLENDER_EXE)) {
    log(`Blender not found at ${BLENDER_EXE} — skipping conversion`, 'warn');
    return [];
  }

  const glbFiles = [];
  let done = 0;

  for (const blendPath of blendFiles) {
    const rel      = path.relative(rootDir, blendPath);
    const parts    = rel.split(path.sep);
    const category = parts[0] || 'misc';
    const name     = path.basename(blendPath, '.blend');
    const outPath  = path.join(OUT_DIR, category, `${name}.glb`);

    log(`[${++done}/${blendFiles.length}] ${rel} → ${path.relative(process.cwd(), outPath)}`);

    if (dryRun) { glbFiles.push({ glbPath: outPath, category, name }); continue; }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const result = spawnSync(BLENDER_EXE, [
      '--background', blendPath,
      '--python', BLEND_SCRIPT,
      '--', outPath,
    ], { encoding: 'utf8', timeout: 60_000 });

    if (result.status !== 0 || !fs.existsSync(outPath)) {
      log(`  Failed: ${result.stderr?.slice(-200) || 'unknown error'}`, 'err');
      continue;
    }

    const size = fs.statSync(outPath).size;
    log(`  ${formatSize(size)} GLB`, 'ok');
    glbFiles.push({ glbPath: outPath, category, name });
  }

  return glbFiles;
}

// ── Step 4: Upload to ObjectStore worker ─────────────────────────────
async function uploadFile(filePath, category, tags = []) {
  if (dryRun) { log(`[dry] would upload ${path.basename(filePath)} → ${category}`); return null; }

  if (!API_KEY) {
    log('No API key — set OBJECTSTORE_API_KEY in .env', 'err');
    process.exit(1);
  }

  const filename = path.basename(filePath);
  const ext      = path.extname(filename).toLowerCase();
  const mimeMap  = { '.glb': 'model/gltf-binary', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
  const mime     = mimeMap[ext] || 'application/octet-stream';

  // Use raw body upload (fastest — metadata in headers)
  const fileBuffer = fs.readFileSync(filePath);
  const res = await fetch(`${WORKER_URL}/v1/assets`, {
    method: 'POST',
    headers: {
      'x-api-key':   API_KEY,
      'x-filename':  filename,
      'x-category':  category,
      'x-tags':      JSON.stringify(['classic64', 'n64-style', ...tags]),
      'x-metadata':  JSON.stringify({ pack: 'classic-64-asset-pack', version: versionArg }),
      'x-visibility': 'public',
      'Content-Type': mime,
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const err = await res.text();
    log(`  Upload failed (${res.status}): ${err.slice(0, 120)}`, 'err');
    return null;
  }

  return await res.json();
}

async function uploadBatch(files, getCategoryFn, extraTags = []) {
  let ok = 0, fail = 0;
  for (const f of files) {
    const cat = getCategoryFn(f);
    process.stdout.write(`  ↑ ${path.basename(f)}…`);
    const result = await uploadFile(f, cat, extraTags);
    if (result) { process.stdout.write(` ✓ (${result.id?.slice(0, 8)})\n`); ok++; }
    else { process.stdout.write(` ✗\n`); fail++; }
    // Small delay to avoid hammering the worker
    await new Promise(r => setTimeout(r, 80));
  }
  return { ok, fail };
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log(`║  Classic 64 Asset Pack Import v${versionArg}     ║`);
  console.log('╚══════════════════════════════════════════╝\n');

  if (dryRun) log('DRY RUN — no files will be uploaded', 'warn');
  if (!API_KEY) log('Warning: OBJECTSTORE_API_KEY not set — uploads will fail', 'warn');

  // 1. Extract
  const rootDir = await extractPack();

  // 2. Inventory
  const { blends, textures } = inventoryFiles(rootDir);
  log(`Found: ${blends.length} .blend files, ${textures.length} textures`);

  const stats = { blends: blends.length, textures: textures.length, converted: 0, uploaded: 0, failed: 0 };

  // 3. Convert .blend → .glb
  if (!skipConvert && !onlyTextures && blends.length > 0) {
    log('\n── Converting .blend → .glb ──');
    const glbFiles = await convertBlends(blends, rootDir);
    stats.converted = glbFiles.length;
    log(`Converted: ${glbFiles.length}/${blends.length}`, glbFiles.length > 0 ? 'ok' : 'warn');

    // 4a. Upload GLBs
    if (glbFiles.length > 0) {
      log('\n── Uploading GLBs ──');
      const { ok, fail } = await uploadBatch(
        glbFiles.map(f => f.glbPath),
        (f) => {
          const parts = path.relative(OUT_DIR, f).split(path.sep);
          return folderToCategory(parts[0]);
        },
        ['3d-model', 'glb']
      );
      stats.uploaded += ok;
      stats.failed   += fail;
    }
  }

  // 4b. Upload textures
  if (!onlyTextures && textures.length > 0 || onlyTextures) {
    log('\n── Uploading textures ──');
    const { ok, fail } = await uploadBatch(
      textures,
      (f) => {
        const rel   = path.relative(rootDir, f);
        const parts = rel.split(path.sep);
        return folderToCategory(parts[0]);
      },
      ['texture', 'classic64']
    );
    stats.uploaded += ok;
    stats.failed   += fail;
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  COMPLETE                                ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`  .blend files found : ${stats.blends}`);
  console.log(`  GLBs converted     : ${stats.converted}`);
  console.log(`  Textures found     : ${stats.textures}`);
  console.log(`  Uploaded           : ${stats.uploaded}`);
  console.log(`  Failed             : ${stats.failed}`);
  console.log(`\n  Browse at: https://molochdagod.github.io/ObjectStore/asset-browser.html\n`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
