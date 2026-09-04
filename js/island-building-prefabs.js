/**
 * Island / camp building prefabs — runtime resolver (no THREE import).
 *
 * Scale: buildings are baked at 4 m vs character 2 m.
 * Host injects THREE + GLTFLoader (same peer as main-panel / labs).
 * Identity: glTF magic + catalog byte length (reject HTML hub and stale R2 dollhouse).
 * Never GET models/_optimized/* on CDN v2.2.1 — miss re-backfills hub HTML.
 *
 * Catalog SSOT: api/v1/island-building-prefabs.json
 */
export const CDN = "https://assets.grudge-studio.com";
export const INFO = "https://info.grudge-studio.com";
export const CHARACTER_HEIGHT_M = 2;
export const BUILDING_HEIGHT_M = 4;

export const ISLAND_BUILDINGS = [
  {
    "id": "cantina",
    "name": "Cantina",
    "role": "tavern_bar",
    "r2Key": "models/buildings/cantina.glb",
    "r2KeyOptimized": "models/_optimized/buildings/cantina.glb",
    "cdnUrl": "https://assets.grudge-studio.com/models/buildings/cantina.glb",
    "infoUrl": "https://info.grudge-studio.com/models/buildings/cantina.glb",
    "bytes": 158656,
    "md5": "3f2ead9e89a8aaa076433494ddec8874",
    "heightM": 4,
    "craftStation": false
  },
  {
    "id": "tavern",
    "name": "Tavern",
    "role": "tavern",
    "r2Key": "models/buildings/tavern.glb",
    "r2KeyOptimized": "models/_optimized/buildings/tavern.glb",
    "cdnUrl": "https://assets.grudge-studio.com/models/buildings/tavern.glb",
    "infoUrl": "https://info.grudge-studio.com/models/buildings/tavern.glb",
    "bytes": 158656,
    "md5": "135ec54080525b5fe23cc73601b9d27f",
    "heightM": 4,
    "craftStation": false
  },
  {
    "id": "inn",
    "name": "Inn",
    "role": "lodging",
    "r2Key": "models/buildings/inn.glb",
    "r2KeyOptimized": "models/_optimized/buildings/inn.glb",
    "cdnUrl": "https://assets.grudge-studio.com/models/buildings/inn.glb",
    "infoUrl": "https://info.grudge-studio.com/models/buildings/inn.glb",
    "bytes": 79924,
    "md5": "e7364c95ffc24343cd0944ef51d2e014",
    "heightM": 4,
    "craftStation": false
  },
  {
    "id": "house",
    "name": "House",
    "role": "dwelling",
    "r2Key": "models/buildings/house.glb",
    "r2KeyOptimized": "models/_optimized/buildings/house.glb",
    "cdnUrl": "https://assets.grudge-studio.com/models/buildings/house.glb",
    "infoUrl": "https://info.grudge-studio.com/models/buildings/house.glb",
    "bytes": 53180,
    "md5": "ca7c36642ca961ff3e4b71099898be32",
    "heightM": 4,
    "craftStation": false
  },
  {
    "id": "blacksmith",
    "name": "Blacksmith",
    "role": "craft_station",
    "r2Key": "models/buildings/blacksmith.glb",
    "r2KeyOptimized": "models/_optimized/buildings/blacksmith.glb",
    "cdnUrl": "https://assets.grudge-studio.com/models/buildings/blacksmith.glb",
    "infoUrl": "https://info.grudge-studio.com/models/buildings/blacksmith.glb",
    "bytes": 59148,
    "md5": "8423f86eb041a1ae8fcbf2694eb1e316",
    "heightM": 4,
    "craftStation": true
  },
  {
    "id": "market",
    "name": "Market",
    "role": "market",
    "r2Key": "models/buildings/market.glb",
    "r2KeyOptimized": "models/_optimized/buildings/market.glb",
    "cdnUrl": "https://assets.grudge-studio.com/models/buildings/market.glb",
    "infoUrl": "https://info.grudge-studio.com/models/buildings/market.glb",
    "bytes": 71848,
    "md5": "bd319838fd1745923c699aa23a9367c5",
    "heightM": 4,
    "craftStation": false
  }
];

const BY_ID = Object.fromEntries(ISLAND_BUILDINGS.map((b) => [b.id, b]));

export function getIslandBuilding(id) {
  return BY_ID[id] || null;
}

export function buildingCdnUrl(id, { optimized = false } = {}) {
  const b = BY_ID[id];
  if (!b) return null;
  const key = optimized ? b.r2KeyOptimized : b.r2Key;
  return `${CDN}/${key}`;
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
  if (!b) throw new Error(`unknown island building ${id}`);
  const urls = [
    b.cdnUrl || `${CDN}/${b.r2Key}`,
    b.infoUrl || `${INFO}/${b.r2Key}`,
  ];
  let lastErr = null;
  for (const url of urls) {
    try {
      const res = await fetchImpl(url);
      if (!res.ok) {
        lastErr = new Error(`${res.status} ${url}`);
        continue;
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      if (looksLikeHtmlHub(buf) || !looksLikeGlb(buf)) {
        lastErr = new Error(`html-hub-rejected ${url}`);
        continue;
      }
      if (b.bytes && buf.byteLength !== b.bytes) {
        lastErr = new Error(`size-mismatch ${buf.byteLength}!=${b.bytes} ${url}`);
        continue;
      }
      return { id, url, bytes: buf, prefab: b };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`no GLB for ${id}`);
}

/**
 * Load into a Three scene. `fitToSi` only if baked height drifted > 12%.
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
    if (!root) throw new Error(`empty scene ${id}`);
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
