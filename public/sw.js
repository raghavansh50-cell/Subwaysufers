const CACHE_NAME = 'subway-surfers-3d-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-512.jpg'
];

// Install Event - cache initial core shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use map with catch to prevent install failure if a single asset has an issue
      return Promise.all(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn('Initial cache failed for:', asset, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up legacy caches and immediately take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // 1. Navigation requests (e.g. page refresh, going to subpaths): fallback to root index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;
        // If exact URL matches failed, try matching root paths relative to scope
        return caches.match('./').then((rootResponse) => {
          if (rootResponse) return rootResponse;
          return caches.match('index.html').then((indexResponse) => {
            if (indexResponse) return indexResponse;
            // Fallback to network
            return fetch(event.request);
          });
        });
      }).catch(() => {
        return caches.match('index.html').then((indexResponse) => {
          return indexResponse || fetch(event.request);
        });
      })
    );
    return;
  }

  // 2. Cache external fonts
  if (url.origin !== self.location.origin) {
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            }).catch(() => {
              // Font fetch failed offline, fail gracefully without breaking
              return null;
            });
          });
        })
      );
    }
    return;
  }

  // 3. Local assets (JS, CSS, images, etc.) using Cache-First strategy for instant offline playback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate: Fetch fresh in background to update cache for next load when online
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => { /* Ignore offline fetch errors */ });
        
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch((err) => {
        // Silent error for failed assets when offline, avoiding returning broken text responses
        console.warn('Asset fetch failed offline:', event.request.url);
      });
    })
  );
});
