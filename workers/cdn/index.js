/**
 * Grudge Asset CDN Worker v2.3.0
 *
 * Production CDN for all Grudge 3D assets, textures, and game data.
 * Deploy:  npx wrangler deploy -c workers/cdn/wrangler.toml
 * Domain:  assets.grudge-studio.com
 *
 * Resolution order:
 *   1. CF Edge Cache
 *   2. R2 bucket (grudge-assets) — HTML-poisoned objects are deleted
 *   3. GitHub/info fallback ONLY for text that is not HTML (never for meshes)
 *
 * NEVER backfill SPA HTML as .js / .glb — info.grudge-studio.com 200s the hub.
 */
const GITHUB_PAGES_BASE = 'https://info.grudge-studio.com';
const VERSION = '2.3.0';

const MIME = {
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.fbx': 'application/octet-stream',
  '.obj': 'text/plain',
  '.dae': 'model/vnd.collada+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.tga': 'image/x-tga',
  '.ktx2': 'image/ktx2', '.basis': 'image/x-basis',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  '.m4a': 'audio/mp4', '.flac': 'audio/flac',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.json': 'application/json', '.csv': 'text/csv', '.xml': 'application/xml',
  '.html': 'text/html', '.css': 'text/css',
  '.js': 'application/javascript', '.mjs': 'application/javascript', '.wasm': 'application/wasm',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.glsl': 'text/plain', '.vert': 'text/plain', '.frag': 'text/plain',
};

const PRE_COMPRESSED = new Set([
  '.glb', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp3', '.ogg',
  '.mp4', '.webm', '.woff', '.woff2', '.ktx2', '.basis', '.flac',
]);

/** Never GitHub/info-fallback these — missing means 404, not the Warlords hub. */
const NO_GITHUB_FALLBACK = new Set([
  '.glb', '.gltf', '.bin', '.fbx', '.png', '.jpg', '.jpeg', '.webp', '.gif',
  '.wasm', '.ktx2', '.basis', '.mp3', '.ogg', '.wav', '.mp4', '.webm',
  '.woff', '.woff2', '.ttf', '.otf',
]);

function getCacheControl(key) {
  if (key.includes('_optimized/') || key.includes('_converted/')) {
    return 'public, max-age=31536000, immutable';
  }
  const ext = getExt(key);
  if (['.glb','.gltf','.fbx','.obj','.png','.jpg','.jpeg','.gif','.webp',
       '.mp3','.ogg','.wav','.mp4','.webm','.ktx2','.basis','.woff','.woff2',
       '.ttf','.otf','.tga'].includes(ext)) {
    return 'public, max-age=2592000, stale-while-revalidate=86400';
  }
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

function looksLikeHtml(bytes) {
  if (!bytes || !bytes.length) return false;
  let i = 0;
  const n = Math.min(bytes.length, 96);
  while (i < n && (bytes[i] === 0x20 || bytes[i] === 0x09 || bytes[i] === 0x0a || bytes[i] === 0x0d)) i++;
  if (bytes[i] !== 0x3c) return false; // <
  const a = bytes[i + 1] | 0;
  const b = bytes[i + 2] | 0;
  if (a === 0x21) return true; // <!
  if (a === 0x3f) return true; // <?xml
  if (a === 0x68 || a === 0x48) { // h H
    if (b === 0x74 || b === 0x54) return true; // t T → html
  }
  return false;
}

function ghLooksLikeHtml(contentType, bytes) {
  const ct = String(contentType || '').toLowerCase();
  if (ct.includes('text/html') || ct.includes('application/xhtml')) return true;
  return looksLikeHtml(bytes);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    const doubled = String(url.pathname).match(/^\/(https?:)\/+([^/]+)(\/.*)?$/i);
    if (doubled) {
      try {
        const abs = new URL(`${doubled[1]}//${doubled[2]}${doubled[3] || ''}`);
        if (abs.hostname === url.hostname) {
          url.pathname = abs.pathname;
          url.search = abs.search || url.search;
        } else if (/(^|\.)grudge-studio\.com$/i.test(abs.hostname)) {
          return Response.redirect(abs.toString(), 302);
        }
      } catch { /* fall through */ }
    }

    if (request.method === 'OPTIONS') {
      return cors(origin, new Response(null, { status: 204 }));
    }

    if (url.pathname === '/_health' || url.pathname === '/health') {
      return cors(origin, Response.json({
        status: 'ok', service: 'grudge-asset-cdn', version: VERSION,
        features: ['range-requests','etag','cf-cache','backfill','gltf-optimized','cache-tags','html-guard','magic-reject'],
      }));
    }

    if (url.pathname === '/_stats') return cors(origin, await handleStats(env));

    if (url.pathname === '/_purge' && request.method === 'POST') {
      const allowed = authorizePurge(request, url, env);
      if (!allowed) {
        return cors(origin, Response.json({ error: 'unauthorized' }, { status: 401 }));
      }
      const p = url.searchParams.get('path');
      if (!p) return cors(origin, Response.json({ error: 'path required' }, { status: 400 }));
      const k = normalizeKey(p);
      if (!k) return cors(origin, Response.json({ error: 'bad path' }, { status: 400 }));
      await env.BUCKET.delete(k);
      await caches.default.delete(new Request(`${url.origin}/${k}`));
      return cors(origin, Response.json({ purged: k, version: VERSION }));
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return cors(origin, Response.json({ error: 'Method not allowed' }, { status: 405 }));
    }

    const key = normalizeKey(url.pathname);
    if (!key) {
      return cors(origin, Response.json({
        service: 'grudge-asset-cdn', version: VERSION,
        usage: 'GET /<path>',
        examples: ['/js/grudge-fleet.js', '/models/grudge6/races/WK_Characters.glb', '/effects/3d/fire/arpg-effects_fire_16x4.png'],
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

function authorizePurge(request, url, env) {
  const need = env.PURGE_TOKEN;
  if (!need) return true; // unbound: keep open until wrangler secret put PURGE_TOKEN
  const got =
    (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') ||
    request.headers.get('x-grudge-purge') ||
    url.searchParams.get('token') ||
    '';
  return got.length > 0 && got === need;
}

async function serveAsset(request, url, key, env, ctx) {
  const mime = getMime(key);
  const cc = getCacheControl(key);
  const tags = getCacheTags(key);
  const ext = getExt(key);
  const hasRange = !!request.headers.get('Range');
  const cache = caches.default;
  const cacheReq = new Request(url.toString(), request);

  if (!hasRange) {
    const hit = await cache.match(cacheReq);
    if (hit) {
      if (await cachedLooksLikeHtml(hit, ext)) {
        ctx.waitUntil(cache.delete(cacheReq));
      } else {
        trackHit(env, ctx, 'edge');
        return hit;
      }
    }
  }

  const r2Opts = hasRange ? { range: parseRange(request.headers.get('Range')) } : {};
  let r2 = await env.BUCKET.get(key, r2Opts);

  if (r2 && ext !== '.html' && ext !== '.htm') {
    const poisoned = await r2ObjectIsHtml(env, key, r2, hasRange);
    if (poisoned) {
      trackHit(env, ctx, 'poison');
      ctx.waitUntil((async () => {
        try { await env.BUCKET.delete(key); } catch (_) {}
        try { await cache.delete(cacheReq); } catch (_) {}
      })());
      r2 = null;
    }
  }

  if (r2) {
    trackHit(env, ctx, 'r2');
    const etag = r2.httpEtag;
    if (!hasRange && request.headers.get('If-None-Match') === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } });
    }
    const h = buildHeaders(mime, cc, tags, etag, 'r2', key);
    h.set('Accept-Ranges', 'bytes');
    if (hasRange && r2.range) {
      const { offset, length } = r2.range;
      h.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${r2.size || '*'}`);
      h.set('Content-Length', String(length));
      return request.method === 'HEAD'
        ? new Response(null, { status: 206, headers: h })
        : new Response(r2.body, { status: 206, headers: h });
    }
    if (r2.size) h.set('Content-Length', String(r2.size));
    if (request.method === 'HEAD') return new Response(null, { status: 200, headers: h });
    const resp = new Response(r2.body, { status: 200, headers: h });
    if (!hasRange && cc.includes('max-age')) ctx.waitUntil(cache.put(cacheReq, resp.clone()));
    return resp;
  }

  if (NO_GITHUB_FALLBACK.has(ext) || key.includes('_optimized/') || key.includes('_converted/')) {
    trackHit(env, ctx, 'miss');
    return Response.json({ error: 'Not found', path: key, checked: ['edge','r2'], reason: 'no-binary-fallback' }, { status: 404 });
  }

  const gh = await fetch(`${GITHUB_PAGES_BASE}/${key}`, {
    headers: { 'User-Agent': 'GrudgeAssetCDN/2.3' },
  });

  if (!gh.ok) {
    trackHit(env, ctx, 'miss');
    return Response.json({ error: 'Not found', path: key, checked: ['edge','r2','github'] }, { status: 404 });
  }

  const body = await gh.arrayBuffer();
  const peek = new Uint8Array(body, 0, Math.min(96, body.byteLength));
  if (ghLooksLikeHtml(gh.headers.get('content-type'), peek)) {
    trackHit(env, ctx, 'miss');
    return Response.json({
      error: 'Not found', path: key, checked: ['edge','r2','github'],
      reason: 'html-hub-rejected',
    }, { status: 404 });
  }

  trackHit(env, ctx, 'github');
  const h = buildHeaders(mime, cc, tags, null, 'github-backfill', key);
  h.set('Content-Length', String(body.byteLength));
  h.set('Accept-Ranges', 'bytes');
  ctx.waitUntil(backfillR2(env, key, body, mime));
  if (request.method === 'HEAD') return new Response(null, { status: 200, headers: h });
  const resp = new Response(body, { status: 200, headers: h });
  if (cc.includes('max-age')) ctx.waitUntil(cache.put(cacheReq, resp.clone()));
  return resp;
}

async function r2ObjectIsHtml(env, key, _r2, _hasRange) {
  try {
    const peekObj = await env.BUCKET.get(key, { range: { offset: 0, length: 96 } });
    if (!peekObj) return false;
    const peek = new Uint8Array(await peekObj.arrayBuffer());
    return looksLikeHtml(peek);
  } catch {
    return false;
  }
}

async function cachedLooksLikeHtml(hit, ext) {
  if (ext === '.html' || ext === '.htm') return false;
  try {
    const ct = (hit.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('text/html')) return true;
    const len = Number(hit.headers.get('content-length') || 0);
    const maybeText = ct.includes('javascript') || ct.includes('json') || ext === '.js' || ext === '.mjs' || ext === '.json';
    if (!maybeText && len > 65536) return false;
    const clone = hit.clone();
    const ab = await clone.arrayBuffer();
    return looksLikeHtml(new Uint8Array(ab, 0, Math.min(96, ab.byteLength)));
  } catch {
    return false;
  }
}

async function backfillR2(env, key, body, mime) {
  try {
    const peek = new Uint8Array(body, 0, Math.min(96, body.byteLength));
    if (looksLikeHtml(peek)) return;
    await env.BUCKET.put(key, body, {
      httpMetadata: { contentType: mime },
      customMetadata: { source: 'github-backfill', at: new Date().toISOString() },
    });
  } catch (e) { console.error(`[CDN] Backfill fail: ${key}`, e); }
}

function parseRange(header) {
  if (!header) return undefined;
  const m = header.match(/^bytes=(\d+)-(\d*)$/);
  if (!m) return undefined;
  const offset = parseInt(m[1], 10);
  return m[2] ? { offset, length: parseInt(m[2], 10) - offset + 1 } : { offset };
}

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

function normalizeKey(p) { let k = decodeURIComponent(p).replace(/^\/+/,'').replace(/\/+$/,''); return k.includes('..') ? null : k || null; }
function getExt(k) { const d = k.lastIndexOf('.'); return d >= 0 ? k.substring(d).toLowerCase() : ''; }
function getMime(k) { return MIME[getExt(k)] || 'application/octet-stream'; }

function buildHeaders(mime, cc, tags, etag, src, key) {
  const h = new Headers({ 'Content-Type': mime, 'Cache-Control': cc, 'X-Asset-Source': src, 'X-Powered-By': 'Grudge CDN/2.3' });
  if (etag) h.set('ETag', etag);
  if (tags) h.set('CF-Cache-Tag', tags);
  if (PRE_COMPRESSED.has(getExt(key))) h.set('Content-Encoding', 'identity');
  return h;
}

function cors(_origin, resp) {
  const h = new Headers(resp.headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
  h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, If-None-Match, X-Requested-With, X-Grudge-Purge');
  h.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, ETag, Accept-Ranges, CF-Cache-Tag, X-Asset-Source');
  h.set('Access-Control-Max-Age', '86400');
  h.set('Timing-Allow-Origin', '*');
  h.set('Cross-Origin-Resource-Policy', 'cross-origin');
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: h });
}
