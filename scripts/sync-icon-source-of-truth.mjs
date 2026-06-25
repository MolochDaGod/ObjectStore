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

  // ── icon-category-index.json + per-category shards (browser-friendly) ──
  const CATEGORY_META = {
    weapon: { label: 'Weapons', emoji: '⚔️', order: 1 },
    armor: { label: 'Armor', emoji: '🛡️', order: 2 },
    skill: { label: 'Skills', emoji: '✨', order: 3 },
    spell: { label: 'Spells', emoji: '🔮', order: 4 },
    ability: { label: 'Abilities', emoji: '⚡', order: 5 },
    sigil: { label: 'Sigils', emoji: '🔱', order: 6 },
    class: { label: 'Classes', emoji: '👤', order: 7 },
    race: { label: 'Races', emoji: '🧝', order: 8 },
    faction: { label: 'Factions', emoji: '🏴', order: 9 },
    profession: { label: 'Professions', emoji: '🔨', order: 10 },
    consumable: { label: 'Consumables', emoji: '🧪', order: 11 },
    material: { label: 'Materials', emoji: '📦', order: 12 },
    item: { label: 'Items', emoji: '📋', order: 13 },
    entity: { label: 'Entities', emoji: '👾', order: 14 },
    ui: { label: 'UI', emoji: '🖥️', order: 15 },
    misc: { label: 'Misc', emoji: '📁', order: 99 },
  };

  const byCategory = {};
  const searchRows = [];
  for (const e of entries) {
    const cat = e.category || 'misc';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({
      u: e.grudgeUuid,
      n: e.name,
      p: e.iconPath,
      c: e.cdnUrl,
      s: e.subcategory || null,
      f: e.fileName,
    });
    searchRows.push([e.grudgeUuid, e.name, e.iconPath, cat, e.subcategory || '', e.cdnUrl]);
  }

  const shardsDir = join(API, 'icon-shards');
  const { mkdir } = await import('node:fs/promises');
  await mkdir(shardsDir, { recursive: true });

  const categoryIndex = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    cdnBase: iconRegistry.cdnBase || ASSET_CDN_BASE,
    totalEntries: entries.length,
    browser: '/ICON_BROWSER.html',
    categories: {},
  };

  for (const [cat, icons] of Object.entries(byCategory)) {
    icons.sort((a, b) => a.n.localeCompare(b.n));
    const meta = CATEGORY_META[cat] || { label: cat, emoji: '🖼️', order: 50 };
    const subcats = {};
    for (const ic of icons) {
      const sc = ic.s || '_root';
      subcats[sc] = (subcats[sc] || 0) + 1;
    }
    categoryIndex.categories[cat] = {
      label: meta.label,
      emoji: meta.emoji,
      order: meta.order,
      count: icons.length,
      shard: `/api/v1/icon-shards/${cat}.json`,
      subcategories: subcats,
      samples: icons.slice(0, 8).map(i => ({ u: i.u, n: i.n, p: i.p, c: i.c })),
    };
    await writeFile(
      join(shardsDir, `${cat}.json`),
      JSON.stringify({
        version: '1.0.0',
        category: cat,
        label: meta.label,
        count: icons.length,
        cdnBase: iconRegistry.cdnBase || ASSET_CDN_BASE,
        icons,
      }),
      'utf8',
    );
    console.log(`[sync] wrote icon-shards/${cat}.json (${icons.length})`);
  }

  await saveJson('icon-category-index.json', categoryIndex);
  await saveJson('icon-search-index.json', {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalEntries: searchRows.length,
    fields: ['grudgeUuid', 'name', 'iconPath', 'category', 'subcategory', 'cdnUrl'],
    icons: searchRows,
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
      iconCategoryIndex: '/api/v1/icon-category-index.json',
      iconSearchIndex: '/api/v1/icon-search-index.json',
      iconShards: '/api/v1/icon-shards/{category}.json',
      masterRegistry: '/api/v1/master-registry.json',
      assetRegistry: '/api/v1/asset-registry.json',
    },
    browser: {
      page: '/ICON_BROWSER.html',
      hub: '/hub.html',
      documentation: '/docs/ICON-ASSET-LIBRARY.md',
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
    for (const name of [
      'assets-api.json',
      'icon-path-index.json',
      'icon-category-index.json',
      'icon-search-index.json',
    ]) {
      if (!endpointNames.has(name)) {
        catalog.endpoints.push({ name, path: `/api/v1/${name}` });
      }
    }
    catalog.iconLibrary = {
      registry: '/api/v1/icon-registry.json',
      pathIndex: '/api/v1/icon-path-index.json',
      categoryIndex: '/api/v1/icon-category-index.json',
      searchIndex: '/api/v1/icon-search-index.json',
      shards: '/api/v1/icon-shards/{category}.json',
      browser: '/ICON_BROWSER.html',
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