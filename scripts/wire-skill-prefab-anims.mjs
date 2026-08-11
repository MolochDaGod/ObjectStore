#!/usr/bin/env node
/**
 * Wire master-weaponSkills prefab.animationClip / modelRef / vfx from
 * grudge6-prefab-anim-rules (pack/role + prod/gltf).
 *
 * Fills null fields only (unless --force).
 *
 * Usage:
 *   node scripts/wire-skill-prefab-anims.mjs
 *   node scripts/wire-skill-prefab-anims.mjs --dry
 *   node scripts/wire-skill-prefab-anims.mjs --force
 *   node scripts/wire-skill-prefab-anims.mjs --report-only
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SKILLS_PATH = join(ROOT, 'api/v1/master-weaponSkills.json');
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const REPORT_ONLY = process.argv.includes('--report-only');

const rulesUrl = pathToFileURL(join(ROOT, 'js/grudge6-prefab-anim-rules.js')).href;
const {
  auditWeaponSkillsDoc,
  applyPrefabPatchesToDoc,
} = await import(rulesUrl);

const raw = readFileSync(SKILLS_PATH, 'utf8');
const doc = JSON.parse(raw);

console.log('\n=== wire-skill-prefab-anims ===\n');
const before = auditWeaponSkillsDoc(doc);
console.log('Before');
console.log(
  `  skills ${before.totalSkills} · animationClip ${before.withAnimationClip} (${before.pctClip}%) · modelRef ${before.withModelRef} · vfx ${before.withVfxRef}`,
);
console.log(`  game-ready (≥40 + clip) ${before.gameReadyCount} (${before.pctReady}%) · improveable ${before.improveable}`);
console.log('  by weapon:');
for (const [k, v] of Object.entries(before.byWeapon || {}).sort()) {
  console.log(`    ${k.padEnd(12)} total ${v.total} improveable ${v.improveable} avgScore ${v.avgScore}`);
}

if (REPORT_ONLY) {
  console.log('\n(--report-only) no write\n');
  process.exit(0);
}

if (DRY) {
  console.log('\n(--dry) would fill improveable skills; no write\n');
  process.exit(0);
}

const result = applyPrefabPatchesToDoc(doc, { force: FORCE });
const after = auditWeaponSkillsDoc(doc);

writeFileSync(SKILLS_PATH, JSON.stringify(doc, null, 2) + '\n', 'utf8');

console.log('\nAfter');
console.log(
  `  skills ${after.totalSkills} · animationClip ${after.withAnimationClip} (${after.pctClip}%) · modelRef ${after.withModelRef} · vfx ${after.withVfxRef}`,
);
console.log(`  game-ready ${after.gameReadyCount} (${after.pctReady}%) · still improveable ${after.improveable}`);
console.log(`\nTouched ${result.touched} skills · fields filled ${result.fieldsFilled}`);
console.log(`Wrote ${SKILLS_PATH}`);
console.log('\nEditor smoke: https://info.grudge-studio.com/grudge6-editor.html');
console.log('Local test: node scripts/test-grudge6-editor-ssot.mjs\n');
