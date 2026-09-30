// TerraShift Service Worker (PWA Offline Caching)
const CACHE_NAME = 'terrashift-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Runtime Cache for OpenStreetMap tiles (PRD Section 10: "runtime cache for map tiles already viewed")
  if (url.origin.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open('terrashift-map-tiles').then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // Return empty tile or ignore if offline
            return new Response('', { status: 408 });
          });
        });
      })
    );
    return;
  }

  // App shell and API stale-while-revalidate / cache-fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache successful responses for GET requests
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Offline: return cached response if present
        if (cachedResponse) return cachedResponse;
        throw err;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
