#!/usr/bin/env node
/**
 * Unified WCS → ObjectStore Sync
 * Orchestrates all data exports from Warlord-Crafting-Suite into ObjectStore JSON files.
 *
 * Usage: node scripts/sync-all.js
 *    or: npm run sync
 *
 * Steps:
 *   1. Run convert-data.js  → weapons.json, spriteMaps.json
 *   2. Run export-armor.js  → armor.json
 *   3. Merge spritePaths from spriteMaps into armor.json
 *   4. Validate all output JSON files
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API = path.join(ROOT, 'api', 'v1');
const SCRIPTS = __dirname;

function run(label, script) {
  console.log(`\n── ${label} ──`);
  try {
    execSync(`node "${path.join(SCRIPTS, script)}"`, { cwd: ROOT, stdio: 'inherit' });
  } catch (err) {
    console.error(`✗ ${label} failed`);
    process.exit(1);
  }
}

function validate(file) {
  const p = path.join(API, file);
  if (!fs.existsSync(p)) {
    console.error(`  ✗ ${file} missing`);
    return false;
  }
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    const size = (fs.statSync(p).size / 1024).toFixed(1);
    const version = data.version || '?';
    const total = data.total || '?';
    console.log(`  ✓ ${file}  v${version}  ${total} items  ${size}KB`);
    return true;
  } catch {
    console.error(`  ✗ ${file} invalid JSON`);
    return false;
  }
}

function mergeArmorSprites() {
  const spriteMapPath = path.join(API, 'spriteMaps.json');
  const armorPath = path.join(API, 'armor.json');
  if (!fs.existsSync(spriteMapPath) || !fs.existsSync(armorPath)) return;

  const sprites = JSON.parse(fs.readFileSync(spriteMapPath, 'utf8'));
  const armor = JSON.parse(fs.readFileSync(armorPath, 'utf8'));

  let patched = 0;
  for (const mat of Object.values(armor.materials)) {
    for (const item of mat.items) {
      const entry = sprites.armor[item.id];
      if (entry && entry.path) {
        item.spritePath = entry.path;
        patched++;
      }
    }
  }

  if (patched > 0) {
    fs.writeFileSync(armorPath, JSON.stringify(armor, null, 2));
    console.log(`  → Patched ${patched} armor spritePaths from spriteMaps`);
  }
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════
console.log('╔══════════════════════════════════════╗');
console.log('║  ObjectStore Sync — WCS → JSON       ║');
console.log('╚══════════════════════════════════════╝');

// Step 1: Weapons + SpriteMaps
run('Weapons & SpriteMaps', 'convert-data.js');

// Step 2: Armor
run('Armor', 'export-armor.js');

// Step 3: Merge sprite paths into armor
console.log('\n── Merging Armor Sprites ──');
mergeArmorSprites();

// Step 4: Validate
console.log('\n── Validation ──');
const files = ['weapons.json', 'armor.json', 'spriteMaps.json', 'materials.json', 'consumables.json',
               'skills.json', 'professions.json', 'races.json', 'classes.json', 'factions.json',
               'attributes.json', 'bosses.json', 'enemies.json'];

let ok = 0, fail = 0;
for (const f of files) {
  if (fs.existsSync(path.join(API, f))) {
    validate(f) ? ok++ : fail++;
  }
}

// Check for obsolete equipment.json
if (fs.existsSync(path.join(API, 'equipment.json'))) {
  console.log('  ⚠ equipment.json still exists — it is deprecated, consider deleting it');
}

console.log(`\n✅ Sync complete: ${ok} valid, ${fail} failed`);
if (fail > 0) process.exit(1);
