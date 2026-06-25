#!/usr/bin/env node
/**
 * Export uMMORPG faction workbench prefabs → FBX (Unity) → GLB → R2
 *
 * Step 1 — Unity batch export (requires Unity 6000.1.8f1 + project open once):
 *   node scripts/export-ummorpg-benches.mjs --unity
 *
 * Step 2 — Convert FBX → GLB (requires FBX2glTF on PATH or in tools/bin):
 *   node scripts/export-ummorpg-benches.mjs --convert
 *
 * Step 3 — Upload GLBs to R2 via wrangler:
 *   node scripts/export-ummorpg-benches.mjs --upload
 *
 * All steps:
 *   node scripts/export-ummorpg-benches.mjs --all
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const UNITY_PROJECT = process.env.GRUDGE_UNITY_PROJECT
  || 'C:\\Users\\nugye\\Desktop\\grudgeproduction\\grudgenew\\FRESH GRUDGE';
const UNITY_VERSION = process.env.GRUDGE_UNITY_VERSION || '6000.1.8f1';
const UNITY_EXE = process.env.UNITY_EXE
  || `C:\\Program Files\\Unity\\Hub\\Editor\\${UNITY_VERSION}\\Editor\\Unity.exe`;
const BENCH_FBX_DIR = path.join(UNITY_PROJECT, 'Builds', 'benches');
const BENCH_GLB_DIR = path.join(ROOT, 'models', 'benches', 'ummorpg');
const R2_PREFIX = 'game-assets/environment/benches/ummorpg';
const R2_BUCKET = process.env.R2_BUCKET || 'grudge-assets';

const PREFABS = [
  { slug: 'legion-workbench', name: 'Legion Workbench', station: 'forge', faction: 'legion' },
  { slug: 'fabled-workbench', name: 'Fabled Workbench', station: 'loom', faction: 'fabled' },
  { slug: 'crusade-workbench', name: 'Crusade Workbench', station: 'workbench', faction: 'crusade' },
  { slug: 'workbench', name: 'Workbench', station: 'workbench', faction: 'neutral' },
];

const COMPONENT_FBX = [
  {
    slug: 'anvil-crafting-extended',
    source: path.join(UNITY_PROJECT, 'Assets', 'uMMORPG', 'Scripts', 'Addons', 'CraftingExtended', '3D Model [Sample]', 'TexturesAndMesh', 'Anvil.FBX'),
    station: 'anvil',
  },
  {
    slug: 'alchemy-table',
    source: path.join(UNITY_PROJECT, 'Assets', 'uMMORPG', 'Scripts', 'Addons', 'CraftingExtended', '3D Model [Sample]', 'alchemy_Table', 'tool_achemiy_table.fbx'),
    station: 'alchemy-station',
  },
  {
    slug: 'blacksmith-building',
    source: path.join(UNITY_PROJECT, 'Assets', '!MAP Assets', 'The Work Buildings', 'Meshes', 'Blacksmith.fbx'),
    station: 'forge',
  },
  {
    slug: 'forge-anvil',
    source: path.join(UNITY_PROJECT, 'Assets', '!MAP Assets', 'Forge', 'Models', 'Anvil.fbx'),
    station: 'anvil',
  },
];

const args = new Set(process.argv.slice(2));
const runAll = args.has('--all') || args.size === 0;
const runUnity = runAll || args.has('--unity');
const runConvert = runAll || args.has('--convert');
const runUpload = runAll || args.has('--upload');

function findFbx2Gltf() {
  const candidates = [
    path.join(ROOT, 'tools', 'bin', 'FBX2glTF-windows-x86_64', 'FBX2glTF-windows-x86_64.exe'),
    'FBX2glTF',
    'fbx2gltf',
  ];
  for (const c of candidates) {
    try {
      execSync(`"${c}" --help`, { stdio: 'pipe' });
      return c;
    } catch { /* next */ }
  }
  return null;
}

function runUnityExport() {
  if (!fs.existsSync(UNITY_EXE)) {
    console.error(`❌ Unity not found: ${UNITY_EXE}`);
    process.exit(1);
  }
  console.log('🎮 Unity batch export →', BENCH_FBX_DIR);
  const logFile = path.join(BENCH_FBX_DIR, 'export.log');
  fs.mkdirSync(BENCH_FBX_DIR, { recursive: true });
  const cmd = [
    `"${UNITY_EXE}"`,
    '-batchmode', '-quit', '-nographics',
    `-projectPath "${UNITY_PROJECT}"`,
    '-executeMethod GrudgeBenchExporter.ExportAllBatch',
    `-logFile "${logFile}"`,
  ].join(' ');
  // Unity first-open compile can take 15–30 min on large projects — no timeout
  execSync(cmd, { stdio: 'inherit', shell: true });
  const exported = PREFABS.filter((p) => fs.existsSync(path.join(BENCH_FBX_DIR, `${p.slug}.fbx`)));
  console.log(`   ${exported.length}/${PREFABS.length} prefab FBXs in Builds/benches/`);
  if (fs.existsSync(logFile)) {
    const tail = fs.readFileSync(logFile, 'utf8').split('\n').slice(-15).join('\n');
    console.log(tail);
  }
}

function convertFbxDir(srcDir, outDir, converter) {
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith('.fbx'));
  for (const f of files) {
    const inPath = path.join(srcDir, f);
    const base = path.basename(f, path.extname(f));
    const outPath = path.join(outDir, `${base}.glb`);
    console.log(`  ${f} → ${path.relative(ROOT, outPath)}`);
    const r = spawnSync(converter, ['--binary', '--input', inPath, '--output', outDir], { stdio: 'pipe' });
    if (r.status !== 0) {
      console.error(`  ❌ ${f}: ${r.stderr?.toString().slice(0, 200)}`);
      continue;
    }
    const produced = fs.readdirSync(outDir).find((x) => x.startsWith(base) && x.endsWith('.glb'));
    if (produced && produced !== `${base}.glb`) {
      fs.renameSync(path.join(outDir, produced), outPath);
    }
  }
}

function runConvertStep() {
  const converter = findFbx2Gltf();
  if (!converter) {
    console.warn('⚠ FBX2glTF not found — copy component FBX sources and skip GLB convert');
    console.warn('  Install: download FBX2glTF to ObjectStore/tools/bin/ or npm i -g fbx2gltf');
    fs.mkdirSync(BENCH_GLB_DIR, { recursive: true });
    for (const c of COMPONENT_FBX) {
      if (fs.existsSync(c.source)) {
        const dest = path.join(BENCH_GLB_DIR, `${c.slug}.fbx`);
        fs.copyFileSync(c.source, dest);
        console.log(`  copied ${c.slug}.fbx (component mesh)`);
      }
    }
    return;
  }
  console.log('🔧 Converting FBX → GLB');
  if (fs.existsSync(BENCH_FBX_DIR)) {
    convertFbxDir(BENCH_FBX_DIR, BENCH_GLB_DIR, converter);
  }
  const compDir = path.join(BENCH_GLB_DIR, '_components');
  fs.mkdirSync(compDir, { recursive: true });
  for (const c of COMPONENT_FBX) {
    if (!fs.existsSync(c.source)) continue;
    const tmp = path.join(compDir, `${c.slug}.fbx`);
    fs.copyFileSync(c.source, tmp);
    convertFbxDir(compDir, BENCH_GLB_DIR, converter);
  }
}

function runUploadStep() {
  const glbs = fs.existsSync(BENCH_GLB_DIR)
    ? fs.readdirSync(BENCH_GLB_DIR).filter((f) => f.endsWith('.glb'))
    : [];
  if (!glbs.length) {
    console.warn('⚠ No GLBs to upload — run --unity and --convert first');
    return;
  }
  console.log(`☁️ Uploading ${glbs.length} GLBs to R2 bucket ${R2_BUCKET}`);
  const uploads = [];
  for (const f of glbs) {
    const local = path.join(BENCH_GLB_DIR, f);
    const r2Key = `${R2_PREFIX}/${f}`;
    try {
      execSync(
        `npx wrangler r2 object put "${r2Key}" --file="${local}" --bucket="${R2_BUCKET}" --content-type="model/gltf-binary"`,
        { stdio: 'pipe', cwd: ROOT, timeout: 120000 }
      );
      uploads.push({
        file: f,
        r2Key,
        cdn: `https://assets.grudge-studio.com/${r2Key}`,
      });
      console.log(`  ✅ ${r2Key}`);
    } catch (e) {
      console.error(`  ❌ ${f}: ${e.stderr?.toString() || e.message}`);
    }
  }
  const catalogPath = path.join(ROOT, 'api', 'v1', 'bench-mesh-catalog.json');
  if (fs.existsSync(catalogPath) && uploads.length) {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    for (const bench of catalog.ummorpgBenches || []) {
      const slug = bench.id;
      const match = uploads.find((u) => u.file.replace('.glb', '') === slug);
      if (match) {
        bench.r2Match = { r2Key: match.r2Key, cdn: match.cdn };
        bench.glbProductionMatch = match.file;
      }
    }
    catalog.uploaded = new Date().toISOString().split('T')[0];
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
    console.log('  Updated bench-mesh-catalog.json with R2 URLs');
  }
}

if (runUnity) runUnityExport();
if (runConvert) runConvertStep();
if (runUpload) runUploadStep();

console.log('Done.');