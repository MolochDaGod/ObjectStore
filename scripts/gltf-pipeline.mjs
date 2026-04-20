#!/usr/bin/env node
/**
 * gltf-pipeline.mjs — Grudge Studio glTF Asset Pipeline
 *
 * Single entry point for all 3D asset processing:
 *   convert   — FBX/OBJ/DAE → GLB
 *   optimize  — Dedup, compress, pack GLBs
 *   animations — Process animation FBXs into standalone GLB clips
 *   effects   — Bake effect textures into glTF material planes
 *   validate  — Spec-check all output GLBs + regenerate registries
 *   all       — Run full pipeline in order
 *
 * Usage:
 *   node scripts/gltf-pipeline.mjs all
 *   node scripts/gltf-pipeline.mjs convert --dry-run
 *   node scripts/gltf-pipeline.mjs optimize --category buildings
 *   node scripts/gltf-pipeline.mjs validate
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

// ── gltf-transform imports ─────────────────────────────────
import { NodeIO, Document, Buffer as GltfBuffer } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  flatten,
  prune,
  quantize,
  textureCompress,
  draco,
  weld,
  resample,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

// ── Constants ───────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const MODELS_DIR = path.join(ROOT, 'models');
const EFFECTS_DIR = path.join(ROOT, 'effects', '3d');
const CONVERTED_DIR = path.join(MODELS_DIR, '_converted');
const OPTIMIZED_DIR = path.join(MODELS_DIR, '_optimized');
const API_DIR = path.join(ROOT, 'api', 'v1');
const FBX2GLTF_BIN = path.join(ROOT, 'tools', 'bin', 'FBX2glTF-windows-x86_64', 'FBX2glTF-windows-x86_64.exe');
const KAYKIT_DIR = path.join(ROOT, 'KayKit_ResourceBits_1.0_FREE');

const MAX_TEXTURE_SIZE = 1024;
const SOURCE_EXTENSIONS = new Set(['.fbx', '.obj', '.dae']);
const GLTF_EXTENSIONS = new Set(['.gltf', '.glb']);

// ── CLI parsing ─────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0] || 'all';
const dryRun = args.includes('--dry-run');
const categoryFilter = args.find(a => a.startsWith('--category='))?.split('=')[1]
  || (args.indexOf('--category') >= 0 ? args[args.indexOf('--category') + 1] : null);
const verbose = args.includes('--verbose') || args.includes('-v');

// ── Stats ───────────────────────────────────────────────────
const stats = {
  converted: 0, skipped: 0, optimized: 0,
  animations: 0, effects: 0, validated: 0,
  errors: 0, savedBytes: 0,
};

// ── Helpers ─────────────────────────────────────────────────
function log(msg) { console.log(`[pipeline] ${msg}`); }
function warn(msg) { console.warn(`[pipeline] ⚠ ${msg}`); }
function err(msg) { console.error(`[pipeline] ✖ ${msg}`); stats.errors++; }
function vlog(msg) { if (verbose) console.log(`  ${msg}`); }

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function walkDir(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith('_')) continue; // skip pipeline output dirs
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, exts));
    } else if (exts.has(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

function getCategory(filePath) {
  const rel = path.relative(MODELS_DIR, filePath).replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.length > 1) {
    return parts[0]
      .replace(/_/g, '-')
      .replace(/\s+/g, '-')
      .replace(/\.\d+.*$/, '') // strip version suffixes like .1.0_FREE
      .toLowerCase();
  }
  return 'uncategorized';
}

function isNewer(src, dest) {
  if (!fs.existsSync(dest)) return true;
  return fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs;
}

function fileSizeKB(p) {
  try { return Math.round(fs.statSync(p).size / 1024); } catch { return 0; }
}

function md5(filePath) {
  const data = fs.readFileSync(filePath);
  return createHash('md5').update(data).digest('hex');
}

// ── Create shared IO instance ───────────────────────────────
async function createIO() {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });
  return io;
}

// ═══════════════════════════════════════════════════════════
// STEP 1: CONVERT — FBX/OBJ/DAE → GLB
// ═══════════════════════════════════════════════════════════
async function runConvert() {
  log('═══ CONVERT: FBX/OBJ/DAE → GLB ═══');
  ensureDir(CONVERTED_DIR);

  // Scan models/ and KayKit root
  const searchDirs = [MODELS_DIR];
  if (fs.existsSync(KAYKIT_DIR)) searchDirs.push(KAYKIT_DIR);

  const sourceFiles = [];
  for (const dir of searchDirs) {
    sourceFiles.push(...walkDir(dir, SOURCE_EXTENSIONS));
  }

  log(`Found ${sourceFiles.length} source files to convert`);

  for (const srcPath of sourceFiles) {
    const ext = path.extname(srcPath).toLowerCase();
    const baseName = path.basename(srcPath, ext);
    const relDir = path.relative(ROOT, path.dirname(srcPath)).replace(/\\/g, '/');

    // Flatten output: category/name.glb
    const category = srcPath.startsWith(MODELS_DIR)
      ? getCategory(srcPath)
      : relDir.split('/')[0].replace(/_/g, '-').toLowerCase();
    const outDir = path.join(CONVERTED_DIR, category);
    const outPath = path.join(outDir, `${baseName}.glb`);

    if (categoryFilter && !category.includes(categoryFilter)) continue;

    if (!isNewer(srcPath, outPath)) {
      stats.skipped++;
      vlog(`SKIP (up-to-date): ${baseName}`);
      continue;
    }

    ensureDir(outDir);

    try {
      if (ext === '.fbx' || ext === '.dae') {
        // Use FBX2glTF
        if (!fs.existsSync(FBX2GLTF_BIN)) {
          warn(`FBX2glTF not found at ${FBX2GLTF_BIN} — skipping ${baseName}`);
          continue;
        }
        if (dryRun) {
          log(`DRY: Would convert ${baseName}${ext} → GLB`);
          stats.converted++;
          continue;
        }
        const tmpOut = outPath.replace('.glb', ''); // FBX2glTF appends .glb
        execFileSync(FBX2GLTF_BIN, [
          '--binary',
          '--input', srcPath,
          '--output', tmpOut,
        ], { timeout: 120000, stdio: verbose ? 'inherit' : 'pipe' });

        // FBX2glTF may output as tmpOut.glb or tmpOut_out/
        const expectedGlb = tmpOut + '.glb';
        if (fs.existsSync(expectedGlb) && expectedGlb !== outPath) {
          fs.renameSync(expectedGlb, outPath);
        }

        if (fs.existsSync(outPath)) {
          stats.converted++;
          process.stdout.write('C');
        } else {
          warn(`Conversion produced no output: ${baseName}`);
        }
      } else if (ext === '.obj') {
        // Use obj2gltf
        if (dryRun) {
          log(`DRY: Would convert ${baseName}.obj → GLB`);
          stats.converted++;
          continue;
        }
        const obj2gltf = (await import('obj2gltf')).default;
        const glb = await obj2gltf(srcPath, { binary: true });
        fs.writeFileSync(outPath, glb);
        stats.converted++;
        process.stdout.write('C');
      }
    } catch (e) {
      err(`Convert failed: ${baseName}${ext} — ${e.message}`);
      process.stdout.write('E');
    }
  }

  console.log('');
  log(`Converted: ${stats.converted} | Skipped: ${stats.skipped} | Errors: ${stats.errors}`);
}

// ═══════════════════════════════════════════════════════════
// STEP 2: OPTIMIZE — Dedup, compress, pack GLBs
// ═══════════════════════════════════════════════════════════
async function runOptimize() {
  log('═══ OPTIMIZE: Dedup, compress, pack ═══');
  ensureDir(OPTIMIZED_DIR);

  const io = await createIO();

  // Gather all GLB/GLTF files from _converted + original models dirs
  const glbFiles = [
    ...walkDir(CONVERTED_DIR, GLTF_EXTENSIONS),
    ...walkDir(MODELS_DIR, GLTF_EXTENSIONS),
  ];

  // Also include KayKit gltf files
  if (fs.existsSync(KAYKIT_DIR)) {
    glbFiles.push(...walkDir(KAYKIT_DIR, GLTF_EXTENSIONS));
  }

  // Deduplicate by basename (prefer _converted version)
  const seen = new Map();
  for (const f of glbFiles) {
    const key = path.basename(f).toLowerCase();
    if (!seen.has(key) || f.includes('_converted')) {
      seen.set(key, f);
    }
  }
  const uniqueFiles = [...seen.values()];
  log(`Found ${uniqueFiles.length} unique GLB/GLTF files to optimize`);

  for (const srcPath of uniqueFiles) {
    const baseName = path.basename(srcPath, path.extname(srcPath));

    // Determine category
    let category;
    if (srcPath.startsWith(CONVERTED_DIR)) {
      const rel = path.relative(CONVERTED_DIR, srcPath);
      category = rel.split(/[/\\]/)[0];
    } else if (srcPath.startsWith(MODELS_DIR)) {
      category = getCategory(srcPath);
    } else {
      category = 'kaykit-resourcebits';
    }

    if (categoryFilter && !category.includes(categoryFilter)) continue;

    const outDir = path.join(OPTIMIZED_DIR, category);
    const outPath = path.join(outDir, `${baseName}.glb`);

    if (!isNewer(srcPath, outPath)) {
      stats.skipped++;
      vlog(`SKIP (up-to-date): ${baseName}`);
      continue;
    }

    ensureDir(outDir);

    if (dryRun) {
      log(`DRY: Would optimize ${baseName}`);
      stats.optimized++;
      continue;
    }

    try {
      const doc = await io.read(srcPath);
      const origSize = fileSizeKB(srcPath);

      // 1. Weld vertices
      await doc.transform(weld());

      // 2. Deduplicate accessors, textures, materials
      await doc.transform(dedup());

      // 3. Flatten scene graph
      await doc.transform(flatten());

      // 4. Prune unused data
      await doc.transform(prune());

      // 5. Resample animation keyframes
      await doc.transform(resample());

      // 6. Compress textures via sharp (resize >1024px)
      const textures = doc.getRoot().listTextures();
      for (const tex of textures) {
        const img = tex.getImage();
        if (!img) continue;
        try {
          const meta = await sharp(img).metadata();
          if (meta.width > MAX_TEXTURE_SIZE || meta.height > MAX_TEXTURE_SIZE) {
            const resized = await sharp(img)
              .resize(MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .png({ quality: 85 })
              .toBuffer();
            tex.setImage(resized);
            tex.setMimeType('image/png');
          }
        } catch {
          // Some textures may not be parseable by sharp
        }
      }

      // 7. Quantize attribute data
      await doc.transform(quantize());

      // 8. Draco compress geometry
      await doc.transform(
        draco({
          quantizePosition: 14,
          quantizeNormal: 10,
          quantizeTexcoord: 12,
          quantizeColor: 8,
        })
      );

      // 9. Write optimized GLB
      await io.write(outPath, doc);

      const newSize = fileSizeKB(outPath);
      const saved = origSize - newSize;
      stats.savedBytes += Math.max(0, saved * 1024);
      stats.optimized++;

      const pct = origSize > 0 ? Math.round((1 - newSize / origSize) * 100) : 0;
      vlog(`${baseName}: ${origSize}KB → ${newSize}KB (${pct}% smaller)`);
      process.stdout.write('O');
    } catch (e) {
      err(`Optimize failed: ${baseName} — ${e.message}`);
      process.stdout.write('E');
    }
  }

  console.log('');
  log(`Optimized: ${stats.optimized} | Saved: ${(stats.savedBytes / 1024 / 1024).toFixed(1)} MB`);
}

// ═══════════════════════════════════════════════════════════
// STEP 3: ANIMATIONS — FBX anim clips → standalone GLBs
// ═══════════════════════════════════════════════════════════
async function runAnimations() {
  log('═══ ANIMATIONS: FBX clips → GLB ═══');

  const animDir = path.join(MODELS_DIR, 'animations');
  if (!fs.existsSync(animDir)) {
    log('No animations/ directory found — skipping');
    return;
  }

  const io = await createIO();
  const fbxFiles = walkDir(animDir, new Set(['.fbx']));
  log(`Found ${fbxFiles.length} animation FBX files`);

  const animRegistry = [];

  for (const srcPath of fbxFiles) {
    const baseName = path.basename(srcPath, '.fbx');
    const relDir = path.relative(animDir, path.dirname(srcPath)).replace(/\\/g, '/');
    const weaponType = relDir || 'general';
    const category = weaponType.replace(/\s+/g, '-').toLowerCase();

    const outDir = path.join(OPTIMIZED_DIR, 'animations', category);
    const convertedPath = path.join(CONVERTED_DIR, 'animations', category, `${baseName}.glb`);
    const outPath = path.join(outDir, `${baseName}.glb`);

    ensureDir(path.dirname(convertedPath));
    ensureDir(outDir);

    if (!isNewer(srcPath, outPath)) {
      // Still register it
      if (fs.existsSync(outPath)) {
        animRegistry.push({
          name: baseName,
          weaponType: category,
          path: `models/_optimized/animations/${category}/${baseName}.glb`,
          sizeKB: fileSizeKB(outPath),
        });
      }
      stats.skipped++;
      continue;
    }

    if (dryRun) {
      log(`DRY: Would process animation ${baseName}`);
      stats.animations++;
      continue;
    }

    try {
      // Step 1: Convert FBX → GLB
      if (!fs.existsSync(FBX2GLTF_BIN)) {
        warn('FBX2glTF not found — skipping animation conversion');
        continue;
      }

      const tmpOut = convertedPath.replace('.glb', '');
      execFileSync(FBX2GLTF_BIN, [
        '--binary',
        '--input', srcPath,
        '--output', tmpOut,
      ], { timeout: 120000, stdio: verbose ? 'inherit' : 'pipe' });

      const expectedGlb = tmpOut + '.glb';
      if (fs.existsSync(expectedGlb) && expectedGlb !== convertedPath) {
        fs.renameSync(expectedGlb, convertedPath);
      }

      if (!fs.existsSync(convertedPath)) {
        warn(`Animation conversion produced no output: ${baseName}`);
        continue;
      }

      // Step 2: Optimize — strip heavy mesh data, keep skeleton + animations
      const doc = await io.read(convertedPath);

      // Remove mesh primitives to save space (keep skeleton for retargeting)
      const meshes = doc.getRoot().listMeshes();
      for (const mesh of meshes) {
        const prims = mesh.listPrimitives();
        for (const prim of prims) {
          prim.dispose();
        }
      }

      await doc.transform(dedup(), prune(), quantize());
      await io.write(outPath, doc);

      // Extract animation metadata
      const animations = doc.getRoot().listAnimations();
      const animMeta = animations.map(a => ({
        clipName: a.getName() || baseName,
        channelCount: a.listChannels().length,
      }));

      animRegistry.push({
        name: baseName,
        weaponType: category,
        path: `models/_optimized/animations/${category}/${baseName}.glb`,
        sizeKB: fileSizeKB(outPath),
        clips: animMeta,
      });

      stats.animations++;
      process.stdout.write('A');
    } catch (e) {
      err(`Animation failed: ${baseName} — ${e.message}`);
      process.stdout.write('E');
    }
  }

  // Write animation registry
  const registryOut = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalAnimations: animRegistry.length,
    animations: animRegistry,
  };
  ensureDir(API_DIR);
  fs.writeFileSync(
    path.join(API_DIR, 'animations-gltf.json'),
    JSON.stringify(registryOut, null, 2)
  );

  console.log('');
  log(`Animations processed: ${stats.animations}`);
}

// ═══════════════════════════════════════════════════════════
// STEP 4: EFFECTS — Bake textures into material planes
// ═══════════════════════════════════════════════════════════
async function runEffects() {
  log('═══ EFFECTS: Texture → Material Plane GLBs ═══');

  if (!fs.existsSync(EFFECTS_DIR)) {
    log('No effects/3d/ directory found — skipping');
    return;
  }

  const io = await createIO();

  // Scan effect texture categories
  const categories = fs.readdirSync(EFFECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'materials')
    .map(d => d.name);

  log(`Effect categories: ${categories.join(', ')}`);

  for (const cat of categories) {
    if (categoryFilter && !cat.includes(categoryFilter)) continue;

    const catDir = path.join(EFFECTS_DIR, cat);
    const texFiles = fs.readdirSync(catDir)
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

    for (const texFile of texFiles) {
      const baseName = path.basename(texFile, path.extname(texFile));
      const outDir = path.join(OPTIMIZED_DIR, 'effects', cat);
      const outPath = path.join(outDir, `${baseName}.glb`);
      const texPath = path.join(catDir, texFile);

      if (!isNewer(texPath, outPath)) {
        stats.skipped++;
        continue;
      }

      ensureDir(outDir);

      if (dryRun) {
        log(`DRY: Would bake effect ${cat}/${baseName}`);
        stats.effects++;
        continue;
      }

      try {
        // Create a glTF document with a single quad + emissive material
        const doc = new Document();

        // Read and optionally resize texture
        let imgBuffer = fs.readFileSync(texPath);
        const meta = await sharp(imgBuffer).metadata();
        if (meta.width > MAX_TEXTURE_SIZE || meta.height > MAX_TEXTURE_SIZE) {
          imgBuffer = await sharp(imgBuffer)
            .resize(MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .png()
            .toBuffer();
        }

        // Create texture
        const texture = doc.createTexture(baseName)
          .setImage(imgBuffer)
          .setMimeType('image/png');

        // Create emissive material (additive blending friendly for particles)
        const material = doc.createMaterial(baseName)
          .setEmissiveTexture(texture)
          .setEmissiveFactor([1, 1, 1])
          .setAlphaMode('BLEND')
          .setDoubleSided(true);

        // Create quad mesh (1x1 plane)
        const positions = new Float32Array([
          -0.5, -0.5, 0,
           0.5, -0.5, 0,
           0.5,  0.5, 0,
          -0.5,  0.5, 0,
        ]);
        const uvs = new Float32Array([
          0, 0,
          1, 0,
          1, 1,
          0, 1,
        ]);
        const normals = new Float32Array([
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
        ]);
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

        const buffer = doc.createBuffer();

        const posAccessor = doc.createAccessor()
          .setType('VEC3')
          .setArray(positions)
          .setBuffer(buffer);

        const uvAccessor = doc.createAccessor()
          .setType('VEC2')
          .setArray(uvs)
          .setBuffer(buffer);

        const normalAccessor = doc.createAccessor()
          .setType('VEC3')
          .setArray(normals)
          .setBuffer(buffer);

        const indexAccessor = doc.createAccessor()
          .setType('SCALAR')
          .setArray(indices)
          .setBuffer(buffer);

        const prim = doc.createPrimitive()
          .setAttribute('POSITION', posAccessor)
          .setAttribute('TEXCOORD_0', uvAccessor)
          .setAttribute('NORMAL', normalAccessor)
          .setIndices(indexAccessor)
          .setMaterial(material);

        const mesh = doc.createMesh(baseName).addPrimitive(prim);
        const node = doc.createNode(baseName).setMesh(mesh);
        const scene = doc.createScene('Effect').addChild(node);

        await io.write(outPath, doc);
        stats.effects++;
        process.stdout.write('F');
      } catch (e) {
        err(`Effect failed: ${cat}/${baseName} — ${e.message}`);
        process.stdout.write('E');
      }
    }
  }

  console.log('');
  log(`Effects baked: ${stats.effects}`);
}

// ═══════════════════════════════════════════════════════════
// STEP 5: VALIDATE & REGISTRY
// ═══════════════════════════════════════════════════════════
async function runValidate() {
  log('═══ VALIDATE & REGISTRY ═══');

  const allGlbs = walkDir(OPTIMIZED_DIR, new Set(['.glb']));
  log(`Found ${allGlbs.length} optimized GLBs to validate`);

  const io = await createIO();
  const models = [];
  const errors = [];

  for (const glbPath of allGlbs) {
    const baseName = path.basename(glbPath, '.glb');
    const relPath = path.relative(ROOT, glbPath).replace(/\\/g, '/');
    const rel = path.relative(OPTIMIZED_DIR, glbPath).replace(/\\/g, '/');
    const parts = rel.split('/');
    const category = parts.length > 1 ? parts[0] : 'uncategorized';

    try {
      // Validate by reading — gltf-transform will throw on spec violations
      const doc = await io.read(glbPath);
      const root = doc.getRoot();

      const meshCount = root.listMeshes().length;
      const nodeCount = root.listNodes().length;
      const texCount = root.listTextures().length;
      const animCount = root.listAnimations().length;
      const matCount = root.listMaterials().length;

      // Check for required extensions
      const extensions = doc.getRoot().listExtensionsUsed().map(e => e.extensionName);

      const sizeKB = fileSizeKB(glbPath);
      const checksum = md5(glbPath);

      models.push({
        name: baseName + '.glb',
        format: 'GLB',
        path: relPath,
        category,
        sizeKB,
        checksum,
        pipelineVersion: '1.0.0',
        compressionType: extensions.includes('KHR_draco_mesh_compression') ? 'draco' : 'none',
        meshes: meshCount,
        nodes: nodeCount,
        textures: texCount,
        animations: animCount,
        materials: matCount,
        extensions,
      });

      stats.validated++;
      process.stdout.write('V');
    } catch (e) {
      errors.push({ file: relPath, error: e.message });
      err(`Validation failed: ${baseName} — ${e.message}`);
      process.stdout.write('E');
    }
  }

  console.log('');

  // Sort by category then name
  models.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  // Build category summary
  const byCategory = {};
  const byFormat = { GLB: models.length };
  for (const m of models) {
    byCategory[m.category] = (byCategory[m.category] || 0) + 1;
  }

  // Write models3d.json (replaces old registry)
  const modelsRegistry = {
    version: '2.0.0',
    pipelineVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalModels: models.length,
    byFormat,
    byCategory,
    models,
  };

  ensureDir(API_DIR);
  fs.writeFileSync(
    path.join(API_DIR, 'models3d.json'),
    JSON.stringify(modelsRegistry, null, 2)
  );

  // Write gltf-manifest.json (checksums for cache busting)
  const manifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalAssets: models.length,
    totalSizeKB: models.reduce((sum, m) => sum + m.sizeKB, 0),
    assets: models.map(m => ({
      path: m.path,
      checksum: m.checksum,
      sizeKB: m.sizeKB,
      category: m.category,
    })),
  };

  fs.writeFileSync(
    path.join(API_DIR, 'gltf-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  if (errors.length > 0) {
    log(`Validation errors (${errors.length}):`);
    for (const e of errors.slice(0, 20)) {
      console.log(`  ✖ ${e.file}: ${e.error}`);
    }
  }

  log(`Validated: ${stats.validated} | Errors: ${stats.errors}`);
  log(`Registry: api/v1/models3d.json (${models.length} models)`);
  log(`Manifest: api/v1/gltf-manifest.json (${manifest.totalSizeKB} KB total)`);
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  const startTime = Date.now();
  log(`Grudge glTF Pipeline v1.0.0`);
  log(`Command: ${command} ${dryRun ? '(DRY RUN)' : ''}`);
  log(`Root: ${ROOT}`);
  console.log('');

  switch (command) {
    case 'convert':
      await runConvert();
      break;
    case 'optimize':
      await runOptimize();
      break;
    case 'animations':
      await runAnimations();
      break;
    case 'effects':
      await runEffects();
      break;
    case 'validate':
      await runValidate();
      break;
    case 'all':
      await runConvert();
      console.log('');
      await runOptimize();
      console.log('');
      await runAnimations();
      console.log('');
      await runEffects();
      console.log('');
      await runValidate();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Usage: node scripts/gltf-pipeline.mjs [convert|optimize|animations|effects|validate|all]');
      console.log('Options: --dry-run --category=NAME --verbose');
      process.exit(1);
  }

  console.log('');
  log('═══ PIPELINE SUMMARY ═══');
  log(`Converted:  ${stats.converted}`);
  log(`Optimized:  ${stats.optimized}`);
  log(`Animations: ${stats.animations}`);
  log(`Effects:    ${stats.effects}`);
  log(`Validated:  ${stats.validated}`);
  log(`Skipped:    ${stats.skipped}`);
  log(`Errors:     ${stats.errors}`);
  log(`Saved:      ${(stats.savedBytes / 1024 / 1024).toFixed(1)} MB`);
  log(`Time:       ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
