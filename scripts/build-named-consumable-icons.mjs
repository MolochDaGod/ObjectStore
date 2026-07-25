#!/usr/bin/env node
/**
 * Build named consumable icons for Sprite Database + production CDN.
 *
 * Output (best-practice slugs):
 *   icons/consumables/{category}/{slug}.png
 *   icons/consumables/named/{slug}.png   (flat lookup)
 *
 * Sources (current pixel RPG style packs already in repo):
 *   icons/consumables/food_*.png, potion_*.png, alchemy_*.png
 *   icons/food/*.png, icons/potions/*.png, icons/496_rpg_icons/*
 *
 * Also patches:
 *   - api/v1/consumables.json  (slug, iconPath, iconFallback)
 *   - SPRITE_DATABASE.html     (prefer named path)
 *
 * Run: node scripts/build-named-consumable-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const iconsRoot = path.join(root, 'icons');
const consRoot = path.join(iconsRoot, 'consumables');

function toSlug(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function hashPick(seed, arr) {
  if (!arr.length) return null;
  const h = createHash('md5').update(String(seed)).digest();
  return arr[h[0] % arr.length];
}

function listPngs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .map((f) => path.join(dir, f));
}

const foodFiles = listPngs(path.join(iconsRoot, 'food'));
const potionFiles = listPngs(path.join(iconsRoot, 'potions'));
const consFiles = listPngs(consRoot);
const rpgFiles = listPngs(path.join(iconsRoot, '496_rpg_icons'));

const byName = (files) => {
  const m = new Map();
  for (const f of files) m.set(path.basename(f).toLowerCase(), f);
  return m;
};
const foodBy = byName(foodFiles);
const potionBy = byName(potionFiles);
const consBy = byName(consFiles);
const rpgBy = byName(rpgFiles);

function findContains(mapOrFiles, ...needles) {
  const entries =
    mapOrFiles instanceof Map
      ? [...mapOrFiles.entries()]
      : mapOrFiles.map((f) => [path.basename(f).toLowerCase(), f]);
  for (const n of needles) {
    const hit = entries.find(([k]) => k.includes(n));
    if (hit) return hit[1];
  }
  return null;
}

/** Semantic source pick matching current SPRITE_DATABASE style. */
function pickSource(item, category) {
  const n = (item.name || '').toLowerCase();
  const slug = toSlug(item.name);

  // Exact named already?
  const exact =
    consBy.get(`${slug}.png`) ||
    consBy.get(`${category}_${slug}.png`) ||
    foodBy.get(`${slug}.png`);
  if (exact) return exact;

  // Category-specific
  if (category === 'mysticPotions') {
    if (n.includes('health') || n.includes('heal') || n.includes('restore'))
      return consBy.get('health_potion.png') || rpgBy.get('p_red03.png');
    if (n.includes('mana'))
      return consBy.get('mana_potion.png') || rpgBy.get('p_blue03.png');
    if (n.includes('stamina'))
      return rpgBy.get('p_green03.png') || rpgBy.get('p_yellow01.png');
    if (n.includes('antidote') || n.includes('poison'))
      return rpgBy.get('i_antidote.png') || rpgBy.get('p_green05.png');
    if (n.includes('rage') || n.includes('berserker'))
      return rpgBy.get('p_red05.png') || rpgBy.get('p_red07.png');
    if (n.includes('speed') || n.includes('swift'))
      return rpgBy.get('p_yellow01.png');
    if (n.includes('strength') || n.includes('titan'))
      return rpgBy.get('p_red03.png');
    if (n.includes('defense') || n.includes('ward') || n.includes('invul'))
      return rpgBy.get('p_blue01.png') || potionBy.get('air_potion.png');
    if (n.includes('invis')) return rpgBy.get('p_white05.png');
    if (n.includes('fire'))
      return potionBy.get('fire_potion.png') || rpgBy.get('p_red05.png');
    if (n.includes('frost') || n.includes('ice'))
      return potionBy.get('air_potion.png') || rpgBy.get('p_blue05.png');
    if (n.includes('lightning')) return rpgBy.get('p_yellow01.png');
    if (n.includes('elixir') || n.includes('immortal') || n.includes('ultimate'))
      return rpgBy.get('p_medicine06.png') || potionBy.get('earth_potion.png');
    // hash into potion_N / alchemy_N
    const pots = consFiles.filter((f) => /potion_\d+\.png$/i.test(f));
    return hashPick(slug, pots) || consBy.get('potion_1.png');
  }

  if (category === 'engineerConsumables') {
    if (n.includes('bandage') || n.includes('medkit'))
      return rpgBy.get('p_medicine06.png') || findContains(rpgBy, 'medicine');
    if (n.includes('grenade') || n.includes('frag') || n.includes('flash') || n.includes('smoke') || n.includes('emp') || n.includes('incendiary'))
      return findContains(rpgBy, 'cannon') || hashPick(slug, consFiles.filter((f) => /alchemy_/.test(f)));
    if (n.includes('lure') || n.includes('fish'))
      return findContains(rpgBy, 'fish') || consBy.get('food_fish_red.png');
    if (n.includes('turret') || n.includes('repair'))
      return findContains(rpgBy, 'metal') || findContains(rpgBy, 'gear');
    return hashPick(slug, consFiles.filter((f) => /alchemy_/.test(f)));
  }

  // Foods
  if (n.includes('steak') || n.includes('pepper steak') || n.includes('hellfire'))
    return foodBy.get('95_steak.png') || consBy.get('food_steak_cooked.png');
  if (n.includes('burger'))
    return foodBy.get('15_burger.png') || consBy.get('food_bread.png');
  if (n.includes('bacon'))
    return foodBy.get('13_bacon.png') || consBy.get('food_meat_raw.png');
  if (n.includes('hot dog') || n.includes('sausage') || n.includes('skewer') || n.includes('kebab'))
    return foodBy.get('54_hotdog.png') || consBy.get('food_ham.png');
  if (n.includes('curry'))
    return foodBy.get('32_curry.png') || consBy.get('food_mushroom.png');
  if (n.includes('ramen') || n.includes('soup') || n.includes('stew') || n.includes('chowder') || n.includes('bisque') || n.includes('broth') || n.includes('gumbo'))
    return foodBy.get('87_ramen.png') || consBy.get('food_mushroom.png');
  if (n.includes('sushi') || n.includes('sashimi'))
    return foodBy.get('97_sushi.png') || consBy.get('food_fish_red.png');
  if (n.includes('salmon') || n.includes('fish'))
    return foodBy.get('88_salmon.png') || consBy.get('food_fish_silver.png');
  if (n.includes('chicken') || n.includes('roast') || n.includes('haunch') || n.includes('platter') || n.includes('ribs') || n.includes('wings'))
    return foodBy.get('85_roastedchicken.png') || consBy.get('food_ham.png');
  if (n.includes('bread') || n.includes('loaf') || n.includes('biscuit') || n.includes('sandwich'))
    return foodBy.get('07_bread.png') || foodBy.get('65_loafbread.png') || consBy.get('food_bread.png');
  if (n.includes('pie') || n.includes('cake') || n.includes('pastry') || n.includes('waffle') || n.includes('pancake') || n.includes('cookie') || n.includes('donut') || n.includes('pudding'))
    return (
      foodBy.get('05_apple_pie.png') ||
      foodBy.get('90_strawberrycake.png') ||
      foodBy.get('79_pancakes.png') ||
      consBy.get('food_croissant.png')
    );
  if (n.includes('pizza') || n.includes('taco') || n.includes('nacho'))
    return foodBy.get('81_pizza.png') || foodBy.get('99_taco.png');
  if (n.includes('dumpling') || n.includes('meatball') || n.includes('mac'))
    return foodBy.get('36_dumplings.png') || foodBy.get('69_meatball.png');
  if (n.includes('egg') || n.includes('omlet'))
    return foodBy.get('38_friedegg.png') || foodBy.get('73_omlet.png');
  if (n.includes('salad') || n.includes('greens') || n.includes('medley') || n.includes('garden') || n.includes('wrap'))
    return consBy.get('food_grapes.png') || consBy.get('food_carrot.png') || rpgBy.get('i_c_carrot.png');
  if (n.includes('tea') || n.includes('brew') || n.includes('grog') || n.includes('nectar') || n.includes('beer'))
    return consBy.get('food_beer.png') || foodBy.get('57_icecream.png');
  if (n.includes('mushroom') || n.includes('herb') || n.includes('bundle') || n.includes('salve'))
    return consBy.get('food_mushroom.png') || findContains(consBy, 'herb_');
  if (n.includes('fruit') || n.includes('apple') || n.includes('ambrosia') || n.includes('blossom'))
    return consBy.get('food_apple.png') || foodBy.get('05_apple_pie.png');
  if (n.includes('cheese'))
    return foodBy.get('67_macncheese.png') || consBy.get('food_cheese.png');
  if (n.includes('rabbit') || n.includes('meat') || n.includes('boar') || n.includes('wolf') || n.includes('bear') || n.includes('venison') || n.includes('lamb') || n.includes('cutlet') || n.includes('feast') || n.includes('cuts') || n.includes('burger'))
    return consBy.get('food_steak_cooked.png') || foodBy.get('95_steak.png');
  if (n.includes('crab') || n.includes('shell'))
    return consBy.get('food_crab.png');
  if (n.includes('mana') || n.includes('arcane') || n.includes('mystic') || n.includes('wizard') || n.includes('mage') || n.includes('astral') || n.includes('void') || n.includes('ethereal') || n.includes('cosmic') || n.includes('planar') || n.includes('ley') || n.includes('enchanted'))
    return consBy.get('food_mushroom.png') || hashPick(slug, consFiles.filter((f) => /alchemy_/.test(f)));

  // default by category color theme
  if (category === 'greenFoods')
    return consBy.get('food_grapes.png') || consBy.get('food_carrot.png') || consBy.get('food_apple.png');
  if (category === 'blueFoods')
    return consBy.get('food_mushroom.png') || consBy.get('food_bread.png') || consBy.get('food_beer.png');
  return consBy.get('food_steak_cooked.png') || foodBy.get('95_steak.png') || hashPick(slug, consFiles);
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function copyIcon(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

// ── Main ──────────────────────────────────────────────────────────
const consPath = path.join(root, 'api', 'v1', 'consumables.json');
const data = JSON.parse(fs.readFileSync(consPath, 'utf8'));

const report = {
  total: 0,
  written: 0,
  missingSource: [],
  byCategory: {},
  items: [],
};

for (const [cat, catData] of Object.entries(data.categories || {})) {
  report.byCategory[cat] = { count: 0, ok: 0 };
  for (const item of catData.items || []) {
    report.total++;
    report.byCategory[cat].count++;
    const slug = toSlug(item.name);
    const src = pickSource(item, cat);
    if (!src || !fs.existsSync(src)) {
      report.missingSource.push({ cat, name: item.name, slug });
      continue;
    }

    const relCat = path.join('icons', 'consumables', cat, `${slug}.png`);
    const relFlat = path.join('icons', 'consumables', 'named', `${slug}.png`);
    const absCat = path.join(root, relCat);
    const absFlat = path.join(root, relFlat);
    copyIcon(src, absCat);
    copyIcon(src, absFlat);

    // Enrich JSON for API consumers
    item.slug = slug;
    item.iconPath = `icons/consumables/${cat}/${slug}.png`;
    item.iconFallback = path.relative(iconsRoot, src).replace(/\\/g, '/');
    if (item.iconFallback && !item.iconFallback.startsWith('icons/')) {
      item.iconFallback = `icons/${item.iconFallback}`;
    }
    // Normalize path if src under icons/
    const relSrc = path.relative(root, src).replace(/\\/g, '/');
    item.iconFallback = relSrc.startsWith('icons/') ? relSrc : `icons/${path.basename(src)}`;

    report.written++;
    report.byCategory[cat].ok++;
    report.items.push({
      category: cat,
      name: item.name,
      slug,
      iconPath: item.iconPath,
      source: relSrc,
    });
  }
}

data.updated = new Date().toISOString().slice(0, 10);
data.iconScheme = 'consumables/{category}/{slug}.png';
data.version = data.version || '1.0.0';

fs.writeFileSync(consPath, JSON.stringify(data, null, 2) + '\n');
fs.writeFileSync(
  path.join(root, 'api', 'v1', '_meta', 'consumable-icons-report.json'),
  JSON.stringify(report, null, 2) + '\n',
);

// Update sprites.json consumables named entries if present
const spritesPath = path.join(root, 'api', 'v1', 'sprites.json');
if (fs.existsSync(spritesPath)) {
  try {
    const sprites = JSON.parse(fs.readFileSync(spritesPath, 'utf8'));
    if (!sprites.categories) sprites.categories = {};
    const named = report.items.map((it) => ({
      path: it.iconPath,
      filename: `${it.slug}.png`,
      category: it.category,
      name: it.name,
      size: fs.statSync(path.join(root, it.iconPath)).size,
    }));
    sprites.categories.consumables_named = {
      count: named.length,
      sprites: named,
    };
    fs.writeFileSync(spritesPath, JSON.stringify(sprites, null, 2) + '\n');
    console.log('Updated sprites.json consumables_named:', named.length);
  } catch (e) {
    console.warn('sprites.json update skipped:', e.message);
  }
}

console.log(
  JSON.stringify(
    {
      written: report.written,
      total: report.total,
      missing: report.missingSource.length,
      byCategory: report.byCategory,
    },
    null,
    2,
  ),
);
