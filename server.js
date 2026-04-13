/**
 * ObjectStore Express API Server — Production
 *
 * Grudge Studio game data backbone.
 * Serves 40+ JSON collections, weapon skills, sprites, and R2 storage bridge.
 *
 * Core API:
 *   GET  /health                            → Detailed health check
 *   GET  /api/v1/weapon-skills              → All 17 weapon types + 207 skills
 *   GET  /api/v1/weapon-skills/:type        → Skills for a weapon type
 *   GET  /api/v1/weapon-skills/class/:class → Weapons available to a class
 *   GET  /api/v1/weapon-skills/search?q=... → Search skills by name/effect
 *   GET  /api/v1/game-data                  → List available JSON collections
 *   GET  /api/v1/game-data/:name            → Serve any game data collection
 *   GET  /api/v1/sprites                    → Paginated sprite list
 *   GET  /api/v1/sprites/search?q=...       → Search sprites
 *   GET  /api/v1/sprites/:uuid              → Sprite by UUID
 *   GET  /api/v1/characters                 → All animated characters
 *   GET  /api/v1/characters/:uuid           → Character by UUID
 *   GET  /api/v1/stats                      → Registry statistics
 *
 * Storage bridge (S3/local):
 *   POST   /api/storage/upload              → Upload single file
 *   POST   /api/storage/upload-multi        → Upload multiple files
 *   POST   /api/storage/upload-zip          → Upload & unzip
 *   DELETE /api/storage/:key                → Delete file
 *   GET    /api/storage/list?prefix=...     → List stored files
 *
 * Usage: node server.js
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GRUDGE_API_KEY || null;
const startTime = Date.now();
let requestCount = 0;

// ─── Rate Limiter (in-memory, per IP) ───
const rateLimits = new Map();
const RATE_WINDOW = 60_000; // 1 minute
const RATE_MAX = parseInt(process.env.RATE_LIMIT || '120', 10);

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = rateLimits.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW) {
    entry = { windowStart: now, count: 0 };
    rateLimits.set(ip, entry);
  }
  entry.count++;
  res.set('X-RateLimit-Limit', String(RATE_MAX));
  res.set('X-RateLimit-Remaining', String(Math.max(0, RATE_MAX - entry.count)));
  res.set('X-RateLimit-Reset', String(Math.ceil((entry.windowStart + RATE_WINDOW) / 1000)));
  if (entry.count > RATE_MAX) {
    return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: Math.ceil((entry.windowStart + RATE_WINDOW - now) / 1000) });
  }
  next();
}

// Clean stale rate limit entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW * 2;
  for (const [ip, entry] of rateLimits) {
    if (entry.windowStart < cutoff) rateLimits.delete(ip);
  }
}, 300_000);

// ─── Security Headers ───
function securityHeaders(req, res, next) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('X-Powered-By', 'Grudge Studio ObjectStore');
  res.set('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Request-Id');
  res.set('X-Request-Id', crypto.randomUUID());
  next();
}

// ─── Request Logger ───
function requestLogger(req, res, next) {
  requestCount++;
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      const status = res.statusCode;
      const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`${color}${req.method} ${req.originalUrl} ${status}\x1b[0m ${ms}ms`);
    }
  });
  next();
}

// ─── API Key Auth (for write ops) ───
function requireApiKey(req, res, next) {
  if (!API_KEY) return next(); // No key configured = dev mode
  const provided = req.headers['x-api-key'] || req.query.apiKey;
  if (provided !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

// ─── Middleware Stack ───
app.use(securityHeaders);
app.use(requestLogger);
app.use(rateLimit);
app.use(cors({
  origin: [
    /\.grudge-studio\.com$/,
    /\.grudgestudio\.com$/,
    /\.grudgewarlords\.com$/,
    /\.vercel\.app$/,
    /\.github\.io$/,
    /\.puter\.site$/,
    /localhost/,
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Data loading ───
let spriteData = null;
let characterData = null;
let assetRegistry = null;
let gdevelopManifest = null;
let weaponSkillsData = null;
let spriteIndex = [];
let weaponSkillIndex = []; // flat index for search
const gameDataCache = new Map(); // cache for JSON collections

function loadData() {
  try {
    spriteData = JSON.parse(fs.readFileSync(path.join(__dirname, 'api/v1/sprites2d.json'), 'utf-8'));
    spriteIndex = [];
    for (const cat of Object.keys(spriteData.categories)) {
      for (const spr of spriteData.categories[cat].items) {
        spriteIndex.push({
          ...spr,
          _search: `${spr.name} ${spr.id} ${spr.category} ${spr.subcategory} ${spr.uuid}`.toLowerCase()
        });
      }
    }
    console.log(`📦 Sprites loaded: ${spriteData.totalSprites} sprites`);
  } catch (e) {
    console.warn('⚠️  sprites2d.json not found. Run: node scripts/rebuild-sprites2d.mjs');
  }

  try {
    characterData = JSON.parse(fs.readFileSync(path.join(__dirname, 'api/v1/sprite-characters.json'), 'utf-8'));
    console.log(`👥 Characters loaded: ${characterData.totalCharacters} characters`);
  } catch (e) {
    console.warn('⚠️  sprite-characters.json not found.');
  }

  try {
    assetRegistry = JSON.parse(fs.readFileSync(path.join(__dirname, 'api/v1/asset-registry.json'), 'utf-8'));
    console.log(`📦 Legacy registry loaded: ${assetRegistry.totalAssets} assets`);
  } catch (e) { /* optional */ }

  try {
    gdevelopManifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'api/v1/gdevelop-assets.json'), 'utf-8'));
    console.log(`🎮 GDevelop manifest loaded: ${gdevelopManifest.totalAssets} assets`);
  } catch (e) { /* optional — run npm run build:gdevelop */ }

  try {
    weaponSkillsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'api/v1/weaponSkills.json'), 'utf-8'));
    // Build flat search index
    weaponSkillIndex = [];
    for (const wt of weaponSkillsData.weaponTypes) {
      for (const slot of wt.slots) {
        for (const skill of slot.skills) {
          weaponSkillIndex.push({
            ...skill,
            weaponType: wt.id,
            weaponName: wt.name,
            slotType: slot.type,
            _search: `${skill.name} ${skill.description} ${skill.id} ${(skill.effects || []).join(' ')} ${skill.damageType || ''} ${skill.physics || ''}`.toLowerCase(),
          });
        }
      }
    }
    console.log(`⚔  Weapon skills loaded: ${weaponSkillsData.totalWeaponTypes} types, ${weaponSkillsData.totalSkills} skills`);
  } catch (e) {
    console.warn('⚠️  weaponSkills.json not found. Run: node scripts/export-weapon-skills.mjs');
  }
}

// ─── Helpers ───
function jsonOk(res, data) { res.json(data); }
function jsonErr(res, code, msg) { res.status(code).json({ error: msg }); }

function mimeFromExt(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4', '.webm': 'video/webm',
    '.json': 'application/json', '.js': 'text/javascript',
    '.css': 'text/css', '.html': 'text/html',
    '.zip': 'application/zip', '.pdf': 'application/pdf',
  };
  return map[ext] || 'application/octet-stream';
}

// ═══════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════

app.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  jsonOk(res, {
    status: 'ok',
    service: 'objectstore-api',
    version: '3.1.0',
    uptime: uptimeSeconds,
    uptimeHuman: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`,
    requestCount,
    data: {
      sprites: spriteData ? spriteData.totalSprites : 0,
      characters: characterData ? characterData.totalCharacters : 0,
      weaponTypes: weaponSkillsData ? weaponSkillsData.totalWeaponTypes : 0,
      weaponSkills: weaponSkillsData ? weaponSkillsData.totalSkills : 0,
      gdevelopAssets: gdevelopManifest ? gdevelopManifest.totalAssets : 0,
      legacyAssets: assetRegistry ? assetRegistry.totalAssets : 0,
    },
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════
//  WEAPON SKILLS API
// ═══════════════════════════════════

// GET /api/v1/weapon-skills — All weapon types
app.get('/api/v1/weapon-skills', (req, res) => {
  if (!weaponSkillsData) return jsonErr(res, 503, 'Weapon skills not loaded. Run: node scripts/export-weapon-skills.mjs');
  const { tier, className } = req.query;
  let types = weaponSkillsData.weaponTypes;
  if (className) {
    const allowed = weaponSkillsData.classRestrictions[className];
    if (allowed) types = types.filter(wt => allowed.includes(wt.id));
  }
  jsonOk(res, {
    version: weaponSkillsData.version,
    totalWeaponTypes: types.length,
    totalSkills: types.reduce((s, w) => s + w.totalSkills, 0),
    classRestrictions: weaponSkillsData.classRestrictions,
    weaponTypes: types.map(wt => ({
      id: wt.id, name: wt.name, icon: wt.icon, classes: wt.classes, totalSkills: wt.totalSkills,
    })),
  });
});

// GET /api/v1/weapon-skills/search?q=fire&damageType=fire&slot=ability
app.get('/api/v1/weapon-skills/search', (req, res) => {
  if (!weaponSkillsData) return jsonErr(res, 503, 'Weapon skills not loaded');
  const q = (req.query.q || '').toLowerCase().trim();
  const damageType = req.query.damageType || null;
  const slot = req.query.slot || null;
  const physics = req.query.physics || null;
  const projectile = req.query.projectile || null;
  const limit = Math.min(200, parseInt(req.query.limit) || 50);
  if (!q && !damageType && !slot && !physics && !projectile) {
    return jsonErr(res, 400, 'Provide at least one filter: q, damageType, slot, physics, projectile');
  }
  let results = weaponSkillIndex;
  if (q) results = results.filter(s => s._search.includes(q));
  if (damageType) results = results.filter(s => s.damageType === damageType);
  if (slot) results = results.filter(s => s.slotType === slot);
  if (physics) results = results.filter(s => s.physics === physics);
  if (projectile) results = results.filter(s => s.projectile === projectile);
  jsonOk(res, {
    query: { q, damageType, slot, physics, projectile },
    count: results.length,
    results: results.slice(0, limit).map(({ _search, ...s }) => s),
  });
});

// GET /api/v1/weapon-skills/class/:className
app.get('/api/v1/weapon-skills/class/:className', (req, res) => {
  if (!weaponSkillsData) return jsonErr(res, 503, 'Weapon skills not loaded');
  const className = req.params.className;
  const allowed = weaponSkillsData.classRestrictions[className];
  if (!allowed) return jsonErr(res, 404, `Unknown class: ${className}. Valid: ${Object.keys(weaponSkillsData.classRestrictions).join(', ')}`);
  const types = weaponSkillsData.weaponTypes.filter(wt => allowed.includes(wt.id));
  jsonOk(res, {
    className,
    allowedWeapons: allowed,
    totalWeaponTypes: types.length,
    totalSkills: types.reduce((s, w) => s + w.totalSkills, 0),
    weaponTypes: types,
  });
});

// GET /api/v1/weapon-skills/:weaponType — Full skill tree for a weapon
app.get('/api/v1/weapon-skills/:weaponType', (req, res) => {
  if (!weaponSkillsData) return jsonErr(res, 503, 'Weapon skills not loaded');
  const wt = weaponSkillsData.weaponTypes.find(
    w => w.id === req.params.weaponType.toUpperCase() || w.name.toLowerCase() === req.params.weaponType.toLowerCase()
  );
  if (!wt) return jsonErr(res, 404, `Weapon type not found: ${req.params.weaponType}`);
  jsonOk(res, wt);
});

// ═══════════════════════════════════
//  GAME DATA API (serve any JSON collection)
// ═══════════════════════════════════

const GAME_DATA_DIR = path.join(__dirname, 'api', 'v1');
const GAME_DATA_BLOCKLIST = new Set(['gdevelop-assets', 'asset-registry', 'master-registry']); // too large for unbounded serving

// GET /api/v1/game-data — List available collections
app.get('/api/v1/game-data', (req, res) => {
  try {
    const files = fs.readdirSync(GAME_DATA_DIR).filter(f => f.endsWith('.json') && !GAME_DATA_BLOCKLIST.has(f.replace('.json', '')));
    const collections = files.map(f => {
      const name = f.replace('.json', '');
      const stat = fs.statSync(path.join(GAME_DATA_DIR, f));
      return { name, file: f, sizeBytes: stat.size, sizeHuman: (stat.size / 1024).toFixed(1) + 'KB', lastModified: stat.mtime.toISOString() };
    }).sort((a, b) => a.name.localeCompare(b.name));
    jsonOk(res, { count: collections.length, collections });
  } catch (e) {
    jsonErr(res, 500, 'Failed to list game data');
  }
});

// GET /api/v1/game-data/:name — Serve a specific collection
app.get('/api/v1/game-data/:name', (req, res) => {
  const name = req.params.name.replace(/\.json$/, '');
  if (GAME_DATA_BLOCKLIST.has(name)) return jsonErr(res, 403, `Collection "${name}" is too large for direct serving. Use specific API endpoints.`);
  // Check cache
  if (gameDataCache.has(name)) {
    res.set('X-Cache', 'HIT');
    res.set('Cache-Control', 'public, max-age=300');
    return jsonOk(res, gameDataCache.get(name));
  }
  const filePath = path.join(GAME_DATA_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return jsonErr(res, 404, `Collection not found: ${name}`);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    gameDataCache.set(name, data);
    // Evict cache after 5 minutes
    setTimeout(() => gameDataCache.delete(name), 300_000);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=300');
    jsonOk(res, data);
  } catch (e) {
    jsonErr(res, 500, `Failed to parse ${name}.json`);
  }
});

// ═══════════════════════════════════
//  SPRITE API v1
// ═══════════════════════════════════

app.get('/api/v1/sprites', (req, res) => {
  if (!spriteData) return jsonErr(res, 503, 'Sprite data not loaded');
  const category = req.query.category || null;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  let items = spriteIndex;
  if (category) items = items.filter(s => s.category === category);
  const total = items.length;
  const start = (page - 1) * limit;
  jsonOk(res, { total, page, limit, totalPages: Math.ceil(total / limit), sprites: items.slice(start, start + limit).map(({ _search, ...s }) => s) });
});

app.get('/api/v1/sprites/search', (req, res) => {
  if (!spriteData) return jsonErr(res, 503, 'Sprite data not loaded');
  const q = (req.query.q || '').toLowerCase().trim();
  const category = req.query.category || null;
  const limit = Math.min(200, parseInt(req.query.limit) || 50);
  if (!q && !category) return jsonErr(res, 400, 'Provide ?q= or ?category=');
  let results = spriteIndex;
  if (category) results = results.filter(s => s.category === category);
  if (q) results = results.filter(s => s._search.includes(q));
  jsonOk(res, { query: q, category, count: results.length, results: results.slice(0, limit).map(({ _search, ...s }) => s) });
});

app.get('/api/v1/sprites/:uuid', (req, res) => {
  if (!spriteData) return jsonErr(res, 503, 'Sprite data not loaded');
  const spr = spriteIndex.find(s => s.uuid === req.params.uuid);
  if (!spr) return jsonErr(res, 404, `Sprite not found: ${req.params.uuid}`);
  const { _search, ...data } = spr;
  jsonOk(res, data);
});

app.get('/api/v1/characters', (req, res) => {
  if (!characterData) return jsonErr(res, 503, 'Character data not loaded');
  const category = req.query.category || null;
  let chars = characterData.characters;
  if (category) chars = chars.filter(c => c.category === category);
  jsonOk(res, { total: chars.length, characters: chars });
});

app.get('/api/v1/characters/:uuid', (req, res) => {
  if (!characterData) return jsonErr(res, 503, 'Character data not loaded');
  const ch = characterData.characters.find(c => c.uuid === req.params.uuid);
  if (!ch) return jsonErr(res, 404, `Character not found: ${req.params.uuid}`);
  jsonOk(res, ch);
});

app.get('/api/v1/stats', (req, res) => {
  jsonOk(res, {
    sprites: spriteData ? { total: spriteData.totalSprites, version: spriteData.version, categories: Object.fromEntries(Object.entries(spriteData.categories).map(([k, v]) => [k, v.count])) } : null,
    characters: characterData ? { total: characterData.totalCharacters, totalAnimations: characterData.totalAnimations } : null,
    legacy: assetRegistry ? { totalAssets: assetRegistry.totalAssets, totalCategories: assetRegistry.totalCategories } : null
  });
});

// ═══════════════════════════════════
//  GDEVELOP ASSET MANIFEST API
// ═══════════════════════════════════

app.get('/api/v1/gdevelop-assets', (req, res) => {
  if (!gdevelopManifest) return jsonErr(res, 503, 'GDevelop manifest not loaded. Run: npm run build:gdevelop');
  const { type, category, search, page = 1, limit = 200 } = req.query;
  let assets = gdevelopManifest.assets;
  if (type) assets = assets.filter(a => a.type === type);
  if (category) assets = assets.filter(a => a.category === category);
  if (search) {
    const q = search.toLowerCase();
    assets = assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }
  const total = assets.length;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(500, Math.max(1, parseInt(limit) || 200));
  const start = (p - 1) * l;
  jsonOk(res, { total, page: p, limit: l, types: gdevelopManifest.types, assets: assets.slice(start, start + l) });
});

app.get('/api/v1/gdevelop-assets/categories', (req, res) => {
  if (!gdevelopManifest) return jsonErr(res, 503, 'GDevelop manifest not loaded');
  jsonOk(res, { total: gdevelopManifest.totalAssets, types: gdevelopManifest.types, categories: gdevelopManifest.categories });
});

// ═══════════════════════════════════
//  LEGACY ASSET API
// ═══════════════════════════════════

app.get('/api/assets/categories', (req, res) => {
  if (!assetRegistry) return jsonErr(res, 503, 'Asset registry not loaded');
  const categories = {};
  for (const [key, val] of Object.entries(assetRegistry.categories)) {
    categories[key] = { count: val.count };
  }
  jsonOk(res, { totalCategories: assetRegistry.totalCategories, totalAssets: assetRegistry.totalAssets, categories });
});

app.get('/api/assets/search', (req, res) => {
  if (!assetRegistry) return jsonErr(res, 503, 'Asset registry not loaded');
  const q = (req.query.q || '').toLowerCase().trim();
  const category = req.query.category || null;
  const limit = Math.min(200, parseInt(req.query.limit) || 50);
  if (!q && !category) return jsonErr(res, 400, 'Provide ?q= or ?category=');
  let results = Object.values(assetRegistry.assets).map(a => ({ ...a, _s: `${a.name} ${a.filename} ${a.category}`.toLowerCase() }));
  if (category) results = results.filter(a => a.category === category);
  if (q) results = results.filter(a => a._s.includes(q));
  jsonOk(res, { query: q, category, count: results.length, results: results.slice(0, limit).map(({ _s, ...r }) => r) });
});

app.get('/api/assets/:uuid', (req, res) => {
  if (!assetRegistry) return jsonErr(res, 503, 'Asset registry not loaded');
  const asset = assetRegistry.assets[req.params.uuid];
  if (!asset) return jsonErr(res, 404, `Asset not found: ${req.params.uuid}`);
  jsonOk(res, asset);
});

// ═══════════════════════════════════
//  STORAGE BRIDGE (S3 / Local)
// ═══════════════════════════════════

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

function getAdapter() {
  if (process.env.S3_ENDPOINT && process.env.S3_BUCKET) {
    try {
      const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
      const s3 = new S3Client({
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY },
        forcePathStyle: true,
      });
      return { type: 's3', s3, bucket: process.env.S3_BUCKET, publicUrl: process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command };
    } catch (e) {
      console.warn('⚠️  S3 configured but @aws-sdk/client-s3 not installed. Falling back to local.');
    }
  }
  return { type: 'local' };
}

app.post('/api/storage/upload', memUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return jsonErr(res, 400, 'No file provided');
    const folder = (req.body.folder || '').replace(/\/$/, '');
    const fileName = folder ? `${folder}/${req.file.originalname}` : req.file.originalname;
    const ct = req.file.mimetype || mimeFromExt(req.file.originalname);
    const adapter = getAdapter();
    if (adapter.type === 's3') {
      const key = `sprites/${fileName}`;
      await adapter.s3.send(new adapter.PutObjectCommand({ Bucket: adapter.bucket, Key: key, Body: req.file.buffer, ContentType: ct }));
      jsonOk(res, { success: true, key, name: req.file.originalname, size: req.file.size, contentType: ct, url: `${adapter.publicUrl}/${key}` });
    } else {
      const id = crypto.randomUUID();
      const ext = path.extname(req.file.originalname) || '.bin';
      const storedName = `${id}${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, storedName), req.file.buffer);
      fs.writeFileSync(path.join(UPLOAD_DIR, `${storedName}.meta.json`), JSON.stringify({ original: req.file.originalname, contentType: ct, size: req.file.size, uploaded: new Date().toISOString() }));
      jsonOk(res, { success: true, key: `/uploads/${storedName}`, name: req.file.originalname, size: req.file.size, contentType: ct });
    }
  } catch (e) { console.error('Upload error:', e.message); jsonErr(res, 500, 'Upload failed'); }
});

app.post('/api/storage/upload-multi', memUpload.array('files', 50), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return jsonErr(res, 400, 'No files provided');
    const folder = (req.body.folder || '').replace(/\/$/, '');
    const adapter = getAdapter();
    const results = [];
    for (const file of files) {
      const fileName = folder ? `${folder}/${file.originalname}` : file.originalname;
      const ct = file.mimetype || mimeFromExt(file.originalname);
      if (adapter.type === 's3') {
        const key = `sprites/${fileName}`;
        await adapter.s3.send(new adapter.PutObjectCommand({ Bucket: adapter.bucket, Key: key, Body: file.buffer, ContentType: ct }));
        results.push({ key, name: file.originalname, size: file.size, contentType: ct });
      } else {
        const id = crypto.randomUUID();
        const ext = path.extname(file.originalname) || '.bin';
        const storedName = `${id}${ext}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, storedName), file.buffer);
        results.push({ key: `/uploads/${storedName}`, name: file.originalname, size: file.size, contentType: ct });
      }
    }
    jsonOk(res, { success: true, uploaded: results.length, files: results });
  } catch (e) { console.error('Multi-upload error:', e.message); jsonErr(res, 500, 'Multi-upload failed'); }
});

app.post('/api/storage/upload-zip', memUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return jsonErr(res, 400, 'No ZIP file provided');
    if (path.extname(req.file.originalname).toLowerCase() !== '.zip') return jsonErr(res, 400, 'Only ZIP files allowed');
    let AdmZip;
    try { AdmZip = require('adm-zip'); } catch { return jsonErr(res, 501, 'adm-zip not installed. Run: npm install adm-zip'); }
    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries();
    const folder = (req.body.folder || `unzipped/${crypto.randomUUID()}`).replace(/\/$/, '');
    const adapter = getAdapter();
    const uploaded = [], skipped = [];
    for (const entry of entries) {
      if (entry.isDirectory || entry.entryName.startsWith('__MACOSX') || entry.entryName.startsWith('.')) { skipped.push(entry.entryName); continue; }
      const data = entry.getData();
      if (data.length === 0) { skipped.push(entry.entryName); continue; }
      const entryPath = `${folder}/${entry.entryName}`;
      const ct = mimeFromExt(entry.entryName);
      if (adapter.type === 's3') {
        await adapter.s3.send(new adapter.PutObjectCommand({ Bucket: adapter.bucket, Key: entryPath, Body: data, ContentType: ct }));
        uploaded.push({ key: entryPath, name: entry.entryName, size: data.length, contentType: ct });
      } else {
        const dir = path.join(UPLOAD_DIR, path.dirname(entryPath));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(UPLOAD_DIR, entryPath), data);
        uploaded.push({ key: `/uploads/${entryPath}`, name: entry.entryName, size: data.length, contentType: ct });
      }
    }
    jsonOk(res, { success: true, uploaded: uploaded.length, skipped: skipped.length, files: uploaded });
  } catch (e) { console.error('Zip upload error:', e.message); jsonErr(res, 500, 'ZIP upload failed'); }
});

app.delete('/api/storage/{*key}', async (req, res) => {
  try {
    const key = req.params.key;
    if (!key) return jsonErr(res, 400, 'Key required');
    const adapter = getAdapter();
    if (adapter.type === 's3') {
      await adapter.s3.send(new adapter.DeleteObjectCommand({ Bucket: adapter.bucket, Key: key }));
      jsonOk(res, { success: true, deleted: key });
    } else {
      const filePath = path.join(UPLOAD_DIR, key);
      if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); jsonOk(res, { success: true, deleted: key }); }
      else jsonErr(res, 404, 'File not found');
    }
  } catch (e) { console.error('Delete error:', e.message); jsonErr(res, 500, 'Delete failed'); }
});

app.get('/api/storage/list', async (req, res) => {
  try {
    const prefix = req.query.prefix || '';
    const adapter = getAdapter();
    if (adapter.type === 's3') {
      const result = await adapter.s3.send(new adapter.ListObjectsV2Command({ Bucket: adapter.bucket, Prefix: prefix, MaxKeys: 200 }));
      const items = (result.Contents || []).map(o => ({ key: o.Key, size: o.Size, lastModified: o.LastModified }));
      jsonOk(res, { count: items.length, items });
    } else {
      const dir = path.join(UPLOAD_DIR, prefix);
      if (!fs.existsSync(dir)) return jsonOk(res, { count: 0, items: [] });
      const files = fs.readdirSync(dir, { withFileTypes: true }).filter(f => f.isFile() && !f.name.endsWith('.meta.json'));
      const items = files.map(f => { const fp = path.join(dir, f.name); const stat = fs.statSync(fp); return { key: path.join(prefix, f.name).replace(/\\/g, '/'), size: stat.size, lastModified: stat.mtime }; });
      jsonOk(res, { count: items.length, items });
    }
  } catch (e) { console.error('List error:', e.message); jsonErr(res, 500, 'List failed'); }
});

// ═══════════════════════════════════
//  STATIC FILES
// ═══════════════════════════════════
app.use(express.static(__dirname, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));

// ─── 404 handler ───
app.use((req, res) => {
  jsonErr(res, 404, `Not found: ${req.method} ${req.originalUrl}`);
});

// ─── Error handler ───
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  jsonErr(res, 500, 'Internal server error');
});

// ─── Graceful shutdown ───
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}

// ─── Start ───
loadData();
const server = app.listen(PORT, () => {
  console.log(`\n🚀 ObjectStore API v3.1.0 — http://localhost:${PORT}/`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Rate limit: ${RATE_MAX}/min`);
  console.log(`   API key: ${API_KEY ? 'configured' : 'disabled (dev mode)'}`);
  console.log(`\n⚔  Weapon Skills:`);
  console.log(`   GET  /api/v1/weapon-skills`);
  console.log(`   GET  /api/v1/weapon-skills/SWORD`);
  console.log(`   GET  /api/v1/weapon-skills/class/Warrior`);
  console.log(`   GET  /api/v1/weapon-skills/search?q=fire&damageType=fire`);
  console.log(`\n📁 Game Data:`);
  console.log(`   GET  /api/v1/game-data`);
  console.log(`   GET  /api/v1/game-data/weapons`);
  console.log(`   GET  /api/v1/game-data/armor`);
  console.log(`\n📡 Sprites:`);
  console.log(`   GET  /api/v1/sprites?category=characters&page=1&limit=50`);
  console.log(`   GET  /api/v1/sprites/search?q=archer`);
  console.log(`   GET  /api/v1/characters`);
  console.log(`\n📦 Storage:`);
  console.log(`   POST   /api/storage/upload`);
  console.log(`   GET    /api/storage/list?prefix=...`);
  console.log(`\n❤️  Health: GET /health`);
  console.log(`✨ Press Ctrl+C to stop\n`);
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
