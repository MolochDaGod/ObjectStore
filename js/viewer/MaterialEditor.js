/**
 * MaterialEditor.js — Babylon.js PBRMaterial inspector and editor
 * Uses global BABYLON namespace (UMD CDN build)
 */
const BJS_TEXTURE_SLOTS = ['albedoTexture', 'bumpTexture', 'metallicTexture', 'ambientTexture', 'emissiveTexture', 'reflectivityTexture'];

class MaterialEditor {
  constructor() {
    this._inspectorEl = null;
    this._currentMaterials = [];
    this._inspectedObject = null;
  }

  buildUI(containerEl) {
    this._inspectorEl = containerEl;
    containerEl.innerHTML = '<div style="padding:16px;color:#888;font-size:12px;">Select a model to inspect materials</div>';
  }

  inspect(rootMesh) {
    if (!rootMesh || !this._inspectorEl) return;
    this._inspectedObject = rootMesh;
    this._collectMaterials(rootMesh);
    this._renderInspector();
  }

  _collectMaterials(root) {
    const seen = new Set();
    this._currentMaterials = [];
    const meshes = root.getChildMeshes ? root.getChildMeshes(false) : [];
    meshes.forEach(m => {
      if (!m.material || seen.has(m.material.uniqueId)) return;
      seen.add(m.material.uniqueId);
      this._currentMaterials.push({ material: m.material, meshName: m.name || 'unnamed' });
    });
    // Also check root itself
    if (root.material && !seen.has(root.material.uniqueId)) {
      this._currentMaterials.push({ material: root.material, meshName: root.name || 'root' });
    }
  }

  _renderInspector() {
    if (!this._inspectorEl) return;
    const mats = this._currentMaterials;
    if (!mats.length) { this._inspectorEl.innerHTML = '<div style="padding:16px;color:#888;font-size:12px;">No materials found</div>'; return; }

    let html = '';
    mats.forEach((entry, idx) => {
      const m = entry.material;
      const type = m.getClassName?.() || 'Unknown';
      const color = m.albedoColor || m.diffuseColor;
      const hex = color ? color.toHexString() : '#cccccc';
      const emissive = m.emissiveColor ? m.emissiveColor.toHexString() : '#000000';

      html += `<div class="mat-section" data-idx="${idx}">
        <div class="mat-header">${entry.meshName} — <span style="color:var(--tier-4,#d4a84b)">${type}</span></div>
        <div class="mat-row"><label>Color</label><input type="color" value="${hex}" data-prop="color" data-idx="${idx}"></div>
        ${m.metallic !== undefined ? `<div class="mat-row"><label>Metallic</label><input type="range" min="0" max="1" step="0.01" value="${m.metallic}" data-prop="metallic" data-idx="${idx}"><span>${m.metallic.toFixed(2)}</span></div>` : ''}
        ${m.roughness !== undefined ? `<div class="mat-row"><label>Roughness</label><input type="range" min="0" max="1" step="0.01" value="${m.roughness}" data-prop="roughness" data-idx="${idx}"><span>${m.roughness.toFixed(2)}</span></div>` : ''}
        ${m.emissiveColor ? `<div class="mat-row"><label>Emissive</label><input type="color" value="${emissive}" data-prop="emissive" data-idx="${idx}"></div>` : ''}
        ${m.alpha !== undefined ? `<div class="mat-row"><label>Opacity</label><input type="range" min="0" max="1" step="0.01" value="${m.alpha}" data-prop="alpha" data-idx="${idx}"><span>${m.alpha.toFixed(2)}</span></div>` : ''}
        <div class="mat-row"><label>Wireframe</label><input type="checkbox" ${m.wireframe ? 'checked' : ''} data-prop="wireframe" data-idx="${idx}"></div>
        <div class="mat-maps">
          ${BJS_TEXTURE_SLOTS.map(slot => {
            const hasMap = !!m[slot];
            const label = slot.replace('Texture', '');
            return `<div class="mat-map-slot ${hasMap ? 'has-map' : ''}" data-slot="${slot}" data-idx="${idx}" title="${slot}">
              <span class="slot-name">${label}</span><span class="slot-status">${hasMap ? '●' : '○'}</span></div>`;
          }).join('')}
        </div>
      </div>`;
    });

    html += `<div style="padding:8px"><button class="mat-upgrade-btn" id="matUpgradeAll">Upgrade all → PBR</button></div>`;
    this._inspectorEl.innerHTML = html;
    this._bindEvents();
  }

  _bindEvents() {
    if (!this._inspectorEl) return;
    this._inspectorEl.querySelectorAll('input[data-prop]').forEach(input => {
      const handler = () => {
        const idx = parseInt(input.dataset.idx);
        const prop = input.dataset.prop;
        const mat = this._currentMaterials[idx]?.material;
        if (!mat) return;
        if (prop === 'color') {
          const c = BABYLON.Color3.FromHexString(input.value);
          if (mat.albedoColor) mat.albedoColor = c;
          else if (mat.diffuseColor) mat.diffuseColor = c;
        } else if (prop === 'emissive') {
          mat.emissiveColor = BABYLON.Color3.FromHexString(input.value);
        } else if (prop === 'wireframe') {
          mat.wireframe = input.checked;
        } else if (prop === 'alpha') {
          mat.alpha = parseFloat(input.value);
          const span = input.nextElementSibling;
          if (span?.tagName === 'SPAN') span.textContent = parseFloat(input.value).toFixed(2);
        } else {
          mat[prop] = parseFloat(input.value);
          const span = input.nextElementSibling;
          if (span?.tagName === 'SPAN') span.textContent = parseFloat(input.value).toFixed(2);
        }
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });

    this._inspectorEl.querySelectorAll('.mat-map-slot').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        const slot = el.dataset.slot;
        const fi = document.createElement('input');
        fi.type = 'file'; fi.accept = 'image/*';
        fi.onchange = () => { if (fi.files[0]) this._applyTextureFromFile(idx, slot, fi.files[0]); };
        fi.click();
      });
    });

    const btn = this._inspectorEl.querySelector('#matUpgradeAll');
    if (btn) btn.addEventListener('click', () => this.upgradeAllToPBR());
  }

  _applyTextureFromFile(matIdx, slot, file) {
    const url = URL.createObjectURL(file);
    const mat = this._currentMaterials[matIdx]?.material;
    if (!mat) return;
    const scene = mat.getScene();
    const tex = new BABYLON.Texture(url, scene);
    mat[slot] = tex;
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    this._renderInspector();
  }

  upgradeAllToPBR() {
    if (!this._inspectedObject) return;
    const meshes = this._inspectedObject.getChildMeshes ? this._inspectedObject.getChildMeshes(false) : [];
    meshes.forEach(m => {
      if (!m.material) return;
      const old = m.material;
      if (old.getClassName() === 'PBRMaterial') return;
      const pbr = new BABYLON.PBRMaterial(old.name + '_pbr', old.getScene());
      pbr.albedoColor = old.diffuseColor?.clone() || new BABYLON.Color3(0.8, 0.8, 0.8);
      pbr.metallic = 0.2; pbr.roughness = 0.6;
      if (old.diffuseTexture) pbr.albedoTexture = old.diffuseTexture;
      if (old.bumpTexture) pbr.bumpTexture = old.bumpTexture;
      if (old.emissiveColor) pbr.emissiveColor = old.emissiveColor.clone();
      pbr.alpha = old.alpha;
      m.material = pbr;
      old.dispose();
    });
    this._collectMaterials(this._inspectedObject);
    this._renderInspector();
  }
}

window.MaterialEditor = MaterialEditor;
