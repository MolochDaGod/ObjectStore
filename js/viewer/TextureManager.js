/**
 * TextureManager.js — Texture loading, browsing, and PBR slot assignment
 */
import * as THREE from 'three';

const KNOWN_TEXTURES = {
  characters: [
    { name: 'Barbarian', path: 'textures/characters/barbarian_texture.png' },
    { name: 'Knight', path: 'textures/characters/knight_texture.png' },
    { name: 'Mage', path: 'textures/characters/mage_texture.png' },
    { name: 'Ranger', path: 'textures/characters/ranger_texture.png' },
    { name: 'Rogue', path: 'textures/characters/rogue_texture.png' },
  ],
  terrain: [
    { name: 'Grass', path: 'textures/terrain/grass_default.png' },
    { name: 'Dirt', path: 'textures/terrain/dirt_default.png' },
    { name: 'Rock', path: 'textures/terrain/rock_default.png' },
    { name: 'Water', path: 'textures/terrain/water_default.png' },
  ],
};

export class TextureManager {
  /** @param {import('./PlayCanvas.js').PlayCanvas} playCanvas */
  constructor(playCanvas) {
    this.canvas = playCanvas;
    this._loader = new THREE.TextureLoader();
    /** @type {Map<string, THREE.Texture>} cached textures by URL */
    this._cache = new Map();
    this._browserEl = null;
    this._baseUrl = '';
  }

  /** Set the base URL for resolving relative texture paths (e.g. ObjectStore root) */
  setBaseUrl(url) { this._baseUrl = url.replace(/\/$/, ''); }

  /** Mount texture browser into a DOM element */
  mount(containerEl) {
    this._browserEl = containerEl;
    this._renderBrowser();
  }

  _renderBrowser() {
    if (!this._browserEl) return;

    let html = '<div class="tex-title">Texture Library</div>';

    for (const [category, textures] of Object.entries(KNOWN_TEXTURES)) {
      html += `<div class="tex-category">${category}</div><div class="tex-grid">`;
      for (const tex of textures) {
        const src = this._baseUrl ? this._baseUrl + '/' + tex.path : tex.path;
        html += `<div class="tex-thumb" data-path="${tex.path}" title="${tex.name}">
          <img src="${src}" alt="${tex.name}" loading="lazy">
          <span>${tex.name}</span>
        </div>`;
      }
      html += '</div>';
    }

    html += `<div class="tex-category">Load Custom</div>
      <div class="tex-drop-zone" id="texDropZone">
        <span>Drop image or click</span>
        <input type="file" accept="image/*" id="texFileInput" style="display:none">
      </div>`;

    this._browserEl.innerHTML = html;
    this._bindBrowserEvents();
  }

  _bindBrowserEvents() {
    if (!this._browserEl) return;

    // Thumbnail click → apply to selected model's diffuse map
    this._browserEl.querySelectorAll('.tex-thumb').forEach(el => {
      el.addEventListener('click', async () => {
        const path = el.dataset.path;
        const url = this._baseUrl ? this._baseUrl + '/' + path : path;
        await this.applyToSelected('map', url);
      });
    });

    // File drop zone
    const dropZone = this._browserEl.querySelector('#texDropZone');
    const fileInput = this._browserEl.querySelector('#texFileInput');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        if (fileInput.files[0]) {
          const url = URL.createObjectURL(fileInput.files[0]);
          await this.applyToSelected('map', url);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      });
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone.addEventListener('drop', async e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) {
          const url = URL.createObjectURL(e.dataTransfer.files[0]);
          await this.applyToSelected('map', url);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      });
    }
  }

  /* ═══════════════ Core API ═══════════════ */

  /**
   * Load a texture (cached)
   * @param {string} url
   * @param {boolean} [isSRGB=true]
   * @returns {Promise<THREE.Texture>}
   */
  async loadTexture(url, isSRGB = true) {
    if (this._cache.has(url)) return this._cache.get(url);
    const texture = await this._loader.loadAsync(url);
    texture.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
    texture.flipY = false;
    this._cache.set(url, texture);
    return texture;
  }

  /**
   * Apply texture to a specific model + slot
   * @param {number} modelId
   * @param {string} slot - 'map'|'normalMap'|'roughnessMap'|etc
   * @param {string} url
   */
  async applyToModel(modelId, slot, url) {
    if (!this.canvas) return;
    const entry = this.canvas.getModel(modelId);
    if (!entry) return;
    const isSRGB = slot === 'map' || slot === 'emissiveMap';
    const texture = await this.loadTexture(url, isSRGB);
    entry.object.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => {
          if (m[slot] !== undefined || slot === 'map') {
            m[slot] = texture;
            m.needsUpdate = true;
          }
        });
      }
    });
  }

  /** Apply to currently selected model */
  async applyToSelected(slot, url) {
    if (!this.canvas?.selectedId) return;
    await this.applyToModel(this.canvas.selectedId, slot, url);
  }

  /** Standalone buildUI — renders the texture browser (no PlayCanvas required) */
  buildUI(containerEl) {
    this._browserEl = containerEl;
    this._renderBrowser();
  }

  /** Get known texture library */
  getLibrary() { return KNOWN_TEXTURES; }

  /** Clear texture cache */
  clearCache() {
    for (const tex of this._cache.values()) tex.dispose();
    this._cache.clear();
  }
}
