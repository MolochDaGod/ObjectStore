/**
 * Main Panel interactive 2D canvas layer (info.grudge-studio.com).
 *
 * Responsibilities:
 *  - HYDRA design-space scale (1920× design height) for consistent containers
 *  - HTMLCanvas2D overlay for drag ghosts + hover pulse (GPU paint, no DOM thrash)
 *  - Smooth resize via ResizeObserver
 *
 * Does NOT replace Three.js hero viewport (that stays on #hero-viewport).
 * Scroll open/close remains ui-scroll-container.js (World Map parchment).
 *
 * @see docs/MAIN_PANEL_2D_SSOT.md
 */
(function (global) {
  "use strict";

  /** Design space (HYDRA-compatible width). Height is fluid but width-locked. */
  var DESIGN_W = 1600;
  var DESIGN_MIN_H = 820;
  var MAX_SCALE = 1.12;
  var MIN_SCALE = 0.55;

  var _stage = null;
  var _inner = null;
  var _canvas = null;
  var _ctx = null;
  var _raf = 0;
  var _scale = 1;
  var _drag = null; // { img, x, y, w, h, alpha }
  var _pulse = null; // { x, y, r, t0 }
  var _reduced = false;

  function prefersReduced() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }

  /**
   * Wrap #mainScroll + hotbar in a scaled stage if not already.
   */
  function ensureStage() {
    if (document.getElementById("mpStage")) {
      _stage = document.getElementById("mpStage");
      _inner = document.getElementById("mpStageInner");
      return;
    }
    var app = document.querySelector(".app");
    var mainScroll = document.getElementById("mainScroll");
    var hotbar = document.getElementById("hotbar");
    if (!app || !mainScroll) return;

    _stage = document.createElement("div");
    _stage.id = "mpStage";
    _stage.className = "mp-stage";
    _stage.setAttribute("data-mp-stage", "1");

    _inner = document.createElement("div");
    _inner.id = "mpStageInner";
    _inner.className = "mp-stage-inner";
    _inner.style.width = DESIGN_W + "px";

    // Move scroll + hotbar into stage
    var next = mainScroll.nextSibling;
    app.insertBefore(_stage, mainScroll);
    _inner.appendChild(mainScroll);
    if (hotbar) _inner.appendChild(hotbar);
    _stage.appendChild(_inner);

    // Canvas overlay (pointer-events none until drag)
    _canvas = document.createElement("canvas");
    _canvas.id = "mp2dCanvas";
    _canvas.className = "mp2d-canvas";
    _canvas.setAttribute("aria-hidden", "true");
    _stage.appendChild(_canvas);
    _ctx = _canvas.getContext("2d", { alpha: true });
  }

  function fitScale() {
    if (!_stage || !_inner) return 1;
    var rw = _stage.clientWidth || window.innerWidth;
    var rh = _stage.clientHeight || Math.max(400, window.innerHeight - 56);
    // Height of design = max(content min, stage height / scale) — use width-primary fit
    var sW = rw / DESIGN_W;
    var sH = rh / DESIGN_MIN_H;
    var s = Math.min(sW, sH, MAX_SCALE);
    s = Math.max(MIN_SCALE, s);
    _scale = s;

    _inner.style.transform = "scale(" + s + ")";
    _inner.style.transformOrigin = "top center";
    // Layout space for flex parent (scaled element still occupies unscaled box unless we set height)
    var contentH = Math.max(
      DESIGN_MIN_H,
      Math.ceil((_inner.scrollHeight || DESIGN_MIN_H) )
    );
    // Prefer measured inner height after layout
    var measured = _inner.getBoundingClientRect().height / (s || 1);
    if (measured > 100) contentH = measured;
    _stage.style.height = Math.min(rh, contentH * s) + "px";
    // Center horizontally when letterboxed
    _inner.style.marginLeft = "auto";
    _inner.style.marginRight = "auto";

    resizeCanvas();
    document.documentElement.style.setProperty("--mp-ui-scale", String(s));
    document.documentElement.style.setProperty("--mp-design-w", DESIGN_W + "px");
    return s;
  }

  function resizeCanvas() {
    if (!_canvas || !_stage || !_ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = _stage.clientWidth;
    var h = _stage.clientHeight;
    if (w < 2 || h < 2) return;
    _canvas.width = Math.floor(w * dpr);
    _canvas.height = Math.floor(h * dpr);
    _canvas.style.width = w + "px";
    _canvas.style.height = h + "px";
    _ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paint() {
    _raf = 0;
    if (!_ctx || !_canvas) return;
    var w = _stage.clientWidth;
    var h = _stage.clientHeight;
    _ctx.clearRect(0, 0, w, h);

    // Drag ghost
    if (_drag && _drag.img) {
      _ctx.save();
      _ctx.globalAlpha = _drag.alpha != null ? _drag.alpha : 0.92;
      var sz = _drag.w || 48;
      _ctx.shadowColor = "rgba(212,164,0,0.55)";
      _ctx.shadowBlur = 16;
      try {
        _ctx.drawImage(_drag.img, _drag.x - sz / 2, _drag.y - sz / 2, sz, sz);
      } catch (_) {}
      _ctx.restore();
      if (!_reduced) schedule();
    }

    // Equip / click pulse
    if (_pulse) {
      var t = (performance.now() - _pulse.t0) / 420;
      if (t < 1) {
        _ctx.save();
        _ctx.globalAlpha = 0.45 * (1 - t);
        _ctx.strokeStyle = "rgba(212,164,0,0.9)";
        _ctx.lineWidth = 2;
        _ctx.beginPath();
        _ctx.arc(_pulse.x, _pulse.y, (_pulse.r || 18) + t * 28, 0, Math.PI * 2);
        _ctx.stroke();
        _ctx.restore();
        schedule();
      } else {
        _pulse = null;
      }
    }
  }

  function schedule() {
    if (_raf) return;
    _raf = requestAnimationFrame(paint);
  }

  function stagePoint(clientX, clientY) {
    if (!_stage) return { x: clientX, y: clientY };
    var r = _stage.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  /**
   * Start drag ghost from an icon URL or <img>.
   */
  function beginDrag(source, clientX, clientY) {
    var p = stagePoint(clientX, clientY);
    var img = null;
    if (source && source.tagName === "IMG") {
      img = source;
    } else if (typeof source === "string" && source) {
      img = new Image();
      img.decoding = "async";
      img.src = source;
    }
    _drag = { img: img, x: p.x, y: p.y, w: 52, alpha: 0.92 };
    if (_canvas) _canvas.style.pointerEvents = "none";
    schedule();
  }

  function moveDrag(clientX, clientY) {
    if (!_drag) return;
    var p = stagePoint(clientX, clientY);
    _drag.x = p.x;
    _drag.y = p.y;
    schedule();
  }

  function endDrag() {
    _drag = null;
    schedule();
  }

  function pulseAt(clientX, clientY, r) {
    if (_reduced) return;
    var p = stagePoint(clientX, clientY);
    _pulse = { x: p.x, y: p.y, r: r || 16, t0: performance.now() };
    schedule();
  }

  /**
   * Wire inventory / equip slot drag + click feedback.
   */
  function wireSlotInteractions() {
    var root = document.getElementById("mpStageInner") || document.body;
    // Use event delegation — inventory re-renders often
    root.addEventListener(
      "pointerdown",
      function (e) {
        var cell = e.target.closest && e.target.closest(".inv-cell.has-item, .eq-slot.equipped, .hb-slot");
        if (!cell || e.button !== 0) return;
        var img = cell.querySelector("img, .slot-icon");
        if (!img) return;
        // Only start ghost after small movement (avoid fighting click equip)
        var sx = e.clientX;
        var sy = e.clientY;
        var started = false;
        function onMove(ev) {
          var dx = ev.clientX - sx;
          var dy = ev.clientY - sy;
          if (!started && dx * dx + dy * dy > 36) {
            started = true;
            beginDrag(img, ev.clientX, ev.clientY);
            cell.classList.add("is-dragging-src");
          }
          if (started) moveDrag(ev.clientX, ev.clientY);
        }
        function onUp(ev) {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          if (started) {
            endDrag();
            cell.classList.remove("is-dragging-src");
            pulseAt(ev.clientX, ev.clientY, 20);
          } else {
            pulseAt(ev.clientX, ev.clientY, 14);
          }
        }
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      },
      true
    );
  }

  function boot() {
    _reduced = prefersReduced();
    ensureStage();
    if (!_stage) {
      console.warn("[mp-canvas-2d] no stage host");
      return;
    }
    document.body.classList.add("mp-canvas-2d");
    fitScale();
    wireSlotInteractions();

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        fitScale();
      });
      ro.observe(_stage);
      if (document.querySelector(".app")) ro.observe(document.querySelector(".app"));
    }
    window.addEventListener("resize", fitScale, { passive: true });
    // Refit after scroll open animation settles
    setTimeout(fitScale, 900);
    setTimeout(fitScale, 1600);

    global.MainPanelCanvas2D = {
      fitScale: fitScale,
      beginDrag: beginDrag,
      moveDrag: moveDrag,
      endDrag: endDrag,
      pulseAt: pulseAt,
      getScale: function () {
        return _scale;
      },
      DESIGN_W: DESIGN_W,
    };

    document.dispatchEvent(new CustomEvent("grudge:main-panel:canvas-2d-ready", { detail: { scale: _scale } }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
