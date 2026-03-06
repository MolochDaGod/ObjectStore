#!/usr/bin/env node
/**
 * Rebuild sprites.json — scans all icon directories and produces
 * the canonical sprite manifest at api/v1/sprites.json.
 *
 * Usage: node scripts/rebuild-sprites.mjs
 */
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const ICONS = join(ROOT, 'icons');
const OUT = join(ROOT, 'api', 'v1', 'sprites.json');

// Category name → subfolder under icons/
const CATEGORIES = {
  armor_full:   'armor_full',
  weapons_full: 'weapons_full',
  '496_rpg_icons': '496_rpg_icons',
  skills:       'skills',
  skill_nobg:   'skill_nobg',
  professions:  'professions',
  materials:    'materials',
  armor:        'armor',
  weapons:      'weapons',
  consumables:  'consumables',
  loot:         'loot',
  rpg_splash:   'rpg_splash',
  'wcs/weapons': join('wcs', 'weapons'),
  'wcs/misc':    join('wcs', 'misc'),
};

function scanDir(dir) {
  try {
    return readdirSync(dir)
      .filter(f => /\.(png|jpg|svg|gif|webp)$/i.test(f))
      .sort()
      .map(f => {
        const fullPath = join(dir, f);
        const size = statSync(fullPath).size;
        // Path relative to ObjectStore root for the API
        const relPath = fullPath.replace(ROOT + '\\', '').replace(ROOT + '/', '').replace(/\\/g, '/');
        return { path: relPath, filename: f, size };
      });
  } catch {
    return [];
  }
}

const categories = {};

for (const [catName, subdir] of Object.entries(CATEGORIES)) {
  const dir = join(ICONS, subdir);
  const sprites = scanDir(dir);
  if (sprites.length > 0) {
    categories[catName] = { count: sprites.length, sprites };
  }
}

const manifest = { categories };

writeFileSync(OUT, JSON.stringify(manifest, null, 2), 'utf8');

// Summary
let totalSprites = 0;
const lines = [];
for (const [cat, data] of Object.entries(categories)) {
  lines.push(`  ${cat}: ${data.count} sprites`);
  totalSprites += data.count;
}
console.log(`✅ sprites.json rebuilt — ${Object.keys(categories).length} categories, ${totalSprites} total sprites`);
console.log(lines.join('\n'));
