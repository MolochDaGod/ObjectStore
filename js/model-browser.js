/**
 * model-browser.js — Grudge Pipeline Model Browser v2.1
 * 337 real GLBs served from GitHub Pages · R2 primary when uploaded
 * Characters: soldier.glb (4 anims), male_base.glb (1 anim), female_base.glb (1 anim)
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ── CDN priority order ─────────────────────────────────
const R2_CDN_URL   = 'https://assets.grudge-studio.com';
const GHPAGES_BASE = 'https://molochdagod.github.io/ObjectStore';
const DRACO_PATH   = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const REGISTRY_URLS = [
  './api/v1/models3d.json',
  `${GHPAGES_BASE}/api/v1/models3d.json`,
];

const PAGE_SIZE = 60;

// ── Featured models (animated characters) ─────────────
const FEATURED = [
  { name: 'Soldier', url: `${GHPAGES_BASE}/models/characters/soldier.glb`,   sizeKB: 2110, category: 'characters', animations: 4 },
  { name: 'Male Base Rig', url: `${GHPAGES_BASE}/models/characters/male_base.glb`, sizeKB: 479, category: 'characters', animations: 1 },
  { name: 'Female Base', url: `${GHPAGES_BASE}/models/characters/female_base.glb`, sizeKB: 15, category: 'characters', animations: 1 },
];

// ── State ──────────────────────────────────────────────
let registry = null;
let allModels = [];
let filteredModels = [];
let activeCategory = null;
let currentPage = 0;
let r2Available = false;

let scene, camera, renderer, controls, mixer, clock, currentModel;
let wireframeMode = false;
let autoRotate = true;

const _dracoLoader = new DRACOLoader();
_dracoLoader.setDecoderPath(DRACO_PATH);

// ── URL resolution ─────────────────────────────────────
function modelUrlCandidates(m) {
  const urls = [];
  // 1. Explicit verified CDN URL (v2 manifest has this for all 337 models)
  if (m._cdnUrl) urls.push(m._cdnUrl);
  // 2. R2 primary (if model has been uploaded)
  urls.push(`${R2_CDN_URL}/${encPath(m.path)}`);
  // 3. GitHub Pages fallback with _optimized stripped
  const cleanPath = m.path.replace('models/_optimized/', 'models/');
  urls.push(`${GHPAGES_BASE}/${encPath(cleanPath)}`);
  urls.push(`${GHPAGES_BASE}/${encPath(m.path)}`);
  return [...new Set(urls)];
}

function encPath(p) { return p.split('/').map(s => encodeURIComponent(s)).join('/'); }

async function resolveModelUrl(m) {
  for (const url of modelUrlCandidates(m)) {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
      if (r.ok) return url;
    } catch { /* next */ }
  }
  return modelUrlCandidates(m)[0];
}

// ── R2 Health ──────────────────────────────────────────
async function checkR2() {
  const el = document.getElementById('r2Status');
  if (!el) return;
  try {
    const r = await fetch(`${R2_CDN_URL}/branding/favicons/grudge-icon-32x32.png`,
      { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    if (r.ok) { r2Available = true; el.className = 'r2-status online'; el.innerHTML = '<span class="r2-dot"></span> R2 Online'; return; }
  } catch {}
  el.className = 'r2-status offline'; el.innerHTML = '<span class="r2-dot"></span> R2 Offline — GitHub Pages active';
}

// ── Load Registry ──────────────────────────────────────
async function loadRegistry() {
  for (const url of REGISTRY_URLS) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        registry = await r.json();
        allModels = (registry.models || []).map(m => { m.path = (m.path || '').replace(/\\/g, '/'); return m; });
        console.log(`Loaded ${allModels.length} models from ${url}`);
        return;
      }
    } catch {}
  }
  allModels = [];
}

// ── Stats ──────────────────────────────────────────────
function updateStats() {
  const el = document.getElementById('totalModels');
  if (el) el.textContent = allModels.length || '0';
  const catEl = document.getElementById('totalCategories');
  if (catEl) catEl.textContent = Object.keys(registry?.byCategory || {}).length;
  const kb = allModels.reduce((s, m) => s + (m.sizeKB || 0), 0);
  const szEl = document.getElementById('totalSize');
  if (szEl) szEl.textContent = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

// ── Featured strip ─────────────────────────────────────
function renderFeatured() {
  const strip = document.getElementById('featuredStrip');
  if (!strip) return;
  strip.innerHTML = `
    <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:10px">
      ⚔ Featured — Animated Characters
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${FEATURED.map(f => `
        <div onclick="window._loadFeatured(${JSON.stringify(f).replace(/"/g,'&quot;')})"
          style="cursor:pointer;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:8px;padding:10px 14px;
                 transition:border-color .2s;min-width:160px"
          onmouseover="this.style.borderColor='#22c55e'" onmouseout="this.style.borderColor='#2a2a4a'">
          <div style="font-size:.8rem;font-weight:700;color:#e8e8e8;margin-bottom:4px">${f.name}</div>
          <div style="font-size:.7rem;color:#888">${f.sizeKB} KB · ${f.animations} anim${f.animations !== 1 ? 's' : ''}</div>
          <div style="font-size:.65rem;color:#22c55e;margin-top:4px">▶ Load in viewer</div>
        </div>`).join('')}
    </div>`;
}

window._loadFeatured = async (f) => {
  if (!renderer) initViewer();
  document.getElementById('viewerOverlay').classList.add('active');
  document.getElementById('viewerTitle').textContent = f.name;
  document.getElementById('viewerInfo').textContent = `${f.sizeKB} KB · ${f.category}`;
  document.body.style.overflow = 'hidden';
  const le = document.getElementById('viewerLoading');
  if (le) { le.innerHTML = '<div class="spinner"></div><p>Loading character…</p>'; le.style.display = 'block'; }
  setTimeout(() => { if (renderer) { const w = document.getElementById('viewerCanvasWrap'); renderer.setSize(w.clientWidth, w.clientHeight); } }, 50);
  await loadByUrl(f.url, f);
};

// ── Filters ────────────────────────────────────────────
function renderCategoryFilters() {
  const row = document.getElementById('categoryFilters');
  if (!row) return;
  const cats = {};
  allModels.forEach(m => { const c = m.category || 'uncategorized'; cats[c] = (cats[c] || 0) + 1; });
  let html = `<button class="filter-btn ${!activeCategory ? 'active' : ''}" onclick="window._filterCategory(null)">All (${allModels.length})</button>`;
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
    html += `<button class="filter-btn ${activeCategory === c ? 'active' : ''}" onclick="window._filterCategory('${c}')">${c} (${n})</button>`;
  });
  row.innerHTML = html;
}

function applyFilters() {
  const q = (document.getElementById('searchBox')?.value || '').toLowerCase().trim();
  filteredModels = allModels.filter(m => {
    if (activeCategory && (m.category || 'uncategorized') !== activeCategory) return false;
    if (q && !m.name.toLowerCase().includes(q) && !(m.category || '').toLowerCase().includes(q)) return false;
    return true;
  });
  currentPage = 0;
  renderPage();
  const rt = document.getElementById('resultsTitle');
  if (rt) rt.textContent = activeCategory || 'All Models';
}

// ── Grid ───────────────────────────────────────────────
function renderPage() {
  const ld = document.getElementById('loadingState'); if (ld) ld.style.display = 'none';
  const em = document.getElementById('emptyState');
  const ra = document.getElementById('resultsArea');
  if (!filteredModels.length) { if (ra) ra.style.display = 'none'; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none'; if (ra) ra.style.display = 'block';
  const rc = document.getElementById('resultsCount');
  if (rc) rc.textContent = `${filteredModels.length} models`;
  const s = currentPage * PAGE_SIZE, e = Math.min(s + PAGE_SIZE, filteredModels.length);
  const grid = document.getElementById('modelGrid');
  if (!grid) return;
  grid.innerHTML = filteredModels.slice(s, e).map((m, i) => {
    const idx = s + i;
    const info = [m.meshes ? `${m.meshes} mesh` : '', m.animations ? `${m.animations} anim` : '', m.sizeKB ? (m.sizeKB < 1024 ? `${m.sizeKB} KB` : `${(m.sizeKB / 1024).toFixed(1)} MB`) : ''].filter(Boolean).join(' · ');
    const animBadge = m.animations ? `<span style="position:absolute;top:6px;left:6px;padding:1px 5px;border-radius:3px;font-size:.55rem;background:#22c55e;color:#000;font-weight:700">▶ ANIM</span>` : '';
    return `<div class="model-card" data-idx="${idx}">
      <div class="model-icon">
        <span class="format-badge">${m.format || 'GLB'}</span>
        <span class="category-badge">${m.category || ''}</span>
        ${animBadge}
        <svg viewBox="0 0 80 80" style="width:55%;height:55%;opacity:.4"><polygon points="40,8 72,24 72,56 40,72 8,56 8,24" fill="none" stroke="#22c55e" stroke-width="1.5"/><polygon points="40,8 72,24 40,40 8,24" fill="#22c55e" opacity=".15"/><polygon points="40,40 72,24 72,56 40,72" fill="#22c55e" opacity=".25"/><polygon points="40,40 8,24 8,56 40,72" fill="#22c55e" opacity=".1"/></svg>
      </div>
      <div class="model-name" title="${esc(m.name)}">${esc(m.name)}</div>
      <div class="model-meta">${esc(info)}</div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.model-card').forEach(c => c.addEventListener('click', () => { const m = filteredModels[+c.dataset.idx]; if (m) openAndLoad(m); }));
  renderPagination();
}

function renderPagination() {
  const el = document.getElementById('pagination'); if (!el) return;
  const tp = Math.ceil(filteredModels.length / PAGE_SIZE); if (tp <= 1) { el.innerHTML = ''; return; }
  let h = `<button class="page-btn" ${currentPage === 0 ? 'disabled' : ''} data-p="0">«</button><button class="page-btn" ${currentPage === 0 ? 'disabled' : ''} data-p="${currentPage - 1}">‹</button>`;
  const sp = Math.max(0, currentPage - 3), ep = Math.min(tp, sp + 7);
  for (let p = sp; p < ep; p++) h += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-p="${p}">${p + 1}</button>`;
  h += `<button class="page-btn" ${currentPage >= tp - 1 ? 'disabled' : ''} data-p="${currentPage + 1}">›</button><button class="page-btn" ${currentPage >= tp - 1 ? 'disabled' : ''} data-p="${tp - 1}">»</button>`;
  el.innerHTML = h;
  el.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => { const p = +b.dataset.p, t = Math.ceil(filteredModels.length / PAGE_SIZE); if (p >= 0 && p < t) { currentPage = p; renderPage(); } }));
}

function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ── Three.js Viewer ────────────────────────────────────
function initViewer() {
  const w = document.getElementById('viewerCanvasWrap'); if (!w || w.querySelector('canvas')) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d1a);
  // Environment: subtle gradient fog
  scene.fog = new THREE.FogExp2(0x0d0d1a, 0.04);

  camera = new THREE.PerspectiveCamera(50, w.clientWidth / w.clientHeight, 0.01, 1000);
  camera.position.set(0, 1.5, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w.clientWidth, w.clientHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  w.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 1.5;

  // Lighting rig
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xfff5e0, 2.0);
  key.position.set(4, 6, 4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8888ff, 0.6);
  fill.position.set(-4, 2, -2); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd4af37, 0.4);
  rim.position.set(0, 3, -5); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0x8899cc, 0x443322, 0.4));

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x111120, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  scene.add(new THREE.GridHelper(10, 10, 0x222244, 0x1a1a33));

  clock = new THREE.Clock();
  (function anim() {
    requestAnimationFrame(anim);
    if (mixer) mixer.update(clock.getDelta());
    controls.update();
    renderer.render(scene, camera);
  })();

  new ResizeObserver(() => {
    if (!w.clientWidth) return;
    camera.aspect = w.clientWidth / w.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(w.clientWidth, w.clientHeight);
  }).observe(w);
}

async function loadByUrl(url, entry) {
  if (currentModel) {
    scene.remove(currentModel);
    currentModel.traverse(o => {
      if (o.isMesh) {
        o.geometry?.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m?.dispose());
      }
    });
    currentModel = null;
  }
  if (mixer) { mixer.stopAllAction(); mixer = null; }

  const loader = new GLTFLoader(); loader.setDRACOLoader(_dracoLoader);
  const le = document.getElementById('viewerLoading'); if (le) le.style.display = 'block';

  try {
    const gltf = await loader.loadAsync(url);
    currentModel = gltf.scene;
    currentModel.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(currentModel);

    const box = new THREE.Box3().setFromObject(currentModel);
    const ctr = box.getCenter(new THREE.Vector3());
    const sz = box.getSize(new THREE.Vector3());
    const mx = Math.max(sz.x, sz.y, sz.z) || 1;

    // Center on ground
    currentModel.position.y -= box.min.y;
    camera.position.set(ctr.x, ctr.y + mx * 0.4, ctr.z + mx * 1.8);
    controls.target.set(ctr.x, ctr.y, ctr.z);

    const sel = document.getElementById('animSelect');
    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(currentModel);
      if (sel) {
        sel.style.display = 'inline-block';
        sel.innerHTML = '<option value="">— Animations —</option>' +
          gltf.animations.map((a, i) => `<option value="${i}">${a.name || 'Clip ' + i}</option>`).join('');
      }
      mixer.clipAction(gltf.animations[0]).play();
      if (sel) sel.value = '0';
    } else {
      if (sel) sel.style.display = 'none';
    }
    window._currentAnimations = gltf.animations;

    const vi = document.getElementById('viewerInfo');
    if (vi) vi.textContent = `${entry?.sizeKB || '?'} KB · ${gltf.scene.children.length} nodes · ${gltf.animations.length} anims`;
    if (le) le.style.display = 'none';
  } catch (e) {
    console.error('Load failed:', url, e);
    if (le) {
      le.innerHTML = `<div style="text-align:center;padding:40px">
        <div style="font-size:3rem;opacity:.3">⚠</div>
        <p style="color:#ef4444;margin:8px 0">Failed to load model</p>
        <p style="color:#8888a0;font-size:.8rem;max-width:400px;margin:0 auto">${esc(e.message)}</p>
        <p style="color:#8888a0;font-size:.7rem;margin-top:8px">${esc(url.substring(0, 120))}</p>
      </div>`;
      le.style.display = 'block';
    }
  }
}

async function openAndLoad(m) {
  if (!renderer) initViewer();
  document.getElementById('viewerOverlay').classList.add('active');
  document.getElementById('viewerTitle').textContent = m.name;
  document.getElementById('viewerInfo').textContent = `${m.format || 'GLB'} · ${m.category || ''}`;
  document.body.style.overflow = 'hidden';
  const le = document.getElementById('viewerLoading');
  if (le) { le.innerHTML = '<div class="spinner"></div><p>Resolving model…</p>'; le.style.display = 'block'; }
  setTimeout(() => { if (renderer) { const w = document.getElementById('viewerCanvasWrap'); renderer.setSize(w.clientWidth, w.clientHeight); } }, 50);
  const url = await resolveModelUrl(m);
  if (le) le.innerHTML = '<div class="spinner"></div><p>Loading model…</p>';
  await loadByUrl(url, m);
}

// ── Drag & Drop ────────────────────────────────────────
function setupDragDrop() {
  const dz = document.getElementById('dropZone'), fi = document.getElementById('fileInput'); if (!dz) return;
  dz.addEventListener('click', () => fi?.click());
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-over'); if (e.dataTransfer.files[0]) loadLocal(e.dataTransfer.files[0]); });
  if (fi) fi.addEventListener('change', () => { if (fi.files[0]) loadLocal(fi.files[0]); });
}

function loadLocal(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'glb' && ext !== 'gltf') { alert('Only GLB/GLTF can be previewed. Run scripts/fbx2glb.mjs to convert ' + ext.toUpperCase() + ' files.'); return; }
  if (!renderer) initViewer();
  document.getElementById('viewerOverlay').classList.add('active');
  document.getElementById('viewerTitle').textContent = file.name;
  document.getElementById('viewerInfo').textContent = `Local · ${(file.size / 1024).toFixed(0)} KB`;
  document.body.style.overflow = 'hidden';
  setTimeout(() => { if (renderer) { const w = document.getElementById('viewerCanvasWrap'); renderer.setSize(w.clientWidth, w.clientHeight); } }, 50);
  loadByUrl(URL.createObjectURL(file), { sizeKB: Math.round(file.size / 1024) });
}

// ── Global handlers ────────────────────────────────────
window._filterCategory = c => { activeCategory = c; renderCategoryFilters(); applyFilters(); };
window.closeViewer = () => {
  document.getElementById('viewerOverlay').classList.remove('active');
  document.body.style.overflow = '';
  if (currentModel) { scene.remove(currentModel); currentModel = null; }
  if (mixer) { mixer.stopAllAction(); mixer = null; }
};
window.toggleWireframe = () => {
  wireframeMode = !wireframeMode;
  if (currentModel) currentModel.traverse(o => { if (o.isMesh && o.material) o.material.wireframe = wireframeMode; });
};
window.toggleAutoRotate = () => { autoRotate = !autoRotate; if (controls) controls.autoRotate = autoRotate; };
window.playAnimation = v => {
  if (!mixer || !window._currentAnimations) return;
  mixer.stopAllAction();
  const i = parseInt(v);
  if (!isNaN(i) && window._currentAnimations[i]) mixer.clipAction(window._currentAnimations[i]).play();
};
document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closeViewer(); });

// ── Init ───────────────────────────────────────────────
async function init() {
  const r2p = checkR2();
  await loadRegistry();
  updateStats(); renderCategoryFilters(); applyFilters(); renderFeatured(); setupDragDrop();
  document.getElementById('searchBox')?.addEventListener('input', () => applyFilters());
  await r2p;
}
init();
