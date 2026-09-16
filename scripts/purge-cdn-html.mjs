#!/usr/bin/env node
/**
 * Most-valuable CDN purges — HTML-as-JS / HTML-as-GLB keys.
 *
 * Usage:
 *   node scripts/purge-cdn-html.mjs
 *   node scripts/purge-cdn-html.mjs --token "$PURGE_TOKEN"
 *   CDN=https://assets.grudge-studio.com node scripts/purge-cdn-html.mjs
 */
const CDN = (process.env.CDN || 'https://assets.grudge-studio.com').replace(/\/$/, '');
const TOKEN = process.env.PURGE_TOKEN || process.env.GRUDGE_PURGE_TOKEN || '';
const extra = process.argv.filter((a) => a.startsWith('--token=')).map((a) => a.slice(8));
const token = extra[0] || (process.argv.includes('--token') ? process.argv[process.argv.indexOf('--token') + 1] : TOKEN);

export const HIGH_VALUE_PURGE = [
  'js/grudge-game-bootstrap.js',
  'grudge-game-bootstrap.js',
  'grudge-fleet.js',
  'models/_optimized/buildings/cantina.glb',
  'models/_optimized/buildings/tavern.glb',
  'models/_optimized/buildings/inn.glb',
  'models/_optimized/buildings/house.glb',
  'models/_optimized/buildings/blacksmith.glb',
  'models/_optimized/buildings/market.glb',
];

async function purge(path) {
  const u = new URL('/_purge', CDN);
  u.searchParams.set('path', path);
  const headers = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['X-Grudge-Purge'] = token;
  }
  const res = await fetch(u, { method: 'POST', headers });
  const body = await res.text();
  return { path, status: res.status, body };
}

const args = process.argv.slice(2);
const paths = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--token') { i++; continue; }
  if (a.startsWith('-')) continue;
  paths.push(a);
}
const list = paths.length ? paths : HIGH_VALUE_PURGE;

const rows = [];
for (const p of list) {
  const r = await purge(p);
  rows.push(r);
  console.log(`${r.status}  ${p}  ${r.body}`);
}
const bad = rows.filter((r) => r.status >= 400);
process.exit(bad.length ? 1 : 0);
