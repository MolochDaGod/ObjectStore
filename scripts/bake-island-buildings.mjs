#!/usr/bin/env node
/**
 * Bake island/camp buildings to the home-island SI contract and wire prefabs.
 *
 * Scale SSOT (home-island-contract.json):
 *   characterHeightM = 2
 *   buildingHeightM  = 4   (camp_building si.heightM)
 *
 * KayKit Medieval Builder objects ship at ~0.9–1.5 m (RTS hex tile).
 * Cantina source is ~0.26 m. Both are baked with --height 4 so a 2 m
 * character walks the door, not through a dollhouse.
 *
 * Usage:
 *   node scripts/bake-island-buildings.mjs
 *   node scripts/bake-island-buildings.mjs --upload
 *   node scripts/bake-island-buildings.mjs --skip-bake   # wire only
 *
 * Outputs:
 *   dist/production/buildings/{id}.glb + .collider.json + .manifest.json
 *   api/v1/island-building-prefabs.json
 *   js/island-building-prefabs.js          (runtime resolver)
 *
 * R2 keys (both written on --upload):
 *   models/buildings/{id}.glb              canonical
 *   models/_optimized/buildings/{id}.glb   worker-example / purged HTML keys
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFleetEnv, resolveR2S3Config } from './lib/load-fleet-env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CDN = 'https://assets.grudge-studio.com';
const INFO = 'https://info.grudge-studio.com';
const CHARACTER_HEIGHT_M = 2;
const BUILDING_HEIGHT_M = 4;
const CONVERT = join(ROOT, 'tools/grudge-convert/bin/grudge-convert.mjs');
const OUT_DIR = join(ROOT, 'dist/production/buildings');

const args = process.argv.slice(2);
const SKIP_BAKE = args.includes('--skip-bake');
const UPLOAD = args.includes('--upload');
const DRY = args.includes('--dry-run');

/** Sources that exist in this repo. Unique mesh per id except tavern←cantina. */
export const ISLAND_BUILDINGS = [
  {
    id: 'cantina',
    name: 'Cantina',
    source: 'models/buildings/cantina.glb',
    role: 'tavern_bar',
    category: 'camp_building',
    craftStation: false,
    entityId: 'entities/cantina',
    sourceNote: 'Local cantina.glb (~0.26 m raw) scaled to 4 m',
  },
  {
    id: 'tavern',
    name: 'Tavern',
    source: 'models/buildings/cantina.glb',
    role: 'tavern',
    category: 'camp_building',
    craftStation: false,
    entityId: 'entities/tavern',
    sourceNote: 'Same unique bar mesh as cantina; own bake + r2Key + prefab id',
  },
  {
    id: 'inn',
    name: 'Inn',
    source: 'models/KayKit_MedievalBuilder/objects/gltf/barracks.gltf.glb',
    role: 'lodging',
    category: 'camp_building',
    craftStation: false,
    entityId: 'entities/inn',
    sourceNote: 'KayKit barracks (~1.3 m) as lodging hall, scaled to 4 m',
  },
  {
    id: 'house',
    name: 'House',
    source: 'models/KayKit_MedievalBuilder/objects/gltf/house.gltf.glb',
    role: 'dwelling',
    category: 'camp_building',
    craftStation: false,
    entityId: 'entities/house',
    sourceNote: 'KayKit house (~0.91 m RTS tile) scaled to 4 m',
  },
  {
    id: 'blacksmith',
    name: 'Blacksmith',
    source: 'models/KayKit_MedievalBuilder/objects/gltf/lumbermill.gltf.glb',
    role: 'craft_station',
    category: 'bench',
    craftStation: true,
    entityId: 'entities/Blacksmith_Icon',
    sourceNote: 'KayKit lumbermill (~1.47 m workshop) scaled to 4 m',
  },
  {
    id: 'market',
    name: 'Market',
    source: 'models/KayKit_MedievalBuilder/objects/gltf/market.gltf.glb',
    role: 'market',
    category: 'camp_building',
    craftStation: false,
    entityId: 'entities/Market_Icon',
    sourceNote: 'KayKit market (~0.86 m stall) scaled to 4 m; was unity_prefab_only',
  },
];

function r2Keys(id) {
  return {
    canonical: `models/buildings/${id}.glb`,
    optimized: `models/_optimized/buildings/${id}.glb`,
  };
}

function runConvert(srcAbs, outAbs) {
  mkdirSync(dirname(outAbs), { recursive: true });
  const r = spawnSync(
    process.execPath,
    [
      CONVERT,
      'glb2glb',
      srcAbs,
      '-o',
      outAbs,
      '--height',
      String(BUILDING_HEIGHT_M),
      '--texture-size',
      '1024',
    ],
    { cwd: ROOT, stdio: 'inherit' },
  );
  if (r.status !== 0) {
    throw new Error(`grudge-convert failed for ${srcAbs} (exit ${r.status})`);
  }
}

function inspectGlb(file) {
  const r = spawnSync(process.execPath, [CONVERT, 'inspect', file], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    return { error: (r.stderr || r.stdout || '').slice(0, 400) };
  }
  try {
    return JSON.parse(r.stdout);
  } catch {
    return { error: 'inspect json parse', raw: (r.stdout || '').slice(0, 200) };
  }
}

function magicOk(buf) {
  return buf.length >= 4 && buf[0] === 0x67 && buf[1] === 0x6c && buf[2] === 0x54 && buf[3] === 0x46;
}

function md5(buf) {
  return createHash('md5').update(buf).digest('hex');
}

async function uploadGlb(local, key, putR2Object, r2) {
  const body = readFileSync(local);
  if (!magicOk(body)) throw new Error(`refusing to upload non-GLB ${local}`);
  if (body.length < 10000) throw new Error(`refusing tiny body ${body.length} for ${key}`);
  await putR2Object({
    key,
    body,
    contentType: 'model/gltf-binary',
    bucket: r2.bucket,
  });
}

function writePrefabCatalog(rows) {
  const doc = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    description:
      'Island/camp building prefabs — KayKit + cantina baked to 4 m (2× character). Magic-byte GLB only. Fetch rejects HTML hub and byte-size drift (stale R2 dollhouse).',
    cdnBase: CDN,
    infoBase: INFO,
    convertCli: 'tools/grudge-convert',
    scale: {
      characterHeightM: CHARACTER_HEIGHT_M,
      buildingHeightM: BUILDING_HEIGHT_M,
      unit: 'meter',
      rule: 'Bake --height 4 into mesh positions. Runtime must not apply 0.01 hacks.',
      source: 'api/v1/home-island-contract.json characterScale + camp_building si.heightM',
    },
    script: 'js/island-building-prefabs.js',
    count: rows.length,
    prefabs: rows,
  };
  const out = join(ROOT, 'api/v1/island-building-prefabs.json');
  writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
  console.log('wrote api/v1/island-building-prefabs.json');
  return doc;
}

function writeRuntimeJs(rows) {
  const compact = rows.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    r2Key: p.mesh.r2Key,
    r2KeyOptimized: p.mesh.r2KeyOptimized,
    cdnUrl: p.mesh.cdnUrl,
    infoUrl: p.mesh.infoUrl || `${INFO}/${p.mesh.r2Key}`,
    bytes: p.mesh.bytes,
    md5: p.mesh.md5,
    heightM: p.si.heightM,
    craftStation: p.game.craftStation,
  }));
  const src = `/**
 * Island / camp building prefabs — runtime resolver (no THREE import).
 *
 * Scale: buildings are baked at ${BUILDING_HEIGHT_M} m vs character ${CHARACTER_HEIGHT_M} m.
 * Host injects THREE + GLTFLoader (same peer as main-panel / labs).
 * Identity: glTF magic + catalog byte length (reject HTML hub and stale R2 dollhouse).
 * Never GET models/_optimized/* on CDN v2.2.1 — miss re-backfills hub HTML.
 *
 * Catalog SSOT: api/v1/island-building-prefabs.json
 */
export const CDN = ${JSON.stringify(CDN)};
export const INFO = ${JSON.stringify(INFO)};
export const CHARACTER_HEIGHT_M = ${CHARACTER_HEIGHT_M};
export const BUILDING_HEIGHT_M = ${BUILDING_HEIGHT_M};

export const ISLAND_BUILDINGS = ${JSON.stringify(compact, null, 2)};

const BY_ID = Object.fromEntries(ISLAND_BUILDINGS.map((b) => [b.id, b]));

export function getIslandBuilding(id) {
  return BY_ID[id] || null;
}

export function buildingCdnUrl(id, { optimized = false } = {}) {
  const b = BY_ID[id];
  if (!b) return null;
  const key = optimized ? b.r2KeyOptimized : b.r2Key;
  return \`\${CDN}/\${key}\`;
}

export function buildingR2Keys(id) {
  const b = BY_ID[id];
  if (!b) return [];
  return [b.r2Key, b.r2KeyOptimized];
}

/** glTF binary magic. HTML hub starts with '<!' / '<ht'. */
export function looksLikeGlb(bytes) {
  if (!bytes || bytes.length < 4) return false;
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return u8[0] === 0x67 && u8[1] === 0x6c && u8[2] === 0x54 && u8[3] === 0x46;
}

export function looksLikeHtmlHub(bytes) {
  if (!bytes || !bytes.length) return false;
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let i = 0;
  const n = Math.min(u8.length, 96);
  while (i < n && (u8[i] === 0x20 || u8[i] === 0x09 || u8[i] === 0x0a || u8[i] === 0x0d)) i++;
  return u8[i] === 0x3c;
}

/**
 * Fetch a building GLB, fail-closed on HTML hub / MIME lie / stale R2 size.
 * Order: CDN canonical → info.* same key. Never _optimized on 2.2.1.
 */
export async function fetchBuildingGlb(id, fetchImpl = fetch) {
  const b = BY_ID[id];
  if (!b) throw new Error(\`unknown island building \${id}\`);
  const urls = [
    b.cdnUrl || \`\${CDN}/\${b.r2Key}\`,
    b.infoUrl || \`\${INFO}/\${b.r2Key}\`,
  ];
  let lastErr = null;
  for (const url of urls) {
    try {
      const res = await fetchImpl(url);
      if (!res.ok) {
        lastErr = new Error(\`\${res.status} \${url}\`);
        continue;
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      if (looksLikeHtmlHub(buf) || !looksLikeGlb(buf)) {
        lastErr = new Error(\`html-hub-rejected \${url}\`);
        continue;
      }
      if (b.bytes && buf.byteLength !== b.bytes) {
        lastErr = new Error(\`size-mismatch \${buf.byteLength}!=\${b.bytes} \${url}\`);
        continue;
      }
      return { id, url, bytes: buf, prefab: b };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(\`no GLB for \${id}\`);
}

/**
 * Load into a Three scene. \`fitToSi\` only if baked height drifted > 12%.
 * Host: { THREE, GLTFLoader, scene }
 */
export async function loadIslandBuilding(id, host = {}) {
  const { THREE, GLTFLoader, scene } = host;
  if (!GLTFLoader) throw new Error('GLTFLoader required');
  const packed = await fetchBuildingGlb(id);
  const blob = new Blob([packed.bytes], { type: 'model/gltf-binary' });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(objectUrl);
    const root = gltf.scene || gltf.scenes?.[0];
    if (!root) throw new Error(\`empty scene \${id}\`);
    if (THREE?.Box3) {
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const target = packed.prefab.heightM || BUILDING_HEIGHT_M;
      if (size.y > 0.01 && Math.abs(size.y - target) / target > 0.12) {
        const s = target / size.y;
        root.scale.multiplyScalar(s);
      }
      box.setFromObject(root);
      if (Number.isFinite(box.min.y) && Math.abs(box.min.y) > 0.02) {
        root.position.y -= box.min.y;
      }
    }
    if (scene) scene.add(root);
    return { root, gltf, prefab: packed.prefab, url: packed.url };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.GrudgeIslandBuildings = {
    CDN, INFO, CHARACTER_HEIGHT_M, BUILDING_HEIGHT_M,
    ISLAND_BUILDINGS, getIslandBuilding, buildingCdnUrl, buildingR2Keys,
    looksLikeGlb, looksLikeHtmlHub, fetchBuildingGlb, loadIslandBuilding,
  };
}
`;
  const out = join(ROOT, 'js/island-building-prefabs.js');
  writeFileSync(out, src);
  console.log('wrote js/island-building-prefabs.js');
}

function patchJson(rel, mutator) {
  const p = join(ROOT, rel);
  const doc = JSON.parse(readFileSync(p, 'utf8'));
  mutator(doc);
  writeFileSync(p, JSON.stringify(doc, null, 2) + '\n');
  console.log('patched', rel);
}

function wireCatalogs(prefabDoc) {
  patchJson('api/v1/home-island-contract.json', (doc) => {
    doc.islandBuildings = {
      version: prefabDoc.version,
      generated: prefabDoc.generated,
      catalog: 'api/v1/island-building-prefabs.json',
      script: 'js/island-building-prefabs.js',
      bake: 'scripts/bake-island-buildings.mjs',
      scale: prefabDoc.scale,
      r2Prefix: 'models/buildings',
      optimizedPrefix: 'models/_optimized/buildings',
      items: prefabDoc.prefabs.map((p) => ({
        id: p.id,
        r2Key: p.mesh.r2Key,
        cdnUrl: p.mesh.cdnUrl,
        infoUrl: p.mesh.infoUrl,
        bytes: p.mesh.bytes,
        md5: p.mesh.md5,
        heightM: p.si.heightM,
        role: p.role,
      })),
    };
  });

  patchJson('api/v1/games-library.json', (doc) => {
    doc.runtime = doc.runtime || {};
    doc.runtime.islandBuildingPrefabs =
      `${INFO}/api/v1/island-building-prefabs.json`;
    doc.runtime.warlordsEntityPrefabs =
      doc.runtime.warlordsEntityPrefabs ||
      'https://molochdagod.github.io/ObjectStore/api/v1/warlords-entity-prefabs.json';
  });

  patchJson('api/v1/warlords-entity-prefabs.json', (doc) => {
    const byEntity = Object.fromEntries(prefabDoc.prefabs.map((p) => [p.entityId, p]));
    for (const pref of doc.prefabs || []) {
      const baked = byEntity[pref.id];
      if (!baked) continue;
      pref.mesh = {
        ...(pref.mesh || {}),
        r2Key: baked.mesh.r2Key,
        r2KeyOptimized: baked.mesh.r2KeyOptimized,
        cdnUrl: baked.mesh.cdnUrl,
        contentType: 'model/gltf-binary',
        status: 'baked_local',
        note: baked.sourceNote,
        islandPack: 'island-building-prefabs',
      };
      pref.si = { heightM: BUILDING_HEIGHT_M, unit: 'meter' };
      if (pref.status === 'icon_only' || pref.status === 'unity_prefab_only') {
        pref.status = 'mesh_baked';
      }
    }
  });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const rows = [];

  for (const b of ISLAND_BUILDINGS) {
    const src = join(ROOT, b.source);
    const out = join(OUT_DIR, `${b.id}.glb`);
    if (!existsSync(src)) throw new Error(`missing source ${b.source}`);
    if (!SKIP_BAKE && !DRY) {
      console.log(`\n[bake] ${b.id}  ${b.source}  →  ${out}`);
      runConvert(src, out);
    }
    if (!existsSync(out) && !DRY) throw new Error(`bake missing ${out}`);

    // Tracked copies: GitHub Pages / info.grudge-studio.com can serve these
    // as real GLB so CDN GitHub-fallback backfills bytes, not hub HTML.
    if (existsSync(out) && !DRY) {
      const tracked = [
        join(ROOT, 'models/buildings', `${b.id}.glb`),
        join(ROOT, 'models/_game-ready/buildings', `${b.id}.glb`),
      ];
      for (const dest of tracked) {
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(out, dest);
      }
      const col = out.replace(/\.glb$/i, '.collider.json');
      if (existsSync(col)) {
        copyFileSync(col, join(ROOT, 'models/_game-ready/buildings', `${b.id}.collider.json`));
      }
    }

    let bounds = null;
    let bytes = 0;
    let hash = null;
    let magic = false;
    if (existsSync(out)) {
      const buf = readFileSync(out);
      bytes = buf.length;
      hash = md5(buf);
      magic = magicOk(buf);
      if (!magic) throw new Error(`bake produced non-GLB ${out}`);
      const ins = inspectGlb(out);
      bounds = ins.bounds || null;
      if (bounds?.heightM && Math.abs(bounds.heightM - BUILDING_HEIGHT_M) > 0.35) {
        console.warn(
          `  warn ${b.id} height ${bounds.heightM} m (want ${BUILDING_HEIGHT_M})`,
        );
      }
    }

    const keys = r2Keys(b.id);
    rows.push({
      prefabId: `PFAB-BLDG-${b.id.toUpperCase()}`,
      id: b.id,
      entityId: b.entityId,
      name: b.name,
      displayName: b.name,
      kind: 'structure',
      category: b.category,
      role: b.role,
      era: 'warlords',
      source: b.source,
      sourceNote: b.sourceNote,
      mesh: {
        r2Key: keys.canonical,
        r2KeyOptimized: keys.optimized,
        cdnUrl: `${CDN}/${keys.canonical}`,
        cdnUrlOptimized: `${CDN}/${keys.optimized}`,
        infoUrl: `${INFO}/${keys.canonical}`,
        contentType: 'model/gltf-binary',
        local: `dist/production/buildings/${b.id}.glb`,
        bytes,
        md5: hash,
        magic: 'glTF',
        status: magic ? 'baked' : 'missing',
      },
      si: { heightM: BUILDING_HEIGHT_M, unit: 'meter', measuredHeightM: bounds?.heightM ?? null },
      bounds,
      game: {
        placeable: true,
        craftStation: !!b.craftStation,
        buildLayer: b.craftStation ? 'camp' : 'rts',
      },
      collider: existsSync(out.replace(/\.glb$/i, '.collider.json'))
        ? `dist/production/buildings/${b.id}.collider.json`
        : null,
    });
    console.log(
      `  ${b.id}  ${bytes} b  md5=${hash}  h=${bounds?.heightM ?? '?'}  magic=${magic}`,
    );
  }

  if (DRY) {
    console.log('[dry-run] skip catalog write');
    return;
  }

  const catalog = writePrefabCatalog(rows);
  writeRuntimeJs(rows);
  wireCatalogs(catalog);

  if (UPLOAD) {
    loadFleetEnv({ quiet: false });
    const r2 = resolveR2S3Config();
    if (!r2) {
      console.error('No R2 S3 credentials (fleet env / secretnow). Skip upload.');
      console.error('Set OBJECT_STORAGE_KEY/SECRET + CF_ACCOUNT_ID, then --upload.');
      process.exitCode = 2;
      return;
    }
    const { putR2Object } = await import('./lib/r2-s3-sigv4.mjs');
    for (const p of rows) {
      const local = join(ROOT, p.mesh.local);
      for (const key of [p.mesh.r2Key, p.mesh.r2KeyOptimized]) {
        console.log('  put', key);
        await uploadGlb(local, key, putR2Object, r2);
      }
    }
    console.log('uploaded 6 buildings × 2 keys');
  } else {
    console.log('\nBake complete. Upload later: npm run buildings:upload');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
