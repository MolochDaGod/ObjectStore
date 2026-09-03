/**
 * 3DFX lab — skill API + r185 GLTF + instanced sparks + Rapier heightfield/ray.
 * Extends ObjectStore 3dfx-viewer.html. Not a second VFX product.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const CDN = 'https://assets.grudge-studio.com';
const INFO = './api/v1';
const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b12);
scene.fog = new THREE.FogExp2(0x070b12, 0.035);

const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 400);
camera.position.set(6, 3.2, 8);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 1.0, 0);

scene.add(new THREE.HemisphereLight(0xb8c8e8, 0x1a1208, 0.7));
const sun = new THREE.DirectionalLight(0xfff2d0, 1.4);
sun.position.set(6, 10, 4);
scene.add(sun);

const dummy = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.32, 1.1, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0x6a7a90, roughness: 0.55 }),
);
dummy.position.y = 0.87;
scene.add(dummy);

let rapier = null;
let world = null;
let sparkMesh = null;
let sparkN = 0;
const SPARKS = 256;
const sparkLife = new Float32Array(SPARKS);
let mixer = null;
let clock = new THREE.Clock();
let currentRoot = null;
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath(DRACO);
loader.setDRACOLoader(draco);

function resize() {
  const w = canvas.clientWidth || canvas.parentElement.clientWidth || 800;
  const h = canvas.clientHeight || canvas.parentElement.clientHeight || 500;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function makeHeightfield() {
  const cols = 48;
  const rows = 48;
  const heights = [];
  for (let z = 0; z <= rows; z++) {
    for (let x = 0; x <= cols; x++) {
      const u = x / cols;
      const v = z / rows;
      heights.push(0.15 * Math.sin(u * 6.2) * Math.cos(v * 5.1));
    }
  }
  const geo = new THREE.PlaneGeometry(24, 24, cols, rows);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heights[i]);
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x2a3a2a, roughness: 0.92, metalness: 0.04, wireframe: false,
  }));
  mesh.receiveShadow = true;
  scene.add(mesh);
  return { cols, rows, heights, scale: { x: 24 / cols, y: 1, z: 24 / rows } };
}

const terrain = makeHeightfield();

function makeSparks() {
  const geo = new THREE.SphereGeometry(0.04, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffc070 });
  sparkMesh = new THREE.InstancedMesh(geo, mat, SPARKS);
  sparkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  sparkMesh.count = 0;
  scene.add(sparkMesh);
}
makeSparks();
const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();

function burstSparks(origin, n = 48) {
  const start = sparkN;
  for (let i = 0; i < n; i++) {
    const idx = (start + i) % SPARKS;
    sparkLife[idx] = 0.6 + Math.random() * 0.4;
    _p.set(
      origin.x + (Math.random() - 0.5) * 0.4,
      origin.y + Math.random() * 0.3,
      origin.z + (Math.random() - 0.5) * 0.4,
    );
    _m.makeTranslation(_p.x, _p.y, _p.z);
    sparkMesh.setMatrixAt(idx, _m);
  }
  sparkN = (start + n) % SPARKS;
  sparkMesh.count = SPARKS;
  sparkMesh.instanceMatrix.needsUpdate = true;
}

async function bootRapier() {
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.19.3/+esm');
    rapier = mod.default || mod;
    await rapier.init();
    world = new rapier.World({ x: 0, y: -9.81, z: 0 });
    const hf = rapier.ColliderDesc.heightfield(
      terrain.rows,
      terrain.cols,
      new Float32Array(terrain.heights),
      terrain.scale,
    );
    world.createCollider(hf);
    setHud('Rapier heightfield + ray ready');
  } catch (e) {
    setHud('Rapier skipped: ' + (e.message || e));
  }
}

function rapierRay(from, dir) {
  if (!world || !rapier) return null;
  const ray = new rapier.Ray({ x: from.x, y: from.y, z: from.z }, { x: dir.x, y: dir.y, z: dir.z });
  const hit = world.castRay(ray, 40, true);
  if (!hit) return null;
  return ray.pointAt(hit.timeOfImpact);
}

function setHud(t) {
  const el = document.getElementById('hudLeft');
  if (el) el.textContent = t;
}

function flattenSkills(j) {
  const out = [];
  for (const wt of j.weaponTypes || []) {
    for (const slot of wt.slots || []) {
      for (const s of slot.skills || []) {
        out.push({
          id: s.id,
          name: s.name || s.id,
          weapon: wt.name || wt.id,
          slot: slot.label || slot.type,
          cooldown: s.cooldown,
          prefab: s.prefab || {},
          effect: s.effect || s.description || '',
        });
      }
    }
  }
  return out;
}

const DB = { skills: [], glb: [], d1fx: [] };

function elist(id) { return document.getElementById(id); }

function renderList(node, items, kind) {
  if (!node) return;
  node.innerHTML = items.map((it, i) =>
    `<div class="item" data-kind="${kind}" data-i="${i}">
      <span class="dot" style="color:#d4a84b"></span>
      <div><div class="name">${esc(it.name || it.id)}</div>
      <div class="meta">${esc(it.weapon || it.kind || it.era || '')}</div></div>
      <div class="uuid">${esc((it.id || '').slice(0, 10))}</div>
    </div>`).join('');
  node.querySelectorAll('.item').forEach((row) => {
    row.onclick = () => select(kind, items[+row.dataset.i]);
  });
}

function esc(s) {
  return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function select(kind, item) {
  if (!item) return;
  document.getElementById('title').textContent = item.name || item.id;
  document.getElementById('desc').textContent = item.effect || item.path || kind;
  document.getElementById('uuid').textContent = item.id || item.grudgeUuid || '—';
  const details = document.getElementById('details');
  details.innerHTML = Object.entries({
    kind, weapon: item.weapon, slot: item.slot, path: item.path, era: item.era,
    clip: item.prefab?.animationClip, model: item.prefab?.modelRef,
  }).filter(([, v]) => v).map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join('');
  document.getElementById('snippet').textContent =
    `// skill API\ncast(${JSON.stringify(item.id || item.path)})`;
  const empty = document.getElementById('emptyHint');
  if (empty) empty.style.display = 'none';
  burstSparks(new THREE.Vector3(0, 1.2, 1.4), 64);
  const hit = rapierRay(new THREE.Vector3(0, 8, 0), new THREE.Vector3(0, -1, 0));
  if (hit) setHud(`Rapier ray ground y=${hit.y.toFixed(3)} · ${item.name}`);
  else setHud(item.name);
  const path = item.path || item.prefab?.modelRef;
  if (path && /\.glb/i.test(path)) await loadGlb(path.startsWith('http') ? path : `${CDN}/${path.replace(/^\/+/, '')}`);
}

async function loadGlb(url) {
  if (currentRoot) {
    scene.remove(currentRoot);
    currentRoot = null;
  }
  try {
    const gltf = await loader.loadAsync(url);
    currentRoot = gltf.scene;
    currentRoot.position.set(0, 0.2, 1.6);
    scene.add(currentRoot);
    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(currentRoot);
      mixer.clipAction(gltf.animations[0]).play();
    }
    const cdn = document.getElementById('cdnUrl');
    if (cdn) cdn.textContent = url;
    document.getElementById('cdnBlock').hidden = false;
  } catch (e) {
    setHud('GLB fail ' + (e.message || e));
  }
}

async function boot() {
  const empty = document.getElementById('emptyHint');
  try {
    const [skillsJ, glbJ, d1] = await Promise.all([
      fetch(`${INFO}/master-weaponSkills.json`).then((r) => r.json()),
      fetch(`${INFO}/vfx-production-glb.json`).then((r) => r.json()).catch(() => ({ meshes: [] })),
      fetch('https://objectstore.grudge-studio.com/v1/assets?q=vfx&limit=80').then((r) => r.json()).catch(() => ({ items: [] })),
    ]);
    DB.skills = flattenSkills(skillsJ);
    DB.glb = glbJ.meshes || [];
    DB.d1fx = (d1.items || []).filter((it) => /\.glb$/i.test(it.key || '')).map((it) => ({
      id: it.id, name: it.filename, path: it.key, kind: 'd1-vfx', era: 'shared',
    }));
    document.getElementById('countBadge').textContent =
      `${DB.skills.length} skills · ${DB.glb.length} GLB · r185+Rapier`;
    renderList(elist('listSkills'), DB.skills.slice(0, 80), 'skill');
    renderList(elist('listLib'), DB.glb, 'glb');
    renderList(elist('listGlb'), DB.glb.concat(DB.d1fx), 'glb');
    renderList(elist('listAdv'), DB.skills.filter((s) => /ultimate|special/i.test(s.slot || '')).slice(0, 40), 'skill');
    renderList(elist('listReg'), DB.d1fx, 'glb');
    empty.textContent = 'Pick a skill (ObjectStore skill API) · Rapier ray on terrain';
    await bootRapier();
    if (DB.skills[0]) select('skill', DB.skills[0]);
  } catch (e) {
    empty.textContent = 'Boot failed: ' + (e.message || e);
  }
}

document.querySelectorAll('.tab').forEach((t) => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
    document.querySelectorAll('.pane').forEach((p) => p.classList.toggle('active', p.id === 'pane-' + t.dataset.tab));
  };
});
document.getElementById('qSkills')?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderList(elist('listSkills'), DB.skills.filter((s) => (s.name + s.weapon).toLowerCase().includes(q)).slice(0, 80), 'skill');
});
document.getElementById('btnReplay')?.addEventListener('click', () => burstSparks(new THREE.Vector3(0, 1.2, 1.4), 80));
document.getElementById('btnGrid')?.addEventListener('click', () => {
  scene.traverse((o) => { if (o.isMesh && o.geometry?.type === 'PlaneGeometry') o.material.wireframe = !o.material.wireframe; });
});
document.getElementById('btnResetCam')?.addEventListener('click', () => { camera.position.set(6, 3.2, 8); controls.target.set(0, 1, 0); });

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  controls.update();
  mixer?.update(dt);
  if (world) world.step();
  renderer.render(scene, camera);
}
tick();
boot();
