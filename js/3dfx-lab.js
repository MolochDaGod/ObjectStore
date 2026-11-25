/**
 * 3DFX stage — one list, one effect on the stage, shareable with ?effect=
 * Renders ObjectStore api/v1/3dfx-registry.json (+ vfx-spells, fleet effect ids).
 * Shaders: /3dfx/shaders. Not a second VFX product.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const SHADER_FILES = {
  fire: ['fire.vert.glsl', 'fire.frag.glsl'],
  lightning: ['lightning.vert.glsl', 'lightning.frag.glsl'],
  shockwave: ['shockwave.vert.glsl', 'shockwave.frag.glsl'],
  magic: ['magic.vert.glsl', 'magic.frag.glsl'],
  fireball: ['fireball.vert.glsl', 'fireball.frag.glsl'],
  fire_slash: ['fire_slash.vert.glsl', 'fire_slash.frag.glsl'],
  ice_crystal: ['ice_crystal.vert.glsl', 'ice_crystal.frag.glsl'],
  earth: ['earth.vert.glsl', 'earth.frag.glsl'],
};

const NEED = {
  fire: ['uTime', 'uColor1', 'uColor2', 'uIntensity'],
  lightning: ['uTime', 'uColor1', 'uColor2'],
  shockwave: ['uProgress', 'uColor1'],
  magic: ['uTime', 'uColor1', 'uColor2'],
  fireball: ['uTime', 'uColor1', 'uColor2', 'uIntensity'],
  fire_slash: ['uTime', 'uColor1', 'uColor2', 'uIntensity', 'uArcAngle'],
  ice_crystal: ['uTime', 'uColor1', 'uColor2', 'uIntensity', 'uGrowth'],
  earth: ['uTime', 'uColor1', 'uColor2', 'uIntensity', 'uGrowth'],
};

const FALLBACK_COLOR = {
  fire: '#ff4400', ice: '#44ddff', lightning: '#ffe14a', magic: '#c084fc', arcane: '#c084fc',
  impact: '#ff7744', aura: '#ffd56a', portal: '#6aa7ff', combat: '#ff5a6a', annihilator: '#ff2d55',
  environment: '#7dcea0', earth: '#c4a46a', nature: '#5dca7a', holy: '#ffe9a0', poison: '#7dff9a', wind: '#b9e7ff',
};

const shaders = new Map();
const state = {
  items: [],
  alias: new Map(),
  id: '',
  fx: null,
  root: null,
  carrier: null,
  systems: [],
  projectile: false,
  age: 0,
  t: 0,
  dur: 1.5,
  speed: 1,
  loop: true,
  p: 0,
  light: null,
  lightDef: null,
  shake: null,
  shakeT: 0,
};

let cat = 'all';
let query = '';
let paused = false;

function makeSparkTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.28, 'rgba(255,255,255,0.75)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const sparkTex = makeSparkTexture();
const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x070b12, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b12);

const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 80);
camera.position.set(4.4, 2.35, 6.4);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 1.05, 0);
controls.minDistance = 2.2;
controls.maxDistance = 16;

scene.add(new THREE.HemisphereLight(0xc5d4ea, 0x1a120c, 0.55));
const sun = new THREE.DirectionalLight(0xfff0d2, 0.85);
sun.position.set(5, 9, 3);
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(9, 56),
  new THREE.MeshStandardMaterial({ color: 0x10161f, roughness: 1, metalness: 0 }),
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const grid = new THREE.GridHelper(12, 12, 0x3a4b64, 0x1b2533);
grid.position.y = 0.004;
scene.add(grid);

function resize() {
  const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 800;
  const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 500;
  if (w < 2 || h < 2) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function colorOf(hex, fallback = '#ffffff') {
  try { return new THREE.Color(hex || fallback); } catch { return new THREE.Color(fallback); }
}

function band(v, a, b) {
  if (Array.isArray(v) && v.length >= 2) return v[0] + Math.random() * (v[1] - v[0]);
  return a + Math.random() * (b - a);
}

function setHud(text) {
  const el = document.getElementById('hudLeft');
  if (el) el.textContent = text;
}

function shareUrl(id) {
  const u = new URL(location.href);
  u.searchParams.set('effect', id);
  u.hash = '';
  return u.toString();
}

function pickShader(fx, role) {
  const hint = fx.shader;
  if (role === 'slash') return 'fire_slash';
  if (role === 'orb') {
    if (hint === 'ice_crystal' || fx.category === 'ice') return 'ice_crystal';
    if (fx.category === 'fire' || hint === 'fire' || hint === 'fire_slash' || hint === 'fireball') return 'fireball';
    if (hint === 'lightning' || fx.category === 'lightning') return 'lightning';
    return 'magic';
  }
  if (role === 'spike') return (fx.category === 'ice' || hint === 'ice_crystal') ? 'ice_crystal' : 'earth';
  if (role === 'ring') return 'shockwave';
  if (role === 'beam') return (hint === 'fire' || fx.category === 'fire') ? 'fire' : 'lightning';
  if (role === 'flame') return 'fire';
  if (NEED[hint]) return hint;
  return 'magic';
}

function makeMat(key, fx) {
  const src = shaders.get(key);
  const c1 = colorOf(fx.colors?.primary, FALLBACK_COLOR[fx.category] || '#ffffff');
  const c2 = colorOf(fx.colors?.secondary, '#ffe0b0');
  const intensity = fx.uniforms?.uIntensity?.value ?? 1.55;
  if (!src) {
    return new THREE.MeshBasicMaterial({
      color: c1, transparent: true, opacity: 0.9, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    });
  }
  const all = {
    uTime: { value: 0 },
    uColor1: { value: c1 },
    uColor2: { value: c2 },
    uIntensity: { value: intensity },
    uProgress: { value: 0 },
    uGrowth: { value: 1 },
    uArcAngle: { value: 1 },
  };
  const uniforms = {};
  for (const k of NEED[key]) uniforms[k] = all[k];
  let frag = src.frag;
  if (key === 'fire') {
    frag = frag.replace(
      'float alpha = flame * uIntensity * 2.0;',
      'float alpha = clamp(flame * min(uIntensity, 1.25), 0.0, 0.9);',
    );
  } else if (key === 'lightning') {
    frag = frag.replace(
      'float alpha = glow * 1.5;',
      'float alpha = clamp(glow, 0.0, 0.95) * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);',
    );
  } else if (key === 'magic') {
    frag = frag.replace('float alpha = glow * 1.5;', 'float alpha = clamp(glow, 0.0, 0.95);');
  }
  const additive = key !== 'earth' && key !== 'ice_crystal';
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: src.vert,
    fragmentShader: frag,
    transparent: key !== 'earth',
    depthWrite: key === 'earth',
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function tag(mesh, kind, extra) {
  mesh.userData.anim = { kind, ...(extra || {}) };
  mesh.frustumCulled = false;
}

function arcGeometry(radius, arcAngle, width, segments, flat) {
  const geo = new THREE.PlaneGeometry(arcAngle, width, Math.max(8, segments | 0), 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const ang = pos.getX(i);
    const y = pos.getY(i);
    if (flat) {
      pos.setXYZ(i, Math.sin(ang) * (radius + y), 0, Math.cos(ang) * (radius + y));
    } else {
      const ny = -Math.sin(ang);
      pos.setXYZ(i, Math.sin(ang) * radius, ny * y + Math.cos(ang) * 0.28, Math.cos(ang) * radius * 0.42);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

function addPlanes(spec, fx, parent) {
  const mat = makeMat(pickShader(fx, spec.branches ? 'beam' : 'flame'), fx);
  const w = spec.width || 1.5;
  const h = spec.height || 2.6;
  const seg = spec.segments || [12, 20];
  const geo = new THREE.PlaneGeometry(w, h, Array.isArray(seg) ? seg[0] : 12, Array.isArray(seg) ? seg[1] : 20);
  const n = spec.instances || spec.branches || 1;
  const r = spec.layoutRadius || 0.55;
  const ring = spec.layout === 'circular' || (spec.instances > 1 && !spec.branches);
  for (let i = 0; i < n; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    if (spec.branches && !ring) {
      mesh.position.set((i - (n - 1) / 2) * 0.18, h * 0.5, 0);
      mesh.rotation.y = (i - (n - 1) / 2) * 0.28;
    } else if (n > 1) {
      const ang = (i / n) * Math.PI;
      mesh.position.set(Math.sin(ang) * r * 0.35, h * 0.5, Math.cos(ang) * r * 0.35);
      mesh.rotation.y = ang;
    } else {
      mesh.position.y = h * 0.5;
    }
    tag(mesh, 'flame');
    parent.add(mesh);
  }
}

function addRing(spec, fx, parent, delay = 0) {
  const inner = spec.innerRadius ?? 0.35;
  const outer = spec.outerRadius ?? Math.max(inner + 0.3, spec.radius || 2.2);
  const geo = new THREE.CircleGeometry(Math.max(outer, inner + 0.35), 72);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, makeMat('shockwave', fx));
  mesh.position.y = 0.045;
  tag(mesh, 'ring', { delay });
  parent.add(mesh);
  if (spec.crystals) addSpikes(fx, parent, { spikeCount: spec.crystals.count || 10, spikeRadius: spec.crystals.radius?.[1] || outer }, true);
}

function addOrb(spec, fx, parent, delay = 0) {
  const radius = spec.radius || 0.4;
  let geo;
  if (spec.type === 'icosahedron') geo = new THREE.IcosahedronGeometry(radius, spec.detail || 1);
  else if (spec.type === 'octahedron') geo = new THREE.OctahedronGeometry(radius, spec.detail || 0);
  else geo = new THREE.SphereGeometry(radius, spec.segments || 24, Math.max(12, (spec.segments || 18) - 4));
  const mesh = new THREE.Mesh(geo, makeMat(pickShader(fx, 'orb'), fx));
  mesh.position.y = 1.15;
  const extra = { delay };
  if (spec.pulse) {
    extra.pulse = true;
    extra.pulseSpeed = spec.pulseSpeed || 2.2;
    extra.pulseAmount = spec.pulseAmount || 0.08;
  }
  tag(mesh, 'orb', extra);
  parent.add(mesh);
}

function addPortal(spec, fx, parent) {
  const seg = spec.segments || [32, 14];
  const radius = spec.radius || 1;
  const geo = new THREE.TorusGeometry(radius, spec.tube || 0.13, Array.isArray(seg) ? seg[1] : 14, Array.isArray(seg) ? seg[0] : 32);
  const rim = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    color: colorOf(fx.colors?.primary, '#4488ff'),
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  }));
  rim.position.y = 1.25;
  tag(rim, 'portal', { spinZ: 0.55 });
  parent.add(rim);
  if (spec.innerDisc !== false) {
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.92, 48),
      makeMat('magic', fx),
    );
    disc.position.set(0, 1.25, -0.02);
    tag(disc, 'portal');
    parent.add(disc);
  }
}

function addBeam(spec, fx, parent) {
  const len = Math.min(spec.height || spec.beamLength || 7, 8);
  const thick = Math.min(spec.radiusBottom || spec.width || 0.34, 0.62);
  const mat = makeMat(pickShader(fx, 'beam'), fx);
  for (let i = 0; i < 2; i++) {
    const geo = new THREE.PlaneGeometry(thick * 2.4, len, 1, 28);
    geo.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = i * Math.PI / 2;
    mesh.position.set(0, 1.2, len * 0.28);
    tag(mesh, 'beam', { pulse: !!spec.pulse, pulseSpeed: spec.pulseSpeed || 3, pulseAmount: 0.05 });
    parent.add(mesh);
  }
}

function addSlash(spec, fx, parent, delay = 0) {
  const arc = spec.arc || {};
  const radius = spec.radius || arc.radius || 1.7;
  const arcAngle = spec.arcAngle || Math.abs((arc.endAngle ?? 1.15) - (arc.startAngle ?? -1.15)) || 2.2;
  const width = Math.max(spec.width || arc.width || spec.trail?.width || 0.28, 0.46);
  const flat = arcAngle > 5.2;
  const geo = arcGeometry(radius, arcAngle, width, spec.segments || 40, flat);
  const mesh = new THREE.Mesh(geo, makeMat('fire_slash', fx));
  const group = new THREE.Group();
  group.position.set(0, flat ? 0.9 : 1.15, 0.35);
  group.scale.setScalar(1.45);
  if (Array.isArray(spec.rotation)) group.rotation.set(spec.rotation[0] || 0, spec.rotation[1] || 0, spec.rotation[2] || 0);
  group.add(mesh);
  tag(mesh, 'slash', { delay, intensity: fx.uniforms?.uIntensity?.value || 1.7 });
  if (spec.spin) tag(group, 'spin', { spinY: spec.spinSpeed || 8 });
  if (spec.descend) tag(group, 'drop', { delay, fromY: 2.6 });
  parent.add(group);
}

function addSpikes(fx, parent, g, icy) {
  const n = g.spikeCount || g.crystals?.count || 8;
  const rad = g.spikeRadius || 1.6;
  const key = icy ? 'ice_crystal' : pickShader(fx, 'spike');
  for (let i = 0; i < n; i++) {
    const h = icy ? band(g.crystals?.height, 0.45, 1.5) : band(null, 0.9, 1.7);
    const geo = new THREE.ConeGeometry(icy ? 0.07 : 0.16, h, 5);
    geo.translate(0, h * 0.5, 0);
    const mesh = new THREE.Mesh(geo, makeMat(key, fx));
    const ang = (i / n) * Math.PI * 2;
    const rr = icy ? (Array.isArray(g.crystals?.radius) ? band(g.crystals.radius, rad * 0.5, rad) : rad * (0.45 + Math.random() * 0.55)) : rad;
    mesh.position.set(Math.cos(ang) * rr, 0, Math.sin(ang) * rr);
    tag(mesh, 'spike', { grow: true, delay: (i / n) * 0.18 });
    parent.add(mesh);
  }
}

function addCracks(fx, parent, g) {
  const span = Math.max(1.2, g?.spikeRadius || 2);
  const mat = new THREE.MeshBasicMaterial({
    color: colorOf(fx.colors?.secondary, '#ffcc88'),
    transparent: true, opacity: 0.75, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  });
  for (let i = 0; i < 5; i++) {
    const len = span * (0.45 + Math.random() * 0.7);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, 0.025, 0.045), mat);
    mesh.rotation.y = (i / 5) * Math.PI;
    mesh.position.y = 0.03;
    parent.add(mesh);
  }
}

function addCrater(fx, parent) {
  const geo = new THREE.RingGeometry(0.7, 1.55, 40);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    color: colorOf(fx.colors?.secondary, '#553322'),
    transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide,
  }));
  mesh.position.y = 0.02;
  parent.add(mesh);
}

function addWall(spec, fx, parent) {
  const sp = spec.spires || { count: 7, spacing: 0.85, height: [1.6, 3.1], radius: [0.12, 0.28] };
  const n = sp.count || 7;
  const key = pickShader(fx, 'spike');
  for (let i = 0; i < n; i++) {
    const h = band(sp.height, 1.6, 3);
    const r = band(sp.radius, 0.12, 0.26);
    const geo = new THREE.ConeGeometry(r, h, 5);
    geo.translate(0, h * 0.5, 0);
    const mesh = new THREE.Mesh(geo, makeMat(key, fx));
    mesh.position.x = (i - (n - 1) / 2) * (sp.spacing || 0.85);
    tag(mesh, 'spike', { grow: true, delay: i * 0.045 });
    parent.add(mesh);
  }
  addCracks(fx, parent, { spikeRadius: (sp.spacing || 0.85) * n * 0.45 });
}

function addProjectileBody(spec, fx, parent) {
  const core = spec.core || { type: 'sphere', radius: 0.34 };
  addOrb({ ...core, pulse: true, pulseSpeed: 3, pulseAmount: 0.06 }, fx, parent, 0);
  if (spec.shell?.radius) {
    addOrb({ type: 'sphere', radius: spec.shell.radius, segments: spec.shell.segments || 18 }, { ...fx, shader: 'magic' }, parent, 0);
  }
  if (spec.shards) addSpikes(fx, parent, { spikeCount: Math.min(spec.shards.count || 8, 12), spikeRadius: spec.shards.spread || 0.55, crystals: spec.shards }, true);
  if (spec.impact) addRing({ innerRadius: 0.2, outerRadius: Math.min(spec.impact.radius || 2.2, 3.2), segments: 48 }, fx, parent, 0.45);
}

function addNamed(name, fx, parent, g) {
  if (name === 'fire_planes') addPlanes({ width: 1.4, height: g.jets?.height || 2.8, instances: g.jets?.count || 6, layout: 'circular', layoutRadius: 0.7, segments: [10, 18] }, fx, parent);
  else if (name === 'shockwave_ring' || name === 'blizzard_ring') addRing({ innerRadius: g.ring?.innerRadius || 0.3, outerRadius: g.ring?.outerRadius || 2.5, segments: g.ring?.segments || 64 }, fx, parent, 0);
  else if (name === 'crater_ring') addCrater(fx, parent);
  else if (name === 'outer_sphere') addOrb({ type: 'sphere', radius: 1.05, pulse: true }, fx, parent, 0);
  else if (name === 'inner_sphere') addOrb({ type: 'sphere', radius: 0.38, pulse: true, pulseSpeed: 3 }, fx, parent, 0);
  else if (name === 'energy_sphere') addOrb({ type: 'sphere', radius: 0.7, pulse: true }, fx, parent, 0);
  else if (name === 'rings') {
    addRing({ innerRadius: 0.85, outerRadius: 1.0, segments: 48 }, fx, parent, 0);
    addRing({ innerRadius: 1.25, outerRadius: 1.4, segments: 48 }, fx, parent, 0.12);
  }
  else if (name === 'spike_cones') addSpikes(fx, parent, g, false);
  else if (name === 'ice_shards') addSpikes(fx, parent, g, true);
  else if (name === 'ground_crack') addCracks(fx, parent, g);
}

function addTyped(spec, fx, parent, delay = 0) {
  const type = spec.type;
  if (type === 'plane') addPlanes(spec, fx, parent);
  else if (type === 'ring') addRing(spec, fx, parent, delay);
  else if (type === 'sphere' || type === 'icosahedron' || type === 'octahedron') addOrb(spec, fx, parent, delay);
  else if (type === 'torus') addPortal(spec, fx, parent);
  else if (type === 'arc' || type === 'spline_trail') addSlash(spec, fx, parent, delay || spec.delay || 0);
  else if (type === 'cylinder' || type === 'ray') addBeam(spec, fx, parent);
  else if (type === 'cone') {
    const h = spec.height || 0.45;
    const geo = new THREE.ConeGeometry(spec.radius || 0.08, h, spec.segments || 6);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, h * 0.5);
    const mesh = new THREE.Mesh(geo, makeMat(pickShader(fx, 'orb'), fx));
    mesh.position.y = 1.15;
    tag(mesh, 'orb');
    parent.add(mesh);
  } else if (type === 'projectile') addProjectileBody(spec, fx, parent);
  else if (type === 'wall') addWall(spec, fx, parent);
  else if (type === 'compound') buildGeometry({ ...fx, geometry: spec }, parent);
}

function buildGeometry(fx, parent) {
  const g = fx.geometry;
  if (!g || !g.type) return;
  if (g.type === 'compound') {
    for (const el of g.elements || []) {
      if (typeof el === 'string') addNamed(el, fx, parent, g);
      else if (el?.type) addTyped(el, fx, parent, el.delay || 0);
    }
    if (g.spikeCount && !(g.elements || []).includes('spike_cones')) addSpikes(fx, parent, g, fx.category === 'ice');
    return;
  }
  addTyped(g, fx, parent, 0);
}

function isProjectile(fx) {
  const g = fx.geometry?.type;
  const tags = (fx.tags || []).join(' ');
  if (g === 'projectile' || g === 'cone') return true;
  if (fx.particles?.trail) return true;
  if (/projectile/.test(tags) && (g === 'sphere' || g === 'icosahedron' || g === 'octahedron')) return true;
  return false;
}

function makeParticles(spec, c1, c2, loop) {
  const n = Math.max(12, Math.min(spec.count || 80, 800));
  const dist = spec.distribution || 'sphere';
  const positions = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const parts = [];

  function birth(q) {
    const R = spec.radius || spec.beamLength || 1.4;
    q.life = band(spec.lifespan, 0.55, 1.35);
    q.age = Math.random() * q.life * 0.85;
    q.vx = 0; q.vy = 0; q.vz = 0;
    q.ang = Math.random() * Math.PI * 2;
    q.rad = R * (0.35 + Math.random() * 0.65);
    q.spin = band(null, 0.7, 2.1) * (Math.random() < 0.5 ? -1 : 1);
    q.x = 0; q.y = 0.2; q.z = 0;
    if (dist === 'explosion') {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const sp = typeof spec.velocityOutward === 'number'
        ? band([spec.velocityOutward * 0.35, spec.velocityOutward], 1, 3)
        : band(null, 1.4, 4.2);
      q.vx = Math.sin(ph) * Math.cos(th) * sp;
      q.vy = Math.abs(Math.cos(ph)) * sp * 0.8 + Math.max(0, band(spec.velocityY, 0.2, 1.5));
      q.vz = Math.sin(ph) * Math.sin(th) * sp;
      q.y = 0.2;
      q.age = Math.random() * 0.05;
    } else if (dist === 'cone') {
      q.x = (Math.random() - 0.5) * (spec.radius || 0.4);
      q.z = (Math.random() - 0.5) * (spec.radius || 0.4);
      q.y = Math.random() * 0.25;
      q.vy = band(spec.velocityY, 1.2, 3);
    } else if (dist === 'volume' || dist === 'plane') {
      const w = spec.width || R * 2;
      const h = spec.height || (dist === 'plane' ? 0.45 : R);
      q.x = (Math.random() - 0.5) * w;
      q.z = (Math.random() - 0.5) * w;
      q.y = Math.random() * h;
      q.vy = band(spec.velocityY, dist === 'plane' ? -0.15 : -1.6, dist === 'plane' ? 0.15 : -0.3);
      q.vx = band(spec.velocityX, -0.25, 0.4);
    } else if (dist === 'cylinder') {
      q.y = Math.random() * (spec.height || 2);
      q.vy = band(spec.velocityY, 0.25, 0.9);
    } else if (dist === 'beam') {
      q.z = Math.random() * (spec.beamLength || 7);
      q.x = (Math.random() - 0.5) * (spec.beamWidth || 0.35);
      q.y = 1.1 + (Math.random() - 0.5) * (spec.beamWidth || 0.4);
      q.vz = band(null, 2.5, 6);
    } else if (dist === 'line') {
      q.x = (Math.random() - 0.5) * (spec.radius || 3);
      q.y = 0.05;
      q.vy = band(spec.velocityY, 2, 5);
    } else if (dist === 'sphere') {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const rr = (spec.radius || 1.4) * (0.25 + Math.random() * 0.75);
      q.x = Math.sin(ph) * Math.cos(th) * rr;
      q.y = Math.abs(Math.cos(ph)) * rr * 0.75 + 0.2;
      q.z = Math.sin(ph) * Math.sin(th) * rr;
      q.vy = band(spec.velocityY, -1.4, -0.25);
    } else if (dist === 'points') {
      q.x = (Math.random() - 0.5) * 1.6;
      q.z = (Math.random() - 0.5) * 1.6;
      q.y = 2.2 + Math.random();
      q.vy = band(spec.velocityY, -4.5, -2.2);
    } else if (dist === 'spiral-inward') {
      q.rad = (spec.radius || 3.2) * (0.25 + Math.random() * 0.75);
      q.y = 0.4 + Math.random() * 1.1;
    } else if (dist === 'trail') {
      q.z = -Math.random() * (spec.trailLength || 1.6);
      q.x = (Math.random() - 0.5) * 0.18;
      q.y = 1.15 + (Math.random() - 0.5) * 0.16;
    } else if (dist === 'ring') {
      q.y = 1.05 + Math.random() * 0.35;
      q.vy = (Math.random() - 0.5) * 0.2;
    } else if (dist === 'circular') {
      q.y = 0.08 + Math.random() * 0.3;
      q.vy = band(spec.velocityY, 0.6, 2.2);
    }
  }

  for (let i = 0; i < n; i++) {
    const q = {};
    birth(q);
    parts.push(q);
    const col = Math.random() > 0.42 ? c1 : c2;
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: THREE.MathUtils.clamp((spec.size || 0.08) * 2.1, 0.045, 0.5),
    map: sparkTex,
    vertexColors: true,
    transparent: true,
    opacity: spec.opacity ?? 0.85,
    depthWrite: false,
    blending: spec.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  const gravity = spec.gravity || 0;

  function write() {
    for (let i = 0; i < n; i++) {
      positions[i * 3] = parts[i].x;
      positions[i * 3 + 1] = parts[i].y;
      positions[i * 3 + 2] = parts[i].z;
    }
    geo.attributes.position.needsUpdate = true;
  }
  write();

  return {
    points,
    reset() { for (const q of parts) birth(q); write(); },
    update(t, p, dt) {
      const boxH = spec.height || spec.radius || 3;
      for (const q of parts) {
        q.age += dt;
        if (q.age > q.life) {
          if (!loop && dist === 'explosion') { q.y = -40; continue; }
          birth(q);
        }
        if (dist === 'explosion' || dist === 'line') {
          q.vy += gravity * dt;
          q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
        } else if (dist === 'cone') {
          q.y += q.vy * dt;
          q.x += Math.sin(t * 4 + q.ang) * dt * 0.12;
          if (q.y > 2.8) birth(q);
        } else if (dist === 'ring' || dist === 'circular') {
          q.ang += dt * q.spin;
          q.x = Math.cos(q.ang) * q.rad;
          q.z = Math.sin(q.ang) * q.rad;
          if (dist === 'ring') q.y = 1.2 + Math.sin(t * 2.2 + q.ang) * 0.1;
          else {
            q.y += q.vy * dt;
            if (q.y > 2.8) q.y = 0.05;
          }
        } else if (dist === 'volume' || dist === 'plane') {
          q.x += q.vx * dt;
          q.y += q.vy * dt;
          q.z += Math.sin(t + q.ang) * dt * 0.25;
          if (q.y < 0) q.y = boxH;
          if (q.y > boxH + 0.5) q.y = 0;
        } else if (dist === 'cylinder') {
          q.y += q.vy * dt;
          q.ang += dt * 0.8;
          q.x = Math.cos(q.ang) * q.rad;
          q.z = Math.sin(q.ang) * q.rad;
          if (q.y > (spec.height || 2.2)) q.y = 0;
        } else if (dist === 'beam') {
          q.z += q.vz * dt;
          if (q.z > (spec.beamLength || 7)) q.z = 0;
        } else if (dist === 'arc' || dist === 'spline' || dist === 'dual-arc' || dist === 'multi-arc') {
          const ang = (p * 2 - 1) * 1.15;
          q.x = Math.sin(ang + q.ang * 0.08) * 1.5;
          q.y = 1.15 + Math.cos(ang) * 0.18;
          q.z = Math.cos(ang) * 0.15;
        } else if (dist === 'spiral-inward') {
          q.ang += dt * (spec.spiralSpeed || 2.5);
          q.rad = Math.max(0.06, q.rad - dt * (spec.collapseRate || 0.65));
          if (q.rad <= 0.08) q.rad = spec.radius || 3.4;
          q.x = Math.cos(q.ang) * q.rad;
          q.z = Math.sin(q.ang) * q.rad;
          q.y = 0.55 + Math.sin(q.ang * 2) * 0.25;
        } else if (dist === 'trail') {
          q.z -= dt * 2.4;
          if (q.z < -(spec.trailLength || 1.8)) q.z = 0.1;
        } else if (dist === 'sphere') {
          q.y += q.vy * dt;
          q.x += Math.sin(t + q.ang) * dt * 0.15;
          if (q.y < 0.04) birth(q);
        } else if (dist === 'points') {
          q.y += q.vy * dt;
          if (q.y < 0.02) q.y = 3;
        } else {
          q.ang += dt * q.spin;
          q.x = Math.cos(q.ang) * q.rad;
          q.z = Math.sin(q.ang) * q.rad;
          q.y = 1.05 + Math.sin(t * 2 + q.ang) * 0.1 + Math.sin(q.ang) * q.rad * 0.2;
        }
      }
      write();
    },
  };
}

function disposeRoot(root) {
  const geos = new Set();
  const mats = new Set();
  root.traverse((o) => {
    if (o.geometry && !geos.has(o.geometry)) { geos.add(o.geometry); o.geometry.dispose(); }
    const list = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
    for (const m of list) if (m && !mats.has(m)) { mats.add(m); m.dispose(); }
  });
  scene.remove(root);
}

function tickAnims(root, t, p) {
  root.traverse((o) => {
    const a = o.userData?.anim;
    if (!a) return;
    const delay = a.delay || 0;
    const lp = delay > 0 ? Math.min(1, Math.max(0, (p - delay) / Math.max(0.08, 1 - delay))) : p;
    if (delay > 0 && p < delay) { o.visible = false; return; }
    o.visible = a.kind === 'slash' ? (lp > 0.03 && lp < 0.97) : true;
    const u = o.material?.uniforms;
    if (u) {
      if (u.uTime) u.uTime.value = t;
      if (u.uProgress) u.uProgress.value = lp;
      if (u.uGrowth) u.uGrowth.value = a.grow ? Math.max(0.06, lp) : 1;
      if (a.kind === 'slash' && u.uIntensity) u.uIntensity.value = (a.intensity || 1.6) * Math.sin(Math.min(1, lp) * Math.PI);
    }
    if (a.spinY) o.rotation.y = t * a.spinY;
    if (a.spinZ) o.rotation.z = t * a.spinZ;
    if (a.kind === 'ring') {
      const s = 0.22 + lp * 0.78;
      o.scale.set(s, 1, s);
    }
    if (a.pulse) {
      const s = 1 + Math.sin(t * (a.pulseSpeed || 2.4)) * (a.pulseAmount || 0.08);
      o.scale.setScalar(s);
    }
    if (a.kind === 'drop') o.position.y = (a.fromY ?? 2.4) * (1 - lp) + 1.05 * lp;
  });
}

function applyBloom() {
  // Additive shaders on the dark stage. A bloom composer whited out the canvas on three r185.
}

function mount(fx) {
  if (state.root) disposeRoot(state.root);
  const root = new THREE.Group();
  const carrier = new THREE.Group();
  root.add(carrier);
  scene.add(root);

  const c1 = colorOf(fx.colors?.primary, FALLBACK_COLOR[fx.category] || '#ff8844');
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(2.15, 36),
    new THREE.MeshBasicMaterial({
      color: c1, transparent: true, opacity: 0.14, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.015;
  carrier.add(glow);

  buildGeometry(fx, carrier);
  const systems = [];
  if (fx.particles) {
    const sys = makeParticles(fx.particles, c1, colorOf(fx.colors?.secondary, '#ffffff'), fx.timing?.loop !== false);
    carrier.add(sys.points);
    systems.push(sys);
  }

  const lightDef = fx.light || fx.lights || null;
  let light = null;
  if (lightDef) {
    light = new THREE.PointLight(
      colorOf(lightDef.color || fx.colors?.primary, '#ffffff'),
      lightDef.intensity || 2,
      lightDef.distance || 8,
    );
    light.position.set(0, 1.25, 0.4);
    carrier.add(light);
  }

  state.root = root;
  state.carrier = carrier;
  state.systems = systems;
  state.projectile = isProjectile(fx);
  state.age = 0;
  state.t = 0;
  state.p = 0;
  state.dur = Math.max(0.28, fx.timing?.duration || 1.6);
  state.speed = fx.timing?.speed || 1;
  state.loop = fx.timing?.loop !== false;
  state.light = light;
  state.lightDef = lightDef;
  state.shake = fx.screenShake || null;
  state.shakeT = 0;
  state.fx = fx;
  applyBloom(fx.bloom);
  const empty = document.getElementById('emptyHint');
  if (empty) empty.style.display = 'none';
}

function shaderLabel(fx) {
  const hint = fx.shader;
  if (NEED[hint]) return hint;
  const g = fx.geometry?.type;
  if (g === 'arc' || g === 'spline_trail') return 'fire_slash';
  if (g === 'ring') return 'shockwave';
  if (g === 'torus') return 'magic';
  if (g === 'plane') return 'fire';
  if (g === 'cylinder' || g === 'ray') return 'lightning';
  if (fx.category === 'ice') return 'ice_crystal';
  if (fx.category === 'fire') return 'fireball';
  return hint || '';
}

function paintInspector(fx) {
  document.getElementById('title').textContent = fx.name || fx.id;
  document.getElementById('desc').textContent = fx.description || (fx.tags || []).join(' · ') || fx.category;
  document.getElementById('uuid').textContent = fx.id;
  const share = document.getElementById('shareLink');
  const url = shareUrl(fx.id);
  if (share) share.textContent = url;
  const rows = [
    ['category', fx.category],
    ['source', fx.source],
    ['duration', fx.timing?.duration ? `${fx.timing.duration}s` : ''],
    ['play', fx.timing?.loop === false ? 'one-shot' : 'loop'],
    ['geometry', fx.geometry?.type || (fx.particles ? 'particles' : '')],
    ['particles', fx.particles?.count ? String(fx.particles.count) : ''],
  ].filter(([, v]) => v);
  document.getElementById('details').innerHTML = rows.map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join('');
  const tags = document.getElementById('tags');
  tags.innerHTML = (fx.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('') || '<span class="note">—</span>';
  const key = shaderLabel(fx);
  const block = document.getElementById('cdnBlock');
  if (key && SHADER_FILES[key]) {
    const path = `./3dfx/shaders/${SHADER_FILES[key][1]}`;
    document.getElementById('cdnUrl').textContent = path;
    document.getElementById('btnOpenCdn').href = path;
    block.hidden = false;
  } else block.hidden = true;
  document.getElementById('snippet').textContent = `effectId: ${fx.id}\n${url}`;
  const next = new URL(location.href);
  next.searchParams.set('effect', fx.id);
  history.replaceState(null, '', `${next.pathname}?${next.searchParams.toString()}`);
  setHud(`${fx.name} · ${fx.category}`);
}

function visibleItems() {
  const q = query.trim().toLowerCase();
  return state.items.filter((it) => {
    if (cat !== 'all' && it.category !== cat) return false;
    if (!q) return true;
    return `${it.name} ${it.id} ${it.category} ${(it.tags || []).join(' ')}`.toLowerCase().includes(q);
  });
}

function renderChips() {
  const counts = new Map();
  for (const it of state.items) counts.set(it.category || 'other', (counts.get(it.category || 'other') || 0) + 1);
  const cats = [...counts.keys()].sort();
  const host = document.getElementById('catsFx');
  const chips = [{ id: 'all', label: `All ${state.items.length}` }, ...cats.map((id) => ({ id, label: `${id} ${counts.get(id)}` }))];
  host.innerHTML = chips.map((c) => `<button class="chip ${c.id === cat ? 'active' : ''}" type="button" data-cat="${esc(c.id)}">${esc(c.label)}</button>`).join('');
  host.querySelectorAll('.chip').forEach((b) => {
    b.onclick = () => { cat = b.dataset.cat; renderChips(); renderList(); };
  });
}

function renderList() {
  const node = document.getElementById('listFx');
  const items = visibleItems();
  if (!items.length) {
    node.innerHTML = '<div class="note" style="padding:10px">No effects match.</div>';
    return;
  }
  node.innerHTML = items.map((it) => `
    <button class="item ${it.id === state.id ? 'active' : ''}" type="button" data-id="${esc(it.id)}">
      <span class="dot" style="color:${esc(it._color || '#d4a84b')}"></span>
      <div>
        <div class="name">${esc(it.name || it.id)}</div>
        <div class="meta">${esc(it.category || '')} · ${it.timing?.loop === false ? 'one-shot' : 'loop'}</div>
      </div>
      <div class="uuid">${esc(it.id)}</div>
    </button>`).join('');
  node.querySelectorAll('.item').forEach((btn) => {
    btn.onclick = () => select(btn.dataset.id);
  });
  node.querySelector('.item.active')?.scrollIntoView({ block: 'nearest' });
}

function select(id) {
  const fx = state.alias.get(id) || state.items.find((it) => it.id === id);
  if (!fx) {
    setHud(`No effect “${id}”`);
    const empty = document.getElementById('emptyHint');
    if (empty) {
      empty.style.display = 'grid';
      empty.textContent = `No effect named ${id}. Pick one from the list.`;
    }
    return;
  }
  state.id = fx.id;
  try {
    mount(fx);
    paintInspector(fx);
  } catch (err) {
    setHud(`Render failed: ${err.message || err}`);
    console.error(err);
  }
  renderList();
}

function replay() {
  if (!state.fx) return;
  state.age = 0;
  state.t = 0;
  state.shakeT = 0;
  for (const s of state.systems) s.reset();
}

function moveSelection(dir) {
  const list = visibleItems();
  if (!list.length) return;
  let i = list.findIndex((it) => it.id === state.id);
  if (i < 0) i = 0;
  const next = list[Math.min(list.length - 1, Math.max(0, i + dir))];
  if (next && next.id !== state.id) select(next.id);
}

function fromSpell(sp) {
  const g = sp.geometry || {};
  let geometry = null;
  if (g.type === 'spline_trail') {
    geometry = {
      type: 'arc',
      radius: g.arc?.radius || 1.7,
      arcAngle: Math.abs((g.arc?.endAngle ?? 1.15) - (g.arc?.startAngle ?? -1.15)),
      width: g.trail?.width || 0.2,
      segments: 48,
      arc: g.arc,
      trail: g.trail,
    };
  } else if (g.type === 'projectile' || g.type === 'compound' || g.type === 'wall' || g.type === 'ring' || g.type === 'cylinder' || g.type === 'ray' || g.type === 'torus' || g.type === 'sphere') {
    geometry = g;
  } else if (g.type) geometry = g;
  const p = sp.particles || {};
  const distMap = { spline: 'arc' };
  return {
    id: sp.id,
    name: sp.name || sp.id,
    category: sp.category || 'magic',
    description: sp.description || '',
    colors: sp.colors || { primary: FALLBACK_COLOR[sp.category] || '#ffffff', secondary: '#ffffff' },
    timing: sp.timing || { duration: 2, loop: true, speed: 1 },
    shader: sp.shader || null,
    geometry,
    particles: p.count ? {
      count: p.count, size: p.size, opacity: p.opacity, blending: p.blending,
      distribution: distMap[p.distribution] || p.distribution,
      radius: p.radius, velocityY: p.velocityY, velocityX: p.velocityX,
      gravity: p.gravity, lifespan: p.lifespan, width: p.width, height: p.height,
    } : null,
    light: sp.lights || sp.light || null,
    bloom: sp.bloom,
    tags: sp.tags || [],
    source: 'vfx-spells',
    _color: sp.colors?.primary || FALLBACK_COLOR[sp.category] || '#d4a84b',
  };
}

function synthesize(fl) {
  const blob = `${fl.category || ''} ${(fl.tags || []).join(' ')} ${fl.effectId || ''} ${fl.name || ''}`.toLowerCase();
  const ice = /ice|frost|blizzard|water/.test(blob);
  const fire = /fire|flame|lava|meteor/.test(blob);
  const light = /lightning|thunder|shock|electric/.test(blob);
  const slash = /slash|melee/.test(blob);
  const earth = /earth|spike|quake|stone|wall/.test(blob);
  const portal = /portal|teleport/.test(blob);
  const aura = /aura|buff|heal/.test(blob);
  const beam = /beam|ray/.test(blob);
  const primary = ice ? '#44ddff' : fire ? '#ff4400' : light ? '#ffe14a' : earth ? '#c4a46a' : portal ? '#6aa7ff' : '#c084fc';
  const secondary = ice || light ? '#ffffff' : fire ? '#ffcc00' : '#ffffff';
  let category = 'magic';
  if (ice) category = 'ice';
  else if (fire) category = 'fire';
  else if (light) category = 'lightning';
  else if (portal) category = 'portal';
  else if (slash) category = 'combat';
  else if (earth) category = 'impact';
  else if (aura) category = 'aura';
  const base = {
    id: fl.effectId,
    name: fl.name || fl.effectId,
    category,
    description: (fl.tags || []).join(' · ') || fl.name || '',
    colors: { primary, secondary },
    timing: { duration: 2.2, loop: true, speed: 1 },
    tags: fl.tags || [],
    source: (fl.sources || []).join(', ') || 'fleet-effects',
    legacyUuid: fl.legacyUuid || null,
    _color: primary,
    bloom: { strength: 0.9, radius: 0.4, threshold: 0.2 },
    light: { color: primary, intensity: 2.5, distance: 8 },
  };
  if (slash) {
    return { ...base, category: 'combat', shader: fire ? 'fire' : null, timing: { duration: 0.5, loop: false, speed: 1.5 }, geometry: { type: 'arc', radius: 1.7, arcAngle: 2.3, width: 0.16, segments: 42 }, particles: { count: 70, size: 0.035, opacity: 0.9, blending: 'additive', distribution: 'arc' } };
  }
  if (portal) {
    return { ...base, geometry: { type: 'torus', radius: 1, tube: 0.14, segments: [28, 12], innerDisc: true, innerOpacity: 0.32 }, particles: { count: 160, size: 0.04, opacity: 0.7, blending: 'additive', distribution: 'ring', radius: 1.15 } };
  }
  if (beam || (light && /channel/.test(blob))) {
    return { ...base, shader: 'lightning', geometry: { type: 'cylinder', radiusTop: 0.1, radiusBottom: 0.26, height: 7, segments: 14, pulse: true }, particles: { count: 180, size: 0.04, opacity: 0.85, blending: 'additive', distribution: 'beam', beamLength: 7 } };
  }
  if (earth) {
    return { ...base, geometry: { type: 'compound', elements: ['spike_cones', 'ground_crack', 'shockwave_ring'], spikeCount: 8, spikeRadius: 1.7 }, particles: { count: 120, size: 0.07, opacity: 0.75, blending: 'additive', distribution: 'explosion', velocityY: [1, 3], gravity: -6 }, timing: { duration: 1.3, loop: true, speed: 1 } };
  }
  if (/orb|ball|projectile/.test(blob) || fl.category === 'projectile') {
    return { ...base, tags: [...(base.tags || []), 'projectile'], geometry: { type: 'sphere', radius: 0.36, segments: 20, pulse: true }, particles: { count: 140, size: 0.055, opacity: 0.85, blending: 'additive', distribution: 'sphere', radius: 0.5, trail: true } };
  }
  if (aura) {
    return { ...base, geometry: { type: 'ring', innerRadius: 0.9, outerRadius: 1.2, segments: 48 }, particles: { count: 160, size: 0.04, opacity: 0.65, blending: 'additive', distribution: 'cylinder', radius: 1.1, height: 2, velocityY: [0.3, 0.8] } };
  }
  if (light) {
    return { ...base, shader: 'lightning', geometry: { type: 'plane', width: 0.4, height: 5.2, segments: [6, 24], branches: 3 }, particles: { count: 100, size: 0.06, opacity: 0.9, blending: 'additive', distribution: 'beam', beamLength: 4, beamWidth: 0.4 } };
  }
  if (fire && /nova|blast|impact|aoe|meteor/.test(blob)) {
    return { ...base, shader: 'fire', geometry: { type: 'compound', elements: ['fire_planes', 'shockwave_ring'] }, particles: { count: 360, size: 0.09, opacity: 0.9, blending: 'additive', distribution: 'explosion', velocityY: [1, 4], gravity: -3 } };
  }
  if (fire) {
    return { ...base, shader: 'fire', geometry: { type: 'plane', width: 1.3, height: 2.5, segments: [12, 20], instances: 5, layout: 'circular', layoutRadius: 0.45 }, particles: { count: 200, size: 0.07, opacity: 0.85, blending: 'additive', distribution: 'cone', radius: 0.35, velocityY: [1.2, 3] } };
  }
  if (ice) {
    return { ...base, geometry: { type: 'ring', innerRadius: 0.4, outerRadius: 2.1, segments: 56 }, particles: { count: 320, size: 0.05, opacity: 0.7, blending: 'additive', distribution: 'volume', radius: 2.4, height: 3, velocityY: [-2.2, -0.6] } };
  }
  return { ...base, shader: 'magic', geometry: { type: 'sphere', radius: 0.42, segments: 18, pulse: true }, particles: { count: 180, size: 0.05, opacity: 0.8, blending: 'additive', distribution: 'sphere', radius: 1.1 } };
}

function mergeCatalog(reg, spells, fleet) {
  const map = new Map();
  const cats = reg.categories || {};
  for (const fx of Object.values(reg.effects || {})) {
    map.set(fx.id, {
      ...fx,
      source: fx.source || '3dfx-registry',
      _color: cats[fx.category]?.color || fx.colors?.primary || FALLBACK_COLOR[fx.category] || '#d4a84b',
    });
  }
  for (const sp of Object.values(spells.spells || {})) {
    if (!map.has(sp.id)) map.set(sp.id, fromSpell(sp));
  }
  for (const fl of fleet.effects || []) {
    const hit = map.get(fl.effectId);
    if (hit) {
      if (fl.legacyUuid) hit.legacyUuid = fl.legacyUuid;
      continue;
    }
    if (fl.effectId) map.set(fl.effectId, synthesize(fl));
  }
  const items = [...map.values()].sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
  state.alias = new Map();
  for (const it of items) {
    state.alias.set(it.id, it);
    if (it.legacyUuid) state.alias.set(it.legacyUuid, it);
  }
  return items;
}

async function loadShaders() {
  await Promise.all(Object.entries(SHADER_FILES).map(async ([key, [vert, frag]]) => {
    try {
      const [v, f] = await Promise.all([
        fetch(`./3dfx/shaders/${vert}`).then((r) => { if (!r.ok) throw new Error(vert); return r.text(); }),
        fetch(`./3dfx/shaders/${frag}`).then((r) => { if (!r.ok) throw new Error(frag); return r.text(); }),
      ]);
      shaders.set(key, { vert: v, frag: f });
    } catch (err) {
      console.warn('shader', key, err);
    }
  }));
}

async function copyText(text, ok) {
  const msg = document.getElementById('copyMsg');
  try {
    await navigator.clipboard.writeText(text);
    if (msg) { msg.textContent = ok || 'Copied'; msg.className = 'msg ok'; }
  } catch {
    if (msg) { msg.textContent = text; msg.className = 'msg err'; }
  }
}

function bindUi() {
  document.getElementById('qFx')?.addEventListener('input', (e) => {
    query = e.target.value || '';
    renderList();
  });
  document.getElementById('btnReplay')?.addEventListener('click', replay);
  document.getElementById('btnPause')?.addEventListener('click', () => {
    paused = !paused;
    document.getElementById('btnPause').textContent = paused ? 'Play' : 'Pause';
  });
  document.getElementById('btnGrid')?.addEventListener('click', () => { grid.visible = !grid.visible; });
  document.getElementById('btnResetCam')?.addEventListener('click', () => {
    camera.position.set(4.4, 2.35, 6.4);
    controls.target.set(0, 1.05, 0);
  });
  document.getElementById('btnCopyUuid')?.addEventListener('click', () => copyText(state.id || '', 'Effect id copied'));
  document.getElementById('btnCopyShare')?.addEventListener('click', () => copyText(shareUrl(state.id || ''), 'Share URL copied'));
  document.getElementById('btnShareEffect')?.addEventListener('click', async () => {
    const url = shareUrl(state.id || '');
    if (navigator.share && state.fx) {
      try { await navigator.share({ title: state.fx.name || 'Grudge 3DFX', url }); return; } catch { /* copy */ }
    }
    copyText(url, 'Share URL copied');
  });
  document.getElementById('btnCopySnippet')?.addEventListener('click', () => copyText(document.getElementById('snippet')?.textContent || '', 'Snippet copied'));
  document.getElementById('btnCopyCdn')?.addEventListener('click', () => copyText(document.getElementById('cdnUrl')?.textContent || '', 'Shader path copied'));
  window.addEventListener('keydown', (e) => {
    const typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
    if (typing) return;
    if (e.code === 'Space') { e.preventDefault(); replay(); }
    else if (e.key === 'p' || e.key === 'P') document.getElementById('btnPause')?.click();
    else if (e.key === 'g' || e.key === 'G') document.getElementById('btnGrid')?.click();
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
  });
}

const clock = new THREE.Clock();
let fpsN = 0;
let fpsAt = performance.now() / 1000;
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!paused && state.fx) {
    const span = state.loop ? state.dur : Math.max(state.dur, 0.95);
    const rate = state.loop ? Math.min(state.speed || 1, 1.5) : 1;
    state.age += dt * rate;
    let p = state.age / span;
    if (p >= 1) {
      if (state.loop) {
        state.age %= span;
        p = state.age / span;
      } else if (state.age > span + 0.32) {
        state.age = 0;
        p = 0;
        state.shakeT = 0;
        for (const s of state.systems) s.reset();
      } else p = 1;
    }
    state.p = p;
    state.t += dt;
    for (const s of state.systems) s.update(state.t, p, dt);
    if (state.root) tickAnims(state.root, state.t, p);
    if (state.projectile && state.carrier) {
      const u = state.loop ? p : Math.min(1, p);
      state.carrier.position.z = -1.4 + u * 3.4;
      state.carrier.position.y = Math.sin(Math.min(1, u) * Math.PI) * 0.28;
    }
    if (state.light && state.lightDef) {
      let k = state.lightDef.intensity || 2;
      if (state.lightDef.flicker) k *= 0.72 + Math.random() * 0.45;
      if (state.lightDef.pulse) k *= 0.7 + 0.3 * Math.sin(state.t * 3);
      if (state.lightDef.decay) k *= 1 - Math.min(1, p);
      state.light.intensity = Math.max(0, k);
    }
    if (state.shake) state.shakeT += dt;
  }
  controls.update();
  const restX = camera.position.x;
  const restY = camera.position.y;
  const restZ = camera.position.z;
  if (!paused && state.shake && state.fx) {
    const dur = state.shake.continuous ? state.dur : (state.shake.duration || 0.3);
    if (state.shakeT < dur) {
      const k = (state.shake.intensity || 0.04) * (state.shake.continuous ? 0.25 : (1 - state.shakeT / dur));
      camera.position.x += (Math.random() - 0.5) * k;
      camera.position.y += (Math.random() - 0.5) * k * 0.45;
    }
  }
  renderer.render(scene, camera);
  camera.position.set(restX, restY, restZ);
  fpsN += 1;
  const now = performance.now() / 1000;
  if (now - fpsAt > 0.5) {
    const fps = fpsN / (now - fpsAt);
    fpsN = 0;
    fpsAt = now;
    const bar = document.getElementById('statusBar');
    if (bar) {
      bar.textContent = state.fx
        ? `${fps.toFixed(0)} FPS · ${state.fx.category} · ${state.loop ? 'loop' : 'one-shot'} · ${state.dur.toFixed(1)}s`
        : `${fps.toFixed(0)} FPS`;
    }
  }
}

async function boot() {
  bindUi();
  frame();
  const empty = document.getElementById('emptyHint');
  try {
    const [reg, spells, fleet] = await Promise.all([
      fetch('./api/v1/3dfx-registry.json').then((r) => { if (!r.ok) throw new Error('3dfx-registry'); return r.json(); }),
      fetch('./api/v1/vfx-spells.json').then((r) => r.json()).catch(() => ({ spells: {} })),
      fetch('./api/v1/effects.json').then((r) => r.json()).catch(() => ({ effects: [] })),
    ]);
    await loadShaders();
    state.items = mergeCatalog(reg, spells, fleet);
    document.getElementById('countBadge').textContent = `${state.items.length} effects`;
    renderChips();
    renderList();
    const want = new URLSearchParams(location.search).get('effect') || new URLSearchParams(location.search).get('spell') || new URLSearchParams(location.search).get('id');
    if (want && state.alias.get(want)) select(want);
    else if (state.alias.get('inferno')) select('inferno');
    else if (state.items[0]) select(state.items[0].id);
    else if (empty) empty.textContent = 'The effect catalog is empty.';
  } catch (err) {
    if (empty) {
      empty.style.display = 'grid';
      empty.textContent = `Could not load effects: ${err.message || err}`;
    }
    setHud('Catalog failed');
    console.error(err);
  }
}

boot();
