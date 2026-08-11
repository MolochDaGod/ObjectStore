/**
 * Main Panel side columns — slide hide/show, drag resize, minimize to edge tabs.
 * Extends #leftPanel (stats) + #invPanel (bag). Persists widths/collapse in localStorage.
 * Does not invent a second layout system; only wires existing .left-col / .right-col.
 */
(function (global) {
  "use strict";

  var LS_KEY = "grudge.mp.sidePanels.v1";
  var RAIL_W = 36;
  var DEFAULTS = {
    left: { w: 260, collapsed: false },
    right: { w: 280, collapsed: false },
  };
  var LIMITS = {
    left: { min: 180, max: 420 },
    right: { min: 200, max: 480 },
  };

  var state = {
    left: Object.assign({}, DEFAULTS.left),
    right: Object.assign({}, DEFAULTS.right),
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function panelEl(side) {
    return side === "left"
      ? document.getElementById("leftPanel")
      : document.getElementById("invPanel");
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed.left) {
        state.left.w = clampW("left", Number(parsed.left.w) || DEFAULTS.left.w);
        state.left.collapsed = !!parsed.left.collapsed;
      }
      if (parsed.right) {
        state.right.w = clampW("right", Number(parsed.right.w) || DEFAULTS.right.w);
        state.right.collapsed = !!parsed.right.collapsed;
      }
    } catch (_) {}
  }

  function saveState() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function clampW(side, w) {
    var lim = LIMITS[side] || { min: 180, max: 420 };
    var maxByView = Math.max(lim.min, Math.floor(window.innerWidth * 0.42));
    var max = Math.min(lim.max, maxByView);
    return Math.max(lim.min, Math.min(max, Math.round(w)));
  }

  function applySide(side) {
    var el = panelEl(side);
    if (!el) return;
    var s = state[side];
    var expanded = !s.collapsed;
    var w = s.collapsed ? RAIL_W : clampW(side, s.w);
    el.style.setProperty("--mp-side-w", w + "px");
    el.style.width = w + "px";
    el.style.flexBasis = w + "px";
    el.classList.toggle("is-collapsed", !!s.collapsed);
    el.setAttribute("aria-expanded", expanded ? "true" : "false");
    var rail = el.querySelector(".mp-side-rail");
    if (rail) {
      rail.setAttribute("aria-expanded", expanded ? "true" : "false");
      rail.title = expanded
        ? side === "left"
          ? "Stats panel open"
          : "Inventory open"
        : side === "left"
          ? "Expand stats panel"
          : "Expand inventory";
    }
    notifyLayout();
  }

  function applyAll() {
    applySide("left");
    applySide("right");
  }

  function setCollapsed(side, collapsed) {
    if (!state[side]) return;
    state[side].collapsed = !!collapsed;
    // If collapsing empty width, keep last good width for expand
    if (!collapsed) {
      state[side].w = clampW(side, state[side].w || DEFAULTS[side].w);
    }
    applySide(side);
    saveState();
  }

  function setWidth(side, w) {
    state[side].w = clampW(side, w);
    if (!state[side].collapsed) applySide(side);
    saveState();
  }

  function toggle(side) {
    setCollapsed(side, !state[side].collapsed);
  }

  function notifyLayout() {
    try {
      global.dispatchEvent(
        new CustomEvent("grudge:main-panel:side-panels", {
          detail: { left: Object.assign({}, state.left), right: Object.assign({}, state.right) },
        })
      );
    } catch (_) {}
    try {
      var c = global.MainPanelCanvas2D;
      if (c) {
        if (c.fitFluid) c.fitFluid();
        else if (c.fitScale) c.fitScale();
      }
    } catch (_) {}
  }

  function wireResize(side) {
    var el = panelEl(side);
    if (!el) return;
    var handle = el.querySelector('.mp-side-resizer[data-side="' + side + '"]');
    if (!handle || handle._mpSideWired) return;
    handle._mpSideWired = true;

    var drag = null;

    function onMove(e) {
      if (!drag) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var dx = clientX - drag.startX;
      // Left: drag right = wider; right: drag left = wider
      var next = side === "left" ? drag.startW + dx : drag.startW - dx;
      var w = clampW(side, next);
      state[side].w = w;
      el.style.setProperty("--mp-side-w", w + "px");
      el.style.width = w + "px";
      el.style.flexBasis = w + "px";
      if (e.cancelable) e.preventDefault();
    }

    function onUp() {
      if (!drag) return;
      drag = null;
      el.classList.remove("is-resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      saveState();
      notifyLayout();
    }

    function onDown(e) {
      if (state[side].collapsed) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      drag = { startX: clientX, startW: state[side].w };
      el.classList.add("is-resizing");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
      if (e.pointerId != null && handle.setPointerCapture) {
        try {
          handle.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      e.preventDefault();
    }

    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("touchstart", onDown, { passive: false });
    handle.addEventListener("dblclick", function (e) {
      e.preventDefault();
      setCollapsed(side, true);
    });
  }

  function wireButtons() {
    document.querySelectorAll("[data-mp-collapse]").forEach(function (btn) {
      if (btn._mpSideWired) return;
      btn._mpSideWired = true;
      btn.addEventListener("click", function () {
        setCollapsed(btn.getAttribute("data-mp-collapse"), true);
      });
    });
    document.querySelectorAll("[data-mp-expand]").forEach(function (btn) {
      if (btn._mpSideWired) return;
      btn._mpSideWired = true;
      btn.addEventListener("click", function () {
        setCollapsed(btn.getAttribute("data-mp-expand"), false);
      });
    });
  }

  function autoNarrow() {
    // First visit on narrow viewports: start collapsed so center content has room
    try {
      if (localStorage.getItem(LS_KEY)) return;
      if (window.innerWidth < 1000) {
        state.left.collapsed = true;
        state.right.collapsed = true;
        saveState();
      }
    } catch (_) {}
  }

  function boot() {
    loadState();
    autoNarrow();
    applyAll();
    wireResize("left");
    wireResize("right");
    wireButtons();
    window.addEventListener(
      "resize",
      function () {
        // Re-clamp open panels when viewport shrinks
        if (!state.left.collapsed) setWidth("left", state.left.w);
        if (!state.right.collapsed) setWidth("right", state.right.w);
      },
      { passive: true }
    );
  }

  var api = {
    boot: boot,
    toggle: toggle,
    setCollapsed: setCollapsed,
    setWidth: setWidth,
    getState: function () {
      return { left: Object.assign({}, state.left), right: Object.assign({}, state.right) };
    },
    expand: function (side) {
      setCollapsed(side, false);
    },
    collapse: function (side) {
      setCollapsed(side, true);
    },
  };

  global.MainPanelSidePanels = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
