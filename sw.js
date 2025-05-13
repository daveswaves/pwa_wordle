// sw.js
const VERSION = 1747069854;
const CACHE_NAME = `wordle-cache-v${VERSION}`;

const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, "");

const FILES_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/app.js`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/words.js`,
  `${BASE_PATH}/image/icon-192.png`,
  `${BASE_PATH}/image/icon-512.png`,
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(FILES_TO_CACHE);
      self.skipWaiting(); // Ensures immediate activation
    })(),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      );
      await clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);
  const isCachedFile = request.method === "GET" && FILES_TO_CACHE.includes(url.pathname);

  if (isCachedFile) {
    e.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).catch(() =>
          new Response("File not found in cache or network", { status: 404 })
        );
      })
    );
  }
});
