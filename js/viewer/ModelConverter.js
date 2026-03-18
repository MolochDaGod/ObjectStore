/**
 * ModelConverter.js — Client-side model format conversion
 * FBX/OBJ → GLB via Three.js loaders + GLTFExporter
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelConverter {
  constructor() {
    this._exporter = new GLTFExporter();
    this._dracoLoader = new DRACOLoader();
    this._dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/');
    this._r2WorkerUrl = '';
    this._onProgress = null;
  }

  /** Set R2 worker URL for uploads */
  setR2Url(url) { this._r2WorkerUrl = url; }

  /** Set progress callback: (stage, percent, message) => void */
  onProgress(cb) { this._onProgress = cb; }

  _progress(stage, pct, msg) {
    if (this._onProgress) this._onProgress(stage, pct, msg);
  }

  /* ═══════════════ Single Conversion ═══════════════ */

  /**
   * Convert a file to GLB
   * @param {File} file - Source model file
   * @returns {Promise<{blob: Blob, name: string, animations: number, meshes: number, verts: number}>}
   */
  async convertToGLB(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const url = URL.createObjectURL(file);

    this._progress('load', 0, 'Loading ' + file.name + '...');

    let object, animations = [];
    try {
      if (ext === 'fbx') {
        const loader = new FBXLoader();
        object = await loader.loadAsync(url);
        animations = object.animations || [];
      } else if (ext === 'obj') {
        const loader = new OBJLoader();
        object = await loader.loadAsync(url);
        // Upgrade materials
        object.traverse(child => {
          if (child.isMesh && (!child.material || child.material.type === 'MeshBasicMaterial')) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6, metalness: 0.2 });
          }
        });
      } else if (ext === 'gltf') {
        const loader = new GLTFLoader();
        loader.setDRACOLoader(this._dracoLoader);
        const gltf = await loader.loadAsync(url);
        object = gltf.scene;
        animations = gltf.animations || [];
      } else if (ext === 'glb') {
        // GLB → GLB re-export (useful for optimization)
        const loader = new GLTFLoader();
        loader.setDRACOLoader(this._dracoLoader);
        const gltf = await loader.loadAsync(url);
        object = gltf.scene;
        animations = gltf.animations || [];
      } else {
        throw new Error('Unsupported format: .' + ext);
      }
    } finally {
      URL.revokeObjectURL(url);
    }

    this._progress('export', 50, 'Exporting to GLB...');

    // Gather stats
    let meshes = 0, verts = 0;
    object.traverse(child => {
      if (child.isMesh && child.geometry) {
        meshes++;
        if (child.geometry.attributes.position) verts += child.geometry.attributes.position.count;
      }
    });

    // Export
    const glbData = await this._exporter.parseAsync(object, {
      binary: true,
      animations,
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const blob = new Blob([glbData], { type: 'model/gltf-binary' });

    this._progress('done', 100, 'Conversion complete');

    // Cleanup
    object.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => m.dispose());
      }
    });

    return {
      blob,
      name: baseName + '.glb',
      animations: animations.length,
      meshes,
      verts,
    };
  }

  /* ═══════════════ Batch Conversion ═══════════════ */

  /**
   * Convert multiple files and return results
   * @param {File[]} files
   * @returns {Promise<Array<{blob:Blob, name:string, error?:string}>>}
   */
  async batchConvert(files) {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      this._progress('batch', Math.round((i / files.length) * 100), `Converting ${i + 1}/${files.length}: ${files[i].name}`);
      try {
        const result = await this.convertToGLB(files[i]);
        results.push(result);
      } catch (err) {
        results.push({ blob: null, name: files[i].name, error: err.message });
      }
    }
    this._progress('batch-done', 100, `Batch complete: ${results.length} files`);
    return results;
  }

  /* ═══════════════ Download ═══════════════ */

  /** Download a blob as a file */
  downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }

  /* ═══════════════ R2 Upload ═══════════════ */

  /**
   * Upload a converted GLB to R2
   * @param {Blob} blob
   * @param {string} filename
   * @returns {Promise<{ok: boolean, key: string, error?: string}>}
   */
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
      if (res.ok) {
        this._progress('upload-done', 100, 'Uploaded: ' + key);
        return { ok: true, key };
      }
      return { ok: false, key: '', error: 'HTTP ' + res.status };
    } catch (err) {
      return { ok: false, key: '', error: err.message };
    }
  }

  /**
   * Convert a file to GLB and upload to R2 in one step
   * @param {File} file
   * @returns {Promise<{ok:boolean, key:string, name:string, error?:string}>}
   */
  async convertAndUpload(file) {
    const result = await this.convertToGLB(file);
    if (!result.blob) return { ok: false, key: '', name: file.name, error: 'Conversion failed' };
    const upload = await this.uploadToR2(result.blob, result.name);
    return { ...upload, name: result.name };
  }
}
