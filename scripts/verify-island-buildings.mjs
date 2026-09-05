#!/usr/bin/env node
/**
 * Verify island building GLBs: magic + catalog byte length.
 * Does NOT GET models/_optimized/* (CDN 2.2.1 missPoisons HTML).
 *
 *   node scripts/verify-island-buildings.mjs
 */
const CDN = 'https://assets.grudge-studio.com';
const INFO = 'https://info.grudge-studio.com';
const CATALOG = `${INFO}/api/v1/island-building-prefabs.json`;
const UA = 'GrudgeIslandBuildingVerify/1.0';

function magic(buf) {
  if (!buf || buf.length < 4) return 'short';
  if (buf[0] === 0x67 && buf[1] === 0x6c && buf[2] === 0x54 && buf[3] === 0x46) return 'glTF';
  if (buf[0] === 0x3c) return 'HTML';
  return `other:${buf.slice(0, 4).toString('latin1')}`;
}

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Cache-Control': 'no-cache' } });
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    url,
    status: res.status,
    bytes: buf.length,
    kind: magic(buf),
    src: res.headers.get('x-asset-source') || '',
    ctype: res.headers.get('content-type') || '',
  };
}

const catalog = await (await fetch(CATALOG, { headers: { 'User-Agent': UA } })).json();
const rows = catalog.prefabs || [];
let fail = 0;
console.log(`catalog ${catalog.count} buildings  height=${catalog.scale?.buildingHeightM}m`);
for (const p of rows) {
  const want = p.mesh?.bytes;
  const key = p.mesh?.r2Key;
  const cdn = await get(p.mesh?.cdnUrl || `${CDN}/${key}`);
  const info = await get(p.mesh?.infoUrl || `${INFO}/${key}`);
  const cdnOk = cdn.kind === 'glTF' && cdn.bytes === want;
  const infoOk = info.kind === 'glTF' && info.bytes === want;
  const mark = infoOk ? (cdnOk ? 'OK ' : 'INFO') : 'FAIL';
  if (!infoOk) fail++;
  console.log(
    `${mark}  ${p.id.padEnd(12)} want=${want}  cdn=${cdn.bytes}:${cdn.kind}:${cdn.src || '-'}  info=${info.bytes}:${info.kind}`,
  );
}
if (fail) {
  console.error(`\n${fail} building(s) missing 4 m glTF on info.*`);
  process.exit(1);
}
console.log('\nidentity OK. CDN public key should match catalog bytes (cantina uses cantina-4m.glb).');
