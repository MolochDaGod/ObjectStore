// Build the 2026-04 asset registries and map new class-pack icons onto
// weapon skills, class abilities, skill-tree nodes, and profession nodes.
//
// Usage:
//   node scripts/build-new-asset-registries.mjs          # write changes
//   node scripts/build-new-asset-registries.mjs --dry    # preview only
//
// Assumptions:
//   * Extraction already performed by scripts/import-asset-packs-2026-04.ps1
//   * icons/skills/class/<slug>/<slug>_NN.png exists for the 8 class packs
//   * ui/packs/<slug>/** contains the unzipped UI kits
//   * models/environments/aquatic-ruins/** contains the unzipped 3D env
//
// Idempotent — only adds iconUrl + sourcePack; does NOT replace existing icon URLs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API  = path.join(ROOT, 'api/v1');
const BASE_URL = 'https://molochdagod.github.io/ObjectStore';
const DRY = process.argv.includes('--dry') || process.argv.includes('--dry-run');

// ------------------------------------------------------------------
// 1. Enumerate on-disk class packs
// ------------------------------------------------------------------
const CLASS_PACK_SLUGS = [
  'necromancer','firemage','bloodmage','earthmage','frostmage',
  'hunter','barbarian','engineer'
];

function listClassPack(slug) {
  const dir = path.join(ROOT, 'icons/skills/class', slug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.toLowerCase().endsWith('.png'))
    .sort((a,b) => {
      const na = parseInt(a.match(/_(\d+)\./)?.[1] ?? '0', 10);
      const nb = parseInt(b.match(/_(\d+)\./)?.[1] ?? '0', 10);
      return na - nb;
    });
}

const packs = {};
for (const s of CLASS_PACK_SLUGS) packs[s] = listClassPack(s);

function iconFor(slug, i /* 0-based */) {
  const list = packs[slug];
  if (!list || !list.length) return null;
  const file = list[i % list.length];
  return `${BASE_URL}/icons/skills/class/${slug}/${file}`;
}

// ------------------------------------------------------------------
// 2. Write skill-icon-packs.json
// ------------------------------------------------------------------
const classPackTags = {
  necromancer: ['dark','death','undead','curse','necro','drain','soul'],
  firemage:    ['fire','flame','burn','ember','inferno','lava'],
  bloodmage:   ['blood','sanguine','life-drain','arcane','dark'],
  earthmage:   ['earth','stone','nature','root','rock','terra','druid'],
  frostmage:   ['frost','ice','cold','freeze','winter','snow'],
  hunter:      ['bow','arrow','trap','ranger','marksman','beast'],
  barbarian:   ['warrior','rage','melee','strength','berserk','axe','sword'],
  engineer:    ['tech','gun','bomb','mechanical','trap','siege','tool']
};

const skillIconPacks = {
  version: '1.0.0',
  updated: new Date().toISOString().slice(0,10),
  batch:   '2026-04-character-skill-packs',
  source:  'Craftpix.net free character skill packs',
  baseUrl: `${BASE_URL}/icons/skills/class`,
  packs: CLASS_PACK_SLUGS.map(slug => ({
    slug,
    name: slug[0].toUpperCase() + slug.slice(1),
    count: packs[slug].length,
    directory: `icons/skills/class/${slug}`,
    files: packs[slug],
    tags: classPackTags[slug] || []
  }))
};

// ------------------------------------------------------------------
// 3. Walk ui/packs/** and emit ui-components.json
// ------------------------------------------------------------------
function walkUi(pack) {
  const root = path.join(ROOT, 'ui/packs', pack);
  const out = [];
  if (!fs.existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) { stack.push(full); continue; }
      const rel = full.substring(ROOT.length + 1).split(path.sep).join('/');
      out.push(rel);
    }
  }
  return out;
}

function classifyUi(p) {
  const low = p.toLowerCase();
  if (low.includes('button'))      return 'buttons';
  if (low.includes('panel'))       return 'panels';
  if (low.includes('card'))        return 'cards';
  if (low.includes('progressbar') || low.includes('bar')) return 'progressBars';
  if (low.includes('background') || low.endsWith('.jpg')) return 'backgrounds';
  if (low.includes('icon'))        return 'icons';
  if (low.endsWith('.psd'))        return 'sources';
  return 'misc';
}

const UI_PACKS = ['scifi-fps','wenrexa-scifi','wenrexa-hologram','wenrexa-kit4'];
const uiComponents = {
  version: '1.0.0',
  updated: new Date().toISOString().slice(0,10),
  batch:   '2026-04-ui-kits',
  baseUrl: `${BASE_URL}/ui/packs`,
  packs: {}
};
for (const pk of UI_PACKS) {
  const files = walkUi(pk);
  const byKind = {};
  for (const f of files) {
    const k = classifyUi(f);
    (byKind[k] ||= []).push({
      path: f,
      url: `${BASE_URL}/${f}`
    });
  }
  uiComponents.packs[pk] = {
    slug: pk,
    totalFiles: files.length,
    kinds: Object.fromEntries(Object.entries(byKind).map(([k,v]) => [k, v.length])),
    items: byKind
  };
}

// ------------------------------------------------------------------
// 4. environments.json (aquatic-ruins manifest)
// ------------------------------------------------------------------
function listEnv(root) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) { stack.push(full); continue; }
      const rel = full.substring(ROOT.length + 1).split(path.sep).join('/');
      const st = fs.statSync(full);
      out.push({ path: rel, size: st.size });
    }
  }
  return out;
}

const envRoot = path.join(ROOT, 'models/environments/aquatic-ruins');
const envFiles = listEnv(envRoot);
const envByKind = { fbx: [], dae: [], obj: [], gltf: [], glb: [], png: [], jpg: [], other: [] };
for (const f of envFiles) {
  const ext = path.extname(f.path).slice(1).toLowerCase();
  (envByKind[ext] || envByKind.other).push(f);
}
const environments = {
  version: '1.0.0',
  updated: new Date().toISOString().slice(0,10),
  note: 'Binaries tracked here may not be committed to git — upload to R2 via scripts/sync-to-r2.js before referencing publicly.',
  environments: {
    'aquatic-ruins': {
      name: 'Aquatic Ruins',
      source: 'Batch_Aquatic_Ruins.zip',
      directory: 'models/environments/aquatic-ruins',
      totalFiles: envFiles.length,
      totalBytes: envFiles.reduce((a, f) => a + f.size, 0),
      counts: Object.fromEntries(Object.entries(envByKind).map(([k,v]) => [k, v.length])),
      subdirs: [...new Set(envFiles.map(f => f.path.split('/').slice(2,3)[0]).filter(Boolean))].sort(),
      files: envFiles
    }
  }
};

// ------------------------------------------------------------------
// 5. Apply mapping to skills.json / classes.json / skillTrees.json / professions.json
// ------------------------------------------------------------------

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, data) {
  if (DRY) return;
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

// -- skills.json (weapon skills) --
//   categories: sword, axe, bow, staff, gun
const WEAPON_CATEGORY_PACK = {
  sword:    'barbarian',
  axe:      'barbarian',
  dagger:   'hunter',
  hammer:   'barbarian',
  spear:    'barbarian',
  bow:      'hunter',
  crossbow: 'hunter',
  gun:      'engineer',
  staff:    'firemage',      // mixed-element; round-robin handled below
  firestaff: 'firemage',
  froststaff: 'frostmage',
  naturestaff: 'earthmage',
  holystaff: 'bloodmage',
  arcanestaff: 'bloodmage',
  tome:     'necromancer',
  shield:   'barbarian',
  relic:    'bloodmage'
};

// For the "staff" category, cycle through the four elemental mage packs so
// each staff skill gets a flavor-matched icon.
const MAGE_ROTATION = ['firemage','frostmage','earthmage','bloodmage'];

function pickMagePackByName(name, desc) {
  const lower = (name + ' ' + (desc || '')).toLowerCase();
  if (/(fire|flame|ember|burn|inferno|nova|lava)/.test(lower))             return 'firemage';
  if (/(ice|frost|freeze|glaci|blizzard|cold|chill|snow)/.test(lower))     return 'frostmage';
  if (/(earth|nature|root|stone|vine|barrier|shield|barkskin)/.test(lower))return 'earthmage';
  if (/(holy|heal|bolt|charged|arcane|blink|teleport|chain|lightning|storm|divine)/.test(lower)) return 'bloodmage';
  return null;
}

function mapSkillsJson() {
  const p = path.join(API, 'skills.json');
  const j = readJson(p);
  for (const [cat, def] of Object.entries(j.categories)) {
    const pack = WEAPON_CATEGORY_PACK[cat] || 'barbarian';
    (def.skills || []).forEach((s, i) => {
      let url, usedPack;
      if (cat === 'staff') {
        usedPack = pickMagePackByName(s.name, s.desc) || MAGE_ROTATION[i % MAGE_ROTATION.length];
        url = iconFor(usedPack, i);
      } else {
        usedPack = pack;
        url = iconFor(pack, i);
      }
      // Overwrite iconUrl even if one existed — we want the smart mapping for staff
      s.iconUrl = url;
      s.sourcePack = usedPack;
    });
  }
  writeJson(p, j);
  return j;
}

// -- classes.json (class abilities) --
const CLASS_PRIMARY_PACK = {
  warrior: 'barbarian',
  mage:    'firemage',     // rotate across mages below
  worge:   'necromancer',
  ranger:  'hunter'
};

function mapClassesJson() {
  const p = path.join(API, 'classes.json');
  const j = readJson(p);
  for (const [classId, cls] of Object.entries(j.classes)) {
    const primary = CLASS_PRIMARY_PACK[classId] || 'barbarian';
    if (!cls.iconUrl) cls.iconUrl = iconFor(primary, 0);
    cls.sourcePack = primary;
    const abilities = cls.abilities || [];
    abilities.forEach((ab, i) => {
      let pack = primary;
      if (classId === 'mage') {
        // Match ability icon/name to elemental pack when possible
        const lower = (ab.name + ' ' + (ab.icon || '') + ' ' + (ab.description || '')).toLowerCase();
        if (lower.includes('fire')) pack = 'firemage';
        else if (lower.includes('ice') || lower.includes('frost')) pack = 'frostmage';
        else if (lower.includes('earth') || lower.includes('nature') || lower.includes('root')) pack = 'earthmage';
        else if (lower.includes('heal') || lower.includes('holy') || lower.includes('divine') || lower.includes('blood')) pack = 'bloodmage';
        else pack = MAGE_ROTATION[i % MAGE_ROTATION.length];
      } else if (classId === 'worge') {
        const lower = (ab.name + ' ' + (ab.icon || '')).toLowerCase();
        if (lower.includes('fire') || lower.includes('imp')) pack = 'firemage';
        else if (lower.includes('nature') || lower.includes('leaf') || lower.includes('vine') || lower.includes('twig')) pack = 'earthmage';
        else if (lower.includes('lightning')) pack = 'frostmage'; // cold electric vibe
        else if (lower.includes('fear') || lower.includes('dagger') || lower.includes('poison') || lower.includes('skull')) pack = 'necromancer';
        else pack = 'necromancer';
      }
      if (!ab.iconUrl) ab.iconUrl = iconFor(pack, i);
      ab.sourcePack = pack;
    });
    if (cls.signatureAbility) {
      const pack = CLASS_PRIMARY_PACK[classId] || 'barbarian';
      if (!cls.signatureAbility.iconUrl) {
        cls.signatureAbility.iconUrl = iconFor(pack, abilities.length);
      }
      cls.signatureAbility.sourcePack = pack;
    }
  }
  writeJson(p, j);
  return j;
}

// -- skillTrees.json --
function mapSkillTreesJson() {
  const p = path.join(API, 'skillTrees.json');
  const j = readJson(p);
  for (const [cls, tree] of Object.entries(j.skillTrees)) {
    const pack = CLASS_PRIMARY_PACK[cls] || 'barbarian';
    let ordinal = 0;
    for (const tier of tree.tiers || []) {
      for (const sk of tier.skills || []) {
        // Only add iconUrl; keep existing `icon` field intact
        if (!sk.iconUrl) {
          // If existing icon already looks like a URL, pull it into iconUrl too
          if (typeof sk.icon === 'string' && sk.icon.startsWith('http')) {
            sk.iconUrl = sk.icon;
          } else {
            sk.iconUrl = iconFor(pack, ordinal);
          }
        }
        sk.sourcePack = pack;
        if (sk.grantedAbility && !sk.grantedAbility.iconUrl) {
          sk.grantedAbility.iconUrl = iconFor(pack, ordinal);
          sk.grantedAbility.sourcePack = pack;
        }
        ordinal++;
      }
    }
  }
  writeJson(p, j);
  return j;
}

// -- professions.json --
// Gathering professions (generic skills: mining/logging/skinning/fishing/herbalism/scavenging)
const GATHERING_PACK = {
  Mining:     'engineer',
  Logging:    'barbarian',
  Skinning:   'hunter',
  Fishing:    'hunter',
  Herbalism:  'earthmage',
  Scavenging: 'engineer'
};
// Crafter profession -> pack
const CRAFTER_PACK = {
  miner:    'engineer',
  forester: 'hunter',
  mystic:   'bloodmage',
  chef:     'firemage',
  engineer: 'engineer',
  tanner:   'necromancer' // unusual; safe fallback pack
};

function mapProfessionsJson() {
  const p = path.join(API, 'professions.json');
  const j = readJson(p);

  // Gathering: assign a default iconUrl to each gathering type
  for (const [gName, g] of Object.entries(j.gathering || {})) {
    const pack = GATHERING_PACK[gName] || 'engineer';
    if (!g.iconUrl) g.iconUrl = iconFor(pack, 0);
    g.sourcePack = pack;
    // For tierResources, add a small iconUrl map keyed by tier (1-8)
    if (g.tierResources && !g.tierIconUrls) {
      const list = packs[pack];
      const map = {};
      for (const t of Object.keys(g.tierResources)) {
        const idx = (parseInt(t,10) - 1 + 1) % list.length; // skip index 0 (reserved for main)
        map[t] = `${BASE_URL}/icons/skills/class/${pack}/${list[idx]}`;
      }
      g.tierIconUrls = map;
    }
  }

  // Crafter professions: iterate skillTree nodes and attach iconUrl
  for (const [profId, prof] of Object.entries(j.professions || {})) {
    const pack = CRAFTER_PACK[profId] || 'engineer';
    if (prof.iconUrl === undefined) prof.iconUrl = iconFor(pack, 0);
    prof.sourcePack = pack;
    (prof.skillTree || []).forEach((node, i) => {
      if (!node.iconUrl) node.iconUrl = iconFor(pack, i);
      node.sourcePack = pack;
    });
  }
  writeJson(p, j);
  return j;
}

// ------------------------------------------------------------------
// 6. Write registries
// ------------------------------------------------------------------
function writeRegistries() {
  writeJson(path.join(API, 'skill-icon-packs.json'), skillIconPacks);
  writeJson(path.join(API, 'ui-components.json'),    uiComponents);
  writeJson(path.join(API, 'environments.json'),     environments);
}

// ------------------------------------------------------------------
// 7. Run
// ------------------------------------------------------------------
console.log(`[build-new-asset-registries] DRY=${DRY}  ROOT=${ROOT}`);
console.log('Class packs loaded:');
for (const [k,v] of Object.entries(packs)) console.log(`  ${k.padEnd(14)} ${v.length} icons`);

const s = mapSkillsJson();
const c = mapClassesJson();
const t = mapSkillTreesJson();
const pj = mapProfessionsJson();
writeRegistries();

console.log('\nSummary:');
console.log(`  skills.json       : ${Object.keys(s.categories).length} categories`);
console.log(`  classes.json      : ${Object.keys(c.classes).length} classes`);
console.log(`  skillTrees.json   : ${Object.keys(t.skillTrees).length} trees`);
console.log(`  professions.json  : ${Object.keys(pj.professions).length} crafters + ${Object.keys(pj.gathering).length} gathering`);
console.log(`  ui-components.json: ${Object.keys(uiComponents.packs).length} packs, ${Object.values(uiComponents.packs).reduce((a,p)=>a+p.totalFiles,0)} files`);
console.log(`  skill-icon-packs  : ${skillIconPacks.packs.length} packs, ${skillIconPacks.packs.reduce((a,p)=>a+p.count,0)} icons`);
console.log(`  environments.json : aquatic-ruins (${environments.environments['aquatic-ruins'].totalFiles} files, ${(environments.environments['aquatic-ruins'].totalBytes/1024/1024).toFixed(1)} MB)`);
console.log(DRY ? '\n(dry-run: no files written)' : '\nWrote all files.');
