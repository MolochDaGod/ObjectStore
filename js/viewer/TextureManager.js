/**
 * TextureManager.js — Babylon.js texture loading, browsing, and slot assignment
 * Uses global BABYLON namespace (UMD CDN build)
 */
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

class TextureManager {
  constructor() {
    this._cache = new Map();
    this._browserEl = null;
    this._baseUrl = '';
    this._scene = null;
    this._inspectedObject = null;
  }

  setBaseUrl(url) { this._baseUrl = url.replace(/\/$/, ''); }
  setScene(scene) { this._scene = scene; }

  buildUI(containerEl) {
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
          <img src="${src}" alt="${tex.name}" loading="lazy"><span>${tex.name}</span></div>`;
      }
      html += '</div>';
    }
    html += `<div class="tex-category">Load Custom</div>
      <div class="tex-drop-zone" id="texDropZone"><span>Drop image or click</span>
        <input type="file" accept="image/*" id="texFileInput" style="display:none"></div>`;
    this._browserEl.innerHTML = html;
    this._bindBrowserEvents();
  }

  _bindBrowserEvents() {
    if (!this._browserEl) return;
    this._browserEl.querySelectorAll('.tex-thumb').forEach(el => {
      el.addEventListener('click', () => {
        const path = el.dataset.path;
        const url = this._baseUrl ? this._baseUrl + '/' + path : path;
        this.applyToInspected('albedoTexture', url);
      });
    });
    const dropZone = this._browserEl.querySelector('#texDropZone');
    const fileInput = this._browserEl.querySelector('#texFileInput');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
          const url = URL.createObjectURL(fileInput.files[0]);
          this.applyToInspected('albedoTexture', url);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      });
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone.addEventListener('drop', e => {
        e.preventDefault(); dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) {
          const url = URL.createObjectURL(e.dataTransfer.files[0]);
          this.applyToInspected('albedoTexture', url);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      });
    }
  }

  loadTexture(url) {
    if (this._cache.has(url)) return this._cache.get(url);
    if (!this._scene) return null;
    const tex = new BABYLON.Texture(url, this._scene);
    this._cache.set(url, tex);
    return tex;
  }

  applyToMesh(mesh, slot, url) {
    const tex = this.loadTexture(url);
    if (!tex || !mesh?.material) return;
    mesh.material[slot] = tex;
  }

  applyToInspected(slot, url) {
    if (!this._inspectedObject) return;
    const tex = this.loadTexture(url);
    if (!tex) return;
    const meshes = this._inspectedObject.getChildMeshes ? this._inspectedObject.getChildMeshes(false) : [];
    meshes.forEach(m => {
      if (m.material) m.material[slot] = tex;
    });
  }

  setInspectedObject(obj) { this._inspectedObject = obj; }
  getLibrary() { return KNOWN_TEXTURES; }
  clearCache() { for (const t of this._cache.values()) t.dispose(); this._cache.clear(); }
}

window.TextureManager = TextureManager;
