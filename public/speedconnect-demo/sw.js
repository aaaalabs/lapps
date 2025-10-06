const CACHE_NAME = 'speedconnect-demo-v1';
const ASSETS = [
  '/speedconnect-demo/',
  '/demo/SpeedConnect/icon-512.png',
  '/demo/SpeedConnect/splash-512.png'
];

// Install - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch((err) => console.warn('Cache install failed:', err))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
  // API calls always go to network
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - API nicht verfügbar' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // For other resources: network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and update cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // No cache available
          return new Response('Offline - Ressource nicht verfügbar', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
