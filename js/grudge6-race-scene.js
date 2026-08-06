/**
 * grudge6 Race Scene — one race, equipment-based mesh resources, pack idle.
 *
 * Pipeline (locked):
 *   loadRaceKit (GLB) → equip visibility → bone SI fit 1.8 m → pack idle
 *   No stretch, no second mixer library, no Meshy body swap.
 */
import * as THREE from 'https://esm.sh/three@0.185.0';
import { OrbitControls } from 'https://esm.sh/three@0.185.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.185.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://esm.sh/three@0.185.0/examples/jsm/loaders/FBXLoader.js';
import {
  RACE_ASSETS,
  loadRaceKit,
  fitRootUniformSi,
  WEAPON_R,
  WEAPON_L,
} from './grudge6-kit.js';
import { playPackIdle, packForWeaponSlot } from './grudge6-anim-packs.js';
import {
  enumerateEquipResources,
  applyResourceLoadout,
  buildFullCartesian,
  defaultArmorLoadout,
} from './grudge6-equip-resources.js';

const HUMAN_M = 1.8;

export function raceIds() {
  return Object.keys(RACE_ASSETS);
}

export class Grudge6RaceScene {
  /**
   * @param {HTMLElement} host — main 3D viewport
   * @param {string} raceId
   * @param {{ onStatus?: (s:string)=>void, onResources?: (r:any[])=>void }} opts
   */
  constructor(host, raceId, opts = {}) {
    this.host = host;
    this.raceId = raceId;
    this.opts = opts;
    this.root = null;
    this.equip = null;
    this.mixer = null;
    this.resources = [];
    this.thumbs = new Map(); // resourceId → dataURL
    this._disposed = false;
    this._raf = 0;
    this._clock = new THREE.Clock();
    this._idleAction = null;
  }

  status(msg) {
    this.opts.onStatus?.(msg);
  }

  async mount() {
    const w = Math.max(this.host.clientWidth, 320);
    const h = Math.max(this.host.clientHeight, 360);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c1018);
    this.camera = new THREE.PerspectiveCamera(32, w / h, 0.05, 80);
    this.camera.position.set(0, 1.15, 3.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.host.innerHTML = '';
    this.host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;border-radius:8px';

    this.scene.add(new THREE.AmbientLight(0xfff0e0, 0.55));
    this.scene.add(new THREE.HemisphereLight(0xffe8c8, 0x101820, 0.75));
    const key = new THREE.DirectionalLight(0xfff5e6, 1.15);
    key.position.set(2.2, 4, 2.5);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
    fill.position.set(-2, 1.2, -1.5);
    this.scene.add(fill);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.9, 0);
    this.controls.enableDamping = true;
    this.controls.minDistance = 1.4;
    this.controls.maxDistance = 8;

    const tick = () => {
      if (this._disposed) return;
      const dt = this._clock.getDelta();
      this.mixer?.update(dt);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);

    window.addEventListener('resize', this._onResize = () => {
      if (this._disposed || !this.host.isConnected) return;
      const nw = Math.max(this.host.clientWidth, 320);
      const nh = Math.max(this.host.clientHeight, 360);
      this.camera.aspect = nw / nh;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(nw, nh, false);
    });

    await this.loadRace(this.raceId);
  }

  async loadRace(raceId) {
    this.raceId = raceId;
    this.status(`Loading ${raceId} kit (GLB + atlas)…`);

    if (this.root) {
      this.scene.remove(this.root);
      this.root = null;
      this.mixer?.stopAllAction();
      this.mixer = null;
    }

    let kit;
    try {
      kit = await loadRaceKit(THREE, { FBXLoader, GLTFLoader }, raceId, {
        source: 'glb',
        ground: false,
        skipDefaultLoadout: true,
        forceAtlas: false,
        invertUvV: false,
      });
    } catch (e) {
      console.warn('[race-scene] GLB fail → FBX', e);
      kit = await loadRaceKit(THREE, { FBXLoader, GLTFLoader }, raceId, {
        source: 'fbx',
        ground: false,
        skipDefaultLoadout: true,
        forceAtlas: true,
        invertUvV: false,
      });
    }
    if (this._disposed) return;

    this.root = kit.root;
    this.equip = kit.equip;
    this.kitMeta = {
      url: kit.url,
      source: kit.source,
      materialMode: kit.materialMode,
      matCount: kit.matCount,
    };

    const summary = this.equip.summary();
    const meshNames = (this.equip.allMeshes || []).map((m) => m.name);

    this.resources = enumerateEquipResources(raceId, summary, {
      meshNames,
      includeMeshPieces: true,
    });
    this.opts.onResources?.(this.resources, summary);

    // Apply base loadout + SI + idle
    const base = this.resources.find((r) => r.kind === 'base') || this.resources[0];
    await this.applyResource(base, { playAnim: true });

    this.scene.add(this.root);
    this.status(
      `${raceId} · ${kit.source} · ${kit.materialMode} · ${this.resources.length} equip resources · SI fit`,
    );
  }

  async applyResource(resource, opts = {}) {
    if (!this.equip || !this.root || !resource) return;
    if (resource.kind === 'mesh_piece') {
      // Solo mesh highlight: hide all equip, show that mesh if present
      for (const m of this.equip.allMeshes || []) m.visible = false;
      const hit = (this.equip.allMeshes || []).find((m) => m.name === resource.meshName);
      if (hit) hit.visible = true;
      // Keep minimal body if piece is weapon-only so figure still reads
      if (hit && /weapon|shield|sword|bow|staff|axe|hammer/i.test(hit.name || '')) {
        for (const slot of ['body', 'arms', 'legs']) {
          const v = this.equip.slots[slot]?.A || Object.values(this.equip.slots[slot] || {})[0];
          if (v) v.visible = true;
        }
      }
      this.equip.hardenVisibility?.();
    } else if (resource.loadout) {
      applyResourceLoadout(this.equip, resource.loadout);
    }

    // SI fit every loadout change (bone measure — no stretch)
    fitRootUniformSi(THREE, this.root, HUMAN_M, {
      characterType: 'infantry',
      centerXZ: true,
    });
    this.root.rotation.y = Math.PI; // face camera

    if (opts.playAnim !== false) {
      this.mixer?.stopAllAction();
      this.mixer = new THREE.AnimationMixer(this.root);
      const wSlot = resource.weaponSlot || resource.loadout?._weaponSlot || 'sword';
      const { pack, action } = await playPackIdle(THREE, this.root, this.mixer, wSlot);
      this._idleAction = action;
      // re-fit after first sample
      fitRootUniformSi(THREE, this.root, HUMAN_M, {
        characterType: 'infantry',
        centerXZ: true,
      });
      this.root.rotation.y = Math.PI;
      this.status(
        `${resource.id} · pack=${pack} · weapon=${wSlot || '—'} · h≈1.8m`,
      );
    } else {
      this.status(`${resource.id}`);
    }
  }

  /**
   * Render each non-mesh_piece resource to a small PNG data URL (asset thumbs).
   * @param {{ max?: number, size?: number, onProgress?: (i,n,id)=>void }} opts
   */
  async bakeResourceThumbs(opts = {}) {
    const max = opts.max ?? 80;
    const size = opts.size ?? 192;
    const list = this.resources.filter((r) => r.kind !== 'mesh_piece').slice(0, max);
    const thumbs = [];

    // Offscreen render target style: reuse main renderer at small size
    const prevW = this.renderer.domElement.width;
    const prevH = this.renderer.domElement.height;
    this.renderer.setSize(size, size, false);
    this.camera.aspect = 1;
    this.camera.position.set(0, 1.05, 3.2);
    this.camera.lookAt(0, 0.9, 0);
    this.controls.target.set(0, 0.9, 0);
    this.controls.update();

    for (let i = 0; i < list.length; i++) {
      const res = list[i];
      opts.onProgress?.(i + 1, list.length, res.id);
      await this.applyResource(res, { playAnim: false });
      // brief idle sample if mixer exists
      if (this.mixer) this.mixer.update(0);
      this.renderer.render(this.scene, this.camera);
      const dataUrl = this.renderer.domElement.toDataURL('image/png');
      this.thumbs.set(res.id, dataUrl);
      thumbs.push({ id: res.id, kind: res.kind, label: res.label, dataUrl, loadout: res.loadout, animPack: res.animPack });
      // yield UI
      await new Promise((r) => setTimeout(r, 0));
    }

    // restore main viewport
    this._onResize?.();
    const base = this.resources.find((r) => r.kind === 'base');
    if (base) await this.applyResource(base, { playAnim: true });
    return thumbs;
  }

  /** Expand with capped full cartesian resources (optional deep mode). */
  addFullCartesian(max = 120) {
    if (!this.equip) return [];
    const summary = this.equip.summary();
    const extra = buildFullCartesian(this.raceId, summary, max);
    // de-dupe by id
    const have = new Set(this.resources.map((r) => r.id));
    for (const r of extra) {
      if (!have.has(r.id)) this.resources.push(r);
    }
    this.opts.onResources?.(this.resources, summary);
    return extra;
  }

  exportCatalogJson() {
    const race = RACE_ASSETS[this.raceId];
    return {
      version: 1,
      raceId: this.raceId,
      prefix: race?.prefix,
      kit: this.kitMeta,
      humanHeightM: HUMAN_M,
      pipeline: 'skeleton + anim_packs + equip mesh_ids (no stretch)',
      resourceCount: this.resources.length,
      resources: this.resources.map((r) => ({
        id: r.id,
        kind: r.kind,
        label: r.label,
        slot: r.slot,
        variant: r.variant,
        meshName: r.meshName,
        loadout: r.loadout,
        animPack: r.animPack,
        weaponSlot: r.weaponSlot,
        thumb: this.thumbs.has(r.id) ? true : false,
      })),
      summary: this.equip?.summary?.() || {},
    };
  }

  dispose() {
    this._disposed = true;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    this.controls?.dispose();
    this.renderer?.dispose();
    this.mixer = null;
    this.host.innerHTML = '';
  }
}
