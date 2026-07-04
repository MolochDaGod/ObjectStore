/**
 * Shared helpers for 3D model audit, game-ready optimization, and manifests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const ROOT = path.resolve(import.meta.dirname, '../..');
export const API_DIR = path.join(ROOT, 'api', 'v1');
export const MODELS_DIR = path.join(ROOT, 'models');
export const GAME_READY_DIR = path.join(MODELS_DIR, '_game-ready');
export const CDN_PRIMARY = 'https://assets.grudge-studio.com';
export const CDN_FALLBACK = 'https://molochdagod.github.io/ObjectStore';
export const TOON_RTS_PACK = `${CDN_PRIMARY}/asset-packs/toon-rts-characters/glb`;

export const RACE_PREFIXES = {
  BRB_: 'barbarian',
  ELF_: 'elf',
  ORC_: 'orc',
  WK_: 'human',
  UD_: 'undead',
  DWF_: 'dwarf',
};

export const ATTACHMENT_PROFILES = {
  sword: 'main_hand',
  greatsword: 'two_hand',
  axe: 'main_hand',
  greataxe: 'two_hand',
  dagger: 'main_hand',
  bow: 'ranged_2h',
  crossbow: 'ranged_2h',
  spear: 'two_hand',
  staff: 'two_hand',
  wand: 'main_hand',
  hammer: 'main_hand',
  mace: 'main_hand',
  scythe: 'two_hand',
  shield: 'off_hand',
  gun: 'ranged_2h',
};

export function fnv1aHash8(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash = hash >>> 0;
  const h2 = (hash ^ (hash >>> 16)) >>> 0;
  return h2.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

export function modelGrudgeUuid(modelPath) {
  const p = String(modelPath || '').replace(/\\/g, '/');
  return `GRDG-3D-${fnv1aHash8(p)}`;
}

export function parseGlbJson(glbPath) {
  const buf = fs.readFileSync(glbPath);
  if (buf.toString('utf8', 0, 4) !== 'glTF') throw new Error('Not a GLB file');
  const jsonLen = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + jsonLen).replace(/\0+$/, '');
  return JSON.parse(jsonStr);
}

export function fileSizeKB(p) {
  try {
    return Math.round(fs.statSync(p).size / 1024);
  } catch {
    return 0;
  }
}

export function md5File(filePath) {
  return createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

export function detectRaceFromName(name = '') {
  for (const [prefix, race] of Object.entries(RACE_PREFIXES)) {
    if (name.startsWith(prefix)) return race;
  }
  return null;
}

export function weaponSubcategory(filePath) {
  const parts = String(filePath).replace(/\\/g, '/').split('/');
  const idx = parts.indexOf('weapons');
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

export function classifyModel(entry, gltfMeta = {}) {
  const name = entry?.name || '';
  const p = (entry?.path || '').replace(/\\/g, '/');
  const { meshes = 0, animations = 0, textures = 0, materials = 0 } = gltfMeta;

  if (/^Rig_Medium_/i.test(name)) {
    return { kind: 'kaykit-rig', boneMap: 'kaykit', previewUnit: 'knight' };
  }
  if (p.includes('/characters/') || entry?.category === 'characters') {
    return {
      kind: animations > 0 ? 'character-animated' : 'character',
      boneMap: p.includes('/kaykit/') ? 'kaykit' : name.includes('soldier') ? 'mixamo' : 'generic',
      previewUnit: null,
    };
  }
  if (animations > 0 && meshes === 0) {
    const race = detectRaceFromName(name);
    return {
      kind: 'animation-clip',
      boneMap: 'bip001',
      previewUnit: race || 'human',
      previewVariant: /cavalry/i.test(name) ? 'cavalry' : /catapult|boltthrower/i.test(name) ? 'siege' : 'character',
    };
  }
  if (/\.FBX\.glb$/i.test(name) && /attack|idle|death|charge|combat|walk|run|crouch/i.test(name)) {
    const race = detectRaceFromName(name);
    return {
      kind: 'animation-clip',
      boneMap: 'bip001',
      previewUnit: race || 'human',
      previewVariant: /cavalry/i.test(name) ? 'cavalry' : /catapult|boltthrower/i.test(name) ? 'siege' : 'character',
    };
  }
  if (p.includes('/weapons/') || entry?.category === 'weapons') {
    const sub = weaponSubcategory(p);
    return {
      kind: 'weapon',
      boneMap: detectRaceFromName(name) ? 'bip001' : 'universal',
      attachmentProfile: ATTACHMENT_PROFILES[sub] || 'main_hand',
      weaponType: sub,
      previewUnit: null,
    };
  }
  if (p.includes('KayKit') || entry?.category === 'buildings') {
    return { kind: 'prop', boneMap: null, previewUnit: null };
  }
  return {
    kind: meshes > 0 ? 'static-mesh' : 'unknown',
    boneMap: null,
    previewUnit: null,
  };
}

export function resolvePreviewUnitUrl(classification, name = '') {
  const { previewUnit, previewVariant } = classification;
  if (!previewUnit) return null;
  if (classification.boneMap === 'kaykit') {
    return `${CDN_FALLBACK}/models/characters/kaykit/Knight.glb`;
  }
  if (previewVariant === 'cavalry') return `${TOON_RTS_PACK}/cavalry/${previewUnit}.glb`;
  if (previewVariant === 'siege' && ['human', 'orc', 'elf'].includes(previewUnit)) {
    return `${TOON_RTS_PACK}/siege/${previewUnit}.glb`;
  }
  return `${TOON_RTS_PACK}/characters/${previewUnit}.glb`;
}

export function resolveCdnUrls(relPath) {
  const webPath = relPath.replace(/\\/g, '/');
  return {
    cdnUrl: `${CDN_PRIMARY}/${webPath}`,
    fallbackUrl: `${CDN_FALLBACK}/${webPath}`,
    githubPagesUrl: `${CDN_FALLBACK}/${webPath}`,
  };
}

export function gameReadyRelPath(sourcePath) {
  const p = String(sourcePath || '').replace(/\\/g, '/');
  if (p.startsWith('models/')) {
    return p.replace(/^models\//, 'models/_game-ready/');
  }
  return `models/_game-ready/${p}`;
}

export function findExternalTextureUris(glbJson) {
  return (glbJson.images || [])
    .filter((img) => img.uri && !img.bufferView)
    .map((img) => img.uri)
    .filter((uri) => !/^data:/i.test(uri));
}

export function resolveTexturePath(glbPath, uri) {
  const dir = path.dirname(glbPath);
  const candidates = [
    path.join(dir, uri),
    path.join(dir, '..', uri),
    path.join(dir, '..', '..', uri),
    path.join(MODELS_DIR, 'weapons', uri),
    path.join(MODELS_DIR, 'textures', uri),
    path.join(ROOT, uri),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

export function scoreGameReadiness(meta) {
  let score = 0;
  if (meta.valid) score += 25;
  if (meta.textures > 0 || meta.materials > 0) score += 20;
  if (meta.textureStatus === 'embedded') score += 25;
  else if (meta.textureStatus === 'external-resolved') score += 15;
  else if (meta.textureStatus === 'vertex-color') score += 15;
  if (!meta.missingTextures?.length) score += 15;
  if (meta.maxTextureSize <= 1024) score += 10;
  if (meta.kind === 'animation-clip' && meta.previewUnit) score += 5;
  return Math.min(100, score);
}

export function loadRegistry() {
  const registryPath = path.join(API_DIR, 'models3d.json');
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

export function loadUuidMap() {
  const uuidPath = path.join(API_DIR, 'models3d-uuids.json');
  if (!fs.existsSync(uuidPath)) return {};
  return JSON.parse(fs.readFileSync(uuidPath, 'utf8')).uuids || {};
}

export function extractGltfCounts(glbJson) {
  return {
    meshes: (glbJson.meshes || []).length,
    nodes: (glbJson.nodes || []).length,
    textures: (glbJson.images || []).length,
    animations: (glbJson.animations || []).length,
    materials: (glbJson.materials || []).length,
    skins: (glbJson.skins || []).length,
  };
}

export function analyzeTextureStatus(glbPath, glbJson) {
  const uris = findExternalTextureUris(glbJson);
  const images = glbJson.images || [];
  const embedded = images.filter((img) => img.bufferView != null || /^data:/i.test(img.uri || '')).length;
  const materials = glbJson.materials || [];

  const hasVertexColor = materials.some((m) => {
    const pbr = m.pbrMetallicRoughness || {};
    const base = pbr.baseColorFactor;
    return base && (base[0] !== 1 || base[1] !== 1 || base[2] !== 1 || base[3] !== 1);
  });

  if (embedded > 0 && uris.length === 0) {
    return { textureStatus: 'embedded', missingTextures: [], externalUris: [] };
  }
  if (uris.length === 0 && materials.length > 0 && hasVertexColor) {
    return { textureStatus: 'vertex-color', missingTextures: [], externalUris: [] };
  }
  if (uris.length === 0 && materials.length === 0) {
    return { textureStatus: 'none', missingTextures: [], externalUris: [] };
  }

  const missing = [];
  const resolved = [];
  for (const uri of uris) {
    const resolvedPath = resolveTexturePath(glbPath, uri);
    if (resolvedPath) resolved.push({ uri, path: resolvedPath });
    else missing.push(uri);
  }

  if (missing.length === 0 && resolved.length > 0) {
    return { textureStatus: 'external-resolved', missingTextures: [], externalUris: uris, resolvedTextures: resolved };
  }
  if (missing.length > 0) {
    return { textureStatus: 'external-missing', missingTextures: missing, externalUris: uris, resolvedTextures: resolved };
  }
  return { textureStatus: 'embedded', missingTextures: [], externalUris: uris };
}

export async function maxTextureDimension(textures) {
  let max = 0;
  for (const tex of textures) {
    const img = tex.getImage?.();
    if (!img) continue;
    try {
      const sharp = (await import('sharp')).default;
      const meta = await sharp(img).metadata();
      max = Math.max(max, meta.width || 0, meta.height || 0);
    } catch {
      /* skip */
    }
  }
  return max;
}

export function isNewer(src, dest) {
  if (!fs.existsSync(dest)) return true;
  if (!fs.existsSync(src)) return false;
  return fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs;
}

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}