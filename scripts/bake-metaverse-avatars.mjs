#!/usr/bin/env node
/**
 * Bake all 6 grudge6 races → bundled GLB avatars (mesh + Bip001 + idle/walk/run/hit/attack).
 * Output: models/grudge6/metaverse/{race}.glb
 *
 *   npm run bake:metaverse
 *   npm run bake:metaverse -- --upload
 *   npm run bake:metaverse:store   (Microsoft Store Blender)
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { spawnSync, execSync } from 'child_process';
import {
  OBJECTSTORE_ROOT,
  RTS_ROOT,
  PARAGON_STAGED,
  ROKOKO_SOURCE,
  findBlender,
  findBlenderLauncher,
} from './lib/animation-pipeline.mjs';

const args = process.argv.slice(2);
const UPLOAD = args.includes('--upload');
const FORCE = args.includes('--force');
const R2_BUCKET = process.env.R2_BUCKET || 'grudge-assets';
const CF_ACCOUNT = process.env.CF_ACCOUNT_ID || '';

const RACES = [
  { raceId: 'human', fbx: 'WK_Characters.fbx' },
  { raceId: 'barbarian', fbx: 'BRB_Characters.fbx' },
  { raceId: 'orc', fbx: 'ORC_Characters.fbx' },
  { raceId: 'undead', fbx: 'UD_Characters.fbx' },
  { raceId: 'elf', fbx: 'ELF_Characters.fbx' },
  { raceId: 'dwarf', fbx: 'DWF_Characters.fbx' },
];

const FBX_ROOT = join(RTS_ROOT, 'client/public/models/grudge6/races');
const OUT_ROOT = join(OBJECTSTORE_ROOT, 'models/grudge6/metaverse');
const PY = join(OBJECTSTORE_ROOT, 'scripts/blender-bake-metaverse-avatar.py');
const MANIFEST_PATH = join(OUT_ROOT, 'manifest.json');

function runBake(raceId, fbxName, blenderBin, useLauncher) {
  const target = join(FBX_ROOT, fbxName);
  const out = join(OUT_ROOT, `${raceId}.glb`);
  if (!existsSync(target)) {
    console.warn(`  MISS FBX ${target}`);
    return null;
  }
  if (existsSync(out) && !FORCE) {
    console.log(`  SKIP ${raceId}.glb (use --force)`);
    return { raceId, path: out, skipped: true };
  }

  mkdirSync(OUT_ROOT, { recursive: true });
  const cmd = useLauncher
    ? [blenderBin, '--python', PY, '--',
        '--race', raceId, '--target', target, '--out', out,
        '--paragon-dir', PARAGON_STAGED,
        '--rokoko-attack', join(ROKOKO_SOURCE, 'mixamo/combat/Boxing_mixamo.fbx')]
    : [blenderBin, '--background', '--python', PY, '--',
        '--race', raceId, '--target', target, '--out', out,
        '--paragon-dir', PARAGON_STAGED,
        '--rokoko-attack', join(ROKOKO_SOURCE, 'mixamo/combat/Boxing_mixamo.fbx')];

  console.log(`  Baking ${raceId}…`);
  const r = spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8', timeout: 600000 });
  const ok = (r.stdout || '').includes('BAKE_OK');
  if (!ok) {
    console.error(`  FAIL ${raceId}\n${(r.stderr || r.stdout || '').slice(-1200)}`);
    return null;
  }
  console.log(`  OK   ${raceId}.glb`);
  return { raceId, path: out };
}

function uploadToR2(localPath) {
  const key = `models/grudge6/metaverse/${basename(localPath)}`;
  console.log(`  ☁ ${key}`);
  try {
    const remoteFlag = UPLOAD ? ' --remote' : '';
    execSync(
      `npx wrangler r2 object put "${R2_BUCKET}/${key}" --file "${localPath}" --account-id "${CF_ACCOUNT}"${remoteFlag}`,
      { stdio: 'pipe' },
    );
    return `https://assets.grudge-studio.com/${key}`;
  } catch (e) {
    console.error(`  Upload fail: ${e.message?.slice(0, 120)}`);
    return null;
  }
}

function writeManifest(entries) {
  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    skeleton: 'Bip001',
    clips: ['idle', 'walk', 'run', 'hit', 'attack'],
    cdnBase: 'https://assets.grudge-studio.com/models/grudge6/metaverse',
    avatars: entries,
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest: ${MANIFEST_PATH}`);
}

async function main() {
  console.log('\nBake grudge6 metaverse avatars (FBX → bundled GLB)\n');

  const headless = findBlender();
  const launcher = findBlenderLauncher();
  const blender = headless || launcher;
  if (!blender) {
    console.error('No Blender found. Set BLENDER_PATH or install Blender.');
    process.exit(1);
  }
  console.log(`Blender: ${blender} (${headless ? 'headless' : 'store launcher'})\n`);

  const baked = [];
  for (const { raceId, fbx } of RACES) {
    const result = runBake(raceId, fbx, blender, !headless);
    if (result) {
      if (UPLOAD && CF_ACCOUNT && !result.skipped) {
        result.cdnUrl = uploadToR2(result.path);
      }
      baked.push({
        raceId: result.raceId,
        file: `${result.raceId}.glb`,
        cdnUrl: result.cdnUrl || `https://assets.grudge-studio.com/models/grudge6/metaverse/${result.raceId}.glb`,
      });
    }
  }

  writeManifest(baked);
  console.log(`\nDone: ${baked.length}/${RACES.length} avatars`);
  if (!CF_ACCOUNT && UPLOAD) console.warn('Set CF_ACCOUNT_ID for R2 upload');
}

main().catch((e) => { console.error(e); process.exit(1); });