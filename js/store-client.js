/**
 * Grudge ObjectStore browser SDK facade.
 * Resolves the API base from (in priority order):
 *   1. explicit argument to `createStoreClient({ base })`
 *   2. <meta name="grudge-api" content="https://…">
 *   3. window.GRUDGE_API
 *   4. same-origin (empty string)
 *
 * All mutating calls attach `Authorization: Bearer <token>` when a Grudge ID JWT
 * is found in localStorage under `grudge_auth_token`. Unauthenticated callers
 * can still read public manifests + search.
 */

export function resolveBase(explicit) {
  if (explicit) return explicit.replace(/\/$/, '');
  const meta = document.querySelector('meta[name="grudge-api"]')?.content;
  if (meta) return meta.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.GRUDGE_API) return String(window.GRUDGE_API).replace(/\/$/, '');
  return '';
}

function authHeader() {
  try {
    const t = localStorage.getItem('grudge_auth_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch { return {}; }
}

export function createStoreClient(opts = {}) {
  const base = resolveBase(opts.base);
  const fetchJson = async (path, init = {}) => {
    const r = await fetch(`${base}${path}`, {
      credentials: 'include',
      ...init,
      headers: { 'Accept': 'application/json', ...authHeader(), ...(init.headers || {}) },
    });
    const ct = r.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await r.json() : await r.text();
    if (!r.ok) throw Object.assign(new Error(`${r.status} ${path}`), { status: r.status, body });
    return body;
  };

  return {
    base,

    /** Fetch the v2 manifest. Use `kind` / `dimension` filters to narrow. */
    async manifest({ kind, dimension, pack, q, page = 0, pageSize = 200 } = {}) {
      const qs = new URLSearchParams({ page, pageSize });
      if (kind) qs.set('kind', kind);
      if (dimension) qs.set('dimension', dimension);
      if (pack) qs.set('pack', pack);
      if (q) qs.set('q', q);
      return fetchJson(`/api/manifest/v2?${qs}`);
    },

    /** Lookup a single asset record by id. */
    async asset(id) { return fetchJson(`/api/assets/${encodeURIComponent(id)}`); },

    /** Create or update an asset record (metadata only; content upload is a separate call). */
    async upsertAsset(record) {
      return fetchJson(`/api/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    },

    async deleteAsset(id) {
      return fetchJson(`/api/assets/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },

    /** Upload binary content for an existing asset id. */
    async uploadContent(id, file) {
      const fd = new FormData();
      fd.append('file', file);
      return fetchJson(`/api/assets/${encodeURIComponent(id)}/upload`, { method: 'POST', body: fd });
    },

    /** Rebuild the canonical manifest from R2 + DB state. */
    async rebuildManifest() { return fetchJson(`/api/manifest/rebuild`, { method: 'POST' }); },

    /** Stream a search (server returns top N). */
    async search(query) { return fetchJson(`/api/search?q=${encodeURIComponent(query)}`); },

    /**
     * Resolve a displayable URL for an asset.
     *
     * Options:
     *   cdn       — R2 public base (default https://assets.grudge-studio.com).
     *   variant   — Cloudflare Images variant name (thumb|card|preview|full|…).
     *                When set, the R2 URL is wrapped through Cloudflare Images
     *                via the account hash in `imagesAccountHash`.
     *   imagesAccountHash — <meta name="cf-images-account" content="…"> override.
     */
    assetUrl(record, opts = {}) {
      const cdn = opts.cdn || 'https://assets.grudge-studio.com';
      if (!record) return '';
      const raw = record.r2Key
        ? `${cdn}/${record.r2Key.replace(/^\/+/, '')}`
        : record.path ? `${cdn}/${record.path.replace(/^\/+/, '')}` : '';
      if (!raw) return '';

      // Cloudflare Stream short-circuit: video records with a streamUid go to
      // the Stream embed URL directly (not R2). Consumers should render with
      // <stream> / HLS rather than <video src=…>.
      if (record.kind === 'video' && record.streamUid) {
        return `https://customer-${opts.streamCustomerCode || 'unknown'}.cloudflarestream.com/${record.streamUid}/manifest/video.m3u8`;
      }

      // Cloudflare Images variant wrapping. Requires Images enabled on the
      // account and a hash either passed in or supplied via
      //   <meta name="cf-images-account" content="<hash>">
      if (opts.variant && ['sprite', 'sprite-animation', 'icon', 'background', 'vfx2d', 'texture'].includes(record.kind)) {
        const hash = opts.imagesAccountHash
          || (typeof document !== 'undefined'
              ? document.querySelector('meta[name="cf-images-account"]')?.content
              : null);
        if (hash) return `https://imagedelivery.net/${hash}/${encodeURIComponent(raw)}/${opts.variant}`;
      }
      return raw;
    },
  };
}

export default createStoreClient;
