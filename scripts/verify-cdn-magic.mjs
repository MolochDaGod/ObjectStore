#!/usr/bin/env node
/**
 * Classify CDN objects by magic vs Content-Type.
 * Never LF-normalizes binaries. Optional --purge HTML poisons.
 *
 * On worker < 2.3, GET of missing keys re-backfills SPA HTML. Those paths
 * are skipped unless --force or /_health reports html-guard.
 *
 *   node scripts/verify-cdn-magic.mjs
 *   node scripts/verify-cdn-magic.mjs --purge
 *   node scripts/verify-cdn-magic.mjs --force
 */
const CDN = (process.env.CDN || 'https://assets.grudge-studio.com').replace(/\/$/, '');
const TOKEN = process.env.PURGE_TOKEN || '';
const doPurge = process.argv.includes('--purge');
const force = process.argv.includes('--force');

const CHECKS = [
  { path: 'js/grudge-fleet.js', expect: 'js' },
  { path: 'js/grudge6-kit.js', expect: 'js' },
  { path: 'js/grudge-id-client.js', expect: 'js-or-404', missPoisons: true },
  { path: 'js/grudge-game-bootstrap.js', expect: 'js-or-404', missPoisons: true },
  { path: 'grudge-fleet.js', expect: 'js-or-404', missPoisons: true },
  { path: 'grudge-game-bootstrap.js', expect: 'js-or-404', missPoisons: true },
  { path: 'models/grudge6/races/WK_Characters.glb', expect: 'glb' },
  { path: 'models/grudge6/races/WK_Characters.fbx', expect: 'fbx' },
  { path: 'models/_optimized/buildings/cantina.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'models/_optimized/buildings/tavern.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'models/_optimized/buildings/inn.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'models/_optimized/buildings/house.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'models/_optimized/buildings/blacksmith.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'models/_optimized/buildings/market.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'models/buildings/cantina.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'models/buildings/house.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'models/buildings/market.glb', expect: 'glb-or-404', missPoisons: true },
  { path: 'effects/3d/fire/arpg-effects_fire_16x4.png', expect: 'png' },
];

function classify(buf) {
  if (!buf || !buf.length) return 'empty';
  if (buf[0] === 0x67 && buf[1] === 0x6c && buf[2] === 0x54 && buf[3] === 0x46) return 'glb';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0x00 && buf[1] === 0x61 && buf[2] === 0x73 && buf[3] === 0x6d) return 'wasm';
  const s = Buffer.from(buf.subarray(0, 24)).toString('latin1');
  if (s.startsWith('Kaydara FBX')) return 'fbx';
  const t = Buffer.from(buf.subarray(0, 96)).toString('utf8').replace(/^\s+/, '');
  if (t.startsWith('<!DOCTYPE') || t.startsWith('<html') || t.startsWith('<HTML')) return 'html';
  if (t.startsWith('/*') || t.startsWith('//') || t.startsWith('(function') || t.startsWith('import ')) return 'js';
  if (t.startsWith('{') || t.startsWith('[')) return 'json';
  return 'other';
}

function ok(expect, kind, status) {
  if (status === 404) return expect.endsWith('404') || expect.endsWith('or-404');
  if (expect === 'js-or-404') return kind === 'js';
  if (expect === 'glb-or-404') return kind === 'glb';
  return kind === expect;
}

function hasHtmlGuard(health) {
  const feats = health.features || [];
  if (feats.includes('html-guard') || feats.includes('magic-reject')) return true;
  const [maj, min] = String(health.version || '0').split('.').map((n) => parseInt(n, 10) || 0);
  return maj > 2 || (maj === 2 && min >= 3);
}

async function purge(path) {
  const u = new URL('/_purge', CDN);
  u.searchParams.set('path', path);
  const headers = { Accept: 'application/json' };
  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
    headers['X-Grudge-Purge'] = TOKEN;
  }
  const res = await fetch(u, { method: 'POST', headers });
  return res.status;
}

const healthRes = await fetch(`${CDN}/_health`);
const health = await healthRes.json().catch(() => ({}));
const guarded = hasHtmlGuard(health);
console.log(`health ${health.version || '?'} html-guard=${guarded} features=${(health.features || []).join(',')}`);
if (!guarded && !force) {
  console.log('skipping missPoisons GET until v2.3 html-guard is live (pass --force to override)');
}

let fail = 0;
for (const { path, expect, missPoisons } of CHECKS) {
  if (missPoisons && !guarded && !force) {
    console.log(`skip ${path}  expect=${expect}  (would re-poison on ${health.version || 'old'} worker)`);
    continue;
  }
  const res = await fetch(`${CDN}/${path}`, { headers: { Range: 'bytes=0-95' } });
  const buf = Buffer.from(await res.arrayBuffer());
  const kind = res.status === 404 ? 'missing' : classify(buf);
  const src = res.headers.get('x-asset-source') || '';
  const ct = res.headers.get('content-type') || '';
  const pass = ok(expect, kind, res.status);
  if (!pass) fail++;
  const mark = pass ? 'ok' : 'FAIL';
  console.log(`${mark.padEnd(4)} ${String(res.status).padEnd(3)} ${kind.padEnd(8)} expect=${expect.padEnd(12)} src=${src.padEnd(16)} ${path}  ${ct}`);
  if (doPurge && kind === 'html') {
    const st = await purge(path);
    console.log(`     purged ${path} -> ${st}`);
  }
}
process.exit(fail ? 1 : 0);
