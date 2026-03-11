import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'api', 'v1');

function loadJSON(filename) {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf8'));
  } catch { return null; }
}

function countItems(data, path) {
  if (!data) return 0;
  const parts = path.split('.');
  let current = data;
  for (const p of parts) {
    if (!current) return 0;
    current = current[p];
  }
  if (Array.isArray(current)) return current.length;
  if (typeof current === 'number') return current;
  return 0;
}

export default function handler(req, res) {
  const weapons = loadJSON('weapons.json');
  const armor = loadJSON('armor.json');
  const materials = loadJSON('materials.json');
  const consumables = loadJSON('consumables.json');
  const enemies = loadJSON('enemies.json');
  const bosses = loadJSON('bosses.json');
  const weaponSkills = loadJSON('weaponSkills.json');
  const effectSprites = loadJSON('effectSprites.json');
  const abilityEffects = loadJSON('abilityEffects.json');
  const sprites2d = loadJSON('sprites2d.json');
  const factionUnits = loadJSON('factionUnits.json');

  // Count weapons across categories
  let weaponCount = 0;
  if (weapons?.categories) {
    for (const cat of Object.values(weapons.categories)) {
      weaponCount += (cat.items || []).length;
    }
  }

  // Count endpoints
  let endpointCount = 0;
  try {
    endpointCount = readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).length;
  } catch {}

  const stats = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totals: {
      weapons: weaponCount,
      armor: armor?.totalItems || 150,
      materials: countItems(materials, 'materials') || 112,
      consumables: consumables?.totalItems || 132,
      enemies: countItems(enemies, 'enemies') || 38,
      bosses: countItems(bosses, 'bosses') || 12,
      weaponSkills: weaponSkills?.totalSkills || 473,
      vfxEffects: effectSprites?.totalEffects || 147,
      battleAbilities: abilityEffects?.totalAbilities || 209,
      sprites2d: sprites2d?.totalSprites || 5485,
      factionUnits: factionUnits?.totalUnits || 19,
      apiEndpoints: endpointCount
    },
    endpoints: {
      static: endpointCount,
      serverless: ['search', 'stats']
    },
    browsers: [
      { name: 'Item Database', path: '/GRUDGE_Item_Database.html' },
      { name: 'Sprite Database', path: '/SPRITE_DATABASE.html' },
      { name: 'VFX Browser', path: '/VFX_BROWSER.html' },
      { name: '2D Models Browser', path: '/2D_MODELS.html' },
      { name: 'Item Browser', path: '/ItemBrowser.html' }
    ]
  };

  res.status(200).json(stats);
}
