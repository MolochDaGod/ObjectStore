/**
 * MaterialEditor.js — PBR material inspector and editor
 * Reads/writes material props on selected model, manages texture slots
 */
import * as THREE from 'three';

/** All PBR-relevant texture map slot names */
export const TEXTURE_SLOTS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'bumpMap', 'displacementMap'];

export class MaterialEditor {
  /** @param {import('./PlayCanvas.js').PlayCanvas} playCanvas */
  constructor(playCanvas) {
    this.canvas = playCanvas;
    this._inspectorEl = null;
    this._currentMaterials = [];
    this._inspectedObject = null; // standalone mode
  }

  /** Attach to the inspector DOM container */
  mount(containerEl) {
    this._inspectorEl = containerEl;
    // Listen to selection changes
    this.canvas.on('selection-changed', e => this._onSelectionChanged(e.detail));
  }

  _onSelectionChanged(detail) {
    if (!this._inspectorEl) return;
    if (!detail.entry) {
      this._inspectorEl.innerHTML = '<div style="padding:16px;color:var(--text-dim,#888);font-size:12px;">Select a model to inspect materials</div>';
      this._currentMaterials = [];
      return;
    }
    this._collectMaterials(detail.entry.object);
    this._renderInspector();
  }

  _collectMaterials(object) {
    const seen = new Set();
    this._currentMaterials = [];
    object.traverse(child => {
      if (!child.isMesh || !child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of mats) {
        if (seen.has(m.uuid)) continue;
        seen.add(m.uuid);
        this._currentMaterials.push({ material: m, meshName: child.name || 'unnamed' });
      }
    });
  }

  _renderInspector() {
    if (!this._inspectorEl) return;
    const mats = this._currentMaterials;
    if (mats.length === 0) {
      this._inspectorEl.innerHTML = '<div style="padding:16px;color:var(--text-dim,#888);font-size:12px;">No materials found</div>';
      return;
    }

    let html = '';
    mats.forEach((entry, idx) => {
      const m = entry.material;
      const type = m.type || 'Unknown';
      const color = m.color ? '#' + m.color.getHexString() : '#cccccc';
      const emissive = m.emissive ? '#' + m.emissive.getHexString() : '#000000';

      html += `<div class="mat-section" data-idx="${idx}">
        <div class="mat-header">${entry.meshName} — <span style="color:var(--tier-4,#d4a84b)">${type}</span></div>
        <div class="mat-row"><label>Color</label><input type="color" value="${color}" data-prop="color" data-idx="${idx}"></div>
        ${m.metalness !== undefined ? `<div class="mat-row"><label>Metalness</label><input type="range" min="0" max="1" step="0.01" value="${m.metalness}" data-prop="metalness" data-idx="${idx}"><span>${m.metalness.toFixed(2)}</span></div>` : ''}
        ${m.roughness !== undefined ? `<div class="mat-row"><label>Roughness</label><input type="range" min="0" max="1" step="0.01" value="${m.roughness}" data-prop="roughness" data-idx="${idx}"><span>${m.roughness.toFixed(2)}</span></div>` : ''}
        ${m.emissive ? `<div class="mat-row"><label>Emissive</label><input type="color" value="${emissive}" data-prop="emissive" data-idx="${idx}"></div>` : ''}
        ${m.emissiveIntensity !== undefined ? `<div class="mat-row"><label>Emissive Int.</label><input type="range" min="0" max="5" step="0.1" value="${m.emissiveIntensity}" data-prop="emissiveIntensity" data-idx="${idx}"><span>${m.emissiveIntensity.toFixed(1)}</span></div>` : ''}
        ${m.opacity !== undefined ? `<div class="mat-row"><label>Opacity</label><input type="range" min="0" max="1" step="0.01" value="${m.opacity}" data-prop="opacity" data-idx="${idx}"><span>${m.opacity.toFixed(2)}</span></div>` : ''}
        <div class="mat-row"><label>Wireframe</label><input type="checkbox" ${m.wireframe ? 'checked' : ''} data-prop="wireframe" data-idx="${idx}"></div>
        <div class="mat-row"><label>Flat Shading</label><input type="checkbox" ${m.flatShading ? 'checked' : ''} data-prop="flatShading" data-idx="${idx}"></div>
        <div class="mat-maps">
          ${TEXTURE_SLOTS.map(slot => {
            const hasMap = !!m[slot];
            return `<div class="mat-map-slot ${hasMap ? 'has-map' : ''}" data-slot="${slot}" data-idx="${idx}" title="${slot}">
              <span class="slot-name">${slot.replace('Map', '')}</span>
              <span class="slot-status">${hasMap ? '●' : '○'}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    });

    html += `<div style="padding:8px"><button class="mat-upgrade-btn" id="matUpgradeAll">Upgrade all → Standard</button></div>`;
    this._inspectorEl.innerHTML = html;
    this._bindEvents();
  }

  _bindEvents() {
    if (!this._inspectorEl) return;

    // Sliders and color inputs
    this._inspectorEl.querySelectorAll('input[data-prop]').forEach(input => {
      const handler = () => {
        const idx = parseInt(input.dataset.idx);
        const prop = input.dataset.prop;
        const mat = this._currentMaterials[idx]?.material;
        if (!mat) return;

        if (prop === 'color' || prop === 'emissive') {
          mat[prop].set(input.value);
        } else if (prop === 'wireframe' || prop === 'flatShading') {
          mat[prop] = input.checked;
          mat.needsUpdate = true;
        } else {
          mat[prop] = parseFloat(input.value);
          const span = input.nextElementSibling;
          if (span?.tagName === 'SPAN') span.textContent = parseFloat(input.value).toFixed(2);
        }
        if (prop === 'opacity') mat.transparent = mat.opacity < 1;
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });

    // Texture map slot clicks — open file picker
    this._inspectorEl.querySelectorAll('.mat-map-slot').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        const slot = el.dataset.slot;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
          if (input.files[0]) this._applyTextureFromFile(idx, slot, input.files[0]);
        };
        input.click();
      });
    });

    // Upgrade all button
    const btn = this._inspectorEl.querySelector('#matUpgradeAll');
    if (btn) btn.addEventListener('click', () => this.upgradeAllToStandard());
  }

  async _applyTextureFromFile(matIdx, slot, file) {
    const url = URL.createObjectURL(file);
    const loader = new THREE.TextureLoader();
    try {
      const texture = await loader.loadAsync(url);
      texture.colorSpace = (slot === 'map' || slot === 'emissiveMap') ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
      const mat = this._currentMaterials[matIdx]?.material;
      if (mat) {
        mat[slot] = texture;
        mat.needsUpdate = true;
        this._renderInspector();
      }
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
  }

  /** Upgrade all MeshBasicMaterial/MeshPhongMaterial → MeshStandardMaterial */
  upgradeAllToStandard() {
    // Support both PlayCanvas mode and standalone mode
    let targetObj = this._inspectedObject;
    if (!targetObj && this.canvas?.selectedId) {
      const entry = this.canvas.getModel(this.canvas.selectedId);
      targetObj = entry?.object;
    }
    if (!targetObj) return;
    targetObj.traverse(child => {
      if (!child.isMesh || !child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      const upgraded = mats.map(m => {
        if (m.type === 'MeshStandardMaterial' || m.type === 'MeshPhysicalMaterial') return m;
        const params = {
          color: m.color?.clone() || new THREE.Color(0xcccccc),
          map: m.map || null,
          roughness: 0.6,
          metalness: 0.2,
          side: m.side,
          transparent: m.transparent,
          opacity: m.opacity,
        };
        if (m.normalMap) params.normalMap = m.normalMap;
        if (m.emissive) params.emissive = m.emissive.clone();
        m.dispose();
        return new THREE.MeshStandardMaterial(params);
      });
      child.material = upgraded.length === 1 ? upgraded[0] : upgraded;
    });
    this._collectMaterials(targetObj);
    this._renderInspector();
  }

  /** Standalone buildUI (used when not attached to PlayCanvas) */
  buildUI(containerEl) {
    this._inspectorEl = containerEl;
    containerEl.innerHTML = '<div style="padding:16px;color:#888;font-size:12px;">Select a model to inspect materials</div>';
  }

  /** Inspect a model directly (standalone mode — no PlayCanvas needed) */
  inspect(object) {
    if (!object || !this._inspectorEl) return;
    this._inspectedObject = object;
    this._collectMaterials(object);
    this._renderInspector();
  }

  /** Get material data for serialization */
  getMaterialData(matIdx) {
    const entry = this._currentMaterials[matIdx];
    if (!entry) return null;
    const m = entry.material;
    return {
      type: m.type,
      color: m.color ? '#' + m.color.getHexString() : null,
      metalness: m.metalness,
      roughness: m.roughness,
      emissive: m.emissive ? '#' + m.emissive.getHexString() : null,
      emissiveIntensity: m.emissiveIntensity,
      opacity: m.opacity,
      wireframe: m.wireframe,
      maps: TEXTURE_SLOTS.reduce((acc, slot) => { acc[slot] = !!m[slot]; return acc; }, {}),
    };
  }
}
