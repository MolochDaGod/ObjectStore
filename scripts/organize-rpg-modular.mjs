#!/usr/bin/env node
/**
 * Organize RPG-MODULAR sprites into ObjectStore directory structure
 * and generate api/v1/sprites2d.json registry.
 *
 * Usage: node scripts/organize-rpg-modular.mjs [RPG_MODULAR_PUBLIC_PATH]
 */

import { readdirSync, statSync, copyFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, basename, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const SRC = process.argv[2] || 'C:\\Users\\nugye\\Documents\\RPG-MODULAR-TEMP\\RPG-MODULAR\\public';

// Category classification for sprite folders
const CHARACTER_FOLDERS = new Set([
  'arcane-archer','archer','armored-axeman','barbarian-mage','barbarian-ranger',
  'barbarian-warrior','dark-knight','demon-sword','dwarf-ranger','elf-ranger',
  'fantasy-warrior','fire-knight','forest-guardian','frost-guardian','human-ranger',
  'knight','knight-templar','lancer','leaf-ranger','loreon-knight','martial-hero',
  'medieval-warrior-3','necromancer','nightborne','orc','orc-rider','priest',
  'shadow-warrior','soldier','swordsman','water-priestess','werebear','werewolf',
  'wind-hashashin','wizard','crystal-mauler','spirit_boxer','heroes'
]);

const ENEMY_FOLDERS = new Set([
  'armored-orc','armored-skeleton','elite-orc','evil-wizard','evil-wizard-2',
  'greatsword-skeleton','skeleton','skeleton-archer','skeleton-enemy','slime',
  'enemies'
]);

const BOSS_FOLDERS = new Set([
  'boss-demon','boss-demon-slime','bosses','cthulu-boss',
  'gorgon_siren_1','gorgon_siren_2','gorgon_siren_3'
]);

const MONSTER_FOLDERS = new Set([
  'monsters','predators','nature-elemental','water-elemental',
  'baby_boxer','barrel_bomb','barrel_bomber','barrel_trap',
  'shield_droid','shock_sweeper','toaster_bot'
]);

const NPC_FOLDERS = new Set(['npcs','merchant']);
const FISH_FOLDERS = new Set(['fish']);

const IMAGE_EXTENSIONS = new Set(['.png','.jpg','.jpeg','.gif','.webp','.svg']);

let registry = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  totalSprites: 0,
  categories: {}
};

let copyCount = 0;

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function isImage(file) {
  return IMAGE_EXTENSIONS.has(extname(file).toLowerCase());
}

function getFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getFiles(full));
    } else if (isImage(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function copyToCategory(srcFiles, destDir, category, subcategory, source) {
  ensureDir(destDir);
  const items = [];
  for (const file of srcFiles) {
    const name = basename(file);
    const dest = join(destDir, name);
    if (!existsSync(dest)) {
      copyFileSync(file, dest);
      copyCount++;
    }
    const relPath = '/' + relative(ROOT, dest).replace(/\\/g, '/');
    items.push({
      id: basename(name, extname(name)),
      name: basename(name, extname(name)).replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      path: relPath,
      filename: name,
      category,
      subcategory: subcategory || category,
      source: source || 'rpg-modular',
      ext: extname(name).slice(1)
    });
  }
  return items;
}

// ---- ORGANIZE SPRITES ----
function organizeSprites() {
  const spritesDir = join(SRC, 'sprites');
  if (!existsSync(spritesDir)) return;

  const folders = readdirSync(spritesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const folder of folders) {
    const srcPath = join(spritesDir, folder);
    const files = getFiles(srcPath);
    if (files.length === 0) continue;

    let destCategory, destSubDir;

    if (folder === 'effects') {
      destCategory = 'effects';
      destSubDir = join(ROOT, 'sprites', 'effects', 'rpg-modular');
    } else if (folder === 'ui') {
      destCategory = 'ui';
      destSubDir = join(ROOT, 'sprites', 'ui');
    } else if (folder === 'projectiles') {
      destCategory = 'projectiles';
      destSubDir = join(ROOT, 'sprites', 'projectiles');
    } else if (CHARACTER_FOLDERS.has(folder)) {
      destCategory = 'characters';
      destSubDir = join(ROOT, 'sprites', 'characters', folder);
    } else if (ENEMY_FOLDERS.has(folder)) {
      destCategory = 'enemies';
      destSubDir = join(ROOT, 'sprites', 'enemies', folder);
    } else if (BOSS_FOLDERS.has(folder)) {
      destCategory = 'bosses';
      destSubDir = join(ROOT, 'sprites', 'bosses', folder);
    } else if (MONSTER_FOLDERS.has(folder)) {
      destCategory = 'monsters';
      destSubDir = join(ROOT, 'sprites', 'monsters', folder);
    } else if (NPC_FOLDERS.has(folder)) {
      destCategory = 'npcs';
      destSubDir = join(ROOT, 'sprites', 'npcs', folder);
    } else if (FISH_FOLDERS.has(folder)) {
      destCategory = 'fish';
      destSubDir = join(ROOT, 'sprites', 'fish');
    } else {
      // Default: put in characters
      destCategory = 'characters';
      destSubDir = join(ROOT, 'sprites', 'characters', folder);
    }

    const items = copyToCategory(files, destSubDir, destCategory, folder, 'rpg-modular');
    if (!registry.categories[destCategory]) registry.categories[destCategory] = { count: 0, items: [] };
    registry.categories[destCategory].items.push(...items);
    registry.categories[destCategory].count += items.length;
  }
}

// ---- ORGANIZE BACKGROUNDS ----
function organizeBackgrounds() {
  const bgDir = join(SRC, 'backgrounds');
  const files = getFiles(bgDir);
  const destDir = join(ROOT, 'backgrounds');
  const items = copyToCategory(files, destDir, 'backgrounds', 'backgrounds', 'rpg-modular');
  registry.categories['backgrounds'] = { count: items.length, items };
}

// ---- ORGANIZE EFFECTS ----
function organizeEffects() {
  const effectsDir = join(SRC, 'effects');
  const subfolders = ['beams','custom','pixel','slash'];

  for (const sub of subfolders) {
    const srcPath = join(effectsDir, sub);
    if (!existsSync(srcPath)) continue;
    const files = getFiles(srcPath);
    const destDir = join(ROOT, 'sprites', 'effects', sub);
    const items = copyToCategory(files, destDir, 'effects', sub, 'rpg-modular');
    if (!registry.categories['effects']) registry.categories['effects'] = { count: 0, items: [] };
    registry.categories['effects'].items.push(...items);
    registry.categories['effects'].count += items.length;
  }

  // Root-level effect files
  const rootEffects = readdirSync(effectsDir, { withFileTypes: true })
    .filter(e => !e.isDirectory() && isImage(e.name))
    .map(e => join(effectsDir, e.name));
  if (rootEffects.length) {
    const destDir = join(ROOT, 'sprites', 'effects', 'general');
    const items = copyToCategory(rootEffects, destDir, 'effects', 'general', 'rpg-modular');
    if (!registry.categories['effects']) registry.categories['effects'] = { count: 0, items: [] };
    registry.categories['effects'].items.push(...items);
    registry.categories['effects'].count += items.length;
  }
}

// ---- ORGANIZE ICONS ----
function organizeIcons() {
  const iconsDir = join(SRC, 'icons');

  // Ability icons (root level ability_*.png)
  const abilityFiles = readdirSync(iconsDir, { withFileTypes: true })
    .filter(e => !e.isDirectory() && e.name.startsWith('ability_') && isImage(e.name))
    .map(e => join(iconsDir, e.name));
  if (abilityFiles.length) {
    const items = copyToCategory(abilityFiles, join(ROOT, 'icons', 'abilities'), 'icons', 'abilities', 'rpg-modular');
    if (!registry.categories['icons']) registry.categories['icons'] = { count: 0, items: [] };
    registry.categories['icons'].items.push(...items);
    registry.categories['icons'].count += items.length;
  }

  // Ocean icons (icon_*.png)
  const oceanFiles = readdirSync(iconsDir, { withFileTypes: true })
    .filter(e => !e.isDirectory() && e.name.startsWith('icon_') && isImage(e.name))
    .map(e => join(iconsDir, e.name));
  if (oceanFiles.length) {
    const items = copyToCategory(oceanFiles, join(ROOT, 'icons', 'ocean'), 'icons', 'ocean', 'rpg-modular');
    registry.categories['icons'].items.push(...items);
    registry.categories['icons'].count += items.length;
  }

  // Fireball / water arrow frames
  const frameFiles = readdirSync(iconsDir, { withFileTypes: true })
    .filter(e => !e.isDirectory() && (e.name.startsWith('fireball_frame') || e.name.startsWith('water_arrow_frame')) && isImage(e.name))
    .map(e => join(iconsDir, e.name));
  if (frameFiles.length) {
    const items = copyToCategory(frameFiles, join(ROOT, 'icons', 'projectile_frames'), 'icons', 'projectile_frames', 'rpg-modular');
    registry.categories['icons'].items.push(...items);
    registry.categories['icons'].count += items.length;
  }

  // Skills subfolder
  const skillsDir = join(iconsDir, 'skills');
  if (existsSync(skillsDir)) {
    const files = getFiles(skillsDir);
    const items = copyToCategory(files, join(ROOT, 'icons', 'skills_rpg'), 'icons', 'skills_rpg', 'rpg-modular');
    registry.categories['icons'].items.push(...items);
    registry.categories['icons'].count += items.length;
  }

  // Spells subfolder
  const spellsDir = join(iconsDir, 'spells');
  if (existsSync(spellsDir)) {
    const files = getFiles(spellsDir);
    const items = copyToCategory(files, join(ROOT, 'icons', 'spells'), 'icons', 'spells', 'rpg-modular');
    registry.categories['icons'].items.push(...items);
    registry.categories['icons'].count += items.length;
  }
}

// ---- ORGANIZE IMAGES ----
function organizeImages() {
  const imagesDir = join(SRC, 'images');
  const subfolders = ['bosses','buildings','cards','enemies','races','attributes','ui','effects','icons'];

  for (const sub of subfolders) {
    const srcPath = join(imagesDir, sub);
    if (!existsSync(srcPath)) continue;
    const files = getFiles(srcPath);
    const destDir = join(ROOT, 'images', sub);
    const cat = 'images';
    const items = copyToCategory(files, destDir, cat, sub, 'rpg-modular');
    if (!registry.categories[cat]) registry.categories[cat] = { count: 0, items: [] };
    registry.categories[cat].items.push(...items);
    registry.categories[cat].count += items.length;
  }

  // Root-level images (logos, etc.)
  const rootImages = readdirSync(imagesDir, { withFileTypes: true })
    .filter(e => !e.isDirectory() && isImage(e.name))
    .map(e => join(imagesDir, e.name));
  if (rootImages.length) {
    const destDir = join(ROOT, 'images', 'misc');
    const items = copyToCategory(rootImages, destDir, 'images', 'misc', 'rpg-modular');
    if (!registry.categories['images']) registry.categories['images'] = { count: 0, items: [] };
    registry.categories['images'].items.push(...items);
    registry.categories['images'].count += items.length;
  }
}

// ---- ORGANIZE MAP NODES ----
function organizeMapNodes() {
  const mapDir = join(SRC, 'map_nodes');
  if (!existsSync(mapDir)) return;
  const files = getFiles(mapDir);
  const destDir = join(ROOT, 'map_nodes');
  const items = copyToCategory(files, destDir, 'map_nodes', 'map_nodes', 'rpg-modular');
  registry.categories['map_nodes'] = { count: items.length, items };
}

// ---- ORGANIZE ATTACHED ASSETS ----
function organizeAttachedAssets() {
  const assetsDir = join(SRC, 'attached_assets');
  if (!existsSync(assetsDir)) return;
  const files = getFiles(assetsDir);
  const destDir = join(ROOT, 'images', 'races');
  const items = copyToCategory(files, destDir, 'images', 'race_icons', 'rpg-modular');
  if (!registry.categories['images']) registry.categories['images'] = { count: 0, items: [] };
  registry.categories['images'].items.push(...items);
  registry.categories['images'].count += items.length;
}

// ---- INCLUDE EXISTING OBJECTSTORE ICONS ----
function indexExistingIcons() {
  const iconsDir = join(ROOT, 'icons');
  const folders = readdirSync(iconsDir, { withFileTypes: true }).filter(d => d.isDirectory());

  for (const folder of folders) {
    // Skip folders we just created
    if (['abilities','ocean','projectile_frames','skills_rpg','spells'].includes(folder.name)) continue;
    const files = getFiles(join(iconsDir, folder.name));
    const items = files.map(f => {
      const name = basename(f, extname(f));
      return {
        id: name,
        name: name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        path: '/' + relative(ROOT, f).replace(/\\/g, '/'),
        filename: basename(f),
        category: 'icons',
        subcategory: folder.name,
        source: 'objectstore',
        ext: extname(f).slice(1)
      };
    });
    if (!registry.categories['icons']) registry.categories['icons'] = { count: 0, items: [] };
    registry.categories['icons'].items.push(...items);
    registry.categories['icons'].count += items.length;
  }
}

// ---- MAIN ----
console.log(`📂 Source: ${SRC}`);
console.log(`📂 Dest:   ${ROOT}`);
console.log('');

console.log('🔄 Organizing sprites...');
organizeSprites();

console.log('🔄 Organizing backgrounds...');
organizeBackgrounds();

console.log('🔄 Organizing effects...');
organizeEffects();

console.log('🔄 Organizing icons...');
organizeIcons();

console.log('🔄 Organizing images...');
organizeImages();

console.log('🔄 Organizing map nodes...');
organizeMapNodes();

console.log('🔄 Organizing attached assets...');
organizeAttachedAssets();

console.log('🔄 Indexing existing ObjectStore icons...');
indexExistingIcons();

// Compute totals
registry.totalSprites = Object.values(registry.categories).reduce((sum, cat) => sum + cat.count, 0);

// Write registry
const registryPath = join(ROOT, 'api', 'v1', 'sprites2d.json');
ensureDir(dirname(registryPath));
writeFileSync(registryPath, JSON.stringify(registry, null, 2));

console.log('');
console.log(`✅ Copied ${copyCount} new files`);
console.log(`✅ Registry: ${registry.totalSprites} total sprites across ${Object.keys(registry.categories).length} categories`);
console.log(`✅ Written to ${registryPath}`);

for (const [cat, data] of Object.entries(registry.categories)) {
  console.log(`   ${cat}: ${data.count}`);
}
