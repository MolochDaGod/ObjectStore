#!/usr/bin/env node
/**
 * dedup-sprites.mjs — Deduplicate flat sprite folders
 * 
 * Finds sprites/X/ folders that also exist under sprites/{category}/X/,
 * merges any unique files into the categorized folder, then removes the flat duplicate.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPRITES = path.join(ROOT, 'sprites');
const CATEGORIES = ['characters', 'enemies', 'bosses', 'monsters', 'npcs', 'companions', 'fish'];
const SKIP = [...CATEGORIES, 'effects', 'ui', 'projectiles', 'buildings', 'evil-wizard-3'];

const dryRun = process.argv.includes('--dry-run');
if (dryRun) console.log('=== DRY RUN (no changes will be made) ===\n');

const dirs = fs.readdirSync(SPRITES, { withFileTypes: true })
  .filter(d => d.isDirectory() && !SKIP.includes(d.name));

let merged = 0, removed = 0, filesMoved = 0, skipped = 0;

for (const dir of dirs) {
  const flatPath = path.join(SPRITES, dir.name);
  let catName = '';
  
  for (const cat of CATEGORIES) {
    if (fs.existsSync(path.join(SPRITES, cat, dir.name))) {
      catName = cat;
      break;
    }
  }
  
  if (!catName) {
    skipped++;
    continue; // no categorized counterpart — leave alone
  }
  
  const catPath = path.join(SPRITES, catName, dir.name);
  const flatFiles = fs.readdirSync(flatPath);
  const catFiles = new Set(fs.readdirSync(catPath));
  
  // Move unique files to categorized folder
  for (const file of flatFiles) {
    if (!catFiles.has(file)) {
      const src = path.join(flatPath, file);
      const dst = path.join(catPath, file);
      console.log(`  MOVE: ${dir.name}/${file} -> ${catName}/${dir.name}/${file}`);
      if (!dryRun) fs.copyFileSync(src, dst);
      filesMoved++;
    }
  }
  
  // Remove flat folder
  console.log(`  REMOVE: sprites/${dir.name}/ (duplicate of sprites/${catName}/${dir.name}/)`);
  if (!dryRun) fs.rmSync(flatPath, { recursive: true, force: true });
  removed++;
}

console.log('\n=== Summary ===');
console.log(`Folders removed: ${removed}`);
console.log(`Files merged:    ${filesMoved}`);
console.log(`Folders skipped: ${skipped} (unique, no categorized counterpart)`);
if (dryRun) console.log('\nRe-run without --dry-run to apply changes.');
