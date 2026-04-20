/**
 * Grudge Object Store — v2 Asset Taxonomy (runtime JS)
 * See types/asset-kind.d.ts for full type docs.
 *
 * Safe to import from both Node (server.js, scripts/) and browser (viewer, editors).
 */

export const ASSET_KINDS_2D = /** @type {const} */ ([
  'sprite',
  'sprite-animation',
  'vfx2d',
  'icon',
  'background',
  'video',
  'audio',
]);

export const ASSET_KINDS_3D = /** @type {const} */ ([
  'model3d',
  'voxel',
  'animation3d',
  'rig',
  'environment',
  'scene3d',
]);

export const ASSET_KINDS_SHARED = /** @type {const} */ ([
  'texture',
  'material',
  'shader',
  'font',
]);

export const ASSET_KINDS_COMPOSITE = /** @type {const} */ ([
  'scene',
  'pack',
]);

export const ASSET_KINDS = /** @type {const} */ ([
  ...ASSET_KINDS_2D,
  ...ASSET_KINDS_3D,
  ...ASSET_KINDS_SHARED,
  ...ASSET_KINDS_COMPOSITE,
]);

/** @type {Record<string, '2d' | '3d' | 'shared' | 'composite'>} */
export const KIND_DIMENSION = Object.freeze({
  sprite: '2d',
  'sprite-animation': '2d',
  vfx2d: '2d',
  icon: '2d',
  background: '2d',
  video: '2d',
  audio: '2d',
  model3d: '3d',
  voxel: '3d',
  animation3d: '3d',
  rig: '3d',
  environment: '3d',
  scene3d: '3d',
  texture: 'shared',
  material: 'shared',
  shader: 'shared',
  font: 'shared',
  scene: 'composite',
  pack: 'composite',
});

/** File-extension heuristics for classification. Lowercase no-dot keys. */
const EXT_TO_KIND = Object.freeze({
  // 2D
  png: 'sprite', webp: 'sprite', avif: 'sprite', jpg: 'sprite', jpeg: 'sprite',
  svg: 'icon',
  gif: 'sprite-animation', apng: 'sprite-animation',
  spine: 'sprite-animation',
  mp4: 'video', webm: 'video', mov: 'video',
  mp3: 'audio', ogg: 'audio', wav: 'audio', flac: 'audio', m4a: 'audio',
  // 3D
  glb: 'model3d', gltf: 'model3d', obj: 'model3d', stl: 'model3d', ply: 'model3d',
  fbx: 'animation3d',
  vox: 'voxel', qb: 'voxel', qbcl: 'voxel', schem: 'voxel', schematic: 'voxel',
  hdr: 'environment', exr: 'environment',
  // Shared
  glsl: 'shader', wgsl: 'shader', hlsl: 'shader', frag: 'shader', vert: 'shader',
  ttf: 'font', otf: 'font', woff: 'font', woff2: 'font',
});

/**
 * Classify an asset by its path + filename.
 * Path-based hints (e.g. /backgrounds/, /icons/, /sprites/, /vfx/, /audio/) take precedence.
 *
 * @param {string} pathOrFilename
 * @returns {{kind: string, dimension: '2d' | '3d' | 'shared' | 'composite'}}
 */
export function classifyAsset(pathOrFilename) {
  const p = String(pathOrFilename || '').toLowerCase().replace(/\\/g, '/');
  const ext = (p.match(/\.([a-z0-9]+)$/) || [, ''])[1];

  // Path-based overrides
  const hint =
    /(^|\/)backgrounds?\//.test(p) ? 'background' :
    /(^|\/)icons?\//.test(p) ? 'icon' :
    /(^|\/)audio\//.test(p) ? 'audio' :
    /(^|\/)videos?\//.test(p) ? 'video' :
    /(^|\/)(vfx|effects|particles)\//.test(p) ? 'vfx2d' :
    /(^|\/)sprites?\//.test(p) && /\d+\.(png|webp|avif|jpg|jpeg)$/.test(p) ? 'sprite-animation' :
    /(^|\/)sprites?\//.test(p) ? 'sprite' :
    /(^|\/)fonts?\//.test(p) ? 'font' :
    /(^|\/)(textures|materials)\//.test(p) ? (ext && EXT_TO_KIND[ext] === 'sprite' ? 'texture' : 'material') :
    /(^|\/)models?\//.test(p) ? 'model3d' :
    /(^|\/)voxels?\//.test(p) ? 'voxel' :
    /(^|\/)anim(ation)?s?\//.test(p) ? 'animation3d' :
    /(^|\/)envs?\//.test(p) ? 'environment' :
    null;

  let kind = hint || EXT_TO_KIND[ext] || null;

  // Normal-map / roughness / AO / height textures are always texture kind even if in sprites/
  if (/_(n|normal|rough|roughness|ao|ambientocclusion|height|emissive|metallic|specular|base_?color|albedo)\./i.test(p)) {
    kind = 'texture';
  }

  // Fallbacks when nothing matches
  if (!kind) kind = 'sprite';

  const dimension = KIND_DIMENSION[kind] || '2d';
  return { kind, dimension };
}

/** @param {string} kind */
export function isValidKind(kind) {
  return ASSET_KINDS.includes(kind);
}

/** @param {string} kind */
export function dimensionOf(kind) {
  return KIND_DIMENSION[kind] || null;
}
