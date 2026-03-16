#!/usr/bin/env node
/**
 * Updates ObjectStore registries with Craftpix Fantasy UI + Magic Effects assets.
 * Adds entries to:
 *   - api/v1/effects-registry.json  (magic effects)
 *   - api/v1/asset-registry.json    (all assets)
 *   - api/v1/gdevelop-assets.json   (backend sync manifest)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OS_ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://molochdagod.github.io/ObjectStore';
const NOW = new Date().toISOString();

// ── Helpers ─────────────────────────────────────────────────────────
function camelCase(str) {
  return str
    .replace(/\.png$/, '')
    .replace(/[-_]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

function makeUUID(seq) {
  const ts = NOW.replace(/[-:T.Z]/g, '').slice(0, 14);
  const hash = crypto.createHash('md5').update(`craftpix-${seq}-${NOW}`).digest('hex').slice(0, 8).toUpperCase();
  return `SPRT-${ts}-${seq.toString(16).toUpperCase().padStart(6, '0')}-${hash}`;
}

function fileSize(filePath) {
  try { return fs.statSync(filePath).size; } catch { return 0; }
}

// ── 1. Update effects-registry.json ─────────────────────────────────
console.log('Updating effects-registry.json...');
const effectsPath = path.join(OS_ROOT, 'api/v1/effects-registry.json');
const effectsReg = JSON.parse(fs.readFileSync(effectsPath, 'utf8'));

const magicDir = path.join(OS_ROOT, 'sprites/effects/magic');
const magicFiles = fs.readdirSync(magicDir).filter(f => f.endsWith('.png'));

let magicAdded = 0;
for (const file of magicFiles) {
  const key = camelCase('magic-' + file);
  if (!effectsReg.effects[key]) {
    const relPath = `/sprites/effects/magic/${file}`;
    const sizeKB = Math.round(fileSize(path.join(magicDir, file)) / 1024);
    effectsReg.effects[key] = {
      src: relPath,
      sourceUrl: BASE_URL + relPath,
      filename: file,
      ext: 'png',
      subcategory: 'magic',
      sizeKB,
      categories: ['png', 'magic', 'pixel-art', 'spritesheet'],
    };
    magicAdded++;
  }
}

// Update subcategories count
if (!effectsReg.subcategories.magic) effectsReg.subcategories.magic = 0;
effectsReg.subcategories.magic += magicAdded;
effectsReg.totalEffects = Object.keys(effectsReg.effects).length;
effectsReg.generated = NOW;

fs.writeFileSync(effectsPath, JSON.stringify(effectsReg, null, 2));
console.log(`  -> Added ${magicAdded} magic effects (total: ${effectsReg.totalEffects})`);

// ── 2. Update asset-registry.json ───────────────────────────────────
console.log('Updating asset-registry.json...');
const assetRegPath = path.join(OS_ROOT, 'api/v1/asset-registry.json');
const assetReg = JSON.parse(fs.readFileSync(assetRegPath, 'utf8'));

let seq = Object.keys(assetReg.assets).length + 1;
let assetAdded = 0;

// Add magic effects
for (const file of magicFiles) {
  const relPath = `sprites/effects/magic/${file}`;
  const uuid = makeUUID(seq);
  assetReg.assets[uuid] = {
    uuid,
    filename: file,
    name: file.replace('.png', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    path: relPath,
    category: 'magic-effects',
    size: fileSize(path.join(magicDir, file)),
    type: 'image/png',
    cdn: `${BASE_URL}/${relPath}`,
  };
  seq++;
  assetAdded++;
}

// Add magic effect icons
const iconsDir = path.join(OS_ROOT, 'icons/magic-effects');
const iconFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));
for (const file of iconFiles) {
  const relPath = `icons/magic-effects/${file}`;
  const uuid = makeUUID(seq);
  assetReg.assets[uuid] = {
    uuid,
    filename: file,
    name: file.replace('.png', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    path: relPath,
    category: 'magic-effect-icons',
    size: fileSize(path.join(iconsDir, file)),
    type: 'image/png',
    cdn: `${BASE_URL}/${relPath}`,
  };
  seq++;
  assetAdded++;
}

// Add Fantasy UI elements
const uiRoot = path.join(OS_ROOT, 'sprites/ui/fantasy-interface');
const uiScreens = fs.readdirSync(uiRoot).filter(d =>
  fs.statSync(path.join(uiRoot, d)).isDirectory()
);

for (const screen of uiScreens) {
  const screenDir = path.join(uiRoot, screen);
  const files = fs.readdirSync(screenDir).filter(f => f.endsWith('.png'));
  for (const file of files) {
    const relPath = `sprites/ui/fantasy-interface/${screen}/${file}`;
    const uuid = makeUUID(seq);
    assetReg.assets[uuid] = {
      uuid,
      filename: file,
      name: `${screen} - ${file.replace('.png', '')}`.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      path: relPath,
      category: `ui-${screen}`,
      size: fileSize(path.join(screenDir, file)),
      type: 'image/png',
      cdn: `${BASE_URL}/${relPath}`,
    };
    seq++;
    assetAdded++;
  }
}

assetReg.totalAssets = Object.keys(assetReg.assets).length;
assetReg.generatedAt = NOW;
fs.writeFileSync(assetRegPath, JSON.stringify(assetReg, null, 2));
console.log(`  -> Added ${assetAdded} assets (total: ${assetReg.totalAssets})`);

// ── 3. Update gdevelop-assets.json (backend sync manifest) ─────────
console.log('Updating gdevelop-assets.json...');
const gdPath = path.join(OS_ROOT, 'api/v1/gdevelop-assets.json');
let gdManifest;
try {
  gdManifest = JSON.parse(fs.readFileSync(gdPath, 'utf8'));
} catch {
  gdManifest = { version: '1.0.0', totalAssets: 0, assets: [] };
}

const existingIds = new Set((gdManifest.assets || []).map(a => a.id));
const newEntries = [];

// Magic effects
for (const file of magicFiles) {
  const id = `craftpix-magic-${file.replace('.png', '')}`;
  if (existingIds.has(id)) continue;
  newEntries.push({
    id,
    name: file.replace('.png', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    type: 'sprite',
    category: 'effects',
    subcategory: 'magic',
    format: 'image/png',
    url: `${BASE_URL}/sprites/effects/magic/${file}`,
    previewUrl: `${BASE_URL}/sprites/effects/magic/${file}`,
    sizeBytes: fileSize(path.join(magicDir, file)),
    tags: ['magic', 'pixel-art', 'effect', 'spritesheet', 'craftpix'],
  });
}

// Magic icons
for (const file of iconFiles) {
  const id = `craftpix-magic-icon-${file.replace('.png', '').toLowerCase()}`;
  if (existingIds.has(id)) continue;
  newEntries.push({
    id,
    name: file.replace('.png', '').replace(/-/g, ' '),
    type: 'icon',
    category: 'icons',
    subcategory: 'magic-effects',
    format: 'image/png',
    url: `${BASE_URL}/icons/magic-effects/${file}`,
    previewUrl: `${BASE_URL}/icons/magic-effects/${file}`,
    sizeBytes: fileSize(path.join(iconsDir, file)),
    tags: ['magic', 'icon', 'ability', 'pixel-art', 'craftpix'],
  });
}

// Fantasy UI
for (const screen of uiScreens) {
  const screenDir = path.join(uiRoot, screen);
  const files = fs.readdirSync(screenDir).filter(f => f.endsWith('.png'));
  for (const file of files) {
    const id = `craftpix-ui-${screen}-${file.replace('.png', '')}`;
    if (existingIds.has(id)) continue;
    newEntries.push({
      id,
      name: `${screen} ${file.replace('.png', '')}`.replace(/_/g, ' '),
      type: 'ui',
      category: 'ui',
      subcategory: screen,
      format: 'image/png',
      url: `${BASE_URL}/sprites/ui/fantasy-interface/${screen}/${file}`,
      previewUrl: `${BASE_URL}/sprites/ui/fantasy-interface/${screen}/${file}`,
      sizeBytes: fileSize(path.join(screenDir, file)),
      tags: ['ui', 'fantasy', 'interface', screen, 'craftpix'],
    });
  }
}

gdManifest.assets = [...(gdManifest.assets || []), ...newEntries];
gdManifest.totalAssets = gdManifest.assets.length;
gdManifest.version = '1.1.0';
gdManifest.generatedAt = NOW;
fs.writeFileSync(gdPath, JSON.stringify(gdManifest, null, 2));
console.log(`  -> Added ${newEntries.length} entries to sync manifest (total: ${gdManifest.totalAssets})`);

console.log('\nDone! All registries updated.');
