/**
 * ModelConverter.js — Client-side model conversion via Babylon.js
 * Loads models (GLB/GLTF/OBJ) and re-exports as GLB using GLTF2Export
 * FBX is not supported by Babylon.js in-browser — those must be pre-converted
 * Uses global BABYLON namespace (UMD CDN build)
 */
class ModelConverter {
  constructor() {
    this._r2WorkerUrl = '';
    this._onProgress = null;
  }

  setR2Url(url) { this._r2WorkerUrl = url; }
  onProgress(cb) { this._onProgress = cb; }
  _progress(stage, pct, msg) { if (this._onProgress) this._onProgress(stage, pct, msg); }

  /**
   * Convert a file to GLB (GLB/GLTF/OBJ supported; FBX not supported in-browser)
   * @param {File} file
   * @returns {Promise<{blob: Blob, name: string, animations: number, meshes: number, verts: number}>}
   */
  async convertToGLB(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'fbx') throw new Error('FBX conversion requires a server-side tool (Babylon.js does not support FBX in-browser). Please convert via Blender or fbx2gltf first.');

    const url = URL.createObjectURL(file);
    this._progress('load', 0, 'Loading ' + file.name + '...');

    // Create a temporary engine+scene for loading
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1; tempCanvas.height = 1;
    const tempEngine = new BABYLON.Engine(tempCanvas, false);
    const tempScene = new BABYLON.Scene(tempEngine);

    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync('', '', url, tempScene, null, ext === 'obj' ? '.obj' : '.glb');

      let meshes = 0, verts = 0;
      result.meshes.forEach(m => {
        meshes++;
        if (m.getTotalVertices) verts += m.getTotalVertices();
      });

      const animations = tempScene.animationGroups?.length ?? 0;
      this._progress('export', 50, 'Exporting to GLB...');

      // Export using GLTF2Export (from serializers UMD)
      const glb = await BABYLON.GLTF2Export.GLBAsync(tempScene, file.name.replace(/\.[^/.]+$/, ''));
      const blob = glb.glTFFiles[Object.keys(glb.glTFFiles)[0]];

      this._progress('done', 100, 'Conversion complete');

      return {
        blob,
        name: file.name.replace(/\.[^/.]+$/, '') + '.glb',
        animations,
        meshes,
        verts,
      };
    } finally {
      URL.revokeObjectURL(url);
      tempScene.dispose();
      tempEngine.dispose();
      tempCanvas.remove();
    }
  }

  async batchConvert(files) {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      this._progress('batch', Math.round((i / files.length) * 100), `Converting ${i + 1}/${files.length}: ${files[i].name}`);
      try { results.push(await this.convertToGLB(files[i])); }
      catch (err) { results.push({ blob: null, name: files[i].name, error: err.message }); }
    }
    this._progress('batch-done', 100, `Batch complete: ${results.length} files`);
    return results;
  }

  downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }

  async uploadToR2(blob, filename) {
    if (!this._r2WorkerUrl) return { ok: false, key: '', error: 'R2 URL not configured' };
    this._progress('upload', 0, 'Uploading to R2...');
    const key = 'models/converted/' + Date.now() + '-' + filename;
    const fd = new FormData();
    fd.append('file', blob, filename);
    fd.append('key', key);
    fd.append('category', '3d-models');
    fd.append('tags', JSON.stringify(['glb', '3d', 'converted']));
    try {
      const res = await fetch(this._r2WorkerUrl + '/v1/assets', { method: 'POST', body: fd });
      if (res.ok) { this._progress('upload-done', 100, 'Uploaded: ' + key); return { ok: true, key }; }
      return { ok: false, key: '', error: 'HTTP ' + res.status };
    } catch (err) { return { ok: false, key: '', error: err.message }; }
  }

  async convertAndUpload(file) {
    const result = await this.convertToGLB(file);
    if (!result.blob) return { ok: false, key: '', name: file.name, error: 'Conversion failed' };
    const upload = await this.uploadToR2(result.blob, result.name);
    return { ...upload, name: result.name };
  }
}

window.ModelConverter = ModelConverter;
