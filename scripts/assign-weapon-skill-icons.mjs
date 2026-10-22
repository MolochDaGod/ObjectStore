/**
 * Bind every catalog skill to one PNG from icon-path-index.json.
 * Law: same skill id (and same skill name) → same PNG on every weapon that offers it.
 * Never sprite sheets. Never a weapon-item PNG for a skill tree.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CDN = 'https://assets.grudge-studio.com';
const idx = JSON.parse(readFileSync(join(root, 'api/v1/icon-path-index.json'), 'utf8'));
const INDEX = idx.index || {};

const VALID_MAINHANDS = ['SWORD', 'DAGGER', 'HAMMER', 'MACE', 'AXE'];

const CLASS_DIRS = {
  SWORD: ['swordsman', 'barbarian'],
  AXE: ['barbarian', 'blacksmith-skill'],
  GREATSWORD: ['swordsman', 'barbarian'],
  GREATAXE: ['barbarian', 'blacksmith-skill'],
  DAGGER: ['thief', 'pirate'],
  BOW: ['archer', 'hunter'],
  CROSSBOW: ['crossbowman', 'hunter'],
  GUN: ['pirate', 'hunter'],
  STAFF: ['firemage', 'frostmage', 'earthmage', 'bloodmage'],
  HAMMER: ['paladin', 'blacksmith-skill'],
  SHIELD: ['paladin', 'barbarian'],
  SPEAR: ['hunter', 'paladin'],
  TOME: ['warlock', 'firemage'],
  WAND: ['warlock', 'frostmage'],
  MACE: ['paladin', 'bloodmage'],
  SCYTHE: ['necromancer', 'druid'],
  TOOL: ['farmer', 'engineer', 'tannery'],
  CLAW: ['druid', 'thief', 'barbarian'],
};

const GROUPS = [
  ['slash', 'cleave', 'cut', 'swipe', 'slice', 'rend'],
  ['stab', 'thrust', 'pierce', 'impale', 'jab', 'skewer'],
  ['bash', 'smash', 'slam', 'crush', 'blow', 'stomp', 'pound', 'concussive'],
  ['shot', 'arrow', 'bolt', 'volley', 'barrage', 'multishot'],
  ['fire', 'flame', 'inferno', 'ember', 'meteor', 'ignite', 'hellfire', 'burn'],
  ['frost', 'ice', 'freeze', 'glacial', 'blizzard', 'cryo'],
  ['lightning', 'thunder', 'storm', 'tempest', 'shock', 'chain'],
  ['heal', 'rejuvenate', 'soothing', 'holy', 'divine', 'bless', 'purify'],
  ['shield', 'guard', 'ward', 'block', 'barrier', 'bulwark', 'aegis', 'deflect', 'parry'],
  ['poison', 'venom', 'toxin'],
  ['bleed', 'blood', 'lacerate', 'wound'],
  ['shadow', 'stealth', 'ambush', 'backstab', 'night'],
  ['taunt', 'shout', 'roar', 'demoral'],
  ['trap', 'snare', 'entangle', 'root'],
  ['execute', 'finish', 'kill'],
  ['charge', 'rush', 'lunge', 'sprint'],
  ['spin', 'whirl', 'cyclone', 'carnage'],
  ['form', 'bear', 'wolf', 'raptor', 'spider', 'cheetah', 'bird', 'claw', 'beast', 'feral'],
  ['chop', 'mine', 'skin', 'pry', 'harvest', 'gather', 'axe'],
  ['arcane', 'spell', 'bolt', 'nova', 'cataclysm', 'grimoire', 'tome'],
  ['reload', 'draw', 'quiver', 'aim', 'sniper', 'headshot'],
  ['stance', 'brace', 'iron', 'hide', 'bark'],
];

function tokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function stem(path) {
  return (path.split('/').pop() || '')
    .replace(/\.png$/i, '')
    .replace(/^(skill|ability|spell)_/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+\d+$/, '')
    .trim()
    .toLowerCase();
}

function groupHits(a, b) {
  let n = 0;
  for (const g of GROUPS) {
    const ha = g.some((w) => a.has(w));
    const hb = g.some((w) => b.has(w));
    if (ha && hb) n += 1;
  }
  return n;
}

const named = [];
const classByDir = {};
const numberedClass = [];

for (const path of Object.keys(INDEX)) {
  if (!/\.png$/i.test(path)) continue;
  if (/sheet|atlas|sprite/i.test(path)) continue;
  const cat = INDEX[path].category || '';
  if (['weapon', 'armor', 'item', 'consumable', 'material', 'entity', 'ui', 'race', 'faction'].includes(cat)) continue;
  if (/\/pack\/weapons\//i.test(path) || /\/wcs\/weapons\//i.test(path) || /\/weapons\/tomes\//i.test(path)) continue;

  if (/\/skills\/class\/([^/]+)\//.test(path)) {
    const dir = path.match(/\/skills\/class\/([^/]+)\//)[1];
    (classByDir[dir] ||= []).push(path);
    numberedClass.push(path);
    continue;
  }

  const file = path.split('/').pop() || '';
  const isNamed =
    /\/skills_rpg\//.test(path) ||
    /\/abilities\//.test(path) ||
    /^(skill_|ability_)/i.test(file) ||
    (/\/spells\//.test(path) && /-(1|0)\.png$/i.test(file));
  if (isNamed) named.push(path);
}

function record(path) {
  const row = INDEX[path];
  const icon = path;
  const iconUrl = row?.cdnUrl || `${CDN}${path}`;
  return { icon, iconUrl, uuid: row?.grudgeUuid || null };
}

function scoreFile(path, skill) {
  const fileStem = stem(path);
  const fileTok = new Set(tokens(fileStem));
  const idTok = new Set(tokens(skill.id));
  const nameTok = new Set(tokens(skill.name));
  const blobTok = new Set([...idTok, ...nameTok, ...tokens(skill.description || '')]);
  let n = 0;
  if (fileStem && normalizeName(skill.name) === fileStem) n += 24;
  if (fileStem && String(skill.id).replace(/^[^_]+_/, '').replace(/_/g, ' ') === fileStem) n += 18;
  for (const t of fileTok) {
    if (nameTok.has(t)) n += 4;
    else if (idTok.has(t)) n += 3;
    else if (blobTok.has(t)) n += 1;
  }
  n += groupHits(fileTok, blobTok) * 3;
  if (/skills_rpg/.test(path)) n += 2;
  else if (/\/abilities\//.test(path)) n += 1;
  return n;
}

function pickNamed(skill, used) {
  let best = null;
  let bestScore = 2;
  for (const path of named) {
    if (used.has(path)) continue;
    const sc = scoreFile(path, skill);
    if (sc > bestScore) {
      bestScore = sc;
      best = path;
    }
  }
  return best;
}

function pickClass(typeId, used) {
  const dirs = CLASS_DIRS[typeId] || CLASS_DIRS.SWORD;
  for (const dir of dirs) {
    for (const path of classByDir[dir] || []) {
      if (!used.has(path)) return path;
    }
  }
  for (const path of numberedClass) {
    if (!used.has(path)) return path;
  }
  return named.find((p) => !used.has(p)) || '/icons/skills/class/swordsman/swordsman_01.png';
}

function collectSlotSkills(slots, typeId, acc) {
  if (!slots) return;
  const list = Array.isArray(slots) ? slots : Object.values(slots);
  for (const slot of list) {
    for (const s of slot?.skills || []) {
      if (s?.id && s?.name) acc.push({ skill: s, typeId });
    }
  }
}

function typeFromT0Weapon(w) {
  const blob = `${w.id || ''} ${w.weaponType || ''} ${w.category || ''} ${w.name || ''}`.toLowerCase();
  if (/greatsword/.test(blob)) return 'GREATSWORD';
  if (/greataxe/.test(blob)) return 'GREATAXE';
  if (/crossbow|xbow/.test(blob)) return 'CROSSBOW';
  if (/\bbow\b/.test(blob)) return 'BOW';
  if (/dagger|knife/.test(blob)) return 'DAGGER';
  if (/hammer/.test(blob)) return 'HAMMER';
  if (/mace/.test(blob)) return 'MACE';
  if (/sword/.test(blob)) return 'SWORD';
  if (/axe/.test(blob)) return 'AXE';
  if (/gun|pistol|rifle/.test(blob)) return 'GUN';
  if (/staff|stave/.test(blob)) return 'STAFF';
  if (/spear/.test(blob)) return 'SPEAR';
  if (/shield/.test(blob)) return 'SHIELD';
  if (/tome/.test(blob)) return 'TOME';
  if (/wand/.test(blob)) return 'WAND';
  if (/scythe/.test(blob)) return 'SCYTHE';
  if (/tool/.test(blob)) return 'TOOL';
  if (/claw/.test(blob)) return 'CLAW';
  return 'SWORD';
}

function collectAll(doc, t0) {
  const acc = [];
  for (const wt of doc.weaponTypes || []) {
    collectSlotSkills(wt.slots, wt.id, acc);
    collectSlotSkills(wt.starterSlots, wt.id, acc);
    for (const variant of Object.values(wt.shieldTypes || {})) {
      collectSlotSkills(variant.slots, 'SHIELD', acc);
    }
    for (const mode of Object.values(wt.couplingModes || {})) {
      collectSlotSkills(mode.slots, 'TOME', acc);
    }
  }
  for (const w of t0.weapons || []) {
    const typeId = typeFromT0Weapon(w);
    const ws = w.weaponSkills || {};
    for (const s of [ws.slot1, ws.slot2, ...(ws.slot3Options || [])]) {
      if (s?.id && s?.name) acc.push({ skill: s, typeId });
    }
  }
  return acc;
}

function patchOffhandMechanics(doc) {
  const shield = (doc.weaponTypes || []).find((t) => t.id === 'SHIELD');
  const tome = (doc.weaponTypes || []).find((t) => t.id === 'TOME');
  if (shield) {
    shield.mechanic = {
      ...(shield.mechanic || {}),
      description:
        'Toggle F (block) — with a 1H sword, knife, hammer, mace, or axe, shield type replaces mainhand slots 1–3 with tank abilities. Slots 4–5 unchanged. Inactive on 2H, gun, wand, claw, staff, or bow.',
      toggleKey: 'F',
      requiresBlock: true,
      requiresOffhandToggle: true,
      requiresOneHandMainhand: true,
      validMainhands: VALID_MAINHANDS,
      affectedSlots: ['primary', 'secondary', 'ability'],
      doesNotAffectSlot4: true,
      doesNotAffectSlot5: true,
      shieldTypes: shield.mechanic?.shieldTypes || ['buckler', 'kite', 'tower', 'spiked', 'magic', 'relic'],
    };
  }
  if (tome) {
    tome.mechanic = {
      ...(tome.mechanic || {}),
      description:
        'Toggle F (same as shield) — with a 1H sword, knife, hammer, mace, or axe, tome replaces mainhand slots 1–3 with coupled spell variants. Slots 4–5 unchanged. Inactive on 2H, gun, wand, claw, staff, or bow.',
      toggleKey: 'F',
      requiresOffhandToggle: true,
      requiresOneHandMainhand: true,
      validMainhands: VALID_MAINHANDS,
      affectedSlots: ['primary', 'secondary', 'ability'],
      doesNotAffectSlot4: true,
      doesNotAffectSlot5: true,
      couplingModes: tome.mechanic?.couplingModes || ['elemental', 'ranged', 'heal', 'buff'],
      schoolToMode: tome.mechanic?.schoolToMode || {
        fire: 'elemental',
        frost: 'elemental',
        lightning: 'elemental',
        nature: 'buff',
        arcane: 'buff',
        holy: 'heal',
      },
    };
  }
}

const skillsDoc = JSON.parse(readFileSync(join(root, 'api/v1/master-weaponSkills.json'), 'utf8'));
const t0 = JSON.parse(readFileSync(join(root, 'api/v1/t0-weapons.json'), 'utf8'));
patchOffhandMechanics(skillsDoc);

const rows = collectAll(skillsDoc, t0);
const unique = [];
const seenId = new Set();
for (const row of rows) {
  if (seenId.has(row.skill.id)) continue;
  seenId.add(row.skill.id);
  unique.push(row);
}

const byId = new Map();
const byName = new Map();
const used = new Set();
let namedHits = 0;
let classHits = 0;
let reused = 0;

function bind(skill, typeId, path, viaNamed) {
  const nameKey = normalizeName(skill.name);
  const existing = byId.get(skill.id) || (nameKey ? byName.get(nameKey) : null);
  if (existing) {
    byId.set(skill.id, existing);
    return existing;
  }
  used.add(path);
  if (viaNamed) namedHits++;
  else classHits++;
  const rec = record(path);
  byId.set(skill.id, rec);
  if (nameKey) byName.set(nameKey, rec);
  return rec;
}

for (const { skill, typeId } of unique) {
  const nameKey = normalizeName(skill.name);
  if (byId.has(skill.id) || (nameKey && byName.has(nameKey))) continue;
  let best = null;
  let bestScore = 17;
  for (const path of named) {
    if (used.has(path)) continue;
    const sc = scoreFile(path, skill);
    if (sc > bestScore) {
      bestScore = sc;
      best = path;
    }
  }
  if (best) bind(skill, typeId, best, true);
}

for (const { skill, typeId } of unique) {
  const nameKey = normalizeName(skill.name);
  if (byId.has(skill.id) || (nameKey && byName.has(nameKey))) continue;
  const namedPath = pickNamed(skill, used);
  bind(skill, typeId, namedPath || pickClass(typeId, used), Boolean(namedPath));
}

for (const { skill } of rows) {
  const nameKey = normalizeName(skill.name);
  const rec = byId.get(skill.id) || (nameKey ? byName.get(nameKey) : null);
  if (!rec) continue;
  if (!byId.has(skill.id)) {
    byId.set(skill.id, rec);
    reused++;
  } else if (skill.icon !== rec.icon) {
    reused++;
  }
  skill.icon = rec.icon;
  skill.iconUrl = rec.iconUrl;
}

const map = {};
for (const [id, rec] of byId) {
  map[id] = { icon: rec.icon, iconUrl: rec.iconUrl };
}

writeFileSync(join(root, 'api/v1/master-weaponSkills.json'), JSON.stringify(skillsDoc));
writeFileSync(join(root, 'api/v1/t0-weapons.json'), JSON.stringify(t0, null, 2) + '\n');
writeFileSync(
  join(root, 'api/v1/_meta/weapon-skill-icon-map.json'),
  JSON.stringify(
    {
      version: '1.1.0',
      updated: '2026-08-21',
      law: 'One PNG per skill id from icon-path-index. Same id and same name reuse that PNG on every weapon. Never sprite sheet. Never weapon-item PNG for a skill.',
      cdn: CDN,
      source: 'api/v1/icon-path-index.json',
      count: Object.keys(map).length,
      byId: map,
    },
    null,
    2,
  ) + '\n',
);

const dungeonPath = 'F:/GitHub/threejs-procedural-dungeon/src/play/skillIconCdn.js';
if (existsSync(dungeonPath)) {
  const lines = Object.entries(map).map(([id, rec]) => `  ${JSON.stringify(id)}: ${JSON.stringify(rec.iconUrl)}`);
  writeFileSync(
    dungeonPath,
    `/** CDN skill icons from ObjectStore master-weaponSkills. Single PNG per id. */\nexport const SKILL_ICON_CDN = {\n${lines.join(',\n')},\n};\n`,
  );
}

const uniqueIcons = new Set(Object.values(map).map((m) => m.icon));
const conflicts = [];
const seen = new Map();
for (const { skill } of rows) {
  const set = seen.get(skill.id) || new Set();
  set.add(skill.icon);
  seen.set(skill.id, set);
}
for (const [id, set] of seen) if (set.size > 1) conflicts.push(id);

console.log(
  JSON.stringify(
    {
      skillRows: rows.length,
      uniqueIds: byId.size,
      uniqueIcons: uniqueIcons.size,
      namedHits,
      classHits,
      reused,
      conflicts,
      sample: Object.entries(map).slice(0, 12),
      namedPool: named.length,
      classPool: numberedClass.length,
    },
    null,
    2,
  ),
);
