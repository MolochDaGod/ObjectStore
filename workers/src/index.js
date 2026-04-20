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
 */

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
          version: '2.1.0',
          status: 'ok',
          endpoints: {
            health: 'GET /health',
            assets: 'GET /v1/assets',
            models: 'GET /v1/models',
            gameData: 'GET /v1/game-data',
            weaponSkills: 'GET /v1/weapon-skills',
            gltfManifest: 'GET /v1/game-data/gltf-manifest',
            effectDefinitions: 'GET /v1/game-data/effect-definitions',
            animationsGltf: 'GET /v1/game-data/animations-gltf',
            upload: 'POST /v1/assets (API key required)',
            convert: 'POST /v1/convert (API key required)',
          },
          docs: 'https://molochdagod.github.io/ObjectStore/docs',
        }), origin);
      }

      if (url.pathname === '/health' || url.pathname === '/v1/health') {
        return corsResponse(env, json({ status: 'ok', service: 'objectstore-api', version: '2.0.0', timestamp: new Date().toISOString() }), origin);
      }

      // ── Game data routes (/v1/game-data, /v1/weapon-skills) ───────
      if (url.pathname.startsWith('/v1/game-data') || url.pathname.startsWith('/v1/weapon-skills')) {
        return corsResponse(env, await handleGameDataRoutes(url, method, env), origin);
      }

      // ── Conversion pipeline routes (/v1/convert) ─────────────────
      if (url.pathname.startsWith('/v1/convert')) {
        return corsResponse(env, await handleConvertRoutes(request, url, method, env), origin);
      }

      // ── 3D Model routes (/v1/models) ─────────────────────────
      const modelFileMatch = url.pathname.match(/^\/v1\/models\/([^/]+)\/file$/);
      if (modelFileMatch && method === 'GET') {
        return corsResponse(env, await handleModelDownload(modelFileMatch[1], env), origin);
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
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

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

  const { results } = await env.DB.prepare(sql).bind(...params).all();

  // Parse tags JSON for each row
  const items = results.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') }));

  return json({ items, count: items.length, limit, offset });
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

/** GET /v1/assets/:id/file — stream file from R2 */
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
  'weapons', 'armor', 'materials', 'consumables', 'weaponSkills',
  'skills', 'enemies', 'bosses', 'classes', 'races', 'factions',
  'attributes', 'professions', 'heroes', 'equipment', 'missions',
  'effectSprites', 'abilityEffects', 'sprites', 'spriteMaps',
  'dialogue', 'lore', 'audio', 'models', 'animations',
  'factionUnits', 'battleFormations', 'controllers', 'ai',
  'enemyTemplates', 'cutscenes', 'entities', 'models3d',
  // glTF Pipeline registries
  'gltf-manifest', 'effect-definitions', 'animations-gltf',
];

const GITHUB_PAGES_BASE = 'https://molochdagod.github.io/ObjectStore/api/v1';

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
    });
  }

  // GET /v1/game-data/:name — serve a collection (from R2 cache or proxy GitHub Pages)
  const dataMatch = path.match(/^\/v1\/game-data\/([a-zA-Z0-9_-]+)$/);
  if (dataMatch) {
    const name = dataMatch[1];
    if (!GAME_DATA_COLLECTIONS.includes(name)) {
      return json({ error: `Unknown collection: ${name}`, available: GAME_DATA_COLLECTIONS }, 404);
    }
    return await serveGameDataCollection(name, env);
  }

  // GET /v1/weapon-skills — proxy weaponSkills.json
  if (path === '/v1/weapon-skills') {
    return await serveGameDataCollection('weaponSkills', env);
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

/** Serve a game data JSON, trying R2 cache first, then GitHub Pages */
async function serveGameDataCollection(name, env) {
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
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

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

    const { results } = await env.DB.prepare(sql).bind(...params).all();
    const items = (results || []).map(r => ({
      ...r,
      tags: JSON.parse(r.tags || '[]'),
      file_url: `/v1/models/${r.id}/file`,
      thumbnail_url: `/v1/models/${r.id}/thumbnail`,
    }));

    return json({ models: items, count: items.length, total: items.length, limit, offset });
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

/** GET /v1/models/:id/file — download 3D model from R2 */
async function handleModelDownload(id, env) {
  const row = await env.DB.prepare('SELECT key, mime, filename FROM assets WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Model not found' }, 404);

  const obj = await env.BUCKET.get(row.key);
  if (!obj) return json({ error: 'File missing from storage' }, 404);

  return new Response(obj.body, {
    headers: {
      'Content-Type': row.mime || 'model/gltf-binary',
      'Content-Disposition': `inline; filename="${row.filename}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
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

/** CORS wrapper — reflects the request Origin if it matches the allowed list */
function corsResponse(env, response, requestOrigin = '') {
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());
  const headers = new Headers(response.headers);

  // Match request origin against allowed origins; fall back to wildcard
  let origin = '*';
  if (allowed.includes('*')) {
    origin = '*';
  } else if (requestOrigin && allowed.some(a => requestOrigin === a || requestOrigin.endsWith(a.replace(/^https?:\/\//, '')))) {
    origin = requestOrigin;
  } else if (allowed.length > 0) {
    origin = allowed[0];
  }

  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Filename, X-Category, X-Tags, X-Metadata, X-Visibility, Authorization');
  headers.set('Access-Control-Max-Age', '86400');
  if (origin !== '*') headers.set('Vary', 'Origin');
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
