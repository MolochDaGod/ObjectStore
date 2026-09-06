/**
 * Fill master-weaponSkills prefab.overlayRef from stylized-projectiles.json.
 * Does NOT overwrite prefab.vfxRef (GLB/catalog effect ids).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cat = JSON.parse(readFileSync(join(root, 'api/v1/stylized-projectiles.json'), 'utf8'));
const skillsPath = join(root, 'api/v1/master-weaponSkills.json');
const data = JSON.parse(readFileSync(skillsPath, 'utf8'));

const bySkill = new Map();
for (const p of cat.projectiles || []) {
  for (const id of p.skills || []) bySkill.set(id, p.vfxRef);
}
const patterns = (cat.idPatterns || []).map((p) => ({
  re: new RegExp(p.test, 'i'),
  id: p.id,
  element: p.element || null,
}));
const byId = new Map((cat.projectiles || []).map((p) => [p.id, p.vfxRef]));

function overlayRefFor(skill) {
  if (bySkill.has(skill.id)) return bySkill.get(skill.id);
  const blob = `${skill.id || ''} ${skill.name || ''} ${skill.damageType || ''}`.toLowerCase();
  const el = String(skill.damageType || '').toLowerCase();
  for (const p of patterns) {
    if (!p.re.test(blob)) continue;
    if (p.element && p.element !== el) continue;
    return byId.get(p.id) || null;
  }
  return null;
}

let stamped = 0;
let kept = 0;
function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.id === 'string' && node.prefab && typeof node.prefab === 'object') {
    const ref = overlayRefFor(node);
    if (ref) {
      if (!node.prefab.overlayRef) {
        node.prefab.overlayRef = ref;
        stamped += 1;
      } else kept += 1;
    }
  }
  if (Array.isArray(node)) node.forEach(walk);
  else Object.values(node).forEach(walk);
}
walk(data);
writeFileSync(skillsPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify({ stamped, keptExisting: kept, catalogLooks: cat.projectiles.length }));
