#!/usr/bin/env node
/**
 * Export Profession Trees → api/v1/master-professionTrees.json
 * 
 * Reads the 5 profession data files from GrudgeBuilder and exports
 * them as canonical ObjectStore JSON with full visual metadata.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GRUDGE_BUILDER = 'C:\\Users\\nugye\\Documents\\1111111\\GrudgeBuilder';
const CRAFTING_DIR = path.join(GRUDGE_BUILDER, 'client', 'src', 'data', 'crafting');
const OUT_PATH = path.join(ROOT, 'api', 'v1', 'master-professionTrees.json');

console.log('📦 Exporting profession skill trees from GrudgeBuilder...');

// UUID generator
let _seq = 0;
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return ((h >>> 0) ^ ((h >>> 0) >>> 16)).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}
function uuid(prefix, meta = '') {
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
  _seq++;
  return `${prefix}-${ts}-${_seq.toString(16).toUpperCase().padStart(6,'0')}-${fnv1a(`${prefix}-${ts}-${_seq}-${meta}-${Math.random()}`)}`;
}

// Branch color definitions (from TreeVisualizer.tsx)
const BRANCH_COLORS = {
  Core:            { stroke: '#f97316', fill: 'rgba(249,115,22,0.2)' },
  Weapons:         { stroke: '#6366f1', fill: 'rgba(99,102,241,0.2)' },
  Gathering:       { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.2)' },
  Armor:           { stroke: '#ef4444', fill: 'rgba(239,68,68,0.2)' },
  Butchery:        { stroke: '#ef4444', fill: 'rgba(239,68,68,0.2)' },
  Baking:          { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.2)' },
  Alchemy:         { stroke: '#22c55e', fill: 'rgba(34,197,94,0.2)' },
  Forestry:        { stroke: '#22c55e', fill: 'rgba(34,197,94,0.2)' },
  Leatherworking:  { stroke: '#a16207', fill: 'rgba(161,98,7,0.2)' },
  Bowcraft:        { stroke: '#10b981', fill: 'rgba(16,185,129,0.2)' },
  Mining:          { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.2)' },
  Smelting:        { stroke: '#ef4444', fill: 'rgba(239,68,68,0.2)' },
  Weaponsmithing:  { stroke: '#6366f1', fill: 'rgba(99,102,241,0.2)' },
  Nexus:           { stroke: '#fbbf24', fill: 'rgba(251,191,36,0.3)' },
  Enchanter:       { stroke: '#f472b6', fill: 'rgba(244,114,182,0.25)' },
  Spellwright:     { stroke: '#60a5fa', fill: 'rgba(96,165,250,0.25)' },
  Arcanist:        { stroke: '#fb7185', fill: 'rgba(251,113,133,0.25)' },
  'Arcanist Forge':{ stroke: '#fb7185', fill: 'rgba(251,113,133,0.25)' },
  Soulbinder:      { stroke: '#2dd4bf', fill: 'rgba(45,212,191,0.25)' },
  Chronoweaver:    { stroke: '#c084fc', fill: 'rgba(192,132,252,0.25)' },
  Weaponry:        { stroke: '#f97316', fill: 'rgba(249,115,22,0.2)' },
  Automata:        { stroke: '#64748b', fill: 'rgba(100,116,139,0.2)' },
  Siege:           { stroke: '#dc2626', fill: 'rgba(220,38,38,0.2)' },
};

// Profession metadata
const PROF_META = {
  Miner:    { role: 'Weaponsmith & Armorsmith', icon: '⛏️', color: '#f59e0b', bgImage: '/images/professions/dark_underground_mine_with_glowing_crystals.png', iconImage: '/images/professions/miner_profession_game_icon.png' },
  Forester: { role: 'Forester Specialization', icon: '🌲', color: '#22c55e', bgImage: '/images/professions/ancient_mystical_forest_with_glowing_particles.png', iconImage: '/images/professions/forester_profession_game_icon.png' },
  Mystic:   { role: 'Arcane Crafter & Enchanter', icon: '🔮', color: '#a855f7', bgImage: '/images/professions/cosmic_arcane_void_magic_background.png', iconImage: '/images/professions/mystic_profession_game_icon.png' },
  Chef:     { role: 'Culinary Master & Alchemist', icon: '🍲', color: '#f97316', bgImage: '/images/professions/rustic_fantasy_kitchen_hearth.png', iconImage: '/images/professions/chef_profession_game_icon.png' },
  Engineer: { role: 'Mechanist & Siege Master', icon: '🔧', color: '#64748b', bgImage: '/images/professions/steampunk_blueprint_background_with_gears.png', iconImage: '/images/professions/engineer_profession_game_icon.png' },
};

// Parse a TS profession file to extract treeData array
function parseProfessionFile(filePath, profName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract treeData array block
  const treeMatch = content.match(/treeData:\s*\[([\s\S]*?)\]\s*,\s*(?:recipes|inventory)/);
  if (!treeMatch) {
    console.warn(`  ⚠ Could not find treeData in ${path.basename(filePath)}`);
    return [];
  }
  
  const treeBlock = treeMatch[1];
  const nodes = [];
  
  // Parse each node object
  const nodeRegex = /\{\s*(?:[\s\S]*?)\bid:\s*(\d+)\b[\s\S]*?\}/g;
  let match;
  
  while ((match = nodeRegex.exec(treeBlock)) !== null) {
    const block = match[0];
    const id = parseInt(match[1]);
    
    const getName = (b) => { const m = b.match(/\bn:\s*"([^"]+)"/); return m ? m[1] : `Node ${id}`; };
    const getNum = (b, key) => { const m = b.match(new RegExp(`\\b${key}:\\s*(\\d+)`)); return m ? parseInt(m[1]) : 0; };
    const getParent = (b) => { const m = b.match(/\bp:\s*(null|\d+)/); return m && m[1] !== 'null' ? parseInt(m[1]) : null; };
    const getStr = (b, key) => { const m = b.match(new RegExp(`\\b${key}:\\s*"([^"]+)"`)); return m ? m[1] : null; };
    const getBranch = (b) => { const m = b.match(/\bbranch:\s*"([^"]+)"/); return m ? m[1] : 'Core'; };
    const getNodeType = (b) => { const m = b.match(/\bnodeType:\s*"([^"]+)"/); return m ? m[1] : 'stat'; };
    const getDesc = (b) => { const m = b.match(/\bdesc:\s*"([^"]+)"/); return m ? m[1] : ''; };
    
    // Parse bonuses array
    const bonuses = [];
    const bonusRegex = /\{\s*type:\s*"([^"]+)"(?:,\s*value:\s*(\d+))?(?:,\s*target:\s*"([^"]+)")?\s*\}/g;
    const bonusBlock = block.match(/bonuses:\s*\[([\s\S]*?)\]/);
    if (bonusBlock) {
      let bm;
      while ((bm = bonusRegex.exec(bonusBlock[1])) !== null) {
        bonuses.push({ type: bm[1], value: bm[2] ? parseInt(bm[2]) : 0, target: bm[3] || 'all' });
      }
    }
    
    // Parse unlocks array
    const unlocks = [];
    const unlockBlock = block.match(/unlocks:\s*\[([\s\S]*?)\]/);
    if (unlockBlock) {
      const ulMatches = unlockBlock[1].matchAll(/"([^"]+)"/g);
      for (const um of ulMatches) unlocks.push(um[1]);
    }
    
    const branch = getBranch(block);
    const nodeType = getNodeType(block);
    
    nodes.push({
      uuid: uuid('NODE', `${profName}-${id}`),
      id,
      name: getName(block),
      x: getNum(block, 'x'),
      y: getNum(block, 'y'),
      reqLevel: getNum(block, 'req'),
      parent: getParent(block),
      branch,
      nodeType,
      description: getDesc(block),
      bonuses,
      unlocks,
      branchColor: BRANCH_COLORS[branch] || BRANCH_COLORS.Core,
    });
  }
  
  return nodes;
}

// Process all professions
const professions = {};
const files = { Miner: 'miner.ts', Forester: 'forester.ts', Mystic: 'mystic.ts', Chef: 'chef.ts', Engineer: 'engineer.ts' };

let totalNodes = 0;
for (const [name, file] of Object.entries(files)) {
  const filePath = path.join(CRAFTING_DIR, file);
  if (!fs.existsSync(filePath)) { console.warn(`  ⚠ ${file} not found`); continue; }
  
  const nodes = parseProfessionFile(filePath, name);
  const branches = [...new Set(nodes.map(n => n.branch))];
  const meta = PROF_META[name];
  
  professions[name.toLowerCase()] = {
    uuid: uuid('PROF', name),
    name,
    role: meta.role,
    icon: meta.icon,
    color: meta.color,
    bgImage: meta.bgImage,
    iconImage: meta.iconImage,
    totalNodes: nodes.length,
    branches: branches.map(b => ({
      name: b,
      color: BRANCH_COLORS[b] || BRANCH_COLORS.Core,
      nodeCount: nodes.filter(n => n.branch === b).length,
    })),
    nodes,
  };
  
  totalNodes += nodes.length;
  console.log(`  ✅ ${name}: ${nodes.length} nodes, ${branches.length} branches (${branches.join(', ')})`);
}

// Node type definitions for the viewer
const nodeTypes = {
  stat:   { shape: 'circle',  label: 'Stat Boost',  color: '#4ade80' },
  effect: { shape: 'diamond', label: 'Effect',       color: '#c084fc' },
  combat: { shape: 'star',    label: 'Combat',       color: '#facc15' },
  recipe: { shape: 'scroll',  label: 'Recipe',       color: '#fbbf24' },
};

const output = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  totalProfessions: Object.keys(professions).length,
  totalNodes,
  nodeTypes,
  branchColors: BRANCH_COLORS,
  professions,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
console.log(`\n✅ Exported ${Object.keys(professions).length} professions, ${totalNodes} total nodes`);
console.log(`   → ${OUT_PATH}`);
