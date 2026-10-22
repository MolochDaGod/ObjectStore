#!/usr/bin/env node
/**
 * Spawn sak_ → Grudge ID → honest account + character roster snapshot.
 * Never prints SPAWN_TOKEN or full fleet JWTs.
 *
 * Usage:
 *   $env:SPAWN_TOKEN = "sak_…"
 *   node scripts/sync-spawn-grudge-account.mjs
 *   $env:NEMESIS = "1"   # optional Nemesis owned-cards mirror
 *
 * Contract: api/v1/spawn-grudge-identity-contract.json
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ID = process.env.GRUDGE_ID_URL || 'https://id.grudge-studio.com';
const API = process.env.GRUDGE_API_URL || 'https://grudge-api-production-0d46.up.railway.app';
const NEMESIS_URL = process.env.NEMESIS_URL || 'https://nemesis.grudge-studio.com';
const WANT_NEMESIS = String(process.env.NEMESIS || '').trim() === '1';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'spawn');

const spawnToken = String(process.env.SPAWN_TOKEN || '').trim();
if (spawnToken.length < 20) {
  console.error('SPAWN_TOKEN env required (sak_…)');
  process.exit(1);
}

function redactToken(t) {
  if (!t || typeof t !== 'string') return null;
  if (t.length < 12) return '[redacted]';
  return `${t.slice(0, 6)}…${t.slice(-4)}`;
}

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { Accept: 'application/json', ...headers } });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

function normalizeCharacters(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => ({
    id: c.id || c.characterId || null,
    name: c.name || null,
    era: c.era || c.gameEra || null,
    grudgeCode: c.grudgeCode || c.grudge_code || null,
    level: c.level ?? null,
    active: c.active ?? c.activeForEra ?? null,
  })).filter((c) => typeof c.id === 'string' && c.id.length > 0);
}

const spawnAuth = await postJson(
  `${ID}/api/auth/spawn`,
  { spawnToken },
  { 'X-Spawn-Token': spawnToken, Authorization: `Bearer ${spawnToken}` },
);
if (!spawnAuth.res.ok || !spawnAuth.json?.token) {
  console.error(
    'Spawn→Grudge ID failed:',
    spawnAuth.res.status,
    spawnAuth.json?.error || spawnAuth.json,
  );
  process.exit(1);
}

const fleetToken = spawnAuth.json.token;
const grudgeId = spawnAuth.json.grudgeId || spawnAuth.json.account?.grudgeId;
const syncedAt = new Date().toISOString();
let characters = normalizeCharacters(spawnAuth.json.characters);

/** Honesty: re-fetch roster from game API when possible */
const eras = [...new Set(characters.map((c) => c.era).filter(Boolean))];
if (eras.length === 0) eras.push('warlords', 'nexus');
const verified = [];
const missing = [];
for (const era of eras) {
  const { res, json } = await getJson(`${API}/api/characters?era=${encodeURIComponent(era)}`, {
    Authorization: `Bearer ${fleetToken}`,
  });
  if (!res.ok) {
    console.warn(`warn: GET /api/characters?era=${era} → ${res.status}`);
    continue;
  }
  const list = Array.isArray(json) ? json : Array.isArray(json?.characters) ? json.characters : [];
  const byId = new Map(list.map((c) => [c.id, c]));
  for (const c of characters.filter((x) => !x.era || x.era === era)) {
    if (byId.has(c.id)) {
      const row = byId.get(c.id);
      verified.push({
        id: row.id,
        name: row.name ?? c.name,
        era: row.gameEra || row.era || c.era || era,
        grudgeCode: row.grudgeCode || row.grudge_code || c.grudgeCode,
        level: row.level ?? c.level,
        active: row.activeForEra ?? row.active ?? c.active,
      });
    } else if (c.era === era || !c.era) {
      missing.push({ id: c.id, era });
    }
  }
}

if (verified.length) {
  characters = verified;
} else if (missing.length) {
  console.warn('warn: honesty check could not verify characters against /api/characters', missing);
}

const playerStateGrudge = {
  v: 1,
  grudgeId,
  displayName:
    spawnAuth.json.account?.displayName ||
    spawnAuth.json.username ||
    spawnAuth.json.spawn?.name ||
    null,
  spawnUserId: spawnAuth.json.spawn?.userId || null,
  spawnUsername: spawnAuth.json.spawn?.username || null,
  syncedAt,
  isNew: !!spawnAuth.json.isNew,
  characters,
};

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'player-state-grudge.json'), `${JSON.stringify(playerStateGrudge, null, 2)}\n`);

const snapshot = {
  success: true,
  syncedAt,
  contract: 'spawn-grudge-identity@2026-10-04.phase1',
  spawn: {
    userId: playerStateGrudge.spawnUserId,
    username: playerStateGrudge.spawnUsername,
    handle: spawnAuth.json.spawn?.handle || null,
  },
  account: {
    grudgeId,
    accountId: spawnAuth.json.account?.id || null,
    displayName: playerStateGrudge.displayName,
    userId: spawnAuth.json.userId || spawnAuth.json.user?.id || null,
    isNew: playerStateGrudge.isNew,
  },
  characters: {
    count: characters.length,
    missingVsApi: missing,
    eras: [...new Set(characters.map((c) => c.era).filter(Boolean))],
  },
  fleetTokenRedacted: redactToken(fleetToken),
  preferredLinkForExistingAccounts: 'POST /api/auth/spawn-link',
};

await writeFile(join(OUT, 'grudge-account-snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);

if (WANT_NEMESIS) {
  const sso = await postJson(`${NEMESIS_URL}/api/auth/grudge-sso`, { token: fleetToken });
  if (!sso.res.ok || !sso.json?.access_token) {
    console.warn('Nemesis SSO skipped:', sso.res.status, sso.json?.error || sso.json?.message || '');
  } else {
    const owned = await getJson(`${NEMESIS_URL}/api/user/owned-cards`, {
      Authorization: `Bearer ${sso.json.access_token}`,
    });
    const cards = Array.isArray(owned.json?.cards) ? owned.json.cards : [];
    const playerStateNemesis = {
      v: 1,
      grudgeId,
      username: sso.json.user?.username || playerStateGrudge.displayName,
      syncedAt,
      totalCards: cards.length,
      owned: cards.map((c) => ({
        uuid: c.uuid,
        cardId: c.cardId,
        name: c.name,
        imageUrl: c.imageUrl,
        rarity: c.rarity,
      })),
    };
    await writeFile(
      join(OUT, 'player-state-nemesis.json'),
      `${JSON.stringify(playerStateNemesis, null, 2)}\n`,
    );
    snapshot.nemesis = { totalCards: cards.length };
    await writeFile(join(OUT, 'grudge-account-snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
  }
}

console.log('OK Spawn→Grudge honest account sync');
console.log(`  grudgeId=${grudgeId}`);
console.log(`  characters=${characters.length} missing=${missing.length}`);
console.log(`  out=${OUT}`);
console.log('  mirror → player.state.grudge from spawn/player-state-grudge.json');
console.log('  current accounts: prefer POST /api/auth/spawn-link');
