/**
 * Merge KayKit Resource Bits wealth-tier meshes into one GLB (shared atlas).
 *
 *   node scripts/pack-kaykit-resource-bits.mjs
 *
 * Out: dist/kaykit/resource-bits.glb  (+ copy for water public if present)
 */
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO, Document } from '@gltf-transform/core';
import { mergeDocuments, dedup, prune, unpartition } from '@gltf-transform/functions';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'KayKit_ResourceBits_1.0_FREE/Assets/gltf');
const outDir = join(root, 'dist/kaykit');
const outFile = join(outDir, 'resource-bits.glb');

const NODES = [
  'Wood_Plank_A', 'Wood_Planks_Stack_Small', 'Wood_Planks_Stack_Large',
  'Stone_Chunks_Small', 'Stone_Bricks_Stack_Small', 'Stone_Bricks_Stack_Large',
  'Textiles_A', 'Textiles_Stack_Small', 'Textiles_Stack_Large',
  'Iron_Nugget_Small', 'Iron_Nuggets', 'Iron_Bars_Stack_Large',
  'Gold_Nugget_Small', 'Gold_Nuggets', 'Gold_Bars_Stack_Large',
  'Fuel_A_Jerrycan', 'Fuel_A_Barrel', 'Fuel_A_Barrels',
  'Parts_Cog', 'Parts_Pile_Small', 'Parts_Pile_Large',
];

const io = new NodeIO();
const packed = new Document();
const packedRoot = packed.createNode('kaykit_resource_bits');
packed.createScene('KayKitResourceBits').addChild(packedRoot);

for (const name of NODES) {
  const src = join(srcDir, `${name}.gltf`);
  if (!existsSync(src)) {
    console.warn('missing', name);
    continue;
  }
  const doc = await io.read(src);
  const map = mergeDocuments(packed, doc);
  const scene = doc.getRoot().listScenes()[0];
  const kids = scene ? scene.listChildren() : [];
  for (const child of kids) {
    const mapped = map.get(child);
    if (mapped) packedRoot.addChild(mapped);
  }
}

await packed.transform(dedup(), prune(), unpartition());
mkdirSync(outDir, { recursive: true });
await io.write(outFile, packed);
console.log('wrote', outFile);

const water = join(root, '../Tactical-Infinity/client/public/models/kaykit/resource-bits.glb');
mkdirSync(dirname(water), { recursive: true });
copyFileSync(outFile, water);
console.log('copied', water);
