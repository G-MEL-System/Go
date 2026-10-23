const CACHE_NAME = 'g-mel-cache-v1';

// List all the core files your app needs to work offline
const urlsToCache = [
  '/Go/',
  '/Go/index.html',
  '/Go/manifest.json',
  // Add your CSS, JS, and local icon files here:
  // '/Go/css/style.css',
  // '/Go/js/app.js',
  // '/Go/icons/app-icon-192.png'
];

// 1. Install Event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened G-MEL cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches when you update the app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Serve from cache first, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise, fetch from network
        return fetch(event.request).catch(() => {
          // If both cache and network fail (offline), fallback to index.html for page navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/Go/');
          }
        });
      })
  );
});
