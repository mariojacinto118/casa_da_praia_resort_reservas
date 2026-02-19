
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('casadapraia-store').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/index.css',
      '/index.tsx',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
