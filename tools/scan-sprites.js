#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Config ───
const ROOT = path.resolve(__dirname, '..');
const SPRITES_DIR = path.join(ROOT, 'sprites');
const OUT_FILE = path.join(ROOT, 'api', 'v1', 'sprite-characters.json');
const OLD_FILE = OUT_FILE; // preserve UUIDs from existing

// Category detection from directory structure
const CATEGORY_DIRS = {
  characters: 'characters',
  enemies: 'enemies',
  bosses: 'bosses',
  monsters: 'monsters',
  npcs: 'npcs',
  companions: 'companions',
  fish: 'fish',
  effects: 'effects',
  projectiles: 'projectiles',
  ui: 'ui',
  inventory: 'inventory',
  totems: 'monsters',
  destructibles: 'monsters',
};

// Known animation name patterns
const ANIM_PATTERNS = [
  'idle', 'walk', 'run', 'attack1', 'attack2', 'attack3', 'death', 'hurt',
  'block', 'cast', 'jump', 'fall', 'roll', 'slide', 'special', 'take_hit',
  'takehit', 'hit', 'defend', 'projectile', 'spritesheet', 'air_atk',
  'j_down', 'j_up', 'jump_full', 'jump_down', 'jump_up', 'walk2',
  'slide_loop', 'move', 'spawn', 'skill', 'dash', 'parry', 'taunt',
];

// Category heuristics for flat directories
const ENEMY_NAMES = new Set([
  'armored-orc', 'armored-skeleton', 'bandit-necro', 'black-priest',
  'crossbowman', 'demon-minion1', 'demon-minion2', 'demon-summoner',
  'desert-deceased', 'desert-hyena', 'desert-mummy', 'desert-scorpio',
  'desert-snake', 'desert-vulture', 'dragon-red', 'dragon-white',
  'elite-orc', 'evil-wizard', 'evil-wizard-2', 'evil-wizard-3',
  'fire-wizard', 'greatsword-skeleton', 'knight-enemy', 'mine-amphibian',
  'mine-arachnid', 'mine-elemental', 'orc', 'orc-rider',
  'skeleton', 'skeleton-archer', 'skeleton-enemy', 'skeleton-spearman',
  'skeleton-warrior', 'slime', 'undead-ranger',
]);

const BOSS_NAMES = new Set([
  'boss-demon', 'cthulu-boss', 'ogre-boss', 'stormhead', 'dragon-red',
  'dragon-white',
]);

const MONSTER_NAMES = new Set([
  'nature-elemental', 'water-elemental', 'forest-guardian', 'frost-guardian',
]);

const NPC_NAMES = new Set([
  'merchant', 'training-dummy',
]);

// ─── UUID generation ───
function genUUID() {
  const hex = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `SPRT-${hex.slice(0, 8)}-${hex.slice(8, 14)}`;
}

// ─── Load existing JSON for UUID preservation ───
function loadExisting() {
  try {
    const data = JSON.parse(fs.readFileSync(OLD_FILE, 'utf8'));
    const map = {}; // path -> { charUUID, animUUID }
    (data.characters || []).forEach(c => {
      c.animations.forEach(a => {
        map[a.path] = { charUUID: c.uuid, animUUID: a.uuid, charName: c.name };
      });
      // Also map flat paths
      c.animations.forEach(a => {
        const flat = a.path.replace(/\/sprites\/(characters|enemies|bosses|monsters|npcs|companions|fish)\//, '/sprites/');
        if (flat !== a.path) map[flat] = { charUUID: c.uuid, animUUID: a.uuid, charName: c.name };
      });
    });
    // Also build a charName -> UUID map
    const charUUIDs = {};
    (data.characters || []).forEach(c => { charUUIDs[c.name] = c.uuid; });
    return { pathMap: map, charUUIDs };
  } catch (e) {
    return { pathMap: {}, charUUIDs: {} };
  }
}

// ─── Read PNG dimensions (direct header parse, no deps) ───
function getPngDimensions(filePath) {
  try {
    const buf = Buffer.alloc(32);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 32, 0);
    fs.closeSync(fd);
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
      console.warn(`  ⚠ Not a PNG: ${filePath}`);
      return null;
    }
    // IHDR chunk starts at byte 8, width at 16, height at 20 (big-endian uint32)
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height };
  } catch (e) {
    console.warn(`  ⚠ Cannot read: ${filePath} - ${e.message}`);
    return null;
  }
}

// ─── Detect frame layout from dimensions ───
function detectLayout(width, height, filename) {
  const name = filename.replace(/\.png$/i, '').toLowerCase();

  // Common frame sizes to test
  const commonSizes = [16, 24, 32, 48, 64, 80, 96, 100, 128, 150, 192, 256, 320, 512];

  // If perfectly square and small, likely single frame
  if (width === height && width <= 512) {
    return { frameW: width, frameH: height, frameCount: 1, cols: 1, rows: 1, layout: 'single' };
  }

  // Try to find a frame size that divides evenly
  let bestFit = null;

  for (const size of commonSizes) {
    if (width % size === 0 && height === size) {
      // Horizontal strip
      const cols = width / size;
      if (cols >= 1 && cols <= 64) {
        const score = cols >= 2 ? cols : 0;
        if (!bestFit || score > bestFit.score) {
          bestFit = { frameW: size, frameH: size, frameCount: cols, cols, rows: 1, layout: 'horizontal', score };
        }
      }
    }
    if (height % size === 0 && width === size) {
      // Vertical strip
      const rows = height / size;
      if (rows >= 2 && rows <= 64) {
        const score = rows;
        if (!bestFit || score > bestFit.score) {
          bestFit = { frameW: size, frameH: size, frameCount: rows, cols: 1, rows, layout: 'vertical', score };
        }
      }
    }
    // Grid layout
    if (width % size === 0 && height % size === 0) {
      const cols = width / size;
      const rows = height / size;
      if (cols >= 2 && rows >= 2 && cols <= 32 && rows <= 32) {
        const count = cols * rows;
        const score = count;
        if (!bestFit || score > bestFit.score) {
          bestFit = { frameW: size, frameH: size, frameCount: count, cols, rows, layout: 'grid', score };
        }
      }
    }
  }

  // Also try non-square frames: width divisible but height is the frame height
  if (!bestFit || bestFit.frameCount <= 1) {
    // Try treating full height as frame height, divide width
    for (const fw of commonSizes) {
      if (width % fw === 0) {
        const cols = width / fw;
        if (cols >= 2 && cols <= 64 && Math.abs(fw - height) / Math.max(fw, height) < 2) {
          const score = cols;
          if (!bestFit || score > bestFit.score) {
            bestFit = { frameW: fw, frameH: height, frameCount: cols, cols, rows: 1, layout: 'horizontal', score };
          }
        }
      }
    }
  }

  if (bestFit) {
    delete bestFit.score;
    return bestFit;
  }

  // Fallback: treat as single
  return { frameW: width, frameH: height, frameCount: 1, cols: 1, rows: 1, layout: 'single' };
}

// ─── Detect category for a flat directory ───
function detectCategory(dirName) {
  if (BOSS_NAMES.has(dirName)) return 'bosses';
  if (ENEMY_NAMES.has(dirName)) return 'enemies';
  if (MONSTER_NAMES.has(dirName)) return 'monsters';
  if (NPC_NAMES.has(dirName)) return 'npcs';
  // Check if name suggests VFX
  if (/effect|vfx|particle|beam|slash|impact|explosion|spell|magic/i.test(dirName)) return 'effects';
  if (/projectile|bullet|arrow|bolt/i.test(dirName)) return 'projectiles';
  if (/fish|bass|trout|salmon|catfish|angler/i.test(dirName)) return 'fish';
  if (/icon|button|bar|frame|panel/i.test(dirName)) return 'ui';
  // Default to characters
  return 'characters';
}

// ─── Clean animation name ───
function cleanAnimName(filename) {
  return filename
    .replace(/\.png$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function animId(filename) {
  return filename.replace(/\.png$/i, '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// ─── Detect frame sequence directories ───
function isFrameSequence(files) {
  // Check if files are numbered like frame_001.png, 001.png, etc.
  const numbered = files.filter(f => /(?:^|\D)(\d{1,4})\.png$/i.test(f));
  return numbered.length >= 3 && numbered.length === files.length;
}

// ─── Scan the sprites directory ───
function scan() {
  const existing = loadExisting();
  const characters = new Map(); // name -> character data
  const processed = new Set(); // track processed character names to avoid dupes

  console.log('🔍 Scanning sprites directory...\n');

  // Walk the sprites directory
  function processDirectory(dir, parentCategory) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const pngs = entries.filter(e => e.isFile() && e.name.endsWith('.png')).map(e => e.name);
    const subdirs = entries.filter(e => e.isDirectory());
    const relDir = path.relative(SPRITES_DIR, dir).replace(/\\/g, '/');
    const dirName = path.basename(dir);

    // Check if this is a known category directory
    if (CATEGORY_DIRS[dirName] && dir !== SPRITES_DIR) {
      // This is a category container (e.g., sprites/characters/, sprites/enemies/)
      for (const sub of subdirs) {
        processDirectory(path.join(dir, sub.name), CATEGORY_DIRS[dirName]);
      }
      // Also process any PNGs directly in category dir
      if (pngs.length > 0) {
        processAnimations(dir, pngs, dirName, parentCategory || CATEGORY_DIRS[dirName], relDir);
      }
      return;
    }

    // This is a sprite character/entity directory
    if (pngs.length > 0) {
      const category = parentCategory || detectCategory(dirName);

      // Check for frame sequences vs sprite sheets
      if (isFrameSequence(pngs)) {
        processFrameSequence(dir, pngs, dirName, category, relDir);
      } else {
        processAnimations(dir, pngs, dirName, category, relDir);
      }
    }

    // Recurse into ALL subdirectories (category dirs handled at top of processDirectory)
    for (const sub of subdirs) {
      processDirectory(path.join(dir, sub.name), parentCategory);
    }
  }

  function processAnimations(dir, pngs, charName, category, relDir) {
    // Skip if this is a duplicate (flat version of a nested path)
    const canonicalName = charName.toLowerCase();

    // Determine source from path
    const source = relDir.includes('rpg-modular') ? 'rpg-modular' :
                   relDir.includes('fish') || relDir.includes('angeler') ? 'grudge-angeler' :
                   'objectstore';

    // Build canonical path prefix
    const pathPrefix = `/sprites/${relDir}`;

    const animations = [];
    for (const png of pngs.sort()) {
      const filePath = path.join(dir, png);
      const dims = getPngDimensions(filePath);
      if (!dims) continue;

      const layout = detectLayout(dims.width, dims.height, png);
      const spritePath = `${pathPrefix}/${png}`;

      // Check for existing UUID
      const existingEntry = existing.pathMap[spritePath];

      animations.push({
        uuid: existingEntry ? existingEntry.animUUID : genUUID(),
        id: animId(png),
        name: cleanAnimName(png),
        path: spritePath,
        filename: png,
        width: dims.width,
        height: dims.height,
        frameCount: layout.frameCount,
        frameW: layout.frameW,
        frameH: layout.frameH,
        layout: layout.layout,
        cols: layout.cols,
        rows: layout.rows,
      });
    }

    if (animations.length === 0) return;

    // Dedupe: prefer nested path over flat
    const key = canonicalName;
    const existingChar = characters.get(key);
    if (existingChar) {
      // Merge animations that don't already exist
      const existingPaths = new Set(existingChar.animations.map(a => a.filename));
      for (const a of animations) {
        if (!existingPaths.has(a.filename)) {
          existingChar.animations.push(a);
          existingPaths.add(a.filename);
        }
      }
      existingChar.animationCount = existingChar.animations.length;
      return;
    }

    const charUUID = existing.charUUIDs[canonicalName] || genUUID();

    characters.set(key, {
      name: canonicalName,
      category,
      source,
      animations,
      uuid: charUUID,
      animationCount: animations.length,
    });
  }

  function processFrameSequence(dir, pngs, charName, category, relDir) {
    // Frame sequences: individual frame PNGs in one directory
    const sorted = pngs.sort();
    const source = relDir.includes('rpg-modular') ? 'rpg-modular' : 'objectstore';
    const pathPrefix = `/sprites/${relDir}`;

    // Read first frame to get dimensions
    const firstDims = getPngDimensions(path.join(dir, sorted[0]));
    if (!firstDims) return;

    const key = charName.toLowerCase();
    const charUUID = existing.charUUIDs[key] || genUUID();

    // Create a single "animation" entry that references the directory
    const animations = [{
      uuid: genUUID(),
      id: 'sequence',
      name: 'Frame Sequence',
      path: `${pathPrefix}/${sorted[0]}`, // reference first frame
      filename: sorted[0],
      width: firstDims.width * sorted.length,
      height: firstDims.height,
      frameCount: sorted.length,
      frameW: firstDims.width,
      frameH: firstDims.height,
      layout: 'frame-sequence',
      cols: sorted.length,
      rows: 1,
      frames: sorted.map(f => `${pathPrefix}/${f}`),
    }];

    characters.set(key, {
      name: key,
      category,
      source,
      animations,
      uuid: charUUID,
      animationCount: 1,
    });
  }

  // Start scanning
  processDirectory(SPRITES_DIR, null);

  // Build output
  const charArray = [...characters.values()].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  let totalAnims = 0;
  charArray.forEach(c => { totalAnims += c.animationCount; });

  // Stats
  const catCounts = {};
  charArray.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });

  const output = {
    version: '3.0.0',
    generated: new Date().toISOString(),
    totalCharacters: charArray.length,
    totalAnimations: totalAnims,
    categories: catCounts,
    characters: charArray,
  };

  // Write output
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));

  console.log('\n✅ Sprite scan complete!');
  console.log(`   Characters: ${charArray.length}`);
  console.log(`   Animations: ${totalAnims}`);
  console.log(`   Categories: ${JSON.stringify(catCounts)}`);
  console.log(`   Output: ${OUT_FILE}`);
}

scan();
