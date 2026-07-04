#!/usr/bin/env node
/**
 * Validate every game-ready GLB renders with real textures (no yellow placeholders).
 * Output: api/v1/_audit/models-render-validation.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3dgltf from 'draco3dgltf';
import sharp from 'sharp';
import {
  API_DIR,
  ROOT,
  gameReadyRelPath,
  isPlaceholderTextureUri,
  loadRegistry,
} from './lib/model-game-utils.mjs';

const OUT = path.join(API_DIR, '_audit', 'models-render-validation.json');

async function createIO() {
  return new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3dgltf.createDecoderModule(),
    });
}

async function validateTexture(tex) {
  const img = tex?.getImage();
  if (!img) return { ok: false, reason: 'no-image' };
  if (img.length <= 120) return { ok: false, reason: 'placeholder-buffer' };
  const uri = tex.getURI();
  if (isPlaceholderTextureUri(uri)) return { ok: false, reason: 'placeholder-uri' };
  try {
    const meta = await sharp(img).metadata();
    if ((meta.width || 0) <= 1 || (meta.height || 0) <= 1) {
      return { ok: false, reason: 'tiny-texture', size: `${meta.width}x${meta.height}` };
    }
    return { ok: true, size: `${meta.width}x${meta.height}`, mime: tex.getMimeType() };
  } catch (err) {
    return { ok: false, reason: 'sharp-failed', error: err.message };
  }
}

async function validateEntry(io, entry) {
  const sourcePath = (entry.path || '').replace(/\\/g, '/');
  const gameReadyPath = gameReadyRelPath(sourcePath);
  const abs = path.join(ROOT, gameReadyPath);

  const result = {
    name: entry.name,
    sourcePath,
    gameReadyPath,
    category: entry.category,
    status: 'ok',
    issues: [],
  };

  if (!sourcePath.toLowerCase().endsWith('.glb')) {
    result.status = 'skip';
    result.issues.push('non-glb');
    return result;
  }
  if (!fs.existsSync(abs)) {
    result.status = 'fail';
    result.issues.push('missing-game-ready');
    return result;
  }

  try {
    const doc = await io.read(abs);
    const root = doc.getRoot();
    const mats = root.listMaterials();
    const meshes = root.listMeshes();
    const texs = root.listTextures();
    const anims = root.listAnimations();

    result.meshes = meshes.length;
    result.materials = mats.length;
    result.textures = texs.length;
    result.animations = anims.length;

    const nodes = root.listNodes().length;
    if (meshes.length === 0 && anims.length === 0 && nodes === 0) {
      result.status = 'fail';
      result.issues.push('empty-asset');
      return result;
    }
    if (meshes.length === 0 && (anims.length > 0 || nodes > 0)) {
      result.renderMode = 'animation-clip';
      return result;
    }

    if (meshes.length > 0 && mats.length === 0) {
      result.status = 'fail';
      result.issues.push('mesh-without-material');
      return result;
    }

    if (texs.length > 0) {
      for (const tex of texs) {
        const check = await validateTexture(tex);
        if (!check.ok) {
          result.status = 'fail';
          result.issues.push(`texture:${check.reason}`);
        }
      }
    } else if (meshes.length > 0) {
      const hasColor = mats.some((m) => {
        const bcf = m.getBaseColorFactor();
        return bcf && (bcf[0] !== 1 || bcf[1] !== 1 || bcf[2] !== 1);
      });
      if (!hasColor) result.renderMode = 'vertex-color-or-default';
      else result.renderMode = 'solid-color';
    }

    if (anims.length > 0 && meshes.length === 0) result.renderMode = 'animation-clip';

    if (result.status === 'ok' && result.issues.length === 0) result.renderMode = result.renderMode || 'textured';
    return result;
  } catch (err) {
    result.status = 'fail';
    result.issues.push(`read-error:${err.message}`);
    return result;
  }
}

async function main() {
  const registry = loadRegistry();
  const io = await createIO();
  const models = registry.models || [];
  const results = [];

  for (const entry of models) {
    results.push(await validateEntry(io, entry));
    process.stdout.write(results.at(-1).status === 'fail' ? 'F' : results.at(-1).status === 'skip' ? '.' : 'O');
  }

  const summary = {
    total: results.length,
    ok: results.filter((r) => r.status === 'ok').length,
    fail: results.filter((r) => r.status === 'fail').length,
    skip: results.filter((r) => r.status === 'skip').length,
    weapons: results.filter((r) => r.category === 'weapons').length,
    weaponsOk: results.filter((r) => r.category === 'weapons' && r.status === 'ok').length,
    weaponsFail: results.filter((r) => r.category === 'weapons' && r.status === 'fail').length,
    placeholderFails: results.filter((r) => r.issues.some((i) => i.includes('placeholder'))).length,
    failures: results.filter((r) => r.status === 'fail'),
  };

  console.log('\n');
  console.log(`OK: ${summary.ok} | FAIL: ${summary.fail} | Weapons OK: ${summary.weaponsOk}/${summary.weapons}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), summary, results }, null, 2));

  if (summary.fail > 0) {
    console.error('Validation failures:');
    for (const f of summary.failures.slice(0, 20)) {
      console.error(`  ${f.name}: ${f.issues.join(', ')}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});