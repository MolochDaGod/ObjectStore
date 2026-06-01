/**
 * Grudge Asset CDN Worker v2.1
 *
 * Production CDN for all Grudge 3D assets, textures, and game data.
 * Optimized for BabylonJS glTF loading with Cloudflare best practices.
 *
 * Deploy:  npx wrangler deploy -c workers/cdn/wrangler.toml
 * Domain:  assets.grudge-studio.com
 *
 * Resolution order:
 *   1. CF Edge Cache (Cache API) — instant, 0ms TTFB
 *   2. R2 bucket (grudge-assets) — origin, <50ms
 *   3. GitHub Pages fallback + auto-backfill to R2
 *
 * glTF Best Practices:
 *   - Range requests for streaming large GLBs (BabylonJS incremental loading)
 *   - Proper model/* MIME types for .glb, .gltf, .bin
 *   - Immutable caching for checksum-addressed pipeline outputs
 *   - No double-compression on Draco GLBs (already compressed)
 *   - CF-Cache-Tag headers for selective purging by category
 *   - ETag + If-None-Match conditional requests
 *   - Access-Control-Expose-Headers for Content-Range (Range response)
 *   - CORS with Vary: Origin for CDN correctness
 */

const GITHUB_PAGES_BASE = 'https://objectstore.grudge-studio.com';

// ════════════════════════════════════════════════════════════════════════
//  CORS — all Grudge domains + local dev
// ════════════════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = new Set([
  'https://grudgewarlords.com',
  'https://www.grudgewarlords.com',
  'https://grudge-studio.com',
  'https://play.grudge-studio.com',
  'https://engine.grudge-studio.com',
  'https://dash.grudge-studio.com',
  'https://id.grudge-studio.com',
  'https://account.grudge-studio.com',
  'https://client.grudge-studio.com',
  'https://pvp.grudge-studio.com',
  'https://molochdagod.github.io',
  'https://grudgedot-launcher.vercel.app',
  'https://grudge-engine-web.vercel.app',
  'https://grudge-builder.vercel.app',
  'https://grudge-warlords-game.vercel.app',
  'https://warlord-crafting-suite.vercel.app',
  'https://app.puter.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'https://mech.grudge-studio.com',
  'https://mech-playground.vercel.app',
  'http://localhost:4173',
  'http://localhost:8080',
]);

// Wildcard origin patterns. Anything matching is allowed. Mirrors the matcher
// used in the sibling objectstore worker (see ObjectStore/workers/src/index.js).
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.grudge-studio\.com$/i,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+\.puter\.site$/i,
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  for (const re of ALLOWED_ORIGIN_PATTERNS) if (re.test(origin)) return true;
  return false;
}


// ════════════════════════════════════════════════════════════════════════
//  MIME Types — complete for game assets
// ════════════════════════════════════════════════════════════════════════
const MIME = {
  // glTF ecosystem
  '.glb':   'model/gltf-binary',
  '.gltf':  'model/gltf+json',
  '.bin':   'application/octet-stream',
  // Legacy 3D
  '.fbx':   'application/octet-stream',
  '.obj':   'text/plain',
  '.dae':   'model/vnd.collada+xml',
  // Images
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.tga': 'image/x-tga',
  '.ktx2': 'image/ktx2', '.basis': 'image/x-basis',
  // Audio
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  '.m4a': 'audio/mp4', '.flac': 'audio/flac',
  // Video
  '.mp4': 'video/mp4', '.webm': 'video/webm',
  // Data
  '.json': 'application/json', '.csv': 'text/csv', '.xml': 'application/xml',
  // Web
  '.html': 'text/html', '.css': 'text/css',
  '.js': 'application/javascript', '.wasm': 'application/wasm',
  // Fonts
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf',
  // Shaders
  '.glsl': 'text/plain', '.vert': 'text/plain', '.frag': 'text/plain',
};

// Already-compressed formats — skip CF gzip/brotli
const PRE_COMPRESSED = new Set([
  '.glb', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp3', '.ogg',
  '.mp4', '.webm', '.woff', '.woff2', '.ktx2', '.basis', '.flac',
]);

// ════════════════════════════════════════════════════════════════════════
//  Cache tiers
// ════════════════════════════════════════════════════════════════════════

function getCacheControl(key) {
  // Pipeline outputs are checksum-addressed — immutable
  if (key.includes('_optimized/') || key.includes('_converted/')) {
    return 'public, max-age=31536000, immutable';
  }
  const ext = getExt(key);
  // Binary assets — 30 days + stale revalidation
  if (['.glb','.gltf','.fbx','.obj','.png','.jpg','.jpeg','.gif','.webp',
       '.mp3','.ogg','.wav','.mp4','.webm','.ktx2','.basis','.woff','.woff2',
       '.ttf','.otf','.tga'].includes(ext)) {
    return 'public, max-age=2592000, stale-while-revalidate=86400';
  }
  // JSON registries — 5 min + 1 hour stale
  if (ext === '.json') return 'public, max-age=300, stale-while-revalidate=3600';
  return 'public, max-age=300, stale-while-revalidate=600';
}

function getCacheTags(key) {
  const tags = [];
  const ext = getExt(key);
  const parts = key.split('/');

  if (['.glb','.gltf','.fbx','.obj'].includes(ext)) tags.push('3d-model');
  else if (['.png','.jpg','.jpeg','.webp','.tga','.ktx2'].includes(ext)) tags.push('texture');
  else if (['.mp3','.ogg','.wav'].includes(ext)) tags.push('audio');
  else if (ext === '.json') tags.push('json-data');

  if (parts[0] === 'models') {
    tags.push('models');
    if (parts[1] === '_optimized') { tags.push('pipeline'); if (parts[2]) tags.push(`m-${parts[2]}`); }
  }
  if (parts[0] === 'effects') { tags.push('effects'); if (parts[2]) tags.push(`fx-${parts[2]}`); }
  if (parts[0] === 'api') tags.push('api');

  return tags.join(',');
}

// ════════════════════════════════════════════════════════════════════════
//  Main handler
// ════════════════════════════════════════════════════════════════════════
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return cors(origin, new Response(null, { status: 204 }));
    }

    if (url.pathname === '/_health' || url.pathname === '/health') {
      return cors(origin, Response.json({
        status: 'ok', service: 'grudge-asset-cdn', version: '2.1.0',
        features: ['range-requests','etag','cf-cache','backfill','gltf-optimized','cache-tags'],
      }));
    }

    if (url.pathname === '/_stats') return cors(origin, await handleStats(env));

    if (url.pathname === '/_purge' && request.method === 'POST') {
      const p = url.searchParams.get('path');
      if (!p) return cors(origin, Response.json({ error: 'path required' }, { status: 400 }));
      const k = normalizeKey(p);
      await env.BUCKET.delete(k);
      await caches.default.delete(new Request(`${url.origin}/${k}`));
      return cors(origin, Response.json({ purged: k }));
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return cors(origin, Response.json({ error: 'Method not allowed' }, { status: 405 }));
    }

    const key = normalizeKey(url.pathname);
    if (!key) {
      return cors(origin, Response.json({
        service: 'grudge-asset-cdn', version: '2.1.0',
        usage: 'GET /<path>',
        examples: ['/models/_optimized/buildings/cantina.glb', '/effects/3d/fire/arpg-effects_fire_16x4.png', '/api/v1/effect-definitions.json'],
      }));
    }

    try {
      return cors(origin, await serveAsset(request, url, key, env, ctx));
    } catch (err) {
      console.error(`[CDN] ${key}:`, err);
      return cors(origin, Response.json({ error: 'Internal error', path: key }, { status: 500 }));
    }
  },
};

// ════════════════════════════════════════════════════════════════════════
//  Asset serving: CF Cache → R2 → GitHub Pages → 404
// ════════════════════════════════════════════════════════════════════════

async function serveAsset(request, url, key, env, ctx) {
  const mime = getMime(key);
  const cc = getCacheControl(key);
  const tags = getCacheTags(key);
  const hasRange = !!request.headers.get('Range');
  const cache = caches.default;
  const cacheReq = new Request(url.toString(), request);

  // ── CF Edge Cache (skip for Range) ──────────────────────────────
  if (!hasRange) {
    const hit = await cache.match(cacheReq);
    if (hit) { trackHit(env, ctx, 'edge'); return hit; }
  }

  // ── R2 ──────────────────────────────────────────────────────────
  const r2Opts = hasRange ? { range: parseRange(request.headers.get('Range')) } : {};
  const r2 = await env.BUCKET.get(key, r2Opts);

  if (r2) {
    trackHit(env, ctx, 'r2');
    const etag = r2.httpEtag;

    // 304 conditional
    if (!hasRange && request.headers.get('If-None-Match') === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } });
    }

    const h = buildHeaders(mime, cc, tags, etag, 'r2', key);
    h.set('Accept-Ranges', 'bytes');

    // 206 Partial
    if (hasRange && r2.range) {
      const { offset, length } = r2.range;
      h.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${r2.size || '*'}`);
      h.set('Content-Length', String(length));
      return request.method === 'HEAD'
        ? new Response(null, { status: 206, headers: h })
        : new Response(r2.body, { status: 206, headers: h });
    }

    // Full 200
    if (r2.size) h.set('Content-Length', String(r2.size));
    if (request.method === 'HEAD') return new Response(null, { status: 200, headers: h });

    const resp = new Response(r2.body, { status: 200, headers: h });
    if (!hasRange && cc.includes('max-age')) ctx.waitUntil(cache.put(cacheReq, resp.clone()));
    return resp;
  }

  // ── GitHub Pages fallback ───────────────────────────────────────
  const gh = await fetch(`${GITHUB_PAGES_BASE}/${key}`, {
    headers: { 'User-Agent': 'GrudgeAssetCDN/2.1' },
  });

  if (!gh.ok) {
    trackHit(env, ctx, 'miss');
    return Response.json({ error: 'Not found', path: key, checked: ['edge','r2','github'] }, { status: 404 });
  }

  trackHit(env, ctx, 'github');
  const body = await gh.arrayBuffer();
  const h = buildHeaders(mime, cc, tags, null, 'github-backfill', key);
  h.set('Content-Length', String(body.byteLength));
  h.set('Accept-Ranges', 'bytes');

  ctx.waitUntil(backfillR2(env, key, body, mime));

  if (request.method === 'HEAD') return new Response(null, { status: 200, headers: h });
  const resp = new Response(body, { status: 200, headers: h });
  if (cc.includes('max-age')) ctx.waitUntil(cache.put(cacheReq, resp.clone()));
  return resp;
}

async function backfillR2(env, key, body, mime) {
  try {
    await env.BUCKET.put(key, body, {
      httpMetadata: { contentType: mime },
      customMetadata: { source: 'github-backfill', at: new Date().toISOString() },
    });
  } catch (e) { console.error(`[CDN] Backfill fail: ${key}`, e); }
}

// ════════════════════════════════════════════════════════════════════════
//  Range parsing (RFC 7233)
// ════════════════════════════════════════════════════════════════════════
function parseRange(header) {
  if (!header) return undefined;
  const m = header.match(/^bytes=(\d+)-(\d*)$/);
  if (!m) return undefined;
  const offset = parseInt(m[1], 10);
  return m[2] ? { offset, length: parseInt(m[2], 10) - offset + 1 } : { offset };
}

// ════════════════════════════════════════════════════════════════════════
//  Stats
// ════════════════════════════════════════════════════════════════════════
function trackHit(env, ctx, src) {
  if (!env.DB) return;
  ctx.waitUntil(env.DB.prepare('INSERT INTO cdn_stats (source, ts) VALUES (?, ?)').bind(src, Date.now()).run().catch(() => {}));
}

async function handleStats(env) {
  if (!env.DB) return Response.json({ error: 'No D1' }, { status: 501 });
  try {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS cdn_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, source TEXT NOT NULL, ts INTEGER NOT NULL)').run();
    const h = Date.now() - 3600_000, d = Date.now() - 86400_000;
    const [hr, dy] = await Promise.all([
      env.DB.prepare('SELECT source, COUNT(*) as c FROM cdn_stats WHERE ts>? GROUP BY source').bind(h).all(),
      env.DB.prepare('SELECT source, COUNT(*) as c FROM cdn_stats WHERE ts>? GROUP BY source').bind(d).all(),
    ]);
    return Response.json({
      last_hour: Object.fromEntries((hr.results||[]).map(r=>[r.source,r.c])),
      last_24h: Object.fromEntries((dy.results||[]).map(r=>[r.source,r.c])),
    });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

// ════════════════════════════════════════════════════════════════════════
//  Utilities
// ════════════════════════════════════════════════════════════════════════
function normalizeKey(p) { let k = decodeURIComponent(p).replace(/^\/+/,'').replace(/\/+$/,''); return k.includes('..') ? null : k || null; }
function getExt(k) { const d = k.lastIndexOf('.'); return d >= 0 ? k.substring(d).toLowerCase() : ''; }
function getMime(k) { return MIME[getExt(k)] || 'application/octet-stream'; }

function buildHeaders(mime, cc, tags, etag, src, key) {
  const h = new Headers({ 'Content-Type': mime, 'Cache-Control': cc, 'X-Asset-Source': src, 'X-Powered-By': 'Grudge CDN/2.1' });
  if (etag) h.set('ETag', etag);
  if (tags) h.set('CF-Cache-Tag', tags);
  if (PRE_COMPRESSED.has(getExt(key))) h.set('Content-Encoding', 'identity');
  return h;
}

function cors(origin, resp) {
  const h = new Headers(resp.headers);
  h.set('Access-Control-Allow-Origin', isOriginAllowed(origin) ? origin : 'https://grudgewarlords.com');
  h.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, If-None-Match');
  h.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, ETag, Accept-Ranges, CF-Cache-Tag, X-Asset-Source');
  h.set('Access-Control-Max-Age', '86400');
  h.set('Vary', 'Origin');
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: h });
}
