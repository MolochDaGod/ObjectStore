/**
 * <grudge-gltf-viewer> — unified Grudge Studio 3D viewer custom element.
 *
 * Replaces the loose `js/viewer/*` subsets previously inlined into individual
 * HTML tools. Built on three.js ESM (loaded from jsdelivr) + GLTFLoader +
 * DRACOLoader + OrbitControls + RoomEnvironment.
 *
 * Attributes:
 *   src          – Absolute or store-relative URL to a .glb/.gltf file.
 *   animation    – Name of the animation clip to autoplay on load.
 *   environment  – "studio" (default) | "city" | "none".
 *   background   – CSS color (default #0b0d12) applied behind the model.
 *   grid         – "on" (default) | "off".
 *   bones        – "on" | "off" (default) – show skeleton helpers.
 *   auto-rotate  – "on" | "off" (default).
 *   shadow       – "on" (default) | "off".
 *   exposure     – Number, default 1.0.
 *
 * Programmatic API (via the element instance):
 *   load(url)          – Swap model.
 *   play(name?)        – Play animation (by name, else default).
 *   pause() / stop()
 *   listAnimations()   – Array<string>
 *   setEnvironment(name)
 *   resetCamera()
 *   snapshot({width,height,mime?}) – Promise<Blob>
 *
 * URL state sync: writes ?id=&anim=&env= on change when used in viewer pages.
 *
 * Keyboard hotkeys (when the element has focus or is the only one on page):
 *   Space       – play/pause
 *   [ ] / , .   – prev/next animation
 *   r           – reset camera
 *   b           – toggle bones
 *   g           – toggle grid
 */

const THREE_URL       = 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
const ADDONS_BASE     = 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm';
const DRACO_DECODERS  = 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/libs/draco/';

/** Lazily load three.js + required addons once. */
let _modulesPromise = null;
async function loadModules() {
  if (_modulesPromise) return _modulesPromise;
  _modulesPromise = (async () => {
    const THREE = await import(THREE_URL);
    const [{ GLTFLoader }, { DRACOLoader }, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
      import(`${ADDONS_BASE}/loaders/GLTFLoader.js`),
      import(`${ADDONS_BASE}/loaders/DRACOLoader.js`),
      import(`${ADDONS_BASE}/controls/OrbitControls.js`),
      import(`${ADDONS_BASE}/environments/RoomEnvironment.js`),
    ]);
    return { THREE, GLTFLoader, DRACOLoader, OrbitControls, RoomEnvironment };
  })();
  return _modulesPromise;
}

const TEMPLATE = /* html */ `
<style>
  :host {
    display: block;
    position: relative;
    width: 100%;
    min-height: 360px;
    background: var(--grudge-viewer-bg, #0b0d12);
    color: #eef0f4;
    font-family: system-ui, -apple-system, Segoe UI, sans-serif;
    border-radius: 10px;
    overflow: hidden;
  }
  .stage { position: absolute; inset: 0; }
  canvas { display: block; width: 100% !important; height: 100% !important; }
  .hud {
    position: absolute; left: 8px; right: 8px; bottom: 8px;
    display: flex; flex-wrap: wrap; gap: 6px;
    font-size: 12px; pointer-events: none;
  }
  .hud > * { pointer-events: auto; }
  .btn, select {
    background: rgba(0,0,0,.55); color: #fff;
    border: 1px solid rgba(255,255,255,.18);
    padding: 4px 8px; border-radius: 6px;
    cursor: pointer;
  }
  .btn:hover { background: rgba(255,255,255,.12); }
  .info {
    position: absolute; top: 8px; left: 8px;
    background: rgba(0,0,0,.45); padding: 4px 8px;
    border-radius: 6px; font-size: 11px; max-width: 60%;
    word-break: break-all;
  }
  .err {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    background: rgba(20,0,0,.7); color: #ffb4b4;
    padding: 20px; text-align: center;
  }
  .loading {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-size: 13px; color: #aab;
  }
  .dz {
    position: absolute; inset: 0; border: 2px dashed rgba(255,255,255,.3);
    border-radius: 10px; pointer-events: none; opacity: 0;
    transition: opacity 120ms ease;
  }
  :host(.dragging) .dz { opacity: 1; }
</style>
<div class="stage"></div>
<div class="info" hidden></div>
<div class="loading" hidden>loading…</div>
<div class="hud">
  <button class="btn" data-act="play">▶</button>
  <button class="btn" data-act="reset">↺</button>
  <select class="btn" data-act="anim"></select>
  <select class="btn" data-act="env">
    <option value="studio" selected>studio</option>
    <option value="city">city</option>
    <option value="none">none</option>
  </select>
  <button class="btn" data-act="bones">bones</button>
  <button class="btn" data-act="grid">grid</button>
  <button class="btn" data-act="snapshot">snap</button>
</div>
<div class="dz"></div>
`;

export class GrudgeGLTFViewer extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'animation', 'environment', 'background', 'grid', 'bones', 'auto-rotate', 'shadow', 'exposure'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.innerHTML = TEMPLATE;
    this._stage = this._shadow.querySelector('.stage');
    this._info = this._shadow.querySelector('.info');
    this._loading = this._shadow.querySelector('.loading');
    this._hud = this._shadow.querySelector('.hud');
    this._animSelect = this._shadow.querySelector('[data-act="anim"]');
    this._envSelect = this._shadow.querySelector('[data-act="env"]');

    this._animations = [];
    this._currentClip = null;
    this._playing = false;
    this._showBones = false;
    this._showGrid = true;
    this._skeletonHelper = null;
    this._gridHelper = null;

    this._hud.addEventListener('click', (e) => this._onHudClick(e));
    this._animSelect.addEventListener('change', () => this.play(this._animSelect.value));
    this._envSelect.addEventListener('change', () => this.setEnvironment(this._envSelect.value));
    this._onKey = this._onKey.bind(this);
    this._onDrag = this._onDrag.bind(this);
    this._onDrop = this._onDrop.bind(this);
  }

  connectedCallback() {
    document.addEventListener('keydown', this._onKey);
    this.addEventListener('dragover', this._onDrag);
    this.addEventListener('dragleave', this._onDrag);
    this.addEventListener('drop', this._onDrop);
    this._init().catch((e) => this._fail(e));
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKey);
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._renderer) this._renderer.dispose();
  }

  attributeChangedCallback(name, _old, value) {
    if (!this._scene) return;
    if (name === 'src' && value) this.load(value);
    if (name === 'environment' && value) this.setEnvironment(value);
    if (name === 'background' && value) this.style.setProperty('--grudge-viewer-bg', value);
    if (name === 'grid') this._setGrid(value !== 'off');
    if (name === 'bones') this._setBones(value === 'on');
    if (name === 'exposure' && this._renderer) this._renderer.toneMappingExposure = Number(value) || 1;
  }

  // ── API ───────────────────────────────────────────────────────────

  async load(url) {
    this._showLoading(true);
    try {
      const { THREE } = this._mods;
      if (this._root) {
        this._scene.remove(this._root);
        this._root = null;
      }
      const gltf = await this._gltfLoader.loadAsync(url);
      this._root = gltf.scene;
      this._root.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      this._scene.add(this._root);

      // Fit camera
      const box = new THREE.Box3().setFromObject(this._root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      this._controls.target.copy(center);
      this._camera.position.copy(center).add(new THREE.Vector3(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5));
      this._controls.update();

      // Animations
      this._mixer = new THREE.AnimationMixer(this._root);
      this._animations = gltf.animations || [];
      this._populateAnimations();

      const wanted = this.getAttribute('animation');
      if (wanted && this._animations.find((c) => c.name === wanted)) this.play(wanted);
      else if (this._animations[0]) this.play(this._animations[0].name);

      // Skeleton helper (lazy)
      const skinned = [];
      this._root.traverse((o) => o.isSkinnedMesh && skinned.push(o));
      if (skinned[0]) {
        this._skeletonHelper = new THREE.SkeletonHelper(skinned[0]);
        this._skeletonHelper.visible = this._showBones;
        this._scene.add(this._skeletonHelper);
      }

      this._info.hidden = false;
      this._info.textContent = `${url.split('/').pop()} · ${this._animations.length} anim`;
      this.dispatchEvent(new CustomEvent('grudge-viewer:loaded', { detail: { url, animations: this.listAnimations() } }));
    } catch (err) {
      this._fail(err);
    } finally {
      this._showLoading(false);
    }
  }

  play(name) {
    if (!this._mixer) return;
    const clip = name ? this._animations.find((c) => c.name === name) : this._animations[0];
    if (!clip) return;
    if (this._currentAction) this._currentAction.stop();
    this._currentAction = this._mixer.clipAction(clip);
    this._currentAction.reset().fadeIn(0.15).play();
    this._currentClip = clip;
    this._playing = true;
    this._syncUrl();
    this._hud.querySelector('[data-act="play"]').textContent = '❚❚';
    if (this._animSelect.value !== clip.name) this._animSelect.value = clip.name;
  }

  pause() {
    if (this._currentAction) this._currentAction.paused = true;
    this._playing = false;
    this._hud.querySelector('[data-act="play"]').textContent = '▶';
  }

  stop() {
    if (this._currentAction) this._currentAction.stop();
    this._playing = false;
    this._hud.querySelector('[data-act="play"]').textContent = '▶';
  }

  listAnimations() {
    return this._animations.map((c) => c.name);
  }

  setEnvironment(name) {
    if (!this._mods) return;
    const { THREE, RoomEnvironment } = this._mods;
    if (this._envTex) this._envTex.dispose?.();
    if (name === 'none') {
      this._scene.environment = null;
      return;
    }
    const pmrem = new THREE.PMREMGenerator(this._renderer);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this._scene.environment = tex;
    this._envTex = tex;
    this._envSelect.value = name;
    this._syncUrl();
  }

  resetCamera() {
    if (!this._root) return;
    this.load(this.getAttribute('src'));
  }

  async snapshot({ width = 1024, height = 1024, mime = 'image/png' } = {}) {
    const { THREE } = this._mods;
    const oldSize = new THREE.Vector2();
    this._renderer.getSize(oldSize);
    this._renderer.setSize(width, height, false);
    this._renderer.render(this._scene, this._camera);
    const blob = await new Promise((res) => this._renderer.domElement.toBlob(res, mime));
    this._renderer.setSize(oldSize.x, oldSize.y, false);
    return blob;
  }

  // ── Internals ─────────────────────────────────────────────────────

  async _init() {
    this._mods = await loadModules();
    const { THREE, GLTFLoader, DRACOLoader, OrbitControls } = this._mods;

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(45, 1, 0.01, 2000);
    this._camera.position.set(2, 1.5, 3);

    this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = Number(this.getAttribute('exposure')) || 1;
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._renderer.shadowMap.enabled = this.getAttribute('shadow') !== 'off';
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._stage.appendChild(this._renderer.domElement);

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableDamping = true;
    this._controls.autoRotate = this.getAttribute('auto-rotate') === 'on';

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.7);
    this._scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(3, 5, 2);
    key.castShadow = true;
    this._scene.add(key);

    // Grid
    this._gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    this._scene.add(this._gridHelper);
    this._setGrid(this.getAttribute('grid') !== 'off');

    // Loaders
    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_DECODERS);
    this._gltfLoader = new GLTFLoader();
    this._gltfLoader.setDRACOLoader(draco);

    this.setEnvironment(this.getAttribute('environment') || 'studio');

    // Size + RAF
    const ro = new ResizeObserver(() => this._resize());
    ro.observe(this);
    this._resize();
    this._clock = new THREE.Clock();
    const tick = () => {
      this._raf = requestAnimationFrame(tick);
      if (this._mixer) this._mixer.update(this._clock.getDelta());
      this._controls.update();
      this._renderer.render(this._scene, this._camera);
    };
    tick();

    if (this.getAttribute('src')) this.load(this.getAttribute('src'));
  }

  _resize() {
    const rect = this.getBoundingClientRect();
    this._renderer.setSize(rect.width, rect.height, false);
    this._camera.aspect = rect.width / Math.max(rect.height, 1);
    this._camera.updateProjectionMatrix();
  }

  _populateAnimations() {
    this._animSelect.innerHTML = '';
    for (const c of this._animations) {
      const o = document.createElement('option');
      o.value = c.name;
      o.textContent = c.name;
      this._animSelect.appendChild(o);
    }
  }

  _onHudClick(e) {
    const act = e.target?.getAttribute?.('data-act');
    if (!act) return;
    if (act === 'play') this._playing ? this.pause() : this.play(this._animSelect.value);
    if (act === 'reset') this.resetCamera();
    if (act === 'bones') this._setBones(!this._showBones);
    if (act === 'grid') this._setGrid(!this._showGrid);
    if (act === 'snapshot') {
      this.snapshot().then((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'grudge-viewer.png';
        a.click();
      });
    }
  }

  _onKey(e) {
    if (!this._scene) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
    if (e.key === ' ') { this._playing ? this.pause() : this.play(this._animSelect.value); e.preventDefault(); }
    else if (e.key === '[' || e.key === ',') this._cycleAnim(-1);
    else if (e.key === ']' || e.key === '.') this._cycleAnim(+1);
    else if (e.key === 'r') this.resetCamera();
    else if (e.key === 'b') this._setBones(!this._showBones);
    else if (e.key === 'g') this._setGrid(!this._showGrid);
  }

  _cycleAnim(delta) {
    if (!this._animations.length) return;
    const idx = this._animations.findIndex((c) => c.name === this._currentClip?.name);
    const next = this._animations[(idx + delta + this._animations.length) % this._animations.length];
    this.play(next.name);
  }

  _setBones(on) {
    this._showBones = !!on;
    if (this._skeletonHelper) this._skeletonHelper.visible = this._showBones;
  }

  _setGrid(on) {
    this._showGrid = !!on;
    if (this._gridHelper) this._gridHelper.visible = this._showGrid;
  }

  _onDrag(e) {
    if (e.type === 'dragover') { e.preventDefault(); this.classList.add('dragging'); }
    else if (e.type === 'dragleave') this.classList.remove('dragging');
  }

  async _onDrop(e) {
    e.preventDefault();
    this.classList.remove('dragging');
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.glb') || name.endsWith('.gltf')) {
      const url = URL.createObjectURL(file);
      await this.load(url);
      return;
    }
    if (name.endsWith('.fbx') || name.endsWith('.obj')) {
      // Fallback: post to server-side converter endpoint; expects { url } back.
      const fd = new FormData();
      fd.append('file', file);
      const base = this.getAttribute('api-base') || document.querySelector('meta[name="grudge-api"]')?.content || '';
      try {
        const r = await fetch(`${base}/api/convert/to-glb`, { method: 'POST', body: fd, credentials: 'include' });
        if (!r.ok) throw new Error(`convert failed ${r.status}`);
        const { url } = await r.json();
        await this.load(url);
      } catch (err) {
        this._fail(err);
      }
    }
  }

  _syncUrl() {
    if (!this.hasAttribute('sync-url')) return;
    const url = new URL(location.href);
    if (this._currentClip?.name) url.searchParams.set('anim', this._currentClip.name);
    if (this._envSelect.value) url.searchParams.set('env', this._envSelect.value);
    history.replaceState(null, '', url);
  }

  _showLoading(on) { this._loading.hidden = !on; }

  _fail(err) {
    console.error('[grudge-gltf-viewer]', err);
    const e = document.createElement('div');
    e.className = 'err';
    e.textContent = `Viewer error: ${err?.message || err}`;
    this._shadow.appendChild(e);
  }
}

if (!customElements.get('grudge-gltf-viewer')) {
  customElements.define('grudge-gltf-viewer', GrudgeGLTFViewer);
}

export default GrudgeGLTFViewer;
