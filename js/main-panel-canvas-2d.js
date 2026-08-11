/**
 * Main Panel canvas host — info.grudge-studio.com/main-panel.html
 *
 * Goals:
 *  1. #mainScroll is the interactive canvas (fills remaining viewport under top bar)
 *  2. Scroll shell opens (World Map parchment) and stays open for content
 *  3. Fit-to-screen: fluid 100% layout — no transform-scale crop mid-panel
 *  4. HTMLCanvas2D overlay for drag ghost / click pulse only
 *
 * Best practice: do NOT use CSS transform:scale on the main chrome for fit —
 * scaled elements keep their layout box and overflow:hidden clips the middle.
 *
 * @see docs/MAIN_PANEL_2D_SSOT.md
 */
(function (global) {
  "use strict";

  var _stage = null;
  var _inner = null;
  var _canvas = null;
  var _ctx = null;
  var _raf = 0;
  var _drag = null;
  var _pulse = null;
  var _reduced = false;

  function prefersReduced() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }

  /**
   * Wrap #mainScroll + hotbar so they fill .app under the top bar.
   */
  function ensureStage() {
    if (document.getElementById("mpStage")) {
      _stage = document.getElementById("mpStage");
      _inner = document.getElementById("mpStageInner");
      _canvas = document.getElementById("mp2dCanvas");
      if (_canvas) _ctx = _canvas.getContext("2d", { alpha: true });
      return;
    }
    var app = document.querySelector(".app");
    var mainScroll = document.getElementById("mainScroll");
    var hotbar = document.getElementById("hotbar");
    if (!app || !mainScroll) return;

    _stage = document.createElement("div");
    _stage.id = "mpStage";
    _stage.className = "mp-stage mp-stage--fluid";
    _stage.setAttribute("data-mp-stage", "1");

    _inner = document.createElement("div");
    _inner.id = "mpStageInner";
    _inner.className = "mp-stage-inner mp-stage-inner--fluid";

    app.insertBefore(_stage, mainScroll);
    _inner.appendChild(mainScroll);
    if (hotbar) _inner.appendChild(hotbar);
    _stage.appendChild(_inner);

    _canvas = document.createElement("canvas");
    _canvas.id = "mp2dCanvas";
    _canvas.className = "mp2d-canvas";
    _canvas.setAttribute("aria-hidden", "true");
    _stage.appendChild(_canvas);
    _ctx = _canvas.getContext("2d", { alpha: true });
  }

  /**
   * Fit stage to remaining viewport — fluid, no transform crop.
   */
  function fitScale() {
    if (!_stage || !_inner) return 1;

    var app = document.querySelector(".app");
    var topBar = document.querySelector(".app > .top-bar");
    var topH = topBar ? topBar.getBoundingClientRect().height : 48;
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var vw = window.innerWidth || document.documentElement.clientWidth || 1200;
    var rh = Math.max(240, vh - topH);

    if (app) {
      app.style.height = vh + "px";
      app.style.maxHeight = vh + "px";
      app.style.overflow = "hidden";
      app.style.display = "flex";
      app.style.flexDirection = "column";
    }

    // Stage = full remaining viewport
    _stage.style.flex = "1 1 auto";
    _stage.style.minHeight = "0";
    _stage.style.width = "100%";
    _stage.style.height = rh + "px";
    _stage.style.maxHeight = rh + "px";
    _stage.style.overflow = "hidden";
    _stage.style.display = "flex";
    _stage.style.flexDirection = "column";

    // Inner fills stage — NO transform:scale (that was clipping mid-panel)
    _inner.style.width = "100%";
    _inner.style.height = "100%";
    _inner.style.maxHeight = "100%";
    _inner.style.minHeight = "0";
    _inner.style.flex = "1 1 auto";
    _inner.style.display = "flex";
    _inner.style.flexDirection = "column";
    _inner.style.transform = "none";
    _inner.style.margin = "0";
    _inner.style.overflow = "hidden";

    var mainScroll = document.getElementById("mainScroll");
    if (mainScroll) {
      mainScroll.style.flex = "1 1 auto";
      mainScroll.style.minHeight = "0";
      mainScroll.style.height = "100%";
      mainScroll.style.maxHeight = "100%";
      mainScroll.style.width = "100%";
      mainScroll.style.display = "flex";
      mainScroll.style.flexDirection = "column";
      mainScroll.style.overflow = "hidden";

      // scroll-content well from mountScrollContainer
      var sc = mainScroll.querySelector(":scope > .scroll-content");
      if (sc) {
        sc.style.flex = "1 1 auto";
        sc.style.minHeight = "0";
        sc.style.height = "100%";
        sc.style.display = "flex";
        sc.style.flexDirection = "column";
        sc.style.overflow = "hidden";
      }
      var body = mainScroll.querySelector(".main-body");
      if (body) {
        body.style.flex = "1 1 auto";
        body.style.minHeight = "0";
        body.style.height = "100%";
        body.style.display = "flex";
        body.style.overflow = "hidden";
      }
    }

    var hotbar = document.getElementById("hotbar");
    if (hotbar) {
      hotbar.style.flexShrink = "0";
      hotbar.style.width = "100%";
    }

    // Ensure scroll shell is OPEN so content is visible
    ensureScrollOpen();

    resizeCanvas();
    document.documentElement.style.setProperty("--mp-ui-scale", "1");
    document.documentElement.style.setProperty("--mp-stage-h", rh + "px");
    document.documentElement.style.setProperty("--mp-stage-w", vw + "px");
    document.documentElement.style.setProperty("--mp-design-w", "100%");
    return 1;
  }

  /**
   * Scroll must be open for the canvas to show UI (content opacity gated by .is-open).
   */
  function ensureScrollOpen() {
    var host = document.getElementById("mainScroll");
    if (!host) return;
    host.classList.remove("is-animating", "is-closed");
    host.classList.add("is-open");
    host.dataset.scrollState = "open";
    try {
      if (global._mainScrollApi && typeof global._mainScrollApi.snapOpen === "function") {
        global._mainScrollApi.snapOpen();
      }
    } catch (_) {}
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
    if (!_ctx || !_canvas || !_stage) return;
    var w = _stage.clientWidth;
    var h = _stage.clientHeight;
    _ctx.clearRect(0, 0, w, h);

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

  function beginDrag(source, clientX, clientY) {
    var p = stagePoint(clientX, clientY);
    var img = null;
    if (source && source.tagName === "IMG") img = source;
    else if (typeof source === "string" && source) {
      img = new Image();
      img.decoding = "async";
      img.src = source;
    }
    _drag = { img: img, x: p.x, y: p.y, w: 52, alpha: 0.92 };
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

  function wireSlotInteractions() {
    var root = document.getElementById("mpStageInner") || document.body;
    root.addEventListener(
      "pointerdown",
      function (e) {
        var cell =
          e.target.closest &&
          e.target.closest(".inv-cell.has-item, .eq-slot.equipped, .hb-slot");
        if (!cell || e.button !== 0) return;
        var img = cell.querySelector("img, .slot-icon");
        if (!img) return;
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

  function onScrollLifecycle() {
    // After parchment open animation, reflow fluid canvas
    document.addEventListener(
      "scroll:open",
      function () {
        ensureScrollOpen();
        fitScale();
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
    document.body.classList.add("mp-canvas-2d", "mp-fluid-fit");
    fitScale();
    ensureScrollOpen();
    wireSlotInteractions();
    onScrollLifecycle();

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        fitScale();
      });
      ro.observe(_stage);
      if (document.querySelector(".app")) ro.observe(document.querySelector(".app"));
      if (document.documentElement) ro.observe(document.documentElement);
    }
    window.addEventListener("resize", fitScale, { passive: true });
    window.addEventListener("orientationchange", function () {
      setTimeout(fitScale, 100);
    });

    // After scroll appear (~0.8–1.2s) and late layout (images)
    [200, 600, 1200, 2000].forEach(function (ms) {
      setTimeout(function () {
        ensureScrollOpen();
        fitScale();
      }, ms);
    });

    global.MainPanelCanvas2D = {
      fitScale: fitScale,
      ensureScrollOpen: ensureScrollOpen,
      beginDrag: beginDrag,
      moveDrag: moveDrag,
      endDrag: endDrag,
      pulseAt: pulseAt,
      getScale: function () {
        return 1;
      },
      fluid: true,
    };

    document.dispatchEvent(
      new CustomEvent("grudge:main-panel:canvas-2d-ready", {
        detail: { scale: 1, fluid: true },
      })
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
