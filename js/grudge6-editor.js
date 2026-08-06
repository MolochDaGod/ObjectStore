/**
 * grudge6 Editor core — Toon RTS ★ character + T0–T1 equip + skill APIs + hierarchy/gizmo/export.
 * SSOT: api/v1/grudge6-editor-ssot.json · mesh: grudge6-kit loadRaceKit(toonRts)
 */
import * as THREE from 'https://esm.sh/three@0.185.0';
import { OrbitControls } from 'https://esm.sh/three@0.185.0/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://esm.sh/three@0.185.0/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.185.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://esm.sh/three@0.185.0/examples/jsm/loaders/FBXLoader.js';
import { GLTFExporter } from 'https://esm.sh/three@0.185.0/examples/jsm/exporters/GLTFExporter.js';
import {
  RACE_ASSETS,
  loadRaceKit,
  fitRootUniformSi,
  SLOT_DEFS,
} from './grudge6-kit.js';
import {
  prepareLabWeaponRoot,
  attachToSocket,
  hideKitWeaponsForLab,
  resolveLabAttachSlot,
  kindMeta,
} from './grudge6-lab-weapons.js';
import {
  packForWeaponSlot,
  clipUrlsFor,
  loadBakedClip,
  rematchClipBones,
} from './grudge6-anim-packs.js';

const CDN = 'https://assets.grudge-studio.com';

export const EDITOR_SLOTS = [
  { id: 'body', group: 'armor', label: 'Body', equipSlot: 'body' },
  { id: 'arms', group: 'armor', label: 'Arms', equipSlot: 'arms' },
  { id: 'legs', group: 'armor', label: 'Legs', equipSlot: 'legs' },
  { id: 'head', group: 'armor', label: 'Head', equipSlot: 'head' },
  { id: 'shoulders', group: 'armor', label: 'Shoulders', equipSlot: 'shoulders' },
  { id: 'main_hand', group: 'weapon', label: 'Main hand', equipSlot: 'main' },
  { id: 'off_hand', group: 'weapon', label: 'Off hand', equipSlot: 'off' },
  { id: 'relic', group: 'relic', label: 'Relic', equipSlot: null },
  { id: 'class_item', group: 'class', label: 'Class item', equipSlot: null },
  { id: 'form', group: 'form', label: 'Form / class loadout', equipSlot: null },
];

export class Grudge6Editor {
  constructor(host, ui) {
    this.host = host;
    this.ui = ui || {};
    this.raceId = 'human';
    this.classId = 'warrior';
    this.activeSlot = 'body';
    this.catalog = null;
    this.apis = {};
    this.equip = null;
    this.root = null;
    this.mixer = null;
    this.labHeld = { main: null, off: null };
    this.selected = null;
    this.clock = new THREE.Clock();
    this._disposed = false;
  }

  status(msg) {
    if (this.ui.status) this.ui.status.textContent = msg;
  }

  async init() {
    await this.loadApis();
    this.mountScene();
    this.bindUi();
    await this.loadRace(this.raceId);
    this.renderSlots();
    this.selectSlot('body');
  }

  async loadApis() {
    const files = {
      ssot: './api/v1/grudge6-editor-ssot.json',
      characters: './api/v1/grudge6-characters.json',
      lab: './api/v1/grudge6-lab-extended-catalog.json',
      t0Weapons: './api/v1/t0-weapons.json',
      t0t1: './api/v1/master-t0-t1-addendum.json',
      weaponSkills: './api/v1/master-weaponSkills.json',
      t0Skills: './api/v1/_meta/t0-starter-slot-pattern.json',
      relics: './api/v1/master-relics.json',
      classRelics: './api/v1/master-classRelics.json',
      classes: './api/v1/classes.json',
      iconsWeapon: './api/v1/icon-shards/weapon.json',
      iconsArmor: './api/v1/icon-shards/armor.json',
      iconsSkill: './api/v1/icon-shards/skill.json',
    };
    const out = {};
    await Promise.all(
      Object.entries(files).map(async ([k, url]) => {
        try {
          const r = await fetch(url, { cache: 'no-cache' });
          if (r.ok) out[k] = await r.json();
        } catch {
          out[k] = null;
        }
      }),
    );
    this.apis = out;
    this.catalog = out.characters;
  }

  mountScene() {
    const w = Math.max(this.host.clientWidth, 320);
    const h = Math.max(this.host.clientHeight, 400);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e14);
    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.05, 80);
    this.camera.position.set(1.4, 1.3, 3.2);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.host.innerHTML = '';
    this.host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';

    this.scene.add(new THREE.HemisphereLight(0xfff0e0, 0x101820, 0.9));
    const key = new THREE.DirectionalLight(0xffe6b0, 1.2);
    key.position.set(2.5, 5, 2);
    this.scene.add(key);
    this.scene.add(new THREE.GridHelper(4, 12, 0x3a2a10, 0x1a1510));

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.target.set(0, 0.9, 0);
    this.orbit.enableDamping = true;

    this.gizmo = new TransformControls(this.camera, this.renderer.domElement);
    this.gizmo.setSize(0.75);
    this.gizmo.addEventListener('dragging-changed', (e) => {
      this.orbit.enabled = !e.value;
    });
    this.scene.add(this.gizmo);

    const tick = () => {
      if (this._disposed) return;
      const dt = this.clock.getDelta();
      this.mixer?.update(dt);
      this.orbit.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    window.addEventListener('resize', () => {
      if (this._disposed) return;
      const nw = Math.max(this.host.clientWidth, 320);
      const nh = Math.max(this.host.clientHeight, 400);
      this.camera.aspect = nw / nh;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(nw, nh, false);
    });
  }

  bindUi() {
    const races = this.ui.raceSelect;
    if (races) {
      races.innerHTML = Object.keys(RACE_ASSETS)
        .map((id) => `<option value="${id}">${id}</option>`)
        .join('');
      races.value = this.raceId;
      races.onchange = () => this.loadRace(races.value);
    }
    const cls = this.ui.classSelect;
    if (cls) {
      const list = this.apis.classes?.classes || [
        { id: 'warrior', name: 'Warrior' },
        { id: 'mage', name: 'Mage' },
        { id: 'ranger', name: 'Ranger' },
        { id: 'unarmed', name: 'Unarmed' },
      ];
      const ids = Array.isArray(list)
        ? list.map((c) => (typeof c === 'string' ? c : c.id || c.name))
        : Object.keys(list || {});
      cls.innerHTML = ids
        .filter(Boolean)
        .slice(0, 24)
        .map((id) => `<option value="${String(id).toLowerCase()}">${id}</option>`)
        .join('');
      cls.value = this.classId;
      cls.onchange = () => {
        this.classId = cls.value;
        this.applyClassForm();
        this.refreshInventory();
        this.refreshSkills();
      };
    }
    if (this.ui.gizmoMode) {
      this.ui.gizmoMode.onchange = () => {
        const m = this.ui.gizmoMode.value;
        if (m === 'translate' || m === 'rotate' || m === 'scale') this.gizmo.setMode(m);
      };
    }
    if (this.ui.btnExport) this.ui.btnExport.onclick = () => this.exportSelectedGlb();
    if (this.ui.btnImport) {
      this.ui.fileInput?.addEventListener('change', (e) => this.importFile(e.target.files?.[0]));
      this.ui.btnImport.onclick = () => this.ui.fileInput?.click();
    }
    if (this.ui.btnDefault) {
      this.ui.btnDefault.onclick = () => {
        this.equip?.applyDefaultLoadout?.();
        this.equip?.hardenVisibility?.();
        this.refreshHierarchy();
        this.refreshInventory();
      };
    }
  }

  async loadRace(raceId) {
    this.raceId = raceId;
    this.status(`Loading Toon RTS ★ ${raceId}…`);
    if (this.root) {
      this.scene.remove(this.root);
      this.gizmo.detach();
      this.root = null;
      this.equip = null;
      this.labHeld = { main: null, off: null };
    }
    try {
      const kit = await loadRaceKit(THREE, { GLTFLoader, FBXLoader }, raceId, {
        source: 'toonRts',
        ground: false,
        skipDefaultLoadout: false,
        forceAtlas: false,
        invertUvV: false,
      });
      this.root = kit.root;
      this.equip = kit.equip;
      this.equip?.hardenVisibility?.();
      fitRootUniformSi(THREE, this.root, 1.8, { characterType: 'infantry', centerXZ: true });
      this.root.rotation.y = 0;
      this.scene.add(this.root);
      this.mixer = new THREE.AnimationMixer(this.root);
      await this.playIdle();
      this.applyClassForm();
      this.refreshHierarchy();
      this.refreshInventory();
      this.refreshSkills();
      this.status(
        `${raceId} · Toon RTS ★ · ${kit.materialMode} · equip slots ${Object.keys(this.equip?.summary?.() || {}).length}`,
      );
    } catch (e) {
      console.error(e);
      this.status(`Load failed: ${e.message}`);
    }
  }

  async playIdle() {
    if (!this.root || !this.mixer) return;
    const urls = clipUrlsFor('sword_shield', 'idle');
    let clip = await loadBakedClip(THREE, urls);
    if (!clip) return;
    clip = rematchClipBones(THREE, this.root, clip) || clip;
    this.mixer.stopAllAction();
    this.mixer.clipAction(clip).reset().fadeIn(0.15).play();
  }

  applyClassForm() {
    if (!this.equip || !this.catalog) return;
    const race = (this.catalog.races || []).find((r) => r.id === this.raceId);
    const meshIds = race?.classLoadouts?.[this.classId];
    if (meshIds?.length && this.equip.applyMeshIds) {
      this.equip.applyMeshIds(meshIds);
      this.equip.hardenVisibility?.();
    } else {
      this.equip.applyDefaultLoadout?.();
      this.equip.hardenVisibility?.();
    }
    this.refreshHierarchy();
  }

  renderSlots() {
    const el = this.ui.slots;
    if (!el) return;
    el.innerHTML = EDITOR_SLOTS.map(
      (s) =>
        `<button type="button" class="slot-btn ${s.id === this.activeSlot ? 'on' : ''}" data-slot="${s.id}">
          <span class="slot-group">${s.group}</span>${s.label}
        </button>`,
    ).join('');
    el.querySelectorAll('button').forEach((btn) => {
      btn.onclick = () => this.selectSlot(btn.dataset.slot);
    });
  }

  selectSlot(slotId) {
    this.activeSlot = slotId;
    this.renderSlots();
    this.refreshInventory();
    this.refreshSkills();
    // Select matching equipped mesh in hierarchy if any
    const def = EDITOR_SLOTS.find((s) => s.id === slotId);
    if (def?.equipSlot && this.equip?.slots?.[def.equipSlot]) {
      const v = this.equip.equipped?.[def.equipSlot];
      const mesh = this.equip.slots[def.equipSlot][v];
      if (mesh) this.selectObject(mesh);
    }
  }

  /**
   * Inventory for active slot — T0–T1 only from info APIs + kit mesh variants + lab weapons.
   */
  itemsForActiveSlot() {
    const slot = this.activeSlot;
    const items = [];
    const push = (it) => {
      if (!it) return;
      items.push(it);
    };

    // Kit mesh variants (armor / kit weapons)
    if (this.equip && ['body', 'arms', 'legs', 'head', 'shoulders'].includes(slot)) {
      const variants = Object.keys(this.equip.slots?.[slot] || {}).sort();
      for (const v of variants) {
        const mesh = this.equip.slots[slot][v];
        push({
          id: `mesh:${slot}_${v}`,
          name: mesh?.name || `${slot} ${v}`,
          tier: 'T0',
          kind: 'kit_mesh',
          slot,
          meshId: mesh?.name,
          variant: v,
          uuid: mesh?.name || null,
          icon: null,
          source: 'kit',
        });
      }
    }

    // Lab weapons T1 (external)
    const weapons = this.apis.lab?.externalWeapons || [];
    if (slot === 'main_hand') {
      for (const w of weapons.filter((x) => (x.tier || 1) <= 1 || String(x.id).includes('_t1') || String(x.id).includes('_t0'))) {
        // t0 not present — include t1 and first of each kind
        if (w.tier && w.tier > 1 && !/_t1$/i.test(w.id)) continue;
        push({
          id: w.meshId || w.id,
          name: w.id,
          tier: `T${w.tier || 1}`,
          kind: w.kind,
          slot: 'main_hand',
          meshId: w.meshId,
          lab: w,
          uuid: w.meshId,
          icon: this.iconForKind(w.kind),
          source: 'lab_weapon',
        });
      }
    }
    if (slot === 'off_hand') {
      for (const w of weapons) {
        if (!(w.canOffhand || kindMeta(w.kind).canOffhand)) continue;
        if (w.tier && w.tier > 1 && !/_t1$/i.test(w.id)) continue;
        push({
          id: w.meshId || w.id,
          name: w.id,
          tier: `T${w.tier || 1}`,
          kind: w.kind,
          slot: 'off_hand',
          meshId: w.meshId,
          lab: w,
          uuid: w.meshId,
          icon: this.iconForKind(w.kind),
          source: 'lab_weapon',
        });
      }
      // kit shields
      for (const v of Object.keys(this.equip?.slots?.shield || {}).sort()) {
        const mesh = this.equip.slots.shield[v];
        push({
          id: `mesh:shield_${v}`,
          name: mesh?.name || `shield ${v}`,
          tier: 'T0',
          kind: 'shield',
          slot: 'off_hand',
          meshId: mesh?.name,
          variant: v,
          uuid: mesh?.name,
          icon: this.iconForKind('shield'),
          source: 'kit',
        });
      }
    }

    // T0 weapons catalog
    if (slot === 'main_hand' || slot === 'off_hand') {
      const tw = this.apis.t0Weapons?.weapons || [];
      for (const w of tw) {
        push({
          id: w.id || w.uuid || w.name,
          name: w.name || w.id,
          tier: 'T0',
          kind: (w.type || w.category || 'weapon').toLowerCase(),
          slot: slot,
          uuid: w.uuid || w.id,
          icon: w.icon || w.iconUrl || this.iconForKind(w.type || w.category),
          meta: w,
          source: 't0-weapons',
        });
      }
      const add = this.apis.t0t1?.items || [];
      for (const w of add) {
        const tier = String(w.tier || w.itemTier || 'T1').toUpperCase();
        if (tier !== 'T0' && tier !== 'T1' && !/t0|t1/i.test(String(w.id))) continue;
        push({
          id: w.id || w.uuid,
          name: w.name || w.id,
          tier: tier.startsWith('T') ? tier : `T${tier}`,
          kind: (w.slot || w.type || 'item').toLowerCase(),
          slot,
          uuid: w.uuid || w.id,
          icon: w.icon || w.iconUrl,
          meta: w,
          source: 't0-t1-addendum',
        });
      }
    }

    // Relics T0-T1
    if (slot === 'relic') {
      const relics = this.apis.relics?.relics || this.apis.relics?.items || [];
      const list = Array.isArray(relics) ? relics : Object.values(relics || {});
      for (const r of list.slice(0, 80)) {
        const tier = String(r.tier || r.minTier || 'T0');
        if (/[2-9]|t[2-9]/i.test(tier) && !/t0|t1/i.test(String(r.id))) continue;
        push({
          id: r.id || r.uuid,
          name: r.name || r.id,
          tier: /t1/i.test(tier) ? 'T1' : 'T0',
          kind: 'relic',
          slot: 'relic',
          uuid: r.uuid || r.id,
          icon: r.icon,
          meta: r,
          source: 'master-relics',
        });
      }
    }

    // Class items
    if (slot === 'class_item') {
      const cr = this.apis.classRelics?.classRelics || this.apis.classRelics || {};
      const list = Array.isArray(cr) ? cr : Object.entries(cr).flatMap(([k, v]) => {
        if (Array.isArray(v)) return v.map((x) => ({ ...x, classId: k }));
        if (v && typeof v === 'object') return [{ ...v, classId: k, id: v.id || k }];
        return [];
      });
      for (const r of list.slice(0, 60)) {
        push({
          id: r.id || r.uuid || r.classId,
          name: r.name || r.id || r.classId,
          tier: 'T0',
          kind: 'class_item',
          slot: 'class_item',
          uuid: r.uuid || r.id,
          icon: r.icon,
          meta: r,
          source: 'master-classRelics',
        });
      }
    }

    // Forms = class loadouts
    if (slot === 'form') {
      const race = (this.catalog?.races || []).find((r) => r.id === this.raceId);
      const forms = Object.keys(race?.classLoadouts || { warrior: 1, mage: 1, ranger: 1, unarmed: 1 });
      for (const f of forms) {
        push({
          id: `form:${f}`,
          name: f,
          tier: 'T0',
          kind: 'form',
          slot: 'form',
          formId: f,
          meshIds: race?.classLoadouts?.[f],
          uuid: `${this.raceId}:${f}`,
          source: 'classLoadouts',
        });
      }
    }

    return items;
  }

  iconForKind(kind) {
    const k = String(kind || '').toLowerCase();
    const shard = this.apis.iconsWeapon || this.apis.iconsArmor || {};
    const icons = shard.icons || shard.items || shard;
    if (Array.isArray(icons)) {
      const hit = icons.find((i) => String(i.id || i.name || '').toLowerCase().includes(k));
      return hit?.url || hit?.cdn || hit?.path || null;
    }
    return null;
  }

  refreshInventory() {
    const el = this.ui.inventory;
    if (!el) return;
    const items = this.itemsForActiveSlot();
    const slot = EDITOR_SLOTS.find((s) => s.id === this.activeSlot);
    if (this.ui.inventoryTitle) {
      this.ui.inventoryTitle.textContent = `${slot?.label || this.activeSlot} · T0–T1 (${items.length})`;
    }
    if (!items.length) {
      el.innerHTML = '<div class="dim">No T0–T1 entries for this slot</div>';
      return;
    }
    el.innerHTML = items
      .map((it) => {
        const ic = it.icon
          ? `<img src="${it.icon}" alt="" loading="lazy" onerror="this.style.display='none'"/>`
          : `<span class="ico-ph">${(it.kind || '?')[0]}</span>`;
        return `<button type="button" class="inv-item" data-id="${encodeURIComponent(it.id)}" title="${it.uuid || it.id}">
          ${ic}
          <span class="inv-meta"><strong>${it.name}</strong>
          <span class="dim">${it.tier} · ${it.kind} · ${it.source}</span></span>
        </button>`;
      })
      .join('');
    el.querySelectorAll('.inv-item').forEach((btn) => {
      btn.onclick = () => {
        const id = decodeURIComponent(btn.dataset.id);
        const it = items.find((x) => String(x.id) === id);
        if (it) this.applyItem(it);
      };
    });
    this.renderEquipInfo(items[0]);
  }

  renderEquipInfo(it) {
    const el = this.ui.equipInfo;
    if (!el || !it) return;
    el.innerHTML = `
      <div><strong>${it.name}</strong> <span class="badge">${it.tier}</span></div>
      <div class="dim">slot <code>${it.slot}</code> · kind <code>${it.kind}</code></div>
      <div class="dim">uuid <code>${it.uuid || '—'}</code></div>
      <div class="dim">mesh_id <code>${it.meshId || '—'}</code></div>
      <div class="dim">source <code>${it.source}</code></div>
      ${it.meshIds ? `<div class="dim">mesh_ids ${it.meshIds.length}</div>` : ''}
    `;
  }

  async applyItem(it) {
    this.renderEquipInfo(it);
    if (!this.equip || !this.root) return;

    if (it.kind === 'form' || it.formId) {
      this.classId = it.formId || it.name;
      if (this.ui.classSelect) this.ui.classSelect.value = this.classId;
      this.applyClassForm();
      this.refreshSkills();
      this.status(`Form ${this.classId}`);
      return;
    }

    if (it.source === 'kit' && it.variant && it.slot) {
      if (it.slot === 'off_hand' || it.kind === 'shield') {
        this.equip.equip?.('shield', it.variant);
      } else if (['body', 'arms', 'legs', 'head', 'shoulders'].includes(it.slot)) {
        this.equip.equip?.(it.slot, it.variant);
      }
      this.equip.hardenVisibility?.();
      this.refreshHierarchy();
      this.status(`Equipped kit ${it.meshId}`);
      return;
    }

    if (it.source === 'lab_weapon' && it.lab) {
      const role = it.slot === 'off_hand' ? 'off' : 'main';
      await this.attachLab(it.lab, role);
      this.refreshSkills(it.kind);
      return;
    }

    // Catalog-only items (relics / class / t0 catalog): bind UUID in panel; mesh if meshId matches kit
    if (it.meshId && this.equip.applyMeshIds) {
      // try show that mesh among current loadout
      const summary = this.equip.summary?.() || {};
      // fuzzy: leave paperdoll, just report
    }
    this.status(`Bound ${it.name} (${it.uuid || it.id}) — catalog T0/T1`);
    this.refreshSkills(it.kind);
  }

  async attachLab(entry, role = 'main') {
    const slot = resolveLabAttachSlot(entry, role);
    if (!slot) {
      this.status(`${entry.kind} cannot go off-hand`);
      return;
    }
    const urls = [entry.cdnUrl, entry.labUrl].filter(Boolean);
    let root = null;
    for (const u of urls) {
      try {
        const gltf = await new GLTFLoader().loadAsync(u);
        root = gltf.scene || gltf;
        break;
      } catch {
        /* next */
      }
    }
    if (!root) {
      this.status(`Weapon GLB not found: ${entry.file}`);
      return;
    }
    prepareLabWeaponRoot(THREE, root, entry);
    hideKitWeaponsForLab(this.equip, slot);
    const res = attachToSocket(this.root, root, slot, this.labHeld);
    if (!res.ok) {
      this.status(res.error);
      return;
    }
    this.selectObject(root);
    this.refreshHierarchy();
    this.status(`Lab ${role}: ${entry.meshId} @ ${res.socket}`);
  }

  refreshSkills(kindHint) {
    const el = this.ui.skills;
    if (!el) return;
    const ws = this.apis.weaponSkills;
    const t0 = this.apis.t0Skills;
    const kind = String(kindHint || this.guessWeaponKind() || 'SWORD').toUpperCase();
    const lines = [];

    // T0 starter pattern
    const t0type = t0?.types?.[kind] || t0?.types?.SWORD;
    if (t0type) {
      lines.push(`<h4>T0 starter · ${kind}</h4>`);
      if (t0type.slot1) lines.push(this.skillCard(t0type.slot1, 1));
      if (t0type.slot2) lines.push(this.skillCard(t0type.slot2, 2));
      if (t0type.slot3Options) {
        lines.push('<div class="dim">Slot 3 choose one</div>');
        for (const s of t0type.slot3Options.slice(0, 4)) lines.push(this.skillCard(s, 3));
      }
    }

    // master-weaponSkills tree snippet
    const wt = ws?.weaponTypes || ws?.types || {};
    const entry = wt[kind] || wt[kind.toLowerCase()] || Object.values(wt).find((v) =>
      String(v?.type || v?.id || '').toUpperCase().includes(kind),
    );
    if (entry) {
      lines.push(`<h4>Weapon skills API · ${kind}</h4>`);
      const skills = entry.skills || entry.skillTree || entry.abilities || [];
      const arr = Array.isArray(skills) ? skills : Object.values(skills || {});
      for (const s of arr.slice(0, 12)) {
        lines.push(this.skillCard(s, s.slot || s.tier || '·'));
      }
    }

    if (!lines.length) {
      el.innerHTML = `<div class="dim">No skill rows for ${kind} — check master-weaponSkills / t0 pattern</div>`;
      return;
    }
    el.innerHTML = lines.join('');
  }

  skillCard(s, slot) {
    if (!s) return '';
    const name = s.name || s.id || 'skill';
    const id = s.id || name;
    const cd = s.cooldown != null ? `CD ${s.cooldown}s` : '';
    const dmg = s.damage != null ? `DMG ${s.damage}` : '';
    return `<div class="skill-card"><span class="badge">${slot}</span> <strong>${name}</strong>
      <div class="dim"><code>${id}</code> ${dmg} ${cd}</div>
      <div class="dim">${s.description || (s.effects || []).join(', ') || ''}</div></div>`;
  }

  guessWeaponKind() {
    const eq = this.equip?.equipped || {};
    if (eq.sword) return 'SWORD';
    if (eq.axe) return 'AXE';
    if (eq.staff) return 'STAFF';
    if (eq.bow) return 'BOW';
    if (eq.hammer) return 'HAMMER';
    if (eq.spear) return 'SPEAR';
    if (this.labHeld.main?.userData?.meshId) {
      const m = String(this.labHeld.main.userData.meshId);
      if (/sword/i.test(m)) return 'SWORD';
      if (/axe/i.test(m)) return 'AXE';
      if (/staff|wand/i.test(m)) return 'STAFF';
      if (/bow/i.test(m)) return 'BOW';
    }
    return 'SWORD';
  }

  refreshHierarchy() {
    const el = this.ui.hierarchy;
    if (!el || !this.root) return;
    const rows = [];
    this.root.traverse((o) => {
      if (!o.name && !o.isMesh && !o.isSkinnedMesh && !o.isBone) return;
      if (o.isBone && !/Hand|hand_container|Pelvis|Bip001$|shield|weapon/i.test(o.name || '')) return;
      const depth = (() => {
        let d = 0;
        let p = o.parent;
        while (p && p !== this.root) {
          d++;
          p = p.parent;
        }
        return d;
      })();
      const tag = o.isMesh || o.isSkinnedMesh ? 'mesh' : o.isBone ? 'bone' : 'node';
      const vis = o.visible === false ? ' off' : '';
      rows.push(
        `<button type="button" class="hier${vis}" data-uuid="${o.uuid}" style="padding-left:${8 + depth * 10}px">
          <span class="tag">${tag}</span> ${o.name || o.type}
        </button>`,
      );
    });
    el.innerHTML = rows.slice(0, 200).join('') || '<div class="dim">empty</div>';
    el.querySelectorAll('button').forEach((btn) => {
      btn.onclick = () => {
        let hit = null;
        this.root.traverse((o) => {
          if (o.uuid === btn.dataset.uuid) hit = o;
        });
        if (hit) this.selectObject(hit);
      };
    });
  }

  selectObject(obj) {
    this.selected = obj;
    if (obj) this.gizmo.attach(obj);
    else this.gizmo.detach();
    if (this.ui.selectedName) {
      this.ui.selectedName.textContent = obj
        ? `${obj.name || obj.type} · ${obj.uuid.slice(0, 8)}`
        : '—';
    }
  }

  async importFile(file) {
    if (!file || !this.root) return;
    const url = URL.createObjectURL(file);
    try {
      let obj;
      if (/\.fbx$/i.test(file.name)) {
        this.status('FBX import is author-only — convert to GLB for play. Loading for preview…');
        obj = await new FBXLoader().loadAsync(url);
      } else {
        const gltf = await new GLTFLoader().loadAsync(url);
        obj = gltf.scene || gltf;
      }
      obj.name = obj.name || file.name.replace(/\.\w+$/, '');
      // Attach to main hand by default for weapon-like imports
      const slot = 'main_hand';
      prepareLabWeaponRoot(THREE, obj, { id: obj.name, kind: 'sword', meshId: `import:${obj.name}` });
      hideKitWeaponsForLab(this.equip, 'main_hand');
      attachToSocket(this.root, obj, 'main_hand', this.labHeld);
      this.selectObject(obj);
      this.refreshHierarchy();
      this.status(`Imported ${file.name}`);
    } catch (e) {
      this.status(`Import failed: ${e.message}`);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  exportSelectedGlb() {
    const target =
      this.selected ||
      this.labHeld.main ||
      this.labHeld.off ||
      null;
    if (!target) {
      this.status('Select a mesh / lab weapon to export');
      return;
    }
    const exporter = new GLTFExporter();
    exporter.parse(
      target,
      (result) => {
        const blob =
          result instanceof ArrayBuffer
            ? new Blob([result], { type: 'model/gltf-binary' })
            : new Blob([JSON.stringify(result)], { type: 'model/gltf+json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${(target.name || 'grudge6-export').replace(/[^\w.-]+/g, '_')}.glb`;
        a.click();
        URL.revokeObjectURL(a.href);
        this.status(`Exported ${a.download} (local download — does not write CDN)`);
      },
      (err) => this.status(`Export failed: ${err?.message || err}`),
      { binary: true },
    );
  }

  dispose() {
    this._disposed = true;
    this.gizmo?.dispose();
    this.renderer?.dispose();
  }
}
