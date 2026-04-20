/**
 * Grudge Object Store — v2 Asset Taxonomy
 * @package @grudge-studio/objectstore
 *
 * Canonical classification every asset must have. Used by:
 *   - manifests/v2/index.json (authoritative manifest)
 *   - /api/assets, /api/ingest/* endpoints
 *   - frontend browsers (2d.html, 3d.html) and editors
 *   - consuming apps (grudgeDot, grudge-wcs, grudge-engine) via the SDK
 */

/** 2D kinds. These use <img>, <canvas>, or a 2D renderer (PixiJS, Canvas2D). */
export type Asset2DKind =
  | 'sprite'            // static 2D image or spritesheet (png/webp/avif)
  | 'sprite-animation'  // frame-indexed 2D animation (png sequence + json, or spine .json)
  | 'vfx2d'             // particle/FX sequence or flipbook for 2D compositing
  | 'icon'              // UI icon (svg preferred, png allowed)
  | 'background'        // fullscreen/scene 2D background (png/jpg/webp)
  | 'video'             // playable video asset (mp4/webm)
  | 'audio';            // music or sfx (mp3/ogg/wav)

/** 3D kinds. These are consumed by a 3D renderer (three.js, PlayCanvas, Babylon). */
export type Asset3DKind =
  | 'model3d'           // glb, gltf, obj, fbx (loaded as scene geometry)
  | 'voxel'             // MagicaVoxel .vox, .qb, Minecraft schematic
  | 'animation3d'       // standalone anim track (fbx, gltf with clips only)
  | 'rig'               // skeleton/avatar definition (mixamo bones, custom rig)
  | 'environment'       // HDR/EXR environment probe / cubemap
  | 'scene3d';          // pre-composed 3D scene (gltf + children + lights)

/** Shared kinds usable in either 2D or 3D contexts. */
export type AssetSharedKind =
  | 'texture'           // raw image used as a material input (albedo, normal, roughness…)
  | 'material'          // material definition (json describing texture refs + params)
  | 'shader'            // glsl/wgsl snippet or preset
  | 'font';             // ttf/otf/woff2

/** Composite kind referencing many other assets by id. */
export type AssetCompositeKind =
  | 'scene'             // unified scene manifest (can mix 2D + 3D references)
  | 'pack';             // a curated bundle of asset ids

export type AssetKind =
  | Asset2DKind
  | Asset3DKind
  | AssetSharedKind
  | AssetCompositeKind;

/** Dimensionality buckets used by the 2D vs 3D hub UIs. */
export type AssetDimension = '2d' | '3d' | 'shared' | 'composite';

export interface AssetRecordV2 {
  id: string;                         // stable uuid (e.g. "sprite_0f3a-…") — primary key
  kind: AssetKind;
  dimension: AssetDimension;
  name: string;                       // human-readable display name
  path: string;                       // logical path within the store (e.g. "wcs/v1/sprites/hero/idle.png")
  r2Key?: string;                     // resolved R2 object key when uploaded (e.g. "game-assets/wcs/v1/…")
  mime: string;
  size: number;                       // bytes
  sha256?: string;                    // optional content hash for dedup
  previewUrl?: string;                // small thumbnail URL (png/webp) for browsers
  tags: string[];
  pack?: string;                      // source pack / vendor name
  category?: string;                  // legacy category (weapons, monsters, fx, …) — kept for backfill
  tier?: number;                      // item tier 1-5 when relevant
  faction?: string;                   // faction scope (warrior, mage, ranger, worge, …)
  source?: string;                    // project/source path in origin repo
  license?: string;                   // asset license tag
  /** For composite / scene assets. */
  references?: string[];              // child asset ids
  /** For sprite-animation: frame layout metadata. */
  animation?: {
    frames: number;
    fps?: number;
    frameWidth?: number;
    frameHeight?: number;
    loop?: boolean;
  };
  /** For model3d / animation3d: skeleton & anim metadata. */
  rigging?: {
    skeleton?: string;                 // rig id
    animations?: string[];             // animation clip ids
    boneCount?: number;
  };
  createdAt: string;                  // ISO8601
  updatedAt: string;                  // ISO8601
  version: number;                    // incrementing per write
}

export interface ManifestV2 {
  version: '2.0.0';
  bucket: string;                     // r2 bucket name (e.g. "grudge-assets")
  generatedAt: string;                // ISO8601
  counts: Partial<Record<AssetKind, number>>;
  dimensions: Record<AssetDimension, number>;
  assets: AssetRecordV2[];
}

/** Map a kind to its dimensional bucket for hub-UI grouping. */
export type KindToDimension = {
  sprite: '2d'; 'sprite-animation': '2d'; vfx2d: '2d'; icon: '2d';
  background: '2d'; video: '2d'; audio: '2d';
  model3d: '3d'; voxel: '3d'; animation3d: '3d';
  rig: '3d'; environment: '3d'; scene3d: '3d';
  texture: 'shared'; material: 'shared'; shader: 'shared'; font: 'shared';
  scene: 'composite'; pack: 'composite';
};
