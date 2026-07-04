#!/usr/bin/env node
/**
 * generate-models3d.js
 * Scans git-tracked 3D model files and generates api/v1/models3d.json
 * with correct paths that map to GitHub Pages URLs.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'api', 'v1', 'models3d.json');
const UUIDS_OUT = path.join(ROOT, 'api', 'v1', 'models3d-uuids.json');
const EXTENSIONS = new Set(['.glb', '.gltf', '.fbx', '.obj']);

function fnv1aHash8(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash = hash >>> 0;
  const h2 = (hash ^ (hash >>> 16)) >>> 0;
  return h2.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

function modelGrudgeUuid(modelPath) {
  const p = String(modelPath || '').replace(/\\/g, '/');
  return `GRDG-3D-${fnv1aHash8(p)}`;
}

// Get all git-tracked model files
const gitFiles = execSync('git ls-files -- "*.glb" "*.gltf" "*.fbx" "*.obj"', {
  cwd: ROOT,
  encoding: 'utf-8',
  maxBuffer: 10 * 1024 * 1024
}).trim().split('\n').filter(Boolean);

console.log(`Found ${gitFiles.length} git-tracked 3D model files`);

// Derive category from path
function getCategory(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  
  // models/KayKit_MedievalBuilder/objects/fbx/file.fbx -> "KayKit MedievalBuilder"
  // models/buildings/file.glb -> "Buildings"
  // models/characters/file.glb -> "Characters"
  // models/ships/file.glb -> "Ships"
  // models/animations/file.glb -> "Animations"
  // KayKit_ResourceBits_1.0_FREE/Assets/... -> "KayKit ResourceBits"

  if (parts[0] === 'models' && parts.length > 2) {
    // Use the first subfolder under models/
    const sub = parts[1];
    // Clean up names: KayKit_MedievalBuilder -> KayKit MedievalBuilder
    return sub.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  if (parts[0] === 'KayKit_ResourceBits_1.0_FREE') {
    return 'KayKit ResourceBits';
  }

  // Use first directory segment
  if (parts.length > 1) {
    return parts[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  return 'Uncategorized';
}

// Get format from extension
function getFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = { '.glb': 'GLB', '.gltf': 'GLTF', '.fbx': 'FBX', '.obj': 'OBJ' };
  return map[ext] || ext.replace('.', '').toUpperCase();
}

// Build model entries
const models = [];
const byFormat = {};
const byCategory = {};
const uuids = {};

for (const relPath of gitFiles) {
  const absPath = path.join(ROOT, relPath);
  let sizeKB = 0;
  try {
    const stat = fs.statSync(absPath);
    sizeKB = Math.round(stat.size / 1024);
  } catch {
    // File might not exist locally but is tracked
    sizeKB = 0;
  }

  const name = path.basename(relPath);
  const format = getFormat(relPath);
  const category = getCategory(relPath);
  // Use forward slashes for the path (web URL compatible)
  const webPath = relPath.replace(/\\/g, '/');

  const uuid = modelGrudgeUuid(webPath);
  models.push({ name, format, path: webPath, category, sizeKB, uuid });
  uuids[webPath] = uuid;

  byFormat[format] = (byFormat[format] || 0) + 1;
  byCategory[category] = (byCategory[category] || 0) + 1;
}

// Sort by category then name
models.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

const output = {
  totalModels: models.length,
  byFormat,
  byCategory,
  generatedAt: new Date().toISOString(),
  models
};

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf-8');

const uuidsOutput = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  description: 'Grudge UUID mapping for 3D models. Every model in models3d.json has a stable GRDG-3D-* UUID keyed by path.',
  prefix: 'GRDG-3D',
  count: Object.keys(uuids).length,
  uuids,
};
fs.writeFileSync(UUIDS_OUT, JSON.stringify(uuidsOutput, null, 2), 'utf-8');

console.log(`\nGenerated ${OUT}`);
console.log(`Generated ${UUIDS_OUT}`);
console.log(`Total: ${models.length} models`);
console.log('By format:', JSON.stringify(byFormat));
console.log('Categories:', Object.keys(byCategory).length);
