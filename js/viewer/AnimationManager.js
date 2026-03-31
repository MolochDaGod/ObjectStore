/**
 * AnimationManager.js — Babylon.js AnimationGroup playback, timeline, state machine
 * Uses global BABYLON namespace (UMD CDN build)
 */
class AnimationManager {
  constructor() {
    this._groups = [];          // AnimationGroup[]
    this._currentGroup = null;
    this._speed = 1.0;
    this._isPlaying = false;
    this._loopMode = true;
    this._panelEl = null;
    this._scrubber = null;
    this._timelineEl = null;
    // State machine from animations.json
    this._states = {};
    this._transitions = {};
    this._blendDefaults = { fadeIn: 0.2, fadeOut: 0.2 };
    this._currentState = 'idle';
    this._loadConfig();
  }

  async _loadConfig() {
    try {
      const res = await fetch('api/v1/animations.json');
      if (!res.ok) return;
      const data = await res.json();
      if (data.battleAnimationStates?.states) this._states = data.battleAnimationStates.states;
      if (data.transitionRules) this._transitions = data.transitionRules;
      if (data.blendDefaults) this._blendDefaults = { ...this._blendDefaults, ...data.blendDefaults };
    } catch { /* offline */ }
  }

  /** Bind to loaded model's animation groups */
  bind(animationGroups) {
    this.stop();
    this._groups = animationGroups || [];
    this._currentGroup = null;
    this._renderClipList();
    this._updateTimeline();
  }

  update() {
    this._updateScrubber();
  }

  /* ═══════ Playback ═══════ */
  play(name) {
    const g = this._groups.find(g => g.name === name);
    if (!g) return;
    if (this._currentGroup && this._currentGroup !== g) this._currentGroup.stop();
    g.start(this._loopMode, this._speed);
    this._currentGroup = g;
    this._currentState = name;
    this._isPlaying = true;
    this._highlightActive(name);
  }

  crossfade(fromName, toName, duration) {
    const from = this._groups.find(g => g.name === fromName);
    const to = this._groups.find(g => g.name === toName);
    if (!from || !to) return;
    // BJS doesn't have built-in crossfade between AnimationGroups,
    // so we stop one and start the other
    from.stop();
    to.start(this._loopMode, this._speed);
    this._currentGroup = to;
    this._currentState = toName;
    this._isPlaying = true;
    this._highlightActive(toName);
  }

  pause() { this._currentGroup?.pause(); this._isPlaying = false; }
  resume() { this._currentGroup?.play(this._loopMode); this._isPlaying = true; }
  stop() { this._groups.forEach(g => g.stop()); this._isPlaying = false; this._currentGroup = null; }

  setSpeed(s) {
    this._speed = Math.max(0.1, Math.min(5.0, s));
    if (this._currentGroup) this._currentGroup.speedRatio = this._speed;
  }
  setLoop(loop) { this._loopMode = loop; }

  seekTo(t) {
    if (!this._currentGroup) return;
    this._currentGroup.goToFrame(t * this._currentGroup.targetedAnimations[0]?.animation?.framePerSecond || t);
  }
  seekPercent(pct) {
    if (!this._currentGroup) return;
    const dur = (this._currentGroup.to - this._currentGroup.from);
    this.seekTo(this._currentGroup.from + dur * (pct / 100));
  }

  /* ═══════ State Machine ═══════ */
  transition(toState) {
    const allowed = this._transitions[this._currentState];
    if (!allowed || !allowed.includes(toState)) return false;
    this.play(toState); return true;
  }
  getAvailableTransitions() { return this._transitions[this._currentState] || []; }

  /* ═══════ Info ═══════ */
  getClipNames() { return this._groups.map(g => g.name); }
  getClipInfo(name) {
    const g = this._groups.find(g => g.name === name);
    if (!g) return null;
    return { name: g.name, duration: (g.to - g.from) / 60, tracks: g.targetedAnimations.length };
  }

  /* ═══════ UI ═══════ */
  buildUI(container) {
    this._panelEl = container;
    container.innerHTML = '';
    container.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px;color:#eee;font-size:13px;';

    const listWrap = document.createElement('div');
    listWrap.id = 'anim-clip-list';
    listWrap.style.cssText = 'max-height:200px;overflow-y:auto;border:1px solid #444;border-radius:4px;';
    container.appendChild(listWrap);

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
      </select>`;
    container.appendChild(controls);

    const timeline = document.createElement('div');
    timeline.style.cssText = 'position:relative;height:24px;background:#222;border:1px solid #444;border-radius:4px;cursor:pointer;';
    timeline.innerHTML = `
      <div id="anim-scrubber" style="position:absolute;top:0;left:0;height:100%;background:rgba(0,200,255,0.3);border-radius:4px;pointer-events:none;"></div>
      <span id="anim-time" style="position:absolute;right:6px;top:3px;font-size:11px;color:#888;pointer-events:none;">0.00 / 0.00</span>`;
    container.appendChild(timeline);
    this._scrubber = timeline.querySelector('#anim-scrubber');
    this._timelineEl = timeline;

    // Wire events
    controls.querySelector('#anim-play').onclick = () => {
      if (this._currentGroup) this.resume();
      else if (this._groups.length) this.play(this._groups[0].name);
    };
    controls.querySelector('#anim-pause').onclick = () => this.pause();
    controls.querySelector('#anim-stop').onclick = () => this.stop();
    const speedInput = controls.querySelector('#anim-speed');
    const speedVal = controls.querySelector('#anim-speed-val');
    speedInput.oninput = () => { this.setSpeed(parseFloat(speedInput.value)); speedVal.textContent = parseFloat(speedInput.value).toFixed(1) + 'x'; };
    controls.querySelector('#anim-loop').onchange = function() { this.setLoop(this.value === 'repeat'); }.bind(this);
    timeline.addEventListener('click', e => { const r = timeline.getBoundingClientRect(); this.seekPercent(((e.clientX - r.left) / r.width) * 100); });
    container.querySelectorAll('button').forEach(b => { b.style.cssText = 'background:#333;color:#eee;border:1px solid #555;border-radius:3px;padding:4px 10px;cursor:pointer;'; });
    this._renderClipList();
  }

  _renderClipList() {
    const list = this._panelEl?.querySelector('#anim-clip-list');
    if (!list) return;
    list.innerHTML = '';
    if (!this._groups.length) { list.innerHTML = '<div style="padding:8px;color:#666;">No animations loaded</div>'; return; }
    this._groups.forEach(g => {
      const dur = ((g.to - g.from) / 60).toFixed(2);
      const row = document.createElement('div');
      row.className = 'anim-clip-row'; row.dataset.name = g.name;
      row.style.cssText = 'padding:6px 8px;cursor:pointer;border-bottom:1px solid #333;display:flex;justify-content:space-between;';
      row.innerHTML = `<span>${g.name}</span><span style="color:#888;font-size:11px;">${dur}s · ${g.targetedAnimations.length} tracks</span>`;
      row.onclick = () => this.play(g.name);
      row.onmouseenter = () => row.style.background = '#2a2a2a';
      row.onmouseleave = () => row.style.background = (this._currentState === g.name) ? '#1a3a4a' : '';
      list.appendChild(row);
    });
  }

  _highlightActive(name) {
    this._panelEl?.querySelectorAll('.anim-clip-row').forEach(r => {
      r.style.background = r.dataset.name === name ? '#1a3a4a' : '';
    });
  }

  _updateScrubber() {
    if (!this._scrubber || !this._currentGroup) return;
    const from = this._currentGroup.from, to = this._currentGroup.to;
    const dur = to - from;
    // Get current frame from first targeted animation
    const ta = this._currentGroup.targetedAnimations[0];
    if (!ta) return;
    const anim = ta.animation;
    const t = anim?.runtimeAnimations?.[0]?.currentFrame ?? from;
    const pct = dur > 0 ? ((t - from) / dur) * 100 : 0;
    this._scrubber.style.width = Math.min(100, pct) + '%';
    const label = this._panelEl?.querySelector('#anim-time');
    if (label) label.textContent = `${((t - from) / 60).toFixed(2)} / ${(dur / 60).toFixed(2)}`;
  }

  _updateTimeline() {
    if (this._scrubber) this._scrubber.style.width = '0%';
    const label = this._panelEl?.querySelector('#anim-time');
    if (label) label.textContent = '0.00 / 0.00';
  }

  dispose() { this.stop(); this._groups = []; }
}

window.AnimationManager = AnimationManager;
