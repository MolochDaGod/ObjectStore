/**
 * asset-config.js — Canonical CDN bases for ObjectStore assets
 *
 * Icons & 3D models: assets.grudge-studio.com (R2)
 * JSON catalog:      molochdagod.github.io/ObjectStore (GitHub Pages)
 */

export const ICON_CDN = 'https://assets.grudge-studio.com';
export const MODEL_CDN = 'https://assets.grudge-studio.com';
export const OBJECTSTORE_PAGES = 'https://molochdagod.github.io/ObjectStore';

/** Legacy redirect — normalize to canonical R2 */
export const OBJECTSTORE_REDIRECT = 'https://objectstore.grudge-studio.com';

/**
 * Resolve a relative or legacy asset path to an absolute canonical URL.
 * @param {string} path - e.g. "/icons/weapons/foo.png" or full URL
 * @param {string} [base=ICON_CDN]
 * @returns {string|null}
 */
export function absAssetUrl(path, base = ICON_CDN) {
  if (!path) return null;
  const s = String(path).trim();
  if (!s) return null;

  if (s.startsWith('http://') || s.startsWith('https://')) {
    return s
      .replace(OBJECTSTORE_REDIRECT, ICON_CDN)
      .replace(OBJECTSTORE_PAGES, ICON_CDN);
  }

  const normalized = s.startsWith('/') ? s : '/' + s.replace(/^\.\//, '');
  return base + normalized;
}