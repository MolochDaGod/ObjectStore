#!/usr/bin/env node
/**
 * Re-stage animator-dist spear/sword/greataxe/reactions into bake folders.
 * Does NOT bake — only copies sources for grudge-convert / build-prod-anim-packages.
 *
 * Usage: node scripts/stage-incoming-anims-2026-08-06.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = 'D:\\Games\\Models\\animator-dist (2)\\anim\\animations';
const DST_AUTHOR = 'D:\\Games\\Models\\_anim_packs\\_incoming_2026-08-06_animator-dist';
const DST_REPO = path.join(ROOT, 'raw', 'anim_incoming_2026-08-06');

const FILES = {
  spear: ['lance-spartan.fbx', 'rising-thrust.fbx', 'upward-thrust.fbx'],
  greataxe: ['great-axe-combo.fbx'],
  sword: [
    'slash-advance.fbx',
    'draw-sword-1.fbx',
    'great-sword-slide-attack.fbx',
    'inward-slash.fbx',
    'melee-downward.fbx',
    'melee-horizontal.fbx',
    'one-hand-sword-combo.fbx',
    'outward-slash.fbx',
    'sheath-sword-1.fbx',
  ],
};

async function copyFile(from, to) {
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
  console.log('OK', path.relative(ROOT, to).replace(/\\/g, '/') || to);
}

async function main() {
  let n = 0;
  for (const [folder, files] of Object.entries(FILES)) {
    for (const f of files) {
      const from = path.join(SRC, folder, f);
      await fs.access(from);
      await copyFile(from, path.join(DST_AUTHOR, folder, f));
      await copyFile(from, path.join(DST_REPO, folder, f));
      n++;
    }
  }
  const reactDir = path.join(SRC, 'reactions');
  const reacts = (await fs.readdir(reactDir)).filter((f) => f.toLowerCase().endsWith('.fbx'));
  for (const f of reacts) {
    const from = path.join(reactDir, f);
    await copyFile(from, path.join(DST_AUTHOR, 'reactions', f));
    await copyFile(from, path.join(DST_REPO, 'reactions', f));
    n++;
  }
  console.log(JSON.stringify({ copied: n, author: DST_AUTHOR, repo: DST_REPO }, null, 2));
  console.log('Next: bake FBX → prod/anims via grudge-convert / build-prod-anim-packages');
  console.log('Catalog: api/v1/toon-rts-bake-prep-2026-08-06.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
