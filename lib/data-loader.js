/**
 * Grudge Game Data Hub - Data Loader (D1/D6 consumer)
 *
 * Single source of truth = ObjectStore. This loader prefers the ObjectStore
 * API endpoints at runtime so edits to ObjectStore propagate without a hub
 * redeploy. A local fallback ships with the Vercel build (prefetch) and is
 * used if the network call fails or the user is offline.
 *
 * Precedence:
 *   1. ObjectStore /api/v1/<file>  (runtime revalidate)
 *   2. Hub-local /data/<file>      (build-time prefetch fallback)
 */

const CACHE = {};
// Remote precedence: CF ObjectStore API (primary) -> CF CDN (edge cache) ->
// GitHub Pages (legacy fallback) -> local /data (build-time prefetch).
const REMOTES = [
  'https://molochdagod.github.io/ObjectStore/api/v1',
  'https://objectstore.grudge-studio.com/api/v1',
  'https://assets.grudge-studio.com/api/v1',
];

async function fetchOk(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function loadJSON(path) {
  if (CACHE[path]) return CACHE[path];
  for (const base of REMOTES) {
    const data = await fetchOk(`${base}/${path}`);
    if (data) { CACHE[path] = data; return data; }
  }
  const local = await fetchOk(`/data/${path}`);
  if (local) { CACHE[path] = local; return local; }
  console.error(`[DataLoader] Failed to load ${path} from any source`);
  return null;
}

export async function loadMasterItems()       { return loadJSON('master-items.json'); }
export async function loadMasterWeapons()     { return loadJSON('master-weapons.json'); }
export async function loadMasterArmor()       { return loadJSON('master-armor.json'); }
export async function loadMasterConsumables() { return loadJSON('master-consumables.json'); }
export async function loadMasterRecipes()     { return loadJSON('master-recipes.json'); }
export async function loadMasterMaterials()   { return loadJSON('master-materials.json'); }
export async function loadMasterAttributes()  { return loadJSON('master-attributes.json'); }
export async function loadMasterArtifacts()    { return loadJSON('master-artifacts.json'); }
export async function loadMasterProfessions()  { return loadJSON('master-professions.json'); }
export async function loadMasterSkillTrees()   { return loadJSON('master-skillTrees.json'); }
export async function loadMasterWeaponSkills() { return loadJSON('master-weaponSkills.json'); }
export async function loadMasterRegistry()     { return loadJSON('master-registry.json'); }
export async function loadGameDataManifest() { return loadJSON('game-data-manifest.json'); }
export async function loadGamesLibrary()     { return loadJSON('games-library.json'); }
export async function loadCanonicalItemsManifest() { return loadJSON('canonical-items-manifest.json'); }
export async function loadWeaponPrefabs()    { return loadJSON('master-weapon-prefabs.json'); }
export async function loadT0Weapons()        { return loadJSON('t0-weapons.json'); }
export async function loadUmmorpgBridge()    { return loadJSON('ummorpg-systems-bridge.json'); }
export async function loadHarvestNodes()     { return loadJSON('master-harvest-nodes.json'); }
export async function loadCanonicalEquipment() { return loadJSON('_meta/canonical-equipment-pattern.json'); }
export async function loadWeaponStatBridge()   { return loadJSON('weapon-stat-bridge.json'); }
export async function loadStatPattern()        { return loadJSON('_meta/weapon-stats-attributes.json'); }

export function clearCache() { Object.keys(CACHE).forEach(k => delete CACHE[k]); }
