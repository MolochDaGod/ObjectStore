/**
 * Main Panel 2D bootstrap — fonts/chrome already via CSS; this wires:
 *  - mp2d-ready class
 *  - language select
 *  - tab enter animations
 *  - critical asset preload (CraftPix slots / window)
 *  - optional craftpix-rpg CSS from assets CDN
 *
 * 2D npm/fleet practices:
 *  - preload only critical PNGs
 *  - decode async images
 *  - respect reduced motion
 *  - no layout-read thrash in rAF
 */
(function (global) {
  "use strict";

  var CRAFTPIX_CSS = [
    "https://assets.grudge-studio.com/ui/craftpix-rpg/craftpix-rpg-ui.css",
    "https://ui.grudge-studio.com/assets/index-C7sTteZB.css",
  ];

  var PRELOAD = [
    "https://ui.grudge-studio.com/assets/craftpix/Inventory/Inventory_Slot_Background.png",
    "https://ui.grudge-studio.com/assets/craftpix/Window/Window_Background.png",
    "https://ui.grudge-studio.com/assets/craftpix/Action%20Bar/Slots/AB_MainSlot_Background.png",
    "https://ui.grudge-studio.com/assets/craftpix/Action%20Bar/Slots/AB_MainSlot_Border.png",
    "/ui/packs/gold/panels.png",
    "/ui/scroll/open.png",
  ];

  function injectCss(href) {
    return new Promise(function (resolve) {
      if (document.querySelector('link[data-mp2d-css="' + href + '"]')) {
        resolve(true);
        return;
      }
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-mp2d-css", href);
      link.onload = function () {
        resolve(true);
      };
      link.onerror = function () {
        resolve(false);
      };
      document.head.appendChild(link);
    });
  }

  function preloadImages(urls) {
    urls.forEach(function (u) {
      try {
        var img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.src = u;
      } catch (_) {}
      try {
        var l = document.createElement("link");
        l.rel = "preload";
        l.as = "image";
        l.href = u;
        document.head.appendChild(l);
      } catch (_) {}
    });
  }

  function wireLangSelect() {
    var host = document.getElementById("mp2dLangHost");
    if (!host || !global.MainPanelI18n) return;
    host.innerHTML =
      '<div class="mp2d-lang">' +
      '<label for="mp2dLangSelect" data-i18n="app.language">Lang</label>' +
      '<select id="mp2dLangSelect" aria-label="Language"></select>' +
      "</div>";
    var sel = document.getElementById("mp2dLangSelect");
    global.MainPanelI18n.fillSelect(sel);
    global.MainPanelI18n.applyDom();
    sel.addEventListener("change", function () {
      global.MainPanelI18n.setLocale(sel.value);
      // Re-paint tab labels after locale change
      try {
        if (typeof global.rebuildTabStrip === "function") global.rebuildTabStrip();
        else global.MainPanelI18n.applyDom();
      } catch (_) {}
    });
  }

  function animateContentEnter() {
    var area = document.getElementById("contentArea");
    if (!area) return;
    area.classList.remove("mp2d-enter");
    area.classList.remove("is-tab-enter");
    // force reflow for re-trigger
    void area.offsetWidth;
    area.classList.add("mp2d-enter");
    area.classList.add("is-tab-enter");
    // Keep scroll position top on tab paint (clean container usage)
    try {
      area.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_) {
      area.scrollTop = 0;
    }
    // Refit fluid canvas after DOM paint
    try {
      var c = global.MainPanelCanvas2D;
      if (c) {
        if (c.purgeWrongStage) c.purgeWrongStage();
        if (c.ensureScrollOpen) c.ensureScrollOpen();
        if (c.fitFluid) c.fitFluid();
        else if (c.fitScale) c.fitScale();
      }
    } catch (_) {}
  }

  function patchSwitchTab() {
    var prev = global.switchTab;
    if (typeof prev !== "function") return;
    global.switchTab = function (t) {
      prev(t);
      // fix active state by data-tab (i18n-safe)
      document.querySelectorAll(".tab-btn").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-tab") === t);
      });
      animateContentEnter();
      // Keep parchment OPEN — never re-play Appear on tab change
      try {
        if (global._mainScrollApi && global._mainScrollApi.snapOpen) {
          global._mainScrollApi.snapOpen();
        }
      } catch (_) {}
    };
  }

  function wireScaleChip() {
    if (document.getElementById("mpScaleChip")) return;
    var chip = document.createElement("div");
    chip.id = "mpScaleChip";
    chip.className = "mp-scale-chip";
    chip.textContent = "ui scale";
    document.body.appendChild(chip);
    function refresh() {
      var s =
        (global.MainPanelCanvas2D && global.MainPanelCanvas2D.getScale && global.MainPanelCanvas2D.getScale()) ||
        1;
      chip.textContent = "UI ×" + (Math.round(s * 100) / 100).toFixed(2);
    }
    document.addEventListener("grudge:main-panel:canvas-2d-ready", refresh);
    window.addEventListener("resize", refresh, { passive: true });
    // ?scaleChip=1 or localStorage debug
    try {
      var q = new URLSearchParams(location.search);
      if (q.get("scaleChip") === "1" || localStorage.getItem("grudge.mp.showScale") === "1") {
        document.body.classList.add("show-scale-chip");
      }
    } catch (_) {}
    setTimeout(refresh, 200);
  }

  async function boot() {
    document.body.classList.add("mp2d-ready");

    // Prefer craftpix RPG skin from CDN (non-blocking)
    for (var i = 0; i < CRAFTPIX_CSS.length; i++) {
      var ok = await injectCss(CRAFTPIX_CSS[i]);
      if (ok) break;
    }

    preloadImages(PRELOAD);

    if (global.MainPanelI18n) {
      try {
        await global.MainPanelI18n.load();
      } catch (e) {
        console.warn("[mp2d] i18n", e);
      }
      wireLangSelect();
    }

    patchSwitchTab();
    animateContentEnter();
    wireScaleChip();

    // After scroll open, refit design canvas
    setTimeout(function () {
      try {
        global.MainPanelCanvas2D && global.MainPanelCanvas2D.fitScale && global.MainPanelCanvas2D.fitScale();
      } catch (_) {}
    }, 1000);

    document.dispatchEvent(new CustomEvent("grudge:main-panel:2d-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.MainPanel2D = {
    animateContentEnter: animateContentEnter,
    preloadImages: preloadImages,
    wireScaleChip: wireScaleChip,
  };
})(typeof window !== "undefined" ? window : globalThis);
