/**
 * model-browser.js — Grudge Pipeline Model Browser
 * Loads models3d.json, renders filterable grid with pagination,
 * opens Three.js GLB viewer with R2 CDN fallback chain.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ── CDN & Registry URLs ────────────────────────────────
const R2_CDN_URL = 'https://assets.grudge-studio.com';
const R2_WORKER_URLS = [
  'https://grudgeassets.grudge.workers.dev',
  'https://objectstore.grudge-studio.com',
];
const GITHACK_BASE = 'https://raw.githack.com/molochdagod/ObjectStore/main';
const GHPAGES_BASE = 'https://molochdagod.github.io/ObjectStore';
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const REGISTRY_URLS = [
  './api/v1/models3d.json',
  `${GHPAGES_BASE}/api/v1/models3d.json`,
];

const PAGE_SIZE = 60;

// ── State ──────────────────────────────────────────────
let registry = null;
let allModels = [];
let filteredModels = [];
let activeCategory = null;
let currentPage = 0;
let r2WorkerUrl = null;
let r2Available = false;

let scene, camera, renderer, controls, mixer, clock, currentModel;
let wireframeMode = false;
let autoRotate = true;

// ── URL helpers ────────────────────────────────────────
function encPath(p) { return p.split('/').map(s => encodeURIComponent(s)).join('/'); }

function modelUrlCandidates(m) {
  const urls = [];
  if (m._cdnUrl) urls.push(m._cdnUrl);
  urls.push(`${R2_CDN_URL}/${encPath(m.path)}`);
  if (r2Available && r2WorkerUrl) urls.push(`${r2WorkerUrl}/v1/assets/${encodeURIComponent(m.path)}/file`);
  urls.push(`${GITHACK_BASE}/${encPath(m.path)}`);
  urls.push(`${GHPAGES_BASE}/${encPath(m.path)}`);
  return urls;
}

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
  for (const url of R2_WORKER_URLS) {
    try {
      const r = await fetch(`${url}/v1/health`, { signal: AbortSignal.timeout(5000) });
      if (r.ok) { r2WorkerUrl = url; r2Available = true; el.className = 'r2-status online'; el.innerHTML = '<span class="r2-dot"></span> R2 Online'; return; }
    } catch {}
  }
  el.className = 'r2-status offline'; el.innerHTML = '<span class="r2-dot"></span> R2 Offline';
}

// ── Load Registry ──────────────────────────────────────
async function loadRegistry() {
  for (const url of REGISTRY_URLS) {
    try {
      const r = await fetch(url);
      if (r.ok) { registry = await r.json(); allModels = (registry.models||[]).map(m => { m.path = (m.path||'').replace(/\\/g,'/'); return m; }); console.log(`Loaded ${allModels.length} models from ${url}`); return; }
    } catch {}
  }
  allModels = [];
}

// ── Stats ──────────────────────────────────────────────
function updateStats() {
  document.getElementById('totalModels').textContent = allModels.length || '0';
  document.getElementById('totalCategories').textContent = Object.keys(registry?.byCategory || {}).length;
  const kb = allModels.reduce((s, m) => s + (m.sizeKB||0), 0);
  document.getElementById('totalSize').textContent = kb > 1024 ? `${(kb/1024).toFixed(1)} MB` : `${kb} KB`;
}

// ── Filters ────────────────────────────────────────────
function renderCategoryFilters() {
  const row = document.getElementById('categoryFilters');
  const cats = {};
  allModels.forEach(m => { const c = m.category||'uncategorized'; cats[c] = (cats[c]||0)+1; });
  let html = `<button class="filter-btn ${!activeCategory?'active':''}" onclick="window._filterCategory(null)">All (${allModels.length})</button>`;
  Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([c,n]) => {
    html += `<button class="filter-btn ${activeCategory===c?'active':''}" onclick="window._filterCategory('${c}')">${c} (${n})</button>`;
  });
  row.innerHTML = html;
}

function applyFilters() {
  const q = (document.getElementById('searchBox')?.value||'').toLowerCase().trim();
  filteredModels = allModels.filter(m => {
    if (activeCategory && (m.category||'uncategorized') !== activeCategory) return false;
    if (q && !m.name.toLowerCase().includes(q) && !(m.category||'').toLowerCase().includes(q)) return false;
    return true;
  });
  currentPage = 0; renderPage();
  document.getElementById('resultsTitle').textContent = activeCategory || 'All Models';
}

// ── Grid ───────────────────────────────────────────────
function renderPage() {
  const ld = document.getElementById('loadingState'); if (ld) ld.style.display = 'none';
  const em = document.getElementById('emptyState');
  const ra = document.getElementById('resultsArea');
  if (!filteredModels.length) { if(ra)ra.style.display='none'; if(em)em.style.display='block'; return; }
  if(em)em.style.display='none'; if(ra)ra.style.display='block';
  document.getElementById('resultsCount').textContent = `${filteredModels.length} models`;
  const s = currentPage*PAGE_SIZE, e = Math.min(s+PAGE_SIZE, filteredModels.length);
  const grid = document.getElementById('modelGrid');
  grid.innerHTML = filteredModels.slice(s,e).map((m,i) => {
    const idx = s+i;
    const info = [m.meshes?`${m.meshes} mesh`:'', m.animations?`${m.animations} anim`:'', m.sizeKB?(m.sizeKB<1024?`${m.sizeKB} KB`:`${(m.sizeKB/1024).toFixed(1)} MB`):''].filter(Boolean).join(' · ');
    const draco = m.compressionType==='draco'?'<span style="position:absolute;bottom:6px;right:6px;padding:1px 5px;border-radius:3px;font-size:.55rem;background:#6366f1;color:#fff;font-weight:700">DRACO</span>':'';
    return `<div class="model-card" data-idx="${idx}"><div class="model-icon"><span class="format-badge">${m.format||'GLB'}</span><span class="category-badge">${m.category||''}</span>${draco}<svg viewBox="0 0 80 80" style="width:55%;height:55%;opacity:.4"><polygon points="40,8 72,24 72,56 40,72 8,56 8,24" fill="none" stroke="#22c55e" stroke-width="1.5"/><polygon points="40,8 72,24 40,40 8,24" fill="#22c55e" opacity=".15"/><polygon points="40,40 72,24 72,56 40,72" fill="#22c55e" opacity=".25"/><polygon points="40,40 8,24 8,56 40,72" fill="#22c55e" opacity=".1"/></svg></div><div class="model-name" title="${esc(m.name)}">${esc(m.name)}</div><div class="model-meta">${esc(info)}</div></div>`;
  }).join('');
  grid.querySelectorAll('.model-card').forEach(c => c.addEventListener('click', () => { const m = filteredModels[+c.dataset.idx]; if(m) openAndLoad(m); }));
  renderPagination();
}

function renderPagination() {
  const el = document.getElementById('pagination'); if(!el) return;
  const tp = Math.ceil(filteredModels.length/PAGE_SIZE); if(tp<=1){el.innerHTML='';return;}
  let h = `<button class="page-btn" ${currentPage===0?'disabled':''} data-p="0">«</button><button class="page-btn" ${currentPage===0?'disabled':''} data-p="${currentPage-1}">‹</button>`;
  const sp=Math.max(0,currentPage-3), ep=Math.min(tp,sp+7);
  for(let p=sp;p<ep;p++) h+=`<button class="page-btn ${p===currentPage?'active':''}" data-p="${p}">${p+1}</button>`;
  h+=`<button class="page-btn" ${currentPage>=tp-1?'disabled':''} data-p="${currentPage+1}">›</button><button class="page-btn" ${currentPage>=tp-1?'disabled':''} data-p="${tp-1}">»</button>`;
  el.innerHTML=h;
  el.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => { const p=+b.dataset.p,t=Math.ceil(filteredModels.length/PAGE_SIZE); if(p>=0&&p<t){currentPage=p;renderPage();} }));
}

function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ── Three.js Viewer ────────────────────────────────────
function initViewer() {
  const w = document.getElementById('viewerCanvasWrap'); if(w.querySelector('canvas')) return;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x111122);
  camera = new THREE.PerspectiveCamera(50, w.clientWidth/w.clientHeight, 0.01, 1000); camera.position.set(0,1.5,3);
  renderer = new THREE.WebGLRenderer({antialias:true}); renderer.setSize(w.clientWidth,w.clientHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.2; w.appendChild(renderer.domElement);
  controls = new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.autoRotate=autoRotate;
  scene.add(new THREE.AmbientLight(0xffffff,0.6)); const dl=new THREE.DirectionalLight(0xffffff,1.2); dl.position.set(3,5,4); scene.add(dl); scene.add(new THREE.HemisphereLight(0x8888ff,0x443322,0.5)); scene.add(new THREE.GridHelper(10,10,0x333355,0x222244));
  clock = new THREE.Clock();
  (function anim(){requestAnimationFrame(anim);if(mixer)mixer.update(clock.getDelta());controls.update();renderer.render(scene,camera);})();
  new ResizeObserver(()=>{if(!w.clientWidth)return;camera.aspect=w.clientWidth/w.clientHeight;camera.updateProjectionMatrix();renderer.setSize(w.clientWidth,w.clientHeight);}).observe(w);
}

async function loadByUrl(url, entry) {
  if(currentModel){scene.remove(currentModel);currentModel=null;} if(mixer){mixer.stopAllAction();mixer=null;}
  const loader=new GLTFLoader(); const dr=new DRACOLoader(); dr.setDecoderPath(DRACO_PATH); loader.setDRACOLoader(dr);
  const le=document.getElementById('viewerLoading'); if(le)le.style.display='block';
  try {
    const gltf=await loader.loadAsync(url); currentModel=gltf.scene; scene.add(currentModel);
    const box=new THREE.Box3().setFromObject(currentModel), ctr=box.getCenter(new THREE.Vector3()), sz=box.getSize(new THREE.Vector3()), mx=Math.max(sz.x,sz.y,sz.z)||1;
    camera.position.set(ctr.x,ctr.y+mx*.5,ctr.z+mx*1.5); controls.target.copy(ctr);
    const sel=document.getElementById('animSelect');
    if(gltf.animations.length){mixer=new THREE.AnimationMixer(currentModel);sel.style.display='inline-block';sel.innerHTML='<option value="">— Animations —</option>'+gltf.animations.map((a,i)=>`<option value="${i}">${a.name||'Clip '+i}</option>`).join('');mixer.clipAction(gltf.animations[0]).play();sel.value='0';}else{sel.style.display='none';}
    window._currentAnimations=gltf.animations;
    document.getElementById('viewerInfo').textContent=`${entry?.sizeKB||'?'} KB · ${gltf.scene.children.length} nodes · ${gltf.animations.length} anims`;
    if(le)le.style.display='none';
  } catch(e) {
    console.error('Load failed:',url,e);
    if(le){le.innerHTML=`<div style="text-align:center;padding:40px"><div style="font-size:3rem;opacity:.3">⚠</div><p style="color:#ef4444;margin:8px 0">Failed to load model</p><p style="color:#8888a0;font-size:.8rem;max-width:400px;margin:0 auto">${esc(e.message)}</p><p style="color:#8888a0;font-size:.7rem;margin-top:8px">${esc(url.substring(0,120))}</p></div>`;le.style.display='block';}
  }
}

async function openAndLoad(m) {
  if(!renderer) initViewer();
  document.getElementById('viewerOverlay').classList.add('active');
  document.getElementById('viewerTitle').textContent=m.name;
  document.getElementById('viewerInfo').textContent=`${m.format||'GLB'} · ${m.category||''}`;
  document.body.style.overflow='hidden';
  const le=document.getElementById('viewerLoading'); if(le){le.innerHTML='<div class="spinner"></div><p>Resolving model…</p>';le.style.display='block';}
  setTimeout(()=>{if(renderer){const w=document.getElementById('viewerCanvasWrap');renderer.setSize(w.clientWidth,w.clientHeight);}},50);
  const url=await resolveModelUrl(m);
  if(le) le.innerHTML='<div class="spinner"></div><p>Loading model…</p>';
  await loadByUrl(url, m);
}

// ── Drag & Drop ────────────────────────────────────────
function setupDragDrop() {
  const dz=document.getElementById('dropZone'), fi=document.getElementById('fileInput'); if(!dz) return;
  dz.addEventListener('click',()=>fi?.click());
  dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag-over');});
  dz.addEventListener('dragleave',()=>dz.classList.remove('drag-over'));
  dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag-over');if(e.dataTransfer.files[0])loadLocal(e.dataTransfer.files[0]);});
  if(fi) fi.addEventListener('change',()=>{if(fi.files[0])loadLocal(fi.files[0]);});
}
function loadLocal(file) {
  const ext=file.name.split('.').pop().toLowerCase();
  if(ext!=='glb'&&ext!=='gltf'){alert('Only GLB/GLTF can be previewed. Use the pipeline to convert '+ext.toUpperCase()+' files.');return;}
  if(!renderer)initViewer();
  document.getElementById('viewerOverlay').classList.add('active');
  document.getElementById('viewerTitle').textContent=file.name;
  document.getElementById('viewerInfo').textContent=`Local · ${(file.size/1024).toFixed(0)} KB`;
  document.body.style.overflow='hidden';
  setTimeout(()=>{if(renderer){const w=document.getElementById('viewerCanvasWrap');renderer.setSize(w.clientWidth,w.clientHeight);}},50);
  loadByUrl(URL.createObjectURL(file),{sizeKB:Math.round(file.size/1024)});
}

// ── Global handlers ────────────────────────────────────
window._filterCategory = c => { activeCategory=c; renderCategoryFilters(); applyFilters(); };
window.closeViewer = () => { document.getElementById('viewerOverlay').classList.remove('active'); document.body.style.overflow=''; if(currentModel){scene.remove(currentModel);currentModel=null;} if(mixer){mixer.stopAllAction();mixer=null;} };
window.toggleWireframe = () => { wireframeMode=!wireframeMode; if(currentModel) currentModel.traverse(o=>{if(o.isMesh&&o.material)o.material.wireframe=wireframeMode;}); };
window.toggleAutoRotate = () => { autoRotate=!autoRotate; if(controls)controls.autoRotate=autoRotate; };
window.playAnimation = v => { if(!mixer||!window._currentAnimations)return; mixer.stopAllAction(); const i=parseInt(v); if(!isNaN(i)&&window._currentAnimations[i])mixer.clipAction(window._currentAnimations[i]).play(); };
document.addEventListener('keydown', e => { if(e.key==='Escape') window.closeViewer(); });

// ── Init ───────────────────────────────────────────────
async function init() {
  const r2p = checkR2();
  await loadRegistry();
  updateStats(); renderCategoryFilters(); applyFilters(); setupDragDrop();
  document.getElementById('searchBox')?.addEventListener('input', () => applyFilters());
  await r2p;
}
init();
