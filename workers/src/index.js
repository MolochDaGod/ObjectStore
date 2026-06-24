/**
 * ObjectStore API — Cloudflare Worker
 *
 * R2 for file storage, D1 for metadata.
 * Public reads, API-key-gated writes.
 *
 * Routes:
 *   POST   /v1/assets            Upload asset (multipart or raw)
 *   GET    /v1/assets             List / search assets
 *   GET    /v1/assets/:id         Get asset metadata
 *   GET    /v1/assets/:id/file    Download asset file from R2
 *   DELETE /v1/assets/:id         Delete asset + R2 object
 *   POST   /v1/convert            Convert & upload 3D model (via Durable Object)
 *   GET    /v1/convert/check      Dedup check by source hash
 *   GET    /v1/convert/:id        Get conversion job status
 *   GET    /v1/convert/:id/ws     WebSocket for conversion progress
 *   GET    /v1/convert/jobs       List recent conversion jobs
 *   GET    /health                Health check
 *   GET    /api/v1/catalog        Fleet catalog index (SSOT for game data endpoints)
 *   GET    /api/v1/:name.json     Static game data JSON (R2 cache → info.grudge-studio.com)
 */

const API_VERSION = '3.2.0';
/** Canonical static JSON upstream — never self-proxy via objectstore (circular). */
const STATIC_JSON_BASE = 'https://info.grudge-studio.com/api/v1';

// Re-export the Durable Object class so Wrangler can find it
export { ConversionPipeline } from './ConversionPipeline.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const origin = request.headers.get('Origin') || '';

    // ── CORS preflight ─────────────────────────────────────────────
    if (method === 'OPTIONS') {
      return corsResponse(env, new Response(null, { status: 204 }), origin);
    }

    try {
      // ── Router ─────────────────────────────────────────────────
      if (url.pathname === '/' || url.pathname === '') {
        return corsResponse(env, json({
          service: 'objectstore-api',
          version: API_VERSION,
          status: 'ok',
          canonicalUrl: 'https://objectstore.grudge-studio.com',
          fleet: 'https://grudachain.grudge-studio.com/api/fleet/connect',
          endpoints: {
            health: 'GET /health',
            catalog: 'GET /api/v1/catalog',
            staticJson: 'GET /api/v1/:name.json',
            assets: 'GET /v1/assets',
            models: 'GET /v1/models',
            gameData: 'GET /v1/game-data',
            weaponSkills: 'GET /v1/weapon-skills',
            relics: 'GET /v1/relics',
            enchants: 'GET /v1/enchants',
            infusions: 'GET /v1/infusions',
            artifacts: 'GET /v1/artifacts',
            gltfManifest: 'GET /v1/game-data/gltf-manifest',
            effectDefinitions: 'GET /v1/game-data/effect-definitions',
            animationsGltf: 'GET /v1/game-data/animations-gltf',
            upload: 'POST /v1/assets (API key required)',
            convert: 'POST /v1/convert (API key required)',
          },
          docs: 'https://info.grudge-studio.com/docs',
        }), origin);
      }

      if (url.pathname === '/health' || url.pathname === '/v1/health') {
        return corsResponse(env, json({ status: 'ok', service: 'objectstore-api', version: API_VERSION, timestamp: new Date().toISOString() }), origin);
      }

      // ── Static JSON catalog (/api/v1/*) — fleet games consume these ──
      if (url.pathname === '/api/v1/catalog' && method === 'GET') {
        return corsResponse(env, await serveStaticJson('catalog', env), origin);
      }
      const staticJsonMatch = url.pathname.match(/^\/api\/v1\/([a-zA-Z0-9_.-]+)\.json$/);
      if (staticJsonMatch && method === 'GET') {
        return corsResponse(env, await serveStaticJson(staticJsonMatch[1], env), origin);
      }

      if (url.pathname === '/docs' || url.pathname.startsWith('/docs/')) {
        return Response.redirect(`https://info.grudge-studio.com${url.pathname}${url.search}`, 301);
      }

      // ── Game data routes (/v1/game-data, /v1/weapon-skills) ───────
      if (url.pathname.startsWith('/v1/game-data') || url.pathname.startsWith('/v1/weapon-skills')) {
        return corsResponse(env, await handleGameDataRoutes(url, method, env), origin);
      }

      // ── Item collection routes (/v1/relics, /v1/enchants, etc.) ──
      if (url.pathname.startsWith('/v1/relics') ||
          url.pathname.startsWith('/v1/enchants') ||
          url.pathname.startsWith('/v1/infusions') ||
          url.pathname.startsWith('/v1/artifacts')) {
        return corsResponse(env, await handleItemCollectionRoutes(url, method, env), origin);
      }

      // ── Conversion pipeline routes (/v1/convert) ─────────────────
      if (url.pathname.startsWith('/v1/convert')) {
        return corsResponse(env, await handleConvertRoutes(request, url, method, env), origin);
      }

      // ── 3D Model routes (/v1/models) ─────────────────────────
      const modelFileMatch = url.pathname.match(/^\/v1\/models\/([^/]+)\/file$/);
      if (modelFileMatch && method === 'GET') {
        return corsResponse(env, await handleModelDownload(modelFileMatch[1], env, request), origin);
      }
      const modelThumbMatch = url.pathname.match(/^\/v1\/models\/([^/]+)\/thumbnail$/);
      if (modelThumbMatch && method === 'GET') {
        return corsResponse(env, await handleModelThumbnail(modelThumbMatch[1], env), origin);
      }
      const modelIdMatch = url.pathname.match(/^\/v1\/models\/([^/]+)$/);
      if (modelIdMatch && method === 'GET') {
        return corsResponse(env, await handleGetModel(modelIdMatch[1], env, url), origin);
      }
      if (url.pathname === '/v1/models' && method === 'GET') {
        return corsResponse(env, await handleListModels(url, env), origin);
      }

      // ── Asset routes (/v1/assets) ────────────────────────────────
      // Asset file download  GET /v1/assets/:id/file
      const fileMatch = url.pathname.match(/^\/v1\/assets\/([^/]+)\/file$/);
      if (fileMatch && method === 'GET') {
        return corsResponse(env, await handleDownload(fileMatch[1], env), origin);
      }

      // Single asset         GET /v1/assets/:id
      const idMatch = url.pathname.match(/^\/v1\/assets\/([^/]+)$/);
      if (idMatch && method === 'GET') {
        return corsResponse(env, await handleGetAsset(idMatch[1], env, url), origin);
      }

      // Delete asset         DELETE /v1/assets/:id
      if (idMatch && method === 'DELETE') {
        const authErr = requireAuth(request, env);
        if (authErr) return corsResponse(env, authErr, origin);
        return corsResponse(env, await handleDelete(idMatch[1], env), origin);
      }

      // List / search        GET /v1/assets
      if (url.pathname === '/v1/assets' && method === 'GET') {
        return corsResponse(env, await handleList(url, env), origin);
      }

      // Upload               POST /v1/assets
      if (url.pathname === '/v1/assets' && method === 'POST') {
        const authErr = requireAuth(request, env);
        if (authErr) return corsResponse(env, authErr, origin);
        return corsResponse(env, await handleUpload(request, env), origin);
      }

      return corsResponse(env, json({ error: 'Not found' }, 404), origin);
    } catch (err) {
      console.error('Unhandled error:', err);
      return corsResponse(env, json({ error: 'Internal server error', detail: err.message }, 500), origin);
    }
  },
};

// ════════════════════════════════════════════════════════════════════
//  Handlers
// ════════════════════════════════════════════════════════════════════

/** POST /v1/assets — upload a file + metadata */
async function handleUpload(request, env) {
  const contentType = request.headers.get('content-type') || '';
  let file, filename, category, tags, metadata, visibility;

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    file = form.get('file');
    if (!file || !file.name) return json({ error: 'Missing "file" field' }, 400);
    filename = form.get('filename') || file.name;
    category = form.get('category') || 'uncategorized';
    tags = form.get('tags') || '[]';
    metadata = form.get('metadata') || '{}';
    visibility = form.get('visibility') || 'public';
  } else {
    // Raw body upload — metadata in headers
    file = request.body;
    filename = request.headers.get('x-filename');
    if (!filename) return json({ error: 'Missing x-filename header for raw upload' }, 400);
    category = request.headers.get('x-category') || 'uncategorized';
    tags = request.headers.get('x-tags') || '[]';
    metadata = request.headers.get('x-metadata') || '{}';
    visibility = request.headers.get('x-visibility') || 'public';
  }

  // Validate JSON fields
  try { JSON.parse(tags); } catch { return json({ error: 'tags must be valid JSON array' }, 400); }
  try { JSON.parse(metadata); } catch { return json({ error: 'metadata must be valid JSON' }, 400); }

  const maxSize = parseInt(env.MAX_UPLOAD_SIZE || '104857600', 10);
  const id = crypto.randomUUID();
  const key = `${category}/${id}/${filename}`;
  const mime = file.type || contentType || 'application/octet-stream';

  // ── Upload to R2 ───────────────────────────────────────────────
  const body = file instanceof File ? file.stream() : file;
  const r2Obj = await env.BUCKET.put(key, body, {
    httpMetadata: { contentType: mime },
    customMetadata: { assetId: id, category },
  });

  const size = r2Obj.size;
  const sha256 = r2Obj.checksums?.sha256
    ? bufToHex(await r2Obj.checksums.sha256.arrayBuffer?.() ?? r2Obj.checksums.sha256)
    : null;

  // ── Insert metadata into D1 ────────────────────────────────────
  await env.DB.prepare(
    `INSERT INTO assets (id, key, filename, mime, size, sha256, tags, category, visibility, metadata, owner)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, key, filename, mime, size, sha256, tags, category, visibility, metadata, 'api-key').run();

  return json({
    id,
    key,
    filename,
    mime,
    size,
    category,
    tags: JSON.parse(tags),
    visibility,
    url: `/v1/assets/${id}/file`,
    created_at: new Date().toISOString(),
  }, 201);
}

/** GET /v1/assets — list with optional filters */
async function handleList(url, env) {
  const category = url.searchParams.get('category');
  const tag = url.searchParams.get('tag');
  const prefix = url.searchParams.get('prefix');
  const q = url.searchParams.get('q');             // filename search
  const limit = parsePositiveInt(url.searchParams.get('limit'), 50, { min: 1, max: 200 });
  const offset = parsePositiveInt(url.searchParams.get('offset'), 0, { min: 0, max: 1_000_000 });

  let where = ["visibility = 'public'"];
  const params = [];

  if (category) { where.push('category = ?'); params.push(category); }
  if (tag)      { where.push("tags LIKE '%' || ? || '%'"); params.push(tag); }
  if (prefix)   { where.push('key LIKE ? || \'%\''); params.push(prefix); }
  if (q)        { where.push('filename LIKE \'%\' || ? || \'%\''); params.push(q); }

  params.push(limit, offset);

  const sql = `SELECT id, key, filename, mime, size, category, tags, created_at
               FROM assets
               WHERE ${where.join(' AND ')}
               ORDER BY created_at DESC
               LIMIT ? OFFSET ?`;

  const [{ total = 0 } = {}] = (await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM assets WHERE ${where.join(' AND ')}`
  ).bind(...params.slice(0, -2)).all()).results || [];
  const { results } = await env.DB.prepare(sql).bind(...params).all();

  // Parse tags JSON for each row
  const items = results.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') }));

  return json({
    items,
    count: items.length,
    total,
    limit,
    offset,
    hasMore: offset + items.length < total,
    nextOffset: offset + items.length < total ? offset + items.length : null,
  });
}

/** GET /v1/assets/:id — single asset metadata */
async function handleGetAsset(id, env, url) {
  const row = await env.DB.prepare('SELECT * FROM assets WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Asset not found' }, 404);

  row.tags = JSON.parse(row.tags || '[]');
  row.metadata = JSON.parse(row.metadata || '{}');
  row.file_url = `${url.origin}/v1/assets/${id}/file`;

  return json(row);
}

/** GET /v1/assets/:id/file — download asset file from R2.
 * Sends an ETag and supports If-None-Match conditional requests.
 */
async function handleDownload(id, env) {
  const row = await env.DB.prepare('SELECT key, mime, filename FROM assets WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Asset not found' }, 404);

  const obj = await env.BUCKET.get(row.key);
  if (!obj) return json({ error: 'File missing from storage' }, 404);

  return new Response(obj.body, {
    headers: {
      'Content-Type': row.mime || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${row.filename}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

/** DELETE /v1/assets/:id — remove from R2 + D1 */
async function handleDelete(id, env) {
  const row = await env.DB.prepare('SELECT key FROM assets WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Asset not found' }, 404);

  await env.BUCKET.delete(row.key);
  await env.DB.prepare('DELETE FROM assets WHERE id = ?').bind(id).run();

  return json({ deleted: true, id });
}

// ════════════════════════════════════════════════════════════════════
//  Conversion Pipeline Handlers
// ════════════════════════════════════════════════════════════════════

/** Get the Durable Object stub for the conversion pipeline */
function getConversionDO(env) {
  const id = env.CONVERSION_PIPELINE.idFromName('global-pipeline');
  return env.CONVERSION_PIPELINE.get(id);
}

/** Route handler for /v1/convert/* */
async function handleConvertRoutes(request, url, method, env) {
  const path = url.pathname;

  // POST /v1/convert — Client sends converted GLB + metadata
  // Flow: hash original → start job (dedup check) → upload GLB → complete job
  if (path === '/v1/convert' && method === 'POST') {
    const authErr = requireAuth(request, env);
    if (authErr) return authErr;

    const form = await request.formData();
    const file = form.get('file');
    const sourceHash = form.get('sourceHash');
    const sourceName = form.get('sourceName');
    const sourceFormat = form.get('sourceFormat');
    const sourceSize = form.get('sourceSize');
    const meshes = form.get('meshes') || '0';
    const vertices = form.get('vertices') || '0';
    const animations = form.get('animations') || '0';

    if (!file) return json({ error: 'Missing file (converted GLB)' }, 400);
    if (!sourceHash) return json({ error: 'Missing sourceHash' }, 400);
    if (!sourceName) return json({ error: 'Missing sourceName' }, 400);

    const stub = getConversionDO(env);

    // Step 1: Start job (includes dedup check)
    const startResp = await stub.fetch(new Request('https://do/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceHash,
        sourceName,
        sourceFormat: sourceFormat || sourceName.split('.').pop(),
        sourceSize: parseInt(sourceSize || '0', 10),
      }),
    }));

    const startData = await startResp.json();

    // If deduplicated, return the existing asset immediately
    if (startData.deduplicated) {
      return json(startData);
    }

    // Step 2: Complete — send the converted GLB to the DO for R2 storage
    const completeForm = new FormData();
    completeForm.append('jobId', startData.jobId);
    completeForm.append('file', file, form.get('filename') || sourceName.replace(/\.[^/.]+$/, '') + '.glb');
    completeForm.append('filename', form.get('filename') || sourceName.replace(/\.[^/.]+$/, '') + '.glb');
    completeForm.append('meshes', meshes);
    completeForm.append('vertices', vertices);
    completeForm.append('animations', animations);

    const completeResp = await stub.fetch(new Request('https://do/complete', {
      method: 'POST',
      body: completeForm,
    }));

    return new Response(completeResp.body, {
      status: completeResp.status,
      headers: completeResp.headers,
    });
  }

  // GET /v1/convert/check?hash=<sha256> — Quick dedup check
  if (path === '/v1/convert/check' && method === 'GET') {
    const hash = url.searchParams.get('hash');
    if (!hash) return json({ error: 'Missing hash parameter' }, 400);

    // Check D1 for existing completed conversion with this hash
    const row = await env.DB.prepare(
      `SELECT cj.id, cj.output_asset_id, cj.status, a.filename, a.key
       FROM conversion_jobs cj
       LEFT JOIN assets a ON a.id = cj.output_asset_id
       WHERE cj.source_hash = ? AND cj.status = 'done'
       ORDER BY cj.completed_at DESC LIMIT 1`
    ).bind(hash).first();

    if (row) {
      return json({
        exists: true,
        jobId: row.id,
        assetId: row.output_asset_id,
        filename: row.filename,
        fileUrl: `/v1/assets/${row.output_asset_id}/file`,
      });
    }
    return json({ exists: false });
  }

  // GET /v1/convert/jobs — List recent conversion jobs
  if (path === '/v1/convert/jobs' && method === 'GET') {
    const stub = getConversionDO(env);
    const resp = await stub.fetch(new Request('https://do/jobs'));
    return new Response(resp.body, { status: resp.status, headers: resp.headers });
  }

  // GET /v1/convert/:id/ws — WebSocket proxy to DO
  const wsMatch = path.match(/^\/v1\/convert\/([^/]+)\/ws$/);
  if (wsMatch && request.headers.get('Upgrade') === 'websocket') {
    const stub = getConversionDO(env);
    return stub.fetch(new Request('https://do/websocket', {
      headers: request.headers,
    }));
  }

  // GET /v1/convert/:id — Job status
  const jobMatch = path.match(/^\/v1\/convert\/([^/]+)$/);
  if (jobMatch && method === 'GET') {
    const stub = getConversionDO(env);
    const resp = await stub.fetch(new Request(`https://do/status/${jobMatch[1]}`));
    return new Response(resp.body, { status: resp.status, headers: resp.headers });
  }

  return json({ error: 'Not found' }, 404);
}

// ════════════════════════════════════════════════════════════════════
//  Game Data Handlers (JSON collections from R2)
// ════════════════════════════════════════════════════════════════════

// Known game data collections that can be served
const GAME_DATA_COLLECTIONS = [
  // ── Core item/gear databases ──────────────────────────────────────
  'master-items', 'master-weapons', 'master-armor', 'master-materials',
  'master-consumables', 'master-recipes', 'master-professions',
  'master-skillTrees', 'master-weaponSkills', 'master-registry',
  // ── New Mystic / enchanting system ───────────────────────────────
  'master-enchants', 'master-infusions', 'master-relics', 'master-artifacts',
  // ── Legacy / alias collections ────────────────────────────────────
  'weapons', 'armor', 'materials', 'consumables', 'weaponSkills',
  'skills', 'enemies', 'bosses', 'classes', 'races', 'factions',
  'attributes', 'professions', 'heroes', 'equipment', 'missions',
  'effectSprites', 'abilityEffects', 'sprites', 'spriteMaps',
  'dialogue', 'lore', 'audio', 'models', 'animations',
  'factionUnits', 'battleFormations', 'controllers', 'ai',
  'enemyTemplates', 'cutscenes', 'entities', 'models3d',
  // ── glTF Pipeline registries ──────────────────────────────────────
  'gltf-manifest', 'effect-definitions', 'animations-gltf',
];

const GITHUB_PAGES_BASE = STATIC_JSON_BASE;

/** Route handler for /v1/game-data/* and /v1/weapon-skills/* */
async function handleGameDataRoutes(url, method, env) {
  if (method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const path = url.pathname;

  // GET /v1/game-data — list collections
  if (path === '/v1/game-data') {
    return json({
      count: GAME_DATA_COLLECTIONS.length,
      collections: GAME_DATA_COLLECTIONS.map(name => ({
        name,
        url: `/v1/game-data/${name}`,
        source: `${GITHUB_PAGES_BASE}/${name}.json`,
      })),
      pagination: {
        supportedQueryParams: ['page', 'pageSize', 'offset', 'limit', 'arrayKey', 'q'],
        note: 'Collection endpoints return full JSON by default. Add pagination query params for chunked loading.',
      },
    });
  }

  // GET /v1/game-data/:name — serve a collection (from R2 cache or proxy GitHub Pages)
  const dataMatch = path.match(/^\/v1\/game-data\/([a-zA-Z0-9_-]+)$/);
  if (dataMatch) {
    const name = dataMatch[1];
    if (!GAME_DATA_COLLECTIONS.includes(name)) {
      return json({ error: `Unknown collection: ${name}`, available: GAME_DATA_COLLECTIONS }, 404);
    }
    return await serveGameDataCollection(name, env, url);
  }

  // GET /v1/weapon-skills — proxy weaponSkills.json
  if (path === '/v1/weapon-skills') {
    return await serveGameDataCollection('weaponSkills', env, url);
  }

  // GET /v1/weapon-skills/:type — filter by weapon type
  const wsMatch = path.match(/^\/v1\/weapon-skills\/([a-zA-Z_-]+)$/);
  if (wsMatch) {
    const type = wsMatch[1].toUpperCase();
    const data = await fetchGameData('weaponSkills', env);
    if (!data) return json({ error: 'Weapon skills data unavailable' }, 503);
    const wt = data.weaponTypes?.find(w => w.id === type || w.name.toLowerCase() === wsMatch[1].toLowerCase());
    if (!wt) return json({ error: `Weapon type not found: ${wsMatch[1]}` }, 404);
    return json(wt, 200, { 'Cache-Control': 'public, max-age=300' });
  }

  return json({ error: 'Not found' }, 404);
}

/** Serve static /api/v1/:name.json — R2 cache first, then canonical Vercel upstream */
async function serveStaticJson(name, env) {
  const cacheKey = `static-json/${name}.json`;
  const cached = await env.BUCKET.get(cacheKey);
  if (cached) {
    return new Response(cached.body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Source': 'r2-cache',
      },
    });
  }

  const base = (env.STATIC_JSON_BASE || STATIC_JSON_BASE).replace(/\/$/, '');
  const sourceUrl = `${base}/${name}.json`;
  try {
    const resp = await fetch(sourceUrl);
    if (!resp.ok) {
      return json({ error: `Failed to fetch ${name}.json`, status: resp.status, source: sourceUrl }, resp.status === 404 ? 404 : 502);
    }
    const body = await resp.arrayBuffer();
    env.BUCKET.put(cacheKey, body, {
      httpMetadata: { contentType: 'application/json' },
      customMetadata: { source: 'upstream', cachedAt: new Date().toISOString() },
    }).catch(() => {});

    return new Response(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
        'X-Source': 'upstream',
      },
    });
  } catch (e) {
    return json({ error: `Upstream fetch failed: ${e.message}`, source: sourceUrl }, 502);
  }
}

/** Serve a game data JSON, trying R2 cache first, then canonical static upstream */
async function serveGameDataCollection(name, env, url = null) {
  const wantsPage = !!url && (
    url.searchParams.has('page') ||
    url.searchParams.has('pageSize') ||
    url.searchParams.has('offset') ||
    url.searchParams.has('limit') ||
    url.searchParams.has('arrayKey') ||
    url.searchParams.has('q')
  );

  if (wantsPage) {
    const data = await fetchGameData(name, env);
    if (!data) return json({ error: `Failed to fetch ${name} from source` }, 502);
    return paginateGameDataCollection(name, data, url);
  }

  const cacheKey = `game-data/${name}.json`;

  // Try R2 first (cached copy)
  const cached = await env.BUCKET.get(cacheKey);
  if (cached) {
    return new Response(cached.body, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Source': 'r2-cache',
      },
    });
  }

  // Fetch from GitHub Pages
  const sourceUrl = `${GITHUB_PAGES_BASE}/${name}.json`;
  try {
    const resp = await fetch(sourceUrl);
    if (!resp.ok) return json({ error: `Failed to fetch ${name} from source`, status: resp.status }, 502);
    const body = await resp.arrayBuffer();

    // Cache in R2 for next time (fire-and-forget)
    env.BUCKET.put(cacheKey, body, {
      httpMetadata: { contentType: 'application/json' },
      customMetadata: { source: 'github-pages', cachedAt: new Date().toISOString() },
    }).catch(() => {});

    return new Response(body, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Source': 'github-pages',
      },
    });
  } catch (e) {
    return json({ error: `Upstream fetch failed: ${e.message}` }, 502);
  }
}

/** Fetch and parse game data (for filtering) */
async function fetchGameData(name, env) {
  const cacheKey = `game-data/${name}.json`;
  const cached = await env.BUCKET.get(cacheKey);
  if (cached) {
    try { return JSON.parse(await cached.text()); } catch { /* fall through */ }
  }
  try {
    const resp = await fetch(`${GITHUB_PAGES_BASE}/${name}.json`);
    if (resp.ok) return await resp.json();
  } catch { /* fall through */ }
  return null;
}

// ════════════════════════════════════════════════════════════════════
//  Item Collection Handlers (/v1/relics, /v1/enchants, etc.)
// ════════════════════════════════════════════════════════════════════

/**
 * Route dispatcher for dedicated item collection endpoints.
 *
 * Endpoints:
 *   GET /v1/relics                – list / search relics
 *   GET /v1/relics/:id            – single relic by id or uuid
 *   GET /v1/enchants              – list / search enchants
 *   GET /v1/enchants/:id          – single enchant by id or uuid
 *   GET /v1/infusions             – list / search infusions
 *   GET /v1/infusions/:id         – single infusion by id or uuid
 *   GET /v1/artifacts             – list / search artifacts (undiscovered filtered by default)
 *   GET /v1/artifacts/:id         – single artifact by id, uuid, or name slug
 */
async function handleItemCollectionRoutes(url, method, env) {
  if (method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const path = url.pathname;

  // ── /v1/relics ──────────────────────────────────────────────────
  if (path === '/v1/relics') {
    return await listItemCollection('master-relics', 'relics', url, env, applyRelicFilters);
  }
  const relicIdMatch = path.match(/^\/v1\/relics\/([^/]+)$/);
  if (relicIdMatch) {
    return await getItemById('master-relics', 'relics', relicIdMatch[1], env);
  }

  // ── /v1/enchants ─────────────────────────────────────────────────
  if (path === '/v1/enchants') {
    return await listItemCollection('master-enchants', 'enchants', url, env, applyEnchantFilters);
  }
  const enchantIdMatch = path.match(/^\/v1\/enchants\/([^/]+)$/);
  if (enchantIdMatch) {
    return await getItemById('master-enchants', 'enchants', enchantIdMatch[1], env);
  }

  // ── /v1/infusions ────────────────────────────────────────────────
  if (path === '/v1/infusions') {
    return await listItemCollection('master-infusions', 'infusions', url, env, applyInfusionFilters);
  }
  const infusionIdMatch = path.match(/^\/v1\/infusions\/([^/]+)$/);
  if (infusionIdMatch) {
    return await getItemById('master-infusions', 'infusions', infusionIdMatch[1], env);
  }

  // ── /v1/artifacts ────────────────────────────────────────────────
  if (path === '/v1/artifacts') {
    return await listItemCollection('master-artifacts', 'artifacts', url, env, applyArtifactFilters);
  }
  const artifactIdMatch = path.match(/^\/v1\/artifacts\/([^/]+)$/);
  if (artifactIdMatch) {
    return await getItemById('master-artifacts', 'artifacts', artifactIdMatch[1], env);
  }

  return json({ error: 'Not found' }, 404);
}

/**
 * Generic list handler for item collections.
 * Fetches the dataset, applies collection-specific filters, and paginates.
 *
 * @param {string} collectionName  - key in GAME_DATA_COLLECTIONS (e.g. 'master-relics')
 * @param {string} arrayKey        - property name of the items array (e.g. 'relics')
 * @param {URL}    url             - request URL (for query params)
 * @param {object} env             - Worker env bindings
 * @param {Function} filterFn      - (items, url) => filtered items
 */
async function listItemCollection(collectionName, arrayKey, url, env, filterFn) {
  const data = await fetchGameData(collectionName, env);
  if (!data) {
    return json({ error: `${collectionName} data unavailable` }, 503, {
      'Cache-Control': 'no-store',
    });
  }

  let items = Array.isArray(data[arrayKey]) ? data[arrayKey] : [];

  // Apply collection-specific filters (category, tier, type, q, etc.)
  items = filterFn(items, url);

  // Pagination
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 500);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const total = items.length;
  const page = items.slice(offset, offset + limit);

  return json(
    {
      collection: collectionName,
      total,
      count: page.length,
      limit,
      offset,
      items: page,
    },
    200,
    { 'Cache-Control': 'public, max-age=300' }
  );
}

/**
 * Generic single-item fetch — matches by `id`, `uuid`, or slugified `name`.
 */
async function getItemById(collectionName, arrayKey, rawId, env) {
  const data = await fetchGameData(collectionName, env);
  if (!data) {
    return json({ error: `${collectionName} data unavailable` }, 503, {
      'Cache-Control': 'no-store',
    });
  }

  const items = Array.isArray(data[arrayKey]) ? data[arrayKey] : [];
  const needle = decodeURIComponent(rawId).toLowerCase();

  const item = items.find(
    (it) =>
      it.id === needle ||
      it.uuid?.toLowerCase() === needle ||
      it.name?.toLowerCase().replace(/\s+/g, '-') === needle
  );

  if (!item) {
    return json({ error: `${arrayKey.slice(0, -1)} not found: ${rawId}` }, 404);
  }

  return json(item, 200, { 'Cache-Control': 'public, max-age=300' });
}

// ── Per-collection filter helpers ────────────────────────────────────

/**
 * Common filters shared by all item types: `q` (name search), `tier`, `category`.
 * Returns a new filtered array without mutating the original.
 */
function applyCommonFilters(items, url) {
  const q        = url.searchParams.get('q');
  const tier     = url.searchParams.get('tier');
  const category = url.searchParams.get('category');

  let out = items;
  if (category) out = out.filter((it) => it.category === category);
  if (tier)     out = out.filter((it) => String(it.tier) === tier || it.tierLabel?.toLowerCase() === tier.toLowerCase());
  if (q) {
    const s = q.toLowerCase();
    out = out.filter(
      (it) =>
        it.name?.toLowerCase().includes(s) ||
        it.id?.toLowerCase().includes(s) ||
        it.description?.toLowerCase().includes(s)
    );
  }
  return out;
}

/** Filter relics — supports `element` and `slot` in addition to common params. */
function applyRelicFilters(items, url) {
  let out = applyCommonFilters(items, url);
  const element = url.searchParams.get('element');
  const slot    = url.searchParams.get('slot');
  if (element) out = out.filter((it) => it.element === element);
  if (slot)    out = out.filter((it) => it.slot === slot);
  return out;
}

/** Filter enchants — supports `target` (weapon|armor) in addition to common params. */
function applyEnchantFilters(items, url) {
  let out = applyCommonFilters(items, url);
  const target = url.searchParams.get('target');
  if (target) {
    out = out.filter((it) =>
      it.target && it.target.split('|').includes(target)
    );
  }
  return out;
}

/** Filter infusions — supports `scope` and `profession` in addition to common params. */
function applyInfusionFilters(items, url) {
  let out = applyCommonFilters(items, url);
  const scope      = url.searchParams.get('scope');
  const profession = url.searchParams.get('profession');
  if (scope)      out = out.filter((it) => it.scope === scope);
  if (profession) out = out.filter((it) => it.profession === profession);
  return out;
}

/**
 * Filter artifacts — supports `artifactType`, `subtype`, `handedness` and
 * `discovered` (default: exclude hidden artifacts per D3 decision).
 */
function applyArtifactFilters(items, url) {
  // By default hide undiscovered artifacts (D3). Pass `discovered=all` to include all.
  const discovered   = url.searchParams.get('discovered');
  const artifactType = url.searchParams.get('artifactType');
  const subtype      = url.searchParams.get('subtype');
  const handedness   = url.searchParams.get('handedness');

  let out = items;
  if (discovered !== 'all') {
    out = out.filter((it) => !it.discovery?.hiddenUntilFound);
  }
  out = applyCommonFilters(out, url);
  if (artifactType) out = out.filter((it) => it.artifactType === artifactType);
  if (subtype)      out = out.filter((it) => it.weaponSubtype === subtype);
  if (handedness)   out = out.filter((it) => it.handedness === handedness);
  return out;
}

// ════════════════════════════════════════════════════════════════════
//  3D Model Handlers
// ════════════════════════════════════════════════════════════════════

const MODEL_MIME = {
  glb: 'model/gltf-binary', gltf: 'model/gltf+json',
  fbx: 'application/octet-stream', obj: 'application/octet-stream',
};

/** GET /v1/models — list 3D models with filters */
async function handleListModels(url, env) {
  try {
    const format = url.searchParams.get('format');       // glb, fbx, obj
    const animated = url.searchParams.get('animated');    // true/false
    const q = url.searchParams.get('q');
    const limit = parsePositiveInt(url.searchParams.get('limit'), 50, { min: 1, max: 200 });
    const offset = parsePositiveInt(url.searchParams.get('offset'), 0, { min: 0, max: 1_000_000 });

    // Match any 3D model by file extension
    let where = ["visibility = 'public'"];
    const params = [];

    // Filter for 3D model files
    where.push("(filename LIKE '%.glb' OR filename LIKE '%.gltf' OR filename LIKE '%.fbx' OR filename LIKE '%.obj' OR category = '3d-models' OR category = 'models')");

    if (q)        { where.push("filename LIKE '%' || ? || '%'"); params.push(q); }
    if (format)   { where.push("filename LIKE '%.' || ?"); params.push(format.toLowerCase()); }
    if (animated === 'true')  { where.push("tags LIKE '%animated%'"); }
    if (animated === 'false') { where.push("tags NOT LIKE '%animated%'"); }

    params.push(limit, offset);

    const sql = `SELECT id, filename, mime, size, category, tags, created_at
                 FROM assets
                 WHERE ${where.join(' AND ')}
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?`;

    const [{ total = 0 } = {}] = (await env.DB.prepare(
      `SELECT COUNT(*) AS total FROM assets WHERE ${where.join(' AND ')}`
    ).bind(...params.slice(0, -2)).all()).results || [];
    const { results } = await env.DB.prepare(sql).bind(...params).all();
    const items = (results || []).map(r => ({
      ...r,
      tags: JSON.parse(r.tags || '[]'),
      file_url: `/v1/models/${r.id}/file`,
      thumbnail_url: `/v1/models/${r.id}/thumbnail`,
    }));

    return json({
      models: items,
      count: items.length,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
      nextOffset: offset + items.length < total ? offset + items.length : null,
    });
  } catch (err) {
    console.error('handleListModels error:', err);
    return json({ models: [], count: 0, total: 0, error: err.message });
  }
}

/** GET /v1/models/:id — single model metadata */
async function handleGetModel(id, env, url) {
  const row = await env.DB.prepare('SELECT * FROM assets WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Model not found' }, 404);

  row.tags = JSON.parse(row.tags || '[]');
  row.metadata = JSON.parse(row.metadata || '{}');
  row.file_url = `${url.origin}/v1/models/${id}/file`;
  row.thumbnail_url = `${url.origin}/v1/models/${id}/thumbnail`;

  return json(row);
}

/** GET /v1/models/:id/file — download 3D model from R2.
 * Sends an ETag (R2 etag or sha256) so clients can revalidate without
 * downloading the entire model again. We also drop 'immutable' so future
 * key-overwrites can propagate to clients via 1-hour revalidation.
 */
async function handleModelDownload(id, env, request) {
  const row = await env.DB.prepare('SELECT key, mime, filename, sha256 FROM assets WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Model not found' }, 404);

  const obj = await env.BUCKET.get(row.key);
  if (!obj) return json({ error: 'File missing from storage' }, 404);

  const etag = `"${(row.sha256 || obj.etag || obj.httpEtag || '').replace(/"/g, '')}"`;
  // Conditional GET — return 304 if the client has the same ETag
  const ifNoneMatch = request?.headers?.get?.('if-none-match');
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  }

  return new Response(obj.body, {
    headers: {
      'Content-Type': row.mime || 'model/gltf-binary',
      'Content-Disposition': `inline; filename="${row.filename}"`,
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      'ETag': etag,
    },
  });
}

/** GET /v1/models/:id/thumbnail — serve pre-rendered thumbnail from R2 */
async function handleModelThumbnail(id, env) {
  // Try to fetch thumbnail from R2 at thumbnails/{id}.png
  const thumbKey = `thumbnails/${id}.png`;
  const obj = await env.BUCKET.get(thumbKey);
  if (!obj) {
    // No thumbnail — return a 1x1 transparent PNG placeholder
    const pixel = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,10,73,68,65,84,120,156,98,0,0,0,2,0,1,226,33,188,51,0,0,0,0,73,69,78,68,174,66,96,130]);
    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return new Response(obj.body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

// ════════════════════════════════════════════════════════════════════
//  Utilities
// ════════════════════════════════════════════════════════════════════

function parsePositiveInt(raw, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export function paginateGameDataCollection(name, data, url) {
  const page = parsePositiveInt(url.searchParams.get('page'), 0, { min: 0, max: 1_000_000 });
  const pageSize = parsePositiveInt(
    url.searchParams.get('pageSize') || url.searchParams.get('limit'),
    200,
    { min: 1, max: 500 }
  );
  const requestedOffset = url.searchParams.has('offset')
    ? parsePositiveInt(url.searchParams.get('offset'), 0, { min: 0, max: 1_000_000_000 })
    : null;
  const offset = requestedOffset ?? page * pageSize;
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();

  const customArrayKey = url.searchParams.get('arrayKey');
  const arrayKey = customArrayKey
    || (Array.isArray(data) ? null : Object.keys(data).find(k => Array.isArray(data[k])) || null);
  const sourceArray = arrayKey ? data[arrayKey] : data;

  if (!Array.isArray(sourceArray)) {
    return json({
      error: `Collection "${name}" is not paginatable`,
      arrayKey,
      hint: 'Use arrayKey=<field> when the collection has multiple array fields.',
    }, 400);
  }

  const filterKeys = ['id', 'uuid', 'name', 'category', 'type', 'subType', 'description', 'tags'];
  const filtered = q
    ? sourceArray.filter((entry) => {
      if (!entry || typeof entry !== 'object') return String(entry ?? '').toLowerCase().includes(q);
      return filterKeys.some((k) => {
        const value = entry[k];
        if (Array.isArray(value)) return value.some(v => String(v).toLowerCase().includes(q));
        return value != null && String(value).toLowerCase().includes(q);
      });
    })
    : sourceArray;

  const items = filtered.slice(offset, offset + pageSize);
  const total = filtered.length;
  const hasMore = offset + items.length < total;
  const meta = !Array.isArray(data)
    ? Object.fromEntries(Object.entries(data).filter(([k, v]) => k !== arrayKey && !Array.isArray(v)))
    : {};

  return json({
    collection: name,
    arrayKey,
    query: { q: q || null },
    page,
    pageSize,
    offset,
    count: items.length,
    total,
    hasMore,
    nextOffset: hasMore ? offset + items.length : null,
    items,
    meta,
  }, 200, { 'Cache-Control': 'public, max-age=120' });
}

/** Check X-API-Key header against the API_KEY secret */
function requireAuth(request, env) {
  const key = request.headers.get('x-api-key');
  if (!env.API_KEY) {
    // No secret configured — allow all (dev mode)
    return null;
  }
  if (!key || key !== env.API_KEY) {
    return json({ error: 'Unauthorized — provide X-API-Key header' }, 401);
  }
  return null;
}

/** Match a request Origin against an allow-list entry.
 * Supports:
 *   - exact origin: "https://foo.example.com"
 *   - wildcard subdomain: "*.example.com" (matches "https://x.example.com", "https://a.b.example.com")
 *   - bare host: "example.com" (treated as exact host match for any scheme)
 *   - global wildcard: "*"
 */
function originMatches(requestOrigin, entry) {
  if (!entry) return false;
  if (entry === '*') return true;
  if (!requestOrigin) return false;
  if (entry === requestOrigin) return true;

  // Wildcard subdomain pattern
  if (entry.startsWith('*.')) {
    const suffix = entry.slice(1); // ".example.com"
    let host;
    try { host = new URL(requestOrigin).host; } catch { return false; }
    return host === suffix.slice(1) || host.endsWith(suffix);
  }

  // Bare host (no scheme) — match by host
  if (!/^https?:\/\//i.test(entry)) {
    let host;
    try { host = new URL(requestOrigin).host; } catch { return false; }
    return host === entry;
  }

  return false;
}

/** CORS wrapper — reflects the request Origin if it matches the allowed list */
function corsResponse(env, response, requestOrigin = '') {
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
  const headers = new Headers(response.headers);

  // Decide which Origin to echo back
  let origin = '';
  if (allowed.includes('*')) {
    origin = requestOrigin || '*';
  } else if (requestOrigin && allowed.some(a => originMatches(requestOrigin, a))) {
    origin = requestOrigin;
  }

  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    // Allow credentials only for explicit (non-wildcard) origin echoes
    if (origin !== '*') headers.set('Access-Control-Allow-Credentials', 'true');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Filename, X-Category, X-Tags, X-Metadata, X-Visibility, Authorization');
  headers.set('Access-Control-Expose-Headers', 'ETag, Content-Length, Content-Type, X-Source');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(response.body, { status: response.status, headers });
}

/** JSON response helper */
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

/** ArrayBuffer / Uint8Array → hex string */
function bufToHex(buf) {
  if (!buf) return null;
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
