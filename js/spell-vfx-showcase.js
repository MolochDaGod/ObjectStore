/**
 * Grudge Spell VFX Library — procedural 3D showcase.
 * three r185, pooled particles, one render loop. No CDN mesh/texture fetches:
 * spell textures and orb/slash GLBs were audited as 404 or HTML-poisoned.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const SPELLS_URL = './api/v1/vfx-spells.json';

const GROUPS = [
  { id: 'projectile', label: 'Projectile', blurb: 'Travel + trail + impact' },
  { id: 'magic', label: 'Magic', blurb: 'AoE, ward, nature' },
  { id: 'skill', label: 'Skill', blurb: 'Melee slash, mobility' },
];

/** Curated showcase (20). Remaining API ids are listed in the audit, not played. */
const SHOWCASE = [
  { id: 'fireball',        group: 'projectile' },
  { id: 'frost_lance',     group: 'projectile' },
  { id: 'arcane_orb',      group: 'projectile' },
  { id: 'poison_bolt',     group: 'projectile' },
  { id: 'shadow_orb',      group: 'projectile' },
  { id: 'inferno_aoe',     group: 'magic' },
  { id: 'blizzard_aoe',    group: 'magic' },
  { id: 'chain_lightning', group: 'magic' },
  { id: 'lightning_storm', group: 'magic' },
  { id: 'ice_wall',        group: 'magic' },
  { id: 'earth_wall',      group: 'magic' },
  { id: 'nature_heal',     group: 'magic' },
  { id: 'nature_thorns',   group: 'magic' },
  { id: 'arcane_nova',     group: 'magic' },
  { id: 'portal_open',     group: 'magic' },
  { id: 'void_rift',       group: 'magic' },
  { id: 'fire_slash',      group: 'skill' },
  { id: 'frost_slash',     group: 'skill' },
  { id: 'impact_crater',   group: 'skill' },
  { id: 'wind_gust',       group: 'skill' },
];

const FALLBACK = {
  fireball:        { name: 'Fireball',        category: 'fire',      description: 'Projectile fireball with a trailing core and shockwave impact.', colors: { primary: '#ff4400', secondary: '#ffcc00' } },
  frost_lance:     { name: 'Frost Lance',     category: 'ice',       description: 'Crystalline ice spear with a shattering impact.', colors: { primary: '#aaeeff', secondary: '#00ccff' } },
  arcane_orb:      { name: 'Arcane Orb',      category: 'arcane',    description: 'Pulsing arcane sphere with a magenta trail.', colors: { primary: '#aa44ff', secondary: '#ee88ff' } },
  poison_bolt:     { name: 'Poison Bolt',     category: 'poison',    description: 'Venomous bolt that splatters on impact.', colors: { primary: '#44cc66', secondary: '#aaff44' } },
  shadow_orb:      { name: 'Shadow Orb',      category: 'arcane',    description: 'Void-cored orb with a violet rim.', colors: { primary: '#6622aa', secondary: '#221133' } },
  inferno_aoe:     { name: 'Inferno AOE',     category: 'fire',      description: 'Ground-eruption pillars and a ring of flame.', colors: { primary: '#ff3300', secondary: '#ffaa00' } },
  blizzard_aoe:    { name: 'Blizzard AOE',    category: 'ice',       description: 'Spiral ice storm with a freezing ground pulse.', colors: { primary: '#88ddff', secondary: '#aaeeff' } },
  chain_lightning: { name: 'Chain Lightning', category: 'lightning', description: 'A bolt that hops across three targets.', colors: { primary: '#ffff66', secondary: '#aaddff' } },
  lightning_storm: { name: 'Lightning Storm', category: 'lightning', description: 'Sky-to-ground strikes across the arena.', colors: { primary: '#ffff00', secondary: '#ddeeff' } },
  ice_wall:        { name: 'Ice Wall',        category: 'ice',       description: 'A line of ice crystals rises from the ground.', colors: { primary: '#aaeeff', secondary: '#ffffff' } },
  earth_wall:      { name: 'Earth Wall',      category: 'earth',     description: 'Stone slabs heave upward in a defensive line.', colors: { primary: '#88aa44', secondary: '#c4a574' } },
  nature_heal:     { name: 'Nature Heal',     category: 'nature',    description: 'Rising heal motes spiral into the target.', colors: { primary: '#44cc66', secondary: '#ddffaa' } },
  nature_thorns:   { name: 'Nature Thorns',   category: 'nature',    description: 'Thorn spikes burst from the earth.', colors: { primary: '#339944', secondary: '#88cc44' } },
  arcane_nova:     { name: 'Arcane Nova',     category: 'arcane',    description: 'An expanding arcane shockwave.', colors: { primary: '#cc44ff', secondary: '#ffffff' } },
  portal_open:     { name: 'Portal',          category: 'portal',    description: 'A swirling gate opens in the arena.', colors: { primary: '#4488ff', secondary: '#88ddff' } },
  void_rift:       { name: 'Void Rift',       category: 'portal',    description: 'A dark rift that pulls matter inward.', colors: { primary: '#5522aa', secondary: '#110018' } },
  fire_slash:      { name: 'Fire Slash',      category: 'fire',      description: 'A burning melee arc with trailing embers.', colors: { primary: '#ff5500', secondary: '#ffaa00' } },
  frost_slash:     { name: 'Frost Slash',     category: 'ice',       description: 'A freezing melee crescent.', colors: { primary: '#aaeeff', secondary: '#ffffff' } },
  impact_crater:   { name: 'Impact Crater',   category: 'impact',    description: 'A meteor strike that leaves a scorched crater.', colors: { primary: '#ff6600', secondary: '#ffcc66' } },
  wind_gust:       { name: 'Wind Gust',       category: 'wind',      description: 'A rushing shockwave that knocks the target back.', colors: { primary: '#aaddff', secondary: '#ffffff' } },
};

const CAT_COLOR = {
  fire: '#ff4400', ice: '#00ccff', lightning: '#ffe14a', arcane: '#aa44ff',
  earth: '#88aa44', nature: '#44cc66', impact: '#ff6600', portal: '#4488ff',
  holy: '#ffe9a8', poison: '#44cc66', wind: '#aaddff',
};

const ADD_N = 1024;
const ALPHA_N = 256;
const JOB_N = 96;

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function hexCol(hex, out) {
  const c = out || new THREE.Color();
  try { c.set(hex); } catch { c.set(0xffffff); }
  return c;
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function easeOut(t) { const u = 1 - t; return 1 - u * u; }
function easeOutBack(t) { const c = 1.70158; return 1 + (c + 1) * ((t - 1) ** 3) + c * ((t - 1) ** 2); }

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _c = new THREE.Color();
const _c2 = new THREE.Color();
const _eul = new THREE.Euler();
const _fwd = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _zero = new THREE.Vector3();

function makeSoftTex(size = 64) {
  const cnv = document.createElement('canvas');
  cnv.width = cnv.height = size;
  const g = cnv.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.2, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.55, 'rgba(255,255,255,0.28)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function billboardMat(tex, blending) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: tex } },
    vertexShader: [
      'attribute float instanceOpacity;',
      'varying vec2 vUv;',
      'varying vec3 vColor;',
      'varying float vOp;',
      'void main() {',
      '  vUv = uv;',
      '  vColor = instanceColor;',
      '  vOp = instanceOpacity;',
      '  vec4 world = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
      '  vec4 mv = viewMatrix * world;',
      '  float sx = length(instanceMatrix[0].xyz);',
      '  float sy = length(instanceMatrix[1].xyz);',
      '  mv.xy += position.xy * vec2(sx, sy);',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D map;',
      'varying vec2 vUv;',
      'varying vec3 vColor;',
      'varying float vOp;',
      'void main() {',
      '  float mask = texture2D(map, vUv).a;',
      '  float d = length(vUv - 0.5) * 2.0;',
      '  float a = smoothstep(1.0, 0.05, d) * mask * vOp;',
      '  if (a < 0.008) discard;',
      '  gl_FragColor = vec4(vColor * a, a);',
      '}'
    ].join('\n'),
    transparent: true,
    blending,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
}

function makePool(n, mat) {
  const geo = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
  const op = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
  mesh.geometry.setAttribute('instanceOpacity', op);
  mesh.frustumCulled = false;
  mesh.count = n;
  mesh.renderOrder = 4;
  const px = new Float32Array(n), py = new Float32Array(n), pz = new Float32Array(n);
  const vx = new Float32Array(n), vy = new Float32Array(n), vz = new Float32Array(n);
  const life = new Float32Array(n), maxL = new Float32Array(n);
  const s0 = new Float32Array(n), s1 = new Float32Array(n);
  const cr = new Float32Array(n), cg = new Float32Array(n), cb = new Float32Array(n), ca = new Float32Array(n);
  const drag = new Float32Array(n), grav = new Float32Array(n);
  const alive = new Uint8Array(n);
  let cursor = 0, live = 0;
  _m.compose(_zero, _q.identity(), _s.set(0, 0, 0));
  for (let i = 0; i < n; i++) {
    mesh.setMatrixAt(i, _m);
    mesh.setColorAt(i, _c.setRGB(0, 0, 0));
    op.setX(i, 0);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;
  op.needsUpdate = true;

  function steal() {
    let best = cursor, bl = 1e9;
    for (let k = 0; k < n; k++) {
      const i = (cursor + k) % n;
      if (!alive[i]) { cursor = (i + 1) % n; return i; }
      if (life[i] < bl) { bl = life[i]; best = i; }
    }
    cursor = (best + 1) % n;
    return best;
  }

  return {
    mesh, n, live: () => live,
    clear() {
      live = 0;
      for (let i = 0; i < n; i++) {
        if (!alive[i]) continue;
        alive[i] = 0; life[i] = 0;
        mesh.setMatrixAt(i, _m.compose(_zero, _q.identity(), _s.set(0, 0, 0)));
        op.setX(i, 0);
      }
      mesh.instanceMatrix.needsUpdate = true;
      op.needsUpdate = true;
    },
    emit(count, fn) {
      for (let k = 0; k < count; k++) {
        const i = steal();
        if (!alive[i]) live++;
        alive[i] = 1;
        px[i] = 0; py[i] = 0; pz[i] = 0;
        vx[i] = 0; vy[i] = 0; vz[i] = 0;
        life[i] = 0.6; maxL[i] = 0.6;
        s0[i] = 0.12; s1[i] = 0.02;
        cr[i] = 1; cg[i] = 1; cb[i] = 1; ca[i] = 1;
        drag[i] = 0.92; grav[i] = 0;
        fn(i, {
          pos(x, y, z) { px[i] = x; py[i] = y; pz[i] = z; },
          vel(x, y, z) { vx[i] = x; vy[i] = y; vz[i] = z; },
          life(l) { life[i] = l; maxL[i] = l; },
          size(a, b) { s0[i] = a; s1[i] = b == null ? a * 0.2 : b; },
          color(r, g, b, a) { cr[i] = r; cg[i] = g; cb[i] = b; ca[i] = a == null ? 1 : a; },
          drag(d) { drag[i] = d; },
          grav(gv) { grav[i] = gv; },
        });
      }
    },
    update(dt) {
      if (live === 0) return;
      for (let i = 0; i < n; i++) {
        if (!alive[i]) continue;
        life[i] -= dt;
        if (life[i] <= 0) {
          alive[i] = 0; live--;
          mesh.setMatrixAt(i, _m.compose(_zero, _q.identity(), _s.set(0, 0, 0)));
          op.setX(i, 0);
          continue;
        }
        const t = 1 - life[i] / maxL[i];
        vx[i] *= drag[i];
        vy[i] = vy[i] * drag[i] + grav[i] * dt;
        vz[i] *= drag[i];
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
        pz[i] += vz[i] * dt;
        const sz = lerp(s0[i], s1[i], t);
        const fade = t < 0.15 ? t / 0.15 : t > 0.65 ? (1 - t) / 0.35 : 1;
        _s.set(sz, sz, sz);
        _v1.set(px[i], py[i], pz[i]);
        mesh.setMatrixAt(i, _m.compose(_v1, _q.identity(), _s));
        mesh.setColorAt(i, _c.setRGB(cr[i], cg[i], cb[i]));
        op.setX(i, ca[i] * fade);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
      op.needsUpdate = true;
    },
  };
}
const S = {
  renderer: null, scene: null, camera: null, controls: null,
  clock: 0, lastT: 0, paused: false, reduced: false,
  gen: 0, current: null, demo: false, demoIdx: -1, demoWait: 0,
  api: {}, filter: 'all', query: '',
  add: null, alpha: null, softTex: null,
  jobs: new Array(JOB_N), frames: new Array(64), frameN: 0,
  lights: [], rings: [], decals: [], bolts: [], jets: [],
  iceWall: null, earthWall: null, blocks: null, thorns: null,
  projs: {}, slashRibbon: null, portal: null, crater: null,
  caster: null, target: null, extras: [],
  hand: new THREE.Vector3(), chest: new THREE.Vector3(),
  tA: new THREE.Vector3(), tB: new THREE.Vector3(), tC: new THREE.Vector3(),
  chargeOrb: null, staffGlow: null, disposables: [],
  shakeT: 0, shakeAmp: 0, camTarget: new THREE.Vector3(0, 0.95, 0),
  resizeObserver: null, tornDown: false,
};
for (let i = 0; i < JOB_N; i++) S.jobs[i] = { alive: false, at: 0, fn: null };
for (let i = 0; i < 64; i++) S.frames[i] = { alive: false, fn: null };

function pCount(n) { return Math.max(4, Math.floor(n * (S.reduced ? 0.32 : 1))); }
function dur(t) { return t * (S.reduced ? 0.58 : 1); }

function after(sec, fn) {
  const g = S.gen;
  for (let i = 0; i < JOB_N; i++) {
    const j = S.jobs[i];
    if (!j.alive) {
      j.alive = true; j.at = S.lastT + sec;
      j.fn = () => { if (S.gen === g) fn(); };
      return;
    }
  }
}
function onFrame(fn) {
  const g = S.gen;
  for (let i = 0; i < S.frames.length; i++) {
    const f = S.frames[i];
    if (!f.alive) {
      f.alive = true;
      f.fn = (dt) => (S.gen !== g ? false : fn(dt));
      S.frameN++;
      return;
    }
  }
}
function clearJobs() {
  for (let i = 0; i < JOB_N; i++) S.jobs[i].alive = false;
  for (let i = 0; i < S.frames.length; i++) S.frames[i].alive = false;
  S.frameN = 0;
}

function burst(pool, o) {
  const n = pCount(o.n);
  hexCol(o.color, _c);
  if (o.color2) hexCol(o.color2, _c2); else _c2.copy(_c);
  const dirx = o.dx == null ? 0 : o.dx;
  const diry = o.dy == null ? 1 : o.dy;
  const dirz = o.dz == null ? 0 : o.dz;
  const spread = o.spread == null ? 1 : o.spread;
  pool.emit(n, (i, p) => {
    const theta = Math.random() * Math.PI * 2;
    const z = o.hemisphere ? Math.random() : (Math.random() * 2 - 1);
    const rxy = o.hemisphere ? Math.sqrt(Math.random()) : Math.sqrt(Math.max(0, 1 - z * z));
    let vx = Math.cos(theta) * rxy * spread + dirx;
    let vy = (o.hemisphere ? Math.abs(z) : z) * spread + diry;
    let vz = Math.sin(theta) * rxy * spread + dirz;
    const spd = (o.speed || 2) + (Math.random() - 0.5) * (o.speedSpread || o.speed || 2) * 0.8;
    const len = Math.hypot(vx, vy, vz) || 1;
    p.vel(vx / len * spd, vy / len * spd, vz / len * spd);
    const rad = o.radius || 0;
    p.pos((o.x || 0) + (Math.random() - 0.5) * rad * 2, (o.y || 0) + (Math.random() - 0.5) * rad * 0.4, (o.z || 0) + (Math.random() - 0.5) * rad * 2);
    const t = Math.random();
    p.color(lerp(_c.r, _c2.r, t), lerp(_c.g, _c2.g, t), lerp(_c.b, _c2.b, t), o.a == null ? 1 : o.a);
    p.life((o.life || 0.6) + Math.random() * (o.lifeSpread || 0.3));
    const sz = o.size || 0.16;
    p.size(sz * (0.7 + Math.random() * 0.6), o.sizeEnd == null ? sz * 0.15 : o.sizeEnd);
    p.drag(o.drag == null ? 0.92 : o.drag);
    p.grav(o.grav == null ? 0 : o.grav);
  });
}

function trailAt(x, y, z, color, n, size) {
  burst(S.add, {
    n: n || 3, x, y, z, color, color2: '#ffffff',
    speed: 0.35, speedSpread: 0.4, spread: 0.5, dx: 0, dy: 0.15, dz: 0,
    life: 0.28, lifeSpread: 0.18, size: size || 0.14, sizeEnd: 0.02,
    drag: 0.86, grav: 0.4, a: 0.95, radius: 0.05,
  });
}

function makeRings() {
  const geo = new THREE.RingGeometry(0.72, 1, 64);
  for (let i = 0; i < 10; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.visible = false;
    m.userData = { t: 0, dur: 1, r0: 0.2, r1: 3, a0: 0.85 };
    S.scene.add(m);
    S.rings.push(m);
    S.disposables.push(mat);
  }
  S.disposables.push(geo);
}
function ring(x, y, z, color, r1, durSec, r0) {
  for (let i = 0; i < S.rings.length; i++) {
    const m = S.rings[i];
    if (m.visible) continue;
    hexCol(color, _c);
    m.material.color.copy(_c);
    m.material.opacity = 0.85;
    m.position.set(x, y + 0.03, z);
    const s0 = r0 || 0.15;
    m.scale.set(s0, s0, 1);
    m.visible = true;
    m.userData.t = 0;
    m.userData.dur = dur(durSec || 0.55);
    m.userData.r0 = s0;
    m.userData.r1 = r1 || 3;
    m.userData.a0 = 0.9;
    return;
  }
}
function updateRings(dt) {
  for (let i = 0; i < S.rings.length; i++) {
    const m = S.rings[i];
    if (!m.visible) continue;
    m.userData.t += dt;
    const u = m.userData.t / m.userData.dur;
    if (u >= 1) { m.visible = false; m.material.opacity = 0; continue; }
    const r = lerp(m.userData.r0, m.userData.r1, easeOut(u));
    m.scale.set(r, r, 1);
    m.material.opacity = m.userData.a0 * (1 - u) * (1 - u);
  }
}

function makeDecals() {
  const geo = new THREE.CircleGeometry(1, 40);
  for (let i = 0; i < 8; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x221100, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.MultiplyBlending, premultipliedAlpha: true, side: THREE.DoubleSide, toneMapped: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.02;
    m.visible = false;
    m.userData = { t: 0, dur: 2 };
    S.scene.add(m);
    S.decals.push(m);
    S.disposables.push(mat);
  }
  S.disposables.push(geo);
}
function decal(x, z, color, radius, durSec, mode) {
  for (let i = 0; i < S.decals.length; i++) {
    const m = S.decals[i];
    if (m.visible) continue;
    hexCol(color, _c);
    m.material.color.copy(_c);
    m.material.blending = mode === 'add' ? THREE.AdditiveBlending : (mode === 'normal' ? THREE.NormalBlending : THREE.MultiplyBlending);
    m.material.premultipliedAlpha = mode !== 'add' && mode !== 'normal';
    m.material.opacity = mode === 'add' ? 0.7 : mode === 'normal' ? 0.55 : 0.85;
    m.position.set(x, 0.021 + i * 0.002, z);
    m.scale.set(radius, radius, 1);
    m.visible = true;
    m.userData.t = 0;
    m.userData.dur = dur(durSec || 2.2);
    return;
  }
}
function updateDecals(dt) {
  for (let i = 0; i < S.decals.length; i++) {
    const m = S.decals[i];
    if (!m.visible) continue;
    m.userData.t += dt;
    const u = m.userData.t / m.userData.dur;
    if (u >= 1) { m.visible = false; continue; }
    const fade = u < 0.12 ? u / 0.12 : u > 0.55 ? (1 - u) / 0.45 : 1;
    const base = m.material.blending === THREE.AdditiveBlending ? 0.7 : 0.75;
    m.material.opacity = base * fade;
  }
}

function makeLights() {
  for (let i = 0; i < 3; i++) {
    const l = new THREE.PointLight(0xffaa66, 0, 10, 2);
    l.visible = false;
    S.scene.add(l);
    S.lights.push(l);
    l.userData = { t: 0, dur: 0.4, i0: 4 };
  }
}
function flash(x, y, z, color, intensity, durSec, dist) {
  for (let i = 0; i < S.lights.length; i++) {
    const l = S.lights[i];
    if (l.visible) continue;
    hexCol(color, _c);
    l.color.copy(_c);
    l.intensity = intensity || 4;
    l.distance = dist || 9;
    l.position.set(x, y, z);
    l.visible = true;
    l.userData.t = 0;
    l.userData.dur = dur(durSec || 0.35);
    l.userData.i0 = intensity || 4;
    return;
  }
}
function updateLights(dt) {
  for (let i = 0; i < S.lights.length; i++) {
    const l = S.lights[i];
    if (!l.visible) continue;
    l.userData.t += dt;
    const u = l.userData.t / l.userData.dur;
    if (u >= 1) { l.visible = false; l.intensity = 0; continue; }
    l.intensity = l.userData.i0 * (1 - u) * (1 - u);
  }
}
function makeBolts() {
  for (let i = 0; i < 6; i++) {
    const pos = new Float32Array(16 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setDrawRange(0, 16);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffaa, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
      depthWrite: false, toneMapped: false,
    });
    const line = new THREE.Line(geo, mat);
    line.visible = false;
    line.frustumCulled = false;
    line.userData = { t: 0, dur: 0.18, pos, segs: 16 };
    S.scene.add(line);
    S.bolts.push(line);
    S.disposables.push(geo, mat);
    const mat2 = mat.clone();
    const geo2 = new THREE.BufferGeometry();
    geo2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(16 * 3), 3));
    const line2 = new THREE.Line(geo2, mat2);
    line2.visible = false;
    line2.frustumCulled = false;
    line.userData.twin = line2;
    S.scene.add(line2);
    S.disposables.push(geo2, mat2);
  }
}
function jagged(from, to, pos, segs, seed) {
  _v3.subVectors(to, from);
  const len = _v3.length() || 1;
  const dx = _v3.x / (segs - 1), dy = _v3.y / (segs - 1), dz = _v3.z / (segs - 1);
  _fwd.crossVectors(_v3, _up);
  if (_fwd.lengthSq() < 1e-6) _fwd.set(1, 0, 0);
  _fwd.normalize();
  _v3.normalize().cross(_fwd).normalize();
  let s = seed || Math.random() * 100;
  for (let i = 0; i < segs; i++) {
    const t = i / (segs - 1);
    const fall = Math.sin(t * Math.PI);
    s = (s * 9.1 + 3.7) % 100;
    const jx = (s / 50 - 1) * 0.28 * fall * Math.min(1.4, len * 0.18);
    s = (s * 7.3 + 1.1) % 100;
    const jy = (s / 50 - 1) * 0.22 * fall * Math.min(1.2, len * 0.14);
    s = (s * 5.9 + 4.2) % 100;
    const jz = (s / 50 - 1) * 0.28 * fall * Math.min(1.4, len * 0.18);
    const o = i * 3;
    if (i === 0) { pos[o] = from.x; pos[o + 1] = from.y; pos[o + 2] = from.z; }
    else if (i === segs - 1) { pos[o] = to.x; pos[o + 1] = to.y; pos[o + 2] = to.z; }
    else {
      pos[o] = from.x + dx * i + _fwd.x * jx + _v3.x * jz;
      pos[o + 1] = from.y + dy * i + jy;
      pos[o + 2] = from.z + dz * i + _fwd.z * jx + _v3.z * jz;
    }
  }
}
function lightning(from, to, color, durSec) {
  for (let i = 0; i < S.bolts.length; i++) {
    const L = S.bolts[i];
    if (L.visible) continue;
    hexCol(color || '#ffff88', _c);
    L.material.color.copy(_c);
    L.material.opacity = 1;
    jagged(from, to, L.userData.pos, 16, Math.random() * 80);
    L.geometry.attributes.position.needsUpdate = true;
    L.geometry.computeBoundingSphere();
    L.visible = true;
    L.userData.t = 0;
    L.userData.dur = dur(durSec || 0.16);
    const tw = L.userData.twin;
    tw.material.color.set(0xffffff);
    tw.material.opacity = 0.85;
    const tp = tw.geometry.attributes.position.array;
    const sp = L.userData.pos;
    for (let k = 0; k < 48; k++) tp[k] = sp[k];
    tw.geometry.attributes.position.needsUpdate = true;
    tw.visible = true;
    tw.userData = L.userData;
    return;
  }
}
function updateBolts(dt) {
  for (let i = 0; i < S.bolts.length; i++) {
    const L = S.bolts[i];
    if (!L.visible) continue;
    L.userData.t += dt;
    const u = L.userData.t / L.userData.dur;
    if (u >= 1) {
      L.visible = false; L.material.opacity = 0;
      if (L.userData.twin) L.userData.twin.visible = false;
      continue;
    }
    const a = u < 0.15 ? 1 : 1 - (u - 0.15) / 0.85;
    L.material.opacity = a;
    if (L.userData.twin) L.userData.twin.material.opacity = a * 0.7;
  }
}

function makeJets() {
  const geo = new THREE.CylinderGeometry(0.06, 0.2, 1, 16, 4, true);
  geo.translate(0, 0.5, 0);
  const vert = [
    'varying float vH; varying vec2 vUv;',
    'void main(){ vUv=uv; vH=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }'
  ].join('\n');
  const frag = [
    'uniform vec3 uColor; uniform float uOp;',
    'varying float vH; varying vec2 vUv;',
    'void main(){',
    '  float rim = pow(1.0 - abs(vUv.x - 0.5)*2.0, 1.4);',
    '  float tip = smoothstep(1.0, 0.35, vH) * smoothstep(0.0, 0.12, vH);',
    '  float a = rim * tip * uOp;',
    '  if (a < 0.01) discard;',
    '  gl_FragColor = vec4(uColor * (0.7+tip*0.6) * a, a);',
    '}'
  ].join('\n');
  for (let i = 0; i < 10; i++) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0xff5500) }, uOp: { value: 0 } },
      vertexShader: vert, fragmentShader: frag,
      transparent: true, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.visible = false;
    m.userData = { t: 0, dur: 1.4, h: 3.2 };
    S.scene.add(m);
    S.jets.push(m);
    S.disposables.push(mat);
  }
  S.disposables.push(geo);
}
function jet(x, z, color, height, durSec, delay) {
  after(delay || 0, () => {
    for (let i = 0; i < S.jets.length; i++) {
      const m = S.jets[i];
      if (m.visible) continue;
      hexCol(color, _c);
      m.material.uniforms.uColor.value.copy(_c);
      m.material.uniforms.uOp.value = 0;
      m.position.set(x, 0, z);
      m.scale.set(1, 0.01, 1);
      m.visible = true;
      m.userData.t = 0;
      m.userData.dur = dur(durSec || 1.3);
      m.userData.h = height || 3.2;
      return;
    }
  });
}
function updateJets(dt) {
  for (let i = 0; i < S.jets.length; i++) {
    const m = S.jets[i];
    if (!m.visible) continue;
    m.userData.t += dt;
    const u = m.userData.t / m.userData.dur;
    if (u >= 1) { m.visible = false; continue; }
    const up = u < 0.2 ? easeOut(u / 0.2) : 1;
    const fade = u > 0.55 ? 1 - (u - 0.55) / 0.45 : 1;
    m.scale.set(1 + u * 0.25, m.userData.h * up, 1 + u * 0.25);
    m.material.uniforms.uOp.value = 0.85 * fade;
  }
}

function makeInstancedBlocks(kind, n, geo, mat) {
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.visible = false;
  mesh.count = n;
  const data = {
    mesh, n,
    px: new Float32Array(n), pz: new Float32Array(n),
    sx: new Float32Array(n), sy: new Float32Array(n), sz: new Float32Array(n),
    ry: new Float32Array(n),
    t: 0, dur: 2, rise: 0.45, hold: 1.2, kind, live: false,
  };
  _m.compose(_zero, _q.identity(), _s.set(0, 0, 0));
  for (let i = 0; i < n; i++) mesh.setMatrixAt(i, _m);
  S.scene.add(mesh);
  S.disposables.push(geo, mat);
  return data;
}
function updateBlocks(B, dt) {
  if (!B || !B.live) return;
  B.t += dt;
  const u = B.t / B.dur;
  if (u >= 1) { B.live = false; B.mesh.visible = false; return; }
  const riseU = clamp(B.t / B.rise, 0, 1);
  const sinkStart = B.rise + B.hold;
  let yMul = easeOutBack(riseU);
  if (B.t > sinkStart) {
    const s = (B.t - sinkStart) / Math.max(0.05, B.dur - sinkStart);
    yMul = Math.max(0, 1 - easeOut(clamp(s, 0, 1)));
  }
  for (let i = 0; i < B.n; i++) {
    const h = B.sy[i] * yMul;
    _v1.set(B.px[i], h * 0.5, B.pz[i]);
    _eul.set(0, B.ry[i], 0);
    _q.setFromEuler(_eul);
    _s.set(B.sx[i], Math.max(0.001, h), B.sz[i]);
    B.mesh.setMatrixAt(i, _m.compose(_v1, _q, _s));
  }
  B.mesh.instanceMatrix.needsUpdate = true;
}
function raiseWall(kind, cx, cz, dirX, dirZ) {
  const B = kind === 'ice' ? S.iceWall : S.earthWall;
  const n = B.n;
  const perpX = -dirZ, perpZ = dirX;
  B.live = true; B.mesh.visible = true; B.t = 0;
  B.dur = dur(kind === 'ice' ? 2.6 : 2.7);
  B.rise = dur(0.48); B.hold = dur(1.35);
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1) - 0.5) * 5.4;
    const wob = (i % 2 === 0 ? 0.08 : -0.08);
    B.px[i] = cx + perpX * t + dirX * wob;
    B.pz[i] = cz + perpZ * t + dirZ * wob;
    B.ry[i] = Math.atan2(dirX, dirZ) + (Math.random() - 0.5) * 0.15;
    if (kind === 'ice') {
      B.sx[i] = 0.18 + Math.random() * 0.16;
      B.sy[i] = 1.4 + Math.random() * 1.1;
      B.sz[i] = 0.18 + Math.random() * 0.16;
    } else {
      B.sx[i] = 0.42 + Math.random() * 0.22;
      B.sy[i] = 1.15 + Math.random() * 0.55;
      B.sz[i] = 0.28 + Math.random() * 0.18;
    }
  }
}
function makeThorns() {
  const geo = new THREE.ConeGeometry(0.16, 1, 6);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a6b32, emissive: 0x14551c, emissiveIntensity: 0.45,
    roughness: 0.65, metalness: 0.08,
  });
  S.thorns = makeInstancedBlocks('thorns', 14, geo, mat);
}
function raiseThorns(cx, cz) {
  const B = S.thorns;
  B.live = true; B.mesh.visible = true; B.t = 0;
  B.dur = dur(2.1); B.rise = dur(0.28); B.hold = dur(1.05);
  for (let i = 0; i < B.n; i++) {
    const ang = (i / B.n) * Math.PI * 2 + (i % 3) * 0.12;
    const rad = 0.7 + (i % 5) * 0.28 + Math.random() * 0.15;
    B.px[i] = cx + Math.cos(ang) * rad;
    B.pz[i] = cz + Math.sin(ang) * rad;
    B.ry[i] = ang;
    B.sx[i] = 0.7 + Math.random() * 0.5;
    B.sy[i] = 0.7 + Math.random() * 0.7;
    B.sz[i] = B.sx[i];
  }
}
function makePortal() {
  const group = new THREE.Group();
  group.visible = false;
  const torusGeo = new THREE.TorusGeometry(1, 0.07, 12, 48);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x4488ff, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  group.add(torus);
  const discGeo = new THREE.CircleGeometry(1, 48);
  const discMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x4488ff) },
      uColor2: { value: new THREE.Color(0x110022) },
      uVoid: { value: 0 },
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: [
      'uniform float uTime, uVoid;',
      'uniform vec3 uColor, uColor2;',
      'varying vec2 vUv;',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }',
      'float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);',
      '  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }',
      'void main(){',
      '  vec2 p = vUv - 0.5;',
      '  float r = length(p);',
      '  float a = atan(p.y, p.x);',
      '  float spiral = sin(a * (uVoid>0.5? 7.0: 6.0) - uTime * (uVoid>0.5? 5.0: 4.0) + r * 16.0);',
      '  float n = n2(p * 9.0 + vec2(uTime*0.4, -uTime*0.6));',
      '  float ring = smoothstep(0.50, 0.38, r) * smoothstep(0.04, 0.16, r);',
      '  float core = smoothstep(0.22, 0.0, r);',
      '  vec3 col = mix(uColor, vec3(1.0), core * (1.0-uVoid));',
      '  if (uVoid > 0.5) col = mix(uColor2, uColor, ring + n*0.3);',
      '  float alpha = ring * (0.55 + 0.45*spiral) + core * (uVoid>0.5? 0.95: 0.75);',
      '  alpha *= smoothstep(0.52, 0.42, r);',
      '  gl_FragColor = vec4(col * (0.7 + n*0.4), alpha);',
      '}'
    ].join('\n'),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  group.add(disc);
  const rimGeo = new THREE.TorusGeometry(1, 0.03, 8, 48);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  group.add(rim);
  group.userData = { t: 0, dur: 3, discMat, torus, rim, kind: 'open' };
  S.scene.add(group);
  S.portal = group;
  S.disposables.push(torusGeo, torusMat, discGeo, discMat, rimGeo, rimMat);
}
function openPortal(x, y, z, color, kind, durSec) {
  const g = S.portal;
  g.position.set(x, y, z);
  g.rotation.set(0, 0, 0);
  g.scale.set(0.01, 0.01, 0.01);
  g.visible = true;
  g.userData.t = 0;
  g.userData.dur = dur(durSec || 2.8);
  g.userData.kind = kind;
  hexCol(color, _c);
  g.userData.discMat.uniforms.uColor.value.copy(_c);
  g.userData.discMat.uniforms.uVoid.value = kind === 'void' ? 1 : 0;
  g.userData.torus.material.color.copy(_c);
  g.userData.rim.material.color.set(kind === 'void' ? 0xaa66ff : 0xffffff);
}
function updatePortal(dt) {
  const g = S.portal;
  if (!g.visible) return;
  g.userData.t += dt;
  const u = g.userData.t / g.userData.dur;
  if (u >= 1) { g.visible = false; return; }
  const appear = u < 0.18 ? easeOutBack(clamp(u / 0.18, 0, 1)) : u > 0.78 ? 1 - easeOut((u - 0.78) / 0.22) : 1;
  const sc = Math.max(0.001, appear) * (g.userData.kind === 'void' ? 1.25 : 1.05);
  g.scale.set(sc, sc, sc);
  g.rotation.z += dt * (g.userData.kind === 'void' ? -0.7 : 0.45);
  g.userData.discMat.uniforms.uTime.value = g.userData.t;
  if (Math.random() < (S.reduced ? 0.3 : 0.7)) {
    const ang = S.lastT * 3.0 + Math.random() * 6;
    const r = 0.95 * sc;
    const px = g.position.x + Math.cos(ang) * r;
    const py = g.position.y + Math.sin(ang) * r * 0.92;
    const pz = g.position.z + (Math.random() - 0.5) * 0.1;
    const inward = g.userData.kind === 'void';
    S.add.emit(1, (i, p) => {
      p.pos(px, py, pz);
      const vx = g.position.x - px, vy = g.position.y - py;
      const len = Math.hypot(vx, vy) || 1;
      const spd = inward ? 1.1 : -0.55;
      p.vel(vx / len * spd, vy / len * spd, (Math.random() - 0.5) * 0.2);
      p.color(inward ? 0.55 : 0.45, inward ? 0.3 : 0.7, 1, 0.9);
      p.life(0.5); p.size(0.12, 0.02); p.drag(0.96); p.grav(0);
    });
  }
}

function makeCrater() {
  const geo = new THREE.CircleGeometry(1.4, 32);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const r = Math.hypot(x, y) / 1.4;
    pos.setZ(i, -0.22 * Math.cos(r * Math.PI) * (1 - r));
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a1a10, roughness: 0.95, metalness: 0.02, emissive: 0x331800, emissiveIntensity: 0.2,
    transparent: true, opacity: 0,
  });
  const m = new THREE.Mesh(geo, mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.025;
  m.visible = false;
  m.userData = { t: 0, dur: 2.6 };
  S.scene.add(m);
  S.crater = m;
  S.disposables.push(geo, mat);
}
function showCrater(x, z) {
  const m = S.crater;
  m.position.set(x, 0.025, z);
  m.scale.set(0.2, 0.2, 1);
  m.material.opacity = 0.95;
  m.visible = true;
  m.userData.t = 0;
  m.userData.dur = dur(2.6);
}
function updateCrater(dt) {
  const m = S.crater;
  if (!m.visible) return;
  m.userData.t += dt;
  const u = m.userData.t / m.userData.dur;
  if (u >= 1) { m.visible = false; return; }
  const sc = lerp(0.25, 1, easeOut(clamp(u / 0.18, 0, 1)));
  m.scale.set(sc, sc, 1);
  m.material.opacity = u > 0.65 ? 0.95 * (1 - (u - 0.65) / 0.35) : 0.95;
}

function makeProjectiles() {
  function add(name, mesh) {
    mesh.visible = false;
    S.scene.add(mesh);
    S.projs[name] = mesh;
    if (mesh.geometry) S.disposables.push(mesh.geometry);
    if (mesh.material) S.disposables.push(mesh.material);
  }
  const fireCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.22, 2),
    new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xff5500, emissiveIntensity: 2.2, roughness: 0.35, metalness: 0.1, toneMapped: false })
  );
  const fireShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  fireCore.add(fireShell);
  add('fireball', fireCore);
  S.disposables.push(fireShell.geometry, fireShell.material);

  const lance = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.16, 0),
    new THREE.MeshStandardMaterial({ color: 0xccf6ff, emissive: 0x33ccff, emissiveIntensity: 1.6, roughness: 0.15, metalness: 0.55, toneMapped: false })
  );
  lance.scale.set(0.7, 0.7, 3.2);
  add('lance', lance);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xcc66ff, emissive: 0x8800ff, emissiveIntensity: 1.8, roughness: 0.25, metalness: 0.3, toneMapped: false })
  );
  const ringG = new THREE.TorusGeometry(0.36, 0.025, 8, 32);
  const ringM = new THREE.MeshBasicMaterial({ color: 0xeeccff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const ring1 = new THREE.Mesh(ringG, ringM);
  const ring2 = new THREE.Mesh(ringG, ringM);
  ring2.rotation.x = Math.PI / 2;
  orb.add(ring1, ring2);
  orb.userData.spin = [ring1, ring2];
  add('orb', orb);
  S.disposables.push(ringG, ringM);

  const bolt = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0x66ff66, emissive: 0x22aa22, emissiveIntensity: 1.7, roughness: 0.4, toneMapped: false })
  );
  add('poison', bolt);

  const sh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0x0a0014, emissive: 0x5500aa, emissiveIntensity: 1.4, roughness: 0.5, metalness: 0.4, toneMapped: false })
  );
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0x8844ff, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.BackSide })
  );
  sh.add(rim);
  add('shadow', sh);
  S.disposables.push(rim.geometry, rim.material);

  const met = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.38, 1),
    new THREE.MeshStandardMaterial({ color: 0x4a3020, emissive: 0xff4400, emissiveIntensity: 1.6, roughness: 0.7 })
  );
  add('meteor', met);

  const charge = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  charge.visible = false;
  S.scene.add(charge);
  S.chargeOrb = charge;
  S.disposables.push(charge.geometry, charge.material);
}

function launch(kind, from, to, travel, color, onHit) {
  const mesh = S.projs[kind];
  if (!mesh) return;
  mesh.visible = true;
  mesh.position.copy(from);
  if (kind === 'lance') mesh.lookAt(to);
  const travelSec = dur(travel);
  const ox = from.x, oy = from.y, oz = from.z;
  const dx = to.x, dy = to.y, dz = to.z;
  let t = 0;
  onFrame((dt) => {
    t += dt;
    const u = clamp(t / travelSec, 0, 1);
    const e = 1 - (1 - u) * (1 - u);
    mesh.position.set(lerp(ox, dx, e), lerp(oy, dy, e) + Math.sin(u * Math.PI) * 0.15, lerp(oz, dz, e));
    if (mesh.userData.spin) {
      mesh.userData.spin[0].rotation.y += dt * 6;
      mesh.userData.spin[1].rotation.z += dt * 5;
    }
    mesh.rotation.y += dt * 4;
    trailAt(mesh.position.x, mesh.position.y, mesh.position.z, color, kind === 'shadow' ? 2 : 4, kind === 'lance' ? 0.1 : 0.16);
    if (u >= 1) {
      mesh.visible = false;
      _v1.set(dx, dy, dz);
      onHit(_v1);
      return false;
    }
    return true;
  });
}

function makeSlash() {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const a = -1.15 + (2.3 * i) / 24;
    pts.push(new THREE.Vector3(Math.sin(a) * 0.2, Math.cos(a) * 1.7 + 0.15, Math.sin(a) * 1.7));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 32, 0.07, 6, false);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xff6600, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(geo, mat);
  m.visible = false;
  m.userData = { t: 0, dur: 0.55 };
  S.scene.add(m);
  S.slashRibbon = m;
  S.disposables.push(geo, mat);
}
function playSlash(origin, facingX, facingZ, color, durSec) {
  const m = S.slashRibbon;
  const ox = origin.x, oy = origin.y, oz = origin.z;
  m.position.set(ox, 0.15, oz);
  m.rotation.set(0, Math.atan2(facingX, facingZ), 0);
  hexCol(color, _c);
  m.material.color.copy(_c);
  m.material.opacity = 0;
  m.visible = true;
  const D = dur(durSec || 0.55);
  let t = 0;
  onFrame((dt) => {
    t += dt;
    const u = t / D;
    if (u >= 1) { m.visible = false; return false; }
    const appear = u < 0.35 ? u / 0.35 : 1 - (u - 0.35) / 0.65;
    m.material.opacity = Math.max(0, appear) * 0.95;
    m.scale.set(1, 1, 0.4 + u * 1.1);
    if (u < 0.7) {
      const a = -1.15 + 2.3 * clamp(u / 0.35, 0, 1);
      _v1.set(0, Math.cos(a) * 1.7 + 1.0, Math.sin(a) * 1.7);
      _v1.applyAxisAngle(_up, Math.atan2(facingX, facingZ));
      _v1.x += ox; _v1.y += 0.15; _v1.z += oz;
      trailAt(_v1.x, _v1.y, _v1.z, color, 3, 0.12);
    }
    return true;
  });
}
function matBody(hex, emissive) {
  return new THREE.MeshStandardMaterial({
    color: hex, roughness: 0.55, metalness: 0.18,
    emissive: emissive || 0x000000, emissiveIntensity: emissive ? 0.25 : 0,
  });
}
function addBox(parent, mat, w, h, d, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent.add(m);
  S.disposables.push(m.geometry);
  return m;
}
function makeDummy(opts) {
  const g = new THREE.Group();
  const body = matBody(opts.color, opts.emissive);
  const dark = matBody(opts.dark || 0x1a1d26);
  S.disposables.push(body, dark);
  addBox(g, dark, 0.16, 0.42, 0.16, -0.1, 0.22, 0);
  addBox(g, dark, 0.16, 0.42, 0.16, 0.1, 0.22, 0);
  addBox(g, dark, 0.18, 0.07, 0.26, -0.1, 0.035, 0.04);
  addBox(g, dark, 0.18, 0.07, 0.26, 0.1, 0.035, 0.04);
  addBox(g, body, 0.38, 0.2, 0.24, 0, 0.55, 0);
  addBox(g, body, 0.42, 0.52, 0.26, 0, 0.92, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 12), body);
  head.position.set(0, 1.36, 0);
  g.add(head);
  S.disposables.push(head.geometry);
  const rArm = new THREE.Group();
  rArm.position.set(-0.28, 1.12, 0);
  addBox(rArm, body, 0.11, 0.34, 0.11, 0, -0.16, 0);
  const rFore = new THREE.Group();
  rFore.position.set(0, -0.36, 0);
  addBox(rFore, dark, 0.1, 0.32, 0.1, 0, -0.14, 0);
  rArm.add(rFore);
  g.add(rArm);
  const lArm = new THREE.Group();
  lArm.position.set(0.28, 1.12, 0);
  addBox(lArm, body, 0.11, 0.34, 0.11, 0, -0.16, 0);
  addBox(lArm, dark, 0.1, 0.32, 0.1, 0, -0.50, 0);
  g.add(lArm);
  let crystal = null;
  if (opts.staff) {
    const staff = new THREE.Group();
    staff.position.set(0, -0.32, 0.04);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.35, 8), matBody(0x4a3a28));
    pole.position.y = 0.4;
    staff.add(pole);
    crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.09, 0),
      new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x2266ff, emissiveIntensity: 1.1, roughness: 0.25, metalness: 0.4, toneMapped: false })
    );
    crystal.position.y = 1.1;
    staff.add(crystal);
    S.disposables.push(pole.geometry, pole.material, crystal.geometry, crystal.material);
    rFore.add(staff);
    S.staffGlow = crystal;
  }
  g.rotation.y = opts.yaw || 0;
  g.position.copy(opts.pos);
  const sh = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false })
  );
  sh.rotation.x = -Math.PI / 2;
  sh.position.y = 0.012;
  g.add(sh);
  S.disposables.push(sh.geometry, sh.material);
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 64;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 256, 64);
  ctx.font = '700 32px Inter, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(232,238,245,0.85)';
  ctx.fillText(opts.label, 128, 32);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  spr.position.set(0, 1.72, 0);
  spr.scale.set(0.95, 0.24, 1);
  g.add(spr);
  S.disposables.push(tex, spr.material);
  g.userData = { rArm, lArm, rFore, crystal, yaw0: opts.yaw || 0 };
  S.scene.add(g);
  return g;
}

function worldHand(out) {
  const c = S.caster;
  if (c.userData.crystal) c.userData.crystal.getWorldPosition(out);
  else out.set(c.position.x + 0.35, 1.2, c.position.z);
}
function worldChest(dummy, out) {
  out.set(dummy.position.x, 1.05, dummy.position.z);
}

function raiseStaff(color, wind) {
  const arm = S.caster.userData.rArm;
  const cry = S.caster.userData.crystal;
  hexCol(color, _c);
  if (cry) { cry.material.emissive.copy(_c); cry.material.emissiveIntensity = 2.6; }
  const W = dur(wind);
  let t = 0;
  onFrame((dt) => {
    t += dt;
    const u = clamp(t / W, 0, 1);
    arm.rotation.z = -0.95 * easeOut(u);
    arm.rotation.x = -0.25 * u;
    return u < 1;
  });
  after(W + dur(0.55), () => {
    let t2 = 0;
    onFrame((dt) => {
      t2 += dt;
      const u = clamp(t2 / dur(0.35), 0, 1);
      arm.rotation.z = lerp(-0.95, 0, easeOut(u));
      arm.rotation.x = lerp(-0.25, 0, easeOut(u));
      if (cry) cry.material.emissiveIntensity = lerp(2.6, 1.1, u);
      return u < 1;
    });
  });
}

function leanTarget(amt, hold) {
  const tg = S.target;
  let a = 0;
  const H = dur(hold || 0.45);
  onFrame((dt) => {
    a += dt;
    const u = a / H;
    if (u >= 1) { tg.rotation.z = 0; return false; }
    const k = u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75;
    tg.rotation.z = amt * k;
    return true;
  });
}

function charge(color, wind) {
  const orb = S.chargeOrb;
  worldHand(_v1);
  orb.position.copy(_v1);
  hexCol(color, _c);
  orb.material.color.copy(_c);
  orb.material.opacity = 0;
  orb.scale.set(0.2, 0.2, 0.2);
  orb.visible = true;
  const W = dur(wind);
  let t = 0;
  onFrame((dt) => {
    t += dt;
    const u = clamp(t / W, 0, 1);
    worldHand(_v1);
    orb.position.copy(_v1);
    orb.scale.setScalar(0.25 + u * 0.95);
    orb.material.opacity = 0.35 + u * 0.5;
    burst(S.add, {
      n: 2, x: _v1.x, y: _v1.y, z: _v1.z, color,
      speed: 0.4, spread: 0.6, dx: 0, dy: 0.1, dz: 0,
      life: 0.3, size: 0.09, drag: 0.9, grav: 0, radius: 0.12, a: 0.8,
    });
    if (u >= 1) { orb.visible = false; return false; }
    return true;
  });
  flash(_v1.x, _v1.y, _v1.z, color, 1.6, W, 5);
  ring(_v1.x, 0, _v1.z, color, 1.15, W + 0.15, 0.2);
}

function shake(amp, t) {
  if (S.reduced) return;
  S.shakeAmp = amp;
  S.shakeT = dur(t);
}

function windup(color, w) {
  raiseStaff(color, w);
  charge(color, w);
}

function metaOf(id) {
  const a = S.api[id] || {};
  const f = FALLBACK[id] || { name: id, description: '', category: 'arcane', colors: { primary: '#aa44ff', secondary: '#ffffff' } };
  return {
    id,
    name: a.name || f.name,
    description: a.description || f.description,
    category: a.category || f.category,
    tags: a.tags || f.tags || [],
    colors: a.colors || f.colors,
    primary: (a.colors && a.colors.primary) || f.colors.primary,
    secondary: (a.colors && a.colors.secondary) || f.colors.secondary,
  };
}

function impactCommon(p, color, color2, opts) {
  const o = opts || {};
  burst(S.add, {
    n: o.n || 48, x: p.x, y: p.y, z: p.z, color, color2,
    speed: o.speed || 4.2, speedSpread: 2.5, spread: 1, dx: 0, dy: 0.8, dz: 0,
    life: 0.45, lifeSpread: 0.35, size: o.size || 0.18, sizeEnd: 0.03,
    drag: 0.9, grav: o.grav == null ? -3.5 : o.grav, hemisphere: true, a: 1, radius: 0.1,
  });
  ring(p.x, 0, p.z, color, o.ring || 2.6, 0.55, 0.2);
  flash(p.x, p.y, p.z, color, o.light || 5.5, 0.38, 10);
}
const CAST = {
  fireball() {
    const m = metaOf('fireball');
    const w = 0.4;
    windup(m.primary, w);
    after(dur(w), () => {
      worldHand(_v1); worldChest(S.target, _v2);
      launch('fireball', _v1.clone(), _v2.clone(), 0.52, m.primary, (p) => {
        impactCommon(p, m.primary, m.secondary, { n: 64, speed: 5, ring: 2.8, size: 0.2 });
        burst(S.add, { n: 28, x: p.x, y: p.y, z: p.z, color: '#ffee88', speed: 1.6, dy: 1.4, spread: 0.5, life: 0.7, size: 0.22, grav: 1.2, drag: 0.88, hemisphere: true });
        decal(p.x, p.z, '#2a1008', 1.35, 2.4, 'mul');
        shake(0.07, 0.25);
      });
    });
    return 2.1;
  },
  frost_lance() {
    const m = metaOf('frost_lance');
    const w = 0.36;
    windup(m.primary, w);
    after(dur(w), () => {
      worldHand(_v1); worldChest(S.target, _v2);
      launch('lance', _v1.clone(), _v2.clone(), 0.42, m.primary, (p) => {
        impactCommon(p, m.primary, '#ffffff', { n: 50, speed: 4.5, ring: 2.3, grav: -1.2, size: 0.12 });
        burst(S.add, { n: 22, x: p.x, y: p.y, z: p.z, color: '#e8fbff', color2: '#66ddff', speed: 3.2, dy: 0.4, spread: 1.1, life: 0.7, size: 0.1, sizeEnd: 0.04, grav: -2, drag: 0.94, hemisphere: true });
        decal(p.x, p.z, '#a8e8ff', 1.2, 2.0, 'add');
      });
    });
    return 1.85;
  },
  arcane_orb() {
    const m = metaOf('arcane_orb');
    const w = 0.42;
    windup(m.primary, w);
    after(dur(w), () => {
      worldHand(_v1); worldChest(S.target, _v2);
      launch('orb', _v1.clone(), _v2.clone(), 0.62, m.primary, (p) => {
        impactCommon(p, m.primary, m.secondary, { n: 56, speed: 4, ring: 2.5 });
        ring(p.x, 0.4, p.z, m.secondary, 1.8, 0.4, 0.3);
        decal(p.x, p.z, '#3a1060', 1.1, 2.0, 'add');
      });
    });
    return 2.15;
  },
  poison_bolt() {
    const m = metaOf('poison_bolt');
    const w = 0.34;
    windup(m.primary, w);
    after(dur(w), () => {
      worldHand(_v1); worldChest(S.target, _v2);
      launch('poison', _v1.clone(), _v2.clone(), 0.48, m.primary, (p) => {
        impactCommon(p, m.primary, m.secondary, { n: 40, speed: 3.2, ring: 1.8, grav: -1.5, size: 0.16 });
        burst(S.alpha, { n: 18, x: p.x, y: p.y * 0.5, z: p.z, color: '#226622', color2: '#66cc44', speed: 0.8, dy: 0.6, spread: 0.7, life: 1.1, size: 0.35, sizeEnd: 0.55, grav: 0.4, drag: 0.96, a: 0.55 });
        decal(p.x, p.z, '#245c28', 1.05, 2.2, 'normal');
      });
    });
    return 1.95;
  },
  shadow_orb() {
    const m = metaOf('shadow_orb');
    const w = 0.44;
    windup('#8844ff', w);
    after(dur(w), () => {
      worldHand(_v1); worldChest(S.target, _v2);
      launch('shadow', _v1.clone(), _v2.clone(), 0.58, '#8844ff', (p) => {
        impactCommon(p, '#aa66ff', '#220044', { n: 44, speed: 3.4, ring: 2.1, light: 3.5 });
        burst(S.add, { n: 20, x: p.x, y: p.y, z: p.z, color: '#110018', color2: '#7722aa', speed: 1.2, dy: 0, spread: 0.9, life: 0.8, size: 0.28, grav: 0, drag: 0.95, a: 0.8 });
        decal(p.x, p.z, '#1a0828', 1.15, 2.2, 'mul');
      });
    });
    return 2.15;
  },
  inferno_aoe() {
    const m = metaOf('inferno_aoe');
    const w = 0.45;
    windup(m.primary, w);
    after(dur(w), () => {
      const t = S.target.position;
      ring(t.x, 0, t.z, m.primary, 3.4, 0.7, 0.4);
      flash(t.x, 1.2, t.z, m.primary, 6, 1.4, 12);
      decal(t.x, t.z, '#2a0c04', 2.4, 3.0, 'mul');
      const n = S.reduced ? 5 : 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = 1.15;
        jet(t.x + Math.cos(a) * r, t.z + Math.sin(a) * r, i % 2 ? m.secondary : m.primary, 2.9 + (i % 3) * 0.35, 1.55, i * 0.05);
      }
      jet(t.x, t.z, '#ffcc66', 3.6, 1.65, 0.08);
      let el = 0;
      onFrame((dt) => {
        el += dt;
        if (el > dur(1.7)) return false;
        burst(S.add, {
          n: 6, x: t.x, y: 0.1, z: t.z, color: m.primary, color2: m.secondary,
          speed: 2.8, dy: 3.5, spread: 0.45, life: 0.8, size: 0.2, grav: -0.5, drag: 0.94,
          radius: 2.0, hemisphere: true,
        });
        return true;
      });
      shake(0.08, 0.5);
    });
    return 3.05;
  },
  blizzard_aoe() {
    const m = metaOf('blizzard_aoe');
    const w = 0.4;
    windup(m.primary, w);
    after(dur(w), () => {
      const t = S.target.position;
      ring(t.x, 0, t.z, m.primary, 4.0, 1.2, 0.5);
      decal(t.x, t.z, '#c8f0ff', 2.6, 3.0, 'add');
      flash(t.x, 2, t.z, m.primary, 2.4, 2.2, 11);
      let el = 0;
      onFrame((dt) => {
        el += dt;
        if (el > dur(2.6)) return false;
        const n = S.reduced ? 8 : 18;
        S.add.emit(n, (i, p) => {
          const ang = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * 3.6;
          const x = t.x + Math.cos(ang) * r;
          const z = t.z + Math.sin(ang) * r;
          p.pos(x, 4.2 + Math.random() * 1.6, z);
          const spin = 1.4;
          p.vel(-Math.sin(ang) * spin, -2.4 - Math.random() * 2.2, Math.cos(ang) * spin);
          p.color(0.7 + Math.random() * 0.3, 0.9, 1, 0.85);
          p.life(0.9 + Math.random() * 0.7);
          p.size(0.07 + Math.random() * 0.06, 0.04);
          p.drag(0.995); p.grav(0);
        });
        if (Math.floor(el * 3) !== Math.floor((el - dt) * 3)) ring(t.x, 0, t.z, '#cceeff', 3.2, 0.8, 0.6);
        return true;
      });
    });
    return 3.35;
  },
  chain_lightning() {
    const m = metaOf('chain_lightning');
    const w = 0.32;
    windup(m.primary, w);
    after(dur(w), () => {
      worldHand(_v1);
      const hops = [_v1.clone(), S.tA.clone(), S.tB.clone(), S.tC.clone()];
      for (let i = 0; i < 3; i++) {
        after(dur(i * 0.12), () => {
          const a = hops[i], b = hops[i + 1];
          lightning(a, b, m.primary, 0.2);
          flash(b.x, b.y, b.z, m.primary, 5, 0.2, 7);
          burst(S.add, { n: 18, x: b.x, y: b.y, z: b.z, color: m.primary, color2: '#ffffff', speed: 3.2, dy: 0.6, spread: 1, life: 0.35, size: 0.1, grav: -1, drag: 0.9, hemisphere: true });
          ring(b.x, 0, b.z, '#ffffaa', 1.1, 0.3, 0.15);
        });
      }
    });
    return 1.7;
  },
  lightning_storm() {
    const m = metaOf('lightning_storm');
    const w = 0.38;
    windup(m.primary, w);
    after(dur(w), () => {
      const t = S.target.position;
      ring(t.x, 0, t.z, m.secondary, 3.6, 0.7, 0.4);
      const strikes = S.reduced ? 4 : 7;
      for (let i = 0; i < strikes; i++) {
        after(dur(0.12 + i * 0.22), () => {
          const ang = Math.random() * Math.PI * 2;
          const r = Math.random() * 2.6;
          const x = t.x + Math.cos(ang) * r;
          const z = t.z + Math.sin(ang) * r;
          _v1.set(x + (Math.random() - 0.5) * 1.2, 7.5, z + (Math.random() - 0.5) * 1.2);
          _v2.set(x, 0.05, z);
          lightning(_v1, _v2, i % 2 ? '#ffffff' : m.primary, 0.18);
          flash(x, 1.4, z, m.primary, 6, 0.18, 9);
          burst(S.add, { n: 16, x, y: 0.2, z, color: '#ffffcc', speed: 2.8, dy: 2.2, spread: 0.8, life: 0.4, size: 0.1, grav: -2, hemisphere: true });
          decal(x, z, '#1a1608', 0.55, 1.6, 'mul');
          shake(0.05, 0.12);
        });
      }
    });
    return 2.85;
  },
  ice_wall() {
    const m = metaOf('ice_wall');
    const w = 0.4;
    windup(m.primary, w);
    after(dur(w), () => {
      const cx = (S.caster.position.x + S.target.position.x) * 0.5;
      const cz = 0;
      raiseWall('ice', cx, cz, 1, 0);
      flash(cx, 1, cz, m.primary, 3, 0.5, 8);
      ring(cx, 0, cz, m.primary, 2.4, 0.6, 0.4);
      burst(S.add, { n: 40, x: cx, y: 0.2, z: cz, color: m.primary, color2: '#ffffff', speed: 1.6, dy: 1.8, spread: 0.8, life: 0.8, size: 0.12, grav: -1, drag: 0.93, radius: 2.2, hemisphere: true });
      decal(cx, cz, '#c8eeff', 2.0, 2.4, 'add');
    });
    return 3.05;
  },
  earth_wall() {
    const m = metaOf('earth_wall');
    const w = 0.42;
    windup(m.primary, w);
    after(dur(w), () => {
      const cx = (S.caster.position.x + S.target.position.x) * 0.5;
      const cz = 0;
      raiseWall('earth', cx, cz, 1, 0);
      flash(cx, 0.6, cz, '#c4a574', 2.2, 0.4, 7);
      ring(cx, 0, cz, m.secondary, 2.2, 0.55, 0.3);
      burst(S.alpha, { n: 28, x: cx, y: 0.15, z: cz, color: '#6a5a38', color2: '#c4a574', speed: 1.8, dy: 2.2, spread: 0.7, life: 0.9, size: 0.28, sizeEnd: 0.45, grav: -2, drag: 0.94, radius: 2.3, a: 0.7, hemisphere: true });
      decal(cx, cz, '#2a2418', 2.1, 2.5, 'mul');
      shake(0.1, 0.4);
    });
    return 3.1;
  },
  nature_heal() {
    const m = metaOf('nature_heal');
    const w = 0.4;
    windup(m.primary, w);
    after(dur(w), () => {
      const t = S.target.position;
      ring(t.x, 0, t.z, m.primary, 2.2, 1.1, 0.3);
      flash(t.x, 1.1, t.z, m.secondary, 2.5, 1.8, 7);
      decal(t.x, t.z, '#88ffaa', 1.3, 2.6, 'add');
      let el = 0;
      onFrame((dt) => {
        el += dt;
        if (el > dur(2.2)) return false;
        const n = S.reduced ? 4 : 9;
        S.add.emit(n, (i, p) => {
          const ang = Math.random() * Math.PI * 2;
          const r = 0.35 + Math.random() * 0.85;
          const x = t.x + Math.cos(ang) * r;
          const z = t.z + Math.sin(ang) * r;
          p.pos(x, 0.1 + Math.random() * 0.2, z);
          p.vel(-Math.sin(ang) * 0.5, 1.15 + Math.random() * 0.7, Math.cos(ang) * 0.5);
          const gold = Math.random() > 0.6;
          p.color(gold ? 0.9 : 0.35, gold ? 1 : 0.95, gold ? 0.55 : 0.5, 0.95);
          p.life(1.0 + Math.random() * 0.5);
          p.size(0.12, 0.04);
          p.drag(0.99); p.grav(0);
        });
        return true;
      });
    });
    return 3.0;
  },
  nature_thorns() {
    const m = metaOf('nature_thorns');
    const w = 0.36;
    windup(m.primary, w);
    after(dur(w), () => {
      const t = S.target.position;
      raiseThorns(t.x, t.z);
      ring(t.x, 0, t.z, m.primary, 2.4, 0.5, 0.3);
      burst(S.add, { n: 28, x: t.x, y: 0.2, z: t.z, color: m.primary, color2: m.secondary, speed: 2.2, dy: 2.6, spread: 0.7, life: 0.6, size: 0.12, grav: -2, radius: 1.6, hemisphere: true });
      burst(S.alpha, { n: 12, x: t.x, y: 0.15, z: t.z, color: '#2a4a20', speed: 1, dy: 1.2, life: 0.8, size: 0.22, grav: -1, a: 0.5, radius: 1.4 });
      flash(t.x, 0.7, t.z, m.primary, 2.2, 0.4, 6);
      shake(0.05, 0.2);
    });
    return 2.45;
  },
  arcane_nova() {
    const m = metaOf('arcane_nova');
    const w = 0.42;
    windup(m.primary, w);
    after(dur(w), () => {
      const t = S.target.position;
      worldChest(S.target, _v2);
      flash(_v2.x, _v2.y, _v2.z, m.primary, 7, 0.55, 12);
      ring(t.x, 0, t.z, m.primary, 4.0, 0.7, 0.2);
      ring(t.x, 0.5, t.z, m.secondary, 2.6, 0.5, 0.15);
      ring(t.x, 1.0, t.z, '#ffffff', 1.6, 0.4, 0.1);
      impactCommon(_v2, m.primary, '#ffffff', { n: 72, speed: 6.2, ring: 3.4, size: 0.2, light: 0 });
      decal(t.x, t.z, '#4a2080', 2.0, 2.2, 'add');
      shake(0.09, 0.28);
    });
    return 2.15;
  },
  portal_open() {
    const m = metaOf('portal_open');
    const w = 0.45;
    windup(m.primary, w);
    after(dur(w), () => {
      openPortal(0, 1.25, 0, m.primary, 'open', 2.9);
      flash(0, 1.25, 0, m.primary, 4, 1.2, 9);
      ring(0, 0, 0, m.primary, 2.4, 0.7, 0.3);
      burst(S.add, { n: 36, x: 0, y: 1.25, z: 0, color: m.primary, color2: '#ffffff', speed: 2.2, dy: 0.2, spread: 1, life: 0.9, size: 0.14, grav: 0, drag: 0.96 });
    });
    return 3.45;
  },
  void_rift() {
    const m = metaOf('void_rift');
    const w = 0.46;
    windup('#8844ff', w);
    after(dur(w), () => {
      const t = S.target.position;
      openPortal(t.x, 1.2, t.z, '#7744cc', 'void', 2.9);
      flash(t.x, 1.2, t.z, '#7722aa', 3.5, 1.4, 8);
      ring(t.x, 0, t.z, '#6622aa', 2.2, 0.7, 0.25);
      decal(t.x, t.z, '#120818', 1.6, 2.6, 'mul');
      let el = 0;
      onFrame((dt) => {
        el += dt;
        if (el > dur(2.3)) return false;
        S.add.emit(pCount(5), (i, p) => {
          const ang = Math.random() * Math.PI * 2;
          const r = 1.4 + Math.random() * 1.4;
          const x = t.x + Math.cos(ang) * r;
          const y = 0.4 + Math.random() * 2.0;
          const z = t.z + Math.sin(ang) * r;
          p.pos(x, y, z);
          p.vel((t.x - x) * 1.3, (1.2 - y) * 1.1, (t.z - z) * 1.3);
          p.color(0.4, 0.15, 0.7, 0.9);
          p.life(0.55); p.size(0.14, 0.02); p.drag(0.98); p.grav(0);
        });
        return true;
      });
    });
    return 3.45;
  },
  fire_slash() {
    const m = metaOf('fire_slash');
    const w = 0.28;
    windup(m.primary, w);
    after(dur(w), () => {
      const c = S.caster.position;
      playSlash(_v1.set(c.x + 0.4, 0, c.z), 1, 0, m.primary, 0.58);
      flash(c.x + 1.2, 1.1, c.z, m.primary, 3.5, 0.3, 6);
      burst(S.add, { n: 28, x: c.x + 1.4, y: 1.1, z: c.z, color: m.primary, color2: m.secondary, speed: 2.4, dy: 0.8, dx: 1.4, spread: 0.6, life: 0.5, size: 0.14, grav: -1.5, hemisphere: true });
    });
    return 1.45;
  },
  frost_slash() {
    const m = metaOf('frost_slash');
    const w = 0.28;
    windup(m.primary, w);
    after(dur(w), () => {
      const c = S.caster.position;
      playSlash(_v1.set(c.x + 0.4, 0, c.z), 1, 0, m.primary, 0.58);
      flash(c.x + 1.2, 1.1, c.z, m.primary, 2.8, 0.3, 6);
      burst(S.add, { n: 26, x: c.x + 1.4, y: 1.1, z: c.z, color: m.primary, color2: '#ffffff', speed: 2.2, dy: 0.5, dx: 1.3, spread: 0.55, life: 0.55, size: 0.11, grav: -0.8, hemisphere: true });
    });
    return 1.45;
  },
  impact_crater() {
    const m = metaOf('impact_crater');
    const w = 0.4;
    windup(m.primary, w);
    after(dur(w), () => {
      const t = S.target.position;
      const from = _v1.set(t.x - 1.2, 7.4, t.z - 0.4).clone();
      const to = _v2.set(t.x, 0.3, t.z).clone();
      launch('meteor', from, to, 0.55, m.primary, (p) => {
        showCrater(p.x, p.z);
        impactCommon(p, m.primary, m.secondary, { n: 80, speed: 6.5, ring: 3.6, size: 0.24, light: 7 });
        burst(S.alpha, { n: 30, x: p.x, y: 0.3, z: p.z, color: '#4a3018', color2: '#2a1a10', speed: 2.4, dy: 2.8, spread: 0.9, life: 1.1, size: 0.4, sizeEnd: 0.7, grav: -3, drag: 0.93, a: 0.65, hemisphere: true, radius: 0.4 });
        decal(p.x, p.z, '#1a0c06', 2.3, 3.0, 'mul');
        ring(p.x, 0, p.z, '#ffaa44', 4.2, 0.7, 0.4);
        shake(0.16, 0.4);
      });
    });
    return 2.55;
  },
  wind_gust() {
    const m = metaOf('wind_gust');
    const w = 0.3;
    windup(m.primary, w);
    after(dur(w), () => {
      const c = S.caster.position;
      const t = S.target.position;
      for (let i = 0; i < 4; i++) {
        after(dur(i * 0.08), () => {
          const x = lerp(c.x + 0.8, t.x + 1.2, i / 3);
          ring(x, 0.05 + i * 0.08, 0, m.primary, 1.6 + i * 0.45, 0.45, 0.25);
        });
      }
      flash((c.x + t.x) * 0.5, 1, 0, m.primary, 2.5, 0.45, 8);
      let el = 0;
      onFrame((dt) => {
        el += dt;
        if (el > dur(0.7)) return false;
        S.add.emit(pCount(8), (i, p) => {
          const y = 0.2 + Math.random() * 1.6;
          const z = (Math.random() - 0.5) * 1.8;
          p.pos(c.x + 0.5, y, c.z + z);
          p.vel(6 + Math.random() * 3, (Math.random() - 0.4) * 0.6, (Math.random() - 0.5) * 0.8);
          p.color(0.75, 0.9, 1, 0.7);
          p.life(0.4 + Math.random() * 0.25);
          p.size(0.1, 0.22);
          p.drag(0.98); p.grav(0);
        });
        return true;
      });
      after(dur(0.22), () => leanTarget(-0.38, 0.7));
    });
    return 1.7;
  },
};

const DURATION = {};
for (const id of Object.keys(CAST)) DURATION[id] = 2.4;
function hidePooled() {
  S.add.clear();
  S.alpha.clear();
  clearJobs();
  for (const m of S.rings) m.visible = false;
  for (const m of S.decals) m.visible = false;
  for (const m of S.lights) { m.visible = false; m.intensity = 0; }
  for (const m of S.bolts) { m.visible = false; if (m.userData.twin) m.userData.twin.visible = false; }
  for (const m of S.jets) m.visible = false;
  for (const B of [S.iceWall, S.earthWall, S.thorns]) {
    if (B) { B.live = false; B.mesh.visible = false; }
  }
  for (const k of Object.keys(S.projs)) S.projs[k].visible = false;
  if (S.slashRibbon) S.slashRibbon.visible = false;
  if (S.portal) S.portal.visible = false;
  if (S.crater) S.crater.visible = false;
  if (S.chargeOrb) S.chargeOrb.visible = false;
  S.shakeT = 0;
  if (S.caster) {
    S.caster.userData.rArm.rotation.set(0, 0, 0);
    S.target.rotation.z = 0;
  }
}

function play(id) {
  if (!CAST[id]) return;
  S.gen++;
  S.current = id;
  hidePooled();
  const len = CAST[id]();
  DURATION[id] = len || 2.4;
  highlight(id);
  const m = metaOf(id);
  document.getElementById('hudName').textContent = m.name;
  document.getElementById('hudDesc').textContent = m.description;
  document.getElementById('live').textContent = 'Casting ' + m.name;
  updateHook();
}

function playNextDemo() {
  const ids = visibleIds();
  if (!ids.length) { stopDemo(); return; }
  S.demoIdx = (S.demoIdx + 1) % ids.length;
  play(ids[S.demoIdx]);
  S.demoWait = dur(DURATION[ids[S.demoIdx]] + 0.45);
}

function startDemo() {
  S.demo = true;
  S.demoIdx = -1;
  const btn = document.getElementById('demoBtn');
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
  btn.textContent = 'Stop Demo';
  playNextDemo();
}
function stopDemo() {
  S.demo = false;
  const btn = document.getElementById('demoBtn');
  btn.classList.remove('active');
  btn.setAttribute('aria-pressed', 'false');
  btn.textContent = 'Demo';
}

function visibleIds() {
  const q = S.query;
  const f = S.filter;
  const out = [];
  for (const s of SHOWCASE) {
    if (f !== 'all' && s.group !== f) continue;
    const m = metaOf(s.id);
    if (q && !(`${m.name} ${m.description} ${m.category} ${(m.tags || []).join(' ')} ${s.id} ${s.group}`).toLowerCase().includes(q)) continue;
    out.push(s.id);
  }
  return out;
}

function buildScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07090f);
  scene.fog = new THREE.FogExp2(0x07090f, 0.024);
  S.scene = scene;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0.15, 3.55, 9.7);
  S.camera = camera;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);
  S.renderer = renderer;

  scene.add(new THREE.HemisphereLight(0x9aafd0, 0x1c1a18, 0.58));
  const key = new THREE.DirectionalLight(0xe8e4dc, 0.88);
  key.position.set(-4, 10, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x6677aa, 0.22);
  fill.position.set(6, 3, -4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x445577, 0.16);
  rim.position.set(0, 4, -8);
  scene.add(rim);

  const plat = new THREE.Mesh(
    new THREE.CylinderGeometry(9.4, 9.6, 0.12, 64),
    new THREE.MeshStandardMaterial({ color: 0x1c2030, roughness: 0.68, metalness: 0.16 })
  );
  plat.position.y = -0.06;
  scene.add(plat);
  S.disposables.push(plat.geometry, plat.material);
  const lip = new THREE.Mesh(
    new THREE.TorusGeometry(9.5, 0.035, 8, 80),
    new THREE.MeshStandardMaterial({ color: 0x2a3144, roughness: 0.45, metalness: 0.4, emissive: 0x10141c, emissiveIntensity: 0.4 })
  );
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 0.01;
  scene.add(lip);
  S.disposables.push(lip.geometry, lip.material);

  const grid = new THREE.GridHelper(16, 16, 0x2a3450, 0x1a2030);
  grid.position.y = 0.005;
  grid.material.transparent = true;
  grid.material.opacity = 0.48;
  grid.material.depthWrite = false;
  scene.add(grid);
  S.disposables.push(grid.geometry, grid.material);

  const mark = new THREE.Mesh(
    new THREE.RingGeometry(1.55, 1.62, 48),
    new THREE.MeshBasicMaterial({ color: 0x3a4560, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
  );
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.015;
  scene.add(mark);
  S.disposables.push(mark.geometry, mark.material);

  S.softTex = makeSoftTex(64);
  S.add = makePool(ADD_N, billboardMat(S.softTex, THREE.AdditiveBlending));
  S.alpha = makePool(ALPHA_N, billboardMat(S.softTex, THREE.NormalBlending));
  S.add.mesh.renderOrder = 5;
  S.alpha.mesh.renderOrder = 4;
  scene.add(S.add.mesh, S.alpha.mesh);
  S.disposables.push(S.add.mesh.geometry, S.add.mesh.material, S.alpha.mesh.geometry, S.alpha.mesh.material, S.softTex);

  makeRings();
  makeDecals();
  makeLights();
  makeBolts();
  makeJets();
  S.iceWall = makeInstancedBlocks('ice', 7,
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshStandardMaterial({ color: 0xc8f4ff, emissive: 0x44bbff, emissiveIntensity: 0.55, roughness: 0.18, metalness: 0.45, transparent: true, opacity: 0.92, toneMapped: false })
  );
  S.earthWall = makeInstancedBlocks('earth', 6,
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x6a5a38, roughness: 0.85, metalness: 0.08, emissive: 0x2a2010, emissiveIntensity: 0.2 })
  );
  makeThorns();
  makePortal();
  makeCrater();
  makeProjectiles();
  makeSlash();

  S.caster = makeDummy({ color: 0x3a4a66, dark: 0x1c2430, emissive: 0x102030, staff: true, yaw: Math.PI / 2, pos: new THREE.Vector3(-3.45, 0, 0), label: 'CASTER' });
  S.target = makeDummy({ color: 0x5a3e3e, dark: 0x2a1c1c, emissive: 0x200808, yaw: -Math.PI / 2, pos: new THREE.Vector3(3.45, 0, 0), label: 'TARGET' });
  const e1 = makeDummy({ color: 0x4a4450, dark: 0x222028, yaw: -Math.PI / 2, pos: new THREE.Vector3(4.25, 0, 2.15), label: 'TARGET 2' });
  const e2 = makeDummy({ color: 0x4a4450, dark: 0x222028, yaw: -Math.PI / 2, pos: new THREE.Vector3(2.85, 0, -2.2), label: 'TARGET 3' });
  e1.scale.setScalar(0.92);
  e2.scale.setScalar(0.88);
  S.extras = [e1, e2];
  worldChest(S.target, S.tA);
  worldChest(e1, S.tB);
  worldChest(e2, S.tC);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.copy(S.camTarget);
  controls.minDistance = 4;
  controls.maxDistance = 24;
  controls.maxPolarAngle = Math.PI / 2 - 0.06;
  controls.minPolarAngle = 0.18;
  controls.enablePan = true;
  S.controls = controls;

  const ro = new ResizeObserver((entries) => {
    const cr = entries[0].contentRect;
    const w = Math.max(1, cr.width);
    const h = Math.max(1, cr.height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  });
  S.resizeObserver = ro;
  ro.observe(container);
  const r = container.getBoundingClientRect();
  camera.aspect = Math.max(1, r.width) / Math.max(1, r.height);
  camera.updateProjectionMatrix();
  renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
  return renderer;
}

function tick() {
  if (S.paused) return;
  const wall = performance.now() * 0.001;
  const dt = S.clock ? Math.min(0.05, wall - S.clock) : 0.016;
  S.clock = wall;
  S.lastT += dt;

  for (let i = 0; i < JOB_N; i++) {
    const j = S.jobs[i];
    if (j.alive && S.lastT >= j.at) { j.alive = false; j.fn(); }
  }
  for (let i = 0; i < S.frames.length; i++) {
    const f = S.frames[i];
    if (!f.alive) continue;
    const keep = f.fn(dt);
    if (keep === false) { f.alive = false; S.frameN--; }
  }

  S.add.update(dt);
  S.alpha.update(dt);
  updateRings(dt);
  updateDecals(dt);
  updateLights(dt);
  updateBolts(dt);
  updateJets(dt);
  updateBlocks(S.iceWall, dt);
  updateBlocks(S.earthWall, dt);
  updateBlocks(S.thorns, dt);
  updatePortal(dt);
  updateCrater(dt);

  if (S.shakeT > 0) {
    S.shakeT -= dt;
    const a = S.shakeAmp * (S.shakeT > 0 ? S.shakeT * 8 : 0);
    S.camera.position.x += (Math.random() - 0.5) * a;
    S.camera.position.y += (Math.random() - 0.5) * a * 0.5;
  }

  if (S.demo) {
    S.demoWait -= dt;
    if (S.demoWait <= 0) playNextDemo();
  }

  S.controls.update();
  S.renderer.render(S.scene, S.camera);
  if ((S.lastT * 4 | 0) !== ((S.lastT - dt) * 4 | 0)) updateHook();
}

function setPaused(p) {
  S.paused = p;
  if (!S.renderer || S.tornDown) return;
  if (p) S.renderer.setAnimationLoop(null);
  else {
    S.clock = performance.now() * 0.001;
    S.renderer.setAnimationLoop(tick);
  }
}

function teardown() {
  if (S.tornDown) return;
  S.tornDown = true;
  S.paused = true;
  if (S.renderer) S.renderer.setAnimationLoop(null);
  if (S.resizeObserver) {
    S.resizeObserver.disconnect();
    S.resizeObserver = null;
  }
  if (S.controls && typeof S.controls.dispose === 'function') {
    S.controls.dispose();
    S.controls = null;
  }
  const list = S.disposables || [];
  for (let i = 0; i < list.length; i++) {
    const d = list[i];
    if (d && typeof d.dispose === 'function') {
      try { d.dispose(); } catch (e) { /* already disposed */ }
    }
  }
  S.disposables.length = 0;
  if (S.renderer) {
    try { S.renderer.dispose(); } catch (e) {}
    if (typeof S.renderer.forceContextLoss === 'function') {
      try { S.renderer.forceContextLoss(); } catch (e) {}
    }
    const el = S.renderer.domElement;
    if (el && el.parentNode) el.parentNode.removeChild(el);
    S.renderer = null;
  }
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function copyApiUrl(id) {
  const url = `${location.origin}${location.pathname.replace('spell-vfx-library.html', '')}api/v1/vfx-spells.json#${id}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => toast('Copied: ' + url)).catch(() => toast('Copy failed — check clipboard permissions'));
  } else {
    toast('Copied: ' + url);
  }
}

function highlight(id) {
  document.querySelectorAll('.card').forEach((c) => {
    const on = c.dataset.id === id;
    c.classList.toggle('active', on);
    if (on) c.scrollIntoView({ block: 'nearest', behavior: S.reduced ? 'auto' : 'smooth' });
  });
}

function renderList() {
  const list = document.getElementById('list');
  const q = S.query;
  const f = S.filter;
  let html = '';
  let shown = 0;
  for (const g of GROUPS) {
    if (f !== 'all' && f !== g.id) continue;
    const items = SHOWCASE.filter((s) => {
      if (s.group !== g.id) return false;
      const m = metaOf(s.id);
      if (q && !(`${m.name} ${m.description} ${m.category} ${(m.tags || []).join(' ')} ${s.id}`).toLowerCase().includes(q)) return false;
      return true;
    });
    if (!items.length) continue;
    html += `<div class="group-label">${esc(g.label)} — ${esc(g.blurb)}</div>`;
    for (const s of items) {
      const m = metaOf(s.id);
      const col = CAT_COLOR[m.category] || '#888';
      html += `<div class="card${S.current === s.id ? ' active' : ''}" role="option" data-id="${esc(s.id)}" style="--cat:${esc(col)}" tabindex="0">
        <div class="card-swatch"></div>
        <div class="card-body">
          <div class="card-row"><span class="card-name">${esc(m.name)}</span><span class="card-cat">${esc(m.category)}</span></div>
          <div class="card-desc">${esc(m.description)}</div>
          <div class="card-foot"><button type="button" data-copy="${esc(s.id)}">Copy API URL</button></div>
        </div>
      </div>`;
      shown++;
    }
  }
  if (!shown) html = '<div class="empty">No spells match that filter.</div>';
  list.innerHTML = html;
  document.getElementById('stats').textContent = `Showing ${shown} of ${SHOWCASE.length} showcase spells · ${Object.keys(S.api).length || 26} in API`;
}

function bindUI() {
  const chips = document.getElementById('chips');
  const cats = [{ id: 'all', label: 'All' }, ...GROUPS.map((g) => ({ id: g.id, label: g.label }))];
  chips.innerHTML = cats.map((c, i) => `<button type="button" class="chip${i === 0 ? ' active' : ''}" data-filter="${esc(c.id)}">${esc(c.label)}</button>`).join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    S.filter = b.dataset.filter;
    chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === b));
    renderList();
  });
  document.getElementById('search').addEventListener('input', (e) => {
    S.query = e.target.value.toLowerCase();
    renderList();
  });
  document.getElementById('list').addEventListener('click', (e) => {
    const copy = e.target.closest('[data-copy]');
    if (copy) { e.stopPropagation(); copyApiUrl(copy.dataset.copy); return; }
    const card = e.target.closest('.card');
    if (!card) return;
    if (S.demo) stopDemo();
    play(card.dataset.id);
  });
  document.getElementById('list').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.card');
    if (!card) return;
    e.preventDefault();
    play(card.dataset.id);
  });
  document.getElementById('demoBtn').addEventListener('click', () => { if (S.demo) stopDemo(); else startDemo(); });
  document.getElementById('replayBtn').addEventListener('click', () => { if (S.current) play(S.current); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (S.demo) stopDemo(); return; }
    if (e.key === ' ' && e.target === document.body) { e.preventDefault(); if (S.current) play(S.current); }
  });
}

function updateHook() {
  const info = S.renderer ? S.renderer.info.render : { calls: 0, triangles: 0 };
  const live = (S.add ? S.add.live() : 0) + (S.alpha ? S.alpha.live() : 0);
  const meta = document.getElementById('hudMeta');
  if (meta) {
    meta.textContent = `draw ${info.calls} · particles ${live}/${ADD_N + ALPHA_N}\n${S.reduced ? 'reduced motion\n' : ''}${S.demo ? 'demo playing' : ''}`;
  }
  window.__SPELLVFX__ = {
    ready: true,
    webgl: !!(S.renderer && S.renderer.getContext()),
    currentSpell: S.current,
    demo: S.demo,
    reduced: S.reduced,
    play,
    startDemo,
    stopDemo,
    group: S.filter,
    setFilter: (f) => { S.filter = f; renderList(); },
    ids: SHOWCASE.map((s) => s.id),
    info: {
      drawCalls: info.calls,
      triangles: info.triangles,
      liveParticles: live,
      pool: ADD_N + ALPHA_N,
      pixelRatio: S.renderer ? S.renderer.getPixelRatio() : 0,
    },
  };
}

async function loadApi() {
  try {
    const res = await fetch(SPELLS_URL);
    const data = await res.json();
    S.api = data.spells || {};
  } catch (err) {
    console.warn('vfx-spells.json failed, using fallback names', err);
    S.api = {};
    toast('Spell API failed to load — using built-in names');
  }
}

async function init() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  S.reduced = mq.matches;
  mq.addEventListener('change', (e) => { S.reduced = e.matches; updateHook(); });

  await loadApi();
  bindUI();
  renderList();

  const wrap = document.getElementById('stage');
  try {
    buildScene(wrap);
  } catch (err) {
    console.error(err);
    document.getElementById('hudName').textContent = 'WebGL failed';
    document.getElementById('hudDesc').textContent = String(err && err.message ? err.message : err);
    window.__SPELLVFX__ = { ready: false, webgl: false, error: String(err) };
    return;
  }

  document.addEventListener('visibilitychange', () => setPaused(document.hidden));
  window.addEventListener('pagehide', teardown);
  window.addEventListener('beforeunload', teardown);
  setPaused(false);
  updateHook();
  after(0.15, () => play('fireball'));
}

init();
