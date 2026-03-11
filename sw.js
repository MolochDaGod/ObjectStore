const CACHE_NAME = 'objectstore-v2';
const API_CACHE = 'objectstore-api-v2';
const ASSET_CACHE = 'objectstore-assets-v2';

const PRECACHE_URLS = [
  './',
  './js/nav.js',
  './css/tier-system.css',
  './favicon.svg'
];

const API_ENDPOINTS = [
  './api/v1/weapons.json',
  './api/v1/armor.json',
  './api/v1/materials.json',
  './api/v1/consumables.json',
  './api/v1/skills.json',
  './api/v1/weaponSkills.json',
  './api/v1/enemies.json',
  './api/v1/bosses.json',
  './api/v1/classes.json',
  './api/v1/races.json',
  './api/v1/factions.json',
  './api/v1/attributes.json',
  './api/v1/professions.json',
  './api/v1/sprites.json',
  './api/v1/sprites2d.json',
  './api/v1/effectSprites.json',
  './api/v1/abilityEffects.json',
  './api/v1/factionUnits.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => caches.open(API_CACHE).then(cache => {
        // Best-effort precache API data
        return Promise.allSettled(API_ENDPOINTS.map(url => cache.add(url)));
      }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== API_CACHE && k !== ASSET_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API JSON: stale-while-revalidate
  if (url.pathname.includes('/api/v1/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Sprite/icon assets: cache-first
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // HTML pages: network-first
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Default: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
