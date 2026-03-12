/**
 * ObjectStore Express API Server
 *
 * Sprite & asset API with S3 storage bridge:
 *
 *   GET  /api/v1/sprites                    → Paginated sprite list
 *   GET  /api/v1/sprites/search?q=...       → Search sprites
 *   GET  /api/v1/sprites/:uuid              → Sprite by UUID
 *   GET  /api/v1/characters                 → All animated characters
 *   GET  /api/v1/characters/:uuid           → Character by UUID
 *   GET  /api/v1/stats                      → Registry statistics
 *   GET  /api/assets/categories             → Legacy asset categories
 *   GET  /api/assets/search?q=...           → Legacy asset search
 *   GET  /api/assets/:uuid                  → Legacy asset by UUID
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

// ─── Middleware ───
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Data loading ───
let spriteData = null;
let characterData = null;
let assetRegistry = null;
let spriteIndex = [];

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

app.delete('/api/storage/*', async (req, res) => {
  try {
    const key = req.params[0];
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
app.use(express.static(__dirname));

// ─── Start ───
loadData();
app.listen(PORT, () => {
  console.log(`\n🚀 ObjectStore API running at http://localhost:${PORT}/`);
  console.log(`\n📡 Sprite API:`);
  console.log(`   GET  /api/v1/sprites?category=characters&page=1&limit=50`);
  console.log(`   GET  /api/v1/sprites/search?q=archer`);
  console.log(`   GET  /api/v1/sprites/SPRT-xxxx-xxxx`);
  console.log(`   GET  /api/v1/characters`);
  console.log(`   GET  /api/v1/characters/:uuid`);
  console.log(`   GET  /api/v1/stats`);
  console.log(`\n📦 Storage:`);
  console.log(`   POST   /api/storage/upload`);
  console.log(`   POST   /api/storage/upload-multi`);
  console.log(`   POST   /api/storage/upload-zip`);
  console.log(`   DELETE /api/storage/:key`);
  console.log(`   GET    /api/storage/list?prefix=...`);
  console.log(`\n✨ Press Ctrl+C to stop`);
});
