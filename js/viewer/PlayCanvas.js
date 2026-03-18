/**
 * PlayCanvas.js — Scene manager for the 3D model viewer
 * Multi-model scene, TransformControls gizmo, lighting, skybox, selection
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RenderPipeline } from './RenderPipeline.js';

/* ── Skybox presets (from api/v1/rendering.json) ── */
const SKYBOX_PRESETS = {
  none:      { bg: 0x1a1a2e, ambient: 0.4, exposure: 1.2 },
  studio:    { bg: 0x2a2a3e, ambient: 0.6, exposure: 1.4 },
  daytime:   { bg: 0x87ceeb, ambient: 0.8, exposure: 1.5 },
  sunset:    { bg: 0x1a0a0a, ambient: 0.3, exposure: 1.0 },
  night:     { bg: 0x0a0a1a, ambient: 0.15, exposure: 0.7 },
  hellscape: { bg: 0x2a0a0a, ambient: 0.3, exposure: 1.0 },
  arctic:    { bg: 0xd4e5f7, ambient: 0.7, exposure: 1.3 },
  fantasy:   { bg: 0x2e1a47, ambient: 0.4, exposure: 1.1 },
  grudgeBrawl: { bg: 0x0a0a0a, ambient: 0.2, exposure: 0.8 },
};

let _entryId = 0;

export class PlayCanvas {
  /** @param {HTMLElement} container */
  constructor(container) {
    this.container = container;

    // Scene graph
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 2000);
    this.camera.position.set(3, 2, 5);

    // Render pipeline
    this.pipeline = new RenderPipeline(container);
    this.pipeline.setScene(this.scene, this.camera);

    // Orbit controls
    this.orbitControls = new OrbitControls(this.camera, this.pipeline.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.08;
    this.orbitControls.autoRotate = false;
    this.orbitControls.autoRotateSpeed = 1.5;
    this.orbitControls.maxPolarAngle = Math.PI * 0.85;

    // Transform gizmo
    this.transformControls = new TransformControls(this.camera, this.pipeline.renderer.domElement);
    this.transformControls.addEventListener('dragging-changed', e => {
      this.orbitControls.enabled = !e.value;
    });
    this.scene.add(this.transformControls);

    // Lighting
    this._setupLighting();

    // Ground + grid
    this._setupGround();

    // Draco loader
    this._dracoLoader = new DRACOLoader();
    this._dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/');

    // Model registry
    /** @type {Map<number, {id:number, name:string, object:THREE.Object3D, animations:THREE.AnimationClip[], mixer:THREE.AnimationMixer|null}>} */
    this.models = new Map();

    // Selection
    this.selectedId = null;
    this._raycaster = new THREE.Raycaster();
    this._pointer = new THREE.Vector2();

    // Click selection
    this.pipeline.renderer.domElement.addEventListener('pointerdown', e => this._onPointerDown(e));

    // Animation
    this._running = false;
    this._animFrameId = 0;
    this._onFrameCallbacks = [];

    // Events
    this._eventTarget = new EventTarget();
  }

  /* ═══════════════════ LIGHTING ═══════════════════ */

  _setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.5);
    this.scene.add(this.hemiLight);

    // Key light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.keyLight.position.set(5, 8, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.near = 0.1;
    this.keyLight.shadow.camera.far = 50;
    this.keyLight.shadow.camera.left = -15;
    this.keyLight.shadow.camera.right = 15;
    this.keyLight.shadow.camera.top = 15;
    this.keyLight.shadow.camera.bottom = -15;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Fill light
    this.fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    this.fillLight.position.set(-5, 3, -3);
    this.scene.add(this.fillLight);

    // Rim light
    this.rimLight = new THREE.DirectionalLight(0xffd700, 0.3);
    this.rimLight.position.set(0, 5, -8);
    this.scene.add(this.rimLight);
  }

  toggleLight(name, visible) {
    const map = { key: this.keyLight, fill: this.fillLight, rim: this.rimLight };
    const light = map[name];
    if (light) light.visible = visible !== undefined ? visible : !light.visible;
  }

  /* ═══════════════════ GROUND ═══════════════════ */

  _setupGround() {
    this.gridHelper = new THREE.GridHelper(30, 30, 0x444466, 0x222244);
    this.scene.add(this.gridHelper);

    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  toggleGrid(visible) {
    this.gridHelper.visible = visible !== undefined ? visible : !this.gridHelper.visible;
  }

  /* ═══════════════════ SKYBOX ═══════════════════ */

  setSkybox(presetName) {
    const preset = SKYBOX_PRESETS[presetName] || SKYBOX_PRESETS.none;
    this.scene.background = new THREE.Color(preset.bg);
    this.ambientLight.intensity = preset.ambient;
    this.pipeline.setToneMapping(preset.exposure);
  }

  getSkyboxNames() { return Object.keys(SKYBOX_PRESETS); }

  /* ═══════════════════ MODEL LOADING ═══════════════════ */

  /**
   * Load a model into the scene
   * @param {string} url - URL to the model file
   * @param {string} format - 'GLB'|'GLTF'|'FBX'|'OBJ'
   * @param {string} [name] - display name
   * @returns {Promise<{id:number, name:string, object:THREE.Object3D, animations:THREE.AnimationClip[]}>}
   */
  async loadModel(url, format, name) {
    const fmt = format.toUpperCase();
    let object, animations = [];

    if (fmt === 'GLB' || fmt === 'GLTF') {
      const loader = new GLTFLoader();
      loader.setDRACOLoader(this._dracoLoader);
      const gltf = await loader.loadAsync(url);
      object = gltf.scene;
      animations = gltf.animations || [];
    } else if (fmt === 'FBX') {
      const loader = new FBXLoader();
      object = await loader.loadAsync(url);
      animations = object.animations || [];
    } else if (fmt === 'OBJ') {
      const loader = new OBJLoader();
      object = await loader.loadAsync(url);
      // Upgrade basic materials on OBJ
      object.traverse(child => {
        if (child.isMesh) {
          if (!child.material || child.material.type === 'MeshBasicMaterial') {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xcccccc, roughness: 0.6, metalness: 0.2,
            });
          }
        }
      });
    } else {
      throw new Error('Unsupported format: ' + format);
    }

    // Enable shadows on all meshes
    object.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Register
    const id = ++_entryId;
    const displayName = name || url.split('/').pop() || ('Model ' + id);
    const entry = { id, name: displayName, object, animations, mixer: null };
    this.models.set(id, entry);
    this.scene.add(object);

    // Frame the first model
    if (this.models.size === 1) this.frameModel(id);

    this._dispatch('model-added', { id, name: displayName });
    return entry;
  }

  /** Load model from a local File */
  async loadModelFromFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const fmtMap = { glb: 'GLB', gltf: 'GLTF', fbx: 'FBX', obj: 'OBJ' };
    const format = fmtMap[ext];
    if (!format) throw new Error('Unsupported: .' + ext);
    const url = URL.createObjectURL(file);
    try {
      return await this.loadModel(url, format, file.name);
    } finally {
      // Revoke after a delay to let loaders finish
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }

  /* ═══════════════════ MODEL MANAGEMENT ═══════════════════ */

  removeModel(id) {
    const entry = this.models.get(id);
    if (!entry) return;
    this.scene.remove(entry.object);
    entry.object.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => m.dispose());
      }
    });
    if (entry.mixer) entry.mixer.stopAllAction();
    if (this.selectedId === id) this.deselect();
    this.models.delete(id);
    this._dispatch('model-removed', { id });
  }

  getModel(id) { return this.models.get(id); }
  getAllModels() { return Array.from(this.models.values()); }

  toggleModelVisibility(id) {
    const entry = this.models.get(id);
    if (entry) entry.object.visible = !entry.object.visible;
  }

  /* ═══════════════════ FRAMING ═══════════════════ */

  frameModel(id) {
    const entry = this.models.get(id);
    if (!entry) return;
    const box = new THREE.Box3().setFromObject(entry.object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let dist = maxDim / (2 * Math.tan(fov / 2)) * 1.8;

    this.camera.position.set(center.x + dist * 0.5, center.y + dist * 0.3, center.z + dist);
    this.orbitControls.target.copy(center);
    this.camera.near = Math.max(0.01, maxDim / 100);
    this.camera.far = maxDim * 100;
    this.camera.updateProjectionMatrix();
    this.orbitControls.update();
  }

  setCameraPreset(preset) {
    // Find something to focus on
    const target = this.selectedId ? this.models.get(this.selectedId) : this.models.values().next().value;
    if (!target) return;

    const box = new THREE.Box3().setFromObject(target.object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const dist = Math.max(size.x, size.y, size.z) * 2;

    const positions = {
      front: [center.x, center.y, center.z + dist],
      back:  [center.x, center.y, center.z - dist],
      left:  [center.x - dist, center.y, center.z],
      right: [center.x + dist, center.y, center.z],
      top:   [center.x, center.y + dist, center.z + 0.01],
      iso:   [center.x + dist * 0.6, center.y + dist * 0.6, center.z + dist * 0.6],
    };
    const pos = positions[preset];
    if (!pos) return;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this.orbitControls.target.copy(center);
    this.camera.updateProjectionMatrix();
    this.orbitControls.update();
  }

  /* ═══════════════════ SELECTION ═══════════════════ */

  _onPointerDown(event) {
    if (event.button !== 0) return;
    // Ignore if over gizmo
    if (this.transformControls.dragging) return;

    const rect = this.pipeline.renderer.domElement.getBoundingClientRect();
    this._pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._pointer, this.camera);

    // Collect all meshes from models
    const meshes = [];
    for (const entry of this.models.values()) {
      entry.object.traverse(child => {
        if (child.isMesh) {
          child.userData._modelId = entry.id;
          meshes.push(child);
        }
      });
    }

    const hits = this._raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const modelId = hits[0].object.userData._modelId;
      this.select(modelId);
    } else {
      this.deselect();
    }
  }

  select(id) {
    const entry = this.models.get(id);
    if (!entry) return;
    this.selectedId = id;
    this.transformControls.attach(entry.object);
    this._dispatch('selection-changed', { id, entry });
  }

  deselect() {
    this.selectedId = null;
    this.transformControls.detach();
    this._dispatch('selection-changed', { id: null, entry: null });
  }

  setGizmoMode(mode) {
    if (['translate', 'rotate', 'scale'].includes(mode)) {
      this.transformControls.setMode(mode);
    }
  }

  setGizmoSnap(translate, rotate, scale) {
    this.transformControls.setTranslationSnap(translate || null);
    this.transformControls.setRotationSnap(rotate || null);
    this.transformControls.setScaleSnap(scale || null);
  }

  /* ═══════════════════ MODEL STATS ═══════════════════ */

  getModelStats(id) {
    const entry = this.models.get(id || this.selectedId);
    if (!entry) return null;
    let verts = 0, tris = 0, meshes = 0;
    entry.object.traverse(child => {
      if (child.isMesh && child.geometry) {
        meshes++;
        const geo = child.geometry;
        if (geo.index) tris += geo.index.count / 3;
        else if (geo.attributes.position) tris += geo.attributes.position.count / 3;
        if (geo.attributes.position) verts += geo.attributes.position.count;
      }
    });
    return { verts, tris: Math.round(tris), meshes };
  }

  /* ═══════════════════ WIREFRAME ═══════════════════ */

  setWireframe(id, enabled) {
    const entry = this.models.get(id || this.selectedId);
    if (!entry) return;
    entry.object.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => { m.wireframe = enabled; });
      }
    });
  }

  /* ═══════════════════ ANIMATION LOOP ═══════════════════ */

  start() {
    if (this._running) return;
    this._running = true;
    this._tick();
  }

  stop() {
    this._running = false;
    if (this._animFrameId) cancelAnimationFrame(this._animFrameId);
  }

  onFrame(cb) { this._onFrameCallbacks.push(cb); }

  _tick() {
    if (!this._running) return;
    this._animFrameId = requestAnimationFrame(() => this._tick());

    const delta = this.pipeline.clock.getDelta();

    // Update animation mixers
    for (const entry of this.models.values()) {
      if (entry.mixer) entry.mixer.update(delta);
    }

    this.orbitControls.update();

    // External frame callbacks
    for (const cb of this._onFrameCallbacks) cb(delta);

    this.pipeline.render();
  }

  /* ═══════════════════ EVENTS ═══════════════════ */

  on(type, listener) { this._eventTarget.addEventListener(type, listener); }
  off(type, listener) { this._eventTarget.removeEventListener(type, listener); }
  _dispatch(type, detail) { this._eventTarget.dispatchEvent(new CustomEvent(type, { detail })); }

  /* ═══════════════════ CLEANUP ═══════════════════ */

  dispose() {
    this.stop();
    for (const id of this.models.keys()) this.removeModel(id);
    this.transformControls.dispose();
    this.orbitControls.dispose();
    this.pipeline.dispose();
  }
}
