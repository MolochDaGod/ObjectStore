/**
 * Shared icon/asset URL helper for ObjectStore browse pages.
 * Modeled on js/weapon-skill-tree.js defaultAsset (lines 139–146):
 *   rewrite info/objectstore hosts to the assets CDN (those hosts return HTML
 *   for missing /icons), and prefix root-relative /icons and /game-assets/icons
 *   with https://assets.grudge-studio.com.
 * Also covers /images (profession-trees), favicon.svg / favicon.ico, and
 * per-segment encodeURIComponent. Known-missing paths (real 404, or fake 200 HTML) are not given
 * stand-in art — callers should use missingIconMarker() so the gap stays visible.
 */
(function (global) {
  var CDN = 'https://assets.grudge-studio.com';

  /**
   * Paths confirmed missing on the CDN by the magic-byte probe (Friday Nov 13, 2026, CT).
   * people.png: HTTP 404, application/json.
   * tool_01.png: HTTP 200, Content-Type image/png, but a 44,964-byte Game Info Hub
   * HTML body (magic 3c21444f4354595045), not a PNG. Alternate CDN paths were also
   * fake-HTML or 404. Do not swap lookalike art (including craftpix-games/people.png).
   */
  var KNOWN_CDN_MISSING = {
    '/icons/ui/buttons/people.png': true,
    '/game-assets/icons/tools/tool_01.png': true,
    '/icons/tools/tool_01.png': true,
    // Gate audit 2026-11-23 (Range 0-15 magic-byte probe, info referer):
    '/icons/weapons/Gun_01.png': true, // 404; hub/index preview tile. No real gun art on the CDN.
    '/icons/pack/weapons/Gun_01.png': true, // HTML impostor (44,089 bytes)
    '/icons/professions/forge.png': true, // HTML impostor; no real forge art anywhere
    '/icons/professions/workbench.png': true, // HTML impostor
    '/icons/entities/horse.png': true, // HTML impostor (horse.PNG is real but is Jonathan's call)
    '/icons/pack/weapons/Scythe_1.png': true, // HTML impostor (Scythe_01 is Jonathan's call)
    '/game-assets/icons/pack/weapons/Scythe_1.png': true, // 404
  };

  /**
   * Sha256-confirmed prefix remaps from Kiln's 2026-11-23 icon audit
   * (item-db-2026-11-21/icon-map.json proposed_key). Broken short-path
   * keys are rewritten to the live game-assets twin. horse.png -> horse.PNG
   * and Scythe_01 / Emberburst art swaps are omitted (Jonathan's pending calls).
   */
  var SHA256_CONFIRMED_REMAPS = {
    '/icons/pack/misc/AquaCore.png': '/game-assets/icons/pack/misc/AquaCore.png',
    '/icons/pack/misc/NatureFlower.png': '/game-assets/icons/pack/misc/NatureFlower.png',
    '/icons/materials/cotton-thread.png': '/game-assets/icons/materials/cotton-thread.png',
    '/icons/materials/divine-ingot.png': '/game-assets/icons/materials/divine-ingot.png',
    '/icons/materials/fine-gem.png': '/game-assets/icons/materials/fine-gem.png',
    '/icons/materials/pristine-gem.png': '/game-assets/icons/materials/pristine-gem.png',
    '/icons/materials/rugged-leather.png': '/game-assets/icons/materials/rugged-leather.png',
    '/icons/materials/standard-gem.png': '/game-assets/icons/materials/standard-gem.png',
    '/icons/materials/thick-hide.png': '/game-assets/icons/materials/thick-hide.png',
    '/icons/pack/weapons/Crossbow_04.png': '/game-assets/icons/pack/weapons/Crossbow_04.png',
  };

  function encodePathSegments(pathname) {
    return String(pathname || '').split('/').map(function (seg) {
      if (!seg) return seg;
      try {
        seg = decodeURIComponent(seg);
      } catch (e) {}
      return encodeURIComponent(seg);
    }).join('/');
  }

  function encodeAssetUrl(u) {
    try {
      var parsed = new URL(u);
      parsed.pathname = encodePathSegments(parsed.pathname);
      return parsed.href;
    } catch (e) {
      return u;
    }
  }

  function normalizePath(url) {
    var u = String(url || '').trim();
    if (!u) return '';
    u = u.replace(/^https?:\/\/(www\.)?(info|objectstore)\.grudge-studio\.com/i, CDN);
    u = u.replace(/^https?:\/\/assets\.grudge-studio\.com/i, '');
    // Preview or same-origin relative: "./favicon.svg", "../favicon.svg", "favicon.ico"
    u = u.replace(/^(?:\.\.\/|\.\/)+/, '/');
    if (u.charAt(0) !== '/' && !/^(https?:|data:|blob:)/i.test(u)) {
      u = '/' + u;
    }
    var q = u.indexOf('?');
    if (q >= 0) u = u.slice(0, q);
    var hash = u.indexOf('#');
    if (hash >= 0) u = u.slice(0, hash);
    return u;
  }

  function isKnownMissing(url) {
    var path = normalizePath(url);
    return !!KNOWN_CDN_MISSING[path];
  }

  /**
   * After the info/objectstore rewrite, the only allowed absolute output is
   * https://assets.grudge-studio.com (exact host, https). Rejected inputs
   * return '' so callers show the existing "icon missing" marker.
   */
  function allowedAssetsUrl(u) {
    try {
      var parsed = new URL(u, CDN);
      if (parsed.origin === 'https://assets.grudge-studio.com' && !parsed.username && !parsed.password) {
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  /**
   * Resolve a catalog or page path to a URL that should be fetched.
   * Returns '' for known-missing icons so the caller can show a marker
   * instead of requesting a 404 or a fake-200 HTML body.
   */
  function applyConfirmedRemap(url) {
    var path = normalizePath(url);
    return SHA256_CONFIRMED_REMAPS[path] || url;
  }

  function assetUrl(url) {
    if (!url) return url;
    var u = String(url).trim();
    if (isKnownMissing(u)) return '';
    u = applyConfirmedRemap(u);
    u = u.replace(/^https?:\/\/(www\.)?(info|objectstore)\.grudge-studio\.com/i, CDN);
    // Protocol-relative and backslash host tricks (e.g. //evil, /\\evil).
    if (u.indexOf('\\') !== -1 || (u.charAt(0) === '/' && u.charAt(1) === '/')) return '';
    var mapped = false;
    if (/^(?:\.\.\/|\.\/)?favicon\.(svg|ico)$/i.test(u)) {
      u = CDN + '/' + u.replace(/^(?:\.\.\/|\.\/)/, '');
      mapped = true;
    } else if (
      u.startsWith('/icons/') ||
      u.startsWith('/images/') ||
      u.startsWith('/game-assets/icons/') ||
      u.startsWith('/favicon')
    ) {
      u = CDN + u;
      mapped = true;
    }
    var parsed = allowedAssetsUrl(u);
    if (!parsed) return '';
    var wasAbsolute = false;
    try {
      new URL(u);
      wasAbsolute = true;
    } catch (e) {}
    if (mapped || wasAbsolute) return encodeAssetUrl(parsed.href);
    // Safe relative path that this helper does not map onto the CDN.
    return u;
  }

  function missingIconMarker(label) {
    var text = 'icon missing';
    return (
      '<span class="icon-missing" title="icon missing" role="img" aria-label="icon missing">' +
      text +
      '</span>'
    );
  }

  /**
   * <img> for a resolved asset, or a visible "icon missing" marker.
   * onerror also marks missing — never substitutes another image.
   */
  function iconImgHtml(url, attrs) {
    attrs = attrs || {};
    var width = attrs.width != null ? String(attrs.width) : '';
    var height = attrs.height != null ? String(attrs.height) : '';
    var cls = attrs.className || attrs['class'] || '';
    var alt = attrs.alt != null ? String(attrs.alt) : '';
    if (!url || isKnownMissing(url)) {
      return missingIconMarker(alt);
    }
    var src = assetUrl(url);
    if (!src) return missingIconMarker(alt);
    var dim = (width ? ' width="' + width + '"' : '') + (height ? ' height="' + height + '"' : '');
    var klass = cls ? ' class="' + cls + '"' : '';
    // No inner double-quotes in the onerror handler (it sits in an onerror="..." attribute).
    var onerr =
      "this.outerHTML='<span class=icon-missing title=icon-missing role=img aria-label=icon-missing>icon missing</span>';";
    return (
      '<img src="' +
      src.replace(/"/g, '&quot;') +
      '" alt="' +
      String(alt).replace(/"/g, '&quot;') +
      '"' +
      dim +
      klass +
      ' onerror="' +
      onerr +
      '">'
    );
  }

  global.GrudgeAsset = {
    CDN: CDN,
    assetUrl: assetUrl,
    isKnownMissing: isKnownMissing,
    missingIconMarker: missingIconMarker,
    iconImgHtml: iconImgHtml,
  };
})(typeof window !== 'undefined' ? window : this);
