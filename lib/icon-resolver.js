/**
 * Grudge Studio — Icon Asset Resolver
 * Canonical helpers for ICON-* UUIDs and CDN URLs from ObjectStore icon-registry.
 */

import { createHash } from 'node:crypto';

export const ASSET_CDN_BASE = 'https://assets.grudge-studio.com';
export const ASSET_R2_KEY_PREFIX = 'game-assets';
export const ICON_REGISTRY_PATH = '/api/v1/icon-registry.json';
export const ICON_PATH_INDEX_PATH = '/api/v1/icon-path-index.json';

/** Deterministic ICON-* UUID from R2 key (matches upload-icon-registry-r2.mjs). */
export function deriveIconGrudgeUuid(r2Key) {
  const normalized = String(r2Key).replace(/^\/+/, '');
  const h = createHash('sha1').update(`grudge-asset:${normalized}`).digest('hex');
  return `ICON-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`.toUpperCase();
}

/** Build public CDN URL from relative icon path or R2 key. */
export function resolveIconCdnUrl(iconPathOrKey, cdnBase = ASSET_CDN_BASE) {
  if (!iconPathOrKey) return null;
  if (/^https?:\/\//i.test(iconPathOrKey)) return iconPathOrKey;

  let path = iconPathOrKey.replace(/^\/+/, '');
  if (path.startsWith(`${ASSET_R2_KEY_PREFIX}/`)) {
    return `${cdnBase}/${path}`;
  }
  if (path.startsWith('icons/')) {
    return `${cdnBase}/${ASSET_R2_KEY_PREFIX}/${path}`;
  }
  if (path.startsWith('/icons/')) {
    return `${cdnBase}/${ASSET_R2_KEY_PREFIX}${path}`;
  }
  return `${cdnBase}/${ASSET_R2_KEY_PREFIX}/icons/${path}`;
}

/** Normalize any icon reference to /icons/... path for index lookup. */
export function normalizeIconPath(iconPath) {
  if (!iconPath) return null;
  if (/^https?:\/\//i.test(iconPath)) {
    const m = iconPath.match(/\/game-assets(\/icons\/.*)$/i) || iconPath.match(/(\/icons\/.*)$/i);
    return m ? m[1] : null;
  }
  const p = iconPath.startsWith('/') ? iconPath : `/${iconPath}`;
  return p.startsWith('/icons/') ? p : `/icons/${iconPath.replace(/^\/+/, '')}`;
}

/** Lookup icon entry by ICON-* UUID. */
export function getIconByUuid(registry, grudgeUuid) {
  if (!registry?.entries || !grudgeUuid) return null;
  return registry.entries[grudgeUuid] || null;
}

/** Lookup icon entry by /icons/... path using path index or registry scan. */
export function getIconByPath(pathIndex, iconPath, registry = null) {
  const norm = normalizeIconPath(iconPath);
  if (!norm) return null;
  if (pathIndex?.[norm]) {
    const hit = pathIndex[norm];
    if (typeof hit === 'string' && registry?.entries) return registry.entries[hit] || hit;
    return hit;
  }
  if (registry?.entries) {
    for (const entry of Object.values(registry.entries)) {
      if (entry.iconPath === norm) return entry;
    }
  }
  return null;
}

/** Resolve best CDN URL for a game-data iconUrl field (path, uuid, or absolute). */
export function resolveGameIconUrl(iconRef, { pathIndex, registry, cdnBase } = {}) {
  if (!iconRef) return null;
  if (/^ICON-/i.test(iconRef) && registry) {
    const e = getIconByUuid(registry, iconRef.toUpperCase());
    return e?.cdnUrl || null;
  }
  const byPath = getIconByPath(pathIndex, iconRef, registry);
  if (byPath?.cdnUrl) return byPath.cdnUrl;
  return resolveIconCdnUrl(iconRef, cdnBase);
}

/** Build in-memory indexes from icon-registry.json. */
export function buildIconIndexes(registry) {
  const byUuid = registry?.entries || {};
  const byPath = {};
  const byCategory = {};
  for (const entry of Object.values(byUuid)) {
    if (entry.iconPath) byPath[entry.iconPath] = entry.grudgeUuid;
    const cat = entry.category || 'misc';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(entry.grudgeUuid);
  }
  return { byUuid, byPath, byCategory };
}