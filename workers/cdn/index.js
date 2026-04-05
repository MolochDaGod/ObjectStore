/**
 * Grudge Asset CDN Worker
 *
 * Serves game assets from R2 with automatic GitHub Pages fallback.
 * When a file is missing from R2 but exists on GitHub Pages, the worker
 * serves it AND backfills it into R2 so the next request is instant.
 *
 * Deploy:  npx wrangler deploy -c workers/cdn/wrangler.toml
 * Domain:  assets.grudge-studio.com
 *
 * Resolution order:
 *   1. R2 bucket (grudge-assets) — edge-cached, fastest
 *   2. GitHub Pages (molochdagod.github.io/ObjectStore) — fallback
 *   3. 404 with helpful JSON error
 *
 * Features:
 *   - Auto-backfill: GitHub Pages hits get written to R2 in the background
 *   - Proper CORS for all grudge domains
 *   - Content-type detection from extension
 *   - Cache-Control: immutable for hashed assets, 1h for others
 *   - ETag / If-None-Match support
 *   - /_health endpoint for monitoring
 *   - /_stats endpoint for cache hit/miss counts (via D1)
 */

const GITHUB_PAGES_BASE = 'https://molochdagod.github.io/ObjectStore';

const ALLOWED_ORIGINS = [
  'https://grudgewarlords.com',
  'https://www.grudgewarlords.com',
  'https://grudge-studio.com',
  'https://play.grudge-studio.com',
  'https://engine.grudge-studio.com',
  'https://dash.grudge-studio.com',
  'https://id.grudge-studio.com',
  'https://account.grudge-studio.com',
  'https://pvp.grudge-studio.com',
  'https://molochdagod.github.io',
  'http://localhost:5000',
  'http://localhost:5173',
];

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.glb': 'model/gltf-binary',
  '.gltf': 'application/json',
  '.fbx': 'application/octet-stream',
  '.obj': 'text/plain',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // ── CORS preflight ─────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return corsResponse(origin, new Response(null, { status: 204 }));
    }

    // ── Health check ───────────────────────────────────────────────
    if (url.pathname === '/_health' || url.pathname === '/health') {
      return corsResponse(origin, Response.json({
        status: 'ok',
        service: 'grudge-asset-cdn',
        version: '1.0.0',
        r2_bucket: 'grudge-assets',
        fallback: GITHUB_PAGES_BASE,
      }));
    }

    // ── Stats endpoint ─────────────────────────────────────────────
    if (url.pathname === '/_stats') {
      return corsResponse(origin, await handleStats(env));
    }

    // ── Purge cache for a path (POST /_purge?path=/foo/bar.png) ───
    if (url.pathname === '/_purge' && request.method === 'POST') {
      const purgePath = url.searchParams.get('path');
      if (!purgePath) return corsResponse(origin, Response.json({ error: 'path required' }, { status: 400 }));
      const key = normalizeKey(purgePath);
      await env.BUCKET.delete(key);
      return corsResponse(origin, Response.json({ purged: key }));
    }

    // ── Only GET/HEAD for asset serving ─────────────────────────────
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return corsResponse(origin, Response.json({ error: 'Method not allowed' }, { status: 405 }));
    }

    // ── Serve asset ────────────────────────────────────────────────
    const key = normalizeKey(url.pathname);
    if (!key) {
      return corsResponse(origin, Response.json({
        service: 'grudge-asset-cdn',
        usage: 'GET /<path> to fetch an asset',
        example: '/backgrounds/arena_battle.png',
      }));
    }

    try {
      const result = await serveAsset(request, key, env, ctx);
      return corsResponse(origin, result);
    } catch (err) {
      console.error(`[CDN] Error serving ${key}:`, err);
      return corsResponse(origin, Response.json(
        { error: 'Internal error', path: key },
        { status: 500 }
      ));
    }
  },
};

// ════════════════════════════════════════════════════════════════════════
//  Core: serve from R2, fallback to GitHub Pages, backfill
// ════════════════════════════════════════════════════════════════════════

async function serveAsset(request, key, env, ctx) {
  const mime = getMime(key);

  // ── Step 1: Try R2 ─────────────────────────────────────────────
  const r2Object = await env.BUCKET.get(key);

  if (r2Object) {
    trackHit(env, ctx, 'r2');

    // ETag / conditional request support
    const etag = r2Object.httpEtag;
    if (request.headers.get('If-None-Match') === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } });
    }

    const headers = assetHeaders(mime, etag, 'r2');
    if (request.method === 'HEAD') {
      headers.set('Content-Length', String(r2Object.size));
      return new Response(null, { status: 200, headers });
    }
    return new Response(r2Object.body, { status: 200, headers });
  }

  // ── Step 2: Fallback to GitHub Pages ───────────────────────────
  const ghUrl = `${GITHUB_PAGES_BASE}/${key}`;
  const ghResponse = await fetch(ghUrl, {
    headers: { 'User-Agent': 'GrudgeAssetCDN/1.0' },
  });

  if (!ghResponse.ok) {
    trackHit(env, ctx, 'miss');
    return Response.json(
      { error: 'Asset not found', path: key, checked: ['r2', 'github-pages'] },
      { status: 404 }
    );
  }

  trackHit(env, ctx, 'github');

  // Read the body so we can serve it AND backfill
  const body = await ghResponse.arrayBuffer();

  // ── Step 3: Backfill to R2 (non-blocking) ─────────────────────
  ctx.waitUntil(backfillR2(env, key, body, mime));

  const headers = assetHeaders(mime, null, 'github-backfill');
  if (request.method === 'HEAD') {
    headers.set('Content-Length', String(body.byteLength));
    return new Response(null, { status: 200, headers });
  }
  return new Response(body, { status: 200, headers });
}

async function backfillR2(env, key, body, mime) {
  try {
    await env.BUCKET.put(key, body, {
      httpMetadata: { contentType: mime },
      customMetadata: { source: 'github-backfill', backfilledAt: new Date().toISOString() },
    });
    console.log(`[CDN] Backfilled to R2: ${key} (${body.byteLength} bytes)`);
  } catch (err) {
    console.error(`[CDN] Backfill failed for ${key}:`, err);
  }
}

// ════════════════════════════════════════════════════════════════════════
//  Stats tracking (lightweight, via D1 if available)
// ════════════════════════════════════════════════════════════════════════

function trackHit(env, ctx, source) {
  if (!env.DB) return;
  ctx.waitUntil(
    env.DB.prepare(
      `INSERT INTO cdn_stats (source, ts) VALUES (?, ?) ON CONFLICT DO NOTHING`
    ).bind(source, Date.now()).run().catch(() => {})
  );
}

async function handleStats(env) {
  if (!env.DB) {
    return Response.json({ error: 'No D1 database bound' }, { status: 501 });
  }
  try {
    // Try to create the stats table if it doesn't exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS cdn_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        ts INTEGER NOT NULL
      )
    `).run();

    const hour = Date.now() - 3600_000;
    const day = Date.now() - 86400_000;

    const hourly = await env.DB.prepare(
      `SELECT source, COUNT(*) as count FROM cdn_stats WHERE ts > ? GROUP BY source`
    ).bind(hour).all();

    const daily = await env.DB.prepare(
      `SELECT source, COUNT(*) as count FROM cdn_stats WHERE ts > ? GROUP BY source`
    ).bind(day).all();

    return Response.json({
      last_hour: Object.fromEntries((hourly.results || []).map(r => [r.source, r.count])),
      last_24h: Object.fromEntries((daily.results || []).map(r => [r.source, r.count])),
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ════════════════════════════════════════════════════════════════════════
//  Utilities
// ════════════════════════════════════════════════════════════════════════

function normalizeKey(pathname) {
  // Strip leading slash, decode URI components
  let key = decodeURIComponent(pathname).replace(/^\/+/, '');
  // Remove trailing slash
  key = key.replace(/\/+$/, '');
  // Block path traversal
  if (key.includes('..')) return null;
  return key || null;
}

function getMime(key) {
  const ext = '.' + key.split('.').pop()?.toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function assetHeaders(mime, etag, source) {
  const headers = new Headers({
    'Content-Type': mime,
    'X-Asset-Source': source,
    'X-Powered-By': 'Grudge Asset CDN',
  });

  // Immutable cache for hashed filenames (Vite output), shorter for others
  if (etag) headers.set('ETag', etag);
  headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

  return headers;
}

function corsResponse(origin, response) {
  const headers = new Headers(response.headers);

  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  headers.set('Access-Control-Allow-Origin', allowed);
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
