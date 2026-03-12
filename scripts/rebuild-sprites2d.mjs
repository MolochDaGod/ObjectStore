#!/usr/bin/env node
/**
 * rebuild-sprites2d.mjs — Full sprite pipeline rebuild
 *
 * Walks sprites/ tree, reads actual pixel dimensions via sharp,
 * auto-detects frame layout, generates deterministic UUIDs,
 * de-duplicates, and writes:
 *   - api/v1/sprites2d.json  (flat enriched registry)
 *   - api/v1/sprite-characters.json (grouped by character)
 *
 * Usage: node scripts/rebuild-sprites2d.mjs
 */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join, resolve, basename, extname, relative } from 'path';
import { createHash } from 'crypto';

const ROOT = resolve(import.meta.dirname, '..');
const SPRITES_DIR = join(ROOT, 'sprites');
const OUT_FLAT = join(ROOT, 'api', 'v1', 'sprites2d.json');
const OUT_CHARS = join(ROOT, 'api', 'v1', 'sprite-characters.json');
const OVERRIDES_PATH = join(ROOT, 'api', 'v1', 'sprite-overrides.json');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

// Category classification by top-level folder under sprites/
const CATEGORY_MAP = {
  characters: 'characters',
  enemies: 'enemies',
  bosses: 'bosses',
  monsters: 'monsters',
  npcs: 'npcs',
  fish: 'fish',
  effects: 'effects',
  projectiles: 'projectiles',
  ui: 'ui',
  companions: 'companions',
  buildings: 'buildings',
};

// Folders at sprites/ root that should be mapped to a category
const ROOT_FOLDER_CATEGORY = {
  'arcane-archer': 'characters', 'archer': 'characters', 'armored-axeman': 'characters',
  'barbarian-mage': 'characters', 'barbarian-ranger': 'characters', 'barbarian-warrior': 'characters',
  'black-priest': 'characters', 'crossbowman': 'characters', 'crystal-mauler': 'characters',
  'dark-knight': 'characters', 'demon-sword': 'characters', 'dwarf-ranger': 'characters',
  'elf-ranger': 'characters', 'Elf-mage': 'characters', 'elf_warrior': 'characters',
  'fantasy-warrior': 'characters', 'fire-knight': 'characters', 'fire-wizard': 'characters',
  'forest-guardian': 'characters', 'frost-guardian': 'characters', 'heroes': 'characters',
  'human-ranger': 'characters', 'knight': 'characters', 'knight-templar': 'characters',
  'lancer': 'characters', 'leaf-ranger': 'characters', 'loreon-knight': 'characters',
  'martial-hero': 'characters', 'medieval-warrior-3': 'characters', 'necromancer': 'characters',
  'nightborne': 'characters', 'orc': 'characters', 'orc-rider': 'characters',
  'priest': 'characters', 'shadow-warrior': 'characters', 'soldier': 'characters',
  'spirit_boxer': 'characters', 'swordsman': 'characters', 'water-priestess': 'characters',
  'werebear': 'characters', 'werewolf': 'characters', 'wind-hashashin': 'characters',
  'wizard': 'characters', 'wizard-pack': 'characters',
  // enemies
  'armored-orc': 'enemies', 'armored-skeleton': 'enemies', 'elite-orc': 'enemies',
  'evil-wizard': 'enemies', 'evil-wizard-2': 'enemies', 'greatsword-skeleton': 'enemies',
  'skeleton': 'enemies', 'skeleton-archer': 'enemies', 'skeleton-enemy': 'enemies',
  'slime': 'enemies', 'bandit-necro': 'enemies', 'demon-minion1': 'enemies',
  'demon-minion2': 'enemies', 'demon-summoner': 'enemies',
  // bosses
  'boss-demon': 'bosses', 'boss-demon-slime': 'bosses', 'cthulu-boss': 'bosses',
  'dragon-red': 'bosses', 'dragon-white': 'bosses', 'ogre-boss': 'bosses',
  'gorgon_siren_1': 'bosses', 'gorgon_siren_2': 'bosses', 'gorgon_siren_3': 'bosses',
  // monsters
  'baby_boxer': 'monsters', 'barrel_bomb': 'monsters', 'barrel_bomber': 'monsters',
  'barrel_trap': 'monsters', 'bot-wheel': 'monsters', 'mine-arachnid': 'monsters',
  'nature-elemental': 'monsters', 'water-elemental': 'monsters',
  'shield_droid': 'monsters', 'shock_sweeper': 'monsters', 'toaster_bot': 'monsters',
  'stone-guardian': 'monsters',
  // desert
  'desert-deceased': 'enemies', 'desert-hyena': 'enemies', 'desert-mummy': 'enemies',
  'desert-scorpio': 'enemies', 'desert-snake': 'enemies',
  // npcs
  'merchant': 'npcs',
  // fish
  'fish': 'fish',
};

// ─── UUID generation ───
function generateUUID(category, subcategory, filename) {
  const input = `${category}:${subcategory}:${filename}`;
  const hash = createHash('sha256').update(input).digest('hex');
  const prefix = 'SPRT';
  const h8 = hash.substring(0, 8).toUpperCase();
  const h6 = hash.substring(8, 14).toUpperCase();
  return `${prefix}-${h8}-${h6}`;
}

// ─── Read image dimensions using sharp (async) ───
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('⚠️  sharp not available — falling back to PNG header reading');
  sharp = null;
}

async function getImageDimensions(filePath) {
  if (sharp) {
    try {
      const meta = await sharp(filePath).metadata();
      return { width: meta.width, height: meta.height };
    } catch {
      // fallback
    }
  }
  // PNG header fallback: bytes 16-23 contain width/height as 4-byte big-endian
  try {
    const buf = readFileSync(filePath);
    if (buf[0] === 0x89 && buf[1] === 0x50) { // PNG signature
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return { width, height };
    }
  } catch { /* ignore */ }
  return { width: 0, height: 0 };
}

// ─── Frame layout detection ───
function detectFrameLayout(width, height) {
  if (width === 0 || height === 0) {
    return { frameCount: 1, frameW: width, frameH: height, layout: 'unknown', cols: 1, rows: 1 };
  }

  const ratio = width / height;

  // Single frame (roughly square)
  if (ratio >= 0.7 && ratio <= 1.4) {
    return { frameCount: 1, frameW: width, frameH: height, layout: 'single', cols: 1, rows: 1 };
  }

  // Horizontal strip
  if (ratio > 1.4) {
    // Try common frame counts, pick the one giving the most square-ish frames
    const candidates = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 24, 25, 27, 28, 29, 30];
    let best = null;

    for (const fc of candidates) {
      const fw = width / fc;
      if (Math.abs(fw - Math.round(fw)) > 0.5) continue; // must divide evenly (ish)
      const roundedFw = Math.round(fw);
      const frameRatio = roundedFw / height;
      if (frameRatio < 0.3 || frameRatio > 3.0) continue;
      const score = Math.abs(1 - frameRatio);
      if (!best || score < best.score) {
        best = { frameCount: fc, frameW: roundedFw, frameH: height, score, layout: 'horizontal', cols: fc, rows: 1 };
      }
    }

    // Also try width/height ratio as frame count
    const autoFc = Math.round(ratio);
    if (autoFc > 1 && autoFc <= 40) {
      const autoFw = Math.round(width / autoFc);
      const autoScore = Math.abs(1 - autoFw / height);
      if (!best || autoScore < best.score) {
        best = { frameCount: autoFc, frameW: autoFw, frameH: height, score: autoScore, layout: 'horizontal', cols: autoFc, rows: 1 };
      }
    }

    if (best) return best;
    return { frameCount: 1, frameW: width, frameH: height, layout: 'horizontal-guess', cols: 1, rows: 1 };
  }

  // Vertical strip
  if (ratio < 0.7) {
    const vfc = Math.max(1, Math.round(height / width));
    return { frameCount: vfc, frameW: width, frameH: Math.round(height / vfc), layout: 'vertical', cols: 1, rows: vfc };
  }

  return { frameCount: 1, frameW: width, frameH: height, layout: 'unknown', cols: 1, rows: 1 };
}

// ─── Load overrides ───
function loadOverrides() {
  try {
    if (existsSync(OVERRIDES_PATH)) {
      return JSON.parse(readFileSync(OVERRIDES_PATH, 'utf8'));
    }
  } catch { /* ignore */ }
  return {};
}

// ─── Walk sprite directories ───
function walkSprites(dir, depth = 0) {
  const results = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkSprites(full, depth + 1));
    } else if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

// ─── Classify a file path into category + subcategory ───
function classifyPath(filePath) {
  const rel = relative(SPRITES_DIR, filePath).replace(/\\/g, '/');
  const parts = rel.split('/');

  if (parts.length >= 3) {
    // e.g. characters/arcane-archer/attack1.png
    const topFolder = parts[0];
    const subFolder = parts[1];
    if (CATEGORY_MAP[topFolder]) {
      return { category: CATEGORY_MAP[topFolder], subcategory: subFolder };
    }
    // Unknown top folder, try to match subFolder
    return { category: topFolder, subcategory: subFolder };
  }

  if (parts.length === 2) {
    // e.g. arcane-archer/attack1.png  (top-level character folder)
    const folder = parts[0];
    if (ROOT_FOLDER_CATEGORY[folder]) {
      return { category: ROOT_FOLDER_CATEGORY[folder], subcategory: folder };
    }
    // Check if it's a known category folder with direct files
    if (CATEGORY_MAP[folder]) {
      return { category: CATEGORY_MAP[folder], subcategory: folder };
    }
    return { category: 'uncategorized', subcategory: folder };
  }

  // Root-level file
  return { category: 'uncategorized', subcategory: 'root' };
}

// ─── MAIN ───
async function main() {
  console.log('🔄 Scanning sprites directory...');
  const allFiles = walkSprites(SPRITES_DIR);
  console.log(`   Found ${allFiles.length} image files`);

  const overrides = loadOverrides();
  const seen = new Map(); // dedup key -> sprite data
  const dupes = [];
  let processed = 0;

  for (const filePath of allFiles) {
    const { category, subcategory } = classifyPath(filePath);
    const filename = basename(filePath);
    const id = basename(filename, extname(filename));
    const name = id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Canonical path relative to ObjectStore root
    const relFromRoot = relative(ROOT, filePath).replace(/\\/g, '/');
    const canonicalPath = '/' + relFromRoot;

    // Prefer categorized path (sprites/characters/X/) over flat path (sprites/X/)
    const dedupeKey = `${category}::${subcategory}::${filename.toLowerCase()}`;

    // Read dimensions
    const { width, height } = await getImageDimensions(filePath);
    const fileSize = statSync(filePath).size;

    // Detect frame layout
    let frameData = detectFrameLayout(width, height);

    // Apply overrides if any
    const uuid = generateUUID(category, subcategory, filename);
    if (overrides[uuid]) {
      const ov = overrides[uuid];
      if (ov.frameCount) frameData.frameCount = ov.frameCount;
      if (ov.frameW) frameData.frameW = ov.frameW;
      if (ov.frameH) frameData.frameH = ov.frameH;
      if (ov.layout) frameData.layout = ov.layout;
      if (ov.cols) frameData.cols = ov.cols;
      if (ov.rows) frameData.rows = ov.rows;
    }

    const sprite = {
      uuid,
      id,
      name,
      path: canonicalPath,
      filename,
      category,
      subcategory,
      source: 'rpg-modular',
      ext: extname(filename).slice(1),
      width,
      height,
      fileSize,
      frameCount: frameData.frameCount,
      frameW: frameData.frameW,
      frameH: frameData.frameH,
      layout: frameData.layout,
      cols: frameData.cols,
      rows: frameData.rows,
    };

    // Dedup: prefer the categorized path (longer path = more specific)
    if (seen.has(dedupeKey)) {
      const existing = seen.get(dedupeKey);
      // Keep the one under sprites/{category}/{subcategory}/ (the canonical path)
      if (canonicalPath.split('/').length > existing.path.split('/').length) {
        dupes.push({ kept: canonicalPath, dropped: existing.path });
        seen.set(dedupeKey, sprite);
      } else {
        dupes.push({ kept: existing.path, dropped: canonicalPath });
      }
    } else {
      seen.set(dedupeKey, sprite);
    }

    processed++;
    if (processed % 500 === 0) {
      console.log(`   Processed ${processed}/${allFiles.length}...`);
    }
  }

  const sprites = [...seen.values()];
  console.log(`\n📊 Results:`);
  console.log(`   Total files scanned: ${allFiles.length}`);
  console.log(`   Unique sprites: ${sprites.length}`);
  console.log(`   Duplicates removed: ${dupes.length}`);

  // ── Build categorized output ──
  const categories = {};
  for (const s of sprites) {
    if (!categories[s.category]) categories[s.category] = { count: 0, items: [] };
    categories[s.category].items.push(s);
    categories[s.category].count++;
  }

  // Sort items within each category
  for (const cat of Object.values(categories)) {
    cat.items.sort((a, b) => {
      const cmp = a.subcategory.localeCompare(b.subcategory);
      if (cmp !== 0) return cmp;
      return a.id.localeCompare(b.id);
    });
  }

  const registry = {
    version: '2.0.0',
    generated: new Date().toISOString(),
    totalSprites: sprites.length,
    categories,
  };

  writeFileSync(OUT_FLAT, JSON.stringify(registry, null, 2), 'utf8');
  console.log(`\n✅ Written ${OUT_FLAT}`);

  // ── Build character-grouped output ──
  const ANIM_CATS = new Set(['characters', 'enemies', 'monsters', 'bosses', 'effects', 'fish', 'npcs', 'companions', 'projectiles']);
  const charMap = {};

  for (const s of sprites) {
    if (!ANIM_CATS.has(s.category)) continue;
    const key = `${s.category}::${s.subcategory}`;
    if (!charMap[key]) {
      charMap[key] = {
        name: s.subcategory,
        category: s.category,
        source: s.source,
        animations: [],
      };
    }
    charMap[key].animations.push({
      uuid: s.uuid,
      id: s.id,
      name: s.name,
      path: s.path,
      filename: s.filename,
      width: s.width,
      height: s.height,
      frameCount: s.frameCount,
      frameW: s.frameW,
      frameH: s.frameH,
      layout: s.layout,
      cols: s.cols,
      rows: s.rows,
    });
  }

  // Sort animations (idle first, then alphabetical)
  const characters = Object.values(charMap);
  for (const ch of characters) {
    ch.animations.sort((a, b) => {
      if (a.id === 'idle' || a.id === 'Idle') return -1;
      if (b.id === 'idle' || b.id === 'Idle') return 1;
      return a.name.localeCompare(b.name);
    });
    // Add character-level UUID based on first animation
    ch.uuid = generateUUID(ch.category, ch.name, '__CHARACTER__');
    ch.animationCount = ch.animations.length;
  }
  characters.sort((a, b) => a.name.localeCompare(b.name));

  const charRegistry = {
    version: '2.0.0',
    generated: new Date().toISOString(),
    totalCharacters: characters.length,
    totalAnimations: characters.reduce((sum, c) => sum + c.animationCount, 0),
    characters,
  };

  writeFileSync(OUT_CHARS, JSON.stringify(charRegistry, null, 2), 'utf8');
  console.log(`✅ Written ${OUT_CHARS}`);

  // ── Print category summary ──
  console.log('\n📂 Categories:');
  for (const [cat, data] of Object.entries(categories).sort((a, b) => b[1].count - a[1].count)) {
    console.log(`   ${cat}: ${data.count} sprites`);
  }

  console.log(`\n👥 Animated characters: ${characters.length}`);

  // ── Report duplicates ──
  if (dupes.length > 0) {
    console.log(`\n⚠️  ${dupes.length} duplicate files detected (kept categorized path):`);
    for (const d of dupes.slice(0, 10)) {
      console.log(`   ✓ ${d.kept}`);
      console.log(`   ✗ ${d.dropped}`);
    }
    if (dupes.length > 10) console.log(`   ... and ${dupes.length - 10} more`);
  }

  // ── Report guessed layouts ──
  const guessed = sprites.filter(s => s.layout === 'horizontal-guess' || s.layout === 'unknown');
  if (guessed.length > 0) {
    console.log(`\n⚠️  ${guessed.length} sprites with uncertain frame detection:`);
    for (const g of guessed.slice(0, 10)) {
      console.log(`   ${g.path} (${g.width}x${g.height} → ${g.layout})`);
    }
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
