/**
 * AnimationManager.js — Animation playback, timeline, state machine
 * Integrates with PlayCanvas scene and api/v1/animations.json
 */
import * as THREE from 'three';

export class AnimationManager {
  constructor(playCanvas) {
    this._canvas = playCanvas;
    this._mixer = null;
    this._clock = new THREE.Clock();
    this._clips = [];          // AnimationClip[]
    this._actions = new Map(); // name → AnimationAction
    this._currentAction = null;
    this._speed = 1.0;

    // State machine from animations.json
    this._states = {};
    this._transitions = {};
    this._blendDefaults = { fadeIn: 0.2, fadeOut: 0.2 };
    this._currentState = 'idle';

    // Timeline
    this._timelineEl = null;
    this._scrubber = null;
    this._isPlaying = false;
    this._loopMode = THREE.LoopRepeat;

    // UI root
    this._panelEl = null;

    // Load config
    this._loadConfig();
  }

  /* ═══════════════ Config ═══════════════ */

  async _loadConfig() {
    try {
      const res = await fetch('api/v1/animations.json');
      if (!res.ok) return;
      const data = await res.json();
      if (data.battleAnimationStates?.states) this._states = data.battleAnimationStates.states;
      if (data.transitionRules) this._transitions = data.transitionRules;
      if (data.blendDefaults) this._blendDefaults = { ...this._blendDefaults, ...data.blendDefaults };
    } catch { /* offline — use defaults */ }
  }

  /* ═══════════════ Mixer Setup ═══════════════ */

  /**
   * Bind mixer to a loaded model
   * @param {THREE.Object3D} model
   * @param {THREE.AnimationClip[]} clips
   */
  bind(model, clips = []) {
    this.stop();
    if (this._mixer) this._mixer.uncacheRoot(this._mixer.getRoot());

    this._mixer = new THREE.AnimationMixer(model);
    this._clips = clips;
    this._actions.clear();
    this._currentAction = null;

    clips.forEach(clip => {
      const action = this._mixer.clipAction(clip);
      this._actions.set(clip.name, action);
    });

    this._renderClipList();
    this._updateTimeline();
  }

  /** Tick — call from render loop */
  update() {
    if (!this._mixer || !this._isPlaying) return;
    const dt = this._clock.getDelta();
    this._mixer.update(dt * this._speed);
    this._updateScrubber();
  }

  /* ═══════════════ Playback ═══════════════ */

  play(clipName) {
    if (!this._mixer) return;
    const action = this._actions.get(clipName);
    if (!action) return;

    const fadeIn = this._blendDefaults.fadeIn;

    if (this._currentAction && this._currentAction !== action) {
      action.reset().setLoop(this._loopMode).fadeIn(fadeIn).play();
      this._currentAction.fadeOut(fadeIn);
    } else {
      action.reset().setLoop(this._loopMode).play();
    }

    this._currentAction = action;
    this._currentState = clipName;
    this._isPlaying = true;
    this._clock.getDelta(); // reset delta
    this._highlightActive(clipName);
  }

  /** Crossfade between two clips */
  crossfade(fromName, toName, duration) {
    const from = this._actions.get(fromName);
    const to = this._actions.get(toName);
    if (!from || !to) return;

    const dur = duration ?? this._blendDefaults.fadeIn;
    to.reset().setLoop(this._loopMode).play();
    from.crossFadeTo(to, dur, true);
    this._currentAction = to;
    this._currentState = toName;
    this._isPlaying = true;
    this._highlightActive(toName);
  }

  pause() {
    if (this._currentAction) this._currentAction.paused = true;
    this._isPlaying = false;
  }

  resume() {
    if (this._currentAction) this._currentAction.paused = false;
    this._isPlaying = true;
    this._clock.getDelta();
  }

  stop() {
    if (this._mixer) this._mixer.stopAllAction();
    this._isPlaying = false;
    this._currentAction = null;
  }

  setSpeed(s) {
    this._speed = Math.max(0.1, Math.min(5.0, s));
    if (this._currentAction) this._currentAction.setEffectiveTimeScale(this._speed);
  }

  setLoop(mode) {
    this._loopMode = mode; // THREE.LoopOnce, LoopRepeat, LoopPingPong
    if (this._currentAction) this._currentAction.setLoop(mode);
  }

  /* ═══════════════ State Machine ═══════════════ */

  /** Attempt a state transition using rules from animations.json */
  transition(toState) {
    const allowed = this._transitions[this._currentState];
    if (!allowed || !allowed.includes(toState)) return false;
    this.play(toState);
    return true;
  }

  /** Get available transitions from current state */
  getAvailableTransitions() {
    return this._transitions[this._currentState] || [];
  }

  /* ═══════════════ Weight Blending ═══════════════ */

  setWeight(clipName, weight) {
    const action = this._actions.get(clipName);
    if (action) action.setEffectiveWeight(Math.max(0, Math.min(1, weight)));
  }

  /** Play multiple animations simultaneously with weights */
  blendMultiple(clips) {
    // clips: [{name, weight}]
    if (!this._mixer) return;
    this._mixer.stopAllAction();
    clips.forEach(({ name, weight }) => {
      const action = this._actions.get(name);
      if (!action) return;
      action.reset().setLoop(this._loopMode).setEffectiveWeight(weight).play();
    });
    this._isPlaying = true;
    this._clock.getDelta();
  }

  /* ═══════════════ Seek ═══════════════ */

  seekTo(timeSeconds) {
    if (!this._currentAction) return;
    this._currentAction.time = Math.max(0, Math.min(timeSeconds, this._currentAction.getClip().duration));
    this._mixer.update(0);
    this._updateScrubber();
  }

  seekPercent(pct) {
    if (!this._currentAction) return;
    this.seekTo(this._currentAction.getClip().duration * (pct / 100));
  }

  /* ═══════════════ Info ═══════════════ */

  getClipNames() { return this._clips.map(c => c.name); }

  getClipInfo(name) {
    const clip = this._clips.find(c => c.name === name);
    if (!clip) return null;
    return { name: clip.name, duration: clip.duration, tracks: clip.tracks.length };
  }

  getCurrentTime() {
    if (!this._currentAction) return 0;
    return this._currentAction.time;
  }

  getCurrentDuration() {
    if (!this._currentAction) return 0;
    return this._currentAction.getClip().duration;
  }

  /* ═══════════════ UI ═══════════════ */

  /**
   * Build animation panel into a container
   * @param {HTMLElement} container
   */
  buildUI(container) {
    this._panelEl = container;
    container.innerHTML = '';
    container.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px;color:#eee;font-size:13px;';

    // Clip list
    const listWrap = document.createElement('div');
    listWrap.id = 'anim-clip-list';
    listWrap.style.cssText = 'max-height:200px;overflow-y:auto;border:1px solid #444;border-radius:4px;';
    container.appendChild(listWrap);

    // Controls row
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;';
    controls.innerHTML = `
      <button id="anim-play" title="Play">▶</button>
      <button id="anim-pause" title="Pause">⏸</button>
      <button id="anim-stop" title="Stop">⏹</button>
      <label style="display:flex;align-items:center;gap:4px;">Speed
        <input id="anim-speed" type="range" min="0.1" max="3" step="0.1" value="1" style="width:80px;">
        <span id="anim-speed-val">1.0x</span>
      </label>
      <select id="anim-loop" style="background:#333;color:#eee;border:1px solid #555;border-radius:3px;">
        <option value="repeat">Loop</option>
        <option value="once">Once</option>
        <option value="pingpong">Ping-Pong</option>
      </select>
    `;
    container.appendChild(controls);

    // Timeline
    const timeline = document.createElement('div');
    timeline.style.cssText = 'position:relative;height:24px;background:#222;border:1px solid #444;border-radius:4px;cursor:pointer;';
    timeline.innerHTML = `
      <div id="anim-scrubber" style="position:absolute;top:0;left:0;height:100%;background:rgba(0,200,255,0.3);border-radius:4px;pointer-events:none;"></div>
      <span id="anim-time" style="position:absolute;right:6px;top:3px;font-size:11px;color:#888;pointer-events:none;">0.00 / 0.00</span>
    `;
    container.appendChild(timeline);

    // Weight sliders (populated dynamically)
    const weightWrap = document.createElement('div');
    weightWrap.id = 'anim-weights';
    weightWrap.style.cssText = 'display:none;border:1px solid #444;border-radius:4px;padding:6px;';
    weightWrap.innerHTML = '<div style="font-weight:bold;margin-bottom:4px;">Weight Blending</div>';
    container.appendChild(weightWrap);

    this._scrubber = timeline.querySelector('#anim-scrubber');
    this._timelineEl = timeline;

    // Wire events
    controls.querySelector('#anim-play').onclick = () => {
      if (this._currentAction) this.resume();
      else if (this._clips.length) this.play(this._clips[0].name);
    };
    controls.querySelector('#anim-pause').onclick = () => this.pause();
    controls.querySelector('#anim-stop').onclick = () => this.stop();

    const speedInput = controls.querySelector('#anim-speed');
    const speedVal = controls.querySelector('#anim-speed-val');
    speedInput.oninput = () => {
      const s = parseFloat(speedInput.value);
      this.setSpeed(s);
      speedVal.textContent = s.toFixed(1) + 'x';
    };

    const loopSel = controls.querySelector('#anim-loop');
    loopSel.onchange = () => {
      const map = { repeat: THREE.LoopRepeat, once: THREE.LoopOnce, pingpong: THREE.LoopPingPong };
      this.setLoop(map[loopSel.value]);
    };

    timeline.addEventListener('click', e => {
      const rect = timeline.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      this.seekPercent(pct);
    });

    // Style buttons
    container.querySelectorAll('button').forEach(btn => {
      btn.style.cssText = 'background:#333;color:#eee;border:1px solid #555;border-radius:3px;padding:4px 10px;cursor:pointer;';
    });

    this._renderClipList();
  }

  _renderClipList() {
    const list = this._panelEl?.querySelector('#anim-clip-list');
    if (!list) return;
    list.innerHTML = '';

    if (!this._clips.length) {
      list.innerHTML = '<div style="padding:8px;color:#666;">No animations loaded</div>';
      return;
    }

    this._clips.forEach(clip => {
      const row = document.createElement('div');
      row.className = 'anim-clip-row';
      row.dataset.name = clip.name;
      row.style.cssText = 'padding:6px 8px;cursor:pointer;border-bottom:1px solid #333;display:flex;justify-content:space-between;';
      row.innerHTML = `
        <span>${clip.name}</span>
        <span style="color:#888;font-size:11px;">${clip.duration.toFixed(2)}s · ${clip.tracks.length} tracks</span>
      `;
      row.onclick = () => this.play(clip.name);
      row.onmouseenter = () => row.style.background = '#2a2a2a';
      row.onmouseleave = () => row.style.background = (this._currentState === clip.name) ? '#1a3a4a' : '';
      list.appendChild(row);
    });
  }

  _highlightActive(name) {
    if (!this._panelEl) return;
    this._panelEl.querySelectorAll('.anim-clip-row').forEach(row => {
      row.style.background = row.dataset.name === name ? '#1a3a4a' : '';
    });
  }

  _updateScrubber() {
    if (!this._scrubber || !this._currentAction) return;
    const dur = this._currentAction.getClip().duration;
    const t = this._currentAction.time;
    const pct = dur > 0 ? (t / dur) * 100 : 0;
    this._scrubber.style.width = pct + '%';
    const timeLabel = this._panelEl?.querySelector('#anim-time');
    if (timeLabel) timeLabel.textContent = `${t.toFixed(2)} / ${dur.toFixed(2)}`;
  }

  _updateTimeline() {
    if (!this._scrubber) return;
    this._scrubber.style.width = '0%';
    const timeLabel = this._panelEl?.querySelector('#anim-time');
    if (timeLabel) timeLabel.textContent = '0.00 / 0.00';
  }

  /* ═══════════════ Cleanup ═══════════════ */

  dispose() {
    this.stop();
    if (this._mixer) this._mixer.uncacheRoot(this._mixer.getRoot());
    this._mixer = null;
    this._clips = [];
    this._actions.clear();
  }
}
