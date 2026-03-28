const CACHE_NAME = "woertl-v1";

// Known static assets to pre-cache on install
const PRECACHE_URLS = [
  "/woertl/",
  "/woertl/manifest.json",
  "/woertl/fonts/comic-neue-regular.woff2",
  "/woertl/fonts/comic-neue-bold.woff2",
  "/woertl/icons/icon-192.png",
  "/woertl/icons/icon-512.png",
  "/woertl/icons/icon-maskable-192.png",
  "/woertl/icons/icon-maskable-512.png",
];

// Install: pre-cache known static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin requests, network-first for navigation
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests: network-first, fall back to cached root HTML
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() =>
          caches.match("/woertl/").then(
            (cached) =>
              cached ||
              new Response("Offline – bitte später erneut versuchen.", {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              })
          )
        )
    );
    return;
  }

  // All other same-origin requests: cache-first, then network with cache update
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      });
    })
  );
});
