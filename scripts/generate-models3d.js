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
const EXTENSIONS = new Set(['.glb', '.gltf', '.fbx', '.obj']);

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

  models.push({ name, format, path: webPath, category, sizeKB });

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

console.log(`\nGenerated ${OUT}`);
console.log(`Total: ${models.length} models`);
console.log('By format:', JSON.stringify(byFormat));
console.log('Categories:', Object.keys(byCategory).length);
