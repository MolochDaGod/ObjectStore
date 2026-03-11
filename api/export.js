import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'api', 'v1');

function loadJSON(filename) {
  try { return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf8')); }
  catch { return null; }
}

function flattenItems(data, type) {
  const items = [];
  switch (type) {
    case 'weapons':
      for (const [cat, catData] of Object.entries(data?.categories || {})) {
        for (const item of catData.items || []) items.push({ ...item, category: cat, craftedBy: catData.craftedBy });
      }
      break;
    case 'materials':
      for (const item of data?.materials || []) items.push(item);
      break;
    case 'enemies':
      for (const item of data?.enemies || []) items.push(item);
      break;
    case 'bosses':
      for (const item of data?.bosses || []) items.push(item);
      break;
    case 'skills':
      for (const wt of data?.weaponTypes || []) {
        for (const skill of wt.skills || []) items.push({ ...skill, weaponType: wt.weaponType });
      }
      break;
    default:
      return null;
  }
  return items;
}

function toCSV(items) {
  if (!items.length) return '';
  const keys = [...new Set(items.flatMap(i => Object.keys(i)))].filter(k => typeof items[0][k] !== 'object');
  const header = keys.join(',');
  const rows = items.map(item =>
    keys.map(k => {
      const v = item[k];
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

export default function handler(req, res) {
  const type = req.query.type;
  const tier = req.query.tier ? parseInt(req.query.tier) : null;
  const category = req.query.category;
  const format = req.query.format || 'json';

  if (!type) {
    return res.status(400).json({
      error: 'Missing ?type= parameter',
      usage: '/api/export?type=weapons&tier=5&format=json',
      validTypes: ['weapons', 'armor', 'materials', 'consumables', 'enemies', 'bosses', 'skills']
    });
  }

  const fileMap = { weapons: 'weapons.json', armor: 'armor.json', materials: 'materials.json', consumables: 'consumables.json', enemies: 'enemies.json', bosses: 'bosses.json', skills: 'weaponSkills.json' };
  const filename = fileMap[type];
  if (!filename) return res.status(400).json({ error: `Unknown type: ${type}` });

  const data = loadJSON(filename);
  if (!data) return res.status(500).json({ error: `Failed to load ${filename}` });

  let items = flattenItems(data, type);
  if (!items) return res.status(400).json({ error: `Cannot flatten type: ${type}` });

  if (tier) items = items.filter(i => i.tier === tier);
  if (category) items = items.filter(i => i.category === category || i.weaponType === category);

  if (format === 'csv') {
    const csv = toCSV(items);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="objectstore-${type}.csv"`);
    return res.status(200).send(csv);
  }

  res.setHeader('Content-Disposition', `attachment; filename="objectstore-${type}.json"`);
  res.status(200).json({ type, totalItems: items.length, tier: tier || 'all', items });
}
