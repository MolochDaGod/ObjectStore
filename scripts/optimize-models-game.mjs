#!/usr/bin/env node
/**
 * Produce game-ready GLBs: embed textures, compress, Draco-pack meshes.
 * Output: models/_game-ready/** (mirrors source tree)
 */
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, flatten, prune, quantize, resample, weld, draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import {
  API_DIR,
  GAME_READY_DIR,
  ROOT,
  analyzeTextureStatus,
  classifyModel,
  ensureDir,
  extractGltfCounts,
  fileSizeKB,
  gameReadyRelPath,
  isNewer,
  loadRegistry,
  parseGlbJson,
} from './lib/model-game-utils.mjs';
import {
  getAtlasTexture,
  isPlaceholderDataUri,
  isPlaceholderImageBuffer,
  preloadWeaponAtlases,
  resolveWeaponAtlasKey,
} from './lib/texture-atlas-cache.mjs';

const MAX_TEXTURE_SIZE = 1024;
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const categoryFilter = args.find((a) => a.startsWith('--category='))?.split('=')[1]
  || (args.indexOf('--category') >= 0 ? args[args.indexOf('--category') + 1] : null);
const verbose = args.includes('--verbose') || args.includes('-v');
const stats = { optimized: 0, skipped: 0, errors: 0, savedKB: 0 };

function log(msg) { console.log(`[optimize:models] ${msg}`); }
function vlog(msg) { if (verbose) console.log(`  ${msg}`); }

async function createIO() {
  return new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });
}

async function embedExternalTextures(doc, glbPath, glbJson) {
  const root = doc.getRoot();
  const textures = root.listTextures();
  const textureInfo = analyzeTextureStatus(glbPath, glbJson);
  for (const { uri, path: texPath } of textureInfo.resolvedTextures || []) {
    const imgBuffer = fs.readFileSync(texPath);
    const tex = textures.find((t) => t.getURI() === uri) || textures.find((t) => !t.getImage());
    if (!tex) continue;
    let processed = imgBuffer;
    try {
      const meta = await sharp(imgBuffer).metadata();
      if ((meta.width || 0) > MAX_TEXTURE_SIZE || (meta.height || 0) > MAX_TEXTURE_SIZE) {
        processed = await sharp(imgBuffer)
          .resize(MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 90, compressionLevel: 9 })
          .toBuffer();
      } else if (!/\.png$/i.test(texPath)) {
        processed = await sharp(imgBuffer).png({ quality: 90, compressionLevel: 9 }).toBuffer();
      }
    } catch { processed = imgBuffer; }
    tex.setImage(processed);
    tex.setMimeType('image/png');
    tex.setURI('');
  }
}

async function replacePlaceholderTextures(doc, entry, glbJson) {
  const root = doc.getRoot();
  const textures = root.listTextures();
  if (!textures.length) return false;

  let replaced = false;
  const atlasKey = entry.path?.includes('/weapons/')
    ? resolveWeaponAtlasKey(entry.name, entry.path)
    : null;

  for (const tex of textures) {
    const uri = tex.getURI();
    const img = tex.getImage();
    const isPlaceholder = isPlaceholderDataUri(uri) || isPlaceholderImageBuffer(img);
    if (!isPlaceholder) continue;
    if (!atlasKey) continue;

    const atlas = await getAtlasTexture(atlasKey);
    tex.setImage(atlas.buffer);
    tex.setMimeType(atlas.mimeType);
    tex.setURI('');
    replaced = true;
  }

  if (replaced) {
    for (const mat of root.listMaterials()) {
      if (!mat.getBaseColorFactor() || mat.getBaseColorFactor().every((v, i) => (i < 3 ? v === 1 : v === 1))) {
        mat.setBaseColorFactor([1, 1, 1, 1]);
      }
    }
  }
  return replaced;
}

async function resizeEmbeddedTextures(doc) {
  for (const tex of doc.getRoot().listTextures()) {
    const img = tex.getImage();
    if (!img) continue;
    try {
      const meta = await sharp(img).metadata();
      if ((meta.width || 0) <= MAX_TEXTURE_SIZE && (meta.height || 0) <= MAX_TEXTURE_SIZE) continue;
      const resized = await sharp(img)
        .resize(MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer();
      tex.setImage(resized);
      tex.setMimeType('image/png');
    } catch { /* keep */ }
  }
}

async function stripMeshesForClip(doc) {
  for (const mesh of [...doc.getRoot().listMeshes()]) {
    for (const node of doc.getRoot().listNodes()) {
      if (node.getMesh() === mesh) node.setMesh(null);
    }
    mesh.dispose();
  }
}

async function optimizeModel(io, entry) {
  const relPath = (entry.path || '').replace(/\\/g, '/');
  if (!relPath.toLowerCase().endsWith('.glb')) { stats.skipped += 1; return null; }
  if (categoryFilter && !relPath.includes(`/${categoryFilter}/`) && entry.category !== categoryFilter) {
    stats.skipped += 1;
    return null;
  }
  const srcPath = path.join(ROOT, relPath);
  if (!fs.existsSync(srcPath)) { stats.skipped += 1; return null; }

  const outRel = gameReadyRelPath(relPath);
  const outPath = path.join(ROOT, outRel);
  if (!force && !isNewer(srcPath, outPath)) { stats.skipped += 1; return { outRel, skipped: true }; }
  if (dryRun) { stats.optimized += 1; return { outRel, dryRun: true }; }

  try {
    const glbJson = parseGlbJson(srcPath);
    const counts = extractGltfCounts(glbJson);
    const classification = classifyModel(entry, counts);
    const origKB = fileSizeKB(srcPath);
    const doc = await io.read(srcPath);

    await embedExternalTextures(doc, srcPath, glbJson);
    await replacePlaceholderTextures(doc, entry, glbJson);
    await resizeEmbeddedTextures(doc);

    if (classification.kind === 'animation-clip') {
      await stripMeshesForClip(doc);
      // Keep skeleton nodes — prune() would delete bone hierarchy on mesh-less clips.
      const transforms = doc.getRoot().listAnimations().length ? [resample(), dedup()] : [dedup()];
      await doc.transform(...transforms);
    } else {
      await doc.transform(weld(), dedup(), flatten(), prune(), resample());
      await doc.transform(quantize(), draco({
        quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12, quantizeColor: 8,
      }));
    }

    ensureDir(path.dirname(outPath));
    await io.write(outPath, doc);
    const newKB = fileSizeKB(outPath);
    stats.savedKB += Math.max(0, origKB - newKB);
    stats.optimized += 1;
    process.stdout.write('O');
    return { outRel, origKB, newKB, kind: classification.kind };
  } catch (err) {
    stats.errors += 1;
    process.stdout.write('E');
    console.error(`\n  x ${entry.name}: ${err.message}`);
    return null;
  }
}

async function main() {
  log('Building game-ready GLBs...');
  ensureDir(GAME_READY_DIR);
  const registry = loadRegistry();
  const glbModels = (registry.models || []).filter((m) => String(m.path || '').toLowerCase().endsWith('.glb'));
  log(`Processing ${glbModels.length} GLB models`);
  const atlases = await preloadWeaponAtlases();
  log(`Texture atlases: ${Object.entries(atlases).filter(([, v]) => v === true).map(([k]) => k).join(', ')}`);
  const io = await createIO();
  const results = [];
  for (const entry of glbModels) {
    const result = await optimizeModel(io, entry);
    if (result) results.push(result);
  }
  console.log('');
  log(`Optimized: ${stats.optimized} | Skipped: ${stats.skipped} | Errors: ${stats.errors}`);
  log(`Saved: ${(stats.savedKB / 1024).toFixed(1)} MB`);
  fs.mkdirSync(path.join(API_DIR, '_audit'), { recursive: true });
  fs.writeFileSync(path.join(API_DIR, '_audit', 'models-optimize-last.json'), JSON.stringify({
    generated: new Date().toISOString(), stats, optimized: results.filter((r) => !r.skipped && !r.dryRun),
  }, null, 2));
}

main().catch((err) => { console.error('[optimize:models] fatal:', err.message); process.exit(1); });