#!/usr/bin/env node
/**
 * grudgeDot Asset Manifest Builder
 * 
 * Reads all ObjectStore API JSONs + icon directories and produces
 * a unified `api/v1/grudgedot-assets.json` for grudgeDot to consume.
 * 
 * Usage: node scripts/build-grudgedot-manifest.mjs
 * Output: api/v1/grudgedot-assets.json
 */

import { readFile, readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { join, extname, relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const API_DIR = join(ROOT, 'api', 'v1');
const ICONS_DIR = join(ROOT, 'icons');
const OUTPUT = join(API_DIR, 'grudgedot-assets.json');
const BASE_URL = 'https://molochdagod.github.io/ObjectStore';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);
const AUDIO_EXTS = new Set(['.mp3', '.ogg', '.wav', '.flac', '.aac']);
const MODEL_EXTS = new Set(['.glb', '.gltf', '.fbx', '.obj']);

let idCounter = 0;
function nextId(prefix) {
  return `${prefix}-${String(++idCounter).padStart(6, '0')}`;
}

function cleanName(filename) {
  return basename(filename)
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePath(p) {
  return p.replace(/\\/g, '/').replace(/^\//, '');
}

async function loadJSON(filename) {
  try {
    const raw = await readFile(join(API_DIR, filename), 'utf8');
    return JSON.parse(raw);
  } catch {
    console.warn(`  ⚠ Could not load ${filename}`);
    return null;
  }
}

// ─── Icon Scanner ───────────────────────────────────────────
async function scanIcons() {
  const assets = [];
  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
        const rel = normalizePath(relative(ROOT, full));
        const parts = normalizePath(relative(ICONS_DIR, full)).split('/');
        const subdir = parts.length > 1 ? parts[0] : 'general';
        const subcat = parts.length > 2 ? parts.slice(0, -1).join('/') : subdir;
        let fileStat;
        try { fileStat = await stat(full); } catch { continue; }
        assets.push({
          id: nextId('icon'),
          name: cleanName(entry.name),
          type: 'icon',
          category: subdir,
          subcategory: subcat,
          url: `${BASE_URL}/${rel}`,
          previewUrl: `${BASE_URL}/${rel}`,
          tags: [subdir, ...parts.slice(0, -1)].filter(Boolean),
          format: extname(entry.name).slice(1).toLowerCase(),
          sizeBytes: fileStat.size,
        });
      }
    }
  }
  await walk(ICONS_DIR);
  return assets;
}

// ─── Sprites ────────────────────────────────────────────────
async function buildSprites() {
  const data = await loadJSON('sprites2d.json');
  if (!data?.categories) return [];
  const assets = [];
  for (const [catKey, cat] of Object.entries(data.categories)) {
    if (!cat.items) continue;
    for (const item of cat.items) {
      const path = normalizePath(item.path || '');
      assets.push({
        id: nextId('sprite'),
        name: item.name || cleanName(item.filename || ''),
        type: 'sprite',
        category: catKey,
        subcategory: item.subcategory || catKey,
        url: `${BASE_URL}/${path.replace(/^\//, '')}`,
        previewUrl: `${BASE_URL}/${path.replace(/^\//, '')}`,
        tags: [catKey, item.subcategory, item.source].filter(Boolean),
        format: item.ext || extname(path).slice(1) || 'png',
        sizeBytes: 0,
      });
    }
  }
  return assets;
}

// ─── Effect Sprites ─────────────────────────────────────────
async function buildEffects() {
  const data = await loadJSON('effectSprites.json');
  if (!data?.effects) return [];
  const assets = [];
  for (const [key, fx] of Object.entries(data.effects)) {
    const path = normalizePath(fx.src || '');
    assets.push({
      id: nextId('effect'),
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      type: 'sprite',
      category: 'effects',
      subcategory: (fx.categories || []).join('/') || 'general',
      url: `${BASE_URL}/${path.replace(/^\//, '')}`,
      previewUrl: `${BASE_URL}/${path.replace(/^\//, '')}`,
      tags: ['effect', 'vfx', ...(fx.categories || [])],
      format: extname(path).slice(1) || 'png',
      sizeBytes: 0,
      metadata: { frames: fx.frames, size: fx.size },
    });
  }
  return assets;
}

// ─── 3D Models ──────────────────────────────────────────────
async function buildModels() {
  const assets = [];

  // models3d.json
  const m3d = await loadJSON('models3d.json');
  if (m3d?.models) {
    for (const m of m3d.models) {
      assets.push({
        id: nextId('model'),
        name: cleanName(m.name),
        type: 'model',
        category: m.category || 'uncategorized',
        subcategory: m.format?.toLowerCase() || 'unknown',
        url: `${BASE_URL}/models3d/${normalizePath(m.path)}`,
        previewUrl: null,
        tags: ['3d', m.format?.toLowerCase(), m.category].filter(Boolean),
        format: m.format?.toLowerCase() || 'unknown',
        sizeBytes: (m.sizeKB || 0) * 1024,
      });
    }
  }

  // rtsModels.json
  const rts = await loadJSON('rtsModels.json');
  if (rts?.races) {
    for (const race of Object.values(rts.races)) {
      if (!race.models) continue;
      for (const m of race.models) {
        assets.push({
          id: m.grudgeId || nextId('rts-model'),
          name: m.displayName || cleanName(m.name),
          type: 'model',
          category: `rts/${race.id}`,
          subcategory: m.category || 'character',
          url: m.url || `${rts.baseUrl}/${m.file}`,
          previewUrl: null,
          tags: m.tags || ['rts', race.id, m.category].filter(Boolean),
          format: 'glb',
          sizeBytes: m.sizeBytes || 0,
          metadata: {
            race: race.id,
            faction: race.faction,
            unitType: m.unitType,
            hasAnimations: m.hasAnimations,
            customizable: m.customizable,
          },
        });
      }
    }
  }
  return assets;
}

// ─── Audio ──────────────────────────────────────────────────
async function buildAudio() {
  const data = await loadJSON('audio.json');
  if (!data?.audio) return [];
  const assets = [];
  for (const a of data.audio) {
    const path = normalizePath(a.path || '');
    assets.push({
      id: nextId('audio'),
      name: cleanName(a.name),
      type: 'audio',
      category: a.category || 'general',
      subcategory: a.format || 'unknown',
      url: `${BASE_URL}/${path.replace(/^\//, '')}`,
      previewUrl: null,
      tags: ['audio', a.category, a.format].filter(Boolean),
      format: a.format || 'unknown',
      sizeBytes: (a.sizeKB || 0) * 1024,
    });
  }
  return assets;
}

// ─── Video ──────────────────────────────────────────────────
async function buildVideo() {
  const data = await loadJSON('video.json');
  if (!data?.videos) return [];
  return data.videos.map(v => {
    const path = normalizePath(v.path || '');
    return {
      id: nextId('video'),
      name: cleanName(v.name),
      type: 'video',
      category: 'cinematic',
      subcategory: v.format || 'mp4',
      url: `${BASE_URL}/${path.replace(/^\//, '')}`,
      previewUrl: null,
      tags: ['video', 'cinematic'],
      format: v.format || 'mp4',
      sizeBytes: Math.round((v.sizeMB || 0) * 1024 * 1024),
    };
  });
}

// ─── Game Data (weapons, armor, materials, consumables, skills) ──
async function buildGameData() {
  const assets = [];

  // Weapons — extract sprite paths
  const weapons = await loadJSON('weapons.json');
  if (weapons?.categories) {
    for (const [catKey, cat] of Object.entries(weapons.categories)) {
      if (!cat.items) continue;
      for (const w of cat.items) {
        if (w.spritePath) {
          assets.push({
            id: nextId('weapon-icon'),
            name: w.name,
            type: 'icon',
            category: 'weapons',
            subcategory: catKey,
            url: `${BASE_URL}/${normalizePath(w.spritePath).replace(/^\//, '')}`,
            previewUrl: `${BASE_URL}/${normalizePath(w.spritePath).replace(/^\//, '')}`,
            tags: ['weapon', catKey, w.grudgeType || 'item'],
            format: extname(w.spritePath).slice(1) || 'png',
            sizeBytes: 0,
            metadata: { itemId: w.id, primaryStat: w.primaryStat },
          });
        }
      }
    }
  }

  // Armor — extract sprite paths
  const armor = await loadJSON('armor.json');
  if (armor?.materials) {
    for (const [matKey, mat] of Object.entries(armor.materials)) {
      if (!mat.items) continue;
      for (const a of mat.items) {
        if (a.spritePath) {
          assets.push({
            id: nextId('armor-icon'),
            name: a.name,
            type: 'icon',
            category: 'armor',
            subcategory: `${matKey}/${(a.type || '').toLowerCase()}`,
            url: `${BASE_URL}/${normalizePath(a.spritePath).replace(/^\//, '')}`,
            previewUrl: `${BASE_URL}/${normalizePath(a.spritePath).replace(/^\//, '')}`,
            tags: ['armor', matKey, (a.type || '').toLowerCase()],
            format: extname(a.spritePath).slice(1) || 'png',
            sizeBytes: 0,
            metadata: { itemId: a.id, material: a.material, type: a.type },
          });
        }
      }
    }
  }

  return assets;
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  console.log('🎮 grudgeDot Asset Manifest Builder');
  console.log(`📁 Root: ${ROOT}`);
  console.log('');

  const [icons, sprites, effects, models, audio, video, gameData] = await Promise.all([
    scanIcons().then(r => { console.log(`  ✅ Icons: ${r.length}`); return r; }),
    buildSprites().then(r => { console.log(`  ✅ Sprites: ${r.length}`); return r; }),
    buildEffects().then(r => { console.log(`  ✅ Effects: ${r.length}`); return r; }),
    buildModels().then(r => { console.log(`  ✅ Models: ${r.length}`); return r; }),
    buildAudio().then(r => { console.log(`  ✅ Audio: ${r.length}`); return r; }),
    buildVideo().then(r => { console.log(`  ✅ Video: ${r.length}`); return r; }),
    buildGameData().then(r => { console.log(`  ✅ Game Data: ${r.length}`); return r; }),
  ]);

  const allAssets = [...icons, ...sprites, ...effects, ...models, ...audio, ...video, ...gameData];

  // Deduplicate by URL
  const seen = new Set();
  const deduped = [];
  for (const a of allAssets) {
    if (!seen.has(a.url)) {
      seen.add(a.url);
      deduped.push(a);
    }
  }

  // Build category summary
  const categorySummary = {};
  for (const a of deduped) {
    const key = `${a.type}/${a.category}`;
    if (!categorySummary[key]) categorySummary[key] = { type: a.type, category: a.category, count: 0 };
    categorySummary[key].count++;
  }

  // Build type counts
  const typeCounts = {};
  for (const a of deduped) {
    typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
  }

  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalAssets: deduped.length,
    types: typeCounts,
    categories: Object.values(categorySummary).sort((a, b) => b.count - a.count),
    assets: deduped,
  };

  await mkdir(API_DIR, { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('');
  console.log(`📊 Total: ${deduped.length} unique assets (${allAssets.length - deduped.length} duplicates removed)`);
  console.log(`📂 Types: ${JSON.stringify(typeCounts)}`);
  console.log(`💾 Written to: ${relative(ROOT, OUTPUT)}`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
