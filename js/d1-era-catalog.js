/**
 * D1 + era + prefab catalog for 3D_MODELS.html.
 * D1 is the asset INDEX; binaries on assets.grudge-studio.com.
 */
const CDN = 'https://assets.grudge-studio.com';
const D1 = 'https://objectstore.grudge-studio.com/v1/assets';
const INFO = 'https://info.grudge-studio.com/api/v1';
const PLAY_RACES = ['human', 'barbarian', 'elf', 'dwarf', 'orc', 'undead'];

export function recognizeEra(path, rules) {
  const p = String(path || '').replace(/\\/g, '/');
  const list = rules?.pathRules || rules?.paths || [];
  for (const r of list) {
    try {
      if (r.match && new RegExp(r.match, 'i').test(p)) return r.era || 'shared';
    } catch { /* */ }
  }
  if (/grudge6|toon-rts|warlords|nature\/|haven_shore/i.test(p)) return 'warlords';
  if (/nexus|modern|rifle|urban/i.test(p)) return 'nexus';
  if (/armada|space|mecha|ship/i.test(p)) return 'armada';
  if (/voxel|vox\//i.test(p)) return 'voxel';
  return 'shared';
}

function d1ItemToModel(it, eraRules) {
  const key = String(it.key || '').replace(/^\/+/, '');
  if (!/\.(glb|gltf)$/i.test(key) && !/\.(glb|gltf)$/i.test(it.filename || '')) return null;
  const path = key || `models/${it.filename}`;
  return {
    name: it.filename || path.split('/').pop(),
    format: 'GLB',
    path,
    url: `${CDN}/${path}`,
    category: it.category || 'mesh',
    era: recognizeEra(path, eraRules),
    sizeKB: Math.round((it.size || 0) / 1024),
    source: 'd1',
    d1Id: it.id,
    tags: it.tags || [],
    uuid: it.id ? `D1-${it.id}` : '',
    mime: it.mime,
  };
}

async function pageD1(prefix, maxPages = 8) {
  const out = [];
  let offset = 0;
  for (let i = 0; i < maxPages; i++) {
    const u = `${D1}?prefix=${encodeURIComponent(prefix)}&limit=200&offset=${offset}`;
    const r = await fetch(u, { signal: AbortSignal.timeout(12000) });
    if (!r.ok) break;
    const j = await r.json();
    for (const it of j.items || []) out.push(it);
    if (!j.hasMore) break;
    offset = j.nextOffset ?? offset + (j.items || []).length;
  }
  return out;
}

export async function loadD1EraCatalog() {
  const [eraRec, taxonomy, prefabs] = await Promise.all([
    fetch(`${INFO}/era-recognition.json`).then((r) => r.json()).catch(() => ({})),
    fetch(`${INFO}/era-asset-taxonomy.json`).then((r) => r.json()).catch(() => ({})),
    fetch(`${INFO}/warlords-entity-prefabs.json`).then((r) => r.json()).catch(() => ({ prefabs: [] })),
  ]);
  const d1Rows = await pageD1('models/', 10);
  const byPath = new Map();
  for (const it of d1Rows) {
    const m = d1ItemToModel(it, eraRec);
    if (m) byPath.set(m.path, m);
  }
  for (const race of PLAY_RACES) {
    const path = `asset-packs/toon-rts-characters/glb/characters/${race}.glb`;
    byPath.set(path, {
      name: `play-${race}.glb`,
      format: 'GLB',
      path,
      url: `${CDN}/${path}`,
      category: 'play-kit',
      era: 'warlords',
      sizeKB: 0,
      source: 'loadRaceKit',
      uuid: `PLAY-${race}`,
      tags: ['play', 'toon', 'grudge6'],
    });
  }
  for (const p of prefabs.prefabs || []) {
    const key = p.mesh?.r2Key || p.mesh?.path;
    if (!key) continue;
    const path = String(key).replace(/^\/+/, '');
    const url = p.mesh.cdnUrl || `${CDN}/${path}`;
    if (!byPath.has(path)) {
      byPath.set(path, {
        name: (p.displayName || p.name || path.split('/').pop()) + '.glb',
        format: 'GLB',
        path,
        url,
        category: p.category || p.kind || 'prefab',
        era: p.era || 'warlords',
        sizeKB: 0,
        source: 'entity-prefab',
        uuid: p.prefabId || '',
        tags: p.tags || [],
        prefabId: p.prefabId,
        icon: p.icon?.cdnUrl,
      });
    } else {
      const cur = byPath.get(path);
      cur.prefabId = p.prefabId;
      cur.era = cur.era || p.era;
      cur.category = cur.category === 'mesh' ? (p.category || cur.category) : cur.category;
    }
  }
  const models = [...byPath.values()];
  const eras = {};
  for (const m of models) eras[m.era || 'shared'] = (eras[m.era || 'shared'] || 0) + 1;
  return {
    models,
    eras,
    taxonomy,
    d1Total: d1Rows.length,
    cdn: CDN,
  };
}
