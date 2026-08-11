import fs from 'node:fs';
const h = fs.readFileSync('js/main-panel-hero-viewport.js', 'utf8');
const m = fs.readFileSync('main-panel.html', 'utf8');
const c = {
  faceExport: h.includes('export const FACE_CAMERA_YAW'),
  facePi: h.includes('FACE_CAMERA_YAW = Math.PI'),
  applyFace: h.includes('applyFaceCamera'),
  tickFace: h.includes('if (root) applyFaceCamera(root, FACE_CAMERA_YAW)'),
  legs: m.includes("'Legs'"),
  cloak: m.includes("'Cloak'"),
  eqBody: m.includes('eq-body'),
  eqBottom: m.includes('eq-bottom'),
  left5: m.includes("['Helm', 'Chest', 'Hands', 'Legs', 'Feet']") || m.includes("['Helm', 'Chest', 'Hands', 'Legs', 'Feet']"),
  canonical: m.includes('canonical-paperdoll'),
};
console.log(c);
const fail = Object.entries(c).filter(([, v]) => !v).map(([k]) => k);
if (fail.length) {
  console.error('FAIL', fail);
  process.exit(1);
}
console.log('OK equip layout + face-user yaw');
