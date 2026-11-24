#!/usr/bin/env node
/**
 * God hunt canon check.
 * Checks api/v1/god-hunts.json: LORE ids follow the id law, god ids match api/v1/lore-canon.json when it is
 * present, reward materials exist in api/v1/master-materials.json, 4-6 steps per line, no art URLs, no duplicates.
 * Usage: node scripts/check-god-hunts.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const dir = join(process.cwd(), 'api', 'v1');
const read = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const lore = (kind, slug) => {
  const h = createHash('sha1').update(`grudge-lore:${kind}:${slug}`).digest('hex').slice(0, 12).toUpperCase();
  return `LORE-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`;
};
const bad = [];
const fail = (m) => bad.push(m);
const doc = read('god-hunts.json');
const mats = new Map(read('master-materials.json').materials.map((m) => [m.uuid, m]));
const canon = existsSync(join(dir, 'lore-canon.json')) ? read('lore-canon.json') : null;
const canonGods = new Map();
const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { if (x.kind === 'god' && x.uuid) canonGods.set(x.uuid, x); Object.values(x).forEach(walk); } };
if (canon) walk(canon);
const seen = new Set();
const once = (id, where) => { if (seen.has(id)) fail(`duplicate id ${id} (${where})`); seen.add(id); };
if (!Array.isArray(doc.lines) || doc.lines.length === 0) fail('no lines');
for (const l of doc.lines ?? []) {
  const g = l.god?.slug;
  if (l.god?.uuid !== lore('god', g)) fail(`${g}: god uuid ${l.god?.uuid} != ${lore('god', g)}`);
  if (l.boss?.uuid !== lore('boss', g)) fail(`${g}: boss uuid ${l.boss?.uuid} != ${lore('boss', g)}`);
  if (l.uuid !== lore('quest', `${g}-hunt`)) fail(`${g}: line uuid ${l.uuid} != ${lore('quest', `${g}-hunt`)}`);
  once(l.uuid, g); once(l.boss?.uuid, g);
  if (canon) {
    const c = canonGods.get(l.god.uuid);
    if (!c) fail(`${g}: god not in lore-canon.json`);
    else if (c.name !== l.god.name || c.status !== 'canon') fail(`${g}: name/status disagrees with lore-canon.json`);
  }
  const steps = (l.quests ?? []).flatMap((q) => q.steps ?? []);
  if (steps.length < 4 || steps.length > 6) fail(`${g}: ${steps.length} steps (want 4-6)`);
  for (const s of steps) if (!['talk', 'reach', 'kill', 'collect', 'interact'].includes(s.kind)) fail(`${g}: step kind ${s.kind}`);
  for (const q of l.quests ?? []) { once(q.id, g); for (const m of q.rewards?.materials ?? []) {
    const row = mats.get(m.uuid);
    if (!row) fail(`${g}: material ${m.uuid} not in master-materials.json`);
    else if (row.id !== m.id) fail(`${g}: material ${m.uuid} is ${row.id}, not ${m.id}`);
  } }
  if (l.boss?.art?.marker !== 'missing' && !/^https:\/\/assets\.grudge-studio\.com\//.test(l.boss?.art?.url ?? '')) fail(`${g}: art must be the missing marker or an assets.grudge-studio.com URL`);
  const abil = Object.values(l.boss?.mechanics ?? {}).flatMap((p) => p.abilities ?? []);
  if (abil.length < 3) fail(`${g}: ${abil.length} abilities`);
}
const text = JSON.stringify(doc);
for (const u of text.match(/https?:\/\/[^"\s]+/g) ?? []) if (!u.startsWith('https://assets.grudge-studio.com/')) fail(`non-asset URL ${u}`);
if (bad.length) { console.error(bad.map((b) => `FAIL ${b}`).join('\n')); process.exit(1); }
console.log(`god-hunts: ${doc.lines.length} lines OK${canon ? ' (checked against lore-canon.json)' : ' (lore-canon.json not on this branch; god names not cross-checked)'}`);
