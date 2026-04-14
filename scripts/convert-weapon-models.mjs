#!/usr/bin/env node
/**
 * Batch Weapon FBX → GLB Conversion + R2 Upload
 *
 * Scans local weapon model directories, converts FBX to GLB using the
 * Grudge ObjectStore conversion pipeline, and uploads to R2.
 *
 * Sources:
 *   - D:\Games\Models\grudgeracecharacters\animationsweapons\fantasy_weapons\  (58 static meshes)
 *   - D:\Games\Models\grudgeracecharacters\animationsweapons\medieval_collection\ (19 variants)
 *   - D:\Games\Models\grudgeracecharacters\animationsweapons\pixel_guns_unzipped\ (6 guns)
 *   - D:\Games\Models\Dungeon-Crawler-Quest\...\weapons\ (13 GLB ready)
 *
 * Output: models/weapons/{type}/{name}.glb on R2
 *
 * Prerequisites:
 *   npm install @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions fbx2gltf
 *   — OR use the Cloudflare Worker pipeline at objectstore.grudge-studio.com/v1/convert
 *
 * Usage:
 *   node scripts/convert-weapon-models.mjs [--dry-run] [--local] [--upload]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OBJECTSTORE_WORKER = process.env.OBJECTSTORE_URL || 'https://objectstore.grudge-studio.com';
const API_KEY = process.env.GRUDGE_API_KEY || '';
const DRY_RUN = process.argv.includes('--dry-run');
const LOCAL_ONLY = process.argv.includes('--local');
const UPLOAD = process.argv.includes('--upload');

// ── Weapon type classification ──────────────────────────────────────────────

const WEAPON_TYPE_MAP = {
  // fantasy_weapons
  'Sword.fbx': 'sword', 'Sword_B.fbx': 'sword', 'BroadSword.fbx': 'sword', 'BroadSword_B.fbx': 'sword',
  'BroadSword_Stylized.fbx': 'sword', 'ShortSword.fbx': 'sword',
  'TwoHandedSword.fbx': 'greatsword', 'TwoHandedSword_B.fbx': 'greatsword',
  'TwoHandedSword_Stylized.fbx': 'greatsword', 'TwoHandedSword_B_Stylized.fbx': 'greatsword',
  'Axe.fbx': 'axe', 'HandAxe.fbx': 'axe', 'SmallAxe.fbx': 'axe', 'DoubleAxe.fbx': 'axe',
  'Dagger.fbx': 'dagger', 'Dagger_B.fbx': 'dagger', 'Dagger_C.fbx': 'dagger', 'Dagger_D.fbx': 'dagger',
  'Hammer.fbx': 'hammer', 'BigHammer.fbx': 'hammer', 'SmallHammer.fbx': 'hammer',
  'Mace.fbx': 'mace', 'MorningStar.fbx': 'mace', 'Club.fbx': 'mace', 'Club_B.fbx': 'mace', 'Club_C.fbx': 'mace',
  'Shield.fbx': 'shield', 'Shield.Buckler.fbx': 'shield', 'LongShield.fbx': 'shield',
  'WoodenShield.fbx': 'shield', 'WoodenShield_B.fbx': 'shield',
  'Staff.fbx': 'staff', 'Staff_B.fbx': 'staff', 'Staff_C.fbx': 'staff', 'BattleStaff.fbx': 'staff',
  'Wand.fbx': 'wand', 'Wand_B.fbx': 'wand',
  'Sythe.fbx': 'scythe', 'Sythe_B.fbx': 'scythe', 'Sythe_C.fbx': 'scythe',
  'SmallSythe.fbx': 'scythe', 'SmallSythe_B.fbx': 'scythe',
  'Javelin.fbx': 'spear', 'Pike.fbx': 'spear', 'Trident.fbx': 'spear',
  'PoleArm.fbx': 'spear', 'PoleArm_B.fbx': 'spear', 'PoleArm_C.fbx': 'spear',
  'Orb.fbx': 'offhand_relic', 'Orb_B.fbx': 'offhand_relic',
  'ButcherCleaver.fbx': 'axe', 'ButcherCleaver_B.fbx': 'axe',
  'LongCleaver.fbx': 'axe', 'SmallCleaver.fbx': 'axe', 'SmallButcherCleaver.fbx': 'axe',
  'Machete.fbx': 'sword', 'SmallMachete.fbx': 'sword', 'SmallSickle.fbx': 'dagger',

  // medieval_collection
  'Greataxe.fbx': 'greataxe', 'Greatsword.fbx': 'greatsword',
  'CurvedSword.fbx': 'sword', 'Katana.fbx': 'sword', 'Kukri.fbx': 'dagger',
  'Rapier.fbx': 'sword', 'NewSword.fbx': 'sword', 'OldSword.fbx': 'sword', 'Sword2.fbx': 'sword',
  'Flail.fbx': 'mace', 'Halberd.fbx': 'spear', 'Warhammer.fbx': 'hammer',
  'Scyth.fbx': 'scythe', 'Spear.fbx': 'spear', 'Spear2.fbx': 'spear',
  'Bow.fbx': 'bow',

  // pixel_guns
  'AR.fbx': 'gun', 'MG.fbx': 'gun', 'PISTOL.fbx': 'gun',
  'SMG1.fbx': 'gun', 'SMG2.fbx': 'gun', 'SNIPER.fbx': 'gun',
};

// Classify FBX files by name pattern if not in explicit map
function classifyWeapon(filename) {
  if (WEAPON_TYPE_MAP[filename]) return WEAPON_TYPE_MAP[filename];
  const lower = filename.toLowerCase();
  if (lower.includes('sword') || lower.includes('blade')) return 'sword';
  if (lower.includes('axe') || lower.includes('cleaver')) return 'axe';
  if (lower.includes('bow') && !lower.includes('crossbow') && !lower.includes('elbow')) return 'bow';
  if (lower.includes('crossbow') || lower.includes('xbow')) return 'crossbow';
  if (lower.includes('gun') || lower.includes('rifle') || lower.includes('pistol') || lower.includes('smg') || lower.includes('sniper')) return 'gun';
  if (lower.includes('dagger') || lower.includes('knife') || lower.includes('shiv')) return 'dagger';
  if (lower.includes('staff') || lower.includes('cane') || lower.includes('rod')) return 'staff';
  if (lower.includes('hammer') || lower.includes('maul')) return 'hammer';
  if (lower.includes('mace') || lower.includes('flail') || lower.includes('morning') || lower.includes('club')) return 'mace';
  if (lower.includes('shield') || lower.includes('buckler')) return 'shield';
  if (lower.includes('spear') || lower.includes('pike') || lower.includes('lance') || lower.includes('javelin') || lower.includes('trident') || lower.includes('halberd') || lower.includes('polearm')) return 'spear';
  if (lower.includes('wand') || lower.includes('summoner')) return 'wand';
  if (lower.includes('scythe') || lower.includes('sythe') || lower.includes('sickle')) return 'scythe';
  if (lower.includes('book') || lower.includes('tome') || lower.includes('spell')) return 'tome';
  if (lower.includes('orb') || lower.includes('relic') || lower.includes('trinket')) return 'offhand_relic';
  if (lower.includes('greatsword') || lower.includes('twohanded')) return 'greatsword';
  if (lower.includes('greataxe')) return 'greataxe';
  return null;
}

// ── Source directories ──────────────────────────────────────────────────────

const SCAN_DIRS = [
  { dir: 'D:\\Games\\Models\\grudgeracecharacters\\animationsweapons\\fantasy_weapons', label: 'Fantasy Weapons' },
  { dir: 'D:\\Games\\Models\\grudgeracecharacters\\animationsweapons\\medieval_collection\\FBX', label: 'Medieval Collection' },
  { dir: 'D:\\Games\\Models\\grudgeracecharacters\\animationsweapons\\pixel_guns_unzipped', label: 'Pixel Guns', recurse: true },
  { dir: 'D:\\Games\\Models\\Dungeon-Crawler-Quest\\Dungeon-Crawler-Quest\\public\\assets\\models\\weapons', label: 'Dungeon Crawler' },
  { dir: 'D:\\Games\\Models\\grudgeracecharacters\\animationsweapons\\shields', label: 'Shield Models' },
  { dir: 'D:\\Games\\Models\\grudgeracecharacters\\animationsweapons\\bow_models_unzipped', label: 'Bow Models', recurse: true },
];

// ── GLB output directory ────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(ROOT, 'models', 'weapons');

// ── Scan and classify ───────────────────────────────────────────────────────

console.log('🔍 Scanning weapon model directories...\n');

const inventory = {};
let totalFbx = 0;
let totalGlb = 0;
let totalUnclassified = 0;

for (const { dir, label } of SCAN_DIRS) {
  if (!fs.existsSync(dir)) { console.warn(`  ⚠️  Not found: ${dir}`); continue; }
  // Scan directory (optionally recursive)
  let fileEntries; // { name, fullPath }
  if (SCAN_DIRS.find(d => d.dir === dir)?.recurse) {
    fileEntries = [];
    function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const fp = path.join(d, e.name); if (e.isDirectory()) walk(fp); else if (/\.(fbx|glb|gltf|obj)$/i.test(e.name)) fileEntries.push({ name: e.name, fullPath: fp }); } }
    walk(dir);
  } else {
    fileEntries = fs.readdirSync(dir).filter(f => /\.(fbx|glb|gltf|obj)$/i.test(f)).map(f => ({ name: f, fullPath: path.join(dir, f) }));
  }
  console.log(`  📂 ${label}: ${fileEntries.length} files`);

  for (const { name: file, fullPath } of fileEntries) {
    const ext = path.extname(file).toLowerCase();
    const type = classifyWeapon(file);
    if (!type) { totalUnclassified++; continue; }
    if (!inventory[type]) inventory[type] = [];

    const stat = fs.statSync(fullPath);
    const hash = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex').slice(0, 16);

    inventory[type].push({
      name: path.basename(file, ext),
      file,
      ext,
      path: fullPath,
      sizeKB: Math.round(stat.size / 1024),
      hash,
      isGlb: ext === '.glb' || ext === '.gltf',
      needsConversion: ext === '.fbx' || ext === '.obj',
      source: label,
    });
    // Dedup by name within type
    const seen = new Set();
    inventory[type] = inventory[type].filter(m => { if (seen.has(m.name)) return false; seen.add(m.name); return true; });

    if (ext === '.fbx' || ext === '.obj') totalFbx++;
    if (ext === '.glb' || ext === '.gltf') totalGlb++;
  }
}

// ── Print inventory ─────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════');
console.log('  WEAPON MODEL INVENTORY');
console.log('═══════════════════════════════════════════════\n');

const manifest = { version: '1.0.0', generatedAt: new Date().toISOString(), weaponTypes: {} };

for (const [type, models] of Object.entries(inventory).sort((a, b) => a[0].localeCompare(b[0]))) {
  const needsConv = models.filter(m => m.needsConversion).length;
  const ready = models.filter(m => m.isGlb).length;
  console.log(`  ${type.toUpperCase().padEnd(16)} ${models.length} models (${ready} GLB ready, ${needsConv} need conversion)`);
  for (const m of models) {
    const status = m.isGlb ? '✅' : '🔄';
    console.log(`    ${status} ${m.name.padEnd(28)} ${String(m.sizeKB).padStart(5)}KB  ${m.ext}  [${m.source}]`);
  }
  manifest.weaponTypes[type] = {
    modelCount: models.length,
    glbReady: ready,
    needsConversion: needsConv,
    models: models.map(m => ({
      name: m.name,
      file: m.file,
      ext: m.ext,
      sizeKB: m.sizeKB,
      hash: m.hash,
      isGlb: m.isGlb,
      source: m.source,
      r2Key: `models/weapons/${type}/${m.name}.glb`,
    })),
  };
}

console.log(`\n  TOTAL: ${totalFbx + totalGlb} models (${totalGlb} GLB, ${totalFbx} need FBX→GLB)`);
if (totalUnclassified > 0) console.log(`  ⚠️  ${totalUnclassified} unclassified files skipped`);

// ── Write manifest ──────────────────────────────────────────────────────────

const manifestPath = path.join(ROOT, 'api', 'v1', 'weapon-models.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\n📝 Manifest written to ${manifestPath}`);

// ── Conversion instructions ─────────────────────────────────────────────────

if (DRY_RUN) {
  console.log('\n🏁 Dry run complete. Use --local to convert locally or --upload to use Worker pipeline.');
  process.exit(0);
}

if (LOCAL_ONLY) {
  console.log('\n🔧 Local conversion mode — checking for FBX2glTF...');
  // Known path on this machine; falls back to PATH search
  const KNOWN_PATH = 'C:\\Users\\nugye\\npm-global\\node_modules\\fbx2gltf\\bin\\Windows_NT\\FBX2glTF.exe';
  let fbx2gltf;
  const { execSync } = await import('child_process');
  if (fs.existsSync(KNOWN_PATH)) {
    fbx2gltf = `"${KNOWN_PATH}"`;
    console.log(`  ✅ FBX2glTF found at ${KNOWN_PATH}`);
  } else {
    try {
      execSync('FBX2glTF --help', { stdio: 'ignore' });
      fbx2gltf = 'FBX2glTF';
      console.log('  ✅ FBX2glTF found in PATH');
    } catch {
      console.error('  ❌ FBX2glTF not found. Install: npm install -g fbx2gltf');
      process.exit(1);
    }
  }

  let converted = 0;
  let skipped = 0;

  for (const [type, models] of Object.entries(inventory)) {
    const typeDir = path.join(OUTPUT_DIR, type);
    if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });

    for (const model of models) {
      const outPath = path.join(typeDir, `${model.name}.glb`);

      if (model.isGlb) {
        // Already GLB — just copy
        if (!fs.existsSync(outPath)) {
          fs.copyFileSync(model.path, outPath);
          console.log(`  📋 Copied ${model.name}.glb → ${type}/`);
        }
        skipped++;
        continue;
      }

      if (fs.existsSync(outPath)) { skipped++; continue; }

      try {
        console.log(`  🔄 Converting ${model.file} → ${type}/${model.name}.glb`);
        execSync(`${fbx2gltf} -i "${model.path}" -o "${outPath}" --binary`, { stdio: 'pipe' });
        converted++;
      } catch (e) {
        console.warn(`  ❌ Failed: ${model.file} — ${e.message?.split('\n')[0]}`);
      }
    }
  }

  console.log(`\n✅ Conversion complete: ${converted} converted, ${skipped} skipped`);
}

if (UPLOAD) {
  console.log('\n☁️  Upload mode — sending to ObjectStore Worker pipeline...');
  console.log(`  Worker: ${OBJECTSTORE_WORKER}`);

  if (!API_KEY) {
    console.error('  ❌ GRUDGE_API_KEY environment variable required for upload.');
    console.log('     Set it: $env:GRUDGE_API_KEY = "your-key"');
    process.exit(1);
  }

  // Upload GLB files from local output directory (after --local conversion)
  const glbDir = OUTPUT_DIR;
  if (!fs.existsSync(glbDir)) {
    console.error(`  ❌ No converted models found at ${glbDir}. Run with --local first.`);
    process.exit(1);
  }

  let uploaded = 0;
  for (const type of fs.readdirSync(glbDir)) {
    const typeDir = path.join(glbDir, type);
    if (!fs.statSync(typeDir).isDirectory()) continue;
    const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.glb'));

    for (const file of files) {
      const filePath = path.join(typeDir, file);
      const key = `models/weapons/${type}/${file}`;

      console.log(`  ☁️  Uploading ${key}...`);
      try {
        const formData = new FormData();
        formData.append('file', new Blob([fs.readFileSync(filePath)]), file);
        formData.append('category', `weapons/${type}`);
        formData.append('tags', JSON.stringify(['weapon', type, '3d-model', 'glb']));
        formData.append('metadata', JSON.stringify({ weaponType: type, source: 'local-conversion' }));

        const res = await fetch(`${OBJECTSTORE_WORKER}/v1/assets`, {
          method: 'POST',
          headers: { 'X-API-Key': API_KEY },
          body: formData,
        });

        if (res.ok) {
          uploaded++;
          const data = await res.json();
          console.log(`    ✅ ${data.id} — ${key}`);
        } else {
          console.warn(`    ❌ ${res.status}: ${await res.text()}`);
        }
      } catch (e) {
        console.warn(`    ❌ Upload failed: ${e.message}`);
      }
    }
  }

  console.log(`\n✅ Upload complete: ${uploaded} models uploaded to R2`);
}

console.log('\n🏁 Done.');
