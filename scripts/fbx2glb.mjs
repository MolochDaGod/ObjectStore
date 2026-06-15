#!/usr/bin/env node
/**
 * scripts/fbx2glb.mjs — Grudge Studio FBX → GLB Pipeline
 * Converts all FBX files in models/ to optimized GLB and optionally uploads to R2.
 *
 * Usage:
 *   node scripts/fbx2glb.mjs [--upload] [--dir models/animations/melee-axe]
 *
 * Requires:
 *   npm install -g @gltf-transform/cli
 *   pip install --break-system-packages FBX2glTF  (or use FBX2glTF binary)
 *
 * For Windows: download FBX2glTF.exe from https://github.com/facebookincubator/FBX2glTF
 * Place in scripts/bin/FBX2glTF[.exe]
 */
import { execSync, spawnSync } from 'child_process';
import { readdirSync, statSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, basename, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Config ────────────────────────────────────────────
const args = process.argv.slice(2);
const UPLOAD = args.includes('--upload');
const SPECIFIC_DIR = args[args.indexOf('--dir') + 1] || null;
const R2_BUCKET = process.env.R2_BUCKET || 'grudge-assets';
const CF_ACCOUNT = process.env.CF_ACCOUNT_ID || '';

// ── Find FBX2glTF binary ──────────────────────────────
function findFBX2glTF() {
  const candidates = [
    join(__dirname, 'bin', process.platform === 'win32' ? 'FBX2glTF.exe' : 'FBX2glTF'),
    'FBX2glTF',
    'fbx2gltf',
  ];
  for (const c of candidates) {
    try { execSync(`"${c}" --version 2>&1`, { stdio: 'pipe' }); return c; } catch {}
  }
  return null;
}

// ── Scan for FBX files ────────────────────────────────
function scanFBX(dir) {
  const results = [];
  const scan = (d) => {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (statSync(full).isDirectory()) { scan(full); continue; }
      if (extname(entry).toLowerCase() === '.fbx') results.push(full);
    }
  };
  scan(dir);
  return results;
}

// ── Convert one FBX → GLB ─────────────────────────────
function convertFBX(fbxPath, converter) {
  const outDir = join(ROOT, 'models', '_optimized',
    dirname(fbxPath).replace(ROOT, '').replace(/^[\\/]models[\\/]?/, ''));
  mkdirSync(outDir, { recursive: true });
  const outName = basename(fbxPath, '.fbx') + '.glb';
  const outPath = join(outDir, outName);

  console.log(`  Converting: ${basename(fbxPath)} → ${outPath.replace(ROOT, '')}`);

  const result = spawnSync(converter, [
    '--binary',
    '--input', fbxPath,
    '--output', outDir,
  ], { stdio: 'pipe' });

  if (result.status !== 0) {
    console.error(`  ❌ Failed: ${result.stderr?.toString()?.slice(0, 200)}`);
    return null;
  }

  // Optimize with gltf-transform if available
  try {
    execSync(`npx @gltf-transform/cli optimize "${outPath}" "${outPath}" --compress draco`, { stdio: 'pipe' });
    console.log(`  ✓ Draco compressed`);
  } catch { /* gltf-transform optional */ }

  const stat = statSync(outPath);
  console.log(`  ✅ ${outName} (${Math.round(stat.size / 1024)} KB)`);
  return { path: outPath, name: outName, sizeKB: Math.round(stat.size / 1024) };
}

// ── Upload to R2 ──────────────────────────────────────
function uploadToR2(localPath) {
  const key = localPath.replace(ROOT + '/', '').replace(/\\/g, '/');
  console.log(`  ☁ Uploading to R2: ${key}`);
  try {
    execSync(`npx wrangler r2 object put "${R2_BUCKET}/${key}" --file "${localPath}" --account-id "${CF_ACCOUNT}"`,
      { stdio: 'pipe' });
    console.log(`  ✅ Uploaded to R2`);
    return `https://assets.grudge-studio.com/${key}`;
  } catch (e) {
    console.error(`  ❌ Upload failed: ${e.message.slice(0, 100)}`);
    return null;
  }
}

// ── Regenerate models3d.json ──────────────────────────
function regenerateManifest(newModels) {
  const manifestPath = join(ROOT, 'api', 'v1', 'models3d.json');
  let manifest = { version: '2.0.0', models: [], byCategory: {} };
  try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch {}

  for (const m of newModels) {
    const rel = m.path.replace(ROOT + '/', '').replace(/\\/g, '/');
    const cat = rel.split('/').slice(2, 3)[0] || 'misc';
    const entry = {
      name: m.name,
      format: 'GLB',
      path: rel,
      _cdnUrl: m.r2Url || null,
      category: cat,
      sizeKB: m.sizeKB,
      animations: 0,
      meshes: 0,
      nodes: 0,
      compressionType: 'draco',
      pipelineVersion: '2.0.0',
      extensions: ['KHR_draco_mesh_compression'],
    };
    const existing = manifest.models.findIndex(x => x.path === rel);
    if (existing >= 0) manifest.models[existing] = entry;
    else manifest.models.push(entry);
    if (!manifest.byCategory[cat]) manifest.byCategory[cat] = [];
    if (!manifest.byCategory[cat].includes(m.name)) manifest.byCategory[cat].push(m.name);
  }
  manifest.generated = new Date().toISOString();
  manifest.totalModels = manifest.models.length;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Manifest updated: ${manifest.models.length} models`);
}

// ── Main ──────────────────────────────────────────────
async function main() {
  console.log('\n⚔️  Grudge Studio FBX → GLB Pipeline\n');

  const converter = findFBX2glTF();
  if (!converter) {
    console.error(`❌ FBX2glTF not found.
  
  Install options:
  • Windows: Download FBX2glTF.exe from https://github.com/facebookincubator/FBX2glTF/releases
    Place in scripts/bin/FBX2glTF.exe
  • macOS/Linux: brew install fbx2gltf  OR  npm install -g fbx2gltf
  `);
    process.exit(1);
  }
  console.log(`✓ Converter: ${converter}\n`);

  const scanDir = SPECIFIC_DIR ? join(ROOT, SPECIFIC_DIR) : join(ROOT, 'models');
  const fbxFiles = scanFBX(scanDir);
  console.log(`Found ${fbxFiles.length} FBX files in ${scanDir.replace(ROOT, '')}\n`);

  if (!fbxFiles.length) {
    console.log('No FBX files found. Exiting.');
    return;
  }

  const converted = [];
  for (const fbx of fbxFiles) {
    const result = convertFBX(fbx, converter);
    if (result) {
      if (UPLOAD && CF_ACCOUNT) {
        result.r2Url = uploadToR2(result.path);
      }
      converted.push(result);
    }
  }

  console.log(`\n✅ Converted ${converted.length}/${fbxFiles.length} files`);
  regenerateManifest(converted);

  if (UPLOAD && !CF_ACCOUNT) {
    console.log('\n⚠️  Set CF_ACCOUNT_ID env var to enable R2 upload');
  }

  console.log('\nNext steps:');
  console.log('  1. Review models/_optimized/ for converted GLBs');
  console.log('  2. Run: node scripts/fbx2glb.mjs --upload  (to push to R2)');
  console.log('  3. Commit api/v1/models3d.json to update the manifest');
}

main().catch(console.error);
