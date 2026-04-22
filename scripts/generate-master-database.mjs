#!/usr/bin/env node
/**
 * ObjectStore - Master Database Generator (data-driven rewrite)
 *
 * Canonical source of truth for items, icons, and categories is the set of
 * files the ItemBrowser.html page consumes:
 *   - api/v1/weapons.json       (24 weapon categories including tomes + arcaneStaves)
 *   - api/v1/armor.json         (cloth/leather/metal/gem)
 *   - api/v1/materials.json     (ore/ingot/wood/cloth/leather/gem/essence)
 *   - api/v1/consumables.json   (redFoods/greenFoods/blueFoods/mysticPotions/engineerConsumables)
 *
 * This script reads those files AS-IS, layers GRUDGE UUIDs + tier expansion +
 * recipe linking on top, and emits master-* JSONs consumed by every Grudge
 * Studio game via ObjectStore.
 *
 * Key decisions:
 *   - D3: api/v1/weapons.json category `arcaneStaves` is emitted as
 *     category=artifact, type=artifact, artifactType=arcane (with discovery
 *     block). No tier expansion. Source-of-truth list remains in weapons.json.
 *   - D4: api/v1/weapons.json categories ending in `Tomes` (fire/frost/holy/
 *     lightning/nature/arcane) are emitted as category=offhand-tome,
 *     type=offhand-tome with skillGrants derived from their `abilities`.
 *     No tier expansion.
 *   - D5: tier labels T5=Heroic, T8=Legendary.
 *   - Icon resolution: prefer canonical `spritePath` -> else bespoke
 *     `/icons/weapons/<slug>.png` if on disk -> else pack math
 *     `iconBase_${pad(iconOffset + index)}.png`.
 *
 * Output: api/v1/master-items.json, master-armor.json, master-materials.json,
 * master-consumables.json, master-recipes.json, master-artifacts.json,
 * master-registry.json.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const API_DIR = join(ROOT, 'api', 'v1');
const ICONS_WEAPONS_DIR = join(ROOT, 'icons', 'weapons');

if (!existsSync(API_DIR)) mkdirSync(API_DIR, { recursive: true });

// -- GRUDGE UUID --------------------------------------------------------
const PREFIX_MAP = {
  item: 'ITEM', recipe: 'RECP', material: 'MATL', node: 'NODE',
  food: 'FOOD', potion: 'POTN', tome: 'ITEM', artifact: 'ITEM',
  skill: 'SKIL', attribute: 'ATTR', consumable: 'CONS',
};
let _seq = 0;
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h = h >>> 0;
  return ((h ^ (h >>> 16)) >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}
function uuid(type, meta = '') {
  const prefix = PREFIX_MAP[type] || type.slice(0, 4).toUpperCase();
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  _seq++;
  const seq = _seq.toString(16).toUpperCase().padStart(6, '0');
  return `${prefix}-${ts}-${seq}-${fnv1a(`${prefix}-${ts}-${seq}-${meta}-${Math.random()}`)}`;
}

// -- CDN / TIERS --------------------------------------------------------
const CDN = 'https://molochdagod.github.io/ObjectStore';
const ICON = (p) => `${CDN}/icons/${p}`;
const PACK = (p) => `${CDN}/icons/pack/${p}`;

const TIERS = [
  { tier: 1, name: 'Bronze',  color: '#8b7355', label: 'Common' },
  { tier: 2, name: 'Silver',  color: '#a8a8a8', label: 'Uncommon' },
  { tier: 3, name: 'Blue',    color: '#4a9eff', label: 'Rare' },
  { tier: 4, name: 'Purple',  color: '#9d4dff', label: 'Epic' },
  { tier: 5, name: 'Red',     color: '#ff4d4d', label: 'Heroic' },
  { tier: 6, name: 'Orange',  color: '#ffaa00', label: 'Mythic' },
  { tier: 7, name: 'Gold',    color: '#d4a84b', label: 'Ancient' },
  { tier: 8, name: 'Shimmer', color: '#f0d890', label: 'Legendary' },
];
const scaleStat = (base, per, tier) => Math.round(base + per * (tier - 1));

// -- ICON RESOLVER ------------------------------------------------------
// Priority: spritePath (canonical bespoke) -> /icons/weapons/<slug>.png ->
// pack math iconBase_${pad(iconOffset + index)}.png
function bespokeIconUrl(slug) {
  if (!slug) return null;
  const path = join(ICONS_WEAPONS_DIR, `${slug}.png`);
  return existsSync(path) ? `${CDN}/icons/weapons/${slug}.png` : null;
}
function packWeaponIcon(iconBase, index, offset = 0, max = 40) {
  if (!iconBase) return '';
  const n = offset + index + 1; // 1-indexed
  const clamped = max ? (((n - 1) % max) + 1) : n;
  // Some canonical iconBases are lower-case ('staff'), others uppercase ('Sword')
  const isBook = iconBase.toLowerCase() === 'book';
  const isResource = iconBase.toLowerCase() === 'res';
  const padded = isBook || isResource ? clamped : String(clamped).padStart(2, '0');
  if (isResource) return PACK(`resources/${iconBase}_${String(clamped).padStart(2, '0')}.png`);
  return PACK(`weapons/${iconBase}_${padded}.png`);
}
function resolveWeaponIcon(item, cat, index) {
  // 1. canonical spritePath on the item wins unconditionally
  if (item.spritePath) {
    const p = item.spritePath.startsWith('http') ? item.spritePath : `${CDN}${item.spritePath}`;
    return p;
  }
  // 2. bespoke at /icons/weapons/<slug>.png
  const bespoke = bespokeIconUrl(item.id);
  if (bespoke) return bespoke;
  // 3. pack math
  return packWeaponIcon(cat.iconBase, index, cat.iconOffset || 0, cat.iconMax || 0);
}

// ---- Skill icon resolver ----
// ObjectStore has /icons/skill_nobg/<Class>skill_NN_nobg.png (10 classes x 50-51 skills)
// and /icons/spells/<effect>-<color>-<N>.png (358 effect sprites).
// If the canonical skill record already has a real URL/path we keep it;
// otherwise we pick a semantic match by keyword.
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < (s || '').length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}
const CLASS_SKILL_PREFIX = { warrior: 'Warrior', mage: 'Mage', ranger: 'Archer', worge: 'Shaman', priest: 'Priest', paladin: 'Paladin', druide: 'Druide', druid: 'Druide', assassin: 'Assassin', warlock: 'Warlock', engineer: 'Engineer' };
function classSkillIcon(cls, n) {
  return `${CDN}/icons/skill_nobg/${cls}skill_${String(n).padStart(2, '0')}_nobg.png`;
}
function spellIcon(effect, color, variant) {
  return `${CDN}/icons/spells/${effect}-${color}-${variant}.png`;
}
function resolveSkillIcon(skill, className, index = 0) {
  const raw = skill?.icon;
  if (typeof raw === 'string') {
    if (raw.startsWith('http')) return raw;
    if (raw.startsWith('/icons/')) return `${CDN}${raw}`;
  }
  const h = hashStr(`${className}-${skill.id || skill.name || ''}-${index}`);
  const variant = (h % 3) + 1;
  const text = `${skill.name || ''} ${skill.description || ''} ${skill.effect || ''}`.toLowerCase();

  if (/fire|burn|flame|inferno|ember|magma|scorch|pyro|blaze|ignite|solar|hellfire/.test(text)) return spellIcon('lightning', 'orange', variant);
  if (/frost|ice|chill|freeze|glacial|winter|blizzard|cold|cryo/.test(text)) return spellIcon('ice', 'sky', variant);
  if (/lightning|thunder|storm|shock|electric|volt|zap|tempest/.test(text)) return spellIcon('lightning', 'blue', variant);
  if (/holy|heal|light|divine|bless|sacred|dawn|cleanse|revive|restore|consecrat|sanctif/.test(text)) return spellIcon('light', 'jade', variant);
  if (/poison|toxic|venom/.test(text)) return spellIcon('rip', 'acid', variant);
  if (/nature|vine|root|thorn|leaf|herb|entangle|bloom|grove/.test(text)) return spellIcon('vines', 'jade', variant);
  if (/shadow|void|dark|night|twilight|shade|eclipse|dusk|wraith|reaper|necrotic/.test(text)) return spellIcon('rip', 'eerie', variant);
  if (/arcane|mana|magic|spell|cast|mystic|enchant/.test(text)) return spellIcon('beam', 'blue', variant);
  if (/bleed|crimson|blood/.test(text)) return spellIcon('rip', 'magenta', variant);
  if (/air|wind|gust|cyclone/.test(text)) return spellIcon('air-burst', 'sky', variant);
  if (/beam|laser/.test(text)) return spellIcon('beam', 'eerie', variant);
  if (/needle|piercing/.test(text)) return spellIcon('needles', 'royal', variant);

  // Fall back to class-prefixed skill sprite based on keyword or given className
  let cls = null;
  if (/shot|arrow|bow|volley|aim|snipe/.test(text)) cls = 'Archer';
  else if (/stab|dagger|backstab|stealth|assassin|execute/.test(text)) cls = 'Assassin';
  else if (/shield|block|parry|guard|ward|bulwark|taunt|aura|defend/.test(text)) cls = 'Paladin';
  else if (/stun|smash|crush|bash|slam|pound|hammer|maul|concussi|cleave/.test(text)) cls = 'Warrior';
  else if (/slash|strike|swing|hack|chop|cut|rend|sever|pierce|thrust/.test(text)) cls = 'Warrior';
  if (!cls) cls = CLASS_SKILL_PREFIX[(className || '').toLowerCase()] || 'Warrior';

  const slot = (h % 50) + 1;
  return classSkillIcon(cls, slot);
}

// -- INPUT --------------------------------------------------------------
function readJson(rel) {
  const full = join(ROOT, rel);
  return JSON.parse(readFileSync(full, 'utf8'));
}
const WEAPONS   = readJson('api/v1/weapons.json');
const ARMOR     = readJson('api/v1/armor.json');
const MATERIALS = readJson('api/v1/materials.json');
const CONSUMES  = readJson('api/v1/consumables.json');
const PROFS     = readJson('api/v1/professions.json');
const SKILLTREES= readJson('api/v1/skillTrees.json');
const WSKILLS   = readJson('api/v1/weaponSkills.json');

console.log('Generating ObjectStore master database (data-driven)...');

// -- OUTPUT BUCKETS -----------------------------------------------------
const allItems = [];
const allRecipes = [];
const allArtifacts = [];
const allMaterials = [];
const allConsumables = [];
const allArmor = [];
const matUuid = new Map();

function getMatUuid(name) {
  if (!matUuid.has(name)) matUuid.set(name, uuid('material', name));
  return matUuid.get(name);
}

// ============================================================
// WEAPONS (includes tomes, arcaneStaves, tools)
// ============================================================
let weaponCount = 0, tomeCount = 0, artifactCount = 0, toolCount = 0;
for (const [catName, catData] of Object.entries(WEAPONS.categories)) {
  const items = catData.items || [];
  const isTome = catName.endsWith('Tomes');
  const isArtifactCat = catName === 'arcaneStaves';
  const isTool = catName === 'tools';

  items.forEach((item, idx) => {
    const iconUrl = resolveWeaponIcon(item, catData, idx);
    const itemUuid = uuid('item', `${catName}-${item.id}`);
    const recipeMats = Object.entries(item.mats || {}).map(([n, q]) => ({
      uuid: getMatUuid(n), name: n, quantity: q,
    }));
    const recipeUuid = uuid('recipe', `recipe-${item.id}`);

    if (recipeMats.length) {
      allRecipes.push({
        uuid: recipeUuid, name: `Craft ${item.name}`, resultItemId: itemUuid,
        resultName: item.name, profession: item.craftedBy || 'Miner',
        category: isTome ? 'offhand-tome' : isArtifactCat ? 'artifact' : catName,
        materials: recipeMats,
      });
    }

    if (isArtifactCat) {
      // D3: Artifact (no tier expansion, hidden until found)
      allArtifacts.push({
        uuid: itemUuid, baseUuid: itemUuid,
        name: item.name, baseName: item.name,
        category: 'artifact', type: 'artifact', classification: 'artifact',
        artifactType: 'arcane', // first sub-type; expand later
        tier: null, tierLabel: null, tierColor: null,
        iconUrl, description: item.lore || item.basicAbility || '',
        stats: item.stats || {},
        abilities: item.abilities || [], signature: item.signatureAbility || '',
        passives: item.passives || [],
        craftedBy: null, recipeUuid: recipeMats.length ? recipeUuid : null,
        source: 'world',
        discovery: {
          hiddenUntilFound: true,
          source: 'world',
          revealCondition: `Discover ${item.name} in the world.`,
        },
        lore: item.lore || null,
      });
      artifactCount++;
      return;
    }

    if (isTome) {
      // D4: tier-less offhand tome with skillGrants
      const school = catName.replace('Tomes', '').toLowerCase();
      const skillGrants = (item.abilities || []).map((a, i) => ({
        name: typeof a === 'string' ? a.replace(/\s*\(.+\)$/, '') : a.name,
        level: 1 + i * 10,
      }));
      allItems.push({
        uuid: itemUuid, baseUuid: itemUuid,
        name: item.name, baseName: item.name,
        category: 'offhand-tome', type: 'offhand-tome', subCategory: 'offhand',
        school,
        tier: null, tierLabel: null, tierColor: null,
        iconUrl, description: item.lore || item.basicAbility || '',
        skillGrants,
        craftedBy: item.craftedBy || 'Mystic',
        recipeUuid: recipeMats.length ? recipeUuid : null,
        source: 'craft',
      });
      tomeCount++;
      return;
    }

    // Regular weapon / tool - tier expand T1-T8 (tools also tier via progression)
    const baseUuidVal = itemUuid;
    for (let tier = 1; tier <= 8; tier++) {
      const tUuid = tier === 1 ? baseUuidVal : uuid('item', `${catName}-${item.id}-T${tier}`);
      const tData = TIERS[tier - 1];
      const stats = {};
      if (item.stats) {
        for (const [k, v] of Object.entries(item.stats)) {
          if (typeof v === 'number' && k.endsWith('Base')) {
            const name = k.replace('Base', '');
            const per = item.stats[`${name}PerTier`] || 0;
            stats[name] = scaleStat(v, per, tier);
          }
        }
      }
      allItems.push({
        uuid: tUuid, baseUuid: baseUuidVal,
        name: tier === 1 ? item.name : `${item.name} T${tier}`,
        baseName: item.name,
        category: catName, type: isTool ? 'tool' : 'weapon',
        subCategory: item.category || (catName.endsWith('2h') ? '2h' : '1h'),
        tier, tierLabel: tData.label, tierColor: tData.color,
        iconUrl, description: item.lore || item.basicAbility || '',
        stats,
        craftedBy: item.craftedBy || (isTool ? null : 'Miner'),
        recipeUuid: recipeMats.length ? recipeUuid : null,
        source: 'craft',
        abilities: item.abilities || [], signature: item.signatureAbility || '',
        passives: item.passives || [],
        primaryStat: item.primaryStat, secondaryStat: item.secondaryStat,
        lore: item.lore,
      });
      if (isTool) toolCount++; else weaponCount++;
    }
  });
}
console.log(`  ${weaponCount} weapon tier rows (incl. tools: ${toolCount})`);
console.log(`  ${tomeCount} tomes (D4)`);
console.log(`  ${artifactCount} artifacts (D3)`);

// ============================================================
// ARMOR (tier expand per slot)
// ============================================================
let armorCount = 0;
for (const [matName, matData] of Object.entries(ARMOR.materials || {})) {
  const items = matData.items || [];
  for (const item of items) {
    const baseUuid = uuid('item', `armor-${matName}-${item.id}`);
    const recipeMats = [];
    const recipeUuid = uuid('recipe', `recipe-armor-${item.id}`);
    const iconUrl = item.spritePath
      ? (item.spritePath.startsWith('http') ? item.spritePath : `${CDN}${item.spritePath}`)
      : '';
    for (let tier = 1; tier <= 8; tier++) {
      const tUuid = tier === 1 ? baseUuid : uuid('item', `armor-${matName}-${item.id}-T${tier}`);
      const tData = TIERS[tier - 1];
      const stats = {};
      if (item.stats) {
        for (const [k, v] of Object.entries(item.stats)) {
          if (typeof v === 'number' && k.endsWith('Base')) {
            const name = k.replace('Base', '');
            const per = item.stats[`${name}PerTier`] || 0;
            stats[name] = scaleStat(v, per, tier);
          }
        }
      }
      allArmor.push({
        uuid: tUuid, baseUuid,
        name: tier === 1 ? item.name : `${item.name} T${tier}`,
        baseName: item.name,
        category: 'armor', type: 'armor',
        material: matName, slotType: item.type, setName: item.name.split(' ')[0],
        tier, tierLabel: tData.label, tierColor: tData.color,
        iconUrl, description: item.lore || '',
        stats,
        passive: item.passive, proc: item.proc, setBonus: item.setBonus,
        source: 'craft',
      });
      armorCount++;
    }
  }
}
console.log(`  ${armorCount} armor tier rows`);

// ============================================================
// MATERIALS (source already tiered - preserve)
// ============================================================
for (const [catName, catData] of Object.entries(MATERIALS.categories || {})) {
  for (const item of (catData.items || [])) {
    const mUuid = getMatUuid(item.name);
    allMaterials.push({
      uuid: mUuid,
      id: item.id, name: item.name, type: 'material',
      category: catName, tier: item.tier ?? 0,
      emoji: item.emoji, gatheredBy: item.gatheredBy || null,
      iconUrl: ICON(`materials/${item.id}.png`),
    });
  }
}
console.log(`  ${allMaterials.length} materials (direct from materials.json)`);

// ============================================================
// CONSUMABLES (food + potions + engineer items)
// ============================================================
for (const [catName, catData] of Object.entries(CONSUMES.categories || {})) {
  for (const item of (catData.items || [])) {
    const cUuid = uuid(catName.startsWith('mystic') ? 'potion' : catName.endsWith('Foods') ? 'food' : 'consumable',
                       `${catName}-${item.id}`);
    const recipeMats = Object.entries(item.mats || {}).map(([n, q]) => ({
      uuid: getMatUuid(n), name: n, quantity: q,
    }));
    const recipeUuid = uuid('recipe', `recipe-${catName}-${item.id}`);
    if (recipeMats.length) {
      allRecipes.push({
        uuid: recipeUuid,
        name: `${catName.startsWith('mystic') ? 'Brew' : catName.endsWith('Foods') ? 'Cook' : 'Assemble'} ${item.name}`,
        resultItemId: cUuid, resultName: item.name,
        profession: catData.profession || 'Chef',
        category: catName, materials: recipeMats,
      });
    }
    allConsumables.push({
      uuid: cUuid, baseUuid: cUuid,
      name: item.name, baseName: item.name,
      category: catName,
      type: catName.startsWith('mystic') ? 'potion' : catName.endsWith('Foods') ? 'food' : 'consumable',
      requiredLevel: item.lvl ?? null,
      tier: item.lvl ? Math.max(1, Math.ceil(item.lvl / 12)) : 1,
      iconUrl: ICON(`consumables/${catName}_${item.id}.png`),
      emoji: item.icon || item.emoji || null,
      description: item.desc || '',
      stats: item.stats || {},
      buff: item.stats ? JSON.stringify(item.stats) : null,
      craftedBy: catData.profession || 'Chef',
      recipeUuid: recipeMats.length ? recipeUuid : null,
    });
  }
}
console.log(`  ${allConsumables.length} consumables (${Object.keys(CONSUMES.categories || {}).length} sub-categories)`);

// ============================================================
// PROFESSIONS (gathering + crafting + skill-tree nodes with UUIDs)
// ============================================================
const masterProfessions = { gathering: {}, crafting: {}, gatheringMilestones: PROFS.gatheringMilestones || [], xpTable: PROFS.xpTable || {}, tierNames: PROFS.tierNames || [], tierColors: PROFS.tierColors || {} };
const allProfessionNodes = [];
let profNodeCount = 0;
for (const [gname, gdata] of Object.entries(PROFS.gathering || {})) {
  masterProfessions.gathering[gname] = {
    uuid: uuid('item', `gather-${gname}`),
    name: gname, category: 'gathering',
    icon: gdata.icon, color: gdata.color,
    resources: gdata.resources || [], tierResources: gdata.tierResources || {},
    feedsInto: gdata.feedsInto || [],
  };
}
// Map profession-node branches to a reasonable class skill pack
const PROF_BRANCH_CLASS = {
  Core: 'Warrior', Weapons: 'Warrior', Armor: 'Paladin', Gathering: 'Druide',
  Logging: 'Druide', Leatherworking: 'Shaman', Fletching: 'Archer',
  Hybrid: 'Engineer', Alchemy: 'Druide', Cooking: 'Priest', Scrolls: 'Mage',
  Traps: 'Engineer',
};
for (const [pname, pdata] of Object.entries(PROFS.professions || {})) {
  const pUuid = uuid('item', `prof-${pname}`);
  const nodes = (pdata.skillTree || []).map((node, i) => {
    const nodeUuid = uuid('node', `${pname}-node-${node.id}`);
    const pseudoSkill = { id: String(node.id), name: node.name, description: node.desc, icon: node.icon };
    const branchClass = PROF_BRANCH_CLASS[node.branch] || 'Warrior';
    const icon = resolveSkillIcon(pseudoSkill, branchClass, i);
    const rec = { uuid: nodeUuid, parentNodeId: node.parent ?? null, ...node, icon };
    allProfessionNodes.push({ professionUuid: pUuid, profession: pname, ...rec });
    profNodeCount++;
    return rec;
  });
  masterProfessions.crafting[pname] = {
    uuid: pUuid,
    name: pdata.name, role: pdata.role,
    icon: pdata.icon, color: pdata.color,
    specializations: pdata.specializations || [],
    crafts: pdata.crafts || [], gathers: pdata.gathers || [],
    tools: pdata.tools || [],
    recipeCount: pdata.recipeCount || 0, recipeTypes: pdata.recipeTypes || [],
    skillTree: nodes,
  };
}
console.log(`  ${Object.keys(masterProfessions.gathering).length} gathering + ${Object.keys(masterProfessions.crafting).length} crafting professions (${profNodeCount} skill-tree nodes)`);

// ============================================================
// CLASS SKILL TREES (with UUIDs per skill)
// ============================================================
const masterSkillTrees = {};
let classSkillCount = 0;
for (const [cname, cdata] of Object.entries(SKILLTREES.skillTrees || {})) {
  const tiers = (cdata.tiers || []).map(tier => ({
    ...tier,
    skills: (tier.skills || []).map((sk, i) => {
      classSkillCount++;
      const resolved = resolveSkillIcon(sk, cname, i);
      return {
        uuid: uuid('skill', `class-${cname}-${sk.id}`),
        ...sk,
        icon: resolved,
        originalIcon: sk.icon !== resolved ? (sk.icon ?? null) : undefined,
      };
    }),
  }));
  masterSkillTrees[cname] = { uuid: uuid('item', `class-${cname}`), ...cdata, tiers };
}
console.log(`  ${Object.keys(masterSkillTrees).length} class skill trees (${classSkillCount} skills)`);

// ============================================================
// WEAPON SKILLS (with UUIDs per skill)
// ============================================================
let weaponSkillCount = 0;
const masterWeaponSkills = {
  version: WSKILLS.version, generatedAt: WSKILLS.generatedAt,
  classRestrictions: WSKILLS.classRestrictions || {},
  weaponTypes: (WSKILLS.weaponTypes || []).map(wt => ({
    ...wt, uuid: uuid('item', `weapontype-${wt.id}`),
    slots: (wt.slots || []).map(slot => ({
      ...slot,
      skills: (slot.skills || []).map((sk, i) => {
        weaponSkillCount++;
        const resolved = resolveSkillIcon(sk, wt.id, i);
        return {
          uuid: uuid('skill', `weapon-${wt.id}-${sk.id}`),
          ...sk,
          icon: resolved,
          originalIcon: sk.icon !== resolved ? (sk.icon ?? null) : undefined,
        };
      }),
    })),
  })),
};
console.log(`  ${masterWeaponSkills.weaponTypes.length} weapon types (${weaponSkillCount} weapon skills)`);

// ============================================================
// WRITE OUTPUTS
// ============================================================
const now = new Date().toISOString();
const outputs = [
  ['master-items.json', {
    version: '3.0.0', generated: now,
    source: 'Derived from api/v1/{weapons,armor,materials,consumables}.json',
    totalItems: allItems.length + allArmor.length + allConsumables.length,
    totalWeapons: allItems.length, totalArmor: allArmor.length,
    totalConsumables: allConsumables.length, totalRecipes: allRecipes.length,
    items: [...allItems, ...allArmor, ...allConsumables],
  }],
  ['master-weapons.json', {
    version: '3.0.0', generated: now, total: allItems.length, items: allItems,
  }],
  ['master-armor.json', {
    version: '3.0.0', generated: now, total: allArmor.length, items: allArmor,
  }],
  ['master-consumables.json', {
    version: '3.0.0', generated: now, total: allConsumables.length, items: allConsumables,
  }],
  ['master-materials.json', {
    version: '3.0.0', generated: now, total: allMaterials.length, materials: allMaterials,
  }],
  ['master-recipes.json', {
    version: '3.0.0', generated: now, total: allRecipes.length, recipes: allRecipes,
  }],
  ['master-artifacts.json', {
    version: '3.0.0', generated: now, total: allArtifacts.length,
    note: 'Honor discovery.hiddenUntilFound in player-facing UIs (D3).',
    artifacts: allArtifacts,
  }],
  ['master-professions.json', {
    version: '3.0.0', generated: now,
    totalGathering: Object.keys(masterProfessions.gathering).length,
    totalCrafting: Object.keys(masterProfessions.crafting).length,
    totalNodes: profNodeCount,
    ...masterProfessions,
  }],
  ['master-skillTrees.json', {
    version: '3.0.0', generated: now,
    totalClasses: Object.keys(masterSkillTrees).length,
    totalSkills: classSkillCount,
    skillTrees: masterSkillTrees,
  }],
  ['master-weaponSkills.json', {
    version: '3.0.0', generated: now,
    totalWeaponTypes: masterWeaponSkills.weaponTypes.length,
    totalSkills: weaponSkillCount,
    ...masterWeaponSkills,
  }],
  ['master-registry.json', {
    version: '3.0.0', generated: now,
    totals: {
      weapons: allItems.length, armor: allArmor.length,
      consumables: allConsumables.length, materials: allMaterials.length,
      recipes: allRecipes.length, artifacts: allArtifacts.length,
      professions: Object.keys(masterProfessions.crafting).length,
      professionNodes: profNodeCount,
      classSkills: classSkillCount,
      weaponSkills: weaponSkillCount,
    },
    byUuid: Object.fromEntries([
      ...allItems.map(i => [i.uuid, { kind: i.type, name: i.name, category: i.category, tier: i.tier }]),
      ...allArmor.map(i => [i.uuid, { kind: 'armor', name: i.name, material: i.material, slot: i.slotType, tier: i.tier }]),
      ...allConsumables.map(i => [i.uuid, { kind: i.type, name: i.name, category: i.category }]),
      ...allMaterials.map(m => [m.uuid, { kind: 'material', name: m.name, category: m.category, tier: m.tier }]),
      ...allArtifacts.map(a => [a.uuid, { kind: 'artifact', name: a.name, artifactType: a.artifactType }]),
      ...Object.values(masterProfessions.crafting).map(p => [p.uuid, { kind: 'profession', name: p.name, role: p.role }]),
      ...allProfessionNodes.map(n => [n.uuid, { kind: 'profession-node', name: n.name, profession: n.profession, reqLevel: n.reqLevel, branch: n.branch }]),
      ...Object.values(masterSkillTrees).map(s => [s.uuid, { kind: 'class', name: s.className }]),
    ]),
  }],
];
for (const [name, data] of outputs) {
  writeFileSync(join(API_DIR, name), JSON.stringify(data, null, 2));
}

console.log('\nMaster database generated:');
for (const [name, data] of outputs) {
  const size = data.total ?? data.totalItems ?? Object.keys(data.byUuid || {}).length;
  console.log(`  api/v1/${name}  - ${size} rows`);
}
