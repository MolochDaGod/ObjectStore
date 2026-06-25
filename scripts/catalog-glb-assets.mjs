#!/usr/bin/env node
/**
 * Catalog production GLB meshes + uMMORPG faction workbenches.
 * Outputs:
 *   api/v1/resource-mesh-catalog.json
 *   api/v1/bench-mesh-catalog.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GLB_PATH = process.env.GRUDGE_PRODUCTION_GLB
  || 'C:\\Users\\nugye\\Desktop\\grudgeproduction\\items for game.glb';
const UMMORPG_ROOT = process.env.UMMORPG_ROOT
  || 'C:\\Users\\nugye\\Desktop\\grudgeproduction\\grudgenew\\FRESH GRUDGE\\Assets\\uMMORPG';
const MANIFEST_PATH = path.join(ROOT, 'manifests', 'v2', 'index.json');
const OUT_RESOURCE = path.join(ROOT, 'api', 'v1', 'resource-mesh-catalog.json');
const OUT_BENCH = path.join(ROOT, 'api', 'v1', 'bench-mesh-catalog.json');

const NOISE_PATTERNS = [
  /^cube_\d+/i,
  /^Object_\d+/i,
  /^node_\d+$/i,
  /^mesh_\d+$/i,
];

const BENCH_PATTERNS = [
  /anvil/i, /forge/i, /workbench/i, /bench/i, /stump/i,
  /chemistry/i, /alchemy/i, /loom/i, /spinning/i, /tanning/i,
  /sawmill/i, /tinker/i, /enchant/i, /gem.?cut/i, /kitchen/i,
  /campfire/i, /smithing/i, /crafting/i,
];

const BUILDING_PATTERNS = [
  /hut/i, /house/i, /roof/i, /door/i, /wall/i, /blacksmith/i,
  /woodcutter/i, /barrack/i, /market/i, /ironworks/i, /quarry/i,
  /MESH_Woodcutter/i, /MESH_/i, /bldg/i, /structure/i,
];

const RESOURCE_PATTERNS = [
  /log/i, /plank/i, /firewood/i, /ingot/i, /bar/i, /nugget/i,
  /ore/i, /crystal/i, /bottle/i, /liquid/i, /barrel/i, /crate/i,
  /copper/i, /iron/i, /gold/i, /silver/i, /mithril/i, /coal/i,
  /textile/i, /leather/i, /gem/i, /herb/i, /fish/i, /meat/i,
  /fuel/i, /wood_/i,
];

function categorize(name) {
  if (NOISE_PATTERNS.some((p) => p.test(name))) return 'noise';
  if (BENCH_PATTERNS.some((p) => p.test(name))) return 'bench';
  if (BUILDING_PATTERNS.some((p) => p.test(name))) return 'building';
  if (RESOURCE_PATTERNS.some((p) => p.test(name))) return 'resource';
  return 'prop';
}

function normalizeForMatch(name) {
  return name
    .replace(/_low$/i, '')
    .replace(/objcleanermaterialmergergles/gi, '')
    .replace(/fbx$/i, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .toLowerCase()
    .replace(/^_+|_+$/g, '');
}

function loadManifestIndex() {
  if (!fs.existsSync(MANIFEST_PATH)) return [];
  const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  return Array.isArray(raw) ? raw : (raw.assets || raw.items || []);
}

function buildManifestIndex(manifest) {
  const byNorm = new Map();
  for (const entry of manifest) {
    const entryName = (entry.name || entry.path || '').toLowerCase();
    const entryNorm = normalizeForMatch(entryName);
    if (!entryNorm) continue;
    if (!byNorm.has(entryNorm)) byNorm.set(entryNorm, entry);
    for (const t of entryNorm.split('_').filter((x) => x.length > 2)) {
      if (!byNorm.has(t)) byNorm.set(t, entry);
    }
  }
  return byNorm;
}

function findR2Match(name, index) {
  const norm = normalizeForMatch(name);
  if (index.has(norm)) return index.get(norm);
  const tokens = norm.split('_').filter((t) => t.length > 2);
  for (const t of tokens) {
    if (index.has(t)) return index.get(t);
  }
  return null;
}

function parseUnityPrefab(prefabPath) {
  const text = fs.readFileSync(prefabPath, 'utf8');
  const rootName = text.match(/m_Name: ([^\n]+)\n[\s\S]*?m_Component:[\s\S]*?Legion Workbench|m_Name: (Legion Workbench|Fabled Workbench|Crusade Workbench|Workbench)/)?.[0];
  const nameMatch = [...text.matchAll(/m_Name: ([^\n]+)/g)].map((m) => m[1].trim());
  const guids = [...text.matchAll(/guid: ([a-f0-9]{32})/g)].map((m) => m[1]);
  const root = nameMatch.find((n) => /Workbench/i.test(n)) || path.basename(prefabPath, '.prefab');
  return { name: root, childObjects: [...new Set(nameMatch)], meshGuids: [...new Set(guids)], prefabPath };
}

const STATION_MAP = {
  'Legion Workbench': { station: 'forge', faction: 'legion', race: 'orc', profession: 'Miner' },
  'Fabled Workbench': { station: 'loom', faction: 'fabled', race: 'elf', profession: 'Mystic' },
  'Crusade Workbench': { station: 'workbench', faction: 'crusade', race: 'human', profession: 'Forester' },
  'Workbench': { station: 'workbench', faction: 'neutral', race: null, profession: 'Engineer' },
};

function catalogUmmorpgBenches() {
  const prefabPaths = [
    path.join(UMMORPG_ROOT, 'Prefabs', 'Structure Legion', 'Legion Workbench.prefab'),
    path.join(UMMORPG_ROOT, 'Prefabs', 'Structure Fabled', 'Fabled Workbench.prefab'),
    path.join(UMMORPG_ROOT, 'Prefabs', 'Structure Crusade', 'Crusade Workbench.prefab'),
    path.join(UMMORPG_ROOT, 'Scripts', 'Addons', 'CraftingExtended', 'Prefabs', 'Prefabs [Drag to Scene]', '3D Only', 'Workbench.prefab'),
  ].filter((p) => fs.existsSync(p));

  const icons = {
    'Legion Workbench': 'game-assets/icons/entities/Legion Workbench.PNG',
    'Fabled Workbench': 'game-assets/icons/entities/Workbench.PNG',
    'Crusade Workbench': 'game-assets/icons/entities/Workbench.PNG',
    'Workbench': 'game-assets/icons/entities/Workbench.PNG',
  };

  return prefabPaths.map((p) => {
    const parsed = parseUnityPrefab(p);
    const meta = STATION_MAP[parsed.name] || { station: 'workbench', faction: 'unknown' };
    return {
      id: parsed.name.toLowerCase().replace(/\s+/g, '-'),
      name: parsed.name,
      source: 'ummorpg',
      sourcePath: p,
      faction: meta.faction,
      race: meta.race,
      profession: meta.profession,
      recipeStation: meta.station,
      icon: icons[parsed.name] || null,
      meshGuids: parsed.meshGuids,
      childObjectCount: parsed.childObjects.length,
      preferred: true,
      note: 'Original Grudge Warlords uMMORPG race housing workbench — prefer over voxel GLB props',
      r2Match: null,
      glbProductionMatch: null,
    };
  });
}

function readGlbJson(glbPath) {
  const fd = fs.openSync(glbPath, 'r');
  try {
    const header = Buffer.alloc(20);
    fs.readSync(fd, header, 0, 20, 0);
    if (header.toString('utf8', 0, 4) !== 'glTF') throw new Error(`Not a GLB: ${glbPath}`);
    const chunkLen = header.readUInt32LE(12);
    const chunkType = header.toString('utf8', 16, 20);
    if (chunkType !== 'JSON') throw new Error(`First chunk is not JSON in ${glbPath}`);
    const jsonBuf = Buffer.alloc(chunkLen);
    fs.readSync(fd, jsonBuf, 0, chunkLen, 20);
    return JSON.parse(jsonBuf.toString('utf8'));
  } finally {
    fs.closeSync(fd);
  }
}

async function catalogGlb() {
  if (!fs.existsSync(GLB_PATH)) {
    console.warn(`⚠ GLB not found: ${GLB_PATH}`);
    return { nodes: [], meshes: [], byCategory: {} };
  }

  console.log(`📦 Reading GLB: ${GLB_PATH}`);
  const gltf = readGlbJson(GLB_PATH);
  const nodeNames = new Set((gltf.nodes || []).map((n) => n.name).filter(Boolean));
  const meshNames = new Set((gltf.meshes || []).map((m) => m.name).filter(Boolean));

  const allNames = [...new Set([...nodeNames, ...meshNames])];
  const byCategory = { bench: [], building: [], resource: [], prop: [], noise: [] };
  const manifest = loadManifestIndex();
  const manifestIndex = buildManifestIndex(manifest);
  const seenNorm = new Set();

  for (const name of allNames) {
    const norm = normalizeForMatch(name);
    if (!norm || seenNorm.has(norm)) continue;
    seenNorm.add(norm);
    const cat = categorize(name);
    const entry = {
      name,
      category: cat,
      normalized: norm,
      r2Match: null,
    };
    const match = findR2Match(name, manifestIndex);
    if (match) {
      entry.r2Match = {
        name: match.name,
        path: match.path,
        r2Key: match.r2Key,
        cdn: match.r2Key ? `https://assets.grudge-studio.com/${match.r2Key}` : null,
      };
    }
    if (byCategory[cat]) byCategory[cat].push(entry);
  }

  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    sourceGlb: GLB_PATH,
    nodeCount: nodeNames.size,
    meshCount: meshNames.size,
    uniqueNames: allNames.length,
    byCategory,
  };
}

console.log('🔍 Cataloging production GLB + uMMORPG benches...');
const glbData = await catalogGlb();
const ummorpgBenches = catalogUmmorpgBenches();

// Link GLB bench names to uMMORPG / recipe stations
const RECIPE_STATION_ALIASES = {
  anvil_low: 'anvil',
  stumpanvil: 'anvil',
  forge_low: 'forge',
  workbenchwood: 'woodworking-bench',
  workbenchstone: 'workbench',
  chemistry_tablefbx: 'alchemy-station',
  craftingbenchobjcleanermaterialmergergles: 'workbench',
  bench: 'workbench',
  bench2: 'workbench',
};

const glbBenches = (glbData.byCategory?.bench || []).map((b) => {
  const norm = b.normalized;
  const station = Object.entries(RECIPE_STATION_ALIASES).find(([k]) => norm.includes(k))?.[1] || 'workbench';
  const ummorpg = ummorpgBenches.find((u) => u.recipeStation === station);
  return {
    ...b,
    recipeStation: station,
    ummorpgPreferred: ummorpg ? ummorpg.id : null,
    useProductionGlb: !ummorpg,
  };
});

const benchCatalog = {
  version: '1.0.0',
  updated: new Date().toISOString().split('T')[0],
  canonical: true,
  description: 'Crafting station mesh registry — uMMORPG faction workbenches preferred, GLB production props as fallback',
  recipeStations: [
    'forge', 'anvil', 'master-forge', 'divine-forge',
    'sawmill', 'master-sawmill', 'divine-sawmill', 'woodworking-bench',
    'loom', 'master-loom', 'divine-loom',
    'tanning-rack', 'master-tanning', 'divine-tanning',
    'alchemy-station', 'enchanting-table', 'workbench', 'workshop',
    'gem-cutter', 'kitchen', 'campfire', 'tinker-table',
  ],
  ummorpgBenches,
  glbBenches,
  stationMapping: RECIPE_STATION_ALIASES,
  policy: {
    preferSource: 'ummorpg',
    fallbackSource: 'production-glb',
    doNotUploadMonolith: true,
    splitStrategy: 'export named roots as individual GLBs to R2',
  },
};

const resourceCatalog = {
  version: '1.0.0',
  updated: new Date().toISOString().split('T')[0],
  canonical: true,
  description: 'Named mesh catalog from production GLB — resources, buildings, props',
  ...glbData,
  summary: {
    benches: glbData.byCategory?.bench?.length || 0,
    buildings: glbData.byCategory?.building?.length || 0,
    resources: glbData.byCategory?.resource?.length || 0,
    props: glbData.byCategory?.prop?.length || 0,
    noise: glbData.byCategory?.noise?.length || 0,
    r2Matched: Object.values(glbData.byCategory || {}).flat().filter((e) => e.r2Match).length,
  },
};

fs.writeFileSync(OUT_BENCH, JSON.stringify(benchCatalog, null, 2) + '\n');
fs.writeFileSync(OUT_RESOURCE, JSON.stringify(resourceCatalog, null, 2) + '\n');

console.log(`✅ Wrote ${OUT_BENCH}`);
console.log(`   uMMORPG benches: ${ummorpgBenches.length}`);
console.log(`   GLB bench meshes: ${glbBenches.length}`);
console.log(`✅ Wrote ${OUT_RESOURCE}`);
console.log(`   ${resourceCatalog.summary.benches} benches, ${resourceCatalog.summary.buildings} buildings, ${resourceCatalog.summary.resources} resources`);
console.log(`   ${resourceCatalog.summary.noise} noise nodes (excluded from upload)`);
console.log(`   ${resourceCatalog.summary.r2Matched} names matched to R2 manifest`);