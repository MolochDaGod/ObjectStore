#!/usr/bin/env node
/**
 * DEPRECATED — canonical skills live in master-weaponSkills.json (npm run build:weapon-pipeline).
 * Optional export for reference only → api/v1/archive/weaponSkills.v1.json
 *
 * Extracts WEAPON_TYPE_DEFINITIONS + CLASS_WEAPONS from WEAPON_SKILLS.html
 * and writes a production-ready JSON file.
 *
 * Usage: node scripts/export-weapon-skills.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'WEAPON_SKILLS.html');
const OUT_PATH = path.join(ROOT, 'api', 'v1', 'archive', 'weaponSkills.v1.json');

console.log('📦 Exporting weapon skills from WEAPON_SKILLS.html...');

const html = fs.readFileSync(HTML_PATH, 'utf-8');

// Extract the WEAPON_TYPE_DEFINITIONS object
const defMatch = html.match(/const WEAPON_TYPE_DEFINITIONS\s*=\s*(\{[\s\S]*?\n\};)/);
if (!defMatch) {
  console.error('❌ Could not find WEAPON_TYPE_DEFINITIONS in WEAPON_SKILLS.html');
  process.exit(1);
}

// Extract CLASS_WEAPONS
const classMatch = html.match(/const CLASS_WEAPONS\s*=\s*(\{[\s\S]*?\n\};)/);

// Evaluate in a sandboxed context
let WEAPON_TYPE_DEFINITIONS, CLASS_WEAPONS;

try {
  // Use Function constructor to evaluate the JS objects safely
  const evalDefs = new Function(`return ${defMatch[1].replace(/;$/, '')}`);
  WEAPON_TYPE_DEFINITIONS = evalDefs();
} catch (e) {
  console.error('❌ Failed to parse WEAPON_TYPE_DEFINITIONS:', e.message);
  process.exit(1);
}

try {
  if (classMatch) {
    const evalClass = new Function(`return ${classMatch[1].replace(/;$/, '')}`);
    CLASS_WEAPONS = evalClass();
  }
} catch (e) {
  console.warn('⚠️  Could not parse CLASS_WEAPONS, skipping.');
}

// GRUDGE UUID generator
let _seq = 0;
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return ((h >>> 0) ^ ((h >>> 0) >>> 16)).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}
function uuid(prefix, meta = '') {
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
  _seq++;
  const seq = _seq.toString(16).toUpperCase().padStart(6, '0');
  return `${prefix}-${ts}-${seq}-${fnv1a(`${prefix}-${ts}-${seq}-${meta}-${Math.random()}`)}`;
}

// Build skill with prefab connection fields
function buildSkill(skill) {
  return {
    uuid: uuid('SKIL', skill.id),
    id: skill.id,
    name: skill.name,
    description: skill.description,
    icon: skill.icon,
    tier: skill.tier,
    damage: skill.damage,
    cooldown: skill.cooldown,
    castTime: skill.castTime ?? null,
    range: skill.range ?? null,
    projectile: skill.projectile ?? null,
    damageType: skill.damageType ?? 'physical',
    animation: skill.animation ?? null,
    physics: skill.physics ?? null,
    effects: skill.effects || [],
    originalIcon: skill.icon,
    prefab: {
      modelRef: null,
      vfxRef: null,
      impactRef: null,
      animationClip: skill.animation ?? null,
      soundRef: null,
      projectileRef: skill.projectile ? null : undefined,
      cameraShake: null
    }
  };
}

// Build the output
const weaponTypes = Object.entries(WEAPON_TYPE_DEFINITIONS).map(([key, weapon]) => {
  const totalSkills = weapon.slots.reduce((sum, slot) => sum + slot.skills.length, 0);
  return {
    id: weapon.id,
    name: weapon.name,
    icon: weapon.icon,
    classes: weapon.classes || [],
    classification: weapon.classification || 'standard',
    totalSkills,
    slots: weapon.slots.map(slot => ({
      type: slot.type,
      label: slot.label,
      unlockTier: slot.unlockTier,
      skills: slot.skills.map(buildSkill),
    })),
  };
});

const totalSkills = weaponTypes.reduce((sum, w) => sum + w.totalSkills, 0);

// Also extract ARTIFACT_WEAPONS if present
let artifactTypes = [];
const artMatch = html.match(/const ARTIFACT_WEAPONS\s*=\s*(\{[\s\S]*?\n\};)/);
// Artifacts are handled inline — extract from the spread pattern
// We parse them from WEAPON_TYPE_DEFINITIONS before the delete happens
const artDefMatch = html.match(/const ARTIFACT_WEAPONS\s*=\s*\{([\s\S]*?)\};/);
if (artDefMatch) {
  // Find artifact weapon keys by looking for the pattern
  const artKeys = [...artDefMatch[1].matchAll(/(\w+):\s*\{/g)].map(m => m[1]);
  console.log(`   Found ${artKeys.length} artifact weapon type(s): ${artKeys.join(', ')}`);
  // We'll reconstruct artifact data from the original WEAPON_TYPE_DEFINITIONS
  // since the spread happens at runtime. Parse the SCYTHE block directly.
  for (const origKey of artKeys) {
    // Look for the definition in WEAPON_TYPE_DEFINITIONS
    const origDef = WEAPON_TYPE_DEFINITIONS[origKey];
    if (origDef) {
      const artTotal = origDef.slots.reduce((sum, slot) => sum + slot.skills.length, 0);
      artifactTypes.push({
        id: origDef.id,
        name: origDef.name,
        icon: origDef.icon,
        classes: origDef.classes || [],
        classification: 'artifact',
        tierSystem: false,
        levelSystem: { min: 1, max: 100, scaleFactor: 0.05 },
        totalSkills: artTotal,
        slots: origDef.slots.map(slot => ({
          type: slot.type,
          label: slot.label,
          unlockTier: slot.unlockTier,
          skills: slot.skills.map(buildSkill),
        })),
      });
    }
  }
}

const output = {
  version: '3.0.0',
  generated: new Date().toISOString(),
  totalWeaponTypes: weaponTypes.length,
  totalArtifactTypes: artifactTypes.length,
  totalSkills: totalSkills + artifactTypes.reduce((s, a) => s + a.totalSkills, 0),
  classRestrictions: CLASS_WEAPONS || {},
  weaponTypes,
  artifactWeapons: artifactTypes,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));

console.log(`✅ Exported ${weaponTypes.length} weapon types, ${totalSkills} skills`);
console.log(`   → ${OUT_PATH}`);

// Print summary
for (const wt of weaponTypes) {
  const classes = wt.classes.length ? ` (${wt.classes.join(', ')})` : '';
  console.log(`   ${wt.name.padEnd(16)} ${String(wt.totalSkills).padStart(3)} skills${classes}`);
}
