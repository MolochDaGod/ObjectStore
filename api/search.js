import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'api', 'v1');

function loadJSON(filename) {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf8'));
  } catch { return null; }
}

function searchWeapons(data, q) {
  const results = [];
  if (!data?.categories) return results;
  for (const [cat, catData] of Object.entries(data.categories)) {
    for (const item of catData.items || []) {
      if (item.name?.toLowerCase().includes(q) || item.id?.toLowerCase().includes(q) ||
          item.lore?.toLowerCase().includes(q)) {
        results.push({ type: 'weapon', category: cat, id: item.id, name: item.name, lore: item.lore });
      }
    }
  }
  return results;
}

function searchArmor(data, q) {
  const results = [];
  if (!data?.slots) return results;
  for (const [slot, materials] of Object.entries(data.slots)) {
    for (const [mat, items] of Object.entries(materials)) {
      for (const item of items || []) {
        if (item.name?.toLowerCase().includes(q) || item.id?.toLowerCase().includes(q)) {
          results.push({ type: 'armor', slot, material: mat, id: item.id, name: item.name });
        }
      }
    }
  }
  return results;
}

function searchMaterials(data, q) {
  const results = [];
  for (const item of data?.materials || []) {
    if (item.name?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q)) {
      results.push({ type: 'material', id: item.id, name: item.name, category: item.category, tier: item.tier });
    }
  }
  return results;
}

function searchConsumables(data, q) {
  const results = [];
  for (const [cat, items] of Object.entries(data?.categories || {})) {
    for (const item of items || []) {
      if (item.name?.toLowerCase().includes(q) || item.id?.toLowerCase().includes(q)) {
        results.push({ type: 'consumable', category: cat, id: item.id, name: item.name });
      }
    }
  }
  return results;
}

function searchEnemies(data, q) {
  const results = [];
  for (const enemy of data?.enemies || []) {
    if (enemy.name?.toLowerCase().includes(q) || enemy.id?.toLowerCase().includes(q)) {
      results.push({ type: 'enemy', id: enemy.id, name: enemy.name, tier: enemy.tier });
    }
  }
  return results;
}

function searchBosses(data, q) {
  const results = [];
  for (const boss of data?.bosses || []) {
    if (boss.name?.toLowerCase().includes(q) || boss.id?.toLowerCase().includes(q)) {
      results.push({ type: 'boss', id: boss.id, name: boss.name });
    }
  }
  return results;
}

function searchSkills(data, q) {
  const results = [];
  for (const wt of data?.weaponTypes || []) {
    for (const skill of wt.skills || []) {
      if (skill.name?.toLowerCase().includes(q) || skill.id?.toLowerCase().includes(q) ||
          skill.description?.toLowerCase().includes(q)) {
        results.push({ type: 'skill', weaponType: wt.weaponType, id: skill.id, name: skill.name, slot: skill.slot });
      }
    }
  }
  return results;
}

function searchSprites2d(data, q) {
  const results = [];
  if (!data?.categories) return results;
  for (const [cat, catData] of Object.entries(data.categories)) {
    for (const item of catData.items || []) {
      if (item.name?.toLowerCase().includes(q) || item.path?.toLowerCase().includes(q)) {
        results.push({ type: 'sprite', category: cat, name: item.name, path: item.path, source: item.source });
      }
      if (results.length >= 50) break;
    }
    if (results.length >= 50) break;
  }
  return results;
}

export default function handler(req, res) {
  const q = (req.query.q || '').toLowerCase().trim();
  const type = req.query.type || 'all';
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  if (!q) {
    return res.status(400).json({ error: 'Missing ?q= search query', usage: '/api/search?q=iron&type=all&limit=50' });
  }

  let results = [];
  const sources = {
    weapons: () => searchWeapons(loadJSON('weapons.json'), q),
    armor: () => searchArmor(loadJSON('armor.json'), q),
    materials: () => searchMaterials(loadJSON('materials.json'), q),
    consumables: () => searchConsumables(loadJSON('consumables.json'), q),
    enemies: () => searchEnemies(loadJSON('enemies.json'), q),
    bosses: () => searchBosses(loadJSON('bosses.json'), q),
    skills: () => searchSkills(loadJSON('weaponSkills.json'), q),
    sprites: () => searchSprites2d(loadJSON('sprites2d.json'), q),
  };

  if (type === 'all') {
    for (const fn of Object.values(sources)) {
      results.push(...fn());
    }
  } else if (sources[type]) {
    results = sources[type]();
  } else {
    return res.status(400).json({ error: `Unknown type: ${type}`, validTypes: Object.keys(sources) });
  }

  results = results.slice(0, limit);

  res.status(200).json({
    query: q,
    type,
    totalResults: results.length,
    results
  });
}
