/**
 * sw-kill.js — One-shot service worker kill-switch.
 *
 * Drop-in: load this from any page that previously registered a service
 * worker at a different scope/path. It unregisters every active worker on
 * the current origin and purges every Cache Storage bucket, then yields.
 *
 * The current ObjectStore SW (sw.js, v3.2+) is safe and does NOT need to be
 * killed — but legacy clients that registered an older sw.js (which trapped
 * cross-origin opaque responses) can call this to recover instantly.
 *
 * Usage:
 *   <script src="./sw-kill.js"></script>
 *   <!-- or, after the kill, register the new SW -->
 *   <script src="./js/nav.js" defer></script>
 *
 * Idempotent: writes a localStorage flag after running so it doesn't loop.
 */
(function () {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  var FLAG = 'grudge-sw-killed-v1';
  if (localStorage.getItem(FLAG)) return;

  Promise.all([
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all(regs.map(function (r) { return r.unregister().catch(function () {}); }));
    }),
    (typeof caches !== 'undefined') ? caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k).catch(function () {}); }));
    }) : Promise.resolve(),
  ]).then(function () {
    try { localStorage.setItem(FLAG, String(Date.now())); } catch (e) {}
    // Don't auto-reload; the next page load will register the new SW cleanly.
  }).catch(function () { /* swallow */ });
})();
