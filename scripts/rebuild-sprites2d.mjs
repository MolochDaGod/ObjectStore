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
const HERO_ALIASES_PATH = join(ROOT, 'api', 'v1', 'gdevelop-hero-aliases.json');

// ─── Source detection based on directory path ───
// Fish subdirectories with spritesheets from Grudge Angeler
const ANGELER_FISH = new Set([
  'abyssal-bass','anglerfish','bass','blue-crab','blue-ring-octopus','butterfly-fish',
  'catfish','celestial-whale','clownfish-salt-uncommon','crimson-crab','cyan-crab',
  'dark-crab','deep-sea-angler','eel','electric-eel','frost-catfish','giant-octopus',
  'giant-squid','gold-crab','golden-salmon','green-crab','hammerhead-shark','jellyfish',
  'kraken','lionfish','minnow','moray-eel','neon-eel','octopus','perch','phantom-minnow',
  'pink-crab','pink-jellyfish','pufferfish-salt-rare','purple-crab','purple-jellyfish',
  'red-crab','salmon','sea-devil','sea-urchin','seal-at-the-seam','shadow-crab',
  'shadow-leviathan','shark','stingray','storm-swordfish','swordfish','volcanic-perch','whale',
]);

function detectSource(category, subcategory, relPath) {
  // Fish species from Grudge Angeler
  if (category === 'fish' && ANGELER_FISH.has(subcategory)) return 'grudge-angeler';
  return 'rpg-modular';
}

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
  'dwarf-mage': 'characters', 'dwarf-worge': 'characters',
  'elf-ranger': 'characters', 'Elf-mage': 'characters', 'elf_warrior': 'characters',
  'fantasy-warrior': 'characters', 'fire-knight': 'characters', 'fire-wizard': 'characters',
  'forest-guardian': 'characters', 'free-knight': 'characters', 'frost-guardian': 'characters',
  'gunslinger': 'characters', 'heroes': 'characters',
  'human-mage': 'characters', 'human-ranger': 'characters',
  'knight': 'characters', 'knight-templar': 'characters',
  'lancer': 'characters', 'leaf-ranger': 'characters', 'lightning-mage': 'characters',
  'loreon-knight': 'characters',
  'martial-hero': 'characters', 'medieval-warrior-3': 'characters', 'necromancer': 'characters',
  'nightborne': 'characters', 'orc': 'characters', 'orc-rider': 'characters',
  'pirate': 'characters', 'pirate-captain': 'characters',
  'priest': 'characters', 'shadow-warrior': 'characters', 'soldier': 'characters',
  'spirit_boxer': 'characters', 'stormhead': 'characters', 'swordsman': 'characters',
  'water-priestess': 'characters', 'white-priest': 'characters',
  'werebear': 'characters', 'werewolf': 'characters', 'wind-hashashin': 'characters',
  'wizard': 'characters', 'wizard-new': 'characters', 'wizard-pack': 'characters',
  // enemies
  'armored-orc': 'enemies', 'armored-skeleton': 'enemies', 'elite-orc': 'enemies',
  'evil-wizard': 'enemies', 'evil-wizard-2': 'enemies', 'evil-wizard-3': 'enemies',
  'greatsword-skeleton': 'enemies',
  'knight-enemy': 'enemies',
  'skeleton': 'enemies', 'skeleton-archer': 'enemies', 'skeleton-enemy': 'enemies',
  'skeleton-spearman': 'enemies', 'skeleton-warrior': 'enemies',
  'slime': 'enemies', 'bandit-necro': 'enemies', 'demon-minion1': 'enemies',
  'demon-minion2': 'enemies', 'demon-summoner': 'enemies',
  'undead-ranger': 'enemies',
  // bosses
  'boss-demon': 'bosses', 'boss-demon-slime': 'bosses', 'cthulu-boss': 'bosses',
  'dragon-red': 'bosses', 'dragon-white': 'bosses', 'ogre-boss': 'bosses',
  'gorgon_siren_1': 'bosses', 'gorgon_siren_2': 'bosses', 'gorgon_siren_3': 'bosses',
  'shardsoul-slayer': 'bosses',
  // monsters
  'baby_boxer': 'monsters', 'barrel_bomb': 'monsters', 'barrel_bomber': 'monsters',
  'barrel_trap': 'monsters', 'bot-wheel': 'monsters',
  'mine-amphibian': 'monsters', 'mine-arachnid': 'monsters', 'mine-elemental': 'monsters',
  'nature-elemental': 'monsters', 'water-elemental': 'monsters',
  'shield_droid': 'monsters', 'shock-sweeper': 'monsters', 'shock_sweeper': 'monsters',
  'toaster_bot': 'monsters', 'stone-guardian': 'monsters',
  'training-dummy': 'monsters',
  // desert
  'desert-deceased': 'enemies', 'desert-hyena': 'enemies', 'desert-mummy': 'enemies',
  'desert-scorpio': 'enemies', 'desert-snake': 'enemies', 'desert-vulture': 'enemies',
  // npcs
  'merchant': 'npcs',
  // fish
  'fish': 'fish',
  // misc mapped
  'pixel-crawler': 'characters',
  'steampunk-airship': 'characters', 'steampunk-mech': 'characters',
  'lpc_entry': 'characters',
  'dampdungeons': 'effects', 'fireballs': 'effects',
  'GrudgeRPGAssets2d': 'characters',
  'rpg': 'characters',
  'miniworld': 'ui',
  'expansion_pack': 'characters',
  'portraits': 'ui',
  'arenas': 'ui',
  'totems': 'monsters',
  'destructibles': 'monsters',
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

  // ── Try grid layout first (multi-row, multi-column) ──
  // Common in larger sprite sheets where rows ≥ 2 and cols ≥ 2
  let bestGrid = null;
  for (let rows = 2; rows <= 20; rows++) {
    const fh = Math.floor(height / rows);
    if (fh < 4 || height % rows !== 0) continue;
    for (let cols = 2; cols <= 50; cols++) {
      const fw = Math.floor(width / cols);
      if (fw < 4 || width % cols !== 0) continue;
      const frameRatio = fw / fh;
      // Prefer square-ish frames
      if (frameRatio < 0.4 || frameRatio > 2.5) continue;
      const score = Math.abs(1 - frameRatio) + (rows * cols > 100 ? 0.5 : 0);
      if (!bestGrid || score < bestGrid.score) {
        bestGrid = { frameCount: rows * cols, frameW: fw, frameH: fh, score, layout: 'grid', cols, rows };
      }
    }
  }

  // Horizontal strip
  if (ratio > 1.4) {
    let best = null;

    for (let fc = 2; fc <= 50; fc++) {
      const fw = Math.floor(width / fc);
      if (fw < 1) continue;
      const frameRatio = fw / height;
      if (frameRatio < 0.3 || frameRatio > 3.0) continue;

      let score = Math.abs(1 - frameRatio);
      const exact = (width % fc === 0);
      if (exact) score -= 0.001;

      if (!best || score < best.score) {
        best = { frameCount: fc, frameW: fw, frameH: height, score, layout: 'horizontal', cols: fc, rows: 1 };
      }
    }

    // Also try using height as frameW directly (common in pixel art)
    if (width % height === 0) {
      const hfc = width / height;
      if (hfc >= 2 && hfc <= 50) {
        const hScore = -0.002; // perfect square frames = best
        if (!best || hScore < best.score) {
          best = { frameCount: hfc, frameW: height, frameH: height, score: hScore, layout: 'horizontal', cols: hfc, rows: 1 };
        }
      }
    }

    // Compare horizontal vs grid — prefer grid only if it produces more square frames
    if (best && bestGrid && bestGrid.score < best.score - 0.05) {
      return bestGrid;
    }

    if (best) return best;
    if (bestGrid) return bestGrid;

    const fallbackFc = Math.max(1, Math.floor(width / height));
    const fallbackFw = Math.floor(width / fallbackFc);
    return { frameCount: fallbackFc, frameW: fallbackFw, frameH: height, layout: 'horizontal', cols: fallbackFc, rows: 1 };
  }

  // Vertical strip
  if (ratio < 0.7) {
    // Check if grid layout is better than vertical strip
    if (bestGrid && bestGrid.score < 0.5) {
      return bestGrid;
    }
    const vfc = Math.max(1, Math.round(height / width));
    const fh = Math.floor(height / vfc);
    return { frameCount: vfc, frameW: width, frameH: fh, layout: 'vertical', cols: 1, rows: vfc };
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
    // Check if the top folder itself is a known root-level character folder with subfolders
    if (ROOT_FOLDER_CATEGORY[topFolder]) {
      return { category: ROOT_FOLDER_CATEGORY[topFolder], subcategory: topFolder };
    }
    // Unknown top folder, treat it as category with subfolder
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

    const source = detectSource(category, subcategory, relFromRoot);
    const sprite = {
      uuid,
      id,
      name,
      path: canonicalPath,
      filename,
      category,
      subcategory,
      source,
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

  // ── Inject GDevelop Assistant hero aliases ──
  try {
    if (existsSync(HERO_ALIASES_PATH)) {
      const aliases = JSON.parse(readFileSync(HERO_ALIASES_PATH, 'utf8'));
      let aliasCount = 0;
      for (const alias of aliases.heroes || []) {
        // Find the source character this alias points to
        const srcChar = characters.find(c => c.name === alias.mapsTo);
        if (!srcChar) {
          console.warn(`   ⚠️ Alias ${alias.name} → ${alias.mapsTo}: source not found, skipping`);
          continue;
        }
        // Create alias entry reusing same animations but with new identity
        const aliasChar = {
          name: alias.id,
          displayName: alias.name,
          category: alias.category || 'characters',
          source: 'gdevelop-assistant',
          aliasOf: alias.mapsTo,
          animations: srcChar.animations.map(a => ({ ...a })),
          uuid: generateUUID('gdevelop', alias.id, '__CHARACTER__'),
          animationCount: srcChar.animationCount,
          description: alias.description || '',
          heroClass: alias.heroClass || alias.name,
          factionId: alias.factionId || null,
        };
        characters.push(aliasChar);
        aliasCount++;
      }
      console.log(`   ✅ Injected ${aliasCount} GDevelop Assistant hero aliases`);
    }
  } catch (e) {
    console.warn('   ⚠️ Could not load hero aliases:', e.message);
  }

  characters.sort((a, b) => a.name.localeCompare(b.name));

  charRegistry.totalCharacters = characters.length;
  charRegistry.totalAnimations = characters.reduce((sum, c) => sum + c.animationCount, 0);
  charRegistry.characters = characters;

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
