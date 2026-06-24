#!/usr/bin/env node
/**
 * Check ICON library CDN coverage and write api/v1/icon-upload-status.json
 * Usage: node scripts/check-icon-cdn-status.mjs [--sample=200]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = join(__dirname, '..', 'api', 'v1');
const fullCheck = process.argv.includes('--full');
const sampleArg = process.argv.find(a => a.startsWith('--sample='));
const SAMPLE_PER_CAT = fullCheck ? 0 : (sampleArg ? Number(sampleArg.split('=')[1]) : 25);

async function headOk(url) {
  try {
    let res = await fetch(url, { method: 'HEAD' });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
    }
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const registry = JSON.parse(await readFile(join(API, 'icon-registry.json'), 'utf8'));
  const byCategory = {};
  for (const e of Object.values(registry.entries || {})) {
    const cat = e.category || 'misc';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(e);
  }

  const categories = {};
  let totalOnCdn = 0;
  let totalChecked = 0;

  for (const [cat, items] of Object.entries(byCategory)) {
    const toCheck = SAMPLE_PER_CAT > 0 && items.length > SAMPLE_PER_CAT
      ? items.filter((_, i) => i % Math.ceil(items.length / SAMPLE_PER_CAT) === 0).slice(0, SAMPLE_PER_CAT)
      : items;
    let onCdn = 0;
    for (const item of toCheck) {
      if (await headOk(item.cdnUrl)) onCdn++;
    }
    const ratio = toCheck.length ? onCdn / toCheck.length : 0;
    categories[cat] = {
      total: items.length,
      checked: toCheck.length,
      onCdn,
      estimatedOnCdn: SAMPLE_PER_CAT > 0 ? Math.round(items.length * ratio) : onCdn,
      complete: SAMPLE_PER_CAT === 0
        ? onCdn === items.length
        : (onCdn === toCheck.length && toCheck.length === items.length),
    };
    totalOnCdn += categories[cat].estimatedOnCdn;
    totalChecked += toCheck.length;
  }

  const status = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    registryTotal: registry.totalEntries,
    cdnBase: registry.cdnBase,
    keyPrefix: registry.keyPrefix,
    uploadComplete: totalOnCdn >= registry.totalEntries,
    estimatedOnCdn: totalOnCdn,
    estimatedPercent: Math.round((totalOnCdn / registry.totalEntries) * 1000) / 10,
    categories,
    resumeCommand: 'node scripts/upload-icon-registry-r2.mjs --skip-existing --skip-remote-verify',
    syncCommand: 'npm run sync:icon-truth',
    docs: '/docs/ICON-ASSET-LIBRARY.md',
  };

  await writeFile(join(API, 'icon-upload-status.json'), JSON.stringify(status, null, 2), 'utf8');
  console.log(`[status] ${status.estimatedOnCdn}/${status.registryTotal} (~${status.estimatedPercent}% on CDN)`);
  for (const [cat, s] of Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0]))) {
    const mark = s.complete ? '✓' : '…';
    console.log(`  ${mark} ${cat}: ${s.onCdn}/${s.checked} checked (${s.total} total)`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});