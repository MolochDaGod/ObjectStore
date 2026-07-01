#!/usr/bin/env node
/**
 * Move superseded api/v1 JSON files into api/v1/archive/ and leave deprecation stubs
 * at the original paths so old URLs do not 404.
 *
 * Run: npm run archive:legacy
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(resolve(__dirname, '..'), 'api', 'v1');
const ARCHIVE = join(API, 'archive');
const ARCHIVED_AT = new Date().toISOString().slice(0, 10);

const ENTRIES = [
  {
    live: 'attributes.json',
    archive: 'attributes.v1.json',
    replacement: 'master-attributes.json',
    reason: 'WCS canonical — 8 ATTR-* UUIDs, 37 derived stats, combatFormulas',
  },
  {
    live: 'weaponSkills.json',
    archive: 'weaponSkills.v1.json',
    replacement: 'master-weaponSkills.json',
    reason: 'Canonical SKIL-* skills with statConnections and slot patterns',
  },
  {
    live: 'items-database.json',
    archive: 'items-database.v1.json',
    replacement: 'master-items.json',
    alsoUse: 'master-weapon-prefabs.json',
    reason: 'Unified ITEM-* catalog + runtime weapon prefabs',
  },
  {
    live: 'items-legacy.json',
    archive: 'items-legacy.v1.json',
    replacement: 'master-items.json',
    reason: 'Duplicate of legacy items-database mirror',
  },
  {
    live: 'master-t0-items.json',
    archive: 'master-t0-items.v1.json',
    replacement: 't0-weapons.json',
    alsoUse: 'master-weapon-prefabs.json',
    reason: 'T0 starters now in t0-weapons.json + prefab pipeline',
  },
];

function stub(entry) {
  return {
    deprecated: true,
    archived: true,
    archivedAt: ARCHIVED_AT,
    message: `Archived — use ${entry.replacement}${entry.alsoUse ? ` and ${entry.alsoUse}` : ''}`,
    original: `/api/v1/${entry.live}`,
    replacement: `/api/v1/${entry.replacement}`,
    alsoUse: entry.alsoUse ? `/api/v1/${entry.alsoUse}` : undefined,
    archive: `/api/v1/archive/${entry.archive}`,
    reason: entry.reason,
    runtimeIndex: '/api/v1/games-library.json',
  };
}

mkdirSync(ARCHIVE, { recursive: true });

const manifest = {
  version: '1.0.0',
  archivedAt: ARCHIVED_AT,
  description: 'Legacy ObjectStore endpoints superseded by master-* runtime APIs',
  runtimeIndex: '/api/v1/games-library.json',
  files: [],
};

for (const entry of ENTRIES) {
  const livePath = join(API, entry.live);
  const archivePath = join(ARCHIVE, entry.archive);

  if (existsSync(livePath)) {
    const raw = readFileSync(livePath, 'utf8');
    if (!raw.includes('"archived":true') && !raw.includes('"archived": true')) {
      writeFileSync(archivePath, raw);
      console.log(`  archived → archive/${entry.archive}`);
    }
  } else if (!existsSync(archivePath)) {
    console.warn(`  skip (missing): ${entry.live}`);
    continue;
  }

  writeFileSync(livePath, `${JSON.stringify(stub(entry), null, 2)}\n`);
  console.log(`  stub     → ${entry.live}`);

  manifest.files.push({
    original: entry.live,
    archive: `archive/${entry.archive}`,
    replacement: entry.replacement,
    alsoUse: entry.alsoUse || null,
    reason: entry.reason,
  });
}

writeFileSync(join(ARCHIVE, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nWrote api/v1/archive/manifest.json (${manifest.files.length} entries)`);