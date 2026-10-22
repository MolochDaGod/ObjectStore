/**
 * Buildings pass WITHOUT Unity license: deep-resolve mesh FBX from Unity prefab
 * GUIDs (cached guid map) + name heuristics → convert → R2 → catalog.
 *
 * Usage:
 *   node scripts/resolve-and-deploy-building-meshes.mjs --index   # build guid cache
 *   node scripts/resolve-and-deploy-building-meshes.mjs --all
 *   node scripts/resolve-and-deploy-building-meshes.mjs --convert --upload
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { basename, dirname, extname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { execSync, spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const UNITY_ASSETS =
  process.env.UNITY_ASSETS ||
  'C:/Users/nugye/Desktop/grudgeproduction/grudgenew/FRESH GRUDGE/Assets';
const UMMORPG = join(UNITY_ASSETS, 'uMMORPG');
const PREFABS = join(UMMORPG, 'Prefabs');

const GUID_CACHE = join(ROOT, 'scripts', 'out', 'unity-guid-mesh-cache.json');
const CATALOG = join(ROOT, 'api', 'v1', 'warlords-entity-prefabs.json');
const DIST = join(ROOT, 'dist', 'warlords', 'entities');
const EXTRACT = join(ROOT, 'assets', 'unity-extract', 'buildings');
const REPORT = join(ROOT, 'scripts', 'out', 'warlords-buildings-resolve-report.json');

const R2_BUCKET = 'grudge-assets';
const CDN = 'https://assets.grudge-studio.com';
const R2_PREFIX = 'models/warlords/entities';

const args = new Set(process.argv.slice(2));
const doIndex = args.has('--index') || args.has('--all') || !existsSync(GUID_CACHE);
const doResolve = args.has('--resolve') || args.has('--all') || args.has('--convert') || args.has('--upload');
const doConvert = args.has('--convert') || args.has('--all');
const doUpload = args.has('--upload') || args.has('--all');
const doPublish = args.has('--publish') || args.has('--all') || doUpload;

function walk(dir, filterFn, acc = [], depth = 0) {
  if (!existsSync(dir) || depth > 24) return acc;
  let ents;
  try {
    ents = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of ents) {
    if (ent.name === 'Library' || ent.name === 'Temp' || ent.name === '.git') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, filterFn, acc, depth + 1);
    else if (filterFn(ent.name, p)) acc.push(p);
  }
  return acc;
}

function slugify(s) {
  return String(s)
    .replace(/^entities\//, '')
    .replace(/\.(prefab|fbx|glb|png)$/i, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function needsBuildingPass(p) {
  const st = p.status || p.mesh?.status || '';
  if (p.kind === 'unit' && st === 'cdn_ready') return false;
  if (st === 'cdn_ready' && p.mesh?.cdnUrl?.includes('/models/warlords/entities/')) return false;
  // structures, vehicles, mounts, siege, or incomplete
  if (['structure', 'vehicle', 'mount', 'siege'].includes(p.kind)) {
    return st !== 'cdn_ready' || !p.mesh?.cdnUrl?.includes('.glb');
  }
  return ['unity_prefab_only', 'unity_source', 'icon_only', 'pack_linked'].includes(st);
}

function buildGuidCache() {
  // Focused roots that hold real building / vehicle / prop meshes
  const roots = [
    join(UNITY_ASSETS, '!MAP Assets'),
    join(UNITY_ASSETS, 'Toon_RTS'),
    join(UMMORPG, 'Models'),
    join(UMMORPG, 'Prefabs', 'Structure Crusade'),
    join(UMMORPG, 'Prefabs', 'Structure Legion'),
    join(UMMORPG, 'Prefabs', 'Structure Fabled'),
    join(UMMORPG, 'Prefabs', 'Structures'),
    join(UMMORPG, 'Prefabs', 'Environment'),
    join(UMMORPG, 'Prefabs', 'Entities'),
    join(UNITY_ASSETS, 'Character'),
  ];

  const map = {}; // guid → rel path from Assets
  let metas = 0;
  for (const root of roots) {
    if (!existsSync(root)) {
      console.log('  skip missing', root);
      continue;
    }
    console.log('  indexing', relative(UNITY_ASSETS, root));
    const list = walk(root, (n) => n.endsWith('.meta'));
    for (const metaPath of list) {
      metas++;
      try {
        const text = readFileSync(metaPath, 'utf8');
        const m = text.match(/^guid:\s*([a-f0-9]{32})/m);
        if (!m) continue;
        const asset = metaPath.replace(/\.meta$/i, '');
        if (!existsSync(asset)) continue;
        const ext = extname(asset).toLowerCase();
        // keep mesh-like + nested prefabs
        if (!['.fbx', '.obj', '.blend', '.dae', '.prefab', '.asset', '.mesh'].includes(ext)) continue;
        map[m[1]] = relative(UNITY_ASSETS, asset).replace(/\\/g, '/');
      } catch {
        /* skip */
      }
    }
  }
  const doc = {
    updatedAt: new Date().toISOString(),
    metasScanned: metas,
    count: Object.keys(map).length,
    map,
  };
  mkdirSync(dirname(GUID_CACHE), { recursive: true });
  writeFileSync(GUID_CACHE, JSON.stringify(doc));
  console.log(`GUID cache: ${doc.count} mesh-like assets (${metas} metas)`);
  return doc;
}

function loadGuidCache() {
  if (!existsSync(GUID_CACHE)) return buildGuidCache();
  return JSON.parse(readFileSync(GUID_CACHE, 'utf8'));
}

function extractGuids(prefabAbs) {
  const text = readFileSync(prefabAbs, 'utf8');
  const guids = new Set();
  const re = /guid:\s*([a-f0-9]{32})/g;
  let m;
  while ((m = re.exec(text))) guids.add(m[1]);
  return [...guids];
}

function scoreFbxPath(iconSlug, relPath, kind) {
  const b = basename(relPath).toLowerCase();
  const p = relPath.toLowerCase();
  const icon = iconSlug.toLowerCase();
  let s = 10;

  if (/weapon_|characters_customizable|bow\.fbx|arrow/i.test(b)) return -100;
  if (/\.prefab$/i.test(relPath)) return 5; // nested prefab — expand later

  // building keywords
  const pairs = [
    [/wall|gate|stairs|fort/, /wall|gate|stairs|castle|wood|stone/],
    [/house|cabin|hut|crypt|home/, /house|cabin|hut|home|building|cottage/],
    [/armory|arsenal|smith|blacksmith|foundry|furnace|refinery|sawmill|tannery/, /armory|arsenal|smith|foundry|furnace|forge|anvil|refinery|saw|tannery|work/],
    [/tent/, /tent|shelter|canvas/],
    [/campfire|fire/, /campfire|fire|bonfire/],
    [/chair|bed|table|wardrobe|lamp|ladder|storage/, /chair|bed|table|wardrobe|lamp|ladder|storage|crate|chest/],
    [/ship|boat|catamaran|air|sail/, /ship|boat|sail|catamaran|raft|airship|vehicle/],
    [/horse|mount|mecha|wolf|ram|drake/, /horse|mount|mecha|wolf|ram|cavalry|drake/],
    [/catapult|bolt|siege|tower/, /catapult|bolt|siege|tower|thrower/],
    [/flag|claim/, /flag|banner/],
    [/loom|study|lab|workbench|stable|market/, /loom|study|lab|workbench|stable|market|alchemy/],
  ];
  for (const [iconRe, pathRe] of pairs) {
    if (iconRe.test(icon) && pathRe.test(p)) s += 40;
  }

  // size preference later
  if (kind === 'structure' && /map assets|environment|structure/i.test(p)) s += 15;
  if (kind === 'vehicle' && /vehicle|ship|boat/i.test(p)) s += 20;
  if (kind === 'mount' && /mount|cavalry|horse|mecha/i.test(p)) s += 20;

  return s;
}

function resolvePrimaryMesh(p, guidMap) {
  const empty = { best: null, candidates: [] };
  const rel = p.unity?.prefabRel;
  if (!rel) return empty;
  const abs = join(PREFABS, rel);
  if (!existsSync(abs)) return empty;

  const iconSlug = slugify(p.id);
  const guids = extractGuids(abs);
  const candidates = [];

  for (const g of guids) {
    const r = guidMap[g];
    if (!r) continue;
    const full = join(UNITY_ASSETS, r);
    if (!existsSync(full)) continue;
    const ext = extname(full).toLowerCase();
    if (ext === '.prefab') {
      // one-level nested
      try {
        for (const g2 of extractGuids(full)) {
          const r2 = guidMap[g2];
          if (!r2 || !/\.fbx$/i.test(r2)) continue;
          const f2 = join(UNITY_ASSETS, r2);
          if (!existsSync(f2)) continue;
          candidates.push({
            rel: r2,
            path: f2,
            size: statSync(f2).size,
            score: scoreFbxPath(iconSlug, r2, p.kind) + 5,
            via: 'nested_prefab',
          });
        }
      } catch {
        /* skip */
      }
      continue;
    }
    if (!['.fbx', '.obj', '.dae'].includes(ext)) continue;
    candidates.push({
      rel: r,
      path: full,
      size: statSync(full).size,
      score: scoreFbxPath(iconSlug, r, p.kind),
      via: 'guid',
    });
  }

  // name-based search under MAP + Structures if weak
  if (!candidates.some((c) => c.score >= 40)) {
    const nameRoots = [
      join(UNITY_ASSETS, '!MAP Assets'),
      join(UMMORPG, 'Models'),
      join(UMMORPG, 'Prefabs', 'Structures'),
    ];
    const tokens = iconSlug.split('_').filter((t) => t.length > 3 && !['icon', 'small', 'large'].includes(t));
    for (const root of nameRoots) {
      if (!existsSync(root)) continue;
      const fbx = walk(root, (n) => /\.fbx$/i.test(n));
      for (const fp of fbx) {
        const relP = relative(UNITY_ASSETS, fp).replace(/\\/g, '/');
        let sc = scoreFbxPath(iconSlug, relP, p.kind);
        const bl = basename(fp).toLowerCase();
        for (const t of tokens) if (bl.includes(t)) sc += 12;
        if (sc >= 35) {
          candidates.push({
            rel: relP,
            path: fp,
            size: statSync(fp).size,
            score: sc,
            via: 'name',
          });
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.size - a.size);
  const best = candidates[0];
  if (!best || best.score < 25) return { best: null, candidates: candidates.slice(0, 5) };
  // prefer mid+ size meshes
  if (best.size < 5000 && candidates[1] && candidates[1].size > best.size) {
    return { best: candidates[1], candidates: candidates.slice(0, 5) };
  }
  return { best, candidates: candidates.slice(0, 5) };
}

function convertFbx(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  if (existsSync(dest) && statSync(dest).size > 1000) return { ok: true, skipped: true };
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
      env: {
        ...process.env,
        BLENDER_PATH: process.env.BLENDER_PATH || 'C:\\Users\\nugye\\tools\\Blender\\blender.exe',
        FBX2GLTF_PATH:
          process.env.FBX2GLTF_PATH ||
          'F:\\GitHub\\grudge-arena\\node_modules\\fbx2gltf\\bin\\Windows_NT\\FBX2glTF.exe',
      },
      timeout: 300000,
    },
  );
  if (r.status !== 0 || !existsSync(dest)) {
    console.error(`  FAIL convert ${basename(src)}: ${(r.stderr || r.stdout || '').slice(0, 220)}`);
    return { ok: false };
  }
  console.log(`  OK  ${basename(dest)} (${statSync(dest).size} b)`);
  return { ok: true };
}

function wranglerPut(key, local, ct) {
  const cmd = `npx wrangler r2 object put "${R2_BUCKET}/${key}" --file="${local}" --content-type="${ct}" --remote`;
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe', timeout: 180000, shell: true });
    console.log(`  OK  r2://${key}`);
    return true;
  } catch (e) {
    console.error(`  FAIL ${key}: ${String(e.stderr || e.message).slice(0, 140)}`);
    return false;
  }
}

function main() {
  console.log('=== Buildings resolve pass (no Unity license) ===');
  let cache;
  if (doIndex || !existsSync(GUID_CACHE)) {
    console.log('Building GUID mesh cache…');
    cache = buildGuidCache();
  } else {
    cache = loadGuidCache();
    console.log('Loaded GUID cache:', cache.count);
  }
  const guidMap = cache.map || cache;

  if (!doResolve && !doConvert && !doUpload) return;

  const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'));
  const targets = (catalog.prefabs || []).filter(needsBuildingPass);
  console.log('Targets:', targets.length);

  mkdirSync(EXTRACT, { recursive: true });
  mkdirSync(DIST, { recursive: true });

  const results = [];
  // dedupe convert by content hash
  const hashJobs = new Map();

  for (const p of targets) {
    const slug = slugify(p.id);
    const { best, candidates } = resolvePrimaryMesh(p, guidMap);
    const row = {
      id: p.id,
      slug,
      kind: p.kind,
      prefab: p.unity?.prefabRel || null,
      best: best
        ? { rel: best.rel, score: best.score, size: best.size, via: best.via }
        : null,
      top: candidates,
    };

    if (best) {
      const hash = createHash('sha1').update(readFileSync(best.path)).digest('hex').slice(0, 12);
      const extractDest = join(EXTRACT, `${slug}__${basename(best.path)}`);
      try {
        if (!existsSync(extractDest)) copyFileSync(best.path, extractDest);
      } catch {
        /* skip */
      }
      const glb = join(DIST, `${slug}.glb`);
      row.hash = hash;
      row.extract = extractDest;
      row.glb = glb;
      row.source = best.path;
      if (!hashJobs.has(hash)) hashJobs.set(hash, { src: best.path, glb, slug });
      else row.shareHash = hash;
    }
    results.push(row);
  }

  const resolved = results.filter((r) => r.best);
  console.log(`Resolved meshes: ${resolved.length}/${targets.length}`);
  console.log(`Unique FBX to convert: ${hashJobs.size}`);

  if (doConvert) {
    console.log('\nConverting…');
    for (const [, job] of hashJobs) {
      convertFbx(job.src, job.glb);
    }
    // copy shared
    for (const r of results) {
      if (!r.shareHash || !r.glb) continue;
      const job = hashJobs.get(r.shareHash);
      if (job && existsSync(job.glb) && job.glb !== r.glb) {
        try {
          copyFileSync(job.glb, r.glb);
        } catch {
          /* */
        }
      }
    }
  }

  let uploaded = 0;
  if (doUpload) {
    console.log('\nUploading…');
    for (const r of results) {
      if (!r.glb || !existsSync(r.glb)) continue;
      const key = `${R2_PREFIX}/${r.slug}.glb`;
      if (wranglerPut(key, r.glb, 'model/gltf-binary')) {
        r.cdnUrl = `${CDN}/${key}`;
        r.r2Key = key;
        r.uploaded = true;
        uploaded++;
      }
    }
  }

  // update catalog
  let updated = 0;
  const byId = new Map(results.map((r) => [r.id, r]));
  for (const p of catalog.prefabs || []) {
    const r = byId.get(p.id);
    if (!r?.uploaded && !(r?.glb && existsSync(r.glb) && doConvert && !doUpload)) {
      // still record best source if resolved
      if (r?.best && (p.status === 'unity_prefab_only' || p.status === 'unity_source')) {
        p.mesh = {
          ...(p.mesh || {}),
          status: 'unity_source',
          unityPath: r.best.rel,
          note: `Resolved building mesh via ${r.best.via} (score ${r.best.score}); pending convert/upload`,
        };
        p.unity = {
          ...(p.unity || {}),
          resolvedMesh: r.best.rel,
          resolveScore: r.best.score,
        };
      }
      continue;
    }
    if (r.cdnUrl || (r.glb && existsSync(r.glb))) {
      p.mesh = {
        r2Key: r.r2Key || `${R2_PREFIX}/${r.slug}.glb`,
        cdnUrl: r.cdnUrl || `${CDN}/${R2_PREFIX}/${r.slug}.glb`,
        contentType: 'model/gltf-binary',
        status: r.uploaded ? 'cdn_ready' : 'local_glb',
        unityPath: r.best?.rel || null,
        note: 'Buildings pass: GUID/name resolve → grudge-convert → R2',
      };
      p.status = p.mesh.status;
      updated++;
    }
  }

  catalog.buildingsResolvePass = {
    updatedAt: new Date().toISOString(),
    targets: targets.length,
    resolved: resolved.length,
    uniqueFbx: hashJobs.size,
    uploaded,
    catalogUpdated: updated,
  };
  catalog.updatedAt = new Date().toISOString();
  writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');

  if (doPublish && uploaded) {
    wranglerPut(
      'static-json/warlords-entity-prefabs.json',
      CATALOG,
      'application/json',
    );
  }

  const summary = {
    targets: targets.length,
    resolved: resolved.length,
    uniqueFbx: hashJobs.size,
    uploaded,
    catalogUpdated: updated,
    samples: results
      .filter((r) => r.best)
      .slice(0, 25)
      .map((r) => ({
        id: r.id,
        mesh: r.best.rel,
        score: r.best.score,
        via: r.best.via,
        uploaded: !!r.uploaded,
      })),
    unresolved: results.filter((r) => !r.best).map((r) => r.id),
  };
  writeFileSync(REPORT, JSON.stringify({ summary, results }, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
  console.log('Report:', REPORT);
}

main();
