#!/usr/bin/env node
/**
 * Sync ICON-* UUID icon library into Grudge Studio source-of-truth APIs.
 *
 * Reads api/v1/icon-registry.json and emits/updates:
 *   - icon-path-index.json     (fast /icons/... → UUID lookup)
 *   - assets-api.json          (icon + asset API manifest)
 *   - master-registry.json     (ICON prefix + iconUuid cross-refs on items)
 *   - catalog.json             (totals + endpoints)
 *
 * Usage: node scripts/sync-icon-source-of-truth.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeIconPath, resolveIconCdnUrl, ASSET_CDN_BASE } from '../lib/icon-resolver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(__dirname, '..', 'api', 'v1');

async function loadJson(name) {
  const raw = await readFile(join(API, name), 'utf8');
  return JSON.parse(raw);
}

async function saveJson(name, data) {
  await writeFile(join(API, name), JSON.stringify(data, null, 2), 'utf8');
  console.log(`[sync] wrote ${name}`);
}

async function main() {
  const iconRegistry = await loadJson('icon-registry.json');
  const entries = Object.values(iconRegistry.entries || {});
  console.log(`[sync] icon-registry: ${entries.length} entries`);

  // ── icon-path-index.json ──
  const pathIndex = {};
  for (const e of entries) {
    if (e.iconPath) {
      pathIndex[e.iconPath] = {
        grudgeUuid: e.grudgeUuid,
        cdnUrl: e.cdnUrl,
        category: e.category,
      };
    }
  }
  await saveJson('icon-path-index.json', {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    cdnBase: iconRegistry.cdnBase || ASSET_CDN_BASE,
    keyPrefix: iconRegistry.keyPrefix || 'game-assets',
    totalEntries: entries.length,
    index: pathIndex,
  });

  // ── assets-api.json ──
  await saveJson('assets-api.json', {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    description: 'Grudge Studio image asset library — ICON UUIDs on R2 CDN',
    cdnBase: ASSET_CDN_BASE,
    objectStoreBase: 'https://objectstore.grudge-studio.com',
    uuidScheme: {
      ICON: 'Deterministic sha1(grudge-asset:{r2Key}) — canonical image assets',
      ITEM: 'Runtime item instances (master-registry)',
      HERO: 'Player characters (grudge-backend)',
      EQIP: 'Equipment models (grudge-backend)',
    },
    datasets: {
      iconRegistry: '/api/v1/icon-registry.json',
      iconPathIndex: '/api/v1/icon-path-index.json',
      masterRegistry: '/api/v1/master-registry.json',
      assetRegistry: '/api/v1/asset-registry.json',
    },
    rest: {
      listIcons: 'GET /api/v1/icons?category=skill&page=1&limit=50',
      searchIcons: 'GET /api/v1/icons/search?q=fire&category=spell',
      iconByUuid: 'GET /api/v1/icons/:grudgeUuid',
      iconByPath: 'GET /api/v1/icons/by-path?path=/icons/sigils/strength.png',
      categories: 'GET /api/v1/icons/categories',
    },
    sdk: {
      getIconRegistry: 'grudgeSDK.getIconRegistry()',
      getIconByUuid: 'grudgeSDK.getIconByUuid(uuid)',
      resolveIconUrl: 'grudgeSDK.resolveIconUrl(pathOrUuid)',
      getIconsByCategory: 'grudgeSDK.getIconsByCategory(category)',
    },
    categories: iconRegistry.categories || {},
    totalIcons: entries.length,
    documentation: '/docs/ICON-ASSET-LIBRARY.md',
    uploadStatus: '/api/v1/icon-upload-status.json',
    scripts: {
      upload: 'node scripts/upload-icon-registry-r2.mjs --skip-existing --skip-remote-verify',
      registryOnly: 'node scripts/upload-icon-registry-r2.mjs --registry-only',
      sync: 'npm run sync:icon-truth',
      status: 'npm run icons:status',
    },
  });

  // ── Patch master-registry with iconUuid + normalized iconCdnUrl ──
  let masterRegistry;
  try {
    masterRegistry = await loadJson('master-registry.json');
    let linked = 0;
    for (const [uuid, row] of Object.entries(masterRegistry.entries || {})) {
      if (!row.iconUrl) continue;
      const norm = normalizeIconPath(row.iconUrl);
      const hit = norm ? pathIndex[norm] : null;
      if (hit) {
        row.iconUuid = hit.grudgeUuid;
        row.iconCdnUrl = hit.cdnUrl;
        linked++;
      } else {
        row.iconCdnUrl = resolveIconCdnUrl(row.iconUrl);
      }
    }
    masterRegistry.version = '2.1.0';
    masterRegistry.generated = new Date().toISOString();
    masterRegistry.prefixes = {
      ...masterRegistry.prefixes,
      ICON: 'Image assets — skills, sigils, abilities, class/race/faction icons (deterministic R2 key UUID)',
    };
    masterRegistry.iconRegistry = {
      path: '/api/v1/icon-registry.json',
      pathIndex: '/api/v1/icon-path-index.json',
      totalEntries: entries.length,
      categories: iconRegistry.categories,
      itemsLinked: linked,
    };
    await saveJson('master-registry.json', masterRegistry);
    console.log(`[sync] master-registry: linked ${linked} item iconUrls → ICON UUIDs`);
  } catch (e) {
    console.warn('[sync] master-registry skip:', e.message);
  }

  // ── Update catalog.json ──
  try {
    const catalog = await loadJson('catalog.json');
    catalog.version = '5.1.0';
    catalog.generated = new Date().toISOString();
    catalog.totals = {
      ...catalog.totals,
      iconRegistry: entries.length,
      iconCategories: Object.keys(iconRegistry.categories || {}).length,
    };
    const endpointNames = new Set((catalog.endpoints || []).map(e => e.name));
    for (const name of ['assets-api.json', 'icon-path-index.json']) {
      if (!endpointNames.has(name)) {
        catalog.endpoints.push({ name, path: `/api/v1/${name}` });
      }
    }
    catalog.iconLibrary = {
      registry: '/api/v1/icon-registry.json',
      pathIndex: '/api/v1/icon-path-index.json',
      assetsApi: '/api/v1/assets-api.json',
      uploadStatus: '/api/v1/icon-upload-status.json',
      documentation: '/docs/ICON-ASSET-LIBRARY.md',
      cdnBase: ASSET_CDN_BASE,
      keyPrefix: 'game-assets',
      uuidPrefix: 'ICON',
      totalEntries: entries.length,
      categories: iconRegistry.categories,
    };
    for (const name of ['icon-upload-status.json']) {
      if (!endpointNames.has(name)) {
        catalog.endpoints.push({ name, path: `/api/v1/${name}` });
      }
    }
    await saveJson('catalog.json', catalog);
  } catch (e) {
    console.warn('[sync] catalog skip:', e.message);
  }

  console.log('[sync] Done — source of truth updated for ICON UUID image library.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});