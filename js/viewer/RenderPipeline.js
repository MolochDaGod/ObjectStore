/**
 * RenderPipeline.js — WebGL renderer + post-processing pipeline
 * Handles: EffectComposer, bloom, SMAA, tone mapping, shadows, stats, resize
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class RenderPipeline {
  /** @param {HTMLElement} container */
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.stats = { fps: 0, drawCalls: 0, triangles: 0, textures: 0, frameCount: 0, lastFpsTime: 0 };
    this._onResizeCb = null;

    this._initRenderer();
    this._initComposer();
    this._initResize();
  }

  _initRenderer() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // SMAA handles AA
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Tone mapping
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  /** @param {THREE.Scene} scene  @param {THREE.Camera} camera */
  _initComposer() {
    // Composer is created without scene/camera — they're set in setScene()
    this._scene = null;
    this._camera = null;
  }

  /** Connect to a scene + camera and build the post-processing chain */
  setScene(scene, camera) {
    this._scene = scene;
    this._camera = camera;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.composer = new EffectComposer(this.renderer);

    // Render pass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // Bloom
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.8, 0.4, 0.85);
    this.composer.addPass(this.bloomPass);

    // SMAA anti-aliasing
    this.smaaPass = new SMAAPass(w * this.renderer.getPixelRatio(), h * this.renderer.getPixelRatio());
    this.composer.addPass(this.smaaPass);

    // Output (gamma correction)
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  _initResize() {
    this._resizeObserver = new ResizeObserver(() => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w === 0 || h === 0) return;

      this.renderer.setSize(w, h);
      if (this.composer) this.composer.setSize(w, h);
      if (this._camera) {
        this._camera.aspect = w / h;
        this._camera.updateProjectionMatrix();
      }
      if (this.bloomPass) {
        this.bloomPass.resolution.set(w, h);
      }
      if (this._onResizeCb) this._onResizeCb(w, h);
    });
    this._resizeObserver.observe(this.container);
  }

  /** Called externally when the container might have changed */
  onResize(cb) { this._onResizeCb = cb; }

  /** Render one frame (call from animation loop) */
  render() {
    if (!this.composer || !this._scene || !this._camera) return;

    this.composer.render();

    // Stats
    this.stats.frameCount++;
    const now = performance.now();
    if (now - this.stats.lastFpsTime >= 1000) {
      this.stats.fps = this.stats.frameCount;
      this.stats.frameCount = 0;
      this.stats.lastFpsTime = now;
      const info = this.renderer.info;
      this.stats.drawCalls = info.render.calls;
      this.stats.triangles = info.render.triangles;
      this.stats.textures = info.memory.textures;
    }
  }

  /** Get current stats */
  getStats() {
    return { ...this.stats };
  }

  /* ── Configuration ── */

  setPixelRatio(ratio) {
    const dpr = Math.min(ratio, window.devicePixelRatio);
    this.renderer.setPixelRatio(dpr);
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    if (this.composer) this.composer.setSize(w, h);
  }

  setBloom(strength, radius, threshold) {
    if (!this.bloomPass) return;
    if (strength !== undefined) this.bloomPass.strength = strength;
    if (radius !== undefined) this.bloomPass.radius = radius;
    if (threshold !== undefined) this.bloomPass.threshold = threshold;
  }

  setToneMapping(exposure) {
    this.renderer.toneMappingExposure = exposure;
  }

  setShadows(enabled) {
    this.renderer.shadowMap.enabled = enabled;
    this.renderer.shadowMap.needsUpdate = true;
  }

  /** Take a screenshot → data URL */
  screenshot(mimeType = 'image/png') {
    this.render();
    return this.renderer.domElement.toDataURL(mimeType);
  }

  dispose() {
    this._resizeObserver?.disconnect();
    this.renderer.dispose();
    if (this.composer) {
      this.composer.passes.forEach(p => { if (p.dispose) p.dispose(); });
    }
    this.container.removeChild(this.renderer.domElement);
  }
}
