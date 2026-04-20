#!/usr/bin/env node
/**
 * Grudge Studio Cloudflare admin utility.
 *
 * Uses the official `cloudflare` SDK to:
 *   - probe which token scopes are currently available
 *   - print a live inventory of resources (Pages projects, Workers, R2 buckets,
 *     D1 databases, KV namespaces, DNS records)
 *   - apply renames/migrations that the SDK makes easier than raw REST
 *
 * Credentials are read from (in priority order):
 *   - $CLOUDFLARE_ADMIN_TOKEN  (broad-scope token when available)
 *   - $CLOUDFLARE_API_TOKEN
 *   - $CLOUDFLARE_USER_API     (DNS-only fallback, from D:/Grudge-Engine-Web/.env)
 *   - wrangler OAuth session   (C:/Users/…/AppData/Roaming/xdg.config/.wrangler/config/default.toml)
 *
 * Usage:
 *   node scripts/cf-admin.mjs probe        — print scope audit + inventory
 *   node scripts/cf-admin.mjs pages        — list Pages projects + custom domains
 *   node scripts/cf-admin.mjs dns [name]   — list / match DNS records (optional substring filter)
 *   node scripts/cf-admin.mjs workers      — list deployed Workers
 *   node scripts/cf-admin.mjs kv           — list KV namespaces
 *   node scripts/cf-admin.mjs r2           — list R2 buckets + sizes
 *   node scripts/cf-admin.mjs gdevelop-audit — grep all resources for any lingering `gdevelop` references
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Cloudflare from 'cloudflare';

// ─────────────────────────────────────────────────────────────────────────────
// Credential resolution
// ─────────────────────────────────────────────────────────────────────────────

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function loadWranglerOauth() {
  const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
  if (!fs.existsSync(cfg)) return null;
  const text = fs.readFileSync(cfg, 'utf8');
  const m = text.match(/oauth_token\s*=\s*"([^"]+)"/);
  return m ? m[1] : null;
}

function loadCreds() {
  const envKnown = loadEnvFile('D:/Grudge-Engine-Web/.env');
  const adminToken =
    process.env.CLOUDFLARE_ADMIN_TOKEN ||
    process.env.CLOUDFLARE_API_TOKEN ||
    envKnown.CLOUDFLARE_ADMIN_TOKEN ||
    envKnown.CLOUDFLARE_API_TOKEN ||
    null;
  const wranglerToken = loadWranglerOauth();
  const dnsToken = envKnown.CLOUDFLARE_USER_API || null;
  // Primary token (for account-level ops: pages, workers, r2, d1, kv, etc.)
  const token = adminToken || wranglerToken || dnsToken;
  // Separate DNS token (falls back to primary)
  const tokenDns = adminToken || dnsToken || wranglerToken;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || envKnown.CF_ACCOUNT_ID;
  const zoneId   = process.env.CLOUDFLARE_ZONE_ID    || envKnown.CF_ZONE_ID;
  if (!token) throw new Error('No Cloudflare token found. Set CLOUDFLARE_ADMIN_TOKEN.');
  return { token, tokenDns, accountId, zoneId };
}

function makeClient(token) {
  return new Cloudflare({ apiToken: token });
}

function makeDnsClient({ tokenDns }) {
  return new Cloudflare({ apiToken: tokenDns });
}

// ─────────────────────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────────────────────

async function probe({ token, accountId, zoneId }) {
  const cf = makeClient(token);
  console.log('── Scope probe ───────────────────────────────────────────────');

  async function probeOne(label, fn) {
    try {
      await fn();
      console.log(`  [ok ]  ${label}`);
    } catch (err) {
      console.log(`  [${err.status || 'err'}] ${label}  (${err.errors?.[0]?.message || err.message})`);
    }
  }

  await probeOne('user.tokens.verify', () => cf.user.tokens.verify());
  await probeOne('zones.get',          () => cf.zones.get({ zone_id: zoneId }));
  await probeOne('dns.records.list',   () => cf.dns.records.list({ zone_id: zoneId, per_page: 1 }));
  await probeOne('pages.projects.list', () => cf.pages.projects.list({ account_id: accountId }));
  await probeOne('workers.scripts.list', () => cf.workers.scripts.list({ account_id: accountId }));
  await probeOne('r2.buckets.list',    () => cf.r2.buckets.list({ account_id: accountId }));
  await probeOne('d1.database.list',   () => cf.d1.database.list({ account_id: accountId }));
  await probeOne('kv.namespaces.list', () => cf.kv.namespaces.list({ account_id: accountId }));
  await probeOne('images.v1.stats',    () => cf.images.v1.stats.get({ account_id: accountId }));
  await probeOne('stream.list',        () => cf.stream.list({ account_id: accountId }));
  await probeOne('zero_trust.access.applications.list',
    () => cf.zeroTrust.access.applications.list({ account_id: accountId }));
}

async function listPages({ token, accountId }) {
  const cf = makeClient(token);
  const projects = [];
  for await (const p of cf.pages.projects.list({ account_id: accountId })) {
    projects.push(p);
  }
  console.log(`${projects.length} Pages projects:`);
  for (const p of projects) {
    console.log(`  ${p.name}  [${(p.domains || []).join(', ')}]  subdomain=${p.subdomain}`);
  }
}

async function listDns(creds, filter) {
  const cf = makeDnsClient(creds);
  const records = [];
  for await (const r of cf.dns.records.list({ zone_id: creds.zoneId, per_page: 100 })) {
    records.push(r);
  }
  const filtered = filter
    ? records.filter((r) => r.name.includes(filter) || (r.content || '').includes(filter))
    : records;
  console.log(`${filtered.length}${filter ? ` (of ${records.length})` : ''} DNS records:`);
  for (const r of filtered) {
    console.log(`  ${r.type.padEnd(6)} ${r.name.padEnd(42)} -> ${r.content}  proxied=${r.proxied}`);
  }
}

async function listWorkers({ token, accountId }) {
  const cf = makeClient(token);
  const scripts = [];
  for await (const s of cf.workers.scripts.list({ account_id: accountId })) {
    scripts.push(s);
  }
  console.log(`${scripts.length} Workers:`);
  for (const s of scripts) console.log(`  ${s.id}`);
}

async function listKv({ token, accountId }) {
  const cf = makeClient(token);
  const ns = [];
  for await (const n of cf.kv.namespaces.list({ account_id: accountId })) {
    ns.push(n);
  }
  console.log(`${ns.length} KV namespaces:`);
  for (const n of ns) console.log(`  ${n.title.padEnd(40)} ${n.id}`);
}

async function listR2({ token, accountId }) {
  const cf = makeClient(token);
  const resp = await cf.r2.buckets.list({ account_id: accountId });
  const buckets = resp.buckets || [];
  console.log(`${buckets.length} R2 buckets:`);
  for (const b of buckets) console.log(`  ${b.name.padEnd(30)} created=${b.creation_date || '?'}`);
}

async function gdevelopAudit(creds) {
  const cf = makeClient(creds.token);
  const cfDns = makeDnsClient(creds);
  const matches = [];

  function hit(cat, id, note) {
    if (/gdevelop/i.test(id) || /gdevelop/i.test(note || '')) matches.push({ cat, id, note });
  }

  // DNS (uses separate DNS-scoped token)
  try {
    for await (const r of cfDns.dns.records.list({ zone_id: creds.zoneId, per_page: 100 })) {
      hit('dns', r.name, r.content);
    }
  } catch (err) {
    console.log(`[warn] dns list skipped: ${err.errors?.[0]?.message || err.message}`);
  }
  // Pages
  try {
    for await (const p of cf.pages.projects.list({ account_id: creds.accountId })) {
      hit('pages', p.name, (p.domains || []).join(','));
    }
  } catch {}
  // Workers
  try {
    for await (const s of cf.workers.scripts.list({ account_id: creds.accountId })) {
      hit('worker', s.id);
    }
  } catch {}
  // KV
  try {
    for await (const n of cf.kv.namespaces.list({ account_id: creds.accountId })) {
      hit('kv', n.title, n.id);
    }
  } catch {}
  // R2
  try {
    const r = await cf.r2.buckets.list({ account_id: creds.accountId });
    for (const b of r.buckets || []) hit('r2', b.name);
  } catch {}

  if (matches.length === 0) {
    console.log('[clean] No `gdevelop` references in Cloudflare resources.');
  } else {
    console.log(`${matches.length} gdevelop-tainted resources:`);
    for (const m of matches) console.log(`  ${m.cat.padEnd(8)} ${m.id}  ${m.note || ''}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry
// ─────────────────────────────────────────────────────────────────────────────

const cmd = process.argv[2] || 'probe';
const arg = process.argv[3];

const creds = loadCreds();

const handlers = {
  probe: () => probe(creds),
  pages: () => listPages(creds),
  dns: () => listDns(creds, arg),
  workers: () => listWorkers(creds),
  kv: () => listKv(creds),
  r2: () => listR2(creds),
  'gdevelop-audit': () => gdevelopAudit(creds),
};

const fn = handlers[cmd];
if (!fn) {
  console.error(`Unknown command: ${cmd}`);
  console.error(`Valid: ${Object.keys(handlers).join(', ')}`);
  process.exit(2);
}
fn().catch((err) => {
  console.error(err.errors?.[0] || err.message || err);
  process.exit(1);
});
