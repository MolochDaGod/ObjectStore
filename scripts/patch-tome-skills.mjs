#!/usr/bin/env node
/**
 * patch-tome-skills.mjs — Replaces the TOME weapon type in master-weaponSkills.json
 * with the new mainhand-dependent ability system from data/csv/tome-skills.csv.
 *
 * The tome skill system:
 *   - Slots 1,2,3 (primary/secondary/ultimate) are tome-specific (hold RMB + press key)
 *   - Ability slot changes based on mainhand weapon: SWORD, MACE, AXE, DAGGER, HAMMER, GUN
 *   - Each mainhand combo has its own skill with unique mechanics
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV_PATH = join(ROOT, 'data', 'csv', 'tome-skills.csv');
const API_PATH = join(ROOT, 'api', 'v1', 'master-weaponSkills.json');

// UUID generator
const TS = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
let seq = 0;
function genUUID(name) {
  const s = String(seq++).padStart(6, '0');
  const h = createHash('md5').update('TOME_' + name + s).digest('hex').slice(0, 8).toUpperCase();
  return `SKIL-${TS}-${s}-${h}`;
}

// Parse CSV
function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = '', inQ = false;
    for (const c of line) {
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { vals.push(cur); cur = ''; continue; }
      cur += c;
    }
    vals.push(cur);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
    return obj;
  });
}

// Load
const csvRows = parseCSV(readFileSync(CSV_PATH, 'utf-8'));
const apiData = JSON.parse(readFileSync(API_PATH, 'utf-8'));
const tomeIdx = apiData.weaponTypes.findIndex(w => w.id === 'TOME');

if (tomeIdx === -1) {
  console.error('TOME weapon type not found in master-weaponSkills.json');
  process.exit(1);
}

// Group CSV rows by slot type
const slotGroups = {};
for (const row of csvRows) {
  const slot = row.slotType;
  if (!slotGroups[slot]) slotGroups[slot] = [];
  slotGroups[slot].push(row);
}

// Build new tome definition
const newTome = {
  id: 'TOME',
  name: 'Tome',
  icon: '/icons/weapons/tomes/arcane-tome.png',
  classes: [],
  mechanic: {
    description: 'Offhand tome. Hold RMB to access tome skills on slots 1-3. Ability slot (3) changes based on mainhand weapon type.',
    inputMode: 'rmb_hold',
    abilityDependsOn: 'mainhand',
    validMainhands: ['SWORD', 'MACE', 'AXE', 'DAGGER', 'HAMMER', 'GUN'],
    tomeElements: ['fire', 'frost', 'lightning', 'nature', 'arcane', 'holy'],
  },
  tomeIcons: {
    fire: '/icons/weapons/tomes/fire-tome.png',
    frost: '/icons/weapons/tomes/frost-tome.png',
    lightning: '/icons/weapons/tomes/lightning-tome.png',
    nature: '/icons/weapons/tomes/nature-tome.png',
    arcane: '/icons/weapons/tomes/arcane-tome.png',
  },
  totalSkills: csvRows.length,
  slots: [],
};

// Build slots
const slotConfig = [
  { type: 'primary', label: 'PRIMARY (RMB+1)', unlockTier: 1 },
  { type: 'secondary', label: 'SECONDARY (RMB+2)', unlockTier: 2 },
  { type: 'ability', label: 'ABILITY (Mainhand Combo)', unlockTier: 2 },
  { type: 'ultimate', label: 'ULTIMATE (RMB+4)', unlockTier: 3 },
];

for (const cfg of slotConfig) {
  const rows = slotGroups[cfg.type] || [];
  const skills = rows.map(r => ({
    uuid: genUUID(r.skillId),
    id: r.skillId,
    name: r.name,
    description: r.description,
    icon: r.icon || '/icons/weapons/tomes/arcane-tome.png',
    tier: parseInt(r.tier) || 1,
    damage: parseInt(r.damage) || 0,
    cooldown: parseInt(r.cooldown) || 0,
    castTime: r.castTime ? parseFloat(r.castTime) : null,
    range: r.range ? parseInt(r.range) : null,
    projectile: null,
    damageType: r.damageType || 'arcane',
    animation: null,
    physics: null,
    effects: r.effects ? r.effects.split(';').map(e => e.trim()) : [],
    mainhandReq: r.mainhandReq || null,
    originalIcon: r.icon || '/icons/weapons/tomes/arcane-tome.png',
  }));

  newTome.slots.push({
    type: cfg.type,
    label: cfg.label,
    unlockTier: cfg.unlockTier,
    skills,
  });
}

// Replace in API data
apiData.weaponTypes[tomeIdx] = newTome;

// Recount total skills
let totalSkills = 0;
for (const wt of apiData.weaponTypes) {
  let wtTotal = 0;
  for (const slot of wt.slots) wtTotal += slot.skills.length;
  wt.totalSkills = wtTotal;
  totalSkills += wtTotal;
}
apiData.totalSkills = totalSkills;
apiData.generated = new Date().toISOString();

// Write
writeFileSync(API_PATH, JSON.stringify(apiData, null, 2));
console.log(`[patch-tome] Replaced TOME with ${csvRows.length} skills (${newTome.slots.map(s => s.type + ':' + s.skills.length).join(', ')})`);
console.log(`[patch-tome] Total weapon skills: ${totalSkills}`);
console.log(`[patch-tome] Ability slot skills by mainhand: ${slotGroups.ability.map(r => r.mainhandReq || 'any').join(', ')}`);
