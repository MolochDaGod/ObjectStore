#!/usr/bin/env node
/**
 * Consolidation Session #1 extractor — swords, axes, daggers.
 *
 * Pulls the legacy items-database.json entries that the audit flagged as
 * sword / axe / dagger candidates and formats them for user review.
 *
 * Output: docs/consolidation/session-1-swords-axes-daggers.md
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

const TARGET = ['sword', 'axe', 'dagger'];

// Pull current Grudge items in these categories
const currentByCat = {};
const catKey = { sword: 'swords', axe: 'axes', dagger: 'daggers' };
for (const t of TARGET) {
  currentByCat[t] = [];
  for (const item of master.items) {
    if (item.category === catKey[t] && item.tier === 1) {
      currentByCat[t].push({
        name: item.baseName || item.name,
        desc: item.description,
        mats: item.stats,
        iconUrl: item.iconUrl,
        abilities: item.abilities,
        signature: item.signature,
        passives: item.passives,
      });
    }
  }
}

// Pull legacy items that the audit guessed as this subcategory and aren't already in master
const masterNames = new Set();
for (const i of master.items) masterNames.add((i.baseName || i.name).toLowerCase());

function classify(icon, name) {
  const s = (icon + ' ' + name).toLowerCase();
  if (/sword|blade|rapier|saber/.test(s) && !/two.?hand|twohand/.test(s)) return 'sword-1h';
  if (/(two.?hand|twohand).*(sword|blade)|greatsword/.test(s)) return 'greatsword';
  if (/sword|blade/.test(s)) return 'sword';
  if (/cleaver|axe/.test(s) && /(two.?hand|twohand|great)/.test(s)) return 'greataxe';
  if (/cleaver|axe/.test(s)) return 'axe';
  if (/dagger|shiv|knife|stiletto|dirk/.test(s)) return 'dagger';
  return 'other';
}

const legacyByCat = { sword: [], axe: [], dagger: [], greatsword: [], greataxe: [], other: [] };
for (const item of legacy.items) {
  if (item.category !== 'weapon') continue;
  if (masterNames.has((item.name || '').toLowerCase())) continue;
  const c = classify(item.icon || '', item.name || '');
  if (c === 'sword-1h') legacyByCat.sword.push(item);
  else if (legacyByCat[c]) legacyByCat[c].push(item);
}

// Emit markdown
const lines = [];
lines.push('# Consolidation Session #1 — Swords, Axes, Daggers');
lines.push('');
lines.push('Goal: produce one authoritative list per category, with every item having a unique bespoke icon, a profession, a recipe, tier-8 stats, and a place in the new professions/class/RTS system. Legacy items fold into the new system (no auto-tagging); each group below needs your call.');
lines.push('');

// ===== Current Grudge items =====
lines.push('## Current Grudge-system items (already in master-items.json)');
lines.push('');
for (const t of TARGET) {
  const plural = catKey[t];
  lines.push(`### ${plural} (${currentByCat[t].length})`);
  for (const it of currentByCat[t]) {
    const icon = it.iconUrl.split('/').pop();
    lines.push(`- **${it.name}** — ${it.desc}`);
    lines.push(`    - icon now: \`${icon}\``);
    if (it.abilities?.length) lines.push(`    - abilities: ${it.abilities.join(', ')}`);
    if (it.signature) lines.push(`    - signature: ${it.signature}`);
    if (it.passives?.length) lines.push(`    - passives: ${it.passives.join(', ')}`);
  }
  lines.push('');
}

// ===== Bespoke icons on disk but not wired =====
lines.push('## Bespoke icons available but not wired');
lines.push('');
for (const t of TARGET) {
  const plural = catKey[t];
  const block = audit.categories[plural]?.bespokeIconsMissingWiring || [];
  if (block.length === 0) {
    lines.push(`- **${plural}**: none (all current items either have bespoke icons or we haven't drawn bespokes yet)`);
  } else {
    lines.push(`- **${plural}**: ${block.length}`);
    for (const m of block) lines.push(`    - ${m.name} → \`${m.proposedIcon}\``);
  }
}
lines.push('');

// ===== Legacy items to triage =====
lines.push('## Legacy items to fold in (items-legacy.json)');
lines.push('');
lines.push('Each legacy item below needs a decision: **(a)** fold into an existing current item as a reskin/rename, **(b)** fold in as a new named item in the same category, **(c)** move to a different category (e.g. greatsword → 2h swords), or **(d)** drop entirely.');
lines.push('');

function fmtLegacy(item) {
  const tt = (item.tooltip || '').split('\n')[0];
  const dmg = item.stats?.damage ?? '?';
  const lvl = item.stats?.requiredLevel ?? '?';
  const icon = (item.icon || '').split('/').pop();
  return `- **${item.name}** — dmg ${dmg}, level ${lvl}, icon \`${icon}\`${tt ? '  \n    _' + tt + '_' : ''}`;
}

for (const cat of ['sword', 'axe', 'dagger', 'greatsword', 'greataxe']) {
  const bucket = legacyByCat[cat];
  if (!bucket.length) continue;
  lines.push(`### legacy → ${cat} (${bucket.length})`);
  for (const it of bucket) lines.push(fmtLegacy(it));
  lines.push('');
}

if (legacyByCat.other.length) {
  lines.push(`### legacy → other / unclassified (${legacyByCat.other.length})`);
  for (const it of legacyByCat.other.slice(0, 40)) lines.push(fmtLegacy(it));
  if (legacyByCat.other.length > 40) lines.push(`- ... (+${legacyByCat.other.length - 40} more hidden for brevity)`);
  lines.push('');
}

// ===== Proposed consolidation =====
lines.push('## Proposed consolidation (my first draft — await your edits)');
lines.push('');
lines.push('For each current base item I propose keeping the existing name + signature + passives but:');
lines.push('');
lines.push('1. Wire the bespoke icon at `/icons/weapons/<slug>.png` so no two base items share an icon.');
lines.push('2. Move the item definition into `scripts/defs/weapons.mjs` with a `slug` field.');
lines.push('3. Fold any legacy item that is clearly a generic duplicate (e.g. "Club", "Wood Bow", "Blacksmiths Sword") into the T1 common-tier bucket of the matching base item, or drop it if redundant.');
lines.push('4. Any legacy item that has a distinct identity (e.g. named, quest-gated, unique tooltip) stays on the triage list for your call.');
lines.push('');
lines.push('Per-category proposals:');
lines.push('');
for (const t of TARGET) {
  const plural = catKey[t];
  lines.push(`### ${plural} — proposed`);
  for (const it of currentByCat[t]) {
    const slug = (it.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    lines.push(`- keep **${it.name}**, slug \`${slug}\`, bespoke icon: \`/icons/weapons/${slug}.png\``);
  }
  lines.push(`- fold legacy ${t}s (${legacyByCat[t].length}) into the T1 common-tier generic slot unless you call out named exceptions`);
  lines.push('');
}

writeFileSync(join(OUT_DIR, 'session-1-swords-axes-daggers.md'), lines.join('\n'));
console.log('Wrote', join(OUT_DIR, 'session-1-swords-axes-daggers.md'));
console.log('Counts:');
for (const t of TARGET) console.log(`  current ${t}: ${currentByCat[t].length}, legacy ${t}: ${legacyByCat[t].length}`);
console.log('  legacy greatswords/greataxes (for later session):', legacyByCat.greatsword.length, '/', legacyByCat.greataxe.length);
console.log('  legacy other weapons unclassified:', legacyByCat.other.length);
