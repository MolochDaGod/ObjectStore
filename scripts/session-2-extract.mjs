#!/usr/bin/env node
/**
 * Consolidation Session #2 -- hammers, greatswords, greataxes.
 * Output: docs/consolidation/session-2-hammers-greatswords-greataxes.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const AUDIT_PATH = join(ROOT, 'api', 'v1', '_audit', 'items-audit.json');
const LEGACY_PATH = join(ROOT, 'api', 'v1', 'items-legacy.json');
const MASTER_PATH = join(ROOT, 'api', 'v1', 'master-items.json');
const OUT_DIR = join(ROOT, 'docs', 'consolidation');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const audit = JSON.parse(readFileSync(AUDIT_PATH, 'utf8'));
const legacy = JSON.parse(readFileSync(LEGACY_PATH, 'utf8'));
const master = JSON.parse(readFileSync(MASTER_PATH, 'utf8'));

const TARGET = ['hammer', 'greatsword', 'greataxe'];
const catKey = { hammer: 'hammers', greatsword: 'greatswords', greataxe: 'greataxes' };

const currentByCat = {};
for (const t of TARGET) {
  currentByCat[t] = [];
  for (const item of master.items) {
    if (item.category === catKey[t] && item.tier === 1) {
      currentByCat[t].push({
        name: item.baseName || item.name,
        desc: item.description,
        iconUrl: item.iconUrl,
      });
    }
  }
}

const masterNames = new Set();
for (const i of master.items) masterNames.add((i.baseName || i.name).toLowerCase());

function classify(icon, name, tooltip) {
  const s = (icon + ' ' + name + ' ' + (tooltip || '')).toLowerCase();
  if (/(hammer|maul|mallet|crusher|pound|sledge|bludgeon).*(twohand|two.?hand|great|2h)|(twohand|two.?hand|2h).*(hammer|maul)/.test(s)) return 'hammer';
  if (/(greatsword|great sword|two.?hand.*sword|twohand.*sword)|runed great sword/.test(s)) return 'greatsword';
  if (/(greataxe|great axe|two.?hand.*axe|twohand.*axe|cleaver.*great|great.*cleaver)/.test(s)) return 'greataxe';
  if (/maul|mallet|sledge|crusher/.test(s)) return 'hammer';
  return null;
}

const legacyByCat = { hammer: [], greatsword: [], greataxe: [] };
for (const item of legacy.items) {
  if (item.category !== 'weapon') continue;
  if (masterNames.has((item.name || '').toLowerCase())) continue;
  const c = classify(item.icon || '', item.name || '', item.tooltip || '');
  if (c && legacyByCat[c]) legacyByCat[c].push(item);
}

const lines = [];
lines.push('# Consolidation Session #2 -- Hammers, Greatswords, Greataxes');
lines.push('');
lines.push('Same workflow as Session #1: wire bespoke icons, promote named legacy items, fold vanilla legacy items into T1 starters, and park misclassified items in `_holding/misclassified-weapons.md`.');
lines.push('');

lines.push('## Current Grudge-system items (already in master-items.json)');
lines.push('');
for (const t of TARGET) {
  const plural = catKey[t];
  lines.push(`### ${plural} (${currentByCat[t].length})`);
  for (const it of currentByCat[t]) {
    const icon = (it.iconUrl || '').split('/').pop();
    lines.push(`- **${it.name}** -- ${it.desc}`);
    lines.push(`    - icon now: \`${icon}\``);
  }
  lines.push('');
}

lines.push('## Bespoke icons available but not wired');
lines.push('');
for (const t of TARGET) {
  const plural = catKey[t];
  const block = audit.categories[plural]?.bespokeIconsMissingWiring || [];
  if (block.length === 0) {
    lines.push(`- **${plural}**: none on disk (yet)`);
  } else {
    lines.push(`- **${plural}**: ${block.length}`);
    for (const m of block) lines.push(`    - ${m.name} -> \`${m.proposedIcon}\``);
  }
}
lines.push('');

lines.push('## Legacy items to fold in');
lines.push('');

function fmtLegacy(item) {
  const tt = (item.tooltip || '').split('\n')[0];
  const dmg = item.stats?.damage ?? '?';
  const lvl = item.stats?.requiredLevel ?? '?';
  const icon = (item.icon || '').split('/').pop();
  return `- **${item.name}** -- dmg ${dmg}, level ${lvl}, icon \`${icon}\`${tt ? '  \n    _' + tt + '_' : ''}`;
}

for (const cat of TARGET) {
  const bucket = legacyByCat[cat];
  lines.push(`### legacy -> ${cat} (${bucket.length})`);
  if (bucket.length === 0) lines.push('_None surfaced by the classifier. Misclassified hammers/greatswords may be parked in `_holding/misclassified-weapons.md` -- review there._');
  else for (const it of bucket) lines.push(fmtLegacy(it));
  lines.push('');
}

lines.push('## Proposed defaults (will apply on "continue" unless you override)');
lines.push('');
lines.push('- **Iron Maul** (hammer starter), **Iron Greatsword** (greatsword starter), **Iron Greataxe** (greataxe starter).');
lines.push('- Keep existing 6 named items per category with their current stats and abilities, add `slug` fields.');
lines.push('- Wire bespoke icons for Titanmaul, Bloodcrusher, Skullsunder, Bloodreaver.');
lines.push('- Items in `_holding/misclassified-weapons.md` under "Session #2 - hammers" resolve into this session -- default: promote each to a new named hammer with its bespoke icon.');
lines.push('');

writeFileSync(join(OUT_DIR, 'session-2-hammers-greatswords-greataxes.md'), lines.join('\n'));
console.log('Wrote', join(OUT_DIR, 'session-2-hammers-greatswords-greataxes.md'));
for (const t of TARGET) console.log(`  current ${t}: ${currentByCat[t].length}, legacy ${t}: ${legacyByCat[t].length}`);
