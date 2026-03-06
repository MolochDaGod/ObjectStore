/**
 * ObjectStore Server with Asset Registry API
 * 
 * Static file server + dynamic asset endpoints:
 *   GET /api/assets/:uuid         → Asset metadata by UUID
 *   GET /api/assets/search?q=...  → Search assets by name/category
 *   GET /api/assets/categories    → List all asset categories
 * 
 * Usage: node server.js
 * Access at: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ============================================
// Asset Registry (loaded once on startup)
// ============================================

let assetRegistry = null;
let assetSearchIndex = []; // Flattened array for fast search

function loadAssetRegistry() {
  const registryPath = path.join(__dirname, 'api', 'v1', 'asset-registry.json');
  try {
    const raw = fs.readFileSync(registryPath, 'utf-8');
    assetRegistry = JSON.parse(raw);

    // Build search index
    assetSearchIndex = Object.values(assetRegistry.assets).map(a => ({
      uuid: a.uuid,
      searchText: `${a.name} ${a.filename} ${a.category}`.toLowerCase(),
      ...a,
    }));

    console.log(`📦 Asset registry loaded: ${assetRegistry.totalAssets} assets, ${assetRegistry.totalCategories} categories`);
  } catch (err) {
    console.warn('⚠️  Asset registry not found. Run: node scripts/generate-asset-registry.mjs');
    assetRegistry = null;
  }
}

// ============================================
// API Route Handlers
// ============================================

function jsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data), 'utf-8');
}

/** GET /api/assets/categories */
function handleCategories(req, res) {
  if (!assetRegistry) return jsonResponse(res, 503, { error: 'Asset registry not loaded' });

  const categories = {};
  for (const [key, val] of Object.entries(assetRegistry.categories)) {
    categories[key] = { count: val.count };
  }

  jsonResponse(res, 200, {
    totalCategories: assetRegistry.totalCategories,
    totalAssets: assetRegistry.totalAssets,
    categories,
  });
}

/** GET /api/assets/search?q=sword&category=weapons_full&limit=50 */
function handleSearch(req, res, query) {
  if (!assetRegistry) return jsonResponse(res, 503, { error: 'Asset registry not loaded' });

  const q = (query.q || '').toLowerCase().trim();
  const category = query.category || null;
  const limit = Math.min(parseInt(query.limit) || 50, 200);

  if (!q && !category) {
    return jsonResponse(res, 400, { error: 'Provide ?q= or ?category= parameter' });
  }

  let results = assetSearchIndex;

  if (category) {
    results = results.filter(a => a.category === category);
  }

  if (q) {
    results = results.filter(a => a.searchText.includes(q));
  }

  results = results.slice(0, limit);

  jsonResponse(res, 200, {
    query: q,
    category,
    count: results.length,
    results: results.map(({ searchText, ...rest }) => rest),
  });
}

/** GET /api/assets/:uuid */
function handleAssetByUUID(req, res, uuid) {
  if (!assetRegistry) return jsonResponse(res, 503, { error: 'Asset registry not loaded' });

  const asset = assetRegistry.assets[uuid];
  if (!asset) {
    return jsonResponse(res, 404, { error: `Asset not found: ${uuid}` });
  }

  jsonResponse(res, 200, asset);
}

// ============================================
// HTTP Server
// ============================================

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ---- Asset API routes ----
  if (pathname === '/api/assets/categories') {
    return handleCategories(req, res);
  }

  if (pathname === '/api/assets/search') {
    return handleSearch(req, res, parsed.query);
  }

  // /api/assets/SPRT-20260306000000-000001-517F0A6A
  const uuidMatch = pathname.match(/^\/api\/assets\/([A-Z]{4}-\d{14}-[0-9A-F]{6}-[0-9A-F]{8})$/);
  if (uuidMatch) {
    return handleAssetByUUID(req, res, uuidMatch[1]);
  }

  // ---- Static file serving ----
  let filePath = '.' + pathname;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500, CORS_HEADERS);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Load asset registry on startup
loadAssetRegistry();

server.listen(PORT, () => {
  console.log(`🚀 ObjectStore Server running at http://localhost:${PORT}/`);
  console.log(`📊 Test sprites at: http://localhost:${PORT}/test-sprites.html`);
  console.log(`📦 Sprite Database at: http://localhost:${PORT}/SPRITE_DATABASE.html`);
  console.log(``);
  console.log(`🔗 Asset API Endpoints:`);
  console.log(`   GET /api/assets/categories`);
  console.log(`   GET /api/assets/search?q=sword&category=weapons_full`);
  console.log(`   GET /api/assets/{uuid}`);
  console.log(`\n✨ Press Ctrl+C to stop`);
});
