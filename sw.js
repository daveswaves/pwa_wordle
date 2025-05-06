// sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

/* 
const CACHE_NAME = 'wordle-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index.js',
  '/style.css',
  '/wordle_words.js',
  '/image/icon-192.png',
  '/image/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only serve from cache for the listed files
  const url = new URL(event.request.url);
  const isCachedFile = FILES_TO_CACHE.includes(url.pathname);

  if (isCachedFile) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || new Response('File not found in cache', { status: 404 });
      })
    );
  } else {
    // Fallback for other requests (can be removed if not needed)
    event.respondWith(fetch(event.request));
  }
});
*/