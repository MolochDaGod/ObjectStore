#!/usr/bin/env node
/**
 * generate-models3d-uuids.js
 * Builds api/v1/models3d-uuids.json from models3d.json.
 * UUIDs are deterministic from model path: GRDG-3D-{FNV1a8}
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MODELS_IN = path.join(ROOT, 'api', 'v1', 'models3d.json');
const UUIDS_OUT = path.join(ROOT, 'api', 'v1', 'models3d-uuids.json');

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

const registry = JSON.parse(fs.readFileSync(MODELS_IN, 'utf-8'));
const models = registry.models || [];
const uuids = {};

for (const m of models) {
  const p = (m.path || '').replace(/\\/g, '/');
  if (!p) continue;
  uuids[p] = m.uuid || modelGrudgeUuid(p);
}

const output = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  description: 'Grudge UUID mapping for 3D models. Every model in models3d.json has a stable GRDG-3D-* UUID keyed by path.',
  prefix: 'GRDG-3D',
  count: Object.keys(uuids).length,
  uuids,
};

fs.mkdirSync(path.dirname(UUIDS_OUT), { recursive: true });
fs.writeFileSync(UUIDS_OUT, JSON.stringify(output, null, 2), 'utf-8');

console.log(`Generated ${UUIDS_OUT}`);
console.log(`Mapped ${output.count} model UUIDs`);