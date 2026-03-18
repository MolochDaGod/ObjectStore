/**
 * ObjectStore R2 Storage Client
 * 
 * Client for the Cloudflare Worker API that proxies Cloudflare R2 storage.
 * Handles asset upload, download, listing, and deletion through the Worker.
 * 
 * @module @grudge-studio/objectstore/sdk/r2
 * @version 1.0.0
 */

const DEFAULT_WORKER_URL = 'https://objectstore.grudge-studio.com';

/**
 * Custom error class for R2 client operations
 */
export class R2ClientError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'R2ClientError';
    this.status = status || 0;
    this.details = details || null;
  }
}

/**
 * ObjectStore R2 Client
 * 
 * Wraps all Cloudflare Worker /v1/assets endpoints for R2 storage.
 * 
 * Usage:
 *   import { ObjectStoreR2Client } from './r2-client.js';
 *   const r2 = new ObjectStoreR2Client({ workerUrl: '...', apiKey: '...' });
 *   const assets = await r2.listAssets();
 */
export class ObjectStoreR2Client {
  /**
   * @param {object} opts
   * @param {string} [opts.workerUrl] - Cloudflare Worker base URL
   * @param {string} [opts.apiKey]    - Optional Bearer token for authenticated routes
   */
  constructor(opts = {}) {
    this.workerUrl = (opts.workerUrl || DEFAULT_WORKER_URL).replace(/\/$/, '');
    this.apiKey = opts.apiKey || null;
  }

  // ─── Internal helpers ─────────────────────────────────────────────

  /** Build headers including optional auth */
  _headers(extra = {}) {
    const h = { ...extra };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  /** Generic fetch wrapper with error handling */
  async _fetch(path, opts = {}) {
    const url = `${this.workerUrl}${path}`;
    const res = await fetch(url, {
      ...opts,
      headers: this._headers(opts.headers || {}),
    });

    if (!res.ok) {
      let details = null;
      try { details = await res.json(); } catch (_) { /* ignore */ }
      throw new R2ClientError(
        `R2 API error ${res.status}: ${res.statusText}`,
        res.status,
        details
      );
    }

    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res;
  }

  // ─── Asset CRUD ───────────────────────────────────────────────────

  /**
   * List assets in the bucket
   * @param {object} [query] - { prefix, limit, cursor, category }
   * @returns {Promise<object>} { assets: [], cursor?, truncated }
   */
  async listAssets(query = {}) {
    const params = new URLSearchParams();
    if (query.prefix) params.set('prefix', query.prefix);
    if (query.limit) params.set('limit', String(query.limit));
    if (query.cursor) params.set('cursor', query.cursor);
    if (query.category) params.set('category', query.category);
    const qs = params.toString();
    return this._fetch(`/v1/assets${qs ? '?' + qs : ''}`);
  }

  /**
   * Get asset metadata (HEAD-style)
   * @param {string} key - Asset key / path in R2
   * @returns {Promise<object>} Asset metadata
   */
  async getAsset(key) {
    return this._fetch(`/v1/assets/${encodeURIComponent(key)}`);
  }

  /**
   * Get the full public file URL for an asset
   * @param {string} key - Asset key / path in R2
   * @returns {string}
   */
  getAssetFileUrl(key) {
    return `${this.workerUrl}/v1/assets/${encodeURIComponent(key)}/file`;
  }

  /**
   * Upload an asset (multipart/form-data)
   * @param {File|Blob} file - The file to upload
   * @param {object} meta - { key, category, tags[], description }
   * @returns {Promise<object>} Upload result with key & metadata
   */
  async uploadAsset(file, meta = {}) {
    const fd = new FormData();
    fd.append('file', file);
    if (meta.key) fd.append('key', meta.key);
    if (meta.category) fd.append('category', meta.category);
    if (meta.description) fd.append('description', meta.description);
    if (meta.tags) fd.append('tags', JSON.stringify(meta.tags));

    return this._fetch('/v1/assets', {
      method: 'POST',
      body: fd,
      // Don't set Content-Type — browser sets multipart boundary
    });
  }

  /**
   * Upload raw bytes with explicit content-type
   * @param {string} key - Destination key in R2
   * @param {ArrayBuffer|Uint8Array|Blob} body
   * @param {string} contentType
   * @returns {Promise<object>}
   */
  async uploadRaw(key, body, contentType = 'application/octet-stream') {
    return this._fetch(`/v1/assets/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body,
    });
  }

  /**
   * Delete an asset
   * @param {string} key - Asset key to delete
   * @returns {Promise<object>}
   */
  async deleteAsset(key) {
    return this._fetch(`/v1/assets/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

  // ─── Health / Info ────────────────────────────────────────────────

  /**
   * Ping the worker health endpoint
   * @returns {Promise<object>} { status, version, ... }
   */
  async healthCheck() {
    return this._fetch('/v1/health');
  }

  // ─── 3D Model helpers ─────────────────────────────────────────────

  /**
   * Upload a 3D model file to the models/ prefix
   * @param {File|Blob} file
   * @param {object} meta - { name, category, tags[], description }
   * @returns {Promise<object>}
   */
  async upload3DModel(file, meta = {}) {
    const ext = (file.name || 'model.glb').split('.').pop().toLowerCase();
    const key = meta.key || `models/${meta.category || 'uncategorized'}/${Date.now()}-${file.name || 'model.' + ext}`;
    return this.uploadAsset(file, {
      key,
      category: meta.category || '3d-models',
      tags: meta.tags || [ext, '3d'],
      description: meta.description || meta.name || file.name || '',
    });
  }

  /**
   * List all 3D models (prefix = models/)
   * @param {object} [query] - { limit, cursor, category }
   * @returns {Promise<object>}
   */
  async list3DModels(query = {}) {
    return this.listAssets({ ...query, prefix: query.prefix || 'models/' });
  }

  /**
   * Build a direct file URL for a 3D model
   * @param {string} key
   * @returns {string}
   */
  getModelFileUrl(key) {
    return this.getAssetFileUrl(key);
  }

  // ─── 3DFX Effect helpers ────────────────────────────────────────────

  /**
   * Upload a 3DFX effect definition JSON
   * @param {object} effectDef - The effect definition object
   * @param {object} [meta] - { tags[] }
   * @returns {Promise<object>}
   */
  async upload3DFX(effectDef, meta = {}) {
    const id = effectDef.id || `effect-${Date.now()}`;
    const key = `3dfx/definitions/${id}.3dfx.json`;
    const body = JSON.stringify(effectDef, null, 2);
    return this.uploadRaw(key, body, 'application/json');
  }

  /**
   * List all 3DFX effect definitions (prefix = 3dfx/)
   * @param {object} [query] - { limit, cursor }
   * @returns {Promise<object>}
   */
  async list3DFX(query = {}) {
    return this.listAssets({ ...query, prefix: '3dfx/', category: '3DFX' });
  }

  /**
   * Get a specific 3DFX effect definition by ID
   * @param {string} effectId
   * @returns {Promise<object>} Parsed effect definition JSON
   */
  async get3DFXDefinition(effectId) {
    const key = `3dfx/definitions/${effectId}.3dfx.json`;
    return this._fetch(`/v1/assets/${encodeURIComponent(key)}/file`);
  }

  /**
   * Upload a GLSL shader file
   * @param {string} name - Shader name (e.g. 'fire.vert')
   * @param {string} source - GLSL source code
   * @returns {Promise<object>}
   */
  async uploadShader(name, source) {
    const key = `3dfx/shaders/${name}.glsl`;
    return this.uploadRaw(key, source, 'text/plain');
  }

  /**
   * Get a GLSL shader file
   * @param {string} name - Shader name (e.g. 'fire.vert')
   * @returns {Promise<string>} GLSL source
   */
  async getShader(name) {
    const key = `3dfx/shaders/${name}.glsl`;
    const res = await this._fetch(`/v1/assets/${encodeURIComponent(key)}/file`);
    if (res instanceof Response) return res.text();
    return res;
  }
}

// ─── Module exports ─────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ObjectStoreR2Client, R2ClientError, DEFAULT_WORKER_URL };
}

export { DEFAULT_WORKER_URL };
export default ObjectStoreR2Client;
