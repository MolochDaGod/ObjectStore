#!/usr/bin/env node
/**
 * Grudge Item Audit — one-truth consolidation tool
 *
 * Reads every current Grudge item source and every icon source,
 * then produces:
 *   api/v1/_audit/items-audit.json     (machine-readable)
 *   docs/ITEMS_AUDIT.md                (human-readable)
 *
 * Per category the audit reports:
 *   - base item count, tier-expansion count, unique icons used
 *   - icon collisions (>1 base item using the same iconUrl)
 *   - items eligible for a bespoke `/icons/weapons/<slug>.png` that isn't wired in
 *   - items whose materials are not in the material registry
 *   - items lacking a tier, a profession, or a recipe
 *   - legacy-only items (in items-database.json but not in master-items.json)
 *
 * Usage: node scripts/audit-items.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const API_V1 = join(ROOT, 'api', 'v1');
const AUDIT_DIR = join(API_V1, '_audit');
const DOCS_DIR = join(ROOT, 'docs');
const ICONS_DIR = join(ROOT, 'icons');

if (!existsSync(AUDIT_DIR)) mkdirSync(AUDIT_DIR, { recursive: true });
if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });

// ------------------------------------------------------------
// Load sources
// ------------------------------------------------------------
function loadJson(relPath) {
  const fullPath = join(ROOT, relPath);
  if (!existsSync(fullPath)) return null;
  try {
    return JSON.parse(readFileSync(fullPath, 'utf8'));
  } catch (err) {
    console.warn(`[audit] Failed to parse ${relPath}: ${err.message}`);
    return null;
  }
}

const master = loadJson('api/v1/master-items.json') || { items: [] };
const recipes = loadJson('api/v1/master-recipes.json') || { recipes: [] };
const materialsRegistry = loadJson('api/v1/master-materials.json') || { materials: [] };
const legacy = loadJson('api/v1/items-database.json') || { items: [] };
const armor = loadJson('api/v1/armor.json') || { materials: {} };
const iconIndex = loadJson('icons/icon-index.json') || {};

// ------------------------------------------------------------
// Enumerate bespoke weapon icons
// ------------------------------------------------------------
const BESPOKE_WEAPONS = new Set();
const WEAPONS_DIR = join(ICONS_DIR, 'weapons');
if (existsSync(WEAPONS_DIR)) {
  for (const file of readdirSync(WEAPONS_DIR)) {
    if (!file.toLowerCase().endsWith('.png')) continue;
    // skip the numbered pack files (Sword_01.png, Bow_02.png, etc.)
    if (/^(Arrow|Bolt|Axe|Bow|Crossbow|Dagger|Hammer|Scythe|shield|Shield|Spear|staff|Staff|Sword|Book)[_\d]/i.test(file)) continue;
    BESPOKE_WEAPONS.add(file.replace(/\.png$/i, '').toLowerCase());
  }
}

const materialNames = new Set(materialsRegistry.materials.map(m => m.name));

// Index recipes by result item uuid
const recipeByUuid = new Map();
for (const r of recipes.recipes) recipeByUuid.set(r.uuid, r);
const recipeByResultItem = new Map();
for (const r of recipes.recipes) recipeByResultItem.set(r.resultItemId, r);

// ------------------------------------------------------------
// Build per-category buckets from master-items.json
// ------------------------------------------------------------
const slug = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const categories = {}; // cat -> { baseItems: Map<baseName, item>, tierCount: n, icons: Map<icon, Set<base>>, issues: [] }

function bucketFor(cat) {
  if (!categories[cat]) {
    categories[cat] = {
      baseItems: new Map(),
      tierCount: 0,
      iconToBases: new Map(),
      issues: [],
      legacyMatches: [],
    };
  }
  return categories[cat];
}

for (const item of master.items) {
  const b = bucketFor(item.category);
  b.tierCount++;
  const baseName = item.baseName || item.name;
  if (!b.baseItems.has(baseName)) b.baseItems.set(baseName, item);
  const icon = item.iconUrl || '(none)';
  if (!b.iconToBases.has(icon)) b.iconToBases.set(icon, new Set());
  b.iconToBases.get(icon).add(baseName);

  // Issue: missing profession / tier / recipe
  if (item.tier == null) b.issues.push({ kind: 'missing-tier', uuid: item.uuid, name: item.name });
  const starterLike = item.source === 'world-drop' || item.source === 'boss-drop' || item.source === 'quest' || item.type === 'artifact';
  if (!item.craftedBy && !starterLike && item.type !== 'potion' && item.type !== 'food') {
    b.issues.push({ kind: 'missing-profession', uuid: item.uuid, name: item.name });
  }
  if (!recipeByUuid.has(item.recipeUuid)) {
    b.issues.push({ kind: 'missing-recipe', uuid: item.uuid, name: item.name, recipeUuid: item.recipeUuid });
  }
  // Issue: recipe references materials not in registry
  const r = recipeByUuid.get(item.recipeUuid);
  if (r) {
    for (const mat of (r.materials || [])) {
      if (!materialNames.has(mat.name)) {
        b.issues.push({ kind: 'missing-material', uuid: item.uuid, name: item.name, material: mat.name });
      }
    }
  }
}

// Missing bespoke icon check (per base)
for (const [cat, b] of Object.entries(categories)) {
  for (const [baseName, item] of b.baseItems) {
    const slugName = slug(baseName);
    if (BESPOKE_WEAPONS.has(slugName) && !item.iconUrl.includes(`/icons/weapons/${slugName}.png`)) {
      b.issues.push({
        kind: 'bespoke-icon-not-wired',
        uuid: item.uuid,
        name: baseName,
        proposedIcon: `icons/weapons/${slugName}.png`,
        currentIcon: item.iconUrl,
      });
    }
  }
}

// Icon collisions per category
for (const [cat, b] of Object.entries(categories)) {
  for (const [icon, bases] of b.iconToBases) {
    if (bases.size > 1) {
      b.issues.push({
        kind: 'icon-collision',
        icon,
        bases: [...bases],
      });
    }
  }
}

// ------------------------------------------------------------
// Legacy items: items in items-database.json not in master
// ------------------------------------------------------------
const masterBaseNames = new Set();
for (const item of master.items) masterBaseNames.add((item.baseName || item.name).toLowerCase());

const legacyBuckets = {}; // category -> [{id, name, icon, tooltip, stats}]
const legacyTotals = {};
for (const item of (legacy.items || [])) {
  const cat = item.category || 'uncategorized';
  legacyTotals[cat] = (legacyTotals[cat] || 0) + 1;
  const nameLower = (item.name || '').toLowerCase();
  if (masterBaseNames.has(nameLower)) continue; // already in master (by name)
  if (!legacyBuckets[cat]) legacyBuckets[cat] = [];
  legacyBuckets[cat].push({
    id: item.id,
    name: item.name,
    icon: item.icon,
    tooltip: (item.tooltip || '').split('\n')[0],
    requiredLevel: item.stats?.requiredLevel ?? null,
    tier: item.stats?.tier ?? null,
    damage: item.stats?.damage ?? null,
    // Heuristic subcategory guess from icon path
    guessedSubcategory: guessSubcategory(item.icon || '', item.name || ''),
  });
}

function guessSubcategory(icon, name) {
  const tokens = icon.toLowerCase() + ' ' + name.toLowerCase();
  const map = [
    ['sword', /sword|blade/],
    ['axe', /axe|cleaver/],
    ['dagger', /dagger|shiv|knife/],
    ['hammer', /hammer|maul/],
    ['mace', /mace|flail|morning/],
    ['spear', /spear|lance|pike|javelin|trident/],
    ['bow', /bow/],
    ['crossbow', /crossbow|xbow/],
    ['gun', /gun|rifle|pistol|blaster|cannon/],
    ['staff', /staff|spire|scepter/],
    ['tome', /book|tome|spellbook|codex/],
    ['shield', /shield|buckler|aegis|bulwark/],
    ['armor-helm', /helm|hat|hood|cap|crown/],
    ['armor-chest', /chest|robe|breastplate|cuirass|tunic/],
    ['armor-boots', /boots|feet|greaves|sandals/],
    ['armor-gloves', /gloves|gauntlets|hands|bracers/],
    ['armor-legs', /legs|pants|leggings|trousers/],
    ['armor-belt', /belt|sash|girdle/],
    ['armor-back', /cape|cloak|back|mantle/],
    ['armor-shoulder', /shoulder|pauldron|spaulders/],
    ['accessory-ring', /ring/],
    ['accessory-necklace', /amulet|necklace|pendant|talisman/],
    ['food', /food|meat|bread|fruit|soup|stew|bbq|steak|pie/],
    ['potion', /potion|elixir|flask|tonic|brew/],
    ['material-ore', /ore/],
    ['material-ingot', /ingot/],
    ['material-wood', /log|plank|wood/],
    ['material-cloth', /cloth|linen|silk|wool|cotton|thread/],
    ['material-leather', /leather|hide|pelt|fur/],
    ['material-essence', /essence/],
    ['material-gem', /gem|crystal|shard/],
    ['material-herb', /herb|flower|petal|blossom/],
    ['scroll', /scroll/],
    ['throwable', /throwable|dart|shuriken|grenade/],
    ['bomb', /bomb|explosive/],
    ['relic', /relic/],
  ];
  for (const [label, re] of map) if (re.test(tokens)) return label;
  return 'unknown';
}

// ------------------------------------------------------------
// Shape output
// ------------------------------------------------------------
const auditSummary = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  sources: {
    master: master.totalItems ?? master.items.length,
    recipes: recipes.totalRecipes ?? recipes.recipes.length,
    materials: materialsRegistry.totalMaterials ?? materialsRegistry.materials.length,
    legacy: legacy.totalItems ?? (legacy.items ? legacy.items.length : 0),
    armor: armor.total ?? 0,
  },
  bespokeWeaponIcons: BESPOKE_WEAPONS.size,
  categories: {},
  legacyByCategory: {},
  legacyTotals,
};

for (const [cat, b] of Object.entries(categories)) {
  const baseNames = [...b.baseItems.keys()].sort();
  auditSummary.categories[cat] = {
    baseCount: baseNames.length,
    tierCount: b.tierCount,
    uniqueIcons: b.iconToBases.size,
    iconCollisions: [...b.iconToBases.entries()]
      .filter(([, s]) => s.size > 1)
      .map(([icon, s]) => ({ icon, bases: [...s] })),
    bespokeIconsMissingWiring: b.issues.filter(i => i.kind === 'bespoke-icon-not-wired'),
    missingMaterials: b.issues.filter(i => i.kind === 'missing-material'),
    missingProfessions: b.issues.filter(i => i.kind === 'missing-profession'),
    missingTiers: b.issues.filter(i => i.kind === 'missing-tier'),
    missingRecipes: b.issues.filter(i => i.kind === 'missing-recipe'),
    baseNames,
  };
}

for (const [cat, items] of Object.entries(legacyBuckets)) {
  auditSummary.legacyByCategory[cat] = {
    total: items.length,
    bySubcategory: items.reduce((acc, it) => {
      acc[it.guessedSubcategory] = (acc[it.guessedSubcategory] || 0) + 1;
      return acc;
    }, {}),
    items,
  };
}

writeFileSync(join(AUDIT_DIR, 'items-audit.json'), JSON.stringify(auditSummary, null, 2));

// ------------------------------------------------------------
// Markdown report
// ------------------------------------------------------------
const lines = [];
lines.push('# Grudge Items Audit');
lines.push('');
lines.push(`Generated: ${auditSummary.generated}`);
lines.push('');
lines.push('## Source totals');
lines.push(`- master-items: ${auditSummary.sources.master}`);
lines.push(`- master-recipes: ${auditSummary.sources.recipes}`);
lines.push(`- master-materials: ${auditSummary.sources.materials}`);
lines.push(`- items-database (legacy): ${auditSummary.sources.legacy}`);
lines.push(`- armor.json: ${auditSummary.sources.armor}`);
lines.push(`- bespoke weapon icons on disk: ${auditSummary.bespokeWeaponIcons}`);
lines.push('');

lines.push('## Current Grudge-system categories');
lines.push('');
const catKeys = Object.keys(auditSummary.categories).sort();
for (const cat of catKeys) {
  const c = auditSummary.categories[cat];
  lines.push(`### ${cat}`);
  lines.push(`- base items: **${c.baseCount}**  tier rows: ${c.tierCount}  unique icons: ${c.uniqueIcons}`);
  if (c.iconCollisions.length) {
    lines.push(`- icon collisions: **${c.iconCollisions.length}**`);
    for (const col of c.iconCollisions.slice(0, 10)) {
      lines.push(`    - \`${col.icon}\` shared by: ${col.bases.join(', ')}`);
    }
    if (c.iconCollisions.length > 10) lines.push(`    - ... (+${c.iconCollisions.length - 10} more)`);
  }
  if (c.bespokeIconsMissingWiring.length) {
    lines.push(`- bespoke icons on disk but NOT wired: **${c.bespokeIconsMissingWiring.length}**`);
    for (const m of c.bespokeIconsMissingWiring.slice(0, 10)) {
      lines.push(`    - ${m.name} \u2192 ${m.proposedIcon}`);
    }
    if (c.bespokeIconsMissingWiring.length > 10) lines.push(`    - ... (+${c.bespokeIconsMissingWiring.length - 10} more)`);
  }
  if (c.missingMaterials.length) {
    const unique = [...new Set(c.missingMaterials.map(m => m.material))];
    lines.push(`- recipes reference materials not in registry: ${unique.join(', ')}`);
  }
  if (c.missingProfessions.length) lines.push(`- items missing profession: ${c.missingProfessions.length}`);
  if (c.missingTiers.length) lines.push(`- items missing tier: ${c.missingTiers.length}`);
  if (c.missingRecipes.length) lines.push(`- items missing recipe: ${c.missingRecipes.length}`);
  lines.push(`- base names: ${c.baseNames.join(', ')}`);
  lines.push('');
}

lines.push('## Legacy items (items-database.json) not in master');
lines.push('');
const legKeys = Object.keys(auditSummary.legacyByCategory).sort();
for (const cat of legKeys) {
  const c = auditSummary.legacyByCategory[cat];
  lines.push(`### ${cat} (${c.total} not-in-master)`);
  const subs = Object.entries(c.bySubcategory).sort((a,b) => b[1]-a[1]);
  for (const [sub, count] of subs) lines.push(`- ${sub}: ${count}`);
  lines.push('');
}

lines.push('## Legacy totals (all items-database entries, including ones already in master)');
for (const [cat, n] of Object.entries(auditSummary.legacyTotals)) {
  lines.push(`- ${cat}: ${n}`);
}

writeFileSync(join(DOCS_DIR, 'ITEMS_AUDIT.md'), lines.join('\n'));

console.log('Audit complete.');
console.log(`  ${join(AUDIT_DIR, 'items-audit.json')}`);
console.log(`  ${join(DOCS_DIR, 'ITEMS_AUDIT.md')}`);
