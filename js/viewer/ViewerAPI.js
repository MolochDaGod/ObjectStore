/**
 * ViewerAPI.js — Public API exposed as window.GrudgeViewer
 * Wraps PlayCanvas + subsystems into a clean programmatic interface
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { PlayCanvas } from './PlayCanvas.js';

export class ViewerAPI {
  /** @param {HTMLElement} container */
  constructor(container) {
    this.canvas = new PlayCanvas(container);
    this._exporter = new GLTFExporter();
    // subsystems attached after construction
    this.materialEditor = null;
    this.textureManager = null;
    this.animationManager = null;
    this.modelConverter = null;
  }

  /* ═══════════════ Model Loading ═══════════════ */

  /**
   * Load a model from URL
   * @param {string} url
   * @param {string} format - GLB|GLTF|FBX|OBJ
   * @param {string} [name]
   * @returns {Promise<{id:number, name:string, object:THREE.Object3D, animations:THREE.AnimationClip[]}>}
   */
  async load(url, format, name) {
    return this.canvas.loadModel(url, format, name);
  }

  /** Load model from File object */
  async loadFile(file) {
    return this.canvas.loadModelFromFile(file);
  }

  /** Remove model by ID */
  remove(id) { this.canvas.removeModel(id); }

  /** Get all loaded models */
  getModels() { return this.canvas.getAllModels(); }

  /** Get model by ID */
  getModel(id) { return this.canvas.getModel(id); }

  /* ═══════════════ Conversion ═══════════════ */

  /**
   * Convert a loaded model to GLB binary
   * @param {number} id - model ID
   * @returns {Promise<Blob>}
   */
  async convert(id) {
    const entry = this.canvas.getModel(id);
    if (!entry) throw new Error('Model not found: ' + id);
    const data = await this._exporter.parseAsync(entry.object, {
      binary: true,
      animations: entry.animations,
    });
    return new Blob([data], { type: 'model/gltf-binary' });
  }

  /**
   * Convert entire scene to GLB
   * @returns {Promise<Blob>}
   */
  async exportScene() {
    // Collect all model objects into a temporary group
    const group = new THREE.Group();
    for (const entry of this.canvas.models.values()) {
      group.add(entry.object.clone());
    }
    const allAnims = [];
    for (const entry of this.canvas.models.values()) {
      allAnims.push(...entry.animations);
    }
    const data = await this._exporter.parseAsync(group, {
      binary: true,
      animations: allAnims,
    });
    return new Blob([data], { type: 'model/gltf-binary' });
  }

  /* ═══════════════ Textures ═══════════════ */

  /**
   * Apply a texture to a model's material slot
   * @param {number} id - model ID
   * @param {string} slot - 'map'|'normalMap'|'roughnessMap'|'metalnessMap'|'aoMap'|'emissiveMap'
   * @param {string} textureUrl
   */
  async applyTexture(id, slot, textureUrl) {
    const entry = this.canvas.getModel(id);
    if (!entry) throw new Error('Model not found: ' + id);
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(textureUrl);
    texture.colorSpace = slot === 'map' || slot === 'emissiveMap' ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
    texture.flipY = false;
    entry.object.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => {
          if (m[slot] !== undefined) {
            m[slot] = texture;
            m.needsUpdate = true;
          }
        });
      }
    });
  }

  /* ═══════════════ Animations ═══════════════ */

  /**
   * Play an animation clip on a model
   * @param {number} id - model ID
   * @param {string|number} clipNameOrIndex
   * @param {{loop?:boolean, speed?:number, crossFade?:number}} [options]
   */
  playAnimation(id, clipNameOrIndex, options = {}) {
    const entry = this.canvas.getModel(id);
    if (!entry || !entry.animations.length) return null;

    if (!entry.mixer) {
      entry.mixer = new THREE.AnimationMixer(entry.object);
    }

    let clip;
    if (typeof clipNameOrIndex === 'number') {
      clip = entry.animations[clipNameOrIndex];
    } else {
      clip = entry.animations.find(c => c.name === clipNameOrIndex);
    }
    if (!clip) clip = entry.animations[0];

    const action = entry.mixer.clipAction(clip);
    action.setLoop(options.loop !== false ? THREE.LoopRepeat : THREE.LoopOnce);
    if (options.speed) action.timeScale = options.speed;
    if (options.crossFade && entry._lastAction) {
      action.reset().fadeIn(options.crossFade).play();
      entry._lastAction.fadeOut(options.crossFade);
    } else {
      entry.mixer.stopAllAction();
      action.reset().play();
    }
    entry._lastAction = action;
    return action;
  }

  /** Stop all animations on a model */
  stopAnimation(id) {
    const entry = this.canvas.getModel(id);
    if (entry?.mixer) entry.mixer.stopAllAction();
  }

  /** Get animation clip names for a model */
  getAnimationNames(id) {
    const entry = this.canvas.getModel(id);
    if (!entry) return [];
    return entry.animations.map(c => c.name || 'Untitled');
  }

  /* ═══════════════ Scene Controls ═══════════════ */

  /** Take a screenshot → data URL */
  screenshot() { return this.canvas.pipeline.screenshot(); }

  /** Get renderer + model stats */
  getStats() {
    const render = this.canvas.pipeline.getStats();
    const model = this.canvas.selectedId ? this.canvas.getModelStats() : null;
    return { ...render, model };
  }

  /** Set skybox preset */
  setSkybox(name) { this.canvas.setSkybox(name); }

  /** Set bloom parameters */
  setBloom(strength, radius, threshold) { this.canvas.pipeline.setBloom(strength, radius, threshold); }

  /** Set pixel ratio */
  setQuality(ratio) { this.canvas.pipeline.setPixelRatio(ratio); }

  /** Frame camera on model */
  frame(id) { this.canvas.frameModel(id); }

  /** Camera preset */
  setCameraPreset(preset) { this.canvas.setCameraPreset(preset); }

  /** Selection */
  select(id) { this.canvas.select(id); }
  deselect() { this.canvas.deselect(); }

  /** Gizmo mode */
  setGizmo(mode) { this.canvas.setGizmoMode(mode); }

  /** Auto-rotate */
  setAutoRotate(enabled) { this.canvas.orbitControls.autoRotate = enabled; }

  /** Start render loop */
  start() { this.canvas.start(); }

  /** Stop render loop */
  stop() { this.canvas.stop(); }

  /** Register frame callback */
  onFrame(cb) { this.canvas.onFrame(cb); }

  /** Listen to events */
  on(type, cb) { this.canvas.on(type, cb); }

  /** Dispose everything */
  dispose() { this.canvas.dispose(); }
}

/**
 * Initialize and expose global API
 * @param {HTMLElement} container
 * @returns {ViewerAPI}
 */
export function initGrudgeViewer(container) {
  const api = new ViewerAPI(container);
  window.GrudgeViewer = api;
  return api;
}
