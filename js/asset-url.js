/**
 * Shared icon/asset URL helper for ObjectStore browse pages.
 * Modeled on js/weapon-skill-tree.js defaultAsset (lines 139–146):
 *   rewrite info/objectstore hosts to the assets CDN (those hosts return HTML
 *   for missing /icons), and prefix root-relative /icons and /game-assets/icons
 *   with https://assets.grudge-studio.com.
 * Also covers /images (profession-trees), favicon.svg / favicon.ico, and
 * encodeURI. Known-missing paths (real 404, or fake 200 HTML) are not given
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
  };

  function encodeAssetUrl(u) {
    try {
      return encodeURI(u);
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
   * Resolve a catalog or page path to a URL that should be fetched.
   * Returns '' for known-missing icons so the caller can show a marker
   * instead of requesting a 404 or a fake-200 HTML body.
   */
  function assetUrl(url) {
    if (!url) return url;
    var u = String(url).trim();
    if (isKnownMissing(u)) return '';
    u = u.replace(/^https?:\/\/(www\.)?(info|objectstore)\.grudge-studio\.com/i, CDN);
    if (/^(?:\.\.\/|\.\/)?favicon\.(svg|ico)$/i.test(u)) {
      return encodeAssetUrl(CDN + '/' + u.replace(/^(?:\.\.\/|\.\/)/, ''));
    }
    if (/^(https?:|data:|blob:)/i.test(u)) return encodeAssetUrl(u);
    if (
      u.startsWith('/icons/') ||
      u.startsWith('/images/') ||
      u.startsWith('/game-assets/icons/') ||
      u.startsWith('/favicon')
    ) {
      return encodeAssetUrl(CDN + u);
    }
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
