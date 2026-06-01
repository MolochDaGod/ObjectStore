#!/usr/bin/env node
/**
 * build-items-json.js
 * Parses GRUDGE_Item_Database.html and extracts every item into
 * api/v1/items-database.json — the single source of truth for all apps.
 *
 * Usage:  node scripts/build-items-json.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'GRUDGE_Item_Database.html');
const OUT_PATH = path.join(ROOT, 'api', 'v1', 'items-database.json');

const ICON_BASE = 'https://objectstore.grudge-studio.com';

// Category keyword → normalised category id
const CATEGORY_MAP = {
  'weapon': 'weapon',
  'armor': 'armor',
  'relic': 'relic',
  'ring': 'ring',
  'offhand': 'offhand',
  'skill': 'skill',
  'consumable': 'consumable',
  'material': 'material',
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseStatValue(text) {
  // "+15 Damage" → { stat: "damage", value: 15 }
  const m = text.match(/([+-]?\d+)\s+(.+)/);
  if (!m) return null;
  return { stat: m[2].trim().toLowerCase(), value: parseInt(m[1], 10) };
}

function parsePriceValue(text) {
  // "10 gold" → 10
  const m = text.match(/(\d+)\s*gold/i);
  return m ? parseInt(m[1], 10) : null;
}

function extractItems(html) {
  const items = [];
  // Match each item-card div block
  const cardRegex = /<div\s+class="item-card"[^>]*data-name="([^"]*)"[^>]*data-category="([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div\s+class="item-card"|<\/div>\s*<div\s+class="footer")/g;

  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const [, name, category, body] = match;

    // Extract icon image URL
    let icon = null;
    const imgMatch = body.match(/<img\s+src="([^"]+)"/);
    if (imgMatch) {
      icon = imgMatch[1];
      // Make absolute if relative
      if (icon.startsWith('./') || icon.startsWith('icons/')) {
        icon = ICON_BASE + '/' + icon.replace(/^\.\//, '');
      }
    }

    // Extract stats from item-stats div
    const stats = {};
    const statsBlockMatch = body.match(/<div\s+class="item-stats">([\s\S]*?)<\/div>\s*<div\s+class="tooltip"/);
    if (statsBlockMatch) {
      const statsHtml = statsBlockMatch[1];
      // Each stat line is in a <div>
      const statDivRegex = /<div[^>]*>([^<]+)<\/div>/g;
      let sm;
      while ((sm = statDivRegex.exec(statsHtml)) !== null) {
        const line = sm[1].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, '').trim();

        if (line.includes('Required Level')) {
          const lm = line.match(/(\d+)/);
          if (lm) stats.requiredLevel = parseInt(lm[1], 10);
        } else if (line.includes('Tier')) {
          const tm = line.match(/T(\d+)/);
          if (tm) stats.tier = parseInt(tm[1], 10);
        } else if (line.includes('Skill Slots')) {
          const slm = line.match(/(\d+)/);
          if (slm) stats.skillSlots = parseInt(slm[1], 10);
        } else if (line.includes('Max Stack')) {
          const stm = line.match(/(\d+)/);
          if (stm) stats.maxStack = parseInt(stm[1], 10);
        } else if (line.includes('Sell Price')) {
          stats.sellPrice = parsePriceValue(line);
        } else if (line.includes('Buy Price')) {
          stats.buyPrice = parsePriceValue(line);
        } else if (line.match(/[+-]\d+/)) {
          const sv = parseStatValue(line);
          if (sv) stats[sv.stat] = sv.value;
        }
      }
    }

    // Extract tooltip
    let tooltip = '';
    const tipMatch = body.match(/<div\s+class="tooltip">([\s\S]*?)<\/div>/);
    if (tipMatch) {
      tooltip = tipMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    }

    const normalCat = CATEGORY_MAP[category.toLowerCase()] || category.toLowerCase();

    items.push({
      id: slugify(name),
      name: name,
      category: normalCat,
      icon: icon,
      stats: stats,
      tooltip: tooltip,
    });
  }

  return items;
}

function main() {
  console.log('Reading', HTML_PATH);
  if (!fs.existsSync(HTML_PATH)) {
    console.error('ERROR: GRUDGE_Item_Database.html not found at', HTML_PATH);
    process.exit(1);
  }

  const html = fs.readFileSync(HTML_PATH, 'utf8');
  console.log(`HTML size: ${(html.length / 1024).toFixed(0)} KB`);

  // Fallback: also try a simpler regex if the nested-div approach misses items
  let items = extractItems(html);

  // If the nested regex didn't work well, use a simpler per-card approach
  if (items.length < 20) {
    console.log('Primary regex found only', items.length, 'items, trying fallback...');
    items = extractItemsFallback(html);
  }

  // Deduplicate by id (keep first occurrence)
  const seen = new Set();
  const deduped = [];
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      deduped.push(item);
    }
  }

  const output = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    source: 'GRUDGE_Item_Database.html',
    totalItems: deduped.length,
    categories: [...new Set(deduped.map(i => i.category))].sort(),
    items: deduped,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n✅ Wrote ${deduped.length} items to ${OUT_PATH}`);
  console.log('Categories:', output.categories.join(', '));

  // Stats summary
  const byCat = {};
  for (const item of deduped) {
    byCat[item.category] = (byCat[item.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
}

/**
 * Fallback extraction: find every data-name/data-category pair, then
 * scan forward for the icon img and stats.
 */
function extractItemsFallback(html) {
  const items = [];
  const cardStart = /data-name="([^"]*)"[^>]*data-category="([^"]*)"/g;
  let m;

  while ((m = cardStart.exec(html)) !== null) {
    const name = m[1];
    const category = m[2];
    const startIdx = m.index;

    // Grab next ~3000 chars for this card's content
    const chunk = html.substring(startIdx, startIdx + 3000);

    // Icon
    let icon = null;
    const imgM = chunk.match(/<img\s+src="([^"]+)"/);
    if (imgM) {
      icon = imgM[1];
      if (!icon.startsWith('http')) {
        icon = ICON_BASE + '/' + icon.replace(/^\.\//, '');
      }
    }

    // Stats
    const stats = {};
    // Required Level
    const lvlM = chunk.match(/Required Level:\s*(\d+)/);
    if (lvlM) stats.requiredLevel = parseInt(lvlM[1], 10);

    // Damage
    const dmgM = chunk.match(/[+-](\d+)\s+Damage/);
    if (dmgM) stats.damage = parseInt(dmgM[1], 10);

    // Defense
    const defM = chunk.match(/[+-](\d+)\s+Defense/);
    if (defM) stats.defense = parseInt(defM[1], 10);

    // Health
    const hpM = chunk.match(/[+-](\d+)\s+Health/);
    if (hpM) stats.health = parseInt(hpM[1], 10);

    // Mana
    const manaM = chunk.match(/[+-](\d+)\s+Mana/);
    if (manaM) stats.mana = parseInt(manaM[1], 10);

    // Crit
    const critM = chunk.match(/[+-](\d+)\s+Crit/);
    if (critM) stats.crit = parseInt(critM[1], 10);

    // Block
    const blockM = chunk.match(/[+-](\d+)\s+Block/);
    if (blockM) stats.block = parseInt(blockM[1], 10);

    // Speed
    const spdM = chunk.match(/[+-](\d+)\s+Speed/);
    if (spdM) stats.speed = parseInt(spdM[1], 10);

    // Tier
    const tierM = chunk.match(/Tier:\s*T(\d+)/);
    if (tierM) stats.tier = parseInt(tierM[1], 10);

    // Skill Slots
    const slotM = chunk.match(/Skill Slots:\s*(\d+)/);
    if (slotM) stats.skillSlots = parseInt(slotM[1], 10);

    // Max Stack
    const stackM = chunk.match(/Max Stack:\s*(\d+)/);
    if (stackM) stats.maxStack = parseInt(stackM[1], 10);

    // Buy/Sell
    const sellM = chunk.match(/Sell Price:\s*(\d+)\s*gold/);
    if (sellM) stats.sellPrice = parseInt(sellM[1], 10);
    const buyM = chunk.match(/Buy Price:\s*(\d+)\s*gold/);
    if (buyM) stats.buyPrice = parseInt(buyM[1], 10);

    // Tooltip
    let tooltip = '';
    const tipM = chunk.match(/<div\s+class="tooltip">([\s\S]*?)<\/div>/);
    if (tipM) {
      tooltip = tipM[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    }

    const normalCat = CATEGORY_MAP[category.toLowerCase()] || category.toLowerCase();

    items.push({
      id: slugify(name),
      name,
      category: normalCat,
      icon,
      stats,
      tooltip,
    });
  }

  return items;
}

main();
