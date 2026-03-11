#!/usr/bin/env node
/**
 * extract-game-data.mjs
 * Extracts game data from GrudgeWars JS source files into clean JSON for ObjectStore API.
 * Usage: node scripts/extract-game-data.mjs [grudgewars-path]
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const ROOT = path.resolve(__dirname, '..');
const GW_SRC = process.argv[2] || path.resolve(ROOT, '..', 'GrudgeWars', 'src', 'data');
const API_DIR = path.resolve(ROOT, 'api', 'v1');

function readSrc(file) {
  return fs.readFileSync(path.join(GW_SRC, file), 'utf-8');
}

function stripImports(code) {
  return code.replace(/^import\s+.*$/gm, '');
}

function stripExports(code) {
  return code
    .replace(/^export\s+const\s+/gm, 'var ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+\{[^}]*\};?\s*$/gm, '')
    .replace(/^export\s+default\s+/gm, 'var __default = ');
}

function constToVar(code) {
  return code.replace(/\bconst\s+/g, 'var ').replace(/\blet\s+/g, 'var ');
}

function cleanCode(code) {
  return constToVar(stripExports(stripImports(code)));
}

function evalData(code, extraContext = {}) {
  const ctx = vm.createContext({ Math, Date, console, JSON, Object, Array, String, Number, Set, parseInt, parseFloat, ...extraContext });
  vm.runInContext(code, ctx);
  return ctx;
}

function writeJson(filename, data) {
  const out = path.join(API_DIR, filename);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data, null, 2));
  const size = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`  ✓ ${filename} (${size} KB)`);
}

console.log(`\nExtracting game data from: ${GW_SRC}\n`);

// --- 1. Quests ---
try {
  let code = cleanCode(readSrc('quests.js'));
  // Inline QUEST_TYPES since it's referenced in the data
  const ctx = evalData(code);
  writeJson('quests.json', {
    questTypes: ctx.QUEST_TYPES,
    zoneQuests: ctx.ZONE_QUESTS,
    totalZones: Object.keys(ctx.ZONE_QUESTS).length,
    totalQuests: Object.values(ctx.ZONE_QUESTS).flat().length,
  });
} catch (e) { console.error('  ✗ quests.json:', e.message); }

// --- 2. Dialogue ---
try {
  let code = readSrc('dialogue.js');
  code = constToVar(stripExports(stripImports(code)));
  const ctx = evalData(code);
  writeJson('dialogue.json', {
    idleChatter: ctx.IDLE_CHATTER,
    responses: ctx.RESPONSES,
    genericChatter: ctx.GENERIC_CHATTER,
    goalChatter: ctx.GOAL_CHATTER,
    quickResponses: ctx.QUICK_RESPONSES,
    raceChatter: ctx.RACE_CHATTER,
    classChatter: ctx.CLASS_CHATTER,
  });
} catch (e) { console.error('  ✗ dialogue.json:', e.message); }

// --- 3. Missions ---
try {
  let code = cleanCode(readSrc('missions.js'));
  const ctx = evalData(code);
  writeJson('missions.json', {
    missions: ctx.missionTemplates,
    arenaTemplates: ctx.arenaTemplates,
    totalMissions: ctx.missionTemplates?.length || 0,
    totalArenas: ctx.arenaTemplates?.length || 0,
  });
} catch (e) { console.error('  ✗ missions.json:', e.message); }

// --- 4. World Map ---
try {
  let code = cleanCode(readSrc('worldMapData.js'));
  const ctx = evalData(code);
  writeJson('worldMap.json', {
    locations: ctx.locationPositions,
    paths: ctx.pathConnections,
    icons: ctx.locationIcons,
    terrainRegions: ctx.terrainRegions,
    portalLocations: ctx.portalLocations,
    godFightLocations: ctx.godFightLocations,
    zoneLabels: ctx.zoneLabelMap,
    totalLocations: Object.keys(ctx.locationPositions).length,
    totalPaths: ctx.pathConnections?.length || 0,
  });
} catch (e) { console.error('  ✗ worldMap.json:', e.message); }

// --- 5. Random Events ---
try {
  let code = cleanCode(readSrc('randomEvents.js'));
  const ctx = evalData(code);
  writeJson('randomEvents.json', {
    eventTemplates: ctx.EVENT_TEMPLATES,
    totalEvents: ctx.EVENT_TEMPLATES?.length || 0,
  });
} catch (e) { console.error('  ✗ randomEvents.json:', e.message); }

// --- 6. Battle Formations ---
try {
  let code = cleanCode(readSrc('battleRows.js'));
  const ctx = evalData(code);
  writeJson('battleFormations.json', {
    playerRows: ctx.PLAYER_ROWS,
    enemyRows: ctx.ENEMY_ROWS,
    rangedWeaponTypes: ctx.RANGED_WEAPON_TYPES,
  });
} catch (e) { console.error('  ✗ battleFormations.json:', e.message); }

// --- 7. Regions ---
try {
  let code = readSrc('regionWalkData.js');
  code = constToVar(stripExports(stripImports(code)));
  // Remove localStorage references
  code = code.replace(/localStorage\.\w+\([^)]*\)/g, "'{}'");
  // Fix catch {} (no param) for vm compatibility
  code = code.replace(/catch\s*\{/g, 'catch(e){');
  const ctx = evalData(code, { localStorage: { getItem: () => '{}', setItem: () => {} } });
  writeJson('regions.json', {
    regions: ctx.REGIONS,
    zoneToRegion: ctx.ZONE_TO_REGION,
    totalRegions: Object.keys(ctx.REGIONS).length,
  });
} catch (e) { console.error('  ✗ regions.json:', e.message); }

// --- 8. Equipment ---
try {
  let code = readSrc('equipment.js');
  code = constToVar(stripExports(stripImports(code)));
  // Mock getWeaponIcon/getArmorIcon functions
  code = `function getWeaponIcon(t){return '/icons/weapons/'+t+'.png';}\n`
       + `function getArmorIcon(t){return '/icons/armor/'+t+'.png';}\n`
       + `const OBJECTSTORE_BASE = 'https://molochdagod.github.io/ObjectStore';\n`
       + code;
  const ctx = evalData(code, { Set: Set });
  writeJson('equipment.json', {
    slots: ctx.EQUIPMENT_SLOTS,
    tiers: ctx.TIERS,
    tierFlatBonus: ctx.TIER_FLAT_BONUS,
    displayStatMap: ctx.DISPLAY_STAT_MAP,
    upgradeCosts: ctx.UPGRADE_COSTS,
    weaponTypes: ctx.WEAPON_TYPES,
    weaponSkills: ctx.WEAPON_SKILLS,
  });
} catch (e) { console.error('  ✗ equipment.json:', e.message); }

// --- 9. Skill Trees ---
try {
  let code = readSrc('skillTrees.js');
  code = constToVar(stripExports(stripImports(code)));
  // Mock SK function and OBJECTSTORE_BASE
  code = `var OBJECTSTORE_BASE = 'https://molochdagod.github.io/ObjectStore';\n`
       + `var SK = function(cls, n) { return OBJECTSTORE_BASE + '/icons/skill_nobg/' + cls + '_' + String(n).padStart(2,'0') + '_nobg.png'; };\n`
       + code;
  const ctx = evalData(code);
  writeJson('skillTrees.json', {
    skillTrees: ctx.skillTrees,
    totalClasses: Object.keys(ctx.skillTrees).length,
  });
} catch (e) { console.error('  ✗ skillTrees.json:', e.message); }

// --- 10. Enemies ---
try {
  let code = readSrc('enemies.js');
  code = constToVar(stripExports(stripImports(code)));
  // Mock calculateStats and class/race definitions
  code = `function calculateStats(){return {};}\n`
       + `var classDefinitions = {};\nvar raceDefinitions = {};\n`
       + code;
  const ctx = evalData(code);
  const enemies = ctx.enemyTemplates;
  const bosses = {};
  const regular = {};
  for (const [k, v] of Object.entries(enemies)) {
    if (v.isBoss) bosses[k] = v;
    else regular[k] = v;
  }
  writeJson('enemyTemplates.json', {
    enemies: regular,
    bosses,
    totalEnemies: Object.keys(regular).length,
    totalBosses: Object.keys(bosses).length,
  });
} catch (e) { console.error('  ✗ enemyTemplates.json:', e.message); }

// --- 11. Lore ---
try {
  const loreText = fs.readFileSync(path.join(GW_SRC, 'loreHeroes.txt'), 'utf-8');
  // Parse hero entries from the structured text
  const heroBlocks = loreText.split(/^HERO #\d+:/gm).filter(b => b.trim());
  const gods = [];
  const heroes = [];
  
  // Extract god sections
  const godMatches = loreText.matchAll(/GOD:\s+(.+?)[\n\r]═+[\s\S]*?(?=GOD:|={40,}\s+FACTION)/g);
  for (const m of godMatches) {
    const block = m[0];
    const name = m[1].trim();
    const factionMatch = block.match(/Faction Patron:\s*(.+)/);
    const domainMatch = block.match(/Domain:\s*(.+)/);
    const blessingMatch = block.match(/Blessing Effect:\s*(.+)/);
    gods.push({
      name,
      faction: factionMatch?.[1]?.trim(),
      domain: domainMatch?.[1]?.trim(),
      blessing: blessingMatch?.[1]?.trim(),
    });
  }
  
  // Extract hero entries
  const heroMatches = loreText.matchAll(/HERO #(\d+):\s*(.+?)[\n\r]═+[\s\S]*?(?=HERO #|$)/g);
  for (const m of heroMatches) {
    const block = m[0];
    const id = block.match(/ID:\s*(\S+)/)?.[1];
    const race = block.match(/RACE:\s*(\S+)/)?.[1];
    const cls = block.match(/CLASS:\s*(\S+)/)?.[1];
    const faction = block.match(/FACTION:\s*(.+)/)?.[1]?.trim();
    const title = block.match(/TITLE:\s*(.+)/)?.[1]?.trim();
    heroes.push({ id, name: m[2].trim(), race, class: cls, faction, title });
  }
  
  writeJson('lore.json', {
    gods,
    heroes,
    totalGods: gods.length,
    totalHeroes: heroes.length,
    rawTextUrl: 'https://raw.githubusercontent.com/MolochDaGod/ObjectStore/main/docs/loreHeroes.txt',
  });
  
  // Also copy the full lore text to docs
  const docsDir = path.resolve(ROOT, 'docs');
  fs.copyFileSync(path.join(GW_SRC, 'loreHeroes.txt'), path.join(docsDir, 'loreHeroes.txt'));
  console.log('  ✓ docs/loreHeroes.txt (full text)');
} catch (e) { console.error('  ✗ lore.json:', e.message); }

// --- 12. Zone Cutscenes ---
try {
  let code = readSrc('zoneCutscenes.js');
  code = constToVar(stripExports(stripImports(code)));
  const ctx = evalData(code);
  const data = ctx.ZONE_CUTSCENES || ctx.zoneCutscenes;
  if (data) {
    writeJson('cutscenes.json', {
      cutscenes: data,
      totalCutscenes: Object.keys(data).length,
    });
  } else {
    console.error('  ✗ cutscenes.json: no ZONE_CUTSCENES found');
  }
} catch (e) { console.error('  ✗ cutscenes.json:', e.message); }

console.log('\nDone! All game data extracted to api/v1/\n');
