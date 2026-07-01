const CACHE_NAME = 'objectstore-v3.2';
const API_CACHE = 'objectstore-api-v3.2';
const ASSET_CACHE = 'objectstore-assets-v3.2';

const PRECACHE_URLS = [
  './',
  './js/nav.js',
  './css/tier-system.css',
  './favicon.svg'
];

const API_ENDPOINTS = [
  // Core game data
  './api/v1/weapons.json',
  './api/v1/armor.json',
  './api/v1/materials.json',
  './api/v1/consumables.json',
  './api/v1/skills.json',
  './api/v1/master-weaponSkills.json',
  './api/v1/enemies.json',
  './api/v1/bosses.json',
  './api/v1/classes.json',
  './api/v1/races.json',
  './api/v1/factions.json',
  './api/v1/master-attributes.json',
  './api/v1/games-library.json',
  './api/v1/weapon-stat-bridge.json',
  './api/v1/professions.json',
  './api/v1/sprites.json',
  './api/v1/sprites2d.json',
  './api/v1/effectSprites.json',
  './api/v1/abilityEffects.json',
  './api/v1/factionUnits.json',
  // v3.0.0 — Game data extraction
  './api/v1/quests.json',
  './api/v1/missions.json',
  './api/v1/skillTrees.json',
  './api/v1/equipment.json',
  './api/v1/enemyTemplates.json',
  './api/v1/worldMap.json',
  './api/v1/dialogue.json',
  './api/v1/cutscenes.json',
  './api/v1/regions.json',
  './api/v1/battleFormations.json',
  './api/v1/randomEvents.json',
  './api/v1/lore.json',
  // v3.0.0 — Asset registries
  './api/v1/audio.json',
  './api/v1/video.json',
  './api/v1/heroes.json',
  './api/v1/models3d.json',
  // v3.0.0 — Additional systems
  './api/v1/ai.json',
  './api/v1/animations.json',
  './api/v1/asset-registry.json',
  './api/v1/controllers.json',
  './api/v1/ecs.json',
  './api/v1/nodeUpgrades.json',
  './api/v1/rendering.json',
  './api/v1/rtsModels.json',
  './api/v1/spriteMaps.json',
  './api/v1/terrain.json',
  './api/v1/tileMaps.json'
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
  // Only handle GET requests; let the browser deal with everything else.
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore non-http(s) requests (chrome-extension://, blob:, data:, etc.)
  if (!event.request.url.startsWith('http')) return;

  // CRITICAL: never intercept cross-origin requests. The Cache API rejects
  // opaque cross-origin responses with a TypeError on cache.put(), which would
  // surface as "Failed to fetch" for every R2/CDN image. Let the browser
  // handle off-origin resources (e.g. assets.grudge-studio.com,
  // objectstore.grudge-studio.com, fonts.gstatic.com) directly.
  if (url.origin !== self.location.origin) return;

  // API JSON: stale-while-revalidate
  if (url.pathname.includes('/api/v1/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone()).catch(() => {});
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Sprite/icon assets: cache-first (same-origin only).
  // Validates Content-Type so a Vercel/Pages SPA-fallback HTML 200 can never
  // be cached as an image and silently break the page.
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            const ct = response.headers.get('content-type') || '';
            const looksImage = ct.startsWith('image/') || ct === '' || /\.svg$/i.test(url.pathname);
            if (response.ok && looksImage) {
              cache.put(event.request, response.clone()).catch(() => {});
            }
            return response;
          }).catch(() => cached || Response.error());
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
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone).catch(() => {}));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Default: cache-first, then network
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => Response.error()))
  );
});

// Allow the page to instruct the SW to skip waiting (used after deploys).
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING' || event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
