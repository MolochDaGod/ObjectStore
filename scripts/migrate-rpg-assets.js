#!/usr/bin/env node
/**
 * migrate-rpg-assets.js — Migrate sprites, backgrounds & effects from RPG-MODULAR to ObjectStore
 *
 * Steps:
 *   1. copy    — Copy files from RPG-MODULAR/public to ObjectStore (preserving structure)
 *   2. upload  — Bulk upload to R2 via Worker API
 *   3. registry — Generate/update registry JSON files
 *
 * Usage:
 *   node scripts/migrate-rpg-assets.js --step copy      [--dry-run]
 *   node scripts/migrate-rpg-assets.js --step upload     [--dry-run] [--concurrency 5]
 *   node scripts/migrate-rpg-assets.js --step registry
 *   node scripts/migrate-rpg-assets.js --step all        [--dry-run]
 *
 * Environment:
 *   OBJECTSTORE_API_KEY — Required for upload step
 *   OBJECTSTORE_API_URL — Optional. Defaults to https://objectstore.grudge-studio.com
 */

const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────
const RPG_ROOT = path.resolve(__dirname, '..', '..', '..', 'RPG-MODULAR', 'RPG-MODULAR', 'public');
const OBJSTORE_ROOT = path.resolve(__dirname, '..');
const API_URL = process.env.OBJECTSTORE_API_URL || 'https://objectstore.grudge-studio.com';
const API_KEY = process.env.OBJECTSTORE_API_KEY;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const stepIdx = args.indexOf('--step');
const STEP = stepIdx >= 0 ? args[stepIdx + 1] : 'all';
const concurrencyIdx = args.indexOf('--concurrency');
const CONCURRENCY = concurrencyIdx >= 0 ? parseInt(args[concurrencyIdx + 1], 10) : 5;

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
const DATA_EXTS = new Set(['.json']);
const ALL_EXTS = new Set([...IMAGE_EXTS, ...DATA_EXTS]);

const BASE_URL = 'https://molochdagod.github.io/ObjectStore';

// ── Character sprite folders (vs. category folders like bosses, buildings, etc.) ──
const CATEGORY_SPRITE_DIRS = new Set([
  'bosses', 'buildings', 'companions', 'destructibles', 'effects',
  'inventory', 'monsters', 'npcs', 'projectiles', 'totems', 'ui'
]);

// ── Mapping from RPG-MODULAR source dirs to ObjectStore dest dirs ──
const ASSET_MAPPINGS = [
  {
    name: 'sprites',
    src: path.join(RPG_ROOT, 'sprites'),
    dest: path.join(OBJSTORE_ROOT, 'sprites'),
    r2Category: 'sprites',
    classify: (relPath) => {
      // relPath is like "archer/idle.png" or "bosses/demon/idle.png"
      const topDir = relPath.split('/')[0] || relPath.split('\\')[0];
      if (CATEGORY_SPRITE_DIRS.has(topDir)) {
        return { destSub: relPath, category: `sprites/${topDir}`, type: topDir };
      }
      // Character sprites → sprites/characters/{name}/
      // But existing ObjectStore has them at top level sprites/{name}/, so keep consistent
      return { destSub: relPath, category: 'sprites/characters', type: 'characters' };
    }
  },
  {
    name: 'backgrounds',
    src: path.join(RPG_ROOT, 'backgrounds'),
    dest: path.join(OBJSTORE_ROOT, 'backgrounds'),
    r2Category: 'backgrounds',
    classify: (relPath) => {
      if (relPath.toLowerCase().startsWith('battlebackgrounds')) {
        return { destSub: relPath, category: 'backgrounds/battle', type: 'battle' };
      }
      return { destSub: relPath, category: 'backgrounds', type: 'scene' };
    }
  },
  {
    name: 'effects',
    src: path.join(RPG_ROOT, 'effects'),
    dest: path.join(OBJSTORE_ROOT, 'sprites', 'effects'),
    r2Category: 'effects',
    classify: (relPath) => {
      const topDir = relPath.split('/')[0] || relPath.split('\\')[0];
      return { destSub: relPath, category: `effects/${topDir}`, type: topDir };
    }
  }
];

// ── Helpers ─────────────────────────────────────────────────────────

function walk(dir, exts = ALL_EXTS) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full, exts));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) {
        files.push(full);
      }
    }
  }
  return files;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function toRelUnix(basePath, fullPath) {
  return path.relative(basePath, fullPath).split(path.sep).join('/');
}

function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^./, c => c.toLowerCase());
}

function getMimeType(ext) {
  const map = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
  };
  return map[ext] || 'application/octet-stream';
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Step 1: Copy ────────────────────────────────────────────────────

function runCopy() {
  console.log('\n📂 Step 1: Copy assets from RPG-MODULAR → ObjectStore\n');

  let totalCopied = 0;
  let totalSkipped = 0;
  let totalNew = 0;

  for (const mapping of ASSET_MAPPINGS) {
    console.log(`\n  ── ${mapping.name.toUpperCase()} ──`);
    console.log(`  Source: ${mapping.src}`);
    console.log(`  Dest:   ${mapping.dest}`);

    if (!fs.existsSync(mapping.src)) {
      console.log(`  ⚠ Source not found, skipping`);
      continue;
    }

    const files = walk(mapping.src);
    console.log(`  Found: ${files.length} files`);

    for (const srcFile of files) {
      const relPath = toRelUnix(mapping.src, srcFile);
      const destFile = path.join(mapping.dest, relPath);

      // Check if file already exists and is same size
      if (fs.existsSync(destFile)) {
        const srcStat = fs.statSync(srcFile);
        const destStat = fs.statSync(destFile);
        if (srcStat.size === destStat.size) {
          totalSkipped++;
          continue;
        }
      }

      if (DRY_RUN) {
        console.log(`    [dry-run] ${relPath}`);
        totalNew++;
        continue;
      }

      ensureDir(path.dirname(destFile));
      fs.copyFileSync(srcFile, destFile);
      totalNew++;
      totalCopied++;
    }
  }

  console.log(`\n  ✓ Copy complete: ${totalCopied} copied, ${totalNew} new, ${totalSkipped} skipped (identical)`);
  return { copied: totalCopied, new: totalNew, skipped: totalSkipped };
}

// ── Step 2: Upload to R2 ───────────────────────────────────────────

async function uploadFile(filePath, r2Key, category, tags) {
  if (DRY_RUN) {
    const stat = fs.statSync(filePath);
    console.log(`    [dry-run] ${r2Key} (${Math.ceil(stat.size / 1024)}KB) → ${category}`);
    return { success: true, dry: true };
  }

  const body = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();

  try {
    const res = await fetch(`${API_URL}/v1/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': getMimeType(ext),
        'X-API-Key': API_KEY,
        'X-Filename': filename,
        'X-Category': category,
        'X-Tags': JSON.stringify(tags),
        'X-Metadata': JSON.stringify({
          source: 'rpg-modular-migration',
          r2Key,
          originalPath: path.relative(RPG_ROOT, filePath).split(path.sep).join('/'),
        }),
      },
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `${res.status}: ${err}` };
    }
    return { success: true, data: await res.json() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function runUpload() {
  console.log('\n☁️  Step 2: Upload assets to R2\n');
  console.log(`  API: ${API_URL}`);
  console.log(`  Concurrency: ${CONCURRENCY}`);

  if (!DRY_RUN && !API_KEY) {
    console.error('  ✗ ERROR: Set OBJECTSTORE_API_KEY env var (or use --dry-run)');
    process.exit(1);
  }

  let uploaded = 0;
  let errors = 0;
  let skipped = 0;

  for (const mapping of ASSET_MAPPINGS) {
    console.log(`\n  ── ${mapping.name.toUpperCase()} ──`);

    // Upload from the ObjectStore copy (dest), not RPG-MODULAR directly
    const files = walk(mapping.dest, IMAGE_EXTS);
    console.log(`  Files to upload: ${files.length}`);

    // Process in batches for concurrency
    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const batch = files.slice(i, i + CONCURRENCY);
      const promises = batch.map(async (filePath) => {
        const relPath = toRelUnix(mapping.dest, filePath);
        const { category, type } = mapping.classify(relPath);
        const ext = path.extname(filePath).slice(1).toLowerCase();
        const r2Key = `${mapping.name === 'effects' ? 'sprites/effects' : mapping.name}/${relPath}`;
        const tags = [ext, mapping.name, type].filter(Boolean);

        const result = await uploadFile(filePath, r2Key, category, tags);
        if (result.success) {
          uploaded++;
          if (!DRY_RUN && !result.dry) {
            process.stdout.write(`    ✓ ${relPath}\n`);
          }
        } else {
          errors++;
          console.log(`    ✗ ${relPath}: ${result.error}`);
        }
      });

      await Promise.all(promises);

      // Brief pause between batches to avoid rate limiting
      if (i + CONCURRENCY < files.length && !DRY_RUN) {
        await sleep(100);
      }
    }
  }

  console.log(`\n  ✓ Upload complete: ${uploaded} uploaded, ${errors} errors`);
  return { uploaded, errors, skipped };
}

// ── Step 3: Generate Registry JSON ──────────────────────────────────

function generateSpriteRegistry() {
  console.log('\n  Generating sprites2d.json...');

  const spritesDir = path.join(OBJSTORE_ROOT, 'sprites');
  const categories = {};

  // Walk top-level sprite directories
  if (!fs.existsSync(spritesDir)) return;

  for (const entry of fs.readdirSync(spritesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dirName = entry.name;
    const dirPath = path.join(spritesDir, dirName);

    // Determine category
    let catName;
    if (CATEGORY_SPRITE_DIRS.has(dirName)) {
      catName = dirName;
    } else if (dirName === 'characters') {
      catName = 'characters';
    } else {
      catName = 'characters'; // individual character dirs at top level
    }

    if (!categories[catName]) {
      categories[catName] = { count: 0, items: [] };
    }

    // Walk files in this directory recursively
    const files = walk(dirPath, IMAGE_EXTS);
    for (const file of files) {
      const relToSprites = toRelUnix(spritesDir, file);
      const relToDir = toRelUnix(dirPath, file);
      const filename = path.basename(file);
      const ext = path.extname(filename).slice(1);
      const name = path.basename(filename, path.extname(filename));

      // Determine subcategory from path
      const parts = relToDir.split('/');
      let subcategory;
      if (parts.length > 1) {
        subcategory = parts.slice(0, -1).join('/');
      } else {
        subcategory = dirName;
      }

      categories[catName].items.push({
        id: name.toLowerCase(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        path: `/sprites/${relToSprites}`,
        filename,
        category: catName,
        subcategory,
        source: 'rpg-modular',
        ext,
      });
      categories[catName].count++;
    }
  }

  // Count total
  let totalSprites = 0;
  for (const cat of Object.values(categories)) {
    totalSprites += cat.count;
  }

  const registry = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalSprites,
    categories,
  };

  const destPath = path.join(OBJSTORE_ROOT, 'api', 'v1', 'sprites2d.json');
  if (!DRY_RUN) {
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, JSON.stringify(registry, null, 2));
    console.log(`    ✓ sprites2d.json — ${totalSprites} sprites across ${Object.keys(categories).length} categories`);
  } else {
    console.log(`    [dry-run] sprites2d.json — ${totalSprites} sprites across ${Object.keys(categories).length} categories`);
  }
}

function generateBackgroundsRegistry() {
  console.log('\n  Generating backgrounds-registry.json...');

  const bgDir = path.join(OBJSTORE_ROOT, 'backgrounds');
  if (!fs.existsSync(bgDir)) return;

  const items = [];
  const categories = {};

  const files = walk(bgDir, IMAGE_EXTS);
  for (const file of files) {
    const relPath = toRelUnix(bgDir, file);
    const filename = path.basename(file);
    const ext = path.extname(filename).slice(1);
    const name = path.basename(filename, path.extname(filename));
    const stat = fs.statSync(file);

    // Classify by subfolder or naming pattern
    let type = 'scene';
    const lowerName = name.toLowerCase();
    if (relPath.toLowerCase().startsWith('battlebackgrounds/')) {
      type = 'battle';
    } else if (lowerName.includes('boss')) {
      type = 'boss';
    } else if (lowerName.includes('arena') || lowerName.includes('colosseum')) {
      type = 'arena';
    } else if (lowerName.includes('card_') || lowerName.includes('wc_')) {
      type = 'card';
    } else if (lowerName.includes('tab_')) {
      type = 'ui-tab';
    } else if (lowerName.includes('scene_')) {
      type = 'scene';
    } else if (lowerName.includes('ocean') || lowerName.includes('reef') || lowerName.includes('coral') || lowerName.includes('trench') || lowerName.includes('kelp')) {
      type = 'ocean';
    } else if (lowerName.includes('dungeon') || lowerName.includes('cave') || lowerName.includes('cavern')) {
      type = 'dungeon';
    } else if (lowerName.includes('castle') || lowerName.includes('throne') || lowerName.includes('prison')) {
      type = 'castle';
    } else if (lowerName.includes('lava') || lowerName.includes('volcanic') || lowerName.includes('infernal')) {
      type = 'volcanic';
    } else if (lowerName.includes('forest') || lowerName.includes('grove') || lowerName.includes('plains')) {
      type = 'nature';
    } else if (lowerName.includes('frozen') || lowerName.includes('ice') || lowerName.includes('winter')) {
      type = 'ice';
    } else if (lowerName.includes('shadow') || lowerName.includes('dark') || lowerName.includes('void') || lowerName.includes('cursed')) {
      type = 'dark';
    }

    if (!categories[type]) categories[type] = 0;
    categories[type]++;

    items.push({
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      path: `/backgrounds/${relPath}`,
      sourceUrl: `${BASE_URL}/backgrounds/${relPath}`,
      filename,
      ext,
      type,
      sizeKB: Math.ceil(stat.size / 1024),
    });
  }

  const registry = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalBackgrounds: items.length,
    categories,
    items,
  };

  const destPath = path.join(OBJSTORE_ROOT, 'api', 'v1', 'backgrounds-registry.json');
  if (!DRY_RUN) {
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, JSON.stringify(registry, null, 2));
    console.log(`    ✓ backgrounds-registry.json — ${items.length} backgrounds, ${Object.keys(categories).length} types`);
  } else {
    console.log(`    [dry-run] backgrounds-registry.json — ${items.length} backgrounds, ${Object.keys(categories).length} types`);
  }
}

function generateEffectsRegistry() {
  console.log('\n  Generating effects-registry.json...');

  const effectsDir = path.join(OBJSTORE_ROOT, 'sprites', 'effects');
  if (!fs.existsSync(effectsDir)) return;

  const effects = {};
  const subcategories = {};

  const files = walk(effectsDir, IMAGE_EXTS);
  for (const file of files) {
    const relPath = toRelUnix(effectsDir, file);
    const filename = path.basename(file);
    const ext = path.extname(filename).slice(1);
    const name = path.basename(filename, path.extname(filename));
    const stat = fs.statSync(file);

    // Determine subcategory from directory
    const parts = relPath.split('/');
    const subcat = parts.length > 1 ? parts[0] : 'uncategorized';
    if (!subcategories[subcat]) subcategories[subcat] = 0;
    subcategories[subcat]++;

    // Categorize by naming convention
    const lowerName = name.toLowerCase();
    const tags = [ext, subcat];
    if (lowerName.includes('fire') || lowerName.includes('flame')) tags.push('fire');
    if (lowerName.includes('ice') || lowerName.includes('frost') || lowerName.includes('frozen')) tags.push('ice');
    if (lowerName.includes('slash') || lowerName.includes('cut')) tags.push('melee');
    if (lowerName.includes('magic') || lowerName.includes('spell') || lowerName.includes('arcane')) tags.push('arcane');
    if (lowerName.includes('heal') || lowerName.includes('cure')) tags.push('heal');
    if (lowerName.includes('impact') || lowerName.includes('hit')) tags.push('impact');
    if (lowerName.includes('beam') || lowerName.includes('laser')) tags.push('beam');
    if (lowerName.includes('bullet')) tags.push('ranged');
    if (lowerName.includes('custom')) tags.push('custom');

    const effectKey = toCamelCase(name.replace(/[^a-zA-Z0-9]+/g, '-'));

    effects[effectKey] = {
      src: `/sprites/effects/${relPath}`,
      sourceUrl: `${BASE_URL}/sprites/effects/${relPath}`,
      filename,
      ext,
      subcategory: subcat,
      sizeKB: Math.ceil(stat.size / 1024),
      categories: [...new Set(tags)],
    };
  }

  const registry = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    description: 'Effect sprites for GRUDA-Wars — beams, impacts, slashes, pixel VFX, custom effects',
    sourceBase: BASE_URL,
    totalEffects: Object.keys(effects).length,
    subcategories,
    effects,
  };

  const destPath = path.join(OBJSTORE_ROOT, 'api', 'v1', 'effects-registry.json');
  if (!DRY_RUN) {
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, JSON.stringify(registry, null, 2));
    console.log(`    ✓ effects-registry.json — ${Object.keys(effects).length} effects, ${Object.keys(subcategories).length} subcategories`);
  } else {
    console.log(`    [dry-run] effects-registry.json — ${Object.keys(effects).length} effects, ${Object.keys(subcategories).length} subcategories`);
  }
}

function runRegistry() {
  console.log('\n📋 Step 3: Generate registry JSON files\n');
  generateSpriteRegistry();
  generateBackgroundsRegistry();
  generateEffectsRegistry();
  console.log('\n  ✓ All registries generated');
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('═'.repeat(60));
  console.log('  ObjectStore Asset Migration — RPG-MODULAR');
  console.log('═'.repeat(60));
  console.log(`  Step:     ${STEP}`);
  console.log(`  Dry run:  ${DRY_RUN}`);
  console.log(`  Source:   ${RPG_ROOT}`);
  console.log(`  Dest:     ${OBJSTORE_ROOT}`);
  console.log();

  // Validate source exists
  if (!fs.existsSync(RPG_ROOT)) {
    console.error(`ERROR: RPG-MODULAR source not found at ${RPG_ROOT}`);
    process.exit(1);
  }

  const results = {};

  if (STEP === 'copy' || STEP === 'all') {
    results.copy = runCopy();
  }

  if (STEP === 'upload' || STEP === 'all') {
    results.upload = await runUpload();
  }

  if (STEP === 'registry' || STEP === 'all') {
    runRegistry();
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  Migration complete!');
  if (DRY_RUN) console.log('  (Dry run — no files were modified)');
  console.log('═'.repeat(60));
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
