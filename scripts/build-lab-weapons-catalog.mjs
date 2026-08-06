/**
 * Rebuild lab externalWeapons catalog + box collider sidecars.
 * Source GLBs: models/grudge6/lab-weapons/*.glb (from D:/Games/Models/_glb_weapons)
 *
 * Attach SSOT (kit hierarchy):
 *   main_hand → R_hand_container
 *   staff (wand/staff/bow) → L_hand_container
 *   off_hand dual (dagger|mace|hammer) → L_hand_container
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'models/grudge6/lab-weapons');
const CAT = path.join(ROOT, 'api/v1/grudge6-lab-extended-catalog.json');
const CDN = 'https://assets.grudge-studio.com';

const KIND = {
  sword: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 1.05, animPack: 'sword_shield' },
  axe: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 1.05, animPack: '2h_melee' },
  spear: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 2.0, animPack: '2h_melee' },
  crossbow: { defaultSlot: 'main_hand', canOffhand: false, targetLenM: 0.95, animPack: 'longbow' },
  dagger: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 0.45, animPack: 'sword_shield' },
  mace: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 1.0, animPack: '2h_melee' },
  hammer: { defaultSlot: 'main_hand', canOffhand: true, targetLenM: 0.9, animPack: '2h_melee' },
  staff: { defaultSlot: 'staff', canOffhand: false, targetLenM: 1.85, animPack: 'magic' },
  wand: { defaultSlot: 'staff', canOffhand: false, targetLenM: 1.85, animPack: 'magic' },
  bow: { defaultSlot: 'staff', canOffhand: false, targetLenM: 1.0, animPack: 'longbow' },
};

function measure(filePath) {
  const buf = fs.readFileSync(filePath);
  const jl = buf.readUInt32LE(12);
  const j = JSON.parse(buf.slice(20, 20 + jl).toString('utf8'));
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (const acc of j.accessors || []) {
    if (acc.type !== 'VEC3' || !acc.min || !acc.max) continue;
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], acc.min[k]);
      max[k] = Math.max(max[k], acc.max[k]);
    }
  }
  const size = min.map((m, i) => max[i] - m);
  const lengthM = Math.max(...size);
  const center = min.map((m, i) => (m + max[i]) / 2);
  const halfExtents = size.map((s) => s / 2);
  return { size, lengthM, center, halfExtents, bytes: buf.length };
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.glb')).sort();
const externalWeapons = [];
const now = new Date().toISOString();

for (const file of files) {
  const id = file.replace(/\.glb$/i, '');
  const kind = id.split('_')[0].toLowerCase();
  const tier = Number((id.match(/_t(\d+)/i) || [])[1] || 0);
  const meta =
    KIND[kind] || {
      defaultSlot: 'main_hand',
      canOffhand: false,
      targetLenM: 1.0,
      animPack: 'sword_shield',
    };
  const m = measure(path.join(DIR, file));
  const collider = {
    type: 'box',
    halfExtents: { x: m.halfExtents[0], y: m.halfExtents[1], z: m.halfExtents[2] },
    center: { x: m.center[0], y: m.center[1], z: m.center[2] },
    sizeM: { x: m.size[0], y: m.size[1], z: m.size[2] },
    lengthM: m.lengthM,
  };

  const side = {
    meshId: `lab_weapon:${id}`,
    kind,
    tier,
    collider,
    generatedAt: now,
    attach: meta.defaultSlot,
    canOffhand: meta.canOffhand,
  };
  fs.writeFileSync(
    path.join(DIR, file.replace(/\.glb$/i, '.collider.json')),
    `${JSON.stringify(side, null, 2)}\n`,
  );

  externalWeapons.push({
    id,
    file,
    kind,
    tier,
    bytes: m.bytes,
    labUrl: `./models/grudge6/lab-weapons/${file}`,
    cdnUrl: `${CDN}/models/grudge6/lab-weapons/${file}`,
    colliderUrl: `${CDN}/models/grudge6/lab-weapons/${file.replace(/\.glb$/i, '.collider.json')}`,
    attach: meta.defaultSlot,
    canOffhand: meta.canOffhand,
    targetLenM: meta.targetLenM,
    animPack: meta.animPack,
    sockets: {
      main: meta.defaultSlot === 'staff' ? 'L_hand_container' : 'R_hand_container',
      off: meta.canOffhand ? 'L_hand_container' : null,
    },
    collider,
    meshId: `lab_weapon:${id}`,
  });
}

let cat = {};
if (fs.existsSync(CAT)) {
  try {
    cat = JSON.parse(fs.readFileSync(CAT, 'utf8').replace(/\\n\s*$/, '').trim());
  } catch {
    cat = {};
  }
}

cat.version = cat.version || 1;
cat.generatedAt = now;
cat.era = 'warlords';
cat.policy =
  cat.policy ||
  'Lab extended catalog. Prod Characters.glb read-only. External weapons hand-attach; mounts/siege bake to CDN.';
cat.sources = cat.sources || {
  glbWeapons: 'D:/Games/Models/_glb_weapons',
  toonRts: 'Toon_RTS author pack',
  setsGallery: 'https://imgur.com/a/sFHXx2X',
  prodKits: `${CDN}/models/grudge6/races/{PREFIX}_Characters.glb`,
};
cat.externalWeapons = externalWeapons;
cat.weaponAttachSSOT = {
  main_hand: 'R_hand_container (sword/axe/spear/dagger/mace/hammer/crossbow)',
  staff: 'L_hand_container (staff + wand + bow — same as kit staff/bow)',
  off_hand: 'L_hand_container dual — dagger | mace | hammer only',
  exclusive: 'staff and off_hand share L_hand_container',
  module: 'js/grudge6-lab-weapons.js',
};
cat.counts = {
  ...(cat.counts || {}),
  weapons: externalWeapons.length,
  externalWeapons: externalWeapons.length,
  colliders: externalWeapons.length,
};
// keep mounts/siege/colors/unity if present
if (!cat.mounts) cat.mounts = [];
if (!cat.siege) cat.siege = [];
if (!cat.colors) cat.colors = {};
if (!cat.unityArmourByRace) cat.unityArmourByRace = {};

fs.writeFileSync(CAT, `${JSON.stringify(cat, null, 2)}\n`);

const byAttach = externalWeapons.reduce((a, w) => {
  a[w.attach] = (a[w.attach] || 0) + 1;
  return a;
}, {});
console.log(
  JSON.stringify(
    {
      weapons: externalWeapons.length,
      byAttach,
      dual: externalWeapons.filter((w) => w.canOffhand).length,
      colliders: externalWeapons.length,
    },
    null,
    2,
  ),
);
