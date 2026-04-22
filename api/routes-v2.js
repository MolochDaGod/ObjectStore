/**
 * Grudge ObjectStore — v2 Express routes.
 *
 * Mount with:
 *   import { mountV2Routes } from './api/routes-v2.js';
 *   mountV2Routes(app, { manifestPath: './manifests/v2/index.json' });
 *
 * Endpoints:
 *   GET  /api/manifest/v2                         – filtered, paginated manifest
 *   GET  /api/assets/:id                          – single record
 *   POST /api/assets                (JWT)         – create/update metadata record
 *   PUT  /api/assets/:id            (JWT)         – update existing record
 *   DELETE /api/assets/:id          (JWT-admin)   – delete (requires admin claim)
 *   POST /api/assets/:id/upload     (JWT, multi)  – upload binary content
 *   POST /api/manifest/rebuild      (JWT-admin)   – rebuild manifest from DB+R2
 *   POST /api/ingest/wcs            (JWT)         – ingest RPG-MODULAR asset batches
 *   POST /api/convert/to-glb        (JWT, multi)  – fbx/obj -> glb conversion
 *
 * JWT verification delegates to ${GRUDGE_AUTH_URL}/api/auth/verify so we stay
 * consistent with grudgeDot's auth flow. Failure-path: 401 with a clear body.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import multer from 'multer';
import { spawn } from 'node:child_process';
import { classifyAsset } from '../types/asset-kind.js';

const GRUDGE_AUTH_URL = process.env.GRUDGE_AUTH_URL || 'https://id.grudge-studio.com';
const R2_PUBLIC_BASE  = process.env.R2_PUBLIC_BASE  || 'https://assets.grudge-studio.com';
const R2_BUCKET       = process.env.R2_BUCKET       || 'grudge-assets';
const WCS_PREFIX      = process.env.WCS_PREFIX      || 'wcs/v1';

// ──────────────────────────────────────────────────────────────────────────
// Manifest cache (in-memory, reloaded on each rebuild)
// ──────────────────────────────────────────────────────────────────────────

let manifestCache = null;
let manifestPath  = null;

async function readManifest(p) {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}
async function writeManifest(p, m) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(m, null, 2));
}
async function getManifest() {
  if (!manifestCache) manifestCache = await readManifest(manifestPath);
  return manifestCache;
}
function invalidateManifest() { manifestCache = null; }

// ──────────────────────────────────────────────────────────────────────────
// JWT middleware (delegates verification to Grudge ID)
// ──────────────────────────────────────────────────────────────────────────

async function verifyGrudgeJwt(token) {
  if (!token) return null;
  try {
    const r = await fetch(`${GRUDGE_AUTH_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!r.ok) return null;
    const body = await r.json().catch(() => null);
    return body?.user || body?.payload || null;
  } catch {
    return null;
  }
}

// ──── Cloudflare Access JWT verification (optional, kicks in if CF Access
//       is placed in front of this origin). We accept either the Grudge ID
//       JWT (existing flow) or a valid CF-Access-Jwt-Assertion header.
//
// Team domain + AUD tag configured via CF_ACCESS_TEAM_DOMAIN + CF_ACCESS_AUD.
// Verification uses JWKS at https://<team>.cloudflareaccess.com/cdn-cgi/access/certs.
// Keys are cached in-memory for 1 hour.
const CF_ACCESS_TEAM_DOMAIN = process.env.CF_ACCESS_TEAM_DOMAIN || '';
const CF_ACCESS_AUD         = process.env.CF_ACCESS_AUD || '';
let _cfAccessJwks = null;
let _cfAccessJwksFetchedAt = 0;

async function getCfAccessJwks() {
  if (!CF_ACCESS_TEAM_DOMAIN) return null;
  const now = Date.now();
  if (_cfAccessJwks && now - _cfAccessJwksFetchedAt < 60 * 60 * 1000) return _cfAccessJwks;
  try {
    const url = `https://${CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;
    const r = await fetch(url);
    if (!r.ok) return null;
    _cfAccessJwks = await r.json();
    _cfAccessJwksFetchedAt = now;
    return _cfAccessJwks;
  } catch {
    return null;
  }
}

async function verifyCfAccessJwt(token) {
  if (!token || !CF_ACCESS_TEAM_DOMAIN || !CF_ACCESS_AUD) return null;
  try {
    const jwks = await getCfAccessJwks();
    if (!jwks) return null;
    // Lazy-load jose; falls back to null if not installed.
    const jose = await import('jose').catch(() => null);
    if (!jose) return null;
    const JWKS = jose.createLocalJWKSet(jwks);
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `https://${CF_ACCESS_TEAM_DOMAIN}`,
      audience: CF_ACCESS_AUD,
    });
    // CF Access sets `email` and `identity_nonce`; shape it like a user record.
    return { email: payload.email, sub: payload.sub, isCfAccess: true, role: 'admin' };
  } catch {
    return null;
  }
}

function extractToken(req) {
  const h = req.headers.authorization || req.headers.Authorization;
  if (h && typeof h === 'string' && h.startsWith('Bearer ')) return h.slice(7);
  return req.cookies?.grudge_auth_token || null;
}

function extractCfAccessToken(req) {
  // Cloudflare Access forwards the signed JWT in this header and cookie.
  const h = req.headers['cf-access-jwt-assertion'];
  if (h) return h;
  return req.cookies?.CF_Authorization || null;
}

function requireAuth({ admin = false } = {}) {
  return async (req, res, next) => {
    // Accept either the Grudge ID JWT or a CF Access JWT. CF Access implies admin.
    const cfUser = await verifyCfAccessJwt(extractCfAccessToken(req));
    const user = cfUser || (await verifyGrudgeJwt(extractToken(req)));
    if (!user) return res.status(401).json({ error: 'unauthorized', service: 'grudge-objectstore' });
    if (admin && !user.isAdmin && user.role !== 'admin' && user.role !== 'master-admin' && !user.isCfAccess) {
      return res.status(403).json({ error: 'admin-required', service: 'grudge-objectstore' });
    }
    req.user = user;
    next();
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Optional R2 client (S3-compatible). Lazy so server starts without it.
// ──────────────────────────────────────────────────────────────────────────

let _s3 = null;
async function r2() {
  if (_s3) return _s3;
  const endpoint = process.env.R2_ENDPOINT; // https://<account>.r2.cloudflarestorage.com
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  _s3 = {
    client: new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId, secretAccessKey } }),
    PutObjectCommand,
  };
  return _s3;
}

async function putR2(key, body, contentType) {
  const s3 = await r2();
  if (!s3) throw new Error('R2 credentials not configured (R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)');
  await s3.client.send(new s3.PutObjectCommand({
    Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType,
  }));
  return `${R2_PUBLIC_BASE}/${key}`;
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const uuidFromSeed = (seed) => {
  const h = sha256(Buffer.from(seed));
  return (
    h.slice(0, 8) + '-' + h.slice(8, 12) + '-4' + h.slice(13, 16) + '-' +
    ((parseInt(h.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20) + '-' +
    h.slice(20, 32)
  );
};

function normRecord(rec) {
  const p = String(rec.path || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const { kind, dimension } = classifyAsset(p);
  return {
    id: rec.id || uuidFromSeed(`${p}|${rec.size || 0}`),
    kind: rec.kind || kind,
    dimension: rec.dimension || dimension,
    name: rec.name || p.split('/').pop().replace(/\.[^.]+$/, ''),
    path: p,
    r2Key: rec.r2Key || `game-assets/${p}`,
    mime: rec.mime || 'application/octet-stream',
    size: Number(rec.size || 0),
    sha256: rec.sha256,
    previewUrl: rec.previewUrl,
    tags: Array.isArray(rec.tags) ? rec.tags : [],
    pack: rec.pack,
    category: rec.category,
    tier: rec.tier,
    faction: rec.faction,
    source: rec.source,
    license: rec.license,
    references: rec.references,
    animation: rec.animation,
    rigging: rec.rigging,
    createdAt: rec.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: (rec.version || 0) + 1,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Route mounter
// ──────────────────────────────────────────────────────────────────────────

export function mountV2Routes(app, opts = {}) {
  manifestPath = opts.manifestPath || path.resolve('manifests/v2/index.json');

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE || 100 * 1024 * 1024) },
  });

  // ── GET /api/manifest/v2 ────────────────────────────────────────────
  app.get('/api/manifest/v2', async (req, res) => {
    try {
      const m = await getManifest();
      let list = m.assets;
      const { kind, dimension, pack, q } = req.query;
      if (kind) list = list.filter((a) => a.kind === kind);
      if (dimension) list = list.filter((a) => a.dimension === dimension);
      if (pack) list = list.filter((a) => a.pack === pack);
      if (q) {
        const s = String(q).toLowerCase();
        list = list.filter((a) =>
          a.name?.toLowerCase().includes(s) ||
          a.path?.toLowerCase().includes(s) ||
          (a.tags || []).join(' ').toLowerCase().includes(s)
        );
      }
      const page = Number(req.query.page || 0);
      const pageSize = Math.min(Number(req.query.pageSize || 200), 10000);
      const start = page * pageSize;
      res.json({
        version: m.version,
        bucket: m.bucket,
        generatedAt: m.generatedAt,
        total: list.length,
        page, pageSize,
        assets: list.slice(start, start + pageSize),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/assets/:id ─────────────────────────────────────────────
  app.get('/api/assets/:id', async (req, res) => {
    const m = await getManifest();
    const a = m.assets.find((x) => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    res.json(a);
  });

  // ── POST /api/assets (create or update) ─────────────────────────────
  app.post('/api/assets', requireAuth(), async (req, res) => {
    try {
      const m = await getManifest();
      const rec = normRecord(req.body || {});
      const idx = m.assets.findIndex((x) => x.id === rec.id || x.path === rec.path);
      if (idx >= 0) {
        rec.createdAt = m.assets[idx].createdAt;
        rec.version = (m.assets[idx].version || 0) + 1;
        m.assets[idx] = rec;
      } else {
        m.assets.push(rec);
      }
      m.generatedAt = new Date().toISOString();
      await writeManifest(manifestPath, m);
      invalidateManifest();
      res.json(rec);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── PUT /api/assets/:id ─────────────────────────────────────────────
  app.put('/api/assets/:id', requireAuth(), async (req, res) => {
    const m = await getManifest();
    const idx = m.assets.findIndex((x) => x.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'not-found' });
    const merged = normRecord({ ...m.assets[idx], ...(req.body || {}), id: req.params.id });
    merged.createdAt = m.assets[idx].createdAt;
    m.assets[idx] = merged;
    m.generatedAt = new Date().toISOString();
    await writeManifest(manifestPath, m);
    invalidateManifest();
    res.json(merged);
  });

  // ── DELETE /api/assets/:id (admin) ──────────────────────────────────
  app.delete('/api/assets/:id', requireAuth({ admin: true }), async (req, res) => {
    const m = await getManifest();
    const before = m.assets.length;
    m.assets = m.assets.filter((x) => x.id !== req.params.id);
    if (m.assets.length === before) return res.status(404).json({ error: 'not-found' });
    m.generatedAt = new Date().toISOString();
    await writeManifest(manifestPath, m);
    invalidateManifest();
    res.json({ ok: true });
  });

  // ── POST /api/assets/:id/upload ─────────────────────────────────────
  app.post('/api/assets/:id/upload', requireAuth(), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'no-file' });
      const m = await getManifest();
      const rec = m.assets.find((x) => x.id === req.params.id);
      if (!rec) return res.status(404).json({ error: 'not-found' });
      const url = await putR2(rec.r2Key, req.file.buffer, req.file.mimetype || rec.mime);
      rec.size = req.file.size;
      rec.sha256 = sha256(req.file.buffer);
      rec.updatedAt = new Date().toISOString();
      rec.version = (rec.version || 0) + 1;
      await writeManifest(manifestPath, m);
      invalidateManifest();
      res.json({ ok: true, url, record: rec });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/manifest/rebuild ──────────────────────────────────────
  app.post('/api/manifest/rebuild', requireAuth({ admin: true }), async (_req, res) => {
    try {
      const { spawnRebuild } = await import('../scripts/rebuild-manifest-v2.js').catch(() => ({}));
      // Fallback: exec node on the script
      const child = spawn(process.execPath, [path.resolve('scripts/rebuild-manifest-v2.js')], { stdio: 'pipe' });
      let out = '';
      child.stdout.on('data', (d) => { out += d.toString(); });
      child.stderr.on('data', (d) => { out += d.toString(); });
      child.on('close', async (code) => {
        invalidateManifest();
        if (code === 0) res.json({ ok: true, log: out });
        else res.status(500).json({ ok: false, code, log: out });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/ingest/wcs ────────────────────────────────────────────
  app.post('/api/ingest/wcs', requireAuth(), async (req, res) => {
    try {
      const { files } = req.body || {}; // [{relPath, size, sha256, mime, tags?, pack?}]
      if (!Array.isArray(files)) return res.status(400).json({ error: 'files[] required' });
      const m = await getManifest();
      const diff = { added: 0, updated: 0, skipped: 0 };
      for (const f of files) {
        const path2 = `${WCS_PREFIX}/${String(f.relPath).replace(/^\/+/, '')}`;
        const rec = normRecord({
          path: path2,
          size: f.size,
          sha256: f.sha256,
          mime: f.mime,
          tags: ['wcs', ...(f.tags || [])],
          pack: f.pack || 'wcs',
          r2Key: `game-assets/${path2}`,
        });
        const idx = m.assets.findIndex((x) => x.path === path2);
        if (idx >= 0) {
          if (m.assets[idx].sha256 && rec.sha256 && m.assets[idx].sha256 === rec.sha256) {
            diff.skipped++;
            continue;
          }
          m.assets[idx] = { ...m.assets[idx], ...rec };
          diff.updated++;
        } else {
          m.assets.push(rec);
          diff.added++;
        }
      }
      m.generatedAt = new Date().toISOString();
      await writeManifest(manifestPath, m);
      invalidateManifest();
      res.json({ ok: true, diff, manifestPath: path.basename(manifestPath) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/convert/to-glb (fbx/obj → glb) ───────────────────────
  app.post('/api/convert/to-glb', requireAuth(), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'no-file' });
      const name = req.file.originalname.toLowerCase();
      const tmpDir = await fs.mkdtemp(path.join(path.resolve('.'), '.convert-'));
      const src = path.join(tmpDir, req.file.originalname);
      const out = path.join(tmpDir, 'out.glb');
      await fs.writeFile(src, req.file.buffer);
      if (name.endsWith('.obj')) {
        const { default: obj2gltf } = await import('obj2gltf');
        const gltf = await obj2gltf(src, { binary: true });
        await fs.writeFile(out, gltf);
      } else {
        return res.status(415).json({ error: 'only-obj-supported-server-side', hint: 'fbx conversion runs client-side' });
      }
      // Return the raw GLB URL (data: for small, store for large). Simple path: data URL.
      const buf = await fs.readFile(out);
      await fs.rm(tmpDir, { recursive: true, force: true });
      const b64 = buf.toString('base64');
      res.json({ url: `data:model/gltf-binary;base64,${b64}` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

export default mountV2Routes;
