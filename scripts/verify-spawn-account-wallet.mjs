#!/usr/bin/env node
/**
 * Soft-ledger VERIFY SEND into accounts.gbux_balance (fleet_bag_gbux).
 * NOT a burn. NOT on-chain send-gbux. NOT Spawn sales.
 *
 * Usage:
 *   $env:GRUDGE_ID = "GRUDGE_…"
 *   $env:ADMIN_PASSWORD = "…"          # or $env:FLEET_ADMIN_JWT
 *   $env:AMOUNT = "10"                 # optional, default 10
 *   $env:PURPOSE = "spawn_verify"      # verify|test|spawn_verify|ledger_verify
 *   $env:IDEMPOTENCY_KEY = "…"         # optional; auto-generated if omitted
 *   node scripts/verify-spawn-account-wallet.mjs
 *
 * Optional confirm with Spawn → fleet JWT → wallet overview:
 *   $env:SPAWN_TOKEN = "sak_…"
 *   $env:CONFIRM_OVERVIEW = "1"
 *   node scripts/verify-spawn-account-wallet.mjs
 *
 * Contract: api/v1/spawn-wallet-verify-send-contract.json
 * Doc: docs/SPAWN_WALLET_VERIFY_SEND.md
 */
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// No host fallbacks: set GRUDGE_ID_URL and GRUDGE_API_URL explicitly (canonical: https://id.grudge-studio.com).
const ID = String(process.env.GRUDGE_ID_URL || '').trim().replace(/\/+$/, '');
const API = String(process.env.GRUDGE_API_URL || '').trim().replace(/\/+$/, '');
if (!ID || !API) {
  console.error('GRUDGE_ID_URL and GRUDGE_API_URL must be set (e.g. https://id.grudge-studio.com). Refusing to fall back to a hardcoded host.');
  process.exit(2);
}
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'spawn');

const grudgeId = String(process.env.GRUDGE_ID || process.env.grudgeId || '').trim().toUpperCase();
const amount = Number(process.env.AMOUNT || 10);
const purpose = String(process.env.PURPOSE || 'spawn_verify').trim().toLowerCase();
const note = String(process.env.NOTE || 'verify-spawn-account-wallet.mjs').trim();
const idempotencyKey =
  String(process.env.IDEMPOTENCY_KEY || '').trim() ||
  `spawn-verify-${new Date().toISOString().slice(0, 10)}-${randomBytes(4).toString('hex')}`;
const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();
const adminJwt = String(process.env.FLEET_ADMIN_JWT || process.env.ADMIN_JWT || '').trim();
const spawnToken = String(process.env.SPAWN_TOKEN || '').trim();
const wantOverview = String(process.env.CONFIRM_OVERVIEW || '').trim() === '1';

if (!grudgeId.startsWith('GRUDGE_')) {
  console.error('GRUDGE_ID required (GRUDGE_…)');
  process.exit(1);
}
if (!Number.isInteger(amount) || amount <= 0) {
  console.error('AMOUNT must be a positive integer');
  process.exit(1);
}
if (!adminPassword && !adminJwt) {
  console.error('ADMIN_PASSWORD or FLEET_ADMIN_JWT required for verify-send');
  process.exit(1);
}

function redact(t) {
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

const authHeaders = {};
if (adminJwt) authHeaders.Authorization = `Bearer ${adminJwt}`;
if (adminPassword) authHeaders['X-Admin-Password'] = adminPassword;

const sendBody = {
  grudgeId,
  amount,
  purpose,
  idempotencyKey,
  note,
};

console.log('POST', `${API}/api/wallet/verify-send-to-account`);
console.log(
  JSON.stringify(
    {
      grudgeId,
      amount,
      purpose,
      idempotencyKey,
      auth: adminJwt ? 'fleet-admin-jwt' : 'x-admin-password',
      onChain: false,
      burn: false,
    },
    null,
    2,
  ),
);

const { res: sendRes, json: sendJson } = await postJson(
  `${API}/api/wallet/verify-send-to-account`,
  sendBody,
  authHeaders,
);

if (!sendRes.ok) {
  console.error('verify-send failed:', sendRes.status, sendJson?.error || sendJson);
  if (sendRes.status === 404 && /account not found/i.test(String(sendJson?.error || ''))) {
    console.error('hint: grudgeId/accountId not in Railway accounts — pick an id from GET /api/admin/accounts-summary');
  } else if (sendRes.status === 404) {
    console.error(
      'hint: route missing on live Railway — deploy GrudgeBuilder with POST /api/wallet/verify-send-to-account',
    );
  } else if (sendRes.status === 403) {
    console.error('hint: need ADMIN_PASSWORD (X-Admin-Password, no Bearer) or fleet JWT with isAdmin/studio admin');
  }
  process.exit(1);
}

console.log(
  'ok:',
  JSON.stringify(
    {
      success: sendJson.success,
      idempotent: sendJson.idempotent,
      kind: sendJson.kind,
      onChain: sendJson.onChain,
      burn: sendJson.burn,
      grudgeId: sendJson.grudgeId,
      amount: sendJson.amount,
      gbuxBalanceBefore: sendJson.gbuxBalanceBefore,
      gbuxBalance: sendJson.gbuxBalance,
      transactionId: sendJson.transactionId,
      sourceRef: sendJson.sourceRef,
    },
    null,
    2,
  ),
);

let overview = null;
let spawnAuthMeta = null;
if (wantOverview) {
  if (spawnToken.length < 20) {
    console.error('CONFIRM_OVERVIEW=1 requires SPAWN_TOKEN');
    process.exit(1);
  }
  const spawnAuth = await postJson(
    `${ID}/api/auth/spawn`,
    { spawnToken },
    { 'X-Spawn-Token': spawnToken, Authorization: `Bearer ${spawnToken}` },
  );
  if (!spawnAuth.res.ok || !spawnAuth.json?.token) {
    console.error('Spawn→Grudge ID failed:', spawnAuth.res.status, spawnAuth.json?.error || spawnAuth.json);
    process.exit(1);
  }
  const fleetToken = spawnAuth.json.token;
  const authGrudgeId = String(spawnAuth.json.grudgeId || spawnAuth.json.account?.grudgeId || '').toUpperCase();
  spawnAuthMeta = {
    grudgeId: authGrudgeId,
    token: redact(fleetToken),
    matchTarget: authGrudgeId === grudgeId,
  };
  if (authGrudgeId && authGrudgeId !== grudgeId) {
    console.warn(`warn: SPAWN auth grudgeId ${authGrudgeId} ≠ target ${grudgeId}`);
  }
  const { res: ovRes, json: ovJson } = await getJson(`${API}/api/wallet/overview`, {
    Authorization: `Bearer ${fleetToken}`,
  });
  if (!ovRes.ok) {
    console.error('wallet overview failed:', ovRes.status, ovJson?.error || ovJson);
    process.exit(1);
  }
  overview = {
    gbuxBalance: ovJson.gbuxBalance ?? ovJson.balance ?? ovJson.bag?.gbux ?? null,
    keys: Object.keys(ovJson || {}).slice(0, 24),
  };
  console.log('overview:', JSON.stringify({ ...overview, spawn: spawnAuthMeta }, null, 2));
}

await mkdir(OUT, { recursive: true });
const snapshot = {
  v: 1,
  kind: 'verify_send_to_account_wallet',
  onChain: false,
  burn: false,
  syncedAt: new Date().toISOString(),
  request: { grudgeId, amount, purpose, idempotencyKey, note },
  response: {
    success: sendJson.success,
    idempotent: sendJson.idempotent,
    grudgeId: sendJson.grudgeId,
    accountId: sendJson.accountId,
    amount: sendJson.amount,
    gbuxBalanceBefore: sendJson.gbuxBalanceBefore,
    gbuxBalance: sendJson.gbuxBalance,
    transactionId: sendJson.transactionId,
    sourceRef: sendJson.sourceRef,
  },
  overview,
  spawnAuth: spawnAuthMeta,
};
const outPath = join(OUT, 'verify-send-snapshot.json');
await writeFile(outPath, JSON.stringify(snapshot, null, 2), 'utf8');
console.log('wrote', outPath);
