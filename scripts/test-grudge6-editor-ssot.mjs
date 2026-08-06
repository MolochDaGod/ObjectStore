#!/usr/bin/env node
/**
 * grudge6 Editor SSOT smoke test — no browser.
 * Validates one SSOT contract: APIs exist, T0–T1 filters, skill type lookup,
 * slot inventory shapes, live info host (optional --live).
 *
 * Usage:
 *   node scripts/test-grudge6-editor-ssot.mjs
 *   node scripts/test-grudge6-editor-ssot.mjs --live
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LIVE = process.argv.includes('--live');
const INFO = 'https://info.grudge-studio.com';

let passed = 0;
let failed = 0;
const fails = [];

function ok(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    fails.push(name);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** Mirrors js/grudge6-editor.js isT0T1Tier */
function isT0T1Tier(raw) {
  if (raw == null || raw === '') return true;
  const s = String(raw).toUpperCase();
  if (/^T?0$|^T?1$|STARTER|COMMON/.test(s)) return true;
  const n = Number(String(raw).replace(/^T/i, ''));
  if (Number.isFinite(n)) return n <= 1;
  return /t0|t1|tier.?[01]\b/i.test(String(raw));
}

/** Mirrors findWeaponSkillType */
function findWeaponSkillType(weaponSkillsApi, kind) {
  const k = String(kind || 'SWORD').toUpperCase();
  const wt = weaponSkillsApi?.weaponTypes || weaponSkillsApi?.types || {};
  const arr = Array.isArray(wt) ? wt : Object.values(wt || {});
  return (
    arr.find((v) => String(v?.id || v?.type || v?.name || '').toUpperCase() === k) ||
    arr.find((v) => String(v?.id || v?.type || v?.name || '').toUpperCase().includes(k)) ||
    null
  );
}

console.log('\n=== grudge6 Editor SSOT test ===\n');

// 1. Files
console.log('Files');
const requiredFiles = [
  'grudge6-editor.html',
  'js/grudge6-editor.js',
  'js/grudge6-kit.js',
  'js/grudge6-lab-weapons.js',
  'js/grudge6-anim-packs.js',
  'api/v1/grudge6-editor-ssot.json',
];
for (const f of requiredFiles) {
  ok(f, fs.existsSync(path.join(ROOT, f)));
}

// 2. SSOT JSON contract
console.log('\nSSOT JSON');
const ssot = readJson('api/v1/grudge6-editor-ssot.json');
ok('ssot loads', !!ssot);
ok('ssot.id', ssot?.id === 'grudge6-editor');
ok('ssot.tiers T0 T1', Array.isArray(ssot?.tiers) && ssot.tiers.includes('T0') && ssot.tiers.includes('T1'));
ok('ssot.slots ≥ 10', (ssot?.slots?.length || 0) >= 10);
ok('ssot.meshSsot.playKit Toon', /toon-rts-characters/.test(ssot?.meshSsot?.playKit || ''));
ok('ssot.cdnWrite false', ssot?.editor?.cdnWrite === false);
const slotIds = (ssot?.slots || []).map((s) => s.id);
for (const id of ['body', 'main_hand', 'off_hand', 'relic', 'class_item', 'form']) {
  ok(`slot ${id}`, slotIds.includes(id));
}

// 3. API files present + readable
console.log('\nAPI files');
const apiKeys = ssot?.apis || {};
for (const [key, rel] of Object.entries(apiKeys)) {
  const j = readJson(rel.replace(/^\.\//, ''));
  ok(`api ${key}`, !!j, rel);
}

// 4. T0–T1 inventory filters
console.log('\nT0–T1 filters');
ok('isT0T1Tier(0)', isT0T1Tier(0));
ok('isT0T1Tier(1)', isT0T1Tier(1));
ok('isT0T1Tier(T0)', isT0T1Tier('T0'));
ok('!isT0T1Tier(2)', !isT0T1Tier(2));
ok('!isT0T1Tier(T3)', !isT0T1Tier('T3'));

const lab = readJson('api/v1/grudge6-lab-extended-catalog.json');
const labT01 = (lab?.externalWeapons || []).filter((w) => isT0T1Tier(w.tier) || /_t[01]$/i.test(w.id));
ok('lab T0–T1 weapons ≥ 8', labT01.length >= 8, `got ${labT01.length}`);

const t0w = readJson('api/v1/t0-weapons.json');
ok('t0-weapons list', (t0w?.weapons?.length || 0) >= 5);

const relics = readJson('api/v1/master-relics.json');
const relT01 = (relics?.relics || []).filter((r) => isT0T1Tier(r.tier ?? 1));
ok('relics T0–T1 ≥ 10', relT01.length >= 10, `got ${relT01.length}`);

// 5. Weapon skills shape (array not map)
console.log('\nWeapon skills / class trees');
const ws = readJson('api/v1/master-weaponSkills.json');
const sword = findWeaponSkillType(ws, 'SWORD');
ok('findWeaponSkillType SWORD', !!sword && String(sword.id).toUpperCase() === 'SWORD');
ok('SWORD has slots or skills', (sword?.slots?.length || sword?.skills?.length || 0) > 0);

const t0pat = readJson('api/v1/_meta/t0-starter-slot-pattern.json');
ok('t0 pattern SWORD', !!t0pat?.types?.SWORD?.slot1);

const trees = readJson('api/v1/master-skillTrees.json');
ok('skillTrees has warrior', !!trees?.skillTrees?.warrior || !!trees?.skillTrees?.Warrior);

// 6. Icon shards
console.log('\nIcons');
const wIco = readJson('api/v1/icon-shards/weapon.json');
ok('weapon icons array', Array.isArray(wIco?.icons) && wIco.icons.length > 10);
ok('weapon icon has c or p', !!(wIco?.icons?.[0]?.c || wIco?.icons?.[0]?.p));

// 7. Characters catalog forms
console.log('\nCharacters / forms');
const chars = readJson('api/v1/grudge6-characters.json');
const human = (chars?.races || []).find((r) => r.id === 'human');
ok('human race', !!human);
ok('human classLoadouts', !!(human?.classLoadouts && Object.keys(human.classLoadouts).length));

// 8. Editor JS surface markers (no full parse)
console.log('\nEditor module surface');
const ed = fs.readFileSync(path.join(ROOT, 'js/grudge6-editor.js'), 'utf8');
for (const mark of [
  'export class Grudge6Editor',
  'export function isT0T1Tier',
  'export function findWeaponSkillType',
  'EDITOR_SLOTS',
  'itemsForActiveSlot',
  'exportLoadoutJson',
  'exportActiveSlotGlb',
  'TransformControls',
  'GLTFExporter',
  "source: 'toonRts'",
  'master-weaponSkills',
  'master-relics',
  'master-skillTrees',
]) {
  ok(`editor has ${mark}`, ed.includes(mark));
}

// 9. Optional live smoke
if (LIVE) {
  console.log('\nLive info.grudge-studio.com');
  const urls = [
    `${INFO}/grudge6-editor.html`,
    `${INFO}/js/grudge6-editor.js`,
    `${INFO}/api/v1/grudge6-editor-ssot.json`,
    `${INFO}/api/v1/master-weaponSkills.json`,
    `${INFO}/api/v1/t0-weapons.json`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { method: 'HEAD' });
      ok(`live ${u.replace(INFO, '')}`, r.ok, `status ${r.status}`);
    } catch (e) {
      ok(`live ${u.replace(INFO, '')}`, false, e.message);
    }
  }
} else {
  console.log('\n(skip live — pass --live to smoke info host)');
}

// Summary
console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
if (failed) {
  console.error('FAILED:', fails.join(', '));
  process.exit(1);
}
process.exit(0);
