/**
 * grudge6 Prefab + Animation AI Worker (editor surface)
 *
 * Deterministic SSOT worker (not a parallel pipeline):
 *   1. Audit master-weaponSkills prefab fill rates
 *   2. Propose / apply local prefab ↔ anim pack connections
 *   3. Game-ready asset tests on the live Toon RTS ★ viewport
 *   4. Optional Puter chat for human-readable advice (no silent CDN write)
 *
 * Extends: grudge6-prefab-anim-rules + grudge6-anim-packs + grudge6-editor
 */
import {
  auditWeaponSkillsDoc,
  applyPrefabPatchesToDoc,
  suggestPrefabPatch,
  prefabReadyScore,
  isPrefabGameReady,
  packForWeaponType,
  modelUrlForWeaponType,
  normalizeWeaponType,
  CDN,
  GAME_READY_CHECK_IDS,
} from './grudge6-prefab-anim-rules.js';
import { clipUrlsFor, loadBakedClip, rematchClipBones } from './grudge6-anim-packs.js';

const WORKER_VERSION = '1.0.0';

export class PrefabAnimWorker {
  constructor(editor) {
    this.editor = editor;
    this.lastAudit = null;
    this.lastTests = null;
    this.log = [];
    this.putering = false;
  }

  pushLog(msg, level = 'info') {
    const line = { t: new Date().toISOString(), level, msg: String(msg) };
    this.log.unshift(line);
    if (this.log.length > 80) this.log.length = 80;
    return line;
  }

  get weaponSkillsDoc() {
    return this.editor?.apis?.weaponSkills || null;
  }

  /** Full catalog audit (in-memory APIs). */
  audit() {
    const doc = this.weaponSkillsDoc;
    if (!doc) {
      this.pushLog('weaponSkills API not loaded', 'err');
      return null;
    }
    const report = auditWeaponSkillsDoc(doc);
    this.lastAudit = { ...report, at: new Date().toISOString(), worker: WORKER_VERSION };
    this.pushLog(
      `Audit: ${report.totalSkills} skills · clip ${report.withAnimationClip} (${report.pctClip}%) · ready ${report.gameReadyCount} · improveable ${report.improveable}`,
    );
    return this.lastAudit;
  }

  /**
   * Fill null prefab fields in-memory (does NOT write ObjectStore).
   * Export patch JSON to commit via wire script / PR.
   */
  applyLocalImprovements(opts = {}) {
    const doc = this.weaponSkillsDoc;
    if (!doc) return { touched: 0 };
    const r = applyPrefabPatchesToDoc(doc, opts);
    this.pushLog(`Applied local prefab fills: ${r.touched} skills, ${r.fieldsFilled} fields`);
    this.audit();
    this.editor?.refreshSkills?.();
    return r;
  }

  /** Download patch proposal for repo commit (master-weaponSkills). */
  exportPatchJson() {
    const audit = this.lastAudit || this.audit();
    if (!audit) return null;
    const improve = (audit.patches || []).filter((p) => p.improved);
    const payload = {
      version: 1,
      worker: WORKER_VERSION,
      generatedAt: new Date().toISOString(),
      source: 'grudge6-prefab-anim-worker',
      note: 'Apply with: node scripts/wire-skill-prefab-anims.mjs (repo). Editor does not write CDN.',
      summary: {
        totalSkills: audit.totalSkills,
        improveable: audit.improveable,
        withAnimationClip: audit.withAnimationClip,
        pctClip: audit.pctClip,
        gameReadyCount: audit.gameReadyCount,
      },
      patches: improve.map((p) => ({
        skillId: p.skillId,
        skillUuid: p.skillUuid,
        weaponType: p.weaponType,
        animPack: p.animPack,
        animRole: p.animRole,
        filledFields: p.filledFields,
        prefab: p.prefab,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `grudge6-prefab-anim-patch-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    this.pushLog(`Exported ${improve.length} skill patches → ${a.download}`);
    return payload;
  }

  /** Propose patch for one skill (current weapon kind). */
  proposeForSkill(skill, weaponType) {
    const wt = weaponType || this.editor?.guessWeaponKind?.() || 'SWORD';
    return suggestPrefabPatch(skill, wt, { slotType: skill?._slotType || skill?._slotLabel });
  }

  /**
   * Play skill animation on the editor mixer using pack/role resolution.
   * THREE is loaded from esm (same r185 as editor).
   */
  async playSkill(skill) {
    const ed = this.editor;
    if (!ed?.root || !ed?.mixer) {
      this.pushLog('No character loaded', 'err');
      return false;
    }
    const wt = skill?.weaponType || ed.guessWeaponKind?.() || 'SWORD';
    const patch = this.proposeForSkill(skill, wt);
    const pack = patch.animPack || packForWeaponType(wt);
    const role = patch.animRole || 'attack';
    const urls = clipUrlsFor(pack, role);
    this.pushLog(`Play ${skill?.name || skill?.id || 'skill'} → ${pack}/${role} (${urls.length} urls)`);
    ed.status?.(`Anim ${pack}/${role}…`);

    const THREE = await import('https://esm.sh/three@0.185.0');
    let clip = await loadBakedClip(THREE, urls);
    if (!clip) {
      this.pushLog(`No clip loaded for ${pack}/${role}`, 'err');
      ed.status?.(`No clip for ${pack}/${role}`);
      return false;
    }
    clip = rematchClipBones(THREE, ed.root, clip) || clip;
    ed.mixer.stopAllAction();
    const action = ed.mixer.clipAction(clip);
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.fadeIn(0.08).play();
    const ms = Math.min(4500, Math.max(600, (clip.duration || 1.2) * 1000 + 200));
    setTimeout(() => ed.playIdle?.(), ms);
    ed.status?.(`Playing ${pack}/${role}`);
    return true;
  }

  /**
   * Game-ready asset tests against the live editor viewport + CDN.
   */
  async runGameReadyTests() {
    const ed = this.editor;
    const results = [];
    const check = (id, ok, detail = '') => {
      results.push({ id, ok: !!ok, detail: String(detail || '') });
    };

    // race_loaded
    check('race_loaded', !!ed?.root, ed?.raceId || 'no root');

    // si_height
    let heightM = null;
    if (ed?.root) {
      try {
        const THREE = await import('https://esm.sh/three@0.185.0');
        const box = new THREE.Box3();
        let any = false;
        ed.root.updateMatrixWorld(true);
        ed.root.traverse((o) => {
          if (!o.isSkinnedMesh || !o.visible) return;
          if (!any) {
            box.setFromObject(o, true);
            any = true;
          } else box.expandByObject(o);
        });
        if (!any) box.setFromObject(ed.root, true);
        heightM = box.getSize(new THREE.Vector3()).y;
        check('si_height', heightM >= 1.55 && heightM <= 2.15, `h=${heightM.toFixed(3)}m`);
        // feet_ground — min.y near 0 after fit
        check('feet_ground', Math.abs(box.min.y) < 0.12, `min.y=${box.min.y.toFixed(3)}`);
      } catch (e) {
        check('si_height', false, e.message);
        check('feet_ground', false, e.message);
      }
    } else {
      check('si_height', false, 'no root');
      check('feet_ground', false, 'no root');
    }

    // hand_bones
    let hands = false;
    if (ed?.root) {
      ed.root.traverse((o) => {
        if (/R_hand_container|L_hand_container|Bip001 R Hand|Bip001 L Hand/i.test(o.name || '')) hands = true;
      });
    }
    check('hand_bones', hands, hands ? 'containers/hands found' : 'missing hand containers');

    // mixer_idle
    check('mixer_idle', !!ed?.mixer, ed?.mixer ? 'mixer ok' : 'no mixer');

    // play_kit_cdn
    const race = ed?.raceId || 'human';
    const kitUrl = `${CDN}/asset-packs/toon-rts-characters/glb/characters/${race}.glb`;
    try {
      const r = await fetch(kitUrl, { method: 'HEAD', mode: 'cors' });
      check('play_kit_cdn', r.ok, `${r.status} ${kitUrl.split('/').pop()}`);
    } catch (e) {
      // CORS may block HEAD — try GET range via image/scriptless GET with abort
      try {
        const r2 = await fetch(kitUrl, { method: 'GET', mode: 'cors', headers: { Range: 'bytes=0-15' } });
        check('play_kit_cdn', r2.ok || r2.status === 206, `${r2.status} range`);
      } catch (e2) {
        check('play_kit_cdn', false, e2.message || e.message);
      }
    }

    // anim_pack_attack
    const wt = ed?.guessWeaponKind?.() || 'SWORD';
    const pack = packForWeaponType(wt);
    const attackUrls = clipUrlsFor(pack, 'attack');
    let attackOk = false;
    let attackDetail = `${pack}/attack · ${attackUrls.length} urls`;
    if (attackUrls[0]) {
      try {
        const r = await fetch(attackUrls[0], { method: 'HEAD', mode: 'cors' });
        attackOk = r.ok;
        attackDetail += ` · HEAD ${r.status}`;
        if (!r.ok) {
          const r2 = await fetch(attackUrls[0], { method: 'GET', mode: 'cors', headers: { Range: 'bytes=0-32' } });
          attackOk = r2.ok || r2.status === 206;
          attackDetail += ` · GET ${r2.status}`;
        }
      } catch {
        try {
          const r2 = await fetch(attackUrls[0], { method: 'GET', mode: 'cors' });
          attackOk = r2.ok;
          attackDetail += ` · GET ${r2.status}`;
        } catch (e) {
          attackDetail += ` · ${e.message}`;
        }
      }
    }
    check('anim_pack_attack', attackOk, attackDetail);

    // skill_prefab_clip — sample first skill of current weapon
    const ws = this.weaponSkillsDoc;
    let skillOk = false;
    let skillDetail = 'no skill';
    if (ws) {
      const audit = auditWeaponSkillsDoc(ws);
      const forWt = (audit.patches || []).filter((p) => p.weaponType === normalizeWeaponType(wt));
      const sample = forWt[0] || audit.patches?.[0];
      if (sample) {
        skillOk = isPrefabGameReady(sample.prefab) || !!sample.animationClip;
        skillDetail = `${sample.skillId} score=${sample.score} clip=${sample.animationClip || 'null'}`;
      }
    }
    check('skill_prefab_clip', skillOk, skillDetail);

    // weapon_model_cdn
    const modelUrl = modelUrlForWeaponType(wt);
    let modelOk = false;
    let modelDetail = modelUrl || 'no model map';
    if (modelUrl) {
      try {
        const r = await fetch(modelUrl, { method: 'HEAD', mode: 'cors' });
        modelOk = r.ok;
        modelDetail = `${r.status} ${modelUrl.split('/').slice(-2).join('/')}`;
        if (!r.ok) {
          const r2 = await fetch(modelUrl, { method: 'GET', mode: 'cors', headers: { Range: 'bytes=0-15' } });
          modelOk = r2.ok || r2.status === 206;
          modelDetail += ` · GET ${r2.status}`;
        }
      } catch {
        try {
          const r2 = await fetch(modelUrl, { method: 'GET', mode: 'cors' });
          modelOk = r2.ok;
          modelDetail = `${r2.status}`;
        } catch (e) {
          modelDetail = e.message;
        }
      }
    }
    check('weapon_model_cdn', modelOk, modelDetail);

    // loadout_bound
    const boundN = Object.keys(ed?.bound || {}).length;
    check('loadout_bound', boundN > 0, `${boundN} slots bound`);

    const passed = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;
    this.lastTests = {
      at: new Date().toISOString(),
      worker: WORKER_VERSION,
      raceId: ed?.raceId,
      weaponType: wt,
      animPack: pack,
      heightM,
      passed,
      failed,
      total: results.length,
      results,
      expectedIds: GAME_READY_CHECK_IDS,
    };
    this.pushLog(`Game-ready: ${passed}/${results.length} pass · ${failed} fail`, failed ? 'warn' : 'ok');
    ed.status?.(`Game-ready ${passed}/${results.length}`);
    return this.lastTests;
  }

  /** Optional Puter AI advice (user-pays). Never auto-writes catalogs. */
  async askPuter(prompt) {
    if (typeof window === 'undefined' || !window.puter?.ai?.chat) {
      this.pushLog('Puter AI not available — load puter.js or run deterministic audit only', 'warn');
      return null;
    }
    const audit = this.lastAudit || this.audit();
    const tests = this.lastTests;
    const context = JSON.stringify(
      {
        audit: audit
          ? {
              totalSkills: audit.totalSkills,
              pctClip: audit.pctClip,
              gameReadyCount: audit.gameReadyCount,
              improveable: audit.improveable,
              byWeapon: audit.byWeapon,
            }
          : null,
        tests: tests
          ? { passed: tests.passed, failed: tests.failed, results: tests.results }
          : null,
        race: this.editor?.raceId,
        weapon: this.editor?.guessWeaponKind?.(),
      },
      null,
      2,
    );
    const system =
      'You are the grudge6 Prefab+Anim worker for Grudge Studio ObjectStore. ' +
      'Rules: extend existing SSOT only (master-weaponSkills prefab, grudge6-anim-packs). ' +
      'Do not invent parallel systems. Prefer {pack}/{role} animationClip and prod/gltf modelRef. ' +
      'Be concise. Suggest concrete fill order for null prefab fields.';
    this.putering = true;
    try {
      const res = await window.puter.ai.chat(
        [
          { role: 'system', content: system },
          { role: 'user', content: `Context:\n${context}\n\nQuestion:\n${prompt}` },
        ],
        { model: 'gpt-4o-mini' },
      );
      const text = typeof res === 'string' ? res : res?.message?.content || res?.toString?.() || String(res);
      this.pushLog(text.slice(0, 500));
      return text;
    } catch (e) {
      this.pushLog(`Puter error: ${e.message}`, 'err');
      return null;
    } finally {
      this.putering = false;
    }
  }

  /** HTML for worker panel (injected by editor). */
  renderPanelHtml() {
    const a = this.lastAudit;
    const t = this.lastTests;
    const logs = this.log
      .slice(0, 12)
      .map((l) => {
        const c = l.level === 'err' ? '#ef4444' : l.level === 'warn' ? '#eab308' : l.level === 'ok' ? '#22c55e' : '#7a7877';
        return `<div style="color:${c};font-size:.62rem;margin:2px 0;font-family:ui-monospace,monospace">${escapeHtml(l.msg)}</div>`;
      })
      .join('');

    let auditHtml = '<div class="dim">Run Audit</div>';
    if (a) {
      auditHtml = `
        <div class="dim">skills <strong>${a.totalSkills}</strong> · clip <strong>${a.withAnimationClip}</strong> (${a.pctClip}%) · ready <strong>${a.gameReadyCount}</strong></div>
        <div class="dim">improveable <strong>${a.improveable}</strong> · modelRef ${a.withModelRef} · vfx ${a.withVfxRef}</div>
      `;
    }

    let testHtml = '<div class="dim">Run Game-ready tests</div>';
    if (t) {
      testHtml = (t.results || [])
        .map((r) => {
          const col = r.ok ? '#22c55e' : '#ef4444';
          return `<div style="font-size:.62rem;margin:2px 0"><span style="color:${col}">${r.ok ? '✓' : '✗'}</span> <code>${r.id}</code> <span class="dim">${escapeHtml(r.detail)}</span></div>`;
        })
        .join('');
      testHtml = `<div class="dim" style="margin-bottom:4px">${t.passed}/${t.total} pass · ${t.weaponType} · ${t.animPack}</div>${testHtml}`;
    }

    return `
      <div class="worker-panel">
        <div class="row" style="margin-bottom:8px">
          <button type="button" data-wact="audit">Audit prefabs</button>
          <button type="button" data-wact="apply">Fill nulls (local)</button>
          <button type="button" data-wact="export">Export patch JSON</button>
        </div>
        <div class="row" style="margin-bottom:8px">
          <button type="button" data-wact="test">Game-ready tests</button>
          <button type="button" data-wact="idle">Play idle</button>
          <button type="button" data-wact="attack">Play attack</button>
        </div>
        <h4>Prefab audit</h4>
        ${auditHtml}
        <h4>Game-ready</h4>
        ${testHtml}
        <h4>Worker log</h4>
        <div class="worker-log">${logs || '<div class="dim">—</div>'}</div>
        <p class="dim" style="margin-top:8px;line-height:1.35">
          Local only · no CDN write · commit via <code>npm run wire:skill-prefab-anims</code>
        </p>
      </div>
    `;
  }

  bindPanel(el) {
    if (!el) return;
    el.querySelectorAll('[data-wact]').forEach((btn) => {
      btn.onclick = async () => {
        const act = btn.dataset.wact;
        btn.disabled = true;
        try {
          if (act === 'audit') this.audit();
          else if (act === 'apply') this.applyLocalImprovements();
          else if (act === 'export') this.exportPatchJson();
          else if (act === 'test') await this.runGameReadyTests();
          else if (act === 'idle') await this.editor?.playIdle?.();
          else if (act === 'attack') {
            await this.playSkill({
              id: 'preview_attack',
              name: 'Preview Attack',
              _slotType: 'primary',
            });
          }
        } finally {
          btn.disabled = false;
          if (this.editor?.ui?.workerPanel) {
            this.editor.ui.workerPanel.innerHTML = this.renderPanelHtml();
            this.bindPanel(this.editor.ui.workerPanel);
          }
        }
      };
    });
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export { prefabReadyScore, isPrefabGameReady, suggestPrefabPatch, WORKER_VERSION };
