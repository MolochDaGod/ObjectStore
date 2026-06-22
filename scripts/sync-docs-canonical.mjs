#!/usr/bin/env node
/**
 * Keep https://info.grudge-studio.com/docs in sync with canonical api/v1 data.
 *
 * - Writes docs/canonical-manifest.json (machine-readable index of all endpoints)
 * - Refreshes the overview stats block in docs/index.html
 *
 * Run automatically on api/v1/** changes via .github/workflows/update-registry.yml
 * and manually: npm run sync:docs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'api', 'v1');
const DOCS_INDEX = join(ROOT, 'docs', 'index.html');
const MANIFEST_PATH = join(ROOT, 'docs', 'canonical-manifest.json');
const CANONICAL_URL = 'https://info.grudge-studio.com/docs';

function loadJSON(filename) {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf8'));
  } catch {
    return null;
  }
}

function countArray(data, ...path) {
  let cur = data;
  for (const p of path) {
    if (cur == null) return 0;
    cur = cur[p];
  }
  return Array.isArray(cur) ? cur.length : 0;
}

function countWeapons(weapons) {
  if (!weapons?.categories) return 0;
  let n = 0;
  for (const cat of Object.values(weapons.categories)) {
    n += (cat.items || []).length;
  }
  return n;
}

function countCategorized(data) {
  if (!data?.categories) return 0;
  let n = 0;
  for (const cat of Object.values(data.categories)) {
    n += (cat.items || []).length;
  }
  return n;
}

function countProfessions(masterProfessions) {
  if (!masterProfessions) return 0;
  if (typeof masterProfessions.totalProfessions === 'number') return masterProfessions.totalProfessions;
  const gathering = typeof masterProfessions.totalGathering === 'number' ? masterProfessions.totalGathering : 0;
  const crafting = typeof masterProfessions.totalCrafting === 'number' ? masterProfessions.totalCrafting : 0;
  if (gathering || crafting) return gathering + crafting;
  const g = masterProfessions.gathering ? Object.keys(masterProfessions.gathering).length : 0;
  const c = masterProfessions.crafting ? Object.keys(masterProfessions.crafting).length : 0;
  return g + c;
}

function countMasterItems(master) {
  if (!master) return 0;
  if (typeof master.totalItems === 'number') return master.totalItems;
  if (Array.isArray(master.items)) return master.items.length;
  if (Array.isArray(master)) return master.length;
  return 0;
}

function sha256File(path) {
  const buf = readFileSync(path);
  return createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

function pickTotal(primary, ...fields) {
  if (!primary) return 0;
  for (const f of fields) {
    if (typeof primary[f] === 'number') return primary[f];
  }
  return 0;
}

function buildStats() {
  const masterWeapons = loadJSON('master-weapons.json');
  const masterArmor = loadJSON('master-armor.json');
  const masterMaterials = loadJSON('master-materials.json');
  const masterConsumables = loadJSON('master-consumables.json');
  const weapons = masterWeapons || loadJSON('weapons.json');
  const armor = masterArmor || loadJSON('armor.json');
  const materials = masterMaterials || loadJSON('materials.json');
  const consumables = masterConsumables || loadJSON('master-consumables.json') || loadJSON('consumables.json');
  const enemies = loadJSON('enemies.json');
  const bosses = loadJSON('bosses.json');
  const weaponSkills = loadJSON('master-weaponSkills.json') || loadJSON('weaponSkills.json');
  const effectSprites = loadJSON('effectSprites.json');
  const abilityEffects = loadJSON('abilityEffects.json');
  const sprites2d = loadJSON('sprites2d.json');
  const factionUnits = loadJSON('factionUnits.json');
  const masterItems = loadJSON('master-items.json');
  const masterRecipes = loadJSON('master-recipes.json');
  const masterProfessions = loadJSON('master-professions.json');
  const masterRegistry = loadJSON('master-registry.json');
  const spriteChars = loadJSON('sprite-characters.json');
  const itemsDb = loadJSON('items-database.json');

  const jsonFiles = readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort();

  const files = jsonFiles.map((name) => {
    const full = join(DATA_DIR, name);
    const st = statSync(full);
    return {
      name,
      path: `/api/v1/${name}`,
      bytes: st.size,
      sha256: sha256File(full),
      mtime: st.mtime.toISOString(),
    };
  });

  const masterFiles = files.filter((f) => f.name.startsWith('master-'));

  return {
    canonicalUrl: CANONICAL_URL,
    generated: new Date().toISOString(),
    version: '5.0.0',
    totals: {
      weapons: pickTotal(masterWeapons, 'totalWeapons', 'total') || countWeapons(weapons) || countMasterItems(masterWeapons),
      armor: pickTotal(masterArmor, 'totalArmor', 'total') || countMasterItems(masterArmor),
      materials:
        pickTotal(masterMaterials, 'totalMaterials', 'total') ||
        countArray(materials, 'materials') ||
        countMasterItems(masterMaterials),
      consumables: pickTotal(masterConsumables, 'totalConsumables', 'total') || countMasterItems(masterConsumables),
      enemies: pickTotal(enemies, 'total', 'totalEnemies') || countCategorized(enemies) || countArray(enemies, 'enemies'),
      bosses: countArray(bosses, 'bosses'),
      weaponSkills: weaponSkills?.totalSkills ?? countArray(weaponSkills, 'skills') ?? 0,
      vfxEffects: effectSprites?.totalEffects ?? countArray(effectSprites, 'effects') ?? 0,
      battleAbilities: abilityEffects?.totalAbilities ?? countArray(abilityEffects, 'abilities') ?? 0,
      sprites2d: sprites2d?.totalSprites ?? countArray(sprites2d, 'sprites') ?? 0,
      factionUnits: factionUnits?.totalUnits ?? countArray(factionUnits, 'units') ?? 0,
      masterItems: countMasterItems(masterItems),
      masterRecipes: pickTotal(masterRecipes, 'totalRecipes', 'total') || countMasterItems(masterRecipes),
      masterProfessions: countProfessions(masterProfessions),
      registryEntries: masterRegistry?.totalEntries ?? Object.keys(masterRegistry?.entries || {}).length,
      unifiedItems: itemsDb?.totalItems ?? itemsDb?.items?.length ?? countMasterItems(itemsDb),
      spriteCharacters: spriteChars?.totalCharacters ?? spriteChars?.characters?.length ?? 0,
      apiEndpoints: jsonFiles.length,
      masterDatasets: masterFiles.length,
    },
    files,
    masterFiles: masterFiles.map((f) => f.name),
  };
}

function formatStatsHtml(stats) {
  const t = stats.totals;
  const lines = [
    `<li><strong>${t.weapons.toLocaleString()} Weapons</strong> across weapon categories with tier expansion (canonical: <code class="inline-code">master-weapons.json</code>)</li>`,
    `<li><strong>${t.armor.toLocaleString()} Equipment</strong> items — armor sets, gems, accessories</li>`,
    `<li><strong>${t.materials.toLocaleString()} Materials</strong> for crafting (ore, wood, cloth, leather, gems, essences)</li>`,
    `<li><strong>${t.consumables.toLocaleString()} Consumables</strong> including foods, potions, and engineer items</li>`,
    `<li><strong>${t.weaponSkills.toLocaleString()} Weapon Skills</strong> with icons, cooldowns, and prefab wiring</li>`,
    `<li><strong>${t.vfxEffects.toLocaleString()} VFX Effect Sprites</strong> with frame data and blend modes</li>`,
    `<li><strong>${t.battleAbilities.toLocaleString()} Battle Abilities</strong> with effect chains and follow-ups</li>`,
    `<li><strong>${t.masterProfessions.toLocaleString()} Professions</strong> with skill trees and <strong>${t.masterRecipes.toLocaleString()}</strong> recipes</li>`,
    `<li><strong>${t.factionUnits.toLocaleString()} Faction Units</strong> for RTS game mode</li>`,
    `<li><strong>${t.masterItems.toLocaleString()} Master Items</strong> with GRUDGE UUIDs (<code class="inline-code">master-items.json</code>)</li>`,
    `<li><strong>${t.registryEntries.toLocaleString()} Registry Entries</strong> in <code class="inline-code">master-registry.json</code></li>`,
    `<li><strong>${t.unifiedItems.toLocaleString()} Unified Items</strong> in items-database.json (browser UI)</li>`,
    `<li><strong>${t.spriteCharacters.toLocaleString()} Animated Characters</strong> in sprite-characters.json</li>`,
    `<li><strong>${t.apiEndpoints.toLocaleString()} API Endpoints</strong> — static JSON under <code class="inline-code">/api/v1/</code>, no auth required</li>`,
  ];
  return lines.join('\n        ');
}

function patchDocsIndex(stats) {
  let html = readFileSync(DOCS_INDEX, 'utf8');
  const statsBlock = formatStatsHtml(stats);
  const generated = new Date(stats.generated).toUTCString();

  html = html.replace(
    /<!-- CANONICAL_STATS:START -->[\s\S]*?<!-- CANONICAL_STATS:END -->/,
    `<!-- CANONICAL_STATS:START -->\n        ${statsBlock}\n      <!-- CANONICAL_STATS:END -->`,
  );

  html = html.replace(
    /<!-- CANONICAL_META:START -->[\s\S]*?<!-- CANONICAL_META:END -->/,
    `<!-- CANONICAL_META:START -->\n    <link rel="canonical" href="${CANONICAL_URL}">\n    <meta name="grudge-canonical-generated" content="${stats.generated}">\n    <!-- CANONICAL_META:END -->`,
  );

  if (!html.includes('CANONICAL_STATS:START')) {
    throw new Error('docs/index.html missing CANONICAL_STATS markers — add them around the overview <ul>');
  }

  html = html.replace(
    /<p class="intro">[^<]*<\/p>/,
    `<p class="intro">Canonical API reference for Grudge Studio ObjectStore — synced from <code class="inline-code">api/v1/master-*.json</code> on <strong>${generated}</strong>.</p>`,
  );

  html = html.replace(
    /<pre><code>https:\/\/info\.grudge-studio\.com<\/code><\/pre>/,
    `<pre><code>https://info.grudge-studio.com/docs</code></pre>`,
  );

  writeFileSync(DOCS_INDEX, html);
}

function main() {
  const stats = buildStats();
  writeFileSync(MANIFEST_PATH, JSON.stringify(stats, null, 2) + '\n');
  patchDocsIndex(stats);
  console.log(`[sync-docs] canonical manifest → ${MANIFEST_PATH}`);
  console.log(`[sync-docs] refreshed docs/index.html (${stats.totals.apiEndpoints} endpoints, ${stats.totals.masterItems} master items)`);
  console.log(`[sync-docs] canonical URL: ${CANONICAL_URL}`);
}

main();