#!/usr/bin/env node
/**
 * seed-d1-assets.js — Seed ObjectStore D1 database
 *
 * Reads master-registry.json and inserts all asset records into the
 * objectstore-api D1 database via wrangler d1 execute.
 *
 * This populates the /v1/assets API with real data so web browsers,
 * Grudge Engine, and game clients can query assets programmatically.
 *
 * Usage:
 *   node scripts/seed-d1-assets.js
 *   node scripts/seed-d1-assets.js --dry-run
 *   node scripts/seed-d1-assets.js --database grudge-objectstore
 *
 * Requires: npx wrangler (authenticated with Cloudflare)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REGISTRY_PATH = path.join(__dirname, '..', 'api', 'v1', 'master-registry.json');
const DB_NAME = process.argv.find(a => a.startsWith('--database='))?.split('=')[1] || 'grudge-objectstore';
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 50; // D1 batch limit

// ── Load registry ──────────────────────────────────────────────
if (!fs.existsSync(REGISTRY_PATH)) {
  console.error('ERROR: master-registry.json not found. Run build-master-registry.ps1 first.');
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
console.log(`Loaded ${registry.stats.totalAssets} assets from master-registry.json`);

// ── Create table SQL ───────────────────────────────────────────
const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT,
  mime TEXT NOT NULL DEFAULT 'application/octet-stream',
  size INTEGER DEFAULT 0,
  category TEXT DEFAULT 'other',
  tags TEXT DEFAULT '[]',
  pack TEXT,
  type TEXT DEFAULT 'texture',
  visibility TEXT DEFAULT 'public',
  metadata TEXT DEFAULT '{}',
  cdn_url TEXT,
  gh_url TEXT,
  sha256 TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_pack ON assets(pack);
`.trim();

// ── MIME type helper ───────────────────────────────────────────
function mimeFromFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimes = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.tga': 'image/x-tga', '.gif': 'image/gif',
    '.fbx': 'model/fbx', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
    '.obj': 'model/obj', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
    '.wav': 'audio/wav', '.json': 'application/json',
  };
  return mimes[ext] || 'application/octet-stream';
}

// ── Escape SQL string ──────────────────────────────────────────
function esc(s) {
  if (s == null) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

// ── Build INSERT statements ────────────────────────────────────
function buildInserts(assets) {
  return assets.map(a => {
    const mime = mimeFromFilename(a.filename);
    const tags = JSON.stringify(a.tags || []);
    return `INSERT OR IGNORE INTO assets (id, r2_key, filename, original_name, mime, size, category, tags, pack, type, visibility, cdn_url, gh_url) VALUES (${esc(a.id)}, ${esc(a.r2Key)}, ${esc(a.filename)}, ${esc(a.original)}, ${esc(mime)}, ${a.size || 0}, ${esc(a.category)}, ${esc(tags)}, ${esc(a.pack)}, ${esc(a.type)}, 'public', ${esc(a.cdnUrl)}, ${esc(a.ghUrl)});`;
  });
}

// ── Execute via wrangler ───────────────────────────────────────
function execD1(sql, label) {
  if (DRY_RUN) {
    console.log(`[DRY] ${label}: ${sql.length} chars`);
    return;
  }
  try {
    // Write SQL to temp file to avoid command-line length limits
    const tmpFile = path.join(__dirname, '.d1-seed-tmp.sql');
    fs.writeFileSync(tmpFile, sql, 'utf-8');
    execSync(`npx wrangler d1 execute ${DB_NAME} --file="${tmpFile}" --remote`, {
      stdio: 'pipe',
      timeout: 30000,
    });
    fs.unlinkSync(tmpFile);
    console.log(`  OK: ${label}`);
  } catch (err) {
    console.error(`  ERR: ${label}: ${err.message}`);
  }
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== D1 Asset Seed ===`);
  console.log(`Database: ${DB_NAME}`);
  console.log(`Assets:   ${registry.assets.length}`);
  console.log(`Dry run:  ${DRY_RUN}`);
  console.log('');

  // 1. Create table
  console.log('Creating table...');
  execD1(CREATE_TABLE, 'CREATE TABLE');

  // 2. Insert in batches
  const assets = registry.assets;
  const totalBatches = Math.ceil(assets.length / BATCH_SIZE);

  console.log(`Inserting ${assets.length} assets in ${totalBatches} batches...`);

  for (let i = 0; i < assets.length; i += BATCH_SIZE) {
    const batch = assets.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const inserts = buildInserts(batch);
    const sql = inserts.join('\n');
    execD1(sql, `Batch ${batchNum}/${totalBatches} (${batch.length} rows)`);
  }

  console.log(`\n=== Seed Complete ===`);
  console.log(`Total batches: ${totalBatches}`);
  console.log(`Total assets:  ${assets.length}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
