/**
 * Main Panel canvas host — info.grudge-studio.com/main-panel.html
 *
 * RIGHT:
 *  - #mainScroll is the full interactive canvas under .top-bar
 *  - Scroll shell stays OPEN (content visible)
 *  - Fluid flex fit to viewport — no transform:scale
 *
 * WRONG (purged):
 *  - DESIGN_W + transform:scale on a wrapper (clips mid-panel)
 *  - Nested letterbox stage that shrinks chrome off-screen
 *  - Leaving scroll closed (opacity 0 on .scroll-content)
 *
 * @see docs/MAIN_PANEL_2D_SSOT.md
 */
(function (global) {
  "use strict";

  var _canvas = null;
  var _ctx = null;
  var _raf = 0;
  var _drag = null;
  var _pulse = null;
  var _reduced = false;
  var _host = null; // #mainScroll — the canvas

  function prefersReduced() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }

  /**
   * Undo any leftover scale-stage wrap from older deploys.
   * Moves #mainScroll + #hotbar back under .app if they were reparented.
   */
  function purgeWrongStage() {
    var stage = document.getElementById("mpStage");
    var app = document.querySelector(".app");
    if (!app) return;

    if (stage) {
      var mainScroll = document.getElementById("mainScroll");
      var hotbar = document.getElementById("hotbar");
      var topBar = app.querySelector(":scope > .top-bar");
      // Re-parent children out of stage before removing it
      if (mainScroll && mainScroll.closest("#mpStage")) {
        if (topBar && topBar.nextSibling) {
          app.insertBefore(mainScroll, topBar.nextSibling);
        } else {
          app.appendChild(mainScroll);
        }
      }
      if (hotbar && hotbar.closest("#mpStage")) {
        app.appendChild(hotbar);
      }
      // Drop empty stage + inner
      try {
        stage.remove();
      } catch (_) {
        if (stage.parentNode) stage.parentNode.removeChild(stage);
      }
    }

    // Clear any inline transform scale left on elements
    ["mpStageInner", "mainScroll"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || !el.style) return;
      el.style.transform = "";
      el.style.marginTop = "";
      el.style.width = "";
      el.style.minHeight = "";
    });
  }

  /**
   * Layout: app column → top-bar | mainScroll (flex 1) | hotbar
   */
  function fitFluid() {
    var app = document.querySelector(".app");
    var topBar = document.querySelector(".app > .top-bar");
    var mainScroll = document.getElementById("mainScroll");
    var hotbar = document.getElementById("hotbar");
    if (!app || !mainScroll) return;

    _host = mainScroll;

    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var topH = topBar ? topBar.getBoundingClientRect().height : 48;
    var hotH = hotbar ? hotbar.getBoundingClientRect().height : 56;
    var canvasH = Math.max(200, vh - topH - hotH);

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.height = vh + "px";
    document.body.style.maxHeight = vh + "px";

    app.style.display = "flex";
    app.style.flexDirection = "column";
    app.style.height = vh + "px";
    app.style.maxHeight = vh + "px";
    app.style.overflow = "hidden";
    app.style.minHeight = "0";

    if (topBar) {
      topBar.style.flexShrink = "0";
    }
    if (hotbar) {
      // Ensure hotbar is direct child of app after mainScroll
      if (hotbar.parentElement !== app) app.appendChild(hotbar);
      if (mainScroll.nextSibling !== hotbar) {
        app.insertBefore(hotbar, mainScroll.nextSibling);
      }
      hotbar.style.flexShrink = "0";
      hotbar.style.width = "100%";
    }

    // #mainScroll = canvas fills remaining height
    if (mainScroll.parentElement !== app) {
      if (topBar && topBar.nextSibling) app.insertBefore(mainScroll, topBar.nextSibling);
      else app.insertBefore(mainScroll, hotbar || null);
    }
    mainScroll.style.flex = "1 1 auto";
    mainScroll.style.minHeight = "0";
    mainScroll.style.height = canvasH + "px";
    mainScroll.style.maxHeight = canvasH + "px";
    mainScroll.style.width = "100%";
    mainScroll.style.display = "flex";
    mainScroll.style.flexDirection = "column";
    mainScroll.style.overflow = "hidden";
    mainScroll.style.transform = "none";

    var sc = mainScroll.querySelector(":scope > .scroll-content");
    if (sc) {
      sc.style.flex = "1 1 auto";
      sc.style.minHeight = "0";
      sc.style.height = "100%";
      sc.style.display = "flex";
      sc.style.flexDirection = "column";
      sc.style.overflow = "hidden";
      sc.style.opacity = "1";
      sc.style.pointerEvents = "auto";
    }

    var body = mainScroll.querySelector(".main-body");
    if (body) {
      body.style.flex = "1 1 auto";
      body.style.minHeight = "0";
      body.style.height = "100%";
      body.style.display = "flex";
      body.style.overflow = "hidden";
    }

    var center = mainScroll.querySelector(".center-col");
    if (center) {
      center.style.flex = "1 1 auto";
      center.style.minWidth = "0";
      center.style.minHeight = "0";
      center.style.display = "flex";
      center.style.flexDirection = "column";
      center.style.overflow = "hidden";
    }

    var content = document.getElementById("contentArea");
    if (content) {
      content.style.flex = "1 1 auto";
      content.style.minHeight = "0";
      content.style.overflowY = "auto";
      content.style.overflowX = "hidden";
    }

    ensureScrollOpen();
    placeCanvasOverlay();
    resizeCanvas();

    document.documentElement.style.setProperty("--mp-ui-scale", "1");
    document.documentElement.style.setProperty("--mp-canvas-h", canvasH + "px");
  }

  /** Scroll must be open or content stays opacity 0 */
  function ensureScrollOpen() {
    var host = document.getElementById("mainScroll");
    if (!host) return;
    host.classList.add("is-open");
    host.classList.remove("is-closed", "is-animating");
    host.dataset.scrollState = "open";
    try {
      if (global._mainScrollApi && global._mainScrollApi.snapOpen) {
        global._mainScrollApi.snapOpen();
      }
    } catch (_) {}
    var sc = host.querySelector(":scope > .scroll-content");
    if (sc) {
      sc.style.opacity = "1";
      sc.style.pointerEvents = "auto";
    }
  }

  function placeCanvasOverlay() {
    var host = document.getElementById("mainScroll");
    if (!host) return;
    if (!_canvas) {
      _canvas = document.createElement("canvas");
      _canvas.id = "mp2dCanvas";
      _canvas.className = "mp2d-canvas";
      _canvas.setAttribute("aria-hidden", "true");
      _ctx = _canvas.getContext("2d", { alpha: true });
    }
    // Sit on top of the scroll canvas, not a separate stage
    if (_canvas.parentElement !== host) {
      host.style.position = host.style.position || "relative";
      host.appendChild(_canvas);
    }
    _canvas.style.position = "absolute";
    _canvas.style.inset = "0";
    _canvas.style.width = "100%";
    _canvas.style.height = "100%";
    _canvas.style.pointerEvents = "none";
    _canvas.style.zIndex = "40";
  }

  function resizeCanvas() {
    if (!_canvas || !_ctx) return;
    var host = document.getElementById("mainScroll") || _host;
    if (!host) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = host.clientWidth;
    var h = host.clientHeight;
    if (w < 2 || h < 2) return;
    _canvas.width = Math.floor(w * dpr);
    _canvas.height = Math.floor(h * dpr);
    _canvas.style.width = "100%";
    _canvas.style.height = "100%";
    _ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paint() {
    _raf = 0;
    if (!_ctx || !_canvas) return;
    var host = document.getElementById("mainScroll");
    if (!host) return;
    var w = host.clientWidth;
    var h = host.clientHeight;
    _ctx.clearRect(0, 0, w, h);

    if (_drag && _drag.img) {
      _ctx.save();
      _ctx.globalAlpha = 0.92;
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

  function hostPoint(clientX, clientY) {
    var host = document.getElementById("mainScroll");
    if (!host) return { x: clientX, y: clientY };
    var r = host.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  function beginDrag(source, clientX, clientY) {
    var p = hostPoint(clientX, clientY);
    var img = null;
    if (source && source.tagName === "IMG") img = source;
    else if (typeof source === "string" && source) {
      img = new Image();
      img.decoding = "async";
      img.src = source;
    }
    _drag = { img: img, x: p.x, y: p.y, w: 52 };
    schedule();
  }

  function moveDrag(clientX, clientY) {
    if (!_drag) return;
    var p = hostPoint(clientX, clientY);
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
    var p = hostPoint(clientX, clientY);
    _pulse = { x: p.x, y: p.y, r: r || 16, t0: performance.now() };
    schedule();
  }

  function wireSlotInteractions() {
    var root = document.getElementById("mainScroll") || document.body;
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
          } else pulseAt(ev.clientX, ev.clientY, 14);
        }
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      },
      true
    );
  }

  function fitScale() {
    // Alias for older call sites
    fitFluid();
  }

  function boot() {
    _reduced = prefersReduced();
    document.body.classList.add("mp-canvas-2d", "mp-fluid-fit");
    purgeWrongStage();
    fitFluid();
    ensureScrollOpen();
    wireSlotInteractions();

    document.addEventListener(
      "scroll:open",
      function () {
        ensureScrollOpen();
        fitFluid();
      },
      true
    );

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        fitFluid();
      });
      var app = document.querySelector(".app");
      if (app) ro.observe(app);
      ro.observe(document.documentElement);
    }
    window.addEventListener("resize", fitFluid, { passive: true });
    window.addEventListener("orientationchange", function () {
      setTimeout(fitFluid, 120);
    });

    [100, 400, 900, 1600, 2500].forEach(function (ms) {
      setTimeout(function () {
        purgeWrongStage();
        ensureScrollOpen();
        fitFluid();
      }, ms);
    });

    global.MainPanelCanvas2D = {
      fitScale: fitScale,
      fitFluid: fitFluid,
      ensureScrollOpen: ensureScrollOpen,
      purgeWrongStage: purgeWrongStage,
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
        detail: { scale: 1, fluid: true, purgedStage: true },
      })
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
