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
 *   GET    /health                Health check
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // ── CORS preflight ─────────────────────────────────────────────
    if (method === 'OPTIONS') {
      return corsResponse(env, new Response(null, { status: 204 }));
    }

    try {
      // ── Router ─────────────────────────────────────────────────
      if (url.pathname === '/health') {
        return corsResponse(env, json({ status: 'ok', service: 'objectstore-api' }));
      }

      // Asset file download  GET /v1/assets/:id/file
      const fileMatch = url.pathname.match(/^\/v1\/assets\/([^/]+)\/file$/);
      if (fileMatch && method === 'GET') {
        return corsResponse(env, await handleDownload(fileMatch[1], env));
      }

      // Single asset         GET /v1/assets/:id
      const idMatch = url.pathname.match(/^\/v1\/assets\/([^/]+)$/);
      if (idMatch && method === 'GET') {
        return corsResponse(env, await handleGetAsset(idMatch[1], env, url));
      }

      // Delete asset         DELETE /v1/assets/:id
      if (idMatch && method === 'DELETE') {
        const authErr = requireAuth(request, env);
        if (authErr) return corsResponse(env, authErr);
        return corsResponse(env, await handleDelete(idMatch[1], env));
      }

      // List / search        GET /v1/assets
      if (url.pathname === '/v1/assets' && method === 'GET') {
        return corsResponse(env, await handleList(url, env));
      }

      // Upload               POST /v1/assets
      if (url.pathname === '/v1/assets' && method === 'POST') {
        const authErr = requireAuth(request, env);
        if (authErr) return corsResponse(env, authErr);
        return corsResponse(env, await handleUpload(request, env));
      }

      return corsResponse(env, json({ error: 'Not found' }, 404));
    } catch (err) {
      console.error('Unhandled error:', err);
      return corsResponse(env, json({ error: 'Internal server error', detail: err.message }, 500));
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

/** CORS wrapper */
function corsResponse(env, response) {
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', allowed[0] || '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Filename, X-Category, X-Tags, X-Metadata, X-Visibility');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(response.body, { status: response.status, headers });
}

/** JSON response helper */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** ArrayBuffer / Uint8Array → hex string */
function bufToHex(buf) {
  if (!buf) return null;
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
