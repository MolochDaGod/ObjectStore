/**
 * GrudgeModelsSDK
 *
 * Thin extension of `@grudgstudio/core`'s GrudgeSDK that adds race-model
 * manifest access. Mirrors the style of the other get* methods so the
 * shape is familiar. Designed to be upstreamed into ObjectStore/sdk/grudge-sdk.js
 * as a minor-version bump (see scripts/objectstore-sdk.patch).
 *
 *   import { GrudgeModelsSDK } from './GrudgeModelsSDK.js';
 *   const sdk = new GrudgeModelsSDK();
 *   const wk  = await sdk.getRaceModel('human');
 *   const url = sdk.getAssetUrl(wk.model);            // absolute CDN URL
 *   const pack = await sdk.getAnimationPack(wk.defaultAnimPack);
 */

import { GrudgeSDK } from '@grudgstudio/core/sdk';

// Manifest defaults. `manifestUrl` can point at ObjectStore (GitHub Pages)
// once the PR lands, or directly at object storage in the interim.
const DEFAULTS = {
  // Relative to GrudgeSDK base URL — matches the canonical endpoint naming.
  manifestPath: '/api/v1/race-models.json',
  // Fallback: a local copy shipped with the app (served from same origin).
  localManifestPath: '/src/race-models.v1.json',
  // Authoritative read-only asset CDN (Cloudflare Worker `grudge-asset-cdn`
  // fronting the R2 bucket `grudge-assets` with GitHub Pages fallback).
  // The legacy `objects.grudge-studio.com` subdomain was never created; we
  // use `assets.grudge-studio.com` which is the live CDN host.
  assetOrigin: 'https://assets.grudge-studio.com/race-characters/',
};

export class GrudgeModelsSDK extends GrudgeSDK {
  constructor(options = {}) {
    super(options.baseUrl);
    this.manifestPath = options.manifestPath || DEFAULTS.manifestPath;
    this.localManifestPath = options.localManifestPath || DEFAULTS.localManifestPath;
    this.assetOrigin = options.assetOrigin || DEFAULTS.assetOrigin;
  }

  // ─── Manifest ────────────────────────────────────────────────────────────

  /** Fetch the race-model manifest, with the usual 5-min in-memory cache. */
  async getRaceModels() {
    try {
      return await this.fetch(this.manifestPath);
    } catch (e) {
      // Fall back to the local bundled copy if the CDN hasn't been updated yet.
      const url = this.localManifestPath;
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) return cached.data;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load race manifest (${e.message}; fallback ${res.status})`);
      const data = await res.json();
      this.cache.set(url, { data, timestamp: Date.now() });
      return data;
    }
  }

  /** Fetch one race entry by id (e.g. 'human', 'elf', 'orc_classic'). */
  async getRaceModel(raceId) {
    const m = await this.getRaceModels();
    return m.races?.[raceId] ?? null;
  }

  /** All races belonging to a faction ('crusade' | 'fabled' | 'legion'). */
  async getRaceModelsByFaction(factionId) {
    const m = await this.getRaceModels();
    return Object.values(m.races ?? {}).filter(r => r.faction === factionId);
  }

  /** Look up an animation-pack definition by id ('1h_sword_shield' etc.). */
  async getAnimationPack(packId) {
    const m = await this.getRaceModels();
    return m.animationPacks?.[packId] ?? null;
  }

  /** List every animation pack. */
  async getAnimationPacks() {
    const m = await this.getRaceModels();
    return m.animationPacks ?? {};
  }

  /** Shared slot regex map — useful when applying equipment. */
  async getSlotPatterns() {
    const m = await this.getRaceModels();
    return m.slotPatterns ?? {};
  }

  /** Shared bone-container name map. */
  async getBoneContainers() {
    const m = await this.getRaceModels();
    return m.boneContainers ?? {};
  }

  // ─── URL helpers ─────────────────────────────────────────────────────────

  /**
   * Resolve a relative asset path (as stored in the manifest) to the full
   * CDN URL. Honors a per-manifest `base` override, else `this.assetOrigin`.
   */
  getAssetUrl(relPath, manifest = null) {
    if (!relPath) return null;
    if (/^https?:\/\//i.test(relPath)) return relPath;
    const base = (manifest?.base || this.assetOrigin).replace(/\/$/, '');
    const rel = relPath.replace(/^\//, '');
    return `${base}/${rel}`;
  }

  /** Absolute URL for a race's model file. */
  async getRaceModelUrl(raceId) {
    const m = await this.getRaceModels();
    const race = m.races?.[raceId];
    if (!race) return null;
    return this.getAssetUrl(race.model, m);
  }

  /** Absolute URL for an animation pack's file. */
  async getAnimationPackUrl(packId) {
    const m = await this.getRaceModels();
    const pack = m.animationPacks?.[packId];
    if (!pack) return null;
    return this.getAssetUrl(pack.path, m);
  }
}

export default GrudgeModelsSDK;
