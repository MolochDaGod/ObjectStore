/**
 * ViewerAPI.js — Public API exposed as window.GrudgeViewer
 * Wraps the inline Babylon.js viewer for programmatic access
 * Uses global BABYLON namespace (UMD CDN build)
 */
class ViewerAPI {
  constructor(viewerRef) {
    this._v = viewerRef; // Reference to the inline viewer state
  }
  scene() { return this._v?.scene; }
  camera() { return this._v?.camera; }
  engine() { return this._v?.engine; }
  currentModel() { return this._v?.currentModel; }
}

window.ViewerAPI = ViewerAPI;
