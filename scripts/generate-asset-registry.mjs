#!/usr/bin/env node
/**
 * Grudge Studio Asset Registry Generator
 * 
 * Scans all icons/ subdirectories and assigns deterministic GRUDGE UUIDs
 * to every sprite asset for production use.
 * 
 * Usage: node scripts/generate-asset-registry.mjs
 * Output: api/v1/asset-registry.json
 */

import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { join, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const ICONS_DIR = join(ROOT, 'icons');
const OUTPUT_PATH = join(ROOT, 'api', 'v1', 'asset-registry.json');

// GRUDGE UUID prefix for sprites
const SPRITE_PREFIX = 'SPRT';

// Supported image extensions
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);

// MIME type lookup
const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

/**
 * Deterministic FNV-1a hash — same file path always produces the same hash.
 * Matches the hash function in sdk/grudge-sdk.js
 */
function fnv1aHash8(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash = hash >>> 0;
  const h2 = (hash ^ (hash >>> 16)) >>> 0;
  return h2.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

/**
 * Generate a deterministic GRUDGE UUID for a sprite asset.
 * Format: SPRT-{TIMESTAMP}-{SEQUENCE_HEX}-{HASH}
 * 
 * Uses path-based hashing so re-running always produces the same UUID
 * for the same file, making it safe for production.
 */
function generateSpriteUUID(relativePath, index) {
  const timestamp = '20260306000000'; // Fixed registry generation epoch
  const sequence = (index + 1).toString(16).toUpperCase().padStart(6, '0');
  const hash = fnv1aHash8(`${SPRITE_PREFIX}-${relativePath}-${sequence}`);
  return `${SPRITE_PREFIX}-${timestamp}-${sequence}-${hash}`;
}

/**
 * Recursively scan a directory for image files.
 */
async function scanDirectory(dir) {
  const results = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    // Sort for deterministic ordering
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext)) {
          const fileStat = await stat(fullPath);
          const relPath = relative(ROOT, fullPath).replace(/\\/g, '/');
          results.push({
            filename: entry.name,
            path: relPath,
            absolutePath: fullPath,
            size: fileStat.size,
            ext,
            mimeType: MIME_TYPES[ext] || 'application/octet-stream',
          });
        }
      }
    }
  }

  await walk(dir);
  return results;
}

/**
 * Derive the category from a file path.
 * e.g. "icons/weapons_full/Sword_01.png" → "weapons_full"
 *      "icons/wcs/misc/something.png" → "wcs/misc"
 */
function deriveCategory(relPath) {
  // Remove "icons/" prefix and filename
  const parts = relPath.replace(/^icons\//, '').split('/');
  parts.pop(); // remove filename
  return parts.join('/') || 'root';
}

/**
 * Derive a human-readable name from the filename.
 * e.g. "Sword_01.png" → "Sword 01"
 */
function deriveName(filename) {
  return filename
    .replace(/\.(png|jpg|jpeg|gif|svg|webp)$/i, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ');
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('🎨 Grudge Studio Asset Registry Generator');
  console.log(`📁 Scanning: ${ICONS_DIR}`);
  console.log('');

  // Scan all image files
  const files = await scanDirectory(ICONS_DIR);
  console.log(`📦 Found ${files.length} sprite assets`);

  // Build the registry
  const assets = {};
  const categories = {};
  const lookup = {};   // path → uuid
  const byName = {};   // lowercase name → uuid (for search)

  let index = 0;
  for (const file of files) {
    const uuid = generateSpriteUUID(file.path, index);
    const category = deriveCategory(file.path);
    const name = deriveName(file.filename);

    assets[uuid] = {
      uuid,
      filename: file.filename,
      name,
      path: file.path,
      category,
      size: file.size,
      type: file.mimeType,
      cdn: `https://molochdagod.github.io/ObjectStore/${file.path}`,
    };

    // Category index
    if (!categories[category]) {
      categories[category] = { count: 0, uuids: [] };
    }
    categories[category].count++;
    categories[category].uuids.push(uuid);

    // Path → UUID lookup
    lookup[file.path] = uuid;

    // Name → UUID lookup (for search)
    const lowerName = name.toLowerCase();
    if (!byName[lowerName]) byName[lowerName] = [];
    byName[lowerName].push(uuid);

    index++;
  }

  // Build the registry JSON
  const registry = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    generatorVersion: '1.0.0',
    baseUrl: 'https://molochdagod.github.io/ObjectStore',
    totalAssets: files.length,
    totalCategories: Object.keys(categories).length,
    uuidPrefix: SPRITE_PREFIX,
    uuidFormat: '{PREFIX}-{TIMESTAMP}-{SEQUENCE}-{HASH}',
    assets,
    categories,
    lookup,
  };

  // Ensure output directory exists
  await mkdir(join(ROOT, 'api', 'v1'), { recursive: true });

  // Write the registry
  await writeFile(OUTPUT_PATH, JSON.stringify(registry, null, 2), 'utf-8');

  // Print summary
  console.log('');
  console.log('✅ Asset Registry Generated');
  console.log(`   📄 Output: api/v1/asset-registry.json`);
  console.log(`   📦 Total assets: ${registry.totalAssets}`);
  console.log(`   📁 Categories: ${registry.totalCategories}`);
  console.log('');
  console.log('   Category breakdown:');
  for (const [cat, data] of Object.entries(categories).sort((a, b) => b[1].count - a[1].count)) {
    console.log(`     ${cat.padEnd(20)} ${data.count} sprites`);
  }
  console.log('');
  console.log(`   Example UUID: ${Object.keys(assets)[0]}`);
  console.log(`   Example asset: ${JSON.stringify(Object.values(assets)[0], null, 2)}`);
}

main().catch(err => {
  console.error('❌ Failed to generate asset registry:', err);
  process.exit(1);
});
