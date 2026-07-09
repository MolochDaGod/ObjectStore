/**
 * asset-config.js — Canonical CDN bases for ObjectStore assets (fleet ONE TRUTH)
 *
 * Icons & 3D models: assets.grudge-studio.com (R2)
 * JSON catalog:      objectstore.grudge-studio.com/api/v1  (Worker SSOT)
 * Legacy github.io:  rewritten → R2 for binaries only
 */

export const ICON_CDN = 'https://assets.grudge-studio.com';
export const MODEL_CDN = 'https://assets.grudge-studio.com';
/** @deprecated Use OBJECTSTORE_API for JSON — github.io is not SSOT */
export const OBJECTSTORE_PAGES = 'https://molochdagod.github.io/ObjectStore';

/** ObjectStore Worker — definitions JSON SSOT */
export const OBJECTSTORE_API = 'https://objectstore.grudge-studio.com/api/v1';
export const OBJECTSTORE_ORIGIN = 'https://objectstore.grudge-studio.com';

/** Legacy host aliases rewritten to R2 for binaries */
export const OBJECTSTORE_REDIRECT = 'https://objectstore.grudge-studio.com';

/**
 * Resolve a relative or legacy asset path to an absolute canonical URL.
 * Always prefers assets.grudge-studio.com for icons/models.
 * @param {string} path - e.g. "/icons/weapons/foo.png" or full URL
 * @param {string} [base=ICON_CDN]
 * @returns {string|null}
 */
export function absAssetUrl(path, base = ICON_CDN) {
  if (!path) return null;
  const s = String(path).trim();
  if (!s) return null;

  if (s.startsWith('http://') || s.startsWith('https://')) {
    try {
      const u = new URL(s);
      // JSON catalog stays on ObjectStore Worker
      if (u.pathname.includes('/api/v1/') && u.pathname.endsWith('.json')) {
        const idx = u.pathname.indexOf('/api/v1');
        return OBJECTSTORE_ORIGIN + u.pathname.slice(idx) + u.search;
      }
      // Icon/binary hosts → R2 CDN
      if (
        u.hostname === 'molochdagod.github.io' ||
        u.hostname === 'objectstore.grudge-studio.com' ||
        u.hostname === 'info.grudge-studio.com' ||
        u.hostname.endsWith('.github.io')
      ) {
        let p = u.pathname.replace(/^\/ObjectStore/i, '');
        if (!p.startsWith('/')) p = '/' + p;
        return base + p;
      }
      if (u.hostname === 'assets.grudge-studio.com') return s;
      return s;
    } catch {
      return s
        .replace(OBJECTSTORE_REDIRECT, ICON_CDN)
        .replace(OBJECTSTORE_PAGES, ICON_CDN);
    }
  }

  const normalized = s.startsWith('/') ? s : '/' + s.replace(/^\.\//, '');
  return base + normalized;
}
