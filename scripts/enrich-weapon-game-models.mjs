#!/usr/bin/env node
/**
 * Map weapon prefabs to game-ready model URLs from models3d-game.json.
 * Output: api/v1/weapon-model-game-urls.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { API_DIR } from './lib/model-game-utils.mjs';

const OUT = path.join(API_DIR, 'weapon-model-game-urls.json');

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(API_DIR, name), 'utf8'));
}

function normKey(name = '') {
  return String(name).toLowerCase().replace(/\.glb$/i, '').replace(/[^a-z0-9]+/g, '');
}

const CATEGORY_FOLDER = {
  swords: 'sword', axes1h: 'axe', greataxes: 'greataxe', greatswords: 'greatsword',
  daggers: 'dagger', bows: 'bow', crossbows: 'crossbow', guns: 'gun',
  hammers1h: 'hammer', hammers2h: 'hammer', spears: 'spear', scythes: 'scythe',
  maces: 'mace', shields: 'shield', wands: 'wand', tools: 'hammer',
  staves: 'staff', firestaves: 'staff', froststaves: 'staff', holystaves: 'staff',
  holystaves: 'staff', lightningstaves: 'staff', naturestaves: 'staff', arcanestaves: 'staff',
  'offhand-tome': 'tome', firetomes: 'tome', frosttomes: 'tome', naturetomes: 'tome',
  holytomes: 'tome', arcanetomes: 'tome', lightningtomes: 'tome',
};

const FOLDER_DEFAULT_MODEL = {
  sword: 'Sword.glb', axe: 'HandAxe.glb', greataxe: 'Greataxe.glb', greatsword: 'Greatsword.glb',
  dagger: 'Dagger.glb', bow: 'Bow.glb', crossbow: 'Crossbow.glb', gun: 'AR.glb',
  hammer: 'Hammer.glb', spear: 'Spear.glb', scythe: 'Scythe.glb', mace: 'Mace.glb',
  shield: 'Shield.glb', wand: 'Wand.glb', staff: 'Staff.glb', tome: 'Spellbook.glb',
};

function categoryFolder(cat = '') {
  return CATEGORY_FOLDER[String(cat).toLowerCase()] || String(cat).toLowerCase().replace(/s$/, '');
}

function main() {
  const game = load('models3d-game.json');
  const prefabs = fs.existsSync(path.join(API_DIR, 'master-weapon-prefabs.json'))
    ? load('master-weapon-prefabs.json')
    : { prefabs: [] };

  const byName = new Map();
  const byPath = new Map();
  const byFolder = new Map();
  for (const m of game.models || []) {
    if (m.category !== 'weapons' && m.kind !== 'weapon') continue;
    const key = normKey(m.name);
    if (key) byName.set(key, m);
    if (m.sourcePath) byPath.set(m.sourcePath, m);
    const folder = m.sourcePath?.match(/\/weapons\/([^/]+)\//)?.[1];
    if (folder) {
      if (!byFolder.has(folder)) byFolder.set(folder, []);
      byFolder.get(folder).push(m);
    }
  }

  function defaultForCategory(cat) {
    const folder = categoryFolder(cat);
    const preferred = FOLDER_DEFAULT_MODEL[folder];
    if (preferred) {
      const hit = byPath.get(`models/weapons/${folder}/${preferred}`);
      if (hit) return hit;
    }
    const pool = byFolder.get(folder) || [];
    return pool.find((m) => m.textureStatus === 'embedded') || pool.find((m) => !/\.FBX\.glb$/i.test(m.name)) || pool[0];
  }

  const weaponModels = (game.models || []).filter((m) => m.kind === 'weapon' || (m.category === 'weapons' && m.kind !== 'animation-clip'));
  const mappings = [];
  const unmatched = [];

  for (const p of prefabs.prefabs || []) {
    const base = normKey(p.baseName || p.name);
    const cat = String(p.category || '').toLowerCase();
    let model = byName.get(base);
    if (!model) {
      const candidates = weaponModels.filter((m) => {
        const n = normKey(m.name);
        return n.includes(base) || base.includes(n);
      });
      if (cat) {
        const catHit = candidates.find((m) => m.sourcePath?.includes(`/weapons/${cat}/`));
        model = catHit || candidates[0];
      } else {
        model = candidates[0];
      }
    }
    let fallback = false;
    if (!model?._gameReadyUrl) {
      model = defaultForCategory(cat);
      fallback = true;
    }
    if (!model?._gameReadyUrl) {
      unmatched.push({ uuid: p.uuid, name: p.name, baseName: p.baseName, category: p.category });
      continue;
    }
    mappings.push({
      prefabUuid: p.uuid,
      prefabName: p.name,
      weaponType: p.weaponType,
      category: p.category,
      grudgeUUID: model.grudgeUUID,
      sourcePath: model.sourcePath,
      gameReadyPath: model.gameReadyPath,
      modelUrl: model._gameReadyUrl,
      attachmentProfile: model.attachmentProfile,
      textureStatus: model.textureStatus,
      categoryFallback: fallback,
    });
  }

  const output = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    description: 'Weapon prefab → game-ready GLB URL mappings for runtime rendering',
    summary: {
      prefabs: (prefabs.prefabs || []).length,
      mapped: mappings.length,
      unmatched: unmatched.length,
      weaponModels: weaponModels.length,
    },
    mappings,
    unmatched: unmatched.slice(0, 50),
  };

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
  console.log(`[enrich:weapon-game-models] Mapped ${mappings.length} prefabs (${unmatched.length} unmatched)`);
}

main();