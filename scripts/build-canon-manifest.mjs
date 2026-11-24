#!/usr/bin/env node
/**
 * Build api/v1/lore-canon.json and api/v1/canon-manifest.v1.json.
 *
 * Read-only inputs (this repo): docs/loreHeroes.txt, api/v1/{factions,races,classes,era-systems}.json
 * and every file listed in CANON_FILES (hashed, not edited).
 * Spawn pin: kept from the existing canon-manifest.v1.json unless --spawn-commit/--spawn-tree are passed,
 * with --spawn-file path=sha256 (repeatable) for pinned Spawn files.
 *
 * Id law (extends api/v1/uuid-law.json, same shape as SKIL-*):
 *   LORE-XXXX-XXXX-XXXX = first 12 hex of sha1("grudge-lore:{kind}:{slug}")
 *   ERA-XXXX-XXXX-XXXX  = first 12 hex of sha1("grudge-era:{id}")
 * Ids are derived from stable slugs, never minted, so re-running gives the same ids.
 *
 * No network, no secrets, no image URLs. A lore entry has no art field; clients show the missing marker.
 *
 *   node scripts/build-canon-manifest.mjs            # write both files
 *   node scripts/build-canon-manifest.mjs --check    # exit 1 if either file would change
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const V1 = join(ROOT, 'api/v1');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };

const sha1 = (s) => createHash('sha1').update(s).digest('hex').toUpperCase();
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const fam = (prefix, seed) => { const h = sha1(seed); return `${prefix}-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`; };
const loreId = (kind, slug) => fam('LORE', `grudge-lore:${kind}:${slug}`);
const eraId = (id) => fam('ERA', `grudge-era:${id}`);
const tc = (s) => s.replace(/\b([A-Z])([A-Z']+)\b/g, (_, a, b) => a + b.toLowerCase()).replace(/(?!^)\bThe\b/g, 'the');
const readJson = (p) => JSON.parse(readFileSync(join(V1, p), 'utf8'));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

// Names that must not ship (studio rule: no World of Warcraft names). Matched whole-word, case-insensitive.
const WOW_NAMES = ['Nazgrim', 'Thrall', 'Garrosh', 'Sylvanas', 'Arthas', 'Jaina', "Gul'dan", 'Illidan', "Kael'thas",
  'Grommash', 'Saurfang', 'Durotan', 'Orgrim', 'Azeroth', 'Lich King', 'Scourge', 'Horde', 'Alliance'];
const wowHits = (text) => WOW_NAMES.filter((n) => new RegExp(`\\b${n.replace(/'/g, "'?")}\\b`, 'i').test(text));

const LORE_SRC = 'docs/loreHeroes.txt';
const loreBuf = readFileSync(join(ROOT, LORE_SRC));
const lines = loreBuf.toString('utf8').split(/\r?\n/);

const factions = readJson('factions.json').factions;
const races = readJson('races.json').races;
const classes = readJson('classes.json').classes;
const eraSystems = readJson('era-systems.json');

// Class labels used in the lore text -> canonical class id (classes.json). Anything else is flagged.
const CLASS_ALIASES = { worges: 'worge', worg: 'worge', 'beast-bonded': 'worge', assassin: 'thief', shaman: 'mage', necromancer: 'mage' };
const FACTION_BY_NAME = Object.fromEntries(Object.values(factions).map((f) => [f.name.toLowerCase(), f.id]));

function mapClass(raw) {
  const base = raw.split(/[\/(]/)[0].trim().toLowerCase();
  if (classes[base]) return { id: base, canonical: raw.trim().toLowerCase() === base };
  const alias = CLASS_ALIASES[base];
  return { id: alias || null, canonical: false };
}

function section(start, label) {
  const out = [];
  let i = start;
  while (i < lines.length && !lines[i].startsWith(label)) i++;
  for (i++; i < lines.length; i++) {
    const l = lines[i];
    if (/^[A-Z_]{4,}:/.test(l) || /^HERO #|^={10,}|^═{10,}/.test(l)) break;
    out.push(l);
  }
  return out.join('\n').trim();
}

// ── Gods ────────────────────────────────────────────────────────────────
const gods = [];
lines.forEach((l, i) => {
  const m = /^GOD: (.+)$/.exec(l);
  if (!m) return;
  const field = (k) => { for (let j = i + 1; j < i + 16; j++) { const mm = new RegExp(`^${k}: (.+)$`).exec(lines[j] || ''); if (mm) return mm[1].trim(); } return null; };
  const name = tc(m[1].replace(/\s+-\s+/, ', '));
  const facts = [];
  for (let j = i + 1; j < lines.length && !/^GOD: |^={10,}/.test(lines[j]); j++) if (/^- /.test(lines[j])) facts.push(lines[j].slice(2).trim());
  const patronOf = Object.values(factions).find((f) => (field('Faction Patron') || '').toLowerCase().includes(f.name.toLowerCase()));
  const slug = slugify(name.split(',')[0].replace(/^the /i, '').split(/ the /i)[0]);
  gods.push({
    uuid: loreId('god', slug), grudgeUuid: loreId('god', slug), kind: 'god', slug, name,
    patronOf: patronOf ? patronOf.id : null,
    domain: (field('Domain') || '').split(',').map((s) => s.trim()).filter(Boolean),
    role: field('Role in Grudge'),
    facts,
    status: 'canon',
    source: { path: LORE_SRC, line: i + 1 },
  });
});

// Race gods. They sit after the heroes in the source, each under a line naming its people.
// Ratified by Jonathan on 2026-11-23 18:45 CT, so they are canon alongside the three patron gods.
const RACE_GOD_RATIFIED = { by: 'Jonathan', at: '2026-11-23T18:45:00-06:00' };
const extraGods = [];
lines.forEach((l, i) => {
  const m = /^God: ([^,]+), (.+)$/.exec(l);
  if (!m) return;
  let k = i - 1; while (k > 0 && !lines[k].trim()) k--;
  const people = (lines[k] || '').trim();
  const pid = people.toLowerCase().replace(/s$/, '').replace(/ve$/, 'f');
  const raceId = races[pid] ? pid : null;
  const after = (k) => { for (let j = i + 1; j < i + 4; j++) { const mm = new RegExp(`^${k}: (.+)$`).exec(lines[j] || ''); if (mm) return mm[1].trim(); } return null; };
  const slug = slugify(m[1]);
  const god = {
    uuid: loreId('god', slug), grudgeUuid: loreId('god', slug), kind: 'god', slug, name: `${m[1]}, ${m[2]}`,
    patronOf: null,
    godOf: raceId || people.toLowerCase() || null,
    race: raceId,
    domain: (after('Domain') || '').replace(/\.$/, '').split(',').map((x) => x.trim().replace(/^and /, '')).filter(Boolean),
    role: after('Description'),
    facts: [],
    status: 'canon',
    ratified: RACE_GOD_RATIFIED,
    source: { path: LORE_SRC, line: i + 1 },
  };
  if (!raceId) god.flags = [{ code: 'race-unknown', detail: `God of "${people}", which is not a playable race in races.json.` }];
  gods.push(god);
  extraGods.push(slug);
});

// ── Heroes ──────────────────────────────────────────────────────────────
const heroes = [];
const heroNames = new Set();
lines.forEach((l, i) => {
  const m = /^HERO #(\d+): (.+?)(?: \((.+)\))?$/.exec(l);
  if (!m) return;
  const get = (k) => { for (let j = i + 1; j < i + 8; j++) { const mm = new RegExp(`^${k}: (.+)$`).exec(lines[j] || ''); if (mm) return mm[1].trim(); } return null; };
  const slug = get('ID') || slugify(m[2]);
  const meta = /^RACE: (.+?) \| CLASS: (.+?) \| FACTION: (.+)$/.exec(lines.slice(i, i + 6).find((x) => x.startsWith('RACE:')) || '') || [];
  const raceId = (meta[1] || '').trim().toLowerCase();
  const cls = mapClass(meta[2] || '');
  const factionId = FACTION_BY_NAME[(meta[3] || '').trim().toLowerCase()] || null;
  const story = section(i, 'BACKSTORY:');
  const firstPara = story.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, ' ').trim();
  const rel = section(i, 'RELATIONSHIPS:').split('\n').map((x) => /^- ([^:]+): (.+)$/.exec(x.trim())).filter(Boolean)
    .map((r) => ({ kind: r[1].trim().toLowerCase(), text: r[2].trim() }));
  const name = tc(m[2]);
  heroNames.add(name.split(' ')[0].toLowerCase());
  const flags = [];
  const wow = wowHits(name);
  if (wow.length) flags.push({ code: 'wow-name', detail: `Name matches a World of Warcraft character (${wow.join(', ')}). Rename before it ships.` });
  if (!cls.canonical) flags.push({ code: 'class-label', detail: `Lore says "${(meta[2] || '').trim()}"; canonical class id is ${cls.id || 'unknown'}.` });
  if (!races[raceId]) flags.push({ code: 'race-unknown', detail: `Race "${meta[1]}" is not in races.json.` });
  if (races[raceId] && factionId && races[raceId].faction !== factionId) flags.push({ code: 'faction-mismatch', detail: `races.json puts ${raceId} in ${races[raceId].faction}; lore says ${factionId}.` });
  heroes.push({
    uuid: loreId('hero', slug), grudgeUuid: loreId('hero', slug), kind: 'hero', slug, number: Number(m[1]), name,
    note: m[3] || undefined,
    title: get('TITLE'),
    race: raceId || null, class: cls.id, classLabel: (meta[2] || '').trim() || null, faction: factionId,
    summary: firstPara || null,
    relationships: rel,
    portrait: null,
    status: flags.some((f) => f.code === 'wow-name') ? 'held' : 'draft',
    flags,
    source: { path: LORE_SRC, line: i + 1 },
  });
});

// Relationship names that point at nobody in the file.
for (const h of heroes) for (const r of h.relationships) {
  const who = (r.text.split('(')[0].split(' - ')[0].trim().split(' ')[0] || '').toLowerCase();
  if (who && !heroNames.has(who) && !/^(teaches|high|young)/.test(who)) r.unresolved = true;
}

const world = (() => {
  const i = lines.findIndex((l) => l.startsWith('THE WORLD OF GRUDGE WARLORDS'));
  const text = []; for (let j = i + 1; j < lines.length && lines[j].trim(); j++) text.push(lines[j].trim());
  return { uuid: loreId('world', 'grudge_warlords'), kind: 'world', slug: 'grudge_warlords', name: 'The world of Grudge Warlords', summary: text.join(' '), status: 'canon', source: { path: LORE_SRC, line: i + 1 } };
})();

const lore = {
  id: 'lore-canon',
  version: '1.0.0-draft',
  status: 'draft — needs Jonathan to ratify flagged entries before Legion treats them as canon',
  schema: '/api/v1/schemas/canon-entry.schema.json',
  idLaw: 'LORE-XXXX-XXXX-XXXX = first 12 hex of sha1("grudge-lore:{kind}:{slug}"), same shape as SKIL-*. Never mint by hand.',
  source: { path: LORE_SRC, sha256: sha256(loreBuf) },
  imageRule: 'No art fields here. Portraits come only from assets.grudge-studio.com by catalog key; a missing key shows the missing marker. The imgur reference in the source text is dropped.',
  stripped: ['AI_MODEL (model ids are Legion config, not lore)', 'PUTER_SITE', 'imgur visual references', 'quest rewards and goal metrics (game data, not lore)'],
  world,
  gods,
  unratified: [],
  godNote: 'Three patron gods (one per faction) and five race gods. The source header still says three gods; the five race gods were ratified by Jonathan on 2026-11-23.',
  factions: Object.values(factions).map((f) => ({ uuid: loreId('faction', f.id), kind: 'faction', slug: f.id, name: f.name, patron: f.patron, races: f.races, summary: f.lore, status: 'canon', source: { path: 'api/v1/factions.json', pointer: `/factions/${f.id}` } })),
  races: Object.values(races).map((r) => ({ uuid: loreId('race', r.id), kind: 'race', slug: r.id, name: r.name, faction: r.faction, trait: r.trait, summary: r.lore, status: 'canon', source: { path: 'api/v1/races.json', pointer: `/races/${r.id}` } })),
  classes: Object.values(classes).map((c) => ({ uuid: loreId('class', c.id), kind: 'class', slug: c.id, name: c.name, summary: c.lore || c.description, status: 'canon', source: { path: 'api/v1/classes.json', pointer: `/classes/${c.id}` } })),
  heroes,
};

// ── Manifest ────────────────────────────────────────────────────────────
const CANON_FILES = [
  ['uuidLaw', 'uuid-law.json'], ['accountGameContract', 'account-game-uuid-contract.json'],
  ['eras', 'era-systems.json'], ['eraTaxonomy', 'era-asset-taxonomy.json'],
  ['factions', 'factions.json'], ['races', 'races.json'], ['classes', 'classes.json'],
  ['items', 'master-items.json'], ['itemsManifest', 'canonical-items-manifest.json'],
  ['weaponPrefabs', 'master-weapon-prefabs.json'], ['skills', 'master-weaponSkills.json'],
  ['materials', 'master-materials.json'], ['recipes', 'master-recipes.json'],
  ['professions', 'master-professions.json'], ['attributes', 'master-attributes.json'],
  ['lore', 'lore-canon.json'],
];
const loreText = JSON.stringify(lore, null, 2) + '\n';
const files = {};
for (const [key, name] of CANON_FILES) {
  const p = join(V1, name);
  const buf = key === 'lore' ? Buffer.from(loreText) : (existsSync(p) ? readFileSync(p) : null);
  files[key] = buf ? { path: `/api/v1/${name}`, sha256: sha256(buf), bytes: buf.length } : { path: `/api/v1/${name}`, missing: true };
}

const prevPath = join(V1, 'canon-manifest.v1.json');
const prev = existsSync(prevPath) ? JSON.parse(readFileSync(prevPath, 'utf8')) : {};
const spawnFiles = { ...(prev.spawnPin?.files || {}) };
args.forEach((a, i) => { if (a === '--spawn-file') { const [p, h] = String(args[i + 1]).split('='); spawnFiles[p] = h; } });
const spawnPin = {
  world: '@racalvin/grudge-warlords',
  ref: 'main',
  commit: arg('--spawn-commit') || prev.spawnPin?.commit || null,
  tree: arg('--spawn-tree') || prev.spawnPin?.tree || null,
  files: spawnFiles,
};

const manifest = {
  id: 'canon-manifest',
  version: 1,
  status: 'draft',
  law: 'Spawn @racalvin/grudge-warlords main is the source of truth for how the game plays. ObjectStore api/v1 is the published catalog: definitions are edited here, checked against the Spawn pin, then served from info/objectstore. Binaries only from assets.grudge-studio.com. Player state only from grudge-api (Railway) keyed by grudgeId.',
  hosts: { definitions: 'https://objectstore.grudge-studio.com/api/v1', mirror: 'https://info.grudge-studio.com/api/v1', binaries: 'https://assets.grudge-studio.com', identity: 'https://id.grudge-studio.com', playerApi: 'https://api.grudge-studio.com', legion: 'https://ai.grudge-studio.com' },
  readers: {
    legion: 'Fetch this manifest, then the files it lists. Ground answers on them (retrieval), cite uuid, and call the player API for anything about a player. Do not fine-tune canon into a model; canon changes weekly.',
    games: 'Read definitions by uuid. Never copy a catalog into a client bundle without its sha256 from here.',
  },
  idFamilies: {
    player: 'grudgeId GRUDGE_* (grudge-api). The only cross-service player key.',
    character: 'characters.id RFC UUID (grudge-api). GRDG-* is a display stamp, not a key.',
    itemInstance: 'grudge_uuid minted by the server ledger only.',
    itemDefinition: 'ITEM-*/FOOD-*/POTN-*/CONS-* in master-items.json. Frozen: existing ids are never re-minted, even though they are timestamp-based.',
    skill: 'SKIL-* = sha1("grudge-skill:{id}")',
    asset: 'grudgeUuid = sha1("grudge-asset:{r2Key}") laid out as a v5-style UUID; ICON-* uses the same seed',
    lore: 'LORE-* = sha1("grudge-lore:{kind}:{slug}") (new, this manifest)',
    era: 'ERA-* = sha1("grudge-era:{id}") (new, this manifest)',
  },
  eras: Object.entries(eraSystems.eras).map(([id, e]) => ({ uuid: eraId(id), id, status: e.status, slots: e.slots, stats: e.stats })),
  glossary: [
    { term: 'era', means: 'A product era (warlords, nexus, voxel, armada, plus shared for assets). Not a period of in-world history; use "age" for that. No ages are canon yet.' },
    { term: 'Legion (faction)', means: 'In-world faction id legion: orcs and undead, patron Madra.' },
    { term: 'Legion AI', means: 'The studio AI service at ai.grudge-studio.com (service id legion-ai). Never the faction.' },
    { term: 'Grudge ID', means: 'The sign-in service at id.grudge-studio.com.' },
    { term: 'grudgeId', means: 'A player account key, GRUDGE_ plus 20 characters total.' },
    { term: 'grudgeUuid', means: 'A deterministic definition or asset id. Never a player.' },
    { term: 'GRD-17', means: 'Three things share the name: the GRUDACHAIN ESP32 node, the Legion persona grd17, and grd17CompressionService. In canon it only ever means the compression format for stored JSON.' },
  ],
  compression: 'Large canon files may be stored at rest as GRD-17 brotli with the algorithm in R2 customMetadata. HTTP responses rely on Cloudflare compression; sha256 here is of the uncompressed JSON.',
  files,
  spawnPin,
  knownDivergences: [
    {
      id: 'race-bonus-scale',
      canon: 'ObjectStore api/v1/races.json bonuses on the 0.1 to 0.4 scale (for example human +0.1 to all, orc +0.4 Strength)',
      decidedBy: 'Jonathan',
      decidedAt: '2026-11-23T18:45:00-06:00',
      wrongCopy: { world: '@racalvin/grudge-warlords', path: 'scripts/lib/data/canon.js', pointer: 'RACES.*.bonuses and RACES.*.passive', scale: '1 to 4 (10x)' },
      fix: 'Spawn: replace RACES.*.bonuses and passive with races.json values. Needs Jonathan\'s "push" for Spawn main; then refresh spawnPin.',
      status: 'spawn-fix-pending',
    },
  ],
  build: 'node scripts/build-canon-manifest.mjs [--spawn-commit <sha> --spawn-tree <sha> --spawn-file <path>=<sha256>]',
};
const manifestText = JSON.stringify(manifest, null, 2) + '\n';

const outputs = [[join(V1, 'lore-canon.json'), loreText], [prevPath, manifestText]];
if (CHECK) {
  const stale = outputs.filter(([p, t]) => !existsSync(p) || readFileSync(p, 'utf8') !== t);
  if (stale.length) { console.error('stale:', stale.map(([p]) => p.replace(ROOT + '/', '')).join(', ')); process.exit(1); }
  console.log('canon manifest up to date');
} else {
  for (const [p, t] of outputs) writeFileSync(p, t);
  const flagged = heroes.filter((h) => h.flags.length).length;
  console.log(`lore-canon: ${gods.length} gods (${extraGods.length} race gods), ${heroes.length} heroes (${flagged} flagged); manifest: ${Object.keys(files).length} files`);
}
