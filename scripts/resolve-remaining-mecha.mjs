/**
 * Resolve remaining mecha/totem/yolocopter without Unity FBX export.
 *   node scripts/resolve-remaining-mecha.mjs
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { basename, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawnSync, execSync } from 'child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS =
  'C:/Users/nugye/Desktop/grudgeproduction/grudgenew/FRESH GRUDGE/Assets';
const PREFABS = join(ASSETS, 'uMMORPG/Prefabs');
const CACHE = JSON.parse(
  readFileSync(join(ROOT, 'scripts/out/unity-guid-mesh-cache.json'), 'utf8'),
);
const map = CACHE.map || CACHE;
const DIST = join(ROOT, 'dist/warlords/entities');
const EXTRACT = join(ROOT, 'assets/unity-extract/buildings');
const CATALOG = join(ROOT, 'api/v1/warlords-entity-prefabs.json');
const CDN = 'https://assets.grudge-studio.com';

mkdirSync(DIST, { recursive: true });
mkdirSync(EXTRACT, { recursive: true });

const targets = [
  { slug: 'dragon_glider_icon', rel: 'Entities/Mounts/World Mounts/Dragon Fly Mecha.prefab' },
  { slug: 'scorpid_launcher_icon', rel: 'Entities/Mounts/Mecha/Scorpid Launcher Mecha.prefab' },
  { slug: 'skeeter_icon', rel: 'Entities/Mounts/Mecha/Skeeter Mecha.prefab' },
  { slug: 'totem1', rel: 'Structures/Earth totem.prefab' },
  { slug: 'yolocopter_icon', rel: 'Entities/Vehicles Land/Yolocopter.prefab' },
  { slug: 'brute_mecha_icon', rel: 'Entities/Mounts/Mecha/Brute Mecha.prefab' },
];

function extractGuids(path) {
  const t = readFileSync(path, 'utf8');
  const s = new Set();
  const re = /guid:\s*([a-f0-9]{32})/g;
  let m;
  while ((m = re.exec(t))) s.add(m[1]);
  return [...s];
}

function resolveMesh(prefabRel) {
  const abs = join(PREFABS, prefabRel);
  if (!existsSync(abs)) return null;
  const candidates = [];
  for (const g of extractGuids(abs)) {
    const r = map[g];
    if (!r) continue;
    const full = join(ASSETS, r);
    if (!existsSync(full)) continue;
    const ext = extname(full).toLowerCase();
    if (ext === '.prefab') {
      try {
        for (const g2 of extractGuids(full)) {
          const r2 = map[g2];
          if (!r2 || !/\.(fbx|obj|dae)$/i.test(r2)) continue;
          const f2 = join(ASSETS, r2);
          if (existsSync(f2)) {
            candidates.push({
              rel: r2,
              path: f2,
              size: statSync(f2).size,
              via: 'nested',
            });
          }
        }
      } catch {
        /* skip */
      }
      continue;
    }
    if (/\.(fbx|obj|dae)$/i.test(ext)) {
      candidates.push({
        rel: r,
        path: full,
        size: statSync(full).size,
        via: 'guid',
      });
    }
  }
  candidates.sort((a, b) => {
    const score = (x) => {
      let s = x.size;
      if (/weapon|arrow|bow|shield/i.test(x.rel)) s -= 1e9;
      if (/mecha|drone|copter|air|totem|scorp|skeet|dragon|horse|cavalry/i.test(x.rel))
        s += 5e6;
      return s;
    };
    return score(b) - score(a);
  });
  return candidates[0] || null;
}

function convert(src, dest) {
  if (existsSync(dest) && statSync(dest).size > 1000) return true;
  const ext = extname(src).toLowerCase();
  if (ext === '.dae' || ext === '.obj') {
    const py = join(ROOT, 'scripts/out/_dae2glb.py');
    spawnSync(
      'C:/Users/nugye/tools/Blender/blender.exe',
      ['-b', '-P', py, '--', src, dest],
      { encoding: 'utf8', timeout: 120000 },
    );
    return existsSync(dest) && statSync(dest).size > 500;
  }
  const r = spawnSync(
    process.execPath,
    [
      join(ROOT, 'tools/grudge-convert/bin/grudge-convert.mjs'),
      'fbx2gltf',
      src,
      '-o',
      dest,
      '--cm-to-m',
    ],
    {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 180000,
      env: {
        ...process.env,
        BLENDER_PATH: 'C:\\Users\\nugye\\tools\\Blender\\blender.exe',
        FBX2GLTF_PATH:
          'F:\\GitHub\\grudge-arena\\node_modules\\fbx2gltf\\bin\\Windows_NT\\FBX2glTF.exe',
      },
    },
  );
  if (r.status !== 0) {
    console.error('convert fail', basename(src), (r.stderr || r.stdout || '').slice(0, 200));
  }
  return existsSync(dest) && statSync(dest).size > 1000;
}

function upload(key, file) {
  try {
    execSync(
      `npx wrangler r2 object put "grudge-assets/${key}" --file="${file}" --content-type="model/gltf-binary" --remote`,
      { cwd: ROOT, stdio: 'pipe', shell: true, timeout: 180000 },
    );
    console.log('UPLOADED', key);
    return true;
  } catch (e) {
    console.error('UPLOAD FAIL', key, String(e.message).slice(0, 120));
    return false;
  }
}

const results = [];
for (const t of targets) {
  const mesh = resolveMesh(t.rel);
  console.log(t.slug, '=>', mesh ? `${mesh.via} ${mesh.rel} (${mesh.size})` : 'NONE');
  if (!mesh) {
    results.push({ ...t, ok: false });
    continue;
  }
  const extract = join(EXTRACT, `${t.slug}__${basename(mesh.path)}`);
  try {
    copyFileSync(mesh.path, extract);
  } catch {
    /* */
  }
  const dest = join(DIST, `${t.slug}.glb`);
  const ok = convert(mesh.path, dest);
  console.log('  convert', ok, ok ? statSync(dest).size : 0);
  let cdn = null;
  if (ok) {
    const key = `models/warlords/entities/${t.slug}.glb`;
    if (upload(key, dest)) cdn = `${CDN}/${key}`;
  }
  results.push({ ...t, mesh: mesh.rel, ok, dest, cdn });
}

const cat = JSON.parse(readFileSync(CATALOG, 'utf8'));
let patched = 0;
for (const p of cat.prefabs || []) {
  const slug = String(p.id)
    .replace(/^entities\//, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  const hit = results.find((r) => r.slug === slug && r.cdn);
  if (!hit) continue;
  p.mesh = {
    r2Key: `models/warlords/entities/${slug}.glb`,
    cdnUrl: hit.cdn,
    contentType: 'model/gltf-binary',
    status: 'cdn_ready',
    note: 'Remaining mecha/totem resolve (Unity FBX export folder empty)',
    unityPath: hit.mesh,
  };
  p.status = 'cdn_ready';
  patched++;
}
const by = {};
for (const p of cat.prefabs || []) {
  const s = p.status || p.mesh?.status || '?';
  by[s] = (by[s] || 0) + 1;
}
cat.updatedAt = new Date().toISOString();
cat.mechaResolve = { updatedAt: cat.updatedAt, results, patched, statuses: by };
writeFileSync(CATALOG, JSON.stringify(cat, null, 2) + '\n');
try {
  execSync(
    `npx wrangler r2 object put "grudge-assets/static-json/warlords-entity-prefabs.json" --file="${CATALOG}" --content-type="application/json" --remote`,
    { cwd: ROOT, stdio: 'inherit', shell: true },
  );
} catch {
  console.error('catalog publish failed');
}
console.log(JSON.stringify({ patched, statuses: by, results }, null, 2));
