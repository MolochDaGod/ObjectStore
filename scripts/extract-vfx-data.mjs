#!/usr/bin/env node
/**
 * Extract VFX sprite data from GRUDA-Wars spriteMap.js
 * Generates effectSprites.json and abilityEffects.json for ObjectStore API
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPRITE_MAP_PATH = join(__dirname, '..', '..', 'Warlord-Crafting-Suite', 'game-modes', 'GRUDA-Wars', 'GRUDA-Wars', 'src', 'data', 'spriteMap.js');
const OUT_DIR = join(__dirname, '..', 'api', 'v1');
const GRUDA_WARS_BASE = 'https://grudgewarlords.com';

console.log('Reading spriteMap.js...');
const src = readFileSync(SPRITE_MAP_PATH, 'utf-8');

// --- Extract effectSprites ---
function extractObject(source, varName) {
  const patterns = [
    new RegExp(`export\\s+const\\s+${varName}\\s*=\\s*\\{`, 'm'),
    new RegExp(`const\\s+${varName}\\s*=\\s*\\{`, 'm'),
  ];
  let startIdx = -1;
  for (const pat of patterns) {
    const m = pat.exec(source);
    if (m) { startIdx = m.index + m[0].length - 1; break; }
  }
  if (startIdx === -1) { console.warn(`Could not find ${varName}`); return null; }
  let depth = 0, i = startIdx;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') { depth--; if (depth === 0) break; }
  }
  const raw = source.slice(startIdx, i + 1);
  // Convert JS object literal to JSON-safe format
  let json = raw
    .replace(/\/\/.*$/gm, '')                       // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')               // Remove block comments
    .replace(/Array\.from\([^)]+\)/g, '[]')         // Replace Array.from with []
    .replace(/(\w+)\s*\(/g, '"$1"(')                // Don't break function calls
    .replace(/(['"])?(\w+)(['"])?\s*:/g, '"$2":')   // Quote keys
    .replace(/'/g, '"')                              // Single to double quotes
    .replace(/,\s*([}\]])/g, '$1')                  // Remove trailing commas
    .replace(/"(\w+)"\(/g, '$1(')                   // Restore function calls (won't parse anyway)
    .replace(/\\"Nature"s/g, "\\'Nature's")         // Fix Nature's
    ;
  return { raw, startIdx, endIdx: i + 1 };
}

// Parse effectSprites manually for reliability
function parseEffectSprites(source) {
  const result = {};
  const block = extractObject(source, 'effectSprites');
  if (!block) return result;
  const raw = block.raw;
  // Match entries like: key: { src: '...', ... }
  const entryRe = /(\w+)\s*:\s*\{([^}]+)\}/g;
  let m;
  while ((m = entryRe.exec(raw)) !== null) {
    const key = m[1];
    const body = m[2];
    const entry = {};
    // Extract string values
    const strRe = /(\w+)\s*:\s*'([^']+)'/g;
    let sm;
    while ((sm = strRe.exec(body)) !== null) entry[sm[1]] = sm[2];
    // Extract numeric values
    const numRe = /(\w+)\s*:\s*(\d+(?:\.\d+)?)/g;
    let nm;
    while ((nm = numRe.exec(body)) !== null) {
      if (!entry[nm[1]]) entry[nm[1]] = Number(nm[2]);
    }
    if (entry.src) result[key] = entry;
  }
  return result;
}

// Parse EFFECT_TYPE_TAGS
function parseEffectTypeTags(source) {
  const result = {};
  const block = extractObject(source, 'EFFECT_TYPE_TAGS');
  if (!block) return result;
  const raw = block.raw;
  const entryRe = /(\w+)\s*:\s*\[([^\]]+)\]/g;
  let m;
  while ((m = entryRe.exec(raw)) !== null) {
    const key = m[1];
    const items = m[2].match(/'([^']+)'/g);
    if (items) result[key] = items.map(s => s.replace(/'/g, ''));
  }
  return result;
}

// Parse ability effect maps (abilityEffectMap, weaponSkillEffectMap, enemyAbilityEffects)
function parseAbilityMap(source, varName) {
  const result = {};
  const block = extractObject(source, varName);
  if (!block) return result;
  const raw = block.raw;

  // For nested maps (abilityEffectMap has class keys)
  if (varName === 'abilityEffectMap') {
    const classRe = /(\w+)\s*:\s*\{/g;
    let cm;
    let depth = 0;
    // Find top-level class keys
    const classBlocks = [];
    for (let i = 1; i < raw.length - 1; i++) {
      if (raw[i] === '{') depth++;
      else if (raw[i] === '}') depth--;
    }
    // Simpler: extract class blocks
    const classes = ['warrior', 'mage', 'worge', 'ranger'];
    for (const cls of classes) {
      const clsRe = new RegExp(`${cls}\\s*:\\s*\\{`);
      const clsMatch = clsRe.exec(raw);
      if (!clsMatch) continue;
      let start = clsMatch.index + clsMatch[0].length - 1;
      let d = 0;
      for (let i = start; i < raw.length; i++) {
        if (raw[i] === '{') d++;
        else if (raw[i] === '}') { d--; if (d === 0) { classBlocks.push({ cls, body: raw.slice(start, i + 1) }); break; } }
      }
    }
    for (const { cls, body } of classBlocks) {
      result[cls] = parseAbilityEntries(body);
    }
  } else {
    // Flat map (weaponSkillEffectMap, enemyAbilityEffects)
    Object.assign(result, parseAbilityEntries(raw));
  }
  return result;
}

function parseAbilityEntries(body) {
  const result = {};
  // Match entries like: 'Ability Name': { effect: '...', beam: '...', ... }
  // or: ability_id: { effect: '...', ... }
  const entryRe = /(?:'([^']+)'|"([^"]+)"|(\w+))\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let m;
  while ((m = entryRe.exec(body)) !== null) {
    const key = m[1] || m[2] || m[3];
    const inner = m[4];
    if (!inner.includes('effect')) continue;
    const entry = {};
    // Extract effect
    const effectM = /effect\s*:\s*'([^']+)'/.exec(inner);
    if (effectM) entry.effect = effectM[1];
    // Extract beam
    const beamM = /beam\s*:\s*(?:'([^']*)'|null)/.exec(inner);
    entry.beam = beamM ? (beamM[1] || null) : null;
    // Extract anim
    const animM = /anim\s*:\s*'([^']+)'/.exec(inner);
    if (animM) entry.anim = animM[1];
    // Extract isAoE
    if (/isAoE\s*:\s*true/.test(inner)) entry.isAoE = true;
    // Extract effectFilter
    const filterM = /effectFilter\s*:\s*'([^']+)'/.exec(inner);
    if (filterM) entry.effectFilter = filterM[1];
    // Extract postHealEffect
    const postM = /postHealEffect\s*:\s*'([^']+)'/.exec(inner);
    if (postM) entry.postHealEffect = postM[1];
    // Extract followUp array
    const followUpM = /followUp\s*:\s*\[([^\]]+)\]/.exec(inner);
    if (followUpM) {
      const fuEntries = [];
      const fuRe = /\{([^}]+)\}/g;
      let fm;
      while ((fm = fuRe.exec(followUpM[1])) !== null) {
        const fu = {};
        const feM = /effect\s*:\s*'([^']+)'/.exec(fm[1]);
        if (feM) fu.effect = feM[1];
        const fdM = /delay\s*:\s*(\d+)/.exec(fm[1]);
        if (fdM) fu.delay = Number(fdM[1]);
        const ffM = /filter\s*:\s*'([^']+)'/.exec(fm[1]);
        if (ffM) fu.filter = ffM[1];
        if (fu.effect) fuEntries.push(fu);
      }
      if (fuEntries.length) entry.followUp = fuEntries;
    }
    if (entry.effect) result[key] = entry;
  }
  return result;
}

// Parse projectileSprites
function parseProjectileSprites(source) {
  const result = {};
  const block = extractObject(source, 'projectileSprites');
  if (!block) return result;
  const raw = block.raw;
  const entryRe = /(\w+)\s*:\s*\{([^}]+)\}/g;
  let m;
  while ((m = entryRe.exec(raw)) !== null) {
    const key = m[1];
    const body = m[2];
    const entry = {};
    const strRe = /(\w+)\s*:\s*'([^']+)'/g;
    let sm;
    while ((sm = strRe.exec(body)) !== null) entry[sm[1]] = sm[2];
    const numRe = /(\w+)\s*:\s*(\d+)/g;
    let nm;
    while ((nm = numRe.exec(body)) !== null) {
      if (!entry[nm[1]]) entry[nm[1]] = Number(nm[2]);
    }
    if (/animated\s*:\s*true/.test(body)) entry.animated = true;
    if (entry.src || entry.animated) result[key] = entry;
  }
  return result;
}

// Parse buffVisuals and weaponVisuals
function parseBuffVisuals(source) {
  const result = {};
  const block = extractObject(source, 'buffVisuals');
  if (!block) return result;
  const raw = block.raw;
  const entryRe = /(\w+)\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let m;
  while ((m = entryRe.exec(raw)) !== null) {
    const key = m[1];
    const body = m[2];
    const entry = {};
    const strRe = /(\w+)\s*:\s*'([^']+)'/g;
    let sm;
    while ((sm = strRe.exec(body)) !== null) entry[sm[1]] = sm[2];
    // Extract icon (unicode)
    const iconM = /icon\s*:\s*'([^']+)'/.exec(body);
    if (iconM) entry.icon = iconM[1];
    if (entry.effect) result[key] = entry;
  }
  return result;
}

function parseWeaponVisuals(source) {
  const result = {};
  const block = extractObject(source, 'weaponVisuals');
  if (!block) return result;
  const raw = block.raw;
  const entryRe = /(\w+)\s*:\s*\{([^}]+)\}/g;
  let m;
  while ((m = entryRe.exec(raw)) !== null) {
    const key = m[1];
    const body = m[2];
    const entry = {};
    const strRe = /(\w+)\s*:\s*'([^']+)'/g;
    let sm;
    while ((sm = strRe.exec(body)) !== null) entry[sm[1]] = sm[2];
    const nullRe = /(\w+)\s*:\s*null/g;
    let nm;
    while ((nm = nullRe.exec(body)) !== null) entry[nm[1]] = null;
    if (entry.name) result[key] = entry;
  }
  return result;
}

// Parse beamTrails
function parseBeamTrails(source) {
  const result = {};
  const block = extractObject(source, 'beamTrails');
  if (!block) return result;
  const raw = block.raw;
  const entryRe = /(\w+)\s*:\s*'([^']+)'/g;
  let m;
  while ((m = entryRe.exec(raw)) !== null) result[m[1]] = m[2];
  return result;
}

// --- Run extraction ---
console.log('Extracting effect sprites...');
const effectSprites = parseEffectSprites(src);
const effectTypeTags = parseEffectTypeTags(src);
const projectileSprites = parseProjectileSprites(src);
const buffVisuals = parseBuffVisuals(src);
const weaponVisuals = parseWeaponVisuals(src);
const beamTrails = parseBeamTrails(src);

// Build reverse tag lookup (effect -> categories)
const effectCategories = {};
for (const [cat, effects] of Object.entries(effectTypeTags)) {
  for (const fx of effects) {
    if (!effectCategories[fx]) effectCategories[fx] = [];
    effectCategories[fx].push(cat);
  }
}

// Build final effectSprites.json
const effectSpritesData = {
  version: '1.0.0',
  description: 'GRUDA-Wars VFX effect sprite definitions — frame data, categories, and rendering metadata',
  sourceBase: GRUDA_WARS_BASE,
  totalEffects: Object.keys(effectSprites).length,
  effects: {},
  categories: effectTypeTags,
  projectiles: projectileSprites,
  buffVisuals,
  weaponVisuals,
  beamTrails,
};

for (const [key, sprite] of Object.entries(effectSprites)) {
  effectSpritesData.effects[key] = {
    ...sprite,
    sourceUrl: `${GRUDA_WARS_BASE}${sprite.src}`,
    categories: effectCategories[key] || [],
  };
}

console.log(`  Found ${Object.keys(effectSprites).length} effects`);
console.log(`  Found ${Object.keys(effectTypeTags).length} categories`);
console.log(`  Found ${Object.keys(projectileSprites).length} projectiles`);

// --- Extract ability effects ---
console.log('Extracting ability effects...');
const abilityEffectMap = parseAbilityMap(src, 'abilityEffectMap');
const weaponSkillEffectMap = parseAbilityMap(src, 'weaponSkillEffectMap');
const enemyAbilityEffects = parseAbilityMap(src, 'enemyAbilityEffects');

let totalAbilities = 0;
for (const cls of Object.values(abilityEffectMap)) totalAbilities += Object.keys(cls).length;
totalAbilities += Object.keys(weaponSkillEffectMap).length;
totalAbilities += Object.keys(enemyAbilityEffects).length;

const abilityEffectsData = {
  version: '1.0.0',
  description: 'GRUDA-Wars ability-to-VFX effect mapping — class abilities, weapon skills, enemy abilities',
  totalAbilities,
  classAbilities: abilityEffectMap,
  weaponSkills: weaponSkillEffectMap,
  enemyAbilities: enemyAbilityEffects,
};

console.log(`  Found ${Object.keys(abilityEffectMap).length} classes`);
for (const [cls, abilities] of Object.entries(abilityEffectMap)) {
  console.log(`    ${cls}: ${Object.keys(abilities).length} abilities`);
}
console.log(`  Found ${Object.keys(weaponSkillEffectMap).length} weapon skills`);
console.log(`  Found ${Object.keys(enemyAbilityEffects).length} enemy abilities`);
console.log(`  Total: ${totalAbilities} abilities`);

// --- Write files ---
const effectSpritesPath = join(OUT_DIR, 'effectSprites.json');
const abilityEffectsPath = join(OUT_DIR, 'abilityEffects.json');

writeFileSync(effectSpritesPath, JSON.stringify(effectSpritesData, null, 2));
console.log(`\nWrote ${effectSpritesPath}`);

writeFileSync(abilityEffectsPath, JSON.stringify(abilityEffectsData, null, 2));
console.log(`Wrote ${abilityEffectsPath}`);

console.log('\nDone!');
