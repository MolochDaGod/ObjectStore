/**
 * Main Panel i18n — language packages for info.grudge-studio.com/main-panel.html
 *
 * Loads api/v1/main-panel-locales.json (bundled package).
 * Persist: localStorage grudge.main-panel.locale
 * URL: ?lang=es | ?locale=fr
 *
 * Usage:
 *   await MainPanelI18n.load();
 *   MainPanelI18n.t('tabs.Equipment');
 *   MainPanelI18n.applyDom();
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "grudge.main-panel.locale";
  var pack = null;
  var locale = "en";
  var ready = null;

  var FALLBACK_URLS = [
    "./api/v1/main-panel-locales.json",
    "/api/v1/main-panel-locales.json",
    "https://info.grudge-studio.com/api/v1/main-panel-locales.json",
    "https://objectstore.grudge-studio.com/api/v1/main-panel-locales.json",
  ];

  function detect() {
    try {
      var q = new URLSearchParams(location.search);
      var fromQ = q.get("lang") || q.get("locale");
      if (fromQ) return String(fromQ).toLowerCase().slice(0, 8);
    } catch (_) {}
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    } catch (_) {}
    var nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("es")) return "es";
    if (nav.startsWith("fr")) return "fr";
    if (nav.startsWith("de")) return "de";
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("ja")) return "ja";
    return "en";
  }

  function dig(obj, path) {
    var parts = String(path || "").split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function t(key, vars) {
    var locs = pack && pack.locales;
    var primary = locs && locs[locale];
    var en = locs && locs.en;
    var val = dig(primary, key);
    if (val == null) val = dig(en, key);
    if (val == null) val = key;
    if (vars && typeof val === "string") {
      Object.keys(vars).forEach(function (k) {
        val = val.replace(new RegExp("\\{" + k + "\\}", "g"), String(vars[k]));
      });
    }
    return val;
  }

  function tabLabel(tabKey) {
    return t("tabs." + tabKey) || tabKey;
  }

  function listLocales() {
    if (!pack || !pack.locales) return [{ id: "en", native: "English" }];
    return Object.keys(pack.locales).map(function (id) {
      var m = pack.locales[id].meta || {};
      return { id: id, name: m.name || id, native: m.native || id, dir: m.dir || "ltr" };
    });
  }

  function setLocale(next) {
    var id = String(next || "en").toLowerCase();
    if (pack && pack.locales && !pack.locales[id]) id = pack.defaultLocale || "en";
    locale = id;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch (_) {}
    document.documentElement.lang = locale;
    var dir =
      (pack &&
        pack.locales &&
        pack.locales[locale] &&
        pack.locales[locale].meta &&
        pack.locales[locale].meta.dir) ||
      "ltr";
    document.documentElement.dir = dir;
    applyDom();
    try {
      document.dispatchEvent(
        new CustomEvent("grudge:main-panel:locale", { detail: { locale: locale } }),
      );
    } catch (_) {}
    return locale;
  }

  function applyDom() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var text = t(key);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.hasAttribute("data-i18n-placeholder")) el.placeholder = text;
        else el.value = text;
      } else {
        el.textContent = text;
      }
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.title = t(el.getAttribute("data-i18n-title"));
    });
    document.querySelectorAll(".tab-btn[data-tab]").forEach(function (btn) {
      var key = btn.getAttribute("data-tab");
      btn.textContent = tabLabel(key);
    });
    var title = t("app.title");
    if (title && title !== "app.title") document.title = title;
  }

  function fillSelect(sel) {
    if (!sel) return;
    var list = listLocales();
    sel.innerHTML = list
      .map(function (L) {
        return (
          '<option value="' +
          L.id +
          '"' +
          (L.id === locale ? " selected" : "") +
          ">" +
          (L.native || L.id) +
          "</option>"
        );
      })
      .join("");
  }

  async function load() {
    if (ready) return ready;
    ready = (async function () {
      var lastErr = null;
      for (var i = 0; i < FALLBACK_URLS.length; i++) {
        try {
          var res = await fetch(FALLBACK_URLS[i], { credentials: "omit" });
          if (!res.ok) continue;
          var ct = res.headers.get("content-type") || "";
          if (ct.indexOf("json") === -1 && ct.indexOf("text") === -1) {
            // still try parse
          }
          pack = await res.json();
          if (pack && pack.locales) break;
        } catch (e) {
          lastErr = e;
        }
      }
      if (!pack || !pack.locales) {
        console.warn("[MainPanelI18n] locales pack missing", lastErr);
        pack = {
          defaultLocale: "en",
          locales: {
            en: {
              meta: { name: "English", native: "English" },
              app: { brand: "Grudge Warlords", inventory: "Inventory", gold: "Gold", language: "Lang" },
              tabs: {},
              ui: {},
            },
          },
        };
      }
      setLocale(detect());
      return { locale: locale, count: Object.keys(pack.locales).length };
    })();
    return ready;
  }

  global.MainPanelI18n = {
    load: load,
    t: t,
    tabLabel: tabLabel,
    setLocale: setLocale,
    getLocale: function () {
      return locale;
    },
    listLocales: listLocales,
    applyDom: applyDom,
    fillSelect: fillSelect,
  };
})(typeof window !== "undefined" ? window : globalThis);
