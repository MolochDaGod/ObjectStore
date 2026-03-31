/**
 * RenderPipeline.js — Babylon.js rendering pipeline wrapper
 * Uses global BABYLON namespace (UMD CDN build)
 */
class RenderPipeline {
  constructor(container) {
    this.container = container;
    this.stats = { fps: 0, drawCalls: 0, triangles: 0, frameCount: 0, lastFpsTime: 0 };
    this._onResizeCb = null;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(this.canvas);

    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true,
    });
    this.scene = null;
    this.camera = null;
    this.pipeline = null;

    this._ro = new ResizeObserver(() => {
      this.engine.resize();
      if (this._onResizeCb) this._onResizeCb(container.clientWidth, container.clientHeight);
    });
    this._ro.observe(container);
    window.addEventListener('resize', () => this.engine.resize());
  }

  setScene(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.pipeline = new BABYLON.DefaultRenderingPipeline('default', true, scene, [camera]);
    this.pipeline.bloomEnabled = true;
    this.pipeline.bloomThreshold = 0.4;
    this.pipeline.bloomWeight = 0.5;
    this.pipeline.fxaaEnabled = true;
    this.pipeline.imageProcessingEnabled = true;
    this.pipeline.imageProcessing.toneMappingEnabled = true;
    this.pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    this.pipeline.imageProcessing.exposure = 1.2;
    this.pipeline.imageProcessing.contrast = 1.1;
  }

  onResize(cb) { this._onResizeCb = cb; }

  render() {
    if (!this.scene) return;
    this.scene.render();
    this.stats.frameCount++;
    const now = performance.now();
    if (now - this.stats.lastFpsTime >= 1000) {
      this.stats.fps = this.stats.frameCount;
      this.stats.frameCount = 0;
      this.stats.lastFpsTime = now;
    }
  }

  getStats() { return { ...this.stats }; }
  setPixelRatio(r) { this.engine.setHardwareScalingLevel(1 / Math.min(r, window.devicePixelRatio)); }
  setBloom(s, _r, t) { if (!this.pipeline) return; if (s !== undefined) this.pipeline.bloomWeight = s; if (t !== undefined) this.pipeline.bloomThreshold = t; }
  setToneMapping(e) { if (this.pipeline) this.pipeline.imageProcessing.exposure = e; }
  screenshot(mime = 'image/png') { if (this.scene) this.scene.render(); return this.canvas.toDataURL(mime); }

  dispose() {
    this._ro?.disconnect();
    this.pipeline?.dispose();
    this.scene?.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }
}

window.RenderPipeline = RenderPipeline;
